# Bạn bè, tự kiểm tra và lịch cuối tuần

Cập nhật 12/11/2026, giờ Việt Nam.

## Bộ cố vấn đang phân tích gì?

Cố vấn MIA dùng câu đã làm và chấm, phân biệt câu khác nhau, xem chủ đề cần ôn, xu hướng gần đây và gợi ý việc tiếp theo. Thao tác đọc/nghe giúp biết hoạt động học, không tự chứng minh trẻ đã hiểu. Khi chưa đủ câu khác nhau, cố vấn ghi rõ cần thêm dữ liệu. Không suy đoán học lực ngoài ứng dụng hoặc dùng nội dung trò chuyện để chấm kiến thức.

## Bạn bè và trò chuyện

Học sinh đăng nhập, còn hạn sẽ thấy tên các bạn đang online và nút nhóm chat chung. Bấm tên để nhắn riêng, hoặc mở **Bạn bè và nhóm chat**. Danh sách gồm cả bạn chưa online để gửi tin đợi bạn quay lại. Online dựa vào tín hiệu khoảng 90 giây gần nhất; tên cập nhật khoảng 30 giây. Tin nhắn mới được lấy định kỳ khoảng 4 giây khi mở trang chat. Dấu “Tin mới” lưu trên trình duyệt của từng tài khoản, không phải xác nhận bạn đã đọc trên mọi thiết bị.

Tin riêng chỉ được API trả cho hai người trong cuộc trò chuyện. Nhóm chung dành cho các tài khoản do admin cấp; người chưa đăng nhập không đọc được tin hoặc danh sách tên. Không đính kèm ảnh/tệp; tối đa 400 kí tự/tin, 12 lần gửi/phút, 300 tin/ngày. Một số dạng liên kết/email/điện thoại và từ không phù hợp được chặn; đây không phải bộ lọc hiểu toàn bộ ngữ cảnh.

Có **Chặn/Bỏ chặn**, **Báo admin**. Admin xem các tin được báo cáo, ẩn tin hoặc đánh dấu đã xem; có thể tạm dừng toàn bộ trò chuyện. Việc ẩn được phản ánh khi ứng dụng lấy tin kế tiếp. Không gửi chat đến mô hình AI. Dữ liệu lưu trên máy chủ ứng dụng, không mã hóa đầu cuối; bản sao lưu chứa nội dung riêng tư và phải giữ riêng, không tải lên GitHub.

Đang có câu thi có thời gian chưa hết giờ: tạm chặn đọc/gửi chat, tránh trao đổi đáp án. Trong lúc chờ hoặc sau khi công bố, có thể trao đổi. Khóa/hết hạn tài khoản cũng chặn dịch vụ chat. Chỉ số online xuất hiện thêm trong danh sách học sinh của admin khi làm mới.

## Bé tự tạo bài kiểm tra

Trong **Góc kiểm tra**, chọn 1–10 bài theo tên sách và 5/10/15/20 câu. Đề dùng câu thuộc các chủ đề đã chọn; nếu không đủ câu khác nhau thì dùng số thực có và báo rõ. Không lặp để làm đủ số. Kết quả lưu là **Bài tự chọn của con**, có danh sách bài, câu trả lời và lời giải. Dùng cho cố vấn/nhật ký và đồng bộ theo tài khoản, không cộng vào xếp hạng thi online. Không tự đánh dấu hoàn thành ngày như kiểm tra cuối ngày.

Các chặng ngày/tuần/tháng/quý/giữa kỳ/học kỳ có nhãn **Ngày — Bài — Tên bài — Tập/trang — Học kỳ** để bé chọn đúng mốc.

## Năm buổi cuối tuần

Thứ Bảy và Chủ nhật có **9h, 11h, 15h, 17h, 20h**. Đây là giờ mở phòng; chờ vào lớp 1 phút rồi bắt đầu. Bốn buổi đầu là đề ôn tuần 10 câu, tự chuyển câu/chốt kết quả. Buổi 20h giữ lịch sẵn có: thứ Bảy thi ngày, Chủ nhật thi tuần hoặc phòng thay thế do admin đã lên lịch. Chủ nhật chỉ thông báo năm buổi tự động, không hiện thêm bài thi ngày song song lúc 20h. Những phòng admin tạo riêng vẫn có thể xuất hiện thêm ngoài lịch tự động.

Bé rảnh buổi nào thì bấm tham gia buổi đó, không cần mã cho phòng tự động và không bị trừ điểm vì bỏ qua. Chuông/thông báo trong ứng dụng cần ứng dụng đang mở và người dùng đã bật chuông; không có push khi đóng trình duyệt.

Cron chuẩn bị lúc 2h/4h/8h/10h/13h UTC; máy chủ chỉ tạo bốn buổi bổ sung vào cuối tuần. Lượt truy cập cũng đi qua cùng cơ chế tạo phòng chống trùng nếu cron bị trễ. Sao lưu có thông tin các buổi và lựa chọn quản trị chat; bản sao cũ vẫn khôi phục được.

Kiểm tra: `online-server/tests/social.test.mjs`, `weekend-sessions.test.mjs`, `scripts/verify-self-tests.cjs`. Kiểm thử trình duyệt dùng hai tài khoản giả để kiểm tra giao nhận, riêng tư, chặn/báo/ẩn, lưu điểm tự kiểm tra, tên mốc sách và màn hình điện thoại.
