import createApiClient from "./api.service";

class OrderService {
  constructor(baseUrl = "/api/orders") {
    this.api = createApiClient(baseUrl);
  }

  // ==============================
  // KHÁCH HÀNG - ĐẶT CỌC THỦ CÔNG
  // ==============================
  async createDeposit(data) {
    return (await this.api.post("/deposit", data)).data;
  }

  // ==============================
  // KHÁCH HÀNG - ĐẶT CỌC QUA ZALOPAY
  // ==============================
  async createDepositZaloPay(data) {
    return (await this.api.post("/deposit/zalopay", data)).data;
  }

  async checkZaloPayStatus(orderId) {
    return (await this.api.get(`/${orderId}/zalopay-status`)).data;
  }

  // ==============================
  // DANH SÁCH / LỊCH SỬ ĐƠN
  // ==============================
  async getAll(params = {}) {
    return (
      await this.api.get("/", {
        params,
      })
    ).data;
  }

  async getMyOrders() {
    return (await this.api.get("/my-orders")).data;
  }

  async getHistory(id) {
    return (await this.api.get(`/${id}/history`)).data;
  }

  // ==============================
  // CẬP NHẬT / HỦY ĐƠN
  // ==============================
  async updateStatus(id, status) {
    return (await this.api.put(`/${id}/status`, { status })).data;
  }

  async cancelByCustomer(id) {
    return (await this.api.put(`/${id}/cancel`)).data;
  }

  // ==============================
  // HELPER CHO FRONTEND
  // ==============================
  getPaymentUrl(paymentData) {
    return (
      paymentData?.order_url ||
      paymentData?.orderUrl ||
      paymentData?.paymentUrl ||
      ""
    );
  }

  getQrCode(paymentData) {
    return (
      paymentData?.qr_code ||
      paymentData?.qrCode ||
      ""
    );
  }

  openZaloPay(paymentData) {
    const paymentUrl = this.getPaymentUrl(paymentData);

    if (!paymentUrl) {
      throw new Error("Không tìm thấy liên kết thanh toán ZaloPay.");
    }

    window.location.href = paymentUrl;
  }

  isZaloPayOrder(order) {
    return (
      order?.paymentMethod === "ZaloPay" ||
      order?.paymentProvider === "ZALOPAY"
    );
  }

  isPendingZaloPayPayment(order) {
    return (
      this.isZaloPayOrder(order) &&
      order?.status === "Chờ xác nhận cọc" &&
      order?.paymentStatus === "Chờ thanh toán"
    );
  }

  isPaidDeposit(order) {
    return (
      order?.status === "Đã nhận cọc" ||
      order?.paymentStatus === "Đã xác nhận" ||
      order?.paymentStatus === "Đã hoàn tất"
    );
  }

  isFailedDeposit(order) {
    return (
      order?.status === "Đã hủy" ||
      order?.paymentStatus === "Thanh toán thất bại"
    );
  }
}

export default new OrderService();