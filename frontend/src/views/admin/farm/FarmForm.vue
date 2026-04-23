<template>
  <div class="farm-form-page bg-light py-3">
    <div class="w-100 px-2">
      <div class="card border-0 shadow-sm">
        <div
          class="card-header bg-primary text-white py-3 d-flex justify-content-between align-items-center flex-wrap"
        >
          <div class="mb-2 mb-md-0">
            <h5 class="mb-1 font-weight-bold">
              <i :class="isEditMode ? 'fas fa-edit mr-2' : 'fas fa-plus-circle mr-2'"></i>
              {{
                isEditMode
                  ? "CẬP NHẬT THÔNG TIN TRẠI CUNG CẤP CHÓ"
                  : "THÊM TRẠI CUNG CẤP CHÓ MỚI"
              }}
            </h5>
            <div class="small text-white-50">
              Quản lý hồ sơ trại, tài khoản chủ trại và trạng thái hợp tác.
            </div>
          </div>

          <span class="badge badge-light text-primary shadow-sm code-badge">
            Mã trại:
            <strong class="text-danger ml-1">{{ farm.maTrai || "---" }}</strong>
          </span>
        </div>

        <div class="card-body p-4 bg-white">
          <form @submit.prevent="submitForm">
            <div class="row">
              <div class="col-lg-6 mb-4 mb-lg-0" v-if="!isEditMode">
                <div class="section-card h-100">
                  <h6 class="section-title text-primary">
                    <i class="fas fa-user-shield mr-2"></i>
                    1. Tài khoản chủ trại
                  </h6>

                  <div class="form-group">
                    <label class="form-label">Tên đăng nhập</label>
                    <input
                      type="text"
                      class="form-control custom-input"
                      v-model.trim="farm.username"
                      placeholder="Ví dụ: chutraicantho01"
                      required
                    />
                  </div>

                  <div class="form-group">
                    <label class="form-label">Mật khẩu cấp cho chủ trại</label>
                    <input
                      type="password"
                      class="form-control custom-input"
                      v-model="farm.password"
                      placeholder="Nhập mật khẩu..."
                      required
                    />
                  </div>

                  <div class="form-group">
                    <label class="form-label">Email chính chủ</label>
                    <input
                      type="email"
                      class="form-control custom-input"
                      v-model.trim="farm.email"
                      placeholder="example@gmail.com"
                      required
                    />
                  </div>

                  <div class="form-group mb-0">
                    <label class="form-label">Họ tên người đại diện</label>
                    <input
                      type="text"
                      class="form-control custom-input"
                      v-model.trim="farm.fullName"
                      placeholder="Nhập họ tên đầy đủ..."
                    />
                  </div>
                </div>
              </div>

              <div :class="isEditMode ? 'col-lg-12' : 'col-lg-6'">
                <div class="section-card h-100">
                  <h6 class="section-title text-success">
                    <i class="fas fa-warehouse mr-2"></i>
                    2. Hồ sơ trại cung cấp chó
                  </h6>

                  <div class="form-group" v-if="isEditMode">
                    <label class="form-label text-danger">
                      <i class="fas fa-toggle-on mr-1"></i>Trạng thái hợp tác
                    </label>
                    <select class="form-control custom-input status-input" v-model="farm.status">
                      <option value="active">Đang hợp tác</option>
                      <option value="inactive">Ngừng hợp tác</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label class="form-label text-success">Tên trại hiển thị</label>
                    <input
                      type="text"
                      class="form-control custom-input input-success"
                      v-model.trim="farm.name"
                      placeholder="Ví dụ: Trại chó cảnh Cần Thơ"
                      required
                    />
                  </div>

                  <div class="form-row">
                    <div class="form-group col-md-6">
                      <label class="form-label text-success">Số điện thoại trại</label>
                      <input
                        type="text"
                        class="form-control custom-input input-success"
                        v-model.trim="farm.phone"
                        placeholder="Nhập số điện thoại..."
                        required
                      />
                    </div>

                    <div class="form-group col-md-6">
                      <label class="form-label text-success">Địa chỉ hoạt động</label>
                      <input
                        type="text"
                        class="form-control custom-input input-success"
                        v-model.trim="farm.address"
                        placeholder="Nhập địa chỉ..."
                        required
                      />
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="form-group col-md-6">
                      <label class="form-label text-success">
                        <i class="fas fa-pencil-alt mr-1"></i>Mô tả trại
                      </label>
                      <textarea
                        class="form-control custom-input textarea-success"
                        v-model.trim="farm.description"
                        rows="5"
                        placeholder="Giới thiệu ngắn về khả năng cung cấp chó, khu vực hoạt động, điểm mạnh của trại..."
                      ></textarea>
                    </div>

                    <div class="form-group col-md-6">
                      <label class="form-label text-success">
                        <i class="fas fa-image mr-1"></i>Hình ảnh đại diện
                      </label>

                      <div class="custom-file mb-2">
                        <input
                          type="file"
                          class="custom-file-input"
                          id="farmImage"
                          @change="onFileChange"
                          accept="image/*"
                          ref="fileInput"
                        />
                        <label class="custom-file-label custom-file-label-green" for="farmImage">
                          {{ fileName || "Chọn ảnh trại..." }}
                        </label>
                      </div>

                      <div v-if="previewImage || farm.image" class="image-preview-container mt-3">
                        <img :src="imageSource" class="img-preview shadow-sm" />
                        <button
                          type="button"
                          class="btn-remove-image"
                          @click="removeImage"
                          title="Xóa ảnh này"
                        >
                          <i class="fas fa-times"></i>
                        </button>
                      </div>

                      <div v-else class="empty-image-box mt-3">
                        <i class="fas fa-image fa-3x mb-2 opacity-25"></i>
                        <p class="mb-0 small text-muted">Chưa có hình ảnh trại</p>
                      </div>
                    </div>
                  </div>

                  <div class="farm-note-box mt-3">
                    <div class="note-title">
                      <i class="fas fa-info-circle mr-2"></i>Ghi chú
                    </div>
                    <div class="small text-muted mb-0">
                      Trại này cung cấp chó và hồ sơ ban đầu cho hệ thống.
                      Việc phê duyệt hồ sơ chó, mở bán và xử lý giao dịch sẽ do hệ thống quản lý.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="text-center border-top pt-4 mt-4">
              <button
                type="button"
                class="btn btn-outline-secondary mr-2 px-4 py-2 shadow-sm font-weight-bold"
                @click="$emit('cancel')"
              >
                HỦY BỎ
              </button>

              <button type="submit" class="btn btn-primary px-5 py-2 font-weight-bold shadow-sm submit-btn">
                <i class="fas fa-check-circle mr-2"></i>
                {{ isEditMode ? "CẬP NHẬT THÔNG TIN" : "XÁC NHẬN THÊM TRẠI" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import FarmService from "@/services/farm.service";

export default {
  name: "FarmForm",

  props: {
    farmData: {
      type: Object,
      default: () => ({}),
    },
  },

  data() {
    return {
      farm: {
        ...this.farmData,
        description: this.farmData?.description || "",
        status: this.farmData?.status || "active",
      },
      selectedFile: null,
      previewImage: null,
      fileName: "",
    };
  },

  computed: {
    isEditMode() {
      return !!(this.farm._id || this.farm.id);
    },

    imageSource() {
      if (this.previewImage) return this.previewImage;
      if (this.farm.image) return `http://localhost:3000${this.farm.image}`;
      return "https://via.placeholder.com/300x180?text=Farm";
    },
  },

  watch: {
    farmData: {
      immediate: true,
      deep: true,
      handler(newValue) {
        this.farm = {
          ...newValue,
          description: newValue?.description || "",
          status: newValue?.status || "active",
        };
        this.selectedFile = null;
        this.previewImage = null;
        this.fileName = "";

        if (this.$refs.fileInput) {
          this.$refs.fileInput.value = "";
        }
      },
    },
  },

  methods: {
    async fetchNextCode() {
      if (!this.isEditMode && !this.farm.maTrai) {
        try {
          const res = await FarmService.getNextCode();
          this.farm.maTrai = res.nextCode;
        } catch (error) {
          console.error("Lỗi lấy mã trại:", error);
        }
      }
    },

    onFileChange(e) {
      const file = e.target.files[0];
      if (!file) return;

      this.selectedFile = file;
      this.fileName = file.name;
      this.previewImage = URL.createObjectURL(file);
    },

    removeImage() {
      this.selectedFile = null;
      this.previewImage = null;
      this.fileName = "";
      this.farm.image = null;

      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = "";
      }
    },

    submitForm() {
      const formData = new FormData();

      const farmId = this.farm._id || this.farm.id;

      if (this.isEditMode && farmId) {
        formData.append("_id", farmId);
        formData.append("status", this.farm.status || "active");
      } else {
        formData.append("username", this.farm.username || "");
        formData.append("password", this.farm.password || "");
        formData.append("email", this.farm.email || "");
        formData.append("fullName", this.farm.fullName || "");
      }

      formData.append("name", this.farm.name || "");
      formData.append("phone", this.farm.phone || "");
      formData.append("address", this.farm.address || "");
      formData.append("farmDescription", this.farm.description || "");
      formData.append("maTrai", this.farm.maTrai || "");

      if (this.selectedFile) {
        formData.append("image", this.selectedFile);
      }

      this.$emit("save", formData);
    },
  },

  mounted() {
    this.fetchNextCode();
  },
};
</script>

<style scoped>
.farm-form-page {
  min-height: 100%;
  background: transparent;
}

.code-badge {
  font-size: 0.9rem;
  border-radius: 999px;
  padding: 8px 14px;
}

.section-card {
  border: 1px solid #e9ecef;
  border-radius: 14px;
  padding: 20px;
  background: #fff;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.04);
}

.section-title {
  font-weight: 800;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eef2f6;
}

.form-label {
  font-weight: 700;
  color: #374151;
  margin-bottom: 8px;
  font-size: 0.92rem;
}

.custom-input {
  border-radius: 10px;
  min-height: 44px;
  box-shadow: none;
  border: 1px solid #ced4da;
  font-size: 0.95rem;
}

.custom-input:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.12);
}

