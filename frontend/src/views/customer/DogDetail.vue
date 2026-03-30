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
      <div class="row">
        <div class="col-lg-4 mb-4 mb-lg-0 pr-lg-4">
          <div class="main-image-box mb-3 p-1" style="border: 2px solid #e1d5ed; border-radius: 8px;">
            <img
              :src="dog.image ? 'http://localhost:3000' + dog.image : 'https://via.placeholder.com/600x800'"
              class="img-fluid w-100 object-fit-cover rounded"
              style="max-height: 550px;"
              alt="Hình thú cưng"
            />
          </div>

          <div class="row px-1">
            <div class="col-4 px-2">
              <img
                :src="dog.image ? 'http://localhost:3000' + dog.image : 'https://via.placeholder.com/150'"
                class="img-fluid rounded cursor-pointer img-thumbnail-custom active-thumb"
              />
            </div>
            <div class="col-4 px-2">
              <img
                src="https://via.placeholder.com/150/f4ebf8/6a1b9a?text=+"
                class="img-fluid rounded img-thumbnail-custom"
              />
            </div>
            <div class="col-4 px-2">
              <img
                src="https://via.placeholder.com/150/f4ebf8/6a1b9a?text=+"
                class="img-fluid rounded img-thumbnail-custom"
              />
            </div>
          </div>
        </div>

        <div class="col-lg-8 pl-lg-5">
          <h1 class="pet-title font-weight-bold mb-1">{{ dog.name }}</h1>
          <div class="price-box mb-2">
            <span class="font-weight-bold" style="font-size: 2.2rem; color: #4a148c;">
              {{ formatCurrency(dog.price) }}
            </span>
          </div>

          <div class="mb-4">
            <span class="badge px-3 py-2" :class="getDogStatusClass(dog.status)">
              {{ getDogStatusText(dog.status) }}
            </span>
          </div>

          <h5 class="section-title pb-2 mb-3">THÔNG TIN VỀ CÚN YÊU</h5>

          <div
            class="info-table-wrapper mb-4 rounded overflow-hidden shadow-sm"
            style="border: 1px solid #e1d5ed; max-width: 800px;"
          >
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
                <strong class="text-dark">{{ dog.gender }}</strong>
              </div>
              <div class="col-12 col-md-6 d-flex align-items-center py-2 px-3">
                <span class="info-label text-muted">Giống:</span>
                <strong class="text-dark">{{ dog.breedId?.name || 'Đang cập nhật' }}</strong>
              </div>
            </div>

            <div class="d-flex flex-wrap stripe-purple">
              <div class="col-12 col-md-6 d-flex align-items-center py-2 px-3 border-right-md">
                <span class="info-label text-muted">Cân nặng:</span>
                <strong class="text-dark">{{ dog.weight || '--' }} kg</strong>
              </div>
              <div class="col-12 col-md-6 d-flex align-items-center py-2 px-3">
                <span class="info-label text-muted">Nguồn gốc:</span>
                <strong class="text-dark">{{ dog.farmId?.name || 'Đang cập nhật' }}</strong>
              </div>
            </div>

            <div class="d-flex flex-wrap stripe-white">
              <div class="col-12 col-md-6 d-flex align-items-center py-2 px-3 border-right-md flex-nowrap">
                <span class="info-label text-muted">Tẩy giun:</span>
                <strong class="text-dark mr-2">Đã tẩy</strong>
                <a
                  href="#"
                  class="text-primary small font-weight-bold text-decoration-underline text-nowrap"
                  @click.prevent="showDewormModal = true"
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

            <div class="d-flex flex-wrap stripe-purple" v-if="dog.description">
              <div class="col-12 d-flex align-items-center py-2 px-3">
                <span class="info-label text-muted">Đặc điểm:</span>
                <span class="text-dark">{{ dog.description }}</span>
              </div>
            </div>
          </div>

          <div class="alert alert-light border mb-4" style="max-width: 800px;">
            <div class="d-flex justify-content-between mb-2">
              <span>Tổng giá chó:</span>
              <strong>{{ formatCurrency(dog.price) }}</strong>
            </div>
            <div class="d-flex justify-content-between mb-2">
              <span>Tiền cọc cần thanh toán trước:</span>
              <strong class="text-danger">{{ formatCurrency(depositAmount) }}</strong>
            </div>
            <div class="d-flex justify-content-between">
              <span>Phần còn lại khi nhận chó:</span>
              <strong class="text-primary">{{ formatCurrency(remainingAmount) }}</strong>
            </div>
          </div>

          <h5 class="section-title pb-2 mb-3 mt-4">LIÊN HỆ ĐÓN BÉ</h5>
          <div class="action-buttons d-flex flex-wrap">
            <button
              class="btn btn-main font-weight-bold py-3 px-4 mr-3 mb-3 shadow-sm"
              style="border-radius: 8px;"
              @click="goToDeposit"
              :disabled="dog.status !== 'Đã duyệt'"
            >
              <i class="fas" :class="dog.status === 'Đã duyệt' ? 'fa-hand-holding-usd' : 'fa-lock'"></i>
              <span class="ml-2">{{ getDepositButtonText(dog.status) }}</span>
            </button>

            <a
              href="#"
              class="btn btn-chat font-weight-bold py-3 px-4 mr-3 mb-3 shadow-sm"
              style="border-radius: 8px;"
            >
              <i class="fas fa-comment-dots mr-2"></i> CHAT VỚI TRẠI
            </a>

            <a
              href="tel:0379889868"
              class="btn btn-hotline font-weight-bold py-3 px-4 mb-3 shadow-sm"
              style="border-radius: 8px;"
            >
              <i class="fas fa-phone-alt mr-2"></i> HOTLINE: 0379889868
            </a>
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
          <div
            v-for="(v, i) in dog.healthRecord"
            :key="i"
            class="vaccine-badge shadow-sm bg-white mb-3"
          >
            <i class="fas fa-shield-alt text-success mr-3 fa-2x"></i>
            <div class="d-flex flex-column">
              <strong class="text-dark" style="font-size: 1.1rem;">
                {{ v.vaccineId?.name || 'Đang cập nhật' }}
              </strong>
              <span class="vaccine-date mt-1">
                <i class="far fa-clock mr-1"></i> Ngày tiêm: {{ formatDate(v.dateInjected) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showDewormModal" class="custom-modal-backdrop" @click.self="showDewormModal = false">
      <div class="custom-modal-box shadow-lg bg-white rounded-lg overflow-hidden" style="max-width: 400px;">
        <div class="bg-light p-3 d-flex justify-content-between align-items-center border-bottom">
          <h5 class="mb-0 font-weight-bold text-warning">
            <i class="fas fa-capsules mr-2"></i> Thông tin Tẩy giun
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
          <h6 class="font-weight-bold mb-2">Đã hoàn thành tẩy giun</h6>
          <p class="mb-0 text-dark">
            Ngày tẩy giun gần nhất:<br />
            <strong class="text-danger" style="font-size: 1.2rem;">
              {{ formatDate(dog.lastDeworming) }}
            </strong>
          </p>
        </div>
      </div>
    </div>

    <div class="floating-contact">
      <a href="#" class="float-btn zalo-btn shadow" title="Chat Zalo"><i class="fas fa-comment-dots"></i></a>
      <a href="tel:0379889868" class="float-btn phone-btn shadow" title="Gọi Hotline"><i class="fas fa-phone-alt"></i></a>
    </div>
  </div>
</template>

<script>
import DogService from "@/services/dog.service";

export default {
  data() {
    return {
      dog: null,
      showVaccineModal: false,
      showDewormModal: false,
    };
  },

  computed: {
    depositAmount() {
      if (!this.dog || !this.dog.price) return 0;
      return Math.round(Number(this.dog.price) * 0.3);
    },

    remainingAmount() {
      if (!this.dog || !this.dog.price) return 0;
      return Number(this.dog.price) - this.depositAmount;
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
      if (!date) return "---";
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

    getDogStatusText(status) {
      if (status === "Đã duyệt") return "Sẵn sàng đặt cọc";
      if (status === "Chờ thanh toán") return "Đang chờ xác nhận cọc";
      if (status === "Đã đặt cọc") return "Đã có khách đặt cọc";
      if (status === "Đang giao") return "Đang giao cho khách";
      if (status === "Đã bán") return "Đã bán";
      if (status === "Từ chối") return "Tạm ngưng";
      return status || "---";
    },

    getDogStatusClass(status) {
      if (status === "Đã duyệt") return "badge-success";
      if (status === "Chờ thanh toán") return "badge-info text-dark";
      if (status === "Đã đặt cọc") return "badge-primary";
      if (status === "Đang giao") return "badge-secondary";
      if (status === "Đã bán") return "badge-dark";
      if (status === "Từ chối") return "badge-danger";
      return "badge-light border";
    },

    getDepositButtonText(status) {
      if (status === "Đã duyệt") return "ĐẶT CỌC ĐÓN BÉ";
      if (status === "Chờ thanh toán") return "ĐANG CHỜ XÁC NHẬN CỌC";
      if (status === "Đã đặt cọc") return "ĐÃ CÓ NGƯỜI ĐẶT CỌC";
      if (status === "Đang giao") return "ĐANG GIAO CHO KHÁCH";
      if (status === "Đã bán") return "ĐÃ BÁN";
      return status || "KHÔNG KHẢ DỤNG";
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
  .custom-container { max-width: 1350px !important; }
}

.pet-title { color: #6a1b9a; }
.section-title { color: #6a1b9a; font-weight: 700; border-bottom: 2px dashed #d1c4e9; text-transform: uppercase; }

.img-thumbnail-custom { opacity: 0.6; transition: opacity 0.2s; }
.img-thumbnail-custom:hover, .active-thumb { opacity: 1; border: 2px solid #6a1b9a !important; }

.info-table-wrapper { font-size: 0.95rem; }
.stripe-purple { background-color: #f4ebf8; border-bottom: 1px solid #e1d5ed; }
.stripe-white { background-color: #ffffff; border-bottom: 1px solid #e1d5ed; }
.info-table-wrapper > div:last-child { border-bottom: none; }

.info-label { width: 95px; flex-shrink: 0; font-weight: 600; }
.flex-nowrap { flex-wrap: nowrap !important; white-space: nowrap; }

@media (min-width: 768px) {
  .border-right-md { border-right: 1px dashed #e1d5ed; }
}

.custom-modal-backdrop {
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  background-color: rgba(0,0,0,0.6);
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
  from { opacity: 0; transform: translateY(-30px); }
  to { opacity: 1; transform: translateY(0); }
}

.vaccine-badge {
  border: 1px solid #e1d5ed;
  border-left: 5px solid #6a1b9a;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  align-items: center;
}
.vaccine-date { color: #6b7280; font-size: 0.85rem; }

.btn-main { background-color: #6a1b9a; color: white; transition: all 0.2s; }
.btn-main:hover { background-color: #4a148c; color: white; transform: translateY(-2px); }
.btn-main:disabled { background-color: #9c27b0; opacity: 0.7; transform: none; }

.btn-chat { background-color: #e09f3e; color: white; transition: all 0.2s; }
.btn-chat:hover { background-color: #c98c34; color: white; transform: translateY(-2px); }

.btn-hotline { background-color: #a8b868; color: white; transition: all 0.2s; }
.btn-hotline:hover { background-color: #92a356; color: white; transform: translateY(-2px); }

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
.float-btn:hover { transform: scale(1.1); color: white; }
.zalo-btn { background-color: #0068ff; }
.phone-btn { background-color: #dc3545; }
</style>