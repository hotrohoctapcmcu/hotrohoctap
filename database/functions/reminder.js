/**
 * database/functions/reminder.js
 * Quản lý hệ thống nhắc nhở thông minh đa tầng (7 ngày, 3 ngày, 24 giờ, quá hạn)
 */

const { executeProcedure } = require('../connection/db');

/**
 * Lấy toàn bộ danh sách nhắc nhở của sinh viên
 * @param {number} userId - ID người dùng
 * @returns {Promise<Array>} Danh sách các nhắc nhở
 */
async function getReminders(userId) {
    if (!userId) throw new Error('userId là bắt buộc');
    return await executeProcedure('dbo.sp_GetReminders', { userId: parseInt(userId, 10) });
}

/**
 * Tạo mới một nhắc nhở
 * @param {Object} data - { userId, targetType, targetId, title, message, tier, remindTime, channel }
 * @returns {Promise<Object>} Nhắc nhở vừa tạo
 */
async function createReminder(data) {
    if (!data.userId || !data.targetType || !data.targetId || !data.title || !data.remindTime) {
        throw new Error('userId, targetType, targetId, title và remindTime là bắt buộc');
    }
    const records = await executeProcedure('dbo.sp_CreateReminder', {
        userId: parseInt(data.userId, 10),
        targetType: data.targetType,
        targetId: parseInt(data.targetId, 10),
        title: data.title,
        message: data.message || null,
        tier: data.tier || 'CUSTOM',
        remindTime: data.remindTime,
        channel: data.channel || 'APP'
    });
    return records.length > 0 ? records[0] : null;
}

/**
 * Cập nhật thông tin nhắc nhở
 * @param {number} reminderId - ID nhắc nhở
 * @param {Object} data - { title, remindTime }
 * @returns {Promise<Object>} Nhắc nhở sau cập nhật
 */
async function updateReminder(reminderId, data) {
    if (!reminderId) throw new Error('reminderId là bắt buộc');
    const records = await executeProcedure('dbo.sp_UpdateReminder', {
        reminderId: parseInt(reminderId, 10),
        title: data.title,
        remindTime: data.remindTime
    });
    return records.length > 0 ? records[0] : null;
}

/**
 * Đánh dấu nhắc nhở đã được gửi thông báo thành công
 * @param {number} reminderId - ID nhắc nhở
 * @returns {Promise<Object>} Nhắc nhở sau khi đánh dấu
 */
async function markReminderAsSent(reminderId) {
    if (!reminderId) throw new Error('reminderId là bắt buộc');
    const records = await executeProcedure('dbo.sp_MarkReminderAsSent', { reminderId: parseInt(reminderId, 10) });
    return records.length > 0 ? records[0] : null;
}

/**
 * Xóa nhắc nhở
 * @param {number} reminderId - ID nhắc nhở
 * @returns {Promise<boolean>} Kết quả xóa
 */
async function deleteReminder(reminderId) {
    if (!reminderId) throw new Error('reminderId là bắt buộc');
    const records = await executeProcedure('dbo.sp_DeleteReminder', { reminderId: parseInt(reminderId, 10) });
    return records.length > 0 && records[0].success === 1;
}

module.exports = {
    getReminders,
    createReminder,
    updateReminder,
    markReminderAsSent,
    deleteReminder
};
