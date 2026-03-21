const mongoose = require("mongoose");

const vaccineSchema = new mongoose.Schema({
    // Mã vaccine tự động (VD: VC001)
    maVaccine: { type: String, unique: true }, 
    
    // Tên loại vaccine (VD: Vaccine 5 bệnh Vanguard, Vaccine Dại Rabisin)
    name: { type: String, required: true }, 
    
    // Mô tả tác dụng hoặc lưu ý tiêm
    description: { type: String },
    
    // Trạng thái để Admin kiểm soát
    status: { type: String, enum: ["Hoạt động", "Ngừng sử dụng"], default: "Hoạt động" }
}, { timestamps: true });

module.exports = mongoose.model("Vaccine", vaccineSchema);