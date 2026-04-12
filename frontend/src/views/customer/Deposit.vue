<template>
  <div class="deposit-page py-5">
    <div class="container custom-container">
      <div class="page-head text-center mb-5">
        <h2 class="page-title">
          <i class="fas fa-hand-holding-heart mr-2"></i>
          Đặt cọc đón bé về nhà
        </h2>
        <p class="page-subtitle mb-0">
          Kiểm tra thông tin bé chó và điền thông tin nhận bé trước khi gửi yêu cầu đặt cọc.
        </p>
      </div>

      <div class="row" v-if="dog">
        <div class="col-lg-7 mb-4">
          <div class="content-card p-4 p-md-5">
            <h5 class="block-title">Thông tin người nhận</h5>

            <form @submit.prevent="submitDeposit">
              <div class="form-group mb-4">
                <label class="field-label">
                  Họ và tên người nhận <span class="text-danger">*</span>
                </label>
                <div class="input-group custom-input-group">
                  <div class="input-group-prepend">
                    <span class="input-group-text bg-white">
                      <i class="fas fa-user text-muted"></i>
                    </span>
                  </div>
                  <input
                    type="text"
                    class="form-control"
                    v-model.trim="form.customerName"
                    placeholder="Nhập họ tên..."
                    required
                  />
                </div>
              </div>

              <div class="form-group mb-4">
                <label class="field-label">
                  Số điện thoại liên hệ <span class="text-danger">*</span>
                </label>
                <div class="input-group custom-input-group">
                  <div class="input-group-prepend">
                    <span class="input-group-text bg-white">
                      <i class="fas fa-phone text-muted"></i>
                    </span>
                  </div>
                  <input
                    type="tel"
                    class="form-control"
                    v-model.trim="form.customerPhone"
                    placeholder="Nhập số điện thoại..."
                    required
                  />
                </div>
              </div>

              <div class="form-group mb-4">
                <label class="field-label">
                  Địa chỉ nhận bé <span class="text-danger">*</span>
                </label>
                <div class="input-group custom-input-group">
                  <div class="input-group-prepend">
                    <span class="input-group-text bg-white">
                      <i class="fas fa-map-marker-alt text-muted"></i>
                    </span>
                  </div>
                  <input
                    type="text"
                    class="form-control"
                    v-model.trim="form.customerAddress"
                    placeholder="Nhập địa chỉ nhận bé..."
                    required
                  />
                </div>
              </div>

              <div class="form-group mb-4">
                <label class="field-label">
                  Phương thức thanh toán cọc <span class="text-danger">*</span>
                </label>
                <select class="form-control custom-select" v-model="form.paymentMethod" required>
                  <option value="Chuyển khoản">Chuyển khoản</option>
                  <option value="Tiền mặt">Tiền mặt</option>
                </select>
              </div>

              <div class="form-group mb-4" v-if="form.paymentMethod === 'Chuyển khoản'">
                <label class="field-label">
                  Minh chứng chuyển khoản <span class="text-danger">*</span>
                </label>
                <input
                  type="text"
                  class="form-control"
                  v-model.trim="form.paymentProof"
                  placeholder="Mã giao dịch / link bill / tên file bill"
                />
                <small class="text-muted">
                  Dùng để hệ thống đối soát trước khi xác nhận khoản cọc.
                </small>
              </div>

              <div class="form-group mb-4">
                <label class="field-label">Ghi chú thêm</label>
                <textarea
                  class="form-control"
                  v-model.trim="form.note"
                  rows="3"
                  placeholder="Lời nhắn thêm..."
                ></textarea>
              </div>

              <div class="policy-box mb-4">
                <div class="policy-title mb-2">
                  <i class="fas fa-shield-alt mr-2"></i>Chính sách đặt cọc
                </div>
                <ul class="policy-list mb-0">
                  <li>Yêu cầu đặt cọc được xác nhận sau khi quản trị viên kiểm tra thông tin thanh toán.</li>
                  <li>Nếu chọn chuyển khoản, khách cần cung cấp minh chứng.</li>
                  <li>Phần tiền còn lại thanh toán khi bàn giao chó thành công.</li>
                </ul>
              </div>

              <button
                type="submit"
                class="btn btn-main btn-lg btn-block font-weight-bold py-3 mt-4 shadow-sm"
                :disabled="isSubmitting"
              >
                <span v-if="isSubmitting">
                  <i class="fas fa-spinner fa-spin mr-2"></i> Đang xử lý...
                </span>
                <span v-else>
                  <i class="fas fa-check-circle mr-2"></i> XÁC NHẬN ĐẶT CỌC
                </span>
              </button>
            </form>
          </div>
        </div>

        <div class="col-lg-5">
          <div class="summary-card sticky-top" style="top: 20px;">
            <div class="summary-top">
              <img :src="dogImage" class="dog-thumb" alt="Ảnh chó" />

              <div class="summary-top-content">
                <div class="summary-badge">GIỮ CHỖ BÉ CHÓ</div>
                <h4 class="summary-name mb-1">{{ dog.name }}</h4>
                <p class="summary-sub mb-1">Giống: {{ dog.breedId?.name || "Đang cập nhật" }}</p>
                <strong class="summary-price">{{ formatCurrency(dog.price) }}</strong>
              </div>
            </div>

            <div class="summary-body">
              <div class="source-box mb-3">
                <div class="source-title">Thông tin nguồn gốc</div>
                <div class="source-value">
                  {{ dog.sourceVerified ? "Đã được hệ thống xác minh" : "Đang cập nhật trong hệ thống" }}
                </div>
                <div class="source-desc">
                  Thông tin nguồn gốc được hệ thống quản lý để đảm bảo minh bạch trước khi mở bán.
                </div>
              </div>

              <div class="health-box mb-3">
                <div class="health-title">Thông tin sức khỏe tóm tắt</div>
                <div class="health-row">
                  <span>Sức khỏe</span>
                  <strong>{{ dog.healthStatus || "Đang cập nhật" }}</strong>
                </div>
                <div class="health-row">
                  <span>Tẩy giun gần nhất</span>
                  <strong>{{ formatDate(dog.lastDeworming) }}</strong>
                </div>
                <div class="health-row">
                  <span>Điều kiện bán</span>
                  <strong>{{ dog.eligibleForSale ? "Đủ điều kiện" : "Đang cập nhật" }}</strong>
                </div>
              </div>

              <div class="price-breakdown mb-3">
                <div class="price-row">
                  <span>Tổng giá trị</span>
                  <strong>{{ formatCurrency(dog.price) }}</strong>
                </div>
                <div class="price-row">
                  <span>Tỷ lệ cọc</span>
                  <strong>{{ depositRateText }}</strong>
                </div>
                <div class="price-row">
                  <span>Tiền còn lại</span>
                  <strong>{{ formatCurrency(remainingAmount) }}</strong>
                </div>
                <div class="price-row total-row">
                  <span>Số tiền cần cọc</span>
                  <strong>{{ formatCurrency(depositAmount) }}</strong>
                </div>
              </div>

              <div class="payment-box" v-if="form.paymentMethod === 'Chuyển khoản'">
                <div class="payment-title text-center">
                  <i class="fas fa-university mr-1"></i>Thông tin chuyển khoản
                </div>
                <div class="payment-item"><strong>Ngân hàng:</strong> Vietcombank (VCB)</div>
                <div class="payment-item"><strong>Chủ tài khoản:</strong> NGUYEN VAN A</div>
                <div class="payment-item"><strong>Số tài khoản:</strong> 0123456789</div>
                <div class="payment-note">
                  Nội dung CK:
                  <strong>Cọc bé {{ dog.name }} - {{ form.customerPhone || "SĐT" }}</strong>
                </div>
              </div>

              <div class="payment-box cash-box" v-else>
                <div class="payment-title text-center text-warning">
                  <i class="fas fa-money-bill-wave mr-1"></i>Thanh toán tiền mặt
                </div>
                <div class="small text-dark text-center">
                  Hệ thống sẽ ghi nhận yêu cầu và quản trị viên sẽ liên hệ xác nhận.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state text-center py-5">
        <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
        <h4 class="text-dark">Không tìm thấy thông tin thú cưng</h4>
        <p class="text-muted mb-4">
          Vui lòng quay lại danh sách để chọn một bé cún trước khi đặt cọc nhé.
        </p>
        <router-link to="/dogs" class="btn btn-main px-4 py-2 font-weight-bold rounded-pill">
          Quay lại danh sách chó
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import OrderService from "@/services/order.service";
import DogService from "@/services/dog.service";

