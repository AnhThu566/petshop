<template>
  <div class="deposit-page bg-light py-5" style="min-height: 100vh;">
    <div class="container custom-container">
      <div class="text-center mb-5">
        <h2 class="font-weight-bold" style="color: #6a1b9a; text-transform: uppercase;">
          <i class="fas fa-hand-holding-usd mr-2 text-warning"></i>
          Đặt cọc đón bé về nhà
        </h2>
        <p class="text-muted">
          Vui lòng điền thông tin và xác nhận thanh toán cọc để giữ bé cún.
          Sau khi admin xác nhận cọc, hệ thống sẽ tiến hành xử lý giao dịch cho bạn.
        </p>
      </div>

      <div class="row" v-if="dog">
        <div class="col-lg-7 mb-4">
          <div class="card border-0 shadow-sm rounded-lg p-4 p-md-5">
            <h5 class="font-weight-bold border-bottom pb-3 mb-4" style="color: #4a148c;">
              Thông tin người nhận
            </h5>

            <form @submit.prevent="submitDeposit">
              <div class="form-group mb-4">
                <label class="font-weight-bold text-muted small">
                  Họ và tên người nhận <span class="text-danger">*</span>
                </label>
                <div class="input-group">
                  <div class="input-group-prepend">
                    <span class="input-group-text bg-white">
                      <i class="fas fa-user text-muted"></i>
                    </span>
                  </div>
                  <input
                    type="text"
                    class="form-control"
                    v-model.trim="form.customerName"
                    placeholder="Nhập họ tên của bạn..."
                    required
                  />
                </div>
              </div>

              <div class="form-group mb-4">
                <label class="font-weight-bold text-muted small">
                  Số điện thoại liên hệ <span class="text-danger">*</span>
                </label>
                <div class="input-group">
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
                <label class="font-weight-bold text-muted small">
                  Địa chỉ giao thú cưng <span class="text-danger">*</span>
                </label>
                <div class="input-group">
                  <div class="input-group-prepend">
                    <span class="input-group-text bg-white">
                      <i class="fas fa-map-marker-alt text-muted"></i>
                    </span>
                  </div>
                  <input
                    type="text"
                    class="form-control"
                    v-model.trim="form.customerAddress"
                    placeholder="Nhập số nhà, tên đường, phường/xã, quận/huyện..."
                    required
                  />
                </div>
              </div>

              <div class="form-group mb-4">
                <label class="font-weight-bold text-muted small">
                  Phương thức thanh toán cọc <span class="text-danger">*</span>
                </label>
                <select class="form-control" v-model="form.paymentMethod" required>
                  <option value="Chuyển khoản">Chuyển khoản</option>
                  <option value="Tiền mặt">Tiền mặt</option>
                </select>
              </div>

              <div class="form-group mb-4" v-if="form.paymentMethod === 'Chuyển khoản'">
                <label class="font-weight-bold text-muted small">
                  Mã giao dịch / link ảnh bill / tên file bill <span class="text-danger">*</span>
                </label>
                <input
                  type="text"
                  class="form-control"
                  v-model.trim="form.paymentProof"
                  placeholder="VD: MB123456789 hoặc https://... hoặc bill-coc-be-lulu.jpg"
                />
                <small class="text-muted">
                  Đây là minh chứng để admin đối soát trước khi xác nhận đã nhận cọc.
                </small>
              </div>

              <div class="form-group mb-4">
                <label class="font-weight-bold text-muted small">Ghi chú thêm (Tùy chọn)</label>
                <textarea
                  class="form-control"
                  v-model.trim="form.note"
                  rows="3"
                  placeholder="Lời nhắn cho hệ thống hoặc trang trại..."
                ></textarea>
              </div>

              <div class="alert alert-light border mb-3">
                <div class="d-flex justify-content-between mb-2">
                  <span>Tổng giá chó:</span>
                  <strong>{{ formatCurrency(dog.price) }}</strong>
                </div>
                <div class="d-flex justify-content-between mb-2">
                  <span>Tiền cọc (30%):</span>
                  <strong class="text-danger">{{ formatCurrency(depositAmount) }}</strong>
                </div>
                <div class="d-flex justify-content-between">
                  <span>Tiền còn lại khi nhận chó:</span>
                  <strong class="text-primary">{{ formatCurrency(remainingAmount) }}</strong>
                </div>
              </div>

              <div class="alert alert-warning small mb-4">
                <strong>Chính sách đặt cọc & cam kết giao dịch:</strong><br />
                - Yêu cầu đặt cọc chỉ được xác nhận khi admin kiểm tra thông tin thanh toán hợp lệ.<br />
                - Nếu chọn <strong>chuyển khoản</strong>, khách hàng bắt buộc cung cấp minh chứng thanh toán.<br />
                - Khách chỉ có thể tự hủy đơn khi đơn đang ở trạng thái <strong>Chờ xác nhận cọc</strong>.<br />
                - Sau khi admin xác nhận cọc, mọi yêu cầu hủy sẽ được xử lý theo chính sách của hệ thống.<br />
                - Phần tiền còn lại sẽ được thanh toán khi bàn giao chó thành công.
              </div>

              <button
                type="submit"
                class="btn btn-main btn-lg btn-block font-weight-bold py-3 mt-4 shadow"
                :disabled="isSubmitting"
              >
                <span v-if="isSubmitting">
                  <i class="fas fa-spinner fa-spin mr-2"></i> Đang xử lý...
                </span>
                <span v-else>
                  <i class="fas fa-check-circle mr-2"></i> XÁC NHẬN & TẠO ĐƠN ĐẶT CỌC
                </span>
              </button>
            </form>
          </div>
        </div>

        <div class="col-lg-5">
          <div class="card border-0 shadow-sm rounded-lg overflow-hidden sticky-top" style="top: 20px;">
            <div class="bg-light p-4 border-bottom d-flex align-items-center">
              <img
                :src="dog.image ? 'http://localhost:3000' + dog.image : 'https://via.placeholder.com/100'"
                class="rounded shadow-sm object-fit-cover mr-3 border"
                style="width: 90px; height: 90px; border-color: #e1d5ed !important;"
              />
              <div>
                <h5 class="font-weight-bold mb-1 text-dark">{{ dog.name }}</h5>
                <p class="text-muted small mb-1">Giống: {{ dog.breedId?.name || 'Đang cập nhật' }}</p>
                <strong class="text-danger">{{ formatCurrency(dog.price) }}</strong>
              </div>
            </div>

            <div class="p-4 bg-white">
              <div class="d-flex justify-content-between mb-3 text-muted">
                <span>Tổng giá trị:</span>
                <span>{{ formatCurrency(dog.price) }}</span>
              </div>

              <div class="d-flex justify-content-between mb-2 text-muted">
                <span>Tỷ lệ đặt cọc:</span>
                <span>30%</span>
              </div>

              <div class="d-flex justify-content-between mb-4 text-muted border-bottom pb-3">
                <span>Tiền còn lại:</span>
                <span>{{ formatCurrency(remainingAmount) }}</span>
              </div>

              <div class="d-flex justify-content-between align-items-center mb-4">
                <span class="font-weight-bold h6 mb-0 text-dark">SỐ TIỀN CẦN CỌC:</span>
                <strong class="text-danger h3 mb-0">{{ formatCurrency(depositAmount) }}</strong>
              </div>

              <div
                class="payment-info p-3 rounded"
                style="background-color: #f4ebf8; border: 1px dashed #6a1b9a;"
                v-if="form.paymentMethod === 'Chuyển khoản'"
              >
                <p class="font-weight-bold mb-2 text-center" style="color: #6a1b9a;">
                  <i class="fas fa-university mr-1"></i> Thông tin chuyển khoản
                </p>
                <div class="small text-dark mb-1"><strong>Ngân hàng:</strong> Vietcombank (VCB)</div>
                <div class="small text-dark mb-1"><strong>Chủ tài khoản:</strong> NGUYEN VAN A</div>
                <div class="small text-dark mb-1">
                  <strong>Số tài khoản:</strong> 0123456789
                </div>
                <div class="small text-danger mt-2 font-italic text-center">
                  *Nội dung CK:
                  <strong>Cọc bé {{ dog.maCho || dog.name }} - {{ form.customerPhone || "SĐT" }}</strong>
                </div>
              </div>

              <div
                class="payment-info p-3 rounded"
                style="background-color: #fdf6e3; border: 1px dashed #d4a017;"
                v-else
              >
                <p class="font-weight-bold mb-2 text-center text-warning">
                  <i class="fas fa-money-bill-wave mr-1"></i> Thanh toán tiền mặt
                </p>
                <div class="small text-dark text-center">
                  Bạn đã chọn thanh toán tiền mặt. Admin sẽ liên hệ xác nhận khoản cọc này thủ công.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-5 bg-white shadow-sm rounded">
        <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
        <h4 class="text-dark">Không tìm thấy thông tin thú cưng!</h4>
        <p class="text-muted mb-4">
          Vui lòng quay lại danh sách để chọn một bé cún trước khi đặt cọc nhé.
        </p>
        <router-link to="/" class="btn btn-main px-4 py-2 font-weight-bold rounded-pill">
          Quay lại trang chủ
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import OrderService from "@/services/order.service";
import DogService from "@/services/dog.service";

