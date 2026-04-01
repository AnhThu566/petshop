<template>
  <div id="app">
    <CustomerHeader
      v-if="showPublicNavbar"
      :current-user="currentUser"
      :is-logged-in="isLoggedIn"
    />

    <div :class="{ 'mt-4': showPublicNavbar }" style="min-height: 80vh;">
      <router-view />
    </div>

    <CustomerFooter v-if="showPublicNavbar" />
  </div>
</template>

<script>
import CustomerHeader from "@/components/customer/CustomerHeader.vue";
import CustomerFooter from "@/components/customer/CustomerFooter.vue";

export default {
  name: "App",
  components: {
    CustomerHeader,
    CustomerFooter,
  },

  computed: {
    currentUser() {
      return JSON.parse(localStorage.getItem("user") || "null");
    },

    isLoggedIn() {
      return !!localStorage.getItem("token");
    },

    showPublicNavbar() {
      const isolatedPages = ["login", "register"];
      const isIsolated = isolatedPages.includes(this.$route.name);

      const isAdminOrFarm =
        this.$route.path.startsWith("/admin") ||
        this.$route.path.startsWith("/farm");

      return !isIsolated && !isAdminOrFarm;
    },
  },
};
</script>

<style>
body {
  background-color: #f8f9fa;
  margin: 0;
  padding: 0;
}
</style>