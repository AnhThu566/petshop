<template>
  <div class="deposit-page py-4 py-md-5">
    <div class="container custom-container">
      <div class="page-head text-center mb-4 mb-md-5">
        <span class="page-kicker">Xác nhận giữ bé</span>
        <h2 class="page-title">
          <i class="fas fa-hand-holding-heart mr-2"></i>
          Đặt cọc đón bé về nhà
        </h2>
        <p class="page-subtitle mb-0">
          Kiểm tra thông tin bé chó và gửi yêu cầu đặt cọc để hệ thống xác nhận.
        </p>
      </div>

      <div v-if="loading" class="empty-state text-center py-5">
        <i class="fas fa-spinner fa-spin fa-3x mb-3 text-custom"></i>
        <h4 class="text-dark">Đang tải thông tin bé chó</h4>
        <p class="text-muted mb-0">
          Hệ thống đang kiểm tra lại trạng thái mở bán.
        </p>
      </div>

      <div class="row" v-else-if="dog">
        <div class="col-lg-7 mb-4">
          <div class="content-card p-4 p-md-4">
            <div class="checkout-head mb-4">
              <h5 class="block-title mb-2">Thông tin người nhận</h5>
              <p class="block-subtitle mb-0">
                Điền chính xác thông tin để hệ thống liên hệ xác nhận khoản cọc và bàn giao bé.
              </p>
            </div>

            <form @submit.prevent="submitDeposit">
              <div class="form-row">
                <div class="form-group col-md-6 mb-4">
                  <label class="field-label">
                    Họ và tên <span class="text-danger">*</span>
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
                      :disabled="isSubmitting"
                      required
                    />
                  </div>
                </div>

                <div class="form-group col-md-6 mb-4">
                  <label class="field-label">
                    Số điện thoại <span class="text-danger">*</span>
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
                      :disabled="isSubmitting"
                      required
                    />
                  </div>
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
                    :disabled="isSubmitting"
                    required
                  />
                </div>
              </div>

              <div class="form-group mb-4">
                <label class="field-label">
                  Phương thức thanh toán cọc <span class="text-danger">*</span>
                </label>

                <div class="payment-method-grid">
                  <label
                    class="payment-method-card"
                    :class="{ active: form.paymentMethod === 'Chuyển khoản' }"
                  >
                    <input
                      type="radio"
                      value="Chuyển khoản"
                      v-model="form.paymentMethod"
                      :disabled="isSubmitting"
                    />
                    <div class="method-icon">
                      <i class="fas fa-university"></i>
                    </div>
                    <div class="method-content">
                      <div class="method-title">Chuyển khoản</div>
                      <div class="method-desc">Gửi thông tin minh chứng để admin đối soát.</div>
                    </div>
                  </label>

                  <label
                    class="payment-method-card"
                    :class="{ active: form.paymentMethod === 'Tiền mặt' }"
                  >
                    <input
                      type="radio"
                      value="Tiền mặt"
                      v-model="form.paymentMethod"
                      :disabled="isSubmitting"
                    />
                    <div class="method-icon">
                      <i class="fas fa-money-bill-wave"></i>
                    </div>
                    <div class="method-content">
                      <div class="method-title">Tiền mặt</div>
                      <div class="method-desc">Admin sẽ liên hệ để xác nhận yêu cầu đặt cọc.</div>
                    </div>
                  </label>
                </div>
              </div>

              <div class="form-group mb-4" v-if="form.paymentMethod === 'Chuyển khoản'">
                <label class="field-label">
                  Thông tin minh chứng chuyển khoản <span class="text-danger">*</span>
                </label>
                <textarea
                  class="form-control proof-textarea"
                  v-model.trim="form.paymentProof"
                  rows="3"
                  placeholder="Nhập mã giao dịch, nội dung chuyển khoản hoặc thông tin bill..."
                  :disabled="isSubmitting"
                ></textarea>
                <small class="text-muted">
                  Dùng để admin kiểm tra và xác nhận khoản cọc.
                </small>
              </div>

              <div class="form-group mb-4">
                <label class="field-label">Ghi chú thêm</label>
                <textarea
                  class="form-control note-textarea"
                  v-model.trim="form.note"
                  rows="3"
                  placeholder="Lời nhắn thêm cho quản trị viên..."
                  :disabled="isSubmitting"
                ></textarea>
              </div>

              <div class="policy-box mb-4">
                <div class="policy-title mb-2">
                  <i class="fas fa-shield-alt mr-2"></i>Lưu ý đặt cọc
                </div>
                <ul class="policy-list mb-0">
                  <li>Yêu cầu đặt cọc chỉ được xác nhận sau khi admin kiểm tra thông tin.</li>
                  <li>Nếu chọn chuyển khoản, vui lòng nhập thông tin minh chứng để đối soát.</li>
                  <li>Số tiền còn lại sẽ thanh toán khi hoàn tất bàn giao bé.</li>
                </ul>
              </div>

              <div v-if="!canSubmit" class="warning-box mb-4">
                <i class="fas fa-exclamation-circle mr-2"></i>
                Bé chó này hiện không còn ở trạng thái sẵn sàng đặt cọc.
              </div>

              <button
                type="submit"
                class="btn btn-main btn-lg btn-block font-weight-bold py-3 mt-3 shadow-sm"
                :disabled="isSubmitting || !canSubmit"
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
                <div class="summary-badge">THÔNG TIN BÉ CHÓ</div>
                <h4 class="summary-name mb-1">{{ dog.name }}</h4>
                <p class="summary-sub mb-1">Giống: {{ dog.breedId?.name || "Đang cập nhật" }}</p>
                <p class="summary-sub mb-1" v-if="dog.farmId?.name">
                  Nguồn cung: {{ dog.farmId.name }}
                </p>
                <strong class="summary-price">{{ formatCurrency(dog.price) }}</strong>
              </div>
            </div>

            <div class="summary-body">
              <div class="status-box mb-3" :class="getStatusBoxClass(dog.saleStatus)">
                <div class="status-title">Trạng thái hiện tại</div>
                <div class="status-value">{{ getSaleStatusText(dog.saleStatus) }}</div>
              </div>

              <div class="health-box mb-3">
                <div class="health-title">Sức khỏe tóm tắt</div>
                <div class="health-row">
                  <span>Sức khỏe</span>
                  <strong>{{ dog.healthStatus || "Đang cập nhật" }}</strong>
                </div>
                <div class="health-row">
                  <span>Tẩy giun gần nhất</span>
                  <strong>{{ formatDate(dog.lastDeworming) }}</strong>
                </div>
                <div class="health-row">
                  <span>Tiêm vaccine</span>
                  <strong>{{ dog.vaccinated ? "Đã có hồ sơ" : "Chưa cập nhật" }}</strong>
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
                  Admin sẽ liên hệ để xác nhận yêu cầu đặt cọc của bạn.
                </div>
              </div>

              <div class="checkout-note-box mt-3">
                <div class="checkout-note-title">
                  <i class="fas fa-lock mr-2"></i>Đặt cọc an toàn qua hệ thống
                </div>
                <div class="checkout-note-text">
                  Chỉ các bé đã được duyệt, đang mở bán và còn sẵn sàng giao dịch mới có thể gửi yêu cầu đặt cọc.
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
          Bé có thể không còn ở trạng thái hiển thị công khai hoặc dữ liệu tạm thời không khả dụng.
        </p>
        <router-link to="/dogs/breeds" class="btn btn-main px-4 py-2 font-weight-bold rounded-pill">
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
      loading: true,
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
      const price = Number(this.dog.price);
      if (!price) return "---";
      const rate = Math.round((this.depositAmount / price) * 100);
      return `${rate}%`;
    },

    dogImage() {
      if (!this.dog?.image) return "https://via.placeholder.com/100";
      if (String(this.dog.image).startsWith("http")) return this.dog.image;
      return `http://localhost:3000${this.dog.image}`;
    },

    canSubmit() {
      if (!this.dog) return false;

      return (
        this.dog.approvalStatus === "Đã duyệt" &&
        this.dog.saleStatus === "Sẵn sàng bán" &&
        this.dog.isPublished
      );
    },
  },

  async created() {
    this.initCurrentUser();
    await this.loadDogData();
  },

  methods: {
    initCurrentUser() {
      const userData = localStorage.getItem("user");
      if (!userData) return;

      this.currentUser = JSON.parse(userData);
      this.form.customerName =
        this.currentUser.fullName || this.currentUser.username || "";
      this.form.customerPhone = this.currentUser.phone || "";
      this.form.customerAddress = this.currentUser.address || "";
    },

    async loadDogData() {
      this.loading = true;
      this.dog = null;

      try {
        const savedDog = localStorage.getItem("checkoutDog");
        const queryDogId = this.$route.query.dogId;

        let dogId = "";

        if (savedDog) {
          const localDog = JSON.parse(savedDog);
          dogId = localDog?._id || localDog?.id || "";
        }

        if (!dogId && queryDogId) {
          dogId = queryDogId;
        }

        if (!dogId) {
          this.dog = null;
          return;
        }

        this.dog = await DogService.getPublicById(dogId);
      } catch (error) {
        console.error("Lỗi tải thông tin bé chó để đặt cọc:", error);
        this.dog = null;
      } finally {
        this.loading = false;
      }
    },

    formatCurrency(value) {
      if (value === null || value === undefined) return "---";
      return Number(value).toLocaleString("vi-VN") + " ₫";
    },

    formatDate(date) {
      if (!date) return "Chưa cập nhật";
      return new Date(date).toLocaleDateString("vi-VN");
    },

    getSaleStatusText(status) {
      if (status === "Sẵn sàng bán") return "Sẵn sàng đặt cọc";
      if (status === "Chờ thanh toán") return "Đang chờ xác nhận cọc";
      if (status === "Đã đặt cọc") return "Đã được giữ chỗ";
      if (status === "Đang giao") return "Đang bàn giao";
      if (status === "Đã bán") return "Đã có chủ mới";
      if (status === "Ngừng bán") return "Tạm ngừng mở bán";
      return "Chưa mở bán";
    },

    getStatusBoxClass(status) {
      if (status === "Sẵn sàng bán") return "status-ready";
      if (["Chờ thanh toán", "Đã đặt cọc", "Đang giao"].includes(status)) {
        return "status-hold";
      }
      if (status === "Đã bán") return "status-sold";
      return "status-stop";
    },

    isValidPhone(phone) {
      const normalized = String(phone || "").replace(/\D/g, "");
      return normalized.length >= 10 && normalized.length <= 11;
    },

    async submitDeposit() {
      if (!this.dog) return;

      if (!this.currentUser || this.currentUser.role !== "customer") {
        alert("⚠️ Chỉ khách hàng mới có thể thực hiện đặt cọc!");
        this.$router.push("/login");
        return;
      }

      if (!this.canSubmit) {
        alert("❌ Bé chó này hiện không còn sẵn sàng để đặt cọc.");
        return;
      }

      if (!this.form.customerName || !this.form.customerPhone || !this.form.customerAddress) {
        alert("⚠️ Vui lòng nhập đầy đủ thông tin người nhận.");
        return;
      }

      if (!this.isValidPhone(this.form.customerPhone)) {
        alert("⚠️ Số điện thoại không hợp lệ. Vui lòng nhập từ 10 đến 11 chữ số.");
        return;
      }

      if (this.form.paymentMethod === "Chuyển khoản" && !this.form.paymentProof?.trim()) {
        alert("⚠️ Vui lòng nhập thông tin minh chứng chuyển khoản trước khi gửi yêu cầu đặt cọc.");
        return;
      }

      const confirmMessage =
        `Vui lòng kiểm tra lại thông tin đặt cọc:\n\n` +
        `- Bé chó: ${this.dog.name}\n` +
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
        paymentProof:
          this.form.paymentMethod === "Chuyển khoản"
            ? this.form.paymentProof
            : "",
        dogId: this.dog._id || this.dog.id,
      };

      try {
        await OrderService.createDeposit(orderData);
        localStorage.removeItem("checkoutDog");
        alert("🎉 Tạo yêu cầu đặt cọc thành công! Đơn của bạn đang chờ admin xác nhận khoản cọc.");
        this.$router.push("/tra-cuu-don");
      } catch (error) {
        alert("❌ Có lỗi xảy ra: " + (error.response?.data?.message || error.message));
        await this.loadDogData();
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
  background:
    radial-gradient(circle at top left, rgba(177, 145, 211, 0.12), transparent 28%),
    linear-gradient(180deg, #faf7fc 0%, #f5effb 100%);
}

@media (min-width: 1200px) {
  .custom-container {
    max-width: 1280px !important;
  }
}

.text-custom {
  color: #6a1b9a;
}

.page-kicker {
  display: inline-block;
  padding: 7px 14px;
  border-radius: 999px;
  background: #f1e7fb;
  color: #7a4db3;
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.3px;
  margin-bottom: 12px;
}

.page-title {
  color: #2f1b44;
  font-weight: 900;
  font-size: 2.15rem;
  line-height: 1.3;
}

.page-subtitle {
  color: #6b7280;
  max-width: 680px;
  margin: 0 auto;
  line-height: 1.75;
  font-size: 0.98rem;
}

.content-card,
.summary-card,
.empty-state {
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 14px 30px rgba(106, 27, 154, 0.08);
  border: 1px solid #eee2f7;
}

.checkout-head {
  border-bottom: 1px solid #eee2f7;
  padding-bottom: 16px;
}

.block-title {
  font-weight: 900;
  color: #31114d;
  margin: 0;
}

.block-subtitle {
  color: #7b7287;
  line-height: 1.65;
  font-size: 0.95rem;
}

.field-label {
  font-weight: 800;
  color: #6b7280;
  font-size: 0.86rem;
}

.btn-main {
  background: linear-gradient(135deg, #6a1b9a, #4a148c);
  color: white;
  transition: all 0.2s;
  border: none;
  border-radius: 14px;
}

.btn-main:hover {
  background: linear-gradient(135deg, #5e178c, #42127d);
  color: white;
  transform: translateY(-2px);
}

.btn-main:disabled {
  background: #9c27b0;
  opacity: 0.75;
  transform: none;
}

.form-control,
.custom-select {
  border-color: #e1d5ed;
  min-height: 48px;
  border-radius: 14px;
}

.form-control:focus,
.custom-select:focus {
  box-shadow: none;
  border-color: #6a1b9a;
}

.input-group-text {
  border-right: none;
  border-color: #e1d5ed;
  border-radius: 14px 0 0 14px;
}

.custom-input-group .form-control {
  border-left: none;
  border-radius: 0 14px 14px 0;
}

.custom-input-group:focus-within .input-group-text {
  border-color: #6a1b9a;
}

.custom-input-group:focus-within .fas {
  color: #6a1b9a !important;
}

.proof-textarea,
.note-textarea {
  min-height: auto;
  padding: 12px 14px;
}

.payment-method-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.payment-method-card {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px;
  border: 1px solid #e7dbf3;
  background: #fff;
  border-radius: 18px;
  cursor: pointer;
  transition: all 0.25s ease;
  min-height: 108px;
}

.payment-method-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 22px rgba(106, 27, 154, 0.08);
}

.payment-method-card.active {
  border-color: #6a1b9a;
  background: #faf5ff;
  box-shadow: 0 12px 24px rgba(106, 27, 154, 0.08);
}

.payment-method-card input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.method-icon {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  background: #f3ebfb;
  color: #6a1b9a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.08rem;
  flex-shrink: 0;
}

.method-title {
  color: #31114d;
  font-weight: 800;
  margin-bottom: 5px;
}

.method-desc {
  color: #7b7287;
  font-size: 0.88rem;
  line-height: 1.55;
}

.policy-box {
  background: #faf6fd;
  border: 1px solid #eadcf5;
  border-radius: 18px;
  padding: 18px;
}

.policy-title {
  color: #6a1b9a;
  font-weight: 800;
}

.policy-list {
  padding-left: 18px;
  color: #6b7280;
  line-height: 1.65;
  font-size: 0.93rem;
}

.policy-list li + li {
  margin-top: 7px;
}

.warning-box {
  background: #fff7e8;
  border: 1px solid #f3d18b;
  color: #a16207;
  border-radius: 16px;
  padding: 14px 16px;
  font-weight: 700;
}

.summary-top {
  padding: 20px;
  border-bottom: 1px solid #eee2f7;
  display: flex;
  gap: 16px;
  align-items: center;
}

.dog-thumb {
  width: 98px;
  height: 98px;
  border-radius: 18px;
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
  font-size: 0.76rem;
  font-weight: 800;
  margin-bottom: 8px;
}

.summary-name {
  color: #2f1b44;
  font-weight: 900;
  font-size: 1.2rem;
}

.summary-sub {
  color: #7b7287;
  line-height: 1.5;
  font-size: 0.92rem;
}

.summary-price {
  color: #d63384;
  font-size: 1.22rem;
}

.summary-body {
  padding: 20px;
}

.status-box,
.health-box {
  background: #faf6fd;
  border: 1px solid #eadcf5;
  border-radius: 18px;
  padding: 15px;
}

.status-title,
.health-title,
.payment-title,
.checkout-note-title {
  font-weight: 800;
  color: #6a1b9a;
  margin-bottom: 8px;
}

.status-value {
  font-weight: 900;
}

.status-ready {
  background: #e9f8ef;
  border-color: #bfe4c9;
  color: #1f8f4d;
}

.status-hold {
  background: #fff7e8;
  border-color: #f3d18b;
  color: #a16207;
}

.status-sold {
  background: #f3f4f6;
  border-color: #d1d5db;
  color: #1f2937;
}

.status-stop {
  background: #fef3c7;
  border-color: #fcd34d;
  color: #92400e;
}

.health-row,
.price-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
  color: #5f6673;
  font-size: 0.92rem;
}

.health-row + .health-row,
.price-row + .price-row {
  border-top: 1px dashed #eadcf5;
}

.price-breakdown {
  background: #ffffff;
  border: 1px solid #eadcf5;
  border-radius: 18px;
  padding: 14px 16px;
}

.total-row strong {
  color: #dc3545;
  font-size: 1.06rem;
}

.payment-box {
  background-color: #f4ebf8;
  border: 1px dashed #6a1b9a;
  border-radius: 18px;
  padding: 16px;
}

.payment-item {
  color: #2f1b44;
  font-size: 0.92rem;
  margin-bottom: 6px;
}

.payment-note {
  color: #c2410c;
  font-size: 0.88rem;
  font-style: italic;
  text-align: center;
  margin-top: 10px;
  line-height: 1.6;
}

.cash-box {
  background-color: #fdf6e3;
  border-color: #d4a017;
}

.checkout-note-box {
  background: #f7fbff;
  border: 1px solid #d7e8fb;
  border-radius: 18px;
  padding: 16px;
}

.checkout-note-text {
  color: #475569;
  line-height: 1.65;
  font-size: 0.9rem;
}

@media (max-width: 991.98px) {
  .summary-card {
    position: static !important;
  }
}

@media (max-width: 767.98px) {
  .page-title {
    font-size: 1.7rem;
  }

  .payment-method-grid {
    grid-template-columns: 1fr;
  }

  .summary-top {
    flex-direction: column;
    align-items: flex-start;
  }

  .dog-thumb {
    width: 100%;
    height: 220px;
  }

  .summary-name {
    font-size: 1.1rem;
  }
}
</style>