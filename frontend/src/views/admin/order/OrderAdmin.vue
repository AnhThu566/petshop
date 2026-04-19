<template>
  <div class="admin-orders py-4">
    <div class="container-fluid admin-order-container">
      <div class="page-head">
        <div>
          <h4 class="page-title">
            <i class="fas fa-file-invoice-dollar mr-2"></i>
            Quản lý đơn đặt cọc
          </h4>
          <p class="page-subtitle mb-0">
            Theo dõi cọc, xác nhận giao dịch và xử lý bàn giao theo đúng luồng nghiệp vụ.
          </p>
        </div>

        <button class="refresh-btn" @click="fetchOrders" :disabled="loading">
          <i class="fas fa-sync-alt mr-1"></i> Làm mới
        </button>
      </div>

      <div class="summary-row mb-4">
        <div class="summary-box summary-waiting">
          <div class="summary-value">{{ countByStatus("Chờ xác nhận cọc") }}</div>
          <div class="summary-label">Chờ xác nhận</div>
        </div>

        <div class="summary-box summary-confirmed">
          <div class="summary-value">{{ countByStatus("Đã xác nhận cọc") }}</div>
          <div class="summary-label">Đã xác nhận</div>
        </div>

        <div class="summary-box summary-delivering">
          <div class="summary-value">{{ countByStatus("Đang giao") }}</div>
          <div class="summary-label">Đang giao</div>
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

      <div class="filter-bar">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input
            type="text"
            placeholder="Tìm khách hàng, số điện thoại, mã đơn, tên bé chó..."
            v-model.trim="searchText"
          />
        </div>

        <select class="filter-select" v-model="statusFilter">
          <option value="Tất cả">Tất cả trạng thái đơn</option>
          <option value="Chờ xác nhận cọc">Chờ xác nhận cọc</option>
          <option value="Đã xác nhận cọc">Đã xác nhận cọc</option>
          <option value="Đang giao">Đang giao</option>
          <option value="Hoàn thành">Hoàn thành</option>
          <option value="Đã hủy">Đã hủy</option>
        </select>

        <select class="filter-select" v-model="paymentFilter">
          <option value="Tất cả">Tất cả thanh toán cọc</option>
          <option value="Chưa thanh toán">Chưa thanh toán</option>
          <option value="Đã gửi minh chứng">Đã gửi minh chứng</option>
          <option value="Đã xác nhận">Đã xác nhận</option>
          <option value="Đã hoàn tất">Đã hoàn tất</option>
          <option value="Đã hủy">Đã hủy</option>
        </select>

        <div class="filter-total">
          Tổng: <strong>{{ filteredOrders.length }}</strong> đơn
        </div>
      </div>

      <div v-if="loading" class="empty-panel">
        <i class="fas fa-spinner fa-spin empty-icon"></i>
        <p>Đang tải danh sách đơn đặt cọc...</p>
      </div>

      <div v-else class="table-card">
        <div class="table-wrap">
          <table class="order-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Ngày đặt</th>
                <th>Khách hàng</th>
                <th>Bé cún</th>
                <th>Nguồn cung</th>
                <th>Tổng tiền</th>
                <th>Tiền cọc</th>
                <th>Còn lại</th>
                <th>Thanh toán cọc</th>
                <th>Trạng thái đơn</th>
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

                <td class="td-date">
                  {{ formatDate(order.createdAt) }}
                </td>

                <td class="td-customer">
                  <div class="customer-name">{{ order.customerName || "---" }}</div>
                  <div class="customer-sub">
                    <i class="fas fa-phone mr-1"></i>{{ order.customerPhone || "---" }}
                  </div>
                  <div class="customer-sub customer-address">
                    <i class="fas fa-map-marker-alt mr-1"></i>{{ order.customerAddress || "---" }}
                  </div>
                </td>

                <td class="text-left">
                  <div class="dog-cell" v-if="order.dogId">
                    <img :src="getDogImage(order)" alt="dog" class="dog-thumb" />
                    <div class="dog-info">
                      <div class="dog-name">{{ order.dogId.name || "---" }}</div>
                      <div class="dog-sub">
                        {{ formatCurrency(order.dogId.price) }}
                      </div>
                    </div>
                  </div>
                  <span v-else class="text-danger small">Chó không còn dữ liệu</span>
                </td>

                <td>
                  <span class="soft-badge" v-if="order.farmId">
                    {{ order.farmId.name }}
                  </span>
                  <span v-else>---</span>
                </td>

                <td class="money-dark">{{ formatCurrency(order.totalPrice) }}</td>
                <td class="money-deposit">{{ formatCurrency(order.depositAmount) }}</td>
                <td class="money-remaining">{{ formatCurrency(getRemainingAmount(order)) }}</td>

                <td>
                  <span class="status-badge" :class="getPaymentStatusClass(order.paymentStatus)">
                    {{ getPaymentStatusText(order.paymentStatus) }}
                  </span>
                </td>

                <td>
                  <span class="status-badge" :class="getOrderStatusClass(order.status)">
                    {{ getOrderStatusText(order.status) }}
                  </span>
                </td>

                <td class="td-actions">
                  <div class="action-stack">
                    <button class="btn-action btn-view" @click="openDetail(order)">
                      <i class="fas fa-eye mr-1"></i> Xem
                    </button>

                    <div v-if="order.status === 'Chờ xác nhận cọc'" class="action-row">
                      <button
                        class="btn-action btn-confirm"
                        @click="updateStatus(getOrderId(order), 'Đã xác nhận cọc')"
                        title="Xác nhận đã nhận cọc"
                      >
                        <i class="fas fa-check mr-1"></i> Xác nhận
                      </button>
                      <button
                        class="btn-action btn-cancel"
                        @click="updateStatus(getOrderId(order), 'Đã hủy')"
                        title="Hủy đơn"
                      >
                        <i class="fas fa-times"></i>
                      </button>
                    </div>

                    <div v-else-if="order.status === 'Đã xác nhận cọc'" class="action-row">
                      <button
                        class="btn-action btn-delivery"
                        @click="updateStatus(getOrderId(order), 'Đang giao')"
                        title="Bắt đầu bàn giao"
                      >
                        <i class="fas fa-truck mr-1"></i> Đang giao
                      </button>
                      <button
                        class="btn-action btn-cancel"
                        @click="updateStatus(getOrderId(order), 'Đã hủy')"
                        title="Hủy đơn"
                      >
                        <i class="fas fa-times"></i>
                      </button>
                    </div>

                    <div v-else-if="order.status === 'Đang giao'" class="action-row">
                      <button
                        class="btn-action btn-finish"
                        @click="updateStatus(getOrderId(order), 'Hoàn thành')"
                        title="Chỉ bấm khi đã bàn giao xong và thanh toán đủ"
                      >
                        <i class="fas fa-flag-checkered mr-1"></i> Hoàn thành
                      </button>
                      <button
                        class="btn-action btn-cancel"
                        @click="updateStatus(getOrderId(order), 'Đã hủy')"
                        title="Hủy đơn"
                      >
                        <i class="fas fa-times"></i>
                      </button>
                    </div>

                    <div v-else class="closed-state">
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
                <td colspan="11" class="empty-row">
                  <i class="fas fa-search fa-2x mb-3 d-block"></i>
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
            <div class="modal-header modal-head-custom">
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
                  <p class="mb-1"><strong>Trạng thái đơn:</strong> {{ getOrderStatusText(selectedOrder.status) }}</p>
                  <p class="mb-1"><strong>Thanh toán cọc:</strong> {{ getPaymentStatusText(selectedOrder.paymentStatus) }}</p>
                  <p class="mb-1"><strong>Tổng tiền:</strong> {{ formatCurrency(selectedOrder.totalPrice) }}</p>
                  <p class="mb-1"><strong>Tiền cọc:</strong> {{ formatCurrency(selectedOrder.depositAmount) }}</p>
                  <p class="mb-1"><strong>Tiền còn lại:</strong> {{ formatCurrency(getRemainingAmount(selectedOrder)) }}</p>
                  <p class="mb-1"><strong>Phương thức cọc:</strong> {{ selectedOrder.paymentMethod || "Chuyển khoản" }}</p>
                  <p class="mb-1"><strong>Minh chứng cọc:</strong> {{ selectedOrder.paymentProof || "Không có" }}</p>
                </div>

                <div class="col-12" v-if="selectedOrder.dogId">
                  <hr />
                  <h6 class="font-weight-bold text-danger">Thông tin bé cún</h6>
                  <div class="d-flex align-items-center flex-wrap">
                    <img
                      :src="getDogImage(selectedOrder)"
                      alt="dog"
                      class="rounded shadow-sm mr-3 mb-2"
                      style="width: 90px; height: 90px; object-fit: cover;"
                    />
                    <div>
                      <p class="mb-1"><strong>Tên:</strong> {{ selectedOrder.dogId.name }}</p>
                      <p class="mb-1"><strong>Giá:</strong> {{ formatCurrency(selectedOrder.dogId.price) }}</p>
                      <p class="mb-1"><strong>Trạng thái chó:</strong> {{ selectedOrder.dogId.saleStatus || "---" }}</p>
                      <p class="mb-1"><strong>Duyệt hồ sơ:</strong> {{ selectedOrder.dogId.approvalStatus || "---" }}</p>
                    </div>
                  </div>
                </div>

                <div class="col-12 mt-3" v-if="selectedOrder.farmId">
                  <hr />
                  <h6 class="font-weight-bold text-dark">Thông tin nguồn cung</h6>
                  <p class="mb-1"><strong>Tên đối tác:</strong> {{ selectedOrder.farmId.name }}</p>
                </div>
              </div>
            </div>

            <div class="modal-footer">
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

