<template>
  <div class="notification-page">
    <div class="page-head">
      <div>
        <h3 class="page-title">
          <i class="fas fa-bell text-warning mr-2"></i>
          QUẢN LÝ THÔNG BÁO
        </h3>
        <p class="page-subtitle mb-0">
          Xem, lọc và tạo thông báo cho khách hàng, trang trại hoặc toàn hệ thống
        </p>
      </div>

      <button class="btn btn-warning text-dark font-weight-bold" @click="openCreateForm">
        <i class="fas fa-plus-circle mr-2"></i> Tạo thông báo
      </button>
    </div>

    <div class="toolbar-card">
      <div class="toolbar-grid">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input
            v-model="searchText"
            type="text"
            placeholder="Tìm theo tiêu đề hoặc nội dung"
          />
        </div>

        <select class="form-control" v-model="targetRoleFilter">
          <option value="Tất cả">Tất cả đối tượng</option>
          <option value="customer">Khách hàng</option>
          <option value="farm">Trang trại</option>
          <option value="admin">Admin</option>
          <option value="all">Toàn hệ thống</option>
        </select>

        <select class="form-control" v-model="typeFilter">
          <option value="Tất cả">Tất cả loại</option>
          <option value="DOG_CREATED">Hồ sơ chó</option>
          <option value="DOG_APPROVED">Duyệt chó</option>
          <option value="DOG_REJECTED">Từ chối chó</option>
          <option value="DOG_ORDER_CREATED">Đơn đặt cọc</option>
          <option value="DOG_ORDER_UPDATED">Cập nhật đơn</option>
          <option value="DOG_HEALTH_UPDATE">Sức khỏe</option>
          <option value="DOG_CARE_UPDATE">Theo dõi sau bán</option>
          <option value="DOG_REMINDER">Nhắc lịch</option>
          <option value="ACCESSORY_ORDER_CREATED">Đơn phụ kiện</option>
          <option value="ACCESSORY_ORDER_UPDATED">Cập nhật phụ kiện</option>
          <option value="SERVICE_BOOKING_CREATED">Đặt dịch vụ</option>
          <option value="SERVICE_BOOKING_UPDATED">Cập nhật dịch vụ</option>
          <option value="GENERAL">Chung</option>
        </select>

        <button class="btn btn-outline-secondary" @click="fetchNotifications">
          <i class="fas fa-sync-alt mr-1"></i> Làm mới
        </button>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stats-card">
        <div class="stats-label">Tổng thông báo</div>
        <div class="stats-value">{{ notifications.length }}</div>
      </div>
      <div class="stats-card">
        <div class="stats-label">Chưa đọc</div>
        <div class="stats-value text-danger">{{ unreadCount }}</div>
      </div>
      <div class="stats-card">
        <div class="stats-label">Đã đọc</div>
        <div class="stats-value text-success">{{ readCount }}</div>
      </div>
    </div>

    <div v-if="loading" class="empty-panel">
      <i class="fas fa-spinner fa-spin empty-icon"></i>
      <p>Đang tải thông báo...</p>
    </div>

    <div v-else-if="filteredNotifications.length === 0" class="empty-panel">
      <i class="fas fa-bell-slash empty-icon"></i>
      <p>Chưa có thông báo nào phù hợp</p>
    </div>

    <div v-else class="table-card">
      <div class="table-wrap">
        <table class="notification-table">
          <thead>
            <tr>
              <th>Tiêu đề</th>
              <th>Loại</th>
              <th>Đối tượng</th>
              <th>Trạng thái</th>
              <th>Thời gian</th>
              <th>Thao tác</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="item in filteredNotifications" :key="item._id || item.id">
              <td>
                <div class="title-cell">
                  <div class="notification-title">{{ item.title || "---" }}</div>
                  <div class="notification-message">
                    {{ item.message || "---" }}
                  </div>
                </div>
              </td>

              <td>
                <span class="type-badge" :class="getTypeClass(item.type)">
                  {{ getTypeLabel(item.type) }}
                </span>
              </td>

              <td>
                <span class="target-badge" :class="getTargetRoleClass(item.targetRole)">
                  {{ getTargetRoleLabel(item.targetRole) }}
                </span>
              </td>

              <td>
                <span class="read-badge" :class="item.isRead ? 'is-read' : 'is-unread'">
                  {{ item.isRead ? "Đã đọc" : "Chưa đọc" }}
                </span>
              </td>

              <td>{{ formatDate(item.createdAt || item.sentAt) }}</td>

              <td>
                <div class="action-group">
                  <button class="btn btn-sm btn-outline-info" @click="openDetail(item)">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="removeNotification(item)">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL TẠO THÔNG BÁO -->
    <div
      v-if="showCreateForm"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(0, 0, 0, 0.45);"
    >
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header modal-head-custom">
            <h5 class="modal-title mb-0">
              <i class="fas fa-plus-circle mr-2"></i>Tạo thông báo
            </h5>
            <button type="button" class="close text-white" @click="closeCreateForm">
              <span>&times;</span>
            </button>
          </div>

          <div class="modal-body">
            <div class="form-group">
              <label class="font-weight-bold">Tiêu đề</label>
              <input v-model="createForm.title" type="text" class="form-control" />
            </div>

            <div class="form-group">
              <label class="font-weight-bold">Nội dung</label>
              <textarea v-model="createForm.message" rows="4" class="form-control"></textarea>
            </div>

            <div class="form-row">
              <div class="form-group col-md-6">
                <label class="font-weight-bold">Loại thông báo</label>
                <select class="form-control" v-model="createForm.type">
                  <option value="GENERAL">Chung</option>
                  <option value="DOG_ORDER_UPDATED">Cập nhật đơn</option>
                  <option value="DOG_HEALTH_UPDATE">Sức khỏe</option>
                  <option value="DOG_CARE_UPDATE">Theo dõi sau bán</option>
                  <option value="DOG_REMINDER">Nhắc lịch</option>
                  <option value="SERVICE_BOOKING_UPDATED">Cập nhật dịch vụ</option>
                  <option value="ACCESSORY_ORDER_UPDATED">Cập nhật phụ kiện</option>
                </select>
              </div>

              <div class="form-group col-md-6">
                <label class="font-weight-bold">Đối tượng nhận</label>
                <select class="form-control" v-model="createForm.targetRole">
                  <option value="customer">Khách hàng</option>
                  <option value="farm">Trang trại</option>
                  <option value="admin">Admin</option>
                  <option value="all">Toàn hệ thống</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group col-md-6">
                <label class="font-weight-bold">User ID (nếu gửi riêng khách)</label>
                <input v-model="createForm.userId" type="text" class="form-control" />
              </div>

              <div class="form-group col-md-6">
                <label class="font-weight-bold">Farm ID (nếu gửi riêng trại)</label>
                <input v-model="createForm.farmId" type="text" class="form-control" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group col-md-6">
                <label class="font-weight-bold">Related ID</label>
                <input v-model="createForm.relatedId" type="text" class="form-control" />
              </div>

              <div class="form-group col-md-6">
                <label class="font-weight-bold">Related Model</label>
                <input v-model="createForm.relatedModel" type="text" class="form-control" />
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeCreateForm">Hủy</button>
            <button class="btn btn-warning text-dark" @click="saveNotification">
              Tạo thông báo
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL CHI TIẾT -->
    <div
      v-if="selectedNotification"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(0, 0, 0, 0.45);"
    >
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content border-0 shadow">
          <div class="modal-header modal-head-custom">
            <h5 class="modal-title mb-0">
              <i class="fas fa-info-circle mr-2"></i>Chi tiết thông báo
            </h5>
            <button type="button" class="close text-white" @click="selectedNotification = null">
              <span>&times;</span>
            </button>
          </div>

          <div class="modal-body">
            <p><strong>Tiêu đề:</strong> {{ selectedNotification.title || "---" }}</p>
            <p><strong>Nội dung:</strong> {{ selectedNotification.message || "---" }}</p>
            <p><strong>Loại:</strong> {{ getTypeLabel(selectedNotification.type) }}</p>
            <p><strong>Đối tượng:</strong> {{ getTargetRoleLabel(selectedNotification.targetRole) }}</p>
            <p><strong>Trạng thái:</strong> {{ selectedNotification.isRead ? "Đã đọc" : "Chưa đọc" }}</p>
            <p><strong>Thời gian tạo:</strong> {{ formatDate(selectedNotification.createdAt || selectedNotification.sentAt) }}</p>
            <p><strong>User ID:</strong> {{ selectedNotification.userId?._id || selectedNotification.userId?.id || selectedNotification.userId || "---" }}</p>
            <p><strong>Farm ID:</strong> {{ selectedNotification.farmId?._id || selectedNotification.farmId?.id || selectedNotification.farmId || "---" }}</p>
            <p><strong>Related ID:</strong> {{ selectedNotification.relatedId || "---" }}</p>
            <p><strong>Related Model:</strong> {{ selectedNotification.relatedModel || "---" }}</p>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" @click="selectedNotification = null">Đóng</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import NotificationService from "@/services/notification.service";

