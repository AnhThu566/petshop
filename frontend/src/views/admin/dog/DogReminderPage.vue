<template>
  <div class="dog-reminder-page">
    <div class="page-head">
      <div>
        <h3 class="page-title">
          <i class="fas fa-bell text-info mr-2"></i>
          QUẢN LÝ NHẮC LỊCH CHÓ
        </h3>
        <p class="page-subtitle mb-0">
          Theo dõi lịch tái khám, tẩy giun, vaccine và chăm sóc định kỳ cho từng bé chó
        </p>
      </div>

      <button class="btn btn-info text-white font-weight-bold" @click="openCreateForm">
        <i class="fas fa-plus-circle mr-2"></i> Tạo nhắc lịch
      </button>
    </div>

    <div class="toolbar-card">
      <div class="toolbar-grid">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input
            v-model="searchText"
            type="text"
            placeholder="Tìm theo tên chó hoặc tiêu đề nhắc lịch"
          />
        </div>

        <select class="form-control" v-model="typeFilter">
          <option value="Tất cả">Tất cả loại lịch</option>
          <option value="Tiêm vaccine">Tiêm vaccine</option>
          <option value="Tẩy giun">Tẩy giun</option>
          <option value="Tái khám">Tái khám</option>
          <option value="Chăm sóc định kỳ">Chăm sóc định kỳ</option>
        </select>

        <select class="form-control" v-model="statusFilter">
          <option value="Tất cả">Tất cả trạng thái</option>
          <option value="Chờ nhắc">Chờ nhắc</option>
          <option value="Đã gửi nhắc">Đã gửi nhắc</option>
          <option value="Đã hoàn thành">Đã hoàn thành</option>
          <option value="Đã hủy">Đã hủy</option>
        </select>

        <button class="btn btn-outline-secondary" @click="fetchReminders">
          <i class="fas fa-sync-alt mr-1"></i> Làm mới
        </button>
      </div>
    </div>

    <div v-if="loading" class="empty-panel">
      <i class="fas fa-spinner fa-spin empty-icon"></i>
      <p>Đang tải danh sách nhắc lịch...</p>
    </div>

    <div v-else-if="filteredReminders.length === 0" class="empty-panel">
      <i class="fas fa-bell-slash empty-icon"></i>
      <p>Chưa có nhắc lịch nào phù hợp</p>
    </div>

    <div v-else class="table-card">
      <div class="table-wrap">
        <table class="reminder-table">
          <thead>
            <tr>
              <th>Bé chó</th>
              <th>Khách hàng</th>
              <th>Loại nhắc</th>
              <th>Ngày nhắc</th>
              <th>Lặp lại</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="item in filteredReminders" :key="item._id || item.id">
              <td>
                <div class="dog-cell">
                  <img :src="getDogImage(item)" alt="dog" class="dog-thumb" />
                  <div>
                    <div class="dog-name">{{ item.dogId?.name || "---" }}</div>
                    <div class="dog-sub">{{ item.dogId?.maCho || "---" }}</div>
                  </div>
                </div>
              </td>

              <td>
                <div class="font-weight-bold">
                  {{ item.customerId?.fullName || item.customerId?.username || "---" }}
                </div>
                <div class="small text-muted">
                  {{ item.customerId?.phone || item.customerId?.email || "" }}
                </div>
              </td>

              <td>
                <span class="type-badge" :class="getTypeClass(item.reminderType)">
                  {{ item.reminderType }}
                </span>
              </td>

              <td>{{ formatDate(item.reminderDate) }}</td>

              <td>
                <span class="mini-badge" :class="item.isRecurring ? 'repeat-on' : 'repeat-off'">
                  {{ item.isRecurring ? `Mỗi ${item.repeatEveryDays} ngày` : "Một lần" }}
                </span>
              </td>

              <td>
                <span class="status-badge" :class="getStatusClass(item.status)">
                  {{ item.status }}
                </span>
              </td>

              <td>
                <div class="action-group">
                  <button class="btn btn-sm btn-outline-primary" @click="openEditStatusForm(item)">
                    <i class="fas fa-edit"></i>
                  </button>

                  <button class="btn btn-sm btn-outline-info" @click="openDetail(item)">
                    <i class="fas fa-eye"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL TẠO NHẮC LỊCH -->
    <div
      v-if="showCreateForm"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(0, 0, 0, 0.45);"
    >
      <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content border-0 shadow">
          <div class="modal-header modal-head-custom">
            <h5 class="modal-title mb-0">
              <i class="fas fa-bell mr-2"></i>Tạo nhắc lịch mới
            </h5>
            <button type="button" class="close text-white" @click="closeCreateForm">
              <span>&times;</span>
            </button>
          </div>

          <div class="modal-body">
            <div class="row">
              <div class="col-md-4 mb-3">
                <label class="font-weight-bold">Chọn bé chó</label>
                <select class="form-control" v-model="createForm.dogId">
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

              <div class="col-md-4 mb-3">
                <label class="font-weight-bold">Khách hàng</label>
                <select class="form-control" v-model="createForm.customerId">
                  <option value="">-- Chọn khách hàng --</option>
                  <option
                    v-for="customer in customers"
                    :key="customer._id || customer.id"
                    :value="customer._id || customer.id"
                  >
                    {{ customer.fullName || customer.username }}
                  </option>
                </select>
              </div>

              <div class="col-md-4 mb-3">
                <label class="font-weight-bold">Loại nhắc</label>
                <select class="form-control" v-model="createForm.reminderType">
                  <option value="Tiêm vaccine">Tiêm vaccine</option>
                  <option value="Tẩy giun">Tẩy giun</option>
                  <option value="Tái khám">Tái khám</option>
                  <option value="Chăm sóc định kỳ">Chăm sóc định kỳ</option>
                </select>
              </div>

              <div class="col-md-6 mb-3">
                <label class="font-weight-bold">Tiêu đề</label>
                <input v-model="createForm.title" type="text" class="form-control" />
              </div>

              <div class="col-md-6 mb-3">
                <label class="font-weight-bold">Ngày nhắc</label>
                <input v-model="createForm.reminderDate" type="datetime-local" class="form-control" />
              </div>

              <div class="col-md-12 mb-3">
                <label class="font-weight-bold">Mô tả</label>
                <textarea v-model="createForm.description" rows="3" class="form-control"></textarea>
              </div>

              <div class="col-md-6 mb-3">
                <div class="custom-control custom-switch mt-2">
                  <input
                    v-model="createForm.isRecurring"
                    type="checkbox"
                    class="custom-control-input"
                    id="recurringSwitch"
                  />
                  <label class="custom-control-label" for="recurringSwitch">
                    Đây là lịch lặp lại
                  </label>
                </div>
              </div>

              <div class="col-md-6 mb-3">
                <label class="font-weight-bold">Lặp lại mỗi bao nhiêu ngày</label>
                <input
                  v-model="createForm.repeatEveryDays"
                  type="number"
                  min="0"
                  class="form-control"
                  :disabled="!createForm.isRecurring"
                />
              </div>

              <div class="col-md-12 mb-3">
                <label class="font-weight-bold">Ghi chú</label>
                <textarea v-model="createForm.note" rows="2" class="form-control"></textarea>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeCreateForm">Hủy</button>
            <button class="btn btn-info text-white" @click="saveReminder">
              Tạo nhắc lịch
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL CẬP NHẬT TRẠNG THÁI -->
    <div
      v-if="showStatusForm"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(0, 0, 0, 0.45);"
    >
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header modal-head-custom">
            <h5 class="modal-title mb-0">
              <i class="fas fa-edit mr-2"></i>Cập nhật trạng thái nhắc lịch
            </h5>
            <button type="button" class="close text-white" @click="closeStatusForm">
              <span>&times;</span>
            </button>
          </div>

          <div class="modal-body">
            <p><strong>Tiêu đề:</strong> {{ selectedReminder?.title || "---" }}</p>
            <p><strong>Loại lịch:</strong> {{ selectedReminder?.reminderType || "---" }}</p>
            <p><strong>Ngày nhắc:</strong> {{ formatDate(selectedReminder?.reminderDate) }}</p>

            <div class="form-group">
              <label class="font-weight-bold">Trạng thái mới</label>
              <select class="form-control" v-model="statusForm.status">
                <option value="Chờ nhắc">Chờ nhắc</option>
                <option value="Đã gửi nhắc">Đã gửi nhắc</option>
                <option value="Đã hoàn thành">Đã hoàn thành</option>
                <option value="Đã hủy">Đã hủy</option>
              </select>
            </div>

            <div class="form-group">
              <label class="font-weight-bold">Ghi chú</label>
              <textarea v-model="statusForm.note" rows="3" class="form-control"></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeStatusForm">Hủy</button>
            <button class="btn btn-primary" @click="updateStatus">
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL CHI TIẾT -->
    <div
      v-if="selectedDetail"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(0, 0, 0, 0.45);"
    >
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content border-0 shadow">
          <div class="modal-header modal-head-custom">
            <h5 class="modal-title mb-0">
              <i class="fas fa-info-circle mr-2"></i>Chi tiết nhắc lịch
            </h5>
            <button type="button" class="close text-white" @click="selectedDetail = null">
              <span>&times;</span>
            </button>
          </div>

          <div class="modal-body">
            <p><strong>Bé chó:</strong> {{ selectedDetail.dogId?.name || "---" }}</p>
            <p><strong>Mã chó:</strong> {{ selectedDetail.dogId?.maCho || "---" }}</p>
            <p><strong>Khách hàng:</strong> {{ selectedDetail.customerId?.fullName || selectedDetail.customerId?.username || "---" }}</p>
            <p><strong>Loại nhắc:</strong> {{ selectedDetail.reminderType || "---" }}</p>
            <p><strong>Tiêu đề:</strong> {{ selectedDetail.title || "---" }}</p>
            <p><strong>Mô tả:</strong> {{ selectedDetail.description || "---" }}</p>
            <p><strong>Ngày nhắc:</strong> {{ formatDate(selectedDetail.reminderDate) }}</p>
            <p><strong>Trạng thái:</strong> {{ selectedDetail.status || "---" }}</p>
            <p><strong>Lặp lại:</strong> {{ selectedDetail.isRecurring ? `Có, mỗi ${selectedDetail.repeatEveryDays} ngày` : "Không" }}</p>
            <p><strong>Ngày tiếp theo:</strong> {{ formatDate(selectedDetail.nextReminderDate) }}</p>
            <p><strong>Ghi chú:</strong> {{ selectedDetail.note || "---" }}</p>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" @click="selectedDetail = null">Đóng</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DogReminderService from "@/services/dogReminder.service";
