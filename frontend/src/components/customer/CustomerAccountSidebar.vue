<template>
  <aside class="account-sidebar">
    <div class="sidebar-card">
      <div class="sidebar-user">
        <div class="sidebar-avatar-wrap">
          <img
            v-if="avatarUrl"
            :src="avatarUrl"
            class="sidebar-avatar"
            alt="avatar"
          />
          <div v-else class="sidebar-avatar-placeholder">
            <i class="fas fa-user"></i>
          </div>
        </div>

        <h5 class="sidebar-name">
          {{ user.fullName || user.username || "Khách hàng" }}
        </h5>

        <p class="sidebar-meta">
          {{ user.email || "Chưa cập nhật email" }}
        </p>

        <p class="sidebar-joined">
          Tham gia: {{ formatDate(user.createdAt) }}
        </p>
      </div>

      <div class="sidebar-menu">
        <router-link
          to="/profile"
          class="sidebar-link"
          :class="{ active: active === 'profile' }"
        >
          <i class="fas fa-user-edit"></i>
          <span>Hồ sơ của tôi</span>
        </router-link>

        <router-link
          to="/tra-cuu-don"
          class="sidebar-link"
          :class="{ active: active === 'deposit-history' }"
        >
          <i class="fas fa-shopping-bag"></i>
          <span>Lịch sử đặt cọc</span>
        </router-link>

        <router-link
          to="/accessory-orders"
          class="sidebar-link"
          :class="{ active: active === 'accessory-orders' }"
        >
          <i class="fas fa-box"></i>
          <span>Đơn phụ kiện</span>
        </router-link>

        <router-link
          to="/service-bookings"
          class="sidebar-link"
          :class="{ active: active === 'service-bookings' }"
        >
          <i class="fas fa-calendar-check"></i>
          <span>Lịch dịch vụ</span>
        </router-link>

        <button type="button" class="sidebar-link logout-link" @click="logout">
          <i class="fas fa-sign-out-alt"></i>
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  </aside>
</template>

<script>
export default {
  name: "CustomerAccountSidebar",
  props: {
    active: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      user: {
        username: "",
        fullName: "",
        email: "",
        avatar: "",
        createdAt: "",
      },
      baseImageUrl: "http://localhost:3000",
    };
  },

  computed: {
    avatarUrl() {
      if (!this.user.avatar) return "";

      if (
        String(this.user.avatar).startsWith("http://") ||
        String(this.user.avatar).startsWith("https://")
      ) {
        return this.user.avatar;
      }

      return `${this.baseImageUrl}${this.user.avatar}`;
    },
  },

  mounted() {
    this.loadUserData();
    window.addEventListener("user-updated", this.handleUserUpdated);
  },

  beforeUnmount() {
    window.removeEventListener("user-updated", this.handleUserUpdated);
  },

  methods: {
    loadUserData() {
      const data = localStorage.getItem("user");
      if (!data) return;

      try {
        const parsedData = JSON.parse(data);
        this.user = { ...this.user, ...parsedData };
      } catch (error) {
        console.error("Lỗi đọc dữ liệu user:", error);
      }
    },

    handleUserUpdated(event) {
      if (event?.detail) {
        this.user = { ...this.user, ...event.detail };
      } else {
        this.loadUserData();
      }
    },

    formatDate(date) {
      if (!date) return "Hôm nay";

      const d = new Date(date);
      if (Number.isNaN(d.getTime())) return "Hôm nay";

      return d.toLocaleDateString("vi-VN");
    },

    logout() {
      if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        this.$router.push("/login").then(() => window.location.reload());
      }
    },
  },
};
</script>

<style scoped>
.account-sidebar {
  position: sticky;
  top: 24px;
}

.sidebar-card {
  background: #ffffff;
  border: 1px solid #e7e5ef;
  border-radius: 22px;
  padding: 20px 16px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
}

.sidebar-user {
  text-align: center;
  padding-bottom: 18px;
  border-bottom: 1px solid #f0edf5;
  margin-bottom: 14px;
}

.sidebar-avatar-wrap {
  position: relative;
  width: 112px;
  height: 112px;
  margin: 0 auto 14px;
}

.sidebar-avatar,
.sidebar-avatar-placeholder {
  width: 112px;
  height: 112px;
  border-radius: 50%;
  border: 4px solid #ffffff;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
  background: #f8fafc;
}

.sidebar-avatar {
  object-fit: cover;
}

.sidebar-avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 2.25rem;
}

.sidebar-name {
  margin: 0 0 6px;
  color: #1f2937;
  font-weight: 800;
  font-size: 1.04rem;
}

.sidebar-meta {
  margin: 0 0 4px;
  color: #6b7280;
  font-size: 0.9rem;
  font-weight: 500;
  word-break: break-word;
}

.sidebar-joined {
  margin: 0;
  color: #9ca3af;
  font-size: 0.82rem;
  font-weight: 600;
}

.sidebar-menu {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sidebar-link {
  width: 100%;
  border: 1px solid #ece8f3;
  background: #ffffff;
  color: #4b5563;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  font-weight: 700;
  transition: all 0.2s ease;
}

.sidebar-link i {
  width: 18px;
  text-align: center;
  color: #6366f1;
}

.sidebar-link:hover {
  background: #f8fafc;
  color: #111827;
  text-decoration: none;
  border-color: #ddd6fe;
}

.sidebar-link.active {
  background: #f5f3ff;
  color: #312e81;
  border-color: #c4b5fd;
  box-shadow: none;
}

.sidebar-link.active i {
  color: #4f46e5;
}

.logout-link {
  text-align: left;
  cursor: pointer;
}

.logout-link,
.logout-link i {
  color: #dc2626;
}

.logout-link:hover {
  background: #fef2f2;
  border-color: #fecaca;
  color: #b91c1c;
}

@media (max-width: 991.98px) {
  .account-sidebar {
    position: static;
  }
}
</style>