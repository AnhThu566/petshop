<template>
  <div class="customer-care-page">
    <div class="container-fluid page-container py-4">
      <div class="page-layout">
        <aside class="account-sidebar">
          <div class="account-card">
            <div class="account-top">
              <div class="account-info">
                <h5 class="account-name mb-1">
                  {{ currentUser?.fullName || currentUser?.username || "Khách hàng" }}
                </h5>
                <div class="account-email">
                  {{ currentUser?.email || "Chưa cập nhật email" }}
                </div>
              </div>

              <div class="account-avatar">
                {{ getAvatarText() }}
              </div>
            </div>

            <div class="account-note">
              Quản lý hồ sơ cá nhân, chó đã mua, lịch nhắc và theo dõi sau bán tại đây.
            </div>
          </div>

          <div class="sidebar-menu">
            <router-link to="/profile" class="menu-item-link text-decoration-none">
              <div class="menu-item" :class="{ active: $route.path === '/profile' }">
                <span><i class="fas fa-user-circle mr-2"></i> Hồ sơ của tôi</span>
                <i class="fas fa-chevron-right menu-arrow"></i>
              </div>
            </router-link>

            <router-link to="/tra-cuu-don" class="menu-item-link text-decoration-none">
              <div class="menu-item" :class="{ active: $route.path === '/tra-cuu-don' }">
                <span><i class="fas fa-file-invoice-dollar mr-2"></i> Lịch sử đặt cọc</span>
                <i class="fas fa-chevron-right menu-arrow"></i>
              </div>
            </router-link>

            <router-link to="/my-dogs" class="menu-item-link text-decoration-none">
              <div class="menu-item" :class="{ active: $route.path === '/my-dogs' }">
                <span><i class="fas fa-dog mr-2"></i> Hồ sơ chó đã mua</span>
                <i class="fas fa-chevron-right menu-arrow"></i>
              </div>
            </router-link>

            <router-link to="/my-dog-care-records" class="menu-item-link text-decoration-none">
              <div class="menu-item" :class="{ active: $route.path === '/my-dog-care-records' }">
                <span><i class="fas fa-heartbeat mr-2"></i> Theo dõi sau bán</span>
                <i class="fas fa-chevron-right menu-arrow"></i>
              </div>
            </router-link>

            <router-link to="/my-dog-reminders" class="menu-item-link text-decoration-none">
              <div class="menu-item" :class="{ active: $route.path === '/my-dog-reminders' }">
                <span><i class="fas fa-notes-medical mr-2"></i> Lịch nhắc chăm sóc chó</span>
                <i class="fas fa-chevron-right menu-arrow"></i>
              </div>
            </router-link>

            <router-link to="/my-notifications" class="menu-item-link text-decoration-none">
              <div class="menu-item" :class="{ active: $route.path === '/my-notifications' }">
                <span><i class="fas fa-bell mr-2"></i> Thông báo của tôi</span>
                <i class="fas fa-chevron-right menu-arrow"></i>
              </div>
            </router-link>

            <router-link to="/accessory-orders" class="menu-item-link text-decoration-none">
              <div class="menu-item" :class="{ active: $route.path === '/accessory-orders' }">
                <span><i class="fas fa-shopping-bag mr-2"></i> Đơn phụ kiện</span>
                <i class="fas fa-chevron-right menu-arrow"></i>
              </div>
            </router-link>

            <router-link to="/service-bookings" class="menu-item-link text-decoration-none">
              <div class="menu-item" :class="{ active: $route.path === '/service-bookings' }">
                <span><i class="fas fa-calendar-check mr-2"></i> Lịch dịch vụ</span>
                <i class="fas fa-chevron-right menu-arrow"></i>
              </div>
            </router-link>
          </div>
        </aside>

        <section class="page-content">
          <div class="content-head">
            <div>
              <h3 class="content-title">Theo dõi sau bán</h3>
              <p class="content-subtitle mb-0">
                Theo dõi tình trạng chăm sóc và các lần follow-up của bé chó sau khi bàn giao
              </p>
            </div>
          </div>

          <div class="toolbar-box">
            <div class="search-box">
              <i class="fas fa-search"></i>
              <input
                v-model="searchText"
                type="text"
                placeholder="Tìm theo tên chó hoặc mã chó"
              />
            </div>

            <button class="refresh-btn" @click="fetchMyRecords">
              <i class="fas fa-sync-alt mr-1"></i> Làm mới
            </button>
          </div>

          <div v-if="loading" class="empty-panel">
            <i class="fas fa-spinner fa-spin empty-icon"></i>
            <p>Đang tải hồ sơ theo dõi sau bán...</p>
          </div>

          <div v-else-if="filteredRecords.length === 0" class="empty-panel">
            <i class="fas fa-heartbeat empty-icon"></i>
            <p>Hiện chưa có hồ sơ theo dõi sau bán nào</p>
          </div>

          <div v-else class="record-grid">
            <div
              v-for="item in filteredRecords"
              :key="item._id || item.id"
              class="record-card"
            >
              <div class="record-image-wrap">
                <img :src="getDogImage(item)" alt="dog" class="record-image" />
                <span class="record-status" :class="getStatusClass(item.currentStatus)">
                  {{ item.currentStatus || "---" }}
                </span>
              </div>

              <div class="record-body">
                <div class="record-title">
                  {{ item.dogId?.name || "Bé cún" }}
                </div>
                <div class="record-code">
                  {{ item.dogId?.maCho || "---" }}
                </div>

                <div class="record-info-list">
                  <div class="record-info-item">
                    <span class="label">Ngày bàn giao</span>
                    <span class="value">{{ formatDate(item.handoverDate) }}</span>
                  </div>

                  <div class="record-info-item">
                    <span class="label">Tình trạng bàn giao</span>
                    <span class="value">{{ item.handoverCondition || "---" }}</span>
                  </div>

                  <div class="record-info-item">
                    <span class="label">Ngày kiểm tra tiếp theo</span>
                    <span class="value">{{ formatDate(item.nextCheckDate) }}</span>
                  </div>

                  <div class="record-info-item">
                    <span class="label">Số lần follow-up</span>
                    <span class="value">{{ item.followUps?.length || 0 }}</span>
                  </div>
                </div>

                <div class="record-note">
                  <strong>Ghi chú ban đầu:</strong>
                  {{ item.initialCareNote || "Không có" }}
                </div>

                <div class="record-actions">
                  <button
                    class="btn btn-outline-primary btn-sm"
                    @click="openDetail(item)"
                  >
                    <i class="fas fa-eye mr-1"></i> Xem chi tiết
                  </button>

                  <router-link
                    to="/my-dog-reminders"
                    class="btn btn-outline-info btn-sm text-decoration-none"
                  >
                    <i class="fas fa-bell mr-1"></i> Lịch nhắc
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div
        v-if="selectedRecord"
        class="modal fade show d-block"
        tabindex="-1"
        style="background: rgba(0, 0, 0, 0.45);"
      >
        <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div class="modal-content border-0 shadow">
            <div class="modal-header modal-head-custom">
              <h5 class="modal-title mb-0">
                <i class="fas fa-heartbeat mr-2"></i>Chi tiết theo dõi sau bán
              </h5>
              <button type="button" class="close text-white" @click="closeDetail">
                <span>&times;</span>
              </button>
            </div>

            <div class="modal-body">
              <p><strong>Bé chó:</strong> {{ selectedRecord.dogId?.name || "---" }}</p>
              <p><strong>Mã chó:</strong> {{ selectedRecord.dogId?.maCho || "---" }}</p>
              <p><strong>Ngày bàn giao:</strong> {{ formatDate(selectedRecord.handoverDate) }}</p>
              <p><strong>Tình trạng bàn giao:</strong> {{ selectedRecord.handoverCondition || "---" }}</p>
              <p><strong>Ghi chú ban đầu:</strong> {{ selectedRecord.initialCareNote || "---" }}</p>
              <p><strong>Trạng thái hiện tại:</strong> {{ selectedRecord.currentStatus || "---" }}</p>
              <p><strong>Ngày kiểm tra tiếp theo:</strong> {{ formatDate(selectedRecord.nextCheckDate) }}</p>
              <p><strong>Ghi chú quản trị:</strong> {{ selectedRecord.adminNote || "---" }}</p>

              <hr />
              <h6 class="font-weight-bold text-success">Lịch sử follow-up</h6>

              <div
                v-if="selectedRecord.followUps && selectedRecord.followUps.length > 0"
              >
                <div
                  v-for="(follow, index) in selectedRecord.followUps"
                  :key="index"
                  class="follow-item"
                >
                  <div><strong>Ngày theo dõi:</strong> {{ formatDate(follow.followUpDate) }}</div>
                  <div><strong>Tình trạng:</strong> {{ follow.condition || "---" }}</div>
                  <div><strong>Ăn uống:</strong> {{ follow.appetiteStatus || "---" }}</div>
                  <div><strong>Vận động:</strong> {{ follow.activityStatus || "---" }}</div>
                  <div><strong>Ghi chú:</strong> {{ follow.note || "---" }}</div>
                </div>
              </div>

              <div v-else class="text-muted">
                Chưa có lần follow-up nào.
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn btn-secondary" @click="closeDetail">Đóng</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DogCareRecordService from "@/services/dogCareRecord.service";

