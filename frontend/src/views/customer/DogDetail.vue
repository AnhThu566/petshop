<template>
  <div class="dog-detail-page">
    <div class="container custom-container mb-3">
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb bg-transparent p-0 m-0 small">
          <li class="breadcrumb-item">
            <router-link to="/" class="text-muted text-decoration-none">Trang chủ</router-link>
          </li>
          <li class="breadcrumb-item">
            <router-link to="/dogs/breeds" class="text-muted text-decoration-none">Giống chó</router-link>
          </li>
          <li
            class="breadcrumb-item active font-weight-bold text-dark"
            aria-current="page"
            v-if="dog"
          >
            {{ dog.name }}
          </li>
        </ol>
      </nav>
    </div>

    <div class="container custom-container" v-if="loading">
      <div class="state-box text-center py-5">
        <div class="spinner-border text-custom" role="status"></div>
        <p class="mt-3 text-muted">Đang tải thông tin bé cún...</p>
      </div>
    </div>

    <div class="container custom-container" v-else-if="dog">
      <div class="detail-main-card">
        <div class="row align-items-start">
          <!-- CỘT ẢNH -->
          <div class="col-lg-4 mb-4 mb-lg-0">
            <div class="media-card">
              <div class="main-image-box mb-3">
                <img
                  :src="selectedImage"
                  class="img-fluid w-100 object-fit-cover rounded-xl"
                  :alt="dog.name"
                />
              </div>

              <div class="thumb-grid">
                <div
                  class="thumb-item"
                  v-for="(image, index) in galleryImages"
                  :key="`${image}-${index}`"
                >
                  <img
                    :src="image"
                    class="img-fluid rounded-lg img-thumbnail-custom"
                    :class="{ 'active-thumb': selectedImage === image }"
                    :alt="`${dog.name} - ảnh ${index + 1}`"
                    @click="selectedImage = image"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- CỘT THÔNG TIN -->
          <div class="col-lg-8">
            <div class="detail-content-card">
              <div class="status-chip mb-2" :class="getStatusChipClass(dog.saleStatus)">
                <i class="fas mr-2" :class="getStatusIcon(dog.saleStatus)"></i>
                {{ getSaleStatusText(dog.saleStatus) }}
              </div>

              <h1 class="pet-title mb-1">{{ dog.name }}</h1>

              <div class="breed-source-line mb-3">
                <span>{{ dog.breedId?.name || "Đang cập nhật giống" }}</span>
                <span class="dot-separator">•</span>
                <span>{{ dog.farmId?.name || "Đang cập nhật nguồn cung" }}</span>
              </div>

              <div class="price-panel mb-3">
                <div class="price-label">Giá bán</div>
                <div class="pet-price">{{ formatCurrency(dog.price) }}</div>
              </div>

              <div class="compact-info-card mb-3">
                <div class="compact-title">Thông tin về bé cún</div>

                <div class="compact-table">
                  <div class="compact-row">
                    <div class="compact-cell">
                      <span class="compact-label">Ngày sinh</span>
                      <strong class="compact-value">{{ formatDate(dog.birthDate) }}</strong>
                    </div>
                    <div class="compact-cell">
                      <span class="compact-label">Tháng tuổi</span>
                      <strong class="compact-value">{{ calculateAge(dog.birthDate) }}</strong>
                    </div>
                  </div>

                  <div class="compact-row">
                    <div class="compact-cell">
                      <span class="compact-label">Giới tính</span>
                      <strong class="compact-value">{{ dog.gender || "Đang cập nhật" }}</strong>
                    </div>
                    <div class="compact-cell">
                      <span class="compact-label">Màu lông</span>
                      <strong class="compact-value">{{ dog.color || "Đang cập nhật" }}</strong>
                    </div>
                  </div>

                  <div class="compact-row">
                    <div class="compact-cell">
                      <span class="compact-label">Cân nặng</span>
                      <strong class="compact-value">
                        {{ dog.weight ? `${dog.weight} kg` : "Đang cập nhật" }}
                      </strong>
                    </div>
                    <div class="compact-cell">
                      <span class="compact-label">Sức khỏe</span>
                      <strong class="compact-value text-success">
                        {{ dog.healthStatus || "Đang cập nhật" }}
                      </strong>
                    </div>
                  </div>

                  <div class="compact-row">
                    <div class="compact-cell">
                      <span class="compact-label">Tẩy giun</span>
                      <div class="compact-value-row">
                        <strong class="compact-value">{{ formatDate(lastDewormingDate) }}</strong>
                        <button
                          type="button"
                          class="inline-link-btn"
                          @click="showDewormModal = true"
                        >
                          Xem chi tiết
                        </button>
                      </div>
                    </div>

                    <div class="compact-cell">
                      <span class="compact-label">Tiêm vaccine</span>
                      <div class="compact-value-row">
                        <strong class="compact-value">
                          {{
                            vaccineRecords.length > 0
                              ? `${vaccineRecords.length} mũi`
                              : dog.vaccinated
                              ? "Đã cập nhật"
                              : "Chưa có dữ liệu"
                          }}
                        </strong>
                        <button
                          type="button"
                          class="inline-link-btn"
                          @click="showVaccineModal = true"
                        >
                          Xem chi tiết
                        </button>
                      </div>
                    </div>
                  </div>

                  <div class="compact-row">
                    <div class="compact-cell">
                      <span class="compact-label">Nguồn cung</span>
                      <strong class="compact-value">
                        {{ dog.farmId?.name || "Đang cập nhật" }}
                      </strong>
                    </div>
                    <div class="compact-cell">
                      <span class="compact-label">Khu vực</span>
                      <strong class="compact-value">
                        {{ dog.farmId?.address || "Đang cập nhật" }}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              <div class="row two-note-row mb-3">
                <div class="col-md-6 mb-2 mb-md-0" v-if="dog.description">
                  <div class="desc-card h-100">
                    <div class="desc-label">Đặc điểm</div>
                    <div class="desc-text">{{ dog.description }}</div>
                  </div>
                </div>

                <div class="col-md-6" v-if="dog.healthNote">
                  <div class="desc-card h-100">
                    <div class="desc-label">Ghi chú sức khỏe</div>
                    <div class="desc-text">{{ dog.healthNote }}</div>
                  </div>
                </div>
              </div>

              <div
                class="availability-box mb-3"
                v-if="dog.saleStatus === 'Sẵn sàng bán'"
              >
                <i class="fas fa-heart mr-2"></i>
                Bé đang sẵn sàng đón về.
              </div>

              <div
                class="availability-box hold-box mb-3"
                v-else-if="isReservedStatus(dog.saleStatus)"
              >
                <i class="fas fa-clock mr-2"></i>
                {{ getSaleStatusDescription(dog.saleStatus) }}
              </div>

              <div
                class="availability-box sold-box mb-3"
                v-else-if="dog.saleStatus === 'Đã bán'"
              >
                <i class="fas fa-check-circle mr-2"></i>
                Bé đã có chủ mới.
              </div>

              <div
                class="availability-box stop-box mb-3"
                v-else
              >
                <i class="fas fa-pause-circle mr-2"></i>
                Bé hiện chưa sẵn sàng giao dịch trên hệ thống.
              </div>

              <div class="cta-row">
                <button
                  class="btn btn-main font-weight-bold py-2 px-4 mr-2 mb-2 shadow-sm"
                  @click="goToDeposit"
                  :disabled="!canDeposit"
                >
                  <i
                    class="fas"
                    :class="canDeposit ? 'fa-hand-holding-usd' : 'fa-lock'"
                  ></i>
                  <span class="ml-2">{{ getDepositButtonText(dog.saleStatus) }}</span>
                </button>

                <a
                  href="tel:0379889868"
                  class="btn btn-hotline font-weight-bold py-2 px-4 mb-2 shadow-sm"
                >
                  <i class="fas fa-phone-alt mr-2"></i> HOTLINE: 0379889868
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="container custom-container" v-else>
      <div class="empty-state-box text-center py-5">
        <i class="fas fa-dog mb-3"></i>
        <h4 class="mb-2">Không tìm thấy hồ sơ bé cún</h4>
        <p class="text-muted mb-3">
          Bé có thể chưa được mở hiển thị công khai hoặc thông tin không còn khả dụng.
        </p>
        <router-link to="/dogs/breeds" class="btn btn-main px-4 py-2">
          Quay lại danh sách chó
        </router-link>
      </div>
    </div>

    <!-- POPUP TẨY GIUN -->
    <div
      v-if="showDewormModal"
      class="custom-modal-overlay"
      @click.self="showDewormModal = false"
    >
      <div class="custom-modal-box">
        <div class="custom-modal-head">
          <h5 class="mb-0">
            <i class="fas fa-calendar-alt mr-2"></i>Lịch sử tẩy giun
          </h5>
          <button class="custom-modal-close" @click="showDewormModal = false">&times;</button>
        </div>

        <div class="custom-modal-body">
          <div v-if="dewormingRecords.length === 0" class="modal-empty-text">
            Chưa có dữ liệu chi tiết về các lần tẩy giun.
          </div>

          <div v-else class="timeline-list">
            <div
              v-for="(item, index) in dewormingRecords"
              :key="index"
              class="timeline-item"
            >
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <div class="timeline-date">
                  {{ formatDate(item.date || item.lastDewormingDate || item.dewormingDate) }}
                </div>
                <div class="timeline-note">
                  {{ item.note || item.content || "Đã thực hiện tẩy giun." }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="custom-modal-foot">
          <button class="btn btn-main px-4 py-2" @click="showDewormModal = false">
            Đóng
          </button>
        </div>
      </div>
    </div>

    <!-- POPUP VACCINE -->
    <div
      v-if="showVaccineModal"
      class="custom-modal-overlay"
      @click.self="showVaccineModal = false"
    >
      <div class="custom-modal-box">
        <div class="custom-modal-head">
          <h5 class="mb-0">
            <i class="fas fa-syringe mr-2"></i>Chi tiết vaccine
          </h5>
          <button class="custom-modal-close" @click="showVaccineModal = false">&times;</button>
        </div>

        <div class="custom-modal-body">
          <div v-if="vaccineRecords.length === 0" class="modal-empty-text">
            Chưa có dữ liệu chi tiết về vaccine đã tiêm.
          </div>

          <div v-else class="vaccine-list">
            <div
              v-for="(item, index) in vaccineRecords"
              :key="index"
              class="vaccine-card"
            >
              <div class="vaccine-name">
                {{ item.vaccineName || item.name || item.vaccine || "Vaccine" }}
              </div>
              <div class="vaccine-date">
                Ngày tiêm: {{ formatDate(item.dateInjected || item.date || item.injectedAt) }}
              </div>
              <div v-if="item.note" class="vaccine-note">
                {{ item.note }}
              </div>
            </div>
          </div>
        </div>

        <div class="custom-modal-foot">
          <button class="btn btn-main px-4 py-2" @click="showVaccineModal = false">
            Đóng
          </button>
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
      loading: true,
      selectedImage: "",
      showDewormModal: false,
      showVaccineModal: false,
    };
  },

  computed: {
    galleryImages() {
      if (!this.dog) return [];

      const images = [];

      if (this.dog.image) {
        images.push(this.toImageUrl(this.dog.image));
      }

      if (Array.isArray(this.dog.images) && this.dog.images.length) {
        this.dog.images.forEach((item) => {
          const fullUrl = this.toImageUrl(item);
          if (fullUrl && !images.includes(fullUrl)) {
            images.push(fullUrl);
          }
        });
      }

      if (images.length === 0) {
        images.push("https://via.placeholder.com/600x800?text=Dog+Image");
      }

      return images.slice(0, 6);
    },

    canDeposit() {
      return this.dog?.saleStatus === "Sẵn sàng bán";
    },

    vaccineRecords() {
      if (!this.dog) return [];
      return (
        this.dog.vaccines ||
        this.dog.healthRecord?.vaccines ||
        this.dog.dogHealthRecord?.vaccines ||
        []
      );
    },

    dewormingRecords() {
      if (!this.dog) return [];
      return (
        this.dog.dewormingHistory ||
        this.dog.healthRecord?.dewormingHistory ||
        this.dog.dogHealthRecord?.dewormingHistory ||
        []
      );
    },

    lastDewormingDate() {
      if (this.dog?.lastDeworming) return this.dog.lastDeworming;
      if (this.dog?.healthRecord?.lastDewormingDate) return this.dog.healthRecord.lastDewormingDate;
      if (this.dog?.dogHealthRecord?.lastDewormingDate) return this.dog.dogHealthRecord.lastDewormingDate;
      if (this.dewormingRecords.length > 0) {
        return (
          this.dewormingRecords[0].date ||
          this.dewormingRecords[0].lastDewormingDate ||
          this.dewormingRecords[0].dewormingDate ||
          null
        );
      }
      return null;
    },
  },

  async created() {
    await this.fetchDog();
  },

  methods: {
    async fetchDog() {
      this.loading = true;
      this.dog = null;

      try {
        const id = this.$route.params.id;
        const data = await DogService.getPublicById(id);
        this.dog = data;
        this.selectedImage = this.galleryImages[0];
      } catch (error) {
        console.error("Lỗi tải chi tiết thú cưng:", error);
        this.dog = null;
      } finally {
        this.loading = false;
      }
    },

    toImageUrl(path) {
      if (!path) return "";
      if (String(path).startsWith("http")) return path;
      return `http://localhost:3000${path}`;
    },

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
      let diffMonths =
        (now.getFullYear() - birth.getFullYear()) * 12 +
        (now.getMonth() - birth.getMonth());

      if (now.getDate() < birth.getDate()) {
        diffMonths -= 1;
      }

      return diffMonths > 0 ? `${diffMonths} tháng` : "< 1 tháng";
    },

    isReservedStatus(status) {
      return ["Chờ thanh toán", "Đã đặt cọc", "Đang giao"].includes(status);
    },

    getSaleStatusText(status) {
      if (status === "Sẵn sàng bán") return "Sẵn sàng đón về";
      if (status === "Chờ thanh toán") return "Chờ xác nhận cọc";
      if (status === "Đã đặt cọc") return "Đã được giữ chỗ";
      if (status === "Đang giao") return "Đang bàn giao";
      if (status === "Đã bán") return "Đã có chủ mới";
      if (status === "Ngừng bán") return "Tạm ngừng mở bán";
      return "Chưa mở bán";
    },

    getSaleStatusDescription(status) {
      if (status === "Chờ thanh toán") {
        return "Bé đang có yêu cầu đặt cọc và chờ hệ thống xác nhận khoản cọc.";
      }
      if (status === "Đã đặt cọc") {
        return "Bé đang được khách hàng giữ chỗ sau khi khoản cọc đã được xác nhận.";
      }
      if (status === "Đang giao") {
        return "Bé đang trong quá trình bàn giao cho khách hàng.";
      }
      return "Bé hiện chưa sẵn sàng giao dịch.";
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

    getStatusChipClass(status) {
      if (status === "Sẵn sàng bán") return "chip-ready";
      if (["Chờ thanh toán", "Đã đặt cọc", "Đang giao"].includes(status)) return "chip-hold";
      if (status === "Đã bán") return "chip-sold";
      return "chip-stop";
    },

    getStatusIcon(status) {
      if (status === "Sẵn sàng bán") return "fa-heart";
      if (["Chờ thanh toán", "Đã đặt cọc", "Đang giao"].includes(status)) return "fa-clock";
      if (status === "Đã bán") return "fa-check-circle";
      return "fa-pause-circle";
    },

    goToDeposit() {
      if (!this.dog || !this.canDeposit) {
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

  watch: {
    "$route.params.id": {
      async handler() {
        await this.fetchDog();
      },
    },
  },
};
</script>

<style scoped>
.dog-detail-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(177, 145, 211, 0.12), transparent 28%),
    linear-gradient(180deg, #fcf9ff 0%, #ffffff 100%);
  padding: 18px 0 60px;
}

@media (min-width: 1200px) {
  .custom-container {
    max-width: 1180px !important;
  }
}

.text-custom {
  color: #6a1b9a;
}

.detail-main-card,
.media-card,
.detail-content-card,
.empty-state-box,
.state-box {
  background: #ffffff;
  border: 1px solid #eadff8;
  border-radius: 18px;
  box-shadow: 0 8px 18px rgba(94, 53, 177, 0.05);
}

.detail-main-card {
  padding: 14px;
}

.media-card,
.detail-content-card {
  height: 100%;
}

.rounded-xl {
  border-radius: 14px !important;
}

.rounded-lg {
  border-radius: 8px !important;
}

.main-image-box {
  border: 1px solid #eadcf6;
  border-radius: 14px;
  padding: 3px;
  background: #fff;
}

.main-image-box img {
  height: 310px;
  object-fit: cover;
}

.thumb-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
}

