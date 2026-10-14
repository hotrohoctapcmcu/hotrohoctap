-- ===================================================================================
-- DỰ ÁN HỖ TRỢ QUẢN LÝ HỌC TẬP - SPRINT 1
-- 03_thu_tuc_sprint1.sql
-- TẬP HỢP TOÀN BỘ STORED PROCEDURES CHO 6 CHỨC NĂNG SPRINT 1
-- (CHỨC NĂNG 1, 2, 3, 4, 9, 18)
-- ===================================================================================

USE QL_HocTap;
GO
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

-- ===================================================================================
-- 1. STORED PROCEDURES: CHỨC NĂNG 18 - HỒ SƠ HỌC TẬP CÁ NHÂN
-- ===================================================================================

-- Lấy hồ sơ học tập chi tiết của sinh viên
CREATE OR ALTER PROCEDURE dbo.sp_Sprint1_GetStudentProfile
    @userId INT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @studentId INT;
    SELECT @studentId = student_id FROM dbo.Students WHERE user_id = @userId OR student_id = @userId;

    SELECT * 
    FROM dbo.vw_Sprint1_HoSoSinhVien
    WHERE student_id = @studentId;
END;
GO

-- Lưu / Cập nhật hồ sơ sinh viên
CREATE OR ALTER PROCEDURE dbo.sp_Sprint1_SaveStudentProfile
    @userId INT,
    @studentCode VARCHAR(20),
    @fullName NVARCHAR(100),
    @major NVARCHAR(100),
    @dob DATE = NULL,
    @enrollmentYear INT = NULL,
    @currentSemester VARCHAR(20) = NULL,
    @phone VARCHAR(15) = NULL,
    @avatarUrl NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        -- Cập nhật tên trong Users
        UPDATE dbo.Users 
        SET full_name = @fullName, updated_at = SYSDATETIME() 
        WHERE user_id = @userId;

        -- Upsert trong Students
        IF EXISTS (SELECT 1 FROM dbo.Students WHERE user_id = @userId)
        BEGIN
            UPDATE dbo.Students
            SET student_code = @studentCode,
                full_name = @fullName,
                major = @major,
                dob = ISNULL(@dob, dob),
                enrollment_year = ISNULL(@enrollmentYear, enrollment_year),
                current_semester = ISNULL(@currentSemester, current_semester),
                phone = ISNULL(@phone, phone),
                avatar_url = ISNULL(@avatarUrl, avatar_url),
                updated_at = SYSDATETIME()
            WHERE user_id = @userId;
        END
        ELSE
        BEGIN
            INSERT INTO dbo.Students (user_id, student_code, full_name, major, dob, enrollment_year, current_semester, phone, avatar_url)
            VALUES (@userId, @studentCode, @fullName, @major, @dob, @enrollmentYear, @currentSemester, @phone, @avatarUrl);
        END

        COMMIT TRANSACTION;
        EXEC dbo.sp_Sprint1_GetStudentProfile @userId;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- Lấy bảng điểm đầy đủ hoặc theo kỳ
CREATE OR ALTER PROCEDURE dbo.sp_Sprint1_GetBangDiem
    @userId INT,
    @semester VARCHAR(20) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @studentId INT;
    SELECT @studentId = student_id FROM dbo.Students WHERE user_id = @userId OR student_id = @userId;

    SELECT 
        g.grade_id,
        g.student_id,
        g.subject_id,
        sub.subject_code,
        sub.subject_name,
        g.semester,
        g.academic_year,
        g.attempt_number,
        g.credits,
        g.component_score,
        g.exam_score,
        g.final_score,
        g.letter_grade,
        g.total_points,
        g.is_passed,
        g.source
    FROM dbo.Grades g
    INNER JOIN dbo.Subjects sub ON g.subject_id = sub.subject_id
    WHERE g.student_id = @studentId
      AND (@semester IS NULL OR g.semester = @semester)
    ORDER BY g.academic_year DESC, g.semester DESC, sub.subject_name ASC;
