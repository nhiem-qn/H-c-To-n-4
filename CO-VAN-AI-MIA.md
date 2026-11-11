# Cố vấn học tập MIA

Cập nhật 12/11/2026 (giờ Việt Nam).

## Theo dõi và gợi ý học

`advisor-core.js` phân tích câu đã chấm, bài trên lớp và tự nhận xét của bé. Kế hoạch được dùng ở trang chủ, trang **Cố vấn học tập MIA**, sau phần luyện tập và trong báo cáo gia đình/admin. Kết quả thi online dùng bằng chứng do máy chủ chấm, chỉ sau khi công bố. Tự luyện là dữ liệu thiết bị, được ghi rõ. Hệ thống chỉ theo dõi hoạt động trong ứng dụng.

- Chưa đủ ba câu khác nhau: cần thêm dữ liệu, không kết luận đã vững.
- Các câu lặp cùng đề chỉ tính một đề khi nhận xét kỹ năng.
- Nhiều câu chưa đúng hoặc kết quả giảm: xem lại ví dụ, luyện ngắn, kiểm tra lại.
- Học khá chắc: gợi ý giải thích vì sao, không tự nhảy sang chương mới.
- Ôn cách quãng theo dữ liệu hiện có; kế hoạch tối đa 30 phút còn lại, có lời nhắc nghỉ khi nhiều lượt luyện.
- Không gán nhãn trẻ “kém”, không chẩn đoán nguyên nhân nghỉ học/sức khỏe và không coi đã bấm đọc là đã hiểu.

Admin có tổng quan các bé cần đồng hành và nút mở báo cáo để đối chiếu. Tổng quan từ tiến độ tự học chưa phải dữ liệu giám sát độc lập; báo cáo chi tiết có câu thi được máy chủ chấm.

## AI diễn giải mở rộng

Bốn nút trong phần lý thuyết: **Giảng dễ hơn**, **Vì sao?**, **Dùng trong đời sống**, **Giải thích ví dụ**. Hỏi cô theo các ý đó trong hộp thoại cũng sử dụng cùng cơ chế. Đây là hướng dẫn bổ trợ theo bài, không phải chatbot tự do gửi toàn bộ câu gõ của bé.

Backend dùng Cloudflare Workers AI qua binding `AI`, mô hình cố định `@cf/meta/llama-3.1-8b-instruct-fp8-fast`. Không có khóa API trong HTML hoặc config.js. Chỉ gửi tiêu đề/quy tắc/các bước/ví dụ đã soạn và mức hỗ trợ chung. Không gửi tên, mã đăng nhập, ID, lịch sử trò chuyện, câu gõ tự do hoặc toàn bộ hồ sơ trẻ đến mô hình.

Ví dụ và câu thử được tạo từ ngân hàng đã kiểm tra. Phần AI diễn giải được gắn nhãn có thể nhầm, không tự chấm bài hay sửa điểm. Câu thử chấm bằng mã toán, ghi lần làm đầu tiên vào tiến độ. Không cho gọi mở rộng khi đang có câu thi chưa hết giờ. Nội dung SGK gốc giữ nguyên.

Mất mạng, AI lỗi/timeout, chưa có binding, admin tắt hoặc hết lượt: trả lời giảng có sẵn và nói rõ chế độ. Không gọi kết quả theo quy tắc là câu trả lời AI. Nội dung AI hiển thị dạng chữ, không thực thi HTML. Giọng đọc động dùng bộ chọn giọng nữ hiện có của máy; không đổi sang giọng nam nếu thiếu giọng nữ. Giọng Hoài My thu sẵn vẫn phục vụ bài giảng chính.

## Hạn mức và điều khiển

Tối đa 5 lượt sinh mới/tài khoản/ngày UTC và 40 lượt mới/toàn ứng dụng/ngày UTC; làm mới 07:00 giờ Việt Nam. Nội dung bổ trợ không có dữ liệu cá nhân có thể được dùng lại từ cache tối đa 30 ngày, không tốn lượt mới. Lỗi gọi mô hình vẫn giữ lượt đã đặt để tránh lặp vô hạn. Đặt lượt bằng một câu SQL nguyên tử để không vượt hạn khi nhiều người bấm cùng lúc.

Admin bật/tắt AI và bấm **Thử kết nối AI** trong khu cố vấn. Mặc định bật theo yêu cầu xây dựng AI; bộ tư vấn dựa trên bài làm vẫn chạy khi tắt sinh nội dung. Cờ bật/tắt có trong bản sao lưu; cache và hạn mức tạm thời không sao lưu.

Cloudflare hiện công bố 10.000 Neurons miễn phí/ngày. Lượt ứng dụng là giới hạn bảo vệ riêng, không phải phép đo Neuron hoặc cam kết toàn tài khoản không bao giờ có phí. Không tự nâng gói. Nếu tài khoản đã dùng Workers Paid, mức dùng chung các dịch vụ vẫn theo chính sách Cloudflare.

Nguồn chính thức: [pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/), [binding](https://developers.cloudflare.com/workers-ai/configuration/bindings/), [limits](https://developers.cloudflare.com/workers-ai/platform/limits/). Triển khai bằng workflow Cloudflare hiện tại; bước smoke xác nhận AI thật hay báo đang dùng dự phòng.

## Kiểm tra

`node scripts/verify-advisor.cjs` kiểm tra kế hoạch theo bằng chứng. `node online-server/tests/advisor.test.mjs` kiểm tra riêng tư, xác thực, đề/đáp án, giới hạn bài, chống vượt quota đồng thời, cache, dự phòng, admin và không trợ giúp câu thi đang mở. Kiểm thử trình duyệt dùng tài khoản giả và đầu ra mô hình minh họa; kiểm tra AI thật thực hiện trong bước triển khai.
