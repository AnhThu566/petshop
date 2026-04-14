const mongoose = require("mongoose");

const REMINDER_TYPE = [
  "Tiêm vaccine",
  "Tẩy giun",
  "Tái khám",
  "Chăm sóc định kỳ",
];

const REMINDER_STATUS = ["Chờ nhắc", "Đã gửi nhắc", "Đã hoàn thành", "Đã hủy"];

const dogReminderSchema = new mongoose.Schema(
  {
    dogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dog",
      required: [true, "Mã chó là bắt buộc"],
      index: true,
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Khách hàng là bắt buộc"],
      index: true,
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
      index: true,
    },

    careRecordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DogCareRecord",
      default: null,
      index: true,
    },

    reminderType: {
      type: String,
      enum: {
        values: REMINDER_TYPE,
        message: "Loại nhắc lịch không hợp lệ",
      },
      required: [true, "Loại nhắc lịch là bắt buộc"],
    },

    title: {
      type: String,
      trim: true,
      required: [true, "Tiêu đề nhắc lịch là bắt buộc"],
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    reminderDate: {
      type: Date,
      required: [true, "Ngày nhắc lịch là bắt buộc"],
      index: true,
    },

    status: {
      type: String,
      enum: {
        values: REMINDER_STATUS,
        message: "Trạng thái nhắc lịch không hợp lệ",
      },
      default: "Chờ nhắc",
      index: true,
    },

    isSent: {
      type: Boolean,
      default: false,
    },

    sentAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    note: {
      type: String,
      trim: true,
      default: "",
    },

    // =========================
    // HỖ TRỢ NHẮC LẶP LẠI
    // =========================
    isRecurring: {
      type: Boolean,
      default: false,
      index: true,
    },

    repeatEveryDays: {
      type: Number,
      default: 0,
      min: [0, "Số ngày lặp lại không hợp lệ"],
    },

    lastCompletedAt: {
      type: Date,
      default: null,
    },

    nextReminderDate: {
      type: Date,
      default: null,
    },

    parentReminderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DogReminder",
      default: null,
      index: true,
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

dogReminderSchema.index({ customerId: 1, reminderDate: 1, status: 1 });
dogReminderSchema.index({ dogId: 1, reminderType: 1, reminderDate: 1 });

dogReminderSchema.pre("validate", function (next) {
  if (this.isSent && !this.sentAt) {
    this.sentAt = new Date();
  }

  if (this.status === "Đã gửi nhắc") {
    this.isSent = true;
    if (!this.sentAt) this.sentAt = new Date();
  }

  if (this.status === "Đã hoàn thành") {
    if (!this.completedAt) this.completedAt = new Date();
    if (!this.lastCompletedAt) this.lastCompletedAt = this.completedAt;
  }

  if (this.status === "Chờ nhắc") {
    this.isSent = false;
    this.sentAt = null;
    this.completedAt = null;
  }

  if (this.status === "Đã hủy") {
    this.completedAt = null;
  }

  if (!this.isRecurring) {
    this.repeatEveryDays = 0;
    this.nextReminderDate = null;
  }

  if (this.isRecurring && (!this.repeatEveryDays || this.repeatEveryDays <= 0)) {
    return next(
      new Error("Lịch lặp phải có số ngày lặp lại lớn hơn 0")
    );
  }

  next();
});

dogReminderSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

module.exports = mongoose.model("DogReminder", dogReminderSchema);