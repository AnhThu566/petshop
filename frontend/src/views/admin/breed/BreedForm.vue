<template>
    <div class="card shadow-lg border-0 mb-4 animate__animated animate__fadeIn">
        <div class="card-header bg-primary text-white font-weight-bold py-3 d-flex justify-content-between align-items-center">
            <span>
                <i :class="isEditMode ? 'fas fa-edit' : 'fas fa-plus-circle'"></i> 
                {{ isEditMode ? ' CẬP NHẬT GIỐNG CHÓ' : ' NHẬP THÔNG TIN GIỐNG CHÓ' }}
            </span>
            <span class="badge badge-light text-primary">Mã giống: {{ breed.maGiong || 'Tự động' }}</span>
        </div>

        <div class="card-body p-4">
            <form @submit.prevent="submitForm">
                <div class="row">
                    <div class="col-md-6 border-right">
                        <h5 class="text-primary border-bottom pb-2 mb-3">
                            <i class="fas fa-info-circle"></i> 1. Thông tin chung
                        </h5>
                        <div class="form-group mb-3">
                            <label class="font-weight-bold">Tên giống chó:</label>
                            <input type="text" class="form-control" v-model="breed.name" placeholder="Ví dụ: Poodle, Alaska..." required>
                        </div>
                        <div class="form-group mb-3">
                            <label class="font-weight-bold">Nguồn gốc:</label>
                            <input type="text" class="form-control" v-model="breed.origin" placeholder="Ví dụ: Đức, Pháp, Việt Nam...">
                        </div>
                        <div class="form-group mb-3" v-if="isEditMode">
                            <label class="font-weight-bold text-danger"><i class="fas fa-toggle-on"></i> Trạng thái:</label>
                            <select class="form-control border-danger" v-model="breed.status">
                                <option value="active">Đang kinh doanh</option>
                                <option value="paused">Tạm ngưng</option>
                                <option value="stopped">Ngừng kinh doanh</option>
                            </select>
                        </div>
                    </div>

                    <div class="col-md-6">
                        <h5 class="text-success border-bottom pb-2 mb-3">
                            <i class="fas fa-camera"></i> 2. Hình ảnh & Mô tả
                        </h5>
                        
                        <div class="form-group mb-3">
                            <label class="font-weight-bold text-success"><i class="fas fa-pencil-alt"></i> Mô tả đặc điểm:</label>
                            <textarea class="form-control border-success shadow-sm" v-model="breed.description" rows="3" 
                                placeholder="Mô tả ngoại hình, tính cách..." 
                                style="border-radius: 12px; resize: none; background-color: #f9fff9;"></textarea>
                        </div>

                        <div class="form-group mb-3">
                            <label class="font-weight-bold text-success">Hình ảnh giống chó:</label>
                            <div class="custom-file mb-2">
                                <input type="file" class="custom-file-input" id="breedImage" @change="handleFileUpload" accept="image/*" ref="fileInput">
                                <label class="custom-file-label border-success" for="breedImage">{{ fileName || 'Chọn ảnh giống chó...' }}</label>
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

                <div class="text-center border-top pt-4 mt-3">
                    <button type="button" class="btn btn-secondary mr-3 px-4 shadow-sm" @click="$emit('cancel')">HỦY BỎ</button>
                    <button type="submit" class="btn btn-primary px-5 font-weight-bold shadow-lg">
                        <i class="fas fa-save"></i> LƯU GIỐNG CHÓ
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
export default {
    props: ["breedData"],
    data() {
        return {
            breed: { maGiong: "", name: "", origin: "", description: "", status: "active" },
            selectedFile: null,
            previewImage: null,
            fileName: ""
        };
    },
    computed: {
        isEditMode() {
            return !!(this.breed._id || this.breed.id);
        },
        // Nguồn ảnh thông minh: Ưu tiên ảnh nháp > Ảnh từ server
        imageSource() {
            if (this.previewImage) return this.previewImage;
            if (this.breed.images && this.breed.images.length > 0) {
                return `http://localhost:3000${this.breed.images[0]}`;
            }
            return null;
        }
    },
    watch: {
        breedData: {
            handler(newData) {
                if (newData) {
                    this.breed = { ...newData };
                    this.selectedFile = null;
                    this.previewImage = null; // Reset để imageSource tự tính toán
                    this.fileName = "";
                }
            },
            immediate: true
        }
    },
    methods: {
        handleFileUpload(event) {
            const file = event.target.files[0];
            if (file) {
                this.selectedFile = file;
                this.fileName = file.name;
                this.previewImage = URL.createObjectURL(file);
            }
        },
        // 👇 HÀM XÓA ẢNH
        removeImage() {
            this.selectedFile = null;
            this.previewImage = null;
            this.fileName = "";
            if (this.$refs.fileInput) {
                this.$refs.fileInput.value = "";
            }
            // Nếu xóa cả ảnh cũ trên server trong form hiển thị
            if (this.breed.images) this.breed.images = [];
        },
        submitForm() {
            const formData = new FormData();
            formData.append("name", this.breed.name || "");
            formData.append("origin", this.breed.origin || "");
            formData.append("description", this.breed.description || "");
            formData.append("status", this.breed.status || "active");

            const id = this.breed._id || this.breed.id;
            if (id) {
                formData.append("_id", id);
            } else {
                formData.append("maGiong", this.breed.maGiong || "");
            }

            if (this.selectedFile) {
                formData.append("image", this.selectedFile);
            }

            this.$emit("save", formData);
        }
    }
};
</script>

<style scoped>
/* CSS cho nút X và khung ảnh giống hệt FarmForm */
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
    max-height: 150px;
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
    width: 25px; height: 25px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    transition: transform 0.2s;
}
.btn-remove-image:hover { transform: scale(1.2); background-color: #c82333; }
</style>