const Dog = require("../models/dog.model");
const DogHealthRecord = require("../models/dogHealthRecord.model");
const DogHistory = require("../models/dogHistory.model");

const APPROVAL_STATUS = ["Chờ duyệt", "Cần bổ sung", "Đã duyệt", "Từ chối"];
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
  "proposedPrice",
  "description",
  "breedId",
  "weight",
  "birthDate",
  "healthStatus",
  "lastDeworming",
  "sourceNotes",
  "healthNote",
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

const isAdminRole = (req) => normalizeRole(req.user?.role) === "admin";
const isFarmRole = (req) => normalizeRole(req.user?.role) === "farm";
const isAuthenticated = (req) => !!req.user;

const parseBoolean = (value) => {
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  return undefined;
};

const ensureFarmPermission = (req, farmId) => {
  if (!isFarmRole(req)) return "Chỉ trang trại mới được thao tác hồ sơ chó";

  const currentFarmId = req.user?.farmId;
  if (!currentFarmId || String(farmId) !== String(currentFarmId)) {
    return "Bạn không có quyền thao tác hồ sơ chó của trại khác";
  }

  return null;
};

const populateDogQuery = (query) =>
  query
    .populate("farmId", "name address phone")
    .populate("breedId", "name")
    .populate("reviewedBy", "username fullName role");

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

const buildPublicDogFilter = () => ({
  approvalStatus: "Đã duyệt",
  isPublished: true,
  saleStatus: { $in: PUBLIC_SALE_STATUSES },
});

const canAccessInternalDog = (req, dog) => {
  if (isAdminRole(req)) return true;

  if (isFarmRole(req)) {
    const currentFarmId = req.user?.farmId;
    return (
      currentFarmId &&
      String(dog.farmId?._id || dog.farmId) === String(currentFarmId)
    );
  }

  return false;
};

exports.create = async (req, res) => {
  try {
    if (!isFarmRole(req)) {
      return res.status(403).send({
        message: "Chỉ trang trại mới được tạo hồ sơ chó",
      });
    }

    const {
      name,
      gender,
      proposedPrice,
      description,
      breedId,
      weight,
      healthStatus,
      lastDeworming,
      birthDate,
      sourceNotes,
      healthNote,
    } = req.body;

    const finalFarmId = req.user?.farmId || req.body.farmId;

    if (!finalFarmId) {
      return res.status(400).send({
        message: "Tài khoản trang trại chưa được gắn với trại",
      });
    }

    if (
      !name ||
      !gender ||
      !finalFarmId ||
      !breedId ||
      !birthDate ||
      proposedPrice === undefined ||
      proposedPrice === null ||
      Number(proposedPrice) <= 0
    ) {
      return res.status(400).send({
        message: "Thiếu hoặc sai thông tin bắt buộc để tạo hồ sơ chó",
      });
    }

    if (!req.file) {
      return res.status(400).send({
        message: "Vui lòng chọn hình ảnh đại diện cho bé chó",
      });
    }

    const imagePath = `/uploads/${req.file.filename}`;
    const maCho = await generateDogCode();
    const parsedProposedPrice = Number(proposedPrice);

    const newDog = new Dog({
      maCho,
      name: String(name).trim(),
      gender: String(gender).trim(),
      price: parsedProposedPrice,
      proposedPrice: parsedProposedPrice,
      description: String(description || "").trim(),
      farmId: finalFarmId,
      breedId,
      image: imagePath,
      weight: weight === "" || weight === undefined ? null : Number(weight),
      birthDate,
      healthStatus: String(healthStatus || "").trim(),
      lastDeworming: lastDeworming || null,
      sourceNotes: String(sourceNotes || "").trim(),
      healthNote: String(healthNote || "").trim(),

      vaccinated: false,
      sourceVerified: false,
      approvalStatus: "Chờ duyệt",
      saleStatus: "Chưa mở bán",
      isPublished: false,
      rejectionReason: "",
      reviewedAt: null,
      reviewedBy: null,
    });

    await newDog.save();

    try {
      await createDogHistory({
        dogId: newDog._id,
        oldStatus: "",
        newStatus: "Chờ duyệt / Chưa mở bán",
        req,
        note: "Trang trại tạo hồ sơ chó mới",
      });
    } catch (historyError) {
      console.error("Lỗi ghi lịch sử chó:", historyError.message);
    }

    const populatedDog = await populateDogQuery(Dog.findById(newDog._id));

    return res.send({
      message: "Tạo hồ sơ chó thành công! Hồ sơ đang chờ Admin duyệt.",
      dog: populatedDog,
    });
  } catch (error) {
    console.error("Lỗi create dog:", error);
    return res.status(500).send({
      message: "Lỗi khi tạo hồ sơ chó: " + error.message,
    });
  }
};

