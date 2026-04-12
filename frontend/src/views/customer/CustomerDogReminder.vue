<template>
  <div class="customer-reminder-page bg-light py-4" style="min-height: 100vh;">
    <div class="container">
      <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3 flex-wrap">
        <h4 class="font-weight-bold text-dark mb-2">
          <i class="fas fa-bell text-warning mr-2"></i>
          LỊCH NHẮC CHĂM SÓC CHÓ
        </h4>

        <div>
          <button class="btn btn-outline-primary btn-sm" @click="fetchMyReminders">
            <i class="fas fa-sync-alt mr-1"></i> Làm mới
          </button>
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
                  placeholder="Tìm theo tên chó hoặc tiêu đề..."
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
                  :class="statusFilter === 'Chờ nhắc' ? 'btn-warning text-dark' : 'btn-light'"
                  @click="statusFilter = 'Chờ nhắc'"
                >
                  Chờ nhắc
                </button>
                <button
                  class="btn btn-sm"
                  :class="statusFilter === 'Đã gửi nhắc' ? 'btn-info text-white' : 'btn-light'"
                  @click="statusFilter = 'Đã gửi nhắc'"
                >
                  Đã gửi nhắc
                </button>
                <button
                  class="btn btn-sm"
                  :class="statusFilter === 'Đã hoàn thành' ? 'btn-success text-white' : 'btn-light'"
                  @click="statusFilter = 'Đã hoàn thành'"
                >
                  Đã hoàn thành
                </button>
                <button
                  class="btn btn-sm"
                  :class="statusFilter === 'Đã hủy' ? 'btn-danger text-white' : 'btn-light'"
                  @click="statusFilter = 'Đã hủy'"
                >
                  Đã hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row mb-4">
        <div class="col-md-3 mb-3">
          <div class="card border-0 shadow-sm text-center py-3">
            <div class="small text-muted">Chờ nhắc</div>
            <h4 class="font-weight-bold text-warning mb-0">{{ stats.pending }}</h4>
          </div>
        </div>

        <div class="col-md-3 mb-3">
          <div class="card border-0 shadow-sm text-center py-3">
            <div class="small text-muted">Đã gửi nhắc</div>
            <h4 class="font-weight-bold text-info mb-0">{{ stats.sent }}</h4>
          </div>
        </div>

        <div class="col-md-3 mb-3">
          <div class="card border-0 shadow-sm text-center py-3">
            <div class="small text-muted">Đã hoàn thành</div>
            <h4 class="font-weight-bold text-success mb-0">{{ stats.completed }}</h4>
          </div>
        </div>

        <div class="col-md-3 mb-3">
          <div class="card border-0 shadow-sm text-center py-3">
            <div class="small text-muted">Đã hủy</div>
            <h4 class="font-weight-bold text-danger mb-0">{{ stats.cancelled }}</h4>
          </div>
        </div>
      </div>

      <div v-if="filteredReminders.length > 0" class="row">
        <div
          v-for="item in filteredReminders"
          :key="item._id || item.id"
          class="col-lg-6 mb-4"
        >
          <div class="card border-0 shadow-sm h-100 reminder-card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h5 class="font-weight-bold text-dark mb-1">
                    {{ item.title || "---" }}
                  </h5>
                  <div class="small text-muted">
                    <i class="fas fa-dog mr-1"></i>
                    {{ item.dogId?.name || "Không rõ tên chó" }}
                    <span v-if="item.dogId?.maCho">- {{ item.dogId.maCho }}</span>
                  </div>
                </div>

                <span class="badge px-3 py-2" :class="getStatusClass(item.status)">
                  {{ item.status }}
                </span>
              </div>

              <div class="mb-3">
                <span class="badge badge-light border px-3 py-2 text-dark">
                  <i class="fas fa-tag mr-1"></i>{{ item.reminderType || "---" }}
                </span>
              </div>

              <p class="text-muted mb-3" style="min-height: 48px;">
                {{ item.description || "Không có mô tả." }}
              </p>

              <div class="row mb-3">
                <div class="col-6">
                  <div class="small text-muted">Ngày nhắc</div>
                  <div class="font-weight-bold text-primary">
                    {{ formatDate(item.reminderDate) }}
                  </div>
                </div>

                <div class="col-6">
                  <div class="small text-muted">Ghi chú</div>
                  <div class="font-weight-bold text-dark">
                    {{ item.note || "---" }}
                  </div>
                </div>
              </div>

              <div
                v-if="item.dogId?.image"
                class="mb-3 rounded overflow-hidden border"
                style="height: 180px;"
              >
                <img
                  :src="getDogImage(item.dogId)"
                  alt="dog"
                  style="width: 100%; height: 100%; object-fit: cover;"
                />
              </div>

              <div class="d-flex justify-content-between align-items-center">
                <div class="small text-muted">
                  <i class="far fa-clock mr-1"></i>
                  Tạo lúc: {{ formatDateTime(item.createdAt) }}
                </div>

                <button
                  v-if="item.status !== 'Đã hoàn thành' && item.status !== 'Đã hủy'"
                  class="btn btn-sm btn-success"
                  @click="markCompleted(item)"
                >
                  <i class="fas fa-check mr-1"></i> Đã thực hiện
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="card border-0 shadow-sm">
        <div class="card-body text-center py-5 text-muted">
          <i class="fas fa-bell-slash fa-3x mb-3 d-block"></i>
          Hiện chưa có lịch nhắc nào phù hợp.
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DogReminderService from "@/services/dogReminder.service";

