<template>
  <div class="order-history-page bg-light py-5" style="min-height: 100vh;">
    <div class="container">
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap">
        <h3 class="font-weight-bold text-dark mb-2">
          <i class="fas fa-history text-primary mr-2"></i>
          LỊCH SỬ ĐƠN ĐẶT CỌC
        </h3>

        <button class="btn btn-outline-primary btn-sm" @click="fetchOrders">
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
                  placeholder="Tìm theo tên bé cún hoặc mã đơn..."
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
                  :class="statusFilter === 'Chờ xác nhận cọc' ? 'btn-warning text-dark' : 'btn-light'"
                  @click="statusFilter = 'Chờ xác nhận cọc'"
                >
                  Chờ xác nhận
                </button>
                <button
                  class="btn btn-sm"
                  :class="statusFilter === 'Đã nhận cọc' ? 'btn-info text-white' : 'btn-light'"
                  @click="statusFilter = 'Đã nhận cọc'"
                >
                  Đã nhận cọc
                </button>
                <button
                  class="btn btn-sm"
                  :class="statusFilter === 'Đang giao' ? 'btn-primary text-white' : 'btn-light'"
                  @click="statusFilter = 'Đang giao'"
                >
                  Đang giao
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
        Đang tải lịch sử đơn hàng...
      </div>

      <div v-else-if="filteredOrders.length === 0" class="card border-0 shadow-sm">
        <div class="card-body text-center py-5 text-muted">
          <i class="fas fa-box-open fa-3x mb-3 d-block"></i>
          Bạn chưa có đơn đặt cọc nào.
        </div>
      </div>

      <div v-else class="row">
        <div
          class="col-lg-6 mb-4"
          v-for="(order, index) in filteredOrders"
          :key="getOrderId(order) || index"
        >
          <div class="card border-0 shadow-sm h-100 order-card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <div class="small text-muted">Mã đơn</div>
                  <div class="font-weight-bold text-primary">
                    #{{ getShortOrderCode(getOrderId(order)) }}
                  </div>
                </div>
                <div class="text-right">
                  <span class="badge px-3 py-2" :class="getStatusClass(order.status)">
                    {{ order.status }}
                  </span>
                </div>
              </div>

              <div class="d-flex align-items-center mb-3" v-if="order.dogId">
                <img
                  :src="getDogImage(order)"
                  alt="dog"
                  class="rounded shadow-sm mr-3"
                  style="width: 90px; height: 90px; object-fit: cover;"
                />
                <div>
                  <h5 class="mb-1 font-weight-bold text-dark">
                    {{ order.dogId.name || "Bé cún" }}
                  </h5>
                  <p class="mb-1 text-muted small">
                    Mã chó: {{ order.dogId.maCho || "---" }}
                  </p>
                  <p class="mb-0">
                    <span class="badge px-2 py-1" :class="getDogStatusClass(order.dogId.status)">
                      {{ order.dogId.status || "---" }}
                    </span>
                  </p>
                </div>
              </div>

              <div v-else class="alert alert-danger py-2 small">
                Dữ liệu bé chó không còn tồn tại hoặc đã bị xóa.
              </div>

              <div class="border rounded p-3 bg-light mb-3">
                <div class="row">
                  <div class="col-6 mb-2">
                    <div class="small text-muted">Ngày đặt</div>
                    <div class="font-weight-bold">{{ formatDate(order.createdAt) }}</div>
                  </div>
                  <div class="col-6 mb-2">
                    <div class="small text-muted">Trang trại</div>
                    <div class="font-weight-bold">
                      {{ order.farmId?.name || "---" }}
                    </div>
                  </div>
                  <div class="col-6 mb-2">
                    <div class="small text-muted">Tổng tiền</div>
                    <div class="font-weight-bold text-dark">
                      {{ formatCurrency(order.totalPrice) }}
                    </div>
                  </div>
                  <div class="col-6 mb-2">
                    <div class="small text-muted">Tiền cọc</div>
                    <div class="font-weight-bold text-danger">
                      {{ formatCurrency(order.depositAmount) }}
                    </div>
                  </div>
                  <div class="col-6 mb-2">
                    <div class="small text-muted">Tiền còn lại</div>
                    <div class="font-weight-bold text-primary">
                      {{ formatCurrency(getRemainingAmount(order)) }}
                    </div>
                  </div>
                  <div class="col-6 mb-2">
                    <div class="small text-muted">Thanh toán cọc</div>
                    <div class="font-weight-bold">
                      {{ order.paymentMethod || "Chuyển khoản" }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="d-flex justify-content-between align-items-center flex-wrap">
                <div class="small text-muted mb-2 mb-md-0">
                  <i class="fas fa-info-circle mr-1"></i>
                  {{ getCustomerMessage(order) }}
                </div>

                <div class="d-flex flex-wrap">
                  <button
                    v-if="order.status === 'Chờ xác nhận cọc'"
                    class="btn btn-outline-danger btn-sm mr-2 mb-2"
                    @click="cancelOrder(order)"
                  >
                    <i class="fas fa-times mr-1"></i> Hủy đơn
                  </button>

                  <button
                    v-if="canBuyAgain(order)"
                    class="btn btn-outline-success btn-sm mr-2 mb-2"
                    @click="buyAgain(order)"
                  >
                    <i class="fas fa-redo-alt mr-1"></i> Mua lại
                  </button>

                  <button
                    class="btn btn-outline-primary btn-sm mb-2"
                    @click="openDetail(order)"
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
        v-if="selectedOrder"
        class="modal fade show d-block"
        tabindex="-1"
        style="background: rgba(0, 0, 0, 0.45);"
      >
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content border-0 shadow">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title mb-0">
                <i class="fas fa-file-alt mr-2"></i>Chi tiết đơn đặt cọc
              </h5>
              <button type="button" class="close text-white" @click="closeDetail">
                <span>&times;</span>
              </button>
            </div>

            <div class="modal-body">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <h6 class="font-weight-bold text-primary">Thông tin đơn hàng</h6>
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

                <div class="col-md-6 mb-3">
                  <h6 class="font-weight-bold text-success">Thông tin nhận hàng</h6>
                  <p class="mb-1"><strong>Khách hàng:</strong> {{ selectedOrder.customerName }}</p>
                  <p class="mb-1"><strong>Số điện thoại:</strong> {{ selectedOrder.customerPhone }}</p>
                  <p class="mb-1"><strong>Địa chỉ:</strong> {{ selectedOrder.customerAddress || "---" }}</p>
                  <p class="mb-1"><strong>Ghi chú:</strong> {{ selectedOrder.note || "Không có" }}</p>
                </div>

                <div class="col-12" v-if="selectedOrder.dogId">
                  <hr>
                  <h6 class="font-weight-bold text-danger">Thông tin bé cún</h6>
                  <div class="d-flex align-items-center">
                    <img
                      :src="getDogImage(selectedOrder)"
                      alt="dog"
                      class="rounded shadow-sm mr-3"
                      style="width: 100px; height: 100px; object-fit: cover;"
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
              <button
                v-if="canBuyAgain(selectedOrder)"
                class="btn btn-success"
                @click="buyAgain(selectedOrder)"
              >
                <i class="fas fa-redo-alt mr-1"></i> Mua lại
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
import OrderService from "@/services/order.service";
import DogService from "@/services/dog.service";

export default {
  data() {
    return {
      orders: [],
      currentUser: null,
      searchText: "",
      statusFilter: "Tất cả",
      loading: false,
      selectedOrder: null,
    };
  },

  computed: {
    filteredOrders() {
      return this.orders.filter((order) => {
        const keyword = (this.searchText || "").toLowerCase();

        const dogName = order.dogId?.name ? order.dogId.name.toLowerCase() : "";
        const shortCode = this.getShortOrderCode(this.getOrderId(order)).toLowerCase();

        const matchSearch = dogName.includes(keyword) || shortCode.includes(keyword);
        const matchStatus =
          this.statusFilter === "Tất cả" || order.status === this.statusFilter;

        return matchSearch && matchStatus;
      });
    },
  },

  methods: {
    async fetchOrders() {
      try {
        if (!this.currentUser) return;

        this.loading = true;
        const userId = this.currentUser._id || this.currentUser.id;
        this.orders = await OrderService.findByUserId(userId);
      } catch (error) {
        console.error("Lỗi lấy lịch sử đơn hàng:", error);
        alert("Không thể tải lịch sử đơn hàng của bạn.");
      } finally {
        this.loading = false;
      }
    },

    getOrderId(order) {
      return order?._id || order?.id || "";
    },

    canBuyAgain(order) {
      if (!order) return false;
      return order.status === "Đã hủy" || order.status === "Hoàn thành";
    },

    async buyAgain(order) {
      try {
        if (!order?.dogId) {
          alert("Không tìm thấy dữ liệu bé cún để mua lại.");
          return;
        }

        const dogId = order.dogId._id || order.dogId.id;
        if (!dogId) {
          alert("Không tìm thấy mã bé cún để mua lại.");
          return;
        }

        const latestDog = await DogService.get(dogId);

        if (!latestDog) {
          alert("Không tìm thấy thông tin bé cún.");
          return;
        }

        if (latestDog.status !== "Đã duyệt") {
          alert("Bé cún này hiện không còn sẵn sàng để đặt cọc lại.");
          return;
        }

        localStorage.setItem("checkoutDog", JSON.stringify(latestDog));
        this.closeDetail();
        this.$router.push("/deposit");
      } catch (error) {
        alert(
          "Không thể mua lại lúc này: " +
            (error.response?.data?.message || error.message)
        );
      }
    },

    openDetail(order) {
      this.selectedOrder = order;
    },

    closeDetail() {
      this.selectedOrder = null;
    },

    getShortOrderCode(id) {
      if (!id) return "------";
      return String(id).substring(String(id).length - 6).toUpperCase();
    },

    getRemainingAmount(order) {
      if (order?.remainingAmount !== undefined && order?.remainingAmount !== null) {
        return order.remainingAmount;
      }
      return Number(order.totalPrice || 0) - Number(order.depositAmount || 0);
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

    getDogImage(order) {
      if (order?.dogId?.image) {
        return "http://localhost:3000" + order.dogId.image;
      }
      return "https://via.placeholder.com/100";
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

    getCustomerMessage(order) {
      if (order.status === "Chờ xác nhận cọc") {
        return "Đơn của bạn đang chờ admin xác nhận khoản cọc.";
      }
      if (order.status === "Đã nhận cọc") {
        return `Đã xác nhận cọc. Bạn còn lại ${this.formatCurrency(this.getRemainingAmount(order))} khi nhận chó.`;
      }
      if (order.status === "Đang giao") {
        return `Bé cún đang được bàn giao. Số tiền còn lại cần thanh toán là ${this.formatCurrency(this.getRemainingAmount(order))}.`;
      }
      if (order.status === "Hoàn thành") {
        return "Đơn hàng đã hoàn tất. Bạn có thể mua lại nếu bé cún đã được mở bán lại.";
      }
      if (order.status === "Đã hủy") {
        return "Đơn này đã bị hủy. Bạn có thể mua lại nếu bé cún đã sẵn sàng mở bán.";
      }
      return "Đơn hàng đang được xử lý.";
    },

    async cancelOrder(order) {
      if (!confirm(`Bạn có chắc muốn hủy đơn #${this.getShortOrderCode(this.getOrderId(order))} không?`)) {
        return;
      }

      try {
        await OrderService.cancelByCustomer(this.getOrderId(order));
        alert("✅ Hủy đơn đặt cọc thành công!");
        await this.fetchOrders();

        if (this.selectedOrder && this.getOrderId(this.selectedOrder) === this.getOrderId(order)) {
          this.selectedOrder = null;
        }
      } catch (error) {
        alert(
          "❌ Không thể hủy đơn: " +
            (error.response?.data?.message || error.message)
        );
      }
    },
  },

  async mounted() {
    const userData = localStorage.getItem("user");

    if (!userData) {
      alert("Vui lòng đăng nhập để xem lịch sử đơn hàng.");
      this.$router.push("/login");
      return;
    }

    this.currentUser = JSON.parse(userData);
    await this.fetchOrders();
  },
};
</script>

<style scoped>
.order-card {
  transition: all 0.2s ease;
}

.order-card:hover {
  transform: translateY(-2px);
}

.modal {
  overflow-y: auto;
}
</style>