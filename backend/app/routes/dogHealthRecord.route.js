const express = require("express");
const controller = require("../controllers/dogHealthRecord.controller");
const { requireAdmin } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", requireAdmin, controller.findAll);
router.post("/", requireAdmin, controller.create);
router.get("/:id", requireAdmin, controller.findOne);
router.put("/:id", requireAdmin, controller.update);
router.delete("/:id", requireAdmin, controller.delete);
router.get("/dog/:dogId/latest", requireAdmin, controller.findLatestByDog);

module.exports = router;