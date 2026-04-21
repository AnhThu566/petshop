<template>
  <div class="vaccine-form-page bg-light py-3">
    <div class="w-100 px-2">
      <div class="card border-0 shadow-sm">
        <div
          class="card-header bg-primary text-white py-3 d-flex justify-content-between align-items-center flex-wrap"
        >
          <div class="mb-2 mb-md-0">
            <h5 class="mb-1 font-weight-bold text-uppercase form-title">
              <i class="fas fa-syringe mr-2"></i>
              {{ isEdit ? "Cập Nhật Thông Tin Vaccine" : "Nhập Thông Tin Vaccine" }}
            </h5>
            <div class="small text-white-50">
              Quản lý thông tin vaccine, mô tả tác dụng và trạng thái sử dụng.
            </div>
          </div>

          <span class="badge badge-light text-primary shadow-sm code-badge">
            Mã vaccine:
            <strong class="text-danger ml-1">{{ displayCode }}</strong>
          </span>
        </div>

        <div class="card-body p-4 bg-white">
          <form @submit.prevent="submitVaccine">
            <div class="section-card">
              <h6 class="section-title text-primary">
                <i class="fas fa-notes-medical mr-2"></i>
                Thông tin vaccine
              </h6>

              <div class="row">
                <div class="form-group col-md-6 mb-3">
                  <label class="form-label text-primary">
                    <i class="fas fa-info-circle mr-1"></i>
                    Tên Vaccine <span class="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    class="form-control custom-input"
                    v-model="formData.name"
                    placeholder="VD: Mũi 5 bệnh Vanguard"
                    required
                  />
                </div>

                <div class="form-group col-md-6 mb-3">
                  <label class="form-label text-primary">
                    <i class="fas fa-toggle-on mr-1"></i>
                    Trạng thái
                  </label>
                  <select class="form-control custom-input" v-model="formData.status">
                    <option value="Hoạt động">Hoạt động</option>
                    <option value="Ngừng sử dụng">Ngừng sử dụng</option>
                  </select>
                </div>
              </div>

              <div class="form-group mb-0">
                <label class="form-label text-success">
                  <i class="fas fa-file-medical-alt mr-1"></i>
                  Mô tả tác dụng
                </label>
                <textarea
                  class="form-control custom-input textarea-success"
                  v-model="formData.description"
                  rows="4"
                  placeholder="Ghi chú các loại bệnh phòng được..."
                ></textarea>
              </div>
            </div>

            <div class="text-center border-top pt-4 mt-4">
              <button
                type="button"
                class="btn btn-secondary px-4 py-2 mr-2 font-weight-bold shadow-sm"
                @click="$emit('close')"
              >
                HỦY BỎ
              </button>

              <button
                type="submit"
                class="btn btn-primary px-4 py-2 font-weight-bold shadow-sm"
              >
                <i class="fas fa-save mr-1"></i> LƯU VACCINE
              </button>
            </div>
          </form>
        </div>
      </div>
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
    allVaccines: { type: Array, required: true },
  },

  data() {
    return {
      formData: {
        name: "",
        description: "",
        status: "Hoạt động",
      },
    };
  },

  computed: {
    displayCode() {
      if (this.isEdit && this.formData.maVaccine) {
        return this.formData.maVaccine;
      }

      if (this.allVaccines && this.allVaccines.length > 0) {
        const codes = this.allVaccines
          .map((v) => v.maVaccine)
          .filter((c) => c && c.startsWith("VC"));

        if (codes.length > 0) {
          codes.sort();
          const lastCode = codes[codes.length - 1];
          const lastNumber = parseInt(lastCode.replace("VC", ""), 10);
          return "VC" + (lastNumber + 1).toString().padStart(3, "0");
        }
      }

      return "VC001";
    },
  },

  watch: {
    vaccine: {
      immediate: true,
      handler(newValue) {
        this.formData = { ...newValue };
      },
    },
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

        this.$emit("close");
      } catch (error) {
        alert("Lỗi: " + (error.response?.data?.message || error.message));
      }
    },
  },
};
</script>

<style scoped>
.vaccine-form-page {
  min-height: 100%;
}

.form-title {
  font-size: 1.05rem;
}

.code-badge {
  font-size: 0.9rem;
  border-radius: 999px;
  padding: 8px 14px;
}

.section-card {
  border: 1px solid #e9ecef;
  border-radius: 14px;
  padding: 20px;
  background: #fff;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.04);
}

.section-title {
  font-weight: 800;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eef2f6;
}

.form-label {
  font-size: 0.92rem;
  font-weight: 700;
  color: #334155;
  margin-bottom: 0.45rem;
}

.custom-input {
  min-height: 44px;
  border-radius: 10px;
  border: 1px solid #ced4da;
  font-size: 0.95rem;
  box-shadow: none;
}

.custom-input:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.12);
}

.textarea-success {
  min-height: 120px;
  resize: none;
  background-color: #f9fff9;
  border-color: #9dd9b8;
}

@media (max-width: 991.98px) {
  .section-card {
    padding: 16px;
  }

  .form-title {
    font-size: 1rem;
  }
}
</style>