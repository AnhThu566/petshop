<template>
  <div class="farm-dogs-page bg-light py-4" style="min-height: 100vh;">
    <div class="container-fluid">
      <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3 flex-wrap">
        <h4 class="font-weight-bold text-dark mb-2">
          <i class="fas fa-dog text-warning mr-2"></i>
          DANH SÁCH CHÓ CỦA TRANG TRẠI
        </h4>

        <div>
          <button class="btn btn-outline-primary btn-sm mr-2" @click="fetchMyDogs">
            <i class="fas fa-sync-alt mr-1"></i> Làm mới
          </button>
          <router-link to="/farm/add-dog" class="btn btn-primary btn-sm">
            <i class="fas fa-plus mr-1"></i> Đăng chó mới
          </router-link>
        </div>
      </div>

      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body py-3">
          <div class="row align-items-center">
            <div class="col-md-4 mb-2 mb-md-0">
              <div class="input-group input-group-sm">
                <div class="input-group-prepend">
                  <span class="input-group-text bg-white">
                    <i class="fas fa-search text-primary"></i>
                  </span>
                </div>
                <input
                  type="text"
                  class="form-control"
                  placeholder="Tìm tên chó hoặc mã chó..."
                  v-model="searchText"
                />
              </div>
            </div>

            <div class="col-md-8 text-md-right">
              <div class="btn-group flex-wrap">
                <button
                  class="btn btn-sm"
                  :class="statusFilter === 'Tất cả' ? 'btn-dark' : 'btn-light'"
                  @click="statusFilter = 'Tất cả'"
                >
                  Tất cả
                </button>
                <button
                  class="btn btn-sm"
                  :class="statusFilter === 'Chờ duyệt' ? 'btn-warning text-dark' : 'btn-light'"
                  @click="statusFilter = 'Chờ duyệt'"
                >
                  Chờ duyệt
                </button>
                <button
                  class="btn btn-sm"
                  :class="statusFilter === 'Đã duyệt' ? 'btn-success text-white' : 'btn-light'"
                  @click="statusFilter = 'Đã duyệt'"
                >
                  Đã duyệt
                </button>
                <button
                  class="btn btn-sm"
                  :class="statusFilter === 'Từ chối' ? 'btn-danger text-white' : 'btn-light'"
                  @click="statusFilter = 'Từ chối'"
                >
                  Từ chối
                </button>
                <button
                  class="btn btn-sm"
                  :class="statusFilter === 'Chờ thanh toán' ? 'btn-info text-dark' : 'btn-light'"
                  @click="statusFilter = 'Chờ thanh toán'"
                >
                  Chờ thanh toán
                </button>
                <button
                  class="btn btn-sm"
                  :class="statusFilter === 'Đã đặt cọc' ? 'btn-primary text-white' : 'btn-light'"
                  @click="statusFilter = 'Đã đặt cọc'"
                >
                  Đã đặt cọc
                </button>
                <button
                  class="btn btn-sm"
                  :class="statusFilter === 'Đang giao' ? 'btn-secondary text-white' : 'btn-light'"
                  @click="statusFilter = 'Đang giao'"
                >
                  Đang giao
                </button>
                <button
                  class="btn btn-sm"
                  :class="statusFilter === 'Đã bán' ? 'btn-dark text-white' : 'btn-light'"
                  @click="statusFilter = 'Đã bán'"
                >
                  Đã bán
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card border-0 shadow-sm" v-if="filteredDogs.length > 0">
        <div class="table-responsive">
          <table class="table table-hover align-middle text-center mb-0">
            <thead class="bg-light">
              <tr class="small text-secondary">
                <th class="py-3">Ảnh</th>
                <th class="py-3">Mã chó</th>
                <th class="py-3">Tên</th>
                <th class="py-3">Giống</th>
                <th class="py-3">Giá</th>
                <th class="py-3">Ngày đăng</th>
                <th class="py-3">Trạng thái</th>
                <th class="py-3">Giao dịch</th>
                <th class="py-3">Thao tác</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="dog in filteredDogs" :key="dog._id || dog.id">
                <td>
                  <img
                    :src="getDogImage(dog)"
                    alt="dog"
                    style="width: 64px; height: 64px; object-fit: cover; border-radius: 8px;"
                  />
                </td>

                <td class="font-weight-bold text-primary">
                  {{ dog.maCho || "---" }}
                </td>

                <td class="font-weight-bold text-dark">
                  {{ dog.name }}
                </td>

                <td>
                  {{ dog.breedId?.name || "---" }}
                </td>

                <td class="text-danger font-weight-bold">
                  {{ formatCurrency(dog.price) }}
                </td>

                <td>
                  {{ formatDateOnly(dog.createdAt) }}
                </td>

                <td>
                  <span class="badge px-3 py-2" :class="getStatusClass(dog.status)">
                    {{ dog.status }}
                  </span>
                </td>

                <td>
                  <span
                    v-if="dog.status === 'Chờ thanh toán'"
                    class="badge badge-info text-dark px-2 py-1"
                  >
                    Chờ cọc
                  </span>
                  <span
                    v-else-if="dog.status === 'Đã đặt cọc'"
                    class="badge badge-primary px-2 py-1"
                  >
                    Đã cọc
                  </span>
                  <span
                    v-else-if="dog.status === 'Đang giao'"
                    class="badge badge-secondary px-2 py-1"
                  >
                    Đang giao
                  </span>
                  <span
                    v-else-if="dog.status === 'Đã bán'"
                    class="badge badge-dark px-2 py-1"
                  >
                    Hoàn tất
                  </span>
                  <span v-else class="text-muted">---</span>
                </td>

                <td>
                  <div class="d-flex justify-content-center flex-wrap">
                    <button
                      class="btn btn-sm btn-outline-secondary mr-1 mb-1"
                      @click="openDetailModal(dog)"
                      title="Xem chi tiết"
                    >
                      <i class="fas fa-eye"></i>
                    </button>

                    <button
                      class="btn btn-sm btn-outline-primary mr-1 mb-1"
                      @click="openHealthEditModal(dog)"
                      :disabled="isLockedDog(dog)"
                      title="Sửa hồ sơ sức khỏe"
                    >
                      <i class="fas fa-notes-medical"></i>
                    </button>

                    <button
                      class="btn btn-sm btn-outline-warning mb-1"
                      @click="openBasicEditModal(dog)"
                      :disabled="isLockedDog(dog)"
                      title="Sửa thông tin cơ bản"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                  </div>

                  <div
                    v-if="dog.status === 'Từ chối' && dog.rejectionReason"
                    class="small text-danger mt-2 text-left"
                  >
                    <strong>Lý do:</strong> {{ dog.rejectionReason }}
                  </div>

                  <div v-if="isLockedDog(dog)" class="small text-danger mt-2">
                    <i class="fas fa-lock mr-1"></i>Đang giao dịch / đã bán
                  </div>
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

      <!-- Modal xem chi tiết -->
      <div
        v-if="selectedDog"
        class="modal fade show d-block"
        tabindex="-1"
        style="background: rgba(0,0,0,0.45);"
      >
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content border-0 shadow">
            <div class="modal-header bg-dark text-white">
              <h5 class="modal-title mb-0">
                <i class="fas fa-dog mr-2"></i>Chi tiết hồ sơ chó
              </h5>
              <button type="button" class="close text-white" @click="closeDetailModal">
                <span>&times;</span>
              </button>
            </div>

            <div class="modal-body">
              <div class="row">
                <div class="col-md-4 text-center mb-3">
                  <img
                    :src="getDogImage(selectedDog)"
                    class="img-fluid rounded shadow-sm"
                    alt="dog"
                    style="max-height: 250px; object-fit: cover;"
                  />
                </div>

                <div class="col-md-8">
                  <h5 class="font-weight-bold">{{ selectedDog.name }}</h5>
                  <p class="mb-1"><strong>Mã chó:</strong> {{ selectedDog.maCho || "---" }}</p>
                  <p class="mb-1"><strong>Trạng thái:</strong> {{ selectedDog.status }}</p>
                  <p class="mb-1"><strong>Giống:</strong> {{ selectedDog.breedId?.name || "---" }}</p>
                  <p class="mb-1"><strong>Giới tính:</strong> {{ selectedDog.gender || "---" }}</p>
                  <p class="mb-1"><strong>Ngày sinh:</strong> {{ formatDateOnly(selectedDog.birthDate) }}</p>
                  <p class="mb-1"><strong>Giá:</strong> {{ formatCurrency(selectedDog.price) }}</p>
                  <p class="mb-1"><strong>Cân nặng:</strong> {{ selectedDog.weight ? selectedDog.weight + " kg" : "---" }}</p>
                  <p class="mb-1"><strong>Tình trạng sức khỏe:</strong> {{ selectedDog.healthStatus || "---" }}</p>
                  <p class="mb-1"><strong>Ngày sổ giun:</strong> {{ formatDateOnly(selectedDog.lastDeworming) }}</p>
                  <p class="mb-1"><strong>Mô tả:</strong> {{ selectedDog.description || "---" }}</p>

                  <div
                    v-if="selectedDog.status === 'Từ chối' && selectedDog.rejectionReason"
                    class="alert alert-danger mt-3 py-2"
                  >
                    <strong>Lý do từ chối:</strong> {{ selectedDog.rejectionReason }}
                  </div>
                </div>
              </div>

              <hr>

              <h6 class="font-weight-bold text-primary mb-3">Lịch sử vaccine</h6>

              <div v-if="selectedDog.healthRecord && selectedDog.healthRecord.length > 0">
                <div
                  class="border rounded p-2 mb-2 bg-light"
                  v-for="(item, index) in selectedDog.healthRecord"
                  :key="index"
                >
                  <p class="mb-1"><strong>Vaccine:</strong> {{ item.vaccineId?.name || "---" }}</p>
                  <p class="mb-1"><strong>Ngày tiêm:</strong> {{ formatDateOnly(item.dateInjected) }}</p>
                  <p class="mb-0"><strong>Ghi chú:</strong> {{ item.note || "---" }}</p>
                </div>
              </div>

              <div v-else class="text-muted">
                Chưa có dữ liệu vaccine.
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn btn-secondary" @click="closeDetailModal">Đóng</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal sửa hồ sơ sức khỏe -->
      <div
        v-if="editingDog"
        class="modal fade show d-block"
        tabindex="-1"
        style="background: rgba(0,0,0,0.45);"
      >
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content border-0 shadow">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title mb-0">
                <i class="fas fa-notes-medical mr-2"></i>Cập nhật hồ sơ sức khỏe
              </h5>
              <button type="button" class="close text-white" @click="closeEditModal">
                <span>&times;</span>
              </button>
            </div>

            <div class="modal-body">
              <div class="form-row">
                <div class="form-group col-md-6">
                  <label>Cân nặng (kg)</label>
                  <input type="number" step="0.1" class="form-control" v-model="editingDog.weight" />
                </div>

                <div class="form-group col-md-6">
                  <label>Tình trạng sức khỏe</label>
                  <input type="text" class="form-control" v-model="editingDog.healthStatus" />
                </div>

                <div class="form-group col-md-6">
                  <label>Ngày sổ giun</label>
                  <input type="date" class="form-control" v-model="editingDog.lastDeworming" />
                </div>
              </div>

              <hr>

              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="font-weight-bold mb-0">Lịch sử vaccine</h6>
                <button class="btn btn-sm btn-outline-success" @click="addHealthRecordRow">
                  <i class="fas fa-plus mr-1"></i> Thêm mũi tiêm
                </button>
              </div>

              <div
                v-for="(item, index) in editingDog.healthRecord"
                :key="index"
                class="border rounded p-3 mb-3 bg-light"
              >
                <div class="form-row">
                  <div class="form-group col-md-4">
                    <label>Vaccine</label>
                    <select class="form-control" v-model="item.vaccineId">
                      <option value="">-- Chọn vaccine --</option>
                      <option
                        v-for="vac in vaccines"
                        :key="vac._id || vac.id"
                        :value="vac._id || vac.id"
                      >
                        {{ vac.name }}
                      </option>
                    </select>
                  </div>

                  <div class="form-group col-md-4">
                    <label>Ngày tiêm</label>
                    <input type="date" class="form-control" v-model="item.dateInjected" />
                  </div>

                  <div class="form-group col-md-3">
                    <label>Ghi chú</label>
                    <input type="text" class="form-control" v-model="item.note" />
                  </div>

                  <div class="form-group col-md-1 d-flex align-items-end">
                    <button
                      type="button"
                      class="btn btn-outline-danger btn-sm w-100"
                      @click="removeHealthRecordRow(index)"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>

              <div v-if="!editingDog.healthRecord || editingDog.healthRecord.length === 0" class="text-muted">
                Chưa có dữ liệu vaccine.
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn btn-secondary" @click="closeEditModal">Hủy</button>
              <button class="btn btn-primary" @click="saveHealthRecord">Lưu hồ sơ sức khỏe</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal sửa thông tin cơ bản -->
      <div
        v-if="editingBasicDog"
        class="modal fade show d-block"
        tabindex="-1"
        style="background: rgba(0,0,0,0.45);"
      >
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content border-0 shadow">
            <div class="modal-header bg-warning">
              <h5 class="modal-title mb-0 text-dark">
                <i class="fas fa-edit mr-2"></i>Sửa thông tin cơ bản
              </h5>
              <button type="button" class="close" @click="closeBasicEditModal">
                <span>&times;</span>
              </button>
            </div>

            <div class="modal-body">
              <div class="alert alert-warning">
                Khi sửa thông tin cơ bản, hồ sơ sẽ quay lại trạng thái <strong>Chờ duyệt</strong> để Admin kiểm tra lại.
              </div>

              <div class="form-row">
                <div class="form-group col-md-6">
                  <label>Tên chó</label>
                  <input type="text" class="form-control" v-model="editingBasicDog.name" />
                </div>

                <div class="form-group col-md-6">
                  <label>Giá bán</label>
                  <input type="number" class="form-control" v-model="editingBasicDog.price" />
                </div>

                <div class="form-group col-md-6">
                  <label>Giới tính</label>
                  <select class="form-control" v-model="editingBasicDog.gender">
                    <option value="Đực">Đực</option>
                    <option value="Cái">Cái</option>
                  </select>
                </div>

                <div class="form-group col-md-6">
                  <label>Ngày sinh</label>
                  <input type="date" class="form-control" v-model="editingBasicDog.birthDate" />
                </div>

                <div class="form-group col-md-6">
                  <label>Giống chó</label>
                  <select class="form-control" v-model="editingBasicDog.breedId">
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

                <div class="form-group col-md-12">
                  <label>Mô tả</label>
                  <textarea class="form-control" rows="4" v-model="editingBasicDog.description"></textarea>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn btn-secondary" @click="closeBasicEditModal">Hủy</button>
              <button class="btn btn-warning text-dark" @click="saveBasicInfo">Lưu thay đổi</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import DogService from "@/services/dog.service";
