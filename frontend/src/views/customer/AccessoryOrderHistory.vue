<template>
  <div class="accessory-order-history-page">
    <div class="container-fluid order-page-container py-4">
      <div class="order-layout">
        <CustomerAccountSidebar active="accessory-orders" />

        <section class="order-content">
          <div class="content-head">
            <div>
              <h3 class="content-title">Đơn phụ kiện</h3>
              <p class="content-subtitle mb-0">
                Theo dõi các đơn phụ kiện bạn đã đặt
              </p>
            </div>
          </div>

          <div class="overview-cards">
            <div class="overview-card overview-total">
              <div class="overview-icon">
                <i class="fas fa-shopping-bag"></i>
              </div>
              <div class="overview-info">
                <div class="overview-label">Tổng đơn hàng</div>
                <div class="overview-value">{{ totalOrders }}</div>
              </div>
            </div>

            <div class="overview-card overview-completed">
              <div class="overview-icon">
                <i class="fas fa-check-circle"></i>
              </div>
              <div class="overview-info">
                <div class="overview-label">Hoàn thành</div>
                <div class="overview-value">{{ completedOrders }}</div>
              </div>
            </div>

            <div class="overview-card overview-processing">
              <div class="overview-icon">
                <i class="fas fa-clock"></i>
              </div>
              <div class="overview-info">
                <div class="overview-label">Đang xử lý</div>
                <div class="overview-value">{{ processingOrders }}</div>
              </div>
            </div>
          </div>

          <div class="toolbar-box">
            <div class="search-box">
              <span class="search-icon-wrap">
                <i class="fas fa-search"></i>
              </span>

              <input
                type="text"
                v-model.trim="searchText"
                placeholder="Tìm đơn hàng"
              />
            </div>

            <button
              class="refresh-btn"
              @click="fetchOrders"
              :disabled="loading"
              title="Làm mới"
            >
              <i class="fas" :class="loading ? 'fa-spinner fa-spin' : 'fa-sync-alt'"></i>
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
            <p>
              {{
                orders.length === 0
                  ? "Bạn chưa có đơn phụ kiện nào"
                  : "Không có đơn phụ kiện phù hợp"
              }}
            </p>
          </div>

          <div v-else class="table-card">
            <div class="table-wrap">
              <table class="order-table">
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Ngày đặt</th>
                    <th>Sản phẩm</th>
                    <th>Số lượng</th>
                    <th>Thanh toán</th>
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

                    <td class="td-date">
                      {{ formatDateTime(order.createdAt) }}
                    </td>

                    <td>
                      <div class="order-product-preview">
                        <img
                          :src="getOrderPreviewImage(order)"
                          alt="product"
                          class="order-preview-image"
                        />

                        <div class="order-product-text">
                          <div class="order-product-main">
                            {{ getOrderPreviewName(order) }}
                          </div>

                          <div
                            v-if="getRemainingProductCount(order) > 0"
                            class="order-product-more"
                          >
                            + {{ getRemainingProductCount(order) }} sản phẩm khác
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>{{ getProductCount(order) }}</td>

                    <td>
                      <span class="payment-badge" :class="getPaymentClass(order.paymentMethod)">
                        {{ getPaymentText(order.paymentMethod) }}
                      </span>
                    </td>

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
        <div class="modal-dialog modal-xl modal-dialog-centered">
          <div class="modal-content border-0 shadow">
            <div class="modal-header modal-head-custom">
              <h5 class="modal-title mb-0">
                <i class="fas fa-file-invoice mr-2"></i> Chi tiết đơn phụ kiện
              </h5>
              <button type="button" class="close modal-close-btn" @click="closeDetail">
                <span>&times;</span>
              </button>
            </div>

            <div class="modal-body">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <div class="detail-info-box detail-info-order">
                    <h6 class="detail-info-title">Thông tin đơn hàng</h6>
                    <p class="mb-1">
                      <strong>Mã đơn:</strong>
                      {{ selectedOrder.maDonPhuKien || getShortOrderCode(getOrderId(selectedOrder)) }}
                    </p>
                    <p class="mb-1"><strong>Ngày đặt:</strong> {{ formatDateTime(selectedOrder.createdAt) }}</p>
                    <p class="mb-1"><strong>Trạng thái:</strong> {{ selectedOrder.status }}</p>
                    <p class="mb-1">
                      <strong>Phương thức thanh toán:</strong>
                      {{ getPaymentText(selectedOrder.paymentMethod) }}
                    </p>
                    <p class="mb-1">
                      <strong>Tạm tính:</strong>
                      {{ formatCurrency(getItemsSubTotal(selectedOrder)) }}
                    </p>
                    <p class="mb-1">
                      <strong>Phí vận chuyển:</strong>
                      {{ formatCurrency(selectedOrder.shippingFee || 0) }}
                    </p>
                    <p class="mb-1 detail-total-line">
                      <strong>Tổng tiền:</strong>
                      <span>{{ formatCurrency(selectedOrder.totalAmount) }}</span>
                    </p>
                  </div>
                </div>

                <div class="col-md-6 mb-3">
                  <div class="detail-info-box detail-info-shipping">
                    <h6 class="detail-info-title">Thông tin nhận hàng</h6>
                    <p class="mb-1"><strong>Người nhận:</strong> {{ selectedOrder.customerName }}</p>
                    <p class="mb-1"><strong>Số điện thoại:</strong> {{ selectedOrder.customerPhone }}</p>
                    <p class="mb-1"><strong>Địa chỉ:</strong> {{ selectedOrder.shippingAddress }}</p>
                    <p class="mb-1"><strong>Ghi chú:</strong> {{ selectedOrder.note || "Không có" }}</p>
                  </div>
                </div>

                <div class="col-12">
                  <hr />
                  <h6 class="font-weight-bold text-dark mb-3">Sản phẩm trong đơn</h6>

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
                      <div class="product-line-name">
                        {{ item.accessoryName || item.accessoryId?.name || "Phụ kiện" }}
                      </div>

                      <div class="product-line-meta">
                        Số lượng: <strong>{{ item.quantity }}</strong>
                      </div>

                      <div class="product-price-wrap">
                        <div class="product-line-meta">
                          Đơn giá: <strong>{{ formatCurrency(item.price) }}</strong>
                        </div>

                        <div
                          v-if="isPromotionPrice(item)"
                          class="product-line-sale-note"
                        >
                          <i class="fas fa-tags mr-1"></i>
                          Giá ưu đãi đã được áp dụng tại thời điểm đặt hàng
                        </div>
                      </div>

                      <div
                        v-if="item.accessoryId?.status && item.accessoryId.status !== 'Đang bán'"
                        class="product-line-warning"
                      >
                        Sản phẩm hiện không còn mở bán
                      </div>
                    </div>

                    <div class="product-line-total-wrap">
                      <div
                        v-if="isPromotionPrice(item)"
                        class="product-line-old-price"
                      >
                        {{ formatCurrency(item.accessoryId?.price) }}
                      </div>
                      <div class="product-line-total-label">Thành tiền</div>
                      <div class="product-line-total">
                        {{ formatCurrency(item.subTotal) }}
                      </div>
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
import CustomerAccountSidebar from "@/components/customer/CustomerAccountSidebar.vue";

