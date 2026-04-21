<template>
  <div class="accessory-category-page bg-light py-4">
    <div class="container-fluid px-2">
      <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3 flex-wrap">
        <div>
          <h4 class="font-weight-bold text-dark mb-1">
            <i class="fas fa-tags mr-2 text-primary"></i>
            QUẢN LÝ LOẠI PHỤ KIỆN
          </h4>
          <div class="small text-muted">
            Quản lý danh mục loại phụ kiện, trạng thái hoạt động và thông tin mô tả.
          </div>
        </div>

        <div class="d-flex flex-wrap mt-2 mt-md-0">
          <button class="btn btn-outline-primary btn-sm mr-2 mb-2 mb-md-0" @click="fetchCategories">
            <i class="fas fa-sync-alt mr-1"></i> Làm mới
          </button>
          <button class="btn btn-primary btn-sm" @click="openCreateModal">
            <i class="fas fa-plus mr-1"></i> Thêm loại phụ kiện
          </button>
        </div>
      </div>

      <div class="row mb-3 align-items-center">
        <div class="col-lg-5 col-md-12 mb-2 mb-lg-0">
          <div class="input-group input-group-sm shadow-sm">
            <div class="input-group-prepend">
              <span class="input-group-text bg-white text-primary border-right-0">
                <i class="fas fa-search"></i>
              </span>
            </div>
            <input
              type="text"
              class="form-control border-left-0"
              placeholder="Tìm tên hoặc mã loại phụ kiện..."
              v-model.trim="searchText"
            />
          </div>
        </div>

        <div class="col-lg-5 col-md-8 mb-2 mb-lg-0">
          <div class="d-flex flex-wrap status-chip-wrap">
            <button
              class="status-chip"
              :class="{ active: statusFilter === 'Tất cả' }"
              @click="statusFilter = 'Tất cả'"
            >
              Tất cả
            </button>
            <button
              class="status-chip success"
              :class="{ active: statusFilter === 'Hoạt động' }"
              @click="statusFilter = 'Hoạt động'"
            >
              Hoạt động
            </button>
            <button
              class="status-chip secondary"
              :class="{ active: statusFilter === 'Ngừng hoạt động' }"
              @click="statusFilter = 'Ngừng hoạt động'"
            >
              Ngừng hoạt động
            </button>
          </div>
        </div>

        <div class="col-lg-2 col-md-4 text-md-right">
          <div class="small text-muted font-weight-bold">
            Tổng: {{ filteredCategories.length }} loại
          </div>
        </div>
      </div>

      <div v-if="filteredCategories.length > 0" class="card border-0 shadow-sm">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0 category-table">
            <thead class="bg-light">
              <tr class="small text-secondary">
                <th class="py-3 text-center col-code">Mã loại</th>
                <th class="py-3 text-left col-name">Tên loại phụ kiện</th>
                <th class="py-3 text-left col-desc">Mô tả</th>
                <th class="py-3 text-center col-status">Trạng thái</th>
                <th class="py-3 text-center col-date">Ngày tạo</th>
                <th class="py-3 text-center col-action">Thao tác</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="item in filteredCategories" :key="item._id || item.id">
                <td class="text-center font-weight-bold text-primary">
                  {{ item.maLoaiPhuKien || "---" }}
                </td>

                <td class="text-left font-weight-bold text-dark">
                  {{ item.name }}
                </td>

                <td class="text-left text-muted text-truncate-cell" :title="item.description || '---'">
                  {{ item.description || "---" }}
                </td>

                <td class="text-center">
                  <span class="status-badge" :class="getStatusClass(item.status)">
                    {{ item.status }}
                  </span>
                </td>

                <td class="text-center">
                  {{ formatDateOnly(item.createdAt) }}
                </td>

                <td class="text-center">
                  <div class="d-flex justify-content-center flex-wrap">
                    <button
                      class="btn btn-sm btn-outline-secondary mr-1 mb-1"
                      @click="openDetailModal(item)"
                      title="Xem chi tiết"
                    >
                      <i class="fas fa-eye"></i>
                    </button>

                    <button
                      class="btn btn-sm btn-outline-warning mr-1 mb-1"
                      @click="openEditModal(item)"
                      title="Sửa loại phụ kiện"
                    >
                      <i class="fas fa-edit"></i>
                    </button>

                    <button
                      class="btn btn-sm btn-outline-danger mb-1"
                      @click="deleteCategory(item)"
                      title="Xóa loại phụ kiện"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-else class="card border-0 shadow-sm">
        <div class="card-body text-center py-5 text-muted">
          <i class="fas fa-tags fa-3x mb-3 d-block opacity-50"></i>
          Chưa có loại phụ kiện nào phù hợp.
        </div>
      </div>

      <!-- Modal thêm/sửa -->
      <div
        v-if="showFormModal"
        class="modal fade show d-block"
        tabindex="-1"
        style="background: rgba(0,0,0,0.45);"
      >
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content border-0 shadow">
            <div
              class="modal-header"
              :class="isEditMode ? 'modal-head-warning' : 'modal-head-primary'"
            >
              <h5 class="modal-title mb-0">
                <i class="fas mr-2" :class="isEditMode ? 'fa-edit' : 'fa-plus-circle'"></i>
                {{ isEditMode ? "Cập nhật loại phụ kiện" : "Thêm loại phụ kiện mới" }}
              </h5>
              <button
                type="button"
                class="close"
                :class="isEditMode ? 'text-dark' : 'text-white'"
                @click="closeFormModal"
              >
                <span>&times;</span>
              </button>
            </div>

            <div class="modal-body form-modal-body">
              <div class="form-group">
                <label class="form-label">
                  Tên loại phụ kiện <span class="text-danger">*</span>
                </label>
                <input
                  type="text"
                  class="form-control custom-input"
                  v-model.trim="form.name"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Trạng thái</label>
                <select class="form-control custom-input" v-model="form.status">
                  <option value="Hoạt động">Hoạt động</option>
                  <option value="Ngừng hoạt động">Ngừng hoạt động</option>
                </select>
              </div>

              <div class="form-group mb-0">
                <label class="form-label">Mô tả</label>
                <textarea
                  class="form-control custom-input"
                  rows="4"
                  v-model.trim="form.description"
                ></textarea>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn btn-secondary" @click="closeFormModal">Hủy</button>
              <button
                class="btn"
                :class="isEditMode ? 'btn-warning text-dark' : 'btn-primary'"
                @click="submitForm"
                :disabled="isSubmitting"
              >
                <i class="fas mr-1" :class="isEditMode ? 'fa-save' : 'fa-plus'"></i>
                {{ isSubmitting ? "Đang xử lý..." : (isEditMode ? "Lưu thay đổi" : "Thêm loại") }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal chi tiết -->
      <div
        v-if="selectedCategory"
        class="modal fade show d-block"
        tabindex="-1"
        style="background: rgba(0,0,0,0.45);"
      >
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content border-0 shadow">
            <div class="modal-header modal-head-dark">
              <h5 class="modal-title mb-0">
                <i class="fas fa-tags mr-2"></i>Chi tiết loại phụ kiện
              </h5>
              <button type="button" class="close text-white" @click="closeDetailModal">
                <span>&times;</span>
              </button>
            </div>

            <div class="modal-body order-detail-body">
              <div class="detail-card">
                <div class="detail-row">
                  <span>Mã loại</span>
                  <strong>{{ selectedCategory.maLoaiPhuKien || "---" }}</strong>
                </div>
                <div class="detail-row">
                  <span>Tên loại</span>
                  <strong>{{ selectedCategory.name || "---" }}</strong>
                </div>
                <div class="detail-row">
                  <span>Trạng thái</span>
                  <strong>{{ selectedCategory.status || "---" }}</strong>
                </div>
                <div class="detail-row">
                  <span>Ngày tạo</span>
                  <strong>{{ formatDateOnly(selectedCategory.createdAt) }}</strong>
                </div>
                <div class="detail-row">
                  <span>Mô tả</span>
                  <strong class="wrap-text">{{ selectedCategory.description || "---" }}</strong>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn btn-secondary" @click="closeDetailModal">Đóng</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AccessoryCategoryService from "@/services/accessoryCategory.service";

export default {
  data() {
    return {
      categories: [],
      searchText: "",
      statusFilter: "Tất cả",

      showFormModal: false,
      isEditMode: false,
      isSubmitting: false,
      selectedCategory: null,

      form: {
        _id: null,
        name: "",
        description: "",
        status: "Hoạt động",
      },
    };
  },

  computed: {
    filteredCategories() {
      return this.categories.filter((item) => {
        const keyword = (this.searchText || "").toLowerCase();
        const name = item.name ? item.name.toLowerCase() : "";
        const code = item.maLoaiPhuKien ? item.maLoaiPhuKien.toLowerCase() : "";

        const matchSearch = name.includes(keyword) || code.includes(keyword);
        const matchStatus =
          this.statusFilter === "Tất cả" || item.status === this.statusFilter;

        return matchSearch && matchStatus;
      });
    },
  },

  methods: {
    async fetchCategories() {
      try {
        this.categories = await AccessoryCategoryService.getAll();
      } catch (error) {
        console.error("Lỗi tải danh sách loại phụ kiện:", error);
        alert("Không thể tải danh sách loại phụ kiện.");
      }
    },

    formatDateOnly(date) {
      if (!date) return "---";
      return new Date(date).toLocaleDateString("vi-VN");
    },

    getStatusClass(status) {
      if (status === "Hoạt động") return "badge-completed";
      if (status === "Ngừng hoạt động") return "badge-default";
      return "badge-light-custom";
    },

    openCreateModal() {
      this.isEditMode = false;
      this.showFormModal = true;
      this.resetForm();
    },

    openEditModal(item) {
      this.isEditMode = true;
      this.showFormModal = true;

      this.form = {
        _id: item._id || item.id,
        name: item.name || "",
        description: item.description || "",
        status: item.status || "Hoạt động",
      };
    },

    closeFormModal() {
      this.showFormModal = false;
      this.resetForm();
    },

    resetForm() {
      this.form = {
        _id: null,
        name: "",
        description: "",
        status: "Hoạt động",
      };
    },

    validateForm() {
      if (!this.form.name?.trim()) {
        alert("Vui lòng nhập tên loại phụ kiện.");
        return false;
      }
      return true;
    },

    async submitForm() {
      if (!this.validateForm()) return;

      this.isSubmitting = true;

      try {
        const payload = {
          name: this.form.name.trim(),
          description: this.form.description || "",
          status: this.form.status,
        };

        if (this.isEditMode) {
          await AccessoryCategoryService.update(this.form._id, payload);
          alert("✅ Cập nhật loại phụ kiện thành công!");
        } else {
          await AccessoryCategoryService.create(payload);
          alert("✅ Thêm loại phụ kiện thành công!");
        }

        this.closeFormModal();
        await this.fetchCategories();
      } catch (error) {
        console.error(error);
        alert("❌ Lỗi: " + (error.response?.data?.message || error.message));
      } finally {
        this.isSubmitting = false;
      }
    },

    openDetailModal(item) {
      this.selectedCategory = JSON.parse(JSON.stringify(item));
    },

    closeDetailModal() {
      this.selectedCategory = null;
    },

    async deleteCategory(item) {
      if (!confirm(`Bạn có chắc muốn xóa loại phụ kiện [${item.name}] không?`)) return;

      try {
        await AccessoryCategoryService.delete(item._id || item.id);
        alert("✅ Xóa loại phụ kiện thành công!");
        await this.fetchCategories();
      } catch (error) {
        console.error(error);
        alert("❌ Lỗi xóa loại phụ kiện: " + (error.response?.data?.message || error.message));
      }
    },
  },

  async mounted() {
    await this.fetchCategories();
  },
};
</script>

<style scoped>
.accessory-category-page {
  min-height: 100vh;
}

.summary-label-fake {
  font-size: 0.88rem;
}

.status-chip-wrap {
  gap: 8px;
}

.status-chip {
  border: 1px solid #dee2e6;
  background: #fff;
  color: #495057;
  border-radius: 999px;
  height: 36px;
  padding: 0 14px;
  font-size: 0.88rem;
  font-weight: 700;
  transition: all 0.2s ease;
}

.status-chip.active {
  background: #212529;
  color: #fff;
  border-color: #212529;
}

.status-chip.success.active {
  background: #198754;
  border-color: #198754;
}

.status-chip.secondary.active {
  background: #6c757d;
  border-color: #6c757d;
}

.category-table {
  min-width: 1020px;
}

.category-table th,
.category-table td {
  vertical-align: middle;
  font-size: 0.95rem;
}

.category-table thead th {
  font-weight: 700;
  white-space: nowrap;
}

.col-code {
  width: 130px;
}

.col-name {
  width: 220px;
}

.col-desc {
  width: 320px;
}

.col-status {
  width: 160px;
}

.col-date {
  width: 140px;
}

.col-action {
  width: 150px;
}

.text-truncate-cell {
  max-width: 320px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 34px;
  padding: 7px 12px;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 700;
  white-space: nowrap;
}

.badge-completed {
  background: #d1e7dd;
  color: #0f5132;
}

.badge-default {
  background: #e9ecef;
  color: #495057;
}

.badge-light-custom {
  background: #f8f9fa;
  color: #6c757d;
  border: 1px solid #dee2e6;
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

.modal-head-dark {
  background: #212529;
  color: #fff;
}

.detail-card {
  background: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 12px;
  padding: 18px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
  padding: 10px 0;
  color: #495057;
  font-size: 0.94rem;
}

.detail-row + .detail-row {
  border-top: 1px dashed #e9ecef;
}

.detail-row span {
  color: #6b7280;
  font-weight: 600;
  white-space: nowrap;
}

.detail-row strong {
  color: #212529;
  font-weight: 700;
  text-align: right;
}

.wrap-text {
  white-space: normal;
  word-break: break-word;
}

@media (max-width: 991.98px) {
  .detail-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .detail-row strong {
    text-align: left;
  }
}
</style>