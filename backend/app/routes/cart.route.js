const express = require("express");
const cartController = require("../controllers/cart.controller");
const { requireCustomer } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", requireCustomer, cartController.getMyCart);
router.post("/items", requireCustomer, cartController.addItem);
router.put("/items/:id", requireCustomer, cartController.updateItem);
router.delete("/items/:id", requireCustomer, cartController.removeItem);
router.delete("/clear", requireCustomer, cartController.clearMyCart);

module.exports = router;