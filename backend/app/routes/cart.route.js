const express = require("express");
const cartController = require("../controllers/cart.controller");
const { requireCustomerToPurchase } = require("../middlewares/auth.middleware");

const router = express.Router();

// =====================================================
// Giỏ hàng thuộc nhóm "mua mới"
// => customer bị khóa/ngừng hoạt động sẽ không được dùng
// =====================================================

// Lấy giỏ hàng của khách đang đăng nhập
router.get("/", requireCustomerToPurchase, cartController.getMyCart);

// Thêm sản phẩm vào giỏ
router.post("/items", requireCustomerToPurchase, cartController.addItem);

// Cập nhật số lượng sản phẩm trong giỏ
router.put("/items/:id", requireCustomerToPurchase, cartController.updateItem);

// Xóa 1 sản phẩm khỏi giỏ
router.delete("/items/:id", requireCustomerToPurchase, cartController.removeItem);

// Xóa toàn bộ giỏ hàng
router.delete("/clear", requireCustomerToPurchase, cartController.clearMyCart);

module.exports = router;