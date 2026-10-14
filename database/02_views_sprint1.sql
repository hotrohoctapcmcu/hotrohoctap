-- ===================================================================================
-- DỰ ÁN HỖ TRỢ QUẢN LÝ HỌC TẬP - SPRINT 1
-- 02_views_sprint1.sql
-- TẬP HỢP CÁC VIEW TỔNG HỢP VÀ TỐI ƯU TRUY VẤN CHO SPRINT 1
-- PHỤC VỤ CÁC CHỨC NĂNG: 1, 2, 3, 4, 9, 18
-- ===================================================================================

USE QL_HocTap;
GO
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

-- ===================================================================================
-- 1. VIEW HỒ SƠ HỌC TẬP CÁ NHÂN TỔNG HỢP (CHỨC NĂNG 18)
-- ===================================================================================
CREATE OR ALTER VIEW dbo.vw_Sprint1_HoSoSinhVien
AS
SELECT 
    s.student_id,
    s.user_id,
    s.student_code,
    s.full_name,
    s.major,
    s.dob,
    s.enrollment_year,
    s.current_semester,
    s.phone,
    s.avatar_url,
    u.email,
    u.username,
    u.is_active,
    -- Tổng số tín chỉ tích lũy (các môn qua is_passed = 1)
    ISNULL(SUM(CASE WHEN g.is_passed = 1 THEN g.credits ELSE 0 END), 0) AS total_passed_credits,
    -- Điểm trung bình tích lũy hệ 10 (GPA 10) có trọng số tín chỉ
    CAST(
        CASE 
            WHEN SUM(CASE WHEN g.is_passed = 1 THEN g.credits ELSE 0 END) > 0 
            THEN SUM(CASE WHEN g.is_passed = 1 THEN g.final_score * g.credits ELSE 0 END) 
                 / SUM(CASE WHEN g.is_passed = 1 THEN g.credits ELSE 0 END)
            ELSE 0.0
        END AS DECIMAL(4,2)
    ) AS gpa_10_scale,
    -- Điểm trung bình GPA quy đổi hệ 4
    CAST(
        CASE 
            WHEN SUM(CASE WHEN g.is_passed = 1 THEN g.credits ELSE 0 END) > 0 
            THEN SUM(
                CASE 
                    WHEN g.letter_grade = 'A+' THEN 4.0 * g.credits
                    WHEN g.letter_grade = 'A'  THEN 3.8 * g.credits
                    WHEN g.letter_grade = 'B+' THEN 3.5 * g.credits
                    WHEN g.letter_grade = 'B'  THEN 3.0 * g.credits
                    WHEN g.letter_grade = 'C+' THEN 2.5 * g.credits
                    WHEN g.letter_grade = 'C'  THEN 2.0 * g.credits
                    WHEN g.letter_grade = 'D+' THEN 1.5 * g.credits
                    WHEN g.letter_grade = 'D'  THEN 1.0 * g.credits
                    ELSE 0.0
                END
            ) / SUM(CASE WHEN g.is_passed = 1 THEN g.credits ELSE 0 END)
            ELSE 0.0
        END AS DECIMAL(3,2)
    ) AS gpa_4_scale,
    -- Số môn chưa đạt (F) cần học lại
    COUNT(DISTINCT CASE WHEN g.letter_grade = 'F' AND g.is_passed = 0 THEN g.subject_id END) AS failed_subject_count,
    -- Số môn đã đạt
    COUNT(DISTINCT CASE WHEN g.is_passed = 1 THEN g.subject_id END) AS passed_subject_count,
    -- Số bài tập chưa hoàn thành
    (SELECT COUNT(1) FROM dbo.Assignments a WHERE a.student_id = s.student_id AND a.status IN ('PENDING', 'IN_PROGRESS', 'OVERDUE')) AS incomplete_assignments,
    -- Số kỳ thi sắp tới
    (SELECT COUNT(1) FROM dbo.Exams e WHERE e.student_id = s.student_id AND e.exam_date >= CAST(SYSDATETIME() AS DATE)) AS upcoming_exams_count
FROM dbo.Students s
INNER JOIN dbo.Users u ON s.user_id = u.user_id
LEFT JOIN dbo.Grades g ON s.student_id = g.student_id
GROUP BY 
    s.student_id, s.user_id, s.student_code, s.full_name, s.major, 
    s.dob, s.enrollment_year, s.current_semester, s.phone, s.avatar_url, 
    u.email, u.username, u.is_active;
