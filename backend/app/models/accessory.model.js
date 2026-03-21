const mongoose = require("mongoose");

const accessorySchema = new mongoose.Schema(
  {
    maPhuKien: {
      type: String,
      unique: true,
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
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    description: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Đang bán", "Ngừng bán"],
      default: "Đang bán",
    },
  },
  { timestamps: true }
);

accessorySchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

module.exports = mongoose.model("Accessory", accessorySchema);