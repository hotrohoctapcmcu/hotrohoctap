/**
 * API/student/index.js
 * ===================================================================================
 * ROUTER SINH VIÊN — Chức năng 18: HỒ SƠ HỌC TẬP CÁ NHÂN
 * ===================================================================================
 * Base path: /api/v1/student
 *
 * GET  /api/v1/student/profile          — Lấy hồ sơ học tập tổng quan
 * PUT  /api/v1/student/profile          — Cập nhật thông tin hồ sơ
 * GET  /api/v1/student/grades           — Lấy toàn bộ bảng điểm
 * GET  /api/v1/student/grades?hocKy=ky_1  — Lọc bảng điểm theo học kỳ
 * GET  /api/v1/student/subjects         — Lấy toàn bộ môn học & trạng thái
 * ===================================================================================
 */

const express = require('express');
const router = express.Router();
const { layHoSo, capNhatHoSo, layBangDiem, layDanhSachMonHoc } = require('./profile');
const { verifyToken } = require('../middleware/auth');

let db;
function setDb(dbInstance) { db = dbInstance; }

// Áp dụng xác thực cho toàn bộ route trong module này
router.use(verifyToken);

// ---------------------------------------------------------------------------
// GET /api/v1/student/profile
// Response: { success, data: { MSV, full_name, major, gpa_10, gpa_4, ... } }
// ---------------------------------------------------------------------------
router.get('/profile', async (req, res, next) => {
    try {
        const data = await layHoSo(db, req.user.id);
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
});

// ---------------------------------------------------------------------------
// PUT /api/v1/student/profile
// Body: { studentCode, fullName, major, dob, phone, avatarUrl, ... }
// Response: { success, data: <hồ sơ sau cập nhật> }
// ---------------------------------------------------------------------------
router.put('/profile', async (req, res, next) => {
    try {
        const data = await capNhatHoSo(db, req.user.id, req.body);
        res.json({ success: true, message: 'Cập nhật hồ sơ thành công.', data });
    } catch (err) {
        next(err);
    }
});

// ---------------------------------------------------------------------------
// GET /api/v1/student/grades[?hocKy=ky_1]
// Response: { success, data: Array<{ subject_name, semester, final_score, letter_grade, is_passed }> }
// ---------------------------------------------------------------------------
router.get('/grades', async (req, res, next) => {
    try {
        const hocKy = req.query.hocKy || null;
        const data = await layBangDiem(db, req.user.id, hocKy);
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
});

// ---------------------------------------------------------------------------
// GET /api/v1/student/subjects
// Response: { success, data: Array<{ subject_code, subject_name, credits, status }> }
// ---------------------------------------------------------------------------
router.get('/subjects', async (req, res, next) => {
    try {
        const data = await layDanhSachMonHoc(db, req.user.id);
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
module.exports.setDb = setDb;
