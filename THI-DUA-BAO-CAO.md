# Vườn sao và báo cáo gia đình

- `#honors`: xếp hạng tháng hoặc toàn thời gian, theo điểm trung bình bài thi online đã kết thúc (/10) và số ngày học. Đồng điểm cùng hạng (1, 1, 3). Không dùng điểm tự luyện để xếp hạng thi.
- `#parents`: gia đình đăng nhập bằng tài khoản tên + mã riêng của con; xem bài học, từng câu trả lời, đúng/sai, đáp án, giải thích và cuộc thi/điểm. Chưa hết giờ thì không công bố đáp án. Admin xem chi tiết qua báo cáo từng học sinh.
- Chuyên cần tối đa một ngày khi có hoạt động học hoặc nộp câu thi; mở web/heartbeat không tăng chuyên cần. Hoạt động tự học được thiết bị đồng bộ, không phải bằng chứng giám sát chống gian lận.
- Số thành viên là tài khoản học sinh đang hoạt động. Online là số tài khoản duy nhất có tín hiệu trong 90 giây gần nhất (phòng thi 22 giây), cập nhật khoảng 30 giây khi trang đang mở. Khách chỉ thấy tổng số; tên và bảng thi đua cần đăng nhập.
- Hiệu ứng sao khi luyện đúng, nộp bài có câu đúng và khi câu thi của bé được công bố đúng. Tôn trọng tùy chọn giảm chuyển động. Phòng thi hiển thị bảng dẫn đầu chỉ theo câu đã công bố.
- Dữ liệu cũ có thể thiếu đáp án/bài làm tự luyện từng câu; báo cáo ghi rõ thay vì suy diễn. Lịch sử thi online lấy từ máy chủ. Báo cáo cuộc thi phân trang 40 phòng; hoạt động tối đa 2.000 bản ghi mỗi lần lọc.
- Migration `0006_rewards_reports.sql`: thống kê dẫn xuất có trigger chống cộng trùng; sao lưu thêm ngày học và nhật ký. Khi khôi phục, kết quả thi đua được dựng lại từ phòng/đáp án.

Kiểm tra: `node online-server/build.mjs && node online-server/tests/rewards.test.mjs`. Ảnh minh họa ở `docs/screenshots/rewards/`.
