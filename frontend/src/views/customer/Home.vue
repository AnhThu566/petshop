<template>
  <div class="home-page">
    <!-- HERO -->
    <section class="hero-banner">
      <div
        class="hero-slide"
        :style="{
          backgroundImage: `linear-gradient(90deg, rgba(34, 16, 58, 0.84) 0%, rgba(58, 30, 92, 0.54) 42%, rgba(18, 12, 28, 0.12) 100%), url('${heroSlides[currentSlide].image}')`
        }"
      >
        <div class="hero-overlay"></div>

        <div class="container custom-container h-100 position-relative z-index-2">
          <div class="row align-items-center h-100">
            <div class="col-xl-7 col-lg-8 col-md-10">
              <div class="hero-content text-left" :key="currentSlide">
                <span class="hero-label mb-3 d-inline-flex align-items-center">
                  <i class="fas fa-paw mr-2"></i>
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
                    Dễ theo dõi
                  </div>
                  <div class="hero-benefit-chip">
                    <i class="fas fa-shield-heart mr-2"></i>
                    Minh bạch hơn
                  </div>
                </div>

                <div class="hero-action-group justify-content-start">
                  <router-link
                    :to="heroSlides[currentSlide].primaryLink"
                    class="hero-main-btn shadow-lg"
                  >
                    {{ heroSlides[currentSlide].primaryText }}
                    <i class="fas fa-arrow-right ml-2" style="font-size: 0.9em;"></i>
                  </router-link>
                </div>

                <div class="hero-tabs justify-content-start mt-4">
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
              <p>Tìm bé theo giống và trạng thái mở bán trên cùng hệ thống.</p>
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
          <h2 class="section-title intro-main-title">
            Nơi mua chó cảnh, phụ kiện và dịch vụ chăm sóc
          </h2>
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
                  PetShop giúp khách hàng lựa chọn chó cảnh với <strong>thông tin rõ ràng</strong>,
                  minh bạch hơn và thuận tiện hơn trước khi đặt giữ bé.
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
              class="home-unified-card d-block text-decoration-none"
            >
              <div class="home-unified-image-wrap">
                <img
                  v-if="dog.image"
                  :src="toImageUrl(dog.image)"
                  :alt="dog.name"
                  class="home-unified-image"
                />

                <div v-else class="home-unified-no-image">
                  <i class="fas fa-dog mb-2"></i>
                  <span>Chưa có ảnh</span>
                </div>

                <span
                  class="home-top-badge home-top-badge-left"
                  :class="getDogBadgeClass(dog)"
                >
                  {{ getDogBadgeText(dog) }}
                </span>
              </div>

