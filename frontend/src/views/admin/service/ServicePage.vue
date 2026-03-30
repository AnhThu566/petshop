<template>
  <div class="service-admin-page bg-light py-4" style="min-height: 100vh;">
    <div class="container-fluid px-2">
      <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
        <h4 class="font-weight-bold text-dark mb-0">
          <i class="fas fa-concierge-bell mr-2 text-primary"></i>
          QUẢN LÝ DỊCH VỤ
        </h4>

        <div>
          <button class="btn btn-outline-primary btn-sm mr-2" @click="retrieveServices">
            <i class="fas fa-sync-alt mr-1"></i> Làm mới
          </button>
          <button class="btn btn-primary btn-sm" @click="openCreateModal">
            <i class="fas fa-plus mr-1"></i> Thêm dịch vụ
          </button>
        </div>
      </div>

      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body py-3">
          <div class="row align-items-center">
            <div class="col-md-4 mb-2 mb-md-0">
              <div class="input-group input-group-sm">
                <div class="input-group-prepend">
                  <span class="input-group-text bg-white">
                    <i class="fas fa-search text-primary"></i>
                  </span>
                </div>
                <input
                  type="text"
                  class="form-control"
                  placeholder="Tìm tên hoặc mã dịch vụ..."
                  v-model="searchText"
                />
              </div>
            </div>

            <div class="col-md-4 mb-2 mb-md-0">
              <select class="form-control form-control-sm" v-model="categoryFilter">
                <option value="Tất cả">Tất cả loại dịch vụ</option>
                <option
                  v-for="category in categories"
                  :key="category._id || category.id"
                  :value="category._id || category.id"
                >
                  {{ category.name }}
                </option>
              </select>
            </div>

            <div class="col-md-4 text-md-right">
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
                  :class="statusFilter === 'Đang hoạt động' ? 'btn-success text-white' : 'btn-light'"
                  @click="statusFilter = 'Đang hoạt động'"
                >
                  Đang hoạt động
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

      <div class="card border-0 shadow-sm" v-if="filteredServices.length > 0">
        <div class="table-responsive">
          <table class="table table-hover align-middle text-center mb-0">
            <thead class="bg-light">
              <tr class="small text-secondary">
                <th class="py-3">Ảnh</th>
                <th class="py-3">Mã</th>
                <th class="py-3">Tên dịch vụ</th>
                <th class="py-3">Loại dịch vụ</th>
                <th class="py-3">Giá</th>
                <th class="py-3">Trạng thái</th>
                <th class="py-3">Ngày tạo</th>
                <th class="py-3">Thao tác</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="item in filteredServices" :key="item._id || item.id">
                <td>
                  <img
                    :src="getServiceImage(item)"
                    alt="service"
                    style="width: 64px; height: 64px; object-fit: cover; border-radius: 8px;"
                  />
                </td>

                <td class="font-weight-bold text-primary">
                  {{ item.maDichVu || "---" }}
                </td>

                <td class="font-weight-bold text-dark text-left">
                  {{ item.name }}
                </td>

                <td>
                  <span class="badge badge-light border">
                    {{ item.categoryId?.name || "---" }}
                  </span>
                </td>

                <td class="text-danger font-weight-bold">
                  {{ formatCurrency(item.price) }}
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
                      title="Sửa dịch vụ"
                    >
                      <i class="fas fa-edit"></i>
                    </button>

                    <button
                      class="btn btn-sm btn-outline-danger mb-1"
                      @click="deleteService(item)"
                      title="Xóa dịch vụ"
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
          <i class="fas fa-concierge-bell fa-3x mb-3 d-block"></i>
          Chưa có dịch vụ nào phù hợp.
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
            <div class="modal-header" :class="isEditMode ? 'bg-warning' : 'bg-primary text-white'">
              <h5 class="modal-title mb-0" :class="isEditMode ? 'text-dark' : 'text-white'">
                <i class="fas mr-2" :class="isEditMode ? 'fa-edit' : 'fa-plus-circle'"></i>
                {{ isEditMode ? "Cập nhật dịch vụ" : "Thêm dịch vụ mới" }}
              </h5>
              <button type="button" class="close" :class="isEditMode ? '' : 'text-white'" @click="closeFormModal">
                <span>&times;</span>
              </button>
            </div>

            <div class="modal-body">
              <div class="row">
                <div class="col-md-7">
                  <div class="form-group">
                    <label class="font-weight-bold">Tên dịch vụ <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" v-model.trim="form.name" />
                  </div>

                  <div class="form-group">
                    <label class="font-weight-bold">Loại dịch vụ</label>
                    <select class="form-control" v-model="form.categoryId">
                      <option value="">-- Chọn loại dịch vụ --</option>
                      <option
                        v-for="category in activeCategories"
                        :key="category._id || category.id"
                        :value="category._id || category.id"
                      >
                        {{ category.name }}
                      </option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label class="font-weight-bold">Giá dịch vụ <span class="text-danger">*</span></label>
                    <input type="number" min="0" class="form-control" v-model="form.price" />
                  </div>

                  <div class="form-group">
                    <label class="font-weight-bold">Trạng thái</label>
                    <select class="form-control" v-model="form.status">
                      <option value="Đang hoạt động">Đang hoạt động</option>
                      <option value="Ngừng hoạt động">Ngừng hoạt động</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label class="font-weight-bold">Mô tả</label>
                    <textarea class="form-control" rows="4" v-model.trim="form.description"></textarea>
                  </div>
                </div>

                <div class="col-md-5">
                  <label class="font-weight-bold">Hình ảnh</label>
                  <div
                    class="border rounded mb-3 d-flex align-items-center justify-content-center bg-light shadow-sm"
                    style="height: 250px; overflow: hidden;"
                  >
                    <img
                      v-if="previewImage"
                      :src="previewImage"
                      alt="preview"
                      style="object-fit: cover; width: 100%; height: 100%;"
                    />
                    <div v-else class="text-muted text-center">
                      <i class="fas fa-image fa-4x mb-2 opacity-25"></i>
                      <p class="small mb-0">Chưa có ảnh dịch vụ</p>
                    </div>
                  </div>

                  <div class="custom-file text-left">
                    <input
                      type="file"
                      class="custom-file-input"
                      id="serviceImage"
                      accept="image/*"
                      @change="handleFileUpload"
                    />
                    <label class="custom-file-label text-truncate" for="serviceImage">
                      {{ selectedFileName || "Chọn ảnh dịch vụ..." }}
                    </label>
                  </div>
                </div>
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
                {{ isSubmitting ? "Đang xử lý..." : (isEditMode ? "Lưu thay đổi" : "Thêm dịch vụ") }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal chi tiết -->
      <div
        v-if="selectedService"
        class="modal fade show d-block"
        tabindex="-1"
        style="background: rgba(0,0,0,0.45);"
      >
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content border-0 shadow">
            <div class="modal-header bg-dark text-white">
              <h5 class="modal-title mb-0">
                <i class="fas fa-concierge-bell mr-2"></i>Chi tiết dịch vụ
              </h5>
              <button type="button" class="close text-white" @click="closeDetailModal">
                <span>&times;</span>
              </button>
            </div>

            <div class="modal-body">
              <div class="row">
                <div class="col-md-4 text-center mb-3">
                  <img
                    :src="getServiceImage(selectedService)"
                    class="img-fluid rounded shadow-sm"
                    alt="service"
                    style="max-height: 250px; object-fit: cover;"
                  />
                </div>

                <div class="col-md-8">
                  <h5 class="font-weight-bold">{{ selectedService.name }}</h5>
                  <p class="mb-1"><strong>Mã dịch vụ:</strong> {{ selectedService.maDichVu || "---" }}</p>
                  <p class="mb-1"><strong>Loại dịch vụ:</strong> {{ selectedService.categoryId?.name || "---" }}</p>
                  <p class="mb-1"><strong>Giá:</strong> {{ formatCurrency(selectedService.price) }}</p>
                  <p class="mb-1"><strong>Trạng thái:</strong> {{ selectedService.status || "---" }}</p>
                  <p class="mb-1"><strong>Ngày tạo:</strong> {{ formatDateOnly(selectedService.createdAt) }}</p>
                  <p class="mb-1"><strong>Mô tả:</strong> {{ selectedService.description || "---" }}</p>
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
import ServiceService from "@/services/service.service";
import ServiceCategoryService from "@/services/serviceCategory.service";

export default {
  data() {
    return {
      services: [],
      categories: [],
      searchText: "",
      statusFilter: "Tất cả",
      categoryFilter: "Tất cả",

      showFormModal: false,
      isEditMode: false,
      isSubmitting: false,
      selectedService: null,

      selectedFile: null,
      selectedFileName: "",
      previewImage: null,

      form: {
        _id: null,
        categoryId: "",
        name: "",
        price: "",
        description: "",
        status: "Đang hoạt động",
      },
    };
  },

  computed: {
    activeCategories() {
      return this.categories.filter(
        (item) => item.status === "Hoạt động" || !item.status
      );
    },

    filteredServices() {
      return this.services.filter((item) => {
        const keyword = (this.searchText || "").toLowerCase();
        const name = item.name ? item.name.toLowerCase() : "";
        const code = item.maDichVu ? item.maDichVu.toLowerCase() : "";
        const itemCategoryId =
          item.categoryId?._id || item.categoryId?.id || item.categoryId || "";

        const matchSearch = name.includes(keyword) || code.includes(keyword);
        const matchStatus =
          this.statusFilter === "Tất cả" || item.status === this.statusFilter;
        const matchCategory =
          this.categoryFilter === "Tất cả" ||
          String(itemCategoryId) === String(this.categoryFilter);

        return matchSearch && matchStatus && matchCategory;
      });
    },
  },

  methods: {
    async retrieveServices() {
      try {
        this.services = await ServiceService.getAll();
      } catch (error) {
        console.error("Lỗi tải danh sách dịch vụ:", error);
        alert("Không thể tải danh sách dịch vụ.");
      }
    },

    async retrieveCategories() {
      try {
        this.categories = await ServiceCategoryService.getAll();
      } catch (error) {
        console.error("Lỗi tải loại dịch vụ:", error);
      }
    },

    getServiceImage(item) {
      if (item?.image) return "http://localhost:3000" + item.image;
      return "https://via.placeholder.com/300x300";
    },

    formatCurrency(value) {
      if (value === null || value === undefined) return "---";
      return Number(value).toLocaleString("vi-VN") + " ₫";
    },

    formatDateOnly(date) {
      if (!date) return "---";
      return new Date(date).toLocaleDateString("vi-VN");
    },

    getStatusClass(status) {
      if (status === "Đang hoạt động") return "badge-success";
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
        categoryId: item.categoryId?._id || item.categoryId?.id || item.categoryId || "",
        name: item.name || "",
        price: item.price ?? "",
        description: item.description || "",
        status: item.status || "Đang hoạt động",
      };

      this.selectedFile = null;
      this.selectedFileName = "";
      this.previewImage = item.image ? "http://localhost:3000" + item.image : null;
    },

    closeFormModal() {
      this.showFormModal = false;
      this.resetForm();
    },

    resetForm() {
      this.form = {
        _id: null,
        categoryId: "",
        name: "",
        price: "",
        description: "",
        status: "Đang hoạt động",
      };

      this.selectedFile = null;
      this.selectedFileName = "";
      this.previewImage = null;
    },

    handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        alert("Vui lòng chọn file hình ảnh hợp lệ.");
        event.target.value = "";
        return;
      }

      this.selectedFile = file;
      this.selectedFileName = file.name;
      this.previewImage = URL.createObjectURL(file);
    },

    validateForm() {
      if (!this.form.name?.trim()) {
        alert("Vui lòng nhập tên dịch vụ.");
        return false;
      }

      if (this.form.price === "" || Number(this.form.price) < 0) {
        alert("Giá dịch vụ không hợp lệ.");
        return false;
      }

      if (!this.isEditMode && !this.selectedFile) {
        alert("Vui lòng chọn hình ảnh dịch vụ.");
        return false;
      }

      return true;
    },

    async submitForm() {
      if (!this.validateForm()) return;

      this.isSubmitting = true;

      try {
        const formData = new FormData();
        formData.append("categoryId", this.form.categoryId || "");
        formData.append("name", this.form.name.trim());
        formData.append("price", this.form.price);
        formData.append("description", this.form.description || "");
        formData.append("status", this.form.status);

        if (this.selectedFile) {
          formData.append("image", this.selectedFile);
        }

        if (this.isEditMode) {
          await ServiceService.update(this.form._id, formData);
          alert("✅ Cập nhật dịch vụ thành công!");
        } else {
          await ServiceService.create(formData);
          alert("✅ Thêm dịch vụ thành công!");
        }

        this.closeFormModal();
        await this.retrieveServices();
      } catch (error) {
        console.error("Lỗi lưu dịch vụ:", error);
        alert("❌ Lỗi: " + (error.response?.data?.message || error.message));
      } finally {
        this.isSubmitting = false;
      }
    },

    openDetailModal(item) {
      this.selectedService = JSON.parse(JSON.stringify(item));
    },

    closeDetailModal() {
      this.selectedService = null;
    },

    async deleteService(service) {
      if (!confirm(`Bạn có chắc muốn xóa dịch vụ [${service.name}] không?`)) return;

      try {
        await ServiceService.delete(service._id || service.id);
        alert("✅ Xóa dịch vụ thành công!");
        await this.retrieveServices();
      } catch (error) {
        console.error("Lỗi xóa dịch vụ:", error);
        alert("❌ Lỗi xóa dịch vụ: " + (error.response?.data?.message || error.message));
      }
    },
  },

  async mounted() {
    await Promise.all([
      this.retrieveServices(),
      this.retrieveCategories(),
    ]);
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

.custom-file-label::after {
  content: "Chọn ảnh" !important;
  background-color: #007bff;
  color: white;
}
</style>