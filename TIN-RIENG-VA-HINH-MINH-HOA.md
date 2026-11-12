# Tin riêng, nút vào học và hình minh họa

- Có tin riêng chưa xem: menu **Chat cùng bạn** có huy hiệu, thanh đầu trang hiện **Tin riêng**. Bấm vào mở cuộc trò chuyện mới nhất chưa đọc. Con số đếm số bạn có tin chưa xem, không phải tổng số từng tin.
- Danh sách tin riêng kiểm tra khoảng 10 giây khi web đang mở/hiển thị; lấy lại khi cửa sổ được chú ý. Không phải push khi đã đóng web. Thông báo không đọc to/hiện nội dung tin; tin nhóm chung không tạo huy hiệu tin riêng. Không cần cấp quyền thông báo của trình duyệt.
- Xem cuộc trò chuyện sẽ cập nhật mốc đã đọc trên trình duyệt đang dùng và giảm/tắt huy hiệu. Mốc vẫn theo tài khoản/thiết bị như bản trước, chưa phải đồng bộ biên nhận đã đọc giữa mọi thiết bị. Người bị chặn không tạo thông báo. Đăng xuất xóa thông báo và không để lộ tên bạn cho khách.
- Tiêu đề bài là liên kết vào học. Nút **Vào học →** lớn hơn, có nhãn rõ và cỡ chạm tối thiểu; tiêu đề bài trong trang xem trước của khách đưa đến đăng nhập đúng bài.
- `lesson-visuals.js` có 45 ví dụ bằng SVG/HTML được kiểm tra lượng/số, ánh xạ theo chủ đề và buổi của toàn bộ 73 bài/175 ngày. Đây là ví dụ bổ trợ, không sửa trang sách giáo khoa và không phải ảnh AI sinh ngẫu nhiên.
- Có thanh phân số, phần giao khi nhân phân số, nhóm đồ vật nhân/chia, chia đều trung bình cộng, hàng số, tia số, góc, vuông góc/song song, ô vuông diện tích, đơn vị đo, biểu đồ và chuỗi bước bài toán. Phân số và trung bình cộng có nút đổi trạng thái để quan sát. Hình bằng đơn vị cùng kích thước, có chú thích số và mô tả cho đọc màn hình.
- Nút nghe giải thích hình dùng bộ chọn giọng nữ đã có trên máy, không tự chuyển sang giọng nam. Đọc hoặc đổi trạng thái sẽ dừng lời giảng đang phát để tránh chồng giọng. Không có giọng nữ phù hợp thì ứng dụng báo để đọc phần chữ; bài giảng Hoài My thu sẵn vẫn giữ nguyên.
- Bấm hình không được tính là hiểu bài hoặc cộng điểm. Hệ thống vẫn dùng câu bé thực sự làm để tư vấn. Hình không dùng để đo độ dài trực tiếp trên màn hình.

Kiểm tra: `node scripts/verify-lesson-visuals.cjs` kiểm tra lượng phần tô, ô lưới, phương trình, khung tương tác và đủ ánh xạ buổi học. Kiểm thử Chromium hai tài khoản xác nhận thông báo/menu/thanh đầu, mở đúng bạn, hết báo khi xem/đăng xuất, tiêu đề/nút bài học, hình phân số/trung bình/góc và bố cục 320px.
