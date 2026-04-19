<template>
  <div class="accessory-detail-page">
    <div class="container accessory-detail-container py-4">
      <div class="breadcrumb-row">
        <router-link to="/" class="crumb-link">Trang chủ</router-link>
        <span class="crumb-sep">/</span>
        <router-link to="/accessories" class="crumb-link">Phụ kiện</router-link>
        <span class="crumb-sep">/</span>
        <span class="crumb-current">{{ accessory?.name || "Chi tiết sản phẩm" }}</span>
      </div>

      <div class="back-row">
        <button class="back-btn" @click="$router.back()">
          <i class="fas fa-arrow-left mr-1"></i> Quay lại
        </button>
      </div>

      <div v-if="loading" class="state-card">
        <i class="fas fa-spinner fa-spin state-icon"></i>
        <p class="mb-0">Đang tải chi tiết sản phẩm...</p>
      </div>

      <div v-else-if="errorMessage" class="state-card error-state">
        <i class="fas fa-exclamation-triangle state-icon"></i>
        <p class="mb-0">{{ errorMessage }}</p>
      </div>

      <div v-else-if="!accessory" class="state-card">
        <i class="fas fa-box-open state-icon"></i>
        <p class="mb-0">Không tìm thấy sản phẩm này.</p>
      </div>

      <div v-else class="detail-card">
        <div class="detail-inner">
          <div class="detail-grid">
            <div class="gallery-panel">
              <div class="main-image-wrap">
                <img :src="currentImage" alt="accessory" class="main-image" />

                <span
                  v-if="accessory.hasPromotion"
                  class="discount-badge-detail"
                >
                  {{ accessory.discountLabel }}
                </span>
              </div>
            </div>

            <div class="info-panel">
              <h2 class="accessory-title">
                {{ accessory.name || "---" }}
              </h2>

              <div class="price-wrap">
                <div v-if="accessory.hasPromotion" class="old-price-detail">
                  {{ formatCurrency(accessory.originalPrice) }}
                </div>

                <div class="accessory-price">
                  {{ formatCurrency(accessory.finalPrice || accessory.price) }}
                </div>
              </div>

              <div class="description-box">
                <p class="description-text">
                  {{ accessory.description || "Chưa có mô tả cho sản phẩm này." }}
                </p>
              </div>

              <div class="purchase-box">
                <div class="purchase-row">
                  <div class="qty-inline">
                    <label class="purchase-label">Số lượng:</label>

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
                  </div>

                  <div class="stock-line">
                    Tồn kho: <strong>{{ safeStock }}</strong>
                  </div>
                </div>

                <div class="action-row">
                  <button
                    class="cart-btn"
                    @click="addToCart"
                    :disabled="!canBuy || isSubmitting"
                  >
                    <i
                      class="fas mr-2"
                      :class="isSubmitting ? 'fa-spinner fa-spin' : 'fa-shopping-cart'"
                    ></i>
                    {{ isSubmitting ? "Đang xử lý..." : "Thêm vào giỏ hàng" }}
                  </button>

                  <button
                    class="buy-btn"
                    @click="buyNow"
                    :disabled="!canBuy || isSubmitting"
                  >
                    <i class="fas fa-bolt mr-2"></i>
                    {{ isSubmitting ? "Đang xử lý..." : "Mua ngay" }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="relatedAccessories.length > 0" class="related-section">
        <div class="related-head">
          <h3 class="related-title">Gợi ý sản phẩm tương tự</h3>
          <p class="related-subtitle">
            Một số sản phẩm khác có thể phù hợp với nhu cầu của bạn
          </p>
        </div>

        <div class="related-grid">
          <div
            class="related-card"
            v-for="item in relatedAccessories"
            :key="item._id || item.id"
          >
            <div class="related-image-wrap" @click="goToDetail(item)">
              <img
                :src="getAccessoryImage(item)"
                alt="related"
                class="related-image"
              />

              <span
                v-if="item.hasPromotion"
                class="related-discount-badge"
              >
                {{ item.discountLabel }}
              </span>

              <span v-if="canBuyRelated(item)" class="related-stock-badge">
                Còn hàng
              </span>
            </div>

            <div class="related-body">
              <h4 class="related-name" @click="goToDetail(item)">
                {{ item.name }}
              </h4>

              <div class="related-price-block">
                <div v-if="item.hasPromotion" class="related-old-price">
                  {{ formatCurrency(item.originalPrice) }}
                </div>
                <div class="related-price">
                  {{ formatCurrency(item.finalPrice || item.price) }}
                </div>
              </div>

              <div class="related-stock-note">
                Còn {{ Number(item.quantity || 0) }} sản phẩm
              </div>

              <div class="related-qty-box">
                <span class="related-qty-title">Số lượng</span>

                <div class="related-qty-actions">
                  <button
                    type="button"
                    class="related-qty-btn"
                    @click="decreaseRelatedQty(item)"
                    :disabled="!canBuyRelated(item)"
                  >
                    -
                  </button>

                  <span class="related-qty-value">{{ getRelatedQty(item) }}</span>

                  <button
                    type="button"
                    class="related-qty-btn"
                    @click="increaseRelatedQty(item)"
                    :disabled="!canIncreaseRelated(item)"
                  >
                    +
                  </button>
                </div>
              </div>

              <div class="related-actions">
                <button
                  class="related-cart-btn"
                  type="button"
                  title="Thêm vào giỏ hàng"
                  @click="addRelatedToCart(item)"
                  :disabled="!canBuyRelated(item) || isAddingRelated(item)"
                >
                  <i
                    class="fas"
                    :class="isAddingRelated(item) ? 'fa-spinner fa-spin' : 'fa-shopping-cart'"
                  ></i>
                </button>

                <button
                  class="related-buy-btn"
                  type="button"
                  @click="buyRelatedNow(item)"
                  :disabled="!canBuyRelated(item) || isAddingRelated(item)"
                >
                  {{ isAddingRelated(item) ? "Đang xử lý..." : "Mua ngay" }}
                </button>
              </div>

              <button
                type="button"
                class="related-detail-btn"
                @click="goToDetail(item)"
              >
                Xem chi tiết
              </button>
            </div>
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
      relatedQuantities: {},
      relatedAddingMap: {},
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
          error.response?.data?.message || "Không thể tải chi tiết sản phẩm.";
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

        const validItems = (list || []).filter((item) => {
          const itemId = item._id || item.id;
          return (
            String(itemId) !== String(currentId) &&
            item.status === "Đang bán" &&
            Number(item.quantity || 0) > 0
          );
        });

        const sameCategoryItems = validItems.filter((item) => {
          const itemCategoryId =
            item.categoryId?._id || item.categoryId?.id || item.categoryId || "";
          return currentCategoryId && String(itemCategoryId) === String(currentCategoryId);
        });

        let finalItems = [];
        if (sameCategoryItems.length >= 4) {
          finalItems = sameCategoryItems.slice(0, 4);
        } else {
          const usedIds = new Set(sameCategoryItems.map((item) => String(item._id || item.id)));
          const fallbackItems = validItems.filter(
            (item) => !usedIds.has(String(item._id || item.id))
          );
          finalItems = [...sameCategoryItems, ...fallbackItems].slice(0, 4);
        }

        this.relatedAccessories = finalItems;

        const initialQty = {};
        finalItems.forEach((item) => {
          const id = item._id || item.id;
          initialQty[id] = 1;
        });
        this.relatedQuantities = initialQty;
      } catch (error) {
        console.error("Lỗi tải sản phẩm liên quan:", error);
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

async addToCart() {
  if (!this.accessory) return;

  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user) {
    alert("Vui lòng đăng nhập để thêm phụ kiện vào giỏ hàng.");
    this.$router.push("/login");
    return;
  }

  if (this.accessory.status !== "Đang bán") {
    alert("Sản phẩm này hiện không còn bán.");
    return;
  }

  if (this.safeStock <= 0) {
    alert("Sản phẩm này đang hết hàng.");
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
    alert("Đã thêm sản phẩm vào giỏ hàng!");
  } catch (error) {
    alert(error.response?.data?.message || "Không thể thêm vào giỏ hàng.");
  } finally {
    this.isSubmitting = false;
  }
},

