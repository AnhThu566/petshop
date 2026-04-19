const mongoose = require("mongoose");

const APPROVAL_STATUS = ["Chờ duyệt", "Cần bổ sung", "Đã duyệt", "Từ chối"];

const SALE_STATUS = [
  "Chưa mở bán",
  "Sẵn sàng bán",
  "Chờ thanh toán",
  "Đã đặt cọc",
  "Đang giao",
  "Đã bán",
  "Ngừng bán",
];

const ACTIVE_PUBLIC_SALE_STATUSES = [
  "Sẵn sàng bán",
  "Chờ thanh toán",
  "Đã đặt cọc",
  "Đang giao",
  "Đã bán",
];

const dogSchema = new mongoose.Schema(
  {
    maCho: {
      type: String,
      required: [true, "Mã chó là bắt buộc"],
      unique: true,
      trim: true,
      uppercase: true,
    },

    name: {
      type: String,
      required: [true, "Tên chó là bắt buộc"],
      trim: true,
      maxlength: [100, "Tên chó không được vượt quá 100 ký tự"],
    },

    farmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farm",
      required: [true, "Trang trại cung cấp là bắt buộc"],
      index: true,
    },

    breedId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Breed",
      required: [true, "Giống chó là bắt buộc"],
      index: true,
    },

    gender: {
      type: String,
      enum: {
        values: ["Đực", "Cái"],
        message: "Giới tính chỉ được là Đực hoặc Cái",
      },
      required: [true, "Giới tính là bắt buộc"],
      trim: true,
    },

    price: {
      type: Number,
      required: [true, "Giá bán là bắt buộc"],
      min: [1, "Giá bán phải lớn hơn 0"],
    },

    proposedPrice: {
      type: Number,
      default: null,
      min: [0, "Giá đề xuất không hợp lệ"],
    },

    depositAmount: {
      type: Number,
      default: null,
      min: [0, "Tiền cọc không được âm"],
      validate: {
        validator: function (value) {
          return value == null || this.price == null || Number(value) <= Number(this.price);
        },
        message: "Tiền cọc không được lớn hơn giá bán",
      },
    },

    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [3000, "Mô tả không được vượt quá 3000 ký tự"],
    },

    sourceNotes: {
      type: String,
      trim: true,
      default: "",
      maxlength: [2000, "Thông tin nguồn gốc không được vượt quá 2000 ký tự"],
    },

    healthNote: {
      type: String,
      trim: true,
      default: "",
      maxlength: [2000, "Ghi chú sức khỏe không được vượt quá 2000 ký tự"],
    },

    image: {
      type: String,
      required: [true, "Ảnh đại diện là bắt buộc"],
      trim: true,
    },

    images: {
      type: [String],
      default: [],
    },

    birthDate: {
      type: Date,
      required: [true, "Ngày sinh là bắt buộc"],
      validate: {
        validator: function (value) {
          return value <= new Date();
        },
        message: "Ngày sinh không được ở tương lai",
      },
    },

    weight: {
      type: Number,
      min: [0, "Cân nặng không được âm"],
      default: null,
    },

    healthStatus: {
      type: String,
      trim: true,
      default: "Tốt",
      maxlength: [500, "Tình trạng sức khỏe không được vượt quá 500 ký tự"],
    },

    vaccinated: {
      type: Boolean,
      default: false,
    },

    lastDeworming: {
      type: Date,
      default: null,
      validate: {
        validator: function (value) {
          return !value || value <= new Date();
        },
        message: "Ngày tẩy giun gần nhất không được ở tương lai",
      },
    },

    sourceVerified: {
      type: Boolean,
      default: false,
      index: true,
    },

    approvalStatus: {
      type: String,
      enum: {
        values: APPROVAL_STATUS,
        message: "Trạng thái duyệt không hợp lệ",
      },
      default: "Chờ duyệt",
      index: true,
    },

    saleStatus: {
      type: String,
      enum: {
        values: SALE_STATUS,
        message: "Trạng thái bán không hợp lệ",
      },
      default: "Chưa mở bán",
      index: true,
    },

    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },

    rejectionReason: {
      type: String,
      trim: true,
      default: "",
      maxlength: [1000, "Nội dung phản hồi không được vượt quá 1000 ký tự"],
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

dogSchema.index({ farmId: 1, breedId: 1 });
dogSchema.index({ approvalStatus: 1, saleStatus: 1, isPublished: 1 });
dogSchema.index({ farmId: 1, approvalStatus: 1, saleStatus: 1 });
dogSchema.index({ breedId: 1, approvalStatus: 1, saleStatus: 1 });

dogSchema.pre("validate", function () {
  if (typeof this.name === "string") this.name = this.name.trim();
  if (typeof this.description === "string") this.description = this.description.trim();
  if (typeof this.healthStatus === "string") this.healthStatus = this.healthStatus.trim();
  if (typeof this.rejectionReason === "string") this.rejectionReason = this.rejectionReason.trim();
  if (typeof this.sourceNotes === "string") this.sourceNotes = this.sourceNotes.trim();
  if (typeof this.healthNote === "string") this.healthNote = this.healthNote.trim();

  if (!this.name) {
    throw new Error("Tên chó là bắt buộc");
  }

  if (this.birthDate && this.birthDate > new Date()) {
    throw new Error("Ngày sinh không được ở tương lai");
  }

  if (this.lastDeworming && this.lastDeworming > new Date()) {
    throw new Error("Ngày tẩy giun gần nhất không được ở tương lai");
  }

  if (this.lastDeworming && this.birthDate && this.lastDeworming < this.birthDate) {
    throw new Error("Ngày tẩy giun không được nhỏ hơn ngày sinh");
  }

  if (this.proposedPrice !== null && this.proposedPrice !== undefined && this.proposedPrice < 0) {
    throw new Error("Giá đề xuất không hợp lệ");
  }

  if (this.depositAmount !== null && this.depositAmount !== undefined) {
    if (this.depositAmount < 0) {
      throw new Error("Tiền cọc không được âm");
    }

    if (this.price !== null && this.price !== undefined && Number(this.depositAmount) > Number(this.price)) {
      throw new Error("Tiền cọc không được lớn hơn giá bán");
    }
  }

  if (this.rejectionReason && !["Cần bổ sung", "Từ chối"].includes(this.approvalStatus)) {
    throw new Error(
      "Chỉ được nhập nội dung phản hồi khi trạng thái duyệt là 'Cần bổ sung' hoặc 'Từ chối'"
    );
  }

  if (["Cần bổ sung", "Từ chối"].includes(this.approvalStatus) && !this.rejectionReason) {
    throw new Error("Phải nhập nội dung phản hồi cho trạng thái hiện tại");
  }

  if (["Chờ duyệt", "Đã duyệt"].includes(this.approvalStatus)) {
    this.rejectionReason = "";
  }

  if (this.isPublished && this.approvalStatus !== "Đã duyệt") {
    throw new Error("Chỉ chó đã duyệt mới được hiển thị trên website");
  }

  if (
    ACTIVE_PUBLIC_SALE_STATUSES.includes(this.saleStatus) &&
    this.approvalStatus !== "Đã duyệt"
  ) {
    throw new Error("Chó chưa được duyệt thì không được chuyển sang trạng thái bán");
  }

  if (this.approvalStatus === "Từ chối") {
    this.isPublished = false;
    this.saleStatus = "Chưa mở bán";
  }

  if (this.approvalStatus === "Cần bổ sung") {
    this.isPublished = false;
    this.saleStatus = "Chưa mở bán";
  }

  if (this.approvalStatus === "Chờ duyệt") {
    this.isPublished = false;
    this.saleStatus = "Chưa mở bán";
  }

  if (["Chưa mở bán", "Ngừng bán"].includes(this.saleStatus)) {
    this.isPublished = false;
  }

  if (ACTIVE_PUBLIC_SALE_STATUSES.includes(this.saleStatus)) {
    this.isPublished = true;
  }

  if (Array.isArray(this.images)) {
    this.images = this.images
      .filter((item) => typeof item === "string" && item.trim())
      .map((item) => item.trim());
  } else {
    this.images = [];
  }
});

dogSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

module.exports = mongoose.model("Dog", dogSchema);