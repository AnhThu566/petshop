<template>
  <div class="dog-page">
    <section class="catalog-section">
      <div class="container-fluid custom-container px-3">
        <div class="section-heading-block text-center">
          <span class="section-kicker">Nguồn cung minh bạch</span>
          <h2 class="section-title">Các nguồn cung cấp</h2>
          <p class="section-desc">
            Chọn nguồn cung để xem các bé cún có thông tin nguồn gốc rõ ràng đang được hệ thống hiển thị.
          </p>
        </div>

        <div v-if="loading" class="empty-box">
          <i class="fas fa-spinner fa-spin mb-3"></i>
          <p class="mb-0">Đang tải dữ liệu...</p>
        </div>

        <div v-else-if="farmList.length === 0" class="empty-box">
          <i class="fas fa-folder-open mb-3"></i>
          <p class="mb-0">Chưa có nguồn cung để hiển thị</p>
        </div>

        <div v-else class="group-grid">
          <button
            v-for="farm in farmList"
            :key="farm._id || farm.id"
            type="button"
            class="group-card"
            @click="goToFarm(farm)"
          >
            <div class="group-image-wrap">
              <img
                v-if="getFarmImage(farm)"
                :src="getFarmImage(farm)"
                :alt="farm.name"
                class="group-image"
              />
              <div v-else class="group-placeholder">
                <i class="fas fa-warehouse"></i>
              </div>

              <div class="group-overlay">
                <span class="group-overlay-badge">Nguồn cung</span>
              </div>
            </div>

            <div class="group-body">
              <div class="group-name">
                {{ farm.name }}
              </div>

              <div class="group-subtext">
                {{ farm.address || "Thông tin nguồn cung đang cập nhật" }}
              </div>

              <div class="group-link">
                Xem các bé trong mục này
                <i class="fas fa-arrow-right ml-2"></i>
              </div>
            </div>
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import FarmService from "@/services/farm.service";

export default {
  name: "DogFarmList",

  data() {
    return {
      apiBase: "http://localhost:3000",
      farmList: [],
      loading: false,
    };
  },

  mounted() {
    this.fetchFarms();
  },

  methods: {
    async fetchFarms() {
      this.loading = true;
      try {
        const data = await FarmService.getPublic();
        this.farmList = Array.isArray(data)
          ? data.filter((item) => item.status === "active" || !item.status)
          : [];
      } catch (error) {
        console.error("Lỗi tải danh sách nguồn cung:", error);
        this.farmList = [];
      } finally {
        this.loading = false;
      }
    },

    goToFarm(farm) {
      const id = farm._id || farm.id;
      this.$router.push(`/dogs/farms/${id}`);
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

.catalog-section {
  padding: 8px 0 30px;
}

.section-heading-block {
  max-width: 760px;
  margin: 0 auto 30px;
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
  margin-bottom: 14px;
}

.section-title {
  margin: 0 0 12px;
  color: #2f1b44;
  font-size: 2.25rem;
  font-weight: 900;
  line-height: 1.3;
}

.section-desc {
  color: #6b7280;
  font-size: 1rem;
  line-height: 1.8;
  margin-bottom: 0;
}

.group-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 28px 24px;
  align-items: start;
}

.group-card {
  width: 100%;
  border: 1px solid #eee6f6;
  background: #fff;
  border-radius: 24px;
  padding: 0;
  text-align: left;
  cursor: pointer;
  transition: all 0.28s ease;
  min-width: 0;
  overflow: hidden;
  box-shadow: 0 12px 24px rgba(75, 31, 115, 0.05);
}

.group-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 18px 34px rgba(75, 31, 115, 0.1);
}

.group-image-wrap {
  position: relative;
  width: 100%;
  height: 280px;
  overflow: hidden;
  background: #f3ebff;
}

.group-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.35s ease;
}

.group-card:hover .group-image {
  transform: scale(1.05);
}

.group-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(20, 10, 28, 0.02) 0%, rgba(20, 10, 28, 0.45) 100%);
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 16px;
}

.group-overlay-badge {
  min-height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.92);
  color: #6f42c1;
  font-size: 0.78rem;
  font-weight: 800;
}

.group-placeholder {
  width: 100%;
  height: 100%;
  color: #7b4cc2;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3ebff;
  font-size: 2.2rem;
}

.group-body {
  padding: 18px 18px 20px;
  text-align: left;
}

.group-name {
  color: #2f1b44;
  font-size: 1.18rem;
  font-weight: 800;
  line-height: 1.35;
  margin-bottom: 8px;
}

.group-subtext {
  color: #8a7d9e;
  font-size: 0.92rem;
  line-height: 1.6;
  min-height: 44px;
  margin-bottom: 10px;
}

.group-link {
  color: #7a4db3;
  font-size: 0.9rem;
  font-weight: 800;
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
  .group-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 992px) {
  .section-title {
    font-size: 1.75rem;
  }

  .group-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .group-image-wrap {
    height: 240px;
  }
}

@media (max-width: 576px) {
  .dog-page {
    padding-top: 24px;
  }

  .section-title {
    font-size: 1.35rem;
  }

  .group-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .group-image-wrap {
    height: 230px;
  }

  .group-name {
    font-size: 1rem;
  }
}
</style>