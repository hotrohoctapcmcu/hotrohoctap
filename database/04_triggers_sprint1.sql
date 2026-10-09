-- ===================================================================================
-- DỰ ÁN HỖ TRỢ QUẢN LÝ HỌC TẬP - SPRINT 1
-- 04_triggers_sprint1.sql
-- TẬP HỢP TOÀN BỘ TRIGGERS NGHIỆP VỤ & TỰ ĐỘNG HÓA CHO SPRINT 1
-- (CHỨC NĂNG 1, 2, 3, 4, 9, 18)
-- ===================================================================================

USE QL_HocTap;
GO
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

-- ===================================================================================
-- 1. TRIGGER TỰ ĐỘNG SINH NHẮC NHỞ ĐA TẦNG KHI TẠO BÀI TẬP (CHỨC NĂNG 3 & 4)
-- ===================================================================================
CREATE OR ALTER TRIGGER dbo.trg_Sprint1_Assignments_AutoReminders
ON dbo.Assignments
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    IF TRIGGER_NESTLEVEL() > 1 RETURN;

    -- Tầng 3 ngày trước hạn (3_DAYS)
    INSERT INTO dbo.Reminders (student_id, target_type, target_id, title, message, tier, remind_time, channel)
    SELECT 
        i.student_id,
        'ASSIGNMENT',
        i.assignment_id,
        N'Nhắc nhở: Sắp đến hạn bài tập: ' + i.title,
        N'Bài tập sẽ đến hạn sau 3 ngày nữa. Hãy kiểm tra tiến độ ngay!',
        '3_DAYS',
        DATEADD(day, -3, i.deadline),
        'APP'
    FROM inserted i
    WHERE i.deadline > DATEADD(day, 3, SYSDATETIME());

    -- Tầng 24 giờ trước hạn (24_HOURS)
    INSERT INTO dbo.Reminders (student_id, target_type, target_id, title, message, tier, remind_time, channel)
    SELECT 
        i.student_id,
        'ASSIGNMENT',
        i.assignment_id,
        N'Gấp: 24h cuối nộp bài tập: ' + i.title,
        N'Chỉ còn 24 giờ nữa là hết hạn nộp bài. Vui lòng nộp bài sớm để tránh nghẽn mạng!',
        '24_HOURS',
        DATEADD(hour, -24, i.deadline),
        'APP'
    FROM inserted i
    WHERE i.deadline > DATEADD(hour, 24, SYSDATETIME());

    -- Tầng 1 giờ trước hạn (1_HOUR)
    INSERT INTO dbo.Reminders (student_id, target_type, target_id, title, message, tier, remind_time, channel)
    SELECT 
        i.student_id,
        'ASSIGNMENT',
        i.assignment_id,
        N'HẠN CHÓT: 1 giờ cuối nộp bài: ' + i.title,
        N'Thời hạn nộp bài sẽ đóng trong 1 giờ tới!',
        '1_HOUR',
        DATEADD(hour, -1, i.deadline),
        'APP'
    FROM inserted i
    WHERE i.deadline > DATEADD(hour, 1, SYSDATETIME());
END;
GO

-- ===================================================================================
-- 2. TRIGGER TỰ ĐỘNG SINH NHẮC NHỞ ĐA TẦNG KHI TẠO LỊCH THI (CHỨC NĂNG 4 & 9)
-- ===================================================================================
CREATE OR ALTER TRIGGER dbo.trg_Sprint1_Exams_AutoReminders
ON dbo.Exams
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    IF TRIGGER_NESTLEVEL() > 1 RETURN;

    -- Tầng 7 ngày trước thi (7_DAYS)
    INSERT INTO dbo.Reminders (student_id, target_type, target_id, title, message, tier, remind_time, channel)
    SELECT 
        i.student_id,
        'EXAM',
        i.exam_id,
        N'Nhắc thi: Còn 7 ngày nữa thi môn ' + sub.subject_name,
        N'Kỳ thi môn ' + sub.subject_name + N' sẽ diễn ra vào ngày ' + CONVERT(NVARCHAR(10), i.exam_date, 103) + N'. Hãy bắt đầu giai đoạn ôn tổng kết!',
        '7_DAYS',
        DATEADD(day, -7, CAST(i.exam_date AS DATETIME) + CAST(i.exam_time AS DATETIME)),
        'APP'
    FROM inserted i
    INNER JOIN dbo.Subjects sub ON i.subject_id = sub.subject_id
    WHERE CAST(i.exam_date AS DATETIME) + CAST(i.exam_time AS DATETIME) > DATEADD(day, 7, SYSDATETIME());

    -- Tầng 3 ngày trước thi (3_DAYS)
    INSERT INTO dbo.Reminders (student_id, target_type, target_id, title, message, tier, remind_time, channel)
    SELECT 
        i.student_id,
        'EXAM',
        i.exam_id,
        N'Cảnh báo thi: Còn 3 ngày nữa thi môn ' + sub.subject_name,
        N'Địa điểm: Phòng ' + i.room + N' (' + i.campus + N'). Chuẩn bị thẻ sinh viên và dụng cụ thi!',
        '3_DAYS',
        DATEADD(day, -3, CAST(i.exam_date AS DATETIME) + CAST(i.exam_time AS DATETIME)),
        'APP'
    FROM inserted i
    INNER JOIN dbo.Subjects sub ON i.subject_id = sub.subject_id
    WHERE CAST(i.exam_date AS DATETIME) + CAST(i.exam_time AS DATETIME) > DATEADD(day, 3, SYSDATETIME());

    -- Tầng 24 giờ trước thi (24_HOURS)
    INSERT INTO dbo.Reminders (student_id, target_type, target_id, title, message, tier, remind_time, channel)
    SELECT 
        i.student_id,
        'EXAM',
        i.exam_id,
        N'KHẨN: Ngày mai thi môn ' + sub.subject_name,
        N'Giờ thi: ' + CONVERT(VARCHAR(5), i.exam_time, 108) + N', Phòng ' + i.room + N'. Ngủ sớm giữ sức khỏe!',
        '24_HOURS',
        DATEADD(hour, -24, CAST(i.exam_date AS DATETIME) + CAST(i.exam_time AS DATETIME)),
        'APP'
    FROM inserted i
    INNER JOIN dbo.Subjects sub ON i.subject_id = sub.subject_id
    WHERE CAST(i.exam_date AS DATETIME) + CAST(i.exam_time AS DATETIME) > DATEADD(hour, 24, SYSDATETIME());
