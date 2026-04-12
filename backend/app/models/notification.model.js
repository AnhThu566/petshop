const mongoose = require("mongoose");

const NOTIFICATION_TYPE = [
  "DOG_CREATED",
  "DOG_APPROVED",
  "DOG_REJECTED",
  "DOG_ORDER_CREATED",
  "DOG_ORDER_UPDATED",
  "DOG_HEALTH_UPDATE",
  "DOG_CARE_UPDATE",
  "DOG_REMINDER",
  "ACCESSORY_ORDER_CREATED",
  "ACCESSORY_ORDER_UPDATED",
  "SERVICE_BOOKING_CREATED",
  "SERVICE_BOOKING_UPDATED",
  "GENERAL",
];

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    farmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farm",
      default: null,
      index: true,
    },

    title: {
      type: String,
      required: [true, "Tiêu đề thông báo là bắt buộc"],
      trim: true,
    },

    message: {
      type: String,
      required: [true, "Nội dung thông báo là bắt buộc"],
      trim: true,
    },

    type: {
      type: String,
      enum: {
        values: NOTIFICATION_TYPE,
        message: "Loại thông báo không hợp lệ",
      },
      default: "GENERAL",
      index: true,
    },

    targetRole: {
      type: String,
      enum: {
        values: ["customer", "farm", "admin", "all"],
        message: "Vai trò nhận thông báo không hợp lệ",
      },
      default: "customer",
      index: true,
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    sentAt: {
      type: Date,
      default: Date.now,
    },

    readAt: {
      type: Date,
      default: null,
    },

    relatedId: {
      type: String,
      default: "",
      trim: true,
    },

    relatedModel: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ farmId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ targetRole: 1, createdAt: -1 });

notificationSchema.pre("save", function (next) {
  if (this.isRead && !this.readAt) {
    this.readAt = new Date();
  }

  if (!this.isRead) {
    this.readAt = null;
  }

  next();
});

notificationSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

module.exports = mongoose.model("Notification", notificationSchema);