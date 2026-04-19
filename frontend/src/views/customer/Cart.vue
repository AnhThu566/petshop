<template>
  <div class="cart-page">
    <div class="container cart-container py-4">
      <div class="cart-head">
        <h3 class="cart-title">
          <i class="fas fa-shopping-cart mr-2"></i>
          Giỏ hàng phụ kiện
        </h3>

        <button
          v-if="cart.length > 0"
          class="clear-cart-btn"
          @click="clearCart"
          :disabled="loading || isSubmitting"
        >
          <i class="fas fa-trash mr-1"></i> Xóa toàn bộ
        </button>
      </div>

      <div v-if="loading" class="empty-cart-card">
        <i class="fas fa-spinner fa-spin empty-cart-icon"></i>
        <p class="empty-cart-text">Đang tải giỏ hàng...</p>
      </div>

      <div v-else-if="cart.length === 0" class="empty-cart-card">
        <i class="fas fa-shopping-cart empty-cart-icon"></i>
        <p class="empty-cart-text">Giỏ hàng của bạn đang trống.</p>
        <router-link to="/accessories" class="go-shopping-btn text-decoration-none">
          Xem phụ kiện
        </router-link>
      </div>

      <div v-else class="row">
        <div class="col-lg-8 mb-4">
          <div class="cart-table-card">
            <div class="table-responsive">
              <table class="table cart-table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th class="text-center">Giá</th>
                    <th class="text-center">Số lượng</th>
                    <th class="text-center">Thành tiền</th>
                    <th class="text-center">Xóa</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="item in cart" :key="item.id">
                    <td>
                      <div class="product-cell">
                        <img
                          :src="getAccessoryImage(item)"
                          alt="accessory"
                          class="product-thumb"
                        />
                        <div class="product-info">
                          <div class="product-name">
                            {{ item.name }}
                          </div>

                          <div
                            v-if="item.stock !== null && item.stock !== undefined"
                            class="product-sub"
                          >
                            Tồn kho: {{ item.stock }}
                          </div>

                          <div v-if="item.isPromotionApplied" class="product-sale-note">
                            <i class="fas fa-tags mr-1"></i>
                            Giá khuyến mãi đã áp dụng
                          </div>

                          <div
                            v-if="item.status && item.status !== 'Đang bán'"
                            class="product-sub text-danger"
                          >
                            Sản phẩm hiện không còn mở bán
                          </div>

                          <div
                            v-else-if="Number(item.stock || 0) <= 0"
                            class="product-sub text-danger"
                          >
                            Sản phẩm hiện đã hết hàng
                          </div>
                        </div>
                      </div>
                    </td>

                    <td class="text-center product-price">
                      <div v-if="item.isPromotionApplied && item.originalPriceAtDisplay > item.price" class="old-price-mini">
                        {{ formatCurrency(item.originalPriceAtDisplay) }}
                      </div>
                      <div class="current-price">
                        {{ formatCurrency(item.price) }}
                      </div>
                    </td>

                    <td class="text-center">
                      <div class="qty-control">
                        <button
                          class="qty-btn"
                          @click="decreaseQuantity(item)"
                          :disabled="updatingItemId === item.id || Number(item.quantity) <= 1 || !isItemPurchasable(item)"
                        >
                          -
                        </button>

                        <input
                          type="number"
                          min="1"
                          :max="item.stock || 1"
                          class="qty-input"
                          :value="item.quantity"
                          @change="changeQuantity(item, $event)"
                          :disabled="updatingItemId === item.id || !isItemPurchasable(item)"
                        />

                        <button
                          class="qty-btn"
                          @click="increaseQuantity(item)"
                          :disabled="
                            updatingItemId === item.id ||
                            !canIncrease(item)
                          "
                        >
                          +
                        </button>
                      </div>
                    </td>

                    <td class="text-center product-total">
                      {{ formatCurrency(Number(item.price) * Number(item.quantity)) }}
                    </td>

                    <td class="text-center">
                      <button
                        class="remove-btn"
                        @click="removeItem(item)"
                        :disabled="updatingItemId === item.id"
                      >
                        <i class="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-if="hasInvalidItems" class="cart-warning-box mt-3">
            <i class="fas fa-exclamation-triangle mr-2"></i>
            Giỏ hàng đang có sản phẩm không còn đủ điều kiện mua. Vui lòng cập nhật lại giỏ trước khi đặt hàng.
          </div>
        </div>

        <div class="col-lg-4">
          <div class="checkout-card">
            <h5 class="checkout-title">Thông tin đặt hàng</h5>

            <div class="form-group">
              <label>Họ tên người nhận <span class="text-danger">*</span></label>
              <input
                type="text"
                class="form-control custom-input"
                v-model.trim="form.customerName"
              />
            </div>

            <div class="form-group">
              <label>Số điện thoại <span class="text-danger">*</span></label>
              <input
                type="text"
                class="form-control custom-input"
                v-model.trim="form.customerPhone"
              />
            </div>

            <div class="form-group">
              <label>Địa chỉ nhận hàng <span class="text-danger">*</span></label>
              <textarea
                class="form-control custom-input"
                rows="3"
                v-model.trim="form.shippingAddress"
              ></textarea>
            </div>

            <div class="form-group">
              <label>Ghi chú</label>
              <textarea
                class="form-control custom-input"
                rows="2"
                v-model.trim="form.note"
              ></textarea>
            </div>

            <div class="summary-box">
              <div class="summary-row">
                <span>Tổng số lượng:</span>
                <strong>{{ totalCount }}</strong>
              </div>

              <div v-if="promotionItemCount > 0" class="summary-row promo-row">
                <span>Sản phẩm ưu đãi:</span>
                <strong>{{ promotionItemCount }}</strong>
              </div>

              <div class="summary-row total-row">
                <span>Tổng tiền:</span>
                <strong>{{ formatCurrency(totalPrice) }}</strong>
              </div>
            </div>

            <button
              class="submit-btn"
              @click="submitOrder"
              :disabled="isSubmitting || cart.length === 0 || hasInvalidItems"
            >
              <i class="fas fa-check-circle mr-1"></i>
              {{ isSubmitting ? "Đang xử lý..." : "Đặt hàng phụ kiện" }}
            </button>

            <router-link to="/accessories" class="secondary-btn text-decoration-none">
              Tiếp tục mua sắm
            </router-link>

            <router-link to="/accessory-orders" class="history-btn text-decoration-none">
              Lịch sử đơn phụ kiện
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CartService from "@/services/cart.service";
import AccessoryOrderService from "@/services/accessoryOrder.service";

