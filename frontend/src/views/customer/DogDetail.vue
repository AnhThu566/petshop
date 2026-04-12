<template>
  <div class="dog-detail-page bg-white py-4" style="min-height: 100vh;">
    <div class="container custom-container mb-4">
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb bg-transparent p-0 m-0 small">
          <li class="breadcrumb-item">
            <router-link to="/" class="text-muted text-decoration-none">Trang chủ</router-link>
          </li>
          <li class="breadcrumb-item">
            <router-link to="/dogs" class="text-muted text-decoration-none">Chó cảnh</router-link>
          </li>
          <li class="breadcrumb-item active font-weight-bold text-dark" aria-current="page" v-if="dog">
            {{ dog.name }}
          </li>
        </ol>
      </nav>
    </div>

    <div class="container custom-container" v-if="dog">
      <div class="row align-items-stretch">
        <div class="col-lg-5 mb-4 mb-lg-0 pr-lg-4">
          <div class="main-image-box mb-3 p-1">
            <img
              :src="dogImage"
              class="img-fluid w-100 object-fit-cover rounded"
              alt="Hình thú cưng"
            />
          </div>

          <div class="row px-1">
            <div class="col-4 px-2">
              <img
                :src="dogImage"
                class="img-fluid rounded cursor-pointer img-thumbnail-custom active-thumb"
                alt="Ảnh chính"
              />
            </div>
            <div class="col-4 px-2">
              <img
                :src="dogImage"
                class="img-fluid rounded img-thumbnail-custom"
                alt="Ảnh phụ"
              />
            </div>
            <div class="col-4 px-2">
              <img
                :src="dogImage"
                class="img-fluid rounded img-thumbnail-custom"
                alt="Ảnh phụ"
              />
            </div>
          </div>
        </div>

        <div class="col-lg-7 pl-lg-4 d-flex align-items-center">
          <div class="detail-content w-100">
            <h1 class="pet-title font-weight-bold mb-2">{{ dog.name }}</h1>

            <p class="origin-message text-muted mb-3">
              Bé chó được hệ thống tiếp nhận và quản lý với thông tin nguồn gốc rõ ràng, hồ sơ sức khỏe minh bạch trước khi mở bán.
            </p>

            <div class="source-mini-box mb-3">
              <span class="source-mini-label">Nguồn gốc:</span>
              <strong class="source-mini-name">
                {{
                  dog.sourceVerified
                    ? "Đã được hệ thống xác minh"
                    : "Đang cập nhật trong hệ thống"
                }}
              </strong>
            </div>

            <div class="price-box mb-3">
              <span class="font-weight-bold pet-price">
                {{ formatCurrency(dog.price) }}
              </span>
            </div>

            <div
              class="availability-box mb-4"
              v-if="dog.saleStatus === 'Sẵn sàng bán'"
            >
              <i class="fas fa-heart mr-2"></i>
              Sẵn sàng đón về.
            </div>

            <div
              class="availability-box hold-box mb-4"
              v-else-if="
                dog.saleStatus === 'Chờ thanh toán' ||
                dog.saleStatus === 'Đã đặt cọc' ||
                dog.saleStatus === 'Đang giao'
              "
            >
              <i class="fas fa-clock mr-2"></i>
              {{ getSaleStatusText(dog.saleStatus) }}.
            </div>

            <div
              class="availability-box sold-box mb-4"
              v-else-if="dog.saleStatus === 'Đã bán'"
            >
              <i class="fas fa-check-circle mr-2"></i>
              Đã có chủ mới.
            </div>

            <div
              class="availability-box stop-box mb-4"
              v-else-if="dog.saleStatus === 'Ngừng bán'"
            >
              <i class="fas fa-pause-circle mr-2"></i>
              Tạm ngừng mở bán.
            </div>

            <div class="highlight-tags mb-4">
              <span class="highlight-tag">
                <i class="fas fa-shield-alt mr-1"></i>Nguồn gốc rõ ràng
              </span>
              <span class="highlight-tag">
                <i class="fas fa-notes-medical mr-1"></i>Có hồ sơ sức khỏe
              </span>
              <span class="highlight-tag">
                <i class="fas fa-store mr-1"></i>Hệ thống bán chính thức
              </span>
            </div>

            <h5 class="section-title pb-2 mb-3">THÔNG TIN VỀ CÚN YÊU</h5>

            <div class="info-table-wrapper mb-4 rounded overflow-hidden shadow-sm">
              <div class="d-flex flex-wrap stripe-purple">
                <div class="col-12 col-md-6 d-flex align-items-center py-2 px-3 border-right-md">
                  <span class="info-label text-muted">Ngày sinh:</span>
                  <strong class="text-dark">{{ formatDate(dog.birthDate) }}</strong>
                </div>
                <div class="col-12 col-md-6 d-flex align-items-center py-2 px-3">
                  <span class="info-label text-muted">Tháng tuổi:</span>
                  <strong class="text-dark">{{ calculateAge(dog.birthDate) }}</strong>
                </div>
              </div>

              <div class="d-flex flex-wrap stripe-white">
                <div class="col-12 col-md-6 d-flex align-items-center py-2 px-3 border-right-md">
                  <span class="info-label text-muted">Giới tính:</span>
                  <strong class="text-dark">{{ dog.gender || "---" }}</strong>
                </div>
                <div class="col-12 col-md-6 d-flex align-items-center py-2 px-3">
                  <span class="info-label text-muted">Giống:</span>
                  <strong class="text-dark">{{ dog.breedId?.name || "Đang cập nhật" }}</strong>
                </div>
              </div>

              <div class="d-flex flex-wrap stripe-purple">
                <div class="col-12 col-md-6 d-flex align-items-center py-2 px-3 border-right-md">
                  <span class="info-label text-muted">Cân nặng:</span>
                  <strong class="text-dark">
                    {{ dog.weight ? `${dog.weight} kg` : "Đang cập nhật" }}
                  </strong>
                </div>
                <div class="col-12 col-md-6 d-flex align-items-center py-2 px-3">
                  <span class="info-label text-muted">Nguồn gốc:</span>
                  <strong class="text-dark">
                    {{ dog.sourceVerified ? "Đã xác minh" : "Đang cập nhật" }}
                  </strong>
                </div>
              </div>

              <div class="d-flex flex-wrap stripe-white">
                <div class="col-12 col-md-6 d-flex align-items-center py-2 px-3 border-right-md">
                  <span class="info-label text-muted">Sức khỏe:</span>
                  <strong class="text-success">{{ dog.healthStatus || "Đang cập nhật" }}</strong>
                </div>
                <div class="col-12 col-md-6 d-flex align-items-center py-2 px-3">
                  <span class="info-label text-muted">Tẩy giun gần nhất:</span>
                  <strong class="text-dark">{{ formatDate(dog.lastDeworming) }}</strong>
                </div>
              </div>

              <div class="d-flex flex-wrap stripe-purple">
                <div class="col-12 col-md-6 d-flex align-items-center py-2 px-3 border-right-md">
                  <span class="info-label text-muted">Điều kiện bán:</span>
                  <strong :class="dog.eligibleForSale ? 'text-success' : 'text-warning'">
                    {{ dog.eligibleForSale ? "Đủ điều kiện" : "Đang cập nhật" }}
                  </strong>
                </div>
                <div class="col-12 col-md-6 d-flex align-items-center py-2 px-3">
                  <span class="info-label text-muted">Trạng thái:</span>
                  <strong class="text-dark">{{ getSaleStatusText(dog.saleStatus) }}</strong>
                </div>
              </div>

              <div class="d-flex flex-wrap stripe-white" v-if="dog.description">
                <div class="col-12 d-flex align-items-start py-2 px-3">
                  <span class="info-label text-muted">Đặc điểm:</span>
                  <span class="text-dark">{{ dog.description }}</span>
                </div>
              </div>
            </div>

            <div class="health-note-box mb-4">
              <h6 class="health-note-title mb-2">
                <i class="fas fa-notes-medical mr-2"></i>Thông tin sức khỏe
              </h6>
              <p class="mb-0 text-muted">
                Hồ sơ sức khỏe chi tiết trước và sau mua sẽ được hệ thống quản lý riêng. Ở trang này, khách hàng chỉ xem thông tin sức khỏe tóm tắt để phục vụ quyết định mua.
              </p>
            </div>

            <h5 class="section-title pb-2 mb-3 mt-4">LIÊN HỆ ĐÓN BÉ</h5>

            <div class="action-buttons d-flex flex-wrap">
              <button
                class="btn btn-main font-weight-bold py-3 px-4 mr-3 mb-3 shadow-sm"
                @click="goToDeposit"
                :disabled="dog.saleStatus !== 'Sẵn sàng bán'"
              >
                <i
                  class="fas"
                  :class="dog.saleStatus === 'Sẵn sàng bán' ? 'fa-hand-holding-usd' : 'fa-lock'"
                ></i>
                <span class="ml-2">{{ getDepositButtonText(dog.saleStatus) }}</span>
              </button>

              <a
                href="tel:0379889868"
                class="btn btn-hotline font-weight-bold py-3 px-4 mb-3 shadow-sm"
              >
                <i class="fas fa-phone-alt mr-2"></i> HOTLINE: 0379889868
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="container text-center py-5" v-else>
      <div class="spinner-border" style="color: #6a1b9a;" role="status"></div>
      <p class="mt-3 text-muted">Đang tải thông tin...</p>
    </div>

    <div class="floating-contact">
      <a href="tel:0379889868" class="float-btn phone-btn shadow" title="Gọi Hotline">
        <i class="fas fa-phone-alt"></i>
      </a>
    </div>
  </div>
