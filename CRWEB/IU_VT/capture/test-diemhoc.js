"use strict";

/**
 * test-diemhoc.js — Demo tron vong: login IU -> bat API #diemhoc -> giai ma -> tom tat diem.
 *
 * Chay:  npx electron test-diemhoc.js   (trong thu muc IU/capture)
 *        (electron nam trong IU/login/node_modules — chay tu IU/login:
 *         npx electron ../capture/test-diemhoc.js)
 *
 * Dung 3 cum module cua du an (moi cum 1 nhiem vu):
 *   ../login    loginIU / getIuWindow  — dang nhap SSO, tra cookie + cua so.
 *   ../capture  batRequestRoute        — bat response qua CDP, tu giai Data.B.
 *   ../crypto   giai_ma                — (batRequestRoute goi ben trong).
 *
 * Luong:
 *  1. loginIU({ keepOpen: true }) — phien cu con thi SSO im lang; het han thi
 *     cua so HIEN de chon tai khoan Microsoft.
 *  2. batRequestRoute(win, URL#diemhoc) — dieu huong, bat response sinhvienapi,
 *     giai ma tung body.
 *  3. summarizeGrades() — tach mang diem (DAOTAO_HOCPHAN_TEN + DIEM), khu trung.
 *  4. In tom tat + luu full vao ketqua-diemhoc.json.
 */

const { app } = require("electron");
const fs = require("fs");
const path = require("path");
const { loginIU, getIuWindow } = require("../login");
const { batRequestRoute } = require("../capture");

const DIEM_URL = "https://iu.cmcu.edu.vn/congthongtin/Index.aspx#diemhoc";
const OUT_FILE = path.join(__dirname, "ketqua-diemhoc.json");

function log(...args) {
    // eslint-disable-next-line no-console
    console.log("[test-diemhoc]", ...args);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Tach diem tu cac block JSON da giai (nguon field: iuParser cua portal —
// mang item co DAOTAO_HOCPHAN_TEN + DIEM). Khu trung theo mon+hoc ky.
function summarizeGrades(blocks) {
    const grades = [];
    for (const raw of blocks) {
        let data;
        try {
            data = JSON.parse(raw);
        } catch {
            continue;
        }
        const visit = (v, depth = 0) => {
            if (depth > 6 || v == null) return;
            if (Array.isArray(v)) {
                if (v.length && v[0] && typeof v[0] === "object" && v[0].DAOTAO_HOCPHAN_TEN != null && v[0].DIEM !== undefined) {
                    for (const it of v) {
                        grades.push({
                            mon: it.DAOTAO_HOCPHAN_TEN,
                            ma: it.DAOTAO_HOCPHAN_MA,
                            tinchi: it.DAOTAO_HOCPHAN_HOCTRINH,
                            diem10: it.DIEM,
                            diem4: it.DIEMQUYDOI,
                            chu: it.DIEMQUYDOI_TEN,
                            xeploai: it.DANHGIA_TEN,
                            hocky: it.HOCKY,
                            namhoc: it.NAMHOC,
                        });
                    }
                    return;
                }
                for (const x of v) if (x && typeof x === "object") visit(x, depth + 1);
            } else if (typeof v === "object") {
                for (const x of Object.values(v)) visit(x, depth + 1);
            }
        };
        visit(data);
    }
    const seen = new Set();
    return grades.filter((g) => {
        const k = `${g.mon}|${g.hocky}|${g.namhoc}`;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
    });
}

async function main() {
    log("bắt đầu loginIU() — nếu session hết, cửa sổ sẽ HIỆN để bạn đăng nhập Microsoft...");
    const jar = await loginIU({ keepOpen: true, timeoutMs: 300000 });
    log(`login OK: cookie=${jar.count}, url=${jar.url}`);
    log(`cookie preview: ${jar.cookie.slice(0, 150)}${jar.cookie.length > 150 ? "..." : ""}`);

    const win = getIuWindow();
    if (!win) throw new Error("Mất cửa sổ IU sau khi login.");

    const { responses } = await batRequestRoute(win, DIEM_URL, { waitMs: 20000, log });
    log(`tổng API bắt được ở #diemhoc: ${responses.length}`);

    const allDecoded = [];
    for (const r of responses) for (const d of r.decoded || []) allDecoded.push(d);
    log(`tổng block giải mã được: ${allDecoded.length}`);

    const grades = summarizeGrades(allDecoded);
    log(`tổng môn có điểm: ${grades.length}`);
    for (const g of grades.slice(0, 30)) {
        log(` - ${g.mon} | TC=${g.tinchi} | 10=${g.diem10} | 4=${g.diem4} | ${g.chu} | ${g.xeploai} | HK${g.hocky} (${g.namhoc})`);
    }

    const out = {
        when: new Date().toISOString(),
        url: DIEM_URL,
        cookieCount: jar.count,
        cookieNames: Object.keys(jar.map),
        api: responses.map((r) => ({ url: r.url, len: r.len, decoded: (r.decoded || []).length })),
        decodedCount: allDecoded.length,
        decoded: allDecoded.slice(0, 80).map((s) => String(s).slice(0, 20000)),
        grades,
    };
    fs.writeFileSync(OUT_FILE, JSON.stringify(out, null, 2), "utf8");
    log("đã lưu:", OUT_FILE);

    if (!responses.length) {
        log("CẢNH BÁO: không bắt được API nào — có thể phiên hết hạn hoặc route đổi. Hãy mở DevTools (F12) trong cửa sổ IU kiểm tra.");
    }
    // Giữ cửa sổ 5s để bạn kịp nhìn, rồi thoát.
    await sleep(5000);
    app.quit();
}

app.whenReady().then(() => {
    main().catch((e) => {
        log("LỖI:", (e && e.message) || String(e), "| code:", (e && e.code) || "");
        app.exitCode = 1;
        setTimeout(() => app.quit(), 3000);
    });
});

app.on("window-all-closed", () => {
    // Không quit ngay — main() tự quit sau khi xong để kịp lưu file.
});