export default {
  name: "CartPage",

  data() {
    return {
      cart: [],
      loading: false,
      isSubmitting: false,
      updatingItemId: null,
      baseImageUrl: "http://localhost:3000",
      summary: {
        totalQuantity: 0,
        totalAmount: 0,
      },
      form: {
        customerName: "",
        customerPhone: "",
        shippingAddress: "",
        note: "",
      },
    };
  },

  computed: {
    totalCount() {
      return Number(this.summary?.totalQuantity || 0);
    },

    totalPrice() {
      return Number(this.summary?.totalAmount || 0);
    },

    hasInvalidItems() {
      return this.cart.some((item) => !this.isItemPurchasable(item));
    },

    promotionItemCount() {
      return this.cart.filter((item) => item.isPromotionApplied).length;
    },
  },

  methods: {
    async loadCart() {
      try {
        this.loading = true;
        const response = await CartService.getCart();

        this.cart = (response.items || []).map((item) => {
          const accessoryPrice = Number(item.accessoryId?.price || 0);
          const priceAtTime = Number(item.priceAtTime || 0);

          return {
            id: item.id || item._id,
            accessoryId:
              item.accessoryId?._id || item.accessoryId?.id || item.accessoryId,
            name: item.accessoryId?.name || "",
            price: priceAtTime || accessoryPrice,
            originalPriceAtDisplay: accessoryPrice,
            isPromotionApplied:
              accessoryPrice > 0 &&
              priceAtTime > 0 &&
              priceAtTime < accessoryPrice,
            image: item.accessoryId?.image || "",
            stock: item.accessoryId?.quantity ?? null,
            status: item.accessoryId?.status || "",
            quantity: item.quantity || 1,
          };
        });

        this.summary = response.summary || {
          totalQuantity: this.cart.reduce(
            (sum, item) => sum + Number(item.quantity || 0),
            0
          ),
          totalAmount: this.cart.reduce(
            (sum, item) =>
              sum + Number(item.price || 0) * Number(item.quantity || 0),
            0
          ),
        };

        const user = JSON.parse(localStorage.getItem("user") || "null");
        if (user) {
          this.form.customerName = user.fullName || "";
          this.form.customerPhone = user.phone || "";
          this.form.shippingAddress = user.address || "";
        }
      } catch (error) {
        console.error("Lỗi tải giỏ hàng:", error);
        this.cart = [];
        this.summary = { totalQuantity: 0, totalAmount: 0 };
      } finally {
        this.loading = false;
      }
    },

    isItemPurchasable(item) {
      return (
        !!item.accessoryId &&
        item.status === "Đang bán" &&
        Number(item.stock || 0) > 0 &&
        Number(item.quantity || 0) <= Number(item.stock || 0)
      );
    },

    canIncrease(item) {
      if (!this.isItemPurchasable(item)) return false;

      const stock = Number(item.stock || 0);
      const qty = Number(item.quantity || 0);
      return stock > 0 && qty < stock;
    },

    normalizeInputQuantity(item, rawValue) {
      let value = Number(rawValue);

      if (!Number.isFinite(value) || value < 1) {
        value = 1;
      }

      value = Math.floor(value);

      const stock = Number(item.stock || 0);
      if (stock > 0 && value > stock) {
        value = stock;
      }

      return value;
    },

    async changeQuantity(item, event) {
      if (!this.isItemPurchasable(item)) {
        event.target.value = item.quantity;
        return;
      }

      const value = this.normalizeInputQuantity(item, event.target.value);

      if (value === Number(item.quantity)) {
        event.target.value = item.quantity;
        return;
      }

      try {
        this.updatingItemId = item.id;
        const response = await CartService.updateQuantity(item.id, value);
        if (response.summary) {
          this.summary = response.summary;
        }
        await this.loadCart();
        window.dispatchEvent(new Event("cart-updated"));
      } catch (error) {
        console.error("Lỗi cập nhật số lượng:", error);
        alert(error.response?.data?.message || "Không thể cập nhật số lượng.");
      } finally {
        this.updatingItemId = null;
      }
    },

    async increaseQuantity(item) {
      if (!this.canIncrease(item)) return;

      try {
        this.updatingItemId = item.id;
        const response = await CartService.updateQuantity(item.id, Number(item.quantity) + 1);
        if (response.summary) {
          this.summary = response.summary;
        }
        await this.loadCart();
        window.dispatchEvent(new Event("cart-updated"));
      } catch (error) {
        console.error("Lỗi tăng số lượng:", error);
        alert(error.response?.data?.message || "Không thể tăng số lượng.");
      } finally {
        this.updatingItemId = null;
      }
    },

    async decreaseQuantity(item) {
      if (Number(item.quantity) <= 1 || !this.isItemPurchasable(item)) return;

      try {
        this.updatingItemId = item.id;
        const response = await CartService.updateQuantity(item.id, Number(item.quantity) - 1);
        if (response.summary) {
          this.summary = response.summary;
        }
        await this.loadCart();
        window.dispatchEvent(new Event("cart-updated"));
      } catch (error) {
        console.error("Lỗi giảm số lượng:", error);
        alert(error.response?.data?.message || "Không thể giảm số lượng.");
      } finally {
        this.updatingItemId = null;
      }
    },

    async removeItem(item) {
      if (!confirm(`Xóa [${item.name}] khỏi giỏ hàng?`)) return;

      try {
        this.updatingItemId = item.id;
        const response = await CartService.removeItem(item.id);
        if (response.summary) {
          this.summary = response.summary;
        }
        await this.loadCart();
        window.dispatchEvent(new Event("cart-updated"));
      } catch (error) {
        console.error("Lỗi xóa sản phẩm:", error);
        alert(error.response?.data?.message || "Không thể xóa sản phẩm.");
      } finally {
        this.updatingItemId = null;
      }
    },

    async clearCart() {
      if (!confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng?")) return;

      try {
        const response = await CartService.clearCart();
        if (response.summary) {
          this.summary = response.summary;
        }
        await this.loadCart();
        window.dispatchEvent(new Event("cart-updated"));
      } catch (error) {
        console.error("Lỗi xóa toàn bộ giỏ hàng:", error);
        alert(error.response?.data?.message || "Không thể xóa giỏ hàng.");
      }
    },

    validateOrderBeforeSubmit() {
      if (!this.form.customerName) {
        throw new Error("Vui lòng nhập họ tên người nhận.");
      }

      if (!this.form.customerPhone) {
        throw new Error("Vui lòng nhập số điện thoại.");
      }

      if (!this.form.shippingAddress) {
        throw new Error("Vui lòng nhập địa chỉ nhận hàng.");
      }

      if (this.cart.length === 0) {
        throw new Error("Giỏ hàng đang trống.");
      }

      for (const item of this.cart) {
        if (!item.accessoryId) {
          throw new Error(`Sản phẩm [${item.name}] không hợp lệ.`);
        }

        if (item.status !== "Đang bán") {
          throw new Error(`Phụ kiện [${item.name}] hiện không còn mở bán.`);
        }

        if (Number(item.stock || 0) <= 0) {
          throw new Error(`Phụ kiện [${item.name}] đã hết hàng.`);
        }

        if (Number(item.quantity || 0) > Number(item.stock || 0)) {
          throw new Error(
            `Phụ kiện [${item.name}] vượt quá tồn kho. Chỉ còn ${item.stock} sản phẩm.`
          );
        }
      }
    },

    async submitOrder() {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      if (!user) {
        alert("Vui lòng đăng nhập để đặt hàng phụ kiện.");
        this.$router.push("/login");
        return;
      }

      try {
        this.validateOrderBeforeSubmit();
      } catch (error) {
        alert(error.message);
        return;
      }

      this.isSubmitting = true;

      try {
        await AccessoryOrderService.create({
          customerName: this.form.customerName,
          customerPhone: this.form.customerPhone,
          shippingAddress: this.form.shippingAddress,
          note: this.form.note,
          items: this.cart.map((item) => ({
            accessoryId: item.accessoryId,
            quantity: item.quantity,
          })),
        });

        alert("Đặt đơn phụ kiện thành công!");

        await CartService.clearCart();
        await this.loadCart();
        window.dispatchEvent(new Event("cart-updated"));

        this.$router.push("/accessory-orders");
      } catch (error) {
        console.error("Lỗi đặt đơn phụ kiện:", error);
        alert("Lỗi đặt đơn: " + (error.response?.data?.message || error.message));
        await this.loadCart();
      } finally {
        this.isSubmitting = false;
      }
    },

    getAccessoryImage(item) {
      if (!item?.image) return "";
      if (item.image.startsWith("http://") || item.image.startsWith("https://")) {
        return item.image;
      }
      return this.baseImageUrl + item.image;
    },

    formatCurrency(value) {
      if (value === null || value === undefined) return "---";
      return Number(value).toLocaleString("vi-VN") + " ₫";
    },
  },

  mounted() {
    this.loadCart();
    window.addEventListener("cart-updated", this.loadCart);
  },

  beforeUnmount() {
    window.removeEventListener("cart-updated", this.loadCart);
  },
};
</script>

<style scoped>
.cart-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #faf7fc 0%, #f4eef9 100%);
}

