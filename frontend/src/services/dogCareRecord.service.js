import createApiClient from "./api.service";

class DogCareRecordService {
  constructor(baseUrl = "/api/dog-care-records") {
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

  async addFollowUp(id, data) {
    return (await this.api.post(`/${id}/follow-up`, data)).data;
  }

  async getByDog(dogId) {
    return (await this.api.get(`/dog/${dogId}`)).data;
  }

  async getMyRecords() {
    return (await this.api.get("/my-records")).data;
  }
}

export default new DogCareRecordService();