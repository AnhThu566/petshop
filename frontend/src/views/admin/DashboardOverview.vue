<template>
  <div class="dashboard-overview-page">
    <div class="container-fluid px-4 py-4">
      <div class="dashboard-head mb-4">
        <div>
          <h3 class="dashboard-title">
            <i class="fas fa-chart-pie mr-2"></i>
            BẢNG ĐIỀU KHIỂN TỔNG QUAN
          </h3>
          <p class="dashboard-subtitle mb-0">
            Theo dõi tình hình vận hành, kiểm duyệt hồ sơ và giao dịch của PetShop
          </p>
        </div>

        <button class="refresh-btn" @click="calculateStats" :disabled="loading">
          <i class="fas fa-sync-alt mr-1"></i>
          {{ loading ? "Đang tải..." : "Làm mới" }}
        </button>
      </div>

      <div v-if="loading" class="state-box">
        <i class="fas fa-spinner fa-spin state-icon"></i>
        <p class="mb-0">Đang tải dữ liệu thống kê...</p>
      </div>

      <div v-else>
        <div class="metric-grid mb-4">
          <div class="metric-card revenue-card">
            <div class="metric-icon-wrap">
              <i class="fas fa-wallet"></i>
            </div>
            <div class="metric-content">
              <div class="metric-label">Tổng tiền cọc đã nhận</div>
              <div class="metric-value">{{ formatCurrency(totalRevenue) }}</div>
              <div class="metric-note">Tính từ các đơn đã nhận cọc</div>
            </div>
          </div>

          <div class="metric-card pending-order-card">
            <div class="metric-icon-wrap">
              <i class="fas fa-file-signature"></i>
            </div>
            <div class="metric-content">
              <div class="metric-label">Đơn chờ xác nhận cọc</div>
              <div class="metric-value">{{ pendingOrders }}</div>
              <div class="metric-note">Cần admin kiểm tra khoản cọc</div>
            </div>
          </div>

          <div class="metric-card active-dog-card">
            <div class="metric-icon-wrap">
              <i class="fas fa-dog"></i>
            </div>
            <div class="metric-content">
              <div class="metric-label">Chó sẵn sàng bán</div>
              <div class="metric-value">{{ activeDogs }}</div>
              <div class="metric-note">Đang được phép giao dịch</div>
            </div>
          </div>

          <div class="metric-card pending-dog-card">
            <div class="metric-icon-wrap">
              <i class="fas fa-search-plus"></i>
            </div>
            <div class="metric-content">
              <div class="metric-label">Hồ sơ chó chờ duyệt</div>
              <div class="metric-value">{{ pendingDogs }}</div>
              <div class="metric-note">Đang chờ admin xét duyệt</div>
            </div>
          </div>

          <div class="metric-card sold-dog-card">
            <div class="metric-icon-wrap">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="metric-content">
              <div class="metric-label">Chó đã bán</div>
              <div class="metric-value">{{ soldDogs }}</div>
              <div class="metric-note">Đã hoàn tất bàn giao</div>
            </div>
          </div>

          <div class="metric-card delivering-card">
            <div class="metric-icon-wrap">
              <i class="fas fa-truck"></i>
            </div>
            <div class="metric-content">
              <div class="metric-label">Đơn đang giao</div>
              <div class="metric-value">{{ deliveringOrders }}</div>
              <div class="metric-note">Đang trong quá trình bàn giao</div>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-lg-7 mb-4">
            <div class="panel-card h-100">
              <div class="panel-head">
                <h5 class="panel-title">
                  <i class="fas fa-clipboard-list mr-2"></i>Tóm tắt đơn đặt cọc
                </h5>
              </div>

              <div class="panel-body">
                <div class="summary-list">
                  <div class="summary-item">
                    <span class="summary-label">Chờ xác nhận cọc</span>
                    <strong class="summary-value text-warning">{{ pendingOrders }}</strong>
                  </div>

                  <div class="summary-item">
                    <span class="summary-label">Đã nhận cọc</span>
                    <strong class="summary-value text-primary">{{ confirmedOrders }}</strong>
                  </div>

                  <div class="summary-item">
                    <span class="summary-label">Đang giao</span>
                    <strong class="summary-value text-info">{{ deliveringOrders }}</strong>
                  </div>

                  <div class="summary-item">
                    <span class="summary-label">Hoàn thành</span>
                    <strong class="summary-value text-success">{{ completedOrders }}</strong>
                  </div>

                  <div class="summary-item">
                    <span class="summary-label">Đã hủy</span>
                    <strong class="summary-value text-danger">{{ cancelledOrders }}</strong>
                  </div>
                </div>

                <div class="system-note-box mt-4">
                  <div class="system-note-title">Ghi nhận nghiệp vụ</div>
                  <div class="system-note-text">
                    Dòng tiền đặt cọc chỉ được cộng khi đơn đã ở trạng thái <strong>Đã nhận cọc</strong>.
                    Những đơn đang giao hoặc hoàn thành tiếp tục phản ánh tiến trình bàn giao chó cho khách.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-5 mb-4">
            <div class="panel-card h-100">
              <div class="panel-head">
                <h5 class="panel-title">
                  <i class="fas fa-paw mr-2"></i>Tóm tắt hồ sơ chó
                </h5>
              </div>

              <div class="panel-body">
                <div class="summary-list">
                  <div class="summary-item">
                    <span class="summary-label">Chờ duyệt</span>
                    <strong class="summary-value text-warning">{{ pendingDogs }}</strong>
                  </div>

                  <div class="summary-item">
                    <span class="summary-label">Đã duyệt</span>
                    <strong class="summary-value text-success">{{ approvedDogs }}</strong>
                  </div>

                  <div class="summary-item">
                    <span class="summary-label">Sẵn sàng bán</span>
                    <strong class="summary-value text-primary">{{ activeDogs }}</strong>
                  </div>

                  <div class="summary-item">
                    <span class="summary-label">Đã đặt cọc / chờ thanh toán</span>
                    <strong class="summary-value text-info">{{ reservedDogs }}</strong>
                  </div>

                  <div class="summary-item">
                    <span class="summary-label">Đã bán</span>
                    <strong class="summary-value text-dark">{{ soldDogs }}</strong>
                  </div>
                </div>

                <div class="system-note-box mt-4">
                  <div class="system-note-title">Ghi nhận kiểm duyệt</div>
                  <div class="system-note-text">
                    Chỉ những hồ sơ đã được duyệt và đủ điều kiện mới có thể chuyển sang trạng thái
                    <strong>Sẵn sàng bán</strong> để hiển thị cho khách hàng.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-12">
            <div class="panel-card">
              <div class="panel-head">
                <h5 class="panel-title">
                  <i class="fas fa-building mr-2"></i>Tổng quan vận hành hệ thống
                </h5>
              </div>

              <div class="panel-body">
                <div class="overview-grid">
                  <div class="overview-box">
                    <div class="overview-box-label">Tổng số hồ sơ chó</div>
                    <div class="overview-box-value">{{ totalDogs }}</div>
                  </div>

                  <div class="overview-box">
                    <div class="overview-box-label">Tổng số đơn đặt cọc</div>
                    <div class="overview-box-value">{{ totalOrders }}</div>
                  </div>

                  <div class="overview-box">
                    <div class="overview-box-label">Tỷ lệ chó đã bán</div>
                    <div class="overview-box-value">{{ soldRate }}%</div>
                  </div>

                  <div class="overview-box">
                    <div class="overview-box-label">Tỷ lệ đơn đã hoàn thành</div>
                    <div class="overview-box-value">{{ completedRate }}%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
       </div>
      </div>
    </div>
  </div>
