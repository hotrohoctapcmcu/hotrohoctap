/**
 * API/auth/index.js
 * ===================================================================================
 * ROUTER XÁC THỰC (AUTH ROUTER)
 * ===================================================================================
 * POST /api/v1/auth/login  — Đăng nhập, nhận JWT
 * POST /api/v1/auth/sync   — Tiếp nhận kết quả đồng bộ từ cổng trường CMC
 * ===================================================================================
 */

const express = require('express');
const router = express.Router();
const { xuLyDangNhap } = require('./login');

let db; // Được gán từ index.js sau khi ketNoiDatabase() hoàn thành

/**
 * Cho phép module cha gán db vào router này sau khi DB được khởi động.
 * @param {Object} dbInstance - Bộ hàm từ ketNoiDatabase()
 */
function setDb(dbInstance) {
    db = dbInstance;
}

// ---------------------------------------------------------------------------
// POST /api/v1/auth/login
// Body: { username, password }
// Response: { success, token, user }
// ---------------------------------------------------------------------------
router.post('/login', async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const result = await xuLyDangNhap(db, username, password);
        res.json({ success: true, ...result });
    } catch (err) {
        next(err);
    }
});

// ---------------------------------------------------------------------------
// POST /api/v1/auth/sync
// Nhận dữ liệu đồng bộ từ crawler IU sau khi người dùng xác thực trên cổng trường.
// Body: { userId, dataIU }   (dataIU là JSON chuẩn từ crawler)
// Response: { success, message, data }
// ---------------------------------------------------------------------------
router.post('/sync', async (req, res, next) => {
    try {
        const { userId, dataIU } = req.body;
        if (!userId || !dataIU) {
            return res.status(400).json({ success: false, message: 'userId và dataIU là bắt buộc.' });
        }
        const result = await db.dongBoHoSoIU(userId, dataIU);
        res.json({
            success: true,
            message: 'Đồng bộ dữ liệu IU thành công.',
            data: result
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
module.exports.setDb = setDb;
