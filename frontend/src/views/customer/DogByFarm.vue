<template>
  <div class="dog-page">
    <section class="list-section">
      <div class="container-fluid custom-container px-3">
        <div class="page-toolbar">
          <div class="breadcrumb-wrap">
            <router-link to="/">Trang chủ</router-link>
            <span>/</span>
            <router-link to="/dogs/farms">Nguồn cung</router-link>
            <span>/</span>
            <strong>{{ selectedFarm?.name || "Đang tải..." }}</strong>
          </div>

          <button class="back-btn" @click="goBack">
            <i class="fas fa-arrow-left mr-2"></i>
            Quay lại
          </button>
        </div>

        <div class="result-hero">
          <div class="result-hero-content">
            <span class="section-kicker mb-3 d-inline-block">
              Chó theo nguồn cung
            </span>

            <h1 class="result-page-title">
              {{ selectedFarm ? `Các bé cún từ nguồn cung ${selectedFarm.name}` : "Danh sách chó theo nguồn cung" }}
            </h1>

            <p class="result-desc mb-3">
              Khám phá các bé cún đang được hệ thống hiển thị với thông tin nguồn cung rõ ràng, thuận tiện cho việc lựa chọn và theo dõi.
            </p>

            <div class="result-count">
              Có <strong>{{ dogList.length }}</strong> bé cún đang được hiển thị
            </div>
          </div>
        </div>

        <div v-if="selectedFarm" class="farm-info-panel mb-4">
          <div class="farm-info-inner">
            <div class="farm-avatar-wrap">
              <img
                v-if="getFarmImage(selectedFarm)"
                :src="getFarmImage(selectedFarm)"
                :alt="selectedFarm.name"
                class="farm-avatar"
              />
              <div v-else class="farm-avatar-placeholder">
                <i class="fas fa-warehouse"></i>
              </div>
            </div>

            <div class="farm-content">
              <div class="farm-badge">ĐỐI TÁC CUNG CẤP</div>
              <h2 class="farm-title">{{ selectedFarm.name }}</h2>

              <p class="farm-desc mb-3">
                {{
                  selectedFarm.description ||
                  "Nguồn cung cấp đang được hệ thống quản lý để đảm bảo thông tin hồ sơ chó minh bạch, rõ ràng và thuận tiện theo dõi trong quá trình bán."
                }}
              </p>

              <div class="farm-meta-grid">
                <div class="farm-meta-item">
                  <span class="farm-meta-label">Mã nguồn cung</span>
                  <strong>{{ selectedFarm.maTrai || "Đã xác minh trong hệ thống" }}</strong>
                </div>

                <div class="farm-meta-item">
                  <span class="farm-meta-label">Khu vực</span>
                  <strong>{{ selectedFarm.address || "Đang cập nhật" }}</strong>
                </div>

                <div class="farm-meta-item">
                  <span class="farm-meta-label">Liên hệ</span>
                  <strong>{{ selectedFarm.phone || "Đang cập nhật" }}</strong>
                </div>

                <div class="farm-meta-item">
                  <span class="farm-meta-label">Số bé đang hiển thị</span>
                  <strong>{{ dogList.length }}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="loadingFarm || loadingDogs" class="empty-box mt-4">
          <i class="fas fa-spinner fa-spin mb-3"></i>
          <p class="mb-0">Đang tải danh sách chó...</p>
        </div>

        <div v-else-if="dogList.length === 0" class="empty-box mt-4">
          <i class="fas fa-dog mb-3"></i>
          <p class="mb-0">Hiện chưa có bé cún nào trong nguồn cung này</p>
        </div>

        <div v-else class="dog-grid">
          <router-link
            v-for="dog in dogList"
            :key="dog._id || dog.id"
            :to="`/dog/${dog._id || dog.id}`"
            class="dog-item text-decoration-none"
          >
            <div class="dog-card">
              <div class="dog-image-wrap">
                <img
                  v-if="getDogImage(dog)"
                  :src="getDogImage(dog)"
                  :alt="dog.name"
                  class="dog-image"
                />
                <div v-else class="dog-placeholder">
                  <i class="fas fa-dog"></i>
                </div>

                <span class="dog-status-badge" :class="getDogStatusClass(dog.saleStatus)">
                  {{ getDogStatusText(dog.saleStatus) }}
                </span>

                <div class="dog-image-gradient"></div>
              </div>

              <div class="dog-meta">
                <div class="dog-breed">
                  {{ dog.breedId?.name || "Đang cập nhật giống" }}
                </div>

                <h4 class="dog-name">{{ dog.name }}</h4>

                <div class="dog-extra" v-if="dog.gender || dog.color">
                  <span v-if="dog.gender">{{ dog.gender }}</span>
                  <span v-if="dog.gender && dog.color">•</span>
                  <span v-if="dog.color">{{ dog.color }}</span>
                </div>

                <div class="dog-price">{{ formatCurrency(dog.price) }}</div>

                <div class="dog-action-row">
                  <span class="dog-action-link">
                    Xem chi tiết
                    <i class="fas fa-arrow-right ml-2"></i>
                  </span>
                </div>
              </div>
            </div>
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import FarmService from "@/services/farm.service";
import DogService from "@/services/dog.service";

