<template>
  <div class="dog-detail-page">
<div class="container custom-container mb-3">
  <div class="breadcrumb-row">
    <router-link to="/" class="crumb-link">Trang chủ</router-link>
    <span class="crumb-sep">/</span>
    <router-link to="/dogs/breeds" class="crumb-link">Giống chó</router-link>
    <template v-if="dog && breedLinkId">
      <span class="crumb-sep">/</span>
      <router-link :to="`/dogs/breeds/${breedLinkId}`" class="crumb-link">
        {{ breedDisplayName }}
      </router-link>
    </template>
    <template v-if="dog">
      <span class="crumb-sep">/</span>
      <span class="crumb-current">{{ dog.name }}</span>
    </template>
  </div>

  <div class="back-row">
    <button class="back-btn" @click="goBackToBreed">
      <i class="fas fa-arrow-left mr-1"></i> Quay lại
    </button>
  </div>
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
            <div class="title-status-row">
              <div class="title-wrap">
                <h1 class="pet-title">{{ dog.name }}</h1>
                <div class="pet-price">{{ formatCurrency(dog.finalPrice || dog.price) }}</div>
              </div>

              <span class="sale-status-badge" :class="saleStatusClass">
                {{ saleStatusLabel }}
              </span>
            </div>

            <div class="sale-status-text">
              {{ getSaleStatusText(dog.saleStatus) }}
            </div>

            <div
              v-if="actionHint"
              class="action-hint"
              :class="{ disabled: !canDeposit }"
            >
              {{ actionHint }}
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
                  <span class="line-label">Khu vực cung cấp:</span>
                  <span class="line-value">{{ dog.birthPlace || "—" }}</span>
                </div>
                <div class="line-col">
                  <span class="line-label">Nguồn gốc:</span>
                  <span class="line-value">Trang trại đối tác đã xác minh</span>
                </div>
              </div>

              <div class="line-row">
                <div class="line-col">
                  <span class="line-label">Đơn vị bán:</span>
                  <span class="line-value">PetShop</span>
                </div>
                <div class="line-col">
                  <span class="line-label">Tẩy giun gần nhất:</span>
                  <span class="line-value">{{ formatDate(dog.lastDeworming) }}</span>
                </div>
              </div>

              <div class="line-row">
                <div class="line-col line-col-full">
                  <span class="line-label">Vaccine:</span>
                  <div class="line-inline-group">
                    <span class="line-value">
                      {{ vaccineRecords.length > 0 ? `${vaccineRecords.length} mũi` : "Chưa có dữ liệu" }}
                    </span>
                    <button
                      v-if="vaccineRecords.length > 0"
                      type="button"
                      class="inline-link-btn"
                      @click="showVaccineModal = true"
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="bottom-action-row">
              <button
                v-if="canDeposit"
                class="buy-btn"
                @click="goToDeposit"
              >
                ĐẶT CỌC ĐÓN BÉ
              </button>

              <button
                v-else
                class="buy-btn disabled-btn"
                type="button"
                disabled
              >
                {{ actionButtonText }}
              </button>
            </div>
          </div>
        </div>

        <div v-if="dog.description || dog.fatherName || dog.motherName" class="bottom-section mt-5">
          <div class="bottom-grid">
            <div>
              <div class="section-line-title">GIỚI THIỆU VỀ CÚN YÊU</div>
              <div class="bottom-text-content mt-3">
                {{ dog.description || "Chưa có thông tin giới thiệu." }}
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
          <h3 class="related-title">Các bé chó khác</h3>
          <p class="related-subtitle">
            Một số bé chó khác bạn có thể quan tâm
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

              <span
                class="related-status-badge"
                :class="getStatusClass(item.saleStatus)"
              >
                {{ getCardSaleStatusText(item.saleStatus) }}
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
import DogService from "@/services/dog.service";

