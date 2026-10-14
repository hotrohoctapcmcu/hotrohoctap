-- ===================================================================================
-- DỰ ÁN HỖ TRỢ QUẢN LÝ HỌC TẬP - SPRINT 1
-- 05_truy_van_sprint1.sql
-- BỘ TRUY VẤN MẪU & XỬ LÝ DỮ LIỆU THỰC TẾ CHO 6 CHỨC NĂNG SPRINT 1
-- ===================================================================================

USE QL_HocTap;
GO

-- ===================================================================================
-- 1. TRUY VẤN CHỨC NĂNG 18: HỒ SƠ HỌC TẬP CÁ NHÂN & GPA
-- ===================================================================================
-- Lấy hồ sơ học tập tổng hợp của sinh viên user_id = 1
SELECT 
    student_code,
    full_name,
    major,
    dob,
    current_semester,
    email,
    total_passed_credits,
    gpa_10_scale,
    gpa_4_scale,
    failed_subject_count,
    passed_subject_count,
    incomplete_assignments,
    upcoming_exams_count
FROM dbo.vw_Sprint1_HoSoSinhVien
WHERE user_id = 1;

-- Lấy bảng điểm chi tiết các kỳ kèm trạng thái Đạt/Học lại
SELECT 
    sub.subject_code,
    sub.subject_name,
    g.credits,
    g.semester,
    g.component_score,
    g.exam_score,
    g.final_score,
    g.letter_grade,
    CASE WHEN g.is_passed = 1 THEN N'Đạt' ELSE N'Học lại' END AS tinh_trang
FROM dbo.Grades g
INNER JOIN dbo.Subjects sub ON g.subject_id = sub.subject_id
INNER JOIN dbo.Students s ON g.student_id = s.student_id
WHERE s.user_id = 1
ORDER BY g.semester ASC, sub.subject_name ASC;

-- ===================================================================================
-- 2. TRUY VẤN CHỨC NĂNG 1: THỜI KHÓA BIỂU THÔNG MINH
-- ===================================================================================
-- Lấy toàn bộ TKB tuần hiện tại sắp xếp theo thứ và giờ học
SELECT 
    day_of_week_name,
    subject_code,
    subject_name,
    class_name,
    start_time,
    end_time,
    room,
    campus,
    lecturer_name
FROM dbo.vw_Sprint1_ThoiKhoaBieu
WHERE student_id = 1
ORDER BY day_of_week ASC, start_time ASC;

-- ===================================================================================
-- 3. TRUY VẤN CHỨC NĂNG 2: PHÁT HIỆN TRÙNG LỊCH & TÌM KHOẢNG TRỐNG TỰ HỌC
-- ===================================================================================
-- Phát hiện trùng lịch học chính khóa
SELECT 
    day_name,
    subject_1_name,
    class_1_name,
    t1_start,
    t1_end,
    room_1,
    subject_2_name,
    class_2_name,
    t2_start,
    t2_end,
    room_2
FROM dbo.vw_Sprint1_CanhBaoTrungLich
WHERE student_id = 1;

-- ===================================================================================
-- 4. TRUY VẤN CHỨC NĂNG 3: TỔNG HỢP DEADLINE VÀ CHECKLIST CẦN LÀM
-- ===================================================================================
-- Lấy danh sách việc cần làm chưa hoàn thành, xếp theo độ khẩn cấp
SELECT 
    item_type,
    subject_name,
    title,
    deadline,
    urgency_level,
    minutes_remaining
FROM dbo.vw_Sprint1_DeadlineVaChecklist
WHERE student_id = 1 
  AND is_completed = 0
ORDER BY 
    CASE urgency_level
        WHEN 'OVERDUE' THEN 1
        WHEN 'URGENT' THEN 2
        WHEN 'UPCOMING' THEN 3
        ELSE 4
    END,
    deadline ASC;

-- ===================================================================================
-- 5. TRUY VẤN CHỨC NĂNG 4: NHẮC NHỞ ĐẾN HẠN CẦN GỬI THÔNG BÁO
-- ===================================================================================
SELECT 
    r.reminder_id,
    s.student_code,
    s.full_name,
    u.email,
    r.title,
    r.message,
    r.tier,
    r.remind_time,
    r.channel
FROM dbo.Reminders r
INNER JOIN dbo.Students s ON r.student_id = s.student_id
INNER JOIN dbo.Users u ON s.user_id = u.user_id
WHERE r.is_sent = 0
  AND r.remind_time <= SYSDATETIME()
ORDER BY r.remind_time ASC;

-- ===================================================================================
-- 6. TRUY VẤN CHỨC NĂNG 9: LỊCH THI & ĐẾM NGƯỢC NGÀY THI
-- ===================================================================================
SELECT 
    subject_code,
    subject_name,
    exam_name,
    exam_date,
    exam_time,
    duration_minutes,
    room,
    campus,
    exam_format,
    days_remaining,
    exam_status
FROM dbo.vw_Sprint1_LichThiDemNguoc
WHERE student_id = 1
ORDER BY exam_date ASC, exam_time ASC;
