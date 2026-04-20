<template>
  <div class="my-dogs-page">
    <div class="container-fluid page-container py-4">
      <div class="page-layout">
<CustomerAccountSidebar :current-user="currentUser" />

        <section class="page-content">
          <div class="content-head">
            <div>
              <h3 class="content-title">Hồ sơ chó đã mua</h3>
              <p class="content-subtitle mb-0">
                Xem lại các bé chó bạn đã nhận thành công và tiếp tục theo dõi chăm sóc sau bán.
              </p>
            </div>
          </div>

          <div class="toolbar-box">
            <div class="search-box">
              <i class="fas fa-search"></i>
              <input
                type="text"
                v-model.trim="searchText"
                placeholder="Tìm theo tên chó hoặc mã chó"
              />
            </div>

            <button class="refresh-btn" @click="fetchMyDogs" :disabled="loading">
              <i class="fas fa-sync-alt mr-1"></i> Làm mới
            </button>
          </div>

          <div v-if="loading" class="empty-panel">
            <i class="fas fa-spinner fa-spin empty-icon"></i>
            <p>Đang tải hồ sơ chó đã mua...</p>
          </div>

          <div v-else-if="filteredDogs.length === 0" class="empty-panel">
            <i class="fas fa-dog empty-icon"></i>
            <p>Bạn chưa có bé chó nào đã hoàn thành mua bán</p>
          </div>

          <div v-else class="dog-grid">
            <div
              v-for="item in filteredDogs"
              :key="getDogId(item)"
              class="dog-card"
            >
              <div class="dog-image-wrap">
                <img :src="getDogImage(item)" alt="dog" class="dog-image" />
                <span class="dog-badge">
                  Đã bán
                </span>
              </div>

              <div class="dog-card-body">
                <div class="dog-head">
                  <div>
                    <div class="dog-name">{{ item.name || "Bé cún" }}</div>
                    <div class="dog-code">{{ item.maCho || "---" }}</div>
                  </div>
                  <div class="dog-price">
                    {{ formatCurrency(item.finalPrice || item.price) }}
                  </div>
                </div>

                <div class="dog-info-list">
                  <div class="dog-info-item">
                    <span class="label">Giống chó</span>
                    <span class="value">{{ item.breedName || "---" }}</span>
                  </div>

                  <div class="dog-info-item">
                    <span class="label">Giới tính</span>
                    <span class="value">{{ item.gender || "---" }}</span>
                  </div>

                  <div class="dog-info-item">
                    <span class="label">Ngày hoàn tất</span>
                    <span class="value">{{ formatDate(item.completedAt) }}</span>
                  </div>

                  <div class="dog-info-item">
                    <span class="label">Sức khỏe tóm tắt</span>
                    <span class="value">{{ item.healthStatus || "Tốt" }}</span>
                  </div>
                </div>

                <div class="dog-card-actions">
                  <button
                    class="btn btn-outline-primary btn-sm"
                    @click="openDetail(item)"
                  >
                    <i class="fas fa-eye mr-1"></i> Chi tiết
                  </button>

                  <router-link
                    to="/my-dog-care-records"
                    class="btn btn-outline-success btn-sm text-decoration-none"
                  >
                    <i class="fas fa-heartbeat mr-1"></i> Theo dõi sau bán
                  </router-link>

                  <router-link
                    to="/my-dog-reminders"
                    class="btn btn-outline-info btn-sm text-decoration-none"
                  >
                    <i class="fas fa-bell mr-1"></i> Lịch nhắc
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div
        v-if="selectedDog"
        class="modal fade show d-block"
        tabindex="-1"
        style="background: rgba(0, 0, 0, 0.45);"
      >
        <div class="modal-dialog modal-xl modal-dialog-centered">
          <div class="modal-content border-0 shadow">
            <div class="modal-header modal-head-custom">
              <h5 class="modal-title mb-0">
                <i class="fas fa-dog mr-2"></i>Chi tiết hồ sơ chó đã mua
              </h5>
              <button type="button" class="close text-white" @click="closeDetail">
                <span>&times;</span>
              </button>
            </div>

            <div class="modal-body dog-detail-body">
              <div class="detail-grid">
                <div class="detail-image-card">
                  <img
                    :src="getDogImage(selectedDog)"
                    alt="dog"
                    class="detail-image"
                  />
                </div>

                <div class="detail-info-card">
                  <div class="detail-dog-name">{{ selectedDog.name || "Bé cún" }}</div>
                  <div class="detail-dog-code">{{ selectedDog.maCho || "---" }}</div>

                  <div class="detail-row">
                    <span>Giống chó</span>
                    <strong>{{ selectedDog.breedName || "---" }}</strong>
                  </div>

                  <div class="detail-row">
                    <span>Giới tính</span>
                    <strong>{{ selectedDog.gender || "---" }}</strong>
                  </div>

                  <div class="detail-row">
                    <span>Ngày mua hoàn tất</span>
                    <strong>{{ formatDate(selectedDog.completedAt) }}</strong>
                  </div>

                  <div class="detail-row">
                    <span>Giá mua</span>
                    <strong class="text-danger">
                      {{ formatCurrency(selectedDog.finalPrice || selectedDog.price) }}
                    </strong>
                  </div>

                  <div class="detail-row">
                    <span>Trạng thái</span>
                    <strong>Đã bán</strong>
                  </div>

                  <div class="detail-row">
                    <span>Sức khỏe tóm tắt</span>
                    <strong>{{ selectedDog.healthStatus || "---" }}</strong>
                  </div>

                  <div class="detail-row">
                    <span>Tẩy giun gần nhất</span>
                    <strong>{{ formatDateOnly(selectedDog.lastDeworming) }}</strong>
                  </div>
                </div>
              </div>

              <div class="detail-note-card mt-4">
                <div class="detail-card-title">Gợi ý tiếp theo</div>
                <p class="mb-0">
                  Sau khi đã nhận bé, bạn nên tiếp tục theo dõi ở mục
                  <strong>Theo dõi sau bán</strong> để xem tình trạng chăm sóc và
                  mục <strong>Lịch nhắc chăm sóc chó</strong> để không bỏ lỡ các mốc
                  tái khám, tẩy giun hoặc vaccine.
                </p>
              </div>
            </div>

            <div class="modal-footer d-flex flex-wrap">
              <button class="btn btn-secondary" @click="closeDetail">Đóng</button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="selectedDog" class="modal-backdrop fade show"></div>
    </div>
  </div>
