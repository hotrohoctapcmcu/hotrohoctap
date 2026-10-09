/**
 * sprint1/backend/sprint1Service.js
 * ===================================================================================
 * BACKEND SERVICE LAYER - SPRINT 1 (CHỨC NĂNG 1, 2, 3, 4, 9, 18)
 * ===================================================================================
 * Cung cấp đầy đủ các hàm xử lý dữ liệu, gọi Stored Procedures, Views, Triggers
 * phục vụ toàn bộ nghiệp vụ Sprint 1 cho Backend / API Developer.
 * ===================================================================================
 */

const { getPool, executeQuery, executeProcedure, sql } = require('../../database/connection/db');
const { saveIUData } = require('../../database/functions/sync');

// ===================================================================================
// 1. CHỨC NĂNG 18: HỒ SƠ HỌC TẬP CÁ NHÂN (PERSONAL ACADEMIC PROFILE)
// ===================================================================================

/**
 * Lấy hồ sơ học tập cá nhân tổng hợp (Thông tin SV, GPA 10, GPA 4, Tín chỉ, Môn nợ, ...)
 * @param {number} userId - ID người dùng hoặc student_id
 * @returns {Promise<Object|null>} Hồ sơ sinh viên chi tiết
 */
async function layHoSo(userId) {
    if (!userId) throw new Error('userId là bắt buộc');
    const records = await executeProcedure('dbo.sp_Sprint1_GetStudentProfile', { userId: parseInt(userId, 10) });
    return records.length > 0 ? records[0] : null;
}

/**
 * Lưu hoặc cập nhật thông tin hồ sơ sinh viên
 * @param {number} userId - ID người dùng
 * @param {Object} data - Thông tin cập nhật { studentCode, fullName, major, dob, enrollmentYear, currentSemester, phone, avatarUrl }
 * @returns {Promise<Object>} Hồ sơ sau khi cập nhật
 */
async function luuHoSo(userId, data = {}) {
    if (!userId) throw new Error('userId là bắt buộc');
    if (!data.studentCode || !data.fullName || !data.major) {
        throw new Error('studentCode, fullName và major là bắt buộc');
    }
    const records = await executeProcedure('dbo.sp_Sprint1_SaveStudentProfile', {
        userId: parseInt(userId, 10),
        studentCode: data.studentCode,
        fullName: data.fullName,
        major: data.major,
        dob: data.dob || null,
        enrollmentYear: data.enrollmentYear || null,
        currentSemester: data.currentSemester || null,
        phone: data.phone || null,
        avatarUrl: data.avatarUrl || null
    });
    return records.length > 0 ? records[0] : null;
}

/**
 * Lấy toàn bộ bảng điểm hoặc lọc theo học kỳ cụ thể
 * @param {number} userId - ID người dùng
 * @param {string} [hocKy] - Tên học kỳ (ví dụ: 'ky_1', 'ky_2')
 * @returns {Promise<Array>} Danh sách điểm các môn
 */
async function layBangDiem(userId, hocKy = null) {
    if (!userId) throw new Error('userId là bắt buộc');
    return await executeProcedure('dbo.sp_Sprint1_GetBangDiem', {
        userId: parseInt(userId, 10),
        semester: hocKy
    });
}

/**
 * Lấy danh sách các môn chưa đạt (điểm F) cần đăng ký học lại
 * @param {number} userId - ID người dùng
 * @returns {Promise<Array>} Danh sách môn trượt
 */
async function layMonHocChuaDat(userId) {
    if (!userId) throw new Error('userId là bắt buộc');
    return await executeProcedure('dbo.sp_Sprint1_GetFailedSubjects', { userId: parseInt(userId, 10) });
}

/**
 * Lấy danh sách các môn đã hoàn thành đạt yêu cầu
 * @param {number} userId - ID người dùng
 * @returns {Promise<Array>} Danh sách môn đạt
 */
async function layMonHocDaDat(userId) {
    if (!userId) throw new Error('userId là bắt buộc');
    return await executeProcedure('dbo.sp_Sprint1_GetPassedSubjects', { userId: parseInt(userId, 10) });
}

/**
 * Lấy danh sách toàn bộ môn học trong chương trình đào tạo và trạng thái học tập
 * @param {number} userId - ID người dùng
 * @returns {Promise<Array>} Danh sách môn học và trạng thái (COMPLETED/STUDYING/PLANNED)
 */
async function layDanhSachMonHoc(userId) {
    if (!userId) throw new Error('userId là bắt buộc');
    return await executeProcedure('dbo.sp_Sprint1_GetSubjectsList', { userId: parseInt(userId, 10) });
}

/**
 * Đồng bộ dữ liệu hồ sơ và học tập từ crawler IU
 * @param {number} userId - ID người dùng
 * @param {Object} dataIU - Dữ liệu JSON trả về từ crawler IU
 * @returns {Promise<Object>} Kết quả đồng bộ
 */
