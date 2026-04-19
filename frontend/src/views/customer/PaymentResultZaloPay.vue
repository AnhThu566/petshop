<template>
  <div class="payment-result-page">
    <div class="container payment-result-container py-4">
      <div class="result-card">
        <div v-if="loading" class="result-state state-loading">
          <div class="result-icon loading-icon">
            <i class="fas fa-spinner fa-spin"></i>
          </div>
          <h2 class="result-title">Đang kiểm tra thanh toán</h2>
          <p class="result-text">
            Hệ thống đang xác nhận kết quả thanh toán ZaloPay của bạn...
          </p>

          <div class="result-meta" v-if="orderCode">
            <span>Mã đơn:</span>
            <strong>{{ orderCode }}</strong>
          </div>
        </div>

        <div v-else-if="statusType === 'success'" class="result-state state-success">
          <div class="result-icon success-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <h2 class="result-title">Thanh toán thành công</h2>
          <p class="result-text">
            Đơn phụ kiện của bạn đã được thanh toán thành công qua ZaloPay.
          </p>

          <div class="result-info-box">
            <div class="info-row" v-if="orderCode">
              <span>Mã đơn</span>
              <strong>{{ orderCode }}</strong>
            </div>
            <div class="info-row" v-if="paymentStatus">
              <span>Trạng thái thanh toán</span>
              <strong class="text-success">{{ paymentStatus }}</strong>
            </div>
          </div>

          <div class="result-actions">
            <router-link
              to="/accessory-orders"
              class="action-btn primary-btn text-decoration-none"
            >
              <i class="fas fa-file-invoice mr-2"></i>
              Xem lịch sử đơn
            </router-link>

            <router-link
              to="/accessories"
              class="action-btn secondary-btn text-decoration-none"
            >
              <i class="fas fa-shopping-bag mr-2"></i>
              Tiếp tục mua sắm
            </router-link>
          </div>
        </div>

        <div v-else-if="statusType === 'failed'" class="result-state state-failed">
          <div class="result-icon failed-icon">
            <i class="fas fa-times-circle"></i>
          </div>
          <h2 class="result-title">Thanh toán chưa thành công</h2>
          <p class="result-text">
            {{
              errorMessage ||
              "Giao dịch ZaloPay chưa hoàn tất hoặc đã thất bại. Bạn có thể thử lại sau."
            }}
          </p>

          <div class="result-info-box" v-if="orderCode || paymentStatus">
            <div class="info-row" v-if="orderCode">
              <span>Mã đơn</span>
              <strong>{{ orderCode }}</strong>
            </div>
            <div class="info-row" v-if="paymentStatus">
              <span>Trạng thái thanh toán</span>
              <strong class="text-danger">{{ paymentStatus }}</strong>
            </div>
          </div>

          <div class="result-actions">
            <router-link
              to="/accessory-orders"
              class="action-btn primary-btn text-decoration-none"
            >
              <i class="fas fa-file-invoice mr-2"></i>
              Xem đơn phụ kiện
            </router-link>

            <router-link
              to="/cart"
              class="action-btn secondary-btn text-decoration-none"
            >
              <i class="fas fa-shopping-cart mr-2"></i>
              Quay lại giỏ hàng
            </router-link>
          </div>
        </div>

        <div v-else class="result-state state-warning">
          <div class="result-icon warning-icon">
            <i class="fas fa-exclamation-circle"></i>
          </div>
          <h2 class="result-title">Không tìm thấy thông tin đơn hàng</h2>
          <p class="result-text">
            Hệ thống chưa xác định được đơn cần kiểm tra thanh toán.
          </p>

          <div class="result-actions">
            <router-link
              to="/accessory-orders"
              class="action-btn primary-btn text-decoration-none"
            >
              <i class="fas fa-file-invoice mr-2"></i>
              Xem lịch sử đơn
            </router-link>

            <router-link
              to="/accessories"
              class="action-btn secondary-btn text-decoration-none"
            >
              <i class="fas fa-shopping-bag mr-2"></i>
              Tiếp tục mua sắm
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AccessoryOrderService from "@/services/accessoryOrder.service";

