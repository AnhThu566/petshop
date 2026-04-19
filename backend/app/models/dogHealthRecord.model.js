const mongoose = require("mongoose");

const REVIEW_STATUS = ["Chờ duyệt", "Cần bổ sung", "Đã duyệt"];

const vaccineRecordSchema = new mongoose.Schema(
  {
    vaccineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vaccine",
      default: null,
    },

    vaccineCode: {
      type: String,
      trim: true,
      default: "",
    },

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

    needsReminder: {
      type: Boolean,
      default: false,
    },

    nextDueDate: {
      type: Date,
      default: null,
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

    nextDewormingDate: {
      type: Date,
      default: null,
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

    isEligibleForSale: {
      type: Boolean,
      default: false,
    },

    recommendation: {
      type: String,
      trim: true,
      default: "",
    },

    reviewStatus: {
      type: String,
      enum: {
        values: REVIEW_STATUS,
        message: "Trạng thái duyệt hồ sơ không hợp lệ",
      },
      default: "Chờ duyệt",
      index: true,
    },

    reviewNote: {
      type: String,
      trim: true,
      default: "",
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

    submittedByFarm: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    updatedBy: {
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
dogHealthRecordSchema.index({ farmId: 1, reviewStatus: 1 });
dogHealthRecordSchema.index({ dogId: 1, reviewStatus: 1 });

dogHealthRecordSchema.pre("validate", function () {
  if (typeof this.checkedBy === "string") this.checkedBy = this.checkedBy.trim();
  if (typeof this.generalCondition === "string") this.generalCondition = this.generalCondition.trim();
  if (typeof this.appetiteStatus === "string") this.appetiteStatus = this.appetiteStatus.trim();
  if (typeof this.digestiveStatus === "string") this.digestiveStatus = this.digestiveStatus.trim();
  if (typeof this.respiratoryStatus === "string") this.respiratoryStatus = this.respiratoryStatus.trim();
  if (typeof this.skinCondition === "string") this.skinCondition = this.skinCondition.trim();
  if (typeof this.mobilityStatus === "string") this.mobilityStatus = this.mobilityStatus.trim();
  if (typeof this.medicalNotes === "string") this.medicalNotes = this.medicalNotes.trim();
  if (typeof this.abnormalSigns === "string") this.abnormalSigns = this.abnormalSigns.trim();
  if (typeof this.recommendation === "string") this.recommendation = this.recommendation.trim();
  if (typeof this.reviewNote === "string") this.reviewNote = this.reviewNote.trim();

  if (this.checkedAt && this.checkedAt > new Date()) {
    throw new Error("Ngày kiểm tra không được ở tương lai");
  }

  if (this.lastDewormingDate && this.lastDewormingDate > new Date()) {
    throw new Error("Ngày tẩy giun không được ở tương lai");
  }

  if (
    this.lastDewormingDate &&
    this.checkedAt &&
    this.lastDewormingDate > this.checkedAt
  ) {
    throw new Error("Ngày tẩy giun không được lớn hơn ngày kiểm tra");
  }

  if (
    this.nextDewormingDate &&
    this.lastDewormingDate &&
    this.nextDewormingDate < this.lastDewormingDate
  ) {
    throw new Error("Ngày tẩy giun tiếp theo không được nhỏ hơn ngày tẩy giun gần nhất");
  }

  if (Array.isArray(this.vaccines)) {
    this.vaccines = this.vaccines.map((vaccine) => {
      if (typeof vaccine.vaccineCode === "string") vaccine.vaccineCode = vaccine.vaccineCode.trim();
      if (typeof vaccine.vaccineName === "string") vaccine.vaccineName = vaccine.vaccineName.trim();
      if (typeof vaccine.note === "string") vaccine.note = vaccine.note.trim();

      if (vaccine.dateInjected && vaccine.dateInjected > new Date()) {
        throw new Error("Ngày tiêm vaccine không được ở tương lai");
      }

      if (
        vaccine.nextDueDate &&
        vaccine.dateInjected &&
        vaccine.nextDueDate < vaccine.dateInjected
      ) {
        throw new Error("Ngày nhắc lại vaccine không được nhỏ hơn ngày tiêm");
      }

      if (!vaccine.needsReminder) {
        vaccine.nextDueDate = null;
      }

      return vaccine;
    });
  } else {
    this.vaccines = [];
  }

  if (this.reviewStatus !== "Đã duyệt") {
    this.isEligibleForSale = false;
  } else {
    this.isEligibleForSale = true;
  }

  if (["Chờ duyệt", "Đã duyệt"].includes(this.reviewStatus)) {
    this.reviewNote = "";
  }
});

dogHealthRecordSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

module.exports = mongoose.model("DogHealthRecord", dogHealthRecordSchema);