.cart-container {
  max-width: 1320px;
}

.cart-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.cart-title {
  margin: 0;
  color: #2f1b44;
  font-weight: 900;
  font-size: 1.7rem;
}

.cart-title i {
  color: #6a1b9a;
}

.clear-cart-btn {
  border: 1px solid #efc8df;
  background: #fff;
  color: #c2185b;
  border-radius: 12px;
  height: 42px;
  padding: 0 16px;
  font-weight: 700;
}

.empty-cart-card {
  background: #fff;
  border: 1px solid #eee2f7;
  border-radius: 20px;
  box-shadow: 0 10px 24px rgba(106, 27, 154, 0.06);
  text-align: center;
  padding: 60px 20px;
}

.empty-cart-icon {
  font-size: 3rem;
  color: #cdbfe0;
  margin-bottom: 14px;
}

.empty-cart-text {
  color: #7a708a;
  margin-bottom: 18px;
}

.go-shopping-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 42px;
  padding: 0 18px;
  border-radius: 12px;
  background: linear-gradient(135deg, #8e3fd1, #6a1b9a);
  color: #fff;
  font-weight: 700;
}

.cart-table-card,
.checkout-card {
  background: #fff;
  border: 1px solid #eee2f7;
  border-radius: 20px;
  box-shadow: 0 10px 24px rgba(106, 27, 154, 0.06);
}

