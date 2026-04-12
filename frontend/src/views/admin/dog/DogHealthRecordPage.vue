<template>
  <div class="dog-health-page">
    <div class="page-head">
      <div>
        <h3 class="page-title">
          <i class="fas fa-notes-medical text-danger mr-2"></i>
          QUẢN LÝ HỒ SƠ SỨC KHỎE CHÓ
        </h3>
        <p class="page-subtitle mb-0">
          Theo dõi và cập nhật hồ sơ sức khỏe chi tiết trước bán cho từng bé chó
        </p>
      </div>

      <button class="btn btn-danger font-weight-bold" @click="openCreateForm">
        <i class="fas fa-plus-circle mr-2"></i> Tạo hồ sơ sức khỏe
      </button>
    </div>

    <div class="toolbar-card">
      <div class="toolbar-grid">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input
            v-model="searchText"
            type="text"
            placeholder="Tìm theo tên chó hoặc mã chó"
          />
        </div>

        <select class="form-control" v-model="resultFilter">
          <option value="Tất cả">Tất cả kết luận</option>
          <option value="Đủ điều kiện bán">Đủ điều kiện bán</option>
          <option value="Chưa đủ điều kiện bán">Chưa đủ điều kiện bán</option>
          <option value="Cần theo dõi thêm">Cần theo dõi thêm</option>
        </select>

        <button class="btn btn-outline-secondary" @click="fetchRecords">
          <i class="fas fa-sync-alt mr-1"></i> Làm mới
        </button>
      </div>
    </div>

    <div v-if="loading" class="empty-panel">
      <i class="fas fa-spinner fa-spin empty-icon"></i>
      <p>Đang tải hồ sơ sức khỏe...</p>
    </div>

    <div v-else-if="filteredRecords.length === 0" class="empty-panel">
      <i class="fas fa-file-medical empty-icon"></i>
      <p>Chưa có hồ sơ sức khỏe nào phù hợp</p>
    </div>

    <div v-else class="table-card">
      <div class="table-wrap">
        <table class="health-table">
          <thead>
            <tr>
              <th>Bé chó</th>
              <th>Ngày kiểm tra</th>
              <th>Người kiểm tra</th>
              <th>Cân nặng</th>
              <th>Tẩy giun</th>
              <th>Kết luận</th>
              <th>Thao tác</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="item in filteredRecords" :key="item._id || item.id">
              <td>
                <div class="dog-cell">
                  <img :src="getDogImage(item)" alt="dog" class="dog-thumb" />
                  <div>
                    <div class="dog-name">{{ item.dogId?.name || "---" }}</div>
                    <div class="dog-sub">{{ item.dogId?.maCho || "---" }}</div>
                  </div>
                </div>
              </td>

              <td>{{ formatDate(item.checkedAt) }}</td>
              <td>{{ item.checkedBy || "---" }}</td>
              <td>{{ item.weight ?? "---" }}</td>
              <td>
                <span class="mini-badge" :class="item.dewormed ? 'ok' : 'warn'">
                  {{ item.dewormed ? "Đã tẩy giun" : "Chưa rõ" }}
                </span>
              </td>
              <td>
                <span class="result-badge" :class="getResultClass(item.checkResult)">
                  {{ item.checkResult }}
                </span>
              </td>
              <td>
                <div class="action-group">
                  <button class="btn btn-sm btn-outline-primary" @click="openEditForm(item)">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-info" @click="openDetail(item)">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="removeRecord(item)">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL FORM -->
    <div
      v-if="showForm"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(0, 0, 0, 0.45);"
    >
      <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content border-0 shadow">
          <div class="modal-header modal-head-custom">
            <h5 class="modal-title mb-0">
              <i class="fas fa-notes-medical mr-2"></i>
              {{ form._id || form.id ? "Cập nhật hồ sơ sức khỏe" : "Tạo hồ sơ sức khỏe" }}
            </h5>
            <button type="button" class="close text-white" @click="closeForm">
              <span>&times;</span>
            </button>
          </div>

          <div class="modal-body">
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="font-weight-bold">Chọn bé chó</label>
                <select class="form-control" v-model="form.dogId">
                  <option value="">-- Chọn chó --</option>
                  <option
                    v-for="dog in dogs"
                    :key="dog._id || dog.id"
                    :value="dog._id || dog.id"
                  >
                    {{ dog.name }} - {{ dog.maCho }}
                  </option>
                </select>
              </div>

              <div class="col-md-6 mb-3">
                <label class="font-weight-bold">Trang trại</label>
                <select class="form-control" v-model="form.farmId">
                  <option value="">-- Chọn trang trại --</option>
                  <option
                    v-for="farm in farms"
                    :key="farm._id || farm.id"
                    :value="farm._id || farm.id"
                  >
                    {{ farm.name }}
                  </option>
                </select>
              </div>

              <div class="col-md-6 mb-3">
                <label class="font-weight-bold">Người kiểm tra</label>
                <input v-model="form.checkedBy" type="text" class="form-control" />
              </div>

              <div class="col-md-6 mb-3">
                <label class="font-weight-bold">Ngày kiểm tra</label>
                <input v-model="form.checkedAt" type="datetime-local" class="form-control" />
              </div>

              <div class="col-md-4 mb-3">
                <label class="font-weight-bold">Cân nặng (kg)</label>
                <input v-model="form.weight" type="number" step="0.1" min="0" class="form-control" />
              </div>

              <div class="col-md-4 mb-3">
                <label class="font-weight-bold">Nhiệt độ cơ thể</label>
                <input v-model="form.bodyTemperature" type="number" step="0.1" min="0" class="form-control" />
              </div>

              <div class="col-md-4 mb-3">
                <label class="font-weight-bold">Ngày tẩy giun gần nhất</label>
                <input v-model="form.lastDewormingDate" type="date" class="form-control" />
              </div>

              <div class="col-md-6 mb-3">
                <label class="font-weight-bold">Tình trạng tổng quát</label>
                <input v-model="form.generalCondition" type="text" class="form-control" />
              </div>

              <div class="col-md-6 mb-3">
                <label class="font-weight-bold">Tình trạng ăn uống</label>
                <input v-model="form.appetiteStatus" type="text" class="form-control" />
              </div>

              <div class="col-md-6 mb-3">
                <label class="font-weight-bold">Tình trạng tiêu hóa</label>
                <input v-model="form.digestiveStatus" type="text" class="form-control" />
              </div>

              <div class="col-md-6 mb-3">
                <label class="font-weight-bold">Tình trạng hô hấp</label>
                <input v-model="form.respiratoryStatus" type="text" class="form-control" />
              </div>

              <div class="col-md-6 mb-3">
                <label class="font-weight-bold">Tình trạng da lông</label>
                <input v-model="form.skinCondition" type="text" class="form-control" />
              </div>

              <div class="col-md-6 mb-3">
                <label class="font-weight-bold">Khả năng vận động</label>
                <input v-model="form.mobilityStatus" type="text" class="form-control" />
              </div>

              <div class="col-md-12 mb-3">
                <div class="custom-control custom-switch">
                  <input
                    v-model="form.dewormed"
                    type="checkbox"
                    class="custom-control-input"
                    id="dewormedSwitch"
                  />
                  <label class="custom-control-label" for="dewormedSwitch">
                    Đã tẩy giun
                  </label>
                </div>
              </div>

              <div class="col-md-12 mb-3">
                <label class="font-weight-bold">Dấu hiệu bất thường</label>
                <textarea v-model="form.abnormalSigns" rows="2" class="form-control"></textarea>
              </div>

              <div class="col-md-12 mb-3">
                <label class="font-weight-bold">Ghi chú y tế</label>
                <textarea v-model="form.medicalNotes" rows="3" class="form-control"></textarea>
              </div>

              <div class="col-md-6 mb-3">
                <label class="font-weight-bold">Kết luận kiểm tra</label>
                <select class="form-control" v-model="form.checkResult">
                  <option value="Đủ điều kiện bán">Đủ điều kiện bán</option>
                  <option value="Chưa đủ điều kiện bán">Chưa đủ điều kiện bán</option>
                  <option value="Cần theo dõi thêm">Cần theo dõi thêm</option>
                </select>
              </div>

              <div class="col-md-6 mb-3">
                <label class="font-weight-bold">Khuyến nghị</label>
                <input v-model="form.recommendation" type="text" class="form-control" />
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeForm">Hủy</button>
            <button class="btn btn-danger" @click="saveRecord">
              {{ form._id || form.id ? "Cập nhật" : "Tạo mới" }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL DETAIL -->
    <div
      v-if="selectedRecord"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(0, 0, 0, 0.45);"
    >
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header modal-head-custom">
            <h5 class="modal-title mb-0">
              <i class="fas fa-file-medical mr-2"></i>Chi tiết hồ sơ sức khỏe
            </h5>
            <button type="button" class="close text-white" @click="selectedRecord = null">
              <span>&times;</span>
            </button>
          </div>

          <div class="modal-body">
            <p><strong>Bé chó:</strong> {{ selectedRecord.dogId?.name || "---" }}</p>
            <p><strong>Mã chó:</strong> {{ selectedRecord.dogId?.maCho || "---" }}</p>
            <p><strong>Người kiểm tra:</strong> {{ selectedRecord.checkedBy || "---" }}</p>
            <p><strong>Ngày kiểm tra:</strong> {{ formatDate(selectedRecord.checkedAt) }}</p>
            <p><strong>Cân nặng:</strong> {{ selectedRecord.weight ?? "---" }}</p>
            <p><strong>Nhiệt độ:</strong> {{ selectedRecord.bodyTemperature ?? "---" }}</p>
            <p><strong>Tình trạng tổng quát:</strong> {{ selectedRecord.generalCondition || "---" }}</p>
            <p><strong>Ăn uống:</strong> {{ selectedRecord.appetiteStatus || "---" }}</p>
            <p><strong>Tiêu hóa:</strong> {{ selectedRecord.digestiveStatus || "---" }}</p>
            <p><strong>Hô hấp:</strong> {{ selectedRecord.respiratoryStatus || "---" }}</p>
            <p><strong>Da lông:</strong> {{ selectedRecord.skinCondition || "---" }}</p>
            <p><strong>Vận động:</strong> {{ selectedRecord.mobilityStatus || "---" }}</p>
            <p><strong>Dấu hiệu bất thường:</strong> {{ selectedRecord.abnormalSigns || "---" }}</p>
            <p><strong>Ghi chú y tế:</strong> {{ selectedRecord.medicalNotes || "---" }}</p>
            <p><strong>Kết luận:</strong> {{ selectedRecord.checkResult || "---" }}</p>
            <p><strong>Khuyến nghị:</strong> {{ selectedRecord.recommendation || "---" }}</p>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" @click="selectedRecord = null">Đóng</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DogHealthRecordService from "@/services/dogHealthRecord.service";
import DogService from "@/services/dog.service";
import FarmService from "@/services/farm.service";

export default {
  name: "DogHealthRecordPage",

  data() {
    return {
      records: [],
      dogs: [],
      farms: [],
      loading: false,
      searchText: "",
      resultFilter: "Tất cả",
      showForm: false,
      selectedRecord: null,
      form: this.getDefaultForm(),
    };
  },

  computed: {
    filteredRecords() {
      return this.records.filter((item) => {
        const keyword = (this.searchText || "").toLowerCase();
        const dogName = item.dogId?.name ? item.dogId.name.toLowerCase() : "";
        const dogCode = item.dogId?.maCho ? item.dogId.maCho.toLowerCase() : "";

        const matchSearch = dogName.includes(keyword) || dogCode.includes(keyword);
        const matchResult =
          this.resultFilter === "Tất cả" || item.checkResult === this.resultFilter;

        return matchSearch && matchResult;
      });
    },
  },

  methods: {
    getDefaultForm() {
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
        checkResult: "Cần theo dõi thêm",
        recommendation: "",
      };
    },

    async fetchRecords() {
      try {
        this.loading = true;
        this.records = await DogHealthRecordService.getAll();
      } catch (error) {
        console.error("Lỗi tải hồ sơ sức khỏe:", error);
        alert(
          "Không thể tải danh sách hồ sơ sức khỏe: " +
            (error.response?.data?.message || error.message)
        );
      } finally {
        this.loading = false;
      }
    },

    async fetchDogs() {
      try {
        this.dogs = await DogService.getAll();
      } catch (error) {
        console.error("Lỗi tải danh sách chó:", error);
      }
    },

    async fetchFarms() {
      try {
        this.farms = await FarmService.getAll();
      } catch (error) {
        console.error("Lỗi tải danh sách trại:", error);
      }
    },

    openCreateForm() {
      this.form = this.getDefaultForm();
      this.form.checkedAt = this.formatForDateTimeLocal(new Date());
      this.showForm = true;
    },

    openEditForm(item) {
      this.form = {
        _id: item._id || item.id,
        dogId: item.dogId?._id || item.dogId?.id || "",
        farmId: item.farmId?._id || item.farmId?.id || "",
        checkedBy: item.checkedBy || "",
        checkedAt: this.formatForDateTimeLocal(item.checkedAt),
        weight: item.weight ?? "",
        bodyTemperature: item.bodyTemperature ?? "",
        generalCondition: item.generalCondition || "",
        appetiteStatus: item.appetiteStatus || "",
        digestiveStatus: item.digestiveStatus || "",
        respiratoryStatus: item.respiratoryStatus || "",
        skinCondition: item.skinCondition || "",
        mobilityStatus: item.mobilityStatus || "",
        dewormed: !!item.dewormed,
        lastDewormingDate: this.formatForDateInput(item.lastDewormingDate),
        abnormalSigns: item.abnormalSigns || "",
        medicalNotes: item.medicalNotes || "",
        checkResult: item.checkResult || "Cần theo dõi thêm",
        recommendation: item.recommendation || "",
      };
      this.showForm = true;
    },

    openDetail(item) {
      this.selectedRecord = item;
    },

    closeForm() {
      this.showForm = false;
      this.form = this.getDefaultForm();
    },

    async saveRecord() {
      try {
        const payload = {
          dogId: this.form.dogId,
          farmId: this.form.farmId,
          checkedBy: this.form.checkedBy,
          checkedAt: this.form.checkedAt,
          weight: this.form.weight === "" ? null : Number(this.form.weight),
          bodyTemperature:
            this.form.bodyTemperature === "" ? null : Number(this.form.bodyTemperature),
          generalCondition: this.form.generalCondition,
          appetiteStatus: this.form.appetiteStatus,
          digestiveStatus: this.form.digestiveStatus,
          respiratoryStatus: this.form.respiratoryStatus,
          skinCondition: this.form.skinCondition,
          mobilityStatus: this.form.mobilityStatus,
          dewormed: !!this.form.dewormed,
          lastDewormingDate: this.form.lastDewormingDate || null,
          abnormalSigns: this.form.abnormalSigns,
          medicalNotes: this.form.medicalNotes,
          checkResult: this.form.checkResult,
          recommendation: this.form.recommendation,
          vaccines: [],
        };

        if (!payload.dogId || !payload.farmId || !payload.checkResult) {
          alert("Vui lòng nhập đủ thông tin bắt buộc.");
          return;
        }

        if (this.form._id) {
          await DogHealthRecordService.update(this.form._id, payload);
          alert("✅ Cập nhật hồ sơ sức khỏe thành công!");
        } else {
          await DogHealthRecordService.create(payload);
          alert("✅ Tạo hồ sơ sức khỏe thành công!");
        }

        this.closeForm();
        await this.fetchRecords();
      } catch (error) {
        alert(
          "❌ Lỗi lưu hồ sơ sức khỏe: " +
            (error.response?.data?.message || error.message)
        );
      }
    },

    async removeRecord(item) {
      const id = item._id || item.id;
      if (!id) return;

      if (!confirm("Bạn có chắc muốn xóa hồ sơ sức khỏe này không?")) {
        return;
      }

      try {
        await DogHealthRecordService.delete(id);
        alert("✅ Xóa hồ sơ sức khỏe thành công!");
        await this.fetchRecords();
      } catch (error) {
        alert(
          "❌ Lỗi xóa hồ sơ sức khỏe: " +
            (error.response?.data?.message || error.message)
        );
      }
    },

    getDogImage(item) {
      if (item?.dogId?.image) {
        return "http://localhost:3000" + item.dogId.image;
      }
      return "https://via.placeholder.com/120";
    },

    getResultClass(result) {
      if (result === "Đủ điều kiện bán") return "result-ok";
      if (result === "Chưa đủ điều kiện bán") return "result-bad";
      return "result-watch";
    },

    formatDate(date) {
      if (!date) return "---";
      return new Date(date).toLocaleString("vi-VN");
    },

    formatForDateInput(date) {
      if (!date) return "";
      const d = new Date(date);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    },

    formatForDateTimeLocal(date) {
      if (!date) return "";
      const d = new Date(date);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      return `${y}-${m}-${day}T${hh}:${mm}`;
    },
  },

  async mounted() {
    await Promise.all([this.fetchRecords(), this.fetchDogs(), this.fetchFarms()]);
  },
};
</script>

