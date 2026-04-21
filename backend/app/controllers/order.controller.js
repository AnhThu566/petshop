const Order = require("../models/order.model");
const Dog = require("../models/dog.model");
const ApiError = require("../api-error");
const OrderHistory = require("../models/orderHistory.model");
const DogHistory = require("../models/dogHistory.model");

const axios = require("axios");
const crypto = require("crypto");
const qs = require("qs");

const getActorInfo = (req) => {
  const actorId = req.user?._id || req.user?.id || null;
  const actorName =
    req.user?.fullName ||
    req.user?.username ||
    req.user?.name ||
    req.user?.email ||
    "Hệ thống";

  return { actorId, actorName };
};

const createOrderHistory = async ({
  orderId,
  oldStatus = "",
  newStatus,
  oldPaymentStatus = "",
  newPaymentStatus = "",
  req,
  reason = "",
  note = "",
}) => {
  const { actorId, actorName } = getActorInfo(req);

  await OrderHistory.create({
    orderId,
    oldStatus,
    newStatus,
    oldPaymentStatus,
    newPaymentStatus,
    changedBy: actorId,
    changedByName: actorName,
    reason,
    note,
  });
};

const createDogHistory = async ({
  dogId,
  oldStatus = "",
  newStatus,
  req,
  reason = "",
  note = "",
}) => {
  const { actorId, actorName } = getActorInfo(req);

  await DogHistory.create({
    dogId,
    oldStatus,
    newStatus,
    changedBy: actorId,
    changedByName: actorName,
    reason,
    note,
  });
};

const ACTIVE_ORDER_STATUSES = ["Chờ xác nhận cọc", "Đã nhận cọc", "Đang giao"];
const VALID_ORDER_STATUSES = [
  "Chờ xác nhận cọc",
  "Đã nhận cọc",
  "Đang giao",
  "Hoàn thành",
  "Đã hủy",
];

const normalizePhone = (value) => String(value || "").trim();
const normalizeText = (value) => String(value || "").trim();
const getDogSalePrice = (dog) => Number(dog?.finalPrice || dog?.price || 0);

const isDogReservable = (dog) => {
  return (
    dog &&
    dog.approvalStatus === "Đã duyệt" &&
    dog.saleStatus === "Sẵn sàng bán" &&
    dog.isPublished === true
  );
};

const isPendingZaloPayOrder = (order) => {
  return (
    order &&
    order.paymentMethod === "ZaloPay" &&
    order.status === "Chờ xác nhận cọc" &&
    order.paymentStatus === "Chờ thanh toán"
  );
};

/* =========================
   ZALOPAY HELPERS
========================= */

const ZALOPAY_CONFIG = {
  appId: process.env.ZALOPAY_APP_ID,
  key1: process.env.ZALOPAY_KEY1,
  key2: process.env.ZALOPAY_KEY2,
  createOrderUrl:
    process.env.ZALOPAY_CREATE_URL || "https://sb-openapi.zalopay.vn/v2/create",
  queryOrderUrl:
    process.env.ZALOPAY_QUERY_URL || "https://sb-openapi.zalopay.vn/v2/query",
  callbackUrl: process.env.ZALOPAY_CALLBACK_URL_DOG || "",
  returnUrl: process.env.ZALOPAY_REDIRECT_URL_DOG || "",
};

const generateAppTransId = () => {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const random = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  return `${yy}${mm}${dd}_${random}`;
};

const createHmacSHA256 = (data, key) =>
  crypto.createHmac("sha256", key).update(data).digest("hex");

