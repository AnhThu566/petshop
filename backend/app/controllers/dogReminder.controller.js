const DogReminder = require("../models/dogReminder.model");
const Dog = require("../models/dog.model");
const ApiError = require("../api-error");

const REMINDER_STATUS = ["Chờ nhắc", "Đã gửi nhắc", "Đã hoàn thành", "Đã hủy"];
const REMINDER_TYPE = [
  "Tiêm vaccine",
  "Tẩy giun",
  "Tái khám",
  "Chăm sóc định kỳ",
];

// 1. Admin tạo nhắc lịch mới
exports.create = async (req, res, next) => {
  try {
    const {
      dogId,
      customerId,
      orderId,
      careRecordId,
      reminderType,
      title,
      description,
      reminderDate,
      note,
    } = req.body;

    if (!dogId || !customerId || !reminderType || !title || !reminderDate) {
      return next(new ApiError(400, "Thiếu thông tin để tạo nhắc lịch"));
    }

    if (!REMINDER_TYPE.includes(reminderType)) {
      return next(new ApiError(400, "Loại nhắc lịch không hợp lệ"));
    }

    const dog = await Dog.findById(dogId);
    if (!dog) {
      return next(new ApiError(404, "Không tìm thấy hồ sơ chó"));
    }

    const createdBy = req.user?._id || req.user?.id || null;

    const reminder = await DogReminder.create({
      dogId,
      customerId,
      orderId: orderId || null,
      careRecordId: careRecordId || null,
      reminderType,
      title: String(title).trim(),
      description: description ? String(description).trim() : "",
      reminderDate,
      note: note ? String(note).trim() : "",
      createdBy,
    });

    return res.send({
      message: "Tạo nhắc lịch thành công",
      reminder,
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi tạo nhắc lịch: " + error.message));
  }
};

// 2. Admin xem tất cả nhắc lịch
exports.findAll = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.status && REMINDER_STATUS.includes(req.query.status)) {
      filter.status = req.query.status;
    }

    if (req.query.reminderType && REMINDER_TYPE.includes(req.query.reminderType)) {
      filter.reminderType = req.query.reminderType;
    }

    if (req.query.customerId) {
      filter.customerId = req.query.customerId;
    }

    if (req.query.dogId) {
      filter.dogId = req.query.dogId;
    }

    const reminders = await DogReminder.find(filter)
      .populate("dogId", "name maCho image")
      .populate("customerId", "username fullName email phone")
      .populate("orderId", "status")
      .sort({ reminderDate: 1, createdAt: -1 });

    return res.send(reminders);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi lấy danh sách nhắc lịch: " + error.message));
  }
};

// 3. Khách xem nhắc lịch của mình
exports.findMyReminders = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(new ApiError(401, "Bạn chưa đăng nhập"));
    }

    const currentUserId = req.user._id || req.user.id;
    const filter = { customerId: currentUserId };

    if (req.query.status && REMINDER_STATUS.includes(req.query.status)) {
      filter.status = req.query.status;
    }

    const reminders = await DogReminder.find(filter)
      .populate("dogId", "name maCho image")
      .sort({ reminderDate: 1, createdAt: -1 });

    return res.send(reminders);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi lấy nhắc lịch của bạn: " + error.message));
  }
};

// 4. Cập nhật trạng thái nhắc lịch
exports.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    if (!REMINDER_STATUS.includes(status)) {
      return next(new ApiError(400, "Trạng thái nhắc lịch không hợp lệ"));
    }

    const reminder = await DogReminder.findById(id);
    if (!reminder) {
      return next(new ApiError(404, "Không tìm thấy nhắc lịch"));
    }

    reminder.status = status;

    if (note !== undefined) {
      reminder.note = String(note || "").trim();
    }

    await reminder.save();

    return res.send({
      message: "Cập nhật trạng thái nhắc lịch thành công",
      reminder,
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi cập nhật nhắc lịch: " + error.message));
  }
};

// 5. Khách đánh dấu hoàn thành
exports.markCompletedByCustomer = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(new ApiError(401, "Bạn chưa đăng nhập"));
    }

    const { id } = req.params;
    const currentUserId = req.user._id || req.user.id;

    const reminder = await DogReminder.findById(id);
    if (!reminder) {
      return next(new ApiError(404, "Không tìm thấy nhắc lịch"));
    }

    if (String(reminder.customerId) !== String(currentUserId)) {
      return next(new ApiError(403, "Bạn không có quyền cập nhật nhắc lịch này"));
    }

    reminder.status = "Đã hoàn thành";
    await reminder.save();

    return res.send({
      message: "Đã đánh dấu hoàn thành nhắc lịch",
      reminder,
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi cập nhật nhắc lịch: " + error.message));
  }
};