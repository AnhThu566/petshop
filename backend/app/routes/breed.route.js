const express = require("express");
const breedController = require("../controllers/breed.controller");
const upload = require("../middlewares/upload.middleware");

const router = express.Router();

// Lấy mã giống tiếp theo
router.get("/next-code", breedController.getNextCode);

// Lấy danh sách giống chó / thêm giống chó mới
router
  .route("/")
  .get(breedController.findAll)
  .post(upload.single("image"), breedController.create);

// Lấy 1 giống chó / cập nhật / xóa
router
  .route("/:id")
  .get(breedController.findOne)
  .put(upload.single("image"), breedController.update)
  .delete(breedController.delete);

module.exports = router;