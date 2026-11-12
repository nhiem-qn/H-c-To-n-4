# Học Toán cùng MIA trên Windows

Dùng Windows 10/11 **64 bit** và Chrome hoặc Edge.

1. Tải **MIA-Windows-Portable.zip** từ phần Releases của kho GitHub.
2. Bấm chuột phải tệp ZIP → **Extract All / Giải nén tất cả**. Chọn thư mục cố định, ví dụ `Documents\Hoc-Toan-MIA`. Không chạy ngay bên trong tệp ZIP.
3. Mở thư mục đã giải nén → bấm đúp **CHAY-MIA.cmd**. Trình duyệt mở `http://127.0.0.1:8000/`. Giữ cửa sổ lệnh mở trong lúc học.
4. Muốn có biểu tượng trên màn hình chính, bấm **TAO-LOI-TAT.cmd** một lần. Lần sau mở biểu tượng **Hoc Toan cung MIA** trên Desktop.
5. Khi học xong, đóng cửa sổ lệnh để tắt ứng dụng. Gỡ ứng dụng bằng cách xóa thư mục và lối tắt; không thay đổi Registry hay cài dịch vụ nền.

Gói Portable có sẵn Python Embedded chính thức từ python.org và toàn bộ mã/tài liệu/tệp âm thanh trong kho. Không cần cài Python, Node.js, Git hay dùng Codex. Tệp ZIP “Source code” tự động của GitHub chỉ có mã nguồn; muốn mở ngay hãy chọn đúng **MIA-Windows-Portable.zip**.

## Đăng nhập để vào học

Khi mở ứng dụng, con nhập **tên và mã riêng do admin cấp**. Khách chỉ xem giới thiệu và tên bài. Cần Internet để xác minh phiên trước khi mở phần học; tài khoản hết hạn/khóa không được vào. Phiên cũ lưu trên máy cũng phải được máy chủ xác minh lại khi mở hoặc tải lại trang.

## Local và online

- Bài học, trang sách, giọng đọc thu sẵn, 3D và tự luyện được phục vụ từ máy. Sau khi đã đăng nhập và giữ nguyên phiên đang mở, nội dung trên máy vẫn có thể dùng khi mạng tạm mất. Mở lại/tải lại trang khi mất Internet sẽ phải chờ xác minh đăng nhập. Tiến độ khách lưu trong trình duyệt, theo đúng địa chỉ local; không xóa dữ liệu trình duyệt nếu muốn giữ tiến độ.
- Đăng nhập bằng tên/mã đã cấp, admin, đồng bộ, đếm online, bảng thi đua và phòng thi nhiều người vẫn cần Internet và máy chủ Cloudflare hiện tại. Dữ liệu tài khoản đang có không nằm trong ZIP, không bị di chuyển hoặc ghi đè.
- Bản local có đường nối API chỉ lắng nghe ở máy này; máy chủ vẫn kiểm tra tên/mã và quyền admin. Không có mật khẩu, API token hay bản sao dữ liệu học sinh trong gói.
- Tiến độ khách đã học trên GitHub không tự chuyển sang localhost. Tài khoản đã đồng bộ có thể đăng nhập để tải lại tiến độ. Khi chuyển từ file HTML sang localhost, hai nơi cũng có vùng lưu tiến độ riêng.
- Micro nhận dạng lời nói phụ thuộc Chrome/Edge và có thể cần Internet.
- Đây là ứng dụng local với dịch vụ online dùng chung; chưa phải bản máy chủ thi hoàn toàn offline hay mạng LAN. Không gửi đường dẫn `127.0.0.1` cho người ở xa; gửi đường dẫn GitHub của ứng dụng.

Nếu báo cổng 8000 đang bận, đóng cửa sổ MIA cũ rồi mở lại. Nếu vẫn bận, mở Terminal trong thư mục và chạy `runtime\python.exe CHAY-TREN-MAY.py 8001`. Địa chỉ mới sẽ là `http://127.0.0.1:8001/` và có vùng lưu tiến độ khách riêng.

Bộ chạy Python bên thứ ba được giữ nguyên, kèm tệp LICENSE. Windows có thể hỏi trước khi mở tệp tải từ Internet; chỉ mở gói từ đúng kho `nhiem-qn/H-c-To-n-4`.
