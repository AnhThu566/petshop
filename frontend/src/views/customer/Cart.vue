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
          <div class="card border-0 shadow-sm mb-4">
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

        <div class="col-lg-4">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <h5 class="font-weight-bold mb-4">Thông tin đặt hàng</h5>

              <div class="form-group">
                <label>Họ tên người nhận <span class="text-danger">*</span></label>
                <input type="text" class="form-control" v-model.trim="form.customerName" />
              </div>

              <div class="form-group">
                <label>Số điện thoại <span class="text-danger">*</span></label>
                <input type="text" class="form-control" v-model.trim="form.customerPhone" />
              </div>

              <div class="form-group">
                <label>Địa chỉ nhận hàng <span class="text-danger">*</span></label>
                <textarea class="form-control" rows="3" v-model.trim="form.shippingAddress"></textarea>
              </div>

              <div class="form-group">
                <label>Ghi chú</label>
                <textarea class="form-control" rows="2" v-model.trim="form.note"></textarea>
              </div>

              <hr />

              <div class="d-flex justify-content-between mb-2">
                <span>Tổng số lượng:</span>
                <strong>{{ totalCount }}</strong>
              </div>

              <div class="d-flex justify-content-between mb-3">
                <span>Tổng tiền:</span>
                <strong class="text-danger">{{ formatCurrency(totalPrice) }}</strong>
              </div>

              <button class="btn btn-primary btn-block mb-2" @click="submitOrder" :disabled="isSubmitting">
                <i class="fas fa-check-circle mr-1"></i>
                {{ isSubmitting ? "Đang xử lý..." : "Đặt hàng phụ kiện" }}
              </button>

              <router-link to="/accessories" class="btn btn-outline-secondary btn-block">
                Tiếp tục mua sắm
              </router-link>

              <router-link to="/accessory-orders" class="btn btn-outline-primary btn-block mt-2">
                Lịch sử đơn phụ kiện
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CartService from "@/services/cart.service";
import AccessoryOrderService from "@/services/accessoryOrder.service";

export default {
  data() {
    return {
      cart: [],
      isSubmitting: false,
      form: {
        customerName: "",
        customerPhone: "",
        shippingAddress: "",
        note: "",
      },
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

      const user = JSON.parse(localStorage.getItem("user") || "null");
      if (user) {
        this.form.customerName = user.fullName || "";
        this.form.customerPhone = user.phone || "";
      }
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

    async submitOrder() {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      if (!user) {
        alert("Vui lòng đăng nhập để đặt hàng phụ kiện.");
        this.$router.push("/login");
        return;
      }

      if (!this.form.customerName) {
        alert("Vui lòng nhập họ tên người nhận.");
        return;
      }

      if (!this.form.customerPhone) {
        alert("Vui lòng nhập số điện thoại.");
        return;
      }

      if (!this.form.shippingAddress) {
        alert("Vui lòng nhập địa chỉ nhận hàng.");
        return;
      }

      if (this.cart.length === 0) {
        alert("Giỏ hàng đang trống.");
        return;
      }

      this.isSubmitting = true;

      try {
        await AccessoryOrderService.create({
          customerName: this.form.customerName,
          customerPhone: this.form.customerPhone,
          shippingAddress: this.form.shippingAddress,
          note: this.form.note,
          items: this.cart.map((item) => ({
            accessoryId: item.id,
            quantity: item.quantity,
          })),
        });

        alert("✅ Đặt đơn phụ kiện thành công!");
        CartService.clearCart();
        this.loadCart();
        this.$router.push("/accessory-orders");
      } catch (error) {
        console.error("Lỗi đặt đơn phụ kiện:", error);
        alert("❌ Lỗi đặt đơn: " + (error.response?.data?.message || error.message));
      } finally {
        this.isSubmitting = false;
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
  },

  mounted() {
    this.loadCart();
  },
};
</script>