<template>
  <footer class="customer-footer">
    <div class="footer-main">
      <div class="container custom-container">
        <div class="row">
          <div class="col-lg-4 col-md-6 mb-4">
            <div class="footer-brand">
              <h4 class="footer-logo mb-3">
                <i class="fas fa-paw mr-2"></i>
                PETSHOP
              </h4>
              <p class="footer-desc mb-3">
                PetShop là nơi kết nối chó cảnh, phụ kiện và dịch vụ chăm sóc thú cưng
                với thông tin minh bạch, rõ ràng và trải nghiệm thuận tiện cho khách hàng.
              </p>

              <div class="footer-socials">
                <a href="#" class="footer-social-link">
                  <i class="fab fa-facebook-f"></i>
                </a>
                <a href="#" class="footer-social-link">
                  <i class="fab fa-tiktok"></i>
                </a>
                <a href="#" class="footer-social-link">
                  <i class="fab fa-youtube"></i>
                </a>
              </div>
            </div>
          </div>

          <div class="col-lg-2 col-md-6 mb-4">
            <h5 class="footer-title">Liên kết nhanh</h5>
            <ul class="footer-links list-unstyled mb-0">
              <li><router-link to="/">Trang chủ</router-link></li>
              <li><router-link to="/dogs">Chó cảnh</router-link></li>
              <li><router-link to="/accessories">Phụ kiện</router-link></li>
              <li><router-link to="/services">Dịch vụ</router-link></li>
            </ul>
          </div>

          <div class="col-lg-3 col-md-6 mb-4">
            <h5 class="footer-title">Hỗ trợ khách hàng</h5>
            <ul class="footer-links list-unstyled mb-0">
              <li><a href="#">Chính sách mua hàng</a></li>
              <li><a href="#">Chính sách giao nhận</a></li>
              <li><a href="#">Chính sách bảo hành</a></li>
              <li><a href="#">Câu hỏi thường gặp</a></li>
            </ul>
          </div>

          <div class="col-lg-3 col-md-6 mb-4">
            <h5 class="footer-title">Thông tin liên hệ</h5>
            <ul class="footer-contact list-unstyled mb-0">
              <li>
                <i class="fas fa-map-marker-alt"></i>
                <span>428 Minh Khai, Hai Bà Trưng, Hà Nội</span>
              </li>
              <li>
                <i class="fas fa-map-marker-alt"></i>
                <span>961 Phạm Văn Đồng, Thủ Đức, TP.HCM</span>
              </li>
              <li>
                <i class="fas fa-phone-alt"></i>
                <span>0379 889 868</span>
              </li>
              <li>
                <i class="fas fa-envelope"></i>
                <span>cskh@petshop.vn</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <div class="container custom-container">
        <div class="footer-bottom-inner">
          <p class="mb-0">
            &copy; 2026 PetShop. Đồ án xây dựng website bán chó cảnh, phụ kiện và dịch vụ.
          </p>
          <p class="mb-0 footer-made-by">
            Thiết kế bởi <strong>Anh Thư</strong>
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: "CustomerFooter",
};
</script>

<style scoped>
.customer-footer {
  margin-top: 0;
}

.footer-main {
  background: linear-gradient(135deg, #6f42a4 0%, #5b2d91 55%, #4b1f73 100%);
  color: #f7efff;
  padding: 56px 0 28px;
}

.footer-bottom {
  background: #432063;
  color: #dbc8ef;
  padding: 16px 0;
}

.footer-bottom-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  font-size: 0.92rem;
}

.footer-logo {
  color: #ffffff;
  font-weight: 800;
  font-size: 1.7rem;
  letter-spacing: 0.3px;
  margin: 0;
}

.footer-desc {
  color: rgba(255, 255, 255, 0.82);
  line-height: 1.8;
  font-size: 0.97rem;
  max-width: 360px;
}

.footer-title {
  color: #ffffff;
  font-size: 1.08rem;
  font-weight: 700;
  margin-bottom: 18px;
}

.footer-links li {
  margin-bottom: 12px;
}

.footer-links a {
  color: rgba(255, 255, 255, 0.78);
  text-decoration: none;
  transition: all 0.25s ease;
}

.footer-links a:hover {
  color: #ffffff;
  padding-left: 4px;
}

.footer-contact li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 14px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.7;
}

.footer-contact i {
  color: #f3d27c;
  margin-top: 5px;
  min-width: 14px;
}

.footer-socials {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.footer-social-link {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.14);
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: all 0.25s ease;
}

.footer-social-link:hover {
  background: white;
  color: #6f42a4;
  transform: translateY(-2px);
}

.footer-made-by strong {
  color: #ffffff;
}

@media (min-width: 1200px) {
  .custom-container {
    max-width: 1360px !important;
  }
}

@media (max-width: 768px) {
  .footer-main {
    padding: 42px 0 18px;
  }

  .footer-logo {
    font-size: 1.45rem;
  }

  .footer-desc {
    font-size: 0.93rem;
  }

  .footer-title {
    font-size: 1rem;
    margin-bottom: 14px;
  }

  .footer-bottom-inner {
    flex-direction: column;
    text-align: center;
    font-size: 0.88rem;
  }
}
</style>