<template>
  <div class="vaccine-page bg-light py-3">
    <div class="w-100 px-2">
      <div class="page-header mb-4">
        <div>
          <h4 class="page-title">
            <i class="fas fa-syringe text-primary mr-2"></i>
            QUẢN LÝ DANH MỤC VACCINE
          </h4>
          <p class="page-subtitle mb-0">
            Quản lý thông tin vaccine, mô tả tác dụng và trạng thái sử dụng trong hệ thống.
          </p>
        </div>
      </div>

      <transition name="fade-slide" mode="out-in">
        <div v-if="showForm" key="form-view">
          <VaccineForm
            :vaccine="selectedVaccine"
            :isEdit="isEditMode"
            :allVaccines="vaccineData"
            @close="closeForm"
          />
        </div>

        <div v-else key="list-view">
          <div class="card border-0 shadow-sm">
            <div
              class="card-header bg-white py-3 d-flex justify-content-between align-items-center flex-wrap"
            >
              <div class="mb-2 mb-md-0">
                <h5 class="mb-1 text-primary font-weight-bold">
                  <i class="fas fa-list-ul mr-2"></i> DANH SÁCH VACCINE
                </h5>
                <div class="small text-muted">
                  Theo dõi các loại vaccine đang sử dụng trong hệ thống.
                </div>
              </div>

              <button
                class="btn btn-primary btn-sm font-weight-bold shadow-sm px-3"
                @click="openFormForAdd"
              >
                <i class="fas fa-plus mr-1"></i> Thêm Vaccine Mới
              </button>
            </div>

            <div class="card-body p-0">
              <VaccineList
                :vaccines="vaccineData"
                @edit="openFormForEdit"
                @delete="handleDelete"
              />
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import VaccineService from "@/services/vaccine.service";
import VaccineList from "./VaccineList.vue";
import VaccineForm from "./VaccineForm.vue";

export default {
  name: "VaccinePage",

  components: {
    VaccineList,
    VaccineForm,
  },

  data() {
    return {
      vaccineData: [],
      selectedVaccine: {},
      isEditMode: false,
      showForm: false,
    };
  },

  methods: {
    async retrieveVaccines() {
      try {
        this.vaccineData = await VaccineService.getAll();
      } catch (error) {
        console.error("Lỗi tải danh sách vaccine:", error);
        alert(
          "❌ Không thể tải danh sách vaccine: " +
            (error.response?.data?.message || error.message)
        );
      }
    },

    openFormForAdd() {
      this.isEditMode = false;
      this.selectedVaccine = {
        name: "",
        description: "",
        status: "Hoạt động",
      };
      this.showForm = true;
    },

    openFormForEdit(vc) {
      this.isEditMode = true;
      this.selectedVaccine = { ...vc };
      this.showForm = true;
    },

    async closeForm() {
      this.showForm = false;
      this.selectedVaccine = {};
      await this.retrieveVaccines();
    },

    async handleDelete(id) {
      if (!confirm("Bạn có chắc muốn xóa loại Vaccine này không?")) return;

      try {
        await VaccineService.delete(id);
        alert("Đã xóa thành công!");
        await this.retrieveVaccines();
      } catch (error) {
        alert("❌ Lỗi khi xóa: " + (error.response?.data?.message || error.message));
      }
    },
  },

  mounted() {
    this.retrieveVaccines();
  },
};
</script>

<style scoped>
.vaccine-page {
  min-height: 100%;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding-bottom: 14px;
  border-bottom: 1px solid #dee2e6;
}

.page-title {
  margin: 0 0 4px;
  font-weight: 800;
  color: #0f172a;
  font-size: 1.35rem;
}

.page-subtitle {
  color: #6b7280;
  font-size: 0.94rem;
  font-weight: 500;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 991.98px) {
  .page-title {
    font-size: 1.15rem;
  }
}
</style>