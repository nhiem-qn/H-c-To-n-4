# Học Toán cùng MIA — Học cùng cô Mi A

Ứng dụng HTML/CSS/JavaScript học Toán lớp 4 theo hai tập sách Kết nối tri thức do chủ dự án cung cấp. Có trang sách gốc, lời giảng bổ trợ, kiểm tra tự học và phòng thi nhiều người. Tự học ngoại tuyến lưu tiến độ trong trình duyệt; học sinh đã đăng nhập dùng thêm máy chủ để đồng bộ và thi online.

## Các đường dẫn đang dùng

- Ứng dụng: https://nhiem-qn.github.io/H-c-To-n-4/
- Vào lớp / thi online: https://nhiem-qn.github.io/H-c-To-n-4/#online
- Trang admin trên GitHub Pages: https://nhiem-qn.github.io/H-c-To-n-4/admin.html
- Triển khai độc lập: [DEPLOY-CLOUDFLARE.md](DEPLOY-CLOUDFLARE.md)

Admin bản độc lập đăng nhập bằng tên và mật khẩu riêng. Mật khẩu được băm trên máy chủ; quyền được kiểm tra ở API, không dựa vào việc ẩn nút trên giao diện. GitHub Actions triển khai Worker + D1 vào tài khoản Cloudflare của bạn, không cần Codex/ChatGPT chạy. Trong lúc chưa chuyển, cấu hình `mode: legacy` giữ máy chủ cũ để không làm mất dữ liệu. Học sinh chỉ cần tên và mã riêng do admin cấp; mã được băm trên máy chủ, chỉ hiển thị một lần khi cấp hoặc đặt lại.

## Chạy ứng dụng

Giữ nguyên cấu trúc thư mục và mở `index.html` trong Chrome/Edge. Không cần npm hoặc bước build.

Để dùng localhost và thử micro:

```sh
python CHAY-TREN-MAY.py
```

Trên macOS/Linux có thể dùng `python3`. Mở địa chỉ được in ra trong cửa sổ lệnh. Nhận dạng tiếng nói có thể cần Internet; giọng đọc phụ thuộc thiết bị.

## Tạo lớp và mở thi online

1. Sau khi triển khai theo hướng dẫn Cloudflare, mở `admin.html` và đăng nhập bằng tên + mật khẩu admin riêng.
2. Thêm từng tên học sinh. Sao chép mã riêng vừa hiện và gửi riêng cho học sinh.
3. Chọn ngày học/phạm vi, số giây mỗi câu và tạo phòng.
4. Sao chép liên kết phòng để gửi cho các bạn. Mỗi học sinh đăng nhập bằng tên và mã riêng rồi vào chỗ.
5. Khi cả lớp sẵn sàng, admin bấm **Bắt đầu thi**. Học sinh chọn một đáp án trong thời gian cho phép.
6. Đúng/sai chỉ hiện sau khi hết giờ; admin bấm **Câu tiếp theo** hoặc **Chốt kết quả**.

Phòng có tối đa 40 thí sinh. Đồng bộ qua máy chủ khoảng 2 giây/lần. Nhân vật Three.js mang tên học sinh, đi vào ghế khi tham gia và đi ra khi rời phòng. Nếu mất kết nối/đóng tab mà không gửi được thông báo rời, nhân vật ra sau khoảng 22 giây không có tín hiệu. Khi WebGL không khả dụng, ứng dụng dùng danh sách ghế dự phòng và vẫn thi bình thường.

Học sinh đăng nhập có thể quay lại học hằng ngày; tiến độ được lưu theo tài khoản riêng trên máy chủ. Admin xem tiến độ và kết quả online trong **Kết quả** ở danh sách học sinh. Cấp lại mã hoặc khóa tài khoản sẽ đăng xuất các phiên cũ.

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
| `online.js` | Đăng nhập học sinh, đồng bộ tiến độ và phòng thi |
| `classroom3d.js` | Phòng ghế/nhân vật Three.js và chuyển động vào/ra |
| `admin.html` | Trang quản trị đăng nhập mật khẩu, thêm học sinh, tạo phòng và sao lưu dữ liệu |
| `config.js` | Địa chỉ API công khai; workflow cập nhật khi triển khai thành công |
| `online-server/` | Worker API, cơ sở dữ liệu D1, trang admin, migrations và kiểm tra nhiều người |
| `voices.js` | Chọn giọng nữ cho hội thoại; loại giọng nam và yêu cầu xác nhận giọng chưa rõ |
| `assets/audio/` | 73 bản đọc bài giảng bằng giọng nữ Hoài My và tệp thông tin đối chiếu |
| `questions.js` | Bộ sinh câu hỏi, câu nguồn, quy tắc tạo đề và chấm đáp án |
| `assets/` | Ảnh trang sách được dùng trong từng bài |
| `tai-lieu/` | Hai PDF và 27 tệp Word gốc |
| `scripts/verify-content.cjs` | Kiểm tra cấu trúc chương trình, câu hỏi, phạm vi đề và chấm điểm |
| `.github/workflows/checks.yml` | Tự chạy kiểm tra khi push và tạo PR |

