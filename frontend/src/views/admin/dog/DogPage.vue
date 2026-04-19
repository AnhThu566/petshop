<template>
  <div class="card shadow-sm border-0 animate__animated animate__fadeIn">
    <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center flex-wrap">
      <h5 class="mb-0 text-primary font-weight-bold">
        <i class="fas fa-paw mr-2"></i> QUẢN LÝ & PHÊ DUYỆT HỒ SƠ CHÓ
      </h5>

      <button
        class="btn btn-outline-primary btn-sm font-weight-bold mt-2 mt-md-0"
        @click="loadPageData"
      >
        <i class="fas fa-sync-alt mr-1"></i> Làm mới
      </button>
    </div>

    <div class="card-body p-4">
      <div class="row mb-4">
        <div class="col-md-4 mb-3 mb-md-0">
          <div class="input-group shadow-sm">
            <input
              type="text"
              class="form-control border-right-0"
              placeholder="Tìm tên chó, mã chó, trại..."
              v-model.trim="searchText"
            />
            <div class="input-group-append">
              <button class="btn btn-primary px-3" type="button">
                <i class="fas fa-search"></i>
              </button>
            </div>
          </div>
        </div>

        <div class="col-md-4 mb-3 mb-md-0">
          <select class="form-control shadow-sm" v-model="filterApprovalStatus">
            <option value="Tất cả">Tất cả trạng thái duyệt</option>
            <option value="Chờ duyệt">Chờ duyệt</option>
            <option value="Cần bổ sung">Cần bổ sung</option>
            <option value="Đã duyệt">Đã duyệt</option>
            <option value="Từ chối">Từ chối</option>
          </select>
        </div>

        <div class="col-md-4">
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

      <div class="summary-row mb-4">
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

      <div v-if="loading" class="text-center py-5 text-muted">
        <i class="fas fa-spinner fa-spin fa-2x mb-3"></i>
        <div>Đang tải danh sách hồ sơ chó...</div>
      </div>

      <div v-else class="table-responsive mt-3">
        <table class="table table-bordered table-hover mb-0 text-center align-middle">
          <thead class="bg-light text-secondary">
            <tr class="text-uppercase font-weight-bold" style="font-size: 0.85rem;">
              <th style="width: 5%;">STT</th>
              <th style="width: 8%;">Hình ảnh</th>
              <th style="width: 10%;">Mã chó</th>
              <th style="width: 16%;" class="text-left">Tên chó</th>
              <th style="width: 12%;">Nguồn cung</th>
              <th style="width: 11%;">Giống chó</th>
              <th style="width: 10%;">Ngày sinh</th>
              <th style="width: 10%;">Giá đề xuất</th>
              <th style="width: 10%;">Duyệt hồ sơ</th>
              <th style="width: 10%;">Trạng thái bán</th>
              <th style="width: 8%;">Thao tác</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(dog, index) in filteredDogs" :key="dog._id || dog.id" class="align-middle">
              <td>{{ index + 1 }}</td>

              <td>
                <img
                  :src="getDogImage(dog)"
                  class="img-thumbnail rounded-circle object-fit-cover shadow-sm"
                  style="width: 52px; height: 52px;"
                />
              </td>

              <td class="font-weight-bold text-primary">{{ dog.maCho || "---" }}</td>
              <td class="font-weight-bold text-dark text-left">{{ dog.name || "---" }}</td>
              <td class="text-secondary font-weight-bold">{{ dog.farmId?.name || "---" }}</td>
              <td class="text-info font-weight-bold">{{ dog.breedId?.name || "---" }}</td>
              <td class="text-primary font-weight-bold">{{ formatDate(dog.birthDate) }}</td>
              <td class="text-danger font-weight-bold">
  {{ formatCurrency(dog.proposedPrice || dog.price) }}
