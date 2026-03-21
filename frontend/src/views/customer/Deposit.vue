<template>
  <div class="deposit-page bg-light py-5" style="min-height: 100vh;">
    <div class="container custom-container">
      
      <div class="text-center mb-5">
        <h2 class="font-weight-bold" style="color: #6a1b9a; text-transform: uppercase;">
          <i class="fas fa-hand-holding-usd mr-2 text-warning"></i> Đặt cọc đón bé về nhà
        </h2>
        <p class="text-muted">Vui lòng điền thông tin và thanh toán cọc để giữ bé cún. Hệ thống sẽ khóa bé lại không cho người khác mua trùng!</p>
      </div>

      <div class="row" v-if="dog">
        
        <div class="col-lg-7 mb-4">
          <div class="card border-0 shadow-sm rounded-lg p-4 p-md-5">
            <h5 class="font-weight-bold border-bottom pb-3 mb-4" style="color: #4a148c;">Thông tin người nhận</h5>
            
            <form @submit.prevent="submitDeposit">
              <div class="form-group mb-4">
                <label class="font-weight-bold text-muted small">Họ và tên người nhận <span class="text-danger">*</span></label>
                <div class="input-group">
                  <div class="input-group-prepend">
                    <span class="input-group-text bg-white"><i class="fas fa-user text-muted"></i></span>
                  </div>
                  <input type="text" class="form-control" v-model="form.customerName" placeholder="Nhập họ tên của bạn..." required>
                </div>
              </div>

              <div class="form-group mb-4">
                <label class="font-weight-bold text-muted small">Số điện thoại liên hệ <span class="text-danger">*</span></label>
                <div class="input-group">
                  <div class="input-group-prepend">
                    <span class="input-group-text bg-white"><i class="fas fa-phone text-muted"></i></span>
                  </div>
                  <input type="tel" class="form-control" v-model="form.customerPhone" placeholder="Nhập số điện thoại..." required>
                </div>
              </div>

              <div class="form-group mb-4">
                <label class="font-weight-bold text-muted small">Địa chỉ giao thú cưng <span class="text-danger">*</span></label>
                <div class="input-group">
                  <div class="input-group-prepend">
                    <span class="input-group-text bg-white"><i class="fas fa-map-marker-alt text-muted"></i></span>
                  </div>
                  <input type="text" class="form-control" v-model="form.customerAddress" placeholder="Nhập số nhà, tên đường, phường/xã, quận/huyện..." required>
                </div>
              </div>

              <div class="form-group mb-4">
                <label class="font-weight-bold text-muted small">Ghi chú thêm (Tùy chọn)</label>
                <textarea class="form-control" v-model="form.note" rows="3" placeholder="Lời nhắn cho trang trại..."></textarea>
              </div>

              <button type="submit" class="btn btn-main btn-lg btn-block font-weight-bold py-3 mt-4 shadow" :disabled="isSubmitting">
                <span v-if="isSubmitting"><i class="fas fa-spinner fa-spin mr-2"></i> Đang xử lý...</span>
                <span v-else><i class="fas fa-check-circle mr-2"></i> XÁC NHẬN & HOÀN TẤT ĐẶT CỌC</span>
              </button>
            </form>

          </div>
        </div>

        <div class="col-lg-5">
          <div class="card border-0 shadow-sm rounded-lg overflow-hidden sticky-top" style="top: 20px;">
            
            <div class="bg-light p-4 border-bottom d-flex align-items-center">
              <img :src="dog.image ? 'http://localhost:3000' + dog.image : 'https://via.placeholder.com/100'" 
                   class="rounded shadow-sm object-fit-cover mr-3 border" style="width: 90px; height: 90px; border-color: #e1d5ed !important;">
              <div>
                <h5 class="font-weight-bold mb-1 text-dark">{{ dog.name }}</h5>
                <p class="text-muted small mb-1">Giống: {{ dog.breedId?.name || 'Đang cập nhật' }}</p>
                <strong class="text-danger">{{ dog.price?.toLocaleString('vi-VN') }} ₫</strong>
              </div>
            </div>

            <div class="p-4 bg-white">
              <div class="d-flex justify-content-between mb-3 text-muted">
                <span>Tổng giá trị:</span>
                <span>{{ dog.price?.toLocaleString('vi-VN') }} ₫</span>
              </div>
              <div class="d-flex justify-content-between mb-4 text-muted border-bottom pb-3">
                <span>Tỉ lệ đặt cọc:</span>
                <span>30%</span>
              </div>
              <div class="d-flex justify-content-between align-items-center mb-4">
                <span class="font-weight-bold h6 mb-0 text-dark">SỐ TIỀN CẦN CỌC:</span>
                <strong class="text-danger h3 mb-0">{{ depositAmount.toLocaleString('vi-VN') }} ₫</strong>
              </div>

              <div class="payment-info p-3 rounded" style="background-color: #f4ebf8; border: 1px dashed #6a1b9a;">
                <p class="font-weight-bold mb-2 text-center" style="color: #6a1b9a;"><i class="fas fa-university mr-1"></i> Thông tin chuyển khoản</p>
                <div class="small text-dark mb-1"><strong>Ngân hàng:</strong> Vietcombank (VCB)</div>
                <div class="small text-dark mb-1"><strong>Chủ tài khoản:</strong> NGUYEN VAN A</div>
                <div class="small text-dark mb-1 d-flex justify-content-between">
                  <span><strong>Số tài khoản:</strong> 0123456789</span>
                  <i class="far fa-copy text-primary cursor-pointer" title="Copy"></i>
                </div>
                <div class="small text-danger mt-2 font-italic text-center">
                  *Nội dung CK: <strong>Cọc bé {{ dog.maCho || dog.name }} - [SĐT của bạn]</strong>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      <div v-else class="text-center py-5 bg-white shadow-sm rounded">
        <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
        <h4 class="text-dark">Không tìm thấy thông tin thú cưng!</h4>
        <p class="text-muted mb-4">Vui lòng quay lại danh sách để chọn một bé cún trước khi đặt cọc nhé.</p>
        <router-link to="/dogs" class="btn btn-main px-4 py-2 font-weight-bold rounded-pill">Quay lại danh sách</router-link>
      </div>

    </div>
  </div>
