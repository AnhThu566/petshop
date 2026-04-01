import { createWebHistory, createRouter } from "vue-router";
import Login from "@/views/Login.vue";
import Home from "@/views/customer/Home.vue";

// ==========================================
// IMPORT CÁC TRANG CỦA ADMIN
// ==========================================
import AdminDashboard from "@/views/admin/AdminDashboard.vue";
import DashboardOverview from "@/views/admin/DashboardOverview.vue";
import DogPage from "@/views/admin/dog/DogPage.vue";
import FarmPage from "@/views/admin/farm/FarmPage.vue";
import BreedPage from "@/views/admin/breed/BreedPage.vue";
import OrderAdmin from "@/views/admin/order/OrderAdmin.vue";
import AccessoryPage from "@/views/admin/accessory/AccessoryPage.vue";
import ServicePage from "@/views/admin/service/ServicePage.vue";
import ServiceBookingPage from "@/views/admin/service/ServiceBookingPage.vue";
import AccessoryOrderPage from "@/views/admin/accessory/AccessoryOrderPage.vue";
import AccessoryCategoryPage from "@/views/admin/accessory/AccessoryCategoryPage.vue";
import ServiceCategoryPage from "@/views/admin/service/ServiceCategoryPage.vue";

// ==========================================
// IMPORT CÁC TRANG CỦA CHỦ TRẠI (FARM)
// ==========================================
import FarmDashboard from "@/views/farm/FarmDashboard.vue";
import FarmDogList from "@/views/farm/FarmDogList.vue";
import FarmDogForm from "@/views/farm/FarmDogForm.vue";
import FarmTransactionPage from "@/views/farm/FarmTransactionPage.vue";
import FarmProfilePage from "@/views/farm/FarmProfilePage.vue";

// ==========================================
// IMPORT CÁC TRANG CỦA KHÁCH HÀNG (CUSTOMER)
// ==========================================
import Cart from "@/views/customer/Cart.vue";
import DogDetail from "@/views/customer/DogDetail.vue";
import Deposit from "@/views/customer/Deposit.vue";
import OrderHistory from "@/views/customer/OrderHistory.vue";
import Register from "@/views/customer/Register.vue";
import Profile from "@/views/customer/Profile.vue";
import AccessoryList from "@/views/customer/AccessoryList.vue";
import AccessoryDetail from "@/views/customer/AccessoryDetail.vue";
import ServiceList from "@/views/customer/ServiceList.vue";
import ServiceDetail from "@/views/customer/ServiceDetail.vue";
import ServiceBookingHistory from "@/views/customer/ServiceBookingHistory.vue";
import AccessoryOrderHistory from "@/views/customer/AccessoryOrderHistory.vue";

