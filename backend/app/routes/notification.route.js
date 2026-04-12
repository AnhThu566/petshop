const express = require("express");
const notificationController = require("../controllers/notification.controller");
const {
  requireAdmin,
  requireCustomer,
  requireFarm,
} = require("../middlewares/auth.middleware");

const router = express.Router();

// ==============================
// ADMIN
// ==============================

// Admin tạo thông báo
router.post("/", requireAdmin, notificationController.create);

// Admin xem toàn bộ thông báo
router.get("/", requireAdmin, notificationController.findAll);

// Xóa 1 thông báo
router.delete("/:id", requireAdmin, notificationController.delete);

// ==============================
// CUSTOMER
// ==============================

// Customer xem thông báo của mình
router.get(
  "/customer/me",
  requireCustomer,
  notificationController.findMineForCustomer
);

// Customer đánh dấu đã đọc tất cả
router.put(
  "/customer/read-all",
  requireCustomer,
  notificationController.markAllAsReadForCustomer
);

// ==============================
// FARM
// ==============================

// Farm xem thông báo của mình
router.get("/farm/me", requireFarm, notificationController.findMineForFarm);

// Farm đánh dấu đã đọc tất cả
router.put(
  "/farm/read-all",
  requireFarm,
  notificationController.markAllAsReadForFarm
);

// ==============================
// ĐỌC 1 THÔNG BÁO
// ==============================

// Customer đánh dấu đã đọc 1 thông báo
router.put(
  "/customer/:id/read",
  requireCustomer,
  notificationController.markAsRead
);

// Farm đánh dấu đã đọc 1 thông báo
router.put(
  "/farm/:id/read",
  requireFarm,
  notificationController.markAsRead
);

// Admin đánh dấu đã đọc 1 thông báo admin
router.put(
  "/admin/:id/read",
  requireAdmin,
  notificationController.markAsRead
);

module.exports = router;