<template>
  <div class="farm-sidebar d-flex flex-column">
    <div class="text-center sidebar-top">
      <div class="logo-circle shadow-sm">
        <i class="fas fa-tractor"></i>
      </div>

      <h5 class="sidebar-title">TRANG TRẠI ĐỐI TÁC</h5>

      <p class="sidebar-subtitle mb-0" v-if="currentUser">
        Xin chào,
        <span class="font-weight-bold">
          {{ currentUser.fullName || currentUser.username || "Bạn" }}
        </span>
      </p>
    </div>

    <div class="sidebar-divider"></div>

    <div class="sidebar-group-title">Quản lý hồ sơ</div>

    <ul class="nav flex-column w-100 mb-auto sidebar-menu">
      <li class="nav-item mb-2">
        <router-link
          to="/farm/dashboard"
          class="nav-link sidebar-link"
          active-class="active-menu"
        >
          <i class="fas fa-dog menu-icon"></i>
          <span class="menu-text">Hồ sơ chó đã cung cấp</span>
        </router-link>
      </li>

      <li class="nav-item mb-2">
        <router-link
          to="/farm/add-dog"
          class="nav-link sidebar-link"
          active-class="active-menu"
        >
          <i class="fas fa-plus-circle menu-icon"></i>
          <span class="menu-text">Cung cấp hồ sơ chó</span>
        </router-link>
      </li>

      <li class="nav-item mb-2">
        <router-link
          to="/farm/profile"
          class="nav-link sidebar-link"
          active-class="active-menu"
        >
          <i class="fas fa-warehouse menu-icon"></i>
          <span class="menu-text">Thông tin trang trại</span>
        </router-link>
      </li>
    </ul>

    <div class="sidebar-footer">
      <button
        class="btn btn-logout w-100 font-weight-bold"
        @click="logout"
      >
        <i class="fas fa-sign-out-alt mr-2"></i>
        Đăng xuất
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "FarmSidebar",

  data() {
    return {
      currentUser: null,
    };
  },

  created() {
    const userData = localStorage.getItem("user");
    if (userData) {
      this.currentUser = JSON.parse(userData);
    }
  },

  methods: {
    logout() {
      if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
        localStorage.removeItem("user");
        localStorage.removeItem("farm");
        localStorage.removeItem("token");
        this.$router.push("/login");
      }
    },
  },
};
</script>

<style scoped>
.farm-sidebar {
  width: 280px;
  min-height: 100vh;
  padding: 22px 16px;
  background: linear-gradient(180deg, #166534 0%, #15803d 52%, #166534 100%);
  color: #ffffff;
  box-shadow: 8px 0 24px rgba(21, 128, 61, 0.18);
}

.sidebar-top {
  padding-top: 8px;
  padding-bottom: 12px;
}

.logo-circle {
  width: 74px;
  height: 74px;
  margin: 0 auto 14px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.14);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.logo-circle i {
  font-size: 30px;
  color: #ffffff;
}

.sidebar-title {
  font-size: 1.18rem;
  font-weight: 800;
  margin-bottom: 6px;
  letter-spacing: 0.3px;
  white-space: nowrap;
}

.sidebar-subtitle {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.86);
  line-height: 1.55;
}

.sidebar-divider {
  height: 1px;
  width: 100%;
  background: rgba(255, 255, 255, 0.18);
  margin: 14px 0 16px;
}

.sidebar-group-title {
  font-size: 0.82rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.7);
  padding: 0 10px;
  margin-bottom: 10px;
}

.sidebar-menu {
  gap: 4px;
}

.sidebar-link {
  display: flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.96);
  border-radius: 14px;
  padding: 12px 14px;
  font-weight: 700;
  transition: all 0.25s ease;
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
}

.sidebar-link:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  transform: translateX(4px);
}

.menu-icon {
  width: 24px;
  min-width: 24px;
  text-align: center;
  margin-right: 10px;
  font-size: 16px;
}

.menu-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
  flex: 1;
  font-size: 1rem;
}

.active-menu {
  background: #ffffff !important;
  color: #166534 !important;
  font-weight: 800;
  box-shadow: 0 10px 20px rgba(10, 50, 33, 0.16);
}

.active-menu .menu-icon,
.active-menu .menu-text {
  color: #166534;
}

.sidebar-footer {
  margin-top: auto;
  padding-top: 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.18);
}

.btn-logout {
  border-radius: 14px;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.24);
  transition: all 0.25s ease;
  font-size: 0.98rem;
}

.btn-logout:hover {
  background: #ffffff;
  color: #166534;
}

@media (max-width: 1199.98px) {
  .farm-sidebar {
    width: 255px;
  }

  .sidebar-title {
    font-size: 1.08rem;
  }

  .menu-text {
    font-size: 0.96rem;
  }
}
</style>