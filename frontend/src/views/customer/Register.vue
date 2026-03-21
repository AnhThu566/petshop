<template>
  <div class="register-page d-flex align-items-center justify-content-center py-5" style="min-height: 100vh; background-color: #f4f6f9;">
    <div class="card shadow-lg border-0 rounded-lg" style="width: 100%; max-width: 500px;">
      <div class="card-header bg-white text-center pt-4 pb-0 border-0">
        <h3 class="font-weight-bold" style="color: #6a1b9a;">TẠO TÀI KHOẢN</h3>
        <p class="text-muted small">Đăng ký để trở thành thành viên của PetShop</p>
      </div>
      
      <div class="card-body p-4">
        <form @submit.prevent="handleRegister">
          
          <div class="form-group mb-3">
            <label class="font-weight-bold text-dark small">Họ và Tên <span class="text-danger">*</span></label>
            <input type="text" class="form-control bg-light" v-model="user.fullName" placeholder="Nhập họ và tên..." required>
          </div>

          <div class="form-group mb-3">
            <label class="font-weight-bold text-dark small">Email <span class="text-danger">*</span></label>
            <input type="email" class="form-control bg-light" v-model="user.email" placeholder="example@gmail.com" required>
          </div>

          <div class="form-group mb-3">
            <label class="font-weight-bold text-dark small">Số điện thoại <span class="text-danger">*</span></label>
            <input type="text" class="form-control bg-light" v-model="user.phone" placeholder="Nhập số điện thoại..." required>
          </div>

          <div class="form-group mb-3">
            <label class="font-weight-bold text-dark small">Tên đăng nhập <span class="text-danger">*</span></label>
            <input type="text" class="form-control bg-light" v-model="user.username" placeholder="Nhập tên đăng nhập viết liền không dấu..." required>
          </div>

          <div class="form-group mb-4">
            <label class="font-weight-bold text-dark small">Mật khẩu <span class="text-danger">*</span></label>
            <input type="password" class="form-control bg-light" v-model="user.password" placeholder="Nhập mật khẩu..." required>
          </div>

          <button type="submit" class="btn btn-block text-white font-weight-bold py-2 shadow-sm" style="background-color: #ff9800;" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm mr-2"></span>
            {{ loading ? 'Đang xử lý...' : 'ĐĂNG KÝ NGAY' }}
          </button>

        </form>

        <div class="text-center mt-4">
          <p class="small text-muted mb-0">Bạn đã có tài khoản? 
            <router-link to="/login" class="font-weight-bold text-primary text-decoration-none">Đăng nhập tại đây</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// Nhúng file auth.service.js của em vào đây
import AuthService from "@/services/auth.service";

export default {
  data() {
    return {
      // Data này khớp 100% với user.model.js và req.body bên Backend
      user: {
        fullName: "",
        email: "",
        phone: "",
        username: "",
        password: ""
      },
      loading: false
    };
  },
  methods: {
    async handleRegister() {
      this.loading = true;
      try {
        // 👉 GỌI HÀM create() THEO ĐÚNG TÊN EM ĐẶT TRONG auth.service.js
        const response = await AuthService.create(this.user);
        
        alert("✅ " + response.message); // Báo thành công
        this.$router.push("/login"); // Chuyển sang trang đăng nhập
        
      } catch (error) {
        console.error(error);
        alert("❌ Lỗi: " + (error.response?.data?.message || "Không thể đăng ký!"));
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>