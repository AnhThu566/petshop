const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
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
      index: true,
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
      index: true,
    },

    farmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farm",
      required: true,
      index: true,
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
      validate: {
        validator: function (value) {
          return value <= this.totalPrice;
        },
        message: "Tiền đặt cọc không được lớn hơn tổng giá trị đơn",
      },
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
      index: true,
    },

    status: {
      type: String,
      enum: ["Chờ xác nhận cọc", "Đã nhận cọc", "Đang giao", "Hoàn thành", "Đã hủy"],
      default: "Chờ xác nhận cọc",
      index: true,
    },

    note: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

orderSchema.pre("validate", function (next) {
  if (this.totalPrice < this.depositAmount) {
    return next(new Error("Tiền đặt cọc không được lớn hơn tổng tiền"));
  }

  const expectedRemaining = this.totalPrice - this.depositAmount;
  if (this.remainingAmount !== expectedRemaining) {
    this.remainingAmount = expectedRemaining;
  }

  if (
    this.paymentMethod === "Chuyển khoản" &&
    this.paymentStatus !== "Chưa thanh toán" &&
    !this.paymentProof
  ) {
    return next(new Error("Đơn chuyển khoản phải có minh chứng thanh toán"));
  }

  next();
});

orderSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

module.exports = mongoose.model("Order", orderSchema);