</template>

<script>
import DogService from "@/services/dog.service";

export default {
  name: "DogDetail",

  data() {
    return {
      dog: null,
    };
  },

  computed: {
    dogImage() {
      if (!this.dog?.image) {
        return "https://via.placeholder.com/600x800?text=Dog+Image";
      }
      if (String(this.dog.image).startsWith("http")) {
        return this.dog.image;
      }
      return `http://localhost:3000${this.dog.image}`;
    },
  },

  async created() {
    const id = this.$route.params.id;
    try {
      this.dog = await DogService.get(id);
    } catch (error) {
      console.error("Lỗi tải chi tiết thú cưng:", error);
    }
  },

  methods: {
    formatCurrency(value) {
      if (value === null || value === undefined) return "---";
      return Number(value).toLocaleString("vi-VN") + " ₫";
    },

    formatDate(date) {
      if (!date) return "Chưa cập nhật";
      return new Date(date).toLocaleDateString("vi-VN");
    },

    calculateAge(birthDate) {
      if (!birthDate) return "--";
      const birth = new Date(birthDate);
      const now = new Date();
      const diffMonths =
        (now.getFullYear() - birth.getFullYear()) * 12 +
        (now.getMonth() - birth.getMonth());
      return diffMonths > 0 ? `${diffMonths} tháng` : "< 1 tháng";
    },

    getSaleStatusText(status) {
      if (status === "Sẵn sàng bán") return "Sẵn sàng đón về";
      if (status === "Chờ thanh toán") return "Đang chờ xác nhận cọc";
      if (status === "Đã đặt cọc") return "Đang có khách giữ chỗ";
      if (status === "Đang giao") return "Đang bàn giao";
      if (status === "Đã bán") return "Đã có chủ mới";
      if (status === "Ngừng bán") return "Ngừng bán";
      return "Chưa mở bán";
    },

    getDepositButtonText(status) {
      if (status === "Sẵn sàng bán") return "ĐẶT CỌC ĐÓN BÉ";
      if (status === "Chờ thanh toán") return "ĐANG CHỜ XÁC NHẬN CỌC";
      if (status === "Đã đặt cọc") return "BÉ ĐANG ĐƯỢC GIỮ CHỖ";
      if (status === "Đang giao") return "BÉ ĐANG ĐƯỢC BÀN GIAO";
      if (status === "Đã bán") return "BÉ ĐÃ CÓ CHỦ MỚI";
      if (status === "Ngừng bán") return "TẠM NGỪNG BÁN";
      return "CHƯA MỞ BÁN";
    },

    goToDeposit() {
      if (!this.dog || this.dog.saleStatus !== "Sẵn sàng bán") {
        alert("Bé chó này hiện chưa sẵn sàng để đặt cọc.");
        return;
      }

      const user = JSON.parse(localStorage.getItem("user") || "null");
      if (!user) {
        alert("Vui lòng đăng nhập để thực hiện đặt cọc.");
        this.$router.push("/login");
        return;
      }

      localStorage.setItem("checkoutDog", JSON.stringify(this.dog));
      this.$router.push("/deposit");
    },
  },
};
</script>

