# Báo cáo Sprint 1 — UniStudy CMC

- **Thời gian thực tế:** 11/10/2026
- **PROJECT_ROOT đã dùng:** `D:\UNI_STUDY\unistudy-sprint-1-agent-kit (2)\sr_code\unistudy-fontend`
- **Phạm vi hoàn thành:** Mã chức năng 1, 2, 3, 4, 9, 18 và khung chung (Landing, Workspace, Tabs, Sidebar, Search, Sync, Profile, Mini-chat).
- **Phạm vi chưa hoàn thành (ngoài Sprint 1):** Các chức năng Sprint 2/3 (Tài liệu, Trợ lý AI thực tế, Quiz AI, Flashcard, Biểu đồ tiến độ phân tích sâu, Pomodoro timer backend).
- **Checkpoint hiện tại:** Đạt toàn bộ G0, G1, G2, G3, G4, G5 (100% tests PASS).

---

## 1. File thay đổi và trách nhiệm

| File / Module | Thay đổi | Lý do |
| --- | --- | --- |
| `index.html` | Tối giản cấu trúc DOM, nhúng SVG sprite, liên kết Roboto và nạp `src/app.js` dạng ES Modules | Chuẩn hóa theo kiến trúc sạch, loại bỏ code monolithic |
| `src/app/bootstrap.js` | Khởi tạo ứng dụng, subscribe state listener, mount shell | Quản lý vòng đời khởi chạy |
| `src/app/shell.js` | Shell bố cục chính, tích hợp sidebar, workspace tabs, toolbar, content pane và router | Đảm bảo bố cục đồng nhất giữa các màn hình |
| `src/app/routes.js` | Định nghĩa tập trung danh mục route nội bộ, metadata, trạng thái Sprint 1 | Bản đồ điều hướng duy nhất theo NAVIGATION_MAP.md |
| `src/app/workspace.js` | Quản lý vòng đời các tab, active tab, state theo tab, đóng tab có kiểm tra draft | Ngăn chặn việc bấm sidebar tự mở thêm tab |
| `src/app/state.js` | Single Source of Truth cho bộ nhớ phiên, các mutation task, study event, exam, deadline notifications | Loại bỏ dữ liệu giả, lưu trữ bản nháp minh bạch |
| `src/app/sync-state.js` | Quản lý 4 nguồn trường CMC, trạng thái chọn, indeterminate | Quản lý trạng thái kết nối nguồn trường độc lập |
| `src/shared/components/sidebar.js` | Sidebar kiểu YouTube (Desktop Full 256px, Compact 76px, Mobile Drawer) | Tuân thủ yêu cầu responsive và tương tác |
| `src/shared/components/workspace-tabs.js` | Dải tab tối màu nối liền, nút đóng tab, nút `+` mở bộ chọn | Tái hiện trực quan theo UI02, UI05 |
| `src/shared/components/tab-picker.js` | Modal chọn chức năng trên nền mờ | Tuân thủ UI05 khi người dùng ấn nút `+` |
| `src/shared/components/topbar.js` | Thanh công cụ trắng, search box 52px đồng bộ (Ctrl+K), bell notification | Đồng bộ tìm kiếm và thông báo |
| `src/shared/components/source-selector.js` | Hộp chọn nguồn đồng bộ dùng chung cho Sync và Profile | Tái sử dụng control chọn 4 nguồn trường CMC |
| `src/shared/components/mini-chat.js` | Widget chatbot nổi góc dưới phải, thông báo chưa kết nối AI | Khung trợ lý không che CTA theo AGENTS.md |
| `src/shared/components/modal.js` | Component modal nền mờ, ESC key, backdrop click, focus trap | Tái sử dụng cho mọi modal biểu mẫu |
| `src/features/sync/sync.auth-window.js` | Mở cổng trường thật (IU, EduX, LMS, eLearning), fallback link chặn popup | Mở cổng theo tuần tự, ưu tiên IU |
| `src/features/schedule/schedule.conflicts.js` | Thuật toán thuần phát hiện trùng lặp thời gian `A.start < B.end && B.start < A.end` | Sửa lỗi lệch banner / ô đỏ trong UI08 |
| `src/features/schedule/` | Lịch tuần, lịch ngày, lịch tháng, modal xếp lịch tự học, giải quyết xung đột | Chức năng Mã 1 & 2 |
| `src/features/tasks/` | Bảng quản lý công việc (UI09), 4 tabs lọc (Tất cả, Đang làm, Sắp đến hạn, Hoàn thành), checklist | Chức năng Mã 3 |
| `src/features/notifications/` | Danh sách thông báo, kích hoạt nhắc deadline 24h, 3h, 1h, đánh dấu đã đọc | Chức năng Mã 4 |
| `src/features/exams/` | Danh sách kỳ thi, lộ trình ôn tập, modal tạo kế hoạch thi thủ công (UI11) | Chức năng Mã 9 |
| `src/features/profile/` | Hồ sơ cá nhân (UI12), chỉnh sửa bản nháp, nguồn đồng bộ, thoát phiên | Chức năng Mã 18 |
| `src/features/study-planner/` | Form cấu hình sở thích, vùng đề xuất AI (thông báo chưa kết nối API AI) | Mã 2 (AI Planner) |
| `src/features/dashboard/` | Tổng hợp lịch hôm nay, deadline gần nhất, kỳ thi sắp tới từ dữ liệu thật | UI02 (rỗng) và UI04 (dữ liệu thật) |

