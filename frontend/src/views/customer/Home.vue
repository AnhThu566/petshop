<template>
  <div class="home-page">
    <!-- HERO -->
    <section class="hero-banner">
      <div
        class="hero-slide"
        :style="{
          backgroundImage: `linear-gradient(90deg, rgba(34, 16, 58, 0.88) 0%, rgba(58, 30, 92, 0.62) 42%, rgba(18, 12, 28, 0.16) 100%), url('${heroSlides[currentSlide].image}')`
        }"
      >
        <div class="hero-overlay"></div>

        <div class="container custom-container h-100 position-relative z-index-2">
          <div class="row align-items-center h-100">
            <div class="col-xl-7 col-lg-8 col-md-10">
              <div class="hero-content text-left" :key="currentSlide">
                <span class="hero-label mb-3 d-inline-flex align-items-center">
                  <i class="fas fa-shield-heart mr-2"></i>
                  {{ heroSlides[currentSlide].label }}
                </span>

                <h1 class="hero-heading font-weight-bold mb-3">
                  {{ heroSlides[currentSlide].title }}
                </h1>

                <p class="hero-desc mb-4">
                  {{ heroSlides[currentSlide].desc }}
                </p>

                <div class="hero-benefits mb-4">
                  <div class="hero-benefit-chip">
                    <i class="fas fa-check-circle mr-2"></i>
                    Nguồn gốc rõ ràng
                  </div>
                  <div class="hero-benefit-chip">
                    <i class="fas fa-heartbeat mr-2"></i>
                    Sức khỏe minh bạch
                  </div>
                  <div class="hero-benefit-chip">
                    <i class="fas fa-headset mr-2"></i>
                    Hỗ trợ thuận tiện
                  </div>
                </div>

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
                    to="/dogs/breeds"
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

    <!-- TRUST -->
    <section class="trust-section">
      <div class="container custom-container">
        <div class="trust-grid">
          <div class="trust-card">
            <div class="trust-icon">
              <i class="fas fa-file-medical"></i>
            </div>
            <div>
              <h4>Hồ sơ rõ ràng</h4>
              <p>Xem thông tin bé cún và dữ liệu cần thiết trước khi quyết định.</p>
            </div>
          </div>

          <div class="trust-card">
            <div class="trust-icon">
              <i class="fas fa-paw"></i>
            </div>
            <div>
              <h4>Dễ lựa chọn</h4>
              <p>Tìm bé theo giống, nguồn cung và trạng thái mở bán trên cùng hệ thống.</p>
            </div>
          </div>

          <div class="trust-card">
            <div class="trust-icon">
              <i class="fas fa-hand-holding-heart"></i>
            </div>
            <div>
              <h4>Đồng hành sau mua</h4>
              <p>Kết hợp phụ kiện và dịch vụ để chăm sóc bé thuận tiện hơn.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- GIỚI THIỆU -->
    <section class="intro-section">
      <div class="container custom-container">
        <div class="section-heading text-center mb-5">
          <span class="section-kicker">Về PetShop</span>
          <h2 class="section-title">Nơi mua chó cảnh, phụ kiện và dịch vụ chăm sóc</h2>
          <p class="section-desc">
            Trải nghiệm minh bạch, đáng tin cậy và thuận tiện hơn cho người nuôi thú cưng.
          </p>
        </div>

        <div class="row align-items-stretch intro-row">
          <div class="col-lg-6 mb-4 mb-lg-0">
            <div class="intro-card intro-text-card h-100">
              <div class="intro-card-inner">
                <span class="mini-kicker mb-3">Giá trị nổi bật</span>

                <h3 class="intro-card-title mb-3">
                  Chọn bé cún phù hợp với thông tin rõ ràng ngay từ đầu
                </h3>

                <p class="intro-text">
                  PetShop giúp khách hàng lựa chọn chó cảnh với <strong>nguồn cung rõ ràng</strong>,
                  thông tin minh bạch và trải nghiệm theo dõi thuận tiện hơn trước khi đặt giữ bé.
                </p>

                <p class="intro-text">
                  Khách hàng có thể xem bé cún, mua phụ kiện và đặt dịch vụ chăm sóc trên cùng một nền tảng.
                </p>

                <div class="intro-feature-list mt-4">
                  <div class="intro-feature-item">
                    <i class="fas fa-check-circle"></i>
                    <span>Thông tin chó rõ ràng, dễ theo dõi</span>
                  </div>
                  <div class="intro-feature-item">
                    <i class="fas fa-check-circle"></i>
                    <span>Đặt cọc trực tuyến nhanh và thuận tiện</span>
                  </div>
                  <div class="intro-feature-item">
                    <i class="fas fa-check-circle"></i>
                    <span>Kết hợp phụ kiện và dịch vụ sau mua</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-6">
            <div class="intro-card intro-image-card h-100">
              <div class="intro-image-wrap">
                <img :src="introImage" alt="Giới thiệu PetShop" class="intro-image" />
              </div>

              <div class="intro-floating-card">
                <div class="floating-title">Cam kết của hệ thống</div>
                <div class="floating-text">
                  Minh bạch hơn trong lựa chọn chó cảnh và tạo trải nghiệm đáng tin cậy hơn cho khách hàng.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- GIỐNG CHÓ -->
    <section class="breed-section">
      <div class="container custom-container">
        <div class="section-heading text-center mb-5">
          <span class="section-kicker">Khám phá giống chó</span>
          <h2 class="section-title">Các giống chó nổi bật</h2>
          <p class="section-desc">
            Bắt đầu từ giống chó yêu thích để tìm bé phù hợp hơn.
          </p>
        </div>

        <div class="row justify-content-start" v-if="breedList.length > 0">
          <div
            class="col-lg-4 col-md-6 mb-4"
            v-for="breed in breedList"
            :key="breed._id || breed.id"
          >
            <router-link
              :to="`/dogs/breeds/${breed._id || breed.id}`"
              class="breed-simple-card text-decoration-none d-block"
            >
              <div class="breed-simple-image-wrap">
                <img
                  v-if="breed.image"
                  :src="toImageUrl(breed.image)"
                  :alt="breed.name"
                  class="breed-simple-image"
                />
                <div v-else class="breed-simple-no-image">
                  <i class="fas fa-dog mb-2"></i>
                  <span>Chưa có ảnh</span>
                </div>
              </div>

              <div class="breed-simple-body">
                <h4 class="breed-simple-name mb-2">{{ breed.name }}</h4>
              </div>
            </router-link>
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
          <router-link to="/dogs/breeds" class="section-more-btn text-decoration-none">
            Xem nhiều hơn
            <i class="fas fa-arrow-right ml-2"></i>
          </router-link>
        </div>
      </div>
    </section>

    <!-- CÁC BÉ CÚN NỔI BẬT -->
    <section class="featured-dog-section">
      <div class="container custom-container">
        <div class="section-heading text-center mb-5">
          <span class="section-kicker featured-kicker">Bé cún nổi bật</span>
          <h2 class="section-title featured-title">Các bé cún sẵn sàng về nhà mới</h2>
          <p class="section-desc featured-desc">
            Những bé đang được mở bán công khai trên hệ thống.
          </p>
        </div>

        <div class="row" v-if="featuredDogs.length > 0">
          <div
            class="col-lg-3 col-md-6 mb-4"
            v-for="dog in featuredDogs"
            :key="dog._id || dog.id"
          >
            <router-link
              :to="dogDetailLink(dog)"
              class="featured-dog-card simple-dog-card d-block text-decoration-none"
            >
              <div class="featured-dog-image-wrap simple-dog-image-wrap">
                <img
                  v-if="dog.image"
                  :src="toImageUrl(dog.image)"
                  :alt="dog.name"
                  class="featured-dog-image"
                />

                <div v-else class="featured-dog-no-image">
                  <i class="fas fa-dog mb-2"></i>
                  <span>Chưa có ảnh</span>
                </div>
              </div>

              <div class="featured-dog-body simple-dog-body">
                <h4 class="featured-dog-name simple-dog-name mb-2">{{ dog.name }}</h4>

                <p class="featured-dog-price simple-dog-price mb-0">
                  {{ formatCurrency(dog.price) }}
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
          <router-link to="/dogs/breeds" class="section-more-btn text-decoration-none">
            Xem nhiều hơn
            <i class="fas fa-arrow-right ml-2"></i>
          </router-link>
        </div>
      </div>
    </section>

    <!-- KHUYẾN MÃI -->
    <section class="promotion-section" v-if="promotionAccessories.length > 0">
      <div class="container custom-container">
        <div class="section-heading text-center mb-5">
          <span class="section-kicker promo-kicker">Ưu đãi nổi bật</span>
          <h2 class="section-title">Phụ kiện đang khuyến mãi</h2>
          <p class="section-desc">
            Chuẩn bị cho bé đầy đủ hơn với chi phí tốt hơn.
          </p>
        </div>

        <div class="row">
          <div
            class="col-lg-3 col-md-6 mb-4"
            v-for="item in promotionAccessories"
            :key="item._id || item.id"
          >
            <router-link
              :to="`/accessories/${item._id || item.id}`"
              class="promo-accessory-card d-block text-decoration-none"
            >
              <div class="promo-accessory-image-wrap">
                <img
                  v-if="item.image"
                  :src="toImageUrl(item.image)"
                  :alt="item.name"
                  class="promo-accessory-image"
                />
                <div v-else class="accessory-no-image">
                  <i class="fas fa-box-open mb-2"></i>
                  <span>Chưa có ảnh</span>
                </div>

                <span class="promo-discount-badge">
                  {{ item.discountLabel }}
                </span>
              </div>

              <div class="promo-accessory-body">
                <h4 class="promo-accessory-name mb-2">{{ item.name }}</h4>

                <div class="promo-price-block mb-0">
                  <div class="promo-old-price">
                    {{ formatCurrency(item.originalPrice || item.price) }}
                  </div>
                  <div class="promo-new-price">
                    {{ formatCurrency(item.finalPrice || item.price) }}
                  </div>
                  <div class="promo-save-text">
                    Tiết kiệm {{ formatCurrency(item.discountAmount || 0) }}
                  </div>
                </div>
              </div>
            </router-link>
          </div>
        </div>

        <div class="section-more text-center mt-3">
          <router-link to="/accessories" class="section-more-btn text-decoration-none">
            Xem tất cả phụ kiện
            <i class="fas fa-arrow-right ml-2"></i>
          </router-link>
        </div>
      </div>
    </section>

    <!-- PHỤ KIỆN -->
    <section class="accessory-section">
      <div class="container custom-container">
        <div class="section-heading text-center mb-5">
          <span class="section-kicker">Phụ kiện cần thiết</span>
          <h2 class="section-title">Phụ kiện nổi bật cho bé</h2>
          <p class="section-desc">
            Chuẩn bị những vật dụng cần thiết cho môi trường mới của bé.
          </p>
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
                  :src="toImageUrl(item.image)"
                  :alt="item.name"
                  class="accessory-image"
                />
                <div v-else class="accessory-no-image">
                  <i class="fas fa-box-open mb-2"></i>
                  <span>Chưa có ảnh</span>
                </div>

                <span v-if="item.hasPromotion" class="mini-discount-badge">
                  {{ item.discountLabel }}
                </span>
              </div>

              <div class="accessory-body">
                <h4 class="accessory-name mb-2">{{ item.name }}</h4>

                <div v-if="item.hasPromotion" class="home-price-block mb-0">
                  <div class="home-old-price">
                    {{ formatCurrency(item.originalPrice || item.price) }}
                  </div>
                  <div class="accessory-price">
                    {{ formatCurrency(item.finalPrice || item.price) }}
                  </div>
                </div>

                <p v-else class="accessory-price mb-0">
                  {{ formatCurrency(item.price) }}
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
  name: "HomePage",

  data() {
    return {
      currentSlide: 0,
      slideInterval: null,
      introImage,
      breedList: [],
      featuredDogs: [],
      accessoryList: [],
      promotionAccessories: [],
      apiBase: "http://localhost:3000",
      heroSlides: [
        {
          label: "Nguồn gốc minh bạch",
          title: "Chọn bé cún phù hợp cho gia đình bạn",
          desc: "Xem hồ sơ, trạng thái mở bán và thông tin cần thiết trước khi đặt giữ bé.",
          image: banner1,
          primaryText: "Xem chó cảnh",
          primaryLink: "/dogs/breeds",
          secondaryText: "Xem nguồn cung",
          secondaryLink: "/dogs/farms",
          activeTab: "dogs",
        },
        {
          label: "Chuẩn bị đầy đủ",
          title: "Mua sắm phụ kiện cần thiết cho bé",
          desc: "Lựa chọn những vật dụng phù hợp để bé thích nghi tốt hơn trong những ngày đầu.",
          image: banner2,
          primaryText: "Xem phụ kiện",
          primaryLink: "/accessories",
          secondaryText: "Xem chó cảnh",
          secondaryLink: "/dogs/breeds",
          activeTab: "accessories",
        },
        {
          label: "Chăm sóc thuận tiện",
          title: "Đặt lịch dịch vụ nhanh chóng hơn",
          desc: "Theo dõi quá trình chăm sóc thú cưng dễ dàng trên cùng một hệ thống.",
          image: banner3,
          primaryText: "Xem dịch vụ",
          primaryLink: "/services",
          secondaryText: "Lịch sử đơn của tôi",
          secondaryLink: "/tra-cuu-don",
          activeTab: "services",
        },
      ],
    };
  },

  async mounted() {
    this.startSlide();
    await Promise.all([
      this.fetchBreeds(),
      this.fetchFeaturedDogs(),
      this.fetchAccessories(),
    ]);
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
        const list = response || [];

        this.promotionAccessories = list
          .filter((item) => item.hasPromotion)
          .sort((a, b) => Number(b.discountAmount || 0) - Number(a.discountAmount || 0))
          .slice(0, 4);

        this.accessoryList = list.slice(0, 8);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách phụ kiện nổi bật:", error);
        this.accessoryList = [];
        this.promotionAccessories = [];
      }
    },

    dogDetailLink(dog) {
      const id = dog._id || dog.id;
      return `/dog/${id}`;
    },

    toImageUrl(path) {
      if (!path) return "";
      if (String(path).startsWith("http")) return path;
      return `${this.apiBase}${path}`;
    },

    formatCurrency(value) {
      if (value === null || value === undefined || value === "") return "Liên hệ";
      return Number(value).toLocaleString("vi-VN") + " VND";
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
  background:
    radial-gradient(circle at top left, rgba(177, 145, 211, 0.14), transparent 28%),
    linear-gradient(180deg, #fcf9ff 0%, #ffffff 100%);
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
  margin: 0 0 24px;
}

.hero-slide {
  position: relative;
  min-height: 620px;
  overflow: hidden;
  background-size: cover;
  background-position: center 35%;
  transition: background-image 0.8s ease-in-out;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 30%, rgba(255, 210, 112, 0.12), transparent 26%),
    radial-gradient(circle at 78% 20%, rgba(255, 255, 255, 0.08), transparent 24%);
  z-index: 1;
}