END;
GO

-- Lấy danh sách các môn chưa đạt (F)
CREATE OR ALTER PROCEDURE dbo.sp_Sprint1_GetFailedSubjects
    @userId INT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @studentId INT;
    SELECT @studentId = student_id FROM dbo.Students WHERE user_id = @userId OR student_id = @userId;

    SELECT 
        g.grade_id,
        g.subject_id,
        sub.subject_code,
        sub.subject_name,
        g.credits,
        g.final_score,
        g.letter_grade,
        g.semester,
        g.academic_year,
        g.attempt_number
    FROM dbo.Grades g
    INNER JOIN dbo.Subjects sub ON g.subject_id = sub.subject_id
    WHERE g.student_id = @studentId 
      AND (g.is_passed = 0 OR g.letter_grade = 'F')
    ORDER BY g.academic_year DESC, g.semester DESC;
END;
GO

-- Lấy danh sách các môn đã đạt
CREATE OR ALTER PROCEDURE dbo.sp_Sprint1_GetPassedSubjects
    @userId INT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @studentId INT;
    SELECT @studentId = student_id FROM dbo.Students WHERE user_id = @userId OR student_id = @userId;

    SELECT 
        g.grade_id,
        g.subject_id,
        sub.subject_code,
        sub.subject_name,
        g.credits,
        g.final_score,
        g.letter_grade,
        g.semester,
        g.academic_year
    FROM dbo.Grades g
    INNER JOIN dbo.Subjects sub ON g.subject_id = sub.subject_id
    WHERE g.student_id = @studentId AND g.is_passed = 1
    ORDER BY g.academic_year DESC, g.semester DESC;
END;
GO

-- Lấy danh sách toàn bộ môn học và tiến độ của sinh viên
CREATE OR ALTER PROCEDURE dbo.sp_Sprint1_GetSubjectsList
    @userId INT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @studentId INT;
    SELECT @studentId = student_id FROM dbo.Students WHERE user_id = @userId OR student_id = @userId;

    SELECT 
        sub.subject_id,
        sub.subject_code,
        sub.subject_name,
        sub.credits,
        sub.department,
        ISNULL(ss.status, 'PLANNED') AS status,
        ss.semester,
        ss.academic_year
    FROM dbo.Subjects sub
    LEFT JOIN dbo.StudentSubjects ss ON sub.subject_id = ss.subject_id AND ss.student_id = @studentId
    WHERE sub.is_active = 1
    ORDER BY sub.subject_name ASC;
END;
GO

-- ===================================================================================
-- 2. STORED PROCEDURES: CHỨC NĂNG 1 - THỜI KHÓA BIỂU THÔNG MINH
-- ===================================================================================

-- Lấy toàn bộ thời khóa biểu
CREATE OR ALTER PROCEDURE dbo.sp_Sprint1_GetTKB
    @userId INT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @studentId INT;
    SELECT @studentId = student_id FROM dbo.Students WHERE user_id = @userId OR student_id = @userId;

    SELECT * 
    FROM dbo.vw_Sprint1_ThoiKhoaBieu
    WHERE student_id = @studentId
    ORDER BY day_of_week ASC, start_time ASC;
END;
GO

-- Lấy thời khóa biểu theo ngày cụ thể (YYYY-MM-DD)
CREATE OR ALTER PROCEDURE dbo.sp_Sprint1_GetTKBByDate
    @userId INT,
    @targetDate DATE
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @studentId INT;
    SELECT @studentId = student_id FROM dbo.Students WHERE user_id = @userId OR student_id = @userId;

    -- Tính thứ trong tuần của targetDate theo chuẩn SQL Server (Chủ Nhật = 1, Thứ Hai = 2...)
    -- Đổi sang quy ước dự án: 2..7 = Thứ 2..Thứ 7, 8 = Chủ Nhật
    DECLARE @dayOfWeek TINYINT = DATEPART(dw, @targetDate);
    IF @dayOfWeek = 1 SET @dayOfWeek = 8;

    SELECT * 
    FROM dbo.vw_Sprint1_ThoiKhoaBieu
    WHERE student_id = @studentId
      AND day_of_week = @dayOfWeek
      AND @targetDate BETWEEN start_date AND end_date
    ORDER BY start_time ASC;
