<template>
  <div class="dog-page">
    <section class="catalog-section">
      <div class="container-fluid custom-container px-3">
        <div class="section-heading-block text-center">
          <h2 class="section-title">Các Giống Chó</h2>
        </div>

        <div v-if="loading" class="empty-box">
          <i class="fas fa-spinner fa-spin mb-3"></i>
          <p class="mb-0">Đang tải dữ liệu...</p>
        </div>

        <div v-else-if="breedList.length === 0" class="empty-box">
          <i class="fas fa-folder-open mb-3"></i>
          <p class="mb-0">Chưa có giống chó để hiển thị</p>
        </div>

        <div v-else class="group-grid">
          <button
            v-for="breed in breedList"
            :key="breed._id || breed.id"
            type="button"
            class="group-card"
            @click="goToBreed(breed)"
          >
            <div class="group-image-wrap">
              <img
                v-if="getBreedImage(breed)"
                :src="getBreedImage(breed)"
                :alt="breed.name"
                class="group-image"
              />
              <div v-else class="group-placeholder">
                <i class="fas fa-dog"></i>
              </div>
            </div>

            <div class="group-body">
              <div class="group-name">
                {{ breed.name }}
              </div>
            </div>
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import BreedService from "@/services/breed.service";

export default {
  name: "DogBreedList",

  data() {
    return {
      apiBase: "http://localhost:3000",
      breedList: [],
      loading: false,
    };
  },

  mounted() {
    this.fetchBreeds();
  },

  methods: {
    async fetchBreeds() {
      this.loading = true;
      try {
        const data = await BreedService.getAll();
        this.breedList = Array.isArray(data)
          ? data.filter((item) => item.status === "active" || !item.status)
          : [];
      } catch (error) {
        console.error("Lỗi tải danh sách giống chó:", error);
        this.breedList = [];
      } finally {
        this.loading = false;
      }
    },

    goToBreed(breed) {
      const id = breed._id || breed.id;
      this.$router.push(`/dogs/breeds/${id}`);
    },

    getBreedImage(breed) {
      if (!breed?.image) return "";
      if (String(breed.image).startsWith("http")) return breed.image;
      return this.apiBase + breed.image;
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
  margin: 0 auto 34px;
}

.section-title {
  margin: 0;
  color: #5a2d91;
  font-size: 2.35rem;
  font-weight: 900;
  line-height: 1.3;
  text-align: center;
}

.group-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 26px 24px;
  align-items: start;
}

.group-card {
  width: 100%;
  border: 1px solid #eee6f6;
  background: #fff;
  border-radius: 22px;
  padding: 0;
  text-align: center;
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
  width: 100%;
  height: 270px;
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
  padding: 16px 14px 18px;
  text-align: center;
}

.group-name {
  color: #5a2d91;
  font-size: 1.2rem;
  font-weight: 800;
  line-height: 1.35;
  margin: 0;
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

@media (max-width: 1399px) {
  .group-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 1199px) {
  .group-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 992px) {
  .section-title {
    font-size: 1.85rem;
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
    font-size: 1.4rem;
  }

  .group-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .group-image-wrap {
    height: 230px;
  }

  .group-name {
    font-size: 1.02rem;
  }
}
</style>