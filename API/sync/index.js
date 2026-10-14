/**
 * API/sync/index.js
 * ===================================================================================
 * ROUTER ĐỒNG BỘ DỮ LIỆU TRƯỜNG CMC
 * ===================================================================================
 * Base path: /api/v1/sync
 *
 * GET  /api/v1/sync/sources         — Lấy danh sách 4 nguồn đồng bộ CMC
 * POST /api/v1/sync                 — Khởi tạo job đồng bộ, trả về jobId
 * GET  /api/v1/sync/status?jobId=.. — Polling trạng thái job đồng bộ
 * ===================================================================================
 */

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const s = require('./sync');

let db;
function setDb(dbInstance) { db = dbInstance; }

router.use(verifyToken);

// GET /api/v1/sync/sources
// Response: { success, sources: [ { id, name, url, description, isRequired } ] }
router.get('/sources', async (req, res, next) => {
    try {
        const sources = s.layCacNguonDongBo();
        res.json({ success: true, sources });
    } catch (err) { next(err); }
});

// POST /api/v1/sync
// Body: { sources: ['IU', 'LMS', 'EDUX', 'ELEARNING'] }
// Response: { success, jobId, status, message }
router.post('/', async (req, res, next) => {
    try {
        const { sources } = req.body;
        const result = s.khoiTaoDongBo(sources, req.user.id);
        res.status(202).json({ success: true, ...result });
    } catch (err) { next(err); }
});

// GET /api/v1/sync/status?jobId=sync_1_1234567890
// Response: { success, jobId, status, completedSources, pendingSources }
router.get('/status', async (req, res, next) => {
    try {
        const result = s.layTrangThaiJob(req.query.jobId);
        res.json({ success: true, ...result });
    } catch (err) { next(err); }
});

module.exports = router;
module.exports.setDb = setDb;
