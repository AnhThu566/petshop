import createApiClient from "./api.service";

class DogHealthRecordService {
  constructor(baseUrl = "/api/dog-health-records") {
    this.api = createApiClient(baseUrl);
  }

  async getAll(params = {}) {
    return (await this.api.get("/", { params })).data;
  }

  async create(data) {
    return (await this.api.post("/", data)).data;
  }

  async get(id) {
    return (await this.api.get(`/${id}`)).data;
  }

  async update(id, data) {
    return (await this.api.put(`/${id}`, data)).data;
  }

  async delete(id) {
    return (await this.api.delete(`/${id}`)).data;
  }

  async getLatestByDog(dogId) {
    return (await this.api.get(`/dog/${dogId}/latest`)).data;
  }
}

export default new DogHealthRecordService();