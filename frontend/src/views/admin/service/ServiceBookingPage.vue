<template>
  <div class="service-booking-admin-page bg-light py-4" style="min-height: 100vh;">
    <div class="container-fluid px-2">
      <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
        <h4 class="font-weight-bold text-dark mb-0">
          <i class="fas fa-calendar-check mr-2 text-primary"></i>
          QUẢN LÝ LỊCH ĐẶT DỊCH VỤ
        </h4>

        <button class="btn btn-outline-primary btn-sm" @click="fetchBookings">
          <i class="fas fa-sync-alt mr-1"></i> Làm mới
        </button>
      </div>

      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body py-3">
          <div class="row align-items-center">
            <div class="col-md-4 mb-2 mb-md-0">
              <div class="input-group input-group-sm">
                <div class="input-group-prepend">
                  <span class="input-group-text bg-white">
                    <i class="fas fa-search text-primary"></i>
                  </span>
                </div>
                <input
                  type="text"
                  class="form-control"
                  placeholder="Tìm tên khách, SĐT, mã lịch..."
                  v-model="searchText"
                />
              </div>
            </div>

            <div class="col-md-8 text-md-right">
              <div class="btn-group flex-wrap">
                <button
                  class="btn btn-sm"
                  :class="statusFilter === 'Tất cả' ? 'btn-dark' : 'btn-light'"
                  @click="statusFilter = 'Tất cả'"
                >
                  Tất cả
                </button>
                <button
                  class="btn btn-sm"
                  :class="statusFilter === 'Chờ xác nhận' ? 'btn-warning text-dark' : 'btn-light'"
                  @click="statusFilter = 'Chờ xác nhận'"
                >
                  Chờ xác nhận
                </button>
                <button
                  class="btn btn-sm"
                  :class="statusFilter === 'Đã xác nhận' ? 'btn-primary text-white' : 'btn-light'"
                  @click="statusFilter = 'Đã xác nhận'"
                >
                  Đã xác nhận
                </button>
                <button
                  class="btn btn-sm"
                  :class="statusFilter === 'Hoàn thành' ? 'btn-success text-white' : 'btn-light'"
                  @click="statusFilter = 'Hoàn thành'"
                >
                  Hoàn thành
                </button>
                <button
                  class="btn btn-sm"
                  :class="statusFilter === 'Đã hủy' ? 'btn-danger text-white' : 'btn-light'"
                  @click="statusFilter = 'Đã hủy'"
                >
                  Đã hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card border-0 shadow-sm" v-if="filteredBookings.length > 0">
        <div class="table-responsive">
          <table class="table table-hover align-middle text-center mb-0">
            <thead class="bg-light">
              <tr class="small text-secondary">
                <th class="py-3">Mã lịch</th>
                <th class="py-3">Khách hàng</th>
                <th class="py-3">Dịch vụ</th>
                <th class="py-3">Ngày hẹn</th>
                <th class="py-3">Giờ hẹn</th>
                <th class="py-3">Giá</th>
                <th class="py-3">Trạng thái</th>
                <th class="py-3">Thao tác</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="item in filteredBookings" :key="item._id || item.id">
                <td class="font-weight-bold text-primary">
                  {{ item.maLichDat || "---" }}
                </td>

                <td class="text-left">
                  <div class="font-weight-bold text-dark">
                    {{ item.customerName || "---" }}
                  </div>
                  <div class="small text-muted">
                    <i class="fas fa-phone mr-1"></i>{{ item.customerPhone || "---" }}
                  </div>
                </td>

                <td class="text-left">
                  <div class="font-weight-bold text-dark">
                    {{ item.serviceId?.name || "---" }}
                  </div>
                  <div class="small text-muted">
                    {{ item.serviceId?.maDichVu || "---" }}
                  </div>
                </td>

                <td>
                  {{ formatDateOnly(item.bookingDate) }}
                </td>

                <td>
                  {{ item.bookingTime || "---" }}
                </td>

                <td class="text-danger font-weight-bold">
                  {{ formatCurrency(item.serviceId?.price) }}
                </td>

                <td>
                  <span class="badge px-3 py-2" :class="getStatusClass(item.status)">
                    {{ item.status }}
                  </span>
                </td>

                <td>
                  <div v-if="item.status === 'Chờ xác nhận'" class="btn-group">
                    <button
                      class="btn btn-sm btn-primary"
                      @click="updateStatus(item._id || item.id, 'Đã xác nhận')"
                    >
                      Xác nhận
                    </button>
                    <button
                      class="btn btn-sm btn-outline-danger ml-1"
                      @click="updateStatus(item._id || item.id, 'Đã hủy')"
                    >
                      Hủy
                    </button>
                  </div>

                  <div v-else-if="item.status === 'Đã xác nhận'">
                    <button
                      class="btn btn-sm btn-success"
                      @click="updateStatus(item._id || item.id, 'Hoàn thành')"
                    >
                      Hoàn thành
                    </button>
                  </div>

                  <div v-else class="text-muted small font-italic font-weight-bold">
                    Đã đóng
                  </div>

                  <button
                    class="btn btn-sm btn-outline-secondary mt-2"
                    @click="openDetailModal(item)"
                  >
                    <i class="fas fa-eye mr-1"></i> Xem
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-else class="card border-0 shadow-sm">
        <div class="card-body text-center py-5 text-muted">
          <i class="fas fa-calendar-times fa-3x mb-3 d-block"></i>
          Chưa có lịch đặt dịch vụ nào phù hợp.
        </div>
      </div>

      <!-- Modal chi tiết -->
      <div
        v-if="selectedBooking"
        class="modal fade show d-block"
        tabindex="-1"
        style="background: rgba(0,0,0,0.45);"
      >
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content border-0 shadow">
            <div class="modal-header bg-dark text-white">
              <h5 class="modal-title mb-0">
                <i class="fas fa-calendar-check mr-2"></i>Chi tiết lịch đặt dịch vụ
              </h5>
              <button type="button" class="close text-white" @click="closeDetailModal">
                <span>&times;</span>
              </button>
            </div>

            <div class="modal-body">
              <p><strong>Mã lịch:</strong> {{ selectedBooking.maLichDat || "---" }}</p>
              <p><strong>Khách hàng:</strong> {{ selectedBooking.customerName || "---" }}</p>
              <p><strong>Số điện thoại:</strong> {{ selectedBooking.customerPhone || "---" }}</p>
              <p><strong>Dịch vụ:</strong> {{ selectedBooking.serviceId?.name || "---" }}</p>
              <p><strong>Mã dịch vụ:</strong> {{ selectedBooking.serviceId?.maDichVu || "---" }}</p>
              <p><strong>Ngày hẹn:</strong> {{ formatDateOnly(selectedBooking.bookingDate) }}</p>
              <p><strong>Giờ hẹn:</strong> {{ selectedBooking.bookingTime || "---" }}</p>
              <p><strong>Giá dịch vụ:</strong> {{ formatCurrency(selectedBooking.serviceId?.price) }}</p>
              <p><strong>Trạng thái:</strong> {{ selectedBooking.status || "---" }}</p>
              <p><strong>Ghi chú:</strong> {{ selectedBooking.note || "---" }}</p>
              <p><strong>Ngày tạo:</strong> {{ formatDateTime(selectedBooking.createdAt) }}</p>
            </div>

            <div class="modal-footer">
              <button class="btn btn-secondary" @click="closeDetailModal">Đóng</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import ServiceBookingService from "@/services/serviceBooking.service";

