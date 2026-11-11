# Vườn Toán 4 — Học cùng cô Mai

Ứng dụng HTML/CSS/JavaScript tĩnh học Toán lớp 4 theo hai tập sách Kết nối tri thức do chủ dự án cung cấp. Có trang sách gốc, lời giảng bổ trợ, bài tập, kiểm tra và lưu tiến độ trong trình duyệt.

## Chạy ứng dụng

Giữ nguyên cấu trúc thư mục và mở `index.html` trong Chrome/Edge. Không cần npm hoặc bước build.

Để dùng localhost và thử micro:

```sh
python CHAY-TREN-MAY.py
```

Trên macOS/Linux có thể dùng `python3`. Mở địa chỉ được in ra trong cửa sổ lệnh. Nhận dạng tiếng nói có thể cần Internet; giọng đọc phụ thuộc thiết bị.

## Cùng sửa và nâng cấp

- Chủ kho vào **Settings → Collaborators → Add people** để mời tài khoản GitHub khác. Người được mời cần chấp nhận lời mời.
- Người đóng góp tạo nhánh riêng, sửa mã, rồi tạo pull request (PR) về nhánh `main`.
- Một người khác xem thay đổi và kiểm tra nội dung Toán trước khi merge.
- Kho công khai cho phép người ngoài fork và gửi PR; không tự cho mọi người quyền sửa nhánh chính.
- Nếu dùng tài khoản ChatGPT/Codex khác, tài khoản đó cần kết nối GitHub của chính họ và được cấp quyền vào kho. Chỉ chia sẻ URL website không cấp quyền sửa mã.

Đọc [CONTRIBUTING.md](CONTRIBUTING.md) để xem quy trình và danh sách kiểm tra.

## Cấu trúc mã

| Tệp/thư mục | Nội dung |
|---|---|
| `index.html` | Khung giao diện và hội thoại |
| `style.css` | Màu sắc, bố cục, giao diện điện thoại và bản in |
| `app.js` | Điều hướng, bài học, chấm điểm, tiến độ, giọng đọc, hội thoại |
| `data.js` | Danh mục 73 bài, lịch 175 ngày gợi ý, dữ liệu thư viện |
| `guides.js` | Lời giảng, ví dụ, lỗi thường gặp |
| `questions.js` | Bộ sinh câu hỏi, câu nguồn, quy tắc tạo đề và chấm đáp án |
| `assets/` | Ảnh trang sách được dùng trong từng bài |
| `tai-lieu/` | Hai PDF và 27 tệp Word gốc |
| `scripts/verify-content.cjs` | Kiểm tra cấu trúc chương trình, câu hỏi, phạm vi đề và chấm điểm |
| `.github/workflows/checks.yml` | Tự chạy kiểm tra khi push và tạo PR |

Các tệp dữ liệu khai báo biến JavaScript toàn cục; hiện chưa dùng hệ module hoặc cơ sở dữ liệu. Chỉnh sửa `data.js` cần giữ nguyên các mã bài/ngày để không làm sai tiến độ đã lưu của người học.

## Kiểm tra trước khi gửi PR

Cần Node.js 20 trở lên, không cài thêm gói:

```sh
node --check app.js
node --check data.js
node --check guides.js
node --check questions.js
node scripts/verify-content.cjs
```

Kiểm tra tự động chưa thay cho chạy thử trình duyệt, nghe giọng, thử micro hoặc thẩm định nội dung sư phạm.

## GitHub Pages

Vào **Settings → Pages → Deploy from a branch → main → /(root)**. Giữ `index.html` ở gốc kho. Kho có `.nojekyll`, không cần build.

Khả năng bật Pages cho kho riêng tư phụ thuộc gói GitHub của tài khoản/tổ chức. Quyền truy cập website Pages và quyền truy cập kho mã là hai thiết lập khác nhau; cần kiểm tra cấu hình Pages trước khi xuất bản.

## Nguồn tài liệu và phạm vi hiện tại

Lịch 175 ngày là đề xuất; lời giảng và câu bổ sung chưa được thẩm định để khẳng định bám 100% mọi yêu cầu từng tiết. Gia sư hội thoại hoạt động theo kịch bản, chưa phải AI tự do. Chi tiết xem [HUONG-DAN.md](HUONG-DAN.md) và [KIEM-TRA-BAN-PHAT-HANH.txt](KIEM-TRA-BAN-PHAT-HANH.txt).

Sách, ảnh sách và đề Word có nguồn riêng do chủ dự án cung cấp. Không gán giấy phép mã nguồn cho các tài liệu này. Chưa thêm giấy phép phát hành mã nguồn; chủ dự án có thể chọn giấy phép riêng cho phần mã do dự án biên soạn khi xác định cách chia sẻ.

Không đưa tiến độ cá nhân, bản sao câu trả lời của trẻ, mật khẩu, khóa API hoặc token vào Git.
