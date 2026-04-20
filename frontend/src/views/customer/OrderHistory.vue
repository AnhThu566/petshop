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
                Theo dõi các đơn đặt cọc ZaloPay của bạn
              </p>
            </div>
          </div>

          <div class="toolbar-box">
            <div class="search-box">
              <i class="fas fa-search"></i>
              <input
                type="text"
                v-model.trim="searchText"
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
                    <th class="col-code">Mã đơn</th>
                    <th class="col-dog">Bé chó</th>
                    <th class="col-date">Ngày đặt</th>
                    <th class="col-money">Tổng tiền</th>
                    <th class="col-money">Tiền cọc</th>
                    <th class="col-money">Còn lại</th>
                    <th class="col-status">Trạng thái đơn</th>
                    <th class="col-payment">Thanh toán</th>
                    <th class="col-action">Thao tác</th>
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

                    <td class="td-dog">
                      <div class="dog-cell" v-if="order.dogId">
                        <img :src="getDogImage(order)" alt="dog" class="dog-thumb" />
                        <div class="dog-info">
                          <div class="dog-name">{{ order.dogId.name || "Bé cún" }}</div>
                        </div>
                      </div>
                      <span v-else class="text-danger">Không còn dữ liệu</span>
                    </td>

                    <td class="td-date">{{ formatDate(order.createdAt) }}</td>
                    <td class="td-money">{{ formatCurrency(order.totalPrice) }}</td>
                    <td class="td-money money-deposit">{{ formatCurrency(order.depositAmount) }}</td>
                    <td class="td-money money-remaining">{{ formatCurrency(getRemainingAmount(order)) }}</td>

                    <td class="td-center">
                      <span class="order-badge" :class="getStatusClass(order.status)">
                        {{ getOrderStatusText(order.status) }}
                      </span>
                    </td>

                    <td class="td-center">
                      <span
                        class="payment-badge"
                        :class="getPaymentStatusClass(order.paymentStatus)"
                      >
                        {{ getPaymentStatusText(order.paymentStatus) }}
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
        <div class="modal-dialog modal-xl modal-dialog-centered">
          <div class="modal-content border-0 shadow">
            <div class="modal-header modal-head-custom">
              <h5 class="modal-title mb-0">
                <i class="fas fa-file-alt mr-2"></i>Chi tiết đơn đặt cọc
              </h5>
              <button type="button" class="close text-white" @click="closeDetail">
                <span>&times;</span>
              </button>
            </div>

            <div class="modal-body order-detail-body">
              <div class="detail-grid">
                <div class="detail-card">
                  <div class="detail-card-title">Thông tin đơn hàng</div>

                  <div class="detail-row">
                    <span>Mã đơn</span>
                    <strong>#{{ getShortOrderCode(getOrderId(selectedOrder)) }}</strong>
                  </div>
                  <div class="detail-row">
                    <span>Ngày đặt</span>
                    <strong>{{ formatDate(selectedOrder.createdAt) }}</strong>
                  </div>
                  <div class="detail-row">
                    <span>Trạng thái đơn</span>
                    <strong>{{ getOrderStatusText(selectedOrder.status) }}</strong>
                  </div>
                  <div class="detail-row">
                    <span>Thanh toán</span>
                    <strong>{{ getPaymentStatusText(selectedOrder.paymentStatus) }}</strong>
                  </div>
                  <div class="detail-row">
                    <span>Tổng tiền</span>
                    <strong>{{ formatCurrency(selectedOrder.totalPrice) }}</strong>
                  </div>
                  <div class="detail-row">
                    <span>Tiền cọc</span>
                    <strong class="text-danger">{{ formatCurrency(selectedOrder.depositAmount) }}</strong>
                  </div>
                  <div class="detail-row">
                    <span>Tiền còn lại</span>
                    <strong class="text-primary">{{ formatCurrency(getRemainingAmount(selectedOrder)) }}</strong>
                  </div>
                  <div class="detail-row">
                    <span>Phương thức cọc</span>
                    <strong>{{ selectedOrder.paymentMethod || "ZaloPay" }}</strong>
                  </div>
                </div>

                <div class="detail-card">
                  <div class="detail-card-title">Thông tin nhận bé</div>

                  <div class="detail-row">
                    <span>Khách hàng</span>
                    <strong>{{ selectedOrder.customerName }}</strong>
                  </div>
                  <div class="detail-row">
                    <span>Số điện thoại</span>
                    <strong>{{ selectedOrder.customerPhone }}</strong>
                  </div>
                  <div class="detail-row">
                    <span>Địa chỉ</span>
                    <strong class="text-right">{{ selectedOrder.customerAddress || "---" }}</strong>
                  </div>
                  <div class="detail-row">
                    <span>Ghi chú</span>
                    <strong class="text-right">{{ selectedOrder.note || "Không có" }}</strong>
                  </div>
                </div>
              </div>

              <div class="detail-dog-card mt-4" v-if="selectedOrder.dogId">
                <div class="detail-card-title">Thông tin bé cún</div>

                <div class="detail-dog-wrap">
                  <img
                    :src="getDogImage(selectedOrder)"
                    alt="dog"
                    class="detail-dog-thumb"
                  />
                  <div class="detail-dog-info">
                    <div class="detail-dog-name">{{ selectedOrder.dogId.name }}</div>

                    <div class="detail-row">
                      <span>Giá</span>
                      <strong>{{ formatCurrency(selectedOrder.dogId.finalPrice || selectedOrder.dogId.price) }}</strong>
                    </div>

                    <div class="detail-row">
                      <span>Trạng thái chó</span>
                      <strong>{{ getDogSaleStatusText(selectedOrder.dogId.saleStatus) }}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button
                v-if="selectedOrder.status === 'Chờ xác nhận cọc'"
                class="btn btn-outline-danger"
                @click="cancelOrder(selectedOrder)"
              >
                Hủy đơn
              </button>
              <button class="btn btn-secondary" @click="closeDetail">Đóng</button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="selectedOrder" class="modal-backdrop fade show"></div>
    </div>
  </div>
