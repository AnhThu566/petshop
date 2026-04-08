<template>
  <div class="dog-page">
    <section v-if="!selectedGroupId" class="catalog-section">
      <div class="container-fluid custom-container px-3">
        <div class="section-heading text-center">
          <div class="intro-line"></div>
          <h2 class="section-title">{{ sectionTitle }}</h2>
          <div class="intro-line"></div>
        </div>

        <p class="section-desc text-center">
          {{ sectionDesc }}
        </p>

        <div v-if="loadingGroups" class="empty-box">
          <i class="fas fa-spinner fa-spin mb-3"></i>
          <p class="mb-0">Đang tải dữ liệu...</p>
        </div>

        <div v-else-if="groupList.length === 0" class="empty-box">
          <i class="fas fa-folder-open mb-3"></i>
          <p class="mb-0">Chưa có dữ liệu để hiển thị</p>
        </div>

        <div v-else class="group-grid">
          <button
            v-for="group in groupList"
            :key="group._id || group.id"
            type="button"
            class="group-card"
            @click="selectGroup(group)"
          >
            <div class="group-image-wrap">
              <img
                v-if="getGroupImage(group)"
                :src="getGroupImage(group)"
                :alt="group.name"
                class="group-image"
              />
              <div v-else class="group-placeholder">
                <i :class="viewMode === 'breed' ? 'fas fa-dog' : 'fas fa-warehouse'"></i>
              </div>
            </div>

            <div class="group-name">
              {{ group.name }}
            </div>
          </button>
        </div>
      </div>
    </section>

    <section v-else class="list-section">
      <div class="container-fluid custom-container px-3">
        <div class="page-toolbar">
          <div class="breadcrumb-wrap">
            <router-link to="/">Trang chủ</router-link>
            <span>/</span>
            <router-link :to="baseRoute">{{ catalogLabel }}</router-link>
            <span>/</span>
            <strong>{{ selectedGroup?.name || "Đang tải..." }}</strong>
          </div>

          <button class="back-btn" @click="goBack">
            <i class="fas fa-arrow-left mr-2"></i>
            Quay lại
          </button>
        </div>

        <div class="result-top">
          <h1 class="result-page-title">{{ listTitle }}</h1>
          <p class="result-count mb-0">Có {{ filteredDogs.length }} bé cún</p>
        </div>

        <div v-if="loadingDogs" class="empty-box mt-4">
          <i class="fas fa-spinner fa-spin mb-3"></i>
          <p class="mb-0">Đang tải danh sách chó...</p>
        </div>

        <div v-else-if="filteredDogs.length === 0" class="empty-box mt-4">
          <i class="fas fa-dog mb-3"></i>
          <p class="mb-0">Hiện chưa có bé cún nào trong mục này</p>
        </div>

        <div v-else class="dog-grid">
          <router-link
            v-for="dog in filteredDogs"
            :key="dog._id || dog.id"
            :to="`/dog/${dog._id || dog.id}`"
            class="dog-item text-decoration-none"
          >
            <div class="dog-card">
              <div class="dog-image-wrap">
                <img
                  v-if="dog.image"
                  :src="apiBase + dog.image"
                  :alt="dog.name"
                  class="dog-image"
                />
                <div v-else class="dog-placeholder">
                  <i class="fas fa-dog"></i>
                </div>
              </div>
            </div>

            <div class="dog-meta">
              <h4 class="dog-name">{{ dog.name }}</h4>
              <div class="dog-price">{{ formatCurrency(dog.price) }}</div>
            </div>
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import BreedService from "@/services/breed.service";
import FarmService from "@/services/farm.service";
import DogService from "@/services/dog.service";