<style scoped>
@media (min-width: 1200px) {
  .custom-container {
    max-width: 1350px !important;
  }
}

.pet-title {
  color: #6a1b9a;
}

.pet-price {
  font-size: 2.2rem;
  color: #4a148c;
}

.detail-content {
  width: 100%;
}

.origin-message {
  font-size: 0.98rem;
  line-height: 1.6;
  max-width: 760px;
}

.source-mini-box {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}

.source-mini-label {
  color: #6b7280;
  font-weight: 600;
}

.source-mini-name {
  color: #4a148c;
}

.highlight-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  max-width: 820px;
}

.highlight-tag {
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  border-radius: 999px;
  background: #f5ecfb;
  color: #6a1b9a;
  font-size: 0.88rem;
  font-weight: 700;
}

.main-image-box {
  border: 2px solid #e1d5ed;
  border-radius: 8px;
}

.main-image-box img {
  height: 620px;
  object-fit: cover;
}

.section-title {
  color: #6a1b9a;
  font-weight: 700;
  border-bottom: 2px dashed #d1c4e9;
  text-transform: uppercase;
}

.img-thumbnail-custom {
  opacity: 0.75;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.img-thumbnail-custom:hover,
.active-thumb {
  opacity: 1;
  border: 2px solid #6a1b9a !important;
}

.info-table-wrapper {
  font-size: 0.95rem;
  border: 1px solid #e1d5ed;
  max-width: 820px;
}

.stripe-purple {
  background-color: #f4ebf8;
  border-bottom: 1px solid #e1d5ed;
}

.stripe-white {
  background-color: #ffffff;
  border-bottom: 1px solid #e1d5ed;
}

.info-table-wrapper > div:last-child {
  border-bottom: none;
}

.info-label {
  width: 130px;
  flex-shrink: 0;
  font-weight: 600;
}

.health-note-box {
  max-width: 820px;
  background: #faf7fd;
  border: 1px solid #e7dcf5;
  border-radius: 10px;
  padding: 16px 18px;
}

.health-note-title {
  color: #6a1b9a;
  font-weight: 700;
}

.availability-box {
  max-width: 820px;
  background: #f8f4fc;
  border: 1px solid #e1d5ed;
  color: #6a1b9a;
  border-radius: 8px;
  padding: 12px 16px;
  font-weight: 600;
}

.hold-box {
  background: #fff7e8;
  border-color: #f3d18b;
  color: #a16207;
}

.sold-box {
  background: #f3f4f6;
  border-color: #d1d5db;
  color: #1f2937;
}

.stop-box {
  background: #fef3c7;
  border-color: #fcd34d;
  color: #92400e;
}

@media (min-width: 768px) {
  .border-right-md {
    border-right: 1px dashed #e1d5ed;
  }
}

.btn-main,
.btn-hotline {
  border-radius: 8px;
}

.btn-main {
  background-color: #6a1b9a;
  color: white;
  transition: all 0.2s;
}

.btn-main:hover {
  background-color: #4a148c;
  color: white;
  transform: translateY(-2px);
}

.btn-main:disabled {
  background-color: #9c27b0;
  opacity: 0.7;
  transform: none;
}

.btn-hotline {
  background-color: #a8b868;
  color: white;
  transition: all 0.2s;
}

.btn-hotline:hover {
  background-color: #92a356;
  color: white;
  transform: translateY(-2px);
}

.floating-contact {
  position: fixed;
  bottom: 30px;
  left: 30px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  z-index: 999;
}

.float-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  text-decoration: none;
  transition: transform 0.2s;
}

.float-btn:hover {
  transform: scale(1.1);
  color: white;
}

.phone-btn {
  background-color: #dc3545;
}

@media (max-width: 991.98px) {
  .main-image-box img {
    height: 480px !important;
  }

  .col-lg-7.d-flex.align-items-center {
    display: block !important;
  }
}

@media (max-width: 767.98px) {
  .main-image-box img {
    height: 360px !important;
  }

  .info-label {
    width: 115px;
  }

  .pet-price {
    font-size: 1.8rem;
  }
}
</style>