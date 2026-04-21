<template>
  <div class="service-admin-page">
    <div class="page-header">
      <div>
        <h2>Quản lý dịch vụ</h2>
        <p>Thêm, cập nhật và quản lý các dịch vụ trong hệ thống.</p>
      </div>

      <div class="header-actions">
        <router-link to="/admin/service-bookings" class="btn-secondary">
          Quản lý lịch đặt
        </router-link>
        <button class="btn-primary" @click="openCreateModal">
          + Thêm dịch vụ
        </button>
      </div>
    </div>

    <div class="toolbar">
      <input
        v-model.trim="keyword"
        type="text"
        class="search-input"
        placeholder="Tìm theo mã, tên hoặc mô tả dịch vụ..."
      />
    </div>

    <div v-if="loading" class="state-box">
      <div class="spinner"></div>
      <p>Đang tải danh sách dịch vụ...</p>
    </div>

    <div v-else-if="errorMessage" class="state-box error-box">
      <p>{{ errorMessage }}</p>
      <button class="btn-primary" @click="loadServices">Tải lại</button>
    </div>

    <div v-else class="table-card">
      <table class="service-table">
        <thead>
          <tr>
            <th>Ảnh</th>
            <th>Mã DV</th>
            <th>Tên dịch vụ</th>
            <th>Danh mục</th>
            <th>Giá</th>
            <th>Trạng thái</th>
            <th class="text-center">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredServices.length === 0">
            <td colspan="7" class="empty-row">Không có dịch vụ phù hợp.</td>
          </tr>

          <tr
            v-for="service in filteredServices"
            :key="service._id || service.id"
          >
            <td>
              <img
                :src="getImageUrl(service.image)"
                :alt="service.name"
                class="service-thumb"
              />
            </td>
            <td>{{ service.serviceCode || "---" }}</td>
            <td>
              <div class="service-name-cell">
                <strong>{{ service.name }}</strong>
                <small>{{ truncateText(service.description, 70) }}</small>
              </div>
            </td>
            <td>{{ service.categoryId?.name || "---" }}</td>
            <td class="price">{{ formatCurrency(service.price) }}</td>
            <td>
              <span class="status-badge" :class="getStatusClass(service.status)">
                {{ service.status }}
              </span>
            </td>
            <td class="text-center">
              <div class="action-group">
                <button class="btn-edit" @click="openEditModal(service)">
                  Sửa
                </button>
                <button class="btn-delete" @click="handleDelete(service)">
                  Xóa
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-card">
        <div class="modal-header">
          <h3>{{ isEditMode ? "Cập nhật dịch vụ" : "Thêm dịch vụ mới" }}</h3>
          <button class="btn-close" @click="closeModal">×</button>
        </div>

        <form class="modal-body" @submit.prevent="submitForm">
          <div class="form-grid">
            <div class="form-group">
              <label>Tên dịch vụ</label>
              <input v-model.trim="form.name" type="text" required />
            </div>

            <div class="form-group">
              <label>Giá dịch vụ</label>
              <input
                v-model.number="form.price"
                type="number"
                min="0"
                required
              />
            </div>

            <div class="form-group">
              <label>Danh mục dịch vụ</label>
              <select v-model="form.categoryId" required>
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

            <div class="form-group">
              <label>Trạng thái</label>
              <select v-model="form.status" required>
                <option value="Đang hoạt động">Đang hoạt động</option>
                <option value="Ngừng hoạt động">Ngừng hoạt động</option>
              </select>
            </div>

            <div class="form-group full-width">
              <label>Mô tả</label>
              <textarea
                v-model.trim="form.description"
                rows="4"
                placeholder="Nhập mô tả dịch vụ..."
              ></textarea>
            </div>

            <div class="form-group full-width">
              <label>
                Hình ảnh
                <span class="required-star">*</span>
              </label>
              <input type="file" accept="image/*" @change="handleFileChange" />
              <small class="form-hint">
                Khi thêm dịch vụ mới, bắt buộc phải chọn hình ảnh.
              </small>

              <div v-if="previewImage" class="preview-wrap">
                <img :src="previewImage" alt="preview" class="preview-image" />
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="closeModal">
              Hủy
            </button>
            <button type="submit" class="btn-primary" :disabled="submitting">
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

    <transition name="fade">
      <div v-if="successMessage" class="toast-success">
        {{ successMessage }}
      </div>
    </transition>
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
.service-admin-page {
  padding: 24px;
  background: #f8fafc;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.page-header h2 {
  margin: 0 0 6px;
  font-size: 28px;
  color: #0f172a;
}

.page-header p {
  margin: 0;
  color: #64748b;
}

.header-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.toolbar {
  margin-bottom: 18px;
}

.search-input {
  width: 100%;
  max-width: 420px;
  height: 44px;
  border-radius: 12px;
  border: 1px solid #dbe2ea;
  padding: 0 14px;
  outline: none;
}

.search-input:focus {
  border-color: #93c5fd;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
}

.table-card {
  background: #fff;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
}

.service-table {
  width: 100%;
  border-collapse: collapse;
}

.service-table th,
.service-table td {
  padding: 14px 12px;
  border-bottom: 1px solid #eef2f7;
  text-align: left;
  vertical-align: middle;
}

.service-table th {
  background: #f8fafc;
  color: #334155;
  font-size: 14px;
}

.text-center {
  text-align: center;
}

.service-thumb {
  width: 84px;
  height: 64px;
  object-fit: cover;
  border-radius: 12px;
  background: #f1f5f9;
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

.price {
  font-weight: 700;
  color: #dc2626;
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

.action-group {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary,
.btn-edit,
.btn-delete {
  border: none;
  cursor: pointer;
  min-height: 40px;
  padding: 0 14px;
  border-radius: 10px;
  font-weight: 700;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background: #2563eb;
  color: #fff;
}

.btn-secondary {
  background: #eff6ff;
  color: #2563eb;
}

.btn-edit {
  background: #f59e0b;
  color: #fff;
}

.btn-delete {
  background: #ef4444;
  color: #fff;
}

.state-box {
  background: #fff;
  border-radius: 18px;
  padding: 46px 20px;
  text-align: center;
}

.error-box {
  background: #fef2f2;
  color: #b91c1c;
}

.empty-row {
  text-align: center;
  color: #64748b;
  padding: 28px 12px !important;
}

.spinner {
  width: 42px;
  height: 42px;
  border: 4px solid #e5e7eb;
  border-top-color: #2563eb;
  border-radius: 50%;
  margin: 0 auto 14px;
  animation: spin 0.8s linear infinite;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 16px;
}

.modal-card {
  width: 100%;
  max-width: 760px;
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
}

.modal-header {
  padding: 18px 20px;
  border-bottom: 1px solid #eef2f7;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-close {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: #f1f5f9;
  font-size: 24px;
  cursor: pointer;
}

.modal-body {
  padding: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 700;
  color: #334155;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  border: 1px solid #dbe2ea;
  border-radius: 12px;
  padding: 12px 14px;
  outline: none;
}

.preview-wrap {
  margin-top: 10px;
}

.preview-image {
  width: 180px;
  height: 130px;
  object-fit: cover;
  border-radius: 12px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 18px;
}

.required-star {
  color: #dc2626;
  font-weight: 700;
}

.form-hint {
  display: inline-block;
  margin-top: 6px;
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
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 900px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .service-table {
    min-width: 900px;
  }

  .table-card {
    overflow-x: auto;
  }
}
</style>