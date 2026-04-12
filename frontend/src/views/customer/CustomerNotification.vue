<template>
  <div class="customer-notification-page bg-light py-4" style="min-height: 100vh;">
    <div class="container">
      <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3 flex-wrap">
        <h4 class="font-weight-bold text-dark mb-2">
          <i class="fas fa-bell text-warning mr-2"></i>
          THÔNG BÁO CỦA TÔI
        </h4>

        <div class="d-flex flex-wrap">
          <button class="btn btn-outline-primary btn-sm mr-2 mb-2 mb-md-0" @click="fetchNotifications">
            <i class="fas fa-sync-alt mr-1"></i> Làm mới
          </button>

          <button
            class="btn btn-warning btn-sm text-dark font-weight-bold"
            @click="markAllAsRead"
            :disabled="unreadCount === 0"
          >
            <i class="fas fa-check-double mr-1"></i> Đánh dấu đã đọc tất cả
          </button>
        </div>
      </div>

      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body py-3">
          <div class="row align-items-center">
            <div class="col-md-5 mb-2 mb-md-0">
              <div class="input-group input-group-sm">
                <div class="input-group-prepend">
                  <span class="input-group-text bg-white">
                    <i class="fas fa-search text-primary"></i>
                  </span>
                </div>
                <input
                  type="text"
                  class="form-control"
                  placeholder="Tìm theo tiêu đề hoặc nội dung..."
                  v-model="searchText"
                />
              </div>
            </div>

            <div class="col-md-7 text-md-right">
              <div class="btn-group flex-wrap">
                <button
                  class="btn btn-sm"
                  :class="filterRead === 'Tất cả' ? 'btn-dark' : 'btn-light'"
                  @click="filterRead = 'Tất cả'"
                >
                  Tất cả
                </button>
                <button
                  class="btn btn-sm"
                  :class="filterRead === 'Chưa đọc' ? 'btn-danger text-white' : 'btn-light'"
                  @click="filterRead = 'Chưa đọc'"
                >
                  Chưa đọc
                </button>
                <button
                  class="btn btn-sm"
                  :class="filterRead === 'Đã đọc' ? 'btn-success text-white' : 'btn-light'"
                  @click="filterRead = 'Đã đọc'"
                >
                  Đã đọc
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row mb-4">
        <div class="col-md-4 mb-3">
          <div class="card border-0 shadow-sm text-center py-3">
            <div class="small text-muted">Tổng thông báo</div>
            <h4 class="font-weight-bold text-dark mb-0">{{ notifications.length }}</h4>
          </div>
        </div>

        <div class="col-md-4 mb-3">
          <div class="card border-0 shadow-sm text-center py-3">
            <div class="small text-muted">Chưa đọc</div>
            <h4 class="font-weight-bold text-danger mb-0">{{ unreadCount }}</h4>
          </div>
        </div>

        <div class="col-md-4 mb-3">
          <div class="card border-0 shadow-sm text-center py-3">
            <div class="small text-muted">Đã đọc</div>
            <h4 class="font-weight-bold text-success mb-0">{{ readCount }}</h4>
          </div>
        </div>
      </div>

      <div v-if="filteredNotifications.length > 0">
        <div
          v-for="item in filteredNotifications"
          :key="item._id || item.id"
          class="card border-0 shadow-sm mb-3 notification-card"
          :class="{ 'unread-card': !item.isRead }"
        >
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start flex-wrap">
              <div class="pr-md-3 mb-3 mb-md-0" style="flex: 1;">
                <div class="d-flex align-items-center mb-2 flex-wrap">
                  <span class="badge px-3 py-2 mr-2 mb-2" :class="getTypeClass(item.type)">
                    {{ getTypeLabel(item.type) }}
                  </span>

                  <span
                    class="badge px-3 py-2 mb-2"
                    :class="item.isRead ? 'badge-success' : 'badge-danger'"
                  >
                    {{ item.isRead ? "Đã đọc" : "Chưa đọc" }}
                  </span>
                </div>

                <h5 class="font-weight-bold text-dark mb-2">
                  {{ item.title || "---" }}
                </h5>

                <p class="text-muted mb-2" style="white-space: pre-line;">
                  {{ item.message || "---" }}
                </p>

                <div class="small text-muted">
                  <i class="far fa-clock mr-1"></i>
                  {{ formatDateTime(item.createdAt || item.sentAt) }}
                </div>
              </div>

              <div class="text-md-right">
                <button
                  v-if="!item.isRead"
                  class="btn btn-sm btn-outline-primary"
                  @click="markAsRead(item)"
                >
                  <i class="fas fa-check mr-1"></i> Đánh dấu đã đọc
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="card border-0 shadow-sm">
        <div class="card-body text-center py-5 text-muted">
          <i class="fas fa-bell-slash fa-3x mb-3 d-block"></i>
          Hiện chưa có thông báo nào phù hợp.
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import NotificationService from "@/services/notification.service";

