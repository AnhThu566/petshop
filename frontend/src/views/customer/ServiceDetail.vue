<template>
  <div class="service-detail-page">
    <div class="container py-4">
      <div v-if="loading" class="state-box">
        <div class="spinner"></div>
        <p>Đang tải chi tiết dịch vụ...</p>
      </div>

      <div v-else-if="errorMessage" class="state-box error-box">
        <p>{{ errorMessage }}</p>
        <router-link to="/services" class="btn-back">
          Quay lại danh sách dịch vụ
        </router-link>
      </div>

      <div v-else-if="service" class="detail-wrapper">
        <div class="breadcrumb-box">
          <router-link to="/">Trang chủ</router-link>
          <span>/</span>
          <router-link to="/services">Dịch vụ</router-link>
          <span>/</span>
          <strong>{{ service.name }}</strong>
        </div>

        <div class="detail-card">
          <div class="detail-left">
            <div class="image-box">
              <img
                :src="getImageUrl(service.image)"
                :alt="service.name"
                class="service-image"
                @error="handleImageError"
              />
            </div>
          </div>

          <div class="detail-right">
            <p class="service-code">
              Mã dịch vụ: <strong>{{ service.maDichVu || "DV---" }}</strong>
            </p>

            <h1 class="service-name">{{ service.name }}</h1>

            <div class="status-row">
              <span
                class="status-badge"
                :class="service.status === 'Đang hoạt động' ? 'status-active' : 'status-paused'"
              >
                {{ service.status }}
              </span>

              <span v-if="service.categoryId?.name" class="category-badge">
                {{ service.categoryId.name }}
              </span>
            </div>

            <div class="price-box">
              {{ formatCurrency(service.price) }}
            </div>

            <div class="service-short-info">
              <div class="info-item">
                <span class="label">Loại dịch vụ</span>
                <strong>{{ service.categoryId?.name || "Đang cập nhật" }}</strong>
              </div>

              <div class="info-item">
                <span class="label">Trạng thái</span>
                <strong>{{ service.status || "Đang hoạt động" }}</strong>
              </div>
            </div>

            <div class="service-actions">
              <button
                class="btn-book"
                @click="openBookingModal"
                :disabled="!canBook"
              >
                {{ canBook ? "Đặt lịch ngay" : "Dịch vụ ngừng hoạt động" }}
              </button>

              <router-link
                v-if="isCustomer"
                to="/service-bookings"
                class="btn-history"
              >
                Xem lịch sử đặt
              </router-link>
            </div>

            <div class="service-note">
              <p>
                Bạn có thể đặt lịch trực tiếp tại đây. Sau khi gửi yêu cầu, admin sẽ
                xác nhận lịch dịch vụ cho bạn.
              </p>
            </div>
          </div>
        </div>

        <div class="description-card">
          <h2>Mô tả dịch vụ</h2>
          <p>{{ service.description || "Dịch vụ đang được cập nhật mô tả." }}</p>
        </div>
      </div>
    </div>

    <div
      v-if="showBookingModal"
      class="modal-overlay"
      @click.self="closeBookingModal"
    >
      <div class="booking-modal">
        <div class="modal-header">
          <h3>Đặt lịch dịch vụ</h3>
          <button class="btn-close" @click="closeBookingModal">×</button>
        </div>

        <div class="modal-body">
          <div class="selected-service">
            <img
              :src="getImageUrl(service.image)"
              :alt="service.name"
              class="selected-service-image"
              @error="handleImageError"
            />
            <div>
              <h4>{{ service.name }}</h4>
              <p>{{ formatCurrency(service.price) }}</p>
            </div>
          </div>

          <form @submit.prevent="submitBooking">
            <div class="form-group">
              <label>Họ tên người đặt</label>
              <input v-model.trim="form.customerName" type="text" required />
            </div>

            <div class="form-group">
              <label>Số điện thoại</label>
              <input v-model.trim="form.customerPhone" type="text" required />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Ngày đặt</label>
                <input
                  v-model="form.bookingDate"
                  type="date"
                  :min="minDate"
                  required
                />
              </div>

              <div class="form-group">
                <label>Giờ đặt</label>
                <input v-model="form.bookingTime" type="time" required />
              </div>
            </div>

            <div class="form-group">
              <label>Ghi chú</label>
              <textarea
                v-model.trim="form.note"
                rows="4"
                placeholder="Nhập ghi chú nếu có..."
              ></textarea>
            </div>

            <div class="form-actions">
              <button
                type="button"
                class="btn-cancel"
                @click="closeBookingModal"
                :disabled="submitting"
              >
                Đóng
              </button>

              <button
                type="submit"
                class="btn-submit"
                :disabled="submitting"
              >
                {{ submitting ? "Đang gửi..." : "Xác nhận đặt lịch" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <transition name="fade">
      <div v-if="successMessage" class="toast-success">
        {{ successMessage }}
      </div>
    </transition>
  </div>
</template>

<script>
import ServiceService from "@/services/service.service";
import ServiceBookingService from "@/services/serviceBooking.service";

export default {
  name: "ServiceDetail",
  data() {
    return {
      service: null,
      loading: false,
      errorMessage: "",
      showBookingModal: false,
      submitting: false,
      successMessage: "",
      baseImageUrl: "http://localhost:3000",
      fallbackImage: "https://via.placeholder.com/800x500?text=Service",
      form: {
        customerName: "",
        customerPhone: "",
        bookingDate: "",
        bookingTime: "",
        note: "",
      },
    };
  },
  computed: {
    isCustomer() {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      return user?.role === "customer";
    },
    canBook() {
      return this.service?.status === "Đang hoạt động";
    },
    minDate() {
      const today = new Date();
      return today.toISOString().split("T")[0];
    },
    currentServiceId() {
      return this.service?._id || this.service?.id || "";
    },
  },
  methods: {
    async loadServiceDetail() {
      this.loading = true;
      this.errorMessage = "";

      try {
        const data = await ServiceService.get(this.$route.params.id);
        this.service = data;
      } catch (error) {
        console.error("Lỗi loadServiceDetail:", error);
        this.errorMessage =
          error?.response?.data?.message ||
          "Không thể tải chi tiết dịch vụ.";
      } finally {
        this.loading = false;
      }
    },

    resetForm() {
      this.form = {
        customerName: "",
        customerPhone: "",
        bookingDate: "",
        bookingTime: "",
        note: "",
      };
    },

    openBookingModal() {
      if (!this.isCustomer) {
        alert("Vui lòng đăng nhập tài khoản khách hàng để đặt lịch.");
        this.$router.push("/login");
        return;
      }

      if (!this.canBook) {
        alert("Dịch vụ hiện không khả dụng.");
        return;
      }

      if (!this.currentServiceId) {
        alert("Không tìm thấy thông tin dịch vụ.");
        return;
      }

      const user = JSON.parse(localStorage.getItem("user") || "null");
      this.form.customerName = user?.fullName || "";
      this.form.customerPhone = user?.phone || "";
      this.showBookingModal = true;
    },

    closeBookingModal() {
      this.showBookingModal = false;
    },

    async submitBooking() {
      if (!this.currentServiceId) {
        alert("Không tìm thấy dịch vụ để đặt lịch.");
        return;
      }

      this.submitting = true;

      try {
        const payload = {
          serviceId: this.currentServiceId,
          customerName: this.form.customerName,
          customerPhone: this.form.customerPhone,
          bookingDate: this.form.bookingDate,
          bookingTime: this.form.bookingTime,
          note: this.form.note,
        };

        const response = await ServiceBookingService.create(payload);

        this.showSuccess(response?.message || "Đặt lịch dịch vụ thành công!");
        this.closeBookingModal();
        this.resetForm();

        setTimeout(() => {
          this.$router.push("/service-bookings");
        }, 800);
      } catch (error) {
        console.error("Lỗi submitBooking:", error);
        alert(
          error?.response?.data?.message ||
            error?.message ||
            "Không thể đặt lịch dịch vụ. Vui lòng thử lại."
        );
      } finally {
        this.submitting = false;
      }
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

    showSuccess(message) {
      this.successMessage = message;
      setTimeout(() => {
        this.successMessage = "";
      }, 2500);
    },
  },
  mounted() {
    this.loadServiceDetail();
  },
};
</script>

<style scoped>
.service-detail-page {
  min-height: 100vh;
  background: #f8fafc;
}

.container {
  max-width: 1180px;
  margin: 0 auto;
  padding-left: 16px;
  padding-right: 16px;
}

.state-box {
  background: #fff;
  border-radius: 18px;
  padding: 48px 20px;
  text-align: center;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
}

.error-box {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
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

.breadcrumb-box {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 16px;
  color: #64748b;
  font-size: 14px;
}

.breadcrumb-box a {
  color: #2563eb;
  text-decoration: none;
}

.detail-card {
  display: grid;
  grid-template-columns: 520px 1fr;
  gap: 28px;
  background: #fff;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 16px 38px rgba(15, 23, 42, 0.08);
  border: 1px solid #edf2f7;
}

.image-box {
  width: 100%;
  height: 420px;
  border-radius: 20px;
  overflow: hidden;
  background: #f1f5f9;
}

.service-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.service-code {
  margin: 0 0 10px;
  color: #64748b;
  font-size: 14px;
}

.service-name {
  margin: 0 0 14px;
  font-size: 34px;
  line-height: 1.2;
  color: #0f172a;
  font-weight: 800;
}

.status-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.status-badge,
.category-badge {
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
}

.status-active {
  background: #dcfce7;
  color: #166534;
}

.status-paused {
  background: #fee2e2;
  color: #b91c1c;
}

.category-badge {
  background: #eff6ff;
  color: #1d4ed8;
}

.price-box {
  font-size: 32px;
  font-weight: 800;
  color: #dc2626;
  margin-bottom: 18px;
}

.service-short-info {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 20px;
}

.info-item {
  background: #f8fafc;
  border-radius: 16px;
  padding: 14px;
}

.info-item .label {
  display: block;
  color: #64748b;
  font-size: 13px;
  margin-bottom: 5px;
}

.service-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.btn-book,
.btn-history,
.btn-back,
.btn-cancel,
.btn-submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 0 18px;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: 0.2s ease;
}

.btn-book {
  background: #2563eb;
  color: #fff;
}

.btn-book:hover {
  background: #1d4ed8;
}

.btn-book:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

.btn-history,
.btn-back {
  background: #eff6ff;
  color: #2563eb;
}

.btn-history:hover,
.btn-back:hover {
  background: #dbeafe;
}

.service-note {
  background: #fff7ed;
  color: #7c2d12;
  border: 1px solid #fed7aa;
  border-radius: 16px;
  padding: 14px 16px;
  line-height: 1.7;
}

.description-card {
  margin-top: 22px;
  background: #fff;
  border-radius: 22px;
  padding: 24px;
  box-shadow: 0 16px 38px rgba(15, 23, 42, 0.08);
  border: 1px solid #edf2f7;
}

.description-card h2 {
  margin: 0 0 12px;
  color: #0f172a;
  font-size: 24px;
}

.description-card p {
  margin: 0;
  color: #475569;
  line-height: 1.8;
  white-space: pre-line;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 16px;
}

.booking-modal {
  width: 100%;
  max-width: 620px;
  background: #fff;
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.28);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid #eef2f7;
}

.modal-header h3 {
  margin: 0;
  font-size: 22px;
  color: #0f172a;
}

.btn-close {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: none;
  background: #f1f5f9;
  font-size: 24px;
  cursor: pointer;
}

.modal-body {
  padding: 20px;
}

.selected-service {
  display: flex;
  gap: 14px;
  align-items: center;
  padding: 14px;
  border-radius: 16px;
  background: #f8fafc;
  margin-bottom: 18px;
}

.selected-service-image {
  width: 84px;
  height: 84px;
  border-radius: 14px;
  object-fit: cover;
  background: #e2e8f0;
}

.selected-service h4 {
  margin: 0 0 6px;
  color: #0f172a;
}

.selected-service p {
  margin: 0;
  color: #dc2626;
  font-weight: 800;
}

.form-group {
  margin-bottom: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #334155;
  font-weight: 700;
  font-size: 14px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  border: 1px solid #dbe2ea;
  border-radius: 14px;
  outline: none;
  padding: 12px 14px;
  font-size: 14px;
  background: #fff;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: #93c5fd;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.btn-cancel {
  background: #f1f5f9;
  color: #334155;
}

.btn-submit {
  background: #2563eb;
  color: #fff;
}

.btn-submit:hover {
  background: #1d4ed8;
}

.toast-success {
  position: fixed;
  right: 20px;
  bottom: 20px;
  background: #16a34a;
  color: #fff;
  padding: 14px 18px;
  border-radius: 12px;
  box-shadow: 0 10px 24px rgba(22, 163, 74, 0.24);
  z-index: 1000;
  font-weight: 700;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 992px) {
  .detail-card {
    grid-template-columns: 1fr;
  }

  .image-box {
    height: 360px;
  }
}

@media (max-width: 768px) {
  .service-name {
    font-size: 28px;
  }

  .service-short-info,
  .form-row {
    grid-template-columns: 1fr;
  }

  .image-box {
    height: 280px;
  }

  .service-actions > * {
    width: 100%;
  }
}
</style>