END;
GO

-- ===================================================================================
-- 3. TRIGGER DUY TRÌ TRẠNG THÁI VÀ THỜI GIAN HOÀN THÀNH ASSIGNMENTS (CHỨC NĂNG 3)
-- ===================================================================================
CREATE OR ALTER TRIGGER dbo.trg_Sprint1_Assignments_AutoStatus
ON dbo.Assignments
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF TRIGGER_NESTLEVEL() > 1 RETURN;

    -- Tự động chuyển sang OVERDUE nếu quá deadline mà chưa xong
    UPDATE a
    SET a.status = 'OVERDUE',
        a.updated_at = SYSDATETIME()
    FROM dbo.Assignments a
    INNER JOIN inserted i ON a.assignment_id = i.assignment_id
    WHERE a.status IN ('PENDING', 'IN_PROGRESS')
      AND a.deadline < SYSDATETIME();

    -- Tự động ghi nhận completed_at khi trạng thái là COMPLETED
    UPDATE a
    SET a.completed_at = SYSDATETIME(),
        a.updated_at = SYSDATETIME()
    FROM dbo.Assignments a
    INNER JOIN inserted i ON a.assignment_id = i.assignment_id
    WHERE a.status = 'COMPLETED' AND a.completed_at IS NULL;

    -- Hủy completed_at nếu chuyển từ COMPLETED về trạng thái khác
    UPDATE a
    SET a.completed_at = NULL,
        a.updated_at = SYSDATETIME()
    FROM dbo.Assignments a
    INNER JOIN inserted i ON a.assignment_id = i.assignment_id
    WHERE a.status != 'COMPLETED' AND a.completed_at IS NOT NULL;
END;
GO

-- ===================================================================================
-- 4. TRIGGER ĐỒNG BỘ ĐIỂM SỐ SANG TRẠNG THÁI MÔN HỌC (CHỨC NĂNG 18)
-- ===================================================================================
CREATE OR ALTER TRIGGER dbo.trg_Sprint1_Grades_SyncStudentSubjects
ON dbo.Grades
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF TRIGGER_NESTLEVEL() > 1 RETURN;

    -- Cập nhật môn đã hoàn thành (is_passed = 1) trong StudentSubjects
    UPDATE ss
    SET ss.status = 'COMPLETED',
        ss.updated_at = SYSDATETIME()
    FROM dbo.StudentSubjects ss
    INNER JOIN inserted i ON ss.student_id = i.student_id AND ss.subject_id = i.subject_id
    WHERE i.is_passed = 1;

    -- Nếu chưa có liên kết môn học thì tự động thêm mới
    INSERT INTO dbo.StudentSubjects (student_id, subject_id, status, academic_year, semester)
    SELECT DISTINCT i.student_id, i.subject_id, 
           CASE WHEN i.is_passed = 1 THEN 'COMPLETED' ELSE 'STUDYING' END,
           i.academic_year, i.semester
    FROM inserted i
    WHERE NOT EXISTS (
        SELECT 1 FROM dbo.StudentSubjects ss 
        WHERE ss.student_id = i.student_id AND ss.subject_id = i.subject_id
    );
END;
GO

-- ===================================================================================
-- 5. TRIGGER TỰ ĐỘNG GHI NHẬN HOÀN THÀNH CHECKLIST (CHỨC NĂNG 3)
-- ===================================================================================
CREATE OR ALTER TRIGGER dbo.trg_Sprint1_Checklists_AutoComplete
ON dbo.Checklists
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF TRIGGER_NESTLEVEL() > 1 RETURN;

    -- Ghi nhận thời điểm hoàn thành
    UPDATE c
    SET c.completed_at = SYSDATETIME(),
        c.updated_at = SYSDATETIME()
    FROM dbo.Checklists c
    INNER JOIN inserted i ON c.checklist_id = i.checklist_id
    WHERE c.is_completed = 1 AND c.completed_at IS NULL;

    -- Xóa thời điểm hoàn thành nếu uncheck
    UPDATE c
    SET c.completed_at = NULL,
        c.updated_at = SYSDATETIME()
    FROM dbo.Checklists c
    INNER JOIN inserted i ON c.checklist_id = i.checklist_id
    WHERE c.is_completed = 0 AND c.completed_at IS NOT NULL;
END;
GO

PRINT N'=================================================================';
PRINT N'ĐÃ TẠO TOÀN BỘ TRIGGERS NGHIỆP VỤ CHO SPRINT 1 THÀNH CÔNG';
PRINT N'=================================================================';