</template>

<script>
import OrderService from "@/services/order.service";
import CustomerAccountSidebar from "@/components/customer/CustomerAccountSidebar.vue";



export default {
  name: "CustomerMyDogs",

  components: {
  CustomerAccountSidebar,
},

  data() {
    return {
      currentUser: null,
      loading: false,
      searchText: "",
      dogs: [],
      selectedDog: null,
    };
  },

  computed: {
    filteredDogs() {
      return this.dogs.filter((item) => {
        const keyword = (this.searchText || "").toLowerCase().trim();
        const name = item.name ? item.name.toLowerCase() : "";
        const code = item.maCho ? item.maCho.toLowerCase() : "";

        return !keyword || name.includes(keyword) || code.includes(keyword);
      });
    },
  },

  methods: {
    getAvatarText() {
      const name = this.currentUser?.fullName || this.currentUser?.username || "KH";
      return name
        .split(" ")
        .map((item) => item[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();
    },

    async fetchMyDogs() {
      try {
        if (!this.currentUser) return;

        this.loading = true;

        const orders = await OrderService.getMyOrders();

        const completedOrders = (orders || []).filter(
          (order) => order.status === "Hoàn thành" && order.dogId
        );

        this.dogs = completedOrders.map((order) => {
          const dog = order.dogId || {};
          return {
            ...dog,
            completedAt: order.updatedAt || order.createdAt,
            orderId: order._id || order.id,
            breedName: dog.breedId?.name || dog.breedName || "---",
          };
        });
      } catch (error) {
        console.error("Lỗi lấy hồ sơ chó đã mua:", error);
        alert(
          "Không thể tải hồ sơ chó đã mua: " +
            (error.response?.data?.message || error.message)
        );
      } finally {
        this.loading = false;
      }
    },

    getDogId(item) {
      return item?._id || item?.id || item?.orderId || Math.random();
    },

    getDogImage(item) {
      if (item?.image) {
        if (String(item.image).startsWith("http")) return item.image;
        return "http://localhost:3000" + item.image;
      }
      return "https://via.placeholder.com/500x320";
    },

    formatCurrency(value) {
      if (value === null || value === undefined) return "---";
      return Number(value).toLocaleString("vi-VN") + " ₫";
    },

    formatDate(date) {
      if (!date) return "---";
      return new Date(date).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },

    formatDateOnly(date) {
      if (!date) return "---";
      return new Date(date).toLocaleDateString("vi-VN");
    },

    openDetail(item) {
      this.selectedDog = item;
    },

    closeDetail() {
      this.selectedDog = null;
    },
  },

  async mounted() {
    const userData = localStorage.getItem("user");

    if (!userData) {
      alert("Vui lòng đăng nhập để xem hồ sơ chó đã mua.");
      this.$router.push("/login");
      return;
    }

    this.currentUser = JSON.parse(userData);
    await this.fetchMyDogs();
  },
};
</script>

<style scoped>
.my-dogs-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #faf7fc 0%, #f4eef9 100%);
}

.page-container {
  max-width: 1420px;
  padding-left: 24px;
  padding-right: 24px;
}

.page-layout {
  display: grid;
  grid-template-columns: 290px minmax(0, 1fr);
  gap: 22px;
  align-items: start;
}

.account-card,
.sidebar-menu,
.page-content,
.dog-card {
  background: #ffffff;
  border: 1px solid #eee2f7;
  border-radius: 20px;
  box-shadow: 0 10px 24px rgba(106, 27, 154, 0.06);
}

.account-card {
  padding: 20px;
  margin-bottom: 16px;
}

.account-top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.account-info {
  min-width: 0;
}

.account-name {
  margin: 0;
  font-weight: 800;
  color: #2f1b44;
  font-size: 1.05rem;
  line-height: 1.35;
}

.account-email {
  color: #7b7287;
  font-size: 0.9rem;
  margin-top: 4px;
  word-break: break-word;
}

.account-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6a1b9a, #4a148c);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.95rem;
  flex-shrink: 0;
}

