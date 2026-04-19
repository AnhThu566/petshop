<template>
  <div class="checkout-page">
    <div class="container checkout-container py-4">
      <div class="checkout-head">
        <div>
          <h2 class="checkout-page-title">
            <i class="fas fa-credit-card mr-2"></i>
            Thanh toán phụ kiện
          </h2>
          <p class="checkout-page-subtitle">
            Kiểm tra lại sản phẩm và hoàn tất thông tin nhận hàng
          </p>
        </div>

        <router-link
          :to="isBuyNowMode ? '/accessories' : '/cart'"
          class="back-shopping-btn text-decoration-none"
        >
          <i class="fas fa-arrow-left mr-1"></i>
          {{ isBuyNowMode ? "Quay lại mua sắm" : "Quay lại giỏ hàng" }}
        </router-link>
      </div>

      <div v-if="loading" class="empty-checkout-card">
        <i class="fas fa-spinner fa-spin empty-checkout-icon"></i>
        <p class="empty-checkout-text">Đang tải dữ liệu thanh toán...</p>
      </div>

      <div v-else-if="checkoutItems.length === 0" class="empty-checkout-card">
        <i class="fas fa-box-open empty-checkout-icon"></i>
        <p class="empty-checkout-text">Không có sản phẩm nào để thanh toán.</p>
        <router-link
          to="/accessories"
          class="go-shopping-btn text-decoration-none"
        >
          Xem phụ kiện
        </router-link>
      </div>

      <div v-else class="checkout-layout">
        <div class="checkout-left">
          <div class="address-card">
            <div class="section-head">
              <h5 class="section-title">
                <i class="fas fa-map-marker-alt mr-2"></i>
                Địa chỉ giao hàng
              </h5>

              <button
                type="button"
                class="change-address-btn"
                @click="isEditingAddress = !isEditingAddress"
              >
                <i class="fas fa-pen mr-1"></i>
                {{ isEditingAddress ? "Đóng" : "Thay đổi" }}
              </button>
            </div>

            <div class="address-display-box">
              <div class="address-name-line">
                <strong>{{ form.customerName || "Chưa có tên người nhận" }}</strong>
                <span class="address-phone">{{ form.customerPhone || "---" }}</span>
              </div>

              <div class="address-text">
                {{ form.shippingAddress || "Chưa có địa chỉ nhận hàng." }}
              </div>
            </div>

            <div v-if="isEditingAddress" class="address-form-box">
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

              <div class="form-group mb-0">
                <label>Địa chỉ nhận hàng <span class="text-danger">*</span></label>
                <textarea
                  class="form-control custom-input"
                  rows="3"
                  v-model.trim="form.shippingAddress"
                ></textarea>
              </div>
            </div>
          </div>

          <div class="products-card">
            <div class="section-head">
              <h5 class="section-title">
                <i class="fas fa-shopping-bag mr-2"></i>
                Sản phẩm đã chọn ({{ checkoutItems.length }})
              </h5>
            </div>

            <div class="checkout-items">
              <div
                v-for="item in checkoutItems"
                :key="item.id"
                class="checkout-item-card"
              >
                <div class="checkout-item-image-wrap">
                  <img
                    :src="getAccessoryImage(item)"
                    alt="accessory"
                    class="checkout-item-image"
                  />
                </div>

                <div class="checkout-item-body">
                  <div class="checkout-item-top">
                    <div class="checkout-item-main">
                      <div class="checkout-item-name">
                        {{ item.name }}
                      </div>

                      <div class="checkout-item-unit-price">
                        {{ formatCurrency(item.price) }}
                      </div>
                    </div>

                    <div class="checkout-item-total">
                      {{ formatCurrency(itemTotal(item)) }}
                    </div>
                  </div>

                  <div class="checkout-item-bottom">
                    <div class="checkout-qty-box">
                      <span class="checkout-qty-title">Số lượng</span>

                      <div class="checkout-qty-actions">
                        <button
                          type="button"
                          class="checkout-qty-btn"
                          @click="decreaseQty(item)"
                          :disabled="Number(item.quantity) <= 1"
                        >
                          -
                        </button>

                        <span class="checkout-qty-value">{{ item.quantity }}</span>

                        <button
                          type="button"
                          class="checkout-qty-btn"
                          @click="increaseQty(item)"
                          :disabled="Number(item.quantity) >= Number(item.stock || 0)"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <div
                    v-if="item.status !== 'Đang bán' || Number(item.stock || 0) <= 0"
                    class="checkout-item-warning"
                  >
                    Sản phẩm hiện không còn đủ điều kiện thanh toán
                  </div>
                </div>
              </div>
            </div>

            <div v-if="hasInvalidItems" class="checkout-warning-box">
              <i class="fas fa-exclamation-triangle mr-2"></i>
              Có sản phẩm không còn đủ điều kiện mua. Vui lòng kiểm tra lại trước khi đặt hàng.
            </div>
          </div>
        </div>

        <div class="checkout-right">
          <div class="payment-card">
            <div class="payment-section">
              <h5 class="payment-title">
                <i class="fas fa-wallet mr-2"></i>
                Phương thức thanh toán
              </h5>

              <label class="payment-method-item">
                <input type="radio" value="COD" v-model="paymentMethod" />
                <span class="payment-label">
                  <i class="fas fa-money-bill-wave text-success mr-2"></i>
                  Thanh toán khi nhận hàng (COD)
                </span>
              </label>

              <label class="payment-method-item">
                <input type="radio" value="ZALOPAY" v-model="paymentMethod" />
                <span class="payment-label">
                  <i class="fas fa-wallet text-primary mr-2"></i>
                  ZaloPay
                </span>
              </label>
            </div>

            <div class="note-group">
              <label>Ghi chú</label>
              <textarea
                class="form-control custom-input"
                rows="3"
                v-model.trim="form.note"
              ></textarea>
            </div>

            <div class="order-summary-card">
              <h5 class="summary-title">Tổng đơn hàng</h5>

              <div class="summary-row">
                <span>Tạm tính:</span>
                <strong>{{ formatCurrency(subtotal) }}</strong>
              </div>

              <div class="summary-row">
                <span>Phí vận chuyển:</span>
                <strong>{{ formatCurrency(shippingFee) }}</strong>
              </div>

              <div class="summary-divider"></div>

              <div class="summary-row total-row">
                <span>Tổng cộng:</span>
                <strong>{{ formatCurrency(grandTotal) }}</strong>
              </div>
            </div>

            <button
              class="submit-btn"
              @click="submitOrder"
              :disabled="isSubmitting || checkoutItems.length === 0 || hasInvalidItems"
            >
              <i class="fas fa-check-circle mr-1"></i>
              {{ isSubmitting ? "Đang xử lý..." : "Đặt hàng" }}
            </button>

            <router-link
              :to="isBuyNowMode ? '/accessories' : '/cart'"
              class="back-cart-link text-decoration-none"
            >
              <i class="fas fa-arrow-left mr-1"></i>
              {{ isBuyNowMode ? "Quay lại mua sắm" : "Quay lại giỏ hàng" }}
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
  name: "AccessoryCheckout",

  data() {
    return {
      checkoutItems: [],
      loading: false,
      isSubmitting: false,
      isBuyNowMode: false,
      isEditingAddress: false,
      paymentMethod: "COD",
      shippingFee: 30000,
      baseImageUrl: "http://localhost:3000",
      form: {
        customerName: "",
        customerPhone: "",
        shippingAddress: "",
        note: "",
      },
    };
  },

  computed: {
    subtotal() {
      return this.checkoutItems.reduce(
        (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
        0
      );
    },

    totalCount() {
      return this.checkoutItems.reduce(
        (sum, item) => sum + Number(item.quantity || 0),
        0
      );
    },

    grandTotal() {
      return Number(this.subtotal) + Number(this.shippingFee || 0);
    },

    hasInvalidItems() {
      return this.checkoutItems.some((item) => !this.isItemPurchasable(item));
    },
  },

  methods: {
    async loadCheckoutData() {
      try {
        this.loading = true;
        this.isBuyNowMode = this.$route.query.mode === "buy-now";

        const user = JSON.parse(localStorage.getItem("user") || "null");
        if (user) {
          this.form.customerName = user.fullName || "";
          this.form.customerPhone = user.phone || "";
          this.form.shippingAddress = user.address || "";
        }

        if (this.isBuyNowMode) {
          const raw = sessionStorage.getItem("buy_now_checkout");
          const items = raw ? JSON.parse(raw) : [];
          this.checkoutItems = Array.isArray(items) ? items : [];
          return;
        }

        const raw = sessionStorage.getItem("cart_checkout_selection");
        const selectedIds = raw ? JSON.parse(raw) : [];

        if (!Array.isArray(selectedIds) || selectedIds.length === 0) {
          this.checkoutItems = [];
          return;
        }

        const response = await CartService.getCart();
        const items = response?.items || [];

        this.checkoutItems = items
          .map((item) => {
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
          })
          .filter((item) => selectedIds.includes(item.id));
      } catch (error) {
        console.error("Lỗi tải dữ liệu thanh toán:", error);
        this.checkoutItems = [];
      } finally {
        this.loading = false;
      }
    },

    itemTotal(item) {
      return Number(item.price || 0) * Number(item.quantity || 0);
    },

    increaseQty(item) {
      const stock = Number(item.stock || 0);
      const current = Number(item.quantity || 1);
      if (current >= stock) return;
      item.quantity = current + 1;
    },

    decreaseQty(item) {
      const current = Number(item.quantity || 1);
      if (current <= 1) return;
      item.quantity = current - 1;
    },

    isItemPurchasable(item) {
      return (
        !!item.accessoryId &&
        item.status === "Đang bán" &&
        Number(item.stock || 0) > 0 &&
        Number(item.quantity || 0) <= Number(item.stock || 0)
      );
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

if (this.checkoutItems.length === 0) {
  throw new Error("Không có sản phẩm để thanh toán.");
}

if (!["COD", "ZALOPAY"].includes(this.paymentMethod)) {
  throw new Error("Phương thức thanh toán không hợp lệ.");
}

if (!Number.isFinite(Number(this.shippingFee)) || Number(this.shippingFee) < 0) {
  throw new Error("Phí vận chuyển không hợp lệ.");
}

      for (const item of this.checkoutItems) {
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

      if (this.paymentMethod === "ZALOPAY") {
        alert("Hiện tại bạn có thể làm giao diện chọn ZaloPay trước. Khi backend ZaloPay xong mới nối thanh toán thật.");
        return;
      }

      this.isSubmitting = true;

      try {
        await AccessoryOrderService.create({
          customerName: this.form.customerName,
          customerPhone: this.form.customerPhone,
          shippingAddress: this.form.shippingAddress,
          note: this.form.note,
          paymentMethod: this.paymentMethod,
          shippingFee: Number(this.shippingFee || 0),
          items: this.checkoutItems.map((item) => ({
            accessoryId: item.accessoryId,
            quantity: item.quantity,
          })),
        });

        alert("Đặt đơn phụ kiện thành công!");

        if (this.isBuyNowMode) {
          sessionStorage.removeItem("buy_now_checkout");
        } else {
          for (const item of this.checkoutItems) {
            await CartService.removeItem(item.id);
          }
          sessionStorage.removeItem("cart_checkout_selection");
          window.dispatchEvent(new Event("cart-updated"));
        }

        this.$router.push("/accessory-orders");
      } catch (error) {
        console.error("Lỗi đặt đơn phụ kiện:", error);
        alert("Lỗi đặt đơn: " + (error.response?.data?.message || error.message));
      } finally {
        this.isSubmitting = false;
      }
    },

    getAccessoryImage(item) {
      if (!item?.image) {
        return "https://via.placeholder.com/500x350?text=Accessory";
      }
      if (String(item.image).startsWith("http://") || String(item.image).startsWith("https://")) {
        return item.image;
      }
      return this.baseImageUrl + item.image;
    },

    formatCurrency(value) {
      if (value === null || value === undefined) return "---";
      return Number(value).toLocaleString("vi-VN") + " đ";
    },
  },

  mounted() {
    this.loadCheckoutData();
  },
};
</script>

<style scoped>
.checkout-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(177, 145, 211, 0.1), transparent 28%),
    linear-gradient(180deg, #faf7fc 0%, #f4eef9 100%);
}

