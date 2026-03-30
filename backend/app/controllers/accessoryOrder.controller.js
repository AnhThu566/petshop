const AccessoryOrder = require("../models/accessoryOrder.model");
const AccessoryOrderItem = require("../models/accessoryOrderItem.model");
const Accessory = require("../models/accessory.model");
const ApiError = require("../api-error");

const generateNextCode = async () => {
  const lastOrder = await AccessoryOrder.findOne().sort({ maDonPhuKien: -1 });

  let nextCode = "DPK001";

  if (lastOrder && lastOrder.maDonPhuKien) {
    const lastNumber = parseInt(lastOrder.maDonPhuKien.replace("DPK", ""), 10);
    nextCode = "DPK" + (lastNumber + 1).toString().padStart(3, "0");
  }

  return nextCode;
};

// Customer tạo đơn phụ kiện
exports.create = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(new ApiError(401, "Bạn chưa đăng nhập"));
    }

    const {
      customerName,
      customerPhone,
      shippingAddress,
      note,
      items,
    } = req.body;

    if (!customerName || !customerPhone || !shippingAddress) {
      return next(new ApiError(400, "Vui lòng nhập đầy đủ thông tin người nhận"));
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return next(new ApiError(400, "Đơn phụ kiện phải có ít nhất 1 sản phẩm"));
    }

    const maDonPhuKien = await generateNextCode();

    let totalAmount = 0;
    const orderItemsToInsert = [];

    for (const item of items) {
      if (!item.accessoryId || !item.quantity || Number(item.quantity) <= 0) {
        return next(new ApiError(400, "Dữ liệu sản phẩm trong đơn không hợp lệ"));
      }

      const accessory = await Accessory.findById(item.accessoryId);

      if (!accessory) {
        return next(new ApiError(404, "Có phụ kiện không tồn tại trong hệ thống"));
      }

      if (accessory.status !== "Đang bán") {
        return next(new ApiError(400, `Phụ kiện [${accessory.name}] hiện không còn bán`));
      }

      if (Number(accessory.quantity) < Number(item.quantity)) {
        return next(
          new ApiError(400, `Phụ kiện [${accessory.name}] không đủ số lượng tồn kho`)
        );
      }

      const subTotal = Number(accessory.price) * Number(item.quantity);
      totalAmount += subTotal;

      orderItemsToInsert.push({
        accessoryId: accessory._id,
        accessoryName: accessory.name,
        price: accessory.price,
        quantity: Number(item.quantity),
        subTotal,
      });

      accessory.quantity = Number(accessory.quantity) - Number(item.quantity);
      await accessory.save();
    }

    const newOrder = new AccessoryOrder({
      maDonPhuKien,
      customerId: req.user._id || req.user.id,
      customerName,
      customerPhone,
      shippingAddress,
      note: note || "",
      totalAmount,
      status: "Chờ xác nhận",
    });

    await newOrder.save();

    const finalItems = orderItemsToInsert.map((item) => ({
      ...item,
      orderId: newOrder._id,
    }));

    await AccessoryOrderItem.insertMany(finalItems);

    const createdOrder = await AccessoryOrder.findById(newOrder._id).populate(
      "customerId",
      "username fullName phone"
    );

    const createdItems = await AccessoryOrderItem.find({ orderId: newOrder._id }).populate(
      "accessoryId",
      "maPhuKien name image"
    );

    return res.send({
      message: "Đặt đơn phụ kiện thành công!",
      order: createdOrder,
      items: createdItems,
    });
  } catch (error) {
    console.error("Lỗi create accessory order:", error);
    return next(new ApiError(500, "Lỗi khi tạo đơn phụ kiện: " + error.message));
  }
};

// Customer xem đơn của mình
exports.findByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const orders = await AccessoryOrder.find({ customerId: userId })
      .populate("customerId", "username fullName phone")
      .sort({ createdAt: -1 });

    const result = [];

    for (const order of orders) {
      const items = await AccessoryOrderItem.find({ orderId: order._id }).populate(
        "accessoryId",
        "maPhuKien name image"
      );

      result.push({
        ...order.toJSON(),
        items,
      });
    }

    return res.send(result);
  } catch (error) {
    console.error("Lỗi find accessory orders by user:", error);
    return next(new ApiError(500, "Lỗi khi lấy lịch sử đơn phụ kiện: " + error.message));
  }
};

