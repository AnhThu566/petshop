<template>
  <div class="breed-form-page bg-light py-3">
    <div class="w-100 px-2">
      <div class="card border-0 shadow-sm">
        <div
          class="card-header bg-primary text-white py-3 d-flex justify-content-between align-items-center flex-wrap"
        >
          <div class="mb-2 mb-md-0">
            <h5 class="mb-1 font-weight-bold">
              <i class="fas mr-2" :class="isEditMode ? 'fa-edit' : 'fa-plus-circle'"></i>
              {{ isEditMode ? "CẬP NHẬT GIỐNG CHÓ" : "NHẬP THÔNG TIN GIỐNG CHÓ" }}
            </h5>
            <div class="small text-white-50">
              Quản lý thông tin giống chó, hình ảnh và trạng thái kinh doanh.
            </div>
          </div>

          <span class="badge badge-light text-primary shadow-sm code-badge">
            Mã giống:
            <strong class="text-danger ml-1">{{ breed.maGiong || "Tự động" }}</strong>
          </span>
        </div>

        <div class="card-body p-4 bg-white">
          <form @submit.prevent="submitForm">
            <div class="row">
              <div class="col-lg-6 mb-4 mb-lg-0">
                <div class="section-card h-100">
                  <h6 class="section-title text-primary">
                    <i class="fas fa-info-circle mr-2"></i>
                    1. Thông tin chung
                  </h6>

                  <div class="form-group">
                    <label class="form-label">Tên giống chó</label>
                    <input
                      type="text"
                      class="form-control custom-input"
                      v-model="breed.name"
                      placeholder="Ví dụ: Poodle, Alaska..."
                      required
                    />
                  </div>

                  <div class="form-group">
                    <label class="form-label">Nguồn gốc</label>
                    <input
                      type="text"
                      class="form-control custom-input"
                      v-model="breed.origin"
                      placeholder="Ví dụ: Đức, Pháp, Việt Nam..."
                    />
                  </div>

                  <div class="form-group mb-0" v-if="isEditMode">
                    <label class="form-label text-danger">
                      <i class="fas fa-toggle-on mr-1"></i> Trạng thái
                    </label>
                    <select class="form-control custom-input status-input" v-model="breed.status">
                      <option value="active">Đang kinh doanh</option>
                      <option value="paused">Tạm ngưng</option>
                      <option value="stopped">Ngừng kinh doanh</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="col-lg-6">
                <div class="section-card h-100">
                  <h6 class="section-title text-success">
                    <i class="fas fa-camera mr-2"></i>
                    2. Hình ảnh & mô tả
                  </h6>

                  <div class="form-group">
                    <label class="form-label text-success">
                      <i class="fas fa-pencil-alt mr-1"></i> Mô tả đặc điểm
                    </label>
                    <textarea
                      class="form-control custom-input textarea-success"
                      v-model="breed.description"
                      rows="4"
                      placeholder="Mô tả ngoại hình, tính cách..."
                    ></textarea>
                  </div>

                  <div class="form-group mb-0">
                    <label class="form-label text-success">Hình ảnh giống chó</label>

                    <div class="custom-file mb-2">
                      <input
                        type="file"
                        class="custom-file-input"
                        id="breedImage"
                        @change="handleFileUpload"
                        accept="image/*"
                        ref="fileInput"
                      />
                      <label class="custom-file-label custom-file-label-green" for="breedImage">
                        {{ fileName || "Chọn ảnh giống chó..." }}
                      </label>
                    </div>

                    <div v-if="imageSource" class="image-preview-container mt-3">
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
                      <p class="mb-0 small text-muted">Chưa có hình ảnh giống chó</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="text-center border-top pt-4 mt-4">
              <button
                type="button"
                class="btn btn-secondary mr-2 px-4 py-2 shadow-sm font-weight-bold"
                @click="$emit('cancel')"
              >
                HỦY BỎ
              </button>

              <button type="submit" class="btn btn-primary px-5 py-2 font-weight-bold shadow-sm">
                <i class="fas fa-save mr-1"></i> LƯU GIỐNG CHÓ
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["breedData"],

  data() {
    return {
      breed: {
        maGiong: "",
        name: "",
        origin: "",
        description: "",
        status: "active",
        image: "",
      },
      selectedFile: null,
      previewImage: null,
      fileName: "",
      removeOldImage: false,
    };
  },

  computed: {
    isEditMode() {
      return !!(this.breed._id || this.breed.id);
    },

    imageSource() {
      if (this.previewImage) return this.previewImage;
      if (this.breed.image) {
        return `http://localhost:3000${this.breed.image}`;
      }
      return null;
    },
  },

  watch: {
    breedData: {
      handler(newData) {
        if (newData) {
          this.breed = {
            maGiong: newData.maGiong || "",
            name: newData.name || "",
            origin: newData.origin || "",
            description: newData.description || "",
            status: newData.status || "active",
            image: newData.image || "",
            _id: newData._id,
            id: newData.id,
          };
        } else {
          this.breed = {
            maGiong: "",
            name: "",
            origin: "",
            description: "",
            status: "active",
            image: "",
          };
        }

        this.selectedFile = null;
        this.previewImage = null;
        this.fileName = "";
        this.removeOldImage = false;

        if (this.$refs.fileInput) {
          this.$refs.fileInput.value = "";
        }
      },
      immediate: true,
    },
  },

  methods: {
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      this.selectedFile = file;
      this.fileName = file.name;
      this.previewImage = URL.createObjectURL(file);
      this.removeOldImage = false;
    },

    removeImage() {
      this.selectedFile = null;
      this.previewImage = null;
      this.fileName = "";

      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = "";
      }

      this.breed.image = "";
      this.removeOldImage = true;
    },

    submitForm() {
      const formData = new FormData();

      formData.append("name", this.breed.name || "");
      formData.append("origin", this.breed.origin || "");
      formData.append("description", this.breed.description || "");
      formData.append("status", this.breed.status || "active");

      const id = this.breed._id || this.breed.id;
      if (id) {
        formData.append("_id", id);
      } else {
        formData.append("maGiong", this.breed.maGiong || "");
      }

      if (this.selectedFile) {
        formData.append("image", this.selectedFile);
      }

      if (this.removeOldImage) {
        formData.append("removeImage", "true");
      }

      this.$emit("save", formData);
    },
  },
};
</script>

<style scoped>
.breed-form-page {
  min-height: 100%;
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
  font-size: 0.92rem;
  font-weight: 700;
  color: #334155;
  margin-bottom: 0.45rem;
}

.custom-input {
  min-height: 44px;
  border-radius: 10px;
  border: 1px solid #ced4da;
  font-size: 0.95rem;
}

.custom-input:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.12);
}

.textarea-success {
  resize: none;
  min-height: 120px;
  background-color: #f9fff9;
  border-color: #9dd9b8;
}

.status-input {
  border-color: #f1aeb5;
}

.custom-file-label-green {
  border-color: #9dd9b8;
}

.custom-file-label::after {
  content: "Chọn ảnh" !important;
  background-color: #198754;
  color: #fff;
}

.image-preview-container {
  position: relative;
  display: inline-block;
  width: 100%;
  text-align: center;
  border: 1px dashed #28a745;
  border-radius: 12px;
  padding: 12px;
  background-color: #f9fff9;
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
  transform: scale(1.12);
  background-color: #c82333;
}

@media (max-width: 991.98px) {
  .section-card {
    padding: 16px;
  }
}
</style>