const createZaloPayOrder = async ({ order, dog, userId }) => {
  if (!ZALOPAY_CONFIG.appId || !ZALOPAY_CONFIG.key1 || !ZALOPAY_CONFIG.key2) {
    throw new Error("Thiếu cấu hình ZaloPay trong biến môi trường");
  }

  const app_trans_id = generateAppTransId();
  const app_time = Date.now();
  const amount = Math.round(Number(order.depositAmount || 0));

  if (!amount || amount <= 0) {
    throw new Error("Số tiền đặt cọc không hợp lệ để tạo thanh toán ZaloPay");
  }

  const item = JSON.stringify([
    {
      id: String(dog._id),
      name: `Dat coc cho ${dog.name || "Pet"}`,
      price: amount,
      quantity: 1,
    },
  ]);

  const embed_data = JSON.stringify({
    redirecturl: ZALOPAY_CONFIG.returnUrl || "",
    preferred_payment_method: [],
  });

  const orderPayload = {
    app_id: Number(ZALOPAY_CONFIG.appId),
    app_user: String(userId || "petshop_customer"),
    app_time,
    amount,
    app_trans_id,
    item,
    embed_data,
    description: `PetShop dat coc ${app_trans_id}`,
    bank_code: "",
    callback_url: ZALOPAY_CONFIG.callbackUrl,
  };

  const dataForMac = [
    orderPayload.app_id,
    orderPayload.app_trans_id,
    orderPayload.app_user,
    orderPayload.amount,
    orderPayload.app_time,
    orderPayload.embed_data,
    orderPayload.item,
  ].join("|");

  orderPayload.mac = createHmacSHA256(dataForMac, ZALOPAY_CONFIG.key1);

  const response = await axios.post(
    ZALOPAY_CONFIG.createOrderUrl,
    qs.stringify(orderPayload),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      timeout: 15000,
    }
  );

  return {
    zaloRaw: response.data,
    appTransId: app_trans_id,
  };
};

const markOrderPaidByZaloPay = async ({
  order,
  dog,
  zpTransId,
  reqLike = {},
}) => {
  const oldStatus = order.status;
  const oldPaymentStatus = order.paymentStatus;
  const oldDogSaleStatus = dog.saleStatus;

  // Giống luồng phụ kiện: đã thanh toán nhưng vẫn chờ admin xử lý tiếp
  order.status = "Chờ xác nhận cọc";
  order.paymentStatus = "Đã xác nhận";
  order.paymentMethod = "ZaloPay";
  order.paymentProvider = "ZALOPAY";
  order.paymentTransactionId = String(zpTransId || "");
  order.paidAt = new Date();
  order.callbackAt = new Date();

  dog.saleStatus = "Đã đặt cọc";
  dog.isPublished = true;

  await order.save();
  await dog.save();

  await createOrderHistory({
    orderId: order._id,
    oldStatus,
    newStatus: order.status,
    oldPaymentStatus,
    newPaymentStatus: order.paymentStatus,
    req: reqLike,
    note: "ZaloPay xác nhận thanh toán cọc thành công",
  });

  if (oldDogSaleStatus !== dog.saleStatus) {
    await createDogHistory({
      dogId: dog._id,
      oldStatus: oldDogSaleStatus,
      newStatus: dog.saleStatus,
      req: reqLike,
      note: "Đồng bộ trạng thái chó sau khi ZaloPay thanh toán thành công",
    });
  }
};

const revertPendingZaloPayOrderIfNeeded = async ({
  order,
  dog,
  reason = "Thanh toán thất bại hoặc khách hủy giao dịch",
  reqLike = {},
}) => {
  const oldStatus = order.status;
  const oldPaymentStatus = order.paymentStatus;
  const oldDogSaleStatus = dog.saleStatus;

  if (order.status === "Đã hủy" || order.status === "Hoàn thành") return;

  order.status = "Đã hủy";
  order.paymentStatus = "Thanh toán thất bại";

  dog.saleStatus = "Sẵn sàng bán";
  dog.isPublished = true;

  await order.save();
  await dog.save();

  await createOrderHistory({
    orderId: order._id,
    oldStatus,
    newStatus: order.status,
    oldPaymentStatus,
    newPaymentStatus: order.paymentStatus,
    req: reqLike,
    reason,
    note: "Hủy đơn cọc ZaloPay do giao dịch không thành công",
  });

  if (oldDogSaleStatus !== dog.saleStatus) {
    await createDogHistory({
      dogId: dog._id,
      oldStatus: oldDogSaleStatus,
      newStatus: dog.saleStatus,
      req: reqLike,
      note: "Hoàn trạng thái mở bán vì thanh toán ZaloPay không thành công",
    });
  }
};

