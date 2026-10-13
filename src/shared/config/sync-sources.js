/**
 * UniStudy CMC - Sync Sources Configuration
 * Điểm vào cổng trường chính thức do chủ dự án cung cấp (NAVIGATION_MAP.md)
 */
export const SYNC_SOURCES = [
  {
    id: "iu",
    name: "Hệ thống Quản lý Đào tạo (IU)",
    code: "IU",
    description: "Thời khóa biểu chính khóa, lịch thi học kỳ, phòng học, giảng viên",
    portalUrl: "https://iu.cmcu.edu.vn/congthongtin/Index.aspx",
    defaultSelected: true,
    priority: 1 // IU luôn được ưu tiên mở đầu tiên
  },
  {
    id: "edux",
    name: "Cổng Thông tin Sinh viên (EduX)",
    code: "EduX",
    description: "Hồ sơ cá nhân, tiến độ học tập, chương trình đào tạo",
    portalUrl: "https://edux.cmcu.edu.vn/",
    defaultSelected: true,
    priority: 2
  },
  {
    id: "lms",
    name: "Hệ thống Quản lý Học tập (LMS)",
    code: "LMS",
    description: "Thông báo từ giảng viên, tài liệu môn học, bài tập nộp",
    portalUrl: "https://lms.cmcu.edu.vn/",
    defaultSelected: true,
    priority: 3
  },
  {
    id: "elearning",
    name: "Cổng eLearning CMC",
    code: "eLearning",
    description: "Bài giảng trực tuyến, bài kiểm tra nhanh",
    portalUrl: "https://elearning.cmcu.edu.vn/",
    defaultSelected: true,
    priority: 4
  }
];
