<template>
  <div class="farm-dog-form-page">
    <div class="form-shell">
      <div class="card border-0 shadow-lg form-popup-card">
        <div class="card-header form-header">
          <div class="d-flex justify-content-between align-items-start flex-wrap">
            <div class="d-flex align-items-start">
              <router-link
                to="/farm/dashboard"
                class="btn btn-sm btn-light text-success mr-3 back-btn"
              >
                <i class="fas fa-arrow-left mr-1"></i> Trở về
              </router-link>

              <div>
                <h4 class="mb-1 font-weight-bold">
                  <i class="fas fa-paw mr-2"></i>GỬI HỒ SƠ CHÓ CHO HỆ THỐNG
                </h4>
                <div class="header-subtitle">
                  Trang trại cung cấp hồ sơ ban đầu, admin sẽ kiểm duyệt và chốt bán chính thức trên hệ thống
                </div>
              </div>
            </div>

            <div class="status-chip mt-2 mt-lg-0">
              <i class="fas fa-shield-alt mr-2"></i>Chờ kiểm duyệt
            </div>
          </div>
        </div>

        <div class="card-body form-body">
          <form @submit.prevent="submitDogProfile">
            <div class="row no-gutters">
              <div class="col-lg-8 form-left">
                <div class="content-scroll">
                  <div class="section-card">
                    <div class="section-title">
                      <span class="section-dot"></span>
                      Thông tin cơ bản
                    </div>

                    <div class="form-grid two-col">
                      <div class="form-item full">
                        <label class="form-label">
                          Tên bé chó <span class="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          class="form-control form-control-uniform"
                          v-model.trim="dogLocal.name"
                          placeholder="Ví dụ: Bé LuLu"
                          required
                        />
                      </div>

                      <div class="form-item">
                        <label class="form-label">
                          Giống chó <span class="text-danger">*</span>
                        </label>
                        <select
                          class="form-control form-control-uniform"
                          v-model="dogLocal.breedId"
                          required
                        >
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

                      <div class="form-item">
                        <label class="form-label">
                          Giới tính <span class="text-danger">*</span>
                        </label>
                        <select
                          class="form-control form-control-uniform"
                          v-model="dogLocal.gender"
                          required
                        >
                          <option value="Đực">Đực</option>
                          <option value="Cái">Cái</option>
                        </select>
                      </div>

                      <div class="form-item">
                        <label class="form-label">
                          Ngày sinh <span class="text-danger">*</span>
                        </label>
                        <input
                          type="date"
                          class="form-control form-control-uniform"
                          v-model="dogLocal.birthDate"
                          :max="today"
                          required
                        />
                      </div>

                      <div class="form-item">
                        <label class="form-label">
                          Cân nặng (kg) <span class="text-danger">*</span>
                        </label>
                        <div class="input-group">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            class="form-control form-control-uniform"
                            v-model="dogLocal.weight"
                            placeholder="2.5"
                            required
                          />
                          <div class="input-group-append">
                            <span class="input-group-text unit-box">kg</span>
                          </div>
                        </div>
                      </div>

                      <div class="form-item">
                        <label class="form-label">
                          Tình trạng sức khỏe <span class="text-danger">*</span>
                        </label>
                        <select
                          class="form-control form-control-uniform"
                          v-model="dogLocal.healthStatus"
                          required
                        >
                          <option value="Rất tốt">Rất tốt</option>
                          <option value="Tốt">Tốt</option>
                          <option value="Đang theo dõi">Đang theo dõi</option>
                        </select>
                      </div>

                      <div class="form-item">
                        <label class="form-label">Ngày tẩy giun gần nhất</label>
                        <input
                          type="date"
                          class="form-control form-control-uniform"
                          v-model="dogLocal.lastDeworming"
                          :max="today"
                        />
                      </div>

                      <div class="form-item">
                        <label class="form-label">
                          Giá đề xuất từ trang trại (VNĐ) <span class="text-danger">*</span>
                        </label>
                        <input
                          type="number"
                          class="form-control form-control-uniform price-input"
                          v-model="dogLocal.proposedPrice"
                          placeholder="Ví dụ: 5000000"
                          min="1"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div class="section-card">
                    <div class="section-title">
                      <span class="section-dot"></span>
                      Thông tin mô tả
                    </div>

                    <div class="form-grid one-col">
                      <div class="form-item">
                        <label class="form-label">Mô tả bé chó</label>
                        <textarea
                          class="form-control form-control-uniform textarea-uniform"
                          v-model.trim="dogLocal.description"
                          rows="3"
                          placeholder="Tính cách, đặc điểm nổi bật, thói quen..."
                        ></textarea>
                      </div>

                      <div class="form-item">
                        <label class="form-label">Ghi chú nguồn gốc</label>
                        <textarea
                          class="form-control form-control-uniform textarea-uniform"
                          v-model.trim="dogLocal.sourceNotes"
                          rows="3"
                          placeholder="Ví dụ: sinh tại trại, có thông tin bố mẹ, giấy tờ kèm theo..."
                        ></textarea>
                      </div>

                      <div class="form-item">
                        <label class="form-label">Ghi chú sức khỏe</label>
                        <textarea
                          class="form-control form-control-uniform textarea-uniform"
                          v-model.trim="dogLocal.healthNote"
                          rows="3"
                          placeholder="Ví dụ: ăn uống tốt, cần theo dõi nhẹ, lưu ý chăm sóc..."
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  <div class="section-card">
                    <div class="d-flex justify-content-between align-items-center flex-wrap mb-3">
                      <div class="section-title mb-0">
                        <span class="section-dot"></span>
                        Vaccine ban đầu
                      </div>

                      <button
                        type="button"
                        class="btn btn-sm btn-vaccine-add"
                        @click="addVaccineRow"
                      >
                        <i class="fas fa-plus mr-1"></i> Thêm vaccine
                      </button>
                    </div>

                    <div v-if="dogLocal.vaccines.length">
                      <div
                        v-for="(vaccine, index) in dogLocal.vaccines"
                        :key="`vaccine-${index}`"
                        class="vaccine-card"
                      >
                        <div class="vaccine-header">
                          <strong class="text-success">
                            <i class="fas fa-syringe mr-2"></i>Mũi vaccine {{ index + 1 }}
                          </strong>
                          <button
                            type="button"
                            class="btn btn-sm btn-outline-danger"
                            @click="removeVaccineRow(index)"
                          >
                            <i class="fas fa-trash"></i>
                          </button>
                        </div>

                        <div class="form-grid two-col">
                          <div class="form-item">
                            <label class="form-label">Tên vaccine</label>
                            <select v-model="vaccine.vaccineId" class="form-control form-control-uniform">
                              <option value="">-- Chọn vaccine do admin tạo --</option>
                              <option
                                v-for="item in vaccinesMaster"
                                :key="item._id || item.id"
                                :value="item._id || item.id"
                              >
                                {{ item.name }}
                              </option>
                            </select>
                          </div>

                          <div class="form-item">
                            <label class="form-label">Ngày tiêm</label>
                            <input
                              type="date"
                              class="form-control form-control-uniform"
                              v-model="vaccine.dateInjected"
                              :max="today"
                            />
                          </div>

                          <div class="form-item">
                            <label class="form-label d-block">Nhắc lại</label>
                            <div class="reminder-switch-box">
                              <div class="custom-control custom-switch">
                                <input
                                  :id="`needsReminder-${index}`"
                                  v-model="vaccine.needsReminder"
                                  type="checkbox"
                                  class="custom-control-input"
                                />
                                <label
                                  class="custom-control-label"
                                  :for="`needsReminder-${index}`"
                                >
                                  Cần nhắc lại
                                </label>
                              </div>
                            </div>
                          </div>

                          <div class="form-item">
                            <label class="form-label">Ngày nhắc lại</label>
                            <input
                              type="date"
                              class="form-control form-control-uniform"
                              v-model="vaccine.nextDueDate"
                              :disabled="!vaccine.needsReminder"
                            />
                          </div>

                          <div class="form-item full">
                            <label class="form-label">Ghi chú vaccine</label>
                            <textarea
                              class="form-control form-control-uniform textarea-uniform"
                              rows="2"
                              v-model.trim="vaccine.note"
                              placeholder="Ví dụ: bé phản ứng tốt sau tiêm..."
                            ></textarea>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div v-else class="empty-vaccine-box">
                      <i class="fas fa-notes-medical mr-2"></i>
                      Chưa thêm vaccine nào. Bạn có thể gửi hồ sơ trước rồi bổ sung sau.
                    </div>
                  </div>

                  <div class="note-box">
                    <div class="note-title">
                      <i class="fas fa-info-circle mr-2"></i>Lưu ý
                    </div>
                    <ul class="mb-0 pl-3 text-muted">
                      <li>Hồ sơ sẽ ở trạng thái <strong>Chờ duyệt</strong> sau khi gửi.</li>
                      <li>Admin sẽ kiểm tra, chốt giá bán chính thức và phản hồi nếu cần bổ sung.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div class="col-lg-4 form-right">
                <div class="side-panel">
                  <div class="section-card right-card">
                    <div class="section-title">
                      <span class="section-dot"></span>
                      Ảnh đại diện hồ sơ
                    </div>

                    <div class="image-preview-box">
                      <img
                        v-if="previewImage"
                        :src="previewImage"
                        alt="Preview"
                        class="preview-image"
                      />
                      <div v-else class="preview-placeholder">
                        <i class="fas fa-image fa-4x mb-3 opacity-25"></i>
                        <p class="small mb-0">Chọn một ảnh rõ ràng của bé chó</p>
                      </div>
                    </div>

                    <div class="custom-file text-left mt-3">
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

                    <div class="image-hint mt-3">
                      Ảnh là bắt buộc để admin kiểm duyệt hồ sơ.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="submit-bar">
              <router-link
                to="/farm/dashboard"
                class="btn btn-outline-secondary submit-btn-secondary"
              >
                HỦY BỎ
              </router-link>

              <button
                type="submit"
                class="btn submit-btn-primary"
                :disabled="isSubmitting"
              >
                <i class="fas fa-paper-plane mr-2"></i>
                {{ isSubmitting ? "ĐANG XỬ LÝ..." : "GỬI HỒ SƠ" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BreedService from "@/services/breed.service";
import DogService from "@/services/dog.service";
import DogHealthRecordService from "@/services/dogHealthRecord.service";
import VaccineService from "@/services/vaccine.service";

export default {
  name: "FarmDogForm",

  data() {
    return {
      dogLocal: {
        name: "",
        breedId: "",
        gender: "Đực",
        proposedPrice: "",
        description: "",
        farmId: "",
        birthDate: "",
        weight: "",
        healthStatus: "Tốt",
        lastDeworming: "",
        sourceNotes: "",
        healthNote: "",
        vaccines: [],
      },
      breeds: [],
      currentUser: null,
      currentFarm: null,
      vaccinesMaster: [],
      selectedFile: null,
      selectedFileName: "",
      previewImage: null,
      isSubmitting: false,
      today: new Date().toISOString().split("T")[0],
    };
  },

  computed: {
    selectedBreedName() {
      const breed = this.breeds.find(
        (item) => String(item.id || item._id) === String(this.dogLocal.breedId || "")
      );
      return breed?.name || "---";
    },
  },

  async created() {
    this.loadCurrentFarm();

    try {
      const [breedData, vaccineData] = await Promise.all([
        BreedService.getAll(),
        VaccineService.getAll(),
      ]);

      this.breeds = Array.isArray(breedData) ? breedData : [];
      this.vaccinesMaster = (Array.isArray(vaccineData) ? vaccineData : []).filter(
        (item) => item?.status === "Hoạt động"
      );
    } catch (error) {
      console.log(error);
      alert("Không thể tải dữ liệu giống chó hoặc vaccine.");
    }
  },

  methods: {
    getEmptyVaccine() {
      return {
        vaccineId: "",
        vaccineName: "",
        dateInjected: "",
        needsReminder: false,
        nextDueDate: "",
        note: "",
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
            vaccineId: String(item?.vaccineId || "").trim(),
            vaccineName: String(item?.vaccineName || vaccineMaster?.name || "").trim(),
            dateInjected: item?.dateInjected || null,
            needsReminder: !!item?.needsReminder,
            nextDueDate: item?.needsReminder ? (item?.nextDueDate || null) : null,
            note: String(item?.note || "").trim(),
          };
        })
        .filter((item) => (item.vaccineId || item.vaccineName) && item.dateInjected);
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

      if (Number(this.dogLocal.proposedPrice) <= 0) {
        alert("Giá đề xuất phải lớn hơn 0.");
        return false;
      }

      if (Number(this.dogLocal.weight) < 0) {
        alert("Cân nặng không hợp lệ.");
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
        if (vaccine.dateInjected > this.today) {
          alert("Ngày tiêm vaccine không được lớn hơn hôm nay.");
          return false;
        }

        if (this.dogLocal.birthDate && vaccine.dateInjected < this.dogLocal.birthDate) {
          alert("Ngày tiêm vaccine không được nhỏ hơn ngày sinh.");
          return false;
        }

        if (
          vaccine.needsReminder &&
          vaccine.nextDueDate &&
          vaccine.nextDueDate < vaccine.dateInjected
        ) {
          alert("Ngày nhắc lại không được nhỏ hơn ngày tiêm.");
          return false;
        }
      }

      return true;
    },

    resetForm() {
      this.dogLocal = {
        name: "",
        breedId: "",
        gender: "Đực",
        proposedPrice: "",
        description: "",
        farmId:
          this.currentFarm?.farmId ||
          this.currentFarm?._id ||
          this.currentFarm?.id ||
          this.currentUser?.farmId ||
          "",
        birthDate: "",
        weight: "",
        healthStatus: "Tốt",
        lastDeworming: "",
        sourceNotes: "",
        healthNote: "",
        vaccines: [],
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
        formData.append("name", this.dogLocal.name.trim());
        formData.append("breedId", this.dogLocal.breedId);
        formData.append("gender", this.dogLocal.gender);
        formData.append("proposedPrice", this.dogLocal.proposedPrice);
        formData.append("description", this.dogLocal.description || "");
        formData.append("farmId", realFarmId);
        formData.append("image", this.selectedFile);
        formData.append("birthDate", this.dogLocal.birthDate);
        formData.append("weight", this.dogLocal.weight);
        formData.append("healthStatus", this.dogLocal.healthStatus);
        formData.append("lastDeworming", this.dogLocal.lastDeworming || "");
        formData.append("sourceNotes", this.dogLocal.sourceNotes || "");
        formData.append("healthNote", this.dogLocal.healthNote || "");

        const createdResponse = await DogService.create(formData);
        const newestDog = createdResponse?.dog || createdResponse || null;
        const normalizedVaccines = this.normalizeVaccinesForSubmit(this.dogLocal.vaccines);

        if (newestDog) {
          await DogHealthRecordService.create({
            dogId: newestDog._id || newestDog.id,
            farmId: realFarmId,
            checkedBy: "Chủ trại cung cấp ban đầu",
            checkedAt: new Date().toISOString(),
            weight: Number(this.dogLocal.weight),
            bodyTemperature: null,
            generalCondition: this.dogLocal.healthStatus || "",
            appetiteStatus: "",
            digestiveStatus: "",
            respiratoryStatus: "",
            skinCondition: "",
            mobilityStatus: "",
            dewormed: !!this.dogLocal.lastDeworming,
            lastDewormingDate: this.dogLocal.lastDeworming || null,
            abnormalSigns: "",
            medicalNotes: this.dogLocal.healthNote || "",
            recommendation: "",
            vaccines: normalizedVaccines,
          });
        }

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
  background: linear-gradient(180deg, #f5f8f6 0%, #eef4f0 100%);
  padding: 24px 12px;
}

.form-shell {
  max-width: 1220px;
  margin: 0 auto;
}

.form-popup-card {
  border-radius: 26px;
  overflow: hidden;
}

.form-header {
  background: linear-gradient(135deg, #1ea65a, #148a49);
  color: #fff;
  border-bottom: none;
  padding: 22px 26px;
}

.header-subtitle {
  color: rgba(255, 255, 255, 0.88);
  font-size: 0.95rem;
  line-height: 1.5;
}

.status-chip {
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 999px;
  padding: 8px 14px;
  font-weight: 700;
  font-size: 0.9rem;
}

.back-btn {
  font-weight: 700;
  border-radius: 10px;
}

.form-body {
  padding: 0;
}

.form-left,
.form-right {
  background: #fff;
}

.form-left {
  border-right: 1px solid #edf2ee;
}

.content-scroll {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.side-panel {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.section-card {
  background: #fff;
  border: 1px solid #e8f0ea;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 10px 24px rgba(20, 138, 73, 0.04);
}

.right-card {
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.04);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1rem;
  font-weight: 800;
  color: #15803d;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid #edf4ef;
}

.section-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #1ea65a;
  display: inline-block;
}

.form-grid {
  display: grid;
  gap: 16px;
}

.form-grid.two-col {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.form-grid.one-col {
  grid-template-columns: 1fr;
}

.form-item.full {
  grid-column: 1 / -1;
}

.form-label {
  font-weight: 700;
  color: #334155;
  margin-bottom: 8px;
  display: block;
}

.form-control-uniform {
  min-height: 46px;
  border-radius: 14px;
  border: 1px solid #dce7df;
  box-shadow: none;
}

.form-control-uniform:focus {
  border-color: #1ea65a;
  box-shadow: 0 0 0 3px rgba(30, 166, 90, 0.12);
}

.textarea-uniform {
  min-height: 110px;
  resize: vertical;
  padding-top: 12px;
}

.unit-box {
  border-radius: 0 14px 14px 0;
  border-color: #dce7df;
  background: #f3f7f4;
}

.price-input {
  font-weight: 700;
  color: #dc2626;
}

.btn-vaccine-add {
  background: #eaf8ef;
  color: #15803d;
  border: 1px solid #cae9d4;
  border-radius: 10px;
  font-weight: 700;
}

.btn-vaccine-add:hover {
  background: #dff4e7;
  color: #126c33;
}

.vaccine-card {
  border: 1px solid #e5eee7;
  background: #fbfefc;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 14px;
}

.vaccine-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.reminder-switch-box {
  min-height: 46px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  border: 1px solid #dce7df;
  border-radius: 14px;
  background: #fff;
}

.empty-vaccine-box {
  padding: 16px;
  border-radius: 14px;
  background: #f8faf8;
  color: #6b7280;
  border: 1px dashed #d6e5da;
}

.note-box {
  background: #f8fcf9;
  border: 1px solid #dcefe1;
  border-radius: 18px;
  padding: 16px 18px;
}

.note-title {
  font-weight: 800;
  color: #15803d;
  margin-bottom: 10px;
}

.image-preview-box {
  height: 320px;
  border-radius: 20px;
  border: 1px dashed #cfe3d4;
  background: linear-gradient(180deg, #f8fbf9, #f1f7f3);
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

.preview-placeholder {
  text-align: center;
  color: #8a9391;
  padding: 20px;
}

.custom-file-label {
  border-radius: 12px;
  min-height: 46px;
  display: flex;
  align-items: center;
  border-color: #dce7df;
}

.custom-file-label::after {
  content: "Chọn ảnh" !important;
  background-color: #28a745;
  color: white;
  border-radius: 0 12px 12px 0;
}

.image-hint {
  color: #6b7280;
  font-size: 0.92rem;
  line-height: 1.5;
}

.submit-bar {
  padding: 22px 24px 24px;
  border-top: 1px solid #edf2ee;
  background: #fff;
  display: flex;
  justify-content: center;
  gap: 14px;
  flex-wrap: wrap;
}

.submit-btn-primary {
  min-width: 220px;
  border-radius: 12px;
  padding: 12px 24px;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(135deg, #17a34a, #15803d);
  border: none;
  box-shadow: 0 10px 24px rgba(21, 128, 61, 0.18);
}

.submit-btn-primary:hover {
  color: #fff;
  opacity: 0.96;
}

.submit-btn-secondary {
  min-width: 180px;
  border-radius: 12px;
  padding: 12px 24px;
  font-weight: 700;
}

@media (max-width: 991.98px) {
  .form-left {
    border-right: none;
    border-bottom: 1px solid #edf2ee;
  }

  .content-scroll,
  .side-panel {
    padding: 18px;
  }

  .form-grid.two-col {
    grid-template-columns: 1fr;
  }

  .image-preview-box {
    height: 280px;
  }
}

@media (max-width: 575.98px) {
  .farm-dog-form-page {
    padding: 10px;
  }

  .form-header {
    padding: 18px;
  }

  .content-scroll,
  .side-panel,
  .submit-bar {
    padding-left: 14px;
    padding-right: 14px;
  }

  .section-card {
    padding: 16px;
    border-radius: 16px;
  }

  .submit-btn-primary,
  .submit-btn-secondary {
    width: 100%;
  }
}
</style>