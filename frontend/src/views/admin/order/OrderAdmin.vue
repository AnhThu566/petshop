<template>
  <div class="admin-order-page bg-light py-4">
    <div class="container-fluid px-2">
      <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3 flex-wrap">
        <div>
          <h4 class="font-weight-bold text-dark mb-1">
            <i class="fas fa-file-invoice-dollar mr-2 text-primary"></i>
            QUẢN LÝ ĐƠN ĐẶT CỌC
          </h4>
          <div class="small text-muted">
            Theo dõi đơn cọc ZaloPay, xử lý bàn giao và hoàn tất đơn theo đúng luồng nghiệp vụ.
          </div>
        </div>

        <button class="btn btn-outline-primary btn-sm mt-2 mt-md-0" @click="fetchOrders" :disabled="loading">
          <i class="fas fa-sync-alt mr-1"></i> Làm mới
        </button>
      </div>

      <div class="summary-row mb-4">
        <div class="summary-box summary-waiting">
          <div class="summary-value">{{ countByStatus("Chờ xác nhận cọc") }}</div>
          <div class="summary-label">Chờ thanh toán</div>
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
          <div class="summary-label">Đã hủy / Thất bại</div>
        </div>
      </div>

      <div class="row mb-3 align-items-center">
        <div class="col-lg-5 col-md-12 mb-2 mb-lg-0">
          <div class="input-group input-group-sm shadow-sm">
            <div class="input-group-prepend">
              <span class="input-group-text bg-white text-primary border-right-0">
                <i class="fas fa-search"></i>
              </span>
            </div>
            <input
              type="text"
              class="form-control border-left-0"
              placeholder="Tìm mã đơn, khách hàng, số điện thoại, bé chó..."
              v-model.trim="searchText"
            />
          </div>
        </div>

        <div class="col-lg-3 col-md-6 mb-2 mb-lg-0">
          <select class="form-control form-control-sm shadow-sm" v-model="statusFilter">
            <option value="Tất cả">Tất cả trạng thái đơn</option>
            <option value="Chờ xác nhận cọc">Chờ thanh toán</option>
            <option value="Đã nhận cọc">Đã nhận cọc</option>
            <option value="Đang giao">Đang giao</option>
            <option value="Hoàn thành">Hoàn thành</option>
            <option value="Đã hủy">Đã hủy</option>
          </select>
        </div>

        <div class="col-lg-3 col-md-6 mb-2 mb-lg-0">
          <select class="form-control form-control-sm shadow-sm" v-model="paymentFilter">
            <option value="Tất cả">Tất cả thanh toán cọc</option>
            <option value="Chờ thanh toán">Chờ thanh toán</option>
            <option value="Đã xác nhận">Đã xác nhận</option>
            <option value="Đã hoàn tất">Đã hoàn tất</option>
            <option value="Thanh toán thất bại">Thanh toán thất bại</option>
          </select>
        </div>

        <div class="col-lg-1 col-md-12 text-lg-right">
          <div class="small text-muted font-weight-bold">
            Tổng: {{ filteredOrders.length }} đơn
          </div>
        </div>
      </div>

      <div v-if="loading" class="card border-0 shadow-sm">
        <div class="card-body text-center py-5 text-muted">
          <i class="fas fa-spinner fa-spin fa-3x mb-3 d-block"></i>
          Đang tải danh sách đơn đặt cọc...
        </div>
      </div>

      <div v-else class="card border-0 shadow-sm">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0 admin-order-table">
            <thead class="bg-light">
              <tr class="small text-secondary">
                <th class="py-3 text-center">Mã đơn</th>
                <th class="py-3 text-center">Ngày đặt</th>
                <th class="py-3 text-center">Khách hàng</th>
                <th class="py-3 text-center">Số điện thoại</th>
                <th class="py-3 text-center">Địa chỉ</th>
                <th class="py-3 text-center">Bé chó</th>
                <th class="py-3 text-center">Nguồn cung</th>
                <th class="py-3 text-center">Tổng tiền</th>
                <th class="py-3 text-center">Tiền cọc</th>
                <th class="py-3 text-center">Còn lại</th>
                <th class="py-3 text-center">Thanh toán</th>
                <th class="py-3 text-center">Trạng thái đơn</th>
                <th class="py-3 text-center">Thao tác</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="(order, index) in filteredOrders"
                :key="getOrderId(order) || index"
              >
                <td class="font-weight-bold text-primary text-center">
                  #{{ getShortOrderCode(getOrderId(order)) }}
                </td>

                <td class="text-center">
                  {{ formatDate(order.createdAt) }}
                </td>

                <td class="font-weight-bold text-dark text-center">
                  {{ order.customerName || "---" }}
                </td>

                <td class="font-weight-bold text-dark text-center">
                  {{ order.customerPhone || "---" }}
                </td>

                <td class="text-muted text-center text-truncate-cell" :title="order.customerAddress || '---'">
                  {{ order.customerAddress || "---" }}
                </td>

                <td class="text-left">
                  <div class="dog-cell" v-if="order.dogId">
                    <img :src="getDogImage(order)" alt="dog" class="dog-thumb" />
                    <div class="dog-info">
                      <div class="dog-name">{{ order.dogId.name || "---" }}</div>
                    </div>
                  </div>
                  <span v-else class="text-danger small">Không còn dữ liệu</span>
                </td>

                <td class="text-center">
                  <span class="soft-badge" v-if="order.farmId">
                    {{ order.farmId.name }}
                  </span>
                  <span v-else>---</span>
                </td>

                <td class="font-weight-bold text-dark text-center">
                  {{ formatCurrency(order.totalPrice) }}
                </td>

                <td class="font-weight-bold text-danger text-center">
                  {{ formatCurrency(order.depositAmount) }}
                </td>

                <td class="font-weight-bold text-primary text-center">
                  {{ formatCurrency(getRemainingAmount(order)) }}
                </td>

                <td class="text-center">
                  <span class="status-badge" :class="getPaymentStatusClass(order.paymentStatus)">
                    {{ getPaymentStatusText(order.paymentStatus) }}
                  </span>
                </td>

                <td class="text-center">
                  <span class="status-badge" :class="getOrderStatusClass(order.status)">
                    {{ getOrderStatusText(order.status, order.paymentStatus) }}
                  </span>
                </td>

                <td class="text-center">
                  <button class="btn-action btn-view" @click="openDetail(order)">
                    <i class="fas fa-eye mr-1"></i> Chi tiết
                  </button>
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
        <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
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
              <div class="row">
                <div class="col-lg-6 mb-3">
                  <div class="detail-card h-100">
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
                </div>

                <div class="col-lg-6 mb-3">
                  <div class="detail-card h-100">
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
                      <strong>{{ getOrderStatusText(selectedOrder.status, selectedOrder.paymentStatus) }}</strong>
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

                <div class="col-12 mb-3" v-if="selectedOrder.dogId">
                  <div class="detail-card">
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
                        <div class="detail-row">
                          <span>Duyệt hồ sơ</span>
                          <strong>{{ selectedOrder.dogId.approvalStatus || "---" }}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col-12" v-if="selectedOrder.farmId">
                  <div class="detail-card">
                    <div class="detail-card-title">Thông tin nguồn cung</div>

                    <div class="detail-row">
                      <span>Tên đối tác</span>
                      <strong>{{ selectedOrder.farmId.name }}</strong>
                    </div>
                  </div>
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
        const orderStatus = this.getOrderStatusText(order.status, order.paymentStatus).toLowerCase();

        const matchSearch =
          !text ||
          custName.includes(text) ||
          custPhone.includes(text) ||
          custAddress.includes(text) ||
          shortCode.includes(text) ||
          dogName.includes(text) ||
          paymentStatus.includes(text) ||
          orderStatus.includes(text);

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

    isPendingPayment(order) {
      return (
        order?.status === "Chờ xác nhận cọc" &&
        order?.paymentStatus === "Chờ thanh toán"
      );
    },

    isFailedPayment(order) {
      return (
        order?.status === "Đã hủy" ||
        order?.paymentStatus === "Thanh toán thất bại"
      );
    },

    canStartDelivery(order) {
      return order?.status === "Đã nhận cọc";
    },

    canFinishOrder(order) {
      return order?.status === "Đang giao";
    },

    async fetchOrders() {
      try {
        this.loading = true;
        const data = await OrderService.getAll();
        this.orders = Array.isArray(data) ? data : [];
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

    getDogSaleStatusText(status) {
      if (status === "Sẵn sàng bán") return "Còn nhận đặt cọc";
      if (["Chờ thanh toán", "Đã đặt cọc", "Đang giao"].includes(status)) {
        return "Đã có người đặt";
      }
      if (status === "Đã bán") return "Đã bán";
      if (status === "Ngừng bán") return "Tạm ngừng mở bán";
      return "Chưa mở bán";
    },

    getOrderStatusText(status, paymentStatus) {
      if (status === "Chờ xác nhận cọc" && paymentStatus === "Chờ thanh toán") {
        return "Chờ thanh toán";
      }
      if (status === "Đã nhận cọc") return "Đã nhận cọc";
      if (status === "Đang giao") return "Đang giao";
      if (status === "Hoàn thành") return "Hoàn thành";
      if (status === "Đã hủy") return "Đã hủy";
      if (status === "Chờ xác nhận cọc") return "Chờ xác nhận cọc";
      return status || "---";
    },

    getPaymentStatusText(status) {
      if (status === "Chờ thanh toán") return "Chờ thanh toán";
      if (status === "Đã xác nhận") return "Đã xác nhận";
      if (status === "Đã hoàn tất") return "Đã hoàn tất";
      if (status === "Thanh toán thất bại") return "Thanh toán thất bại";
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
      if (status === "Đã xác nhận") return "badge-confirmed";
      if (status === "Đã hoàn tất") return "badge-completed";
      if (status === "Thanh toán thất bại") return "badge-cancelled";
      return "badge-default";
    },
  },

  mounted() {
    this.fetchOrders();
  },
};
</script>

