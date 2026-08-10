# Landing Page Tuyển Thành Viên CLB — Setup Miễn Phí với GitHub

## 1. Mô hình đề xuất

```text
Landing Page
    │
    ├── HTML / CSS / JavaScript
    │
    ▼
GitHub Repository
    │
    ▼
GitHub Pages
    │
    ▼
Link miễn phí:
https://username.github.io/ten-clb/
    │
    ▼
Form đăng ký
    │
    ├── Google Forms
    │
    ▼
Google Sheets
```

## 2. Các dịch vụ sử dụng

### GitHub

Dùng để:

- Lưu source code.
- Quản lý phiên bản.
- Deploy landing page bằng GitHub Pages.
- Miễn phí cho nhu cầu landing page CLB đơn giản.

Website mặc định có dạng:

```text
https://username.github.io/ten-clb/
```

Nếu tạo repository đặc biệt:

```text
username.github.io
```

thì website có thể chạy tại:

```text
https://username.github.io/
```

---

## 3. Hosting — GitHub Pages

Không cần mua hosting.

GitHub Pages phù hợp với website dạng:

- HTML
- CSS
- JavaScript
- Ảnh
- Font
- File tĩnh

Không phù hợp để chạy backend PHP, Node.js server hoặc database trực tiếp.

### Cách bật GitHub Pages

1. Tạo repository trên GitHub.
2. Upload source code.
3. Vào:

```text
Settings → Pages
```

4. Chọn:

```text
Deploy from a branch
```

5. Branch:

```text
main
```

6. Folder:

```text
/root
```

7. Save.

Sau khi deploy, GitHub sẽ cung cấp URL website.

---

## 4. Domain

### Giai đoạn đầu — FREE

Dùng domain GitHub Pages:

```text
username.github.io
```

hoặc:

```text
username.github.io/ten-clb
```

Chi phí:

```text
0đ
```

### Sau này

Có thể mua domain riêng như:

```text
tenclb.com
tenclb.vn
clbabc.com
```

Sau đó trỏ domain về GitHub Pages.

Không cần đổi hosting.

---

## 5. Form tuyển thành viên

Đơn giản nhất:

```text
Google Forms
```

Các trường có thể gồm:

- Họ và tên
- Ngày sinh
- Trường / lớp
- Email
- Số điện thoại
- Facebook
- Ban muốn ứng tuyển
- Kinh nghiệm
- Lý do muốn tham gia CLB
- Thời gian có thể tham gia
- Câu hỏi thêm

Response lưu vào:

```text
Google Sheets
```

Ưu điểm:

- Miễn phí.
- Không cần backend.
- Không cần database riêng.
- Thành viên ban tuyển dụng có thể cùng xem dữ liệu.
- Dễ lọc ứng viên.

---

## 6. Cấu trúc Landing Page

Landing page chỉ cần một trang.

```text
1. Hero
2. Giới thiệu CLB
3. Hoạt động nổi bật
4. Vì sao nên tham gia
5. Các ban đang tuyển
6. Quy trình tuyển thành viên
7. FAQ
8. CTA đăng ký
9. Footer
```

### Hero

Ví dụ:

```text
CLB ABC ĐANG TUYỂN THÀNH VIÊN

Một nơi để học hỏi, kết nối
và cùng nhau tạo nên những dự án thú vị.

[ĐĂNG KÝ NGAY]
```

Nút `ĐĂNG KÝ NGAY` dẫn tới Google Forms.

---

## 7. Cấu trúc source code

Có thể làm rất đơn giản:

```text
ten-clb/
│
├── index.html
├── style.css
├── script.js
│
├── assets/
│   ├── logo.png
│   ├── hero.jpg
│   ├── activity-1.jpg
│   ├── activity-2.jpg
│   └── activity-3.jpg
│
└── README.md
```

Không cần React nếu website chỉ có một trang.

HTML + CSS + JavaScript sẽ:

- Nhanh.
- Dễ sửa.
- Ít lỗi.
- Deploy GitHub Pages cực đơn giản.
- Không cần build.

---

## 8. Stack đề xuất

```text
Frontend:
HTML
CSS
JavaScript

Hosting:
GitHub Pages

Source Code:
GitHub

Form:
Google Forms

Dữ liệu:
Google Sheets

Domain:
username.github.io

Chi phí:
0đ/tháng
```

---

## 9. Luồng người dùng

```text
Facebook / TikTok / QR
        │
        ▼
Landing Page CLB
        │
        ▼
Xem thông tin tuyển
        │
        ▼
Đăng ký ngay
        │
        ▼
Google Forms
        │
        ▼
Google Sheets
        │
        ▼
Ban tuyển dụng CLB
```

---

## 10. Nếu muốn form nằm ngay trên website

Có hai cách.

### Cách 1 — Nhúng Google Forms

Có thể dùng iframe:

```html
<iframe
  src="LINK_GOOGLE_FORM"
  width="100%"
  height="1000"
  frameborder="0">
</iframe>
```

### Cách 2 — Nút đăng ký

Khuyên dùng cách này vì landing page sẽ sạch và dễ nhìn hơn.

```html
<a href="LINK_GOOGLE_FORM" target="_blank">
    Đăng ký tham gia CLB
</a>
```

---

## 11. Không cần những thứ này

Ở giai đoạn đầu chưa cần:

```text
❌ VPS
❌ Hosting trả phí
❌ Backend
❌ MySQL
❌ MongoDB
❌ Firebase
❌ Supabase
❌ WordPress
```

Với một landing page tuyển thành viên CLB, GitHub Pages + Google Forms là đủ.

---

## 12. Khi nào cần nâng cấp?

Chỉ cần backend/database riêng khi muốn có các chức năng như:

- Thành viên đăng nhập.
- Admin đăng nhập.
- Dashboard quản lý ứng viên.
- Trạng thái ứng viên: mới / phỏng vấn / đậu / rớt.
- Gửi email tự động.
- Upload CV.
- Phân quyền ban tuyển dụng.
- Quản lý thành viên lâu dài.

Khi đó có thể xem xét:

```text
Frontend: GitHub Pages / Vercel
Database: Supabase
Backend: Supabase / Serverless
```

Nhưng chưa cần cho phiên bản đầu.

---

# Setup khuyên dùng

```text
GitHub
├── Repository
├── GitHub Pages
└── username.github.io

Google
├── Google Forms
└── Google Sheets

TOTAL COST
= 0đ/tháng
```

Mục tiêu phiên bản đầu tiên:

> Làm một landing page đẹp, tải nhanh, xem tốt trên điện thoại và có nút đăng ký thành viên thật rõ ràng.
