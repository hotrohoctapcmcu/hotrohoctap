/**
 * API/schedules/conflicts.js
 * ===================================================================================
 * MODULE CẢNH BÁO TRÙNG LỊCH VÀ XẾP LỊCH TỰ HỌC
 * (Chức năng 2 — AI SCHEDULING & CONFLICT ALERT)
 * ===================================================================================
 * Controller logic cho:
 *  - Kiểm tra trùng lịch chính khóa
 *  - Xếp lịch tự học mới (có check trùng)
 *  - AI tìm khung giờ trống để gợi ý
 * ===================================================================================
 */

/**
 * Kiểm tra và trả về các cặp lớp học chính khóa bị trùng khung giờ.
 * Frontend dùng để render banner đỏ và tô màu ô bị xung đột.
 */
async function kiemTraTrungLichChinhKhoa(db, userId) {
    return await db.kiemTraTrungLich(userId);
}

/**
 * Kiểm tra xem một khung giờ tự học dự kiến có bị trùng với TKB hoặc lịch tự học khác không.
 * Frontend dùng khi người dùng chọn giờ trong form "Xếp lịch tự học".
 * @param {string} studyDate - YYYY-MM-DD
 * @param {string} startTime - HH:MM
 * @param {string} endTime - HH:MM
 * @param {number|null} excludeScheduleId - Bỏ qua record đang cập nhật
 */
async function kiemTraXungDot(db, userId, studyDate, startTime, endTime, excludeScheduleId = null) {
    if (!studyDate || !startTime || !endTime) {
        throw Object.assign(new Error('studyDate, startTime và endTime là bắt buộc.'), { statusCode: 400 });
    }
    return await db.kiemTraXungDotLichTuHoc(userId, studyDate, startTime, endTime, excludeScheduleId);
}

/**
 * Tìm các khung giờ trống trong ngày (AI Slot Finder).
 * @param {string} ngay - YYYY-MM-DD
 * @param {number} thoiLuong - Số phút tối thiểu của slot (mặc định 60)
 */
async function timKhoangTrong(db, userId, ngay, thoiLuong = 60) {
    if (!ngay) throw Object.assign(new Error('ngay là bắt buộc.'), { statusCode: 400 });
    return await db.timKhoangTrongTuHoc(userId, ngay, parseInt(thoiLuong, 10));
}

/**
 * Lưu lịch tự học mới (tự động kiểm tra trùng trước).
 * @param {Object} data - { subjectId, title, studyDate, startTime, endTime, isAiSuggested, notes, forceSave }
 */
async function xepLichTuHoc(db, userId, data) {
    if (!data || !data.title || !data.studyDate || !data.startTime || !data.endTime) {
        throw Object.assign(
            new Error('title, studyDate, startTime và endTime là bắt buộc.'),
            { statusCode: 400 }
        );
    }
    return await db.xepLichTuHoc(userId, data);
}

/**
 * Lấy danh sách lịch tự học trong khoảng thời gian.
 * @param {string|null} tuNgay - YYYY-MM-DD
 * @param {string|null} denNgay - YYYY-MM-DD
 */
async function layLichTuHoc(db, userId, tuNgay = null, denNgay = null) {
    return await db.layLichTuHoc(userId, tuNgay, denNgay);
}

/**
 * Cập nhật trạng thái một buổi tự học (PLANNED → IN_PROGRESS → COMPLETED / CANCELLED).
 * @param {number} scheduleId
 * @param {string} status
 */
async function capNhatTrangThai(db, scheduleId, status) {
    const validStatuses = ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (!scheduleId || !status) {
        throw Object.assign(new Error('scheduleId và status là bắt buộc.'), { statusCode: 400 });
    }
    if (!validStatuses.includes(status)) {
        throw Object.assign(
            new Error(`status phải là một trong: ${validStatuses.join(', ')}`),
            { statusCode: 400 }
        );
    }
    return await db.capNhatTrangThaiLichTuHoc(scheduleId, status);
}

/**
 * Xóa lịch tự học.
 * @param {number} scheduleId
 */
async function xoaLichTuHoc(db, scheduleId) {
    if (!scheduleId) throw Object.assign(new Error('scheduleId là bắt buộc.'), { statusCode: 400 });
    return await db.xoaLichTuHoc(scheduleId);
}

module.exports = {
    kiemTraTrungLichChinhKhoa,
    kiemTraXungDot,
    timKhoangTrong,
    xepLichTuHoc,
    layLichTuHoc,
    capNhatTrangThai,
    xoaLichTuHoc
};
