const Vaccine = require("../models/vaccine.model");
const ApiError = require("../api-error");

// 1. Thêm Vaccine mới (Tự động sinh mã VC001...)
exports.create = async (req, res, next) => {
    try {
        const { name, description, status } = req.body;
        if (!name) return next(new ApiError(400, "Tên vaccine không được để trống!"));

        // Logic tự động sinh mã VC...
        const lastVaccine = await Vaccine.findOne().sort({ maVaccine: -1 });
        let nextCode = "VC001";
        if (lastVaccine && lastVaccine.maVaccine) {
            const lastNumber = parseInt(lastVaccine.maVaccine.replace("VC", ""), 10);
            nextCode = "VC" + (lastNumber + 1).toString().padStart(3, "0");
        }

        const newVaccine = new Vaccine({ maVaccine: nextCode, name, description, status });
        await newVaccine.save();
        
        res.send({ message: "Thêm vaccine thành công!", vaccine: newVaccine });
    } catch (error) {
        return next(new ApiError(500, "Lỗi khi tạo vaccine: " + error.message));
    }
};

// 2. Lấy danh sách Vaccine
exports.findAll = async (req, res, next) => {
    try {
        const vaccines = await Vaccine.find();
        res.send(vaccines);
    } catch (error) {
        return next(new ApiError(500, "Lỗi lấy danh sách vaccine"));
    }
};

// 3. Cập nhật Vaccine
exports.update = async (req, res, next) => {
    try {
        const updatedVaccine = await Vaccine.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedVaccine) return next(new ApiError(404, "Không tìm thấy vaccine!"));
        res.send({ message: "Cập nhật thành công!", vaccine: updatedVaccine });
    } catch (error) {
        return next(new ApiError(500, "Lỗi cập nhật vaccine"));
    }
};

// 4. Xóa Vaccine
exports.delete = async (req, res, next) => {
    try {
        const deletedVaccine = await Vaccine.findByIdAndDelete(req.params.id);
        if (!deletedVaccine) return next(new ApiError(404, "Không tìm thấy vaccine!"));
        res.send({ message: "Xóa vaccine thành công!" });
    } catch (error) {
        return next(new ApiError(500, "Lỗi xóa vaccine"));
    }
};