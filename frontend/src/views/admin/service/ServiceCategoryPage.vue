<template>
  <div class="service-category-admin-page bg-light py-4" style="min-height: 100vh;">
    <div class="container-fluid px-2">
      <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
        <h4 class="font-weight-bold text-dark mb-0">
          <i class="fas fa-layer-group mr-2 text-primary"></i>
          QUẢN LÝ LOẠI DỊCH VỤ
        </h4>

        <div>
          <button class="btn btn-outline-primary btn-sm mr-2" @click="fetchCategories">
            <i class="fas fa-sync-alt mr-1"></i> Làm mới
          </button>
          <button class="btn btn-primary btn-sm" @click="openCreateModal">
            <i class="fas fa-plus mr-1"></i> Thêm loại dịch vụ
          </button>
        </div>
      </div>

      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body py-3">
          <div class="row align-items-center">
            <div class="col-md-6 mb-2 mb-md-0">
              <div class="input-group input-group-sm">
                <div class="input-group-prepend">
                  <span class="input-group-text bg-white">
                    <i class="fas fa-search text-primary"></i>
                  </span>
                </div>
                <input
                  type="text"
                  class="form-control"
                  placeholder="Tìm tên hoặc mã loại dịch vụ..."
                  v-model="searchText"
                />
              </div>
            </div>

            <div class="col-md-6 text-md-right">
              <div class="btn-group flex-wrap">
                <button
                  class="btn btn-sm"
                  :class="statusFilter === 'Tất cả' ? 'btn-dark' : 'btn-light'"
                  @click="statusFilter = 'Tất cả'"
                >
                  Tất cả
                </button>
                <button
                  class="btn btn-sm"
                  :class="statusFilter === 'Hoạt động' ? 'btn-success text-white' : 'btn-light'"
                  @click="statusFilter = 'Hoạt động'"
                >
                  Hoạt động
                </button>
                <button
                  class="btn btn-sm"
                  :class="statusFilter === 'Ngừng hoạt động' ? 'btn-secondary text-white' : 'btn-light'"
                  @click="statusFilter = 'Ngừng hoạt động'"
                >
                  Ngừng hoạt động
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card border-0 shadow-sm" v-if="filteredCategories.length > 0">
        <div class="table-responsive">
          <table class="table table-hover align-middle text-center mb-0">
            <thead class="bg-light">
              <tr class="small text-secondary">
                <th class="py-3">Mã loại</th>
                <th class="py-3">Tên loại dịch vụ</th>
                <th class="py-3">Mô tả</th>
                <th class="py-3">Trạng thái</th>
                <th class="py-3">Ngày tạo</th>
                <th class="py-3">Thao tác</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="item in filteredCategories" :key="item._id || item.id">
                <td class="font-weight-bold text-primary">
                  {{ item.categoryCode || '---' }}
                </td>

                <td class="font-weight-bold text-dark text-left">
                  {{ item.name }}
                </td>

                <td class="text-left">
                  {{ item.description || '---' }}
                </td>

                <td>
                  <span class="badge px-3 py-2" :class="getStatusClass(item.status)">
                    {{ item.status }}
                  </span>
                </td>

                <td>
                  {{ formatDateOnly(item.createdAt) }}
                </td>

                <td>
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
                      title="Sửa loại dịch vụ"
                    >
                      <i class="fas fa-edit"></i>
                    </button>

                    <button
                      class="btn btn-sm btn-outline-danger mb-1"
                      @click="deleteCategory(item)"
                      title="Xóa loại dịch vụ"
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
          <i class="fas fa-layer-group fa-3x mb-3 d-block"></i>
          Chưa có loại dịch vụ nào phù hợp.
        </div>
      </div>

      <div
        v-if="showFormModal"
        class="modal fade show d-block"
        tabindex="-1"
        style="background: rgba(0,0,0,0.45);"
      >
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content border-0 shadow">
            <div class="modal-header" :class="isEditMode ? 'bg-warning' : 'bg-primary text-white'">
              <h5 class="modal-title mb-0" :class="isEditMode ? 'text-dark' : 'text-white'">
                <i class="fas mr-2" :class="isEditMode ? 'fa-edit' : 'fa-plus-circle'"></i>
                {{ isEditMode ? "Cập nhật loại dịch vụ" : "Thêm loại dịch vụ mới" }}
              </h5>
              <button type="button" class="close" :class="isEditMode ? '' : 'text-white'" @click="closeFormModal">
                <span>&times;</span>
              </button>
            </div>

            <div class="modal-body">
              <div class="form-group">
                <label class="font-weight-bold">Tên loại dịch vụ <span class="text-danger">*</span></label>
                <input type="text" class="form-control" v-model.trim="form.name" />
              </div>

              <div class="form-group">
                <label class="font-weight-bold">Trạng thái</label>
                <select class="form-control" v-model="form.status">
                  <option value="Hoạt động">Hoạt động</option>
                  <option value="Ngừng hoạt động">Ngừng hoạt động</option>
                </select>
              </div>

              <div class="form-group">
                <label class="font-weight-bold">Mô tả</label>
                <textarea class="form-control" rows="4" v-model.trim="form.description"></textarea>
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

      <div
        v-if="selectedCategory"
        class="modal fade show d-block"
        tabindex="-1"
        style="background: rgba(0,0,0,0.45);"
      >
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content border-0 shadow">
            <div class="modal-header bg-dark text-white">
              <h5 class="modal-title mb-0">
                <i class="fas fa-layer-group mr-2"></i>Chi tiết loại dịch vụ
              </h5>
              <button type="button" class="close text-white" @click="closeDetailModal">
                <span>&times;</span>
              </button>
            </div>

            <div class="modal-body">
              <p class="mb-2"><strong>Mã loại:</strong> {{ selectedCategory.categoryCode || '---' }}</p>
              <p class="mb-2"><strong>Tên loại:</strong> {{ selectedCategory.name || '---' }}</p>
              <p class="mb-2"><strong>Trạng thái:</strong> {{ selectedCategory.status || '---' }}</p>
              <p class="mb-2"><strong>Ngày tạo:</strong> {{ formatDateOnly(selectedCategory.createdAt) }}</p>
              <p class="mb-2"><strong>Mô tả:</strong> {{ selectedCategory.description || '---' }}</p>
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
import ServiceCategoryService from "@/services/serviceCategory.service";

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
        const code = item.categoryCode ? item.categoryCode.toLowerCase() : "";

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
        this.categories = await ServiceCategoryService.getAll();
      } catch (error) {
        console.error("Lỗi tải danh sách loại dịch vụ:", error);
        alert("Không thể tải danh sách loại dịch vụ.");
      }
    },

    formatDateOnly(date) {
      if (!date) return "---";
      return new Date(date).toLocaleDateString("vi-VN");
    },

    getStatusClass(status) {
      if (status === "Hoạt động") return "badge-success";
      if (status === "Ngừng hoạt động") return "badge-secondary";
      return "badge-light border";
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
        alert("Vui lòng nhập tên loại dịch vụ.");
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
          await ServiceCategoryService.update(this.form._id, payload);
          alert("✅ Cập nhật loại dịch vụ thành công!");
        } else {
          await ServiceCategoryService.create(payload);
          alert("✅ Thêm loại dịch vụ thành công!");
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
      if (!confirm(`Bạn có chắc muốn xóa loại dịch vụ [${item.name}] không?`)) return;

      try {
        await ServiceCategoryService.delete(item._id || item.id);
        alert("✅ Xóa loại dịch vụ thành công!");
        await this.fetchCategories();
      } catch (error) {
        console.error(error);
        alert("❌ Lỗi xóa loại dịch vụ: " + (error.response?.data?.message || error.message));
      }
    },
  },

  async mounted() {
    await this.fetchCategories();
  },
};
</script>

<style scoped>
.table td,
.table th {
  vertical-align: middle;
}

.modal {
  overflow-y: auto;
}
</style>