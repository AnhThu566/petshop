<template>
  <div class="accessory-list-page bg-light py-5" style="min-height: 100vh;">
    <div class="container">
      <div class="text-center mb-5">
        <h2 class="font-weight-bold text-dark">
          <i class="fas fa-box-open text-primary mr-2"></i>
          PHỤ KIỆN THÚ CƯNG
        </h2>
        <p class="text-muted mb-0">
          Khám phá các phụ kiện cần thiết cho bé cún của bạn
        </p>
      </div>

      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body py-3">
          <div class="row align-items-center">
            <div class="col-md-6 mb-2 mb-md-0">
              <div class="input-group">
                <div class="input-group-prepend">
                  <span class="input-group-text bg-white">
                    <i class="fas fa-search text-primary"></i>
                  </span>
                </div>
                <input
                  type="text"
                  class="form-control"
                  placeholder="Tìm tên hoặc mã phụ kiện..."
                  v-model="searchText"
                />
              </div>
            </div>

            <div class="col-md-6 text-md-right">
              <button class="btn btn-outline-primary btn-sm" @click="fetchAccessories">
                <i class="fas fa-sync-alt mr-1"></i> Làm mới
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="loading" class="text-center py-5 text-muted">
        <i class="fas fa-spinner fa-spin fa-2x mb-3 d-block"></i>
        Đang tải danh sách phụ kiện...
      </div>

      <div v-else-if="filteredAccessories.length === 0" class="card border-0 shadow-sm">
        <div class="card-body text-center py-5 text-muted">
          <i class="fas fa-box-open fa-3x mb-3 d-block"></i>
          Hiện chưa có phụ kiện nào đang bán.
        </div>
      </div>

      <div v-else class="row">
        <div
          class="col-lg-4 col-md-6 mb-4"
          v-for="item in filteredAccessories"
          :key="item._id || item.id"
        >
          <div class="card border-0 shadow-sm h-100 accessory-card">
            <img
              :src="getAccessoryImage(item)"
              class="card-img-top"
              alt="accessory"
              style="height: 240px; object-fit: cover;"
            />

            <div class="card-body d-flex flex-column">
              <div class="mb-2">
                <span class="badge badge-light border text-primary">
                  {{ item.maPhuKien || "---" }}
                </span>
              </div>

              <h5 class="font-weight-bold text-dark">
                {{ item.name }}
              </h5>

              <p class="text-danger font-weight-bold mb-2">
                {{ formatCurrency(item.price) }}
              </p>

              <p class="text-muted small flex-grow-1">
                {{ shortDescription(item.description) }}
              </p>

              <button
                class="btn btn-outline-primary btn-sm mt-2"
                @click="goToDetail(item)"
              >
                <i class="fas fa-eye mr-1"></i> Xem chi tiết
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

export default {
  data() {
    return {
      accessories: [],
      searchText: "",
      loading: false,
    };
  },

  computed: {
    filteredAccessories() {
      return this.accessories.filter((item) => {
        const keyword = (this.searchText || "").toLowerCase();
        const name = item.name ? item.name.toLowerCase() : "";
        const code = item.maPhuKien ? item.maPhuKien.toLowerCase() : "";

        return name.includes(keyword) || code.includes(keyword);
      });
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

    getAccessoryImage(item) {
      if (item?.image) return "http://localhost:3000" + item.image;
      return "https://via.placeholder.com/400x300";
    },

    formatCurrency(value) {
      if (value === null || value === undefined) return "---";
      return Number(value).toLocaleString("vi-VN") + " ₫";
    },

    shortDescription(text) {
      if (!text) return "Chưa có mô tả cho phụ kiện này.";
      if (text.length <= 100) return text;
      return text.slice(0, 100) + "...";
    },

    goToDetail(item) {
      const id = item._id || item.id;

      if (!id) {
        alert("Phụ kiện này chưa có ID hợp lệ.");
        return;
      }

      this.$router.push(`/accessories/${id}`);
    },
  },

  async mounted() {
    await this.fetchAccessories();
  },
};
</script>
<style scoped>
.accessory-card {
  transition: all 0.2s ease;
}

.accessory-card:hover {
  transform: translateY(-3px);
}
</style>