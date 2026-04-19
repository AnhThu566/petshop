<template>
  <header class="customer-header">
    <div class="header-top">
      <div class="container-fluid custom-container px-3">
        <div class="top-inner">
          <router-link to="/" class="brand-logo text-decoration-none">
            <div class="brand-logo-box">
              <div class="brand-logo-icon">
                <i class="fas fa-paw"></i>
              </div>
              <div class="brand-logo-content">
                <div class="brand-logo-text">PETSHOP</div>
                <div class="brand-logo-sub">Chó cảnh • Phụ kiện • Dịch vụ</div>
              </div>
            </div>
          </router-link>

          <div class="top-search">
            <div class="top-search-box">
              <input
                type="text"
                class="top-search-input"
                placeholder="Tìm chó cảnh, phụ kiện, dịch vụ..."
              />
              <button class="top-search-btn" type="button">
                <i class="fas fa-search"></i>
              </button>
            </div>
          </div>

          <div class="top-actions">
            <router-link
              to="/cart"
              class="top-cart text-decoration-none"
              title="Giỏ hàng"
            >
              <i class="fas fa-shopping-cart"></i>
            </router-link>

            <router-link
              v-if="isLoggedIn && currentUser && currentUser.role === 'customer'"
              to="/my-notifications"
              class="top-notification text-decoration-none"
              title="Thông báo của tôi"
            >
              <i class="fas fa-bell"></i>
              <span v-if="unreadNotificationCount > 0" class="notification-badge">
                {{ unreadNotificationCount > 99 ? "99+" : unreadNotificationCount }}
              </span>
            </router-link>

            <template v-if="!isLoggedIn || !currentUser">
              <router-link
                to="/login"
                class="top-auth-btn login-btn text-decoration-none"
              >
                <i class="fas fa-sign-in-alt mr-2"></i>
                Đăng nhập
              </router-link>

              <router-link
                to="/register"
                class="top-auth-btn register-btn text-decoration-none"
              >
                <i class="fas fa-user-plus mr-2"></i>
                Đăng ký
              </router-link>
            </template>

            <div class="dropdown user-dropdown" v-else>
              <a
                href="#"
                class="user-toggle text-decoration-none"
                @click.prevent="toggleUserDropdown"
              >
                <span class="user-avatar-mini">
                  <i class="fas fa-user"></i>
                </span>
                <span class="user-name">
                  {{ currentUser.fullName || currentUser.username }}
                </span>
                <i class="fas fa-chevron-down user-caret ml-2"></i>
              </a>

              <div
                class="dropdown-menu dropdown-menu-right shadow border-0 mt-2"
                :class="{ 'show d-block': isUserDropdownOpen }"
              >
                <template v-if="currentUser.role === 'customer'">
                  <router-link
                    class="dropdown-item py-2 small font-weight-bold text-dark"
                    to="/profile"
                    @click="closeAllDropdowns"
                  >
                    <i class="fas fa-id-card-alt text-primary mr-2"></i>
                    Hồ sơ của tôi
                  </router-link>

                  <router-link
                    class="dropdown-item py-2 small font-weight-bold text-dark"
                    to="/tra-cuu-don"
                    @click="closeAllDropdowns"
                  >
                    <i class="fas fa-history text-warning mr-2"></i>
                    Lịch sử đặt cọc
                  </router-link>

                  <router-link
                    class="dropdown-item py-2 small font-weight-bold text-dark"
                    to="/my-dogs"
                    @click="closeAllDropdowns"
                  >
                    <i class="fas fa-dog text-secondary mr-2"></i>
                    Hồ sơ chó đã mua
                  </router-link>

                  <router-link
                    class="dropdown-item py-2 small font-weight-bold text-dark"
                    to="/my-dog-care-records"
                    @click="closeAllDropdowns"
                  >
                    <i class="fas fa-heartbeat text-success mr-2"></i>
                    Theo dõi sau bán
                  </router-link>

                  <router-link
                    class="dropdown-item py-2 small font-weight-bold text-dark"
                    to="/my-notifications"
                    @click="closeAllDropdowns"
                  >
                    <i class="fas fa-bell text-danger mr-2"></i>
                    Thông báo của tôi
                  </router-link>

                  <router-link
                    class="dropdown-item py-2 small font-weight-bold text-dark"
                    to="/my-dog-reminders"
                    @click="closeAllDropdowns"
                  >
                    <i class="fas fa-notes-medical text-info mr-2"></i>
                    Lịch nhắc chăm sóc chó
                  </router-link>

                  <router-link
                    class="dropdown-item py-2 small font-weight-bold text-dark"
                    to="/service-bookings"
                    @click="closeAllDropdowns"
                  >
                    <i class="fas fa-calendar-check text-success mr-2"></i>
                    Lịch dịch vụ
                  </router-link>

                  <router-link
                    class="dropdown-item py-2 small font-weight-bold text-dark"
                    to="/accessory-orders"
                    @click="closeAllDropdowns"
                  >
                    <i class="fas fa-box text-primary mr-2"></i>
                    Đơn phụ kiện
                  </router-link>
                </template>

                <template v-else-if="currentUser.role === 'farm'">
                  <router-link
                    class="dropdown-item py-2 small font-weight-bold text-dark"
                    to="/farm/dashboard"
                    @click="closeAllDropdowns"
                  >
                    <i class="fas fa-warehouse text-success mr-2"></i>
                    Trang trại của tôi
                  </router-link>
                </template>

                <template v-else-if="currentUser.role === 'admin'">
                  <router-link
                    class="dropdown-item py-2 small font-weight-bold text-dark"
                    to="/admin/dashboard"
                    @click="closeAllDropdowns"
                  >
                    <i class="fas fa-user-shield text-danger mr-2"></i>
                    Trang quản trị
                  </router-link>
                </template>

                <div class="dropdown-divider"></div>

                <a
                  class="dropdown-item py-2 small font-weight-bold text-danger"
                  href="#"
                  @click.prevent="logout"
                >
                  <i class="fas fa-sign-out-alt mr-2"></i>
                  Đăng xuất
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="header-bottom">
      <div class="container-fluid custom-container px-3">
        <div class="bottom-inner">
          <nav class="bottom-menu">
            <router-link to="/" class="bottom-menu-item text-decoration-none">
              Trang chủ
            </router-link>

            <div
              class="menu-dropdown breed-menu-dropdown"
              @mouseenter="openDogMenu"
              @mouseleave="closeDogMenu"
            >
              <router-link
                to="/dogs/breeds"
                class="bottom-menu-item text-decoration-none dropdown-toggle-link"
                :class="{ active: isDogMenuActive }"
                @click="closeAllDropdowns"
              >
                Giống chó
                <i class="fas fa-chevron-down menu-caret ml-2"></i>
              </router-link>

              <div
                class="menu-dropdown-panel shadow breed-dropdown-panel"
                :class="{ 'show-dropdown': isDogMenuOpen }"
              >
                <router-link
                  v-for="breed in breedMenuList"
                  :key="breed._id || breed.id"
                  :to="`/dogs/breeds/${breed._id || breed.id}`"
                  class="menu-dropdown-item breed-dropdown-item text-decoration-none"
                  @click="closeAllDropdowns"
                >
                  {{ breed.name }}
                </router-link>
              </div>
            </div>

            <div
              class="menu-dropdown accessory-menu-dropdown"
              @mouseenter="openAccessoryMenu"
              @mouseleave="closeAccessoryMenu"
            >
              <router-link
                to="/accessories"
                class="bottom-menu-item text-decoration-none dropdown-toggle-link"
                :class="{ active: isAccessoryMenuActive }"
                @click="closeAllDropdowns"
              >
                Phụ kiện
                <i class="fas fa-chevron-down menu-caret ml-2"></i>
              </router-link>

              <div
                class="menu-dropdown-panel shadow accessory-dropdown-panel"
                :class="{ 'show-dropdown': isAccessoryMenuOpen }"
              >
                <router-link
                  v-for="category in accessoryCategories"
                  :key="category._id || category.id"
                  :to="`/accessories?category=${category._id || category.id}`"
                  class="menu-dropdown-item accessory-dropdown-item text-decoration-none"
                  @click="closeAllDropdowns"
                >
                  {{ category.name }}
                </router-link>

                <div
                  v-if="!accessoryCategories.length"
                  class="menu-dropdown-item accessory-dropdown-item empty-dropdown-item"
                >
                  Chưa có loại phụ kiện
                </div>
              </div>
            </div>

            <router-link to="/services" class="bottom-menu-item text-decoration-none">
              Dịch vụ
            </router-link>

            <router-link to="/tra-cuu-don" class="bottom-menu-item text-decoration-none">
              Đơn hàng của tôi
            </router-link>
          </nav>
        </div>
      </div>

      <div
        v-if="isUserDropdownOpen"
        class="dropdown-backdrop"
        @click="closeAllDropdowns"
      ></div>
    </div>
  </header>
