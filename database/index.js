/**
 * database/index.js
 * ===================================================================================
 * CỔNG GIAO TIẾP DATABASE CHO SPRINT 1 (CHỨC NĂNG 1, 2, 3, 4, 9, 18)
 * ===================================================================================
 * Tự động chuyển đổi thông minh:
 *   1. Nếu SQL Server đang chạy -> Kết nối SQL Server thực tế (Procedure, View, Trigger)
 *   2. Nếu SQL Server chưa bật -> Tự động kích hoạt Fallback In-Memory Mock Store
 *      với đầy đủ dữ liệu mẫu chuẩn Sprint 1 để FE và API kiểm thử 100% không bị chặn.
 * ===================================================================================
 */

const { getPool, closePool, sql, executeQuery, executeProcedure } = require('./connection/db');
const sprint1Service = require('./sprint1Service');
const mockService = require('./mockService');

/**
 * Hàm kết nối tới Database và trả ra danh sách toàn bộ các hàm được sử dụng trong Sprint 1
 * @returns {Promise<Object>} Đối tượng chứa toàn bộ các hàm backend của Sprint 1 theo chức năng
 */
async function ketNoiDatabase() {
    let service = sprint1Service;
    let isMock = false;

    try {
        await getPool();
        console.log('[DB] Đã kết nối cơ sở dữ liệu SQL Server thành công (Chế độ LIVE DB).');
    } catch (err) {
        console.warn('\n[DB THÔNG BÁO] Không thể kết nối SQL Server (Dịch vụ chưa bật hoặc chưa cài đặt).');
        console.warn('[DB THÔNG BÁO] Hệ thống tự động chuyển sang CHẾ ĐỘ MOCK DATA IN-MEMORY!');
        console.warn('[DB THÔNG BÁO] Toàn bộ 6 chức năng (TKB, Deadline, Nhắc nhở, Lịch thi, Hồ sơ, Tự học) đều hoạt động đầy đủ.\n');
        service = mockService;
        isMock = true;
    }

    // Return theo từng chức năng của Sprint 1:
    return {
        // Kết nối cơ bản
        sql,
        getPool,
        closePool,
        executeQuery,
        executeProcedure,
        isMockMode: isMock,

        // ─── CHỨC NĂNG 18: HỒ SƠ HỌC TẬP CÁ NHÂN ──────────────────────
        layHoSo: service.layHoSo,
        luuHoSo: service.luuHoSo,
        layBangDiem: service.layBangDiem,
        layMonHocChuaDat: service.layMonHocChuaDat,
        layMonHocDaDat: service.layMonHocDaDat,
        layDanhSachMonHoc: service.layDanhSachMonHoc,
        dongBoHoSoIU: service.dongBoHoSoIU,

        // ─── CHỨC NĂNG 1: THỜI KHÓA BIỂU THÔNG MINH ────────────────────
        layThoiKhoaBieu: service.layThoiKhoaBieu,
        layThoiKhoaBieuTheoNgay: service.layThoiKhoaBieuTheoNgay,
        layThoiKhoaBieuTheoTuan: service.layThoiKhoaBieuTheoTuan,
        layThoiKhoaBieuTheoMon: service.layThoiKhoaBieuTheoMon,
        themTietHoc: service.themTietHoc,
        xoaTietHoc: service.xoaTietHoc,

        // ─── CHỨC NĂNG 2: AI XẾP LỊCH TỰ HỌC & CẢNH BÁO TRÙNG ─────────
        kiemTraTrungLich: service.kiemTraTrungLich,
        kiemTraXungDotLichTuHoc: service.kiemTraXungDotLichTuHoc,
        xepLichTuHoc: service.xepLichTuHoc,
        layLichTuHoc: service.layLichTuHoc,
        timKhoangTrongTuHoc: service.timKhoangTrongTuHoc,
        capNhatTrangThaiLichTuHoc: service.capNhatTrangThaiLichTuHoc,
        xoaLichTuHoc: service.xoaLichTuHoc,

        // ─── CHỨC NĂNG 3: QUẢN LÝ DEADLINE VÀ CHECKLIST ───────────────
        layDanhSachDeadline: service.layDanhSachDeadline,
        layDeadlineSapToi: service.layDeadlineSapToi,
        themBaiTap: service.themBaiTap,
        capNhatBaiTap: service.capNhatBaiTap,
        capNhatTrangThaiBaiTap: service.capNhatTrangThaiBaiTap,
        xoaBaiTap: service.xoaBaiTap,
        layChecklist: service.layChecklist,
        themChecklist: service.themChecklist,
        capNhatChecklist: service.capNhatChecklist,
        hoanThanhChecklist: service.hoanThanhChecklist,
        xoaChecklist: service.xoaChecklist,

        // ─── CHỨC NĂNG 4: NHẮC NHỞ THÔNG MINH ĐA TẦNG ────────────────
        layDanhSachNhacNho: service.layDanhSachNhacNho,
        taoNhacNho: service.taoNhacNho,
        taoNhacNhoDaTang: service.taoNhacNhoDaTang,
        layNhacNhoDenHanChuaGui: service.layNhacNhoDenHanChuaGui,
        danhDauDaGuiNhacNho: service.danhDauDaGuiNhacNho,
        xoaNhacNho: service.xoaNhacNho,

        // ─── CHỨC NĂNG 9: QUẢN LÝ LỊCH THI VÀ KẾ HOẠCH ÔN THI ─────────
        layLichThi: service.layLichThi,
        layLichThiSapToi: service.layLichThiSapToi,
        themLichThi: service.themLichThi,
        xoaLichThi: service.xoaLichThi,
        layKeHoachOnThi: service.layKeHoachOnThi,
        taoKeHoachOnThi: service.taoKeHoachOnThi,
        capNhatTrangThaiKeHoachOnThi: service.capNhatTrangThaiKeHoachOnThi,
        xoaKeHoachOnThi: service.xoaKeHoachOnThi
    };
}

// Gán trực tiếp các hàm vào function ketNoiDatabase để hỗ trợ mọi cú pháp import
Object.assign(ketNoiDatabase, sprint1Service);
ketNoiDatabase.ketNoiDatabase = ketNoiDatabase;

module.exports = ketNoiDatabase;
