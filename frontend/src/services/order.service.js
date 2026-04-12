import createApiClient from "./api.service";

class OrderService {
  constructor(baseUrl = "/api/orders") {
    this.api = createApiClient(baseUrl);
  }

  async createDeposit(data) {
    return (await this.api.post("/deposit", data)).data;
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

  async getHistory(id) {
    return (await this.api.get(`/${id}/history`)).data;
  }
}

export default new OrderService();