<template>
  <div class="accessory-list-page">
    <div class="container-fluid accessory-page-container py-4">
      <div v-if="selectedCategoryId" class="top-meta-block">
        <div class="breadcrumb-row">
          <router-link to="/" class="crumb-link">Trang chủ</router-link>
          <span class="crumb-sep">/</span>
          <router-link to="/accessories" class="crumb-link">Phụ kiện</router-link>
          <span class="crumb-sep">/</span>
          <span class="crumb-current">{{ selectedCategoryName }}</span>
        </div>

        <div class="back-row">
          <button class="back-btn" @click="goBackToAccessoryList">
            <i class="fas fa-arrow-left mr-1"></i> Quay lại
          </button>
        </div>
      </div>

      <div class="page-head text-center">
        <h2 class="page-title">
          {{ selectedCategoryId ? selectedCategoryName : "Danh sách phụ kiện" }}
        </h2>
        <p class="page-subtitle">
          {{
            selectedCategoryId
              ? `Các sản phẩm thuộc loại ${selectedCategoryName}`
              : "Lựa chọn phụ kiện phù hợp để chăm sóc và nâng niu thú cưng của bạn mỗi ngày"
          }}
        </p>
      </div>

      <div v-if="loading" class="empty-panel">
        <i class="fas fa-spinner fa-spin empty-icon"></i>
        <p>Đang tải danh sách phụ kiện...</p>
      </div>

      <div v-else-if="filteredAccessories.length === 0" class="empty-panel">
        <i class="fas fa-box-open empty-icon"></i>
        <p>
          {{
            selectedCategoryId
              ? "Loại phụ kiện này hiện chưa có sản phẩm để hiển thị"
              : "Hiện chưa có phụ kiện phù hợp để hiển thị"
          }}
        </p>
      </div>

      <div v-else class="accessory-grid">
        <div
          class="accessory-col"
          v-for="item in filteredAccessories"
          :key="item._id || item.id"
        >
          <div class="accessory-card">
            <div class="card-image-wrap" @click="goToDetail(item)">
              <img
                :src="getAccessoryImage(item)"
                class="card-image"
                :alt="item.name || 'accessory'"
              />

              <span v-if="item.hasPromotion" class="discount-badge">
                {{ item.discountLabel || "Giảm giá" }}
              </span>

              <span class="stock-badge" :class="getStockBadgeClass(item)">
                {{ getStockBadgeText(item) }}
              </span>

              <div class="card-image-gradient"></div>
            </div>

            <div class="card-body-custom">
              <h5 class="accessory-name" @click="goToDetail(item)">
                {{ item.name }}
              </h5>

              <div class="price-block">
                <div v-if="item.hasPromotion" class="old-price">
                  {{ formatCurrency(item.originalPrice) }}
                </div>

                <div class="accessory-price">
                  {{ formatCurrency(item.finalPrice || item.price) }}
                </div>
              </div>

              <div class="stock-note" :class="getStockClass(item)">
                {{ getStockText(item) }}
              </div>

              <div class="qty-box">
                <span class="qty-title">Số lượng</span>

                <div class="qty-actions">
                  <button
                    type="button"
                    class="qty-btn"
                    @click="decreaseQty(item)"
                    :disabled="!canBuy(item)"
                  >
                    -
                  </button>

                  <span class="qty-value">{{ getQty(item) }}</span>

                  <button
                    type="button"
                    class="qty-btn"
                    @click="increaseQty(item)"
                    :disabled="!canIncrease(item)"
                  >
                    +
                  </button>
                </div>
              </div>

              <div class="card-actions">
                <button
                  class="cart-btn"
                  type="button"
                  title="Thêm vào giỏ hàng"
                  @click="addToCart(item)"
                  :disabled="!canBuy(item) || isAdding(item)"
                >
                  <i
                    class="fas"
                    :class="isAdding(item) ? 'fa-spinner fa-spin' : 'fa-shopping-cart'"
                  ></i>
                </button>

                <button
                  class="buy-btn"
                  type="button"
                  @click="buyNow(item)"
                  :disabled="!canBuy(item) || isAdding(item)"
                >
                  {{ isAdding(item) ? "Đang xử lý..." : "Mua ngay" }}
                </button>
              </div>

              <button
                type="button"
                class="detail-link-btn"
                @click="goToDetail(item)"
              >
                Xem chi tiết
              </button>

              <div v-if="!canBuy(item)" class="sold-out-note">
                Hết hàng hoặc tạm ngừng bán
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AccessoryService from "@/services/accessory.service";
import AccessoryCategoryService from "@/services/accessoryCategory.service";
import CartService from "@/services/cart.service";