export default {
  name: "CustomerNotification",

  data() {
    return {
      notifications: [],
      searchText: "",
      filterRead: "Tất cả",
    };
  },

  computed: {
    unreadCount() {
      return this.notifications.filter((item) => !item.isRead).length;
    },

    readCount() {
      return this.notifications.filter((item) => item.isRead).length;
    },

    filteredNotifications() {
      return this.notifications.filter((item) => {
        const keyword = (this.searchText || "").toLowerCase();
        const title = item.title ? item.title.toLowerCase() : "";
        const message = item.message ? item.message.toLowerCase() : "";

        const matchSearch =
          title.includes(keyword) || message.includes(keyword);

        let matchRead = true;
        if (this.filterRead === "Chưa đọc") {
          matchRead = !item.isRead;
        } else if (this.filterRead === "Đã đọc") {
          matchRead = !!item.isRead;
        }

        return matchSearch && matchRead;
      });
    },
  },

  methods: {
    async fetchNotifications() {
      try {
        this.notifications = await NotificationService.getCustomerNotifications();
      } catch (error) {
        console.error("Lỗi tải thông báo:", error);
        alert(
          "Không thể tải thông báo của bạn: " +
            (error.response?.data?.message || error.message)
        );
      }
    },

    async markAsRead(item) {
      const id = item._id || item.id;
      if (!id) return;

      try {
        await NotificationService.markCustomerNotificationAsRead(id);
        await this.fetchNotifications();
      } catch (error) {
        alert(
          "Lỗi cập nhật thông báo: " +
            (error.response?.data?.message || error.message)
        );
      }
    },

    async markAllAsRead() {
      if (this.unreadCount === 0) return;

      try {
        await NotificationService.markAllAsReadForCustomer();
        await this.fetchNotifications();
      } catch (error) {
        alert(
          "Lỗi cập nhật tất cả thông báo: " +
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
      if (type === "DOG_ORDER_CREATED") return "badge-primary";
      if (type === "DOG_ORDER_UPDATED") return "badge-info";
      if (type === "DOG_HEALTH_UPDATE") return "badge-secondary";
      if (type === "DOG_CARE_UPDATE") return "badge-success";
      if (type === "DOG_REMINDER") return "badge-warning text-dark";
      if (type === "SERVICE_BOOKING_CREATED" || type === "SERVICE_BOOKING_UPDATED")
        return "badge-dark";
      return "badge-light border text-dark";
    },

    formatDateTime(date) {
      if (!date) return "---";
      return new Date(date).toLocaleString("vi-VN");
    },
  },

  mounted() {
    this.fetchNotifications();
  },
};
</script>

<style scoped>
.notification-card {
  border-radius: 16px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.notification-card:hover {
  transform: translateY(-2px);
}

.unread-card {
  border-left: 5px solid #dc3545;
}
</style>