const jwt = require("jsonwebtoken");
const ApiError = require("../api-error");

const getTokenFromHeader = (req) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader) return null;

  const [type, token] = authHeader.split(" ");

  if (type !== "Bearer" || !token) return null;

  return token;
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

    req.user = decoded;
    next();
  } catch (error) {
    return next(new ApiError(401, "Phiên đăng nhập không hợp lệ hoặc đã hết hạn"));
  }
};

const checkRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Bạn chưa đăng nhập"));
    }

    const role = req.user.role;

    if (!allowedRoles.includes(role)) {
      return next(new ApiError(403, "Bạn không có quyền truy cập"));
    }

    next();
  };
};

exports.requireLogin = [verifyToken];

exports.requireAdmin = [verifyToken, checkRole(["admin"])];
exports.requireFarm = [verifyToken, checkRole(["farm"])];
exports.requireCustomer = [verifyToken, checkRole(["customer"])];