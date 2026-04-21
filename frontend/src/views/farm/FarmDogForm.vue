<template>
  <div class="farm-dog-form-page">
    <div class="form-shell">
      <div class="form-card">
        <div class="form-header">
          <div class="header-left">
            <router-link to="/farm/dashboard" class="back-btn">
              <i class="fas fa-arrow-left"></i>
              <span>Trở về</span>
            </router-link>

            <div>
              <h2 class="form-title">Cung cấp hồ sơ chó</h2>
              <p class="form-subtitle">
                Trang trại cung cấp hồ sơ ban đầu của chó, admin sẽ kiểm duyệt và chốt giá bán chính thức trên hệ thống.
              </p>
            </div>
          </div>

          <div class="status-badge">
            <i class="fas fa-shield-alt"></i>
            <span>Chờ kiểm duyệt</span>
          </div>
        </div>

        <form class="form-body" @submit.prevent="submitDogProfile">
          <div class="main-layout">
            <div class="main-left">
              <!-- Thông tin cơ bản -->
              <div class="section-card">
                <div class="section-title">
                  <span class="section-dot"></span>
                  Thông tin cơ bản
                </div>

                <div class="form-grid">
                  <div class="field">
                    <label>Mã nhận diện tại trại <span>*</span></label>
                    <input
                      v-model.trim="dogLocal.farmDogCode"
                      type="text"
                      class="form-control"
                      placeholder="Ví dụ: TRAI01-CHO03"
                      required
                    />
                  </div>

                  <div class="field">
                    <label>Tên chó <span>*</span></label>
                    <input
                      v-model.trim="dogLocal.name"
                      type="text"
                      class="form-control"
                      placeholder="Ví dụ: Bé LuLu"
                      required
                    />
                  </div>

                  <div class="field">
                    <label>Giống chó <span>*</span></label>
                    <select v-model="dogLocal.breedId" class="form-control" required>
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

                  <div class="field">
                    <label>Giới tính <span>*</span></label>
                    <select v-model="dogLocal.gender" class="form-control" required>
                      <option value="Đực">Đực</option>
                      <option value="Cái">Cái</option>
                    </select>
                  </div>

                  <div class="field">
                    <label>Ngày sinh <span>*</span></label>
                    <input
                      v-model="dogLocal.birthDate"
                      type="date"
                      class="form-control"
                      :max="today"
                      required
                    />
                  </div>

                  <div class="field">
                    <label>Màu lông <span>*</span></label>
                    <input
                      v-model.trim="dogLocal.coatColor"
                      type="text"
                      class="form-control"
                      placeholder="Ví dụ: Vàng trắng"
                      required
                    />
                  </div>

                  <div class="field">
                    <label>Cân nặng (kg) <span>*</span></label>
                    <input
                      v-model="dogLocal.weight"
                      type="number"
                      step="0.1"
                      min="0"
                      class="form-control"
                      placeholder="Ví dụ: 2.5"
                      required
                    />
                  </div>

                  <div class="field">
                    <label>Khu vực cung cấp <span>*</span></label>
                    <input
                      v-model.trim="dogLocal.birthPlace"
                      type="text"
                      class="form-control"
                      placeholder="Ví dụ: Cần Thơ"
                      required
                    />
                  </div>
                </div>
              </div>

              <!-- Nguồn gốc và mô tả -->
              <div class="section-card">
                <div class="section-title">
                  <span class="section-dot"></span>
                  Nguồn gốc và mô tả
                </div>

                <div class="form-grid">
                  <div class="field">
                    <label>Tên chó bố</label>
                    <input
                      v-model.trim="dogLocal.fatherName"
                      type="text"
                      class="form-control"
                      placeholder="Nhập tên chó bố"
                    />
                  </div>

                  <div class="field">
                    <label>Tên chó mẹ</label>
                    <input
                      v-model.trim="dogLocal.motherName"
                      type="text"
                      class="form-control"
                      placeholder="Nhập tên chó mẹ"
                    />
                  </div>

                  <div class="field field-full">
                    <label>Mô tả đặc điểm</label>
                    <textarea
                      v-model.trim="dogLocal.description"
                      class="form-control textarea"
                      rows="4"
                      placeholder="Mô tả ngoại hình, tính cách, thói quen, điểm nổi bật của bé chó..."
                    ></textarea>
                  </div>
                </div>
              </div>

              <!-- Thông tin sức khỏe ban đầu -->
              <div class="section-card">
                <div class="section-title">
                  <span class="section-dot"></span>
                  Thông tin sức khỏe ban đầu
                </div>

                <div class="form-grid">
                  <div class="field">
                    <label>Tình trạng sức khỏe <span>*</span></label>
                    <select v-model="dogLocal.healthStatus" class="form-control" required>
                      <option value="Rất tốt">Rất tốt</option>
                      <option value="Tốt">Tốt</option>
                      <option value="Đang theo dõi">Đang theo dõi</option>
                    </select>
                  </div>

                  <div class="field">
                    <label>Ngày tẩy giun gần nhất</label>
                    <input
                      v-model="dogLocal.lastDeworming"
                      type="date"
                      class="form-control"
                      :max="today"
                    />
                  </div>

                  <div class="field field-full">
                    <div class="vaccine-head">
                      <label class="mb-0">Vaccine đã tiêm</label>
                      <button type="button" class="btn-add-outline" @click="addVaccineRow">
                        <i class="fas fa-plus"></i>
                        <span>Thêm vaccine</span>
                      </button>
                    </div>

                    <div v-if="dogLocal.vaccines.length" class="vaccine-list">
                      <div
                        v-for="(item, index) in dogLocal.vaccines"
                        :key="`vaccine-${index}`"
                        class="vaccine-row"
                      >
                        <div class="vaccine-grid">
                          <div class="field">
                            <label>Tên vaccine</label>
                            <select v-model="item.vaccineId" class="form-control">
                              <option value="">-- Chọn vaccine --</option>
                              <option
                                v-for="vaccine in vaccinesMaster"
                                :key="vaccine._id || vaccine.id"
                                :value="vaccine._id || vaccine.id"
                              >
                                {{ vaccine.name }}
                              </option>
                            </select>
                          </div>

                          <div class="field">
                            <label>Ngày tiêm</label>
                            <input
                              v-model="item.dateInjected"
                              type="date"
                              class="form-control"
                              :max="today"
                            />
                          </div>
                        </div>

                        <div class="vaccine-row-actions">
                          <button
                            type="button"
                            class="btn-remove-vaccine"
                            @click="removeVaccineRow(index)"
                          >
                            <i class="fas fa-trash-alt"></i>
                            <span>Xóa</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <p v-else class="empty-state">Chưa có vaccine nào được thêm.</p>
                  </div>
                </div>
              </div>

              <!-- Giá cung cấp -->
              <div class="section-card highlight-card">
                <div class="section-title">
                  <span class="section-dot"></span>
                  Thông tin giá
                </div>

                <div class="form-grid one-col">
                  <div class="field">
                    <label>Giá cung cấp từ trang trại (VNĐ) <span>*</span></label>
                    <input
                      v-model="dogLocal.proposedPrice"
                      type="number"
                      min="1"
                      class="form-control price-input"
                      placeholder="Ví dụ: 5000000"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="main-right">
              <!-- Ảnh đại diện -->
              <div class="section-card sticky-card image-card">
                <div class="section-title">
                  <span class="section-dot"></span>
                  Ảnh đại diện
                </div>

                <div class="image-box">
                  <img
                    v-if="previewImage"
                    :src="previewImage"
                    alt="Preview"
                    class="preview-image"
                  />
                  <div v-else class="image-placeholder">
                    <i class="fas fa-image"></i>
                    <p>Chọn ảnh rõ mặt và toàn thân của bé chó</p>
                  </div>
                </div>

                <label class="upload-btn">
                  <input
                    type="file"
                    accept="image/*"
                    @change="handleFileUpload"
                    hidden
                  />
                  <i class="fas fa-upload"></i>
                  <span>{{ selectedFileName || "Tải ảnh lên" }}</span>
                </label>

                <div class="side-note">
                  Ảnh là bắt buộc để admin kiểm duyệt hồ sơ.
                </div>
              </div>

              <!-- Lưu ý -->
              <div class="section-card note-card">
                <div class="section-title">
                  <span class="section-dot"></span>
                  Lưu ý
                </div>
                <ul class="note-list">
                  <li>Hồ sơ sau khi gửi sẽ chuyển sang trạng thái <strong>Chờ duyệt</strong>.</li>
                  <li>Admin có thể yêu cầu bổ sung, từ chối hoặc duyệt mở bán.</li>
                  <li>Trang trại nhập giá cung cấp, admin sẽ kiểm duyệt và chốt giá bán chính thức cho khách hàng.</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="submit-bar">
            <router-link to="/farm/dashboard" class="btn-cancel">
              Hủy bỏ
            </router-link>

            <button type="submit" class="btn-submit" :disabled="isSubmitting">
              <i class="fas fa-paper-plane"></i>
              <span>{{ isSubmitting ? "Đang xử lý..." : "Gửi hồ sơ" }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import BreedService from "@/services/breed.service";
import DogService from "@/services/dog.service";
import VaccineService from "@/services/vaccine.service";

export default {
  name: "FarmDogForm",

  data() {
    return {
      dogLocal: {
        farmDogCode: "",
        name: "",
        breedId: "",
        gender: "Đực",
        birthDate: "",
        coatColor: "",
        weight: "",
        birthPlace: "",
        fatherName: "",
        motherName: "",
        description: "",
        healthStatus: "Tốt",
        lastDeworming: "",
        vaccines: [],
        proposedPrice: "",
        farmId: "",
      },
      breeds: [],
      vaccinesMaster: [],
      currentUser: null,
      currentFarm: null,
      selectedFile: null,
      selectedFileName: "",
      previewImage: null,
      isSubmitting: false,
      today: new Date().toISOString().split("T")[0],
    };
  },

  async created() {
    this.loadCurrentFarm();

    try {
      const [breedData, vaccineData] = await Promise.all([
        BreedService.getAll(),
        VaccineService.getAll(),
      ]);

      this.breeds = Array.isArray(breedData) ? breedData : [];
      this.vaccinesMaster = Array.isArray(vaccineData)
        ? vaccineData.filter((item) => item?.status === "Hoạt động")
        : [];
    } catch (error) {
      alert("Không thể tải danh sách giống chó hoặc vaccine.");
    }
  },

  methods: {
    getEmptyVaccine() {
      return {
        vaccineId: "",
        vaccineName: "",
        dateInjected: "",
      };
    },

    addVaccineRow() {
      this.dogLocal.vaccines.push(this.getEmptyVaccine());
    },

    removeVaccineRow(index) {
      this.dogLocal.vaccines.splice(index, 1);
    },

    normalizeVaccinesForSubmit(vaccines = []) {
      if (!Array.isArray(vaccines)) return [];

      return vaccines
        .map((item) => {
          const vaccineMaster = this.vaccinesMaster.find(
            (v) => String(v._id || v.id) === String(item?.vaccineId || "")
          );

          return {
            vaccineId: item?.vaccineId || null,
            vaccineName: String(item?.vaccineName || vaccineMaster?.name || "").trim(),
            dateInjected: item?.dateInjected || null,
          };
        })
        .filter((item) => item.vaccineId || item.vaccineName || item.dateInjected);
    },

    loadCurrentFarm() {
      const farmData = localStorage.getItem("farm");
      const userData = localStorage.getItem("user");

      this.currentFarm = farmData ? JSON.parse(farmData) : null;
      this.currentUser = userData ? JSON.parse(userData) : null;

      const farmId =
        this.currentFarm?.farmId ||
        this.currentFarm?._id ||
        this.currentFarm?.id ||
        this.currentUser?.farmId ||
        "";

      this.dogLocal.farmId = farmId;

      if (!farmId) {
        alert("Không tìm thấy thông tin trang trại. Vui lòng đăng nhập lại.");
        this.$router.push("/login");
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

    validateForm() {
      if (!this.dogLocal.farmId) {
        alert("Tài khoản của bạn chưa được liên kết với trang trại.");
        return false;
      }

      if (!this.selectedFile) {
        alert("Vui lòng chọn ảnh đại diện cho bé chó.");
        return false;
      }

      if (!this.dogLocal.farmDogCode?.trim()) {
        alert("Vui lòng nhập mã nhận diện tại trại.");
        return false;
      }

      if (!this.dogLocal.name?.trim()) {
        alert("Vui lòng nhập tên chó.");
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

      if (!this.dogLocal.coatColor?.trim()) {
        alert("Vui lòng nhập màu lông.");
        return false;
      }

      if (Number(this.dogLocal.weight) < 0 || this.dogLocal.weight === "") {
        alert("Cân nặng không hợp lệ.");
        return false;
      }

      if (!this.dogLocal.birthPlace?.trim()) {
        alert("Vui lòng nhập khu vực cung cấp.");
        return false;
      }

      if (!this.dogLocal.healthStatus?.trim()) {
        alert("Vui lòng chọn tình trạng sức khỏe.");
        return false;
      }

      if (this.dogLocal.lastDeworming && this.dogLocal.lastDeworming > this.today) {
        alert("Ngày tẩy giun không được lớn hơn hôm nay.");
        return false;
      }

      if (
        this.dogLocal.lastDeworming &&
        this.dogLocal.birthDate &&
        this.dogLocal.lastDeworming < this.dogLocal.birthDate
      ) {
        alert("Ngày tẩy giun không được nhỏ hơn ngày sinh.");
        return false;
      }

      const normalizedVaccines = this.normalizeVaccinesForSubmit(this.dogLocal.vaccines);

      for (const vaccine of normalizedVaccines) {
        if (!vaccine.vaccineId && !vaccine.vaccineName) {
          alert("Vui lòng chọn tên vaccine.");
          return false;
        }

        if (!vaccine.dateInjected) {
          alert("Vui lòng chọn ngày tiêm cho vaccine.");
          return false;
        }

        if (vaccine.dateInjected > this.today) {
          alert("Ngày tiêm vaccine không được lớn hơn hôm nay.");
          return false;
        }

        if (this.dogLocal.birthDate && vaccine.dateInjected < this.dogLocal.birthDate) {
          alert("Ngày tiêm vaccine không được nhỏ hơn ngày sinh.");
          return false;
        }
      }

      if (Number(this.dogLocal.proposedPrice) <= 0) {
        alert("Giá cung cấp phải lớn hơn 0.");
        return false;
      }

      return true;
    },

    resetForm() {
      this.dogLocal = {
        farmDogCode: "",
        name: "",
        breedId: "",
        gender: "Đực",
        birthDate: "",
        coatColor: "",
        weight: "",
        birthPlace: "",
        fatherName: "",
        motherName: "",
        description: "",
        healthStatus: "Tốt",
        lastDeworming: "",
        vaccines: [],
        proposedPrice: "",
        farmId:
          this.currentFarm?.farmId ||
          this.currentFarm?._id ||
          this.currentFarm?.id ||
          this.currentUser?.farmId ||
          "",
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
          this.currentUser?.farmId ||
          this.dogLocal.farmId;

        const formData = new FormData();
        formData.append("farmDogCode", this.dogLocal.farmDogCode.trim());
        formData.append("name", this.dogLocal.name.trim());
        formData.append("breedId", this.dogLocal.breedId);
        formData.append("gender", this.dogLocal.gender);
        formData.append("birthDate", this.dogLocal.birthDate);
        formData.append("coatColor", this.dogLocal.coatColor.trim());
        formData.append("weight", this.dogLocal.weight);
        formData.append("birthPlace", this.dogLocal.birthPlace.trim());
        formData.append("fatherName", this.dogLocal.fatherName || "");
        formData.append("motherName", this.dogLocal.motherName || "");
        formData.append("description", this.dogLocal.description || "");
        formData.append("healthStatus", this.dogLocal.healthStatus);
        formData.append("lastDeworming", this.dogLocal.lastDeworming || "");
        formData.append("proposedPrice", this.dogLocal.proposedPrice);
        formData.append("farmId", realFarmId);
        formData.append("image", this.selectedFile);
        formData.append(
          "vaccines",
          JSON.stringify(this.normalizeVaccinesForSubmit(this.dogLocal.vaccines))
        );

        await DogService.create(formData);

        alert("🎉 Đã gửi hồ sơ chó thành công! Hồ sơ đang chờ admin duyệt.");
        this.resetForm();
        this.$router.push("/farm/dashboard");
      } catch (error) {
        alert("❌ Lỗi khi gửi hồ sơ: " + (error.response?.data?.message || error.message));
      } finally {
        this.isSubmitting = false;
      }
    },
  },
};
</script>

<style scoped>
.farm-dog-form-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(34, 197, 94, 0.12), transparent 28%),
    linear-gradient(180deg, #f7fbf8 0%, #edf5ef 100%);
  padding: 28px 14px;
}

.form-shell {
  max-width: 1240px;
  margin: 0 auto;
}

.form-card {
  background: #ffffff;
  border-radius: 28px;
  overflow: hidden;
  box-shadow: 0 20px 55px rgba(15, 23, 42, 0.08);
  border: 1px solid #e7efe9;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 18px;
  flex-wrap: wrap;
  padding: 28px 30px;
  background: linear-gradient(135deg, #16a34a, #15803d);
  color: #fff;
}

.header-left {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
  text-decoration: none;
  font-weight: 700;
  transition: all 0.2s ease;
}

.back-btn:hover {
  color: #fff;
  text-decoration: none;
  background: rgba(255, 255, 255, 0.24);
  transform: translateY(-1px);
}

.form-title {
  margin: 0 0 6px;
  font-size: 1.65rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.form-subtitle {
  margin: 0;
  color: rgba(255, 255, 255, 0.92);
  max-width: 720px;
  line-height: 1.55;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 999px;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(6px);
}

.form-body {
  background: #fff;
}

.main-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.9fr) minmax(320px, 0.95fr);
  gap: 0;
}

.main-left {
  padding: 26px;
  border-right: 1px solid #edf2ee;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.main-right {
  padding: 26px;
  background: linear-gradient(180deg, #fbfdfb 0%, #f6faf7 100%);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-card {
  background: #fff;
  border: 1px solid #e5eee7;
  border-radius: 22px;
  padding: 22px;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.035);
}

.highlight-card {
  background: linear-gradient(180deg, #fcfefc 0%, #f4fbf6 100%);
  border-color: #dceede;
}

.image-card {
  background: linear-gradient(180deg, #ffffff 0%, #f8fcf9 100%);
}

.sticky-card {
  position: sticky;
  top: 18px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eef4ef;
  font-weight: 800;
  color: #15803d;
  font-size: 1.02rem;
}

.section-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  flex-shrink: 0;
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.12);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.form-grid.one-col {
  grid-template-columns: 1fr;
}

.field {
  display: flex;
  flex-direction: column;
}

.field-full {
  grid-column: 1 / -1;
}

.field label {
  font-weight: 700;
  color: #334155;
  margin-bottom: 8px;
  font-size: 0.95rem;
}

.field label span {
  color: #dc2626;
}

.form-control {
  min-height: 48px;
  border-radius: 15px;
  border: 1px solid #dbe7dd;
  box-shadow: none;
  padding: 11px 14px;
  transition: all 0.2s ease;
  background: #fff;
}

.form-control:hover {
  border-color: #bfd6c4;
}

.form-control:focus {
  border-color: #16a34a;
  box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.12);
}

.textarea {
  min-height: 120px;
  resize: vertical;
  padding-top: 12px;
}

.price-input {
  font-weight: 800;
  color: #dc2626;
  font-size: 1.05rem;
}

.empty-state {
  margin: 12px 0 0;
  color: #6b7280;
  background: #f8faf8;
  border: 1px dashed #d7e6da;
  border-radius: 14px;
  padding: 12px 14px;
}

.image-box {
  height: 330px;
  border-radius: 20px;
  border: 1px dashed #cfe3d4;
  background: linear-gradient(180deg, #f9fcfa, #eff7f1);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  text-align: center;
  color: #8b9590;
  padding: 20px;
}

.image-placeholder i {
  font-size: 3.2rem;
  margin-bottom: 12px;
  opacity: 0.35;
}

.image-placeholder p {
  margin: 0;
  line-height: 1.5;
}

.upload-btn {
  margin-top: 16px;
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 48px;
  border-radius: 15px;
  background: linear-gradient(135deg, #16a34a, #15803d);
  color: #fff;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 12px 22px rgba(21, 128, 61, 0.15);
}

.upload-btn:hover {
  opacity: 0.96;
  transform: translateY(-1px);
}

.side-note {
  margin-top: 14px;
  color: #6b7280;
  font-size: 0.93rem;
  line-height: 1.55;
}

.note-card {
  background: #ffffff;
}

.note-list {
  margin: 0;
  padding-left: 18px;
  color: #475569;
}

.note-list li + li {
  margin-top: 8px;
}

.submit-bar {
  display: flex;
  justify-content: center;
  gap: 14px;
  flex-wrap: wrap;
  padding: 24px 26px 28px;
  border-top: 1px solid #edf2ee;
  background: #fff;
}

.btn-cancel,
.btn-submit {
  min-width: 190px;
  min-height: 50px;
  border-radius: 15px;
  padding: 12px 24px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-decoration: none;
  border: none;
  transition: all 0.2s ease;
}

.btn-cancel {
  background: #fff;
  color: #475569;
  border: 1px solid #d8e2dc;
}

.btn-cancel:hover {
  text-decoration: none;
  color: #334155;
  background: #f8faf9;
  transform: translateY(-1px);
}

.btn-submit {
  color: #fff;
  background: linear-gradient(135deg, #16a34a, #15803d);
  box-shadow: 0 12px 24px rgba(21, 128, 61, 0.16);
}

.btn-submit:hover {
  transform: translateY(-1px);
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.vaccine-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.btn-add-outline {
  border: 1px solid #cfe7d6;
  background: #effaf2;
  color: #15803d;
  border-radius: 12px;
  min-height: 42px;
  padding: 0 14px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-add-outline:hover {
  background: #e7f7ec;
}

.vaccine-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.vaccine-row {
  border: 1px solid #dcecdf;
  background: #fbfefc;
  border-radius: 16px;
  padding: 14px;
}

.vaccine-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(180px, 0.8fr);
  gap: 14px;
}

.vaccine-row-actions {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}

.btn-remove-vaccine {
  border: 1px solid #f1c9c9;
  background: #fff5f5;
  color: #b91c1c;
  border-radius: 12px;
  min-height: 38px;
  padding: 0 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-remove-vaccine:hover {
  background: #feecec;
}

@media (max-width: 991.98px) {
  .main-layout {
    grid-template-columns: 1fr;
  }

  .main-left {
    border-right: none;
    border-bottom: 1px solid #edf2ee;
  }

  .sticky-card {
    position: static;
  }
}

@media (max-width: 767.98px) {
  .form-header,
  .main-left,
  .main-right,
  .submit-bar {
    padding-left: 16px;
    padding-right: 16px;
  }

  .form-grid,
  .vaccine-grid {
    grid-template-columns: 1fr;
  }

  .image-box {
    height: 260px;
  }

  .btn-cancel,
  .btn-submit {
    width: 100%;
  }

  .header-left {
    flex-direction: column;
  }
}
</style>