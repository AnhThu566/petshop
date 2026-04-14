<template>
  <div class="dog-care-page">
    <div class="page-head">
      <div>
        <h3 class="page-title">
          <i class="fas fa-heartbeat text-success mr-2"></i>
          QUẢN LÝ THEO DÕI SAU BÁN
        </h3>
        <p class="page-subtitle mb-0">
          Theo dõi chăm sóc, tái khám và cập nhật tình trạng các bé chó sau khi bàn giao
        </p>
      </div>

      <button class="btn btn-success font-weight-bold" @click="openCreateForm">
        <i class="fas fa-plus-circle mr-2"></i> Tạo hồ sơ theo dõi
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

        <select class="form-control" v-model="statusFilter">
          <option value="Tất cả">Tất cả trạng thái</option>
          <option value="Đang theo dõi">Đang theo dõi</option>
          <option value="Ổn định">Ổn định</option>
          <option value="Cần tái khám">Cần tái khám</option>
          <option value="Đã kết thúc theo dõi">Đã kết thúc theo dõi</option>
        </select>

        <button class="btn btn-outline-secondary" @click="fetchRecords">
          <i class="fas fa-sync-alt mr-1"></i> Làm mới
        </button>
      </div>
    </div>

    <div v-if="loading" class="empty-panel">
      <i class="fas fa-spinner fa-spin empty-icon"></i>
      <p>Đang tải hồ sơ theo dõi sau bán...</p>
    </div>

    <div v-else-if="filteredRecords.length === 0" class="empty-panel">
      <i class="fas fa-folder-open empty-icon"></i>
      <p>Chưa có hồ sơ theo dõi sau bán nào phù hợp</p>
    </div>

    <div v-else class="table-card">
      <div class="table-wrap">
        <table class="care-table">
          <thead>
            <tr>
              <th>Bé chó</th>
              <th>Khách hàng</th>
              <th>Ngày bàn giao</th>
              <th>Tình trạng bàn giao</th>
              <th>Trạng thái theo dõi</th>
              <th>Lần follow-up</th>
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

              <td>
                <div class="font-weight-bold">
                  {{ item.customerId?.fullName || item.customerId?.username || "---" }}
                </div>
                <div class="small text-muted">
                  {{ item.customerId?.phone || item.customerId?.email || "" }}
                </div>
              </td>

              <td>{{ formatDate(item.handoverDate) }}</td>
              <td>{{ item.handoverCondition || "---" }}</td>
              <td>
                <span class="status-badge" :class="getStatusClass(item.currentStatus)">
                  {{ item.currentStatus || "---" }}
                </span>
              </td>
              <td>{{ item.followUps?.length || 0 }}</td>
              <td>
                <div class="action-group">
                  <button class="btn btn-sm btn-outline-primary" @click="openEditForm(item)">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-info" @click="openDetail(item)">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-success" @click="openFollowUpForm(item)">
                    <i class="fas fa-plus"></i>
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

    <!-- MODAL FORM CREATE / UPDATE -->
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
              <i class="fas fa-heartbeat mr-2"></i>
              {{ form._id || form.id ? "Cập nhật hồ sơ theo dõi sau bán" : "Tạo hồ sơ theo dõi sau bán" }}
            </h5>
            <button type="button" class="close text-white" @click="closeForm">
              <span>&times;</span>
            </button>
          </div>

          <div class="modal-body">
            <div class="row">
              <div class="col-md-4 mb-3">
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

              <div class="col-md-4 mb-3">
                <label class="font-weight-bold">Chọn đơn hàng</label>
                <select class="form-control" v-model="form.orderId">
                  <option value="">-- Chọn đơn hàng --</option>
                  <option
                    v-for="order in completedOrders"
                    :key="order._id || order.id"
                    :value="order._id || order.id"
                  >
                    #{{ getShortCode(order._id || order.id) }} - {{ order.dogId?.name || "Đơn hàng" }}
                  </option>
                </select>
              </div>

              <div class="col-md-4 mb-3">
                <label class="font-weight-bold">Khách hàng</label>
                <select class="form-control" v-model="form.customerId">
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

              <div class="col-md-6 mb-3">
                <label class="font-weight-bold">Ngày bàn giao</label>
                <input v-model="form.handoverDate" type="datetime-local" class="form-control" />
              </div>

              <div class="col-md-6 mb-3">
                <label class="font-weight-bold">Ngày kiểm tra tiếp theo</label>
                <input v-model="form.nextCheckDate" type="datetime-local" class="form-control" />
              </div>

              <div class="col-md-6 mb-3">
                <label class="font-weight-bold">Tình trạng lúc bàn giao</label>
                <input v-model="form.handoverCondition" type="text" class="form-control" />
              </div>

              <div class="col-md-6 mb-3">
                <label class="font-weight-bold">Trạng thái theo dõi</label>
                <select class="form-control" v-model="form.currentStatus">
                  <option value="Đang theo dõi">Đang theo dõi</option>
                  <option value="Ổn định">Ổn định</option>
                  <option value="Cần tái khám">Cần tái khám</option>
                  <option value="Đã kết thúc theo dõi">Đã kết thúc theo dõi</option>
                </select>
              </div>

              <div class="col-md-12 mb-3">
                <label class="font-weight-bold">Ghi chú ban đầu</label>
                <textarea v-model="form.initialCareNote" rows="3" class="form-control"></textarea>
              </div>

              <div class="col-md-12 mb-3">
                <label class="font-weight-bold">Ghi chú quản trị</label>
                <textarea v-model="form.adminNote" rows="3" class="form-control"></textarea>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeForm">Hủy</button>
            <button class="btn btn-success" @click="saveRecord">
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
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content border-0 shadow">
          <div class="modal-header modal-head-custom">
            <h5 class="modal-title mb-0">
              <i class="fas fa-file-medical-alt mr-2"></i>Chi tiết hồ sơ theo dõi sau bán
            </h5>
            <button type="button" class="close text-white" @click="selectedRecord = null">
              <span>&times;</span>
            </button>
          </div>

          <div class="modal-body">
            <p><strong>Bé chó:</strong> {{ selectedRecord.dogId?.name || "---" }}</p>
            <p><strong>Mã chó:</strong> {{ selectedRecord.dogId?.maCho || "---" }}</p>
            <p><strong>Khách hàng:</strong> {{ selectedRecord.customerId?.fullName || selectedRecord.customerId?.username || "---" }}</p>
            <p><strong>Ngày bàn giao:</strong> {{ formatDate(selectedRecord.handoverDate) }}</p>
            <p><strong>Tình trạng bàn giao:</strong> {{ selectedRecord.handoverCondition || "---" }}</p>
            <p><strong>Ghi chú ban đầu:</strong> {{ selectedRecord.initialCareNote || "---" }}</p>
            <p><strong>Trạng thái hiện tại:</strong> {{ selectedRecord.currentStatus || "---" }}</p>
            <p><strong>Ngày kiểm tra tiếp theo:</strong> {{ formatDate(selectedRecord.nextCheckDate) }}</p>
            <p><strong>Ghi chú quản trị:</strong> {{ selectedRecord.adminNote || "---" }}</p>

            <hr />
            <h6 class="font-weight-bold text-success">Lịch sử follow-up</h6>

            <div v-if="selectedRecord.followUps && selectedRecord.followUps.length > 0">
              <div
                v-for="(follow, index) in selectedRecord.followUps"
                :key="index"
                class="follow-up-item"
              >
                <div><strong>Ngày theo dõi:</strong> {{ formatDate(follow.followUpDate) }}</div>
                <div><strong>Tình trạng:</strong> {{ follow.condition || "---" }}</div>
                <div><strong>Ăn uống:</strong> {{ follow.appetiteStatus || "---" }}</div>
                <div><strong>Vận động:</strong> {{ follow.activityStatus || "---" }}</div>
                <div><strong>Ghi chú:</strong> {{ follow.note || "---" }}</div>
              </div>
            </div>

            <div v-else class="text-muted">Chưa có lần follow-up nào.</div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" @click="selectedRecord = null">Đóng</button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL ADD FOLLOW-UP -->
    <div
      v-if="showFollowUpForm"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(0, 0, 0, 0.45);"
    >
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header modal-head-custom">
            <h5 class="modal-title mb-0">
              <i class="fas fa-stethoscope mr-2"></i>Thêm lần theo dõi
            </h5>
            <button type="button" class="close text-white" @click="closeFollowUpForm">
              <span>&times;</span>
            </button>
          </div>

          <div class="modal-body">
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="font-weight-bold">Ngày theo dõi</label>
                <input v-model="followUpForm.followUpDate" type="datetime-local" class="form-control" />
              </div>

              <div class="col-md-6 mb-3">
                <label class="font-weight-bold">Tình trạng hiện tại</label>
                <input v-model="followUpForm.condition" type="text" class="form-control" />
              </div>

              <div class="col-md-6 mb-3">
                <label class="font-weight-bold">Ăn uống</label>
                <input v-model="followUpForm.appetiteStatus" type="text" class="form-control" />
              </div>

              <div class="col-md-6 mb-3">
                <label class="font-weight-bold">Vận động</label>
                <input v-model="followUpForm.activityStatus" type="text" class="form-control" />
              </div>

              <div class="col-md-12 mb-3">
                <label class="font-weight-bold">Ghi chú</label>
                <textarea v-model="followUpForm.note" rows="3" class="form-control"></textarea>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeFollowUpForm">Hủy</button>
            <button class="btn btn-success" @click="saveFollowUp">Lưu follow-up</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DogCareRecordService from "@/services/dogCareRecord.service";
