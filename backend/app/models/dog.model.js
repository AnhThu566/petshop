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

const vaccineItemSchema = new mongoose.Schema(
  {
    vaccineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vaccine",
      default: null,
    },
    vaccineName: {
      type: String,
      trim: true,
      default: "",
      maxlength: [150, "Tên vaccine không được vượt quá 150 ký tự"],
    },
    dateInjected: {
      type: Date,
      default: null,
      validate: {
        validator: function (value) {
          return !value || value <= new Date();
        },
        message: "Ngày tiêm vaccine không được ở tương lai",
      },
    },
  },
  { _id: false }
);

const dogSchema = new mongoose.Schema(
  {
    // Mã nhận diện tại trại - do trang trại nhập
    farmDogCode: {
      type: String,
      required: [true, "Mã nhận diện tại trại là bắt buộc"],
      trim: true,
      uppercase: true,
      maxlength: [50, "Mã nhận diện tại trại không được vượt quá 50 ký tự"],
    },

    // Mã chó hệ thống - do admin/hệ thống cấp
    systemDogCode: {
      type: String,
      default: null,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true,
      maxlength: [50, "Mã chó hệ thống không được vượt quá 50 ký tự"],
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

    coatColor: {
      type: String,
      required: [true, "Màu lông là bắt buộc"],
      trim: true,
      maxlength: [100, "Màu lông không được vượt quá 100 ký tự"],
    },

    weight: {
      type: Number,
      required: [true, "Cân nặng là bắt buộc"],
      min: [0, "Cân nặng không được âm"],
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

    birthPlace: {
      type: String,
      required: [true, "Nơi sinh ra là bắt buộc"],
      trim: true,
      maxlength: [255, "Nơi sinh ra không được vượt quá 255 ký tự"],
    },

    fatherName: {
      type: String,
      default: "",
      trim: true,
      maxlength: [100, "Tên chó bố không được vượt quá 100 ký tự"],
    },

    motherName: {
      type: String,
      default: "",
      trim: true,
      maxlength: [100, "Tên chó mẹ không được vượt quá 100 ký tự"],
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: [3000, "Mô tả chó không được vượt quá 3000 ký tự"],
    },

    healthStatus: {
      type: String,
      required: [true, "Tình trạng sức khỏe là bắt buộc"],
      trim: true,
      maxlength: [500, "Tình trạng sức khỏe không được vượt quá 500 ký tự"],
    },

    vaccines: {
      type: [vaccineItemSchema],
      default: [],
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

    // Giá do trang trại đề xuất
    proposedPrice: {
      type: Number,
      required: [true, "Giá đề xuất là bắt buộc"],
      min: [1, "Giá đề xuất phải lớn hơn 0"],
    },

    // Giá cuối cùng do admin chốt
    finalPrice: {
      type: Number,
      default: null,
      min: [1, "Giá bán cuối cùng phải lớn hơn 0"],
    },

    depositAmount: {
      type: Number,
      default: null,
      min: [0, "Tiền cọc không được âm"],
      validate: {
        validator: function (value) {
          return value == null || this.finalPrice == null || Number(value) <= Number(this.finalPrice);
        },
        message: "Tiền cọc không được lớn hơn giá bán cuối cùng",
      },
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

dogSchema.index({ farmId: 1, farmDogCode: 1 }, { unique: true });
dogSchema.index({ farmId: 1, breedId: 1 });
dogSchema.index({ approvalStatus: 1, saleStatus: 1, isPublished: 1 });
dogSchema.index({ farmId: 1, approvalStatus: 1, saleStatus: 1 });
dogSchema.index({ breedId: 1, approvalStatus: 1, saleStatus: 1 });

dogSchema.pre("validate", function () {
  if (typeof this.farmDogCode === "string") {
    this.farmDogCode = this.farmDogCode.trim().toUpperCase();
  }

  if (typeof this.systemDogCode === "string" && this.systemDogCode) {
    this.systemDogCode = this.systemDogCode.trim().toUpperCase();
  }

  if (typeof this.name === "string") this.name = this.name.trim();
  if (typeof this.coatColor === "string") this.coatColor = this.coatColor.trim();
  if (typeof this.birthPlace === "string") this.birthPlace = this.birthPlace.trim();
  if (typeof this.fatherName === "string") this.fatherName = this.fatherName.trim();
  if (typeof this.motherName === "string") this.motherName = this.motherName.trim();
  if (typeof this.description === "string") this.description = this.description.trim();
  if (typeof this.healthStatus === "string") this.healthStatus = this.healthStatus.trim();
  if (typeof this.rejectionReason === "string") this.rejectionReason = this.rejectionReason.trim();

  if (!this.farmDogCode) {
    throw new Error("Mã nhận diện tại trại là bắt buộc");
  }

  if (!this.name) {
    throw new Error("Tên chó là bắt buộc");
  }

  if (!this.coatColor) {
    throw new Error("Màu lông là bắt buộc");
  }

  if (!this.birthPlace) {
    throw new Error("Nơi sinh ra là bắt buộc");
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

  if (this.weight != null && this.weight < 0) {
    throw new Error("Cân nặng không được âm");
  }

  if (this.proposedPrice != null && this.proposedPrice < 1) {
    throw new Error("Giá đề xuất phải lớn hơn 0");
  }

  if (this.finalPrice != null && this.finalPrice < 1) {
    throw new Error("Giá bán cuối cùng phải lớn hơn 0");
  }

  if (this.depositAmount != null) {
    if (this.depositAmount < 0) {
      throw new Error("Tiền cọc không được âm");
    }

    if (this.finalPrice != null && Number(this.depositAmount) > Number(this.finalPrice)) {
      throw new Error("Tiền cọc không được lớn hơn giá bán cuối cùng");
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

  if (ACTIVE_PUBLIC_SALE_STATUSES.includes(this.saleStatus) && this.approvalStatus !== "Đã duyệt") {
    throw new Error("Chó chưa được duyệt thì không được chuyển sang trạng thái bán");
  }

  if (ACTIVE_PUBLIC_SALE_STATUSES.includes(this.saleStatus) && !this.finalPrice) {
    throw new Error("Phải có giá bán cuối cùng trước khi mở bán");
  }

  if (this.approvalStatus === "Từ chối") {
    this.isPublished = false;
    this.saleStatus = "Chưa mở bán";
    this.finalPrice = null;
  }

  if (this.approvalStatus === "Cần bổ sung") {
    this.isPublished = false;
    this.saleStatus = "Chưa mở bán";
  }

  if (this.approvalStatus === "Chờ duyệt") {
    this.isPublished = false;
    this.saleStatus = "Chưa mở bán";
    this.finalPrice = null;
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

  if (Array.isArray(this.vaccines)) {
    this.vaccines = this.vaccines
      .map((item) => ({
        vaccineId: item?.vaccineId || null,
        vaccineName: String(item?.vaccineName || "").trim(),
        dateInjected: item?.dateInjected || null,
      }))
      .filter((item) => item.vaccineId || item.vaccineName || item.dateInjected);

    for (const vaccine of this.vaccines) {
      if (!vaccine.vaccineId && !vaccine.vaccineName) {
        throw new Error("Mỗi vaccine phải có tên vaccine hoặc vaccineId");
      }

      if (vaccine.dateInjected && vaccine.dateInjected > new Date()) {
        throw new Error("Ngày tiêm vaccine không được ở tương lai");
      }

      if (vaccine.dateInjected && this.birthDate && vaccine.dateInjected < this.birthDate) {
        throw new Error("Ngày tiêm vaccine không được nhỏ hơn ngày sinh");
      }
    }
  } else {
    this.vaccines = [];
  }
});

dogSchema.virtual("ageInMonths").get(function () {
  if (!this.birthDate) return null;

  const now = new Date();
  const birth = new Date(this.birthDate);

  let months =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    (now.getMonth() - birth.getMonth());

  if (now.getDate() < birth.getDate()) {
    months -= 1;
  }

  return months >= 0 ? months : 0;
});

dogSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject({ virtuals: true });
  object.id = _id;
  return object;
});

module.exports = mongoose.model("Dog", dogSchema);