export default {
  name: "AccessoryOrderHistoryPage",
  components: {
    CustomerAccountSidebar,
  },
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

        const previewName = this.getOrderPreviewName(order).toLowerCase();
        const matchSearch =
          orderCode.includes(keyword) || previewName.includes(keyword);

        const matchStatus =
          this.statusFilter === "Tất cả" || order.status === this.statusFilter;

        return matchSearch && matchStatus;
      });
    },

    totalOrders() {
      return this.orders.length;
    },

    completedOrders() {
      return this.orders.filter((order) => order.status === "Hoàn thành").length;
    },

    processingOrders() {
      return this.orders.filter((order) =>
        ["Chờ xác nhận", "Đã xác nhận", "Đang giao"].includes(order.status)
      ).length;
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

    getProductCount(order) {
      return Array.isArray(order.items)
        ? order.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
        : 0;
    },

    getOrderPreviewName(order) {
      if (!Array.isArray(order?.items) || order.items.length === 0) {
        return "Không có sản phẩm";
      }

      const firstItem = order.items[0];
      return firstItem?.accessoryName || firstItem?.accessoryId?.name || "Phụ kiện";
    },

    getRemainingProductCount(order) {
      if (!Array.isArray(order?.items) || order.items.length <= 1) {
        return 0;
      }

      return order.items.length - 1;
    },

    getOrderPreviewImage(order) {
      if (!Array.isArray(order?.items) || order.items.length === 0) {
        return "https://via.placeholder.com/80x80?text=Item";
      }

      const firstItem = order.items[0];
      return this.getAccessoryImage(firstItem?.accessoryId);
    },

    getItemsSubTotal(order) {
      return Array.isArray(order?.items)
        ? order.items.reduce((sum, item) => sum + Number(item.subTotal || 0), 0)
        : 0;
    },

    getPaymentText(paymentMethod) {
      if (paymentMethod === "ZALOPAY") return "ZaloPay";
      return "Thanh toán khi nhận hàng";
    },

    getPaymentClass(paymentMethod) {
      if (paymentMethod === "ZALOPAY") return "payment-zalopay";
      return "payment-cod";
    },

    isPromotionPrice(item) {
      const currentPrice = Number(item?.accessoryId?.price || 0);
      const orderPrice = Number(item?.price || 0);

      return currentPrice > 0 && orderPrice > 0 && orderPrice < currentPrice;
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

        const params =
          this.statusFilter !== "Tất cả"
            ? { status: this.statusFilter }
            : {};

        const data = await AccessoryOrderService.getMyOrders(params);
        this.orders = Array.isArray(data) ? data : [];
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
        let addedCount = 0;

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

          addedCount += finalQty;
        }

        window.dispatchEvent(new Event("cart-updated"));

        if (addedCount <= 0) {
          alert("Không có sản phẩm nào còn đủ điều kiện để mua lại.");
          return;
        }

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
      if (!item?.image) {
        return "https://via.placeholder.com/80x80?text=Item";
      }

      if (
        String(item.image).startsWith("http://") ||
        String(item.image).startsWith("https://")
      ) {
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
.accessory-order-history-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(99, 102, 241, 0.04), transparent 24%),
    linear-gradient(180deg, #f8fafc 0%, #f3f4f6 100%);
}

.order-page-container {
  max-width: 1350px;

}

.order-layout {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  gap: 24px;
  align-items: start;
}

.order-content,
.table-card {
  background: #ffffff;
  border: 1px solid #e7e5ef;
  border-radius: 22px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
}

.order-content {
  padding: 24px;
  min-width: 0;
}

.content-head {
  margin-bottom: 14px;
}

.content-title {
  margin: 0 0 4px;
  font-size: 1.85rem;
  font-weight: 800;
  color: #111827;
  line-height: 1.15;
}

.content-subtitle {
  color: #6b7280;
  font-size: 0.94rem;
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}

.overview-card {
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: 14px;
  padding: 12px 14px;
  min-height: 78px;
  border: 1px solid #e7e5ef;
}

.overview-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: #fff;
  flex-shrink: 0;
}

