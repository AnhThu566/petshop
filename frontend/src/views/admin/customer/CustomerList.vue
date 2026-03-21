<template>
  <div class="card shadow-sm border-0">
    <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
      <h5 class="mb-0 text-success font-weight-bold">
        <i class="fas fa-list-ul mr-1"></i> DANH SÁCH KHÁCH HÀNG
      </h5>
      <button class="btn btn-primary shadow-sm px-4 font-weight-bold" @click="$emit('add')">
        <i class="fas fa-plus-circle"></i> THÊM KHÁCH HÀNG
      </button>
    </div>

    <div class="card-body p-4">
      <div class="row mb-4">
        <div class="col-md-5">
          <div class="input-group shadow-sm">
            <input 
              type="text" 
              class="form-control border-right-0" 
              placeholder="Tìm kiếm khách hàng..." 
              v-model="searchText"
            >
            <div class="input-group-append">
              <button class="btn btn-success px-3" type="button">
                <i class="fas fa-search"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-bordered table-hover mb-0">
          <thead class="bg-light text-center text-secondary">
            <tr class="text-uppercase" style="font-size: 0.8rem; letter-spacing: 0.5px;">
              <th width="50">STT</th>
              <th width="100">Mã KH</th>
              <th>Họ tên</th>
              <th>Email / SĐT</th>
              <th width="160">Ngày tham gia</th>
              <th width="140">Trạng thái</th>
              <th width="110">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(customer, index) in filteredCustomers" :key="customer._id" class="text-center align-middle">
              <td>{{ index + 1 }}</td>
              <td class="font-weight-bold text-danger">{{ customer.customerCode || '---' }}</td>
              <td class="text-left font-weight-bold">{{ customer.fullName }}</td>
              <td class="text-left small">
                <div><i class="fas fa-envelope text-muted mr-1"></i> {{ customer.email }}</div>
                <div><i class="fas fa-phone text-muted mr-1"></i> {{ customer.phone || 'N/A' }}</div>
              </td>
              <td>{{ new Date(customer.createdAt).toLocaleDateString('vi-VN') }}</td>
              <td>
                <span :class="customer.status === 'active' ? 'badge badge-success' : 'badge badge-danger'" class="px-3 py-2">
                  {{ customer.status === 'active' ? 'Hoạt động' : 'Bị khóa' }}
                </span>
              </td>
              <td>
                <div class="btn-group">
                  <button class="btn btn-sm btn-outline-info mr-1" @click="$emit('edit', customer)"><i class="fas fa-edit"></i></button>
                  <button class="btn btn-sm btn-outline-danger" @click="$emit('delete', customer._id)"><i class="fas fa-trash-alt"></i></button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredCustomers.length === 0">
              <td colspan="7" class="py-5 text-center text-muted">Không tìm thấy dữ liệu.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["customers"],
  data() { return { searchText: "" }; },
  computed: {
    filteredCustomers() {
      if (!this.searchText) return this.customers;
      const term = this.searchText.toLowerCase();
      return this.customers.filter(c => c.fullName.toLowerCase().includes(term));
    }
  }
};
</script>