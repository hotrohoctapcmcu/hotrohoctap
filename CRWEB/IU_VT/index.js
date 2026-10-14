"use strict";

/**
 * index.js — FILE TONG HOP CUA FOLDER IU.
 * Noi khac (API/, Frontend/...) chi can require 1 file nay:
 *   const iu = require("../IU");           // hoac duong dan tuong ung
 *
 * IU gom 4 cum, moi cum 1 nhiem vu (dung kien truc trong bao_báo: moi folder
 * con co index.js tong ket):
 *   login/    Dang nhap portal IU bang SSO Microsoft (Electron), tra cookie.
 *   payload/  Lay ID phien + dung object payload request (chua ma hoa).
 *   crypto/   Ma hoa request (AE) va giai ma response (AD) cua portal.
 *   capture/  Bat response API tu cua so da dang nhap (Chrome DevTools Protocol).
 *
 * Chi tiet cach dung + nguon du lieu cua tung cum: xem index.js trong tung
 * folder, hoac bao_cao.txt o goc IU.
 */

const login = require("./login");
const payload = require("./payload");
const crypto = require("./crypto");
const capture = require("./capture");

module.exports = {
    // login/
    loginIU: login.loginIU,
    logoutIU: login.logoutIU,
    getIuWindow: login.getIuWindow,

    // payload/
    laySession: payload.laySession,
    buildPayload: payload.buildPayload,
    setPayload: payload.setPayload,
    traEndpoint: payload.traEndpoint,
    lietKeEndpoint: payload.lietKeEndpoint,
    layUrl: payload.layUrl,

    // crypto/
    ma_hoa: crypto.ma_hoa,
    giai_ma: crypto.giai_ma,
    giai_ma_request: crypto.giai_ma_request,
    APIS_KEYS: crypto.APIS_KEYS,
    IM_MAC_DINH: crypto.IM_MAC_DINH,

    // capture/
    batRequestRoute: capture.batRequestRoute,

    // xuat nguyen cum neu can dung rieng
    login_module: login,
    payload_module: payload,
    crypto_module: crypto,
    capture_module: capture,
};
