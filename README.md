# 📚 Ứng dụng Quản Lý Sách - Đặt Hàng (Golang Full-stack)

> Ứng dụng web hoàn chỉnh được viết bằng **Golang** với backend API và frontend được tích hợp trong một server duy nhất.

## 🚀 Khởi động nhanh

### Yêu cầu hệ thống
- **Go 1.21** trở lên ([Tải tại đây](https://golang.org/dl/))

### Bước 1: Khởi động ứng dụng

#### **Cách 1: Dùng Go trực tiếp (khuyên dùng)**
```bash
go run main.go
```

#### **Cách 2: Dùng Makefile**
```bash
make run
```

#### **Cách 3: Dùng script khởi động**
**macOS/Linux:**
```bash
./start.sh
```

**Windows:**
```
start.bat
```

### Bước 2: Truy cập
🌐 Mở trình duyệt: `http://localhost:3000`

**🎉 Hoàn thành! Bạn đã có ứng dụng Golang full-stack chạy ngay!**

## Cách sử dụng

### Lưu dữ liệu
- **Lưu tự động**: Nhấn nút "Lưu" (icon save) ở bất kỳ dòng nào
- Dữ liệu sẽ được lưu trực tiếp vào file `./data.json`
- Không cần tải xuống file, dữ liệu được lưu ngay trên server

### Tải dữ liệu
- **Tải lại**: Nhấn nút "Tải lại dữ liệu" để làm mới từ file data.json
- **Tự động tải**: Khi mở ứng dụng, dữ liệu sẽ tự động được tải từ data.json

### Tính năng chính
1. **Thêm/Xóa dòng**: Quản lý các mục sách
2. **Cột động**: Thêm/xóa các cột "Lần" (có bảo vệ mật khẩu: `admin123`)
3. **Dropdown mảng**: Chọn loại sách hoặc nhập tùy chỉnh
4. **Tính toán tự động**: Tổng đặt mới, Tổng phải đặt
5. **Xuất Excel**: Xuất toàn bộ dữ liệu ra file .xlsx
6. **Lưu trực tiếp**: Lưu vào file data.json ngay trên server

## 📁 Cấu trúc dự án

```
📂 quan-ly-sach/
│
├── 🔧 main.go             # Server Golang (Backend + Frontend)
├── 📦 go.mod              # Go module & dependencies
├── 💾 data.json          # Database file (JSON)
│
├── 🌐 index.html         # Giao diện HTML
├── ⚙️ script.js          # Logic JavaScript  
├── 🎨 styles.css         # CSS Styling
│
├── 🚀 start.sh           # Script khởi động (Unix)
├── 🚀 start.bat          # Script khởi động (Windows)
├── 🛠️ Makefile           # Build & dev commands
│
└── 📝 README.md          # Hướng dẫn này
```

### 🔄 Luồng hoạt động
1. **main.go** cung cấp cả API endpoints và serve static files
2. **Frontend** (HTML/CSS/JS) được serve tự động
3. **data.json** làm database file được đọc/ghi qua API
4. **Golang** xử lý HTTP server và JSON operations

## 🛠️ Lệnh hữu ích

### Development
```bash
# Chạy với auto-reload (cần cài air)
make dev

# Hoặc cài air trước
go install github.com/cosmtrek/air@latest
air
```

### Build & Deploy
```bash
# Build executable
make build

# Chạy executable đã build
./quan-ly-sach
```

### Dọn dẹp
```bash
make clean
```

## Lưu ý quan trọng

- **File data.json**: Đây là file lưu trữ chính, không xóa file này
- **Backup**: Nên sao lưu file data.json định kỳ
- **Mật khẩu xóa cột**: `admin123` (có thể thay đổi trong script.js)
- **Server cần chạy**: Ứng dụng cần server Node.js để hoạt động đầy đủ

## Khắc phục sự cố

1. **Lỗi "Cannot connect to server":**
   - Kiểm tra server có đang chạy không (`npm start`)
   - Đảm bảo port 3000 không bị chiếm dụng

2. **Lỗi lưu dữ liệu:**
   - Kiểm tra quyền ghi file trong thư mục
   - Xem console log để biết chi tiết lỗi

3. **Dữ liệu bị mất:**
   - Kiểm tra file data.json có tồn tại không
   - Server sẽ tạo file mặc định nếu chưa có