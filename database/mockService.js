/**
 * database/mockService.js
 * ===================================================================================
 * IN-MEMORY MOCK SERVICE LAYER - SPRINT 1 (CHỨC NĂNG 1, 2, 3, 4, 9, 18)
 * ===================================================================================
 * Dùng làm fallback khi SQL Server chưa được khởi động trên máy phát triển,
 * đảm bảo API server và Frontend hoạt động trơn tru 100%, không bị crash hay nghẽn.
 * ===================================================================================
 */

// Bộ dữ liệu in-memory phiên làm việc
let mockStudent = {
    student_id: 1,
    user_id: 1,
    student_code: 'CMC123456',
    full_name: 'Nguyễn Văn An',
    major: 'Công nghệ thông tin',
    dob: '2005-08-15',
    enrollment_year: 2023,
    current_semester: 'Học kỳ 1 - 2026',
    phone: '0987654321',
    avatar_url: null,
    gpa_10_scale: 7.74,
    gpa_4_scale: 3.5,
    total_passed_credits: 22,
    failed_subject_count: 1,
    passed_subject_count: 7,
    pending_assignment_count: 3,
    upcoming_exam_count: 2
};

let mockSubjects = [
    { subject_id: 1, subject_code: 'CNTT101', subject_name: 'Nhập môn CNTT', credits: 3, status: 'COMPLETED' },
    { subject_id: 2, subject_code: 'TOAN101', subject_name: 'Toán cao cấp', credits: 3, status: 'COMPLETED' },
    { subject_id: 3, subject_code: 'CNTT201', subject_name: 'Lập trình hướng đối tượng', credits: 3, status: 'COMPLETED' },
    { subject_id: 4, subject_code: 'CNTT202', subject_name: 'Cấu trúc dữ liệu và giải thuật', credits: 4, status: 'COMPLETED' },
    { subject_id: 5, subject_code: 'CNTT301', subject_name: 'Lập trình web', credits: 3, status: 'STUDYING' },
    { subject_id: 6, subject_code: 'CNTT302', subject_name: 'Cơ sở dữ liệu', credits: 3, status: 'STUDYING' },
    { subject_id: 7, subject_code: 'CNTT303', subject_name: 'Trí tuệ nhân tạo', credits: 3, status: 'STUDYING' },
    { subject_id: 8, subject_code: 'CNTT304', subject_name: 'Mạng máy tính', credits: 3, status: 'DROPPED' },
    { subject_id: 9, subject_code: 'CNTT305', subject_name: 'Hệ điều hành', credits: 3, status: 'COMPLETED' }
];

let mockGrades = [
    { grade_id: 1, student_id: 1, subject_id: 1, subject_code: 'CNTT101', subject_name: 'Nhập môn CNTT', credits: 3, semester: 'ky_1', final_score: 8.3, letter_grade: 'A', is_passed: 1 },
    { grade_id: 2, student_id: 1, subject_id: 2, subject_code: 'TOAN101', subject_name: 'Toán cao cấp', credits: 3, semester: 'ky_1', final_score: 7.3, letter_grade: 'B+', is_passed: 1 },
    { grade_id: 3, student_id: 1, subject_id: 3, subject_code: 'CNTT201', subject_name: 'Lập trình hướng đối tượng', credits: 3, semester: 'ky_2', final_score: 7.8, letter_grade: 'B+', is_passed: 1 },
    { grade_id: 4, student_id: 1, subject_id: 4, subject_code: 'CNTT202', subject_name: 'Cấu trúc dữ liệu và giải thuật', credits: 4, semester: 'ky_2', final_score: 8.3, letter_grade: 'A', is_passed: 1 },
    { grade_id: 5, student_id: 1, subject_id: 5, subject_code: 'CNTT301', subject_name: 'Lập trình web', credits: 3, semester: 'ky_3', final_score: 8.5, letter_grade: 'A', is_passed: 1 },
    { grade_id: 6, student_id: 1, subject_id: 9, subject_code: 'CNTT305', subject_name: 'Hệ điều hành', credits: 3, semester: 'ky_3', final_score: 6.8, letter_grade: 'B', is_passed: 1 },
    { grade_id: 7, student_id: 1, subject_id: 8, subject_code: 'CNTT304', subject_name: 'Mạng máy tính', credits: 3, semester: 'ky_3', final_score: 3.5, letter_grade: 'F', is_passed: 0 }
];

