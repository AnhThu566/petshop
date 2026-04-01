const Order = require("../models/order.model");
const Dog = require("../models/dog.model");
const ApiError = require("../api-error");
const OrderHistory = require("../models/orderHistory.model");
const DogHistory = require("../models/dogHistory.model");

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

// 1. Khách tạo đơn đặt cọc
exports.createDeposit = async (req, res, next) => {
  try {
    const {
      userId,
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
      !userId ||
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

    // Chỉ cho đặt cọc khi chó đã được duyệt
    if (dog.status !== "Đã duyệt") {
      return next(
        new ApiError(
          400,
          "Bé chó này hiện không còn ở trạng thái sẵn sàng đặt cọc. Vui lòng tải lại trang."
        )
      );
    }

    // Đối chiếu farmId gửi từ frontend với farmId thật của bé chó
    const realFarmId = dog.farmId?._id || dog.farmId;
    if (String(realFarmId) !== String(farmId)) {
      return next(
        new ApiError(400, "Thông tin trang trại không khớp với bé chó này")
      );
    }

    // Một bé chó chỉ được có 1 đơn đang hoạt động
    const activeOrder = await Order.findOne({
      dogId,
      status: { $in: ["Chờ xác nhận cọc", "Đã nhận cọc", "Đang giao"] },
    });

    if (activeOrder) {
      return next(new ApiError(400, "Bé chó này đang có người đặt trước"));
    }

    // Luôn lấy giá từ DB, không tin totalPrice từ frontend
    const parsedTotalPrice = Number(dog.price);
    if (!parsedTotalPrice || parsedTotalPrice <= 0) {
      return next(new ApiError(400, "Giá bé chó không hợp lệ"));
    }

    const finalPaymentMethod = paymentMethod || "Chuyển khoản";

    if (!["Chuyển khoản", "Tiền mặt"].includes(finalPaymentMethod)) {
      return next(new ApiError(400, "Phương thức thanh toán cọc không hợp lệ"));
    }

    // Nếu chuyển khoản thì bắt buộc phải có minh chứng
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

    const depositAmount = Math.round(parsedTotalPrice * 0.3);
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

    const oldDogStatus = dog.status;

    // Khi tạo đơn cọc thì chó chuyển sang chờ thanh toán
    dog.status = "Chờ thanh toán";
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
      oldStatus: oldDogStatus,
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

// 2. Lấy tất cả đơn
exports.findAll = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate("dogId", "name image maCho price status")
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

    const validOrderStatuses = [
      "Chờ xác nhận cọc",
      "Đã nhận cọc",
      "Đang giao",
      "Hoàn thành",
      "Đã hủy",
    ];

    if (!validOrderStatuses.includes(status)) {
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
    const oldDogStatus = dog.status;

    // Không đổi nếu trạng thái giống nhau
    if (oldStatus === status) {
      return res.send({
        message: "Trạng thái đơn không thay đổi.",
        order,
      });
    }

    // Đơn hoàn thành thì khóa
    if (oldStatus === "Hoàn thành") {
      return next(
        new ApiError(400, "Đơn đã hoàn thành không thể thay đổi trạng thái")
      );
    }

    // Đơn đã hủy thì khóa
    if (oldStatus === "Đã hủy") {
      return next(
        new ApiError(400, "Đơn đã hủy không thể chuyển sang trạng thái khác")
      );
    }

    // Chỉ cho chuyển trạng thái theo luồng đúng
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

    // Xác nhận đã nhận cọc
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
      dog.status = "Đã đặt cọc";
    }

    // Bắt đầu giao chó
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

      dog.status = "Đang giao";
    }

    // Hoàn thành đơn
    if (status === "Hoàn thành") {
      if (oldStatus !== "Đang giao") {
        return next(
          new ApiError(400, "Chỉ được hoàn thành khi đơn đang giao")
        );
      }

      dog.status = "Đã bán";
    }

    // Hủy đơn
    if (status === "Đã hủy") {
      if (!["Chờ xác nhận cọc", "Đã nhận cọc", "Đang giao"].includes(oldStatus)) {
        return next(
          new ApiError(400, "Không thể hủy đơn ở trạng thái hiện tại")
        );
      }

      dog.status = "Đã duyệt";
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

    if (oldDogStatus !== dog.status) {
      await createDogHistory({
        dogId: dog._id,
        oldStatus: oldDogStatus,
        newStatus: dog.status,
        req,
        note: `Đồng bộ theo trạng thái đơn: ${order.status}`,
      });
    }

    return res.send({
      message: "Cập nhật trạng thái đơn hàng thành công!",
      order,
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

    // Khách chỉ được tự hủy khi đang chờ xác nhận cọc
    if (order.status !== "Chờ xác nhận cọc") {
      return next(
        new ApiError(400, "Bạn chỉ có thể tự hủy đơn khi đang chờ xác nhận cọc")
      );
    }

    const oldOrderStatus = order.status;
    const oldPaymentStatus = order.paymentStatus;

    const dog = await Dog.findById(order.dogId);
    let oldDogStatus = "";

    if (dog) {
      oldDogStatus = dog.status;
      dog.status = "Đã duyệt";
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
        oldStatus: oldDogStatus,
        newStatus: "Đã duyệt",
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

// 5. Tìm đơn theo số điện thoại
exports.findByPhone = async (req, res, next) => {
  try {
    const { phone } = req.params;
    const orders = await Order.find({ customerPhone: phone })
      .populate("dogId", "name image maCho price status")
      .populate("farmId", "name")
      .sort({ createdAt: -1 });

    return res.send(orders);
  } catch (error) {
    return next(
      new ApiError(500, "Lỗi khi tra cứu lịch sử đặt cọc: " + error.message)
    );
  }
};

// 6. Tìm đơn theo userId
exports.findByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId })
      .populate("dogId", "name image maCho price status")
      .populate("farmId", "name")
      .sort({ createdAt: -1 });

    return res.send(orders);
  } catch (error) {
    return next(
      new ApiError(500, "Lỗi khi tải lịch sử đơn hàng của bạn: " + error.message)
    );
  }
};