# Quản Lý Sách - Makefile

.PHONY: run build clean dev help

# Mặc định: chạy ứng dụng
run:
	@echo "🚀 Khởi động ứng dụng Quản Lý Sách..."
	@echo "🌐 Truy cập tại: http://localhost:3000"
	go run main.go

# Build ứng dụng
build:
	@echo "🔨 Đang build ứng dụng..."
	go build -o quan-ly-sach main.go
	@echo "✅ Build hoàn thành: quan-ly-sach"

# Chạy ở chế độ development (với auto-reload)
dev:
	@echo "🔥 Chạy ở chế độ development..."
	@echo "🔄 Tự động reload khi có thay đổi"
	@which air > /dev/null || (echo "📦 Cài đặt air: go install github.com/cosmtrek/air@latest" && go install github.com/cosmtrek/air@latest)
	air

# Dọn dẹp
clean:
	@echo "🧹 Dọn dẹp files build..."
	rm -f quan-ly-sach
	rm -f quan-ly-sach.exe
	@echo "✨ Hoàn thành!"

# Hiển thị hướng dẫn
help:
	@echo "📚 Hướng dẫn sử dụng:"
	@echo ""
	@echo "  make run    - Chạy ứng dụng"
	@echo "  make build  - Build executable"
	@echo "  make dev    - Chạy development mode"
	@echo "  make clean  - Dọn dẹp files build"
	@echo "  make help   - Hiển thị hướng dẫn này"
	@echo ""
	@echo "🌐 Truy cập: http://localhost:3000"