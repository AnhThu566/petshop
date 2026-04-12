const express = require("express");
const dogReminderController = require("../controllers/dogReminder.controller");
const {
  requireAdmin,
  requireCustomer,
} = require("../middlewares/auth.middleware");

const router = express.Router();

// Admin
router.post("/", requireAdmin, dogReminderController.create);
router.get("/", requireAdmin, dogReminderController.findAll);
router.put("/:id/status", requireAdmin, dogReminderController.updateStatus);

// Customer
router.get("/my-reminders", requireCustomer, dogReminderController.findMyReminders);
router.put("/:id/complete", requireCustomer, dogReminderController.markCompletedByCustomer);

module.exports = router;