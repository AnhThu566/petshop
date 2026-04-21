import createApiClient from "./api.service";

class UserService {
  constructor(baseUrl = "/api/users") {
    this.api = createApiClient(baseUrl);
  }

  async getMe() {
    return (await this.api.get("/me")).data;
  }

  async updateMe(data) {
    return (
      await this.api.put("/me", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
    ).data;
  }
}

export default new UserService();