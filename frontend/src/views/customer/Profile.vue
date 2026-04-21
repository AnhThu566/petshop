<template>
  <div class="profile-page">
    <div class="container profile-container py-4">
      <div class="page-layout">
        <CustomerAccountSidebar active="profile" />

        <main class="content-area">
          <div class="content-card">
            <div class="content-header">
              <div>
                <h2 class="content-title">Hồ sơ của tôi</h2>
                <p class="content-subtitle">
                  Cập nhật thông tin cá nhân để quản lý đặt cọc, phụ kiện và lịch dịch vụ thuận tiện hơn.
                </p>
              </div>

              <button type="button" class="open-password-btn" @click="openPasswordModal">
                <i class="fas fa-key mr-2"></i>
                Đổi mật khẩu
              </button>
            </div>

            <div class="profile-top-box">
              <div class="avatar-section">
                <div class="avatar-wrap">
                  <img
                    v-if="previewAvatar || avatarUrl"
                    :src="previewAvatar || avatarUrl"
                    alt="avatar"
                    class="profile-avatar"
                  />
                  <div v-else class="profile-avatar-placeholder">
                    <i class="fas fa-user"></i>
                  </div>

                  <button
                    type="button"
                    class="avatar-camera-btn"
                    @click="triggerAvatarSelect"
                    title="Đổi ảnh đại diện"
                  >
                    <i class="fas fa-camera"></i>
                  </button>
                </div>

                <input
                  ref="avatarInput"
                  type="file"
                  accept="image/*"
                  class="d-none"
                  @change="handleAvatarChange"
                />

                <div class="avatar-actions">
                  <button type="button" class="avatar-action-btn" @click="triggerAvatarSelect">
                    Chọn ảnh
                  </button>

                  <button
                    v-if="selectedAvatarFile"
                    type="button"
                    class="avatar-action-btn avatar-cancel-btn"
                    @click="removeSelectedAvatar"
                  >
                    Bỏ ảnh mới
                  </button>
                </div>

                <p class="avatar-hint">
                  Chọn ảnh JPG, PNG hoặc WEBP để làm ảnh đại diện.
                </p>
              </div>
            </div>

            <form @submit.prevent="saveProfile">
              <div class="form-grid">
                <div class="form-group">
                  <label>Tên đăng nhập</label>
                  <input
                    type="text"
                    class="form-input input-disabled"
                    v-model="user.username"
                    disabled
                  />
                  <small class="input-note">Tên đăng nhập không thể thay đổi</small>
                </div>

                <div class="form-group">
                  <label>Họ và tên <span class="required">*</span></label>
                  <input
                    type="text"
                    class="form-input"
                    v-model.trim="user.fullName"
                    required
                  />
                </div>

                <div class="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    class="form-input input-disabled"
                    v-model="user.email"
                    disabled
                  />
                </div>

                <div class="form-group">
                  <label>Số điện thoại</label>
                  <input
                    type="text"
                    class="form-input"
                    v-model.trim="user.phone"
                    placeholder="Chưa cập nhật..."
                  />
                </div>

                <div class="form-group">
                  <label>Giới tính</label>
                  <div class="radio-group">
                    <label class="radio-pill">
                      <input type="radio" v-model="user.gender" value="Nam" />
                      <span>Nam</span>
                    </label>

                    <label class="radio-pill">
                      <input type="radio" v-model="user.gender" value="Nữ" />
                      <span>Nữ</span>
                    </label>

                    <label class="radio-pill">
                      <input type="radio" v-model="user.gender" value="Khác" />
                      <span>Khác</span>
                    </label>
                  </div>
                </div>

                <div class="form-group">
                  <label>Ngày sinh</label>
                  <input
                    type="date"
                    class="form-input"
                    v-model="formattedBirthday"
                    :max="today"
                  />
                </div>

                <div class="form-group full-width">
                  <label>Địa chỉ nhận cún / giao hàng mặc định</label>
                  <textarea
                    class="form-textarea"
                    rows="4"
                    v-model.trim="user.address"
                    placeholder="Ví dụ: Số 428 Minh Khai, Hai Bà Trưng, Hà Nội..."
                  ></textarea>
                </div>
              </div>

              <div class="form-actions">
                <button type="submit" class="save-btn" :disabled="savingProfile">
                  <i class="fas fa-save mr-2"></i>
                  {{ savingProfile ? "Đang lưu..." : "Lưu thay đổi" }}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>

    <div
      v-if="showPasswordModal"
      class="password-modal-overlay"
      @click.self="closePasswordModal"
    >
      <div class="password-modal">
        <div class="password-modal-header">
          <div>
            <h3>Đổi mật khẩu</h3>
            <p>Cập nhật mật khẩu mới để bảo mật tài khoản của bạn.</p>
          </div>

          <button type="button" class="password-close-btn" @click="closePasswordModal">
            ×
          </button>
        </div>

        <form @submit.prevent="submitChangePassword" class="password-modal-body">
          <div class="form-group">
            <label>Mật khẩu hiện tại <span class="required">*</span></label>
            <div class="password-input-wrap">
              <input
                :type="showCurrentPassword ? 'text' : 'password'"
                class="form-input"
                v-model.trim="passwordForm.currentPassword"
                placeholder="Nhập mật khẩu hiện tại"
              />
              <button
                type="button"
                class="toggle-password-btn"
                @click="showCurrentPassword = !showCurrentPassword"
              >
                <i :class="showCurrentPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label>Mật khẩu mới <span class="required">*</span></label>
            <div class="password-input-wrap">
              <input
                :type="showNewPassword ? 'text' : 'password'"
                class="form-input"
                v-model.trim="passwordForm.newPassword"
                placeholder="Ít nhất 6 ký tự"
              />
              <button
                type="button"
                class="toggle-password-btn"
                @click="showNewPassword = !showNewPassword"
              >
                <i :class="showNewPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label>Xác nhận mật khẩu mới <span class="required">*</span></label>
            <div class="password-input-wrap">
              <input
                :type="showConfirmPassword ? 'text' : 'password'"
                class="form-input"
                v-model.trim="passwordForm.confirmPassword"
                placeholder="Nhập lại mật khẩu mới"
              />
              <button
                type="button"
                class="toggle-password-btn"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
          </div>

          <div class="password-rules">
            <div class="rules-title">Lưu ý mật khẩu mới</div>
            <ul>
              <li>Tối thiểu 6 ký tự</li>
              <li>Không nên trùng mật khẩu cũ</li>
              <li>Nên dùng chữ và số để bảo mật hơn</li>
            </ul>
          </div>

          <div class="password-modal-actions">
            <button type="button" class="cancel-password-btn" @click="closePasswordModal">
              Đóng
            </button>

            <button
              type="submit"
              class="change-password-btn"
              :disabled="changingPassword"
            >
              <i class="fas fa-key mr-2"></i>
              {{ changingPassword ? "Đang xử lý..." : "Đổi mật khẩu" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import CustomerAccountSidebar from "@/components/customer/CustomerAccountSidebar.vue";
import AuthService from "@/services/auth.service";
import UserService from "@/services/user.service";

export default {
  name: "ProfilePage",
  components: {
    CustomerAccountSidebar,
  },
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

      passwordForm: {
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      },

      showCurrentPassword: false,
      showNewPassword: false,
      showConfirmPassword: false,
      showPasswordModal: false,

      selectedAvatarFile: null,
      previewAvatar: "",
      savingProfile: false,
      changingPassword: false,
      baseImageUrl: "http://localhost:3000",
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

    avatarUrl() {
      if (!this.user.avatar) return "";

      if (
        String(this.user.avatar).startsWith("http://") ||
        String(this.user.avatar).startsWith("https://")
      ) {
        return this.user.avatar;
      }

      return `${this.baseImageUrl}${this.user.avatar}`;
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

    triggerAvatarSelect() {
      this.$refs.avatarInput?.click();
    },

    handleAvatarChange(event) {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        alert("Vui lòng chọn đúng file hình ảnh.");
        return;
      }

      this.selectedAvatarFile = file;
      this.previewAvatar = URL.createObjectURL(file);
    },

    removeSelectedAvatar() {
      this.selectedAvatarFile = null;
      this.previewAvatar = "";

      if (this.$refs.avatarInput) {
        this.$refs.avatarInput.value = "";
      }
    },

    validateProfile() {
      if (!this.user.fullName || !this.user.fullName.trim()) {
        alert("Vui lòng nhập họ và tên.");
        return false;
      }

      if (
        this.user.phone &&
        !/^(0|\+84)[0-9]{9,10}$/.test(this.user.phone.trim())
      ) {
        alert("Số điện thoại không hợp lệ.");
        return false;
      }

      if (this.user.birthday && this.user.birthday > this.today) {
        alert("Ngày sinh không được lớn hơn hôm nay.");
        return false;
      }

      return true;
    },

    async saveProfile() {
      if (!this.validateProfile()) return;

      try {
        this.savingProfile = true;

        const formData = new FormData();
        formData.append("fullName", this.user.fullName?.trim() || "");
        formData.append("phone", this.user.phone?.trim() || "");
        formData.append("gender", this.user.gender || "Khác");
        formData.append("birthday", this.user.birthday || "");
        formData.append("address", this.user.address?.trim() || "");

        if (this.selectedAvatarFile) {
          formData.append("avatar", this.selectedAvatarFile);
        }

        const response = await UserService.updateMe(formData);
        const updatedUser = response?.user || response;

        if (updatedUser) {
          this.user = { ...this.user, ...updatedUser };
          localStorage.setItem("user", JSON.stringify(this.user));

          window.dispatchEvent(
            new CustomEvent("user-updated", {
              detail: this.user,
            })
          );
        }

        this.removeSelectedAvatar();
        alert(response?.message || "Cập nhật hồ sơ thành công!");
      } catch (error) {
        alert(
          error?.response?.data?.message ||
            error?.message ||
            "Không thể lưu hồ sơ."
        );
      } finally {
        this.savingProfile = false;
      }
    },

    openPasswordModal() {
      this.showPasswordModal = true;
    },

    closePasswordModal() {
      this.showPasswordModal = false;
      this.resetPasswordForm();
    },

    validatePasswordForm() {
      if (!this.passwordForm.currentPassword) {
        alert("Vui lòng nhập mật khẩu hiện tại.");
        return false;
      }

      if (!this.passwordForm.newPassword) {
        alert("Vui lòng nhập mật khẩu mới.");
        return false;
      }

      if (this.passwordForm.newPassword.length < 6) {
        alert("Mật khẩu mới phải có ít nhất 6 ký tự.");
        return false;
      }

      if (this.passwordForm.newPassword === this.passwordForm.currentPassword) {
        alert("Mật khẩu mới không được trùng mật khẩu hiện tại.");
        return false;
      }

      if (!this.passwordForm.confirmPassword) {
        alert("Vui lòng xác nhận mật khẩu mới.");
        return false;
      }

      if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
        alert("Xác nhận mật khẩu mới không khớp.");
        return false;
      }

      return true;
    },

    resetPasswordForm() {
      this.passwordForm = {
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      };
      this.showCurrentPassword = false;
      this.showNewPassword = false;
      this.showConfirmPassword = false;
    },

    async submitChangePassword() {
      if (!this.validatePasswordForm()) return;

      try {
        this.changingPassword = true;

        const payload = {
          currentPassword: this.passwordForm.currentPassword,
          newPassword: this.passwordForm.newPassword,
          confirmPassword: this.passwordForm.confirmPassword,
        };

        const response = await AuthService.changePassword(payload);

        alert(response?.message || "Đổi mật khẩu thành công!");
        this.closePasswordModal();
      } catch (error) {
        alert(
          error?.response?.data?.message ||
            error?.message ||
            "Không thể đổi mật khẩu. Vui lòng thử lại."
        );
      } finally {
        this.changingPassword = false;
      }
    },
  },
};
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(99, 102, 241, 0.04), transparent 24%),
    linear-gradient(180deg, #f8fafc 0%, #f3f4f6 100%);
}

