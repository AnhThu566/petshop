import createApiClient from "./api.service";

class CustomerService {
    constructor(baseUrl = "/api/customers") {
        this.api = createApiClient(baseUrl);
    }

    // Lấy danh sách khách hàng (Backend nên lọc sẵn role: customer)
    async getAll() {
        return (await this.api.get("/")).data;
    }

    // Cập nhật thông tin hoặc trạng thái (Khóa/Mở khóa)
    async update(id, data) {
        return (await this.api.put(`/${id}`, data)).data;
    }

    // Xóa khách hàng
    async delete(id) {
        return (await this.api.delete(`/${id}`)).data;
    }

    // Tạo mới khách hàng
    async create(data) {
        return (await this.api.post("/", data)).data;
    }

    // Lấy mã khách hàng tự động (KH001, KH002...)
    async getNextCode() {
        return (await this.api.get("/next-code")).data;
    }
}

export default new CustomerService();