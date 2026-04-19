const express = require("express");
const authController = require("../controllers/auth.controller");
const upload = require("../middlewares/upload.middleware");
const { verifyToken } = require("../middlewares/auth.middleware");

const router = express.Router();

// 1. Đăng ký Trang trại
router.post("/register-farm", upload.single("image"), authController.registerFarm);

// 2. Đăng ký Khách hàng
router.post("/register", authController.register);

// 3. Đăng nhập chung
router.post("/login", authController.login);

// 4. Đổi mật khẩu
router.put("/change-password", verifyToken, authController.changePassword);

module.exports = router;