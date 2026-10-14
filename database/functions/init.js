/**
 * database/functions/init.js
 * Các hàm khởi tạo và tiện ích bắt buộc theo Section 20:
 * 1. tao_bang() => tạo bảng
 * 2. lay_du_lieu() => lấy dữ liệu
 * 3. xoa_du_lieu() => xóa dữ liệu
 */

const fs = require('fs');
const path = require('path');
const { getPool, executeQuery, sql } = require('../connection/db');

/**
 * Khởi tạo toàn bộ cấu trúc bảng, view, stored procedure, trigger và dữ liệu mẫu nếu chưa có
 * @returns {Promise<boolean>} Trạng thái thành công
 */
async function tao_bang() {
    console.log('[tao_bang]: Đang kiểm tra và khởi tạo bảng...');
    const tablesPath = path.resolve(__dirname, '../tao_bang/all_tables.sql');
    if (!fs.existsSync(tablesPath)) {
        throw new Error(`File ${tablesPath} không tồn tại.`);
    }

    const script = fs.readFileSync(tablesPath, 'utf8');
    // Phân tách các batch bởi lệnh GO
    const batches = script
        .split(/^\s*GO\s*$/gim)
        .map(b => b.trim())
        .filter(b => b.length > 0 && !b.startsWith('USE master'));

    const pool = await getPool();
    for (const batch of batches) {
        try {
            await pool.request().query(batch);
        } catch (err) {
            // Bỏ qua lỗi USE hoặc database context nếu đã kết nối
            if (!batch.includes('CREATE DATABASE') && !batch.includes('USE QL_HocTap')) {
                console.warn('[tao_bang warning]:', err.message);
            }
        }
    }
    console.log('[tao_bang]: Hoàn tất khởi tạo bảng.');
    return true;
}

/**
 * Hàm tiện ích lấy dữ liệu
 * @param {string} queryStr - Câu truy vấn
 * @param {Object} [params] - Tham số
 * @returns {Promise<Array>} Kết quả
 */
async function lay_du_lieu(queryStr, params = {}) {
    return await executeQuery(queryStr, params);
}

/**
 * Hàm tiện ích xóa dữ liệu an toàn
 * @param {string} table - Tên bảng
 * @param {string} conditionCol - Cột điều kiện
 * @param {any} conditionVal - Giá trị điều kiện
 * @returns {Promise<number>} Số dòng bị xóa
 */
async function xoa_du_lieu(table, conditionCol, conditionVal) {
    const cleanTable = table.replace(/[^a-zA-Z0-9_]/g, '');
    const cleanCol = conditionCol.replace(/[^a-zA-Z0-9_]/g, '');

    const pool = await getPool();
    const req = pool.request();
    req.input('val', conditionVal);

    const queryStr = `DELETE FROM [dbo].[${cleanTable}] WHERE [${cleanCol}] = @val;`;
    const res = await req.query(queryStr);
    return res.rowsAffected[0] || 0;
}

module.exports = {
    tao_bang,
    lay_du_lieu,
    xoa_du_lieu
};
