const express = require("express");
const orderController = require("../controllers/order.controller");
const {
  requireAdmin,
  requireCustomer,
} = require("../middlewares/auth.middleware");

const router = express.Router();

// Khách tạo đơn đặt cọc
router.post("/deposit", requireCustomer, orderController.createDeposit);

// Admin xem toàn bộ đơn
router.get("/", requireAdmin, orderController.findAll);

// Admin cập nhật trạng thái đơn
router.put("/:id/status", requireAdmin, orderController.updateStatus);

// Khách tra cứu theo SĐT
router.get("/phone/:phone", requireCustomer, orderController.findByPhone);

// Khách xem lịch sử theo user
router.get("/user/:userId", requireCustomer, orderController.findByUserId);

module.exports = router;