<div class="home-unified-body">
  <h4 class="home-unified-name mb-2">{{ dog.name }}</h4>

  <div
    v-if="dog.finalPrice || dog.price"
    class="home-unified-price"
  >
    {{ formatCurrency(dog.finalPrice || dog.price) }}
  </div>
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
            <div class="accessory-card">
              <div class="accessory-image-wrap" @click="goToAccessoryDetail(item)">
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

                <span
                  class="mini-stock-badge"
                  :class="getAccessoryStockBadgeClass(item)"
                >
                  {{ getAccessoryStockBadgeText(item) }}
                </span>

                <span v-if="item.hasPromotion" class="mini-discount-badge">
                  {{ item.discountLabel }}
                </span>
              </div>

              <div class="card-body-custom">
                <h4 class="accessory-name" @click="goToAccessoryDetail(item)">
                  {{ item.name }}
                </h4>

                <div class="price-block">
                  <div v-if="item.hasPromotion" class="old-price">
                    {{ formatCurrency(item.originalPrice || item.price) }}
                  </div>

                  <div class="accessory-price">
                    {{ formatCurrency(item.finalPrice || item.price) }}
                  </div>
                </div>

                <div
                  class="stock-note"
                  :class="getAccessoryStockTextClass(item)"
                >
                  {{ getAccessoryStockText(item) }}
                </div>

                <div class="qty-box">
                  <span class="qty-title">Số lượng</span>

                  <div class="qty-actions">
                    <button
                      type="button"
                      class="qty-btn"
                      @click="decreaseQty(item)"
                      :disabled="!canBuyAccessory(item)"
                    >
                      -
                    </button>

                    <span class="qty-value">{{ getQty(item) }}</span>

                    <button
                      type="button"
                      class="qty-btn"
                      @click="increaseQty(item)"
                      :disabled="!canIncreaseAccessory(item)"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div class="card-actions">
                  <button
                    class="cart-btn"
                    type="button"
                    title="Thêm vào giỏ hàng"
                    @click="addAccessoryToCart(item)"
                    :disabled="!canBuyAccessory(item) || isAddingAccessory(item)"
                  >
                    <i
                      class="fas"
                      :class="isAddingAccessory(item) ? 'fa-spinner fa-spin' : 'fa-shopping-cart'"
                    ></i>
                  </button>

                  <button
                    class="buy-btn"
                    type="button"
                    @click="buyAccessoryNow(item)"
                    :disabled="!canBuyAccessory(item) || isAddingAccessory(item)"
                  >
                    {{ isAddingAccessory(item) ? "Đang xử lý..." : "Mua ngay" }}
                  </button>
                </div>

                <button
                  type="button"
                  class="detail-link-btn"
                  @click="goToAccessoryDetail(item)"
                >
                  Xem chi tiết
                </button>

                <div v-if="!canBuyAccessory(item)" class="sold-out-note">
                  Hết hàng hoặc tạm ngừng bán
                </div>
              </div>
            </div>
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
import CartService from "@/services/cart.service";
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
      quantities: {},
      isAddingMap: {},
      apiBase: "http://localhost:3000",
      heroSlides: [
        {
          label: "Thông tin minh bạch",
          title: "Chọn bé cún phù hợp cho gia đình bạn",
          desc: "Xem thông tin, trạng thái mở bán và lựa chọn bé cún phù hợp trước khi đặt giữ.",
          image: banner1,
          primaryText: "Xem chó cảnh",
          primaryLink: "/dogs/breeds",
          activeTab: "dogs",
        },
        {
          label: "Phụ kiện cần thiết",
          title: "Chuẩn bị đầy đủ cho bé ngay từ những ngày đầu",
          desc: "Lựa chọn phụ kiện phù hợp để chăm sóc thú cưng thuận tiện và đầy đủ hơn.",
          image: banner2,
          primaryText: "Xem phụ kiện",
          primaryLink: "/accessories",
          activeTab: "accessories",
        },
        {
          label: "Chăm sóc thuận tiện",
          title: "Đặt lịch dịch vụ nhanh chóng và dễ theo dõi",
          desc: "Theo dõi quá trình chăm sóc thú cưng dễ dàng hơn trên cùng một hệ thống.",
          image: banner3,
          primaryText: "Xem dịch vụ",
          primaryLink: "/services",
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

    getAccessoryId(item) {
      return item._id || item.id;
    },

    canBuyAccessory(item) {
      return item && item.status === "Đang bán" && Number(item.quantity || 0) > 0;
    },

    canIncreaseAccessory(item) {
      if (!this.canBuyAccessory(item)) return false;
      return this.getQty(item) < Number(item.quantity || 0);
    },

    getQty(item) {
      const id = this.getAccessoryId(item);
      return this.quantities[id] || 1;
    },

    isAddingAccessory(item) {
      const id = this.getAccessoryId(item);
      return !!this.isAddingMap[id];
    },

    increaseQty(item) {
      if (!this.canIncreaseAccessory(item)) return;

      const id = this.getAccessoryId(item);
      const current = this.quantities[id] || 1;
      const stock = Number(item.quantity || 0);
      const next = current + 1 > stock ? stock : current + 1;

      this.quantities = { ...this.quantities, [id]: next };
    },

    decreaseQty(item) {
      const id = this.getAccessoryId(item);
      const current = this.quantities[id] || 1;
      const next = current > 1 ? current - 1 : 1;

      this.quantities = { ...this.quantities, [id]: next };
    },

    getAccessoryStockText(item) {
      const stock = Number(item?.quantity || 0);

      if (item?.status !== "Đang bán") return "Tạm ngừng bán";
      if (stock <= 0) return "Hết hàng";
      if (stock <= 5) return `Sắp hết hàng • Còn ${stock} sản phẩm`;
      return `Còn ${stock} sản phẩm`;
    },

    getAccessoryStockTextClass(item) {
      const stock = Number(item?.quantity || 0);

      if (item?.status !== "Đang bán") return "stock-off";
      if (stock <= 0) return "stock-out";
      if (stock <= 5) return "stock-low";
      return "stock-available";
    },

    getAccessoryStockBadgeText(item) {
      const stock = Number(item?.quantity || 0);

      if (item?.status !== "Đang bán") return "Ngừng bán";
      if (stock <= 0) return "Hết hàng";
      if (stock <= 5) return "Sắp hết";
      return "Còn hàng";
    },

    getAccessoryStockBadgeClass(item) {
      const stock = Number(item?.quantity || 0);

      if (item?.status !== "Đang bán") return "badge-off";
      if (stock <= 0) return "badge-out";
      if (stock <= 5) return "badge-low";
      return "badge-available";
    },

    async addAccessoryToCart(item) {
      if (!item) return;

      const accessoryId = this.getAccessoryId(item);
      if (!accessoryId) {
        alert("Phụ kiện này chưa có ID hợp lệ.");
        return;
      }

      if (!this.canBuyAccessory(item)) {
        alert("Phụ kiện này hiện không còn bán hoặc đã hết hàng.");
        return;
      }

      const qty = this.getQty(item);
      if (!qty || qty < 1) {
        alert("Số lượng không hợp lệ.");
        return;
      }

      const user = JSON.parse(localStorage.getItem("user") || "null");
      if (!user) {
        alert("Vui lòng đăng nhập để thêm phụ kiện vào giỏ hàng.");
        this.$router.push("/login");
        return;
      }

      this.isAddingMap = { ...this.isAddingMap, [accessoryId]: true };

      try {
        await CartService.addToCart(accessoryId, Number(qty));
        window.dispatchEvent(new Event("cart-updated"));
        alert("Đã thêm phụ kiện vào giỏ hàng.");
      } catch (error) {
        alert(error.response?.data?.message || "Không thể thêm vào giỏ hàng.");
      } finally {
        this.isAddingMap = { ...this.isAddingMap, [accessoryId]: false };
      }
    },

    buyAccessoryNow(item) {
      if (!item) return;

      const user = JSON.parse(localStorage.getItem("user") || "null");
      if (!user) {
        alert("Vui lòng đăng nhập để mua phụ kiện.");
        this.$router.push("/login");
        return;
      }

      if (!this.canBuyAccessory(item)) {
        alert("Phụ kiện này hiện không còn bán hoặc đã hết hàng.");
        return;
      }

      const qty = this.getQty(item);
      const stock = Number(item.quantity || 0);

      if (!qty || qty < 1) {
        alert("Số lượng không hợp lệ.");
        return;
      }

      if (qty > stock) {
        alert(`Số lượng vượt quá tồn kho. Chỉ còn ${stock} sản phẩm.`);
        return;
      }

      const buyNowItem = {
        id: `buy-now-${this.getAccessoryId(item)}`,
        accessoryId: this.getAccessoryId(item),
        name: item.name || "",
        price: Number(item.finalPrice || item.price || 0),
        originalPriceAtDisplay: Number(item.price || 0),
        isPromotionApplied:
          Number(item.finalPrice || item.price || 0) < Number(item.price || 0),
        image: item.image || "",
        stock: Number(item.quantity || 0),
        status: item.status || "",
        quantity: Number(qty || 1),
      };

      sessionStorage.setItem("buy_now_checkout", JSON.stringify([buyNowItem]));
      this.$router.push({ path: "/accessory-checkout", query: { mode: "buy-now" } });
    },

    goToAccessoryDetail(item) {
      const id = this.getAccessoryId(item);
      if (!id) {
        alert("Phụ kiện này chưa có ID hợp lệ.");
        return;
      }
      this.$router.push(`/accessories/${id}`);
    },

    getDogBadgeText(dog) {
      const status = dog?.saleStatus || "";

      if (status === "Sẵn sàng bán") return "Sẵn sàng bán";
      if (["Chờ thanh toán", "Đã đặt cọc", "Đang giao"].includes(status)) {
        return "Đã có người đặt";
      }
      if (status === "Đã bán") return "Đã bán";
      if (status === "Ngừng bán") return "Ngừng bán";
      return "Sẵn sàng bán";
    },

    getDogBadgeClass(dog) {
      const status = dog?.saleStatus || "";

      if (status === "Đã bán") return "home-danger-badge";
      if (["Chờ thanh toán", "Đã đặt cọc", "Đang giao"].includes(status)) {
        return "home-warning-badge";
      }
      return "home-success-badge";
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
  min-height: 560px;
  overflow: hidden;
  background-size: cover;
  background-position: center 35%;
  transition: background-image 0.8s ease-in-out;
  border-radius: 0 0 34px 34px;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 18% 28%, rgba(255, 210, 112, 0.12), transparent 24%),
    radial-gradient(circle at 78% 18%, rgba(255, 255, 255, 0.06), transparent 22%),
    linear-gradient(180deg, rgba(22, 14, 36, 0.08) 0%, rgba(22, 14, 36, 0.18) 100%);
  z-index: 1;
}

.hero-content {
  color: white;
  padding: 42px 0;
  animation: slideInLeft 0.7s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
}

.text-left {
  text-align: left !important;
}

.glass-effect {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.hero-label {
  padding: 8px 16px;
  border-radius: 999px;
  color: #fff;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.4px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.hero-heading {
  font-size: 2.45rem;
  line-height: 1.28;
  color: white;
  letter-spacing: 0.15px;
  text-shadow: 0 4px 18px rgba(0, 0, 0, 0.42);
  max-width: 720px;
}

.hero-desc {
  font-size: 0.98rem;
  line-height: 1.75;
  color: rgba(255, 255, 255, 0.95);
  max-width: 590px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.32);
}

.hero-benefits {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.hero-benefit-chip {
  min-height: 36px;
  padding: 0 13px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 0.82rem;
  font-weight: 700;
  border: 1px solid rgba(255, 255, 255, 0.14);
}

.hero-action-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 4px;
}

.hero-main-btn,
.hero-sub-btn {
  min-width: 176px;
  height: 46px;
  padding: 0 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  font-weight: 800;
  font-size: 0.92rem;
  transition: all 0.3s ease;
  border-radius: 999px;
  letter-spacing: 0.15px;
}

.hero-main-btn {
  background: linear-gradient(135deg, #ffd972, #ffbe33);
  color: #31114d;
  border: none;
}

.hero-main-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 28px rgba(255, 190, 51, 0.32) !important;
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
  gap: 10px;
  flex-wrap: wrap;
}

.hero-tab-btn {
  min-width: 132px;
  height: 40px;
  padding: 0 18px;
  border-radius: 999px;
  color: rgba(255, 255, 255, 0.9);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  font-weight: 800;
  font-size: 0.8rem;
  letter-spacing: 0.3px;
  transition: all 0.3s ease;
}

.hero-tab-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  text-decoration: none;
}

