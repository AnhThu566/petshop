const User = require("../models/user.model");
const Farm = require("../models/farm.model");
const ApiError = require("../api-error");

// 1. ĐĂNG KÝ TRANG TRẠI (Quy trình tạo User + Farm)
exports.registerFarm = async (req, res, next) => {
    try {
        const { username, password, email, fullName, phone, address, name, farmDescription } = req.body;

        const userExists = await User.findOne({ $or: [{ username }, { email }] });
        if (userExists) return next(new ApiError(400, "Tên đăng nhập hoặc Email đã tồn tại!"));

        const newUser = new User({
            username, password, email, fullName, role: "farm", status: "active"
        });
        const savedUser = await newUser.save();

        // Tự động sinh mã trang trại
        const lastFarm = await Farm.findOne().sort({ maTrai: -1 });
        let nextCode = "T001";
        if (lastFarm && lastFarm.maTrai) {
            const lastNumber = parseInt(lastFarm.maTrai.replace("T", ""), 10);
            nextCode = "T" + (lastNumber + 1).toString().padStart(3, "0");
        }

        const newFarm = new Farm({
            maTrai: nextCode,
            name, address, phone, farmDescription,
            ownerId: savedUser._id,
            image: req.file ? `/public/uploads/${req.file.filename}` : null 
        });
        await newFarm.save();

        return res.send({ message: "Tạo tài khoản và hồ sơ Trại thành công!", maTrai: nextCode });
    } catch (error) {
        return next(new ApiError(500, "Lỗi khi đăng ký trại: " + error.message));
    }
};

// 2. ĐĂNG NHẬP CHUNG
exports.login = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user || user.password !== password) {
            return next(new ApiError(401, "Tài khoản hoặc mật khẩu không chính xác"));
        }
        if (user.status === 'locked') {
            return next(new ApiError(403, "Tài khoản của bạn đã bị khóa!"));
        }

        let farmId = null;
        if (user.role === "farm") {
            const farm = await Farm.findOne({ ownerId: user._id });
            farmId = farm ? farm._id : null;
        }

        res.send({
            message: "Đăng nhập thành công",
            user: { id: user._id, username: user.username, role: user.role, fullName: user.fullName, farmId }
        });
    } catch (error) {
        return next(new ApiError(500, "Lỗi đăng nhập: " + error.message));
    }
};

// 3. ĐĂNG KÝ KHÁCH HÀNG MỚI (Dành cho trang chủ)
exports.register = async (req, res, next) => {
    try {
        const { username, password, email, fullName } = req.body;
        const userExists = await User.findOne({ $or: [{ username }, { email }] });
        if (userExists) return next(new ApiError(400, "Tên đăng nhập hoặc Email đã tồn tại!"));

        // Mặc định role là customer cho người dùng đăng ký từ web
        const newUser = new User({
            username, password, email, fullName, role: "customer", status: "active" 
        });
        await newUser.save();
        return res.send({ message: "Đăng ký thành công!", username: newUser.username });
    } catch (error) {
        return next(new ApiError(500, "Lỗi server: " + error.message));
    }
};