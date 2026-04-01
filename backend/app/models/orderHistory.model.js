const mongoose = require("mongoose");

const orderHistorySchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    oldStatus: {
      type: String,
      default: "",
      trim: true,
    },
    newStatus: {
      type: String,
      required: true,
      trim: true,
    },
    oldPaymentStatus: {
      type: String,
      default: "",
      trim: true,
    },
    newPaymentStatus: {
      type: String,
      default: "",
      trim: true,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    changedByName: {
      type: String,
      default: "",
      trim: true,
    },
    reason: {
      type: String,
      default: "",
      trim: true,
    },
    note: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

orderHistorySchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

module.exports = mongoose.model("OrderHistory", orderHistorySchema);