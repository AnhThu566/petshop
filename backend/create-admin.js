require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./app/models/user.model");

async function createAdmin() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.DB_URI;

    if (!mongoUri) {
      throw new Error("Chưa tìm thấy MONGODB_URI trong file .env");
    }

    await mongoose.connect(mongoUri);

    console.log("Đã kết nối MongoDB Atlas");

    const username = "admin1";
    const email = "admin1@gmail.com";
    const phone = "0900000003";

    const exists = await User.findOne({
      $or: [{ username }, { email }, { phone }],
    });

    if (exists) {
      console.log("Admin đã tồn tại:");
      console.log({
        username: exists.username,
        email: exists.email,
        phone: exists.phone,
        role: exists.role,
      });
      process.exit(0);
    }

    const admin = new User({
      username,
      password: "123456",
      fullName: "Quản trị viên",
      email,
      phone,
      role: "admin",
      status: "active",
      gender: "Khác",
      address: "",
    });

    await admin.save();

    console.log("Tạo admin thành công");
    console.log({
      username: admin.username,
      email: admin.email,
      phone: admin.phone,
      role: admin.role,
    });

    process.exit(0);
  } catch (error) {
    console.error("Lỗi tạo admin:", error.message);
    process.exit(1);
  }
}

createAdmin();