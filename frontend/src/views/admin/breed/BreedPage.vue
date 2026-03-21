    <template>
    <div class="p-2">
        <h4 class="mb-4 text-dark font-weight-bold">
        <i class="fas fa-dna text-info"></i> QUẢN LÝ DANH MỤC GIỐNG CHÓ
        </h4>

        <div v-if="isFormOpen">
        <BreedForm 
            :breedData="editingBreed" 
            @save="handleSave" 
            @cancel="isFormOpen = false" 
        />
        </div>

        <div v-else>
        <BreedList 
            :breeds="allBreeds" 
            @show-form="openAddForm" 
            @edit="openEditForm" 
            @delete="handleDeleteBreed" 
        />
        </div>
    </div>
    </template>

    <script>
    import BreedForm from "./BreedForm.vue";
    import BreedList from "./BreedList.vue";
    import BreedService from "@/services/breed.service"; 

    export default {
    components: { BreedForm, BreedList },
    data() {
        return {
        isFormOpen: false, 
        editingBreed: null, 
        allBreeds: [] 
        };
    },
    methods: {
        // 1. Lấy dữ liệu từ Backend
        async retrieveBreeds() {
        try {
            this.allBreeds = await BreedService.getAll();
        } catch (error) {
            console.log("Lỗi khi lấy danh sách giống chó:", error);
        }
        },

        // 2. Mở form Thêm mới & TỰ ĐỘNG LẤY MÀ (G001, G002...)
        async openAddForm() {
        this.isFormOpen = true; 
        this.editingBreed = null; 

        try {
            const response = await BreedService.getNextCode();
            this.editingBreed = { 
            maGiong: response.nextCode, 
            name: "", 
            origin: "", 
            description: "",
            status: "active" 
            };
        } catch (error) {
            console.log("Lỗi không lấy được mã tự động:", error);
            this.editingBreed = { maGiong: "", name: "", origin: "", description: "", status: "active" };
        }
        },

        // 3. Mở form Sửa 
        openEditForm(breed) {
        this.editingBreed = breed;
        this.isFormOpen = true;
        },

        // 4. Xử lý khi bấm nút LƯU (Có chứa Form Data ảnh)
        async handleSave(formData) {
        try {
            // Dùng formData.get để lấy ID
            const id = formData.get("_id") || formData.get("id");

            if (id) {
            await BreedService.update(id, formData);
            alert("Cập nhật giống chó thành công!");
            } else {
            await BreedService.create(formData);
            alert("Đã thêm giống chó mới và lưu ảnh thành công!");
            }

            this.isFormOpen = false; 
            this.retrieveBreeds();   
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Có lỗi xảy ra khi lưu!";
            alert("❌ LỖI: " + errorMessage);
        }
        },

        // 5. Hàm XÓA (Đã được khôi phục!)
        async handleDeleteBreed(id) {
        if (confirm("Bạn có chắc chắn muốn xóa giống chó này không?")) {
            try {
            await BreedService.delete(id);
            alert("Đã xóa giống chó thành công!");
            this.retrieveBreeds(); 
            } catch (error) {
            const errorMessage = error.response?.data?.message || "Lỗi hệ thống không xác định khi xóa!";
            alert("❌ LỖI: " + errorMessage);
            }
        }
        }
    },
    mounted() {
        this.retrieveBreeds();
    }
    };
    </script>