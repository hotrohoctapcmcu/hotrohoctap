/**
 * API/exams/exams.js
 * ===================================================================================
 * MODULE QUẢN LÝ LỊCH THI & KẾ HOẠCH ÔN THI (Chức năng 9)
 * ===================================================================================
 * Controller logic cho lịch thi chính thức và kế hoạch ôn tập từng môn.
 * ===================================================================================
 */

// ─── Lịch thi ─────────────────────────────────────────────────────────────────

/**
 * Lấy toàn bộ lịch thi của sinh viên.
 */
async function layLichThi(db, userId) {
    return await db.layLichThi(userId);
}

/**
 * Lấy các kỳ thi sắp diễn ra kèm số ngày đếm ngược.
 * Frontend dùng để hiển thị card kỳ thi với lộ trình ôn tập.
 */
async function layLichThiSapToi(db, userId) {
    return await db.layLichThiSapToi(userId);
}

/**
 * Thêm kỳ thi mới (Trigger DB tự sinh nhắc nhở 7d, 3d, 24h).
 * @param {Object} data - { subjectId, examName, examDate, examTime, durationMinutes, room, campus, examFormat, identificationNumber }
 */
async function themLichThi(db, userId, data) {
    if (!data || !data.subjectId || !data.examDate || !data.examTime || !data.room) {
        throw Object.assign(
            new Error('subjectId, examDate, examTime và room là bắt buộc.'),
            { statusCode: 400 }
        );
    }
    return await db.themLichThi(userId, data);
}

/**
 * Xóa kỳ thi và kế hoạch ôn tập kèm theo.
 * @param {number} examId
 */
async function xoaLichThi(db, examId) {
    if (!examId) throw Object.assign(new Error('examId là bắt buộc.'), { statusCode: 400 });
    return await db.xoaLichThi(examId);
}

// ─── Kế hoạch ôn thi ─────────────────────────────────────────────────────────

/**
 * Lấy danh sách kế hoạch ôn thi (tùy chọn lọc theo kỳ thi).
 * @param {number|null} examId - Lọc theo môn thi cụ thể (null = lấy tất cả)
 */
async function layKeHoachOnThi(db, userId, examId = null) {
    return await db.layKeHoachOnThi(userId, examId);
}

/**
 * Tạo giai đoạn kế hoạch ôn thi.
 * @param {Object} data - { examId, phaseTitle, targetDescription, startDate, endDate, priority, notes }
 */
async function taoKeHoachOnThi(db, userId, data) {
    if (!data || !data.examId || !data.phaseTitle || !data.startDate || !data.endDate) {
        throw Object.assign(
            new Error('examId, phaseTitle, startDate và endDate là bắt buộc.'),
            { statusCode: 400 }
        );
    }
    return await db.taoKeHoachOnThi(userId, data);
}

/**
 * Cập nhật trạng thái kế hoạch ôn thi.
 * @param {number} planId
 * @param {string} status - 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
 */
async function capNhatTrangThaiKeHoach(db, planId, status) {
    const valid = ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (!planId || !status) {
        throw Object.assign(new Error('planId và status là bắt buộc.'), { statusCode: 400 });
    }
    if (!valid.includes(status)) {
        throw Object.assign(new Error(`status phải là: ${valid.join(', ')}`), { statusCode: 400 });
    }
    return await db.capNhatTrangThaiKeHoachOnThi(planId, status);
}

/**
 * Xóa một giai đoạn kế hoạch ôn thi.
 * @param {number} planId
 */
async function xoaKeHoach(db, planId) {
    if (!planId) throw Object.assign(new Error('planId là bắt buộc.'), { statusCode: 400 });
    return await db.xoaKeHoachOnThi(planId);
}

module.exports = {
    layLichThi,
    layLichThiSapToi,
    themLichThi,
    xoaLichThi,
    layKeHoachOnThi,
    taoKeHoachOnThi,
    capNhatTrangThaiKeHoach,
    xoaKeHoach
};