</template>

<script>
import AccessoryCategoryService from "@/services/accessoryCategory.service";
import NotificationService from "@/services/notification.service";
import BreedService from "@/services/breed.service";

export default {
  name: "CustomerHeader",

  props: {
    currentUser: {
      type: Object,
      default: null,
    },
    isLoggedIn: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      isUserDropdownOpen: false,
      isDogMenuOpen: false,
      isAccessoryMenuOpen: false,
      accessoryCategories: [],
      breedMenuList: [],
      unreadNotificationCount: 0,
    };
  },

  computed: {
    isDogMenuActive() {
      const path = this.$route.path || "";
      return path.startsWith("/dogs") || path.startsWith("/dog/");
    },

    isAccessoryMenuActive() {
      const path = this.$route.path || "";
      return path.startsWith("/accessories") || path.startsWith("/accessory/");
    },
  },

  watch: {
    $route() {
      this.closeAllDropdowns();
      this.fetchUnreadNotifications();
    },

    currentUser: {
      handler() {
        this.fetchUnreadNotifications();
      },
      deep: true,
      immediate: true,
    },
  },

  methods: {
    async fetchAccessoryCategories() {
      try {
        const data = await AccessoryCategoryService.getAll();
        this.accessoryCategories = Array.isArray(data)
          ? data.filter((item) => item && (item._id || item.id) && item.name)
          : [];
      } catch (error) {
        console.error("Lỗi tải loại phụ kiện:", error);
        this.accessoryCategories = [];
      }
    },

    async fetchBreedMenu() {
      try {
        const data = await BreedService.getAll();
        this.breedMenuList = Array.isArray(data)
          ? data
              .filter((item) => item.status === "active" || !item.status)
              .sort((a, b) => (a.name || "").localeCompare(b.name || ""))
          : [];
      } catch (error) {
        console.error("Lỗi tải danh sách giống chó cho menu:", error);
        this.breedMenuList = [];
      }
    },

    async fetchUnreadNotifications() {
      try {
        if (!this.isLoggedIn || !this.currentUser || this.currentUser.role !== "customer") {
          this.unreadNotificationCount = 0;
          return;
        }

        const data = await NotificationService.getCustomerNotifications();
        this.unreadNotificationCount = (data || []).filter((item) => !item.isRead).length;
      } catch (error) {
        console.error("Lỗi tải thông báo:", error);
        this.unreadNotificationCount = 0;
      }
    },

    closeAllDropdowns() {
      this.isUserDropdownOpen = false;
      this.isDogMenuOpen = false;
      this.isAccessoryMenuOpen = false;
    },

    toggleUserDropdown() {
      this.isDogMenuOpen = false;
      this.isAccessoryMenuOpen = false;
      this.isUserDropdownOpen = !this.isUserDropdownOpen;
    },

    openDogMenu() {
      this.isDogMenuOpen = true;
    },

    closeDogMenu() {
      this.isDogMenuOpen = false;
    },

    openAccessoryMenu() {
      this.isAccessoryMenuOpen = true;
    },

    closeAccessoryMenu() {
      this.isAccessoryMenuOpen = false;
    },

    logout() {
      if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
        localStorage.removeItem("user");
        localStorage.removeItem("farm");
        localStorage.removeItem("token");

        this.closeAllDropdowns();
        window.dispatchEvent(new Event("auth-changed"));
        this.$router.push("/");
      }
    },
  },

  async mounted() {
    await Promise.all([
      this.fetchAccessoryCategories(),
      this.fetchBreedMenu(),
      this.fetchUnreadNotifications(),
    ]);
  },
};
</script>

