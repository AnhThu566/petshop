const Service = require("../models/service.model");
const ApiError = require("../api-error");

const generateNextCode = async () => {
  const lastService = await Service.findOne().sort({ maDichVu: -1 });

  let nextCode = "DV001";

  if (lastService && lastService.maDichVu) {
    const lastNumber = parseInt(lastService.maDichVu.replace("DV", ""), 10);
    nextCode = "DV" + (lastNumber + 1).toString().padStart(3, "0");
  }

  return nextCode;
};

// 1. Thêm dịch vụ
exports.create = async (req, res, next) => {
  try {
    const { name, price, description, status } = req.body;

    if (!name || price === undefined || price === null || price === "") {
      return next(new ApiError(400, "Vui lòng nhập đầy đủ thông tin dịch vụ"));
    }

    let imagePath = "";
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    const maDichVu = await generateNextCode();

    const service = new Service({
      maDichVu,
      name,
      price,
      description,
      image: imagePath,
      status: status || "Đang hoạt động",
    });

    await service.save();

    return res.send({
      message: "Thêm dịch vụ thành công!",
      service,
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

    const services = await Service.find(filter).sort({ createdAt: -1 });

    return res.send(services);
  } catch (error) {
    console.error("LỖI FIND ALL SERVICES:", error);
    return next(new ApiError(500, "Lỗi khi lấy danh sách dịch vụ: " + error.message));
  }
};

// 3. Lấy chi tiết 1 dịch vụ
exports.findOne = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return next(new ApiError(404, "Không tìm thấy dịch vụ"));
    }

    return res.send(service);
  } catch (error) {
    console.error("Lỗi findOne service:", error);
    return next(new ApiError(500, "Lỗi khi lấy chi tiết dịch vụ: " + error.message));
  }
};

// 4. Cập nhật dịch vụ
exports.update = async (req, res, next) => {
  try {
    const { name, price, description, status } = req.body;

    const updateData = {
      name,
      price,
      description,
      status,
    };

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!service) {
      return next(new ApiError(404, "Không tìm thấy dịch vụ để cập nhật"));
    }

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
    const service = await Service.findByIdAndDelete(req.params.id);

    if (!service) {
      return next(new ApiError(404, "Không tìm thấy dịch vụ để xóa"));
    }

    return res.send({
      message: "Xóa dịch vụ thành công!",
    });
  } catch (error) {
    console.error("Lỗi delete service:", error);
    return next(new ApiError(500, "Lỗi khi xóa dịch vụ: " + error.message));
  }
};