.checkout-container {
  max-width: 1320px;
}

.checkout-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  margin-bottom: 22px;
  flex-wrap: wrap;
}

.checkout-page-title {
  margin: 0 0 4px;
  color: #2f1b44;
  font-weight: 900;
  font-size: 1.9rem;
}

.checkout-page-title i {
  color: #6a1b9a;
}

.checkout-page-subtitle {
  margin: 0;
  color: #7b7287;
  font-size: 0.96rem;
}

.back-shopping-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  padding: 0 18px;
  border-radius: 14px;
  background: #fff;
  border: 1px solid #dfd3ec;
  color: #5c5368;
  font-weight: 700;
}

.empty-checkout-card {
  background: #fff;
  border: 1px solid #eee2f7;
  border-radius: 22px;
  box-shadow: 0 10px 24px rgba(106, 27, 154, 0.06);
  text-align: center;
  padding: 64px 20px;
}

.empty-checkout-icon {
  font-size: 3rem;
  color: #cdbfe0;
  margin-bottom: 14px;
}

.empty-checkout-text {
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

.checkout-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.65fr) minmax(320px, 420px);
  gap: 24px;
  align-items: start;
}

.address-card,
.products-card,
.payment-card {
  background: #fff;
  border: 1px solid #eee2f7;
  border-radius: 22px;
  box-shadow: 0 10px 24px rgba(106, 27, 154, 0.06);
}