.overview-info {
  min-width: 0;
}

.overview-label {
  font-size: 0.82rem;
  color: #6b7280;
  font-weight: 700;
  margin-bottom: 2px;
}

.overview-value {
  font-size: 1.15rem;
  font-weight: 800;
  line-height: 1;
  color: #111827;
}

.overview-total {
  background: linear-gradient(135deg, #eaf2ff, #ddeaff);
}

.overview-total .overview-icon {
  background: linear-gradient(135deg, #4f86f7, #2f66d6);
}

.overview-completed {
  background: linear-gradient(135deg, #ebfbf0, #dcf6e4);
}

.overview-completed .overview-icon {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}

.overview-processing {
  background: linear-gradient(135deg, #fff4e5, #fff0d6);
}

.overview-processing .overview-icon {
  background: linear-gradient(135deg, #fb923c, #f97316);
}

.toolbar-box {
  display: grid;
  grid-template-columns: minmax(280px, 760px) 42px;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
}

.search-box {
  height: 42px;
  display: flex;
  align-items: center;
  border: 1px solid #ddd6e8;
  border-radius: 12px;
  background: #fff;
  overflow: hidden;
  transition: all 0.2s ease;
}

.search-box:focus-within {
  border-color: #a5b4fc;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.search-icon-wrap {
  width: 40px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  flex-shrink: 0;
  font-size: 0.88rem;
}

.search-box input {
  flex: 1;
  width: 100%;
  height: 42px;
  border: none;
  outline: none;
  padding: 0 12px 0 0;
  font-size: 0.85rem;
  background: transparent;
  color: #111827;
}

.refresh-btn {
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 12px;
  background: #4f46e5;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  font-size: 0.92rem;
  transition: all 0.2s ease;
}

.refresh-btn:hover:not(:disabled) {
  background: #4338ca;
}

.refresh-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.status-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}

.status-tab {
  border: 1px solid #ddd6e8;
  background: #fff;
  padding: 7px 12px;
  border-radius: 999px;
  font-weight: 700;
  color: #4b5563;
  font-size: 0.84rem;
  transition: all 0.2s ease;
}

.status-tab:hover {
  background: #f8fafc;
}

.status-tab.active {
  background: #eef2ff;
  color: #3730a3;
  border-color: #c7d2fe;
}

.empty-panel {
  background: #fff;
  border: 1px solid #e7e5ef;
  border-radius: 18px;
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: #6b7280;
}

.empty-icon {
  font-size: 2.4rem;
  margin-bottom: 12px;
  color: #c4c7cf;
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
  min-width: 1180px;
}

.order-table thead th {
  background: #f8fafc;
  color: #4b5563;
  font-size: 0.85rem;
  font-weight: 800;
  padding: 13px 10px;
  border-bottom: 1px solid #eceff4;
  text-align: left;
  white-space: nowrap;
}

.order-table tbody td {
  padding: 13px 10px;
  border-bottom: 1px solid #eef2f7;
  vertical-align: middle;
  font-size: 0.88rem;
  color: #374151;
}

.order-table tbody tr:hover {
  background: #fcfcfd;
}

.td-code {
  font-weight: 800;
  color: #374151;
  white-space: nowrap;
}

.td-date {
  min-width: 150px;
  color: #6b7280;
}

.order-product-preview {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 220px;
}

.order-preview-image {
  width: 46px;
  height: 46px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
  border: 1px solid #e5e7eb;
  background: #f8fafc;
}

.order-product-text {
  min-width: 0;
}

.order-product-main {
  font-weight: 700;
  color: #111827;
  line-height: 1.3;
  font-size: 0.9rem;
  overflow-wrap: anywhere;
}

.order-product-more {
  color: #9ca3af;
  font-size: 0.78rem;
  margin-top: 3px;
}

.money-total {
  color: #111827;
  font-weight: 800;
  white-space: nowrap;
  font-size: 1rem;
}

.order-badge,
.payment-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 11px;
  border-radius: 999px;
  font-size: 0.76rem;
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

.status-waiting {
  background: #fff3d8;
  color: #b7791f;
}

.status-confirmed {
  background: #e0e7ff;
  color: #4338ca;
}

.status-delivering {
  background: #dbeafe;
  color: #1d4ed8;
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
  background: #111827;
  color: #fff;
}

.modal-close-btn {
  color: #fff;
  opacity: 1;
}

.detail-info-box {
  border-radius: 16px;
  padding: 16px 18px;
  min-height: 100%;
}

.detail-info-title {
  font-weight: 800;
  margin-bottom: 12px;
  font-size: 1rem;
}

.detail-info-order {
  background: #f8fafc;
  border: 1px solid #e7e5ef;
}

.detail-info-order .detail-info-title {
  color: #111827;
}

.detail-info-shipping {
  background: #f9fafb;
  border: 1px solid #e7e5ef;
}

.detail-info-shipping .detail-info-title {
  color: #111827;
}

.detail-total-line {
  margin-top: 10px;
  font-size: 1rem;
}

.detail-total-line span {
  color: #b42318;
  font-weight: 900;
}

.product-line {
  display: flex;
  align-items: center;
  border: 1px solid #e7e5ef;
  border-radius: 14px;
  padding: 14px;
  margin-bottom: 12px;
  background: #fcfcfd;
  gap: 14px;
}

.product-line-image {
  width: 72px;
  height: 72px;
  object-fit: cover;
  border-radius: 12px;
  flex-shrink: 0;
}

.product-line-info {
  flex: 1;
  min-width: 0;
}

.product-line-name {
  font-weight: 800;
  color: #111827;
  font-size: 1rem;
}

.product-line-meta {
  font-size: 0.87rem;
  color: #6b7280;
  margin-top: 4px;
}

.product-price-wrap {
  margin-top: 4px;
}

.product-line-sale-note {
  font-size: 0.82rem;
  color: #dc2626;
  font-weight: 700;
  margin-top: 4px;
}

.product-line-warning {
  font-size: 0.82rem;
  color: #dc2626;
  margin-top: 4px;
}

.product-line-total-wrap {
  text-align: right;
  white-space: nowrap;
}

.product-line-old-price {
  color: #9ca3af;
  font-size: 0.8rem;
  text-decoration: line-through;
  margin-bottom: 4px;
}

.product-line-total-label {
  font-size: 0.78rem;
  color: #9ca3af;
  margin-bottom: 4px;
}

.product-line-total {
  font-weight: 900;
  color: #111827;
  white-space: nowrap;
  font-size: 1rem;
}

@media (max-width: 1199.98px) {
  .content-title {
    font-size: 1.7rem;
  }

  .overview-cards {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 991.98px) {
  .order-layout {
    grid-template-columns: 1fr;
  }

  .toolbar-box {
    grid-template-columns: 1fr 42px;
  }

  .refresh-btn {
    width: 42px;
  }

  .content-title {
    font-size: 1.45rem;
  }

  .order-page-container {
    padding-left: 16px;
    padding-right: 16px;
  }
}

@media (max-width: 575.98px) {
  .product-line {
    align-items: flex-start;
  }

  .product-line-total-wrap {
    min-width: 95px;
  }

  .order-product-preview {
    min-width: 220px;
  }
}
</style>