const multer = require("multer");
const path = require("path");

// 1. Cấu hình nơi lưu trữ và tên file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Ảnh sẽ được lưu vào thư mục 'uploads' ở backend
        cb(null, "uploads/"); 
    },
    filename: function (req, file, cb) {
        // Đổi tên file: thời gian hiện tại + số ngẫu nhiên + đuôi file gốc (VD: 164801234-8234.jpg)
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// 2. Bộ lọc: Chỉ cho phép tải lên file hình ảnh (jpeg, png, jpg, gif)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true); // Hợp lệ, cho đi tiếp
    } else {
        cb(new Error("Chỉ được phép tải lên file hình ảnh!"), false); // Chặn lại
    }
};

// 3. Khởi tạo multer
const upload = multer({ 
    storage: storage, 
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Giới hạn ảnh tối đa 5MB cho nhẹ server
});

module.exports = upload;