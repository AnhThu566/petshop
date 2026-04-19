const express = require("express");
const accessoryOrderController = require("../controllers/accessoryOrder.controller");
const {
  requireAdmin,
  requireCustomer,
} = require("../middlewares/auth.middleware");

const router = express.Router();

// ==============================
// CALLBACK ZALOPAY
// ==============================
// ZaloPay gọi server-to-server về backend
router.post("/zalopay/callback", accessoryOrderController.zalopayCallback);

// ==============================
// KHÁCH HÀNG
// ==============================

// Khách tạo đơn phụ kiện COD
router.post("/", requireCustomer, accessoryOrderController.create);

// Khách tạo thanh toán ZaloPay
router.post(
  "/zalopay/create",
  requireCustomer,
  accessoryOrderController.createZaloPayOrder
);

// Khách xem lịch sử đơn của mình
router.get("/my-orders", requireCustomer, accessoryOrderController.findMyOrders);

// Khách kiểm tra lại trạng thái thanh toán ZaloPay
router.get(
  "/:id/zalopay-status",
  requireCustomer,
  accessoryOrderController.queryZaloPayStatus
);

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