<template>
  <div class="farm-profile-page bg-light py-4" style="min-height: 100vh;">
    <div class="container-fluid">
      <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3 flex-wrap">
        <h4 class="font-weight-bold text-dark mb-2">
          <i class="fas fa-warehouse text-success mr-2"></i>
          THÔNG TIN TRANG TRẠI
        </h4>

        <button class="btn btn-outline-success btn-sm" @click="loadFarmInfo" :disabled="loading">
          <i class="fas fa-sync-alt mr-1"></i> Làm mới
        </button>
      </div>

      <div v-if="loading" class="card border-0 shadow-sm">
        <div class="card-body text-center py-5 text-muted">
          <i class="fas fa-spinner fa-spin fa-2x mb-3 d-block"></i>
          Đang tải thông tin trang trại...
        </div>
      </div>

      <div v-else-if="!farmInfo" class="card border-0 shadow-sm">
        <div class="card-body text-center py-5 text-muted">
          <i class="fas fa-exclamation-circle fa-3x mb-3 d-block"></i>
          Không tìm thấy thông tin trang trại.
        </div>
      </div>

      <div v-else class="row">
        <div class="col-lg-4 mb-4">
          <div class="card border-0 shadow-sm h-100 profile-side-card">
            <div class="card-body text-center">
              <div class="farm-image-wrap mx-auto mb-3">
                <img
                  v-if="previewImage || farmDisplayImage"
                  :src="previewImage || farmDisplayImage"
                  alt="Ảnh trang trại"
                  class="farm-image"
                />
                <div v-else class="farm-image-placeholder">
                  <i class="fas fa-warehouse"></i>
                </div>
              </div>

              <h4 class="font-weight-bold text-dark mb-2">
                {{ localForm.name || farmInfo.name || "Trang trại" }}
              </h4>

              <p class="text-muted mb-3">
                Đối tác cung cấp chó cho hệ thống
              </p>

              <span class="badge badge-success px-3 py-2 mb-3">
                {{ getFarmStatusText(farmInfo.status) }}
              </span>

              <div class="mb-4">
                <input
                  ref="farmImageInput"
                  type="file"
                  accept="image/*"
                  class="d-none"
                  @change="handleImageChange"
                />
                <button type="button" class="btn btn-outline-success px-4" @click="triggerImageSelect">
                  <i class="fas fa-camera mr-2"></i>Đổi ảnh
                </button>
              </div>

              <div class="profile-menu text-left mt-3">
                <button
                  type="button"
                  class="profile-menu-item w-100 text-left"
                  :class="{ active: activeTab === 'info' }"
                  @click="activeTab = 'info'"
                >
                  <i class="fas fa-info-circle mr-2"></i>
                  Thông tin trang trại
                </button>

                <button
                  type="button"
                  class="profile-menu-item w-100 text-left mt-2"
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
              <h3 class="font-weight-bold text-success mb-0 section-heading" v-if="activeTab === 'info'">
                Thông tin trang trại
              </h3>

              <h3 class="font-weight-bold text-success mb-0 section-heading" v-else>
                Đổi mật khẩu
              </h3>
            </div>

            <div class="card-body pt-4">
              <div v-if="successMessage" class="alert alert-success">
                {{ successMessage }}
              </div>

              <div v-if="errorMessage" class="alert alert-danger">
                {{ errorMessage }}
              </div>

              <form v-if="activeTab === 'info'" @submit.prevent="saveFarmProfile">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="field-label">Người đại diện</label>
                    <input
                      type="text"
                      class="form-control custom-input"
                      :value="currentUser?.fullName || farmInfo.ownerId?.fullName || ''"
                      disabled
                    />
                    <small class="text-muted">Thông tin này do hệ thống quản lý.</small>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label class="field-label">Tên trang trại</label>
                    <input
                      type="text"
                      class="form-control custom-input"
                      v-model.trim="localForm.name"
                      placeholder="Nhập tên trang trại"
                    />
                  </div>

                  <div class="col-md-6 mb-3">
                    <label class="field-label">Số điện thoại</label>
                    <input
                      type="text"
                      class="form-control custom-input"
                      v-model.trim="localForm.phone"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>

                  <div class="col-md-6 mb-3">
                    <label class="field-label">Email liên hệ</label>
                    <input
                      type="email"
                      class="form-control custom-input"
                      :value="currentUser?.email || ''"
                      disabled
                    />
                    <small class="text-muted">Email thuộc tài khoản đăng nhập, không chỉnh ở đây.</small>
                  </div>

                  <div class="col-md-12 mb-3">
                    <label class="field-label">Địa chỉ</label>
                    <input
                      type="text"
                      class="form-control custom-input"
                      v-model.trim="localForm.address"
                      placeholder="Nhập địa chỉ trang trại"
                    />
                  </div>

                  <div class="col-md-12 mb-4">
                    <label class="field-label">Mô tả trang trại</label>
                    <textarea
                      class="form-control custom-input custom-textarea"
                      v-model.trim="localForm.description"
                      placeholder="Nhập mô tả ngắn về trang trại"
                    ></textarea>
                  </div>
                </div>

                <div class="d-flex justify-content-end">
                  <button type="button" class="btn btn-outline-secondary px-4 mr-2" @click="resetForm">
                    Hủy
                  </button>
                  <button type="submit" class="btn btn-success px-4" :disabled="savingProfile">
                    {{ savingProfile ? "Đang lưu..." : "Lưu thay đổi" }}
                  </button>
                </div>
              </form>

              <form v-else @submit.prevent="changePassword">
                <div class="row">
                  <div class="col-md-12 mb-3">
                    <label class="field-label">Mật khẩu hiện tại <span class="text-danger">*</span></label>
                    <div class="password-input-group">
                      <input
                        :type="showPassword.current ? 'text' : 'password'"
                        class="form-control custom-input password-input"
                        v-model="passwordForm.currentPassword"
                        placeholder="Nhập mật khẩu hiện tại"
                      />
                      <button
                        type="button"
                        class="toggle-password-btn"
                        @click="showPassword.current = !showPassword.current"
                      >
                        <i class="fas" :class="showPassword.current ? 'fa-eye-slash' : 'fa-eye'"></i>
                      </button>
                    </div>
                  </div>

                  <div class="col-md-12 mb-3">
                    <label class="field-label">Mật khẩu mới <span class="text-danger">*</span></label>
                    <div class="password-input-group">
                      <input
                        :type="showPassword.next ? 'text' : 'password'"
                        class="form-control custom-input password-input"
                        v-model="passwordForm.newPassword"
                        placeholder="Nhập mật khẩu mới"
                      />
                      <button
                        type="button"
                        class="toggle-password-btn"
                        @click="showPassword.next = !showPassword.next"
                      >
                        <i class="fas" :class="showPassword.next ? 'fa-eye-slash' : 'fa-eye'"></i>
                      </button>
                    </div>
                  </div>

                  <div class="col-md-12 mb-4">
                    <label class="field-label">Xác nhận mật khẩu <span class="text-danger">*</span></label>
                    <div class="password-input-group">
                      <input
                        :type="showPassword.confirm ? 'text' : 'password'"
                        class="form-control custom-input password-input"
                        v-model="passwordForm.confirmPassword"
                        placeholder="Nhập lại mật khẩu mới"
                      />
                      <button
                        type="button"
                        class="toggle-password-btn"
                        @click="showPassword.confirm = !showPassword.confirm"
                      >
                        <i class="fas" :class="showPassword.confirm ? 'fa-eye-slash' : 'fa-eye'"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <div class="d-flex justify-content-end">
                  <button type="button" class="btn btn-outline-secondary px-4 mr-2" @click="resetPasswordForm">
                    Hủy
                  </button>
                  <button type="submit" class="btn btn-success px-4" :disabled="changingPassword">
                    {{ changingPassword ? "Đang xử lý..." : "Đổi mật khẩu" }}
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
import createApiClient from "@/services/api.service";
import AuthService from "@/services/auth.service";