export default {
  name: "DogList",
  data() {
    return {
      apiBase: "http://localhost:3000",
      viewMode: "breed",
      breedList: [],
      farmList: [],
      dogList: [],
      selectedGroupId: "",
      loadingGroups: false,
      loadingDogs: false,
    };
  },

  computed: {
    baseRoute() {
      return {
        path: "/dogs",
        query: {
          view: this.viewMode,
        },
      };
    },

    catalogLabel() {
      return this.viewMode === "farm" ? "Theo trang trại" : "Theo giống chó";
    },

    sectionTitle() {
      return this.viewMode === "farm" ? "Các Trang Trại" : "Các Giống Chó";
    },

    sectionDesc() {
      return this.viewMode === "farm"
        ? "Chọn trang trại để xem các bé cún có nguồn gốc từ trại đó."
        : "Chọn giống chó để xem các bé cún thuộc giống đó.";
    },

    groupList() {
      return this.viewMode === "farm" ? this.farmList : this.breedList;
    },

    selectedGroup() {
      return this.groupList.find(
        (item) => String(item._id || item.id) === String(this.selectedGroupId)
      );
    },

    listTitle() {
      if (!this.selectedGroup) {
        return this.viewMode === "farm"
          ? "Danh sách chó theo trang trại"
          : "Danh sách chó theo giống";
      }

      return this.viewMode === "farm"
        ? `Các bé cún từ ${this.selectedGroup.name}`
        : `Các bé cún giống ${this.selectedGroup.name}`;
    },

    filteredDogs() {
      if (!this.selectedGroupId) return [];

      return this.dogList.filter((dog) => {
        const targetId =
          this.viewMode === "farm"
            ? dog.farmId?._id || dog.farmId?.id
            : dog.breedId?._id || dog.breedId?.id;

        return String(targetId) === String(this.selectedGroupId);
      });
    },
  },

  watch: {
    "$route.fullPath": {
      immediate: true,
      async handler() {
        this.syncRouteData();
        await this.loadData();
      },
    },
  },

  methods: {
    syncRouteData() {
      this.viewMode = this.$route.query.view === "farm" ? "farm" : "breed";
      this.selectedGroupId = this.$route.query.id || "";
    },

    async loadData() {
      await this.fetchGroups();

      if (this.selectedGroupId) {
        await this.fetchDogs();
      } else {
        this.dogList = [];
      }
    },

    async fetchGroups() {
      this.loadingGroups = true;
      try {
        if (this.viewMode === "farm") {
          const data = await FarmService.getAll();
          this.farmList = (data || []).filter(
            (item) => item.status === "active" || !item.status
          );
        } else {
          const data = await BreedService.getAll();
          this.breedList = (data || []).filter(
            (item) => item.status === "active" || !item.status
          );
        }
      } catch (error) {
        console.error("Lỗi tải danh mục:", error);
        this.breedList = [];
        this.farmList = [];
      } finally {
        this.loadingGroups = false;
      }
    },

    async fetchDogs() {
      this.loadingDogs = true;
      try {
        const data = await DogService.getPublic();
        this.dogList = (data || []).filter((dog) =>
          ["Đã duyệt", "Chờ thanh toán", "Đã đặt cọc", "Đang giao", "Đã bán"].includes(
            dog.status
          )
        );
      } catch (error) {
        console.error("Lỗi tải danh sách chó:", error);
        this.dogList = [];
      } finally {
        this.loadingDogs = false;
      }
    },

    async selectGroup(group) {
      const id = String(group._id || group.id);

      await this.$router.push({
        path: "/dogs",
        query: {
          view: this.viewMode,
          id,
        },
      });
    },

    async goBack() {
      await this.$router.push(this.baseRoute);
    },

    getGroupImage(group) {
      if (this.viewMode === "farm") {
        if (group.images && group.images.length > 0) {
          return this.apiBase + group.images[0];
        }
        if (group.image) {
          return this.apiBase + group.image;
        }
        return "";
      }

      return group.image ? this.apiBase + group.image : "";
    },

    formatCurrency(value) {
      return Number(value || 0).toLocaleString("vi-VN") + " VNĐ";
    },
  },
};
</script>

<style scoped>
.dog-page {
  background: #ffffff;
  min-height: 100vh;
  padding: 34px 0 60px;
}

