import createApiClient from "./api.service";

class DogService {
  constructor(baseUrl = "/api/dogs") {
    this.api = createApiClient(baseUrl);
  }

  async create(data) {
    return (
      await this.api.post("/", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
    ).data;
  }

  async getAll() {
    return (await this.api.get("/")).data;
  }

  async getPublic() {
    return (await this.api.get("/?public=true")).data;
  }

  async get(id) {
    return (await this.api.get(`/${id}`)).data;
  }

  async update(id, data) {
    return (
      await this.api.put(`/${id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
    ).data;
  }

  async updateApprovalStatus(id, data) {
    return (await this.api.put(`/${id}/approval-status`, data)).data;
  }

  async updateSaleStatus(id, data) {
    return (await this.api.put(`/${id}/sale-status`, data)).data;
  }

  async getHistory(id) {
    return (await this.api.get(`/${id}/history`)).data;
  }
}

export default new DogService();