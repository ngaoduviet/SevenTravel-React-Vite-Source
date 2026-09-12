# Hướng dẫn cập nhật website chính Seven Travel

Đây là bộ mã nguồn website chính đã có thêm cấu hình chuyển tiếp tài nguyên cho trang `www.seventravel.vn/sanpham`.

## Thứ tự cập nhật

1. Triển khai project `SevenTravel-Tour-Catalog` trước.
2. Sau khi project Catalog hoạt động, chép toàn bộ nội dung trong thư mục này vào repository website chính.
3. Commit và push lên nhánh Production đang liên kết với Vercel.
4. Chờ Vercel báo Deployment thành công.
5. Kiểm tra `https://www.seventravel.vn` và `https://www.seventravel.vn/sanpham` bằng cửa sổ ẩn danh.

## Thay đổi quan trọng

`vercel.json` đã bổ sung rule chuyển tiếp `/images/catalog/*` tới project Catalog. Rule này giúp logo Seven Travel, biểu trưng ASEAN và các icon danh mục hiển thị đúng dưới domain chính.

Không đổi domain và không tạo project Vercel mới.