export default {
  name: "CustomerDogCareRecord",

  data() {
    return {
      currentUser: null,
      loading: false,
      searchText: "",
      records: [],
      selectedRecord: null,
    };
  },

  computed: {
    filteredRecords() {
      return this.records.filter((item) => {
        const keyword = (this.searchText || "").toLowerCase();
        const dogName = item.dogId?.name ? item.dogId.name.toLowerCase() : "";
        const dogCode = item.dogId?.maCho ? item.dogId.maCho.toLowerCase() : "";
        return dogName.includes(keyword) || dogCode.includes(keyword);
      });
    },
  },

  methods: {
    getAvatarText() {
      const name = this.currentUser?.fullName || this.currentUser?.username || "KH";
      return name
        .split(" ")
        .map((item) => item[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();
    },

    async fetchMyRecords() {
      try {
        this.loading = true;
        this.records = await DogCareRecordService.getMyRecords();
      } catch (error) {
        console.error("Lỗi tải hồ sơ theo dõi sau bán:", error);
        alert(
          "Không thể tải hồ sơ theo dõi sau bán: " +
            (error.response?.data?.message || error.message)
        );
      } finally {
        this.loading = false;
      }
    },

    getDogImage(item) {
      if (item?.dogId?.image) {
        return "http://localhost:3000" + item.dogId.image;
      }
      return "https://via.placeholder.com/500x320";
    },

    getStatusClass(status) {
      if (status === "Đang theo dõi") return "status-tracking";
      if (status === "Ổn định") return "status-stable";
      if (status === "Cần tái khám") return "status-warning";
      if (status === "Đã kết thúc theo dõi") return "status-done";
      return "status-default";
    },

    formatDate(date) {
      if (!date) return "---";
      return new Date(date).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },

    openDetail(item) {
      this.selectedRecord = item;
    },

    closeDetail() {
      this.selectedRecord = null;
    },
  },

  async mounted() {
    const userData = localStorage.getItem("user");

    if (!userData) {
      alert("Vui lòng đăng nhập để xem theo dõi sau bán.");
      this.$router.push("/login");
      return;
    }

    this.currentUser = JSON.parse(userData);
    await this.fetchMyRecords();
  },
};
</script>

<style scoped>
.customer-care-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #faf7fc 0%, #f4eef9 100%);
}

.page-container {
  max-width: 1420px;
  padding-left: 24px;
  padding-right: 24px;
}

.page-layout {
  display: grid;
  grid-template-columns: 290px minmax(0, 1fr);
  gap: 22px;
  align-items: start;
}

.account-card,
.sidebar-menu,
.page-content,
.record-card {
  background: #ffffff;
  border: 1px solid #eee2f7;
  border-radius: 20px;
  box-shadow: 0 10px 24px rgba(106, 27, 154, 0.06);
}

.account-card {
  padding: 20px;
  margin-bottom: 16px;
}

.account-top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.account-info {
  min-width: 0;
}

.account-name {
  margin: 0;
  font-weight: 800;
  color: #2f1b44;
  font-size: 1.05rem;
  line-height: 1.35;
}

.account-email {
  color: #7b7287;
  font-size: 0.9rem;
  margin-top: 4px;
  word-break: break-word;
}

.account-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6a1b9a, #4a148c);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.95rem;
  flex-shrink: 0;
}

