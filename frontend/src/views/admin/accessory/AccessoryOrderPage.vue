<template>
  <div class="accessory-order-admin-page bg-light py-4" style="min-height: 100vh;">
    <div class="container-fluid px-2">
      <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
        <h4 class="font-weight-bold text-dark mb-0">
          <i class="fas fa-file-invoice mr-2 text-primary"></i>
          QUẢN LÝ ĐƠN PHỤ KIỆN
        </h4>

        <button class="btn btn-outline-primary btn-sm" @click="fetchOrders">
          <i class="fas fa-sync-alt mr-1"></i> Làm mới
        </button>
      </div>

      <div class="card border-0 shadow-sm" v-if="orders.length > 0">
        <div class="table-responsive">
          <table class="table table-hover align-middle text-center mb-0">
            <thead class="bg-light">
              <tr class="small text-secondary">
                <th class="py-3">Mã đơn</th>
                <th class="py-3">Khách hàng</th>
                <th class="py-3">Điện thoại</th>
                <th class="py-3">Tổng tiền</th>
                <th class="py-3">Trạng thái</th>
                <th class="py-3">Ngày tạo</th>
                <th class="py-3">Thao tác</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="order in orders" :key="order.id || order._id">
                <td class="font-weight-bold text-primary">
                  {{ order.maDonPhuKien }}
                </td>

                <td class="text-left">
                  {{ order.customerName }}
                </td>

                <td>
                  {{ order.customerPhone }}
                </td>

                <td class="text-danger font-weight-bold">
                  {{ formatCurrency(order.totalAmount) }}
                </td>

                <td>
                  <span class="badge px-3 py-2" :class="getStatusClass(order.status)">
                    {{ order.status }}
                  </span>
                </td>

                <td>
                  {{ formatDateTime(order.createdAt) }}
                </td>

                <td>
                  <!-- Chờ xác nhận -->
                  <div v-if="order.status === 'Chờ xác nhận'">
                    <button
                      class="btn btn-sm btn-primary mr-1"
                      @click="updateStatus(order.id || order._id, 'Đã xác nhận')"
                    >
                      Xác nhận
                    </button>

                    <button
                      class="btn btn-sm btn-outline-danger"
                      @click="updateStatus(order.id || order._id, 'Đã hủy')"
                    >
                      Hủy
                    </button>
                  </div>

                  <!-- Đã xác nhận -->
                  <div v-else-if="order.status === 'Đã xác nhận'">
                    <button
                      class="btn btn-sm btn-info mr-1"
                      @click="updateStatus(order.id || order._id, 'Đang giao')"
                    >
                      Đang giao
                    </button>

                    <button
                      class="btn btn-sm btn-outline-danger"
                      @click="updateStatus(order.id || order._id, 'Đã hủy')"
                    >
                      Hủy
                    </button>
                  </div>

                  <!-- Đang giao -->
                  <div v-else-if="order.status === 'Đang giao'">
                    <button
                      class="btn btn-sm btn-success mr-1"
                      @click="updateStatus(order.id || order._id, 'Hoàn thành')"
                    >
                      Hoàn thành
                    </button>

                    <button
                      class="btn btn-sm btn-outline-danger"
                      @click="updateStatus(order.id || order._id, 'Giao thất bại')"
                    >
                      Giao thất bại
                    </button>
                  </div>

                  <!-- Giao thất bại -->
                  <div v-else-if="order.status === 'Giao thất bại'">
                    <button
                      class="btn btn-sm btn-info mr-1"
                      @click="updateStatus(order.id || order._id, 'Đang giao')"
                    >
                      Giao lại
                    </button>

                    <button
                      class="btn btn-sm btn-outline-danger"
                      @click="updateStatus(order.id || order._id, 'Đã hủy')"
                    >
                      Hủy đơn
                    </button>
                  </div>

                  <!-- Trạng thái cuối -->
                  <div v-else class="text-muted small font-italic">
                    Đã đóng
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
          Chưa có đơn phụ kiện nào.
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AccessoryOrderService from "@/services/accessoryOrder.service";

export default {
  data() {
    return {
      orders: [],
    };
  },

  methods: {
    async fetchOrders() {
      try {
        this.orders = await AccessoryOrderService.getAll();
      } catch (error) {
        console.error("Lỗi tải đơn phụ kiện:", error);
        alert("Không thể tải danh sách đơn phụ kiện.");
      }
    },

    async updateStatus(id, status) {
      if (!confirm(`Bạn xác nhận chuyển đơn phụ kiện sang trạng thái [${status}]?`)) {
        return;
      }

      try {
        await AccessoryOrderService.updateStatus(id, status);
        await this.fetchOrders();
      } catch (error) {
        console.error("Lỗi cập nhật trạng thái đơn phụ kiện:", error);
        alert(
          "Lỗi cập nhật trạng thái đơn: " +
            (error.response?.data?.message || error.message)
        );
      }
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
  },

  mounted() {
    this.fetchOrders();
  },
};
</script>