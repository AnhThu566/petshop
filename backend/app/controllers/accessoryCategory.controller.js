const AccessoryCategory = require("../models/accessoryCategory.model");
const Accessory = require("../models/accessory.model");
const ApiError = require("../api-error");

// Tạo mã loại phụ kiện tự động
const generateNextCode = async () => {
  const lastCategory = await AccessoryCategory.findOne().sort({ maLoaiPhuKien: -1 });

  let nextCode = "LPK001";

  if (lastCategory && lastCategory.maLoaiPhuKien) {
    const lastNumber = parseInt(lastCategory.maLoaiPhuKien.replace("LPK", ""), 10);
    nextCode = "LPK" + (lastNumber + 1).toString().padStart(3, "0");
  }

  return nextCode;
};

// 1. Thêm loại phụ kiện
exports.create = async (req, res, next) => {
  try {
    const { name, description, status } = req.body;

    if (!name || !name.trim()) {
      return next(new ApiError(400, "Vui lòng nhập tên loại phụ kiện"));
    }

    const existed = await AccessoryCategory.findOne({
      name: name.trim(),
    });

    if (existed) {
      return next(new ApiError(400, "Loại phụ kiện này đã tồn tại"));
    }

    const maLoaiPhuKien = await generateNextCode();

    const category = new AccessoryCategory({
      maLoaiPhuKien,
      name: name.trim(),
      description: description ? description.trim() : "",
      status: status || "Hoạt động",
    });

    await category.save();

    return res.send({
      message: "Thêm loại phụ kiện thành công!",
      category,
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi thêm loại phụ kiện: " + error.message));
  }
};

// 2. Lấy tất cả loại phụ kiện
exports.findAll = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.active === "true") {
      filter.status = "Hoạt động";
    }

    const categories = await AccessoryCategory.find(filter).sort({ createdAt: -1 });

    return res.send(categories);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi lấy danh sách loại phụ kiện: " + error.message));
  }
};

// 3. Lấy 1 loại phụ kiện
exports.findOne = async (req, res, next) => {
  try {
    const category = await AccessoryCategory.findById(req.params.id);

    if (!category) {
      return next(new ApiError(404, "Không tìm thấy loại phụ kiện"));
    }

    return res.send(category);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi lấy chi tiết loại phụ kiện: " + error.message));
  }
};

// 4. Cập nhật loại phụ kiện
exports.update = async (req, res, next) => {
  try {
    const { name, description, status } = req.body;

    const category = await AccessoryCategory.findById(req.params.id);
    if (!category) {
      return next(new ApiError(404, "Không tìm thấy loại phụ kiện để cập nhật"));
    }

    if (name && name.trim()) {
      const existed = await AccessoryCategory.findOne({
        _id: { $ne: req.params.id },
        name: name.trim(),
      });

      if (existed) {
        return next(new ApiError(400, "Tên loại phụ kiện đã tồn tại"));
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
      message: "Cập nhật loại phụ kiện thành công!",
      category,
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi cập nhật loại phụ kiện: " + error.message));
  }
};

// 5. Xóa loại phụ kiện
exports.delete = async (req, res, next) => {
  try {
    const category = await AccessoryCategory.findById(req.params.id);

    if (!category) {
      return next(new ApiError(404, "Không tìm thấy loại phụ kiện để xóa"));
    }

    const usedByAccessories = await Accessory.findOne({ categoryId: category._id });
    if (usedByAccessories) {
      return next(
        new ApiError(
          400,
          "Không thể xóa loại phụ kiện này vì đang có phụ kiện sử dụng"
        )
      );
    }

    await AccessoryCategory.findByIdAndDelete(req.params.id);

    return res.send({
      message: "Xóa loại phụ kiện thành công!",
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi xóa loại phụ kiện: " + error.message));
  }
};