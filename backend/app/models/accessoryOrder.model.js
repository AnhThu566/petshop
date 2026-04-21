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

    // =========================================================
    // COD hoặc ZALOPAY
    // =========================================================
    paymentMethod: {
      type: String,
      enum: ["COD", "ZALOPAY"],
      default: "COD",
      required: true,
    },

    // =========================================================
    // Trạng thái thanh toán
    // - COD:
    //    + lúc mới tạo đơn: Chưa thanh toán
    //    + khi hoàn thành: Đã thanh toán
    //
    // - ZALOPAY:
    //    + lúc mới tạo đơn: Chưa thanh toán
    //    + thanh toán thành công: Đã thanh toán
    //    + thanh toán fail / hủy / hết hạn: Thanh toán thất bại
    // =========================================================
    paymentStatus: {
      type: String,
      enum: [
        "Chưa thanh toán",
        "Đã thanh toán",
        "Thanh toán thất bại",
      ],
      default: "Chưa thanh toán",
    },

    // =========================================================
    // appTransId: mã giao dịch phía app dùng để query/callback ZaloPay
    // =========================================================
    appTransId: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    // =========================================================
    // zpTransId: mã giao dịch thật do ZaloPay trả về
    // =========================================================
    zpTransId: {
      type: String,
      default: "",
      trim: true,
    },

    // =========================================================
    // stockReserved:
    // true  = đơn này đang giữ kho / đã trừ kho
    // false = không còn giữ kho nữa
    //
    // Dùng để tránh hoàn kho 2 lần.
    // Ví dụ:
    // - COD tạo đơn => stockReserved = true
    // - ZALOPAY tạo đơn => stockReserved = true
    // - nếu ZALOPAY fail hoặc hủy => hoàn kho xong đổi về false
    // - nếu thanh toán thành công => vẫn giữ true
    // =========================================================
    stockReserved: {
      type: Boolean,
      default: false,
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

    // =========================================================
    // Trạng thái xử lý đơn hàng
    // =========================================================
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