/**
 * API/test.js
 * ===================================================================================
 * KIỂM THỬ NHANH CÁC ENDPOINT API SPRINT 1
 * ===================================================================================
 * Chạy: node test.js
 * Yêu cầu: Server đang chạy tại http://localhost:3001
 * ===================================================================================
 */

const BASE = 'http://localhost:3001/api/v1';
let TOKEN = null;

async function req(method, path, body = null, token = TOKEN) {
    const opts = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
    };
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(`${BASE}${path}`, opts);
    const json = await res.json();
    return { httpStatus: res.status, ...json };
}

function log(label, result) {
    const ok = result.success !== false && (result.httpStatus || 200) < 400;
    console.log(`  [${ok ? 'OK' : 'FAIL'}] ${label}`);
    if (!ok) console.log('         ↳', JSON.stringify(result).slice(0, 120));
}

async function runTests() {
    console.log('\n================================================================');
    console.log('   KIỂM THỬ API SPRINT 1 — UniStudy CMC');
    console.log('================================================================\n');

    // Health check
    console.log('0. HEALTH CHECK');
    const health = await fetch('http://localhost:3001/health').then(r => r.json());
    console.log(`   Server: ${health.service || 'N/A'}\n`);

    // Auth
    console.log('1. XÁC THỰC (POST /auth/login)');
    const login = await req('POST', '/auth/login', { username: 'CMC123456', password: '123456' });
    log('Đăng nhập', login);
    if (login.token) {
        TOKEN = login.token;
        console.log(`   Token: ${TOKEN.slice(0, 30)}...\n`);
    } else {
        console.log('   [SKIP] Không có token — bỏ qua các test cần auth\n');
    }

    // Student profile
    console.log('2. HỒ SƠ SINH VIÊN (Chức năng 18)');
    log('GET /student/profile',   await req('GET', '/student/profile'));
    log('GET /student/grades',    await req('GET', '/student/grades'));
    log('GET /student/subjects',  await req('GET', '/student/subjects'));

    // Schedules
    console.log('\n3. THỜI KHÓA BIỂU (Chức năng 1)');
    log('GET /schedules',            await req('GET', '/schedules'));
    log('GET /schedules/today',      await req('GET', '/schedules/today'));
    log('GET /schedules/by-date',    await req('GET', '/schedules/by-date?date=2026-09-08'));
    log('GET /schedules/by-week',    await req('GET', '/schedules/by-week?from=2026-09-07&to=2026-09-13'));

    // Conflicts & Study
    console.log('\n4. LỊCH TỰ HỌC & CẢNH BÁO TRÙNG (Chức năng 2)');
    log('GET /schedules/conflicts/check',      await req('GET',  '/schedules/conflicts/check'));
    log('POST /schedules/conflicts/check',     await req('POST', '/schedules/conflicts/check', {
        studyDate: '2026-09-08', startTime: '14:00', endTime: '16:00'
    }));
    log('GET /schedules/study/free-slots',     await req('GET',  '/schedules/study/free-slots?date=2026-09-08&duration=60'));

    // Tasks
    console.log('\n5. BÀI TẬP & CHECKLIST (Chức năng 3)');
    log('GET /tasks',           await req('GET', '/tasks'));
    log('GET /tasks/upcoming',  await req('GET', '/tasks/upcoming?days=3'));
    log('GET /tasks/checklist', await req('GET', '/tasks/checklist'));

    // Notifications
    console.log('\n6. NHẮC NHỞ ĐA TẦNG (Chức năng 4)');
    log('GET /notifications',              await req('GET', '/notifications'));
    log('GET /notifications/unread-count', await req('GET', '/notifications/unread-count'));

    // Exams
    console.log('\n7. LỊCH THI & ÔN THI (Chức năng 9)');
    log('GET /exams',              await req('GET', '/exams'));
    log('GET /exams/upcoming',     await req('GET', '/exams/upcoming'));
    log('GET /exams/study-plans',  await req('GET', '/exams/study-plans'));

    // Sync
    console.log('\n8. ĐỒNG BỘ DỮ LIỆU CMC');
    log('GET /sync/sources', await req('GET', '/sync/sources'));
    log('POST /sync',        await req('POST', '/sync', { sources: ['IU'] }));

    console.log('\n================================================================');
    console.log('   HOÀN THÀNH KIỂM THỬ API SPRINT 1');
    console.log('================================================================\n');
}

runTests().catch(err => {
    console.error('[ERROR]', err.message);
    console.log('\nHãy chắc chắn server đang chạy: node API/index.js');
});
