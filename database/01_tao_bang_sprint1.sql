-- ===================================================================================
-- DỰ ÁN HỖ TRỢ QUẢN LÝ HỌC TẬP - SPRINT 1
-- 01_tao_bang_sprint1.sql
-- TẬP HỢP TẤT CẢ CÁC BẢNG, KHÓA CHÍNH, KHÓA NGOẠI, INDEX & RÀNG BUỘC CHO SPRINT 1
-- PHỤC VỤ CÁC CHỨC NĂNG:
--   - Chức năng 18: Hồ sơ học tập cá nhân (Users, Students, Subjects, StudentSubjects, Grades)
--   - Chức năng 1:  Thời khóa biểu thông minh (Timetables)
--   - Chức năng 2:  AI xếp lịch tự học và cảnh báo trùng (StudySchedules, StudySessions)
--   - Chức năng 3:  Quản lý Deadline và Checklist (Assignments, Checklists)
--   - Chức năng 4:  Nhắc nhở thông minh đa tầng (Reminders)
--   - Chức năng 9:  Quản lý lịch thi và kế hoạch ôn thi (Exams, ExamStudyPlans)
-- ===================================================================================

USE QL_HocTap;
GO
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

-- ===================================================================================
-- 1. CHỨC NĂNG 18: HỒ SƠ HỌC TẬP CÁ NHÂN
-- ===================================================================================

