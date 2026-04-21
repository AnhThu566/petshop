import createApiClient from "./api.service";

class ServiceBookingService {
  constructor(baseUrl = "/api/service-bookings") {
    this.api = createApiClient(baseUrl);
  }

  async create(data) {
    return (await this.api.post("/", data)).data;
  }

  async getAll(params = {}) {
    return (await this.api.get("/", { params })).data;
  }

  async getMyBookings(params = {}) {
    return (await this.api.get("/my-bookings", { params })).data;
  }

  async updateStatus(id, status) {
    return (await this.api.put(`/${id}/status`, { status })).data;
  }

  async cancelByCustomer(id) {
    return (await this.api.put(`/${id}/cancel`)).data;
  }
}

export default new ServiceBookingService();