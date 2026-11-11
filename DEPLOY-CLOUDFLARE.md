# Chạy MIA độc lập từ GitHub, không cần Codex/ChatGPT

Giao diện học và admin nằm trên GitHub Pages. Máy chủ xác thực, lưu học sinh và đồng bộ phòng thi chạy trên **Cloudflare Worker + D1 trong tài khoản Cloudflare của bạn**. GitHub Actions triển khai phần này. Không cần Codex hoạt động để web chạy và không cần đăng nhập ChatGPT ở bản độc lập.

GitHub Pages không chạy máy chủ/cơ sở dữ liệu. Vì vậy mã có thể nằm hoàn toàn trong GitHub, nhưng tài khoản và thi nhiều người vẫn cần Cloudflare.

## 0. Nếu đã có học sinh hoặc kết quả ở bản đang chạy

Trước khi chuyển, mở [admin bản cũ](https://hoc-toan-cung-mia-online.glovedbetta.chatgpt.site/admin), đăng nhập bằng tài khoản chủ ứng dụng và bấm **Xuất sao lưu dữ liệu**. Giữ tệp JSON trên máy của bạn, không đưa vào GitHub công khai.

Sau khi bản độc lập chạy, nhập tệp ở trang admin mới **trước khi thêm học sinh mới**. Mã học sinh cũ và dữ liệu học/thi được giữ; các phiên đăng nhập cũ không chuyển nên học sinh cần đăng nhập lại. Không có mật khẩu admin hay khóa Cloudflare trong tệp sao lưu.

Nếu chưa nhập học sinh ở bản cũ thì bỏ qua bước sao lưu.

## 1. Chuẩn bị Cloudflare một lần

1. Đăng nhập/tạo tài khoản tại https://dash.cloudflare.com/.
2. Mở **Workers & Pages** để tài khoản sẵn sàng dùng Workers. Nếu chưa có tên miền con `workers.dev`, workflow sẽ tự tạo một tên dành cho MIA; tên đã có sẽ được giữ nguyên.
3. Sao chép **Account ID** của đúng tài khoản Cloudflare định dùng.
4. Vào **My Profile → API Tokens → Create Token → Custom token**. Chỉ cấp cho đúng tài khoản, với các quyền:

   - Account → Workers Scripts → Edit.
   - Account → D1 → Edit.
   - Account → Account Settings → Read.

Không cần quyền DNS, quyền mọi Zone hoặc Global API Key. Lưu token vào GitHub Secrets ở bước tiếp theo; không gửi token vào chat hoặc mã nguồn.

## 2. Thêm ba GitHub Secrets

Mở **[Settings → Secrets and variables → Actions](https://github.com/nhiem-qn/H-c-To-n-4/settings/secrets/actions)**, chọn **New repository secret** và tạo:

| Tên Secret | Giá trị do bạn nhập |
|---|---|
| `CLOUDFLARE_API_TOKEN` | API token vừa tạo ở Cloudflare |
| `CLOUDFLARE_ACCOUNT_ID` | Account ID gồm 32 kí tự của Cloudflare |
| `MIA_ADMIN_PASSWORD` | Mật khẩu admin riêng bạn chọn, dài 12–256 kí tự, không xuống dòng |

Tên đăng nhập admin mặc định là **admin**. Muốn đổi tên, vào tab **Variables**, tạo `MIA_ADMIN_USERNAME` với tên bạn chọn.

Các biến tùy chọn khác:

| Variable | Mặc định | Khi cần |
|---|---|---|
| `MIA_WORKER_NAME` | `mia-online` | Đổi tên Worker trước lần đầu triển khai |
| `MIA_APP_URL` | URL GitHub Pages của kho hiện tại | Khi dùng tên miền riêng hoặc địa chỉ giao diện khác |
| `MIA_AUTO_DEPLOY` | Chưa bật | Đặt `true` để tự triển khai khi đẩy thay đổi máy chủ/admin lên nhánh main |

Nếu đổi Worker name sau này, workflow sẽ dùng cơ sở dữ liệu mang tên tương ứng. Giữ nguyên tên để dùng tiếp dữ liệu hiện có.

## 3. Bấm Run workflow

Mở **[Actions → Deploy MIA độc lập](https://github.com/nhiem-qn/H-c-To-n-4/actions/workflows/deploy-cloudflare.yml)** → **Run workflow** → chọn nhánh `main` → **Run workflow**.

Workflow sẽ:

1. Kiểm tra mã, quyền truy cập và dữ liệu thử.
2. Tạo hoặc dùng lại D1 `mia-online-db` trong tài khoản của bạn.
3. Áp dụng các migration thêm bảng, không xóa học sinh đang có.
4. Triển khai Worker và đặt mật khẩu đã băm thành secrets của Worker; không đưa mật khẩu thô vào mã nguồn.
5. Thử đăng nhập/đăng xuất admin qua API thật.
6. **Chỉ khi thử thành công**, cập nhật `config.js` sang địa chỉ `.workers.dev` của bạn và yêu cầu GitHub Pages xuất bản lại.

Xem **Summary** của lần chạy để lấy URL máy chủ và admin. Nếu thiếu secrets hoặc triển khai lỗi, `config.js` không được đổi; bản web trước đó được giữ.

Nếu bước cập nhật `config.js` hoặc GitHub Pages báo 403, kiểm tra **Settings → Actions → General → Workflow permissions** cho phép workflow ghi nội dung. Kho cần bật Pages từ `main` / `(root)` như bản hiện tại.

## 4. Vào admin trên GitHub Pages

👉 https://nhiem-qn.github.io/H-c-To-n-4/admin.html

Đăng nhập bằng tên admin (mặc định `admin`) và mật khẩu bạn đặt ở `MIA_ADMIN_PASSWORD`. Không dùng tài khoản ChatGPT. Nếu còn thấy thông báo chuyển đổi, đợi Pages hoàn tất và nhấn Ctrl+F5.

Để đổi mật khẩu, cập nhật Secret `MIA_ADMIN_PASSWORD` rồi chạy lại workflow. Phiên admin cũ sẽ hết hiệu lực; học sinh và kết quả không bị xóa. Sau mỗi lần triển khai, admin có thể cần đăng nhập lại.

## 5. Khôi phục dữ liệu và dùng bình thường

Nếu đã sao lưu ở bước 0, chọn **Nhập sao lưu** trên trang admin mới. Chức năng này chỉ nhận cơ sở dữ liệu trống để tránh ghi đè dữ liệu. Nếu bị ngắt giữa chừng, chọn lại **đúng tệp đó** để tiếp tục; không thêm hoặc xóa thủ công các bản ghi đang khôi phục.

Giới hạn nhập qua web: 8 MB và 20.000 bản ghi. Giữ tệp sao lưu riêng tư.

Sau đó: thêm tên → cấp mã riêng → tạo phòng → gửi liên kết cho học sinh. Học sinh không cần tài khoản Cloudflare, GitHub hay ChatGPT.

Khi đã kiểm tra bản mới và dữ liệu đầy đủ, bạn có thể giữ hoặc ngừng dịch vụ cũ. Bản Cloudflare độc lập không dùng địa chỉ `chatgpt.site` hoặc header `oai-authenticated-*` để cấp quyền admin.

## Dành cho người sửa mã

- Giao diện admin: `admin.html`.
- Địa chỉ API công khai: `config.js`.
- Máy chủ: `online-server/worker/index.js`.
- SQL migrations: `online-server/drizzle/` (không sửa migration đã áp dụng).
- Triển khai: `.github/workflows/deploy-cloudflare.yml`.
- Tạo Worker/D1 và cấu hình secrets: `online-server/scripts/deploy-cloudflare.mjs`.
- Kiểm tra mật khẩu, phân quyền, chuyển dữ liệu: `online-server/tests/standalone.test.mjs`.

`AUTH_MODE=standalone` là mặc định và được workflow đặt rõ ràng. `AUTH_MODE=sites` chỉ giữ tương thích bản cũ khi xuất dữ liệu; không bật chế độ đó trên Cloudflare của bạn. Các tệp `.openai/` còn lại chỉ phục vụ bản cũ, không được workflow Cloudflare sử dụng.

Để kiểm tra:

```sh
node online-server/build.mjs
node online-server/tests/server.test.mjs
node online-server/tests/standalone.test.mjs
node scripts/verify-online-client.mjs
```

Cần Node.js 24. Việc chạy ứng dụng trên web không cần cài Node.js ở máy học sinh.


## Thi ngày tự động và chuông trong ứng dụng

Worker dùng Cron Trigger `0 13 * * *` (13h UTC = 20h Việt Nam) để tạo một đề 5 câu mỗi ngày. Trang web cũng tự kiểm tra và tạo bù đề nếu lịch Cron bị trễ. Một ngày chỉ có một phòng tự động, tối đa 40 thí sinh. 20h mở lớp, 20h01 bắt đầu; mỗi câu 60 giây làm bài và 8 giây xem đáp án. Máy chủ tự chuyển câu, chốt kết quả, và từ chối câu trả lời trễ. Học sinh đã đăng nhập bấm **Vào thi ngay**; không cần nhập mã phòng ngày. Thi tuần/tháng do admin tạo, vẫn vào bằng mã phòng.

Admin chỉnh **Ngày thứ Hai bắt đầu tuần học 1** trên trang quản trị để chọn đúng bài theo lịch 35 tuần. Nếu chưa chỉnh, ứng dụng dùng thứ Hai đầu tiên tháng 9 của năm học hiện tại. Thứ Bảy/Chủ nhật ôn bài thứ Sáu; ngoài 175 ngày giữ mốc ngày 1 hoặc 175. Thay đổi lịch không thay đề đã tạo trong ngày. Sao lưu bao gồm cấu hình lịch và ánh xạ phòng thi tự động, đồng thời vẫn nhận được bản sao cũ chưa có các trường này.

Thông báo hiện trên mọi trang trong ứng dụng. Bấm **Bật chuông nhắc thi** trong mỗi lần mở ứng dụng để trình duyệt cho phép âm thanh. Cần giữ trang mở và có Internet; đây là chuông trong ứng dụng, không phải thông báo đẩy khi đóng trình duyệt. Khi máy/tab ngủ, mở lại trang để nhận trạng thái giờ thi hiện tại.


## Cô Mi A đọc đề và nhắc bài

Phòng thi đọc câu hỏi khi mở câu; đến nửa thời gian, máy chủ gửi kiến thức liên quan để cô nhắc cho học sinh chưa nộp. Gần hết giờ (10 giây cuối với câu 60 giây), cô dừng phần đọc dài và nhắc chọn đáp án. Các mốc chỉ nhắc một lần mỗi câu, không lặp theo nhịp đồng bộ; học sinh đã trả lời không bị thúc giục tiếp. Kiến thức gợi ý được lấy từ phần lý thuyết theo chủ đề, không dùng đáp án hay lời giải của câu đang thi.

`exam-teacher.js` ghép câu hỏi từ các cụm đọc và số, cùng các lời nhắc thu sẵn bằng giọng nữ `vi-VN-HoaiMyNeural` (+4%, +10Hz). Bản đọc nằm trong `assets/audio/exam/`, không cần dịch vụ tạo giọng hoặc khóa API khi học. Nếu thiếu bản đọc do sửa ngân hàng câu hỏi, chỉ giọng nữ tiếng Việt đã được xác định/xác nhận mới được dùng làm dự phòng. Có nút nghe lại đề và bật/tắt cô đọc; trình duyệt có thể yêu cầu bấm nút để cho phép âm thanh sau khi tải lại trang. Mở trực tiếp file HTML dùng chuỗi phát MP3; phục vụ qua HTTPS/localhost dùng Web Audio để ghép mượt hơn.

Khi sửa mẫu câu hỏi: chạy `node scripts/prepare-exam-audio.cjs`, cài `edge-tts` trong môi trường phát triển, rồi chạy `python scripts/generate-exam-audio.py`. Công cụ tạo các tệp âm thanh một lần; ứng dụng học không phụ thuộc vào máy đã tạo chúng. Chạy `node scripts/verify-exam-teacher.cjs` và `node scripts/verify-exam-playback.mjs` để kiểm tra độ phủ, giọng, tính toàn vẹn và ưu tiên lời nhắc.


## Học theo sách giáo khoa, bài giảng từng bước và kế hoạch mỗi ngày

Trang chủ hỏi học sinh bài, tập sách, trang/buổi đang học trên lớp và mức tự tin. Có tìm tên bài/số trang và thẻ bấm chọn nhanh. Lần đầu phải chọn bài và cảm nhận; ứng dụng không tự coi học sinh đã học đến bài 1. Khi đã xác nhận trong ngày, biểu mẫu thu gọn và có nút đổi bài.

`learning.js` lập kế hoạch dựa trên tiến độ trên lớp và bằng chứng làm bài: nghe/đọc lý thuyết, học trang sách gốc, ba câu luyện và kiểm tra năm câu. Có thể thêm một hoạt động gỡ lỗi ngắn nếu bài vừa làm còn yếu; ôn lại chủ đề trước khi cần và nhắc ôn cách quãng theo các mốc 1/3/7 ngày. Kế hoạch không tự đẩy học sinh sang bài vượt tiến độ lớp. Mốc thời gian là gợi ý, không phải hạn hoàn thành bắt buộc.

Tự nhận xét, hoạt động đã làm và kết quả câu hỏi được lưu riêng. Bấm “đã đọc” chỉ hoàn thành một hoạt động; không tăng mức nắm bài. Câu bỏ trống không được suy diễn là bằng chứng chưa hiểu. Mỗi chủ đề dùng tối đa 12 câu gần nhất; cần nhiều câu và ít nhất ba câu khác nhau để hiện “Làm khá chắc”. Các mức là gợi ý học tập, không phải chẩn đoán hay đánh giá chính thức của trường. Kết quả thi online được lấy theo tài khoản học sinh và chỉ dùng sau khi máy chủ cho phép hiện đúng/sai.

Dữ liệu nằm trong `progress.learning`, được lưu riêng theo học sinh và đồng bộ bằng API tiến độ hiện có. Admin xem bài trên lớp, việc trong ngày và nhận xét chủ đề trong báo cáo học sinh. Bản sao JSON và bản sao máy chủ giữ cả thông tin này.

`lesson-studio.js` mở rộng lý thuyết của 50 chủ đề thành 583 bước, khoảng 110 phút giọng nữ Hoài My, được dùng cho đủ 73 bài / 175 buổi. Mỗi chủ đề có giải thích ý nghĩa, cách làm, ví dụ mẫu, ví dụ thứ hai có lời giải, mẹo tránh nhầm và tự kiểm tra. Bài ôn tập được chia các chủ đề theo buổi. Toàn bộ trang sách gốc vẫn là căn cứ đối chiếu; lời giảng và ví dụ bổ sung được ghi rõ là bổ trợ.

`studio-player.js` dùng thời gian của chính tệp MP3 và mốc câu đã kiểm chứng để chuyển bước và viết bảng. Tạm dừng dừng cả hai; có nghe chậm, bước trước/tiếp và minh họa chia phần ở ví dụ phân số. Bỏ qua bước không tự ghi nhận đã nghe trọn bài. Học sinh có thể xác nhận đã đọc riêng; mức hiểu vẫn dựa trên câu đã chấm.

Khi sửa lời giảng: chạy `node scripts/prepare-studio.cjs`, sau đó `python scripts/generate-studio-audio.py` (cần `edge-tts` cho người phát triển). Công cụ tạo MP3 và mốc câu một lần; ứng dụng học không cần Codex, khóa AI hay máy đã tạo âm thanh. Chạy các kiểm tra `verify-learning.cjs`, `verify-studio-player.mjs`, `verify-studio-content.cjs` và `online-server/tests/learning.test.mjs` trước khi triển khai.
