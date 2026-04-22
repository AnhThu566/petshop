<template>
  <header class="customer-header">
    <div class="header-top">
      <div class="container-fluid custom-container px-3">
        <div class="top-inner">
          <router-link to="/" class="brand-logo text-decoration-none">
            <div class="brand-logo-box">
              <div class="brand-logo-icon">
                <img src="/logo-ct550.png" alt="Logo" class="brand-logo-image" />
              </div>
              <div class="brand-logo-content">
                <div class="brand-logo-text">PETSHOP</div>
                <div class="brand-logo-sub">Chó cảnh • Phụ kiện • Dịch vụ</div>
              </div>
            </div>
          </router-link>

          <div class="top-search" ref="searchBoxRef">
            <form class="top-search-box" @submit.prevent="handleSearch">
              <input
                type="text"
                class="top-search-input"
                v-model.trim="searchKeyword"
                placeholder="Tìm chó cảnh, phụ kiện, dịch vụ..."
                @focus="openSearchSuggest"
                @input="handleSearchInput"
              />
              <button class="top-search-btn" type="submit">
                <i class="fas fa-search"></i>
              </button>

              <div
                v-if="isSearchSuggestOpen && searchKeyword"
                class="search-suggest-panel shadow"
                @click.stop
              >
                <div
                  v-if="filteredSearchSuggestions.length"
                  class="search-suggest-list"
                >
                  <button
                    v-for="item in filteredSearchSuggestions"
                    :key="item.key"
                    type="button"
                    class="search-suggest-item"
                    @click="selectSuggestion(item)"
                  >
                    <span class="suggest-icon">
                      <i :class="item.icon"></i>
                    </span>
                    <span class="suggest-content">
                      <span class="suggest-title">{{ item.label }}</span>
                      <span class="suggest-sub">{{ item.group }}</span>
                    </span>
                  </button>
                </div>

                <div v-else class="search-suggest-empty">
                  Nhấn Enter để tìm với từ khóa “{{ searchKeyword }}”
                </div>
              </div>
            </form>
          </div>

          <div class="top-actions">
            <router-link
              to="/cart"
              class="top-cart text-decoration-none"
              title="Giỏ hàng"
            >
              <i class="fas fa-shopping-cart"></i>
              <span v-if="cartCount > 0" class="cart-badge">
                {{ cartCount > 99 ? "99+" : cartCount }}
              </span>
            </router-link>

            <template v-if="!isActuallyLoggedIn || !displayUser">
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

            <div
              class="dropdown user-dropdown"
              v-else
              ref="userDropdownRef"
              @click.stop
            >
              <a
                href="#"
                class="user-toggle text-decoration-none"
                @click.prevent.stop="toggleUserDropdown"
              >
                <span class="user-avatar-mini">
                  <img
                    v-if="headerAvatarUrl"
                    :src="headerAvatarUrl"
                    alt="avatar"
                    class="user-avatar-image"
                  />
                  <span v-else class="user-avatar-placeholder">
                    <i class="fas fa-user"></i>
                  </span>
                </span>

                <span class="user-name">
                  {{ displayUser.fullName || displayUser.username }}
                </span>
                <i class="fas fa-chevron-down user-caret ml-2"></i>
              </a>

              <div
                class="dropdown-menu dropdown-menu-right shadow border-0 mt-2"
                :class="{ 'show d-block': isUserDropdownOpen }"
                @click.stop
              >
                <template v-if="displayUser.role === 'customer'">
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

                <template v-else-if="displayUser.role === 'farm'">
                  <router-link
                    class="dropdown-item py-2 small font-weight-bold text-dark"
                    to="/farm/dashboard"
                    @click="closeAllDropdowns"
                  >
                    <i class="fas fa-warehouse text-success mr-2"></i>
                    Trang trại của tôi
                  </router-link>
                </template>

                <template v-else-if="displayUser.role === 'admin'">
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

            <div
              class="menu-dropdown service-menu-dropdown"
              @mouseenter="openServiceMenu"
              @mouseleave="closeServiceMenu"
            >
              <router-link
                to="/services"
                class="bottom-menu-item text-decoration-none dropdown-toggle-link"
                :class="{ active: isServiceMenuActive }"
                @click="closeAllDropdowns"
              >
                Dịch vụ
                <i class="fas fa-chevron-down menu-caret ml-2"></i>
              </router-link>

              <div
                class="menu-dropdown-panel service-dropdown-panel shadow"
                :class="{ 'show-dropdown': isServiceMenuOpen }"
              >
                <router-link
                  v-for="category in serviceCategories"
                  :key="category._id || category.id"
                  :to="`/services?category=${category._id || category.id}`"
                  class="menu-dropdown-item service-dropdown-item text-decoration-none"
                  @click="closeAllDropdowns"
                >
                  {{ category.name }}
                </router-link>

                <div
                  v-if="!serviceCategories.length"
                  class="menu-dropdown-item service-dropdown-item empty-dropdown-item"
                >
                  Chưa có loại dịch vụ
                </div>
              </div>
            </div>

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
import ServiceCategoryService from "@/services/serviceCategory.service";
import BreedService from "@/services/breed.service";
import CartService from "@/services/cart.service";

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
      isServiceMenuOpen: false,
      isSearchSuggestOpen: false,
      accessoryCategories: [],
      serviceCategories: [],
      breedMenuList: [],
      cartCount: 0,
      localUser: null,
      baseImageUrl: "http://localhost:3000",
      searchKeyword: "",
    };
  },

  computed: {
    displayUser() {
      return this.localUser || this.currentUser || null;
    },

    isActuallyLoggedIn() {
      const token = localStorage.getItem("token");
      return !!token && !!this.displayUser;
    },

    headerAvatarUrl() {
      const avatar = this.displayUser?.avatar;
      if (!avatar) return "";

      if (
        String(avatar).startsWith("http://") ||
        String(avatar).startsWith("https://")
      ) {
        return avatar;
      }

      return `${this.baseImageUrl}${avatar}`;
    },

    isDogMenuActive() {
      const path = this.$route.path || "";
      return path.startsWith("/dogs") || path.startsWith("/dog/");
    },

    isAccessoryMenuActive() {
      const path = this.$route.path || "";
      return path.startsWith("/accessories") || path.startsWith("/accessory/");
    },

    isServiceMenuActive() {
      const path = this.$route.path || "";
      return path.startsWith("/services") || path.startsWith("/service/");
    },

    searchSuggestions() {
      const breedItems = this.breedMenuList.map((breed) => ({
        key: `breed-${breed._id || breed.id}`,
        type: "breed",
        label: breed.name,
        group: "Giống chó",
        icon: "fas fa-dog",
        id: breed._id || breed.id,
      }));

      const accessoryItems = this.accessoryCategories.map((category) => ({
        key: `accessory-${category._id || category.id}`,
        type: "accessory-category",
        label: category.name,
        group: "Loại phụ kiện",
        icon: "fas fa-box",
        id: category._id || category.id,
      }));

      const serviceItems = this.serviceCategories.map((category) => ({
        key: `service-${category._id || category.id}`,
        type: "service-category",
        label: category.name,
        group: "Loại dịch vụ",
        icon: "fas fa-concierge-bell",
        id: category._id || category.id,
      }));

      const fixedItems = [
        {
          key: "services-page",
          type: "page",
          label: "Dịch vụ",
          group: "Trang nhanh",
          icon: "fas fa-calendar-check",
          path: "/services",
        },
        {
          key: "accessories-page",
          type: "page",
          label: "Phụ kiện",
          group: "Trang nhanh",
          icon: "fas fa-shopping-bag",
          path: "/accessories",
        },
      ];

      return [...breedItems, ...accessoryItems, ...serviceItems, ...fixedItems];
    },

    filteredSearchSuggestions() {
      const keyword = this.normalizeText(this.searchKeyword);
      if (!keyword) return [];

      return this.searchSuggestions
        .filter((item) => this.normalizeText(item.label).includes(keyword))
        .slice(0, 8);
    },
  },

  watch: {
    $route() {
      this.closeAllDropdowns();
      this.fetchCartCount();
      this.syncUserFromStorage();
      this.isSearchSuggestOpen = false;
    },

    currentUser: {
      handler() {
        this.localUser = this.currentUser
          ? { ...this.currentUser }
          : this.getUserFromStorage();
        this.fetchCartCount();
      },
      immediate: true,
      deep: true,
    },
  },

  methods: {
    getUserFromStorage() {
      try {
        const raw = localStorage.getItem("user");
        return raw ? JSON.parse(raw) : null;
      } catch (error) {
        console.error("Lỗi đọc localStorage user:", error);
        return null;
      }
    },

    syncUserFromStorage() {
      this.localUser = this.currentUser
        ? { ...this.currentUser }
        : this.getUserFromStorage();
    },

    handleUserUpdated(event) {
      if (event?.detail) {
        this.localUser = { ...(this.localUser || {}), ...event.detail };
      } else {
        this.syncUserFromStorage();
      }
    },

    normalizeText(text) {
      return String(text || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
    },

    openSearchSuggest() {
      if (this.searchKeyword) {
        this.isSearchSuggestOpen = true;
      }
    },

    handleSearchInput() {
      this.isSearchSuggestOpen = !!this.searchKeyword;
    },

    async handleSearch() {
      const keyword = this.searchKeyword.trim();
      if (!keyword) return;

      const normalizedKeyword = this.normalizeText(keyword);

      const matchedBreed = this.breedMenuList.find((breed) =>
        this.normalizeText(breed.name).includes(normalizedKeyword)
      );

      if (matchedBreed) {
        this.isSearchSuggestOpen = false;
        this.searchKeyword = "";
        this.$router.push(`/dogs/breeds/${matchedBreed._id || matchedBreed.id}`);
        return;
      }

      const matchedAccessoryCategory = this.accessoryCategories.find((category) =>
        this.normalizeText(category.name).includes(normalizedKeyword)
      );

      if (matchedAccessoryCategory) {
        this.isSearchSuggestOpen = false;
        this.searchKeyword = "";
        this.$router.push(
          `/accessories?category=${matchedAccessoryCategory._id || matchedAccessoryCategory.id}`
        );
        return;
      }

      const matchedServiceCategory = this.serviceCategories.find((category) =>
        this.normalizeText(category.name).includes(normalizedKeyword)
      );

      if (matchedServiceCategory) {
        this.isSearchSuggestOpen = false;
        this.searchKeyword = "";
        this.$router.push(
          `/services?category=${matchedServiceCategory._id || matchedServiceCategory.id}`
        );
        return;
      }

      this.isSearchSuggestOpen = false;

      const currentPath = this.$route.path || "";

      if (currentPath.startsWith("/accessories")) {
        this.$router.push({ path: "/accessories", query: { keyword } });
        return;
      }

      if (currentPath.startsWith("/services")) {
        this.$router.push({ path: "/services", query: { keyword } });
        return;
      }

      this.$router.push({ path: "/services", query: { keyword } });
    },

    selectSuggestion(item) {
      this.isSearchSuggestOpen = false;
      this.searchKeyword = "";

      if (item.type === "breed") {
        this.$router.push(`/dogs/breeds/${item.id}`);
        return;
      }

      if (item.type === "accessory-category") {
        this.$router.push(`/accessories?category=${item.id}`);
        return;
      }

      if (item.type === "service-category") {
        this.$router.push(`/services?category=${item.id}`);
        return;
      }

      if (item.type === "page" && item.path) {
        this.$router.push(item.path);
      }
    },

    async fetchAccessoryCategories() {
      try {
        const data = await AccessoryCategoryService.getAll();
        this.accessoryCategories = Array.isArray(data)
          ? data.filter(
              (item) =>
                item &&
                (item._id || item.id) &&
                item.name &&
                (!item.status || item.status === "Hoạt động")
            )
          : [];
      } catch (error) {
        console.error("Lỗi tải loại phụ kiện:", error);
        this.accessoryCategories = [];
      }
    },

    async fetchServiceCategories() {
      try {
        const data = await ServiceCategoryService.getAll();
        this.serviceCategories = Array.isArray(data)
          ? data.filter(
              (item) =>
                item &&
                (item._id || item.id) &&
                item.name &&
                (!item.status || item.status === "Hoạt động")
            )
          : [];
      } catch (error) {
        console.error("Lỗi tải loại dịch vụ:", error);
        this.serviceCategories = [];
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

    async fetchCartCount() {
      try {
        const token = localStorage.getItem("token");

        if (
          !token ||
          !this.isActuallyLoggedIn ||
          !this.displayUser ||
          this.displayUser.role !== "customer"
        ) {
          this.cartCount = 0;
          return;
        }

        const data = await CartService.getCart();
        const items = data?.items || [];

        this.cartCount = items.reduce(
          (sum, item) => sum + Number(item.quantity || 0),
          0
        );
      } catch (error) {
        console.error("Lỗi tải số lượng giỏ hàng:", error);
        this.cartCount = 0;
      }
    },

    closeAllDropdowns() {
      this.isUserDropdownOpen = false;
      this.isDogMenuOpen = false;
      this.isAccessoryMenuOpen = false;
      this.isServiceMenuOpen = false;
      this.isSearchSuggestOpen = false;
    },

    toggleUserDropdown() {
      this.isDogMenuOpen = false;
      this.isAccessoryMenuOpen = false;
      this.isServiceMenuOpen = false;
      this.isSearchSuggestOpen = false;
      this.isUserDropdownOpen = !this.isUserDropdownOpen;
    },

    openDogMenu() {
      this.isDogMenuOpen = true;
      this.isAccessoryMenuOpen = false;
      this.isServiceMenuOpen = false;
    },

    closeDogMenu() {
      this.isDogMenuOpen = false;
    },

    openAccessoryMenu() {
      this.isAccessoryMenuOpen = true;
      this.isDogMenuOpen = false;
      this.isServiceMenuOpen = false;
    },

    closeAccessoryMenu() {
      this.isAccessoryMenuOpen = false;
    },

    openServiceMenu() {
      this.isServiceMenuOpen = true;
      this.isDogMenuOpen = false;
      this.isAccessoryMenuOpen = false;
    },

    closeServiceMenu() {
      this.isServiceMenuOpen = false;
    },

    logout() {
      if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
        localStorage.removeItem("user");
        localStorage.removeItem("farm");
        localStorage.removeItem("token");

        this.localUser = null;
        this.cartCount = 0;
        this.closeAllDropdowns();
        window.dispatchEvent(new Event("auth-changed"));
        this.$router.push("/");
      }
    },

    handleDocumentClick(event) {
      const userDropdownEl = this.$refs.userDropdownRef;
      const searchBoxEl = this.$refs.searchBoxRef;

      if (
        userDropdownEl &&
        userDropdownEl.contains &&
        userDropdownEl.contains(event.target)
      ) {
        return;
      }

      if (
        searchBoxEl &&
        searchBoxEl.contains &&
        searchBoxEl.contains(event.target)
      ) {
        return;
      }

      this.closeAllDropdowns();
    },
  },

  async mounted() {
    this.syncUserFromStorage();

    await Promise.all([
      this.fetchAccessoryCategories(),
      this.fetchServiceCategories(),
      this.fetchBreedMenu(),
      this.fetchCartCount(),
    ]);

    window.addEventListener("cart-updated", this.fetchCartCount);
    window.addEventListener("auth-changed", this.fetchCartCount);
    window.addEventListener("user-updated", this.handleUserUpdated);
    document.addEventListener("click", this.handleDocumentClick);
  },

  beforeUnmount() {
    window.removeEventListener("cart-updated", this.fetchCartCount);
    window.removeEventListener("auth-changed", this.fetchCartCount);
    window.removeEventListener("user-updated", this.handleUserUpdated);
    document.removeEventListener("click", this.handleDocumentClick);
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

.search-suggest-panel {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  width: 100%;
  background: #ffffff;
  border-radius: 18px;
  border: 1px solid #eee7f6;
  padding: 8px;
  z-index: 3000;
  box-shadow: 0 18px 40px rgba(58, 24, 90, 0.16);
}

.search-suggest-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.search-suggest-item {
  width: 100%;
  border: none;
  background: #fff;
  display: flex;
  align-items: center;
  gap: 10px;
  text-align: left;
  padding: 10px 12px;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.search-suggest-item:hover {
  background: #f7f1fd;
}

.suggest-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: #f3e8ff;
  color: #6f42a4;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.suggest-content {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.suggest-title {
  color: #3f2d56;
  font-weight: 700;
  line-height: 1.2;
}

.suggest-sub {
  color: #8b7fa0;
  font-size: 0.78rem;
  margin-top: 2px;
}

.search-suggest-empty {
  padding: 12px 14px;
  color: #7d6f92;
  font-size: 0.9rem;
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 0 0 auto;
}

.top-cart {
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

.cart-badge {
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

.top-cart:hover {
  color: #4b1f73;
  background: #fff;
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
  overflow: hidden;
  flex-shrink: 0;
}

.user-avatar-image,
.user-avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.user-avatar-image {
  object-fit: cover;
  display: block;
}

.user-avatar-placeholder {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #5b2a86;
  background: rgba(255, 255, 255, 0.92);
  font-size: 0.95rem;
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

.service-dropdown-panel {
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

.service-dropdown-item {
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

.service-dropdown-item:hover {
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
.accessory-dropdown-panel::-webkit-scrollbar,
.service-dropdown-panel::-webkit-scrollbar {
  height: 8px;
}

.breed-dropdown-panel::-webkit-scrollbar-track,
.accessory-dropdown-panel::-webkit-scrollbar-track,
.service-dropdown-panel::-webkit-scrollbar-track {
  background: #f7f0fd;
  border-radius: 999px;
}

.breed-dropdown-panel::-webkit-scrollbar-thumb,
.accessory-dropdown-panel::-webkit-scrollbar-thumb,
.service-dropdown-panel::-webkit-scrollbar-thumb {
  background: #cdb7ea;
  border-radius: 999px;
}

.breed-dropdown-panel::-webkit-scrollbar-thumb:hover,
.accessory-dropdown-panel::-webkit-scrollbar-thumb:hover,
.service-dropdown-panel::-webkit-scrollbar-thumb:hover {
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
    height: auto;
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
  .accessory-dropdown-panel,
  .service-dropdown-panel {
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
  .accessory-dropdown-panel,
  .service-dropdown-panel {
    min-width: 280px;
    max-width: calc(100vw - 24px);
    width: max-content;
    padding: 12px 14px;
    gap: 10px;
  }

  .breed-dropdown-item,
  .accessory-dropdown-item,
  .service-dropdown-item {
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

.brand-logo-image {
  width: 50px;
  height: 50px;
  object-fit: contain;
  display: block;
}
</style>