END;
GO

-- Lấy thời khóa biểu theo tuần
CREATE OR ALTER PROCEDURE dbo.sp_Sprint1_GetTKBByWeek
    @userId INT,
    @startDate DATE,
    @endDate DATE
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @studentId INT;
    SELECT @studentId = student_id FROM dbo.Students WHERE user_id = @userId OR student_id = @userId;

    SELECT * 
    FROM dbo.vw_Sprint1_ThoiKhoaBieu
    WHERE student_id = @studentId
      AND start_date <= @endDate
      AND end_date >= @startDate
    ORDER BY day_of_week ASC, start_time ASC;
END;
GO

-- Lấy thời khóa biểu theo môn học
CREATE OR ALTER PROCEDURE dbo.sp_Sprint1_GetTKBBySubject
    @userId INT,
    @subjectId INT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @studentId INT;
    SELECT @studentId = student_id FROM dbo.Students WHERE user_id = @userId OR student_id = @userId;

    SELECT * 
    FROM dbo.vw_Sprint1_ThoiKhoaBieu
    WHERE student_id = @studentId AND subject_id = @subjectId
    ORDER BY day_of_week ASC, start_time ASC;
END;
GO

-- Thêm một tiết học vào TKB
CREATE OR ALTER PROCEDURE dbo.sp_Sprint1_SaveTimetable
    @userId INT,
    @subjectId INT,
    @className NVARCHAR(50),
    @room VARCHAR(50),
    @campus NVARCHAR(100),
    @dayOfWeek TINYINT,
    @startTime TIME(0),
    @endTime TIME(0),
    @startDate DATE,
    @endDate DATE,
    @lecturerName NVARCHAR(100) = NULL,
    @semester VARCHAR(20) = NULL,
    @academicYear VARCHAR(20) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @studentId INT;
    SELECT @studentId = student_id FROM dbo.Students WHERE user_id = @userId OR student_id = @userId;

    INSERT INTO dbo.Timetables (
        student_id, subject_id, class_name, room, campus,
        day_of_week, start_time, end_time, start_date, end_date,
        lecturer_name, semester, academic_year
    )
    VALUES (
        @studentId, @subjectId, @className, @room, @campus,
        @dayOfWeek, @startTime, @endTime, @startDate, @endDate,
        @lecturerName, @semester, @academicYear
    );

    SELECT SCOPE_IDENTITY() AS timetable_id;
END;
GO

-- ===================================================================================
-- 3. STORED PROCEDURES: CHỨC NĂNG 2 - AI XẾP LỊCH TỰ HỌC & CẢNH BÁO TRÙNG
-- ===================================================================================

-- Phát hiện trùng lịch giữa các lớp học chính khóa
CREATE OR ALTER PROCEDURE dbo.sp_Sprint1_CheckTimetableConflicts
    @userId INT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @studentId INT;
    SELECT @studentId = student_id FROM dbo.Students WHERE user_id = @userId OR student_id = @userId;

    SELECT * 
    FROM dbo.vw_Sprint1_CanhBaoTrungLich
    WHERE student_id = @studentId;
END;
GO

