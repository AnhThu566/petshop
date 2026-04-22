<template>
  <div class="service-list-page">
    <div class="container-fluid service-page-container py-4">
      <div class="page-head text-center">
        <h2 class="page-title">Danh sách dịch vụ</h2>
        <p class="page-subtitle">
          Lựa chọn dịch vụ phù hợp để chăm sóc chó của bạn
        </p>
      </div>

      <div class="page-action-bar" v-if="isCustomer">
        <router-link to="/service-bookings" class="btn-history">
          Lịch sử đặt dịch vụ
        </router-link>
      </div>

      <div v-if="loading" class="empty-panel">
        <i class="fas fa-spinner fa-spin empty-icon"></i>
        <p>Đang tải danh sách dịch vụ...</p>
      </div>

      <div v-else-if="errorMessage" class="empty-panel error-panel">
        <i class="fas fa-exclamation-circle empty-icon"></i>
        <p>{{ errorMessage }}</p>
        <button class="reset-filter-btn" @click="loadServices">Tải lại</button>
      </div>

      <div v-else-if="services.length === 0" class="empty-panel">
        <i class="fas fa-concierge-bell empty-icon"></i>
        <p>Hiện chưa có dịch vụ để hiển thị</p>
      </div>

      <div v-else class="service-grid">
        <div
          class="service-col"
          v-for="service in services"
          :key="service._id || service.id"
        >
          <div class="service-card">
            <div class="card-image-wrap" @click="goToDetail(service)">
              <img
                :src="getImageUrl(service.image)"
                class="card-image"
                :alt="service.name || 'service'"
                @error="handleImageError"
              />

              <span
                class="status-badge"
                :class="service.status === 'Đang hoạt động' ? 'badge-available' : 'badge-off'"
              >
                {{ service.status === "Đang hoạt động" ? "Hoạt động" : "Ngừng hoạt động" }}
              </span>

              <div class="card-image-gradient"></div>
            </div>

            <div class="card-body-custom">
              <h5 class="service-name" @click="goToDetail(service)">
                {{ service.name }}
              </h5>

              <div class="price-block">
                <div class="service-price">
                  {{ formatCurrency(service.price) }}
                </div>
              </div>

              <div class="service-status-note">
                {{
                  service.status === "Đang hoạt động"
                    ? "Có thể đặt lịch ngay"
                    : "Dịch vụ hiện tạm ngừng"
                }}
              </div>

              <div class="card-actions">
                <button
                  class="detail-btn"
                  type="button"
                  @click="goToDetail(service)"
                >
                  Xem chi tiết
                </button>

                <button
                  class="book-btn"
                  type="button"
                  @click="goToDetail(service)"
                  :disabled="service.status !== 'Đang hoạt động'"
                >
                  Đặt lịch
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ServiceService from "@/services/service.service";

export default {
  name: "ServiceList",
  data() {
    return {
      services: [],
      loading: false,
      errorMessage: "",
      baseImageUrl: "http://localhost:3000",
      fallbackImage: "https://via.placeholder.com/600x400?text=Service",
    };
  },
  computed: {
    isCustomer() {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      return user?.role === "customer";
    },
  },
  methods: {
    async loadServices() {
      this.loading = true;
      this.errorMessage = "";

      try {
        const data = await ServiceService.getPublic();
        this.services = Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Lỗi loadServices:", error);
        this.errorMessage =
          error?.response?.data?.message ||
          "Không thể tải danh sách dịch vụ.";
      } finally {
        this.loading = false;
      }
    },

    goToDetail(service) {
      const id = service?._id || service?.id;
      if (!id) return;
      this.$router.push(`/services/${id}`);
    },

    formatCurrency(value) {
      return Number(value || 0).toLocaleString("vi-VN") + " đ";
    },

    getImageUrl(image) {
      if (!image) return this.fallbackImage;
      if (image.startsWith("http://") || image.startsWith("https://")) {
        return image;
      }
      return `${this.baseImageUrl}${image}`;
    },

    handleImageError(event) {
      event.target.src = this.fallbackImage;
    },
  },
  async mounted() {
    await this.loadServices();
  },
};
</script>

<style scoped>
.service-list-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(155, 117, 204, 0.12), transparent 28%),
    linear-gradient(180deg, #faf7fc 0%, #f4eef9 100%);
}

.service-page-container {
  max-width: 1420px;
  padding-left: 24px;
  padding-right: 24px;
}

.page-head {
  margin-bottom: 20px;
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

.page-action-bar {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.btn-history {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 18px;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 800;
  background: linear-gradient(135deg, #9a4ddd, #7522b2);
  color: #fff;
  box-shadow: 0 10px 18px rgba(117, 34, 178, 0.16);
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

.error-panel {
  color: #b42318;
}

.empty-icon {
  font-size: 2.5rem;
  margin-bottom: 12px;
  color: #cfbfdc;
}

.reset-filter-btn {
  margin-top: 12px;
  border: none;
  background: linear-gradient(135deg, #9a4ddd, #7522b2);
  color: #fff;
  padding: 10px 18px;
  border-radius: 12px;
  font-weight: 700;
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 22px;
}

.service-col {
  min-width: 0;
}

.service-card {
  background: #ffffff;
  border: 1px solid #eee2f7;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 12px 24px rgba(106, 27, 154, 0.06);
  transition: all 0.25s ease;
  display: flex;
  flex-direction: column;
  min-height: 430px;
}

.service-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 18px 32px rgba(106, 27, 154, 0.12);
}

.card-image-wrap {
  position: relative;
  height: 235px;
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

.service-card:hover .card-image {
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

.status-badge {
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

.badge-off {
  background: rgba(185, 28, 28, 0.94);
  color: #fff;
}

.card-body-custom {
  padding: 14px 16px 18px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.service-name {
  color: #2f1b44;
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.35;
  margin-bottom: 8px;
  text-align: center;
  cursor: pointer;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 42px;
}

.service-name:hover {
  color: #6a1b9a;
}

.price-block {
  text-align: center;
  margin-bottom: 8px;
}

.service-price {
  color: #b42318;
  font-size: 1.08rem;
  font-weight: 900;
  line-height: 1.2;
}

.service-status-note {
  text-align: center;
  font-size: 0.83rem;
  font-weight: 700;
  margin-bottom: 12px;
  min-height: 20px;
  color: #7a4db3;
}

.card-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: auto;
  padding-top: 4px;
}

.detail-btn,
.book-btn {
  height: 42px;
  border-radius: 12px;
  font-size: 0.92rem;
  font-weight: 800;
  transition: all 0.2s ease;
}

.detail-btn {
  border: 1.5px solid #d7bdea;
  background: #fff;
  color: #8e3fd1;
}

.detail-btn:hover {
  background: #f7f1fd;
  border-color: #b88bdf;
}

.book-btn {
  border: none;
  background: linear-gradient(135deg, #9a4ddd, #7522b2);
  color: #fff;
  box-shadow: 0 10px 18px rgba(117, 34, 178, 0.16);
}

.book-btn:hover:not(:disabled) {
  filter: brightness(0.98);
}

.book-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}

@media (max-width: 1199.98px) {
  .service-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .page-title {
    font-size: 1.9rem;
  }
}

@media (max-width: 991.98px) {
  .service-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 767.98px) {
  .service-page-container {
    padding-left: 16px;
    padding-right: 16px;
  }

  .service-grid {
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

  .btn-history {
    width: 100%;
  }
}

@media (max-width: 575.98px) {
  .service-grid {
    grid-template-columns: 1fr;
  }
}
</style>