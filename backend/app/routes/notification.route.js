const express = require("express");
const notificationController = require("../controllers/notification.controller");
const {
  requireAdmin,
  requireCustomer,
  requireFarm,
} = require("../middlewares/auth.middleware");

const router = express.Router();

// Admin tạo thông báo
router.post("/", requireAdmin, notificationController.create);

// Admin xem toàn bộ thông báo
router.get("/", requireAdmin, notificationController.findAll);

// Customer xem thông báo của mình
router.get("/customer/me", requireCustomer, notificationController.findMineForCustomer);

// Farm xem thông báo của mình
router.get("/farm/me", requireFarm, notificationController.findMineForFarm);

// Customer đánh dấu đã đọc tất cả
router.put("/customer/read-all", requireCustomer, notificationController.markAllAsReadForCustomer);

// Farm đánh dấu đã đọc tất cả
router.put("/farm/read-all", requireFarm, notificationController.markAllAsReadForFarm);

// Đánh dấu đã đọc 1 thông báo
router.put("/:id/read", notificationController.markAsRead);

// Xóa 1 thông báo
router.delete("/:id", requireAdmin, notificationController.delete);

module.exports = router;
