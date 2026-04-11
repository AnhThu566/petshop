const express = require("express");
const serviceBookingController = require("../controllers/serviceBooking.controller");
const { requireAdmin, requireCustomer } = require("../middlewares/auth.middleware");

const router = express.Router();

// Khách đặt lịch
router.post("/", requireCustomer, serviceBookingController.create);

// Admin xem tất cả
router.get("/", requireAdmin, serviceBookingController.findAll);

// Khách xem lịch của mình
router.get("/my-bookings", requireCustomer, serviceBookingController.findMyBookings);

// Admin cập nhật trạng thái
router.put("/:id/status", requireAdmin, serviceBookingController.updateStatus);

// Khách hủy lịch
router.put("/:id/cancel", requireCustomer, serviceBookingController.cancelByCustomer);

module.exports = router;