export default {
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
      if (!this.dog || !this.dog.price) return 0;
      return Math.round(Number(this.dog.price) * 0.3);
    },

    remainingAmount() {
      if (!this.dog || !this.dog.price) return 0;
      return Number(this.dog.price) - this.depositAmount;
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

    async submitDeposit() {
      if (!this.dog) return;

      if (!this.currentUser) {
        alert("⚠️ Vui lòng đăng nhập để thực hiện đặt cọc!");
        this.$router.push("/login");
        return;
      }

      if (this.dog.status !== "Đã duyệt") {
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
        `- Tổng giá: ${this.formatCurrency(this.dog.price)}\n` +
        `- Tiền cọc: ${this.formatCurrency(this.depositAmount)}\n` +
        `- Tiền còn lại: ${this.formatCurrency(this.remainingAmount)}\n` +
        `- Phương thức cọc: ${this.form.paymentMethod}\n\n` +
        `Bạn xác nhận gửi yêu cầu đặt cọc?`;

      if (!confirm(confirmMessage)) return;

      this.isSubmitting = true;

      const orderData = {
        userId: this.currentUser._id || this.currentUser.id,
        customerName: this.form.customerName,
        customerPhone: this.form.customerPhone,
        customerAddress: this.form.customerAddress,
        note: this.form.note,
        paymentMethod: this.form.paymentMethod,
        paymentProof: this.form.paymentProof,
        dogId: this.dog._id || this.dog.id,
        farmId: this.dog.farmId?._id || this.dog.farmId,
        totalPrice: this.dog.price,
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
@media (min-width: 1200px) {
  .custom-container {
    max-width: 1300px !important;
  }
}
.object-fit-cover {
  object-fit: cover;
}
.cursor-pointer {
  cursor: pointer;
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
.form-control {
  border-left: none;
  border-color: #e1d5ed;
}
.form-control:focus {
  box-shadow: none;
  border-color: #6a1b9a;
}
.input-group-text {
  border-right: none;
  border-color: #e1d5ed;
}
.input-group:focus-within .input-group-text {
  border-color: #6a1b9a;
}
.input-group:focus-within .fas {
  color: #6a1b9a !important;
}
</style>