export default {
  name: "CustomerDogReminder",

  data() {
    return {
      reminders: [],
      searchText: "",
      statusFilter: "Tất cả",
    };
  },

  computed: {
    filteredReminders() {
      return this.reminders.filter((item) => {
        const keyword = (this.searchText || "").toLowerCase();
        const title = item.title ? item.title.toLowerCase() : "";
        const dogName = item.dogId?.name ? item.dogId.name.toLowerCase() : "";

        const matchSearch =
          title.includes(keyword) || dogName.includes(keyword);

        const matchStatus =
          this.statusFilter === "Tất cả" || item.status === this.statusFilter;

        return matchSearch && matchStatus;
      });
    },

    stats() {
      return {
        pending: this.reminders.filter((i) => i.status === "Chờ nhắc").length,
        sent: this.reminders.filter((i) => i.status === "Đã gửi nhắc").length,
        completed: this.reminders.filter((i) => i.status === "Đã hoàn thành").length,
        cancelled: this.reminders.filter((i) => i.status === "Đã hủy").length,
      };
    },
  },

  methods: {
    async fetchMyReminders() {
      try {
        this.reminders = await DogReminderService.getMyReminders();
      } catch (error) {
        console.error("Lỗi tải nhắc lịch:", error);
        alert(
          "Không thể tải lịch nhắc của bạn: " +
            (error.response?.data?.message || error.message)
        );
      }
    },

    async markCompleted(item) {
      const id = item._id || item.id;
      if (!id) return;

      if (!confirm(`Xác nhận rằng bạn đã thực hiện lịch: "${item.title}"?`)) {
        return;
      }

      try {
        await DogReminderService.markCompleted(id);
        alert("✅ Đã cập nhật lịch nhắc thành hoàn thành.");
        await this.fetchMyReminders();
      } catch (error) {
        alert(
          "❌ Lỗi cập nhật nhắc lịch: " +
            (error.response?.data?.message || error.message)
        );
      }
    },

    getStatusClass(status) {
      if (status === "Chờ nhắc") return "badge-warning text-dark";
      if (status === "Đã gửi nhắc") return "badge-info text-white";
      if (status === "Đã hoàn thành") return "badge-success text-white";
      if (status === "Đã hủy") return "badge-danger text-white";
      return "badge-light border";
    },

    getDogImage(dog) {
      if (dog?.image) return "http://localhost:3000" + dog.image;
      return "https://via.placeholder.com/400x220";
    },

    formatDate(date) {
      if (!date) return "---";
      return new Date(date).toLocaleDateString("vi-VN");
    },

    formatDateTime(date) {
      if (!date) return "---";
      return new Date(date).toLocaleString("vi-VN");
    },
  },

  mounted() {
    this.fetchMyReminders();
  },
};
</script>

<style scoped>
.reminder-card {
  border-radius: 16px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.reminder-card:hover {
  transform: translateY(-2px);
}
</style>