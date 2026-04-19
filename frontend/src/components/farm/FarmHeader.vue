<template>
  <header class="farm-header px-4 py-3 d-flex justify-content-between align-items-center flex-wrap">
    <div class="d-flex align-items-center mb-2 mb-md-0 header-left">
      <div class="header-icon-box shadow-sm mr-3">
        <i class="fas fa-tractor"></i>
      </div>

      <div>
        <h5 class="mb-1 header-title">KHU VỰC TRANG TRẠI</h5>
        <div class="header-subtitle" v-if="displayName">
          Xin chào, <strong>{{ displayName }}</strong>
        </div>
      </div>
    </div>

    <div class="d-flex align-items-center flex-wrap header-actions">
      <router-link
        to="/farm/dashboard"
        class="btn btn-outline-success btn-sm action-btn mr-2 mb-2 mb-md-0"
      >
        <i class="fas fa-list mr-1"></i>
        Danh sách chó
      </router-link>

      <router-link
        to="/farm/add-dog"
        class="btn btn-success btn-sm action-btn mr-3 mb-2 mb-md-0"
      >
        <i class="fas fa-plus-circle mr-1"></i>
        Gửi hồ sơ chó
      </router-link>

      <div class="header-user-dropdown" ref="dropdownRef">
        <button
          type="button"
          class="user-trigger"
          @click="toggleDropdown"
        >
          <div class="user-avatar shadow-sm">
            <img
              v-if="displayAvatar"
              :src="displayAvatar"
              alt="Avatar"
              class="avatar-img"
            />
            <i v-else class="fas fa-user"></i>
          </div>

          <div class="user-text d-none d-md-block">
            <div class="user-name">
              {{ displayName || "Chủ trại" }}
            </div>
            <div class="user-role">Tài khoản trang trại</div>
          </div>

          <i class="fas fa-chevron-down dropdown-arrow"></i>
        </button>

        <div v-if="showDropdown" class="dropdown-menu-custom">
          <router-link to="/farm/profile" class="dropdown-item-custom" @click="closeDropdown">
            <i class="fas fa-id-card mr-2"></i>
            Hồ sơ của tôi
          </router-link>

          <button type="button" class="dropdown-item-custom text-danger" @click="logout">
            <i class="fas fa-sign-out-alt mr-2"></i>
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: "FarmHeader",

  data() {
    return {
      currentUser: null,
      currentFarm: null,
      showDropdown: false,
    };
  },

  computed: {
    displayName() {
      return (
        this.currentFarm?.name ||
        this.currentUser?.fullName ||
        this.currentUser?.username ||
        ""
      );
    },

    displayAvatar() {
      const image =
        this.currentFarm?.image ||
        this.currentFarm?.avatar ||
        this.currentFarm?.logo ||
        this.currentUser?.avatar ||
        "";

      if (!image) return "";

      if (String(image).startsWith("http")) return image;
      return `http://localhost:3000${image}`;
    },
  },

  created() {
    this.loadLocalData();
    window.addEventListener("auth-changed", this.loadLocalData);
    document.addEventListener("click", this.handleClickOutside);
  },

  beforeUnmount() {
    window.removeEventListener("auth-changed", this.loadLocalData);
    document.removeEventListener("click", this.handleClickOutside);
  },

  methods: {
    loadLocalData() {
      const userData = localStorage.getItem("user");
      const farmData = localStorage.getItem("farm");

      this.currentUser = userData ? JSON.parse(userData) : null;
      this.currentFarm = farmData ? JSON.parse(farmData) : null;
    },

    toggleDropdown() {
      this.showDropdown = !this.showDropdown;
    },

    closeDropdown() {
      this.showDropdown = false;
    },

    handleClickOutside(event) {
      if (!this.$refs.dropdownRef) return;
      if (!this.$refs.dropdownRef.contains(event.target)) {
        this.showDropdown = false;
      }
    },

    logout() {
      this.showDropdown = false;

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
.farm-header {
  background: #ffffff;
  border-bottom: 1px solid #e9ecef;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.header-left {
  min-width: 280px;
}

.header-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #1f8a5b, #18734c);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.header-title {
  font-size: 1.08rem;
  font-weight: 800;
  color: #18734c;
  letter-spacing: 0.2px;
  margin: 0;
  white-space: nowrap;
}

.header-subtitle {
  font-size: 0.88rem;
  color: #6c757d;
  line-height: 1.4;
}

.action-btn {
  min-height: 36px;
  border-radius: 10px;
  font-weight: 700;
  padding: 6px 14px;
  white-space: nowrap;
}

.header-user-dropdown {
  position: relative;
}

.user-trigger {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 46px;
  padding: 6px 12px;
  border: 1px solid #e9ecef;
  background: #fff;
  border-radius: 14px;
  cursor: pointer;
  transition: 0.2s ease;
}

.user-trigger:hover {
  background: #f8fbf9;
  border-color: #d7e8dd;
}

.user-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #eaf6ef;
  color: #18734c;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-size: 14px;
  flex-shrink: 0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-text {
  text-align: left;
  line-height: 1.2;
}

.user-name {
  font-size: 0.92rem;
  font-weight: 700;
  color: #212529;
  white-space: nowrap;
}

.user-role {
  font-size: 0.8rem;
  color: #6c757d;
  white-space: nowrap;
}

.dropdown-arrow {
  color: #6c757d;
  font-size: 12px;
}

.dropdown-menu-custom {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 190px;
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
  z-index: 1000;
  padding: 8px;
}

.dropdown-item-custom {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border: none;
  background: transparent;
  border-radius: 10px;
  color: #212529;
  font-weight: 600;
  text-decoration: none;
  text-align: left;
}

.dropdown-item-custom:hover {
  background: #f6f8fa;
  color: #18734c;
}

@media (max-width: 991.98px) {
  .farm-header {
    padding-left: 16px !important;
    padding-right: 16px !important;
  }

  .header-title {
    font-size: 1rem;
  }
}

@media (max-width: 575.98px) {
  .header-actions {
    width: 100%;
    margin-top: 10px;
    gap: 8px;
  }

  .action-btn {
    margin-right: 0 !important;
  }

  .user-trigger {
    width: 100%;
    justify-content: space-between;
  }
}
</style>