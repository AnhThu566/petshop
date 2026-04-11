const mongoose = require("mongoose");
const Cart = require("../models/cart.model");
const CartItem = require("../models/cartItem.model");
const Accessory = require("../models/accessory.model");
const ApiError = require("../api-error");

const getCurrentUserId = (req) => req.user?._id || req.user?.id || null;

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const getOrCreateActiveCart = async (userId) => {
  let cart = await Cart.findOne({ userId, status: "active" });
  if (!cart) {
    cart = await Cart.create({ userId, status: "active" });
  }
  return cart;
};

const normalizeAddQuantity = (value) => {
  const qty = Number(value);
  if (!Number.isFinite(qty) || qty <= 0) return 1;
  return Math.floor(qty);
};

const normalizeUpdateQuantity = (value) => {
  const qty = Number(value);
  if (!Number.isFinite(qty)) return null;
  return Math.floor(qty);
};

const calculateCartSummary = (items) => {
  const totalQuantity = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const totalAmount = items.reduce(
    (sum, item) => sum + Number(item.quantity || 0) * Number(item.priceAtTime || 0),
    0
  );

  return {
    totalQuantity,
    totalAmount,
  };
};

exports.getMyCart = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      return next(new ApiError(401, "Bạn chưa đăng nhập"));
    }

    const cart = await getOrCreateActiveCart(userId);
    const items = await CartItem.find({ cartId: cart._id }).populate("accessoryId");

    const validItems = items.filter((item) => item.accessoryId);
    const summary = calculateCartSummary(validItems);

    return res.send({
      cart,
      items: validItems,
      summary,
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

    if (!isValidObjectId(accessoryId)) {
      return next(new ApiError(400, "accessoryId không hợp lệ"));
    }

    const accessory = await Accessory.findById(accessoryId);
    if (!accessory) {
      return next(new ApiError(404, "Không tìm thấy phụ kiện"));
    }

    if (accessory.status !== "Đang bán") {
      return next(new ApiError(400, "Phụ kiện hiện không còn mở bán"));
    }

    if (Number(accessory.quantity) <= 0) {
      return next(new ApiError(400, "Phụ kiện đã hết hàng"));
    }

    const cart = await getOrCreateActiveCart(userId);
    const qty = normalizeAddQuantity(quantity);

    let item = await CartItem.findOne({
      cartId: cart._id,
      accessoryId,
    });

    const currentQty = item ? Number(item.quantity) : 0;
    const nextQty = currentQty + qty;

    if (nextQty > Number(accessory.quantity)) {
      return next(
        new ApiError(
          400,
          `Số lượng vượt quá tồn kho. Chỉ còn ${accessory.quantity} sản phẩm`
        )
      );
    }

    if (item) {
      item.quantity = nextQty;
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

    const populatedItem = await CartItem.findById(item._id).populate("accessoryId");

    return res.send({
      message: "Đã thêm vào giỏ hàng",
      item: populatedItem,
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

    if (!isValidObjectId(id)) {
      return next(new ApiError(400, "ID item trong giỏ không hợp lệ"));
    }

    const item = await CartItem.findById(id);
    if (!item) {
      return next(new ApiError(404, "Không tìm thấy sản phẩm trong giỏ"));
    }

    const cart = await Cart.findById(item.cartId);
    if (!cart || String(cart.userId) !== String(userId)) {
      return next(new ApiError(403, "Bạn không có quyền sửa giỏ hàng này"));
    }

    const accessory = await Accessory.findById(item.accessoryId);
    if (!accessory) {
      return next(new ApiError(404, "Không tìm thấy phụ kiện"));
    }

    if (accessory.status !== "Đang bán") {
      return next(new ApiError(400, "Phụ kiện hiện không còn mở bán"));
    }

    const newQty = normalizeUpdateQuantity(quantity);

    if (newQty === null) {
      return next(new ApiError(400, "Số lượng không hợp lệ"));
    }

    if (newQty <= 0) {
      await CartItem.findByIdAndDelete(id);
      return res.send({
        message: "Đã xóa sản phẩm khỏi giỏ hàng",
      });
    }

    if (newQty > Number(accessory.quantity)) {
      return next(
        new ApiError(
          400,
          `Số lượng vượt quá tồn kho. Chỉ còn ${accessory.quantity} sản phẩm`
        )
      );
    }

    item.quantity = newQty;
    item.priceAtTime = accessory.price;
    await item.save();

    const populatedItem = await CartItem.findById(item._id).populate("accessoryId");

    return res.send({
      message: "Cập nhật giỏ hàng thành công",
      item: populatedItem,
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

    if (!isValidObjectId(id)) {
      return next(new ApiError(400, "ID item trong giỏ không hợp lệ"));
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

    return res.send({ message: "Đã xóa sản phẩm khỏi giỏ hàng" });
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

    return res.send({ message: "Đã xóa toàn bộ giỏ hàng" });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi xóa giỏ hàng: " + error.message));
  }
};