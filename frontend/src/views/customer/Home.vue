<template>
  <div class="home-page">
    <!-- BANNER -->
    <section class="hero-banner">
      <div
        class="hero-slide"
        :style="{
          backgroundImage: `linear-gradient(to right, rgba(15, 5, 25, 0.8) 0%, rgba(28, 10, 43, 0.4) 50%, rgba(0,0,0,0) 100%), url('${heroSlides[currentSlide].image}')`
        }"
      >
        <div class="container custom-container h-100 position-relative z-index-2">
          <div class="row align-items-center h-100">
            <div class="col-lg-7 col-md-9">
              <div class="hero-content text-left" :key="currentSlide">
                <span class="hero-label mb-3 d-inline-block shadow-sm">
                  <i class="fas fa-paw mr-2 text-warning"></i>
                  {{ heroSlides[currentSlide].label }}
                </span>

                <h1 class="hero-heading font-weight-bold mb-3">
                  {{ heroSlides[currentSlide].title }}
                </h1>

                <p class="hero-desc mb-4">
                  {{ heroSlides[currentSlide].desc }}
                </p>

                <div class="hero-action-group mb-4 justify-content-start">
                  <router-link
                    :to="heroSlides[currentSlide].primaryLink"
                    class="hero-main-btn shadow-lg"
                  >
                    {{ heroSlides[currentSlide].primaryText }}
                    <i class="fas fa-arrow-right ml-2" style="font-size: 0.9em;"></i>
                  </router-link>

                  <router-link
                    v-if="heroSlides[currentSlide].secondaryText"
                    :to="heroSlides[currentSlide].secondaryLink"
                    class="hero-sub-btn"
                  >
                    {{ heroSlides[currentSlide].secondaryText }}
                  </router-link>
                </div>

                <div class="hero-tabs justify-content-start">
                  <router-link
                    to="/dogs"
                    class="hero-tab-btn glass-effect"
                    :class="{ active: heroSlides[currentSlide].activeTab === 'dogs' }"
                  >
                    CHÓ CẢNH
                  </router-link>

                  <router-link
                    to="/accessories"
                    class="hero-tab-btn glass-effect"
                    :class="{ active: heroSlides[currentSlide].activeTab === 'accessories' }"
                  >
                    PHỤ KIỆN
                  </router-link>

                  <router-link
                    to="/services"
                    class="hero-tab-btn glass-effect"
                    :class="{ active: heroSlides[currentSlide].activeTab === 'services' }"
                  >
                    DỊCH VỤ
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button class="hero-nav prev glass-effect" @click="prevSlide">
          <i class="fas fa-chevron-left"></i>
        </button>

        <button class="hero-nav next glass-effect" @click="nextSlide">
          <i class="fas fa-chevron-right"></i>
        </button>

        <div class="hero-dots">
          <span
            v-for="(slide, index) in heroSlides"
            :key="index"
            class="hero-dot"
            :class="{ active: currentSlide === index }"
            @click="goToSlide(index)"
          ></span>
        </div>
      </div>
    </section>

    <!-- GIỚI THIỆU -->
    <section class="intro-section">
      <div class="container custom-container">
        <div class="intro-section-header text-center mb-5">
          <div class="intro-line"></div>
          <h2 class="intro-title">
            <i class="fas fa-paw mr-2"></i>
            Giới thiệu về PetShop
            <i class="fas fa-bone ml-2"></i>
          </h2>
          <div class="intro-line"></div>
        </div>

        <div class="row align-items-stretch intro-row">
          <div class="col-lg-6 mb-4 mb-lg-0">
            <div class="intro-card intro-text-card h-100">
              <div class="intro-card-inner">
                <h3 class="intro-card-title mb-3">
                  PetShop – nơi kết nối chó cảnh, phụ kiện và dịch vụ chăm sóc thú cưng
                </h3>

                <p class="intro-text">
                  PetShop được xây dựng với mục tiêu mang đến cho khách hàng một nơi
                  mua chó cảnh có <strong>nguồn gốc rõ ràng</strong>, thông tin minh bạch
                  và trải nghiệm thuận tiện trên cùng một hệ thống.
                </p>

                <p class="intro-text mb-0">
                  Tại đây, khách hàng có thể xem thông tin từng bé cún, lựa chọn phụ kiện
                  cần thiết và sử dụng các dịch vụ chăm sóc thú cưng một cách dễ dàng.
                </p>
              </div>
            </div>
          </div>

          <div class="col-lg-6">
            <div class="intro-card intro-image-card h-100">
              <div class="intro-image-wrap">
                <img :src="introImage" alt="Giới thiệu PetShop" class="intro-image" />
              </div>

              <div class="intro-image-badge">
                <i class="fas fa-heart mr-2"></i>
                Chăm sóc tận tâm
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CÁC GIỐNG CHÓ -->
<!-- CÁC GIỐNG CHÓ -->
<section class="breed-section">
  <div class="container custom-container">
    <div class="breed-section-header text-center mb-5">
      <div class="intro-line"></div>
      <h2 class="intro-title">
        <i class="fas fa-dog mr-2"></i>
        Các giống chó nổi bật
        <i class="fas fa-paw ml-2"></i>
      </h2>
      <div class="intro-line"></div>
    </div>

    <div class="row justify-content-start" v-if="breedList.length > 0">
      <div
        class="col-lg-4 col-md-6 mb-4"
        v-for="breed in breedList"
        :key="breed._id || breed.id"
      >
        <div class="breed-simple-card">
          <div class="breed-simple-image-wrap">
            <img
              v-if="breed.image"
              :src="apiBase + breed.image"
              :alt="breed.name"
              class="breed-simple-image"
            />
            <div v-else class="breed-simple-no-image">
              <i class="fas fa-dog mb-2"></i>
              <span>Chưa có ảnh</span>
            </div>
          </div>

          <div class="breed-simple-body">
            <h4 class="breed-simple-name mb-0">{{ breed.name }}</h4>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="breed-empty text-center">
      <i class="fas fa-dog mb-3"></i>
      <h5 class="mb-2">Chưa có dữ liệu giống chó</h5>
      <p class="text-muted mb-0">
        Vui lòng thêm giống chó từ trang quản trị để hiển thị tại đây.
      </p>
    </div>

    <div class="section-more text-center mt-2" v-if="breedList.length > 0">
      <router-link to="/dogs?view=breed" class="section-more-btn text-decoration-none">
        Xem nhiều hơn
        <i class="fas fa-arrow-right ml-2"></i>
      </router-link>
    </div>
  </div>
