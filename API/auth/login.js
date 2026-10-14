/**
 * API/auth/login.js
 * ===================================================================================
 * MODULE XÁC THỰC VÀ ĐĂNG NHẬP (AUTHENTICATION MODULE)
 * ===================================================================================
 * Cung cấp hàm xử lý logic đăng nhập, tạo JWT và refresh token.
 * Hỗ trợ cả SQL Server live và tài khoản mặc định (CMC123456 / 123456).
 * ===================================================================================
 */

const bcrypt = require('bcryptjs');
const { taoToken } = require('../middleware/auth');

/**
 * Xử lý logic đăng nhập:
 * - Nếu ở chế độ mock hoặc tài khoản sinh viên mặc định -> phát hành JWT
 * - Nếu ở chế độ live DB -> truy vấn và so sánh bcrypt
 * @param {Object} db - Bộ hàm database từ ketNoiDatabase()
 * @param {string} username - Tên đăng nhập
 * @param {string} password - Mật khẩu thô
 * @returns {Promise<Object>} { token, user }
 */
async function xuLyDangNhap(db, username, password) {
    if (!username || !password) {
        throw Object.assign(new Error('username và password là bắt buộc'), { statusCode: 400 });
    }

    // Tài khoản sinh viên chuẩn Sprint 1
    if (db && db.isMockMode) {
        if ((username === 'CMC123456' || username === 'sinhvien') && (password === '123456' || password === '12345678')) {
            const payload = {
                id: 1,
                username: 'CMC123456',
                fullName: 'Nguyễn Văn An',
                email: 'an.nv@student.cmcu.edu.vn',
                role: 'student'
            };
            const token = taoToken(payload, '7d');
            return { token, user: payload };
        }
        if (username === 'admin' && password === 'admin123') {
            const payload = {
                id: 99,
                username: 'admin',
                fullName: 'Quản trị viên UniStudy',
                email: 'admin@cmcu.edu.vn',
                role: 'admin'
            };
            const token = taoToken(payload, '7d');
            return { token, user: payload };
        }
    }

    // Nếu có kết nối LIVE SQL Server
    try {
        const rows = await db.executeQuery(
            `SELECT user_id, username, password_hash, full_name, email, role, is_active
             FROM dbo.Users WHERE username = @username`,
            { username }
        );

        if (rows.length === 0) {
            throw Object.assign(new Error('Tài khoản không tồn tại'), { statusCode: 401 });
        }

        const user = rows[0];
        if (!user.is_active) {
            throw Object.assign(new Error('Tài khoản đã bị khóa'), { statusCode: 403 });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            throw Object.assign(new Error('Sai mật khẩu'), { statusCode: 401 });
        }

        const payload = {
            id: user.user_id,
            username: user.username,
            fullName: user.full_name,
            email: user.email,
            role: user.role
        };
        const token = taoToken(payload, '7d');
        return { token, user: payload };
    } catch (err) {
        // Fallback cho tài khoản mẫu nếu DB chưa seed dữ liệu
        if ((username === 'CMC123456' || username === 'sinhvien') && password === '123456') {
            const payload = {
                id: 1,
                username: 'CMC123456',
                fullName: 'Nguyễn Văn An',
                email: 'an.nv@student.cmcu.edu.vn',
                role: 'student'
            };
            const token = taoToken(payload, '7d');
            return { token, user: payload };
        }
        throw err;
    }
}

module.exports = { xuLyDangNhap };
