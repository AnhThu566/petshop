const Dog = require("../models/dog.model");
const ApiError = require("../api-error");
const DogHistory = require("../models/dogHistory.model");

const APPROVAL_STATUS = ["Chờ duyệt", "Đã duyệt", "Từ chối"];
const SALE_STATUS = [
  "Chưa mở bán",
  "Sẵn sàng bán",
  "Chờ thanh toán",
  "Đã đặt cọc",
  "Đang giao",
  "Đã bán",
  "Ngừng bán",
];

const PUBLIC_SALE_STATUSES = [
  "Sẵn sàng bán",
  "Chờ thanh toán",
  "Đã đặt cọc",
  "Đang giao",
  "Đã bán",
];

const lockStatuses = ["Chờ thanh toán", "Đã đặt cọc", "Đang giao", "Đã bán"];

const basicEditableFields = [
  "name",
  "gender",
  "price",
  "description",
  "breedId",
  "weight",
  "birthDate",
  "healthStatus",
  "lastDeworming",
  "depositAmount",
];

const getActorInfo = (req) => {
  const actorId = req.user?._id || req.user?.id || null;
  const actorName =
    req.user?.fullName ||
    req.user?.username ||
    req.user?.name ||
    req.user?.email ||
    "Hệ thống";

  return { actorId, actorName };
};

const createDogHistory = async ({
  dogId,
  oldStatus = "",
  newStatus,
  req,
  reason = "",
  note = "",
}) => {
  const { actorId, actorName } = getActorInfo(req);

  await DogHistory.create({
    dogId,
    oldStatus,
    newStatus,
    changedBy: actorId,
    changedByName: actorName,
    reason,
    note,
  });
};

const normalizeRole = (role) => String(role || "").toLowerCase();

const isFarmRole = (req) => {
  const role = normalizeRole(req.user?.role);
  return role === "farm";
};

const parseBoolean = (value) => {
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  return undefined;
};

const ensureFarmPermission = (req, farmId) => {
  if (!isFarmRole(req)) return null;

  const currentFarmId = req.user?.farmId;
  if (!currentFarmId || String(farmId) !== String(currentFarmId)) {
    return new ApiError(403, "Bạn không có quyền thao tác hồ sơ chó của trại khác");
  }

  return null;
};

const populateDogQuery = (query) =>
  query.populate("farmId", "name address phone").populate("breedId", "name");

const generateDogCode = async () => {
  const lastDog = await Dog.findOne().sort({ createdAt: -1, maCho: -1 });
  let nextCode = "TC001";

  if (lastDog?.maCho) {
    const lastNumber = parseInt(String(lastDog.maCho).replace("TC", ""), 10);
    if (!Number.isNaN(lastNumber)) {
      nextCode = `TC${String(lastNumber + 1).padStart(3, "0")}`;
    }
  }

  return nextCode;
};

const hasAnyBasicChange = (payload) =>
  basicEditableFields.some(
    (field) => payload[field] !== undefined && payload[field] !== null
  );

// 1. Trại/Admin tạo hồ sơ chó mới
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
      birthDate,
      depositAmount,
    } = req.body;

    const permissionError = ensureFarmPermission(req, farmId);
    if (permissionError) return next(permissionError);

    if (
      !name ||
      !gender ||
      !farmId ||
      !breedId ||
      !birthDate ||
      price === undefined ||
      price === null ||
      Number(price) < 0
    ) {
      return next(
        new ApiError(400, "Thiếu hoặc sai thông tin bắt buộc để tạo hồ sơ chó")
      );
    }

    if (!req.file) {
      return next(new ApiError(400, "Vui lòng chọn hình ảnh đại diện cho bé chó"));
    }

    const imagePath = `/uploads/${req.file.filename}`;
    const maCho = await generateDogCode();

    const newDog = new Dog({
      maCho,
      name,
      gender,
      price,
      description,
      farmId,
      breedId,
      image: imagePath,
      weight: weight ?? null,
      birthDate,
      healthStatus,
      lastDeworming: lastDeworming || null,
      depositAmount: depositAmount ?? 0,
      sourceVerified: false,
      eligibleForSale: false,
      approvalStatus: "Chờ duyệt",
      saleStatus: "Chưa mở bán",
      isPublished: false,
      rejectionReason: "",
    });

    await newDog.save();

    await createDogHistory({
      dogId: newDog._id,
      oldStatus: "",
      newStatus: "Chờ duyệt / Chưa mở bán",
      req,
      note: "Tạo hồ sơ chó mới",
    });

    const populatedDog = await populateDogQuery(Dog.findById(newDog._id));

    return res.send({
      message: "Tạo hồ sơ chó thành công! Hồ sơ đang chờ Admin duyệt.",
      dog: populatedDog,
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi tạo hồ sơ chó: " + error.message));
  }
};