GO

-- ===================================================================================
-- 2. VIEW THỜI KHÓA BIỂU THÔNG MINH (CHỨC NĂNG 1)
-- ===================================================================================
CREATE OR ALTER VIEW dbo.vw_Sprint1_ThoiKhoaBieu
AS
SELECT 
    t.timetable_id,
    t.student_id,
    s.student_code,
    s.full_name AS student_name,
    t.subject_id,
    sub.subject_code,
    sub.subject_name,
    sub.credits,
    t.class_name,
    t.room,
    t.campus,
    t.day_of_week,
    CASE t.day_of_week
        WHEN 2 THEN N'Thứ Hai'
        WHEN 3 THEN N'Thứ Ba'
        WHEN 4 THEN N'Thứ Tư'
        WHEN 5 THEN N'Thứ Năm'
        WHEN 6 THEN N'Thứ Sáu'
        WHEN 7 THEN N'Thứ Bảy'
        WHEN 8 THEN N'Chủ Nhật'
        ELSE N'Không xác định'
    END AS day_of_week_name,
    t.start_time,
    t.end_time,
    t.start_date,
    t.end_date,
    t.lecturer_name,
    t.semester,
    t.academic_year,
    t.source,
    -- Kiểm tra học phần hiện tại có đang trong thời gian giảng dạy không
    CASE 
        WHEN CAST(SYSDATETIME() AS DATE) BETWEEN t.start_date AND t.end_date THEN 1 
        ELSE 0 
    END AS is_currently_active
FROM dbo.Timetables t
INNER JOIN dbo.Students s ON t.student_id = s.student_id
INNER JOIN dbo.Subjects sub ON t.subject_id = sub.subject_id;
GO

-- ===================================================================================
-- 3. VIEW CẢNH BÁO TRÙNG LỊCH HỌC CHÍNH KHÓA (CHỨC NĂNG 2)
-- ===================================================================================
CREATE OR ALTER VIEW dbo.vw_Sprint1_CanhBaoTrungLich
AS
SELECT 
    t1.student_id,
    t1.timetable_id AS timetable_1_id,
    sub1.subject_code AS subject_1_code,
    sub1.subject_name AS subject_1_name,
    t1.class_name AS class_1_name,
    t1.day_of_week,
    CASE t1.day_of_week
        WHEN 2 THEN N'Thứ Hai'
        WHEN 3 THEN N'Thứ Ba'
        WHEN 4 THEN N'Thứ Tư'
        WHEN 5 THEN N'Thứ Năm'
        WHEN 6 THEN N'Thứ Sáu'
        WHEN 7 THEN N'Thứ Bảy'
        WHEN 8 THEN N'Chủ Nhật'
    END AS day_name,
    t1.start_time AS t1_start,
    t1.end_time AS t1_end,
    t1.room AS room_1,
    t2.timetable_id AS timetable_2_id,
    sub2.subject_code AS subject_2_code,
    sub2.subject_name AS subject_2_name,
    t2.class_name AS class_2_name,
    t2.start_time AS t2_start,
    t2.end_time AS t2_end,
    t2.room AS room_2
FROM dbo.Timetables t1
INNER JOIN dbo.Timetables t2 
    ON t1.student_id = t2.student_id 
   AND t1.timetable_id < t2.timetable_id
   AND t1.day_of_week = t2.day_of_week
   -- Giao nhau về thời gian học trong ngày
   AND t1.start_time < t2.end_time 
   AND t1.end_time > t2.start_time
   -- Giao nhau về khoảng ngày học của học phần
   AND t1.start_date <= t2.end_date 
   AND t1.end_date >= t2.start_date
INNER JOIN dbo.Subjects sub1 ON t1.subject_id = sub1.subject_id
INNER JOIN dbo.Subjects sub2 ON t2.subject_id = sub2.subject_id;
GO