export default {
  name: "NotificationPage",

  data() {
    return {
      notifications: [],
      loading: false,
      searchText: "",
      targetRoleFilter: "Tất cả",
      typeFilter: "Tất cả",
      showCreateForm: false,
      selectedNotification: null,
      createForm: this.getDefaultCreateForm(),
    };
  },

  computed: {
    filteredNotifications() {
      return this.notifications.filter((item) => {
        const keyword = (this.searchText || "").toLowerCase();
        const title = item.title ? item.title.toLowerCase() : "";
        const message = item.message ? item.message.toLowerCase() : "";

        const matchSearch = title.includes(keyword) || message.includes(keyword);
        const matchTarget =
          this.targetRoleFilter === "Tất cả" || item.targetRole === this.targetRoleFilter;
        const matchType =
          this.typeFilter === "Tất cả" || item.type === this.typeFilter;

        return matchSearch && matchTarget && matchType;
      });
    },

    unreadCount() {
      return this.notifications.filter((item) => !item.isRead).length;
    },

    readCount() {
      return this.notifications.filter((item) => item.isRead).length;
    },
  },

  methods: {
    getDefaultCreateForm() {
      return {
        userId: "",
        farmId: "",
        title: "",
        message: "",
        type: "GENERAL",
        targetRole: "customer",
        relatedId: "",
        relatedModel: "",
      };
    },

    async fetchNotifications() {
      try {
        this.loading = true;
        this.notifications = await NotificationService.getAll();
      } catch (error) {
        console.error("Lỗi tải thông báo:", error);
        alert(
          "Không thể tải danh sách thông báo: " +
            (error.response?.data?.message || error.message)
        );
      } finally {
        this.loading = false;
      }
    },

    openCreateForm() {
      this.createForm = this.getDefaultCreateForm();
      this.showCreateForm = true;
    },

    closeCreateForm() {
      this.showCreateForm = false;
      this.createForm = this.getDefaultCreateForm();
    },

    async saveNotification() {
      try {
        const payload = {
          userId: this.createForm.userId || null,
          farmId: this.createForm.farmId || null,
          title: this.createForm.title,
          message: this.createForm.message,
          type: this.createForm.type,
          targetRole: this.createForm.targetRole,
          relatedId: this.createForm.relatedId || "",
          relatedModel: this.createForm.relatedModel || "",
        };

        if (!payload.title || !payload.message) {
          alert("Vui lòng nhập tiêu đề và nội dung thông báo.");
          return;
        }

        await NotificationService.create(payload);
        alert("✅ Tạo thông báo thành công!");
        this.closeCreateForm();
        await this.fetchNotifications();
      } catch (error) {
        alert(
          "❌ Lỗi tạo thông báo: " +
            (error.response?.data?.message || error.message)
        );
      }
    },

    openDetail(item) {
      this.selectedNotification = item;
    },

    async removeNotification(item) {
      const id = item._id || item.id;
      if (!id) return;

      if (!confirm("Bạn có chắc muốn xóa thông báo này không?")) {
        return;
      }

      try {
        await NotificationService.delete(id);
        alert("✅ Xóa thông báo thành công!");
        await this.fetchNotifications();
      } catch (error) {
        alert(
          "❌ Lỗi xóa thông báo: " +
            (error.response?.data?.message || error.message)
        );
      }
    },

    getTypeLabel(type) {
      if (type === "DOG_CREATED") return "Hồ sơ chó";
      if (type === "DOG_APPROVED") return "Duyệt chó";
      if (type === "DOG_REJECTED") return "Từ chối chó";
      if (type === "DOG_ORDER_CREATED") return "Đơn đặt cọc";
      if (type === "DOG_ORDER_UPDATED") return "Cập nhật đơn";
      if (type === "DOG_HEALTH_UPDATE") return "Sức khỏe";
      if (type === "DOG_CARE_UPDATE") return "Theo dõi sau bán";
      if (type === "DOG_REMINDER") return "Nhắc lịch";
      if (type === "ACCESSORY_ORDER_CREATED") return "Đơn phụ kiện";
      if (type === "ACCESSORY_ORDER_UPDATED") return "Cập nhật phụ kiện";
      if (type === "SERVICE_BOOKING_CREATED") return "Đặt dịch vụ";
      if (type === "SERVICE_BOOKING_UPDATED") return "Cập nhật dịch vụ";
      return "Thông báo";
    },

    getTypeClass(type) {
      if (type === "DOG_ORDER_CREATED" || type === "DOG_ORDER_UPDATED") return "type-order";
      if (type === "DOG_HEALTH_UPDATE") return "type-health";
      if (type === "DOG_CARE_UPDATE") return "type-care";
      if (type === "DOG_REMINDER") return "type-reminder";
      if (type === "SERVICE_BOOKING_CREATED" || type === "SERVICE_BOOKING_UPDATED")
        return "type-service";
      return "type-general";
    },

    getTargetRoleLabel(role) {
      if (role === "customer") return "Khách hàng";
      if (role === "farm") return "Trang trại";
      if (role === "admin") return "Admin";
      return "Toàn hệ thống";
    },

    getTargetRoleClass(role) {
      if (role === "customer") return "target-customer";
      if (role === "farm") return "target-farm";
      if (role === "admin") return "target-admin";
      return "target-all";
    },

    formatDate(date) {
      if (!date) return "---";
      return new Date(date).toLocaleString("vi-VN");
    },
  },

  async mounted() {
    await this.fetchNotifications();
  },
};
</script>