// 2. Lấy danh sách chó
// /api/dogs?public=true => khách xem
// /api/dogs => admin/farm xem
exports.findAll = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.public === "true") {
      filter.approvalStatus = "Đã duyệt";
      filter.isPublished = true;
      filter.saleStatus = { $in: PUBLIC_SALE_STATUSES };
    } else if (isFarmRole(req)) {
      const currentFarmId = req.user?.farmId;
      filter.farmId = currentFarmId;
    }

    if (req.query.farmId) {
      filter.farmId = req.query.farmId;
    }

    if (req.query.breedId) {
      filter.breedId = req.query.breedId;
    }

    if (
      req.query.approvalStatus &&
      APPROVAL_STATUS.includes(req.query.approvalStatus)
    ) {
      filter.approvalStatus = req.query.approvalStatus;
    }

    if (req.query.saleStatus && SALE_STATUS.includes(req.query.saleStatus)) {
      filter.saleStatus = req.query.saleStatus;
    }

    const dogs = await populateDogQuery(Dog.find(filter).sort({ createdAt: -1 }));

    return res.send(dogs);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi lấy danh sách chó: " + error.message));
  }
};

// 3. Lấy chi tiết 1 chó
exports.findOne = async (req, res, next) => {
  try {
    const { id } = req.params;

    const dog = await populateDogQuery(Dog.findById(id));

    if (!dog) {
      return next(new ApiError(404, "Không tìm thấy hồ sơ chó"));
    }

    if (isFarmRole(req)) {
      const permissionError = ensureFarmPermission(
        req,
        dog.farmId?._id || dog.farmId
      );
      if (permissionError) return next(permissionError);
    }

    if (req.query.public === "true") {
      if (
        dog.approvalStatus !== "Đã duyệt" ||
        dog.isPublished !== true ||
        !PUBLIC_SALE_STATUSES.includes(dog.saleStatus)
      ) {
        return next(new ApiError(404, "Không tìm thấy hồ sơ chó"));
      }
    }

    return res.send(dog);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi lấy chi tiết chó: " + error.message));
  }
};

