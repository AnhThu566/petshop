const DogHealthRecord = require("../models/dogHealthRecord.model");
const Dog = require("../models/dog.model");
const Vaccine = require("../models/vaccine.model");
const ApiError = require("../api-error");

const REVIEW_STATUS = ["Chờ duyệt", "Cần bổ sung", "Đã duyệt"];

const getCurrentUserId = (req) => req.user?._id || req.user?.id || null;
const getCurrentUserRole = (req) => String(req.user?.role || "").toLowerCase();

const normalizeText = (value) => String(value || "").trim();

const parseBoolean = (value) => value === true || value === "true";

const parseNullableNumber = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const parseVaccinesInput = (vaccines) => {
  if (!vaccines) return [];

  if (typeof vaccines === "string") {
    try {
      const parsed = JSON.parse(vaccines);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  return Array.isArray(vaccines) ? vaccines : [];
};

const normalizeVaccines = async (vaccines) => {
  const rows = parseVaccinesInput(vaccines);
  if (!rows.length) return [];

  const normalized = [];

  for (const item of rows) {
    const vaccineId = normalizeText(item?.vaccineId);
    const dateInjected = item?.dateInjected || null;

    if (!dateInjected) continue;

    let vaccineName = normalizeText(item?.vaccineName);
    let vaccineCode = normalizeText(item?.vaccineCode);
    let finalVaccineId = vaccineId || null;

    if (vaccineId) {
      const vaccineDoc = await Vaccine.findById(vaccineId);
      if (!vaccineDoc) {
        throw new ApiError(400, "Có vaccine không còn tồn tại trong hệ thống");
      }

      vaccineName = vaccineDoc.name;
      vaccineCode = vaccineDoc.maVaccine || "";
      finalVaccineId = vaccineDoc._id;
    }

    if (!vaccineName) continue;

    normalized.push({
      vaccineId: finalVaccineId,
      vaccineCode,
      vaccineName,
      dateInjected,
      needsReminder: parseBoolean(item?.needsReminder),
      nextDueDate: parseBoolean(item?.needsReminder)
        ? item?.nextDueDate || null
        : null,
      note: normalizeText(item?.note),
    });
  }

  return normalized;
};

const syncDogHealthStatus = async (record) => {
  const dog = await Dog.findById(record.dogId);
  if (!dog) return;

  if (record.generalCondition) {
    dog.healthStatus = record.generalCondition;
  }

  dog.vaccinated = Array.isArray(record.vaccines) && record.vaccines.length > 0;

  if (record.lastDewormingDate) {
    dog.lastDeworming = record.lastDewormingDate;
  }

  if (record.weight !== undefined && record.weight !== null) {
    dog.weight = record.weight;
  }

  await dog.save();
};

const populateRecord = async (id) => {
  return DogHealthRecord.findById(id)
    .populate("dogId", "name maCho image approvalStatus saleStatus farmId")
    .populate("farmId", "name")
    .populate("createdBy", "username fullName role")
    .populate("updatedBy", "username fullName role")
    .populate("reviewedBy", "username fullName role");
};

// 1. FARM tạo hồ sơ sức khỏe ban đầu
exports.create = async (req, res, next) => {
  try {
    const currentUserId = getCurrentUserId(req);
    const currentRole = getCurrentUserRole(req);

    if (currentRole !== "farm") {
      return next(
        new ApiError(403, "Chỉ trang trại mới được tạo hồ sơ sức khỏe ban đầu")
      );
    }

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
      nextDewormingDate,
      vaccines,
      medicalNotes,
      abnormalSigns,
      recommendation,
    } = req.body;

    if (!dogId || !farmId) {
      return next(
        new ApiError(400, "Thiếu thông tin bắt buộc để tạo hồ sơ sức khỏe")
      );
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

    const userFarmId = req.user?.farmId || req.user?.farm || null;
    if (!userFarmId || String(userFarmId) !== String(farmId)) {
      return next(
        new ApiError(403, "Bạn chỉ được tạo hồ sơ sức khỏe cho chó của trại mình")
      );
    }

    const normalizedVaccines = await normalizeVaccines(vaccines);

    const healthRecord = new DogHealthRecord({
      dogId,
      farmId,
      checkedBy: normalizeText(checkedBy),
      checkedAt: checkedAt || new Date(),
      weight: parseNullableNumber(weight),
      bodyTemperature: parseNullableNumber(bodyTemperature),
      generalCondition: normalizeText(generalCondition),
      appetiteStatus: normalizeText(appetiteStatus),
      digestiveStatus: normalizeText(digestiveStatus),
      respiratoryStatus: normalizeText(respiratoryStatus),
      skinCondition: normalizeText(skinCondition),
      mobilityStatus: normalizeText(mobilityStatus),
      dewormed: parseBoolean(dewormed),
      lastDewormingDate: lastDewormingDate || null,
      nextDewormingDate: nextDewormingDate || null,
      vaccines: normalizedVaccines,
      medicalNotes: normalizeText(medicalNotes),
      abnormalSigns: normalizeText(abnormalSigns),
      recommendation: normalizeText(recommendation),

      createdBy: currentUserId,
      updatedBy: currentUserId,
      submittedByFarm: true,
      reviewStatus: "Chờ duyệt",
      reviewedBy: null,
      reviewedAt: null,
      reviewNote: "",
    });

    await healthRecord.save();
    await syncDogHealthStatus(healthRecord);

    const populatedRecord = await populateRecord(healthRecord._id);

    return res.send({
      message: "Gửi hồ sơ sức khỏe thành công, vui lòng chờ admin duyệt",
      healthRecord: populatedRecord,
    });
  } catch (error) {
    return next(
      new ApiError(500, "Lỗi khi tạo hồ sơ sức khỏe chó: " + error.message)
    );
  }
};

// 2. ADMIN xem tất cả / FARM xem hồ sơ của trại mình
exports.findAll = async (req, res, next) => {
  try {
    const currentRole = getCurrentUserRole(req);
    const filter = {};

    if (req.query.dogId) {
      filter.dogId = req.query.dogId;
    }

    if (req.query.farmId) {
      filter.farmId = req.query.farmId;
    }

    if (
      req.query.reviewStatus &&
      REVIEW_STATUS.includes(req.query.reviewStatus)
    ) {
      filter.reviewStatus = req.query.reviewStatus;
    }

    if (currentRole === "farm") {
      const userFarmId = req.user?.farmId || req.user?.farm || null;
      if (!userFarmId) {
        return next(new ApiError(403, "Không xác định được trang trại của bạn"));
      }
      filter.farmId = userFarmId;
    }

    const records = await DogHealthRecord.find(filter)
      .populate("dogId", "name maCho image approvalStatus saleStatus farmId")
      .populate("farmId", "name")
      .populate("createdBy", "username fullName role")
      .populate("updatedBy", "username fullName role")
      .populate("reviewedBy", "username fullName role")
      .sort({ checkedAt: -1, createdAt: -1 });

    return res.send(records);
  } catch (error) {
    return next(
      new ApiError(500, "Lỗi khi lấy danh sách hồ sơ sức khỏe: " + error.message)
    );
  }
};

// 3. ADMIN/FARM lấy chi tiết 1 hồ sơ
exports.findOne = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentRole = getCurrentUserRole(req);

    const record = await populateRecord(id);

    if (!record) {
      return next(new ApiError(404, "Không tìm thấy hồ sơ sức khỏe"));
    }

    if (currentRole === "farm") {
      const userFarmId = req.user?.farmId || req.user?.farm || null;
      if (
        !userFarmId ||
        String(record.farmId?._id || record.farmId) !== String(userFarmId)
      ) {
        return next(new ApiError(403, "Bạn không có quyền xem hồ sơ này"));
      }
    }

    return res.send(record);
  } catch (error) {
    return next(
      new ApiError(500, "Lỗi khi lấy chi tiết hồ sơ sức khỏe: " + error.message)
    );
  }
};

