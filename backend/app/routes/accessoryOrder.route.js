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
router.get("/user/:userId", requireCustomer, accessoryOrderController.findByUserId);

// Customer hủy đơn
router.put("/:id/cancel", requireCustomer, accessoryOrderController.cancelByCustomer);

// Admin xem tất cả đơn
router.get("/", requireAdmin, accessoryOrderController.findAll);

// Xem chi tiết 1 đơn
router.get("/:id", accessoryOrderController.findOne);

// Admin cập nhật trạng thái
router.put("/:id/status", requireAdmin, accessoryOrderController.updateStatus);

console.log("requireCustomer =", requireCustomer);
console.log("cancelByCustomer =", accessoryOrderController.cancelByCustomer);

module.exports = router;