// 4. Admin cập nhật trạng thái duyệt hồ sơ
exports.updateApprovalStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { approvalStatus, rejectionReason, sourceVerified, eligibleForSale } =
      req.body;

    if (!APPROVAL_STATUS.includes(approvalStatus)) {
      return next(new ApiError(400, "Trạng thái duyệt không hợp lệ"));
    }

    const dog = await Dog.findById(id);
    if (!dog) {
      return next(new ApiError(404, "Không tìm thấy hồ sơ chó"));
    }

    const oldApprovalStatus = dog.approvalStatus;
    const oldSaleStatus = dog.saleStatus;

    if (approvalStatus === "Từ chối" && !String(rejectionReason || "").trim()) {
      return next(new ApiError(400, "Vui lòng nhập lý do từ chối"));
    }

    if (approvalStatus === "Đã duyệt") {
      const nextSourceVerified = parseBoolean(sourceVerified) ?? dog.sourceVerified;
      const nextEligibleForSale =
        parseBoolean(eligibleForSale) ?? dog.eligibleForSale;

      if (!nextSourceVerified) {
        return next(new ApiError(400, "Phải xác minh nguồn gốc trước khi duyệt"));
      }

      if (!nextEligibleForSale) {
        return next(
          new ApiError(400, "Phải xác nhận đủ điều kiện bán trước khi duyệt")
        );
      }

      dog.sourceVerified = nextSourceVerified;
      dog.eligibleForSale = nextEligibleForSale;
    }

    dog.approvalStatus = approvalStatus;

    if (approvalStatus === "Từ chối") {
      dog.rejectionReason = String(rejectionReason || "").trim();
      dog.saleStatus = "Chưa mở bán";
      dog.isPublished = false;
    } else {
      dog.rejectionReason = "";
    }

    if (approvalStatus === "Chờ duyệt") {
      dog.saleStatus = "Chưa mở bán";
      dog.isPublished = false;
    }

    await dog.save();

    if (oldApprovalStatus !== dog.approvalStatus) {
      await createDogHistory({
        dogId: dog._id,
        oldStatus: oldApprovalStatus,
        newStatus: dog.approvalStatus,
        req,
        reason: dog.approvalStatus === "Từ chối" ? dog.rejectionReason : "",
        note: "Cập nhật trạng thái duyệt hồ sơ chó",
      });
    }

    if (oldSaleStatus !== dog.saleStatus) {
      await createDogHistory({
        dogId: dog._id,
        oldStatus: oldSaleStatus,
        newStatus: dog.saleStatus,
        req,
        note: "Tự động cập nhật trạng thái bán theo trạng thái duyệt",
      });
    }

    const populatedDog = await populateDogQuery(Dog.findById(dog._id));

    return res.send({
      message: "Cập nhật trạng thái duyệt thành công",
      dog: populatedDog,
    });
  } catch (error) {
    return next(
      new ApiError(500, "Lỗi khi cập nhật trạng thái duyệt: " + error.message)
    );
  }
};

// 5. Admin cập nhật trạng thái bán
exports.updateSaleStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { saleStatus } = req.body;

    if (!SALE_STATUS.includes(saleStatus)) {
      return next(new ApiError(400, "Trạng thái bán không hợp lệ"));
    }

    const dog = await Dog.findById(id);
    if (!dog) {
      return next(new ApiError(404, "Không tìm thấy hồ sơ chó"));
    }

    if (dog.approvalStatus !== "Đã duyệt") {
      return next(
        new ApiError(400, "Chỉ chó đã duyệt mới được cập nhật trạng thái bán")
      );
    }

    if (!dog.sourceVerified || !dog.eligibleForSale) {
      return next(new ApiError(400, "Chó chưa đủ điều kiện mở bán"));
    }

    const oldSaleStatus = dog.saleStatus;

    if (oldSaleStatus === saleStatus) {
      return res.send({
        message: "Trạng thái bán không thay đổi",
        dog,
      });
    }

    const allowedTransitions = {
      "Chưa mở bán": ["Sẵn sàng bán", "Ngừng bán"],
      "Sẵn sàng bán": ["Chờ thanh toán", "Ngừng bán"],
      "Chờ thanh toán": ["Sẵn sàng bán", "Đã đặt cọc", "Ngừng bán"],
      "Đã đặt cọc": ["Đang giao", "Sẵn sàng bán"],
      "Đang giao": ["Đã bán", "Sẵn sàng bán"],
      "Đã bán": [],
      "Ngừng bán": ["Sẵn sàng bán", "Chưa mở bán"],
    };

    const canMove = allowedTransitions[oldSaleStatus]?.includes(saleStatus);
    if (!canMove) {
      return next(
        new ApiError(
          400,
          `Không thể chuyển trạng thái từ "${oldSaleStatus}" sang "${saleStatus}"`
        )
      );
    }

    dog.saleStatus = saleStatus;

    if (["Chưa mở bán", "Ngừng bán"].includes(saleStatus)) {
      dog.isPublished = false;
    }

    if (
      ["Sẵn sàng bán", "Chờ thanh toán", "Đã đặt cọc", "Đang giao", "Đã bán"].includes(
        saleStatus
      )
    ) {
      dog.isPublished = true;
    }

    await dog.save();

    await createDogHistory({
      dogId: dog._id,
      oldStatus: oldSaleStatus,
      newStatus: dog.saleStatus,
      req,
      note: "Cập nhật trạng thái bán của chó",
    });

    const populatedDog = await populateDogQuery(Dog.findById(dog._id));

    return res.send({
      message: "Cập nhật trạng thái bán thành công",
      dog: populatedDog,
    });
  } catch (error) {
    return next(
      new ApiError(500, "Lỗi khi cập nhật trạng thái bán: " + error.message)
    );
  }
};

