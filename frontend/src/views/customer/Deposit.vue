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
          Kiểm tra thông tin bé chó và thanh toán khoản cọc qua ZaloPay để hệ thống tự xác nhận.
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

            <div v-if="statusMessage" class="info-box mb-4" :class="statusMessageType">
              <i
                class="mr-2"
                :class="{
                  'fas fa-info-circle': statusMessageType === 'info',
                  'fas fa-check-circle': statusMessageType === 'success',
                  'fas fa-exclamation-triangle': statusMessageType === 'warning',
                  'fas fa-times-circle': statusMessageType === 'error'
                }"
              ></i>
              {{ statusMessage }}
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
                      :disabled="isBusy"
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
                      :disabled="isBusy"
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
                    :disabled="isBusy"
                    required
                  />
                </div>
              </div>

              <div class="form-group mb-4">
                <label class="field-label">
                  Phương thức thanh toán cọc
                </label>

                <div class="payment-method-grid single-method">
                  <div class="payment-method-card active fixed-method">
                    <div class="method-icon zalopay-icon">
                      <i class="fas fa-qrcode"></i>
                    </div>
                    <div class="method-content">
                      <div class="method-title">ZaloPay</div>
                      <div class="method-desc">
                        Thanh toán cọc online, hệ thống tự xác nhận khi giao dịch thành công.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="form-group mb-4">
                <div class="zalopay-guide-box">
                  <div class="payment-title mb-2">
                    <i class="fas fa-bolt mr-2"></i>Thanh toán cọc qua ZaloPay
                  </div>
                  <div class="small text-muted line-height-17">
                    Sau khi bấm xác nhận, hệ thống sẽ tạo phiên thanh toán và chuyển bạn sang ZaloPay để hoàn tất giao dịch.
                    Khi thanh toán thành công, đơn cọc sẽ được cập nhật tự động.
                  </div>
                </div>
              </div>

              <div v-if="hasPendingOrder" class="warning-box mb-4">
                <i class="fas fa-exclamation-circle mr-2"></i>
                Bạn đang có một đơn đặt cọc ZaloPay chưa hoàn tất cho bé này. Hãy mở lại link thanh toán hoặc bấm kiểm tra trạng thái trước khi tạo đơn mới.
              </div>

              <div class="form-group mb-4">
                <label class="field-label">Ghi chú thêm</label>
                <textarea
                  class="form-control note-textarea"
                  v-model.trim="form.note"
                  rows="3"
                  placeholder="Lời nhắn thêm cho quản trị viên..."
                  :disabled="isBusy"
                ></textarea>
              </div>

              <div class="policy-box mb-4">
                <div class="policy-title mb-2">
                  <i class="fas fa-shield-alt mr-2"></i>Lưu ý đặt cọc
                </div>
                <ul class="policy-list mb-0">
                  <li>Yêu cầu đặt cọc chỉ được áp dụng cho bé đang mở bán và còn sẵn sàng giao dịch.</li>
                  <li>Hệ thống chỉ hỗ trợ đặt cọc chó qua ZaloPay để tự động xác nhận thanh toán.</li>
                  <li>Nếu đã có một phiên thanh toán ZaloPay đang chờ, hệ thống sẽ không tạo thêm đơn mới.</li>
                  <li>Số tiền còn lại sẽ thanh toán khi hoàn tất bàn giao bé.</li>
                </ul>
              </div>

              <div v-if="!canSubmit" class="warning-box mb-4">
                <i class="fas fa-exclamation-circle mr-2"></i>
                Bé chó này hiện không còn ở trạng thái sẵn sàng đặt cọc.
              </div>

              <div class="action-grid">
                <button
                  v-if="!hasPendingOrder"
                  type="submit"
                  class="btn btn-main btn-lg btn-block font-weight-bold py-3 shadow-sm"
                  :disabled="isBusy || !canSubmit"
                >
                  <span v-if="isSubmitting">
                    <i class="fas fa-spinner fa-spin mr-2"></i> Đang xử lý...
                  </span>
                  <span v-else>
                    <i class="fas fa-wallet mr-2"></i> THANH TOÁN CỌC BẰNG ZALOPAY
                  </span>
                </button>

                <button
                  v-if="hasPendingOrder && lastPaymentUrl"
                  type="button"
                  class="btn btn-main btn-lg btn-block font-weight-bold py-3 shadow-sm"
                  :disabled="isBusy"
                  @click="reopenZaloPayPayment"
                >
                  <i class="fas fa-external-link-alt mr-2"></i> MỞ LẠI THANH TOÁN ZALOPAY
                </button>

                <button
                  v-if="currentOrder && isPendingZaloPayOrder"
                  type="button"
                  class="btn btn-outline-main btn-lg btn-block font-weight-bold py-3 shadow-sm"
                  :disabled="isBusy"
                  @click="checkZaloPayPayment"
                >
                  <span v-if="isCheckingPayment">
                    <i class="fas fa-spinner fa-spin mr-2"></i> Đang kiểm tra...
                  </span>
                  <span v-else>
                    <i class="fas fa-sync-alt mr-2"></i> KIỂM TRA THANH TOÁN ZALOPAY
                  </span>
                </button>
              </div>
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
                <p class="summary-sub mb-1">
                  Nguồn gốc: Trang trại đối tác đã xác minh
                </p>
                <strong class="summary-price">{{ formatCurrency(dogPrice) }}</strong>
              </div>
            </div>

            <div class="summary-body">
              <div class="status-box mb-3" :class="getStatusBoxClass(dog.saleStatus)">
                <div class="status-title">Trạng thái hiện tại</div>
                <div class="status-value">{{ getSaleStatusText(dog.saleStatus) }}</div>
              </div>

              <div
                v-if="currentOrder"
                class="online-payment-status-box mb-3"
                :class="getOrderPaymentBoxClass(currentOrder)"
              >
                <div class="status-title">Trạng thái đơn cọc</div>
                <div class="status-value">
                  {{ currentOrder.status }} - {{ currentOrder.paymentStatus }}
                </div>
                <div v-if="currentOrder.paymentMethod === 'ZaloPay'" class="payment-extra mt-2">
                  Phương thức: ZaloPay
                </div>
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
                  <strong>{{ Array.isArray(dog.vaccines) && dog.vaccines.length > 0 ? "Đã có hồ sơ" : "Chưa cập nhật" }}</strong>
                </div>
              </div>

              <div class="price-breakdown mb-3">
                <div class="price-row">
                  <span>Tổng giá trị</span>
                  <strong>{{ formatCurrency(dogPrice) }}</strong>
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

              <div class="payment-box zalopay-box">
                <div class="payment-title text-center zalopay-title">
                  <i class="fas fa-qrcode mr-1"></i>Thanh toán ZaloPay
                </div>
                <div class="small text-dark text-center">
                  Sau khi tạo đơn cọc, bạn sẽ được chuyển sang ZaloPay để thanh toán online.
                </div>

                <div v-if="lastPaymentUrl" class="mt-3 text-center">
                  <a
                    :href="lastPaymentUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="btn btn-outline-main btn-sm"
                  >
                    <i class="fas fa-external-link-alt mr-1"></i> Mở lại trang thanh toán
                  </a>
                </div>

                <div v-if="lastQrCode" class="mt-3 text-center qr-text">
                  Phiên thanh toán đã được tạo. Bạn có thể mở lại link thanh toán hoặc bấm kiểm tra trạng thái sau khi thanh toán xong.
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
      currentOrder: null,
      loading: true,
      form: {
        customerName: "",
        customerPhone: "",
        customerAddress: "",
        paymentMethod: "ZaloPay",
        note: "",
      },
      isSubmitting: false,
      isCheckingPayment: false,
      statusMessage: "",
      statusMessageType: "info",
      lastPaymentUrl: "",
      lastQrCode: "",
    };
  },

  computed: {
    dogPrice() {
      if (!this.dog) return 0;
      return Number(this.dog.finalPrice || this.dog.price || 0);
    },

    depositAmount() {
      if (!this.dog) return 0;

      if (this.dog.depositAmount && Number(this.dog.depositAmount) > 0) {
        return Number(this.dog.depositAmount);
      }

      if (!this.dogPrice) return 0;

      return Math.round(this.dogPrice * 0.3);
    },

    remainingAmount() {
      if (!this.dogPrice) return 0;
      return this.dogPrice - this.depositAmount;
    },

    depositRateText() {
      if (!this.dogPrice) return "---";
      const rate = Math.round((this.depositAmount / this.dogPrice) * 100);
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

    isBusy() {
      return this.isSubmitting || this.isCheckingPayment;
    },

    isPendingZaloPayOrder() {
      return OrderService.isPendingZaloPayPayment(this.currentOrder);
    },

    hasPendingOrder() {
      return !!this.currentOrder && this.isPendingZaloPayOrder;
    },
  },

  async created() {
    this.initCurrentUser();
    await this.loadDogData();
    await this.tryRestoreLatestPendingOrder();
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
        const queryDogId = this.$route.query.dogId;
        const savedDog = localStorage.getItem("checkoutDog");

        let dogId = queryDogId || "";

        if (!dogId && savedDog) {
          const localDog = JSON.parse(savedDog);
          dogId = localDog?._id || localDog?.id || "";
        }

        if (!dogId) {
          this.dog = null;
          return;
        }

        this.dog = await DogService.getPublicById(dogId);

        const localDog = savedDog ? JSON.parse(savedDog) : null;
        const localDogId = localDog?._id || localDog?.id || "";

        if (!localDogId || String(localDogId) !== String(dogId)) {
          localStorage.setItem("checkoutDog", JSON.stringify(this.dog));
        }
      } catch (error) {
        console.error("Lỗi tải thông tin bé chó để đặt cọc:", error);
        this.dog = null;
      } finally {
        this.loading = false;
      }
    },

    async tryRestoreLatestPendingOrder() {
      try {
        if (!this.currentUser || this.currentUser.role !== "customer") return;

        const orders = await OrderService.getMyOrders();
        const currentDogId =
          this.$route.query.dogId || this.dog?._id || this.dog?.id;

        if (!currentDogId) return;

        const matched = (orders || []).find((item) => {
          const orderDogId = item?.dogId?._id || item?.dogId?.id || item?.dogId;

          return (
            String(orderDogId) === String(currentDogId) &&
            item.paymentMethod === "ZaloPay" &&
            item.status === "Chờ xác nhận cọc" &&
            item.paymentStatus === "Chờ thanh toán"
          );
        });

        if (matched) {
          this.currentOrder = matched;
          this.form.paymentMethod = "ZaloPay";
          this.lastPaymentUrl =
            matched?.paymentUrl ||
            matched?.zalopayPaymentUrl ||
            matched?.orderUrl ||
            "";
          this.lastQrCode =
            matched?.qrCode ||
            matched?.zalopayQrCode ||
            "";

          this.statusMessage =
            "Bạn đang có một đơn cọc ZaloPay chưa hoàn tất. Hãy mở lại link thanh toán hoặc bấm kiểm tra trạng thái.";
          this.statusMessageType = "warning";
        }
      } catch (error) {
        console.error("Không thể khôi phục đơn ZaloPay đang chờ:", error);
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

    getOrderPaymentBoxClass(order) {
      if (!order) return "status-stop";

      if (OrderService.isPaidDeposit(order)) return "status-ready";
      if (OrderService.isPendingZaloPayPayment(order)) return "status-hold";
      if (order.status === "Đã hủy" || order.paymentStatus === "Thanh toán thất bại") {
        return "status-stop";
      }
      return "status-hold";
    },

    isValidPhone(phone) {
      const normalized = String(phone || "").replace(/\D/g, "");
      return normalized.length >= 10 && normalized.length <= 11;
    },

    buildOrderData() {
      return {
        customerName: this.form.customerName,
        customerPhone: this.form.customerPhone,
        customerAddress: this.form.customerAddress,
        note: this.form.note,
        paymentMethod: "ZaloPay",
        dogId: this.dog._id || this.dog.id,
      };
    },

    validateBeforeSubmit() {
      if (!this.dog) {
        this.showMessage("Không tìm thấy thông tin bé chó để đặt cọc.", "error");
        return false;
      }

      if (!this.currentUser || this.currentUser.role !== "customer") {
        alert("⚠️ Chỉ khách hàng mới có thể thực hiện đặt cọc!");
        this.$router.push("/login");
        return false;
      }

      if (!this.canSubmit) {
        this.showMessage("Bé chó này hiện không còn sẵn sàng để đặt cọc.", "warning");
        return false;
      }

      if (!this.form.customerName || !this.form.customerPhone || !this.form.customerAddress) {
        this.showMessage("Vui lòng nhập đầy đủ thông tin người nhận.", "warning");
        return false;
      }

      if (!this.isValidPhone(this.form.customerPhone)) {
        this.showMessage("Số điện thoại không hợp lệ. Vui lòng nhập từ 10 đến 11 chữ số.", "warning");
        return false;
      }

      if (this.hasPendingOrder) {
        this.showMessage(
          "Bạn đang có một đơn ZaloPay chưa hoàn tất cho bé này. Hãy mở lại link cũ hoặc kiểm tra trạng thái trước.",
          "warning"
        );
        return false;
      }

      return true;
    },

    showMessage(message, type = "info") {
      this.statusMessage = message;
      this.statusMessageType = type;
    },

    reopenZaloPayPayment() {
      if (!this.lastPaymentUrl) {
        this.showMessage("Không tìm thấy link thanh toán để mở lại.", "warning");
        return;
      }

      window.open(this.lastPaymentUrl, "_blank", "noopener,noreferrer");
    },

    async submitDeposit() {
      if (!this.validateBeforeSubmit()) return;

      const confirmMessage =
        `Vui lòng kiểm tra lại thông tin đặt cọc:\n\n` +
        `- Bé chó: ${this.dog.name}\n` +
        `- Tổng giá: ${this.formatCurrency(this.dogPrice)}\n` +
        `- Tiền cọc: ${this.formatCurrency(this.depositAmount)}\n` +
        `- Tiền còn lại: ${this.formatCurrency(this.remainingAmount)}\n` +
        `- Phương thức cọc: ZaloPay\n\n` +
        `Bạn xác nhận tiếp tục?`;

      if (!confirm(confirmMessage)) return;

      this.isSubmitting = true;
      this.showMessage("", "info");

      const orderData = this.buildOrderData();

      try {
        const response = await OrderService.createDepositZaloPay(orderData);

        this.currentOrder = response?.order || null;
        this.lastPaymentUrl = OrderService.getPaymentUrl(response?.payment);
        this.lastQrCode = OrderService.getQrCode(response?.payment);

        sessionStorage.setItem(
          "zalopay_pending_deposit_order",
          JSON.stringify({
            orderId: this.currentOrder?._id || this.currentOrder?.id || "",
            dogId: this.dog?._id || this.dog?.id || "",
            dogName: this.dog?.name || "",
          })
        );

        localStorage.setItem("checkoutDog", JSON.stringify(this.dog));

        this.showMessage(
          "Đã tạo phiên thanh toán ZaloPay. Hệ thống sẽ chuyển bạn sang trang thanh toán.",
          "success"
        );

        if (this.lastPaymentUrl) {
          setTimeout(() => {
            try {
              OrderService.openZaloPay(response?.payment);
            } catch (openError) {
              console.error("Lỗi mở trang thanh toán ZaloPay:", openError);
            }
          }, 500);
        } else {
          this.showMessage(
            "Đã tạo đơn ZaloPay nhưng chưa nhận được link thanh toán. Vui lòng thử lại.",
            "error"
          );
        }

        await this.loadDogData();
      } catch (error) {
        const message =
          error.response?.data?.message || error.message || "Có lỗi xảy ra.";

        this.showMessage(message, "error");
        alert("❌ Có lỗi xảy ra: " + message);
        await this.loadDogData();
        await this.tryRestoreLatestPendingOrder();
      } finally {
        this.isSubmitting = false;
      }
    },

    async checkZaloPayPayment() {
      if (!this.currentOrder?._id && !this.currentOrder?.id) {
        this.showMessage("Không tìm thấy đơn ZaloPay để kiểm tra.", "warning");
        return;
      }

      this.isCheckingPayment = true;

      try {
        const orderId = this.currentOrder._id || this.currentOrder.id;
        const response = await OrderService.checkZaloPayStatus(orderId);
        this.currentOrder = response?.order || this.currentOrder;

        if (OrderService.isPaidDeposit(this.currentOrder)) {
          this.showMessage(
            "Thanh toán cọc ZaloPay đã thành công. Bé đã được giữ chỗ cho bạn.",
            "success"
          );
          sessionStorage.removeItem("zalopay_pending_deposit_order");
          await this.loadDogData();
          alert("🎉 Thanh toán cọc thành công! Bé đã được giữ chỗ cho bạn.");
          this.$router.push("/tra-cuu-don");
          return;
        }

        if (
          this.currentOrder?.status === "Đã hủy" ||
          this.currentOrder?.paymentStatus === "Thanh toán thất bại"
        ) {
          this.showMessage(
            "Phiên thanh toán ZaloPay không thành công hoặc đã hết hạn. Bạn có thể tạo lại đơn mới nếu bé còn sẵn sàng bán.",
            "warning"
          );
          this.lastPaymentUrl = "";
          this.lastQrCode = "";
          this.currentOrder = null;
          sessionStorage.removeItem("zalopay_pending_deposit_order");
          await this.loadDogData();
          return;
        }

        this.showMessage(
          "Hệ thống chưa ghi nhận thanh toán thành công. Nếu bạn vừa thanh toán, hãy thử kiểm tra lại sau ít phút.",
          "info"
        );
      } catch (error) {
        const message =
          error.response?.data?.message ||
          error.message ||
          "Không thể kiểm tra trạng thái thanh toán.";
        this.showMessage(message, "error");
        alert("❌ " + message);
      } finally {
        this.isCheckingPayment = false;
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

.btn-outline-main {
  background: #fff;
  color: #6a1b9a;
  border: 1px solid #6a1b9a;
  border-radius: 14px;
  transition: all 0.2s;
}

.btn-outline-main:hover {
  background: #f8f1fd;
  color: #5e178c;
  transform: translateY(-2px);
}

.btn-outline-main:disabled {
  opacity: 0.7;
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

.note-textarea {
  min-height: auto;
  padding: 12px 14px;
}

.payment-method-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
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

.payment-method-card.active {
  border-color: #6a1b9a;
  background: #faf5ff;
  box-shadow: 0 12px 24px rgba(106, 27, 154, 0.08);
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

.zalopay-icon {
  background: #eef6ff;
  color: #0b63ce;
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

.zalopay-guide-box {
  background: #f4f8ff;
  border: 1px solid #dbeafe;
  border-radius: 18px;
  padding: 16px;
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

.warning-box,
.info-box {
  border-radius: 16px;
  padding: 14px 16px;
  font-weight: 700;
}

.warning-box {
  background: #fff7e8;
  border: 1px solid #f3d18b;
  color: #a16207;
}

.info-box.info {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1d4ed8;
}

.info-box.success {
  background: #ecfdf3;
  border: 1px solid #bbf7d0;
  color: #15803d;
}

.info-box.warning {
  background: #fff7e8;
  border: 1px solid #f3d18b;
  color: #a16207;
}

.info-box.error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
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
.health-box,
.online-payment-status-box {
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

.payment-extra {
  color: #475569;
  font-size: 0.9rem;
  line-height: 1.6;
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

.zalopay-box {
  background-color: #eff6ff;
  border-color: #60a5fa;
}

.zalopay-title {
  color: #0b63ce;
}

.qr-text {
  color: #475569;
  line-height: 1.6;
  font-size: 0.88rem;
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

.action-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}

.line-height-17 {
  line-height: 1.7;
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

.single-method {
  grid-template-columns: 1fr;
}

.fixed-method {
  cursor: default;
}
</style>