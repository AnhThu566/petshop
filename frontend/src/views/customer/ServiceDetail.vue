<template>
  <div class="service-detail-page">
    <div class="container service-detail-container py-4">
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

              <span
                class="status-badge"
                :class="service.status === 'Đang hoạt động' ? 'status-active' : 'status-paused'"
              >
                {{ service.status }}
              </span>
            </div>
          </div>

          <div class="detail-right">
            <h1 class="service-name">{{ service.name }}</h1>

            <div class="price-box">
              {{ formatCurrency(service.price) }}
            </div>

            <p class="service-description-short">
              {{ service.description || "Dịch vụ đang được cập nhật mô tả." }}
            </p>

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
                Lịch sử đặt dịch vụ
              </router-link>
            </div>

            <div class="service-note">
              Sau khi gửi yêu cầu, admin sẽ xác nhận lịch dịch vụ cho bạn.
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
  background:
    radial-gradient(circle at top left, rgba(155, 117, 204, 0.12), transparent 28%),
    linear-gradient(180deg, #faf7fc 0%, #f4eef9 100%);
}

.service-detail-container {
  max-width: 1320px;
}

.container {
  margin: 0 auto;
  padding-left: 16px;
  padding-right: 16px;
}

.state-box {
  background: #fff;
  border-radius: 20px;
  padding: 52px 20px;
  text-align: center;
  box-shadow: 0 12px 30px rgba(106, 27, 154, 0.08);
  border: 1px solid #eee2f7;
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
  border-top-color: #8e3fd1;
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
  color: #7b6c8f;
  font-size: 14px;
  font-weight: 600;
}

.breadcrumb-box a {
  color: #7b2fc0;
  text-decoration: none;
}

.breadcrumb-box a:hover {
  text-decoration: underline;
}

.detail-card {
  display: grid;
  grid-template-columns: 560px 1fr;
  gap: 28px;
  background: #fff;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 16px 38px rgba(106, 27, 154, 0.08);
  border: 1px solid #eee2f7;
}

.image-box {
  width: 100%;
  height: 430px;
  border-radius: 22px;
  overflow: hidden;
  background: #f7f1fd;
  position: relative;
}

.service-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.status-badge {
  position: absolute;
  top: 14px;
  left: 14px;
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 800;
  z-index: 2;
  box-shadow: 0 8px 16px rgba(15, 23, 42, 0.08);
}

.status-active {
  background: rgba(22, 163, 74, 0.95);
  color: #fff;
}

.status-paused {
  background: rgba(185, 28, 28, 0.94);
  color: #fff;
}

.detail-right {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.service-name {
  margin: 0 0 12px;
  font-size: 38px;
  line-height: 1.18;
  color: #2f1b44;
  font-weight: 900;
}

.price-box {
  font-size: 34px;
  font-weight: 900;
  color: #b42318;
  margin-bottom: 16px;
}

.service-description-short {
  margin: 0 0 18px;
  color: #6f6280;
  line-height: 1.8;
  font-size: 15px;
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
  font-weight: 800;
  border: none;
  cursor: pointer;
  transition: 0.2s ease;
}

.btn-book,
.btn-submit {
  background: linear-gradient(135deg, #9a4ddd, #7522b2);
  color: #fff;
  box-shadow: 0 10px 18px rgba(117, 34, 178, 0.16);
}

.btn-book:hover,
.btn-submit:hover {
  filter: brightness(0.98);
}

.btn-book:disabled {
  background: #94a3b8;
  box-shadow: none;
  cursor: not-allowed;
}

.btn-history,
.btn-back,
.btn-cancel {
  background: #fff;
  color: #8e3fd1;
  border: 1.5px solid #d7bdea;
}

.btn-history:hover,
.btn-back:hover,
.btn-cancel:hover {
  background: #f7f1fd;
}

.service-note {
  background: #fcf9ff;
  color: #7a4db3;
  border: 1px solid #eadcf7;
  border-radius: 16px;
  padding: 14px 16px;
  line-height: 1.7;
  font-weight: 600;
}

.description-card {
  margin-top: 22px;
  background: #fff;
  border-radius: 22px;
  padding: 24px;
  box-shadow: 0 16px 38px rgba(106, 27, 154, 0.08);
  border: 1px solid #eee2f7;
}

.description-card h2 {
  margin: 0 0 12px;
  color: #2f1b44;
  font-size: 24px;
  font-weight: 900;
}

.description-card p {
  margin: 0;
  color: #6f6280;
  line-height: 1.8;
  white-space: pre-line;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.52);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 16px;
}

.booking-modal {
  width: 100%;
  max-width: 640px;
  background: #fff;
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.28);
  border: 1px solid #eee2f7;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid #f1e8f8;
  background: linear-gradient(135deg, #faf5ff, #ffffff);
}

.modal-header h3 {
  margin: 0;
  font-size: 22px;
  color: #2f1b44;
  font-weight: 900;
}

.btn-close {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: none;
  background: #f7f1fd;
  color: #7b2fc0;
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
  background: #fcf9ff;
  border: 1px solid #eadcf7;
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
  color: #2f1b44;
  font-weight: 900;
}

.selected-service p {
  margin: 0;
  color: #b42318;
  font-weight: 900;
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
  color: #5f5173;
  font-weight: 800;
  font-size: 14px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  border: 1px solid #e7d9f3;
  border-radius: 14px;
  outline: none;
  padding: 12px 14px;
  font-size: 14px;
  background: #fff;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: #c9a7e7;
  box-shadow: 0 0 0 4px rgba(154, 77, 221, 0.1);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 8px;
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
  font-weight: 800;
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
    font-size: 30px;
  }

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