export default {
  name: "AccessoryList",

  data() {
    return {
      accessories: [],
      categories: [],
      loading: false,
      quantities: {},
      isAddingMap: {},
      selectedCategoryId: "",
    };
  },

  computed: {
    filteredAccessories() {
      return this.accessories.filter((item) => {
        const itemCategoryId =
          item.categoryId?._id || item.categoryId?.id || item.categoryId || "";

        if (!this.selectedCategoryId) return true;

        return String(itemCategoryId) === String(this.selectedCategoryId);
      });
    },

    selectedCategoryName() {
      if (!this.selectedCategoryId) return "Phụ kiện";

      const found = this.categories.find(
        (item) =>
          String(item._id || item.id) === String(this.selectedCategoryId)
      );

      return found?.name || "Loại phụ kiện";
    },
  },

  watch: {
    "$route.query.category": {
      immediate: true,
      handler(newValue) {
        this.selectedCategoryId = newValue || "";
      },
    },
  },

  methods: {
    async fetchAccessories() {
      try {
        this.loading = true;
        const data = await AccessoryService.getPublic();
        this.accessories = Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Lỗi tải phụ kiện:", error);
        alert("Không thể tải danh sách phụ kiện.");
      } finally {
        this.loading = false;
      }
    },

    async fetchCategories() {
      try {
        const data = await AccessoryCategoryService.getAll();
        this.categories = Array.isArray(data)
          ? data.filter(
              (item) =>
                item &&
                (item._id || item.id) &&
                item.name &&
                (!item.status || item.status === "Hoạt động")
            )
          : [];
      } catch (error) {
        console.error("Lỗi tải loại phụ kiện:", error);
        this.categories = [];
      }
    },

    goBackToAccessoryList() {
      this.$router.push("/accessories");
    },

    getItemId(item) {
      return item._id || item.id;
    },

    getAccessoryImage(item) {
      if (!item?.image) {
        return "https://via.placeholder.com/500x350?text=Accessory";
      }

      if (String(item.image).startsWith("http")) {
        return item.image;
      }

      return "http://localhost:3000" + item.image;
    },

    formatCurrency(value) {
      if (value === null || value === undefined) return "---";
      return Number(value).toLocaleString("vi-VN") + " đ";
    },

    canBuy(item) {
      return item && item.status === "Đang bán" && Number(item.quantity || 0) > 0;
    },

    canIncrease(item) {
      if (!this.canBuy(item)) return false;
      return this.getQty(item) < Number(item.quantity || 0);
    },

    getQty(item) {
      const id = this.getItemId(item);
      return this.quantities[id] || 1;
    },

    isAdding(item) {
      const id = this.getItemId(item);
      return !!this.isAddingMap[id];
    },

    increaseQty(item) {
      if (!this.canIncrease(item)) return;

      const id = this.getItemId(item);
      const current = this.quantities[id] || 1;
      const stock = Number(item.quantity || 0);
      const next = current + 1 > stock ? stock : current + 1;

      this.quantities = { ...this.quantities, [id]: next };
    },

    decreaseQty(item) {
      const id = this.getItemId(item);
      const current = this.quantities[id] || 1;
      const next = current > 1 ? current - 1 : 1;

      this.quantities = { ...this.quantities, [id]: next };
    },

    getStockText(item) {
      const stock = Number(item?.quantity || 0);

      if (item?.status !== "Đang bán") return "Tạm ngừng bán";
      if (stock <= 0) return "Hết hàng";
      if (stock <= 5) return `Sắp hết hàng • Còn ${stock} sản phẩm`;
      return `Còn ${stock} sản phẩm`;
    },

    getStockClass(item) {
      const stock = Number(item?.quantity || 0);

      if (item?.status !== "Đang bán") return "stock-off";
      if (stock <= 0) return "stock-out";
      if (stock <= 5) return "stock-low";
      return "stock-available";
    },

    getStockBadgeText(item) {
      const stock = Number(item?.quantity || 0);

      if (item?.status !== "Đang bán") return "Ngừng bán";
      if (stock <= 0) return "Hết hàng";
      if (stock <= 5) return "Sắp hết";
      return "Còn hàng";
    },

    getStockBadgeClass(item) {
      const stock = Number(item?.quantity || 0);

      if (item?.status !== "Đang bán") return "badge-off";
      if (stock <= 0) return "badge-out";
      if (stock <= 5) return "badge-low";
      return "badge-available";
    },

    async addToCart(item) {
      if (!item) return;

      const accessoryId = this.getItemId(item);
      if (!accessoryId) {
        alert("Phụ kiện này chưa có ID hợp lệ.");
        return;
      }

      if (!this.canBuy(item)) {
        alert("Phụ kiện này hiện không còn bán hoặc đã hết hàng.");
        return;
      }

      const qty = this.getQty(item);
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

      this.isAddingMap = { ...this.isAddingMap, [accessoryId]: true };

      try {
        await CartService.addToCart(accessoryId, Number(qty));
        window.dispatchEvent(new Event("cart-updated"));
        alert("Đã thêm phụ kiện vào giỏ hàng.");
      } catch (error) {
        alert(error.response?.data?.message || "Không thể thêm vào giỏ hàng.");
      } finally {
        this.isAddingMap = { ...this.isAddingMap, [accessoryId]: false };
      }
    },

    async buyNow(item) {
      if (!item) return;

      const user = JSON.parse(localStorage.getItem("user") || "null");
      if (!user) {
        alert("Vui lòng đăng nhập để mua phụ kiện.");
        this.$router.push("/login");
        return;
      }

      if (!this.canBuy(item)) {
        alert("Phụ kiện này hiện không còn bán hoặc đã hết hàng.");
        return;
      }

      const qty = this.getQty(item);
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
        id: `buy-now-${this.getItemId(item)}`,
        accessoryId: this.getItemId(item),
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
    },

    goToDetail(item) {
      const id = this.getItemId(item);

      if (!id) {
        alert("Phụ kiện này chưa có ID hợp lệ.");
        return;
      }

      this.$router.push(`/accessories/${id}`);
    },
  },

  async mounted() {
    await Promise.all([this.fetchAccessories(), this.fetchCategories()]);
  },
};
</script>