export default {
  data() {
    return {
      bookings: [],
      searchText: "",
      statusFilter: "Tất cả",
      selectedBooking: null,
    };
  },

  computed: {
    filteredBookings() {
      return this.bookings.filter((item) => {
        const keyword = (this.searchText || "").toLowerCase();

        const bookingCode = item.maLichDat ? item.maLichDat.toLowerCase() : "";
        const customerName = item.customerName ? item.customerName.toLowerCase() : "";
        const customerPhone = item.customerPhone || "";

        const matchSearch =
          bookingCode.includes(keyword) ||
          customerName.includes(keyword) ||
          customerPhone.includes(keyword);

        const matchStatus =
          this.statusFilter === "Tất cả" || item.status === this.statusFilter;

        return matchSearch && matchStatus;
      });
    },
  },

  methods: {
    async fetchBookings() {
      try {
        this.bookings = await ServiceBookingService.getAll();
      } catch (error) {
        console.error("Lỗi tải danh sách lịch đặt dịch vụ:", error);
        alert("Không thể tải danh sách lịch đặt dịch vụ.");
      }
    },

    async updateStatus(id, status) {
      if (!confirm(`Bạn xác nhận chuyển lịch đặt này sang trạng thái [${status}]?`)) return;

      try {
        await ServiceBookingService.updateStatus(id, status);
        await this.fetchBookings();
      } catch (error) {
        console.error("Lỗi cập nhật trạng thái lịch:", error);
        alert("Lỗi cập nhật trạng thái: " + (error.response?.data?.message || error.message));
      }
    },

    openDetailModal(item) {
      this.selectedBooking = JSON.parse(JSON.stringify(item));
    },

    closeDetailModal() {
      this.selectedBooking = null;
    },

    formatCurrency(value) {
      if (value === null || value === undefined) return "---";
      return Number(value).toLocaleString("vi-VN") + " ₫";
    },

    formatDateOnly(date) {
      if (!date) return "---";
      return new Date(date).toLocaleDateString("vi-VN");
    },

    formatDateTime(date) {
      if (!date) return "---";
      return new Date(date).toLocaleString("vi-VN");
    },

    getStatusClass(status) {
      if (status === "Chờ xác nhận") return "badge-warning text-dark";
      if (status === "Đã xác nhận") return "badge-primary";
      if (status === "Hoàn thành") return "badge-success";
      if (status === "Đã hủy") return "badge-danger";
      return "badge-light border";
    },
  },

  mounted() {
    this.fetchBookings();
  },
};
</script>

<style scoped>
.table td,
.table th {
  vertical-align: middle;
}

.modal {
  overflow-y: auto;
}
</style>