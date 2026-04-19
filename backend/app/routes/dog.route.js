const express = require("express");
const dogController = require("../controllers/dog.controller");
const upload = require("../middlewares/upload.middleware");
const {
  requireAdmin,
  requireFarm,
  optionalAuth,
} = require("../middlewares/auth.middleware");

const router = express.Router();

/**
 * Gắn cờ public riêng để controller nhận diện chắc chắn
 */
const markPublicRequest = (req, res, next) => {
  req.isPublicRequest = true;
  next();
};

// ==============================
// PUBLIC ROUTES - KHÁCH XEM
// ==============================

router.get("/public", optionalAuth, markPublicRequest, dogController.findAll);
router.get("/public/:id", optionalAuth, markPublicRequest, dogController.findOne);

// ==============================
// INTERNAL / MANAGEMENT ROUTES
// ==============================

router.get("/", optionalAuth, dogController.findAll);
router.get("/:id/history", requireAdmin, dogController.getHistory);
router.get("/:id", optionalAuth, dogController.findOne);

// ==============================
// FARM TẠO / CẬP NHẬT HỒ SƠ CHÓ
// ==============================

router.post("/", requireFarm, upload.single("image"), dogController.create);
router.put("/:id", requireFarm, upload.single("image"), dogController.update);

// ==============================
// ADMIN DUYỆT HỒ SƠ / MỞ BÁN
// ==============================

router.put("/:id/approval-status", requireAdmin, dogController.updateApprovalStatus);
router.put("/:id/sale-status", requireAdmin, dogController.updateSaleStatus);

module.exports = router;