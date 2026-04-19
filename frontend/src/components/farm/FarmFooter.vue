<template>
  <footer class="farm-footer">
    <div class="container-fluid d-flex justify-content-between align-items-center flex-wrap">
      <div class="footer-left">
        <span class="footer-brand">TRANG TRẠI ĐỐI TÁC</span>
        <span class="footer-separator">•</span>
        <span class="footer-text">Hệ thống quản lý hồ sơ chó cung cấp</span>
      </div>

      <div class="footer-right">
        <span>&copy; 2026 PetCare Platform</span>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: "FarmFooter",
};
</script>

<style scoped>
.farm-footer {
  background: #ffffff;
  border-top: 1px solid #e9ecef;
  padding: 12px 20px;
  color: #6c757d;
  font-size: 0.88rem;
}

.footer-left,
.footer-right {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.footer-brand {
  font-weight: 800;
  color: #18734c;
  letter-spacing: 0.2px;
}

.footer-separator {
  margin: 0 8px;
  color: #adb5bd;
}

.footer-text {
  color: #6c757d;
}

.footer-right {
  font-weight: 600;
}

@media (max-width: 767.98px) {
  .farm-footer {
    text-align: center;
  }

  .container-fluid {
    justify-content: center !important;
    gap: 6px;
  }

  .footer-left,
  .footer-right {
    justify-content: center;
    width: 100%;
  }

  .footer-separator {
    display: none;
  }
}
</style>