import DogService from "@/services/dog.service";
import createApiClient from "@/services/api.service";

export default {
  name: "DogReminderPage",

  data() {
    return {
      reminders: [],
      dogs: [],
      customers: [],
      loading: false,
      searchText: "",
      typeFilter: "Tất cả",
      statusFilter: "Tất cả",

      showCreateForm: false,
      showStatusForm: false,

      selectedReminder: null,
      selectedDetail: null,

      createForm: this.getDefaultCreateForm(),
      statusForm: {
        status: "Chờ nhắc",
        note: "",
      },
    };
  },

  computed: {
    filteredReminders() {
      return this.reminders.filter((item) => {
        const keyword = (this.searchText || "").toLowerCase();
        const dogName = item.dogId?.name ? item.dogId.name.toLowerCase() : "";
        const title = item.title ? item.title.toLowerCase() : "";

        const matchSearch = dogName.includes(keyword) || title.includes(keyword);
        const matchType =
          this.typeFilter === "Tất cả" || item.reminderType === this.typeFilter;
        const matchStatus =
          this.statusFilter === "Tất cả" || item.status === this.statusFilter;

        return matchSearch && matchType && matchStatus;
      });
    },
  },

  methods: {
    getDefaultCreateForm() {
      return {
        dogId: "",
        customerId: "",
        reminderType: "Tái khám",
        title: "",
        description: "",
        reminderDate: "",
        note: "",
        isRecurring: false,
        repeatEveryDays: 0,
      };
    },

    async fetchReminders() {
      try {
        this.loading = true;
        this.reminders = await DogReminderService.getAll();
      } catch (error) {
        console.error("Lỗi tải reminder:", error);
        alert(
          "Không thể tải danh sách nhắc lịch: " +
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

    async fetchCustomers() {
      try {
        const userApi = createApiClient("/api/auth");
        const users = (await userApi.get("/users")).data || [];
        this.customers = users.filter((item) => item.role === "customer");
      } catch (error) {
        console.error("Lỗi tải khách hàng:", error);
        this.customers = [];
      }
    },

    openCreateForm() {
      this.createForm = this.getDefaultCreateForm();
      this.createForm.reminderDate = this.formatForDateTimeLocal(new Date());
      this.showCreateForm = true;
    },

    closeCreateForm() {
      this.showCreateForm = false;
      this.createForm = this.getDefaultCreateForm();
    },

    async saveReminder() {
      try {
        const payload = {
          dogId: this.createForm.dogId,
          customerId: this.createForm.customerId,
          reminderType: this.createForm.reminderType,
          title: this.createForm.title,
          description: this.createForm.description,
          reminderDate: this.createForm.reminderDate,
          note: this.createForm.note,
          isRecurring: !!this.createForm.isRecurring,
          repeatEveryDays: this.createForm.isRecurring
            ? Number(this.createForm.repeatEveryDays || 0)
            : 0,
        };

        if (!payload.dogId || !payload.customerId || !payload.title || !payload.reminderDate) {
          alert("Vui lòng nhập đủ thông tin bắt buộc.");
          return;
        }

        if (payload.isRecurring && payload.repeatEveryDays <= 0) {
          alert("Lịch lặp phải có số ngày lặp lại lớn hơn 0.");
          return;
        }

        await DogReminderService.create(payload);
        alert("✅ Tạo nhắc lịch thành công!");
        this.closeCreateForm();
        await this.fetchReminders();
      } catch (error) {
        alert(
          "❌ Lỗi tạo nhắc lịch: " +
            (error.response?.data?.message || error.message)
        );
      }
    },

    openEditStatusForm(item) {
      this.selectedReminder = item;
      this.statusForm = {
        status: item.status || "Chờ nhắc",
        note: item.note || "",
      };
      this.showStatusForm = true;
    },

    closeStatusForm() {
      this.showStatusForm = false;
      this.selectedReminder = null;
      this.statusForm = {
        status: "Chờ nhắc",
        note: "",
      };
    },

    async updateStatus() {
      try {
        const id = this.selectedReminder?._id || this.selectedReminder?.id;
        if (!id) return;

        const result = await DogReminderService.updateStatus(id, this.statusForm);

        alert(
          result?.nextReminder
            ? "✅ Đã cập nhật và hệ thống đã tạo lịch nhắc kế tiếp!"
            : "✅ Cập nhật trạng thái nhắc lịch thành công!"
        );

        this.closeStatusForm();
        await this.fetchReminders();
      } catch (error) {
        alert(
          "❌ Lỗi cập nhật trạng thái: " +
            (error.response?.data?.message || error.message)
        );
      }
    },

    openDetail(item) {
      this.selectedDetail = item;
    },

    getDogImage(item) {
      if (item?.dogId?.image) {
        return "http://localhost:3000" + item.dogId.image;
      }
      return "https://via.placeholder.com/120";
    },

    getTypeClass(type) {
      if (type === "Tiêm vaccine") return "type-vaccine";
      if (type === "Tẩy giun") return "type-deworm";
      if (type === "Tái khám") return "type-checkup";
      return "type-care";
    },

    getStatusClass(status) {
      if (status === "Chờ nhắc") return "status-wait";
      if (status === "Đã gửi nhắc") return "status-sent";
      if (status === "Đã hoàn thành") return "status-done";
      if (status === "Đã hủy") return "status-cancel";
      return "status-default";
    },

    formatDate(date) {
      if (!date) return "---";
      return new Date(date).toLocaleString("vi-VN");
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
    await Promise.all([
      this.fetchReminders(),
      this.fetchDogs(),
      this.fetchCustomers(),
    ]);
  },
};
</script>

<style scoped>
.dog-reminder-page {
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
  grid-template-columns: 1fr 220px 220px 140px;
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

.reminder-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1100px;
}

.reminder-table thead th {
  background: #f8f3fc;
  color: #514564;
  font-size: 0.9rem;
  font-weight: 800;
  padding: 14px 12px;
  border-bottom: 1px solid #ece3f4;
  text-align: left;
  white-space: nowrap;
}

.reminder-table tbody td {
  padding: 15px 12px;
  border-bottom: 1px solid #f2ebf8;
  vertical-align: middle;
  font-size: 0.92rem;
  color: #3d3450;
}

.reminder-table tbody tr:hover {
  background: #fcfaff;
}

.reminder-table tbody tr:last-child td {
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

.type-badge,
.status-badge,
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

.type-vaccine {
  background: #e3f2fd;
  color: #1565c0;
}

.type-deworm {
  background: #fff3d8;
  color: #b7791f;
}

.type-checkup {
  background: #ede9fe;
  color: #5b21b6;
}

.type-care {
  background: #e7f8ee;
  color: #15803d;
}

.status-wait {
  background: #fff3d8;
  color: #b7791f;
}

.status-sent {
  background: #e3f2fd;
  color: #1565c0;
}

.status-done {
  background: #e7f8ee;
  color: #15803d;
}

.status-cancel {
  background: #fdeaea;
  color: #dc2626;
}

.status-default {
  background: #f3f4f6;
  color: #4b5563;
}

.repeat-on {
  background: #efe7ff;
  color: #6a1b9a;
}

.repeat-off {
  background: #f3f4f6;
  color: #4b5563;
}

.modal-head-custom {
  background: linear-gradient(135deg, #29b6f6, #0288d1);
  color: #fff;
}

@media (max-width: 991.98px) {
  .toolbar-grid {
    grid-template-columns: 1fr;
  }
}
</style>