.hero-tab-btn.active {
  background: white;
  color: #4b1f73;
  border-color: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.16);
}

.hero-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  color: white;
  z-index: 5;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  cursor: pointer;
  border: none;
}

.hero-nav:hover {
  background: rgba(255, 255, 255, 0.24);
  transform: translateY(-50%) scale(1.05);
}

.hero-nav.prev {
  left: 24px;
}

.hero-nav.next {
  right: 24px;
}

.hero-dots {
  position: absolute;
  left: 50%;
  bottom: 22px;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 5;
  background: rgba(0, 0, 0, 0.16);
  padding: 8px 12px;
  border-radius: 999px;
  backdrop-filter: blur(4px);
}

.hero-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.38);
  cursor: pointer;
  transition: all 0.3s ease;
}

.hero-dot.active {
  background: #ffd972;
  width: 26px;
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
  text-align: center;
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

.intro-main-title {
  position: relative;
  display: inline-block;
  white-space: nowrap;
  padding-bottom: 16px;
}

.intro-main-title::after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: 120px;
  height: 4px;
  border-radius: 999px;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
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
  text-align: center;
}

.breed-simple-name {
  color: #5a2d91;
  font-size: 1.18rem;
  font-weight: 800;
  line-height: 1.35;
  text-align: center;
}

