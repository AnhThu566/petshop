<template>
  <div class="d-flex" style="min-height: 100vh; overflow-x: hidden;">
    <FarmSidebar />

    <div class="flex-grow-1 bg-light d-flex flex-column">
      <FarmHeader />

      <div class="p-4 flex-grow-1">
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
    const user = localStorage.getItem("user");
    const farm = localStorage.getItem("farm");

    if (!user || !farm) {
      this.$router.push("/login");
    }
  },
};
</script>