<style scoped>
.customer-header {
  position: relative;
  z-index: 1000;
  box-shadow: 0 10px 30px rgba(58, 24, 90, 0.08);
}

@media (min-width: 1200px) {
  .custom-container {
    max-width: 1360px !important;
  }
}

.header-top {
  background: linear-gradient(135deg, #6f42a4 0%, #5d2f93 55%, #4b1f73 100%);
  padding: 14px 0;
  box-shadow: inset 0 -1px 0 rgba(255, 255, 255, 0.06);
}

.top-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.brand-logo {
  flex: 0 0 270px;
}

.brand-logo-box {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-logo-icon {
  width: 60px;
  height: 60px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.96);
  color: #5d2b86;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.45rem;
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.12);
}

.brand-logo-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.brand-logo-text {
  color: #ffffff;
  font-size: 1.45rem;
  font-weight: 800;
  letter-spacing: 0.7px;
  line-height: 1.1;
}

.brand-logo-sub {
  color: rgba(255, 255, 255, 0.78);
  font-size: 0.8rem;
  margin-top: 4px;
  letter-spacing: 0.2px;
}

.top-search {
  flex: 1 1 auto;
  max-width: 760px;
}

.top-search-box {
  position: relative;
  height: 54px;
}

.top-search-input {
  width: 100%;
  height: 54px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  outline: none;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.96);
  color: #4f3b67;
  padding: 0 58px 0 22px;
  font-size: 0.98rem;
  transition: all 0.25s ease;
}

