/**
 * API/tasks/index.js
 * ===================================================================================
 * ROUTER CÔNG VIỆC — Chức năng 3: QUẢN LÝ DEADLINE & CHECKLIST
 * ===================================================================================
 * Base path: /api/v1/tasks
 *
 * ── Bài tập / Deadline ───────────────────────────────────────────────────────
 * GET    /api/v1/tasks                      — Lấy tất cả bài tập (có thể filter ?status=)
 * GET    /api/v1/tasks/upcoming?days=3      — Deadline sắp đến hạn trong N ngày
 * POST   /api/v1/tasks                      — Tạo bài tập mới (auto trigger reminders)
 * PUT    /api/v1/tasks/:id                  — Cập nhật thông tin bài tập
 * PATCH  /api/v1/tasks/:id/status          — Đổi trạng thái bài tập
 * DELETE /api/v1/tasks/:id                 — Xóa bài tập & nhắc nhở liên quan
 *
 * ── Checklist cá nhân ────────────────────────────────────────────────────────
 * GET    /api/v1/tasks/checklist            — Lấy to-do list cá nhân
 * POST   /api/v1/tasks/checklist            — Thêm task cá nhân
 * PUT    /api/v1/tasks/checklist/:id        — Cập nhật task cá nhân
 * PATCH  /api/v1/tasks/checklist/:id/done  — Đánh dấu hoàn thành / chưa xong
 * DELETE /api/v1/tasks/checklist/:id        — Xóa task cá nhân
 * ===================================================================================
 */

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const t = require('./tasks');

let db;
function setDb(dbInstance) { db = dbInstance; }

router.use(verifyToken);

// ─── Assignments ──────────────────────────────────────────────────────────────

// GET /api/v1/tasks[?status=PENDING|IN_PROGRESS|COMPLETED|OVERDUE]
router.get('/', async (req, res, next) => {
    try {
        const data = await t.layDanhSachBaiTap(db, req.user.id, req.query.status || null);
        res.json({ success: true, data });
    } catch (err) { next(err); }
});

// GET /api/v1/tasks/upcoming[?days=3]
router.get('/upcoming', async (req, res, next) => {
    try {
        const data = await t.layDeadlineSapToi(db, req.user.id, req.query.days || 3);
        res.json({ success: true, data });
    } catch (err) { next(err); }
});

// POST /api/v1/tasks
// Body: { subjectId, title, description?, deadline, source?, submissionUrl?, externalId? }
router.post('/', async (req, res, next) => {
    try {
        const data = await t.themBaiTap(db, req.user.id, req.body);
        res.status(201).json({ success: true, message: 'Đã tạo bài tập. Nhắc nhở đã được thiết lập tự động.', data });
    } catch (err) { next(err); }
});

// PUT /api/v1/tasks/:id
// Body: { title?, description?, deadline? }
router.put('/:id', async (req, res, next) => {
    try {
        const data = await t.capNhatBaiTap(db, req.params.id, req.body);
        res.json({ success: true, message: 'Đã cập nhật bài tập.', data });
    } catch (err) { next(err); }
});

// PATCH /api/v1/tasks/:id/status
// Body: { status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' }
router.patch('/:id/status', async (req, res, next) => {
    try {
        const data = await t.capNhatTrangThaiBaiTap(db, req.params.id, req.body.status);
        res.json({ success: true, message: 'Đã cập nhật trạng thái bài tập.', data });
    } catch (err) { next(err); }
});

// DELETE /api/v1/tasks/:id
router.delete('/:id', async (req, res, next) => {
    try {
        await t.xoaBaiTap(db, req.params.id);
        res.json({ success: true, message: 'Đã xóa bài tập và các nhắc nhở liên quan.' });
    } catch (err) { next(err); }
});

// ─── Checklist ────────────────────────────────────────────────────────────────

// GET /api/v1/tasks/checklist
router.get('/checklist', async (req, res, next) => {
    try {
        const data = await t.layChecklist(db, req.user.id);
        res.json({ success: true, data });
    } catch (err) { next(err); }
});

// GET /api/v1/tasks/:taskId/checklist
router.get('/:taskId/checklist', async (req, res, next) => {
    try {
        const all = await t.layChecklist(db, req.user.id);
        const filtered = all.filter(c => c.assignment_id === parseInt(req.params.taskId, 10));
        res.json({ success: true, data: filtered.length > 0 ? filtered : all });
    } catch (err) { next(err); }
});

// POST /api/v1/tasks/:taskId/checklist
router.post('/:taskId/checklist', async (req, res, next) => {
    try {
        const data = await t.themChecklist(db, req.user.id, {
            ...req.body,
            assignmentId: parseInt(req.params.taskId, 10)
        });
        res.status(201).json({ success: true, message: 'Đã thêm task con vào bài tập.', data });
    } catch (err) { next(err); }
});

// POST /api/v1/tasks/checklist
// Body: { title, description?, priority?, deadline?, subjectId?, assignmentId? }
router.post('/checklist', async (req, res, next) => {
    try {
        const data = await t.themChecklist(db, req.user.id, req.body);
        res.status(201).json({ success: true, message: 'Đã thêm task vào checklist.', data });
    } catch (err) { next(err); }
});

// PUT /api/v1/tasks/checklist/:id
// Body: { title?, description?, priority?, deadline? }
router.put('/checklist/:id', async (req, res, next) => {
    try {
        const data = await t.capNhatChecklist(db, req.params.id, req.body);
        res.json({ success: true, message: 'Đã cập nhật task.', data });
    } catch (err) { next(err); }
});

// PATCH /api/v1/tasks/checklist/:id/done
// Body: { isCompleted: true | false }
router.patch('/checklist/:id/done', async (req, res, next) => {
    try {
        const isCompleted = req.body.isCompleted !== false; // mặc định true
        const data = await t.hoanThanhChecklist(db, req.params.id, isCompleted);
        res.json({
            success: true,
            message: isCompleted ? 'Đã đánh dấu hoàn thành.' : 'Đã bỏ đánh dấu hoàn thành.',
            data
        });
    } catch (err) { next(err); }
});

// DELETE /api/v1/tasks/checklist/:id
router.delete('/checklist/:id', async (req, res, next) => {
    try {
        await t.xoaChecklist(db, req.params.id);
        res.json({ success: true, message: 'Đã xóa task.' });
    } catch (err) { next(err); }
});

module.exports = router;
module.exports.setDb = setDb;