</template>

<script>
import OrderService from "@/services/order.service";
import DogService from "@/services/dog.service";

export default {
  name: "DashboardOverview",

  data() {
    return {
      loading: false,

      totalRevenue: 0,

      totalOrders: 0,
      pendingOrders: 0,
      confirmedOrders: 0,
      deliveringOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0,

      totalDogs: 0,
      pendingDogs: 0,
      approvedDogs: 0,
      activeDogs: 0,
      reservedDogs: 0,
      soldDogs: 0,
    };
  },

  computed: {
    soldRate() {
      if (!this.totalDogs) return 0;
      return Math.round((this.soldDogs / this.totalDogs) * 100);
    },

    completedRate() {
      if (!this.totalOrders) return 0;
      return Math.round((this.completedOrders / this.totalOrders) * 100);
    },
  },

  async created() {
    await this.calculateStats();
  },

  methods: {
    formatCurrency(value) {
      return Number(value || 0).toLocaleString("vi-VN") + " ₫";
    },

    async calculateStats() {
      try {
        this.loading = true;

        const [orders, allDogs] = await Promise.all([
          OrderService.getAll(),
          DogService.getAll(),
        ]);

        const safeOrders = Array.isArray(orders) ? orders : [];
        const safeDogs = Array.isArray(allDogs) ? allDogs : [];

        this.totalOrders = safeOrders.length;

        this.pendingOrders = safeOrders.filter(
          (order) => order.status === "Chờ xác nhận cọc"
        ).length;

        this.confirmedOrders = safeOrders.filter(
          (order) => order.status === "Đã nhận cọc"
        ).length;

        this.deliveringOrders = safeOrders.filter(
          (order) => order.status === "Đang giao"
        ).length;

        this.completedOrders = safeOrders.filter(
          (order) => order.status === "Hoàn thành"
        ).length;

        this.cancelledOrders = safeOrders.filter(
          (order) => order.status === "Đã hủy"
        ).length;

        this.totalRevenue = safeOrders
          .filter((order) => order.status === "Đã nhận cọc")
          .reduce((sum, order) => sum + Number(order.depositAmount || 0), 0);

        this.totalDogs = safeDogs.length;

        this.pendingDogs = safeDogs.filter(
          (dog) => dog.approvalStatus === "Chờ duyệt"
        ).length;

        this.approvedDogs = safeDogs.filter(
          (dog) => dog.approvalStatus === "Đã duyệt"
        ).length;

        this.activeDogs = safeDogs.filter(
          (dog) => dog.saleStatus === "Sẵn sàng bán"
        ).length;

        this.reservedDogs = safeDogs.filter((dog) =>
          ["Chờ thanh toán", "Đã đặt cọc", "Đang giao"].includes(dog.saleStatus)
        ).length;

        this.soldDogs = safeDogs.filter(
          (dog) => dog.saleStatus === "Đã bán"
        ).length;
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu thống kê:", error);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.dashboard-overview-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafc 0%, #f3f4f6 100%);
}

.dashboard-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.dashboard-title {
  font-weight: 900;
  color: #111827;
  margin-bottom: 6px;
}

.dashboard-title i {
  color: #2563eb;
}

.dashboard-subtitle {
  color: #6b7280;
}

.refresh-btn {
  border: none;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #fff;
  border-radius: 12px;
  min-height: 42px;
  padding: 0 16px;
  font-weight: 800;
}

.refresh-btn:disabled {
  opacity: 0.75;
}

.state-box {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.06);
  padding: 50px 20px;
  text-align: center;
  color: #6b7280;
}

.state-icon {
  font-size: 2rem;
  margin-bottom: 14px;
  color: #2563eb;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.metric-card {
  border-radius: 20px;
  padding: 22px;
  color: #fff;
  display: flex;
  gap: 16px;
  align-items: flex-start;
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.08);
}

.metric-icon-wrap {
  width: 54px;
  height: 54px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.16);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  flex-shrink: 0;
}

