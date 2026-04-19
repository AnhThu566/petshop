<template>
  <div class="service-booking-admin-page">
    <div class="page-header">
      <div>
        <h2>Quản lý lịch đặt dịch vụ</h2>
        <p>Theo dõi và xử lý các lịch đặt dịch vụ của khách hàng.</p>
      </div>

      <div class="header-actions">
        <button class="btn-primary" @click="loadBookings" :disabled="loading">
          Làm mới
        </button>

        <router-link to="/admin/services" class="btn-secondary">
          Quản lý dịch vụ
        </router-link>
      </div>
    </div>

    <div class="summary-row">
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

    <div class="toolbar">
      <input
        v-model.trim="keyword"
        type="text"
        class="search-input"
        placeholder="Tìm theo mã lịch, tên khách, số điện thoại, tên dịch vụ..."
      />

      <select v-model="statusFilter" class="filter-select">
        <option value="">Tất cả trạng thái</option>
        <option value="Chờ xác nhận">Chờ xác nhận</option>
        <option value="Đã xác nhận">Đã xác nhận</option>
        <option value="Hoàn thành">Hoàn thành</option>
        <option value="Đã hủy">Đã hủy</option>
      </select>
    </div>

    <div v-if="loading" class="state-box">
      <div class="spinner"></div>
      <p>Đang tải danh sách lịch đặt...</p>
    </div>

    <div v-else-if="errorMessage" class="state-box error-box">
      <p>{{ errorMessage }}</p>
      <button class="btn-primary" @click="loadBookings">Tải lại</button>
    </div>

    <div v-else class="table-card">
      <table class="booking-table">
        <thead>
          <tr>
            <th>Mã lịch</th>
            <th>Dịch vụ</th>
            <th>Khách hàng</th>
            <th>Ngày</th>
            <th>Giờ</th>
            <th>Ghi chú</th>
            <th>Ngày tạo</th>
            <th>TT dịch vụ</th>
            <th>TT lịch</th>
            <th class="text-center">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredBookings.length === 0">
            <td colspan="10" class="empty-row">Không có lịch đặt phù hợp.</td>
          </tr>

          <tr
            v-for="booking in filteredBookings"
            :key="booking._id || booking.id"
          >
            <td>{{ booking.maLichDat || "---" }}</td>

            <td>
              <div class="service-cell">
                <strong>{{ booking.serviceId?.name || "---" }}</strong>
                <small>{{ booking.serviceId?.maDichVu || "" }}</small>
              </div>
            </td>

            <td>
              <div class="customer-cell">
                <strong>{{ booking.customerName || "---" }}</strong>
                <small>{{ booking.customerPhone || "---" }}</small>
              </div>
            </td>

            <td>{{ formatDate(booking.bookingDate) }}</td>
            <td>{{ booking.bookingTime || "---" }}</td>
            <td>{{ truncateText(booking.note, 60) }}</td>
            <td>{{ formatDateTime(booking.createdAt) }}</td>

            <td>
              <span class="status-badge" :class="getServiceStatusClass(booking.serviceId?.status)">
                {{ booking.serviceId?.status || "Không xác định" }}
              </span>
            </td>

            <td>
              <span class="status-badge" :class="getStatusClass(booking.status)">
                {{ booking.status }}
              </span>
            </td>

            <td class="text-center">
              <div class="action-group">
                <button
                  v-if="booking.status === 'Chờ xác nhận'"
                  class="btn-confirm"
                  @click="updateBookingStatus(booking, 'Đã xác nhận')"
                >
                  Xác nhận
                </button>

                <button
                  v-if="booking.status === 'Chờ xác nhận' || booking.status === 'Đã xác nhận'"
                  class="btn-cancel"
                  @click="updateBookingStatus(booking, 'Đã hủy')"
                >
                  Hủy
                </button>

                <button
                  v-if="booking.status === 'Đã xác nhận'"
                  class="btn-complete"
                  @click="updateBookingStatus(booking, 'Hoàn thành')"
                >
                  Hoàn thành
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <transition name="fade">
      <div v-if="successMessage" class="toast-success">
        {{ successMessage }}
      </div>
    </transition>
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
          String(booking.maLichDat || "").toLowerCase().includes(kw) ||
          String(booking.customerName || "").toLowerCase().includes(kw) ||
          String(booking.customerPhone || "").toLowerCase().includes(kw) ||
          String(booking.serviceId?.name || "").toLowerCase().includes(kw) ||
          String(booking.serviceId?.maDichVu || "").toLowerCase().includes(kw);

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
        `Bạn có chắc muốn chuyển lịch ${booking.maLichDat || ""} sang trạng thái "${nextStatus}" không?`
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
.service-booking-admin-page {
  padding: 24px;
  background: #f8fafc;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.page-header h2 {
  margin: 0 0 6px;
  font-size: 28px;
  color: #0f172a;
}

.page-header p {
  margin: 0;
  color: #64748b;
}

.header-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.summary-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 18px;
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

.toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.search-input,
.filter-select {
  height: 44px;
  border-radius: 12px;
  border: 1px solid #dbe2ea;
  padding: 0 14px;
  outline: none;
  background: #fff;
}

.search-input {
  width: 100%;
  max-width: 420px;
}

.filter-select {
  min-width: 220px;
}

.table-card {
  background: #fff;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
}

.booking-table {
  width: 100%;
  border-collapse: collapse;
}

.booking-table th,
.booking-table td {
  padding: 14px 12px;
  border-bottom: 1px solid #eef2f7;
  text-align: left;
  vertical-align: middle;
}

.booking-table th {
  background: #f8fafc;
  color: #334155;
  font-size: 14px;
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

.status-badge {
  display: inline-block;
  padding: 7px 12px;
  border-radius: 999px;
  font-size: 12px;
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

.status-service-active {
  background: #e0f2fe;
  color: #0369a1;
}

.status-service-inactive {
  background: #f1f5f9;
  color: #475569;
}

.action-group {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary,
.btn-confirm,
.btn-cancel,
.btn-complete {
  border: none;
  cursor: pointer;
  min-height: 40px;
  padding: 0 14px;
  border-radius: 10px;
  font-weight: 700;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background: #2563eb;
  color: #fff;
}

.btn-secondary {
  background: #eff6ff;
  color: #2563eb;
}

.btn-confirm {
  background: #2563eb;
  color: #fff;
}

.btn-cancel {
  background: #ef4444;
  color: #fff;
}

.btn-complete {
  background: #16a34a;
  color: #fff;
}

.text-center {
  text-align: center;
}

.state-box {
  background: #fff;
  border-radius: 18px;
  padding: 46px 20px;
  text-align: center;
}

.error-box {
  background: #fef2f2;
  color: #b91c1c;
}

.empty-row {
  text-align: center;
  color: #64748b;
  padding: 28px 12px !important;
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

@media (max-width: 1100px) {
  .table-card {
    overflow-x: auto;
  }

  .booking-table {
    min-width: 1350px;
  }

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