let mockTimetable = [
    { timetable_id: 1, student_id: 1, subject_id: 5, subject_code: 'CNTT301', subject_name: 'Lập trình web', class_name: 'CNTT K17A', room: 'A301', campus: 'Cơ sở 1', day_of_week: 2, day_name: 'Thứ Hai', day_of_week_name: 'Thứ Hai', start_time: '07:30', end_time: '09:30', start_date: '2026-09-01', end_date: '2026-12-30', lecturer_name: 'Nguyễn Văn A' },
    { timetable_id: 2, student_id: 1, subject_id: 6, subject_code: 'CNTT302', subject_name: 'Cơ sở dữ liệu', class_name: 'CNTT K17A', room: 'B202', campus: 'Cơ sở 1', day_of_week: 3, day_name: 'Thứ Ba', day_of_week_name: 'Thứ Ba', start_time: '09:45', end_time: '11:45', start_date: '2026-09-01', end_date: '2026-12-30', lecturer_name: 'Trần Thị B' },
    { timetable_id: 3, student_id: 1, subject_id: 7, subject_code: 'CNTT303', subject_name: 'Trí tuệ nhân tạo', class_name: 'CNTT K17A', room: 'C105', campus: 'Cơ sở 2', day_of_week: 5, day_name: 'Thứ Năm', day_of_week_name: 'Thứ Năm', start_time: '13:30', end_time: '15:30', start_date: '2026-09-01', end_date: '2026-12-30', lecturer_name: 'Lê Văn C' }
];

let mockStudySchedules = [];

let mockAssignments = [
    { assignment_id: 1, student_id: 1, subject_id: 5, subject_name: 'Lập trình web', title: 'Bài tập lớn: Xây dựng hệ thống học tập CMC', description: 'Hoàn thành các API Sprint 1 và giao diện FE', deadline: '2026-10-20T23:59:00', status: 'IN_PROGRESS', priority: 'HIGH', submission_url: null },
    { assignment_id: 2, student_id: 1, subject_id: 6, subject_name: 'Cơ sở dữ liệu', title: 'Thiết kế ERD & Store Procedure Sprint 1', description: 'Viết procedure chuẩn hóa cho 6 chức năng', deadline: '2026-10-18T23:59:00', status: 'IN_PROGRESS', priority: 'URGENT', submission_url: null },
    { assignment_id: 3, student_id: 1, subject_id: 7, subject_name: 'Trí tuệ nhân tạo', title: 'Báo cáo thuật toán tìm kiếm A*', description: 'Thực nghiệm thuật toán trên đồ thị', deadline: '2026-10-25T17:00:00', status: 'PENDING', priority: 'MEDIUM', submission_url: null }
];

let mockChecklists = [
    { checklist_id: 1, student_id: 1, assignment_id: 1, title: 'Viết tài liệu API hợp đồng với FE', priority: 'HIGH', deadline: '2026-10-15T12:00:00', is_completed: true, completed_at: '2026-10-14T08:00:00' },
    { checklist_id: 2, student_id: 1, assignment_id: 1, title: 'Kiểm thử kết nối API với Frontend', priority: 'URGENT', deadline: '2026-10-15T18:00:00', is_completed: false, completed_at: null },
    { checklist_id: 3, student_id: 1, assignment_id: 2, title: 'Tối ưu hóa các Trigger nhắc nhở tự động', priority: 'MEDIUM', deadline: '2026-10-17T20:00:00', is_completed: false, completed_at: null }
];

let mockReminders = [
    { reminder_id: 1, student_id: 1, target_type: 'ASSIGNMENT', target_id: 2, title: 'Nhắc nhở nộp bài Cơ sở dữ liệu (còn 24 giờ)', tier: '24_HOURS', remind_time: new Date(Date.now() - 3600000).toISOString(), is_sent: false, channel: 'APP' },
    { reminder_id: 2, student_id: 1, target_type: 'ASSIGNMENT', target_id: 1, title: 'Hạn chót Bài tập lớn Lập trình web sắp tới (còn 3 ngày)', tier: '3_DAYS', remind_time: new Date(Date.now() - 7200000).toISOString(), is_sent: false, channel: 'APP' }
];

