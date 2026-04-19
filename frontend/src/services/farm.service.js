import createApiClient from "./api.service";

class FarmService {
  constructor(baseUrl = "/api/farms") {
    this.api = createApiClient(baseUrl);
  }

  async getAll() {
    return (await this.api.get("/")).data;
  }

  async getPublic() {
    return (await this.api.get("/public")).data;
  }

  async create(data) {
    return (
      await this.api.post("/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    ).data;
  }

  async update(id, data) {
    if (!id || id === "undefined") {
      console.error("Lỗi: ID trang trại bị undefined khi gọi update!");
      throw new Error("ID không hợp lệ");
    }

    return (
      await this.api.put(`/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    ).data;
  }

  async updateStatus(id, status) {
    if (!id || id === "undefined") {
      console.error("Lỗi: ID trang trại bị undefined khi gọi updateStatus!");
      throw new Error("ID không hợp lệ");
    }

    return (await this.api.put(`/${id}/status`, { status })).data;
  }

  async delete(id) {
    return (await this.api.delete(`/${id}`)).data;
  }

  async getNextCode() {
    return (await this.api.get("/next-code")).data;
  }
}

export default new FarmService();