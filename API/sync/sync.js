/**
 * API/sync/sync.js
 * ===================================================================================
 * MODULE ĐỒNG BỘ DỮ LIỆU TRƯỜNG CMC (SYNC MODULE)
 * ===================================================================================
 * Hỗ trợ đồng bộ dữ liệu từ 4 cổng trường:
 *   - IU CMC (cổng thông tin đào tạo): TKB, bảng điểm, lịch thi, thông tin SV
 *   - EduX CMC: Tài liệu môn học theo chương/slide
 *   - LMS CMC: Bài tập, deadline từ giảng viên
 *   - eLearning CMC: Bài học theo tuần
 *
 * ĐÃ XÁC NHẬN: Frontend đã có sync.auth-window.js mở cổng trường thật.
 * Module này nhận dữ liệu DO CRAWLER GỬI VỀ sau khi người dùng đăng nhập trên cổng trường.
 * ===================================================================================
 */

/**
 * Lấy danh sách các nguồn đồng bộ và trạng thái kết nối hiện tại.
 * Frontend dùng để hiển thị UI03 - màn hình đồng bộ dữ liệu.
 */
function layCacNguonDongBo() {
    return [
        {
            id: 'IU',
            name: 'Cổng thông tin IU CMC',
            url: 'https://iu.cmcu.edu.vn/congthongtin/Index.aspx',
            description: 'TKB, bảng điểm, lịch thi, thông tin sinh viên',
            icon: 'university',
            isRequired: true
        },
        {
            id: 'EDUX',
            name: 'EduX CMC',
            url: 'https://edux.cmcu.edu.vn/',
            description: 'Tài liệu môn học, bài giảng theo chương',
            icon: 'book',
            isRequired: false
        },
        {
            id: 'LMS',
            name: 'LMS CMC',
            url: 'https://lms.cmcu.edu.vn/',
            description: 'Bài tập, deadline từ giảng viên',
            icon: 'tasks',
            isRequired: false
        },
        {
            id: 'ELEARNING',
            name: 'eLearning CMC',
            url: 'https://elearning.cmcu.edu.vn/',
            description: 'Bài học theo tuần, đã học / chưa học',
            icon: 'video',
            isRequired: false
        }
    ];
}

/**
 * Khởi tạo job đồng bộ — trả về jobId để frontend polling trạng thái.
 * Thực tế, job này được xử lý bởi module CRWEB và sẽ callback về POST /auth/sync.
 * @param {string[]} sources - Danh sách nguồn cần đồng bộ ['IU', 'LMS', ...]
 * @param {number} userId
 * @returns {{ jobId: string, message: string }}
 */
function khoiTaoDongBo(sources, userId) {
    if (!sources || sources.length === 0) {
        throw Object.assign(new Error('Phải chọn ít nhất 1 nguồn đồng bộ.'), { statusCode: 400 });
    }
    // Tạo jobId đơn giản để frontend tracking
    const jobId = `sync_${userId}_${Date.now()}`;
    // Trong thực tế sẽ trigger worker/queue tại đây.
    // Sprint 1: chỉ trả jobId để FE biết job đã được khởi tạo.
    return {
        jobId,
        status: 'PENDING',
        sources,
        message: 'Đã khởi tạo đồng bộ. Vui lòng đăng nhập trên cổng trường để xác thực.'
    };
}

/**
 * Lấy trạng thái một job đồng bộ.
 * Sprint 1: trả về trạng thái giả lập — khi crawler tích hợp thật sẽ cập nhật.
 * @param {string} jobId
 */
function layTrangThaiJob(jobId) {
    if (!jobId) throw Object.assign(new Error('jobId là bắt buộc.'), { statusCode: 400 });
    // Stub response — Sprint 2 sẽ tra cứu queue thật
    return {
        jobId,
        status: 'PENDING',
        message: 'Đang chờ dữ liệu từ crawler...',
        completedSources: [],
        pendingSources: ['IU', 'LMS', 'EDUX', 'ELEARNING']
    };
}

module.exports = { layCacNguonDongBo, khoiTaoDongBo, layTrangThaiJob };
