<template>
  <div class="admin-orders bg-light py-4" style="min-height: 100vh;">
    <div class="container-fluid px-2">
      <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
        <h4 class="font-weight-bold text-dark mb-0">
          <i class="fas fa-file-invoice-dollar mr-2 text-warning"></i>
          QUẢN LÝ ĐƠN ĐẶT CỌC
        </h4>
        <button class="btn btn-primary btn-sm shadow-sm" @click="fetchOrders">
          <i class="fas fa-sync-alt mr-1"></i> Làm mới dữ liệu
        </button>
      </div>

      <div class="row mb-3 align-items-center">
        <div class="col-md-3 mb-2 mb-md-0">
          <div class="input-group input-group-sm shadow-sm">
            <div class="input-group-prepend">
              <span class="input-group-text bg-white text-primary border-right-0">
                <i class="fas fa-search"></i>
              </span>
            </div>
            <input
              type="text"
              class="form-control border-left-0"
              placeholder="Tìm tên khách hoặc SĐT..."
              v-model="searchText"
            />
          </div>
        </div>

        <div class="col-md-9 text-md-right">
          <div class="btn-group shadow-sm border bg-white rounded flex-wrap">
            <button
              class="btn btn-sm font-weight-bold"
              :class="statusFilter === 'Tất cả' ? 'btn-dark' : 'btn-light text-secondary'"
              @click="statusFilter = 'Tất cả'"
            >
              Tất cả
            </button>
            <button
              class="btn btn-sm font-weight-bold"
              :class="statusFilter === 'Chờ xác nhận cọc' ? 'btn-warning text-dark' : 'btn-light text-secondary'"
              @click="statusFilter = 'Chờ xác nhận cọc'"
            >
              Chờ xác nhận
            </button>
            <button
              class="btn btn-sm font-weight-bold"
              :class="statusFilter === 'Đã nhận cọc' ? 'btn-info text-white' : 'btn-light text-secondary'"
              @click="statusFilter = 'Đã nhận cọc'"
            >
              Đã nhận cọc
            </button>
            <button
              class="btn btn-sm font-weight-bold"
              :class="statusFilter === 'Đang giao' ? 'btn-primary text-white' : 'btn-light text-secondary'"
              @click="statusFilter = 'Đang giao'"
            >
              Đang giao
            </button>
            <button
              class="btn btn-sm font-weight-bold"
              :class="statusFilter === 'Hoàn thành' ? 'btn-success text-white' : 'btn-light text-secondary'"
              @click="statusFilter = 'Hoàn thành'"
            >
              Hoàn thành
            </button>
            <button
              class="btn btn-sm font-weight-bold"
              :class="statusFilter === 'Đã hủy' ? 'btn-danger text-white' : 'btn-light text-secondary'"
              @click="statusFilter = 'Đã hủy'"
            >
              Đã hủy
            </button>
          </div>
        </div>
      </div>

      <div class="card border-0 shadow-sm rounded overflow-hidden">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0 text-center border">
            <thead class="bg-white">
              <tr class="text-secondary small font-weight-bold">
                <th class="py-3 border-bottom">Mã đơn</th>
                <th class="py-3 border-bottom">Ngày đặt</th>
                <th class="py-3 border-bottom">Khách hàng</th>
                <th class="py-3 border-bottom text-left">Bé cún</th>
                <th class="py-3 border-bottom">Trại</th>
                <th class="py-3 border-bottom">Tổng tiền</th>
                <th class="py-3 border-bottom">Tiền cọc</th>
                <th class="py-3 border-bottom">Còn lại</th>
                <th class="py-3 border-bottom">TT cọc</th>
                <th class="py-3 border-bottom">Trạng thái đơn</th>
                <th class="py-3 border-bottom">Trạng thái chó</th>
                <th class="py-3 border-bottom">Thao tác</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="(order, index) in filteredOrders"
                :key="getOrderId(order) || index"
                style="font-size: 0.9rem;"
              >
                <td>
                  <small class="font-weight-bold text-primary">
                    #{{ getShortOrderCode(getOrderId(order)) }}
                  </small>
                </td>

                <td>
                  <small class="text-muted">{{ formatDate(order.createdAt) }}</small>
                </td>

                <td class="text-left">
                  <div class="font-weight-bold text-dark">{{ order.customerName || "---" }}</div>
                  <div class="small text-muted">
                    <i class="fas fa-phone mr-1"></i>{{ order.customerPhone || "---" }}
                  </div>
                  <div class="small text-muted text-truncate" style="max-width: 220px;">
                    <i class="fas fa-map-marker-alt mr-1"></i>{{ order.customerAddress || "---" }}
                  </div>
                </td>

                <td class="text-left">
                  <div class="d-flex align-items-center" v-if="order.dogId">
                    <img
                      :src="getDogImage(order)"
                      class="rounded shadow-sm mr-2"
                      style="width: 40px; height: 40px; object-fit: cover;"
                      alt="dog"
                    />
                    <div>
                      <div class="font-weight-bold text-dark">
                        {{ order.dogId.name || "---" }}
                      </div>
                      <small class="text-muted">
                        {{ order.dogId.maCho || "Không có mã" }}
                      </small>
                    </div>
                  </div>
                  <span v-else class="text-danger small font-italic">
                    Chó không còn dữ liệu
                  </span>
                </td>

                <td>
                  <span class="badge badge-light border text-muted" v-if="order.farmId">
                    {{ order.farmId.name }}
                  </span>
                  <span v-else>---</span>
                </td>

                <td class="font-weight-bold text-dark">
                  {{ formatCurrency(order.totalPrice) }}
                </td>

                <td class="font-weight-bold text-danger">
                  {{ formatCurrency(order.depositAmount) }}
                </td>

                <td class="font-weight-bold text-primary">
                  {{ formatCurrency(getRemainingAmount(order)) }}
                </td>

                <td>
                  <span class="badge px-2 py-1" :class="getPaymentStatusClass(order.paymentStatus)">
                    {{ order.paymentStatus || "---" }}
                  </span>
                </td>

                <td>
                  <span class="badge px-2 py-1 shadow-sm" :class="getStatusClass(order.status)">
                    {{ order.status }}
                  </span>
                </td>

                <td>
                  <span
                    class="badge px-2 py-1 shadow-sm"
                    :class="getDogStatusClass(order.dogId?.status)"
                  >
                    {{ order.dogId?.status || "---" }}
                  </span>
                </td>

                <td>
                  <div class="d-flex flex-column align-items-center">
                    <button
                      class="btn btn-sm btn-outline-secondary mb-1"
                      @click="openDetail(order)"
                    >
                      <i class="fas fa-eye mr-1"></i> Xem
                    </button>

                    <div v-if="order.status === 'Chờ xác nhận cọc'" class="btn-group">
                      <button
                        class="btn btn-sm btn-info px-2 font-weight-bold text-white shadow-sm"
                        @click="updateStatus(getOrderId(order), 'Đã nhận cọc')"
                        title="Xác nhận đã nhận tiền cọc"
                      >
                        <i class="fas fa-check mr-1"></i> Nhận cọc
                      </button>
                      <button
                        class="btn btn-sm btn-outline-danger px-2 ml-1"
                        @click="updateStatus(getOrderId(order), 'Đã hủy')"
                        title="Hủy đơn"
                      >
                        <i class="fas fa-times"></i>
                      </button>
                    </div>

                    <div v-else-if="order.status === 'Đã nhận cọc'" class="btn-group">
                      <button
                        class="btn btn-sm btn-primary px-3 font-weight-bold shadow-sm"
                        @click="updateStatus(getOrderId(order), 'Đang giao')"
                        title="Bắt đầu giao chó"
                      >
                        <i class="fas fa-truck mr-1"></i> Giao hàng
                      </button>
                      <button
                        class="btn btn-sm btn-outline-danger px-2 ml-1"
                        @click="updateStatus(getOrderId(order), 'Đã hủy')"
                        title="Hủy đơn"
                      >
                        <i class="fas fa-times"></i>
                      </button>
                    </div>

                    <div v-else-if="order.status === 'Đang giao'" class="btn-group">
                      <button
                        class="btn btn-sm btn-success px-3 font-weight-bold shadow-sm"
                        @click="updateStatus(getOrderId(order), 'Hoàn thành')"
                        title="Giao thành công và khách đã thanh toán đủ"
                      >
                        <i class="fas fa-flag-checkered mr-1"></i> Hoàn thành
                      </button>
                      <button
                        class="btn btn-sm btn-outline-danger px-2 ml-1"
                        @click="updateStatus(getOrderId(order), 'Đã hủy')"
                        title="Hủy đơn"
                      >
                        <i class="fas fa-times"></i>
                      </button>
                    </div>

                    <div v-else class="text-muted small font-italic font-weight-bold mt-1">
                      <i
                        class="fas fa-check-double text-success mr-1"
                        v-if="order.status === 'Hoàn thành'"
                      ></i>
                      <i
                        class="fas fa-ban text-danger mr-1"
                        v-if="order.status === 'Đã hủy'"
                      ></i>
                      Đã đóng
                    </div>
                  </div>
                </td>
              </tr>

              <tr v-if="filteredOrders.length === 0">
                <td colspan="12" class="py-5 text-center text-muted">
                  <i class="fas fa-search fa-2x mb-3 opacity-50 d-block"></i>
                  Không tìm thấy đơn hàng nào phù hợp.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div
        v-if="selectedOrder"
        class="modal fade show d-block"
        tabindex="-1"
        style="background: rgba(0,0,0,0.45);"
      >
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content border-0 shadow">
            <div class="modal-header bg-dark text-white">
              <h5 class="modal-title mb-0">
                <i class="fas fa-receipt mr-2"></i>Chi tiết đơn đặt cọc
              </h5>
              <button type="button" class="close text-white" @click="closeDetail">
                <span>&times;</span>
              </button>
            </div>

            <div class="modal-body">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <h6 class="font-weight-bold text-primary">Thông tin khách hàng</h6>
                  <p class="mb-1"><strong>Họ tên:</strong> {{ selectedOrder.customerName }}</p>
                  <p class="mb-1"><strong>Số điện thoại:</strong> {{ selectedOrder.customerPhone }}</p>
                  <p class="mb-1"><strong>Địa chỉ:</strong> {{ selectedOrder.customerAddress || "---" }}</p>
                  <p class="mb-1"><strong>Ghi chú:</strong> {{ selectedOrder.note || "Không có" }}</p>
                </div>

                <div class="col-md-6 mb-3">
                  <h6 class="font-weight-bold text-success">Thông tin đơn hàng</h6>
                  <p class="mb-1"><strong>Mã đơn:</strong> #{{ getShortOrderCode(getOrderId(selectedOrder)) }}</p>
                  <p class="mb-1"><strong>Ngày đặt:</strong> {{ formatDate(selectedOrder.createdAt) }}</p>
                  <p class="mb-1"><strong>Trạng thái đơn:</strong> {{ selectedOrder.status }}</p>
                  <p class="mb-1"><strong>Tổng tiền:</strong> {{ formatCurrency(selectedOrder.totalPrice) }}</p>
                  <p class="mb-1"><strong>Tiền cọc:</strong> {{ formatCurrency(selectedOrder.depositAmount) }}</p>
                  <p class="mb-1"><strong>Tiền còn lại:</strong> {{ formatCurrency(getRemainingAmount(selectedOrder)) }}</p>
                  <p class="mb-1"><strong>Phương thức cọc:</strong> {{ selectedOrder.paymentMethod || "Chuyển khoản" }}</p>
                  <p class="mb-1"><strong>Trạng thái thanh toán cọc:</strong> {{ selectedOrder.paymentStatus || "---" }}</p>
                  <p class="mb-1"><strong>Minh chứng cọc:</strong> {{ selectedOrder.paymentProof || "Không có" }}</p>
                </div>

                <div class="col-12" v-if="selectedOrder.dogId">
                  <hr>
                  <h6 class="font-weight-bold text-danger">Thông tin bé cún</h6>
                  <div class="d-flex align-items-center">
                    <img
                      :src="getDogImage(selectedOrder)"
                      alt="dog"
                      class="rounded shadow-sm mr-3"
                      style="width: 90px; height: 90px; object-fit: cover;"
                    />
                    <div>
                      <p class="mb-1"><strong>Tên:</strong> {{ selectedOrder.dogId.name }}</p>
                      <p class="mb-1"><strong>Mã chó:</strong> {{ selectedOrder.dogId.maCho || "---" }}</p>
                      <p class="mb-1"><strong>Giá:</strong> {{ formatCurrency(selectedOrder.dogId.price) }}</p>
                      <p class="mb-1"><strong>Trạng thái chó:</strong> {{ selectedOrder.dogId.status || "---" }}</p>
                    </div>
                  </div>
                </div>

                <div class="col-12 mt-3" v-if="selectedOrder.farmId">
                  <hr>
                  <h6 class="font-weight-bold text-dark">Thông tin trang trại</h6>
                  <p class="mb-1"><strong>Tên trại:</strong> {{ selectedOrder.farmId.name }}</p>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn btn-secondary" @click="closeDetail">Đóng</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import OrderService from "@/services/order.service";

