const mongoose = require("mongoose");
const axios = require("axios");
const crypto = require("crypto");

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

const VALID_PAYMENT_METHODS = ["COD", "ZALOPAY"];

const ZP_APP_ID = process.env.ZALOPAY_APP_ID;
const ZP_KEY1 = process.env.ZALOPAY_KEY1;
const ZP_KEY2 = process.env.ZALOPAY_KEY2;
const ZP_CREATE_URL =
  process.env.ZALOPAY_CREATE_URL || "https://sb-openapi.zalopay.vn/v2/create";
const ZP_QUERY_URL =
  process.env.ZALOPAY_QUERY_URL || "https://sb-openapi.zalopay.vn/v2/query";

const ZP_CALLBACK_URL =
  process.env.ZALOPAY_CALLBACK_URL_ACCESSORY || "";
const ZP_REDIRECT_URL =
  process.env.ZALOPAY_REDIRECT_URL_ACCESSORY || "";

  const ZALOPAY_PENDING_EXPIRE_MINUTES = Number(
  process.env.ZALOPAY_PENDING_EXPIRE_MINUTES || 2
);

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

const createHmacSha256 = (data, key) =>
  crypto.createHmac("sha256", key).update(data).digest("hex");

const generateAppTransId = () => {
  const now = new Date();
  const vn = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
  );
  const yy = String(vn.getFullYear()).slice(-2);
  const mm = String(vn.getMonth() + 1).padStart(2, "0");
  const dd = String(vn.getDate()).padStart(2, "0");
  return `${yy}${mm}${dd}_${Date.now()}`;
};

const buildZaloPayEmbedData = (order) =>
  JSON.stringify({
    redirecturl: ZP_REDIRECT_URL,
    orderId: String(order._id),
    maDonPhuKien: order.maDonPhuKien,
  });

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

// ============================================================
// GHI CHÚ QUAN TRỌNG:
// stockReserved = true nghĩa là đơn này đang giữ kho tạm / đã trừ kho.
//
// - COD: tạo đơn là trừ kho luôn => stockReserved = true
// - ZALOPAY: tạo đơn cũng giữ kho tạm => stockReserved = true
// - Nếu ZALOPAY thất bại / hủy: hoàn kho và stockReserved = false
// - Nếu ZALOPAY thành công: giữ nguyên stockReserved = true
//
// Lưu ý:
// field stockReserved phải có trong accessoryOrder.model
// ============================================================

const releaseReservedStock = async (order) => {
  if (!order || !order.stockReserved) return;

  const orderItems = await AccessoryOrderItem.find({ orderId: order._id });

  for (const item of orderItems) {
    await Accessory.findByIdAndUpdate(item.accessoryId, {
      $inc: { quantity: Number(item.quantity || 0) },
    });
  }

  order.stockReserved = false;
  await order.save();
};

// ============================================================
// Atomic reserve stock:
// Chỉ trừ kho khi quantity còn đủ.
// Nếu 2 khách cùng mua 1 món cuối, chỉ 1 người reserve thành công.
// ============================================================
const reserveStockAtomically = async (normalizedItems) => {
  const reservedItems = [];

  try {
    for (const item of normalizedItems) {
      const updatedAccessory = await Accessory.findOneAndUpdate(
        {
          _id: item.accessoryId,
          status: "Đang bán",
          quantity: { $gte: Number(item.quantity || 0) },
        },
        {
          $inc: { quantity: -Number(item.quantity || 0) },
        },
        { new: true }
      );

      if (!updatedAccessory) {
        throw new ApiError(
          400,
          `Phụ kiện [${item.accessoryName}] không đủ số lượng tồn kho hoặc đã được người khác giữ trước`
        );
      }

      reservedItems.push({
        accessoryId: item.accessoryId,
        quantity: Number(item.quantity || 0),
      });
    }
  } catch (error) {
    for (const reservedItem of reservedItems) {
      await Accessory.findByIdAndUpdate(reservedItem.accessoryId, {
        $inc: { quantity: Number(reservedItem.quantity || 0) },
      });
    }
    throw error;
  }
};

