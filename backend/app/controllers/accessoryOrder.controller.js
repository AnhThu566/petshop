const mongoose = require("mongoose");
const AccessoryOrder = require("../models/accessoryOrder.model");
const AccessoryOrderItem = require("../models/accessoryOrderItem.model");
const Accessory = require("../models/accessory.model");
const ApiError = require("../api-error");

const VALID_STATUSES = [
  "Chờ xác nhận",
  "Đã xác nhận",
  "Đang giao",
  "Giao thất bại",
  "Hoàn thành",
  "Đã hủy",
];

const PHONE_REGEX = /^(0|\+84)\d{9,10}$/;

const generateNextCode = async () => {
  const lastOrder = await AccessoryOrder.findOne().sort({
    createdAt: -1,
    maDonPhuKien: -1,
  });

  let nextCode = "DPK001";

  if (lastOrder && lastOrder.maDonPhuKien) {
    const lastNumber = parseInt(lastOrder.maDonPhuKien.replace("DPK", ""), 10);
    if (!Number.isNaN(lastNumber)) {
      nextCode = "DPK" + String(lastNumber + 1).padStart(3, "0");
    }
  }

  return nextCode;
};

const getCurrentUserId = (req) => req.user?._id || req.user?.id || null;
const getCurrentUserRole = (req) => String(req.user?.role || "").toLowerCase();
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const normalizeText = (value) => String(value || "").trim();

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

const populateOrderWithItems = async (orderId) => {
  const order = await AccessoryOrder.findById(orderId).populate(
    "customerId",
    "username fullName phone email"
  );

  const items = await AccessoryOrderItem.find({ orderId }).populate(
    "accessoryId",
    "maPhuKien name image status quantity price promotion"
  );

  return {
    order,
    items,
  };
};

const restoreAccessoryStock = async (orderId) => {
  const orderItems = await AccessoryOrderItem.find({ orderId });

  for (const item of orderItems) {
    const accessory = await Accessory.findById(item.accessoryId);

    if (accessory) {
      accessory.quantity =
        Number(accessory.quantity || 0) + Number(item.quantity || 0);
      await accessory.save();
    }
  }
};

// Customer tạo đơn phụ kiện
exports.create = async (req, res, next) => {
  try {
    const currentUserId = getCurrentUserId(req);

    if (!currentUserId) {
      return next(new ApiError(401, "Bạn chưa đăng nhập"));
    }

    const customerName = normalizeText(req.body.customerName);
    const customerPhone = normalizeText(req.body.customerPhone);
    const shippingAddress = normalizeText(req.body.shippingAddress);
    const note = normalizeText(req.body.note);
    const items = req.body.items;

    if (!customerName || !customerPhone || !shippingAddress) {
      return next(new ApiError(400, "Vui lòng nhập đầy đủ thông tin người nhận"));
    }

    if (customerName.length < 2 || customerName.length > 100) {
      return next(new ApiError(400, "Tên người nhận không hợp lệ"));
    }

    if (!PHONE_REGEX.test(customerPhone)) {
      return next(new ApiError(400, "Số điện thoại không hợp lệ"));
    }

    if (shippingAddress.length < 5 || shippingAddress.length > 300) {
      return next(new ApiError(400, "Địa chỉ giao hàng không hợp lệ"));
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return next(new ApiError(400, "Đơn phụ kiện phải có ít nhất 1 sản phẩm"));
    }

    const normalizedItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const accessoryId = item?.accessoryId;
      const quantity = Number(item?.quantity);

      if (!accessoryId || !isValidObjectId(accessoryId)) {
        return next(new ApiError(400, "Có phụ kiện không hợp lệ trong đơn hàng"));
      }

      if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isInteger(quantity)) {
        return next(new ApiError(400, "Số lượng sản phẩm trong đơn không hợp lệ"));
      }

      const accessory = await Accessory.findById(accessoryId);

      if (!accessory) {
        return next(new ApiError(404, "Có phụ kiện không tồn tại trong hệ thống"));
      }

      if (accessory.status !== "Đang bán") {
        return next(
          new ApiError(400, `Phụ kiện [${accessory.name}] hiện không còn bán`)
        );
      }

      if (Number(accessory.quantity) < quantity) {
        return next(
          new ApiError(400, `Phụ kiện [${accessory.name}] không đủ số lượng tồn kho`)
        );
      }

      const effectivePrice = getAccessoryEffectivePrice(accessory);
      const subTotal = Number(effectivePrice) * quantity;
      totalAmount += subTotal;

      normalizedItems.push({
        accessory,
        accessoryId: accessory._id,
        accessoryName: accessory.name,
        price: effectivePrice,
        quantity,
        subTotal,
      });
    }

    for (const item of normalizedItems) {
      item.accessory.quantity =
        Number(item.accessory.quantity) - Number(item.quantity);
      await item.accessory.save();
    }

    const maDonPhuKien = await generateNextCode();

    const newOrder = new AccessoryOrder({
      maDonPhuKien,
      customerId: currentUserId,
      customerName,
      customerPhone,
      shippingAddress,
      note: note || "",
      totalAmount,
      status: "Chờ xác nhận",
    });

    await newOrder.save();

    const finalItems = normalizedItems.map((item) => ({
      orderId: newOrder._id,
      accessoryId: item.accessoryId,
      accessoryName: item.accessoryName,
      price: item.price,
      quantity: item.quantity,
      subTotal: item.subTotal,
    }));

    await AccessoryOrderItem.insertMany(finalItems);

    const { order, items: createdItems } = await populateOrderWithItems(newOrder._id);

    return res.send({
      message: "Đặt đơn phụ kiện thành công!",
      order,
      items: createdItems,
    });
  } catch (error) {
    console.error("Lỗi create accessory order:", error);
    return next(new ApiError(500, "Lỗi khi tạo đơn phụ kiện: " + error.message));
  }
};

