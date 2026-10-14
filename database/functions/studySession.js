/**
 * database/functions/studySession.js
 * Quan ly phien hoc Pomodoro, thong ke thoi gian tu hoc va ban do thoi gian hoc tap
 * Phuc vu: Dong ho Pomodoro, thong ke thoi gian hoc, ban do thoi gian hoc tap
 */

const { executeQuery, getPool } = require('../connection/db');

/**
 * Lay toan bo phien hoc cua sinh vien
 * @param {number} userId - ID nguoi dung
 * @returns {Promise<Array>} Danh sach cac phien hoc (Pomodoro, tu hoc...)
 * @throws {Error} Neu userId khong hop le
 */
async function getStudySessions(userId) {
    if (!userId) throw new Error('userId la bat buoc');
    return await executeQuery(`
        DECLARE @studentId INT;
        SELECT @studentId = student_id FROM dbo.Students WHERE user_id = @userId OR student_id = @userId;

        SELECT
            ss.session_id,
            ss.student_id,
            ss.subject_id,
            sub.subject_code,
            sub.subject_name,
            ss.start_time,
            ss.end_time,
            ss.duration_minutes,
            ss.session_type,
            ss.notes,
            ss.created_at
        FROM dbo.StudySessions ss
        LEFT JOIN dbo.Subjects sub ON ss.subject_id = sub.subject_id
        WHERE ss.student_id = @studentId
        ORDER BY ss.start_time DESC;
    `, { userId: parseInt(userId, 10) });
}

/**
 * Lay chi tiet mot phien hoc theo session_id
 * @param {number} sessionId - ID phien hoc
 * @returns {Promise<Object|null>} Thong tin phien hoc hoac null
 * @throws {Error} Neu sessionId khong hop le
 */
async function getStudySessionById(sessionId) {
    if (!sessionId) throw new Error('sessionId la bat buoc');
    const result = await executeQuery(`
        SELECT
            ss.session_id,
            ss.student_id,
            ss.subject_id,
            sub.subject_code,
            sub.subject_name,
            ss.start_time,
            ss.end_time,
            ss.duration_minutes,
            ss.session_type,
            ss.notes,
            ss.created_at
        FROM dbo.StudySessions ss
        LEFT JOIN dbo.Subjects sub ON ss.subject_id = sub.subject_id
        WHERE ss.session_id = @sessionId;
    `, { sessionId: parseInt(sessionId, 10) });
    return result.length > 0 ? result[0] : null;
}

/**
 * Tao moi mot phien hoc
 * @param {Object} data - Thong tin phien hoc
 * @param {number} data.userId - ID nguoi dung (bat buoc)
 * @param {number|null} [data.subjectId] - ID mon hoc (tuy chon)
 * @param {string|Date} data.startTime - Thoi diem bat dau (bat buoc)
 * @param {string|Date|null} [data.endTime] - Thoi diem ket thuc
 * @param {number} [data.durationMinutes=25] - Thoi luong (phut)
 * @param {string} [data.sessionType='POMODORO'] - Loai phien: POMODORO, SELF_STUDY, AI_TUTOR, EXAM_PREP
 * @param {string|null} [data.notes] - Ghi chu
 * @returns {Promise<Object>} Phien hoc vua tao
 * @throws {Error} Neu userId hoac startTime thieu
 */
async function createStudySession(data) {
    if (!data.userId) throw new Error('userId la bat buoc');
    if (!data.startTime) throw new Error('startTime la bat buoc');

    const validTypes = ['POMODORO', 'SELF_STUDY', 'AI_TUTOR', 'EXAM_PREP'];
    const sessionType = data.sessionType || 'POMODORO';
    if (!validTypes.includes(sessionType)) {
        throw new Error('sessionType khong hop le. Cho phep: ' + validTypes.join(', '));
    }

    const pool = await getPool();
    const request = pool.request();
    request.input('userId', parseInt(data.userId, 10));
    request.input('subjectId', data.subjectId ? parseInt(data.subjectId, 10) : null);
    request.input('startTime', data.startTime);
    request.input('endTime', data.endTime || null);
    request.input('durationMinutes', data.durationMinutes ? parseInt(data.durationMinutes, 10) : 25);
    request.input('sessionType', sessionType);
    request.input('notes', data.notes || null);

    const result = await request.query(`
        DECLARE @studentId INT;
        SELECT @studentId = student_id FROM dbo.Students WHERE user_id = @userId OR student_id = @userId;

        IF @studentId IS NULL
            THROW 50001, N'Sinh vien khong ton tai.', 1;

        INSERT INTO dbo.StudySessions (student_id, subject_id, start_time, end_time, duration_minutes, session_type, notes)
        OUTPUT inserted.*
        VALUES (@studentId, @subjectId, @startTime, @endTime, @durationMinutes, @sessionType, @notes);
    `);
    return result.recordset.length > 0 ? result.recordset[0] : null;
}

/**
 * Cap nhat thong tin phien hoc
 * @param {number} sessionId - ID phien hoc
 * @param {Object} data - Du lieu cap nhat
 * @returns {Promise<Object|null>} Phien hoc sau cap nhat
 * @throws {Error} Neu sessionId khong hop le
 */