// ============================================================
// Nếu reserve stock xong mà save order bị lỗi,
// cần hoàn lại đúng số lượng đã giữ.
// ============================================================
const rollbackReservedItems = async (normalizedItems = []) => {
  for (const item of normalizedItems) {
    await Accessory.findByIdAndUpdate(item.accessoryId, {
      $inc: { quantity: Number(item.quantity || 0) },
    });
  }
};

const buildAccessoryOrderPayload = async (req) => {
  const currentUserId = getCurrentUserId(req);

  if (!currentUserId) {
    throw new ApiError(401, "Bạn chưa đăng nhập");
  }

  const customerName = normalizeText(req.body.customerName);
  const customerPhone = normalizeText(req.body.customerPhone);
  const shippingAddress = normalizeText(req.body.shippingAddress);
  const note = normalizeText(req.body.note);
  const paymentMethod = normalizeText(req.body.paymentMethod || "COD").toUpperCase();
  const shippingFee = Number(req.body.shippingFee || 0);
  const items = req.body.items;

  if (!customerName || !customerPhone || !shippingAddress) {
    throw new ApiError(400, "Vui lòng nhập đầy đủ thông tin người nhận");
  }

  if (customerName.length < 2 || customerName.length > 100) {
    throw new ApiError(400, "Tên người nhận không hợp lệ");
  }

  if (!PHONE_REGEX.test(customerPhone)) {
    throw new ApiError(400, "Số điện thoại không hợp lệ");
  }

  if (shippingAddress.length < 5 || shippingAddress.length > 300) {
    throw new ApiError(400, "Địa chỉ giao hàng không hợp lệ");
  }

  if (!VALID_PAYMENT_METHODS.includes(paymentMethod)) {
    throw new ApiError(400, "Phương thức thanh toán không hợp lệ");
  }

  if (!Number.isFinite(shippingFee) || shippingFee < 0) {
    throw new ApiError(400, "Phí vận chuyển không hợp lệ");
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, "Đơn phụ kiện phải có ít nhất 1 sản phẩm");
  }

  const normalizedItems = [];
  let subTotalAmount = 0;

  for (const item of items) {
    const accessoryId = item?.accessoryId;
    const quantity = Number(item?.quantity);

    if (!accessoryId || !isValidObjectId(accessoryId)) {
      throw new ApiError(400, "Có phụ kiện không hợp lệ trong đơn hàng");
    }

    if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isInteger(quantity)) {
      throw new ApiError(400, "Số lượng sản phẩm trong đơn không hợp lệ");
    }

    const accessory = await Accessory.findById(accessoryId);

    if (!accessory) {
      throw new ApiError(404, "Có phụ kiện không tồn tại trong hệ thống");
    }

    if (accessory.status !== "Đang bán") {
      throw new ApiError(400, `Phụ kiện [${accessory.name}] hiện không còn bán`);
    }

    if (Number(accessory.quantity) < quantity) {
      throw new ApiError(
        400,
        `Phụ kiện [${accessory.name}] không đủ số lượng tồn kho`
      );
    }

    const effectivePrice = getAccessoryEffectivePrice(accessory);
    const subTotal = Number(effectivePrice) * quantity;
    subTotalAmount += subTotal;

    normalizedItems.push({
      accessory,
      accessoryId: accessory._id,
      accessoryName: accessory.name,
      price: effectivePrice,
      quantity,
      subTotal,
    });
  }

  const maDonPhuKien = await generateNextCode();
  const totalAmount = Number(subTotalAmount) + Number(shippingFee);

  return {
    currentUserId,
    customerName,
    customerPhone,
    shippingAddress,
    note,
    paymentMethod,
    shippingFee,
    normalizedItems,
    subTotalAmount,
    totalAmount,
    maDonPhuKien,
  };
};

