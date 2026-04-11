<template>
  <div class="accessory-detail-page">
    <div class="container accessory-detail-container py-4">
      <div class="breadcrumb-row">
        <router-link to="/" class="crumb-link">Trang chủ</router-link>
        <span class="crumb-sep">/</span>
        <router-link to="/accessories" class="crumb-link">Phụ kiện</router-link>
        <span class="crumb-sep">/</span>
        <span class="crumb-current">{{ accessory?.name || "Chi tiết phụ kiện" }}</span>
      </div>

      <div class="back-row">
        <button class="back-btn" @click="$router.back()">
          <i class="fas fa-arrow-left mr-1"></i> Quay lại
        </button>
      </div>

      <div v-if="loading" class="state-card">
        <i class="fas fa-spinner fa-spin state-icon"></i>
        <p class="mb-0">Đang tải chi tiết phụ kiện...</p>
      </div>

      <div v-else-if="errorMessage" class="state-card error-state">
        <i class="fas fa-exclamation-triangle state-icon"></i>
        <p class="mb-0">{{ errorMessage }}</p>
      </div>

      <div v-else-if="!accessory" class="state-card">
        <i class="fas fa-box-open state-icon"></i>
        <p class="mb-0">Không tìm thấy phụ kiện này.</p>
      </div>

      <div v-else class="detail-card">
        <div class="detail-grid">
          <div class="gallery-panel">
            <div class="main-image-box">
              <img :src="currentImage" alt="accessory" class="main-image" />
            </div>
          </div>

          <div class="info-panel">
            <h1 class="accessory-title">
              {{ accessory.name || "---" }}
            </h1>

            <div class="price-box">
              <div class="price-label">Giá bán</div>
              <div class="accessory-price">
                {{ formatCurrency(accessory.price) }}
              </div>
            </div>

            <div class="stock-row">
              <span class="status-pill" :class="getStatusClass(accessory.status)">
                {{ accessory.status || "Đang cập nhật" }}
              </span>

              <span class="stock-text">
                Tồn kho: <strong>{{ safeStock }}</strong>
              </span>
            </div>

            <div class="purchase-box">
              <div class="purchase-title">Số lượng mua</div>

              <div class="qty-control">
                <button
                  class="qty-btn"
                  @click="decreaseQty"
                  :disabled="quantity <= 1 || !canBuy"
                >
                  -
                </button>

                <input
                  type="number"
                  min="1"
                  :max="safeStock"
                  class="qty-input"
                  v-model.number="quantity"
                  @input="normalizeQuantityInput"
                  :disabled="!canBuy"
                />

                <button
                  class="qty-btn"
                  @click="increaseQty"
                  :disabled="!canBuy || quantity >= safeStock"
                >
                  +
                </button>
              </div>

              <div class="stock-warning" v-if="canBuy">
                Bạn có thể mua tối đa {{ safeStock }} sản phẩm.
              </div>

              <div class="action-row">
                <button
                  class="cart-btn"
                  @click="addToCart"
                  :disabled="!canBuy || isSubmitting"
                >
                  <i class="fas fa-shopping-cart mr-1"></i>
                  {{ isSubmitting ? "Đang xử lý..." : "Thêm vào giỏ hàng" }}
                </button>

                <button
                  class="buy-btn"
                  @click="buyNow"
                  :disabled="!canBuy || isSubmitting"
                >
                  <i class="fas fa-bolt mr-1"></i> Mua ngay
                </button>
              </div>
            </div>

            <div class="short-note">
              {{
                canBuy
                  ? "Sản phẩm hiện đang có sẵn."
                  : "Sản phẩm hiện không khả dụng."
              }}
            </div>
          </div>
        </div>

        <div class="description-section">
          <h3 class="description-title">
            <i class="fas fa-file-alt mr-2"></i>Mô tả sản phẩm
          </h3>
          <p class="description-text">
            {{ accessory.description || "Chưa có mô tả cho phụ kiện này." }}
          </p>
        </div>
      </div>

      <div v-if="relatedAccessories.length > 0" class="related-section">
        <div class="related-head">
          <h3 class="related-title">Phụ kiện liên quan</h3>
        </div>

        <div class="related-grid">
          <div
            class="related-item"
            v-for="item in relatedAccessories"
            :key="item._id || item.id"
            @click="goToDetail(item)"
          >
            <div class="related-image-wrap">
              <img
                :src="getAccessoryImage(item)"
                alt="related"
                class="related-image"
              />
            </div>
            <div class="related-name">{{ item.name }}</div>
            <div class="related-price">{{ formatCurrency(item.price) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AccessoryService from "@/services/accessory.service";
import CartService from "@/services/cart.service";

export default {
  name: "AccessoryDetail",

  data() {
    return {
      accessory: null,
      relatedAccessories: [],
      loading: false,
      isSubmitting: false,
      quantity: 1,
      errorMessage: "",
      currentImage: "",
      baseImageUrl: "http://localhost:3000",
    };
  },

  computed: {
    safeStock() {
      return Number(this.accessory?.quantity || 0);
    },

    canBuy() {
      return (
        this.accessory &&
        this.accessory.status === "Đang bán" &&
        this.safeStock > 0
      );
    },
  },

  methods: {
    async fetchAccessory() {
      try {
        this.loading = true;
        this.errorMessage = "";

        const id = this.$route.params.id;
        if (!id) {
          this.errorMessage = "Thiếu mã phụ kiện.";
          return;
        }

        this.accessory = await AccessoryService.get(id);
        this.currentImage = this.getAccessoryImage(this.accessory);
        this.quantity = this.canBuy ? 1 : 0;

        await this.fetchRelatedAccessories();
      } catch (error) {
        console.error("Lỗi tải chi tiết phụ kiện:", error);
        this.errorMessage =
          error.response?.data?.message || "Không thể tải chi tiết phụ kiện.";
        this.accessory = null;
      } finally {
        this.loading = false;
      }
    },

    async fetchRelatedAccessories() {
      try {
        const list = await AccessoryService.getPublic();
        const currentId = this.accessory?._id || this.accessory?.id;
        const currentCategoryId =
          this.accessory?.categoryId?._id ||
          this.accessory?.categoryId?.id ||
          this.accessory?.categoryId ||
          "";

        this.relatedAccessories = (list || [])
          .filter((item) => {
            const itemId = item._id || item.id;
            const itemCategoryId =
              item.categoryId?._id || item.categoryId?.id || item.categoryId || "";

            return (
              String(itemId) !== String(currentId) &&
              item.status === "Đang bán" &&
              Number(item.quantity || 0) > 0 &&
              (!currentCategoryId ||
                String(itemCategoryId) === String(currentCategoryId))
            );
          })
          .slice(0, 5);
      } catch (error) {
        console.error("Lỗi tải phụ kiện liên quan:", error);
        this.relatedAccessories = [];
      }
    },

    normalizeQuantityInput() {
      let qty = Number(this.quantity);

      if (!Number.isFinite(qty) || qty < 1) {
        qty = 1;
      }

      qty = Math.floor(qty);

      if (this.canBuy && qty > this.safeStock) {
        qty = this.safeStock;
      }

      this.quantity = qty;
    },

    async addToCart(redirectToCart = false) {
      if (!this.accessory) return;

      const user = JSON.parse(localStorage.getItem("user") || "null");
      if (!user) {
        alert("Vui lòng đăng nhập để thêm phụ kiện vào giỏ hàng.");
        this.$router.push("/login");
        return;
      }

      if (this.accessory.status !== "Đang bán") {
        alert("Phụ kiện này hiện không còn bán.");
        return;
      }

      if (this.safeStock <= 0) {
        alert("Phụ kiện này đang hết hàng.");
        return;
      }

      this.normalizeQuantityInput();

      if (!this.quantity || this.quantity < 1) {
        alert("Số lượng không hợp lệ.");
        return;
      }

      if (this.quantity > this.safeStock) {
        alert(`Số lượng vượt quá tồn kho. Chỉ còn ${this.safeStock} sản phẩm.`);
        this.quantity = this.safeStock;
        return;
      }

      this.isSubmitting = true;

      try {
        const cartResponse = await CartService.getCart();
        const cartItems = cartResponse?.items || [];

        const currentCartItem = cartItems.find((item) => {
          const itemAccessoryId =
            item.accessoryId?._id || item.accessoryId?.id || item.accessoryId;
          const currentAccessoryId = this.accessory.id || this.accessory._id;
          return String(itemAccessoryId) === String(currentAccessoryId);
        });

        const existingQty = Number(currentCartItem?.quantity || 0);
        const nextQty = existingQty + Number(this.quantity);

        if (nextQty > this.safeStock) {
          alert(
            `Bạn đã có ${existingQty} sản phẩm trong giỏ. Chỉ còn ${this.safeStock} sản phẩm trong kho.`
          );
          return;
        }

        await CartService.addToCart(
          this.accessory.id || this.accessory._id,
          Number(this.quantity)
        );

        window.dispatchEvent(new Event("cart-updated"));

        if (redirectToCart) {
          this.$router.push("/cart");
          return;
        }

        alert("Đã thêm phụ kiện vào giỏ hàng!");
      } catch (error) {
        alert(error.response?.data?.message || "Không thể thêm vào giỏ hàng.");
      } finally {
        this.isSubmitting = false;
      }
    },

    async buyNow() {
      await this.addToCart(true);
    },

    increaseQty() {
      if (!this.canBuy) return;
      const current = Number(this.quantity || 1);
      this.quantity = current >= this.safeStock ? this.safeStock : current + 1;
    },

    decreaseQty() {
      const current = Number(this.quantity || 1);
      this.quantity = current > 1 ? current - 1 : 1;
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
      return Number(value).toLocaleString("vi-VN") + "đ";
    },

    getStatusClass(status) {
      if (status === "Đang bán") return "status-selling";
      if (status === "Ngừng bán") return "status-stop";
      return "status-default";
    },

    goToDetail(item) {
      const id = item._id || item.id;
      if (!id) return;
      this.$router.push(`/accessories/${id}`);
    },
  },

  watch: {
    "$route.params.id"() {
      this.quantity = 1;
      this.fetchAccessory();
    },
  },

  mounted() {
    this.fetchAccessory();
  },
};
</script>

<style scoped>
.accessory-detail-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #faf7fc 0%, #f4eef9 100%);
}

.accessory-detail-container {
  max-width: 1320px;
}

.breadcrumb-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
  color: #8b7fa0;
  font-size: 0.92rem;
}

