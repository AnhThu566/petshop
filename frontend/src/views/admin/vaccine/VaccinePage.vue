<template>
  <div class="animate__animated animate__fadeIn">
    
    <VaccineForm 
      v-if="showForm" 
      :vaccine="selectedVaccine" 
      :isEdit="isEditMode" 
      :allVaccines="vaccineData" @close="closeForm" 
    />

    <div v-if="!showForm" class="card shadow-sm border-0">
      
      <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
        <h5 class="mb-0 text-primary font-weight-bold">
          <i class="fas fa-list-ul mr-2"></i> DANH SÁCH VACCINE
        </h5>
        <button class="btn btn-primary font-weight-bold shadow-sm" @click="openFormForAdd">
          <i class="fas fa-plus mr-1"></i> Thêm Vaccine Mới
        </button>
      </div>

      <div class="card-body p-4">
        <VaccineList 
          :vaccines="vaccineData" 
          @edit="openFormForEdit" 
          @delete="handleDelete" 
        />
      </div>
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
    VaccineForm
  },
  data() {
    return {
      vaccineData: [],
      selectedVaccine: {},
      isEditMode: false,
      showForm: false // Đổi tên biến cho chuẩn với ý nghĩa
    };
  },
  methods: {
    async retrieveVaccines() {
      try {
        this.vaccineData = await VaccineService.getAll();
      } catch (error) {
        console.error("Lỗi tải danh sách:", error);
      }
    },
    
    openFormForAdd() {
      this.isEditMode = false;
      this.selectedVaccine = { name: "", description: "", status: "Hoạt động" };
      this.showForm = true; // Hiện form
    },

    openFormForEdit(vc) {
      this.isEditMode = true;
      this.selectedVaccine = { ...vc };
      this.showForm = true; // Hiện form
    },

    closeForm() {
      this.showForm = false; // Ẩn form
      this.retrieveVaccines(); // Cập nhật lại danh sách
    },

    async handleDelete(id) {
      if (!confirm("Bạn có chắc muốn xóa loại Vaccine này không?")) return;
      try {
        await VaccineService.delete(id);
        alert("Đã xóa thành công!");
        this.retrieveVaccines(); 
      } catch (error) {
        alert("Lỗi khi xóa!");
      }
    }
  },
  mounted() {
    this.retrieveVaccines();
  }
};
</script>