exports.findAll = async (req, res) => {
  try {
    const filter = {};
    const isPublicRequest = req.isPublicRequest === true;

    if (isPublicRequest) {
      Object.assign(filter, buildPublicDogFilter());

      if (req.query.farmId) filter.farmId = req.query.farmId;
      if (req.query.breedId) filter.breedId = req.query.breedId;

      if (
        req.query.saleStatus &&
        PUBLIC_SALE_STATUSES.includes(req.query.saleStatus)
      ) {
        filter.saleStatus = req.query.saleStatus;
      }
    } else if (isAdminRole(req)) {
      if (req.query.farmId) filter.farmId = req.query.farmId;
      if (req.query.breedId) filter.breedId = req.query.breedId;

      if (
        req.query.approvalStatus &&
        APPROVAL_STATUS.includes(req.query.approvalStatus)
      ) {
        filter.approvalStatus = req.query.approvalStatus;
      }

      if (req.query.saleStatus && SALE_STATUS.includes(req.query.saleStatus)) {
        filter.saleStatus = req.query.saleStatus;
      }
    } else if (isFarmRole(req)) {
      const currentFarmId = req.user?.farmId;

      if (!currentFarmId) {
        return res.status(403).send({
          message: "Tài khoản trại chưa được gắn với trang trại",
        });
      }

      filter.farmId = currentFarmId;

      if (req.query.breedId) filter.breedId = req.query.breedId;

      if (
        req.query.approvalStatus &&
        APPROVAL_STATUS.includes(req.query.approvalStatus)
      ) {
        filter.approvalStatus = req.query.approvalStatus;
      }

      if (req.query.saleStatus && SALE_STATUS.includes(req.query.saleStatus)) {
        filter.saleStatus = req.query.saleStatus;
      }
    } else {
      return res.status(403).send({
        message: "Bạn không có quyền truy cập danh sách nội bộ",
      });
    }

    const dogs = await populateDogQuery(Dog.find(filter).sort({ createdAt: -1 }));

    return res.send(dogs);
  } catch (error) {
    return res.status(500).send({
      message: "Lỗi khi lấy danh sách chó: " + error.message,
    });
  }
};

exports.findOne = async (req, res) => {
  try {
    const { id } = req.params;
    const isPublicRequest = req.isPublicRequest === true;

    const dog = await populateDogQuery(Dog.findById(id));

    if (!dog) {
      return res.status(404).send({
        message: "Không tìm thấy hồ sơ chó",
      });
    }

    if (isPublicRequest) {
      if (
        dog.approvalStatus !== "Đã duyệt" ||
        dog.isPublished !== true ||
        !PUBLIC_SALE_STATUSES.includes(dog.saleStatus)
      ) {
        return res.status(404).send({
          message: "Không tìm thấy hồ sơ chó",
        });
      }

      return res.send(dog);
    }

    if (!isAuthenticated(req)) {
      return res.status(403).send({
        message: "Bạn không có quyền truy cập hồ sơ này",
      });
    }

    if (!canAccessInternalDog(req, dog)) {
      return res.status(403).send({
        message: "Bạn không có quyền xem hồ sơ chó này",
      });
    }

    return res.send(dog);
  } catch (error) {
    return res.status(500).send({
      message: "Lỗi khi lấy chi tiết chó: " + error.message,
    });
  }
};