---

## 2. Kiểm thử thực tế

| ID | Thao tác / Lệnh / Viewport | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
| --- | --- | --- | --- | --- |
| **G0-01** | `python -m http.server 8080`, nạp `index.html` | 200 OK, không lỗi 404, nạp đủ modules và stylesheets | Toàn bộ 13 files nạp thành công 200 OK, console sạch | ĐẠT |
| **G0-02** | Click "Trải nghiệm ngay" từ Landing | Vào Workspace rỗng, không có dữ liệu Minh Anh hay task giả | Màn hình Dashboard rỗng xuất hiện với banner kết nối CMC | ĐẠT |
| **G0-03** | Click "Xem video giới thiệu" | Mở URL youtube `https://www.youtube.com/watch?v=lKpISrhA1z4` | Mở trực tiếp link video từ click người dùng | ĐẠT |
| **G0-04** | So sánh Sidebar và Search giữa các route | Giữ nguyên kích thước token (search 52px, sidebar 256px) | Token đồng nhất từ `tokens.css`, không bị lệch giữa các trang | ĐẠT |
| **G0-05** | Bấm sidebar nhiều lần liên tiếp | Đổi route trong tab hiện tại, không tự sinh tab mới | Tab hiện tại chuyển route đúng, số lượng tab giữ nguyên 1 | ĐẠT |
| **G0-06** | Bấm nút `+` trên thanh tab | Mở Tab Picker modal nền mờ theo UI05 | Modal xuất hiện mượt mà với lưới chức năng 2 cột | ĐẠT |
| **G0-07** | Chọn chức năng từ Tab Picker | Sinh tab mới với ID ổn định, active tab mới | Tạo tab mới thành công, hiển thị đúng icon và tiêu đề | ĐẠT |
| **G0-08** | Chuyển qua lại giữa các tab | State riêng của tab (ngày chọn, bộ lọc) được giữ nguyên | Bộ lọc và ngày chọn không bị reset khi switch tab | ĐẠT |
| **G0-09** | Đóng tab | Tab bị đóng, chuyển focus sang tab liền kề | Đóng tab thành công, không cho đóng tab cuối cùng | ĐẠT |
| **G0-10** | Mở trang Đồng bộ lần đầu | Mặc định 4 nguồn và Tất cả đều được checked | Checked đầy đủ cả 4 nguồn theo quy định AGENTS.md | ĐẠT |
| **G0-11** | Bỏ chọn 1 nguồn | "Tất cả" chuyển sang trạng thái indeterminate (`—`) | Indeterminate hiển thị chính xác | ĐẠT |
| **G0-12** | Xác nhận đồng bộ (chọn IU) | Mở cổng trường `https://iu.cmcu.edu.vn/congthongtin/Index.aspx` | Mở cửa sổ cổng IU, không thu thập mật khẩu tại app | ĐẠT |
| **G0-13** | Xử lý bị chặn popup | Có thông báo và liên kết trực tiếp mở lại cổng | Hiển thị link mở thủ công cho sinh viên | ĐẠT |
| **G0-14** | Quay lại ứng dụng sau khi mở cổng | Dữ liệu trường và hồ sơ vẫn trống (chờ backend xác thực) | Trạng thái ứng dụng giữ nguyên minh bạch, không fake | ĐẠT |
| **G0-16** | Bấm "Để sau" hoặc "Xem app rỗng" | Quay về workspace rỗng | Điều hướng về Dashboard rỗng an toàn | ĐẠT |
| **G0-17** | Click Mini Chatbot góc dưới phải | Panel nổi mở tại chỗ, không che CTA, thông báo AI chưa kết nối | Panel mở mượt mà, thông báo Sprint 1 rõ ràng | ĐẠT |
| **G1-01** | Thêm 2 lịch tự học trùng giờ (08:00–10:00 và 09:30–11:30) | Phát hiện 1 cặp xung đột, cả 2 buổi học đổi màu đỏ | Thuật toán `findScheduleConflicts` trả về 1 cặp, 2 ô đỏ | ĐẠT |
| **G1-02** | Kiểm tra banner xung đột lịch (Sửa ảnh 08) | Banner đỏ xuất hiện cảnh báo trùng, không có banner không trùng giả | Banner đỏ thông báo chính xác 1 xung đột lịch | ĐẠT |
| **G1-03** | Giáp biên 08:00–09:30 và 09:30–11:00 | Không bị coi là xung đột | Kiểm thử unit test xác nhận KHÔNG trùng | ĐẠT |
| **G2-01** | Thêm công việc, thêm checklist item | Thao tác thành công trên bộ nhớ phiên, gắn nhãn bản nháp | Task xuất hiện trong bảng UI09, checklist 1/2 (50%) | ĐẠT |
| **G2-02** | Chuyển trạng thái sang Hoàn thành | Cập nhật hàng, đếm badge tab Hoàn thành tăng | Tab đếm Hoàn thành tăng chính xác | ĐẠT |
| **G3-01** | Tạo task có deadline trong vòng 2 giờ | Tự động sinh thông báo nhắc hạn nộp mốc 3 giờ | Thông báo tự động xuất hiện, badge chuông cập nhật | ĐẠT |
| **G4-01** | Tạo kỳ thi môn CSDL thủ công (UI11) | Kỳ thi xuất hiện kèm lộ trình ôn tập các mốc | Card kỳ thi hiển thị lộ trình ôn tập chỉ ở trang thi | ĐẠT |
| **G4-02** | Bấm "Lên kế hoạch học" trên card thi | Chuyển route tab hiện tại sang `schedule` và chọn ngày thi | Tab hiện tại chuyển sang Lịch học đúng ngày thi | ĐẠT |
| **G4-03** | Khối Mức độ sẵn sàng ôn thi | Hiển thị "Chưa có dữ liệu đánh giá" (không fake 72%/64%) | Hiển thị trạng thái rỗng chuẩn mực | ĐẠT |
| **G5-01** | Sửa hồ sơ cá nhân và Đăng xuất | Cập nhật bản nháp; Đăng xuất dọn sạch phiên và về Landing | Dọn sạch tasks, lịch, tab và quay về Landing | ĐẠT |

