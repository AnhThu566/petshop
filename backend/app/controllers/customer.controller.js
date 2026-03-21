const User = require("../models/user.model");
const ApiError = require("../api-error");

// 1. Khớp với customerController.findAll
exports.findAll = async (req, res, next) => {
    try {
        const customers = await User.find({ role: "customer" }).select("-password").sort({ createdAt: -1 });
        res.send(customers);
    } catch (error) {
        return next(new ApiError(500, "Lỗi lấy danh sách khách hàng"));
    }
};

// 2. Khớp với customerController.getNextCode
exports.getNextCode = async (req, res, next) => {
    try {
        const lastCustomer = await User.findOne({ role: "customer" }).sort({ customerCode: -1 });
        let nextCode = "KH001";
        if (lastCustomer && lastCustomer.customerCode) {
            const lastNumber = parseInt(lastCustomer.customerCode.replace("KH", ""), 10);
            nextCode = "KH" + (lastNumber + 1).toString().padStart(3, "0");
        }
        res.send({ nextCode });
    } catch (error) {
        return next(new ApiError(500, "Lỗi tạo mã khách hàng"));
    }
};

// 3. Khớp với customerController.update (LỖI THƯỜNG Ở ĐÂY)
exports.update = async (req, res, next) => {
    try {
        const { id } = req.params;
        // Sửa lỗi: Đảm bảo có hàm update này để Route gọi được
        const updated = await User.findByIdAndUpdate(id, req.body, { new: true });
        if (!updated) return next(new ApiError(404, "Khách hàng không tồn tại"));
        res.send({ message: "Cập nhật thành official thành công!", data: updated });
    } catch (error) {
        return next(new ApiError(500, "Lỗi khi cập nhật khách hàng"));
    }
};

// 4. Khớp với customerController.delete
exports.delete = async (req, res, next) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.send({ message: "Đã xóa khách hàng thành công" });
    } catch (error) {
        return next(new ApiError(500, "Lỗi khi xóa khách hàng"));
    }
};

// 5.Thêm hàm tạo mới khách hàng
exports.create = async (req, res, next) => {
    try {
        const { username, password, email, fullName, phone, gender, birthday } = req.body;

        // 1. Kiểm tra trùng lặp
        const userExists = await User.findOne({ $or: [{ username }, { email }] });
        if (userExists) return next(new ApiError(400, "Username hoặc Email đã tồn tại!"));

        // 2. Tự động lấy mã KH tiếp theo
        const lastCustomer = await User.findOne({ role: "customer" }).sort({ customerCode: -1 });
        let nextCode = "KH001";
        if (lastCustomer && lastCustomer.customerCode) {
            const lastNumber = parseInt(lastCustomer.customerCode.replace("KH", ""), 10);
            nextCode = "KH" + (lastNumber + 1).toString().padStart(3, "0");
        }

        // 3. Tạo User mới với mật khẩu mặc định
        const newUser = new User({
            username,
            email,
            fullName,
            phone,
            gender,
            birthday,
            customerCode: nextCode,
            password:password || "password123", // Mật khẩu mặc định cho Admin tạo
            role: "customer",
            status: "active"
        });

        await newUser.save();
        res.send({ message: "Thêm khách hàng thành công!", customerCode: nextCode });
    } catch (error) {
        return next(new ApiError(500, "Lỗi khi tạo khách hàng: " + error.message));
    }
};