.hero-content {
  color: white;
  padding: 52px 0;
  animation: slideInLeft 0.7s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
}

.text-left {
  text-align: left !important;
}

.glass-effect {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.hero-label {
  padding: 9px 18px;
  border-radius: 999px;
  color: #fff;
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.hero-heading {
  font-size: 2.6rem;
  line-height: 1.24;
  color: white;
  letter-spacing: 0.2px;
  text-shadow: 0 4px 22px rgba(0, 0, 0, 0.45);
  max-width: 760px;
}

.hero-desc {
  font-size: 1rem;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.96);
  max-width: 620px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
}

.hero-benefits {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.hero-benefit-chip {
  min-height: 38px;
  padding: 0 14px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  font-size: 0.84rem;
  font-weight: 700;
  border: 1px solid rgba(255, 255, 255, 0.16);
}

.hero-action-group {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.hero-main-btn,
.hero-sub-btn {
  min-width: 190px;
  height: 50px;
  padding: 0 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  font-weight: 800;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  border-radius: 999px;
  letter-spacing: 0.2px;
}

.hero-main-btn {
  background: linear-gradient(135deg, #ffd972, #ffbe33);
  color: #31114d;
  border: none;
}

.hero-main-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 28px rgba(255, 190, 51, 0.38) !important;
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
  color: rgba(255, 255, 255, 0.9);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  font-weight: 800;
  font-size: 0.84rem;
  letter-spacing: 0.35px;
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
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  cursor: pointer;
  border: none;
}

.hero-nav:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-50%) scale(1.06);
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
  bottom: 26px;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 5;
  background: rgba(0, 0, 0, 0.2);
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
  background: #ffd972;
  width: 28px;
  border-radius: 10px;
}

/* TRUST */
.trust-section {
  margin-top: -52px;
  position: relative;
  z-index: 6;
  padding-bottom: 28px;
}

.trust-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.trust-card {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(233, 223, 245, 0.95);
  border-radius: 24px;
  box-shadow: 0 16px 36px rgba(67, 35, 102, 0.08);
  padding: 22px 22px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  backdrop-filter: blur(10px);
}

.trust-icon {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: linear-gradient(135deg, #f3e8ff, #ede9fe);
  color: #6b4ca1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  flex-shrink: 0;
}

.trust-card h4 {
  margin: 0 0 8px;
  color: #2f1b44;
  font-size: 1rem;
  font-weight: 800;
}

.trust-card p {
  margin: 0;
  color: #6b7280;
  line-height: 1.7;
  font-size: 0.92rem;
}

/* SECTION COMMON */
.section-heading {
  max-width: 760px;
  margin-left: auto;
  margin-right: auto;
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

.promo-kicker {
  background: #fee2e2;
  color: #dc2626;
}

.featured-kicker {
  background: #efe5fb;
  color: #6f42a4;
}

.section-title {
  color: #5a2d91;
  font-size: 2.2rem;
  font-weight: 900;
  line-height: 1.3;
  margin-bottom: 12px;
}

.featured-title {
  color: #5a2d91;
}

.section-desc {
  color: #6b7280;
  font-size: 1rem;
  line-height: 1.8;
  margin-bottom: 0;
}

.featured-desc {
  color: #7a6d8f;
}

.mini-kicker {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  background: #ede9fe;
  color: #6b4ca1;
  font-size: 0.8rem;
  font-weight: 800;
}

/* INTRO */
.intro-section {
  padding: 42px 0 26px;
}

.intro-row {
  align-items: stretch;
}

.intro-card {
  height: 100%;
  border-radius: 30px;
  overflow: hidden;
  box-shadow: 0 16px 34px rgba(75, 31, 115, 0.08);
}

.intro-text-card {
  background: linear-gradient(180deg, #faf5ff 0%, #f7f0fd 100%);
  border: 1px solid #eadcf6;
}

.intro-card-inner {
  height: 100%;
  padding: 38px 36px 34px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.intro-card-title {
  color: #31114d;
  font-size: 1.55rem;
  line-height: 1.45;
  font-weight: 900;
}

.intro-text {
  color: #5d4d6f;
  font-size: 1rem;
  line-height: 1.85;
  margin-bottom: 16px;
}

.intro-feature-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.intro-feature-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  color: #4b5563;
  font-weight: 600;
}

.intro-feature-item i {
  color: #16a34a;
  margin-top: 3px;
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
  min-height: 440px;
  border-radius: 24px;
  overflow: hidden;
  background: white;
}

.intro-image {
  width: 100%;
  height: 100%;
  min-height: 440px;
  object-fit: cover;
  display: block;
  transition: transform 0.4s ease;
}

.intro-image-card:hover .intro-image {
  transform: scale(1.04);
}

.intro-floating-card {
  position: absolute;
  right: 36px;
  bottom: 34px;
  width: 280px;
  max-width: calc(100% - 72px);
  padding: 16px 18px;
  border-radius: 20px;
  background: rgba(49, 17, 77, 0.88);
  color: #fff;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(8px);
}

.floating-title {
  font-size: 0.96rem;
  font-weight: 800;
  margin-bottom: 8px;
}

.floating-text {
  font-size: 0.88rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.92);
}

/* CARD CHUNG */
.breed-simple-card,
.featured-dog-card,
.promo-accessory-card,
.accessory-card {
  background: #fff;
  border-radius: 24px;
  overflow: hidden;
  transition: all 0.28s ease;
}

.breed-simple-card:hover,
.featured-dog-card:hover,
.promo-accessory-card:hover,
.accessory-card:hover {
  transform: translateY(-6px);
}

.breed-simple-image-wrap,
.featured-dog-image-wrap,
.promo-accessory-image-wrap,
.accessory-image-wrap {
  width: 100%;
  overflow: hidden;
  background: #f7f2fc;
}

.breed-simple-image,
.featured-dog-image,
.promo-accessory-image,
.accessory-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.35s ease;
}

.breed-simple-card:hover .breed-simple-image,
.featured-dog-card:hover .featured-dog-image,
.promo-accessory-card:hover .promo-accessory-image,
.accessory-card:hover .accessory-image {
  transform: scale(1.05);
}

.breed-simple-no-image,
.featured-dog-no-image,
.accessory-no-image {
  color: #8d77a7;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 0.95rem;
}

.breed-simple-no-image i,
.featured-dog-no-image i,
.accessory-no-image i {
  font-size: 2rem;
}

/* BREED */
.breed-section {
  padding: 34px 0 34px;
}

.breed-simple-card {
  border: 1px solid #eee6f6;
  box-shadow: 0 12px 24px rgba(75, 31, 115, 0.05);
}

.breed-simple-card:hover {
  box-shadow: 0 18px 34px rgba(75, 31, 115, 0.1);
}

.breed-simple-image-wrap {
  height: 360px;
}

.breed-simple-body {
  padding: 18px 18px 20px;
  text-align: left;
}

.breed-simple-name {
  color: #5a2d91;
  font-size: 1.18rem;
  font-weight: 800;
  line-height: 1.35;
}

/* FEATURED DOG */
.featured-dog-section {
  padding: 58px 0 62px;
  background: linear-gradient(180deg, #f7f1fd 0%, #f2e9fb 100%);
}

.featured-dog-card {
  border: 1px solid #eadcf6;
  box-shadow: 0 14px 28px rgba(75, 31, 115, 0.08);
}

.featured-dog-card:hover {
  box-shadow: 0 20px 38px rgba(75, 31, 115, 0.14);
}

.simple-dog-image-wrap {
  height: 320px;
}

.simple-dog-body {
  padding: 14px 16px 18px;
  text-align: left;
}

.simple-dog-name {
  color: #5a2d91;
  font-size: 1.12rem;
  font-weight: 800;
  line-height: 1.4;
  margin-bottom: 8px;
}

.simple-dog-price {
  color: #6f42a4;
  font-size: 1.05rem;
  font-weight: 900;
  line-height: 1.4;
}

/* PROMOTION */
.promotion-section {
  padding: 56px 0 28px;
  background: linear-gradient(180deg, #fff7f7 0%, #ffffff 100%);
}

.promo-accessory-card {
  border: 1px solid #f7d7d7;
  box-shadow: 0 14px 28px rgba(220, 38, 38, 0.06);
}

.promo-accessory-card:hover {
  box-shadow: 0 18px 34px rgba(220, 38, 38, 0.12);
}

.promo-accessory-image-wrap {
  position: relative;
  height: 260px;
  background: #fdf2f2;
}

.promo-accessory-image {
  height: 100%;
}

.promo-discount-badge {
  position: absolute;
  top: 14px;
  right: 14px;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  font-size: 0.78rem;
  font-weight: 800;
  box-shadow: 0 8px 18px rgba(220, 38, 38, 0.24);
}

.promo-accessory-body {
  padding: 18px 18px 20px;
  text-align: left;
}

.promo-accessory-name {
  color: #5a2d91;
  font-size: 1.05rem;
  font-weight: 800;
  line-height: 1.45;
}

.promo-price-block {
  min-height: 64px;
}

.promo-old-price {
  color: #9b90ad;
  font-size: 0.9rem;
  text-decoration: line-through;
  margin-bottom: 3px;
}

.promo-new-price {
  color: #dc2626;
  font-size: 1.08rem;
  font-weight: 900;
  line-height: 1.35;
}

.promo-save-text {
  color: #dc2626;
  font-size: 0.82rem;
  font-weight: 700;
  margin-top: 4px;
}

/* ACCESSORY */
.accessory-section {
  padding: 56px 0 62px;
  background: #fff;
}

.accessory-card {
  border: 1px solid #eee6f6;
  box-shadow: 0 12px 24px rgba(75, 31, 115, 0.05);
}

.accessory-card:hover {
  box-shadow: 0 18px 34px rgba(75, 31, 115, 0.1);
}

.accessory-image-wrap {
  position: relative;
  height: 260px;
}

.accessory-image {
  height: 100%;
}

.mini-discount-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  min-height: 32px;
  padding: 0 11px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: #fff;
  font-size: 0.76rem;
  font-weight: 800;
  box-shadow: 0 8px 16px rgba(220, 38, 38, 0.2);
}

.accessory-body {
  padding: 18px 18px 20px;
  text-align: left;
}

.accessory-name {
  color: #5a2d91;
  font-size: 1.05rem;
  font-weight: 800;
  line-height: 1.45;
}

.home-price-block {
  min-height: 52px;
}

.home-old-price {
  color: #9b90ad;
  font-size: 0.86rem;
  text-decoration: line-through;
  margin-bottom: 2px;
}

.accessory-price {
  color: #6b4ca1;
  font-size: 1.05rem;
  font-weight: 900;
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

.section-more {
  display: flex;
  justify-content: center;
}

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

@media (max-width: 992px) {
  .hero-slide {
    min-height: 560px;
  }

  .hero-heading {
    font-size: 2.1rem;
    max-width: 100%;
  }

  .hero-desc {
    font-size: 0.96rem;
    max-width: 100%;
  }

  .trust-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .section-title {
    font-size: 1.85rem;
  }

  .intro-card-title {
    font-size: 1.28rem;
  }

  .intro-image-wrap,
  .intro-image {
    min-height: 340px;
  }

  .breed-simple-image-wrap {
    height: 280px;
  }

  .simple-dog-image-wrap {
    height: 270px;
  }
}

@media (max-width: 768px) {
  .hero-slide {
    min-height: 500px;
  }

  .hero-heading {
    font-size: 1.65rem;
    line-height: 1.4;
  }

  .hero-desc {
    font-size: 0.92rem;
    line-height: 1.7;
  }

  .hero-content {
    text-align: center !important;
  }

  .hero-action-group,
  .hero-tabs,
  .hero-benefits {
    justify-content: center !important;
  }

  .hero-main-btn,
  .hero-sub-btn {
    min-width: 160px;
    height: 44px;
    font-size: 0.88rem;
  }

  .hero-tab-btn {
    min-width: 128px;
    height: 40px;
    font-size: 0.79rem;
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

  .trust-section {
    margin-top: -36px;
  }

  .trust-grid {
    grid-template-columns: 1fr;
  }

  .section-title {
    font-size: 1.35rem;
  }

  .section-desc {
    font-size: 0.94rem;
  }

  .intro-card-inner {
    padding: 26px 20px;
  }

  .intro-card-title {
    font-size: 1.12rem;
  }

  .intro-text {
    font-size: 0.95rem;
  }

  .intro-image-wrap,
  .intro-image {
    min-height: 270px;
  }

  .intro-floating-card {
    right: 22px;
    bottom: 22px;
    max-width: calc(100% - 44px);
  }

  .breed-simple-image-wrap,
  .simple-dog-image-wrap {
    height: 260px;
  }

  .accessory-image-wrap,
  .promo-accessory-image-wrap {
    height: 220px;
  }

  .section-more-btn {
    min-width: 180px;
    height: 44px;
    font-size: 0.92rem;
  }
}
</style>