<style scoped>
.admin-order-page {
  min-height: 100vh;
}

.summary-row {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
}

.summary-box {
  border-radius: 14px;
  padding: 14px 16px;
  color: #fff;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.summary-value {
  font-size: 1.35rem;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 6px;
}

.summary-label {
  font-size: 0.88rem;
  font-weight: 600;
}

.summary-waiting {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.summary-confirmed {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
}

.summary-delivering {
  background: linear-gradient(135deg, #0ea5e9, #0284c7);
}

.summary-completed {
  background: linear-gradient(135deg, #16a34a, #15803d);
}

.summary-cancelled {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.admin-order-table {
  min-width: 1580px;
}

.admin-order-table th,
.admin-order-table td {
  vertical-align: middle;
  font-size: 0.95rem;
}

.text-truncate-cell {
  max-width: 220px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dog-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.dog-thumb {
  width: 46px;
  height: 46px;
  object-fit: cover;
  border-radius: 10px;
  flex-shrink: 0;
  border: 1px solid #dee2e6;
}

.dog-info {
  min-width: 0;
}

.dog-name {
  font-weight: 700;
  color: #1f2937;
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
  border-radius: 8px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  color: #495057;
  font-size: 0.84rem;
  font-weight: 600;
  white-space: nowrap;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 34px;
  padding: 7px 12px;
  border-radius: 8px;
  font-size: 0.84rem;
  font-weight: 700;
  white-space: nowrap;
}

.badge-waiting {
  background: #fff3cd;
  color: #856404;
}

.badge-confirmed {
  background: #cfe2ff;
  color: #084298;
}

.badge-delivering {
  background: #cff4fc;
  color: #055160;
}

.badge-completed {
  background: #d1e7dd;
  color: #0f5132;
}

.badge-cancelled {
  background: #f8d7da;
  color: #842029;
}

.badge-default {
  background: #e9ecef;
  color: #495057;
}

.btn-action {
  border: none;
  border-radius: 6px;
  min-height: 34px;
  padding: 0 12px;
  font-size: 0.84rem;
  font-weight: 700;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-view {
  background: #fff;
  color: #6c757d;
  border: 1px solid #ced4da;
}

.btn-action:hover {
  transform: translateY(-1px);
  opacity: 0.95;
}

.detail-card,
.detail-dog-card {
  background: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 12px;
  padding: 18px;
}

.detail-card-title {
  font-size: 1rem;
  font-weight: 700;
  color: #212529;
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid #dee2e6;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
  padding: 9px 0;
  color: #495057;
  font-size: 0.94rem;
}

.detail-row + .detail-row {
  border-top: 1px dashed #e9ecef;
}

.detail-row span {
  color: #6b7280;
  font-weight: 600;
  white-space: nowrap;
}

.detail-row strong {
  color: #212529;
  font-weight: 700;
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
  border-radius: 12px;
  border: 1px solid #dee2e6;
  flex-shrink: 0;
}

.detail-dog-info {
  min-width: 0;
  width: 100%;
}

.detail-dog-name {
  font-size: 1.05rem;
  font-weight: 700;
  color: #212529;
  margin-bottom: 10px;
}

.modal-head-custom {
  background: #0d6efd;
  color: #fff;
}

@media (max-width: 1399.98px) {
  .summary-row {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 991.98px) {
  .summary-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .detail-dog-wrap {
    flex-direction: column;
  }

  .detail-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .detail-row strong {
    text-align: left;
  }
}

@media (max-width: 575.98px) {
  .summary-row {
    grid-template-columns: 1fr;
  }
}
</style>