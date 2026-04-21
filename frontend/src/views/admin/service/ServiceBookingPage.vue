<template>
  <div class="service-booking-admin-page bg-light py-4" style="min-height: 100vh;">
    <div class="container-fluid px-2">
      <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3 flex-wrap">
        <div>
          <h4 class="font-weight-bold text-dark mb-1">
            <i class="fas fa-calendar-check mr-2 text-primary"></i>
            QUẢN LÝ LỊCH ĐẶT DỊCH VỤ
          </h4>
          <div class="small text-muted">
            Theo dõi và xử lý các lịch đặt dịch vụ của khách hàng.
          </div>
        </div>

        <div class="d-flex flex-wrap mt-2 mt-md-0">
          <button class="btn btn-primary btn-sm mr-2 mb-2 mb-md-0" @click="loadBookings" :disabled="loading">
            <i class="fas fa-sync-alt mr-1"></i> Làm mới
          </button>

          <router-link to="/admin/services" class="btn btn-outline-primary btn-sm">
            <i class="fas fa-concierge-bell mr-1"></i> Quản lý dịch vụ
          </router-link>
        </div>
      </div>

      <div class="summary-row mb-4">
        <div class="summary-box summary-pending">
          <div class="summary-value">{{ countByStatus("Chờ xác nhận") }}</div>
          <div class="summary-label">Chờ xác nhận</div>
        </div>

        <div class="summary-box summary-confirmed">
          <div class="summary-value">{{ countByStatus("Đã xác nhận") }}</div>
          <div class="summary-label">Đã xác nhận</div>
        </div>

        <div class="summary-box summary-completed">
          <div class="summary-value">{{ countByStatus("Hoàn thành") }}</div>
          <div class="summary-label">Hoàn thành</div>
        </div>

        <div class="summary-box summary-cancelled">
          <div class="summary-value">{{ countByStatus("Đã hủy") }}</div>
          <div class="summary-label">Đã hủy</div>
        </div>
      </div>

      <div class="row mb-3 align-items-center">
        <div class="col-lg-6 col-md-12 mb-2 mb-lg-0">
          <div class="input-group input-group-sm shadow-sm">
            <div class="input-group-prepend">
              <span class="input-group-text bg-white text-primary border-right-0">
                <i class="fas fa-search"></i>
              </span>
            </div>
            <input
              v-model.trim="keyword"
              type="text"
              class="form-control border-left-0"
              placeholder="Tìm theo mã lịch, tên khách, số điện thoại, tên dịch vụ..."
            />
          </div>
        </div>

        <div class="col-lg-3 col-md-6 mb-2 mb-lg-0">
          <select v-model="statusFilter" class="form-control form-control-sm shadow-sm">
            <option value="">Tất cả trạng thái</option>
            <option value="Chờ xác nhận">Chờ xác nhận</option>
            <option value="Đã xác nhận">Đã xác nhận</option>
            <option value="Hoàn thành">Hoàn thành</option>
            <option value="Đã hủy">Đã hủy</option>
          </select>
        </div>

        <div class="col-lg-3 col-md-6 text-md-right">
          <div class="small text-muted font-weight-bold">
            Tổng: {{ filteredBookings.length }} lịch
          </div>
        </div>
      </div>

      <div v-if="loading" class="card border-0 shadow-sm">
        <div class="card-body text-center py-5 text-muted">
          <i class="fas fa-spinner fa-spin fa-3x mb-3 d-block"></i>
          Đang tải danh sách lịch đặt...
        </div>
      </div>

      <div v-else-if="errorMessage" class="card border-0 shadow-sm">
        <div class="card-body text-center py-5 text-danger">
          <i class="fas fa-exclamation-circle fa-3x mb-3 d-block opacity-75"></i>
          <p class="mb-3">{{ errorMessage }}</p>
          <button class="btn btn-primary btn-sm" @click="loadBookings">Tải lại</button>
        </div>
      </div>

      <div v-else class="card border-0 shadow-sm">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0 booking-table">
            <thead class="bg-light">
              <tr class="small text-secondary">
                <th class="py-3 text-center col-code">Mã lịch</th>
                <th class="py-3 text-left col-service">Dịch vụ</th>
                <th class="py-3 text-left col-customer">Khách hàng</th>
                <th class="py-3 text-center col-date">Ngày</th>
                <th class="py-3 text-center col-time">Giờ</th>
                <th class="py-3 text-left col-note">Ghi chú</th>
                <th class="py-3 text-center col-created">Ngày tạo</th>
                <th class="py-3 text-center col-service-status">TT dịch vụ</th>
                <th class="py-3 text-center col-booking-status">TT lịch</th>
                <th class="py-3 text-center col-action">Thao tác</th>
              </tr>
            </thead>

            <tbody>
              <tr v-if="filteredBookings.length === 0">
                <td colspan="10" class="py-5 text-center text-muted">
                  <i class="fas fa-folder-open fa-2x mb-3 d-block"></i>
                  Không có lịch đặt phù hợp.
                </td>
              </tr>

              <tr
                v-for="booking in filteredBookings"
                :key="booking._id || booking.id"
              >
                <td class="text-center font-weight-bold text-primary">
                  {{ booking.bookingCode || "---" }}
                </td>

                <td class="text-left">
                  <div class="service-cell">
                    <strong class="text-dark">{{ booking.serviceId?.name || "---" }}</strong>
                    <small>{{ booking.serviceId?.serviceCode || "" }}</small>
                  </div>
                </td>

                <td class="text-left">
                  <div class="customer-cell">
                    <strong class="text-dark">{{ booking.customerName || "---" }}</strong>
                    <small>{{ booking.customerPhone || "---" }}</small>
                  </div>
                </td>

                <td class="text-center">{{ formatDate(booking.bookingDate) }}</td>
                <td class="text-center">{{ booking.bookingTime || "---" }}</td>
                <td class="text-left text-truncate-cell" :title="booking.note || '---'">
                  {{ truncateText(booking.note, 60) }}
                </td>
                <td class="text-center">{{ formatDateTime(booking.createdAt) }}</td>

                <td class="text-center">
                  <span class="status-badge" :class="getServiceStatusClass(booking.serviceId?.status)">
                    {{ booking.serviceId?.status || "Không xác định" }}
                  </span>
                </td>

                <td class="text-center">
                  <span class="status-badge" :class="getStatusClass(booking.status)">
                    {{ booking.status }}
                  </span>
                </td>

                <td class="text-center">
                  <div class="d-flex justify-content-center flex-wrap">
                    <button
                      v-if="booking.status === 'Chờ xác nhận'"
                      class="btn btn-sm btn-primary mr-1 mb-1"
                      @click="updateBookingStatus(booking, 'Đã xác nhận')"
                    >
                      Xác nhận
                    </button>

                    <button
                      v-if="booking.status === 'Chờ xác nhận' || booking.status === 'Đã xác nhận'"
                      class="btn btn-sm btn-outline-danger mr-1 mb-1"
                      @click="updateBookingStatus(booking, 'Đã hủy')"
                    >
                      Hủy
                    </button>

                    <button
                      v-if="booking.status === 'Đã xác nhận'"
                      class="btn btn-sm btn-success mb-1"
                      @click="updateBookingStatus(booking, 'Hoàn thành')"
                    >
                      Hoàn thành
                    </button>

                    <div
                      v-if="booking.status === 'Hoàn thành' || booking.status === 'Đã hủy'"
                      class="text-muted small font-italic px-2 py-1"
                    >
                      Đã đóng
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
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
  name: "ServiceBookingPage",
  data() {
    return {
      bookings: [],
      keyword: "",
      statusFilter: "",
      loading: false,
      errorMessage: "",
      successMessage: "",
    };
  },

  computed: {
    filteredBookings() {
      const kw = this.keyword.toLowerCase();

      return this.bookings.filter((booking) => {
        const matchesKeyword =
          String(booking.bookingCode || "").toLowerCase().includes(kw) ||
          String(booking.customerName || "").toLowerCase().includes(kw) ||
          String(booking.customerPhone || "").toLowerCase().includes(kw) ||
          String(booking.serviceId?.name || "").toLowerCase().includes(kw) ||
          String(booking.serviceId?.serviceCode || "").toLowerCase().includes(kw);

        const matchesStatus = this.statusFilter
          ? booking.status === this.statusFilter
          : true;

        return matchesKeyword && matchesStatus;
      });
    },
  },

  methods: {
    countByStatus(status) {
      return this.bookings.filter((booking) => booking.status === status).length;
    },

    async loadBookings() {
      this.loading = true;
      this.errorMessage = "";

      try {
        const params = this.statusFilter ? { status: this.statusFilter } : {};
        const data = await ServiceBookingService.getAll(params);
        this.bookings = Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Lỗi loadBookings:", error);
        this.errorMessage =
          error?.response?.data?.message ||
          "Không thể tải danh sách lịch đặt dịch vụ.";
      } finally {
        this.loading = false;
      }
    },

    async updateBookingStatus(booking, nextStatus) {
      const confirmed = window.confirm(
        `Bạn có chắc muốn chuyển lịch ${booking.bookingCode || ""} sang trạng thái "${nextStatus}" không?`
      );
      if (!confirmed) return;

      try {
        const bookingId = booking._id || booking.id;
        const response = await ServiceBookingService.updateStatus(
          bookingId,
          nextStatus
        );

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

        this.showSuccess(
          response?.message || "Cập nhật trạng thái lịch đặt thành công!"
        );
      } catch (error) {
        console.error("Lỗi updateBookingStatus:", error);
        alert(
          error?.response?.data?.message ||
            error?.message ||
            "Không thể cập nhật trạng thái lịch đặt."
        );
      }
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

    truncateText(text, maxLength = 60) {
      const content = String(text || "").trim();
      if (!content) return "---";
      if (content.length <= maxLength) return content;
      return content.slice(0, maxLength) + "...";
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

    getServiceStatusClass(status) {
      if (status === "Đang hoạt động") return "status-service-active";
      return "status-service-inactive";
    },

    showSuccess(message) {
      this.successMessage = message;
      setTimeout(() => {
        this.successMessage = "";
      }, 2500);
    },
  },

  watch: {
    statusFilter() {
      this.loadBookings();
    },
  },

  mounted() {
    this.loadBookings();
  },
};
</script>

<style scoped>
.summary-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.summary-box {
  border-radius: 14px;
  padding: 14px 16px;
  color: #fff;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.summary-value {
  font-size: 1.5rem;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 6px;
}

.summary-label {
  font-size: 0.9rem;
  font-weight: 600;
}

.summary-pending {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.summary-confirmed {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
}

.summary-completed {
  background: linear-gradient(135deg, #16a34a, #15803d);
}

.summary-cancelled {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.booking-table {
  min-width: 1380px;
}

.booking-table th,
.booking-table td {
  font-size: 0.95rem;
  vertical-align: middle;
}

.booking-table thead th {
  font-weight: 700;
  white-space: nowrap;
}

.col-code {
  width: 130px;
}

.col-service {
  width: 220px;
}

.col-customer {
  width: 220px;
}

.col-date {
  width: 120px;
}

.col-time {
  width: 90px;
}

.col-note {
  width: 240px;
}

.col-created {
  width: 150px;
}

.col-service-status {
  width: 150px;
}

.col-booking-status {
  width: 130px;
}

.col-action {
  width: 180px;
}

.service-cell,
.customer-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.service-cell small,
.customer-cell small {
  color: #64748b;
}

.text-truncate-cell {
  max-width: 240px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-badge {
  display: inline-block;
  padding: 7px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
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

.status-service-active {
  background: #e0f2fe;
  color: #0369a1;
}

.status-service-inactive {
  background: #f1f5f9;
  color: #475569;
}

.toast-success {
  position: fixed;
  right: 20px;
  bottom: 20px;
  background: #16a34a;
  color: #fff;
  padding: 14px 18px;
  border-radius: 12px;
  font-weight: 700;
  box-shadow: 0 10px 24px rgba(22, 163, 74, 0.24);
  z-index: 2000;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 1100px) {
  .summary-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 575.98px) {
  .summary-row {
    grid-template-columns: 1fr;
  }
}
</style>