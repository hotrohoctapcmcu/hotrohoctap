# Bản đồ hàm API và Điều hướng thực tế — UniStudy CMC Sprint 1

Tài liệu ghi nhận chính xác toàn bộ danh mục hàm dữ liệu, tệp module sở hữu, caller, endpoint cấu hình, trạng thái kết nối và bản đồ điều hướng trong mã nguồn `sr_code/unistudy-fontend`.

---

## 1. Bản đồ hàm Frontend và API

| Hàm thực tế | File sở hữu | Caller | Endpoint / Method | Trạng thái | Phần hợp đồng còn thiếu từ Backend | Vị trí Debug |
| --- | --- | --- | --- | --- | --- | --- |
| `getSchedules()` | `src/features/schedule/schedule.service.js` | `schedule.js` | `GET /api/v1/schedules` | Chưa nối (Chờ backend) | Base URL, headers, cấu trúc phân trang / query khoảng ngày | `src/shared/services/api-client.js` |
| `checkScheduleConflicts(events)` | `src/features/schedule/schedule.service.js` | `schedule.events.js` | `POST /api/v1/schedules/conflicts/check` | Chưa nối (Chờ backend) | Schema payload sự kiện trường và kết quả response | `src/features/schedule/schedule.conflicts.js` |
| `getTasks()` | `src/features/tasks/tasks.service.js` | `tasks.js` | `GET /api/v1/tasks` | Chưa nối (Chờ backend) | Query params lọc theo môn/trạng thái | `src/features/tasks/tasks.events.js` |
| `createTask(data)` | `src/features/tasks/tasks.service.js` | `tasks.events.js` | `POST /api/v1/tasks` | Chưa nối (Chờ backend) | Schema body JSON và enum trạng thái/ưu tiên | `src/shared/utils/validation.js` |
| `updateTask(id, data)` | `src/features/tasks/tasks.service.js` | `tasks.events.js` | `PUT /api/v1/tasks/:id` | Chưa nối (Chờ backend) | Định dạng ID và response object | `src/app/state.js` |
| `deleteTask(id)` | `src/features/tasks/tasks.service.js` | `tasks.events.js` | `DELETE /api/v1/tasks/:id` | Chưa nối (Chờ backend) | HTTP status trả về khi xóa | `src/app/state.js` |
| `updateTaskStatus(id, status)` | `src/features/tasks/tasks.service.js` | `tasks.events.js` | `PATCH /api/v1/tasks/:id/status` | Chưa nối (Chờ backend) | Enum trạng thái chuẩn backend | `src/features/tasks/tasks.events.js` |
| `getChecklist(taskId)` | `src/features/tasks/tasks.service.js` | `tasks.events.js` | `GET /api/v1/tasks/:taskId/checklist` | Chưa nối (Chờ backend) | Cấu trúc dữ liệu item con | `src/features/tasks/tasks.view.js` |
| `addChecklistItem(taskId, item)` | `src/features/tasks/tasks.service.js` | `tasks.events.js` | `POST /api/v1/tasks/:taskId/checklist` | Chưa nối (Chờ backend) | Schema item con | `src/features/tasks/tasks.events.js` |
| `getNotifications()` | `src/features/notifications/notifications.service.js` | `notifications.js` | `GET /api/v1/notifications` | Chưa nối (Chờ backend) | Quy tắc phân trang và filter | `src/features/notifications/notifications.view.js` |
| `getUnreadNotificationCount()` | `src/features/notifications/notifications.service.js` | `topbar.js`, `sidebar.js` | `GET /api/v1/notifications/unread-count` | Chưa nối (Chờ backend) | Polling interval hoặc WebSocket / SSE | `src/app/state.js` |
| `markNotificationRead(id)` | `src/features/notifications/notifications.service.js` | `notifications.events.js` | `PATCH /api/v1/notifications/:id/read` | Chưa nối (Chờ backend) | Payload phản hồi | `src/features/notifications/notifications.events.js` |
| `getExams()` | `src/features/exams/exams.service.js` | `exams.js` | `GET /api/v1/exams` | Chưa nối (Chờ backend) | Schema danh sách kỳ thi chính thức trường | `src/features/exams/exams.view.js` |
| `getStudentProfile()` | `src/features/profile/profile.service.js` | `profile.js` | `GET /api/v1/student/profile` | Chưa nối (Chờ backend) | Schema đối tượng sinh viên | `src/features/profile/profile.view.js` |
| `updateStudentProfile(data)` | `src/features/profile/profile.service.js` | `profile.events.js` | `PUT /api/v1/student/profile` | Chưa nối (Chờ backend) | Quyền chỉnh sửa các trường | `src/features/profile/profile.events.js` |
| `getSyncSources()` | `src/features/sync/sync.service.js` | `sync.js` | `GET /api/v1/sync/sources` | Đã kiểm thử (Fallback config) | Danh mục nguồn động từ server | `src/shared/config/sync-sources.js` |
| `startSync(sources)` | `src/features/sync/sync.service.js` | `sync.events.js` | `POST /api/v1/sync` | Chưa nối (Chờ backend) | Cơ chế xác thực OAuth / Token trường | `src/features/sync/sync.auth-window.js` |
| `getSyncStatus(jobId)` | `src/features/sync/sync.service.js` | `sync.events.js` | `GET /api/v1/sync/status` | Chưa nối (Chờ backend) | Enum trạng thái job | `src/app/sync-state.js` |