-- Kiểm tra xem một khoảng thời gian tự học dự kiến có bị trùng TKB hoặc lịch tự học khác không
CREATE OR ALTER PROCEDURE dbo.sp_Sprint1_CheckStudyConflict
    @userId INT,
    @studyDate DATE,
    @startTime TIME(0),
    @endTime TIME(0),
    @excludeScheduleId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @studentId INT;
    SELECT @studentId = student_id FROM dbo.Students WHERE user_id = @userId OR student_id = @userId;

    DECLARE @dayOfWeek TINYINT = DATEPART(dw, @studyDate);
    IF @dayOfWeek = 1 SET @dayOfWeek = 8;

    -- 1. Kiểm tra xung đột với Thời khóa biểu chính khóa
    SELECT 
        'TIMETABLE' AS conflict_type,
        t.timetable_id AS conflict_id,
        sub.subject_name AS title,
        t.room AS location,
        t.start_time,
        t.end_time
    FROM dbo.Timetables t
    INNER JOIN dbo.Subjects sub ON t.subject_id = sub.subject_id
    WHERE t.student_id = @studentId
      AND t.day_of_week = @dayOfWeek
      AND @studyDate BETWEEN t.start_date AND t.end_date
      AND t.start_time < @endTime 
      AND t.end_time > @startTime

    UNION ALL

    -- 2. Kiểm tra xung đột với Lịch tự học khác đã xếp
    SELECT 
        'STUDY_SCHEDULE' AS conflict_type,
        ss.schedule_id AS conflict_id,
        ss.title,
        N'Bàn tự học' AS location,
        ss.start_time,
        ss.end_time
    FROM dbo.StudySchedules ss
    WHERE ss.student_id = @studentId
      AND ss.study_date = @studyDate
      AND ss.status != 'CANCELLED'
      AND (@excludeScheduleId IS NULL OR ss.schedule_id != @excludeScheduleId)
      AND ss.start_time < @endTime 
      AND ss.end_time > @startTime;
END;
GO

-- Lưu một lịch tự học mới (có kiểm tra xung đột)
CREATE OR ALTER PROCEDURE dbo.sp_Sprint1_SaveStudySchedule
    @userId INT,
    @subjectId INT = NULL,
    @title NVARCHAR(200),
    @studyDate DATE,
    @startTime TIME(0),
    @endTime TIME(0),
    @isAiSuggested BIT = 0,
    @notes NVARCHAR(MAX) = NULL,
    @forceSave BIT = 0
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @studentId INT;
    SELECT @studentId = student_id FROM dbo.Students WHERE user_id = @userId OR student_id = @userId;

    -- Kiểm tra xung đột nếu không ép buộc (forceSave = 0)
    IF @forceSave = 0
    BEGIN
        DECLARE @dayOfWeek TINYINT = DATEPART(dw, @studyDate);
        IF @dayOfWeek = 1 SET @dayOfWeek = 8;

        IF EXISTS (
            SELECT 1 FROM dbo.Timetables t 
            WHERE t.student_id = @studentId 
              AND t.day_of_week = @dayOfWeek
              AND @studyDate BETWEEN t.start_date AND t.end_date
              AND t.start_time < @endTime AND t.end_time > @startTime
        ) OR EXISTS (
            SELECT 1 FROM dbo.StudySchedules ss
            WHERE ss.student_id = @studentId 
              AND ss.study_date = @studyDate 
              AND ss.status != 'CANCELLED'
              AND ss.start_time < @endTime AND ss.end_time > @startTime
        )
        BEGIN
            RAISERROR(N'Khung giờ tự học bị trùng với lịch học chính khóa hoặc lịch tự học khác.', 16, 1);
            RETURN;
        END
    END

    DECLARE @durationMinutes INT = DATEDIFF(minute, CAST(@startTime AS DATETIME), CAST(@endTime AS DATETIME));

    INSERT INTO dbo.StudySchedules (
        student_id, subject_id, title, study_date, start_time, end_time,
        duration_minutes, is_ai_suggested, status, notes
    )
    VALUES (
        @studentId, @subjectId, @title, @studyDate, @startTime, @endTime,
        @durationMinutes, @isAiSuggested, 'PLANNED', @notes
    );

    SELECT SCOPE_IDENTITY() AS schedule_id;
END;
GO

