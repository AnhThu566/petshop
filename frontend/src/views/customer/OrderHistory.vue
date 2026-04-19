<template>
  <div class="order-history-page">
    <div class="container-fluid order-page-container py-4">
      <div class="order-layout">
        <CustomerAccountSidebar :current-user="currentUser" />

        <section class="order-content">
          <div class="content-head">
            <div>
              <h3 class="content-title">Lịch sử đặt cọc</h3>
              <p class="content-subtitle mb-0">
                Theo dõi các đơn đặt cọc của bạn
              </p>
            </div>
          </div>

          <div class="toolbar-box">
            <div class="search-box">
              <i class="fas fa-search"></i>
              <input
                type="text"
                v-model="searchText"
                placeholder="Tìm theo mã đơn hoặc tên bé chó"
              />
            </div>

            <button class="refresh-btn" @click="fetchOrders" :disabled="loading">
              <i class="fas fa-sync-alt mr-1"></i>
              <span>Làm mới</span>
            </button>
          </div>

          <div class="status-tabs">
            <button
              class="status-tab"
              :class="{ active: statusFilter === 'Tất cả' }"
              @click="statusFilter = 'Tất cả'"
            >
              Tất cả
            </button>

            <button
              class="status-tab"
              :class="{ active: statusFilter === 'Chờ xác nhận cọc' }"
              @click="statusFilter = 'Chờ xác nhận cọc'"
            >
              Chờ xác nhận
            </button>

            <button
              class="status-tab"
              :class="{ active: statusFilter === 'Đã nhận cọc' }"
              @click="statusFilter = 'Đã nhận cọc'"
            >
              Đã nhận cọc
            </button>

            <button
              class="status-tab"
              :class="{ active: statusFilter === 'Đang giao' }"
              @click="statusFilter = 'Đang giao'"
            >
              Đang giao
            </button>

            <button
              class="status-tab"
              :class="{ active: statusFilter === 'Hoàn thành' }"
              @click="statusFilter = 'Hoàn thành'"
            >
              Hoàn thành
            </button>

            <button
              class="status-tab"
              :class="{ active: statusFilter === 'Đã hủy' }"
              @click="statusFilter = 'Đã hủy'"
            >
              Đã hủy
            </button>
          </div>

          <div v-if="loading" class="empty-panel">
            <i class="fas fa-spinner fa-spin empty-icon"></i>
            <p>Đang tải lịch sử đặt cọc...</p>
          </div>

          <div v-else-if="orders.length === 0" class="empty-panel">
            <i class="fas fa-box-open empty-icon"></i>
            <p>Bạn chưa có đơn đặt cọc nào</p>
          </div>

          <div v-else-if="filteredOrders.length === 0" class="empty-panel">
            <i class="fas fa-search empty-icon"></i>
            <p>Không có đơn nào phù hợp với bộ lọc hiện tại</p>
          </div>

          <div v-else class="table-card">
            <div class="table-wrap">
              <table class="order-table">
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Bé chó</th>
                    <th>Ngày đặt</th>
                    <th>Tổng tiền</th>
                    <th>Tiền cọc</th>
                    <th>Còn lại</th>
                    <th>Trạng thái đơn</th>
                    <th>Thanh toán</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>

                <tbody>
                  <tr
                    v-for="(order, index) in filteredOrders"
                    :key="getOrderId(order) || index"
                  >
                    <td class="td-code">
                      #{{ getShortOrderCode(getOrderId(order)) }}
                    </td>

                    <td>
                      <div class="dog-cell" v-if="order.dogId">
                        <img :src="getDogImage(order)" alt="dog" class="dog-thumb" />
                        <div class="dog-info">
                          <div class="dog-name">{{ order.dogId.name || "Bé cún" }}</div>
                        </div>
                      </div>
                      <span v-else class="text-danger">Không còn dữ liệu</span>
                    </td>

                    <td class="td-date">{{ formatDate(order.createdAt) }}</td>
                    <td>{{ formatCurrency(order.totalPrice) }}</td>
                    <td class="money-deposit">{{ formatCurrency(order.depositAmount) }}</td>
                    <td class="money-remaining">{{ formatCurrency(getRemainingAmount(order)) }}</td>

                    <td>
                      <span class="order-badge" :class="getStatusClass(order.status)">
                        {{ order.status }}
                      </span>
                    </td>

                    <td>
                      <span
                        class="payment-badge"
                        :class="getPaymentStatusClass(order.paymentStatus)"
                      >
                        {{ order.paymentStatus || "---" }}
                      </span>
                    </td>

                    <td class="td-actions">
                      <div class="table-actions">
                        <button
                          v-if="order.status === 'Chờ xác nhận cọc'"
                          class="btn btn-outline-danger btn-sm"
                          @click="cancelOrder(order)"
                        >
                          Hủy
                        </button>

                        <button
                          v-if="canBuyAgain(order)"
                          class="btn btn-outline-success btn-sm"
                          @click="buyAgain(order)"
                        >
                          Mua lại
                        </button>

                        <button
                          class="btn btn-outline-primary btn-sm"
                          @click="openDetail(order)"
                        >
                          Chi tiết
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      <div
        v-if="selectedOrder"
        class="modal fade show d-block"
        tabindex="-1"
        style="background: rgba(0, 0, 0, 0.45);"
      >
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content border-0 shadow">
            <div class="modal-header modal-head-custom">
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
                  <p class="mb-1">
                    <strong>Mã đơn:</strong>
                    #{{ getShortOrderCode(getOrderId(selectedOrder)) }}
                  </p>
                  <p class="mb-1">
                    <strong>Ngày đặt:</strong> {{ formatDate(selectedOrder.createdAt) }}
                  </p>
                  <p class="mb-1">
                    <strong>Trạng thái đơn:</strong> {{ selectedOrder.status }}
                  </p>
                  <p class="mb-1">
                    <strong>Trạng thái thanh toán:</strong>
                    {{ selectedOrder.paymentStatus || "---" }}
                  </p>
                  <p class="mb-1">
                    <strong>Tổng tiền:</strong> {{ formatCurrency(selectedOrder.totalPrice) }}
                  </p>
                  <p class="mb-1">
                    <strong>Tiền cọc:</strong> {{ formatCurrency(selectedOrder.depositAmount) }}
                  </p>
                  <p class="mb-1">
                    <strong>Tiền còn lại:</strong>
                    {{ formatCurrency(getRemainingAmount(selectedOrder)) }}
                  </p>
                  <p class="mb-1">
                    <strong>Phương thức cọc:</strong>
                    {{ selectedOrder.paymentMethod || "Chuyển khoản" }}
                  </p>
                  <p class="mb-1">
                    <strong>Minh chứng cọc:</strong>
                    {{ selectedOrder.paymentProof || "Không có" }}
                  </p>
                </div>

                <div class="col-md-6 mb-3">
                  <h6 class="font-weight-bold text-success">Thông tin nhận bé</h6>
                  <p class="mb-1"><strong>Khách hàng:</strong> {{ selectedOrder.customerName }}</p>
                  <p class="mb-1"><strong>Số điện thoại:</strong> {{ selectedOrder.customerPhone }}</p>
                  <p class="mb-1">
                    <strong>Địa chỉ:</strong> {{ selectedOrder.customerAddress || "---" }}
                  </p>
                  <p class="mb-1"><strong>Ghi chú:</strong> {{ selectedOrder.note || "Không có" }}</p>
                </div>

                <div class="col-12" v-if="selectedOrder.dogId">
                  <hr />
                  <h6 class="font-weight-bold text-danger">Thông tin bé cún</h6>
                  <div class="d-flex align-items-center flex-wrap">
                    <img
                      :src="getDogImage(selectedOrder)"
                      alt="dog"
                      class="rounded shadow-sm mr-3 mb-2"
                      style="width: 100px; height: 100px; object-fit: cover;"
                    />
                    <div>
                      <p class="mb-1"><strong>Tên:</strong> {{ selectedOrder.dogId.name }}</p>
                      <p class="mb-1"><strong>Giá:</strong> {{ formatCurrency(selectedOrder.dogId.price) }}</p>
                      <p class="mb-1">
                        <strong>Trạng thái chó:</strong>
                        {{ getDogSaleStatusText(selectedOrder.dogId.saleStatus) }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button
                v-if="canBuyAgain(selectedOrder)"
                class="btn btn-success"
                @click="buyAgain(selectedOrder)"
              >
                Mua lại
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
import CustomerAccountSidebar from "@/components/customer/CustomerAccountSidebar.vue";

export default {
  name: "OrderHistoryPage",

  components: {
    CustomerAccountSidebar,
  },

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
        const keyword = (this.searchText || "").toLowerCase().trim();

        const dogName = order.dogId?.name ? order.dogId.name.toLowerCase() : "";
        const shortCode = this.getShortOrderCode(this.getOrderId(order)).toLowerCase();
        const paymentStatus = (order.paymentStatus || "").toLowerCase();

        const matchSearch =
          !keyword ||
          dogName.includes(keyword) ||
          shortCode.includes(keyword) ||
          paymentStatus.includes(keyword);

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
        const data = await OrderService.getMyOrders();
        this.orders = Array.isArray(data) ? data : [];
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
      if (!order || !order.dogId) return false;
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

        const latestDog = await DogService.getPublicById(dogId);

        if (!latestDog) {
          alert("Không tìm thấy thông tin bé cún.");
          return;
        }

        if (
          latestDog.approvalStatus !== "Đã duyệt" ||
          latestDog.saleStatus !== "Sẵn sàng bán" ||
          !latestDog.isPublished
        ) {
          alert("Bé cún này hiện không còn sẵn sàng để đặt cọc lại.");
          return;
        }

        localStorage.setItem("checkoutDog", JSON.stringify(latestDog));
        this.closeDetail();
        this.$router.push({
          path: "/deposit",
          query: { dogId },
        });
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
      const image = order?.dogId?.image;
      if (!image) return "https://via.placeholder.com/100";
      if (String(image).startsWith("http")) return image;
      return `http://localhost:3000${image}`;
    },

    getDogSaleStatusText(status) {
      if (status === "Sẵn sàng bán") return "Sẵn sàng đón về";
      if (status === "Chờ thanh toán") return "Chờ xác nhận cọc";
      if (status === "Đã đặt cọc") return "Đã được giữ chỗ";
      if (status === "Đang giao") return "Đang bàn giao";
      if (status === "Đã bán") return "Đã có chủ mới";
      if (status === "Ngừng bán") return "Tạm ngừng mở bán";
      return "Chưa mở bán";
    },

    getStatusClass(status) {
      if (status === "Chờ xác nhận cọc") return "status-waiting";
      if (status === "Đã nhận cọc") return "status-confirmed";
      if (status === "Đang giao") return "status-delivering";
      if (status === "Hoàn thành") return "status-completed";
      if (status === "Đã hủy") return "status-cancelled";
      return "status-default";
    },

    getPaymentStatusClass(status) {
      if (status === "Đã xác nhận") return "payment-confirmed";
      if (status === "Đã gửi minh chứng") return "payment-pending";
      if (status === "Đã hoàn tất") return "payment-completed";
      if (status === "Đã hủy xác nhận") return "payment-cancelled";
      if (status === "Chưa thanh toán") return "payment-default";
      return "payment-default";
    },

    async cancelOrder(order) {
      if (!confirm(`Bạn có chắc muốn hủy đơn #${this.getShortOrderCode(this.getOrderId(order))} không?`)) {
        return;
      }

      try {
        await OrderService.cancelByCustomer(this.getOrderId(order));
        alert("✅ Hủy đơn đặt cọc thành công!");
        await this.fetchOrders();

        if (
          this.selectedOrder &&
          this.getOrderId(this.selectedOrder) === this.getOrderId(order)
        ) {
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
.order-history-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #faf7fc 0%, #f4eef9 100%);
}

.order-page-container {
  max-width: 1420px;
  padding-left: 24px;
  padding-right: 24px;
}

.order-layout {
  display: grid;
  grid-template-columns: 290px minmax(0, 1fr);
  gap: 22px;
  align-items: start;
}

.order-content,
.table-card {
  background: #ffffff;
  border: 1px solid #eee2f7;
  border-radius: 20px;
  box-shadow: 0 10px 24px rgba(106, 27, 154, 0.06);
}

.order-content {
  padding: 22px;
  min-width: 0;
}

.content-head {
  margin-bottom: 14px;
}

.content-title {
  margin: 0 0 4px;
  font-size: 1.85rem;
  font-weight: 900;
  color: #2f1b44;
  line-height: 1.15;
}

.content-subtitle {
  color: #7b7287;
  font-size: 0.94rem;
}

.toolbar-box {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 124px;
  gap: 12px;
  align-items: center;
  margin-bottom: 14px;
}

.search-box {
  position: relative;
  min-width: 0;
}

.search-box i {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #8b7fa0;
  font-size: 0.95rem;
  pointer-events: none;
}

.search-box input {
  width: 100%;
  height: 46px;
  border: 1px solid #dfd3ec;
  border-radius: 14px;
  padding: 0 16px 0 40px;
  outline: none;
  font-size: 0.94rem;
  background: #fff;
  color: #3b3150;
  transition: all 0.2s ease;
}

.search-box input::placeholder {
  color: #9b90ad;
}

.search-box input:focus {
  border-color: #7b3fc8;
  box-shadow: 0 0 0 3px rgba(123, 63, 200, 0.08);
}

.refresh-btn {
  border: none;
  background: linear-gradient(135deg, #6a1b9a, #4a148c);
  color: #fff;
  height: 46px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 0.92rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.refresh-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(106, 27, 154, 0.18);
}

.refresh-btn:disabled {
  opacity: 0.7;
  transform: none;
  box-shadow: none;
}

.status-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  border-bottom: 1px solid #ece3f4;
  margin-bottom: 18px;
  padding-bottom: 2px;
}

.status-tab {
  border: none;
  background: none;
  padding: 0 0 10px;
  font-weight: 700;
  color: #7f748f;
  border-bottom: 2px solid transparent;
  font-size: 0.94rem;
  transition: all 0.2s ease;
}

.status-tab:hover {
  color: #6a1b9a;
}

.status-tab.active {
  color: #6a1b9a;
  border-bottom-color: #6a1b9a;
}

.empty-panel {
  background: #fff;
  border: 1px solid #eee2f7;
  border-radius: 16px;
  min-height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: #7a708a;
}

.empty-icon {
  font-size: 2.4rem;
  margin-bottom: 12px;
  color: #cfbfdc;
}

.table-card {
  overflow: hidden;
}

.table-wrap {
  overflow-x: auto;
}

.order-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 920px;
}

.order-table thead th {
  background: #f8f3fc;
  color: #514564;
  font-size: 0.88rem;
  font-weight: 800;
  padding: 14px 12px;
  border-bottom: 1px solid #ece3f4;
  text-align: left;
  white-space: nowrap;
}

.order-table tbody td {
  padding: 14px 12px;
  border-bottom: 1px solid #f2ebf8;
  vertical-align: middle;
  font-size: 0.91rem;
  color: #3d3450;
}

.order-table tbody tr:hover {
  background: #fcfaff;
}

.order-table tbody tr:last-child td {
  border-bottom: none;
}

.td-code {
  font-weight: 900;
  color: #6b46d9;
  white-space: nowrap;
}

.td-date {
  white-space: nowrap;
}

.dog-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 150px;
}

.dog-info {
  min-width: 0;
}

.dog-thumb {
  width: 52px;
  height: 52px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
  border: 1px solid #ece3f4;
}

.dog-name {
  font-weight: 700;
  color: #2f1b44;
  font-size: 0.93rem;
  line-height: 1.35;
}

.money-deposit {
  color: #dc2626;
  font-weight: 800;
  white-space: nowrap;
}

.money-remaining {
  color: #2563eb;
  font-weight: 800;
  white-space: nowrap;
}

.order-badge,
.payment-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 7px 12px;
  border-radius: 999px;
  font-size: 0.79rem;
  font-weight: 800;
  white-space: nowrap;
}