export default {
  name: "DogByFarm",

  props: {
    id: {
      type: String,
      default: "",
    },
  },

  data() {
    return {
      apiBase: "http://localhost:3000",
      selectedFarm: null,
      dogList: [],
      loadingFarm: false,
      loadingDogs: false,
    };
  },

  watch: {
    id: {
      immediate: true,
      async handler() {
        await this.loadPageData();
      },
    },
  },

  methods: {
    async loadPageData() {
      if (!this.id) return;
      await Promise.all([this.fetchFarm(), this.fetchDogs()]);
    },

    async fetchFarm() {
      this.loadingFarm = true;
      try {
        const farms = await FarmService.getPublic();
        const farmList = Array.isArray(farms) ? farms : [];
        this.selectedFarm =
          farmList.find(
            (item) => String(item._id || item.id) === String(this.id)
          ) || null;
      } catch (error) {
        console.error("Lỗi tải thông tin nguồn cung:", error);
        this.selectedFarm = null;
      } finally {
        this.loadingFarm = false;
      }
    },

    async fetchDogs() {
      this.loadingDogs = true;
      try {
        const data = await DogService.getPublic({ farmId: this.id });
        this.dogList = Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Lỗi tải danh sách chó theo nguồn cung:", error);
        this.dogList = [];
      } finally {
        this.loadingDogs = false;
      }
    },

    goBack() {
      this.$router.push("/dogs/farms");
    },

    getFarmImage(farm) {
      if (farm?.images && farm.images.length > 0) {
        const firstImage = farm.images[0];
        if (String(firstImage).startsWith("http")) return firstImage;
        return this.apiBase + firstImage;
      }

      if (farm?.image) {
        if (String(farm.image).startsWith("http")) return farm.image;
        return this.apiBase + farm.image;
      }

      return "";
    },

    getDogImage(dog) {
      if (!dog?.image) return "";
      if (String(dog.image).startsWith("http")) return dog.image;
      return this.apiBase + dog.image;
    },

    formatCurrency(value) {
      if (value === null || value === undefined || value === "") return "Liên hệ";
      return Number(value).toLocaleString("vi-VN") + " VNĐ";
    },

    getDogStatusText(status) {
      if (status === "Đã bán") return "Đã có chủ mới";
      if (status === "Đang giao") return "Đang bàn giao";
      if (status === "Đã đặt cọc") return "Đã được giữ chỗ";
      if (status === "Chờ thanh toán") return "Chờ xác nhận cọc";
      return "Sẵn sàng đón về";
    },

    getDogStatusClass(status) {
      if (status === "Đã bán") return "status-sold";
      if (
        status === "Chờ thanh toán" ||
        status === "Đã đặt cọc" ||
        status === "Đang giao"
      ) {
        return "status-hold";
      }
      return "status-approved";
    },
  },
};
</script>

<style scoped>
.dog-page {
  background:
    radial-gradient(circle at top left, rgba(177, 145, 211, 0.12), transparent 28%),
    linear-gradient(180deg, #fcf9ff 0%, #ffffff 100%);
  min-height: 100vh;
  padding: 34px 0 60px;
}

@media (min-width: 1200px) {
  .custom-container {
    max-width: 1360px !important;
  }
}

.list-section {
  padding: 8px 0 30px;
}

.section-kicker {
  display: inline-block;
  padding: 7px 14px;
  border-radius: 999px;
  background: #f5edfd;
  color: #7a4db3;
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.3px;
}

.page-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 18px;
}

.breadcrumb-wrap {
  color: #7f7194;
  font-size: 0.95rem;
}

.breadcrumb-wrap a {
  color: #6f42c1;
  font-weight: 700;
  text-decoration: none;
}

.breadcrumb-wrap span {
  margin: 0 8px;
  color: #a095b3;
}

.back-btn {
  border: none;
  background: linear-gradient(135deg, #7b4cc2, #5f35a8);
  color: #ffffff;
  border-radius: 999px;
  padding: 11px 18px;
  font-weight: 700;
  transition: all 0.25s ease;
}

.back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 22px rgba(95, 53, 168, 0.28);
}

