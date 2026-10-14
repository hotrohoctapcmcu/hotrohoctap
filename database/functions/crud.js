/**
 * database/functions/crud.js
 * Các hàm CRUD dùng chung an toàn (Parameterization, kiểm tra tên bảng/cột chống SQL Injection)
 */

const { getPool, executeQuery, sql } = require('../connection/db');

// Danh sách trắng các bảng cho phép truy vấn động
const ALLOWED_TABLES = [
    'Users', 'Students', 'Subjects', 'StudentSubjects', 'Grades',
    'Timetables', 'Exams', 'EduxChapters', 'EduxLessons', 'EduxMaterials',
    'ElearningWeeks', 'ElearningLessons', 'StudentElearningProgress',
    'Assignments', 'Checklists', 'Reminders', 'Tags', 'EntityTags',
    'StudySessions', 'SyncLogs'
];

function validateTableName(table) {
    const cleanTable = table.replace(/^dbo\./i, '');
    if (!ALLOWED_TABLES.map(t => t.toLowerCase()).includes(cleanTable.toLowerCase())) {
        throw new Error(`Tên bảng '${table}' không nằm trong danh sách cho phép.`);
    }
    return `[dbo].[${cleanTable}]`;
}

/**
 * Thêm một bản ghi vào bảng
 * @param {string} table - Tên bảng
 * @param {Object} data - Dữ liệu dạng key-value
 * @returns {Promise<Object>} Bản ghi vừa được thêm
 */
async function insertData(table, data) {
    const safeTable = validateTableName(table);
    const pool = await getPool();
    const request = pool.request();

    const keys = Object.keys(data);
    if (keys.length === 0) throw new Error('Dữ liệu chèn không được rỗng');

    const columns = keys.map(k => `[${k}]`).join(', ');
    const params = keys.map(k => `@${k}`).join(', ');

    for (const key of keys) {
        request.input(key, data[key]);
    }

    const queryStr = `
        INSERT INTO ${safeTable} (${columns})
        OUTPUT inserted.*
        VALUES (${params});
    `;

    const result = await request.query(queryStr);
    return result.recordset[0];
}

/**
 * Cập nhật bản ghi theo ID
 * @param {string} table - Tên bảng
 * @param {string} idColumn - Tên cột khóa chính
 * @param {number|string} id - Giá trị khóa chính
 * @param {Object} data - Dữ liệu cần cập nhật
 * @returns {Promise<Object>} Bản ghi sau cập nhật
 */
async function updateDataById(table, idColumn, id, data) {
    const safeTable = validateTableName(table);
    const pool = await getPool();
    const request = pool.request();

    const keys = Object.keys(data);
    if (keys.length === 0) throw new Error('Dữ liệu cập nhật không được rỗng');

    const setClauses = keys.map(k => `[${k}] = @${k}`).join(', ');

    for (const key of keys) {
        request.input(key, data[key]);
    }
    request.input('recordId', id);

    const queryStr = `
        UPDATE ${safeTable}
        SET ${setClauses}
        OUTPUT inserted.*
        WHERE [${idColumn}] = @recordId;
    `;

    const result = await request.query(queryStr);
    return result.recordset[0] || null;
}

/**
 * Xóa bản ghi theo ID
 * @param {string} table - Tên bảng
 * @param {string} idColumn - Tên cột khóa chính
 * @param {number|string} id - Giá trị khóa chính
 * @returns {Promise<boolean>} Kết quả xóa
 */
async function deleteDataById(table, idColumn, id) {
    const safeTable = validateTableName(table);
    const pool = await getPool();
    const request = pool.request();

    request.input('recordId', id);
    const queryStr = `DELETE FROM ${safeTable} WHERE [${idColumn}] = @recordId;`;
    const result = await request.query(queryStr);
    return result.rowsAffected[0] > 0;
}

/**
 * Truy vấn dữ liệu tự do kèm parameters an toàn
 * @param {string} query - Câu lệnh T-SQL
 * @param {Object} [params] - Tham số
 * @returns {Promise<Array>} Mảng bản ghi
 */
async function getData(query, params = {}) {
    return await executeQuery(query, params);
}

module.exports = {
    insertData,
    updateDataById,
    deleteDataById,
    getData
};