.crumb-link {
  color: #6a1b9a;
  font-weight: 700;
  text-decoration: none;
}

.crumb-sep {
  color: #b0a3c0;
}

.crumb-current {
  color: #7b7287;
  font-weight: 600;
}

.back-row {
  margin-bottom: 18px;
}

.back-btn {
  border: 1px solid #dfd3ec;
  background: #fff;
  color: #5c5368;
  border-radius: 12px;
  height: 40px;
  padding: 0 16px;
  font-weight: 700;
}

.detail-card,
.state-card,
.related-section {
  background: #fff;
  border: 1px solid #eee2f7;
  border-radius: 22px;
  box-shadow: 0 10px 24px rgba(106, 27, 154, 0.06);
}

.state-card {
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: #7a708a;
  text-align: center;
}

.state-icon {
  font-size: 2.5rem;
  margin-bottom: 14px;
  color: #cfbfdc;
}

.error-state {
  color: #b42318;
}

.detail-grid {
  display: grid;
  grid-template-columns: 480px minmax(0, 1fr);
  gap: 28px;
  padding: 24px;
}

.gallery-panel {
  min-width: 0;
}

.main-image-box {
  border: 1px solid #e7dff1;
  background: #fff;
  border-radius: 18px;
  padding: 16px;
  height: 560px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.main-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.info-panel {
  min-width: 0;
}

.accessory-title {
  color: #2f1b44;
  font-size: 2rem;
  line-height: 1.3;
  font-weight: 900;
  margin-bottom: 16px;
}

.price-box {
  border: 1px solid #f0d8ea;
  background: #fffafc;
  border-radius: 20px;
  padding: 18px 22px;
  margin-bottom: 16px;
}

.price-label {
  color: #6b7280;
  font-size: 0.9rem;
  font-weight: 700;
  margin-bottom: 4px;
  text-transform: uppercase;
}

.accessory-price {
  color: #b42318;
  font-size: 1.8rem;
  font-weight: 900;
  line-height: 1.2;
}

.stock-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 18px;
}

