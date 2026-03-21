import createApiClient from "./api.service";

class BreedService {
    constructor(baseUrl = "/api/breeds") {
        this.api = createApiClient(baseUrl);
    }

    // Lấy danh sách tất cả giống chó
    async getAll() {
        return (await this.api.get("/")).data;
    }

    // Lấy 1 giống chó theo ID
    async get(id) {
        return (await this.api.get(`/${id}`)).data;
    }

    // Thêm một giống chó mới
    async create(data) {
        return (
            await this.api.post("/", data, {
                headers: { "Content-Type": "multipart/form-data" }
            })
        ).data;
    }

    // Cập nhật thông tin giống chó
    async update(id, data) {
        return (
            await this.api.put(`/${id}`, data, {
                headers: { "Content-Type": "multipart/form-data" }
            })
        ).data;
    }

    // Xóa một giống chó theo ID
    async delete(id) {
        return (await this.api.delete(`/${id}`)).data;
    }

    // Lấy mã giống chó tiếp theo
    async getNextCode() {
        return (await this.api.get("/next-code")).data;
    }
}

export default new BreedService();