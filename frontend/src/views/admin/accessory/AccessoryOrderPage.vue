<template>
  <div class="accessory-order-admin-page bg-light py-4" style="min-height: 100vh;">
    <div class="container-fluid px-2">
      <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3 flex-wrap">
        <div>
          <h4 class="font-weight-bold text-dark mb-1">
            <i class="fas fa-file-invoice mr-2 text-primary"></i>
            QUẢN LÝ ĐƠN PHỤ KIỆN
          </h4>
          <div class="small text-muted">
            Theo dõi đơn phụ kiện, xác nhận xử lý, giao hàng và hoàn tất đơn.
          </div>
        </div>

        <button class="btn btn-outline-primary btn-sm mt-2 mt-md-0" @click="fetchOrders" :disabled="loading">
          <i class="fas fa-sync-alt mr-1"></i> Làm mới
        </button>
      </div>

      <div class="summary-row mb-4">
        <div class="summary-box summary-waiting">
          <div class="summary-value">{{ countByStatus("Chờ xác nhận") }}</div>
          <div class="summary-label">Chờ xác nhận</div>
        </div>

        <div class="summary-box summary-confirmed">
          <div class="summary-value">{{ countByStatus("Đã xác nhận") }}</div>
          <div class="summary-label">Đã xác nhận</div>
        </div>

        <div class="summary-box summary-delivering">
          <div class="summary-value">{{ countByStatus("Đang giao") }}</div>
          <div class="summary-label">Đang giao</div>
        </div>

        <div class="summary-box summary-failed">
          <div class="summary-value">{{ countByStatus("Giao thất bại") }}</div>
          <div class="summary-label">Giao thất bại</div>
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

      <div class="row mb-3 align-items-center">
        <div class="col-lg-5 col-md-12 mb-2 mb-md-0">
          <div class="input-group input-group-sm shadow-sm">
            <div class="input-group-prepend">
              <span class="input-group-text bg-white text-primary border-right-0">
                <i class="fas fa-search"></i>
              </span>
            </div>
            <input
              v-model.trim="keyword"
              type="text"
              class="form-control border-left-0"
              placeholder="Tìm mã đơn, tên khách, số điện thoại..."
            />
          </div>
        </div>

        <div class="col-lg-4 col-md-6 mb-2 mb-md-0">
          <select v-model="statusFilter" class="form-control form-control-sm shadow-sm">
            <option value="">Tất cả trạng thái</option>
            <option value="Chờ xác nhận">Chờ xác nhận</option>
            <option value="Đã xác nhận">Đã xác nhận</option>
            <option value="Đang giao">Đang giao</option>
            <option value="Giao thất bại">Giao thất bại</option>
            <option value="Hoàn thành">Hoàn thành</option>
            <option value="Đã hủy">Đã hủy</option>
          </select>
        </div>

        <div class="col-lg-3 col-md-6 text-md-right">
          <div class="small text-muted font-weight-bold">
            Tổng: {{ filteredOrders.length }} đơn
          </div>
        </div>
      </div>

      <div v-if="loading" class="card border-0 shadow-sm">
        <div class="card-body text-center py-5 text-muted">
          <i class="fas fa-spinner fa-spin fa-3x mb-3 d-block"></i>
          Đang tải danh sách đơn phụ kiện...
        </div>
      </div>

      <div class="card border-0 shadow-sm" v-else-if="filteredOrders.length > 0">
        <div class="table-responsive">
          <table class="table table-hover align-middle text-center mb-0 admin-order-table">
            <thead class="bg-light">
              <tr class="small text-secondary">
                <th class="py-3">Mã đơn</th>
                <th class="py-3 text-left">Khách hàng</th>
                <th class="py-3">Điện thoại</th>
                <th class="py-3">Số SP</th>
                <th class="py-3">Phương thức</th>
                <th class="py-3">TT thanh toán</th>
                <th class="py-3">Tổng tiền</th>
                <th class="py-3">Trạng thái đơn</th>
                <th class="py-3">Ngày tạo</th>
                <th class="py-3">Thao tác</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="order in filteredOrders" :key="order.id || order._id">
                <td class="font-weight-bold text-primary">
                  {{ order.maDonPhuKien || getShortOrderCode(order.id || order._id) }}
                </td>

                <td class="text-left font-weight-bold text-dark">
                  {{ order.customerName }}
                </td>

                <td>
                  {{ order.customerPhone }}
                </td>

                <td class="font-weight-bold">
                  {{ getProductCount(order) }}
                </td>

                <td>
                  <span class="payment-badge" :class="getPaymentMethodClass(order.paymentMethod)">
                    {{ getPaymentMethodText(order.paymentMethod) }}
                  </span>
                </td>

                <td>
                  <span class="payment-badge" :class="getPaymentStatusClass(order.paymentStatus)">
                    {{ getPaymentStatusText(order.paymentStatus) }}
                  </span>
                </td>

                <td class="text-danger font-weight-bold">
                  {{ formatCurrency(order.totalAmount) }}
                </td>

                <td>
                  <span class="status-badge" :class="getStatusClass(order.status)">
                    {{ order.status }}
                  </span>
                </td>

                <td>
                  {{ formatDateTime(order.createdAt) }}
                </td>

                <td>
                  <div class="d-flex justify-content-center flex-wrap">
                    <button
                      class="btn btn-sm btn-outline-secondary mr-1 mb-1"
                      @click="openDetail(order)"
                    >
                      <i class="fas fa-eye mr-1"></i>Xem
                    </button>

                    <template v-if="order.status === 'Chờ xác nhận'">
                      <button
                        class="btn btn-sm btn-primary mr-1 mb-1"
                        @click="updateStatus(order.id || order._id, 'Đã xác nhận')"
                      >
                        Xác nhận
                      </button>

                      <button
                        class="btn btn-sm btn-outline-danger mb-1"
                        @click="updateStatus(order.id || order._id, 'Đã hủy')"
                      >
                        Hủy
                      </button>
                    </template>

                    <template v-else-if="order.status === 'Đã xác nhận'">
                      <button
                        class="btn btn-sm btn-info mr-1 mb-1 text-white"
                        @click="updateStatus(order.id || order._id, 'Đang giao')"
                      >
                        Đang giao
                      </button>

                      <button
                        class="btn btn-sm btn-outline-danger mb-1"
                        @click="updateStatus(order.id || order._id, 'Đã hủy')"
                      >
                        Hủy
                      </button>
                    </template>

                    <template v-else-if="order.status === 'Đang giao'">
                      <button
                        class="btn btn-sm btn-success mr-1 mb-1"
                        @click="updateStatus(order.id || order._id, 'Hoàn thành')"
                      >
                        Hoàn thành
                      </button>

                      <button
                        class="btn btn-sm btn-outline-danger mb-1"
                        @click="updateStatus(order.id || order._id, 'Giao thất bại')"
                      >
                        Giao thất bại
                      </button>
                    </template>

                    <template v-else-if="order.status === 'Giao thất bại'">
                      <button
                        class="btn btn-sm btn-info mr-1 mb-1 text-white"
                        @click="updateStatus(order.id || order._id, 'Đang giao')"
                      >
                        Giao lại
                      </button>

                      <button
                        class="btn btn-sm btn-outline-danger mb-1"
                        @click="updateStatus(order.id || order._id, 'Đã hủy')"
                      >
                        Hủy đơn
                      </button>
                    </template>

                    <div v-else class="text-muted small font-italic d-flex align-items-center mb-1 px-2">
                      Đã đóng
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-else class="card border-0 shadow-sm">
        <div class="card-body text-center py-5 text-muted">
          <i class="fas fa-box-open fa-3x mb-3 d-block"></i>
          Không có đơn phụ kiện phù hợp.
        </div>
      </div>

      <div
        v-if="selectedOrder"
        class="modal fade show d-block"
        tabindex="-1"
        style="background: rgba(0, 0, 0, 0.45);"
      >
        <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div class="modal-content border-0 shadow">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title mb-0">
                <i class="fas fa-file-invoice mr-2"></i>Chi tiết đơn phụ kiện
              </h5>
              <button type="button" class="close text-white" @click="closeDetail">
                <span>&times;</span>
              </button>
            </div>

            <div class="modal-body">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <div class="detail-card h-100">
                    <div class="detail-card-title">Thông tin đơn hàng</div>

                    <div class="detail-row">
                      <span>Mã đơn</span>
                      <strong>{{ selectedOrder.maDonPhuKien || getShortOrderCode(selectedOrder.id || selectedOrder._id) }}</strong>
                    </div>
                    <div class="detail-row">
                      <span>Ngày tạo</span>
                      <strong>{{ formatDateTime(selectedOrder.createdAt) }}</strong>
                    </div>
                    <div class="detail-row">
                      <span>Trạng thái đơn</span>
                      <strong>{{ selectedOrder.status }}</strong>
                    </div>
                    <div class="detail-row">
                      <span>Phương thức thanh toán</span>
                      <strong>{{ getPaymentMethodText(selectedOrder.paymentMethod) }}</strong>
                    </div>
                    <div class="detail-row">
                      <span>Trạng thái thanh toán</span>
                      <strong>{{ getPaymentStatusText(selectedOrder.paymentStatus) }}</strong>
                    </div>
                    <div class="detail-row">
                      <span>Tạm tính</span>
                      <strong>{{ formatCurrency(getItemsSubTotal(selectedOrder)) }}</strong>
                    </div>
                    <div class="detail-row">
                      <span>Phí vận chuyển</span>
                      <strong>{{ formatCurrency(selectedOrder.shippingFee || 0) }}</strong>
                    </div>
                    <div class="detail-row">
                      <span>Tổng tiền</span>
                      <strong class="text-danger">{{ formatCurrency(selectedOrder.totalAmount) }}</strong>
                    </div>
                  </div>
                </div>

                <div class="col-md-6 mb-3">
                  <div class="detail-card h-100">
                    <div class="detail-card-title">Thông tin nhận hàng</div>

                    <div class="detail-row">
                      <span>Người nhận</span>
                      <strong>{{ selectedOrder.customerName }}</strong>
                    </div>
                    <div class="detail-row">
                      <span>Số điện thoại</span>
                      <strong>{{ selectedOrder.customerPhone }}</strong>
                    </div>
                    <div class="detail-row">
                      <span>Địa chỉ</span>
                      <strong class="wrap-text">{{ selectedOrder.shippingAddress }}</strong>
                    </div>
                    <div class="detail-row">
                      <span>Ghi chú</span>
                      <strong class="wrap-text">{{ selectedOrder.note || "Không có" }}</strong>
                    </div>
                  </div>
                </div>

                <div class="col-12">
                  <div class="detail-card">
                    <div class="detail-card-title">Sản phẩm trong đơn</div>

                    <div
                      v-for="item in selectedOrder.items || []"
                      :key="item.id || item._id"
                      class="product-line"
                    >
                      <img
                        :src="getAccessoryImage(item.accessoryId)"
                        alt="accessory"
                        class="product-line-image"
                      />
                      <div class="product-line-info">
                        <div class="product-line-name">
                          {{ item.accessoryName || item.accessoryId?.name || "Phụ kiện" }}
                        </div>
                        <div class="product-line-meta">
                          Số lượng: {{ item.quantity }} | Đơn giá: {{ formatCurrency(item.price) }}
                        </div>
                      </div>
                      <div class="product-line-total">
                        {{ formatCurrency(item.subTotal) }}
                      </div>
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
import AccessoryOrderService from "@/services/accessoryOrder.service";

