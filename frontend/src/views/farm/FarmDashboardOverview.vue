<template>
  <div class="farm-dashboard-overview-page">
    <div class="container-fluid px-4 py-4">
      <div class="dashboard-head mb-4">
        <div>
          <h3 class="dashboard-title">
            <i class="fas fa-chart-line mr-2"></i>
            BẢNG ĐIỀU KHIỂN TRANG TRẠI
          </h3>
          <p class="dashboard-subtitle mb-0">
            Theo dõi tổng quan hồ sơ chó, trạng thái xét duyệt và kết quả cung cấp trên hệ thống
          </p>
        </div>

        <div class="head-actions">
          <router-link to="/farm/add-dog" class="btn btn-primary btn-sm mr-2">
            <i class="fas fa-plus mr-1"></i> Cung cấp hồ sơ chó
          </router-link>

          <button class="refresh-btn" @click="loadDashboard" :disabled="loading">
            <i class="fas fa-sync-alt mr-1"></i>
            {{ loading ? "Đang tải..." : "Làm mới" }}
          </button>
        </div>
      </div>

      <div v-if="loading" class="state-box">
        <i class="fas fa-spinner fa-spin state-icon"></i>
        <p class="mb-0">Đang tải dữ liệu tổng quan của trang trại...</p>
      </div>

      <div v-else>
        <div class="metric-grid mb-4">
          <div class="metric-card pending-card">
            <div class="metric-icon-wrap">
              <i class="fas fa-hourglass-half"></i>
            </div>
            <div class="metric-content">
              <div class="metric-label">Hồ sơ chờ duyệt</div>
              <div class="metric-value">{{ stats.pending }}</div>
              <div class="metric-note">Đang chờ hệ thống xét duyệt</div>
            </div>
          </div>

          <div class="metric-card approved-card">
            <div class="metric-icon-wrap">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="metric-content">
              <div class="metric-label">Hồ sơ đã duyệt</div>
              <div class="metric-value">{{ stats.approved }}</div>
              <div class="metric-note">Đã được hệ thống chấp nhận</div>
            </div>
          </div>

          <div class="metric-card published-card">
            <div class="metric-icon-wrap">
              <i class="fas fa-store"></i>
            </div>
            <div class="metric-content">
              <div class="metric-label">Đang hiển thị</div>
              <div class="metric-value">{{ stats.published }}</div>
              <div class="metric-note">Đang được mở công khai trên website</div>
            </div>
          </div>

          <div class="metric-card active-sale-card">
            <div class="metric-icon-wrap">
              <i class="fas fa-dog"></i>
            </div>
            <div class="metric-content">
              <div class="metric-label">Sẵn sàng bán</div>
              <div class="metric-value">{{ stats.readySale }}</div>
              <div class="metric-note">Có thể tiếp nhận giao dịch</div>
            </div>
          </div>

          <div class="metric-card reserved-card">
            <div class="metric-icon-wrap">
              <i class="fas fa-hand-holding-heart"></i>
            </div>
            <div class="metric-content">
              <div class="metric-label">Đang giao dịch</div>
              <div class="metric-value">{{ stats.inTransaction }}</div>
              <div class="metric-note">Chờ thanh toán / đã đặt cọc / đang giao</div>
            </div>
          </div>

          <div class="metric-card sold-card">
            <div class="metric-icon-wrap">
              <i class="fas fa-medal"></i>
            </div>
            <div class="metric-content">
              <div class="metric-label">Đã bán</div>
              <div class="metric-value">{{ stats.sold }}</div>
              <div class="metric-note">Đã hoàn tất bàn giao</div>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-lg-7 mb-4">
            <div class="panel-card h-100">
              <div class="panel-head">
                <h5 class="panel-title">
                  <i class="fas fa-clipboard-list mr-2"></i>Tóm tắt hoạt động cung cấp hồ sơ
                </h5>
              </div>

              <div class="panel-body">
                <div class="summary-list">
                  <div class="summary-item">
                    <span class="summary-label">Tổng hồ sơ đã cung cấp</span>
                    <strong class="summary-value text-dark">{{ stats.total }}</strong>
                  </div>

                  <div class="summary-item">
                    <span class="summary-label">Hồ sơ chờ duyệt</span>
                    <strong class="summary-value text-warning">{{ stats.pending }}</strong>
                  </div>

                  <div class="summary-item">
                    <span class="summary-label">Hồ sơ đã duyệt</span>
                    <strong class="summary-value text-success">{{ stats.approved }}</strong>
                  </div>

                  <div class="summary-item">
                    <span class="summary-label">Hồ sơ bị từ chối</span>
                    <strong class="summary-value text-danger">{{ stats.rejected }}</strong>
                  </div>

                  <div class="summary-item">
                    <span class="summary-label">Đang mở hiển thị</span>
                    <strong class="summary-value text-primary">{{ stats.published }}</strong>
                  </div>
                </div>

                <div class="system-note-box mt-4">
                  <div class="system-note-title">Ghi nhận vận hành</div>
                  <div class="system-note-text">
                    Trang trại là đơn vị cung cấp hồ sơ chó cho hệ thống. Hồ sơ sau khi gửi sẽ được quản trị viên kiểm duyệt trước khi được phép mở hiển thị và giao dịch với khách hàng.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-5 mb-4">
            <div class="panel-card h-100">
              <div class="panel-head">
                <h5 class="panel-title">
                  <i class="fas fa-paw mr-2"></i>Tóm tắt vòng đời hồ sơ chó
                </h5>
              </div>

              <div class="panel-body">
                <div class="summary-list">
                  <div class="summary-item">
                    <span class="summary-label">Chưa mở bán</span>
                    <strong class="summary-value text-secondary">{{ stats.notForSale }}</strong>
                  </div>

                  <div class="summary-item">
                    <span class="summary-label">Sẵn sàng bán</span>
                    <strong class="summary-value text-primary">{{ stats.readySale }}</strong>
                  </div>

                  <div class="summary-item">
                    <span class="summary-label">Đang giao dịch</span>
                    <strong class="summary-value text-info">{{ stats.inTransaction }}</strong>
                  </div>

                  <div class="summary-item">
                    <span class="summary-label">Đã bán</span>
                    <strong class="summary-value text-success">{{ stats.sold }}</strong>
                  </div>

                  <div class="summary-item">
                    <span class="summary-label">Ngừng bán</span>
                    <strong class="summary-value text-danger">{{ stats.stopped }}</strong>
                  </div>
                </div>

                <div class="system-note-box mt-4">
                  <div class="system-note-title">Ghi nhận nghiệp vụ</div>
                  <div class="system-note-text">
                    Khi chó đang ở các trạng thái giao dịch như chờ thanh toán, đã đặt cọc hoặc đang giao, hồ sơ sẽ bị khóa chỉnh sửa để đảm bảo tính nhất quán dữ liệu.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-12">
            <div class="panel-card">
              <div class="panel-head">
                <h5 class="panel-title">
                  <i class="fas fa-chart-bar mr-2"></i>Chỉ số hiệu quả của trang trại
                </h5>
              </div>

              <div class="panel-body">
                <div class="overview-grid">
                  <div class="overview-box">
                    <div class="overview-box-label">Tổng hồ sơ</div>
                    <div class="overview-box-value">{{ stats.total }}</div>
                  </div>

                  <div class="overview-box">
                    <div class="overview-box-label">Tỷ lệ đã duyệt</div>
                    <div class="overview-box-value">{{ approvalRate }}%</div>
                  </div>

                  <div class="overview-box">
                    <div class="overview-box-label">Tỷ lệ đang hiển thị</div>
                    <div class="overview-box-value">{{ publishedRate }}%</div>
                  </div>

                  <div class="overview-box">
                    <div class="overview-box-label">Tỷ lệ đã bán</div>
                    <div class="overview-box-value">{{ soldRate }}%</div>
                  </div>
                </div>

                <div class="dashboard-actions mt-4">
                  <router-link to="/farm/dogs" class="dashboard-link-btn">
                    <i class="fas fa-list mr-2"></i>Xem danh sách hồ sơ chó
                  </router-link>

                  <router-link to="/farm/profile" class="dashboard-link-btn dashboard-link-secondary">
                    <i class="fas fa-warehouse mr-2"></i>Xem hồ sơ trang trại
                  </router-link>
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
import DogService from "@/services/dog.service";

