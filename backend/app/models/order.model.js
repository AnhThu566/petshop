const mongoose = require("mongoose");

const ORDER_PAYMENT_METHODS = ["Chuyển khoản", "Tiền mặt", "ZaloPay"];

const ORDER_PAYMENT_STATUSES = [
  "Chưa thanh toán",
  "Chờ thanh toán",
  "Đã gửi minh chứng",
  "Đã xác nhận",
  "Đã hoàn tất",
  "Đã hủy xác nhận",
  "Thanh toán thất bại",
];

const ORDER_STATUSES = [
  "Chờ xác nhận cọc",
  "Đã nhận cọc",
  "Đang giao",
  "Hoàn thành",
  "Đã hủy",
];

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
          return Number(value) <= Number(this.totalPrice || 0);
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
      enum: ORDER_PAYMENT_METHODS,
      default: "Chuyển khoản",
      index: true,
    },

    paymentProvider: {
      type: String,
      enum: ["", "ZALOPAY"],
      default: "",
      trim: true,
      index: true,
    },

    paymentProviderOrderId: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    paymentTransactionId: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    paymentProof: {
      type: String,
      default: "",
      trim: true,
    },

    paymentStatus: {
      type: String,
      enum: ORDER_PAYMENT_STATUSES,
      default: "Chưa thanh toán",
      index: true,
    },

    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "Chờ xác nhận cọc",
      index: true,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    callbackAt: {
      type: Date,
      default: null,
    },

    note: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

orderSchema.pre("validate", function () {
  const totalPrice = Number(this.totalPrice || 0);
  const depositAmount = Number(this.depositAmount || 0);

  if (depositAmount > totalPrice) {
    throw new Error("Tiền đặt cọc không được lớn hơn tổng tiền");
  }

  const expectedRemaining = totalPrice - depositAmount;
  if (Number(this.remainingAmount || 0) !== expectedRemaining) {
    this.remainingAmount = expectedRemaining;
  }

  if (
    this.paymentMethod === "Chuyển khoản" &&
    this.paymentStatus === "Đã gửi minh chứng" &&
    !String(this.paymentProof || "").trim()
  ) {
    throw new Error("Đơn chuyển khoản phải có minh chứng thanh toán");
  }

  if (this.paymentMethod === "ZaloPay") {
    this.paymentProvider = "ZALOPAY";

    if (
      this.paymentStatus === "Đã xác nhận" ||
      this.paymentStatus === "Đã hoàn tất"
    ) {
      if (!String(this.paymentProviderOrderId || "").trim()) {
        throw new Error("Đơn ZaloPay thiếu mã giao dịch app_trans_id");
      }
    }
  } else {
    if (!this.paymentProvider) {
      this.paymentProvider = "";
    }
  }
});

orderSchema.index(
  { paymentProvider: 1, paymentProviderOrderId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      paymentProvider: "ZALOPAY",
      paymentProviderOrderId: { $type: "string", $ne: "" },
    },
  }
);

orderSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

module.exports = mongoose.model("Order", orderSchema);