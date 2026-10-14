/**
 * database/functions/edux.js
 * Quản lý kho tài liệu, chương, bài học và slide môn học từ Edux
 */

const { executeProcedure } = require('../connection/db');

/**
 * Lấy toàn bộ cây nội dung Edux của môn học (Chương -> Bài học -> Tài liệu/Slide)
 * @param {number} userId - ID người dùng
 * @param {number} subjectId - ID môn học
 * @returns {Promise<Array>} Cây tài liệu Edux
 */
async function getEdux(userId, subjectId) {
    if (!subjectId) throw new Error('subjectId là bắt buộc');
    return await executeProcedure('dbo.sp_GetEdux', {
        userId: userId ? parseInt(userId, 10) : null,
        subjectId: parseInt(subjectId, 10)
    });
}

/**
 * Lấy danh sách các chương của môn học
 * @param {number} subjectId - ID môn học
 * @returns {Promise<Array>} Danh sách chương
 */
async function getChapters(subjectId) {
    if (!subjectId) throw new Error('subjectId là bắt buộc');
    return await executeProcedure('dbo.sp_GetChapters', { subjectId: parseInt(subjectId, 10) });
}

/**
 * Lấy danh sách bài học thuộc các chương của môn học
 * @param {number} subjectId - ID môn học
 * @returns {Promise<Array>} Danh sách bài học
 */
async function getLessons(subjectId) {
    if (!subjectId) throw new Error('subjectId là bắt buộc');
    return await executeProcedure('dbo.sp_GetLessons', { subjectId: parseInt(subjectId, 10) });
}

/**
 * Lấy danh sách tài liệu, slide, textbook của môn học
 * @param {number} subjectId - ID môn học
 * @returns {Promise<Array>} Danh sách tài liệu
 */
async function getDocuments(subjectId) {
    if (!subjectId) throw new Error('subjectId là bắt buộc');
    return await executeProcedure('dbo.sp_GetDocuments', { subjectId: parseInt(subjectId, 10) });
}

module.exports = {
    getEdux,
    getChapters,
    getLessons,
    getDocuments
};
