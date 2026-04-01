const express = require("express");
const orderController = require("../controllers/order.controller");
const OrderHistory = require("../models/orderHistory.model");
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

// Khách hủy đơn
router.put("/:id/cancel", requireCustomer, orderController.cancelByCustomer);

// Xem lịch sử thay đổi trạng thái đơn
router.get("/:id/history", requireCustomer, async (req, res, next) => {
  try {
    const histories = await OrderHistory.find({ orderId: req.params.id }).sort({
      createdAt: -1,
    });

    res.send(histories);
  } catch (error) {
    next(error);
  }
});

module.exports = router;