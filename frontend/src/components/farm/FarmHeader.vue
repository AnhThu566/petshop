<template>
  <header class="bg-white shadow-sm px-4 py-3 d-flex justify-content-between align-items-center flex-wrap">
    <div class="d-flex align-items-center mb-2 mb-md-0">
      <div
        class="rounded-circle bg-success text-white d-flex align-items-center justify-content-center shadow-sm mr-3"
        style="width: 42px; height: 42px;"
      >
        <i class="fas fa-store-alt"></i>
      </div>

      <div>
        <h5 class="mb-0 text-success font-weight-bold d-flex align-items-center">
          <i class="fas fa-tractor mr-2"></i>
          TRUNG TÂM QUẢN LÝ CỦA TRANG TRẠI
        </h5>
        <div class="small text-muted mt-1" v-if="displayName">
          Xin chào, <strong>{{ displayName }}</strong>
        </div>
      </div>
    </div>

    <div class="d-flex align-items-center flex-wrap">
      <router-link
        to="/farm/dashboard"
        class="btn btn-outline-success btn-sm mr-2 mb-2 mb-md-0"
      >
        <i class="fas fa-list mr-1"></i>
        Danh sách chó
      </router-link>

      <router-link
        to="/farm/add-dog"
        class="btn btn-success btn-sm mr-3 mb-2 mb-md-0"
      >
        <i class="fas fa-plus-circle mr-1"></i>
        Đăng chó mới
      </router-link>

      <div class="d-flex align-items-center border-left pl-3">
        <div
          class="rounded-circle bg-success text-white d-flex align-items-center justify-content-center shadow-sm mr-2"
          style="width: 36px; height: 36px;"
        >
          <i class="fas fa-user"></i>
        </div>
        <div class="d-none d-md-block">
          <div class="small font-weight-bold text-dark">
            {{ displayName || "Chủ trại" }}
          </div>
          <div class="small text-muted">Tài khoản trang trại</div>
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
  },

  created() {
    const userData = localStorage.getItem("user");
    const farmData = localStorage.getItem("farm");

    if (userData) {
      this.currentUser = JSON.parse(userData);
    }

    if (farmData) {
      this.currentFarm = JSON.parse(farmData);
    }
  },
};
</script>