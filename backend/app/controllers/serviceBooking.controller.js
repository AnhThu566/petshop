const ServiceBooking = require("../models/serviceBooking.model");
const Service = require("../models/service.model");
const ApiError = require("../api-error");

const VALID_BOOKING_STATUSES = [
  "Chờ xác nhận",
  "Đã xác nhận",
  "Hoàn thành",
  "Đã hủy",
];

const ACTIVE_BOOKING_STATUSES = ["Chờ xác nhận", "Đã xác nhận"];

const PHONE_REGEX = /^(0|\+84)\d{9,10}$/;
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

const WORKING_HOUR_START = 8;
const WORKING_HOUR_END = 20;

const generateNextCode = async () => {
  const lastBooking = await ServiceBooking.findOne().sort({
    createdAt: -1,
    bookingCode: -1,
  });

  let nextCode = "LDV001";
  if (lastBooking && lastBooking.bookingCode) {
    const lastNumber = parseInt(lastBooking.bookingCode.replace("LDV", ""), 10);
    if (!Number.isNaN(lastNumber)) {
      nextCode = "LDV" + String(lastNumber + 1).padStart(3, "0");
    }
  }

  return nextCode;
};

const getCurrentUserId = (req) => {
  return req.user?._id || req.user?.id || null;
};

const normalizeText = (value) => String(value || "").trim();
const normalizeDateString = (value) => String(value || "").trim();

