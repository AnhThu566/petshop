const Notification = require("../models/notification.model");
const ApiError = require("../api-error");

const normalizeRole = (role) => String(role || "").toLowerCase();

const canAccessNotification = (notification, req) => {
  const role = normalizeRole(req.user?.role);
  const userId = req.user?._id || req.user?.id || null;
  const farmId = req.user?.farmId || null;

  if (notification.targetRole === "all") return true;

  if (role === "customer") {
    return String(notification.userId || "") === String(userId);
  }

  if (role === "farm") {
    return farmId && String(notification.farmId || "") === String(farmId);
  }

  if (role === "admin") {
    return notification.targetRole === "admin";
  }

  return false;
};

// 1. Tạo thông báo mới
exports.create = async (req, res, next) => {
  try {
    const {
      userId,
      farmId,
      title,
      message,
      type,
      targetRole,
      relatedId,
      relatedModel,
    } = req.body;

    if (!title || !title.trim() || !message || !message.trim()) {
      return next(new ApiError(400, "Thiếu tiêu đề hoặc nội dung thông báo"));
    }

    const notification = new Notification({
      userId: userId || null,
      farmId: farmId || null,
      title: title.trim(),
      message: message.trim(),
      type: type || "GENERAL",
      targetRole: targetRole || "customer",
      relatedId: relatedId || "",
      relatedModel: relatedModel || "",
      isRead: false,
    });

    await notification.save();

    return res.send({
      message: "Tạo thông báo thành công!",
      notification,
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi tạo thông báo: " + error.message));
  }
};

// 2. Lấy tất cả thông báo (admin xem)
exports.findAll = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.targetRole) {
      filter.targetRole = req.query.targetRole;
    }

    if (req.query.type) {
      filter.type = req.query.type;
    }

    const notifications = await Notification.find(filter)
      .populate("userId", "username fullName phone")
      .populate("farmId", "name phone")
      .sort({ createdAt: -1 });

    return res.send(notifications);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi lấy danh sách thông báo: " + error.message));
  }
};

// 3. Lấy thông báo theo customer hiện tại
exports.findMineForCustomer = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(new ApiError(401, "Bạn chưa đăng nhập"));
    }

    const currentUserId = req.user._id || req.user.id;

    const notifications = await Notification.find({
      $or: [{ userId: currentUserId }, { targetRole: "all" }],
    }).sort({ createdAt: -1 });

    return res.send(notifications);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi lấy thông báo của khách hàng: " + error.message));
  }
};

// 4. Lấy thông báo theo farm hiện tại
exports.findMineForFarm = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(new ApiError(401, "Bạn chưa đăng nhập"));
    }

    const currentFarmId = req.user.farmId;

    if (!currentFarmId) {
      return next(new ApiError(403, "Tài khoản này chưa được liên kết với trang trại"));
    }

    const notifications = await Notification.find({
      $or: [{ farmId: currentFarmId }, { targetRole: "all" }],
    }).sort({ createdAt: -1 });

    return res.send(notifications);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi lấy thông báo của trang trại: " + error.message));
  }
};

// 5. Đánh dấu đã đọc 1 thông báo
exports.markAsRead = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(new ApiError(401, "Bạn chưa đăng nhập"));
    }

    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return next(new ApiError(404, "Không tìm thấy thông báo"));
    }

    if (!canAccessNotification(notification, req)) {
      return next(new ApiError(403, "Bạn không có quyền thao tác thông báo này"));
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    return res.send({
      message: "Đã đánh dấu thông báo là đã đọc",
      notification,
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi cập nhật thông báo: " + error.message));
  }
};

// 6. Đánh dấu đã đọc tất cả cho customer hiện tại
exports.markAllAsReadForCustomer = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(new ApiError(401, "Bạn chưa đăng nhập"));
    }

    const currentUserId = req.user._id || req.user.id;
    const now = new Date();

    await Notification.updateMany(
      {
        $or: [{ userId: currentUserId }, { targetRole: "all" }],
        isRead: false,
      },
      { $set: { isRead: true, readAt: now } }
    );

    return res.send({
      message: "Đã đánh dấu tất cả thông báo của khách hàng là đã đọc",
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi cập nhật tất cả thông báo: " + error.message));
  }
};

// 7. Đánh dấu đã đọc tất cả cho farm hiện tại
exports.markAllAsReadForFarm = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(new ApiError(401, "Bạn chưa đăng nhập"));
    }

    const currentFarmId = req.user.farmId;
    if (!currentFarmId) {
      return next(new ApiError(403, "Tài khoản này chưa được liên kết với trang trại"));
    }

    const now = new Date();

    await Notification.updateMany(
      {
        $or: [{ farmId: currentFarmId }, { targetRole: "all" }],
        isRead: false,
      },
      { $set: { isRead: true, readAt: now } }
    );

    return res.send({
      message: "Đã đánh dấu tất cả thông báo của trang trại là đã đọc",
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi cập nhật tất cả thông báo: " + error.message));
  }
};

// 8. Xóa 1 thông báo
exports.delete = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);

    if (!notification) {
      return next(new ApiError(404, "Không tìm thấy thông báo để xóa"));
    }

    return res.send({
      message: "Xóa thông báo thành công!",
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi xóa thông báo: " + error.message));
  }
};