</template>

<script>
import OrderService from "@/services/order.service";
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
      if (status === "Sẵn sàng bán") return "Còn nhận đặt cọc";
      if (["Chờ thanh toán", "Đã đặt cọc", "Đang giao"].includes(status)) {
        return "Đã có người đặt";
      }
      if (status === "Đã bán") return "Đã bán";
      if (status === "Ngừng bán") return "Tạm ngừng mở bán";
      return "Chưa mở bán";
    },

    getOrderStatusText(status) {
      if (status === "Chờ xác nhận cọc") return "Chờ xác nhận";
      if (status === "Đã nhận cọc") return "Đã nhận cọc";
      if (status === "Đang giao") return "Đang giao";
      if (status === "Hoàn thành") return "Hoàn thành";
      if (status === "Đã hủy") return "Đã hủy";
      return status || "---";
    },

    getPaymentStatusText(status) {
      if (status === "Chờ thanh toán") return "Chờ thanh toán";
      if (status === "Đã xác nhận") return "Đã xác nhận";
      if (status === "Đã hoàn tất") return "Đã hoàn tất";
      if (status === "Thanh toán thất bại") return "Thanh toán thất bại";
      if (status === "Đã hủy xác nhận") return "Đã hủy";
      if (status === "Đã hủy") return "Đã hủy";
      if (status === "Chưa thanh toán") return "Chưa thanh toán";
      return status || "---";
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
      if (status === "Chờ thanh toán") return "payment-pending";
      if (status === "Đã xác nhận") return "payment-confirmed";
      if (status === "Đã hoàn tất") return "payment-completed";
      if (status === "Thanh toán thất bại") return "payment-cancelled";
      if (status === "Đã hủy" || status === "Đã hủy xác nhận") return "payment-cancelled";
      if (status === "Chưa thanh toán") return "payment-default";
      return "payment-default";
    },

    async cancelOrder(order) {
      if (
        !confirm(
          `Bạn có chắc muốn hủy đơn #${this.getShortOrderCode(this.getOrderId(order))} không?`
        )
      ) {
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
  max-width: 1460px;
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
  padding: 0 16px 0 42px;
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
  white-space: nowrap;
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
  gap: 18px;
  overflow-x: auto;
  white-space: nowrap;
  scrollbar-width: none;
  border-bottom: 1px solid #ece3f4;
  margin-bottom: 18px;
  padding-bottom: 2px;
}

.status-tabs::-webkit-scrollbar {
  display: none;
}

.status-tab {
  flex: 0 0 auto;
  border: none;
  background: none;
  padding: 0 0 10px;
  font-weight: 700;
  color: #7f748f;
  border-bottom: 2px solid transparent;
  font-size: 0.94rem;
  transition: all 0.2s ease;
  white-space: nowrap;
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
  min-width: 1080px;
  table-layout: fixed;
}

.order-table thead th {
  background: #f8f3fc;
  color: #514564;
  font-size: 0.88rem;
  font-weight: 800;
  padding: 14px 12px;
  border-bottom: 1px solid #ece3f4;
  text-align: center;
  white-space: nowrap;
}

.order-table tbody td {
  padding: 14px 12px;
  border-bottom: 1px solid #f2ebf8;
  vertical-align: middle;
  font-size: 0.91rem;
  color: #3d3450;
  text-align: center;
}

.order-table tbody tr:hover {
  background: #fcfaff;
}

.order-table tbody tr:last-child td {
  border-bottom: none;
}

.col-code {
  width: 110px;
}

.col-dog {
  width: 240px;
}

.col-date {
  width: 150px;
}

.col-money {
  width: 140px;
}

.col-status {
  width: 150px;
}

.col-payment {
  width: 150px;
}

.col-action {
  width: 140px;
}

.td-code {
  font-weight: 900;
  color: #6b46d9;
  white-space: nowrap;
}

.td-dog {
  text-align: left !important;
}

.td-date {
  white-space: nowrap;
}

.td-money {
  white-space: nowrap;
}

.td-center {
  text-align: center;
}

.dog-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
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
  word-break: break-word;
}

