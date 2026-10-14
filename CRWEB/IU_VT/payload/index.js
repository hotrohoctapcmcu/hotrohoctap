"use strict";

/**
 * index.js — Cum DUNG PAYLOAD (payload).
 * Tong ket va xuat cac ham tra endpoint + lay session + dung payload.
 *
 * NHIEM VU CUA CUM: giu dung 1 nhiem vu — bien session + ten endpoint thanh
 * object payload dang thuong (chua ma hoa). Viec ma hoa thanh field "A" nam o
 * crypto/ (ma_hoa), viec login lay cookie nam o login/.
 *
 * NGUON DU LIEU (chi tiet trong tung file):
 *  - payload/endpoints.js + payload/endpoint_map.txt: 112 endpoint quet tu
 *    source portal trong portalSrc/ (modules/*/script/*.js), giai suffix bang
 *    key "A", doi chieu field func that — khop 100%.
 *  - payload/session.js: bien edu.system tren trang da login (ham AFG goc
 *    trong portalSrc/loi/pagination.js).
 *  - payload/build.js: danh sach field tung endpoint trich tu
 *    portalSrc/loi/diemhoc.js.
 *  - payload/payload.mau.json: vi du payload that da giai ma (endpoint cong
 *    nhan van bang) de doi chieu.
 *
 * CACH DUNG:
 *   const { getIuWindow } = require("../login");
 *   const { laySession, buildPayload, setPayload, layUrl } = require("../payload");
 *   const { ma_hoa } = require("../crypto");
 *
 *   const session = await laySession(getIuWindow()); // sau loginIU
 *   let p = buildPayload(session, "KetQuaHocTapCaNhan"); // 1 lan: payload cung
 *   p = setPayload(p, { strDaoTao_ChuongTrinh_Id: "ID_CT" }); // doi gia tri
 *   const body = new URLSearchParams({ A: ma_hoa(p) }); // ma hoa de POST
 *   const res = await fetch(layUrl(p),
 *     { method: "POST", headers: { Cookie: jar.cookie }, body });
 */

const { traEndpoint, lietKeEndpoint } = require("./endpoints");
const { laySession } = require("./session");
const { buildPayload, setPayload, layUrl } = require("./build");

module.exports = { traEndpoint, lietKeEndpoint, laySession, buildPayload, setPayload, layUrl };