async function dongBoHoSoIU(userId, dataIU) {
    if (!userId) throw new Error('userId là bắt buộc');
    if (!dataIU) throw new Error('dataIU là bắt buộc');
    return await saveIUData(userId, dataIU);
}

// ===================================================================================
// 2. CHỨC NĂNG 1: THỜI KHÓA BIỂU THÔNG MINH (SMART TIMETABLE)
// ===================================================================================

/**
 * Lấy toàn bộ thời khóa biểu của sinh viên
 * @param {number} userId - ID người dùng
 * @returns {Promise<Array>} Danh sách tất cả các tiết học
 */
async function layThoiKhoaBieu(userId) {
    if (!userId) throw new Error('userId là bắt buộc');
    return await executeProcedure('dbo.sp_Sprint1_GetTKB', { userId: parseInt(userId, 10) });
}

/**
 * Lấy thời khóa biểu theo ngày cụ thể (YYYY-MM-DD)
 * @param {number} userId - ID người dùng
 * @param {string|Date} ngay - Ngày cần xem (ví dụ: '2026-09-08')
 * @returns {Promise<Array>} Danh sách tiết học trong ngày
 */
async function layThoiKhoaBieuTheoNgay(userId, ngay) {
    if (!userId) throw new Error('userId là bắt buộc');
    if (!ngay) throw new Error('ngay là bắt buộc');
    return await executeProcedure('dbo.sp_Sprint1_GetTKBByDate', {
        userId: parseInt(userId, 10),
        targetDate: ngay
    });
}

/**
 * Lấy thời khóa biểu theo tuần (từ ngày đến ngày)
 * @param {number} userId - ID người dùng
 * @param {string|Date} tuNgay - Ngày bắt đầu tuần (YYYY-MM-DD)
 * @param {string|Date} denNgay - Ngày kết thúc tuần (YYYY-MM-DD)
 * @returns {Promise<Array>} Danh sách tiết học trong tuần
 */
async function layThoiKhoaBieuTheoTuan(userId, tuNgay, denNgay) {
    if (!userId) throw new Error('userId là bắt buộc');
    if (!tuNgay || !denNgay) throw new Error('tuNgay và denNgay là bắt buộc');
    return await executeProcedure('dbo.sp_Sprint1_GetTKBByWeek', {
        userId: parseInt(userId, 10),
        startDate: tuNgay,
        endDate: denNgay
    });
}

/**
 * Lấy thời khóa biểu của một môn học cụ thể
 * @param {number} userId - ID người dùng
 * @param {number} subjectId - ID môn học
 * @returns {Promise<Array>} Lịch học của môn
 */
async function layThoiKhoaBieuTheoMon(userId, subjectId) {
    if (!userId) throw new Error('userId là bắt buộc');
    if (!subjectId) throw new Error('subjectId là bắt buộc');
    return await executeProcedure('dbo.sp_Sprint1_GetTKBBySubject', {
        userId: parseInt(userId, 10),
        subjectId: parseInt(subjectId, 10)
    });
}

/**
 * Thêm một tiết học thủ công vào thời khóa biểu
 * @param {number} userId - ID người dùng
 * @param {Object} data - Thông tin tiết học
 * @returns {Promise<Object>} ID tiết học vừa tạo
 */
async function themTietHoc(userId, data = {}) {
    if (!userId) throw new Error('userId là bắt buộc');
    if (!data.subjectId || !data.className || !data.room || !data.dayOfWeek || !data.startTime || !data.endTime) {
        throw new Error('subjectId, className, room, dayOfWeek, startTime, endTime là bắt buộc');
    }
    const records = await executeProcedure('dbo.sp_Sprint1_SaveTimetable', {
        userId: parseInt(userId, 10),
        subjectId: parseInt(data.subjectId, 10),
        className: data.className,
        room: data.room,
        campus: data.campus || 'Cơ sở chính',
        dayOfWeek: parseInt(data.dayOfWeek, 10),
        startTime: data.startTime,
        endTime: data.endTime,
        startDate: data.startDate || '2026-09-01',
        endDate: data.endDate || '2026-12-31',
        lecturerName: data.lecturerName || null,
        semester: data.semester || null,
        academicYear: data.academicYear || null
    });
    return records.length > 0 ? records[0] : null;
}

/**
 * Xóa một tiết học khỏi thời khóa biểu
 * @param {number} timetableId - ID tiết học
 * @returns {Promise<boolean>} Kết quả xóa
 */
async function xoaTietHoc(timetableId) {
    if (!timetableId) throw new Error('timetableId là bắt buộc');
    await executeQuery('DELETE FROM dbo.Timetables WHERE timetable_id = @timetableId', {
        timetableId: parseInt(timetableId, 10)
    });
    return true;
}

