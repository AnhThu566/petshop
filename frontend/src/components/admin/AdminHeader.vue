    <template>
    <header class="bg-white shadow-sm py-3 px-4 d-flex justify-content-between align-items-center">
        <h5 class="mb-0 text-dark font-weight-bold">
        <i class="fas fa-bars mr-2 text-muted"></i> Bảng điều khiển
        </h5>
        
        <div class="d-flex align-items-center">
        <span class="mr-3 text-muted">
            <i class="fas fa-user-circle fa-lg text-primary"></i> Xin chào, Admin
        </span>
        <button class="btn btn-sm btn-outline-danger" @click="logout">
            <i class="fas fa-sign-out-alt"></i> Đăng xuất
        </button>
        </div>
    </header>
    </template>

    <script>
    export default {
    methods: {
logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("farm");
  this.$router.push("/login");
}
    }
    };
    </script>