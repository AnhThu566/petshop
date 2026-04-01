<template>
  <div class="register-page">
    <div class="bg-circle circle-1"></div>
    <div class="bg-circle circle-2"></div>
    <div class="bg-circle circle-3"></div>

    <div class="container">
      <div class="row justify-content-center align-items-center min-vh-100 py-5">
        <div class="col-xl-4 col-lg-5 col-md-7 col-sm-10">
          <div class="register-card shadow-lg">
            <div class="register-card-body">
              <div class="text-center mb-4">
                <div class="register-logo mx-auto mb-3">
                  <i class="fas fa-user-plus"></i>
                </div>

                <h2 class="register-title font-weight-bold mb-2">ĐĂNG KÝ</h2>
                <p class="text-muted mb-0">Tạo tài khoản để sử dụng hệ thống</p>
              </div>

              <div
                v-if="errorMessage"
                class="alert alert-danger text-center small font-weight-bold"
              >
                <i class="fas fa-exclamation-triangle mr-1"></i>
                {{ errorMessage }}
              </div>

              <div
                v-if="successMessage"
                class="alert alert-success text-center small font-weight-bold"
              >
                <i class="fas fa-check-circle mr-1"></i>
                {{ successMessage }}
              </div>

              <form @submit.prevent="handleRegister">
                <div class="form-group mb-3">
                  <label class="form-label">Họ và tên</label>
                  <div class="input-wrap">
                    <span class="input-icon">
                      <i class="fas fa-id-card"></i>
                    </span>
                    <input
                      type="text"
                      class="form-control custom-input"
                      v-model.trim="form.fullName"
                      placeholder="Nhập họ và tên..."
                      required
                    />
                  </div>
                </div>

                <div class="form-group mb-3">
                  <label class="form-label">Tên đăng nhập</label>
                  <div class="input-wrap">
                    <span class="input-icon">
                      <i class="fas fa-user"></i>
                    </span>
                    <input
                      type="text"
                      class="form-control custom-input"
                      v-model.trim="form.username"
                      placeholder="Nhập tên đăng nhập..."
                      required
                    />
                  </div>
                </div>

                <div class="form-group mb-3">
                  <label class="form-label">Email</label>
                  <div class="input-wrap">
                    <span class="input-icon">
                      <i class="fas fa-envelope"></i>
                    </span>
                    <input
                      type="email"
                      class="form-control custom-input"
                      v-model.trim="form.email"
                      placeholder="Nhập email..."
                      required
                    />
                  </div>
                </div>

                <div class="form-group mb-3">
                  <label class="form-label">Số điện thoại</label>
                  <div class="input-wrap">
                    <span class="input-icon">
                      <i class="fas fa-phone-alt"></i>
                    </span>
                    <input
                      type="text"
                      class="form-control custom-input"
                      v-model.trim="form.phone"
                      placeholder="Nhập số điện thoại..."
                    />
                  </div>
                </div>

                <div class="form-group mb-4">
                  <label class="form-label">Mật khẩu</label>
                  <div class="input-wrap">
                    <span class="input-icon">
                      <i class="fas fa-lock"></i>
                    </span>
                    <input
                      type="password"
                      class="form-control custom-input"
                      v-model="form.password"
                      placeholder="Nhập mật khẩu..."
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  class="btn btn-register-main btn-block font-weight-bold"
                  :disabled="loading"
                >
                  <span v-if="loading" class="spinner-border spinner-border-sm mr-2"></span>
                  {{ loading ? "Đang xử lý..." : "ĐĂNG KÝ" }}
                </button>
              </form>

              <div class="divider my-4">
                <span>HOẶC</span>
              </div>

              <div class="text-center">
                <router-link to="/login" class="btn btn-login-link px-4 font-weight-bold">
                  <i class="fas fa-sign-in-alt mr-2"></i>Đăng nhập ngay
                </router-link>
              </div>

              <div class="text-center mt-4">
                <router-link to="/" class="back-home-link">
                  <i class="fas fa-arrow-left mr-1"></i>
                  Quay về trang chủ
                </router-link>
              </div>
            </div>
          </div>
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
      form: {
        fullName: "",
        username: "",
        email: "",
        phone: "",
        password: "",
      },
      loading: false,
      errorMessage: "",
      successMessage: "",
    };
  },

  methods: {
    async handleRegister() {
      this.loading = true;
      this.errorMessage = "";
      this.successMessage = "";

      try {
        const response = await AuthService.create(this.form);

        this.successMessage = response.message || "Đăng ký thành công!";
        alert("✅ Đăng ký thành công! Vui lòng đăng nhập.");
        this.$router.push("/login");
      } catch (error) {
        console.error(error);
        this.errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Đăng ký thất bại. Vui lòng thử lại!";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, #faf7fd 0%, #f4ebf8 45%, #ffffff 100%);
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(8px);
  opacity: 0.45;
  animation: floatMove 8s ease-in-out infinite;
}

.circle-1 {
  width: 260px;
  height: 260px;
  background: #ead7f7;
  top: -70px;
  left: -60px;
}

.circle-2 {
  width: 220px;
  height: 220px;
  background: #f6d7ea;
  bottom: -50px;
  right: -50px;
  animation-delay: 1.5s;
}

.circle-3 {
  width: 140px;
  height: 140px;
  background: #e2d9ff;
  top: 20%;
  right: 12%;
  animation-delay: 3s;
}

.register-card {
  position: relative;
  z-index: 2;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(10px);
  border-radius: 28px;
  border: 1px solid #eee5f5;
  box-shadow: 0 24px 60px rgba(106, 27, 154, 0.12) !important;
}

.register-card-body {
  padding: 42px 34px;
}

.register-logo {
  width: 82px;
  height: 82px;
  border-radius: 50%;
  background: linear-gradient(145deg, #6a1b9a, #8e24aa);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.7rem;
  box-shadow: 0 16px 30px rgba(106, 27, 154, 0.22);
  animation: pulseGlow 2.8s ease-in-out infinite;
}

.register-title {
  color: #6a1b9a;
  letter-spacing: 0.5px;
}

.form-label {
  font-size: 0.86rem;
  font-weight: 700;
  color: #2f2438;
  margin-bottom: 8px;
}

.input-wrap {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #8f83a0;
  z-index: 3;
  transition: all 0.25s ease;
}

.custom-input {
  height: 54px;
  border-radius: 16px;
  border: 1px solid #e7daf2;
  padding-left: 46px;
  font-size: 0.95rem;
  background: #fff;
  transition: all 0.25s ease;
}

.custom-input:focus {
  box-shadow: 0 0 0 4px rgba(106, 27, 154, 0.08);
  border-color: #6a1b9a;
}

.input-wrap:focus-within .input-icon {
  color: #6a1b9a;
}

.btn-register-main {
  height: 54px;
  border-radius: 16px;
  border: none;
  color: white;
  background: linear-gradient(145deg, #6a1b9a, #4a148c);
  transition: all 0.25s ease;
}

.btn-register-main:hover {
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 14px 28px rgba(106, 27, 154, 0.22);
}

.btn-register-main:disabled {
  opacity: 0.85;
  transform: none;
}

.divider {
  position: relative;
  text-align: center;
}

.divider::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  border-top: 1px solid #eee4f4;
  transform: translateY(-50%);
}

.divider span {
  position: relative;
  background: rgba(255, 255, 255, 0.88);
  padding: 0 14px;
  color: #9b8ead;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 1px;
}

.btn-login-link {
  height: 44px;
  line-height: 28px;
  border-radius: 999px;
  border: 1px solid #d9c4ea;
  color: #6a1b9a;
  background: #fff;
  transition: all 0.2s ease;
}

.btn-login-link:hover {
  background: #f4ebf8;
  color: #4a148c;
  transform: translateY(-1px);
}

.back-home-link {
  color: #7d718e;
  text-decoration: none;
  font-size: 0.9rem;
}

.back-home-link:hover {
  color: #6a1b9a;
  text-decoration: none;
}

@keyframes floatMove {
  0%,
  100% {
    transform: translateY(0px) translateX(0px);
  }
  50% {
    transform: translateY(-10px) translateX(6px);
  }
}

@keyframes pulseGlow {
  0%,
  100% {
    box-shadow: 0 16px 30px rgba(106, 27, 154, 0.22);
  }
  50% {
    box-shadow: 0 18px 34px rgba(106, 27, 154, 0.3);
  }
}

@media (max-width: 575.98px) {
  .register-card {
    border-radius: 22px;
  }

  .register-card-body {
    padding: 30px 20px;
  }

  .register-title {
    font-size: 1.7rem;
  }

  .register-logo {
    width: 74px;
    height: 74px;
    font-size: 1.5rem;
  }
}
</style>