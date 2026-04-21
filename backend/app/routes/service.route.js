const express = require("express");
const router = express.Router();

const serviceController = require("../controllers/service.controller");
const upload = require("../middlewares/upload.middleware");
const { requireAdmin } = require("../middlewares/auth.middleware");

// ====================== PUBLIC ROUTES ======================
// Lấy danh sách dịch vụ
router.get("/", serviceController.findAll);

// Lấy chi tiết 1 dịch vụ theo id
router.get("/:id", serviceController.findOne);

// ====================== ADMIN ROUTES =======================
// Thêm dịch vụ mới
router.post(
  "/",
  requireAdmin,
  upload.single("image"),
  serviceController.create
);

// Cập nhật dịch vụ
router.put(
  "/:id",
  requireAdmin,
  upload.single("image"),
  serviceController.update
);

// Xóa dịch vụ
router.delete("/:id", requireAdmin, serviceController.delete);

module.exports = router;