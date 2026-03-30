const mongoose = require("mongoose");

const accessoryOrderItemSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AccessoryOrder",
      required: true,
    },

    accessoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Accessory",
      required: true,
    },

    accessoryName: {
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
      min: 1,
    },

    subTotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

accessoryOrderItemSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

module.exports = mongoose.model("AccessoryOrderItem", accessoryOrderItemSchema);