.result-hero {
  background: linear-gradient(135deg, #faf5ff, #f7f0fd);
  border: 1px solid #eadcf6;
  border-radius: 28px;
  padding: 26px 26px 24px;
  margin-bottom: 24px;
  box-shadow: 0 12px 24px rgba(75, 31, 115, 0.05);
}

.result-page-title {
  color: #31114d;
  font-size: 2rem;
  font-weight: 900;
  margin-bottom: 10px;
  line-height: 1.3;
}

.result-desc {
  color: #6b7280;
  line-height: 1.75;
  max-width: 820px;
}

.result-count {
  color: #7f7194;
  font-size: 0.98rem;
}

.farm-info-panel {
  background: linear-gradient(135deg, #f7f2ff, #ffffff);
  border: 1px solid #e6daf7;
  border-radius: 28px;
  padding: 24px;
  box-shadow: 0 12px 30px rgba(94, 53, 177, 0.08);
}

.farm-info-inner {
  display: flex;
  gap: 24px;
  align-items: center;
}

.farm-avatar-wrap {
  width: 230px;
  height: 230px;
  border-radius: 22px;
  overflow: hidden;
  flex-shrink: 0;
  background: #f3ebff;
}

.farm-avatar,
.farm-avatar-placeholder {
  width: 100%;
  height: 100%;
}

.farm-avatar {
  object-fit: cover;
  display: block;
}

.farm-avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7b4cc2;
  font-size: 3rem;
}

.farm-content {
  flex: 1;
  min-width: 0;
}

.farm-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 999px;
  background: #ede2ff;
  color: #6f42c1;
  font-size: 0.82rem;
  font-weight: 800;
  margin-bottom: 12px;
}

.farm-title {
  color: #31114d;
  font-size: 2rem;
  font-weight: 900;
  margin-bottom: 10px;
}

.farm-desc {
  color: #75678a;
  line-height: 1.7;
  max-width: 760px;
}

.farm-meta-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.farm-meta-item {
  background: #ffffff;
  border: 1px solid #eadff8;
  border-radius: 16px;
  padding: 14px 16px;
}

.farm-meta-label {
  display: block;
  color: #8a7d9e;
  font-size: 0.88rem;
  font-weight: 700;
  margin-bottom: 6px;
}

.dog-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 28px 24px;
  align-items: start;
}

.dog-item {
  display: block;
  width: 100%;
  text-decoration: none;
}

.dog-card {
  width: 100%;
  background: #fff;
  border: 1px solid #eee6f6;
  border-radius: 24px;
  overflow: hidden;
  transition: all 0.28s ease;
  display: block;
  box-shadow: 0 12px 24px rgba(75, 31, 115, 0.05);
}

.dog-item:hover .dog-card {
  transform: translateY(-6px);
  box-shadow: 0 20px 38px rgba(75, 31, 115, 0.12);
}

.dog-image-wrap {
  position: relative;
  width: 100%;
  height: 280px;
  overflow: hidden;
  background: #f3ebff;
}

.dog-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.35s ease;
}

.dog-item:hover .dog-image {
  transform: scale(1.05);
}

.dog-image-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(20, 10, 28, 0.03) 0%, rgba(20, 10, 28, 0.3) 100%);
}

.dog-placeholder {
  width: 100%;
  height: 100%;
  color: #7b4cc2;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3ebff;
  font-size: 2.2rem;
}

.dog-status-badge {
  position: absolute;
  top: 14px;
  left: 14px;
  padding: 8px 13px;
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: 800;
  color: #ffffff;
  z-index: 2;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.14);
}

.status-approved {
  background: #16a34a;
}

.status-hold {
  background: #f59e0b;
}

.status-sold {
  background: #111827;
}

.dog-meta {
  padding: 18px 18px 20px;
  text-align: left;
}

.dog-name {
  color: #2f1b44;
  font-size: 1.2rem;
  font-weight: 800;
  margin-bottom: 8px;
  line-height: 1.35;
}

.dog-breed {
  color: #8a7d9e;
  font-size: 0.88rem;
  margin-bottom: 8px;
  font-weight: 700;
}

.dog-extra {
  color: #8a7d9e;
  font-size: 0.92rem;
  margin-bottom: 10px;
}

.dog-price {
  color: #6f49b6;
  font-size: 1.15rem;
  font-weight: 900;
  margin-bottom: 12px;
}

.dog-action-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dog-action-link {
  color: #7a4db3;
  font-weight: 800;
  font-size: 0.92rem;
}

.empty-box {
  background: #ffffff;
  border-radius: 24px;
  padding: 46px 20px;
  text-align: center;
  color: #7f7194;
  box-shadow: 0 8px 20px rgba(94, 53, 177, 0.08);
  border: 1px solid #eee6f6;
}

.empty-box i {
  font-size: 2.5rem;
  color: #7b4cc2;
}

@media (max-width: 1199px) {
  .dog-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 992px) {
  .result-page-title,
  .farm-title {
    font-size: 1.75rem;
  }

  .dog-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dog-image-wrap {
    height: 240px;
  }

  .farm-info-inner {
    flex-direction: column;
    align-items: flex-start;
  }

  .farm-avatar-wrap {
    width: 100%;
    height: 280px;
  }
}

@media (max-width: 576px) {
  .dog-page {
    padding-top: 24px;
  }

  .result-page-title,
  .farm-title {
    font-size: 1.35rem;
  }

  .dog-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .dog-image-wrap {
    height: 230px;
  }

  .dog-name {
    font-size: 1.02rem;
  }

  .dog-price {
    font-size: 1rem;
  }

  .breadcrumb-wrap {
    font-size: 0.9rem;
  }

  .farm-meta-grid {
    grid-template-columns: 1fr;
  }

  .result-hero,
  .farm-info-panel {
    padding: 18px;
  }
}
</style>