let mockExams = [
    { exam_id: 1, student_id: 1, subject_id: 5, subject_code: 'CNTT301', subject_name: 'Lập trình web', exam_name: 'Thi kết thúc học phần', exam_date: new Date('2026-12-15'), exam_time: '08:00', duration_minutes: 90, room: 'A201', campus: 'Cơ sở 1', exam_format: 'Thực hành máy', days_remaining: 62 },
    { exam_id: 2, student_id: 1, subject_id: 6, subject_code: 'CNTT302', subject_name: 'Cơ sở dữ liệu', exam_name: 'Thi kết thúc học phần', exam_date: new Date('2026-12-18'), exam_time: '13:30', duration_minutes: 90, room: 'B301', campus: 'Cơ sở 1', exam_format: 'Tự luận', days_remaining: 65 }
];

let mockExamStudyPlans = [
    { plan_id: 1, student_id: 1, exam_id: 1, phase_title: 'Giai đoạn 1: Ôn tập lý thuyết Express & REST API', target_description: 'Nắm vững middleware, routing, JWT', start_date: '2026-12-01', end_date: '2026-12-05', priority: 'HIGH', status: 'PLANNED' },
    { plan_id: 2, student_id: 1, exam_id: 1, phase_title: 'Giai đoạn 2: Luyện giải đề thực hành các năm', target_description: 'Viết API hoàn chỉnh trong 60 phút', start_date: '2026-12-06', end_date: '2026-12-12', priority: 'HIGH', status: 'PLANNED' }
];

// ─────────────────────────────────────────────────────────────────────────────
// CÁC HÀM XỬ LÝ (MOCK SERVICE IMPLEMENTATION)
// ─────────────────────────────────────────────────────────────────────────────

async function layHoSo(userId) {
    return { ...mockStudent };
}

async function luuHoSo(userId, data = {}) {
    mockStudent = { ...mockStudent, ...data };
    return { ...mockStudent };
}

async function layBangDiem(userId, hocKy = null) {
    if (hocKy) return mockGrades.filter(g => g.semester === hocKy);
    return [...mockGrades];
}

async function layMonHocChuaDat(userId) {
    return mockGrades.filter(g => g.is_passed === 0);
}

async function layMonHocDaDat(userId) {
    return mockGrades.filter(g => g.is_passed === 1);
}

async function layDanhSachMonHoc(userId) {
    return [...mockSubjects];
}

async function dongBoHoSoIU(userId, dataIU) {
    if (dataIU.MSV) mockStudent.student_code = dataIU.MSV;
    if (dataIU.ten_nganh_hoc) mockStudent.major = dataIU.ten_nganh_hoc;
    if (dataIU.ngay_thang_nam_sinh) mockStudent.dob = dataIU.ngay_thang_nam_sinh;
    return { success: true, message: 'Đã đồng bộ dữ liệu IU thành công', student: mockStudent };
}

// Chức năng 1: Thời khóa biểu
async function layThoiKhoaBieu(userId) {
    return [...mockTimetable];
}

async function layThoiKhoaBieuTheoNgay(userId, ngay) {
    const targetDate = new Date(ngay);
    // JS getDay(): 0=CN, 1=T2, 2=T3... SQL day_of_week: 2=T2... 8=CN
    const jsDay = targetDate.getDay();
    const sqlDay = jsDay === 0 ? 8 : jsDay + 1;
    return mockTimetable.filter(t => t.day_of_week === sqlDay);
}

async function layThoiKhoaBieuTheoTuan(userId, tuNgay, denNgay) {
    return [...mockTimetable];
}

async function layThoiKhoaBieuTheoMon(userId, subjectId) {
    return mockTimetable.filter(t => t.subject_id === parseInt(subjectId, 10));
}

async function themTietHoc(userId, data) {
    const newT = {
        timetable_id: mockTimetable.length + 1,
        student_id: parseInt(userId, 10),
        ...data
    };
    mockTimetable.push(newT);
    return newT;
}

async function xoaTietHoc(timetableId) {
    mockTimetable = mockTimetable.filter(t => t.timetable_id !== parseInt(timetableId, 10));
    return true;
}

