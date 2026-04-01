const Cart = require("../models/cart.model");
const CartItem = require("../models/cartItem.model");
const Accessory = require("../models/accessory.model");
const ApiError = require("../api-error");

const getCurrentUserId = (req) => req.user?._id || req.user?.id || null;

const getOrCreateActiveCart = async (userId) => {
  let cart = await Cart.findOne({ userId, status: "active" });

  if (!cart) {
    cart = await Cart.create({
      userId,
      status: "active",
    });
  }

  return cart;
};

exports.getMyCart = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      return next(new ApiError(401, "Bạn chưa đăng nhập"));
    }

    const cart = await getOrCreateActiveCart(userId);

    const items = await CartItem.find({ cartId: cart._id }).populate("accessoryId");

    return res.send({
      cart,
      items,
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi tải giỏ hàng: " + error.message));
  }
};

exports.addItem = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const { accessoryId, quantity } = req.body;

    if (!userId) {
      return next(new ApiError(401, "Bạn chưa đăng nhập"));
    }

    if (!accessoryId) {
      return next(new ApiError(400, "Thiếu accessoryId"));
    }

    const accessory = await Accessory.findById(accessoryId);
    if (!accessory) {
      return next(new ApiError(404, "Không tìm thấy phụ kiện"));
    }

    const cart = await getOrCreateActiveCart(userId);

    const qty = Number(quantity) > 0 ? Number(quantity) : 1;

    let item = await CartItem.findOne({
      cartId: cart._id,
      accessoryId,
    });

    if (item) {
      item.quantity += qty;
      item.priceAtTime = accessory.price;
      await item.save();
    } else {
      item = await CartItem.create({
        cartId: cart._id,
        accessoryId,
        quantity: qty,
        priceAtTime: accessory.price,
      });
    }

    return res.send({
      message: "Đã thêm vào giỏ hàng",
      item,
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi thêm giỏ hàng: " + error.message));
  }
};

exports.updateItem = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const { id } = req.params;
    const { quantity } = req.body;

    if (!userId) {
      return next(new ApiError(401, "Bạn chưa đăng nhập"));
    }

    const item = await CartItem.findById(id);
    if (!item) {
      return next(new ApiError(404, "Không tìm thấy sản phẩm trong giỏ"));
    }

    const cart = await Cart.findById(item.cartId);
    if (!cart || String(cart.userId) !== String(userId)) {
      return next(new ApiError(403, "Bạn không có quyền sửa giỏ hàng này"));
    }

    item.quantity = Number(quantity) > 0 ? Number(quantity) : 1;
    await item.save();

    return res.send({
      message: "Cập nhật giỏ hàng thành công",
      item,
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi cập nhật giỏ hàng: " + error.message));
  }
};

exports.removeItem = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const { id } = req.params;

    if (!userId) {
      return next(new ApiError(401, "Bạn chưa đăng nhập"));
    }

    const item = await CartItem.findById(id);
    if (!item) {
      return next(new ApiError(404, "Không tìm thấy sản phẩm trong giỏ"));
    }

    const cart = await Cart.findById(item.cartId);
    if (!cart || String(cart.userId) !== String(userId)) {
      return next(new ApiError(403, "Bạn không có quyền xóa sản phẩm này"));
    }

    await CartItem.findByIdAndDelete(id);

    return res.send({
      message: "Đã xóa sản phẩm khỏi giỏ hàng",
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi xóa sản phẩm khỏi giỏ: " + error.message));
  }
};

exports.clearMyCart = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      return next(new ApiError(401, "Bạn chưa đăng nhập"));
    }

    const cart = await Cart.findOne({ userId, status: "active" });
    if (!cart) {
      return res.send({ message: "Giỏ hàng đã trống" });
    }

    await CartItem.deleteMany({ cartId: cart._id });

    return res.send({
      message: "Đã xóa toàn bộ giỏ hàng",
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi xóa giỏ hàng: " + error.message));
  }
};