// Customer xem đơn của mình
exports.findMyOrders = async (req, res, next) => {
  try {
    const currentUserId = getCurrentUserId(req);

    if (!currentUserId) {
      return next(new ApiError(401, "Bạn chưa đăng nhập"));
    }

    const filter = { customerId: currentUserId };

    if (req.query.status && VALID_STATUSES.includes(req.query.status)) {
      filter.status = req.query.status;
    }

    const orders = await AccessoryOrder.find(filter)
      .populate("customerId", "username fullName phone email")
      .sort({ createdAt: -1 });

    const result = [];

    for (const order of orders) {
      const items = await AccessoryOrderItem.find({ orderId: order._id }).populate(
        "accessoryId",
        "maPhuKien name image status price promotion"
      );

      result.push({
        ...order.toJSON(),
        items,
      });
    }

    return res.send(result);
  } catch (error) {
    console.error("Lỗi find my accessory orders:", error);
    return next(new ApiError(500, "Lỗi khi lấy lịch sử đơn phụ kiện: " + error.message));
  }
};

// Admin xem tất cả đơn phụ kiện
exports.findAll = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.status && VALID_STATUSES.includes(req.query.status)) {
      filter.status = req.query.status;
    }

    if (req.query.customerPhone) {
      filter.customerPhone = normalizeText(req.query.customerPhone);
    }

    if (req.query.maDonPhuKien) {
      filter.maDonPhuKien = normalizeText(req.query.maDonPhuKien);
    }

    const orders = await AccessoryOrder.find(filter)
      .populate("customerId", "username fullName phone email")
      .sort({ createdAt: -1 });

    const result = [];

    for (const order of orders) {
      const items = await AccessoryOrderItem.find({ orderId: order._id }).populate(
        "accessoryId",
        "maPhuKien name image status price promotion"
      );

      result.push({
        ...order.toJSON(),
        items,
      });
    }

    return res.send(result);
  } catch (error) {
    console.error("Lỗi findAll accessory orders:", error);
    return next(new ApiError(500, "Lỗi khi lấy danh sách đơn phụ kiện: " + error.message));
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const status = normalizeText(req.body.status);

    if (!isValidObjectId(id)) {
      return next(new ApiError(400, "ID đơn phụ kiện không hợp lệ"));
    }

    if (!VALID_STATUSES.includes(status)) {
      return next(new ApiError(400, "Trạng thái đơn phụ kiện không hợp lệ"));
    }

    const order = await AccessoryOrder.findById(id);
    if (!order) {
      return next(new ApiError(404, "Không tìm thấy đơn phụ kiện"));
    }

    const oldStatus = order.status;

    if (oldStatus === status) {
      const { order: sameOrder, items } = await populateOrderWithItems(order._id);
      return res.send({
        message: "Trạng thái đơn không thay đổi.",
        order: sameOrder,
        items,
      });
    }

    if (oldStatus === "Hoàn thành") {
      return next(new ApiError(400, "Đơn đã hoàn thành không thể thay đổi trạng thái"));
    }

    if (oldStatus === "Đã hủy") {
      return next(new ApiError(400, "Đơn đã hủy không thể chuyển sang trạng thái khác"));
    }

    const allowedTransitions = {
      "Chờ xác nhận": ["Đã xác nhận", "Đã hủy"],
      "Đã xác nhận": ["Đang giao", "Đã hủy"],
      "Đang giao": ["Hoàn thành", "Giao thất bại"],
      "Giao thất bại": ["Đang giao", "Đã hủy"],
    };

    if (!allowedTransitions[oldStatus]?.includes(status)) {
      return next(
        new ApiError(
          400,
          `Không thể chuyển đơn từ trạng thái [${oldStatus}] sang [${status}]`
        )
      );
    }

    if (status === "Đã hủy") {
      await restoreAccessoryStock(order._id);
    }

    order.status = status;
    await order.save();

    const { order: updatedOrder, items } = await populateOrderWithItems(order._id);

    return res.send({
      message: "Cập nhật trạng thái đơn phụ kiện thành công!",
      order: updatedOrder,
      items,
    });
  } catch (error) {
    console.error("Lỗi update accessory order status:", error);
    return next(
      new ApiError(500, "Lỗi khi cập nhật trạng thái đơn phụ kiện: " + error.message)
    );
  }
};

