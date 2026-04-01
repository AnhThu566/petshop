const express = require("express");
const dogController = require("../controllers/dog.controller");
const DogHistory = require("../models/dogHistory.model");
const upload = require("../middlewares/upload.middleware");
const {
  requireAdmin,
  requireFarm,
} = require("../middlewares/auth.middleware");

const router = express.Router();

// Public / nội bộ xem danh sách
router.get("/", dogController.findAll);

// Farm đăng chó mới
router.post("/", requireFarm, upload.single("image"), dogController.create);

// Admin duyệt / đổi trạng thái
router.put("/:id/status", requireAdmin, dogController.updateStatus);

// Xem chi tiết
router.get("/:id", dogController.findOne);

// Farm cập nhật hồ sơ chó
router.put("/:id", requireFarm, dogController.update);

router.get("/:id/history", async (req, res, next) => {
  try {
    const histories = await DogHistory.find({ dogId: req.params.id }).sort({
      createdAt: -1,
    });

    res.send(histories);
  } catch (error) {
    next(error);
  }
});

module.exports = router;