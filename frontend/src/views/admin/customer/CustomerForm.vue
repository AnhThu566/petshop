<template>
  <div class="card shadow-sm border-0 animate__animated animate__fadeIn">
    <div class="card-header bg-primary text-white py-3 d-flex justify-content-between align-items-center">
      <h5 class="mb-0 font-weight-bold">
        <i class="fas" :class="customer._id ? 'fa-user-edit' : 'fa-plus-circle'"></i>
        {{ customer._id ? 'CẬP NHẬT THÔNG TIN KHÁCH HÀNG' : 'ĐĂNG KÝ HỆ THỐNG KHÁCH HÀNG MỚI' }}
      </h5>
      <span class="badge badge-light px-3 py-2 text-primary shadow-sm" style="font-size: 0.9rem;">
        Mã khách hàng: <strong class="text-danger ml-1">{{ displayCode }}</strong>
      </span>
    </div>

    <div class="card-body p-4 bg-white">
      <form @submit.prevent="submitForm">
        <div class="row">
          <div class="col-md-6 pr-md-4 border-right">
            <h6 class="text-primary font-weight-bold mb-4">
              <i class="fas fa-user-circle mr-1"></i> 1. Thông tin Tài khoản
            </h6>
            
            <div class="form-group mb-4">
              <label class="font-weight-bold">Tên đăng nhập (Username):</label>
              <input type="text" class="form-control" 
                     :class="customer._id ? 'bg-light text-muted' : 'border-primary'" 
                     v-model="customer.username" :readonly="!!customer._id" required>
              <small v-if="customer._id" class="text-muted italic">* Không được thay đổi tên đăng nhập</small>
            </div>

            <div class="form-group mb-4">
              <label class="font-weight-bold">Email chính chủ:</label>
              <input type="email" class="form-control" v-model="customer.email" required placeholder="example@gmail.com">
            </div>

            <div class="form-group mb-4">
              <label class="font-weight-bold text-danger">Trạng thái hoạt động:</label>
              <select class="form-control border-danger font-weight-bold" v-model="customer.status">
                <option value="active">Đang hoạt động (Active)</option>
                <option value="locked">Bị khóa (Locked)</option>
              </select>
            </div>
          </div>

          <div class="col-md-6 pl-md-4">
            <h6 class="text-success font-weight-bold mb-4">
              <i class="fas fa-address-card mr-1"></i> 2. Hồ sơ Khách hàng
            </h6>

            <div class="form-group mb-4">
              <label class="font-weight-bold">Họ tên người đại diện:</label>
              <input type="text" class="form-control border-success" v-model="customer.fullName" required placeholder="Nhập họ tên đầy đủ...">
            </div>

            <div class="row">
              <div class="col-6">
                <div class="form-group">
                  <label class="font-weight-bold">Số điện thoại:</label>
                  <input type="text" class="form-control" v-model="customer.phone" placeholder="09xxx...">
                </div>
              </div>
              <div class="col-6">
                <div class="form-group">
                  <label class="font-weight-bold">Ngày sinh:</label>
                  <input type="date" class="form-control" v-model="formattedBirthday">
                </div>
              </div>
            </div>

            <div class="form-group mt-3">
                <label class="font-weight-bold">Giới tính:</label>
                <select class="form-control" v-model="customer.gender">
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                </select>
            </div>
          </div>
        </div>

        <div class="text-center mt-5 border-top pt-4">
          <button type="button" class="btn btn-secondary shadow px-5 py-2 mr-3 font-weight-bold" @click="$emit('cancel')">
            HỦY BỎ
          </button>
          <button type="submit" class="btn btn-primary shadow px-5 py-2 font-weight-bold text-uppercase">
            <i class="fas fa-check-circle mr-1"></i>
            {{ customer._id ? 'Xác nhận cập nhật' : 'Xác nhận tạo hệ thống' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import CustomerService from "@/services/customer.service"; //

export default {
  props: ["customerData"],
  data() {
    return {
      customer: { 
        fullName: "", email: "", username: "", phone: "", password: "",
        gender: "Nam", status: "active", customerCode: "" 
      },
      nextCodeForAdd: "KH---" // Hiển thị mã dự kiến (ví dụ KH004)
    };
  },
  computed: {
    // Logic Header hiển thị mã KH
    displayCode() {
      if (this.customer._id) return this.customer.customerCode;
      return this.nextCodeForAdd;
    },
    formattedBirthday: {
      get() {
        if (!this.customer.birthday) return "";
        return new Date(this.customer.birthday).toISOString().split('T')[0];
      },
      set(val) { this.customer.birthday = val; }
    }
  },
// Thay thế đoạn watch cũ trong CustomerForm.vue
watch: {
  customerData: {
    handler(newData) {
      // 1. Kiểm tra ID linh hoạt (thử cả _id và id)
      const cid = newData?._id || newData?.id;
      
      if (newData && cid) {
        // CHẾ ĐỘ SỬA: Ép ID vào biến _id để giao diện nhận diện đúng
        this.customer = { ...newData, _id: cid }; 
      } else {
        // CHẾ ĐỘ THÊM: Reset và đi lấy mã tiếp theo (KH007 chẳng hạn)
        this.resetForm();
        this.fetchNextCode(); 
      }
    },
    immediate: true
  }
},
  methods: {
    // Lấy mã KH tiếp theo từ backend
    async fetchNextCode() {
      try {
        const response = await CustomerService.getNextCode();
        this.nextCodeForAdd = response.nextCode;
      } catch (error) {
        console.error("Không lấy được mã khách hàng tiếp theo:", error);
      }
    },
    resetForm() {
      this.customer = { 
        fullName: "", email: "", username: "", phone: "", password: "",
        gender: "Nam", status: "active", customerCode: "" 
      };
    },
    submitForm() {
      const formData = new FormData();
      if (this.customer._id) formData.append("_id", this.customer._id);
      
      formData.append("username", this.customer.username || "");
      
      // BỔ SUNG: Chỉ gửi password khi thêm mới
      if (!this.customer._id && this.customer.password) {
          formData.append("password", this.customer.password);
      }

      formData.append("fullName", this.customer.fullName || "");
      formData.append("email", this.customer.email || "");
      formData.append("phone", this.customer.phone || "");
      formData.append("gender", this.customer.gender || "Nam");
      formData.append("birthday", this.customer.birthday || "");
      formData.append("status", this.customer.status || "active");

      this.$emit("save", formData); // Phát sự kiện về CustomerPage xử lý
    }
  }
};
</script>

<style scoped>
/* Chỉnh font chữ label cho chuyên nghiệp */
label {
  font-size: 0.9rem;
  margin-bottom: 0.4rem;
}
.italic {
  font-style: italic;
}
.border-right {
  border-right: 1px solid #dee2e6 !important;
}
</style>