<template>
  <div class="accessory-list-page">
    <div class="container-fluid accessory-page-container py-4">
      <div class="page-head text-center">
        <h2 class="page-title">
          <i class="fas fa-box-open mr-2"></i>
          Phụ kiện thú cưng
        </h2>
        <p class="page-subtitle mb-0">
          {{ currentCategoryName }}
        </p>
      </div>

      <div class="toolbar-card">
        <div class="toolbar-box">
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input
              type="text"
              v-model="searchText"
              placeholder="Tìm tên hoặc mã phụ kiện"
            />
          </div>

          <button class="refresh-btn" @click="fetchAccessories">
            <i class="fas fa-sync-alt mr-1"></i> Làm mới
          </button>
        </div>
      </div>

      <div v-if="selectedCategoryId" class="current-filter-tag">
        Đang lọc: <strong>{{ currentCategoryName }}</strong>
      </div>

      <div v-if="loading" class="empty-panel">
        <i class="fas fa-spinner fa-spin empty-icon"></i>
        <p>Đang tải danh sách phụ kiện...</p>
      </div>

      <div v-else-if="filteredAccessories.length === 0" class="empty-panel">
        <i class="fas fa-box-open empty-icon"></i>
        <p>Hiện chưa có phụ kiện nào đang bán</p>
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
                alt="accessory"
              />

              <span class="accessory-badge">
                <i class="fas fa-heart mr-1"></i> Gợi ý
              </span>
            </div>

            <div class="card-body-custom">
              <h5 class="accessory-name" @click="goToDetail(item)">
                {{ item.name }}
              </h5>

              <p class="accessory-price">
                {{ formatCurrency(item.price) }}
              </p>

              <div class="qty-box">
                <span class="qty-label">Số lượng:</span>
                <div class="qty-actions">
                  <button
                    type="button"
                    class="qty-btn"
                    @click="decreaseQty(item)"
                  >
                    -
                  </button>
                  <span class="qty-value">{{ getQty(item) }}</span>
                  <button
                    type="button"
                    class="qty-btn"
                    @click="increaseQty(item)"
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
                  :disabled="!canBuy(item)"
                >
                  <i class="fas fa-shopping-cart"></i>
                </button>

                <button
                  class="buy-btn"
                  type="button"
                  @click="buyNow(item)"
                  :disabled="!canBuy(item)"
                >
                  Mua ngay
                </button>
              </div>

              <div v-if="!canBuy(item)" class="sold-out-note">
                Sản phẩm hiện không khả dụng
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
      selectedCategoryId: "",
      searchText: "",
      loading: false,
      quantities: {},
      isAddingMap: {},
    };
  },

  computed: {
    filteredAccessories() {
      return this.accessories.filter((item) => {
        const keyword = (this.searchText || "").toLowerCase();
        const name = item.name ? item.name.toLowerCase() : "";
        const code = item.maPhuKien ? item.maPhuKien.toLowerCase() : "";

        const itemCategoryId =
          item.categoryId?._id || item.categoryId?.id || item.categoryId || "";

        const matchSearch = name.includes(keyword) || code.includes(keyword);
        const matchCategory =
          !this.selectedCategoryId ||
          String(itemCategoryId) === String(this.selectedCategoryId);

        return matchSearch && matchCategory;
      });
    },

    currentCategoryName() {
      if (!this.selectedCategoryId) return "Tất cả phụ kiện";

      const found = this.categories.find(
        (item) =>
          String(item._id || item.id) === String(this.selectedCategoryId)
      );

      return found?.name || "Phụ kiện";
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
        this.accessories = await AccessoryService.getPublic();
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
        this.categories = (data || []).filter(
          (item) => item.status === "active" || !item.status
        );
      } catch (error) {
        console.error("Lỗi tải loại phụ kiện:", error);
        this.categories = [];
      }
    },

    getItemId(item) {
      return item._id || item.id;
    },

    getAccessoryImage(item) {
      if (item?.image) return "http://localhost:3000" + item.image;
      return "https://via.placeholder.com/500x350?text=Accessory";
    },

    formatCurrency(value) {
      if (value === null || value === undefined) return "---";
      return Number(value).toLocaleString("vi-VN") + "đ";
    },

    canBuy(item) {
      return item && item.status === "Đang bán" && Number(item.quantity || 0) > 0;
    },

    getQty(item) {
      const id = this.getItemId(item);
      return this.quantities[id] || 1;
    },

    increaseQty(item) {
      const id = this.getItemId(item);
      const current = this.quantities[id] || 1;
      this.quantities = { ...this.quantities, [id]: current + 1 };
    },

    decreaseQty(item) {
      const id = this.getItemId(item);
      const current = this.quantities[id] || 1;
      const next = current > 1 ? current - 1 : 1;
      this.quantities = { ...this.quantities, [id]: next };
    },

    async addToCart(item, redirectToCart = false) {
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

        if (redirectToCart) {
          this.$router.push("/cart");
          return;
        }

        alert("Đã thêm phụ kiện vào giỏ hàng.");
      } catch (error) {
        alert(error.response?.data?.message || "Không thể thêm vào giỏ hàng.");
      } finally {
        this.isAddingMap = { ...this.isAddingMap, [accessoryId]: false };
      }
    },

    async buyNow(item) {
      await this.addToCart(item, true);
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
  background: linear-gradient(180deg, #faf7fc 0%, #f4eef9 100%);
}

.accessory-page-container {
  max-width: 1420px;
  padding-left: 24px;
  padding-right: 24px;
}

.page-head {
  margin-bottom: 24px;
}

.page-title {
  color: #2f1b44;
  font-size: 2rem;
  font-weight: 900;
  margin-bottom: 8px;
}

.page-title i {
  color: #6a1b9a;
}

.page-subtitle {
  color: #7b7287;
  font-size: 0.98rem;
}

.toolbar-card {
  background: #ffffff;
  border: 1px solid #eee2f7;
  border-radius: 20px;
  box-shadow: 0 10px 24px rgba(106, 27, 154, 0.06);
  padding: 18px;
  margin-bottom: 18px;
}

.toolbar-box {
  display: grid;
  grid-template-columns: 1fr 120px;
  gap: 12px;
  align-items: center;
}

.search-box {
  position: relative;
}

.search-box i {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #8b7fa0;
  font-size: 0.95rem;
  pointer-events: none;
}

.search-box input {
  width: 100%;
  height: 46px;
  border: 1px solid #dfd3ec;
  border-radius: 14px;
  padding: 0 16px 0 40px;
  outline: none;
  font-size: 0.94rem;
  background: #fff;
  color: #3b3150;
  transition: all 0.2s ease;
}

.search-box input::placeholder {
  color: #9b90ad;
}

.search-box input:focus {
  border-color: #7b3fc8;
  box-shadow: 0 0 0 3px rgba(123, 63, 200, 0.08);
}

.refresh-btn {
  border: none;
  background: linear-gradient(135deg, #6a1b9a, #4a148c);
  color: #fff;
  height: 46px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 0.92rem;
  transition: all 0.2s ease;
}

.refresh-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(106, 27, 154, 0.18);
}

.current-filter-tag {
  margin-top: -4px;
  margin-bottom: 18px;
  color: #6a1b9a;
  font-size: 0.92rem;
}

.empty-panel {
  background: #fff;
  border: 1px solid #eee2f7;
  border-radius: 18px;
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: #7a708a;
  box-shadow: 0 10px 24px rgba(106, 27, 154, 0.05);
}

.empty-icon {
  font-size: 2.5rem;
  margin-bottom: 12px;
  color: #cfbfdc;
}

.accessory-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 24px;
}