// Chức năng 2: Tự học & Trùng lịch
async function kiemTraTrungLich(userId) {
    // Không có xung đột trong dữ liệu chuẩn
    return [];
}

async function kiemTraXungDotLichTuHoc(userId, studyDate, startTime, endTime, excludeScheduleId = null) {
    const conflicts = [];
    const tkb = await layThoiKhoaBieuTheoNgay(userId, studyDate);
    for (const t of tkb) {
        if (startTime < t.end_time && endTime > t.start_time) {
            conflicts.push({
                conflict_type: 'TIMETABLE_OVERLAP',
                title: t.subject_name,
                time: `${t.start_time} - ${t.end_time}`
            });
        }
    }
    return conflicts;
}

async function xepLichTuHoc(userId, data = {}) {
    const newS = {
        schedule_id: mockStudySchedules.length + 1,
        student_id: parseInt(userId, 10),
        status: 'PLANNED',
        created_at: new Date().toISOString(),
        ...data
    };
    mockStudySchedules.push(newS);
    return newS;
}

async function layLichTuHoc(userId, tuNgay = null, denNgay = null) {
    return [...mockStudySchedules];
}

async function timKhoangTrongTuHoc(userId, ngay, thoiLuongPhut = 60) {
    return [
        { start_time: '14:00', end_time: '16:00', duration_minutes: 120 },
        { start_time: '19:30', end_time: '21:30', duration_minutes: 120 }
    ];
}

async function capNhatTrangThaiLichTuHoc(scheduleId, status) {
    const s = mockStudySchedules.find(x => x.schedule_id === parseInt(scheduleId, 10));
    if (s) s.status = status;
    return true;
}

async function xoaLichTuHoc(scheduleId) {
    mockStudySchedules = mockStudySchedules.filter(x => x.schedule_id !== parseInt(scheduleId, 10));
    return true;
}

// Chức năng 3: Deadline & Checklist
async function layDanhSachDeadline(userId, trangThai = null) {
    if (trangThai) return mockAssignments.filter(a => a.status === trangThai);
    return [...mockAssignments];
}

async function layDeadlineSapToi(userId, soNgay = 3) {
    return mockAssignments.slice(0, 2);
}

async function themBaiTap(userId, data = {}) {
    const newA = {
        assignment_id: mockAssignments.length + 1,
        student_id: parseInt(userId, 10),
        status: 'PENDING',
        created_at: new Date().toISOString(),
        ...data
    };
    mockAssignments.push(newA);
    // Tự sinh nhắc nhở
    mockReminders.push({
        reminder_id: mockReminders.length + 1,
        student_id: parseInt(userId, 10),
        target_type: 'ASSIGNMENT',
        target_id: newA.assignment_id,
        title: `Nhắc hạn nộp: ${newA.title}`,
        tier: '24_HOURS',
        remind_time: new Date().toISOString(),
        is_sent: false,
        channel: 'APP'
    });
    return newA;
}

async function capNhatBaiTap(assignmentId, data = {}) {
    const a = mockAssignments.find(x => x.assignment_id === parseInt(assignmentId, 10));
    if (a) Object.assign(a, data);
    return a;
}

async function capNhatTrangThaiBaiTap(assignmentId, trangThai) {
    const a = mockAssignments.find(x => x.assignment_id === parseInt(assignmentId, 10));
    if (a) {
        a.status = trangThai;
        if (trangThai === 'COMPLETED') a.completed_at = new Date().toISOString();
    }
    return a;
}

async function xoaBaiTap(assignmentId) {
    mockAssignments = mockAssignments.filter(x => x.assignment_id !== parseInt(assignmentId, 10));
    return true;
}

async function layChecklist(userId) {
    return [...mockChecklists];
}

async function themChecklist(userId, data = {}) {
    const newC = {
        checklist_id: mockChecklists.length + 1,
        student_id: parseInt(userId, 10),
        is_completed: false,
        priority: 'MEDIUM',
        ...data
    };
    mockChecklists.push(newC);
    return newC;
}

async function capNhatChecklist(checklistId, data = {}) {
    const c = mockChecklists.find(x => x.checklist_id === parseInt(checklistId, 10));
    if (c) Object.assign(c, data);
    return c;
}

