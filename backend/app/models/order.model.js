const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerPhone: {
      type: String,
      required: true,
      trim: true,
    },
    customerAddress: {
      type: String,
      required: true,
      trim: true,
    },

    dogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dog",
      required: true,
    },
    farmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farm",
      required: true,
    },

    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    depositAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    remainingAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    paymentMethod: {
      type: String,
      enum: ["Chuyển khoản", "Tiền mặt"],
      default: "Chuyển khoản",
    },

    paymentProof: {
      type: String,
      default: "",
      trim: true,
    },

    paymentStatus: {
      type: String,
      enum: ["Chưa thanh toán", "Đã gửi minh chứng", "Đã xác nhận"],
      default: "Chưa thanh toán",
    },

    status: {
      type: String,
      enum: ["Chờ xác nhận cọc", "Đã nhận cọc", "Đang giao", "Hoàn thành", "Đã hủy"],
      default: "Chờ xác nhận cọc",
    },

    note: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);
orderSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

module.exports = mongoose.model("Order", orderSchema);