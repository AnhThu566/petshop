const express = require("express");
const serviceController = require("../controllers/service.controller");
const upload = require("../middlewares/upload.middleware");
const { requireAdmin } = require("../middlewares/auth.middleware");

const router = express.Router();

// Public
router.get("/", serviceController.findAll);
router.get("/:id", serviceController.findOne);

// Admin
router.post("/", requireAdmin, upload.single("image"), serviceController.create);
router.put("/:id", requireAdmin, upload.single("image"), serviceController.update);
router.delete("/:id", requireAdmin, serviceController.delete);

module.exports = router;