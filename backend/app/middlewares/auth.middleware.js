const ApiError = require("../api-error");

// Middleware đọc thông tin user giả lập từ header hoặc req.user
// Nếu project của bạn đã có JWT middleware rồi thì nối vào đó
exports.requireLogin = (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, "Bạn chưa đăng nhập"));
  }
  next();
};

exports.requireAdmin = (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, "Bạn chưa đăng nhập"));
  }

  const role = req.user.role || req.user.vaiTro;

  if (role !== "admin" && role !== "Admin") {
    return next(new ApiError(403, "Bạn không có quyền Admin"));
  }

  next();
};

exports.requireCustomer = (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, "Bạn chưa đăng nhập"));
  }

  const role = req.user.role || req.user.vaiTro;

  if (role !== "customer" && role !== "Customer") {
    return next(new ApiError(403, "Bạn không có quyền Khách hàng"));
  }

  next();
};

exports.requireFarm = (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, "Bạn chưa đăng nhập"));
  }

  const role = req.user.role || req.user.vaiTro;

  if (role !== "farm" && role !== "Farm") {
    return next(new ApiError(403, "Bạn không có quyền Trang trại"));
  }

  next();
};