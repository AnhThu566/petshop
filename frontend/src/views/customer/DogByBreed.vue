<template>
  <div class="dog-page">
    <section class="list-section">
      <div class="container-fluid custom-container px-3">
<div class="breadcrumb-row">
  <router-link to="/" class="crumb-link">Trang chủ</router-link>
  <span class="crumb-sep">/</span>
  <router-link to="/dogs/breeds" class="crumb-link">Giống chó</router-link>
  <span class="crumb-sep">/</span>
  <span class="crumb-current">{{ selectedBreed?.name || "Đang tải..." }}</span>
</div>

<div class="back-row">
  <button class="back-btn" @click="goBack">
    <i class="fas fa-arrow-left mr-1"></i> Quay lại
  </button>
</div>

        <div v-if="loadingBreed" class="empty-box mt-4">
          <i class="fas fa-spinner fa-spin mb-3"></i>
          <p class="mb-0">Đang tải thông tin giống chó...</p>
        </div>

        <div v-else-if="selectedBreed" class="breed-detail-hero">
          <div class="breed-detail-grid">
            <div class="breed-detail-image-col">
              <div class="breed-detail-image-box">
                <img
                  v-if="getBreedImage(selectedBreed)"
                  :src="getBreedImage(selectedBreed)"
                  :alt="selectedBreed.name"
                  class="breed-detail-image"
                />
                <div v-else class="breed-detail-placeholder">
                  <i class="fas fa-dog"></i>
                </div>
              </div>
            </div>

            <div class="breed-detail-content">
              <h1 class="breed-detail-title">{{ selectedBreed.name }}</h1>

              <div class="breed-info-section" v-if="breedOrigin">
                <h3 class="breed-info-heading">Nguồn gốc</h3>
                <p class="breed-info-text">
                  {{ breedOrigin }}
                </p>
              </div>

              <div class="breed-info-section" v-if="breedDescription">
                <h3 class="breed-info-heading">Mô tả đặc điểm</h3>
                <p class="breed-info-text">
                  {{ breedDescription }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="loadingDogs" class="empty-box mt-4">
          <i class="fas fa-spinner fa-spin mb-3"></i>
          <p class="mb-0">Đang tải danh sách chó...</p>
        </div>

        <template v-else>
          <div class="breed-dog-heading text-center mt-4 mb-4">
            <h2 class="breed-dog-title">
              {{
                selectedBreed
                  ? `Các bé chó thuộc giống ${selectedBreed.name}`
                  : "Các bé chó đang được hiển thị"
              }}
            </h2>
            <p class="breed-dog-subtitle">
              Theo dõi tình trạng hiện tại của từng bé trước khi đặt cọc
            </p>
          </div>

          <div v-if="dogList.length === 0" class="empty-box">
            <i class="fas fa-dog mb-3"></i>
            <p class="mb-0">Hiện chưa có bé cún nào trong giống này</p>
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

                  <div class="dog-image-gradient"></div>

                  <span
                    class="dog-status-badge"
                    :class="getStatusClass(dog.saleStatus)"
                  >
                    {{ getSaleStatusText(dog.saleStatus) }}
                  </span>
                </div>

                <div class="dog-meta">
                  <h4 class="dog-name">{{ dog.name }}</h4>
                  <div class="dog-price">
                    {{ formatCurrency(dog.finalPrice || dog.price) }}
                  </div>
                </div>
              </div>
            </router-link>
          </div>
        </template>
      </div>
    </section>
  </div>
</template>

<script>
import BreedService from "@/services/breed.service";
import DogService from "@/services/dog.service";

export default {
  name: "DogByBreed",

  props: {
    id: {
      type: String,
      default: "",
    },
  },

  data() {
    return {
      apiBase: "http://localhost:3000",
      selectedBreed: null,
      dogList: [],
      loadingBreed: false,
      loadingDogs: false,
    };
  },

  computed: {
    breedOrigin() {
      if (!this.selectedBreed) return "";
      return this.selectedBreed.origin || this.selectedBreed.nguonGoc || "";
    },

    breedDescription() {
      if (!this.selectedBreed) return "";
      return (
        this.selectedBreed.description ||
        this.selectedBreed.moTa ||
        this.selectedBreed.characteristics ||
        this.selectedBreed.dacDiem ||
        ""
      );
    },
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
      await Promise.all([this.fetchBreed(), this.fetchDogs()]);
    },

    async fetchBreed() {
      this.loadingBreed = true;
      try {
        const breeds = await BreedService.getAll();
        const breedList = Array.isArray(breeds) ? breeds : [];
        this.selectedBreed =
          breedList.find(
            (item) => String(item._id || item.id) === String(this.id)
          ) || null;
      } catch (error) {
        console.error("Lỗi tải thông tin giống chó:", error);
        this.selectedBreed = null;
      } finally {
        this.loadingBreed = false;
      }
    },

    async fetchDogs() {
      this.loadingDogs = true;
      try {
        const data = await DogService.getPublic({ breedId: this.id });
        this.dogList = Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Lỗi tải danh sách chó theo giống:", error);
        this.dogList = [];
      } finally {
        this.loadingDogs = false;
      }
    },

    goBack() {
      this.$router.push("/dogs/breeds");
    },

    getBreedImage(breed) {
      if (!breed?.image) return "";
      if (String(breed.image).startsWith("http")) return breed.image;
      return this.apiBase + breed.image;
    },

    getDogImage(dog) {
      if (!dog?.image) return "";
      if (String(dog.image).startsWith("http")) return dog.image;
      return this.apiBase + dog.image;
    },

getSaleStatusText(status) {
  if (status === "Sẵn sàng bán") return "Sẵn sàng bán";
  if (["Chờ thanh toán", "Đã đặt cọc", "Đang giao"].includes(status)) {
    return "Đã có người đặt";
  }
  if (status === "Đã bán") return "Đã bán";
  return "Sẵn sàng bán";
},

getStatusClass(status) {
  if (status === "Sẵn sàng bán") return "status-ready";
  if (["Chờ thanh toán", "Đã đặt cọc", "Đang giao"].includes(status)) {
    return "status-deposited";
  }
  if (status === "Đã bán") return "status-sold";
  return "status-ready";
},

    formatCurrency(value) {
      if (value === null || value === undefined || value === "") return "Liên hệ";
      return Number(value).toLocaleString("vi-VN") + " VNĐ";
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

.breadcrumb-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
  color: #8b7fa0;
  font-size: 0.92rem;
}

.crumb-link {
  color: #6a1b9a;
  font-weight: 700;
  text-decoration: none;
}

.crumb-link:hover {
  color: #5a1484;
}

.crumb-sep {
  color: #b0a3c0;
}

.crumb-current {
  color: #7b7287;
  font-weight: 600;
}

.back-row {
  margin-bottom: 18px;
}

.back-btn {
  border: 1px solid #dfd3ec;
  background: #fff;
  color: #5c5368;
  border-radius: 12px;
  height: 40px;
  padding: 0 16px;
  font-weight: 700;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: #faf6fe;
  border-color: #ccb5e7;
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

.breed-detail-hero {
  background: linear-gradient(135deg, #faf5ff, #f7f0fd);
  border: 1px solid #eadcf6;
  border-radius: 28px;
  padding: 28px;
  box-shadow: 0 12px 24px rgba(75, 31, 115, 0.05);
}

.breed-detail-grid {
  display: grid;
  grid-template-columns: 360px minmax(0, 1fr);
  gap: 28px;
  align-items: start;
}

.breed-detail-image-box {
  width: 100%;
  height: 360px;
  overflow: hidden;
  border-radius: 24px;
  background: #f3ebff;
  border: 1px solid #eadcf6;
}

.breed-detail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.breed-detail-placeholder {
  width: 100%;
  height: 100%;
  color: #7b4cc2;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.4rem;
}

.breed-detail-title {
  color: #5a2d91;
  font-size: 2.3rem;
  font-weight: 900;
  line-height: 1.25;
  margin-bottom: 18px;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.breed-info-section + .breed-info-section {
  margin-top: 16px;
}

.breed-info-heading {
  color: #5a2d91;
  font-size: 1.06rem;
  font-weight: 800;
  margin-bottom: 6px;
}

.breed-info-text {
  color: #6b7280;
  line-height: 1.8;
  margin-bottom: 0;
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.breed-dog-heading {
  margin-bottom: 24px;
}

.breed-dog-title {
  color: #31114d;
  font-size: 2rem;
  font-weight: 900;
  line-height: 1.3;
  margin: 0 0 6px;
}

.breed-dog-subtitle {
  margin: 0;
  color: #7f7194;
  font-size: 0.95rem;
  line-height: 1.6;
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

.status-ready {
  background: #16a34a;
  color: #fff;
  border: none;
}

.status-deposited {
  background: #7c3aed;
  color: #fff;
  border: none;
}

.status-sold {
  background: #6b7280;
  color: #fff;
  border: none;
}

.status-stop {
  background: #dc2626;
  color: #fff;
  border: none;
}

.status-default {
  background: #64748b;
  color: #fff;
  border: none;
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

.dog-meta {
  padding: 16px 16px 18px;
  text-align: center;
}

.dog-name {
  color: #5a2d91;
  font-size: 1.14rem;
  font-weight: 800;
  margin-bottom: 8px;
  line-height: 1.35;
  text-align: center;
}

.dog-price {
  color: #6f49b6;
  font-size: 1.08rem;
  font-weight: 900;
  margin-bottom: 0;
  text-align: center;
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

  .breed-detail-grid {
    grid-template-columns: 320px minmax(0, 1fr);
  }
}

@media (max-width: 992px) {
  .breed-detail-grid {
    grid-template-columns: 1fr;
  }

  .breed-detail-image-box {
    height: 300px;
  }

  .breed-detail-title,
  .breed-dog-title {
    font-size: 1.75rem;
  }

  .dog-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dog-image-wrap {
    height: 240px;
  }
}

@media (max-width: 576px) {
  .dog-page {
    padding-top: 24px;
  }

  .breed-detail-hero {
    padding: 18px;
  }

  .breed-detail-title,
  .breed-dog-title {
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

  .breed-detail-image-box {
    height: 240px;
  }
}
</style>