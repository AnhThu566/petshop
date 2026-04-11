<template>
  <div
    class="sidebar bg-dark text-white p-3 shadow"
    style="width: 260px; min-height: 100vh;"
  >
    <div class="text-center mb-4 mt-2 border-bottom border-secondary pb-3">
      <h4 class="text-warning font-weight-bold mb-0">
        <i class="fas fa-paw"></i> PetShop
      </h4>
      <small class="text-muted">Quản trị viên</small>
    </div>

    <ul class="nav flex-column">
      <p
        class="text-muted text-uppercase font-weight-bold mb-2 mt-3"
        style="font-size: 0.8rem;"
      >
        Quản lý hệ thống
      </p>

      <li class="nav-item mb-2">
        <router-link
          to="/admin/dashboard"
          class="nav-link text-white rounded menu-item"
          active-class="bg-primary"
        >
          <i class="fas fa-chart-line mr-2 w-20"></i>
          Bảng Điều Khiển
        </router-link>
      </li>

      <li class="nav-item mb-2">
        <router-link
          to="/admin/dog"
          class="nav-link text-white rounded menu-item"
          active-class="bg-primary"
        >
          <i class="fas fa-check-circle mr-2 w-20"></i>
          Duyệt Thú Cưng
        </router-link>
      </li>

      <li class="nav-item mb-2">
        <router-link
          :to="{ name: 'admin-customer' }"
          class="nav-link text-white rounded menu-item"
          active-class="bg-danger"
        >
          <i class="fas fa-users mr-2 w-20"></i>
          Quản Lý Khách Hàng
        </router-link>
      </li>

      <li class="nav-item mb-2">
        <router-link
          :to="{ name: 'admin-farm' }"
          class="nav-link text-white rounded menu-item"
          active-class="bg-success"
        >
          <i class="fas fa-house-user mr-2 w-20"></i>
          Quản Lý Trang Trại
        </router-link>
      </li>

      <li class="nav-item mb-2">
        <router-link
          to="/admin/breed"
          class="nav-link text-white rounded menu-item"
          active-class="bg-info"
        >
          <i class="fas fa-dna mr-2 w-20"></i>
          Quản Lý Giống Chó
        </router-link>
      </li>

      <li class="nav-item mb-2">
        <router-link
          to="/admin/vaccine"
          class="nav-link text-white rounded menu-item"
          active-class="bg-warning"
        >
          <i class="fas fa-syringe mr-2 w-20"></i>
          Quản Lý Vaccine
        </router-link>
      </li>

      <li class="nav-item mb-2">
        <router-link
          to="/admin/orders"
          class="nav-link text-white rounded menu-item"
          active-class="bg-warning"
        >
          <i
            class="fas fa-file-invoice-dollar mr-2 w-20"
            style="color: #ff9800;"
          ></i>
          <span>Quản lý Đặt cọc</span>
        </router-link>
      </li>

      <li class="nav-item mb-2">
        <router-link
          to="/admin/accessory"
          class="nav-link text-white rounded menu-item"
          active-class="bg-warning"
        >
          <i
            class="fas fa-box-open mr-2 w-20"
            style="color: #ff9800;"
          ></i>
          <span>Quản lý Phụ kiện</span>
        </router-link>
      </li>

      <li class="nav-item mb-2">
        <router-link
          to="/admin/accessory-category"
          class="nav-link text-white rounded menu-item"
          active-class="bg-warning"
        >
          <i
            class="fas fa-tags mr-2 w-20"
            style="color: #ff9800;"
          ></i>
          <span>Loại Phụ kiện</span>
        </router-link>
      </li>

      <li class="nav-item mb-2">
        <router-link
          to="/admin/services"
          class="nav-link text-white rounded menu-item"
          active-class="bg-warning"
        >
          <i
            class="fas fa-concierge-bell mr-2 w-20"
            style="color: #ff9800;"
          ></i>
          <span>Quản lý Dịch vụ</span>
        </router-link>
      </li>

      <li class="nav-item mb-2">
        <router-link
          to="/admin/service-category"
          class="nav-link text-white rounded menu-item"
          active-class="bg-warning"
        >
          <i
            class="fas fa-th-list mr-2 w-20"
            style="color: #ff9800;"
          ></i>
          <span>Loại Dịch vụ</span>
        </router-link>
      </li>

      <li class="nav-item mb-2">
        <router-link
          to="/admin/service-bookings"
          class="nav-link text-white rounded menu-item"
          active-class="bg-warning"
        >
          <i
            class="fas fa-calendar-check mr-2 w-20"
            style="color: #ff9800;"
          ></i>
          <span>Quản lý Đặt lịch dịch vụ</span>
        </router-link>
      </li>

      <li class="nav-item mb-2">
        <router-link
          to="/admin/accessory-orders"
          class="nav-link text-white rounded menu-item"
          active-class="bg-warning"
        >
          <i
            class="fas fa-box mr-2 w-20"
            style="color: #ff9800;"
          ></i>
          <span>Quản lý Đơn phụ kiện</span>
        </router-link>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.menu-item:hover {
  background-color: #495057;
  transition: 0.3s;
}

.w-20 {
  width: 25px;
  text-align: center;
}

.nav-link i {
  display: inline-block;
}
</style>