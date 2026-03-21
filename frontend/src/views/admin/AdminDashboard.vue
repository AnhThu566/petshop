    <template>
    <div class="d-flex align-items-stretch" style="background-color: #f4f7fa; min-height: 100vh;">
        
        <AdminSidebar class="flex-shrink-0" />

        <div class="w-100 d-flex flex-column">
        <AdminHeader />

        <div class="container-fluid p-4 flex-grow-1">
            <router-view></router-view>
        </div>

        <AdminFooter />
        </div>
    </div>
    </template>

    <script>
    import AdminSidebar from "@/components/admin/AdminSidebar.vue";
    import AdminHeader from "@/components/admin/AdminHeader.vue";
    import AdminFooter from "@/components/admin/AdminFooter.vue";

    export default {
    components: {
        AdminSidebar, AdminHeader, AdminFooter
    },
    created() {
        // Bảo mật: Kiểm tra xem có phải Admin không mới cho vào Khung này
        const userData = localStorage.getItem("user");
        if (!userData) {
        this.$router.push("/");
        return;
        }
        const currentUser = JSON.parse(userData);
        if (currentUser.role !== 'admin') {
        alert("Bạn không có quyền truy cập trang này!");
        this.$router.push("/");
        }
    }
    };
    </script>