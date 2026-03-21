const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fullName: String,
    gender: { type: String, enum: ["Nam", "Nữ", "Khác"] },
    birthday: Date,
    phone: { type: String },
    avatar: String,
    email: { type: String, required: true, unique: true },
    customerCode: { type: String },
    
    // Đóng vai trò gì trong hệ thống?
    role: { 
        type: String,
        enum: ["admin", "farm", "customer"],
        default: "customer"
    },
    status: {
        type: String,
        enum: ["active", "locked"],
        default: "active"
    }
}, { timestamps: true });

userSchema.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
});

module.exports = mongoose.model("User", userSchema);