/* FEATURED DOG */
.featured-dog-section {
  padding: 58px 0 62px;
  background: linear-gradient(180deg, #f7f1fd 0%, #f2e9fb 100%);
}

.home-unified-card {
  background: #ffffff;
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid #eadcf6;
  box-shadow: 0 14px 28px rgba(75, 31, 115, 0.07);
  transition: all 0.28s ease;
}

.home-unified-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 38px rgba(75, 31, 115, 0.12);
}

.home-unified-image-wrap {
  position: relative;
  width: 100%;
  height: 280px;
  overflow: hidden;
  background: linear-gradient(180deg, #f8f2fc 0%, #f3ebfb 100%);
}

.home-unified-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.35s ease;
}

.home-unified-card:hover .home-unified-image {
  transform: scale(1.05);
}

.home-unified-no-image {
  color: #8d77a7;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 0.95rem;
}

.home-unified-no-image i {
  font-size: 2rem;
}

.home-top-badge {
  position: absolute;
  top: 12px;
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 11px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 800;
  z-index: 2;
  box-shadow: 0 8px 16px rgba(15, 23, 42, 0.1);
}

.home-top-badge-left {
  left: 12px;
}

.home-success-badge {
  background: rgba(22, 163, 74, 0.94);
  color: #fff;
}

