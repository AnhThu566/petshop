<template>
  <div class="admin-dog-page bg-light py-4">
    <div class="container-fluid px-2">
      <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3 flex-wrap">
        <div>
          <h4 class="font-weight-bold text-dark mb-1">
            <i class="fas fa-paw mr-2 text-primary"></i>
            QUẢN LÝ & PHÊ DUYỆT HỒ SƠ CHÓ
          </h4>
          <div class="small text-muted">
            Kiểm tra hồ sơ do trang trại cung cấp, phản hồi, phê duyệt và mở bán.
          </div>
        </div>

        <button
          class="btn btn-outline-primary btn-sm mt-2 mt-md-0"
          @click="loadPageData"
          :disabled="loading"
        >
          <i class="fas fa-sync-alt mr-1"></i> Làm mới
        </button>
      </div>

      <div class="summary-row mb-4">
        <div class="summary-box summary-waiting">
          <div class="summary-value">{{ countByApprovalStatus("Chờ duyệt") }}</div>
          <div class="summary-label">Chờ duyệt</div>
        </div>

        <div class="summary-box summary-failed">
          <div class="summary-value">{{ countByApprovalStatus("Cần bổ sung") }}</div>
          <div class="summary-label">Cần bổ sung</div>
        </div>

        <div class="summary-box summary-confirmed">
          <div class="summary-value">{{ countByApprovalStatus("Đã duyệt") }}</div>
          <div class="summary-label">Đã duyệt</div>
        </div>

        <div class="summary-box summary-cancelled">
          <div class="summary-value">{{ countByApprovalStatus("Từ chối") }}</div>
          <div class="summary-label">Từ chối</div>
        </div>
      </div>

      <div class="row mb-3 align-items-center">
        <div class="col-lg-5 col-md-12 mb-2 mb-lg-0">
          <div class="input-group input-group-sm shadow-sm">
            <div class="input-group-prepend">
              <span class="input-group-text bg-white text-primary border-right-0">
                <i class="fas fa-search"></i>
              </span>
            </div>
            <input
              type="text"
              class="form-control border-left-0"
              placeholder="Tìm tên chó, mã tại trại, mã hệ thống, trang trại..."
              v-model.trim="searchText"
            />
          </div>
        </div>

        <div class="col-lg-3 col-md-6 mb-2 mb-lg-0">
          <select class="form-control form-control-sm shadow-sm" v-model="filterApprovalStatus">
            <option value="Tất cả">Tất cả trạng thái duyệt</option>
            <option value="Chờ duyệt">Chờ duyệt</option>
            <option value="Cần bổ sung">Cần bổ sung</option>
            <option value="Đã duyệt">Đã duyệt</option>
            <option value="Từ chối">Từ chối</option>
          </select>
        </div>

        <div class="col-lg-3 col-md-6 mb-2 mb-lg-0">
          <select class="form-control form-control-sm shadow-sm" v-model="filterSaleStatus">
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

        <div class="col-lg-1 col-md-12 text-lg-right">
          <div class="small text-muted font-weight-bold">
            Tổng: {{ filteredDogs.length }}
          </div>
        </div>
      </div>

      <div v-if="loading" class="card border-0 shadow-sm">
        <div class="card-body text-center py-5 text-muted">
          <i class="fas fa-spinner fa-spin fa-3x mb-3 d-block"></i>
          Đang tải danh sách hồ sơ chó...
        </div>
      </div>

      <div v-else class="card border-0 shadow-sm">
        <div class="table-responsive">
          <table class="table table-hover align-middle text-center mb-0 admin-dog-table">
            <thead class="bg-light">
              <tr class="small text-secondary">
                <th class="py-3">STT</th>
                <th class="py-3">Ảnh</th>
                <th class="py-3">Mã tại trại</th>
                <th class="py-3">Mã hệ thống</th>
                <th class="py-3 text-left">Tên chó</th>
                <th class="py-3">Trang trại cung cấp</th>
                <th class="py-3">Giống chó</th>
                <th class="py-3">Giá cung cấp</th>
                <th class="py-3">Duyệt hồ sơ</th>
                <th class="py-3">Trạng thái bán</th>
                <th class="py-3">Thao tác</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="(dog, index) in filteredDogs" :key="dog._id || dog.id">
                <td>{{ index + 1 }}</td>

                <td>
                  <img :src="getDogImage(dog)" class="dog-thumb" />
                </td>

                <td class="font-weight-bold text-primary">
                  {{ dog.farmDogCode || "---" }}
                </td>

                <td class="font-weight-bold text-info">
                  {{ dog.systemDogCode || "---" }}
                </td>

                <td class="text-left font-weight-bold text-dark">
                  {{ dog.name || "---" }}
                </td>

                <td>
                  {{ dog.farmId?.name || "---" }}
                </td>

                <td class="font-weight-bold">
                  {{ dog.breedId?.name || "---" }}
                </td>

                <td class="text-danger font-weight-bold">
                  {{ formatCurrency(dog.proposedPrice) }}
                </td>

                <td>
                  <div class="d-flex flex-column align-items-center">
                    <span :class="getApprovalStatusClass(dog.approvalStatus)" class="status-badge">
                      {{ dog.approvalStatus }}
                    </span>
                    <div
                      v-if="['Cần bổ sung', 'Từ chối'].includes(dog.approvalStatus) && dog.rejectionReason"
                      class="reject-note mt-1"
                    >
                      {{ dog.rejectionReason }}
                    </div>
                  </div>
                </td>

                <td>
                  <span :class="getSaleStatusClass(dog.saleStatus)" class="status-badge">
                    {{ dog.saleStatus }}
                  </span>
                </td>

                <td>
                  <button
                    class="btn btn-sm btn-outline-secondary"
                    @click="viewDetail(dog)"
                    title="Xem chi tiết"
                  >
                    <i class="fas fa-eye mr-1"></i> Chi tiết
                  </button>
                </td>
              </tr>

              <tr v-if="filteredDogs.length === 0">
                <td colspan="11" class="py-5 text-center text-muted">
                  <i class="fas fa-folder-open fa-2x mb-3 d-block"></i>
                  Không có dữ liệu phù hợp.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- CHI TIẾT -->
      <div
        v-if="showDetailModal"
        class="modal fade show d-block"
        tabindex="-1"
        style="background: rgba(0, 0, 0, 0.45);"
      >
        <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
          <div class="modal-content border-0 shadow" v-if="selectedDog">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title mb-0">
                <i class="fas fa-paw mr-2"></i>Chi tiết hồ sơ: {{ selectedDog.name }}
              </h5>
              <button type="button" class="close text-white" @click="closeDetailModal">
                <span>&times;</span>
              </button>
            </div>

            <div class="modal-body">
              <div class="row">
                <div class="col-lg-4 mb-3">
                  <div class="card border-0 shadow-sm h-100">
                    <div class="card-body text-center">
                      <img
                        :src="getDogImage(selectedDog)"
                        class="detail-main-image mb-3"
                      />

                      <h4 class="font-weight-bold text-dark mb-2">
                        {{ selectedDog.name || "---" }}
                      </h4>

                      <div class="code-chip-wrap">
                        <span class="code-chip">Trại: {{ selectedDog.farmDogCode || "---" }}</span>
                        <span class="code-chip code-chip-blue">Hệ thống: {{ selectedDog.systemDogCode || "---" }}</span>
                      </div>

                      <div class="detail-meta-list mt-3 text-left">
                        <div class="detail-meta-item">
                          <i class="fas fa-warehouse text-secondary mr-2"></i>
                          <span><strong>Trang trại cung cấp:</strong> {{ selectedDog.farmId?.name || "---" }}</span>
                        </div>

                        <div class="detail-meta-item">
                          <i class="fas fa-map-marker-alt text-secondary mr-2"></i>
                          <span><strong>Địa chỉ trại:</strong> {{ selectedDog.farmId?.address || "---" }}</span>
                        </div>

                        <div class="detail-meta-item">
                          <i class="fas fa-phone-alt text-secondary mr-2"></i>
                          <span><strong>Liên hệ trại:</strong> {{ selectedDog.farmId?.phone || "---" }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col-lg-8">
                  <div class="card border-0 shadow-sm mb-3">
                    <div class="card-body">
                      <h6 class="font-weight-bold text-primary mb-3">Thông tin hồ sơ chó</h6>

                      <div class="info-grid">
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
                          <small>Khu vực cung cấp</small>
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
                          <small>Giá cung cấp từ trại</small>
                          <strong class="text-primary">{{ formatCurrency(selectedDog.proposedPrice) }}</strong>
                        </div>

                        <div class="info-card">
                          <small>Giá bán chính thức</small>
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
                          <small>Mô tả đặc điểm</small>
                          <div class="content-text">
                            {{ selectedDog.description || "Chưa có mô tả." }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="card border-0 shadow-sm">
                    <div class="card-body">
                      <h6 class="font-weight-bold text-primary mb-3">Vaccine đã tiêm</h6>

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
                    class="btn btn-primary font-weight-bold shadow-sm px-4 mb-2"
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

                <div class="text-muted small font-italic d-flex align-items-center mb-2" v-else>
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
        class="modal fade show d-block"
        tabindex="-1"
        style="background: rgba(0, 0, 0, 0.45);"
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
        class="modal fade show d-block"
        tabindex="-1"
        style="background: rgba(0, 0, 0, 0.45);"
      >
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow-lg approve-modal-content">
            <div class="modal-header bg-primary text-white">
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
                <div class="approve-info-label">Giá cung cấp từ trang trại</div>
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
                class="btn btn-primary font-weight-bold"
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
import VaccineService from "@/services/vaccine.service";

export default {
  name: "AdminDogPage",

  data() {
    return {
      dogs: [],
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
        const [dogs, vaccines] = await Promise.all([
          DogService.getAll(),
          VaccineService.getAll(),
        ]);

        this.vaccinesMaster = Array.isArray(vaccines)
          ? vaccines.filter((item) => item?.status === "Hoạt động")
          : [];

        this.dogs = Array.isArray(dogs) ? dogs : [];
      } catch (error) {
        console.error("Lỗi lấy danh sách chó:", error);
        alert("Không thể tải danh sách hồ sơ chó.");
      } finally {
        this.loading = false;
      }
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
      if (status === "Đã duyệt") return "badge-primary";
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
  },

  mounted() {
    this.loadPageData();
  },
};
</script>

<style scoped>
.summary-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.summary-box {
  border-radius: 14px;
  padding: 14px 16px;
  color: #fff;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.summary-value {
  font-size: 1.35rem;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 6px;
}

.summary-label {
  font-size: 0.88rem;
  font-weight: 600;
}

.summary-waiting {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.summary-confirmed {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
}

.summary-failed {
  background: linear-gradient(135deg, #f97316, #ea580c);
}

.summary-cancelled {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.admin-dog-table {
  min-width: 1480px;
}

.dog-thumb {
  width: 54px;
  height: 54px;
  object-fit: cover;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 7px 12px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 800;
  white-space: nowrap;
}

.reject-note {
  color: #dc2626;
  font-size: 0.76rem;
  font-style: italic;
  line-height: 1.25;
  max-width: 140px;
}

.detail-main-image {
  width: 100%;
  max-height: 255px;
  object-fit: cover;
  border-radius: 14px;
  border: 1px solid #dee2e6;
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
  background: #eef2ff;
  color: #4f46e5;
  border: 1px solid #c7d2fe;
  font-weight: 700;
  font-size: 0.86rem;
}

.code-chip-blue {
  background: #e0f2fe;
  color: #0369a1;
  border-color: #bae6fd;
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

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.info-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 14px 16px;
  min-height: 82px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.info-card small {
  display: block;
  color: #6b7280;
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

.empty-vaccine-box {
  padding: 14px 16px;
  border-radius: 12px;
  background: #f8fafc;
  color: #667085;
  border: 1px dashed #dbe4ef;
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
  border: 1px solid #dbeafe;
  background: #eff6ff;
  border-radius: 12px;
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
  color: #1d4ed8;
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
  border-color: #86b7fe;
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.12);
}

@media (max-width: 1199.98px) {
  .summary-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 991.98px) {
  .info-grid {
    grid-template-columns: 1fr;
  }

  .detail-main-image {
    max-height: 220px;
  }
}

@media (max-width: 767.98px) {
  .summary-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 575.98px) {
  .summary-row {
    grid-template-columns: 1fr;
  }
}
</style>