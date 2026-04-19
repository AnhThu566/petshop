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

// =========================
// HỖ TRỢ KHUYẾN MÃI
// =========================
const isPromotionValid = (promotion = {}) => {
  if (!promotion?.isActive) return false;

  const now = new Date();

  if (promotion.startDate && new Date(promotion.startDate) > now) {
    return false;
  }

  if (promotion.endDate && new Date(promotion.endDate) < now) {
    return false;
  }

  if (!promotion.discountValue || Number(promotion.discountValue) <= 0) {
    return false;
  }

  return true;
};

const calculatePromotionPrice = (price, promotion = {}) => {
  const originalPrice = Number(price || 0);

  if (!isPromotionValid(promotion)) {
    return {
      originalPrice,
      finalPrice: originalPrice,
      discountAmount: 0,
      discountLabel: "",
      hasPromotion: false,
    };
  }

  let discountAmount = 0;

  if (promotion.discountType === "percent") {
    discountAmount = Math.round(
      (originalPrice * Number(promotion.discountValue || 0)) / 100
    );
  } else if (promotion.discountType === "fixed") {
    discountAmount = Number(promotion.discountValue || 0);
  }

  if (discountAmount < 0) discountAmount = 0;
  if (discountAmount > originalPrice) discountAmount = originalPrice;

  const finalPrice = originalPrice - discountAmount;

  const discountLabel =
    promotion.discountType === "percent"
      ? `Giảm ${promotion.discountValue}%`
      : `Giảm ${Number(promotion.discountValue || 0).toLocaleString("vi-VN")}đ`;

  return {
    originalPrice,
    finalPrice,
    discountAmount,
    discountLabel,
    hasPromotion: discountAmount > 0,
  };
};

const getAccessoryEffectivePrice = (accessory) => {
  const promo = calculatePromotionPrice(accessory.price, accessory.promotion || {});
  return promo.finalPrice;
};

const calculateCartSummary = (items) => {
  const totalQuantity = items.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  const totalAmount = items.reduce(
    (sum, item) =>
      sum + Number(item.quantity || 0) * Number(item.priceAtTime || 0),
    0
  );

  return {
    totalQuantity,
    totalAmount,
  };
};

const sanitizeCartItems = async (cartId) => {
  const items = await CartItem.find({ cartId }).populate("accessoryId");
  const validItems = [];
  const invalidItemIds = [];

  for (const item of items) {
    if (!item.accessoryId) {
      invalidItemIds.push(item._id);
      continue;
    }

    validItems.push(item);
  }

  if (invalidItemIds.length) {
    await CartItem.deleteMany({ _id: { $in: invalidItemIds } });
  }

  return validItems;
};

exports.getMyCart = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      return next(new ApiError(401, "Bạn chưa đăng nhập"));
    }

    const cart = await getOrCreateActiveCart(userId);
    const items = await sanitizeCartItems(cart._id);
    const summary = calculateCartSummary(items);

    return res.send({
      cart,
      items,
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

    const effectivePrice = getAccessoryEffectivePrice(accessory);

    if (item) {
      item.quantity = nextQty;
      item.priceAtTime = effectivePrice;
      await item.save();
    } else {
      item = await CartItem.create({
        cartId: cart._id,
        accessoryId,
        quantity: qty,
        priceAtTime: effectivePrice,
      });
    }

    const populatedItem = await CartItem.findById(item._id).populate("accessoryId");
    const items = await sanitizeCartItems(cart._id);
    const summary = calculateCartSummary(items);

    return res.send({
      message: "Đã thêm vào giỏ hàng",
      item: populatedItem,
      summary,
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
      await CartItem.findByIdAndDelete(id);
      return next(new ApiError(404, "Phụ kiện không còn tồn tại, đã xóa khỏi giỏ"));
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

      const items = await sanitizeCartItems(cart._id);
      const summary = calculateCartSummary(items);

      return res.send({
        message: "Đã xóa sản phẩm khỏi giỏ hàng",
        summary,
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

    const effectivePrice = getAccessoryEffectivePrice(accessory);

    item.quantity = newQty;
    item.priceAtTime = effectivePrice;
    await item.save();

    const populatedItem = await CartItem.findById(item._id).populate("accessoryId");
    const items = await sanitizeCartItems(cart._id);
    const summary = calculateCartSummary(items);

    return res.send({
      message: "Cập nhật giỏ hàng thành công",
      item: populatedItem,
      summary,
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

    const items = await sanitizeCartItems(cart._id);
    const summary = calculateCartSummary(items);

    return res.send({
      message: "Đã xóa sản phẩm khỏi giỏ hàng",
      summary,
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
      return res.send({
        message: "Giỏ hàng đã trống",
        summary: { totalQuantity: 0, totalAmount: 0 },
      });
    }

    await CartItem.deleteMany({ cartId: cart._id });

    return res.send({
      message: "Đã xóa toàn bộ giỏ hàng",
      summary: { totalQuantity: 0, totalAmount: 0 },
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi xóa giỏ hàng: " + error.message));
  }
};