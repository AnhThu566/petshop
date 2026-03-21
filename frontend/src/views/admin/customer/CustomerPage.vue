<template>
  <div class="p-2 animate__animated animate__fadeIn">
    <h4 class="mb-4 text-dark font-weight-bold d-flex align-items-center">
      <i class="fas fa-users text-success mr-2"></i> QUẢN LÝ DANH MỤC KHÁCH HÀNG
    </h4>

    <div v-if="isFormOpen">
      <CustomerForm 
        :customerData="editingCustomer" 
        @save="handleSave" 
        @cancel="isFormOpen = false" 
      />
    </div>

    <div v-else>
      <CustomerList 
        :customers="allCustomers" 
        @edit="openEditForm" 
        @delete="handleDelete" 
        @add="openAddForm" 
      />
    </div>
  </div>
</template>

<script>
import CustomerList from "./CustomerList.vue";
import CustomerForm from "./CustomerForm.vue";
import CustomerService from "@/services/customer.service";

export default {
    components: { CustomerList, CustomerForm },
    data() {
        return {
            isFormOpen: false,
            editingCustomer: null, // Sẽ mang dữ liệu khi Sửa, hoặc null khi Thêm
            allCustomers: []
        };
    },
    methods: {
        // 1. Lấy danh sách khách hàng từ Backend
        async retrieveCustomers() {
            try {
                this.allCustomers = await CustomerService.getAll();
            } catch (error) {
                console.error("Lỗi lấy danh sách khách hàng:", error);
            }
        },

        // 2. Mở Form ở chế độ THÊM MỚI
        openAddForm() {
            this.editingCustomer = null; 
            this.isFormOpen = true;
        },

        // 3. Mở Form ở chế độ CHỈNH SỬA
        openEditForm(customer) {
            // Dùng spread operator để tránh tham chiếu trực tiếp, đảm bảo an toàn dữ liệu
            console.log("Dữ liệu khách hàng nhận được:", customer);
            this.editingCustomer = { ...customer }; 
            this.isFormOpen = true;
        },

        // 4. Xử lý lưu dữ liệu (Cả Thêm và Sửa)
        async handleSave(formData) {
            try {
                const id = formData.get("_id");
                
                // Kiểm tra ID để quyết định gọi API nào
                if (id && id !== "undefined" && id !== "null") {
                    await CustomerService.update(id, formData);
                    alert("✅ Đã cập nhật thông tin khách hàng thành công!");
                } else {
                    await CustomerService.create(formData);
                    alert("✅ Đã thêm khách hàng mới thành công!");
                }
                
                this.isFormOpen = false; // Đóng Form sau khi lưu
                this.retrieveCustomers(); // Cập nhật lại danh sách mới nhất
            } catch (error) {
                console.error("Lỗi khi lưu:", error);
                alert("❌ Lỗi: " + (error.response?.data?.message || "Không thể thực hiện thao tác"));
            }
        },

        // 5. Xử lý xóa khách hàng
        async handleDelete(id) {
            if (confirm("Bạn có chắc chắn muốn xóa khách hàng này? Hệ thống sẽ không thể hoàn tác!")) {
                try {
                    await CustomerService.delete(id);
                    alert("✅ Đã xóa khách hàng thành công!");
                    this.retrieveCustomers();
                } catch (error) {
                    alert("❌ Lỗi khi xóa: " + (error.response?.data?.message || error.message));
                }
            }
        }
    },
    mounted() {
        this.retrieveCustomers();
    }
};
</script>