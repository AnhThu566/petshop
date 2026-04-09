<template>
  <div class="dog-detail-page bg-white py-4" style="min-height: 100vh;">
    <div class="container custom-container mb-4">
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb bg-transparent p-0 m-0 small">
          <li class="breadcrumb-item">
            <router-link to="/" class="text-muted text-decoration-none">Trang chủ</router-link>
          </li>
          <li class="breadcrumb-item">
            <router-link to="/" class="text-muted text-decoration-none">Chó cảnh</router-link>
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
              Chó được đăng bán từ trại có thông tin rõ ràng và hồ sơ sức khỏe minh bạch.
            </p>

            <div class="farm-mini-box mb-3" v-if="dog.farmId">
              <span class="farm-mini-label">Nguồn gốc từ trại:</span>
              <strong class="farm-mini-name">{{ dog.farmId?.name || "Đang cập nhật" }}</strong>

              <button
                v-if="dog.farmId?._id || dog.farmId?.id"
                type="button"
                class="btn-view-farm"
                @click="goToFarmPage"
              >
                Xem trang trại
              </button>
            </div>

            <div class="price-box mb-3">
              <span class="font-weight-bold pet-price">
                {{ formatCurrency(dog.price) }}
              </span>
            </div>

            <div class="availability-box mb-4" v-if="dog.status === 'Đã duyệt'">
              <i class="fas fa-heart mr-2"></i>
              Sẵn sàng đón về.
            </div>

            <div
              class="availability-box hold-box mb-4"
              v-else-if="
                dog.status === 'Chờ thanh toán' ||
                dog.status === 'Đã đặt cọc' ||
                dog.status === 'Đang giao'
              "
            >
              <i class="fas fa-clock mr-2"></i>
              Đang có khách giữ chỗ.
            </div>

            <div class="availability-box sold-box mb-4" v-else-if="dog.status === 'Đã bán'">
              <i class="fas fa-check-circle mr-2"></i>
              Đã bán.
            </div>

            <div class="highlight-tags mb-4">
              <span class="highlight-tag"><i class="fas fa-shield-alt mr-1"></i>Nguồn gốc rõ ràng</span>
              <span class="highlight-tag"><i class="fas fa-notes-medical mr-1"></i>Có hồ sơ sức khỏe</span>
              <span class="highlight-tag"><i class="fas fa-store mr-1"></i>Trại đăng bán xác định</span>
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
                  <span class="info-label text-muted">Trại đăng bán:</span>
                  <div class="farm-link-wrap">
                    <strong class="text-dark mr-2">{{ dog.farmId?.name || "Đang cập nhật" }}</strong>

                    <button
                      v-if="dog.farmId?._id || dog.farmId?.id"
                      type="button"
                      class="btn-view-farm"
                      @click="goToFarmPage"
                    >
                      Xem trại
                    </button>
                  </div>
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
                <div class="col-12 col-md-6 d-flex align-items-center py-2 px-3 border-right-md flex-nowrap">
                  <span class="info-label text-muted">Tẩy giun:</span>
                  <strong class="text-dark mr-2">
                    {{ dog.lastDeworming ? "Đã tẩy" : "Chưa cập nhật" }}
                  </strong>
                  <a
                    href="#"
                    class="text-primary small font-weight-bold text-decoration-underline text-nowrap"
                    @click.prevent="showDewormModal = true"
                    v-if="dog.lastDeworming"
                  >
                    (Xem chi tiết)
                  </a>
                </div>

                <div class="col-12 col-md-6 d-flex align-items-center py-2 px-3 flex-nowrap">
                  <span class="info-label text-muted">Tiêm phòng:</span>
                  <strong class="text-dark mr-2">{{ dog.healthRecord?.length || 0 }} mũi</strong>
                  <a
                    href="#"
                    class="text-primary small font-weight-bold text-decoration-underline text-nowrap"
                    @click.prevent="showVaccineModal = true"
                    v-if="dog.healthRecord && dog.healthRecord.length > 0"
                  >
                    (Xem chi tiết)
                  </a>
                </div>
              </div>

              <div class="d-flex flex-wrap stripe-white" v-if="dog.description">
                <div class="col-12 d-flex align-items-start py-2 px-3">
                  <span class="info-label text-muted">Đặc điểm:</span>
                  <span class="text-dark">{{ dog.description }}</span>
                </div>
              </div>
            </div>

            <h5 class="section-title pb-2 mb-3 mt-4">LIÊN HỆ ĐÓN BÉ</h5>

            <div class="action-buttons d-flex flex-wrap">
              <button
                class="btn btn-main font-weight-bold py-3 px-4 mr-3 mb-3 shadow-sm"
                @click="goToDeposit"
                :disabled="dog.status !== 'Đã duyệt'"
              >
                <i class="fas" :class="dog.status === 'Đã duyệt' ? 'fa-hand-holding-usd' : 'fa-lock'"></i>
                <span class="ml-2">{{ getDepositButtonText(dog.status) }}</span>
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

    <div v-if="showVaccineModal" class="custom-modal-backdrop" @click.self="showVaccineModal = false">
      <div class="custom-modal-box shadow-lg bg-white rounded-lg overflow-hidden">
        <div class="bg-light p-3 d-flex justify-content-between align-items-center border-bottom">
          <h5 class="mb-0 font-weight-bold" style="color: #6a1b9a;">
            <i class="fas fa-syringe mr-2 text-danger"></i> Lịch sử tiêm chủng
          </h5>
          <button
            class="btn btn-sm btn-outline-secondary rounded-circle"
            style="width: 32px; height: 32px;"
            @click="showVaccineModal = false"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="p-4" style="max-height: 60vh; overflow-y: auto;">
          <div v-if="dog.healthRecord && dog.healthRecord.length > 0">
            <div
              v-for="(v, i) in dog.healthRecord"
              :key="i"
              class="vaccine-badge shadow-sm bg-white mb-3"
            >
              <i class="fas fa-shield-alt text-success mr-3 fa-2x"></i>
              <div class="d-flex flex-column">
                <strong class="text-dark vaccine-name">
                  {{ v.vaccineId?.name || "Đang cập nhật" }}
                </strong>

                <span class="vaccine-date mt-1">
                  <i class="far fa-clock mr-1"></i>
                  Ngày tiêm: {{ formatDate(v.dateInjected) }}
                </span>

                <span class="small text-muted mt-1">
                  Ghi chú: {{ v.note || "Không có" }}
                </span>
              </div>
            </div>
          </div>

          <div v-else class="text-center text-muted py-4">
            Chưa có dữ liệu lịch sử tiêm chủng cho bé chó này.
          </div>
        </div>
      </div>
    </div>

    <div v-if="showDewormModal" class="custom-modal-backdrop" @click.self="showDewormModal = false">
      <div class="custom-modal-box shadow-lg bg-white rounded-lg overflow-hidden" style="max-width: 400px;">
        <div class="bg-light p-3 d-flex justify-content-between align-items-center border-bottom">
          <h5 class="mb-0 font-weight-bold text-warning">
            <i class="fas fa-capsules mr-2"></i> Thông tin tẩy giun
          </h5>
          <button
            class="btn btn-sm btn-outline-secondary rounded-circle"
            style="width: 32px; height: 32px;"
            @click="showDewormModal = false"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="p-4 text-center">
          <i class="fas fa-check-circle text-success fa-3x mb-3"></i>
          <h6 class="font-weight-bold mb-2">
            {{ dog.lastDeworming ? "Đã hoàn thành tẩy giun" : "Chưa có dữ liệu tẩy giun" }}
          </h6>
          <p class="mb-0 text-dark">
            Ngày tẩy giun gần nhất:<br />
            <strong class="text-danger deworm-date">
              {{ formatDate(dog.lastDeworming) }}
            </strong>
          </p>
        </div>
      </div>
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
      showVaccineModal: false,
      showDewormModal: false,
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

    getDepositButtonText(status) {
      if (status === "Đã duyệt") return "ĐẶT CỌC ĐÓN BÉ";

      if (
        status === "Chờ thanh toán" ||
        status === "Đã đặt cọc" ||
        status === "Đang giao"
      ) {
        return "BÉ ĐANG ĐƯỢC GIỮ CHỖ";
      }

      if (status === "Đã bán") return "BÉ ĐÃ BÁN";
      if (status === "Ngừng bán") return "NGỪNG BÁN";

      return "KHÔNG KHẢ DỤNG";
    },

    goToFarmPage() {
      const farmId = this.dog?.farmId?._id || this.dog?.farmId?.id;
      if (!farmId) return;

      this.$router.push({
        path: "/dogs",
        query: {
          view: "farm",
          id: farmId,
        },
      });
    },

    goToDeposit() {
      if (!this.dog || this.dog.status !== "Đã duyệt") {
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

.farm-mini-box {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}

.farm-mini-label {
  color: #6b7280;
  font-weight: 600;
}

.farm-mini-name {
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

.flex-nowrap {
  flex-wrap: nowrap !important;
  white-space: nowrap;
}

.farm-link-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-view-farm {
  border: none;
  background: #efe6fb;
  color: #6a1b9a;
  font-size: 0.85rem;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 999px;
  transition: all 0.2s ease;
}

.btn-view-farm:hover {
  background: #dcc8f4;
  color: #4a148c;
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

@media (min-width: 768px) {
  .border-right-md {
    border-right: 1px dashed #e1d5ed;
  }
}

.custom-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 1050;
  display: flex;
  justify-content: center;
  align-items: center;
}

.custom-modal-box {
  width: 90%;
  max-width: 500px;
  animation: modalFadeIn 0.3s ease;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.vaccine-badge {
  border: 1px solid #e1d5ed;
  border-left: 5px solid #6a1b9a;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  align-items: center;
}

.vaccine-name {
  font-size: 1.1rem;
}

.vaccine-date {
  color: #6b7280;
  font-size: 0.85rem;
}

.deworm-date {
  font-size: 1.2rem;
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

  .flex-nowrap {
    white-space: normal;
  }

  .pet-price {
    font-size: 1.8rem;
  }
}
</style>