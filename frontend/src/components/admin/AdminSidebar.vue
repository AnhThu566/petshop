<template>
  <div class="admin-sidebar">
    <div class="sidebar-brand">
      <div class="brand-icon">
        <i class="fas fa-paw"></i>
      </div>
      <div class="brand-text">
        <h4>PetShop Admin</h4>
        <small>Quản trị hệ thống</small>
      </div>
    </div>

    <div class="menu-group">
      <p class="group-title">Tổng quan</p>

      <router-link
        to="/admin/dashboard"
        class="nav-link menu-item"
        active-class="menu-item-active"
      >
        <i class="fas fa-chart-line"></i>
        <span>Bảng điều khiển</span>
      </router-link>
    </div>

    <div class="menu-group">
      <p class="group-title">Quản lý chó</p>

      <router-link
        to="/admin/dog"
        class="nav-link menu-item"
        active-class="menu-item-active"
      >
        <i class="fas fa-dog"></i>
        <span>Duyệt thú cưng</span>
      </router-link>

      <router-link
        to="/admin/breed"
        class="nav-link menu-item"
        active-class="menu-item-active"
      >
        <i class="fas fa-dna"></i>
        <span>Quản lý giống chó</span>
      </router-link>

      <router-link
        to="/admin/vaccine"
        class="nav-link menu-item"
        active-class="menu-item-active"
      >
        <i class="fas fa-syringe"></i>
        <span>Quản lý Vaccine</span>
      </router-link>

      <router-link
        to="/admin/orders"
        class="nav-link menu-item"
        active-class="menu-item-active"
      >
        <i class="fas fa-file-invoice-dollar"></i>
        <span>Quản lý đặt cọc</span>
      </router-link>
    </div>

    <div class="menu-group">
      <p class="group-title">Người dùng</p>

      <router-link
        :to="{ name: 'admin-customer' }"
        class="nav-link menu-item"
        active-class="menu-item-active"
      >
        <i class="fas fa-users"></i>
        <span>Quản lý khách hàng</span>
      </router-link>

      <router-link
        :to="{ name: 'admin-farm' }"
        class="nav-link menu-item"
        active-class="menu-item-active"
      >
        <i class="fas fa-house-user"></i>
        <span>Quản lý trang trại</span>
      </router-link>
    </div>

    <div class="menu-group">
      <p class="group-title">Phụ kiện</p>

      <router-link
        to="/admin/accessory-category"
        class="nav-link menu-item"
        active-class="menu-item-active"
      >
        <i class="fas fa-tags"></i>
        <span>Loại phụ kiện</span>
      </router-link>

      <router-link
        to="/admin/accessory"
        class="nav-link menu-item"
        active-class="menu-item-active"
      >
        <i class="fas fa-box-open"></i>
        <span>Quản lý phụ kiện</span>
      </router-link>

      <router-link
        to="/admin/accessory-orders"
        class="nav-link menu-item"
        active-class="menu-item-active"
      >
        <i class="fas fa-box"></i>
        <span>Quản lý đơn phụ kiện</span>
      </router-link>
    </div>

    <div class="menu-group">
      <p class="group-title">Dịch vụ</p>

      <router-link
        to="/admin/service-category"
        class="nav-link menu-item"
        active-class="menu-item-active"
      >
        <i class="fas fa-th-list"></i>
        <span>Loại dịch vụ</span>
      </router-link>

      <router-link
        to="/admin/services"
        class="nav-link menu-item"
        active-class="menu-item-active"
      >
        <i class="fas fa-concierge-bell"></i>
        <span>Quản lý dịch vụ</span>
      </router-link>

      <router-link
        to="/admin/service-bookings"
        class="nav-link menu-item"
        active-class="menu-item-active"
      >
        <i class="fas fa-calendar-check"></i>
        <span>Quản lý đặt lịch dịch vụ</span>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.admin-sidebar {
  width: 280px;
  min-height: 100vh;
  padding: 20px 16px;
  background: linear-gradient(180deg, #111827 0%, #1f2937 100%);
  color: #fff;
  box-shadow: 8px 0 24px rgba(15, 23, 42, 0.18);
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 10px 18px;
  margin-bottom: 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.brand-icon {
  width: 50px;
  height: 50px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #fff;
  font-size: 1.35rem;
  flex-shrink: 0;
}

.brand-text h4 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 800;
  color: #f9fafb;
}

.brand-text small {
  color: #9ca3af;
  font-size: 0.9rem;
}

.menu-group + .menu-group {
  margin-top: 18px;
}

.group-title {
  margin: 0 0 10px;
  padding: 0 10px;
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #9ca3af;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 46px;
  margin-bottom: 8px;
  padding: 10px 12px;
  border-radius: 14px;
  color: #f3f4f6;
  font-size: 1rem;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.22s ease;
}

.menu-item i {
  width: 22px;
  text-align: center;
  font-size: 1rem;
  color: #fbbf24;
  flex-shrink: 0;
}

.menu-item span {
  line-height: 1.2;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
  transform: translateX(2px);
}

.menu-item-active {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #ffffff !important;
  box-shadow: 0 10px 18px rgba(37, 99, 235, 0.24);
}

.menu-item-active i {
  color: #ffffff;
}

@media (max-width: 991.98px) {
  .admin-sidebar {
    width: 100%;
    min-height: auto;
    border-radius: 20px;
  }
}
</style>