/* =========================
   1. KHÓA LUỒNG ĐẶT CỌC THỦ CÔNG
========================= */

exports.createDeposit = async (req, res, next) => {
  return next(
    new ApiError(400, "Hệ thống chỉ hỗ trợ đặt cọc chó qua ZaloPay.")
  );
};

/* =========================
   1B. KHÁCH TẠO ĐƠN ĐẶT CỌC BẰNG ZALOPAY
========================= */

exports.createDepositZaloPay = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(new ApiError(401, "Bạn chưa đăng nhập"));
    }

    const userId = req.user._id || req.user.id;
    const { customerName, customerPhone, customerAddress, dogId, note } = req.body;

    if (!customerName || !customerPhone || !customerAddress || !dogId) {
      return next(new ApiError(400, "Thiếu thông tin tạo đơn đặt cọc"));
    }

    const dog = await Dog.findById(dogId);
    if (!dog) {
      return next(new ApiError(404, "Không tìm thấy bé chó cần đặt cọc"));
    }

    if (!isDogReservable(dog)) {
      return next(
        new ApiError(
          400,
          "Bé chó này hiện không còn đủ điều kiện đặt cọc. Vui lòng tải lại trang."
        )
      );
    }

    // Nếu đã có đơn pending của chính khách thì trả lại đơn cũ
    // Nếu đã có người khác đặt trước thì chặn
    const existingOrders = await Order.find({
      dogId,
      status: { $in: ACTIVE_ORDER_STATUSES },
    }).sort({ createdAt: -1 });

    for (const existingOrder of existingOrders) {
      if (isPendingZaloPayOrder(existingOrder)) {
        if (String(existingOrder.userId) === String(userId)) {
          return res.send({
            message: "Bạn đang có một đơn ZaloPay chưa hoàn tất cho bé này",
            order: existingOrder,
            payment: {
              provider: "ZALOPAY",
              app_trans_id: existingOrder.paymentProviderOrderId || "",
              order_url: existingOrder.paymentUrl || "",
              zp_trans_token: "",
              qr_code: existingOrder.qrCode || "",
            },
          });
        }

        return next(new ApiError(400, "Bé chó này đang có người đặt trước"));
      }

      if (["Đã nhận cọc", "Đang giao"].includes(existingOrder.status)) {
        return next(new ApiError(400, "Bé chó này đang có người đặt trước"));
      }
    }

    const realFarmId = dog.farmId?._id || dog.farmId;
    const parsedTotalPrice = getDogSalePrice(dog);

    if (!parsedTotalPrice || parsedTotalPrice <= 0) {
      return next(new ApiError(400, "Giá bán của bé chó không hợp lệ."));
    }

    const depositAmount =
      dog.depositAmount && Number(dog.depositAmount) > 0
        ? Number(dog.depositAmount)
        : Math.round(parsedTotalPrice * 0.3);

    const remainingAmount = parsedTotalPrice - depositAmount;

    const newOrder = new Order({
      userId,
      customerName: normalizeText(customerName),
      customerPhone: normalizePhone(customerPhone),
      customerAddress: normalizeText(customerAddress),
      dogId,
      farmId: realFarmId,
      totalPrice: parsedTotalPrice,
      depositAmount,
      remainingAmount,
      paymentMethod: "ZaloPay",
      paymentProvider: "ZALOPAY",
      paymentStatus: "Chờ thanh toán",
      note: note ? normalizeText(note) : "",
      status: "Chờ xác nhận cọc",
    });

    await newOrder.save();

    const oldDogSaleStatus = dog.saleStatus;
    dog.saleStatus = "Chờ thanh toán";
    dog.isPublished = true;
    await dog.save();

    await createOrderHistory({
      orderId: newOrder._id,
      oldStatus: "",
      newStatus: "Chờ xác nhận cọc",
      oldPaymentStatus: "",
      newPaymentStatus: "Chờ thanh toán",
      req,
      note: "Khách hàng tạo đơn đặt cọc qua ZaloPay",
    });

    await createDogHistory({
      dogId: dog._id,
      oldStatus: oldDogSaleStatus,
      newStatus: "Chờ thanh toán",
      req,
      note: "Khách hàng khởi tạo thanh toán đặt cọc qua ZaloPay",
    });

    const { zaloRaw, appTransId } = await createZaloPayOrder({
      order: newOrder,
      dog,
      userId,
    });

    newOrder.paymentProviderOrderId = appTransId;
    newOrder.paymentUrl = zaloRaw.order_url || "";
    newOrder.qrCode = zaloRaw.qr_code || "";
    await newOrder.save();

    if (Number(zaloRaw.return_code) !== 1) {
      await revertPendingZaloPayOrderIfNeeded({
        order: newOrder,
        dog,
        reason: zaloRaw.return_message || "Không tạo được phiên thanh toán ZaloPay",
        reqLike: req,
      });

      return next(
        new ApiError(
          400,
          zaloRaw.return_message || "Không thể khởi tạo thanh toán ZaloPay"
        )
      );
    }

    return res.send({
      message: "Tạo phiên thanh toán ZaloPay thành công",
      order: newOrder,
      payment: {
        provider: "ZALOPAY",
        app_trans_id: appTransId,
        order_url: zaloRaw.order_url || "",
        zp_trans_token: zaloRaw.zp_trans_token || "",
        qr_code: zaloRaw.qr_code || "",
      },
    });
  } catch (error) {
    console.error("CREATE_DEPOSIT_ZALOPAY_ERROR =", error);
    console.error("CREATE_DEPOSIT_ZALOPAY_STACK =", error.stack);
    return next(
      new ApiError(500, "Lỗi khi tạo đơn cọc ZaloPay: " + error.message)
    );
  }
};

