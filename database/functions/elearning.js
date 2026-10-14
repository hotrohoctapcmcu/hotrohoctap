/**
 * database/functions/elearning.js
 * Quản lý bài học theo tuần, tiến độ đã học/chưa học từ eLearning
 */

const { executeProcedure } = require('../connection/db');

/**
 * Lấy toàn bộ bài học eLearning và trạng thái của sinh viên theo môn
 * @param {number} userId - ID người dùng
 * @param {number} subjectId - ID môn học
 * @returns {Promise<Array>} Danh sách bài học kèm trạng thái học tập
 */
async function getElearning(userId, subjectId) {
    if (!userId || !subjectId) throw new Error('userId và subjectId là bắt buộc');
    return await executeProcedure('dbo.sp_GetElearning', {
        userId: parseInt(userId, 10),
        subjectId: parseInt(subjectId, 10)
    });
}

/**
 * Lấy bài học eLearning theo tuần cụ thể
 * @param {number} userId - ID người dùng
 * @param {number} subjectId - ID môn học
 * @param {number} week - Số tuần (e.g. 1, 2)
 * @returns {Promise<Array>} Danh sách bài học của tuần
 */
async function getLessonsByWeek(userId, subjectId, week) {
    if (!userId || !subjectId || !week) throw new Error('userId, subjectId và week là bắt buộc');
    return await executeProcedure('dbo.sp_GetLessonsByWeek', {
        userId: parseInt(userId, 10),
        subjectId: parseInt(subjectId, 10),
        weekNumber: parseInt(week, 10)
    });
}

/**
 * Lấy thống kê tiến độ học tập môn (Tỷ lệ %, số bài hoàn thành/chưa hoàn thành)
 * @param {number} userId - ID người dùng
 * @param {number} [subjectId] - ID môn học (tùy chọn, nếu không truyền sẽ lấy toàn bộ)
 * @returns {Promise<Array>} Thống kê tiến độ theo môn
 */
async function getLearningProgress(userId, subjectId = null) {
    if (!userId) throw new Error('userId là bắt buộc');
    return await executeProcedure('dbo.sp_GetLearningProgress', {
        userId: parseInt(userId, 10),
        subjectId: subjectId ? parseInt(subjectId, 10) : null
    });
}

/**
 * Cập nhật tiến độ học tập một bài học eLearning
 * @param {number} userId - ID người dùng
 * @param {number} lessonId - ID bài học eLearning
 * @param {boolean} isCompleted - Trạng thái hoàn thành (true/false)
 * @param {number} [progressPercent=100] - Tiến độ % (0 - 100)
 * @param {number} [timeSpent=0] - Thời gian học thêm (giây)
 * @returns {Promise<Object>} Tiến độ sau khi cập nhật
 */
async function updateLessonProgress(userId, lessonId, isCompleted, progressPercent = 100, timeSpent = 0) {
    if (!userId || !lessonId) throw new Error('userId và lessonId là bắt buộc');
    const records = await executeProcedure('dbo.sp_UpdateLessonProgress', {
        userId: parseInt(userId, 10),
        lessonId: parseInt(lessonId, 10),
        isCompleted: isCompleted ? 1 : 0,
        progressPercent: parseFloat(progressPercent),
        timeSpent: parseInt(timeSpent, 10)
    });
    return records.length > 0 ? records[0] : null;
}

module.exports = {
    getElearning,
    getLessonsByWeek,
    getLearningProgress,
    updateLessonProgress
};
