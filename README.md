🎓 Student Collector App (Ver 1.7)

Hệ thống Thu thập & Quản lý Hồ sơ Sinh viên chạy trên nền tảng Docker.
Phiên bản 1.7: Cập nhật giao diện (UI), tính năng Chỉnh sửa/Xóa và Hiệu ứng tương tác.

Người phát triển: Nhật Thiện

Năm thực hiện: 2025

🌟 Tính năng nổi bật

1. Dành cho Sinh viên (Người dùng)

📝 Form đăng ký hiện đại: Giao diện nhập liệu sạch sẽ, hỗ trợ Responsive (điện thoại/máy tính).

📸 Xem trước ảnh (Image Preview): Hiển thị ảnh đại diện ngay sau khi chọn file (trước khi upload).

✅ Validate dữ liệu:

Kiểm tra trùng mã số sinh viên (MSSV).

Bắt buộc số điện thoại phải đủ 10 chữ số.

🎉 Hiệu ứng thành công: Màn hình thông báo với màu nền Gradient (#18A5A7 -> #BFFFC7) và hiệu ứng pháo hoa (Confetti) rực rỡ.

2. Dành cho Quản trị viên (Admin)

🔐 Bảo mật: Trang Admin yêu cầu đăng nhập (Session-based Authentication).

📊 Quản lý danh sách:

Hiển thị dạng thẻ (Card) với ảnh đại diện, tên, ngành học, trường, và sở thích.

Thông tin quan trọng (Tên trường, MSSV, SĐT) được làm nổi bật.

🛠️ Thao tác đầy đủ (CRUD):

Tìm kiếm: Lọc theo Tên hoặc MSSV.

✏️ Chỉnh sửa: Cập nhật thông tin sai lệch.

🗑️ Xóa: Loại bỏ hồ sơ rác (có popup xác nhận).

📥 Xuất báo cáo: Tải danh sách đầy đủ ra file Excel (.xlsx) chỉ với 1 click.

3. Về mặt kỹ thuật

🐳 Dockerized: Đóng gói hoàn chỉnh, chạy trên mọi môi trường chỉ với 1 câu lệnh.

💾 Data Persistence: Tự động lưu dữ liệu vào file data.json (không mất dữ liệu khi restart container).

🕒 Timezone Fix: Đồng bộ thời gian hiển thị theo giờ Việt Nam (Asia/Ho_Chi_Minh).

🛠️ Cài đặt và Chạy dự án

Yêu cầu máy tính đã cài đặt Docker Desktop.

Bước 1: Build Image

Mở Terminal tại thư mục dự án và chạy lệnh:

docker build -t student-app .


Bước 2: Chạy Container

Chạy ứng dụng ở chế độ nền (background) và mở cổng 6000:

docker run -d -p 6000:3000 --name my-student-app student-app


Lưu ý: Nếu muốn dữ liệu ảnh và file json tồn tại vĩnh viễn ngay cả khi xóa container, hãy dùng lệnh mount volume (Nâng cao):
docker run -d -p 6000:3000 -v $(pwd)/uploads:/app/uploads -v $(pwd)/data.json:/app/data.json --name my-student-app student-app

📖 Hướng dẫn sử dụng

1. Truy cập ứng dụng

Mở trình duyệt web và truy cập:
👉 http://localhost:6000

2. Đăng nhập Admin

Để vào trang quản trị, nhấn vào tab "🔍 Quản trị".

Tài khoản: admin

Mật khẩu: 123456

3. Public ra Internet (Optional)

Nếu muốn gửi link cho bạn bè dùng thử qua điện thoại, hãy sử dụng ngrok:

ngrok http 6000


(Copy đường link https mà ngrok cung cấp và gửi đi)

📂 Cấu trúc thư mục

student-app/
├── Dockerfile          # File cấu hình Docker
├── package.json        # Khai báo thư viện (Express, Multer, ExcelJS...)
├── server.js           # Mã nguồn chính (Backend + Frontend Render)
├── data.json           # Nơi lưu trữ dữ liệu sinh viên (Tự sinh ra)
└── uploads/            # Thư mục chứa ảnh đại diện sinh viên


🤝 Đóng góp

Dự án được xây dựng cho mục đích học tập và demo khả năng triển khai ứng dụng Node.js với Docker.

Copyright © 2025 By Nhật Thiện
