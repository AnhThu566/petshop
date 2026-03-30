const express = require("express");
const cors = require("cors");
const ApiError = require("./app/api-error");
const mockAuth = require("./app/middlewares/mock-auth.middleware");


// --- IMPORT CÁC ROUTE ---
const authRouter = require("./app/routes/auth.route");
const breedRouter = require("./app/routes/breed.route");
const dogRouter = require("./app/routes/dog.route");
const farmRouter = require("./app/routes/farm.route");
const customerRouter = require("./app/routes/customer.route");
const vaccineRouter = require("./app/routes/vaccine.route");
const orderRouter = require("./app/routes/order.route");
const accessoryRouter = require("./app/routes/accessory.route");
const serviceRouter = require("./app/routes/service.route");
const ServiceBookingRouter = require("./app/routes/serviceBooking.route");
const accessoryOrderRouter = require("./app/routes/accessoryOrder.route");
const accessoryCategoryRouter = require("./app/routes/accessoryCategory.route");
const serviceCategoryRouter = require("./app/routes/serviceCategory.route");
const notificationRouter = require("./app/routes/notification.route");


const app = express();

app.use(cors());
app.use(express.json());
// Cấp quyền truy cập công khai cho thư mục uploads
app.use('/uploads', express.static('uploads'));
// Middleware giả lập xác thực người dùng
app.use(mockAuth);

app.get("/", (req, res) => {
    res.json({ message: "Welcome to PetShop application." });
});

// --- ĐĂNG KÝ CÁC ROUTE ---
app.use("/api/auth", authRouter);
app.use("/api/breeds", breedRouter);
app.use("/api/dogs", dogRouter);
app.use("/api/farms", farmRouter);
app.use("/api/customers", customerRouter);
app.use("/api/vaccines", vaccineRouter); // Đăng ký route cho vaccine
app.use("/api/orders", orderRouter); // Đăng ký route cho đơn đặt cọc
app.use("/api/accessories", accessoryRouter); // Đăng ký route cho phụ kiện
app.use("/api/services", serviceRouter); // Đăng ký route cho dịch vụ
app.use("/api/service-bookings", ServiceBookingRouter); // Đăng ký route cho đặt lịch dịch vụ
app.use("/api/accessory-orders", accessoryOrderRouter); // Đăng ký route cho đặt hàng phụ kiện
app.use("/api/accessory-categories", accessoryCategoryRouter); // Đăng ký route cho loại phụ kiện
app.use("/api/service-categories", serviceCategoryRouter); // Đăng ký route cho loại dịch vụ
app.use("/api/notifications", require("./app/routes/notification.route")); // Đăng ký route cho thông báo


// --- XỬ LÝ LỖI ---
app.use((req, res, next) => {
    return next(new ApiError(404, "Resource not found"));
});

app.use((err, req, res, next) => {
    return res.status(err.statusCode || 500).json({
        message: err.message || "Internal Server Error",
    });
});


module.exports = app;