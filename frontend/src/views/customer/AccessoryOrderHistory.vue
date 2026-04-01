<template>
  <div class="accessory-order-history-page bg-light py-5" style="min-height: 100vh;">
    <div class="container">
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap">
        <h3 class="font-weight-bold text-dark mb-2">
          <i class="fas fa-box text-primary mr-2"></i>
          LỊCH SỬ ĐƠN PHỤ KIỆN
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
                  placeholder="Tìm theo mã đơn hoặc tên người nhận..."
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
                  :class="statusFilter === 'Chờ xác nhận' ? 'btn-warning text-dark' : 'btn-light'"
                  @click="statusFilter = 'Chờ xác nhận'"
                >
                  Chờ xác nhận
                </button>
                <button
                  class="btn btn-sm"
                  :class="statusFilter === 'Đã xác nhận' ? 'btn-primary text-white' : 'btn-light'"
                  @click="statusFilter = 'Đã xác nhận'"
                >
                  Đã xác nhận
                </button>
                <button
                  class="btn btn-sm"
                  :class="statusFilter === 'Đang giao' ? 'btn-info text-dark' : 'btn-light'"
                  @click="statusFilter = 'Đang giao'"
                >
                  Đang giao
                </button>
                <button
                  class="btn btn-sm"
                  :class="statusFilter === 'Giao thất bại' ? 'btn-warning text-dark' : 'btn-light'"
                  @click="statusFilter = 'Giao thất bại'"
                >
                  Giao thất bại
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
        Đang tải lịch sử đơn phụ kiện...
      </div>

      <div v-else-if="filteredOrders.length === 0" class="card border-0 shadow-sm">
        <div class="card-body text-center py-5 text-muted">
          <i class="fas fa-box-open fa-3x mb-3 d-block"></i>
          Bạn chưa có đơn phụ kiện nào.
        </div>
      </div>

      <div v-else class="row">
        <div class="col-lg-6 mb-4" v-for="order in filteredOrders" :key="getOrderId(order)">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <div class="small text-muted">Mã đơn</div>
                  <div class="font-weight-bold text-primary">
                    {{ order.maDonPhuKien || getShortOrderCode(getOrderId(order)) }}
                  </div>
                </div>

                <span class="badge px-3 py-2" :class="getStatusClass(order.status)">
                  {{ order.status }}
                </span>
              </div>

              <p class="mb-1"><strong>Người nhận:</strong> {{ order.customerName }}</p>
              <p class="mb-1"><strong>Số điện thoại:</strong> {{ order.customerPhone }}</p>
              <p class="mb-1"><strong>Địa chỉ:</strong> {{ order.shippingAddress }}</p>
              <p class="mb-3">
                <strong>Tổng tiền:</strong>
                <span class="text-danger font-weight-bold">{{ formatCurrency(order.totalAmount) }}</span>
              </p>

              <div class="border rounded p-3 bg-light">
                <h6 class="font-weight-bold mb-3">Sản phẩm trong đơn</h6>

                <div
                  v-for="item in order.items"
                  :key="item.id || item._id"
                  class="d-flex align-items-center mb-2"
                >
                  <img
                    :src="getAccessoryImage(item.accessoryId)"
                    alt="accessory"
                    class="rounded shadow-sm mr-3"
                    style="width: 55px; height: 55px; object-fit: cover;"
                  />
                  <div class="flex-grow-1">
                    <div class="font-weight-bold text-dark">
                      {{ item.accessoryName }}
                    </div>
                    <div class="small text-muted">
                      SL: {{ item.quantity }} | {{ formatCurrency(item.price) }}
                    </div>
                  </div>
                  <div class="font-weight-bold text-dark">
                    {{ formatCurrency(item.subTotal) }}
                  </div>
                </div>
              </div>

              <div class="small text-muted mt-3 mb-3">
                Ngày tạo đơn: {{ formatDateTime(order.createdAt) }}
              </div>

              <div class="d-flex flex-wrap">
                <button
                  v-if="order.status === 'Chờ xác nhận'"
                  class="btn btn-sm btn-outline-danger mr-2 mb-2"
                  @click="cancelOrder(order)"
                >
                  <i class="fas fa-times mr-1"></i> Hủy đơn
                </button>

                <button
                  v-if="['Hoàn thành', 'Đã hủy', 'Giao thất bại'].includes(order.status)"
                  class="btn btn-sm btn-outline-success mr-2 mb-2"
                  @click="buyAgain(order)"
                >
                  <i class="fas fa-redo mr-1"></i> Mua lại
                </button>

                <button
                  class="btn btn-sm btn-outline-primary mb-2"
                  @click="openDetail(order)"
                >
                  <i class="fas fa-eye mr-1"></i> Xem chi tiết
                </button>
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
                <i class="fas fa-file-invoice mr-2"></i>Chi tiết đơn phụ kiện
              </h5>
              <button type="button" class="close text-white" @click="closeDetail">
                <span>&times;</span>
              </button>
            </div>

            <div class="modal-body">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <h6 class="font-weight-bold text-primary">Thông tin đơn hàng</h6>
                  <p class="mb-1"><strong>Mã đơn:</strong> {{ selectedOrder.maDonPhuKien || getShortOrderCode(getOrderId(selectedOrder)) }}</p>
                  <p class="mb-1"><strong>Ngày đặt:</strong> {{ formatDateTime(selectedOrder.createdAt) }}</p>
                  <p class="mb-1"><strong>Trạng thái:</strong> {{ selectedOrder.status }}</p>
                  <p class="mb-1"><strong>Tổng tiền:</strong> {{ formatCurrency(selectedOrder.totalAmount) }}</p>
                </div>

                <div class="col-md-6 mb-3">
                  <h6 class="font-weight-bold text-success">Thông tin nhận hàng</h6>
                  <p class="mb-1"><strong>Người nhận:</strong> {{ selectedOrder.customerName }}</p>
                  <p class="mb-1"><strong>Số điện thoại:</strong> {{ selectedOrder.customerPhone }}</p>
                  <p class="mb-1"><strong>Địa chỉ:</strong> {{ selectedOrder.shippingAddress }}</p>
                </div>

                <div class="col-12">
                  <hr>
                  <h6 class="font-weight-bold text-dark">Sản phẩm trong đơn</h6>

                  <div
                    v-for="item in selectedOrder.items"
                    :key="item.id || item._id"
                    class="d-flex align-items-center border rounded p-2 mb-2 bg-light"
                  >
                    <img
                      :src="getAccessoryImage(item.accessoryId)"
                      alt="accessory"
                      class="rounded shadow-sm mr-3"
                      style="width: 60px; height: 60px; object-fit: cover;"
                    />
                    <div class="flex-grow-1">
                      <div class="font-weight-bold">{{ item.accessoryName }}</div>
                      <div class="small text-muted">
                        Số lượng: {{ item.quantity }} | Đơn giá: {{ formatCurrency(item.price) }}
                      </div>
                    </div>
                    <div class="font-weight-bold text-dark">
                      {{ formatCurrency(item.subTotal) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button
                v-if="['Hoàn thành', 'Đã hủy', 'Giao thất bại'].includes(selectedOrder.status)"
                class="btn btn-success"
                @click="buyAgain(selectedOrder)"
              >
                <i class="fas fa-redo mr-1"></i> Mua lại
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
import AccessoryOrderService from "@/services/accessoryOrder.service";
import CartService from "@/services/cart.service";
import AccessoryService from "@/services/accessory.service";

export default {
  data() {
    return {
      orders: [],
      loading: false,
      searchText: "",
      statusFilter: "Tất cả",
      selectedOrder: null,
    };
  },

  computed: {
    filteredOrders() {
      return this.orders.filter((order) => {
        const keyword = (this.searchText || "").toLowerCase();
        const orderCode = (order.maDonPhuKien || this.getShortOrderCode(this.getOrderId(order)) || "").toLowerCase();
        const customerName = (order.customerName || "").toLowerCase();

        const matchSearch = orderCode.includes(keyword) || customerName.includes(keyword);
        const matchStatus = this.statusFilter === "Tất cả" || order.status === this.statusFilter;

        return matchSearch && matchStatus;
      });
    },
  },

  methods: {
    getOrderId(order) {
      return order?._id || order?.id || "";
    },

    getShortOrderCode(id) {
      if (!id) return "------";
      return String(id).substring(String(id).length - 6).toUpperCase();
    },

    async fetchOrders() {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "null");
        if (!user) {
          alert("Vui lòng đăng nhập để xem lịch sử đơn phụ kiện.");
          this.$router.push("/login");
          return;
        }

        this.loading = true;
        const userId = user._id || user.id;
        this.orders = await AccessoryOrderService.getByUserId(userId);
      } catch (error) {
        console.error("Lỗi tải lịch sử đơn phụ kiện:", error);
        alert("Không thể tải lịch sử đơn phụ kiện.");
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

    async cancelOrder(order) {
      if (!confirm(`Bạn có chắc muốn hủy đơn [${order.maDonPhuKien || this.getShortOrderCode(this.getOrderId(order))}] không?`)) {
        return;
      }

      try {
        await AccessoryOrderService.cancelByCustomer(this.getOrderId(order));
        alert("✅ Hủy đơn phụ kiện thành công!");
        await this.fetchOrders();

        if (this.selectedOrder && this.getOrderId(this.selectedOrder) === this.getOrderId(order)) {
          this.selectedOrder = null;
        }
      } catch (error) {
        console.error("Lỗi khách hủy đơn phụ kiện:", error);
        alert(
          "❌ Không thể hủy đơn: " +
            (error.response?.data?.message || error.message)
        );
      }
    },

    async buyAgain(order) {
      if (!order.items || order.items.length === 0) {
        alert("Đơn này không có sản phẩm để mua lại.");
        return;
      }

      try {
          for (const item of order.items) {
            const accessoryId =
              item.accessoryId?._id || item.accessoryId?.id || item.accessoryId;

            if (!accessoryId) continue;

            const latestAccessory = await AccessoryService.get(accessoryId);

            if (!latestAccessory) continue;
            if (latestAccessory.status !== "Đang bán") continue;
            if (Number(latestAccessory.quantity) <= 0) continue;

            await CartService.addToCart(
              latestAccessory._id || latestAccessory.id,
              Number(item.quantity || 1)
            );
          }

        alert("✅ Đã thêm lại các sản phẩm còn bán vào giỏ hàng!");
        this.closeDetail();
        this.$router.push("/cart");
      } catch (error) {
        alert(
          "❌ Không thể mua lại lúc này: " +
            (error.response?.data?.message || error.message)
        );
      }
    },

    getAccessoryImage(item) {
      if (item?.image) return "http://localhost:3000" + item.image;
      return "https://via.placeholder.com/100";
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