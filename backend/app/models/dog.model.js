const mongoose = require("mongoose");

const dogSchema = new mongoose.Schema(
  {
    maCho: { type: String, unique: true },
    name: { type: String, required: true },

    farmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farm",
      required: true,
    },

    breedId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Breed",
      required: true,
    },

    gender: { type: String, enum: ["Đực", "Cái"] },
    price: { type: Number, required: true },
    description: String,
    image: { type: String, required: true },
    birthDate: { type: Date, required: true },
    weight: { type: Number },
    healthStatus: { type: String, default: "Tốt" },
    lastDeworming: { type: Date },

    healthRecord: [
      {
        vaccineId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Vaccine",
        },
        dateInjected: { type: Date },
        note: { type: String },
      },
    ],

    status: {
      type: String,
      enum: [
        "Chờ duyệt",
        "Đã duyệt",
        "Từ chối",
        "Chờ thanh toán",
        "Đã đặt cọc",
        "Đang giao",
        "Đã bán",
        "Ngừng bán",
      ],
      default: "Chờ duyệt",
    },

    rejectionReason: { type: String, default: "" },
  },
  { timestamps: true }
);

dogSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

module.exports = mongoose.model("Dog", dogSchema);