exports.updateApprovalStatus = async (req, res) => {
  try {
    if (!isAdminRole(req)) {
      return res.status(403).send({
        message: "Chỉ admin mới được duyệt hồ sơ chó",
      });
    }

    const { id } = req.params;
    const { approvalStatus, rejectionReason, price, saleStatus, isPublished } = req.body;

    if (!APPROVAL_STATUS.includes(approvalStatus)) {
      return res.status(400).send({
        message: "Trạng thái duyệt không hợp lệ",
      });
    }

    const dog = await Dog.findById(id);
    if (!dog) {
      return res.status(404).send({
        message: "Không tìm thấy hồ sơ chó",
      });
    }

    const oldApprovalStatus = dog.approvalStatus;
    const oldSaleStatus = dog.saleStatus;
    const oldPrice = dog.price;

    if (
      (approvalStatus === "Cần bổ sung" || approvalStatus === "Từ chối") &&
      !String(rejectionReason || "").trim()
    ) {
      return res.status(400).send({
        message: "Vui lòng nhập nội dung phản hồi cho trang trại",
      });
    }

    if (approvalStatus === "Đã duyệt") {
      const nextPublished = parseBoolean(isPublished);
      const targetSaleStatus = saleStatus || "Sẵn sàng bán";

      if (price === undefined || price === null || Number(price) <= 0) {
        return res.status(400).send({
          message: "Vui lòng nhập giá bán chính thức hợp lệ",
        });
      }

      if (Number(price) < Number(dog.proposedPrice || 0)) {
        return res.status(400).send({
          message: "Giá bán chính thức không được nhỏ hơn giá đề xuất từ trang trại",
        });
      }

      if (targetSaleStatus !== "Sẵn sàng bán") {
        return res.status(400).send({
          message: "Khi admin duyệt, trạng thái bán phải là 'Sẵn sàng bán'",
        });
      }


      dog.approvalStatus = "Đã duyệt";
      dog.price = Number(price);
      dog.saleStatus = "Sẵn sàng bán";
      dog.isPublished = nextPublished === undefined ? true : nextPublished;
      dog.rejectionReason = "";
    }

    if (approvalStatus === "Cần bổ sung") {
      dog.approvalStatus = "Cần bổ sung";
      dog.saleStatus = "Chưa mở bán";
      dog.isPublished = false;
      dog.rejectionReason = String(rejectionReason || "").trim();
    }

    if (approvalStatus === "Từ chối") {
      dog.approvalStatus = "Từ chối";
      dog.saleStatus = "Chưa mở bán";
      dog.isPublished = false;
      dog.rejectionReason = String(rejectionReason || "").trim();
    }

    if (approvalStatus === "Chờ duyệt") {
      dog.approvalStatus = "Chờ duyệt";
      dog.saleStatus = "Chưa mở bán";
      dog.isPublished = false;
      dog.rejectionReason = "";
    }

    dog.reviewedAt = new Date();
    dog.reviewedBy = req.user?._id || req.user?.id || null;

    await dog.save();

    if (oldApprovalStatus !== dog.approvalStatus) {
      await createDogHistory({
        dogId: dog._id,
        oldStatus: oldApprovalStatus,
        newStatus: dog.approvalStatus,
        req,
        reason:
          dog.approvalStatus === "Cần bổ sung" || dog.approvalStatus === "Từ chối"
            ? dog.rejectionReason
            : "",
        note: "Admin cập nhật trạng thái duyệt hồ sơ chó",
      });
    }

    if (oldSaleStatus !== dog.saleStatus) {
      await createDogHistory({
        dogId: dog._id,
        oldStatus: oldSaleStatus,
        newStatus: dog.saleStatus,
        req,
        note:
          dog.approvalStatus === "Đã duyệt"
            ? "Admin duyệt hồ sơ và mở bán chó"
            : "Admin cập nhật trạng thái bán sau khi xử lý hồ sơ",
      });
    }

    if (oldPrice !== dog.price) {
      await createDogHistory({
        dogId: dog._id,
        oldStatus: String(oldPrice || ""),
        newStatus: String(dog.price || ""),
        req,
        note: "Admin cập nhật giá bán chính thức",
      });
    }

    const populatedDog = await populateDogQuery(Dog.findById(dog._id));

    return res.send({
      message:
        approvalStatus === "Đã duyệt"
          ? "Duyệt hồ sơ chó thành công và đã mở bán"
          : approvalStatus === "Cần bổ sung"
          ? "Đã phản hồi hồ sơ cho trang trại bổ sung"
          : approvalStatus === "Từ chối"
          ? "Đã từ chối hồ sơ chó"
          : "Cập nhật trạng thái duyệt thành công",
      dog: populatedDog,
    });
  } catch (error) {
    return res.status(500).send({
      message: "Lỗi khi cập nhật trạng thái duyệt: " + error.message,
    });
  }
};

exports.updateSaleStatus = async (req, res) => {
  try {
    if (!isAdminRole(req)) {
      return res.status(403).send({
        message: "Chỉ admin mới được cập nhật trạng thái bán",
      });
    }

    const { id } = req.params;
    const { saleStatus } = req.body;

    if (!SALE_STATUS.includes(saleStatus)) {
      return res.status(400).send({
        message: "Trạng thái bán không hợp lệ",
      });
    }

    const dog = await Dog.findById(id);
    if (!dog) {
      return res.status(404).send({
        message: "Không tìm thấy hồ sơ chó",
      });
    }

    if (dog.approvalStatus !== "Đã duyệt") {
      return res.status(400).send({
        message: "Chỉ chó đã duyệt mới được cập nhật trạng thái bán",
      });
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
      return res.status(400).send({
        message: `Không thể chuyển trạng thái từ "${oldSaleStatus}" sang "${saleStatus}"`,
      });
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
      note: "Admin cập nhật trạng thái bán của chó",
    });

    const populatedDog = await populateDogQuery(Dog.findById(dog._id));

    return res.send({
      message: "Cập nhật trạng thái bán thành công",
      dog: populatedDog,
    });
  } catch (error) {
    return res.status(500).send({
      message: "Lỗi khi cập nhật trạng thái bán: " + error.message,
    });
  }
};