.home-warning-badge {
  background: rgba(217, 119, 6, 0.95);
  color: #fff;
}

.home-danger-badge {
  background: rgba(185, 28, 28, 0.95);
  color: #fff;
}

.home-unified-body {
  padding: 18px 18px 20px;
  text-align: center;
  min-height: 108px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.home-unified-name {
  color: #432366;
  font-size: 1.05rem;
  font-weight: 800;
  line-height: 1.45;
  margin-bottom: 6px;
  text-align: center;
}

.home-unified-price {
  color: #6b4ca1;
  font-size: 1.04rem;
  font-weight: 900;
  line-height: 1.35;
  text-align: center;
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
  background: #ffffff;
  border: 1px solid #eee2f7;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 12px 24px rgba(106, 27, 154, 0.06);
  transition: all 0.25s ease;
  min-height: 420px;
  display: flex;
  flex-direction: column;
}

.accessory-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 18px 32px rgba(106, 27, 154, 0.12);
}

.accessory-image-wrap {
  position: relative;
  height: 215px;
  background: #f7f1fd;
  overflow: hidden;
  cursor: pointer;
}

.accessory-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.25s ease;
}

.accessory-card:hover .accessory-image {
  transform: scale(1.04);
}

.mini-stock-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  display: inline-flex;
  align-items: center;
  padding: 6px 11px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 800;
  z-index: 2;
  box-shadow: 0 8px 16px rgba(15, 23, 42, 0.08);
}

.badge-available {
  background: rgba(22, 163, 74, 0.92);
  color: #fff;
}

.badge-low {
  background: rgba(217, 119, 6, 0.95);
  color: #fff;
}

.badge-out,
.badge-off {
  background: rgba(185, 28, 28, 0.94);
  color: #fff;
}

