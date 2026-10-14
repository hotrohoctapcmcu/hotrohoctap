/**
 * database/functions/sync.js
 * ===================================================================================
 * MODULE ĐỒNG BỘ DỮ LIỆU TỪ CRAWLER IU VÀO DATABASE
 * ===================================================================================
 * Nhận payload JSON từ crawler IU (bảng điểm, thời khóa biểu, lịch thi, sinh viên)
 * và lưu trữ / cập nhật vào các bảng tương ứng.
 * ===================================================================================
 */

const { executeQuery, executeProcedure } = require('../connection/db');

/**
 * Lưu toàn bộ dữ liệu cào được từ cổng IU vào cơ sở dữ liệu
 * @param {number} userId - ID người dùng
 * @param {Object} dataIU - Dữ liệu JSON chuẩn từ crawler IU
 * @returns {Promise<Object>} Kết quả đồng bộ
 */
async function saveIUData(userId, dataIU) {
    if (!userId) throw new Error('userId là bắt buộc');
    if (!dataIU) throw new Error('dataIU là bắt buộc');

    const result = {
        student: false,
        gradesCount: 0,
        timetableCount: 0,
        examsCount: 0,
        subjectsCount: 0
    };

    try {
        // 1. Đồng bộ thông tin sinh viên
        if (dataIU.MSV || dataIU.ten_nganh_hoc) {
            await executeProcedure('dbo.sp_Sprint1_SaveStudentProfile', {
                userId: parseInt(userId, 10),
                studentCode: dataIU.MSV || 'CMC123456',
                fullName: dataIU.ho_ten || 'Sinh viên CMC',
                major: dataIU.ten_nganh_hoc || 'Công nghệ thông tin',
                dob: dataIU.ngay_thang_nam_sinh ? convertDate(dataIU.ngay_thang_nam_sinh) : null,
                enrollmentYear: 2023,
                currentSemester: 'Học kỳ 1 - 2026'
            });
            result.student = true;
        }

        // 2. Đồng bộ danh sách môn học & bảng điểm
        if (dataIU.bang_diem) {
            for (const [kyKey, monList] of Object.entries(dataIU.bang_diem)) {
                if (typeof monList === 'object' && monList !== null) {
                    for (const [tenMon, chiTiet] of Object.entries(monList)) {
                        const cleanName = tenMon.replace(/_/g, ' ');
                        const credits = chiTiet.so_tin_chi || 3;
                        const finalScore = chiTiet.diem_tong_ket || 0;
                        const letter = chiTiet.diem_chu || 'B';
                        const isPassed = chiTiet.trang_thai === 'dat' ? 1 : 0;

                        // Tìm hoặc tạo subject
                        let subRows = await executeQuery('SELECT subject_id FROM dbo.Subjects WHERE subject_name = @name', { name: cleanName });
                        let subjectId;
                        if (subRows.length > 0) {
                            subjectId = subRows[0].subject_id;
                        } else {
                            const newSub = await executeQuery(
                                'INSERT INTO dbo.Subjects (subject_code, subject_name, credits) VALUES (@code, @name, @credits); SELECT SCOPE_IDENTITY() AS id;',
                                { code: 'SUB_' + Math.abs(hashCode(cleanName)), name: cleanName, credits }
                            );
                            subjectId = newSub[0].id;
                            result.subjectsCount++;
                        }

                        // Upsert điểm
                        await executeQuery(`
                            IF EXISTS (SELECT 1 FROM dbo.Grades WHERE student_id = (SELECT student_id FROM dbo.Students WHERE user_id = @userId) AND subject_id = @subjectId AND semester = @semester)
                                UPDATE dbo.Grades SET final_score = @finalScore, letter_grade = @letter, is_passed = @isPassed WHERE student_id = (SELECT student_id FROM dbo.Students WHERE user_id = @userId) AND subject_id = @subjectId AND semester = @semester;
                            ELSE
                                INSERT INTO dbo.Grades (student_id, subject_id, semester, credits, final_score, letter_grade, is_passed)
                                VALUES ((SELECT student_id FROM dbo.Students WHERE user_id = @userId), @subjectId, @semester, @credits, @finalScore, @letter, @isPassed);
                        `, { userId, subjectId, semester: kyKey, credits, finalScore, letter, isPassed });

                        result.gradesCount++;
                    }
                }
            }
        }

        // 3. Đồng bộ thời khóa biểu
        if (Array.isArray(dataIU.tkb)) {
            for (const t of dataIU.tkb) {
                const subRows = await executeQuery('SELECT subject_id FROM dbo.Subjects WHERE subject_code = @code OR subject_name = @name', {
                    code: t.ma_mon || 'UNKNOWN',
                    name: (t.ten_mon || '').replace(/_/g, ' ')
                });
                let subjectId = subRows.length > 0 ? subRows[0].subject_id : null;
                if (!subjectId) {
                    const newSub = await executeQuery(
                        'INSERT INTO dbo.Subjects (subject_code, subject_name, credits) VALUES (@code, @name, 3); SELECT SCOPE_IDENTITY() AS id;',
                        { code: t.ma_mon || 'MON_' + Date.now(), name: (t.ten_mon || '').replace(/_/g, ' ') }
                    );
                    subjectId = newSub[0].id;
                }

                await executeProcedure('dbo.sp_Sprint1_SaveTimetable', {
                    userId: parseInt(userId, 10),
                    subjectId,
                    className: t.ten_lop || 'Lớp học phần',
                    room: t.phong || 'A101',
                    campus: t.co_so || 'Cơ sở chính',
                    dayOfWeek: t.thu || 2,
                    startTime: t.gio_bat_dau || '07:30',
                    endTime: t.gio_ket_thuc || '09:30',
                    startDate: convertDate(t.ngay_bat_dau) || '2026-09-01',
                    endDate: convertDate(t.ngay_ket_thuc) || '2026-12-31',
                    lecturerName: t.giang_vien || null
                });
                result.timetableCount++;
            }
        }

        // 4. Đồng bộ lịch thi
        if (Array.isArray(dataIU.lich_thi)) {
            for (const lt of dataIU.lich_thi) {
                const subRows = await executeQuery('SELECT subject_id FROM dbo.Subjects WHERE subject_code = @code OR subject_name = @name', {
                    code: lt.ma_mon || 'UNKNOWN',
                    name: (lt.ten_mon || '').replace(/_/g, ' ')
                });
                let subjectId = subRows.length > 0 ? subRows[0].subject_id : null;
                if (!subjectId) {
                    const newSub = await executeQuery(
                        'INSERT INTO dbo.Subjects (subject_code, subject_name, credits) VALUES (@code, @name, 3); SELECT SCOPE_IDENTITY() AS id;',
                        { code: lt.ma_mon || 'MON_THI', name: (lt.ten_mon || '').replace(/_/g, ' ') }
                    );
                    subjectId = newSub[0].id;
                }

                await executeProcedure('dbo.sp_Sprint1_SaveExam', {
                    userId: parseInt(userId, 10),
                    subjectId,
                    examName: 'Thi kết thúc học phần',
                    examDate: convertDate(lt.ngay_thi) || '2026-12-15',
                    examTime: lt.gio_thi || '08:00',
                    durationMinutes: 90,
                    room: lt.phong_thi || 'A201',
                    campus: lt.co_so || 'Cơ sở chính',
                    examFormat: 'Tự luận'
                });
                result.examsCount++;
            }
        }

        return result;
    } catch (err) {
        console.error('[SYNC] Lỗi đồng bộ IU:', err.message);
        throw err;
    }
}

function convertDate(dateStr) {
    if (!dateStr) return null;
    // Format DD/MM/YYYY -> YYYY-MM-DD
    const parts = dateStr.split('/');
    if (parts.length === 3) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    return dateStr;
}

function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return hash;
}

module.exports = { saveIUData };
