const mongoose = require("mongoose");

const APPROVAL_STATUS = ["Chờ duyệt", "Đã duyệt", "Từ chối"];

const SALE_STATUS = [
  "Chưa mở bán",
  "Sẵn sàng bán",
  "Chờ thanh toán",
  "Đã đặt cọc",
  "Đang giao",
  "Đã bán",
  "Ngừng bán",
];

const dogSchema = new mongoose.Schema(
  {
    maCho: {
      type: String,
      required: [true, "Mã chó là bắt buộc"],
      unique: true,
      trim: true,
    },

    name: {
      type: String,
      required: [true, "Tên chó là bắt buộc"],
      trim: true,
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
    },

    suggestedPrice: {
      type: Number,
      min: [0, "Giá đề xuất không được âm"],
      default: 0,
    },

    price: {
      type: Number,
      required: [true, "Giá bán chính thức là bắt buộc"],
      min: [1, "Giá bán chính thức phải lớn hơn 0"],
    },

    depositAmount: {
      type: Number,
      default: 0,
      min: [0, "Tiền đặt cọc không được âm"],
      validate: {
        validator: function (value) {
          return value <= this.price;
        },
        message: "Tiền đặt cọc không được lớn hơn giá bán",
      },
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    image: {
      type: String,
      required: [true, "Ảnh đại diện là bắt buộc"],
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

    weight: {
      type: Number,
      min: [0, "Cân nặng không được âm"],
      default: null,
    },

    healthStatus: {
      type: String,
      trim: true,
      default: "Tốt",
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
    },

    eligibleForSale: {
      type: Boolean,
      default: false,
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
    },
  },
  {
    timestamps: true,
  }
);

dogSchema.index({ maCho: 1 }, { unique: true });
dogSchema.index({ farmId: 1, breedId: 1 });
dogSchema.index({ approvalStatus: 1, saleStatus: 1, isPublished: 1 });

dogSchema.pre("validate", function (next) {
  if (this.rejectionReason && this.approvalStatus !== "Từ chối") {
    return next(
      new Error("Chỉ được nhập lý do từ chối khi trạng thái duyệt là 'Từ chối'")
    );
  }

  if (this.approvalStatus === "Từ chối" && !this.rejectionReason) {
    return next(new Error("Phải nhập lý do từ chối khi chó bị từ chối"));
  }

  if (this.approvalStatus !== "Từ chối") {
    this.rejectionReason = "";
  }

  if (this.isPublished && this.approvalStatus !== "Đã duyệt") {
    return next(new Error("Chỉ chó đã duyệt mới được hiển thị trên website"));
  }

  if (this.isPublished && !this.sourceVerified) {
    return next(new Error("Chó chưa xác minh nguồn gốc thì không được hiển thị"));
  }

  if (this.isPublished && !this.eligibleForSale) {
    return next(new Error("Chó chưa đủ điều kiện bán thì không được hiển thị"));
  }

  if (
    ["Sẵn sàng bán", "Chờ thanh toán", "Đã đặt cọc", "Đang giao", "Đã bán"].includes(this.saleStatus) &&
    this.approvalStatus !== "Đã duyệt"
  ) {
    return next(new Error("Chó chưa được duyệt thì không được chuyển sang trạng thái bán"));
  }

  if (
    ["Sẵn sàng bán", "Chờ thanh toán", "Đã đặt cọc", "Đang giao", "Đã bán"].includes(this.saleStatus) &&
    !this.sourceVerified
  ) {
    return next(new Error("Chó chưa xác minh nguồn gốc thì không được chuyển sang trạng thái bán"));
  }

  if (
    ["Sẵn sàng bán", "Chờ thanh toán", "Đã đặt cọc", "Đang giao", "Đã bán"].includes(this.saleStatus) &&
    !this.eligibleForSale
  ) {
    return next(new Error("Chó chưa đủ điều kiện bán thì không được chuyển sang trạng thái bán"));
  }

  if (this.approvalStatus === "Từ chối") {
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

  if (["Sẵn sàng bán", "Chờ thanh toán", "Đã đặt cọc", "Đang giao", "Đã bán"].includes(this.saleStatus)) {
    this.isPublished = true;
  }

  next();
});

dogSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

module.exports = mongoose.model("Dog", dogSchema);