const saveAccessoryOrder = async ({
  currentUserId,
  customerName,
  customerPhone,
  shippingAddress,
  note,
  paymentMethod,
  shippingFee,
  normalizedItems,
  totalAmount,
  maDonPhuKien,
  paymentStatus = "Chưa thanh toán",
  appTransId = "",
  stockReserved = false,
}) => {
  const newOrder = new AccessoryOrder({
    maDonPhuKien,
    customerId: currentUserId,
    customerName,
    customerPhone,
    shippingAddress,
    paymentMethod,
    paymentStatus,
    appTransId,
    shippingFee,
    note: note || "",
    totalAmount,
    status: "Chờ xác nhận",
    stockReserved,
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

  return newOrder;
};

// ============================================================
// COD:
// - reserve stock ngay lúc tạo đơn
// - paymentStatus ban đầu là Chưa thanh toán
// ============================================================
exports.create = async (req, res, next) => {
  let payload = null;
  let stockReservedDone = false;

  try {
    const payloadResult = await buildAccessoryOrderPayload(req);
    payload = payloadResult;

    if (payload.paymentMethod === "ZALOPAY") {
      return next(
        new ApiError(
          400,
          "Vui lòng dùng API tạo thanh toán ZaloPay riêng cho phương thức này"
        )
      );
    }

    await reserveStockAtomically(payload.normalizedItems);
    stockReservedDone = true;

    const newOrder = await saveAccessoryOrder({
      ...payload,
      paymentStatus: "Chưa thanh toán",
      stockReserved: true,
    });

    const { order, items: createdItems } = await populateOrderWithItems(
      newOrder._id
    );

    return res.send({
      message: "Đặt đơn phụ kiện thành công!",
      order,
      items: createdItems,
    });
  } catch (error) {
    if (stockReservedDone && payload?.normalizedItems?.length) {
      await rollbackReservedItems(payload.normalizedItems);
    }

    console.error("Lỗi create accessory order:", error);
    return next(new ApiError(500, "Lỗi khi tạo đơn phụ kiện: " + error.message));
  }
};

// ============================================================
// ZALOPAY:
// - reserve stock tạm ngay khi tạo đơn
// - nếu thanh toán thành công => giữ nguyên
// - nếu thất bại / hủy => release stock
// ============================================================
exports.createZaloPayOrder = async (req, res, next) => {
  let payload = null;
  let stockReservedDone = false;
  let newOrder = null;

  try {
    if (!ZP_APP_ID || !ZP_KEY1 || !ZP_KEY2) {
      return next(new ApiError(500, "Chưa cấu hình ZaloPay trong file .env"));
    }

    const payloadResult = await buildAccessoryOrderPayload(req);
    payload = payloadResult;

    if (payload.paymentMethod !== "ZALOPAY") {
      return next(new ApiError(400, "Phương thức thanh toán phải là ZALOPAY"));
    }

    await reserveStockAtomically(payload.normalizedItems);
    stockReservedDone = true;

    const appTransId = generateAppTransId();

    newOrder = await saveAccessoryOrder({
      ...payload,
      paymentStatus: "Chưa thanh toán",
      appTransId,
      stockReserved: true,
    });

    const embed_data = buildZaloPayEmbedData(newOrder);
    const item = JSON.stringify(
      payload.normalizedItems.map((it) => ({
        itemid: String(it.accessoryId),
        itemname: it.accessoryName,
        itemprice: it.price,
        itemquantity: it.quantity,
      }))
    );

    const app_time = Date.now();
    const amount = Number(payload.totalAmount);
    const app_user = String(payload.currentUserId);
    const description = `Thanh toán đơn phụ kiện ${payload.maDonPhuKien}`;
    const bank_code = "";

    const dataForMac = [
      ZP_APP_ID,
      appTransId,
      app_user,
      amount,
      app_time,
      embed_data,
      item,
    ].join("|");

    const mac = createHmacSha256(dataForMac, ZP_KEY1);

    const zaloPayload = {
      app_id: ZP_APP_ID,
      app_trans_id: appTransId,
      app_user,
      app_time,
      amount,
      item,
      embed_data,
      description,
      bank_code,
      callback_url: ZP_CALLBACK_URL,
      mac,
    };

    const response = await axios.post(
      ZP_CREATE_URL,
      new URLSearchParams(zaloPayload).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const data = response.data || {};

    if (Number(data.return_code) !== 1) {
      await releaseReservedStock(newOrder);
      newOrder.paymentStatus = "Thanh toán thất bại";
      await newOrder.save();

      return next(
        new ApiError(
          400,
          data.return_message ||
            data.sub_return_message ||
            "Không tạo được thanh toán ZaloPay"
        )
      );
    }

    return res.send({
      message: "Tạo thanh toán ZaloPay thành công",
      orderId: newOrder._id,
      maDonPhuKien: newOrder.maDonPhuKien,
      paymentMethod: "ZALOPAY",
      paymentStatus: newOrder.paymentStatus,
      appTransId,
      order_url: data.order_url || "",
      qr_code: data.qr_code || "",
      zp_trans_token: data.zp_trans_token || "",
    });
  } catch (error) {
    if (!newOrder && stockReservedDone && payload?.normalizedItems?.length) {
      await rollbackReservedItems(payload.normalizedItems);
    }

    console.error("Lỗi create ZaloPay order:", error);
    return next(
      new ApiError(
        500,
        "Lỗi khi tạo thanh toán ZaloPay: " +
          (error.response?.data?.return_message || error.message)
      )
    );
  }
};

// ============================================================
// Callback ZaloPay:
// - thành công => đánh dấu Đã thanh toán
// - không trừ kho ở đây nữa vì kho đã reserve từ lúc tạo đơn
// ============================================================
exports.zalopayCallback = async (req, res) => {
  try {
    const { data, mac } = req.body || {};

    if (!data || !mac) {
      return res.send({ return_code: -1, return_message: "Missing data" });
    }

    const macCheck = createHmacSha256(data, ZP_KEY2);
    if (macCheck !== mac) {
      return res.send({ return_code: -1, return_message: "Invalid mac" });
    }

    const parsedData = JSON.parse(data);
    const appTransId = parsedData.app_trans_id;
    const zpTransId = parsedData.zp_trans_id || "";

    const order = await AccessoryOrder.findOne({ appTransId });

    if (!order) {
      return res.send({
        return_code: 1,
        return_message: "Order not found but callback accepted",
      });
    }

    if (order.status === "Đã hủy") {
      return res.send({ return_code: 1, return_message: "success" });
    }

    order.paymentStatus = "Đã thanh toán";
    order.zpTransId = String(zpTransId || "");
    await order.save();

    return res.send({ return_code: 1, return_message: "success" });
  } catch (error) {
    console.error("Lỗi callback ZaloPay:", error);
    return res.send({ return_code: 0, return_message: "retry please" });
  }
};

// ============================================================
// Query lại trạng thái ZaloPay:
// - nếu thành công => Đã thanh toán
// - nếu thất bại => trả kho lại
// - nếu đang chờ => giữ nguyên
// ============================================================
exports.queryZaloPayStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return next(new ApiError(400, "ID đơn phụ kiện không hợp lệ"));
    }

    const order = await AccessoryOrder.findById(id);
    if (!order) {
      return next(new ApiError(404, "Không tìm thấy đơn phụ kiện"));
    }

    if (order.paymentMethod !== "ZALOPAY") {
      return next(new ApiError(400, "Đơn này không dùng ZaloPay"));
    }

    if (!order.appTransId) {
      return next(new ApiError(400, "Đơn chưa có appTransId"));
    }

    if (!ZP_APP_ID || !ZP_KEY1) {
      return next(new ApiError(500, "Chưa cấu hình ZaloPay trong file .env"));
    }

    // =========================================================
    // KIỂM TRA HẾT HẠN GIỮ KHO NỘI BỘ
    // Dù QR ZaloPay có thể còn 15 phút,
    // nhưng hệ thống phụ kiện của mình chỉ giữ kho tạm trong X phút.
    // Quá thời gian này mà chưa thanh toán thành công thì fail đơn và hoàn kho.
    // =========================================================
    const expiredMs = ZALOPAY_PENDING_EXPIRE_MINUTES * 60 * 1000;
    const orderAgeMs = Date.now() - new Date(order.createdAt).getTime();
    const isExpired = orderAgeMs > expiredMs;

    if (
      order.paymentStatus === "Chưa thanh toán" &&
      order.stockReserved === true &&
      isExpired
    ) {
      order.paymentStatus = "Thanh toán thất bại";
      await order.save();
      await releaseReservedStock(order);

      return res.send({
        message: `Đơn đã hết hạn thanh toán sau ${ZALOPAY_PENDING_EXPIRE_MINUTES} phút`,
        paymentStatus: order.paymentStatus,
        zaloResponse: {
          expired_by_system: true,
          expired_minutes: ZALOPAY_PENDING_EXPIRE_MINUTES,
        },
      });
    }

    const app_id = ZP_APP_ID;
    const app_trans_id = order.appTransId;
    const dataForMac = `${app_id}|${app_trans_id}|${ZP_KEY1}`;
    const mac = createHmacSha256(dataForMac, ZP_KEY1);

    const response = await axios.post(
      ZP_QUERY_URL,
      new URLSearchParams({
        app_id,
        app_trans_id,
        mac,
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const data = response.data || {};

    if (Number(data.return_code) === 1) {
      order.paymentStatus = "Đã thanh toán";
      if (data.zp_trans_id) {
        order.zpTransId = String(data.zp_trans_id);
      }
      await order.save();
    } else if (Number(data.return_code) !== 2) {
      order.paymentStatus = "Thanh toán thất bại";
      await order.save();

      await releaseReservedStock(order);
    }

    return res.send({
      message: "Kiểm tra trạng thái ZaloPay thành công",
      paymentStatus: order.paymentStatus,
      zaloResponse: data,
    });
  } catch (error) {
    console.error("Lỗi query ZaloPay status:", error);
    return next(
      new ApiError(
        500,
        "Lỗi kiểm tra trạng thái ZaloPay: " +
          (error.response?.data?.return_message || error.message)
      )
    );
  }
};

// ============================================================
// Khách chỉ thấy:
// - COD
// - ZALOPAY đã thanh toán
// ============================================================
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
      if (
        order.paymentMethod === "ZALOPAY" &&
        order.paymentStatus !== "Đã thanh toán"
      ) {
        continue;
      }

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
    return next(
      new ApiError(500, "Lỗi khi lấy lịch sử đơn phụ kiện: " + error.message)
    );
  }
};

// ============================================================
// Admin chỉ thấy:
// - tất cả đơn COD
// - ZALOPAY đã thanh toán
// ============================================================
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
      if (
        order.paymentMethod === "ZALOPAY" &&
        order.paymentStatus !== "Đã thanh toán"
      ) {
        continue;
      }

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
    return next(
      new ApiError(500, "Lỗi khi lấy danh sách đơn phụ kiện: " + error.message)
    );
  }
};

// ============================================================
// updateStatus:
// - COD hoàn thành => Đã thanh toán
// - hủy đơn => hoàn kho nếu đang giữ kho
// ============================================================
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
      if (
        order.paymentMethod === "ZALOPAY" &&
        order.paymentStatus !== "Đã thanh toán"
      ) {
        order.paymentStatus = "Thanh toán thất bại";
      }

      await order.save();
      await releaseReservedStock(order);
    }

    order.status = status;

    if (order.paymentMethod === "COD") {
      if (status === "Hoàn thành") {
        order.paymentStatus = "Đã thanh toán";
      } else if (order.paymentStatus !== "Đã thanh toán") {
        order.paymentStatus = "Chưa thanh toán";
      }
    }

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

// ============================================================
// Xem chi tiết 1 đơn
// ============================================================
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

// ============================================================
// Khách hủy đơn:
// - nếu đang giữ kho thì hoàn lại
// ============================================================
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

    order.status = "Đã hủy";

    if (order.paymentMethod === "ZALOPAY" && order.paymentStatus !== "Đã thanh toán") {
      order.paymentStatus = "Thanh toán thất bại";
    }

    await order.save();
    await releaseReservedStock(order);

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