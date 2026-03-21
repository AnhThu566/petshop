const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    // 👉 THÊM MỚI: Liên kết đơn hàng với tài khoản khách (User)
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User",
        required: true, // Mỗi đơn cọc phải gắn với một tài khoản khách hàng (đã đăng nhập)
    },

    // Thông tin người cọc
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerAddress: { type: String, required: true },
    
    // Thông tin bé chó và trại (Dùng ID để liên kết)
    dogId: { type: mongoose.Schema.Types.ObjectId, ref: "Dog", required: true },
    farmId: { type: mongoose.Schema.Types.ObjectId, ref: "Farm", required: true },
    
    // Thông tin tiền bạc
    totalPrice: { type: Number, required: true },
    depositAmount: { type: Number, required: true }, // Tiền cọc (Thường là 30%)
    
    // Trạng thái đơn cọc
    status: {
        type: String,
        enum: ["Chờ xác nhận cọc", "Đã nhận cọc", "Đang giao", "Hoàn thành", "Đã hủy"],
        default: "Chờ xác nhận cọc" // Vừa đặt xong thì nằm ở trạng thái này
    },
    note: { type: String } // Lời nhắn của khách
}, { timestamps: true }); // Tự động lưu ngày giờ đặt cọc

module.exports = mongoose.model("Order", orderSchema);