<template>
  <div class="profile-page py-5" style="background-color: #f4f6f9; min-height: 90vh;">
    <div class="container custom-container">
      <div class="row justify-content-center">
        <div class="col-lg-10">
          <div class="card border-0 shadow-lg rounded-lg overflow-hidden">
            <div class="row no-gutters">

              <div class="col-md-4 bg-white border-right p-4 text-center d-flex flex-column align-items-center">
                <div class="avatar-container mb-3 position-relative mt-4">
                  <img
                    :src="user.avatar || generateAvatar()"
                    class="rounded-circle shadow-sm border border-light"
                    style="width: 150px; height: 150px; object-fit: cover;"
                  >
                  <button
                    type="button"
                    class="btn btn-primary rounded-circle position-absolute shadow-sm d-flex align-items-center justify-content-center"
                    style="bottom: 5px; right: 10px; width: 38px; height: 38px; background-color: #6a1b9a; border: none;"
                    disabled
                    title="Tạm thời chưa hỗ trợ đổi avatar"
                  >
                    <i class="fas fa-camera text-white"></i>
                  </button>
                </div>

                <h5 class="font-weight-bold mb-1 text-dark">
                  {{ user.fullName || user.username }}
                </h5>
                <p class="text-muted small mb-4">
                  Tham gia: {{ formatDate(user.createdAt) }}
                </p>

                <div class="list-group list-group-flush w-100 text-left mb-4">
                  <a
                    href="#"
                    class="list-group-item list-group-item-action border-0 active shadow-sm rounded mb-2 font-weight-bold"
                    style="background-color: #6a1b9a;"
                  >
                    <i class="fas fa-user-edit mr-2"></i> Thông tin cá nhân
                  </a>

                  <router-link
                    to="/tra-cuu-don"
                    class="list-group-item list-group-item-action border-0 mb-2 font-weight-bold text-secondary"
                  >
                    <i class="fas fa-shopping-bag mr-2 text-warning"></i> Lịch sử đặt cọc
                  </router-link>

                  <router-link
                    to="/accessory-orders"
                    class="list-group-item list-group-item-action border-0 mb-2 font-weight-bold text-secondary"
                  >
                    <i class="fas fa-box mr-2 text-primary"></i> Đơn phụ kiện
                  </router-link>

                  <router-link
                    to="/service-bookings"
                    class="list-group-item list-group-item-action border-0 mb-2 font-weight-bold text-secondary"
                  >
                    <i class="fas fa-calendar-check mr-2 text-success"></i> Lịch dịch vụ
                  </router-link>

                  <a
                    href="#"
                    class="list-group-item list-group-item-action border-0 text-danger font-weight-bold"
                    @click.prevent="logout"
                  >
                    <i class="fas fa-sign-out-alt mr-2"></i> Đăng xuất
                  </a>
                </div>
              </div>

              <div class="col-md-8 bg-white p-4 p-md-5">
                <h4
                  class="font-weight-bold mb-4"
                  style="color: #6a1b9a; border-bottom: 2px solid #f4f6f9; padding-bottom: 10px;"
                >
                  HỒ SƠ CỦA TÔI
                </h4>

                <form @submit.prevent="saveProfile">
                  <div class="row">
                    <div class="col-md-6 form-group mb-3">
                      <label class="small font-weight-bold text-muted">
                        Tên đăng nhập <span class="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        class="form-control bg-light text-muted"
                        v-model="user.username"
                        disabled
                      >
                      <small class="text-info">Tên đăng nhập không thể thay đổi</small>
                    </div>

                    <div class="col-md-6 form-group mb-3">
                      <label class="small font-weight-bold text-muted">
                        Họ và tên <span class="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        class="form-control font-weight-bold"
                        v-model.trim="user.fullName"
                        required
                      >
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-md-6 form-group mb-3">
                      <label class="small font-weight-bold text-muted">Email</label>
                      <input
                        type="email"
                        class="form-control bg-light"
                        v-model="user.email"
                        disabled
                      >
                    </div>

                    <div class="col-md-6 form-group mb-3">
                      <label class="small font-weight-bold text-muted">Số điện thoại</label>
                      <input
                        type="text"
                        class="form-control"
                        v-model.trim="user.phone"
                        placeholder="Chưa cập nhật..."
                      >
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-md-6 form-group mb-3">
                      <label class="small font-weight-bold text-muted d-block">Giới tính</label>

                      <div class="custom-control custom-radio custom-control-inline mt-2">
                        <input
                          type="radio"
                          id="male"
                          v-model="user.gender"
                          value="Nam"
                          class="custom-control-input"
                        >
                        <label class="custom-control-label" for="male">Nam</label>
                      </div>

                      <div class="custom-control custom-radio custom-control-inline mt-2">
                        <input
                          type="radio"
                          id="female"
                          v-model="user.gender"
                          value="Nữ"
                          class="custom-control-input"
                        >
                        <label class="custom-control-label" for="female">Nữ</label>
                      </div>

                      <div class="custom-control custom-radio custom-control-inline mt-2">
                        <input
                          type="radio"
                          id="other"
                          v-model="user.gender"
                          value="Khác"
                          class="custom-control-input"
                        >
                        <label class="custom-control-label" for="other">Khác</label>
                      </div>
                    </div>

                    <div class="col-md-6 form-group mb-3">
                      <label class="small font-weight-bold text-muted">Ngày sinh</label>
                      <input
                        type="date"
                        class="form-control"
                        v-model="formattedBirthday"
                        :max="today"
                      >
                    </div>
                  </div>

                  <div class="form-group mb-4">
                    <label class="small font-weight-bold text-muted">
                      Địa chỉ nhận cún / giao hàng mặc định
                    </label>
                    <textarea
                      class="form-control"
                      rows="3"
                      v-model.trim="user.address"
                      placeholder="Ví dụ: Số 428 Minh Khai, Hai Bà Trưng, Hà Nội..."
                    ></textarea>
                  </div>

                  <div class="text-right">
                    <button
                      type="submit"
                      class="btn text-white font-weight-bold px-5 py-2 shadow-sm rounded"
                      style="background-color: #ff9800;"
                    >
                      <i class="fas fa-save mr-2"></i> LƯU THAY ĐỔI
                    </button>
                  </div>
                </form>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      user: {
        username: "",
        fullName: "",
        email: "",
        phone: "",
        gender: "Khác",
        birthday: "",
        address: "",
        avatar: "",
        createdAt: new Date(),
      },
      today: new Date().toISOString().split("T")[0],
    };
  },

  computed: {
    formattedBirthday: {
      get() {
        if (!this.user.birthday) return "";
        try {
          return new Date(this.user.birthday).toISOString().substr(0, 10);
        } catch (e) {
          return "";
        }
      },
      set(val) {
        this.user.birthday = val;
      },
    },
  },

  created() {
    this.loadUserData();
  },

  methods: {
    loadUserData() {
      const data = localStorage.getItem("user");
      if (!data) {
        alert("Vui lòng đăng nhập để xem hồ sơ.");
        this.$router.push("/login");
        return;
      }

      try {
        const parsedData = JSON.parse(data);
        this.user = { ...this.user, ...parsedData };
      } catch (error) {
        console.error("Lỗi đọc dữ liệu user:", error);
      }
    },

    generateAvatar() {
      const name = this.user.fullName || this.user.username || "User";
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=150&font-size=0.4`;
    },

    formatDate(d) {
      if (!d) return "Hôm nay";
      return new Date(d).toLocaleDateString("vi-VN");
    },

    validateProfile() {
      if (!this.user.fullName || !this.user.fullName.trim()) {
        alert("Vui lòng nhập họ và tên.");
        return false;
      }

      if (this.user.phone && !/^(0|\+84)[0-9]{9,10}$/.test(this.user.phone.trim())) {
        alert("Số điện thoại không hợp lệ.");
        return false;
      }

      if (this.user.birthday && this.user.birthday > this.today) {
        alert("Ngày sinh không được lớn hơn hôm nay.");
        return false;
      }

      return true;
    },

    saveProfile() {
      if (!this.validateProfile()) return;

      try {
        const updatedUser = {
          ...this.user,
          fullName: this.user.fullName?.trim() || "",
          phone: this.user.phone?.trim() || "",
          address: this.user.address?.trim() || "",
        };

        localStorage.setItem("user", JSON.stringify(updatedUser));
        this.user = updatedUser;

        alert("✅ Đã cập nhật hồ sơ thành công!");

        window.dispatchEvent(new CustomEvent("user-updated", {
          detail: updatedUser,
        }));
      } catch (error) {
        alert("❌ Không thể lưu hồ sơ.");
      }
    },

    logout() {
      if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        this.$router.push("/login").then(() => window.location.reload());
      }
    },
  },
};
</script>

<style scoped>
.custom-control-input:checked ~ .custom-control-label::before {
  border-color: #6a1b9a;
  background-color: #6a1b9a;
}
.form-control:focus {
  border-color: #6a1b9a;
  box-shadow: 0 0 0 0.2rem rgba(106, 27, 154, 0.25);
}
@media (min-width: 1200px) {
  .custom-container { max-width: 1100px !important; }
}
</style>