.mini-discount-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  display: inline-flex;
  align-items: center;
  padding: 6px 11px;
  border-radius: 999px;
  color: #fff;
  font-size: 0.73rem;
  font-weight: 800;
  box-shadow: 0 8px 16px rgba(220, 38, 38, 0.18);
  z-index: 2;
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.card-body-custom {
  padding: 10px 14px 14px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.accessory-name {
  color: #2f1b44;
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.32;
  margin-bottom: 4px;
  text-align: center;
  cursor: pointer;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 32px;
}

.accessory-name:hover {
  color: #6a1b9a;
}

.price-block {
  text-align: center;
  margin-bottom: 6px;
}

.old-price {
  color: #9b90ad;
  font-size: 0.81rem;
  text-decoration: line-through;
  margin-bottom: 1px;
}

.accessory-price {
  color: #b42318;
  font-size: 1.08rem;
  font-weight: 900;
  line-height: 1.2;
}

.stock-note {
  text-align: center;
  font-size: 0.82rem;
  font-weight: 700;
  margin-bottom: 10px;
  min-height: 20px;
}

.stock-available {
  color: #15803d;
}

.stock-low {
  color: #b45309;
}

.stock-out,
.stock-off {
  color: #b42318;
}

.qty-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border: 1px solid #eadcf7;
  border-radius: 14px;
  background: #fcf9ff;
  padding: 8px 10px;
  margin-bottom: 10px;
}

.qty-title {
  color: #7a4db3;
  font-size: 0.84rem;
  font-weight: 700;
}

.qty-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.qty-btn {
  width: 30px;
  height: 30px;
  border: 1px solid #e2d4ef;
  background: #fff;
  color: #6d5d7d;
  border-radius: 9px;
  font-weight: 800;
  transition: all 0.2s ease;
}

.qty-btn:hover:not(:disabled) {
  background: #f4ebfb;
  color: #6a1b9a;
}

.qty-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.qty-value {
  min-width: 22px;
  text-align: center;
  color: #2f1b44;
  font-weight: 800;
  font-size: 0.94rem;
}

.card-actions {
  display: grid;
  grid-template-columns: 50px 1fr;
  gap: 8px;
  margin-top: auto;
}

.cart-btn,
.buy-btn {
  height: 42px;
  border-radius: 12px;
  font-size: 0.92rem;
  font-weight: 800;
  transition: all 0.2s ease;
}

.cart-btn {
  border: 1.5px solid #d7bdea;
  background: #fff;
  color: #8e3fd1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-btn:hover:not(:disabled) {
  background: #f7f1fd;
  border-color: #b88bdf;
}

.buy-btn {
  border: none;
  background: linear-gradient(135deg, #9a4ddd, #7522b2);
  color: #fff;
  box-shadow: 0 10px 18px rgba(117, 34, 178, 0.16);
}

.buy-btn:hover:not(:disabled) {
  filter: brightness(0.98);
}

.cart-btn:disabled,
.buy-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}

.detail-link-btn {
  margin-top: 8px;
  border: none;
  background: transparent;
  color: rgba(123, 47, 192, 0.42);
  font-size: 0.86rem;
  font-weight: 700;
  text-align: center;
  padding: 4px 0 0;
  width: 100%;
  align-self: center;
  transition: all 0.22s ease;
}

.accessory-card:hover .detail-link-btn {
  color: rgba(123, 47, 192, 0.96);
}

.detail-link-btn:hover {
  color: #5f1796;
  text-decoration: underline;
}

.sold-out-note {
  margin-top: 6px;
  color: #b42318;
  font-size: 0.81rem;
  font-weight: 700;
  text-align: center;
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
    min-height: 500px;
    border-radius: 0 0 24px 24px;
  }

  .hero-heading {
    font-size: 2rem;
    max-width: 100%;
  }

  .hero-desc {
    font-size: 0.94rem;
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
}

@media (max-width: 768px) {
  .hero-slide {
    min-height: 460px;
    border-radius: 0 0 18px 18px;
  }

  .hero-heading {
    font-size: 1.58rem;
    line-height: 1.38;
  }

  .hero-desc {
    font-size: 0.9rem;
    line-height: 1.68;
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
    min-width: 154px;
    height: 42px;
    font-size: 0.86rem;
  }

  .hero-tab-btn {
    min-width: 124px;
    height: 38px;
    font-size: 0.77rem;
  }

  .hero-nav {
    width: 38px;
    height: 38px;
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
  .home-unified-image-wrap {
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