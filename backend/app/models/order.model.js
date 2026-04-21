const mongoose = require("mongoose");

const ORDER_PAYMENT_METHODS = ["ZaloPay"];

const ORDER_PAYMENT_STATUSES = [
  "Chờ thanh toán",
  "Đã xác nhận",
  "Đã hoàn tất",
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
      default: "ZaloPay",
      index: true,
    },

    paymentProvider: {
      type: String,
      enum: ["ZALOPAY"],
      default: "ZALOPAY",
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

    paymentUrl: {
      type: String,
      default: "",
      trim: true,
    },

    qrCode: {
      type: String,
      default: "",
      trim: true,
    },

    paymentStatus: {
      type: String,
      enum: ORDER_PAYMENT_STATUSES,
      default: "Chờ thanh toán",
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

  this.customerName = String(this.customerName || "").trim();
  this.customerPhone = String(this.customerPhone || "").trim();
  this.customerAddress = String(this.customerAddress || "").trim();
  this.note = String(this.note || "").trim();
  this.paymentMethod = "ZaloPay";
  this.paymentProvider = "ZALOPAY";
  this.paymentProviderOrderId = String(this.paymentProviderOrderId || "").trim();
  this.paymentTransactionId = String(this.paymentTransactionId || "").trim();
  this.paymentUrl = String(this.paymentUrl || "").trim();
  this.qrCode = String(this.qrCode || "").trim();

  if (!ORDER_PAYMENT_STATUSES.includes(this.paymentStatus)) {
    throw new Error("Trạng thái thanh toán không hợp lệ");
  }

  if (!ORDER_STATUSES.includes(this.status)) {
    throw new Error("Trạng thái đơn hàng không hợp lệ");
  }

  if (
    ["Đã xác nhận", "Đã hoàn tất"].includes(this.paymentStatus) &&
    !this.paymentProviderOrderId
  ) {
    throw new Error("Đơn ZaloPay thiếu mã giao dịch app_trans_id");
  }

  if (this.status === "Đã nhận cọc" && this.paymentStatus !== "Đã xác nhận") {
    throw new Error("Đơn chỉ được ở trạng thái 'Đã nhận cọc' khi cọc đã được xác nhận");
  }

  if (this.status === "Đang giao" && this.paymentStatus !== "Đã xác nhận") {
    throw new Error("Đơn chỉ được giao khi khoản cọc đã được xác nhận");
  }

  if (this.status === "Hoàn thành" && this.paymentStatus !== "Đã hoàn tất") {
    this.paymentStatus = "Đã hoàn tất";
  }

  if (this.status === "Đã hủy" && this.paymentStatus === "Chờ thanh toán") {
    this.paymentStatus = "Thanh toán thất bại";
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