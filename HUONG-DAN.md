# Vườn Toán 4 — Học cùng cô Mai

## Mở ứng dụng

1. Giải nén toàn bộ VUON-TOAN-4.zip vào một thư mục trên máy tính.
2. Mở `index.html` bằng Chrome hoặc Edge. Giữ nguyên các tệp JavaScript, CSS, thư mục `assets` và `tai-lieu` bên cạnh tệp HTML.
3. Vào **Dành cho phụ huynh** để đặt tên con, ngày bắt đầu và chọn giọng tiếng Việt.

Không cần tài khoản, không cần khóa API, không cần cài thư viện. Bài học, ảnh sách, luyện tập và chấm điểm sử dụng được khi không có Internet.

### Để dùng micro trên máy

Nhận dạng tiếng nói thường cần Internet, trình duyệt hỗ trợ và địa chỉ an toàn. Mở trực tiếp bằng `file://` có thể không dùng được micro.

Nếu đã cài Python 3, mở `CHAY-TREN-MAY.py`, hoặc chạy trong thư mục ứng dụng:

```sh
python CHAY-TREN-MAY.py
```

Trên macOS/Linux có thể cần dùng `python3`. Chương trình phục vụ ứng dụng tại `http://localhost:8000`, chỉ trên máy hiện tại. Nhấn Ctrl+C trong cửa sổ lệnh để dừng. Nếu cổng 8000 đang được dùng, chạy:

```sh
python CHAY-TREN-MAY.py 8001
```

Ứng dụng vẫn cho gõ câu hỏi và câu trả lời khi không có micro.

## Nội dung và nguồn

- Chương trình chính: hai PDF Toán 4 **Kết nối tri thức với cuộc sống**, tái bản lần thứ ba theo bìa sách, do người dùng gửi.
- Danh mục 73 bài theo mục lục: tập 1 có bài 1–37, tập 2 có bài 38–73.
- Mỗi bài giữ ảnh đầy đủ các trang sách gốc, kèm liên kết PDF. Các trang nội dung: tập 1 trang 6–130; tập 2 trang 4–118.
- Lời giảng trước bài, ví dụ, mẹo tránh nhầm và phần lớn câu tự chấm được biên soạn bổ trợ; không phải bản chép nguyên văn lời giảng của nhà xuất bản.
- Lịch **175 ngày / 35 tuần** là lịch đề xuất, phân bổ theo độ dài bài, không phải phân phối tiết chính thức. Học kì I đề xuất 90 ngày, học kì II 85 ngày. Có thể chọn bất cứ bài nào theo lớp thực tế.
- Danh mục đầy đủ có trong `DOI-CHIEU-CHUONG-TRINH.csv`.
- Bản này nhập 27 tài liệu Word: hai giáo án KNTT, 17 tập bài cuối tuần KNTT (tuần 1, 2, 3, 5–18), tám tập đề ôn/kiểm tra KNTT hoặc đề chung. Không có tập tuần 4 KNTT trong nhóm tệp được cung cấp.
- Các tài liệu Cánh Diều, Chân trời sáng tạo và tài liệu còn lại chưa nhập vào bản này. Chúng không được dùng để thay đổi thứ tự sách chính.
- Có 31 câu trích/chuyển thể có ghi tên tài liệu và vị trí, cùng ngân hàng câu bổ sung theo chủ đề. Khi tạo đề, tối đa khoảng một phần ba số câu được chọn từ câu nguồn phù hợp, nếu có đủ.
- Không phải mọi câu trong 27 tệp đã được chuyển thành câu tự chấm. Hình, công thức nhúng trong Word có thể không hiện ở “Xem văn bản”; tệp Word gốc giữ đầy đủ để tải xuống.
- Các trang sách được giữ nguyên. Chưa có thẩm định độc lập để khẳng định toàn bộ lời giảng, lịch ngày và câu tương tác bám 100% mọi yêu cầu từng tiết. Phụ huynh/giáo viên có thể đối chiếu ngay trang gốc của mỗi bài.

## Một buổi học

1. **Cô giảng bài**: đọc quy tắc, nghe giọng cô, xem ví dụ và mẹo tránh nhầm.
2. **Sách giáo khoa**: xem trang gốc của buổi; làm các bài sách vào vở. Có thể mở toàn bộ bài hoặc PDF.
3. **Cùng luyện tập**: ba câu thử, xem phản hồi và đổi câu.
4. **Kiểm tra ngày**: năm câu, nộp bài rồi xem điểm và lời giải.

Phần “Em đã hiểu” đánh dấu đã học để mở nút kiểm tra ngày; ứng dụng không tự xác minh con đã đọc hay hiểu. Nộp bài cuối ngày sẽ đánh dấu ngày đó hoàn thành, dù điểm thấp. Khuyến khích xem câu sai và học lại.

## Các chặng kiểm tra

| Chặng | Số câu | Phạm vi |
|---|---:|---|
| Ngày | 5 | Bài của ngày chọn |
| Tuần | 10 | Tối đa 5 ngày học gần nhất trong học kì |
| Tháng | 15 | Tối đa 20 ngày học gần nhất trong học kì |
| Quý | 20 | Tối đa 60 ngày học gần nhất trong học kì |
| Giữa kì | 20 | Từ đầu học kì tới ngày 45 hoặc 135 theo lịch gợi ý |
| Cuối kì | 25 | Ngày 1–90 hoặc 91–175 |

