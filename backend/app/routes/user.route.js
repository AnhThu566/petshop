// routes/user.route.js
const express = require("express");
const userController = require("../controllers/user.controller");
const upload = require("../middlewares/upload.middleware");
const { verifyToken } = require("../middlewares/auth.middleware");

const router = express.Router();

// Lấy hồ sơ người dùng hiện tại
router.get("/me", verifyToken, userController.getMe);

// Cập nhật hồ sơ + avatar
router.put(
  "/me",
  verifyToken,
  upload.single("avatar"),
  userController.updateMe
);

module.exports = router;