/* =========================
   1C. CALLBACK ZALOPAY
========================= */

exports.zalopayCallback = async (req, res) => {
  try {
    const { data, mac } = req.body || {};

    if (!data || !mac) {
      return res.send({ return_code: -1, return_message: "Missing data" });
    }

    const expectedMac = createHmacSHA256(data, ZALOPAY_CONFIG.key2);

    if (expectedMac !== mac) {
      return res.send({ return_code: -1, return_message: "Invalid mac" });
    }

    const callbackData = JSON.parse(data);
    const appTransId = callbackData.app_trans_id;
    const zpTransId = callbackData.zp_trans_id;

    const order = await Order.findOne({
      paymentProviderOrderId: appTransId,
    });

    if (!order) {
      return res.send({
        return_code: 1,
        return_message: "Order not found but callback accepted",
      });
    }

    if (order.paymentStatus === "Đã xác nhận") {
      return res.send({ return_code: 1, return_message: "Order already updated" });
    }

    const dog = await Dog.findById(order.dogId);
    if (!dog) {
      return res.send({ return_code: 1, return_message: "Dog not found" });
    }

    await markOrderPaidByZaloPay({
      order,
      dog,
      zpTransId,
      reqLike: {
        user: {
          name: "ZaloPay Callback",
          email: "zalopay@system.local",
        },
      },
    });

    return res.send({ return_code: 1, return_message: "Success" });
  } catch (error) {
    console.error("ZALOPAY_CALLBACK_ERROR =", error);
    return res.send({ return_code: 0, return_message: error.message });
  }
};

/* =========================
   1D. QUERY TRẠNG THÁI THANH TOÁN ZALOPAY
========================= */