exports.update = async (req, res) => {
  try {
    if (!isFarmRole(req)) {
      return res.status(403).send({
        message: "Chỉ trang trại mới được cập nhật hồ sơ chó",
      });
    }

    const { id } = req.params;
    const dog = await Dog.findById(id);

    if (!dog) {
      return res.status(404).send({
        message: "Không tìm thấy hồ sơ chó để cập nhật",
      });
    }

    const permissionError = ensureFarmPermission(req, dog.farmId);
    if (permissionError) {
      return res.status(403).send({ message: permissionError });
    }

    if (lockStatuses.includes(dog.saleStatus)) {
      return res.status(400).send({
        message: "Không thể chỉnh sửa hồ sơ vì bé chó đang trong quá trình giao dịch hoặc đã bán",
      });
    }

    if (!["Chờ duyệt", "Cần bổ sung", "Từ chối", "Đã duyệt"].includes(dog.approvalStatus)) {
      return res.status(400).send({
        message:
          "Chỉ được chỉnh sửa hồ sơ khi đang chờ duyệt, cần bổ sung, bị từ chối hoặc đã duyệt nhưng chưa giao dịch",
      });
    }

    const updateData = { ...req.body };

    delete updateData.farmId;
    delete updateData.approvalStatus;
    delete updateData.saleStatus;
    delete updateData.rejectionReason;
    delete updateData.isPublished;
    delete updateData.sourceVerified;
    delete updateData.maCho;
    delete updateData.reviewedAt;
    delete updateData.reviewedBy;
    delete updateData.price;
    delete updateData.vaccinated;
    delete updateData.depositAmount;

    if (updateData.proposedPrice !== undefined) {
      updateData.proposedPrice =
        updateData.proposedPrice === ""
          ? null
          : Number(updateData.proposedPrice);
    }

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    if (updateData.weight !== undefined) {
      updateData.weight =
        updateData.weight === "" ? null : Number(updateData.weight);
    }

    const changedBasicInfo = hasAnyBasicChange(updateData) || !!req.file;

    if (
      changedBasicInfo ||
      ["Cần bổ sung", "Từ chối", "Đã duyệt"].includes(dog.approvalStatus)
    ) {
      updateData.approvalStatus = "Chờ duyệt";
      updateData.saleStatus = "Chưa mở bán";
      updateData.isPublished = false;
      updateData.rejectionReason = "";
      updateData.sourceVerified = false;
      updateData.reviewedAt = null;
      updateData.reviewedBy = null;

      if (updateData.proposedPrice !== undefined && updateData.proposedPrice !== null) {
        updateData.price = updateData.proposedPrice;
      }
    }

    const oldApprovalStatus = dog.approvalStatus;
    const oldSaleStatus = dog.saleStatus;

    const updatedDog = await populateDogQuery(
      Dog.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true })
    );

    if (!updatedDog) {
      return res.status(404).send({
        message: "Không tìm thấy hồ sơ chó để cập nhật",
      });
    }

    if (oldApprovalStatus !== updatedDog.approvalStatus) {
      await createDogHistory({
        dogId: updatedDog._id,
        oldStatus: oldApprovalStatus,
        newStatus: updatedDog.approvalStatus,
        req,
        note: "Trang trại cập nhật hồ sơ chó và gửi lại admin duyệt",
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
      message:
        oldApprovalStatus === "Đã duyệt"
          ? "Cập nhật thành công! Hồ sơ đã quay về trạng thái chờ duyệt để admin xét lại."
          : changedBasicInfo
          ? "Cập nhật thành công! Hồ sơ đã quay về trạng thái chờ duyệt."
          : "Cập nhật hồ sơ chó thành công!",
      dog: updatedDog,
    });
  } catch (error) {
    return res.status(500).send({
      message: "Lỗi khi cập nhật dữ liệu: " + error.message,
    });
  }
};

exports.getHistory = async (req, res) => {
  try {
    if (!isAdminRole(req)) {
      return res.status(403).send({
        message: "Bạn không có quyền xem lịch sử hồ sơ chó",
      });
    }

    const { id } = req.params;

    const dog = await Dog.findById(id);
    if (!dog) {
      return res.status(404).send({
        message: "Không tìm thấy hồ sơ chó",
      });
    }

    const histories = await DogHistory.find({ dogId: id }).sort({ createdAt: -1 });

    return res.send(histories);
  } catch (error) {
    return res.status(500).send({
      message: "Lỗi khi lấy lịch sử hồ sơ chó: " + error.message,
    });
  }
};