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

// =========================
// HỖ TRỢ KHUYẾN MÃI
// =========================
const parseBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    return value === "true" || value === "1" || value.toLowerCase() === "on";
  }
  return false;
};

const parseNumber = (value, defaultValue = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : defaultValue;
};

const parseDateValue = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getPromotionFromBody = (body = {}) => {
  const rawPromotion = body.promotion || {};

  const isActive =
    parseBoolean(rawPromotion.isActive) ||
    parseBoolean(body["promotion.isActive"]) ||
    parseBoolean(body["promotion[isActive]"]);

  const title =
    rawPromotion.title ||
    body["promotion.title"] ||
    body["promotion[title]"] ||
    "";

  const discountType =
    rawPromotion.discountType ||
    body["promotion.discountType"] ||
    body["promotion[discountType]"] ||
    "percent";

  const discountValue =
    rawPromotion.discountValue ??
    body["promotion.discountValue"] ??
    body["promotion[discountValue]"] ??
    0;

  const startDate =
    rawPromotion.startDate ||
    body["promotion.startDate"] ||
    body["promotion[startDate]"] ||
    null;

  const endDate =
    rawPromotion.endDate ||
    body["promotion.endDate"] ||
    body["promotion[endDate]"] ||
    null;

  return {
    isActive,
    title: String(title || "").trim(),
    discountType: discountType === "fixed" ? "fixed" : "percent",
    discountValue: parseNumber(discountValue, 0),
    startDate: parseDateValue(startDate),
    endDate: parseDateValue(endDate),
  };
};

const validatePromotion = (promotion = {}) => {
  if (!promotion.isActive) return;

  if (!["percent", "fixed"].includes(promotion.discountType)) {
    throw new Error("Loại khuyến mãi không hợp lệ");
  }

  if (!Number.isFinite(Number(promotion.discountValue)) || Number(promotion.discountValue) < 0) {
    throw new Error("Giá trị khuyến mãi không hợp lệ");
  }

  if (promotion.discountType === "percent" && Number(promotion.discountValue) > 100) {
    throw new Error("Khuyến mãi phần trăm không được vượt quá 100%");
  }

  if (
    promotion.startDate &&
    promotion.endDate &&
    new Date(promotion.startDate) > new Date(promotion.endDate)
  ) {
    throw new Error("Ngày bắt đầu khuyến mãi không được sau ngày kết thúc");
  }
};

const isPromotionValid = (promotion = {}) => {
  if (!promotion?.isActive) return false;

  const now = new Date();

  if (promotion.startDate && new Date(promotion.startDate) > now) {
    return false;
  }

  if (promotion.endDate && new Date(promotion.endDate) < now) {
    return false;
  }

  if (!promotion.discountValue || Number(promotion.discountValue) <= 0) {
    return false;
  }

  return true;
};

const calculatePromotionPrice = (price, promotion = {}) => {
  const originalPrice = Number(price || 0);

  if (!isPromotionValid(promotion)) {
    return {
      originalPrice,
      finalPrice: originalPrice,
      discountAmount: 0,
      discountLabel: "",
      hasPromotion: false,
    };
  }

  let discountAmount = 0;

  if (promotion.discountType === "percent") {
    discountAmount = Math.round(
      (originalPrice * Number(promotion.discountValue || 0)) / 100
    );
  } else if (promotion.discountType === "fixed") {
    discountAmount = Number(promotion.discountValue || 0);
  }

  if (discountAmount < 0) discountAmount = 0;
  if (discountAmount > originalPrice) discountAmount = originalPrice;

  const finalPrice = originalPrice - discountAmount;

  const discountLabel =
    promotion.discountType === "percent"
      ? `Giảm ${promotion.discountValue}%`
      : `Giảm ${Number(promotion.discountValue || 0).toLocaleString("vi-VN")}đ`;

  return {
    originalPrice,
    finalPrice,
    discountAmount,
    discountLabel,
    hasPromotion: discountAmount > 0,
  };
};

const normalizeAccessory = (item) => {
  const obj = item?.toObject ? item.toObject() : item;

  const promo = calculatePromotionPrice(obj.price, obj.promotion || {});

  return {
    ...obj,
    originalPrice: promo.originalPrice,
    finalPrice: promo.finalPrice,
    discountAmount: promo.discountAmount,
    discountLabel: promo.discountLabel,
    hasPromotion: promo.hasPromotion,
  };
};

// 1. Thêm phụ kiện
exports.create = async (req, res, next) => {
  try {
    const { categoryId, name, price, quantity, description, status } = req.body;

    if (!name || price === undefined || quantity === undefined) {
      return next(new ApiError(400, "Vui lòng nhập đầy đủ thông tin phụ kiện"));
    }

    if (Number(price) < 0 || Number(quantity) < 0) {
      return next(new ApiError(400, "Giá và số lượng phải lớn hơn hoặc bằng 0"));
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

    const promotion = getPromotionFromBody(req.body);
    validatePromotion(promotion);

    let imagePath = "";
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    const maPhuKien = await generateNextCode();

    const accessory = new Accessory({
      maPhuKien,
      categoryId: categoryId || null,
      name: String(name).trim(),
      price: Number(price),
      quantity: Number(quantity),
      description: description || "",
      image: imagePath,
      status: status || "Đang bán",
      promotion,
    });

    await accessory.save();

    const populatedAccessory = await Accessory.findById(accessory._id).populate(
      "categoryId",
      "maLoaiPhuKien name status"
    );

    return res.send({
      message: "Thêm phụ kiện thành công!",
      accessory: normalizeAccessory(populatedAccessory),
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

    return res.send(accessories.map(normalizeAccessory));
  } catch (error) {
    return next(
      new ApiError(500, "Lỗi khi lấy danh sách phụ kiện: " + error.message)
    );
  }
};

// 3. Lấy 1 phụ kiện
exports.findOne = async (req, res, next) => {
  try {
    const accessory = await Accessory.findById(req.params.id).populate(
      "categoryId",
      "maLoaiPhuKien name status"
    );

    if (!accessory) {
      return next(new ApiError(404, "Không tìm thấy phụ kiện"));
    }

    return res.send(normalizeAccessory(accessory));
  } catch (error) {
    return next(
      new ApiError(500, "Lỗi khi lấy chi tiết phụ kiện: " + error.message)
    );
  }
};

// 4. Cập nhật phụ kiện
exports.update = async (req, res, next) => {
  try {
    const {
      categoryId,
      name,
      price,
      quantity,
      description,
      status,
      removeImage,
    } = req.body;

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

    const promotion = getPromotionFromBody(req.body);
    validatePromotion(promotion);

    const updateData = {
      categoryId: categoryId || null,
      name,
      price: Number(price),
      quantity: Number(quantity),
      description: description || "",
      status,
      promotion,
    };

    if (Number(updateData.price) < 0 || Number(updateData.quantity) < 0) {
      return next(new ApiError(400, "Giá và số lượng phải lớn hơn hoặc bằng 0"));
    }

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
      accessory: normalizeAccessory(updatedAccessory),
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