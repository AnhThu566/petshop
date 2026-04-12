<template>
  <div class="my-dogs-page">
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
              Quản lý hồ sơ cá nhân, lịch sử đặt cọc, hồ sơ chó đã mua,
              lịch nhắc chăm sóc, đơn phụ kiện và lịch dịch vụ tại đây.
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

            <router-link to="/my-notifications" class="menu-item-link text-decoration-none">
              <div class="menu-item" :class="{ active: $route.path === '/my-notifications' }">
                <span><i class="fas fa-bell mr-2"></i> Thông báo của tôi</span>
                <i class="fas fa-chevron-right menu-arrow"></i>
              </div>
            </router-link>

            <router-link to="/my-dog-reminders" class="menu-item-link text-decoration-none">
              <div class="menu-item" :class="{ active: $route.path === '/my-dog-reminders' }">
                <span><i class="fas fa-notes-medical mr-2"></i> Lịch nhắc chăm sóc chó</span>
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

            <div class="menu-item">
              <span><i class="fas fa-phone-alt mr-2"></i> Liên hệ</span>
              <small>0379889868</small>
            </div>

            <div class="menu-item">
              <span><i class="fas fa-globe mr-2"></i> Trang web</span>
              <small>petshop.vn</small>
            </div>
          </div>
        </aside>

        <section class="page-content">
          <div class="content-head">
            <div>
              <h3 class="content-title">Hồ sơ chó đã mua</h3>
              <p class="content-subtitle mb-0">
                Theo dõi các bé chó bạn đã nhận thành công từ hệ thống
              </p>
            </div>
          </div>

          <div class="toolbar-box">
            <div class="search-box">
              <i class="fas fa-search"></i>
              <input
                type="text"
                v-model="searchText"
                placeholder="Tìm theo tên chó hoặc mã chó"
              />
            </div>

            <button class="refresh-btn" @click="fetchMyDogs">
              <i class="fas fa-sync-alt mr-1"></i> Làm mới
            </button>
          </div>

          <div v-if="loading" class="empty-panel">
            <i class="fas fa-spinner fa-spin empty-icon"></i>
            <p>Đang tải hồ sơ chó đã mua...</p>
          </div>

          <div v-else-if="filteredDogs.length === 0" class="empty-panel">
            <i class="fas fa-dog empty-icon"></i>
            <p>Bạn chưa có bé chó nào đã hoàn thành mua bán</p>
          </div>

          <div v-else class="dog-grid">
            <div
              v-for="item in filteredDogs"
              :key="getDogId(item)"
              class="dog-card"
            >
              <div class="dog-image-wrap">
                <img :src="getDogImage(item)" alt="dog" class="dog-image" />
                <span class="dog-badge">
                  {{ item.saleStatus || "Đã bán" }}
                </span>
              </div>

              <div class="dog-card-body">
                <div class="dog-name">{{ item.name || "Bé cún" }}</div>
                <div class="dog-code">{{ item.maCho || "---" }}</div>

                <div class="dog-info-list">
                  <div class="dog-info-item">
                    <span class="label">Giống chó</span>
                    <span class="value">{{ item.breedName || "---" }}</span>
                  </div>

                  <div class="dog-info-item">
                    <span class="label">Giới tính</span>
                    <span class="value">{{ item.gender || "---" }}</span>
                  </div>

                  <div class="dog-info-item">
                    <span class="label">Giá mua</span>
                    <span class="value text-danger">{{ formatCurrency(item.price) }}</span>
                  </div>

                  <div class="dog-info-item">
                    <span class="label">Ngày hoàn tất</span>
                    <span class="value">{{ formatDate(item.completedAt) }}</span>
                  </div>

                  <div class="dog-info-item">
                    <span class="label">Sức khỏe tóm tắt</span>
                    <span class="value">{{ item.healthStatus || "Tốt" }}</span>
                  </div>

                  <div class="dog-info-item">
                    <span class="label">Tẩy giun gần nhất</span>
                    <span class="value">{{ formatDateOnly(item.lastDeworming) }}</span>
                  </div>
                </div>

                <div class="dog-card-actions">
                  <button
                    class="btn btn-outline-primary btn-sm"
                    @click="openDetail(item)"
                  >
                    <i class="fas fa-eye mr-1"></i> Chi tiết
                  </button>

                  <router-link
                    to="/my-dog-reminders"
                    class="btn btn-outline-info btn-sm text-decoration-none"
                  >
                    <i class="fas fa-bell mr-1"></i> Lịch nhắc
                  </router-link>

                  <router-link
                    to="/my-notifications"
                    class="btn btn-outline-warning btn-sm text-decoration-none"
                  >
                    <i class="fas fa-bullhorn mr-1"></i> Thông báo
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div
        v-if="selectedDog"
        class="modal fade show d-block"
        tabindex="-1"
        style="background: rgba(0, 0, 0, 0.45);"
      >
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content border-0 shadow">
            <div class="modal-header modal-head-custom">
              <h5 class="modal-title mb-0">
                <i class="fas fa-dog mr-2"></i>Chi tiết hồ sơ chó đã mua
              </h5>
              <button type="button" class="close text-white" @click="closeDetail">
                <span>&times;</span>
              </button>
            </div>

            <div class="modal-body">
              <div class="row">
                <div class="col-md-4 mb-3 text-center">
                  <img
                    :src="getDogImage(selectedDog)"
                    alt="dog"
                    class="rounded shadow-sm"
                    style="width: 100%; max-height: 260px; object-fit: cover;"
                  />
                </div>

                <div class="col-md-8 mb-3">
                  <h5 class="font-weight-bold text-dark">{{ selectedDog.name }}</h5>
                  <p class="mb-1"><strong>Mã chó:</strong> {{ selectedDog.maCho || "---" }}</p>
                  <p class="mb-1"><strong>Giống chó:</strong> {{ selectedDog.breedName || "---" }}</p>
                  <p class="mb-1"><strong>Giới tính:</strong> {{ selectedDog.gender || "---" }}</p>
                  <p class="mb-1"><strong>Ngày mua hoàn tất:</strong> {{ formatDate(selectedDog.completedAt) }}</p>
                  <p class="mb-1"><strong>Giá mua:</strong> {{ formatCurrency(selectedDog.price) }}</p>
                  <p class="mb-1"><strong>Trạng thái bán:</strong> {{ selectedDog.saleStatus || "---" }}</p>
                  <p class="mb-1"><strong>Sức khỏe tóm tắt:</strong> {{ selectedDog.healthStatus || "---" }}</p>
                  <p class="mb-1"><strong>Ngày tẩy giun gần nhất:</strong> {{ formatDateOnly(selectedDog.lastDeworming) }}</p>
                  <p class="mb-1"><strong>Mô tả:</strong> {{ selectedDog.description || "Không có mô tả" }}</p>
                </div>

                <div class="col-12">
                  <div class="alert alert-info mb-0">
                    <strong>Gợi ý:</strong> Bạn có thể theo dõi thêm các lịch chăm sóc và nhắc lịch của bé tại mục
                    <strong>"Lịch nhắc chăm sóc chó"</strong>.
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <router-link
                to="/my-dog-reminders"
                class="btn btn-info text-decoration-none"
              >
                Xem lịch nhắc
              </router-link>
              <button class="btn btn-secondary" @click="closeDetail">Đóng</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import OrderService from "@/services/order.service";