.cart-table {
  margin: 0;
}

.cart-table thead th {
  background: #f8f3fc;
  color: #514564;
  font-size: 0.92rem;
  font-weight: 800;
  border-bottom: 1px solid #ece3f4;
  padding: 14px 12px;
  white-space: nowrap;
}

.cart-table tbody td {
  padding: 16px 12px;
  vertical-align: middle;
  border-top: 1px solid #f2ebf8;
}

.product-cell {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 220px;
}

.product-thumb {
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid #ece3f4;
  flex-shrink: 0;
}

.product-name {
  font-weight: 800;
  color: #2f1b44;
  line-height: 1.45;
}

.product-sub {
  color: #8b7fa0;
  font-size: 0.84rem;
  margin-top: 4px;
}

.product-sale-note {
  color: #dc2626;
  font-size: 0.83rem;
  font-weight: 700;
  margin-top: 4px;
}

.product-price {
  white-space: nowrap;
}

.old-price-mini {
  color: #9b90ad;
  font-size: 0.82rem;
  text-decoration: line-through;
  margin-bottom: 2px;
}

.current-price {
  color: #b42318;
  font-weight: 800;
}

.product-total {
  color: #2f1b44;
  font-weight: 800;
  white-space: nowrap;
}

.qty-control {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.qty-btn {
  width: 30px;
  height: 30px;
  border: 1px solid #dfd3ec;
  border-radius: 8px;
  background: #fff;
  color: #6d5d7d;
  font-weight: 800;
}

.qty-input {
  width: 56px;
  height: 34px;
  border: 1px solid #dfd3ec;
  border-radius: 8px;
  text-align: center;
  outline: none;
}

.remove-btn {
  width: 34px;
  height: 34px;
  border: 1px solid #efc8df;
  border-radius: 8px;
  background: #fff;
  color: #c2185b;
}

.checkout-card {
  padding: 20px;
}

.checkout-title {
  color: #2f1b44;
  font-weight: 900;
  margin-bottom: 18px;
}

.custom-input {
  border: 1px solid #dfd3ec;
  border-radius: 12px;
  min-height: 44px;
}

.custom-input:focus {
  border-color: #7b3fc8;
  box-shadow: 0 0 0 3px rgba(123, 63, 200, 0.08);
}

.summary-box {
  background: #faf7fd;
  border: 1px solid #eee2f7;
  border-radius: 16px;
  padding: 14px 16px;
  margin: 18px 0;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: #5c5368;
  margin-bottom: 8px;
}

.summary-row:last-child {
  margin-bottom: 0;
}

.promo-row strong {
  color: #dc2626;
}

.total-row strong {
  color: #b42318;
  font-size: 1.02rem;
}

.cart-warning-box {
  background: #fff7e8;
  border: 1px solid #f3d18b;
  color: #a16207;
  border-radius: 14px;
  padding: 14px 16px;
  font-weight: 600;
}

.submit-btn,
.secondary-btn,
.history-btn {
  width: 100%;
  min-height: 44px;
  border-radius: 12px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  border: none;
}

.submit-btn {
  background: linear-gradient(135deg, #8e3fd1, #6a1b9a);
  color: #fff;
}

.secondary-btn {
  background: #fff;
  border: 1px solid #dfd3ec;
  color: #5c5368;
}

.history-btn {
  background: #f3e8ff;
  color: #6a1b9a;
}

@media (max-width: 991.98px) {
  .cart-title {
    font-size: 1.45rem;
  }
}
</style>