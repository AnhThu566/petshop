const mongoose = require("mongoose");

const serviceCategorySchema = new mongoose.Schema(
  {
    maLoaiDichVu: {
      type: String,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["Hoạt động", "Ngừng hoạt động"],
      default: "Hoạt động",
    },
  },
  { timestamps: true }
);

serviceCategorySchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

module.exports = mongoose.model("ServiceCategory", serviceCategorySchema);