<style scoped>
.dog-health-page {
  padding: 8px;
}

.page-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
  gap: 16px;
  flex-wrap: wrap;
}

.page-title {
  margin: 0 0 4px;
  font-size: 1.65rem;
  font-weight: 900;
  color: #2f1b44;
}

.page-subtitle {
  color: #7b7287;
  font-size: 0.93rem;
}

.toolbar-card,
.table-card,
.empty-panel {
  background: #fff;
  border: 1px solid #eee2f7;
  border-radius: 18px;
  box-shadow: 0 10px 24px rgba(106, 27, 154, 0.06);
}

.toolbar-card {
  padding: 16px;
  margin-bottom: 16px;
}

.toolbar-grid {
  display: grid;
  grid-template-columns: 1fr 220px 140px;
  gap: 12px;
}

.search-box {
  position: relative;
}

.search-box i {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #8b7fa0;
}

.search-box input {
  width: 100%;
  height: 44px;
  border: 1px solid #dfd3ec;
  border-radius: 12px;
  padding: 0 16px 0 40px;
  outline: none;
}

.search-box input:focus {
  border-color: #7b3fc8;
  box-shadow: 0 0 0 3px rgba(123, 63, 200, 0.08);
}

.empty-panel {
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: #7a708a;
}

.empty-icon {
  font-size: 2.6rem;
  margin-bottom: 12px;
  color: #cfbfdc;
}

