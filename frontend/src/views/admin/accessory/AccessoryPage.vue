<template>
  <div class="accessory-admin-page bg-light py-4">
    <div class="container-fluid px-2">
      <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3 flex-wrap">
        <div>
          <h4 class="font-weight-bold text-dark mb-1">
            <i class="fas fa-box-open mr-2 text-primary"></i>
            QUẢN LÝ PHỤ KIỆN
          </h4>
          <div class="small text-muted">
            Quản lý thông tin phụ kiện, tồn kho, trạng thái bán và chương trình khuyến mãi.
          </div>
        </div>

        <div class="d-flex flex-wrap mt-2 mt-md-0">
          <button class="btn btn-outline-primary btn-sm mr-2 mb-2 mb-md-0" @click="fetchAccessories">
            <i class="fas fa-sync-alt mr-1"></i> Làm mới
          </button>
          <button class="btn btn-primary btn-sm" @click="openCreateModal">
            <i class="fas fa-plus mr-1"></i> Thêm phụ kiện
          </button>
        </div>
      </div>

      <div class="row mb-3 align-items-center">
        <div class="col-lg-4 col-md-12 mb-2 mb-lg-0">
          <div class="input-group input-group-sm shadow-sm">
            <div class="input-group-prepend">
              <span class="input-group-text bg-white text-primary border-right-0">
                <i class="fas fa-search"></i>
              </span>
            </div>
            <input
              type="text"
              class="form-control border-left-0"
              placeholder="Tìm tên hoặc mã phụ kiện..."
              v-model.trim="searchText"
            />
          </div>
        </div>

        <div class="col-lg-3 col-md-6 mb-2 mb-lg-0">
          <select class="form-control form-control-sm shadow-sm" v-model="categoryFilter">
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

        <div class="col-lg-4 col-md-6 mb-2 mb-lg-0">
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
              :class="{ active: statusFilter === 'Đang bán' }"
              @click="statusFilter = 'Đang bán'"
            >
              Đang bán
            </button>
            <button
              class="status-chip secondary"
              :class="{ active: statusFilter === 'Ngừng bán' }"
              @click="statusFilter = 'Ngừng bán'"
            >
              Ngừng bán
            </button>
          </div>
        </div>

        <div class="col-lg-1 col-md-12 text-lg-right">
          <div class="small text-muted font-weight-bold">
            Tổng: {{ filteredAccessories.length }}
          </div>
        </div>
      </div>

      <div v-if="filteredAccessories.length > 0" class="card border-0 shadow-sm">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0 accessory-table">
            <thead class="bg-light">
              <tr class="small text-secondary">
                <th class="py-3 text-center col-image">Ảnh</th>
                <th class="py-3 text-center col-code">Mã</th>
                <th class="py-3 text-left col-name">Tên phụ kiện</th>
                <th class="py-3 text-center col-category">Loại</th>
                <th class="py-3 text-center col-price">Giá</th>
                <th class="py-3 text-center col-promotion">Khuyến mãi</th>
                <th class="py-3 text-center col-quantity">Tồn kho</th>
                <th class="py-3 text-center col-status">Trạng thái</th>
                <th class="py-3 text-center col-date">Ngày tạo</th>
                <th class="py-3 text-center col-action">Thao tác</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="item in filteredAccessories" :key="item._id || item.id">
                <td class="text-center">
                  <img
                    :src="getAccessoryImage(item)"
                    alt="accessory"
                    class="accessory-thumb"
                  />
                </td>

                <td class="text-center font-weight-bold text-primary">
                  {{ item.maPhuKien || "---" }}
                </td>

                <td class="text-left font-weight-bold text-dark">
                  {{ item.name }}
                </td>

                <td class="text-center">
                  <span class="soft-badge">
                    {{ item.categoryId?.name || "---" }}
                  </span>
                </td>

                <td class="text-center text-danger font-weight-bold">
                  {{ formatCurrency(item.price) }}
                </td>

                <td class="text-center">
                  <span
                    v-if="item.promotion?.isActive && item.promotion?.discountValue > 0"
                    class="status-badge badge-cancelled"
                  >
                    {{ getPromotionLabel(item.promotion) }}
                  </span>
                  <span v-else class="status-badge badge-light-custom">
                    Không có
                  </span>
                </td>

                <td class="text-center font-weight-bold">
                  {{ item.quantity ?? 0 }}
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
          <i class="fas fa-box-open fa-3x mb-3 d-block opacity-50"></i>
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
        <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
          <div class="modal-content border-0 shadow">
            <div
              class="modal-header"
              :class="isEditMode ? 'modal-head-warning' : 'modal-head-primary'"
            >
              <h5 class="modal-title mb-0">
                <i class="fas mr-2" :class="isEditMode ? 'fa-edit' : 'fa-plus-circle'"></i>
                {{ isEditMode ? "Cập nhật phụ kiện" : "Thêm phụ kiện mới" }}
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
              <div class="row">
                <div class="col-md-7">
                  <div class="form-group">
                    <label class="form-label">
                      Tên phụ kiện <span class="text-danger">*</span>
                    </label>
                    <input type="text" class="form-control custom-input" v-model.trim="form.name" />
                  </div>

                  <div class="form-group">
                    <label class="form-label">Loại phụ kiện</label>
                    <select class="form-control custom-input" v-model="form.categoryId">
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
                      <label class="form-label">
                        Giá bán <span class="text-danger">*</span>
                      </label>
                      <input type="number" min="0" class="form-control custom-input" v-model="form.price" />
                    </div>

                    <div class="form-group col-md-6">
                      <label class="form-label">
                        Số lượng tồn <span class="text-danger">*</span>
                      </label>
                      <input type="number" min="0" class="form-control custom-input" v-model="form.quantity" />
                    </div>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Trạng thái</label>
                    <select class="form-control custom-input" v-model="form.status">
                      <option value="Đang bán">Đang bán</option>
                      <option value="Ngừng bán">Ngừng bán</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Mô tả</label>
                    <textarea class="form-control custom-input" rows="4" v-model.trim="form.description"></textarea>
                  </div>

                  <div class="promotion-box mt-4">
                    <div class="d-flex justify-content-between align-items-center flex-wrap mb-3">
                      <h6 class="promotion-title mb-2 mb-md-0">
                        <i class="fas fa-tags mr-2"></i>Cấu hình khuyến mãi
                      </h6>

                      <div class="custom-control custom-switch">
                        <input
                          type="checkbox"
                          class="custom-control-input"
                          id="promotionSwitch"
                          v-model="form.promotion.isActive"
                        />
                        <label class="custom-control-label font-weight-bold" for="promotionSwitch">
                          Bật khuyến mãi
                        </label>
                      </div>
                    </div>

                    <div v-if="form.promotion.isActive">
                      <div class="form-group">
                        <label class="form-label">Tên chương trình</label>
                        <input
                          type="text"
                          class="form-control custom-input"
                          v-model.trim="form.promotion.title"
                          placeholder="Ví dụ: Sale hè, Ưu đãi cuối tuần..."
                        />
                      </div>

                      <div class="form-row">
                        <div class="form-group col-md-6">
                          <label class="form-label">Loại giảm giá</label>
                          <select class="form-control custom-input" v-model="form.promotion.discountType">
                            <option value="percent">Giảm theo %</option>
                            <option value="fixed">Giảm theo số tiền</option>
                          </select>
                        </div>

                        <div class="form-group col-md-6">
                          <label class="form-label">
                            {{ form.promotion.discountType === "percent" ? "Phần trăm giảm" : "Số tiền giảm" }}
                          </label>
                          <input
                            type="number"
                            min="0"
                            class="form-control custom-input"
                            v-model="form.promotion.discountValue"
                            :placeholder="form.promotion.discountType === 'percent' ? 'Ví dụ: 10' : 'Ví dụ: 50000'"
                          />
                        </div>
                      </div>

                      <div class="form-row">
                        <div class="form-group col-md-6">
                          <label class="form-label">Ngày bắt đầu</label>
                          <input
                            type="datetime-local"
                            class="form-control custom-input"
                            v-model="form.promotion.startDate"
                          />
                        </div>

                        <div class="form-group col-md-6">
                          <label class="form-label">Ngày kết thúc</label>
                          <input
                            type="datetime-local"
                            class="form-control custom-input"
                            v-model="form.promotion.endDate"
                          />
                        </div>
                      </div>

                      <div class="promo-preview-box">
                        <div class="small text-muted mb-1">Xem nhanh:</div>
                        <div class="font-weight-bold text-danger">
                          {{ previewPromotionText }}
                        </div>
                      </div>
                    </div>

                    <div v-else class="small text-muted font-italic">
                      Phụ kiện này hiện không áp dụng chương trình khuyến mãi.
                    </div>
                  </div>
                </div>

                <div class="col-md-5">
                  <label class="form-label">Hình ảnh</label>

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
              <button
                class="btn"
                :class="isEditMode ? 'btn-warning text-dark' : 'btn-primary'"
                @click="submitForm"
                :disabled="isSubmitting"
              >
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
        <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div class="modal-content border-0 shadow">
            <div class="modal-header modal-head-dark">
              <h5 class="modal-title mb-0">
                <i class="fas fa-box-open mr-2"></i>Chi tiết phụ kiện
              </h5>
              <button type="button" class="close text-white" @click="closeDetailModal">
                <span>&times;</span>
              </button>
            </div>

            <div class="modal-body order-detail-body">
              <div class="row">
                <div class="col-md-4 text-center mb-3">
                  <img
                    :src="getAccessoryImage(selectedAccessory)"
                    class="detail-accessory-image"
                    alt="accessory"
                  />
                </div>

                <div class="col-md-8">
                  <div class="detail-card">
                    <div class="detail-row">
                      <span>Tên phụ kiện</span>
                      <strong>{{ selectedAccessory.name }}</strong>
                    </div>
                    <div class="detail-row">
                      <span>Mã phụ kiện</span>
                      <strong>{{ selectedAccessory.maPhuKien || "---" }}</strong>
                    </div>
                    <div class="detail-row">
                      <span>Loại phụ kiện</span>
                      <strong>{{ selectedAccessory.categoryId?.name || "---" }}</strong>
                    </div>
                    <div class="detail-row">
                      <span>Giá</span>
                      <strong>{{ formatCurrency(selectedAccessory.price) }}</strong>
                    </div>
                    <div class="detail-row">
                      <span>Tồn kho</span>
                      <strong>{{ selectedAccessory.quantity ?? 0 }}</strong>
                    </div>
                    <div class="detail-row">
                      <span>Trạng thái</span>
                      <strong>{{ selectedAccessory.status || "---" }}</strong>
                    </div>
                    <div class="detail-row">
                      <span>Ngày tạo</span>
                      <strong>{{ formatDateOnly(selectedAccessory.createdAt) }}</strong>
                    </div>
                    <div class="detail-row">
                      <span>Mô tả</span>
                      <strong class="wrap-text">{{ selectedAccessory.description || "---" }}</strong>
                    </div>
                  </div>

                  <div class="detail-card mt-3">
                    <div class="detail-card-title text-danger">Thông tin khuyến mãi</div>

                    <div class="detail-row">
                      <span>Áp dụng</span>
                      <strong>{{ selectedAccessory.promotion?.isActive ? "Có" : "Không" }}</strong>
                    </div>
                    <div class="detail-row">
                      <span>Tên chương trình</span>
                      <strong>{{ selectedAccessory.promotion?.title || "---" }}</strong>
                    </div>
                    <div class="detail-row">
                      <span>Loại giảm</span>
                      <strong>
                        {{ selectedAccessory.promotion?.discountType === "fixed" ? "Giảm tiền" : "Giảm %" }}
                      </strong>
                    </div>
                    <div class="detail-row">
                      <span>Giá trị giảm</span>
                      <strong>{{ formatPromotionValue(selectedAccessory.promotion) }}</strong>
                    </div>
                    <div class="detail-row">
                      <span>Bắt đầu</span>
                      <strong>{{ formatDateTime(selectedAccessory.promotion?.startDate) }}</strong>
                    </div>
                    <div class="detail-row">
                      <span>Kết thúc</span>
                      <strong>{{ formatDateTime(selectedAccessory.promotion?.endDate) }}</strong>
                    </div>
                  </div>
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
        promotion: {
          isActive: false,
          title: "",
          discountType: "percent",
          discountValue: 0,
          startDate: "",
          endDate: "",
        },
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

    previewPromotionText() {
      if (!this.form.promotion.isActive) return "Không áp dụng khuyến mãi";

      const value = Number(this.form.promotion.discountValue || 0);

      if (this.form.promotion.discountType === "fixed") {
        return `Giảm ${value.toLocaleString("vi-VN")} ₫`;
      }

      return `Giảm ${value}%`;
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

    formatDateTime(date) {
      if (!date) return "---";
      return new Date(date).toLocaleString("vi-VN");
    },

    formatDateTimeLocal(date) {
      if (!date) return "";
      const d = new Date(date);
      const pad = (n) => String(n).padStart(2, "0");

      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    },

    formatPromotionValue(promotion = {}) {
      if (!promotion?.isActive) return "---";

      if (promotion.discountType === "fixed") {
        return Number(promotion.discountValue || 0).toLocaleString("vi-VN") + " ₫";
      }

      return `${Number(promotion.discountValue || 0)}%`;
    },

    getPromotionLabel(promotion = {}) {
      if (!promotion?.isActive) return "Không có";

      if (promotion.discountType === "fixed") {
        return `Giảm ${Number(promotion.discountValue || 0).toLocaleString("vi-VN")}₫`;
      }

      return `Giảm ${Number(promotion.discountValue || 0)}%`;
    },

    getStatusClass(status) {
      if (status === "Đang bán") return "badge-completed";
      if (status === "Ngừng bán") return "badge-default";
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
        categoryId: item.categoryId?._id || item.categoryId?.id || item.categoryId || "",
        name: item.name || "",
        price: item.price ?? "",
        quantity: item.quantity ?? "",
        description: item.description || "",
        status: item.status || "Đang bán",
        image: item.image || "",
        promotion: {
          isActive: item.promotion?.isActive || false,
          title: item.promotion?.title || "",
          discountType: item.promotion?.discountType || "percent",
          discountValue: item.promotion?.discountValue ?? 0,
          startDate: this.formatDateTimeLocal(item.promotion?.startDate),
          endDate: this.formatDateTimeLocal(item.promotion?.endDate),
        },
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
        promotion: {
          isActive: false,
          title: "",
          discountType: "percent",
          discountValue: 0,
          startDate: "",
          endDate: "",
        },
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

      if (this.form.promotion.isActive) {
        const discountValue = Number(this.form.promotion.discountValue || 0);

        if (discountValue <= 0) {
          alert("Giá trị khuyến mãi phải lớn hơn 0.");
          return false;
        }

        if (
          this.form.promotion.discountType === "percent" &&
          discountValue > 100
        ) {
          alert("Khuyến mãi phần trăm không được vượt quá 100%.");
          return false;
        }

        if (
          this.form.promotion.startDate &&
          this.form.promotion.endDate &&
          new Date(this.form.promotion.startDate) > new Date(this.form.promotion.endDate)
        ) {
          alert("Ngày bắt đầu khuyến mãi không được sau ngày kết thúc.");
          return false;
        }
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

        formData.append("promotion[isActive]", this.form.promotion.isActive ? "true" : "false");
        formData.append("promotion[title]", this.form.promotion.title || "");
        formData.append("promotion[discountType]", this.form.promotion.discountType || "percent");
        formData.append("promotion[discountValue]", this.form.promotion.discountValue ?? 0);
        formData.append("promotion[startDate]", this.form.promotion.startDate || "");
        formData.append("promotion[endDate]", this.form.promotion.endDate || "");

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
.accessory-admin-page {
  min-height: 100vh;
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

.accessory-table {
  min-width: 1420px;
}

.accessory-table th,
.accessory-table td {
  vertical-align: middle;
  font-size: 0.95rem;
}

.accessory-table thead th {
  font-weight: 700;
  white-space: nowrap;
}

.col-image {
  width: 100px;
}

.col-code {
  width: 120px;
}

.col-name {
  width: 220px;
}

.col-category {
  width: 170px;
}

.col-price {
  width: 140px;
}

.col-promotion {
  width: 170px;
}

.col-quantity {
  width: 110px;
}

.col-status {
  width: 140px;
}

.col-date {
  width: 130px;
}

.col-action {
  width: 140px;
}

.accessory-thumb {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid #dee2e6;
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

.badge-cancelled {
  background: #f8d7da;
  color: #842029;
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

.custom-file-label::after {
  content: "Chọn ảnh" !important;
  background-color: #0d6efd;
  color: white;
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

.promotion-box {
  border: 1px solid #f8d7da;
  background: #fff8f8;
  border-radius: 12px;
  padding: 16px;
}

.promotion-title {
  font-weight: 700;
  color: #dc3545;
}

.promo-preview-box {
  border: 1px dashed #dc3545;
  background: #fff;
  border-radius: 10px;
  padding: 12px;
}

.detail-accessory-image {
  width: 100%;
  max-height: 250px;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid #dee2e6;
}

.detail-card {
  background: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 12px;
  padding: 18px;
}

.detail-card-title {
  font-size: 1rem;
  font-weight: 700;
  color: #212529;
  margin-bottom: 14px;
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