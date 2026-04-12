const express = require("express");
const orderController = require("../controllers/order.controller");
const {
  requireAdmin,
  requireCustomer,
} = require("../middlewares/auth.middleware");

const router = express.Router();

// ==============================
// KHÁCH HÀNG
// ==============================

// Tạo yêu cầu đặt cọc
router.post("/deposit", requireCustomer, orderController.createDeposit);

// Xem đơn của chính mình
router.get("/my-orders", requireCustomer, orderController.findMyOrders);

// Khách tự hủy đơn khi còn chờ admin xác nhận cọc
router.put("/:id/cancel", requireCustomer, orderController.cancelByCustomer);

// ==============================
// QUẢN TRỊ VIÊN
// ==============================

// Xem toàn bộ đơn đặt cọc
router.get("/", requireAdmin, orderController.findAll);

// Admin cập nhật trạng thái đơn
router.put("/:id/status", requireAdmin, orderController.updateStatus);

// Admin xem lịch sử thay đổi trạng thái đơn
router.get("/:id/history", requireAdmin, orderController.getHistory);

module.exports = router;