export default {
  data() {
    return {
      orders: [],
      searchText: "",
      statusFilter: "Tất cả",
      selectedOrder: null,
    };
  },

  computed: {
    filteredOrders() {
      return this.orders.filter((order) => {
        const text = (this.searchText || "").toLowerCase();
        const custName = order.customerName ? order.customerName.toLowerCase() : "";
        const custPhone = order.customerPhone || "";

        const matchSearch = custName.includes(text) || custPhone.includes(text);
        const matchStatus =
          this.statusFilter === "Tất cả" || order.status === this.statusFilter;

        return matchSearch && matchStatus;
      });
    },
  },

  methods: {
    getOrderId(order) {
      return order?._id || order?.id || "";
    },

    async fetchOrders() {
      try {
        this.orders = await OrderService.getAll();
      } catch (error) {
        console.error("Lỗi lấy danh sách đơn hàng:", error);
        alert("Không thể tải danh sách đơn đặt cọc.");
      }
    },

    async updateStatus(id, status) {
      if (!id) {
        alert("Không tìm thấy mã đơn hợp lệ để cập nhật.");
        return;
      }

      let message = `Bạn xác nhận chuyển đơn hàng này sang trạng thái: [ ${status.toUpperCase()} ] ?`;

      if (status === "Đã hủy") {
        message += "\n\nLưu ý: Bé chó sẽ được mở bán lại nếu giao dịch chưa hoàn tất.";
      }

      if (status === "Hoàn thành") {
        message += "\n\nLưu ý: Điều này có nghĩa là khách đã nhận chó và thanh toán đủ số tiền còn lại.";
      }

      if (!confirm(message)) return;

      try {
        await OrderService.updateStatus(id, status);
        alert("✅ Cập nhật trạng thái đơn hàng thành công!");
        await this.fetchOrders();

        if (this.selectedOrder && this.getOrderId(this.selectedOrder) === id) {
          const updated = this.orders.find((item) => this.getOrderId(item) === id);
          this.selectedOrder = updated || null;
        }
      } catch (error) {
        alert(
          "Lỗi khi cập nhật trạng thái: " +
            (error.response?.data?.message || "Lỗi máy chủ")
        );
      }
    },

    openDetail(order) {
      this.selectedOrder = order;
    },

    closeDetail() {
      this.selectedOrder = null;
    },

    formatDate(date) {
      if (!date) return "---";
      return new Date(date).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },

    formatCurrency(value) {
      if (value === null || value === undefined) return "---";
      return Number(value).toLocaleString("vi-VN") + " ₫";
    },

    getRemainingAmount(order) {
      if (order?.remainingAmount !== undefined && order?.remainingAmount !== null) {
        return order.remainingAmount;
      }
      return Number(order.totalPrice || 0) - Number(order.depositAmount || 0);
    },

    getShortOrderCode(id) {
      if (!id) return "------";
      return String(id).substring(String(id).length - 6).toUpperCase();
    },

    getDogImage(order) {
      if (order?.dogId?.image) {
        return "http://localhost:3000" + order.dogId.image;
      }
      return "https://via.placeholder.com/80";
    },

    getStatusClass(status) {
      if (status === "Chờ xác nhận cọc") return "badge-warning text-dark";
      if (status === "Đã nhận cọc") return "badge-info text-white";
      if (status === "Đang giao") return "badge-primary text-white";
      if (status === "Hoàn thành") return "badge-success text-white";
      if (status === "Đã hủy") return "badge-danger text-white";
      return "badge-secondary";
    },

    getDogStatusClass(status) {
      if (status === "Chờ duyệt") return "badge-warning text-dark";
      if (status === "Đã duyệt") return "badge-success";
      if (status === "Từ chối") return "badge-danger";
      if (status === "Chờ thanh toán") return "badge-info text-dark";
      if (status === "Đã đặt cọc") return "badge-primary";
      if (status === "Đang giao") return "badge-secondary";
      if (status === "Đã bán") return "badge-dark";
      return "badge-light border";
    },

    getPaymentStatusClass(status) {
      if (status === "Chưa thanh toán") return "badge-secondary";
      if (status === "Đã gửi minh chứng") return "badge-warning text-dark";
      if (status === "Đã xác nhận") return "badge-success";
      return "badge-light border";
    },
  },

  mounted() {
    this.fetchOrders();
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