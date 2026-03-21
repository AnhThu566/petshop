const express = require("express");
const authController = require("../controllers/auth.controller");
const upload = require("../middlewares/upload.middleware");

const router = express.Router();

// 1. Đăng ký Trang trại (Giữ nguyên ở đây vì liên quan đến tạo tài khoản mới)
router.post("/register-farm", upload.single("image"), authController.registerFarm);

// 2. Đăng ký Khách hàng (Dành cho trang chủ sau này)
router.post("/register", authController.register);

// 3. Đăng nhập chung
router.post("/login", authController.login);

module.exports = router;