const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    maDichVu: {
      type: String,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Đang hoạt động", "Ngừng hoạt động"],
      default: "Đang hoạt động",
    },
  },
  { timestamps: true }
);

serviceSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

module.exports = mongoose.model("Service", serviceSchema);