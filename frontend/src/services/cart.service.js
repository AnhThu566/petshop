import createApiClient from "./api.service";

class CartService {
  constructor(baseUrl = "/api/cart") {
    this.api = createApiClient(baseUrl);
  }

  async getCart() {
    return (await this.api.get("/")).data;
  }

  async addToCart(accessoryId, quantity = 1) {
    return (
      await this.api.post("/items", {
        accessoryId,
        quantity,
      })
    ).data;
  }

  async updateQuantity(itemId, quantity) {
    return (
      await this.api.put(`/items/${itemId}`, {
        quantity,
      })
    ).data;
  }

  async removeItem(itemId) {
    return (await this.api.delete(`/items/${itemId}`)).data;
  }

  async clearCart() {
    return (await this.api.delete("/clear")).data;
  }
}

export default new CartService();