export default {
  name: "PaymentResultZaloPay",

  data() {
    return {
      loading: true,
      statusType: "idle", // idle | success | failed | missing
      paymentStatus: "",
      errorMessage: "",
      orderId: "",
      orderCode: "",
    };
  },

  methods: {
    getPendingPaymentInfo() {
      const queryOrderId = this.$route.query.orderId || "";
      const queryOrderCode = this.$route.query.maDonPhuKien || "";

      const raw = sessionStorage.getItem("zalopay_pending_order");
      const pending = raw ? JSON.parse(raw) : null;

      return {
        orderId: queryOrderId || pending?.orderId || "",
        orderCode: queryOrderCode || pending?.maDonPhuKien || "",
      };
    },

    clearPendingPaymentInfo() {
      sessionStorage.removeItem("zalopay_pending_order");
    },

    clearCheckoutTempData() {
      sessionStorage.removeItem("buy_now_checkout");
      sessionStorage.removeItem("cart_checkout_selection");
      window.dispatchEvent(new Event("cart-updated"));
    },

    sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },

    async checkPaymentStatus() {
      try {
        const info = this.getPendingPaymentInfo();
        this.orderId = info.orderId;
        this.orderCode = info.orderCode;

        if (!this.orderId) {
          this.statusType = "missing";
          return;
        }

        let lastStatus = "";

        for (let i = 0; i < 4; i++) {
          const response = await AccessoryOrderService.queryZaloPayStatus(this.orderId);
          this.paymentStatus = response?.paymentStatus || "";
          lastStatus = this.paymentStatus;

          if (lastStatus === "Đã thanh toán") {
            this.statusType = "success";
            this.clearPendingPaymentInfo();
            this.clearCheckoutTempData();
            return;
          }

          if (lastStatus === "Thanh toán thất bại") {
            this.statusType = "failed";
            this.errorMessage =
              "Thanh toán ZaloPay đã thất bại hoặc đã hết hiệu lực.";
            this.clearPendingPaymentInfo();
            return;
          }

          if (i < 3) {
            await this.sleep(2000);
          }
        }

        this.statusType = "failed";
        this.errorMessage =
          "Hệ thống chưa xác nhận thanh toán ngay lúc này. Vui lòng kiểm tra lại trong lịch sử đơn sau ít phút.";
      } catch (error) {
        console.error("Lỗi kiểm tra trạng thái ZaloPay:", error);
        this.statusType = "failed";
        this.errorMessage =
          error.response?.data?.message ||
          "Không thể kiểm tra trạng thái thanh toán ZaloPay.";
      } finally {
        this.loading = false;
      }
    },
  },

  mounted() {
    this.checkPaymentStatus();
  },
};
</script>

<style scoped>
.payment-result-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(177, 145, 211, 0.12), transparent 28%),
    linear-gradient(180deg, #faf7fc 0%, #f4eef9 100%);
}

.payment-result-container {
  max-width: 900px;
}

.result-card {
  background: #fff;
  border: 1px solid #eee2f7;
  border-radius: 24px;
  box-shadow: 0 12px 28px rgba(106, 27, 154, 0.08);
  padding: 42px 28px;
}

.result-state {
  text-align: center;
}

.result-icon {
  width: 88px;
  height: 88px;
  margin: 0 auto 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.4rem;
}

.loading-icon {
  background: #eef2ff;
  color: #4338ca;
}

.success-icon {
  background: #eafaf0;
  color: #16a34a;
}

.failed-icon {
  background: #fff1f2;
  color: #dc2626;
}

.warning-icon {
  background: #fff7e8;
  color: #d97706;
}

.result-title {
  margin: 0 0 10px;
  color: #2f1b44;
  font-weight: 900;
  font-size: 1.9rem;
}

.result-text {
  max-width: 620px;
  margin: 0 auto;
  color: #6b7280;
  line-height: 1.75;
  font-size: 1rem;
}

.result-meta {
  margin-top: 18px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 999px;
  background: #f8f3fc;
  color: #4b5563;
  font-size: 0.92rem;
}

.result-info-box {
  max-width: 520px;
  margin: 24px auto 0;
  padding: 16px 18px;
  border-radius: 18px;
  border: 1px solid #eadcf7;
  background: #fcfbfe;
  text-align: left;
}

.info-row {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  color: #4b5563;
  font-size: 0.95rem;
}

.info-row + .info-row {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #eadcf7;
}

.result-actions {
  margin-top: 28px;
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.action-btn {
  min-height: 46px;
  padding: 0 18px;
  border-radius: 14px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.primary-btn {
  background: linear-gradient(135deg, #6a1b9a, #4a148c);
  color: #fff;
}

.secondary-btn {
  background: #fff;
  color: #5c5368;
  border: 1px solid #dfd3ec;
}

@media (max-width: 767.98px) {
  .result-card {
    padding: 32px 18px;
  }

  .result-title {
    font-size: 1.55rem;
  }

  .result-actions {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }

  .info-row {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>