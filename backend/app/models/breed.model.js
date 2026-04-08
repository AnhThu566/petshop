const mongoose = require("mongoose");

const breedSchema = new mongoose.Schema(
  {
    maGiong: { type: String, required: true, unique: true },

    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    origin: { type: String, default: "" },

    // Chỉ lưu 1 ảnh đại diện
    image: { type: String, default: "" },

    status: {
      type: String,
      enum: ["active", "paused", "stopped"],
      default: "active",
    },
  },
  { timestamps: true }
);

breedSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

module.exports = mongoose.model("Breed", breedSchema);