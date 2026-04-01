const mongoose = require("mongoose");
const User = require("./app/models/user.model");

async function createAdmin() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/petshop");

    const exists = await User.findOne({ username: "admin1" });
    if (exists) {
      console.log("Admin đã tồn tại");
      process.exit(0);
    }

    const admin = new User({
      username: "admin1",
      password: "123456",
      fullName: "Quản trị viên",
      email: "admin1@gmail.com",
      phone: "0900000003",
      role: "admin",
      status: "active",
    });

    await admin.save();
    console.log("Tạo admin thành công");
    process.exit(0);
  } catch (error) {
    console.error("Lỗi tạo admin:", error);
    process.exit(1);
  }
}

createAdmin();