const Farm = require("../models/farm.model");
const ApiError = require("../api-error");
const Dog = require("../models/dog.model"); // Cần cái này để check xem trại có chó không lúc Xóa

// 1. HÀM LẤY DANH SÁCH (Của em viết rất chuẩn, tôi giữ nguyên)
exports.findAll = async (req, res, next) => {
    try {
        const farms = await Farm.find().populate("ownerId", "username email");
        return res.send(farms);
    } catch (error) {
        return next(new ApiError(500, "Lỗi khi lấy danh sách trại"));
    }
};

// 2. HÀM TẠO TRẠI CHÓ MỚI
exports.create = async (req, res, next) => {
    try {
        const { maTrai, name, address, phone, description, ownerId, status } = req.body;
        
        if (!name || !address || !phone || !ownerId) {
            return next(new ApiError(400, "Tên, địa chỉ, SĐT và Chủ trại không được để trống!"));
        }

        const newFarm = new Farm({
            maTrai, name, address, phone, 
            farmDescription: description, // Đổi cho khớp với model nếu cần
            ownerId, status,
            // Lưu dạng chuỗi đơn thay vì mảng để khớp với FarmForm.vue
            image: req.file ? `/public/uploads/${req.file.filename}` : null 
        });

        await newFarm.save();
        res.send({ message: "Thêm trại chó thành công!", farm: newFarm });
    } catch (error) {
        return next(new ApiError(500, "Lỗi khi tạo trại chó: " + error.message));
    }
};

// 3. HÀM CẬP NHẬT TRẠI CHÓ
exports.update = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        // Kiểm tra an toàn để tránh lỗi "undefined"
        if (!id || id === "undefined") {
            return next(new ApiError(400, "ID trang trại không hợp lệ!"));
        }

        const { _id, maTrai, ...updateData } = req.body; 

        if (req.file) {
            // Cập nhật đường dẫn ảnh mới
            updateData.image = `/public/uploads/${req.file.filename}`; 
        }

        const updatedFarm = await Farm.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true } 
        ).populate("ownerId", "username email");

        if (!updatedFarm) return next(new ApiError(404, "Không tìm thấy trại chó này!"));

        res.send({ message: "Cập nhật thành công!", farm: updatedFarm });
    } catch (error) {
        return next(new ApiError(500, `Lỗi khi cập nhật trại: ${error.message}`));
    }
};

// 4. HÀM XÓA TRẠI CHÓ (Quy tắc thép: Có chó thì không được xóa)
exports.delete = async (req, res, next) => {
    try {
        const { id } = req.params;

        // BƯỚC 1: Kiểm tra xem trại này có đang cung cấp chó không
        const linkedDogsCount = await Dog.countDocuments({ farmId: id });

        if (linkedDogsCount > 0) {
            return next(
                new ApiError(400, `KHÔNG THỂ XÓA: Trại này đang cung cấp ${linkedDogsCount} bé chó. Vui lòng chuyển trạng thái sang "Ngừng hợp tác"!`)
            );
        }

        // BƯỚC 2: An toàn thì tiến hành xóa
        const deletedFarm = await Farm.findByIdAndDelete(id);

        if (!deletedFarm) return next(new ApiError(404, "Trại chó không tồn tại!"));

        res.send({ message: "Đã xóa trại chó thành công!" });
    } catch (error) {
        return next(new ApiError(500, `Lỗi khi xóa trại chó: ${error.message}`));
    }
};

// 5. HÀM TỰ ĐỘNG SINH MÃ TRẠI (VD: T001, T002)
exports.getNextCode = async (req, res, next) => {
    try {
        const lastFarm = await Farm.findOne().sort({ maTrai: -1 });
        let nextCode = "T001"; 

        if (lastFarm && lastFarm.maTrai) {
            const lastNumber = parseInt(lastFarm.maTrai.replace("T", ""), 10);
            const nextNumber = lastNumber + 1;
            nextCode = "T" + nextNumber.toString().padStart(3, "0");
        }

        res.send({ nextCode: nextCode });
    } catch (error) {
        return next(new ApiError(500, "Lỗi khi tạo mã trại tự động"));
    }
};