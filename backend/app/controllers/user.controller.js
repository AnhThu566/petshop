// controllers/user.controller.js
const User = require("../models/user.model");
const ApiError = require("../api-error");

// Lấy thông tin user hiện tại
exports.getMe = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return next(new ApiError(401, "Bạn chưa đăng nhập"));
    }

    const user = await User.findById(userId);

    if (!user) {
      return next(new ApiError(404, "Không tìm thấy tài khoản"));
    }

    return res.send(user);
  } catch (error) {
    return next(new ApiError(500, "Lỗi lấy thông tin người dùng: " + error.message));
  }
};

// Cập nhật hồ sơ cá nhân + avatar
exports.updateMe = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return next(new ApiError(401, "Bạn chưa đăng nhập"));
    }

    const user = await User.findById(userId);

    if (!user) {
      return next(new ApiError(404, "Không tìm thấy tài khoản"));
    }

    const { fullName, phone, gender, birthday, address } = req.body;

    if (!fullName || !fullName.trim()) {
      return next(new ApiError(400, "Họ và tên không được để trống"));
    }

    if (phone && !/^(0|\+84)[0-9]{9,10}$/.test(String(phone).trim())) {
      return next(new ApiError(400, "Số điện thoại không hợp lệ"));
    }

    if (gender && !["Nam", "Nữ", "Khác"].includes(gender)) {
      return next(new ApiError(400, "Giới tính không hợp lệ"));
    }

    if (birthday) {
      const birthdayDate = new Date(birthday);
      if (Number.isNaN(birthdayDate.getTime())) {
        return next(new ApiError(400, "Ngày sinh không hợp lệ"));
      }

      const today = new Date();
      if (birthdayDate > today) {
        return next(new ApiError(400, "Ngày sinh không được lớn hơn hôm nay"));
      }

      user.birthday = birthdayDate;
    } else if (birthday === "") {
      user.birthday = null;
    }

    user.fullName = fullName.trim();
    user.phone = phone ? String(phone).trim() : "";
    user.gender = gender || "Khác";

    // address chưa có trong model User hiện tại
    // nếu bạn muốn lưu address thật, cần thêm field address vào user.model.js
    if (req.file) {
      user.avatar = `/uploads/${req.file.filename}`;
    }

    await user.save();

    return res.send({
      message: "Cập nhật hồ sơ thành công",
      user,
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi cập nhật hồ sơ: " + error.message));
  }
};