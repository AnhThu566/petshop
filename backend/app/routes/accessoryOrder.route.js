const express = require("express");
const accessoryOrderController = require("../controllers/accessoryOrder.controller");
const {
  requireAdmin,
  requireCustomer,
} = require("../middlewares/auth.middleware");

const router = express.Router();

// ==============================
// KHÁCH HÀNG
// ==============================

// Khách tạo đơn phụ kiện
router.post("/", requireCustomer, accessoryOrderController.create);

// Khách xem lịch sử đơn của mình
router.get("/my-orders", requireCustomer, accessoryOrderController.findMyOrders);

// Khách hủy đơn của mình
router.put("/:id/cancel", requireCustomer, accessoryOrderController.cancelByCustomer);

// ==============================
// QUẢN TRỊ VIÊN
// ==============================

// Admin xem toàn bộ đơn phụ kiện
router.get("/", requireAdmin, accessoryOrderController.findAll);

// Admin cập nhật trạng thái đơn phụ kiện
router.put("/:id/status", requireAdmin, accessoryOrderController.updateStatus);

module.exports = router;