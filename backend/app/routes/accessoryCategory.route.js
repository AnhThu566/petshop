const express = require("express");
const accessoryCategoryController = require("../controllers/accessoryCategory.controller");
const { requireAdmin } = require("../middlewares/auth.middleware");

const router = express.Router();

// Lấy tất cả loại phụ kiện
router.get("/", accessoryCategoryController.findAll);

// Lấy chi tiết 1 loại phụ kiện
router.get("/:id", accessoryCategoryController.findOne);

// Admin thêm loại phụ kiện
router.post("/", requireAdmin, accessoryCategoryController.create);

// Admin cập nhật loại phụ kiện
router.put("/:id", requireAdmin, accessoryCategoryController.update);

// Admin xóa loại phụ kiện
router.delete("/:id", requireAdmin, accessoryCategoryController.delete);

module.exports = router;