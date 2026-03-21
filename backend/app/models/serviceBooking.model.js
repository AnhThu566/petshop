const mongoose = require("mongoose");

const serviceBookingSchema = new mongoose.Schema(
  {
    maLichDat: {
      type: String,
      unique: true,
      trim: true,
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
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

    bookingDate: {
      type: String,
      required: true,
    },

    bookingTime: {
      type: String,
      required: true,
    },

    note: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["Chờ xác nhận", "Đã xác nhận", "Hoàn thành", "Đã hủy"],
      default: "Chờ xác nhận",
    },
  },
  { timestamps: true }
);

serviceBookingSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

module.exports = mongoose.model("ServiceBooking", serviceBookingSchema);