Các tệp dữ liệu khai báo biến JavaScript toàn cục; hiện chưa dùng hệ module hoặc cơ sở dữ liệu. Chỉnh sửa `data.js` cần giữ nguyên các mã bài/ngày để không làm sai tiến độ đã lưu của người học.

## Kiểm tra trước khi gửi PR

Cần Node.js 24 trở lên, không cài thêm gói:

```sh
node --check app.js
node --check voices.js
node --check data.js
node --check guides.js
node --check questions.js
node scripts/verify-content.cjs
node scripts/verify-voices.cjs
node online-server/build.mjs
node online-server/tests/server.test.mjs
node scripts/verify-online-client.mjs
```

Kiểm tra tự động chưa thay cho chạy thử trình duyệt, nghe giọng, thử micro hoặc thẩm định nội dung sư phạm.

## GitHub Pages

Vào **Settings → Pages → Deploy from a branch → main → /(root)**. Giữ `index.html` ở gốc kho. Kho có `.nojekyll`, không cần build.

Khả năng bật Pages cho kho riêng tư phụ thuộc gói GitHub của tài khoản/tổ chức. Quyền truy cập website Pages và quyền truy cập kho mã là hai thiết lập khác nhau; cần kiểm tra cấu hình Pages trước khi xuất bản.

## Nguồn tài liệu và phạm vi hiện tại

Lịch 175 ngày là đề xuất; lời giảng và câu bổ sung chưa được thẩm định để khẳng định bám 100% mọi yêu cầu từng tiết. Gia sư hội thoại hoạt động theo kịch bản, chưa phải AI tự do. Chi tiết xem [HUONG-DAN.md](HUONG-DAN.md) và [KIEM-TRA-BAN-PHAT-HANH.txt](KIEM-TRA-BAN-PHAT-HANH.txt).

Sách, ảnh sách và đề Word có nguồn riêng do chủ dự án cung cấp. Không gán giấy phép mã nguồn cho các tài liệu này. Chưa thêm giấy phép phát hành mã nguồn; chủ dự án có thể chọn giấy phép riêng cho phần mã do dự án biên soạn khi xác định cách chia sẻ.

Không đưa tiến độ cá nhân, bản sao câu trả lời của trẻ, mật khẩu, khóa API hoặc token vào Git.

## Giọng cô Mi A

Nút **Nghe cô giảng** phát tệp MP3 giọng nữ tổng hợp `vi-VN-HoaiMyNeural` kèm sẵn cho từng bài. Vì vậy Chrome có giọng mặc định là nam vẫn phát giọng nữ cho bài giảng. Mở **Dành cho phụ huynh → Nghe giọng nữ cô Mi A** để nghe mẫu.

Phần đọc hội thoại dùng giọng nữ tiếng Việt được nhận diện rõ trên thiết bị. Không tự dùng giọng nam; giọng chưa rõ giới tính cần phụ huynh nghe thử xong và xác nhận. Web Speech không có trường giới tính hoặc tuổi chuẩn, nên không thể tự xác minh âm sắc trẻ theo tuổi. Đổi cao độ không được dùng để giả lập giới tính.

Khi sửa lời giảng, cập nhật âm thanh tương ứng. Công cụ dành cho người bảo trì: cài `edge-tts` trong môi trường Python riêng và chạy `python scripts/generate-lesson-audio.py` từ gốc kho. Công cụ cần Internet, Node.js và truy cập dịch vụ giọng nói; ứng dụng chạy bình thường không cần cài các phụ thuộc tạo âm thanh. Giữ xác minh chứng chỉ TLS. Bộ kiểm tra giọng đối chiếu nội dung gốc và mã kiểm tra của các MP3.

## Nâng cấp phần máy chủ

Làm theo [hướng dẫn triển khai độc lập](DEPLOY-CLOUDFLARE.md): thêm ba GitHub Secrets, chạy workflow **Deploy MIA độc lập**, rồi dùng trang admin trên GitHub Pages. Sau khi bật `MIA_AUTO_DEPLOY=true`, các lần sửa máy chủ/admin ở nhánh main có thể tự triển khai. Không cần Codex để vận hành, đăng nhập hoặc cập nhật qua workflow.

Mã mặc định dùng `AUTH_MODE=standalone`, phiên admin riêng và mật khẩu băm PBKDF2. Bản legacy giữ đăng nhập nền tảng chỉ để chuyển dữ liệu. Không sửa migration đã áp dụng; thêm migration mới khi đổi schema.

Giọng Mi A dùng Hoài My với tốc độ +4%, cao độ +10 Hz để sáng và nhanh nhẹn hơn. Đây là điều chỉnh âm sắc của giọng nữ tổng hợp, không phải xác minh tuổi người nói. Các tệp MP3 đã mang lời giới thiệu “Cô là Mi A”.
