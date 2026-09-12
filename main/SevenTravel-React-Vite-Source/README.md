# Seven Travel – React/Vite

Mã nguồn hoàn chỉnh của landing page Seven Travel, gồm giao diện responsive, form nhận tư vấn, popup, đăng ký ưu đãi và các nút liên hệ nhanh.

## Yêu cầu

- Node.js 18 trở lên (khuyến nghị Node.js 20 LTS)
- npm 9 trở lên

## Chạy trên máy tính

```bash
npm install
npm run dev
```

Mở địa chỉ Vite hiển thị trong Terminal, thường là `http://localhost:5173`.

## Kiểm tra bản production

```bash
npm run build
npm run preview
```

Thư mục đầu ra là `dist/`.

## Đưa lên GitHub

1. Tạo repository mới trên GitHub.
2. Giải nén mã nguồn và mở Terminal tại thư mục dự án.
3. Chạy:

```bash
git init
git add .
git commit -m "Initial Seven Travel website"
git branch -M main
git remote add origin https://github.com/USERNAME/REPOSITORY.git
git push -u origin main
```

## Deploy lên Vercel

1. Đăng nhập Vercel và chọn **Add New → Project**.
2. Import repository GitHub vừa tạo.
3. Framework Preset: **Vite**.
4. Build Command: `npm run build`.
5. Output Directory: `dist`.
6. Chọn **Deploy**.

`vercel.json` đã cấu hình rewrite về `index.html`, tránh lỗi 404 khi tải lại đường dẫn phía frontend.

## Biến môi trường

Website hiện chạy độc lập, chưa yêu cầu API hoặc khóa bí mật. File `.env.example` chỉ là mẫu cho tích hợp API/CRM về sau. Không commit file `.env` thật lên GitHub.

## Cập nhật liên kết liên hệ

Trong `src/App.jsx`, thay các liên kết mẫu:

- WhatsApp: `https://wa.me/`
- Messenger: `https://m.me/`
- Zalo: `https://zalo.me/`

bằng số điện thoại hoặc username chính thức của Seven Travel.