// Admin xem tất cả đơn phụ kiện
exports.findAll = async (req, res, next) => {
  try {
    const orders = await AccessoryOrder.find({})
      .populate("customerId", "username fullName phone")
      .sort({ createdAt: -1 });

    const result = [];

    for (const order of orders) {
      const items = await AccessoryOrderItem.find({ orderId: order._id }).populate(
        "accessoryId",
        "maPhuKien name image"
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
    const { status } = req.body;

    const validStatuses = [
      "Chờ xác nhận",
      "Đã xác nhận",
      "Đang giao",
      "Giao thất bại",
      "Hoàn thành",
      "Đã hủy",
    ];

    if (!validStatuses.includes(status)) {
      return next(new ApiError(400, "Trạng thái đơn phụ kiện không hợp lệ"));
    }

    const order = await AccessoryOrder.findById(id);
    if (!order) {
      return next(new ApiError(404, "Không tìm thấy đơn phụ kiện"));
    }

    const oldStatus = order.status;

    if (oldStatus === status) {
      return res.send({
        message: "Trạng thái đơn không thay đổi.",
        order,
      });
    }

    // Không cho thay đổi nếu đơn đã hoàn thành
    if (oldStatus === "Hoàn thành") {
      return next(new ApiError(400, "Đơn đã hoàn thành không thể thay đổi trạng thái"));
    }

    // Không cho hồi sinh đơn đã hủy
    if (oldStatus === "Đã hủy") {
      return next(new ApiError(400, "Đơn đã hủy không thể chuyển sang trạng thái khác"));
    }

    // Kiểm tra luồng chuyển trạng thái hợp lệ
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

    // Chỉ cộng lại tồn kho khi chuyển sang Đã hủy
    if (status === "Đã hủy") {
      const orderItems = await AccessoryOrderItem.find({ orderId: order._id });

      for (const item of orderItems) {
        const accessory = await Accessory.findById(item.accessoryId);

        if (accessory) {
          accessory.quantity =
            Number(accessory.quantity || 0) + Number(item.quantity || 0);
          await accessory.save();
        }
      }
    }

    order.status = status;
    await order.save();

    const updatedOrder = await AccessoryOrder.findById(order._id).populate(
      "customerId",
      "username fullName phone"
    );

    const items = await AccessoryOrderItem.find({ orderId: order._id }).populate(
      "accessoryId",
      "maPhuKien name image"
    );

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
    const order = await AccessoryOrder.findById(req.params.id).populate(
      "customerId",
      "username fullName phone"
    );

    if (!order) {
      return next(new ApiError(404, "Không tìm thấy đơn phụ kiện"));
    }

    const items = await AccessoryOrderItem.find({ orderId: order._id }).populate(
      "accessoryId",
      "maPhuKien name image"
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
    if (!req.user) {
      return next(new ApiError(401, "Bạn chưa đăng nhập"));
    }

    const { id } = req.params;

    const order = await AccessoryOrder.findById(id);
    if (!order) {
      return next(new ApiError(404, "Không tìm thấy đơn phụ kiện"));
    }

    const currentUserId = req.user._id || req.user.id;
    const orderUserId = order.customerId?._id || order.customerId;

    if (String(orderUserId) !== String(currentUserId)) {
      return next(new ApiError(403, "Bạn không có quyền hủy đơn này"));
    }

    if (order.status !== "Chờ xác nhận") {
      return next(
        new ApiError(400, "Chỉ có thể hủy đơn khi đơn đang ở trạng thái chờ xác nhận")
      );
    }

    const orderItems = await AccessoryOrderItem.find({ orderId: order._id });

    for (const item of orderItems) {
      const accessory = await Accessory.findById(item.accessoryId);
      if (accessory) {
        accessory.quantity =
          Number(accessory.quantity || 0) + Number(item.quantity || 0);
        await accessory.save();
      }
    }

    order.status = "Đã hủy";
    await order.save();

    const updatedOrder = await AccessoryOrder.findById(order._id).populate(
      "customerId",
      "username fullName phone"
    );

    const items = await AccessoryOrderItem.find({ orderId: order._id }).populate(
      "accessoryId",
      "maPhuKien name image"
    );

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