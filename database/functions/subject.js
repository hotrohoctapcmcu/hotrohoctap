/**
 * database/functions/subject.js
 * Quản lý môn học, danh sách môn học sinh viên và trạng thái
 */

const { executeProcedure } = require('../connection/db');

/**
 * Lấy danh sách tất cả môn học của sinh viên (đã học, đang học, dự kiến học)
 * Có thể map về dạng boolean object { "Nhap_mon_CNTT": true, ... } hoặc mảng danh sách chi tiết
 * @param {number} userId - ID người dùng
 * @returns {Promise<Array>} Danh sách môn học kèm trạng thái
 */
async function getListMon(userId) {
    if (!userId) throw new Error('userId là bắt buộc');
    return await executeProcedure('dbo.sp_GetListMon', { userId: parseInt(userId, 10) });
}

/**
 * Lấy chi tiết thông tin một môn học theo subject_id
 * @param {number} subjectId - ID môn học
 * @returns {Promise<Object|null>} Thông tin môn học hoặc null
 */
async function getSubjectById(subjectId) {
    if (!subjectId) throw new Error('subjectId là bắt buộc');
    const records = await executeProcedure('dbo.sp_GetSubjectById', { subjectId: parseInt(subjectId, 10) });
    return records.length > 0 ? records[0] : null;
}

/**
 * Lấy danh sách các môn mà sinh viên đang học hoặc đã học
 * @param {number} userId - ID người dùng
 * @returns {Promise<Array>} Danh sách môn đã/đang học
 */
async function getSubjectsByUser(userId) {
    if (!userId) throw new Error('userId là bắt buộc');
    return await executeProcedure('dbo.sp_GetSubjectsByUser', { userId: parseInt(userId, 10) });
}

module.exports = {
    getListMon,
    getSubjectById,
    getSubjectsByUser
};
