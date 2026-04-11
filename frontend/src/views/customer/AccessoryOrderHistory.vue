<template>
  <div class="accessory-order-history-page">
    <div class="container-fluid order-page-container py-4">
      <div class="order-layout">
        <aside class="account-sidebar">
          <div class="account-card">
            <div class="account-top">
              <div class="account-info">
                <h5 class="account-name mb-1">
                  {{ currentUser?.fullName || currentUser?.username || "Khách hàng" }}
                </h5>
                <div class="account-email">
                  {{ currentUser?.email || "Chưa cập nhật email" }}
                </div>
              </div>

              <div class="account-avatar">
                {{ getAvatarText() }}
              </div>
            </div>

            <div class="account-note">
              Quản lý hồ sơ, lịch sử đặt cọc, đơn phụ kiện và lịch dịch vụ tại đây.
            </div>
          </div>

          <div class="sidebar-menu">
            <router-link to="/profile" class="menu-item text-decoration-none">
              <span><i class="fas fa-user-circle mr-2"></i> Hồ sơ của tôi</span>
              <i class="fas fa-chevron-right menu-arrow"></i>
            </router-link>

            <router-link to="/orders" class="menu-item text-decoration-none">
              <span><i class="fas fa-file-invoice-dollar mr-2"></i> Lịch sử đặt cọc</span>
              <i class="fas fa-chevron-right menu-arrow"></i>
            </router-link>

            <router-link to="/accessory-orders" class="menu-item active text-decoration-none">
              <span><i class="fas fa-shopping-bag mr-2"></i> Đơn phụ kiện</span>
              <i class="fas fa-chevron-right menu-arrow"></i>
            </router-link>

            <router-link to="/service-bookings" class="menu-item text-decoration-none">
              <span><i class="fas fa-calendar-check mr-2"></i> Lịch dịch vụ</span>
              <i class="fas fa-chevron-right menu-arrow"></i>
            </router-link>

            <div class="menu-item">
              <span><i class="fas fa-phone-alt mr-2"></i> Liên hệ</span>
              <small>0379889868</small>
            </div>

            <div class="menu-item">
              <span><i class="fas fa-globe mr-2"></i> Trang web</span>
              <small>petshop.vn</small>
            </div>
          </div>
        </aside>

        <section class="order-content">
          <div class="content-head">
            <div>
              <h3 class="content-title">Lịch sử đơn phụ kiện</h3>
              <p class="content-subtitle mb-0">
                Theo dõi các đơn phụ kiện bạn đã đặt
              </p>
            </div>
          </div>

          <div class="toolbar-box">
            <div class="search-box">
              <i class="fas fa-search"></i>
              <input
                type="text"
                v-model.trim="searchText"
                placeholder="Tìm theo mã đơn hoặc tên người nhận"
              />
            </div>

            <button class="refresh-btn" @click="fetchOrders" :disabled="loading">
              <i class="fas fa-sync-alt mr-1"></i> Làm mới
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
              :class="{ active: statusFilter === 'Chờ xác nhận' }"
              @click="statusFilter = 'Chờ xác nhận'"
            >
              Chờ xác nhận
            </button>

            <button
              class="status-tab"
              :class="{ active: statusFilter === 'Đã xác nhận' }"
              @click="statusFilter = 'Đã xác nhận'"
            >
              Đã xác nhận
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
              :class="{ active: statusFilter === 'Giao thất bại' }"
              @click="statusFilter = 'Giao thất bại'"
            >
              Giao thất bại
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
            <p>Đang tải lịch sử đơn phụ kiện...</p>
          </div>

          <div v-else-if="filteredOrders.length === 0" class="empty-panel">
            <i class="fas fa-box-open empty-icon"></i>
            <p>Bạn chưa có đơn phụ kiện nào</p>
          </div>

          <div v-else class="table-card">
            <div class="table-wrap">
              <table class="order-table">
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Ngày đặt</th>
                    <th>Người nhận</th>
                    <th>Số sản phẩm</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="order in filteredOrders" :key="getOrderId(order)">
                    <td class="td-code">
                      {{ order.maDonPhuKien || getShortOrderCode(getOrderId(order)) }}
                    </td>

                    <td>{{ formatDateTime(order.createdAt) }}</td>

                    <td>
                      <div class="receiver-name">{{ order.customerName }}</div>
                      <div class="receiver-phone">{{ order.customerPhone }}</div>
                    </td>

                    <td>{{ getProductCount(order) }}</td>

                    <td class="money-total">
                      {{ formatCurrency(order.totalAmount) }}
                    </td>

                    <td>
                      <span class="order-badge" :class="getStatusClass(order.status)">
                        {{ order.status }}
                      </span>
                    </td>

                    <td>
                      <div class="table-actions">
                        <button
                          v-if="order.status === 'Chờ xác nhận'"
                          class="btn btn-outline-danger btn-sm"
                          @click="cancelOrder(order)"
                        >
                          Hủy
                        </button>

                        <button
                          v-if="['Hoàn thành', 'Đã hủy', 'Giao thất bại'].includes(order.status)"
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
                  <p class="mb-1">
                    <strong>Mã đơn:</strong>
                    {{ selectedOrder.maDonPhuKien || getShortOrderCode(getOrderId(selectedOrder)) }}
                  </p>
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
                  <hr />
                  <h6 class="font-weight-bold text-dark">Sản phẩm trong đơn</h6>

                  <div
                    v-for="item in selectedOrder.items"
                    :key="item.id || item._id"
                    class="product-line"
                  >
                    <img
                      :src="getAccessoryImage(item.accessoryId)"
                      alt="accessory"
                      class="product-line-image"
                    />
                    <div class="product-line-info">
                      <div class="product-line-name">{{ item.accessoryName }}</div>
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
  name: "AccessoryOrderHistoryPage",

  data() {
    return {
      currentUser: null,
      orders: [],
      loading: false,
      searchText: "",
      statusFilter: "Tất cả",
      selectedOrder: null,
      baseImageUrl: "http://localhost:3000",
    };
  },

  computed: {
    filteredOrders() {
      return this.orders.filter((order) => {
        const keyword = (this.searchText || "").toLowerCase();
        const orderCode = (
          order.maDonPhuKien ||
          this.getShortOrderCode(this.getOrderId(order)) ||
          ""
        ).toLowerCase();
        const customerName = (order.customerName || "").toLowerCase();

        const matchSearch =
          orderCode.includes(keyword) || customerName.includes(keyword);
        const matchStatus =
          this.statusFilter === "Tất cả" || order.status === this.statusFilter;

        return matchSearch && matchStatus;
      });
    },
  },

  methods: {
    getAvatarText() {
      const name = this.currentUser?.fullName || this.currentUser?.username || "KH";
      return name
        .split(" ")
        .map((item) => item[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();
    },

    getOrderId(order) {
      return order?._id || order?.id || "";
    },

    getShortOrderCode(id) {
      if (!id) return "------";
      return String(id).substring(String(id).length - 6).toUpperCase();
    },

    getProductCount(order) {
      return Array.isArray(order.items)
        ? order.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
        : 0;
    },

    async fetchOrders() {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "null");
        if (!user) {
          alert("Vui lòng đăng nhập để xem lịch sử đơn phụ kiện.");
          this.$router.push("/login");
          return;
        }

        this.currentUser = user;
        this.loading = true;
        this.orders = await AccessoryOrderService.getMyOrders();
      } catch (error) {
        console.error("Lỗi tải lịch sử đơn phụ kiện:", error);
        alert(
          error.response?.data?.message || "Không thể tải lịch sử đơn phụ kiện."
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

    async cancelOrder(order) {
      if (
        !confirm(
          `Bạn có chắc muốn hủy đơn [${
            order.maDonPhuKien || this.getShortOrderCode(this.getOrderId(order))
          }] không?`
        )
      ) {
        return;
      }

      try {
        await AccessoryOrderService.cancelByCustomer(this.getOrderId(order));
        alert("Hủy đơn phụ kiện thành công!");
        await this.fetchOrders();

        if (
          this.selectedOrder &&
          this.getOrderId(this.selectedOrder) === this.getOrderId(order)
        ) {
          this.selectedOrder = null;
        }
      } catch (error) {
        console.error("Lỗi khách hủy đơn phụ kiện:", error);
        alert(
          "Không thể hủy đơn: " +
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
        const cartResponse = await CartService.getCart();
        const cartItems = cartResponse?.items || [];

        for (const item of order.items) {
          const accessoryId =
            item.accessoryId?._id || item.accessoryId?.id || item.accessoryId;

          if (!accessoryId) continue;

          const latestAccessory = await AccessoryService.get(accessoryId);

          if (!latestAccessory) continue;
          if (latestAccessory.status !== "Đang bán") continue;
          if (Number(latestAccessory.quantity) <= 0) continue;

          const currentCartItem = cartItems.find((cartItem) => {
            const cartAccessoryId =
              cartItem.accessoryId?._id ||
              cartItem.accessoryId?.id ||
              cartItem.accessoryId;
            return String(cartAccessoryId) === String(accessoryId);
          });

          const existingQty = Number(currentCartItem?.quantity || 0);
          const buyQty = Number(item.quantity || 1);
          const allowedQty = Number(latestAccessory.quantity || 0) - existingQty;

          if (allowedQty <= 0) continue;

          const finalQty = buyQty > allowedQty ? allowedQty : buyQty;
          if (finalQty <= 0) continue;

          await CartService.addToCart(
            latestAccessory._id || latestAccessory.id,
            finalQty
          );
        }

        window.dispatchEvent(new Event("cart-updated"));
        alert("Đã thêm lại các sản phẩm còn phù hợp vào giỏ hàng!");
        this.closeDetail();
        this.$router.push("/cart");
      } catch (error) {
        alert(
          "Không thể mua lại lúc này: " +
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
      if (status === "Chờ xác nhận") return "status-waiting";
      if (status === "Đã xác nhận") return "status-confirmed";
      if (status === "Đang giao") return "status-delivering";
      if (status === "Giao thất bại") return "status-failed";
      if (status === "Hoàn thành") return "status-completed";
      if (status === "Đã hủy") return "status-cancelled";
      return "status-default";
    },
  },

  mounted() {
    this.fetchOrders();
  },
};
</script>

<style scoped>
.accessory-order-history-page {
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

.account-card,
.sidebar-menu,
.order-content,
.table-card {
  background: #ffffff;
  border: 1px solid #eee2f7;
  border-radius: 20px;
  box-shadow: 0 10px 24px rgba(106, 27, 154, 0.06);
}

.account-card {
  padding: 20px;
  margin-bottom: 16px;
}

.account-top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.account-info {
  min-width: 0;
}

.account-name {
  margin: 0;
  font-weight: 800;
  color: #2f1b44;
  font-size: 1.05rem;
  line-height: 1.35;
}

.account-email {
  color: #7b7287;
  font-size: 0.9rem;
  margin-top: 4px;
  word-break: break-word;
}

.account-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6a1b9a, #4a148c);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.95rem;
  flex-shrink: 0;
}

.account-note {
  margin-top: 14px;
  color: #746a80;
  font-size: 0.91rem;
  line-height: 1.7;
}

.sidebar-menu {
  overflow: hidden;
}

.menu-item {
  padding: 16px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  color: #3e3550;
  border-bottom: 1px solid #f2ebf8;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:hover {
  background: #fbf8fe;
}

.menu-item span {
  display: flex;
  align-items: center;
  min-width: 0;
}

.menu-arrow {
  color: #8c7ea5;
  font-size: 0.82rem;
}

.menu-item.active {
  background: #f3e8ff;
  color: #6a1b9a;
  font-weight: 800;
}

.menu-item.active .menu-arrow {
  color: #6a1b9a;
}

.menu-item small {
  color: #8c7ea5;
  font-size: 0.87rem;
  white-space: nowrap;
}

.order-content {
  padding: 22px;
  min-width: 0;
}

.content-head {
  margin-bottom: 12px;
}

.content-title {
  margin: 0 0 4px;
  font-size: 1.7rem;
  font-weight: 900;
  color: #2f1b44;
  line-height: 1.15;
}

.content-subtitle {
  color: #7b7287;
  font-size: 0.92rem;
}

.toolbar-box {
  display: grid;
  grid-template-columns: 1fr 120px;
  gap: 12px;
  align-items: center;
  margin-bottom: 14px;
}

.search-box {
  position: relative;
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
  min-width: 860px;
}

.order-table thead th {
  background: #f8f3fc;
  color: #514564;
  font-size: 0.9rem;
  font-weight: 800;
  padding: 14px 12px;
  border-bottom: 1px solid #ece3f4;
  text-align: left;
  white-space: nowrap;
}

.order-table tbody td {
  padding: 15px 12px;
  border-bottom: 1px solid #f2ebf8;
  vertical-align: middle;
  font-size: 0.92rem;
  color: #3d3450;
}

.order-table tbody tr:hover {
  background: #fcfaff;
}

.td-code {
  font-weight: 900;
  color: #6b46d9;
  white-space: nowrap;
}

.receiver-name {
  font-weight: 700;
  color: #2f1b44;
}

.receiver-phone {
  color: #8b7fa0;
  font-size: 0.84rem;
  margin-top: 3px;
}

.money-total {
  color: #b42318;
  font-weight: 800;
  white-space: nowrap;
}

.order-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 7px 12px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 800;
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

.status-failed {
  background: #fff4dc;
  color: #b45309;
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

.table-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.modal-head-custom {
  background: linear-gradient(135deg, #6a1b9a, #4a148c);
  color: #fff;
}

.product-line {
  display: flex;
  align-items: center;
  border: 1px solid #eee2f7;
  border-radius: 12px;
  padding: 10px;
  margin-bottom: 10px;
  background: #faf7fd;
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
  color: #7b7287;
  margin-top: 3px;
}

.product-line-total {
  font-weight: 800;
  color: #2f1b44;
  white-space: nowrap;
}

@media (max-width: 1199.98px) {
  .content-title {
    font-size: 1.5rem;
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