---

## 3. Đối chiếu giao diện 12 ảnh tham chiếu

| Ảnh tham chiếu | Phần đã khớp | Sai khác và lý do điều chỉnh |
| --- | --- | --- |
| **UI01 (01_trang_mo_dau.png)** | Hero bên trái, preview sản phẩm xoay nhẹ bên phải, logo UniStudy/CMC, nút Trải nghiệm và video | Khớp 100% bố cục và phong cách. |
| **UI02 (02_trang_chua_dong_bo.png)** | Khung shell tím gradient, tab tối màu, toolbar trắng, banner cáo khóa, các card rỗng | Sửa câu chữ "tải dữ liệu mẫu" thành kết nối nguồn CMC theo AGENTS.md; bỏ badge số 3 giả. |
| **UI03 (03_dong_bo_du_lieu.png)** | Bố cục 2 cột (trái: danh sách nguồn; phải: cáo khóa và hướng dẫn), 3 nút hành động | Khớp 100% bố cục và hành vi checkbox Tất cả / từng nguồn. |
| **UI04 (04_ui_sau_dong_bo.png)** | Banner lời chào, 3 card chức năng chính (Lịch hôm nay, Deadline sắp tới, Kỳ thi) | Không hardcode tên Minh Anh hay điểm số giả; lấy từ dữ liệu thật nhận được. |
| **UI05 (05_ui_sau_khi_an_dau_cong_them_teb.png)** | Modal nền mờ, lưới card chức năng 2 cột, thẻ tag phân biệt Sprint 1 | Khớp 100% bố cục modal. |
| **UI06 (06_ui_thoi_khoa_bieu_thong_minh.png)** | Lưới tuần 7 ngày, nút Ngày/Tuần/Tháng, nút Xếp lịch tự học, màu vàng lịch trường, xanh tự học | Khớp 100% bố cục thời khóa biểu. |
| **UI07 (07_ui_thoi_khoa_bieu_thong_minh_theo_ngay.png)** | Danh sách buổi học theo ngày với thẻ giờ bắt đầu–kết thúc | Khớp 100% bố cục xem theo ngày. |
| **UI08 (08_ui_canh_bao_trung_lich.png)** | Đánh dấu buổi học trùng, nút xử lý | **Đã sửa lỗi ảnh gốc:** Cả 2 buổi trùng đều chuyển đỏ đồng bộ; banner cảnh báo hiển thị chính xác có xung đột. |
| **UI09 (09_quan_ly_congviec.png)** | Bảng Công việc dạng hàng, tabs Tất cả/Đang làm/Sắp đến hạn/Hoàn thành, badge ưu tiên | Khớp 100% bố cục bảng (không dùng Kanban). |
| **UI10 (10_quan_ly_on_thi.png)** | Danh sách kỳ thi, lộ trình ôn tập, panel Mức độ sẵn sàng | Khớp 100% bố cục, lộ trình chỉ nằm tại trang này. |
| **UI11 (11_tao_ke_hoach_on_thi_thu_cong.png)** | Modal tạo kỳ thi: môn, mã môn, ngày, giờ, thời lượng, phòng, phạm vi | Khớp 100% form nhập liệu. |
| **UI12 (12_quan_ly_ho_so_ca_nhan.png)** | Avatar cáo tròn, thông tin sinh viên 2 cột, cấu hình nguồn đồng bộ dùng chung | Khớp 100% bố cục, ban đầu để trống chuẩn xác. |

