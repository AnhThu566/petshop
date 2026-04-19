<template>
  <div class="farm-dashboard-layout">
    <FarmSidebar />

    <div class="farm-dashboard-main">
      <FarmHeader />

      <div class="farm-dashboard-content">
        <router-view />
      </div>

      <FarmFooter />
    </div>
  </div>
</template>

<script>
import FarmSidebar from "@/components/farm/FarmSidebar.vue";
import FarmHeader from "@/components/farm/FarmHeader.vue";
import FarmFooter from "@/components/farm/FarmFooter.vue";

export default {
  name: "FarmDashboard",

  components: {
    FarmSidebar,
    FarmHeader,
    FarmFooter,
  },

  created() {
    const userData = localStorage.getItem("user");
    const farmData = localStorage.getItem("farm");

    if (!userData || !farmData) {
      this.$router.push("/login");
      return;
    }

    const currentUser = JSON.parse(userData);
    if (String(currentUser.role || "").toLowerCase() !== "farm") {
      alert("Bạn không có quyền truy cập khu vực trang trại!");
      this.$router.push("/");
    }
  },
};
</script>

<style scoped>
.farm-dashboard-layout {
  display: flex;
  min-height: 100vh;
  width: 100%;
  background: #f8f9fa;
}

.farm-dashboard-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
}

.farm-dashboard-content {
  flex: 1;
  min-width: 0;
  padding: 24px;
  overflow-x: auto;
  overflow-y: auto;
}

@media (max-width: 991.98px) {
  .farm-dashboard-content {
    padding: 16px;
  }
}
</style>