<template>
  <div class="farm-dogs-page bg-light py-4" style="min-height: 100vh;">
    <div class="container-fluid">
      <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3 flex-wrap">
        <h4 class="font-weight-bold text-dark mb-2">
          <i class="fas fa-dog text-success mr-2"></i>
          HỒ SƠ CHÓ ĐÃ CUNG CẤP
        </h4>

        <div>
          <button class="btn btn-outline-success btn-sm mr-2" @click="loadPageData" :disabled="loading">
            <i class="fas fa-sync-alt mr-1"></i> Làm mới
          </button>
          <router-link to="/farm/add-dog" class="btn btn-success btn-sm">
            <i class="fas fa-plus mr-1"></i> Cung cấp hồ sơ chó
          </router-link>
        </div>
      </div>

      <div class="card border-0 shadow-sm mb-4 dashboard-filter-card">
        <div class="card-body py-3">
          <div class="row align-items-center">
            <div class="col-md-4 mb-2 mb-md-0">
              <div class="input-group input-group-sm">
                <div class="input-group-prepend">
                  <span class="input-group-text bg-white border-right-0">
                    <i class="fas fa-search text-success"></i>
                  </span>
                </div>
                <input
                  type="text"
                  class="form-control border-left-0"
                  placeholder="Tìm tên chó hoặc mã chó..."
                  v-model.trim="searchText"
                />
              </div>
            </div>

            <div class="col-md-4 mb-2 mb-md-0">
              <select class="form-control form-control-sm" v-model="approvalFilter">
                <option value="Tất cả">Tất cả duyệt hồ sơ chó</option>
                <option value="Chờ duyệt">Chờ duyệt</option>
                <option value="Cần bổ sung">Cần bổ sung</option>
                <option value="Đã duyệt">Đã duyệt</option>
                <option value="Từ chối">Từ chối</option>
              </select>
            </div>

            <div class="col-md-4">
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
      </div>

      <div class="row mb-4">
        <div class="col-md-3 mb-3">
          <div class="card border-0 shadow-sm text-center py-3 stat-card">
            <div class="small text-muted">Chờ duyệt</div>
            <h4 class="font-weight-bold text-warning mb-0">{{ stats.pending }}</h4>
          </div>
        </div>

        <div class="col-md-3 mb-3">
          <div class="card border-0 shadow-sm text-center py-3 stat-card">
            <div class="small text-muted">Cần bổ sung</div>
            <h4 class="font-weight-bold text-danger mb-0">{{ stats.needFix }}</h4>
          </div>
        </div>

        <div class="col-md-3 mb-3">
          <div class="card border-0 shadow-sm text-center py-3 stat-card">
            <div class="small text-muted">Đã duyệt</div>
            <h4 class="font-weight-bold text-success mb-0">{{ stats.approved }}</h4>
          </div>
        </div>

        <div class="col-md-3 mb-3">
          <div class="card border-0 shadow-sm text-center py-3 stat-card">
            <div class="small text-muted">Đã bán</div>
            <h4 class="font-weight-bold text-dark mb-0">{{ stats.sold }}</h4>
          </div>
        </div>
      </div>

      <div v-if="loading" class="card border-0 shadow-sm">
        <div class="card-body text-center py-5 text-muted">
          <i class="fas fa-spinner fa-spin fa-3x mb-3 d-block"></i>
          Đang tải hồ sơ chó...
        </div>
      </div>

      <div v-else-if="filteredDogs.length > 0" class="card border-0 shadow-sm">
        <div class="table-responsive">
          <table class="table table-hover align-middle text-center mb-0 dashboard-table">
            <thead class="bg-light">
              <tr class="small text-secondary">
                <th class="py-3 action-col">Thao tác</th>
                <th class="py-3 image-col">Ảnh</th>
                <th class="py-3 code-col">Mã chó</th>
                <th class="py-3 name-col">Tên</th>
                <th class="py-3 breed-col">Giống</th>
                <th class="py-3 price-col">Giá đề xuất</th>
                <th class="py-3 approval-col">Duyệt hồ sơ chó</th>
                <th class="py-3 sale-col">Trạng thái bán</th>
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
                  {{ dog.maCho || "---" }}
                </td>

                <td class="font-weight-bold text-dark name-col">
                  {{ dog.name || "---" }}
                </td>

                <td class="breed-col">
                  {{ dog.breedId?.name || "---" }}
                </td>

                <td class="text-danger font-weight-bold price-col">
                  {{ formatCurrency(dog.proposedPrice || dog.price) }}
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

      <div v-else class="card border-0 shadow-sm">
        <div class="card-body text-center py-5 text-muted">
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

            <div class="modal-body p-4">
              <div class="row align-items-start">
                <div class="col-lg-4 mb-4">
                  <img
                    :src="getDogImage(selectedDog)"
                    class="img-fluid rounded shadow-sm detail-image"
                    alt="dog"
                  />
                </div>

                <div class="col-lg-8">
                  <div class="detail-grid compact-grid">
                    <div class="detail-item">
                      <label>Tên chó</label>
                      <div>{{ selectedDog.name || "---" }}</div>
                    </div>

                    <div class="detail-item">
                      <label>Mã chó</label>
                      <div>{{ selectedDog.maCho || "---" }}</div>
                    </div>

                    <div class="detail-item">
                      <label>Giống</label>
                      <div>{{ selectedDog.breedId?.name || "---" }}</div>
                    </div>

                    <div class="detail-item">
                      <label>Giá đề xuất của trại</label>
                      <div>{{ formatCurrency(selectedDog.proposedPrice || selectedDog.price) }}</div>
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
                      <label>Cân nặng</label>
                      <div>{{ selectedDog.weight ? selectedDog.weight + " kg" : "---" }}</div>
                    </div>

                    <div class="detail-item">
                      <label>Ghi chú admin</label>
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
                    <label>Ghi chú nguồn gốc</label>
                    <div class="detail-text">{{ selectedDog.sourceNotes || "---" }}</div>
                  </div>

                  <div class="detail-block mt-3">
                    <label>Ghi chú sức khỏe</label>
                    <div class="detail-text">{{ selectedDog.healthNote || "---" }}</div>
                  </div>
                </div>
              </div>

              <div class="health-section mt-4">
                <h6 class="font-weight-bold text-success mb-3">Tóm tắt hồ sơ sức khỏe</h6>

                <div class="detail-grid compact-grid">
                  <div class="detail-item">
                    <label>Người kiểm tra</label>
                    <div>{{ selectedDog.healthRecord?.checkedBy || "---" }}</div>
                  </div>

                  <div class="detail-item">
                    <label>Ngày kiểm tra</label>
                    <div>{{ formatDateTime(selectedDog.healthRecord?.checkedAt) }}</div>
                  </div>

                  <div class="detail-item">
                    <label>Tình trạng tổng quát</label>
                    <div>{{ selectedDog.healthRecord?.generalCondition || "---" }}</div>
                  </div>

                  <div class="detail-item">
                    <label>Ngày tẩy giun gần nhất</label>
                    <div>{{ formatDateOnly(selectedDog.healthRecord?.lastDewormingDate || selectedDog.lastDeworming) }}</div>
                  </div>
                </div>

                <div
                  v-if="selectedDog.healthRecord?.reviewNote"
                  class="detail-block mt-3"
                >
                  <label>Phản hồi admin hồ sơ sức khỏe</label>
                  <div class="detail-text">{{ selectedDog.healthRecord.reviewNote }}</div>
                </div>

                <div
                  v-if="selectedDog.healthRecord?.medicalNotes"
                  class="detail-block mt-3"
                >
                  <label>Ghi chú y tế</label>
                  <div class="detail-text">{{ selectedDog.healthRecord.medicalNotes }}</div>
                </div>

                <div
                  v-if="selectedDog.healthRecord?.vaccines?.length"
                  class="detail-block mt-3"
                >
                  <label>Danh sách vaccine</label>
                  <ul class="pl-3 mb-0">
                    <li
                      v-for="(vaccine, index) in selectedDog.healthRecord.vaccines"
                      :key="`${index}-${vaccine.vaccineName}`"
                      class="mb-1"
                    >
                      {{ vaccine.vaccineName || "---" }}
                      <span v-if="vaccine.vaccineCode"> ({{ vaccine.vaccineCode }})</span>
                      - {{ formatDateOnly(vaccine.dateInjected) }}
                      <span v-if="vaccine.nextDueDate">
                        - nhắc lại: {{ formatDateOnly(vaccine.nextDueDate) }}
                      </span>
                      <span v-if="vaccine.note"> - ghi chú: {{ vaccine.note }}</span>
                    </li>
                  </ul>
                </div>

                <div v-else class="detail-block mt-3">
                  <label>Danh sách vaccine</label>
                  <div class="detail-text">Chưa có vaccine nào được cập nhật.</div>
                </div>
              </div>
            </div>

            <div class="modal-footer farm-modal-footer">
              <button class="btn btn-outline-secondary px-4" @click="closeDetailModal">Đóng</button>
            </div>
          </div>
        </div>
      </div>

      <!-- POPUP CHỈNH SỬA HỒ SƠ -->
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

            <div class="modal-body p-4">
              <div class="alert alert-warning soft-alert">
                Khi chỉnh sửa hồ sơ, hệ thống sẽ đưa hồ sơ về trạng thái
                <strong>Chờ duyệt</strong> để admin kiểm tra lại.
              </div>

              <div
                v-if="manageDog.currentFeedback"
                class="alert alert-danger soft-alert"
              >
                <strong>Phản hồi hiện tại từ admin:</strong> {{ manageDog.currentFeedback }}
              </div>

              <div class="manage-tab-bar mb-4">
                <button
                  class="manage-tab-btn"
                  :class="{ active: activeManageTab === 'dog' }"
                  @click="activeManageTab = 'dog'"
                >
                  <i class="fas fa-dog mr-2"></i>Thông tin chó
                </button>

                <button
                  class="manage-tab-btn"
                  :class="{ active: activeManageTab === 'health' }"
                  @click="activeManageTab = 'health'"
                >
                  <i class="fas fa-notes-medical mr-2"></i>Hồ sơ sức khỏe
                </button>
              </div>

              <div v-if="activeManageTab === 'dog'">
                <div class="row form-equal-row">
                  <div class="col-md-6 mb-3">
                    <label class="popup-label">Tên chó</label>
                    <input type="text" class="form-control popup-input" v-model="manageDog.name" />
                  </div>

                  <div class="col-md-6 mb-3">
                    <label class="popup-label">Giá đề xuất từ trang trại</label>
                    <input
                      type="number"
                      class="form-control popup-input"
                      v-model="manageDog.proposedPrice"
                    />
                  </div>

                  <div class="col-md-6 mb-3">
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

                  <div class="col-md-6 mb-3">
                    <label class="popup-label">Giới tính</label>
                    <select class="form-control popup-input" v-model="manageDog.gender">
                      <option value="Đực">Đực</option>
                      <option value="Cái">Cái</option>
                    </select>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label class="popup-label">Ngày sinh</label>
                    <input type="date" class="form-control popup-input" v-model="manageDog.birthDate" />
                  </div>

                  <div class="col-md-6 mb-3">
                    <label class="popup-label">Cân nặng (kg)</label>
                    <input type="number" step="0.1" class="form-control popup-input" v-model="manageDog.weight" />
                  </div>

                  <div class="col-md-12 mb-3">
                    <label class="popup-label">Mô tả</label>
                    <textarea class="form-control popup-input popup-textarea" rows="3" v-model="manageDog.description"></textarea>
                  </div>

                  <div class="col-md-12 mb-3">
                    <label class="popup-label">Ghi chú nguồn gốc</label>
                    <textarea class="form-control popup-input popup-textarea" rows="2" v-model="manageDog.sourceNotes"></textarea>
                  </div>

                  <div class="col-md-12 mb-0">
                    <label class="popup-label">Ghi chú sức khỏe</label>
                    <textarea class="form-control popup-input popup-textarea" rows="2" v-model="manageDog.healthNote"></textarea>
                  </div>
                </div>
              </div>

              <div v-if="activeManageTab === 'health'">
                <div class="row form-equal-row">
                  <div class="col-md-6 mb-3">
                    <label class="popup-label">Người kiểm tra</label>
                    <input v-model="healthForm.checkedBy" type="text" class="form-control popup-input" />
                  </div>

                  <div class="col-md-6 mb-3">
                    <label class="popup-label">Ngày kiểm tra</label>
                    <input v-model="healthForm.checkedAt" type="datetime-local" class="form-control popup-input" />
                  </div>

                  <div class="col-md-4 mb-3">
                    <label class="popup-label">Cân nặng (kg)</label>
                    <input v-model="healthForm.weight" type="number" step="0.1" min="0" class="form-control popup-input" />
                  </div>

                  <div class="col-md-4 mb-3">
                    <label class="popup-label">Nhiệt độ cơ thể</label>
                    <input v-model="healthForm.bodyTemperature" type="number" step="0.1" min="0" class="form-control popup-input" />
                  </div>

                  <div class="col-md-4 mb-3">
                    <label class="popup-label">Ngày tẩy giun gần nhất</label>
                    <input v-model="healthForm.lastDewormingDate" type="date" class="form-control popup-input" />
                  </div>

                  <div class="col-md-6 mb-3">
                    <label class="popup-label">Tình trạng tổng quát</label>
                    <input v-model="healthForm.generalCondition" type="text" class="form-control popup-input" />
                  </div>

                  <div class="col-md-6 mb-3">
                    <label class="popup-label">Dấu hiệu bất thường</label>
                    <textarea v-model="healthForm.abnormalSigns" rows="2" class="form-control popup-input popup-textarea-small"></textarea>
                  </div>

                  <div class="col-md-12 mb-3">
                    <label class="popup-label">Ghi chú y tế</label>
                    <textarea v-model="healthForm.medicalNotes" rows="3" class="form-control popup-input popup-textarea"></textarea>
                  </div>

                  <div class="col-md-12 mb-3">
                    <label class="popup-label">Khuyến nghị</label>
                    <input v-model="healthForm.recommendation" type="text" class="form-control popup-input" />
                  </div>

                  <div class="col-md-12 mt-2 mb-2">
                    <div class="d-flex justify-content-between align-items-center flex-wrap">
                      <label class="popup-label mb-2 mb-md-0">Danh sách vaccine</label>
                      <button
                        type="button"
                        class="btn btn-sm btn-outline-success"
                        @click="addVaccineRow"
                      >
                        <i class="fas fa-plus mr-1"></i> Thêm vaccine
                      </button>
                    </div>
                  </div>

                  <div class="col-md-12" v-if="healthForm.vaccines.length">
                    <div
                      v-for="(vaccine, index) in healthForm.vaccines"
                      :key="`vaccine-${index}`"
                      class="vaccine-box"
                    >
                      <div class="d-flex justify-content-between align-items-center mb-3">
                        <strong class="text-success">Mũi vaccine {{ index + 1 }}</strong>
                        <button
                          type="button"
                          class="btn btn-sm btn-outline-danger"
                          @click="removeVaccineRow(index)"
                        >
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>

                      <div class="row form-equal-row">
                        <div class="col-md-6 mb-3">
                          <label class="popup-label">Tên vaccine</label>
                          <select v-model="vaccine.vaccineId" class="form-control popup-input">
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

                        <div class="col-md-6 mb-3">
                          <label class="popup-label">Ngày tiêm</label>
                          <input
                            v-model="vaccine.dateInjected"
                            type="date"
                            class="form-control popup-input"
                          />
                        </div>

                        <div class="col-md-6 mb-3">
                          <label class="popup-label">Ngày nhắc lại</label>
                          <input
                            v-model="vaccine.nextDueDate"
                            type="date"
                            class="form-control popup-input"
                            :disabled="!vaccine.needsReminder"
                          />
                        </div>

                        <div class="col-md-6 mb-3 d-flex align-items-end">
                          <div class="custom-control custom-switch mb-2">
                            <input
                              :id="`vaccineReminder-${index}`"
                              v-model="vaccine.needsReminder"
                              type="checkbox"
                              class="custom-control-input"
                            />
                            <label
                              class="custom-control-label"
                              :for="`vaccineReminder-${index}`"
                            >
                              Cần nhắc lại
                            </label>
                          </div>
                        </div>

                        <div class="col-md-12 mb-0">
                          <label class="popup-label">Ghi chú vaccine</label>
                          <textarea
                            v-model="vaccine.note"
                            rows="2"
                            class="form-control popup-input popup-textarea-small"
                            placeholder="VD: bé phản ứng tốt sau tiêm, theo dõi thêm..."
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="col-md-12" v-else>
                    <div class="alert alert-light border text-muted">
                      Chưa có mũi vaccine nào được thêm.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-footer farm-modal-footer">
              <button class="btn btn-outline-secondary px-4" @click="closeManageModal">Hủy</button>
              <button
                v-if="activeManageTab === 'dog'"
                class="btn btn-success px-4"
                @click="saveDogInfo"
              >
                Lưu thông tin chó
              </button>
              <button
                v-else
                class="btn btn-success px-4"
                @click="saveHealthRecord"
              >
                {{ healthForm._id ? "Cập nhật hồ sơ sức khỏe" : "Tạo hồ sơ sức khỏe" }}
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
import DogHealthRecordService from "@/services/dogHealthRecord.service";
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
      activeManageTab: "dog",
      loading: false,

      healthRecords: [],
      healthForm: this.getDefaultHealthForm(),
    };
  },

  computed: {
    filteredDogs() {
      return this.dogs.filter((dog) => {
        const keyword = (this.searchText || "").toLowerCase().trim();
        const dogName = dog.name ? dog.name.toLowerCase() : "";
        const dogCode = dog.maCho ? dog.maCho.toLowerCase() : "";

        const matchSearch =
          !keyword || dogName.includes(keyword) || dogCode.includes(keyword);

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
    getFarmId() {
      return this.currentFarm?.farmId || this.currentFarm?._id || this.currentFarm?.id || "";
    },

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

    getDefaultHealthForm() {
      return {
        _id: "",
        dogId: "",
        farmId: "",
        checkedBy: "",
        checkedAt: "",
        weight: "",
        bodyTemperature: "",
        generalCondition: "",
        appetiteStatus: "",
        digestiveStatus: "",
        respiratoryStatus: "",
        skinCondition: "",
        mobilityStatus: "",
        dewormed: false,
        lastDewormingDate: "",
        abnormalSigns: "",
        medicalNotes: "",
        recommendation: "",
        reviewStatus: "Chờ duyệt",
        reviewNote: "",
        vaccines: [],
      };
    },

    addVaccineRow() {
      this.healthForm.vaccines.push(this.getEmptyVaccine());
    },

    removeVaccineRow(index) {
      this.healthForm.vaccines.splice(index, 1);
    },

    normalizeVaccinesForForm(vaccines = []) {
      if (!Array.isArray(vaccines)) return [];

      return vaccines.map((item) => ({
        vaccineId: item?.vaccineId?._id || item?.vaccineId || "",
        vaccineName: item?.vaccineName || "",
        dateInjected: item?.dateInjected ? this.formatDateForInput(item.dateInjected) : "",
        needsReminder: !!item?.needsReminder,
        nextDueDate: item?.nextDueDate ? this.formatDateForInput(item.nextDueDate) : "",
        note: item?.note || "",
      }));
    },

    normalizeVaccinesForSubmit(vaccines = []) {
      if (!Array.isArray(vaccines)) return [];

      return vaccines
        .map((item) => ({
          vaccineId: String(item?.vaccineId || "").trim(),
          vaccineName: String(item?.vaccineName || "").trim(),
          dateInjected: item?.dateInjected || null,
          needsReminder: !!item?.needsReminder,
          nextDueDate: item?.needsReminder ? (item?.nextDueDate || null) : null,
          note: String(item?.note || "").trim(),
        }))
        .filter((item) => (item.vaccineId || item.vaccineName) && item.dateInjected);
    },

    async loadPageData() {
      await Promise.all([
        this.fetchBreeds(),
        this.fetchVaccines(),
        this.fetchMyDogs(),
        this.fetchHealthRecords(),
      ]);
      this.mergeDogsWithHealthRecords();
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

    async fetchHealthRecords() {
      try {
        const data = await DogHealthRecordService.getAll();
        this.healthRecords = Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Lỗi tải hồ sơ sức khỏe:", error);
        this.healthRecords = [];
      }
    },

    mergeDogsWithHealthRecords() {
      this.dogs = this.dogs.map((dog) => {
        const dogId = dog._id || dog.id;
        const latestHealthRecord = this.healthRecords
          .filter((record) => {
            const recordDogId = record.dogId?._id || record.dogId?.id || record.dogId;
            return String(recordDogId) === String(dogId);
          })
          .sort((a, b) => new Date(b.checkedAt || b.createdAt) - new Date(a.checkedAt || a.createdAt))[0];

        return {
          ...dog,
          healthRecord: latestHealthRecord || null,
        };
      });
    },

    getDogImage(dog) {
      const image = dog?.image;
      if (!image) return "https://via.placeholder.com/500x350";
      if (String(image).startsWith("http")) return image;
      return "http://localhost:3000" + image;
    },

    formatCurrency(value) {
      if (value === null || value === undefined) return "---";
      return Number(value).toLocaleString("vi-VN") + " ₫";
    },

    formatDateOnly(date) {
      if (!date) return "---";
      return new Date(date).toLocaleDateString("vi-VN");
    },

    formatDateTime(date) {
      if (!date) return "---";
      return new Date(date).toLocaleString("vi-VN");
    },

    formatDateForInput(date) {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },

    formatDateTimeLocal(date) {
      if (!date) return "";
      const d = new Date(date);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      return `${y}-${m}-${day}T${hh}:${mm}`;
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
        name: dog.name || "",
        proposedPrice: dog.proposedPrice || dog.price || 0,
        gender: dog.gender || "Đực",
        birthDate: dog.birthDate ? this.formatDateForInput(dog.birthDate) : "",
        description: dog.description || "",
        breedId: dog.breedId?._id || dog.breedId?.id || dog.breedId || "",
        weight: dog.weight ?? "",
        sourceNotes: dog.sourceNotes || "",
        healthNote: dog.healthNote || "",
        currentFeedback:
          ["Cần bổ sung", "Từ chối"].includes(dog.approvalStatus)
            ? dog.rejectionReason || ""
            : "",
      };

      if (dog.healthRecord) {
        this.healthForm = {
          _id: dog.healthRecord._id || dog.healthRecord.id,
          dogId: dog._id || dog.id,
          farmId: this.getFarmId(),
          checkedBy: dog.healthRecord.checkedBy || "",
          checkedAt: this.formatDateTimeLocal(dog.healthRecord.checkedAt),
          weight: dog.healthRecord.weight ?? "",
          bodyTemperature: dog.healthRecord.bodyTemperature ?? "",
          generalCondition: dog.healthRecord.generalCondition || "",
          appetiteStatus: dog.healthRecord.appetiteStatus || "",
          digestiveStatus: dog.healthRecord.digestiveStatus || "",
          respiratoryStatus: dog.healthRecord.respiratoryStatus || "",
          skinCondition: dog.healthRecord.skinCondition || "",
          mobilityStatus: dog.healthRecord.mobilityStatus || "",
          dewormed: !!dog.healthRecord.dewormed,
          lastDewormingDate: dog.healthRecord.lastDewormingDate
            ? this.formatDateForInput(dog.healthRecord.lastDewormingDate)
            : "",
          abnormalSigns: dog.healthRecord.abnormalSigns || "",
          medicalNotes: dog.healthRecord.medicalNotes || "",
          recommendation: dog.healthRecord.recommendation || "",
          reviewStatus: dog.healthRecord.reviewStatus || "Chờ duyệt",
          reviewNote: dog.healthRecord.reviewNote || "",
          vaccines: this.normalizeVaccinesForForm(dog.healthRecord.vaccines || []),
        };
      } else {
        this.healthForm = {
          ...this.getDefaultHealthForm(),
          dogId: dog._id || dog.id,
          farmId: this.getFarmId(),
          checkedAt: this.formatDateTimeLocal(new Date()),
        };
      }

      this.activeManageTab = "dog";
    },

    closeManageModal() {
      this.manageDog = null;
      this.activeManageTab = "dog";
      this.healthForm = this.getDefaultHealthForm();
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
        formData.append("name", this.manageDog.name || "");
        formData.append("proposedPrice", this.manageDog.proposedPrice || 0);
        formData.append("gender", this.manageDog.gender || "Đực");
        formData.append("birthDate", this.manageDog.birthDate || "");
        formData.append("description", this.manageDog.description || "");
        formData.append("breedId", this.manageDog.breedId || "");
        formData.append(
          "weight",
          this.manageDog.weight === "" ? "" : this.manageDog.weight
        );
        formData.append("sourceNotes", this.manageDog.sourceNotes || "");
        formData.append("healthNote", this.manageDog.healthNote || "");

        await DogService.update(
          this.manageDog._id || this.manageDog.id,
          formData
        );
        alert("✅ Cập nhật thành công! Hồ sơ đang chờ duyệt lại.");
        this.closeManageModal();
        await this.loadPageData();
      } catch (error) {
        alert("❌ Lỗi cập nhật: " + (error.response?.data?.message || error.message));
      }
    },

    async saveHealthRecord() {
      if (!this.healthForm.dogId || !this.healthForm.farmId) {
        alert("Vui lòng nhập đủ thông tin bắt buộc của hồ sơ sức khỏe.");
        return;
      }

      try {
        const payload = {
          dogId: this.healthForm.dogId,
          farmId: this.healthForm.farmId,
          checkedBy: this.healthForm.checkedBy,
          checkedAt: this.healthForm.checkedAt,
          weight: this.healthForm.weight === "" ? null : Number(this.healthForm.weight),
          bodyTemperature:
            this.healthForm.bodyTemperature === ""
              ? null
              : Number(this.healthForm.bodyTemperature),
          generalCondition: this.healthForm.generalCondition,
          abnormalSigns: this.healthForm.abnormalSigns,
          medicalNotes: this.healthForm.medicalNotes,
          recommendation: this.healthForm.recommendation,
          dewormed: !!this.healthForm.dewormed,
          lastDewormingDate: this.healthForm.lastDewormingDate || null,
          vaccines: this.normalizeVaccinesForSubmit(this.healthForm.vaccines),
        };

        if (this.healthForm._id) {
          await DogHealthRecordService.update(this.healthForm._id, payload);
          alert("✅ Cập nhật hồ sơ sức khỏe thành công và đã gửi lại admin duyệt.");
        } else {
          await DogHealthRecordService.create(payload);
          alert("✅ Tạo hồ sơ sức khỏe thành công và đã gửi admin duyệt.");
        }

        this.closeManageModal();
        await this.loadPageData();
      } catch (error) {
        alert("❌ Lỗi lưu hồ sơ sức khỏe: " + (error.response?.data?.message || error.message));
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
.table td,
.table th {
  vertical-align: middle;
}

.dashboard-filter-card,
.stat-card {
  border-radius: 14px;
}

.dashboard-table {
  margin-bottom: 0;
}

.dashboard-table thead th {
  font-weight: 700;
  white-space: nowrap;
  background: #f8f9fa;
}

.dashboard-table td,
.dashboard-table th {
  vertical-align: middle;
}

.action-col {
  min-width: 160px;
}

.image-col {
  min-width: 100px;
}

.code-col {
  min-width: 110px;
}

.name-col {
  min-width: 160px;
}

.breed-col {
  min-width: 150px;
}

.price-col {
  min-width: 150px;
}

.approval-col {
  min-width: 220px;
}

.sale-col {
  min-width: 170px;
}

.dog-thumb {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.action-buttons-wrap {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.action-btn {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid #dfe5e8;
  background: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.action-btn i {
  font-size: 14px;
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
  border-radius: 18px;
  overflow: hidden;
}

.farm-modal-header {
  background: linear-gradient(135deg, #1f8a5b, #18734c);
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
  padding: 14px 20px 18px;
}

.popup-label {
  font-weight: 700;
  color: #374151;
  margin-bottom: 8px;
  display: block;
}

.popup-input {
  min-height: 44px;
  border-radius: 10px;
  border: 1px solid #dfe5e8;
}

.popup-input:focus {
  border-color: #198754;
  box-shadow: 0 0 0 0.2rem rgba(25, 135, 84, 0.12);
}

.popup-textarea {
  min-height: 96px;
  resize: vertical;
}

.popup-textarea-small {
  min-height: 72px;
  resize: vertical;
}

.detail-image {
  width: 100%;
  max-height: 280px;
  object-fit: cover;
  border-radius: 14px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.compact-grid .detail-item {
  min-height: 84px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.detail-item,
.detail-block {
  border: 1px solid #e6ece8;
  border-radius: 12px;
  padding: 12px 14px;
  background: #fafdfb;
}

.detail-item label,
.detail-block label {
  display: block;
  font-weight: 700;
  color: #198754;
  margin-bottom: 6px;
}

.detail-text {
  white-space: pre-line;
  word-break: break-word;
}

.health-section {
  border-top: 1px solid #edf2ef;
  padding-top: 20px;
}

.soft-alert {
  border-radius: 12px;
}

.vaccine-box {
  border: 1px solid #e6ece8;
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 14px;
  background: #fafdfb;
}

.form-equal-row .col-md-6,
.form-equal-row .col-md-4,
.form-equal-row .col-md-12 {
  display: flex;
  flex-direction: column;
}

.manage-tab-bar {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.manage-tab-btn {
  border: 1px solid #dfe5e8;
  background: #fff;
  color: #374151;
  border-radius: 10px;
  padding: 10px 16px;
  font-weight: 700;
  transition: all 0.2s ease;
}

.manage-tab-btn.active {
  background: #198754;
  color: #fff;
  border-color: #198754;
}

.modal {
  overflow-y: auto;
}

@media (max-width: 991.98px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .compact-grid .detail-item {
    min-height: unset;
  }
}
</style>