.money-deposit {
  color: #dc2626;
  font-weight: 800;
}

.money-remaining {
  color: #2563eb;
  font-weight: 800;
}

.order-badge,
.payment-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 34px;
  padding: 7px 12px;
  border-radius: 999px;
  font-size: 0.79rem;
  font-weight: 800;
  white-space: nowrap;
}

.td-actions {
  min-width: 0;
}

.table-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: nowrap;
}

.table-actions .btn {
  font-size: 0.82rem;
  padding: 5px 10px;
  border-radius: 8px;
  white-space: nowrap;
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

.order-detail-body {
  padding: 22px;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.detail-card,
.detail-dog-card {
  background: #fcfbfe;
  border: 1px solid #eadcf7;
  border-radius: 18px;
  padding: 18px;
}

.detail-card-title {
  font-size: 1rem;
  font-weight: 900;
  color: #31114d;
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ece3f4;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
  padding: 9px 0;
  color: #4b5563;
  font-size: 0.93rem;
}

.detail-row + .detail-row {
  border-top: 1px dashed #ece3f4;
}

.detail-row span {
  color: #7b7287;
  font-weight: 700;
  white-space: nowrap;
}

.detail-row strong {
  color: #2f1b44;
  font-weight: 800;
  text-align: right;
}

.detail-dog-wrap {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.detail-dog-thumb {
  width: 110px;
  height: 110px;
  object-fit: cover;
  border-radius: 14px;
  border: 1px solid #ece3f4;
  flex-shrink: 0;
}

.detail-dog-info {
  min-width: 0;
  width: 100%;
}

.detail-dog-name {
  font-size: 1.08rem;
  font-weight: 900;
  color: #2f1b44;
  margin-bottom: 10px;
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

  .detail-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767.98px) {
  .detail-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .detail-row strong {
    text-align: left;
  }

  .detail-dog-wrap {
    flex-direction: column;
  }
}
</style>