export default {
  name: "AccessoryOrderPage",

  data() {
    return {
      orders: [],
      loading: false,
      keyword: "",
      statusFilter: "",
      selectedOrder: null,
      baseImageUrl: "http://localhost:3000",
    };
  },

  computed: {
    filteredOrders() {
      const kw = this.keyword.toLowerCase();

      return this.orders.filter((order) => {
        const code = String(order.maDonPhuKien || "").toLowerCase();
        const customerName = String(order.customerName || "").toLowerCase();
        const customerPhone = String(order.customerPhone || "").toLowerCase();

        const matchKeyword =
          !kw ||
          code.includes(kw) ||
          customerName.includes(kw) ||
          customerPhone.includes(kw);

        const matchStatus = this.statusFilter
          ? order.status === this.statusFilter
          : true;

        return matchKeyword && matchStatus;
      });
    },
  },

  methods: {
    countByStatus(status) {
      return this.orders.filter((order) => order.status === status).length;
    },

    getProductCount(order) {
      return Array.isArray(order.items)
        ? order.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
        : 0;
    },

    getShortOrderCode(id) {
      if (!id) return "------";
      return String(id).substring(String(id).length - 6).toUpperCase();
    },

    async fetchOrders() {
      try {
        this.loading = true;

        const params = this.statusFilter ? { status: this.statusFilter } : {};
        const data = await AccessoryOrderService.getAll(params);

        this.orders = Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Lỗi tải đơn phụ kiện:", error);
        alert(
          error.response?.data?.message || "Không thể tải danh sách đơn phụ kiện."
        );
      } finally {
        this.loading = false;
      }
    },

    openDetail(order) {
      this.selectedOrder = order;
    },

    closeDetail() {
      this.selectedOrder = null;
    },

    async updateStatus(id, status) {
      if (!confirm(`Bạn xác nhận chuyển đơn phụ kiện sang trạng thái [${status}]?`)) {
        return;
      }

      try {
        await AccessoryOrderService.updateStatus(id, status);
        await this.fetchOrders();

        if (this.selectedOrder && (this.selectedOrder.id || this.selectedOrder._id) === id) {
          const updated = this.orders.find((item) => (item.id || item._id) === id);
          this.selectedOrder = updated || null;
        }
      } catch (error) {
        console.error("Lỗi cập nhật trạng thái đơn phụ kiện:", error);
        alert(
          "Lỗi cập nhật trạng thái đơn: " +
            (error.response?.data?.message || error.message)
        );
      }
    },

    getAccessoryImage(item) {
      if (!item?.image) return "";
      if (item.image.startsWith("http://") || item.image.startsWith("https://")) {
        return item.image;
      }
      return this.baseImageUrl + item.image;
    },

    formatCurrency(value) {
      if (value === null || value === undefined) return "---";
      return Number(value).toLocaleString("vi-VN") + " ₫";
    },

    formatDateTime(date) {
      if (!date) return "---";
      return new Date(date).toLocaleString("vi-VN");
    },

    getStatusClass(status) {
      if (status === "Chờ xác nhận") return "badge-warning text-dark";
      if (status === "Đã xác nhận") return "badge-primary";
      if (status === "Đang giao") return "badge-info text-dark";
      if (status === "Giao thất bại") return "badge-warning text-dark";
      if (status === "Hoàn thành") return "badge-success";
      if (status === "Đã hủy") return "badge-danger";
      return "badge-light border";
    },

    getItemsSubTotal(order) {
      return Array.isArray(order?.items)
        ? order.items.reduce((sum, item) => sum + Number(item.subTotal || 0), 0)
        : 0;
    },

    getPaymentMethodText(paymentMethod) {
      if (paymentMethod === "ZALOPAY") return "ZaloPay";
      return "Thanh toán khi nhận hàng";
    },

    getPaymentMethodClass(paymentMethod) {
      if (paymentMethod === "ZALOPAY") return "payment-zalopay";
      return "payment-cod";
    },

    getPaymentStatusText(paymentStatus) {
      if (paymentStatus === "Đã thanh toán") return "Đã thanh toán";
      if (paymentStatus === "Thanh toán thất bại") return "Thanh toán thất bại";
      return "Chưa thanh toán";
    },

    getPaymentStatusClass(paymentStatus) {
      if (paymentStatus === "Đã thanh toán") return "payment-paid";
      if (paymentStatus === "Thanh toán thất bại") return "payment-failed";
      return "payment-unpaid";
    },
  },

  watch: {
    statusFilter() {
      this.fetchOrders();
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

.summary-row {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
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

.summary-failed {
  background: linear-gradient(135deg, #f97316, #ea580c);
}

.summary-completed {
  background: linear-gradient(135deg, #16a34a, #15803d);
}

.summary-cancelled {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.admin-order-table {
  min-width: 1320px;
}

.admin-order-table th,
.admin-order-table td {
  font-size: 0.95rem;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 34px;
  padding: 7px 12px;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 700;
  white-space: nowrap;
}

.product-line {
  display: flex;
  align-items: center;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 10px;
  margin-bottom: 10px;
  background: #fafbfc;
  gap: 12px;
}

.product-line-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 10px;
  flex-shrink: 0;
}

.product-line-info {
  flex: 1;
}

.product-line-name {
  font-weight: 800;
  color: #2f1b44;
}

.product-line-meta {
  font-size: 0.85rem;
  color: #6b7280;
  margin-top: 3px;
}

.product-line-total {
  font-weight: 800;
  color: #2f1b44;
  white-space: nowrap;
}

.detail-card {
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
  padding: 10px 0;
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

.modal {
  overflow-y: auto;
}

.payment-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 7px 12px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 800;
  white-space: nowrap;
}

.payment-cod {
  background: #e7f8ee;
  color: #15803d;
}

.payment-zalopay {
  background: #e8f1ff;
  color: #1d4ed8;
}

.payment-paid {
  background: #dcfce7;
  color: #166534;
}

.payment-unpaid {
  background: #fef3c7;
  color: #92400e;
}

.payment-failed {
  background: #fee2e2;
  color: #b91c1c;
}

@media (max-width: 1199.98px) {
  .summary-row {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 991.98px) {
  .detail-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .detail-row strong {
    text-align: left;
  }
}

@media (max-width: 767.98px) {
  .summary-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 575.98px) {
  .summary-row {
    grid-template-columns: 1fr;
  }
}
</style>