// Xem chi tiết 1 đơn phụ kiện
exports.findOne = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUserId = getCurrentUserId(req);
    const currentRole = getCurrentUserRole(req);

    if (!isValidObjectId(id)) {
      return next(new ApiError(400, "ID đơn phụ kiện không hợp lệ"));
    }

    const order = await AccessoryOrder.findById(id).populate(
      "customerId",
      "username fullName phone email"
    );

    if (!order) {
      return next(new ApiError(404, "Không tìm thấy đơn phụ kiện"));
    }

    if (currentRole !== "admin") {
      const orderUserId = order.customerId?._id || order.customerId;
      if (String(orderUserId) !== String(currentUserId)) {
        return next(new ApiError(403, "Bạn không có quyền xem đơn này"));
      }
    }

    const items = await AccessoryOrderItem.find({ orderId: order._id }).populate(
      "accessoryId",
      "maPhuKien name image status price promotion"
    );

    return res.send({
      ...order.toJSON(),
      items,
    });
  } catch (error) {
    console.error("Lỗi findOne accessory order:", error);
    return next(new ApiError(500, "Lỗi khi lấy chi tiết đơn phụ kiện: " + error.message));
  }
};

// Customer hủy đơn của mình
exports.cancelByCustomer = async (req, res, next) => {
  try {
    const currentUserId = getCurrentUserId(req);

    if (!currentUserId) {
      return next(new ApiError(401, "Bạn chưa đăng nhập"));
    }

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return next(new ApiError(400, "ID đơn phụ kiện không hợp lệ"));
    }

    const order = await AccessoryOrder.findById(id);
    if (!order) {
      return next(new ApiError(404, "Không tìm thấy đơn phụ kiện"));
    }

    const orderUserId = order.customerId?._id || order.customerId;

    if (String(orderUserId) !== String(currentUserId)) {
      return next(new ApiError(403, "Bạn không có quyền hủy đơn này"));
    }

    if (order.status !== "Chờ xác nhận") {
      return next(
        new ApiError(400, "Chỉ có thể hủy đơn khi đơn đang ở trạng thái chờ xác nhận")
      );
    }

    await restoreAccessoryStock(order._id);

    order.status = "Đã hủy";
    await order.save();

    const { order: updatedOrder, items } = await populateOrderWithItems(order._id);

    return res.send({
      message: "Hủy đơn phụ kiện thành công!",
      order: updatedOrder,
      items,
    });
  } catch (error) {
    console.error("Lỗi customer cancel accessory order:", error);
    return next(
      new ApiError(500, "Lỗi khi khách hàng hủy đơn phụ kiện: " + error.message)
    );
  }
};