.address-card,
.products-card {
  padding: 18px;
  margin-bottom: 20px;
}

.payment-card {
  padding: 18px;
  position: sticky;
  top: 16px;
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.section-title {
  color: #2f1b44;
  font-weight: 900;
  margin: 0;
  font-size: 1.12rem;
}

.change-address-btn {
  border: 1px solid #dfd3ec;
  background: #fff;
  color: #5c5368;
  border-radius: 12px;
  min-height: 40px;
  padding: 0 14px;
  font-weight: 700;
}

.address-display-box {
  border: 1px solid #dfd3ec;
  border-radius: 16px;
  padding: 16px;
  background: #fcfbfe;
}

.address-name-line {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  color: #2f1b44;
  margin-bottom: 8px;
  font-size: 1.02rem;
}

.address-phone {
  color: #6b7280;
  font-weight: 500;
}

.address-text {
  color: #5c5368;
  line-height: 1.7;
}

.address-form-box {
  margin-top: 14px;
  border-top: 1px dashed #eadcf7;
  padding-top: 14px;
}

.form-group {
  margin-bottom: 14px;
}

.form-group label,
.note-group label {
  color: #4b5563;
  font-weight: 700;
  margin-bottom: 6px;
  display: block;
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

.checkout-items {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.checkout-item-card {
  display: grid;
  grid-template-columns: 132px minmax(0, 1fr);
  gap: 16px;
  border: 1px solid #eadcf7;
  border-radius: 18px;
  padding: 14px;
  background: #fff;
}

.checkout-item-image-wrap {
  height: 132px;
  border-radius: 16px;
  overflow: hidden;
  background: #f7f1fd;
}

.checkout-item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.checkout-item-body {
  min-width: 0;
}

.checkout-item-top {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

.checkout-item-main {
  min-width: 0;
}

.checkout-item-name {
  color: #2f1b44;
  font-size: 1.08rem;
  font-weight: 800;
  line-height: 1.45;
  margin-bottom: 8px;
  word-break: break-word;
}

.checkout-item-unit-price {
  color: #b42318;
  font-size: 0.98rem;
  font-weight: 700;
}

.checkout-item-total {
  color: #0f2e6b;
  font-size: 1.05rem;
  font-weight: 900;
  white-space: nowrap;
}

.checkout-item-bottom {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.checkout-qty-box {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 999px;
  background: #faf6ff;
  border: 1px solid #eadcf6;
}

.checkout-qty-title {
  color: #5c5368;
  font-size: 0.88rem;
  font-weight: 700;
}

.checkout-qty-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkout-qty-btn {
  width: 28px;
  height: 28px;
  border: 1px solid #dfd3ec;
  border-radius: 8px;
  background: #fff;
  color: #6a1b9a;
  font-weight: 800;
  transition: all 0.2s ease;
}

.checkout-qty-btn:hover:not(:disabled) {
  background: #f7f0fd;
}

.checkout-qty-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.checkout-qty-value {
  min-width: 20px;
  text-align: center;
  color: #2f1b44;
  font-weight: 800;
}

.checkout-item-warning {
  color: #b42318;
  font-size: 0.84rem;
  font-weight: 700;
  margin-top: 10px;
}

.checkout-warning-box {
  background: #fff7e8;
  border: 1px solid #f3d18b;
  color: #a16207;
  border-radius: 14px;
  padding: 14px 16px;
  font-weight: 600;
  margin-top: 14px;
}

.payment-title,
.summary-title {
  color: #2f1b44;
  font-weight: 900;
  margin-bottom: 14px;
  font-size: 1.08rem;
}

.payment-section {
  margin-bottom: 18px;
}

.payment-method-item {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid #e7dbf3;
  border-radius: 14px;
  padding: 12px 14px;
  margin-bottom: 10px;
  cursor: pointer;
  background: #fff;
}

.payment-method-item input {
  accent-color: #6a1b9a;
  width: 18px;
  height: 18px;
}

.payment-label {
  color: #2f1b44;
  font-weight: 700;
}

.note-group {
  margin-bottom: 18px;
}

.order-summary-card {
  border-top: 1px solid #eee2f7;
  padding-top: 18px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: #5c5368;
  margin-bottom: 10px;
}

.summary-divider {
  height: 1px;
  background: #eadcf7;
  margin: 10px 0 14px;
}

.total-row strong {
  color: #b42318;
  font-size: 1.3rem;
  font-weight: 900;
}

.submit-btn,
.back-cart-link {
  width: 100%;
  min-height: 48px;
  border-radius: 14px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.submit-btn {
  border: none;
  background: linear-gradient(135deg, #1d4ed8, #0f3f9f);
  color: #fff;
  margin-top: 18px;
  margin-bottom: 12px;
}

.back-cart-link {
  color: #5c5368;
  background: transparent;
}

@media (max-width: 1199.98px) {
  .checkout-layout {
    grid-template-columns: 1fr;
  }

  .payment-card {
    position: static;
  }
}

@media (max-width: 767.98px) {
  .checkout-page-title {
    font-size: 1.55rem;
  }

  .checkout-item-card {
    grid-template-columns: 1fr;
  }

  .checkout-item-image-wrap {
    height: 220px;
  }

  .checkout-item-top {
    flex-direction: column;
  }
}
</style>