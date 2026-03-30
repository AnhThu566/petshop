<template>
  <div class="service-booking-history-page bg-light py-5" style="min-height: 100vh;">
    <div class="container">
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap">
        <h3 class="font-weight-bold text-dark mb-2">
          <i class="fas fa-calendar-check text-primary mr-2"></i>
          LỊCH SỬ ĐẶT DỊCH VỤ
        </h3>

        <button class="btn btn-outline-primary btn-sm" @click="fetchBookings">
          <i class="fas fa-sync-alt mr-1"></i> Làm mới
        </button>
      </div>

      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body py-3">
          <div class="row align-items-center">
            <div class="col-md-6 mb-2 mb-md-0">
              <div class="input-group input-group-sm">
                <div class="input-group-prepend">
                  <span class="input-group-text bg-white">
                    <i class="fas fa-search text-primary"></i>
                  </span>
                </div>
                <input
                  type="text"
                  class="form-control"
                  placeholder="Tìm mã lịch hoặc tên dịch vụ..."
                  v-model="searchText"
                />
              </div>
            </div>

            <div class="col-md-6 text-md-right">
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

      <div v-if="loading" class="text-center py-5 text-muted">
        <i class="fas fa-spinner fa-spin fa-2x mb-3 d-block"></i>
        Đang tải lịch sử đặt dịch vụ...
      </div>

      <div v-else-if="filteredBookings.length === 0" class="card border-0 shadow-sm">
        <div class="card-body text-center py-5 text-muted">
          <i class="fas fa-calendar-times fa-3x mb-3 d-block"></i>
          Bạn chưa có lịch đặt dịch vụ nào.
        </div>
      </div>

      <div v-else class="row">
        <div
          class="col-lg-6 mb-4"
          v-for="item in filteredBookings"
          :key="getBookingId(item)"
        >
          <div class="card border-0 shadow-sm h-100 booking-card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <div class="small text-muted">Mã lịch</div>
                  <div class="font-weight-bold text-primary">
                    {{ item.maLichDat || getShortBookingCode(getBookingId(item)) }}
                  </div>
                </div>

                <div class="text-right">
                  <span class="badge px-3 py-2" :class="getStatusClass(item.status)">
                    {{ item.status }}
                  </span>
                </div>
              </div>

              <div class="d-flex align-items-center mb-3">
                <img
                  :src="getServiceImage(item.serviceId)"
                  alt="service"
                  class="rounded shadow-sm mr-3"
                  style="width: 90px; height: 90px; object-fit: cover;"
                />
                <div>
                  <h5 class="mb-1 font-weight-bold text-dark">
                    {{ item.serviceId?.name || "Dịch vụ" }}
                  </h5>
                  <p class="mb-1 text-muted small">
                    Mã dịch vụ: {{ item.serviceId?.maDichVu || "---" }}
                  </p>
                  <p class="mb-0 text-danger font-weight-bold">
                    {{ formatCurrency(item.serviceId?.price) }}
                  </p>
                </div>
              </div>

              <div class="border rounded p-3 bg-light mb-3">
                <div class="row">
                  <div class="col-6 mb-2">
                    <div class="small text-muted">Ngày hẹn</div>
                    <div class="font-weight-bold">{{ formatDateOnly(item.bookingDate) }}</div>
                  </div>

                  <div class="col-6 mb-2">
                    <div class="small text-muted">Giờ hẹn</div>
                    <div class="font-weight-bold">{{ item.bookingTime || "---" }}</div>
                  </div>

                  <div class="col-12 mb-2">
                    <div class="small text-muted">Ghi chú</div>
                    <div class="font-weight-bold">{{ item.note || "Không có" }}</div>
                  </div>
                </div>
              </div>

              <div class="d-flex justify-content-between align-items-center flex-wrap">
                <div class="small text-muted mb-2 mb-md-0">
                  <i class="fas fa-info-circle mr-1"></i>
                  {{ getBookingMessage(item.status) }}
                </div>

                <div class="d-flex flex-wrap">
                  <button
                    v-if="item.status === 'Chờ xác nhận'"
                    class="btn btn-outline-danger btn-sm mr-2 mb-2"
                    @click="cancelBooking(item)"
                  >
                    <i class="fas fa-times mr-1"></i> Hủy lịch
                  </button>

                  <button
                    v-if="canBookAgain(item)"
                    class="btn btn-outline-success btn-sm mr-2 mb-2"
                    @click="bookAgain(item)"
                  >
                    <i class="fas fa-redo-alt mr-1"></i> Đặt lại
                  </button>

                  <button
                    class="btn btn-outline-primary btn-sm mb-2"
                    @click="openDetail(item)"
                  >
                    <i class="fas fa-eye mr-1"></i> Xem chi tiết
                  </button>
                </div>
              </div>
            </div>
          </div>
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
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title mb-0">
                <i class="fas fa-calendar-check mr-2"></i>Chi tiết lịch đặt dịch vụ
              </h5>
              <button type="button" class="close text-white" @click="closeDetail">
                <span>&times;</span>
              </button>
            </div>

            <div class="modal-body">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <h6 class="font-weight-bold text-primary">Thông tin lịch đặt</h6>
                  <p class="mb-1"><strong>Mã lịch:</strong> {{ selectedBooking.maLichDat || getShortBookingCode(getBookingId(selectedBooking)) }}</p>
                  <p class="mb-1"><strong>Ngày hẹn:</strong> {{ formatDateOnly(selectedBooking.bookingDate) }}</p>
                  <p class="mb-1"><strong>Giờ hẹn:</strong> {{ selectedBooking.bookingTime || "---" }}</p>
                  <p class="mb-1"><strong>Trạng thái:</strong> {{ selectedBooking.status || "---" }}</p>
                  <p class="mb-1"><strong>Ghi chú:</strong> {{ selectedBooking.note || "Không có" }}</p>
                </div>

                <div class="col-md-6 mb-3">
                  <h6 class="font-weight-bold text-success">Thông tin dịch vụ</h6>
                  <p class="mb-1"><strong>Tên dịch vụ:</strong> {{ selectedBooking.serviceId?.name || "---" }}</p>
                  <p class="mb-1"><strong>Mã dịch vụ:</strong> {{ selectedBooking.serviceId?.maDichVu || "---" }}</p>
                  <p class="mb-1"><strong>Giá:</strong> {{ formatCurrency(selectedBooking.serviceId?.price) }}</p>
                  <p class="mb-1"><strong>Trạng thái dịch vụ:</strong> {{ selectedBooking.serviceId?.status || "---" }}</p>
                </div>

                <div class="col-12">
                  <hr>
                  <div class="d-flex align-items-center">
                    <img
                      :src="getServiceImage(selectedBooking.serviceId)"
                      alt="service"
                      class="rounded shadow-sm mr-3"
                      style="width: 100px; height: 100px; object-fit: cover;"
                    />
                    <div>
                      <p class="mb-1"><strong>Ngày tạo lịch:</strong> {{ formatDateTime(selectedBooking.createdAt) }}</p>
                      <p class="mb-0 text-muted">
                        Hệ thống sẽ cập nhật trạng thái lịch hẹn của bạn theo quá trình xử lý.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button
                v-if="canBookAgain(selectedBooking)"
                class="btn btn-success"
                @click="bookAgain(selectedBooking)"
              >
                <i class="fas fa-redo-alt mr-1"></i> Đặt lại
              </button>
              <button class="btn btn-secondary" @click="closeDetail">Đóng</button>
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
      currentUser: null,
      searchText: "",
      statusFilter: "Tất cả",
      loading: false,
      selectedBooking: null,
    };
  },

  computed: {
    filteredBookings() {
      return this.bookings.filter((item) => {
        const keyword = (this.searchText || "").toLowerCase();
        const code = (item.maLichDat || this.getShortBookingCode(this.getBookingId(item)) || "").toLowerCase();
        const serviceName = item.serviceId?.name ? item.serviceId.name.toLowerCase() : "";

        const matchSearch = code.includes(keyword) || serviceName.includes(keyword);
        const matchStatus =
          this.statusFilter === "Tất cả" || item.status === this.statusFilter;

        return matchSearch && matchStatus;
      });
    },
  },

  methods: {
    getBookingId(item) {
      return item?._id || item?.id || "";
    },

    getShortBookingCode(id) {
      if (!id) return "------";
      return String(id).substring(String(id).length - 6).toUpperCase();
    },

    async fetchBookings() {
      try {
        if (!this.currentUser) return;

        this.loading = true;
        const userId = this.currentUser._id || this.currentUser.id;
        this.bookings = await ServiceBookingService.getByUserId(userId);
      } catch (error) {
        console.error("Lỗi tải lịch sử đặt dịch vụ:", error);
        alert("Không thể tải lịch sử đặt dịch vụ của bạn.");
      } finally {
        this.loading = false;
      }
    },

    openDetail(item) {
      this.selectedBooking = item;
    },

    closeDetail() {
      this.selectedBooking = null;
    },

    canBookAgain(item) {
      if (!item) return false;
      return item.status === "Đã hủy" || item.status === "Hoàn thành";
    },

    bookAgain(item) {
      const serviceId = item.serviceId?._id || item.serviceId?.id || item.serviceId;
      if (!serviceId) {
        alert("Không tìm thấy dịch vụ để đặt lại.");
        return;
      }

      this.closeDetail();
      this.$router.push(`/services/${serviceId}`);
    },

    async cancelBooking(item) {
      const bookingId = this.getBookingId(item);
      if (!bookingId) {
        alert("Không tìm thấy mã lịch hợp lệ.");
        return;
      }

      if (!confirm(`Bạn có chắc muốn hủy lịch [${item.maLichDat || this.getShortBookingCode(bookingId)}] không?`)) {
        return;
      }

      try {
        await ServiceBookingService.cancelByCustomer(bookingId);
        alert("✅ Hủy lịch dịch vụ thành công!");
        await this.fetchBookings();

        if (this.selectedBooking && this.getBookingId(this.selectedBooking) === bookingId) {
          this.selectedBooking = null;
        }
      } catch (error) {
        alert(
          "❌ Không thể hủy lịch: " +
            (error.response?.data?.message || error.message)
        );
      }
    },

    getServiceImage(service) {
      if (service?.image) return "http://localhost:3000" + service.image;
      return "https://via.placeholder.com/100";
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

    getBookingMessage(status) {
      if (status === "Chờ xác nhận") {
        return "Lịch hẹn của bạn đang chờ hệ thống xác nhận.";
      }
      if (status === "Đã xác nhận") {
        return "Lịch hẹn đã được xác nhận. Vui lòng đến đúng giờ hẹn.";
      }
      if (status === "Hoàn thành") {
        return "Dịch vụ đã hoàn thành. Bạn có thể đặt lại nếu cần.";
      }
      if (status === "Đã hủy") {
        return "Lịch hẹn này đã bị hủy. Bạn có thể đặt lại dịch vụ.";
      }
      return "Lịch hẹn đang được xử lý.";
    },
  },

  async mounted() {
    const userData = localStorage.getItem("user");

    if (!userData) {
      alert("Vui lòng đăng nhập để xem lịch sử dịch vụ.");
      this.$router.push("/login");
      return;
    }

    this.currentUser = JSON.parse(userData);
    await this.fetchBookings();
  },
};
</script>

<style scoped>
.booking-card {
  transition: all 0.2s ease;
}

.booking-card:hover {
  transform: translateY(-2px);
}

.modal {
  overflow-y: auto;
}
</style>