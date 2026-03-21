<template>
  <div class="card shadow-sm border-0 animate__animated animate__fadeIn">
    <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
      <h5 class="mb-0 text-primary font-weight-bold">
        <i class="fas fa-paw mr-2"></i> QUẢN LÝ & PHÊ DUYỆT THÚ CƯNG
      </h5>
    </div>

    <div class="card-body p-4">
      <div class="row mb-4">
        <div class="col-md-5">
          <div class="input-group shadow-sm">
            <input type="text" class="form-control border-right-0" placeholder="Tìm kiếm tên chó..." v-model="searchText">
            <div class="input-group-append">
              <button class="btn btn-primary px-3" type="button"><i class="fas fa-search"></i></button>
            </div>
          </div>
        </div>
        <div class="col-md-7 text-right">
          <div class="btn-group shadow-sm">
            <button class="btn font-weight-bold" :class="filterStatus === 'Tất cả' ? 'btn-secondary' : 'btn-outline-secondary'" @click="filterStatus = 'Tất cả'">Tất cả</button>
            <button class="btn font-weight-bold" :class="filterStatus === 'Chờ duyệt' ? 'btn-warning text-dark' : 'btn-outline-warning text-dark'" @click="filterStatus = 'Chờ duyệt'">Chờ duyệt</button>
            <button class="btn font-weight-bold" :class="filterStatus === 'Đã duyệt' ? 'btn-success' : 'btn-outline-success'" @click="filterStatus = 'Đã duyệt'">Đã duyệt</button>
            <button class="btn font-weight-bold" :class="filterStatus === 'Từ chối' ? 'btn-danger' : 'btn-outline-danger'" @click="filterStatus = 'Từ chối'">Từ chối</button>
          </div>
        </div>
      </div>

      <div class="table-responsive mt-3">
        <table class="table table-bordered table-hover mb-0 text-center align-middle">
          
          <thead class="bg-light text-secondary">
            <tr class="text-uppercase font-weight-bold" style="font-size: 0.85rem;">
              <th style="width: 5%;">STT</th>
              <th style="width: 10%;">Hình ảnh</th>
              <th style="width: 10%;">Mã chó</th> 
              <th style="width: 15%;" class="text-left">Tên chó</th>
              <th style="width: 12%;">Giống chó</th>
              <th style="width: 11%;">Ngày sinh</th> 
              <th style="width: 12%;">Giá (VNĐ)</th>
              <th style="width: 10%;">Trạng thái</th>
              <th style="width: 15%;">Thao tác</th> 
            </tr>
          </thead>
          
          <tbody>
            <tr v-for="(dog, index) in filteredDogs" :key="dog._id || dog.id" class="align-middle">
              <td>{{ index + 1 }}</td>
              <td>
                <img :src="dog.image ? 'http://localhost:3000' + dog.image : 'https://via.placeholder.com/60?text=No+Img'" 
                     class="img-thumbnail rounded-circle object-fit-cover shadow-sm" style="width: 50px; height: 50px;">
              </td>
              <td class="font-weight-bold text-primary">{{ dog.maCho || '---' }}</td>
              <td class="font-weight-bold text-dark text-left">{{ dog.name }}</td>
              <td class="text-info font-weight-bold">{{ dog.breedId?.name || '---' }}</td>
              
              <td class="text-primary font-weight-bold">{{ formatDate(dog.birthDate) }}</td> 
              <td class="text-danger font-weight-bold">{{ dog.price?.toLocaleString('vi-VN') }}</td>
              
              <td>
                <span :class="getStatusClass(dog.status)" class="badge px-3 py-2 shadow-sm mb-1">
                  {{ dog.status }}
                </span>
                <div v-if="dog.status === 'Từ chối' && dog.rejectionReason" class="text-danger small font-italic mt-1" style="line-height: 1.2;">
                  Lý do: {{ dog.rejectionReason }}
                </div>
              </td>
              
              <td>
                <div class="d-flex justify-content-center align-items-center">
                  <button class="btn btn-sm btn-info shadow-sm font-weight-bold px-3 mr-1" @click="viewDetail(dog)" title="Xem chi tiết">
                    <i class="fas fa-eye mr-1"></i> Xem chi tiết
                  </button>

                  <template v-if="dog.status === 'Đã duyệt'">
                    <button class="btn btn-sm btn-outline-danger shadow-sm" @click="updateDogStatus(dog._id || dog.id, 'Từ chối')" title="Phát hiện sai sót, gỡ khỏi trang chủ">
                      <i class="fas fa-ban"></i> Gỡ
                    </button>
                  </template>
                </div>
              </td>
            </tr>
            <tr v-if="filteredDogs.length === 0">
              <td colspan="9" class="py-5 text-center text-muted">
                <i class="fas fa-folder-open fa-2x mb-2 opacity-50"></i><br> Không có dữ liệu cần duyệt.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="showDetailModal" class="modal fade show" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-lg border-0 modal-dialog-centered">
        <div class="modal-content shadow-lg border-0" v-if="selectedDog">
          
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title font-weight-bold"><i class="fas fa-notes-medical mr-2"></i> CHI TIẾT HỒ SƠ: {{ selectedDog.name }}</h5>
            <button type="button" class="close text-white" @click="closeDetailModal"><span>&times;</span></button>
          </div>
          
          <div class="modal-body p-4">
            <div class="row">
              <div class="col-md-4 text-center border-right">
                <img :src="'http://localhost:3000' + selectedDog.image" class="img-fluid rounded shadow-sm mb-3">
                <h5 class="text-primary font-weight-bold">{{ selectedDog.maCho }}</h5>
                <span class="badge badge-pill badge-light border">{{ selectedDog.breedId?.name }}</span>
                
                <p class="mt-3 mb-0 text-dark small">
                  <i class="fas fa-birthday-cake text-warning mr-1"></i> 
                  <strong>Ngày sinh:</strong> {{ formatDate(selectedDog.birthDate) }}
                </p>
              </div>
              
              <div class="col-md-8 pl-md-4">
                <h6 class="font-weight-bold text-success border-bottom pb-2">THÔNG SỐ SỨC KHỎE</h6>
                <div class="row mt-3">
                  <div class="col-6 mb-3">
                    <small class="text-muted d-block">Cân nặng:</small>
                    <strong class="text-dark">{{ selectedDog.weight || '---' }} kg</strong>
                  </div>
                  <div class="col-6 mb-3">
                    <small class="text-muted d-block">Tình trạng:</small>
                    <span class="badge badge-info px-2">{{ selectedDog.healthStatus || 'Tốt' }}</span>
                  </div>
                  <div class="col-12">
                    <small class="text-muted d-block">Ngày sổ giun gần nhất:</small>
                    <strong class="text-dark">{{ formatDate(selectedDog.lastDeworming) || 'Chưa cập nhật' }}</strong>
                  </div>
                </div>

                <h6 class="font-weight-bold text-success border-bottom pb-2 mt-4">LỊCH SỬ TIÊM CHỦNG</h6>
                <div class="table-responsive">
                  <table class="table table-sm table-hover mt-2 border">
                    <thead class="bg-light small">
                      <tr>
                        <th>Loại Vaccine</th>
                        <th>Ngày tiêm</th>
                        <th>Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody class="small text-center">
                      <tr v-for="(v, i) in selectedDog.healthRecord" :key="i">
                        <td class="font-weight-bold text-primary">{{ v.vaccineId?.name || '---' }}</td>
                        <td>{{ formatDate(v.dateInjected) }}</td>
                        <td class="text-muted font-italic">{{ v.note || 'Không có' }}</td>
                      </tr>
                      <tr v-if="!selectedDog.healthRecord || selectedDog.healthRecord.length === 0">
                        <td colspan="3" class="text-center py-3 text-muted">Chưa có lịch sử tiêm chủng</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          
          <div class="modal-footer bg-light d-flex justify-content-between">
            <button type="button" class="btn btn-secondary font-weight-bold" @click="closeDetailModal">ĐÓNG</button>
            
            <div v-if="selectedDog && selectedDog.status === 'Chờ duyệt'">
              <button class="btn btn-outline-danger font-weight-bold mr-2 shadow-sm" @click="updateDogStatus(selectedDog._id || selectedDog.id, 'Từ chối')">
                <i class="fas fa-times mr-1"></i> TỪ CHỐI
              </button>
              <button class="btn btn-success font-weight-bold shadow-sm px-4" @click="updateDogStatus(selectedDog._id || selectedDog.id, 'Đã duyệt')">
                <i class="fas fa-check mr-1"></i> PHÊ DUYỆT LÊN SÀN
              </button>
            </div>
            <div v-else class="text-muted font-italic font-weight-bold">
              <i class="fas fa-check-double mr-1 text-success"></i> Đã xử lý
            </div>
          </div>
          
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DogService from "@/services/dog.service";

