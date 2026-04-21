<template>
  <div class="customer-page bg-light py-3">
    <div class="w-100 px-2">
      <div class="page-header mb-4">
        <div>
          <h4 class="page-title">
            <i class="fas fa-users text-success mr-2"></i>
            QUẢN LÝ DANH MỤC KHÁCH HÀNG
          </h4>
          <p class="page-subtitle mb-0">
            Quản lý hồ sơ, tài khoản và trạng thái hoạt động của khách hàng.
          </p>
        </div>
      </div>

      <transition name="fade-slide" mode="out-in">
        <div v-if="isFormOpen" key="form-view">
          <CustomerForm
            :customerData="editingCustomer"
            @save="handleSave"
            @cancel="isFormOpen = false"
          />
        </div>

        <div v-else key="list-view">
          <CustomerList
            :customers="allCustomers"
            @edit="openEditForm"
            @delete="handleDelete"
            @add="openAddForm"
          />
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import CustomerList from "./CustomerList.vue";
import CustomerForm from "./CustomerForm.vue";
import CustomerService from "@/services/customer.service";

export default {
  name: "CustomerPage",

  components: {
    CustomerList,
    CustomerForm,
  },

  data() {
    return {
      isFormOpen: false,
      editingCustomer: null,
      allCustomers: [],
    };
  },

  methods: {
    async retrieveCustomers() {
      try {
        this.allCustomers = await CustomerService.getAll();
      } catch (error) {
        console.error("Lỗi lấy danh sách khách hàng:", error);
      }
    },

    openAddForm() {
      this.editingCustomer = null;
      this.isFormOpen = true;
    },

    openEditForm(customer) {
      console.log("Dữ liệu khách hàng nhận được:", customer);
      this.editingCustomer = { ...customer };
      this.isFormOpen = true;
    },

    async handleSave(formData) {
      try {
        const id = formData.get("_id");

        if (id && id !== "undefined" && id !== "null") {
          await CustomerService.update(id, formData);
          alert("✅ Đã cập nhật thông tin khách hàng thành công!");
        } else {
          await CustomerService.create(formData);
          alert("✅ Đã thêm khách hàng mới thành công!");
        }

        this.isFormOpen = false;
        await this.retrieveCustomers();
      } catch (error) {
        console.error("Lỗi khi lưu:", error);
        alert(
          "❌ Lỗi: " +
            (error.response?.data?.message || "Không thể thực hiện thao tác")
        );
      }
    },

    async handleDelete(id) {
      if (
        confirm(
          "Bạn có chắc chắn muốn xóa khách hàng này? Hệ thống sẽ không thể hoàn tác!"
        )
      ) {
        try {
          await CustomerService.delete(id);
          alert("✅ Đã xóa khách hàng thành công!");
          await this.retrieveCustomers();
        } catch (error) {
          alert(
            "❌ Lỗi khi xóa: " +
              (error.response?.data?.message || error.message)
          );
        }
      }
    },
  },

  mounted() {
    this.retrieveCustomers();
  },
};
</script>

<style scoped>
.customer-page {
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