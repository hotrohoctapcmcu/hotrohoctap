/**
 * database/functions/exam.js
 * Quản lý lịch thi, đếm ngược ngày thi và kế hoạch ôn tập
 */

const { executeProcedure } = require('../connection/db');

/**
 * Lấy toàn bộ lịch thi của sinh viên
 * @param {number} userId - ID người dùng
 * @returns {Promise<Array>} Danh sách các môn thi
 */
async function getLichThi(userId) {
    if (!userId) throw new Error('userId là bắt buộc');
    return await executeProcedure('dbo.sp_GetLichThi', { userId: parseInt(userId, 10) });
}

/**
 * Lấy danh sách các kỳ thi sắp tới (tính từ ngày hiện tại trở đi)
 * @param {number} userId - ID người dùng
 * @returns {Promise<Array>} Lịch thi sắp tới kèm ngày đếm ngược
 */
async function getUpcomingExams(userId) {
    if (!userId) throw new Error('userId là bắt buộc');
    return await executeProcedure('dbo.sp_GetUpcomingExams', { userId: parseInt(userId, 10) });
}

/**
 * Lấy thông tin lịch thi theo môn học cụ thể
 * @param {number} userId - ID người dùng
 * @param {number} subjectId - ID môn học
 * @returns {Promise<Array>} Lịch thi môn tương ứng
 */
async function getExamBySubject(userId, subjectId) {
    if (!userId) throw new Error('userId là bắt buộc');
    if (!subjectId) throw new Error('subjectId là bắt buộc');
    return await executeProcedure('dbo.sp_GetExamBySubject', { 
        userId: parseInt(userId, 10),
        subjectId: parseInt(subjectId, 10)
    });
}

module.exports = {
    getLichThi,
    getUpcomingExams,
    getExamBySubject
};