“Tháng”, “quý” là chặng theo ngày học, không phải tháng/quý dương lịch. Các chặng cuối học kì ngắn hơn. Lịch chưa trừ ngày nghỉ lễ. Đây là bài kiểm tra hỗ trợ học tập, không phải đề chuẩn hóa chính thức, không sao chép ma trận và cách chia điểm của đề Word.

- Mỗi câu có trọng số bằng nhau trên thang 10.
- Phân số tương đương được nhận: `2/4` và `1/2`.
- Có thể nhập số theo dạng `76 946`, `76.946` hoặc `76946`.
- Không chấm các bước trình bày bài tự luận viết vào vở; phụ huynh/giáo viên cần xem thêm.
- Có thể in đề, in lời giải sau khi nộp và xuất bảng điểm CSV.

## Giọng cô và hội thoại hai chiều

Cô Mai là nhân vật nữ vui vẻ, có hình minh họa. Phần đối đáp hoạt động theo kịch bản và chủ đề bài hiện tại, **chưa phải AI hội thoại tự do**.

Con có thể nói/gõ:

- “Cô giảng lại nhé.”
- “Cho em ví dụ.”
- “Gợi ý cho em.”
- “Cô hỏi em nhé.” Sau đó trả lời câu cô hỏi.

Ứng dụng nhận đáp án số, chữ và phân số. Có xử lí các số nói bằng tiếng Việt thông dụng; nhận dạng thực tế có thể sai. Với phân số, gõ `3/4` là cách chắc chắn nhất.

Giọng đọc dùng Web Speech của hệ điều hành/trình duyệt, ưu tiên tiếng Việt; không kèm tệp thu âm của giáo viên. Cần chọn một giọng nữ tiếng Việt nếu thiết bị có hỗ trợ. Không thể bảo đảm giọng nữ trẻ trên mọi máy. Một số giọng cần Internet; giọng được hệ thống đánh dấu “trên máy” có thể hoạt động ngoại tuyến sau khi đã cài.

Micro có bước đồng ý của phụ huynh trước khi nhận dạng. Dịch vụ nhận dạng của trình duyệt có thể truyền âm thanh lên hệ thống của nhà cung cấp. Ứng dụng không có máy chủ riêng để lưu âm thanh.

## Giữ tiến độ

Dữ liệu lưu bằng localStorage trong trình duyệt hiện tại. Không có đăng nhập hoặc đồng bộ nhiều máy. Xóa dữ liệu trình duyệt có thể làm mất tiến độ.

- **Xuất tiến độ JSON** để sao lưu tên, lịch và lịch sử câu trả lời.
- **Nhập bản sao** để khôi phục hoặc chuyển sang máy khác; sẽ thay dữ liệu hiện tại sau xác nhận.
- **Xuất bảng điểm CSV** để xem bằng Excel.

Khi đổi vị trí tệp, trình duyệt hoặc tên miền, hãy xuất rồi nhập để chuyển tiến độ.

## Đưa lên GitHub Pages

Mã ứng dụng là HTML/CSS/JavaScript tĩnh, không cần npm và không cần bước build.

1. Tạo một repository trên GitHub.
2. Đưa **nội dung bên trong thư mục ứng dụng** lên nhánh `main`; `index.html` ở gốc repository.
3. Giữ nguyên cấu trúc `assets`, `tai-lieu`, các tệp `.js` và `.css`.
4. Trong **Settings → Pages**, chọn **Deploy from a branch → main → /(root)**, rồi Save.
5. Mở URL GitHub Pages được cung cấp. HTTPS phù hợp hơn cho micro.

GitHub Pages công khai nội dung được đưa lên. Gói này chứa sách và tài liệu do bạn cung cấp; chỉ phổ biến công khai khi có quyền phù hợp. Có thể dùng riêng trên máy nếu chưa muốn công khai tài liệu.

## Kiểm tra đã thực hiện

- Kiểm tra cú pháp các tệp JavaScript.
- Kiểm tra 73 bài, 175 ngày và bao phủ mọi trang nội dung của cả hai tập.
- Sinh và kiểm tra dữ liệu 7 300 câu mẫu, đủ số câu của 175 đề ngày và 54 tổ hợp kiểm tra định kì.
- Kiểm tra chấm phân số tương đương, số có phân cách hàng nghìn và mẫu số 0.
- Kiểm tra dựng nội dung các màn hình, 24 phần bài học mẫu, chọn chặng kiểm tra, kết quả và hội thoại bằng mô phỏng DOM.
- Chưa kiểm tra trực quan trong trình duyệt, phát giọng thực tế hoặc micro trên thiết bị gia đình. Môi trường làm việc không cung cấp công cụ `cua_repl.js` theo quy trình preview được hỗ trợ.

Các tệp chính để chỉnh sửa: `data.js` (bài/ngày/tài liệu), `guides.js` (lời giảng), `questions.js` (ngân hàng câu hỏi), `app.js` (chức năng), `style.css` (giao diện).
