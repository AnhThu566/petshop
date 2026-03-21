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
    return (await this.api.put(`/${id}`, data)).data;
  }

  async updateStatus(id, data) {
    return (await this.api.put(`/${id}/status`, data)).data;
  }
}

export default new DogService();