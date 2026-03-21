const mongoose = require("mongoose");

const farmSchema = new mongoose.Schema({
    // 👉 Bổ sung: Mã trại tự động (VD: T001, T002)
    maTrai: { type: String, required: true, unique: true }, 

    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    description: String,
    images: [String],
    
    // Chủ trại là ai? (Liên kết với bảng User ở trên)
    ownerId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ["active", "paused", "stopped"],
        default: "active"
    }
}, { timestamps: true });

farmSchema.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

module.exports = mongoose.model("Farm", farmSchema);