    <template>
    <div class="card shadow-sm border-0">
        <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
        <h5 class="mb-0 text-primary font-weight-bold">
            <i class="fas fa-list"></i> DANH SÁCH GIỐNG CHÓ
        </h5>
        <button class="btn btn-success font-weight-bold" @click="$emit('show-form')">
            <i class="fas fa-plus-circle"></i> THÊM GIỐNG MỚI
        </button>
        </div>

        <div class="card-body p-0">
        <div class="p-3 border-bottom bg-light">
            <div class="input-group" style="max-width: 400px;">
            <input type="text" class="form-control" v-model="searchText" placeholder="Tìm kiếm theo mã hoặc tên giống chó...">
            <div class="input-group-append">
                <button class="btn btn-primary px-4"><i class="fas fa-search"></i></button>
            </div>
            </div>
        </div>

        <table class="table table-hover mb-0 text-center align-middle">
            <thead class="thead-light">
            <tr>
                <th>STT</th>
                <th>Mã Giống</th>
                <th>Hình Ảnh</th> <th>Tên Giống Chó</th>
                <th>Nguồn Gốc</th>
                <th>Trạng Thái</th>
                <th>Thao Tác</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(item, index) in filteredBreeds" :key="item._id">
                <td class="align-middle">{{ index + 1 }}</td>
                <td class="align-middle text-danger font-weight-bold">{{ item.maGiong }}</td>
                
                <td class="align-middle">
                <img v-if="item.images && item.images.length > 0" 
                    :src="'http://localhost:3000' + item.images[0]" 
                    alt="Hình giống chó" 
                    class="img-thumbnail shadow-sm" 
                    style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
                <span v-else class="text-muted small font-italic">Chưa có ảnh</span>
                </td>

                <td class="align-middle font-weight-bold text-dark">{{ item.name }}</td>
                <td class="align-middle">{{ item.origin || 'Đang cập nhật' }}</td>
                <td class="align-middle">
                <span v-if="item.status === 'active'" class="badge badge-success p-2">Đang kinh doanh</span>
                <span v-else-if="item.status === 'paused'" class="badge badge-warning p-2">Tạm ngưng</span>
                <span v-else class="badge badge-secondary p-2">Ngừng kinh doanh</span>
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
            <tr v-if="filteredBreeds.length === 0">
                <td colspan="7" class="py-5 text-muted">Không tìm thấy dữ liệu giống chó nào.</td>
            </tr>
            </tbody>
        </table>
        </div>

        <div class="card-footer bg-white border-0 d-flex justify-content-center">
        <nav>
            <ul class="pagination pagination-sm mb-0">
            <li class="page-item disabled"><a class="page-link" href="#">Trước</a></li>
            <li class="page-item active"><a class="page-link" href="#">1</a></li>
            <li class="page-item"><a class="page-link" href="#">2</a></li>
            <li class="page-item"><a class="page-link" href="#">Sau</a></li>
            </ul>
        </nav>
        </div>
    </div>
    </template>

    <script>
    export default {
    props: ["breeds"],
    data() {
        return {
        searchText: "" 
        };
    },
    computed: {
        filteredBreeds() {
        if (!this.searchText) {
            return this.breeds;
        }
        const lowerCaseSearch = this.searchText.toLowerCase();
        return this.breeds.filter(breed => 
            (breed.name && breed.name.toLowerCase().includes(lowerCaseSearch)) ||
            (breed.maGiong && breed.maGiong.toLowerCase().includes(lowerCaseSearch))
        );
        }
    }
    };
    </script>

    <style scoped>
    /* Thêm CSS nhỏ để căn giữa các nội dung trong bảng cho đẹp mắt */
    .align-middle {
    vertical-align: middle !important;
    }
    </style>