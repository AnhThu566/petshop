<template>
  <div id="app">
    <CustomerHeader v-if="showPublicNavbar" />

    <div :class="{ 'mt-4': showPublicNavbar }" style="min-height: 80vh;">
      <router-view />
    </div>

    <CustomerFooter v-if="showPublicNavbar" />
  </div>
</template>

<script>
// 👉 IMPORT HAI COMPONENT EM VỪA TẠO VÀO ĐÂY
// (Lưu ý: Nếu đường dẫn thư mục của em khác thì nhớ sửa lại đoạn '@/components/...' nhé)
import CustomerHeader from "@/components/customer/CustomerHeader.vue";
import CustomerFooter from "@/components/customer/CustomerFooter.vue";

export default {
  name: "App",
  // Khai báo components để sử dụng trên template
  components: {
    CustomerHeader,
    CustomerFooter
  },
  computed: {
    showPublicNavbar() {
      // Các trang đơn lẻ cần ẩn Header/Footer
      const isolatedPages = ['login', 'register'];
      const isIsolated = isolatedPages.includes(this.$route.name);

      // Kiểm tra xem có đang ở trong khu vực Admin hoặc Farm không
      const isAdminOrFarm = this.$route.path.startsWith('/admin') || this.$route.path.startsWith('/farm');

      // Nếu không phải trang đơn lẻ VÀ không phải khu vực quản trị thì mới hiện Header & Footer
      return !isIsolated && !isAdminOrFarm;
    }
  }
};
</script>

<style>
body {
  background-color: #f8f9fa; 
  margin: 0;
  padding: 0;
}
</style>