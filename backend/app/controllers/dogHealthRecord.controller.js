const DogHealthRecord = require("../models/dogHealthRecord.model");
const Dog = require("../models/dog.model");
const ApiError = require("../api-error");

const CHECK_RESULT = [
  "Đủ điều kiện bán",
  "Chưa đủ điều kiện bán",
  "Cần theo dõi thêm",
];

// 1. Admin tạo hồ sơ sức khỏe mới
exports.create = async (req, res, next) => {
  try {
    const {
      dogId,
      farmId,
      checkedBy,
      checkedAt,
      weight,
      bodyTemperature,
      generalCondition,
      appetiteStatus,
      digestiveStatus,
      respiratoryStatus,
      skinCondition,
      mobilityStatus,
      dewormed,
      lastDewormingDate,
      vaccines,
      medicalNotes,
      abnormalSigns,
      checkResult,
      recommendation,
    } = req.body;

    if (!dogId || !farmId || !checkResult) {
      return next(
        new ApiError(400, "Thiếu thông tin bắt buộc để tạo hồ sơ sức khỏe")
      );
    }

    if (!CHECK_RESULT.includes(checkResult)) {
      return next(new ApiError(400, "Kết luận sức khỏe không hợp lệ"));
    }

    const dog = await Dog.findById(dogId);
    if (!dog) {
      return next(new ApiError(404, "Không tìm thấy hồ sơ chó"));
    }

    if (String(dog.farmId) !== String(farmId)) {
      return next(
        new ApiError(400, "Trang trại của hồ sơ sức khỏe không khớp với bé chó")
      );
    }

    const createdBy = req.user?._id || req.user?.id || null;

    const healthRecord = new DogHealthRecord({
      dogId,
      farmId,
      checkedBy: checkedBy ? String(checkedBy).trim() : "",
      checkedAt: checkedAt || new Date(),
      weight: weight ?? null,
      bodyTemperature: bodyTemperature ?? null,
      generalCondition: generalCondition ? String(generalCondition).trim() : "",
      appetiteStatus: appetiteStatus ? String(appetiteStatus).trim() : "",
      digestiveStatus: digestiveStatus ? String(digestiveStatus).trim() : "",
      respiratoryStatus: respiratoryStatus ? String(respiratoryStatus).trim() : "",
      skinCondition: skinCondition ? String(skinCondition).trim() : "",
      mobilityStatus: mobilityStatus ? String(mobilityStatus).trim() : "",
      dewormed: dewormed === true || dewormed === "true",
      lastDewormingDate: lastDewormingDate || null,
      vaccines: Array.isArray(vaccines) ? vaccines : [],
      medicalNotes: medicalNotes ? String(medicalNotes).trim() : "",
      abnormalSigns: abnormalSigns ? String(abnormalSigns).trim() : "",
      checkResult,
      recommendation: recommendation ? String(recommendation).trim() : "",
      createdBy,
    });

    await healthRecord.save();

    // Đồng bộ sang Dog
    dog.healthStatus =
      checkResult === "Đủ điều kiện bán"
        ? "Tốt"
        : checkResult === "Chưa đủ điều kiện bán"
        ? "Chưa ổn định"
        : "Đang theo dõi";

    dog.eligibleForSale = healthRecord.isEligibleForSale;

    if (lastDewormingDate) {
      dog.lastDeworming = lastDewormingDate;
    }

    if (weight !== undefined && weight !== null) {
      dog.weight = weight;
    }

    await dog.save();

    const populatedRecord = await DogHealthRecord.findById(healthRecord._id)
      .populate("dogId", "name maCho image")
      .populate("farmId", "name")
      .populate("createdBy", "username fullName");

    return res.send({
      message: "Tạo hồ sơ sức khỏe chó thành công",
      healthRecord: populatedRecord,
    });
  } catch (error) {
    return next(
      new ApiError(500, "Lỗi khi tạo hồ sơ sức khỏe chó: " + error.message)
    );
  }
};

// 2. Admin lấy tất cả hồ sơ sức khỏe
exports.findAll = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.dogId) {
      filter.dogId = req.query.dogId;
    }

    if (req.query.farmId) {
      filter.farmId = req.query.farmId;
    }

    if (req.query.checkResult && CHECK_RESULT.includes(req.query.checkResult)) {
      filter.checkResult = req.query.checkResult;
    }

    const records = await DogHealthRecord.find(filter)
      .populate("dogId", "name maCho image approvalStatus saleStatus")
      .populate("farmId", "name")
      .populate("createdBy", "username fullName")
      .sort({ checkedAt: -1, createdAt: -1 });

    return res.send(records);
  } catch (error) {
    return next(
      new ApiError(500, "Lỗi khi lấy danh sách hồ sơ sức khỏe: " + error.message)
    );
  }
};

// 3. Admin lấy chi tiết 1 hồ sơ sức khỏe
exports.findOne = async (req, res, next) => {
  try {
    const { id } = req.params;

    const record = await DogHealthRecord.findById(id)
      .populate("dogId", "name maCho image approvalStatus saleStatus")
      .populate("farmId", "name")
      .populate("createdBy", "username fullName");

    if (!record) {
      return next(new ApiError(404, "Không tìm thấy hồ sơ sức khỏe"));
    }

    return res.send(record);
  } catch (error) {
    return next(
      new ApiError(500, "Lỗi khi lấy chi tiết hồ sơ sức khỏe: " + error.message)
    );
  }
};

