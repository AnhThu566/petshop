const express = require("express");
const router = express.Router();

const serviceCategoryController = require("../controllers/serviceCategory.controller");
const { requireAdmin } = require("../middlewares/auth.middleware");

// ==============================
// PUBLIC
// ==============================

// Lấy tất cả loại dịch vụ
router.get("/", serviceCategoryController.findAll);

// Lấy chi tiết 1 loại dịch vụ
router.get("/:id", serviceCategoryController.findOne);

// ==============================
// ADMIN
// ==============================

// Admin thêm loại dịch vụ
router.post("/", requireAdmin, serviceCategoryController.create);

// Admin cập nhật loại dịch vụ
router.put("/:id", requireAdmin, serviceCategoryController.update);

// Admin xóa loại dịch vụ
router.delete("/:id", requireAdmin, serviceCategoryController.delete);

module.exports = router;