.accessory-col {
  min-width: 0;
}

.accessory-card {
  background: #ffffff;
  border: 1px solid #eee2f7;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 10px 22px rgba(106, 27, 154, 0.06);
  transition: all 0.25s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.accessory-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 28px rgba(106, 27, 154, 0.12);
}

.card-image-wrap {
  position: relative;
  height: 210px;
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
  transform: scale(1.03);
}

.accessory-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 999px;
  background: linear-gradient(135deg, #8e3fd1, #6a1b9a);
  color: #fff;
  font-size: 0.74rem;
  font-weight: 800;
  box-shadow: 0 8px 16px rgba(106, 27, 154, 0.18);
}

.card-body-custom {
  padding: 14px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.accessory-name {
  color: #2f1b44;
  font-size: 0.98rem;
  font-weight: 800;
  line-height: 1.45;
  margin-bottom: 8px;
  min-height: 54px;
  cursor: pointer;
}

.accessory-name:hover {
  color: #6a1b9a;
}

.accessory-price {
  color: #b42318;
  font-size: 1rem;
  font-weight: 900;
  margin-bottom: 10px;
}

.qty-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  border: 1px solid #eadcf7;
  border-radius: 12px;
  background: #fcf9ff;
  padding: 8px 10px;
  margin-bottom: 12px;
}

.qty-label {
  color: #8b5aa6;
  font-size: 0.84rem;
  font-weight: 700;
}

.qty-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.qty-btn {
  width: 28px;
  height: 28px;
  border: 1px solid #e2d4ef;
  background: #fff;
  color: #6d5d7d;
  border-radius: 8px;
  font-weight: 800;
  transition: all 0.2s ease;
}

.qty-btn:hover {
  background: #f4ebfb;
  color: #6a1b9a;
}

.qty-value {
  min-width: 18px;
  text-align: center;
  color: #2f1b44;
  font-weight: 800;
  font-size: 0.9rem;
}

.card-actions {
  display: grid;
  grid-template-columns: 52px 1fr;
  gap: 10px;
  margin-top: auto;
}

.cart-btn {
  height: 42px;
  border: 1.5px solid #d3b8eb;
  background: #fff;
  color: #8e3fd1;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 800;
  transition: all 0.2s ease;
}

.cart-btn:hover:not(:disabled) {
  background: #f7f1fd;
  border-color: #b88bdf;
}

.buy-btn {
  height: 42px;
  border: none;
  background: linear-gradient(135deg, #8e3fd1, #6a1b9a);
  color: #fff;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 800;
  transition: all 0.2s ease;
}

.buy-btn:hover:not(:disabled) {
  filter: brightness(0.98);
  box-shadow: 0 10px 18px rgba(106, 27, 154, 0.2);
}

.cart-btn:disabled,
.buy-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.sold-out-note {
  margin-top: 10px;
  color: #b42318;
  font-size: 0.82rem;
  font-weight: 700;
}

@media (max-width: 1199.98px) {
  .accessory-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .page-title {
    font-size: 1.8rem;
  }
}

@media (max-width: 991.98px) {
  .toolbar-box {
    grid-template-columns: 1fr;
  }

  .refresh-btn {
    width: 100%;
  }

  .accessory-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 767.98px) {
  .accessory-page-container {
    padding-left: 16px;
    padding-right: 16px;
  }

  .accessory-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
  }

  .page-title {
    font-size: 1.55rem;
  }

  .card-image-wrap {
    height: 190px;
  }
}

@media (max-width: 575.98px) {
  .accessory-grid {
    grid-template-columns: 1fr;
  }
}
</style>