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

// 1. ĐĂNG KÝ TRANG TRẠI (Tạo User + Farm)
exports.registerFarm = async (req, res, next) => {
  try {
    const {
      username,
      password,
      email,
      fullName,
      phone,
      address,
      name,
      farmDescription,
    } = req.body;

    if (!username || !password || !email || !fullName || !name) {
      return next(new ApiError(400, "Vui lòng nhập đầy đủ thông tin đăng ký trại"));
    }

    const userExists = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (userExists) {
      return next(new ApiError(400, "Tên đăng nhập hoặc Email đã tồn tại!"));
    }

    const newUser = new User({
      username,
      password,
      email,
      fullName,
      phone: phone || "",
      role: "farm",
      status: "active",
    });

    const savedUser = await newUser.save();

    const lastFarm = await Farm.findOne().sort({ maTrai: -1 });
    let nextCode = "T001";

    if (lastFarm && lastFarm.maTrai) {
      const lastNumber = parseInt(lastFarm.maTrai.replace("T", ""), 10);
      nextCode = "T" + (lastNumber + 1).toString().padStart(3, "0");
    }

    const newFarm = new Farm({
      maTrai: nextCode,
      name,
      address: address || "",
      phone: phone || "",
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
    return next(new ApiError(500, "Lỗi khi đăng ký trại: " + error.message));
  }
};

// 2. ĐĂNG NHẬP CHUNG
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return next(new ApiError(400, "Vui lòng nhập tên đăng nhập và mật khẩu"));
    }

    const user = await User.findOne({ username });

    if (!user) {
      return next(new ApiError(401, "Tài khoản hoặc mật khẩu không chính xác"));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new ApiError(401, "Tài khoản hoặc mật khẩu không chính xác"));
    }

    if (user.status === "locked") {
      return next(new ApiError(403, "Tài khoản của bạn đã bị khóa!"));
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
    const { username, password, email, fullName, phone } = req.body;

    if (!username || !password || !email || !fullName) {
      return next(new ApiError(400, "Vui lòng nhập đầy đủ thông tin đăng ký"));
    }

    const userExists = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (userExists) {
      return next(new ApiError(400, "Tên đăng nhập hoặc Email đã tồn tại!"));
    }

    const newUser = new User({
      username,
      password,
      email,
      fullName,
      phone: phone || "",
      role: "customer",
      status: "active",
    });

    await newUser.save();

    return res.send({
      message: "Đăng ký thành công!",
      username: newUser.username,
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi server: " + error.message));
  }
};