exports.queryZaloPayOrderStatus = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(new ApiError(401, "Bạn chưa đăng nhập"));
    }

    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return next(new ApiError(404, "Không tìm thấy đơn hàng"));
    }

    const currentUserId = req.user._id || req.user.id;
    const orderUserId = order.userId?._id || order.userId;

    if (
      String(orderUserId) !== String(currentUserId) &&
      req.user.role !== "admin"
    ) {
      return next(new ApiError(403, "Bạn không có quyền xem đơn này"));
    }

    if (order.paymentMethod !== "ZaloPay" || !order.paymentProviderOrderId) {
      return next(new ApiError(400, "Đơn này không phải thanh toán bằng ZaloPay"));
    }

    const dog = await Dog.findById(order.dogId);

    const app_id = Number(ZALOPAY_CONFIG.appId);
    const app_trans_id = order.paymentProviderOrderId;
    const key1 = ZALOPAY_CONFIG.key1;

    const dataForMac = `${app_id}|${app_trans_id}|${key1}`;
    const mac = createHmacSHA256(dataForMac, key1);

    const response = await axios.post(
      ZALOPAY_CONFIG.queryOrderUrl,
      qs.stringify({
        app_id,
        app_trans_id,
        mac,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        timeout: 15000,
      }
    );

    const zaloData = response.data || {};

    if (Number(zaloData.return_code) === 1 && Number(zaloData.is_processing) === 0) {
      if (zaloData.amount && Number(zaloData.amount) >= Number(order.depositAmount || 0)) {
        if (dog) {
          await markOrderPaidByZaloPay({
            order,
            dog,
            zpTransId: zaloData.zp_trans_id || "",
            reqLike: req,
          });
        }
      }
    } else if (Number(zaloData.return_code) !== 1 && dog) {
      if (order.status === "Chờ xác nhận cọc" && order.paymentStatus === "Chờ thanh toán") {
        await revertPendingZaloPayOrderIfNeeded({
          order,
          dog,
          reason: "ZaloPay query cho thấy đơn không thanh toán thành công",
          reqLike: req,
        });
      }
    }

    const refreshedOrder = await Order.findById(order._id)
      .populate(
        "dogId",
        "name image maCho price finalPrice depositAmount approvalStatus saleStatus isPublished"
      )
      .populate("farmId", "name");

    return res.send({
      message: "Kiểm tra trạng thái thanh toán thành công",
      order: refreshedOrder,
      zaloPay: zaloData,
    });
  } catch (error) {
    return next(
      new ApiError(500, "Lỗi khi truy vấn trạng thái ZaloPay: " + error.message)
    );
  }
};

/* =========================
   2. ADMIN LẤY TẤT CẢ ĐƠN
========================= */

exports.findAll = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate(
        "dogId",
        "name image maCho price finalPrice depositAmount approvalStatus saleStatus isPublished"
      )
      .populate("farmId", "name")
      .populate("userId", "username fullName phone email")
      .sort({ createdAt: -1 });

    return res.send(orders);
  } catch (error) {
    return next(
      new ApiError(500, "Lỗi khi lấy danh sách đơn cọc: " + error.message)
    );
  }
};

/* =========================
   3. ADMIN CẬP NHẬT TRẠNG THÁI ĐƠN
========================= */

