const express = require("express");
const controller = require("../controllers/dogHealthRecord.controller");
const {
  requireAdmin,
  requireFarm,
  requireAdminOrFarm,
} = require("../middlewares/auth.middleware");

const router = express.Router();

// ==============================
// ADMIN + FARM
// ==============================

// Lấy danh sách hồ sơ sức khỏe
router.get("/", requireAdminOrFarm, controller.findAll);

// Lấy hồ sơ sức khỏe mới nhất theo chó
router.get("/dog/:dogId/latest", requireAdminOrFarm, controller.findLatestByDog);

// Lấy chi tiết 1 hồ sơ sức khỏe
router.get("/:id", requireAdminOrFarm, controller.findOne);

// ==============================
// FARM
// ==============================

// Tạo hồ sơ sức khỏe ban đầu
router.post("/", requireFarm, controller.create);

// Cập nhật hồ sơ sức khỏe của trại mình
router.put("/:id", requireFarm, controller.update);

// ==============================
// ADMIN
// ==============================

// Duyệt hồ sơ hoặc trả về yêu cầu bổ sung
router.put("/:id/review", requireAdmin, controller.reviewRecord);

// Xóa hồ sơ sức khỏe
router.delete("/:id", requireAdmin, controller.delete);

module.exports = router;