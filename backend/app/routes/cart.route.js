const express = require("express");
const cartController = require("../controllers/cart.controller");
const { requireCustomer } = require("../middlewares/auth.middleware");

const router = express.Router();

// Lấy giỏ hàng của khách đang đăng nhập
router.get("/", requireCustomer, cartController.getMyCart);

// Thêm sản phẩm vào giỏ
router.post("/items", requireCustomer, cartController.addItem);

// Cập nhật số lượng sản phẩm trong giỏ
router.put("/items/:id", requireCustomer, cartController.updateItem);

// Xóa 1 sản phẩm khỏi giỏ
router.delete("/items/:id", requireCustomer, cartController.removeItem);

// Xóa toàn bộ giỏ hàng
router.delete("/clear", requireCustomer, cartController.clearMyCart);

module.exports = router;