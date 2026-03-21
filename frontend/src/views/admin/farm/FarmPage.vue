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
import createApiClient from "@/services/api.service"; // Dùng tạm api.service để gọi User
// 👇 THÊM DÒNG NÀY VÀO
import AuthService from "@/services/auth.service"; 

export default {
  components: { FarmForm, FarmList },
  data() {
    return {
      isFormOpen: false, 
      editingFarm: null, 
      allFarms: [], 
      allUsers: [] // Mảng chứa danh sách tài khoản Chủ Trại
    };
  },
  methods: {
    // 1. Lấy danh sách Trại Chó
    async retrieveFarms() {
      try {
        this.allFarms = await FarmService.getAll();
      } catch (error) {
        console.log("Lỗi khi lấy danh sách trại chó:", error);
      }
    },

    // 2. Lấy danh sách Tài Khoản (Để Admin gán chủ cho trại)
    async retrieveUsers() {
      try {
        // Nhắc nhẹ: Em cần có 1 API Backend trả về danh sách User (VD: /api/auth/users)
        // Hiện tại tôi dùng api.service gọi tạm. 
        const userApi = createApiClient("/api/auth"); 
        this.allUsers = (await userApi.get("/users")).data;
      } catch (error) {
        console.log("Chưa có API lấy User, đang dùng dữ liệu ảo để test Form...");
        // 🚨 CỨU CÁNH: Nếu Backend của em chưa có hàm lấy User, tôi sẽ tạo 1 dòng dữ liệu ảo để Form không bị lỗi trắng trang!
        this.allUsers = [
          { _id: "65f1a2b3c4d5e6f7a8b9c0d1", username: "ChuTrai_Ao_01", email: "test@gmail.com" }
        ];
      }
    },

    // 3. Mở form Thêm mới & TỰ ĐỘNG LẤY MÃ (T001...)
    async openAddForm() {
      this.isFormOpen = true; 
      this.editingFarm = null; 

      try {
        const response = await FarmService.getNextCode();
        this.editingFarm = { 
          maTrai: response.nextCode, 
          name: "", phone: "", address: "", description: "", ownerId: "", status: "active" 
        };
      } catch (error) {
        this.editingFarm = { maTrai: "", name: "", phone: "", address: "", description: "", ownerId: "", status: "active" };
      }
    },

    // 4. Mở form Sửa 
    openEditForm(farm) {
      this.editingFarm = farm;
      this.isFormOpen = true;
    },

    // 5. Xử lý khi bấm LƯU (Có chứa Form Data ảnh)
// 5. Xử lý khi bấm LƯU (Dùng cho cả Sửa và Thêm mới 2-trong-1)
async handleSave(formData) {
      try {
        const id = formData.get("_id");

        // Chặn đứng các giá trị giả mạo hoặc undefined
        if (id && id !== "undefined" && id !== "null" && id.length > 5) {
          await FarmService.update(id, formData);
          alert("✅ Cập nhật thông tin trại thành công!");
        } else {
          // Chỉ thêm mới khi thực sự không có ID
          await AuthService.registerFarm(formData); 
          alert("🎉 Đã thêm tài khoản và hồ sơ trại mới thành công!");
        }

        this.isFormOpen = false; 
        this.retrieveFarms();   
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        alert("❌ LỖI: " + errorMessage);
      }
    },

    // 6. Xử lý khi bấm XÓA
    async handleDeleteFarm(id) {
      if (confirm("Bạn có chắc chắn muốn xóa trại chó này không?")) {
        try {
          await FarmService.delete(id);
          alert("Đã xóa trại chó thành công!");
          this.retrieveFarms(); 
        } catch (error) {
          const errorMessage = error.response?.data?.message || "Lỗi hệ thống không xác định khi xóa!";
          alert("❌ LỖI: " + errorMessage);
        }
      }
    }
  },
  mounted() {
    this.retrieveFarms();
    this.retrieveUsers(); // Lấy sẵn danh sách User ngay khi mở trang
  }
};
</script>