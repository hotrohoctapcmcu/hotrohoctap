/**
 * API/exams/index.js
 * ===================================================================================
 * ROUTER LỊCH THI — Chức năng 9: QUẢN LÝ LỊCH THI & KẾ HOẠCH ÔN THI
 * ===================================================================================
 * Base path: /api/v1/exams
 *
 * ── Lịch thi ──────────────────────────────────────────────────────────────
 * GET    /api/v1/exams                    — Toàn bộ lịch thi
 * GET    /api/v1/exams/upcoming           — Kỳ thi sắp tới + đếm ngược ngày thi
 * POST   /api/v1/exams                   — Thêm kỳ thi (auto trigger reminders 7d/3d/24h)
 * DELETE /api/v1/exams/:id               — Xóa kỳ thi + kế hoạch ôn thi + reminders
 *
 * ── Kế hoạch ôn thi ──────────────────────────────────────────────────────
 * GET    /api/v1/exams/study-plans            — Lấy tất cả kế hoạch ôn thi
 * GET    /api/v1/exams/:examId/study-plans    — Lấy kế hoạch ôn thi theo môn thi
 * POST   /api/v1/exams/study-plans           — Tạo giai đoạn kế hoạch ôn thi
 * PATCH  /api/v1/exams/study-plans/:id/status — Cập nhật trạng thái kế hoạch
 * DELETE /api/v1/exams/study-plans/:id        — Xóa giai đoạn kế hoạch
 * ===================================================================================
 */

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const e = require('./exams');

let db;
function setDb(dbInstance) { db = dbInstance; }

router.use(verifyToken);

// ─── Lịch thi ─────────────────────────────────────────────────────────────────

// GET /api/v1/exams
router.get('/', async (req, res, next) => {
    try {
        const data = await e.layLichThi(db, req.user.id);
        res.json({ success: true, data });
    } catch (err) { next(err); }
});

// GET /api/v1/exams/upcoming
router.get('/upcoming', async (req, res, next) => {
    try {
        const data = await e.layLichThiSapToi(db, req.user.id);
        res.json({ success: true, data });
    } catch (err) { next(err); }
});

// GET /api/v1/exams/study-plans — lấy tất cả kế hoạch ôn thi (phải đặt TRƯỚC /:examId)
router.get('/study-plans', async (req, res, next) => {
    try {
        const data = await e.layKeHoachOnThi(db, req.user.id, null);
        res.json({ success: true, data });
    } catch (err) { next(err); }
});

// POST /api/v1/exams
// Body: { subjectId, examName?, examDate, examTime, durationMinutes?, room, campus?, examFormat?, identificationNumber? }
router.post('/', async (req, res, next) => {
    try {
        const data = await e.themLichThi(db, req.user.id, req.body);
        res.status(201).json({
            success: true,
            message: 'Đã thêm kỳ thi. Nhắc nhở 7 ngày, 3 ngày, 24 giờ đã được thiết lập tự động.',
            data
        });
    } catch (err) { next(err); }
});

// POST /api/v1/exams/study-plans
// Body: { examId, phaseTitle, targetDescription?, startDate, endDate, priority?, notes? }
router.post('/study-plans', async (req, res, next) => {
    try {
        const data = await e.taoKeHoachOnThi(db, req.user.id, req.body);
        res.status(201).json({ success: true, message: 'Đã tạo kế hoạch ôn thi.', data });
    } catch (err) { next(err); }
});

// PATCH /api/v1/exams/study-plans/:id/status
// Body: { status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' }
router.patch('/study-plans/:id/status', async (req, res, next) => {
    try {
        await e.capNhatTrangThaiKeHoach(db, req.params.id, req.body.status);
        res.json({ success: true, message: 'Đã cập nhật trạng thái kế hoạch ôn thi.' });
    } catch (err) { next(err); }
});

// DELETE /api/v1/exams/study-plans/:id
router.delete('/study-plans/:id', async (req, res, next) => {
    try {
        await e.xoaKeHoach(db, req.params.id);
        res.json({ success: true, message: 'Đã xóa giai đoạn kế hoạch ôn thi.' });
    } catch (err) { next(err); }
});

// GET /api/v1/exams/:examId/study-plans — Lấy kế hoạch ôn thi theo môn thi
router.get('/:examId/study-plans', async (req, res, next) => {
    try {
        const data = await e.layKeHoachOnThi(db, req.user.id, req.params.examId);
        res.json({ success: true, examId: req.params.examId, data });
    } catch (err) { next(err); }
});

// DELETE /api/v1/exams/:id
router.delete('/:id', async (req, res, next) => {
    try {
        await e.xoaLichThi(db, req.params.id);
        res.json({ success: true, message: 'Đã xóa kỳ thi, kế hoạch ôn tập và nhắc nhở liên quan.' });
    } catch (err) { next(err); }
});

module.exports = router;
module.exports.setDb = setDb;
