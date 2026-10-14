/**
 * database/functions/timetable.js
 * Quản lý thời khóa biểu thông minh, theo ngày, tuần, môn và kiểm tra trùng lịch
 */

const { executeProcedure } = require('../connection/db');

/**
 * Lấy toàn bộ thời khóa biểu của sinh viên
 * @param {number} userId - ID người dùng
 * @returns {Promise<Array>} Danh sách tiết học trong thời khóa biểu
 */
async function getTKB(userId) {
    if (!userId) throw new Error('userId là bắt buộc');
    return await executeProcedure('dbo.sp_GetTKB', { userId: parseInt(userId, 10) });
}

/**
 * Lấy thời khóa biểu theo ngày cụ thể (YYYY-MM-DD)
 * @param {number} userId - ID người dùng
 * @param {string|Date} date - Ngày cần xem lịch (e.g. '2026-09-08')
 * @returns {Promise<Array>} Danh sách tiết học của ngày
 */
async function getTKBByDate(userId, date) {
    if (!userId) throw new Error('userId là bắt buộc');
    if (!date) throw new Error('date là bắt buộc');
    return await executeProcedure('dbo.sp_GetTKBByDate', { 
        userId: parseInt(userId, 10),
        targetDate: date
    });
}

/**
 * Lấy thời khóa biểu trong một khoảng tuần
 * @param {number} userId - ID người dùng
 * @param {string|Date} startDate - Ngày đầu tuần
 * @param {string|Date} endDate - Ngày cuối tuần
 * @returns {Promise<Array>} Danh sách tiết học trong tuần
 */
async function getTKBByWeek(userId, startDate, endDate) {
    if (!userId) throw new Error('userId là bắt buộc');
    if (!startDate || !endDate) throw new Error('startDate và endDate là bắt buộc');
    return await executeProcedure('dbo.sp_GetTKBByWeek', { 
        userId: parseInt(userId, 10),
        startDate: startDate,
        endDate: endDate
    });
}

/**
 * Lấy thời khóa biểu theo môn học cụ thể
 * @param {number} userId - ID người dùng
 * @param {number} subjectId - ID môn học
 * @returns {Promise<Array>} Lịch học của môn
 */
async function getTKBBySubject(userId, subjectId) {
    if (!userId) throw new Error('userId là bắt buộc');
    if (!subjectId) throw new Error('subjectId là bắt buộc');
    return await executeProcedure('dbo.sp_GetTKBBySubject', { 
        userId: parseInt(userId, 10),
        subjectId: parseInt(subjectId, 10)
    });
}

/**
 * Kiểm tra các lớp học bị trùng lịch của sinh viên
 * @param {number} userId - ID người dùng
 * @returns {Promise<Array>} Danh sách các cặp lớp học bị xung đột
 */
async function checkTimetableConflicts(userId) {
    if (!userId) throw new Error('userId là bắt buộc');
    return await executeProcedure('dbo.sp_CheckTimetableConflicts', { userId: parseInt(userId, 10) });
}

module.exports = {
    getTKB,
    getTKBByDate,
    getTKBByWeek,
    getTKBBySubject,
    checkTimetableConflicts
};