// 6. Trại/Admin cập nhật hồ sơ chó
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dog = await Dog.findById(id);

    if (!dog) {
      return next(new ApiError(404, "Không tìm thấy hồ sơ chó để cập nhật"));
    }

    const permissionError = ensureFarmPermission(req, dog.farmId);
    if (permissionError) return next(permissionError);

    if (lockStatuses.includes(dog.saleStatus)) {
      return next(
        new ApiError(
          400,
          "Không thể chỉnh sửa hồ sơ vì bé chó đang trong quá trình giao dịch hoặc đã bán"
        )
      );
    }

    const updateData = { ...req.body };

    delete updateData.farmId;
    delete updateData.approvalStatus;
    delete updateData.saleStatus;
    delete updateData.rejectionReason;
    delete updateData.isPublished;
    delete updateData.sourceVerified;
    delete updateData.eligibleForSale;
    delete updateData.maCho;

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const changedBasicInfo = hasAnyBasicChange(updateData) || !!req.file;

    if (changedBasicInfo || dog.approvalStatus === "Từ chối") {
      updateData.approvalStatus = "Chờ duyệt";
      updateData.saleStatus = "Chưa mở bán";
      updateData.isPublished = false;
      updateData.rejectionReason = "";
      updateData.sourceVerified = false;
      updateData.eligibleForSale = false;
    }

    const oldApprovalStatus = dog.approvalStatus;
    const oldSaleStatus = dog.saleStatus;

    const updatedDog = await populateDogQuery(
      Dog.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true })
    );

    if (!updatedDog) {
      return next(new ApiError(404, "Không tìm thấy hồ sơ chó để cập nhật"));
    }

    if (oldApprovalStatus !== updatedDog.approvalStatus) {
      await createDogHistory({
        dogId: updatedDog._id,
        oldStatus: oldApprovalStatus,
        newStatus: updatedDog.approvalStatus,
        req,
        note: "Hồ sơ chó thay đổi nên chuyển về chờ duyệt",
      });
    }

    if (oldSaleStatus !== updatedDog.saleStatus) {
      await createDogHistory({
        dogId: updatedDog._id,
        oldStatus: oldSaleStatus,
        newStatus: updatedDog.saleStatus,
        req,
        note: "Hồ sơ chó thay đổi nên dừng mở bán",
      });
    }

    return res.send({
      message: changedBasicInfo
        ? "Cập nhật thành công! Hồ sơ đã quay về trạng thái chờ duyệt."
        : "Cập nhật hồ sơ chó thành công!",
      dog: updatedDog,
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi cập nhật dữ liệu: " + error.message));
  }
};

// 7. Lấy lịch sử thay đổi hồ sơ chó
exports.getHistory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const dog = await Dog.findById(id);
    if (!dog) {
      return next(new ApiError(404, "Không tìm thấy hồ sơ chó"));
    }

    if (isFarmRole(req)) {
      const permissionError = ensureFarmPermission(req, dog.farmId);
      if (permissionError) return next(permissionError);
    }

    const histories = await DogHistory.find({ dogId: id }).sort({ createdAt: -1 });

    return res.send(histories);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi lấy lịch sử hồ sơ chó: " + error.message));
  }
};