exports.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!VALID_ORDER_STATUSES.includes(status)) {
      return next(new ApiError(400, "Trạng thái đơn hàng không hợp lệ"));
    }

    const order = await Order.findById(id);
    if (!order) {
      return next(new ApiError(404, "Không tìm thấy đơn hàng"));
    }

    const dog = await Dog.findById(order.dogId);
    if (!dog) {
      return next(new ApiError(404, "Không tìm thấy bé chó của đơn hàng"));
    }

    const oldStatus = order.status;
    const oldPaymentStatus = order.paymentStatus;
    const oldDogSaleStatus = dog.saleStatus;

    if (oldStatus === status) {
      return res.send({
        message: "Trạng thái đơn không thay đổi.",
        order,
      });
    }

    if (oldStatus === "Hoàn thành") {
      return next(
        new ApiError(400, "Đơn đã hoàn thành không thể thay đổi trạng thái")
      );
    }

    if (oldStatus === "Đã hủy") {
      return next(
        new ApiError(400, "Đơn đã hủy không thể chuyển sang trạng thái khác")
      );
    }

    const allowedTransitions = {
      "Chờ xác nhận cọc": ["Đã nhận cọc", "Đã hủy"],
      "Đã nhận cọc": ["Đang giao", "Đã hủy"],
      "Đang giao": ["Hoàn thành", "Đã hủy"],
    };

    if (!allowedTransitions[oldStatus]?.includes(status)) {
      return next(
        new ApiError(
          400,
          `Không thể chuyển đơn từ trạng thái [${oldStatus}] sang [${status}]`
        )
      );
    }

    if (
      status === "Đã nhận cọc" &&
      order.paymentMethod === "ZaloPay" &&
      order.paymentStatus !== "Đã xác nhận"
    ) {
      return next(
        new ApiError(
          400,
          "Đơn ZaloPay chỉ được chuyển sang 'Đã nhận cọc' sau khi hệ thống xác nhận thanh toán thành công."
        )
      );
    }

    if (status === "Đã nhận cọc") {
      order.paymentStatus = "Đã xác nhận";
      dog.saleStatus = "Đã đặt cọc";
      dog.isPublished = true;
    }

    if (status === "Đang giao") {
      if (oldStatus !== "Đã nhận cọc") {
        return next(new ApiError(400, "Chỉ được giao chó sau khi đã nhận cọc"));
      }

      if (order.paymentStatus !== "Đã xác nhận") {
        return next(
          new ApiError(
            400,
            "Không thể chuyển sang đang giao khi khoản cọc chưa được xác nhận"
          )
        );
      }

      dog.saleStatus = "Đang giao";
      dog.isPublished = true;
    }

    if (status === "Hoàn thành") {
      if (oldStatus !== "Đang giao") {
        return next(new ApiError(400, "Chỉ được hoàn thành khi đơn đang giao"));
      }

      dog.saleStatus = "Đã bán";
      dog.isPublished = true;
      order.paymentStatus = "Đã hoàn tất";
      order.remainingAmount = Number(order.remainingAmount || 0);
    }

    if (status === "Đã hủy") {
      if (!ACTIVE_ORDER_STATUSES.includes(oldStatus)) {
        return next(
          new ApiError(400, "Không thể hủy đơn ở trạng thái hiện tại")
        );
      }

      const anotherActiveOrder = await Order.findOne({
        _id: { $ne: order._id },
        dogId: order.dogId,
        status: { $in: ACTIVE_ORDER_STATUSES },
      });

      if (anotherActiveOrder) {
        return next(
          new ApiError(
            400,
            "Không thể hủy đơn vì bé chó đang được ràng buộc với một đơn active khác"
          )
        );
      }

      dog.saleStatus = "Sẵn sàng bán";
      dog.isPublished = true;

      if (oldStatus === "Chờ xác nhận cọc") {
        if (order.paymentMethod === "ZaloPay") {
          order.paymentStatus =
            oldPaymentStatus === "Đã xác nhận"
              ? "Đã xác nhận"
              : "Thanh toán thất bại";
        } else {
          order.paymentStatus = oldPaymentStatus || "Chưa thanh toán";
        }
      }
    }

    order.status = status;

    await order.save();
    await dog.save();

    await createOrderHistory({
      orderId: order._id,
      oldStatus,
      newStatus: order.status,
      oldPaymentStatus,
      newPaymentStatus: order.paymentStatus,
      req,
      note: "Admin cập nhật trạng thái đơn đặt cọc",
    });

    if (oldDogSaleStatus !== dog.saleStatus) {
      await createDogHistory({
        dogId: dog._id,
        oldStatus: oldDogSaleStatus,
        newStatus: dog.saleStatus,
        req,
        note: `Đồng bộ theo trạng thái đơn: ${order.status}`,
      });
    }

    return res.send({
      message:
        status === "Hoàn thành"
          ? "Hoàn thành đơn hàng thành công!"
          : "Cập nhật trạng thái đơn hàng thành công!",
      order,
    });
  } catch (error) {
    console.error("UPDATE_ORDER_STATUS_ERROR =", error);
    console.error("UPDATE_ORDER_STATUS_STACK =", error.stack);
    return next(new ApiError(500, "Lỗi cập nhật đơn hàng: " + error.message));
  }
};