.input-success {
  border-color: #9dd9b8;
}

.status-input {
  border-color: #f1aeb5;
}

.textarea-success {
  min-height: 132px;
  resize: none;
  background-color: #f9fff9;
  border-color: #9dd9b8;
}

.farm-note-box {
  border: 1px solid #dbeafe;
  background: #f8fbff;
  border-radius: 14px;
  padding: 14px 16px;
}

.note-title {
  color: #198754;
  font-weight: 800;
  margin-bottom: 8px;
}

.image-preview-container {
  position: relative;
  display: inline-block;
  width: 100%;
  text-align: center;
  border: 1px dashed #28a745;
  border-radius: 14px;
  padding: 12px;
  background-color: #f9fff9;
  min-height: 160px;
}

.img-preview {
  max-height: 180px;
  border-radius: 10px;
  object-fit: cover;
  max-width: 100%;
}

.empty-image-box {
  border: 1px dashed #ced4da;
  border-radius: 12px;
  padding: 26px 12px;
  background: #f8f9fa;
  text-align: center;
}

.btn-remove-image {
  position: absolute;
  top: -10px;
  right: -10px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s;
}

.btn-remove-image:hover {
  transform: scale(1.08);
  background-color: #c82333;
}

.submit-btn {
  border-radius: 12px;
}

.custom-file-label {
  border-radius: 10px;
}

.custom-file-label-green {
  border-color: #9dd9b8;
}

.custom-file-label::after {
  content: "Chọn ảnh" !important;
  background-color: #28a745;
  color: white;
  border-radius: 0 10px 10px 0;
}

@media (max-width: 991.98px) {
  .section-card {
    padding: 16px;
  }
}
</style>