"use strict";

/**
 * electron-main.js — VỎ ELECTRON MỞ CỬA SỔ APP (không chứa logic nghiệp vụ).
 *
 * - Tái dùng NGUYÊN BỘ khởi chạy server có sẵn (index.js gốc):
 *     API  : http://localhost:3001 (Express + database, tự mock nếu chưa có SQL Server)
 *     FE   : http://localhost:8080 (file tĩnh Frontend/unistudy-fe)
 * - File này chỉ thêm đúng 1 việc: mở cửa sổ app trỏ vào FE.
 * - Luồng IU/Electron (CRWEB/IU_VT) giữ nguyên, dùng cửa sổ + partition riêng.
 *
 * Chạy: npm start   (= electron .)
 */

let electron = null;
try {
    // eslint-disable-next-line global-require
    electron = require("electron");
} catch {
    electron = null;
}
if (!electron || typeof electron !== "object" || !electron.app || !electron.BrowserWindow) {
    console.error("[APP] Hãy chạy bằng `npm start` (electron .), không chạy bằng `node electron-main.js`.");
    process.exit(1);
}
const { app, BrowserWindow, shell } = electron;

// 1. Khởi chạy servers bằng đúng file index.js gốc (giữ nguyên logic, chỉ tái dùng).
require("./index");

const FE_URL = "http://localhost:8080";
const RETRY_DELAY_MS = 800;
const MAX_ATTEMPTS = 40;
let mainWindow = null;
let loadAttempt = 0;
let loadTimer = null;

function scheduleReload() {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    if (loadAttempt >= MAX_ATTEMPTS) {
        console.error(`[APP] Không tải được ${FE_URL} sau ${MAX_ATTEMPTS} lần thử.`);
        return;
    }
    clearTimeout(loadTimer);
    loadTimer = setTimeout(() => loadApp(loadAttempt + 1), RETRY_DELAY_MS);
}

function loadApp(attempt = 1) {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    loadAttempt = attempt;
    mainWindow.loadURL(FE_URL).catch(() => {
        // Servers cần vài giây để listen (đặc biệt lần đầu chờ DB timeout 4s) -> thử lại.
        scheduleReload();
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1380,
        height: 900,
        minWidth: 1024,
        minHeight: 700,
        show: false, // hiện khi trang sẵn sàng (tránh chớp trắng)
        backgroundColor: "#ffffff",
        title: "UniStudy CMC",
        autoHideMenuBar: true,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
        },
    });
    mainWindow.once("ready-to-show", () => {
        if (mainWindow && !mainWindow.isDestroyed()) mainWindow.show();
    });
    // FE tĩnh hoặc API chưa kịp listen -> thử lại thay vì hiện trang lỗi.
    mainWindow.webContents.on("did-fail-load", (_event, _code, _desc, _url, isMainFrame) => {
        if (isMainFrame !== false) scheduleReload();
    });
    // Tải xong -> reset bộ đếm thử lại.
    mainWindow.webContents.on("did-finish-load", () => {
        loadAttempt = 0;
        clearTimeout(loadTimer);
    });
    // Link ngoài (YouTube...) mở bằng trình duyệt hệ thống, không điều hướng trong app.
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (String(url || "").startsWith(FE_URL)) return { action: "allow" };
        shell.openExternal(url).catch(() => {});
        return { action: "deny" };
    });
    mainWindow.on("closed", () => { mainWindow = null; });
    loadApp();
    console.log(`[APP] Đang mở cửa sổ app tại ${FE_URL}`);
}

app.whenReady().then(createWindow);
app.on("window-all-closed", () => { app.quit(); });
app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
