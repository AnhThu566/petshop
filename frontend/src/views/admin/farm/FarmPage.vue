<template>
  <div class="p-2">
    <h4 class="mb-4 text-dark font-weight-bold">
      <i class="fas fa-house-user text-success"></i> QUẢN LÝ DANH MỤC TRẠI CHÓ
    </h4>

    <div v-if="isFormOpen">
      <FarmForm
        :farmData="editingFarm"
        :users="allUsers"
        @save="handleSave"
        @cancel="isFormOpen = false"
      />
    </div>

    <div v-else>
      <FarmList
        :farms="allFarms"
        @show-form="openAddForm"
        @edit="openEditForm"
        @delete="handleDeleteFarm"
      />
    </div>
  </div>
</template>

<script>
import FarmForm from "./FarmForm.vue";
import FarmList from "./FarmList.vue";
import FarmService from "@/services/farm.service";
import createApiClient from "@/services/api.service";
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
        console.log("Lỗi khi lấy danh sách trại chó:", error);
      }
    },

    async retrieveUsers() {
      try {
        const userApi = createApiClient("/api/auth");
        this.allUsers = (await userApi.get("/users")).data;
      } catch (error) {
        console.log("Chưa có API lấy User, đang dùng dữ liệu tạm để test form...");
        this.allUsers = [
          {
            _id: "65f1a2b3c4d5e6f7a8b9c0d1",
            username: "ChuTrai_Ao_01",
            email: "test@gmail.com",
          },
        ];
      }
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

    async handleSave(formData) {
      try {
        const id = formData.get("_id");

        if (id && id !== "undefined" && id !== "null" && id.length > 5) {
          await FarmService.update(id, formData);
          alert("✅ Cập nhật thông tin trại thành công!");
        } else {
          // Luồng hiện tại: admin tạo tài khoản farm kèm hồ sơ trại
          await AuthService.registerFarm(formData);
          alert("🎉 Đã thêm tài khoản và hồ sơ trại mới thành công!");
        }

        this.isFormOpen = false;
        this.editingFarm = null;

        await Promise.all([this.retrieveFarms(), this.retrieveUsers()]);
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
            error.response?.data?.message || "Lỗi hệ thống không xác định khi xóa!";
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