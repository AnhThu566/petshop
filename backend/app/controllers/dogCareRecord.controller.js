const DogCareRecord = require("../models/dogCareRecord.model");
const Dog = require("../models/dog.model");
const Order = require("../models/order.model");
const ApiError = require("../api-error");

exports.create = async (req, res, next) => {
  try {
    const {
      dogId,
      orderId,
      customerId,
      handoverDate,
      handoverCondition,
      initialCareNote,
      currentStatus,
      nextCheckDate,
      adminNote,
    } = req.body;

    if (!dogId || !orderId || !customerId) {
      return next(
        new ApiError(400, "Thiếu thông tin bắt buộc để tạo hồ sơ theo dõi sau bán")
      );
    }

    const dog = await Dog.findById(dogId);
    if (!dog) {
      return next(new ApiError(404, "Không tìm thấy bé chó"));
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return next(new ApiError(404, "Không tìm thấy đơn hàng"));
    }

    if (String(order.dogId) !== String(dogId)) {
      return next(new ApiError(400, "Đơn hàng không khớp với bé chó"));
    }

    if (String(order.userId) !== String(customerId)) {
      return next(new ApiError(400, "Khách hàng không khớp với đơn hàng"));
    }

    const existed = await DogCareRecord.findOne({ dogId, orderId });
    if (existed) {
      return next(
        new ApiError(400, "Đã tồn tại hồ sơ theo dõi sau bán cho đơn hàng này")
      );
    }

    const createdBy = req.user?.id || null;

    const record = await DogCareRecord.create({
      dogId,
      orderId,
      customerId,
      handoverDate: handoverDate || new Date(),
      handoverCondition: handoverCondition ? String(handoverCondition).trim() : "",
      initialCareNote: initialCareNote ? String(initialCareNote).trim() : "",
      currentStatus: currentStatus || "Đang theo dõi",
      nextCheckDate: nextCheckDate || null,
      adminNote: adminNote ? String(adminNote).trim() : "",
      createdBy,
    });

    const populated = await DogCareRecord.findById(record._id)
      .populate("dogId", "name maCho image")
      .populate("orderId", "status")
      .populate("customerId", "username fullName email phone")
      .populate("createdBy", "username fullName");

    return res.send({
      message: "Tạo hồ sơ theo dõi sau bán thành công",
      careRecord: populated,
    });
  } catch (error) {
    return next(
      new ApiError(500, "Lỗi khi tạo hồ sơ theo dõi sau bán: " + error.message)
    );
  }
};

exports.findAll = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.dogId) filter.dogId = req.query.dogId;
    if (req.query.orderId) filter.orderId = req.query.orderId;
    if (req.query.customerId) filter.customerId = req.query.customerId;
    if (req.query.currentStatus) filter.currentStatus = req.query.currentStatus;

    const records = await DogCareRecord.find(filter)
      .populate("dogId", "name maCho image saleStatus")
      .populate("orderId", "status")
      .populate("customerId", "username fullName email phone")
      .populate("createdBy", "username fullName")
      .sort({ createdAt: -1 });

    return res.send(records);
  } catch (error) {
    return next(
      new ApiError(
        500,
        "Lỗi khi lấy danh sách hồ sơ theo dõi sau bán: " + error.message
      )
    );
  }
};