export default {
  name: "AdminOrderPage",

  data() {
    return {
      orders: [],
      searchText: "",
      statusFilter: "Tất cả",
      paymentFilter: "Tất cả",
      selectedOrder: null,
      loading: false,
    };
  },

  computed: {
    filteredOrders() {
      return this.orders.filter((order) => {
        const text = (this.searchText || "").toLowerCase().trim();
        const custName = order.customerName ? order.customerName.toLowerCase() : "";
        const custPhone = order.customerPhone || "";
        const shortCode = this.getShortOrderCode(this.getOrderId(order)).toLowerCase();
        const dogName = order.dogId?.name ? order.dogId.name.toLowerCase() : "";
        const paymentStatus = (order.paymentStatus || "").toLowerCase();

        const matchSearch =
          !text ||
          custName.includes(text) ||
          custPhone.includes(text) ||
          shortCode.includes(text) ||
          dogName.includes(text) ||
          paymentStatus.includes(text);

        const matchStatus =
          this.statusFilter === "Tất cả" || order.status === this.statusFilter;

        const matchPayment =
          this.paymentFilter === "Tất cả" ||
          order.paymentStatus === this.paymentFilter;

        return matchSearch && matchStatus && matchPayment;
      });
    },
  },

  methods: {
    getOrderId(order) {
      return order?._id || order?.id || "";
    },

    normalizeOrderStatus(status) {
      if (status === "Đã nhận cọc") return "Đã xác nhận cọc";
      return status;
    },

    normalizePaymentStatus(status) {
      if (status === "Đã hủy xác nhận") return "Đã hủy";
      return status;
    },

    countByStatus(status) {
      return this.orders.filter(
        (order) => this.normalizeOrderStatus(order.status) === status
      ).length;
    },

    async fetchOrders() {
      try {
        this.loading = true;
        const data = await OrderService.getAll();
        const rawOrders = Array.isArray(data) ? data : [];
        this.orders = rawOrders.map((item) => ({
          ...item,
          status: this.normalizeOrderStatus(item.status),
          paymentStatus: this.normalizePaymentStatus(item.paymentStatus),
        }));
      } catch (error) {
        console.error("Lỗi lấy danh sách đơn hàng:", error);
        alert("Không thể tải danh sách đơn đặt cọc.");
      } finally {
        this.loading = false;
      }
    },

    mapStatusForApi(status) {
      if (status === "Đã xác nhận cọc") return "Đã nhận cọc";
      return status;
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
        message += "\n\nLưu ý: Chỉ bấm khi khách đã nhận chó và thanh toán đủ số tiền còn lại.";
      }

      if (!confirm(message)) return;

      try {
        await OrderService.updateStatus(id, this.mapStatusForApi(status));
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
      const image = order?.dogId?.image;
      if (!image) return "https://via.placeholder.com/80";
      if (String(image).startsWith("http")) return image;
      return "http://localhost:3000" + image;
    },

    getOrderStatusText(status) {
      if (status === "Chờ xác nhận cọc") return "Chờ xác nhận";
      if (status === "Đã xác nhận cọc") return "Đã xác nhận";
      if (status === "Đang giao") return "Đang giao";
      if (status === "Hoàn thành") return "Hoàn thành";
      if (status === "Đã hủy") return "Đã hủy";
      return status || "---";
    },

    getPaymentStatusText(status) {
      if (status === "Chưa thanh toán") return "Chưa thanh toán";
      if (status === "Đã gửi minh chứng") return "Đã gửi minh chứng";
      if (status === "Đã xác nhận") return "Đã xác nhận";
      if (status === "Đã hoàn tất") return "Đã hoàn tất";
      if (status === "Đã hủy") return "Đã hủy";
      return status || "---";
    },

    getOrderStatusClass(status) {
      if (status === "Chờ xác nhận cọc") return "badge-waiting";
      if (status === "Đã xác nhận cọc") return "badge-confirmed";
      if (status === "Đang giao") return "badge-delivering";
      if (status === "Hoàn thành") return "badge-completed";
      if (status === "Đã hủy") return "badge-cancelled";
      return "badge-default";
    },

    getPaymentStatusClass(status) {
      if (status === "Chưa thanh toán") return "badge-default";
      if (status === "Đã gửi minh chứng") return "badge-waiting";
      if (status === "Đã xác nhận") return "badge-confirmed";
      if (status === "Đã hoàn tất") return "badge-completed";
      if (status === "Đã hủy") return "badge-cancelled";
      return "badge-default";
    },
  },

  mounted() {
    this.fetchOrders();
  },
};
</script>

