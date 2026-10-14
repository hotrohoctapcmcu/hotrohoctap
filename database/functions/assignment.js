/**
 * database/functions/assignment.js
 * Quản lý bài tập do giảng viên giao, deadline, trạng thái và nhắc nhở
 */

const { executeProcedure } = require('../connection/db');

/**
 * Lấy danh sách toàn bộ bài tập của sinh viên
 * @param {number} userId - ID người dùng
 * @returns {Promise<Array>} Danh sách bài tập
 */
async function getAssignments(userId) {
    if (!userId) throw new Error('userId là bắt buộc');
    return await executeProcedure('dbo.sp_GetAssignments', { userId: parseInt(userId, 10) });
}

/**
 * Lấy chi tiết một bài tập theo assignment_id
 * @param {number} assignmentId - ID bài tập
 * @returns {Promise<Object|null>} Thông tin bài tập hoặc null
 */
async function getAssignmentById(assignmentId) {
    if (!assignmentId) throw new Error('assignmentId là bắt buộc');
    const records = await executeProcedure('dbo.sp_GetAssignmentById', { assignmentId: parseInt(assignmentId, 10) });
    return records.length > 0 ? records[0] : null;
}

/**
 * Lấy các bài tập sắp đến hạn (trong vòng 3 ngày tới)
 * @param {number} userId - ID người dùng
 * @returns {Promise<Array>} Danh sách bài tập sắp đến hạn
 */
async function getUpcomingAssignments(userId) {
    if (!userId) throw new Error('userId là bắt buộc');
    return await executeProcedure('dbo.sp_GetUpcomingAssignments', { userId: parseInt(userId, 10) });
}

/**
 * Lấy các bài tập đã quá hạn
 * @param {number} userId - ID người dùng
 * @returns {Promise<Array>} Danh sách bài tập quá hạn
 */
async function getOverdueAssignments(userId) {
    if (!userId) throw new Error('userId là bắt buộc');
    return await executeProcedure('dbo.sp_GetOverdueAssignments', { userId: parseInt(userId, 10) });
}

/**
 * Lấy các bài tập chưa hoàn thành (PENDING, IN_PROGRESS, OVERDUE)
 * @param {number} userId - ID người dùng
 * @returns {Promise<Array>} Danh sách bài tập chưa hoàn thành
 */
async function getIncompleteAssignments(userId) {
    if (!userId) throw new Error('userId là bắt buộc');
    return await executeProcedure('dbo.sp_GetIncompleteAssignments', { userId: parseInt(userId, 10) });
}

/**
 * Tạo mới một bài tập (kèm tự động sinh các Reminder đa tầng)
 * @param {Object} data - { userId, subjectId, title, description, deadline, source, externalId }
 * @returns {Promise<Object>} Bài tập vừa được tạo
 */
async function createAssignment(data) {
    if (!data.userId || !data.subjectId || !data.title || !data.deadline) {
        throw new Error('userId, subjectId, title và deadline là bắt buộc');
    }
    const records = await executeProcedure('dbo.sp_CreateAssignment', {
        userId: parseInt(data.userId, 10),
        subjectId: parseInt(data.subjectId, 10),
        title: data.title,
        description: data.description || null,
        deadline: data.deadline,
        source: data.source || 'LMS',
        externalId: data.externalId || null
    });
    return records.length > 0 ? records[0] : null;
}

/**
 * Cập nhật thông tin bài tập
 * @param {number} assignmentId - ID bài tập
 * @param {Object} data - { title, description, deadline, status }
 * @returns {Promise<Object>} Bài tập sau cập nhật
 */
async function updateAssignment(assignmentId, data) {
    if (!assignmentId) throw new Error('assignmentId là bắt buộc');
    const records = await executeProcedure('dbo.sp_UpdateAssignment', {
        assignmentId: parseInt(assignmentId, 10),
        title: data.title,
        description: data.description || null,
        deadline: data.deadline,
        status: data.status || 'PENDING'
    });
    return records.length > 0 ? records[0] : null;
}

/**
 * Cập nhật trạng thái bài tập (PENDING, IN_PROGRESS, COMPLETED, OVERDUE)
 * @param {number} assignmentId - ID bài tập
 * @param {string} status - Trạng thái mới
 * @returns {Promise<Object>} Bài tập sau cập nhật
 */
async function updateAssignmentStatus(assignmentId, status) {
    if (!assignmentId || !status) throw new Error('assignmentId và status là bắt buộc');
    const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE'];
    if (!validStatuses.includes(status)) {
        throw new Error(`Trạng thái không hợp lệ. Cho phép: ${validStatuses.join(', ')}`);
    }
    const records = await executeProcedure('dbo.sp_UpdateAssignmentStatus', {
        assignmentId: parseInt(assignmentId, 10),
        status: status
    });
    return records.length > 0 ? records[0] : null;
}

/**
 * Xóa một bài tập và các liên kết phụ thuộc
 * @param {number} assignmentId - ID bài tập
 * @returns {Promise<boolean>} Kết quả xóa
 */
async function deleteAssignment(assignmentId) {
    if (!assignmentId) throw new Error('assignmentId là bắt buộc');
    const records = await executeProcedure('dbo.sp_DeleteAssignment', { assignmentId: parseInt(assignmentId, 10) });
    return records.length > 0 && records[0].success === 1;
}

module.exports = {
    getAssignments,
    getAssignmentById,
    getUpcomingAssignments,
    getOverdueAssignments,
    getIncompleteAssignments,
    createAssignment,
    updateAssignment,
    updateAssignmentStatus,
    deleteAssignment
};
