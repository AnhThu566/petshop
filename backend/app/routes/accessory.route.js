const express = require("express");
const accessoryController = require("../controllers/accessory.controller");
const upload = require("../middlewares/upload.middleware");
const { requireAdmin } = require("../middlewares/auth.middleware");

const router = express.Router();

// Public / lấy danh sách
router.get("/", accessoryController.findAll);
router.get("/:id", accessoryController.findOne);

// Admin quản lý
router.post("/", requireAdmin, upload.single("image"), accessoryController.create);
router.put("/:id", requireAdmin, upload.single("image"), accessoryController.update);
router.delete("/:id", requireAdmin, accessoryController.delete);

module.exports = router;