# Thời hạn tài khoản học sinh

Admin chọn **1 tháng, 3 tháng, 6 tháng hoặc 1 năm** khi thêm học sinh. API cũ không gửi lựa chọn mặc định 1 tháng. Thời hạn tính theo tháng lịch, giờ Việt Nam; nếu tháng đích không có ngày tương ứng thì dùng ngày cuối tháng (31/1 + 1 tháng = 28/2, hoặc 29/2 vào năm nhuận).

Danh sách hiện ngày cấp, ngày hết hạn, lần gia hạn gần nhất và trạng thái. Nút **Gia hạn** cộng thêm khoảng đã chọn:

- Còn hạn: cộng từ mốc hết hạn đang có.
- Hết hạn hoặc chưa từng đặt hạn: cộng từ lúc admin duyệt gia hạn.
- Gia hạn không tự mở tài khoản bị khóa. Mở khóa hoặc cấp lại mã không tự gia hạn.

Máy chủ kiểm tra mốc hết hạn trên mỗi yêu cầu có quyền học sinh, gồm đăng nhập, phiên đang dùng, tiến độ, báo cáo và thi. Hết hạn trả `401 / ACCOUNT_EXPIRED` cùng lời nhắc liên hệ admin. Phiên đang mở bị đưa về trang đăng nhập khi ứng dụng nhận thông báo (lần gọi API kế tiếp). Không dựa vào đồng hồ máy học sinh. Admin vẫn xem được kết quả lịch sử và gia hạn.

Tài khoản đã có trước migration `0007_student_terms.sql` giữ quyền hiện tại, ghi **Chưa đặt hạn**; admin chủ động chọn gia hạn để đặt mốc đầu tiên. Không tự cấp ngày hết hạn hồi tố cho học sinh đang dùng.

Ngày cấp và thời hạn được giữ khi sao lưu/khôi phục; bản sao cũ thiếu trường thời hạn được đọc là chưa đặt hạn.

**Phạm vi:** hạn sử dụng kiểm soát tài khoản và dịch vụ online. Các tệp bài học HTML, sách, âm thanh đã công khai trên GitHub hoặc tải về máy vẫn có thể mở ngoại tuyến. Đây không phải cơ chế khóa nội dung offline. Muốn bảo vệ cả nội dung cần thay cách phát hành tài liệu và phục vụ nội dung qua máy chủ kiểm tra quyền.

Kiểm tra: `node online-server/build.mjs && node online-server/tests/student-terms.test.mjs`.