// 4. FARM sửa hồ sơ của mình khi chưa duyệt hoặc cần bổ sung
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentRole = getCurrentUserRole(req);
    const currentUserId = getCurrentUserId(req);

    if (currentRole !== "farm") {
      return next(
        new ApiError(403, "Chỉ trang trại mới được cập nhật nội dung hồ sơ sức khỏe")
      );
    }

    const record = await DogHealthRecord.findById(id);
    if (!record) {
      return next(new ApiError(404, "Không tìm thấy hồ sơ sức khỏe"));
    }

    const userFarmId = req.user?.farmId || req.user?.farm || null;

    if (!userFarmId || String(record.farmId) !== String(userFarmId)) {
      return next(new ApiError(403, "Bạn chỉ được sửa hồ sơ của trại mình"));
    }

    if (!["Chờ duyệt", "Cần bổ sung"].includes(record.reviewStatus)) {
      return next(
        new ApiError(
          400,
          "Chỉ được sửa hồ sơ khi đang chờ duyệt hoặc khi admin yêu cầu bổ sung"
        )
      );
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
      nextDewormingDate,
      vaccines,
      medicalNotes,
      abnormalSigns,
      recommendation,
    } = req.body;

    if (checkedBy !== undefined) record.checkedBy = normalizeText(checkedBy);
    if (checkedAt !== undefined) record.checkedAt = checkedAt || record.checkedAt;
    if (weight !== undefined) record.weight = parseNullableNumber(weight);
    if (bodyTemperature !== undefined) {
      record.bodyTemperature = parseNullableNumber(bodyTemperature);
    }
    if (generalCondition !== undefined) {
      record.generalCondition = normalizeText(generalCondition);
    }
    if (appetiteStatus !== undefined) {
      record.appetiteStatus = normalizeText(appetiteStatus);
    }
    if (digestiveStatus !== undefined) {
      record.digestiveStatus = normalizeText(digestiveStatus);
    }
    if (respiratoryStatus !== undefined) {
      record.respiratoryStatus = normalizeText(respiratoryStatus);
    }
    if (skinCondition !== undefined) {
      record.skinCondition = normalizeText(skinCondition);
    }
    if (mobilityStatus !== undefined) {
      record.mobilityStatus = normalizeText(mobilityStatus);
    }
    if (dewormed !== undefined) record.dewormed = parseBoolean(dewormed);
    if (lastDewormingDate !== undefined) {
      record.lastDewormingDate = lastDewormingDate || null;
    }
    if (nextDewormingDate !== undefined) {
      record.nextDewormingDate = nextDewormingDate || null;
    }
    if (vaccines !== undefined) {
      record.vaccines = await normalizeVaccines(vaccines);
    }
    if (medicalNotes !== undefined) {
      record.medicalNotes = normalizeText(medicalNotes);
    }
    if (abnormalSigns !== undefined) {
      record.abnormalSigns = normalizeText(abnormalSigns);
    }
    if (recommendation !== undefined) {
      record.recommendation = normalizeText(recommendation);
    }

    record.reviewStatus = "Chờ duyệt";
    record.reviewNote = "";
    record.reviewedAt = null;
    record.reviewedBy = null;
    record.updatedBy = currentUserId;

    await record.save();
    await syncDogHealthStatus(record);

    const populatedRecord = await populateRecord(record._id);

    return res.send({
      message: "Cập nhật hồ sơ sức khỏe thành công và đã gửi lại admin duyệt",
      healthRecord: populatedRecord,
    });
  } catch (error) {
    return next(
      new ApiError(500, "Lỗi khi cập nhật hồ sơ sức khỏe: " + error.message)
    );
  }
};

