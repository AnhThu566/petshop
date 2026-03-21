    <template>
    <div class="card shadow-sm border-0">
        <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
        <h5 class="mb-0 text-success font-weight-bold">
            <i class="fas fa-house-user"></i> DANH SÁCH TRẠI CHÓ
        </h5>
        <button class="btn btn-primary font-weight-bold" @click="$emit('show-form')">
            <i class="fas fa-plus-circle"></i> THÊM TRẠI MỚI
        </button>
        </div>

        <div class="card-body p-0">
        <div class="p-3 border-bottom bg-light">
            <div class="input-group" style="max-width: 400px;">
            <input type="text" class="form-control" v-model="searchText" placeholder="Tìm kiếm theo mã hoặc tên trại...">
            <div class="input-group-append">
                <button class="btn btn-success px-4"><i class="fas fa-search"></i></button>
            </div>
            </div>
        </div>

        <table class="table table-hover mb-0 text-center align-middle">
            <thead class="thead-light">
            <tr>
                <th>STT</th>
                <th>Mã Trại</th>
                <th>Hình Ảnh</th>
                <th>Tên Trại</th>
                <th>Chủ Trại (Tài khoản)</th> <th>Điện Thoại</th>
                <th>Trạng Thái</th>
                <th>Thao Tác</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(item, index) in filteredFarms" :key="item._id || item.id">
                <td class="align-middle">{{ index + 1 }}</td>
                <td class="align-middle text-danger font-weight-bold">{{ item.maTrai }}</td>
                
                <td class="align-middle">
                <img v-if="item.images && item.images.length > 0" 
                    :src="'http://localhost:3000' + item.images[0]" 
                    alt="Hình trại" 
                    class="img-thumbnail shadow-sm" 
                    style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
                <span v-else class="text-muted small font-italic">Chưa có ảnh</span>
                </td>

                <td class="align-middle font-weight-bold text-dark">{{ item.name }}</td>
                
                <td class="align-middle text-primary font-weight-bold">
                <i class="fas fa-user-shield"></i> 
                {{ item.ownerId ? item.ownerId.username : 'Đã xóa tài khoản' }}
                </td>

                <td class="align-middle">{{ item.phone }}</td>

                <td class="align-middle">
                <span v-if="item.status === 'active'" class="badge badge-success p-2">Đang hợp tác</span>
                <span v-else-if="item.status === 'paused'" class="badge badge-warning p-2">Tạm ngưng</span>
                <span v-else class="badge badge-secondary p-2">Ngừng hợp tác</span>
                </td>

                <td class="align-middle">
                <button class="btn btn-sm btn-outline-info mr-2 shadow-sm" @click="$emit('edit', item)">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger shadow-sm" @click="$emit('delete', item._id || item.id)">
                    <i class="fas fa-trash"></i>
                </button>
                </td>
            </tr>
            <tr v-if="filteredFarms.length === 0">
                <td colspan="8" class="py-5 text-muted">Không tìm thấy dữ liệu trại chó nào.</td>
            </tr>
            </tbody>
        </table>
        </div>
    </div>
    </template>

    <script>
    export default {
    props: ["farms"],
    data() {
        return {
        searchText: "" 
        };
    },
    computed: {
        filteredFarms() {
        if (!this.searchText) {
            return this.farms;
        }
        const lowerCaseSearch = this.searchText.toLowerCase();
        return this.farms.filter(farm => 
            (farm.name && farm.name.toLowerCase().includes(lowerCaseSearch)) ||
            (farm.maTrai && farm.maTrai.toLowerCase().includes(lowerCaseSearch))
        );
        }
    }
    };
    </script>

    <style scoped>
    .align-middle {
    vertical-align: middle !important;
    }
    </style>