-- Bảng Người dùng (Tài khoản)
IF OBJECT_ID('dbo.Users', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Users (
        user_id INT IDENTITY(1,1) NOT NULL,
        username VARCHAR(50) NOT NULL,
        password_hash NVARCHAR(255) NOT NULL,
        email NVARCHAR(100) NULL,
        full_name NVARCHAR(100) NOT NULL,
        role VARCHAR(20) NOT NULL CONSTRAINT DF_Users_Role DEFAULT 'student',
        is_active BIT NOT NULL CONSTRAINT DF_Users_IsActive DEFAULT 1,
        created_at DATETIME2 NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT SYSDATETIME(),
        updated_at DATETIME2 NOT NULL CONSTRAINT DF_Users_UpdatedAt DEFAULT SYSDATETIME(),
        CONSTRAINT PK_Users PRIMARY KEY CLUSTERED (user_id),
        CONSTRAINT UQ_Users_Username UNIQUE (username),
        CONSTRAINT CK_Users_Role CHECK (role IN ('student', 'lecturer', 'admin'))
    );
    CREATE NONCLUSTERED INDEX IX_Users_Username ON dbo.Users(username);
    CREATE NONCLUSTERED INDEX IX_Users_Email ON dbo.Users(email) WHERE email IS NOT NULL;
END
GO

-- Bảng Thông tin Sinh viên chi tiết
IF OBJECT_ID('dbo.Students', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Students (
        student_id INT IDENTITY(1,1) NOT NULL,
        user_id INT NOT NULL,
        student_code VARCHAR(20) NOT NULL,
        full_name NVARCHAR(100) NOT NULL,
        major NVARCHAR(100) NOT NULL,
        dob DATE NULL,
        enrollment_year INT NULL,
        current_semester VARCHAR(20) NULL,
        phone VARCHAR(15) NULL,
        avatar_url NVARCHAR(500) NULL,
        created_at DATETIME2 NOT NULL CONSTRAINT DF_Students_CreatedAt DEFAULT SYSDATETIME(),
        updated_at DATETIME2 NOT NULL CONSTRAINT DF_Students_UpdatedAt DEFAULT SYSDATETIME(),
        CONSTRAINT PK_Students PRIMARY KEY CLUSTERED (student_id),
        CONSTRAINT UQ_Students_UserId UNIQUE (user_id),
        CONSTRAINT UQ_Students_StudentCode UNIQUE (student_code),
        CONSTRAINT FK_Students_Users FOREIGN KEY (user_id) REFERENCES dbo.Users(user_id) ON DELETE CASCADE
    );
    CREATE NONCLUSTERED INDEX IX_Students_StudentCode ON dbo.Students(student_code);
    CREATE NONCLUSTERED INDEX IX_Students_UserId ON dbo.Students(user_id);
END
GO

-- Bảng Danh mục Môn học
IF OBJECT_ID('dbo.Subjects', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Subjects (
        subject_id INT IDENTITY(1,1) NOT NULL,
        subject_code VARCHAR(30) NOT NULL,
        subject_name NVARCHAR(150) NOT NULL,
        credits INT NOT NULL CONSTRAINT DF_Subjects_Credits DEFAULT 3,
        description NVARCHAR(MAX) NULL,
        department NVARCHAR(100) NULL,
        is_active BIT NOT NULL CONSTRAINT DF_Subjects_IsActive DEFAULT 1,
        created_at DATETIME2 NOT NULL CONSTRAINT DF_Subjects_CreatedAt DEFAULT SYSDATETIME(),
        CONSTRAINT PK_Subjects PRIMARY KEY CLUSTERED (subject_id),
        CONSTRAINT UQ_Subjects_SubjectCode UNIQUE (subject_code),
        CONSTRAINT CK_Subjects_Credits CHECK (credits > 0 AND credits <= 15)
    );
    CREATE NONCLUSTERED INDEX IX_Subjects_SubjectCode ON dbo.Subjects(subject_code);
    CREATE NONCLUSTERED INDEX IX_Subjects_SubjectName ON dbo.Subjects(subject_name);
END
GO

-- Bảng Liên kết Sinh viên - Môn học & Trạng thái (Đang học, Đã học, Kế hoạch)
IF OBJECT_ID('dbo.StudentSubjects', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.StudentSubjects (
        student_subject_id INT IDENTITY(1,1) NOT NULL,
        student_id INT NOT NULL,
        subject_id INT NOT NULL,
        status VARCHAR(20) NOT NULL,
        academic_year VARCHAR(20) NULL,
        semester VARCHAR(20) NULL,
        created_at DATETIME2 NOT NULL CONSTRAINT DF_StudentSubjects_CreatedAt DEFAULT SYSDATETIME(),
        updated_at DATETIME2 NOT NULL CONSTRAINT DF_StudentSubjects_UpdatedAt DEFAULT SYSDATETIME(),
        CONSTRAINT PK_StudentSubjects PRIMARY KEY CLUSTERED (student_subject_id),
        CONSTRAINT UQ_StudentSubjects_Unique UNIQUE (student_id, subject_id, semester, academic_year),
        CONSTRAINT FK_StudentSubjects_Students FOREIGN KEY (student_id) REFERENCES dbo.Students(student_id) ON DELETE CASCADE,
        CONSTRAINT FK_StudentSubjects_Subjects FOREIGN KEY (subject_id) REFERENCES dbo.Subjects(subject_id) ON DELETE CASCADE,
        CONSTRAINT CK_StudentSubjects_Status CHECK (status IN ('COMPLETED', 'STUDYING', 'PLANNED', 'DROPPED'))
    );
    CREATE NONCLUSTERED INDEX IX_StudentSubjects_Student ON dbo.StudentSubjects(student_id, status) INCLUDE (subject_id);
END
GO

-- Bảng Bảng điểm (Lưu điểm từng kỳ, điểm hệ 10, điểm chữ, đạt/trượt)
IF OBJECT_ID('dbo.Grades', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Grades (
        grade_id INT IDENTITY(1,1) NOT NULL,
        student_id INT NOT NULL,
        subject_id INT NOT NULL,
        semester VARCHAR(20) NOT NULL,
        academic_year VARCHAR(20) NOT NULL,
        attempt_number INT NOT NULL CONSTRAINT DF_Grades_Attempt DEFAULT 1,
        credits INT NOT NULL,
        component_score DECIMAL(4,2) NULL,
        exam_score DECIMAL(4,2) NULL,
        final_score DECIMAL(4,2) NOT NULL,
        letter_grade VARCHAR(5) NOT NULL,
        total_points DECIMAL(5,2) NULL,
        is_passed BIT NOT NULL,
        source VARCHAR(20) NOT NULL CONSTRAINT DF_Grades_Source DEFAULT 'IU',
        created_at DATETIME2 NOT NULL CONSTRAINT DF_Grades_CreatedAt DEFAULT SYSDATETIME(),
        updated_at DATETIME2 NOT NULL CONSTRAINT DF_Grades_UpdatedAt DEFAULT SYSDATETIME(),
        CONSTRAINT PK_Grades PRIMARY KEY CLUSTERED (grade_id),
        CONSTRAINT UQ_Grades_Record UNIQUE (student_id, subject_id, semester, academic_year, attempt_number),
        CONSTRAINT FK_Grades_Students FOREIGN KEY (student_id) REFERENCES dbo.Students(student_id) ON DELETE CASCADE,
        CONSTRAINT FK_Grades_Subjects FOREIGN KEY (subject_id) REFERENCES dbo.Subjects(subject_id) ON DELETE CASCADE,
        CONSTRAINT CK_Grades_FinalScore CHECK (final_score >= 0.0 AND final_score <= 10.0),
        CONSTRAINT CK_Grades_Letter CHECK (letter_grade IN ('A+', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F'))
    );
    CREATE NONCLUSTERED INDEX IX_Grades_Student_Semester ON dbo.Grades(student_id, semester);
    CREATE NONCLUSTERED INDEX IX_Grades_IsPassed ON dbo.Grades(student_id, is_passed);
END
GO

-- ===================================================================================
-- 2. CHỨC NĂNG 1: THỜI KHÓA BIỂU THÔNG MINH
-- ===================================================================================

IF OBJECT_ID('dbo.Timetables', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Timetables (
        timetable_id INT IDENTITY(1,1) NOT NULL,
        student_id INT NOT NULL,
        subject_id INT NOT NULL,
        class_name NVARCHAR(50) NOT NULL,
        room VARCHAR(50) NOT NULL,
        campus NVARCHAR(100) NOT NULL,
        day_of_week TINYINT NOT NULL,           -- 2: Thứ 2, ..., 7: Thứ 7, 8: Chủ nhật
        start_time TIME(0) NOT NULL,
        end_time TIME(0) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        lecturer_name NVARCHAR(100) NULL,
        semester VARCHAR(20) NULL,
        academic_year VARCHAR(20) NULL,
        source VARCHAR(20) NOT NULL CONSTRAINT DF_Timetables_Source DEFAULT 'IU',
        created_at DATETIME2 NOT NULL CONSTRAINT DF_Timetables_CreatedAt DEFAULT SYSDATETIME(),
        updated_at DATETIME2 NOT NULL CONSTRAINT DF_Timetables_UpdatedAt DEFAULT SYSDATETIME(),
        CONSTRAINT PK_Timetables PRIMARY KEY CLUSTERED (timetable_id),
        CONSTRAINT FK_Timetables_Students FOREIGN KEY (student_id) REFERENCES dbo.Students(student_id) ON DELETE CASCADE,
        CONSTRAINT FK_Timetables_Subjects FOREIGN KEY (subject_id) REFERENCES dbo.Subjects(subject_id) ON DELETE CASCADE,
        CONSTRAINT CK_Timetables_Day CHECK (day_of_week BETWEEN 2 AND 8),
        CONSTRAINT CK_Timetables_Time CHECK (end_time > start_time),
        CONSTRAINT CK_Timetables_Date CHECK (end_date >= start_date)
    );
    CREATE NONCLUSTERED INDEX IX_Timetables_Student_Day ON dbo.Timetables(student_id, day_of_week, start_time);
    CREATE NONCLUSTERED INDEX IX_Timetables_DateRange ON dbo.Timetables(start_date, end_date);
END
GO

-- ===================================================================================
-- 3. CHỨC NĂNG 2: AI XẾP LỊCH TỰ HỌC VÀ CẢNH BÁO TRÙNG
-- ===================================================================================

-- Bảng Lịch tự học / Kế hoạch tự học dự kiến
IF OBJECT_ID('dbo.StudySchedules', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.StudySchedules (
        schedule_id INT IDENTITY(1,1) NOT NULL,
        student_id INT NOT NULL,
        subject_id INT NULL,
        title NVARCHAR(200) NOT NULL,
        study_date DATE NOT NULL,
        start_time TIME(0) NOT NULL,
        end_time TIME(0) NOT NULL,
        duration_minutes INT NOT NULL CONSTRAINT DF_StudySchedules_Duration DEFAULT 60,
        is_ai_suggested BIT NOT NULL CONSTRAINT DF_StudySchedules_IsAI DEFAULT 0,
        status VARCHAR(20) NOT NULL CONSTRAINT DF_StudySchedules_Status DEFAULT 'PLANNED',
        notes NVARCHAR(MAX) NULL,
        created_at DATETIME2 NOT NULL CONSTRAINT DF_StudySchedules_CreatedAt DEFAULT SYSDATETIME(),
        updated_at DATETIME2 NOT NULL CONSTRAINT DF_StudySchedules_UpdatedAt DEFAULT SYSDATETIME(),
        CONSTRAINT PK_StudySchedules PRIMARY KEY CLUSTERED (schedule_id),
        CONSTRAINT FK_StudySchedules_Students FOREIGN KEY (student_id) REFERENCES dbo.Students(student_id) ON DELETE CASCADE,
        CONSTRAINT FK_StudySchedules_Subjects FOREIGN KEY (subject_id) REFERENCES dbo.Subjects(subject_id) ON DELETE SET NULL,
        CONSTRAINT CK_StudySchedules_Time CHECK (end_time > start_time),
        CONSTRAINT CK_StudySchedules_Status CHECK (status IN ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'))
    );
    CREATE NONCLUSTERED INDEX IX_StudySchedules_Student_Date ON dbo.StudySchedules(student_id, study_date, start_time);
END
GO

-- ===================================================================================
-- 4. CHỨC NĂNG 3: QUẢN LÝ DEADLINE VÀ CHECKLIST
-- ===================================================================================

-- Bảng Bài tập & Deadline (LMS, Giảng viên hoặc Hệ thống giao)
IF OBJECT_ID('dbo.Assignments', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Assignments (
        assignment_id INT IDENTITY(1,1) NOT NULL,
        student_id INT NOT NULL,
        subject_id INT NOT NULL,
        title NVARCHAR(255) NOT NULL,
        description NVARCHAR(MAX) NULL,
        assigned_at DATETIME2 NULL,
        deadline DATETIME2 NOT NULL,
        status VARCHAR(20) NOT NULL CONSTRAINT DF_Assignments_Status DEFAULT 'PENDING',
        submission_url NVARCHAR(500) NULL,
        source VARCHAR(20) NOT NULL CONSTRAINT DF_Assignments_Source DEFAULT 'LMS',
        external_id VARCHAR(100) NULL,
        completed_at DATETIME2 NULL,
        created_at DATETIME2 NOT NULL CONSTRAINT DF_Assignments_CreatedAt DEFAULT SYSDATETIME(),
        updated_at DATETIME2 NOT NULL CONSTRAINT DF_Assignments_UpdatedAt DEFAULT SYSDATETIME(),
        CONSTRAINT PK_Assignments PRIMARY KEY CLUSTERED (assignment_id),
        CONSTRAINT FK_Assignments_Students FOREIGN KEY (student_id) REFERENCES dbo.Students(student_id) ON DELETE CASCADE,
        CONSTRAINT FK_Assignments_Subjects FOREIGN KEY (subject_id) REFERENCES dbo.Subjects(subject_id) ON DELETE CASCADE,
        CONSTRAINT CK_Assignments_Status CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE')),
        CONSTRAINT CK_Assignments_Source CHECK (source IN ('LMS', 'TEACHER', 'SYSTEM', 'IU'))
    );
    CREATE NONCLUSTERED INDEX IX_Assignments_Student_Deadline ON dbo.Assignments(student_id, deadline) INCLUDE (status, title);
END
GO

-- Bảng Checklist (Danh sách công việc / To-do list cá nhân)
IF OBJECT_ID('dbo.Checklists', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Checklists (
        checklist_id INT IDENTITY(1,1) NOT NULL,
        student_id INT NOT NULL,
        subject_id INT NULL,
        assignment_id INT NULL,
        title NVARCHAR(255) NOT NULL,
        description NVARCHAR(MAX) NULL,
        priority VARCHAR(10) NOT NULL CONSTRAINT DF_Checklists_Priority DEFAULT 'MEDIUM',
        deadline DATETIME2 NULL,
        is_completed BIT NOT NULL CONSTRAINT DF_Checklists_IsCompleted DEFAULT 0,
        completed_at DATETIME2 NULL,
        created_at DATETIME2 NOT NULL CONSTRAINT DF_Checklists_CreatedAt DEFAULT SYSDATETIME(),
        updated_at DATETIME2 NOT NULL CONSTRAINT DF_Checklists_UpdatedAt DEFAULT SYSDATETIME(),
        CONSTRAINT PK_Checklists PRIMARY KEY CLUSTERED (checklist_id),
        CONSTRAINT FK_Checklists_Students FOREIGN KEY (student_id) REFERENCES dbo.Students(student_id) ON DELETE CASCADE,
        CONSTRAINT FK_Checklists_Subjects FOREIGN KEY (subject_id) REFERENCES dbo.Subjects(subject_id) ON DELETE NO ACTION,
        CONSTRAINT FK_Checklists_Assignments FOREIGN KEY (assignment_id) REFERENCES dbo.Assignments(assignment_id) ON DELETE NO ACTION,
        CONSTRAINT CK_Checklists_Priority CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT'))
    );
    CREATE NONCLUSTERED INDEX IX_Checklists_Student ON dbo.Checklists(student_id, is_completed, deadline);
END
GO

-- ===================================================================================
-- 5. CHỨC NĂNG 4: NHẮC NHỞ THÔNG MINH ĐA TẦNG
-- ===================================================================================

-- Bảng Nhắc nhở (Reminders - 7 ngày, 3 ngày, 24 giờ, 12 giờ, 1 giờ, quá hạn)
IF OBJECT_ID('dbo.Reminders', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Reminders (
        reminder_id INT IDENTITY(1,1) NOT NULL,
        student_id INT NOT NULL,
        target_type VARCHAR(20) NOT NULL,          -- 'ASSIGNMENT', 'EXAM', 'STUDY_PLAN', 'CUSTOM'
        target_id INT NOT NULL,
        title NVARCHAR(255) NOT NULL,
        message NVARCHAR(MAX) NULL,
        tier VARCHAR(20) NOT NULL,                 -- '7_DAYS', '3_DAYS', '24_HOURS', '12_HOURS', '1_HOUR', 'OVERDUE', 'CUSTOM'
        remind_time DATETIME2 NOT NULL,
        is_sent BIT NOT NULL CONSTRAINT DF_Reminders_IsSent DEFAULT 0,
        sent_at DATETIME2 NULL,
        channel VARCHAR(20) NOT NULL CONSTRAINT DF_Reminders_Channel DEFAULT 'APP',
        created_at DATETIME2 NOT NULL CONSTRAINT DF_Reminders_CreatedAt DEFAULT SYSDATETIME(),
        CONSTRAINT PK_Reminders PRIMARY KEY CLUSTERED (reminder_id),
        CONSTRAINT FK_Reminders_Students FOREIGN KEY (student_id) REFERENCES dbo.Students(student_id) ON DELETE CASCADE,
        CONSTRAINT CK_Reminders_TargetType CHECK (target_type IN ('ASSIGNMENT', 'EXAM', 'LESSON', 'STUDY_PLAN', 'CUSTOM')),
        CONSTRAINT CK_Reminders_Tier CHECK (tier IN ('7_DAYS', '3_DAYS', '24_HOURS', '12_HOURS', '1_HOUR', 'OVERDUE', 'CUSTOM')),
        CONSTRAINT CK_Reminders_Channel CHECK (channel IN ('APP', 'EMAIL', 'NOTIFICATION'))
    );
    CREATE NONCLUSTERED INDEX IX_Reminders_Pending ON dbo.Reminders(student_id, is_sent, remind_time);
END
GO

-- ===================================================================================
-- 6. CHỨC NĂNG 9: QUẢN LÝ LỊCH THI VÀ KẾ HOẠCH ÔN THI
-- ===================================================================================

-- Bảng Lịch thi
IF OBJECT_ID('dbo.Exams', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Exams (
        exam_id INT IDENTITY(1,1) NOT NULL,
        student_id INT NOT NULL,
        subject_id INT NOT NULL,
        exam_name NVARCHAR(100) NOT NULL CONSTRAINT DF_Exams_Name DEFAULT N'Thi kết thúc học phần',
        exam_date DATE NOT NULL,
        exam_time TIME(0) NOT NULL,
        duration_minutes INT NOT NULL CONSTRAINT DF_Exams_Duration DEFAULT 90,
        room VARCHAR(50) NOT NULL,
        campus NVARCHAR(100) NOT NULL,
        exam_format NVARCHAR(50) NULL CONSTRAINT DF_Exams_Format DEFAULT N'Tự luận',
        identification_number VARCHAR(30) NULL,
        source VARCHAR(20) NOT NULL CONSTRAINT DF_Exams_Source DEFAULT 'IU',
        created_at DATETIME2 NOT NULL CONSTRAINT DF_Exams_CreatedAt DEFAULT SYSDATETIME(),
        updated_at DATETIME2 NOT NULL CONSTRAINT DF_Exams_UpdatedAt DEFAULT SYSDATETIME(),
        CONSTRAINT PK_Exams PRIMARY KEY CLUSTERED (exam_id),
        CONSTRAINT UQ_Exams_Unique UNIQUE (student_id, subject_id, exam_date, exam_time),
        CONSTRAINT FK_Exams_Students FOREIGN KEY (student_id) REFERENCES dbo.Students(student_id) ON DELETE CASCADE,
        CONSTRAINT FK_Exams_Subjects FOREIGN KEY (subject_id) REFERENCES dbo.Subjects(subject_id) ON DELETE CASCADE
    );
    CREATE NONCLUSTERED INDEX IX_Exams_Student_Date ON dbo.Exams(student_id, exam_date, exam_time);
END
GO

-- Bảng Kế hoạch ôn thi (Các giai đoạn ôn luyện trước ngày thi)
IF OBJECT_ID('dbo.ExamStudyPlans', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ExamStudyPlans (
        plan_id INT IDENTITY(1,1) NOT NULL,
        student_id INT NOT NULL,
        exam_id INT NOT NULL,
        subject_id INT NOT NULL,
        phase_title NVARCHAR(150) NOT NULL,
        target_description NVARCHAR(MAX) NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        priority VARCHAR(10) NOT NULL CONSTRAINT DF_ExamStudyPlans_Priority DEFAULT 'HIGH',
        status VARCHAR(20) NOT NULL CONSTRAINT DF_ExamStudyPlans_Status DEFAULT 'PLANNED',
        notes NVARCHAR(MAX) NULL,
        created_at DATETIME2 NOT NULL CONSTRAINT DF_ExamStudyPlans_CreatedAt DEFAULT SYSDATETIME(),
        updated_at DATETIME2 NOT NULL CONSTRAINT DF_ExamStudyPlans_UpdatedAt DEFAULT SYSDATETIME(),
        CONSTRAINT PK_ExamStudyPlans PRIMARY KEY CLUSTERED (plan_id),
        CONSTRAINT FK_ExamStudyPlans_Students FOREIGN KEY (student_id) REFERENCES dbo.Students(student_id) ON DELETE CASCADE,
        CONSTRAINT FK_ExamStudyPlans_Exams FOREIGN KEY (exam_id) REFERENCES dbo.Exams(exam_id) ON DELETE NO ACTION,
        CONSTRAINT FK_ExamStudyPlans_Subjects FOREIGN KEY (subject_id) REFERENCES dbo.Subjects(subject_id) ON DELETE NO ACTION,
        CONSTRAINT CK_ExamStudyPlans_Dates CHECK (end_date >= start_date),
        CONSTRAINT CK_ExamStudyPlans_Priority CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
        CONSTRAINT CK_ExamStudyPlans_Status CHECK (status IN ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'))
    );
    CREATE NONCLUSTERED INDEX IX_ExamStudyPlans_Student_Exam ON dbo.ExamStudyPlans(student_id, exam_id);
END
GO

PRINT N'=================================================================';
PRINT N'ĐÃ TẠO TOÀN BỘ CẤU TRÚC BẢNG SPRINT 1 (CHỨC NĂNG 1, 2, 3, 4, 9, 18)';
PRINT N'=================================================================';
