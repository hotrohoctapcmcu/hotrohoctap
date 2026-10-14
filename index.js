/**
 * index.js
 * ===================================================================================
 * ĐIỂM KHỞI CHẠY CHÍNH TOÀN DỰ ÁN — UNISTUDY CMC SPRINT 1
 * ===================================================================================
 * Khởi chạy đồng thời:
 *   1. Backend API Server:  http://localhost:3001/api/v1 (Express + Database Layer)
 *   2. Frontend Web Server: http://localhost:8080/       (Giao diện UniStudy CMC)
 *
 * Chạy lệnh:
 *   node index.js
 * ===================================================================================
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// ─── 1. KHỞI CHẠY BACKEND API SERVER ─────────────────────────────────────────
const apiApp = require('./API/index');

// ─── 2. KHỞI CHẠY TĨNH CHO FRONTEND (Port 8080) ──────────────────────────────
const FE_DIR = path.resolve(__dirname, 'Frontend/unistudy-fe');
const FE_PORT = 8080;

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js':   'application/javascript; charset=utf-8',
    '.css':  'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif':  'image/gif',
    '.svg':  'image/svg+xml',
    '.ico':  'image/x-icon'
};

const feServer = http.createServer((req, res) => {
    let reqPath = decodeURI(req.url.split('?')[0]);
    if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

    const filePath = path.join(FE_DIR, reqPath);

    // Ngăn chặn directory traversal
    if (!filePath.startsWith(FE_DIR)) {
        res.writeHead(403);
        return res.end('403 Forbidden');
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            return res.end('404 Not Found: ' + reqPath);
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, {
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*'
        });

        fs.createReadStream(filePath).pipe(res);
    });
});

feServer.listen(FE_PORT, () => {
    console.log(`[FE]  Frontend Web Server:  http://localhost:${FE_PORT}`);
    console.log(`[FE]  Thư mục phục vụ:     ${FE_DIR}\n`);
    console.log('───────────────────────────────────────────────────────────────────');
    console.log('   MỞ TRÌNH DUYỆT TẠI: http://localhost:8080');
    console.log('───────────────────────────────────────────────────────────────────\n');
});

// Xử lý dừng máy chủ
function shutdown() {
    console.log('\n[SYS] Đang dừng toàn bộ dịch vụ...');
    feServer.close();
    process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
