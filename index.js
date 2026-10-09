/**
 * sprint1/index.js
 * ===================================================================================
 * CỔNG GIAO TIẾP DATABASE CHO SPRINT 1 (CHỨC NĂNG 1, 2, 3, 4, 9, 18)
 * ===================================================================================
 * 
 * // trả về 1 hàm để kết nối tới database 
 * 
 * /* 
 * return theo chức năng của sprint. ví dụ sprint 1 là cần những hàm như: lấy hồ sơ,lưu hồ sơ =>> luuHoSo(), layHoSo(),...
 * *\/
 * ===================================================================================
 */

const { getPool, closePool, sql, executeQuery, executeProcedure } = require('../database/connection/db');
const sprint1Service = require('./backend/sprint1Service');

/**
 * Hàm kết nối tới Database và trả ra danh sách toàn bộ các hàm được sử dụng trong Sprint 1
 * @returns {Promise<Object>} Đối tượng chứa toàn bộ các hàm backend của Sprint 1 theo chức năng
 */
async function ketNoiDatabase() {
    // Kiểm tra và khởi tạo connection pool SQL Server
    await getPool();

    // Return theo từng chức năng của Sprint 1:
    return {
        // Kết nối cơ bản
        sql,
        getPool,
        closePool,
        executeQuery,
        executeProcedure,

        // ─── CHỨC NĂNG 18: HỒ SƠ HỌC TẬP CÁ NHÂN ──────────────────────
        layHoSo: sprint1Service.layHoSo,                     // layHoSo(userId) -> lấy hồ sơ tổng quan: GPA, tín chỉ, môn trượt
        luuHoSo: sprint1Service.luuHoSo,                     // luuHoSo(userId, data) -> lưu/cập nhật thông tin SV
        layBangDiem: sprint1Service.layBangDiem,             // layBangDiem(userId, hocKy) -> lấy bảng điểm tất cả hoặc theo kỳ
        layMonHocChuaDat: sprint1Service.layMonHocChuaDat,   // layMonHocChuaDat(userId) -> lấy các môn điểm F cần học lại
        layMonHocDaDat: sprint1Service.layMonHocDaDat,       // layMonHocDaDat(userId) -> lấy các môn đã qua
        layDanhSachMonHoc: sprint1Service.layDanhSachMonHoc, // layDanhSachMonHoc(userId) -> lấy toàn bộ môn học & trạng thái
        dongBoHoSoIU: sprint1Service.dongBoHoSoIU,           // dongBoHoSoIU(userId, dataIU) -> đồng bộ từ crawler IU

        // ─── CHỨC NĂNG 1: THỜI KHÓA BIỂU THÔNG MINH ────────────────────
        layThoiKhoaBieu: sprint1Service.layThoiKhoaBieu,                 // layThoiKhoaBieu(userId) -> lấy toàn bộ TKB
        layThoiKhoaBieuTheoNgay: sprint1Service.layThoiKhoaBieuTheoNgay, // layThoiKhoaBieuTheoNgay(userId, date) -> xem TKB theo ngày
        layThoiKhoaBieuTheoTuan: sprint1Service.layThoiKhoaBieuTheoTuan, // layThoiKhoaBieuTheoTuan(userId, start, end) -> xem TKB trong tuần
        layThoiKhoaBieuTheoMon: sprint1Service.layThoiKhoaBieuTheoMon,   // layThoiKhoaBieuTheoMon(userId, subjectId) -> xem TKB theo môn
        themTietHoc: sprint1Service.themTietHoc,                         // themTietHoc(userId, data) -> thêm 1 tiết học
        xoaTietHoc: sprint1Service.xoaTietHoc,                           // xoaTietHoc(timetableId) -> xóa tiết học

        // ─── CHỨC NĂNG 2: AI XẾP LỊCH TỰ HỌC & CẢNH BÁO TRÙNG ─────────
        kiemTraTrungLich: sprint1Service.kiemTraTrungLich,                   // kiemTraTrungLich(userId) -> phát hiện lớp bị trùng lịch
        kiemTraXungDotLichTuHoc: sprint1Service.kiemTraXungDotLichTuHoc,     // kiemTraXungDotLichTuHoc(userId, date, start, end)
        xepLichTuHoc: sprint1Service.xepLichTuHoc,                           // xepLichTuHoc(userId, data) -> lưu lịch tự học (check trùng)
        layLichTuHoc: sprint1Service.layLichTuHoc,                           // layLichTuHoc(userId, start, end) -> lấy danh sách lịch tự học
        timKhoangTrongTuHoc: sprint1Service.timKhoangTrongTuHoc,             // timKhoangTrongTuHoc(userId, date, duration) -> AI tìm slot trống
        capNhatTrangThaiLichTuHoc: sprint1Service.capNhatTrangThaiLichTuHoc, // capNhatTrangThaiLichTuHoc(id, status)
        xoaLichTuHoc: sprint1Service.xoaLichTuHoc,                           // xoaLichTuHoc(scheduleId)

        // ─── CHỨC NĂNG 3: QUẢN LÝ DEADLINE VÀ CHECKLIST ───────────────
        layDanhSachDeadline: sprint1Service.layDanhSachDeadline,         // layDanhSachDeadline(userId, status) -> lấy bài tập/deadline
        layDeadlineSapToi: sprint1Service.layDeadlineSapToi,             // layDeadlineSapToi(userId, soNgay) -> deadline sắp đến hạn
        themBaiTap: sprint1Service.themBaiTap,                           // themBaiTap(userId, data) -> thêm bài tập (auto Reminder)
        capNhatBaiTap: sprint1Service.capNhatBaiTap,                     // capNhatBaiTap(assignmentId, data) -> sửa bài tập
        capNhatTrangThaiBaiTap: sprint1Service.capNhatTrangThaiBaiTap,   // capNhatTrangThaiBaiTap(id, status)
        xoaBaiTap: sprint1Service.xoaBaiTap,                             // xoaBaiTap(assignmentId) -> xóa bài tập & nhắc nhở kèm theo
        layChecklist: sprint1Service.layChecklist,                       // layChecklist(userId) -> lấy checklist cá nhân
        themChecklist: sprint1Service.themChecklist,                     // themChecklist(userId, data) -> thêm task cá nhân
        capNhatChecklist: sprint1Service.capNhatChecklist,               // capNhatChecklist(id, data) -> sửa task cá nhân
        hoanThanhChecklist: sprint1Service.hoanThanhChecklist,           // hoanThanhChecklist(id, isCompleted) -> đánh dấu xong
        xoaChecklist: sprint1Service.xoaChecklist,                       // xoaChecklist(checklistId) -> xóa task cá nhân

        // ─── CHỨC NĂNG 4: NHẮC NHỞ THÔNG MINH ĐA TẦNG ────────────────
        layDanhSachNhacNho: sprint1Service.layDanhSachNhacNho,           // layDanhSachNhacNho(userId) -> lấy tất cả nhắc nhở
        taoNhacNho: sprint1Service.taoNhacNho,                           // taoNhacNho(userId, data) -> tạo 1 nhắc nhở
        taoNhacNhoDaTang: sprint1Service.taoNhacNhoDaTang,               // taoNhacNhoDaTang(userId, type, id, title, deadline)
        layNhacNhoDenHanChuaGui: sprint1Service.layNhacNhoDenHanChuaGui, // layNhacNhoDenHanChuaGui() -> quét thông báo cần gửi
        danhDauDaGuiNhacNho: sprint1Service.danhDauDaGuiNhacNho,         // danhDauDaGuiNhacNho(reminderId) -> đánh dấu đã gửi
        xoaNhacNho: sprint1Service.xoaNhacNho,                           // xoaNhacNho(reminderId) -> xóa nhắc nhở

        // ─── CHỨC NĂNG 9: QUẢN LÝ LỊCH THI VÀ KẾ HOẠCH ÔN THI ─────────
        layLichThi: sprint1Service.layLichThi,                                   // layLichThi(userId) -> toàn bộ lịch thi
        layLichThiSapToi: sprint1Service.layLichThiSapToi,                       // layLichThiSapToi(userId) -> lịch thi kèm đếm ngược
        themLichThi: sprint1Service.themLichThi,                                 // themLichThi(userId, data) -> thêm môn thi (auto Reminder)
        xoaLichThi: sprint1Service.xoaLichThi,                                   // xoaLichThi(examId) -> xóa môn thi
        layKeHoachOnThi: sprint1Service.layKeHoachOnThi,                         // layKeHoachOnThi(userId, examId) -> các giai đoạn ôn thi
        taoKeHoachOnThi: sprint1Service.taoKeHoachOnThi,                         // taoKeHoachOnThi(userId, data) -> tạo kế hoạch ôn thi
        capNhatTrangThaiKeHoachOnThi: sprint1Service.capNhatTrangThaiKeHoachOnThi, // capNhatTrangThaiKeHoachOnThi(id, status)
        xoaKeHoachOnThi: sprint1Service.xoaKeHoachOnThi                          // xoaKeHoachOnThi(planId) -> xóa kế hoạch ôn thi
    };
}

// Gán trực tiếp các hàm vào function ketNoiDatabase để hỗ trợ mọi cách import:
// Cách 1: const ketNoi = require('./sprint1'); const db = await ketNoi(); db.layHoSo(1);
// Cách 2: const { layHoSo, luuHoSo, layThoiKhoaBieu } = require('./sprint1');
Object.assign(ketNoiDatabase, sprint1Service);
ketNoiDatabase.ketNoiDatabase = ketNoiDatabase;

module.exports = ketNoiDatabase;