</template>

<script>
import OrderService from "@/services/order.service";
import DogService from "@/services/dog.service";

export default {
  data() {
    return {
      dog: null,
      currentUser: null, // Thêm biến để chứa thông tin người dùng
      form: {
        customerName: "",
        customerPhone: "",
        customerAddress: "",
        note: ""
      },
      isSubmitting: false
    };
  },
  computed: {
    // Tự động tính tiền cọc 30%
    depositAmount() {
      if (!this.dog || !this.dog.price) return 0;
      return this.dog.price * 0.3;
    }
  },
async created() {
  const userData = localStorage.getItem("user");
  if (userData) {
    this.currentUser = JSON.parse(userData);
    this.form.customerName = this.currentUser.fullName || this.currentUser.username || "";
    this.form.customerPhone = this.currentUser.phone || "";
    this.form.customerAddress = this.currentUser.address || "";
  }

  const savedDog = localStorage.getItem("checkoutDog");
  if (savedDog) {
    const localDog = JSON.parse(savedDog);
    try {
      this.dog = await DogService.get(localDog._id || localDog.id);
    } catch (error) {
      console.error(error);
      this.dog = null;
    }
  }
},
  methods: {
async submitDeposit() {
  if (!this.dog) return;

  if (!this.currentUser) {
    alert("⚠️ Vui lòng đăng nhập để thực hiện đặt cọc!");
    return;
  }

  if (this.dog.status !== "Đã duyệt") {
    alert("❌ Bé chó này hiện không còn sẵn sàng để đặt cọc.");
    return;
  }

  this.isSubmitting = true;

  const orderData = {
    userId: this.currentUser._id || this.currentUser.id,
    customerName: this.form.customerName,
    customerPhone: this.form.customerPhone,
    customerAddress: this.form.customerAddress,
    note: this.form.note,
    dogId: this.dog._id || this.dog.id,
    farmId: this.dog.farmId?._id || this.dog.farmId,
    totalPrice: this.dog.price,
  };

  try {
    await OrderService.createDeposit(orderData);

    localStorage.removeItem("checkoutDog");
    alert("🎉 Đặt cọc thành công! Hệ thống đã giữ chỗ bé chó cho bạn.");
    this.$router.push("/tra-cuu-don");
  } catch (error) {
    alert("❌ Có lỗi xảy ra: " + (error.response?.data?.message || error.message));
  } finally {
    this.isSubmitting = false;
  }
}
  }
};
</script>

<style scoped>
@media (min-width: 1200px) {
  .custom-container { max-width: 1300px !important; }
}
.object-fit-cover { object-fit: cover; }
.cursor-pointer { cursor: pointer; }

/* NÚT BẤM MÀU TÍM ĐẶC TRƯNG */
.btn-main {
  background-color: #6a1b9a;
  color: white;
  transition: all 0.2s;
  border: none;
}
.btn-main:hover {
  background-color: #4a148c;
  color: white;
  transform: translateY(-2px);
}
.btn-main:disabled {
  background-color: #9c27b0;
  opacity: 0.7;
  transform: none;
}

/* Tùy chỉnh form */
.form-control {
  border-left: none;
  border-color: #e1d5ed;
}
.form-control:focus {
  box-shadow: none;
  border-color: #6a1b9a;
}
.input-group-text {
  border-right: none;
  border-color: #e1d5ed;
}
.input-group:focus-within .input-group-text {
  border-color: #6a1b9a;
}
.input-group:focus-within .fas {
  color: #6a1b9a !important;
}
</style>