---

## 2. Bản đồ Điều hướng Thực tế (Navigation Map)

Module sở hữu: `src/app/routes.js`

| Route ID | Tiêu đề hiển thị | Icon SVG | Vị trí | Hành vi chuyển hướng | Trạng thái triển khai |
| --- | --- | --- | --- | --- | --- |
| `landing` | Giới thiệu UniStudy | `i-spark` | Ngoài workspace | Màn hình giới thiệu, nút Trải nghiệm chuyển `state.screen = "workspace"` | Hoàn thành |
| `dashboard` | Tổng quan | `i-grid` | Sidebar, Tab Bar | Đổi route trong tab hiện tại | Hoàn thành |
| `schedule` | Lịch học | `i-calendar` | Sidebar, Tab Bar | Đổi route trong tab hiện tại; hỗ trợ nhận ngày từ CTA ôn thi | Hoàn thành |
| `tasks` | Công việc | `i-tasks` | Sidebar, Tab Bar | Đổi route trong tab hiện tại; bảng việc, checklist | Hoàn thành |
| `study-planner` | Kế hoạch học tập | `i-plan` | Sidebar, Tab Bar | Đổi route trong tab hiện tại; giao diện cấu hình AI | Hoàn thành (Sprint 1) |
| `exams` | Kế hoạch ôn thi | `i-exam` | Sidebar, Tab Bar | Đổi route trong tab hiện tại; lộ trình thi | Hoàn thành |
| `notifications` | Thông báo | `i-bell` | Sidebar, Toolbar Bell | Đổi route trong tab hiện tại; danh sách thông báo | Hoàn thành |
| `sync` | Đồng bộ dữ liệu | `i-refresh` | Footer Sidebar, CTA | Đổi route trong tab hiện tại; mở cửa sổ trường thật | Hoàn thành |
| `profile` | Hồ sơ cá nhân | `i-user` | Footer Sidebar | Đổi route trong tab hiện tại; cấu hình nguồn | Hoàn thành |
| `documents` | Tài liệu | `i-folder` | Sidebar, Tab Picker | Hiển thị màn hình "Chưa triển khai trong Sprint 1" | Sprint 2 |
| `ai-tutor` | Trợ lý AI | `i-spark` | Sidebar, Tab Picker | Hiển thị màn hình "Chưa triển khai trong Sprint 1" | Sprint 2 |
| `quiz` | Quiz AI | `i-quiz` | Sidebar, Tab Picker | Hiển thị màn hình "Chưa triển khai trong Sprint 1" | Sprint 2 |
| `flashcards` | Flashcard | `i-cards` | Sidebar, Tab Picker | Hiển thị màn hình "Chưa triển khai trong Sprint 1" | Sprint 2 |
| `progress` | Tiến độ | `i-chart` | Sidebar, Toolbar | Hiển thị màn hình "Chưa triển khai trong Sprint 1" | Sprint 2 |
| `pomodoro` | Pomodoro | `i-clock` | Sidebar, Tab Picker | Hiển thị màn hình "Chưa triển khai trong Sprint 1" | Sprint 2 |

---

## 3. Liên kết Ngoài Chính thức

- **Video giới thiệu:** `https://www.youtube.com/watch?v=lKpISrhA1z4`
- **Cổng IU CMC:** `https://iu.cmcu.edu.vn/congthongtin/Index.aspx`
- **Cổng EduX CMC:** `https://edux.cmcu.edu.vn/`
- **Cổng LMS CMC:** `https://lms.cmcu.edu.vn/`
- **Cổng eLearning CMC:** `https://elearning.cmcu.edu.vn/`
- **Demo tham chiếu giao diện:** `https://unistudy-cmc-prototype.kieuhuyentrang2007.chatgpt.site/`
