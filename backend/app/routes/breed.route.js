const express = require("express");
const breedController = require("../controllers/breed.controller");

// 👉 1. IMPORT TRẠM THU PHÍ (Middleware upload)
// Đảm bảo đường dẫn này trỏ đúng tới thư mục middlewares em vừa tạo nhé
const upload = require("../middlewares/upload.middleware"); 

const router = express.Router();

// Tuyến đường không có ID (Dùng để Lấy tất cả hoặc Thêm mới)
router.route("/")
    .get(breedController.findAll)
    // 👉 2. NHÚNG VÀO ĐÂY: Dùng upload.single("image") để hứng 1 file ảnh có tên biến là "image"
    .post(upload.single("image"), breedController.create);

// Tuyến đường để lấy mã giống chó tiếp theo
router.route("/next-code")
    .get(breedController.getNextCode);

// Tuyến đường có ID (Dùng để Sửa hoặc Xóa 1 giống chó cụ thể)
router.route("/:id")
    // 👉 3. NHÚNG VÀO ĐÂY NỮA: Để lúc Sửa giống chó Admin cũng có thể up ảnh mới thay thế ảnh cũ
    .put(upload.single("image"), breedController.update)
    .delete(breedController.delete);

module.exports = router;