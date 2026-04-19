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

// Tạo yêu cầu đặt cọc chó
router.post("/deposit", requireCustomer, orderController.createDeposit);

// Xem danh sách đơn đặt cọc của chính mình
router.get("/my-orders", requireCustomer, orderController.findMyOrders);

// Khách tự hủy đơn khi đơn còn ở trạng thái cho phép
router.put("/:id/cancel", requireCustomer, orderController.cancelByCustomer);

// ==============================
// QUẢN TRỊ VIÊN
// ==============================

// Xem toàn bộ đơn đặt cọc
router.get("/", requireAdmin, orderController.findAll);

// Admin xem lịch sử thay đổi trạng thái đơn
router.get("/:id/history", requireAdmin, orderController.getHistory);

// Admin cập nhật trạng thái đơn
router.put("/:id/status", requireAdmin, orderController.updateStatus);

module.exports = router;