-- ===================================================================================
-- 4. VIEW TỔNG HỢP DEADLINE VÀ CHECKLIST CẦN LÀM (CHỨC NĂNG 3)
-- ===================================================================================
CREATE OR ALTER VIEW dbo.vw_Sprint1_DeadlineVaChecklist
AS
-- 1. Bài tập chính thức
SELECT 
    'ASSIGNMENT' AS item_type,
    a.assignment_id AS item_id,
    a.student_id,
    a.subject_id,
    sub.subject_code,
    sub.subject_name,
    a.title,
    a.description,
    a.deadline,
    a.status,
    CASE 
        WHEN a.status = 'COMPLETED' THEN 1 
        ELSE 0 
    END AS is_completed,
    a.completed_at,
    CASE 
        WHEN a.deadline < SYSDATETIME() AND a.status != 'COMPLETED' THEN 'OVERDUE'
        WHEN DATEDIFF(hour, SYSDATETIME(), a.deadline) <= 24 AND a.status != 'COMPLETED' THEN 'URGENT'
        WHEN DATEDIFF(day, SYSDATETIME(), a.deadline) <= 3 AND a.status != 'COMPLETED' THEN 'UPCOMING'
        ELSE 'NORMAL'
    END AS urgency_level,
    DATEDIFF(minute, SYSDATETIME(), a.deadline) AS minutes_remaining
FROM dbo.Assignments a
INNER JOIN dbo.Subjects sub ON a.subject_id = sub.subject_id

UNION ALL

-- 2. Checklist công việc cá nhân
SELECT 
    'CHECKLIST' AS item_type,
    c.checklist_id AS item_id,
    c.student_id,
    c.subject_id,
    ISNULL(sub.subject_code, 'GENERAL') AS subject_code,
    ISNULL(sub.subject_name, N'Việc cá nhân') AS subject_name,
    c.title,
    c.description,
    c.deadline,
    CASE WHEN c.is_completed = 1 THEN 'COMPLETED' ELSE 'PENDING' END AS status,
    c.is_completed,
    c.completed_at,
    CASE 
        WHEN c.deadline IS NOT NULL AND c.deadline < SYSDATETIME() AND c.is_completed = 0 THEN 'OVERDUE'
        WHEN c.priority = 'URGENT' THEN 'URGENT'
        WHEN c.priority = 'HIGH' THEN 'UPCOMING'
        ELSE 'NORMAL'
    END AS urgency_level,
    CASE 
        WHEN c.deadline IS NOT NULL THEN DATEDIFF(minute, SYSDATETIME(), c.deadline) 
        ELSE NULL 
    END AS minutes_remaining
FROM dbo.Checklists c
LEFT JOIN dbo.Subjects sub ON c.subject_id = sub.subject_id;
GO

-- ===================================================================================
-- 5. VIEW LỊCH THI VÀ ĐẾM NGƯỢC NGÀY THI (CHỨC NĂNG 9)
-- ===================================================================================
CREATE OR ALTER VIEW dbo.vw_Sprint1_LichThiDemNguoc
AS
SELECT 
    e.exam_id,
    e.student_id,
    s.student_code,
    s.full_name AS student_name,
    e.subject_id,
    sub.subject_code,
    sub.subject_name,
    sub.credits,
    e.exam_name,
    e.exam_date,
    e.exam_time,
    e.duration_minutes,
    e.room,
    e.campus,
    e.exam_format,
    e.identification_number,
    e.source,
    -- Số ngày còn lại tính từ ngày hiện tại
    DATEDIFF(day, CAST(SYSDATETIME() AS DATE), e.exam_date) AS days_remaining,
    -- Trạng thái kỳ thi: UPCOMING (sắp tới), TODAY (hôm nay), PAST (đã qua)
    CASE 
        WHEN e.exam_date > CAST(SYSDATETIME() AS DATE) THEN 'UPCOMING'
        WHEN e.exam_date = CAST(SYSDATETIME() AS DATE) THEN 'TODAY'
        ELSE 'PAST'
    END AS exam_status,
    -- Đếm số giai đoạn kế hoạch ôn thi đã lập cho môn này
    (SELECT COUNT(1) FROM dbo.ExamStudyPlans esp WHERE esp.exam_id = e.exam_id) AS study_plans_count
FROM dbo.Exams e
INNER JOIN dbo.Students s ON e.student_id = s.student_id
INNER JOIN dbo.Subjects sub ON e.subject_id = sub.subject_id;
GO

PRINT N'=================================================================';
PRINT N'ĐÃ TẠO THÀNH CÔNG 5 VIEWS CHUYÊN DỤNG CHO SPRINT 1';
PRINT N'=================================================================';
