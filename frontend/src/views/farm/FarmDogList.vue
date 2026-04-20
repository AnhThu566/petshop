<template>
  <div class="farm-dogs-page">
    <div class="page-shell">
      <div class="page-header">
        <div>
          <h3 class="page-title">
            <i class="fas fa-dog text-success mr-2"></i>
            Hồ sơ chó đã cung cấp
          </h3>
          <p class="page-subtitle mb-0">
            Theo dõi tình trạng hồ sơ, phản hồi duyệt và cập nhật thông tin khi cần.
          </p>
        </div>

        <div class="header-actions">
          <button class="btn btn-outline-success btn-sm" @click="loadPageData" :disabled="loading">
            <i class="fas fa-sync-alt mr-1"></i> Làm mới
          </button>
          <router-link to="/farm/add-dog" class="btn btn-success btn-sm">
            <i class="fas fa-plus mr-1"></i> Cung cấp hồ sơ chó
          </router-link>
        </div>
      </div>

      <div class="filter-card">
        <div class="row align-items-center">
          <div class="col-lg-4 mb-2 mb-lg-0">
            <div class="input-group input-group-sm">
              <div class="input-group-prepend">
                <span class="input-group-text bg-white border-right-0">
                  <i class="fas fa-search text-success"></i>
                </span>
              </div>
              <input
                type="text"
                class="form-control border-left-0"
                placeholder="Tìm tên chó hoặc mã tại trại..."
                v-model.trim="searchText"
              />
            </div>
          </div>

          <div class="col-lg-4 mb-2 mb-lg-0">
            <select class="form-control form-control-sm" v-model="approvalFilter">
              <option value="Tất cả">Tất cả duyệt hồ sơ chó</option>
              <option value="Chờ duyệt">Chờ duyệt</option>
              <option value="Cần bổ sung">Cần bổ sung</option>
              <option value="Đã duyệt">Đã duyệt</option>
              <option value="Từ chối">Từ chối</option>
            </select>
          </div>

          <div class="col-lg-4">
            <select class="form-control form-control-sm" v-model="saleFilter">
              <option value="Tất cả">Tất cả trạng thái bán</option>
              <option value="Chưa mở bán">Chưa mở bán</option>
              <option value="Sẵn sàng bán">Sẵn sàng bán</option>
              <option value="Chờ thanh toán">Chờ thanh toán</option>
              <option value="Đã đặt cọc">Đã đặt cọc</option>
              <option value="Đang giao">Đang giao</option>
              <option value="Đã bán">Đã bán</option>
              <option value="Ngừng bán">Ngừng bán</option>
            </select>
          </div>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Chờ duyệt</div>
          <div class="stat-value text-warning">{{ stats.pending }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Cần bổ sung</div>
          <div class="stat-value text-danger">{{ stats.needFix }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Đã duyệt</div>
          <div class="stat-value text-success">{{ stats.approved }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Đã bán</div>
          <div class="stat-value text-dark">{{ stats.sold }}</div>
        </div>
      </div>

      <div v-if="loading" class="content-card">
        <div class="empty-box">
          <i class="fas fa-spinner fa-spin fa-3x mb-3 d-block"></i>
          Đang tải hồ sơ chó...
        </div>
      </div>

      <div v-else-if="filteredDogs.length > 0" class="content-card">
        <div class="table-responsive">
          <table class="table table-hover align-middle text-center mb-0 dashboard-table">
            <thead>
              <tr>
                <th class="action-col">Thao tác</th>
                <th class="image-col">Ảnh</th>
                <th class="code-col">Mã tại trại</th>
                <th class="name-col">Tên</th>
                <th class="breed-col">Giống</th>
                <th class="price-col">Giá đề xuất</th>
                <th class="approval-col">Duyệt hồ sơ</th>
                <th class="sale-col">Trạng thái bán</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="dog in filteredDogs" :key="dog._id || dog.id">
                <td class="action-col">
                  <div class="action-buttons-wrap">
                    <button
                      class="action-btn action-btn-view"
                      @click="openDetailModal(dog)"
                      title="Xem chi tiết"
                    >
                      <i class="fas fa-eye"></i>
                    </button>

                    <button
                      class="action-btn action-btn-edit"
                      @click="openManageModal(dog)"
                      :disabled="isLockedDog(dog)"
                      title="Chỉnh sửa hồ sơ"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                  </div>

                  <div v-if="isLockedDog(dog)" class="small text-danger mt-2 text-left px-2">
                    <i class="fas fa-lock mr-1"></i>{{ getLockReason(dog) }}
                  </div>
                </td>

                <td class="image-col">
                  <img :src="getDogImage(dog)" alt="dog" class="dog-thumb" />
                </td>

                <td class="font-weight-bold text-primary code-col">
                  {{ dog.farmDogCode || "---" }}
                </td>

                <td class="font-weight-bold text-dark name-col">
                  {{ dog.name || "---" }}
                </td>

                <td class="breed-col">
                  {{ dog.breedId?.name || "---" }}
                </td>

                <td class="text-danger font-weight-bold price-col">
                  {{ formatCurrency(dog.proposedPrice) }}
                </td>

                <td class="approval-col">
                  <span class="badge px-3 py-2" :class="getApprovalStatusClass(dog.approvalStatus)">
                    {{ dog.approvalStatus }}
                  </span>

                  <div
                    v-if="['Cần bổ sung', 'Từ chối'].includes(dog.approvalStatus) && dog.rejectionReason"
                    class="small text-danger mt-2 text-left px-2"
                  >
                    <strong>Phản hồi:</strong> {{ dog.rejectionReason }}
                  </div>
                </td>

                <td class="sale-col">
                  <span class="badge px-3 py-2" :class="getSaleStatusClass(dog.saleStatus)">
                    {{ dog.saleStatus || "---" }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-else class="content-card">
        <div class="empty-box">
          <i class="fas fa-dog fa-3x mb-3 d-block"></i>
          Không có hồ sơ chó nào phù hợp.
        </div>
      </div>

      <!-- POPUP CHI TIẾT -->
      <div
        v-if="selectedDog"
        class="modal fade show d-block farm-modal-backdrop"
        tabindex="-1"
      >
        <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
          <div class="modal-content border-0 shadow farm-modal-content">
            <div class="modal-header farm-modal-header">
              <h5 class="modal-title mb-0">
                <i class="fas fa-eye mr-2"></i>Chi tiết hồ sơ chó
              </h5>
              <button type="button" class="farm-modal-close" @click="closeDetailModal">
                <span>&times;</span>
              </button>
            </div>

            <div class="modal-body p-3 p-md-4">
              <div class="detail-layout">
                <div class="detail-left">
                  <img
                    :src="getDogImage(selectedDog)"
                    class="detail-image"
                    alt="dog"
                  />
                </div>

                <div class="detail-right">
                  <div class="detail-grid compact-grid">
                    <div class="detail-item">
                      <label>Mã tại trại</label>
                      <div>{{ selectedDog.farmDogCode || "---" }}</div>
                    </div>

                    <div class="detail-item">
                      <label>Tên chó</label>
                      <div>{{ selectedDog.name || "---" }}</div>
                    </div>

                    <div class="detail-item">
                      <label>Giống</label>
                      <div>{{ selectedDog.breedId?.name || "---" }}</div>
                    </div>

                    <div class="detail-item">
                      <label>Giới tính</label>
                      <div>{{ selectedDog.gender || "---" }}</div>
                    </div>

                    <div class="detail-item">
                      <label>Ngày sinh</label>
                      <div>{{ formatDateOnly(selectedDog.birthDate) }}</div>
                    </div>

                    <div class="detail-item">
                      <label>Màu lông</label>
                      <div>{{ selectedDog.coatColor || "---" }}</div>
                    </div>

                    <div class="detail-item">
                      <label>Cân nặng</label>
                      <div>{{ selectedDog.weight ? selectedDog.weight + " kg" : "---" }}</div>
                    </div>

                    <div class="detail-item">
                      <label>Nơi sinh</label>
                      <div>{{ selectedDog.birthPlace || "---" }}</div>
                    </div>

                    <div class="detail-item">
                      <label>Tên chó bố</label>
                      <div>{{ selectedDog.fatherName || "---" }}</div>
                    </div>

                    <div class="detail-item">
                      <label>Tên chó mẹ</label>
                      <div>{{ selectedDog.motherName || "---" }}</div>
                    </div>

                    <div class="detail-item">
                      <label>Tình trạng sức khỏe</label>
                      <div>{{ selectedDog.healthStatus || "---" }}</div>
                    </div>

                    <div class="detail-item">
                      <label>Ngày tẩy giun</label>
                      <div>{{ formatDateOnly(selectedDog.lastDeworming) }}</div>
                    </div>

                    <div class="detail-item">
                      <label>Giá đề xuất</label>
                      <div>{{ formatCurrency(selectedDog.proposedPrice) }}</div>
                    </div>

                    <div class="detail-item">
                      <label>Phản hồi admin</label>
                      <div>
                        {{
                          ["Cần bổ sung", "Từ chối"].includes(selectedDog.approvalStatus)
                            ? (selectedDog.rejectionReason || "---")
                            : "Không có"
                        }}
                      </div>
                    </div>
                  </div>

                  <div class="detail-block mt-3">
                    <label>Mô tả</label>
                    <div class="detail-text">{{ selectedDog.description || "---" }}</div>
                  </div>

                  <div class="detail-block mt-3">
                    <label>Vaccine đã tiêm</label>
                    <ul v-if="selectedDog.vaccines?.length" class="pl-3 mb-0">
                      <li
                        v-for="(vaccine, index) in selectedDog.vaccines"
                        :key="`dog-vaccine-${index}`"
                        class="mb-1"
                      >
                        {{ vaccine.vaccineName || getVaccineName(vaccine.vaccineId) || "---" }}
                        - {{ formatDateOnly(vaccine.dateInjected) }}
                      </li>
                    </ul>
                    <div v-else class="detail-text">Chưa có vaccine nào.</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-footer farm-modal-footer">
              <button class="btn btn-outline-secondary px-4 btn-sm" @click="closeDetailModal">
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- POPUP CHỈNH SỬA -->
      <div
        v-if="manageDog"
        class="modal fade show d-block farm-modal-backdrop"
        tabindex="-1"
      >
        <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
          <div class="modal-content border-0 shadow farm-modal-content">
            <div class="modal-header farm-modal-header">
              <h5 class="modal-title mb-0">
                <i class="fas fa-edit mr-2"></i>Chỉnh sửa hồ sơ chó
              </h5>
              <button type="button" class="farm-modal-close" @click="closeManageModal">
                <span>&times;</span>
              </button>
            </div>

            <div class="modal-body p-3 p-md-4">
              <div class="alert alert-warning soft-alert py-2 px-3 mb-3">
                Khi chỉnh sửa, hồ sơ sẽ quay về trạng thái <strong>Chờ duyệt</strong>.
              </div>

              <div
                v-if="manageDog.currentFeedback"
                class="alert alert-danger soft-alert py-2 px-3 mb-3"
              >
                <strong>Phản hồi admin:</strong> {{ manageDog.currentFeedback }}
              </div>

              <div class="popup-section">
                <div class="popup-section-title">Thông tin chó</div>

                <div class="popup-grid">
                  <div class="popup-field">
                    <label class="popup-label">Mã nhận diện tại trại</label>
                    <input type="text" class="form-control popup-input" v-model="manageDog.farmDogCode" />
                  </div>

                  <div class="popup-field">
                    <label class="popup-label">Tên chó</label>
                    <input type="text" class="form-control popup-input" v-model="manageDog.name" />
                  </div>

                  <div class="popup-field">
                    <label class="popup-label">Giống chó</label>
                    <select class="form-control popup-input" v-model="manageDog.breedId">
                      <option value="">-- Chọn giống --</option>
                      <option
                        v-for="breed in breeds"
                        :key="breed._id || breed.id"
                        :value="breed._id || breed.id"
                      >
                        {{ breed.name }}
                      </option>
                    </select>
                  </div>

                  <div class="popup-field">
                    <label class="popup-label">Giới tính</label>
                    <select class="form-control popup-input" v-model="manageDog.gender">
                      <option value="Đực">Đực</option>
                      <option value="Cái">Cái</option>
                    </select>
                  </div>

                  <div class="popup-field">
                    <label class="popup-label">Ngày sinh</label>
                    <input type="date" class="form-control popup-input" v-model="manageDog.birthDate" />
                  </div>

                  <div class="popup-field">
                    <label class="popup-label">Màu lông</label>
                    <input type="text" class="form-control popup-input" v-model="manageDog.coatColor" />
                  </div>

                  <div class="popup-field">
                    <label class="popup-label">Cân nặng (kg)</label>
                    <input type="number" step="0.1" class="form-control popup-input" v-model="manageDog.weight" />
                  </div>

                  <div class="popup-field">
                    <label class="popup-label">Nơi sinh ra</label>
                    <input type="text" class="form-control popup-input" v-model="manageDog.birthPlace" />
                  </div>

                  <div class="popup-field">
                    <label class="popup-label">Tên chó bố</label>
                    <input type="text" class="form-control popup-input" v-model="manageDog.fatherName" />
                  </div>

                  <div class="popup-field">
                    <label class="popup-label">Tên chó mẹ</label>
                    <input type="text" class="form-control popup-input" v-model="manageDog.motherName" />
                  </div>

                  <div class="popup-field">
                    <label class="popup-label">Tình trạng sức khỏe</label>
                    <select class="form-control popup-input" v-model="manageDog.healthStatus">
                      <option value="Rất tốt">Rất tốt</option>
                      <option value="Tốt">Tốt</option>
                      <option value="Đang theo dõi">Đang theo dõi</option>
                    </select>
                  </div>

                  <div class="popup-field">
                    <label class="popup-label">Ngày tẩy giun gần nhất</label>
                    <input type="date" class="form-control popup-input" v-model="manageDog.lastDeworming" />
                  </div>

                  <div class="popup-field popup-field-full">
                    <label class="popup-label">Giá đề xuất từ trang trại</label>
                    <input type="number" class="form-control popup-input" v-model="manageDog.proposedPrice" />
                  </div>

                  <div class="popup-field popup-field-full">
                    <label class="popup-label">Mô tả</label>
                    <textarea class="form-control popup-input popup-textarea" rows="3" v-model="manageDog.description"></textarea>
                  </div>
                </div>
              </div>

              <div class="popup-section mt-3">
                <div class="d-flex justify-content-between align-items-center flex-wrap mb-2">
                  <div class="popup-section-title mb-0">Vaccine đã tiêm</div>
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-success"
                    @click="addDogVaccineRow"
                  >
                    <i class="fas fa-plus mr-1"></i> Thêm vaccine
                  </button>
                </div>

                <div v-if="manageDog.vaccines.length">
                  <div
                    v-for="(vaccine, index) in manageDog.vaccines"
                    :key="`dog-vaccine-form-${index}`"
                    class="vaccine-box"
                  >
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <strong class="text-success small">Mũi vaccine {{ index + 1 }}</strong>
                      <button
                        type="button"
                        class="btn btn-sm btn-outline-danger"
                        @click="removeDogVaccineRow(index)"
                      >
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>

                    <div class="popup-grid popup-grid-vaccine">
                      <div class="popup-field">
                        <label class="popup-label">Tên vaccine</label>
                        <select v-model="vaccine.vaccineId" class="form-control popup-input">
                          <option value="">-- Chọn vaccine --</option>
                          <option
                            v-for="item in vaccinesMaster"
                            :key="item._id || item.id"
                            :value="item._id || item.id"
                          >
                            {{ item.name }}
                          </option>
                        </select>
                      </div>

                      <div class="popup-field">
                        <label class="popup-label">Ngày tiêm</label>
                        <input
                          v-model="vaccine.dateInjected"
                          type="date"
                          class="form-control popup-input"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div v-else class="empty-inline">
                  Chưa có vaccine nào được thêm.
                </div>
              </div>
            </div>

            <div class="modal-footer farm-modal-footer">
              <button class="btn btn-outline-secondary px-4 btn-sm" @click="closeManageModal">
                Hủy
              </button>
              <button class="btn btn-success px-4 btn-sm" @click="saveDogInfo">
                Lưu hồ sơ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DogService from "@/services/dog.service";
import BreedService from "@/services/breed.service";
import VaccineService from "@/services/vaccine.service";

export default {
  name: "FarmDogList",

  data() {
    return {
      dogs: [],
      breeds: [],
      vaccinesMaster: [],
      currentFarm: null,
      searchText: "",
      approvalFilter: "Tất cả",
      saleFilter: "Tất cả",
      selectedDog: null,
      manageDog: null,
      loading: false,
    };
  },

  computed: {
    filteredDogs() {
      return this.dogs.filter((dog) => {
        const keyword = (this.searchText || "").toLowerCase().trim();
        const dogName = String(dog.name || "").toLowerCase();
        const farmCode = String(dog.farmDogCode || "").toLowerCase();

        const matchSearch =
          !keyword ||
          dogName.includes(keyword) ||
          farmCode.includes(keyword);

        const matchApproval =
          this.approvalFilter === "Tất cả" ||
          dog.approvalStatus === this.approvalFilter;

        const matchSale =
          this.saleFilter === "Tất cả" ||
          dog.saleStatus === this.saleFilter;

        return matchSearch && matchApproval && matchSale;
      });
    },

    stats() {
      return {
        pending: this.dogs.filter((d) => d.approvalStatus === "Chờ duyệt").length,
        needFix: this.dogs.filter((d) => d.approvalStatus === "Cần bổ sung").length,
        approved: this.dogs.filter((d) => d.approvalStatus === "Đã duyệt").length,
        sold: this.dogs.filter((d) => d.saleStatus === "Đã bán").length,
      };
    },
  },

  methods: {
    getEmptyVaccine() {
      return {
        vaccineId: "",
        vaccineName: "",
        dateInjected: "",
      };
    },

    addDogVaccineRow() {
      this.manageDog.vaccines.push(this.getEmptyVaccine());
    },

    removeDogVaccineRow(index) {
      this.manageDog.vaccines.splice(index, 1);
    },

    normalizeVaccinesForForm(vaccines = []) {
      if (!Array.isArray(vaccines)) return [];

      return vaccines.map((item) => ({
        vaccineId: item?.vaccineId?._id || item?.vaccineId || "",
        vaccineName: item?.vaccineName || "",
        dateInjected: item?.dateInjected ? this.formatDateForInput(item.dateInjected) : "",
      }));
    },

    normalizeVaccinesForSubmit(vaccines = []) {
      if (!Array.isArray(vaccines)) return [];

      return vaccines
        .map((item) => {
          const vaccineMaster = this.vaccinesMaster.find(
            (v) => String(v._id || v.id) === String(item?.vaccineId || "")
          );

          return {
            vaccineId: String(item?.vaccineId || "").trim() || null,
            vaccineName: String(item?.vaccineName || vaccineMaster?.name || "").trim(),
            dateInjected: item?.dateInjected || null,
          };
        })
        .filter((item) => item.vaccineId || item.vaccineName || item.dateInjected);
    },

    async loadPageData() {
      await Promise.all([this.fetchBreeds(), this.fetchVaccines(), this.fetchMyDogs()]);
    },

    async fetchMyDogs() {
      try {
        this.loading = true;
        const data = await DogService.getAll();
        this.dogs = Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Lỗi tải danh sách chó:", error);
        alert(
          "Không thể tải danh sách chó của trang trại: " +
            (error.response?.data?.message || error.message)
        );
      } finally {
        this.loading = false;
      }
    },

    async fetchBreeds() {
      try {
        const data = await BreedService.getAll();
        this.breeds = Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Lỗi tải giống chó:", error);
      }
    },

    async fetchVaccines() {
      try {
        const data = await VaccineService.getAll();
        this.vaccinesMaster = Array.isArray(data)
          ? data.filter((item) => item?.status === "Hoạt động")
          : [];
      } catch (error) {
        console.error("Lỗi tải vaccine:", error);
        this.vaccinesMaster = [];
      }
    },

    getDogImage(dog) {
      const image = dog?.image;
      if (!image) return "https://via.placeholder.com/500x350";
      if (String(image).startsWith("http")) return image;
      return "http://localhost:3000" + image;
    },

    getVaccineName(vaccineId) {
      const item = this.vaccinesMaster.find(
        (v) => String(v._id || v.id) === String(vaccineId || "")
      );
      return item?.name || "";
    },

    formatCurrency(value) {
      if (value === null || value === undefined || value === "") return "---";
      return Number(value).toLocaleString("vi-VN") + " ₫";
    },

    formatDateOnly(date) {
      if (!date) return "---";
      return new Date(date).toLocaleDateString("vi-VN");
    },

    formatDateForInput(date) {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },

    getApprovalStatusClass(status) {
      if (status === "Chờ duyệt") return "badge-warning text-dark";
      if (status === "Cần bổ sung") return "badge-danger";
      if (status === "Đã duyệt") return "badge-success";
      if (status === "Từ chối") return "badge-danger";
      return "badge-light border";
    },

    getSaleStatusClass(status) {
      if (status === "Sẵn sàng bán") return "badge-success";
      if (status === "Chưa mở bán") return "badge-secondary";
      if (status === "Chờ thanh toán") return "badge-info text-dark";
      if (status === "Đã đặt cọc") return "badge-primary";
      if (status === "Đang giao") return "badge-dark";
      if (status === "Đã bán") return "badge-dark";
      if (status === "Ngừng bán") return "badge-danger";
      return "badge-light border";
    },

    isLockedDog(dog) {
      return ["Chờ thanh toán", "Đã đặt cọc", "Đang giao", "Đã bán"].includes(dog.saleStatus);
    },

    getLockReason(dog) {
      if (dog.saleStatus === "Chờ thanh toán") return "Hồ sơ đang trong quá trình xử lý giao dịch, không thể chỉnh sửa.";
      if (dog.saleStatus === "Đã đặt cọc") return "Bé chó đã có khách giữ chỗ, không thể chỉnh sửa.";
      if (dog.saleStatus === "Đang giao") return "Bé chó đang trong quá trình bàn giao, không thể chỉnh sửa.";
      if (dog.saleStatus === "Đã bán") return "Bé chó đã bán, không thể chỉnh sửa.";
      return "";
    },

    openDetailModal(dog) {
      this.selectedDog = JSON.parse(JSON.stringify(dog));
    },

    closeDetailModal() {
      this.selectedDog = null;
    },

    openManageModal(dog) {
      if (this.isLockedDog(dog)) {
        alert(this.getLockReason(dog));
        return;
      }

      this.manageDog = {
        _id: dog._id || dog.id,
        farmDogCode: dog.farmDogCode || "",
        name: dog.name || "",
        proposedPrice: dog.proposedPrice || 0,
        gender: dog.gender || "Đực",
        birthDate: dog.birthDate ? this.formatDateForInput(dog.birthDate) : "",
        coatColor: dog.coatColor || "",
        description: dog.description || "",
        breedId: dog.breedId?._id || dog.breedId?.id || dog.breedId || "",
        weight: dog.weight ?? "",
        birthPlace: dog.birthPlace || "",
        fatherName: dog.fatherName || "",
        motherName: dog.motherName || "",
        healthStatus: dog.healthStatus || "Tốt",
        lastDeworming: dog.lastDeworming ? this.formatDateForInput(dog.lastDeworming) : "",
        vaccines: this.normalizeVaccinesForForm(dog.vaccines || []),
        currentFeedback:
          ["Cần bổ sung", "Từ chối"].includes(dog.approvalStatus)
            ? dog.rejectionReason || ""
            : "",
      };
    },

    closeManageModal() {
      this.manageDog = null;
    },

    async saveDogInfo() {
      if (
        !confirm(
          'Bạn có chắc chắn muốn lưu? Hành động này sẽ đưa hồ sơ về trạng thái "Chờ duyệt" để hệ thống kiểm tra lại.'
        )
      ) {
        return;
      }

      try {
        const formData = new FormData();
        formData.append("farmDogCode", this.manageDog.farmDogCode || "");
        formData.append("name", this.manageDog.name || "");
        formData.append("proposedPrice", this.manageDog.proposedPrice || 0);
        formData.append("gender", this.manageDog.gender || "Đực");
        formData.append("birthDate", this.manageDog.birthDate || "");
        formData.append("coatColor", this.manageDog.coatColor || "");
        formData.append("description", this.manageDog.description || "");
        formData.append("breedId", this.manageDog.breedId || "");
        formData.append("weight", this.manageDog.weight === "" ? "" : this.manageDog.weight);
        formData.append("birthPlace", this.manageDog.birthPlace || "");
        formData.append("fatherName", this.manageDog.fatherName || "");
        formData.append("motherName", this.manageDog.motherName || "");
        formData.append("healthStatus", this.manageDog.healthStatus || "");
        formData.append("lastDeworming", this.manageDog.lastDeworming || "");
        formData.append(
          "vaccines",
          JSON.stringify(this.normalizeVaccinesForSubmit(this.manageDog.vaccines))
        );

        await DogService.update(this.manageDog._id || this.manageDog.id, formData);
        alert("✅ Cập nhật thành công! Hồ sơ đang chờ duyệt lại.");
        this.closeManageModal();
        await this.loadPageData();
      } catch (error) {
        alert("❌ Lỗi cập nhật: " + (error.response?.data?.message || error.message));
      }
    },
  },

  async mounted() {
    const farmData = localStorage.getItem("farm");
    if (!farmData) {
      alert("Vui lòng đăng nhập tài khoản trang trại.");
      this.$router.push("/login");
      return;
    }

    this.currentFarm = JSON.parse(farmData);
    await this.loadPageData();
  },
};
</script>

<style scoped>
.farm-dogs-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(34, 197, 94, 0.1), transparent 24%),
    linear-gradient(180deg, #f7fbf8 0%, #edf5ef 100%);
  padding: 24px 14px;
}

.page-shell {
  max-width: 1380px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.page-title {
  font-weight: 800;
  margin-bottom: 6px;
}

.page-subtitle {
  color: #6b7280;
}

.header-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-card,
.content-card {
  background: #fff;
  border: 1px solid #e5eee7;
  border-radius: 18px;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.035);
}

.filter-card {
  padding: 16px;
  margin-bottom: 18px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}

.stat-card {
  background: #fff;
  border: 1px solid #e5eee7;
  border-radius: 18px;
  padding: 18px;
  text-align: center;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.03);
}

.stat-label {
  color: #6b7280;
  font-size: 0.92rem;
  margin-bottom: 6px;
}

.stat-value {
  font-size: 1.45rem;
  font-weight: 800;
}

.empty-box {
  text-align: center;
  color: #6b7280;
  padding: 56px 20px;
}

.dashboard-table {
  margin-bottom: 0;
}

.dashboard-table thead th {
  font-weight: 700;
  white-space: nowrap;
  background: #f8faf8;
  color: #64748b;
  border-top: none;
}

.dashboard-table td,
.dashboard-table th {
  vertical-align: middle;
}

.action-col {
  min-width: 150px;
}

.image-col {
  min-width: 100px;
}

.code-col {
  min-width: 130px;
}

.name-col {
  min-width: 150px;
}

.breed-col {
  min-width: 140px;
}

.price-col {
  min-width: 150px;
}

.approval-col {
  min-width: 230px;
}

.sale-col {
  min-width: 160px;
}

.dog-thumb {
  width: 62px;
  height: 62px;
  object-fit: cover;
  border-radius: 14px;
  border: 1px solid #e9ecef;
}

.action-buttons-wrap {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.action-btn {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  border: 1px solid #dfe5e8;
  background: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.action-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.action-btn-view {
  color: #0d6efd;
}

.action-btn-view:hover:not(:disabled) {
  background: #eef5ff;
  border-color: #b7d4ff;
}

.action-btn-edit {
  color: #fd7e14;
}

.action-btn-edit:hover:not(:disabled) {
  background: #fff5eb;
  border-color: #ffd7b5;
}

.farm-modal-backdrop {
  background: rgba(0, 0, 0, 0.45);
  overflow-y: auto;
}

.farm-modal-content {
  border-radius: 22px;
  overflow: hidden;
}

.farm-modal-header {
  background: linear-gradient(135deg, #16a34a, #15803d);
  color: #fff;
  border-bottom: none;
  padding: 16px 20px;
}

.farm-modal-close {
  border: none;
  background: transparent;
  color: #fff;
  font-size: 28px;
  line-height: 1;
  padding: 0;
  cursor: pointer;
}

.farm-modal-footer {
  border-top: 1px solid #edf2ef;
  padding: 12px 18px 16px;
}

.detail-layout {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  gap: 18px;
}

.detail-image {
  width: 100%;
  height: 260px;
  object-fit: cover;
  border-radius: 16px;
  border: 1px solid #e6ece8;
  background: #f8faf8;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.detail-item,
.detail-block {
  border: 1px solid #e6ece8;
  border-radius: 12px;
  padding: 10px 12px;
  background: #fafdfb;
}

.detail-item label,
.detail-block label {
  display: block;
  font-weight: 700;
  color: #198754;
  margin-bottom: 4px;
  font-size: 0.88rem;
}

.detail-item div,
.detail-text {
  font-size: 0.94rem;
  color: #334155;
}

.detail-text {
  white-space: pre-line;
  word-break: break-word;
}

.soft-alert {
  border-radius: 12px;
  font-size: 0.93rem;
}

.popup-section {
  background: #fff;
  border: 1px solid #e6ece8;
  border-radius: 16px;
  padding: 14px;
}

.popup-section-title {
  font-weight: 800;
  color: #15803d;
  margin-bottom: 12px;
  font-size: 0.98rem;
}

.popup-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.popup-grid-vaccine {
  grid-template-columns: 1.2fr 0.8fr;
}

.popup-field {
  display: flex;
  flex-direction: column;
}

.popup-field-full {
  grid-column: 1 / -1;
}

.popup-label {
  font-weight: 700;
  color: #374151;
  margin-bottom: 6px;
  display: block;
  font-size: 0.9rem;
}

.popup-input {
  min-height: 42px;
  border-radius: 12px;
  border: 1px solid #dfe5e8;
  font-size: 0.95rem;
}

.popup-input:focus {
  border-color: #198754;
  box-shadow: 0 0 0 0.18rem rgba(25, 135, 84, 0.12);
}

.popup-textarea {
  min-height: 88px;
  resize: vertical;
}

.vaccine-box {
  border: 1px solid #e6ece8;
  border-radius: 14px;
  padding: 12px;
  margin-bottom: 12px;
  background: #fafdfb;
}

.empty-inline {
  border: 1px dashed #d7e6da;
  border-radius: 12px;
  padding: 12px;
  color: #6b7280;
  background: #f8faf8;
}

.modal {
  overflow-y: auto;
}

@media (max-width: 1199.98px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 991.98px) {
  .detail-layout {
    grid-template-columns: 1fr;
  }

  .detail-grid,
  .popup-grid,
  .popup-grid-vaccine {
    grid-template-columns: 1fr;
  }

  .detail-image {
    height: 240px;
  }
}

@media (max-width: 767.98px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .farm-dogs-page {
    padding: 16px 10px;
  }
}
</style>