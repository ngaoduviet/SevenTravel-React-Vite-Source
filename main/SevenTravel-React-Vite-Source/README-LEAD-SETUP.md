# Cấu hình nhận lead Canton Fair 140

Landing page đã bỏ luồng mở ứng dụng email. Biểu mẫu gửi về API cùng domain, sau đó API chuyển dữ liệu vào Google Sheets và gửi email cho nhân viên phụ trách.

## 1. Đưa code vào website chính

Chép nguyên các mục sau vào thư mục gốc repository Seven Travel:

- `public/canton-fair/`
- `api/canton-config.js`
- `api/canton-lead.js`
- `vercel.json`

File `vite.config.js` được gửi kèm để đối chiếu. Nếu website chính đang chạy bình thường với Vite/React, chỉ cần thay file này khi cấu hình hiện tại của bạn giống bản cũ; landing page không yêu cầu thêm plugin Vite.

File `google-apps-script/Code.gs` dùng ở bước thiết lập Google Sheets, không cần đưa lên website.

## 2. Tạo Google Sheets nhận lead

1. Tạo một Google Sheets mới, ví dụ `SEVEN TRAVEL – LEADS CANTON FAIR`.
2. Sao chép ID của bảng tính trong URL, nằm giữa `/d/` và `/edit`.
3. Mở **Tiện ích mở rộng → Apps Script**.
4. Xóa nội dung mẫu và dán toàn bộ file `google-apps-script/Code.gs`.
5. Mở **Project Settings → Script properties**, thêm:
   - `SHEET_ID`: ID Google Sheets ở bước 2.
   - `SHEET_NAME`: `LEADS_CANTON_FAIR`.
   - `NOTIFY_EMAIL`: email nhân viên nhận thông báo, có thể dùng `info@seventravel.vn`.
   - `WEBHOOK_SECRET`: một chuỗi ngẫu nhiên dài tối thiểu 32 ký tự.
6. Chọn **Deploy → New deployment → Web app**.
7. Chọn **Execute as: Me** và **Who has access: Anyone**.
8. Deploy và sao chép URL kết thúc bằng `/exec`.

## 3. Cấu hình trên Vercel

Trong Vercel Project đang giữ domain `www.seventravel.vn`, mở **Settings → Environment Variables** và thêm:

- `GOOGLE_APPS_SCRIPT_URL`: URL `/exec` ở bước trên.
- `LEAD_WEBHOOK_SECRET`: đúng chuỗi đã nhập vào `WEBHOOK_SECRET`.
- `GA4_ID`: Measurement ID dạng `G-XXXXXXXXXX`.
- `META_PIXEL_ID`: ID Meta Pixel dạng số.
- `BUSINESS_TAX_ID`: mã số thuế chính xác của doanh nghiệp.
- `ZALO_URL`: mặc định `https://zalo.me/0899525777`.
- `WHATSAPP_URL`: mặc định `https://wa.me/84899525777`.
- `MESSENGER_URL`: mặc định `https://m.me/61591483266432`; cần đối chiếu lại đúng Page ID Facebook của Seven Travel.

Sau khi lưu biến môi trường, chọn **Redeploy** deployment mới nhất.

## 4. Kiểm tra trước khi chạy quảng cáo

1. Mở `https://www.seventravel.vn/hoichocanton?utm_source=test&utm_medium=manual&utm_campaign=form_test`.
2. Chọn một gói tour và gửi form bằng số điện thoại kiểm thử.
3. Kiểm tra thông báo thành công trên trang.
4. Kiểm tra sheet `LEADS_CANTON_FAIR` có đủ gói tour, Đợt, UTM và nguồn truy cập.
5. Kiểm tra email nhân viên đã nhận thông báo.
6. Gửi lại cùng số điện thoại trong 30 phút để xác nhận hệ thống không tạo lead trùng.

## 5. URL chuẩn và chuyển hướng

URL chuẩn SEO là `https://www.seventravel.vn/hoichocanton`.

Các URL `/CantonFair`, `/cantonfair` và `/hoichocanton/` được chuyển hướng HTTP 301 về URL chuẩn.

## 6. Nội dung còn cần Seven Travel cung cấp

- Mã số thuế chính xác để hiện trên thanh bảo chứng.
- Xác nhận Page ID/URL Messenger.
- 6–10 ảnh đoàn thực tế có chú thích kỳ hội chợ, Đợt và thời gian.
- 2–3 đánh giá thật đã được khách hàng đồng ý công khai.
- Điều khoản đặt cọc, hoàn hủy và xử lý tiền cọc khi visa không đạt.
