import createApiClient from "./api.service";

class AuthService {
  constructor(baseUrl = "/api/auth") {
    this.api = createApiClient(baseUrl);
  }

  // 1. Đăng nhập hệ thống
  async login(data) {
    return (await this.api.post("/login", data)).data;
  }

  // 2. Đăng ký tài khoản khách hàng
  async create(data) {
    return (await this.api.post("/register", data)).data;
  }

  // 3. Đăng ký tài khoản kèm hồ sơ trại
  async registerFarm(data) {
    return (await this.api.post("/register-farm", data)).data;
  }

  // 4. Lấy toàn bộ danh sách tài khoản
  async getAllUsers() {
    return (await this.api.get("/users")).data;
  }

  // 5. Cập nhật trạng thái tài khoản
  async toggleStatus(id) {
    return (await this.api.put(`/status/${id}`)).data;
  }

  // 6. Đổi mật khẩu
  async changePassword(data) {
    return (await this.api.put("/change-password", data)).data;
  }
}

export default new AuthService();