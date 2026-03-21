import createApiClient from "./api.service";

class AuthService {
    constructor(baseUrl = "/api/auth") {
        this.api = createApiClient(baseUrl);
    }

    // 1. Đăng nhập hệ thống
    async login(data) {
        return (await this.api.post("/login", data)).data;
    }

    // 2. 👉 THÊM: Hàm tạo tài khoản người dùng thuần túy (Dùng cho Bước 1 của em)
    // Hàm này sẽ gọi đến API tạo User (role farm/customer/admin)
    async create(data) {
        // Phải khớp với router.post("/register", ...) ở Backend
        return (await this.api.post("/register", data)).data;
    }

    // 3. Hàm tạo tài khoản kèm hồ sơ trại (Gộp 2 trong 1 - nếu em vẫn muốn dùng)
    async registerFarm(data) {
        return (await this.api.post("/register-farm", data)).data;
    }

    // 4. Lấy toàn bộ danh sách tài khoản để Admin quản lý
    async getAllUsers() {
        return (await this.api.get("/users")).data;
    }

    // 5. Cập nhật trạng thái (Khóa/Mở khóa) tài khoản
    async toggleStatus(id) {
        return (await this.api.put(`/status/${id}`)).data;
    }
}

export default new AuthService();