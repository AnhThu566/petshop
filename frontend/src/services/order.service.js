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

  async updateStatus(id, status) {
    return (await this.api.put(`/${id}/status`, { status })).data;
  }

  async findByPhone(phone) {
    return (await this.api.get(`/phone/${phone}`)).data;
  }

  async findByUserId(userId) {
    return (await this.api.get(`/user/${userId}`)).data;
  }

  async cancelByCustomer(id) {
  return (await this.api.put(`/${id}/cancel`)).data;
}
}

export default new OrderService();