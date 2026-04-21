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

    <div class="sidebar-menu">
      <router-link
        to="/admin/dashboard"
        class="nav-link menu-item"
        active-class="menu-item-active"
      >
        <i class="fas fa-chart-line"></i>
        <span>Bảng điều khiển</span>
      </router-link>

      <router-link
        to="/admin/dog"
        class="nav-link menu-item"
        active-class="menu-item-active"
      >
        <i class="fas fa-dog"></i>
        <span>Quản lí hồ sơ chó</span>
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
        <span>Quản lí Vaccine</span>
      </router-link>

      <router-link
        to="/admin/orders"
        class="nav-link menu-item"
        active-class="menu-item-active"
      >
        <i class="fas fa-file-invoice-dollar"></i>
        <span>quản lý đặt cọc</span>
      </router-link>

      <router-link
        :to="{ name: 'admin-customer' }"
        class="nav-link menu-item"
        active-class="menu-item-active"
      >
        <i class="fas fa-users"></i>
        <span>Quản lý Khách hàng</span>
      </router-link>

      <router-link
        :to="{ name: 'admin-farm' }"
        class="nav-link menu-item"
        active-class="menu-item-active"
      >
        <i class="fas fa-house-user"></i>
        <span>Quản lý Trại chó</span>
      </router-link>

      <router-link
        to="/admin/accessory-category"
        class="nav-link menu-item"
        active-class="menu-item-active"
      >
        <i class="fas fa-tags"></i>
        <span>Quản lý loại phụ kiện</span>
      </router-link>

      <router-link
        to="/admin/accessory"
        class="nav-link menu-item"
        active-class="menu-item-active"
      >
        <i class="fas fa-box-open"></i>
        <span>Quản lí danh sách Phụ kiện</span>
      </router-link>

      <router-link
        to="/admin/accessory-orders"
        class="nav-link menu-item"
        active-class="menu-item-active"
      >
        <i class="fas fa-box"></i>
        <span>Quản lý Đơn phụ kiện</span>
      </router-link>

      <router-link
        to="/admin/service-category"
        class="nav-link menu-item"
        active-class="menu-item-active"
      >
        <i class="fas fa-th-list"></i>
        <span>Quản lý Loại dịch vụ</span>
      </router-link>

      <router-link
        to="/admin/services"
        class="nav-link menu-item"
        active-class="menu-item-active"
      >
        <i class="fas fa-concierge-bell"></i>
        <span>Quản lý danh sách Dịch vụ</span>
      </router-link>

      <router-link
        to="/admin/service-bookings"
        class="nav-link menu-item"
        active-class="menu-item-active"
      >
        <i class="fas fa-calendar-check"></i>
        <span>Quản lý Lịch dịch vụ</span>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.admin-sidebar {
  width: 340px;
  min-width: 340px;
  min-height: 100vh;
  padding: 18px 14px;
  background: linear-gradient(180deg, #0f172a 0%, #162033 48%, #1e293b 100%);
  color: #fff;
  box-shadow: 10px 0 28px rgba(15, 23, 42, 0.22);
  display: flex;
  flex-direction: column;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 12px 18px;
  margin-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.brand-icon {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #ffffff;
  font-size: 1.35rem;
  flex-shrink: 0;
  box-shadow: 0 10px 22px rgba(245, 158, 11, 0.22);
}

.brand-text h4 {
  margin: 0;
  font-size: 1.22rem;
  font-weight: 800;
  color: #f8fafc;
  line-height: 1.2;
}

.brand-text small {
  display: block;
  margin-top: 4px;
  color: #94a3b8;
  font-size: 0.88rem;
}

.sidebar-menu {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 50px;
  padding: 11px 12px;
  border-radius: 14px;
  color: #e2e8f0;
  font-size: 0.98rem;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.22s ease;
  background: transparent;
}

.menu-item i {
  width: 20px;
  text-align: center;
  font-size: 0.98rem;
  color: #f8b84e;
  flex-shrink: 0;
  transition: all 0.22s ease;
}

.menu-item span {
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.07);
  color: #ffffff;
  transform: translateX(2px);
}

.menu-item:hover i {
  color: #ffffff;
}

.menu-item-active {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #ffffff !important;
  box-shadow: 0 12px 22px rgba(37, 99, 235, 0.24);
}

.menu-item-active i {
  color: #ffffff;
}

@media (max-width: 991.98px) {
  .admin-sidebar {
    width: 100%;
    min-width: 100%;
    min-height: auto;
    border-radius: 18px;
  }
}
</style>