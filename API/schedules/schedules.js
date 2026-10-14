/**
 * API/schedules/schedules.js
 * ===================================================================================
 * MODULE THỜI KHÓA BIỂU (Chức năng 1 — SMART TIMETABLE)
 * ===================================================================================
 * Controller logic cho các thao tác xem, thêm, xóa tiết học chính khóa.
 * ===================================================================================
 */

/**
 * Lấy toàn bộ thời khóa biểu.
 * Frontend dùng để hiển thị lưới tuần / lịch tháng.
 */
async function layThoiKhoaBieu(db, userId) {
    return await db.layThoiKhoaBieu(userId);
}

/**
 * Lấy thời khóa biểu theo ngày cụ thể.
 * @param {string} ngay - Ngày ISO (YYYY-MM-DD)
 */
async function layTheoNgay(db, userId, ngay) {
    if (!ngay) throw Object.assign(new Error('Tham số ngay là bắt buộc (YYYY-MM-DD).'), { statusCode: 400 });
    return await db.layThoiKhoaBieuTheoNgay(userId, ngay);
}

/**
 * Lấy thời khóa biểu theo tuần (từ ngày — đến ngày).
 * @param {string} tuNgay - YYYY-MM-DD
 * @param {string} denNgay - YYYY-MM-DD
 */
async function layTheoTuan(db, userId, tuNgay, denNgay) {
    if (!tuNgay || !denNgay) {
        throw Object.assign(new Error('tuNgay và denNgay là bắt buộc (YYYY-MM-DD).'), { statusCode: 400 });
    }
    return await db.layThoiKhoaBieuTheoTuan(userId, tuNgay, denNgay);
}

/**
 * Thêm tiết học thủ công vào thời khóa biểu.
 * @param {Object} data - { subjectId, className, room, dayOfWeek, startTime, endTime, ... }
 */
async function themTietHoc(db, userId, data) {
    if (!data || !data.subjectId || !data.className || !data.room) {
        throw Object.assign(new Error('subjectId, className và room là bắt buộc.'), { statusCode: 400 });
    }
    return await db.themTietHoc(userId, data);
}

/**
 * Xóa tiết học khỏi thời khóa biểu.
 * @param {number} timetableId
 */
async function xoaTietHoc(db, timetableId) {
    if (!timetableId) throw Object.assign(new Error('timetableId là bắt buộc.'), { statusCode: 400 });
    return await db.xoaTietHoc(timetableId);
}

module.exports = { layThoiKhoaBieu, layTheoNgay, layTheoTuan, themTietHoc, xoaTietHoc };
