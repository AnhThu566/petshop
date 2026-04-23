const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Farm = require("../models/farm.model");
const ApiError = require("../api-error");

const signToken = (user, farmId = null) => {
  return jwt.sign(
    {
      id: user._id,
      username: user.username,
      role: user.role,
      fullName: user.fullName || "",
      email: user.email || "",
      farmId: farmId || null,
    },
    process.env.JWT_SECRET || "petshop_jwt_secret_2026",
    { expiresIn: "7d" }
  );
};

const normalizeString = (value) => {
  return typeof value === "string" ? value.trim() : "";
};

const emailRegex = /^\S+@\S+\.\S+$/;
const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
const usernameRegex = /^[a-zA-Z0-9_]+$/;

const validateCommonRegisterFields = ({
  username,
  password,
  email,
  fullName,
  phone,
}) => {
  if (!username || !password || !email || !fullName || !phone) {
    return "Vui lòng nhập đầy đủ thông tin bắt buộc";
  }

  if (username.length < 3 || username.length > 30) {
    return "Tên đăng nhập phải từ 3 đến 30 ký tự";
  }

  if (!usernameRegex.test(username)) {
    return "Tên đăng nhập chỉ được chứa chữ, số và dấu gạch dưới";
  }

  if (password.length < 6) {
    return "Mật khẩu phải có ít nhất 6 ký tự";
  }

  if (!emailRegex.test(email)) {
    return "Email không hợp lệ";
  }

  if (!phoneRegex.test(phone)) {
    return "Số điện thoại không hợp lệ";
  }

  return null;
};

const checkDuplicateUserFields = async ({ username, email, phone }) => {
  const existingUsername = await User.findOne({ username });
  if (existingUsername) {
    return "Tên đăng nhập đã tồn tại";
  }

  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    return "Email đã được sử dụng";
  }

  const existingPhone = await User.findOne({ phone });
  if (existingPhone) {
    return "Số điện thoại đã được sử dụng";
  }

  return null;
};

