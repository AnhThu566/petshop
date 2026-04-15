<template>
  <div class="farm-account-page bg-light py-4" style="min-height: 100vh;">
    <div class="container-fluid">
      <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3 flex-wrap">
        <h4 class="font-weight-bold text-dark mb-2">
          <i class="fas fa-user-circle text-success mr-2"></i>
          HỒ SƠ CÁ NHÂN
        </h4>

        <button class="btn btn-outline-success btn-sm" @click="loadUserInfo">
          <i class="fas fa-sync-alt mr-1"></i> Làm mới
        </button>
      </div>

      <div v-if="loading" class="card border-0 shadow-sm">
        <div class="card-body text-center py-5 text-muted">
          <i class="fas fa-spinner fa-spin fa-2x mb-3 d-block"></i>
          Đang tải hồ sơ cá nhân...
        </div>
      </div>

      <div v-else class="row">
        <div class="col-lg-4 mb-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body text-center">
              <div
                class="mx-auto rounded-circle bg-success text-white d-flex align-items-center justify-content-center shadow-sm mb-3"
                style="width: 120px; height: 120px; font-size: 2.2rem;"
              >
                <i class="fas fa-user"></i>
              </div>

              <h4 class="font-weight-bold text-dark mb-2">
                {{ form.fullName || "Chủ tài khoản" }}
              </h4>

              <p class="text-muted mb-3">
                Tài khoản trang trại
              </p>

              <span class="badge badge-success px-3 py-2 mb-3">
                Đang hoạt động
              </span>

              <div class="list-group text-left">
                <button
                  class="list-group-item list-group-item-action font-weight-bold"
                  :class="{ active: activeTab === 'info' }"
                  @click="activeTab = 'info'"
                >
                  <i class="fas fa-id-card mr-2"></i>
                  Thông tin cá nhân
                </button>

                <button
                  class="list-group-item list-group-item-action font-weight-bold"
                  :class="{ active: activeTab === 'password' }"
                  @click="activeTab = 'password'"
                >
                  <i class="fas fa-lock mr-2"></i>
                  Đổi mật khẩu
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-8 mb-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white border-0 pt-4 pb-0">
              <h5 class="font-weight-bold text-success mb-0" v-if="activeTab === 'info'">
                <i class="fas fa-info-circle mr-2"></i>Thông tin cá nhân
              </h5>

              <h5 class="font-weight-bold text-success mb-0" v-else>
                <i class="fas fa-key mr-2"></i>Đổi mật khẩu
              </h5>
            </div>

            <div class="card-body pt-4">
              <!-- TAB THÔNG TIN -->
              <form v-if="activeTab === 'info'" @submit.prevent="saveProfile">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="small text-muted font-weight-bold">Tên đăng nhập</label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="form.username"
                      disabled
                    />
                  </div>

                  <div class="col-md-6 mb-3">
                    <label class="small text-muted font-weight-bold">Họ tên người đại diện</label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="form.fullName"
                      placeholder="Nhập họ tên"
                    />
                  </div>

                  <div class="col-md-6 mb-3">
                    <label class="small text-muted font-weight-bold">Email</label>
                    <input
                      type="email"
                      class="form-control"
                      v-model="form.email"
                      placeholder="Nhập email"
                    />
                  </div>

                  <div class="col-md-6 mb-3">
                    <label class="small text-muted font-weight-bold">Số điện thoại</label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="form.phone"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                </div>

                <div class="d-flex justify-content-end">
                  <button type="submit" class="btn btn-success px-4">
                    <i class="fas fa-save mr-2"></i>Lưu thay đổi
                  </button>
                </div>
              </form>

              <!-- TAB ĐỔI MẬT KHẨU -->
              <form v-else @submit.prevent="changePassword">
                <div class="row">
                  <div class="col-md-12 mb-3">
                    <label class="small text-muted font-weight-bold">Mật khẩu hiện tại</label>
                    <input
                      type="password"
                      class="form-control"
                      v-model="passwordForm.currentPassword"
                      placeholder="Nhập mật khẩu hiện tại"
                    />
                  </div>

                  <div class="col-md-6 mb-3">
                    <label class="small text-muted font-weight-bold">Mật khẩu mới</label>
                    <input
                      type="password"
                      class="form-control"
                      v-model="passwordForm.newPassword"
                      placeholder="Nhập mật khẩu mới"
                    />
                  </div>

                  <div class="col-md-6 mb-3">
                    <label class="small text-muted font-weight-bold">Xác nhận mật khẩu mới</label>
                    <input
                      type="password"
                      class="form-control"
                      v-model="passwordForm.confirmPassword"
                      placeholder="Nhập lại mật khẩu mới"
                    />
                  </div>
                </div>

                <div class="d-flex justify-content-end">
                  <button type="submit" class="btn btn-warning px-4 font-weight-bold">
                    <i class="fas fa-key mr-2"></i>Đổi mật khẩu
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "FarmAccountProfilePage",

  data() {
    return {
      loading: false,
      activeTab: "info",
      currentUser: null,
      form: {
        username: "",
        fullName: "",
        email: "",
        phone: "",
      },
      passwordForm: {
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      },
    };
  },

  methods: {
    loadUserInfo() {
      this.loading = true;
      try {
        const userData = localStorage.getItem("user");
        if (!userData) {
          throw new Error("Không tìm thấy thông tin đăng nhập.");
        }

        this.currentUser = JSON.parse(userData);

        this.form.username = this.currentUser.username || "";
        this.form.fullName = this.currentUser.fullName || "";
        this.form.email = this.currentUser.email || "";
        this.form.phone = this.currentUser.phone || "";
      } catch (error) {
        console.error("Lỗi tải hồ sơ cá nhân:", error);
        alert(error.message || "Không thể tải hồ sơ cá nhân.");
      } finally {
        this.loading = false;
      }
    },

    saveProfile() {
      alert("Hiện tại bạn có thể làm bước này sau: nối API cập nhật hồ sơ cá nhân chủ trại.");
    },

    changePassword() {
      if (!this.passwordForm.currentPassword || !this.passwordForm.newPassword) {
        alert("Vui lòng nhập đầy đủ thông tin mật khẩu.");
        return;
      }

      if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
        alert("Xác nhận mật khẩu mới không khớp.");
        return;
      }

      alert("Hiện tại bạn có thể làm bước này sau: nối API đổi mật khẩu.");
    },
  },

  mounted() {
    this.loadUserInfo();
  },
};
</script>

<style scoped>
.list-group-item.active {
  background-color: #28a745;
  border-color: #28a745;
}
</style>