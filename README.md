# AI Vocab Master - Từ Điển & Lịch Sử Thông Minh Tích Hợp AI

Ứng dụng web tra từ vựng tiếng Anh chuyên sâu tích hợp **Google Gemini AI**, hỗ trợ phát âm bản xứ, tra cứu từ loại liên quan (Word Family), lưu trữ lịch sử theo dạng cây phân cấp **Năm -> Ngày tra**, và tích hợp chế độ luyện thẻ Flashcards.

---

## 🌟 Tính Năng Nổi Bật

1. **Tra Cứu & Dịch Thuật Chuyên Sâu Bằng Gemini AI**:
   - Tự động nhận diện từ vựng, cấp độ CEFR (A1 - C2), nghĩa tiếng Việt chính xác và định nghĩa tiếng Anh.
   - Các câu ví dụ song ngữ thực tế, làm nổi bật từ đang học.
   - **Mẹo ghi nhớ từ vựng (Memory Tip)** phân tích gốc từ (etymology) hoặc liên tưởng trực quan.
   - Cụm từ thường gặp (Collocations) & Từ đồng nghĩa / Trái nghĩa.

2. **Các Từ Loại Liên Quan (Word Family)**:
   - Tự động phân loại 4 nhóm chính: **Danh từ (Noun)**, **Động từ (Verb)**, **Tính từ (Adjective)**, **Trạng từ (Adverb)**.
   - Mọi từ loại liên quan đều có thể nhấp trực tiếp vào để tra tiếp từ đó.

3. **Phát Âm Chuẩn Bản Xứ (Pronunciation & Audio)**:
   - Phiên âm quốc tế IPA chuẩn Anh - Anh (UK) và Anh - Mỹ (US).
   - Nút nghe phát âm giọng đọc bản ngữ qua Web Speech API.
   - Điều chỉnh tốc độ phát âm (1.0x, 0.75x, 0.5x) phù hợp khi luyện nghe.

4. **Thanh Cột Lịch Sử Bên Trái (Hierarchical Timeline)**:
   - Tự động phân cấp: **Năm tra cứu (Year)** ➔ **Ngày tra cứu (Date)** ➔ **Danh sách từ đã tra trong ngày**.
   - Hiển thị thời gian tra (giờ:phút), từ loại tóm tắt, nghĩa nhanh.
   - Nút phát âm trực tiếp ngay trên thanh lịch sử.
   - Đánh dấu từ yêu thích (Favorite / Bookmark ⭐).
   - Tìm kiếm nhanh từ khóa trong lịch sử.
   - Thu gọn / Mở rộng thanh bên (Sidebar toggle) mượt mà.

5. **Chế Độ Luyện Flashcard**:
   - Lật thẻ 3D trực quan để ôn tập từ vựng đã tra.
   - Ghi nhận trạng thái "Đã nhớ" cùng hiệu ứng chúc mừng (confetti).

6. **Xuất Dữ Liệu & Lưu Trữ An Toàn**:
   - Dữ liệu lưu trữ tự động trên máy tính của bạn (`localStorage`), không lo mất khi tải lại trang.
   - Xuất lịch sử ra file CSV (tương thích Excel, Anki, Quizlet).

7. **Giao Diện Hiện Đại & Tối Ưu**:
   - Thiết kế Glassmorphism tinh tế, chế độ Sáng / Tối (Dark & Light Mode).
   - Phím tắt:
     - `Enter`: Tra từ
     - `Ctrl + K` hoặc `/`: Focus nhanh vào ô tìm kiếm
     - `Space`: Lật thẻ trong chế độ Flashcard
     - `Esc`: Đóng popup

---

## 🚀 Cách Sử Dụng

### Chạy trên máy tính
Gemini được gọi qua máy chủ cục bộ; không mở trực tiếp `index.html`.

