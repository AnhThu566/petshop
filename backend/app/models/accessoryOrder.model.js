const mongoose = require("mongoose");

const accessoryOrderSchema = new mongoose.Schema(
  {
    maDonPhuKien: {
      type: String,
      unique: true,
      trim: true,
    },

    customerId: {
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

    shippingAddress: {
      type: String,
      required: true,
      trim: true,
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "ZALOPAY"],
      default: "COD",
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["Chưa thanh toán", "Đã thanh toán", "Thanh toán thất bại"],
      default: "Chưa thanh toán",
    },

    appTransId: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    zpTransId: {
      type: String,
      default: "",
      trim: true,
    },

    shippingFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        "Chờ xác nhận",
        "Đã xác nhận",
        "Đang giao",
        "Giao thất bại",
        "Hoàn thành",
        "Đã hủy",
      ],
      default: "Chờ xác nhận",
    },

    note: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

accessoryOrderSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

module.exports = mongoose.model("AccessoryOrder", accessoryOrderSchema);