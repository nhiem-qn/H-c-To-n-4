> Đã bổ sung kết nối Cloudflare Workers AI cho lời giảng mở rộng và cố vấn dựa trên bằng chứng. Xem [cách hoạt động, riêng tư và hạn mức](CO-VAN-AI-MIA.md). Các lựa chọn bên dưới là phần đối chiếu ban đầu.

# Các lựa chọn AI có gói miễn phí cho Học Toán cùng MIA

Đối chiếu tài liệu chính thức ngày 11/11/2026. Bản cập nhật giao diện và phòng thi không tự bật dịch vụ AI ngoài; cô giảng, chấm điểm và gợi ý học hiện có vẫn chạy theo nội dung và quy tắc đã kiểm tra.

| Lựa chọn | Phần miễn phí / yêu cầu | Phù hợp để bổ sung |
| --- | --- | --- |
| Cloudflare Workers AI | Có 10.000 Neurons miễn phí mỗi ngày; chọn mô hình có trong Workers Free. Một số mô hình yêu cầu thanh toán. Ứng dụng đã có máy chủ Cloudflare nên đây là phương án đề xuất đầu tiên. | Cô Mi A giải thích lại theo cách khác, gợi ý từng bước, đặt câu hỏi gợi mở dựa trên bài đang học. |
| Groq API | Có Free Plan, giới hạn theo mô hình, số yêu cầu và token; cần tài khoản người lớn quản lý và khóa API phía máy chủ. | Hội thoại gia sư phản hồi nhanh, tóm tắt lỗi sai và gợi ý cách học. |
| Ollama chạy mô hình mở trên máy riêng | Phần mềm có giấy phép MIT; cần chọn giấy phép mô hình phù hợp. Không có phí API cho suy luận tại máy, nhưng vẫn cần máy đủ RAM/CPU/GPU và chi phí vận hành. | Gia sư chạy trên máy/ máy chủ riêng; để các bé ở xa dùng, máy chủ đó cần hoạt động và có đường kết nối an toàn. |

Không coi “miễn phí” là không giới hạn. Với Cloudflare, giữ Workers Free và mô hình miễn phí; khi hết hạn mức, chuyển về lời giảng có sẵn thay vì tự nâng gói. Các khóa dịch vụ được lưu trong Secrets của máy chủ, không đưa vào HTML, config.js hoặc mã nguồn công khai.

Gemini API có gói miễn phí, nhưng điều khoản hiện nêu không dùng API Client hướng tới hoặc có khả năng được người dưới 18 tuổi truy cập. Vì ứng dụng này dành cho học sinh lớp 4, không chọn Gemini API làm gia sư trực tiếp cho các bé theo điều khoản hiện tại. Nếu nhà cung cấp thay đổi chính sách, cần đối chiếu lại trước khi tích hợp.

Đề xuất triển khai tiếp: Cloudflare Workers AI, trợ giảng theo bài đang mở, dùng lời giảng và câu hỏi đã kiểm tra làm ngữ cảnh. Chấm điểm và đồng hồ phòng thi vẫn do mã máy chủ quyết định. AI đưa gợi ý trước, không tự thay đổi đáp án, điểm thi hay nội dung sách. Không gửi mã đăng nhập, tên thật hoặc toàn bộ hồ sơ học sinh vào lời hỏi AI.

Nguồn chính thức:

- [Cloudflare Workers AI: pricing và hạn mức](https://developers.cloudflare.com/workers-ai/platform/pricing/)
- [Groq: Free Plan rate limits](https://console.groq.com/docs/rate-limits)
- [Ollama: hướng dẫn chạy trên máy](https://docs.ollama.com/faq)
- [Giấy phép Ollama](https://github.com/ollama/ollama/blob/main/LICENSE)
- [Gemini API: điều khoản và yêu cầu độ tuổi](https://ai.google.dev/gemini-api/terms)
