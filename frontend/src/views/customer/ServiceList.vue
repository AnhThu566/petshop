<template>
  <div class="service-list-page">
    <div class="container py-4">
      <div class="hero-box">
        <div class="hero-content">
          <span class="hero-kicker">Dịch vụ chăm sóc thú cưng</span>
          <h1>Chọn dịch vụ phù hợp cho bé cưng của bạn</h1>
          <p>
            Khám phá các dịch vụ chăm sóc, vệ sinh và hỗ trợ sức khỏe với quy trình
            rõ ràng, dễ đặt lịch và dễ theo dõi trên cùng một hệ thống.
          </p>

          <div class="hero-tags">
            <span class="hero-tag">
              <i class="fas fa-check-circle mr-1"></i>Dễ đặt lịch
            </span>
            <span class="hero-tag">
              <i class="fas fa-heart mr-1"></i>Chăm sóc thuận tiện
            </span>
            <span class="hero-tag">
              <i class="fas fa-shield-alt mr-1"></i>Thông tin minh bạch
            </span>
          </div>
        </div>
      </div>

      <div class="toolbar-card">
        <div class="toolbar">
          <div class="search-box">
            <span class="search-icon">
              <i class="fas fa-search"></i>
            </span>
            <input
              v-model.trim="keyword"
              type="text"
              placeholder="Tìm theo tên dịch vụ..."
            />
          </div>

          <router-link
            v-if="isCustomer"
            to="/service-bookings"
            class="btn-history"
          >
            Lịch sử đặt dịch vụ
          </router-link>
        </div>
      </div>

      <div v-if="loading" class="state-box">
        <div class="spinner"></div>
        <p>Đang tải danh sách dịch vụ...</p>
      </div>

      <div v-else-if="errorMessage" class="state-box error-box">
        <p>{{ errorMessage }}</p>
        <button class="btn-reload" @click="loadServices">Tải lại</button>
      </div>

      <div v-else-if="filteredServices.length === 0" class="state-box empty-box">
        <div class="empty-icon">🛁</div>
        <h3>Không tìm thấy dịch vụ phù hợp</h3>
        <p>Hãy thử từ khóa khác hoặc quay lại sau.</p>
      </div>

      <div v-else class="service-grid">
        <div
          v-for="service in filteredServices"
          :key="service._id || service.id"
          class="service-card"
        >
          <router-link
            :to="`/services/${service._id || service.id}`"
            class="service-image-link"
          >
            <img
              :src="getImageUrl(service.image)"
              :alt="service.name"
              class="service-image"
              @error="handleImageError"
            />

            <div class="service-image-gradient"></div>

            <span class="service-badge">
              <i class="fas fa-star mr-1"></i> Dịch vụ nổi bật
            </span>
          </router-link>

          <div class="service-body">
            <div class="service-top">
              <span class="service-code">
                {{ service.maDichVu || "DV---" }}
              </span>
              <span
                class="service-status"
                :class="service.status === 'Đang hoạt động' ? 'status-active' : 'status-paused'"
              >
                {{ service.status || "Đang hoạt động" }}
              </span>
            </div>

            <h3 class="service-name">
              <router-link :to="`/services/${service._id || service.id}`">
                {{ service.name }}
              </router-link>
            </h3>

            <p class="service-category" v-if="service.categoryId?.name">
              Loại dịch vụ: {{ service.categoryId.name }}
            </p>

            <p class="service-description">
              {{ truncateText(service.description, 120) }}
            </p>

            <div class="service-bottom">
              <div class="service-price">
                {{ formatCurrency(service.price) }}
              </div>

              <router-link
                :to="`/services/${service._id || service.id}`"
                class="btn-detail"
              >
                Xem chi tiết
              </router-link>
            </div>

            <div class="service-link-row">
              Đặt lịch dịch vụ nhanh chóng
              <i class="fas fa-arrow-right ml-2"></i>
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
      keyword: "",
      baseImageUrl: "http://localhost:3000",
      fallbackImage: "https://via.placeholder.com/600x400?text=Service",
    };
  },
  computed: {
    filteredServices() {
      const keyword = this.keyword.toLowerCase();

      return this.services.filter((service) => {
        const statusOk =
          !service.status || service.status === "Đang hoạt động";

        const name = String(service.name || "").toLowerCase();
        const code = String(service.maDichVu || "").toLowerCase();
        const description = String(service.description || "").toLowerCase();
        const category = String(service.categoryId?.name || "").toLowerCase();

        const keywordOk =
          name.includes(keyword) ||
          code.includes(keyword) ||
          description.includes(keyword) ||
          category.includes(keyword);

        return statusOk && keywordOk;
      });
    },
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

    formatCurrency(value) {
      return Number(value || 0).toLocaleString("vi-VN") + " đ";
    },

    truncateText(text, maxLength = 120) {
      const content = String(text || "").trim();
      if (!content) return "Dịch vụ đang được cập nhật mô tả.";
      if (content.length <= maxLength) return content;
      return content.slice(0, maxLength) + "...";
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
  mounted() {
    this.loadServices();
  },
};
</script>

<style scoped>
.service-list-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(177, 145, 211, 0.12), transparent 28%),
    linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
}