</td>

              <td>
                <span :class="getApprovalStatusClass(dog.approvalStatus)" class="badge px-3 py-2 shadow-sm mb-1">
                  {{ dog.approvalStatus }}
                </span>
                <div
                  v-if="['Cần bổ sung', 'Từ chối'].includes(dog.approvalStatus) && dog.rejectionReason"
                  class="text-danger small font-italic mt-1"
                  style="line-height: 1.2;"
                >
                  {{ dog.rejectionReason }}
                </div>
              </td>

              <td>
                <span :class="getSaleStatusClass(dog.saleStatus)" class="badge px-3 py-2 shadow-sm">
                  {{ dog.saleStatus }}
                </span>
              </td>

              <td>
                <button
                  class="btn btn-sm btn-info shadow-sm font-weight-bold px-3"
                  @click="viewDetail(dog)"
                  title="Xem chi tiết"
                >
                  <i class="fas fa-eye mr-1"></i> Xem
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

    <!-- POPUP CHI TIẾT HỒ SƠ -->
    <div
      v-if="showDetailModal"
      class="modal fade show"
      tabindex="-1"
      style="display: block; background: rgba(0,0,0,0.5);"
    >
      <div class="modal-dialog modal-xl border-0 modal-dialog-centered modal-dialog-scrollable dog-detail-dialog">
        <div class="modal-content shadow-lg border-0 dog-detail-content" v-if="selectedDog">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title font-weight-bold">
              <i class="fas fa-paw mr-2"></i>
              CHI TIẾT HỒ SƠ: {{ selectedDog.name }}
            </h5>
            <button type="button" class="close text-white" @click="closeDetailModal">
              <span>&times;</span>
            </button>
          </div>

          <div class="modal-body p-4">
            <div class="row detail-layout">
              <div class="col-lg-4 detail-left-panel">
                <div class="detail-side-card text-center">
                  <img
                    :src="getDogImage(selectedDog)"
                    class="img-fluid rounded shadow-sm mb-3 detail-main-image"
                  />

                  <h4 class="text-primary font-weight-bold mb-1">
                    {{ selectedDog.name || "---" }}
                  </h4>

                  <div class="detail-code mb-3">
                    Mã chó: {{ selectedDog.maCho || "---" }}
                  </div>

                  <span class="badge badge-pill badge-light border px-3 py-2 mb-3">
                    {{ selectedDog.breedId?.name || "Chưa cập nhật giống" }}
                  </span>

                  <div class="detail-meta-list mt-2 text-left">
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

                    <div class="detail-meta-item">
                      <i class="fas fa-birthday-cake text-warning mr-2"></i>
                      <span><strong>Ngày sinh:</strong> {{ formatDate(selectedDog.birthDate) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-lg-8 detail-right-panel">
                <h6 class="section-heading text-success">THÔNG TIN CƠ BẢN</h6>
                <div class="info-grid mt-3">
                  <div class="info-card">
                    <small class="text-muted d-block">Giới tính</small>
                    <strong class="text-dark">{{ selectedDog.gender || "---" }}</strong>
                  </div>

                  <div class="info-card">
                    <small class="text-muted d-block">Cân nặng</small>
                    <strong class="text-dark">{{ selectedDog.weight || "---" }} kg</strong>
                  </div>

                  <div class="info-card">
                    <small class="text-muted d-block">Giá đề xuất từ trại</small>
                    <strong class="text-primary">
                      {{ formatCurrency(selectedDog.proposedPrice || selectedDog.price) }}
                    </strong>
                  </div>


                  <div class="info-card info-card-full">
                    <small class="text-muted d-block">Mô tả</small>
                    <div class="text-dark content-text">
                      {{ selectedDog.description || "Chưa có mô tả." }}
                    </div>
                  </div>
                </div>

                <h6 class="section-heading text-danger mt-4">SỨC KHỎE THAM KHẢO</h6>
                <div class="info-grid mt-3">
                  <div class="info-card">
                    <small class="text-muted d-block">Tình trạng sức khỏe</small>
                    <strong class="text-dark">{{ selectedDog.healthStatus || "Tốt" }}</strong>
                  </div>

                  <div class="info-card">
                    <small class="text-muted d-block">Ngày tẩy giun gần nhất</small>
                    <strong class="text-dark">{{ formatDate(selectedDog.lastDeworming) }}</strong>
                  </div>

                  <div class="info-card" v-if="selectedDog.healthRecord">
                    <small class="text-muted d-block">Người kiểm tra</small>
                    <strong class="text-dark">{{ selectedDog.healthRecord.checkedBy || "---" }}</strong>
                  </div>

                  <div class="info-card" v-if="selectedDog.healthRecord">
                    <small class="text-muted d-block">Ngày kiểm tra</small>
                    <strong class="text-dark">{{ formatDateTime(selectedDog.healthRecord.checkedAt) }}</strong>
                  </div>

                  <div class="info-card info-card-full" v-if="selectedDog.healthRecord">
                    <small class="text-muted d-block">Ghi chú hồ sơ sức khỏe</small>
                    <div class="content-text">
                      {{ selectedDog.healthRecord.medicalNotes || selectedDog.healthRecord.reviewNote || "---" }}
                    </div>
                  </div>
                </div>

                <div class="vaccine-section mt-4">
                  <div class="vaccine-title">
                    <i class="fas fa-syringe mr-2"></i>CHI TIẾT VACCINE
                  </div>

                  <div
                    v-if="selectedDog.healthRecord && selectedDog.healthRecord.vaccines && selectedDog.healthRecord.vaccines.length"
                    class="table-responsive mt-3"
                  >
                    <table class="table table-bordered vaccine-table mb-0">
                      <thead>
                        <tr>
                          <th style="width: 38%;">Tên vaccine</th>
                          <th style="width: 20%;">Ngày tiêm</th>
                          <th style="width: 20%;">Nhắc lại</th>
                          <th style="width: 22%;">Ghi chú</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="(vaccine, index) in selectedDog.healthRecord.vaccines"
                          :key="index"
                        >
                          <td class="font-weight-bold text-dark">
                            {{ vaccine.vaccineName || vaccine.vaccineCode || "---" }}
                          </td>
                          <td>{{ formatDate(vaccine.dateInjected) }}</td>
                          <td>
                            {{
                              vaccine.needsReminder
                                ? formatDate(vaccine.nextDueDate)
                                : "Không"
                            }}
                          </td>
                          <td>{{ vaccine.note || "---" }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div v-else class="empty-vaccine-box mt-3">
                    Chưa có dữ liệu vaccine chi tiết.
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
              ĐÓNG
            </button>

            <div class="d-flex flex-wrap" v-if="selectedDog">
              <template v-if="selectedDog.approvalStatus === 'Chờ duyệt' || selectedDog.approvalStatus === 'Cần bổ sung'">
                <button
                  class="btn btn-outline-warning font-weight-bold mr-2 shadow-sm mb-2"
                  @click="openResponseModal(selectedDog, 'Cần bổ sung')"
                >
                  <i class="fas fa-reply mr-1"></i> YÊU CẦU BỔ SUNG
                </button>

                <button
                  class="btn btn-outline-danger font-weight-bold mr-2 shadow-sm mb-2"
                  @click="openResponseModal(selectedDog, 'Từ chối')"
                >
                  <i class="fas fa-times mr-1"></i> TỪ CHỐI
                </button>

                <button
                  class="btn btn-success font-weight-bold shadow-sm px-4 mb-2"
                  @click="openApproveModal(selectedDog)"
                >
                  <i class="fas fa-check mr-1"></i> PHÊ DUYỆT
                </button>
              </template>

              <template v-else-if="canStopSale(selectedDog)">
                <button
                  class="btn btn-outline-danger font-weight-bold shadow-sm px-4 mb-2"
                  @click="updateSaleStatus(selectedDog, 'Ngừng bán')"
                >
                  <i class="fas fa-ban mr-1"></i> NGỪNG BÁN
                </button>
              </template>

              <div v-else class="text-muted font-italic font-weight-bold d-flex align-items-center mb-2">
                <i class="fas fa-check-double mr-1 text-success"></i> Đã xử lý / đang giao dịch
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- POPUP PHẢN HỒI -->
    <div
      v-if="showResponseModal"
      class="modal fade show"
      tabindex="-1"
      style="display: block; background: rgba(0,0,0,0.5);"
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
                  ? "TỪ CHỐI HỒ SƠ CHÓ"
                  : "YÊU CẦU BỔ SUNG"
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
              HỦY
            </button>
            <button
              class="btn font-weight-bold text-white"
              :class="responseForm.approvalStatus === 'Từ chối' ? 'btn-danger' : 'btn-warning'"
              @click="submitResponse"
            >
              {{
                responseForm.approvalStatus === "Từ chối"
                  ? "XÁC NHẬN TỪ CHỐI"
                  : "GỬI YÊU CẦU BỔ SUNG"
              }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- POPUP CHỐT GIÁ & MỞ BÁN -->
    <div
      v-if="showApproveModal"
      class="modal fade show"
      tabindex="-1"
      style="display: block; background: rgba(0,0,0,0.55);"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg approve-modal-content">
          <div class="modal-header bg-success text-white">
            <h5 class="modal-title font-weight-bold">
              <i class="fas fa-check-circle mr-2"></i>PHÊ DUYỆT & MỞ BÁN
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
                v-if="Number(approveForm.finalPrice || 0) < Number(approveForm.proposedPrice || 0)"
                class="text-danger font-weight-bold"
              >
                Giá bán chính thức phải lớn hơn hoặc bằng giá đề xuất từ trang trại.
              </small>

              <small
                v-else-if="Number(approveForm.finalPrice || 0) > 0"
                class="text-success font-weight-bold"
              >
                Giá hợp lệ để xác nhận mở bán.
              </small>

              <small
                v-else
                class="text-muted font-weight-bold"
              >
                Vui lòng nhập giá bán chính thức.
              </small>
            </div>
          </div>

          <div class="modal-footer bg-light">
            <button class="btn btn-secondary font-weight-bold" @click="closeApproveModal">
              HỦY
            </button>
            <button
              class="btn btn-success font-weight-bold"
              :disabled="!isApproveModalPriceValid"
              @click="confirmApproveDog"
            >
              XÁC NHẬN MỞ BÁN
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
</template>

<script>
import DogService from "@/services/dog.service";
import DogHealthRecordService from "@/services/dogHealthRecord.service";

export default {
  name: "AdminDogPage",

  data() {
    return {
      dogs: [],
      healthRecords: [],
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
            dog.maCho?.toLowerCase().includes(term) ||
            dog.farmId?.name?.toLowerCase().includes(term)
        );
      }

      return result;
    },

    isApproveModalPriceValid() {
      const proposed = Number(this.approveForm.proposedPrice || 0);
      const finalPrice = Number(this.approveForm.finalPrice || 0);
      return finalPrice >= proposed && finalPrice > 0;
    },
  },

  methods: {
    async loadPageData() {
      try {
        this.loading = true;
        const [dogs, healthRecords] = await Promise.all([
          DogService.getAll(),
          DogHealthRecordService.getAll(),
        ]);

        this.healthRecords = Array.isArray(healthRecords) ? healthRecords : [];

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
        proposedPrice: Number(dog?.proposedPrice || dog?.price || 0),
        finalPrice: Number(dog?.price || dog?.proposedPrice || 0),
      };
      this.showApproveModal = true;
    },

    closeApproveModal() {
      this.showApproveModal = false;
      this.approveForm = {
        dogId: "",
        dogName: "",
        proposedPrice: 0,
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

      const proposed = Number(this.approveForm.proposedPrice || 0);
      const finalPrice = Number(this.approveForm.finalPrice || 0);

      if (!finalPrice || finalPrice <= 0) {
        alert("❌ Vui lòng nhập giá bán chính thức hợp lệ.");
        return;
      }

      if (finalPrice < proposed) {
        alert("❌ Giá bán chính thức phải lớn hơn hoặc bằng giá đề xuất từ trang trại.");
        return;
      }

      if (!confirm("Bạn có chắc chắn muốn phê duyệt hồ sơ và mở bán bé chó này không?")) return;

      try {
        await DogService.updateApprovalStatus(id, {
          approvalStatus: "Đã duyệt",
          saleStatus: "Sẵn sàng bán",
          isPublished: true,
          price: finalPrice,
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

    formatDateTime(date) {
      if (!date) return "---";
      return new Date(date).toLocaleString("vi-VN");
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
.object-fit-cover {
  object-fit: cover;
}

.dog-detail-dialog {
  max-width: 1140px;
}

.dog-detail-content {
  max-height: calc(100vh - 32px);
  display: flex;
  flex-direction: column;
  border-radius: 18px;
}

.dog-detail-content .modal-header,
.dog-detail-content .modal-footer {
  flex-shrink: 0;
}

.dog-detail-content .modal-body {
  overflow-y: auto;
  background: #f8fbff;
}

.detail-left-panel,
.detail-right-panel {
  margin-bottom: 12px;
}

.detail-side-card {
  background: #fff;
  border: 1px solid #e8edf5;
  border-radius: 18px;
  padding: 20px;
  height: 100%;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
}

.detail-main-image {
  width: 100%;
  max-height: 255px;
  object-fit: cover;
  border-radius: 16px;
}

.detail-code {
  font-size: 0.95rem;
  color: #64748b;
  font-weight: 600;
}

.detail-meta-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-meta-item {
  display: flex;
  align-items: flex-start;
  font-size: 0.95rem;
  color: #334155;
  line-height: 1.45;
}

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
  font-size: 1.5rem;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 6px;
}

.summary-label {
  font-size: 0.9rem;
  font-weight: 600;
}

.summary-pending {
  background: linear-gradient(135deg, #f0ad4e, #d9941b);
}

.summary-need-fix {
  background: linear-gradient(135deg, #ff9800, #e67e00);
}

.summary-approved {
  background: linear-gradient(135deg, #28a745, #1d7f35);
}

.summary-rejected {
  background: linear-gradient(135deg, #dc3545, #b32231);
}

.section-heading {
  font-weight: 800;
  border-bottom: 2px solid #ebf0f7;
  padding-bottom: 10px;
  margin-bottom: 0;
  letter-spacing: 0.3px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.info-card {
  background: #fff;
  border: 1px solid #e8edf3;
  border-radius: 14px;
  padding: 14px 16px;
  min-height: 82px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.03);
}

.info-card-full {
  grid-column: 1 / -1;
}

.content-text {
  line-height: 1.6;
  color: #334155;
  margin-top: 4px;
}

.vaccine-section {
  background: #fff;
  border: 1px solid #e8edf3;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.03);
}

.vaccine-title {
  font-weight: 800;
  color: #dc2626;
  display: flex;
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 1px solid #edf2f7;
}

.vaccine-table thead th {
  background: #f8fafc;
  color: #475569;
  font-size: 0.85rem;
  text-transform: uppercase;
  vertical-align: middle;
}

.vaccine-table td,
.vaccine-table th {
  vertical-align: middle;
}

.empty-vaccine-box {
  padding: 14px 16px;
  border-radius: 12px;
  background: #f8fafc;
  color: #64748b;
  border: 1px dashed #d7e0ea;
}

.response-modal-content,
.approve-modal-content {
  border-radius: 16px;
}

.response-textarea {
  border-radius: 12px;
  min-height: 120px;
}

.approve-dog-name {
  font-size: 1.2rem;
  font-weight: 800;
  color: #1f2937;
}

.approve-info-box {
  border: 1px solid #dbeafe;
  background: #f8fbff;
  border-radius: 14px;
  padding: 14px 16px;
}

.approve-info-label {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 700;
  margin-bottom: 6px;
}

.approve-info-value {
  font-size: 1.05rem;
  font-weight: 800;
  color: #2563eb;
}

.approve-price-input {
  min-height: 46px;
  border-radius: 12px;
  border: 1px solid #dbe4f0;
  box-shadow: none;
  font-weight: 700;
}

.approve-price-input:focus {
  border-color: #16a34a;
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.12);
}

@media (max-width: 991.98px) {
  .summary-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .detail-main-image {
    max-height: 220px;
  }
}

@media (max-width: 767.98px) {
  .dog-detail-content {
    max-height: calc(100vh - 16px);
  }
}

@media (max-width: 575.98px) {
  .summary-row {
    grid-template-columns: 1fr;
  }

  .dog-detail-content .modal-body {
    padding: 16px !important;
  }

  .detail-side-card,
  .info-card,
  .vaccine-section,
  .approve-info-box {
    border-radius: 12px;
  }
}
</style>