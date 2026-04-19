<template>
  <div class="cart-page">
    <div class="container cart-container py-4">
      <div class="cart-head">
        <div>
          <h2 class="cart-title">
            <i class="fas fa-shopping-cart mr-2"></i>
            Giỏ hàng phụ kiện
          </h2>
          <p class="cart-subtitle">
            Chọn sản phẩm muốn mua và chuyển sang bước thanh toán
          </p>
        </div>

        <button
          v-if="cart.length > 0"
          class="clear-cart-btn"
          @click="clearCart"
          :disabled="loading"
        >
          <i class="fas fa-trash mr-1"></i>
          Xóa toàn bộ
        </button>
      </div>

      <div v-if="loading" class="empty-cart-card">
        <i class="fas fa-spinner fa-spin empty-cart-icon"></i>
        <p class="empty-cart-text">Đang tải giỏ hàng...</p>
      </div>

      <div v-else-if="cart.length === 0" class="empty-cart-card">
        <i class="fas fa-shopping-cart empty-cart-icon"></i>
        <p class="empty-cart-text">Giỏ hàng của bạn đang trống.</p>
        <router-link
          to="/accessories"
          class="go-shopping-btn text-decoration-none"
        >
          Xem phụ kiện
        </router-link>
      </div>

      <div v-else class="cart-layout">
        <div class="cart-left">
          <div class="cart-list-card">
            <div class="cart-list-head">
              <div>
                <div class="cart-list-title">Sản phẩm trong giỏ</div>
                <div class="cart-list-count">{{ cart.length }} sản phẩm trong giỏ</div>
              </div>

              <label class="select-all-wrap">
                <input
                  type="checkbox"
                  :checked="isAllSelected"
                  @change="toggleSelectAll"
                />
                <span>Chọn tất cả</span>
              </label>
            </div>

            <div class="cart-items">
              <div
                v-for="item in cart"
                :key="item.id"
                class="cart-item-card"
                :class="{ 'item-disabled': !isItemPurchasable(item) }"
              >
                <div class="select-col">
                  <input
                    type="checkbox"
                    class="item-checkbox"
                    :checked="isSelected(item.id)"
                    @change="toggleSelectItem(item.id)"
                    :disabled="!isItemPurchasable(item)"
                  />
                </div>

                <div class="cart-item-image-wrap">
                  <img
                    :src="getAccessoryImage(item)"
                    alt="accessory"
                    class="cart-item-image"
                  />

                  <span
                    v-if="item.isPromotionApplied"
                    class="cart-item-sale-badge"
                  >
                    Khuyến mãi
                  </span>
                </div>

                <div class="cart-item-body">
                  <div class="cart-item-top">
                    <div class="cart-item-main">
                      <h4 class="cart-item-name">
                        {{ item.name }}
                      </h4>

                      <div
                        v-if="item.stock !== null && item.stock !== undefined"
                        class="cart-item-stock"
                      >
                        Tồn kho: <strong>{{ item.stock }}</strong>
                      </div>

                      <div
                        v-if="item.isPromotionApplied"
                        class="cart-item-sale-note"
                      >
                        <i class="fas fa-tags mr-1"></i>
                        Giá khuyến mãi đã áp dụng
                      </div>

                      <div
                        v-if="item.status && item.status !== 'Đang bán'"
                        class="cart-item-warning"
                      >
                        Sản phẩm hiện không còn mở bán
                      </div>

                      <div
                        v-else-if="Number(item.stock || 0) <= 0"
                        class="cart-item-warning"
                      >
                        Sản phẩm hiện đã hết hàng
                      </div>
                    </div>

                    <button
                      class="remove-btn"
                      @click="removeItem(item)"
                      :disabled="updatingItemId === item.id"
                      title="Xóa khỏi giỏ hàng"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>

                  <div class="cart-item-middle">
                    <div class="price-col">
                      <div class="label-mini">Đơn giá</div>
                      <div
                        v-if="item.isPromotionApplied && item.originalPriceAtDisplay > item.price"
                        class="old-price-mini"
                      >
                        {{ formatCurrency(item.originalPriceAtDisplay) }}
                      </div>
                      <div class="current-price">
                        {{ formatCurrency(item.price) }}
                      </div>
                    </div>

                    <div class="qty-col">
                      <div class="label-mini">Số lượng</div>
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
                          :disabled="updatingItemId === item.id || !canIncrease(item)"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div class="total-col">
                      <div class="label-mini">Thành tiền</div>
                      <div class="product-total">
                        {{ formatCurrency(Number(item.price) * Number(item.quantity)) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="hasInvalidSelectedItems" class="cart-warning-box">
            <i class="fas fa-exclamation-triangle mr-2"></i>
            Có sản phẩm đã chọn không còn đủ điều kiện mua. Vui lòng cập nhật lại giỏ trước khi thanh toán.
          </div>
        </div>

        <div class="cart-right">
          <div class="checkout-card">
            <h5 class="checkout-title">Tóm tắt đơn hàng</h5>

            <div class="summary-box">
              <div class="summary-row">
                <span>Sản phẩm đã chọn</span>
                <strong>{{ selectedCartItems.length }}</strong>
              </div>

              <div class="summary-row">
                <span>Tổng số lượng mua</span>
                <strong>{{ selectedTotalCount }}</strong>
              </div>

              <div v-if="selectedPromotionItemCount > 0" class="summary-row promo-row">
                <span>Sản phẩm ưu đãi</span>
                <strong>{{ selectedPromotionItemCount }}</strong>
              </div>

              <div class="summary-divider"></div>

              <div class="summary-row total-row">
                <span>Tổng tiền mua</span>
                <strong>{{ formatCurrency(selectedTotalPrice) }}</strong>
              </div>
            </div>

            <button
              class="submit-btn"
              @click="goToCheckout"
              :disabled="selectedCartItems.length === 0 || hasInvalidSelectedItems"
            >
              <i class="fas fa-credit-card mr-1"></i>
              Thanh toán
            </button>

            <router-link
              to="/accessories"
              class="secondary-btn text-decoration-none"
            >
              Tiếp tục mua sắm
            </router-link>

            <router-link
              to="/accessory-orders"
              class="history-btn text-decoration-none"
            >
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

export default {
  name: "CartPage",

  data() {
    return {
      cart: [],
      loading: false,
      updatingItemId: null,
      baseImageUrl: "http://localhost:3000",
      summary: {
        totalQuantity: 0,
        totalAmount: 0,
      },
      selectedIds: [],
    };
  },

  computed: {
    totalCount() {
      return Number(this.summary?.totalQuantity || 0);
    },

    selectedCartItems() {
      return this.cart.filter((item) => this.selectedIds.includes(item.id));
    },

    selectedTotalCount() {
      return this.selectedCartItems.reduce(
        (sum, item) => sum + Number(item.quantity || 0),
        0
      );
    },

    selectedTotalPrice() {
      return this.selectedCartItems.reduce(
        (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
        0
      );
    },

    selectedPromotionItemCount() {
      return this.selectedCartItems.filter((item) => item.isPromotionApplied).length;
    },

    isAllSelected() {
      const validIds = this.cart
        .filter((item) => this.isItemPurchasable(item))
        .map((item) => item.id);

      return validIds.length > 0 && validIds.every((id) => this.selectedIds.includes(id));
    },

    hasInvalidSelectedItems() {
      return this.selectedCartItems.some((item) => !this.isItemPurchasable(item));
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

        const validIds = this.cart
          .filter((item) => this.isItemPurchasable(item))
          .map((item) => item.id);

        this.selectedIds = this.selectedIds.filter((id) => this.cart.some((item) => item.id === id));

        if (this.selectedIds.length === 0) {
          this.selectedIds = [...validIds];
        }
      } catch (error) {
        console.error("Lỗi tải giỏ hàng:", error);
        this.cart = [];
        this.summary = { totalQuantity: 0, totalAmount: 0 };
        this.selectedIds = [];
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

    isSelected(itemId) {
      return this.selectedIds.includes(itemId);
    },

    toggleSelectItem(itemId) {
      if (this.selectedIds.includes(itemId)) {
        this.selectedIds = this.selectedIds.filter((id) => id !== itemId);
      } else {
        this.selectedIds = [...this.selectedIds, itemId];
      }
    },

    toggleSelectAll() {
      const validIds = this.cart
        .filter((item) => this.isItemPurchasable(item))
        .map((item) => item.id);

      if (this.isAllSelected) {
        this.selectedIds = [];
      } else {
        this.selectedIds = [...validIds];
      }
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
        const response = await CartService.updateQuantity(
          item.id,
          Number(item.quantity) + 1
        );
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
        const response = await CartService.updateQuantity(
          item.id,
          Number(item.quantity) - 1
        );
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

        this.selectedIds = this.selectedIds.filter((id) => id !== item.id);

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
        this.selectedIds = [];
        await this.loadCart();
        window.dispatchEvent(new Event("cart-updated"));
      } catch (error) {
        console.error("Lỗi xóa toàn bộ giỏ hàng:", error);
        alert(error.response?.data?.message || "Không thể xóa giỏ hàng.");
      }
    },

    goToCheckout() {
      if (this.selectedCartItems.length === 0) {
        alert("Vui lòng chọn ít nhất 1 sản phẩm để thanh toán.");
        return;
      }

      if (this.hasInvalidSelectedItems) {
        alert("Có sản phẩm đã chọn không còn đủ điều kiện mua.");
        return;
      }

      sessionStorage.setItem(
        "cart_checkout_selection",
        JSON.stringify(this.selectedCartItems.map((item) => item.id))
      );

      this.$router.push({
  path: "/accessory-checkout",
});
    },

    getAccessoryImage(item) {
      if (!item?.image) {
        return "https://via.placeholder.com/500x350?text=Accessory";
      }
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
  background:
    radial-gradient(circle at top left, rgba(177, 145, 211, 0.1), transparent 28%),
    linear-gradient(180deg, #faf7fc 0%, #f4eef9 100%);
}

.cart-container {
  max-width: 1320px;
}

.cart-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  margin-bottom: 22px;
  flex-wrap: wrap;
}

.cart-title {
  margin: 0 0 4px;
  color: #2f1b44;
  font-weight: 900;
  font-size: 1.9rem;
}

.cart-title i {
  color: #6a1b9a;
}

.cart-subtitle {
  margin: 0;
  color: #7b7287;
  font-size: 0.96rem;
}

.clear-cart-btn {
  border: 1px solid #efc8df;
  background: #fff;
  color: #c2185b;
  border-radius: 12px;
  height: 42px;
  padding: 0 16px;
  font-weight: 700;
  transition: all 0.2s ease;
}

.clear-cart-btn:hover:not(:disabled) {
  background: #fff7fb;
}

.empty-cart-card {
  background: #fff;
  border: 1px solid #eee2f7;
  border-radius: 22px;
  box-shadow: 0 10px 24px rgba(106, 27, 154, 0.06);
  text-align: center;
  padding: 64px 20px;
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
  height: 44px;
  padding: 0 18px;
  border-radius: 12px;
  background: linear-gradient(135deg, #9a4ddd, #7522b2);
  color: #fff;
  font-weight: 800;
}

.cart-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(320px, 400px);
  gap: 24px;
  align-items: start;
}

.cart-left,
.cart-right {
  min-width: 0;
}

.cart-list-card,
.checkout-card {
  background: #fff;
  border: 1px solid #eee2f7;
  border-radius: 22px;
  box-shadow: 0 10px 24px rgba(106, 27, 154, 0.06);
}

.cart-list-card {
  padding: 18px;
}

.cart-list-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.cart-list-title {
  color: #2f1b44;
  font-weight: 900;
  font-size: 1.08rem;
}

.cart-list-count {
  color: #7b7287;
  font-weight: 700;
  font-size: 0.92rem;
}

.select-all-wrap {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #5c5368;
  font-weight: 700;
  font-size: 0.92rem;
  margin: 0;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cart-item-card {
  display: grid;
  grid-template-columns: 26px 128px minmax(0, 1fr);
  gap: 16px;
  border: 1px solid #eee2f7;
  border-radius: 20px;
  padding: 14px;
  background: #fff;
}

.item-disabled {
  opacity: 0.85;
}

.select-col {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 6px;
}

.item-checkbox {
  width: 18px;
  height: 18px;
  accent-color: #8e3fd1;
}

.cart-item-image-wrap {
  position: relative;
  height: 128px;
  border-radius: 16px;
  overflow: hidden;
  background: #f7f1fd;
}

.cart-item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cart-item-sale-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  display: inline-flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 999px;
  color: #fff;
  font-size: 0.72rem;
  font-weight: 800;
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.cart-item-body {
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.cart-item-top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 12px;
}

.cart-item-main {
  min-width: 0;
}

.cart-item-name {
  margin: 0 0 6px;
  color: #2f1b44;
  font-size: 1.02rem;
  font-weight: 900;
  line-height: 1.4;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.cart-item-stock {
  color: #7b7287;
  font-size: 0.88rem;
  margin-bottom: 4px;
}

.cart-item-stock strong {
  color: #2f1b44;
}

.cart-item-sale-note {
  color: #dc2626;
  font-size: 0.84rem;
  font-weight: 700;
  margin-bottom: 4px;
}

.cart-item-warning {
  color: #b42318;
  font-size: 0.84rem;
  font-weight: 700;
}

.remove-btn {
  width: 38px;
  height: 38px;
  border: 1px solid #efc8df;
  border-radius: 10px;
  background: #fff;
  color: #c2185b;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.remove-btn:hover:not(:disabled) {
  background: #fff7fb;
}

.cart-item-middle {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  align-items: end;
}

.label-mini {
  color: #8b7fa0;
  font-size: 0.82rem;
  font-weight: 700;
  margin-bottom: 6px;
}

.old-price-mini {
  color: #9b90ad;
  font-size: 0.8rem;
  text-decoration: line-through;
  margin-bottom: 2px;
}

.current-price {
  color: #b42318;
  font-weight: 900;
  font-size: 1rem;
}

.product-total {
  color: #2f1b44;
  font-weight: 900;
  font-size: 1rem;
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
  transition: all 0.2s ease;
}

.qty-btn:hover:not(:disabled) {
  background: #f7f0fd;
  color: #6a1b9a;
}

.qty-input {
  width: 56px;
  height: 34px;
  border: 1px solid #dfd3ec;
  border-radius: 8px;
  text-align: center;
  outline: none;
}

.cart-warning-box {
  background: #fff7e8;
  border: 1px solid #f3d18b;
  color: #a16207;
  border-radius: 14px;
  padding: 14px 16px;
  font-weight: 600;
  margin-top: 14px;
}

.checkout-card {
  padding: 20px;
  position: sticky;
  top: 16px;
}

.checkout-title {
  color: #2f1b44;
  font-weight: 900;
  margin-bottom: 18px;
  font-size: 1.12rem;
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

.summary-divider {
  height: 1px;
  background: #eadcf7;
  margin: 10px 0;
}

.promo-row strong {
  color: #dc2626;
}

.total-row {
  align-items: center;
}

.total-row strong {
  color: #b42318;
  font-size: 1.08rem;
}

.submit-btn,
.secondary-btn,
.history-btn {
  width: 100%;
  min-height: 46px;
  border-radius: 12px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  border: none;
  transition: all 0.2s ease;
}

.submit-btn {
  background: linear-gradient(135deg, #9a4ddd, #7522b2);
  color: #fff;
}

.submit-btn:hover:not(:disabled) {
  filter: brightness(0.98);
}

.secondary-btn {
  background: #fff;
  border: 1px solid #dfd3ec;
  color: #5c5368;
}

.secondary-btn:hover {
  background: #faf6fe;
}

.history-btn {
  background: #f3e8ff;
  color: #6a1b9a;
}

.history-btn:hover {
  background: #ead8ff;
}

@media (max-width: 1199.98px) {
  .cart-layout {
    grid-template-columns: 1fr;
  }

  .checkout-card {
    position: static;
  }
}

@media (max-width: 767.98px) {
  .cart-title {
    font-size: 1.55rem;
  }

  .cart-item-card {
    grid-template-columns: 1fr;
  }

  .select-col {
    justify-content: flex-start;
    padding-top: 0;
  }

  .cart-item-image-wrap {
    height: 220px;
  }

  .cart-item-middle {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>