export default {
  name: "CustomerMyDogs",

  data() {
    return {
      currentUser: null,
      loading: false,
      searchText: "",
      dogs: [],
      selectedDog: null,
    };
  },

  computed: {
    filteredDogs() {
      return this.dogs.filter((item) => {
        const keyword = (this.searchText || "").toLowerCase();
        const name = item.name ? item.name.toLowerCase() : "";
        const code = item.maCho ? item.maCho.toLowerCase() : "";

        return name.includes(keyword) || code.includes(keyword);
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

    async fetchMyDogs() {
      try {
        if (!this.currentUser) return;

        this.loading = true;

        const orders = await OrderService.getMyOrders();

        const completedOrders = (orders || []).filter(
          (order) => order.status === "Hoàn thành" && order.dogId
        );

        this.dogs = completedOrders.map((order) => {
          const dog = order.dogId || {};
          return {
            ...dog,
            completedAt: order.updatedAt || order.createdAt,
            orderId: order._id || order.id,
            breedName: dog.breedId?.name || dog.breedName || "---",
          };
        });
      } catch (error) {
        console.error("Lỗi lấy hồ sơ chó đã mua:", error);
        alert(
          "Không thể tải hồ sơ chó đã mua: " +
            (error.response?.data?.message || error.message)
        );
      } finally {
        this.loading = false;
      }
    },

    getDogId(item) {
      return item?._id || item?.id || item?.orderId || Math.random();
    },

    getDogImage(item) {
      if (item?.image) {
        return "http://localhost:3000" + item.image;
      }
      return "https://via.placeholder.com/500x320";
    },

    formatCurrency(value) {
      if (value === null || value === undefined) return "---";
      return Number(value).toLocaleString("vi-VN") + " ₫";
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

    formatDateOnly(date) {
      if (!date) return "---";
      return new Date(date).toLocaleDateString("vi-VN");
    },

    openDetail(item) {
      this.selectedDog = item;
    },

    closeDetail() {
      this.selectedDog = null;
    },
  },

  async mounted() {
    const userData = localStorage.getItem("user");

    if (!userData) {
      alert("Vui lòng đăng nhập để xem hồ sơ chó đã mua.");
      this.$router.push("/login");
      return;
    }

    this.currentUser = JSON.parse(userData);
    await this.fetchMyDogs();
  },
};
</script>

<style scoped>
.my-dogs-page {
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
.dog-card {
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

.menu-item small {
  color: #8c7ea5;
  font-size: 0.87rem;
  white-space: nowrap;
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

.search-box input::placeholder {
  color: #9b90ad;
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

.refresh-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(106, 27, 154, 0.18);
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

.dog-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.dog-card {
  overflow: hidden;
}

.dog-image-wrap {
  position: relative;
  height: 230px;
  background: #f8f4fc;
}

.dog-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dog-badge {
  position: absolute;
  top: 14px;
  right: 14px;
  background: #e7f8ee;
  color: #15803d;
  padding: 7px 12px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 800;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.dog-card-body {
  padding: 18px;
}

.dog-name {
  font-size: 1.15rem;
  font-weight: 900;
  color: #2f1b44;
  line-height: 1.2;
}

.dog-code {
  margin-top: 4px;
  color: #8b7fa0;
  font-size: 0.88rem;
  font-weight: 700;
}

.dog-info-list {
  margin-top: 16px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.dog-info-item {
  background: #faf7fd;
  border: 1px solid #efe6f7;
  border-radius: 14px;
  padding: 12px;
}

.dog-info-item .label {
  display: block;
  color: #8a7da0;
  font-size: 0.82rem;
  margin-bottom: 5px;
}

.dog-info-item .value {
  display: block;
  color: #2f1b44;
  font-size: 0.92rem;
  font-weight: 800;
  line-height: 1.35;
}

.dog-card-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 18px;
}

.modal-head-custom {
  background: linear-gradient(135deg, #6a1b9a, #4a148c);
  color: #fff;
}

.modal {
  overflow-y: auto;
}

@media (max-width: 1199.98px) {
  .content-title {
    font-size: 1.5rem;
  }
}

@media (max-width: 991.98px) {
  .page-layout {
    grid-template-columns: 1fr;
  }

  .toolbar-box {
    grid-template-columns: 1fr;
  }

  .refresh-btn {
    width: 100%;
  }

  .dog-grid {
    grid-template-columns: 1fr;
  }

  .page-container {
    padding-left: 16px;
    padding-right: 16px;
  }

  .content-title {
    font-size: 1.35rem;
  }
}

@media (max-width: 575.98px) {
  .dog-info-list {
    grid-template-columns: 1fr;
  }

  .dog-card-actions {
    flex-direction: column;
  }
}
</style>