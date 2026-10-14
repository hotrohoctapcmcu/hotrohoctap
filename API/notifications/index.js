/**
 * API/notifications/index.js
 * ===================================================================================
 * ROUTER THÔNG BÁO — Chức năng 4: NHẮC NHỞ THÔNG MINH ĐA TẦNG
 * ===================================================================================
 * Base path: /api/v1/notifications
 *
 * GET    /api/v1/notifications                    — Lấy danh sách nhắc nhở
 * GET    /api/v1/notifications/unread-count        — Đếm badge thông báo (topbar)
 * POST   /api/v1/notifications                    — Tạo nhắc nhở đơn lẻ
 * POST   /api/v1/notifications/multi-tier         — Tạo bộ nhắc nhở đa tầng
 * PATCH  /api/v1/notifications/:id/read           — Đánh dấu đã đọc
 * DELETE /api/v1/notifications/:id               — Xóa nhắc nhở
 *
 * ── Endpoint nội bộ (dành cho Cron Job / Worker) ──────────────────────────
 * GET    /api/v1/notifications/due               — Lấy nhắc nhở đến hạn cần gửi
 * PATCH  /api/v1/notifications/:id/sent          — Đánh dấu đã gửi thành công
 * ===================================================================================
 */

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const n = require('./notifications');

let db;
function setDb(dbInstance) { db = dbInstance; }

router.use(verifyToken);

// GET /api/v1/notifications
router.get('/', async (req, res, next) => {
    try {
        const data = await n.layDanhSachNhacNho(db, req.user.id);
        res.json({ success: true, data });
    } catch (err) { next(err); }
});

// GET /api/v1/notifications/unread-count
// Dùng cho badge số đỏ trên chuông ở topbar
router.get('/unread-count', async (req, res, next) => {
    try {
        const count = await n.demNhacNhoChuaDoc(db, req.user.id);
        res.json({ success: true, unreadCount: count });
    } catch (err) { next(err); }
});

// GET /api/v1/notifications/due
// Endpoint nội bộ cho Cron Job quét nhắc nhở đến hạn
router.get('/due', async (req, res, next) => {
    try {
        const data = await n.quetNhacNhoDenHan(db);
        res.json({ success: true, data });
    } catch (err) { next(err); }
});

// POST /api/v1/notifications
// Body: { targetType, targetId, title, message?, tier?, remindTime, channel? }
router.post('/', async (req, res, next) => {
    try {
        const data = await n.taoNhacNho(db, req.user.id, req.body);
        res.status(201).json({ success: true, message: 'Đã tạo nhắc nhở.', data });
    } catch (err) { next(err); }
});

// POST /api/v1/notifications/multi-tier
// Body: { targetType, targetId, title, deadline, channel? }
router.post('/multi-tier', async (req, res, next) => {
    try {
        const { targetType, targetId, title, deadline, channel } = req.body;
        const data = await n.taoNhacNhoDaTang(db, req.user.id, targetType, targetId, title, deadline, channel);
        res.status(201).json({ success: true, message: 'Đã tạo bộ nhắc nhở đa tầng.', data });
    } catch (err) { next(err); }
});

// PATCH /api/v1/notifications/:id/read
router.patch('/:id/read', async (req, res, next) => {
    try {
        await n.danhDauDaDoc(db, req.params.id);
        res.json({ success: true, message: 'Đã đánh dấu đã đọc.' });
    } catch (err) { next(err); }
});

// PATCH /api/v1/notifications/:id/sent  — Nội bộ (Cron Job đánh dấu sau khi gửi)
router.patch('/:id/sent', async (req, res, next) => {
    try {
        await n.danhDauDaDoc(db, req.params.id);
        res.json({ success: true, message: 'Đã đánh dấu đã gửi thông báo.' });
    } catch (err) { next(err); }
});

// DELETE /api/v1/notifications/:id
router.delete('/:id', async (req, res, next) => {
    try {
        await n.xoaNhacNho(db, req.params.id);
        res.json({ success: true, message: 'Đã xóa nhắc nhở.' });
    } catch (err) { next(err); }
});

module.exports = router;
module.exports.setDb = setDb;
