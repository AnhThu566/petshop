<template>
  <div class="service-admin-page bg-light py-4" style="min-height: 100vh;">
    <div class="container-fluid px-2">
      <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3 flex-wrap">
        <div>
          <h4 class="font-weight-bold text-dark mb-1">
            <i class="fas fa-concierge-bell mr-2 text-primary"></i>
            QUẢN LÝ DỊCH VỤ
          </h4>
          <div class="small text-muted">
            Thêm, cập nhật và quản lý các dịch vụ trong hệ thống.
          </div>
        </div>

        <div class="d-flex flex-wrap mt-2 mt-md-0">
          <router-link to="/admin/service-bookings" class="btn btn-outline-primary btn-sm mr-2 mb-2 mb-md-0">
            <i class="fas fa-calendar-check mr-1"></i> Quản lý lịch đặt
          </router-link>
          <button class="btn btn-primary btn-sm" @click="openCreateModal">
            <i class="fas fa-plus mr-1"></i> Thêm dịch vụ
          </button>
        </div>
      </div>

      <div class="row mb-3 align-items-center">
        <div class="col-lg-6 col-md-8 mb-2 mb-md-0">
          <div class="input-group input-group-sm shadow-sm">
            <div class="input-group-prepend">
              <span class="input-group-text bg-white text-primary border-right-0">
                <i class="fas fa-search"></i>
              </span>
            </div>
            <input
              v-model.trim="keyword"
              type="text"
              class="form-control border-left-0"
              placeholder="Tìm theo mã, tên hoặc mô tả dịch vụ..."
            />
          </div>
        </div>

        <div class="col-lg-6 col-md-4 text-md-right">
          <div class="small text-muted font-weight-bold">
            Tổng: {{ filteredServices.length }} dịch vụ
          </div>
        </div>
      </div>

      <div v-if="loading" class="card border-0 shadow-sm">
        <div class="card-body text-center py-5 text-muted">
          <i class="fas fa-spinner fa-spin fa-3x mb-3 d-block"></i>
          Đang tải danh sách dịch vụ...
        </div>
      </div>

      <div v-else-if="errorMessage" class="card border-0 shadow-sm">
        <div class="card-body text-center py-5 text-danger">
          <i class="fas fa-exclamation-circle fa-3x mb-3 d-block opacity-75"></i>
          <p class="mb-3">{{ errorMessage }}</p>
          <button class="btn btn-primary btn-sm" @click="loadServices">Tải lại</button>
        </div>
      </div>

      <div v-else class="card border-0 shadow-sm">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0 service-table">
            <thead class="bg-light">
              <tr class="small text-secondary">
                <th class="py-3 text-center col-image">Ảnh</th>
                <th class="py-3 text-center col-code">Mã DV</th>
                <th class="py-3 text-left col-name">Tên dịch vụ</th>
                <th class="py-3 text-center col-category">Danh mục</th>
                <th class="py-3 text-center col-price">Giá</th>
                <th class="py-3 text-center col-status">Trạng thái</th>
                <th class="py-3 text-center col-action">Thao tác</th>
              </tr>
            </thead>

            <tbody>
              <tr v-if="filteredServices.length === 0">
                <td colspan="7" class="py-5 text-center text-muted">
                  <i class="fas fa-folder-open fa-2x mb-3 d-block"></i>
                  Không có dịch vụ phù hợp.
                </td>
              </tr>

              <tr
                v-for="service in filteredServices"
                :key="service._id || service.id"
              >
                <td class="text-center">
                  <img
                    :src="getImageUrl(service.image)"
                    :alt="service.name"
                    class="service-thumb"
                  />
                </td>

                <td class="text-center font-weight-bold text-primary">
                  {{ service.serviceCode || "---" }}
                </td>

                <td class="text-left">
                  <div class="service-name-cell">
                    <strong class="text-dark">{{ service.name }}</strong>
                    <small>{{ truncateText(service.description, 70) }}</small>
                  </div>
                </td>

                <td class="text-center">
                  <span class="soft-badge">
                    {{ service.categoryId?.name || "---" }}
                  </span>
                </td>

                <td class="text-center text-danger font-weight-bold">
                  {{ formatCurrency(service.price) }}
                </td>

                <td class="text-center">
                  <span class="status-badge" :class="getStatusClass(service.status)">
                    {{ service.status }}
                  </span>
                </td>

                <td class="text-center">
                  <div class="d-flex justify-content-center flex-wrap">
                    <button class="btn btn-sm btn-outline-warning mr-1 mb-1" @click="openEditModal(service)">
                      <i class="fas fa-edit mr-1"></i>Sửa
                    </button>
                    <button class="btn btn-sm btn-outline-danger mb-1" @click="handleDelete(service)">
                      <i class="fas fa-trash mr-1"></i>Xóa
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="showModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.45);">
        <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
          <div class="modal-content border-0 shadow">
            <div class="modal-header" :class="isEditMode ? 'modal-head-warning' : 'modal-head-primary'">
              <h5 class="modal-title mb-0" :class="isEditMode ? 'text-dark' : 'text-white'">
                <i class="fas mr-2" :class="isEditMode ? 'fa-edit' : 'fa-plus-circle'"></i>
                {{ isEditMode ? "Cập nhật dịch vụ" : "Thêm dịch vụ mới" }}
              </h5>
              <button type="button" class="close" :class="isEditMode ? '' : 'text-white'" @click="closeModal">
                <span>&times;</span>
              </button>
            </div>

            <form class="modal-body form-modal-body" @submit.prevent="submitForm">
              <div class="row">
                <div class="col-md-7">
                  <div class="form-group">
                    <label class="form-label">Tên dịch vụ <span class="text-danger">*</span></label>
                    <input v-model.trim="form.name" type="text" class="form-control custom-input" required />
                  </div>

                  <div class="form-row">
                    <div class="form-group col-md-6">
                      <label class="form-label">Giá dịch vụ</label>
                      <input
                        v-model.number="form.price"
                        type="number"
                        min="0"
                        class="form-control custom-input"
                        required
                      />
                    </div>

                    <div class="form-group col-md-6">
                      <label class="form-label">Danh mục dịch vụ</label>
                      <select v-model="form.categoryId" class="form-control custom-input" required>
                        <option value="">-- Chọn danh mục --</option>
                        <option
                          v-for="category in categories"
                          :key="category._id || category.id"
                          :value="category._id || category.id"
                        >
                          {{ category.name }}
                        </option>
                      </select>
                    </div>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Trạng thái</label>
                    <select v-model="form.status" class="form-control custom-input" required>
                      <option value="Đang hoạt động">Đang hoạt động</option>
                      <option value="Ngừng hoạt động">Ngừng hoạt động</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Mô tả</label>
                    <textarea
                      v-model.trim="form.description"
                      rows="4"
                      class="form-control custom-input"
                      placeholder="Nhập mô tả dịch vụ..."
                    ></textarea>
                  </div>
                </div>

                <div class="col-md-5">
                  <label class="form-label">
                    Hình ảnh <span class="text-danger">*</span>
                  </label>

                  <div class="image-preview-container mb-3">
                    <div class="image-preview-box">
                      <img
                        v-if="previewImage"
                        :src="previewImage"
                        alt="preview"
                        class="preview-image"
                      />
                      <div v-else class="text-muted text-center">
                        <i class="fas fa-image fa-4x mb-2 opacity-25"></i>
                        <p class="small mb-0">Chưa có ảnh dịch vụ</p>
                      </div>
                    </div>
                  </div>

                  <div class="custom-file text-left">
                    <input
                      type="file"
                      accept="image/*"
                      class="custom-file-input"
                      id="serviceImage"
                      @change="handleFileChange"
                    />
                    <label class="custom-file-label text-truncate" for="serviceImage">
                      {{ selectedFile?.name || "Chọn ảnh dịch vụ..." }}
                    </label>
                  </div>

                  <small class="form-hint d-block mt-2">
                    Khi thêm dịch vụ mới, bắt buộc phải chọn hình ảnh.
                  </small>
                </div>
              </div>

              <div class="modal-footer px-0 pb-0">
                <button type="button" class="btn btn-secondary" @click="closeModal">
                  Hủy
                </button>
                <button type="submit" class="btn btn-primary" :disabled="submitting">
                  {{
                    submitting
                      ? "Đang lưu..."
                      : isEditMode
                      ? "Cập nhật"
                      : "Tạo mới"
                  }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div v-if="showModal" class="modal-backdrop fade show"></div>

      <transition name="fade">
        <div v-if="successMessage" class="toast-success">
          {{ successMessage }}
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import ServiceService from "@/services/service.service";
import ServiceCategoryService from "@/services/serviceCategory.service";

export default {
  name: "ServicePage",
  data() {
    return {
      services: [],
      categories: [],
      keyword: "",
      loading: false,
      submitting: false,
      errorMessage: "",
      successMessage: "",
      showModal: false,
      isEditMode: false,
      editingId: null,
      selectedFile: null,
      previewImage: "",
      baseImageUrl: "http://localhost:3000",
      form: {
        name: "",
        price: 0,
        description: "",
        categoryId: "",
        status: "Đang hoạt động",
      },
    };
  },
  computed: {
    filteredServices() {
      const kw = this.keyword.toLowerCase();
      return this.services.filter((service) => {
        const name = String(service.name || "").toLowerCase();
        const code = String(service.serviceCode || "").toLowerCase();
        const desc = String(service.description || "").toLowerCase();
        const category = String(service.categoryId?.name || "").toLowerCase();

        return (
          name.includes(kw) ||
          code.includes(kw) ||
          desc.includes(kw) ||
          category.includes(kw)
        );
      });
    },
  },
  methods: {
    async loadServices() {
      this.loading = true;
      this.errorMessage = "";
      try {
        const data = await ServiceService.getAll();
        this.services = Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Lỗi loadServices:", error);
        this.errorMessage =
          error?.response?.data?.message || "Không thể tải danh sách dịch vụ.";
      } finally {
        this.loading = false;
      }
    },

    async loadCategories() {
      try {
        const data = await ServiceCategoryService.getAll();
        this.categories = Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Lỗi loadCategories:", error);
        this.categories = [];
      }
    },

    resetForm() {
      this.form = {
        name: "",
        price: 0,
        description: "",
        categoryId: "",
        status: "Đang hoạt động",
      };
      this.selectedFile = null;
      this.previewImage = "";
      this.editingId = null;
      this.isEditMode = false;
    },

    openCreateModal() {
      this.resetForm();
      this.showModal = true;
    },

    openEditModal(service) {
      this.isEditMode = true;
      this.editingId = service._id || service.id;
      this.form = {
        name: service.name || "",
        price: service.price || 0,
        description: service.description || "",
        categoryId: service.categoryId?._id || service.categoryId?.id || "",
        status: service.status || "Đang hoạt động",
      };
      this.previewImage = this.getImageUrl(service.image);
      this.selectedFile = null;
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
      this.resetForm();
    },

    handleFileChange(event) {
      const file = event.target.files?.[0];
      if (!file) return;

      this.selectedFile = file;
      this.previewImage = URL.createObjectURL(file);
    },

    buildFormData() {
      const categoryId = this.form.categoryId || "";
      if (!categoryId) {
        throw new Error("Vui lòng chọn danh mục dịch vụ");
      }

      const price = Number(this.form.price);
      if (Number.isNaN(price) || price < 0) {
        throw new Error("Giá dịch vụ không hợp lệ");
      }

      const formData = new FormData();
      formData.append("name", this.form.name);
      formData.append("price", String(price));
      formData.append("description", this.form.description || "");
      formData.append("categoryId", categoryId);
      formData.append("status", this.form.status);

      if (this.selectedFile) {
        formData.append("image", this.selectedFile);
      }

      return formData;
    },

    async submitForm() {
      this.submitting = true;
      try {
        if (!this.isEditMode && !this.selectedFile) {
          alert("Vui lòng chọn hình ảnh cho dịch vụ");
          this.submitting = false;
          return;
        }

        const formData = this.buildFormData();

        if (this.isEditMode) {
          await ServiceService.update(this.editingId, formData);
          this.showSuccess("Cập nhật dịch vụ thành công!");
        } else {
          await ServiceService.create(formData);
          this.showSuccess("Thêm dịch vụ thành công!");
        }

        this.closeModal();
        await this.loadServices();
      } catch (error) {
        console.error("Lỗi submitForm:", error);
        alert(
          error?.response?.data?.message ||
            error?.message ||
            "Không thể lưu dịch vụ. Vui lòng thử lại."
        );
      } finally {
        this.submitting = false;
      }
    },

    async handleDelete(service) {
      const confirmed = window.confirm(
        `Bạn có chắc muốn xóa dịch vụ "${service.name}" không?`
      );
      if (!confirmed) return;

      try {
        await ServiceService.delete(service._id || service.id);
        this.showSuccess("Xóa dịch vụ thành công!");
        await this.loadServices();
      } catch (error) {
        console.error("Lỗi handleDelete:", error);
        alert(
          error?.response?.data?.message ||
            "Không thể xóa dịch vụ. Vui lòng thử lại."
        );
      }
    },

    formatCurrency(value) {
      return Number(value || 0).toLocaleString("vi-VN") + " đ";
    },

    truncateText(text, maxLength = 70) {
      const content = String(text || "").trim();
      if (!content) return "Chưa có mô tả.";
      if (content.length <= maxLength) return content;
      return content.slice(0, maxLength) + "...";
    },

    getImageUrl(image) {
      if (!image) return "";
      if (image.startsWith("http://") || image.startsWith("https://")) {
        return image;
      }
      return `${this.baseImageUrl}${image}`;
    },

    getStatusClass(status) {
      return status === "Đang hoạt động" ? "status-active" : "status-paused";
    },

    showSuccess(message) {
      this.successMessage = message;
      setTimeout(() => {
        this.successMessage = "";
      }, 2500);
    },
  },
  async mounted() {
    await Promise.all([this.loadServices(), this.loadCategories()]);
  },
};
</script>

<style scoped>
.service-table {
  min-width: 1120px;
}

.service-table th,
.service-table td {
  vertical-align: middle;
  font-size: 0.95rem;
}

.service-table thead th {
  font-weight: 700;
  white-space: nowrap;
}

.col-image {
  width: 110px;
}

.col-code {
  width: 120px;
}

.col-name {
  width: 280px;
}

.col-category {
  width: 180px;
}

.col-price {
  width: 140px;
}

.col-status {
  width: 160px;
}

.col-action {
  width: 150px;
}

.service-thumb {
  width: 84px;
  height: 64px;
  object-fit: cover;
  border-radius: 12px;
  background: #f1f5f9;
  border: 1px solid #e5e7eb;
}

.service-name-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.service-name-cell small {
  color: #64748b;
  line-height: 1.5;
}

.soft-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 7px 12px;
  border-radius: 8px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  color: #495057;
  font-size: 0.84rem;
  font-weight: 600;
  white-space: nowrap;
}