.td-actions {
  min-width: 170px;
}

.table-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.table-actions .btn {
  font-size: 0.82rem;
  padding: 5px 10px;
  border-radius: 8px;
}

.status-waiting {
  background: #fff3d8;
  color: #b7791f;
}

.status-confirmed {
  background: #efe7ff;
  color: #6a1b9a;
}

.status-delivering {
  background: #ede9fe;
  color: #5b21b6;
}

.status-completed {
  background: #e7f8ee;
  color: #15803d;
}

.status-cancelled {
  background: #fdeaea;
  color: #dc2626;
}

.status-default {
  background: #f3f4f6;
  color: #4b5563;
}

.payment-confirmed {
  background: #efe7ff;
  color: #6a1b9a;
}

.payment-pending {
  background: #fff3d8;
  color: #b7791f;
}

.payment-completed {
  background: #e7f8ee;
  color: #15803d;
}

.payment-cancelled {
  background: #fdeaea;
  color: #dc2626;
}

.payment-default {
  background: #f3f4f6;
  color: #4b5563;
}

.modal-head-custom {
  background: linear-gradient(135deg, #6a1b9a, #4a148c);
  color: #fff;
}

.modal {
  overflow-y: auto;
}

@media (max-width: 1199.98px) {
  .content-title {
    font-size: 1.55rem;
  }
}

@media (max-width: 991.98px) {
  .order-layout {
    grid-template-columns: 1fr;
  }

  .toolbar-box {
    grid-template-columns: 1fr;
  }

  .refresh-btn {
    width: 100%;
  }

  .content-title {
    font-size: 1.35rem;
  }

  .order-page-container {
    padding-left: 16px;
    padding-right: 16px;
  }
}
</style>