export default {
  name: "FarmDashboardOverview",

  data() {
    return {
      loading: false,
      dogs: [],
    };
  },

  computed: {
    stats() {
      return {
        total: this.dogs.length,
        pending: this.dogs.filter((d) => d.approvalStatus === "Chờ duyệt").length,
        approved: this.dogs.filter((d) => d.approvalStatus === "Đã duyệt").length,
        rejected: this.dogs.filter((d) => d.approvalStatus === "Từ chối").length,
        published: this.dogs.filter(
          (d) => d.approvalStatus === "Đã duyệt" && d.isPublished
        ).length,
        notForSale: this.dogs.filter((d) =>
          ["Chưa mở bán"].includes(d.saleStatus)
        ).length,
        readySale: this.dogs.filter((d) => d.saleStatus === "Sẵn sàng bán").length,
        inTransaction: this.dogs.filter((d) =>
          ["Chờ thanh toán", "Đã đặt cọc", "Đang giao"].includes(d.saleStatus)
        ).length,
        sold: this.dogs.filter((d) => d.saleStatus === "Đã bán").length,
        stopped: this.dogs.filter((d) => d.saleStatus === "Ngừng bán").length,
      };
    },

    approvalRate() {
      if (!this.stats.total) return 0;
      return Math.round((this.stats.approved / this.stats.total) * 100);
    },

    publishedRate() {
      if (!this.stats.total) return 0;
      return Math.round((this.stats.published / this.stats.total) * 100);
    },

    soldRate() {
      if (!this.stats.total) return 0;
      return Math.round((this.stats.sold / this.stats.total) * 100);
    },
  },

  methods: {
    async loadDashboard() {
      try {
        this.loading = true;
        const data = await DogService.getAll();
        this.dogs = Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Lỗi tải dashboard trang trại:", error);
        alert(
          "Không thể tải dữ liệu dashboard: " +
            (error.response?.data?.message || error.message)
        );
        this.dogs = [];
      } finally {
        this.loading = false;
      }
    },
  },

  mounted() {
    this.loadDashboard();
  },
};
</script>

<style scoped>
.farm-dashboard-overview-page {
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
  color: #16a34a;
}

.dashboard-subtitle {
  color: #6b7280;
}

.head-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.refresh-btn {
  border: none;
  background: linear-gradient(135deg, #16a34a, #15803d);
  color: #fff;
  border-radius: 12px;
  min-height: 38px;
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
  color: #16a34a;
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

.pending-card {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.approved-card {
  background: linear-gradient(135deg, #16a34a, #15803d);
}

.published-card {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
}

.active-sale-card {
  background: linear-gradient(135deg, #0ea5e9, #0284c7);
}

.reserved-card {
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
}

.sold-card {
  background: linear-gradient(135deg, #111827, #374151);
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
  border: 1px solid #dcfce7;
  background: #f0fdf4;
  border-radius: 16px;
  padding: 14px 16px;
}

.system-note-title {
  font-weight: 800;
  color: #15803d;
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

.dashboard-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.dashboard-link-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 0 18px;
  border-radius: 12px;
  background: #16a34a;
  color: #fff;
  font-weight: 800;
  text-decoration: none;
}

.dashboard-link-secondary {
  background: #eff6ff;
  color: #2563eb;
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