"use strict";

// Demo tong hop Smart Study Hub: login IU -> lay tat ca du lieu truc tiep tu portal (khong database).
// Chay: npx electron .   (trong thu muc hotrohoctap â€” KHONG chay bang node)

const { loginIU, getIuWindow, laySession, layTatCaIU } = require(".");

// Tuan hien tai (doi theo lich thuc te khi can lay lich hoc/tuan).
const NGAY_BAT_DAU = "05/10/2026";
const NGAY_KET_THUC = "11/10/2026";

async function main() {
    try {
        console.log("Äang Ä‘Äƒng nháº­p IU...");
        const jar = await loginIU({ timeoutMs: 180000, keepOpen: true });
        if (!jar || jar.count === 0) {
            throw new Error("ÄÄƒng nháº­p thĂ nh cĂ´ng nhÆ°ng khĂ´ng láº¥y Ä‘Æ°á»£c cookie IU.");
        }
        console.log(`ÄÄƒng nháº­p OK: cookie=${jar.count}, url=${jar.url}`);

        const win = getIuWindow();
        if (!win) throw new Error("Máº¥t cá»­a sá»• IU sau khi login.");

        const session = await laySession(win);
        console.log(`Session: userId=${session.userId.slice(0, 8)}...`);

        console.log("Äang láº¥y dá»¯ liá»‡u IU (tin tá»©c, há»“ sÆ¡, Ä‘iá»ƒm, rĂ¨n luyá»‡n, lá»‹ch há»c/thi, phĂºc kháº£o)...");
        const { data, thatBai } = await layTatCaIU(session, jar.cookie, {
            ngayBatDau: NGAY_BAT_DAU,
            ngayKetThuc: NGAY_KET_THUC,
            log: console.log,
        });

        const iu = data.IU;
        console.log("---- TOM TAT ----");
        console.log(`Tin tá»©c: ${iu.tin_tuc.length}`);
        console.log(`Há» tĂªn: ${iu.ho_so_sinh_vien.thong_tin_ca_nhan.ho_ten} | MSSV: ${iu.ho_so_sinh_vien.thong_tin_ca_nhan.ma_sinh_vien}`);
        console.log(`Báº£ng Ä‘iá»ƒm: ${iu.goc_hoc_tap.tra_cuu_diem.bang_diem.length} mĂ´n`);
        console.log(`Há»c pháº§n ná»£: ${iu.goc_hoc_tap.tra_cuu_diem.hoc_phan_no.length}`);
        console.log(`Káº¿t quáº£ Ä‘Äƒng kĂ½: ${iu.goc_hoc_tap.tra_cuu_diem.ket_qua_dang_ky.length}`);
        console.log(`VÄƒn báº±ng: ${iu.goc_hoc_tap.tra_cuu_diem.van_bang_chung_chi.length}`);
        console.log(`Äiá»ƒm rĂ¨n luyá»‡n: ${iu.goc_hoc_tap.diem_ren_luyen.length}`);
        console.log(`ChÆ°Æ¡ng trĂ¬nh há»c: ${iu.goc_hoc_tap.chuong_trinh_hoc_tap.length} há»c ká»³`);
        console.log(`PhĂºc kháº£o: ${iu.goc_hoc_tap.dang_ky_xin_phuc_khao.length}`);
        console.log(`Lá»‹ch há»c: ${iu.lich_hoc.chi_tiet_thoi_khoa_bieu.length} buá»•i`);
        console.log(`Lá»‹ch thi: ${iu.lich_thi.chi_tiet_lich_thi.length}`);
        if (thatBai.length) console.log(`Endpoint lá»—i (${thatBai.length}):`, thatBai);

    } catch (error) {
        console.error("Lá»—i:", error.message);
        console.error("MĂ£ lá»—i:", error.code || "UNKNOWN");
        if (error.code === "LOGIN_NO_ELECTRON") {
            console.error("Gá»£i Ă½: cháº¡y báº±ng `npx electron .`, KHĂ”NG cháº¡y báº±ng `node index`.");
        }
        try {
            const e = require("electron");
            if (e && typeof e === "object" && e.app && e.app.quit) e.app.quit();
        } catch { /* ignore */ }
        process.exitCode = 1;
    }
}

function getElectronApp() {
    try {
        // eslint-disable-next-line global-require
        const e = require("electron");
        if (e && typeof e === "object" && e.app && typeof e.app.whenReady === "function") {
            return e.app;
        }
    } catch { /* khĂ´ng pháº£i Electron */ }
    return null;
}

const electronApp = getElectronApp();
if (electronApp) {
    electronApp.whenReady().then(() => main());
    electronApp.on("window-all-closed", () => {
        // KhĂ´ng quit ngay â€” main() tá»± quáº£n lĂ½ vĂ²ng Ä‘á»i (keepOpen: true giá»¯ cá»­a sá»•).
    });
} else {
    console.error("PhĂ¡t hiá»‡n cháº¡y báº±ng `node` thÆ°á»ng (khĂ´ng pháº£i Electron).");
    console.error("CĂ¡ch Ä‘Ăºng: cd hotrohoctap && npx electron .");
    main();
}