async function updateStudySession(sessionId, data) {
    if (!sessionId) throw new Error('sessionId la bat buoc');

    const pool = await getPool();
    const request = pool.request();
    request.input('sessionId', parseInt(sessionId, 10));
    request.input('endTime', data.endTime || null);
    request.input('durationMinutes', data.durationMinutes ? parseInt(data.durationMinutes, 10) : null);
    request.input('sessionType', data.sessionType || null);
    request.input('notes', data.notes !== undefined ? data.notes : null);

    const result = await request.query(`
        UPDATE dbo.StudySessions
        SET
            end_time         = ISNULL(@endTime, end_time),
            duration_minutes = ISNULL(@durationMinutes, duration_minutes),
            session_type     = ISNULL(@sessionType, session_type),
            notes            = CASE WHEN @notes IS NOT NULL THEN @notes ELSE notes END
        OUTPUT inserted.*
        WHERE session_id = @sessionId;
    `);
    return result.recordset.length > 0 ? result.recordset[0] : null;
}

/**
 * Xoa mot phien hoc
 * @param {number} sessionId - ID phien hoc
 * @returns {Promise<boolean>} true neu xoa thanh cong
 * @throws {Error} Neu sessionId khong hop le
 */
async function deleteStudySession(sessionId) {
    if (!sessionId) throw new Error('sessionId la bat buoc');
    const pool = await getPool();
    const request = pool.request();
    request.input('sessionId', parseInt(sessionId, 10));
    const result = await request.query(
        'DELETE FROM dbo.StudySessions WHERE session_id = @sessionId;'
    );
    return (result.rowsAffected[0] || 0) > 0;
}

/**
 * Lay tong thoi gian tu hoc cua sinh vien (phut)
 * @param {number} userId - ID nguoi dung
 * @returns {Promise<Object>} { total_minutes, total_sessions, avg_session_minutes, pomodoro_minutes, self_study_minutes }
 * @throws {Error} Neu userId khong hop le
 */
async function getStudyTime(userId) {
    if (!userId) throw new Error('userId la bat buoc');
    const result = await executeQuery(`
        DECLARE @studentId INT;
        SELECT @studentId = student_id FROM dbo.Students WHERE user_id = @userId OR student_id = @userId;

        SELECT
            ISNULL(SUM(duration_minutes), 0)                                                              AS total_minutes,
            COUNT(session_id)                                                                             AS total_sessions,
            ISNULL(ROUND(AVG(CAST(duration_minutes AS FLOAT)), 2), 0)                                    AS avg_session_minutes,
            ISNULL(SUM(CASE WHEN session_type = 'POMODORO'   THEN duration_minutes ELSE 0 END), 0)      AS pomodoro_minutes,
            ISNULL(SUM(CASE WHEN session_type = 'SELF_STUDY' THEN duration_minutes ELSE 0 END), 0)      AS self_study_minutes
        FROM dbo.StudySessions
        WHERE student_id = @studentId;
    `, { userId: parseInt(userId, 10) });
    return result.length > 0 ? result[0] : {
        total_minutes: 0, total_sessions: 0, avg_session_minutes: 0,
        pomodoro_minutes: 0, self_study_minutes: 0
    };
}

/**
 * Lay thong ke phien hoc theo khoang thoi gian (ban do thoi gian hoc tap)
 * @param {number} userId - ID nguoi dung
 * @param {string|Date} startDate - Ngay bat dau (YYYY-MM-DD)
 * @param {string|Date} endDate - Ngay ket thuc (YYYY-MM-DD)
 * @returns {Promise<Array>} Thong ke theo ngay trong khoang thoi gian
 * @throws {Error} Neu userId, startDate, endDate thieu
 */
async function getStudyStatisticsByPeriod(userId, startDate, endDate) {
    if (!userId) throw new Error('userId la bat buoc');
    if (!startDate || !endDate) throw new Error('startDate va endDate la bat buoc');

    return await executeQuery(`
        DECLARE @studentId INT;
        SELECT @studentId = student_id FROM dbo.Students WHERE user_id = @userId OR student_id = @userId;

        SELECT
            CAST(ss.start_time AS DATE)   AS study_date,
            COUNT(ss.session_id)          AS session_count,
            SUM(ss.duration_minutes)      AS total_minutes,
            sub.subject_id,
            sub.subject_code,
            sub.subject_name,
            ss.session_type
        FROM dbo.StudySessions ss
        LEFT JOIN dbo.Subjects sub ON ss.subject_id = sub.subject_id
        WHERE ss.student_id = @studentId
          AND CAST(ss.start_time AS DATE) BETWEEN @startDate AND @endDate
        GROUP BY CAST(ss.start_time AS DATE), sub.subject_id, sub.subject_code, sub.subject_name, ss.session_type
        ORDER BY study_date ASC;
    `, {
        userId: parseInt(userId, 10),
        startDate,
        endDate
    });
}

module.exports = {
    getStudySessions,
    getStudySessionById,
    createStudySession,
    updateStudySession,
    deleteStudySession,
    getStudyTime,
    getStudyStatisticsByPeriod
};
