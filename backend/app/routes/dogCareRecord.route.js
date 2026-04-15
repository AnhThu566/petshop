const express = require("express");
const controller = require("../controllers/dogCareRecord.controller");
const { requireAdmin, requireCustomer } = require("../middlewares/auth.middleware");

const router = express.Router();

// Customer route đặt trước
router.get("/my-records", requireCustomer, controller.findMyCareRecords);

// Admin route đặc thù đặt trước /:id
router.get("/dog/:dogId", requireAdmin, controller.findByDog);

router.get("/", requireAdmin, controller.findAll);
router.post("/", requireAdmin, controller.create);
router.get("/:id", requireAdmin, controller.findOne);
router.put("/:id", requireAdmin, controller.update);
router.delete("/:id", requireAdmin, controller.delete);
router.post("/:id/follow-up", requireAdmin, controller.addFollowUp);

module.exports = router;