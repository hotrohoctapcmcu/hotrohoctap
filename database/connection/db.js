/**
 * database/connection/db.js
 * ===================================================================================
 * MODULE KẾT NỐI SQL SERVER — DÙNG CHUNG CHO TOÀN DỰ ÁN
 * ===================================================================================
 * Cung cấp:
 *   - getPool()        → Khởi tạo / lấy connection pool (singleton)
 *   - closePool()      → Đóng kết nối khi shutdown
 *   - executeQuery()   → Chạy câu SQL với tham số (an toàn SQL Injection)
 *   - executeProcedure()→ Gọi Stored Procedure với tham số
 *   - sql              → Object sql của mssql (dùng khai báo kiểu nếu cần)
 * ===================================================================================
 */

const fs = require('fs');
const path = require('path');

// ─── Tự động nạp cấu hình từ .env ở thư mục gốc ──────────────────────────────
const envPath = path.resolve(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
    try {
        const content = fs.readFileSync(envPath, 'utf8');
        content.split(/\r?\n/).forEach(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const eqIdx = trimmed.indexOf('=');
                if (eqIdx > 0) {
                    const k = trimmed.slice(0, eqIdx).trim();
                    const v = trimmed.slice(eqIdx + 1).trim();
                    if (!process.env[k]) process.env[k] = v;
                }
            }
        });
    } catch (_) {}
}

// ─── Tự động tìm nạp module mssql ──────────────────────────────────────────
let sql = null;
try {
    sql = require('mssql');
} catch (_) {
    try {
        sql = require(path.resolve(__dirname, '../../API/node_modules/mssql'));
    } catch (_) {
        sql = null;
    }
}

// ─── Cấu hình kết nối đọc từ .env ───────────────────────────────────────────
const dbConfig = {
    server:   process.env.DB_SERVER   || 'localhost',
    database: process.env.DB_NAME     || 'UniStudy_Sprint1',
    port:     parseInt(process.env.DB_PORT || '1433', 10),
    options: {
        encrypt:              process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: true,   // bắt buộc với SQL Server local / self-signed cert
        enableArithAbort:     true,
        connectTimeout:       4000     // timeout ngắn 4s để phát hiện nhanh nếu dịch vụ chưa bật
    }
};

if (process.env.DB_TRUSTED_CONNECTION === 'true') {
    dbConfig.options.trustedConnection = true;
} else {
    dbConfig.user     = process.env.DB_USER     || 'sa';
    dbConfig.password = process.env.DB_PASSWORD || '';
}

let _pool = null;

/**
 * Khởi tạo hoặc trả về connection pool đang hoạt động.
 * @returns {Promise<sql.ConnectionPool>}
 */
async function getPool() {
    if (!sql) {
        throw new Error('Thư viện mssql chưa được cài đặt trong môi trường hiện tại.');
    }
    if (_pool && _pool.connected) return _pool;

    try {
        _pool = await sql.connect(dbConfig);
        console.log(`[DB] Kết nối thành công → ${dbConfig.server}/${dbConfig.database}`);
        _pool.on('error', err => {
            console.error('[DB] Pool error:', err.message);
            _pool = null;
        });
        return _pool;
    } catch (err) {
        _pool = null;
        throw err;
    }
}

/**
 * Đóng connection pool
 */
async function closePool() {
    if (_pool) {
        await _pool.close();
        _pool = null;
        console.log('[DB] Đã đóng kết nối.');
    }
}

/**
 * Chạy câu SQL tham số
 */
async function executeQuery(queryStr, params = {}) {
    const pool = await getPool();
    const request = pool.request();

    for (const [key, val] of Object.entries(params)) {
        request.input(key, autoType(val), val);
    }

    const result = await request.query(queryStr);
    return result.recordset || [];
}

/**
 * Gọi Stored Procedure với tham số
 */
async function executeProcedure(procedureName, params = {}) {
    const pool = await getPool();
    const request = pool.request();

    for (const [key, val] of Object.entries(params)) {
        if (val !== undefined) {
            request.input(key, autoType(val), val);
        }
    }

    const result = await request.execute(procedureName);
    return result.recordsets?.[0] || result.recordset || [];
}

function autoType(val) {
    if (!sql) return null;
    if (val === null || val === undefined) return sql.NVarChar(sql.MAX);
    if (typeof val === 'number') {
        return Number.isInteger(val) ? sql.Int : sql.Decimal(18, 4);
    }
    if (typeof val === 'boolean') return sql.Bit;
    if (val instanceof Date)       return sql.DateTime2;
    return sql.NVarChar(sql.MAX);
}

module.exports = { getPool, closePool, executeQuery, executeProcedure, sql };