async buyNow() {
  if (!this.accessory) return;

  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user) {
    alert("Vui lòng đăng nhập để mua phụ kiện.");
    this.$router.push("/login");
    return;
  }

  if (!this.canBuy) {
    alert("Sản phẩm này hiện không thể mua.");
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

  const buyNowItem = {
    id: `buy-now-${this.accessory._id || this.accessory.id}`,
    accessoryId: this.accessory._id || this.accessory.id,
    name: this.accessory.name || "",
    price: Number(this.accessory.finalPrice || this.accessory.price || 0),
    originalPriceAtDisplay: Number(this.accessory.price || 0),
    isPromotionApplied:
      Number(this.accessory.finalPrice || this.accessory.price || 0) <
      Number(this.accessory.price || 0),
    image: this.accessory.image || "",
    stock: Number(this.accessory.quantity || 0),
    status: this.accessory.status || "",
    quantity: Number(this.quantity || 1),
  };

  sessionStorage.setItem("buy_now_checkout", JSON.stringify([buyNowItem]));
  this.$router.push({ path: "/accessory-checkout", query: { mode: "buy-now" } });
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
      return Number(value).toLocaleString("vi-VN") + " đ";
    },

    goToDetail(item) {
      const id = item._id || item.id;
      if (!id) return;
      this.$router.push(`/accessories/${id}`);
    },

    getRelatedId(item) {
      return item?._id || item?.id;
    },

    canBuyRelated(item) {
      return item && item.status === "Đang bán" && Number(item.quantity || 0) > 0;
    },

    getRelatedQty(item) {
      const id = this.getRelatedId(item);
      return this.relatedQuantities[id] || 1;
    },

    canIncreaseRelated(item) {
      if (!this.canBuyRelated(item)) return false;
      return this.getRelatedQty(item) < Number(item.quantity || 0);
    },

    increaseRelatedQty(item) {
      if (!this.canIncreaseRelated(item)) return;
      const id = this.getRelatedId(item);
      const current = this.relatedQuantities[id] || 1;
      const stock = Number(item.quantity || 0);
      const next = current + 1 > stock ? stock : current + 1;
      this.relatedQuantities = { ...this.relatedQuantities, [id]: next };
    },

    decreaseRelatedQty(item) {
      const id = this.getRelatedId(item);
      const current = this.relatedQuantities[id] || 1;
      const next = current > 1 ? current - 1 : 1;
      this.relatedQuantities = { ...this.relatedQuantities, [id]: next };
    },

    isAddingRelated(item) {
      const id = this.getRelatedId(item);
      return !!this.relatedAddingMap[id];
    },