import VaccineService from "@/services/vaccine.service";
import BreedService from "@/services/breed.service";

export default {
  data() {
    return {
      dogs: [],
      vaccines: [],
      breeds: [],
      currentFarm: null,
      searchText: "",
      statusFilter: "Tất cả",
      selectedDog: null,
      editingDog: null,
      editingBasicDog: null,
    };
  },

  computed: {
    filteredDogs() {
      return this.dogs.filter((dog) => {
        const keyword = (this.searchText || "").toLowerCase();
        const dogName = dog.name ? dog.name.toLowerCase() : "";
        const dogCode = dog.maCho ? dog.maCho.toLowerCase() : "";

        const matchSearch = dogName.includes(keyword) || dogCode.includes(keyword);
        const matchStatus = this.statusFilter === "Tất cả" || dog.status === this.statusFilter;

        return matchSearch && matchStatus;
      });
    },
  },

  methods: {
    async fetchMyDogs() {
      try {
        if (!this.currentFarm) return;

        const allDogs = await DogService.getAll();

        const realFarmId =
          this.currentFarm.farmId ||
          this.currentFarm._id ||
          this.currentFarm.id;

        this.dogs = allDogs.filter((dog) => {
          const dogFarmId =
            dog.farmId?._id ||
            dog.farmId?.id ||
            dog.farmId;

          return String(dogFarmId) === String(realFarmId);
        });
      } catch (error) {
        console.error("Lỗi tải danh sách chó:", error);
        alert(
          "Không thể tải danh sách chó của trang trại: " +
          (error.response?.data?.message || error.message)
        );
      }
    },

    async fetchBreeds() {
      try {
        this.breeds = await BreedService.getAll();
      } catch (error) {
        console.error("Lỗi tải giống chó:", error);
      }
    },

    async fetchVaccines() {
      try {
        this.vaccines = await VaccineService.getAll();
      } catch (error) {
        console.error("Lỗi tải vaccine:", error);
      }
    },

    getDogImage(dog) {
      if (dog?.image) return "http://localhost:3000" + dog.image;
      return "https://via.placeholder.com/500x350";
    },

    formatCurrency(value) {
      if (value === null || value === undefined) return "---";
      return Number(value).toLocaleString("vi-VN") + " ₫";
    },

    formatDateOnly(date) {
      if (!date) return "---";
      return new Date(date).toLocaleDateString("vi-VN");
    },

    getStatusClass(status) {
      if (status === "Chờ duyệt") return "badge-warning text-dark";
      if (status === "Đã duyệt") return "badge-success";
      if (status === "Từ chối") return "badge-danger";
      if (status === "Chờ thanh toán") return "badge-info text-dark";
      if (status === "Đã đặt cọc") return "badge-primary";
      if (status === "Đang giao") return "badge-secondary";
      if (status === "Đã bán") return "badge-dark";
      if (status === "Ngừng bán") return "badge-light border";
      return "badge-light border";
    },

    isLockedDog(dog) {
      return ["Chờ thanh toán", "Đã đặt cọc", "Đang giao", "Đã bán"].includes(dog.status);
    },

    openDetailModal(dog) {
      this.selectedDog = JSON.parse(JSON.stringify(dog));
    },

    closeDetailModal() {
      this.selectedDog = null;
    },

    openHealthEditModal(dog) {
      if (this.isLockedDog(dog)) {
        alert("Bé chó này đang trong giao dịch hoặc đã bán, không thể cập nhật.");
        return;
      }

      this.editingDog = JSON.parse(JSON.stringify(dog));

      if (!this.editingDog.healthRecord) {
        this.editingDog.healthRecord = [];
      }

      this.editingDog.healthRecord = this.editingDog.healthRecord.map((item) => ({
        vaccineId: item.vaccineId?._id || item.vaccineId?.id || item.vaccineId || "",
        dateInjected: item.dateInjected ? this.formatDateForInput(item.dateInjected) : "",
        note: item.note || "",
      }));

      this.editingDog.lastDeworming = this.editingDog.lastDeworming
        ? this.formatDateForInput(this.editingDog.lastDeworming)
        : "";
    },

    closeEditModal() {
      this.editingDog = null;
    },

    openBasicEditModal(dog) {
      if (this.isLockedDog(dog)) {
        alert("Bé chó này đang trong giao dịch hoặc đã bán, không thể cập nhật.");
        return;
      }

      this.editingBasicDog = {
        _id: dog._id || dog.id,
        name: dog.name || "",
        price: dog.price || 0,
        gender: dog.gender || "Đực",
        birthDate: dog.birthDate ? this.formatDateForInput(dog.birthDate) : "",
        description: dog.description || "",
        breedId: dog.breedId?._id || dog.breedId?.id || dog.breedId || "",
      };
    },

    closeBasicEditModal() {
      this.editingBasicDog = null;
    },

    formatDateForInput(date) {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },

    addHealthRecordRow() {
      if (!this.editingDog.healthRecord) this.editingDog.healthRecord = [];
      this.editingDog.healthRecord.push({
        vaccineId: "",
        dateInjected: "",
        note: "",
      });
    },

    removeHealthRecordRow(index) {
      this.editingDog.healthRecord.splice(index, 1);
    },

    async saveHealthRecord() {
      const totalVaccines = this.editingDog.healthRecord ? this.editingDog.healthRecord.length : 0;
      const confirmMessage =
        `Vui lòng kiểm tra kỹ lại thông tin của bé [${this.editingDog.name}] trước khi lưu:\n\n` +
        `⚖️ Cân nặng: ${this.editingDog.weight || "Chưa nhập"} kg\n` +
        `🩺 Tình trạng: ${this.editingDog.healthStatus || "Chưa nhập"}\n` +
        `💊 Ngày sổ giun: ${
          this.editingDog.lastDeworming
            ? new Date(this.editingDog.lastDeworming).toLocaleDateString("vi-VN")
            : "Chưa cập nhật"
        }\n` +
        `💉 Số mũi tiêm: ${totalVaccines} mũi\n\n` +
        `👉 Bạn có chắc chắn toàn bộ dữ liệu trên đã chính xác chưa?`;

      if (!confirm(confirmMessage)) return;

      try {
        const updateData = {
          weight: this.editingDog.weight,
          healthStatus: this.editingDog.healthStatus,
          lastDeworming: this.editingDog.lastDeworming,
          healthRecord: this.editingDog.healthRecord,
        };

        await DogService.update(this.editingDog._id || this.editingDog.id, updateData);
        alert("✅ Đã cập nhật hồ sơ sức khỏe thành công!");
        this.closeEditModal();
        await this.fetchMyDogs();
      } catch (error) {
        alert("❌ Lỗi cập nhật: " + (error.response?.data?.message || error.message));
      }
    },

    async saveBasicInfo() {
      if (
        !confirm(
          `Bạn có chắc chắn muốn lưu? Hành động này sẽ đưa hồ sơ về trạng thái "Chờ duyệt" để Admin kiểm tra lại.`
        )
      ) {
        return;
      }

      try {
        const updateData = {
          name: this.editingBasicDog.name,
          price: this.editingBasicDog.price,
          gender: this.editingBasicDog.gender,
          birthDate: this.editingBasicDog.birthDate,
          description: this.editingBasicDog.description,
          breedId: this.editingBasicDog.breedId,
        };

        await DogService.update(this.editingBasicDog._id || this.editingBasicDog.id, updateData);
        alert("✅ Cập nhật thành công! Hồ sơ đang chờ duyệt lại.");
        this.closeBasicEditModal();
        await this.fetchMyDogs();
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

    await Promise.all([
      this.fetchBreeds(),
      this.fetchVaccines(),
      this.fetchMyDogs(),
    ]);
  },
};
</script>

<style scoped>
.table td,
.table th {
  vertical-align: middle;
}

.modal {
  overflow-y: auto;
}
</style>