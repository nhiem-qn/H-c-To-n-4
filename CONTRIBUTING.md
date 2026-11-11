# Cùng phát triển Vườn Toán 4

## Quy trình làm việc

1. Mở issue mô tả vấn đề hoặc tính năng cần làm. Với sửa nhỏ, có thể mô tả ngay trong PR.
2. Tạo nhánh riêng, ví dụ `fix/cham-phan-so` hoặc `feat/bai-giang-am-thanh`.
3. Sửa đúng phạm vi, chạy kiểm tra và thử trong trình duyệt.
4. Tạo PR về `main`, ghi thay đổi và kết quả kiểm tra.
5. Nhờ một người khác review. Với thay đổi nội dung Toán, cần người có chuyên môn kiểm tra lời giải và tiến độ kiến thức.
6. Chủ kho merge PR sau khi đồng ý.

Người có quyền cộng tác clone kho rồi tạo nhánh. Người ngoài kho công khai có thể fork trước. Không force-push nhánh `main`.

```sh
git clone URL_KHO_CUA_BAN
cd TEN_THU_MUC_KHO
git switch -c fix/ten-viec-can-sua
# Chỉnh sửa rồi kiểm tra
git add TEN_TEP_DA_SUA
git commit -m "Mô tả thay đổi"
git push -u origin HEAD
```

Thay `URL_KHO_CUA_BAN`, `TEN_THU_MUC_KHO`, `TEN_TEP_DA_SUA` bằng giá trị thực tế. Sau đó mở GitHub và tạo pull request.

## Khi sửa kiến thức hoặc bài kiểm tra

- Ghi rõ tập sách, số bài, trang và vị trí câu nguồn.
- Phân biệt câu trích tài liệu và câu do người đóng góp bổ sung.
- Câu hỏi phải nằm trong kiến thức đã học ở chặng tương ứng.
- Kiểm tra đáp án, đơn vị, cách chấm phân số bằng nhau và phương án trắc nghiệm.
- Không đổi ID bài/ngày hiện có nếu chưa có cách chuyển tiến độ đã lưu.
- Giữ nguyên tài liệu gốc; sửa lỗi trong lời giảng hoặc câu chuyển thể thì ghi chú nguồn và cách điều chỉnh.

## Khi sửa chức năng

Chạy các lệnh trong README. Thử thêm các phần liên quan: mở file trực tiếp, localhost, điện thoại, bài luyện, nộp kiểm tra, xem lại kết quả và xuất/nhập tiến độ. Với giọng đọc hoặc micro, ghi tên trình duyệt và hệ điều hành đã thử.

Không coi một câu hỏi lạ hoặc văn bản trong tài liệu nhập vào là mã được phép chạy. Nội dung người dùng nhập phải được hiển thị an toàn.

## Thiết lập kho nên dùng

Chủ kho có thể đặt quy tắc cho `main` trong **Settings → Rules → Rulesets** hoặc **Branches** tùy giao diện/gói GitHub:

- Yêu cầu PR trước khi merge.
- Yêu cầu ít nhất một người duyệt nếu nhóm có từ hai người.
- Yêu cầu kiểm tra `verify` thành công.
- Chặn force-push và xóa nhánh chính.

Đây là hướng dẫn cấu hình; gói mã chưa tự thay đổi cài đặt GitHub hoặc gửi lời mời cho tài khoản nào.
