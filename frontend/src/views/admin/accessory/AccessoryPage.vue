<template>
  <div class="accessory-admin-page bg-light py-4" style="min-height: 100vh;">
    <div class="container-fluid px-2">
      <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
        <h4 class="font-weight-bold text-dark mb-0">
          <i class="fas fa-box-open mr-2 text-primary"></i>
          QUẢN LÝ PHỤ KIỆN
        </h4>

        <div>
          <button class="btn btn-outline-primary btn-sm mr-2" @click="fetchAccessories">
            <i class="fas fa-sync-alt mr-1"></i> Làm mới
          </button>
          <button class="btn btn-primary btn-sm" @click="openCreateModal">
            <i class="fas fa-plus mr-1"></i> Thêm phụ kiện
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
                  placeholder="Tìm tên hoặc mã phụ kiện..."
                  v-model="searchText"
                />
              </div>
            </div>

            <div class="col-md-4 mb-2 mb-md-0">
              <select class="form-control form-control-sm" v-model="categoryFilter">
                <option value="Tất cả">Tất cả loại phụ kiện</option>
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
                  :class="statusFilter === 'Đang bán' ? 'btn-success text-white' : 'btn-light'"
                  @click="statusFilter = 'Đang bán'"
                >
                  Đang bán
                </button>
                <button
                  class="btn btn-sm"
                  :class="statusFilter === 'Ngừng bán' ? 'btn-secondary text-white' : 'btn-light'"
                  @click="statusFilter = 'Ngừng bán'"
                >
                  Ngừng bán
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card border-0 shadow-sm" v-if="filteredAccessories.length > 0">
        <div class="table-responsive">
          <table class="table table-hover align-middle text-center mb-0">
            <thead class="bg-light">
              <tr class="small text-secondary">
                <th class="py-3">Ảnh</th>
                <th class="py-3">Mã</th>
                <th class="py-3">Tên phụ kiện</th>
                <th class="py-3">Loại</th>
                <th class="py-3">Giá</th>
                <th class="py-3">Tồn kho</th>
                <th class="py-3">Trạng thái</th>
                <th class="py-3">Ngày tạo</th>
                <th class="py-3">Thao tác</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="item in filteredAccessories" :key="item._id || item.id">
                <td>
                  <img
                    :src="getAccessoryImage(item)"
                    alt="accessory"
                    style="width: 64px; height: 64px; object-fit: cover; border-radius: 8px;"
                  />
                </td>

                <td class="font-weight-bold text-primary">
                  {{ item.maPhuKien || "---" }}
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
                  <span class="font-weight-bold">
                    {{ item.quantity ?? 0 }}
                  </span>
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
                      title="Sửa phụ kiện"
                    >
                      <i class="fas fa-edit"></i>
                    </button>

                    <button
                      class="btn btn-sm btn-outline-danger mb-1"
                      @click="deleteAccessory(item)"
                      title="Xóa phụ kiện"
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
          <i class="fas fa-box-open fa-3x mb-3 d-block"></i>
          Chưa có phụ kiện nào phù hợp.
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
                {{ isEditMode ? "Cập nhật phụ kiện" : "Thêm phụ kiện mới" }}
              </h5>
              <button type="button" class="close" :class="isEditMode ? '' : 'text-white'" @click="closeFormModal">
                <span>&times;</span>
              </button>
            </div>

            <div class="modal-body">
              <div class="row">
                <div class="col-md-7">
                  <div class="form-group">
                    <label class="font-weight-bold">Tên phụ kiện <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" v-model.trim="form.name" />
                  </div>

                  <div class="form-group">
                    <label class="font-weight-bold">Loại phụ kiện</label>
                    <select class="form-control" v-model="form.categoryId">
                      <option value="">-- Chọn loại phụ kiện --</option>
                      <option
                        v-for="category in activeCategories"
                        :key="category._id || category.id"
                        :value="category._id || category.id"
                      >
                        {{ category.name }}
                      </option>
                    </select>
                  </div>

                  <div class="form-row">
                    <div class="form-group col-md-6">
                      <label class="font-weight-bold">Giá bán <span class="text-danger">*</span></label>
                      <input type="number" min="0" class="form-control" v-model="form.price" />
                    </div>

                    <div class="form-group col-md-6">
                      <label class="font-weight-bold">Số lượng tồn <span class="text-danger">*</span></label>
                      <input type="number" min="0" class="form-control" v-model="form.quantity" />
                    </div>
                  </div>

                  <div class="form-group">
                    <label class="font-weight-bold">Trạng thái</label>
                    <select class="form-control" v-model="form.status">
                      <option value="Đang bán">Đang bán</option>
                      <option value="Ngừng bán">Ngừng bán</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label class="font-weight-bold">Mô tả</label>
                    <textarea class="form-control" rows="4" v-model.trim="form.description"></textarea>
                  </div>
                </div>

                <div class="col-md-5">
                  <label class="font-weight-bold">Hình ảnh</label>

                  <div class="image-preview-container mb-3">
                    <div
                      class="border rounded d-flex align-items-center justify-content-center bg-light shadow-sm"
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
                        <p class="small mb-0">Chưa có ảnh phụ kiện</p>
                      </div>
                    </div>

                    <button
                      v-if="previewImage"
                      type="button"
                      class="btn-remove-image"
                      @click="removeImage"
                      title="Xóa ảnh này"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </div>

                  <div class="custom-file text-left">
                    <input
                      type="file"
                      class="custom-file-input"
                      id="accessoryImage"
                      accept="image/*"
                      @change="handleFileUpload"
                      ref="fileInput"
                    />
                    <label class="custom-file-label text-truncate" for="accessoryImage">
                      {{ selectedFileName || "Chọn ảnh phụ kiện..." }}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn btn-secondary" @click="closeFormModal">Hủy</button>
              <button class="btn" :class="isEditMode ? 'btn-warning text-dark' : 'btn-primary'" @click="submitForm" :disabled="isSubmitting">
                <i class="fas mr-1" :class="isEditMode ? 'fa-save' : 'fa-plus'"></i>
                {{ isSubmitting ? "Đang xử lý..." : (isEditMode ? "Lưu thay đổi" : "Thêm phụ kiện") }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal chi tiết -->
      <div
        v-if="selectedAccessory"
        class="modal fade show d-block"
        tabindex="-1"
        style="background: rgba(0,0,0,0.45);"
      >
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content border-0 shadow">
            <div class="modal-header bg-dark text-white">
              <h5 class="modal-title mb-0">
                <i class="fas fa-box-open mr-2"></i>Chi tiết phụ kiện
              </h5>
              <button type="button" class="close text-white" @click="closeDetailModal">
                <span>&times;</span>
              </button>
            </div>

            <div class="modal-body">
              <div class="row">
                <div class="col-md-4 text-center mb-3">
                  <img
                    :src="getAccessoryImage(selectedAccessory)"
                    class="img-fluid rounded shadow-sm"
                    alt="accessory"
                    style="max-height: 250px; object-fit: cover;"
                  />
                </div>

                <div class="col-md-8">
                  <h5 class="font-weight-bold">{{ selectedAccessory.name }}</h5>
                  <p class="mb-1"><strong>Mã phụ kiện:</strong> {{ selectedAccessory.maPhuKien || "---" }}</p>
                  <p class="mb-1"><strong>Loại phụ kiện:</strong> {{ selectedAccessory.categoryId?.name || "---" }}</p>
                  <p class="mb-1"><strong>Giá:</strong> {{ formatCurrency(selectedAccessory.price) }}</p>
                  <p class="mb-1"><strong>Tồn kho:</strong> {{ selectedAccessory.quantity ?? 0 }}</p>
                  <p class="mb-1"><strong>Trạng thái:</strong> {{ selectedAccessory.status || "---" }}</p>
                  <p class="mb-1"><strong>Ngày tạo:</strong> {{ formatDateOnly(selectedAccessory.createdAt) }}</p>
                  <p class="mb-1"><strong>Mô tả:</strong> {{ selectedAccessory.description || "---" }}</p>
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
import AccessoryService from "@/services/accessory.service";
import AccessoryCategoryService from "@/services/accessoryCategory.service";

export default {
  data() {
    return {
      accessories: [],
      categories: [],
      searchText: "",
      statusFilter: "Tất cả",
      categoryFilter: "Tất cả",

      showFormModal: false,
      isEditMode: false,
      isSubmitting: false,
      selectedAccessory: null,

      selectedFile: null,
      selectedFileName: "",
      previewImage: null,
      removeOldImage: false,

      form: {
        _id: null,
        categoryId: "",
        name: "",
        price: "",
        quantity: "",
        description: "",
        status: "Đang bán",
        image: "",
      },
    };
  },

  computed: {
    activeCategories() {
      return this.categories.filter(
        (item) => item.status === "Hoạt động" || !item.status
      );
    },

    filteredAccessories() {
      return this.accessories.filter((item) => {
        const keyword = (this.searchText || "").toLowerCase();
        const name = item.name ? item.name.toLowerCase() : "";
        const code = item.maPhuKien ? item.maPhuKien.toLowerCase() : "";
        const itemCategoryId = item.categoryId?._id || item.categoryId?.id || item.categoryId || "";

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
    async fetchAccessories() {
      try {
        this.accessories = await AccessoryService.getAll();
      } catch (error) {
        console.error("Lỗi tải danh sách phụ kiện:", error);
        alert("Không thể tải danh sách phụ kiện.");
      }
    },

    async fetchCategories() {
      try {
        this.categories = await AccessoryCategoryService.getAll();
      } catch (error) {
        console.error("Lỗi tải danh sách loại phụ kiện:", error);
      }
    },

    getAccessoryImage(item) {
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
      if (status === "Đang bán") return "badge-success";
      if (status === "Ngừng bán") return "badge-secondary";
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
        quantity: item.quantity ?? "",
        description: item.description || "",
        status: item.status || "Đang bán",
        image: item.image || "",
      };

      this.selectedFile = null;
      this.selectedFileName = "";
      this.previewImage = item.image ? "http://localhost:3000" + item.image : null;
      this.removeOldImage = false;

      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = "";
      }
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
        quantity: "",
        description: "",
        status: "Đang bán",
        image: "",
      };

      this.selectedFile = null;
      this.selectedFileName = "";
      this.previewImage = null;
      this.removeOldImage = false;

      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = "";
      }
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
      this.removeOldImage = false;
    },

    removeImage() {
      this.selectedFile = null;
      this.selectedFileName = "";
      this.previewImage = null;
      this.form.image = "";
      this.removeOldImage = true;

      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = "";
      }
    },

    validateForm() {
      if (!this.form.name?.trim()) {
        alert("Vui lòng nhập tên phụ kiện.");
        return false;
      }

      if (this.form.price === "" || Number(this.form.price) < 0) {
        alert("Giá phụ kiện không hợp lệ.");
        return false;
      }

      if (this.form.quantity === "" || Number(this.form.quantity) < 0) {
        alert("Số lượng tồn không hợp lệ.");
        return false;
      }

      if (!this.isEditMode && !this.selectedFile) {
        alert("Vui lòng chọn hình ảnh phụ kiện.");
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
        formData.append("quantity", this.form.quantity);
        formData.append("description", this.form.description || "");
        formData.append("status", this.form.status);

        if (this.selectedFile) {
          formData.append("image", this.selectedFile);
        }

        if (this.removeOldImage) {
          formData.append("removeImage", "true");
        }

        if (this.isEditMode) {
          await AccessoryService.update(this.form._id, formData);
          alert("✅ Cập nhật phụ kiện thành công!");
        } else {
          await AccessoryService.create(formData);
          alert("✅ Thêm phụ kiện thành công!");
        }

        this.closeFormModal();
        await this.fetchAccessories();
      } catch (error) {
        console.error(error);
        alert("❌ Lỗi: " + (error.response?.data?.message || error.message));
      } finally {
        this.isSubmitting = false;
      }
    },

    openDetailModal(item) {
      this.selectedAccessory = JSON.parse(JSON.stringify(item));
    },

    closeDetailModal() {
      this.selectedAccessory = null;
    },

    async deleteAccessory(item) {
      if (!confirm(`Bạn có chắc muốn xóa phụ kiện [${item.name}] không?`)) return;

      try {
        await AccessoryService.delete(item._id || item.id);
        alert("✅ Xóa phụ kiện thành công!");
        await this.fetchAccessories();
      } catch (error) {
        console.error(error);
        alert("❌ Lỗi xóa phụ kiện: " + (error.response?.data?.message || error.message));
      }
    },
  },

  async mounted() {
    await Promise.all([
      this.fetchAccessories(),
      this.fetchCategories(),
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

.image-preview-container {
  position: relative;
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
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
  transition: transform 0.2s ease;
  z-index: 2;
}

.btn-remove-image:hover {
  transform: scale(1.12);
  background-color: #c82333;
}
</style>