.account-note {
  margin-top: 14px;
  color: #746a80;
  font-size: 0.91rem;
  line-height: 1.7;
}

.sidebar-menu {
  overflow: hidden;
}

.menu-item-link {
  display: block;
  color: inherit;
}

.menu-item {
  padding: 16px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  color: #3e3550;
  border-bottom: 1px solid #f2ebf8;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:hover {
  background: #fbf8fe;
}

.menu-item span {
  display: flex;
  align-items: center;
  min-width: 0;
}

.menu-arrow {
  color: #8c7ea5;
  font-size: 0.82rem;
}

.menu-item.active {
  background: #f3e8ff;
  color: #6a1b9a;
  font-weight: 800;
}

.menu-item.active .menu-arrow {
  color: #6a1b9a;
}

.menu-item small {
  color: #8c7ea5;
  font-size: 0.87rem;
  white-space: nowrap;
}

.page-content {
  padding: 22px;
  min-width: 0;
}

.content-head {
  margin-bottom: 12px;
}

.content-title {
  margin: 0 0 4px;
  font-size: 1.7rem;
  font-weight: 900;
  color: #2f1b44;
  line-height: 1.15;
}

.content-subtitle {
  color: #7b7287;
  font-size: 0.92rem;
}

.toolbar-box {
  display: grid;
  grid-template-columns: 1fr 120px;
  gap: 12px;
  align-items: center;
  margin-bottom: 18px;
}

.search-box {
  position: relative;
}

.search-box i {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #8b7fa0;
  font-size: 0.95rem;
  pointer-events: none;
}

.search-box input {
  width: 100%;
  height: 46px;
  border: 1px solid #dfd3ec;
  border-radius: 14px;
  padding: 0 16px 0 40px;
  outline: none;
  font-size: 0.94rem;
  background: #fff;
  color: #3b3150;
  transition: all 0.2s ease;
}

.search-box input::placeholder {
  color: #9b90ad;
}

.search-box input:focus {
  border-color: #7b3fc8;
  box-shadow: 0 0 0 3px rgba(123, 63, 200, 0.08);
}

