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

  async getMyOrders() {
    return (await this.api.get("/my-orders")).data;
  }

  async updateStatus(id, status) {
    return (await this.api.put(`/${id}/status`, { status })).data;
  }

  async cancelByCustomer(id) {
    return (await this.api.put(`/${id}/cancel`)).data;
  }
}

export default new AccessoryOrderService();