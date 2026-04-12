const express = require("express");
const farmController = require("../controllers/farm.controller");
const upload = require("../middlewares/upload.middleware");
const { requireAdmin } = require("../middlewares/auth.middleware");

const router = express.Router();

// Lấy danh sách trại / tạo trại mới
router
  .route("/")
  .get(requireAdmin, farmController.findAll)
  .post(requireAdmin, upload.single("image"), farmController.create);

// Lấy mã trại tự động
router
  .route("/next-code")
  .get(requireAdmin, farmController.getNextCode);

// Cập nhật trạng thái hợp tác
router
  .route("/:id/status")
  .put(requireAdmin, farmController.updateStatus);

// Sửa / xóa trại
router
  .route("/:id")
  .put(requireAdmin, upload.single("image"), farmController.update)
  .delete(requireAdmin, farmController.delete);

module.exports = router;