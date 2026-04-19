const express = require("express");
const serviceBookingController = require("../controllers/serviceBooking.controller");
const {
  requireAdmin,
  requireCustomer,
} = require("../middlewares/auth.middleware");

const router = express.Router();

// ==============================
// KHÁCH HÀNG
// ==============================

// Khách đặt lịch dịch vụ
router.post("/", requireCustomer, serviceBookingController.create);

// Khách xem lịch của mình
router.get("/my-bookings", requireCustomer, serviceBookingController.findMyBookings);

// Khách hủy lịch của mình
router.put("/:id/cancel", requireCustomer, serviceBookingController.cancelByCustomer);

// ==============================
// QUẢN TRỊ VIÊN
// ==============================

// Admin xem toàn bộ lịch đặt dịch vụ
router.get("/", requireAdmin, serviceBookingController.findAll);

// Admin cập nhật trạng thái lịch
router.put("/:id/status", requireAdmin, serviceBookingController.updateStatus);

module.exports = router;