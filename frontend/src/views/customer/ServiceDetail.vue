<template>
  <div class="service-detail-page bg-light py-5" style="min-height: 100vh;">
    <div class="container">
      <div class="mb-4">
        <button class="btn btn-outline-secondary btn-sm" @click="$router.back()">
          <i class="fas fa-arrow-left mr-1"></i> Quay lại
        </button>
      </div>

      <div v-if="loading" class="text-center py-5 text-muted">
        <i class="fas fa-spinner fa-spin fa-2x mb-3 d-block"></i>
        Đang tải chi tiết dịch vụ...
      </div>

      <div v-else-if="errorMessage" class="card border-0 shadow-sm">
        <div class="card-body text-center py-5 text-danger">
          <i class="fas fa-exclamation-triangle fa-3x mb-3 d-block"></i>
          {{ errorMessage }}
        </div>
      </div>

      <div v-else-if="!service" class="card border-0 shadow-sm">
        <div class="card-body text-center py-5 text-muted">
          <i class="fas fa-concierge-bell fa-3x mb-3 d-block"></i>
          Không tìm thấy dịch vụ này.
        </div>
      </div>

      <div v-else class="card border-0 shadow-sm">
        <div class="row no-gutters">
          <div class="col-md-5">
            <img
              :src="getServiceImage(service)"
              alt="service"
              class="w-100 h-100"
              style="object-fit: cover; min-height: 400px;"
            />
          </div>

          <div class="col-md-7">
            <div class="card-body p-4 p-lg-5">
              <div class="mb-2">
                <span class="badge badge-light border text-primary">
                  {{ service.maDichVu || "---" }}
                </span>
              </div>

              <h2 class="font-weight-bold text-dark mb-3">
                {{ service.name || "---" }}
              </h2>

              <h4 class="text-danger font-weight-bold mb-3">
                {{ formatCurrency(service.price) }}
              </h4>

              <p class="mb-2">
                <strong>Trạng thái:</strong>
                <span class="badge ml-1" :class="getStatusClass(service.status)">
                  {{ service.status || "---" }}
                </span>
              </p>

              <p class="mb-4">
                <strong>Mô tả:</strong><br />
                <span class="text-muted">
                  {{ service.description || "Chưa có mô tả cho dịch vụ này." }}
                </span>
              </p>

              <div class="d-flex flex-wrap">
                <button
                  class="btn btn-primary mr-2 mb-2"
                  @click="openBookingModal"
                  :disabled="service.status !== 'Đang hoạt động'"
                >
                  <i class="fas fa-calendar-check mr-1"></i> Đặt lịch dịch vụ
                </button>

                <button class="btn btn-outline-secondary mb-2" @click="$router.push('/services')">
                  Xem thêm dịch vụ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal đặt lịch -->
      <div
        v-if="showBookingModal"
        class="modal fade show d-block"
        tabindex="-1"
        style="background: rgba(0,0,0,0.45);"
      >
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content border-0 shadow">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title mb-0">
                <i class="fas fa-calendar-check mr-2"></i>Đặt lịch dịch vụ
              </h5>
              <button type="button" class="close text-white" @click="closeBookingModal">
                <span>&times;</span>
              </button>
            </div>

            <div class="modal-body">
              <div class="alert alert-light border">
                <strong>Dịch vụ:</strong> {{ service.name }} <br />
                <strong>Giá:</strong> {{ formatCurrency(service.price) }}
              </div>

              <div class="form-row">
                <div class="form-group col-md-6">
                  <label>Họ tên khách hàng <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" v-model.trim="bookingForm.customerName" />
                </div>

                <div class="form-group col-md-6">
                  <label>Số điện thoại <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" v-model.trim="bookingForm.customerPhone" />
                </div>

                <div class="form-group col-md-6">
                  <label>Ngày hẹn <span class="text-danger">*</span></label>
                  <input type="date" class="form-control" v-model="bookingForm.bookingDate" :min="today" />
                </div>

                <div class="form-group col-md-6">
                  <label>Giờ hẹn <span class="text-danger">*</span></label>
                  <input type="time" class="form-control" v-model="bookingForm.bookingTime" />
                </div>

                <div class="form-group col-md-12">
                  <label>Ghi chú</label>
                  <textarea class="form-control" rows="3" v-model.trim="bookingForm.note"></textarea>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn btn-secondary" @click="closeBookingModal">Hủy</button>
              <button class="btn btn-primary" @click="submitBooking" :disabled="isSubmitting">
                {{ isSubmitting ? "Đang xử lý..." : "Xác nhận đặt lịch" }}
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import ServiceService from "@/services/service.service";
import ServiceBookingService from "@/services/serviceBooking.service";

