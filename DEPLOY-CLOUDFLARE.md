# Chạy MIA độc lập từ GitHub, không cần Codex/ChatGPT

Giao diện học và admin nằm trên GitHub Pages. Máy chủ xác thực, lưu học sinh và đồng bộ phòng thi chạy trên **Cloudflare Worker + D1 trong tài khoản Cloudflare của bạn**. GitHub Actions triển khai phần này. Không cần Codex hoạt động để web chạy và không cần đăng nhập ChatGPT ở bản độc lập.

GitHub Pages không chạy máy chủ/cơ sở dữ liệu. Vì vậy mã có thể nằm hoàn toàn trong GitHub, nhưng tài khoản và thi nhiều người vẫn cần Cloudflare.

## 0. Nếu đã có học sinh hoặc kết quả ở bản đang chạy

Trước khi chuyển, mở [admin bản cũ](https://hoc-toan-cung-mia-online.glovedbetta.chatgpt.site/admin), đăng nhập bằng tài khoản chủ ứng dụng và bấm **Xuất sao lưu dữ liệu**. Giữ tệp JSON trên máy của bạn, không đưa vào GitHub công khai.

Sau khi bản độc lập chạy, nhập tệp ở trang admin mới **trước khi thêm học sinh mới**. Mã học sinh cũ và dữ liệu học/thi được giữ; các phiên đăng nhập cũ không chuyển nên học sinh cần đăng nhập lại. Không có mật khẩu admin hay khóa Cloudflare trong tệp sao lưu.

Nếu chưa nhập học sinh ở bản cũ thì bỏ qua bước sao lưu.

## 1. Chuẩn bị Cloudflare một lần

1. Đăng nhập/tạo tài khoản tại https://dash.cloudflare.com/.
2. Mở **Workers & Pages** và hoàn tất kích hoạt tên miền con `workers.dev` nếu tài khoản mới yêu cầu.
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
