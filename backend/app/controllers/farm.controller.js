const Farm = require("../models/farm.model");
const ApiError = require("../api-error");
const Dog = require("../models/dog.model");

// 1. Lấy danh sách trại
exports.findAll = async (req, res, next) => {
  try {
    const farms = await Farm.find().populate("ownerId", "username email fullName phone");
    return res.send(farms);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi lấy danh sách trại"));
  }
};

// 2. Lấy 1 trại theo ID
exports.findOne = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || id === "undefined") {
      return next(new ApiError(400, "ID trang trại không hợp lệ"));
    }

    const farm = await Farm.findById(id).populate(
      "ownerId",
      "username email fullName phone"
    );

    if (!farm) {
      return next(new ApiError(404, "Không tìm thấy trang trại"));
    }

    return res.send(farm);
  } catch (error) {
    return next(
      new ApiError(500, "Lỗi khi lấy thông tin trang trại: " + error.message)
    );
  }
};

// 3. Tạo trại mới
exports.create = async (req, res, next) => {
  try {
    const { maTrai, name, address, phone, description, ownerId, status } = req.body;

    if (!name || !address || !phone || !ownerId) {
      return next(
        new ApiError(400, "Tên, địa chỉ, số điện thoại và chủ trại không được để trống")
      );
    }

    const newFarm = new Farm({
      maTrai,
      name,
      address,
      phone,
      description: description || "",
      ownerId,
      status: status || "active",
      image: req.file ? `/public/uploads/${req.file.filename}` : null,
    });

    await newFarm.save();

    return res.send({
      message: "Thêm trại chó thành công!",
      farm: newFarm,
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi tạo trại chó: " + error.message));
  }
};

// 4. Cập nhật trại
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || id === "undefined") {
      return next(new ApiError(400, "ID trang trại không hợp lệ"));
    }

    const { _id, maTrai, ownerId, ...updateData } = req.body;

    if (req.file) {
      updateData.image = `/public/uploads/${req.file.filename}`;
    }

    const updatedFarm = await Farm.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate("ownerId", "username email fullName phone");

    if (!updatedFarm) {
      return next(new ApiError(404, "Không tìm thấy trại chó này"));
    }

    return res.send({
      message: "Cập nhật trại chó thành công!",
      farm: updatedFarm,
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi cập nhật trại: " + error.message));
  }
};

// 5. Cập nhật trạng thái hợp tác
exports.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["active", "inactive", "paused", "stopped"];
    if (!validStatuses.includes(status)) {
      return next(new ApiError(400, "Trạng thái trại không hợp lệ"));
    }

    const farm = await Farm.findById(id);
    if (!farm) {
      return next(new ApiError(404, "Không tìm thấy trại chó"));
    }

    if (status === "inactive" || status === "stopped") {
      const linkedDogsCount = await Dog.countDocuments({
        farmId: id,
        saleStatus: { $in: ["Sẵn sàng bán", "Chờ thanh toán", "Đã đặt cọc", "Đang giao"] },
      });

      if (linkedDogsCount > 0) {
        return next(
          new ApiError(
            400,
            "Không thể ngừng hợp tác vì trại vẫn còn chó đang được hệ thống xử lý hoặc mở bán"
          )
        );
      }
    }

    farm.status = status;
    await farm.save();

    return res.send({
      message: "Cập nhật trạng thái hợp tác thành công!",
      farm,
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi cập nhật trạng thái trại: " + error.message));
  }
};

// 6. Xóa trại
exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;

    const linkedDogsCount = await Dog.countDocuments({ farmId: id });

    if (linkedDogsCount > 0) {
      return next(
        new ApiError(
          400,
          `KHÔNG THỂ XÓA: Trại này đang có ${linkedDogsCount} hồ sơ chó. Vui lòng chuyển trạng thái sang "Ngừng hợp tác".`
        )
      );
    }

    const deletedFarm = await Farm.findByIdAndDelete(id);

    if (!deletedFarm) {
      return next(new ApiError(404, "Trại chó không tồn tại"));
    }

    return res.send({ message: "Đã xóa trại chó thành công!" });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi xóa trại chó: " + error.message));
  }
};

// 7. Tự động sinh mã trại
exports.getNextCode = async (req, res, next) => {
  try {
    const lastFarm = await Farm.findOne().sort({ maTrai: -1 });
    let nextCode = "T001";

    if (lastFarm && lastFarm.maTrai) {
      const lastNumber = parseInt(lastFarm.maTrai.replace("T", ""), 10);
      const nextNumber = lastNumber + 1;
      nextCode = "T" + nextNumber.toString().padStart(3, "0");
    }

    return res.send({ nextCode });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi tạo mã trại tự động"));
  }
};