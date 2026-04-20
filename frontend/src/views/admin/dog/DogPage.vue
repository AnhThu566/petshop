<template>
  <div class="admin-dog-page">
    <div class="page-card">
      <div class="page-header">
        <div>
          <h4 class="page-title">
            <i class="fas fa-paw mr-2"></i>Quản lý & phê duyệt hồ sơ chó
          </h4>
          <p class="page-subtitle mb-0">
            Kiểm tra hồ sơ do trang trại gửi, phản hồi, phê duyệt và mở bán.
          </p>
        </div>

        <button
          class="btn btn-refresh btn-sm font-weight-bold"
          @click="loadPageData"
        >
          <i class="fas fa-sync-alt mr-1"></i> Làm mới
        </button>
      </div>

      <div class="page-body">
        <div class="filter-card">
          <div class="row">
            <div class="col-lg-4 mb-2 mb-lg-0">
              <div class="input-group shadow-sm">
                <input
                  type="text"
                  class="form-control border-right-0"
                  placeholder="Tìm tên chó, mã tại trại, trại..."
                  v-model.trim="searchText"
                />
                <div class="input-group-append">
                  <button class="btn btn-search px-3" type="button">
                    <i class="fas fa-search"></i>
                  </button>
                </div>
              </div>
            </div>

            <div class="col-lg-4 mb-2 mb-lg-0">
              <select class="form-control shadow-sm" v-model="filterApprovalStatus">
                <option value="Tất cả">Tất cả trạng thái duyệt</option>
                <option value="Chờ duyệt">Chờ duyệt</option>
                <option value="Cần bổ sung">Cần bổ sung</option>
                <option value="Đã duyệt">Đã duyệt</option>
                <option value="Từ chối">Từ chối</option>
              </select>
            </div>

            <div class="col-lg-4">
              <select class="form-control shadow-sm" v-model="filterSaleStatus">
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

        <div class="summary-row">
          <div class="summary-box summary-pending">
            <div class="summary-value">{{ countByApprovalStatus("Chờ duyệt") }}</div>
            <div class="summary-label">Chờ duyệt</div>
          </div>

          <div class="summary-box summary-need-fix">
            <div class="summary-value">{{ countByApprovalStatus("Cần bổ sung") }}</div>
            <div class="summary-label">Cần bổ sung</div>
          </div>

          <div class="summary-box summary-approved">
            <div class="summary-value">{{ countByApprovalStatus("Đã duyệt") }}</div>
            <div class="summary-label">Đã duyệt</div>
          </div>

          <div class="summary-box summary-rejected">
            <div class="summary-value">{{ countByApprovalStatus("Từ chối") }}</div>
            <div class="summary-label">Từ chối</div>
          </div>
        </div>

        <div v-if="loading" class="empty-state">
          <i class="fas fa-spinner fa-spin fa-2x mb-3"></i>
          <div>Đang tải danh sách hồ sơ chó...</div>
        </div>

        <div v-else class="table-card">
          <div class="table-responsive">
            <table class="table table-hover mb-0 text-center align-middle admin-table">
              <thead>
                <tr>
                  <th style="width: 5%;">STT</th>
                  <th style="width: 8%;">Ảnh</th>
                  <th style="width: 11%;">Mã tại trại</th>
                  <th style="width: 11%;">Mã hệ thống</th>
                  <th style="width: 15%;" class="text-left">Tên chó</th>
                  <th style="width: 12%;">Nguồn cung</th>
                  <th style="width: 11%;">Giống chó</th>
                  <th style="width: 10%;">Giá đề xuất</th>
                  <th style="width: 10%;">Duyệt hồ sơ</th>
                  <th style="width: 10%;">Trạng thái bán</th>
                  <th style="width: 7%;">Xem</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="(dog, index) in filteredDogs" :key="dog._id || dog.id">
                  <td>{{ index + 1 }}</td>

                  <td>
                    <img
                      :src="getDogImage(dog)"
                      class="dog-thumb"
                    />
                  </td>

                  <td class="font-weight-bold text-primary">{{ dog.farmDogCode || "---" }}</td>
                  <td class="font-weight-bold text-info">{{ dog.systemDogCode || "---" }}</td>
                  <td class="font-weight-bold text-dark text-left">{{ dog.name || "---" }}</td>
                  <td class="text-secondary font-weight-bold">{{ dog.farmId?.name || "---" }}</td>
                  <td class="text-success font-weight-bold">{{ dog.breedId?.name || "---" }}</td>
                  <td class="text-danger font-weight-bold">{{ formatCurrency(dog.proposedPrice) }}</td>

                  <td>
                    <span :class="getApprovalStatusClass(dog.approvalStatus)" class="badge px-3 py-2">
                      {{ dog.approvalStatus }}
                    </span>
                    <div
                      v-if="['Cần bổ sung', 'Từ chối'].includes(dog.approvalStatus) && dog.rejectionReason"
                      class="text-danger small font-italic mt-1"
                      style="line-height: 1.25;"
                    >
                      {{ dog.rejectionReason }}
                    </div>
                  </td>

                  <td>
                    <span :class="getSaleStatusClass(dog.saleStatus)" class="badge px-3 py-2">
                      {{ dog.saleStatus }}
                    </span>
                  </td>

                  <td>
                    <button
                      class="btn btn-sm btn-view font-weight-bold"
                      @click="viewDetail(dog)"
                      title="Xem chi tiết"
                    >
                      <i class="fas fa-eye"></i>
                    </button>
                  </td>
                </tr>

                <tr v-if="filteredDogs.length === 0">
                  <td colspan="11" class="py-5 text-center text-muted">
                    <i class="fas fa-folder-open fa-2x mb-2 opacity-50"></i><br />
                    Không có dữ liệu phù hợp.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- CHI TIẾT -->
      <div
        v-if="showDetailModal"
        class="modal fade show d-block admin-modal-backdrop"
        tabindex="-1"
      >
        <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
          <div class="modal-content border-0 shadow admin-modal-content" v-if="selectedDog">
            <div class="modal-header admin-modal-header">
              <h5 class="modal-title mb-0 font-weight-bold">
                <i class="fas fa-paw mr-2"></i>Chi tiết hồ sơ: {{ selectedDog.name }}
              </h5>
              <button type="button" class="admin-modal-close" @click="closeDetailModal">
                <span>&times;</span>
              </button>
            </div>

            <div class="modal-body p-3 p-md-4">
              <div class="detail-layout">
                <div class="detail-left">
                  <div class="detail-side-card text-center">
                    <img
                      :src="getDogImage(selectedDog)"
                      class="detail-main-image mb-3"
                    />

                    <h4 class="detail-dog-name mb-1">
                      {{ selectedDog.name || "---" }}
                    </h4>

                    <div class="code-chip-wrap">
                      <span class="code-chip">Trại: {{ selectedDog.farmDogCode || "---" }}</span>
                      <span class="code-chip code-chip-blue">Hệ thống: {{ selectedDog.systemDogCode || "---" }}</span>
                    </div>

                    <div class="detail-meta-list mt-3 text-left">
                      <div class="detail-meta-item">
                        <i class="fas fa-warehouse text-secondary mr-2"></i>
                        <span><strong>Trang trại:</strong> {{ selectedDog.farmId?.name || "---" }}</span>
                      </div>

                      <div class="detail-meta-item">
                        <i class="fas fa-map-marker-alt text-secondary mr-2"></i>
                        <span><strong>Địa chỉ:</strong> {{ selectedDog.farmId?.address || "---" }}</span>
                      </div>

                      <div class="detail-meta-item">
                        <i class="fas fa-phone-alt text-secondary mr-2"></i>
                        <span><strong>Liên hệ:</strong> {{ selectedDog.farmId?.phone || "---" }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="detail-right">
                  <div class="section-heading">Thông tin hồ sơ chó</div>

                  <div class="info-grid mt-3">
                    <div class="info-card">
                      <small>Giống chó</small>
                      <strong>{{ selectedDog.breedId?.name || "---" }}</strong>
                    </div>

                    <div class="info-card">
                      <small>Giới tính</small>
                      <strong>{{ selectedDog.gender || "---" }}</strong>
                    </div>

                    <div class="info-card">
                      <small>Ngày sinh</small>
                      <strong>{{ formatDate(selectedDog.birthDate) }}</strong>
                    </div>

                    <div class="info-card">
                      <small>Màu lông</small>
                      <strong>{{ selectedDog.coatColor || "---" }}</strong>
                    </div>

                    <div class="info-card">
                      <small>Cân nặng</small>
                      <strong>{{ selectedDog.weight || "---" }} kg</strong>
                    </div>

                    <div class="info-card">
                      <small>Nơi sinh</small>
                      <strong>{{ selectedDog.birthPlace || "---" }}</strong>
                    </div>

                    <div class="info-card">
                      <small>Tên chó bố</small>
                      <strong>{{ selectedDog.fatherName || "---" }}</strong>
                    </div>

                    <div class="info-card">
                      <small>Tên chó mẹ</small>
                      <strong>{{ selectedDog.motherName || "---" }}</strong>
                    </div>

                    <div class="info-card">
                      <small>Giá đề xuất từ trại</small>
                      <strong class="text-primary">{{ formatCurrency(selectedDog.proposedPrice) }}</strong>
                    </div>

                    <div class="info-card">
                      <small>Giá bán cuối cùng</small>
                      <strong class="text-success">{{ formatCurrency(selectedDog.finalPrice) }}</strong>
                    </div>

                    <div class="info-card">
                      <small>Tình trạng sức khỏe</small>
                      <strong>{{ selectedDog.healthStatus || "Tốt" }}</strong>
                    </div>

                    <div class="info-card">
                      <small>Ngày tẩy giun gần nhất</small>
                      <strong>{{ formatDate(selectedDog.lastDeworming) }}</strong>
                    </div>

                    <div class="info-card info-card-full">
                      <small>Mô tả</small>
                      <div class="content-text">
                        {{ selectedDog.description || "Chưa có mô tả." }}
                      </div>
                    </div>
                  </div>

                  <div class="section-heading mt-4">Vaccine đã tiêm</div>

                  <div class="vaccine-section mt-3">
                    <div
                      v-if="selectedDog.vaccines && selectedDog.vaccines.length"
                      class="table-responsive"
                    >
                      <table class="table table-bordered vaccine-table mb-0">
                        <thead>
                          <tr>
                            <th style="width: 70%;">Tên vaccine</th>
                            <th style="width: 30%;">Ngày tiêm</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            v-for="(vaccine, index) in selectedDog.vaccines"
                            :key="index"
                          >
                            <td class="font-weight-bold text-dark">
                              {{ vaccine.vaccineName || getVaccineName(vaccine.vaccineId) || "---" }}
                            </td>
                            <td>{{ formatDate(vaccine.dateInjected) }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div v-else class="empty-vaccine-box">
                      Chưa có dữ liệu vaccine.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-footer bg-light d-flex justify-content-between flex-wrap">
              <button
                type="button"
                class="btn btn-secondary font-weight-bold"
                @click="closeDetailModal"
              >
                Đóng
              </button>

              <div class="d-flex flex-wrap" v-if="selectedDog">
                <template v-if="selectedDog.approvalStatus === 'Chờ duyệt' || selectedDog.approvalStatus === 'Cần bổ sung'">
                  <button
                    class="btn btn-outline-warning font-weight-bold mr-2 shadow-sm mb-2"
                    @click="openResponseModal(selectedDog, 'Cần bổ sung')"
                  >
                    <i class="fas fa-reply mr-1"></i> Yêu cầu bổ sung
                  </button>

                  <button
                    class="btn btn-outline-danger font-weight-bold mr-2 shadow-sm mb-2"
                    @click="openResponseModal(selectedDog, 'Từ chối')"
                  >
                    <i class="fas fa-times mr-1"></i> Từ chối
                  </button>

                  <button
                    class="btn btn-approve font-weight-bold shadow-sm px-4 mb-2"
                    @click="openApproveModal(selectedDog)"
                  >
                    <i class="fas fa-check mr-1"></i> Phê duyệt
                  </button>
                </template>

                <template v-else-if="canStopSale(selectedDog)">
                  <button
                    class="btn btn-outline-danger font-weight-bold shadow-sm px-4 mb-2"
                    @click="updateSaleStatus(selectedDog, 'Ngừng bán')"
                  >
                    <i class="fas fa-ban mr-1"></i> Ngừng bán
                  </button>
                </template>

                <div class="text-muted font-italic font-weight-bold d-flex align-items-center mb-2" v-else>
                  <i class="fas fa-check-double mr-1 text-success"></i> Đã xử lý / đang giao dịch
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- PHẢN HỒI -->
      <div
        v-if="showResponseModal"
        class="modal fade show d-block admin-modal-backdrop"
        tabindex="-1"
      >
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow-lg response-modal-content">
            <div
              class="modal-header text-white"
              :class="responseForm.approvalStatus === 'Từ chối' ? 'bg-danger' : 'bg-warning'"
            >
              <h5 class="modal-title font-weight-bold">
                <i
                  class="mr-2"
                  :class="responseForm.approvalStatus === 'Từ chối' ? 'fas fa-times-circle' : 'fas fa-reply'"
                ></i>
                {{
                  responseForm.approvalStatus === "Từ chối"
                    ? "Từ chối hồ sơ chó"
                    : "Yêu cầu bổ sung"
                }}
              </h5>
              <button type="button" class="close text-white" @click="closeResponseModal">
                <span>&times;</span>
              </button>
            </div>

            <div class="modal-body p-4">
              <div class="mb-3">
                <div class="small text-muted">Hồ sơ đang xử lý</div>
                <div class="font-weight-bold text-dark">
                  {{ responseForm.dogName || "---" }}
                </div>
              </div>

              <div class="form-group mb-0">
                <label class="font-weight-bold text-dark">
                  {{
                    responseForm.approvalStatus === "Từ chối"
                      ? "Lý do từ chối"
                      : "Nội dung cần bổ sung"
                  }}
                </label>
                <textarea
                  class="form-control response-textarea"
                  rows="4"
                  v-model.trim="responseForm.rejectionReason"
                  :placeholder="
                    responseForm.approvalStatus === 'Từ chối'
                      ? 'Nhập lý do từ chối hồ sơ...'
                      : 'Nhập nội dung cần trang trại bổ sung...'
                  "
                ></textarea>
              </div>
            </div>

            <div class="modal-footer bg-light">
              <button class="btn btn-secondary font-weight-bold" @click="closeResponseModal">
                Hủy
              </button>
              <button
                class="btn font-weight-bold text-white"
                :class="responseForm.approvalStatus === 'Từ chối' ? 'btn-danger' : 'btn-warning'"
                @click="submitResponse"
              >
                {{
                  responseForm.approvalStatus === "Từ chối"
                    ? "Xác nhận từ chối"
                    : "Gửi yêu cầu bổ sung"
                }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- PHÊ DUYỆT -->
      <div
        v-if="showApproveModal"
        class="modal fade show d-block admin-modal-backdrop"
        tabindex="-1"
      >
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow-lg approve-modal-content">
            <div class="modal-header approve-modal-header">
              <h5 class="modal-title font-weight-bold">
                <i class="fas fa-check-circle mr-2"></i>Phê duyệt & mở bán
              </h5>
              <button type="button" class="close text-white" @click="closeApproveModal">
                <span>&times;</span>
              </button>
            </div>

            <div class="modal-body p-4">
              <div class="approve-dog-name mb-3">
                {{ approveForm.dogName || "---" }}
              </div>

              <div class="approve-info-box mb-3">
                <div class="approve-info-label">Giá đề xuất từ trang trại</div>
                <div class="approve-info-value">
                  {{ formatCurrency(approveForm.proposedPrice) }}
                </div>
              </div>

              <div class="form-group">
                <label class="font-weight-bold text-dark mb-2">
                  Mã chó hệ thống
                </label>
                <input
                  type="text"
                  class="form-control approve-price-input"
                  v-model.trim="approveForm.systemDogCode"
                  placeholder="Để trống nếu muốn hệ thống tự sinh"
                />
              </div>

              <div class="form-group mb-0">
                <label class="font-weight-bold text-dark mb-2">
                  Giá bán chính thức <span class="text-danger">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  class="form-control approve-price-input"
                  v-model="approveForm.finalPrice"
                  placeholder="Nhập giá bán chính thức"
                />
              </div>

              <div class="mt-3">
                <small
                  v-if="Number(approveForm.finalPrice || 0) <= 0"
                  class="text-muted font-weight-bold"
                >
                  Vui lòng nhập giá bán chính thức.
                </small>

                <small
                  v-else
                  class="text-success font-weight-bold"
                >
                  Dữ liệu hợp lệ để xác nhận mở bán.
                </small>
              </div>
            </div>

            <div class="modal-footer bg-light">
              <button class="btn btn-secondary font-weight-bold" @click="closeApproveModal">
                Hủy
              </button>
              <button
                class="btn btn-approve font-weight-bold"
                :disabled="!isApproveModalPriceValid"
                @click="confirmApproveDog"
              >
                Xác nhận mở bán
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="showDetailModal || showResponseModal || showApproveModal"
        class="modal-backdrop fade show"
      ></div>
    </div>
  </div>
</template>

<script>
import DogService from "@/services/dog.service";
import DogHealthRecordService from "@/services/dogHealthRecord.service";
import VaccineService from "@/services/vaccine.service";

export default {
  name: "AdminDogPage",

  data() {
    return {
      dogs: [],
      healthRecords: [],
      vaccinesMaster: [],
      searchText: "",
      filterApprovalStatus: "Chờ duyệt",
      filterSaleStatus: "Tất cả",
      selectedDog: null,
      showDetailModal: false,
      loading: false,

      showResponseModal: false,
      responseForm: {
        dogId: "",
        dogName: "",
        approvalStatus: "Cần bổ sung",
        rejectionReason: "",
      },

      showApproveModal: false,
      approveForm: {
        dogId: "",
        dogName: "",
        proposedPrice: 0,
        systemDogCode: "",
        finalPrice: "",
      },
    };
  },

  computed: {
    filteredDogs() {
      let result = [...this.dogs];

      if (this.filterApprovalStatus !== "Tất cả") {
        result = result.filter((dog) => dog.approvalStatus === this.filterApprovalStatus);
      }

      if (this.filterSaleStatus !== "Tất cả") {
        result = result.filter((dog) => dog.saleStatus === this.filterSaleStatus);
      }

      if (this.searchText) {
        const term = this.searchText.toLowerCase();
        result = result.filter(
          (dog) =>
            dog.name?.toLowerCase().includes(term) ||
            dog.farmDogCode?.toLowerCase().includes(term) ||
            dog.systemDogCode?.toLowerCase().includes(term) ||
            dog.farmId?.name?.toLowerCase().includes(term)
        );
      }

      return result;
    },

    isApproveModalPriceValid() {
      const finalPrice = Number(this.approveForm.finalPrice || 0);
      return finalPrice > 0;
    },
  },

  methods: {
    async loadPageData() {
      try {
        this.loading = true;
        const [dogs, healthRecords, vaccines] = await Promise.all([
          DogService.getAll(),
          DogHealthRecordService.getAll(),
          VaccineService.getAll(),
        ]);

        this.healthRecords = Array.isArray(healthRecords) ? healthRecords : [];
        this.vaccinesMaster = Array.isArray(vaccines)
          ? vaccines.filter((item) => item?.status === "Hoạt động")
          : [];

        const rawDogs = Array.isArray(dogs) ? dogs : [];
        this.dogs = rawDogs.map((dog) => ({
          ...dog,
          healthRecord: this.getLatestHealthRecordForDog(dog, this.healthRecords),
        }));
      } catch (error) {
        console.error("Lỗi lấy danh sách chó:", error);
        alert("Không thể tải danh sách hồ sơ chó.");
      } finally {
        this.loading = false;
      }
    },

    getLatestHealthRecordForDog(dog, allRecords = []) {
      const dogId = dog?._id || dog?.id;
      if (!dogId) return null;

      return (
        allRecords
          .filter((record) => {
            const recordDogId = record.dogId?._id || record.dogId?.id || record.dogId;
            return String(recordDogId) === String(dogId);
          })
          .sort(
            (a, b) =>
              new Date(b.checkedAt || b.createdAt) - new Date(a.checkedAt || a.createdAt)
          )[0] || null
      );
    },

    countByApprovalStatus(status) {
      return this.dogs.filter((dog) => dog.approvalStatus === status).length;
    },

    getDogImage(dog) {
      if (!dog?.image) return "https://via.placeholder.com/60?text=No+Img";
      if (String(dog.image).startsWith("http")) return dog.image;
      return "http://localhost:3000" + dog.image;
    },

    getVaccineName(vaccineId) {
      const item = this.vaccinesMaster.find(
        (v) => String(v._id || v.id) === String(vaccineId || "")
      );
      return item?.name || "";
    },

    viewDetail(dog) {
      this.selectedDog = dog;
      this.showDetailModal = true;
    },

    closeDetailModal() {
      this.showDetailModal = false;
      this.selectedDog = null;
    },

    openResponseModal(dog, type) {
      this.responseForm = {
        dogId: dog?._id || dog?.id || "",
        dogName: dog?.name || "",
        approvalStatus: type,
        rejectionReason: "",
      };
      this.showResponseModal = true;
    },

    closeResponseModal() {
      this.showResponseModal = false;
      this.responseForm = {
        dogId: "",
        dogName: "",
        approvalStatus: "Cần bổ sung",
        rejectionReason: "",
      };
    },

    openApproveModal(dog) {
      this.approveForm = {
        dogId: dog?._id || dog?.id || "",
        dogName: dog?.name || "",
        proposedPrice: Number(dog?.proposedPrice || 0),
        systemDogCode: dog?.systemDogCode || "",
        finalPrice: Number(dog?.finalPrice || dog?.proposedPrice || 0),
      };
      this.showApproveModal = true;
    },

    closeApproveModal() {
      this.showApproveModal = false;
      this.approveForm = {
        dogId: "",
        dogName: "",
        proposedPrice: 0,
        systemDogCode: "",
        finalPrice: "",
      };
    },

    async submitResponse() {
      if (!this.responseForm.dogId) return;

      if (!this.responseForm.rejectionReason.trim()) {
        alert(
          this.responseForm.approvalStatus === "Từ chối"
            ? "❌ Bạn phải nhập lý do từ chối!"
            : "❌ Bạn phải nhập nội dung cần bổ sung!"
        );
        return;
      }

      try {
        await DogService.updateApprovalStatus(this.responseForm.dogId, {
          approvalStatus: this.responseForm.approvalStatus,
          rejectionReason: this.responseForm.rejectionReason.trim(),
        });

        alert(
          this.responseForm.approvalStatus === "Từ chối"
            ? "✅ Đã từ chối hồ sơ thành công!"
            : "✅ Đã gửi yêu cầu bổ sung cho trang trại!"
        );

        const currentId = this.responseForm.dogId;
        this.closeResponseModal();
        await this.loadPageData();

        if (this.selectedDog && (this.selectedDog._id || this.selectedDog.id) === currentId) {
          const updatedDog = this.dogs.find((item) => (item._id || item.id) === currentId);
          this.selectedDog = updatedDog || null;
        }
      } catch (error) {
        alert("❌ Lỗi: " + (error.response?.data?.message || "Không thể xử lý"));
      }
    },

    async confirmApproveDog() {
      const id = this.approveForm.dogId;
      if (!id) return;

      const finalPrice = Number(this.approveForm.finalPrice || 0);

      if (!finalPrice || finalPrice <= 0) {
        alert("❌ Vui lòng nhập giá bán chính thức hợp lệ.");
        return;
      }

      if (!confirm("Bạn có chắc chắn muốn phê duyệt hồ sơ và mở bán bé chó này không?")) return;

      try {
        await DogService.updateApprovalStatus(id, {
          approvalStatus: "Đã duyệt",
          saleStatus: "Sẵn sàng bán",
          isPublished: true,
          finalPrice: finalPrice,
          systemDogCode: this.approveForm.systemDogCode || "",
        });

        alert("✅ Đã phê duyệt hồ sơ, chốt giá bán và mở bán thành công!");
        this.closeApproveModal();
        await this.loadPageData();

        if (this.selectedDog && (this.selectedDog._id || this.selectedDog.id) === id) {
          const updatedDog = this.dogs.find((item) => (item._id || item.id) === id);
          this.selectedDog = updatedDog || null;
        }
      } catch (error) {
        alert("❌ Lỗi: " + (error.response?.data?.message || "Không thể xử lý"));
      }
    },

    formatDate(date) {
      if (!date) return "---";
      return new Date(date).toLocaleDateString("vi-VN");
    },

    formatCurrency(value) {
      if (value === null || value === undefined || value === "") return "---";
      return Number(value).toLocaleString("vi-VN") + " ₫";
    },

    canStopSale(dog) {
      if (!dog) return false;
      return dog.approvalStatus === "Đã duyệt" && dog.saleStatus === "Sẵn sàng bán";
    },

    async updateSaleStatus(dog, saleStatus) {
      const id = dog?._id || dog?.id;
      if (!id) return;

      const confirmText =
        saleStatus === "Ngừng bán"
          ? "Bạn có chắc chắn muốn ngừng bán bé chó này không?"
          : "Bạn có chắc chắn muốn cập nhật trạng thái bán?";

      if (!confirm(confirmText)) return;

      try {
        await DogService.updateSaleStatus(id, { saleStatus });
        alert("✅ Cập nhật trạng thái bán thành công!");
        await this.loadPageData();

        if (this.selectedDog && (this.selectedDog._id || this.selectedDog.id) === id) {
          const updatedDog = this.dogs.find((item) => (item._id || item.id) === id);
          this.selectedDog = updatedDog || null;
        }
      } catch (error) {
        alert("❌ Lỗi: " + (error.response?.data?.message || "Không thể xử lý"));
      }
    },

    getApprovalStatusClass(status) {
      if (status === "Chờ duyệt") return "badge-warning text-dark";
      if (status === "Cần bổ sung") return "badge-warning text-dark";
      if (status === "Đã duyệt") return "badge-success";
      if (status === "Từ chối") return "badge-danger";
      return "badge-secondary";
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
  },

  mounted() {
    this.loadPageData();
  },
};
</script>

<style scoped>
.admin-dog-page {
  padding: 14px;
  background: #f5f7fb;
}

.page-card {
  background: #ffffff;
  border: 1px solid #e7ebf3;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
  overflow: hidden;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
  padding: 22px 24px;
  background: #ffffff;
  border-bottom: 1px solid #e9edf5;
}

.page-title {
  font-weight: 800;
  margin-bottom: 6px;
  color: #2b3445;
}

.page-subtitle {
  color: #6b7280;
}

.page-body {
  padding: 22px;
  background: #f7f9fc;
}

.filter-card,
.table-card {
  background: #ffffff;
  border: 1px solid #e6ebf2;
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(15, 23, 42, 0.03);
}

.filter-card {
  padding: 16px;
  margin-bottom: 18px;
}

.table-card {
  overflow: hidden;
}

.empty-state {
  text-align: center;
  color: #6b7280;
  padding: 60px 20px;
}

.summary-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 18px;
}

.summary-box {
  border-radius: 14px;
  padding: 14px 16px;
  border: 1px solid transparent;
  box-shadow: none;
}

.summary-value {
  font-size: 1.5rem;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 6px;
}

.summary-label {
  font-size: 0.92rem;
  font-weight: 600;
}

.summary-pending {
  background: #fff6e8;
  border-color: #f5d9a6;
}

.summary-pending .summary-value,
.summary-pending .summary-label {
  color: #b7791f;
}

.summary-need-fix {
  background: #fff3e8;
  border-color: #f7cfaa;
}

.summary-need-fix .summary-value,
.summary-need-fix .summary-label {
  color: #c66a12;
}

.summary-approved {
  background: #f2f3ff;
  border-color: #d9ddff;
}

.summary-approved .summary-value,
.summary-approved .summary-label {
  color: #5558d9;
}

.summary-rejected {
  background: #fff1f3;
  border-color: #f2c7d0;
}

.summary-rejected .summary-value,
.summary-rejected .summary-label {
  color: #c7364f;
}

.admin-table thead th {
  background: #f8fafc;
  color: #667085;
  font-size: 0.84rem;
  text-transform: uppercase;
  font-weight: 700;
  white-space: nowrap;
  border-bottom: 1px solid #e6ebf2;
}

.admin-table td,
.admin-table th {
  vertical-align: middle;
}

.admin-table tbody td {
  color: #1f2937;
  border-color: #edf1f6;
}

.admin-table tbody tr:hover {
  background: #fafbfe;
}

.dog-thumb {
  width: 54px;
  height: 54px;
  object-fit: cover;
  border-radius: 50%;
  border: 1px solid #e1e7ef;
  box-shadow: 0 4px 10px rgba(15, 23, 42, 0.04);
}

.btn-refresh {
  border: 1px solid #d7def0;
  color: #536080;
  background: #ffffff;
  border-radius: 12px;
}

.btn-refresh:hover {
  background: #f6f8fc;
  color: #3d4966;
}

.btn-search {
  background: #6b6ee8;
  border-color: #6b6ee8;
  color: #fff;
}

.btn-search:hover {
  background: #5b5ed8;
  border-color: #5b5ed8;
  color: #fff;
}

.btn-view {
  border-color: #d7dcff;
  color: #5a5edc;
  background: #ffffff;
  border-radius: 10px;
}

.btn-view:hover {
  background: #f3f4ff;
  color: #4f53cf;
  border-color: #c9ceff;
}

.btn-approve {
  background: #6b6ee8;
  border-color: #6b6ee8;
  color: #fff;
}

.btn-approve:hover {
  background: #5b5ed8;
  border-color: #5b5ed8;
  color: #fff;
}

.admin-modal-backdrop {
  background: rgba(17, 24, 39, 0.38);
  overflow-y: auto;
}

.admin-modal-content {
  border-radius: 18px;
  overflow: hidden;
}

.admin-modal-header {
  background: #ffffff;
  color: #2b3445;
  border-bottom: 1px solid #e8edf5;
  padding: 16px 20px;
}

.approve-modal-header {
  background: #ffffff;
  color: #2b3445;
  border-bottom: 1px solid #e8edf5;
}

.admin-modal-close {
  border: none;
  background: transparent;
  color: #6b7280;
  font-size: 28px;
  line-height: 1;
  padding: 0;
  cursor: pointer;
}

.detail-layout {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 18px;
}

.detail-side-card {
  background: #ffffff;
  border: 1px solid #e8edf5;
  border-radius: 16px;
  padding: 18px;
  height: 100%;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.03);
}

.detail-main-image {
  width: 100%;
  max-height: 255px;
  object-fit: cover;
  border-radius: 14px;
}

.detail-dog-name {
  color: #1f2937;
  font-weight: 800;
}

.code-chip-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.code-chip {
  display: inline-flex;
  padding: 7px 12px;
  border-radius: 999px;
  background: #f4f5ff;
  color: #585dd8;
  border: 1px solid #dde1ff;
  font-weight: 700;
  font-size: 0.86rem;
}

.code-chip-blue {
  background: #eef2ff;
  color: #4d57c7;
  border-color: #d7ddff;
}

.detail-meta-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-meta-item {
  display: flex;
  align-items: flex-start;
  font-size: 0.95rem;
  color: #344054;
  line-height: 1.45;
}

.section-heading {
  font-weight: 800;
  color: #111827;
  border-bottom: 1px solid #e8edf5;
  padding-bottom: 10px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.info-card {
  background: #ffffff;
  border: 1px solid #e7ebf3;
  border-radius: 14px;
  padding: 14px 16px;
  min-height: 82px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.02);
}

.info-card small {
  display: block;
  color: #667085;
  margin-bottom: 4px;
  font-weight: 600;
}

.info-card strong {
  color: #111827;
}

.info-card-full {
  grid-column: 1 / -1;
}

.content-text {
  line-height: 1.6;
  color: #1f2937;
  margin-top: 4px;
}

.vaccine-section {
  background: #ffffff;
  border: 1px solid #e7ebf3;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.02);
}

.vaccine-table thead th {
  background: #f8fafc;
  color: #667085;
  font-size: 0.84rem;
  text-transform: uppercase;
  vertical-align: middle;
}

.vaccine-table td,
.vaccine-table th {
  vertical-align: middle;
  color: #1f2937;
}

.empty-vaccine-box {
  padding: 14px 16px;
  border-radius: 12px;
  background: #fafbfe;
  color: #667085;
  border: 1px dashed #dbe4ef;
}

.response-modal-content,
.approve-modal-content {
  border-radius: 16px;
}

.response-textarea {
  border-radius: 12px;
  min-height: 120px;
  color: #111827;
}

.approve-dog-name {
  font-size: 1.15rem;
  font-weight: 800;
  color: #111827;
}

.approve-info-box {
  border: 1px solid #e1e5ff;
  background: #f7f8ff;
  border-radius: 14px;
  padding: 14px 16px;
}

.approve-info-label {
  font-size: 0.85rem;
  color: #667085;
  font-weight: 700;
  margin-bottom: 6px;
}

.approve-info-value {
  font-size: 1.02rem;
  font-weight: 800;
  color: #575cd8;
}

.approve-price-input {
  min-height: 46px;
  border-radius: 12px;
  border: 1px solid #dbe4f0;
  box-shadow: none;
  font-weight: 700;
  color: #111827;
}

.approve-price-input:focus {
  border-color: #7a7eea;
  box-shadow: 0 0 0 3px rgba(107, 110, 232, 0.12);
}

.form-control,
.form-control::placeholder,
select.form-control {
  color: #111827;
}

.form-control::placeholder {
  color: #98a2b3;
}

.text-primary {
  color: #575cd8 !important;
}

.text-info {
  color: #5c63c9 !important;
}

.text-success {
  color: #111827 !important;
}

.text-dark {
  color: #111827 !important;
}

.badge {
  font-weight: 700;
  border-radius: 999px;
}

.badge-warning {
  background: #fff4db !important;
  color: #a16207 !important;
  border: 1px solid #f6deb0;
}

.badge-success {
  background: #eef2ff !important;
  color: #5558d9 !important;
  border: 1px solid #d9ddff;
}

.badge-danger {
  background: #fff1f3 !important;
  color: #c7364f !important;
  border: 1px solid #f2c7d0;
}

.badge-secondary {
  background: #f3f4f6 !important;
  color: #4b5563 !important;
  border: 1px solid #e5e7eb;
}

.badge-info {
  background: #eef6ff !important;
  color: #2563eb !important;
  border: 1px solid #cfe0ff;
}

.badge-primary {
  background: #f2f3ff !important;
  color: #5558d9 !important;
  border: 1px solid #d9ddff;
}

.badge-dark {
  background: #eef1f5 !important;
  color: #344054 !important;
  border: 1px solid #dce3eb;
}

@media (max-width: 991.98px) {
  .summary-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .detail-layout {
    grid-template-columns: 1fr;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .detail-main-image {
    max-height: 220px;
  }
}

@media (max-width: 575.98px) {
  .summary-row {
    grid-template-columns: 1fr;
  }

  .page-body {
    padding: 14px;
  }
}
</style>