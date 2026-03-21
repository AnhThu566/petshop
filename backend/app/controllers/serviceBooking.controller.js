const ServiceBooking = require("../models/serviceBooking.model");
const Service = require("../models/service.model");
const ApiError = require("../api-error");

const generateNextCode = async () => {
  const lastBooking = await ServiceBooking.findOne().sort({ maLichDat: -1 });

  let nextCode = "LDV001";

  if (lastBooking && lastBooking.maLichDat) {
    const lastNumber = parseInt(lastBooking.maLichDat.replace("LDV", ""), 10);
    nextCode = "LDV" + (lastNumber + 1).toString().padStart(3, "0");
  }

  return nextCode;
};

// Khách đặt lịch
exports.create = async (req, res, next) => {
  try {
    const {
      serviceId,
      customerName,
      customerPhone,
      bookingDate,
      bookingTime,
      note,
    } = req.body;

    if (!req.user) {
      return next(new ApiError(401, "Bạn chưa đăng nhập"));
    }

    if (!serviceId || !customerName || !customerPhone || !bookingDate || !bookingTime) {
      return next(new ApiError(400, "Vui lòng nhập đầy đủ thông tin đặt lịch"));
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return next(new ApiError(404, "Không tìm thấy dịch vụ"));
    }

    if (service.status !== "Đang hoạt động") {
      return next(new ApiError(400, "Dịch vụ này hiện không còn hoạt động"));
    }

    const maLichDat = await generateNextCode();

    const booking = new ServiceBooking({
      maLichDat,
      customerId: req.user._id || req.user.id,
      serviceId,
      customerName,
      customerPhone,
      bookingDate,
      bookingTime,
      note: note || "",
      status: "Chờ xác nhận",
    });

    await booking.save();

    const populatedBooking = await ServiceBooking.findById(booking._id)
      .populate("serviceId", "maDichVu name price image status")
      .populate("customerId", "username fullName phone");

    return res.send({
      message: "Đặt lịch dịch vụ thành công!",
      booking: populatedBooking,
    });
  } catch (error) {
    console.error("Lỗi create service booking:", error);
    return next(new ApiError(500, "Lỗi khi đặt lịch dịch vụ: " + error.message));
  }
};

// Admin xem tất cả lịch
exports.findAll = async (req, res, next) => {
  try {
    const bookings = await ServiceBooking.find({})
      .populate("serviceId", "maDichVu name price image status")
      .populate("customerId", "username fullName phone")
      .sort({ createdAt: -1 });

    return res.send(bookings);
  } catch (error) {
    console.error("Lỗi findAll service bookings:", error);
    return next(new ApiError(500, "Lỗi khi lấy danh sách lịch đặt: " + error.message));
  }
};

// Khách xem lịch của mình
exports.findByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const bookings = await ServiceBooking.find({ customerId: userId })
      .populate("serviceId", "maDichVu name price image status")
      .populate("customerId", "username fullName phone")
      .sort({ createdAt: -1 });

    return res.send(bookings);
  } catch (error) {
    console.error("Lỗi find bookings by user:", error);
    return next(new ApiError(500, "Lỗi khi lấy lịch đặt của khách hàng: " + error.message));
  }
};

// Admin cập nhật trạng thái
exports.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["Chờ xác nhận", "Đã xác nhận", "Hoàn thành", "Đã hủy"];
    if (!validStatuses.includes(status)) {
      return next(new ApiError(400, "Trạng thái không hợp lệ"));
    }

    const booking = await ServiceBooking.findById(id);
    if (!booking) {
      return next(new ApiError(404, "Không tìm thấy lịch đặt"));
    }

    booking.status = status;
    await booking.save();

    const populatedBooking = await ServiceBooking.findById(booking._id)
      .populate("serviceId", "maDichVu name price image status")
      .populate("customerId", "username fullName phone");

    return res.send({
      message: "Cập nhật trạng thái lịch đặt thành công!",
      booking: populatedBooking,
    });
  } catch (error) {
    console.error("Lỗi update service booking status:", error);
    return next(new ApiError(500, "Lỗi khi cập nhật trạng thái lịch đặt: " + error.message));
  }
};