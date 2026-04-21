<template>
  <div class="breed-page bg-light py-3">
    <div class="w-100 px-2">
      <div class="page-header mb-4">
        <div>
          <h4 class="page-title">
            <i class="fas fa-dna text-info mr-2"></i>
            QUẢN LÝ DANH MỤC GIỐNG CHÓ
          </h4>
          <p class="page-subtitle mb-0">
            Quản lý thông tin giống chó, mã giống và trạng thái hoạt động trong hệ thống.
          </p>
        </div>
      </div>

      <transition name="fade-slide" mode="out-in">
        <div v-if="isFormOpen" key="form-view">
          <BreedForm
            :breedData="editingBreed"
            @save="handleSave"
            @cancel="closeForm"
          />
        </div>

        <div v-else key="list-view">
          <BreedList
            :breeds="allBreeds"
            @show-form="openAddForm"
            @edit="openEditForm"
            @delete="handleDeleteBreed"
          />
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import BreedForm from "./BreedForm.vue";
import BreedList from "./BreedList.vue";
import BreedService from "@/services/breed.service";

export default {
  name: "BreedPage",

  components: {
    BreedForm,
    BreedList,
  },

  data() {
    return {
      isFormOpen: false,
      editingBreed: null,
      allBreeds: [],
    };
  },

  methods: {
    async retrieveBreeds() {
      try {
        this.allBreeds = await BreedService.getAll();
      } catch (error) {
        console.error("Lỗi khi lấy danh sách giống chó:", error);
        alert(
          "❌ Không thể tải danh sách giống chó: " +
            (error.response?.data?.message || error.message)
        );
      }
    },

    async openAddForm() {
      this.isFormOpen = true;
      this.editingBreed = null;

      try {
        const response = await BreedService.getNextCode();
        this.editingBreed = {
          maGiong: response.nextCode,
          name: "",
          origin: "",
          description: "",
          status: "active",
          image: "",
        };
      } catch (error) {
        console.error("Lỗi không lấy được mã tự động:", error);
        this.editingBreed = {
          maGiong: "",
          name: "",
          origin: "",
          description: "",
          status: "active",
          image: "",
        };
      }
    },

    openEditForm(breed) {
      this.editingBreed = { ...breed };
      this.isFormOpen = true;
    },

    closeForm() {
      this.isFormOpen = false;
      this.editingBreed = null;
    },

    async handleSave(formData) {
      try {
        const id = formData.get("_id") || formData.get("id");

        if (id) {
          await BreedService.update(id, formData);
          alert("Cập nhật giống chó thành công!");
        } else {
          await BreedService.create(formData);
          alert("Đã thêm giống chó mới và lưu ảnh thành công!");
        }

        this.closeForm();
        await this.retrieveBreeds();
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || "Có lỗi xảy ra khi lưu!";
        alert("❌ LỖI: " + errorMessage);
      }
    },

    async handleDeleteBreed(id) {
      if (confirm("Bạn có chắc chắn muốn xóa giống chó này không?")) {
        try {
          await BreedService.delete(id);
          alert("Đã xóa giống chó thành công!");
          await this.retrieveBreeds();
        } catch (error) {
          const errorMessage =
            error.response?.data?.message ||
            "Lỗi hệ thống không xác định khi xóa!";
          alert("❌ LỖI: " + errorMessage);
        }
      }
    },
  },

  mounted() {
    this.retrieveBreeds();
  },
};
</script>

<style scoped>
.breed-page {
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