// ===================================================================================
// 3. CHỨC NĂNG 2: AI XẾP LỊCH TỰ HỌC & CẢNH BÁO TRÙNG (SCHEDULING & CONFLICT ALERT)
// ===================================================================================

/**
 * Kiểm tra và cảnh báo các lớp học chính khóa bị trùng lịch nhau
 * @param {number} userId - ID người dùng
 * @returns {Promise<Array>} Danh sách các cặp lớp học bị xung đột thời gian
 */
async function kiemTraTrungLich(userId) {
    if (!userId) throw new Error('userId là bắt buộc');
    return await executeProcedure('dbo.sp_Sprint1_CheckTimetableConflicts', { userId: parseInt(userId, 10) });
}

/**
 * Kiểm tra xem một khoảng thời gian tự học dự kiến có bị xung đột với TKB chính khóa hay lịch tự học khác không
 * @param {number} userId - ID người dùng
 * @param {string|Date} studyDate - Ngày tự học (YYYY-MM-DD)
 * @param {string} startTime - Giờ bắt đầu (HH:MM:SS)
 * @param {string} endTime - Giờ kết thúc (HH:MM:SS)
 * @param {number} [excludeScheduleId] - Bỏ qua ID lịch đang cập nhật
 * @returns {Promise<Array>} Danh sách các xung đột phát hiện được (nếu mảng rỗng nghĩa là hợp lệ)
 */
async function kiemTraXungDotLichTuHoc(userId, studyDate, startTime, endTime, excludeScheduleId = null) {
    if (!userId) throw new Error('userId là bắt buộc');
    if (!studyDate || !startTime || !endTime) throw new Error('studyDate, startTime và endTime là bắt buộc');
    return await executeProcedure('dbo.sp_Sprint1_CheckStudyConflict', {
        userId: parseInt(userId, 10),
        studyDate: studyDate,
        startTime: startTime,
        endTime: endTime,
        excludeScheduleId: excludeScheduleId ? parseInt(excludeScheduleId, 10) : null
    });
}

/**
 * Xếp lịch tự học mới (có tự động kiểm tra trùng trước khi lưu)
 * @param {number} userId - ID người dùng
 * @param {Object} data - Thông tin lịch tự học { subjectId, title, studyDate, startTime, endTime, isAiSuggested, notes, forceSave }
 * @returns {Promise<Object>} Bản ghi lịch tự học vừa xếp
 */
async function xepLichTuHoc(userId, data = {}) {
    if (!userId) throw new Error('userId là bắt buộc');
    if (!data.title || !data.studyDate || !data.startTime || !data.endTime) {
        throw new Error('title, studyDate, startTime, endTime là bắt buộc');
    }
    const records = await executeProcedure('dbo.sp_Sprint1_SaveStudySchedule', {
        userId: parseInt(userId, 10),
        subjectId: data.subjectId ? parseInt(data.subjectId, 10) : null,
        title: data.title,
        studyDate: data.studyDate,
        startTime: data.startTime,
        endTime: data.endTime,
        isAiSuggested: data.isAiSuggested ? 1 : 0,
        notes: data.notes || null,
        forceSave: data.forceSave ? 1 : 0
    });
    return records.length > 0 ? records[0] : null;
}

/**
 * Lấy danh sách lịch tự học của sinh viên trong khoảng thời gian
 * @param {number} userId - ID người dùng
 * @param {string|Date} [tuNgay] - Ngày bắt đầu
 * @param {string|Date} [denNgay] - Ngày kết thúc
 * @returns {Promise<Array>} Danh sách các buổi tự học
 */
async function layLichTuHoc(userId, tuNgay = null, denNgay = null) {
    if (!userId) throw new Error('userId là bắt buộc');
    return await executeProcedure('dbo.sp_Sprint1_GetStudySchedules', {
        userId: parseInt(userId, 10),
        startDate: tuNgay,
        endDate: denNgay
    });
}

/**
 * Thuật toán thông minh: Tìm các khoảng thời gian trống (Free Slots) trong ngày để AI gợi ý tự học
 * @param {number} userId - ID người dùng
 * @param {string|Date} ngay - Ngày cần tìm (YYYY-MM-DD)
 * @param {number} [thoiLuongPhut=60] - Thời lượng tối thiểu của slot tự học (mặc định 60 phút)
 * @returns {Promise<Array>} Danh sách các khung giờ trống có thể học [ { start: '14:00', end: '16:00', durationMinutes: 120 } ]
 */