const parseDateOnly = (dateString) => {
  const value = normalizeDateString(dateString);
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

const parseTimeParts = (timeString) => {
  const cleanTime = normalizeText(timeString);
  if (!TIME_REGEX.test(cleanTime)) return null;

  const [hour, minute] = cleanTime.split(":").map(Number);
  return { hour, minute };
};

const isPastDate = (dateString) => {
  const bookingDate = parseDateOnly(dateString);
  if (!bookingDate) return true;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return bookingDate < today;
};

const isPastDateTime = (dateString, timeString) => {
  const bookingDate = parseDateOnly(dateString);
  const timeParts = parseTimeParts(timeString);

  if (!bookingDate || !timeParts) return true;

  bookingDate.setHours(timeParts.hour, timeParts.minute, 0, 0);

  return bookingDate < new Date();
};

const isWithinWorkingHours = (timeString) => {
  const timeParts = parseTimeParts(timeString);
  if (!timeParts) return false;

  const { hour, minute } = timeParts;

  if (hour < WORKING_HOUR_START || hour > WORKING_HOUR_END) {
    return false;
  }

  if (hour === WORKING_HOUR_END && minute > 0) {
    return false;
  }

  return true;
};

const validateBookingPayload = ({
  customerName,
  customerPhone,
  bookingDate,
  bookingTime,
  note,
}) => {
  const errors = [];

  const cleanCustomerName = normalizeText(customerName);
  const cleanCustomerPhone = normalizeText(customerPhone);
  const cleanBookingDate = normalizeDateString(bookingDate);
  const cleanBookingTime = normalizeText(bookingTime);
  const cleanNote = normalizeText(note);

  if (!cleanCustomerName) {
    errors.push("Tên khách hàng không được để trống");
  } else if (cleanCustomerName.length < 2) {
    errors.push("Tên khách hàng phải có ít nhất 2 ký tự");
  } else if (cleanCustomerName.length > 100) {
    errors.push("Tên khách hàng không được vượt quá 100 ký tự");
  }

  if (!cleanCustomerPhone) {
    errors.push("Số điện thoại không được để trống");
  } else if (!PHONE_REGEX.test(cleanCustomerPhone)) {
    errors.push("Số điện thoại không hợp lệ");
  }

  if (!cleanBookingDate) {
    errors.push("Ngày đặt lịch không được để trống");
  } else if (!parseDateOnly(cleanBookingDate)) {
    errors.push("Ngày đặt lịch không hợp lệ");
  } else if (isPastDate(cleanBookingDate)) {
    errors.push("Không thể đặt lịch vào ngày trong quá khứ");
  }

  if (!cleanBookingTime) {
    errors.push("Giờ đặt lịch không được để trống");
  } else if (!TIME_REGEX.test(cleanBookingTime)) {
    errors.push("Giờ đặt lịch không hợp lệ, định dạng đúng là HH:mm");
  } else if (!isWithinWorkingHours(cleanBookingTime)) {
    errors.push("Giờ đặt lịch phải trong khoảng 08:00 - 20:00");
  }

  if (
    cleanBookingDate &&
    cleanBookingTime &&
    parseDateOnly(cleanBookingDate) &&
    TIME_REGEX.test(cleanBookingTime) &&
    isPastDateTime(cleanBookingDate, cleanBookingTime)
  ) {
    errors.push("Không thể đặt lịch vào thời điểm đã qua");
  }

  if (cleanNote.length > 1000) {
    errors.push("Ghi chú không được vượt quá 1000 ký tự");
  }

  return {
    errors,
    cleanData: {
      customerName: cleanCustomerName,
      customerPhone: cleanCustomerPhone,
      bookingDate: cleanBookingDate,
      bookingTime: cleanBookingTime,
      note: cleanNote,
    },
  };
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

    const currentUserId = getCurrentUserId(req);
    if (!currentUserId) {
      return next(new ApiError(401, "Bạn chưa đăng nhập"));
    }

    if (!serviceId) {
      return next(new ApiError(400, "Thiếu serviceId"));
    }

    const { errors, cleanData } = validateBookingPayload({
      customerName,
      customerPhone,
      bookingDate,
      bookingTime,
      note,
    });

    if (errors.length) {
      return next(new ApiError(400, errors.join(". ")));
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return next(new ApiError(404, "Không tìm thấy dịch vụ"));
    }

    if (service.status !== "Đang hoạt động") {
      return next(new ApiError(400, "Dịch vụ này hiện không còn hoạt động"));
    }

    const duplicateBooking = await ServiceBooking.findOne({
      serviceId,
      bookingDate: cleanData.bookingDate,
      bookingTime: cleanData.bookingTime,
      status: { $in: ACTIVE_BOOKING_STATUSES },
    });

    if (duplicateBooking) {
      return next(
        new ApiError(
          400,
          "Khung giờ này đã có người đặt. Vui lòng chọn thời gian khác"
        )
      );
    }

    const sameCustomerBooking = await ServiceBooking.findOne({
      customerId: currentUserId,
      serviceId,
      bookingDate: cleanData.bookingDate,
      bookingTime: cleanData.bookingTime,
      status: { $in: ACTIVE_BOOKING_STATUSES },
    });

    if (sameCustomerBooking) {
      return next(
        new ApiError(
          400,
          "Bạn đã có lịch đặt trùng dịch vụ, ngày và giờ này rồi"
        )
      );
    }

    const bookingCode = await generateNextCode();

    const booking = new ServiceBooking({
      bookingCode,
      customerId: currentUserId,
      serviceId,
      customerName: cleanData.customerName,
      customerPhone: cleanData.customerPhone,
      bookingDate: cleanData.bookingDate,
      bookingTime: cleanData.bookingTime,
      note: cleanData.note,
      status: "Chờ xác nhận",
    });

    await booking.save();

    const populatedBooking = await ServiceBooking.findById(booking._id)
      .populate("serviceId", "serviceCode name price image status")
      .populate("customerId", "username fullName phone email");

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
    const filter = {};

    if (
      req.query.status &&
      VALID_BOOKING_STATUSES.includes(req.query.status)
    ) {
      filter.status = req.query.status;
    }

    if (req.query.serviceId) {
      filter.serviceId = req.query.serviceId;
    }

    if (req.query.bookingDate) {
      filter.bookingDate = normalizeDateString(req.query.bookingDate);
    }

    if (req.query.customerPhone) {
      filter.customerPhone = normalizeText(req.query.customerPhone);
    }

    const bookings = await ServiceBooking.find(filter)
      .populate("serviceId", "serviceCode name price image status")
      .populate("customerId", "username fullName phone email")
      .sort({ bookingDate: -1, bookingTime: -1, createdAt: -1 });

    return res.send(bookings);
  } catch (error) {
    console.error("Lỗi findAll service bookings:", error);
    return next(
      new ApiError(500, "Lỗi khi lấy danh sách lịch đặt: " + error.message)
    );
  }
};