.profile-container {
  max-width: 1320px;
}

.page-layout {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  gap: 24px;
  align-items: start;
}

.content-area {
  min-width: 0;
}

.content-card {
  background: #ffffff;
  border: 1px solid #e7e5ef;
  border-radius: 22px;
  padding: 26px;
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.06);
}

.content-header {
  margin-bottom: 22px;
  padding-bottom: 14px;
  border-bottom: 1px solid #f0edf5;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
  flex-wrap: wrap;
}

.content-title {
  margin: 0 0 6px;
  color: #5f1796;
  font-size: 2rem;
  font-weight: 800;
}

.content-subtitle {
  margin: 0;
  color: #7b6c8f;
  line-height: 1.7;
  font-weight: 500;
}

.open-password-btn {
  border: 1px solid #d8c7eb;
  background: #faf7ff;
  color: #5f1796;
  min-height: 42px;
  padding: 0 16px;
  border-radius: 12px;
  font-weight: 700;
  transition: 0.2s ease;
  white-space: nowrap;
}

.open-password-btn:hover {
  background: #f3ebfc;
}

.profile-top-box {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.avatar-section {
  text-align: center;
}

.avatar-wrap {
  position: relative;
  width: 148px;
  height: 148px;
  margin: 0 auto 14px;
}

.profile-avatar,
.profile-avatar-placeholder {
  width: 148px;
  height: 148px;
  border-radius: 50%;
  border: 4px solid #ffffff;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
  background: #f8fafc;
}

.profile-avatar {
  object-fit: cover;
}

.profile-avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 3rem;
}

