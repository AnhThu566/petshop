import createApiClient from "./api.service";

class ServiceBookingService {
  constructor(baseUrl = "/api/service-bookings") {
    this.api = createApiClient(baseUrl);
  }

  async create(data) {
    return (await this.api.post("/", data)).data;
  }

  async getAll() {
    return (await this.api.get("/")).data;
  }

  async getMyBookings() {
    return (await this.api.get("/my-bookings")).data;
  }

  async updateStatus(id, status) {
    return (await this.api.put(`/${id}/status`, { status })).data;
  }

  async cancelByCustomer(id) {
    return (await this.api.put(`/${id}/cancel`)).data;
  }
}

export default new ServiceBookingService();