.account-note {
  margin-top: 14px;
  color: #746a80;
  font-size: 0.91rem;
  line-height: 1.7;
}

.sidebar-menu {
  overflow: hidden;
}

.menu-item-link {
  display: block;
  color: inherit;
}

.menu-item {
  padding: 16px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  color: #3e3550;
  border-bottom: 1px solid #f2ebf8;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:hover {
  background: #fbf8fe;
}

.menu-item span {
  display: flex;
  align-items: center;
  min-width: 0;
}

.menu-arrow {
  color: #8c7ea5;
  font-size: 0.82rem;
}

.menu-item.active {
  background: #f3e8ff;
  color: #6a1b9a;
  font-weight: 800;
}

.menu-item.active .menu-arrow {
  color: #6a1b9a;
}

.page-content {
  padding: 22px;
  min-width: 0;
}

.content-head {
  margin-bottom: 12px;
}

.content-title {
  margin: 0 0 4px;
  font-size: 1.7rem;
  font-weight: 900;
  color: #2f1b44;
  line-height: 1.15;
}

.content-subtitle {
  color: #7b7287;
  font-size: 0.92rem;
}

.toolbar-box {
  display: grid;
  grid-template-columns: 1fr 120px;
  gap: 12px;
  align-items: center;
  margin-bottom: 18px;
}