.avatar-camera-btn {
  position: absolute;
  right: 6px;
  bottom: 6px;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: #4f46e5;
  color: #fff;
  box-shadow: 0 8px 16px rgba(79, 70, 229, 0.2);
}

.avatar-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.avatar-action-btn {
  border: 1px solid #ddd6e8;
  background: #fff;
  color: #4b5563;
  min-height: 40px;
  padding: 0 14px;
  border-radius: 12px;
  font-weight: 700;
}

.avatar-action-btn:hover {
  background: #f9fafb;
}

.avatar-cancel-btn {
  color: #dc2626;
  border-color: #fecaca;
  background: #fff5f5;
}

.avatar-cancel-btn:hover {
  background: #fee2e2;
}

.avatar-hint {
  margin: 0;
  color: #7b6c8f;
  font-size: 0.9rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #374151;
  font-size: 14px;
  font-weight: 700;
}

.required {
  color: #dc2626;
}

.form-input,
.form-textarea {
  width: 100%;
  border: 1px solid #ddd6e8;
  border-radius: 14px;
  outline: none;
  padding: 12px 14px;
  font-size: 14px;
  background: #ffffff;
  transition: all 0.2s ease;
  color: #111827;
}

.form-input:focus,
.form-textarea:focus {
  border-color: #a5b4fc;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.input-disabled {
  background: #f8fafc;
  color: #9ca3af;
}

