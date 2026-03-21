const Order = require("../models/order.model");
const Dog = require("../models/dog.model");
const ApiError = require("../api-error");

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
      totalPrice,
      note,
    } = req.body;

    if (
      !userId ||
      !customerName ||
      !customerPhone ||
      !customerAddress ||
      !dogId ||
      !farmId ||
      !totalPrice
    ) {
      return next(new ApiError(400, "Thiếu thông tin tạo đơn đặt cọc"));
    }

    const dog = await Dog.findById(dogId);
    if (!dog) {
      return next(new ApiError(404, "Không tìm thấy bé chó cần đặt cọc"));
    }

    if (dog.status !== "Đã duyệt") {
      return next(
        new ApiError(
          400,
          "Bé chó này hiện không còn ở trạng thái sẵn sàng đặt cọc. Vui lòng tải lại trang."
        )
      );
    }

    const activeOrder = await Order.findOne({
      dogId,
      status: { $in: ["Chờ xác nhận cọc", "Đã nhận cọc", "Đang giao"] },
    });

    if (activeOrder) {
      return next(new ApiError(400, "Bé chó này đang có người đặt trước"));
    }

    const depositAmount = Number(totalPrice) * 0.3;

    const newOrder = new Order({
      userId,
      customerName,
      customerPhone,
      customerAddress,
      dogId,
      farmId,
      totalPrice,
      depositAmount,
      note,
      status: "Chờ xác nhận cọc",
    });

    await newOrder.save();

    dog.status = "Chờ thanh toán";
    await dog.save();

    res.send({
      message:
        "Tạo đơn đặt cọc thành công! Bé chó đã được giữ chỗ và đang chờ xác nhận thanh toán cọc.",
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

    res.send(orders);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi lấy danh sách đơn cọc"));
  }
};

// 3. Cập nhật trạng thái đơn
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

    if (status === "Đã nhận cọc") {
      dog.status = "Đã đặt cọc";
    } else if (status === "Đang giao") {
      dog.status = "Đang giao";
    } else if (status === "Hoàn thành") {
      dog.status = "Đã bán";
    } else if (status === "Đã hủy") {
      dog.status = "Đã duyệt";
    }

    order.status = status;

    await order.save();
    await dog.save();

    res.send({
      message: "Cập nhật trạng thái đơn hàng thành công!",
      order,
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi cập nhật đơn hàng: " + error.message));
  }
};

// 4. Tìm đơn theo số điện thoại
exports.findByPhone = async (req, res, next) => {
  try {
    const { phone } = req.params;
    const orders = await Order.find({ customerPhone: phone })
      .populate("dogId", "name image maCho price status")
      .populate("farmId", "name")
      .sort({ createdAt: -1 });

    res.send(orders);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi tra cứu lịch sử đặt cọc"));
  }
};

// 5. Tìm đơn theo userId
exports.findByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId })
      .populate("dogId", "name image maCho price status")
      .populate("farmId", "name")
      .sort({ createdAt: -1 });

    res.send(orders);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi tải lịch sử đơn hàng của bạn"));
  }
};