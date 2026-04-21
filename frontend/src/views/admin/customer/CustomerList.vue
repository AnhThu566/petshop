<template>
  <div class="customer-list-page bg-light py-3">
    <div class="w-100 px-2">
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white d-flex justify-content-between align-items-center flex-wrap py-3 border-bottom">
          <div>
            <h4 class="mb-1 font-weight-bold text-dark page-title">
              <i class="fas fa-list-ul mr-2 text-success"></i>
              Danh sách khách hàng
            </h4>
            <div class="text-muted small">
              Quản lý tài khoản khách hàng và trạng thái hoạt động.
            </div>
          </div>

          <button class="btn btn-primary btn-sm font-weight-bold px-3 mt-2 mt-md-0" @click="$emit('add')">
            <i class="fas fa-plus-circle mr-1"></i> Thêm khách hàng
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
                  placeholder="Tìm kiếm khách hàng..."
                  v-model.trim="searchText"
                />
              </div>
            </div>

            <div class="col-lg-6 col-md-4 text-md-right">
              <div class="small text-muted font-weight-bold">
                Tổng: {{ filteredCustomers.length }} khách hàng
              </div>
            </div>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0 customer-table">
            <thead class="bg-light">
              <tr class="small text-secondary">
                <th class="py-3 text-center col-stt">STT</th>
                <th class="py-3 text-center col-code">Mã KH</th>
                <th class="py-3 text-left col-name">Họ tên</th>
                <th class="py-3 text-left col-email">Email</th>
                <th class="py-3 text-center col-phone">Số điện thoại</th>
                <th class="py-3 text-center col-date">Ngày tham gia</th>
                <th class="py-3 text-center col-status">Trạng thái</th>
                <th class="py-3 text-center col-action">Thao tác</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="(customer, index) in filteredCustomers"
                :key="customer._id || customer.id"
              >
                <td class="text-center font-weight-bold">
                  {{ index + 1 }}
                </td>

                <td class="text-center font-weight-bold text-danger">
                  {{ customer.customerCode || '---' }}
                </td>

                <td class="text-left font-weight-bold text-dark">
                  {{ customer.fullName || '---' }}
                </td>

                <td class="text-left text-muted text-truncate-cell" :title="customer.email || '---'">
                  {{ customer.email || '---' }}
                </td>

                <td class="text-center">
                  {{ customer.phone || 'N/A' }}
                </td>

                <td class="text-center">
                  {{ customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('vi-VN') : '---' }}
                </td>

                <td class="text-center">
                  <span
                    :class="customer.status === 'active' ? 'badge badge-success' : 'badge badge-danger'"
                    class="px-3 py-2 status-badge"
                  >
                    {{ customer.status === 'active' ? 'Hoạt động' : 'Bị khóa' }}
                  </span>
                </td>

                <td class="text-center">
                  <div class="d-flex justify-content-center flex-wrap">
                    <button
                      class="btn btn-sm btn-outline-primary mr-1 mb-1"
                      @click="$emit('edit', customer)"
                      title="Sửa"
                    >
                      <i class="fas fa-edit"></i>
                    </button>

                    <button
                      class="btn btn-sm btn-outline-danger mb-1"
                      @click="$emit('delete', customer._id || customer.id)"
                      title="Xóa"
                    >
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </td>
              </tr>

              <tr v-if="filteredCustomers.length === 0">
                <td colspan="8" class="py-5 text-center text-muted">
                  <i class="fas fa-folder-open fa-2x mb-3 d-block"></i>
                  Không tìm thấy dữ liệu.
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
  props: ["customers"],
  data() {
    return {
      searchText: "",
    };
  },
  computed: {
    filteredCustomers() {
      if (!this.searchText) return this.customers;

      const term = this.searchText.toLowerCase();

      return this.customers.filter(
        (c) =>
          c.fullName?.toLowerCase().includes(term) ||
          c.email?.toLowerCase().includes(term) ||
          c.phone?.toLowerCase().includes(term) ||
          c.customerCode?.toLowerCase().includes(term)
      );
    },
  },
};
</script>

<style scoped>
.customer-list-page {
  min-height: 100%;
}

.page-title {
  font-size: 1.2rem;
}

.customer-table {
  min-width: 1180px;
}

.customer-table th,
.customer-table td {
  vertical-align: middle;
  font-size: 0.95rem;
}

.customer-table thead th {
  font-weight: 700;
  white-space: nowrap;
}

.col-stt {
  width: 70px;
}

.col-code {
  width: 120px;
}

.col-name {
  width: 190px;
}

.col-email {
  width: 260px;
}

.col-phone {
  width: 160px;
}

.col-date {
  width: 150px;
}

.col-status {
  width: 150px;
}

.col-action {
  width: 130px;
}

.text-truncate-cell {
  max-width: 260px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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