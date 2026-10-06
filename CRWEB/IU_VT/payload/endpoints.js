"use strict";

/**
 * endpoints.js — Bang tra cuu endpoint ma hoa cua portal IU.
 *
 * NHIEM VU: doc file endpoint_map.txt (112 endpoint, 35 module) thanh object
 * tra cuu { TenHamThat: { module, suffix, func } }. Chi doc + tra cuu, khong
 * dung payload, khong ma hoa.
 *
 * NGUON DU LIEU:
 *  - payload/endpoint_map.txt: quet tu source portal trong portalSrc/
 *    (cac module trong ApisCongSinhVien/modules/*/script/*.js + Core +
 *    Index.aspx), giai suffix bang key "A", doi chieu voi field func that
 *    (pkg_*.TenHam) di kem moi request — khop 100%.
 *  - Bang du phong gon (3 endpoint diem) phong khi thieu file txt.
 *
 * CACH DUNG:
 *   const { traEndpoint, lietKeEndpoint } = require("./endpoints");
 *   traEndpoint("KetQuaHocTapCaNhan");
 *   // -> { module: "SV_ThongTin_MH",
 *   //      suffix: "CiQ1EDQgCS4iFSAxAiAPKSAv",
 *   //      func: "pkg_congthongtin_hssv_thongtin.KetQuaHocTapCaNhan" }
 */

const fs = require("fs");
const path = require("path");

let ENDPOINTS = null;

function docBangEndpoint() {
    if (ENDPOINTS) return ENDPOINTS;
    ENDPOINTS = {};
    try {
        const txt = fs.readFileSync(path.join(__dirname, "endpoint_map.txt"), "utf8");
        let modHienTai = "";
        for (const line of txt.split("\n")) {
            const mMod = /^\s*MODULE:\s*(\S+)/.exec(line);
            if (mMod) {
                modHienTai = mMod[1];
                continue;
            }
            const m = /^\s*([A-Za-z0-9_]+)\s*:\s*([A-Za-z0-9+/=]+)(?:\s+#\s+(\S+))?/.exec(line);
            if (m && modHienTai) {
                ENDPOINTS[m[1]] = { module: modHienTai, suffix: m[2], func: m[3] || "" };
            }
        }
    } catch {
        /* khong co file txt — dung bang du phong ben duoi */
    }
    if (Object.keys(ENDPOINTS).length === 0) {
        ENDPOINTS = {
            KetQuaHocTapCaNhan: {
                module: "SV_ThongTin_MH",
                suffix: "CiQ1EDQgCS4iFSAxAiAPKSAv",
                func: "pkg_congthongtin_hssv_thongtin.KetQuaHocTapCaNhan",
            },
            LayKetQuaTichLuyTheoKhoi: {
                module: "SV_ThongTin_MH",
                suffix: "DSA4CiQ1EDQgFSgiKQ00OBUpJC4KKS4o",
                func: "pkg_congthongtin_hssv_thongtin.LayKetQuaTichLuyTheoKhoi",
            },
            LayDSThoiGianLichHoc: {
                module: "SV_ThongTin_MH",
                suffix: "DSA4BRIVKS4oBiggLw0oIikJLiIP",
                func: "pkg_congthongtin_hssv_thongtin.LayDSThoiGianLichHoc",
            },
        };
    }
    return ENDPOINTS;
}

// Tra 1 endpoint theo ten ham that. Throw neu ten la (tra cot trai endpoint_map.txt).
function traEndpoint(tenEndpoint) {
    const bang = docBangEndpoint();
    const ep = bang[tenEndpoint];
    if (!ep) {
        throw new Error(
            "Endpoint la: " + tenEndpoint + ". Tra trong payload/endpoint_map.txt lay ten o cot trai."
        );
    }
    return ep;
}

// Liet ke ten tat ca endpoint (de goi y / autocomplete).
function lietKeEndpoint() {
    return Object.keys(docBangEndpoint()).sort();
}

module.exports = { traEndpoint, lietKeEndpoint };