</section>

    <!-- CÁC BÉ CÚN NỔI BẬT -->
<!-- CÁC BÉ CÚN NỔI BẬT -->
<section class="featured-dog-section">
  <div class="container custom-container">
    <div class="featured-header text-center mb-5">
      <div class="intro-line intro-line-light"></div>
      <h2 class="featured-title">
        <i class="fas fa-paw mr-2"></i>
        Các bé cún sẵn sàng về nhà mới
        <i class="fas fa-home ml-2"></i>
      </h2>
      <div class="intro-line intro-line-light"></div>
    </div>

    <div class="row" v-if="featuredDogs.length > 0">
      <div
        class="col-lg-3 col-md-6 mb-4"
        v-for="dog in featuredDogs"
        :key="dog._id || dog.id"
      >
        <router-link
          :to="dogDetailLink(dog)"
          class="featured-dog-card d-block text-decoration-none"
        >
          <div class="featured-dog-image-wrap">
            <img
              v-if="dog.image"
              :src="apiBase + dog.image"
              :alt="dog.name"
              class="featured-dog-image"
            />
            <div v-else class="featured-dog-no-image">
              <i class="fas fa-dog mb-2"></i>
              <span>Chưa có ảnh</span>
            </div>
          </div>

          <div class="featured-dog-body text-center">
            <h4 class="featured-dog-name mb-2">{{ dog.name }}</h4>

            <p class="featured-dog-price mb-0">
              {{ Number(dog.price || 0).toLocaleString("vi-VN") }} VNĐ
            </p>
          </div>
        </router-link>
      </div>
    </div>

    <div v-else class="breed-empty text-center">
      <i class="fas fa-dog mb-3"></i>
      <h5 class="mb-2">Chưa có bé cún nào để hiển thị</h5>
      <p class="text-muted mb-0">
        Khi admin duyệt chó công khai, dữ liệu sẽ hiển thị tại đây.
      </p>
    </div>

    <div class="section-more text-center mt-3" v-if="featuredDogs.length > 0">
      <router-link to="/dogs" class="section-more-btn text-decoration-none">
        Xem nhiều hơn
        <i class="fas fa-arrow-right ml-2"></i>
      </router-link>
    </div>
  </div>