.status-pill,
.stock-text {
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 0.88rem;
  font-weight: 800;
}

.status-selling {
  background: #e7f8ee;
  color: #15803d;
}

.status-stop {
  background: #f3f4f6;
  color: #4b5563;
}

.status-default {
  background: #f8f3fc;
  color: #6b5d7d;
}

.stock-text {
  background: #f8f3fc;
  color: #5b4b72;
  border: 1px solid #ece3f4;
}

.purchase-box {
  border: 1px solid #d9d8f0;
  border-radius: 22px;
  padding: 20px 22px;
  margin-bottom: 18px;
  background: linear-gradient(180deg, #ffffff 0%, #fbf8fe 100%);
}

.purchase-title {
  color: #5c5368;
  font-size: 0.92rem;
  font-weight: 800;
  text-transform: uppercase;
  margin-bottom: 12px;
}

.qty-control {
  display: inline-flex;
  align-items: center;
  overflow: hidden;
  border: 2px solid #8e3fd1;
  border-radius: 14px;
  margin-bottom: 10px;
}

.qty-btn {
  width: 46px;
  height: 46px;
  border: none;
  background: #fff;
  color: #8e3fd1;
  font-size: 1.2rem;
  font-weight: 800;
}

.qty-input {
  width: 68px;
  height: 46px;
  border: none;
  border-left: 1px solid #eadcf7;
  border-right: 1px solid #eadcf7;
  text-align: center;
  outline: none;
  font-weight: 800;
  color: #2f1b44;
}

.stock-warning {
  color: #746a80;
  font-size: 0.9rem;
  margin-bottom: 18px;
}

.action-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.cart-btn,
.buy-btn {
  height: 52px;
  border-radius: 14px;
  font-weight: 800;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.cart-btn {
  border: 2px solid #8e3fd1;
  background: #fff;
  color: #8e3fd1;
}

.cart-btn:hover:not(:disabled) {
  background: #f8f2fe;
}

.buy-btn {
  border: none;
  background: linear-gradient(135deg, #8e3fd1, #6a1b9a);
  color: #fff;
  box-shadow: 0 12px 22px rgba(106, 27, 154, 0.18);
}

.buy-btn:hover:not(:disabled) {
  filter: brightness(0.98);
}

.cart-btn:disabled,
.buy-btn:disabled,
.qty-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.short-note {
  color: #746a80;
  font-size: 0.92rem;
}

.description-section {
  border-top: 1px solid #f0e9f6;
  padding: 24px;
  margin-top: 4px;
}

.description-title {
  color: #2f1b44;
  font-size: 1.25rem;
  font-weight: 900;
  margin-bottom: 12px;
}

.description-text {
  color: #746a80;
  line-height: 1.8;
  margin: 0;
}

.related-section {
  margin-top: 24px;
  padding: 22px;
}

.related-head {
  margin-bottom: 18px;
}

.related-title {
  margin: 0;
  color: #2f1b44;
  font-size: 1.2rem;
  font-weight: 900;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 18px;
}

.related-item {
  border: 1px solid #eee2f7;
  border-radius: 16px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.related-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 20px rgba(106, 27, 154, 0.08);
}

.related-image-wrap {
  height: 150px;
  background: #f7f1fd;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 10px;
}

.related-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.related-name {
  color: #2f1b44;
  font-size: 0.9rem;
  font-weight: 800;
  line-height: 1.45;
  min-height: 40px;
  margin-bottom: 6px;
}

.related-price {
  color: #b42318;
  font-weight: 800;
  font-size: 0.92rem;
}

@media (max-width: 1199.98px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .related-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 991.98px) {
  .accessory-title {
    font-size: 1.7rem;
  }

  .main-image-box {
    height: 460px;
  }

  .related-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 767.98px) {
  .detail-grid,
  .description-section {
    padding: 16px;
  }

  .main-image-box {
    height: 360px;
    padding: 12px;
  }

  .action-row {
    grid-template-columns: 1fr;
  }

  .related-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 575.98px) {
  .related-grid {
    grid-template-columns: 1fr;
  }

  .accessory-title {
    font-size: 1.45rem;
  }

  .accessory-price {
    font-size: 1.4rem;
  }
}
</style>