.thumb-item {
  min-width: 0;
}

.img-thumbnail-custom {
  width: 100%;
  height: 48px;
  object-fit: cover;
  opacity: 0.82;
  transition: all 0.2s;
  border: 2px solid transparent;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(94, 53, 177, 0.06);
}

.img-thumbnail-custom:hover,
.active-thumb {
  opacity: 1;
  border: 2px solid #6a1b9a !important;
}

.detail-content-card {
  padding: 2px 4px 2px 10px;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 800;
}

.chip-ready {
  background: #e9f8ef;
  color: #1f8f4d;
}

.chip-hold {
  background: #fff4df;
  color: #a16207;
}

.chip-sold {
  background: #f3f4f6;
  color: #1f2937;
}

.chip-stop {
  background: #fef3c7;
  color: #92400e;
}

.pet-title {
  color: #2f1b44;
  font-size: 1.3rem;
  line-height: 1.15;
  font-weight: 900;
}

.breed-source-line {
  color: #7f7194;
  font-size: 0.75rem;
  font-weight: 700;
}

.dot-separator {
  margin: 0 6px;
  color: #b3a7c3;
}

.price-panel {
  background: linear-gradient(135deg, #faf5ff, #f6edfd);
  border: 1px solid #eadcf6;
  border-radius: 12px;
  padding: 8px 10px;
}

.price-label {
  color: #8a7d9e;
  font-size: 0.68rem;
  font-weight: 700;
  margin-bottom: 3px;
}

.pet-price {
  font-size: 1.3rem;
  color: #4a148c;
  font-weight: 900;
  line-height: 1.05;
}

.compact-info-card {
  background: #fcf8ff;
  border: 1px solid #eadcf6;
  border-radius: 14px;
  padding: 10px;
}

.compact-title {
  color: #5a2d91;
  font-size: 0.76rem;
  font-weight: 800;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.compact-table {
  border: 1px solid #e9dff5;
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
}

.compact-row {
  display: flex;
  flex-wrap: nowrap;
  border-bottom: 1px solid #e9dff5;
}

.compact-row:last-child {
  border-bottom: none;
}

.compact-cell {
  width: 50%;
  min-height: 40px;
  padding: 6px 8px;
  border-right: 1px solid #e9dff5;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #fff;
}

.compact-cell:nth-child(2n) {
  border-right: none;
}

.compact-label {
  color: #8a7d9e;
  font-size: 0.64rem;
  font-weight: 700;
  margin-bottom: 2px;
}

.compact-value {
  color: #31114d;
  font-size: 0.74rem;
  font-weight: 800;
  line-height: 1.25;
  white-space: nowrap;
}

.compact-value-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.inline-link-btn {
  border: none;
  background: transparent;
  color: #6a1b9a;
  font-size: 0.64rem;
  font-weight: 700;
  padding: 0;
  white-space: nowrap;
}

.inline-link-btn:hover {
  text-decoration: underline;
}

.two-note-row {
  margin-left: -4px;
  margin-right: -4px;
}

.two-note-row > div {
  padding-left: 4px;
  padding-right: 4px;
}

.desc-card {
  background: #ffffff;
  border: 1px solid #eee6f6;
  border-radius: 10px;
  padding: 8px 10px;
}

.desc-label {
  color: #5a2d91;
  font-size: 0.68rem;
  font-weight: 800;
  margin-bottom: 3px;
  text-transform: uppercase;
}

.desc-text {
  color: #5f5470;
  line-height: 1.45;
  font-size: 0.74rem;
}

.availability-box {
  background: #f8f4fc;
  border: 1px solid #e1d5ed;
  color: #6a1b9a;
  border-radius: 10px;
  padding: 8px 10px;
  font-size: 0.74rem;
  font-weight: 700;
  line-height: 1.35;
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

.cta-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.custom-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(30, 20, 44, 0.45);
  z-index: 4000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.custom-modal-box {
  width: 100%;
  max-width: 620px;
  background: #fff;
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(43, 18, 70, 0.24);
}

.custom-modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  background: linear-gradient(135deg, #6a1b9a, #4a148c);
  color: #fff;
}

.custom-modal-close {
  border: none;
  background: transparent;
  color: #fff;
  font-size: 1.8rem;
  line-height: 1;
}

.custom-modal-body {
  padding: 20px 18px;
  max-height: 60vh;
  overflow-y: auto;
}

.custom-modal-foot {
  padding: 0 18px 18px;
  text-align: right;
}

.modal-empty-text {
  color: #7f7194;
  text-align: center;
  padding: 18px 0;
}

.timeline-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.timeline-item {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #7b4cc2;
  margin-top: 6px;
  flex-shrink: 0;
}

.timeline-content {
  background: #faf5ff;
  border: 1px solid #eadcf6;
  border-radius: 14px;
  padding: 12px 14px;
  width: 100%;
}

.timeline-date {
  color: #5a2d91;
  font-weight: 800;
  margin-bottom: 4px;
}

.timeline-note {
  color: #5f5470;
  line-height: 1.65;
}

.vaccine-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.vaccine-card {
  background: #faf5ff;
  border: 1px solid #eadcf6;
  border-radius: 14px;
  padding: 14px;
}

.vaccine-name {
  color: #5a2d91;
  font-weight: 800;
  margin-bottom: 4px;
}

.vaccine-date {
  color: #5f5470;
  font-size: 0.93rem;
  margin-bottom: 4px;
}

.vaccine-note {
  color: #7f7194;
  font-size: 0.9rem;
  line-height: 1.6;
}

.btn-main,
.btn-hotline {
  border-radius: 8px;
  font-size: 0.72rem;
  min-height: 32px;
  padding: 0 12px !important;
}

.btn-main {
  background: linear-gradient(135deg, #6a1b9a, #4a148c);
  color: white;
  transition: all 0.2s;
  border: none;
}

.btn-main:hover {
  background: linear-gradient(135deg, #5f1690, #42127d);
  color: white;
  transform: translateY(-2px);
}

.btn-main:disabled {
  background: #9c27b0;
  opacity: 0.75;
  transform: none;
}

.btn-hotline {
  background-color: #a8b868;
  color: white;
  transition: all 0.2s;
  border: none;
}

.btn-hotline:hover {
  background-color: #92a356;
  color: white;
  transform: translateY(-2px);
}

.empty-state-box,
.state-box {
  background: #ffffff;
  border: 1px solid #eadff8;
  border-radius: 24px;
  box-shadow: 0 12px 24px rgba(94, 53, 177, 0.06);
}

.empty-state-box i {
  font-size: 2.4rem;
  color: #7b4cc2;
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
  width: 54px;
  height: 54px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.45rem;
  text-decoration: none;
  transition: transform 0.2s;
}

.float-btn:hover {
  transform: scale(1.08);
  color: white;
}

.phone-btn {
  background-color: #dc3545;
}

@media (max-width: 991.98px) {
  .main-image-box img {
    height: 280px !important;
  }

  .pet-title {
    font-size: 1.15rem;
  }
}

@media (max-width: 767.98px) {
  .main-image-box img {
    height: 230px !important;
  }

  .img-thumbnail-custom {
    height: 44px;
  }

  .compact-row {
    flex-wrap: wrap;
  }

  .compact-cell {
    width: 100%;
    border-right: none;
  }

  .compact-value,
  .inline-link-btn {
    white-space: normal;
  }

  .pet-price {
    font-size: 1.15rem;
  }

  .pet-title {
    font-size: 1rem;
  }

  .breed-source-line {
    font-size: 0.72rem;
  }

  .btn-main,
  .btn-hotline {
    width: 100%;
  }
}
</style>