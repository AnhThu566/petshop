<template>
  <div class="table-responsive">
    <table class="table table-bordered table-hover mb-0 text-center align-middle">
      <thead class="bg-light text-secondary text-uppercase" style="font-size: 0.85rem;">
        <tr>
          <th width="50">STT</th>
          <th width="120">Mã Vaccine</th>
          <th class="text-left">Tên Vaccine</th>
          <th class="text-left">Mô tả tác dụng</th>
          <th width="150">Trạng thái</th>
          <th width="120">Thao tác</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(vc, index) in vaccines" :key="vc._id">
          <td>{{ index + 1 }}</td>
          <td class="font-weight-bold text-primary">{{ vc.maVaccine }}</td>
          <td class="text-left font-weight-bold text-dark">{{ vc.name }}</td>
          <td class="text-left text-muted">{{ vc.description || 'Không có mô tả' }}</td>
          <td>
            <span :class="vc.status === 'Hoạt động' ? 'badge-success' : 'badge-secondary'" class="badge px-3 py-2 shadow-sm">
              {{ vc.status }}
            </span>
          </td>
          <td>
            <button class="btn btn-sm btn-outline-primary mr-2" @click="$emit('edit', vc)" title="Sửa">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" @click="$emit('delete', vc._id)" title="Xóa">
              <i class="fas fa-trash-alt"></i>
            </button>
          </td>
        </tr>
        <tr v-if="vaccines.length === 0">
          <td colspan="6" class="py-5 text-center text-muted">
            <i class="fas fa-box-open fa-2x mb-3 opacity-50"></i><br> Chưa có dữ liệu Vaccine.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: "VaccineList",
  props: {
    // Nhận mảng dữ liệu từ VaccinePage truyền xuống
    vaccines: { type: Array, required: true } 
  }
};
</script>