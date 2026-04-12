<template>
  <div class="farm-dogs-page bg-light py-4" style="min-height: 100vh;">
    <div class="container-fluid">
      <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3 flex-wrap">
        <h4 class="font-weight-bold text-dark mb-2">
          <i class="fas fa-dog text-warning mr-2"></i>
          HỒ SƠ CHÓ ĐÃ CUNG CẤP
        </h4>

        <div>
          <button class="btn btn-outline-primary btn-sm mr-2" @click="fetchMyDogs">
            <i class="fas fa-sync-alt mr-1"></i> Làm mới
          </button>
          <router-link to="/farm/add-dog" class="btn btn-primary btn-sm">
            <i class="fas fa-plus mr-1"></i> Cung cấp hồ sơ chó
          </router-link>
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
                  :class="approvalFilter === 'Tất cả' ? 'btn-dark' : 'btn-light'"
                  @click="approvalFilter = 'Tất cả'"
                >
                  Tất cả
                </button>
                <button
                  class="btn btn-sm"
                  :class="approvalFilter === 'Chờ duyệt' ? 'btn-warning text-dark' : 'btn-light'"
                  @click="approvalFilter = 'Chờ duyệt'"
                >
                  Chờ duyệt
                </button>
                <button
                  class="btn btn-sm"
                  :class="approvalFilter === 'Đã duyệt' ? 'btn-success text-white' : 'btn-light'"
                  @click="approvalFilter = 'Đã duyệt'"
                >
                  Đã duyệt
                </button>
                <button
                  class="btn btn-sm"
                  :class="approvalFilter === 'Từ chối' ? 'btn-danger text-white' : 'btn-light'"
                  @click="approvalFilter = 'Từ chối'"
                >
                  Từ chối
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row mb-4">
        <div class="col-md-3 mb-3">
          <div class="card border-0 shadow-sm text-center py-3">
            <div class="small text-muted">Chờ duyệt</div>
            <h4 class="font-weight-bold text-warning mb-0">{{ stats.pending }}</h4>
          </div>
        </div>

        <div class="col-md-3 mb-3">
          <div class="card border-0 shadow-sm text-center py-3">
            <div class="small text-muted">Đã duyệt</div>
            <h4 class="font-weight-bold text-success mb-0">{{ stats.approved }}</h4>
          </div>
        </div>

        <div class="col-md-3 mb-3">
          <div class="card border-0 shadow-sm text-center py-3">
            <div class="small text-muted">Đang được hệ thống hiển thị</div>
            <h4 class="font-weight-bold text-primary mb-0">{{ stats.published }}</h4>
          </div>
        </div>

        <div class="col-md-3 mb-3">
          <div class="card border-0 shadow-sm text-center py-3">
            <div class="small text-muted">Đã bán</div>
            <h4 class="font-weight-bold text-dark mb-0">{{ stats.sold }}</h4>
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
                <th class="py-3">Ngày tạo</th>
                <th class="py-3">Tình trạng hồ sơ</th>
                <th class="py-3">Ghi nhận từ hệ thống</th>
                <th class="py-3">Thao tác</th>
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
                  {{ formatDateOnly(dog.createdAt) }}
                </td>

                <td>
                  <span class="badge px-3 py-2" :class="getApprovalStatusClass(dog.approvalStatus)">
                    {{ dog.approvalStatus }}
                  </span>

                  <div
                    v-if="dog.approvalStatus === 'Từ chối' && dog.rejectionReason"
                    class="small text-danger mt-2 text-left"
                  >
                    <strong>Lý do:</strong> {{ dog.rejectionReason }}
                  </div>
                </td>

                <td>
                  <div v-if="dog.approvalStatus === 'Đã duyệt' && dog.saleStatus === 'Đã bán'" class="small text-success font-weight-bold">
                    <i class="fas fa-check-circle mr-1"></i> Đã bán
                  </div>

                  <div
                    v-else-if="dog.approvalStatus === 'Đã duyệt' && dog.isPublished"
                    class="small text-primary font-weight-bold"
                  >
                    <i class="fas fa-store mr-1"></i> Đang được hệ thống hiển thị
                  </div>

                  <div
                    v-else-if="dog.approvalStatus === 'Đã duyệt'"
                    class="small text-muted font-weight-bold"
                  >
                    <i class="fas fa-clock mr-1"></i> Đã duyệt, chờ hệ thống xử lý
                  </div>

                  <div v-else class="text-muted">---</div>
                </td>

                <td>
                  <div class="d-flex justify-content-center flex-wrap">
                    <button
                      class="btn btn-sm btn-outline-secondary mr-1 mb-1"
                      @click="openDetailModal(dog)"
                      title="Xem chi tiết"
                    >
                      <i class="fas fa-eye"></i>
                    </button>

                    <button
                      class="btn btn-sm btn-outline-primary mr-1 mb-1"
                      @click="openHealthEditModal(dog)"
                      :disabled="isLockedDog(dog)"
                      title="Sửa thông tin sức khỏe tóm tắt"
                    >
                      <i class="fas fa-notes-medical"></i>
                    </button>

                    <button
                      class="btn btn-sm btn-outline-warning mb-1"
                      @click="openBasicEditModal(dog)"
                      :disabled="isLockedDog(dog)"
                      title="Sửa thông tin cơ bản"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                  </div>

                  <div v-if="isLockedDog(dog)" class="small text-danger mt-2">
                    <i class="fas fa-lock mr-1"></i>{{ getLockReason(dog) }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-else class="card border-0 shadow-sm">
        <div class="card-body text-center py-5 text-muted">
          <i class="fas fa-dog fa-3x mb-3 d-block"></i>
          Không có hồ sơ chó nào phù hợp.
        </div>
      </div>

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
                <i class="fas fa-dog mr-2"></i>Chi tiết hồ sơ chó
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
                  <p class="mb-1"><strong>Tình trạng hồ sơ:</strong> {{ selectedDog.approvalStatus || "---" }}</p>
                  <p class="mb-1"><strong>Giống:</strong> {{ selectedDog.breedId?.name || "---" }}</p>
                  <p class="mb-1"><strong>Giới tính:</strong> {{ selectedDog.gender || "---" }}</p>
                  <p class="mb-1"><strong>Ngày sinh:</strong> {{ formatDateOnly(selectedDog.birthDate) }}</p>
                  <p class="mb-1"><strong>Giá:</strong> {{ formatCurrency(selectedDog.price) }}</p>
                  <p class="mb-1"><strong>Cân nặng:</strong> {{ selectedDog.weight ? selectedDog.weight + " kg" : "---" }}</p>
                  <p class="mb-1"><strong>Tình trạng sức khỏe:</strong> {{ selectedDog.healthStatus || "---" }}</p>
                  <p class="mb-1"><strong>Ngày tẩy giun:</strong> {{ formatDateOnly(selectedDog.lastDeworming) }}</p>
                  <p class="mb-1"><strong>Nguồn gốc:</strong> {{ selectedDog.sourceVerified ? "Đã xác minh" : "Đang cập nhật" }}</p>
                  <p class="mb-1"><strong>Điều kiện bán:</strong> {{ selectedDog.eligibleForSale ? "Đủ điều kiện" : "Chưa đủ điều kiện" }}</p>
                  <p class="mb-1"><strong>Mô tả:</strong> {{ selectedDog.description || "---" }}</p>

                  <div
                    v-if="selectedDog.approvalStatus === 'Từ chối' && selectedDog.rejectionReason"
                    class="alert alert-danger mt-3 py-2"
                  >
                    <strong>Lý do từ chối:</strong> {{ selectedDog.rejectionReason }}
                  </div>

                  <div
                    v-else-if="selectedDog.approvalStatus === 'Đã duyệt' && selectedDog.saleStatus === 'Đã bán'"
                    class="alert alert-success mt-3 py-2"
                  >
                    <strong>Ghi nhận từ hệ thống:</strong> Bé chó này đã bán thành công.
                  </div>

                  <div
                    v-else-if="selectedDog.approvalStatus === 'Đã duyệt' && selectedDog.isPublished"
                    class="alert alert-info mt-3 py-2"
                  >
                    <strong>Ghi nhận từ hệ thống:</strong> Hồ sơ đang được hệ thống hiển thị.
                  </div>

                  <div
                    v-else-if="selectedDog.approvalStatus === 'Đã duyệt'"
                    class="alert alert-secondary mt-3 py-2"
                  >
                    <strong>Ghi nhận từ hệ thống:</strong> Hồ sơ đã được duyệt.
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn btn-secondary" @click="closeDetailModal">Đóng</button>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="editingDog"
        class="modal fade show d-block"
        tabindex="-1"
        style="background: rgba(0,0,0,0.45);"
      >
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content border-0 shadow">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title mb-0">
                <i class="fas fa-notes-medical mr-2"></i>Cập nhật thông tin sức khỏe tóm tắt
              </h5>
              <button type="button" class="close text-white" @click="closeEditModal">
                <span>&times;</span>
              </button>
            </div>

            <div class="modal-body">
              <div class="form-row">
                <div class="form-group col-md-4">
                  <label>Cân nặng (kg)</label>
                  <input type="number" step="0.1" class="form-control" v-model="editingDog.weight" />
                </div>

                <div class="form-group col-md-4">
                  <label>Tình trạng sức khỏe</label>
                  <input type="text" class="form-control" v-model="editingDog.healthStatus" />
                </div>

                <div class="form-group col-md-4">
                  <label>Ngày tẩy giun</label>
                  <input type="date" class="form-control" v-model="editingDog.lastDeworming" />
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn btn-secondary" @click="closeEditModal">Hủy</button>
              <button class="btn btn-primary" @click="saveHealthRecord">Lưu thông tin</button>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="editingBasicDog"
        class="modal fade show d-block"
        tabindex="-1"
        style="background: rgba(0,0,0,0.45);"
      >
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content border-0 shadow">
            <div class="modal-header bg-warning">
              <h5 class="modal-title mb-0 text-dark">
                <i class="fas fa-edit mr-2"></i>Sửa thông tin cơ bản
              </h5>
              <button type="button" class="close" @click="closeBasicEditModal">
                <span>&times;</span>
              </button>
            </div>

            <div class="modal-body">
              <div class="alert alert-warning">
                Khi sửa thông tin cơ bản, hồ sơ sẽ quay lại trạng thái <strong>Chờ duyệt</strong> để hệ thống kiểm tra lại.
              </div>

              <div class="form-row">
                <div class="form-group col-md-6">
                  <label>Tên chó</label>
                  <input type="text" class="form-control" v-model="editingBasicDog.name" />
                </div>

                <div class="form-group col-md-6">
                  <label>Giá bán</label>
                  <input type="number" class="form-control" v-model="editingBasicDog.price" />
                </div>

                <div class="form-group col-md-6">
                  <label>Giới tính</label>
                  <select class="form-control" v-model="editingBasicDog.gender">
                    <option value="Đực">Đực</option>
                    <option value="Cái">Cái</option>
                  </select>
                </div>

                <div class="form-group col-md-6">
                  <label>Ngày sinh</label>
                  <input type="date" class="form-control" v-model="editingBasicDog.birthDate" />
                </div>

                <div class="form-group col-md-6">
                  <label>Giống chó</label>
                  <select class="form-control" v-model="editingBasicDog.breedId">
                    <option value="">-- Chọn giống --</option>
                    <option
                      v-for="breed in breeds"
                      :key="breed._id || breed.id"
                      :value="breed._id || breed.id"
                    >
                      {{ breed.name }}
                    </option>
                  </select>
                </div>

                <div class="form-group col-md-12">
                  <label>Mô tả</label>
                  <textarea class="form-control" rows="4" v-model="editingBasicDog.description"></textarea>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn btn-secondary" @click="closeBasicEditModal">Hủy</button>
              <button class="btn btn-warning text-dark" @click="saveBasicInfo">Lưu thay đổi</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import DogService from "@/services/dog.service";
import BreedService from "@/services/breed.service";

export default {
  name: "FarmDogList",

  data() {
    return {
      dogs: [],
      breeds: [],
      currentFarm: null,
      searchText: "",
      approvalFilter: "Tất cả",
      selectedDog: null,
      editingDog: null,
      editingBasicDog: null,
    };
  },

  computed: {
    filteredDogs() {
      return this.dogs.filter((dog) => {
        const keyword = (this.searchText || "").toLowerCase();
        const dogName = dog.name ? dog.name.toLowerCase() : "";
        const dogCode = dog.maCho ? dog.maCho.toLowerCase() : "";

        const matchSearch = dogName.includes(keyword) || dogCode.includes(keyword);
        const matchApproval =
          this.approvalFilter === "Tất cả" || dog.approvalStatus === this.approvalFilter;

        return matchSearch && matchApproval;
      });
    },

    stats() {
      return {
        pending: this.dogs.filter((d) => d.approvalStatus === "Chờ duyệt").length,
        approved: this.dogs.filter((d) => d.approvalStatus === "Đã duyệt").length,
        published: this.dogs.filter((d) => d.approvalStatus === "Đã duyệt" && d.isPublished).length,
        sold: this.dogs.filter((d) => d.saleStatus === "Đã bán").length,
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
        console.error("Lỗi tải danh sách chó:", error);
        alert(
          "Không thể tải danh sách chó của trang trại: " +
            (error.response?.data?.message || error.message)
        );
      }
    },

    async fetchBreeds() {
      try {
        this.breeds = await BreedService.getAll();
      } catch (error) {
        console.error("Lỗi tải giống chó:", error);
      }
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

    getApprovalStatusClass(status) {
      if (status === "Chờ duyệt") return "badge-warning text-dark";
      if (status === "Đã duyệt") return "badge-success";
      if (status === "Từ chối") return "badge-danger";
      return "badge-light border";
    },

    isLockedDog(dog) {
      return ["Chờ thanh toán", "Đã đặt cọc", "Đang giao", "Đã bán"].includes(dog.saleStatus);
    },

    getLockReason(dog) {
      if (dog.saleStatus === "Chờ thanh toán") {
        return "Hồ sơ đang trong quá trình xử lý giao dịch, không thể chỉnh sửa.";
      }
      if (dog.saleStatus === "Đã đặt cọc") {
        return "Bé chó đã có khách giữ chỗ, không thể chỉnh sửa.";
      }
      if (dog.saleStatus === "Đang giao") {
        return "Bé chó đang trong quá trình bàn giao, không thể chỉnh sửa.";
      }
      if (dog.saleStatus === "Đã bán") {
        return "Bé chó đã bán, không thể chỉnh sửa.";
      }
      return "";
    },

    openDetailModal(dog) {
      this.selectedDog = JSON.parse(JSON.stringify(dog));
    },

    closeDetailModal() {
      this.selectedDog = null;
    },

    openHealthEditModal(dog) {
      if (this.isLockedDog(dog)) {
        alert(this.getLockReason(dog));
        return;
      }

      this.editingDog = JSON.parse(JSON.stringify(dog));
      this.editingDog.lastDeworming = this.editingDog.lastDeworming
        ? this.formatDateForInput(this.editingDog.lastDeworming)
        : "";
    },

    closeEditModal() {
      this.editingDog = null;
    },

    openBasicEditModal(dog) {
      if (this.isLockedDog(dog)) {
        alert(this.getLockReason(dog));
        return;
      }

      this.editingBasicDog = {
        _id: dog._id || dog.id,
        name: dog.name || "",
        price: dog.price || 0,
        gender: dog.gender || "Đực",
        birthDate: dog.birthDate ? this.formatDateForInput(dog.birthDate) : "",
        description: dog.description || "",
        breedId: dog.breedId?._id || dog.breedId?.id || dog.breedId || "",
      };
    },

    closeBasicEditModal() {
      this.editingBasicDog = null;
    },

    formatDateForInput(date) {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },

    async saveHealthRecord() {
      const confirmMessage =
        `Vui lòng kiểm tra kỹ lại thông tin của bé [${this.editingDog.name}] trước khi lưu:\n\n` +
        `⚖️ Cân nặng: ${this.editingDog.weight || "Chưa nhập"} kg\n` +
        `🩺 Tình trạng: ${this.editingDog.healthStatus || "Chưa nhập"}\n` +
        `💊 Ngày tẩy giun: ${
          this.editingDog.lastDeworming
            ? new Date(this.editingDog.lastDeworming).toLocaleDateString("vi-VN")
            : "Chưa cập nhật"
        }\n\n` +
        `👉 Bạn có chắc chắn toàn bộ dữ liệu trên đã chính xác chưa?`;

      if (!confirm(confirmMessage)) return;

      try {
        const updateData = {
          weight: this.editingDog.weight,
          healthStatus: this.editingDog.healthStatus,
          lastDeworming: this.editingDog.lastDeworming,
        };

        await DogService.update(this.editingDog._id || this.editingDog.id, updateData);
        alert("✅ Đã cập nhật thông tin sức khỏe thành công!");
        this.closeEditModal();
        await this.fetchMyDogs();
      } catch (error) {
        alert("❌ Lỗi cập nhật: " + (error.response?.data?.message || error.message));
      }
    },

    async saveBasicInfo() {
      if (
        !confirm(
          `Bạn có chắc chắn muốn lưu? Hành động này sẽ đưa hồ sơ về trạng thái "Chờ duyệt" để hệ thống kiểm tra lại.`
        )
      ) {
        return;
      }

      try {
        const updateData = {
          name: this.editingBasicDog.name,
          price: this.editingBasicDog.price,
          gender: this.editingBasicDog.gender,
          birthDate: this.editingBasicDog.birthDate,
          description: this.editingBasicDog.description,
          breedId: this.editingBasicDog.breedId,
        };

        await DogService.update(this.editingBasicDog._id || this.editingBasicDog.id, updateData);
        alert("✅ Cập nhật thành công! Hồ sơ đang chờ duyệt lại.");
        this.closeBasicEditModal();
        await this.fetchMyDogs();
      } catch (error) {
        alert("❌ Lỗi cập nhật: " + (error.response?.data?.message || error.message));
      }
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

    await Promise.all([this.fetchBreeds(), this.fetchMyDogs()]);
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