.top-search-input::placeholder {
  color: #9a8aac;
}

.top-search-input:focus {
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.12);
}

.top-search-btn {
  position: absolute;
  top: 50%;
  right: 7px;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: #f4c842;
  color: #4b1f73;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 0 0 auto;
}

.top-cart,
.top-notification {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #f4c842;
  color: #4b1f73;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.08rem;
  transition: all 0.2s ease;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.12);
  position: relative;
}

.top-cart:hover,
.top-notification:hover {
  color: #4b1f73;
  background: #fff;
}

.notification-badge {
  position: absolute;
  top: -4px;
  right: -3px;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 999px;
  background: #dc3545;
  color: #fff;
  font-size: 0.72rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.18);
}

.top-auth-btn {
  height: 46px;
  padding: 0 20px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.94rem;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.login-btn {
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: rgba(255, 255, 255, 0.08);
}

.login-btn:hover {
  color: white;
  background: rgba(255, 255, 255, 0.14);
}

.register-btn {
  color: #4b1f73;
  background: #f4c842;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.12);
}

.register-btn:hover {
  color: #4a148c;
  background: #f7d35d;
}

.user-dropdown {
  position: relative;
}

.user-toggle {
  color: white;
  font-size: 0.98rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  padding: 0 10px;
  min-height: 46px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  transition: all 0.2s ease;
}

.user-toggle:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.14);
}

.user-avatar-mini {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  color: #5b2a86;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  font-size: 1rem;
}

.user-name {
  display: inline-block;
  max-width: 170px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-caret {
  font-size: 0.72rem;
  opacity: 0.9;
}

.header-bottom {
  position: relative;
  background: #4b1f73;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.bottom-inner {
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bottom-menu {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 42px;
  flex-wrap: nowrap;
  width: 100%;
}

.bottom-menu-item {
  color: rgba(255, 255, 255, 0.95);
  font-size: 1rem;
  font-weight: 700;
  transition: all 0.2s ease;
  white-space: nowrap;
  padding: 6px 0;
  position: relative;
}

.bottom-menu-item:hover,
.bottom-menu-item.router-link-active,
.bottom-menu-item.active {
  color: #f4c842;
}

.bottom-menu-item.router-link-active::after,
.bottom-menu-item:hover::after,
.bottom-menu-item.active::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -8px;
  width: 100%;
  height: 3px;
  border-radius: 999px;
  background: #f4c842;
}

.menu-dropdown {
  position: relative;
  display: flex;
  align-items: center;
}

.dropdown-toggle-link {
  display: inline-flex;
  align-items: center;
}

.menu-caret {
  font-size: 0.72rem;
  opacity: 0.9;
}

.menu-dropdown-panel {
  position: absolute;
  top: calc(100% + 2px);
  left: 50%;
  transform: translateX(-50%);
  min-width: 240px;
  background: white;
  border-radius: 16px;
  padding: 10px;
  box-shadow: 0 18px 40px rgba(58, 24, 90, 0.16);
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: all 0.22s ease;
  z-index: 2000;
}

.show-dropdown {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}

.menu-dropdown-item {
  display: flex;
  align-items: center;
  padding: 11px 12px;
  border-radius: 10px;
  color: #4f3b67;
  font-weight: 700;
  font-size: 0.92rem;
  transition: all 0.2s ease;
}

.menu-dropdown-item:hover {
  background: #f5eefc;
  color: #6f42a4;
}

.breed-dropdown-panel {
  min-width: 420px;
  max-width: min(1100px, calc(100vw - 40px));
  padding: 16px 18px;
  display: flex;
  flex-wrap: nowrap;
  gap: 12px;
  border-radius: 18px;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
  scrollbar-width: thin;
  scrollbar-color: #cdb7ea #f7f0fd;
}

.breed-dropdown-item {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 0 18px;
  border-radius: 999px;
  color: #4b3a60;
  font-weight: 700;
  font-size: 0.95rem;
  line-height: 1;
  white-space: nowrap;
  background: #faf6ff;
  border: 1px solid #eadcf6;
  transition: all 0.2s ease;
}

.breed-dropdown-item:hover {
  background: #f3e8ff;
  color: #6f42a4;
  border-color: #d9c2f3;
}

.accessory-dropdown-panel {
  min-width: 420px;
  max-width: min(1100px, calc(100vw - 40px));
  padding: 16px 18px;
  display: flex;
  flex-wrap: nowrap;
  gap: 12px;
  border-radius: 18px;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
  scrollbar-width: thin;
  scrollbar-color: #cdb7ea #f7f0fd;
}

.accessory-dropdown-item {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 0 18px;
  border-radius: 999px;
  color: #4b3a60;
  font-weight: 700;
  font-size: 0.95rem;
  line-height: 1;
  white-space: nowrap;
  background: #faf6ff;
  border: 1px solid #eadcf6;
  transition: all 0.2s ease;
}

.accessory-dropdown-item:hover {
  background: #f3e8ff;
  color: #6f42a4;
  border-color: #d9c2f3;
}

.empty-dropdown-item {
  color: #8b7fa0;
  cursor: default;
}

.empty-dropdown-item:hover {
  background: #faf6ff;
  color: #8b7fa0;
  border-color: #eadcf6;
}

.breed-dropdown-panel::-webkit-scrollbar,
.accessory-dropdown-panel::-webkit-scrollbar {
  height: 8px;
}

.breed-dropdown-panel::-webkit-scrollbar-track,
.accessory-dropdown-panel::-webkit-scrollbar-track {
  background: #f7f0fd;
  border-radius: 999px;
}

.breed-dropdown-panel::-webkit-scrollbar-thumb,
.accessory-dropdown-panel::-webkit-scrollbar-thumb {
  background: #cdb7ea;
  border-radius: 999px;
}

.breed-dropdown-panel::-webkit-scrollbar-thumb:hover,
.accessory-dropdown-panel::-webkit-scrollbar-thumb:hover {
  background: #b795df;
}

.dropdown-menu {
  z-index: 9999 !important;
  border-radius: 14px;
  min-width: 260px;
  position: absolute;
  top: 100%;
  right: 0;
}

.dropdown-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: transparent;
}

