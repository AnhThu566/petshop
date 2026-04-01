<template>
  <header class="customer-header">
    <div
      class="top-bar text-white d-none d-lg-block border-bottom"
      style="border-color: rgba(255,255,255,0.1) !important;"
    >
      <div
        class="container custom-container d-flex justify-content-between align-items-center py-2"
        style="font-size: 0.85rem;"
      >
        <div class="d-flex align-items-center text-light">
          <span class="mr-4">
            <i class="fas fa-map-marker-alt text-warning mr-1"></i>
            <strong>CS1:</strong> 428 Minh Khai, Hà Nội
          </span>
          <span>
            <i class="fas fa-map-marker-alt text-warning mr-1"></i>
            <strong>CS2:</strong> 961 Phạm Văn Đồng, HCM
          </span>
        </div>

        <div class="social-icons">
          <a href="#"><i class="fab fa-facebook-f text-white mx-2 hover-text-warning"></i></a>
          <a href="#"><i class="fab fa-tiktok text-white mx-2 hover-text-warning"></i></a>
          <a href="#"><i class="fab fa-youtube text-white mx-2 hover-text-warning"></i></a>
        </div>
      </div>
    </div>

    <div class="main-bar shadow-sm">
      <div class="container custom-container position-relative">
        <div class="row align-items-center py-3">
          <div class="col-lg-5 d-flex align-items-center">
            <nav class="d-flex align-items-center nav-menu">
              <router-link
                to="/"
                class="menu-item text-white font-weight-bold text-decoration-none text-uppercase mr-3"
              >
                🏠 Trang Chủ
              </router-link>

              <router-link
                to="/dogs"
                class="menu-item text-white font-weight-bold text-decoration-none text-uppercase mr-3"
              >
                🐶 Chó Cảnh
              </router-link>

              <router-link
                to="/accessories"
                class="menu-item text-white font-weight-bold text-decoration-none text-uppercase mr-3"
              >
                🦴 Phụ Kiện
              </router-link>

              <router-link
                to="/services"
                class="menu-item text-white font-weight-bold text-decoration-none text-uppercase"
              >
                ✂️ Dịch Vụ
              </router-link>
            </nav>
          </div>

          <div class="col-lg-2 d-none d-lg-flex justify-content-center position-static">
            <router-link to="/" class="logo-wrapper shadow text-decoration-none">
              <div class="text-center font-weight-bold" style="color:#6a1b9a; line-height:1.1;">
                PET<br />SHOP
              </div>
            </router-link>
          </div>

          <div class="col-lg-5 d-flex align-items-center justify-content-end">
            <div class="search-wrapper mr-2">
              <div class="input-group shadow-sm" style="height: 38px;">
                <input
                  type="text"
                  class="form-control text-white placeholder-white border-0 px-3 h-100"
                  placeholder="Tìm kiếm..."
                  style="background: rgba(255,255,255,0.15); border-radius: 20px 0 0 20px; font-size: 0.85rem; width: 130px;"
                />
                <div class="input-group-append h-100">
                  <button
                    class="btn text-white px-3 h-100 d-flex align-items-center"
                    type="button"
                    style="background: rgba(255,255,255,0.15); border-radius: 0 20px 20px 0;"
                  >
                    <i class="fas fa-search fa-sm"></i>
                  </button>
                </div>
              </div>
            </div>

            <a
              href="tel:0379889868"
              class="btn btn-warning text-dark font-weight-bold rounded-pill px-3 mr-2 d-flex align-items-center shadow-sm"
              style="height: 38px; font-size: 0.85rem;"
            >
              <i class="fas fa-phone-alt mr-1 text-danger small"></i> 0379.889.868
            </a>

            <router-link
              to="/cart"
              class="cart-icon rounded-circle d-flex justify-content-center align-items-center bg-warning text-dark text-decoration-none mr-3 shadow-sm flex-shrink-0"
              style="width: 38px; height: 38px; font-size: 1rem;"
            >
              <i class="fas fa-shopping-cart"></i>
            </router-link>

            <div
              class="auth-area border-left pl-3"
              style="border-color: rgba(255,255,255,0.2) !important;"
            >
              <div
                v-if="!isLoggedIn || !currentUser"
                class="small font-weight-bold d-flex align-items-center"
                style="height: 38px;"
              >
                <router-link
                  to="/login"
                  class="text-white text-decoration-none hover-text-warning mr-2"
                >
                  Đăng nhập
                </router-link>
                <router-link
                  to="/register"
                  class="btn btn-sm btn-outline-warning rounded-pill px-3 d-flex align-items-center"
                  style="height: 28px; font-size: 0.75rem;"
                >
                  Đăng ký
                </router-link>
              </div>

              <div class="dropdown" v-else>
                <a
                  class="text-white text-decoration-none dropdown-toggle d-flex align-items-center"
                  href="#"
                  @click.prevent="isDropdownOpen = !isDropdownOpen"
                  style="height: 38px; cursor: pointer;"
                >
                  <div
                    class="avatar-min shadow-sm mr-2 d-flex align-items-center justify-content-center bg-white rounded-circle flex-shrink-0"
                    style="width: 34px; height: 34px; color: #6a1b9a;"
                  >
                    <i class="fas fa-user-check"></i>
                  </div>
                  <span class="small font-weight-bold d-none d-xl-inline">
                    {{ currentUser.fullName || currentUser.username }}
                  </span>
                </a>

                <div
                  class="dropdown-menu dropdown-menu-right shadow border-0 mt-2"
                  :class="{ 'show d-block': isDropdownOpen }"
                  style="border-radius: 12px; min-width: 230px; position: absolute; top: 100%; right: 0;"
                >
                  <template v-if="currentUser.role === 'customer'">
                    <router-link
                      class="dropdown-item py-2 small font-weight-bold text-dark"
                      to="/profile"
                      @click="closeDropdown"
                    >
                      <i class="fas fa-id-card-alt text-primary mr-2"></i> Hồ sơ của tôi
                    </router-link>

                    <router-link
                      class="dropdown-item py-2 small font-weight-bold text-dark"
                      to="/tra-cuu-don"
                      @click="closeDropdown"
                    >
                      <i class="fas fa-history text-warning mr-2"></i> Lịch sử đặt cọc
                    </router-link>

                    <router-link
                      class="dropdown-item py-2 small font-weight-bold text-dark"
                      to="/service-bookings"
                      @click="closeDropdown"
                    >
                      <i class="fas fa-calendar-check text-success mr-2"></i> Lịch dịch vụ
                    </router-link>

                    <router-link
                      class="dropdown-item py-2 small font-weight-bold text-dark"
                      to="/accessory-orders"
                      @click="closeDropdown"
                    >
                      <i class="fas fa-box text-primary mr-2"></i> Đơn phụ kiện
                    </router-link>
                  </template>

                  <template v-else-if="currentUser.role === 'farm'">
                    <router-link
                      class="dropdown-item py-2 small font-weight-bold text-dark"
                      to="/farm/dashboard"
                      @click="closeDropdown"
                    >
                      <i class="fas fa-warehouse text-success mr-2"></i> Trang trại của tôi
                    </router-link>
                  </template>

                  <template v-else-if="currentUser.role === 'admin'">
                    <router-link
                      class="dropdown-item py-2 small font-weight-bold text-dark"
                      to="/admin/dashboard"
                      @click="closeDropdown"
                    >
                      <i class="fas fa-user-shield text-danger mr-2"></i> Trang quản trị
                    </router-link>
                  </template>

                  <div class="dropdown-divider"></div>

                  <a
                    class="dropdown-item py-2 small font-weight-bold text-danger"
                    href="#"
                    @click.prevent="logout"
                  >
                    <i class="fas fa-sign-out-alt mr-2"></i> Đăng xuất
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="isDropdownOpen"
        class="dropdown-backdrop"
        @click="closeDropdown"
      ></div>
    </div>
  </header>
