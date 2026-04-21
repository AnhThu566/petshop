<template>
  <div class="customer-form-page bg-light py-3">
    <div class="w-100 px-2">
      <div class="card border-0 shadow-sm">
        <div
          class="card-header bg-primary text-white py-3 d-flex justify-content-between align-items-center flex-wrap"
        >
          <div class="mb-2 mb-md-0">
            <h5 class="mb-1 font-weight-bold">
              <i
                class="fas mr-2"
                :class="customer._id ? 'fa-user-edit' : 'fa-plus-circle'"
              ></i>
              {{
                customer._id
                  ? "CẬP NHẬT THÔNG TIN KHÁCH HÀNG"
                  : "ĐĂNG KÝ HỆ THỐNG KHÁCH HÀNG MỚI"
              }}
            </h5>
            <div class="small text-white-50">
              Quản lý tài khoản và hồ sơ khách hàng trong hệ thống.
            </div>
          </div>

          <span class="badge badge-light px-3 py-2 text-primary shadow-sm code-badge">
            Mã khách hàng:
            <strong class="text-danger ml-1">{{ displayCode }}</strong>
          </span>
        </div>

        <div class="card-body p-4 bg-white">
          <form @submit.prevent="submitForm">
            <div class="row">
              <div class="col-lg-6 mb-4 mb-lg-0">
                <div class="section-card h-100">
                  <h6 class="section-title text-primary">
                    <i class="fas fa-user-circle mr-2"></i>
                    1. Thông tin tài khoản
                  </h6>

                  <div class="form-group">
                    <label class="form-label">Tên đăng nhập (Username)</label>
                    <input
                      type="text"
                      class="form-control custom-input"
                      :class="customer._id ? 'bg-light text-muted' : 'input-highlight'"
                      v-model="customer.username"
                      :readonly="!!customer._id"
                      required
                    />
                    <small v-if="customer._id" class="text-muted italic d-block mt-1">
                      * Không được thay đổi tên đăng nhập
                    </small>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Email chính chủ</label>
                    <input
                      type="email"
                      class="form-control custom-input"
                      v-model="customer.email"
                      required
                      placeholder="example@gmail.com"
                    />
                  </div>

                  <div v-if="!customer._id" class="form-group">
                    <label class="form-label">Mật khẩu đăng nhập</label>
                    <input
                      type="password"
                      class="form-control custom-input"
                      v-model="customer.password"
                      placeholder="Nhập mật khẩu cho khách hàng mới"
                    />
                    <small class="text-muted d-block mt-1">
                      * Chỉ dùng khi tạo khách hàng mới
                    </small>
                  </div>

                  <div class="form-group mb-0">
                    <label class="form-label text-danger">Trạng thái hoạt động</label>
                    <select
                      class="form-control custom-input font-weight-bold"
                      v-model="customer.status"
                    >
                      <option value="active">Đang hoạt động (Active)</option>
                      <option value="locked">Bị khóa (Locked)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="col-lg-6">
                <div class="section-card h-100">
                  <h6 class="section-title text-success">
                    <i class="fas fa-address-card mr-2"></i>
                    2. Hồ sơ khách hàng
                  </h6>

                  <div class="form-group">
                    <label class="form-label">Họ tên người đại diện</label>
                    <input
                      type="text"
                      class="form-control custom-input input-success"
                      v-model="customer.fullName"
                      required
                      placeholder="Nhập họ tên đầy đủ..."
                    />
                  </div>

                  <div class="form-row">
                    <div class="form-group col-md-6">
                      <label class="form-label">Số điện thoại</label>
                      <input
                        type="text"
                        class="form-control custom-input"
                        v-model="customer.phone"
                        placeholder="09xxx..."
                      />
                    </div>

                    <div class="form-group col-md-6">
                      <label class="form-label">Ngày sinh</label>
                      <input
                        type="date"
                        class="form-control custom-input"
                        v-model="formattedBirthday"
                      />
                    </div>
                  </div>

                  <div class="form-group mb-0">
                    <label class="form-label">Giới tính</label>
                    <select class="form-control custom-input" v-model="customer.gender">
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div class="text-center mt-4 pt-4 border-top">
              <button
                type="button"
                class="btn btn-secondary shadow-sm px-4 py-2 mr-2 mb-2 mb-sm-0 font-weight-bold"
                @click="$emit('cancel')"
              >
                HỦY BỎ
              </button>

              <button
                type="submit"
                class="btn btn-primary shadow-sm px-4 py-2 font-weight-bold text-uppercase"
              >
                <i class="fas fa-check-circle mr-1"></i>
                {{
                  customer._id
                    ? "Xác nhận cập nhật"
                    : "Xác nhận tạo hệ thống"
                }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CustomerService from "@/services/customer.service";

export default {
  props: ["customerData"],

  data() {
    return {
      customer: {
        fullName: "",
        email: "",
        username: "",
        phone: "",
        password: "",
        gender: "Nam",
        status: "active",
        customerCode: "",
      },
      nextCodeForAdd: "KH---",
    };
  },

  computed: {
    displayCode() {
      if (this.customer._id) return this.customer.customerCode;
      return this.nextCodeForAdd;
    },

    formattedBirthday: {
      get() {
        if (!this.customer.birthday) return "";
        return new Date(this.customer.birthday).toISOString().split("T")[0];
      },
      set(val) {
        this.customer.birthday = val;
      },
    },
  },

  watch: {
    customerData: {
      handler(newData) {
        const cid = newData?._id || newData?.id;

        if (newData && cid) {
          this.customer = { ...newData, _id: cid };
        } else {
          this.resetForm();
          this.fetchNextCode();
        }
      },
      immediate: true,
    },
  },

  methods: {
    async fetchNextCode() {
      try {
        const response = await CustomerService.getNextCode();
        this.nextCodeForAdd = response.nextCode;
      } catch (error) {
        console.error("Không lấy được mã khách hàng tiếp theo:", error);
      }
    },

    resetForm() {
      this.customer = {
        fullName: "",
        email: "",
        username: "",
        phone: "",
        password: "",
        gender: "Nam",
        status: "active",
        customerCode: "",
      };
    },

    submitForm() {
      const formData = new FormData();

      if (this.customer._id) formData.append("_id", this.customer._id);

      formData.append("username", this.customer.username || "");

      if (!this.customer._id && this.customer.password) {
        formData.append("password", this.customer.password);
      }

      formData.append("fullName", this.customer.fullName || "");
      formData.append("email", this.customer.email || "");
      formData.append("phone", this.customer.phone || "");
      formData.append("gender", this.customer.gender || "Nam");
      formData.append("birthday", this.customer.birthday || "");
      formData.append("status", this.customer.status || "active");

      this.$emit("save", formData);
    },
  },
};
</script>

<style scoped>
.customer-form-page {
  min-height: 100%;
}

.code-badge {
  font-size: 0.9rem;
  border-radius: 999px;
}

.section-card {
  border: 1px solid #e9ecef;
  border-radius: 14px;
  padding: 20px;
  background: #fff;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.04);
}

.section-title {
  font-weight: 800;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eef2f6;
}

.form-label {
  font-size: 0.92rem;
  font-weight: 700;
  color: #334155;
  margin-bottom: 0.45rem;
}

.custom-input {
  min-height: 44px;
  border-radius: 10px;
  border: 1px solid #ced4da;
  font-size: 0.95rem;
}

.custom-input:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.12);
}

.input-highlight {
  border-color: #86b7fe;
}

.input-success {
  border-color: #9dd9b8;
}

.italic {
  font-style: italic;
}

@media (max-width: 991.98px) {
  .section-card {
    padding: 16px;
  }
}
</style>