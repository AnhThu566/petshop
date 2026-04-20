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
            Theo dõi đơn cọc ZaloPay, xử lý bàn giao và hoàn tất đơn theo đúng luồng nghiệp vụ.
          </p>
        </div>

        <button class="refresh-btn" @click="fetchOrders" :disabled="loading">
          <i class="fas fa-sync-alt mr-1"></i> Làm mới
        </button>
      </div>

      <div class="summary-row mb-4">
        <div class="summary-box summary-waiting">
          <div class="summary-value">{{ countByStatus("Chờ xác nhận cọc") }}</div>
          <div class="summary-label">Chờ xác nhận cọc</div>
        </div>

        <div class="summary-box summary-confirmed">
          <div class="summary-value">{{ countByStatus("Đã nhận cọc") }}</div>
          <div class="summary-label">Đã nhận cọc</div>
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
            placeholder="Tìm mã đơn, khách hàng, số điện thoại, bé chó..."
            v-model.trim="searchText"
          />
        </div>

        <select class="filter-select" v-model="statusFilter">
          <option value="Tất cả">Tất cả trạng thái đơn</option>
          <option value="Chờ xác nhận cọc">Chờ xác nhận cọc</option>
          <option value="Đã nhận cọc">Đã nhận cọc</option>
          <option value="Đang giao">Đang giao</option>
          <option value="Hoàn thành">Hoàn thành</option>
          <option value="Đã hủy">Đã hủy</option>
        </select>

        <select class="filter-select" v-model="paymentFilter">
          <option value="Tất cả">Tất cả thanh toán cọc</option>
          <option value="Chờ thanh toán">Chờ thanh toán</option>
          <option value="Đã xác nhận">Đã xác nhận</option>
          <option value="Đã hoàn tất">Đã hoàn tất</option>
          <option value="Thanh toán thất bại">Thanh toán thất bại</option>
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
                <th class="col-code">Mã đơn</th>
                <th class="col-date">Ngày đặt</th>
                <th class="col-name">Khách hàng</th>
                <th class="col-phone">Số điện thoại</th>
                <th class="col-address">Địa chỉ</th>
                <th class="col-dog">Bé chó</th>
                <th class="col-farm">Nguồn cung</th>
                <th class="col-money">Tổng tiền</th>
                <th class="col-money">Tiền cọc</th>
                <th class="col-money">Còn lại</th>
                <th class="col-status">Thanh toán</th>
                <th class="col-status">Trạng thái đơn</th>
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

                <td class="td-date">
                  {{ formatDate(order.createdAt) }}
                </td>

                <td class="td-text td-name">
                  {{ order.customerName || "---" }}
                </td>

                <td class="td-text td-phone">
                  {{ order.customerPhone || "---" }}
                </td>

                <td class="td-text td-address" :title="order.customerAddress || '---'">
                  {{ order.customerAddress || "---" }}
                </td>

                <td class="td-dog">
                  <div class="dog-cell" v-if="order.dogId">
                    <img :src="getDogImage(order)" alt="dog" class="dog-thumb" />
                    <div class="dog-info">
                      <div class="dog-name">{{ order.dogId.name || "---" }}</div>
                    </div>
                  </div>
                  <span v-else class="text-danger small">Không còn dữ liệu</span>
                </td>

                <td class="td-center">
                  <span class="soft-badge" v-if="order.farmId">
                    {{ order.farmId.name }}
                  </span>
                  <span v-else>---</span>
                </td>

                <td class="td-money money-dark">{{ formatCurrency(order.totalPrice) }}</td>
                <td class="td-money money-deposit">{{ formatCurrency(order.depositAmount) }}</td>
                <td class="td-money money-remaining">{{ formatCurrency(getRemainingAmount(order)) }}</td>

                <td class="td-center">
                  <span class="status-badge" :class="getPaymentStatusClass(order.paymentStatus)">
                    {{ getPaymentStatusText(order.paymentStatus) }}
                  </span>
                </td>

                <td class="td-center">
                  <span class="status-badge" :class="getOrderStatusClass(order.status)">
                    {{ getOrderStatusText(order.status) }}
                  </span>
                </td>

                <td class="td-actions">
                  <div class="action-stack">
                    <button class="btn-action btn-view" @click="openDetail(order)">
                      <i class="fas fa-eye mr-1"></i> Chi tiết
                    </button>

                    <div v-if="order.status === 'Chờ xác nhận cọc'" class="action-row">
                      <button
                        class="btn-action btn-confirm"
                        @click="updateStatus(getOrderId(order), 'Đã nhận cọc')"
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

                    <div v-else-if="order.status === 'Đã nhận cọc'" class="action-row">
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
                <td colspan="13" class="empty-row">
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
        <div class="modal-dialog modal-xl modal-dialog-centered">
          <div class="modal-content border-0 shadow">
            <div class="modal-header modal-head-custom">
              <h5 class="modal-title mb-0">
                <i class="fas fa-receipt mr-2"></i>Chi tiết đơn đặt cọc
              </h5>
              <button type="button" class="close text-white" @click="closeDetail">
                <span>&times;</span>
              </button>
            </div>

            <div class="modal-body order-detail-body">
              <div class="detail-grid">
                <div class="detail-card">
                  <div class="detail-card-title">Thông tin khách hàng</div>

                  <div class="detail-row">
                    <span>Họ tên</span>
                    <strong>{{ selectedOrder.customerName || "---" }}</strong>
                  </div>
                  <div class="detail-row">
                    <span>Số điện thoại</span>
                    <strong>{{ selectedOrder.customerPhone || "---" }}</strong>
                  </div>
                  <div class="detail-row">
                    <span>Địa chỉ</span>
                    <strong class="text-right wrap-text">{{ selectedOrder.customerAddress || "---" }}</strong>
                  </div>
                  <div class="detail-row">
                    <span>Ghi chú</span>
                    <strong class="text-right wrap-text">{{ selectedOrder.note || "Không có" }}</strong>
                  </div>
                </div>

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
                    <span>Thanh toán cọc</span>
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
                      <strong>{{ selectedOrder.dogId.saleStatus || "---" }}</strong>
                    </div>
                    <div class="detail-row">
                      <span>Duyệt hồ sơ</span>
                      <strong>{{ selectedOrder.dogId.approvalStatus || "---" }}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div class="detail-card mt-4" v-if="selectedOrder.farmId">
                <div class="detail-card-title">Thông tin nguồn cung</div>

                <div class="detail-row">
                  <span>Tên đối tác</span>
                  <strong>{{ selectedOrder.farmId.name }}</strong>
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
        const custAddress = order.customerAddress ? order.customerAddress.toLowerCase() : "";
        const shortCode = this.getShortOrderCode(this.getOrderId(order)).toLowerCase();
        const dogName = order.dogId?.name ? order.dogId.name.toLowerCase() : "";
        const paymentStatus = (order.paymentStatus || "").toLowerCase();

        const matchSearch =
          !text ||
          custName.includes(text) ||
          custPhone.includes(text) ||
          custAddress.includes(text) ||
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

    countByStatus(status) {
      return this.orders.filter((order) => order.status === status).length;
    },

    async fetchOrders() {
      try {
        this.loading = true;
        const data = await OrderService.getAll();
        const rawOrders = Array.isArray(data) ? data : [];
        this.orders = rawOrders;
      } catch (error) {
        console.error("Lỗi lấy danh sách đơn hàng:", error);
        alert("Không thể tải danh sách đơn đặt cọc.");
      } finally {
        this.loading = false;
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
        message += "\n\nLưu ý: Chỉ bấm khi khách đã nhận chó và thanh toán đủ số tiền còn lại.";
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
      const image = order?.dogId?.image;
      if (!image) return "https://via.placeholder.com/80";
      if (String(image).startsWith("http")) return image;
      return "http://localhost:3000" + image;
    },

    getOrderStatusText(status) {
      if (status === "Chờ xác nhận cọc") return "Chờ xác nhận cọc";
      if (status === "Đã nhận cọc") return "Đã nhận cọc";
      if (status === "Đang giao") return "Đang giao";
      if (status === "Hoàn thành") return "Hoàn thành";
      if (status === "Đã hủy") return "Đã hủy";
      return status || "---";
    },

    getPaymentStatusText(status) {
      if (status === "Chờ thanh toán") return "Chờ thanh toán";
      if (status === "Chưa thanh toán") return "Chưa thanh toán";
      if (status === "Đã xác nhận") return "Đã xác nhận";
      if (status === "Đã hoàn tất") return "Đã hoàn tất";
      if (status === "Thanh toán thất bại") return "Thanh toán thất bại";
      if (status === "Đã hủy") return "Đã hủy";
      if (status === "Đã hủy xác nhận") return "Đã hủy";
      return status || "---";
    },

    getOrderStatusClass(status) {
      if (status === "Chờ xác nhận cọc") return "badge-waiting";
      if (status === "Đã nhận cọc") return "badge-confirmed";
      if (status === "Đang giao") return "badge-delivering";
      if (status === "Hoàn thành") return "badge-completed";
      if (status === "Đã hủy") return "badge-cancelled";
      return "badge-default";
    },

    getPaymentStatusClass(status) {
      if (status === "Chờ thanh toán") return "badge-waiting";
      if (status === "Chưa thanh toán") return "badge-default";
      if (status === "Đã xác nhận") return "badge-confirmed";
      if (status === "Đã hoàn tất") return "badge-completed";
      if (status === "Thanh toán thất bại") return "badge-cancelled";
      if (status === "Đã hủy" || status === "Đã hủy xác nhận") return "badge-cancelled";
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
  max-width: 1700px;
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
  white-space: nowrap;
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
  grid-template-columns: minmax(0, 1.6fr) 220px 220px auto;
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
  white-space: nowrap;
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
  min-width: 1600px;
  table-layout: fixed;
}

.order-table thead th {
  background: #faf6fd;
  color: #514564;
  font-size: 0.86rem;
  font-weight: 800;
  padding: 14px 10px;
  border-bottom: 1px solid #ece3f4;
  text-align: center;
  white-space: nowrap;
}

.order-table tbody td {
  padding: 14px 10px;
  border-bottom: 1px solid #f2ebf8;
  vertical-align: middle;
  font-size: 0.89rem;
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
  width: 105px;
}

.col-date {
  width: 145px;
}

.col-name {
  width: 160px;
}

.col-phone {
  width: 140px;
}

.col-address {
  width: 220px;
}

.col-dog {
  width: 180px;
}

.col-farm {
  width: 150px;
}

.col-money {
  width: 135px;
}

.col-status {
  width: 145px;
}

.col-action {
  width: 170px;
}

.td-code {
  font-weight: 900;
  color: #6b46d9;
  white-space: nowrap;
}

.td-date,
.td-money,
.td-center {
  white-space: nowrap;
}

.td-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.td-name,
.td-phone {
  font-weight: 700;
}

.td-address {
  color: #6b7280;
}

.td-dog {
  text-align: left !important;
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  white-space: nowrap;
}

.money-dark {
  font-weight: 800;
  color: #1f2937;
}

.money-deposit {
  font-weight: 900;
  color: #dc2626;
}

.money-remaining {
  font-weight: 900;
  color: #2563eb;
}

.status-badge {
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
  min-width: 0;
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
  flex-wrap: nowrap;
  justify-content: center;
}

.btn-action {
  border: none;
  border-radius: 10px;
  min-height: 34px;
  padding: 0 12px;
  font-size: 0.8rem;
  font-weight: 800;
  transition: all 0.2s ease;
  white-space: nowrap;
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
  width: 34px;
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
  white-space: nowrap;
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

.wrap-text {
  white-space: normal;
  word-break: break-word;
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

@media (max-width: 575.98px) {
  .summary-row {
    grid-template-columns: 1fr;
  }

  .page-title {
    font-size: 1.2rem;
  }
}
</style>