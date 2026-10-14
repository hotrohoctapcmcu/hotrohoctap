/**
 * database/functions/lms.js
 * Quản lý dữ liệu LMS (Bài tập, deadline do giảng viên giao)
 */

const { executeProcedure } = require('../connection/db');

/**
 * Lấy tổng hợp thông tin LMS của môn học
 * @param {number} userId - ID người dùng
 * @param {number} subjectId - ID môn học
 * @returns {Promise<Array>} Danh sách bài tập LMS của môn
 */
async function getLms(userId, subjectId) {
    if (!userId || !subjectId) throw new Error('userId và subjectId là bắt buộc');
    return await executeProcedure('dbo.sp_GetLms', {
        userId: parseInt(userId, 10),
        subjectId: parseInt(subjectId, 10)
    });
}

/**
 * Lấy danh sách bài tập LMS theo môn
 * @param {number} userId - ID người dùng
 * @param {number} subjectId - ID môn học
 * @returns {Promise<Array>} Danh sách bài tập LMS
 */
async function getLmsAssignments(userId, subjectId) {
    if (!userId || !subjectId) throw new Error('userId và subjectId là bắt buộc');
    return await executeProcedure('dbo.sp_GetLmsAssignments', {
        userId: parseInt(userId, 10),
        subjectId: parseInt(subjectId, 10)
    });
}

module.exports = {
    getLms,
    getLmsAssignments
};