-- Lấy lịch tự học trong khoảng ngày
CREATE OR ALTER PROCEDURE dbo.sp_Sprint1_GetStudySchedules
    @userId INT,
    @startDate DATE = NULL,
    @endDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @studentId INT;
    SELECT @studentId = student_id FROM dbo.Students WHERE user_id = @userId OR student_id = @userId;

    SELECT 
        ss.schedule_id,
        ss.student_id,
        ss.subject_id,
        sub.subject_code,
        sub.subject_name,
        ss.title,
        ss.study_date,
        ss.start_time,
        ss.end_time,
        ss.duration_minutes,
        ss.is_ai_suggested,
        ss.status,
        ss.notes,
        ss.created_at
    FROM dbo.StudySchedules ss
    LEFT JOIN dbo.Subjects sub ON ss.subject_id = sub.subject_id
    WHERE ss.student_id = @studentId
      AND (@startDate IS NULL OR ss.study_date >= @startDate)
      AND (@endDate IS NULL OR ss.study_date <= @endDate)
    ORDER BY ss.study_date ASC, ss.start_time ASC;
END;
GO

-- ===================================================================================
-- 4. STORED PROCEDURES: CHỨC NĂNG 3 - QUẢN LÝ DEADLINE VÀ CHECKLIST
-- ===================================================================================

-- Lấy danh sách bài tập của sinh viên
CREATE OR ALTER PROCEDURE dbo.sp_Sprint1_GetAssignments
    @userId INT,
    @status VARCHAR(20) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @studentId INT;
    SELECT @studentId = student_id FROM dbo.Students WHERE user_id = @userId OR student_id = @userId;

    SELECT 
        a.assignment_id,
        a.student_id,
        a.subject_id,
        sub.subject_code,
        sub.subject_name,
        a.title,
        a.description,
        a.assigned_at,
        a.deadline,
        a.status,
        a.submission_url,
        a.source,
        a.external_id,
        a.completed_at,
        a.created_at
    FROM dbo.Assignments a
    INNER JOIN dbo.Subjects sub ON a.subject_id = sub.subject_id
    WHERE a.student_id = @studentId
      AND (@status IS NULL OR a.status = @status)
    ORDER BY a.deadline ASC;
END;
GO

-- Lấy các deadline sắp tới (trong vòng @daysAhead ngày)
CREATE OR ALTER PROCEDURE dbo.sp_Sprint1_GetUpcomingDeadlines
    @userId INT,
    @daysAhead INT = 3
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @studentId INT;
    SELECT @studentId = student_id FROM dbo.Students WHERE user_id = @userId OR student_id = @userId;

    SELECT 
        a.assignment_id,
        a.subject_id,
        sub.subject_code,
        sub.subject_name,
        a.title,
        a.deadline,
        a.status,
        DATEDIFF(hour, SYSDATETIME(), a.deadline) AS hours_remaining
    FROM dbo.Assignments a
    INNER JOIN dbo.Subjects sub ON a.subject_id = sub.subject_id
    WHERE a.student_id = @studentId
      AND a.status IN ('PENDING', 'IN_PROGRESS')
      AND a.deadline BETWEEN SYSDATETIME() AND DATEADD(day, @daysAhead, SYSDATETIME())
    ORDER BY a.deadline ASC;
END;
GO

-- Tạo mới một bài tập
CREATE OR ALTER PROCEDURE dbo.sp_Sprint1_CreateAssignment
    @userId INT,
    @subjectId INT,
    @title NVARCHAR(255),
    @description NVARCHAR(MAX) = NULL,
    @deadline DATETIME2,
    @source VARCHAR(20) = 'SYSTEM',
    @submissionUrl NVARCHAR(500) = NULL,
    @externalId VARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @studentId INT;
    SELECT @studentId = student_id FROM dbo.Students WHERE user_id = @userId OR student_id = @userId;

    INSERT INTO dbo.Assignments (
        student_id, subject_id, title, description,
        assigned_at, deadline, status, submission_url, source, external_id
    )
    VALUES (
        @studentId, @subjectId, @title, @description,
        SYSDATETIME(), @deadline, 'PENDING', @submissionUrl, @source, @externalId
    );

    SELECT SCOPE_IDENTITY() AS assignment_id;
