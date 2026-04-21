const jwt = require("jsonwebtoken");
const ApiError = require("../api-error");

const getTokenFromHeader = (req) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || typeof authHeader !== "string") return null;

  const [type, token] = authHeader.trim().split(/\s+/);

  if (String(type).toLowerCase() !== "bearer" || !token) return null;

  return token;
};

const normalizeDecodedUser = (decoded = {}) => {
  const normalizedRole = String(decoded.role || "").toLowerCase();

  return {
    ...decoded,
    _id: decoded._id || decoded.id || null,
    id: decoded.id || decoded._id || null,
    role: normalizedRole,
    farmId:
      decoded.farmId ||
      decoded.farm ||
      decoded.farm_id ||
      decoded?.farmInfo?._id ||
      null,
    status: String(decoded.status || "").toLowerCase(), // thêm status từ token
  };
};

const verifyToken = (req, res, next) => {
  try {
    const token = getTokenFromHeader(req);

    if (!token) {
      return next(new ApiError(401, "Bạn chưa đăng nhập"));
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "petshop_jwt_secret_2026"
    );

    req.user = normalizeDecodedUser(decoded);
    next();
  } catch (error) {
    return next(new ApiError(401, "Phiên đăng nhập không hợp lệ hoặc đã hết hạn"));
  }
};

const optionalAuth = (req, res, next) => {
  try {
    const token = getTokenFromHeader(req);

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "petshop_jwt_secret_2026"
    );

    req.user = normalizeDecodedUser(decoded);
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

const checkRole = (allowedRoles = []) => {
  const normalizedAllowedRoles = allowedRoles.map((role) =>
    String(role).toLowerCase()
  );

  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Bạn chưa đăng nhập"));
    }

    const role = String(req.user.role || "").toLowerCase();

    if (!normalizedAllowedRoles.includes(role)) {
      return next(new ApiError(403, "Bạn không có quyền truy cập"));
    }

    next();
  };
};

// =========================================================
// Middleware này dùng cho các API cần "mua mới"
// Nếu tài khoản customer bị khóa/ngừng hoạt động thì chặn
// Nhưng KHÔNG dùng middleware này cho API xem lịch sử đơn cũ
// =========================================================
const requireActiveCustomer = (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, "Bạn chưa đăng nhập"));
  }

  const role = String(req.user.role || "").toLowerCase();
  const status = String(req.user.status || "").toLowerCase();

  if (role !== "customer") {
    return next(new ApiError(403, "Bạn không có quyền truy cập"));
  }

  // Chỉ cho customer active mua mới
  if (status && status !== "active") {
    return next(
      new ApiError(
        403,
        "Tài khoản của bạn đã bị khóa hoặc ngừng hoạt động, không thể thực hiện mua hàng."
      )
    );
  }

  next();
};

exports.getTokenFromHeader = getTokenFromHeader;
exports.verifyToken = verifyToken;
exports.optionalAuth = optionalAuth;
exports.checkRole = checkRole;
exports.requireActiveCustomer = requireActiveCustomer;

exports.requireLogin = [verifyToken];

exports.requireAdmin = [verifyToken, checkRole(["admin"])];
exports.requireFarm = [verifyToken, checkRole(["farm"])];
exports.requireCustomer = [verifyToken, checkRole(["customer"])];
exports.requireAdminOrFarm = [verifyToken, checkRole(["admin", "farm"])];

// =========================================================
// Dùng bộ này cho API mua mới của customer
// =========================================================
exports.requireCustomerToPurchase = [
  verifyToken,
  checkRole(["customer"]),
  requireActiveCustomer,
];