.search-box {
  position: relative;
}

.search-box i {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #8b7fa0;
  font-size: 0.95rem;
  pointer-events: none;
}

.search-box input {
  width: 100%;
  height: 46px;
  border: 1px solid #dfd3ec;
  border-radius: 14px;
  padding: 0 16px 0 40px;
  outline: none;
  font-size: 0.94rem;
  background: #fff;
  color: #3b3150;
  transition: all 0.2s ease;
}

.search-box input:focus {
  border-color: #7b3fc8;
  box-shadow: 0 0 0 3px rgba(123, 63, 200, 0.08);
}

.refresh-btn {
  border: none;
  background: linear-gradient(135deg, #6a1b9a, #4a148c);
  color: #fff;
  height: 46px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 0.92rem;
  transition: all 0.2s ease;
}

.empty-panel {
  background: #fff;
  border: 1px solid #eee2f7;
  border-radius: 16px;
  min-height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: #7a708a;
}

.empty-icon {
  font-size: 2.6rem;
  margin-bottom: 12px;
  color: #cfbfdc;
}

.record-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.record-card {
  overflow: hidden;
}

.record-image-wrap {
  position: relative;
  height: 220px;
  background: #f8f4fc;
}

.record-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.record-status {
  position: absolute;
  top: 14px;
  right: 14px;
  padding: 7px 12px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 800;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.record-body {
  padding: 18px;
}

.record-title {
  font-size: 1.15rem;
  font-weight: 900;
  color: #2f1b44;
}

.record-code {
  margin-top: 4px;
  color: #8b7fa0;
  font-size: 0.88rem;
  font-weight: 700;
}

.record-info-list {
  margin-top: 16px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.record-info-item {
  background: #faf7fd;
  border: 1px solid #efe6f7;
  border-radius: 14px;
  padding: 12px;
}

.record-info-item .label {
  display: block;
  color: #8a7da0;
  font-size: 0.82rem;
  margin-bottom: 5px;
}

.record-info-item .value {
  display: block;
  color: #2f1b44;
  font-size: 0.92rem;
  font-weight: 800;
  line-height: 1.35;
}

.record-note {
  margin-top: 16px;
  color: #4b5563;
  line-height: 1.6;
}

.record-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 18px;
}

.follow-item {
  border: 1px solid #eee2f7;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 10px;
  background: #faf7fd;
}

.modal-head-custom {
  background: linear-gradient(135deg, #198754, #157347);
  color: #fff;
}

.status-tracking {
  background: #efe7ff;
  color: #6a1b9a;
}

.status-stable {
  background: #e7f8ee;
  color: #15803d;
}

.status-warning {
  background: #fff3d8;
  color: #b7791f;
}

.status-done {
  background: #e5e7eb;
  color: #374151;
}

.status-default {
  background: #f3f4f6;
  color: #4b5563;
}

@media (max-width: 991.98px) {
  .page-layout {
    grid-template-columns: 1fr;
  }

  .toolbar-box {
    grid-template-columns: 1fr;
  }

  .record-grid {
    grid-template-columns: 1fr;
  }

  .page-container {
    padding-left: 16px;
    padding-right: 16px;
  }
}

@media (max-width: 575.98px) {
  .record-info-list {
    grid-template-columns: 1fr;
  }

  .record-actions {
    flex-direction: column;
  }
}
</style>