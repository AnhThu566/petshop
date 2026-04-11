<template>
  <div class="service-booking-history-page">
    <div class="container py-4">
      <div class="page-header mb-4">
        <h2 class="page-title">Lịch sử đặt dịch vụ</h2>
        <p class="page-subtitle">
          Theo dõi các lịch dịch vụ bạn đã đặt và trạng thái xử lý.
        </p>
      </div>

      <div v-if="loading" class="state-box">
        <div class="spinner"></div>
        <p>Đang tải lịch đặt dịch vụ...</p>
      </div>

      <div v-else-if="errorMessage" class="state-box error-box">
        <p>{{ errorMessage }}</p>
        <button class="btn-action btn-retry" @click="loadBookings">
          Tải lại
        </button>
      </div>

      <div v-else-if="bookings.length === 0" class="state-box empty-box">
        <div class="empty-icon">📅</div>
        <h3>Bạn chưa có lịch đặt dịch vụ nào</h3>
        <p>Hãy đặt dịch vụ để bắt đầu chăm sóc thú cưng của bạn.</p>
        <router-link to="/services" class="btn-action btn-primary-custom">
          Xem dịch vụ
        </router-link>
      </div>

      <div v-else class="booking-list">
        <div
          v-for="booking in bookings"
          :key="booking._id || booking.id"
          class="booking-card"
        >
          <div class="booking-card__top">
            <div>
              <p class="booking-code">
                Mã lịch:
                <span>{{ booking.maLichDat || "Không có mã" }}</span>
              </p>
              <h3 class="service-name">
                {{ booking.serviceId?.name || "Dịch vụ không xác định" }}
              </h3>
            </div>

            <span
              class="status-badge"
              :class="getStatusClass(booking.status)"
            >
              {{ booking.status }}
            </span>
          </div>

          <div class="booking-card__body">
            <div class="service-info">
              <div class="service-image-wrap">
                <img
                  :src="getImageUrl(booking.serviceId?.image)"
                  :alt="booking.serviceId?.name || 'Dịch vụ'"
                  class="service-image"
                  @error="handleImageError"
                />
              </div>

              <div class="service-meta">
                <div class="meta-row">
                  <span class="meta-label">Mã dịch vụ:</span>
                  <span class="meta-value">
                    {{ booking.serviceId?.maDichVu || "---" }}
                  </span>
                </div>

                <div class="meta-row">
                  <span class="meta-label">Giá dịch vụ:</span>
                  <span class="meta-value price">
                    {{ formatCurrency(booking.serviceId?.price || 0) }}
                  </span>
                </div>

                <div class="meta-row">
                  <span class="meta-label">Ngày đặt:</span>
                  <span class="meta-value">
                    {{ formatDate(booking.bookingDate) }}
                  </span>
                </div>

                <div class="meta-row">
                  <span class="meta-label">Giờ đặt:</span>
                  <span class="meta-value">
                    {{ booking.bookingTime || "---" }}
                  </span>
                </div>

                <div class="meta-row">
                  <span class="meta-label">Người đặt:</span>
                  <span class="meta-value">
                    {{ booking.customerName || "---" }}
                  </span>
                </div>

                <div class="meta-row">
                  <span class="meta-label">Số điện thoại:</span>
                  <span class="meta-value">
                    {{ booking.customerPhone || "---" }}
                  </span>
                </div>
              </div>
            </div>

            <div v-if="booking.note" class="booking-note">
              <span class="note-label">Ghi chú:</span>
              <p>{{ booking.note }}</p>
            </div>

            <div class="booking-footer">
              <div class="created-at">
                Tạo lúc:
                <strong>{{ formatDateTime(booking.createdAt) }}</strong>
              </div>

              <div class="booking-actions">
                <button
                  v-if="booking.status === 'Chờ xác nhận'"
                  class="btn-action btn-cancel-custom"
                  @click="handleCancelBooking(booking)"
                  :disabled="cancelLoadingId === (booking._id || booking.id)"
                >
                  {{
                    cancelLoadingId === (booking._id || booking.id)
                      ? "Đang hủy..."
                      : "Hủy lịch"
                  }}
                </button>

                <router-link
                  to="/services"
                  class="btn-action btn-outline-custom"
                >
                  Đặt thêm dịch vụ
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <transition name="fade">
        <div v-if="successMessage" class="toast-success">
          {{ successMessage }}
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import ServiceBookingService from "@/services/serviceBooking.service";

