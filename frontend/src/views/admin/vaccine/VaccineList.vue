<template>
  <div class="vaccine-list-page bg-light py-3">
    <div class="w-100 px-2">
      <div class="card border-0 shadow-sm">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0 vaccine-table">
            <thead class="bg-light">
              <tr class="small text-secondary">
                <th class="py-3 text-center col-stt">STT</th>
                <th class="py-3 text-center col-code">Mã Vaccine</th>
                <th class="py-3 text-left col-name">Tên Vaccine</th>
                <th class="py-3 text-left col-desc">Mô tả tác dụng</th>
                <th class="py-3 text-center col-status">Trạng thái</th>
                <th class="py-3 text-center col-action">Thao tác</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="(vc, index) in vaccines" :key="vc._id">
                <td class="text-center font-weight-bold">
                  {{ index + 1 }}
                </td>

                <td class="text-center font-weight-bold text-primary">
                  {{ vc.maVaccine }}
                </td>

                <td class="text-left font-weight-bold text-dark">
                  {{ vc.name }}
                </td>

                <td class="text-left text-muted">
                  {{ vc.description || "Không có mô tả" }}
                </td>

                <td class="text-center">
                  <span
                    :class="vc.status === 'Hoạt động' ? 'badge badge-success' : 'badge badge-secondary'"
                    class="px-3 py-2 status-badge"
                  >
                    {{ vc.status }}
                  </span>
                </td>

                <td class="text-center">
                  <div class="d-flex justify-content-center flex-wrap">
                    <button
                      class="btn btn-sm btn-outline-primary mr-1 mb-1"
                      @click="$emit('edit', vc)"
                      title="Sửa"
                    >
                      <i class="fas fa-edit"></i>
                    </button>

                    <button
                      class="btn btn-sm btn-outline-danger mb-1"
                      @click="$emit('delete', vc._id)"
                      title="Xóa"
                    >
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </td>
              </tr>

              <tr v-if="vaccines.length === 0">
                <td colspan="6" class="py-5 text-center text-muted">
                  <i class="fas fa-box-open fa-2x mb-3 d-block"></i>
                  Chưa có dữ liệu Vaccine.
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
  name: "VaccineList",
  props: {
    vaccines: { type: Array, required: true },
  },
};
</script>

<style scoped>
.vaccine-list-page {
  min-height: 100%;
}

.vaccine-table {
  min-width: 980px;
}

.vaccine-table th,
.vaccine-table td {
  vertical-align: middle;
  font-size: 0.95rem;
}

.vaccine-table thead th {
  font-weight: 700;
  white-space: nowrap;
}

.col-stt {
  width: 70px;
}

.col-code {
  width: 140px;
}

.col-name {
  width: 220px;
}

.col-desc {
  width: 380px;
}

.col-status {
  width: 160px;
}

.col-action {
  width: 130px;
}

.status-badge {
  font-size: 0.82rem;
  border-radius: 999px;
}
</style>