// 4. Admin cập nhật hồ sơ sức khỏe
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;

    const record = await DogHealthRecord.findById(id);
    if (!record) {
      return next(new ApiError(404, "Không tìm thấy hồ sơ sức khỏe"));
    }

    const {
      checkedBy,
      checkedAt,
      weight,
      bodyTemperature,
      generalCondition,
      appetiteStatus,
      digestiveStatus,
      respiratoryStatus,
      skinCondition,
      mobilityStatus,
      dewormed,
      lastDewormingDate,
      vaccines,
      medicalNotes,
      abnormalSigns,
      checkResult,
      recommendation,
    } = req.body;

    if (checkResult && !CHECK_RESULT.includes(checkResult)) {
      return next(new ApiError(400, "Kết luận sức khỏe không hợp lệ"));
    }

    if (checkedBy !== undefined) record.checkedBy = String(checkedBy || "").trim();
    if (checkedAt !== undefined) record.checkedAt = checkedAt || record.checkedAt;
    if (weight !== undefined) record.weight = weight ?? null;
    if (bodyTemperature !== undefined) record.bodyTemperature = bodyTemperature ?? null;
    if (generalCondition !== undefined) record.generalCondition = String(generalCondition || "").trim();
    if (appetiteStatus !== undefined) record.appetiteStatus = String(appetiteStatus || "").trim();
    if (digestiveStatus !== undefined) record.digestiveStatus = String(digestiveStatus || "").trim();
    if (respiratoryStatus !== undefined) record.respiratoryStatus = String(respiratoryStatus || "").trim();
    if (skinCondition !== undefined) record.skinCondition = String(skinCondition || "").trim();
    if (mobilityStatus !== undefined) record.mobilityStatus = String(mobilityStatus || "").trim();
    if (dewormed !== undefined) record.dewormed = dewormed === true || dewormed === "true";
    if (lastDewormingDate !== undefined) record.lastDewormingDate = lastDewormingDate || null;
    if (vaccines !== undefined) record.vaccines = Array.isArray(vaccines) ? vaccines : [];
    if (vaccines !== undefined) record.vaccines = Array.isArray(vaccines) ? vaccines : [];
    if (medicalNotes !== undefined) record.medicalNotes = String(medicalNotes || "").trim();
    if (abnormalSigns !== undefined) record.abnormalSigns = String(abnormalSigns || "").trim();
    if (checkResult !== undefined) record.checkResult = checkResult;
    if (recommendation !== undefined) record.recommendation = String(recommendation || "").trim();

    await record.save();

    const dog = await Dog.findById(record.dogId);
    if (dog) {
      dog.healthStatus =
        record.checkResult === "Đủ điều kiện bán"
          ? "Tốt"
          : record.checkResult === "Chưa đủ điều kiện bán"
          ? "Chưa ổn định"
          : "Đang theo dõi";

      dog.eligibleForSale = record.isEligibleForSale;

      if (record.lastDewormingDate) {
        dog.lastDeworming = record.lastDewormingDate;
      }

      if (record.weight !== undefined && record.weight !== null) {
        dog.weight = record.weight;
      }

      await dog.save();
    }

    const populatedRecord = await DogHealthRecord.findById(record._id)
      .populate("dogId", "name maCho image")
      .populate("farmId", "name")
      .populate("createdBy", "username fullName");

    return res.send({
      message: "Cập nhật hồ sơ sức khỏe thành công",
      healthRecord: populatedRecord,
    });
  } catch (error) {
    return next(
      new ApiError(500, "Lỗi khi cập nhật hồ sơ sức khỏe: " + error.message)
    );
  }
};

// 5. Admin xóa hồ sơ sức khỏe
exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;

    const record = await DogHealthRecord.findByIdAndDelete(id);
    if (!record) {
      return next(new ApiError(404, "Không tìm thấy hồ sơ sức khỏe để xóa"));
    }

    return res.send({
      message: "Xóa hồ sơ sức khỏe thành công",
    });
  } catch (error) {
    return next(
      new ApiError(500, "Lỗi khi xóa hồ sơ sức khỏe: " + error.message)
    );
  }
};

// 6. Lấy hồ sơ sức khỏe mới nhất theo chó
exports.findLatestByDog = async (req, res, next) => {
  try {
    const { dogId } = req.params;

    const dog = await Dog.findById(dogId);
    if (!dog) {
      return next(new ApiError(404, "Không tìm thấy bé chó"));
    }

    const latestRecord = await DogHealthRecord.findOne({ dogId })
      .populate("dogId", "name maCho image")
      .populate("farmId", "name")
      .populate("createdBy", "username fullName")
      .sort({ checkedAt: -1, createdAt: -1 });

    if (!latestRecord) {
      return next(new ApiError(404, "Chưa có hồ sơ sức khỏe cho bé chó này"));
    }

    return res.send(latestRecord);
  } catch (error) {
    return next(
      new ApiError(500, "Lỗi khi lấy hồ sơ sức khỏe mới nhất: " + error.message)
    );
  }
};