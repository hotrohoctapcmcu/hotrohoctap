/**
 * database/functions/user.js
 * Quản lý thông tin tài khoản người dùng và hồ sơ sinh viên
 */

const { executeProcedure, executeQuery } = require('../connection/db');

/**
 * Lấy thông tin tài khoản người dùng theo user_id
 * @param {number} userId - ID người dùng
 * @returns {Promise<Object|null>} Thông tin tài khoản hoặc null nếu không tìm thấy
 */
async function getUserById(userId) {
    if (!userId) throw new Error('userId là bắt buộc');
    const records = await executeProcedure('dbo.sp_GetUserById', { userId: parseInt(userId, 10) });
    return records.length > 0 ? records[0] : null;
}

/**
 * Lấy hồ sơ học tập cá nhân tổng hợp (Profile)
 * @param {number} userId - ID người dùng hoặc student_id
 * @returns {Promise<Object|null>} Hồ sơ sinh viên, điểm GPA, tín chỉ, trạng thái
 */
async function getUserProfile(userId) {
    if (!userId) throw new Error('userId là bắt buộc');
    const records = await executeProcedure('dbo.sp_GetUserProfile', { userId: parseInt(userId, 10) });
    return records.length > 0 ? records[0] : null;
}

/**
 * Lấy thông tin sinh viên theo user_id
 * @param {number} userId - ID người dùng
 * @returns {Promise<Object|null>} Thông tin chi tiết sinh viên (Mã SV, Họ tên, Ngành học...)
 */
async function getStudentInfo(userId) {
    if (!userId) throw new Error('userId là bắt buộc');
    const records = await executeProcedure('dbo.sp_GetStudentInfo', { userId: parseInt(userId, 10) });
    return records.length > 0 ? records[0] : null;
}

module.exports = {
    getUserById,
    getUserProfile,
    getStudentInfo
};
