const express = require("express");
const farmController = require("../controllers/farm.controller");

// 👉 1. Import "Trạm thu phí" nhận ảnh
const upload = require("../middlewares/upload.middleware"); 

const router = express.Router();

// Tuyến đường Lấy danh sách HOẶC Thêm trại mới
router.route("/")
    .get(farmController.findAll)
    // 👉 2. Gắn upload.single("image") vào trước hàm create
    .post(upload.single("image"), farmController.create);

// Tuyến đường lấy mã tự động (VD: T001)
router.route("/next-code")
    .get(farmController.getNextCode);

// Tuyến đường Sửa HOẶC Xóa 1 trại chó cụ thể
router.route("/:id")
    // 👉 3. Gắn upload.single("image") vào trước hàm update
    .put(upload.single("image"), farmController.update)
    .delete(farmController.delete);

module.exports = router;