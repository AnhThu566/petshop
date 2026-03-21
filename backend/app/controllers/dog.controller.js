const Dog = require("../models/dog.model");
const ApiError = require("../api-error");

// 1. Chủ trại đăng chó mới
exports.create = async (req, res, next) => {
  try {
    const {
      name,
      gender,
      price,
      description,
      farmId,
      breedId,
      weight,
      healthStatus,
      lastDeworming,
      healthRecord,
      birthDate,
    } = req.body;

    // ==============================
    // KIỂM TRA QUYỀN: FARM CHỈ ĐƯỢC ĐĂNG CHÓ CHO TRẠI CỦA MÌNH
    // ==============================
    if (req.user && (req.user.role === "farm" || req.user.role === "Farm")) {
      const currentFarmId = req.user.farmId || req.user._id || req.user.id;

      if (String(farmId) !== String(currentFarmId)) {
        return next(new ApiError(403, "Bạn không được đăng chó cho trang trại khác"));
      }
    }

    if (!name || !gender || !price || !farmId || !breedId || !birthDate) {
      return next(new ApiError(400, "Thiếu thông tin bắt buộc để đăng hồ sơ chó"));
    }

    let imagePath = "";
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    } else {
      return next(new ApiError(400, "Vui lòng chọn hình ảnh đại diện cho bé chó!"));
    }

    const lastDog = await Dog.findOne().sort({ maCho: -1 });
    let nextCode = "TC001";

    if (lastDog && lastDog.maCho) {
      const lastNumber = parseInt(lastDog.maCho.replace("TC", ""), 10);
      nextCode = "TC" + (lastNumber + 1).toString().padStart(3, "0");
    }

    let parsedHealthRecord = [];
    if (healthRecord) {
      try {
        parsedHealthRecord =
          typeof healthRecord === "string" ? JSON.parse(healthRecord) : healthRecord;
      } catch (e) {
        return next(new ApiError(400, "Dữ liệu lịch sử tiêm chủng không hợp lệ"));
      }
    }

    const newDog = new Dog({
      maCho: nextCode,
      name,
      gender,
      price,
      description,
      farmId,
      breedId,
      image: imagePath,
      weight,
      birthDate,
      healthStatus,
      lastDeworming: lastDeworming || null,
      healthRecord: parsedHealthRecord,
      status: "Chờ duyệt",
      rejectionReason: "",
    });

    await newDog.save();

    res.send({
      message: "Đăng hồ sơ chó thành công! Hồ sơ đang chờ Admin duyệt.",
      dog: newDog,
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi đăng chó: " + error.message));
  }
};

// 2. Lấy danh sách chó
// /api/dogs?public=true => chỉ lấy chó hiển thị cho khách
// /api/dogs            => lấy tất cả cho admin/farm
exports.findAll = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.public === "true") {
      filter.status = {
        $in: ["Đã duyệt", "Chờ thanh toán", "Đã đặt cọc", "Đang giao", "Đã bán"],
      };
    }

    const dogs = await Dog.find(filter)
      .populate("farmId", "name address phone")
      .populate("breedId", "name")
      .populate("healthRecord.vaccineId", "name")
      .sort({ createdAt: -1 });

    res.send(dogs);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi lấy danh sách chó: " + error.message));
  }
};

// 3. Admin cập nhật trạng thái chó
exports.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    const validStatuses = [
      "Chờ duyệt",
      "Đã duyệt",
      "Từ chối",
      "Chờ thanh toán",
      "Đã đặt cọc",
      "Đang giao",
      "Đã bán",
      "Ngừng bán",
    ];

    if (!validStatuses.includes(status)) {
      return next(new ApiError(400, "Trạng thái không hợp lệ"));
    }

    const dog = await Dog.findById(id);
    if (!dog) {
      return next(new ApiError(404, "Không tìm thấy hồ sơ chó"));
    }

    if (status === "Từ chối" && !rejectionReason?.trim()) {
      return next(new ApiError(400, "Vui lòng nhập lý do từ chối"));
    }

    dog.status = status;

    if (status === "Từ chối") {
      dog.rejectionReason = rejectionReason.trim();
    } else {
      dog.rejectionReason = "";
    }

    await dog.save();

    res.send({
      message: "Cập nhật trạng thái chó thành công!",
      dog,
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi cập nhật trạng thái chó: " + error.message));
  }
};

// 4. Chủ trại cập nhật hồ sơ chó
// - Không cho sửa farmId, status, rejectionReason
// - Nếu sửa thông tin cơ bản thì trả về Chờ duyệt
// - Nếu chó đang giao dịch thì không cho sửa
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dog = await Dog.findById(id);

    if (!dog) {
      return next(new ApiError(404, "Không tìm thấy hồ sơ chó để cập nhật"));
    }

    // ==============================
    // KIỂM TRA QUYỀN: FARM CHỈ ĐƯỢC SỬA CHÓ CỦA TRẠI MÌNH
    // ==============================
    if (req.user && (req.user.role === "farm" || req.user.role === "Farm")) {
      const currentFarmId = req.user.farmId || req.user._id || req.user.id;
      const dogFarmId = dog.farmId?.toString?.() || dog.farmId;

      if (String(dogFarmId) !== String(currentFarmId)) {
        return next(
          new ApiError(403, "Bạn không có quyền chỉnh sửa hồ sơ chó của trại khác")
        );
      }
    }

    if (["Chờ thanh toán", "Đã đặt cọc", "Đang giao", "Đã bán"].includes(dog.status)) {
      return next(
        new ApiError(
          400,
          "Không thể chỉnh sửa hồ sơ vì bé chó đang trong quá trình giao dịch hoặc đã bán"
        )
      );
    }

    const updateData = { ...req.body };

    delete updateData.status;
    delete updateData.rejectionReason;
    delete updateData.farmId;

    if (updateData.healthRecord && typeof updateData.healthRecord === "string") {
      try {
        updateData.healthRecord = JSON.parse(updateData.healthRecord);
      } catch (e) {
        return next(new ApiError(400, "Dữ liệu lịch sử tiêm chủng không hợp lệ"));
      }
    }

    const basicFields = ["name", "price", "gender", "birthDate", "description", "breedId"];
    const hasBasicInfoChange = basicFields.some(
      (field) => updateData[field] !== undefined && updateData[field] !== null
    );

    if (hasBasicInfoChange || dog.status === "Từ chối") {
      updateData.status = "Chờ duyệt";
      updateData.rejectionReason = "";
    }

    const updatedDog = await Dog.findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .populate("farmId", "name address phone")
      .populate("breedId", "name")
      .populate("healthRecord.vaccineId", "name");

    res.send({
      message: hasBasicInfoChange
        ? "Cập nhật thành công! Hồ sơ đã quay về trạng thái chờ duyệt."
        : "Cập nhật hồ sơ sức khỏe thành công!",
      dog: updatedDog,
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi cập nhật dữ liệu: " + error.message));
  }
};

// 5. Lấy chi tiết 1 chó
exports.findOne = async (req, res, next) => {
  try {
    const { id } = req.params;

    const dog = await Dog.findById(id)
      .populate("farmId", "name address phone")
      .populate("breedId", "name")
      .populate("healthRecord.vaccineId", "name");

    if (!dog) {
      return next(new ApiError(404, "Không tìm thấy hồ sơ chó này"));
    }

    res.send(dog);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi lấy chi tiết chó: " + error.message));
  }
};