async function hoanThanhChecklist(checklistId, isCompleted = true) {
    const c = mockChecklists.find(x => x.checklist_id === parseInt(checklistId, 10));
    if (c) {
        c.is_completed = isCompleted;
        c.completed_at = isCompleted ? new Date().toISOString() : null;
    }
    return c;
}

async function xoaChecklist(checklistId) {
    mockChecklists = mockChecklists.filter(x => x.checklist_id !== parseInt(checklistId, 10));
    return true;
}

// Chức năng 4: Nhắc nhở
async function layDanhSachNhacNho(userId) {
    return [...mockReminders];
}

async function taoNhacNho(userId, data = {}) {
    const newR = {
        reminder_id: mockReminders.length + 1,
        student_id: parseInt(userId, 10),
        is_sent: false,
        ...data
    };
    mockReminders.push(newR);
    return newR;
}

async function taoNhacNhoDaTang(userId, targetType, targetId, title, deadline, channel = 'APP') {
    return { created_count: 3 };
}

async function layNhacNhoDenHanChuaGui() {
    return mockReminders.filter(r => !r.is_sent);
}

async function danhDauDaGuiNhacNho(reminderId) {
    const r = mockReminders.find(x => x.reminder_id === parseInt(reminderId, 10));
    if (r) r.is_sent = true;
    return true;
}

async function xoaNhacNho(reminderId) {
    mockReminders = mockReminders.filter(x => x.reminder_id !== parseInt(reminderId, 10));
    return true;
}

// Chức năng 9: Lịch thi
async function layLichThi(userId) {
    return [...mockExams];
}

async function layLichThiSapToi(userId) {
    return [...mockExams];
}

async function themLichThi(userId, data = {}) {
    const newE = {
        exam_id: mockExams.length + 1,
        student_id: parseInt(userId, 10),
        days_remaining: 60,
        ...data,
        exam_date: new Date(data.examDate || '2026-12-25')
    };
    mockExams.push(newE);
    return newE;
}

async function xoaLichThi(examId) {
    mockExams = mockExams.filter(x => x.exam_id !== parseInt(examId, 10));
    return true;
}

async function layKeHoachOnThi(userId, examId = null) {
    if (examId) return mockExamStudyPlans.filter(p => p.exam_id === parseInt(examId, 10));
    return [...mockExamStudyPlans];
}

async function taoKeHoachOnThi(userId, data = {}) {
    const newP = {
        plan_id: mockExamStudyPlans.length + 1,
        student_id: parseInt(userId, 10),
        status: 'PLANNED',
        ...data
    };
    mockExamStudyPlans.push(newP);
    return newP;
}

async function capNhatTrangThaiKeHoachOnThi(planId, status) {
    const p = mockExamStudyPlans.find(x => x.plan_id === parseInt(planId, 10));
    if (p) p.status = status;
    return true;
}

async function xoaKeHoachOnThi(planId) {
    mockExamStudyPlans = mockExamStudyPlans.filter(x => x.plan_id !== parseInt(planId, 10));
    return true;
}

module.exports = {
    layHoSo, luuHoSo, layBangDiem, layMonHocChuaDat, layMonHocDaDat, layDanhSachMonHoc, dongBoHoSoIU,
    layThoiKhoaBieu, layThoiKhoaBieuTheoNgay, layThoiKhoaBieuTheoTuan, layThoiKhoaBieuTheoMon, themTietHoc, xoaTietHoc,
    kiemTraTrungLich, kiemTraXungDotLichTuHoc, xepLichTuHoc, layLichTuHoc, timKhoangTrongTuHoc, capNhatTrangThaiLichTuHoc, xoaLichTuHoc,
    layDanhSachDeadline, layDeadlineSapToi, themBaiTap, capNhatBaiTap, capNhatTrangThaiBaiTap, xoaBaiTap,
    layChecklist, themChecklist, capNhatChecklist, hoanThanhChecklist, xoaChecklist,
    layDanhSachNhacNho, taoNhacNho, taoNhacNhoDaTang, layNhacNhoDenHanChuaGui, danhDauDaGuiNhacNho, xoaNhacNho,
    layLichThi, layLichThiSapToi, themLichThi, xoaLichThi, layKeHoachOnThi, taoKeHoachOnThi, capNhatTrangThaiKeHoachOnThi, xoaKeHoachOnThi
};
