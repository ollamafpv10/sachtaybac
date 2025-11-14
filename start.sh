#!/bin/bash

echo "🚀 Đang khởi động ứng dụng Quản Lý Sách (Go)..."
echo ""

# Kiểm tra Go
if ! command -v go &> /dev/null; then
    echo "❌ Go chưa được cài đặt!"
    echo "📦 Vui lòng cài đặt Go từ: https://golang.org/dl/"
    exit 1
fi

# Kiểm tra go.mod
if [ ! -f "go.mod" ]; then
    echo "📦 Khởi tạo Go module..."
    go mod init quan-ly-sach
    echo ""
fi

echo "🎯 Khởi động server..."
echo "🌐 Ứng dụng sẽ chạy tại: http://localhost:3000"
echo "⭐ Nhấn Ctrl+C để dừng server"
echo ""

# Khởi động server
go run main.go