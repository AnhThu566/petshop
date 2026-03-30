<template>
  <div class="farm-transactions-page bg-light py-4" style="min-height: 100vh;">
    <div class="container-fluid">
      <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3 flex-wrap">
        <h4 class="font-weight-bold text-dark mb-2">
          <i class="fas fa-exchange-alt text-primary mr-2"></i>
          THEO DÕI GIAO DỊCH CỦA TRẠI
        </h4>

        <div>
          <button class="btn btn-outline-primary btn-sm" @click="fetchMyDogs">
            <i class="fas fa-sync-alt mr-1"></i> Làm mới
          </button>
        </div>
      </div>

      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body py-3">
          <div class="row align-items-center">
            <div class="col-md-4 mb-2 mb-md-0">
              <div class="input-group input-group-sm">
                <div class="input-group-prepend">
                  <span class="input-group-text bg-white">
                    <i class="fas fa-search text-primary"></i>
                  </span>
                </div>
                <input
                  type="text"
                  class="form-control"
                  placeholder="Tìm tên chó hoặc mã chó..."
                  v-model="searchText"
                />
              </div>
            </div>

            <div class="col-md-8 text-md-right">
              <div class="btn-group flex-wrap">
                <button
                  class="btn btn-sm"
                  :class="statusFilter === 'Tất cả' ? 'btn-dark' : 'btn-light'"
                  @click="statusFilter = 'Tất cả'"
                >
                  Tất cả
                </button>
                <button
                  class="btn btn-sm"
                  :class="statusFilter === 'Chờ thanh toán' ? 'btn-info text-dark' : 'btn-light'"
                  @click="statusFilter = 'Chờ thanh toán'"
                >
                  Chờ thanh toán
                </button>
                <button
                  class="btn btn-sm"
                  :class="statusFilter === 'Đã đặt cọc' ? 'btn-primary text-white' : 'btn-light'"
                  @click="statusFilter = 'Đã đặt cọc'"
                >
                  Đã đặt cọc
                </button>
                <button
                  class="btn btn-sm"
                  :class="statusFilter === 'Đang giao' ? 'btn-secondary text-white' : 'btn-light'"
                  @click="statusFilter = 'Đang giao'"
                >
                  Đang giao
                </button>
                <button
                  class="btn btn-sm"
                  :class="statusFilter === 'Đã bán' ? 'btn-success text-white' : 'btn-light'"
                  @click="statusFilter = 'Đã bán'"
                >
                  Đã bán
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- thống kê nhanh -->
      <div class="row mb-4">
        <div class="col-md-3 mb-3">
          <div class="card border-0 shadow-sm text-center py-3">
            <div class="small text-muted">Chờ thanh toán</div>
            <h4 class="font-weight-bold text-info mb-0">{{ stats.pendingPayment }}</h4>
          </div>
        </div>

        <div class="col-md-3 mb-3">
          <div class="card border-0 shadow-sm text-center py-3">
            <div class="small text-muted">Đã đặt cọc</div>
            <h4 class="font-weight-bold text-primary mb-0">{{ stats.deposited }}</h4>
          </div>
        </div>

        <div class="col-md-3 mb-3">
          <div class="card border-0 shadow-sm text-center py-3">
            <div class="small text-muted">Đang giao</div>
            <h4 class="font-weight-bold text-secondary mb-0">{{ stats.shipping }}</h4>
          </div>
        </div>

        <div class="col-md-3 mb-3">
          <div class="card border-0 shadow-sm text-center py-3">
            <div class="small text-muted">Đã bán</div>
            <h4 class="font-weight-bold text-success mb-0">{{ stats.sold }}</h4>
          </div>
        </div>
      </div>

      <div class="card border-0 shadow-sm" v-if="filteredDogs.length > 0">
        <div class="table-responsive">
          <table class="table table-hover align-middle text-center mb-0">
            <thead class="bg-light">
              <tr class="small text-secondary">
                <th class="py-3">Ảnh</th>
                <th class="py-3">Mã chó</th>
                <th class="py-3">Tên</th>
                <th class="py-3">Giống</th>
                <th class="py-3">Giá</th>
                <th class="py-3">Trạng thái giao dịch</th>
                <th class="py-3">Ngày đăng</th>
                <th class="py-3">Xem</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="dog in filteredDogs" :key="dog._id || dog.id">
                <td>
                  <img
                    :src="getDogImage(dog)"
                    alt="dog"
                    style="width: 64px; height: 64px; object-fit: cover; border-radius: 8px;"
                  />
                </td>

                <td class="font-weight-bold text-primary">
                  {{ dog.maCho || "---" }}
                </td>

                <td class="font-weight-bold text-dark">
                  {{ dog.name }}
                </td>

                <td>
                  {{ dog.breedId?.name || "---" }}
                </td>

                <td class="text-danger font-weight-bold">
                  {{ formatCurrency(dog.price) }}
                </td>

                <td>
                  <span class="badge px-3 py-2" :class="getStatusClass(dog.status)">
                    {{ dog.status }}
                  </span>
                </td>

                <td>
                  {{ formatDateOnly(dog.createdAt) }}
                </td>

                <td>
                  <button
                    class="btn btn-sm btn-outline-secondary"
                    @click="openDetailModal(dog)"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-else class="card border-0 shadow-sm">
        <div class="card-body text-center py-5 text-muted">
          <i class="fas fa-exchange-alt fa-3x mb-3 d-block"></i>
          Hiện chưa có chó nào đang trong giao dịch hoặc đã bán.
        </div>
      </div>

      <!-- modal chi tiết -->
      <div
        v-if="selectedDog"
        class="modal fade show d-block"
        tabindex="-1"
        style="background: rgba(0,0,0,0.45);"
      >
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content border-0 shadow">
            <div class="modal-header bg-dark text-white">
              <h5 class="modal-title mb-0">
                <i class="fas fa-dog mr-2"></i>Chi tiết giao dịch của bé chó
              </h5>
              <button type="button" class="close text-white" @click="closeDetailModal">
                <span>&times;</span>
              </button>
            </div>

            <div class="modal-body">
              <div class="row">
                <div class="col-md-4 text-center mb-3">
                  <img
                    :src="getDogImage(selectedDog)"
                    class="img-fluid rounded shadow-sm"
                    alt="dog"
                    style="max-height: 250px; object-fit: cover;"
                  />
                </div>

                <div class="col-md-8">
                  <h5 class="font-weight-bold">{{ selectedDog.name }}</h5>
                  <p class="mb-1"><strong>Mã chó:</strong> {{ selectedDog.maCho || "---" }}</p>
                  <p class="mb-1"><strong>Trạng thái:</strong> {{ selectedDog.status || "---" }}</p>
                  <p class="mb-1"><strong>Giống:</strong> {{ selectedDog.breedId?.name || "---" }}</p>
                  <p class="mb-1"><strong>Giá:</strong> {{ formatCurrency(selectedDog.price) }}</p>
                  <p class="mb-1"><strong>Ngày sinh:</strong> {{ formatDateOnly(selectedDog.birthDate) }}</p>
                  <p class="mb-1"><strong>Tình trạng sức khỏe:</strong> {{ selectedDog.healthStatus || "---" }}</p>
                  <p class="mb-1"><strong>Mô tả:</strong> {{ selectedDog.description || "---" }}</p>
                  <p class="mb-1"><strong>Ngày đăng:</strong> {{ formatDateTime(selectedDog.createdAt) }}</p>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn btn-secondary" @click="closeDetailModal">Đóng</button>
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
      currentFarm: null,
      searchText: "",
      statusFilter: "Tất cả",
      selectedDog: null,
    };
  },

  computed: {
    filteredDogs() {
      const transactionStatuses = [
        "Chờ thanh toán",
        "Đã đặt cọc",
        "Đang giao",
        "Đã bán",
      ];

      return this.dogs
        .filter((dog) => transactionStatuses.includes(dog.status))
        .filter((dog) => {
          const keyword = (this.searchText || "").toLowerCase();
          const dogName = dog.name ? dog.name.toLowerCase() : "";
          const dogCode = dog.maCho ? dog.maCho.toLowerCase() : "";

          const matchSearch = dogName.includes(keyword) || dogCode.includes(keyword);
          const matchStatus =
            this.statusFilter === "Tất cả" || dog.status === this.statusFilter;

          return matchSearch && matchStatus;
        });
    },

    stats() {
      return {
        pendingPayment: this.dogs.filter((d) => d.status === "Chờ thanh toán").length,
        deposited: this.dogs.filter((d) => d.status === "Đã đặt cọc").length,
        shipping: this.dogs.filter((d) => d.status === "Đang giao").length,
        sold: this.dogs.filter((d) => d.status === "Đã bán").length,
      };
    },
  },

  methods: {
    async fetchMyDogs() {
      try {
        if (!this.currentFarm) return;

        const allDogs = await DogService.getAll();

        const realFarmId =
          this.currentFarm.farmId ||
          this.currentFarm._id ||
          this.currentFarm.id;

        this.dogs = allDogs.filter((dog) => {
          const dogFarmId =
            dog.farmId?._id ||
            dog.farmId?.id ||
            dog.farmId;

          return String(dogFarmId) === String(realFarmId);
        });
      } catch (error) {
        console.error("Lỗi tải giao dịch chó của trại:", error);
        alert(
          "Không thể tải dữ liệu giao dịch của trại: " +
            (error.response?.data?.message || error.message)
        );
      }
    },

    openDetailModal(dog) {
      this.selectedDog = JSON.parse(JSON.stringify(dog));
    },

    closeDetailModal() {
      this.selectedDog = null;
    },

    getDogImage(dog) {
      if (dog?.image) return "http://localhost:3000" + dog.image;
      return "https://via.placeholder.com/500x350";
    },

    formatCurrency(value) {
      if (value === null || value === undefined) return "---";
      return Number(value).toLocaleString("vi-VN") + " ₫";
    },

    formatDateOnly(date) {
      if (!date) return "---";
      return new Date(date).toLocaleDateString("vi-VN");
    },

    formatDateTime(date) {
      if (!date) return "---";
      return new Date(date).toLocaleString("vi-VN");
    },

    getStatusClass(status) {
      if (status === "Chờ thanh toán") return "badge-info text-dark";
      if (status === "Đã đặt cọc") return "badge-primary";
      if (status === "Đang giao") return "badge-secondary";
      if (status === "Đã bán") return "badge-success";
      return "badge-light border";
    },
  },

  async mounted() {
    const farmData = localStorage.getItem("farm");
    if (!farmData) {
      alert("Vui lòng đăng nhập tài khoản trang trại.");
      this.$router.push("/login");
      return;
    }

    this.currentFarm = JSON.parse(farmData);
    await this.fetchMyDogs();
  },
};
</script>

<style scoped>
.table td,
.table th {
  vertical-align: middle;
}

.modal {
  overflow-y: auto;
}
</style>