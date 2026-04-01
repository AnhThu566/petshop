<template>
  <div class="home-page">
    <!-- HERO -->
    <section class="hero-section">
      <div class="container custom-container">
        <div class="row align-items-center min-vh-75 py-5">
          <div class="col-lg-6 mb-4 mb-lg-0">
            <span class="section-chip mb-3 d-inline-block">
              <i class="fas fa-paw mr-2"></i>PetShop - Chó cảnh có nguồn gốc
            </span>

            <h1 class="hero-title font-weight-bold mb-3">
              Đón một bé cún khỏe mạnh, rõ nguồn gốc và đáng tin cậy
            </h1>

            <p class="hero-desc mb-4">
              Xem hồ sơ từng bé, tình trạng sức khỏe, lịch sử chăm sóc và thực hiện
              đặt cọc an toàn ngay trên hệ thống.
            </p>

            <div class="d-flex flex-wrap">
              <button class="btn btn-main mr-3 mb-3" @click="scrollToSection('dog-section')">
                <i class="fas fa-paw mr-2"></i>Xem các bé cún
              </button>

              <router-link to="/services" class="btn btn-sub mb-3">
                <i class="fas fa-concierge-bell mr-2"></i>Xem dịch vụ
              </router-link>
            </div>
          </div>

          <div class="col-lg-6">
            <div class="hero-image-box shadow-sm">
              <img :src="heroDogImage" class="img-fluid w-100 hero-image" alt="hero dog" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ABOUT -->
    <section class="about-section py-5">
      <div class="container custom-container">
        <div class="row align-items-center">
          <div class="col-lg-6 mb-4 mb-lg-0">
            <div class="about-image-box shadow-sm">
              <img :src="aboutImage" class="img-fluid w-100 about-image" alt="about" />
            </div>
          </div>

          <div class="col-lg-6">
            <div class="section-label mb-2">GIỚI THIỆU</div>
            <h2 class="section-title-main mb-3">
              Hệ thống bán chó cảnh kết hợp phụ kiện và dịch vụ chăm sóc
            </h2>

            <p class="text-muted mb-3">
              Website hỗ trợ các trang trại đăng bán chó cảnh có nguồn gốc rõ ràng,
              hiển thị minh bạch tình trạng sức khỏe, lịch sử vaccine và trạng thái giao dịch.
            </p>

            <p class="text-muted mb-4">
              Khách hàng có thể xem chi tiết từng bé, đặt cọc, mua phụ kiện
              và đặt lịch dịch vụ chăm sóc ngay trên cùng một hệ thống.
            </p>

            <div class="row">
              <div class="col-sm-6 mb-3" v-for="item in highlights" :key="item.title">
                <div class="highlight-card h-100">
                  <div class="highlight-icon mb-2">
                    <i :class="item.icon"></i>
                  </div>
                  <h6 class="font-weight-bold mb-1 text-dark">{{ item.title }}</h6>
                  <p class="small text-muted mb-0">{{ item.desc }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- BREEDS -->
    <section id="breed-section" class="breed-section pb-5">
      <div class="container custom-container">
        <div class="text-center mb-4">
          <div class="section-label mb-2">GIỐNG CHÓ</div>
          <h3 class="section-title-sub mb-2">CÁC GIỐNG CHÓ NỔI BẬT</h3>
          <p class="text-muted mb-0">Một số giống chó đang có trong hệ thống</p>
        </div>

        <div class="row" v-if="displayBreeds.length > 0">
          <div class="col-lg-3 col-md-4 col-sm-6 mb-4" v-for="breed in displayBreeds" :key="breed.id">
            <div class="breed-card shadow-sm h-100">
              <div class="breed-image-wrap">
                <img :src="breed.image" class="img-fluid w-100 breed-image" :alt="breed.name" />
              </div>
              <div class="p-3 text-center">
                <h5 class="font-weight-bold text-dark mb-2">{{ breed.name }}</h5>
                <p class="small text-muted mb-3">{{ breed.desc }}</p>
                <button class="btn btn-outline-primary btn-sm rounded-pill px-3" @click="scrollToSection('dog-section')">
                  Xem các bé
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-box text-center py-5">
          <i class="fas fa-dog fa-3x text-muted mb-3 opacity-50"></i>
          <h5 class="text-muted">Chưa có dữ liệu giống chó để hiển thị.</h5>
        </div>
      </div>
    </section>

    <!-- DOGS -->
    <section id="dog-section" class="dogs-section pb-5">
      <div class="container custom-container">
        <div class="text-center mb-4">
          <div class="section-label mb-2">CÁC BÉ CÚN</div>
          <h3 class="section-title-sub mb-2">CÁC BÉ CÚN SẴN SÀNG VỀ NHÀ MỚI</h3>
          <p class="text-muted mb-0">Hiện có {{ availableDogs.length }} bé đang hiển thị công khai</p>
        </div>

        <div class="dog-grid" v-if="availableDogs.length > 0">
          <div v-for="dog in availableDogs" :key="dog.id || dog._id" class="pet-card-wrapper">
            <div class="pet-card shadow-sm bg-white" @click="viewDetail(dog.id || dog._id)">
              <div class="pet-image-container">
                <img
                  :src="dog.image ? 'http://localhost:3000' + dog.image : placeholderDog"
                  class="pet-image"
                  alt="Hình thú cưng"
                />

                <div class="dog-badge">
                  <span class="badge" :class="getDogStatusClass(dog.status)">
                    {{ getDogStatusText(dog.status) }}
                  </span>
                </div>

                <div
                  v-if="['Chờ thanh toán', 'Đã đặt cọc', 'Đang giao'].includes(dog.status)"
                  class="position-absolute d-flex justify-content-center align-items-center w-100 h-100 p-2"
                  style="top: 0; left: 0; background: rgba(255,255,255,0.68); z-index: 15;"
                >
                  <span
                    class="text-warning font-weight-bold border border-warning rounded px-2 py-2 shadow-sm text-center bg-white"
                    style="font-size: 0.95rem; transform: rotate(-10deg); border-width: 3px !important;"
                  >
                    ĐANG GIAO DỊCH
                  </span>
                </div>

                <div
                  v-if="dog.status === 'Đã bán'"
                  class="position-absolute d-flex justify-content-center align-items-center w-100 h-100"
                  style="top: 0; left: 0; background: rgba(0,0,0,0.58); z-index: 15;"
                >
                  <span
                    class="text-white font-weight-bold border border-white rounded px-4 py-2 shadow-lg"
                    style="font-size: 1.1rem; transform: rotate(-12deg); border-width: 4px !important; letter-spacing: 2px;"
                  >
                    ĐÃ BÁN
                  </span>
                </div>

                <div class="image-overlay" :style="dog.status !== 'Đã duyệt' ? 'z-index:20;' : ''">
                  <button
                    class="btn font-weight-bold rounded-pill px-4 shadow-sm"
                    :class="dog.status !== 'Đã duyệt' ? 'btn-light text-dark border' : 'btn-warning'"
                  >
                    {{ dog.status === 'Đã bán' ? 'XEM LẠI BÉ' : 'XEM CHI TIẾT' }}
                  </button>
                </div>
              </div>

              <div class="pet-info p-3 border-top text-center">
                <h5 class="pet-name font-weight-bold text-dark text-truncate mb-2" :title="dog.name">
                  {{ dog.name }}
                </h5>

                <div class="small text-muted mb-1">
                  <i class="fas fa-dna mr-1"></i>{{ dog.breedId?.name || "Đang cập nhật giống" }}
                </div>

                <div class="small text-muted mb-1">
                  <i class="fas fa-heartbeat mr-1 text-success"></i>{{ dog.healthStatus || "Đang cập nhật sức khỏe" }}
                </div>

                <div class="small text-muted mb-2">
                  <i class="fas fa-map-marker-alt mr-1"></i>{{ dog.farmId?.name || "Trang trại" }}
                </div>

                <div class="pet-price font-weight-bold text-danger mt-2">
                  {{ dog.price?.toLocaleString("vi-VN") }}
                  <span class="small text-muted">VNĐ</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-5 empty-box">
          <i class="fas fa-box-open fa-4x text-muted mb-3 opacity-50"></i>
          <h5 class="text-muted">Hiện tại không có bé cún nào để hiển thị.</h5>
        </div>
      </div>
    </section>

    <!-- ACCESSORIES + SERVICES -->
    <section class="feature-section pb-5">
      <div class="container custom-container">
        <div class="row">
          <div class="col-lg-6 mb-4">
            <div class="feature-card shadow-sm h-100">
              <div class="feature-image-wrap">
                <img :src="accessoryImage" alt="accessory" class="feature-image" />
              </div>
              <div class="p-4">
                <div class="section-label mb-2">PHỤ KIỆN</div>
                <h4 class="font-weight-bold text-dark mb-3">
                  Chuẩn bị đầy đủ đồ dùng cho bé ngay sau khi đón về
                </h4>
                <p class="text-muted mb-4">
                  Mua sắm phụ kiện cần thiết như dây dắt, bát ăn, đồ chơi
                  và các vật dụng chăm sóc hằng ngày.
                </p>
                <router-link to="/accessories" class="btn btn-outline-primary font-weight-bold px-4">
                  <i class="fas fa-shopping-bag mr-2"></i>Xem phụ kiện
                </router-link>
              </div>
            </div>
          </div>

          <div class="col-lg-6 mb-4">
            <div class="feature-card shadow-sm h-100">
              <div class="feature-image-wrap">
                <img :src="serviceImage" alt="service" class="feature-image" />
              </div>
              <div class="p-4">
                <div class="section-label mb-2">DỊCH VỤ</div>
                <h4 class="font-weight-bold text-dark mb-3">
                  Đặt lịch dịch vụ chăm sóc thú cưng dễ dàng
                </h4>
                <p class="text-muted mb-4">
                  Khách hàng có thể đặt lịch dịch vụ, theo dõi trạng thái xử lý
                  và chăm sóc bé tiện lợi hơn ngay trên hệ thống.
                </p>
                <router-link to="/services" class="btn btn-outline-success font-weight-bold px-4">
                  <i class="fas fa-calendar-check mr-2"></i>Xem dịch vụ
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import DogService from "@/services/dog.service";

export default {
  data() {
    return {
      allDogs: [],
      placeholderDog: "https://via.placeholder.com/300",
      aboutImage:
        "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=1200&q=80",
      accessoryImage:
        "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=1200&q=80",
      serviceImage:
        "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=1200&q=80",
      highlights: [
        {
          icon: "fas fa-warehouse",
          title: "Nguồn gốc rõ ràng",
          desc: "Mỗi bé cún được liên kết với trang trại trước khi công khai.",
        },
        {
          icon: "fas fa-heartbeat",
          title: "Sức khỏe minh bạch",
          desc: "Hiển thị tình trạng sức khỏe và lịch sử chăm sóc cơ bản.",
        },
        {
          icon: "fas fa-hand-holding-usd",
          title: "Đặt cọc an toàn",
          desc: "Quy trình đặt cọc rõ ràng, có admin xác nhận trước khi giao dịch.",
        },
        {
          icon: "fas fa-concierge-bell",
          title: "Phụ kiện & dịch vụ",
          desc: "Tích hợp thêm phụ kiện và dịch vụ ngay trên cùng hệ thống.",
        },
      ],
    };
  },

  computed: {
    availableDogs() {
      const showStatus = ["Đã duyệt", "Chờ thanh toán", "Đã đặt cọc", "Đang giao", "Đã bán"];
      return this.allDogs.filter((dog) => showStatus.includes(dog.status));
    },

    displayBreeds() {
      const breedMap = new Map();

      this.availableDogs.forEach((dog) => {
        const breed = dog.breedId;
        if (!breed) return;

        const id = breed._id || breed.id || breed.name;
        if (!breedMap.has(id)) {
          breedMap.set(id, {
            id,
            name: breed.name || "Giống chó",
            image: dog.image ? "http://localhost:3000" + dog.image : this.placeholderDog,
            desc: `Những bé cún thuộc giống ${breed.name || "này"} đang có trong hệ thống.`,
          });
        }
      });

      return Array.from(breedMap.values()).slice(0, 8);
    },

    heroDogImage() {
      const firstDog = this.availableDogs[0];
      if (firstDog?.image) return "http://localhost:3000" + firstDog.image;
      return this.placeholderDog;
    },
  },

  async created() {
    await this.fetchDogs();
  },

  methods: {
    async fetchDogs() {
      try {
        this.allDogs = await DogService.getPublic();
      } catch (error) {
        console.error("Lỗi lấy danh sách chó:", error);
      }
    },

    viewDetail(id) {
      this.$router.push({ name: "DogDetail", params: { id } });
    },

    scrollToSection(sectionId) {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    },

    scrollToDogs() {
      this.scrollToSection("dog-section");
    },

    getDogStatusText(status) {
      if (status === "Đã duyệt") return "Sẵn sàng đặt cọc";
      if (status === "Chờ thanh toán") return "Chờ xác nhận cọc";
      if (status === "Đã đặt cọc") return "Đã có khách đặt";
      if (status === "Đang giao") return "Đang bàn giao";
      if (status === "Đã bán") return "Đã bán";
      return status || "---";
    },

    getDogStatusClass(status) {
      if (status === "Đã duyệt") return "badge-success";
      if (status === "Chờ thanh toán") return "badge-warning text-dark";
      if (status === "Đã đặt cọc") return "badge-primary";
      if (status === "Đang giao") return "badge-info text-dark";
      if (status === "Đã bán") return "badge-dark";
      return "badge-light border";
    },
  },
};
</script>

<style scoped>
.home-page {
  background: linear-gradient(180deg, #fcf9ff 0%, #ffffff 100%);
  min-height: 100vh;
}

@media (min-width: 1200px) {
  .custom-container {
    max-width: 1240px !important;
  }
}

.min-vh-75 {
  min-height: 75vh;
}

.hero-section {
  padding: 24px 0 10px;
}

.section-chip {
  padding: 9px 16px;
  border-radius: 999px;
  background: #f4ebf8;
  color: #6a1b9a;
  font-size: 0.85rem;
  font-weight: 700;
  border: 1px solid #eadcf5;
}

.hero-title {
  color: #2f2438;
  font-size: 2.7rem;
  line-height: 1.25;
}

.hero-desc {
  color: #6f647d;
  font-size: 1.02rem;
  max-width: 560px;
  line-height: 1.8;
}

.btn-main {
  height: 50px;
  border-radius: 16px;
  border: none;
  color: white;
  font-weight: 700;
  padding: 0 24px;
  background: linear-gradient(145deg, #6a1b9a, #4a148c);
}

.btn-main:hover {
  color: white;
  transform: translateY(-2px);
}

.btn-sub {
  height: 50px;
  border-radius: 16px;
  border: 1px solid #d8c3ea;
  color: #6a1b9a;
  font-weight: 700;
  padding: 0 24px;
  display: inline-flex;
  align-items: center;
  background: #fff;
}

.btn-sub:hover {
  background: #f4ebf8;
  color: #4a148c;
  text-decoration: none;
}

.hero-image-box,
.about-image-box {
  border-radius: 22px;
  overflow: hidden;
  background: white;
  border: 1px solid #eee;
}

.hero-image,
.about-image {
  height: 460px;
  object-fit: cover;
}

.section-label {
  color: #6a1b9a;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.section-title-main {
  color: #2f2438;
  font-weight: 800;
  line-height: 1.3;
}

.section-title-sub {
  color: #6a1b9a;
  font-weight: 800;
  text-transform: uppercase;
}

.highlight-card {
  background: white;
  border: 1px solid #ece3f5;
  border-radius: 16px;
  padding: 18px;
}

.highlight-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #f4ebf8;
  color: #6a1b9a;
  display: flex;
  align-items: center;
  justify-content: center;
}

.breed-card,
.feature-card,
.pet-card {
  border-radius: 18px;
  overflow: hidden;
  background: white;
  border: 1px solid #eee;
}

.breed-image,
.feature-image {
  width: 100%;
  height: 260px;
  object-fit: cover;
}

.dog-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.2rem;
}

.pet-card {
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.pet-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(106, 27, 154, 0.12) !important;
  border-color: #d1c4e9;
}

.pet-image-container {
  position: relative;
  width: 100%;
  padding-top: 100%;
  overflow: hidden;
}

.pet-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.pet-card:hover .pet-image {
  transform: scale(1.08);
}

.dog-badge {
  position: absolute;
  top: 14px;
  left: 14px;
  z-index: 18;
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.pet-card:hover .image-overlay {
  opacity: 1;
}

.pet-name {
  font-size: 1.05rem;
}

.pet-price {
  font-size: 1.08rem;
}

.empty-box {
  background: white;
  border-radius: 16px;
  border: 1px solid #eee;
}

@media (max-width: 1200px) {
  .dog-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 992px) {
  .hero-title {
    font-size: 2.2rem;
  }

  .hero-image,
  .about-image,
  .breed-image,
  .feature-image {
    height: 360px;
  }

  .dog-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 1.8rem;
  }

  .hero-desc {
    font-size: 0.96rem;
  }

  .hero-image,
  .about-image,
  .breed-image,
  .feature-image {
    height: 240px;
  }

  .dog-grid {
    grid-template-columns: repeat(1, 1fr);
  }
}
</style>