<style scoped>
.accessory-list-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(155, 117, 204, 0.12), transparent 28%),
    linear-gradient(180deg, #faf7fc 0%, #f4eef9 100%);
}

.accessory-page-container {
  max-width: 1420px;
  padding-left: 24px;
  padding-right: 24px;
}

.top-meta-block {
  margin-bottom: 18px;
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
  margin-bottom: 10px;
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

.page-head {
  margin-bottom: 26px;
}

.page-title {
  color: #5a2d91;
  font-size: 2.05rem;
  font-weight: 900;
  margin-bottom: 8px;
}

.page-subtitle {
  color: #7b6c8f;
  font-size: 0.98rem;
  margin-bottom: 0;
  font-weight: 500;
}

.empty-panel {
  background: #fff;
  border: 1px solid #eee2f7;
  border-radius: 20px;
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: #7a708a;
  box-shadow: 0 10px 24px rgba(106, 27, 154, 0.05);
  text-align: center;
  padding: 24px;
}

.empty-icon {
  font-size: 2.5rem;
  margin-bottom: 12px;
  color: #cfbfdc;
}

.accessory-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 22px;
}

.accessory-col {
  min-width: 0;
}

.accessory-card {
  background: #ffffff;
  border: 1px solid #eee2f7;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 12px 24px rgba(106, 27, 154, 0.06);
  transition: all 0.25s ease;
  min-height: 420px;
  display: flex;
  flex-direction: column;
}

.accessory-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 18px 32px rgba(106, 27, 154, 0.12);
}

.card-image-wrap {
  position: relative;
  height: 215px;
  background: #f7f1fd;
  overflow: hidden;
  cursor: pointer;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.25s ease;
}

.accessory-card:hover .card-image {
  transform: scale(1.04);
}

.card-image-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(20, 10, 28, 0.02) 0%,
    rgba(20, 10, 28, 0.14) 100%
  );
}

.discount-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  display: inline-flex;
  align-items: center;
  padding: 6px 11px;
  border-radius: 999px;
  color: #fff;
  font-size: 0.73rem;
  font-weight: 800;
  box-shadow: 0 8px 16px rgba(220, 38, 38, 0.18);
  z-index: 2;
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.stock-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  display: inline-flex;
  align-items: center;
  padding: 6px 11px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 800;
  z-index: 2;
  box-shadow: 0 8px 16px rgba(15, 23, 42, 0.08);
}

