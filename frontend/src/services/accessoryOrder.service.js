import createApiClient from "./api.service";

class AccessoryOrderService {
    constructor(baseUrl = "/api/accessory-orders") {
        this.api = createApiClient(baseUrl);
    }

    async create(data) {
        return (await this.api.post("/", data)).data;
    }

    async getAll() {
        return (await this.api.get("/")).data;
    }

    async getByUserId(userId) {
        return (await this.api.get(`/user/${userId}`)).data;
    }

    async get(id) {
        return (await this.api.get(`/${id}`)).data;
    }

    async updateStatus(id, status) {
        return (await this.api.put(`/${id}/status`, { status })).data;
    }

    async cancelByCustomer(id) {
        return (await this.api.put(`/${id}/cancel`)).data;
    }
}

export default new AccessoryOrderService();