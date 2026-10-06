"use strict";

/**
 * window.js — Quan ly cua so Electron dung cho dang nhap IU.
 *
 * NHIEM VU: mo/tao dung mot cua so BrowserWindow (dung chung bien iuWindow),
 * doi trang tai xong, kiem tra da dang nhap portal chua. Khong goi mang,
 * khong doc cookie (nam o cookies.js), khong dieu phoi luong login (flow.js).
 *
 * NGUON DU LIEU:
 *  - CMC_PARTITION, IU_URL: login/constants.js.
 *  - portalAuthStateScript: login/pagescript.js (chay trong trang).
 *  - Luong mo cua so + doi tai trich tu
 *    thoiGianBieu/src/main/sync/browserLogin.js (openCmc, loadAndWait,
 *    waitForPortalAuth) va sync/index.js (SSO Microsoft 1 lan).
 *  - require("electron") phai chay trong Electron MAIN process; neu thieu
 *    module thi nem loi code LOGIN_NO_ELECTRON.
 *
 * CACH DUNG:
 *   const w = require("./window");
 *   const win = w.openLoginWindow();        // mo (hoac tai dung) cua so
 *   const ok = await w.waitForPortalAuth(win, 120000);
 *   const cur = w.getIuWindow();            // lay lai cua so dang mo (hoac null)
 */

const { IU_URL, CMC_PARTITION } = require("./constants");
const { portalAuthStateScript } = require("./pagescript");

let iuWindow = null;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function getElectron() {
    try {
        // eslint-disable-next-line global-require
        return require("electron");
    } catch {
        throw Object.assign(
            new Error("loginIU() phải chạy trong Electron MAIN process (thiếu module 'electron')."),
            { code: "LOGIN_NO_ELECTRON" }
        );
    }
}

// Lay cua so dang mo (null neu chua mo hoac da bi huy).
function getIuWindow() {
    return iuWindow && !iuWindow.isDestroyed() ? iuWindow : null;
}

// Mo (hoac tai dung) cua so dang nhap. opts.hidden=true -> mo an.
function openLoginWindow(url, opts = {}) {
    const { BrowserWindow } = getElectron();
    if (iuWindow && !iuWindow.isDestroyed()) {
        if (url) iuWindow.loadURL(url);
        if (!opts.hidden) { iuWindow.show(); iuWindow.focus(); }
        return iuWindow;
    }
    iuWindow = new BrowserWindow({
        width: 1180,
        height: 860,
        show: !opts.hidden,
        title: "Đăng nhập IU (Microsoft)",
        autoHideMenuBar: true,
        webPreferences: {
            partition: CMC_PARTITION, // persist: đóng cửa sổ vẫn GIỮ phiên đăng nhập
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
            backgroundThrottling: false,
        },
    });
    iuWindow.on("closed", () => { iuWindow = null; });
    if (url) iuWindow.loadURL(url);
    if (!opts.hidden) iuWindow.focus();
    return iuWindow;
}

// Huy cua so (dung khi logout) va xoa bien noi bo.
function destroyWindow() {
    if (iuWindow && !iuWindow.isDestroyed()) {
        try { iuWindow.destroy(); } catch { /* ignore */ }
    }
    iuWindow = null;
}

// Nạp URL và đợi trang tải xong (did-stop-loading) hoặc hết timeout.
function loadAndWait(win, url, timeout = 18000) {
    return new Promise((resolve) => {
        let done = false;
        const wc = win.webContents;
        const finish = () => {
            if (done) return;
            done = true;
            clearTimeout(timer);
            wc.removeListener("did-stop-loading", onStop);
            setTimeout(resolve, 700); // chờ thêm XHR sau khi tải xong
        };
        const onStop = () => finish();
        const timer = setTimeout(finish, timeout);
        wc.on("did-stop-loading", onStop);
        wc.loadURL(url).catch(() => finish());
    });
}

// Kiem tra trang hien tai da dang nhap portal chua (chay script trong trang).
async function portalAuthState(win) {
    try {
        return !!(await win.webContents.executeJavaScript(
            `(${portalAuthStateScript.toString()})()`,
            true
        ));
    } catch {
        return false;
    }
}

// Cho toi khi dang nhap portal thanh cong (hoac het timeout -> false).
async function waitForPortalAuth(win, timeout = 120000) {
    const started = Date.now();
    while (Date.now() - started < timeout) {
        if (win.isDestroyed()) return false;
        if (await portalAuthState(win)) return true;
        await sleep(650);
    }
    return false;
}

// Lay URL hien tai cua cua so (an toan, khong nem loi).
function safeGetURL(win, fallback = IU_URL) {
    try { return win.webContents.getURL(); } catch { return fallback; }
}

module.exports = {
    getElectron,
    getIuWindow,
    openLoginWindow,
    destroyWindow,
    loadAndWait,
    portalAuthState,
    waitForPortalAuth,
    safeGetURL,
    sleep,
};