.refresh-btn {
  border: none;
  background: linear-gradient(135deg, #6a1b9a, #4a148c);
  color: #fff;
  height: 46px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 0.92rem;
  transition: all 0.2s ease;
}

.refresh-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(106, 27, 154, 0.18);
}

.refresh-btn:disabled {
  opacity: 0.7;
  transform: none;
  box-shadow: none;
}

.empty-panel {
  background: #fff;
  border: 1px solid #eee2f7;
  border-radius: 16px;
  min-height: 320px;
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

.dog-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.dog-card {
  overflow: hidden;
}

.dog-image-wrap {
  position: relative;
  height: 230px;
  background: #f8f4fc;
}

.dog-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dog-badge {
  position: absolute;
  top: 14px;
  right: 14px;
  background: #e7f8ee;
  color: #15803d;
  padding: 7px 12px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 800;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  white-space: nowrap;
}

.dog-card-body {
  padding: 18px;
}

.dog-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.dog-name {
  font-size: 1.15rem;
  font-weight: 900;
  color: #2f1b44;
  line-height: 1.2;
}

.dog-code {
  margin-top: 4px;
  color: #8b7fa0;
  font-size: 0.88rem;
  font-weight: 700;
}

.dog-price {
  color: #dc2626;
  font-size: 1rem;
  font-weight: 900;
  white-space: nowrap;
}

.dog-info-list {
  margin-top: 16px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.dog-info-item {
  background: #faf7fd;
  border: 1px solid #efe6f7;
  border-radius: 14px;
  padding: 12px;
}

.dog-info-item .label {
  display: block;
  color: #8a7da0;
  font-size: 0.82rem;
  margin-bottom: 5px;
}

.dog-info-item .value {
  display: block;
  color: #2f1b44;
  font-size: 0.92rem;
  font-weight: 800;
  line-height: 1.35;
}

.dog-card-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 18px;
}

.modal-head-custom {
  background: linear-gradient(135deg, #6a1b9a, #4a148c);
  color: #fff;
}

.modal {
  overflow-y: auto;
}

.dog-detail-body {
  padding: 22px;
}

.detail-grid {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  gap: 20px;
}

.detail-image-card,
.detail-info-card,
.detail-note-card {
  background: #fcfbfe;
  border: 1px solid #eadcf7;
  border-radius: 18px;
  padding: 18px;
}

.detail-image-card {
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-image {
  width: 100%;
  max-height: 320px;
  object-fit: cover;
  border-radius: 14px;
}

.detail-dog-name {
  font-size: 1.2rem;
  font-weight: 900;
  color: #2f1b44;
  line-height: 1.2;
}

.detail-dog-code {
  margin-top: 4px;
  margin-bottom: 14px;
  color: #8b7fa0;
  font-size: 0.9rem;
  font-weight: 700;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
  padding: 9px 0;
  color: #4b5563;
  font-size: 0.93rem;
}

.detail-row + .detail-row {
  border-top: 1px dashed #ece3f4;
}

.detail-row span {
  color: #7b7287;
  font-weight: 700;
  white-space: nowrap;
}

.detail-row strong {
  color: #2f1b44;
  font-weight: 800;
  text-align: right;
}

.detail-card-title {
  font-size: 1rem;
  font-weight: 900;
  color: #31114d;
  margin-bottom: 10px;
}

@media (max-width: 1199.98px) {
  .content-title {
    font-size: 1.5rem;
  }
}

@media (max-width: 991.98px) {
  .page-layout {
    grid-template-columns: 1fr;
  }

  .toolbar-box {
    grid-template-columns: 1fr;
  }

  .refresh-btn {
    width: 100%;
  }

  .dog-grid {
    grid-template-columns: 1fr;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .page-container {
    padding-left: 16px;
    padding-right: 16px;
  }

  .content-title {
    font-size: 1.35rem;
  }
}

@media (max-width: 575.98px) {
  .dog-info-list {
    grid-template-columns: 1fr;
  }

  .dog-card-actions {
    flex-direction: column;
  }

  .dog-head,
  .detail-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .detail-row strong {
    text-align: left;
  }
}
</style>