/**
 * API/schedules/index.js
 * ===================================================================================
 * ROUTER LỊCH HỌC — Chức năng 1 & 2
 * (SMART TIMETABLE + AI SCHEDULING & CONFLICT ALERT)
 * ===================================================================================
 * Base path: /api/v1/schedules
 *
 * ── Chức năng 1: Thời khóa biểu chính khóa ──────────────────────────────
 * GET  /api/v1/schedules                          — Lấy toàn bộ TKB
 * GET  /api/v1/schedules/today                    — Lấy TKB hôm nay
 * GET  /api/v1/schedules/by-date?date=YYYY-MM-DD  — Lấy TKB theo ngày
 * GET  /api/v1/schedules/by-week?from=...&to=...  — Lấy TKB theo tuần
 * POST /api/v1/schedules                          — Thêm tiết học thủ công
 * DELETE /api/v1/schedules/:id                   — Xóa tiết học
 *
 * ── Chức năng 2: Lịch tự học & Cảnh báo trùng ───────────────────────────
 * GET  /api/v1/schedules/conflicts/check          — Cảnh báo lớp chính khóa bị trùng
 * POST /api/v1/schedules/conflicts/check          — Kiểm tra xung đột khoảng giờ tự học
 * GET  /api/v1/schedules/study                    — Lấy danh sách lịch tự học
 * POST /api/v1/schedules/study                    — Xếp lịch tự học mới
 * PATCH /api/v1/schedules/study/:id/status        — Cập nhật trạng thái lịch tự học
 * DELETE /api/v1/schedules/study/:id              — Xóa lịch tự học
 * GET  /api/v1/schedules/study/free-slots         — AI tìm khung giờ trống
 * ===================================================================================
 */

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const sch = require('./schedules');
const con = require('./conflicts');

let db;
function setDb(dbInstance) { db = dbInstance; }

router.use(verifyToken);

// ─── Chức năng 1: TKB chính khóa ────────────────────────────────────────────

// GET /api/v1/schedules
router.get('/', async (req, res, next) => {
    try {
        const data = await sch.layThoiKhoaBieu(db, req.user.id);
        res.json({ success: true, data });
    } catch (err) { next(err); }
});

// GET /api/v1/schedules/today
router.get('/today', async (req, res, next) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const data = await sch.layTheoNgay(db, req.user.id, today);
        res.json({ success: true, date: today, data });
    } catch (err) { next(err); }
});

// GET /api/v1/schedules/by-date?date=YYYY-MM-DD
router.get('/by-date', async (req, res, next) => {
    try {
        const data = await sch.layTheoNgay(db, req.user.id, req.query.date);
        res.json({ success: true, date: req.query.date, data });
    } catch (err) { next(err); }
});

// GET /api/v1/schedules/by-week?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get('/by-week', async (req, res, next) => {
    try {
        const data = await sch.layTheoTuan(db, req.user.id, req.query.from, req.query.to);
        res.json({ success: true, from: req.query.from, to: req.query.to, data });
    } catch (err) { next(err); }
});

// POST /api/v1/schedules — Thêm tiết học thủ công
router.post('/', async (req, res, next) => {
    try {
        const data = await sch.themTietHoc(db, req.user.id, req.body);
        res.status(201).json({ success: true, message: 'Đã thêm tiết học.', data });
    } catch (err) { next(err); }
});

// DELETE /api/v1/schedules/:id
router.delete('/:id', async (req, res, next) => {
    try {
        await sch.xoaTietHoc(db, req.params.id);
        res.json({ success: true, message: 'Đã xóa tiết học.' });
    } catch (err) { next(err); }
});

// ─── Chức năng 2: Lịch tự học & Cảnh báo trùng ─────────────────────────────

// GET /api/v1/schedules/conflicts/check — Cảnh báo các lớp chính khóa bị trùng
router.get('/conflicts/check', async (req, res, next) => {
    try {
        const conflicts = await con.kiemTraTrungLichChinhKhoa(db, req.user.id);
        res.json({ success: true, hasConflict: conflicts.length > 0, conflicts });
    } catch (err) { next(err); }
});

// POST /api/v1/schedules/conflicts/check — Kiểm tra xung đột khoảng giờ tự học
// Body: { studyDate, startTime, endTime, excludeScheduleId? }
router.post('/conflicts/check', async (req, res, next) => {
    try {
        const { studyDate, startTime, endTime, excludeScheduleId } = req.body;
        const conflicts = await con.kiemTraXungDot(db, req.user.id, studyDate, startTime, endTime, excludeScheduleId);
        res.json({ success: true, hasConflict: conflicts.length > 0, conflicts });
    } catch (err) { next(err); }
});

// GET /api/v1/schedules/study?from=...&to=...
router.get('/study', async (req, res, next) => {
    try {
        const data = await con.layLichTuHoc(db, req.user.id, req.query.from, req.query.to);
        res.json({ success: true, data });
    } catch (err) { next(err); }
});

// POST /api/v1/schedules/study — Xếp lịch tự học mới
// Body: { subjectId?, title, studyDate, startTime, endTime, isAiSuggested?, notes?, forceSave? }
router.post('/study', async (req, res, next) => {
    try {
        const data = await con.xepLichTuHoc(db, req.user.id, req.body);
        res.status(201).json({ success: true, message: 'Đã xếp lịch tự học.', data });
    } catch (err) { next(err); }
});

// PATCH /api/v1/schedules/study/:id/status
// Body: { status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' }
router.patch('/study/:id/status', async (req, res, next) => {
    try {
        await con.capNhatTrangThai(db, req.params.id, req.body.status);
        res.json({ success: true, message: 'Đã cập nhật trạng thái lịch tự học.' });
    } catch (err) { next(err); }
});

// DELETE /api/v1/schedules/study/:id
router.delete('/study/:id', async (req, res, next) => {
    try {
        await con.xoaLichTuHoc(db, req.params.id);
        res.json({ success: true, message: 'Đã xóa lịch tự học.' });
    } catch (err) { next(err); }
});

// GET /api/v1/schedules/study/free-slots?date=YYYY-MM-DD&duration=60
router.get('/study/free-slots', async (req, res, next) => {
    try {
        const freeSlots = await con.timKhoangTrong(db, req.user.id, req.query.date, req.query.duration);
        res.json({ success: true, date: req.query.date, freeSlots });
    } catch (err) { next(err); }
});

module.exports = router;
module.exports.setDb = setDb;