/* =========================
   4. KHÁCH TỰ HỦY ĐƠN
========================= */

exports.cancelByCustomer = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(new ApiError(401, "Bạn chưa đăng nhập"));
    }

    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return next(new ApiError(404, "Không tìm thấy đơn hàng"));
    }

    const currentUserId = req.user._id || req.user.id;
    const orderUserId = order.userId?._id || order.userId;

    if (String(orderUserId) !== String(currentUserId)) {
      return next(new ApiError(403, "Bạn không có quyền hủy đơn này"));
    }

    if (order.status !== "Chờ xác nhận cọc") {
      return next(
        new ApiError(400, "Bạn chỉ có thể tự hủy đơn khi đang chờ xác nhận cọc")
      );
    }

    const oldOrderStatus = order.status;
    const oldPaymentStatus = order.paymentStatus;

    const dog = await Dog.findById(order.dogId);
    let oldDogSaleStatus = "";

    if (dog) {
      oldDogSaleStatus = dog.saleStatus;

      const anotherActiveOrder = await Order.findOne({
        _id: { $ne: order._id },
        dogId: order.dogId,
        status: { $in: ACTIVE_ORDER_STATUSES },
      });

      if (!anotherActiveOrder) {
        dog.saleStatus = "Sẵn sàng bán";
        dog.isPublished = true;
        await dog.save();
      }
    }

    order.status = "Đã hủy";
    order.paymentStatus =
      order.paymentMethod === "ZaloPay"
        ? "Thanh toán thất bại"
        : oldPaymentStatus;

    await order.save();

    await createOrderHistory({
      orderId: order._id,
      oldStatus: oldOrderStatus,
      newStatus: "Đã hủy",
      oldPaymentStatus,
      newPaymentStatus: order.paymentStatus,
      req,
      reason: "Khách hàng tự hủy đơn",
      note: "Hủy đơn khi đang chờ xác nhận cọc",
    });

    if (dog && oldDogSaleStatus !== dog.saleStatus) {
      await createDogHistory({
        dogId: dog._id,
        oldStatus: oldDogSaleStatus,
        newStatus: "Sẵn sàng bán",
        req,
        note: "Khách hủy đơn, chó quay lại trạng thái mở bán",
      });
    }

    return res.send({
      message: "Hủy đơn đặt cọc thành công!",
      order,
    });
  } catch (error) {
    return next(
      new ApiError(500, "Lỗi khi hủy đơn đặt cọc: " + error.message)
    );
  }
};

/* =========================
   5. KHÁCH XEM ĐƠN CỦA CHÍNH MÌNH
========================= */

exports.findMyOrders = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(new ApiError(401, "Bạn chưa đăng nhập"));
    }

    const currentUserId = req.user._id || req.user.id;

    const orders = await Order.find({ userId: currentUserId })
      .populate(
        "dogId",
        "name image maCho price finalPrice depositAmount approvalStatus saleStatus isPublished"
      )
      .populate("farmId", "name")
      .sort({ createdAt: -1 });

    return res.send(orders);
  } catch (error) {
    return next(
      new ApiError(500, "Lỗi khi tải lịch sử đơn hàng của bạn: " + error.message)
    );
  }
};

/* =========================
   6. ADMIN XEM LỊCH SỬ ĐƠN
========================= */

exports.getHistory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return next(new ApiError(404, "Không tìm thấy đơn hàng"));
    }

    const histories = await OrderHistory.find({ orderId: id }).sort({
      createdAt: -1,
    });

    return res.send(histories);
  } catch (error) {
    return next(
      new ApiError(500, "Lỗi khi lấy lịch sử đơn hàng: " + error.message)
    );
  }
};