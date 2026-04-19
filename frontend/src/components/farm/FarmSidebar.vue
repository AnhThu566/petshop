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
        ĐĂNG XUẤT
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
  width: 270px;
  min-height: 100vh;
  padding: 20px 16px;
  background: linear-gradient(180deg, #1f8a5b 0%, #18734c 55%, #14603f 100%);
  color: #ffffff;
  box-shadow: 8px 0 24px rgba(20, 96, 63, 0.16);
}

.sidebar-top {
  padding-top: 8px;
  padding-bottom: 10px;
}

.logo-circle {
  width: 70px;
  height: 70px;
  margin: 0 auto 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.14);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.logo-circle i {
  font-size: 28px;
  color: #ffffff;
}

.sidebar-title {
  font-size: 1.05rem;
  font-weight: 800;
  margin-bottom: 6px;
  letter-spacing: 0.3px;
  white-space: nowrap;
}

.sidebar-subtitle {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.84);
  line-height: 1.5;
}

.sidebar-divider {
  height: 1px;
  width: 100%;
  background: rgba(255, 255, 255, 0.18);
  margin: 14px 0 18px;
}

.sidebar-menu {
  gap: 2px;
}

.sidebar-link {
  display: flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.94);
  border-radius: 12px;
  padding: 11px 14px;
  font-weight: 600;
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
  width: 22px;
  min-width: 22px;
  text-align: center;
  margin-right: 10px;
  font-size: 15px;
}

.menu-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
  flex: 1;
  font-size: 0.95rem;
}

.active-menu {
  background: #ffffff !important;
  color: #18734c !important;
  font-weight: 800;
  box-shadow: 0 10px 20px rgba(10, 50, 33, 0.14);
}

.active-menu .menu-icon,
.active-menu .menu-text {
  color: #18734c;
}

.sidebar-footer {
  margin-top: auto;
  padding-top: 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.18);
}

.btn-logout {
  border-radius: 12px;
  padding: 11px 14px;
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.24);
  transition: all 0.25s ease;
}

.btn-logout:hover {
  background: #ffffff;
  color: #18734c;
}

@media (max-width: 1199.98px) {
  .farm-sidebar {
    width: 250px;
  }

  .sidebar-title {
    font-size: 1rem;
  }

  .menu-text {
    font-size: 0.92rem;
  }
}
</style>