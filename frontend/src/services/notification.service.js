import createApiClient from "./api.service";

class NotificationService {
  constructor(baseUrl = "/api/notifications") {
    this.api = createApiClient(baseUrl);
  }

  async create(data) {
    return (await this.api.post("/", data)).data;
  }

  async getAll() {
    return (await this.api.get("/")).data;
  }

  async getCustomerNotifications() {
    return (await this.api.get("/customer/me")).data;
  }

  async getFarmNotifications() {
    return (await this.api.get("/farm/me")).data;
  }

  async markAsRead(id) {
    return (await this.api.put(`/${id}/read`)).data;
  }

  async markAllAsReadForCustomer() {
    return (await this.api.put("/customer/read-all")).data;
  }

  async markAllAsReadForFarm() {
    return (await this.api.put("/farm/read-all")).data;
  }

  async delete(id) {
    return (await this.api.delete(`/${id}`)).data;
  }
}

export default new NotificationService();