@media (max-width: 1199.98px) {
  .custom-container {
    max-width: 100% !important;
  }

  .top-inner {
    gap: 14px;
  }

  .brand-logo {
    flex: 0 0 220px;
  }

  .brand-logo-text {
    font-size: 1.2rem;
  }

  .brand-logo-sub {
    font-size: 0.72rem;
  }

  .top-search {
    max-width: 500px;
  }

  .top-search-box {
    height: 48px;
  }

  .top-search-input {
    height: 48px;
    font-size: 0.92rem;
  }

  .top-auth-btn {
    height: 42px;
    padding: 0 16px;
    font-size: 0.88rem;
  }

  .user-toggle {
    font-size: 0.92rem;
  }

  .bottom-menu {
    gap: 24px;
  }

  .bottom-menu-item {
    font-size: 0.92rem;
  }

  .breed-dropdown-panel,
  .accessory-dropdown-panel {
    max-width: min(900px, calc(100vw - 40px));
  }
}

@media (max-width: 767.98px) {
  .header-top {
    padding: 12px 0;
  }

  .top-inner {
    flex-wrap: wrap;
    justify-content: center;
  }

  .brand-logo {
    flex: 0 0 100%;
    display: flex;
    justify-content: center;
  }

  .brand-logo-box {
    justify-content: center;
  }

  .top-search {
    flex: 0 0 100%;
    max-width: 100%;
    order: 3;
  }

  .top-actions {
    justify-content: center;
    flex-wrap: wrap;
  }

  .header-bottom {
    overflow-x: auto;
  }

  .bottom-inner {
    justify-content: flex-start;
  }

  .bottom-menu {
    justify-content: flex-start;
    gap: 24px;
    min-width: max-content;
    padding: 0 8px;
  }

  .menu-dropdown-panel {
    left: 0;
    transform: none;
  }

  .breed-dropdown-panel,
  .accessory-dropdown-panel {
    min-width: 280px;
    max-width: calc(100vw - 24px);
    width: max-content;
    padding: 12px 14px;
    gap: 10px;
  }

  .breed-dropdown-item,
  .accessory-dropdown-item {
    min-height: 38px;
    padding: 0 14px;
    font-size: 0.88rem;
  }

  .bottom-menu-item.router-link-active::after,
  .bottom-menu-item:hover::after,
  .bottom-menu-item.active::after {
    bottom: -6px;
  }
}
</style>