export default {
  name: "DogDetail",

  data() {
    return {
      dog: null,
      loading: true,
      selectedImage: "",
      showVaccineModal: false,
      relatedDogs: [],
    };
  },

  computed: {
    breedDisplayName() {
    return (
      this.dog?.breedId?.name ||
      this.dog?.breedName ||
      this.dog?.breed?.name ||
      "Tên giống chó"
    );
  },

  breedLinkId() {
    return (
      this.dog?.breedId?._id ||
      this.dog?.breedId?.id ||
      this.dog?.breedId ||
      this.dog?.breed?._id ||
      this.dog?.breed?.id ||
      ""
    );
  },
    
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
      return (
        this.dog?.saleStatus === "Sẵn sàng bán" &&
        this.dog?.approvalStatus === "Đã duyệt" &&
        this.dog?.isPublished !== false
      );
    },

    saleStatusLabel() {
      return this.getSaleStatusText(this.dog?.saleStatus);
    },

    saleStatusClass() {
      return this.getStatusClass(this.dog?.saleStatus);
    },

    actionButtonText() {
      const status = this.dog?.saleStatus;

      if (status === "Đã bán") {
        return "BÉ ĐÃ BÁN";
      }

      if (["Chờ thanh toán", "Đã đặt cọc", "Đang giao"].includes(status)) {
        return "ĐÃ CÓ NGƯỜI ĐẶT";
      }

      if (status === "Ngừng bán") {
        return "TẠM NGỪNG MỞ BÁN";
      }

      return "CHƯA MỞ BÁN";
    },

    actionHint() {
      const status = this.dog?.saleStatus;

      if (status === "Sẵn sàng bán") {
        return "Bé hiện vẫn còn nhận đặt cọc.";
      }

      if (["Chờ thanh toán", "Đã đặt cọc", "Đang giao"].includes(status)) {
        return "Bé hiện đã có khách khác đặt trước.";
      }

      if (status === "Đã bán") {
        return "Bé đã hoàn tất giao dịch.";
      }

      if (status === "Ngừng bán") {
        return "Bé đang được tạm ngừng mở bán trong thời điểm này.";
      }

      return "Bé hiện chưa đủ điều kiện để nhận đặt cọc.";
    },

    vaccineRecords() {
      return this.dog?.vaccines || [];
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

      if (diffMonths < 0) diffMonths = 0;

      if (diffMonths === 0) {
        return "Dưới 1 tháng tuổi";
      }

      if (diffMonths === 1) {
        return "1 tháng tuổi";
      }

      return `${diffMonths} tháng tuổi`;
    },

    getSaleStatusText(status) {
      if (status === "Sẵn sàng bán") return "Còn nhận đặt cọc";
      if (["Chờ thanh toán", "Đã đặt cọc", "Đang giao"].includes(status)) {
        return "Đã có người đặt";
      }
      if (status === "Đã bán") return "Đã bán";
      if (status === "Ngừng bán") return "Tạm ngừng mở bán";
      return "Chưa mở bán";
    },

    getCardSaleStatusText(status) {
      if (status === "Sẵn sàng bán") return "Sẵn sàng bán";
      if (["Chờ thanh toán", "Đã đặt cọc", "Đang giao"].includes(status)) {
        return "Đã có người đặt";
      }
      if (status === "Đã bán") return "Đã bán";
      return "Sẵn sàng bán";
    },

    getStatusClass(status) {
      if (status === "Sẵn sàng bán") return "status-ready";
      if (["Chờ thanh toán", "Đã đặt cọc", "Đang giao"].includes(status)) {
        return "status-deposited";
      }
      if (status === "Đã bán") return "status-sold";
      if (status === "Ngừng bán") return "status-stop";
      return "status-default";
    },

    goToDeposit() {
      if (!this.dog || !this.canDeposit) {
        alert(this.actionHint || "Bé chó này hiện chưa sẵn sàng để đặt cọc.");
        return;
      }

      const user = JSON.parse(localStorage.getItem("user") || "null");

      if (!user) {
        alert("Vui lòng đăng nhập để thực hiện đặt cọc.");
        this.$router.push({
          path: "/login",
          query: {
            redirect: `/deposit?dogId=${this.dog._id || this.dog.id}`,
          },
        });
        return;
      }

      localStorage.setItem("checkoutDog", JSON.stringify(this.dog));
      this.$router.push({
        path: "/deposit",
        query: {
          dogId: this.dog._id || this.dog.id,
        },
      });
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

    goBackToBreed() {
  if (this.breedLinkId) {
    this.$router.push(`/dogs/breeds/${this.breedLinkId}`);
    return;
  }

  this.$router.push("/dogs/breeds");
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


@media (max-width: 576px) {
  .top-toolbar {
    align-items: flex-start;
  }

  .back-page-btn {
    width: 100%;
    justify-content: center;
    display: inline-flex;
    align-items: center;
  }
}
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

  .breadcrumb-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
  color: #8b7fa0;
  font-size: 0.92rem;
}

.crumb-link {
  color: #6a1b9a;
  font-weight: 700;
  text-decoration: none;
}

.crumb-link:hover {
  color: #5a1484;
}

.crumb-sep {
  color: #b0a3c0;
}

.crumb-current {
  color: #7b7287;
  font-weight: 600;
}

.back-row {
  margin-bottom: 18px;
}

.back-btn {
  border: 1px solid #dfd3ec;
  background: #fff;
  color: #5c5368;
  border-radius: 12px;
  height: 40px;
  padding: 0 16px;
  font-weight: 700;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: #faf6fe;
  border-color: #ccb5e7;
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

.title-status-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 8px;
}

.title-wrap {
  min-width: 0;
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

.sale-status-badge {
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 800;
  white-space: nowrap;
  border: 1px solid transparent;
}

.sale-status-text {
  color: #5b5563;
  font-size: 0.98rem;
  font-weight: 600;
  margin-bottom: 10px;
}

.action-hint {
  margin-bottom: 18px;
  padding: 10px 14px;
  border-radius: 12px;
  background: #f6ffed;
  color: #2f6b1f;
  border: 1px solid #cdebbd;
  font-size: 0.92rem;
  line-height: 1.6;
  font-weight: 600;
}

.action-hint.disabled {
  background: #fff8e6;
  color: #8a6116;
  border-color: #f2dfb0;
}

.status-ready {
  background: #ecfdf3;
  color: #15803d;
  border-color: #bbf7d0;
}

.status-deposited {
  background: #f5f3ff;
  color: #6d28d9;
  border-color: #ddd6fe;
}

.status-sold {
  background: #f3f4f6;
  color: #374151;
  border-color: #d1d5db;
}

.status-stop {
  background: #fef2f2;
  color: #b91c1c;
  border-color: #fecaca;
}

.status-default {
  background: #f8fafc;
  color: #475569;
  border-color: #e2e8f0;
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

.disabled-btn,
.disabled-btn:hover {
  background: linear-gradient(135deg, #d1d5db, #9ca3af);
  color: #ffffff;
  cursor: not-allowed;
  box-shadow: none;
  filter: none;
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

.vaccine-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.vaccine-card {
  background: #fcf9ff;
  border: 1px solid #eadcf7;
  border-radius: 14px;
  padding: 12px 14px;
  width: 100%;
}

.vaccine-name {
  color: #2f1b44;
  font-weight: 800;
  margin-bottom: 4px;
}

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

  .title-status-row {
    flex-direction: column;
    align-items: flex-start;
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

  .buy-btn {
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
}

.related-status-badge.status-ready {
  background: #16a34a;
  color: #fff;
  border: none;
}

.related-status-badge.status-deposited {
  background: #7c3aed;
  color: #fff;
  border: none;
}

.related-status-badge.status-sold {
  background: #6b7280;
  color: #fff;
  border: none;
}

.related-status-badge.status-stop {
  background: #dc2626;
  color: #fff;
  border: none;
}

.related-status-badge.status-default {
  background: #64748b;
  color: #fff;
  border: none;
}
</style>