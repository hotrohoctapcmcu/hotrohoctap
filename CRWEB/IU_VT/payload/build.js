"use strict";

/**
 * build.js — Dung object payload request (dang thuong, chua ma hoa).
 *
 * NHIEM VU:
 *  - buildPayload(session, tenEndpoint) -> object payload CUNG (goi 1 lan).
 *  - setPayload(payload, patch) -> object MOI voi gia tri sua doi.
 *  Chi dung object thuong + tra cuu endpoint; viec ma hoa nam o crypto/.
 *
 * NGUON DU LIEU:
 *  - Danh sach field cua moi endpoint trich dung theo module diemhoc trong
 *    portalSrc/loi/diemhoc.js. Vi du KetQuaHocTapCaNhan gui:
 *      action, func, iM, strChucNang_Id (= edu.system.strChucNang_Id),
 *      strQLSV_NguoiHoc_Id, strDaoTao_ChuongTrinh_Id (dropdown),
 *      strNguoiThucHien_Id (= edu.system.userId).
 *  - Quy tac dien ID: strNguoiThucHien_Id/strNguoiDung_Id <- session.userId,
 *    strChucNang_Id <- session.chucNangId,
 *    strQLSV_NguoiHoc_Id <- session.nguoiHocId (mac dinh = userId),
 *    strDaoTao_ChuongTrinh_Id <- session.chuongTrinhId (de "" neu chua chon),
 *    field la de "" — dien sau bang setPayload().
 *
 * CACH DUNG:
 *   const { buildPayload, setPayload } = require("./build");
 *   let p = buildPayload(session, "KetQuaHocTapCaNhan"); // 1 lan
 *   p = setPayload(p, { strDaoTao_ChuongTrinh_Id: "ID_CT" }); // moi khi doi
 */

const { IM_MAC_DINH } = require("../crypto");
const { traEndpoint } = require("./endpoints");

// Field cua tung endpoint (trich tu diemhoc.js). Endpoint khac khong co trong
// danh sach van dung duoc — chi gom action/func/iM, tu them field bang setPayload().
const THAM_SO_MAC_DINH = {
    KetQuaHocTapCaNhan: ["strChucNang_Id", "strQLSV_NguoiHoc_Id", "strDaoTao_ChuongTrinh_Id", "strNguoiThucHien_Id"],
    LayKetQuaTichLuyTheoKhoi: ["strQLSV_NguoiHoc_Id", "strDaoTao_ChuongTrinh_Id"],
    LayThongTinChuongTrinhHoc: ["strChucNang_Id", "strQLSV_NguoiHoc_Id", "strNguoiThucHien_Id"],
    LayKetQuaDangKyHocCaNhan: ["strNguoiThucHien_Id", "strQLSV_NguoiHoc_Id", "strDaoTao_ThoiGianDaoTao_Id"],
    LayDSThoiGianLichHoc: ["strNguoiThucHien_Id", "strQLSV_NguoiHoc_Id"],
    LayDSDiemThanhPhanTheoTKHP: ["strDiem_NguoiHoc_TongKet_Id"],
    LayDSQDCaNhan: ["strNguoiDung_Id"],
    LayDSTN_KetQua_CongNhan_VB: ["strNguoiDung_Id"],
    LatKetQuaDiemQuaTrinh: ["strNguoiThucHien_Id", "strQLSV_NguoiHoc_Id", "strDaoTao_LopHocPhan_Id"],
    LayDSKetQuaXuLyHocVu: ["strQLSV_NguoiHoc_Id", "strDaoTao_ChuongTrinh_Id", "strNguoiThucHien_Id"],
    LayKQRenLuyenCaNhan: ["strQLSV_NguoiHoc_Id", "strDaoTao_ChuongTrinh_Id", "strNguoiThucHien_Id"],
};

// Dung payload CUNG sau login.
// session = { userId, chucNangId, nguoiHocId?, chuongTrinhId? } (tu laySession).
function buildPayload(session, tenEndpoint) {
    const ep = traEndpoint(tenEndpoint);
    const ss = session || {};
    const nguoiHocId = ss.nguoiHocId || ss.userId || "";
    const payload = {
        action: ep.module + "/" + ep.suffix,
        func: ep.func,
        iM: IM_MAC_DINH,
    };
    const fields = THAM_SO_MAC_DINH[tenEndpoint] || [];
    for (const f of fields) {
        if (f === "strNguoiThucHien_Id" || f === "strNguoiDung_Id") payload[f] = ss.userId || "";
        else if (f === "strChucNang_Id") payload[f] = ss.chucNangId || "";
        else if (f === "strQLSV_NguoiHoc_Id") payload[f] = nguoiHocId;
        else if (f === "strDaoTao_ChuongTrinh_Id") payload[f] = ss.chuongTrinhId || "";
        else payload[f] = "";
    }
    return payload;
}

// Sua gia tri thay doi — tra object moi, khong sua object cu.
// Vd: p = setPayload(p, { strDaoTao_ThoiGianDaoTao_Id: "ID_HK_MOI" });
function setPayload(payload, patch) {
    return Object.assign({}, payload, patch);
}

// URL day du de POST (cum api mac dinh "sinhvienapi").
function layUrl(payload, cumApi) {
    const cum = cumApi || "sinhvienapi";
    return "https://iu.cmcu.edu.vn/" + cum + "/api/" + payload.action;
}

module.exports = { buildPayload, setPayload, layUrl };