export default {
  name: "ServiceBookingHistory",
  data() {
    return {
      bookings: [],
      loading: false,
      errorMessage: "",
      successMessage: "",
      cancelLoadingId: null,
      baseImageUrl: "http://localhost:3000",
      fallbackImage: "https://via.placeholder.com/160x160?text=Service",
    };
  },
  methods: {
    async loadBookings() {
      this.loading = true;
      this.errorMessage = "";

      try {
        const data = await ServiceBookingService.getMyBookings();
        this.bookings = Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Lỗi loadBookings:", error);
        this.errorMessage =
          error?.response?.data?.message ||
          "Không thể tải lịch sử đặt dịch vụ. Vui lòng thử lại.";
      } finally {
        this.loading = false;
      }
    },

    async handleCancelBooking(booking) {
      const bookingId = booking._id || booking.id;

      const confirmed = window.confirm(
        `Bạn có chắc muốn hủy lịch ${booking.maLichDat || ""} không?`
      );
      if (!confirmed) return;

      this.cancelLoadingId = bookingId;

      try {
        const response = await ServiceBookingService.cancelByCustomer(bookingId);

        const updatedBooking = response?.booking;
        if (updatedBooking?._id || updatedBooking?.id) {
          const updatedId = updatedBooking._id || updatedBooking.id;

          const index = this.bookings.findIndex(
            (item) => (item._id || item.id) === updatedId
          );

          if (index !== -1) {
            this.bookings.splice(index, 1, updatedBooking);
          } else {
            await this.loadBookings();
          }
        } else {
          await this.loadBookings();
        }

        this.showSuccess(response?.message || "Hủy lịch dịch vụ thành công!");
      } catch (error) {
        console.error("Lỗi handleCancelBooking:", error);
        alert(
          error?.response?.data?.message ||
            error?.message ||
            "Không thể hủy lịch dịch vụ. Vui lòng thử lại."
        );
      } finally {
        this.cancelLoadingId = null;
      }
    },

    formatCurrency(value) {
      return Number(value || 0).toLocaleString("vi-VN") + " đ";
    },

    formatDate(dateString) {
      if (!dateString) return "---";

      const date = new Date(dateString);
      if (Number.isNaN(date.getTime())) return dateString;

      return date.toLocaleDateString("vi-VN");
    },

    formatDateTime(dateString) {
      if (!dateString) return "---";

      const date = new Date(dateString);
      if (Number.isNaN(date.getTime())) return dateString;

      return date.toLocaleString("vi-VN");
    },

    getStatusClass(status) {
      switch (status) {
        case "Chờ xác nhận":
          return "status-pending";
        case "Đã xác nhận":
          return "status-confirmed";
        case "Hoàn thành":
          return "status-completed";
        case "Đã hủy":
          return "status-cancelled";
        default:
          return "";
      }
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
    this.loadBookings();
  },
};
</script>

<style scoped>
.service-booking-history-page {
  min-height: 100vh;
  background: #f8fafc;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding-left: 16px;
  padding-right: 16px;
}

.page-header {
  text-align: center;
}

.page-title {
  font-size: 30px;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 8px;
}

.page-subtitle {
  font-size: 15px;
  color: #6b7280;
  margin: 0;
}

.state-box {
  background: #ffffff;
  border-radius: 18px;
  padding: 48px 24px;
  text-align: center;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.error-box {
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #b91c1c;
}

.empty-box h3 {
  margin: 10px 0;
  font-size: 22px;
  color: #1f2937;
}

.empty-box p {
  color: #6b7280;
  margin-bottom: 18px;
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

.booking-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.booking-card {
  background: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.08);
  border: 1px solid #eef2f7;
}

.booking-card__top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  padding: 20px 22px 14px;
  border-bottom: 1px solid #f1f5f9;
}

.booking-code {
  margin: 0 0 6px;
  font-size: 14px;
  color: #64748b;
}

.booking-code span {
  font-weight: 700;
  color: #0f172a;
}

.service-name {
  margin: 0;
  font-size: 22px;
  color: #111827;
  font-weight: 800;
}

.status-badge {
  white-space: nowrap;
  padding: 9px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.status-confirmed {
  background: #dbeafe;
  color: #1d4ed8;
}

.status-completed {
  background: #dcfce7;
  color: #166534;
}

.status-cancelled {
  background: #fee2e2;
  color: #b91c1c;
}

.booking-card__body {
  padding: 22px;
}

.service-info {
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: 20px;
  align-items: start;
}

.service-image-wrap {
  width: 160px;
  height: 160px;
  border-radius: 18px;
  overflow: hidden;
  background: #f1f5f9;
}

.service-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.service-meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(220px, 1fr));
  gap: 12px 20px;
}

.meta-row {
  background: #f8fafc;
  border-radius: 14px;
  padding: 12px 14px;
}

.meta-label {
  display: block;
  font-size: 13px;
  color: #64748b;
  margin-bottom: 4px;
}

.meta-value {
  font-size: 15px;
  font-weight: 700;
  color: #111827;
}

.price {
  color: #dc2626;
}

.booking-note {
  margin-top: 18px;
  padding: 14px 16px;
  background: #fff7ed;
  border: 1px solid #fed7aa;
  border-radius: 14px;
}

.note-label {
  display: inline-block;
  font-weight: 700;
  margin-bottom: 6px;
  color: #9a3412;
}

.booking-note p {
  margin: 0;
  color: #7c2d12;
  line-height: 1.6;
}

.booking-footer {
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.created-at {
  font-size: 14px;
  color: #6b7280;
}

.booking-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-action {
  border: none;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 0 18px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 14px;
  transition: all 0.2s ease;
}

.btn-action:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.btn-primary-custom {
  background: #2563eb;
  color: #ffffff;
}

.btn-primary-custom:hover {
  background: #1d4ed8;
}

.btn-outline-custom {
  background: #ffffff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
}

.btn-outline-custom:hover {
  background: #eff6ff;
}

.btn-cancel-custom {
  background: #ef4444;
  color: #ffffff;
}

.btn-cancel-custom:hover {
  background: #dc2626;
}

.btn-retry {
  background: #2563eb;
  color: #fff;
  margin-top: 10px;
}

.toast-success {
  position: fixed;
  right: 20px;
  bottom: 20px;
  background: #16a34a;
  color: #ffffff;
  padding: 14px 18px;
  border-radius: 12px;
  box-shadow: 0 10px 24px rgba(22, 163, 74, 0.24);
  z-index: 9999;
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

@media (max-width: 768px) {
  .page-title {
    font-size: 24px;
  }

  .booking-card__top {
    flex-direction: column;
    align-items: flex-start;
  }

  .service-info {
    grid-template-columns: 1fr;
  }

  .service-image-wrap {
    width: 100%;
    height: 240px;
  }

  .service-meta {
    grid-template-columns: 1fr;
  }

  .booking-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .booking-actions {
    width: 100%;
  }

  .btn-action {
    width: 100%;
  }
}
</style>