import DogService from "@/services/dog.service";
import OrderService from "@/services/order.service";
import createApiClient from "@/services/api.service";

export default {
  name: "DogCareRecordPage",

  data() {
    return {
      records: [],
      dogs: [],
      completedOrders: [],
      customers: [],
      loading: false,
      searchText: "",
      statusFilter: "Tất cả",
      showForm: false,
      showFollowUpForm: false,
      selectedRecord: null,
      selectedFollowUpRecordId: "",
      form: this.getDefaultForm(),
      followUpForm: this.getDefaultFollowUpForm(),
    };
  },

  computed: {
    filteredRecords() {
      return this.records.filter((item) => {
        const keyword = (this.searchText || "").toLowerCase();
        const dogName = item.dogId?.name ? item.dogId.name.toLowerCase() : "";
        const dogCode = item.dogId?.maCho ? item.dogId.maCho.toLowerCase() : "";

        const matchSearch = dogName.includes(keyword) || dogCode.includes(keyword);
        const matchStatus =
          this.statusFilter === "Tất cả" || item.currentStatus === this.statusFilter;

        return matchSearch && matchStatus;
      });
    },
  },

  methods: {
    getDefaultForm() {
      return {
        _id: "",
        dogId: "",
        orderId: "",
        customerId: "",
        handoverDate: "",
        handoverCondition: "",
        initialCareNote: "",
        currentStatus: "Đang theo dõi",
        nextCheckDate: "",
        adminNote: "",
      };
    },

    getDefaultFollowUpForm() {
      return {
        followUpDate: "",
        condition: "",
        appetiteStatus: "",
        activityStatus: "",
        note: "",
      };
    },

    async fetchRecords() {
      try {
        this.loading = true;
        this.records = await DogCareRecordService.getAll();
      } catch (error) {
        console.error("Lỗi tải hồ sơ theo dõi sau bán:", error);
        alert(
          "Không thể tải hồ sơ theo dõi sau bán: " +
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

    async fetchOrders() {
      try {
        const orders = await OrderService.getAll();
        this.completedOrders = (orders || []).filter((item) => item.status === "Hoàn thành");
      } catch (error) {
        console.error("Lỗi tải đơn hàng:", error);
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
      this.form = this.getDefaultForm();
      this.form.handoverDate = this.formatForDateTimeLocal(new Date());
      this.showForm = true;
    },

    openEditForm(item) {
      this.form = {
        _id: item._id || item.id,
        dogId: item.dogId?._id || item.dogId?.id || "",
        orderId: item.orderId?._id || item.orderId?.id || "",
        customerId: item.customerId?._id || item.customerId?.id || "",
        handoverDate: this.formatForDateTimeLocal(item.handoverDate),
        handoverCondition: item.handoverCondition || "",
        initialCareNote: item.initialCareNote || "",
        currentStatus: item.currentStatus || "Đang theo dõi",
        nextCheckDate: this.formatForDateTimeLocal(item.nextCheckDate),
        adminNote: item.adminNote || "",
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
          orderId: this.form.orderId,
          customerId: this.form.customerId,
          handoverDate: this.form.handoverDate || null,
          handoverCondition: this.form.handoverCondition,
          initialCareNote: this.form.initialCareNote,
          currentStatus: this.form.currentStatus,
          nextCheckDate: this.form.nextCheckDate || null,
          adminNote: this.form.adminNote,
        };

        if (!payload.dogId || !payload.orderId || !payload.customerId) {
          alert("Vui lòng nhập đủ thông tin bắt buộc.");
          return;
        }

        if (this.form._id) {
          await DogCareRecordService.update(this.form._id, payload);
          alert("✅ Cập nhật hồ sơ theo dõi sau bán thành công!");
        } else {
          await DogCareRecordService.create(payload);
          alert("✅ Tạo hồ sơ theo dõi sau bán thành công!");
        }

        this.closeForm();
        await this.fetchRecords();
      } catch (error) {
        alert(
          "❌ Lỗi lưu hồ sơ theo dõi sau bán: " +
            (error.response?.data?.message || error.message)
        );
      }
    },

    async removeRecord(item) {
      const id = item._id || item.id;
      if (!id) return;

      if (!confirm("Bạn có chắc muốn xóa hồ sơ theo dõi sau bán này không?")) {
        return;
      }

      try {
        await DogCareRecordService.delete(id);
        alert("✅ Xóa hồ sơ theo dõi sau bán thành công!");
        await this.fetchRecords();
      } catch (error) {
        alert(
          "❌ Lỗi xóa hồ sơ theo dõi sau bán: " +
            (error.response?.data?.message || error.message)
        );
      }
    },

    openFollowUpForm(item) {
      this.selectedFollowUpRecordId = item._id || item.id;
      this.followUpForm = this.getDefaultFollowUpForm();
      this.followUpForm.followUpDate = this.formatForDateTimeLocal(new Date());
      this.showFollowUpForm = true;
    },

    closeFollowUpForm() {
      this.showFollowUpForm = false;
      this.selectedFollowUpRecordId = "";
      this.followUpForm = this.getDefaultFollowUpForm();
    },

    async saveFollowUp() {
      try {
        if (!this.selectedFollowUpRecordId) return;

        await DogCareRecordService.addFollowUp(this.selectedFollowUpRecordId, {
          followUpDate: this.followUpForm.followUpDate || null,
          condition: this.followUpForm.condition,
          appetiteStatus: this.followUpForm.appetiteStatus,
          activityStatus: this.followUpForm.activityStatus,
          note: this.followUpForm.note,
        });

        alert("✅ Thêm lần theo dõi thành công!");
        this.closeFollowUpForm();
        await this.fetchRecords();
      } catch (error) {
        alert(
          "❌ Lỗi thêm follow-up: " +
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

    getStatusClass(status) {
      if (status === "Đang theo dõi") return "status-tracking";
      if (status === "Ổn định") return "status-stable";
      if (status === "Cần tái khám") return "status-warning";
      if (status === "Đã kết thúc theo dõi") return "status-done";
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

    getShortCode(id) {
      if (!id) return "------";
      return String(id).slice(-6).toUpperCase();
    },
  },

  async mounted() {
    await Promise.all([
      this.fetchRecords(),
      this.fetchDogs(),
      this.fetchOrders(),
      this.fetchCustomers(),
    ]);
  },
};
</script>

<style scoped>
.dog-care-page {
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

.care-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1050px;
}

.care-table thead th {
  background: #f8f3fc;
  color: #514564;
  font-size: 0.9rem;
  font-weight: 800;
  padding: 14px 12px;
  border-bottom: 1px solid #ece3f4;
  text-align: left;
  white-space: nowrap;
}

.care-table tbody td {
  padding: 15px 12px;
  border-bottom: 1px solid #f2ebf8;
  vertical-align: middle;
  font-size: 0.92rem;
  color: #3d3450;
}

.care-table tbody tr:hover {
  background: #fcfaff;
}

.care-table tbody tr:last-child td {
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

.status-tracking {
  background: #efe7ff;
  color: #6a1b9a;
}

.status-stable {
  background: #e7f8ee;
  color: #15803d;
}

.status-warning {
  background: #fff3d8;
  color: #b7791f;
}

.status-done {
  background: #e5e7eb;
  color: #374151;
}

.status-default {
  background: #f3f4f6;
  color: #4b5563;
}

.follow-up-item {
  border: 1px solid #eee2f7;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 10px;
  background: #faf7fd;
}

.modal-head-custom {
  background: linear-gradient(135deg, #198754, #157347);
  color: #fff;
}

@media (max-width: 991.98px) {
  .toolbar-grid {
    grid-template-columns: 1fr;
  }
}
</style>