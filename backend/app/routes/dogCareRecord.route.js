const express = require("express");
const controller = require("../controllers/dogCareRecord.controller");
const {
  requireAdmin,
  requireCustomer,
} = require("../middlewares/auth.middleware");

const router = express.Router();

// Admin
router.get("/", requireAdmin, controller.findAll);
router.post("/", requireAdmin, controller.create);
router.get("/:id", requireAdmin, controller.findOne);
router.put("/:id", requireAdmin, controller.update);
router.delete("/:id", requireAdmin, controller.delete);
router.post("/:id/follow-up", requireAdmin, controller.addFollowUp);
router.get("/dog/:dogId", requireAdmin, controller.findByDog);

// Customer
router.get("/my-records", requireCustomer, controller.findMyCareRecords);

module.exports = router;