// Khách xem lịch của mình
exports.findMyBookings = async (req, res, next) => {
  try {
    const currentUserId = getCurrentUserId(req);
    if (!currentUserId) {
      return next(new ApiError(401, "Bạn chưa đăng nhập"));
    }

    const filter = { customerId: currentUserId };

    if (
      req.query.status &&
      VALID_BOOKING_STATUSES.includes(req.query.status)
    ) {
      filter.status = req.query.status;
    }

    const bookings = await ServiceBooking.find(filter)
      .populate("serviceId", "serviceCode name price image status")
      .populate("customerId", "username fullName phone email")
      .sort({ bookingDate: -1, bookingTime: -1, createdAt: -1 });

    return res.send(bookings);
  } catch (error) {
    console.error("Lỗi findMyBookings:", error);
    return next(
      new ApiError(500, "Lỗi khi lấy lịch đặt của bạn: " + error.message)
    );
  }
};

// Admin cập nhật trạng thái
exports.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!VALID_BOOKING_STATUSES.includes(status)) {
      return next(new ApiError(400, "Trạng thái không hợp lệ"));
    }

    const booking = await ServiceBooking.findById(id);
    if (!booking) {
      return next(new ApiError(404, "Không tìm thấy lịch đặt"));
    }

    const service = await Service.findById(booking.serviceId);
    if (!service) {
      return next(new ApiError(404, "Không tìm thấy dịch vụ của lịch đặt"));
    }

    const oldStatus = booking.status;

    if (oldStatus === status) {
      const sameBooking = await ServiceBooking.findById(booking._id)
        .populate("serviceId", "serviceCode name price image status")
        .populate("customerId", "username fullName phone email");

      return res.send({
        message: "Trạng thái lịch không thay đổi.",
        booking: sameBooking,
      });
    }

    if (oldStatus === "Hoàn thành") {
      return next(
        new ApiError(400, "Lịch đã hoàn thành không thể thay đổi trạng thái")
      );
    }

    if (oldStatus === "Đã hủy") {
      return next(
        new ApiError(400, "Lịch đã hủy không thể chuyển sang trạng thái khác")
      );
    }

    const allowedTransitions = {
      "Chờ xác nhận": ["Đã xác nhận", "Đã hủy"],
      "Đã xác nhận": ["Hoàn thành", "Đã hủy"],
    };

    if (!allowedTransitions[oldStatus]?.includes(status)) {
      return next(
        new ApiError(
          400,
          `Không thể chuyển lịch từ trạng thái [${oldStatus}] sang [${status}]`
        )
      );
    }

    if (status === "Đã xác nhận" && service.status !== "Đang hoạt động") {
      return next(
        new ApiError(400, "Không thể xác nhận lịch vì dịch vụ hiện không hoạt động")
      );
    }

    booking.status = status;
    await booking.save();

    const populatedBooking = await ServiceBooking.findById(booking._id)
      .populate("serviceId", "serviceCode name price image status")
      .populate("customerId", "username fullName phone email");

    return res.send({
      message: "Cập nhật trạng thái lịch đặt thành công!",
      booking: populatedBooking,
    });
  } catch (error) {
    console.error("Lỗi update service booking status:", error);
    return next(
      new ApiError(500, "Lỗi khi cập nhật trạng thái lịch đặt: " + error.message)
    );
  }
};

// Khách hủy lịch
exports.cancelByCustomer = async (req, res, next) => {
  try {
    const currentUserId = getCurrentUserId(req);
    if (!currentUserId) {
      return next(new ApiError(401, "Bạn chưa đăng nhập"));
    }

    const { id } = req.params;
    const booking = await ServiceBooking.findById(id);

    if (!booking) {
      return next(new ApiError(404, "Không tìm thấy lịch đặt dịch vụ"));
    }

    const bookingUserId = booking.customerId?._id || booking.customerId;
    if (String(bookingUserId) !== String(currentUserId)) {
      return next(new ApiError(403, "Bạn không có quyền hủy lịch này"));
    }

    if (booking.status !== "Chờ xác nhận") {
      return next(
        new ApiError(400, "Bạn chỉ có thể hủy lịch khi đang chờ xác nhận")
      );
    }

    booking.status = "Đã hủy";
    await booking.save();

    const populatedBooking = await ServiceBooking.findById(booking._id)
      .populate("serviceId", "serviceCode name price image status")
      .populate("customerId", "username fullName phone email");

    return res.send({
      message: "Hủy lịch dịch vụ thành công!",
      booking: populatedBooking,
    });
  } catch (error) {
    return next(
      new ApiError(500, "Lỗi khi hủy lịch dịch vụ: " + error.message)
    );
  }
};