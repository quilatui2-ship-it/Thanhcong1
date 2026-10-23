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

### Cách 1: Chạy trực tiếp
Nhấp đúp chuột vào file **`start.bat`** (hoặc mở file **`index.html`** bằng trình duyệt Google Chrome, Edge).

### Cách 2: Cấu hình Gemini API Key
1. Nhấp vào nút **Cài đặt API** (⚙️) ở góc trên bên phải.
2. Dán API Key của bạn. Mã nguồn không chứa API Key mặc định.
3. Nhấp **"Kiểm tra kết nối"** để xác thực, sau đó bấm **"Lưu cài đặt"**.
*(Lưu ý: Nếu chưa cấu hình key, ứng dụng vẫn hoạt động tốt nhờ kho từ vựng học thuật và từ điển dự phòng tích hợp sẵn).*