async function timKhoangTrongTuHoc(userId, ngay, thoiLuongPhut = 60) {
    if (!userId || !ngay) throw new Error('userId và ngay là bắt buộc');

    // Lấy các tiết học trong TKB của ngày đó
    const tkbToday = await layThoiKhoaBieuTheoNgay(userId, ngay);
    // Lấy các lịch tự học đã xếp trong ngày đó
    const studyToday = await layLichTuHoc(userId, ngay, ngay);

    const formatTime = val => {
        if (!val) return '00:00';
        if (typeof val === 'string') return val.substring(0, 5);
        if (val instanceof Date) {
            return val.toISOString().substring(11, 16);
        }
        return String(val).substring(0, 5);
    };

    // Gom tất cả các khoảng thời gian đã bận trong ngày (từ 07:00 đến 22:00)
    const busySlots = [];
    for (const t of tkbToday) {
        busySlots.push({ start: formatTime(t.start_time), end: formatTime(t.end_time) });
    }
    for (const s of studyToday) {
        if (s.status !== 'CANCELLED') {
            busySlots.push({ start: formatTime(s.start_time), end: formatTime(s.end_time) });
        }
    }

    // Sắp xếp busy slots theo giờ bắt đầu
    busySlots.sort((a, b) => a.start.localeCompare(b.start));

    // Khung giờ học cho phép: 07:00 -> 22:00
    const dayStart = '07:00';
    const dayEnd = '22:00';

    const toMinutes = str => {
        const [h, m] = str.split(':').map(Number);
        return h * 60 + m;
    };
    const toTimeString = min => {
        const h = Math.floor(min / 60).toString().padStart(2, '0');
        const m = (min % 60).toString().padStart(2, '0');
        return `${h}:${m}`;
    };

    const freeSlots = [];
    let currentMin = toMinutes(dayStart);

    for (const slot of busySlots) {
        const slotStartMin = toMinutes(slot.start);
        const slotEndMin = toMinutes(slot.end);

        if (slotStartMin > currentMin) {
            const gap = slotStartMin - currentMin;
            if (gap >= thoiLuongPhut) {
                freeSlots.push({
                    start_time: toTimeString(currentMin),
                    end_time: toTimeString(slotStartMin),
                    duration_minutes: gap
                });
            }
        }
        if (slotEndMin > currentMin) {
            currentMin = slotEndMin;
        }
    }

    const dayEndMin = toMinutes(dayEnd);
    if (dayEndMin > currentMin) {
        const gap = dayEndMin - currentMin;
        if (gap >= thoiLuongPhut) {
            freeSlots.push({
                start_time: toTimeString(currentMin),
                end_time: toTimeString(dayEndMin),
                duration_minutes: gap
            });
        }
    }

    return freeSlots;
}

/**
 * Cập nhật trạng thái lịch tự học (PLANNED, IN_PROGRESS, COMPLETED, CANCELLED)
 * @param {number} scheduleId - ID lịch tự học
 * @param {string} status - Trạng thái mới
 * @returns {Promise<boolean>} Kết quả
 */
async function capNhatTrangThaiLichTuHoc(scheduleId, status) {
    if (!scheduleId || !status) throw new Error('scheduleId và status là bắt buộc');
    await executeQuery(`
        UPDATE dbo.StudySchedules 
        SET status = @status, updated_at = SYSDATETIME() 
        WHERE schedule_id = @scheduleId
    `, {
        scheduleId: parseInt(scheduleId, 10),
        status: status
    });
    return true;
}

/**
 * Xóa lịch tự học
 * @param {number} scheduleId - ID lịch tự học
 * @returns {Promise<boolean>} Kết quả
 */
async function xoaLichTuHoc(scheduleId) {
    if (!scheduleId) throw new Error('scheduleId là bắt buộc');
    await executeQuery('DELETE FROM dbo.StudySchedules WHERE schedule_id = @scheduleId', {
        scheduleId: parseInt(scheduleId, 10)
    });
    return true;
}

// ===================================================================================
// 4. CHỨC NĂNG 3: QUẢN LÝ DEADLINE VÀ CHECKLIST (DEADLINE & CHECKLIST)
// ===================================================================================

/**
 * Lấy toàn bộ danh sách bài tập / deadline của sinh viên
 * @param {number} userId - ID người dùng
 * @param {string} [trangThai] - Lọc theo trạng thái ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE')
 * @returns {Promise<Array>} Danh sách bài tập
 */
async function layDanhSachDeadline(userId, trangThai = null) {
    if (!userId) throw new Error('userId là bắt buộc');
    return await executeProcedure('dbo.sp_Sprint1_GetAssignments', {
        userId: parseInt(userId, 10),
        status: trangThai
    });
}

/**
 * Lấy các deadline sắp đến hạn (trong vòng soNgay tới)
 * @param {number} userId - ID người dùng
 * @param {number} [soNgay=3] - Số ngày đếm tới
 * @returns {Promise<Array>} Danh sách deadline cấp bách
 */
async function layDeadlineSapToi(userId, soNgay = 3) {
    if (!userId) throw new Error('userId là bắt buộc');
    return await executeProcedure('dbo.sp_Sprint1_GetUpcomingDeadlines', {
        userId: parseInt(userId, 10),
        daysAhead: parseInt(soNgay, 10)
    });
}

