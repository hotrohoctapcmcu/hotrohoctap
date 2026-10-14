/**
 * database/functions/grade.js
 * Quản lý bảng điểm, điểm theo học kỳ, môn đạt, môn trượt và học lại
 */

const { executeProcedure } = require('../connection/db');

/**
 * Lấy toàn bộ bảng điểm của sinh viên (bao gồm môn đạt, trượt, học lại)
 * @param {number} userId - ID người dùng
 * @returns {Promise<Array>} Toàn bộ bảng điểm
 */
async function getBangDiem(userId) {
    if (!userId) throw new Error('userId là bắt buộc');
    return await executeProcedure('dbo.sp_GetBangDiem', { userId: parseInt(userId, 10) });
}

/**
 * Lấy bảng điểm của sinh viên theo học kỳ cụ thể
 * @param {number} userId - ID người dùng
 * @param {string} semesterId - Mã học kỳ (e.g. 'ky_1', 'ky_2')
 * @returns {Promise<Array>} Bảng điểm của học kỳ
 */
async function getGradesBySemester(userId, semesterId) {
    if (!userId) throw new Error('userId là bắt buộc');
    return await executeProcedure('dbo.sp_GetGradesBySemester', { 
        userId: parseInt(userId, 10),
        semester: semesterId || null
    });
}

/**
 * Lấy danh sách các môn chưa đạt (F) cần học lại
 * @param {number} userId - ID người dùng
 * @returns {Promise<Array>} Danh sách môn trượt
 */
async function getFailedSubjects(userId) {
    if (!userId) throw new Error('userId là bắt buộc');
    return await executeProcedure('dbo.sp_GetFailedSubjects', { userId: parseInt(userId, 10) });
}

/**
 * Lấy danh sách các môn đã hoàn thành đạt yêu cầu
 * @param {number} userId - ID người dùng
 * @returns {Promise<Array>} Danh sách môn đạt
 */
async function getPassedSubjects(userId) {
    if (!userId) throw new Error('userId là bắt buộc');
    return await executeProcedure('dbo.sp_GetPassedSubjects', { userId: parseInt(userId, 10) });
}

module.exports = {
    getBangDiem,
    getGradesBySemester,
    getFailedSubjects,
    getPassedSubjects
};
