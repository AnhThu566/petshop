<template>
  <div class="accessory-detail-page bg-light py-5" style="min-height: 100vh;">
    <div class="container">
      <div class="mb-4">
        <button class="btn btn-outline-secondary btn-sm" @click="$router.back()">
          <i class="fas fa-arrow-left mr-1"></i> Quay lại
        </button>
      </div>

      <div v-if="loading" class="text-center py-5 text-muted">
        <i class="fas fa-spinner fa-spin fa-2x mb-3 d-block"></i>
        Đang tải chi tiết phụ kiện...
      </div>

      <div v-else-if="errorMessage" class="card border-0 shadow-sm">
        <div class="card-body text-center py-5 text-danger">
          <i class="fas fa-exclamation-triangle fa-3x mb-3 d-block"></i>
          {{ errorMessage }}
        </div>
      </div>

      <div v-else-if="!accessory" class="card border-0 shadow-sm">
        <div class="card-body text-center py-5 text-muted">
          <i class="fas fa-box-open fa-3x mb-3 d-block"></i>
          Không tìm thấy phụ kiện này.
        </div>
      </div>

      <div v-else class="card border-0 shadow-sm">
        <div class="row no-gutters">
          <div class="col-md-5">
            <img
              :src="getAccessoryImage(accessory)"
              alt="accessory"
              class="w-100 h-100"
              style="object-fit: cover; min-height: 400px;"
            />
          </div>

          <div class="col-md-7">
            <div class="card-body p-4 p-lg-5">
              <div class="mb-2">
                <span class="badge badge-light border text-primary">
                  {{ accessory.maPhuKien || "---" }}
                </span>
              </div>

              <h2 class="font-weight-bold text-dark mb-3">
                {{ accessory.name || "---" }}
              </h2>

              <h4 class="text-danger font-weight-bold mb-3">
                {{ formatCurrency(accessory.price) }}
              </h4>

              <p class="mb-2">
                <strong>Trạng thái:</strong>
                <span class="badge ml-1" :class="getStatusClass(accessory.status)">
                  {{ accessory.status || "---" }}
                </span>
              </p>

              <p class="mb-3">
                <strong>Số lượng còn:</strong> {{ accessory.quantity ?? 0 }}
              </p>

              <div class="form-group mb-3" style="max-width: 160px;">
                <label class="font-weight-bold">Số lượng</label>
                <input
                  type="number"
                  min="1"
                  class="form-control"
                  v-model.number="quantity"
                />
              </div>

              <p class="mb-4">
                <strong>Mô tả:</strong><br />
                <span class="text-muted">
                  {{ accessory.description || "Chưa có mô tả cho phụ kiện này." }}
                </span>
              </p>

              <div class="d-flex flex-wrap">
                <button
                  class="btn btn-primary mr-2 mb-2"
                  @click="addToCart"
                  :disabled="accessory.status !== 'Đang bán' || Number(accessory.quantity) <= 0"
                >
                  <i class="fas fa-cart-plus mr-1"></i> Thêm vào giỏ
                </button>

                <button class="btn btn-outline-secondary mb-2" @click="$router.push('/accessories')">
                  Xem thêm phụ kiện
                </button>
              </div>

              <div class="small text-muted mt-3">
                Bạn có thể xem giỏ hàng tại trang /cart.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AccessoryService from "@/services/accessory.service";
import CartService from "@/services/cart.service";

export default {
  data() {
    return {
      accessory: null,
      loading: false,
      quantity: 1,
      errorMessage: "",
    };
  },

  methods: {
    async fetchAccessory() {
      try {
        this.loading = true;
        this.errorMessage = "";

        const id = this.$route.params.id;
        if (!id) {
          this.errorMessage = "Thiếu mã phụ kiện.";
          return;
        }

        this.accessory = await AccessoryService.get(id);
      } catch (error) {
        console.error("Lỗi tải chi tiết phụ kiện:", error);
        this.errorMessage =
          error.response?.data?.message || "Không thể tải chi tiết phụ kiện.";
        this.accessory = null;
      } finally {
        this.loading = false;
      }
    },

    async addToCart() {
      if (!this.accessory) return;

      if (this.accessory.status !== "Đang bán") {
        alert("Phụ kiện này hiện không còn bán.");
        return;
      }

      if (Number(this.accessory.quantity) <= 0) {
        alert("Phụ kiện này đang hết hàng.");
        return;
      }

      if (!this.quantity || this.quantity < 1) {
        alert("Số lượng không hợp lệ.");
        return;
      }

      try {
        await CartService.addToCart(
          this.accessory.id || this.accessory._id,
          Number(this.quantity)
        );

        alert("✅ Đã thêm phụ kiện vào giỏ hàng!");
        this.$router.push("/cart");
      } catch (error) {
        alert(error.response?.data?.message || "Không thể thêm vào giỏ hàng.");
      }
    },

    getAccessoryImage(item) {
      if (item && item.image) return "http://localhost:3000" + item.image;
      return "https://via.placeholder.com/500x400";
    },

    formatCurrency(value) {
      if (value === null || value === undefined) return "---";
      return Number(value).toLocaleString("vi-VN") + " ₫";
    },

    getStatusClass(status) {
      if (status === "Đang bán") return "badge-success";
      if (status === "Ngừng bán") return "badge-secondary";
      return "badge-light border";
    },
  },

  mounted() {
    this.fetchAccessory();
  },
};
</script>