.table-wrap {
  overflow-x: auto;
}

.health-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 950px;
}

.health-table thead th {
  background: #f8f3fc;
  color: #514564;
  font-size: 0.9rem;
  font-weight: 800;
  padding: 14px 12px;
  border-bottom: 1px solid #ece3f4;
  text-align: left;
  white-space: nowrap;
}

.health-table tbody td {
  padding: 15px 12px;
  border-bottom: 1px solid #f2ebf8;
  vertical-align: middle;
  font-size: 0.92rem;
  color: #3d3450;
}

.health-table tbody tr:hover {
  background: #fcfaff;
}

.health-table tbody tr:last-child td {
  border-bottom: none;
}

.dog-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 180px;
}

.dog-thumb {
  width: 52px;
  height: 52px;
  border-radius: 10px;
  object-fit: cover;
  border: 1px solid #ece3f4;
}

.dog-name {
  font-weight: 700;
  color: #2f1b44;
}

.dog-sub {
  color: #8b7fa0;
  font-size: 0.82rem;
}

.action-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.result-badge,
.mini-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 7px 12px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 800;
  white-space: nowrap;
}

.result-ok {
  background: #e7f8ee;
  color: #15803d;
}

.result-bad {
  background: #fdeaea;
  color: #dc2626;
}

.result-watch {
  background: #fff3d8;
  color: #b7791f;
}

.mini-badge.ok {
  background: #e7f8ee;
  color: #15803d;
}

.mini-badge.warn {
  background: #f3f4f6;
  color: #4b5563;
}

.modal-head-custom {
  background: linear-gradient(135deg, #dc3545, #b52a37);
  color: #fff;
}

@media (max-width: 991.98px) {
  .toolbar-grid {
    grid-template-columns: 1fr;
  }
}
</style>