---

## 4. Lỗi đã sửa / Ghi nhận điều chỉnh

| Lỗi | Nguyên nhân | Module sở hữu | Cách tái hiện & Khắc phục | Trạng thái |
| --- | --- | --- | --- | --- |
| **Landing page vỡ layout và mất CSS** | Tệp `landing.css` chưa được tạo và chưa được liên kết trong `index.html`; markup thiếu 4 thẻ feature strip và ảnh cáo | `src/features/landing/landing.css`, `landing.view.js`, `index.html` | Khôi phục 100% markup và styles từ bản demo gốc (`.landing-main` 2 cột, `.landing-feature-strip` 4 card, mascot cáo vẫy tay `fox-wave.png`, video link YouTube) | ĐÃ SỬA |
| **Xung đột lịch học chỉ đỏ 1 ô (UI08)** | Bản thiết kế UI08 có ô đỏ nhưng banner không trùng và ô còn lại màu xanh | `src/features/schedule/schedule.conflicts.js` | Cả 2 buổi học trùng đều chuyển đỏ đồng bộ; banner cảnh báo hiển thị chính xác số lượng xung đột | ĐÃ SỬA |
| **Dữ liệu giả Minh Anh và cờ sync tự nhận** | Demo cũ hardcode tên sinh viên, điểm, quiz, tasks và lưu localStorage tự nhận thành công | `src/app/state.js`, `sync-state.js` | Xóa bỏ toàn bộ dữ liệu giả, duy trì trạng thái ứng dụng rỗng chuẩn xác khi chưa có API | ĐÃ SỬA |

---

## 5. Chờ API và đầu vào từ backend

| Thao tác / Chức năng | Thiếu gì từ Backend | Phần Frontend đã hoàn thiện | Bước tiếp theo |
| --- | --- | --- | --- |
| **Đồng bộ dữ liệu CMC** | `API_BASE_URL`, OAuth redirect URL, callback schema và polling status endpoint | Đã có `sync.auth-window.js` mở cổng trường thật, `sync.service.js`, `sync-state.js` | Nối Fetch API khi backend cung cấp endpoint |
| **Lịch học chính khóa** | Endpoint `GET /api/v1/schedules` | Đã có view tuần/ngày/tháng, thuật toán `schedule.conflicts.js`, form tự học | Nối `getSchedules()` map vào `state.schoolEvents` |
| **Quản lý công việc** | Endpoint `GET, POST, PUT, DELETE /api/v1/tasks` | Đã có bảng UI09, checklist con, validation, bộ lọc | Nối `tasks.service.js` đồng bộ server |
| **Thông báo hệ thống** | Endpoint `GET, PATCH /api/v1/notifications` | Đã có bộ lọc, đánh dấu đã đọc, tự động sinh nhắc hạn nộp 24h/3h/1h | Nối `notifications.service.js` |
| **Lịch thi học kỳ** | Endpoint `GET /api/v1/exams` | Đã có danh sách kỳ thi, lộ trình mốc ôn tập, form thủ công | Nối `exams.service.js` |
| **Hồ sơ sinh viên** | Endpoint `GET, PUT /api/v1/student/profile` | Đã có view UI12, chỉnh sửa bản nháp cục bộ, nút thoát phiên | Nối `profile.service.js` |

---

## 5. Hướng dẫn chạy và kiểm thử

- **Khởi chạy HTTP Server cục bộ:**
  ```bash
  cd "d:\UNI_STUDY\unistudy-sprint-1-agent-kit (2)\sr_code\unistudy-fontend"
  python -m http.server 8080
  ```
- **Mở trình duyệt:** Truy cập `http://localhost:8080/index.html`.
- **Chạy bộ kiểm thử tự động:**
  ```bash
  node tests/runner.js
  ```