.status-badge {
  display: inline-block;
  padding: 7px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.status-active {
  background: #dcfce7;
  color: #166534;
}

.status-paused {
  background: #fee2e2;
  color: #b91c1c;
}

.form-modal-body {
  padding: 22px;
}

.form-label {
  font-weight: 700;
  color: #212529;
  margin-bottom: 8px;
}

.custom-input {
  border-radius: 10px;
  min-height: 44px;
  border: 1px solid #ced4da;
  font-size: 0.94rem;
}

.custom-input:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.12);
}

.modal-head-primary {
  background: #0d6efd;
  color: #fff;
}

.modal-head-warning {
  background: #ffc107;
  color: #212529;
}

.image-preview-container {
  position: relative;
}

.image-preview-box {
  height: 250px;
  overflow: hidden;
  border: 1px solid #dee2e6;
  border-radius: 12px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.preview-image {
  object-fit: cover;
  width: 100%;
  height: 100%;
}

.custom-file-label::after {
  content: "Chọn ảnh" !important;
  background-color: #0d6efd;
  color: white;
}

.form-hint {
  display: inline-block;
  color: #64748b;
  font-size: 13px;
}

.toast-success {
  position: fixed;
  right: 20px;
  bottom: 20px;
  background: #16a34a;
  color: #fff;
  padding: 14px 18px;
  border-radius: 12px;
  font-weight: 700;
  box-shadow: 0 10px 24px rgba(22, 163, 74, 0.24);
  z-index: 2000;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 991.98px) {
  .service-table {
    min-width: 980px;
  }
}
</style>