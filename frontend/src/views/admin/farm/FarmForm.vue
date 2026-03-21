<template>
    <div class="card shadow-lg border-0 mb-4 animate__animated animate__fadeIn">
        <div class="card-header bg-primary text-white font-weight-bold py-3 d-flex justify-content-between">
            <span>
                <i :class="isEditMode ? 'fas fa-edit' : 'fas fa-plus-circle'"></i> 
                {{ isEditMode ? 'CẬP NHẬT THÔNG TIN TRANG TRẠI' : 'ĐĂNG KÝ HỆ THỐNG TRANG TRẠI MỚI' }}
            </span>
            <span class="badge badge-light text-primary">Mã trang trại: {{ farm.maTrai }}</span>
        </div>
        <div class="card-body p-4">
            <form @submit.prevent="submitForm">
                <div class="row">
                    <div class="col-md-6 border-right" v-if="!isEditMode">
                        <h5 class="text-primary border-bottom pb-2 mb-3">
                            <i class="fas fa-user-shield"></i> 1. Thông tin Tài khoản
                        </h5>
                        <div class="form-group mb-3">
                            <label class="font-weight-bold">Tên đăng nhập (Username):</label>
                            <input type="text" class="form-control" v-model="farm.username" placeholder="Ví dụ: chutraicantho01" required>
                        </div>
                        <div class="form-group mb-3">
                            <label class="font-weight-bold">Mật khẩu cấp cho chủ trại:</label>
                            <input type="password" class="form-control" v-model="farm.password" placeholder="Nhập mật khẩu..." required>
                        </div>
                        <div class="form-group mb-3">
                            <label class="font-weight-bold">Email chính chủ:</label>
                            <input type="email" class="form-control" v-model="farm.email" placeholder="example@gmail.com" required>
                        </div>
                        <div class="form-group mb-3">
                            <label class="font-weight-bold">Họ tên người đại diện:</label>
                            <input type="text" class="form-control" v-model="farm.fullName" placeholder="Nhập họ tên đầy đủ...">
                        </div>
                    </div>

                    <div :class="isEditMode ? 'col-md-12' : 'col-md-6'">
                        <h5 class="text-success border-bottom pb-2 mb-3">
                            <i class="fas fa-warehouse"></i> 2. Hồ sơ Trang trại
                        </h5>
                        
                        <div class="form-group mb-3" v-if="isEditMode">
                            <label class="font-weight-bold text-danger"><i class="fas fa-toggle-on"></i> Trạng thái hoạt động:</label>
                            <select class="form-control border-danger" v-model="farm.status">
                                <option value="active">Đang hợp tác (Hoạt động)</option>
                                <option value="paused">Tạm ngưng (Ẩn tạm thời)</option>
                                <option value="stopped">Ngừng hợp tác (Khóa)</option>
                            </select>
                        </div>

                        <div class="form-group mb-3">
                            <label class="font-weight-bold text-success">Tên Trang Trại Hiển Thị:</label>
                            <input type="text" class="form-control border-success" v-model="farm.name" required>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6 form-group mb-3">
                                <label class="font-weight-bold text-success">Số điện thoại Trại:</label>
                                <input type="text" class="form-control border-success" v-model="farm.phone" required>
                            </div>
                            <div class="col-md-6 form-group mb-3">
                                <label class="font-weight-bold text-success">Địa chỉ hoạt động:</label>
                                <input type="text" class="form-control border-success" v-model="farm.address" required>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6 form-group mb-3">
                                <label class="font-weight-bold text-success"><i class="fas fa-pencil-alt"></i> Mô tả chi tiết:</label>
                                <textarea class="form-control border-success shadow-sm" v-model="farm.farmDescription" rows="5" style="border-radius: 12px; resize: none; background-color: #f9fff9;"></textarea>
                            </div>

<div class="col-md-6 form-group mb-3">
    <label class="font-weight-bold text-success">
        <i class="fas fa-image"></i> Hình ảnh đại diện:
    </label>
    <div class="custom-file mb-2">
        <input type="file" class="custom-file-input" id="farmImage" @change="onFileChange" accept="image/*" ref="fileInput">
        <label class="custom-file-label border-success" for="farmImage">
            {{ fileName || 'Chọn ảnh trại...' }}
        </label>
    </div>

    <div v-if="previewImage" class="image-preview-container mt-2">
        <img :src="imageSource" class="img-preview shadow-sm" />
        <button type="button" class="btn-remove-image" @click="removeImage" title="Xóa ảnh này">
            <i class="fas fa-times"></i>
        </button>
    </div>
