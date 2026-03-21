<template>
  <div class="dashboard-overview bg-light py-4" style="min-height: 100vh;">
    <div class="container-fluid px-4">
      
      <div class="mb-4 pb-2 border-bottom">
        <h3 class="font-weight-bold text-dark">
          <i class="fas fa-chart-pie text-primary mr-2"></i> BẢNG ĐIỀU KHIỂN TỔNG QUAN
        </h3>
        <p class="text-muted">Theo dõi tình hình kinh doanh và kiểm duyệt của PetShop</p>
      </div>

      <div class="row">
        <div class="col-xl-3 col-md-6 mb-4">
          <div class="card border-left-success shadow-sm h-100 py-2" style="border-left: 5px solid #1cc88a;">
            <div class="card-body">
              <div class="row no-gutters align-items-center">
                <div class="col mr-2">
                  <div class="text-xs font-weight-bold text-success text-uppercase mb-1">Tổng tiền cọc đã nhận</div>
                  <div class="h5 mb-0 font-weight-bold text-gray-800">{{ totalRevenue.toLocaleString('vi-VN') }} ₫</div>
                </div>
                <div class="col-auto">
                  <i class="fas fa-dollar-sign fa-2x text-gray-300" style="opacity: 0.3;"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-xl-3 col-md-6 mb-4">
          <div class="card border-left-warning shadow-sm h-100 py-2" style="border-left: 5px solid #f6c23e;">
            <div class="card-body">
              <div class="row no-gutters align-items-center">
                <div class="col mr-2">
                  <div class="text-xs font-weight-bold text-warning text-uppercase mb-1">Đơn chờ xác nhận</div>
                  <div class="h5 mb-0 font-weight-bold text-gray-800">{{ pendingOrders }} Đơn</div>
                </div>
                <div class="col-auto">
                  <i class="fas fa-clipboard-list fa-2x text-gray-300" style="opacity: 0.3;"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-xl-3 col-md-6 mb-4">
          <div class="card border-left-info shadow-sm h-100 py-2" style="border-left: 5px solid #36b9cc;">
            <div class="card-body">
              <div class="row no-gutters align-items-center">
                <div class="col mr-2">
                  <div class="text-xs font-weight-bold text-info text-uppercase mb-1">Thú cưng đang bán</div>
                  <div class="h5 mb-0 font-weight-bold text-gray-800">{{ activeDogs }} Bé</div>
                </div>
                <div class="col-auto">
                  <i class="fas fa-paw fa-2x text-gray-300" style="opacity: 0.3;"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-xl-3 col-md-6 mb-4">
          <div class="card border-left-primary shadow-sm h-100 py-2" style="border-left: 5px solid #4e73df;">
            <div class="card-body">
              <div class="row no-gutters align-items-center">
                <div class="col mr-2">
                  <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">Thú cưng chờ duyệt</div>
                  <div class="h5 mb-0 font-weight-bold text-gray-800">{{ pendingDogs }} Bé</div>
                </div>
                <div class="col-auto">
                  <i class="fas fa-search-plus fa-2x text-gray-300" style="opacity: 0.3;"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import OrderService from "@/services/order.service";
import DogService from "@/services/dog.service";

export default {
  data() {
    return {
      totalRevenue: 0,
      pendingOrders: 0,
      activeDogs: 0,
      pendingDogs: 0
    };
  },
  async created() {
    await this.calculateStats();
  },
  methods: {
    async calculateStats() {
      try {
        // 1. Lấy dữ liệu Đơn hàng
        const orders = await OrderService.getAll();
        
        // Tính tổng tiền các đơn đã "Đã nhận cọc"
        this.totalRevenue = orders
          .filter(order => order.status === 'Đã nhận cọc')
          .reduce((sum, order) => sum + order.depositAmount, 0);

        // Đếm số đơn "Chờ xác nhận cọc"
        this.pendingOrders = orders.filter(order => order.status === 'Chờ xác nhận cọc').length;

        // 2. Lấy dữ liệu Thú cưng (Sửa lại chỗ này dùng getAll cho an toàn)
        const allDogs = await DogService.getAll(); // 👉 Dùng hàm getAll có sẵn của em

        // Đếm số lượng chó trực tiếp từ mảng allDogs
        this.activeDogs = allDogs.filter(dog => dog.status === 'Đã duyệt').length;
        this.pendingDogs = allDogs.filter(dog => dog.status === 'Chờ duyệt').length;

      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu thống kê:", error);
      }
    }
  }
};
</script>