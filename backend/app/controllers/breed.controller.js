const fs = require("fs");
const path = require("path");

const Breed = require("../models/breed.model");
const Dog = require("../models/dog.model");
const ApiError = require("../api-error");

// Hàm phụ: xóa file ảnh cũ nếu tồn tại
const removeImageFile = (imagePath) => {
  try {
    if (!imagePath) return;

    // imagePath lưu kiểu: /uploads/ten-file.jpg
    const filePath = path.join(__dirname, "../../", imagePath);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error("Lỗi xóa file ảnh:", error.message);
  }
};

// 1. THÊM GIỐNG CHÓ MỚI
exports.create = async (req, res, next) => {
  try {
    const { maGiong, name, description, origin, status } = req.body;

    if (!name) {
      return next(new ApiError(400, "Tên giống chó không được để trống!"));
    }

    if (!maGiong) {
      return next(new ApiError(400, "Lỗi hệ thống: Không có mã giống chó!"));
    }

    const existedBreed = await Breed.findOne({
      $or: [{ maGiong }, { name }],
    });

    if (existedBreed) {
      return next(new ApiError(400, "Mã giống hoặc tên giống đã tồn tại!"));
    }

    let image = "";
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    const newBreed = new Breed({
      maGiong,
      name,
      description,
      origin,
      status,
      image,
    });

    await newBreed.save();

    return res.send({
      message: "Thêm giống chó thành công!",
      breed: newBreed,
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi tạo giống chó: " + error.message));
  }
};

// 2. LẤY DANH SÁCH GIỐNG CHÓ
exports.findAll = async (req, res, next) => {
  try {
    const breeds = await Breed.find().sort({ createdAt: -1 });
    return res.send(breeds);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi lấy danh sách giống chó"));
  }
};

// 3. LẤY 1 GIỐNG CHÓ THEO ID
exports.findOne = async (req, res, next) => {
  try {
    const breed = await Breed.findById(req.params.id);

    if (!breed) {
      return next(new ApiError(404, "Không tìm thấy giống chó này!"));
    }

    return res.send(breed);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi lấy thông tin giống chó"));
  }
};

// 4. CẬP NHẬT GIỐNG CHÓ
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { _id, maGiong, removeImage, ...updateData } = req.body;

    const breed = await Breed.findById(id);
    if (!breed) {
      return next(new ApiError(404, "Không tìm thấy giống chó này!"));
    }

    // Trường hợp 1: Admin upload ảnh mới
    if (req.file) {
      removeImageFile(breed.image);
      updateData.image = `/uploads/${req.file.filename}`;
    }

    // Trường hợp 2: Admin bấm xóa ảnh cũ và không upload ảnh mới
    if (removeImage === "true" && !req.file) {
      removeImageFile(breed.image);
      updateData.image = "";
    }

    const updatedBreed = await Breed.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return res.send({
      message: "Cập nhật thành công!",
      breed: updatedBreed,
    });
  } catch (error) {
    return next(new ApiError(500, `Lỗi khi cập nhật giống chó: ${error.message}`));
  }
};

// 5. XÓA GIỐNG CHÓ
// KHÔNG XÓA nếu đang có chó liên kết
exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;

    const linkedDogsCount = await Dog.countDocuments({ breedId: id });

    if (linkedDogsCount > 0) {
      return next(
        new ApiError(
          400,
          `KHÔNG THỂ XÓA: Đang có ${linkedDogsCount} thú cưng thuộc giống này. Vui lòng chuyển trạng thái sang "stopped" thay vì xóa!`
        )
      );
    }

    const breed = await Breed.findById(id);

    if (!breed) {
      return next(new ApiError(404, "Giống chó không tồn tại!"));
    }

    // Xóa file ảnh cũ nếu có
    removeImageFile(breed.image);

    await Breed.findByIdAndDelete(id);

    return res.send({ message: "Đã xóa giống chó thành công!" });
  } catch (error) {
    return next(new ApiError(500, `Lỗi khi xóa giống chó: ${error.message}`));
  }
};

// 6. TỰ ĐỘNG SINH MÃ GIỐNG MỚI (G001, G002...)
exports.getNextCode = async (req, res, next) => {
  try {
    const lastBreed = await Breed.findOne().sort({ maGiong: -1 });

    let nextCode = "G001";

    if (lastBreed && lastBreed.maGiong) {
      const lastNumber = parseInt(lastBreed.maGiong.replace("G", ""), 10);
      const nextNumber = lastNumber + 1;
      nextCode = "G" + nextNumber.toString().padStart(3, "0");
    }

    return res.send({ nextCode });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi tạo mã giống tự động"));
  }
};