const routes = [
    {
        path: "/",
        name: "home",
        component: Home
    },

        {
    path: "/dogs",
    name: "dog-list",
    component: Home
},

    {
        path: "/cart",
        name: "Cart",
        component: Cart,
        meta: { requiresCustomer: true }
    },

    {
        path: "/login",
        name: "login",
        component: Login
    },



    {
        path: "/dog/:id",
        name: "DogDetail",
        component: DogDetail
    },

    {
        path: "/deposit",
        name: "Deposit",
        component: Deposit,
        meta: { requiresCustomer: true }
    },

    {
        path: "/tra-cuu-don",
        name: "order-history",
        component: OrderHistory,
        meta: { requiresCustomer: true }
    },

    {
        path: "/register",
        name: "register",
        component: Register
    },

    {
        path: "/profile",
        name: "profile",
        component: Profile,
        meta: { requiresCustomer: true }
    },

    {
        path: "/accessories",
        name: "accessory-list",
        component: AccessoryList
    },

    {
        path: "/accessories/:id",
        name: "accessory-detail",
        component: AccessoryDetail
    },

    {
        path: "/services",
        name: "service-list",
        component: ServiceList
    },

    {
        path: "/services/:id",
        name: "service-detail",
        component: ServiceDetail
    },
    {
        path: "/service-bookings",
        name: "service-booking-history",
        component: ServiceBookingHistory,
        meta: { requiresCustomer: true }
    },
    {
        path: "/accessory-orders",
        name: "accessory-order-history",
        component: AccessoryOrderHistory,
        meta: { requiresCustomer: true }
    },

    // ============================================================
    // ROUTER CHO CHỦ TRẠI (FARM)
    // ============================================================
{
    path: "/farm",
    component: FarmDashboard,
    meta: { requiresFarm: true },
    children: [
        {
            path: "",
            redirect: "/farm/dashboard"
        },
        {
            path: "dashboard",
            name: "farm-dog-list",
            component: FarmDogList,
            meta: { requiresFarm: true }
        },
        {
            path: "add-dog",
            name: "farm-dog-add",
            component: FarmDogForm,
            meta: { requiresFarm: true }
        },
        {
            path: "transactions",
            name: "farm-transactions",
            component: FarmTransactionPage,
            meta: { requiresFarm: true }
        },
        {
    path: "profile",
    name: "farm-profile",
    component: FarmProfilePage,
    meta: { requiresFarm: true }
}

    ]
},

    // ============================================================
    // ROUTER CHO ADMIN
    // ============================================================
    {
        path: "/admin",
        component: AdminDashboard,
        meta: { requiresAdmin: true },
        children: [
            {
                path: "",
                redirect: "/admin/dashboard"
            },
            {
                path: "dashboard",
                name: "admin-overview",
                component: DashboardOverview,
                meta: { requiresAdmin: true }
            },
            {
                path: "dog",
                name: "admin-dog",
                component: DogPage,
                meta: { requiresAdmin: true }
            },
            {
                path: "customer",
                name: "admin-customer",
                component: () => import("@/views/admin/customer/CustomerPage.vue"),
                meta: { requiresAdmin: true }
            },
            {
                path: "farm",
                name: "admin-farm",
                component: FarmPage,
                meta: { requiresAdmin: true }
            },
            {
                path: "breed",
                name: "admin-breed",
                component: BreedPage,
                meta: { requiresAdmin: true }
            },
            {
                path: "vaccine",
                name: "admin-vaccine",
                component: () => import("@/views/admin/vaccine/VaccinePage.vue"),
                meta: { requiresAdmin: true }
            },
            {
                path: "orders",
                name: "admin-orders",
                component: OrderAdmin,
                meta: { requiresAdmin: true }
            },
            {
                path: "accessory",
                name: "admin-accessory",
                component: AccessoryPage,
                meta: { requiresAdmin: true }
            },
            {
                path: "service",
                name: "admin-service",
                component: ServicePage,
                meta: { requiresAdmin: true }
            },
            {
                path: "service-booking",
                name: "admin-service-booking",
                component: ServiceBookingPage,
                meta: { requiresAdmin: true }
            },
            {
    path: "accessory-orders",
    name: "admin-accessory-orders",
    component: AccessoryOrderPage,
    meta: { requiresAdmin: true }
},

{
  path: "accessory-category",
  name: "admin-accessory-category",
  component: AccessoryCategoryPage,
  meta: { requiresAdmin: true }
},

{
  path: "service-category",
  name: "admin-service-category",
  component: ServiceCategoryPage,
  meta: { requiresAdmin: true }
},
        ]
    }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

// ============================================================
// ROUTER GUARD PHÂN QUYỀN
// ============================================================
router.beforeEach((to) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const farm = JSON.parse(localStorage.getItem("farm") || "null");

  const role = user?.role || "";

  // Nếu đã đăng nhập rồi thì không cần vào login/register nữa
  if ((to.path === "/login" || to.path === "/register") && token && user) {
    if (role === "admin") return "/admin/dashboard";
    if (role === "farm") return "/farm/dashboard";
    return "/";
  }

  if (to.matched.some((record) => record.meta.requiresAdmin)) {
    if (!token || !user) {
      alert("Vui lòng đăng nhập tài khoản quản trị.");
      return "/login";
    }

    if (role !== "admin") {
      alert("Bạn không có quyền truy cập khu vực quản trị.");
      return "/";
    }

    return true;
  }

  if (to.matched.some((record) => record.meta.requiresFarm)) {
    if (!token || !user) {
      alert("Vui lòng đăng nhập tài khoản trang trại.");
      return "/login";
    }

    if (role !== "farm") {
      if (role === "admin") return "/admin/dashboard";
      return "/";
    }

    if (farm) return true;
    return true;
  }

  if (to.matched.some((record) => record.meta.requiresCustomer)) {
    if (!token || !user) {
      alert("Vui lòng đăng nhập để tiếp tục.");
      return "/login";
    }

    if (role === "admin") {
      alert("Tài khoản admin không dùng cho chức năng khách hàng.");
      return "/admin/dashboard";
    }

    if (role === "farm") {
      alert("Tài khoản trang trại không dùng cho chức năng khách hàng.");
      return "/farm/dashboard";
    }

    return true;
  }

  return true;
});

export default router;