export default {
  name: "FarmProfilePage",

  data() {
    return {
      currentUser: null,
      farmInfo: null,
      loading: false,
      activeTab: "info",
      successMessage: "",
      errorMessage: "",
      savingProfile: false,
      changingPassword: false,
      selectedImageFile: null,
      previewImage: "",
      localForm: {
        name: "",
        phone: "",
        address: "",
        description: "",
      },
      passwordForm: {
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      },
      showPassword: {
        current: false,
        next: false,
        confirm: false,
      },
    };
  },

  computed: {
    farmDisplayImage() {
      const image = this.farmInfo?.image || this.farmInfo?.avatar || this.farmInfo?.logo || "";
      if (!image) return "";
      if (String(image).startsWith("http")) return image;
      return `http://localhost:3000${image}`;
    },
  },

  methods: {
    clearMessages() {
      this.successMessage = "";
      this.errorMessage = "";
    },

    triggerImageSelect() {
      this.$refs.farmImageInput?.click();
    },

    handleImageChange(event) {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        this.errorMessage = "Vui lòng chọn đúng file hình ảnh.";
        return;
      }

      this.selectedImageFile = file;
      this.previewImage = URL.createObjectURL(file);
      this.clearMessages();
    },

    fillLocalForm() {
      this.localForm.name = this.farmInfo?.name || "";
      this.localForm.phone = this.farmInfo?.phone || "";
      this.localForm.address = this.farmInfo?.address || "";
      this.localForm.description =
        this.farmInfo?.farmDescription || this.farmInfo?.description || "";
    },

    resetForm() {
      this.fillLocalForm();
      this.selectedImageFile = null;
      this.previewImage = "";
      this.clearMessages();
    },

    resetPasswordForm() {
      this.passwordForm.currentPassword = "";
      this.passwordForm.newPassword = "";
      this.passwordForm.confirmPassword = "";
      this.showPassword.current = false;
      this.showPassword.next = false;
      this.showPassword.confirm = false;
      this.clearMessages();
    },

    getFarmStatusText(status) {
      if (status === "active" || !status) return "Đang hoạt động";
      if (status === "paused") return "Tạm ngưng";
      if (status === "stopped" || status === "inactive") return "Ngừng hoạt động";
      return "Đang cập nhật";
    },

    normalizePhone(phone) {
      return String(phone || "").replace(/\s+/g, "").trim();
    },

    validateProfileForm() {
      if (!this.localForm.name || this.localForm.name.trim().length < 2) {
        throw new Error("Tên trang trại phải có ít nhất 2 ký tự.");
      }

      const normalizedPhone = this.normalizePhone(this.localForm.phone);
      if (!/^(0|\+84)\d{9,10}$/.test(normalizedPhone)) {
        throw new Error("Số điện thoại không hợp lệ.");
      }

      if (!this.localForm.address || this.localForm.address.trim().length < 5) {
        throw new Error("Địa chỉ trang trại chưa hợp lệ.");
      }
    },

    async loadFarmInfo() {
      try {
        this.loading = true;
        this.clearMessages();

        const farmData = localStorage.getItem("farm");
        const userData = localStorage.getItem("user");

        if (userData) {
          this.currentUser = JSON.parse(userData);
        }

        if (farmData) {
          this.farmInfo = JSON.parse(farmData);
        }

        const farmId =
          this.currentUser?.farmId ||
          this.farmInfo?._id ||
          this.farmInfo?.id ||
          null;

        if (!farmId) {
          throw new Error("Không tìm thấy farmId của tài khoản trang trại.");
        }

        const api = createApiClient("/api/farms");
        const response = await api.get(`/${farmId}`);
        const farm = response.data || response;

        if (farm) {
          this.farmInfo = farm;
          localStorage.setItem("farm", JSON.stringify(farm));
        }

        this.fillLocalForm();
      } catch (error) {
        console.error("Lỗi tải thông tin trang trại:", error);
        alert(
          "Không thể tải thông tin trang trại: " +
            (error.response?.data?.message || error.message)
        );
      } finally {
        this.loading = false;
      }
    },

    async saveFarmProfile() {
      this.clearMessages();

      try {
        this.validateProfileForm();
        this.savingProfile = true;

        const farmId = this.farmInfo?._id || this.farmInfo?.id;
        if (!farmId) {
          throw new Error("Không tìm thấy trang trại để cập nhật.");
        }

        const api = createApiClient("/api/farms");
        const payload = new FormData();

        payload.append("name", this.localForm.name.trim());
        payload.append("phone", this.normalizePhone(this.localForm.phone));
        payload.append("address", this.localForm.address.trim());
        payload.append("farmDescription", this.localForm.description.trim());

        if (this.selectedImageFile) {
          payload.append("image", this.selectedImageFile);
        }

        const response = await api.put(`/${farmId}`, payload);

        const updatedFarm = response.data?.farm || response.data || response;
        if (updatedFarm) {
          this.farmInfo = updatedFarm;
          localStorage.setItem("farm", JSON.stringify(updatedFarm));
        }

        this.selectedImageFile = null;
        this.previewImage = "";
        this.successMessage = "Đã cập nhật thông tin trang trại thành công.";
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Không thể cập nhật thông tin trang trại.";
      } finally {
        this.savingProfile = false;
      }
    },

    async changePassword() {
      this.clearMessages();

      try {
        if (!this.passwordForm.currentPassword || !this.passwordForm.newPassword) {
          throw new Error("Vui lòng nhập đầy đủ thông tin mật khẩu.");
        }

        if (this.passwordForm.newPassword.length < 6) {
          throw new Error("Mật khẩu mới phải có ít nhất 6 ký tự.");
        }

        if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
          throw new Error("Xác nhận mật khẩu mới không khớp.");
        }

        if (this.passwordForm.currentPassword === this.passwordForm.newPassword) {
          throw new Error("Mật khẩu mới không được trùng mật khẩu hiện tại.");
        }

        this.changingPassword = true;

        const response = await AuthService.changePassword({
          currentPassword: this.passwordForm.currentPassword,
          newPassword: this.passwordForm.newPassword,
          confirmPassword: this.passwordForm.confirmPassword,
        });

        this.resetPasswordForm();
        this.successMessage = response?.message || "Đổi mật khẩu thành công.";
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Không thể đổi mật khẩu.";
      } finally {
        this.changingPassword = false;
      }
    },
  },

  mounted() {
    this.loadFarmInfo();
  },
};
</script>

