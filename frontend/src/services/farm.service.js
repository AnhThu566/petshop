import createApiClient from "./api.service";

class FarmService {
    constructor(baseUrl = "/api/farms") {
        this.api = createApiClient(baseUrl);
    }

    async getAll() {
        return (await this.api.get("/")).data;
    }

    // Hàm tạo mới (Hỗ trợ gửi file ảnh qua FormData)
    async create(data) {
        return (await this.api.post("/", data, {
            headers: { "Content-Type": "multipart/form-data" }
        })).data;
    }

    // Hàm cập nhật (Hỗ trợ gửi file ảnh qua FormData)
// Hàm cập nhật (Đã thêm kiểm tra ID để tránh lỗi Cast to ObjectId)
    async update(id, data) {
        if (!id || id === "undefined") {
            console.error("Lỗi: ID trang trại bị undefined khi gọi update!");
            throw new Error("ID không hợp lệ");
        }
        return (await this.api.put(`/${id}`, data, {
            headers: { "Content-Type": "multipart/form-data" }
        })).data;
    }

    async delete(id) {
        return (await this.api.delete(`/${id}`)).data;
    }

    // Hàm lấy mã tự động (VD: T001)
    async getNextCode() {
        return (await this.api.get("/next-code")).data;
    }
}

export default new FarmService();