</template>

<script>
export default {
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
      isDropdownOpen: false,
    };
  },

  watch: {
    $route() {
      this.closeDropdown();
    },
  },

  methods: {
    closeDropdown() {
      this.isDropdownOpen = false;
    },

    logout() {
      if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
        localStorage.removeItem("user");
        localStorage.removeItem("farm");
        localStorage.removeItem("token");
        this.isDropdownOpen = false;
        this.$router.push("/login");
      }
    },
  },
};
</script>

<style scoped>
.top-bar { background-color: #38006b; }
.main-bar { background-color: #6a1b9a; }

.hover-text-warning:hover { color: #ffc107 !important; }

.menu-item {
  transition: all 0.2s;
  font-size: 0.85rem;
  letter-spacing: 0.3px;
}
.menu-item:hover {
  color: #ffc107 !important;
  transform: translateY(-1px);
}

.placeholder-white::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.logo-wrapper {
  position: absolute;
  top: 5px;
  z-index: 100;
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4px solid #6a1b9a;
}

.cart-icon { transition: all 0.2s; }
.cart-icon:hover {
  transform: scale(1.1);
  background-color: white !important;
  color: #6a1b9a !important;
}

.input-group, .btn, .auth-area {
  margin-bottom: 0 !important;
}

@media (min-width: 1200px) {
  .custom-container { max-width: 1350px !important; }
}

.dropdown-menu {
  z-index: 9999 !important;
}

.auth-area {
  position: relative;
  z-index: 1020;
}

.dropdown-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: transparent;
}
</style>