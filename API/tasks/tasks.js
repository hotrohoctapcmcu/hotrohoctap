/**
 * API/tasks/tasks.js
 * ===================================================================================
 * MODULE QUẢN LÝ DEADLINE & CHECKLIST (Chức năng 3)
 * ===================================================================================
 * Controller logic cho toàn bộ thao tác bài tập và checklist cá nhân.
 * ===================================================================================
 */

// ─── Assignments (Bài tập từ giảng viên / LMS) ───────────────────────────────

/**
 * Lấy toàn bộ danh sách bài tập / deadline.
 * @param {string|null} status - 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | null
 */
async function layDanhSachBaiTap(db, userId, status = null) {
    return await db.layDanhSachDeadline(userId, status);
}

/**
 * Lấy các deadline sắp đến hạn trong vòng N ngày.
 * @param {number} soNgay - Số ngày đếm tới (mặc định 3)
 */
async function layDeadlineSapToi(db, userId, soNgay = 3) {
    return await db.layDeadlineSapToi(userId, parseInt(soNgay, 10));
}

/**
 * Tạo bài tập mới — Trigger DB sẽ tự sinh nhắc nhở 3 ngày, 24 giờ, 1 giờ.
 * @param {Object} data - { subjectId, title, description, deadline, source, submissionUrl, externalId }
 */
async function themBaiTap(db, userId, data) {
    if (!data || !data.subjectId || !data.title || !data.deadline) {
        throw Object.assign(new Error('subjectId, title và deadline là bắt buộc.'), { statusCode: 400 });
    }
    return await db.themBaiTap(userId, data);
}

/**
 * Cập nhật thông tin bài tập (tiêu đề, mô tả, deadline).
 * @param {number} assignmentId
 * @param {Object} data - { title?, description?, deadline? }
 */
async function capNhatBaiTap(db, assignmentId, data) {
    if (!assignmentId) throw Object.assign(new Error('assignmentId là bắt buộc.'), { statusCode: 400 });
    return await db.capNhatBaiTap(assignmentId, data);
}

/**
 * Đổi trạng thái bài tập.
 * @param {number} assignmentId
 * @param {string} status - 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE'
 */
async function capNhatTrangThaiBaiTap(db, assignmentId, status) {
    const valid = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE'];
    if (!assignmentId || !status) {
        throw Object.assign(new Error('assignmentId và status là bắt buộc.'), { statusCode: 400 });
    }
    if (!valid.includes(status)) {
        throw Object.assign(new Error(`status phải là một trong: ${valid.join(', ')}`), { statusCode: 400 });
    }
    return await db.capNhatTrangThaiBaiTap(assignmentId, status);
}

/**
 * Xóa bài tập và nhắc nhở liên quan.
 * @param {number} assignmentId
 */
async function xoaBaiTap(db, assignmentId) {
    if (!assignmentId) throw Object.assign(new Error('assignmentId là bắt buộc.'), { statusCode: 400 });
    return await db.xoaBaiTap(assignmentId);
}

// ─── Checklists (To-do list cá nhân) ─────────────────────────────────────────

/**
 * Lấy checklist công việc cá nhân.
 */
async function layChecklist(db, userId) {
    return await db.layChecklist(userId);
}

/**
 * Thêm công việc mới vào checklist.
 * @param {Object} data - { title, description?, priority?, deadline?, subjectId?, assignmentId? }
 */
async function themChecklist(db, userId, data) {
    if (!data || !data.title) {
        throw Object.assign(new Error('title là bắt buộc.'), { statusCode: 400 });
    }
    return await db.themChecklist(userId, data);
}

/**
 * Cập nhật nội dung task checklist.
 * @param {number} checklistId
 * @param {Object} data - { title?, description?, priority?, deadline? }
 */
async function capNhatChecklist(db, checklistId, data) {
    if (!checklistId) throw Object.assign(new Error('checklistId là bắt buộc.'), { statusCode: 400 });
    return await db.capNhatChecklist(checklistId, data);
}

/**
 * Đánh dấu hoàn thành / chưa hoàn thành task checklist.
 * @param {number} checklistId
 * @param {boolean} isCompleted
 */
async function hoanThanhChecklist(db, checklistId, isCompleted = true) {
    if (!checklistId) throw Object.assign(new Error('checklistId là bắt buộc.'), { statusCode: 400 });
    return await db.hoanThanhChecklist(checklistId, isCompleted);
}

/**
 * Xóa task checklist.
 * @param {number} checklistId
 */
async function xoaChecklist(db, checklistId) {
    if (!checklistId) throw Object.assign(new Error('checklistId là bắt buộc.'), { statusCode: 400 });
    return await db.xoaChecklist(checklistId);
}

module.exports = {
    layDanhSachBaiTap,
    layDeadlineSapToi,
    themBaiTap,
    capNhatBaiTap,
    capNhatTrangThaiBaiTap,
    xoaBaiTap,
    layChecklist,
    themChecklist,
    capNhatChecklist,
    hoanThanhChecklist,
    xoaChecklist
};
