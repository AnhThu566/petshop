const Order = require("../models/order.model");
const Dog = require("../models/dog.model");
const ApiError = require("../api-error");
const OrderHistory = require("../models/orderHistory.model");
const DogHistory = require("../models/dogHistory.model");
const DogCareRecord = require("../models/dogCareRecord.model");
const DogReminder = require("../models/dogReminder.model");
const Notification = require("../models/notification.model");
const DogHealthRecord = require("../models/dogHealthRecord.model");

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

const createInitialDogReminders = async ({ order, dog, careRecord, req }) => {
  const actorId = req.user?._id || req.user?.id || null;

  const reminders = [
    {
      reminderType: "Tái khám",
      title: `Tái khám sau bàn giao cho bé ${dog.name}`,
      description: "Nhắc khách đưa bé quay lại tái khám sau khi nhận chó.",
      reminderDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isRecurring: false,
      repeatEveryDays: 0,
    },
  ];

  const latestHealthRecord = await DogHealthRecord.findOne({ dogId: dog._id }).sort({
    checkedAt: -1,
    createdAt: -1,
  });

  if (latestHealthRecord?.nextDewormingDate) {
    reminders.push({
      reminderType: "Tẩy giun",
      title: `Nhắc tẩy giun cho bé ${dog.name}`,
      description: "Nhắc khách tẩy giun định kỳ cho bé.",
      reminderDate: latestHealthRecord.nextDewormingDate,
      isRecurring: true,
      repeatEveryDays: 30,
    });
  } else {
    reminders.push({
      reminderType: "Tẩy giun",
      title: `Nhắc tẩy giun định kỳ cho bé ${dog.name}`,
      description: "Nhắc khách theo dõi lịch tẩy giun định kỳ sau bán.",
      reminderDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isRecurring: true,
      repeatEveryDays: 30,
    });
  }

  if (latestHealthRecord?.vaccines?.length) {
    for (const vaccine of latestHealthRecord.vaccines) {
      if (vaccine?.needsReminder && vaccine?.nextDueDate) {
        reminders.push({
          reminderType: "Tiêm vaccine",
          title: `Nhắc ${vaccine.vaccineName} cho bé ${dog.name}`,
          description:
            vaccine.note || `Nhắc lịch tiêm vaccine ${vaccine.vaccineName}.`,
          reminderDate: vaccine.nextDueDate,
          isRecurring: false,
          repeatEveryDays: 0,
        });
      }
    }
  }

  const created = [];

  for (const item of reminders) {
    const existed = await DogReminder.findOne({
      dogId: dog._id,
      customerId: order.userId,
      reminderType: item.reminderType,
      title: item.title,
      reminderDate: item.reminderDate,
    });

    if (!existed) {
      const reminder = await DogReminder.create({
        dogId: dog._id,
        customerId: order.userId,
        orderId: order._id,
        careRecordId: careRecord?._id || null,
        reminderType: item.reminderType,
        title: item.title,
        description: item.description,
        reminderDate: item.reminderDate,
        status: "Chờ nhắc",
        isRecurring: item.isRecurring,
        repeatEveryDays: item.repeatEveryDays,
        createdBy: actorId,
      });

      created.push(reminder);
    }
  }

  return created;
};

