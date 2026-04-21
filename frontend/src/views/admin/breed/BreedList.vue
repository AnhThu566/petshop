<template>
  <div class="breed-list-page bg-light py-3">
    <div class="w-100 px-2">
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white d-flex justify-content-between align-items-center flex-wrap gap-2 py-3 border-bottom">
          <div>
            <h4 class="mb-1 font-weight-bold text-dark page-title">
              <i class="fas fa-list mr-2 text-primary"></i>
              Danh sách giống chó
            </h4>
            <div class="text-muted small">
              Quản lý thông tin giống chó, hình ảnh và trạng thái kinh doanh.
            </div>
          </div>

          <button class="btn btn-primary btn-sm font-weight-bold px-3" @click="$emit('show-form')">
            <i class="fas fa-plus-circle mr-1"></i> Thêm giống mới
          </button>
        </div>

        <div class="card-body py-3">
          <div class="row align-items-center">
            <div class="col-lg-6 col-md-8 mb-2 mb-md-0">
              <div class="input-group input-group-sm shadow-sm">
                <div class="input-group-prepend">
                  <span class="input-group-text bg-white text-primary border-right-0">
                    <i class="fas fa-search"></i>
                  </span>
                </div>
                <input
                  type="text"
                  class="form-control border-left-0"
                  v-model.trim="searchText"
                  placeholder="Tìm kiếm theo mã hoặc tên giống chó..."
                />
              </div>
            </div>

            <div class="col-lg-6 col-md-4 text-md-right">
              <div class="small text-muted font-weight-bold">
                Tổng: {{ filteredBreeds.length }} giống
              </div>
            </div>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0 breed-table">
            <thead class="bg-light">
              <tr class="small text-secondary">
                <th class="py-3 text-center col-stt">STT</th>
                <th class="py-3 text-center col-code">Mã giống</th>
                <th class="py-3 text-center col-image">Hình ảnh</th>
                <th class="py-3 text-left col-name">Tên giống chó</th>
                <th class="py-3 text-left col-origin">Nguồn gốc</th>
                <th class="py-3 text-center col-status">Trạng thái</th>
                <th class="py-3 text-center col-action">Thao tác</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="(item, index) in filteredBreeds" :key="item._id || item.id">
                <td class="text-center font-weight-bold">{{ index + 1 }}</td>

                <td class="text-center font-weight-bold text-primary">
                  {{ item.maGiong || "---" }}
                </td>

                <td class="text-center">
                  <img
                    v-if="item.image"
                    :src="'http://localhost:3000' + item.image"
                    alt="Hình giống chó"
                    class="breed-thumb"
                  />
                  <span v-else class="text-muted font-italic small">Chưa có ảnh</span>
                </td>

                <td class="text-left font-weight-bold text-dark">
                  {{ item.name || "---" }}
                </td>

                <td class="text-left text-muted">
                  {{ item.origin || "Đang cập nhật" }}
                </td>

                <td class="text-center">
                  <span
                    v-if="item.status === 'active'"
                    class="badge badge-success px-3 py-2 status-badge"
                  >
                    Đang kinh doanh
                  </span>

                  <span
                    v-else-if="item.status === 'paused'"
                    class="badge badge-warning px-3 py-2 status-badge text-dark"
                  >
                    Tạm ngưng
                  </span>

                  <span
                    v-else
                    class="badge badge-danger px-3 py-2 status-badge"
                  >
                    Ngừng kinh doanh
                  </span>
                </td>

                <td class="text-center">
                  <div class="d-flex justify-content-center flex-wrap">
                    <button
                      class="btn btn-sm btn-outline-primary mr-1 mb-1"
                      @click="$emit('edit', item)"
                      title="Chỉnh sửa"
                    >
                      <i class="fas fa-edit"></i>
                    </button>

                    <button
                      class="btn btn-sm btn-outline-danger mb-1"
                      @click="$emit('delete', item._id || item.id)"
                      title="Xóa"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>

              <tr v-if="filteredBreeds.length === 0">
                <td colspan="7" class="py-5 text-center text-muted">
                  <i class="fas fa-folder-open fa-2x mb-3 d-block"></i>
                  Không tìm thấy dữ liệu giống chó nào.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["breeds"],

  data() {
    return {
      searchText: "",
    };
  },

  computed: {
    filteredBreeds() {
      if (!this.searchText) {
        return this.breeds;
      }

      const lowerCaseSearch = this.searchText.toLowerCase();

      return this.breeds.filter(
        (breed) =>
          (breed.name && breed.name.toLowerCase().includes(lowerCaseSearch)) ||
          (breed.maGiong && breed.maGiong.toLowerCase().includes(lowerCaseSearch))
      );
    },
  },
};
</script>

<style scoped>
.breed-list-page {
  min-height: 100%;
}

.page-title {
  font-size: 1.2rem;
}

.breed-table {
  min-width: 1050px;
}

.breed-table th,
.breed-table td {
  vertical-align: middle;
  font-size: 0.95rem;
}

.breed-table thead th {
  font-weight: 700;
  white-space: nowrap;
}

.col-stt {
  width: 70px;
}

.col-code {
  width: 130px;
}

.col-image {
  width: 120px;
}

.col-name {
  width: 220px;
}

.col-origin {
  width: 220px;
}

.col-status {
  width: 170px;
}

.col-action {
  width: 130px;
}

.breed-thumb {
  width: 88px;
  height: 88px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid #dee2e6;
  box-shadow: 0 4px 10px rgba(15, 23, 42, 0.04);
}

.status-badge {
  font-size: 0.82rem;
  border-radius: 999px;
}

@media (max-width: 991.98px) {
  .page-title {
    font-size: 1.1rem;
  }
}
</style>