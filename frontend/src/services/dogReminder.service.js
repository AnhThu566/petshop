import createApiClient from "./api.service";

class DogReminderService {
  constructor(baseUrl = "/api/dog-reminders") {
    this.api = createApiClient(baseUrl);
  }

  // ==============================
  // ADMIN
  // ==============================

  async create(data) {
    return (await this.api.post("/", data)).data;
  }

  async getAll(params = {}) {
    return (await this.api.get("/", { params })).data;
  }

  async updateStatus(id, data) {
    return (await this.api.put(`/${id}/status`, data)).data;
  }

  // ==============================
  // CUSTOMER
  // ==============================

  async getMyReminders(params = {}) {
    return (await this.api.get("/my-reminders", { params })).data;
  }

  async markCompleted(id) {
    return (await this.api.put(`/${id}/complete`)).data;
  }
}

export default new DogReminderService();