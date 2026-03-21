<template>
  <div class="card shadow-sm border-0 animate__animated animate__fadeIn">
    <div class="card-header bg-success text-white py-3 d-flex align-items-center">
      <router-link to="/farm/dashboard" class="btn btn-sm btn-light text-success mr-3">
        <i class="fas fa-arrow-left"></i> Trở về
      </router-link>
      <h5 class="mb-0 font-weight-bold">
        <i class="fas fa-paw mr-2"></i> ĐĂNG HỒ SƠ THÚ CƯNG MỚI
      </h5>
    </div>

    <div class="card-body p-4 p-md-5">
      <form @submit.prevent="submitDogProfile">
        <div class="row">
          <div class="col-md-7 border-right pr-md-4">
            <h6 class="text-success font-weight-bold border-bottom pb-2 mb-4">
              Thông tin chi tiết
            </h6>

            <div class="form-group mb-3">
              <label class="font-weight-bold">
                Tên bé chó <span class="text-danger">*</span>
              </label>
              <input
                type="text"
                class="form-control"
                v-model.trim="dogLocal.name"
                placeholder="VD: Bé LuLu đáng yêu"
                required
              />
            </div>

            <div class="row mb-3">
              <div class="col-md-6 form-group">
                <label class="font-weight-bold">
                  Giống chó <span class="text-danger">*</span>
                </label>
                <select class="form-control" v-model="dogLocal.breedId" required>
                  <option value="" disabled>-- Chọn giống chó --</option>
                  <option
                    v-for="breed in breeds"
                    :key="breed.id || breed._id"
                    :value="breed.id || breed._id"
                  >
                    {{ breed.name }}
                  </option>
                </select>
              </div>

              <div class="col-md-6 form-group">
                <label class="font-weight-bold">
                  Giới tính <span class="text-danger">*</span>
                </label>
                <select class="form-control" v-model="dogLocal.gender" required>
                  <option value="Đực">Đực</option>
                  <option value="Cái">Cái</option>
                </select>
              </div>

              <div class="col-md-4 form-group">
                <label class="font-weight-bold">
                  Ngày sinh <span class="text-danger">*</span>
                </label>
                <input
                  type="date"
                  class="form-control"
                  v-model="dogLocal.birthDate"
                  :max="today"
                  required
                />
              </div>
            </div>

            <div class="row mb-3">
              <div class="col-md-6 form-group">
                <label class="font-weight-bold">
                  Cân nặng (kg) <span class="text-danger">*</span>
                </label>
                <div class="input-group">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    class="form-control"
                    v-model="dogLocal.weight"
                    placeholder="VD: 2.5"
                    required
                  />
                  <div class="input-group-append">
                    <span class="input-group-text">kg</span>
                  </div>
                </div>
              </div>

              <div class="col-md-6 form-group">
                <label class="font-weight-bold">
                  Tình trạng sức khỏe <span class="text-danger">*</span>
                </label>
                <select class="form-control" v-model="dogLocal.healthStatus" required>
                  <option value="Rất tốt">Rất tốt (Năng động)</option>
                  <option value="Tốt">Tốt (Bình thường)</option>
                  <option value="Đang theo dõi">Đang theo dõi</option>
                </select>
              </div>
            </div>

            <div class="row mb-3">
              <div class="col-md-6 form-group">
                <label class="font-weight-bold">
                  Giá bán (VNĐ) <span class="text-danger">*</span>
                </label>
                <input
                  type="number"
                  class="form-control"
                  v-model="dogLocal.price"
                  placeholder="VD: 5000000"
                  min="0"
                  required
                />
              </div>

              <div class="col-md-6 form-group">
                <label class="font-weight-bold">Ngày sổ giun gần nhất</label>
                <input
                  type="date"
                  class="form-control"
                  v-model="dogLocal.lastDeworming"
                  :max="today"
                />
              </div>
            </div>

            <div class="form-group mb-3">
              <label class="font-weight-bold">Mô tả thêm</label>
              <textarea
                class="form-control"
                v-model.trim="dogLocal.description"
                rows="3"
                placeholder="Tính cách, sở thích của bé..."
              ></textarea>
            </div>
          </div>

          <div class="col-md-5 pl-md-4 text-center">
            <h6 class="text-success font-weight-bold border-bottom pb-2 mb-4">
              Hình ảnh đại diện <span class="text-danger">*</span>
            </h6>

            <div class="form-group text-center">
              <div
                class="border rounded mb-3 d-flex align-items-center justify-content-center bg-light shadow-sm"
                style="height: 250px; overflow: hidden;"
              >
                <img
                  v-if="previewImage"
                  :src="previewImage"
                  alt="Preview"
                  style="object-fit: cover; width: 100%; height: 100%;"
                />
                <div v-else class="text-muted">
                  <i class="fas fa-image fa-4x mb-2 opacity-25"></i>
                  <p class="small">Chọn một bức ảnh thật đẹp nhé!</p>
                </div>
              </div>

              <div class="custom-file text-left">
                <input
                  type="file"
                  class="custom-file-input"
                  id="dogImage"
                  @change="handleFileUpload"
                  accept="image/*"
                />
                <label class="custom-file-label text-truncate" for="dogImage">
                  {{ selectedFileName || "Tải ảnh bé chó lên..." }}
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="card border-success mt-4 shadow-sm animate__animated animate__fadeInUp">
          <div class="card-header bg-light d-flex justify-content-between align-items-center py-2">
            <h6 class="mb-0 font-weight-bold text-success">
              <i class="fas fa-file-medical mr-2"></i> LỊCH SỬ TIÊM VACCINE
            </h6>
            <button
              type="button"
              class="btn btn-sm btn-success font-weight-bold"
              @click="addVaccineRow"
            >
              <i class="fas fa-plus mr-1"></i> THÊM MŨI TIÊM
            </button>
          </div>

          <div class="card-body p-3">
            <div
              v-for="(item, index) in dogLocal.healthRecord"
              :key="index"
              class="row mb-3 align-items-end border-bottom pb-3"
            >
              <div class="col-md-4">
                <label class="small font-weight-bold">Loại Vaccine</label>
                <select class="form-control form-control-sm" v-model="item.vaccineId">
                  <option value="">-- Chọn Vaccine --</option>
                  <option
                    v-for="vc in activeVaccines"
                    :key="vc._id || vc.id"
                    :value="vc._id || vc.id"
                  >
                    {{ vc.name }}
                  </option>
                </select>
              </div>

              <div class="col-md-3">
                <label class="small font-weight-bold">Ngày tiêm</label>
                <input
                  type="date"
                  class="form-control form-control-sm"
                  v-model="item.dateInjected"
                  :max="today"
                />
              </div>

              <div class="col-md-4">
                <label class="small font-weight-bold">Ghi chú</label>
                <input
                  type="text"
                  class="form-control form-control-sm"
                  v-model.trim="item.note"
                  placeholder="VD: Tiêm tại trạm thú y"
                />
              </div>

              <div class="col-md-1">
                <button
                  type="button"
                  class="btn btn-sm btn-outline-danger border-0"
                  @click="removeVaccineRow(index)"
                >
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>

            <div
              v-if="dogLocal.healthRecord.length === 0"
              class="text-center py-3 text-muted small italic"
            >
              Chưa cập nhật dữ liệu tiêm chủng cho bé chó này.
            </div>
          </div>
        </div>

        <div class="text-center mt-4 border-top pt-4">
          <router-link to="/farm/dashboard" class="btn btn-outline-secondary px-5 mr-3 font-weight-bold">
            HỦY BỎ
          </router-link>

          <button
            type="submit"
            class="btn btn-success px-5 font-weight-bold shadow-sm"
            :disabled="isSubmitting"
          >
            <i class="fas fa-paper-plane mr-2"></i>
            {{ isSubmitting ? "ĐANG XỬ LÝ..." : "GỬI ĐĂNG BÁN" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import BreedService from "@/services/breed.service";
import DogService from "@/services/dog.service";
import VaccineService from "@/services/vaccine.service";
import createApiClient from "@/services/api.service";

export default {
  data() {
    return {
      dogLocal: {
        name: "",
        breedId: "",
        gender: "Đực",
        price: "",
        description: "",
        farmId: "",
        birthDate: "",
        weight: "",
        healthStatus: "Tốt",
        lastDeworming: "",
        healthRecord: [],
      },
      breeds: [],
      vaccineList: [],
      currentUser: null,
      currentFarm: null,
      selectedFile: null,
      selectedFileName: "",
      previewImage: null,
      isSubmitting: false,
      today: new Date().toISOString().split("T")[0],
    };
  },

  computed: {
    activeVaccines() {
      return this.vaccineList.filter((item) => item.status === "Hoạt động" || !item.status);
    },
  },

  async created() {
    await this.loadCurrentFarm();

    try {
      this.breeds = await BreedService.getAll();
      this.vaccineList = await VaccineService.getAll();
    } catch (error) {
      console.log(error);
      alert("Không thể tải dữ liệu giống chó hoặc vaccine.");
    }
  },

  methods: {
    async loadCurrentFarm() {
      const farmData = localStorage.getItem("farm");
      const userData = localStorage.getItem("user");

      if (farmData) {
        this.currentFarm = JSON.parse(farmData);

        // Ưu tiên farmId vì localStorage("farm") hiện có thể là tài khoản farm
        this.dogLocal.farmId =
          this.currentFarm.farmId ||
          this.currentFarm._id ||
          this.currentFarm.id ||
          "";

        return;
      }

      if (userData) {
        this.currentUser = JSON.parse(userData);
        await this.fetchMyFarmId();
        return;
      }

      alert("Vui lòng đăng nhập tài khoản trang trại.");
      this.$router.push("/login");
    },

    addVaccineRow() {
      this.dogLocal.healthRecord.push({
        vaccineId: "",
        dateInjected: "",
        note: "",
      });
    },

    removeVaccineRow(index) {
      this.dogLocal.healthRecord.splice(index, 1);
    },

    async fetchMyFarmId() {
      try {
        const api = createApiClient("/api/farms");
        const response = await api.get("/");
        const farms = response.data;
        const currentUserId = this.currentUser?._id || this.currentUser?.id;

        const myFarm = farms.find((f) => {
          const ownerId = f.ownerId?._id || f.ownerId?.id || f.ownerId;
          return ownerId === currentUserId;
        });

        if (myFarm) {
          this.currentFarm = myFarm;
          this.dogLocal.farmId = myFarm._id || myFarm.id;
        }
      } catch (error) {
        console.log("Lỗi tìm trại:", error);
      }
    },

    handleFileUpload(event) {
      const file = event.target.files[0];

      if (!file) return;

      if (!file.type.startsWith("image/")) {
        alert("Vui lòng chọn đúng file hình ảnh.");
        event.target.value = "";
        return;
      }

      this.selectedFile = file;
      this.selectedFileName = file.name;
      this.previewImage = URL.createObjectURL(file);
    },

    validateHealthRecord() {
      for (let i = 0; i < this.dogLocal.healthRecord.length; i++) {
        const item = this.dogLocal.healthRecord[i];

        const hasAnyValue = item.vaccineId || item.dateInjected || item.note;

        if (!hasAnyValue) continue;

        if (!item.vaccineId) {
          alert(`Dòng vaccine thứ ${i + 1}: vui lòng chọn loại vaccine.`);
          return false;
        }

        if (!item.dateInjected) {
          alert(`Dòng vaccine thứ ${i + 1}: vui lòng chọn ngày tiêm.`);
          return false;
        }

        if (item.dateInjected > this.today) {
          alert(`Dòng vaccine thứ ${i + 1}: ngày tiêm không được lớn hơn hôm nay.`);
          return false;
        }
      }

      return true;
    },

    validateForm() {
      if (!this.dogLocal.farmId) {
        alert("Lỗi: Tài khoản của bạn chưa được liên kết với trang trại nào.");
        return false;
      }

      if (!this.selectedFile) {
        alert("Vui lòng chọn hình ảnh cho bé chó.");
        return false;
      }

      if (!this.dogLocal.name?.trim()) {
        alert("Vui lòng nhập tên bé chó.");
        return false;
      }

      if (!this.dogLocal.breedId) {
        alert("Vui lòng chọn giống chó.");
        return false;
      }

      if (!this.dogLocal.birthDate) {
        alert("Vui lòng chọn ngày sinh.");
        return false;
      }

      if (this.dogLocal.birthDate > this.today) {
        alert("Ngày sinh không được lớn hơn hôm nay.");
        return false;
      }

      if (Number(this.dogLocal.price) < 0) {
        alert("Giá bán không hợp lệ.");
        return false;
      }

      if (Number(this.dogLocal.weight) < 0) {
        alert("Cân nặng không hợp lệ.");
        return false;
      }

      if (this.dogLocal.lastDeworming && this.dogLocal.lastDeworming > this.today) {
        alert("Ngày sổ giun không được lớn hơn hôm nay.");
        return false;
      }

      if (!this.validateHealthRecord()) {
        return false;
      }

      return true;
    },

    buildCleanHealthRecord() {
      return this.dogLocal.healthRecord
        .filter((item) => item.vaccineId && item.dateInjected)
        .map((item) => ({
          vaccineId: item.vaccineId,
          dateInjected: item.dateInjected,
          note: item.note || "",
        }));
    },

    resetForm() {
      this.dogLocal = {
        name: "",
        breedId: "",
        gender: "Đực",
        price: "",
        description: "",
        farmId:
          this.currentFarm?.farmId ||
          this.currentFarm?._id ||
          this.currentFarm?.id ||
          "",
        birthDate: "",
        weight: "",
        healthStatus: "Tốt",
        lastDeworming: "",
        healthRecord: [],
      };

      this.selectedFile = null;
      this.selectedFileName = "";
      this.previewImage = null;
    },

    async submitDogProfile() {
      if (!this.validateForm()) return;

      this.isSubmitting = true;

      try {
        const realFarmId =
          this.currentFarm?.farmId ||
          this.currentFarm?._id ||
          this.currentFarm?.id ||
          this.dogLocal.farmId;

        const formData = new FormData();
        formData.append("name", this.dogLocal.name.trim());
        formData.append("breedId", this.dogLocal.breedId);
        formData.append("gender", this.dogLocal.gender);
        formData.append("price", this.dogLocal.price);
        formData.append("description", this.dogLocal.description || "");
        formData.append("farmId", realFarmId);
        formData.append("image", this.selectedFile);
        formData.append("birthDate", this.dogLocal.birthDate);
        formData.append("weight", this.dogLocal.weight);
        formData.append("healthStatus", this.dogLocal.healthStatus);
        formData.append("lastDeworming", this.dogLocal.lastDeworming || "");
        formData.append("healthRecord", JSON.stringify(this.buildCleanHealthRecord()));

        await DogService.create(formData);

        alert("🎉 Đã gửi hồ sơ thú cưng thành công! Hồ sơ đang chờ Admin phê duyệt.");
        this.resetForm();
        this.$router.push("/farm/dashboard");
      } catch (error) {
        alert("❌ Lỗi khi đăng: " + (error.response?.data?.message || error.message));
      } finally {
        this.isSubmitting = false;
      }
    },
  },
};
</script>

<style scoped>
.custom-file-label::after {
  content: "Chọn ảnh" !important;
  background-color: #28a745;
  color: white;
}

.form-control {
  border-radius: 8px;
}
</style>