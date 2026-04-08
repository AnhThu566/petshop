const fs = require("fs");
const path = require("path");

const Accessory = require("../models/accessory.model");
const AccessoryCategory = require("../models/accessoryCategory.model");
const ApiError = require("../api-error");

// Xóa file ảnh cũ nếu tồn tại
const removeImageFile = (imagePath) => {
  try {
    if (!imagePath) return;

    const cleanPath = imagePath.startsWith("/")
      ? imagePath.substring(1)
      : imagePath;

    const filePath = path.join(process.cwd(), cleanPath);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error("Lỗi khi xóa ảnh phụ kiện:", error.message);
  }
};

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
    const { categoryId, name, price, quantity, description, status } = req.body;

    if (!name || price === undefined || quantity === undefined) {
      return next(new ApiError(400, "Vui lòng nhập đầy đủ thông tin phụ kiện"));
    }

    if (categoryId) {
      const category = await AccessoryCategory.findById(categoryId);
      if (!category) {
        return next(new ApiError(404, "Không tìm thấy loại phụ kiện"));
      }

      if (category.status !== "Hoạt động") {
        return next(new ApiError(400, "Loại phụ kiện này hiện không hoạt động"));
      }
    }

    let imagePath = "";
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    const maPhuKien = await generateNextCode();

    const accessory = new Accessory({
      maPhuKien,
      categoryId: categoryId || null,
      name,
      price,
      quantity,
      description: description || "",
      image: imagePath,
      status: status || "Đang bán",
    });

    await accessory.save();

    const populatedAccessory = await Accessory.findById(accessory._id)
      .populate("categoryId", "maLoaiPhuKien name status");

    return res.send({
      message: "Thêm phụ kiện thành công!",
      accessory: populatedAccessory,
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

    if (req.query.categoryId) {
      filter.categoryId = req.query.categoryId;
    }

    const accessories = await Accessory.find(filter)
      .populate("categoryId", "maLoaiPhuKien name status")
      .sort({ createdAt: -1 });

    return res.send(accessories);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi lấy danh sách phụ kiện: " + error.message));
  }
};

// 3. Lấy 1 phụ kiện
exports.findOne = async (req, res, next) => {
  try {
    const accessory = await Accessory.findById(req.params.id)
      .populate("categoryId", "maLoaiPhuKien name status");

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
    const { categoryId, name, price, quantity, description, status, removeImage } = req.body;

    const accessory = await Accessory.findById(req.params.id);
    if (!accessory) {
      return next(new ApiError(404, "Không tìm thấy phụ kiện để cập nhật"));
    }

    if (categoryId) {
      const category = await AccessoryCategory.findById(categoryId);
      if (!category) {
        return next(new ApiError(404, "Không tìm thấy loại phụ kiện"));
      }

      if (category.status !== "Hoạt động") {
        return next(new ApiError(400, "Loại phụ kiện này hiện không hoạt động"));
      }
    }

    const updateData = {
      categoryId: categoryId || null,
      name,
      price,
      quantity,
      description: description || "",
      status,
    };

    // Nếu upload ảnh mới => xóa ảnh cũ rồi lưu ảnh mới
    if (req.file) {
      removeImageFile(accessory.image);
      updateData.image = `/uploads/${req.file.filename}`;
    }

    // Nếu bấm xóa ảnh cũ mà không upload ảnh mới
    if (removeImage === "true" && !req.file) {
      removeImageFile(accessory.image);
      updateData.image = "";
    }

    const updatedAccessory = await Accessory.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate("categoryId", "maLoaiPhuKien name status");

    return res.send({
      message: "Cập nhật phụ kiện thành công!",
      accessory: updatedAccessory,
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi cập nhật phụ kiện: " + error.message));
  }
};

// 5. Xóa phụ kiện
exports.delete = async (req, res, next) => {
  try {
    const accessory = await Accessory.findById(req.params.id);

    if (!accessory) {
      return next(new ApiError(404, "Không tìm thấy phụ kiện để xóa"));
    }

    removeImageFile(accessory.image);
    await Accessory.findByIdAndDelete(req.params.id);

    return res.send({
      message: "Xóa phụ kiện thành công!",
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi xóa phụ kiện: " + error.message));
  }
};