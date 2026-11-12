# Học Toán cùng MIA · Địa chỉ ngắn

Website: **https://nhiem-qn.github.io/**

Mã ứng dụng tiếp tục được chỉnh sửa và cộng tác tại:
https://github.com/nhiem-qn/H-c-To-n-4

Kho `nhiem-qn.github.io` lưu bản website được xuất tự động. Chỉnh sửa ứng dụng trong kho gốc `H-c-To-n-4`; bản xuất ở kho này sẽ được đồng bộ lại khi có mã mới. Workflow giữ API Cloudflare hiện có và đặt địa chỉ trang thành `https://nhiem-qn.github.io/`. Không cần sao chép mật khẩu admin, token Cloudflare hay dữ liệu học sinh sang kho mới.

## Kích hoạt một lần

1. Tạo kho **Public** tên chính xác `nhiem-qn.github.io` trong tài khoản `nhiem-qn`.
2. Đưa file `.github/workflows/publish-mia.yml`, `.gitignore` và `README.md` của bộ cấu hình này vào kho mới.
3. Trong **Settings → Pages**, dùng **Deploy from a branch → main → /(root)**. Kho của tài khoản có thể đã tự bật chế độ này.
4. Chọn **Actions → Xuất bản Học Toán cùng MIA → Run workflow** để xuất bản ngay.

Sau đó workflow kiểm tra mã mới theo lịch khoảng 15 phút của GitHub. Khi có thay đổi, workflow xuất tài nguyên, cập nhật nhánh main và yêu cầu Pages xây dựng lại. Có thể bấm Run workflow bất cứ khi nào muốn cập nhật ngay. Nếu mã chưa đổi, workflow giữ bản đang chạy. Không cần Codex để website hoạt động.

Mã nguồn và các bản Windows vẫn quản lý ở kho `H-c-To-n-4`. Bộ xuất bản chỉ mang theo HTML, JavaScript, CSS và tài nguyên công khai; không xuất thư mục Git, máy chủ hoặc tệp môi trường.