END;
GO

-- Cập nhật trạng thái bài tập
CREATE OR ALTER PROCEDURE dbo.sp_Sprint1_UpdateAssignmentStatus
    @assignmentId INT,
    @status VARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.Assignments
    SET status = @status,
        completed_at = CASE WHEN @status = 'COMPLETED' THEN SYSDATETIME() ELSE NULL END,
        updated_at = SYSDATETIME()
    WHERE assignment_id = @assignmentId;

    SELECT * FROM dbo.Assignments WHERE assignment_id = @assignmentId;
END;
GO

-- Lấy danh sách Checklist cá nhân
CREATE OR ALTER PROCEDURE dbo.sp_Sprint1_GetChecklist
    @userId INT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @studentId INT;
    SELECT @studentId = student_id FROM dbo.Students WHERE user_id = @userId OR student_id = @userId;

    SELECT 
        c.checklist_id,
        c.student_id,
        c.subject_id,
        sub.subject_code,
        sub.subject_name,
        c.assignment_id,
        c.title,
        c.description,
        c.priority,
        c.deadline,
        c.is_completed,
        c.completed_at,
        c.created_at
    FROM dbo.Checklists c
    LEFT JOIN dbo.Subjects sub ON c.subject_id = sub.subject_id
    WHERE c.student_id = @studentId
    ORDER BY c.is_completed ASC, 
             CASE c.priority WHEN 'URGENT' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'MEDIUM' THEN 3 ELSE 4 END ASC,
             c.deadline ASC;
END;
GO

-- Thêm một mục Checklist
CREATE OR ALTER PROCEDURE dbo.sp_Sprint1_CreateChecklist
    @userId INT,
    @subjectId INT = NULL,
    @assignmentId INT = NULL,
    @title NVARCHAR(255),
    @description NVARCHAR(MAX) = NULL,
    @priority VARCHAR(10) = 'MEDIUM',
    @deadline DATETIME2 = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @studentId INT;
    SELECT @studentId = student_id FROM dbo.Students WHERE user_id = @userId OR student_id = @userId;

    INSERT INTO dbo.Checklists (student_id, subject_id, assignment_id, title, description, priority, deadline)
    VALUES (@studentId, @subjectId, @assignmentId, @title, @description, @priority, @deadline);

    SELECT SCOPE_IDENTITY() AS checklist_id;
END;
GO

-- Hoàn thành Checklist
CREATE OR ALTER PROCEDURE dbo.sp_Sprint1_CompleteChecklist
    @checklistId INT,
    @isCompleted BIT = 1
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.Checklists
    SET is_completed = @isCompleted,
        completed_at = CASE WHEN @isCompleted = 1 THEN SYSDATETIME() ELSE NULL END,
        updated_at = SYSDATETIME()
    WHERE checklist_id = @checklistId;

    SELECT * FROM dbo.Checklists WHERE checklist_id = @checklistId;
END;
GO

-- ===================================================================================
-- 5. STORED PROCEDURES: CHỨC NĂNG 4 - NHẮC NHỞ THÔNG MINH ĐA TẦNG
-- ===================================================================================

-- Lấy danh sách nhắc nhở
CREATE OR ALTER PROCEDURE dbo.sp_Sprint1_GetReminders
    @userId INT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @studentId INT;
    SELECT @studentId = student_id FROM dbo.Students WHERE user_id = @userId OR student_id = @userId;

    SELECT 
        r.reminder_id,
        r.student_id,
        r.target_type,
        r.target_id,
        r.title,
        r.message,
        r.tier,
        r.remind_time,
        r.is_sent,
        r.sent_at,
        r.channel,
        r.created_at
    FROM dbo.Reminders r
    WHERE r.student_id = @studentId
    ORDER BY r.remind_time ASC;