export default {
  name: "DepositPage",

  data() {
    return {
      dog: null,
      currentUser: null,
      form: {
        customerName: "",
        customerPhone: "",
        customerAddress: "",
        paymentMethod: "Chuyển khoản",
        paymentProof: "",
        note: "",
      },
      isSubmitting: false,
    };
  },

  computed: {
    depositAmount() {
      if (!this.dog) return 0;
      if (this.dog.depositAmount && Number(this.dog.depositAmount) > 0) {
        return Number(this.dog.depositAmount);
      }
      if (!this.dog.price) return 0;
      return Math.round(Number(this.dog.price) * 0.3);
    },

    remainingAmount() {
      if (!this.dog || !this.dog.price) return 0;
      return Number(this.dog.price) - this.depositAmount;
    },

    depositRateText() {
      if (!this.dog || !this.dog.price) return "---";
      const rate = Math.round((this.depositAmount / Number(this.dog.price)) * 100);
      return `${rate}%`;
    },

    dogImage() {
      if (!this.dog?.image) return "https://via.placeholder.com/100";
      if (String(this.dog.image).startsWith("http")) return this.dog.image;
      return `http://localhost:3000${this.dog.image}`;
    },
  },

  async created() {
    const userData = localStorage.getItem("user");
    if (userData) {
      this.currentUser = JSON.parse(userData);
      this.form.customerName = this.currentUser.fullName || this.currentUser.username || "";
      this.form.customerPhone = this.currentUser.phone || "";
      this.form.customerAddress = this.currentUser.address || "";
    }

    const savedDog = localStorage.getItem("checkoutDog");
    if (savedDog) {
      const localDog = JSON.parse(savedDog);
      try {
        this.dog = await DogService.get(localDog._id || localDog.id);
      } catch (error) {
        console.error(error);
        this.dog = null;
      }
    }
  },

  methods: {
    formatCurrency(value) {
      if (value === null || value === undefined) return "---";
      return Number(value).toLocaleString("vi-VN") + " ₫";
    },

    formatDate(date) {
      if (!date) return "Chưa cập nhật";
      return new Date(date).toLocaleDateString("vi-VN");
    },

    async submitDeposit() {
      if (!this.dog) return;

      if (!this.currentUser || this.currentUser.role !== "customer") {
        alert("⚠️ Chỉ khách hàng mới có thể thực hiện đặt cọc!");
        this.$router.push("/login");
        return;
      }

      if (
        this.dog.approvalStatus !== "Đã duyệt" ||
        this.dog.saleStatus !== "Sẵn sàng bán" ||
        !this.dog.isPublished ||
        !this.dog.sourceVerified ||
        !this.dog.eligibleForSale
      ) {
        alert("❌ Bé chó này hiện không còn sẵn sàng để đặt cọc.");
        return;
      }

      if (!this.form.customerName || !this.form.customerPhone || !this.form.customerAddress) {
        alert("⚠️ Vui lòng nhập đầy đủ thông tin người nhận.");
        return;
      }

      if (this.form.paymentMethod === "Chuyển khoản" && !this.form.paymentProof?.trim()) {
        alert("⚠️ Vui lòng nhập minh chứng chuyển khoản trước khi gửi yêu cầu đặt cọc.");
        return;
      }

      const confirmMessage =
        `Vui lòng kiểm tra lại thông tin đặt cọc:\n\n` +
        `- Bé chó: ${this.dog.name}\n` +
        `- Nguồn gốc: ${this.dog.sourceVerified ? "Đã xác minh" : "Đang cập nhật"}\n` +
        `- Tổng giá: ${this.formatCurrency(this.dog.price)}\n` +
        `- Tiền cọc: ${this.formatCurrency(this.depositAmount)}\n` +
        `- Tiền còn lại: ${this.formatCurrency(this.remainingAmount)}\n` +
        `- Phương thức cọc: ${this.form.paymentMethod}\n\n` +
        `Bạn xác nhận gửi yêu cầu đặt cọc?`;

      if (!confirm(confirmMessage)) return;

      this.isSubmitting = true;

      const orderData = {
        customerName: this.form.customerName,
        customerPhone: this.form.customerPhone,
        customerAddress: this.form.customerAddress,
        note: this.form.note,
        paymentMethod: this.form.paymentMethod,
        paymentProof: this.form.paymentProof,
        dogId: this.dog._id || this.dog.id,
        farmId: this.dog.farmId?._id || this.dog.farmId,
      };

      try {
        await OrderService.createDeposit(orderData);
        localStorage.removeItem("checkoutDog");
        alert("🎉 Tạo yêu cầu đặt cọc thành công! Đơn của bạn đang chờ admin xác nhận khoản cọc.");
        this.$router.push("/tra-cuu-don");
      } catch (error) {
        alert("❌ Có lỗi xảy ra: " + (error.response?.data?.message || error.message));
      } finally {
        this.isSubmitting = false;
      }
    },
  },
};
</script>

