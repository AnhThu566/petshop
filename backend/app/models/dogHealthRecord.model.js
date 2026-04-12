const mongoose = require("mongoose");

const CHECK_RESULT = ["Đủ điều kiện bán", "Chưa đủ điều kiện bán", "Cần theo dõi thêm"];

const vaccineRecordSchema = new mongoose.Schema(
  {
    vaccineName: {
      type: String,
      trim: true,
      required: [true, "Tên vaccine là bắt buộc"],
    },

    dateInjected: {
      type: Date,
      required: [true, "Ngày tiêm là bắt buộc"],
      validate: {
        validator: function (value) {
          return value <= new Date();
        },
        message: "Ngày tiêm không được ở tương lai",
      },
    },

    note: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: false }
);

const dogHealthRecordSchema = new mongoose.Schema(
  {
    dogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dog",
      required: [true, "Mã chó là bắt buộc"],
      index: true,
    },

    farmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farm",
      required: [true, "Trang trại cung cấp là bắt buộc"],
      index: true,
    },

    checkedBy: {
      type: String,
      trim: true,
      default: "",
    },

    checkedAt: {
      type: Date,
      required: [true, "Ngày kiểm tra sức khỏe là bắt buộc"],
      default: Date.now,
      validate: {
        validator: function (value) {
          return value <= new Date();
        },
        message: "Ngày kiểm tra không được ở tương lai",
      },
    },

    weight: {
      type: Number,
      min: [0, "Cân nặng không được âm"],
      default: null,
    },

    bodyTemperature: {
      type: Number,
      min: [0, "Nhiệt độ không hợp lệ"],
      default: null,
    },

    generalCondition: {
      type: String,
      trim: true,
      default: "",
    },

    appetiteStatus: {
      type: String,
      trim: true,
      default: "",
    },

    digestiveStatus: {
      type: String,
      trim: true,
      default: "",
    },

    respiratoryStatus: {
      type: String,
      trim: true,
      default: "",
    },

    skinCondition: {
      type: String,
      trim: true,
      default: "",
    },

    mobilityStatus: {
      type: String,
      trim: true,
      default: "",
    },

    dewormed: {
      type: Boolean,
      default: false,
    },

    lastDewormingDate: {
      type: Date,
      default: null,
      validate: {
        validator: function (value) {
          return !value || value <= new Date();
        },
        message: "Ngày tẩy giun không được ở tương lai",
      },
    },

    vaccines: {
      type: [vaccineRecordSchema],
      default: [],
    },

    medicalNotes: {
      type: String,
      trim: true,
      default: "",
    },

    abnormalSigns: {
      type: String,
      trim: true,
      default: "",
    },

    checkResult: {
      type: String,
      enum: {
        values: CHECK_RESULT,
        message: "Kết luận kiểm tra sức khỏe không hợp lệ",
      },
      required: [true, "Kết luận kiểm tra là bắt buộc"],
      default: "Cần theo dõi thêm",
    },

    isEligibleForSale: {
      type: Boolean,
      default: false,
    },

    recommendation: {
      type: String,
      trim: true,
      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

dogHealthRecordSchema.index({ dogId: 1, checkedAt: -1 });

dogHealthRecordSchema.pre("validate", function (next) {
  if (this.isEligibleForSale && this.checkResult === "Chưa đủ điều kiện bán") {
    return next(
      new Error("Không thể đánh dấu đủ điều kiện bán khi kết luận là chưa đủ điều kiện bán")
    );
  }

  if (this.checkResult === "Đủ điều kiện bán") {
    this.isEligibleForSale = true;
  }

  if (this.checkResult === "Chưa đủ điều kiện bán") {
    this.isEligibleForSale = false;
  }

  next();
});

dogHealthRecordSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

module.exports = mongoose.model("DogHealthRecord", dogHealthRecordSchema);