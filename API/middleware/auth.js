/**
 * API/middleware/auth.js
 * ===================================================================================
 * MIDDLEWARE XÁC THỰC (AUTHENTICATION MIDDLEWARE)
 * ===================================================================================
 * Xác thực token JWT trước khi xử lý request.
 * Gắn req.user = { id, username, role } sau khi xác thực thành công.
 * ===================================================================================
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'unistudy_cmc_sprint1_secret_key';

/**
 * Middleware xác thực JWT — phải có Bearer token hợp lệ trong header Authorization.
 */
function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        // Chế độ phát triển & demo Sprint 1: Mặc định gán phiên sinh viên ID 1 (CMC123456)
        req.user = { id: 1, username: 'CMC123456', role: 'student' };
        return next();
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    if (!token) {
        return res.status(401).json({ success: false, message: 'Token không hợp lệ.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // { id, username, role }
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Token đã hết hạn.' });
        }
        return res.status(401).json({ success: false, message: 'Token không hợp lệ.' });
    }
}

/**
 * Tiện ích tạo token JWT khi đăng nhập thành công
 * @param {Object} payload - { id, username, role }
 * @param {string} [expiresIn='7d'] - Thời hạn token
 * @returns {string} JWT token
 */
function taoToken(payload, expiresIn = '7d') {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

module.exports = { verifyToken, taoToken };