</section>

<!-- PHỤ KIỆN NỔI BẬT -->
<section class="accessory-section">
  <div class="container custom-container">
    <div class="featured-header text-center mb-5">
      <div class="intro-line"></div>
      <h2 class="intro-title">
        <i class="fas fa-bone mr-2"></i>
        Phụ kiện nổi bật
        <i class="fas fa-paw ml-2"></i>
      </h2>
      <div class="intro-line"></div>
    </div>

    <div class="row" v-if="accessoryList.length > 0">
      <div
        class="col-lg-3 col-md-6 mb-4"
        v-for="item in accessoryList"
        :key="item._id || item.id"
      >
        <router-link
          :to="`/accessories/${item._id || item.id}`"
          class="accessory-card d-block text-decoration-none"
        >
          <div class="accessory-image-wrap">
            <img
              v-if="item.image"
              :src="apiBase + item.image"
              :alt="item.name"
              class="accessory-image"
            />
            <div v-else class="accessory-no-image">
              <i class="fas fa-box-open mb-2"></i>
              <span>Chưa có ảnh</span>
            </div>
          </div>

          <div class="accessory-body text-center">
            <h4 class="accessory-name mb-2">{{ item.name }}</h4>
            <p class="accessory-price mb-0">
              {{ Number(item.price || 0).toLocaleString("vi-VN") }} VNĐ
            </p>
          </div>
        </router-link>
      </div>
    </div>

    <div v-else class="breed-empty text-center">
      <i class="fas fa-box-open mb-3"></i>
      <h5 class="mb-2">Chưa có phụ kiện nào để hiển thị</h5>
      <p class="text-muted mb-0">
        Khi admin thêm phụ kiện đang bán, dữ liệu sẽ hiển thị tại đây.
      </p>
    </div>

    <div class="section-more text-center mt-3" v-if="accessoryList.length > 0">
      <router-link to="/accessories" class="section-more-btn text-decoration-none">
        Xem nhiều hơn
        <i class="fas fa-arrow-right ml-2"></i>
      </router-link>
    </div>
  </div>
</section>
  </div>
</template>

<script>
import BreedService from "@/services/breed.service";
import DogService from "@/services/dog.service";
import AccessoryService from "@/services/accessory.service";
import banner1 from "@/assets/images/banner1.jpg";
import banner2 from "@/assets/images/banner2.jpg";
import banner3 from "@/assets/images/banner3.jpg";
import introImage from "@/assets/images/banner1.jpg";

