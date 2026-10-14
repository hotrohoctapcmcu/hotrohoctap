/**
 * database/functions/statistics.js
 * Thống kê, phân tích tiến độ học tập, điểm số, GPA và deadline
 */

const { executeProcedure } = require('../connection/db');

/**
 * Lấy tiến độ học tập tổng thể của sinh viên
 * @param {number} userId - ID người dùng
 * @returns {Promise<Array>} Tiến độ học tập từng môn
 */
async function getStudyProgress(userId) {
    if (!userId) throw new Error('userId là bắt buộc');
    return await executeProcedure('dbo.sp_GetStudyProgress', { userId: parseInt(userId, 10) });
}

/**
 * Lấy các chỉ số thống kê học tập (Tín chỉ đạt, GPA, bài tập hoàn thành/quá hạn, thời gian tự học)
 * @param {number} userId - ID người dùng
 * @returns {Promise<Object|null>} Thống kê số liệu
 */
async function getStudyStatistics(userId) {
    if (!userId) throw new Error('userId là bắt buộc');
    const records = await executeProcedure('dbo.sp_GetStudyStatistics', { userId: parseInt(userId, 10) });
    return records.length > 0 ? records[0] : null;
}

/**
 * Lấy danh sách các deadline sắp đến hạn (trong vòng 3 ngày)
 * @param {number} userId - ID người dùng
 * @returns {Promise<Array>} Danh sách bài tập sắp đến hạn
 */
async function getUpcomingDeadlines(userId) {
    if (!userId) throw new Error('userId là bắt buộc');
    return await executeProcedure('dbo.sp_GetUpcomingDeadlines', { userId: parseInt(userId, 10) });
}

/**
 * Lấy bản tóm tắt học tập của sinh viên (Learning Summary)
 * @param {number} userId - ID người dùng
 * @returns {Promise<Object>} Tóm tắt tiến độ, bài tập, lịch thi
 */
async function getLearningSummary(userId) {
    if (!userId) throw new Error('userId là bắt buộc');
    const stats = await getStudyStatistics(userId);
    const deadlines = await getUpcomingDeadlines(userId);
    return {
        statistics: stats,
        upcomingDeadlines: deadlines
    };
}

/**
 * Lấy hồ sơ học tập cá nhân toàn diện (Academic Profile)
 * @param {number} userId - ID người dùng
 * @returns {Promise<Object|null>} Hồ sơ sinh viên, điểm, tín chỉ
 */
async function getAcademicProfile(userId) {
    if (!userId) throw new Error('userId là bắt buộc');
    const records = await executeProcedure('dbo.sp_GetAcademicProfile', { userId: parseInt(userId, 10) });
    return records.length > 0 ? records[0] : null;
}

module.exports = {
    getStudyProgress,
    getStudyStatistics,
    getUpcomingDeadlines,
    getLearningSummary,
    getAcademicProfile
};