.badge-available {
  background: rgba(22, 163, 74, 0.92);
  color: #fff;
}

.badge-low {
  background: rgba(217, 119, 6, 0.95);
  color: #fff;
}

.badge-out,
.badge-off {
  background: rgba(185, 28, 28, 0.94);
  color: #fff;
}

.card-body-custom {
  padding: 10px 14px 14px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.accessory-name {
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
}

.accessory-name:hover {
  color: #6a1b9a;
}

.price-block {
  text-align: center;
  margin-bottom: 6px;
}

.old-price {
  color: #9b90ad;
  font-size: 0.81rem;
  text-decoration: line-through;
  margin-bottom: 1px;
}

.accessory-price {
  color: #b42318;
  font-size: 1.08rem;
  font-weight: 900;
  line-height: 1.2;
}

.stock-note {
  text-align: center;
  font-size: 0.82rem;
  font-weight: 700;
  margin-bottom: 10px;
  min-height: 20px;
}

.stock-available {
  color: #15803d;
}

.stock-low {
  color: #b45309;
}

.stock-out,
.stock-off {
  color: #b42318;
}

.qty-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border: 1px solid #eadcf7;
  border-radius: 14px;
  background: #fcf9ff;
  padding: 8px 10px;
  margin-bottom: 10px;
}

.qty-title {
  color: #7a4db3;
  font-size: 0.84rem;
  font-weight: 700;
}

.qty-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.qty-btn {
  width: 30px;
  height: 30px;
  border: 1px solid #e2d4ef;
  background: #fff;
  color: #6d5d7d;
  border-radius: 9px;
  font-weight: 800;
  transition: all 0.2s ease;
}

.qty-btn:hover:not(:disabled) {
  background: #f4ebfb;
  color: #6a1b9a;
}

.qty-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.qty-value {
  min-width: 22px;
  text-align: center;
  color: #2f1b44;
  font-weight: 800;
  font-size: 0.94rem;
}

.card-actions {
  display: grid;
  grid-template-columns: 50px 1fr;
  gap: 8px;
  margin-top: auto;
}

.cart-btn,
.buy-btn {
  height: 42px;
  border-radius: 12px;
  font-size: 0.92rem;
  font-weight: 800;
  transition: all 0.2s ease;
}

.cart-btn {
  border: 1.5px solid #d7bdea;
  background: #fff;
  color: #8e3fd1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-btn:hover:not(:disabled) {
  background: #f7f1fd;
  border-color: #b88bdf;
}

.buy-btn {
  border: none;
  background: linear-gradient(135deg, #9a4ddd, #7522b2);
  color: #fff;
  box-shadow: 0 10px 18px rgba(117, 34, 178, 0.16);
}

.buy-btn:hover:not(:disabled) {
  filter: brightness(0.98);
}

.cart-btn:disabled,
.buy-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}

.detail-link-btn {
  margin-top: 8px;
  border: none;
  background: transparent;
  color: rgba(123, 47, 192, 0.42);
  font-size: 0.86rem;
  font-weight: 700;
  text-align: center;
  padding: 4px 0 0;
  width: 100%;
  align-self: center;
  transition: all 0.22s ease;
}

.accessory-card:hover .detail-link-btn {
  color: rgba(123, 47, 192, 0.96);
}

.detail-link-btn:hover {
  color: #5f1796;
  text-decoration: underline;
}

.sold-out-note {
  margin-top: 6px;
  color: #b42318;
  font-size: 0.81rem;
  font-weight: 700;
  text-align: center;
}

@media (max-width: 1199.98px) {
  .accessory-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .page-title {
    font-size: 1.9rem;
  }
}

@media (max-width: 991.98px) {
  .accessory-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 767.98px) {
  .accessory-page-container {
    padding-left: 16px;
    padding-right: 16px;
  }

  .accessory-grid {
    gap: 18px;
  }

  .page-title {
    font-size: 1.6rem;
  }

  .page-subtitle {
    font-size: 0.92rem;
  }

  .card-image-wrap {
    height: 205px;
  }
}

@media (max-width: 575.98px) {
  .accessory-grid {
    grid-template-columns: 1fr;
  }
}
</style>