export default {
  data() {
    return {
      currentSlide: 0,
      slideInterval: null,
      introImage,
      breedList: [],
      featuredDogs: [],
      accessoryList: [],
      apiBase: "http://localhost:3000",
      heroSlides: [
        {
          label: "Thuần chủng 100%",
          title: "LỰA CHỌN BÉ CÚN KHỎE MẠNH VÀ ĐÁNG TIN CẬY",
          desc: "Xem thông tin từng bé, tình trạng sức khỏe và chọn người bạn phù hợp cho gia đình bạn.",
          image: banner1,
          primaryText: "Xem chó cảnh",
          primaryLink: "/dogs",
          secondaryText: "Tìm hiểu thêm",
          secondaryLink: "/",
          activeTab: "dogs",
        },
        {
          label: "Phụ kiện thiết yếu",
          title: "CHUẨN BỊ ĐẦY ĐỦ PHỤ KIỆN CHO BÉ NGAY TỪ NGÀY ĐẦU",
          desc: "Mua sắm bát ăn, dây dắt, đồ chơi và các vật dụng chăm sóc giúp bé thích nghi tốt hơn.",
          image: banner2,
          primaryText: "Xem phụ kiện",
          primaryLink: "/accessories",
          secondaryText: "Xem chó cảnh",
          secondaryLink: "/dogs",
          activeTab: "accessories",
        },
        {
          label: "Dịch vụ chuyên nghiệp",
          title: "ĐẶT LỊCH DỊCH VỤ CHĂM SÓC THÚ CƯNG NHANH CHÓNG",
          desc: "Theo dõi lịch đặt, trạng thái xử lý và chăm sóc bé dễ dàng ngay trên hệ thống.",
          image: banner3,
          primaryText: "Xem dịch vụ",
          primaryLink: "/services",
          secondaryText: "Đơn hàng của tôi",
          secondaryLink: "/tra-cuu-don",
          activeTab: "services",
        },
      ],
    };
  },

  async mounted() {
    this.startSlide();
    await this.fetchBreeds();
    await this.fetchFeaturedDogs();
    await this.fetchAccessories();
  },

  beforeUnmount() {
    this.stopSlide();
  },

  methods: {
async fetchBreeds() {
  try {
    const response = await BreedService.getAll();

    this.breedList = (response || [])
      .filter((item) => item.status === "active" || !item.status)
      .sort((a, b) => (a.maGiong || "").localeCompare(b.maGiong || ""))
      .slice(0, 6);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách giống chó:", error);
    this.breedList = [];
  }
},

async fetchFeaturedDogs() {
  try {
    const response = await DogService.getPublic();
    this.featuredDogs = (response || [])
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách chó nổi bật:", error);
    this.featuredDogs = [];
  }
},

async fetchAccessories() {
  try {
    const response = await AccessoryService.getPublic();
    this.accessoryList = (response || []).slice(0, 8);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách phụ kiện nổi bật:", error);
    this.accessoryList = [];
  }
},
    dogDetailLink(dog) {
      const id = dog._id || dog.id;
      return `/dog/${id}`;
    },

    startSlide() {
      this.stopSlide();
      this.slideInterval = setInterval(() => {
        this.currentSlide = (this.currentSlide + 1) % this.heroSlides.length;
      }, 5000);
    },

    stopSlide() {
      if (this.slideInterval) {
        clearInterval(this.slideInterval);
        this.slideInterval = null;
      }
    },

    nextSlide() {
      this.currentSlide = (this.currentSlide + 1) % this.heroSlides.length;
      this.startSlide();
    },

    prevSlide() {
      this.currentSlide =
        (this.currentSlide - 1 + this.heroSlides.length) % this.heroSlides.length;
      this.startSlide();
    },

    goToSlide(index) {
      this.currentSlide = index;
      this.startSlide();
    },
  },
};
</script>

