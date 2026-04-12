<template>
  <div class="farm-profile-page bg-light py-4" style="min-height: 100vh;">
    <div class="container-fluid">
      <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3 flex-wrap">
        <h4 class="font-weight-bold text-dark mb-2">
          <i class="fas fa-warehouse text-success mr-2"></i>
          THÔNG TIN TRANG TRẠI
        </h4>

        <button class="btn btn-outline-success btn-sm" @click="loadFarmInfo">
          <i class="fas fa-sync-alt mr-1"></i> Làm mới
        </button>
      </div>

      <div v-if="loading" class="card border-0 shadow-sm">
        <div class="card-body text-center py-5 text-muted">
          <i class="fas fa-spinner fa-spin fa-2x mb-3 d-block"></i>
          Đang tải thông tin trang trại...
        </div>
      </div>

      <div v-else-if="!farmInfo" class="card border-0 shadow-sm">
        <div class="card-body text-center py-5 text-muted">
          <i class="fas fa-exclamation-circle fa-3x mb-3 d-block"></i>
          Không tìm thấy thông tin trang trại.
        </div>
      </div>

      <div v-else class="row">
        <div class="col-lg-4 mb-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body text-center">
              <div
                class="mx-auto rounded-circle bg-success text-white d-flex align-items-center justify-content-center shadow-sm mb-3"
                style="width: 110px; height: 110px; font-size: 2rem;"
              >
                <i class="fas fa-warehouse"></i>
              </div>

              <h4 class="font-weight-bold text-dark mb-2">
                {{ farmInfo.name || "Trang trại" }}
              </h4>

              <p class="text-muted mb-3">
                Nhà cung cấp chó cảnh trên hệ thống
              </p>

              <span class="badge badge-success px-3 py-2">
                {{ getFarmStatusText(farmInfo.status) }}
              </span>
            </div>
          </div>
        </div>

        <div class="col-lg-8 mb-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white border-0 pt-4 pb-0">
              <h5 class="font-weight-bold text-success mb-0">
                <i class="fas fa-info-circle mr-2"></i>Thông tin chi tiết
              </h5>
            </div>

            <div class="card-body pt-4">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="small text-muted font-weight-bold">Tên trang trại</label>
                  <div class="border rounded bg-light px-3 py-2 font-weight-bold text-dark">
                    {{ farmInfo.name || "---" }}
                  </div>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="small text-muted font-weight-bold">Số điện thoại</label>
                  <div class="border rounded bg-light px-3 py-2 font-weight-bold text-dark">
                    {{ farmInfo.phone || "---" }}
                  </div>
                </div>

                <div class="col-md-12 mb-3">
                  <label class="small text-muted font-weight-bold">Địa chỉ</label>
                  <div class="border rounded bg-light px-3 py-2 font-weight-bold text-dark">
                    {{ farmInfo.address || "---" }}
                  </div>
                </div>

                <div class="col-md-12 mb-3">
                  <label class="small text-muted font-weight-bold">Mô tả</label>
                  <div class="border rounded bg-light px-3 py-3 text-dark" style="min-height: 120px;">
                    {{ farmInfo.description || "Chưa có mô tả cho trang trại này." }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-4 mb-4">
          <div class="card border-0 shadow-sm text-center py-4">
            <div class="small text-muted">Tổng hồ sơ chó đã cung cấp</div>
            <h3 class="font-weight-bold text-dark mb-0">{{ stats.totalDogs }}</h3>
          </div>
        </div>

        <div class="col-md-4 mb-4">
          <div class="card border-0 shadow-sm text-center py-4">
            <div class="small text-muted">Hồ sơ chờ duyệt</div>
            <h3 class="font-weight-bold text-warning mb-0">{{ stats.pendingDogs }}</h3>
          </div>
        </div>

        <div class="col-md-4 mb-4">
          <div class="card border-0 shadow-sm text-center py-4">
            <div class="small text-muted">Chó đã bán</div>
            <h3 class="font-weight-bold text-success mb-0">{{ stats.soldDogs }}</h3>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DogService from "@/services/dog.service";
import createApiClient from "@/services/api.service";

export default {
  name: "FarmProfilePage",

  data() {
    return {
      currentUser: null,
      farmInfo: null,
      loading: false,
      dogs: [],
    };
  },

  computed: {
    stats() {
      return {
        totalDogs: this.dogs.length,
        pendingDogs: this.dogs.filter((dog) => dog.approvalStatus === "Chờ duyệt").length,
        soldDogs: this.dogs.filter((dog) => dog.saleStatus === "Đã bán").length,
      };
    },
  },

  methods: {
    getFarmStatusText(status) {
      if (status === "active" || !status) return "Đang hoạt động";
      return "Đang cập nhật";
    },

    async loadFarmInfo() {
      try {
        this.loading = true;

        const farmData = localStorage.getItem("farm");
        const userData = localStorage.getItem("user");

        if (userData) {
          this.currentUser = JSON.parse(userData);
        }

        if (farmData) {
          this.farmInfo = JSON.parse(farmData);
        }

        if (!this.farmInfo?.name || !this.farmInfo?.address) {
          const api = createApiClient("/api/farms");
          const farms = await api.get("/");

          const farmList = farms.data || [];
          const currentUserId = this.currentUser?._id || this.currentUser?.id;

          const myFarm = farmList.find((f) => {
            const ownerId = f.ownerId?._id || f.ownerId?.id || f.ownerId;
            const farmId = this.currentUser?.farmId;
            return (
              String(ownerId) === String(currentUserId) ||
              String(f._id || f.id) === String(farmId)
            );
          });

          if (myFarm) {
            this.farmInfo = myFarm;
          }
        }

        await this.loadFarmDogs();
      } catch (error) {
        console.error("Lỗi tải thông tin trang trại:", error);
        alert(
          "Không thể tải thông tin trang trại: " +
            (error.response?.data?.message || error.message)
        );
      } finally {
        this.loading = false;
      }
    },

    async loadFarmDogs() {
      try {
        if (!this.farmInfo) return;

        const allDogs = await DogService.getAll();
        const realFarmId =
          this.farmInfo.farmId ||
          this.farmInfo._id ||
          this.farmInfo.id;

        this.dogs = allDogs.filter((dog) => {
          const dogFarmId =
            dog.farmId?._id ||
            dog.farmId?.id ||
            dog.farmId;

          return String(dogFarmId) === String(realFarmId);
        });
      } catch (error) {
        console.error("Lỗi tải chó của trại:", error);
      }
    },
  },

  mounted() {
    this.loadFarmInfo();
  },
};
</script>