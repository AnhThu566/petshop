<template>
  <div
    class="bg-success text-white p-3 shadow-lg d-flex flex-column"
    style="width: 260px; min-height: 100vh;"
  >
    <div class="text-center mb-4 mt-3">
      <div class="bg-white rounded-circle d-inline-block p-3 mb-2 shadow-sm">
        <i class="fas fa-tractor fa-2x text-success"></i>
      </div>

      <h5 class="font-weight-bold mt-2 mb-1">KÊNH CHỦ TRẠI</h5>

      <p class="small opacity-75 mb-0" v-if="currentUser">
        Xin chào,
        <span class="font-weight-bold">
          {{ currentUser.fullName || currentUser.username || "Bạn" }}
        </span>
      </p>
    </div>

    <hr class="bg-light opacity-50 w-100" />

    <ul class="nav flex-column w-100 mb-auto">
      <li class="nav-item mb-2">
        <router-link
          to="/farm/dashboard"
          class="nav-link text-white rounded menu-item"
          active-class="active-menu"
        >
          <i class="fas fa-dog w-20px mr-2"></i>
          Hồ sơ chó đã cung cấp
        </router-link>
      </li>

      <li class="nav-item mb-2">
        <router-link
          to="/farm/add-dog"
          class="nav-link text-white rounded menu-item"
          active-class="active-menu"
        >
          <i class="fas fa-plus-circle w-20px mr-2"></i>
          Cung cấp hồ sơ chó
        </router-link>
      </li>

      <li class="nav-item mb-2">
        <router-link
          to="/farm/profile"
          class="nav-link text-white rounded menu-item"
          active-class="active-menu"
        >
          <i class="fas fa-user-cog w-20px mr-2"></i>
          Thông tin trang trại
        </router-link>
      </li>
    </ul>

    <div class="mt-auto pt-4 border-top border-light">
      <button
        class="btn btn-outline-light w-100 font-weight-bold mt-3"
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
.w-20px {
  width: 25px;
  text-align: center;
}

.menu-item {
  transition: all 0.3s ease;
  opacity: 0.88;
}

.menu-item:hover {
  background-color: rgba(255, 255, 255, 0.12);
  opacity: 1;
  padding-left: 25px;
}

.active-menu {
  background-color: #ffffff !important;
  color: #28a745 !important;
  font-weight: bold;
  opacity: 1;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>