@media (min-width: 1200px) {
  .custom-container {
    max-width: 1360px !important;
  }
}

.catalog-section,
.list-section {
  padding: 8px 0 30px;
}

.section-heading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  margin-bottom: 14px;
}

.intro-line {
  flex: 1;
  max-width: 220px;
  height: 3px;
  background: linear-gradient(90deg, transparent, #7b4cc2, transparent);
  border-radius: 999px;
}

.section-title {
  margin: 0;
  color: #6f42c1;
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: 0.2px;
  white-space: nowrap;
}

.section-desc {
  color: #75678a;
  font-size: 1rem;
  margin-bottom: 28px;
}

.group-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 30px 24px;
  align-items: start;
}

.group-card {
  width: 100%;
  border: none;
  background: transparent;
  padding: 0;
  text-align: center;
  cursor: pointer;
  transition: all 0.25s ease;
  min-width: 0;
}

.group-card:hover {
  transform: translateY(-5px);
}

.group-image-wrap {
  width: 100%;
  height: 250px;
  border-radius: 18px;
  overflow: hidden;
  background: #f3ebff;
  box-shadow: 0 8px 20px rgba(94, 53, 177, 0.12);
}

.group-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.35s ease;
}

.group-card:hover .group-image {
  transform: scale(1.04);
}

.group-placeholder,
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

.group-name {
  text-align: center;
  margin-top: 12px;
  color: #5b4f66;
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1.35;
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

.result-top {
  margin-bottom: 22px;
}

.result-page-title {
  color: #4f3a73;
  font-size: 1.6rem;
  font-weight: 800;
  margin-bottom: 6px;
}

.result-count {
  color: #7f7194;
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

.dog-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 30px 24px;
  align-items: start;
}

.dog-item {
  display: block;
  width: 100%;
  text-decoration: none;
}

.dog-card {
  width: 100%;
  background: transparent;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: none;
  transition: all 0.25s ease;
  display: block;
}

.dog-item:hover .dog-card {
  transform: translateY(-5px);
}

.dog-image-wrap {
  width: 100%;
  height: 250px;
  overflow: hidden;
  background: #f3ebff;
  border-radius: 18px;
  box-shadow: 0 8px 20px rgba(94, 53, 177, 0.12);
}

.dog-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.35s ease;
}

.dog-item:hover .dog-image {
  transform: scale(1.04);
}

.dog-meta {
  margin-top: 14px;
  text-align: center;
}

.dog-name {
  color: #5b4f66;
  font-size: 1.15rem;
  font-weight: 800;
  margin-bottom: 8px;
  line-height: 1.3;
  text-align: center;
}

.dog-price {
  color: #6f49b6;
  font-size: 1.1rem;
  font-weight: 900;
  text-align: center;
}

.empty-box {
  background: #ffffff;
  border-radius: 20px;
  padding: 40px 20px;
  text-align: center;
  color: #7f7194;
  box-shadow: 0 8px 20px rgba(94, 53, 177, 0.08);
}

.empty-box i {
  font-size: 2.5rem;
  color: #7b4cc2;
}

@media (max-width: 1199px) {
  .group-grid,
  .dog-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 992px) {
  .section-title,
  .result-page-title {
    font-size: 1.7rem;
  }

  .intro-line {
    max-width: 80px;
  }

  .group-grid,
  .dog-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .group-image-wrap,
  .dog-image-wrap {
    height: 220px;
  }
}

@media (max-width: 576px) {
  .dog-page {
    padding-top: 24px;
  }

  .section-title,
  .result-page-title {
    font-size: 1.3rem;
  }

  .group-grid,
  .dog-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .group-image-wrap,
  .dog-image-wrap {
    height: 170px;
  }

  .group-name {
    font-size: 1rem;
  }

  .dog-name {
    font-size: 0.98rem;
  }

  .dog-price {
    font-size: 0.95rem;
  }

  .breadcrumb-wrap {
    font-size: 0.9rem;
  }
}
</style>