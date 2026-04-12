const mongoose = require("mongoose");

const CARE_STATUS = ["Đang theo dõi", "Ổn định", "Cần tái khám", "Đã kết thúc theo dõi"];

const followUpSchema = new mongoose.Schema(
  {
    followUpDate: {
      type: Date,
      required: [true, "Ngày theo dõi là bắt buộc"],
      default: Date.now,
    },

    condition: {
      type: String,
      trim: true,
      default: "",
    },

    appetiteStatus: {
      type: String,
      trim: true,
      default: "",
    },

    activityStatus: {
      type: String,
      trim: true,
      default: "",
    },

    note: {
      type: String,
      trim: true,
      default: "",
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { _id: false }
);

const dogCareRecordSchema = new mongoose.Schema(
  {
    dogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dog",
      required: [true, "Mã chó là bắt buộc"],
      index: true,
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: [true, "Đơn hàng là bắt buộc"],
      index: true,
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Khách hàng là bắt buộc"],
      index: true,
    },

    handoverDate: {
      type: Date,
      required: [true, "Ngày bàn giao là bắt buộc"],
      default: Date.now,
    },

    handoverCondition: {
      type: String,
      trim: true,
      default: "",
    },

    initialCareNote: {
      type: String,
      trim: true,
      default: "",
    },

    currentStatus: {
      type: String,
      enum: {
        values: CARE_STATUS,
        message: "Trạng thái theo dõi sau bán không hợp lệ",
      },
      default: "Đang theo dõi",
    },

    nextCheckDate: {
      type: Date,
      default: null,
    },

    followUps: {
      type: [followUpSchema],
      default: [],
    },

    adminNote: {
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

dogCareRecordSchema.index({ dogId: 1, orderId: 1 }, { unique: true });

dogCareRecordSchema.pre("validate", function (next) {
  if (this.nextCheckDate && this.handoverDate && this.nextCheckDate < this.handoverDate) {
    return next(new Error("Ngày kiểm tra tiếp theo không được nhỏ hơn ngày bàn giao"));
  }

  next();
});

dogCareRecordSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

module.exports = mongoose.model("DogCareRecord", dogCareRecordSchema);