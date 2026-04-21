const mongoose = require("mongoose");
const Service = require("../models/service.model");
const ServiceCategory = require("../models/serviceCategory.model");
const ServiceBooking = require("../models/serviceBooking.model");
const ApiError = require("../api-error");

const VALID_SERVICE_STATUSES = ["Đang hoạt động", "Ngừng hoạt động"];

const generateNextCode = async () => {
  const lastService = await Service.findOne().sort({ serviceCode: -1 });

  let nextCode = "DV001";
  if (lastService && lastService.serviceCode) {
    const lastNumber = parseInt(lastService.serviceCode.replace("DV", ""), 10);
    nextCode = "DV" + (lastNumber + 1).toString().padStart(3, "0");
  }

  return nextCode;
};

const normalizeText = (value) => String(value || "").trim();

const validateObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const validateServicePayload = async (payload, { isUpdate = false } = {}) => {
  const errors = [];

  const name = normalizeText(payload.name);
  const description = normalizeText(payload.description);
  const status = normalizeText(payload.status || "Đang hoạt động");
  const price =
    payload.price === undefined || payload.price === null || payload.price === ""
      ? null
      : Number(payload.price);
  const categoryId = payload.categoryId || null;

  if (!isUpdate || payload.name !== undefined) {
    if (!name) {
      errors.push("Tên dịch vụ không được để trống");
    } else if (name.length < 3) {
      errors.push("Tên dịch vụ phải có ít nhất 3 ký tự");
    } else if (name.length > 120) {
      errors.push("Tên dịch vụ không được vượt quá 120 ký tự");
    }
  }

  if (!isUpdate || payload.price !== undefined) {
    if (price === null || Number.isNaN(price)) {
      errors.push("Giá dịch vụ phải là số hợp lệ");
    } else if (price < 0) {
      errors.push("Giá dịch vụ không được nhỏ hơn 0");
    }
  }

  if (!isUpdate || payload.status !== undefined) {
    if (!VALID_SERVICE_STATUSES.includes(status)) {
      errors.push("Trạng thái dịch vụ không hợp lệ");
    }
  }

  if (!isUpdate || payload.description !== undefined) {
    if (description.length > 2000) {
      errors.push("Mô tả dịch vụ không được vượt quá 2000 ký tự");
    }
  }

  let category = null;
  if (!isUpdate || payload.categoryId !== undefined) {
    if (!categoryId) {
      errors.push("Vui lòng chọn loại dịch vụ");
    } else if (!validateObjectId(categoryId)) {
      errors.push("Loại dịch vụ không hợp lệ");
    } else {
      category = await ServiceCategory.findById(categoryId);
      if (!category) {
        errors.push("Không tìm thấy loại dịch vụ");
      } else if (category.status !== "Hoạt động") {
        errors.push("Loại dịch vụ này hiện không hoạt động");
      }
    }
  }

  return {
    errors,
    cleanData: {
      name,
      price,
      description,
      status,
      categoryId: categoryId || null,
    },
    category,
  };
};

// 1. Thêm dịch vụ
exports.create = async (req, res, next) => {
  try {
    const { errors, cleanData } = await validateServicePayload(req.body);

    if (errors.length) {
      return next(new ApiError(400, errors.join(". ")));
    }

    if (!req.file) {
      return next(new ApiError(400, "Vui lòng chọn hình ảnh cho dịch vụ"));
    }

    const serviceCode = await generateNextCode();
    const imagePath = `/uploads/${req.file.filename}`;

    const service = new Service({
      serviceCode,
      categoryId: cleanData.categoryId,
      name: cleanData.name,
      price: cleanData.price,
      description: cleanData.description,
      image: imagePath,
      status: cleanData.status || "Đang hoạt động",
    });

    await service.save();

    const populatedService = await Service.findById(service._id).populate(
      "categoryId",
      "categoryCode name status"
    );

    return res.send({
      message: "Thêm dịch vụ thành công!",
      service: populatedService,
    });
  } catch (error) {
    console.error("Lỗi create service:", error);
    return next(new ApiError(500, "Lỗi khi thêm dịch vụ: " + error.message));
  }
};

