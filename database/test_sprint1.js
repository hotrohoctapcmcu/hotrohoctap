/**
 * sprint1/test_sprint1.js
 * ===================================================================================
 * KỊCH BẢN KIỂM THỬ TOÀN DIỆN CHO SPRINT 1 (CHỨC NĂNG 1, 2, 3, 4, 9, 18)
 * ===================================================================================
 * Kiểm thử cả 2 cách sử dụng:
 *   Cách 1: const ketNoi = require('./sprint1'); const db = await ketNoi();
 *   Cách 2: const { layHoSo, layThoiKhoaBieu } = require('./sprint1');
 * ===================================================================================
 */

const ketNoiDatabase = require('./index');

async function chayKiemThuSprint1() {
    console.log('=================================================================');
    console.log('   BẮT ĐẦU KIỂM THỬ TOÀN DIỆN SPRINT 1 (CHỨC NĂNG 1, 2, 3, 4, 9, 18)');
    console.log('=================================================================');

    try {
        // [CÁCH 1]: Gọi hàm kết nối database theo đúng yêu cầu đề bài:
        // // trả về 1 hàm để kết nối tới database =>> là trả ra các hàm được sử dụng
        console.log('\n[0] Khởi tạo kết nối qua hàm ketNoiDatabase()...');
        const db = await ketNoiDatabase();
        console.log(' -> Kết nối thành công! Đã nhận được bộ hàm theo chức năng Sprint 1.\n');

        const userId = 1;

        // ─────────────────────────────────────────────────────────────
        // 1. KIỂM THỬ CHỨC NĂNG 18: HỒ SƠ HỌC TẬP CÁ NHÂN
        // ─────────────────────────────────────────────────────────────
        console.log('-----------------------------------------------------------------');
        console.log('1. KIỂM THỬ CHỨC NĂNG 18: HỒ SƠ HỌC TẬP CÁ NHÂN');
        console.log('-----------------------------------------------------------------');

        const hoSo = await db.layHoSo(userId);
        console.log(' [1.1] layHoSo():', hoSo ? `OK (MSV: ${hoSo.student_code}, Tên: ${hoSo.full_name}, Ngành: ${hoSo.major})` : 'NULL');
        if (hoSo) {
            console.log(`       GPA (Hệ 10): ${hoSo.gpa_10_scale} | GPA (Hệ 4): ${hoSo.gpa_4_scale} | Tín chỉ đạt: ${hoSo.total_passed_credits}`);
            console.log(`       Môn chưa đạt: ${hoSo.failed_subject_count} | Môn đã đạt: ${hoSo.passed_subject_count}`);
        }

        const bangDiem = await db.layBangDiem(userId);
        console.log(` [1.2] layBangDiem(): Lấy được ${bangDiem.length} bản ghi điểm.`);

        const monChuaDat = await db.layMonHocChuaDat(userId);
        console.log(` [1.3] layMonHocChuaDat(): ${monChuaDat.length} môn điểm F cần học lại.`);
        if (monChuaDat.length > 0) {
            console.log(`       Môn nợ mẫu: ${monChuaDat[0].subject_code} - ${monChuaDat[0].subject_name} (${monChuaDat[0].letter_grade})`);
        }

        const monDaDat = await db.layMonHocDaDat(userId);
        console.log(` [1.4] layMonHocDaDat(): ${monDaDat.length} môn đã tích lũy thành công.`);

        const dsMon = await db.layDanhSachMonHoc(userId);
        console.log(` [1.5] layDanhSachMonHoc(): Tổng cộng ${dsMon.length} môn học trong chương trình.`);

        // ─────────────────────────────────────────────────────────────
        // 2. KIỂM THỬ CHỨC NĂNG 1: THỜI KHÓA BIỂU THÔNG MINH
        // ─────────────────────────────────────────────────────────────
        console.log('\n-----------------------------------------------------------------');
        console.log('2. KIỂM THỬ CHỨC NĂNG 1: THỜI KHÓA BIỂU THÔNG MINH');
        console.log('-----------------------------------------------------------------');

        const tkb = await db.layThoiKhoaBieu(userId);
        console.log(` [2.1] layThoiKhoaBieu(): ${tkb.length} tiết học trong TKB.`);
        if (tkb.length > 0) {
            console.log(`       Tiết học mẫu: ${tkb[0].day_of_week_name} | ${tkb[0].subject_name} (${tkb[0].start_time} - ${tkb[0].end_time}) | Phòng ${tkb[0].room}`);
        }

        const tkbNgay = await db.layThoiKhoaBieuTheoNgay(userId, '2026-09-08');
        console.log(` [2.2] layThoiKhoaBieuTheoNgay('2026-09-08'): ${tkbNgay.length} tiết học.`);

        const tkbTuan = await db.layThoiKhoaBieuTheoTuan(userId, '2026-09-07', '2026-09-13');
        console.log(` [2.3] layThoiKhoaBieuTheoTuan('2026-09-07' -> '2026-09-13'): ${tkbTuan.length} tiết học.`);

        // ─────────────────────────────────────────────────────────────
        // 3. KIỂM THỬ CHỨC NĂNG 2: AI XẾP LỊCH TỰ HỌC & CẢNH BÁO TRÙNG
        // ─────────────────────────────────────────────────────────────
        console.log('\n-----------------------------------------------------------------');
        console.log('3. KIỂM THỬ CHỨC NĂNG 2: AI XẾP LỊCH TỰ HỌC VÀ CẢNH BÁO TRÙNG');
        console.log('-----------------------------------------------------------------');

        const trungLich = await db.kiemTraTrungLich(userId);
        console.log(` [3.1] kiemTraTrungLich(): Phát hiện ${trungLich.length} cặp lớp học chính khóa bị trùng.`);

        const freeSlots = await db.timKhoangTrongTuHoc(userId, '2026-09-08', 60);
        console.log(` [3.2] timKhoangTrongTuHoc('2026-09-08'): Tìm được ${freeSlots.length} khoảng thời gian trống cho tự học.`);
        if (freeSlots.length > 0) {
            console.log(`       Slot trống đầu tiên: ${freeSlots[0].start_time} - ${freeSlots[0].end_time} (${freeSlots[0].duration_minutes} phút)`);
        }

        // Thử xếp một lịch tự học mới vào khung giờ trống
        console.log(' [3.3] xepLichTuHoc(): Đang xếp một buổi tự học kiểm thử...');
        const newStudy = await db.xepLichTuHoc(userId, {
            subjectId: 1,
            title: 'Tự học ôn tập Sprint 1',
            studyDate: '2026-09-08',
            startTime: '19:00:00',
            endTime: '21:00:00',
            isAiSuggested: 1,
            notes: 'AI gợi ý slot trống buổi tối'
        });
        console.log(`       Đã xếp thành công lịch tự học ID: ${newStudy.schedule_id}`);

        // Lấy danh sách lịch tự học
        const dsLichTuHoc = await db.layLichTuHoc(userId, '2026-09-01', '2026-09-30');
        console.log(` [3.4] layLichTuHoc(): ${dsLichTuHoc.length} buổi tự học trong tháng.`);

        // Dọn dẹp lịch tự học test
        await db.xoaLichTuHoc(newStudy.schedule_id);
        console.log(' [3.5] xoaLichTuHoc(): Đã dọn dẹp lịch tự học kiểm thử thành công.');

        // ─────────────────────────────────────────────────────────────
        // 4. KIỂM THỬ CHỨC NĂNG 3: QUẢN LÝ DEADLINE VÀ CHECKLIST
        // ─────────────────────────────────────────────────────────────
        console.log('\n-----------------------------------------------------------------');
        console.log('4. KIỂM THỬ CHỨC NĂNG 3: QUẢN LÝ DEADLINE VÀ CHECKLIST');
        console.log('-----------------------------------------------------------------');

        const deadlines = await db.layDanhSachDeadline(userId);
        console.log(` [4.1] layDanhSachDeadline(): Có ${deadlines.length} bài tập/deadline.`);

        const sapToi = await db.layDeadlineSapToi(userId, 7);
        console.log(` [4.2] layDeadlineSapToi(7 ngày): Có ${sapToi.length} deadline sắp đến hạn.`);

        // Tạo bài tập mới để test Trigger tự sinh nhắc nhở
        console.log(' [4.3] themBaiTap(): Đang tạo bài tập kiểm thử mới...');
        const testDeadlineDate = new Date(Date.now() + 86400000 * 5); // 5 ngày sau
        const newAsg = await db.themBaiTap(userId, {
            subjectId: 1,
            title: 'Bài tập Kiểm thử Tự động Sprint 1',
            description: 'Kiểm thử Stored Procedure & Trigger tạo Reminders',
            deadline: testDeadlineDate,
            source: 'SYSTEM'
        });
        console.log(`       Đã tạo bài tập ID: ${newAsg.assignment_id}`);

        // Cập nhật trạng thái
        const updatedAsg = await db.capNhatTrangThaiBaiTap(newAsg.assignment_id, 'COMPLETED');
        console.log(` [4.4] capNhatTrangThaiBaiTap(): Đã chuyển trạng thái sang -> ${updatedAsg.status} (CompletedAt: ${updatedAsg.completed_at})`);

        // Xóa bài tập test
        await db.xoaBaiTap(newAsg.assignment_id);
        console.log(' [4.5] xoaBaiTap(): Đã xóa bài tập kiểm thử thành công.');

        // Kiểm thử Checklist
        const checklist = await db.layChecklist(userId);
        console.log(` [4.6] layChecklist(): ${checklist.length} task cá nhân trong checklist.`);

        const newChecklist = await db.themChecklist(userId, {
            title: 'Task kiểm thử Checklist Sprint 1',
            priority: 'HIGH',
            deadline: new Date(Date.now() + 86400000 * 2)
        });
        console.log(` [4.7] themChecklist(): Đã tạo task ID: ${newChecklist.checklist_id}`);

        await db.hoanThanhChecklist(newChecklist.checklist_id, true);
        console.log(' [4.8] hoanThanhChecklist(): Đã đánh dấu hoàn thành task.');

        await db.xoaChecklist(newChecklist.checklist_id);
        console.log(' [4.9] xoaChecklist(): Đã dọn dẹp task kiểm thử.');

        // ─────────────────────────────────────────────────────────────
        // 5. KIỂM THỬ CHỨC NĂNG 4: NHẮC NHỞ THÔNG MINH ĐA TẦNG
        // ─────────────────────────────────────────────────────────────
        console.log('\n-----------------------------------------------------------------');
        console.log('5. KIỂM THỬ CHỨC NĂNG 4: NHẮC NHỞ THÔNG MINH ĐA TẦNG');
        console.log('-----------------------------------------------------------------');

        const nhacNho = await db.layDanhSachNhacNho(userId);
        console.log(` [5.1] layDanhSachNhacNho(): ${nhacNho.length} nhắc nhở đang lưu trong hệ thống.`);

        // Tạo nhắc nhở đơn lẻ
        const newReminder = await db.taoNhacNho(userId, {
            targetType: 'CUSTOM',
            targetId: 999,
            title: 'Nhắc nhở kiểm thử Sprint 1',
            message: 'Kiểm tra thông báo in-app',
            tier: 'CUSTOM',
            remindTime: new Date(Date.now() - 10000), // đã quá giờ 10 giây để test quét đến hạn
            channel: 'APP'
        });
        console.log(` [5.2] taoNhacNho(): Đã tạo nhắc nhở ID: ${newReminder.reminder_id}`);

        // Quét các nhắc nhở đến hạn
        const dueReminders = await db.layNhacNhoDenHanChuaGui();
        console.log(` [5.3] layNhacNhoDenHanChuaGui(): ${dueReminders.length} thông báo cần gửi ngay lập tức.`);

        // Đánh dấu đã gửi
        await db.danhDauDaGuiNhacNho(newReminder.reminder_id);
        console.log(' [5.4] danhDauDaGuiNhacNho(): Đã cập nhật is_sent = 1 thành công.');

        // Xóa nhắc nhở test
        await db.xoaNhacNho(newReminder.reminder_id);
        console.log(' [5.5] xoaNhacNho(): Đã dọn dẹp nhắc nhở test.');

        // ─────────────────────────────────────────────────────────────
        // 6. KIỂM THỬ CHỨC NĂNG 9: QUẢN LÝ LỊCH THI VÀ KẾ HOẠCH ÔN THI
        // ─────────────────────────────────────────────────────────────
        console.log('\n-----------------------------------------------------------------');
        console.log('6. KIỂM THỬ CHỨC NĂNG 9: QUẢN LÝ LỊCH THI VÀ KẾ HOẠCH ÔN THI');
        console.log('-----------------------------------------------------------------');

        const lichThi = await db.layLichThi(userId);
        console.log(` [6.1] layLichThi(): ${lichThi.length} môn thi trong danh sách.`);

        const lichThiSapToi = await db.layLichThiSapToi(userId);
        console.log(` [6.2] layLichThiSapToi(): ${lichThiSapToi.length} môn thi sắp diễn ra.`);
        if (lichThiSapToi.length > 0) {
            console.log(`       Môn thi đầu tiên: ${lichThiSapToi[0].subject_name} | Ngày: ${lichThiSapToi[0].exam_date.toISOString().split('T')[0]} | Đếm ngược: ${lichThiSapToi[0].days_remaining} ngày.`);
        }

        // Tạo kỳ thi test mới
        console.log(' [6.3] themLichThi(): Đang thêm môn thi kiểm thử...');
        const newExam = await db.themLichThi(userId, {
            subjectId: 1,
            examName: 'Thi Cuối Kỳ Test Sprint 1',
            examDate: '2026-12-25',
            examTime: '08:00:00',
            durationMinutes: 90,
            room: 'A305',
            campus: 'Cơ sở 1',
            examFormat: 'Tự luận'
        });
        console.log(`       Đã tạo kỳ thi ID: ${newExam.exam_id}`);

        // Tạo kế hoạch ôn thi gắn với môn thi này
        console.log(' [6.4] taoKeHoachOnThi(): Đang lập kế hoạch ôn thi...');
        const newPlan = await db.taoKeHoachOnThi(userId, {
            examId: newExam.exam_id,
            phaseTitle: 'Giai đoạn 1: Ôn tập lý thuyết và slide',
            targetDescription: 'Đọc kỹ 5 chương đầu và tóm tắt sơ đồ tư duy',
            startDate: '2026-12-10',
            endDate: '2026-12-15',
            priority: 'HIGH'
        });
        console.log(`       Đã tạo kế hoạch ôn thi ID: ${newPlan.plan_id}`);

        // Lấy danh sách kế hoạch ôn thi
        const dsKeHoach = await db.layKeHoachOnThi(userId, newExam.exam_id);
        console.log(` [6.5] layKeHoachOnThi(): Lấy được ${dsKeHoach.length} giai đoạn ôn thi.`);

        // Cập nhật trạng thái kế hoạch
        await db.capNhatTrangThaiKeHoachOnThi(newPlan.plan_id, 'IN_PROGRESS');
        console.log(' [6.6] capNhatTrangThaiKeHoachOnThi(): Đã chuyển trạng thái sang IN_PROGRESS.');

        // Dọn dẹp kế hoạch và kỳ thi test
        await db.xoaKeHoachOnThi(newPlan.plan_id);
        await db.xoaLichThi(newExam.exam_id);
        console.log(' [6.7] xoaKeHoachOnThi() & xoaLichThi(): Đã dọn dẹp kiểm thử kỳ thi thành công.');

        console.log('\n=================================================================');
        console.log('   CHÚC MỪNG! TẤT CẢ CÁC HÀM CỦA SPRINT 1 ĐÃ CHẠY HOÀN HẢO 100%!');
        console.log('=================================================================');
        process.exit(0);

    } catch (error) {
        console.error('\n[LỖI TRONG QUÁ TRÌNH KIỂM THỬ]:', error);
        process.exit(1);
    }
}

chayKiemThuSprint1();