<style scoped>
.notification-page {
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
.empty-panel,
.stats-card {
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 16px;
}

.stats-card {
  padding: 18px;
}

.stats-label {
  color: #7b7287;
  font-size: 0.9rem;
}

.stats-value {
  font-size: 1.6rem;
  font-weight: 900;
  color: #2f1b44;
  margin-top: 4px;
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

.notification-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1100px;
}

.notification-table thead th {
  background: #f8f3fc;
  color: #514564;
  font-size: 0.9rem;
  font-weight: 800;
  padding: 14px 12px;
  border-bottom: 1px solid #ece3f4;
  text-align: left;
  white-space: nowrap;
}

.notification-table tbody td {
  padding: 15px 12px;
  border-bottom: 1px solid #f2ebf8;
  vertical-align: middle;
  font-size: 0.92rem;
  color: #3d3450;
}

.notification-table tbody tr:hover {
  background: #fcfaff;
}

.notification-table tbody tr:last-child td {
  border-bottom: none;
}

.title-cell {
  max-width: 360px;
}

.notification-title {
  font-weight: 800;
  color: #2f1b44;
  line-height: 1.35;
}

.notification-message {
  margin-top: 4px;
  color: #7b7287;
  font-size: 0.86rem;
  line-height: 1.5;
}

.action-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.type-badge,
.target-badge,
.read-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 7px 12px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 800;
  white-space: nowrap;
}

.type-order {
  background: #e3f2fd;
  color: #1565c0;
}

.type-health {
  background: #fce4ec;
  color: #c2185b;
}

.type-care {
  background: #e7f8ee;
  color: #15803d;
}

.type-reminder {
  background: #fff3d8;
  color: #b7791f;
}

.type-service {
  background: #ede9fe;
  color: #5b21b6;
}

.type-general {
  background: #f3f4f6;
  color: #4b5563;
}

.target-customer {
  background: #e3f2fd;
  color: #1565c0;
}

.target-farm {
  background: #e7f8ee;
  color: #15803d;
}

.target-admin {
  background: #fdeaea;
  color: #dc2626;
}

.target-all {
  background: #ede9fe;
  color: #5b21b6;
}

.is-read {
  background: #e7f8ee;
  color: #15803d;
}

.is-unread {
  background: #fdeaea;
  color: #dc2626;
}

.modal-head-custom {
  background: linear-gradient(135deg, #ffc107, #f0ad00);
  color: #2f1b44;
}

@media (max-width: 991.98px) {
  .toolbar-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>