// 2. Lấy tất cả dịch vụ
exports.findAll = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.public === "true") {
      filter.status = "Đang hoạt động";
    }

    if (req.query.categoryId) {
      if (!validateObjectId(req.query.categoryId)) {
        return next(new ApiError(400, "categoryId không hợp lệ"));
      }
      filter.categoryId = req.query.categoryId;
    }

    const services = await Service.find(filter)
      .populate("categoryId", "categoryCode name status")
      .sort({ createdAt: -1 });

    return res.send(services);
  } catch (error) {
    console.error("LỖI FIND ALL SERVICES:", error);
    return next(
      new ApiError(500, "Lỗi khi lấy danh sách dịch vụ: " + error.message)
    );
  }
};

// 3. Lấy chi tiết 1 dịch vụ
exports.findOne = async (req, res, next) => {
  try {
    if (!validateObjectId(req.params.id)) {
      return next(new ApiError(400, "ID dịch vụ không hợp lệ"));
    }

    const service = await Service.findById(req.params.id).populate(
      "categoryId",
      "categoryCode name status"
    );

    if (!service) {
      return next(new ApiError(404, "Không tìm thấy dịch vụ"));
    }

    return res.send(service);
  } catch (error) {
    console.error("Lỗi findOne service:", error);
    return next(
      new ApiError(500, "Lỗi khi lấy chi tiết dịch vụ: " + error.message)
    );
  }
};

// 4. Cập nhật dịch vụ
exports.update = async (req, res, next) => {
  try {
    if (!validateObjectId(req.params.id)) {
      return next(new ApiError(400, "ID dịch vụ không hợp lệ"));
    }

    const serviceExists = await Service.findById(req.params.id);
    if (!serviceExists) {
      return next(new ApiError(404, "Không tìm thấy dịch vụ để cập nhật"));
    }

    const { errors, cleanData } = await validateServicePayload(req.body, {
      isUpdate: true,
    });

    if (errors.length) {
      return next(new ApiError(400, errors.join(". ")));
    }

    if (!serviceExists.image && !req.file) {
      return next(new ApiError(400, "Dịch vụ phải có hình ảnh"));
    }

    const updateData = {};

    if (req.body.name !== undefined) updateData.name = cleanData.name;
    if (req.body.price !== undefined) updateData.price = cleanData.price;
    if (req.body.description !== undefined) {
      updateData.description = cleanData.description;
    }
    if (req.body.status !== undefined) updateData.status = cleanData.status;
    if (req.body.categoryId !== undefined) {
      updateData.categoryId = cleanData.categoryId;
    }

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate("categoryId", "categoryCode name status");

    return res.send({
      message: "Cập nhật dịch vụ thành công!",
      service,
    });
  } catch (error) {
    console.error("Lỗi update service:", error);
    return next(new ApiError(500, "Lỗi khi cập nhật dịch vụ: " + error.message));
  }
};

// 5. Xóa dịch vụ
exports.delete = async (req, res, next) => {
  try {
    if (!validateObjectId(req.params.id)) {
      return next(new ApiError(400, "ID dịch vụ không hợp lệ"));
    }

    const service = await Service.findById(req.params.id);
    if (!service) {
      return next(new ApiError(404, "Không tìm thấy dịch vụ để xóa"));
    }

    const activeBooking = await ServiceBooking.findOne({
      serviceId: service._id,
      status: { $in: ["Chờ xác nhận", "Đã xác nhận"] },
    });

    if (activeBooking) {
      return next(
        new ApiError(
          400,
          "Không thể xóa dịch vụ vì đang có lịch đặt chưa hoàn tất hoặc chưa hủy"
        )
      );
    }

    await Service.findByIdAndDelete(req.params.id);

    return res.send({
      message: "Xóa dịch vụ thành công!",
    });
  } catch (error) {
    console.error("Lỗi delete service:", error);
    return next(new ApiError(500, "Lỗi khi xóa dịch vụ: " + error.message));
  }
};