const createCustomerNotificationAfterSale = async ({ order, dog }) => {
  return await Notification.create({
    userId: order.userId,
    title: `Hoàn tất bàn giao bé ${dog.name}`,
    message:
      `Đơn hàng của bạn đã hoàn thành. Hệ thống đã tạo hồ sơ theo dõi sau bán ` +
      `và lịch nhắc chăm sóc cho bé ${dog.name}.`,
    type: "DOG_CARE_UPDATE",
    targetRole: "customer",
    relatedId: String(order._id),
    relatedModel: "Order",
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

// 1. Khách tạo đơn đặt cọc
exports.createDeposit = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(new ApiError(401, "Bạn chưa đăng nhập"));
    }

    const userId = req.user._id || req.user.id;

    const {
      customerName,
      customerPhone,
      customerAddress,
      dogId,
      farmId,
      note,
      paymentMethod,
      paymentProof,
    } = req.body;

    if (
      !customerName ||
      !customerPhone ||
      !customerAddress ||
      !dogId ||
      !farmId
    ) {
      return next(new ApiError(400, "Thiếu thông tin tạo đơn đặt cọc"));
    }

    const dog = await Dog.findById(dogId);
    if (!dog) {
      return next(new ApiError(404, "Không tìm thấy bé chó cần đặt cọc"));
    }

    if (dog.approvalStatus !== "Đã duyệt") {
      return next(new ApiError(400, "Bé chó này chưa được duyệt để mở bán"));
    }

    if (dog.saleStatus !== "Sẵn sàng bán") {
      return next(
        new ApiError(
          400,
          "Bé chó này hiện không còn ở trạng thái sẵn sàng đặt cọc. Vui lòng tải lại trang."
        )
      );
    }

    if (!dog.isPublished || !dog.sourceVerified || !dog.eligibleForSale) {
      return next(
        new ApiError(400, "Bé chó này hiện chưa đủ điều kiện giao dịch")
      );
    }

    const realFarmId = dog.farmId?._id || dog.farmId;
    if (String(realFarmId) !== String(farmId)) {
      return next(
        new ApiError(400, "Thông tin trang trại không khớp với bé chó này")
      );
    }

    const activeOrder = await Order.findOne({
      dogId,
      status: { $in: ACTIVE_ORDER_STATUSES },
    });

    if (activeOrder) {
      return next(new ApiError(400, "Bé chó này đang có người đặt trước"));
    }

    const parsedTotalPrice = Number(dog.price);
    if (!parsedTotalPrice || parsedTotalPrice <= 0) {
      return next(new ApiError(400, "Giá bé chó không hợp lệ"));
    }

    const finalPaymentMethod = paymentMethod || "Chuyển khoản";
    if (!["Chuyển khoản", "Tiền mặt"].includes(finalPaymentMethod)) {
      return next(new ApiError(400, "Phương thức thanh toán cọc không hợp lệ"));
    }

    if (
      finalPaymentMethod === "Chuyển khoản" &&
      (!paymentProof || !String(paymentProof).trim())
    ) {
      return next(
        new ApiError(
          400,
          "Vui lòng cung cấp minh chứng chuyển khoản để gửi yêu cầu đặt cọc"
        )
      );
    }

    const depositAmount =
      dog.depositAmount && Number(dog.depositAmount) > 0
        ? Number(dog.depositAmount)
        : Math.round(parsedTotalPrice * 0.3);

    const remainingAmount = parsedTotalPrice - depositAmount;

    const paymentStatus =
      finalPaymentMethod === "Chuyển khoản"
        ? "Đã gửi minh chứng"
        : "Chưa thanh toán";

    const newOrder = new Order({
      userId,
      customerName: String(customerName).trim(),
      customerPhone: String(customerPhone).trim(),
      customerAddress: String(customerAddress).trim(),
      dogId,
      farmId: realFarmId,
      totalPrice: parsedTotalPrice,
      depositAmount,
      remainingAmount,
      paymentMethod: finalPaymentMethod,
      paymentProof: paymentProof ? String(paymentProof).trim() : "",
      paymentStatus,
      note: note ? String(note).trim() : "",
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
      newPaymentStatus: paymentStatus,
      req,
      note: "Khách hàng tạo đơn đặt cọc mới",
    });

    await createDogHistory({
      dogId: dog._id,
      oldStatus: oldDogSaleStatus,
      newStatus: "Chờ thanh toán",
      req,
      note: "Khách hàng tạo yêu cầu đặt cọc",
    });

    return res.send({
      message:
        "Tạo yêu cầu đặt cọc thành công! Đơn của bạn đang chờ admin xác nhận khoản cọc.",
      order: newOrder,
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi tạo đơn cọc: " + error.message));
  }
};

// 2. Admin lấy tất cả đơn
exports.findAll = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate(
        "dogId",
        "name image maCho price approvalStatus saleStatus isPublished"
      )
      .populate("farmId", "name")
      .populate("userId", "username fullName phone")
      .sort({ createdAt: -1 });

    return res.send(orders);
  } catch (error) {
    return next(
      new ApiError(500, "Lỗi khi lấy danh sách đơn cọc: " + error.message)
    );
  }
};

// 3. Admin cập nhật trạng thái đơn
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

    if (status === "Đã nhận cọc") {
      if (
        order.paymentMethod === "Chuyển khoản" &&
        (!order.paymentProof || !String(order.paymentProof).trim())
      ) {
        return next(
          new ApiError(
            400,
            "Không thể xác nhận cọc vì đơn chưa có minh chứng chuyển khoản"
          )
        );
      }

      order.paymentStatus = "Đã xác nhận";
      dog.saleStatus = "Đã đặt cọc";
      dog.isPublished = true;
    }

    if (status === "Đang giao") {
      if (oldStatus !== "Đã nhận cọc") {
        return next(
          new ApiError(400, "Chỉ được giao chó sau khi đã xác nhận cọc")
        );
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
    }

    if (status === "Đã hủy") {
      if (!ACTIVE_ORDER_STATUSES.includes(oldStatus)) {
        return next(
          new ApiError(400, "Không thể hủy đơn ở trạng thái hiện tại")
        );
      }

      dog.saleStatus = "Sẵn sàng bán";
      dog.isPublished = true;
    }

    order.status = status;

    await order.save();
    await dog.save();

    let careRecord = null;

    if (status === "Hoàn thành") {
      careRecord = await createDogCareRecordAfterSale({ order, dog, req });

      await createInitialDogReminders({
        order,
        dog,
        careRecord,
        req,
      });

      await createCustomerNotificationAfterSale({ order, dog });
    }

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
          ? "Hoàn thành đơn hàng thành công! Hệ thống đã tạo hồ sơ theo dõi sau bán và lịch nhắc ban đầu."
          : "Cập nhật trạng thái đơn hàng thành công!",
      order,
      careRecord: careRecord || null,
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi cập nhật đơn hàng: " + error.message));
  }
};

// 4. Khách tự hủy đơn
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
      dog.saleStatus = "Sẵn sàng bán";
      dog.isPublished = true;
      await dog.save();
    }

    order.status = "Đã hủy";
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

    if (dog) {
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

// 5. Khách xem đơn của chính mình
exports.findMyOrders = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(new ApiError(401, "Bạn chưa đăng nhập"));
    }

    const currentUserId = req.user._id || req.user.id;

    const orders = await Order.find({ userId: currentUserId })
      .populate(
        "dogId",
        "name image maCho price approvalStatus saleStatus isPublished"
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