/**
 * Thêm bài tập mới (Trigger trong DB sẽ tự động sinh các tầng nhắc nhở 3 ngày, 24 giờ, 1 giờ)
 * @param {number} userId - ID người dùng
 * @param {Object} data - Thông tin bài tập { subjectId, title, description, deadline, source, submissionUrl, externalId }
 * @returns {Promise<Object>} Bài tập vừa tạo
 */
async function themBaiTap(userId, data = {}) {
    if (!userId) throw new Error('userId là bắt buộc');
    if (!data.subjectId || !data.title || !data.deadline) {
        throw new Error('subjectId, title và deadline là bắt buộc');
    }
    const records = await executeProcedure('dbo.sp_Sprint1_CreateAssignment', {
        userId: parseInt(userId, 10),
        subjectId: parseInt(data.subjectId, 10),
        title: data.title,
        description: data.description || null,
        deadline: data.deadline,
        source: data.source || 'SYSTEM',
        submissionUrl: data.submissionUrl || null,
        externalId: data.externalId || null
    });
    return records.length > 0 ? records[0] : null;
}

/**
 * Cập nhật thông tin bài tập
 * @param {number} assignmentId - ID bài tập
 * @param {Object} data - Thông tin sửa { title, description, deadline }
 * @returns {Promise<Object>} Bản ghi sau cập nhật
 */
async function capNhatBaiTap(assignmentId, data = {}) {
    if (!assignmentId) throw new Error('assignmentId là bắt buộc');
    await executeQuery(`
        UPDATE dbo.Assignments
        SET title = ISNULL(@title, title),
            description = ISNULL(@description, description),
            deadline = ISNULL(@deadline, deadline),
            updated_at = SYSDATETIME()
        WHERE assignment_id = @assignmentId
    `, {
        assignmentId: parseInt(assignmentId, 10),
        title: data.title || null,
        description: data.description || null,
        deadline: data.deadline || null
    });
    const res = await executeQuery('SELECT * FROM dbo.Assignments WHERE assignment_id = @id', { id: assignmentId });
    return res.length > 0 ? res[0] : null;
}

/**
 * Cập nhật trạng thái bài tập (COMPLETED, IN_PROGRESS, PENDING, OVERDUE)
 * @param {number} assignmentId - ID bài tập
 * @param {string} trangThai - Trạng thái mới
 * @returns {Promise<Object>} Bản ghi sau cập nhật
 */
async function capNhatTrangThaiBaiTap(assignmentId, trangThai) {
    if (!assignmentId || !trangThai) throw new Error('assignmentId và trangThai là bắt buộc');
    const records = await executeProcedure('dbo.sp_Sprint1_UpdateAssignmentStatus', {
        assignmentId: parseInt(assignmentId, 10),
        status: trangThai
    });
    return records.length > 0 ? records[0] : null;
}

/**
 * Xóa bài tập và tự động xóa các nhắc nhở liên quan
 * @param {number} assignmentId - ID bài tập
 * @returns {Promise<boolean>} Kết quả
 */
async function xoaBaiTap(assignmentId) {
    if (!assignmentId) throw new Error('assignmentId là bắt buộc');
    await executeQuery(`
        DELETE FROM dbo.Reminders WHERE target_type = 'ASSIGNMENT' AND target_id = @id;
        DELETE FROM dbo.Assignments WHERE assignment_id = @id;
    `, { id: parseInt(assignmentId, 10) });
    return true;
}

/**
 * Lấy danh sách checklist công việc cá nhân
 * @param {number} userId - ID người dùng
 * @returns {Promise<Array>} Danh sách công việc cá nhân
 */
async function layChecklist(userId) {
    if (!userId) throw new Error('userId là bắt buộc');
    return await executeProcedure('dbo.sp_Sprint1_GetChecklist', { userId: parseInt(userId, 10) });
}

/**
 * Thêm công việc mới vào Checklist
 * @param {number} userId - ID người dùng
 * @param {Object} data - { subjectId, assignmentId, title, description, priority, deadline }
 * @returns {Promise<Object>} Bản ghi vừa tạo
 */
async function themChecklist(userId, data = {}) {
    if (!userId) throw new Error('userId là bắt buộc');
    if (!data.title) throw new Error('title là bắt buộc');
    const records = await executeProcedure('dbo.sp_Sprint1_CreateChecklist', {
        userId: parseInt(userId, 10),
        subjectId: data.subjectId ? parseInt(data.subjectId, 10) : null,
        assignmentId: data.assignmentId ? parseInt(data.assignmentId, 10) : null,
        title: data.title,
        description: data.description || null,
        priority: data.priority || 'MEDIUM',
        deadline: data.deadline || null
    });
    return records.length > 0 ? records[0] : null;
}

/**
 * Cập nhật nội dung task Checklist
 * @param {number} checklistId - ID task
 * @param {Object} data - { title, description, priority, deadline }
 * @returns {Promise<Object>} Bản ghi sau cập nhật
 */
