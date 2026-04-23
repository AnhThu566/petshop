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

    const fullName = String(req.body.fullName || "").trim();
    const phone = String(req.body.phone || "").trim();
    const gender = String(req.body.gender || "Khác").trim();
    const birthday = req.body.birthday;
    const address = String(req.body.address || "").trim();

    if (!fullName) {
      return next(new ApiError(400, "Họ và tên không được để trống"));
    }

    if (fullName.length < 2) {
      return next(new ApiError(400, "Họ và tên phải có ít nhất 2 ký tự"));
    }

    if (phone && !/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/.test(phone)) {
      return next(new ApiError(400, "Số điện thoại không hợp lệ"));
    }

    if (gender && !["Nam", "Nữ", "Khác"].includes(gender)) {
      return next(new ApiError(400, "Giới tính không hợp lệ"));
    }

    if (phone) {
      const existingPhoneUser = await User.findOne({
        phone,
        _id: { $ne: userId },
      });

      if (existingPhoneUser) {
        return next(new ApiError(400, "Số điện thoại đã được sử dụng"));
      }
    }

    if (birthday) {
      const birthdayDate = new Date(birthday);

      if (Number.isNaN(birthdayDate.getTime())) {
        return next(new ApiError(400, "Ngày sinh không hợp lệ"));
      }

      const today = new Date();
      today.setHours(23, 59, 59, 999);

      if (birthdayDate > today) {
        return next(new ApiError(400, "Ngày sinh không được lớn hơn hôm nay"));
      }

      user.birthday = birthdayDate;
    } else if (birthday === "") {
      user.birthday = null;
    }

    user.fullName = fullName;
    user.phone = phone;
    user.gender = gender || "Khác";
    user.address = address;

    if (req.file) {
      user.avatar = `/uploads/${req.file.filename}`;
    }

    await user.save();

    return res.send({
      message: "Cập nhật hồ sơ thành công",
      user,
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      let message = "Dữ liệu đã tồn tại";

      if (field === "phone") message = "Số điện thoại đã được sử dụng";
      if (field === "email") message = "Email đã được sử dụng";
      if (field === "username") message = "Tên đăng nhập đã tồn tại";

      return next(new ApiError(400, message));
    }

    return next(new ApiError(500, "Lỗi cập nhật hồ sơ: " + error.message));
  }
};