/**
 * API/student/profile.js
 * ===================================================================================
 * MODULE HỒ SƠ SINH VIÊN (Chức năng 18 — PERSONAL ACADEMIC PROFILE)
 * ===================================================================================
 * Các hàm điều phối (controller logic) cho chức năng hồ sơ học tập cá nhân.
 * Được gọi bởi router index.js của module này.
 * ===================================================================================
 */

/**
 * Lấy hồ sơ học tập tổng quan (GPA, tín chỉ, môn nợ, ...)
 * @param {Object} db - Bộ hàm database
 * @param {number} userId - ID người dùng từ token
 * @returns {Promise<Object>}
 */
async function layHoSo(db, userId) {
    const profile = await db.layHoSo(userId);
    if (!profile) {
        throw Object.assign(new Error('Chưa có hồ sơ. Vui lòng đồng bộ dữ liệu từ cổng trường.'), { statusCode: 404 });
    }
    return profile;
}

/**
 * Cập nhật hồ sơ sinh viên (cho phép chỉnh sửa số điện thoại, avatar, ...)
 * @param {Object} db
 * @param {number} userId
 * @param {Object} data
 * @returns {Promise<Object>}
 */
async function capNhatHoSo(db, userId, data) {
    if (!data || Object.keys(data).length === 0) {
        throw Object.assign(new Error('Không có dữ liệu cập nhật'), { statusCode: 400 });
    }
    return await db.luuHoSo(userId, data);
}

/**
 * Lấy bảng điểm của sinh viên
 * @param {Object} db
 * @param {number} userId
 * @param {string|null} hocKy - Học kỳ cần lọc ('ky_1', 'ky_2', ...) hoặc null để lấy tất cả
 * @returns {Promise<Array>}
 */
async function layBangDiem(db, userId, hocKy = null) {
    return await db.layBangDiem(userId, hocKy);
}

/**
 * Lấy danh sách toàn bộ môn học trong chương trình đào tạo kèm trạng thái
 * @param {Object} db
 * @param {number} userId
 * @returns {Promise<Array>}
 */
async function layDanhSachMonHoc(db, userId) {
    return await db.layDanhSachMonHoc(userId);
}

module.exports = { layHoSo, capNhatHoSo, layBangDiem, layDanhSachMonHoc };
