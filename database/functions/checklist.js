/**
 * database/functions/checklist.js
 * Quản lý checklist / To-Do cá nhân của sinh viên
 */

const { executeProcedure } = require('../connection/db');

/**
 * Lấy danh sách checklist của sinh viên
 * @param {number} userId - ID người dùng
 * @returns {Promise<Array>} Danh sách checklist
 */
async function getChecklist(userId) {
    if (!userId) throw new Error('userId là bắt buộc');
    return await executeProcedure('dbo.sp_GetChecklist', { userId: parseInt(userId, 10) });
}

/**
 * Tạo mới một task trong checklist
 * @param {Object} data - { userId, subjectId, assignmentId, title, description, priority, deadline }
 * @returns {Promise<Object>} Task vừa tạo
 */
async function createChecklist(data) {
    if (!data.userId || !data.title) {
        throw new Error('userId và title là bắt buộc');
    }
    const records = await executeProcedure('dbo.sp_CreateChecklist', {
        userId: parseInt(data.userId, 10),
        subjectId: data.subjectId ? parseInt(data.subjectId, 10) : null,
        assignmentId: data.assignmentId ? parseInt(data.assignmentId, 10) : null,
        title: data.title,
        description: data.description || null,
        priority: data.priority || 'MEDIUM',
        deadline: data.deadline || null
    });
    return records.length > 0 ? records[0] : null;
}

/**
 * Cập nhật task trong checklist
 * @param {number} checklistId - ID task
 * @param {Object} data - { title, description, priority, deadline }
 * @returns {Promise<Object>} Task sau cập nhật
 */
async function updateChecklist(checklistId, data) {
    if (!checklistId) throw new Error('checklistId là bắt buộc');
    const records = await executeProcedure('dbo.sp_UpdateChecklist', {
        checklistId: parseInt(checklistId, 10),
        title: data.title,
        description: data.description || null,
        priority: data.priority || 'MEDIUM',
        deadline: data.deadline || null
    });
    return records.length > 0 ? records[0] : null;
}

/**
 * Đánh dấu hoàn thành hoặc chưa hoàn thành checklist
 * @param {number} checklistId - ID task
 * @param {boolean} isCompleted - true/false
 * @returns {Promise<Object>} Task sau khi cập nhật
 */
async function completeChecklist(checklistId, isCompleted = true) {
    if (!checklistId) throw new Error('checklistId là bắt buộc');
    const records = await executeProcedure('dbo.sp_CompleteChecklist', {
        checklistId: parseInt(checklistId, 10),
        isCompleted: isCompleted ? 1 : 0
    });
    return records.length > 0 ? records[0] : null;
}

/**
 * Xóa một task checklist
 * @param {number} checklistId - ID task
 * @returns {Promise<boolean>} Kết quả xóa
 */
async function deleteChecklist(checklistId) {
    if (!checklistId) throw new Error('checklistId là bắt buộc');
    const records = await executeProcedure('dbo.sp_DeleteChecklist', { checklistId: parseInt(checklistId, 10) });
    return records.length > 0 && records[0].success === 1;
}

module.exports = {
    getChecklist,
    createChecklist,
    updateChecklist,
    completeChecklist,
    deleteChecklist
};
