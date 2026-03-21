<template>
  <footer class="bg-dark text-light pt-5 pb-3">
    <div class="container">
      <div class="row">
        <div class="col-md-4 mb-4">
          <h5 class="text-uppercase font-weight-bold text-success mb-3">PETSHOP HỆ THỐNG</h5>
          <p class="small text-muted">Chúng tôi cam kết mang đến những bé thú cưng khỏe mạnh, đáng yêu cùng các dịch vụ chăm sóc thú cưng chất lượng nhất.</p>
          <div class="mt-3">
            <a href="#" class="text-light mr-3"><i class="fab fa-facebook fa-lg"></i></a>
            <a href="#" class="text-light mr-3"><i class="fab fa-tiktok fa-lg"></i></a>
            <a href="#" class="text-light"><i class="fab fa-youtube fa-lg"></i></a>
          </div>
        </div>

        <div class="col-md-4 mb-4">
          <h5 class="text-uppercase font-weight-bold mb-3">HỖ TRỢ KHÁCH HÀNG</h5>
          <ul class="list-unstyled small">
            <li class="mb-2"><a href="#" class="text-muted text-decoration-none hover-success">Chính sách bảo hành thú cưng</a></li>
            <li class="mb-2"><a href="#" class="text-muted text-decoration-none hover-success">Hướng dẫn mua trả góp</a></li>
            <li class="mb-2"><a href="#" class="text-muted text-decoration-none hover-success">Chính sách giao nhận</a></li>
            <li class="mb-2"><a href="#" class="text-muted text-decoration-none hover-success">Câu hỏi thường gặp (FAQ)</a></li>
          </ul>
        </div>

        <div class="col-md-4 mb-4">
          <h5 class="text-uppercase font-weight-bold mb-3">LIÊN HỆ</h5>
          <ul class="list-unstyled small text-muted">
            <li class="mb-2"><i class="fas fa-map-marker-alt mr-2 text-success"></i> 428 Minh Khai, Hai Bà Trưng, HN</li>
            <li class="mb-2"><i class="fas fa-map-marker-alt mr-2 text-success"></i> 961 Phạm Văn Đồng, Thủ Đức, HCM</li>
            <li class="mb-2"><i class="fas fa-phone-alt mr-2 text-success"></i> Hotline: <strong class="text-white">0379.889.868</strong></li>
            <li class="mb-2"><i class="fas fa-envelope mr-2 text-success"></i> cskh@petshop.vn</li>
          </ul>
        </div>
      </div>
      
      <hr class="bg-secondary opacity-50">
      
      <div class="text-center small text-muted mt-3">
        &copy; 2026 Hệ thống PetShop. Đồ án thiết kế bởi Anh Thư.
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: "CustomerFooter"
};
</script>

<style scoped>
.hover-success:hover {
  color: #28a745 !important;
}
</style>