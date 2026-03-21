<template>
  <div
    class="login-page d-flex align-items-center justify-content-center"
    style="min-height: 100vh; background-color: #f4f6f9;"
  >
    <div class="card shadow-lg border-0 rounded-lg" style="width: 100%; max-width: 450px;">
      <div class="card-header bg-white text-center pt-4 pb-0 border-0">
        <h3 class="font-weight-bold" style="color: #6a1b9a;">ĐĂNG NHẬP</h3>
        <p class="text-muted small">Chào mừng bạn quay trở lại PetShop</p>
      </div>

      <div class="card-body p-4">
        <div
          v-if="errorMessage"
          class="alert alert-danger py-2 small font-weight-bold text-center"
        >
          <i class="fas fa-exclamation-triangle mr-1"></i> {{ errorMessage }}
        </div>

        <form @submit.prevent="handleLogin">
          <div class="form-group mb-3">
            <label class="font-weight-bold text-dark small">Tên đăng nhập</label>
            <div class="input-group">
              <div class="input-group-prepend">
                <span class="input-group-text bg-light border-right-0">
                  <i class="fas fa-user text-muted"></i>
                </span>
              </div>
              <input
                type="text"
                class="form-control bg-light border-left-0"
                v-model="credentials.username"
                placeholder="Nhập tên đăng nhập..."
                required
              />
            </div>
          </div>

          <div class="form-group mb-4">
            <label class="font-weight-bold text-dark small">Mật khẩu</label>
            <div class="input-group">
              <div class="input-group-prepend">
                <span class="input-group-text bg-light border-right-0">
                  <i class="fas fa-lock text-muted"></i>
                </span>
              </div>
              <input
                type="password"
                class="form-control bg-light border-left-0"
                v-model="credentials.password"
                placeholder="Nhập mật khẩu..."
                required
              />
            </div>
          </div>

          <button
            type="submit"
            class="btn btn-block text-white font-weight-bold py-2 shadow-sm"
            style="background-color: #6a1b9a;"
            :disabled="loading"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm mr-2"></span>
            {{ loading ? "Đang xác thực..." : "ĐĂNG NHẬP" }}
          </button>
        </form>

        <div class="text-center mt-4">
          <p class="small text-muted mb-0">
            Chưa có tài khoản?
            <router-link
              to="/register"
              class="font-weight-bold text-primary text-decoration-none"
            >
              Đăng ký ngay
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AuthService from "@/services/auth.service";

export default {
  data() {
    return {
      credentials: {
        username: "",
        password: "",
      },
      errorMessage: "",
      loading: false,
    };
  },

  methods: {
    async handleLogin() {
      this.loading = true;
      this.errorMessage = "";

      try {
        const response = await AuthService.login(this.credentials);

        if (!response || !response.user) {
          throw new Error("Dữ liệu đăng nhập trả về không hợp lệ.");
        }

        // Xóa dữ liệu cũ trước khi lưu mới
        localStorage.removeItem("user");
        localStorage.removeItem("farm");

        // Lưu user chung
        localStorage.setItem("user", JSON.stringify(response.user));

        // Nếu là tài khoản farm thì lưu thêm để các trang farm dùng ổn định
        if (response.user.role === "farm") {
          localStorage.setItem("farm", JSON.stringify(response.user));
        }

        alert("✅ " + (response.message || "Đăng nhập thành công"));

        const role = response.user.role;

        if (role === "admin") {
          this.$router.push("/admin/dashboard");
        } else if (role === "farm") {
          this.$router.push("/farm/dashboard");
        } else {
          this.$router.push("/");
        }
      } catch (error) {
        console.error(error);
        this.errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Đăng nhập thất bại. Vui lòng thử lại!";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>