const mongoose = require("mongoose");
const ServiceCategory = require("../models/serviceCategory.model");
const Service = require("../models/service.model");
const ApiError = require("../api-error");

const VALID_CATEGORY_STATUSES = ["Hoạt động", "Ngừng hoạt động"];

const normalizeText = (value) => String(value || "").trim();

const validateObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Tạo mã loại dịch vụ tự động
const generateNextCode = async () => {
  const lastCategory = await ServiceCategory.findOne().sort({ categoryCode: -1 });

  let nextCode = "LDV001";

  if (lastCategory && lastCategory.categoryCode) {
    const lastNumber = parseInt(
      String(lastCategory.categoryCode).replace("LDV", ""),
      10
    );

    if (!Number.isNaN(lastNumber)) {
      nextCode = "LDV" + String(lastNumber + 1).padStart(3, "0");
    }
  }

  return nextCode;
};

const validateCategoryPayload = async (payload, { isUpdate = false, currentId = null } = {}) => {
  const errors = [];

  const name = normalizeText(payload.name);
  const description = normalizeText(payload.description);
  const status = normalizeText(payload.status || "Hoạt động");

  if (!isUpdate || payload.name !== undefined) {
    if (!name) {
      errors.push("Vui lòng nhập tên loại dịch vụ");
    } else if (name.length < 2) {
      errors.push("Tên loại dịch vụ phải có ít nhất 2 ký tự");
    } else if (name.length > 120) {
      errors.push("Tên loại dịch vụ không được vượt quá 120 ký tự");
    } else {
      const existed = await ServiceCategory.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
        ...(currentId ? { _id: { $ne: currentId } } : {}),
      });

      if (existed) {
        errors.push("Loại dịch vụ này đã tồn tại");
      }
    }
  }

  if (!isUpdate || payload.description !== undefined) {
    if (description.length > 1000) {
      errors.push("Mô tả loại dịch vụ không được vượt quá 1000 ký tự");
    }
  }

  if (!isUpdate || payload.status !== undefined) {
    if (!VALID_CATEGORY_STATUSES.includes(status)) {
      errors.push("Trạng thái loại dịch vụ không hợp lệ");
    }
  }

  return {
    errors,
    cleanData: {
      name,
      description,
      status,
    },
  };
};

// 1. Thêm loại dịch vụ
exports.create = async (req, res, next) => {
  try {
    const { errors, cleanData } = await validateCategoryPayload(req.body);

    if (errors.length > 0) {
      return next(new ApiError(400, errors.join(". ")));
    }

    const categoryCode = await generateNextCode();

    const category = new ServiceCategory({
      categoryCode,
      name: cleanData.name,
      description: cleanData.description,
      status: cleanData.status || "Hoạt động",
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
    return next(
      new ApiError(500, "Lỗi khi lấy danh sách loại dịch vụ: " + error.message)
    );
  }
};

// 3. Lấy 1 loại dịch vụ
exports.findOne = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return next(new ApiError(400, "ID loại dịch vụ không hợp lệ"));
    }

    const category = await ServiceCategory.findById(id);

    if (!category) {
      return next(new ApiError(404, "Không tìm thấy loại dịch vụ"));
    }

    return res.send(category);
  } catch (error) {
    return next(
      new ApiError(500, "Lỗi khi lấy chi tiết loại dịch vụ: " + error.message)
    );
  }
};

// 4. Cập nhật loại dịch vụ
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return next(new ApiError(400, "ID loại dịch vụ không hợp lệ"));
    }

    const category = await ServiceCategory.findById(id);

    if (!category) {
      return next(new ApiError(404, "Không tìm thấy loại dịch vụ để cập nhật"));
    }

    const { errors, cleanData } = await validateCategoryPayload(req.body, {
      isUpdate: true,
      currentId: id,
    });

    if (errors.length > 0) {
      return next(new ApiError(400, errors.join(". ")));
    }

    if (req.body.name !== undefined) {
      category.name = cleanData.name;
    }

    if (req.body.description !== undefined) {
      category.description = cleanData.description;
    }

    if (req.body.status !== undefined) {
      category.status = cleanData.status;
    }

    await category.save();

    return res.send({
      message: "Cập nhật loại dịch vụ thành công!",
      category,
    });
  } catch (error) {
    return next(
      new ApiError(500, "Lỗi khi cập nhật loại dịch vụ: " + error.message)
    );
  }
};

// 5. Xóa loại dịch vụ
exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return next(new ApiError(400, "ID loại dịch vụ không hợp lệ"));
    }

    const category = await ServiceCategory.findById(id);

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

    await ServiceCategory.findByIdAndDelete(id);

    return res.send({
      message: "Xóa loại dịch vụ thành công!",
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi xóa loại dịch vụ: " + error.message));
  }
};