.input-note {
  display: inline-block;
  margin-top: 6px;
  color: #6366f1;
  font-size: 12px;
  font-weight: 600;
}

.radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding-top: 2px;
}

.radio-pill {
  position: relative;
  cursor: pointer;
}

.radio-pill input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.radio-pill span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 0 16px;
  border-radius: 999px;
  border: 1px solid #ddd6e8;
  background: #ffffff;
  color: #4b5563;
  font-weight: 700;
  transition: all 0.2s ease;
}

.radio-pill input:checked + span {
  background: #eef2ff;
  color: #3730a3;
  border-color: #c7d2fe;
  box-shadow: none;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}

.save-btn,
.change-password-btn {
  border: none;
  min-height: 46px;
  padding: 0 24px;
  border-radius: 14px;
  font-weight: 800;
  color: #fff;
  transition: 0.2s ease;
}

.save-btn {
  background: #f59e0b;
  box-shadow: 0 10px 18px rgba(245, 158, 11, 0.16);
}

.save-btn:hover {
  background: #ea8c00;
}

.change-password-btn {
  background: #4f46e5;
  box-shadow: 0 10px 18px rgba(79, 70, 229, 0.16);
}

.change-password-btn:hover {
  background: #4338ca;
}

.password-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
  padding: 16px;
}

.password-modal {
  width: 100%;
  max-width: 560px;
  background: #fff;
  border-radius: 22px;
  border: 1px solid #e7e5ef;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.22);
  overflow: hidden;
}

.password-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  padding: 20px 22px 16px;
  border-bottom: 1px solid #f0edf5;
}

.password-modal-header h3 {
  margin: 0 0 4px;
  color: #5f1796;
  font-size: 1.35rem;
  font-weight: 800;
}

.password-modal-header p {
  margin: 0;
  color: #7b6c8f;
  font-size: 0.92rem;
}

.password-close-btn {
  width: 38px;
  height: 38px;
  border: none;
  border-radius: 10px;
  background: #f3f4f6;
  color: #374151;
  font-size: 1.3rem;
  line-height: 1;
}

.password-close-btn:hover {
  background: #e5e7eb;
}

.password-modal-body {
  padding: 20px 22px 22px;
}

.password-input-wrap {
  position: relative;
}

.password-input-wrap .form-input {
  padding-right: 46px;
}

.toggle-password-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  color: #6b7280;
  width: 32px;
  height: 32px;
  border-radius: 8px;
}

.toggle-password-btn:hover {
  background: #f3f4f6;
}

.password-rules {
  margin-top: 6px;
  padding: 16px 18px;
  border-radius: 16px;
  background: #faf7ff;
  border: 1px solid #ece3f8;
}

.rules-title {
  font-weight: 700;
  color: #5f1796;
  margin-bottom: 8px;
}

.password-rules ul {
  margin: 0;
  padding-left: 18px;
  color: #6b7280;
}

.password-rules li + li {
  margin-top: 4px;
}

.password-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.cancel-password-btn {
  border: 1px solid #ddd6e8;
  background: #fff;
  color: #4b5563;
  min-height: 44px;
  padding: 0 18px;
  border-radius: 12px;
  font-weight: 700;
}

.cancel-password-btn:hover {
  background: #f9fafb;
}

@media (max-width: 991.98px) {
  .page-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767.98px) {
  .content-card {
    padding: 20px;
  }

  .content-title {
    font-size: 1.55rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    justify-content: stretch;
  }

  .save-btn,
  .change-password-btn,
  .cancel-password-btn {
    width: 100%;
  }

  .password-modal-actions {
    flex-direction: column;
  }

  .profile-avatar,
  .profile-avatar-placeholder {
    width: 132px;
    height: 132px;
  }

  .avatar-wrap {
    width: 132px;
    height: 132px;
  }
}
</style>