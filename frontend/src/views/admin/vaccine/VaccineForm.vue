<template>
  <div class="card shadow-sm border-primary mb-4 animate__animated animate__fadeInDown">
    
    <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center py-3">
      <h5 class="mb-0 font-weight-bold text-uppercase" style="font-size: 1.1rem;">
        <i class="fas fa-plus-circle mr-2"></i> 
        {{ isEdit ? 'Cập Nhật Thông Tin Vaccine' : 'Nhập Thông Tin Vaccine' }}
      </h5>
      
      <div class="d-flex align-items-center">
        <span class="badge bg-white text-primary px-3 py-2 font-weight-bold" style="font-size: 0.9rem;">
          Mã vaccine: {{ displayCode }}
        </span>
        
        </div>
    </div>

    <div class="card-body p-4">
      <form @submit.prevent="submitVaccine">
        <div class="row">
          <div class="form-group col-md-6 mb-3">
            <label class="font-weight-bold text-primary"><i class="fas fa-info-circle mr-1"></i> Tên Vaccine <span class="text-danger">*</span></label>
            <input type="text" class="form-control" v-model="formData.name" placeholder="VD: Mũi 5 bệnh Vanguard" required>
          </div>
          <div class="form-group col-md-6 mb-3">
            <label class="font-weight-bold text-primary"><i class="fas fa-toggle-on mr-1"></i> Trạng thái</label>
            <select class="form-control" v-model="formData.status">
              <option value="Hoạt động">Hoạt động</option>
              <option value="Ngừng sử dụng">Ngừng sử dụng</option>
            </select>
          </div>
        </div>
        
        <div class="form-group mb-4">
          <label class="font-weight-bold text-success"><i class="fas fa-file-medical-alt mr-1"></i> Mô tả tác dụng</label>
          <textarea class="form-control" v-model="formData.description" rows="3" placeholder="Ghi chú các loại bệnh phòng được..."></textarea>
        </div>
        
        <div class="text-center border-top pt-4">
          <button type="button" class="btn btn-secondary px-4 mr-2 font-weight-bold" @click="$emit('close')">
             HỦY BỎ
          </button>
          <button type="submit" class="btn btn-primary px-4 font-weight-bold shadow-sm">
            <i class="fas fa-save mr-1"></i> LƯU VACCINE
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import VaccineService from "@/services/vaccine.service";

export default {
  name: "VaccineForm",
  props: {
    vaccine: { type: Object, required: true },
    isEdit: { type: Boolean, required: true },
    allVaccines: { type: Array, required: true } // Nhận danh sách vaccine để tính toán mã
  },
  data() {
    return {
      formData: { name: "", description: "", status: "Hoạt động" }
    };
  },
  computed: {
    // Tự động tính toán mã hiển thị lên góc phải màn hình
    displayCode() {
      // Nếu là Sửa: Trả về mã của vaccine đó
      if (this.isEdit && this.formData.maVaccine) {
        return this.formData.maVaccine;
      }
      
      // Nếu là Thêm Mới: Tự động đoán mã tiếp theo (VC001 -> VC002)
      if (this.allVaccines && this.allVaccines.length > 0) {
        const codes = this.allVaccines
          .map(v => v.maVaccine)
          .filter(c => c && c.startsWith("VC"));
          
        if (codes.length > 0) {
          codes.sort(); 
          const lastCode = codes[codes.length - 1];
          const lastNumber = parseInt(lastCode.replace("VC", ""), 10);
          return "VC" + (lastNumber + 1).toString().padStart(3, "0");
        }
      }
      
      // Nếu Database đang trống hoàn toàn
      return "VC001";
    }
  },
  watch: {
    vaccine: {
      immediate: true,
      handler(newValue) {
        this.formData = { ...newValue };
      }
    }
  },
  methods: {
    async submitVaccine() {
      try {
        if (this.isEdit) {
          await VaccineService.update(this.formData._id, this.formData);
          alert("Cập nhật thành công!");
        } else {
          await VaccineService.create(this.formData);
          alert("Thêm mới thành công!");
        }
        
        this.$emit('close'); 
        
      } catch (error) {
        alert("Lỗi: " + (error.response?.data?.message || error.message));
      }
    }
  }
};
</script>