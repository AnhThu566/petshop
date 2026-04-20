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
          <li class="breadcrumb-item active font-weight-bold text-dark" aria-current="page" v-if="dog">
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
    <div class="top-grid">
      <div class="left-media">
        <div class="main-image-box">
          <img :src="selectedImage" class="main-image" :alt="dog.name" />
        </div>

        <div class="thumb-grid" v-if="galleryImages.length">
          <img
            v-for="(image, index) in galleryImages"
            :key="`${image}-${index}`"
            :src="image"
            class="img-thumbnail-custom"
            :class="{ 'active-thumb': selectedImage === image }"
            :alt="`${dog.name} - ảnh ${index + 1}`"
            @click="selectedImage = image"
          />
        </div>
      </div>

      <div class="right-info">
        <h1 class="pet-title">{{ dog.name }}</h1>
        <div class="pet-price">{{ formatCurrency(dog.finalPrice || dog.price) }}</div>
        <div class="sale-status-text">
          {{ getSaleStatusText(dog.saleStatus) }}
        </div>

        <div class="right-block-title">THÔNG TIN VỀ CÚN YÊU</div>

        <div class="info-line-table">
          <div class="line-row">
            <div class="line-col">
              <span class="line-label">Ngày sinh:</span>
              <span class="line-value">{{ formatDate(dog.birthDate) }}</span>
            </div>
            <div class="line-col">
              <span class="line-label">Giới tính:</span>
              <span class="line-value">{{ dog.gender || "—" }}</span>
            </div>
          </div>

          <div class="line-row">
            <div class="line-col">
              <span class="line-label">Màu lông:</span>
              <span class="line-value">{{ dog.coatColor || "—" }}</span>
            </div>
            <div class="line-col">
              <span class="line-label">Tháng tuổi:</span>
              <span class="line-value">{{ calculateAge(dog.birthDate) }}</span>
            </div>
          </div>

          <div class="line-row">
            <div class="line-col">
              <span class="line-label">Tình trạng sức khỏe:</span>
              <span class="line-value">{{ dog.healthStatus || "Tốt" }}</span>
            </div>
            <div class="line-col">
              <span class="line-label">Cân nặng:</span>
              <span class="line-value">{{ dog.weight ? `${dog.weight} kg` : "—" }}</span>
            </div>
          </div>

          <div class="line-row">
            <div class="line-col">
              <span class="line-label">Bố:</span>
              <span class="line-value">{{ dog.fatherName || "—" }}</span>
            </div>
            <div class="line-col">
              <span class="line-label">Mẹ:</span>
              <span class="line-value">{{ dog.motherName || "—" }}</span>
            </div>
          </div>

          <div class="line-row">
            <div class="line-col">
              <span class="line-label">Nơi sinh:</span>
              <span class="line-value">{{ dog.birthPlace || "—" }}</span>
            </div>
            <div class="line-col">
              <span class="line-label">Nguồn cung:</span>
              <span class="line-value">{{ dog.farmId?.name || "—" }}</span>
            </div>
          </div>

          <div class="line-row">
            <div class="line-col">
              <span class="line-label">Khu vực:</span>
              <span class="line-value">{{ dog.farmId?.address || "—" }}</span>
            </div>
            <div class="line-col">
              <span class="line-label">Tẩy giun:</span>
              <div class="line-inline-group">
                <span class="line-value">{{ formatDate(lastDewormingDate) }}</span>
                <button type="button" class="inline-link-btn" @click="showDewormModal = true">
                  Xem chi tiết
                </button>
              </div>
            </div>
          </div>

          <div class="line-row">
            <div class="line-col line-col-full">
              <span class="line-label">Vaccine:</span>
              <div class="line-inline-group">
                <span class="line-value">
                  {{ vaccineRecords.length > 0 ? `${vaccineRecords.length} mũi` : "Chưa có dữ liệu" }}
                </span>
                <button type="button" class="inline-link-btn" @click="showVaccineModal = true">
                  Xem chi tiết
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="bottom-action-row">
          <button class="buy-btn" @click="goToDeposit" v-if="canDeposit">
            ĐẶT CỌC ĐÓN BÉ
          </button>
        </div>
      </div>
    </div>

    <div class="bottom-section mt-5" v-if="dog.description || dog.fatherName || dog.motherName">
      <div class="bottom-grid">
        <div>
          <div class="section-line-title">GIỚI THIỆU VỀ CÚN YÊU</div>
          <div class="bottom-text-content mt-3">
            {{ dog.description || 'Chưa có thông tin giới thiệu.' }}
          </div>
        </div>

        <div>
          <div class="section-line-title">THÔNG TIN VỀ BỐ MẸ</div>
          <div class="bottom-text-content mt-3">
            <div class="mb-2"><strong>Bố:</strong> {{ dog.fatherName || "Đang cập nhật" }}</div>
            <div><strong>Mẹ:</strong> {{ dog.motherName || "Đang cập nhật" }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-if="relatedDogs.length > 0" class="related-section dog-related-section">
    <div class="related-head">
      <h3 class="related-title">Gợi ý các bé chó liên quan</h3>
      <p class="related-subtitle">
        Một số bé cùng giống hoặc phù hợp với nhu cầu của bạn
      </p>
    </div>

    <div class="related-grid">
<div
  class="related-card"
  v-for="item in relatedDogs"
  :key="item._id || item.id"
  @click="goToDogDetail(item)"
>
  <div class="related-image-wrap">
    <img
      :src="getDogImage(item)"
      alt="related-dog"
      class="related-image"
    />

    <span class="related-status-badge">
      Sẵn sàng đón về
    </span>
  </div>

  <div class="related-body">
    <h4 class="related-name">
      {{ item.name }}
    </h4>

    <div class="related-price">
      {{ formatCurrency(item.finalPrice || item.price) }}
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
        <p class="text-muted mb-3">Bé có thể chưa được mở hiển thị công khai hoặc thông tin không còn khả dụng.</p>
        <router-link to="/dogs/breeds" class="btn btn-primary-custom px-4 py-2">
          Quay lại danh sách
        </router-link>
      </div>
    </div>

    <div v-if="showDewormModal" class="custom-modal-overlay" @click.self="showDewormModal = false">
      <div class="custom-modal-box">
        <div class="custom-modal-head">
          <h5 class="mb-0"><i class="fas fa-calendar-alt mr-2"></i>Lịch sử tẩy giun</h5>
          <button class="custom-modal-close" @click="showDewormModal = false">&times;</button>
        </div>
        <div class="custom-modal-body">
          <div v-if="dewormingRecords.length === 0" class="modal-empty-text">Chưa có dữ liệu chi tiết về các lần tẩy giun.</div>
          <div v-else class="timeline-list">
            <div v-for="(item, index) in dewormingRecords" :key="index" class="timeline-item">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <div class="timeline-date">{{ formatDate(item.date || item.lastDewormingDate || item.dewormingDate) }}</div>
                <div class="timeline-note">{{ item.note || item.content || "Đã thực hiện tẩy giun." }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="custom-modal-foot">
          <button class="btn btn-primary-custom px-4 py-2" @click="showDewormModal = false">Đóng</button>
        </div>
      </div>
    </div>

    <div v-if="showVaccineModal" class="custom-modal-overlay" @click.self="showVaccineModal = false">
      <div class="custom-modal-box">
        <div class="custom-modal-head">
          <h5 class="mb-0"><i class="fas fa-syringe mr-2"></i>Chi tiết vaccine</h5>
          <button class="custom-modal-close" @click="showVaccineModal = false">&times;</button>
        </div>
        <div class="custom-modal-body">
          <div v-if="vaccineRecords.length === 0" class="modal-empty-text">Chưa có dữ liệu chi tiết về vaccine đã tiêm.</div>
          <div v-else class="vaccine-list">
            <div v-for="(item, index) in vaccineRecords" :key="index" class="vaccine-card">
              <div class="vaccine-name">{{ item.vaccineName || item.name || item.vaccine || "Vaccine" }}</div>
              <div class="vaccine-date">Ngày tiêm: {{ formatDate(item.dateInjected || item.date || item.injectedAt) }}</div>
              <div v-if="item.note" class="vaccine-note">{{ item.note }}</div>
            </div>
          </div>
        </div>
        <div class="custom-modal-foot">
          <button class="btn btn-primary-custom px-4 py-2" @click="showVaccineModal = false">Đóng</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// Toàn bộ logic script của bạn được giữ nguyên, không thay đổi.
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
    relatedDogs: [],
  };
},

  computed: {
    galleryImages() {
      if (!this.dog) return [];

      const images = [];

      if (this.dog.image) images.push(this.toImageUrl(this.dog.image));

      if (Array.isArray(this.dog.images) && this.dog.images.length) {
        this.dog.images.forEach((item) => {
          const fullUrl = this.toImageUrl(item);
          if (fullUrl && !images.includes(fullUrl)) images.push(fullUrl);
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
      return this.dog?.vaccines || [];
    },

    dewormingRecords() {
      return this.dog?.dewormingHistory || [];
    },

    lastDewormingDate() {
      if (this.dog?.lastDeworming) return this.dog.lastDeworming;
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
await this.fetchRelatedDogs();
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
      if (!date) return "—";
      return new Date(date).toLocaleDateString("vi-VN");
    },

    calculateAge(birthDate) {
      if (!birthDate) return "—";

      const birth = new Date(birthDate);
      const now = new Date();
      let diffMonths =
        (now.getFullYear() - birth.getFullYear()) * 12 +
        (now.getMonth() - birth.getMonth());

      if (now.getDate() < birth.getDate()) diffMonths -= 1;

      return diffMonths > 0 ? `${diffMonths} tháng` : "< 1 tháng";
    },

    getSaleStatusText(status) {
      if (status === "Sẵn sàng bán") return "Sẵn sàng đón về";
      if (status === "Chờ thanh toán") return "Chờ xác nhận cọc";
      if (status === "Đã đặt cọc") return "Đã được giữ chỗ";
      if (status === "Đang giao") return "Đang bàn giao";
      if (status === "Đã bán") return "Đã bán";
      if (status === "Ngừng bán") return "Tạm ngừng mở bán";
      return "Chưa mở bán";
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

    async fetchRelatedDogs() {
  try {
    const list = await DogService.getPublic();
    const currentId = this.dog?._id || this.dog?.id;
    const currentBreedId =
      this.dog?.breedId?._id || this.dog?.breedId?.id || this.dog?.breedId || "";

    const validItems = (list || []).filter((item) => {
      const itemId = item._id || item.id;
      return (
        String(itemId) !== String(currentId) &&
        Number(item.finalPrice || item.price || 0) > 0
      );
    });

    const sameBreedItems = validItems.filter((item) => {
      const itemBreedId =
        item.breedId?._id || item.breedId?.id || item.breedId || "";
      return currentBreedId && String(itemBreedId) === String(currentBreedId);
    });

    let finalItems = [];
    if (sameBreedItems.length >= 4) {
      finalItems = sameBreedItems.slice(0, 4);
    } else {
      const usedIds = new Set(sameBreedItems.map((item) => String(item._id || item.id)));
      const fallbackItems = validItems.filter(
        (item) => !usedIds.has(String(item._id || item.id))
      );
      finalItems = [...sameBreedItems, ...fallbackItems].slice(0, 4);
    }

    this.relatedDogs = finalItems;
  } catch (error) {
    console.error("Lỗi tải chó liên quan:", error);
    this.relatedDogs = [];
  }
},

getDogImage(item) {
  if (!item?.image) {
    return "https://via.placeholder.com/500x350?text=Dog";
  }
  return this.toImageUrl(item.image);
},

goToDogDetail(item) {
  const id = item?._id || item?.id;
  if (!id) return;
  this.$router.push(`/dog/${id}`);
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
    linear-gradient(180deg, #faf7fc 0%, #f4eef9 100%);
  padding: 24px 0 60px;
}

@media (min-width: 1200px) {
  .custom-container {
    max-width: 1320px !important;
  }
}

.detail-main-card,
.state-box,
.empty-state-box {
  background: #fff;
  border: 1px solid #eee2f7;
  border-radius: 24px;
  box-shadow: 0 12px 24px rgba(106, 27, 154, 0.06);
}

.detail-main-card {
  padding: 24px 28px 28px;
}

.top-grid {
  display: grid;
  grid-template-columns: minmax(380px, 430px) minmax(380px, 1fr);
  gap: 40px;
  align-items: start;
}

.left-media {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.main-image-box {
  width: 100%;
  background: #f7f1fd;
  border: 1px solid #eadcf7;
  border-radius: 22px;
  overflow: hidden;
}

.main-image {
  width: 100%;
  height: 440px;
  object-fit: cover;
  display: block;
}

.thumb-grid {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  flex-wrap: wrap;
}

.img-thumbnail-custom {
  width: 78px;
  height: 78px;
  object-fit: cover;
  cursor: pointer;
  border: 2px solid #e7d8f5;
  border-radius: 14px;
  background: #fff;
  transition: all 0.2s ease;
}

.img-thumbnail-custom.active-thumb,
.img-thumbnail-custom:hover {
  border-color: #9a4ddd;
  box-shadow: 0 8px 16px rgba(117, 34, 178, 0.12);
}

.right-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.pet-title {
  color: #24124d;
  font-size: 2.15rem;
  line-height: 1.2;
  font-weight: 900;
  margin-bottom: 10px;
  word-break: break-word;
}

.pet-price {
  color: #2f9e44;
  font-size: 2.05rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 4px;
}

.sale-status-text {
  color: #5b5563;
  font-size: 0.98rem;
  font-weight: 600;
  margin-bottom: 18px;
}

.top-action-btn {
  margin-bottom: 18px !important;
}

.right-block-title,
.section-line-title {
  color: #2f1b44;
  font-size: 1.08rem;
  font-weight: 900;
  padding-bottom: 8px;
  border-bottom: 1px solid #eadcf7;
  margin-bottom: 14px;
  text-transform: uppercase;
}

.info-line-table {
  width: 100%;
  border-bottom: 1px dashed #a4b459;
  margin-bottom: 0;
  padding-bottom: 8px;
}

.line-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  border-bottom: 1px solid #f1e8fa;
}

.line-row:last-child {
  border-bottom: none;
}

.line-row:nth-child(odd) {
  background: #fcf9ff;
}

.line-row:nth-child(even) {
  background: #ffffff;
}

.line-col {
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 14px;
  border-right: 1px solid #f1e8fa;
}

.line-col:last-child {
  border-right: none;
}

.line-col-full {
  grid-column: 1 / -1;
  border-right: none !important;
}

.line-label {
  color: #7b7287;
  font-size: 0.9rem;
  font-weight: 700;
  white-space: nowrap;
}

.line-value {
  color: #2f1b44;
  font-size: 0.92rem;
  font-weight: 800;
  text-align: right;
  word-break: break-word;
}

.line-inline-group {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  min-width: 0;
}

.inline-link-btn {
  border: none;
  background: transparent;
  color: #7b2fc0;
  font-size: 0.84rem;
  font-weight: 700;
  padding: 0;
  cursor: pointer;
}

.inline-link-btn:hover {
  text-decoration: underline;
}

.bottom-action-row {
  display: flex;
  gap: 16px;
  margin-top: 22px;
}

.buy-btn {
  height: 46px;
  min-width: 220px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  border: none;
  background: linear-gradient(135deg, #9a4ddd, #7522b2);
  color: #fff;
  box-shadow: 0 12px 22px rgba(117, 34, 178, 0.18);
}

.buy-btn:hover {
  filter: brightness(0.98);
  color: #fff;
  text-decoration: none;
}

.state-box,
.empty-state-box {
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: #7a708a;
  text-align: center;
  padding: 24px;
}

.text-custom {
  color: #7b2fc0;
}

.empty-state-box i {
  font-size: 2.4rem;
  color: #cfbfdc;
}

.bottom-section {
  margin-top: 28px !important;
}

.bottom-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}

.bottom-text-content {
  color: #5b5563;
  font-size: 0.96rem;
  line-height: 1.75;
}

.custom-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 4000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.custom-modal-box {
  background: #fff;
  width: 100%;
  max-width: 560px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(106, 27, 154, 0.16);
}

.custom-modal-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #9a4ddd, #7522b2);
  color: white;
}

.custom-modal-close {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
}

.custom-modal-body {
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
}

.custom-modal-foot {
  padding: 16px 20px;
  text-align: right;
  border-top: 1px solid #f3f4f6;
}

.modal-empty-text {
  color: #7b7287;
}

.timeline-list,
.vaccine-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.timeline-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.timeline-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #9a4ddd;
  margin-top: 7px;
  flex-shrink: 0;
}

.timeline-content,
.vaccine-card {
  background: #fcf9ff;
  border: 1px solid #eadcf7;
  border-radius: 14px;
  padding: 12px 14px;
  width: 100%;
}

.timeline-date,
.vaccine-name {
  color: #2f1b44;
  font-weight: 800;
  margin-bottom: 4px;
}

.timeline-note,
.vaccine-date,
.vaccine-note {
  color: #5b5563;
  line-height: 1.65;
  font-size: 0.92rem;
}

@media (max-width: 1199.98px) {
  .top-grid {
    grid-template-columns: 1fr;
    gap: 28px;
  }

  .main-image {
    height: 360px;
  }
}

@media (max-width: 991.98px) {
  .pet-title {
    font-size: 1.8rem;
  }

  .pet-price {
    font-size: 1.65rem;
  }

  .bottom-grid {
    grid-template-columns: 1fr;
    gap: 28px;
  }
}

@media (max-width: 767.98px) {
  .detail-main-card {
    padding: 18px 16px 20px;
  }

  .main-image {
    height: 280px;
  }

  .img-thumbnail-custom {
    width: 64px;
    height: 64px;
  }

  .line-row {
    grid-template-columns: 1fr;
  }

  .line-col {
    border-right: none;
    border-bottom: 1px solid #f1e8fa;
  }

  .line-row .line-col:last-child {
    border-bottom: none;
  }

  .bottom-action-row {
    flex-direction: column;
  }

  .cart-btn,
  .buy-btn,
  .hotline-btn {
    width: 100%;
  }
}

.related-section {
  background: #ffffff;
  border: 1px solid #eee6f6;
  border-radius: 24px;
  box-shadow: 0 12px 24px rgba(75, 31, 115, 0.05);
  padding: 22px 22px 24px;
  margin-top: 28px;
}

.related-head {
  margin-bottom: 22px;
  text-align: center;
}

.related-title {
  margin: 0 0 6px;
  color: #31114d;
  font-size: 1.3rem;
  font-weight: 900;
}

.related-subtitle {
  margin: 0;
  color: #7f7194;
  font-size: 0.95rem;
  line-height: 1.6;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 28px 24px;
  align-items: start;
}

.related-card {
  width: 100%;
  background: #fff;
  border: 1px solid #eee6f6;
  border-radius: 24px;
  overflow: hidden;
  transition: all 0.28s ease;
  display: block;
  box-shadow: 0 12px 24px rgba(75, 31, 115, 0.05);
  cursor: pointer;
}

.related-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 38px rgba(75, 31, 115, 0.12);
}

.related-image-wrap {
  position: relative;
  width: 100%;
  height: 280px;
  overflow: hidden;
  background: #f3ebff;
  cursor: pointer;
}

.related-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.35s ease;
}

.related-card:hover .related-image {
  transform: scale(1.05);
}

.related-body {
  padding: 16px 16px 18px;
  text-align: center;
}

.related-name {
  color: #5a2d91;
  font-size: 1.14rem;
  font-weight: 800;
  margin-bottom: 8px;
  line-height: 1.35;
  text-align: center;
  cursor: pointer;
}

.related-name:hover {
  color: #6a1b9a;
}

.related-price {
  color: #6f49b6;
  font-size: 1.08rem;
  font-weight: 900;
  margin-bottom: 0;
  text-align: center;
}

@media (max-width: 1199px) {
  .related-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 992px) {
  .related-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .related-image-wrap {
    height: 240px;
  }
}

@media (max-width: 576px) {
  .related-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .related-image-wrap {
    height: 230px;
  }

  .related-name {
    font-size: 1.02rem;
  }

  .related-price {
    font-size: 1rem;
  }
}

.dog-related-section {
  margin-top: 24px;
}

.related-status-badge {
  position: absolute;
  top: 14px;
  left: 14px;
  padding: 8px 13px;
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: 800;
  color: #ffffff;
  z-index: 2;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.14);
  background: #16a34a;
}
</style>