export default {
  data() {
    return {
      dogs: [],
      searchText: "",
      filterStatus: "Chờ duyệt",
      selectedDog: null,
      showDetailModal: false 
    };
  },
  computed: {
    filteredDogs() {
      let result = this.dogs;
      
      if (this.filterStatus === 'Tất cả') {
        result = result.filter(dog => ['Chờ duyệt', 'Đã duyệt', 'Từ chối'].includes(dog.status));
      } else {
        result = result.filter(dog => dog.status === this.filterStatus);
      }
      
      if (this.searchText) {
        const term = this.searchText.toLowerCase();
        result = result.filter(dog => 
          dog.name.toLowerCase().includes(term) || 
          (dog.maCho && dog.maCho.toLowerCase().includes(term))
        );
      }
      return result;
    }
  },
  methods: {
    async retrieveDogs() {
      try {
        this.dogs = await DogService.getAll();
      } catch (error) {
        console.error("Lỗi lấy danh sách thú cưng:", error);
      }
    },
    
    viewDetail(dog) {
      this.selectedDog = dog;
      this.showDetailModal = true;
    },

    closeDetailModal() {
      this.showDetailModal = false;
      this.selectedDog = null;
    },

    formatDate(date) {
      if (!date) return "---";
      return new Date(date).toLocaleDateString('vi-VN');
    },

async updateDogStatus(id, newStatus) {
  let dataToUpdate = { status: newStatus };

  if (newStatus === "Từ chối") {
    const reason = prompt("Vui lòng nhập lý do từ chối hồ sơ này (bắt buộc):");
    if (reason === null) return;
    if (reason.trim() === "") {
      alert("❌ Bạn phải nhập lý do cụ thể!");
      return;
    }
    dataToUpdate.rejectionReason = reason;
  } else {
    if (!confirm("Bạn có chắc chắn muốn phê duyệt bé chó này lên sàn?")) return;
  }

  try {
    await DogService.updateStatus(id, dataToUpdate);
    alert("✅ Đã xử lý thành công!");
    this.retrieveDogs();
    this.closeDetailModal();
  } catch (error) {
    alert("❌ Lỗi: " + (error.response?.data?.message || "Không thể xử lý"));
  }
},

    getStatusClass(status) {
      if (status === 'Chờ duyệt') return 'badge-warning text-dark';
      if (status === 'Đã duyệt') return 'badge-success';
      if (status === 'Từ chối') return 'badge-danger';
      return 'badge-secondary';
    }
  },
  mounted() {
    this.retrieveDogs();
  }
};
</script>

<style scoped>
.object-fit-cover { object-fit: cover; }
</style>