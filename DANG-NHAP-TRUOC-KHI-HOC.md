# Đăng nhập trước khi vào học

Khách mở web hoặc bản local chỉ xem trang chào mừng, thông tin giới thiệu và danh sách tên 73 bài học. Trang chào nhắc đăng nhập và có biểu mẫu tên/mã riêng. Bấm bài muốn học sẽ yêu cầu đăng nhập rồi trở lại bài đã chọn.

Các đường dẫn bài giảng, sách, luyện tập, tự tạo đề, thi, cố vấn, tiến độ, thư viện, phụ huynh và bạn bè đều đi qua cùng cổng. Hỏi cô/đọc bài/tạo hoặc nộp bài/lưu hoạt động cũng kiểm tra quyền trong luồng giao diện. Đăng xuất dừng bài giảng, xóa nội dung màn hình đang học và đưa về đăng nhập.

Chỉ có token lưu trong localStorage chưa được coi là đăng nhập. Mỗi lần mở/tải lại ứng dụng phải xác minh `/api/me` và tải tiến độ của đúng tài khoản trước khi mở phần học. Token sai/khóa/hết hạn bị chặn; không xác minh được vì mất mạng thì hiện thử lại, không tự mở chế độ học khách. Token bị máy chủ thu hồi trong phiên cũng được nhận diện qua lỗi 401 và khóa lại. Bản local vẫn dùng cầu nối API của bộ chạy Python, không cần Codex.

Máy chủ tiếp tục kiểm tra tên/mã, hạn tài khoản và quyền riêng cho tất cả API dữ liệu/thi/chat. Admin vẫn dùng trang và mật khẩu quản trị riêng; không cần tài khoản học sinh để cấp mã/gia hạn.

**Phạm vi bảo vệ:** cổng này kiểm soát luồng giao diện và đi kèm xác thực thật cho các API tài khoản. HTML, mã nguồn, ảnh sách và MP3 đã công khai trong kho GitHub hoặc đã tải về không thể được thu hồi/khóa bằng JavaScript. Không coi đây là DRM hay bảo vệ tuyệt đối tệp nội dung công khai. Muốn chặn truy cập trực tiếp đến các tệp cần chuyển cách lưu/phát hành nội dung sang máy chủ có kiểm tra quyền. Các tệp bài học gốc được giữ nguyên.

Kiểm thử: khách truy cập trực tiếp mọi hash, không tải ảnh sách/âm thanh; chặn hành động học; xem tên 73 bài; đăng nhập về đúng bài; đăng xuất; phục hồi phiên hợp lệ chỉ sau xác minh; token giả, hết hạn, bị thu hồi và mất mạng đều không mở phần học. Có kiểm thử giao diện Chromium desktop/điện thoại. `scripts/verify-online-client.mjs` kiểm tra thêm các trạng thái phiên với Worker API thật trong bộ dữ liệu giả.