.metric-label {
  font-size: 0.9rem;
  font-weight: 700;
  opacity: 0.95;
  margin-bottom: 6px;
}

.metric-value {
  font-size: 1.55rem;
  font-weight: 900;
  line-height: 1.2;
}

.metric-note {
  margin-top: 6px;
  font-size: 0.83rem;
  opacity: 0.9;
}

.revenue-card {
  background: linear-gradient(135deg, #16a34a, #15803d);
}

.pending-order-card {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.active-dog-card {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
}

.pending-dog-card {
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
}

.sold-dog-card {
  background: linear-gradient(135deg, #111827, #374151);
}

.delivering-card {
  background: linear-gradient(135deg, #0ea5e9, #0284c7);
}

.panel-card {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.06);
  overflow: hidden;
}

.panel-head {
  padding: 20px 22px 0;
}

.panel-title {
  color: #111827;
  font-weight: 800;
  margin: 0;
}

.panel-body {
  padding: 20px 22px 22px;
}

.summary-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-item {
  border: 1px solid #eceff3;
  border-radius: 14px;
  padding: 13px 15px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  background: #fafbfc;
}

.summary-label {
  color: #4b5563;
  font-weight: 600;
}

.summary-value {
  font-size: 1.05rem;
  font-weight: 900;
}

.system-note-box {
  border: 1px solid #dbeafe;
  background: #eff6ff;
  border-radius: 16px;
  padding: 14px 16px;
}

.system-note-title {
  font-weight: 800;
  color: #1d4ed8;
  margin-bottom: 8px;
}

.system-note-text {
  color: #334155;
  line-height: 1.7;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.overview-box {
  border: 1px solid #eceff3;
  border-radius: 16px;
  padding: 16px;
  background: #fafbfc;
  text-align: center;
}

.overview-box-label {
  color: #6b7280;
  font-size: 0.88rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.overview-box-value {
  color: #111827;
  font-size: 1.45rem;
  font-weight: 900;
}

@media (max-width: 1199.98px) {
  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .overview-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 767.98px) {
  .metric-grid,
  .overview-grid {
    grid-template-columns: 1fr;
  }

  .metric-card {
    padding: 18px;
  }

  .dashboard-title {
    font-size: 1.4rem;
  }
}
</style>