<style scoped>
@keyframes slideInLeft {
  0% {
    opacity: 0;
    transform: translateX(-30px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

.home-page {
  background: linear-gradient(180deg, #fbf8fd 0%, #ffffff 100%);
  min-height: 100vh;
}

@media (min-width: 1200px) {
  .custom-container {
    max-width: 1360px !important;
  }
}

.z-index-2 {
  z-index: 2;
}

/* HERO */
.hero-banner {
  padding: 0;
  margin: 0;
}

.hero-slide {
  position: relative;
  min-height: 560px;
  border-radius: 0;
  overflow: hidden;
  background-size: cover;
  background-position: center 35%;
  transition: background-image 0.8s ease-in-out;
}

.hero-content {
  color: white;
  padding: 40px 0;
  animation: slideInLeft 0.7s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
}

.text-left {
  text-align: left !important;
}

.glass-effect {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.hero-label {
  padding: 7px 18px;
  border-radius: 999px;
  color: #fff;
  font-size: 0.83rem;
  font-weight: 700;
  letter-spacing: 0.6px;
  background: rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  text-transform: uppercase;
}

.hero-heading {
  font-size: 2.7rem;
  line-height: 1.3;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.45);
  max-width: 720px;
}

.hero-desc {
  font-size: 1.04rem;
  line-height: 1.75;
  color: rgba(255, 255, 255, 0.96);
  max-width: 620px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
}

.hero-action-group {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.hero-main-btn,
.hero-sub-btn {
  min-width: 180px;
  height: 48px;
  padding: 0 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  border-radius: 999px;
  letter-spacing: 0.3px;
}

.hero-main-btn {
  background: linear-gradient(135deg, #f4c842, #ffb300);
  color: #31114d;
  border: none;
}

.hero-main-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(244, 200, 66, 0.45) !important;
  color: #31114d;
  text-decoration: none;
}

.hero-sub-btn {
  color: white;
  border: 1.5px solid rgba(255, 255, 255, 0.82);
  background: rgba(255, 255, 255, 0.06);
}

.hero-sub-btn:hover {
  background: rgba(255, 255, 255, 0.16);
  color: white;
  text-decoration: none;
}

.hero-tabs {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.hero-tab-btn {
  min-width: 145px;
  height: 42px;
  padding: 0 20px;
  border-radius: 999px;
  color: rgba(255, 255, 255, 0.88);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.84rem;
  letter-spacing: 0.4px;
  transition: all 0.3s ease;
}

.hero-tab-btn:hover {
  background: rgba(255, 255, 255, 0.22);
  color: white;
  text-decoration: none;
}

.hero-tab-btn.active {
  background: white;
  color: #4b1f73;
  border-color: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.18);
}

.hero-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  color: white;
  z-index: 5;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  cursor: pointer;
  border: none;
}

.hero-nav:hover {
  background: rgba(255, 255, 255, 0.35);
  transform: translateY(-50%) scale(1.08);
}

.hero-nav.prev {
  left: 30px;
}

.hero-nav.next {
  right: 30px;
}

.hero-dots {
  position: absolute;
  left: 50%;
  bottom: 25px;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 5;
  background: rgba(0, 0, 0, 0.22);
  padding: 8px 12px;
  border-radius: 999px;
  backdrop-filter: blur(4px);
}

.hero-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: all 0.3s ease;
}

.hero-dot.active {
  background: #f4c842;
  width: 28px;
  border-radius: 10px;
}

/* INTRO */
.intro-section {
  padding: 58px 0 24px;
}

.intro-section-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
}

.intro-line {
  flex: 1;
  max-width: 260px;
  height: 3px;
  background: linear-gradient(90deg, transparent, #b79bd3, transparent);
  border-radius: 999px;
}

.intro-title {
  margin: 0;
  color: #76529f;
  font-size: 2.1rem;
  font-weight: 800;
  letter-spacing: 0.2px;
}

.intro-row {
  align-items: stretch;
}

.intro-card {
  height: 100%;
  border-radius: 28px;
  overflow: hidden;
  box-shadow: 0 14px 30px rgba(75, 31, 115, 0.08);
}

.intro-text-card {
  background: linear-gradient(180deg, #faf5ff 0%, #f5edfd 100%);
  border: 1px solid #eadcf6;
  padding: 0;
}

.intro-card-inner {
  height: 100%;
  padding: 34px 34px 32px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.intro-card-title {
  color: #4b1f73;
  font-size: 1.45rem;
  line-height: 1.45;
  font-weight: 800;
}

.intro-text {
  color: #5d4d6f;
  font-size: 1.02rem;
  line-height: 1.85;
  margin-bottom: 16px;
}

.intro-image-card {
  position: relative;
  background: #f8f2fc;
  border: 1px solid #eadcf6;
  padding: 18px;
}

.intro-image-wrap {
  width: 100%;
  height: 100%;
  min-height: 420px;
  border-radius: 22px;
  overflow: hidden;
  background: white;
  box-shadow: inset 0 0 0 1px rgba(123, 88, 160, 0.08);
}

.intro-image {
  width: 100%;
  height: 100%;
  min-height: 420px;
  object-fit: cover;
  display: block;
  transition: transform 0.4s ease;
}

.intro-image-card:hover .intro-image {
  transform: scale(1.04);
}

.intro-image-badge {
  position: absolute;
  left: 34px;
  bottom: 34px;
  padding: 10px 18px;
  border-radius: 999px;
  background: rgba(75, 31, 115, 0.88);
  color: white;
  font-size: 0.9rem;
  font-weight: 700;
  backdrop-filter: blur(6px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18);
}

/* BREED SECTION - SIMPLE STYLE */
.breed-section {
  padding: 26px 0 26px;
}

.breed-simple-card {
  background: transparent;
  border-radius: 18px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.breed-simple-card:hover {
  transform: translateY(-5px);
}

.breed-simple-image-wrap {
  width: 100%;
  height: 460px;
  border-radius: 18px;
  overflow: hidden;
  background: #f3eef8;
  box-shadow: 0 8px 20px rgba(75, 31, 115, 0.08);
}

.breed-simple-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.35s ease;
}

.breed-simple-card:hover .breed-simple-image {
  transform: scale(1.04);
}

.breed-simple-no-image {
  width: 100%;
  height: 100%;
  color: #8d77a7;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
}

.breed-simple-no-image i {
  font-size: 2rem;
}

.breed-simple-body {
  padding-top: 14px;
  text-align: center;
}

.breed-simple-name {
  color: #5d5466;
  font-size: 1.8rem;
  font-weight: 700;
  line-height: 1.3;
}

/* FEATURED DOG SECTION */
/* FEATURED DOG SECTION */
/* FEATURED DOG SECTION */
.featured-dog-section {
  padding: 55px 0 60px;
  background: linear-gradient(180deg, #efe6fb 0%, #eadcf8 100%);
}

.featured-title {
  margin: 0;
  color: #6b4ca1;
  font-size: 2.1rem;
  font-weight: 800;
  letter-spacing: 0.2px;
}

.intro-line-light {
  background: linear-gradient(90deg, transparent, #bfa7de, transparent);
}

.featured-dog-card {
  background: transparent;
  border: none;
  border-radius: 18px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.featured-dog-card:hover {
  transform: translateY(-5px);
}

.featured-dog-image-wrap {
  position: relative;
  width: 100%;
  height: 320px;
  overflow: hidden;
  border-radius: 14px;
  background: #f7f2fc;
  box-shadow: 0 10px 24px rgba(75, 31, 115, 0.08);
}

.featured-dog-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.35s ease;
}

.featured-dog-card:hover .featured-dog-image {
  transform: scale(1.04);
}

.featured-dog-no-image {
  color: #8d77a7;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 0.95rem;
}

.featured-dog-no-image i {
  font-size: 2rem;
}

.featured-dog-body {
  padding: 14px 8px 0;
}

.featured-dog-name {
  color: #5c5270;
  font-size: 1.3rem;
  font-weight: 700;
  line-height: 1.3;
}

.featured-dog-price {
  color: #6b4ca1;
  font-size: 1.18rem;
  font-weight: 800;
}

/* ACCESSORY SECTION */
/* ACCESSORY SECTION */
.accessory-section {
  padding: 48px 0 56px;
  background: #fff;
}

.accessory-card {
  background: transparent;
  border: none;
  border-radius: 18px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.accessory-card:hover {
  transform: translateY(-5px);
}

.accessory-image-wrap {
  width: 100%;
  height: 260px;
  overflow: hidden;
  border-radius: 14px;
  background: #f7f2fc;
  box-shadow: 0 10px 24px rgba(75, 31, 115, 0.08);
}

.accessory-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.35s ease;
}

.accessory-card:hover .accessory-image {
  transform: scale(1.04);
}

.accessory-no-image {
  color: #8d77a7;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 0.95rem;
}

.accessory-no-image i {
  font-size: 2rem;
}

.accessory-body {
  padding: 14px 8px 0;
}

.accessory-name {
  color: #5c5270;
  font-size: 1.18rem;
  font-weight: 700;
  line-height: 1.35;
}

.accessory-price {
  color: #6b4ca1;
  font-size: 1.08rem;
  font-weight: 800;
}

.breed-empty {
  background: white;
  border: 1px dashed #dbc5ef;
  border-radius: 22px;
  padding: 48px 20px;
  color: #7b58a0;
}

.breed-empty i {
  font-size: 2rem;
}

@media (max-width: 992px) {
  .hero-slide {
    min-height: 500px;
  }

  .hero-heading {
    font-size: 2.15rem;
    max-width: 100%;
  }

  .hero-desc {
    font-size: 0.98rem;
    max-width: 100%;
  }

  .intro-title {
    font-size: 1.8rem;
  }

  .intro-line {
    max-width: 120px;
  }

  .intro-card-title {
    font-size: 1.25rem;
  }

  .intro-image-wrap,
  .intro-image {
    min-height: 320px;
  }

.breed-simple-image-wrap {
  height: 260px;
}

.featured-dog-image-wrap {
  height: 240px;
}

.breed-simple-name,
.featured-dog-name {
  font-size: 1.12rem;
}

.featured-title {
  font-size: 1.35rem;
}
}

@media (max-width: 768px) {
  .accessory-image-wrap {
  height: 220px;
}

.accessory-name {
  font-size: 1.05rem;
}

  .section-more-btn {
  min-width: 180px;
  height: 44px;
  font-size: 0.92rem;
}
  .hero-slide {
    min-height: 440px;
  }

  .hero-heading {
    font-size: 1.6rem;
    line-height: 1.4;
  }

  .hero-desc {
    font-size: 0.9rem;
    line-height: 1.65;
  }

  .hero-content {
    text-align: center !important;
  }

  .hero-action-group,
  .hero-tabs {
    justify-content: center !important;
  }

  .hero-main-btn,
  .hero-sub-btn {
    min-width: 160px;
    height: 44px;
    font-size: 0.88rem;
  }

  .hero-tab-btn {
    min-width: 135px;
    height: 40px;
    font-size: 0.8rem;
  }

  .hero-nav {
    width: 40px;
    height: 40px;
  }

  .hero-nav.prev {
    left: 12px;
  }

  .hero-nav.next {
    right: 12px;
  }

  .intro-section {
    padding-top: 42px;
  }

  .intro-section-header {
    gap: 10px;
  }

  .intro-line {
    max-width: 60px;
  }

  .intro-title {
    font-size: 1.3rem;
  }

  .intro-card-inner {
    padding: 24px 20px;
  }

  .intro-card-title {
    font-size: 1.12rem;
  }

  .intro-text {
    font-size: 0.95rem;
  }

  .intro-image-wrap,
  .intro-image {
    min-height: 260px;
  }

  .intro-image-badge {
    left: 26px;
    bottom: 26px;
    font-size: 0.82rem;
    padding: 8px 14px;
  }

  .breed-simple-image-wrap,
  .featured-dog-image-wrap {
    height: 260px;
  }

  .breed-simple-name,
  .featured-dog-name {
    font-size: 1.12rem;
  }

.section-more {
  display: flex;
  justify-content: center;
}

/* XEM NHIỀU HƠN BUTTON */
.section-more-btn {
  min-width: 220px;
  height: 50px;
  padding: 0 26px;
  border-radius: 999px;
  background: white;
  color: #6f42a4;
  border: 1px solid #d9c5ef;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1rem;
  letter-spacing: 0.2px;
  transition: all 0.25s ease;
  box-shadow: 0 8px 18px rgba(75, 31, 115, 0.08);
}

.section-more-btn:hover {
  background: #6f42a4;
  color: white;
  text-decoration: none;
  border-color: #6f42a4;
  transform: translateY(-2px);
}


}
</style>