async function capNhatChecklist(checklistId, data = {}) {
    if (!checklistId) throw new Error('checklistId là bắt buộc');
    await executeQuery(`
        UPDATE dbo.Checklists
        SET title = ISNULL(@title, title),
            description = ISNULL(@description, description),
            priority = ISNULL(@priority, priority),
            deadline = ISNULL(@deadline, deadline),
            updated_at = SYSDATETIME()
        WHERE checklist_id = @checklistId
    `, {
        checklistId: parseInt(checklistId, 10),
        title: data.title || null,
        description: data.description || null,
        priority: data.priority || null,
        deadline: data.deadline || null
    });
    const res = await executeQuery('SELECT * FROM dbo.Checklists WHERE checklist_id = @id', { id: checklistId });
    return res.length > 0 ? res[0] : null;
}

/**
 * Đánh dấu hoàn thành / chưa hoàn thành Checklist
 * @param {number} checklistId - ID task
 * @param {boolean} [isCompleted=true] - true nếu xong, false nếu bỏ chọn
 * @returns {Promise<Object>} Bản ghi sau cập nhật
 */
async function hoanThanhChecklist(checklistId, isCompleted = true) {
    if (!checklistId) throw new Error('checklistId là bắt buộc');
    const records = await executeProcedure('dbo.sp_Sprint1_CompleteChecklist', {
        checklistId: parseInt(checklistId, 10),
        isCompleted: isCompleted ? 1 : 0
    });
    return records.length > 0 ? records[0] : null;
}

/**
 * Xóa task Checklist
 * @param {number} checklistId - ID task
 * @returns {Promise<boolean>} Kết quả
 */
async function xoaChecklist(checklistId) {
    if (!checklistId) throw new Error('checklistId là bắt buộc');
    await executeQuery('DELETE FROM dbo.Checklists WHERE checklist_id = @id', { id: parseInt(checklistId, 10) });
    return true;
}

// ===================================================================================
// 5. CHỨC NĂNG 4: NHẮC NHỞ THÔNG MINH ĐA TẦNG (MULTI-TIER SMART REMINDERS)
// ===================================================================================

/**
 * Lấy toàn bộ danh sách nhắc nhở của sinh viên
 * @param {number} userId - ID người dùng
 * @returns {Promise<Array>} Danh sách nhắc nhở
 */
async function layDanhSachNhacNho(userId) {
    if (!userId) throw new Error('userId là bắt buộc');
    return await executeProcedure('dbo.sp_Sprint1_GetReminders', { userId: parseInt(userId, 10) });
}

/**
 * Tạo một nhắc nhở đơn lẻ
 * @param {number} userId - ID người dùng
 * @param {Object} data - { targetType, targetId, title, message, tier, remindTime, channel }
 * @returns {Promise<Object>} Nhắc nhở vừa tạo
 */
async function taoNhacNho(userId, data = {}) {
    if (!userId) throw new Error('userId là bắt buộc');
    if (!data.targetType || !data.targetId || !data.title || !data.remindTime) {
        throw new Error('targetType, targetId, title và remindTime là bắt buộc');
    }
    const studentRes = await executeQuery('SELECT student_id FROM dbo.Students WHERE user_id = @userId OR student_id = @userId', { userId });
    if (studentRes.length === 0) throw new Error('Không tìm thấy thông tin sinh viên');
    const studentId = studentRes[0].student_id;

    const res = await executeQuery(`
        INSERT INTO dbo.Reminders (student_id, target_type, target_id, title, message, tier, remind_time, channel)
        VALUES (@studentId, @targetType, @targetId, @title, @message, @tier, @remindTime, @channel);
        SELECT SCOPE_IDENTITY() AS reminder_id;
    `, {
        studentId,
        targetType: data.targetType,
        targetId: parseInt(data.targetId, 10),
        title: data.title,
        message: data.message || null,
        tier: data.tier || 'CUSTOM',
        remindTime: data.remindTime,
        channel: data.channel || 'APP'
    });
    return res.length > 0 ? res[0] : null;
}

/**
 * Tạo bộ nhắc nhở đa tầng tự động (7 ngày, 3 ngày, 24 giờ, 1 giờ)
 * @param {number} userId - ID người dùng
 * @param {string} targetType - 'ASSIGNMENT' | 'EXAM' | 'STUDY_PLAN' | 'CUSTOM'
 * @param {number} targetId - ID đối tượng
 * @param {string} title - Tiêu đề nhắc nhở
 * @param {string|Date} deadline - Thời hạn chót
 * @param {string} [channel='APP'] - Kênh gửi ('APP' | 'EMAIL' | 'NOTIFICATION')
 * @returns {Promise<Object>} Số bản ghi nhắc nhở được tạo
 */
