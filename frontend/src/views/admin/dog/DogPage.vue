<template>
  <div class="card shadow-sm border-0 animate__animated animate__fadeIn">
    <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
      <h5 class="mb-0 text-primary font-weight-bold">
        <i class="fas fa-paw mr-2"></i> QUẢN LÝ & PHÊ DUYỆT HỒ SƠ CHÓ
      </h5>
    </div>

    <div class="card-body p-4">
      <div class="row mb-4">
        <div class="col-md-5">
          <div class="input-group shadow-sm">
            <input
              type="text"
              class="form-control border-right-0"
              placeholder="Tìm kiếm tên chó hoặc mã chó..."
              v-model="searchText"
            />
            <div class="input-group-append">
              <button class="btn btn-primary px-3" type="button">
                <i class="fas fa-search"></i>
              </button>
            </div>
          </div>
        </div>

        <div class="col-md-7 text-right">
          <div class="btn-group shadow-sm flex-wrap">
            <button
              class="btn font-weight-bold"
              :class="filterApprovalStatus === 'Tất cả' ? 'btn-secondary' : 'btn-outline-secondary'"
              @click="filterApprovalStatus = 'Tất cả'"
            >
              Tất cả
            </button>
            <button
              class="btn font-weight-bold"
              :class="filterApprovalStatus === 'Chờ duyệt' ? 'btn-warning text-dark' : 'btn-outline-warning text-dark'"
              @click="filterApprovalStatus = 'Chờ duyệt'"
            >
              Chờ duyệt
            </button>
            <button
              class="btn font-weight-bold"
              :class="filterApprovalStatus === 'Đã duyệt' ? 'btn-success' : 'btn-outline-success'"
              @click="filterApprovalStatus = 'Đã duyệt'"
            >
              Đã duyệt
            </button>
            <button
              class="btn font-weight-bold"
              :class="filterApprovalStatus === 'Từ chối' ? 'btn-danger' : 'btn-outline-danger'"
              @click="filterApprovalStatus = 'Từ chối'"
            >
              Từ chối
            </button>
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
              <th style="width: 10%;">Duyệt hồ sơ</th>
              <th style="width: 10%;">Mở bán</th>
              <th style="width: 15%;">Thao tác</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(dog, index) in filteredDogs" :key="dog._id || dog.id" class="align-middle">
              <td>{{ index + 1 }}</td>

              <td>
                <img
                  :src="dog.image ? 'http://localhost:3000' + dog.image : 'https://via.placeholder.com/60?text=No+Img'"
                  class="img-thumbnail rounded-circle object-fit-cover shadow-sm"
                  style="width: 50px; height: 50px;"
                />
              </td>

              <td class="font-weight-bold text-primary">{{ dog.maCho || '---' }}</td>
              <td class="font-weight-bold text-dark text-left">{{ dog.name }}</td>
              <td class="text-info font-weight-bold">{{ dog.breedId?.name || '---' }}</td>
              <td class="text-primary font-weight-bold">{{ formatDate(dog.birthDate) }}</td>
              <td class="text-danger font-weight-bold">{{ formatCurrency(dog.price) }}</td>

              <td>
                <span :class="getApprovalStatusClass(dog.approvalStatus)" class="badge px-3 py-2 shadow-sm mb-1">
                  {{ dog.approvalStatus }}
                </span>
                <div
                  v-if="dog.approvalStatus === 'Từ chối' && dog.rejectionReason"
                  class="text-danger small font-italic mt-1"
                  style="line-height: 1.2;"
                >
                  Lý do: {{ dog.rejectionReason }}
                </div>
              </td>

              <td>
                <span :class="getSaleStatusClass(dog.saleStatus)" class="badge px-3 py-2 shadow-sm">
                  {{ dog.saleStatus }}
                </span>
              </td>

              <td>
                <div class="d-flex justify-content-center align-items-center flex-wrap">
                  <button
                    class="btn btn-sm btn-info shadow-sm font-weight-bold px-3 mr-1 mb-1"
                    @click="viewDetail(dog)"
                    title="Xem chi tiết"
                  >
                    <i class="fas fa-eye mr-1"></i> Xem
                  </button>

                  <template v-if="dog.approvalStatus === 'Đã duyệt' && dog.saleStatus === 'Chưa mở bán'">
                    <button
                      class="btn btn-sm btn-success shadow-sm font-weight-bold px-3 mb-1"
                      @click="updateSaleStatus(dog._id || dog.id, 'Sẵn sàng bán')"
                    >
                      <i class="fas fa-store mr-1"></i> Mở bán
                    </button>
                  </template>

                  <template v-if="dog.approvalStatus === 'Đã duyệt' && dog.saleStatus === 'Sẵn sàng bán'">
                    <button
                      class="btn btn-sm btn-outline-danger shadow-sm font-weight-bold px-3 mb-1"
                      @click="updateSaleStatus(dog._id || dog.id, 'Ngừng bán')"
                    >
                      <i class="fas fa-ban mr-1"></i> Ngừng bán
                    </button>
                  </template>
                </div>
              </td>
            </tr>

            <tr v-if="filteredDogs.length === 0">
              <td colspan="10" class="py-5 text-center text-muted">
                <i class="fas fa-folder-open fa-2x mb-2 opacity-50"></i><br />
                Không có dữ liệu phù hợp.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div
      v-if="showDetailModal"
      class="modal fade show"
      tabindex="-1"
      style="display: block; background: rgba(0,0,0,0.5);"
    >
      <div class="modal-dialog modal-lg border-0 modal-dialog-centered">
        <div class="modal-content shadow-lg border-0" v-if="selectedDog">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title font-weight-bold">
              <i class="fas fa-notes-medical mr-2"></i>
              CHI TIẾT HỒ SƠ: {{ selectedDog.name }}
            </h5>
            <button type="button" class="close text-white" @click="closeDetailModal">
              <span>&times;</span>
            </button>
          </div>

          <div class="modal-body p-4">
            <div class="row">
              <div class="col-md-4 text-center border-right">
                <img
                  :src="'http://localhost:3000' + selectedDog.image"
                  class="img-fluid rounded shadow-sm mb-3"
                />
                <h5 class="text-primary font-weight-bold">{{ selectedDog.maCho }}</h5>
                <span class="badge badge-pill badge-light border">
                  {{ selectedDog.breedId?.name }}
                </span>

                <p class="mt-3 mb-0 text-dark small">
                  <i class="fas fa-birthday-cake text-warning mr-1"></i>
                  <strong>Ngày sinh:</strong> {{ formatDate(selectedDog.birthDate) }}
                </p>
              </div>

              <div class="col-md-8 pl-md-4">
                <h6 class="font-weight-bold text-success border-bottom pb-2">THÔNG TIN SỨC KHỎE TÓM TẮT</h6>
                <div class="row mt-3">
                  <div class="col-6 mb-3">
                    <small class="text-muted d-block">Cân nặng:</small>
                    <strong class="text-dark">{{ selectedDog.weight || '---' }} kg</strong>
                  </div>
                  <div class="col-6 mb-3">
                    <small class="text-muted d-block">Tình trạng:</small>
                    <span class="badge badge-info px-2">{{ selectedDog.healthStatus || 'Tốt' }}</span>
                  </div>
                  <div class="col-6 mb-3">
                    <small class="text-muted d-block">Tẩy giun gần nhất:</small>
                    <strong class="text-dark">{{ formatDate(selectedDog.lastDeworming) }}</strong>
                  </div>
                  <div class="col-6 mb-3">
                    <small class="text-muted d-block">Nguồn gốc:</small>
                    <strong :class="selectedDog.sourceVerified ? 'text-success' : 'text-warning'">
                      {{ selectedDog.sourceVerified ? 'Đã xác minh' : 'Chưa xác minh' }}
                    </strong>
                  </div>
                  <div class="col-6 mb-3">
                    <small class="text-muted d-block">Điều kiện bán:</small>
                    <strong :class="selectedDog.eligibleForSale ? 'text-success' : 'text-warning'">
                      {{ selectedDog.eligibleForSale ? 'Đủ điều kiện' : 'Chưa đủ điều kiện' }}
                    </strong>
                  </div>
                  <div class="col-6 mb-3">
                    <small class="text-muted d-block">Mở bán:</small>
                    <strong class="text-dark">{{ selectedDog.saleStatus || '---' }}</strong>
                  </div>
                </div>

                <h6 class="font-weight-bold text-success border-bottom pb-2 mt-3">MÔ TẢ</h6>
                <p class="mt-3 mb-0 text-muted">
                  {{ selectedDog.description || "Chưa có mô tả." }}
                </p>
              </div>
            </div>
          </div>

          <div class="modal-footer bg-light d-flex justify-content-between">
            <button
              type="button"
              class="btn btn-secondary font-weight-bold"
              @click="closeDetailModal"
            >
              ĐÓNG
            </button>

            <div v-if="selectedDog && selectedDog.approvalStatus === 'Chờ duyệt'">
              <button
                class="btn btn-outline-danger font-weight-bold mr-2 shadow-sm"
                @click="rejectDog(selectedDog._id || selectedDog.id)"
              >
                <i class="fas fa-times mr-1"></i> TỪ CHỐI
              </button>

              <button
                class="btn btn-success font-weight-bold shadow-sm px-4"
                @click="approveDog(selectedDog._id || selectedDog.id)"
              >
                <i class="fas fa-check mr-1"></i> PHÊ DUYỆT HỒ SƠ
              </button>
            </div>

            <div
              v-else-if="selectedDog && selectedDog.approvalStatus === 'Đã duyệt' && selectedDog.saleStatus === 'Chưa mở bán'"
            >
              <button
                class="btn btn-success font-weight-bold shadow-sm px-4"
                @click="updateSaleStatus(selectedDog._id || selectedDog.id, 'Sẵn sàng bán')"
              >
                <i class="fas fa-store mr-1"></i> MỞ BÁN
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
  name: "AdminDogPage",

  data() {
    return {
      dogs: [],
      searchText: "",
      filterApprovalStatus: "Chờ duyệt",
      selectedDog: null,
      showDetailModal: false,
    };
  },

  computed: {
    filteredDogs() {
      let result = this.dogs;

      if (this.filterApprovalStatus === "Tất cả") {
        result = result.filter((dog) =>
          ["Chờ duyệt", "Đã duyệt", "Từ chối"].includes(dog.approvalStatus)
        );
      } else {
        result = result.filter((dog) => dog.approvalStatus === this.filterApprovalStatus);
      }

      if (this.searchText) {
        const term = this.searchText.toLowerCase();
        result = result.filter(
          (dog) =>
            dog.name?.toLowerCase().includes(term) ||
            dog.maCho?.toLowerCase().includes(term)
        );
      }

      return result;
    },
  },

  methods: {
    async retrieveDogs() {
      try {
        this.dogs = await DogService.getAll();
      } catch (error) {
        console.error("Lỗi lấy danh sách chó:", error);
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
      return new Date(date).toLocaleDateString("vi-VN");
    },

    formatCurrency(value) {
      if (value === null || value === undefined) return "---";
      return Number(value).toLocaleString("vi-VN");
    },

    async approveDog(id) {
      if (!confirm("Bạn có chắc chắn muốn phê duyệt hồ sơ chó này không?")) return;

      try {
        await DogService.updateApprovalStatus(id, {
          approvalStatus: "Đã duyệt",
          sourceVerified: true,
          eligibleForSale: true,
        });

        alert("✅ Đã phê duyệt hồ sơ thành công!");
        await this.retrieveDogs();
        this.closeDetailModal();
      } catch (error) {
        alert("❌ Lỗi: " + (error.response?.data?.message || "Không thể xử lý"));
      }
    },

    async rejectDog(id) {
      const reason = prompt("Vui lòng nhập lý do từ chối hồ sơ này (bắt buộc):");
      if (reason === null) return;
      if (reason.trim() === "") {
        alert("❌ Bạn phải nhập lý do cụ thể!");
        return;
      }

      try {
        await DogService.updateApprovalStatus(id, {
          approvalStatus: "Từ chối",
          rejectionReason: reason.trim(),
        });

        alert("✅ Đã từ chối hồ sơ thành công!");
        await this.retrieveDogs();
        this.closeDetailModal();
      } catch (error) {
        alert("❌ Lỗi: " + (error.response?.data?.message || "Không thể xử lý"));
      }
    },

    async updateSaleStatus(id, saleStatus) {
      const confirmText =
        saleStatus === "Sẵn sàng bán"
          ? "Bạn có chắc chắn muốn mở bán bé chó này không?"
          : "Bạn có chắc chắn muốn cập nhật trạng thái bán?";

      if (!confirm(confirmText)) return;

      try {
        await DogService.updateSaleStatus(id, { saleStatus });
        alert("✅ Cập nhật trạng thái bán thành công!");
        await this.retrieveDogs();
        this.closeDetailModal();
      } catch (error) {
        alert("❌ Lỗi: " + (error.response?.data?.message || "Không thể xử lý"));
      }
    },

    getApprovalStatusClass(status) {
      if (status === "Chờ duyệt") return "badge-warning text-dark";
      if (status === "Đã duyệt") return "badge-success";
      if (status === "Từ chối") return "badge-danger";
      return "badge-secondary";
    },

    getSaleStatusClass(status) {
      if (status === "Sẵn sàng bán") return "badge-success";
      if (status === "Chưa mở bán") return "badge-secondary";
      if (status === "Chờ thanh toán") return "badge-info text-dark";
      if (status === "Đã đặt cọc") return "badge-primary";
      if (status === "Đang giao") return "badge-dark";
      if (status === "Đã bán") return "badge-dark";
      if (status === "Ngừng bán") return "badge-danger";
      return "badge-light border";
    },
  },

  mounted() {
    this.retrieveDogs();
  },
};
</script>

<style scoped>
.object-fit-cover {
  object-fit: cover;
}
</style>