1. Tạo API key tại [Google AI Studio](https://aistudio.google.com/).
2. Mở PowerShell và thiết lập key một lần cho tài khoản Windows của bạn:
   ```powershell
   [Environment]::SetEnvironmentVariable("GEMINI_API_KEY", "YOUR_NEW_KEY", "User")
   ```
3. Đóng/mở lại terminal rồi chạy **`start.bat`**. Máy chủ chỉ lắng nghe trên máy tính của bạn (`127.0.0.1`); key không được gửi xuống trình duyệt hay lưu trong repository.
4. Lần tra từ đầu tiên sẽ tự gọi Gemini 3.1 Flash-Lite ở chế độ nền. Có thể dùng **Cài đặt API → Kiểm tra kết nối** để xác nhận máy chủ.

### Dùng API key cá nhân để kiểm tra nhanh
1. Mở **Cài đặt API**, dán API key Gemini của bạn rồi chọn **Kiểm tra kết nối**.
2. Nếu kết nối thành công, bấm **Lưu cài đặt**. Key được lưu trong LocalStorage của trình duyệt này và các lần tra từ sẽ gọi Gemini trực tiếp.

Chế độ này phù hợp để thử nghiệm cá nhân. Key tồn tại trong trình duyệt và request đi từ trình duyệt tới Google, nên **không chia sẻ website với key của bạn đã lưu**. Người khác không tự dùng key của bạn; họ cần nhập key riêng. Thu hồi key ngay nếu bị lộ.

### Dùng AI an toàn khi chia sẻ website: Cloudflare Worker
Website vẫn có thể nằm trên Netlify; chỉ phần gọi Gemini chạy qua Worker để giữ API key ở server. Khi đã cấu hình Worker, để trống ô API key trong cài đặt để ứng dụng dùng Worker.

1. Cloudflare Dashboard → **Workers & Pages → Create → Create Worker**. Tạo Worker tên, ví dụ `vocab-gemini-api`.
2. Mở Worker → **Edit code**. Thay nội dung bằng toàn bộ file [`cloudflare/worker.mjs`](./cloudflare/worker.mjs), rồi **Deploy**.
3. Worker → **Settings → Variables and Secrets → Add variable**:
   - Tạo secret tên `GEMINI_API_KEY`, nhập API key mới.
   - Tạo variable tên `ALLOWED_ORIGINS`, giá trị là origin website chính xác, ví dụ `https://ten-site.netlify.app` (không thêm dấu `/` cuối). Với domain riêng, nhập nhiều origin phân tách bằng dấu phẩy.
   - **Không** nhập API key vào `ALLOWED_ORIGINS`, file code, hay chat.
4. Bấm **Deploy** lại để áp dụng secret/variable. URL thường có dạng `https://vocab-gemini-api.ten-tai-khoan.workers.dev`.
5. Trong file [`api-config.js`](./api-config.js), thay dòng endpoint bằng URL Worker thật:
   ```js
   window.VOCAB_GEMINI_API_URL = 'https://vocab-gemini-api.ten-tai-khoan.workers.dev/api/gemini';
   ```
6. Commit/push lên GitHub để Netlify tự deploy trang với endpoint mới. Deploy xong, để trống ô API key rồi mở website → **Cài đặt API → Kiểm tra kết nối**.

Worker giới hạn model, kiểm tra origin và định dạng từ/cụm từ. Giới hạn trong bộ nhớ của Worker chỉ là lớp giảm tải cơ bản; hãy bật Cloudflare rate limiting phù hợp và đặt quota/budget cho Gemini API để bảo vệ khỏi lạm dụng. Nếu UI báo lỗi, Worker trả nội dung lỗi Gemini để dễ phân biệt lỗi key, quota, model hay kết nối.

### Phương án khác: Netlify Function
Nếu muốn chỉ dùng Netlify, có thể cấu hình `GEMINI_API_KEY` trong **Site configuration → Environment variables**, chọn context **Production**, lưu rồi trigger deploy mới. Function hiện được gắn trực tiếp vào `/api/gemini` và dùng Node.js 20. Nếu vẫn gặp lỗi 502, ưu tiên dùng Cloudflare Worker ở trên và xem **Netlify → Functions → Logs** để biết nguyên nhân phía Netlify.

Nếu key đã từng được gửi trong chat hoặc commit, hãy thu hồi key đó và tạo key mới trước khi cấu hình. Khi Gemini không khả dụng, ứng dụng sẽ thử từ điển dự phòng.