// 5. ADMIN duyệt / phản hồi hồ sơ
exports.reviewRecord = async (req, res, next) => {
  try {
    const currentRole = getCurrentUserRole(req);
    const currentUserId = getCurrentUserId(req);
    const { id } = req.params;
    const { reviewStatus, reviewNote } = req.body;

    if (currentRole !== "admin") {
      return next(new ApiError(403, "Chỉ admin mới được duyệt hồ sơ sức khỏe"));
    }

    if (!REVIEW_STATUS.includes(reviewStatus) || reviewStatus === "Chờ duyệt") {
      return next(
        new ApiError(400, "Admin chỉ được chuyển hồ sơ sang Đã duyệt hoặc Cần bổ sung")
      );
    }

    if (
      reviewStatus === "Cần bổ sung" &&
      !String(reviewNote || "").trim()
    ) {
      return next(new ApiError(400, "Vui lòng nhập nội dung cần trang trại bổ sung"));
    }

    const record = await DogHealthRecord.findById(id);
    if (!record) {
      return next(new ApiError(404, "Không tìm thấy hồ sơ sức khỏe"));
    }

    record.reviewStatus = reviewStatus;
    record.reviewNote = normalizeText(reviewNote);
    record.reviewedAt = new Date();
    record.reviewedBy = currentUserId;
    record.updatedBy = currentUserId;

    await record.save();
    await syncDogHealthStatus(record);

    const populatedRecord = await populateRecord(record._id);

    return res.send({
      message:
        reviewStatus === "Đã duyệt"
          ? "Duyệt hồ sơ sức khỏe thành công"
          : "Đã trả hồ sơ về cho trang trại bổ sung",
      healthRecord: populatedRecord,
    });
  } catch (error) {
    return next(
      new ApiError(500, "Lỗi khi duyệt hồ sơ sức khỏe: " + error.message)
    );
  }
};

// 6. ADMIN xóa hồ sơ sức khỏe
exports.delete = async (req, res, next) => {
  try {
    const currentRole = getCurrentUserRole(req);

    if (currentRole !== "admin") {
      return next(new ApiError(403, "Chỉ admin mới được xóa hồ sơ sức khỏe"));
    }

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

// 7. Lấy hồ sơ sức khỏe mới nhất theo chó
exports.findLatestByDog = async (req, res, next) => {
  try {
    const { dogId } = req.params;
    const currentRole = getCurrentUserRole(req);

    const dog = await Dog.findById(dogId);
    if (!dog) {
      return next(new ApiError(404, "Không tìm thấy bé chó"));
    }

    const filter = { dogId };

    if (currentRole !== "admin" && currentRole !== "farm") {
      filter.reviewStatus = "Đã duyệt";
    }

    if (currentRole === "farm") {
      const userFarmId = req.user?.farmId || req.user?.farm || null;
      if (!userFarmId || String(dog.farmId) !== String(userFarmId)) {
        return next(new ApiError(403, "Bạn không có quyền xem hồ sơ của bé chó này"));
      }
    }

    const latestRecord = await DogHealthRecord.findOne(filter)
      .populate("dogId", "name maCho image")
      .populate("farmId", "name")
      .populate("createdBy", "username fullName role")
      .populate("updatedBy", "username fullName role")
      .populate("reviewedBy", "username fullName role")
      .sort({ checkedAt: -1, createdAt: -1 });

    if (!latestRecord) {
      return next(new ApiError(404, "Chưa có hồ sơ sức khỏe phù hợp cho bé chó này"));
    }

    return res.send(latestRecord);
  } catch (error) {
    return next(
      new ApiError(500, "Lỗi khi lấy hồ sơ sức khỏe mới nhất: " + error.message)
    );
  }
};