<style scoped>
.deposit-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #faf7fc 0%, #f5effb 100%);
}

@media (min-width: 1200px) {
  .custom-container {
    max-width: 1300px !important;
  }
}

.page-title {
  color: #6a1b9a;
  font-weight: 800;
  text-transform: uppercase;
}

.page-subtitle {
  color: #6b7280;
  max-width: 760px;
  margin: 0 auto;
  line-height: 1.7;
}

.content-card,
.summary-card,
.empty-state {
  background: #ffffff;
  border-radius: 22px;
  box-shadow: 0 12px 30px rgba(106, 27, 154, 0.08);
  border: 1px solid #eee2f7;
}

.block-title {
  font-weight: 800;
  color: #4a148c;
  border-bottom: 1px solid #eee2f7;
  padding-bottom: 14px;
  margin-bottom: 24px;
}

.field-label {
  font-weight: 700;
  color: #6b7280;
  font-size: 0.85rem;
}

.btn-main {
  background-color: #6a1b9a;
  color: white;
  transition: all 0.2s;
  border: none;
}

.btn-main:hover {
  background-color: #4a148c;
  color: white;
  transform: translateY(-2px);
}

.btn-main:disabled {
  background-color: #9c27b0;
  opacity: 0.7;
  transform: none;
}

.form-control,
.custom-select {
  border-color: #e1d5ed;
  min-height: 46px;
}

