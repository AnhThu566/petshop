const ServiceCategory = require("../models/serviceCategory.model");
const Service = require("../models/service.model");
const ApiError = require("../api-error");

// Tạo mã loại dịch vụ tự động
const generateNextCode = async () => {
  const lastCategory = await ServiceCategory.findOne().sort({ maLoaiDichVu: -1 });

  let nextCode = "LDV001";

  if (lastCategory && lastCategory.maLoaiDichVu) {
    const lastNumber = parseInt(lastCategory.maLoaiDichVu.replace("LDV", ""), 10);
    nextCode = "LDV" + (lastNumber + 1).toString().padStart(3, "0");
  }

  return nextCode;
};

// 1. Thêm loại dịch vụ
exports.create = async (req, res, next) => {
  try {
    const { name, description, status } = req.body;

    if (!name || !name.trim()) {
      return next(new ApiError(400, "Vui lòng nhập tên loại dịch vụ"));
    }

    const existed = await ServiceCategory.findOne({
      name: name.trim(),
    });

    if (existed) {
      return next(new ApiError(400, "Loại dịch vụ này đã tồn tại"));
    }

    const maLoaiDichVu = await generateNextCode();

    const category = new ServiceCategory({
      maLoaiDichVu,
      name: name.trim(),
      description: description ? description.trim() : "",
      status: status || "Hoạt động",
    });

    await category.save();

    return res.send({
      message: "Thêm loại dịch vụ thành công!",
      category,
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi thêm loại dịch vụ: " + error.message));
  }
};

// 2. Lấy tất cả loại dịch vụ
exports.findAll = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.active === "true") {
      filter.status = "Hoạt động";
    }

    const categories = await ServiceCategory.find(filter).sort({ createdAt: -1 });

    return res.send(categories);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi lấy danh sách loại dịch vụ: " + error.message));
  }
};

// 3. Lấy 1 loại dịch vụ
exports.findOne = async (req, res, next) => {
  try {
    const category = await ServiceCategory.findById(req.params.id);

    if (!category) {
      return next(new ApiError(404, "Không tìm thấy loại dịch vụ"));
    }

    return res.send(category);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi lấy chi tiết loại dịch vụ: " + error.message));
  }
};

// 4. Cập nhật loại dịch vụ
exports.update = async (req, res, next) => {
  try {
    const { name, description, status } = req.body;

    const category = await ServiceCategory.findById(req.params.id);
    if (!category) {
      return next(new ApiError(404, "Không tìm thấy loại dịch vụ để cập nhật"));
    }

    if (name && name.trim()) {
      const existed = await ServiceCategory.findOne({
        _id: { $ne: req.params.id },
        name: name.trim(),
      });

      if (existed) {
        return next(new ApiError(400, "Tên loại dịch vụ đã tồn tại"));
      }

      category.name = name.trim();
    }

    if (description !== undefined) {
      category.description = description ? description.trim() : "";
    }

    if (status) {
      category.status = status;
    }

    await category.save();

    return res.send({
      message: "Cập nhật loại dịch vụ thành công!",
      category,
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi cập nhật loại dịch vụ: " + error.message));
  }
};

// 5. Xóa loại dịch vụ
exports.delete = async (req, res, next) => {
  try {
    const category = await ServiceCategory.findById(req.params.id);

    if (!category) {
      return next(new ApiError(404, "Không tìm thấy loại dịch vụ để xóa"));
    }

    const usedByServices = await Service.findOne({ categoryId: category._id });
    if (usedByServices) {
      return next(
        new ApiError(
          400,
          "Không thể xóa loại dịch vụ này vì đang có dịch vụ sử dụng"
        )
      );
    }

    await ServiceCategory.findByIdAndDelete(req.params.id);

    return res.send({
      message: "Xóa loại dịch vụ thành công!",
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi xóa loại dịch vụ: " + error.message));
  }
};