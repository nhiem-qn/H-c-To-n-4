# Học Toán cùng MIA · Địa chỉ ngắn

Website: **https://nhiem-qn.github.io/**

Mã ứng dụng tiếp tục được chỉnh sửa và cộng tác tại:
https://github.com/nhiem-qn/H-c-To-n-4

Kho `nhiem-qn.github.io` chỉ xuất bản website. Workflow lấy mã mới nhất từ kho ứng dụng, giữ API Cloudflare hiện có và đặt địa chỉ trang thành `https://nhiem-qn.github.io/`. Không cần sao chép mật khẩu admin, token Cloudflare hay dữ liệu học sinh sang kho mới. Đăng nhập vẫn dùng máy chủ đang có.

## Kích hoạt một lần

1. Tạo kho **Public** tên chính xác `nhiem-qn.github.io` trong tài khoản `nhiem-qn`.
2. Đưa file `.github/workflows/publish-mia.yml` của bộ cấu hình này vào cùng đường dẫn ở kho mới.
3. Trong **Settings → Pages**, chọn **Source: GitHub Actions** nếu GitHub chưa tự bật.
4. Chọn **Actions → Xuất bản Học Toán cùng MIA → Run workflow** để xuất bản ngay.

Sau đó workflow tự kiểm tra mã mới theo lịch khoảng 15 phút của GitHub. Có thể bấm Run workflow bất cứ khi nào muốn cập nhật ngay. Mã ứng dụng và các bản Windows vẫn quản lý ở kho `H-c-To-n-4`; không cần Codex để website hoạt động.

Bộ xuất bản chỉ mang theo HTML, JavaScript, CSS và tài nguyên công khai; không xuất thư mục Git, máy chủ, khóa truy cập hoặc tệp môi trường.
