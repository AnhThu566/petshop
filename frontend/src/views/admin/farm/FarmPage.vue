<template>
  <div class="farm-page bg-light py-3">
    <div class="w-100 px-2">
      <div class="page-header mb-4">
        <div>
          <h4 class="page-title">
            <i class="fas fa-house-user text-success mr-2"></i>
            QUẢN LÝ DANH MỤC TRẠI CHÓ
          </h4>
          <p class="page-subtitle mb-0">
            Quản lý hồ sơ trại cung cấp chó, tài khoản chủ trại và trạng thái hợp tác.
          </p>
        </div>
      </div>

      <transition name="fade-slide" mode="out-in">
        <div v-if="isFormOpen" key="form-view">
          <FarmForm
            :farmData="editingFarm"
            :users="allUsers"
            @save="handleSave"
            @cancel="closeForm"
          />
        </div>

        <div v-else key="list-view">
          <FarmList
            :farms="allFarms"
            @show-form="openAddForm"
            @edit="openEditForm"
            @delete="handleDeleteFarm"
          />
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import FarmForm from "./FarmForm.vue";
import FarmList from "./FarmList.vue";
import FarmService from "@/services/farm.service";
import AuthService from "@/services/auth.service";

export default {
  name: "FarmPage",

  components: {
    FarmForm,
    FarmList,
  },

  data() {
    return {
      isFormOpen: false,
      editingFarm: null,
      allFarms: [],
      allUsers: [],
    };
  },

  methods: {
    async retrieveFarms() {
      try {
        this.allFarms = await FarmService.getAll();
      } catch (error) {
        console.error("Lỗi khi lấy danh sách trại chó:", error);
        alert(
          "❌ Không thể tải danh sách trại chó: " +
            (error.response?.data?.message || error.message)
        );
      }
    },

    async retrieveUsers() {
      this.allUsers = [];
    },

    async openAddForm() {
      this.isFormOpen = true;
      this.editingFarm = null;

      try {
        const response = await FarmService.getNextCode();
        this.editingFarm = {
          maTrai: response.nextCode,
          name: "",
          phone: "",
          address: "",
          description: "",
          ownerId: "",
          status: "active",
          image: null,
        };
      } catch (error) {
        this.editingFarm = {
          maTrai: "",
          name: "",
          phone: "",
          address: "",
          description: "",
          ownerId: "",
          status: "active",
          image: null,
        };
      }
    },

    openEditForm(farm) {
      this.editingFarm = { ...farm };
      this.isFormOpen = true;
    },

    closeForm() {
      this.isFormOpen = false;
      this.editingFarm = null;
    },

    async handleSave(formData) {
      try {
        const id = formData.get("_id");

        if (id && id !== "undefined" && id !== "null" && id.length > 5) {
          await FarmService.update(id, formData);
          alert("✅ Cập nhật thông tin trại thành công!");
        } else {
          await AuthService.registerFarm(formData);
          alert("🎉 Đã thêm tài khoản và hồ sơ trại mới thành công!");
        }

        this.closeForm();
        await this.retrieveFarms();
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        alert("❌ LỖI: " + errorMessage);
      }
    },

    async handleDeleteFarm(id) {
      if (confirm("Bạn có chắc chắn muốn xóa trại chó này không?")) {
        try {
          await FarmService.delete(id);
          alert("Đã xóa trại chó thành công!");
          await this.retrieveFarms();
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
    this.retrieveFarms();
    this.retrieveUsers();
  },
};
</script>

<style scoped>
.farm-page {
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