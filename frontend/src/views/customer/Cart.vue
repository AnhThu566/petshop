<template>
  <div class="cart-page bg-light py-5" style="min-height: 100vh;">
    <div class="container">
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap">
        <h3 class="font-weight-bold text-dark mb-2">
          <i class="fas fa-shopping-cart text-primary mr-2"></i>
          GIỎ HÀNG PHỤ KIỆN
        </h3>

        <button class="btn btn-outline-danger btn-sm" @click="clearCart" v-if="cart.length > 0">
          <i class="fas fa-trash mr-1"></i> Xóa toàn bộ
        </button>
      </div>

      <div v-if="cart.length === 0" class="card border-0 shadow-sm">
        <div class="card-body text-center py-5 text-muted">
          <i class="fas fa-shopping-cart fa-3x mb-3 d-block"></i>
          Giỏ hàng của bạn đang trống.
          <div class="mt-3">
            <router-link to="/accessories" class="btn btn-primary btn-sm">
              Xem phụ kiện
            </router-link>
          </div>
        </div>
      </div>

      <div v-else class="row">
        <div class="col-lg-8">
          <div class="card border-0 shadow-sm">
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="bg-light">
                  <tr class="text-center small text-secondary">
                    <th class="py-3">Sản phẩm</th>
                    <th class="py-3">Giá</th>
                    <th class="py-3">Số lượng</th>
                    <th class="py-3">Thành tiền</th>
                    <th class="py-3">Xóa</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="item in cart" :key="item.id">
                    <td>
                      <div class="d-flex align-items-center">
                        <img
                          :src="getAccessoryImage(item)"
                          alt="accessory"
                          class="rounded shadow-sm mr-3"
                          style="width: 70px; height: 70px; object-fit: cover;"
                        />
                        <div>
                          <div class="font-weight-bold text-dark">
                            {{ item.name }}
                          </div>
                          <div class="small text-muted">
                            {{ item.maPhuKien || "---" }}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td class="text-danger font-weight-bold text-center">
                      {{ formatCurrency(item.price) }}
                    </td>

                    <td class="text-center" style="max-width: 140px;">
                      <input
                        type="number"
                        min="1"
                        class="form-control form-control-sm text-center"
                        :value="item.quantity"
                        @change="changeQuantity(item, $event)"
                      />
                    </td>

                    <td class="font-weight-bold text-dark text-center">
                      {{ formatCurrency(Number(item.price) * Number(item.quantity)) }}
                    </td>

                    <td class="text-center">
                      <button class="btn btn-sm btn-outline-danger" @click="removeItem(item)">
                        <i class="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="col-lg-4 mt-4 mt-lg-0">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <h5 class="font-weight-bold mb-4">Tóm tắt đơn hàng</h5>

              <div class="d-flex justify-content-between mb-2">
                <span>Tổng số lượng:</span>
                <strong>{{ totalCount }}</strong>
              </div>

              <div class="d-flex justify-content-between mb-3">
                <span>Tổng tiền:</span>
                <strong class="text-danger">{{ formatCurrency(totalPrice) }}</strong>
              </div>

              <hr />

              <button class="btn btn-primary btn-block mb-2" disabled>
                <i class="fas fa-credit-card mr-1"></i> Thanh toán
              </button>

              <router-link to="/accessories" class="btn btn-outline-secondary btn-block">
                Tiếp tục mua sắm
              </router-link>

              <div class="small text-muted mt-3">
                Bước thanh toán phụ kiện có thể làm tiếp sau khi bạn chốt phần dịch vụ.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Có thể thêm modal xác nhận sau nếu cần -->
  </div>
</template>

<script>
import CartService from "@/services/cart.service";

export default {
  data() {
    return {
      cart: [],
    };
  },

  computed: {
    totalCount() {
      return this.cart.reduce((sum, item) => sum + Number(item.quantity), 0);
    },

    totalPrice() {
      return this.cart.reduce(
        (sum, item) => sum + Number(item.price) * Number(item.quantity),
        0
      );
    },
  },

  methods: {
    loadCart() {
      this.cart = CartService.getCart();
    },

    changeQuantity(item, event) {
      const value = Number(event.target.value);

      if (!value || value < 1) {
        event.target.value = item.quantity;
        return;
      }

      CartService.updateQuantity(item.id, value);
      this.loadCart();
    },

    removeItem(item) {
      if (!confirm(`Xóa [${item.name}] khỏi giỏ hàng?`)) return;
      CartService.removeItem(item.id);
      this.loadCart();
    },

    clearCart() {
      if (!confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng?")) return;
      CartService.clearCart();
      this.loadCart();
    },

    getAccessoryImage(item) {
      if (item?.image) return "http://localhost:3000" + item.image;
      return "https://via.placeholder.com/100";
    },

    formatCurrency(value) {
      if (value === null || value === undefined) return "---";
      return Number(value).toLocaleString("vi-VN") + " ₫";
    },
  },

  mounted() {
    this.loadCart();
  },
};
</script>