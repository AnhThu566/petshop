const Breed = require("../models/breed.model");
const ApiError = require("../api-error");
const Dog = require("../models/dog.model");

// 1. HÀM THÊM GIỐNG CHÓ MỚI (Dành cho Admin)
exports.create = async (req, res, next) => {
    try {
        const { maGiong, name, description, origin, status } = req.body;
        
        if (!name) return next(new ApiError(400, "Tên giống chó không được để trống!"));
        if (!maGiong) return next(new ApiError(400, "Lỗi hệ thống: Không có mã giống chó!"));

        // 👉 XỬ LÝ ẢNH: Nếu có ảnh gửi lên thì lưu đường dẫn, không thì để mảng rỗng
        let images = [];
        if (req.file) {
            images.push(`/uploads/${req.file.filename}`);
        }

        const newBreed = new Breed({
            maGiong, name, description, origin, status,
            images: images // 👉 Lưu mảng chứa đường dẫn ảnh vào Database
        });

        await newBreed.save();
        res.send({ message: "Thêm giống chó thành công!", breed: newBreed });
    } catch (error) {
        return next(new ApiError(500, "Lỗi khi tạo giống chó: " + error.message));
    }
};

// 2. HÀM LẤY DANH SÁCH GIỐNG CHÓ (Để Chủ trại chọn hoặc Khách hàng xem)
exports.findAll = async (req, res, next) => {
    try {
        const breeds = await Breed.find();
        res.send(breeds);
    } catch (error) {
        return next(new ApiError(500, "Lỗi khi lấy danh sách giống chó"));
    }
};

// 3. HÀM CẬP NHẬT GIỐNG CHÓ (Dành cho Admin)
exports.update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { _id, maGiong, ...updateData } = req.body; // Vẫn khóa không cho sửa mã

        // 👉 XỬ LÝ ẢNH: Kiểm tra xem Admin có chọn ảnh mới để thay thế không
        if (req.file) {
            updateData.images = [`/uploads/${req.file.filename}`]; 
        }

        const updatedBreed = await Breed.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true } 
        );

        if (!updatedBreed) return next(new ApiError(404, "Không tìm thấy giống chó này!"));

        res.send({ message: "Cập nhật thành công!", breed: updatedBreed });
    } catch (error) {
        return next(new ApiError(500, `Lỗi khi cập nhật giống chó: ${error.message}`));
    }
};

// 4. HÀM XÓA GIỐNG CHÓ (Dành cho Admin)
// 🔥 Quy tắc: KHÔNG XÓA nếu đã có chó liên kết
exports.delete = async (req, res, next) => {
    try {
        const { id } = req.params;

        // BƯỚC 1: Kiểm tra Toàn vẹn dữ liệu
        // Giả sử trong Dog model của em có trường breedId để lưu ID giống chó
        const linkedDogsCount = await Dog.countDocuments({ breedId: id });

        if (linkedDogsCount > 0) {
            // Nếu > 0, ném ra lỗi 400 và chặn đứng việc xóa!
            return next(
                new ApiError(400, `KHÔNG THỂ XÓA: Đang có ${linkedDogsCount} thú cưng thuộc giống này. Vui lòng chuyển trạng thái sang "Ngừng kinh doanh" thay vì xóa!`)
            );
        }

        // BƯỚC 2: Nếu an toàn (count = 0), tiến hành xóa
        const deletedBreed = await Breed.findByIdAndDelete(id);

        if (!deletedBreed) {
            return next(new ApiError(404, "Giống chó không tồn tại!"));
        }

        res.send({ message: "Đã xóa giống chó thành công!" });
    } catch (error) {
        return next(new ApiError(500, `Lỗi khi xóa giống chó: ${error.message}`));
    }
};

// 5. HÀM TỰ ĐỘNG SINH MÃ GIỐNG MỚI (VD: G001, G002)
exports.getNextCode = async (req, res, next) => {
    try {
        // Tìm giống chó có mã lớn nhất (Sắp xếp giảm dần theo maGiong)
        const lastBreed = await Breed.findOne().sort({ maGiong: -1 });

        let nextCode = "G001"; // Mặc định nếu chưa có giống chó nào trong DB

        if (lastBreed && lastBreed.maGiong) {
            // Lấy phần số: Cắt chữ "G" ở đầu ra (VD: "G005" -> "005")
            const lastNumber = parseInt(lastBreed.maGiong.replace("G", ""), 10);
            
            // Cộng 1 vào số đó
            const nextNumber = lastNumber + 1;
            
            // Format lại thành 3 chữ số (VD: 6 -> "006") và gắn lại chữ "G"
            nextCode = "G" + nextNumber.toString().padStart(3, "0");
        }

        res.send({ nextCode: nextCode });
    } catch (error) {
        return next(new ApiError(500, "Lỗi khi tạo mã giống tự động"));
    }
};