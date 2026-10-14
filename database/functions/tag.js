/**
 * database/functions/tag.js
 * Quản lý thẻ Tag và tìm kiếm đa năng N-N (cho tài liệu, bài học, bài tập)
 */

const { executeProcedure } = require('../connection/db');

/**
 * Tìm kiếm tài liệu, môn học theo từ khóa hoặc nhãn
 * @param {number} userId - ID người dùng
 * @param {string} keyword - Từ khóa tìm kiếm
 * @returns {Promise<Array>} Danh sách tài liệu tìm được
 */
async function searchDocuments(userId, keyword) {
    if (!keyword) throw new Error('keyword là bắt buộc');
    return await executeProcedure('dbo.sp_SearchDocuments', {
        userId: userId ? parseInt(userId, 10) : null,
        keyword: keyword
    });
}

/**
 * Lấy danh sách tài liệu theo ID nhãn Tag
 * @param {number} userId - ID người dùng
 * @param {number} tagId - ID thẻ tag
 * @returns {Promise<Array>} Danh sách tài liệu có gắn tag
 */
async function getDocumentsByTag(userId, tagId) {
    if (!tagId) throw new Error('tagId là bắt buộc');
    return await executeProcedure('dbo.sp_GetDocumentsByTag', {
        userId: userId ? parseInt(userId, 10) : null,
        tagId: parseInt(tagId, 10)
    });
}

/**
 * Gắn nhãn tag cho một tài liệu hoặc thực thể
 * @param {number} documentId - ID tài liệu / thực thể
 * @param {number} tagId - ID thẻ tag
 * @param {string} [entityType='MATERIAL'] - Loại thực thể: 'MATERIAL', 'ASSIGNMENT', 'LESSON', 'CHECKLIST'
 * @returns {Promise<boolean>} Kết quả gắn
 */
async function addTagToDocument(documentId, tagId, entityType = 'MATERIAL') {
    if (!documentId || !tagId) throw new Error('documentId và tagId là bắt buộc');
    const records = await executeProcedure('dbo.sp_AddTagToEntity', {
        tagId: parseInt(tagId, 10),
        entityType: entityType,
        entityId: parseInt(documentId, 10)
    });
    return records.length > 0 && records[0].success === 1;
}

/**
 * Gỡ nhãn tag khỏi tài liệu hoặc thực thể
 * @param {number} documentId - ID tài liệu / thực thể
 * @param {number} tagId - ID thẻ tag
 * @param {string} [entityType='MATERIAL'] - Loại thực thể
 * @returns {Promise<boolean>} Kết quả gỡ
 */
async function removeTagFromDocument(documentId, tagId, entityType = 'MATERIAL') {
    if (!documentId || !tagId) throw new Error('documentId và tagId là bắt buộc');
    const records = await executeProcedure('dbo.sp_RemoveTagFromEntity', {
        tagId: parseInt(tagId, 10),
        entityType: entityType,
        entityId: parseInt(documentId, 10)
    });
    return records.length > 0 && records[0].success === 1;
}

module.exports = {
    searchDocuments,
    getDocumentsByTag,
    addTagToDocument,
    removeTagFromDocument
};