// 1. ĐĂNG KÝ TRANG TRẠI (Tạo User + Farm)
exports.registerFarm = async (req, res, next) => {
  try {
    let {
      username,
      password,
      email,
      fullName,
      phone,
      address,
      name,
      farmDescription,
    } = req.body;

    username = normalizeString(username);
    password = normalizeString(password);
    email = normalizeString(email).toLowerCase();
    fullName = normalizeString(fullName);
    phone = normalizeString(phone);
    address = normalizeString(address);
    name = normalizeString(name);
    farmDescription = normalizeString(farmDescription);

    if (!name) {
      return next(new ApiError(400, "Tên trại không được để trống"));
    }

    const validateError = validateCommonRegisterFields({
      username,
      password,
      email,
      fullName,
      phone,
    });

    if (validateError) {
      return next(new ApiError(400, validateError));
    }

    const duplicateError = await checkDuplicateUserFields({
      username,
      email,
      phone,
    });

    if (duplicateError) {
      return next(new ApiError(400, duplicateError));
    }

    const newUser = new User({
      username,
      password,
      email,
      fullName,
      phone,
      role: "farm",
      status: "active",
    });

    const savedUser = await newUser.save();

    const lastFarm = await Farm.findOne().sort({ maTrai: -1 });
    let nextCode = "T001";

    if (lastFarm && lastFarm.maTrai) {
      const lastNumber = parseInt(String(lastFarm.maTrai).replace("T", ""), 10);
      if (!Number.isNaN(lastNumber)) {
        nextCode = "T" + String(lastNumber + 1).padStart(3, "0");
      }
    }

    const newFarm = new Farm({
      maTrai: nextCode,
      name,
      address: address || "",
      phone,
      farmDescription: farmDescription || "",
      ownerId: savedUser._id,
      image: req.file ? `/uploads/${req.file.filename}` : null,
    });

    await newFarm.save();

    return res.send({
      message: "Tạo tài khoản và hồ sơ Trại thành công!",
      maTrai: nextCode,
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      let message = "Dữ liệu đã tồn tại";

      if (field === "username") message = "Tên đăng nhập đã tồn tại";
      if (field === "email") message = "Email đã được sử dụng";
      if (field === "phone") message = "Số điện thoại đã được sử dụng";
      if (field === "customerCode") message = "Mã khách hàng bị trùng";

      return next(new ApiError(400, message));
    }

    return next(new ApiError(500, "Lỗi khi đăng ký trại: " + error.message));
  }
};

// 2. ĐĂNG NHẬP CHUNG
exports.login = async (req, res, next) => {
  try {
    let { username, password } = req.body;

    username = normalizeString(username);
    password = normalizeString(password);

    if (!username || !password) {
      return next(new ApiError(400, "Vui lòng nhập tên đăng nhập và mật khẩu"));
    }

    const user = await User.findOne({ username });

    if (!user) {
      return next(new ApiError(401, "Tài khoản hoặc mật khẩu không chính xác"));
    }

    if (user.status === "locked") {
      return next(new ApiError(403, "Tài khoản của bạn đã bị khóa!"));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new ApiError(401, "Tài khoản hoặc mật khẩu không chính xác"));
    }

    let farmId = null;
    if (user.role === "farm") {
      const farm = await Farm.findOne({ ownerId: user._id });
      farmId = farm ? String(farm._id) : null;
    }

    const token = signToken(user, farmId);

    return res.send({
      message: "Đăng nhập thành công",
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        farmId,
      },
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi đăng nhập: " + error.message));
  }
};

// 3. ĐĂNG KÝ KHÁCH HÀNG
exports.register = async (req, res, next) => {
  try {
    let { username, password, email, fullName, phone } = req.body;

    username = normalizeString(username);
    password = normalizeString(password);
    email = normalizeString(email).toLowerCase();
    fullName = normalizeString(fullName);
    phone = normalizeString(phone);

    const validateError = validateCommonRegisterFields({
      username,
      password,
      email,
      fullName,
      phone,
    });

    if (validateError) {
      return next(new ApiError(400, validateError));
    }

    const duplicateError = await checkDuplicateUserFields({
      username,
      email,
      phone,
    });

    if (duplicateError) {
      return next(new ApiError(400, duplicateError));
    }

    const lastCustomer = await User.findOne({
      role: "customer",
      customerCode: { $exists: true, $ne: null, $ne: "" },
    }).sort({ customerCode: -1 });

    let nextCustomerCode = "KH001";

    if (lastCustomer && lastCustomer.customerCode) {
      const lastNumber = parseInt(
        String(lastCustomer.customerCode).replace("KH", ""),
        10
      );

      if (!Number.isNaN(lastNumber)) {
        nextCustomerCode = "KH" + String(lastNumber + 1).padStart(3, "0");
      }
    }

    const newUser = new User({
      username,
      password,
      email,
      fullName,
      phone,
      role: "customer",
      status: "active",
      customerCode: nextCustomerCode,
    });

    await newUser.save();

    return res.send({
      message: "Đăng ký thành công!",
      username: newUser.username,
      customerCode: newUser.customerCode,
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      let message = "Dữ liệu đã tồn tại";

      if (field === "username") message = "Tên đăng nhập đã tồn tại";
      if (field === "email") message = "Email đã được sử dụng";
      if (field === "phone") message = "Số điện thoại đã được sử dụng";
      if (field === "customerCode") message = "Mã khách hàng bị trùng";

      return next(new ApiError(400, message));
    }

    return next(new ApiError(500, "Lỗi server: " + error.message));
  }
};

// đổi mật khẩu
exports.changePassword = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!userId) {
      return next(new ApiError(401, "Bạn chưa đăng nhập"));
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      return next(new ApiError(400, "Vui lòng nhập đầy đủ thông tin mật khẩu"));
    }

    if (String(newPassword).trim().length < 6) {
      return next(new ApiError(400, "Mật khẩu mới phải có ít nhất 6 ký tự"));
    }

    if (newPassword !== confirmPassword) {
      return next(new ApiError(400, "Xác nhận mật khẩu mới không khớp"));
    }

    if (currentPassword === newPassword) {
      return next(
        new ApiError(400, "Mật khẩu mới không được trùng mật khẩu hiện tại")
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(new ApiError(404, "Không tìm thấy tài khoản"));
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return next(new ApiError(400, "Mật khẩu hiện tại không đúng"));
    }

    user.password = newPassword;
    await user.save();

    return res.send({
      message: "Đổi mật khẩu thành công",
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi đổi mật khẩu: " + error.message));
  }
};