const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    farmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farm",
      default: null,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        "DOG_APPROVED",
        "DOG_REJECTED",
        "DOG_CREATED",
        "DOG_ORDER_CREATED",
        "DOG_ORDER_UPDATED",
        "ACCESSORY_ORDER_CREATED",
        "ACCESSORY_ORDER_UPDATED",
        "SERVICE_BOOKING_CREATED",
        "SERVICE_BOOKING_UPDATED",
        "GENERAL",
      ],
      default: "GENERAL",
    },
    targetRole: {
      type: String,
      enum: ["customer", "farm", "admin", "all"],
      default: "customer",
    },
    isRead: {
      type: Boolean,
      default: false,
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

notificationSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

module.exports = mongoose.model("Notification", notificationSchema);