async function taoNhacNhoDaTang(userId, targetType, targetId, title, deadline, channel = 'APP') {
    if (!userId || !targetType || !targetId || !title || !deadline) {
        throw new Error('userId, targetType, targetId, title, deadline là bắt buộc');
    }
    const studentRes = await executeQuery('SELECT student_id FROM dbo.Students WHERE user_id = @userId OR student_id = @userId', { userId });
    if (studentRes.length === 0) throw new Error('Không tìm thấy thông tin sinh viên');
    const studentId = studentRes[0].student_id;

    const records = await executeProcedure('dbo.sp_Sprint1_CreateMultiTierReminders', {
        studentId,
        targetType,
        targetId: parseInt(targetId, 10),
        title,
        deadline,
        channel
    });
    return records.length > 0 ? records[0] : null;
}

/**
 * Quét danh sách các nhắc nhở đã đến hạn gửi thông báo nhưng chưa gửi (dùng cho Cron Job/Worker)
 * @returns {Promise<Array>} Danh sách các thông báo cần gửi
 */
async function layNhacNhoDenHanChuaGui() {
    return await executeProcedure('dbo.sp_Sprint1_GetDueReminders');
}

/**
 * Đánh dấu nhắc nhở đã được gửi thông báo thành công
 * @param {number} reminderId - ID nhắc nhở
 * @returns {Promise<boolean>} Kết quả
 */
async function danhDauDaGuiNhacNho(reminderId) {
    if (!reminderId) throw new Error('reminderId là bắt buộc');
    const records = await executeProcedure('dbo.sp_Sprint1_MarkReminderSent', {
        reminderId: parseInt(reminderId, 10)
    });
    return records.length > 0 && records[0].success === 1;
}

/**
 * Xóa nhắc nhở
 * @param {number} reminderId - ID nhắc nhở
 * @returns {Promise<boolean>} Kết quả
 */
async function xoaNhacNho(reminderId) {
    if (!reminderId) throw new Error('reminderId là bắt buộc');
    await executeQuery('DELETE FROM dbo.Reminders WHERE reminder_id = @id', { id: parseInt(reminderId, 10) });
    return true;
}

// ===================================================================================
// 6. CHỨC NĂNG 9: QUẢN LÝ LỊCH THI VÀ KẾ HOẠCH ÔN THI (EXAM & STUDY PLANS)
// ===================================================================================

/**
 * Lấy toàn bộ lịch thi của sinh viên
 * @param {number} userId - ID người dùng
 * @returns {Promise<Array>} Toàn bộ các môn thi
 */
async function layLichThi(userId) {
    if (!userId) throw new Error('userId là bắt buộc');
    return await executeProcedure('dbo.sp_Sprint1_GetExams', { userId: parseInt(userId, 10) });
}

/**
 * Lấy danh sách kỳ thi sắp tới kèm số ngày đếm ngược (days_remaining)
 * @param {number} userId - ID người dùng
 * @returns {Promise<Array>} Lịch thi sắp tới
 */
async function layLichThiSapToi(userId) {
    if (!userId) throw new Error('userId là bắt buộc');
    return await executeProcedure('dbo.sp_Sprint1_GetUpcomingExams', { userId: parseInt(userId, 10) });
}

/**
 * Thêm một kỳ thi mới vào lịch thi (Trigger trong DB tự động tạo nhắc nhở 7 ngày, 3 ngày, 24 giờ)
 * @param {number} userId - ID người dùng
 * @param {Object} data - Thông tin kỳ thi { subjectId, examName, examDate, examTime, durationMinutes, room, campus, examFormat, identificationNumber }
 * @returns {Promise<Object>} Kỳ thi vừa tạo
 */
async function themLichThi(userId, data = {}) {
    if (!userId) throw new Error('userId là bắt buộc');
    if (!data.subjectId || !data.examDate || !data.examTime || !data.room) {
        throw new Error('subjectId, examDate, examTime và room là bắt buộc');
    }
    const records = await executeProcedure('dbo.sp_Sprint1_SaveExam', {
        userId: parseInt(userId, 10),
        subjectId: parseInt(data.subjectId, 10),
        examName: data.examName || 'Thi kết thúc học phần',
        examDate: data.examDate,
        examTime: data.examTime,
        durationMinutes: data.durationMinutes ? parseInt(data.durationMinutes, 10) : 90,
        room: data.room,
        campus: data.campus || 'Cơ sở 1',
        examFormat: data.examFormat || 'Tự luận',
        identificationNumber: data.identificationNumber || null
    });
    return records.length > 0 ? records[0] : null;
}

/**
 * Xóa một kỳ thi
 * @param {number} examId - ID kỳ thi
 * @returns {Promise<boolean>} Kết quả
 */
async function xoaLichThi(examId) {
    if (!examId) throw new Error('examId là bắt buộc');
    await executeQuery(`
        DELETE FROM dbo.Reminders WHERE target_type = 'EXAM' AND target_id = @id;
        DELETE FROM dbo.ExamStudyPlans WHERE exam_id = @id;
        DELETE FROM dbo.Exams WHERE exam_id = @id;
    `, { id: parseInt(examId, 10) });
    return true;
}