<style scoped>
.admin-orders {
  min-height: 100vh;
  background: linear-gradient(180deg, #faf7fc 0%, #f4eef9 100%);
}

.admin-order-container {
  max-width: 1560px;
  padding-left: 18px;
  padding-right: 18px;
}

.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 22px;
  padding-bottom: 18px;
  border-bottom: 1px solid #ece3f4;
}

.page-title {
  margin: 0 0 4px;
  font-weight: 900;
  color: #2f1b44;
}

.page-title i {
  color: #f59e0b;
}

.page-subtitle {
  color: #7b7287;
  font-size: 0.92rem;
}

.refresh-btn {
  border: none;
  background: linear-gradient(135deg, #6a1b9a, #4a148c);
  color: #fff;
  border-radius: 12px;
  height: 42px;
  padding: 0 16px;
  font-weight: 800;
  font-size: 0.9rem;
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

.summary-row {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 14px;
}

.summary-box {
  border-radius: 18px;
  padding: 16px 18px;
  color: #fff;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
}

.summary-value {
  font-size: 1.7rem;
  font-weight: 900;
  line-height: 1;
  margin-bottom: 6px;
}

.summary-label {
  font-size: 0.93rem;
  font-weight: 700;
}

.summary-waiting {
  background: linear-gradient(135deg, #f0ad4e, #d9941b);
}

.summary-confirmed {
  background: linear-gradient(135deg, #7c3aed, #5b21b6);
}

.summary-delivering {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
}

.summary-completed {
  background: linear-gradient(135deg, #22c55e, #15803d);
}

.summary-cancelled {
  background: linear-gradient(135deg, #ef4444, #b91c1c);
}

.filter-bar {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(220px, 0.8fr) minmax(220px, 0.8fr) auto;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}

.search-box {
  position: relative;
  min-width: 0;
}

.search-box i {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #8b7fa0;
  font-size: 0.92rem;
  pointer-events: none;
}

.search-box input,
.filter-select {
  width: 100%;
  height: 44px;
  border: 1px solid #dfd3ec;
  border-radius: 14px;
  padding: 0 14px;
  outline: none;
  font-size: 0.92rem;
  background: #fff;
  color: #3b3150;
}

.search-box input {
  padding-left: 38px;
}

.search-box input:focus,
.filter-select:focus {
  border-color: #7b3fc8;
  box-shadow: 0 0 0 3px rgba(123, 63, 200, 0.08);
}

.filter-total {
  text-align: right;
  color: #6b7280;
  font-size: 0.92rem;
  white-space: nowrap;
}

.empty-panel,
.table-card {
  background: #ffffff;
  border: 1px solid #eee2f7;
  border-radius: 20px;
  box-shadow: 0 10px 24px rgba(106, 27, 154, 0.06);
}

.empty-panel {
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
  min-width: 1220px;
}

.order-table thead th {
  background: #faf6fd;
  color: #514564;
  font-size: 0.86rem;
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
  font-size: 0.9rem;
  color: #3d3450;
  text-align: center;
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
  color: #6b7280;
}

.td-customer {
  text-align: left !important;
  min-width: 220px;
}

.customer-name {
  font-weight: 800;
  color: #2f1b44;
}

.customer-sub {
  color: #8b7fa0;
  font-size: 0.83rem;
  margin-top: 3px;
}

.customer-address {
  max-width: 240px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dog-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 160px;
  text-align: left;
}

.dog-info {
  min-width: 0;
}

.dog-thumb {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  object-fit: cover;
  flex-shrink: 0;
  border: 1px solid #ece3f4;
}

.dog-name {
  font-weight: 800;
  color: #2f1b44;
  line-height: 1.3;
}

.dog-sub {
  color: #8b7fa0;
  font-size: 0.82rem;
  margin-top: 2px;
}

.soft-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 7px 12px;
  border-radius: 999px;
  background: #f8f3fc;
  border: 1px solid #ece3f4;
  color: #6b7280;
  font-size: 0.82rem;
  font-weight: 700;
}

.money-dark {
  font-weight: 800;
  color: #1f2937;
  white-space: nowrap;
}

.money-deposit {
  font-weight: 900;
  color: #dc2626;
  white-space: nowrap;
}

.money-remaining {
  font-weight: 900;
  color: #2563eb;
  white-space: nowrap;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 7px 12px;
  border-radius: 999px;
  font-size: 0.79rem;
  font-weight: 800;
  white-space: nowrap;
}

.badge-waiting {
  background: #fff3d8;
  color: #b7791f;
}

.badge-confirmed {
  background: #efe7ff;
  color: #6a1b9a;
}

.badge-delivering {
  background: #ede9fe;
  color: #5b21b6;
}

.badge-completed {
  background: #e7f8ee;
  color: #15803d;
}

.badge-cancelled {
  background: #fdeaea;
  color: #dc2626;
}

.badge-default {
  background: #f3f4f6;
  color: #4b5563;
}

.td-actions {
  min-width: 180px;
}

.action-stack {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.action-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
}

.btn-action {
  border: none;
  border-radius: 10px;
  min-height: 32px;
  padding: 0 12px;
  font-size: 0.8rem;
  font-weight: 800;
  transition: all 0.2s ease;
}

.btn-view {
  background: #fff;
  color: #4b5563;
  border: 1px solid #d1d5db;
}

.btn-confirm {
  background: #7c3aed;
  color: #fff;
}

.btn-delivery {
  background: #2563eb;
  color: #fff;
}

.btn-finish {
  background: #16a34a;
  color: #fff;
}

.btn-cancel {
  background: #fff;
  color: #dc2626;
  border: 1px solid #fecaca;
  width: 32px;
  padding: 0;
}

.btn-action:hover {
  transform: translateY(-1px);
  opacity: 0.95;
}

.closed-state {
  color: #6b7280;
  font-size: 0.82rem;
  font-weight: 800;
}

.empty-row {
  padding: 52px 12px !important;
  text-align: center;
  color: #7a708a;
}

.modal-head-custom {
  background: linear-gradient(135deg, #6a1b9a, #4a148c);
  color: #fff;
}

.modal {
  overflow-y: auto;
}

@media (max-width: 1399.98px) {
  .summary-row {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .filter-bar {
    grid-template-columns: 1fr 1fr;
  }

  .filter-total {
    text-align: left;
  }
}

@media (max-width: 991.98px) {
  .summary-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .filter-bar {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 575.98px) {
  .summary-row {
    grid-template-columns: 1fr;
  }

  .page-title {
    font-size: 1.2rem;
  }
}
</style>