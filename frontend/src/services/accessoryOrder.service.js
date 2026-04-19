import createApiClient from "./api.service";

class AccessoryOrderService {
  constructor(baseUrl = "/api/accessory-orders") {
    this.api = createApiClient(baseUrl);
  }

  async create(data) {
    return (await this.api.post("/", data)).data;
  }

  async getAll(params = {}) {
    return (await this.api.get("/", { params })).data;
  }

  async getMyOrders(params = {}) {
    return (await this.api.get("/my-orders", { params })).data;
  }

  async updateStatus(id, status) {
    return (await this.api.put(`/${id}/status`, { status })).data;
  }

  async cancelByCustomer(id) {
    return (await this.api.put(`/${id}/cancel`)).data;
  }

  async createZaloPayOrder(data) {
  return (await this.api.post("/zalopay/create", data)).data;
}

async queryZaloPayStatus(id) {
  return (await this.api.get(`/${id}/zalopay-status`)).data;
}
}

export default new AccessoryOrderService();