.container {
  max-width: 1240px;
  margin: 0 auto;
  padding-left: 16px;
  padding-right: 16px;
}

.hero-box {
  margin-bottom: 24px;
  border-radius: 28px;
  padding: 38px 30px;
  background: linear-gradient(135deg, #eff6ff, #ffffff);
  border: 1px solid #dbeafe;
  box-shadow: 0 12px 28px rgba(37, 99, 235, 0.08);
}

.hero-kicker {
  display: inline-block;
  padding: 7px 14px;
  border-radius: 999px;
  background: #dbeafe;
  color: #1d4ed8;
  font-weight: 800;
  font-size: 13px;
  margin-bottom: 14px;
}

.hero-content h1 {
  margin: 0 0 10px;
  font-size: 36px;
  line-height: 1.2;
  color: #0f172a;
  font-weight: 900;
}

.hero-content p {
  margin: 0;
  color: #475569;
  line-height: 1.75;
  max-width: 760px;
}

.hero-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}

.hero-tag {
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  border-radius: 999px;
  background: #ffffff;
  color: #2563eb;
  font-size: 0.86rem;
  font-weight: 700;
  border: 1px solid #dbeafe;
}

.toolbar-card {
  background: #ffffff;
  border: 1px solid #e5edf6;
  border-radius: 22px;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.05);
  padding: 16px;
  margin-bottom: 22px;
}

.toolbar {
  display: flex;
  gap: 12px;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 260px;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  pointer-events: none;
  z-index: 2;
}

.search-box input {
  width: 100%;
  height: 48px;
  padding: 0 16px 0 46px;
  border-radius: 14px;
  border: 1px solid #dbe2ea;
  background: #fff;
  outline: none;
  font-size: 14px;
  display: block;
}

.search-box input:focus {
  border-color: #93c5fd;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
}

.btn-history,
.btn-detail,
.btn-reload {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 18px;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 800;
  transition: 0.2s ease;
  cursor: pointer;
  border: none;
}

.btn-history {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #fff;
}

.btn-history:hover {
  color: #fff;
  filter: brightness(0.98);
}

.btn-detail {
  background: #eff6ff;
  color: #2563eb;
}

.btn-detail:hover {
  background: #dbeafe;
  color: #1d4ed8;
}

.btn-reload {
  background: #2563eb;
  color: #fff;
  margin-top: 10px;
}

.state-box {
  background: #fff;
  border-radius: 20px;
  padding: 52px 20px;
  text-align: center;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
}

.error-box {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.spinner {
  width: 42px;
  height: 42px;
  border: 4px solid #e5e7eb;
  border-top-color: #2563eb;
  border-radius: 50%;
  margin: 0 auto 14px;
  animation: spin 0.8s linear infinite;
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
}

.service-card {
  background: #fff;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.08);
  border: 1px solid #eef2f7;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.service-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 38px rgba(15, 23, 42, 0.12);
}

.service-image-link {
  display: block;
  height: 230px;
  background: #f1f5f9;
  position: relative;
  overflow: hidden;
}

.service-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.25s ease;
}

.service-card:hover .service-image {
  transform: scale(1.05);
}

.service-image-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(20, 10, 28, 0.02) 0%, rgba(20, 10, 28, 0.25) 100%);
}

.service-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 999px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #fff;
  font-size: 0.74rem;
  font-weight: 800;
  box-shadow: 0 8px 16px rgba(37, 99, 235, 0.18);
  z-index: 2;
}

.service-body {
  padding: 18px;
}

.service-top {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.service-code {
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
}

.service-status {
  font-size: 12px;
  font-weight: 700;
  padding: 6px 10px;
  border-radius: 999px;
}

.status-active {
  color: #166534;
  background: #dcfce7;
}

.status-paused {
  color: #b91c1c;
  background: #fee2e2;
}

.service-name {
  margin: 0 0 8px;
  font-size: 21px;
  line-height: 1.35;
}

.service-name a {
  color: #0f172a;
  text-decoration: none;
  font-weight: 900;
}

.service-name a:hover {
  color: #2563eb;
}

.service-category {
  margin: 0 0 8px;
  color: #475569;
  font-size: 14px;
}

.service-description {
  margin: 0 0 16px;
  color: #64748b;
  line-height: 1.7;
  min-height: 56px;
}

.service-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.service-price {
  font-size: 22px;
  font-weight: 900;
  color: #dc2626;
}

.service-link-row {
  margin-top: 12px;
  color: #2563eb;
  font-size: 0.9rem;
  font-weight: 800;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 992px) {
  .service-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .hero-content h1 {
    font-size: 30px;
  }
}

@media (max-width: 768px) {
  .hero-content h1 {
    font-size: 28px;
  }

  .service-grid {
    grid-template-columns: 1fr;
  }

  .btn-history {
    width: 100%;
  }
}
</style>