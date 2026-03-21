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
          <button class="btn btn-primary btn-sm" @click="openCreateForm">
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

            <div class="col-md-8 text-md-right">
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

      <ServiceList
        :services="filteredServices"
        @edit="openEditForm"
        @delete="deleteService"
      />

      <ServiceForm
        v-if="showForm"
        :service="currentService"
        :is-edit="isEditMode"
        @submit="saveService"
        @close="closeForm"
      />
    </div>
  </div>
</template>

<script>
import ServiceService from "@/services/service.service";
import ServiceList from "./ServiceList.vue";
import ServiceForm from "./ServiceForm.vue";

export default {
  components: {
    ServiceList,
    ServiceForm,
  },

  data() {
    return {
      services: [],
      searchText: "",
      statusFilter: "Tất cả",
      showForm: false,
      isEditMode: false,
      currentService: null,
    };
  },

  computed: {
    filteredServices() {
      return this.services.filter((item) => {
        const keyword = (this.searchText || "").toLowerCase();
        const name = item.name ? item.name.toLowerCase() : "";
        const code = item.maDichVu ? item.maDichVu.toLowerCase() : "";

        const matchSearch = name.includes(keyword) || code.includes(keyword);
        const matchStatus =
          this.statusFilter === "Tất cả" || item.status === this.statusFilter;

        return matchSearch && matchStatus;
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

    openCreateForm() {
      this.isEditMode = false;
      this.currentService = null;
      this.showForm = true;
    },

    openEditForm(service) {
      this.isEditMode = true;
      this.currentService = { ...service };
      this.showForm = true;
    },

    closeForm() {
      this.showForm = false;
      this.currentService = null;
    },

    async saveService(formData, isEdit, id) {
      try {
        if (isEdit) {
          await ServiceService.update(id, formData);
          alert("✅ Cập nhật dịch vụ thành công!");
        } else {
          await ServiceService.create(formData);
          alert("✅ Thêm dịch vụ thành công!");
        }

        this.closeForm();
        await this.retrieveServices();
      } catch (error) {
        console.error("Lỗi lưu dịch vụ:", error);
        alert("❌ Lỗi: " + (error.response?.data?.message || error.message));
      }
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

  mounted() {
    this.retrieveServices();
  },
};
</script>