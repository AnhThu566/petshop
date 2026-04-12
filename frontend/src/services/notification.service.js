import createApiClient from "./api.service";

class NotificationService {
  constructor(baseUrl = "/api/notifications") {
    this.api = createApiClient(baseUrl);
  }

  async create(data) {
    return (await this.api.post("/", data)).data;
  }

  async getAll(params = {}) {
    return (await this.api.get("/", { params })).data;
  }

  async getCustomerNotifications() {
    return (await this.api.get("/customer/me")).data;
  }

  async getFarmNotifications() {
    return (await this.api.get("/farm/me")).data;
  }

  async markCustomerNotificationAsRead(id) {
    return (await this.api.put(`/customer/${id}/read`)).data;
  }

  async markFarmNotificationAsRead(id) {
    return (await this.api.put(`/farm/${id}/read`)).data;
  }

  async markAdminNotificationAsRead(id) {
    return (await this.api.put(`/admin/${id}/read`)).data;
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