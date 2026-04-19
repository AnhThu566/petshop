const mongoose = require("mongoose");

const accessorySchema = new mongoose.Schema(
  {
    maPhuKien: {
      type: String,
      unique: true,
      trim: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AccessoryCategory",
      default: null,
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
      trim: true,
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

    // =========================
    // KHUYẾN MÃI PHỤ KIỆN
    // =========================
    promotion: {
      isActive: {
        type: Boolean,
        default: false,
      },
      title: {
        type: String,
        default: "",
        trim: true,
      },
      discountType: {
        type: String,
        enum: ["percent", "fixed"],
        default: "percent",
      },
      discountValue: {
        type: Number,
        default: 0,
        min: 0,
      },
      startDate: {
        type: Date,
        default: null,
      },
      endDate: {
        type: Date,
        default: null,
      },
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