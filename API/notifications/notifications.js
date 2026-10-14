/**
 * API/notifications/notifications.js
 * ===================================================================================
 * MODULE NHẮC NHỞ THÔNG MINH ĐA TẦNG (Chức năng 4)
 * ===================================================================================
 * Controller logic cho hệ thống nhắc nhở tự động đa tầng (7d, 3d, 24h, 12h, 1h).
 * ===================================================================================
 */

/**
 * Lấy toàn bộ danh sách nhắc nhở của sinh viên.
 */
async function layDanhSachNhacNho(db, userId) {
    return await db.layDanhSachNhacNho(userId);
}

/**
 * Đếm số nhắc nhở chưa được gửi (dùng cho badge chuông trên topbar).
 * Logic: đếm records chưa is_sent và remind_time <= NOW
 */
async function demNhacNhoChuaDoc(db, userId) {
    const all = await db.layDanhSachNhacNho(userId);
    const now = new Date();
    const unread = all.filter(r => !r.is_sent && new Date(r.remind_time) <= now);
    return unread.length;
}

/**
 * Tạo nhắc nhở đơn lẻ tùy chỉnh.
 * @param {Object} data - { targetType, targetId, title, message?, tier?, remindTime, channel? }
 */
async function taoNhacNho(db, userId, data) {
    if (!data || !data.targetType || !data.targetId || !data.title || !data.remindTime) {
        throw Object.assign(
            new Error('targetType, targetId, title và remindTime là bắt buộc.'),
            { statusCode: 400 }
        );
    }
    return await db.taoNhacNho(userId, data);
}

/**
 * Tạo bộ nhắc nhở đa tầng tự động cho bài tập hoặc kỳ thi.
 * @param {string} targetType - 'ASSIGNMENT' | 'EXAM' | 'STUDY_PLAN'
 * @param {number} targetId
 * @param {string} title
 * @param {string} deadline - ISO datetime
 * @param {string} channel - 'APP' | 'EMAIL' | 'NOTIFICATION'
 */
async function taoNhacNhoDaTang(db, userId, targetType, targetId, title, deadline, channel = 'APP') {
    if (!targetType || !targetId || !title || !deadline) {
        throw Object.assign(
            new Error('targetType, targetId, title và deadline là bắt buộc.'),
            { statusCode: 400 }
        );
    }
    return await db.taoNhacNhoDaTang(userId, targetType, targetId, title, deadline, channel);
}

/**
 * Đánh dấu một nhắc nhở là đã đọc / đã gửi.
 * @param {number} reminderId
 */
async function danhDauDaDoc(db, reminderId) {
    if (!reminderId) throw Object.assign(new Error('reminderId là bắt buộc.'), { statusCode: 400 });
    return await db.danhDauDaGuiNhacNho(reminderId);
}

/**
 * Xóa nhắc nhở.
 * @param {number} reminderId
 */
async function xoaNhacNho(db, reminderId) {
    if (!reminderId) throw Object.assign(new Error('reminderId là bắt buộc.'), { statusCode: 400 });
    return await db.xoaNhacNho(reminderId);
}

/**
 * Quét danh sách nhắc nhở đến hạn gửi (dành cho Cron Job background worker).
 * Không yêu cầu userId — quét toàn bộ hệ thống.
 */
async function quetNhacNhoDenHan(db) {
    return await db.layNhacNhoDenHanChuaGui();
}

module.exports = {
    layDanhSachNhacNho,
    demNhacNhoChuaDoc,
    taoNhacNho,
    taoNhacNhoDaTang,
    danhDauDaDoc,
    xoaNhacNho,
    quetNhacNhoDenHan
};
