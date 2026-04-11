const express = require("express");
const accessoryOrderController = require("../controllers/accessoryOrder.controller");
const {
  requireAdmin,
  requireCustomer,
} = require("../middlewares/auth.middleware");

const router = express.Router();

// Customer tạo đơn
router.post("/", requireCustomer, accessoryOrderController.create);

// Customer xem lịch sử đơn của mình
router.get("/my-orders", requireCustomer, accessoryOrderController.findMyOrders);

// Customer hủy đơn của mình
router.put("/:id/cancel", requireCustomer, accessoryOrderController.cancelByCustomer);

// Admin xem tất cả đơn
router.get("/", requireAdmin, accessoryOrderController.findAll);

// Admin cập nhật trạng thái đơn
router.put("/:id/status", requireAdmin, accessoryOrderController.updateStatus);

module.exports = router;