async addRelatedToCart(item) {
  if (!item) return;

  const accessoryId = this.getRelatedId(item);
  if (!accessoryId) {
    alert("Sản phẩm chưa có ID hợp lệ.");
    return;
  }

  if (!this.canBuyRelated(item)) {
    alert("Sản phẩm này hiện không còn bán hoặc đã hết hàng.");
    return;
  }

  const qty = this.getRelatedQty(item);
  if (!qty || qty < 1) {
    alert("Số lượng không hợp lệ.");
    return;
  }

  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user) {
    alert("Vui lòng đăng nhập để thêm phụ kiện vào giỏ hàng.");
    this.$router.push("/login");
    return;
  }

  this.relatedAddingMap = { ...this.relatedAddingMap, [accessoryId]: true };

  try {
    await CartService.addToCart(accessoryId, Number(qty));
    window.dispatchEvent(new Event("cart-updated"));
    alert("Đã thêm sản phẩm vào giỏ hàng.");
  } catch (error) {
    alert(error.response?.data?.message || "Không thể thêm vào giỏ hàng.");
  } finally {
    this.relatedAddingMap = { ...this.relatedAddingMap, [accessoryId]: false };
  }
},

async buyRelatedNow(item) {
  if (!item) return;

  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user) {
    alert("Vui lòng đăng nhập để mua phụ kiện.");
    this.$router.push("/login");
    return;
  }

  if (!this.canBuyRelated(item)) {
    alert("Sản phẩm này hiện không thể mua.");
    return;
  }

  const qty = this.getRelatedQty(item);
  const stock = Number(item.quantity || 0);

  if (!qty || qty < 1) {
    alert("Số lượng không hợp lệ.");
    return;
  }

  if (qty > stock) {
    alert(`Số lượng vượt quá tồn kho. Chỉ còn ${stock} sản phẩm.`);
    return;
  }

  const buyNowItem = {
    id: `buy-now-${item._id || item.id}`,
    accessoryId: item._id || item.id,
    name: item.name || "",
    price: Number(item.finalPrice || item.price || 0),
    originalPriceAtDisplay: Number(item.price || 0),
    isPromotionApplied:
      Number(item.finalPrice || item.price || 0) < Number(item.price || 0),
    image: item.image || "",
    stock: Number(item.quantity || 0),
    status: item.status || "",
    quantity: Number(qty || 1),
  };

  sessionStorage.setItem("buy_now_checkout", JSON.stringify([buyNowItem]));
  this.$router.push({ path: "/accessory-checkout", query: { mode: "buy-now" } });
}
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
  background:
    radial-gradient(circle at top left, rgba(177, 145, 211, 0.12), transparent 28%),
    linear-gradient(180deg, #faf7fc 0%, #f4eef9 100%);
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

.crumb-link:hover {
  color: #5a1484;
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
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: #faf6fe;
  border-color: #ccb5e7;
}

.detail-card,
.state-card,
.related-section {
  background: #fff;
  border: 1px solid #eee2f7;
  border-radius: 24px;
  box-shadow: 0 12px 24px rgba(106, 27, 154, 0.06);
}

.detail-card,
.related-section {
  margin-top: 24px;
}

.detail-inner {
  padding: 14px 28px 28px;
}

.state-card {
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: #7a708a;
  text-align: center;
  padding: 24px;
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
  grid-template-columns: minmax(380px, 430px) minmax(380px, 1fr);
  gap: 40px;
  align-items: start;
}

.gallery-panel {
  min-width: 0;
  display: flex;
  justify-content: center;
}

.main-image-wrap {
  position: relative;
  width: 100%;
  max-width: 400px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  min-height: 440px;
  margin: 0 auto;
}

.main-image {
  width: 100%;
  max-height: 440px;
  object-fit: contain;
  display: block;
}

.discount-badge-detail {
  position: absolute;
  top: 0;
  right: 0;
  display: inline-flex;
  align-items: center;
  padding: 7px 12px;
  border-radius: 999px;
  color: #fff;
  font-size: 0.76rem;
  font-weight: 800;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  box-shadow: 0 10px 18px rgba(220, 38, 38, 0.18);
}

.info-panel {
  min-width: 0;
  padding-top: 10px;
}

.accessory-title {
  color: #24124d;
  font-size: 2.15rem;
  line-height: 1.25;
  font-weight: 900;
  margin-bottom: 14px;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.price-wrap {
  margin-bottom: 14px;
}

.old-price-detail {
  color: #9b90ad;
  font-size: 1rem;
  text-decoration: line-through;
  margin-bottom: 2px;
}

.accessory-price {
  color: #2f9e44;
  font-size: 2.05rem;
  font-weight: 800;
  line-height: 1.2;
  word-break: break-word;
}

.description-box {
  margin-bottom: 18px;
}

.description-text {
  color: #5b5563;
  line-height: 1.8;
  margin: 0;
  font-size: 1rem;
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.purchase-box {
  margin-bottom: 8px;
}

.purchase-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 18px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.qty-inline {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  min-width: 0;
}

.purchase-label {
  margin: 0;
  color: #374151;
  font-size: 1rem;
  font-weight: 700;
  white-space: nowrap;
}

.stock-line {
  color: #374151;
  font-size: 1rem;
  margin: 0 0 0 8px;
  white-space: nowrap;
}

.stock-line strong {
  color: #24124d;
  font-weight: 800;
}

.qty-control {
  display: inline-flex;
  align-items: center;
  overflow: hidden;
  border: 1.5px solid #d8c1ee;
  border-radius: 12px;
  background: #fff;
  flex-shrink: 0;
}

.qty-btn {
  width: 44px;
  height: 44px;
  border: none;
  background: #fff;
  color: #8e3fd1;
  font-size: 1.15rem;
  font-weight: 800;
  transition: all 0.2s ease;
}

.qty-btn:hover:not(:disabled) {
  background: #f7f0fd;
}

.qty-input {
  width: 68px;
  height: 44px;
  border: none;
  border-left: 1px solid #eadcf7;
  border-right: 1px solid #eadcf7;
  text-align: center;
  outline: none;
  font-weight: 800;
  color: #2f1b44;
}

.action-row {
  display: grid;
  grid-template-columns: 300px 300px;
  gap: 12px;
  justify-content: start;
  margin-top: 10px;
}

.cart-btn,
.buy-btn {
  height: 46px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.cart-btn {
  border: 1.5px solid #b97fe6;
  background: #fff;
  color: #7b2fc0;
}

.cart-btn:hover:not(:disabled) {
  background: #f8f2fe;
  border-color: #9a4ddd;
}

.buy-btn {
  border: none;
  background: linear-gradient(135deg, #9a4ddd, #7522b2);
  color: #fff;
  box-shadow: 0 12px 22px rgba(117, 34, 178, 0.18);
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

.related-section {
  padding: 22px 22px 24px;
}

.related-head {
  margin-bottom: 18px;
  text-align: center;
}

.related-title {
  margin: 0 0 6px;
  color: #2f1b44;
  font-size: 1.3rem;
  font-weight: 900;
}

.related-subtitle {
  margin: 0;
  color: #7b7287;
  font-size: 0.95rem;
  line-height: 1.6;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 22px;
}

.related-card {
  background: #ffffff;
  border: 1px solid #eee2f7;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 12px 24px rgba(106, 27, 154, 0.06);
  transition: all 0.25s ease;
  min-height: 430px;
  display: flex;
  flex-direction: column;
}

.related-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 18px 32px rgba(106, 27, 154, 0.12);
}

.related-image-wrap {
  position: relative;
  height: 215px;
  background: #f7f1fd;
  overflow: hidden;
  cursor: pointer;
}

.related-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.25s ease;
}

.related-card:hover .related-image {
  transform: scale(1.04);
}

.related-discount-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  display: inline-flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 999px;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 800;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  box-shadow: 0 8px 16px rgba(220, 38, 38, 0.16);
  z-index: 2;
}

.related-stock-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  display: inline-flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 999px;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 800;
  background: rgba(22, 163, 74, 0.92);
  box-shadow: 0 8px 16px rgba(15, 23, 42, 0.08);
  z-index: 2;
}

.related-body {
  padding: 10px 14px 14px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.related-name {
  color: #2f1b44;
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.32;
  margin-bottom: 4px;
  text-align: center;
  cursor: pointer;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 32px;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.related-name:hover {
  color: #6a1b9a;
}

.related-price-block {
  text-align: center;
  margin-bottom: 6px;
}

.related-old-price {
  color: #9b90ad;
  font-size: 0.82rem;
  text-decoration: line-through;
  margin-bottom: 1px;
}

.related-price {
  color: #b42318;
  font-size: 1.05rem;
  font-weight: 900;
  line-height: 1.2;
}

.related-stock-note {
  text-align: center;
  color: #15803d;
  font-size: 0.84rem;
  font-weight: 700;
  margin-bottom: 10px;
}

.related-qty-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border: 1px solid #eadcf7;
  border-radius: 14px;
  background: #fcf9ff;
  padding: 7px 10px;
  margin-bottom: 10px;
}

.related-qty-title {
  color: #7a4db3;
  font-size: 0.84rem;
  font-weight: 700;
}

.related-qty-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.related-qty-btn {
  width: 30px;
  height: 30px;
  border: 1px solid #e2d4ef;
  background: #fff;
  color: #6d5d7d;
  border-radius: 9px;
  font-weight: 800;
  transition: all 0.2s ease;
}

.related-qty-btn:hover:not(:disabled) {
  background: #f4ebfb;
  color: #6a1b9a;
}

.related-qty-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.related-qty-value {
  min-width: 22px;
  text-align: center;
  color: #2f1b44;
  font-weight: 800;
  font-size: 0.94rem;
}

.related-actions {
  display: grid;
  grid-template-columns: 50px 1fr;
  gap: 8px;
  margin-top: auto;
}

.related-cart-btn,
.related-buy-btn {
  height: 42px;
  border-radius: 12px;
  font-size: 0.92rem;
  font-weight: 800;
  transition: all 0.2s ease;
}

.related-cart-btn {
  border: 1.5px solid #d7bdea;
  background: #fff;
  color: #8e3fd1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.related-cart-btn:hover:not(:disabled) {
  background: #f7f1fd;
  border-color: #b88bdf;
}

.related-buy-btn {
  border: none;
  background: linear-gradient(135deg, #9a4ddd, #7522b2);
  color: #fff;
  box-shadow: 0 10px 18px rgba(117, 34, 178, 0.16);
}

.related-buy-btn:hover:not(:disabled) {
  filter: brightness(0.98);
}

.related-cart-btn:disabled,
.related-buy-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}

.related-detail-btn {
  margin-top: 8px;
  border: none;
  background: transparent;
  color: rgba(123, 47, 192, 0.45);
  font-size: 0.86rem;
  font-weight: 700;
  text-align: center;
  padding: 4px 0 0;
  width: 100%;
  transition: all 0.22s ease;
}

.related-card:hover .related-detail-btn {
  color: rgba(123, 47, 192, 0.96);
}

.related-detail-btn:hover {
  color: #5f1796;
  text-decoration: underline;
}

@media (max-width: 1199.98px) {
  .detail-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .main-image-wrap {
    min-height: 360px;
  }

  .main-image {
    max-height: 360px;
  }

  .related-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 991.98px) {
  .accessory-title {
    font-size: 1.8rem;
  }

  .related-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 767.98px) {
  .detail-inner {
    padding: 18px 16px 20px;
  }

  .accessory-title {
    font-size: 1.55rem;
  }

  .main-image-wrap {
    min-height: 280px;
  }

  .main-image {
    max-height: 280px;
  }

  .purchase-row {
    flex-direction: row;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .qty-inline {
    width: 100%;
  }

  .stock-line {
    white-space: normal;
    margin-left: 0;
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
    font-size: 1.6rem;
  }
}
</style>