/**
 * Lấy danh sách các kế hoạch / giai đoạn ôn thi của sinh viên
 * @param {number} userId - ID người dùng
 * @param {number} [examId] - Lọc theo môn thi cụ thể
 * @returns {Promise<Array>} Danh sách kế hoạch ôn thi
 */
async function layKeHoachOnThi(userId, examId = null) {
    if (!userId) throw new Error('userId là bắt buộc');
    return await executeProcedure('dbo.sp_Sprint1_GetExamStudyPlans', {
        userId: parseInt(userId, 10),
        examId: examId ? parseInt(examId, 10) : null
    });
}

/**
 * Tạo mới một giai đoạn kế hoạch ôn thi
 * @param {number} userId - ID người dùng
 * @param {Object} data - { examId, phaseTitle, targetDescription, startDate, endDate, priority, notes }
 * @returns {Promise<Object>} Bản ghi vừa tạo
 */
async function taoKeHoachOnThi(userId, data = {}) {
    if (!userId) throw new Error('userId là bắt buộc');
    if (!data.examId || !data.phaseTitle || !data.startDate || !data.endDate) {
        throw new Error('examId, phaseTitle, startDate, endDate là bắt buộc');
    }
    const records = await executeProcedure('dbo.sp_Sprint1_CreateExamStudyPlan', {
        userId: parseInt(userId, 10),
        examId: parseInt(data.examId, 10),
        phaseTitle: data.phaseTitle,
        targetDescription: data.targetDescription || null,
        startDate: data.startDate,
        endDate: data.endDate,
        priority: data.priority || 'HIGH',
        notes: data.notes || null
    });
    return records.length > 0 ? records[0] : null;
}

/**
 * Cập nhật trạng thái kế hoạch ôn thi (PLANNED, IN_PROGRESS, COMPLETED, CANCELLED)
 * @param {number} planId - ID kế hoạch ôn thi
 * @param {string} status - Trạng thái mới
 * @returns {Promise<boolean>} Kết quả
 */
async function capNhatTrangThaiKeHoachOnThi(planId, status) {
    if (!planId || !status) throw new Error('planId và status là bắt buộc');
    await executeQuery(`
        UPDATE dbo.ExamStudyPlans
        SET status = @status, updated_at = SYSDATETIME()
        WHERE plan_id = @planId
    `, {
        planId: parseInt(planId, 10),
        status: status
    });
    return true;
}

/**
 * Xóa một kế hoạch ôn thi
 * @param {number} planId - ID kế hoạch
 * @returns {Promise<boolean>} Kết quả
 */
async function xoaKeHoachOnThi(planId) {
    if (!planId) throw new Error('planId là bắt buộc');
    await executeQuery('DELETE FROM dbo.ExamStudyPlans WHERE plan_id = @id', { id: parseInt(planId, 10) });
    return true;
}

module.exports = {
    // Chức năng 18: Hồ sơ học tập cá nhân
    layHoSo,
    luuHoSo,
    layBangDiem,
    layMonHocChuaDat,
    layMonHocDaDat,
    layDanhSachMonHoc,
    dongBoHoSoIU,

    // Chức năng 1: Thời khóa biểu thông minh
    layThoiKhoaBieu,
    layThoiKhoaBieuTheoNgay,
    layThoiKhoaBieuTheoTuan,
    layThoiKhoaBieuTheoMon,
    themTietHoc,
    xoaTietHoc,

    // Chức năng 2: AI xếp lịch tự học & cảnh báo trùng
    kiemTraTrungLich,
    kiemTraXungDotLichTuHoc,
    xepLichTuHoc,
    layLichTuHoc,
    timKhoangTrongTuHoc,
    capNhatTrangThaiLichTuHoc,
    xoaLichTuHoc,

    // Chức năng 3: Quản lý Deadline và Checklist
    layDanhSachDeadline,
    layDeadlineSapToi,
    themBaiTap,
    capNhatBaiTap,
    capNhatTrangThaiBaiTap,
    xoaBaiTap,
    layChecklist,
    themChecklist,
    capNhatChecklist,
    hoanThanhChecklist,
    xoaChecklist,

    // Chức năng 4: Nhắc nhở thông minh đa tầng
    layDanhSachNhacNho,
    taoNhacNho,
    taoNhacNhoDaTang,
    layNhacNhoDenHanChuaGui,
    danhDauDaGuiNhacNho,
    xoaNhacNho,

    // Chức năng 9: Quản lý lịch thi và kế hoạch ôn thi
    layLichThi,
    layLichThiSapToi,
    themLichThi,
    xoaLichThi,
    layKeHoachOnThi,
    taoKeHoachOnThi,
    capNhatTrangThaiKeHoachOnThi,
    xoaKeHoachOnThi
};
