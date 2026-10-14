/**
 * API/index.js
 * ===================================================================================
 * ĐIỂM VÀO CHÍNH — BACKEND API SERVER SPRINT 1
 * UniStudy CMC — Hệ thống hỗ trợ học tập thông minh
 * ===================================================================================
 *
 * Kiến trúc (theo thiết kế Long Nhật - Sprint 1):
 * ┌─────────────────────────────────────────────────────────────┐
 * │  API/index.js  ←── Điểm vào duy nhất (Express Server)      │
 * │   ├── /api/v1/auth        → API/auth/index.js   (Xác thực) │
 * │   ├── /api/v1/student     → API/student/index.js  (CF 18)  │
 * │   ├── /api/v1/schedules   → API/schedules/index.js (CF 1+2)│
 * │   ├── /api/v1/tasks       → API/tasks/index.js    (CF 3)   │
 * │   ├── /api/v1/notifications→ API/notifications/index.js(CF4)│
 * │   ├── /api/v1/exams       → API/exams/index.js    (CF 9)   │
 * │   └── /api/v1/sync        → API/sync/index.js  (Đồng bộ)  │
 * │                                                             │
 * │  Database ← database/index.js (ketNoiDatabase)             │
 * │  CRWEB    ← CRWEB/IU_VT/index.js (Crawler IU)             │
 * └─────────────────────────────────────────────────────────────┘
 *
 * Endpoints đầy đủ Sprint 1:
 * ─────────────────────────────────────────────────────────────
 * POST   /api/v1/auth/login
 * POST   /api/v1/auth/sync
 *
 * GET    /api/v1/student/profile
 * PUT    /api/v1/student/profile
 * GET    /api/v1/student/grades[?hocKy=ky_1]
 * GET    /api/v1/student/subjects
 *
 * GET    /api/v1/schedules
 * GET    /api/v1/schedules/today
 * GET    /api/v1/schedules/by-date?date=YYYY-MM-DD
 * GET    /api/v1/schedules/by-week?from=...&to=...
 * POST   /api/v1/schedules
 * DELETE /api/v1/schedules/:id
 * GET    /api/v1/schedules/conflicts/check
 * POST   /api/v1/schedules/conflicts/check
 * GET    /api/v1/schedules/study[?from=...&to=...]
 * POST   /api/v1/schedules/study
 * PATCH  /api/v1/schedules/study/:id/status
 * DELETE /api/v1/schedules/study/:id
 * GET    /api/v1/schedules/study/free-slots?date=...&duration=60
 *
 * GET    /api/v1/tasks[?status=...]
 * GET    /api/v1/tasks/upcoming[?days=3]
 * POST   /api/v1/tasks
 * PUT    /api/v1/tasks/:id
 * PATCH  /api/v1/tasks/:id/status
 * DELETE /api/v1/tasks/:id
 * GET    /api/v1/tasks/checklist
 * POST   /api/v1/tasks/checklist
 * PUT    /api/v1/tasks/checklist/:id
 * PATCH  /api/v1/tasks/checklist/:id/done
 * DELETE /api/v1/tasks/checklist/:id
 *
 * GET    /api/v1/notifications
 * GET    /api/v1/notifications/unread-count
 * GET    /api/v1/notifications/due
 * POST   /api/v1/notifications
 * POST   /api/v1/notifications/multi-tier
 * PATCH  /api/v1/notifications/:id/read
 * PATCH  /api/v1/notifications/:id/sent
 * DELETE /api/v1/notifications/:id
 *
 * GET    /api/v1/exams
 * GET    /api/v1/exams/upcoming
 * GET    /api/v1/exams/study-plans
 * POST   /api/v1/exams
 * POST   /api/v1/exams/study-plans
 * PATCH  /api/v1/exams/study-plans/:id/status
 * DELETE /api/v1/exams/study-plans/:id
 * GET    /api/v1/exams/:examId/study-plans
 * DELETE /api/v1/exams/:id
 *
 * GET    /api/v1/sync/sources
 * POST   /api/v1/sync
 * GET    /api/v1/sync/status?jobId=...
 * ===================================================================================
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const ketNoiDatabase = require('../database/index');

// ─── Import routers ──────────────────────────────────────────────────────────
const authRouter          = require('./auth/index');
const studentRouter       = require('./student/index');
const schedulesRouter     = require('./schedules/index');
const tasksRouter         = require('./tasks/index');
const notificationsRouter = require('./notifications/index');
const examsRouter         = require('./exams/index');
const syncRouter          = require('./sync/index');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.API_PORT || 3001;
const API_PREFIX = '/api/v1';

// ─── Middleware toàn cục ──────────────────────────────────────────────────────
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
    res.json({
        success: true,
        service: 'UniStudy CMC — API Sprint 1',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        endpoints: `${API_PREFIX}/...`
    });
});

// ─── Trang chủ / Dashboard của API Server (GET /) ───────────────────────────
app.get(['/', '/api', API_PREFIX], (req, res) => {
    const isHtml = req.accepts('html', 'json') === 'html';
    if (!isHtml) {
        return res.json({
            success: true,
            service: 'UniStudy CMC — Backend API Server Sprint 1',
            status: 'online',
            frontendUrl: 'http://localhost:8080',
            health: '/health',
            endpoints: {
                auth: [`POST ${API_PREFIX}/auth/login`, `POST ${API_PREFIX}/auth/sync`],
                student: [`GET ${API_PREFIX}/student/profile`, `PUT ${API_PREFIX}/student/profile`, `GET ${API_PREFIX}/student/grades`, `GET ${API_PREFIX}/student/subjects`],
                schedules: [`GET ${API_PREFIX}/schedules`, `GET ${API_PREFIX}/schedules/today`, `GET ${API_PREFIX}/schedules/by-date`, `GET ${API_PREFIX}/schedules/conflicts/check`, `GET ${API_PREFIX}/schedules/study/free-slots`],
                tasks: [`GET ${API_PREFIX}/tasks`, `GET ${API_PREFIX}/tasks/upcoming`, `GET ${API_PREFIX}/tasks/checklist`],
                notifications: [`GET ${API_PREFIX}/notifications`, `GET ${API_PREFIX}/notifications/unread-count`],
                exams: [`GET ${API_PREFIX}/exams`, `GET ${API_PREFIX}/exams/upcoming`, `GET ${API_PREFIX}/exams/study-plans`],
                sync: [`GET ${API_PREFIX}/sync/sources`, `POST ${API_PREFIX}/sync`],
                dashboard: [`GET ${API_PREFIX}/dashboard`]
            }
        });
    }

    res.send(`<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UniStudy CMC — Backend API Server</title>
    <style>
        :root { --primary: #6366f1; --primary-dark: #4f46e5; --bg: #0f172a; --card: #1e293b; --text: #f8fafc; --muted: #94a3b8; --border: #334155; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: var(--bg); color: var(--text); margin: 0; padding: 40px 20px; line-height: 1.6; }
        .container { max-width: 900px; margin: 0 auto; }
        .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; border-bottom: 1px solid var(--border); padding-bottom: 20px; flex-wrap: wrap; gap: 12px; }
        .badge { background: #10b981; color: white; padding: 6px 14px; border-radius: 999px; font-weight: 600; font-size: 13px; display: inline-flex; align-items: center; gap: 8px; }
        .badge::before { content: ""; width: 8px; height: 8px; background: white; border-radius: 50%; display: inline-block; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .hero { background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.1)); border: 1px solid var(--primary); border-radius: 16px; padding: 32px; margin-bottom: 32px; text-align: center; }
        .btn-fe { display: inline-block; background: var(--primary); color: white; padding: 14px 28px; border-radius: 10px; font-weight: 600; text-decoration: none; font-size: 16px; transition: 0.2s; box-shadow: 0 4px 14px rgba(99,102,241,0.4); margin-top: 16px; }
        .btn-fe:hover { background: var(--primary-dark); transform: translateY(-2px); }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin-top: 24px; }
        .card { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 20px; }
        .card h3 { margin-top: 0; color: #a5b4fc; font-size: 16px; }
        .endpoint { font-family: 'Consolas', monospace; font-size: 13px; background: rgba(0,0,0,0.3); padding: 5px 8px; border-radius: 6px; margin: 6px 0; color: #e2e8f0; display: block; word-break: break-all; }
        .method { font-weight: 700; color: #38bdf8; }
        .method-post { color: #34d399; }
        a.link { color: #818cf8; text-decoration: none; }
        a.link:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div>
                <h1 style="margin:0; font-size: 24px;">UniStudy CMC — Backend API Server</h1>
                <p style="margin:4px 0 0; color: var(--muted); font-size: 14px;">Máy chủ Backend phục vụ 6 chức năng cốt lõi Sprint 1</p>
            </div>
            <span class="badge">ĐANG HOẠT ĐỘNG (PORT 3001)</span>
        </div>

        <div class="hero">
            <h2 style="margin: 0 0 8px; font-size: 22px;">Máy chủ API đang hoạt động bình thường!</h2>
            <p style="margin: 0; color: var(--muted);">Bạn đang truy cập vào cổng API của Backend (Port 3001). Để trải nghiệm toàn bộ giao diện học tập của ứng dụng:</p>
            <a href="http://localhost:8080" class="btn-fe">👉 Mở Giao Diện Frontend (http://localhost:8080)</a>
        </div>

        <h2 style="font-size: 18px; margin-bottom: 8px;">Danh Mục Endpoint Đã Sẵn Sàng:</h2>
        <div class="grid">
            <div class="card">
                <h3>Chức năng 18: Hồ sơ cá nhân</h3>
                <span class="endpoint"><span class="method">GET</span> /api/v1/student/profile</span>
                <span class="endpoint"><span class="method">GET</span> /api/v1/student/grades</span>
                <span class="endpoint"><span class="method">GET</span> /api/v1/student/subjects</span>
            </div>
            <div class="card">
                <h3>Chức năng 1: Thời khóa biểu</h3>
                <span class="endpoint"><span class="method">GET</span> /api/v1/schedules</span>
                <span class="endpoint"><span class="method">GET</span> /api/v1/schedules/today</span>
                <span class="endpoint"><span class="method">GET</span> /api/v1/schedules/by-date</span>
            </div>
            <div class="card">
                <h3>Chức năng 2: Tự học & Trùng lịch</h3>
                <span class="endpoint"><span class="method">GET</span> /api/v1/schedules/conflicts/check</span>
                <span class="endpoint"><span class="method">GET</span> /api/v1/schedules/study/free-slots</span>
                <span class="endpoint"><span class="method method-post">POST</span> /api/v1/schedules/study</span>
            </div>
            <div class="card">
                <h3>Chức năng 3: Deadline & Checklist</h3>
                <span class="endpoint"><span class="method">GET</span> /api/v1/tasks</span>
                <span class="endpoint"><span class="method">GET</span> /api/v1/tasks/upcoming</span>
                <span class="endpoint"><span class="method">GET</span> /api/v1/tasks/checklist</span>
            </div>
            <div class="card">
                <h3>Chức năng 4: Nhắc nhở đa tầng</h3>
                <span class="endpoint"><span class="method">GET</span> /api/v1/notifications</span>
                <span class="endpoint"><span class="method">GET</span> /api/v1/notifications/unread-count</span>
            </div>
            <div class="card">
                <h3>Chức năng 9: Lịch thi & Ôn tập</h3>
                <span class="endpoint"><span class="method">GET</span> /api/v1/exams</span>
                <span class="endpoint"><span class="method">GET</span> /api/v1/exams/upcoming</span>
                <span class="endpoint"><span class="method">GET</span> /api/v1/exams/study-plans</span>
            </div>
        </div>

        <p style="margin-top: 32px; font-size: 13px; color: var(--muted); text-align: center;">
            UniStudy CMC — Phát triển bởi Long Nhật & Nhóm Dự Án CMCU • Kiểm tra: <a class="link" href="/health">/health</a> • <a class="link" href="/api/v1/dashboard">/api/v1/dashboard</a>
        </p>
    </div>
</body>
</html>`);
});

// ─── Khởi động server sau khi kết nối database ───────────────────────────────
async function start() {
    console.log('\n===================================================================');
    console.log('   UNISTUDY CMC — BACKEND API SERVER SPRINT 1');
    console.log('   Chức năng: 1 (TKB), 2 (Tự học), 3 (Deadline), 4 (Nhắc nhở), 9 (Lịch thi), 18 (Hồ sơ)');
    console.log('===================================================================\n');

    let db;
    try {
        console.log('[DB] Đang kết nối SQL Server...');
        db = await ketNoiDatabase();
        console.log('[DB] Kết nối thành công!\n');
    } catch (err) {
        console.error('[DB] Kết nối thất bại:', err.message);
        console.warn('[WARN] Server khởi động ở chế độ NO-DB. Các API sẽ trả lỗi nếu gọi DB.');
        db = null;
    }

    // ─── Gán db vào từng router ──────────────────────────────────────────────
    if (db) {
        authRouter.setDb(db);
        studentRouter.setDb(db);
        schedulesRouter.setDb(db);
        tasksRouter.setDb(db);
        notificationsRouter.setDb(db);
        examsRouter.setDb(db);
        syncRouter.setDb(db);
    }

    // ─── Đăng ký routes ──────────────────────────────────────────────────────
    app.use(`${API_PREFIX}/auth`,          authRouter);
    app.use(`${API_PREFIX}/student`,       studentRouter);
    app.use(`${API_PREFIX}/schedules`,     schedulesRouter);
    app.use(`${API_PREFIX}/tasks`,         tasksRouter);
    app.use(`${API_PREFIX}/checklist`,     tasksRouter);
    app.use(`${API_PREFIX}/notifications`, notificationsRouter);
    app.use(`${API_PREFIX}/exams`,         examsRouter);
    app.use(`${API_PREFIX}/sync`,          syncRouter);

    // GET /api/v1/dashboard — Tổng hợp dữ liệu hiển thị màn hình tổng quan
    app.get(`${API_PREFIX}/dashboard`, async (req, res, next) => {
        try {
            const userId = (req.user && req.user.id) || 1;
            const today = new Date().toISOString().split('T')[0];
            const [profile, schedules, deadlines, exams, reminders] = await Promise.all([
                db.layHoSo(userId),
                db.layThoiKhoaBieuTheoNgay(userId, today),
                db.layDeadlineSapToi(userId, 3),
                db.layLichThiSapToi(userId),
                db.layDanhSachNhacNho(userId)
            ]);
            res.json({
                success: true,
                data: {
                    profile,
                    todaySchedules: schedules,
                    upcomingDeadlines: deadlines,
                    upcomingExams: exams,
                    unreadRemindersCount: (reminders || []).filter(r => !r.is_sent).length
                }
            });
        } catch (err) { next(err); }
    });

    // ─── Error handlers (phải đặt sau tất cả routes) ─────────────────────────
    app.use(notFound);
    app.use(errorHandler);

    // ─── Khởi động server ────────────────────────────────────────────────────
    app.listen(PORT, () => {
        console.log(`[API] Server đang chạy tại: http://localhost:${PORT}`);
        console.log(`[API] Health check:          http://localhost:${PORT}/health`);
        console.log('\n[API] Danh sách endpoint Sprint 1:');
        console.log(`      POST   ${API_PREFIX}/auth/login`);
        console.log(`      POST   ${API_PREFIX}/auth/sync`);
        console.log(`      GET    ${API_PREFIX}/student/profile`);
        console.log(`      GET    ${API_PREFIX}/schedules (+ /today, /by-date, /by-week)`);
        console.log(`      GET    ${API_PREFIX}/schedules/conflicts/check`);
        console.log(`      GET    ${API_PREFIX}/schedules/study/free-slots`);
        console.log(`      GET    ${API_PREFIX}/tasks (+ /upcoming, /checklist)`);
        console.log(`      GET    ${API_PREFIX}/notifications (+ /unread-count)`);
        console.log(`      GET    ${API_PREFIX}/exams (+ /upcoming, /study-plans)`);
        console.log(`      GET    ${API_PREFIX}/sync/sources`);
        console.log('\n===================================================================\n');
    });

    // ─── Xử lý graceful shutdown ──────────────────────────────────────────────
    process.on('SIGTERM', async () => {
        console.log('\n[API] Nhận tín hiệu SIGTERM. Đang dừng server...');
        if (db && db.closePool) await db.closePool();
        process.exit(0);
    });

    process.on('SIGINT', async () => {
        console.log('\n[API] Nhận tín hiệu SIGINT (Ctrl+C). Đang dừng server...');
        if (db && db.closePool) await db.closePool();
        process.exit(0);
    });
}

start().catch(err => {
    console.error('[FATAL] Không thể khởi động server:', err);
    process.exit(1);
});

module.exports = app; // Export để kiểm thử