.form-control:focus,
.custom-select:focus {
  box-shadow: none;
  border-color: #6a1b9a;
}

.input-group-text {
  border-right: none;
  border-color: #e1d5ed;
}

.custom-input-group .form-control {
  border-left: none;
}

.custom-input-group:focus-within .input-group-text {
  border-color: #6a1b9a;
}

.custom-input-group:focus-within .fas {
  color: #6a1b9a !important;
}

.policy-box {
  background: #faf6fd;
  border: 1px solid #eadcf5;
  border-radius: 16px;
  padding: 18px;
}

.policy-title {
  color: #6a1b9a;
  font-weight: 800;
}

.policy-list {
  padding-left: 18px;
  color: #6b7280;
}

.policy-list li + li {
  margin-top: 8px;
}

.summary-top {
  padding: 22px;
  border-bottom: 1px solid #eee2f7;
  display: flex;
  gap: 16px;
  align-items: center;
}

.dog-thumb {
  width: 96px;
  height: 96px;
  border-radius: 16px;
  object-fit: cover;
  border: 1px solid #e1d5ed;
  flex-shrink: 0;
}

.summary-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 999px;
  background: #f1e7fb;
  color: #6a1b9a;
  font-size: 0.78rem;
  font-weight: 800;
  margin-bottom: 8px;
}

.summary-name {
  color: #2f1b44;
  font-weight: 800;
}

.summary-sub {
  color: #7b7287;
}

.summary-price {
  color: #d63384;
  font-size: 1.2rem;
}

.summary-body {
  padding: 22px;
}

.source-box,
.health-box {
  background: #faf6fd;
  border: 1px solid #eadcf5;
  border-radius: 16px;
  padding: 16px;
}

.source-title,
.health-title,
.payment-title {
  font-weight: 800;
  color: #6a1b9a;
  margin-bottom: 8px;
}

.source-value {
  font-weight: 800;
  color: #2f1b44;
  margin-bottom: 4px;
}

.source-desc {
  color: #6b7280;
  font-size: 0.92rem;
  line-height: 1.6;
}

.health-row,
.price-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
  color: #5f6673;
}

.health-row + .health-row,
.price-row + .price-row {
  border-top: 1px dashed #eadcf5;
}

.price-breakdown {
  background: #ffffff;
  border: 1px solid #eadcf5;
  border-radius: 16px;
  padding: 14px 16px;
}

.total-row strong {
  color: #dc3545;
  font-size: 1.1rem;
}

.payment-box {
  background-color: #f4ebf8;
  border: 1px dashed #6a1b9a;
  border-radius: 16px;
  padding: 16px;
}

.payment-item {
  color: #2f1b44;
  font-size: 0.94rem;
  margin-bottom: 6px;
}

.payment-note {
  color: #c2410c;
  font-size: 0.9rem;
  font-style: italic;
  text-align: center;
  margin-top: 10px;
}

.cash-box {
  background-color: #fdf6e3;
  border-color: #d4a017;
}

@media (max-width: 991.98px) {
  .summary-card {
    position: static !important;
  }
}
</style>