export default {
  data() {
    return {
      service: null,
      loading: false,
      errorMessage: "",
      showBookingModal: false,
      isSubmitting: false,
      today: new Date().toISOString().split("T")[0],

      bookingForm: {
        customerName: "",
        customerPhone: "",
        bookingDate: "",
        bookingTime: "",
        note: "",
      },
    };
  },

  methods: {
    async fetchService() {
      try {
        this.loading = true;
        this.errorMessage = "";

        const id = this.$route.params.id;
        if (!id) {
          this.errorMessage = "Thiếu mã dịch vụ.";
          return;
        }

        this.service = await ServiceService.get(id);
      } catch (error) {
        console.error("Lỗi tải chi tiết dịch vụ:", error);
        this.errorMessage =
          error.response?.data?.message || "Không thể tải chi tiết dịch vụ.";
        this.service = null;
      } finally {
        this.loading = false;
      }
    },

    openBookingModal() {
      const user = JSON.parse(localStorage.getItem("user") || "null");

      if (!user) {
        alert("Vui lòng đăng nhập để đặt lịch dịch vụ.");
        this.$router.push("/login");
        return;
      }

      this.bookingForm.customerName = user.fullName || "";
      this.bookingForm.customerPhone = user.phone || "";
      this.showBookingModal = true;
    },

    closeBookingModal() {
      this.showBookingModal = false;
    },

    async submitBooking() {
      if (!this.bookingForm.customerName) {
        alert("Vui lòng nhập họ tên.");
        return;
      }

      if (!this.bookingForm.customerPhone) {
        alert("Vui lòng nhập số điện thoại.");
        return;
      }

      if (!this.bookingForm.bookingDate) {
        alert("Vui lòng chọn ngày hẹn.");
        return;
      }

      if (!this.bookingForm.bookingTime) {
        alert("Vui lòng chọn giờ hẹn.");
        return;
      }

      this.isSubmitting = true;

      try {
        await ServiceBookingService.create({
          serviceId: this.service._id || this.service.id,
          customerName: this.bookingForm.customerName,
          customerPhone: this.bookingForm.customerPhone,
          bookingDate: this.bookingForm.bookingDate,
          bookingTime: this.bookingForm.bookingTime,
          note: this.bookingForm.note,
        });

        alert("✅ Đặt lịch dịch vụ thành công!");
        this.closeBookingModal();
      } catch (error) {
        console.error("Lỗi đặt lịch:", error);
        alert("❌ Lỗi đặt lịch: " + (error.response?.data?.message || error.message));
      } finally {
        this.isSubmitting = false;
      }
    },

    getServiceImage(item) {
      if (item?.image) return "http://localhost:3000" + item.image;
      return "https://via.placeholder.com/500x400";
    },

    formatCurrency(value) {
      if (value === null || value === undefined) return "---";
      return Number(value).toLocaleString("vi-VN") + " ₫";
    },

    getStatusClass(status) {
      if (status === "Đang hoạt động") return "badge-success";
      if (status === "Ngừng hoạt động") return "badge-secondary";
      return "badge-light border";
    },
  },

  mounted() {
    this.fetchService();
  },
};
</script>