/**
 * database/functions/sync.js
<<<<<<< HEAD
 * ===================================================================================
 * MODULE ĐỒNG BỘ DỮ LIỆU TỪ CRAWLER IU VÀO DATABASE
 * ===================================================================================
 * Nhận payload JSON từ crawler IU (bảng điểm, thời khóa biểu, lịch thi, sinh viên)
 * và lưu trữ / cập nhật vào các bảng tương ứng.
 * ===================================================================================
 */

const { executeQuery, executeProcedure } = require('../connection/db');

/**
 * Lưu toàn bộ dữ liệu cào được từ cổng IU vào cơ sở dữ liệu
 * @param {number} userId - ID người dùng
 * @param {Object} dataIU - Dữ liệu JSON chuẩn từ crawler IU
 * @returns {Promise<Object>} Kết quả đồng bộ
 */
async function saveIUData(userId, dataIU) {
    if (!userId) throw new Error('userId là bắt buộc');
    if (!dataIU) throw new Error('dataIU là bắt buộc');

    const result = {
        student: false,
        gradesCount: 0,
        timetableCount: 0,
        examsCount: 0,
        subjectsCount: 0
    };

    try {
        // 1. Đồng bộ thông tin sinh viên
        if (dataIU.MSV || dataIU.ten_nganh_hoc) {
            await executeProcedure('dbo.sp_Sprint1_SaveStudentProfile', {
                userId: parseInt(userId, 10),
                studentCode: dataIU.MSV || 'CMC123456',
                fullName: dataIU.ho_ten || 'Sinh viên CMC',
                major: dataIU.ten_nganh_hoc || 'Công nghệ thông tin',
                dob: dataIU.ngay_thang_nam_sinh ? convertDate(dataIU.ngay_thang_nam_sinh) : null,
                enrollmentYear: 2023,
                currentSemester: 'Học kỳ 1 - 2026'
            });
            result.student = true;
        }

        // 2. Đồng bộ danh sách môn học & bảng điểm
        if (dataIU.bang_diem) {
            for (const [kyKey, monList] of Object.entries(dataIU.bang_diem)) {
                if (typeof monList === 'object' && monList !== null) {
                    for (const [tenMon, chiTiet] of Object.entries(monList)) {
                        const cleanName = tenMon.replace(/_/g, ' ');
                        const credits = chiTiet.so_tin_chi || 3;
                        const finalScore = chiTiet.diem_tong_ket || 0;
                        const letter = chiTiet.diem_chu || 'B';
                        const isPassed = chiTiet.trang_thai === 'dat' ? 1 : 0;

                        // Tìm hoặc tạo subject
                        let subRows = await executeQuery('SELECT subject_id FROM dbo.Subjects WHERE subject_name = @name', { name: cleanName });
                        let subjectId;
                        if (subRows.length > 0) {
                            subjectId = subRows[0].subject_id;
                        } else {
                            const newSub = await executeQuery(
                                'INSERT INTO dbo.Subjects (subject_code, subject_name, credits) VALUES (@code, @name, @credits); SELECT SCOPE_IDENTITY() AS id;',
                                { code: 'SUB_' + Math.abs(hashCode(cleanName)), name: cleanName, credits }
                            );
                            subjectId = newSub[0].id;
                            result.subjectsCount++;
                        }

                        // Upsert điểm
                        await executeQuery(`
                            IF EXISTS (SELECT 1 FROM dbo.Grades WHERE student_id = (SELECT student_id FROM dbo.Students WHERE user_id = @userId) AND subject_id = @subjectId AND semester = @semester)
                                UPDATE dbo.Grades SET final_score = @finalScore, letter_grade = @letter, is_passed = @isPassed WHERE student_id = (SELECT student_id FROM dbo.Students WHERE user_id = @userId) AND subject_id = @subjectId AND semester = @semester;
                            ELSE
                                INSERT INTO dbo.Grades (student_id, subject_id, semester, credits, final_score, letter_grade, is_passed)
                                VALUES ((SELECT student_id FROM dbo.Students WHERE user_id = @userId), @subjectId, @semester, @credits, @finalScore, @letter, @isPassed);
                        `, { userId, subjectId, semester: kyKey, credits, finalScore, letter, isPassed });

                        result.gradesCount++;
=======
 * Quản lý đồng bộ dữ liệu từ các module Crawler (IU, Edux, eLearning, LMS)
 * Đảm bảo cơ chế UPSERT chống trùng lặp dữ liệu và ghi nhận SyncLog
 */

const { getPool, executeProcedure, executeQuery, sql } = require('../connection/db');

/**
 * Đồng bộ toàn bộ dữ liệu IU (Hồ sơ sinh viên, Danh sách môn, Bảng điểm, TKB, Lịch thi)
 * @param {number} userId - ID người dùng
 * @param {Object} data - Dữ liệu trả về từ getInfo() hoặc crawler IU
 * @returns {Promise<Object>} Thống kê số bản ghi thêm mới và cập nhật
 */
async function saveIUData(userId, data) {
    if (!userId) throw new Error('userId là bắt buộc');
    if (!data) throw new Error('Dữ liệu IU là bắt buộc');

    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    let insertedCount = 0;
    let updatedCount = 0;
    let studentId = null;

    try {
        // 1. Hồ sơ sinh viên
        const msv = data.MSV || data.student_code || 'CMC123456';
        const major = data.ten_nganh_hoc || data.major || 'Công nghệ thông tin';
        let dob = null;
        if (data.ngay_thang_nam_sinh) {
            // Chuyển định dạng DD/MM/YYYY sang YYYY-MM-DD nếu cần
            const parts = data.ngay_thang_nam_sinh.split('/');
            if (parts.length === 3) {
                dob = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            } else {
                dob = data.ngay_thang_nam_sinh;
            }
        }

        const studentReq = new sql.Request(transaction);
        studentReq.input('userId', userId);
        studentReq.input('msv', msv);
        studentReq.input('major', major);
        studentReq.input('dob', dob);

        const studentRes = await studentReq.query(`
            IF EXISTS (SELECT 1 FROM dbo.Students WHERE user_id = @userId)
            BEGIN
                UPDATE dbo.Students
                SET student_code = @msv, major = @major, dob = ISNULL(@dob, dob), updated_at = SYSDATETIME()
                OUTPUT inserted.student_id
                WHERE user_id = @userId;
            END
            ELSE
            BEGIN
                INSERT INTO dbo.Students (user_id, student_code, full_name, major, dob)
                OUTPUT inserted.student_id
                SELECT @userId, @msv, full_name, @major, @dob FROM dbo.Users WHERE user_id = @userId;
            END
        `);

        studentId = studentRes.recordset[0].student_id;
        updatedCount++;

        // 2. Danh sách môn học (list_mon_hoc)
        if (data.list_mon_hoc && typeof data.list_mon_hoc === 'object') {
            for (const [courseKey, isStudied] of Object.entries(data.list_mon_hoc)) {
                const subReq = new sql.Request(transaction);
                const cleanName = courseKey.replace(/_/g, ' ');
                subReq.input('code', courseKey.substring(0, 30));
                subReq.input('name', cleanName);
                subReq.input('studentId', studentId);
                subReq.input('status', isStudied ? 'COMPLETED' : 'PLANNED');

                await subReq.query(`
                    DECLARE @subId INT;
                    SELECT @subId = subject_id FROM dbo.Subjects WHERE subject_code = @code OR subject_name = @name;
                    IF @subId IS NULL
                    BEGIN
                        INSERT INTO dbo.Subjects (subject_code, subject_name, credits)
                        VALUES (@code, @name, 3);
                        SET @subId = SCOPE_IDENTITY();
                    END

                    IF NOT EXISTS (SELECT 1 FROM dbo.StudentSubjects WHERE student_id = @studentId AND subject_id = @subId)
                    BEGIN
                        INSERT INTO dbo.StudentSubjects (student_id, subject_id, status)
                        VALUES (@studentId, @subId, @status);
                    END
                    ELSE
                    BEGIN
                        UPDATE dbo.StudentSubjects
                        SET status = @status, updated_at = SYSDATETIME()
                        WHERE student_id = @studentId AND subject_id = @subId;
                    END
                `);
                insertedCount++;
            }
        }

        // 3. Bảng điểm (bang_diem)
        if (data.bang_diem && typeof data.bang_diem === 'object') {
            for (const [semesterKey, subjects] of Object.entries(data.bang_diem)) {
                for (const [subjectKey, gradeInfo] of Object.entries(subjects)) {
                    const gradeReq = new sql.Request(transaction);
                    const cleanSubName = subjectKey.replace(/_/g, ' ');
                    gradeReq.input('subCode', subjectKey.substring(0, 30));
                    gradeReq.input('subName', cleanSubName);
                    gradeReq.input('studentId', studentId);
                    gradeReq.input('semester', semesterKey);
                    gradeReq.input('credits', gradeInfo.so_tin_chi || 3);
                    gradeReq.input('finalScore', gradeInfo.diem_tong_ket || 0);
                    gradeReq.input('letterGrade', gradeInfo.diem_chu || 'F');
                    gradeReq.input('totalPoints', gradeInfo.tong_diem || null);
                    gradeReq.input('isPassed', (gradeInfo.trang_thai === 'dat' || gradeInfo.diem_chu !== 'F') ? 1 : 0);

                    await gradeReq.query(`
                        DECLARE @gradeSubId INT;
                        SELECT @gradeSubId = subject_id FROM dbo.Subjects WHERE subject_code = @subCode OR subject_name = @subName;
                        IF @gradeSubId IS NULL
                        BEGIN
                            INSERT INTO dbo.Subjects (subject_code, subject_name, credits)
                            VALUES (@subCode, @subName, @credits);
                            SET @gradeSubId = SCOPE_IDENTITY();
                        END

                        IF EXISTS (SELECT 1 FROM dbo.Grades WHERE student_id = @studentId AND subject_id = @gradeSubId AND semester = @semester)
                        BEGIN
                            UPDATE dbo.Grades
                            SET final_score = @finalScore, letter_grade = @letterGrade, total_points = @totalPoints,
                                is_passed = @isPassed, updated_at = SYSDATETIME()
                            WHERE student_id = @studentId AND subject_id = @gradeSubId AND semester = @semester;
                        END
                        ELSE
                        BEGIN
                            INSERT INTO dbo.Grades (student_id, subject_id, semester, academic_year, credits, final_score, letter_grade, total_points, is_passed)
                            VALUES (@studentId, @gradeSubId, @semester, '2025-2026', @credits, @finalScore, @letterGrade, @totalPoints, @isPassed);
                        END
                    `);
                    insertedCount++;
                }
            }
        }

        // 4. Thời khóa biểu (tkb)
        if (Array.isArray(data.tkb)) {
            for (const item of data.tkb) {
                const tkbReq = new sql.Request(transaction);
                tkbReq.input('studentId', studentId);
                tkbReq.input('maMon', item.ma_mon);
                tkbReq.input('tenMon', item.ten_mon ? item.ten_mon.replace(/_/g, ' ') : item.ma_mon);
                tkbReq.input('tenLop', item.ten_lop || 'Lớp HP');
                tkbReq.input('phong', item.phong || 'Chưa xếp');
                tkbReq.input('coSo', item.co_so || 'Cơ sở 1');
                tkbReq.input('thu', parseInt(item.thu, 10));
                tkbReq.input('gioBatDau', item.gio_bat_dau + ':00');
                tkbReq.input('gioKetThuc', item.gio_ket_thuc + ':00');

                // Chuyển ngày DD/MM/YYYY sang YYYY-MM-DD
                const pStart = (item.ngay_bat_dau || '01/09/2026').split('/');
                const startDate = pStart.length === 3 ? `${pStart[2]}-${pStart[1]}-${pStart[0]}` : item.ngay_bat_dau;
                const pEnd = (item.ngay_ket_thuc || '30/12/2026').split('/');
                const endDate = pEnd.length === 3 ? `${pEnd[2]}-${pEnd[1]}-${pEnd[0]}` : item.ngay_ket_thuc;

                tkbReq.input('ngayBatDau', startDate);
                tkbReq.input('ngayKetThuc', endDate);
                tkbReq.input('giangVien', item.giang_vien || null);

                await tkbReq.query(`
                    DECLARE @tkbSubId INT;
                    SELECT @tkbSubId = subject_id FROM dbo.Subjects WHERE subject_code = @maMon OR subject_name = @tenMon;
                    IF @tkbSubId IS NULL
                    BEGIN
                        INSERT INTO dbo.Subjects (subject_code, subject_name, credits) VALUES (@maMon, @tenMon, 3);
                        SET @tkbSubId = SCOPE_IDENTITY();
                    END

                    IF EXISTS (SELECT 1 FROM dbo.Timetables WHERE student_id = @studentId AND subject_id = @tkbSubId AND day_of_week = @thu AND start_time = @gioBatDau)
                    BEGIN
                        UPDATE dbo.Timetables
                        SET class_name = @tenLop, room = @phong, campus = @coSo, end_time = @gioKetThuc,
                            start_date = @ngayBatDau, end_date = @ngayKetThuc, lecturer_name = @giangVien, updated_at = SYSDATETIME()
                        WHERE student_id = @studentId AND subject_id = @tkbSubId AND day_of_week = @thu AND start_time = @gioBatDau;
                    END
                    ELSE
                    BEGIN
                        INSERT INTO dbo.Timetables (student_id, subject_id, class_name, room, campus, day_of_week, start_time, end_time, start_date, end_date, lecturer_name)
                        VALUES (@studentId, @tkbSubId, @tenLop, @phong, @coSo, @thu, @gioBatDau, @gioKetThuc, @ngayBatDau, @ngayKetThuc, @giangVien);
                    END
                `);
                insertedCount++;
            }
        }

        // 5. Lịch thi (lich_thi)
        if (Array.isArray(data.lich_thi)) {
            for (const item of data.lich_thi) {
                const examReq = new sql.Request(transaction);
                examReq.input('studentId', studentId);
                examReq.input('maMon', item.ma_mon);
                examReq.input('tenMon', item.ten_mon ? item.ten_mon.replace(/_/g, ' ') : item.ma_mon);

                const pExam = (item.ngay_thi || '15/12/2026').split('/');
                const examDate = pExam.length === 3 ? `${pExam[2]}-${pExam[1]}-${pExam[0]}` : item.ngay_thi;

                examReq.input('ngayThi', examDate);
                examReq.input('gioThi', (item.gio_thi || '08:00') + ':00');
                examReq.input('phongThi', item.phong_thi || 'A101');
                examReq.input('coSo', item.co_so || 'Cơ sở 1');

                await examReq.query(`
                    DECLARE @examSubId INT;
                    SELECT @examSubId = subject_id FROM dbo.Subjects WHERE subject_code = @maMon OR subject_name = @tenMon;
                    IF @examSubId IS NULL
                    BEGIN
                        INSERT INTO dbo.Subjects (subject_code, subject_name, credits) VALUES (@maMon, @tenMon, 3);
                        SET @examSubId = SCOPE_IDENTITY();
                    END

                    IF EXISTS (SELECT 1 FROM dbo.Exams WHERE student_id = @studentId AND subject_id = @examSubId AND exam_date = @ngayThi AND exam_time = @gioThi)
                    BEGIN
                        UPDATE dbo.Exams
                        SET room = @phongThi, campus = @coSo, updated_at = SYSDATETIME()
                        WHERE student_id = @studentId AND subject_id = @examSubId AND exam_date = @ngayThi AND exam_time = @gioThi;
                    END
                    ELSE
                    BEGIN
                        INSERT INTO dbo.Exams (student_id, subject_id, exam_date, exam_time, room, campus)
                        VALUES (@studentId, @examSubId, @ngayThi, @gioThi, @phongThi, @coSo);
                    END
                `);
                insertedCount++;
            }
        }

        // Ghi SyncLog
        const logReq = new sql.Request(transaction);
        logReq.input('studentId', studentId);
        logReq.input('inserted', insertedCount);
        logReq.input('updated', updatedCount);
        logReq.input('payload', JSON.stringify(data).substring(0, 4000));
        await logReq.query(`
            INSERT INTO dbo.SyncLogs (student_id, source_system, sync_status, records_inserted, records_updated, raw_payload, sync_started_at, sync_ended_at)
            VALUES (@studentId, 'IU', 'SUCCESS', @inserted, @updated, @payload, SYSDATETIME(), SYSDATETIME());
        `);

        await transaction.commit();
        return { success: true, recordsInserted: insertedCount, recordsUpdated: updatedCount };
    } catch (err) {
        await transaction.rollback();
        console.error('[saveIUData Error]:', err.message);
        throw err;
    }
}

/**
 * Đồng bộ dữ liệu Edux: Chương (Chapter) → Bài học (Lesson) → Tài liệu/Slide (Material)
 * @param {number} userId - ID người dùng
 * @param {Object} data - Dữ liệu Edux từ Crawler
 * @param {Array} [data.subjects] - Danh sách môn học kèm chapters/lessons/materials
 * @returns {Promise<Object>} { success, recordsInserted, recordsUpdated }
 * @throws {Error} Nếu lỗi DB (đã log vào SyncLogs)
 */
async function saveEduxData(userId, data) {
    if (!userId) throw new Error('userId là bắt buộc');
    if (!data) throw new Error('Dữ liệu Edux là bắt buộc');

    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    let insertedCount = 0;
    let updatedCount = 0;
    let studentId = null;
    const errorMessages = [];

    try {
        // Lấy student_id
        const stReq = new sql.Request(transaction);
        stReq.input('userId', userId);
        const stRes = await stReq.query(
            'SELECT student_id FROM dbo.Students WHERE user_id = @userId;'
        );
        if (stRes.recordset.length > 0) studentId = stRes.recordset[0].student_id;

        const subjects = Array.isArray(data.subjects) ? data.subjects
                       : Array.isArray(data) ? data
                       : [];

        for (const subjectData of subjects) {
            // 1. Tìm hoặc tạo Subjects
            const subReq = new sql.Request(transaction);
            const subCode = (subjectData.subject_code || subjectData.code || 'UNKNOWN').substring(0, 30);
            const subName = subjectData.subject_name || subjectData.name || subCode;
            subReq.input('subCode', subCode);
            subReq.input('subName', subName);

            const subRes = await subReq.query(`
                DECLARE @subId INT;
                SELECT @subId = subject_id FROM dbo.Subjects
                WHERE subject_code = @subCode OR subject_name = @subName;
                IF @subId IS NULL
                BEGIN
                    INSERT INTO dbo.Subjects (subject_code, subject_name, credits)
                    VALUES (@subCode, @subName, 3);
                    SET @subId = SCOPE_IDENTITY();
                END
                SELECT @subId AS subject_id;
            `);
            const subjectId = subRes.recordset[0].subject_id;

            // 2. Chapters
            const chapters = Array.isArray(subjectData.chapters) ? subjectData.chapters : [];
            for (const chap of chapters) {
                const chapReq = new sql.Request(transaction);
                chapReq.input('subjectId', subjectId);
                chapReq.input('chapOrder', chap.chapter_order || chap.order || 1);
                chapReq.input('title', chap.title || 'Chương không tên');
                chapReq.input('description', chap.description || null);

                const chapRes = await chapReq.query(`
                    DECLARE @chapId INT;
                    SELECT @chapId = chapter_id FROM dbo.EduxChapters
                    WHERE subject_id = @subjectId AND chapter_order = @chapOrder;
                    IF @chapId IS NULL
                    BEGIN
                        INSERT INTO dbo.EduxChapters (subject_id, chapter_order, title, description)
                        VALUES (@subjectId, @chapOrder, @title, @description);
                        SET @chapId = SCOPE_IDENTITY();
                    END
                    ELSE
                    BEGIN
                        UPDATE dbo.EduxChapters
                        SET title = @title, description = @description
                        WHERE chapter_id = @chapId;
                    END
                    SELECT @chapId AS chapter_id;
                `);
                const chapterId = chapRes.recordset[0].chapter_id;
                insertedCount++;

                // 3. Lessons
                const lessons = Array.isArray(chap.lessons) ? chap.lessons : [];
                for (const lesson of lessons) {
                    const lesReq = new sql.Request(transaction);
                    lesReq.input('chapterId', chapterId);
                    lesReq.input('lesOrder', lesson.lesson_order || lesson.order || 1);
                    lesReq.input('title', lesson.title || 'Bài học không tên');
                    lesReq.input('description', lesson.description || null);

                    const lesRes = await lesReq.query(`
                        DECLARE @lesId INT;
                        SELECT @lesId = lesson_id FROM dbo.EduxLessons
                        WHERE chapter_id = @chapterId AND lesson_order = @lesOrder;
                        IF @lesId IS NULL
                        BEGIN
                            INSERT INTO dbo.EduxLessons (chapter_id, lesson_order, title, description)
                            VALUES (@chapterId, @lesOrder, @title, @description);
                            SET @lesId = SCOPE_IDENTITY();
                        END
                        ELSE
                        BEGIN
                            UPDATE dbo.EduxLessons SET title = @title, description = @description
                            WHERE lesson_id = @lesId;
                        END
                        SELECT @lesId AS lesson_id;
                    `);
                    const lessonId = lesRes.recordset[0].lesson_id;
                    insertedCount++;

                    // 4. Materials/Slides
                    const materials = Array.isArray(lesson.materials) ? lesson.materials : [];
                    for (const mat of materials) {
                        const matReq = new sql.Request(transaction);
                        matReq.input('subjectId', subjectId);
                        matReq.input('chapterId', chapterId);
                        matReq.input('lessonId', lessonId);
                        matReq.input('title', mat.title || 'Tài liệu');
                        const matType = ['SLIDE', 'DOCUMENT', 'VIDEO', 'LINK', 'TEXTBOOK'].includes(mat.material_type)
                            ? mat.material_type : 'DOCUMENT';
                        matReq.input('matType', matType);
                        matReq.input('fileUrl', mat.file_url || mat.url || '#');
                        matReq.input('fileSize', mat.file_size_kb ? parseInt(mat.file_size_kb, 10) : null);

                        await matReq.query(`
                            IF NOT EXISTS (
                                SELECT 1 FROM dbo.EduxMaterials
                                WHERE subject_id = @subjectId AND lesson_id = @lessonId
                                  AND title = @title AND material_type = @matType
                            )
                            BEGIN
                                INSERT INTO dbo.EduxMaterials (subject_id, chapter_id, lesson_id, title, material_type, file_url, file_size_kb)
                                VALUES (@subjectId, @chapterId, @lessonId, @title, @matType, @fileUrl, @fileSize);
                            END
                            ELSE
                            BEGIN
                                UPDATE dbo.EduxMaterials
                                SET file_url = @fileUrl, file_size_kb = @fileSize, updated_at = SYSDATETIME()
                                WHERE subject_id = @subjectId AND lesson_id = @lessonId
                                  AND title = @title AND material_type = @matType;
                            END
                        `);
                        insertedCount++;
>>>>>>> 52fe607 (Cập nhật các hàm trong thư mục database/functions)
                    }
                }
            }
        }

<<<<<<< HEAD
        // 3. Đồng bộ thời khóa biểu
        if (Array.isArray(dataIU.tkb)) {
            for (const t of dataIU.tkb) {
                const subRows = await executeQuery('SELECT subject_id FROM dbo.Subjects WHERE subject_code = @code OR subject_name = @name', {
                    code: t.ma_mon || 'UNKNOWN',
                    name: (t.ten_mon || '').replace(/_/g, ' ')
                });
                let subjectId = subRows.length > 0 ? subRows[0].subject_id : null;
                if (!subjectId) {
                    const newSub = await executeQuery(
                        'INSERT INTO dbo.Subjects (subject_code, subject_name, credits) VALUES (@code, @name, 3); SELECT SCOPE_IDENTITY() AS id;',
                        { code: t.ma_mon || 'MON_' + Date.now(), name: (t.ten_mon || '').replace(/_/g, ' ') }
                    );
                    subjectId = newSub[0].id;
                }

                await executeProcedure('dbo.sp_Sprint1_SaveTimetable', {
                    userId: parseInt(userId, 10),
                    subjectId,
                    className: t.ten_lop || 'Lớp học phần',
                    room: t.phong || 'A101',
                    campus: t.co_so || 'Cơ sở chính',
                    dayOfWeek: t.thu || 2,
                    startTime: t.gio_bat_dau || '07:30',
                    endTime: t.gio_ket_thuc || '09:30',
                    startDate: convertDate(t.ngay_bat_dau) || '2026-09-01',
                    endDate: convertDate(t.ngay_ket_thuc) || '2026-12-31',
                    lecturerName: t.giang_vien || null
                });
                result.timetableCount++;
            }
        }

        // 4. Đồng bộ lịch thi
        if (Array.isArray(dataIU.lich_thi)) {
            for (const lt of dataIU.lich_thi) {
                const subRows = await executeQuery('SELECT subject_id FROM dbo.Subjects WHERE subject_code = @code OR subject_name = @name', {
                    code: lt.ma_mon || 'UNKNOWN',
                    name: (lt.ten_mon || '').replace(/_/g, ' ')
                });
                let subjectId = subRows.length > 0 ? subRows[0].subject_id : null;
                if (!subjectId) {
                    const newSub = await executeQuery(
                        'INSERT INTO dbo.Subjects (subject_code, subject_name, credits) VALUES (@code, @name, 3); SELECT SCOPE_IDENTITY() AS id;',
                        { code: lt.ma_mon || 'MON_THI', name: (lt.ten_mon || '').replace(/_/g, ' ') }
                    );
                    subjectId = newSub[0].id;
                }

                await executeProcedure('dbo.sp_Sprint1_SaveExam', {
                    userId: parseInt(userId, 10),
                    subjectId,
                    examName: 'Thi kết thúc học phần',
                    examDate: convertDate(lt.ngay_thi) || '2026-12-15',
                    examTime: lt.gio_thi || '08:00',
                    durationMinutes: 90,
                    room: lt.phong_thi || 'A201',
                    campus: lt.co_so || 'Cơ sở chính',
                    examFormat: 'Tự luận'
                });
                result.examsCount++;
            }
        }

        return result;
    } catch (err) {
        console.error('[SYNC] Lỗi đồng bộ IU:', err.message);
=======
        // Ghi SyncLog
        if (studentId) {
            const logReq = new sql.Request(transaction);
            logReq.input('studentId', studentId);
            logReq.input('inserted', insertedCount);
            logReq.input('updated', updatedCount);
            await logReq.query(`
                INSERT INTO dbo.SyncLogs (student_id, source_system, sync_status, records_inserted, records_updated, sync_started_at, sync_ended_at)
                VALUES (@studentId, 'EDUX', 'SUCCESS', @inserted, @updated, SYSDATETIME(), SYSDATETIME());
            `);
        }

        await transaction.commit();
        return { success: true, recordsInserted: insertedCount, recordsUpdated: updatedCount };
    } catch (err) {
        await transaction.rollback();
        console.error('[saveEduxData Error]:', err.message);

        // Ghi log lỗi nếu có studentId
        if (studentId) {
            try {
                const pool2 = await getPool();
                const errReq = pool2.request();
                errReq.input('studentId', studentId);
                errReq.input('errMsg', err.message.substring(0, 2000));
                await errReq.query(`
                    INSERT INTO dbo.SyncLogs (student_id, source_system, sync_status, error_message, sync_started_at, sync_ended_at)
                    VALUES (@studentId, 'EDUX', 'FAILED', @errMsg, SYSDATETIME(), SYSDATETIME());
                `);
            } catch (logErr) {
                console.error('[saveEduxData SyncLog Error]:', logErr.message);
            }
        }
>>>>>>> 52fe607 (Cập nhật các hàm trong thư mục database/functions)
        throw err;
    }
}

<<<<<<< HEAD
function convertDate(dateStr) {
    if (!dateStr) return null;
    // Format DD/MM/YYYY -> YYYY-MM-DD
    const parts = dateStr.split('/');
    if (parts.length === 3) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    return dateStr;
}

function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return hash;
}

module.exports = { saveIUData };
=======
/**
 * Đồng bộ dữ liệu eLearning: Tuần → Bài học → Tiến độ sinh viên
 * @param {number} userId - ID người dùng
 * @param {Object} data - Dữ liệu eLearning từ Crawler
 * @param {Array} [data.subjects] - Danh sách môn kèm weeks/lessons/progress
 * @returns {Promise<Object>} { success, recordsInserted, recordsUpdated }
 * @throws {Error} Nếu lỗi DB (đã log vào SyncLogs)
 */
async function saveElearningData(userId, data) {
    if (!userId) throw new Error('userId là bắt buộc');
    if (!data) throw new Error('Dữ liệu eLearning là bắt buộc');

    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    let insertedCount = 0;
    let updatedCount = 0;
    let studentId = null;

    try {
        const stReq = new sql.Request(transaction);
        stReq.input('userId', userId);
        const stRes = await stReq.query(
            'SELECT student_id FROM dbo.Students WHERE user_id = @userId;'
        );
        if (stRes.recordset.length > 0) studentId = stRes.recordset[0].student_id;

        const subjects = Array.isArray(data.subjects) ? data.subjects
                       : Array.isArray(data) ? data
                       : [];

        for (const subjectData of subjects) {
            // Tìm subject_id
            const subReq = new sql.Request(transaction);
            const subCode = (subjectData.subject_code || subjectData.code || 'UNKNOWN').substring(0, 30);
            const subName = subjectData.subject_name || subjectData.name || subCode;
            subReq.input('subCode', subCode);
            subReq.input('subName', subName);
            const subRes = await subReq.query(`
                DECLARE @subId INT;
                SELECT @subId = subject_id FROM dbo.Subjects WHERE subject_code = @subCode OR subject_name = @subName;
                IF @subId IS NULL
                BEGIN
                    INSERT INTO dbo.Subjects (subject_code, subject_name, credits) VALUES (@subCode, @subName, 3);
                    SET @subId = SCOPE_IDENTITY();
                END
                SELECT @subId AS subject_id;
            `);
            const subjectId = subRes.recordset[0].subject_id;

            const weeks = Array.isArray(subjectData.weeks) ? subjectData.weeks : [];
            for (const week of weeks) {
                // UPSERT Week
                const weekReq = new sql.Request(transaction);
                weekReq.input('subjectId', subjectId);
                weekReq.input('weekNum', week.week_number || week.week || 1);
                weekReq.input('title', week.title || ('Tuần ' + (week.week_number || 1)));
                weekReq.input('startDate', week.start_date || null);
                weekReq.input('endDate', week.end_date || null);

                const weekRes = await weekReq.query(`
                    DECLARE @weekId INT;
                    SELECT @weekId = week_id FROM dbo.ElearningWeeks
                    WHERE subject_id = @subjectId AND week_number = @weekNum;
                    IF @weekId IS NULL
                    BEGIN
                        INSERT INTO dbo.ElearningWeeks (subject_id, week_number, title, start_date, end_date)
                        VALUES (@subjectId, @weekNum, @title, @startDate, @endDate);
                        SET @weekId = SCOPE_IDENTITY();
                    END
                    ELSE
                    BEGIN
                        UPDATE dbo.ElearningWeeks
                        SET title = @title, start_date = @startDate, end_date = @endDate
                        WHERE week_id = @weekId;
                    END
                    SELECT @weekId AS week_id;
                `);
                const weekId = weekRes.recordset[0].week_id;
                insertedCount++;

                const lessons = Array.isArray(week.lessons) ? week.lessons : [];
                for (const lesson of lessons) {
                    // UPSERT Lesson
                    const lesReq = new sql.Request(transaction);
                    lesReq.input('weekId', weekId);
                    lesReq.input('lesOrder', lesson.lesson_order || lesson.order || 1);
                    lesReq.input('title', lesson.title || 'Bài học');
                    lesReq.input('contentUrl', lesson.content_url || lesson.url || null);
                    lesReq.input('duration', lesson.duration_minutes ? parseInt(lesson.duration_minutes, 10) : 0);

                    const lesRes = await lesReq.query(`
                        DECLARE @lesId INT;
                        SELECT @lesId = elearning_lesson_id FROM dbo.ElearningLessons
                        WHERE week_id = @weekId AND lesson_order = @lesOrder;
                        IF @lesId IS NULL
                        BEGIN
                            INSERT INTO dbo.ElearningLessons (week_id, lesson_order, title, content_url, duration_minutes)
                            VALUES (@weekId, @lesOrder, @title, @contentUrl, @duration);
                            SET @lesId = SCOPE_IDENTITY();
                        END
                        ELSE
                        BEGIN
                            UPDATE dbo.ElearningLessons
                            SET title = @title, content_url = @contentUrl, duration_minutes = @duration
                            WHERE elearning_lesson_id = @lesId;
                        END
                        SELECT @lesId AS elearning_lesson_id;
                    `);
                    const lessonId = lesRes.recordset[0].elearning_lesson_id;
                    insertedCount++;

                    // UPSERT Progress nếu có studentId
                    if (studentId && lesson.is_completed !== undefined) {
                        const progReq = new sql.Request(transaction);
                        progReq.input('studentId', studentId);
                        progReq.input('lessonId', lessonId);
                        const isCompleted = lesson.is_completed ? 1 : 0;
                        progReq.input('isCompleted', isCompleted);
                        progReq.input('progress', lesson.progress_percent != null ? parseFloat(lesson.progress_percent) : (isCompleted ? 100.0 : 0.0));
                        progReq.input('timeSpent', lesson.time_spent_seconds ? parseInt(lesson.time_spent_seconds, 10) : 0);

                        await progReq.query(`
                            IF EXISTS (
                                SELECT 1 FROM dbo.StudentElearningProgress
                                WHERE student_id = @studentId AND elearning_lesson_id = @lessonId
                            )
                            BEGIN
                                UPDATE dbo.StudentElearningProgress
                                SET is_completed = @isCompleted,
                                    progress_percent = @progress,
                                    time_spent_seconds = @timeSpent,
                                    completed_at = CASE WHEN @isCompleted = 1 AND completed_at IS NULL THEN SYSDATETIME() ELSE completed_at END,
                                    last_accessed_at = SYSDATETIME(),
                                    updated_at = SYSDATETIME()
                                WHERE student_id = @studentId AND elearning_lesson_id = @lessonId;
                            END
                            ELSE
                            BEGIN
                                INSERT INTO dbo.StudentElearningProgress
                                    (student_id, elearning_lesson_id, is_completed, progress_percent, time_spent_seconds, completed_at, last_accessed_at)
                                VALUES (@studentId, @lessonId, @isCompleted, @progress, @timeSpent,
                                    CASE WHEN @isCompleted = 1 THEN SYSDATETIME() ELSE NULL END, SYSDATETIME());
                            END
                        `);
                        updatedCount++;
                    }
                }
            }
        }

        // Ghi SyncLog
        if (studentId) {
            const logReq = new sql.Request(transaction);
            logReq.input('studentId', studentId);
            logReq.input('inserted', insertedCount);
            logReq.input('updated', updatedCount);
            await logReq.query(`
                INSERT INTO dbo.SyncLogs (student_id, source_system, sync_status, records_inserted, records_updated, sync_started_at, sync_ended_at)
                VALUES (@studentId, 'ELEARNING', 'SUCCESS', @inserted, @updated, SYSDATETIME(), SYSDATETIME());
            `);
        }

        await transaction.commit();
        return { success: true, recordsInserted: insertedCount, recordsUpdated: updatedCount };
    } catch (err) {
        await transaction.rollback();
        console.error('[saveElearningData Error]:', err.message);
        if (studentId) {
            try {
                const pool2 = await getPool();
                const errReq = pool2.request();
                errReq.input('studentId', studentId);
                errReq.input('errMsg', err.message.substring(0, 2000));
                await errReq.query(`
                    INSERT INTO dbo.SyncLogs (student_id, source_system, sync_status, error_message, sync_started_at, sync_ended_at)
                    VALUES (@studentId, 'ELEARNING', 'FAILED', @errMsg, SYSDATETIME(), SYSDATETIME());
                `);
            } catch (logErr) {
                console.error('[saveElearningData SyncLog Error]:', logErr.message);
            }
        }
        throw err;
    }
}

/**
 * Đồng bộ dữ liệu LMS: Bài tập và Deadline (UPSERT chống duplicate theo external_id + source)
 * @param {number} userId - ID người dùng
 * @param {Object} data - Dữ liệu LMS từ Crawler
 * @param {Array} [data.assignments] - Danh sách bài tập [{ subject_code, title, description, deadline, external_id, source }]
 * @returns {Promise<Object>} { success, recordsInserted, recordsUpdated }
 * @throws {Error} Nếu lỗi DB (đã log vào SyncLogs)
 */
async function saveLmsData(userId, data) {
    if (!userId) throw new Error('userId là bắt buộc');
    if (!data) throw new Error('Dữ liệu LMS là bắt buộc');

    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    let insertedCount = 0;
    let updatedCount = 0;
    let studentId = null;

    try {
        const stReq = new sql.Request(transaction);
        stReq.input('userId', userId);
        const stRes = await stReq.query(
            'SELECT student_id FROM dbo.Students WHERE user_id = @userId;'
        );
        if (stRes.recordset.length > 0) studentId = stRes.recordset[0].student_id;

        if (!studentId) throw new Error('Sinh viên không tồn tại cho userId = ' + userId);

        const assignments = Array.isArray(data.assignments) ? data.assignments
                          : Array.isArray(data) ? data
                          : [];

        for (const asg of assignments) {
            // Tìm subject_id theo mã môn
            const subReq = new sql.Request(transaction);
            const subCode = (asg.subject_code || asg.code || 'UNKNOWN').substring(0, 30);
            const subName = asg.subject_name || asg.name || subCode;
            subReq.input('subCode', subCode);
            subReq.input('subName', subName);
            const subRes = await subReq.query(`
                DECLARE @subId INT;
                SELECT @subId = subject_id FROM dbo.Subjects WHERE subject_code = @subCode OR subject_name = @subName;
                IF @subId IS NULL
                BEGIN
                    INSERT INTO dbo.Subjects (subject_code, subject_name, credits) VALUES (@subCode, @subName, 3);
                    SET @subId = SCOPE_IDENTITY();
                END
                SELECT @subId AS subject_id;
            `);
            const subjectId = subRes.recordset[0].subject_id;

            const asgReq = new sql.Request(transaction);
            asgReq.input('studentId', studentId);
            asgReq.input('subjectId', subjectId);
            asgReq.input('title', asg.title || 'Bài tập LMS');
            asgReq.input('description', asg.description || null);
            // Xử lý deadline
            let deadline = asg.deadline || asg.due_date || null;
            asgReq.input('deadline', deadline);
            const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE'];
            const status = validStatuses.includes(asg.status) ? asg.status : 'PENDING';
            asgReq.input('status', status);
            asgReq.input('source', asg.source || 'LMS');
            asgReq.input('externalId', asg.external_id || asg.id || null);

            await asgReq.query(`
                IF @externalId IS NOT NULL AND EXISTS (
                    SELECT 1 FROM dbo.Assignments
                    WHERE student_id = @studentId AND source = @source AND external_id = @externalId
                )
                BEGIN
                    UPDATE dbo.Assignments
                    SET title       = @title,
                        description = @description,
                        deadline    = ISNULL(@deadline, deadline),
                        status      = CASE WHEN status != 'COMPLETED' THEN @status ELSE status END,
                        updated_at  = SYSDATETIME()
                    WHERE student_id = @studentId AND source = @source AND external_id = @externalId;
                END
                ELSE
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1 FROM dbo.Assignments
                        WHERE student_id = @studentId AND subject_id = @subjectId
                          AND title = @title
                          AND (@externalId IS NULL OR external_id != @externalId)
                    )
                    BEGIN
                        INSERT INTO dbo.Assignments
                            (student_id, subject_id, title, description, assigned_at, deadline, status, source, external_id)
                        VALUES
                            (@studentId, @subjectId, @title, @description, SYSDATETIME(), @deadline, @status, @source, @externalId);
                    END
                END
            `);
            insertedCount++;
        }

        // Ghi SyncLog
        const logReq = new sql.Request(transaction);
        logReq.input('studentId', studentId);
        logReq.input('inserted', insertedCount);
        logReq.input('updated', updatedCount);
        await logReq.query(`
            INSERT INTO dbo.SyncLogs (student_id, source_system, sync_status, records_inserted, records_updated, sync_started_at, sync_ended_at)
            VALUES (@studentId, 'LMS', 'SUCCESS', @inserted, @updated, SYSDATETIME(), SYSDATETIME());
        `);

        await transaction.commit();
        return { success: true, recordsInserted: insertedCount, recordsUpdated: updatedCount };
    } catch (err) {
        await transaction.rollback();
        console.error('[saveLmsData Error]:', err.message);
        if (studentId) {
            try {
                const pool2 = await getPool();
                const errReq = pool2.request();
                errReq.input('studentId', studentId);
                errReq.input('errMsg', err.message.substring(0, 2000));
                await errReq.query(`
                    INSERT INTO dbo.SyncLogs (student_id, source_system, sync_status, error_message, sync_started_at, sync_ended_at)
                    VALUES (@studentId, 'LMS', 'FAILED', @errMsg, SYSDATETIME(), SYSDATETIME());
                `);
            } catch (logErr) {
                console.error('[saveLmsData SyncLog Error]:', logErr.message);
            }
        }
        throw err;
    }
}

/**
 * Hàm điều phối đồng bộ toàn diện từ tất cả nguồn (IU, Edux, eLearning, LMS)
 * Luồng: CRWEB → updateData() → saveIUData() / saveEduxData() / saveElearningData() / saveLmsData() → SyncLogs
 * @param {number} userId - ID người dùng
 * @param {Object} data - Dữ liệu từ CRWEB với các key: iu, edux, elearning, lms
 * @param {Object} [data.iu] - Dữ liệu từ getInfo() của IU Crawler
 * @param {Object} [data.edux] - Dữ liệu Edux Crawler
 * @param {Object} [data.elearning] - Dữ liệu eLearning Crawler
 * @param {Object} [data.lms] - Dữ liệu LMS Crawler
 * @returns {Promise<Object>} Kết quả từng nguồn { iu, edux, elearning, lms, errors }
 */
async function updateData(userId, data = {}) {
    if (!userId) throw new Error('userId là bắt buộc');

    const results = {
        userId,
        updatedAt: new Date().toISOString(),
        iu: null,
        edux: null,
        elearning: null,
        lms: null,
        errors: []
    };

    // Đồng bộ IU
    if (data.iu) {
        try {
            results.iu = await saveIUData(userId, data.iu);
        } catch (err) {
            console.error('[updateData - IU Source Error]:', err.message);
            results.errors.push({ source: 'IU', error: err.message });
        }
    }

    // Đồng bộ Edux
    if (data.edux) {
        try {
            results.edux = await saveEduxData(userId, data.edux);
        } catch (err) {
            console.error('[updateData - EDUX Source Error]:', err.message);
            results.errors.push({ source: 'EDUX', error: err.message });
        }
    }

    // Đồng bộ eLearning
    if (data.elearning) {
        try {
            results.elearning = await saveElearningData(userId, data.elearning);
        } catch (err) {
            console.error('[updateData - ELEARNING Source Error]:', err.message);
            results.errors.push({ source: 'ELEARNING', error: err.message });
        }
    }

    // Đồng bộ LMS
    if (data.lms) {
        try {
            results.lms = await saveLmsData(userId, data.lms);
        } catch (err) {
            console.error('[updateData - LMS Source Error]:', err.message);
            results.errors.push({ source: 'LMS', error: err.message });
        }
    }

    const allFailed = results.errors.length > 0 &&
        !results.iu && !results.edux && !results.elearning && !results.lms;

    results.status = allFailed ? 'FAILED'
                   : results.errors.length > 0 ? 'PARTIAL'
                   : 'SUCCESS';

    return results;
}

module.exports = {
    saveIUData,
    saveEduxData,
    saveElearningData,
    saveLmsData,
    updateData
};
>>>>>>> 52fe607 (Cập nhật các hàm trong thư mục database/functions)
