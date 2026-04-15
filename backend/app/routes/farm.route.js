const express = require("express");
const farmController = require("../controllers/farm.controller");
const upload = require("../middlewares/upload.middleware");
const {
  requireAdmin,
  requireAdminOrFarm,
} = require("../middlewares/auth.middleware");

const router = express.Router();

// Lấy danh sách trại / tạo trại mới
router
  .route("/")
  .get(requireAdmin, farmController.findAll)
  .post(requireAdmin, upload.single("image"), farmController.create);

// Lấy mã trại tự động
router.get("/next-code", requireAdmin, farmController.getNextCode);

// Lấy 1 trại theo id
router.get("/:id", requireAdminOrFarm, farmController.findOne);

// Cập nhật trạng thái hợp tác
router.put("/:id/status", requireAdmin, farmController.updateStatus);

// Sửa / xóa trại
router
  .route("/:id")
  .put(requireAdmin, upload.single("image"), farmController.update)
  .delete(requireAdmin, farmController.delete);

module.exports = router;