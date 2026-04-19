<template>
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
        Quản lý hồ sơ, lịch sử đặt cọc, hồ sơ chó đã mua, lịch nhắc chăm sóc,
        đơn phụ kiện và lịch dịch vụ tại đây.
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

      <div class="menu-item static-item">
        <span><i class="fas fa-phone-alt mr-2"></i> Liên hệ</span>
        <small>0379889868</small>
      </div>

      <div class="menu-item static-item">
        <span><i class="fas fa-globe mr-2"></i> Trang web</span>
        <small>petshop.vn</small>
      </div>
    </div>
  </aside>
</template>

<script>
export default {
  name: "CustomerAccountSidebar",

  props: {
    currentUser: {
      type: Object,
      default: null,
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
  },
};
</script>

<style scoped>
.account-card,
.sidebar-menu {
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

.static-item {
  cursor: default;
}

.static-item:hover {
  background: #ffffff;
}

@media (max-width: 991.98px) {
  .account-card {
    margin-bottom: 14px;
  }
}
</style>