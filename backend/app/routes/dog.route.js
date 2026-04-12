const express = require("express");
const dogController = require("../controllers/dog.controller");
const upload = require("../middlewares/upload.middleware");
const {
  requireAdmin,
  requireFarm,
} = require("../middlewares/auth.middleware");

const router = express.Router();

// ==============================
// XEM DANH SÁCH / CHI TIẾT
// ==============================

// Public / nội bộ xem danh sách
router.get("/", dogController.findAll);

// Xem chi tiết 1 chó
router.get("/:id", dogController.findOne);

// Xem lịch sử thay đổi hồ sơ chó
router.get("/:id/history", dogController.getHistory);

// ==============================
// FARM TẠO / CẬP NHẬT HỒ SƠ CHÓ
// ==============================

// Trại gửi hồ sơ chó mới
router.post("/", requireFarm, upload.single("image"), dogController.create);

// Trại cập nhật hồ sơ chó của trại mình
router.put("/:id", requireFarm, upload.single("image"), dogController.update);

// ==============================
// ADMIN DUYỆT HỒ SƠ / MỞ BÁN
// ==============================

// Admin cập nhật trạng thái duyệt hồ sơ
router.put(
  "/:id/approval-status",
  requireAdmin,
  dogController.updateApprovalStatus
);

// Admin cập nhật trạng thái bán
router.put(
  "/:id/sale-status",
  requireAdmin,
  dogController.updateSaleStatus
);

module.exports = router;