exports.findOne = async (req, res, next) => {
  try {
    const { id } = req.params;

    const record = await DogCareRecord.findById(id)
      .populate("dogId", "name maCho image saleStatus")
      .populate("orderId", "status totalPrice")
      .populate("customerId", "username fullName email phone")
      .populate("createdBy", "username fullName");

    if (!record) {
      return next(new ApiError(404, "Không tìm thấy hồ sơ theo dõi sau bán"));
    }

    return res.send(record);
  } catch (error) {
    return next(
      new ApiError(
        500,
        "Lỗi khi lấy chi tiết hồ sơ theo dõi sau bán: " + error.message
      )
    );
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;

    const record = await DogCareRecord.findById(id);
    if (!record) {
      return next(new ApiError(404, "Không tìm thấy hồ sơ theo dõi sau bán"));
    }

    const {
      handoverDate,
      handoverCondition,
      initialCareNote,
      currentStatus,
      nextCheckDate,
      adminNote,
    } = req.body;

    if (handoverDate !== undefined) record.handoverDate = handoverDate || record.handoverDate;
    if (handoverCondition !== undefined) record.handoverCondition = String(handoverCondition || "").trim();
    if (initialCareNote !== undefined) record.initialCareNote = String(initialCareNote || "").trim();
    if (currentStatus !== undefined) record.currentStatus = String(currentStatus || "").trim();
    if (nextCheckDate !== undefined) record.nextCheckDate = nextCheckDate || null;
    if (adminNote !== undefined) record.adminNote = String(adminNote || "").trim();

    await record.save();

    const populated = await DogCareRecord.findById(record._id)
      .populate("dogId", "name maCho image")
      .populate("orderId", "status")
      .populate("customerId", "username fullName email phone")
      .populate("createdBy", "username fullName");

    return res.send({
      message: "Cập nhật hồ sơ theo dõi sau bán thành công",
      careRecord: populated,
    });
  } catch (error) {
    return next(
      new ApiError(
        500,
        "Lỗi khi cập nhật hồ sơ theo dõi sau bán: " + error.message
      )
    );
  }
};

exports.addFollowUp = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { followUpDate, condition, appetiteStatus, activityStatus, note } = req.body;

    const record = await DogCareRecord.findById(id);
    if (!record) {
      return next(new ApiError(404, "Không tìm thấy hồ sơ theo dõi sau bán"));
    }

    const updatedBy = req.user?.id || null;

    record.followUps.push({
      followUpDate: followUpDate || new Date(),
      condition: condition ? String(condition).trim() : "",
      appetiteStatus: appetiteStatus ? String(appetiteStatus).trim() : "",
      activityStatus: activityStatus ? String(activityStatus).trim() : "",
      note: note ? String(note).trim() : "",
      updatedBy,
    });

    await record.save();

    const populated = await DogCareRecord.findById(record._id)
      .populate("dogId", "name maCho image")
      .populate("orderId", "status")
      .populate("customerId", "username fullName email phone")
      .populate("createdBy", "username fullName");

    return res.send({
      message: "Thêm lần theo dõi sau bán thành công",
      careRecord: populated,
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi thêm lần theo dõi: " + error.message));
  }
};

exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;

    const record = await DogCareRecord.findByIdAndDelete(id);
    if (!record) {
      return next(new ApiError(404, "Không tìm thấy hồ sơ theo dõi sau bán để xóa"));
    }

    return res.send({ message: "Xóa hồ sơ theo dõi sau bán thành công" });
  } catch (error) {
    return next(
      new ApiError(500, "Lỗi khi xóa hồ sơ theo dõi sau bán: " + error.message)
    );
  }
};

exports.findMyCareRecords = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(new ApiError(401, "Bạn chưa đăng nhập"));
    }

    const currentUserId = req.user.id;

    const records = await DogCareRecord.find({ customerId: currentUserId })
      .populate("dogId", "name maCho image saleStatus")
      .populate("orderId", "status totalPrice")
      .sort({ createdAt: -1 });

    return res.send(records);
  } catch (error) {
    return next(
      new ApiError(
        500,
        "Lỗi khi lấy hồ sơ theo dõi sau bán của bạn: " + error.message
      )
    );
  }
};

exports.findByDog = async (req, res, next) => {
  try {
    const { dogId } = req.params;

    const dog = await Dog.findById(dogId);
    if (!dog) {
      return next(new ApiError(404, "Không tìm thấy bé chó"));
    }

    const records = await DogCareRecord.find({ dogId })
      .populate("dogId", "name maCho image")
      .populate("orderId", "status")
      .populate("customerId", "username fullName")
      .sort({ createdAt: -1 });

    return res.send(records);
  } catch (error) {
    return next(
      new ApiError(
        500,
        "Lỗi khi lấy hồ sơ theo dõi theo chó: " + error.message
      )
    );
  }
};