END;
GO

-- Tạo nhắc nhở đa tầng tự động (7 ngày, 3 ngày, 24 giờ, 1 giờ)
CREATE OR ALTER PROCEDURE dbo.sp_Sprint1_CreateMultiTierReminders
    @studentId INT,
    @targetType VARCHAR(20),
    @targetId INT,
    @title NVARCHAR(255),
    @deadline DATETIME2,
    @channel VARCHAR(20) = 'APP'
AS
BEGIN
    SET NOCOUNT ON;

    -- Tầng 7 ngày
    IF @deadline > DATEADD(day, 7, SYSDATETIME())
    BEGIN
        INSERT INTO dbo.Reminders (student_id, target_type, target_id, title, message, tier, remind_time, channel)
        VALUES (@studentId, @targetType, @targetId, @title, N'Còn 7 ngày nữa là đến hạn!', '7_DAYS', DATEADD(day, -7, @deadline), @channel);
    END

    -- Tầng 3 ngày
    IF @deadline > DATEADD(day, 3, SYSDATETIME())
    BEGIN
        INSERT INTO dbo.Reminders (student_id, target_type, target_id, title, message, tier, remind_time, channel)
        VALUES (@studentId, @targetType, @targetId, @title, N'Còn 3 ngày nữa là đến hạn, hãy tập trung hoàn thành!', '3_DAYS', DATEADD(day, -3, @deadline), @channel);
    END

    -- Tầng 24 giờ
    IF @deadline > DATEADD(hour, 24, SYSDATETIME())
    BEGIN
        INSERT INTO dbo.Reminders (student_id, target_type, target_id, title, message, tier, remind_time, channel)
        VALUES (@studentId, @targetType, @targetId, @title, N'Chỉ còn 24 giờ! Kiểm tra và nộp bài ngay!', '24_HOURS', DATEADD(hour, -24, @deadline), @channel);
    END

    -- Tầng 1 giờ
    IF @deadline > DATEADD(hour, 1, SYSDATETIME())
    BEGIN
        INSERT INTO dbo.Reminders (student_id, target_type, target_id, title, message, tier, remind_time, channel)
        VALUES (@studentId, @targetType, @targetId, @title, N'Hạn chót trong 1 giờ tới!', '1_HOUR', DATEADD(hour, -1, @deadline), @channel);
    END

    SELECT @@ROWCOUNT AS created_reminders_count;
END;
GO

-- Lấy danh sách các nhắc nhở đến hạn cần gửi thông báo ra hệ thống
CREATE OR ALTER PROCEDURE dbo.sp_Sprint1_GetDueReminders
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        r.reminder_id,
        r.student_id,
        s.student_code,
        s.full_name AS student_name,
        u.email,
        r.target_type,
        r.target_id,
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
END;
GO

-- Đánh dấu nhắc nhở đã được gửi
CREATE OR ALTER PROCEDURE dbo.sp_Sprint1_MarkReminderSent
    @reminderId INT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.Reminders
    SET is_sent = 1,
        sent_at = SYSDATETIME()
    WHERE reminder_id = @reminderId;

    SELECT 1 AS success;
END;
GO

-- ===================================================================================
-- 6. STORED PROCEDURES: CHỨC NĂNG 9 - QUẢN LÝ LỊCH THI VÀ KẾ HOẠCH ÔN THI
-- ===================================================================================

-- Lấy toàn bộ lịch thi
CREATE OR ALTER PROCEDURE dbo.sp_Sprint1_GetExams
    @userId INT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @studentId INT;
    SELECT @studentId = student_id FROM dbo.Students WHERE user_id = @userId OR student_id = @userId;

    SELECT * 
    FROM dbo.vw_Sprint1_LichThiDemNguoc
    WHERE student_id = @studentId
    ORDER BY exam_date ASC, exam_time ASC;
END;
GO