<style scoped>
.profile-side-card {
  border-radius: 16px;
}

.farm-image-wrap {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  overflow: hidden;
  background: #eef7f1;
  border: 4px solid #f8fafc;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.farm-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.farm-image-placeholder {
  width: 100%;
  height: 100%;
  color: #198754;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.4rem;
}

.profile-menu-item {
  border: none;
  border-radius: 10px;
  padding: 12px 14px;
  font-weight: 700;
  color: #495057;
  background: #f8f9fa;
}

.profile-menu-item.active {
  background: #198754;
  color: #fff;
}

.section-heading {
  font-size: 2rem;
  color: #198754;
}

.field-label {
  font-size: 0.92rem;
  color: #495057;
  font-weight: 700;
  margin-bottom: 8px;
  display: block;
}

.custom-input {
  min-height: 44px;
  border-radius: 10px;
  background: #fff;
}

.custom-textarea {
  min-height: 140px;
  resize: none;
  padding-top: 12px;
}

.password-input-group {
  position: relative;
}

.password-input {
  padding-right: 46px;
}

.toggle-password-btn {
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  color: #6c757d;
  padding: 0;
  width: 24px;
  height: 24px;
  cursor: pointer;
  outline: none;
}

.toggle-password-btn:hover {
  color: #198754;
}

@media (max-width: 991.98px) {
  .section-heading {
    font-size: 1.5rem;
  }
}
</style>