</div>
                        </div>
                    </div>
                </div>

                <div class="text-center border-top pt-4 mt-3">
                    <button type="button" class="btn btn-secondary mr-3 px-4 shadow-sm" @click="$emit('cancel')">HỦY BỎ</button>
                    <button type="submit" class="btn btn-primary px-5 font-weight-bold shadow-lg">
                        <i class="fas fa-check-circle"></i> {{ isEditMode ? 'CẬP NHẬT THAY ĐỔI' : 'XÁC NHẬN TẠO HỆ THỐNG' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import FarmService from "@/services/farm.service";

export default {
    props: ["farmData"],
    data() {
        return {
            farm: { ...this.farmData },
            selectedFile: null,
            previewImage: null,
            fileName: ""
        };
    },
    computed: {
        // Kiểm tra xem là chế độ Sửa hay Thêm mới
        isEditMode() {
            return !!(this.farm._id || this.farm.id);
        },
        // Quyết định nguồn ảnh hiển thị (Ảnh cũ từ server hoặc ảnh mới chọn)
        imageSource() {
            if (this.previewImage) return this.previewImage;
            if (this.farm.image) return `http://localhost:3000${this.farm.image}`;
            return "https://via.placeholder.com/80";
        }
    },
    methods: {
        async fetchNextCode() {
            if (!this.isEditMode && !this.farm.maTrai) {
                try {
                    const res = await FarmService.getNextCode();
                    this.farm.maTrai = res.nextCode;
                } catch (error) {
                    console.error("Lỗi lấy mã:", error);
                }
            }
        },
        onFileChange(e) {
            const file = e.target.files[0];
            if (file) {
                this.selectedFile = file;
                this.fileName = file.name;
                this.previewImage = URL.createObjectURL(file);
            }
        },

// 👇 HÀM MỚI: Xóa ảnh đã chọn
        removeImage() {
            this.selectedFile = null;
            this.previewImage = null;
            this.fileName = "";
            // Reset giá trị của thẻ input để có thể chọn lại chính file vừa xóa nếu muốn
            if (this.$refs.fileInput) {
                this.$refs.fileInput.value = "";
            }
        },

        submitForm() {
            const formData = new FormData();
            
            // SỬA TẠI ĐÂY: Lấy ID bất kể nó là _id hay id
            const farmId = this.farm._id || this.farm.id;

            if (this.isEditMode && farmId) {
                formData.append("_id", farmId); // Đảm bảo gửi mã thật lên
                formData.append("status", this.farm.status || "active");
            } else {
                formData.append("username", this.farm.username || "");
                formData.append("password", this.farm.password || "");
                formData.append("email", this.farm.email || "");
                formData.append("fullName", this.farm.fullName || "");
            }

            // Các trường khác giữ nguyên
            formData.append("name", this.farm.name || "");
            formData.append("phone", this.farm.phone || "");
            formData.append("address", this.farm.address || "");
            formData.append("farmDescription", this.farm.farmDescription || "");
            formData.append("maTrai", this.farm.maTrai || "");

            if (this.selectedFile) {
                formData.append("image", this.selectedFile);
            }

            this.$emit("save", formData);
        }
    },
    mounted() {
        this.fetchNextCode();
    }
};
</script>

<style scoped>
.image-preview-container {
    position: relative;
    display: inline-block;
    width: 100%;
    text-align: center;
    border: 1px dashed #28a745;
    border-radius: 12px;
    padding: 10px;
    background-color: #f9fff9;
}

.img-preview {
    max-height: 120px;
    border-radius: 8px;
    object-fit: cover;
    max-width: 100%;
}

.btn-remove-image {
    position: absolute;
    top: -10px;
    right: -10px;
    background-color: #dc3545;
    color: white;
    border: none;
    border-radius: 50%;
    width: 25px;
    height: 25px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    transition: transform 0.2s;
}

.btn-remove-image:hover {
    transform: scale(1.2);
    background-color: #c82333;
}
</style>