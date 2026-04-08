<template>
  <div id="app">
    <CustomerHeader
      v-if="showPublicNavbar"
      :current-user="currentUser"
      :is-logged-in="isLoggedIn"
    />
<div style="min-height: 80vh;">
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

  data() {
    return {
      currentUser: null,
      isLoggedIn: false,
    };
  },

  computed: {
    showPublicNavbar() {
      const isolatedPages = ["login", "register"];
      const isIsolated = isolatedPages.includes(this.$route.name);

      const isAdminOrFarm =
        this.$route.path.startsWith("/admin") ||
        this.$route.path.startsWith("/farm");

      return !isIsolated && !isAdminOrFarm;
    },
  },

  created() {
    this.syncAuthState();
    window.addEventListener("auth-changed", this.syncAuthState);
  },

  beforeUnmount() {
    window.removeEventListener("auth-changed", this.syncAuthState);
  },

  watch: {
    $route() {
      this.syncAuthState();
    },
  },

  methods: {
    syncAuthState() {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      const token = localStorage.getItem("token");

      this.currentUser = user;
      this.isLoggedIn = !!token && !!user;
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