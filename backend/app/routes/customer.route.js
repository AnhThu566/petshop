const express = require("express");
const customerController = require("../controllers/customer.controller");
const router = express.Router();


// 1. Lấy danh sách khách hàng
router.get("/", customerController.findAll);

// 2. Lấy mã khách hàng tự động (KH001, KH002...)
router.get("/next-code", customerController.getNextCode);

// 3. Cập nhật thông tin/trạng thái khách hàng
router.put("/:id", customerController.update);

// 4. Xóa khách hàng
router.delete("/:id", customerController.delete);

// 5. Thêm route tạo mới khách hàng
router.post("/", customerController.create);

module.exports = router;