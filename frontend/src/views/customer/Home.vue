<template>
  <div class="home-page pb-5" style="background-color: #fcf9ff; min-height: 100vh;">
    <div class="jumbotron jumbotron-fluid text-white text-center shadow-sm position-relative overflow-hidden mb-5" style="background: linear-gradient(135deg, #6a1b9a, #9c27b0); padding: 4rem 2rem;">
      <div class="container position-relative" style="z-index: 2;">
        <h1 class="display-4 font-weight-bold animate__animated animate__fadeInDown">
          <i class="fas fa-paw mr-3 text-warning"></i> THẾ GIỚI THÚ CƯNG
        </h1>
        <p class="lead animate__animated animate__fadeInUp animate__delay-1s text-light">
          Chọn ngay một người bạn bốn chân siêu đáng yêu về nhà nào!
        </p>
      </div>
    </div>

    <div class="container custom-container">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h4 class="font-weight-bold mb-0" style="color: #6a1b9a; text-transform: uppercase;">
          THÚ CƯNG NỔI BẬT
        </h4>
        <div class="text-muted font-italic">Đang có {{ availableDogs.length }} bé trên sàn</div>
      </div>

      <div class="dog-grid">
        <div v-for="dog in availableDogs" :key="dog.id || dog._id" class="pet-card-wrapper animate__animated animate__fadeInUp">
          <div class="pet-card shadow-sm bg-white" @click="viewDetail(dog.id || dog._id)">
            
            <div class="pet-image-container">
              <img :src="dog.image ? 'http://localhost:3000' + dog.image : 'https://via.placeholder.com/300'" class="pet-image" alt="Hình thú cưng">
              
              <div v-if="['Chờ thanh toán', 'Đã đặt cọc', 'Đang giao'].includes(dog.status)" 
                   class="position-absolute d-flex justify-content-center align-items-center w-100 h-100 p-2"
                   style="top: 0; left: 0; background: rgba(255,255,255,0.65); z-index: 15;">
                  <span class="text-warning font-weight-bold border border-warning rounded px-2 py-2 shadow-sm text-center bg-white" 
                        style="font-size: 1.1rem; transform: rotate(-10deg); border-width: 3px !important;">
                     ĐANG TRONG QUÁ TRÌNH<br>MUA BÁN
                  </span>
              </div>

              <div v-if="dog.status === 'Đã bán'" 
                   class="position-absolute d-flex justify-content-center align-items-center w-100 h-100"
                   style="top: 0; left: 0; background: rgba(0,0,0,0.6); z-index: 15;">
                  <span class="text-white font-weight-bold border border-white rounded px-4 py-2 shadow-lg" 
                        style="font-size: 1.5rem; transform: rotate(-15deg); border-width: 4px !important; letter-spacing: 2px;">
                     ĐÃ BÁN
                  </span>
              </div>
              
              <div class="image-overlay" :style="(dog.status !== 'Đã duyệt') ? 'z-index: 20;' : ''">
                <button class="btn font-weight-bold rounded-pill px-4 shadow-sm" 
                        :class="(dog.status !== 'Đã duyệt') ? 'btn-light text-dark border' : 'btn-warning'">
                  {{ (dog.status === 'Đã bán') ? 'XEM LẠI BÉ' : 'XEM CHI TIẾT' }}
                </button>
              </div>
            </div>

            <div class="pet-info p-3 text-center border-top">
              <h5 class="pet-name font-weight-bold text-dark text-truncate mb-1" :title="dog.name">
                {{ dog.name }}
              </h5>
              <div class="pet-price font-weight-bold text-danger mt-2">
                {{ dog.price?.toLocaleString('vi-VN') }} <span class="small text-muted">VNĐ</span>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      <div v-if="availableDogs.length === 0" class="text-center py-5 w-100">
        <i class="fas fa-box-open fa-4x text-muted mb-3 opacity-50"></i>
        <h5 class="text-muted">Hiện tại không có bé cún nào để hiển thị.</h5>
      </div>

    </div>
  </div>
</template>

<script>
import DogService from "@/services/dog.service";

export default {
  data() {
    return {
      allDogs: [],
    };
  },
  computed: {
    // 👉 PHỄU LỌC: Cho phép 5 trạng thái xuất hiện trên trang chủ
    availableDogs() {
      const showStatus = ['Đã duyệt', 'Chờ thanh toán', 'Đã đặt cọc', 'Đang giao', 'Đã bán'];
      return this.allDogs.filter(dog => showStatus.includes(dog.status));
    }
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
      this.$router.push({ name: 'DogDetail', params: { id: id } });
    }
  }
};
</script>

<style scoped>
@media (min-width: 1200px) {
  .custom-container { max-width: 1200px !important; }
}

/* CSS GRID CHIA 5 CỘT */
.dog-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr); 
  gap: 1.2rem; 
}

/* Responsive */
@media (max-width: 1200px) { .dog-grid { grid-template-columns: repeat(4, 1fr); } }
@media (max-width: 992px) { .dog-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 768px) { .dog-grid { grid-template-columns: repeat(2, 1fr); gap: 1rem; } }

/* Card Style */
.pet-card {
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
  position: relative;
}

.pet-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(106, 27, 154, 0.15) !important;
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
  top: 0; left: 0; width: 100%; height: 100%;
  object-fit: cover; 
  transition: transform 0.5s ease;
}

.pet-card:hover .pet-image {
  transform: scale(1.08);
}

/* Hover Overlay */
.image-overlay {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.pet-card:hover .image-overlay {
  opacity: 1;
}

.pet-name { font-size: 1.05rem; letter-spacing: 0.3px; }
.pet-price { font-size: 1.1rem; }
</style>