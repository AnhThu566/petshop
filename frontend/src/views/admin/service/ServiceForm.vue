<template>
  <div>
    <div class="card border-0 shadow-sm" v-if="services.length > 0">
      <div class="table-responsive">
        <table class="table table-hover align-middle text-center mb-0">
          <thead class="bg-light">
            <tr class="small text-secondary">
              <th class="py-3">Ảnh</th>
              <th class="py-3">Mã</th>
              <th class="py-3">Tên dịch vụ</th>
              <th class="py-3">Giá</th>
              <th class="py-3">Trạng thái</th>
              <th class="py-3">Ngày tạo</th>
              <th class="py-3">Thao tác</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="item in services" :key="item._id || item.id">
              <td>
                <img
                  :src="getServiceImage(item)"
                  alt="service"
                  style="width: 64px; height: 64px; object-fit: cover; border-radius: 8px;"
                />
              </td>

              <td class="font-weight-bold text-primary">
                {{ item.maDichVu || "---" }}
              </td>

              <td class="font-weight-bold text-dark text-left">
                {{ item.name }}
              </td>

              <td class="text-danger font-weight-bold">
                {{ formatCurrency(item.price) }}
              </td>

              <td>
                <span class="badge px-3 py-2" :class="getStatusClass(item.status)">
                  {{ item.status }}
                </span>
              </td>

              <td>
                {{ formatDateOnly(item.createdAt) }}
              </td>

              <td>
                <div class="d-flex justify-content-center flex-wrap">
                  <button
                    class="btn btn-sm btn-outline-warning mr-1 mb-1"
                    @click="$emit('edit', item)"
                    title="Sửa dịch vụ"
                  >
                    <i class="fas fa-edit"></i>
                  </button>

                  <button
                    class="btn btn-sm btn-outline-danger mb-1"
                    @click="$emit('delete', item)"
                    title="Xóa dịch vụ"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else class="card border-0 shadow-sm">
      <div class="card-body text-center py-5 text-muted">
        <i class="fas fa-concierge-bell fa-3x mb-3 d-block"></i>
        Chưa có dịch vụ nào phù hợp.
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ServiceList",
  props: {
    services: {
      type: Array,
      default: () => [],
    },
  },

  methods: {
    getServiceImage(item) {
      if (item?.image) return "http://localhost:3000" + item.image;
      return "https://via.placeholder.com/300x300";
    },

    formatCurrency(value) {
      if (value === null || value === undefined) return "---";
      return Number(value).toLocaleString("vi-VN") + " ₫";
    },

    formatDateOnly(date) {
      if (!date) return "---";
      return new Date(date).toLocaleDateString("vi-VN");
    },

    getStatusClass(status) {
      if (status === "Đang hoạt động") return "badge-success";
      if (status === "Ngừng hoạt động") return "badge-secondary";
      return "badge-light border";
    },
  },
};
</script>

<style scoped>
.table td,
.table th {
  vertical-align: middle;
}
</style>