-- Lấy các kỳ thi sắp tới kèm ngày đếm ngược
CREATE OR ALTER PROCEDURE dbo.sp_Sprint1_GetUpcomingExams
    @userId INT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @studentId INT;
    SELECT @studentId = student_id FROM dbo.Students WHERE user_id = @userId OR student_id = @userId;

    SELECT * 
    FROM dbo.vw_Sprint1_LichThiDemNguoc
    WHERE student_id = @studentId 
      AND exam_status IN ('UPCOMING', 'TODAY')
    ORDER BY exam_date ASC, exam_time ASC;
END;
GO

-- Thêm kỳ thi mới
CREATE OR ALTER PROCEDURE dbo.sp_Sprint1_SaveExam
    @userId INT,
    @subjectId INT,
    @examName NVARCHAR(100),
    @examDate DATE,
    @examTime TIME(0),
    @durationMinutes INT = 90,
    @room VARCHAR(50),
    @campus NVARCHAR(100),
    @examFormat NVARCHAR(50) = N'Tự luận',
    @identificationNumber VARCHAR(30) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @studentId INT;
    SELECT @studentId = student_id FROM dbo.Students WHERE user_id = @userId OR student_id = @userId;

    INSERT INTO dbo.Exams (
        student_id, subject_id, exam_name, exam_date, exam_time,
        duration_minutes, room, campus, exam_format, identification_number
    )
    VALUES (
        @studentId, @subjectId, @examName, @examDate, @examTime,
        @durationMinutes, @room, @campus, @examFormat, @identificationNumber
    );

    SELECT SCOPE_IDENTITY() AS exam_id;
END;
GO

-- Lấy danh sách kế hoạch ôn thi
CREATE OR ALTER PROCEDURE dbo.sp_Sprint1_GetExamStudyPlans
    @userId INT,
    @examId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @studentId INT;
    SELECT @studentId = student_id FROM dbo.Students WHERE user_id = @userId OR student_id = @userId;

    SELECT 
        esp.plan_id,
        esp.student_id,
        esp.exam_id,
        e.exam_name,
        e.exam_date,
        esp.subject_id,
        sub.subject_code,
        sub.subject_name,
        esp.phase_title,
        esp.target_description,
        esp.start_date,
        esp.end_date,
        esp.priority,
        esp.status,
        esp.notes,
        esp.created_at
    FROM dbo.ExamStudyPlans esp
    INNER JOIN dbo.Exams e ON esp.exam_id = e.exam_id
    INNER JOIN dbo.Subjects sub ON esp.subject_id = sub.subject_id
    WHERE esp.student_id = @studentId
      AND (@examId IS NULL OR esp.exam_id = @examId)
    ORDER BY esp.start_date ASC;
END;
GO

-- Tạo mới kế hoạch ôn thi
CREATE OR ALTER PROCEDURE dbo.sp_Sprint1_CreateExamStudyPlan
    @userId INT,
    @examId INT,
    @phaseTitle NVARCHAR(150),
    @targetDescription NVARCHAR(MAX) = NULL,
    @startDate DATE,
    @endDate DATE,
    @priority VARCHAR(10) = 'HIGH',
    @notes NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @studentId INT;
    SELECT @studentId = student_id FROM dbo.Students WHERE user_id = @userId OR student_id = @userId;

    DECLARE @subjectId INT;
    SELECT @subjectId = subject_id FROM dbo.Exams WHERE exam_id = @examId;

    INSERT INTO dbo.ExamStudyPlans (
        student_id, exam_id, subject_id, phase_title,
        target_description, start_date, end_date, priority, status, notes
    )
    VALUES (
        @studentId, @examId, @subjectId, @phaseTitle,
        @targetDescription, @startDate, @endDate, @priority, 'PLANNED', @notes
    );

    SELECT SCOPE_IDENTITY() AS plan_id;
END;
GO

PRINT N'=================================================================';
PRINT N'ĐÃ TẠO TOÀN BỘ STORED PROCEDURES CHO SPRINT 1';
PRINT N'=================================================================';
