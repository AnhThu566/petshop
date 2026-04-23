const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Tên đăng nhập không được để trống"],
      unique: true,
      trim: true,
      minlength: [3, "Tên đăng nhập phải có ít nhất 3 ký tự"],
      maxlength: [30, "Tên đăng nhập tối đa 30 ký tự"],
      match: [/^[a-zA-Z0-9_]+$/, "Tên đăng nhập chỉ được chứa chữ, số và dấu gạch dưới"],
    },
    password: {
      type: String,
      required: [true, "Mật khẩu không được để trống"],
      minlength: [6, "Mật khẩu phải có ít nhất 6 ký tự"],
    },
    fullName: {
      type: String,
      required: [true, "Họ tên không được để trống"],
      trim: true,
      default: "",
    },
    gender: {
      type: String,
      enum: ["Nam", "Nữ", "Khác"],
      default: "Khác",
    },
    birthday: {
      type: Date,
      default: null,
    },
    phone: {
      type: String,
      required: [true, "Số điện thoại không được để trống"],
      unique: true,
      trim: true,
      match: [/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/, "Số điện thoại không hợp lệ"],
    },
    address: {
      type: String,
      default: "",
      trim: true,
    },
    avatar: {
      type: String,
      default: "",
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email không được để trống"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Email không hợp lệ"],
    },
    customerCode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      default: null,
    },
    role: {
      type: String,
      enum: ["admin", "farm", "customer"],
      default: "customer",
    },
    status: {
      type: String,
      enum: ["active", "locked"],
      default: "active",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

userSchema.method("toJSON", function () {
  const { __v, _id, password, ...object } = this.toObject();
  object.id = _id;
  return object;
});

module.exports = mongoose.model("User", userSchema);