@echo off
title Quan Ly Sach - Dat Hang (Go)

echo.
echo 🚀 Dang khoi dong ung dung Quan Ly Sach (Go)...
echo.

:: Kiểm tra Go
go version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Go chua duoc cai dat!
    echo 📦 Vui long cai dat Go tu: https://golang.org/dl/
    pause
    exit /b 1
)

:: Kiểm tra go.mod
if not exist "go.mod" (
    echo 📦 Khoi tao Go module...
    go mod init quan-ly-sach
    echo.
)

echo 🎯 Khoi dong server...
echo 🌐 Ung dung se chay tai: http://localhost:3000
echo ⭐ Nhan Ctrl+C de dung server
echo.

:: Khởi động server
go run main.go

pause