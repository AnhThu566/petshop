const Accessory = require("../models/accessory.model");
const ApiError = require("../api-error");

// Tạo mã phụ kiện tự động
const generateNextCode = async () => {
  const lastAccessory = await Accessory.findOne().sort({ maPhuKien: -1 });

  let nextCode = "PK001";

  if (lastAccessory && lastAccessory.maPhuKien) {
    const lastNumber = parseInt(lastAccessory.maPhuKien.replace("PK", ""), 10);
    nextCode = "PK" + (lastNumber + 1).toString().padStart(3, "0");
  }

  return nextCode;
};

// 1. Thêm phụ kiện
exports.create = async (req, res, next) => {
  try {
    const { name, price, quantity, description, status } = req.body;

    if (!name || price === undefined || quantity === undefined) {
      return next(new ApiError(400, "Vui lòng nhập đầy đủ thông tin phụ kiện"));
    }

    let imagePath = "";
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    const maPhuKien = await generateNextCode();

    const accessory = new Accessory({
      maPhuKien,
      name,
      price,
      quantity,
      description,
      image: imagePath,
      status: status || "Đang bán",
    });

    await accessory.save();

    return res.send({
      message: "Thêm phụ kiện thành công!",
      accessory,
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi thêm phụ kiện: " + error.message));
  }
};

// 2. Lấy tất cả phụ kiện
exports.findAll = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.public === "true") {
      filter.status = "Đang bán";
    }

    const accessories = await Accessory.find(filter).sort({ createdAt: -1 });

    return res.send(accessories);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi lấy danh sách phụ kiện: " + error.message));
  }
};

// 3. Lấy 1 phụ kiện
exports.findOne = async (req, res, next) => {
  try {
    const accessory = await Accessory.findById(req.params.id);

    if (!accessory) {
      return next(new ApiError(404, "Không tìm thấy phụ kiện"));
    }

    return res.send(accessory);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi lấy chi tiết phụ kiện: " + error.message));
  }
};

// 4. Cập nhật phụ kiện
exports.update = async (req, res, next) => {
  try {
    const { name, price, quantity, description, status } = req.body;

    const updateData = {
      name,
      price,
      quantity,
      description,
      status,
    };

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const accessory = await Accessory.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    if (!accessory) {
      return next(new ApiError(404, "Không tìm thấy phụ kiện để cập nhật"));
    }

    return res.send({
      message: "Cập nhật phụ kiện thành công!",
      accessory,
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi cập nhật phụ kiện: " + error.message));
  }
};

// 5. Xóa phụ kiện
exports.delete = async (req, res, next) => {
  try {
    const accessory = await Accessory.findByIdAndDelete(req.params.id);

    if (!accessory) {
      return next(new ApiError(404, "Không tìm thấy phụ kiện để xóa"));
    }

    return res.send({
      message: "Xóa phụ kiện thành công!",
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi xóa phụ kiện: " + error.message));
  }
};