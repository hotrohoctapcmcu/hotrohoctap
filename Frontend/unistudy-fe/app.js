const app = document.querySelector("#app");
const authModal = document.querySelector("#authModal");
const taskModal = document.querySelector("#taskModal");
const toast = document.querySelector("#toast");

const DATA_SYNC_STORAGE_KEY = "unistudy-data-synced-v2";
const LEGACY_DATA_SYNC_STORAGE_KEY = "unistudy-data-synced-v1";
const LEGACY_LOGIN_STORAGE_KEY = "unistudy-student-login-v2";
const savedDataSync = localStorage.getItem(DATA_SYNC_STORAGE_KEY) === "true";
const savedWorkspaceTabs = (() => {
  try {
    const tabs = JSON.parse(localStorage.getItem("unistudy-open-tabs") || "null");
    return Array.isArray(tabs) && tabs.length ? tabs : ["dashboard"];
  } catch (_) {
    return ["dashboard"];
  }
})();

const state = {
  screen: "landing",
  isLoggedIn: savedDataSync,
  view: "dashboard",
  mobileOpen: false,
  openTabs: savedWorkspaceTabs,
  tabMenuOpen: false,
  scheduleMode: "week",
  scheduleSelectedDate: "2026-10-01",
  studySchedulerOpen: false,
  examPlanOpen: false,
  hiddenSchoolEventIds: [],
  studyEvents: [
    { id: 201, date: "2026-10-03", start: "09:00", end: "10:30", title: "Ôn Stack & Queue", subject: "Cấu trúc dữ liệu", note: "Tự xếp · Thư viện" }
  ],
  exams: [
    { id: 401, subject: "Cơ sở dữ liệu", code: "DBI202", date: "2026-10-16", start: "08:00", duration: 90, room: "A205", scope: "Chương 1–6 và bài tập thực hành", source: "CMC" },
    { id: 402, subject: "Cấu trúc dữ liệu và GT", code: "PROG2008", date: "2026-10-20", start: "13:30", duration: 120, room: "B201", scope: "Chương 1–8, thuật toán cơ bản", source: "CMC" },
    { id: 403, subject: "Lập trình Web", code: "PROG2001", date: "2026-10-24", start: "09:00", duration: 90, room: "C305", scope: "HTML, CSS, JavaScript và Project", source: "Tự thêm" }
  ],
  notificationFilter: "all",
  progressPeriod: "day",
  progressPanelOpen: false,
  taskFilter: "all",
  taskSubjectFilter: "",
  taskStatusFilter: "",
  taskPriorityFilter: "",
  editingTaskId: null,
  expandedTaskId: 1,
  aiFeature: "chat",
  miniChatOpen: false,
  miniChatMessages: [
    { role: "assistant", text: "Chào Minh Anh, mình là thanh tư vấn nhanh của UniStudy. Bạn có thể hỏi về lịch học, deadline hoặc nên học gì trước." }
  ],
  quizStage: "overview",
  quizConfig: { title: "", subject: "Cấu trúc dữ liệu", fileName: "", count: 10, difficulty: "Trung bình" },
  quizCurrent: 0,
  quizAnswers: {},
  quizQuestions: [],
  quizResult: null,
  quizHistory: [
    { id: 301, title: "Stack & Queue", subject: "Cấu trúc dữ liệu", fileName: "CTDL_Chuong3.pdf", count: 10, difficulty: "Trung bình", score: 8, date: "01/10/2026 · 20:14" },
    { id: 302, title: "Chuẩn hóa dữ liệu", subject: "Cơ sở dữ liệu", fileName: "CSDL_Chuong4.pptx", count: 10, difficulty: "Khó", score: 9, date: "30/09/2026 · 19:25" },
    { id: 303, title: "JavaScript Object", subject: "Lập trình Web", fileName: "JS_Object.pdf", count: 15, difficulty: "Dễ", score: 12, date: "28/09/2026 · 14:08" }
  ],
  flashStage: "library",
  activeFlashDeckId: null,
  flashFlipped: false,
  flashIndex: 0,
  messages: [
    {
      role: "assistant",
      text: "Chào Minh Anh! Mình có thể tóm tắt tài liệu, giải thích kiến thức hoặc sắp xếp lịch học dựa trên thời gian rảnh của bạn."
    }
  ],
  tasks: [
    { id: 1, title: "Nộp bài lớn Cơ sở dữ liệu", subject: "Cơ sở dữ liệu", due: "20/09/2026 · 23:59", dueInput: "2026-09-20T23:59", daysLeft: 2, remaining: "2 ngày", priority: "Cao", status: "Đang làm", progress: 50, done: false },
    { id: 2, title: "Thuyết trình môn Lập trình Web", subject: "Lập trình Web", due: "22/09/2026", dueInput: "2026-09-22T09:00", daysLeft: 4, remaining: "4 ngày", priority: "Cao", status: "Đang làm", progress: 35, done: false },
    { id: 3, title: "Bài tập Chương 4", subject: "Cấu trúc DL&GT", due: "25/09/2026", dueInput: "2026-09-25T23:59", daysLeft: 7, remaining: "7 ngày", priority: "Trung bình", status: "Chưa làm", progress: 0, done: false },
    { id: 4, title: "Đọc tài liệu tuần 3", subject: "Cơ sở dữ liệu", due: "26/09/2026", dueInput: "2026-09-26T20:00", daysLeft: 8, remaining: "8 ngày", priority: "Thấp", status: "Chưa làm", progress: 0, done: false },
    { id: 5, title: "Bài kiểm tra giữa kỳ", subject: "Lập trình Web", due: "30/09/2026", dueInput: "2026-09-30T08:00", daysLeft: 12, remaining: "12 ngày", priority: "Cao", status: "Chưa làm", progress: 0, done: false },
    { id: 6, title: "Chuẩn bị báo cáo thực hành", subject: "Cấu trúc DL&GT", due: "05/10/2026", dueInput: "2026-10-05T18:00", daysLeft: 17, remaining: "17 ngày", priority: "Trung bình", status: "Chưa làm", progress: 0, done: false },
    { id: 7, title: "Hoàn thành hợp đồng công nghệ phần mềm", subject: "Cấu trúc dữ liệu", due: "17/09/2026", dueInput: "2026-09-17T17:00", daysLeft: 0, remaining: "Đã nộp", priority: "Cao", status: "Hoàn thành", progress: 100, done: true }
  ],
  flashDecks: [
    {
      id: 101, name: "JavaScript nền tảng", subject: "Lập trình Web", description: "DOM, biến, hàm và xử lý sự kiện", color: "violet", progress: 75, updated: "Hôm nay",
      cards: [
        { id: 1001, front: "DOM trong JavaScript là gì?", back: "DOM là mô hình biểu diễn tài liệu HTML dưới dạng cây đối tượng, cho phép JavaScript đọc và thay đổi trang web.", tag: "DOM" },
        { id: 1002, front: "Sự khác nhau giữa let và const?", back: "let cho phép gán lại giá trị; const không cho phép gán lại biến sau khi khởi tạo.", tag: "Biến" },
        { id: 1003, front: "addEventListener dùng để làm gì?", back: "Dùng để đăng ký một hàm xử lý khi sự kiện như click, input hoặc submit xảy ra.", tag: "Event" },
        { id: 1004, front: "Object trong JavaScript lưu dữ liệu như thế nào?", back: "Object lưu dữ liệu theo các cặp key–value và phù hợp để mô tả một đối tượng.", tag: "Object" }
      ]
    },
    {
      id: 102, name: "Cơ sở dữ liệu căn bản", subject: "Cơ sở dữ liệu", description: "Khóa, quan hệ, SQL và chuẩn hóa", color: "green", progress: 60, updated: "Hôm qua",
      cards: [
        { id: 1101, front: "Khóa chính có vai trò gì?", back: "Khóa chính xác định duy nhất mỗi bản ghi, không được trùng và không được NULL.", tag: "Key" },
        { id: 1102, front: "Khóa ngoại là gì?", back: "Khóa ngoại là thuộc tính tham chiếu đến khóa chính của bảng khác để duy trì quan hệ.", tag: "Relationship" },
        { id: 1103, front: "SELECT dùng để làm gì?", back: "SELECT dùng để truy vấn và lấy dữ liệu từ một hoặc nhiều bảng.", tag: "SQL" }
      ]
    },
    {
      id: 103, name: "Cấu trúc dữ liệu", subject: "Cấu trúc dữ liệu", description: "Stack, Queue, Hash Table và cây", color: "blue", progress: 35, updated: "02/10/2026",
      cards: [
        { id: 1201, front: "Độ phức tạp tìm kiếm trung bình của bảng băm?", back: "Trung bình là O(1); trường hợp xấu nhất có thể là O(n).", tag: "Hash Table" },
        { id: 1202, front: "Stack hoạt động theo nguyên tắc nào?", back: "LIFO – phần tử vào sau sẽ được lấy ra trước.", tag: "Stack" },
        { id: 1203, front: "Queue hoạt động theo nguyên tắc nào?", back: "FIFO – phần tử vào trước sẽ được lấy ra trước.", tag: "Queue" }
      ]
    },
    {
      id: 104, name: "Tiếng Anh học thuật", subject: "Tiếng Anh", description: "Từ vựng thường gặp trong bài đọc", color: "pink", progress: 48, updated: "29/09/2026",
      cards: [
        { id: 1301, front: "Significant", back: "Quan trọng, đáng kể", tag: "Vocabulary" },
        { id: 1302, front: "Furthermore", back: "Hơn nữa, ngoài ra", tag: "Linking word" }
      ]
    }
  ],
  notifications: [
    { id: 1, type: "deadline", title: "Deadline còn 3 giờ", body: "Báo cáo Lab 4 – Cấu trúc dữ liệu sẽ hết hạn lúc 23:59 hôm nay.", time: "5 phút trước", read: false },
    { id: 2, type: "schedule", title: "Thay đổi phòng học", body: "Lớp Lập trình Web sáng mai chuyển từ B203 sang C305.", time: "32 phút trước", read: false },
    { id: 3, type: "school", title: "Thông báo mới từ LMS", body: "Giảng viên đã đăng slide Chương 5 và bài tập luyện tập.", time: "2 giờ trước", read: true },
    { id: 4, type: "study", title: "Hoàn thành mục tiêu tự học", body: "Bạn đã học đủ 2 giờ theo kế hoạch hôm nay. Tiếp tục phát huy nhé!", time: "Hôm qua", read: true },
    { id: 5, type: "quiz", title: "Quiz mới đã sẵn sàng", body: "AI đã tạo 10 câu hỏi từ slide Cấu trúc dữ liệu tuần 5.", time: "Hôm qua", read: false }
  ],
  timer: {
    mode: "focus",
    focusMinutes: 25,
    breakMinutes: 5,
    total: 25 * 60,
    seconds: 25 * 60,
    running: false,
    paused: false,
    intervalId: null,
    history: [
      { subject: "Cấu trúc dữ liệu", duration: "25 phút", time: "Hôm nay · 09:30" },
      { subject: "Lập trình Web", duration: "25 phút", time: "Hôm qua · 20:15" },
      { subject: "Cơ sở dữ liệu", duration: "50 phút", time: "30/09 · 19:00" }
    ]
  }
};

function restoreStudyWorkspace() {
  try {
    const decks = JSON.parse(localStorage.getItem("unistudy-flash-decks") || "null");
    const quizHistory = JSON.parse(localStorage.getItem("unistudy-quiz-history") || "null");
    const studyEvents = JSON.parse(localStorage.getItem("unistudy-study-events") || "null");
    const hiddenSchoolEventIds = JSON.parse(localStorage.getItem("unistudy-hidden-school-events") || "null");
    const exams = JSON.parse(localStorage.getItem("unistudy-exams") || "null");
    if (Array.isArray(decks)) state.flashDecks = decks;
    if (Array.isArray(quizHistory)) state.quizHistory = quizHistory;
    if (Array.isArray(studyEvents)) state.studyEvents = studyEvents;
    if (Array.isArray(hiddenSchoolEventIds)) state.hiddenSchoolEventIds = hiddenSchoolEventIds;
    if (Array.isArray(exams)) state.exams = exams;
  } catch (_) {
    // Giữ dữ liệu mẫu nếu trình duyệt chưa có hoặc dữ liệu cũ không hợp lệ.
  }
}

function persistStudyWorkspace() {
  try {
    localStorage.setItem("unistudy-flash-decks", JSON.stringify(state.flashDecks));
    localStorage.setItem("unistudy-quiz-history", JSON.stringify(state.quizHistory));
    localStorage.setItem("unistudy-study-events", JSON.stringify(state.studyEvents));
    localStorage.setItem("unistudy-hidden-school-events", JSON.stringify(state.hiddenSchoolEventIds));
    localStorage.setItem("unistudy-exams", JSON.stringify(state.exams));
  } catch (_) {
    // Bản mô phỏng vẫn hoạt động trong bộ nhớ khi trình duyệt chặn localStorage.
  }
}

restoreStudyWorkspace();

const navGroups = [
  {
    title: "Tổng quan",
    items: [
      { id: "dashboard", label: "Tổng quan", icon: "i-grid" },
      { id: "schedule", label: "Lịch học", icon: "i-calendar" },
      { id: "tasks", label: "Công việc", icon: "i-tasks" },
      { id: "documents", label: "Tài liệu", icon: "i-folder" }
    ]
  },
  {
    title: "Học tập thông minh",
    items: [
      { id: "ai", label: "Trợ lý AI", icon: "i-spark" },
      { id: "study-plan", label: "Kế hoạch học tập", icon: "i-plan" },
      { id: "exam-plan", label: "Kế hoạch ôn thi", icon: "i-exam" },
      { id: "quiz", label: "Quiz AI", icon: "i-quiz" },
      { id: "flashcards", label: "Flashcard", icon: "i-cards" }
    ]
  },
  {
    title: "Theo dõi",
    items: [
      { id: "progress", label: "Tiến độ", icon: "i-chart" },
      { id: "pomodoro", label: "Pomodoro", icon: "i-clock" },
      { id: "notifications", label: "Thông báo", icon: "i-bell", badge: "3" }
    ]
  }
];

const viewMeta = {
  dashboard: ["Dashboard", "Tổng quan học tập hôm nay"],
  schedule: ["Thời khóa biểu", "Lịch ngày, lịch tuần và cảnh báo trùng giờ"],
  tasks: ["Công việc & Deadline", "Ưu tiên đúng việc và hoàn thành từng bước"],
  documents: ["Kho tài liệu", "Tìm kiếm tài liệu tập trung theo môn học"],
  ai: ["Trợ lý học tập AI", "Hỏi đáp, tóm tắt và giải thích kiến thức"],
  "study-plan": ["Kế hoạch học tập", "Lịch tự học được cá nhân hóa theo tuần"],
  "exam-plan": ["Kế hoạch ôn thi", "Lộ trình cho từng kỳ thi sắp tới"],
  quiz: ["Quiz bằng AI", "Tạo bài kiểm tra và nhận giải thích ngay"],
  flashcards: ["Flashcard thông minh", "Tạo thẻ và ưu tiên phần kiến thức còn yếu"],
  progress: ["Tiến độ học tập", "Theo dõi theo ngày, tháng và năm"],
  pomodoro: ["Pomodoro", "Tập trung 25 phút, nghỉ 5 phút"],
  notifications: ["Thông báo", "Lịch học, deadline và hoạt động học tập"],
  sync: ["Đồng bộ dữ liệu", "Chọn nguồn dữ liệu CMC trước khi hiển thị nội dung"],
  profile: ["Hồ sơ sinh viên", "Thông tin cá nhân và nguồn đồng bộ"]
};

const workspaceTabOrder = [...navGroups.flatMap(group => group.items.map(item => item.id)), "profile"];

function icon(id, className = "") {
  return `<svg class="${className}" aria-hidden="true"><use href="#${id}"></use></svg>`;
}

function getNavItem(view) {
  return navGroups.flatMap(group => group.items).find(item => item.id === view)
    || (view === "sync" ? { id: "sync", label: "Đồng bộ", icon: "i-refresh" } : null)
    || (view === "profile" ? { id: "profile", label: "Hồ sơ", icon: "i-user" } : null);
}

function normalizeWorkspaceTabs() {
  const validViews = new Set(Object.keys(viewMeta));
  const tabs = Array.isArray(state.openTabs)
    ? state.openTabs.filter((view, index, array) => validViews.has(view) && array.indexOf(view) === index)
    : [];
  if (!tabs.includes(state.view) && validViews.has(state.view)) tabs.push(state.view);
  state.openTabs = tabs.length ? tabs : ["dashboard"];
}

function persistWorkspaceTabs() {
  try {
    localStorage.setItem("unistudy-open-tabs", JSON.stringify(state.openTabs));
  } catch (_) {
    // Bản demo vẫn giữ tab trong bộ nhớ nếu trình duyệt chặn localStorage.
  }
}

function openWorkspaceTab(view) {
  if (!viewMeta[view]) return;
  normalizeWorkspaceTabs();
  if (!state.openTabs.includes(view)) state.openTabs.push(view);
  state.view = view;
  state.mobileOpen = false;
  state.progressPanelOpen = false;
  state.studySchedulerOpen = false;
  state.examPlanOpen = false;
  state.tabMenuOpen = false;
  persistWorkspaceTabs();
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function switchCurrentWorkspaceView(view) {
  if (!viewMeta[view]) return;
  normalizeWorkspaceTabs();
  const currentIndex = state.openTabs.indexOf(state.view);
  const existingIndex = state.openTabs.indexOf(view);
  if (currentIndex === -1) {
    if (existingIndex === -1) state.openTabs.push(view);
  } else if (existingIndex !== -1 && existingIndex !== currentIndex) {
    state.openTabs[currentIndex] = view;
    state.openTabs.splice(existingIndex, 1);
  } else {
    state.openTabs[currentIndex] = view;
  }
  state.view = view;
  state.mobileOpen = false;
  state.progressPanelOpen = false;
  state.studySchedulerOpen = false;
  state.examPlanOpen = false;
  state.tabMenuOpen = false;
  normalizeWorkspaceTabs();
  persistWorkspaceTabs();
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function closeWorkspaceTab(view) {
  normalizeWorkspaceTabs();
  if (state.openTabs.length <= 1) {
    showToast("Cần giữ lại ít nhất một tab đang mở.");
    return;
  }
  const closingIndex = state.openTabs.indexOf(view);
  if (closingIndex === -1) return;
  state.openTabs = state.openTabs.filter(tab => tab !== view);
  if (state.view === view) state.view = state.openTabs[Math.max(0, closingIndex - 1)] || state.openTabs[0] || "dashboard";
  state.tabMenuOpen = false;
  persistWorkspaceTabs();
  render();
}

function openNextWorkspaceTab() {
  normalizeWorkspaceTabs();
  const unopened = workspaceTabOrder.find(view => !state.openTabs.includes(view));
  const fallbackIndex = Math.max(0, workspaceTabOrder.indexOf(state.view));
  openWorkspaceTab(unopened || workspaceTabOrder[(fallbackIndex + 1) % workspaceTabOrder.length] || "dashboard");
}

function renderWorkspaceTabs() {
  normalizeWorkspaceTabs();
  return `
    <section class="workspace-tabs" aria-label="Các trang đang mở">
      <div class="workspace-tab-scroll">
        ${state.openTabs.map(view => {
          const meta = getNavItem(view);
          const label = viewMeta[view]?.[0] || meta?.label || view;
          return `<button class="workspace-tab ${state.view === view ? "active" : ""}" type="button" data-workspace-tab="${view}" title="${escapeHTML(label)}">
            ${icon(meta?.icon || "i-grid")}<span>${label}</span>
            <em class="workspace-tab-close" role="button" tabindex="-1" data-close-tab="${view}" aria-label="Đóng tab ${escapeHTML(label)}">${icon("i-close")}</em>
          </button>`;
        }).join("")}
      </div>
      <div class="workspace-tab-add-wrap">
        <button class="workspace-tab-add" type="button" data-open-tab-picker aria-expanded="${state.tabMenuOpen}" aria-label="Mở tab mới">${icon("i-plus")}</button>
      </div>
    </section>`;
}

function renderTabPickerOverlay() {
  return `<div class="tab-picker-backdrop" data-close-tab-picker aria-hidden="true"></div>
    <section class="tab-picker-panel" role="dialog" aria-modal="true" aria-labelledby="tabPickerTitle">
      <header>
        <div><span class="eyebrow">Mở tab mới</span><h2 id="tabPickerTitle">Bạn muốn vào chức năng nào?</h2></div>
        <button class="icon-button" type="button" data-close-tab-picker aria-label="Đóng chọn chức năng">${icon("i-close")}</button>
      </header>
      <div class="tab-picker-grid">
        ${navGroups.map(group => `
          <article class="tab-picker-group">
            <h3>${group.title}</h3>
            <div>
              ${group.items.map(item => `
                <button type="button" data-open-tab="${item.id}" class="${state.openTabs.includes(item.id) ? "opened" : ""}">
                  <span>${icon(item.icon)}</span>
                  <strong>${item.label}</strong>
                  <small>${viewMeta[item.id]?.[1] || "Mở chức năng"}</small>
                </button>`).join("")}
            </div>
          </article>`).join("")}
      </div>
    </section>`;
}


function brandMarkup(compact = false) {
  return `<div class="brand ${compact ? "compact" : ""}" aria-label="UniStudy CMC University">
    <span class="brand-mark">${icon("i-cap")}</span>
    <span class="brand-copy">UniStudy<small>CMC University</small></span>
  </div>`;
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
}

function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => { toast.hidden = true; }, 2800);
}

function getMiniChatReply(message) {
  const text = message.toLowerCase();
  if (text.includes("deadline") || text.includes("hạn") || text.includes("nộp")) {
    return "Deadline gần nhất là bài lớn Cơ sở dữ liệu, còn 2 ngày. Mình gợi ý ưu tiên hoàn thiện checklist truy vấn và kiểm thử trước tối nay.";
  }
  if (text.includes("lịch") || text.includes("học") || text.includes("trống")) {
    return "Hôm nay bạn có Lập trình Web lúc 08:00 và còn trống 14:00–17:30. Có thể xếp một phiên tự học 50 phút cho Cấu trúc dữ liệu.";
  }
  if (text.includes("quiz") || text.includes("flashcard") || text.includes("ôn")) {
    return "Bạn nên ôn Stack & Queue bằng 10 câu quiz mức trung bình, sau đó dùng bộ flashcard JavaScript nền tảng để nhắc lại kiến thức dễ quên.";
  }
  return "Mình đã ghi nhận. Ở bản demo, mình có thể tư vấn nhanh ngay tại đây; khi đồng bộ dữ liệu thật, câu trả lời sẽ dựa trên lịch học, deadline và tiến độ cá nhân của bạn.";
}

function submitMiniChatMessage(message) {
  const content = String(message || "").trim();
  if (!content) return;
  if (!state.isLoggedIn) {
    showSyncPrompt();
    return;
  }
  state.miniChatOpen = true;
  state.miniChatMessages.push({ role: "user", text: content });
  state.miniChatMessages.push({ role: "assistant", text: getMiniChatReply(content) });
  render();
  requestAnimationFrame(() => {
    const messages = document.querySelector("#miniChatMessages");
    if (messages) messages.scrollTop = messages.scrollHeight;
    document.querySelector("#miniChatForm input")?.focus();
  });
}

function openModal(element) {
  element.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeModal(element) {
  element.hidden = true;
  document.body.style.overflow = "";
}

function showSyncPrompt() {
  openModal(authModal);
}

function openSyncSetup() {
  state.screen = "app";
  state.view = "sync";
  state.progressPanelOpen = false;
  state.studySchedulerOpen = false;
  state.examPlanOpen = false;
  state.tabMenuOpen = false;
  closeModal(authModal);
  normalizeWorkspaceTabs();
  if (!state.openTabs.includes("sync")) state.openTabs.push("sync");
  persistWorkspaceTabs();
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function completeDataSync() {
  localStorage.setItem(DATA_SYNC_STORAGE_KEY, "true");
  localStorage.removeItem(LEGACY_DATA_SYNC_STORAGE_KEY);
  localStorage.removeItem(LEGACY_LOGIN_STORAGE_KEY);
  localStorage.removeItem("unistudy-demo-login");
  state.isLoggedIn = true;
  state.screen = "app";
  state.view = "dashboard";
  state.openTabs = state.openTabs.filter(view => view !== "sync");
  if (!state.openTabs.includes("dashboard")) state.openTabs.unshift("dashboard");
  closeModal(authModal);
  persistWorkspaceTabs();
  render();
  showToast("Đồng bộ dữ liệu CMC thành công. Dữ liệu học tập đã được hiển thị.");
}

function resetDataSyncPreview() {
  localStorage.removeItem(DATA_SYNC_STORAGE_KEY);
  localStorage.removeItem(LEGACY_DATA_SYNC_STORAGE_KEY);
  localStorage.removeItem(LEGACY_LOGIN_STORAGE_KEY);
  localStorage.removeItem("unistudy-demo-login");
  state.isLoggedIn = false;
  state.progressPanelOpen = false;
  state.studySchedulerOpen = false;
  state.examPlanOpen = false;
  state.miniChatOpen = false;
}

function formatTaskDue(value) {
  if (!value) return "Mới thêm";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.toLocaleDateString("vi-VN")} · ${date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`;
}

function openTaskEditor(task = null) {
  const form = document.querySelector("#taskForm");
  if (!form) return;
  state.editingTaskId = task?.id || null;
  form.reset();
  form.elements.title.value = task?.title || "";
  form.elements.subject.value = task?.subject || "Cấu trúc DL&GT";
  form.elements.due.value = task?.dueInput || "";
  form.elements.priority.value = task?.priority || "Trung bình";
  form.elements.status.value = task?.done ? "Hoàn thành" : task?.status || "Chưa làm";
  document.querySelector("#taskModalEyebrow").textContent = task ? "Chỉnh sửa công việc" : "Công việc mới";
  document.querySelector("#taskModalTitle").textContent = task ? "Cập nhật công việc học tập" : "Thêm công việc học tập";
  document.querySelector("#taskSubmitButton").textContent = task ? "Lưu thay đổi" : "Lưu công việc";
  openModal(taskModal);
  requestAnimationFrame(() => form.elements.title.focus());
}

function render() {
  if (state.screen === "landing") app.innerHTML = renderLanding();
  if (state.screen === "app") app.innerHTML = renderAppShell();
  document.title = state.screen === "app"
    ? `${viewMeta[state.view]?.[0] || "UniStudy"} · UniStudy CMC`
    : "UniStudy CMC · Trợ lý học tập";
  if (state.screen === "app" && state.view === "pomodoro") updateTimerDisplay();
}

function renderLanding() {
  return `
    <main class="landing">
      <header class="landing-top">
        ${brandMarkup()}
      </header>

      <div class="landing-main">
        <section class="landing-copy">
          <span class="landing-kicker">${icon("i-cap")} Nền tảng đồng hành cùng sinh viên <b>CMC University</b></span>
          <h1>Học thông minh hơn<br><span>cùng UniStudy</span></h1>
          <p>Một không gian duy nhất để quản lý lịch học, deadline, tài liệu và được hỗ trợ bởi Trợ lý AI — giúp bạn học tập hiệu quả và chủ động hơn mỗi ngày.</p>
          <div class="landing-actions">
            <button class="button primary" type="button" data-start-preview>Trải nghiệm bản xem trước ${icon("i-arrow")}</button>
            <a class="button ghost" href="https://www.youtube.com/watch?v=lKpISrhA1z4" target="_blank" rel="noopener noreferrer">${icon("i-play")} Xem cách hoạt động</a>
          </div>
        </section>

        <a class="product-preview video-preview-link" href="https://www.youtube.com/watch?v=lKpISrhA1z4" target="_blank" rel="noopener noreferrer" aria-label="Mở video giới thiệu UniStudy trên YouTube">
          <div class="preview-window">
            <div class="preview-browser">
              <div class="preview-body">
                <aside class="preview-mini-sidebar">
                  <div class="preview-mini-logo">${icon("i-cap")}</div>
                  <div class="preview-mini-nav"><span class="active"></span><span></span><span></span><span></span><span></span><span></span></div>
                </aside>
                <div class="preview-content">
                  <div class="preview-heading"><span class="preview-search"></span><b>Nguyễn Minh Anh</b></div>
                  <div class="preview-dashboard-title"><b>Trung tâm thông báo</b><span>Cập nhật nhanh những gì quan trọng trong tuần</span></div>
                  <div class="preview-notice-list">
                    <div><i class="violet"></i><span><b>Thay đổi phòng học</b><small>Lập trình Web · 10:24</small></span><em>Xem chi tiết</em></div>
                    <div><i class="red"></i><span><b>Deadline trong 3 giờ</b><small>Cơ sở dữ liệu · 09:15</small></span><em>Sắp hết hạn</em></div>
                    <div><i class="blue"></i><span><b>Giảng viên đăng tài liệu mới</b><small>Slide chương 4 · 08:42</small></span><em>Xem tài liệu</em></div>
                    <div><i class="green"></i><span><b>Lịch thi giữa kỳ được cập nhật</b><small>Cấu trúc dữ liệu · Hôm qua</small></span><em>Xem lịch</em></div>
                  </div>
                  <div class="preview-settings"><b>Cài đặt nhắc nhở</b><span></span><span></span><span></span></div>
                  <img class="landing-mascot" src="assets/fox-wave.png" alt="Cáo UniStudy vẫy tay" />
                  <span class="video-preview-badge">${icon("i-play")} Xem video giới thiệu</span>
                  </div>
                </div>
              </div>
            </div>
        </a>
      </div>

      <section class="landing-feature-strip">
        <button type="button" data-preview-view="schedule"><span class="feature-strip-icon green">${icon("i-calendar")}</span><span><b>Thời khóa biểu thông minh</b><small>Tự động cập nhật và nhắc nhở lịch học từ CMC University.</small></span>${icon("i-arrow")}</button>
        <button type="button" data-preview-view="tasks"><span class="feature-strip-icon red">${icon("i-tasks")}</span><span><b>Quản lý Deadline</b><small>Không bỏ lỡ hạn nộp nhờ hệ thống nhắc nhở thông minh.</small></span>${icon("i-arrow")}</button>
        <button type="button" data-preview-view="ai"><span class="feature-strip-icon violet">${icon("i-spark")}</span><span><b>Trợ lý AI</b><small>Hỗ trợ tóm tắt, giải đáp và gợi ý học tập cá nhân hóa.</small></span>${icon("i-arrow")}</button>
        <button type="button" data-preview-view="quiz"><span class="feature-strip-icon blue">${icon("i-quiz")}</span><span><b>Quiz & Flashcard</b><small>Ôn tập hiệu quả với câu hỏi và thẻ ghi nhớ do AI tạo.</small></span>${icon("i-arrow")}</button>
      </section>
      <div class="landing-preview-note"><span></span>Bản xem trước — Đồng bộ dữ liệu để hiển thị nội dung<span></span></div>
    </main>`;
}

function renderLogin() {
  return `
    <main class="login-page">
      <section class="login-visual">
        ${brandMarkup()}
        <div class="login-visual-copy">
          <h1>Chào mừng bạn trở lại</h1>
          <p>Tiếp tục hành trình học tập và khám phá những cơ hội mới tại CMC University.</p>
        </div>
        <img class="login-fox" src="assets/fox-study.png" alt="Cáo UniStudy đang học bài" />
      </section>

      <section class="login-panel">
        <button class="login-back" type="button" data-back-landing>← Quay lại trang giới thiệu</button>
        <div class="login-card">
          <h2>Đăng nhập UniStudy</h2>
          <p>Dành cho sinh viên CMC University</p>
          <button class="microsoft-login" type="button" data-student-sso>
            <span class="microsoft-mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
            <span>Đăng nhập với Microsoft</span>
          </button>
          <div class="student-login-divider">
            <span></span>
            <p>Hoặc đăng nhập với tài khoản <strong>CMCU</strong></p>
            <span></span>
          </div>
          <div class="student-account-note">${icon("i-spark")} <span>Sử dụng email sinh viên CMCU để đồng bộ lịch học, deadline và thông báo từ trường.</span></div>
          <form class="stack-form" id="loginForm" novalidate>
            <label>Email hoặc tài khoản
              <input name="account" autocomplete="username" placeholder="ma-sinh-vien@cmc-u.edu.vn" />
            </label>
            <label>Mật khẩu
              <input name="password" type="password" autocomplete="current-password" placeholder="Nhập mật khẩu" />
            </label>
            <div class="login-options">
              <label class="check-label"><input type="checkbox" name="remember" checked /> Ghi nhớ đăng nhập</label>
              <button class="text-link" type="button" data-forgot-password>Quên mật khẩu?</button>
            </div>
            <p class="form-error" id="loginError" role="alert"></p>
            <button class="button primary full" type="submit">Đăng nhập</button>
          </form>
          <div class="demo-note">${icon("i-spark")} <span>Đây là bản mô phỏng. Bạn có thể nhập email bất kỳ và mật khẩu từ 4 ký tự để trải nghiệm.</span></div>
        </div>
      </section>
    </main>`;
}

function renderAppShell() {
  const [title] = viewMeta[state.view] || ["UniStudy"];
  return `
    <div class="app-shell">
      <aside class="sidebar ${state.mobileOpen ? "open" : ""}" id="sidebar">
        ${brandMarkup(true)}
        <nav class="nav-groups" aria-label="Điều hướng chính">
          ${navGroups.map(group => `
            <section>
              <div class="nav-group-title">${group.title}</div>
              <div class="nav-list">
                ${group.items.map(item => `
                  <button class="nav-item ${state.view === item.id ? "active" : ""}" type="button" data-sidebar-view="${item.id}">
                    ${icon(item.icon)}<span>${item.label}</span>${item.badge ? `<span class="nav-badge">${item.badge}</span>` : ""}
                  </button>`).join("")}
              </div>
            </section>`).join("")}
        </nav>
        ${renderSidebarAccount()}
      </aside>

      <header class="topbar">
        <button class="icon-button mobile-menu" type="button" data-toggle-menu aria-label="Mở menu">${icon("i-menu")}</button>
        <label class="global-search">
          ${icon("i-search")}
          <input id="globalSearch" aria-label="Tìm kiếm toàn hệ thống" placeholder="Tìm lịch học, tài liệu, công việc..." />
          <span class="search-shortcut">Ctrl K</span>
        </label>
        <div class="topbar-actions">
          <button class="progress-toggle" type="button" data-toggle-progress aria-expanded="${state.progressPanelOpen}" aria-label="Xem tiến độ học tập">${icon("i-chart")}<span>Tiến độ</span></button>
          <button class="icon-button notification-button" type="button" data-view="notifications" aria-label="Thông báo">${icon("i-bell")}<span>${state.isLoggedIn ? "3" : "0"}</span></button>
        </div>
      </header>

      ${renderWorkspaceTabs()}

      <main class="main-content">
        <div class="content-wrap">${renderCurrentView()}</div>
      </main>

      ${state.tabMenuOpen ? renderTabPickerOverlay() : ""}
      ${state.isLoggedIn && state.progressPanelOpen ? renderProgressRail() : ""}
      ${state.isLoggedIn && state.studySchedulerOpen ? renderStudySchedulerModal() : ""}
      ${state.isLoggedIn && state.examPlanOpen ? renderExamPlanModal() : ""}
      ${renderMiniChatBot()}
    </div>`;
}

function renderSidebarAccount() {
  if (!state.isLoggedIn) {
    return `<div class="sidebar-user">
      <button class="sidebar-user-card sidebar-login-card" type="button" data-open-sync-page>
        <img src="assets/fox-login-lock.png" alt="Đồng bộ dữ liệu CMC" />
        <span><strong>Đồng bộ dữ liệu</strong><small>CMC University</small></span>
        ${icon("i-chevron")}
      </button>
    </div>`;
  }
  return `<div class="sidebar-user">
    <button class="sidebar-user-card" type="button" data-sidebar-view="profile">
      <img src="assets/fox-student-avatar.png" alt="Ảnh đại diện cáo sinh viên" />
      <span><strong>Nguyễn Minh Anh</strong><small>Sinh viên</small></span>
      ${icon("i-chevron")}
    </button>
  </div>`;
}

function renderMiniChatBot() {
  if (!state.isLoggedIn) {
    return `<button class="mini-chatbot" type="button" data-open-sync aria-label="Đồng bộ dữ liệu để mở thanh tư vấn nhanh">
      <span class="mini-chatbot-avatar"><img src="assets/fox-login-lock.png" alt="" /></span>
      <span><strong>Tư vấn nhanh</strong><small>Đồng bộ để hỏi AI</small></span>
      ${icon("i-send")}
    </button>`;
  }
  if (!state.miniChatOpen) {
    return `<button class="mini-chatbot" type="button" data-toggle-mini-chat aria-label="Mở thanh tư vấn nhanh">
      <span class="mini-chatbot-avatar"><img src="assets/fox-ai-tutor.png" alt="" /></span>
      <span><strong>Tư vấn nhanh</strong><small>Hỏi lịch học, deadline, ôn tập</small></span>
      ${icon("i-send")}
    </button>`;
  }

  return `<section class="mini-chat-panel" aria-label="Thanh tư vấn nhanh UniStudy">
    <header>
      <span class="mini-chatbot-avatar"><img src="assets/fox-ai-tutor.png" alt="" /></span>
      <div><strong>Tư vấn nhanh</strong><small>Không rời khỏi trang hiện tại</small></div>
      <button class="icon-button mini-chat-close" type="button" data-toggle-mini-chat aria-label="Thu gọn thanh tư vấn">${icon("i-close")}</button>
    </header>
    <div class="mini-chat-messages" id="miniChatMessages">
      ${state.miniChatMessages.map(message => `
        <article class="mini-chat-message ${message.role === "user" ? "user" : "assistant"}">
          <span class="mini-chat-avatar">${message.role === "user" ? `<img src="assets/fox-student-avatar.png" alt="" />` : `<img src="assets/fox-ai-tutor.png" alt="" />`}</span>
          <p>${escapeHTML(message.text)}</p>
        </article>`).join("")}
    </div>
    <div class="mini-chat-suggestions" aria-label="Gợi ý câu hỏi nhanh">
      <button type="button" data-mini-chat-prompt="Hôm nay mình nên học gì trước?">Học gì trước?</button>
      <button type="button" data-mini-chat-prompt="Deadline gần nhất của mình là gì?">Deadline gần nhất</button>
    </div>
    <form class="mini-chat-form" id="miniChatForm">
      <input name="message" autocomplete="off" placeholder="Nhập câu hỏi nhanh..." aria-label="Nhập câu hỏi tư vấn nhanh" />
      <button type="submit" aria-label="Gửi câu hỏi">${icon("i-send")}</button>
    </form>
  </section>`;
}

function renderProgressRail() {
  return `
    <div class="progress-drawer-backdrop" data-close-progress aria-hidden="true"></div>
    <aside class="progress-rail progress-drawer" aria-label="Tiến độ học tập nhanh">
      <div class="rail-titlebar"><h3>${icon("i-chart")} Tiến độ học tập</h3><button class="icon-button drawer-close" type="button" data-close-progress aria-label="Đóng bảng tiến độ">${icon("i-close")}</button></div>
      <div class="progress-term">Học kỳ hiện tại ${icon("i-chevron")}</div>
      <p class="rail-section-label">Tiến độ các môn học</p>
      <div class="rail-subject-list">
        ${railSubject("i-quiz", "Lập trình Web", 75, "violet")}
        ${railSubject("i-folder", "Cơ sở dữ liệu", 60, "green")}
        ${railSubject("i-spark", "Cấu trúc dữ liệu và giải thuật", 35, "blue")}
      </div>
      <button class="rail-all-button" type="button" data-view="progress">Xem tất cả môn học ${icon("i-arrow")}</button>
      ${state.view === "study-plan" ? `<article class="rail-ai-card"><h3>${icon("i-spark")} Kế hoạch AI đề xuất</h3><p>Dựa trên lịch học, tiến độ hiện tại và thói quen của bạn.</p><div class="rail-ai-tags"><span>Deadline gần</span><span>Môn cần cải thiện</span><span>Khung giờ hiệu quả</span></div><ul><li><b>Lập trình Web</b><span>Thứ 3 · 13:00–14:30</span></li><li><b>Cơ sở dữ liệu</b><span>Thứ 4 · 19:00–20:30</span></li><li><b>Cấu trúc dữ liệu</b><span>Thứ 6 · 19:00–21:00</span></li></ul><div><button class="button primary" type="button" data-apply-plan>Áp dụng kế hoạch</button><button class="button ghost" type="button" data-regenerate-plan>Chỉnh sửa</button></div></article>` : ""}
      <article class="rail-summary-card"><span>${icon("i-clock")} Tổng thời gian học tập</span><div><b>128 giờ</b><em>↗ +12%<small>so với kỳ trước</small></em></div></article>
      <article class="rail-streak-card"><span>${icon("i-spark")} Chuỗi ngày học tập liên tục</span><div><b>12 ngày</b><em>🔥 Giữ vững<br>phong độ!</em></div></article>
    </aside>`;
}

function railSubject(iconId, name, value, color) {
  return `<article class="rail-subject-card"><span class="rail-subject-icon ${color}">${icon(iconId)}</span><div><strong>${name}</strong><span><i style="width:${value}%"></i></span></div><b>${value}%</b></article>`;
}

function subjectProgressRow(name, value) {
  return `<div class="subject-progress-row"><strong>${name}</strong><span>${value}%</span><div class="progress-track"><i style="width:${value}%"></i></div></div>`;
}

function pageHead(title, description, actions = "") {
  return `<header class="page-head"><div><span class="eyebrow">UniStudy CMC</span><h1>${title}</h1><p>${description}</p></div>${actions ? `<div class="page-actions">${actions}</div>` : ""}</header>`;
}

const guestPreviewContent = {
  dashboard: ["Lịch học hôm nay", "Deadline gần nhất", "Công việc cần ưu tiên", "Kết quả Quiz", "Pomodoro", "Thông báo mới"],
  schedule: ["Lịch ngày", "Lịch tuần", "Lịch trên trường", "Lịch tự học", "Cảnh báo trùng", "Sắp xếp thời gian tự học"],
  tasks: ["Danh sách công việc", "Danh sách deadline", "Checklist", "Mức độ ưu tiên", "Thời gian còn lại", "Thêm công việc"],
  documents: ["Kho tài liệu môn học", "Tìm kiếm tài liệu", "Lọc theo môn", "Lọc theo loại", "Tag tài liệu", "Mở tài liệu"],
  ai: ["Khung chat", "Lịch sử hội thoại", "Tóm tắt tài liệu", "Giải thích nội dung", "Phân tích điểm yếu", "Gợi ý học tập"],
  "study-plan": ["Kế hoạch học tập", "Kế hoạch AI đề xuất", "Lịch học theo kế hoạch", "Tiến độ ôn tập"],
  "exam-plan": ["Kỳ thi sắp tới", "Đồng bộ lịch thi", "Lộ trình ôn thi", "Lên kế hoạch học"],
  quiz: ["Tải tài liệu", "Chọn số câu", "Chọn mức độ khó", "Làm quiz", "Kết quả quiz", "Lịch sử quiz"],
  flashcards: ["Bộ thẻ", "Thêm từng thẻ", "Thẻ thử nghiệm", "Ôn tập flashcard", "Nội dung cần ôn lại"],
  progress: ["Tiến độ theo ngày", "Tiến độ theo tuần", "Tiến độ theo tháng", "Tiến độ theo năm", "Thói quen học tập"],
  pomodoro: ["Bộ đếm giờ", "Chỉnh thời gian học", "Chỉnh thời gian nghỉ", "Bắt đầu", "Tạm dừng", "Lịch sử phiên học"],
  notifications: ["Tất cả", "Chưa đọc", "Đã đọc", "Nội dung thông báo", "Thời gian thông báo"],
  profile: ["Hồ sơ sinh viên", "Ngành học", "Đồng bộ hệ thống CMC", "Đăng xuất"]
};

function renderGuestPreview() {
  const [title, description] = viewMeta[state.view] || viewMeta.dashboard;
  const items = guestPreviewContent[state.view] || guestPreviewContent.dashboard;
  return `${pageHead(title, `${description}. Dữ liệu sẽ chỉ hiển thị sau khi bạn đồng bộ hệ thống CMC.`)}
    <section class="guest-preview-shell">
      <article class="card guest-lock-hero">
        <img src="assets/fox-login-lock.png" alt="Cáo UniStudy chờ đồng bộ dữ liệu" />
        <div>
          <span class="eyebrow">Chưa đồng bộ dữ liệu</span>
          <h2>Chưa có dữ liệu học tập để hiển thị</h2>
          <p>Hiện tại màn hình chỉ cho xem cấu trúc chức năng. Khi bấm đồng bộ, UniStudy sẽ tải dữ liệu mẫu từ các hệ thống CMC để bạn trải nghiệm.</p>
          <button class="button primary" type="button" data-open-sync-page>${icon("i-refresh")} Đồng bộ dữ liệu</button>
        </div>
      </article>
      <div class="guest-empty-grid">
        ${items.map((item, index) => `
          <button class="card guest-empty-card" type="button" data-open-sync-page>
            <span>${icon(index % 3 === 0 ? "i-lock" : index % 3 === 1 ? "i-spark" : "i-clock")}</span>
            <strong>${item}</strong>
            <small>Chưa có dữ liệu</small>
          </button>`).join("")}
      </div>
    </section>`;
}

function renderSyncSetup() {
  return `${pageHead("Đồng bộ dữ liệu CMC", "Chọn những nguồn dữ liệu muốn lấy về. UniStudy đang mặc định chọn toàn bộ hệ thống để bạn có thể trải nghiệm đầy đủ.", `<button class="button ghost" type="button" data-view="dashboard">Xem app rỗng</button>`)}
    <section class="sync-setup-layout">
      <article class="card sync-setup-card">
        <div class="sync-title">
          <span class="sync-school-icon">${icon("i-refresh")}</span>
          <div>
            <h2>Chọn nguồn dữ liệu cần đồng bộ</h2>
            <p>Mặc định hệ thống sẽ đồng bộ tất cả các nguồn CMC. Bạn có thể bỏ chọn nguồn không cần dùng trong bản demo.</p>
          </div>
        </div>
        <div class="sync-options sync-setup-options">
          <label class="sync-option sync-all-option"><input type="checkbox" id="syncAll" checked /> Đồng bộ tất cả</label>
          <label class="sync-option"><input class="sync-source" type="checkbox" checked /> iu.cmcu.edu.vn <small>Lịch học, lịch thi, phòng học</small></label>
          <label class="sync-option"><input class="sync-source" type="checkbox" checked /> edux.cmcu.edu.vn <small>Thông tin môn học, tiến độ</small></label>
          <label class="sync-option"><input class="sync-source" type="checkbox" checked /> lms.cmcu.edu.vn <small>Tài liệu, bài tập, deadline</small></label>
          <label class="sync-option"><input class="sync-source" type="checkbox" checked /> elearning.cmcu.edu.vn <small>Quiz, khóa học và thông báo</small></label>
        </div>
        <footer class="sync-setup-actions">
          <button class="button ghost" type="button" data-view="dashboard">Để sau</button>
          <button class="button primary" type="button" data-confirm-sync>${icon("i-refresh")} Xác nhận đồng bộ</button>
        </footer>
      </article>
      <aside class="card sync-student-empty">
        <img src="assets/fox-login-lock.png" alt="Cáo UniStudy chờ dữ liệu sinh viên" />
        <span class="eyebrow">Thông tin sinh viên</span>
        <h2>Chưa có dữ liệu</h2>
        <div class="sync-empty-fields">
          ${infoField("Họ tên", "—")}
          ${infoField("Mã sinh viên", "—")}
          ${infoField("Email CMC", "—")}
          ${infoField("Ngành học", "—")}
          ${infoField("Khóa", "—")}
          ${infoField("Học kỳ hiện tại", "—")}
        </div>
        <p>Phần thông tin này sẽ được điền sau khi bạn xác nhận đồng bộ dữ liệu.</p>
      </aside>
    </section>`;
}

function renderCurrentView() {
  if (state.view === "sync") return renderSyncSetup();
  if (!state.isLoggedIn) return renderGuestPreview();
  switch (state.view) {
    case "dashboard": return renderDashboard();
    case "schedule": return renderSchedule();
    case "tasks": return renderTasks();
    case "documents": return renderDocuments();
    case "ai": return renderAI();
    case "study-plan": return renderStudyPlan();
    case "exam-plan": return renderExamPlan();
    case "quiz": return renderQuiz();
    case "flashcards": return renderFlashcards();
    case "progress": return renderProgress();
    case "pomodoro": return renderPomodoro();
    case "notifications": return renderNotifications();
    case "profile": return renderProfile();
    default: return renderDashboard();
  }
}

function renderDashboard() {
  return `
    <section class="card dash-greeting">
      <img src="assets/fox-wave.png" alt="Cáo UniStudy chào buổi sáng" />
      <div><h1>Chào buổi sáng, Minh Anh 👋</h1><p>Hôm nay là thứ 5, 02 tháng 10, 2026. Cùng bắt đầu một ngày học tập thật hiệu quả nhé!</p></div>
    </section>
    <section class="dashboard-main-grid">
      <article class="card dash-panel">
        <div class="card-head"><h2>${icon("i-calendar")} Lịch học hôm nay</h2><button class="card-link" data-view="schedule">Xem lịch học ›</button></div>
        <div class="dash-class-list">
          ${dashClass("08:00", "09:30", "Lập trình Web", "Giảng viên: TS. Trần Minh Quân", "P.401", "green")}
          ${dashClass("13:00", "14:30", "Cấu trúc dữ liệu và giải thuật", "Giảng viên: TS. Nguyễn Thị Lan", "P.509", "blue")}
        </div>
      </article>
      <article class="card dash-panel">
        <div class="card-head"><h2>${icon("i-tasks")} Deadline gần nhất</h2><button class="card-link" data-view="tasks">Xem tất cả ›</button></div>
        <div class="dash-deadline"><span class="dash-file-icon">${icon("i-folder")}</span><div><b>Nộp bài tập Cơ sở dữ liệu</b><span>Hạn nộp: Thứ 5, 19/09/2026</span></div><span class="status-pill red">Còn 2 ngày</span></div>
        <div class="countdown-row"><span><b>02</b><small>Ngày</small></span><span><b>12</b><small>Giờ</small></span><span><b>18</b><small>Phút</small></span><span><b>24</b><small>Giây</small></span></div>
      </article>
      <article class="card dash-panel">
        <div class="card-head"><h2>${icon("i-check")} Công việc cần ưu tiên</h2><button class="card-link" data-view="tasks">Xem tất cả ›</button></div>
        <div class="priority-list compact">
          ${priorityItem(1, "Nộp bài lớn Cơ sở dữ liệu", "Hạn trình bày vào qua LMS")}
          ${priorityItem(2, "Ôn tập giữa kỳ Lập trình Web", "Xem lại slide chương 1–4")}
          ${priorityItem(3, "Đọc tài liệu Cấu trúc dữ liệu", "Chương 3: Cây và đồ thị")}
        </div>
      </article>
      <article class="card dash-panel dash-study-time">
        <div class="card-head"><h2>${icon("i-chart")} Thời gian tự học</h2><span class="status-pill violet">7 ngày qua</span></div>
        <div class="study-time-copy"><span>Tổng thời gian tự học</span><b>18 giờ 30 phút</b><em>↗ +12% so với tuần trước</em></div>
        <div class="mini-bars">${[34,62,50,25,46,78,48].map((value, i) => `<i style="height:${value}%"><small>${["T2","T3","T4","T5","T6","T7","CN"][i]}</small></i>`).join("")}</div>
      </article>
    </section>
    <section class="dashboard-bottom-grid">
      <article class="card dash-mini-card"><div class="card-head"><h2>${icon("i-exam")} Kết quả Quiz</h2><button class="card-link" data-view="quiz">Xem chi tiết ›</button></div><div class="quiz-donut"><b>85%</b></div><div><span>Trung bình gần đây</span><b>8.5 / 10</b><small>↗ +0.5 so với lần trước</small></div></article>
      <article class="card dash-mini-list"><div class="card-head"><h2>${icon("i-bell")} Thông báo mới</h2><button class="card-link" data-view="notifications">Xem tất cả ›</button></div>${noticeItem("i-calendar", "Lịch thi giữa kỳ đã được cập nhật", "2 giờ trước")}${noticeItem("i-folder", "Có tài liệu mới môn Lập trình Web", "5 giờ trước")}</article>
      <article class="card dash-pomo"><div class="card-head"><h2>${icon("i-clock")} Pomodoro</h2></div><div><span class="mini-timer">25:00</span><p>Tập trung học tập</p></div><button class="button primary" type="button" data-view="pomodoro">${icon("i-play")} Bắt đầu</button></article>
    </section>`;
}

function statCard(iconId, value, label, color) {
  return `<article class="card stat-card"><span class="stat-icon ${color}">${icon(iconId)}</span><span class="stat-copy"><b>${value}</b><span>${label}</span></span></article>`;
}
function dashClass(start, end, title, detail, room, color) {
  return `<div class="dash-class"><span class="dash-class-icon ${color}">${icon("i-calendar")}</span><time><b>${start}</b><small>${end}</small></time><div><strong>${title}</strong><span>${detail}</span></div><em>${room}</em><button type="button" aria-label="Xem chi tiết">•••</button></div>`;
}
function timelineItem(start, end, title, detail, color) {
  return `<div class="timeline-item"><div class="timeline-time">${start}<br><span>${end}</span></div><div class="timeline-line ${color}"></div><div class="timeline-info"><strong>${title}</strong><span>${detail}</span></div></div>`;
}
function deadlineItem(day, month, title, detail) {
  return `<div class="deadline-item"><div class="deadline-date"><b>${day}</b><span>${month}</span></div><div class="item-copy"><strong>${title}</strong><span>${detail}</span></div>${icon("i-arrow")}</div>`;
}
function priorityItem(rank, title, detail) {
  return `<div class="priority-item"><span class="priority-rank">${rank}</span><span class="item-copy"><strong>${title}</strong><span>${detail}</span></span></div>`;
}
function noticeItem(iconId, title, detail) {
  return `<div class="notice-item"><span class="notice-icon">${icon(iconId)}</span><span class="item-copy"><strong>${title}</strong><span>${detail}</span></span></div>`;
}

const schoolScheduleTemplates = {
  1: [
    { key: "web-am", start: "08:00", end: "09:30", title: "Lập trình Web", code: "PROG2001", room: "P.401", lecturer: "ThS. Trần Minh Tuấn" },
    { key: "database-pm", start: "13:00", end: "14:30", title: "Cơ sở dữ liệu", code: "DBI202", room: "P.302", lecturer: "ThS. Lê Hoàng" }
  ],
  2: [
    { key: "data-structure-am", start: "10:00", end: "11:30", title: "Cấu trúc dữ liệu", code: "PROG2008", room: "P.305", lecturer: "ThS. Nguyễn Đức Long" },
    { key: "software-pm", start: "15:00", end: "16:30", title: "Kỹ thuật phần mềm", code: "SWE201", room: "P.404", lecturer: "ThS. Vũ Minh" }
  ],
  3: [
    { key: "calculus-am", start: "08:00", end: "09:30", title: "Giải tích 1", code: "MA101", room: "P.201", lecturer: "TS. Đỗ Thu" },
    { key: "english-pm", start: "13:00", end: "14:30", title: "Tiếng Anh học thuật", code: "ENG1003", room: "P.303", lecturer: "Cô Phạm Thu Hà" }
  ],
  4: [
    { key: "data-structure-thu", start: "09:00", end: "10:30", title: "Cấu trúc dữ liệu", code: "PROG2008", room: "P.305", lecturer: "ThS. Nguyễn Đức Long" },
    { key: "network-pm", start: "15:00", end: "16:30", title: "Mạng máy tính", code: "NET201", room: "P.403", lecturer: "ThS. Phạm Nam" }
  ],
  5: [
    { key: "probability-am", start: "08:00", end: "09:30", title: "Xác suất thống kê", code: "MA102", room: "P.202", lecturer: "TS. Nguyễn Lan" },
    { key: "database-fri", start: "13:00", end: "14:30", title: "Cơ sở dữ liệu", code: "DBI202", room: "P.302", lecturer: "ThS. Lê Hoàng" }
  ]
};

function parseScheduleDate(value) {
  const [year, month, day] = String(value).split("-").map(Number);
  return new Date(year, month - 1, day);
}

function scheduleDateISO(date) {
  const pad = value => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function addScheduleDays(date, amount) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function getWeekDates(value) {
  const date = parseScheduleDate(value);
  const mondayOffset = (date.getDay() + 6) % 7;
  const monday = addScheduleDays(date, -mondayOffset);
  return Array.from({ length: 7 }, (_, index) => scheduleDateISO(addScheduleDays(monday, index)));
}

function getSchoolEventsForDate(date, includeHidden = false) {
  const weekday = parseScheduleDate(date).getDay();
  return (schoolScheduleTemplates[weekday] || []).map(template => ({ ...template, date, id: `${date}:${template.key}` }))
    .filter(event => includeHidden || !state.hiddenSchoolEventIds.includes(event.id));
}

function timesOverlap(startA, endA, startB, endB) {
  return startA < endB && endA > startB;
}

function getSchoolConflicts(studyEvent) {
  return getSchoolEventsForDate(studyEvent.date).filter(schoolEvent => timesOverlap(studyEvent.start, studyEvent.end, schoolEvent.start, schoolEvent.end));
}

function getScheduleDateLabel() {
  const selected = parseScheduleDate(state.scheduleSelectedDate);
  if (state.scheduleMode === "month") return `Tháng ${selected.getMonth() + 1}, ${selected.getFullYear()}`;
  if (state.scheduleMode === "day") return selected.toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" });
  const week = getWeekDates(state.scheduleSelectedDate).map(parseScheduleDate);
  return `${week[0].toLocaleDateString("vi-VN")} – ${week[6].toLocaleDateString("vi-VN")}`;
}

function renderSchedule() {
  const actions = `<button class="button primary" type="button" data-open-study-scheduler>${icon("i-plus")} Sắp xếp thời gian tự học</button>`;
  const content = state.scheduleMode === "month" ? renderMonthSchedule() : state.scheduleMode === "day" ? renderDaySchedule() : renderWeekSchedule();
  return `${pageHead("Thời khóa biểu", "Theo dõi lịch trên trường, lịch tự học và chủ động xử lý lịch bị trùng.", actions)}
    <div class="schedule-toolbar">
      <div class="tabs" role="tablist">
        <button class="tab-button ${state.scheduleMode === "day" ? "active" : ""}" data-schedule-mode="day">Lịch ngày</button>
        <button class="tab-button ${state.scheduleMode === "week" ? "active" : ""}" data-schedule-mode="week">Lịch tuần</button>
        <button class="tab-button ${state.scheduleMode === "month" ? "active" : ""}" data-schedule-mode="month">Lịch tháng</button>
      </div>
      <div class="date-navigation"><button class="icon-button" type="button" data-schedule-nav="-1" aria-label="Khoảng thời gian trước">‹</button><span class="date-label">${getScheduleDateLabel()}</span><button class="icon-button" type="button" data-schedule-nav="1" aria-label="Khoảng thời gian sau">›</button><button class="button ghost schedule-today-button" type="button" data-schedule-today>Hôm nay</button></div>
    </div>
    ${content}`;
}

function renderScheduleConflictStatus(studyEvents) {
  const conflicts = studyEvents.map(studyEvent => ({ studyEvent, schoolEvents: getSchoolConflicts(studyEvent) })).filter(item => item.schoolEvents.length);
  if (!conflicts.length) return `<div class="no-conflict-banner">${icon("i-check")} Không có lịch học trên trường và lịch tự học bị trùng trong khoảng thời gian này.</div>`;
  return `<div class="schedule-conflict-list">${conflicts.map(({ studyEvent, schoolEvents }) => `<article class="conflict-banner schedule-conflict-item">${icon("i-clock")}<div><strong>Trùng lịch: ${escapeHTML(studyEvent.title)}</strong><p>Lịch tự học ${studyEvent.start}–${studyEvent.end} trùng với ${schoolEvents.map(event => `${escapeHTML(event.title)} (${event.start}–${event.end})`).join(", ")}. Chọn lịch bạn muốn giữ lại.</p></div><div class="conflict-actions"><button class="button secondary" type="button" data-resolve-conflict="study" data-study-event="${studyEvent.id}">Giữ lịch tự học</button><button class="button primary" type="button" data-resolve-conflict="school" data-study-event="${studyEvent.id}">Giữ lịch trên lớp</button></div></article>`).join("")}</div>`;
}

function renderWeekSchedule() {
  const dateColumns = getWeekDates(state.scheduleSelectedDate);
  const dayNames = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  const studyEvents = state.studyEvents.filter(event => dateColumns.includes(event.date));
  const schoolEvents = dateColumns.flatMap(getSchoolEventsForDate);
  const rows = new Map();
  const addEvent = (event, type) => {
    const dayIndex = dateColumns.indexOf(event.date);
    if (dayIndex < 0) return;
    if (!rows.has(event.start)) rows.set(event.start, Array.from({ length: 7 }, () => []));
    const conflict = type === "study" ? getSchoolConflicts(event).length > 0 : studyEvents.some(studyEvent => studyEvent.date === event.date && timesOverlap(studyEvent.start, studyEvent.end, event.start, event.end));
    const detail = type === "study" ? `${event.start}–${event.end} · ${event.subject}` : `${event.code} · ${event.start}–${event.end} · ${event.room}`;
    rows.get(event.start)[dayIndex].push(classBlock(event.title, detail, conflict ? "red" : type === "study" ? "self-study" : "school", type === "study" ? event.id : null));
  };
  schoolEvents.forEach(event => addEvent(event, "school"));
  studyEvents.forEach(event => addEvent(event, "study"));
  const sortedRows = [...rows.entries()].sort(([timeA], [timeB]) => timeA.localeCompare(timeB));
  return `
    ${renderScheduleConflictStatus(studyEvents)}
    <section class="week-calendar">
      <div class="week-grid">
        <div class="calendar-head"></div>
        ${dateColumns.map(date => { const parsed = parseScheduleDate(date); return `<div class="calendar-head"><b>${dayNames[parsed.getDay()]}</b><span>${parsed.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}</span></div>`; }).join("")}
        ${sortedRows.map(([time, cells]) => `<div class="calendar-cell time">${time}</div>${cells.map(blocks => `<div class="calendar-cell">${blocks.length > 1 ? `<div class="overlap-stack">${blocks.join("")}</div>` : blocks.join("")}</div>`).join("")}`).join("") || `<div class="calendar-empty-week">Chưa có lịch trong tuần này.</div>`}
      </div>
    </section>
    ${renderScheduleLegend()}`;
}

function classBlock(title, detail, color, removableId = null) {
  return `<div class="class-block ${color} ${removableId ? "has-delete" : ""}"><b>${escapeHTML(title)}</b><span>${escapeHTML(detail)}</span>${removableId ? `<button class="schedule-delete-button" type="button" data-delete-study-event="${removableId}" aria-label="Xóa lịch tự học ${escapeHTML(title)}" title="Xóa lịch tự học">${icon("i-trash")}</button>` : ""}</div>`;
}

function renderDaySchedule() {
  const date = state.scheduleSelectedDate;
  const studyEvents = state.studyEvents.filter(event => event.date === date);
  const schoolEvents = getSchoolEventsForDate(date);
  const items = [
    ...schoolEvents.map(event => ({ ...event, type: "school", conflict: studyEvents.some(studyEvent => timesOverlap(studyEvent.start, studyEvent.end, event.start, event.end)) })),
    ...studyEvents.map(event => ({ ...event, type: "study", conflict: getSchoolConflicts(event).length > 0 }))
  ].sort((a, b) => a.start.localeCompare(b.start));
  return `
    ${renderScheduleConflictStatus(studyEvents)}
    <section class="day-schedule">
      ${items.map(dayEvent).join("") || `<article class="card schedule-empty-state">${icon("i-calendar")}<strong>Ngày này chưa có lịch</strong><span>Bạn có thể thêm một buổi tự học vào khung giờ phù hợp.</span><button class="button primary" type="button" data-open-study-scheduler>${icon("i-plus")} Thêm lịch tự học</button></article>`}
    </section>
    ${renderScheduleLegend()}`;
}

function dayEvent(event) {
  const type = event.conflict ? "conflict" : event.type === "study" ? "self-study" : "school";
  const pill = type === "school" ? "orange" : type === "self-study" ? "green" : "red";
  const detail = event.type === "study" ? `${event.subject} · ${event.note || "Tự xếp"}` : `${event.code} · ${event.room} · ${event.lecturer}`;
  const status = event.conflict ? "Bị trùng" : event.type === "study" ? "Tự học" : "Lịch trên trường";
  return `<article class="card day-event ${type}"><div class="day-event-time"><b>${event.start}</b><span>${event.end}</span></div><div class="day-event-bar"></div><div class="day-event-content"><strong>${escapeHTML(event.title)}</strong><span>${escapeHTML(detail)}</span></div><span class="status-pill ${pill}">${status}</span>${event.type === "study" ? `<button class="icon-button day-event-delete" type="button" data-delete-study-event="${event.id}" aria-label="Xóa lịch tự học">${icon("i-trash")}</button>` : ""}</article>`;
}

function renderMonthSchedule() {
  const selected = parseScheduleDate(state.scheduleSelectedDate);
  const first = new Date(selected.getFullYear(), selected.getMonth(), 1);
  const gridStart = addScheduleDays(first, -((first.getDay() + 6) % 7));
  const dates = Array.from({ length: 42 }, (_, index) => scheduleDateISO(addScheduleDays(gridStart, index)));
  return `<section class="card month-calendar"><div class="month-weekdays">${["T2","T3","T4","T5","T6","T7","CN"].map(day => `<span>${day}</span>`).join("")}</div><div class="month-grid">${dates.map(date => {
    const parsed = parseScheduleDate(date);
    const schoolEvents = getSchoolEventsForDate(date);
    const studyEvents = state.studyEvents.filter(event => event.date === date);
    const eventChips = [
      ...schoolEvents.map(event => ({ label: event.title, kind: studyEvents.some(study => timesOverlap(study.start, study.end, event.start, event.end)) ? "conflict" : "school" })),
      ...studyEvents.map(event => ({ label: event.title, kind: getSchoolConflicts(event).length ? "conflict" : "self-study" }))
    ];
    return `<button class="month-day ${parsed.getMonth() !== selected.getMonth() ? "outside" : ""} ${date === state.scheduleSelectedDate ? "selected" : ""}" type="button" data-schedule-date="${date}"><b>${parsed.getDate()}</b><span class="month-day-events">${eventChips.slice(0, 3).map(item => `<i class="${item.kind}">${escapeHTML(item.label)}</i>`).join("")}${eventChips.length > 3 ? `<em>+${eventChips.length - 3} lịch khác</em>` : ""}</span></button>`;
  }).join("")}</div></section>${renderScheduleLegend()}`;
}

function renderScheduleLegend() {
  return `<div class="schedule-legend"><span class="legend-item"><i class="legend-dot school"></i>Lịch học trên trường</span><span class="legend-item"><i class="legend-dot self-study"></i>Lịch tự học</span><span class="legend-item"><i class="legend-dot conflict"></i>Lịch bị trùng</span></div>`;
}

function renderStudySchedulerModal() {
  return `<div class="study-scheduler-backdrop" data-close-study-scheduler><section class="study-scheduler-modal" role="dialog" aria-modal="true" aria-labelledby="studySchedulerTitle"><header><div><span class="eyebrow">Calendar tự học</span><h2 id="studySchedulerTitle">Sắp xếp thời gian tự học</h2><p>Chọn ngày và khung giờ bạn muốn thêm vào thời khóa biểu.</p></div><button class="icon-button" type="button" data-close-study-scheduler aria-label="Đóng">${icon("i-close")}</button></header><form id="studyScheduleForm"><div class="study-calendar-fields"><label>Ngày tự học<input name="date" type="date" value="${state.scheduleSelectedDate}" required /></label><label>Giờ bắt đầu<input name="start" type="time" value="19:00" required /></label><label>Giờ kết thúc<input name="end" type="time" value="20:30" required /></label></div><div class="form-row"><label>Môn học<select name="subject"><option>Cấu trúc dữ liệu</option><option>Cơ sở dữ liệu</option><option>Lập trình Web</option><option>Tiếng Anh</option><option>Khác</option></select></label><label>Tên buổi tự học<input name="title" required placeholder="Ví dụ: Ôn Stack & Queue" /></label></div><label>Địa điểm hoặc ghi chú<input name="note" placeholder="Ví dụ: Thư viện tầng 4" /></label><div class="study-color-note"><span class="legend-dot self-study"></span><p>Lịch tự học sẽ hiển thị màu xanh lá. Nếu trùng lịch trên trường, hệ thống sẽ đánh dấu đỏ và cho bạn chọn lịch muốn giữ.</p></div><footer><button class="button ghost" type="button" data-close-study-scheduler>Hủy</button><button class="button primary" type="submit">${icon("i-calendar")} Thêm vào lịch</button></footer></form></section></div>`;
}

function hasSchoolConflict(date, start, end) {
  return getSchoolEventsForDate(date).some(event => timesOverlap(start, end, event.start, event.end));
}

function renderTasks() {
  const actions = `<button class="button primary" type="button" data-open-task>${icon("i-plus")} Thêm công việc</button>`;
  const labels = { all: "Tất cả", working: "Đang làm", due: "Sắp đến hạn", complete: "Hoàn thành" };
  const subjects = [...new Set(state.tasks.map(task => task.subject))];
  const visibleTasks = state.tasks.filter(task => {
    const matchesTab = state.taskFilter === "all"
      || (state.taskFilter === "working" && !task.done && task.status === "Đang làm")
      || (state.taskFilter === "due" && !task.done && task.daysLeft <= 7)
      || (state.taskFilter === "complete" && task.done);
    const matchesSubject = !state.taskSubjectFilter || task.subject === state.taskSubjectFilter;
    const matchesStatus = !state.taskStatusFilter || (state.taskStatusFilter === "Hoàn thành" ? task.done : !task.done && task.status === state.taskStatusFilter);
    const matchesPriority = !state.taskPriorityFilter || task.priority === state.taskPriorityFilter;
    return matchesTab && matchesSubject && matchesStatus && matchesPriority;
  });
  const countFor = filter => state.tasks.filter(task => filter === "all" || (filter === "working" && !task.done && task.status === "Đang làm") || (filter === "due" && !task.done && task.daysLeft <= 7) || (filter === "complete" && task.done)).length;
  return `${pageHead("Công việc & Deadline", "Quản lý, theo dõi và hoàn thành các công việc học tập của bạn.", actions)}
    <section class="task-toolbar">
      <div class="task-tabs">${Object.entries(labels).map(([filter, label]) => `<button class="${state.taskFilter === filter ? "active" : ""}" type="button" data-task-filter="${filter}">${label}<span>${countFor(filter)}</span></button>`).join("")}</div>
      <div class="task-filters">
        <select id="taskSubjectFilter" aria-label="Lọc theo môn học"><option value="">Tất cả môn học</option>${subjects.map(subject => `<option ${state.taskSubjectFilter === subject ? "selected" : ""}>${escapeHTML(subject)}</option>`).join("")}</select>
        <select id="taskStatusFilter" aria-label="Lọc theo trạng thái"><option value="">Tất cả trạng thái</option>${["Chưa làm","Đang làm","Hoàn thành"].map(status => `<option ${state.taskStatusFilter === status ? "selected" : ""}>${status}</option>`).join("")}</select>
        <select id="taskPriorityFilter" aria-label="Lọc theo ưu tiên"><option value="">Tất cả ưu tiên</option>${["Cao","Trung bình","Thấp"].map(priority => `<option ${state.taskPriorityFilter === priority ? "selected" : ""}>${priority}</option>`).join("")}</select>
      </div>
    </section>
    <section class="card task-table task-table-full">
      <div class="task-row header"><span></span><span>Tên công việc</span><span>Môn học</span><span>Hạn nộp</span><span>Còn lại</span><span>Trạng thái</span><span>Ưu tiên</span><span>Thao tác</span></div>
      ${visibleTasks.map(task => renderTaskRow(task)).join("") || `<div class="empty-state"><span class="empty-icon">${icon("i-tasks")}</span><h3>Không có công việc phù hợp</h3><p>Hãy đổi bộ lọc hoặc thêm một công việc mới.</p></div>`}
    </section>`;
}

function summaryCard(label, value) {
  return `<article class="card task-summary-card"><span>${label}</span><strong>${value}</strong></article>`;
}

function renderTaskRow(task) {
  const priorityClass = task.priority === "Cao" ? "red" : task.priority === "Trung bình" ? "orange" : "green";
  const status = task.done ? "Hoàn thành" : task.status || "Chưa làm";
  const statusClass = task.done ? "green" : status === "Đang làm" ? "violet" : "orange";
  return `<article class="task-record"><div class="task-row ${task.done ? "completed" : ""}">
    <button class="task-check ${task.done ? "checked" : ""}" type="button" data-toggle-task="${task.id}" aria-label="${task.done ? "Đánh dấu chưa hoàn thành" : "Đánh dấu hoàn thành"}">${task.done ? icon("i-check") : ""}</button>
    <div class="task-title"><strong>${escapeHTML(task.title)}</strong><span>${escapeHTML(task.subject)}</span></div>
    <span class="task-subject">${escapeHTML(task.subject)}</span>
    <span class="task-meta">${escapeHTML(task.due)}</span><span class="task-remaining">${escapeHTML(task.remaining || "Mới thêm")}</span>
    <span class="status-pill ${statusClass}">${escapeHTML(status)}</span>
    <span class="status-pill ${priorityClass}">${task.priority}</span>
    <span class="task-actions"><button class="task-action edit" type="button" data-edit-task="${task.id}" aria-label="Sửa công việc">${icon("i-edit")}<span>Sửa</span></button><button class="task-action delete" type="button" data-delete-task="${task.id}" aria-label="Xóa công việc">${icon("i-trash")}<span>Xóa</span></button></span>
  </div></article>`;
}

function renderDocuments() {
  const docs = [
    ["Cơ sở dữ liệu - Chương 1.pdf", "Cơ sở dữ liệu", "Giáo trình", "2 giờ trước", "red"],
    ["Slide Chương 4.pptx", "Cơ sở dữ liệu", "Slide", "1 ngày trước", "orange"],
    ["Bài thực hành Lab 2.docx", "Cấu trúc dữ liệu và giải thuật", "Lab", "3 ngày trước", "sky"],
    ["Đề thi giữa kỳ 2024.pdf", "Lập trình Web", "Đề thi cũ", "5 ngày trước", "red"],
    ["Bài tập tuần 3.xlsx", "Cơ sở dữ liệu", "Bài tập", "1 tuần trước", "green"],
    ["Giáo trình Lập trình Web.pdf", "Lập trình Web", "Giáo trình", "2 tuần trước", "red"]
  ];
  return `${pageHead("Kho tài liệu", "Lưu trữ, tìm kiếm và chia sẻ tài liệu học tập.", `<button class="button primary" type="button" data-upload-doc>${icon("i-upload")} Tải lên tài liệu</button>`)}
    <section class="document-controls">
      <label class="document-search">${icon("i-search")}<input id="documentSearch" placeholder="Tìm kiếm tài liệu theo tên, môn học, tác giả..." /></label>
      <div class="document-selects"><select id="documentSubject"><option value="">Môn học</option><option>Cấu trúc dữ liệu và giải thuật</option><option>Lập trình Web</option><option>Cơ sở dữ liệu</option><option>Tiếng Anh</option></select><select id="documentType"><option value="">Loại tài liệu</option><option>Slide</option><option>Lab</option><option>Đề thi cũ</option><option>Giáo trình</option><option>Bài tập</option></select><select><option>Tag</option></select><select><option>Cập nhật gần đây</option></select></div>
      <div class="document-chips"><button class="active">Tất cả</button><button>Slide</button><button>Giáo trình</button><button>Lab</button><button>Đề thi cũ</button><span class="spacer"></span><button class="active square">▦</button><button class="square">☷</button></div>
    </section>
    <section class="document-grid" id="documentGrid">
      ${docs.map((doc, index) => renderDocumentCard(doc, index)).join("")}
    </section>`;
}

function renderDocumentCard([title, subject, type, date, color], index) {
  return `<article class="card document-card" data-doc-card data-title="${title.toLowerCase()}" data-subject="${subject}" data-type="${type}">
    <div class="document-top"><span class="file-icon ${color}">${type === "Slide" ? "P" : type === "Bài tập" ? "X" : type === "Lab" ? "W" : "PDF"}</span><button class="document-more" type="button">•••</button></div>
    <h3>${title}</h3><p>${subject}</p><span class="status-pill ${color}">${type}</span>
    <div class="tag-row"><span class="tag violet">${subject === "Cơ sở dữ liệu" ? "CSDL" : subject.includes("Cấu trúc") ? "Lab" : "Lập trình Web"}</span><span class="tag sky">${index % 2 ? "Thực hành" : "Chương 1"}</span></div>
    <div class="document-footer"><span>${icon("i-clock")} Cập nhật ${date}</span><span class="cloud-state ${index === 2 || index === 4 ? "offline" : ""}">${icon("i-folder")} ${index === 2 || index === 4 ? "Chỉ có offline" : "Đã lưu cloud"}</span></div><button class="document-open" type="button" data-open-doc>Mở tài liệu</button>
  </article>`;
}

function renderAI() {
  const extraMessages = state.messages.slice(1);
  return `<section class="card ai-layout ai-layout-complete ai-layout-focus">
      <aside class="chat-history">
        <div class="chat-history-head"><button class="button primary full" type="button" data-new-chat>${icon("i-plus")} Tạo đoạn hội thoại mới</button></div>
        <div class="history-label">${icon("i-clock")} Lịch sử hội thoại</div>
        <div class="conversation-list">
          <p>Hôm nay</p><button class="conversation-item active" data-conversation="Xác suất"><strong>Giải bài tập xác suất...</strong><span>10:24</span></button>
          <button class="conversation-item" data-conversation="Tóm tắt CSDL"><strong>Tóm tắt chương 4 CSDL</strong><span>09:18</span></button>
          <button class="conversation-item" data-conversation="Dijkstra"><strong>Giải thích thuật toán Dijkstra</strong><span>08:42</span></button>
          <p>Hôm qua</p><button class="conversation-item" data-conversation="Quiz AI"><strong>Phân tích kết quả Quiz AI</strong><span>16:30</span></button><button class="conversation-item" data-conversation="Bài tập SQL"><strong>Hỗ trợ giải bài tập SQL</strong><span>14:12</span></button>
        </div>
      </aside>
      <div class="chat-panel">
        <div class="chat-head"><span class="ai-avatar">${icon("i-spark")}</span><div><strong>UniStudy AI</strong><span><i></i> Sẵn sàng hỗ trợ học tập</span></div><span class="spacer"></span><span class="ai-context-chip">Dùng lịch học & deadline</span></div>
        <div class="chat-messages" id="chatMessages">
          <div class="message user"><span class="message-avatar"><img src="assets/fox-student-avatar.png" alt="Bạn" /></span><div class="message-bubble">Làm sao để tính xác suất xuất hiện ít nhất một mặt 6 khi gieo 2 con xúc xắc?</div></div>
          <div class="ai-answer"><img src="assets/fox-ai-tutor.png" alt="Cáo gia sư UniStudy" /><div><p>Để tính xác suất xuất hiện ít nhất một mặt 6 khi gieo 2 con xúc xắc, chúng ta có thể dùng phương pháp biến cố đối.</p>${aiStep(1,"Xác định không gian mẫu","Mỗi con xúc xắc có 6 mặt, khi gieo 2 con có 6 × 6 = 36 kết quả đồng khả năng.")}${aiStep(2,"Xác định biến cố đối","Không xuất hiện mặt 6 nào nghĩa là cả hai con đều thuộc các mặt 1, 2, 3, 4, 5.")}${aiStep(3,"Tính xác suất",`P(A) = 1 − 25/36 = <b>11/36</b> ≈ 0,3056.`)}<div class="ai-source">${icon("i-folder")} <span><b>Nguồn tham khảo</b><small>Xác suất và Thống kê — Chương 2: Xác suất của biến cố</small></span>${icon("i-arrow")}</div></div></div>
          ${extraMessages.map(message => `<div class="message ${message.role === "user" ? "user" : ""}"><span class="message-avatar">${message.role === "user" ? `<img src="assets/fox-student-avatar.png" alt="Bạn" />` : icon("i-spark")}</span><div class="message-bubble">${escapeHTML(message.text)}</div></div>`).join("")}
        </div>
        <div class="quick-prompts">
          <button class="quick-prompt" data-ai-feature="summary">${icon("i-tasks")} Tóm tắt tài liệu</button><button class="quick-prompt" data-ai-feature="explain">${icon("i-folder")} Giải thích nội dung</button><button class="quick-prompt" data-ai-feature="solve">${icon("i-spark")} Hỗ trợ giải bài</button><button class="quick-prompt" data-ai-feature="weakness">${icon("i-chart")} Phân tích điểm yếu</button><button class="quick-prompt" data-ai-feature="suggestions">${icon("i-plan")} Gợi ý học tập</button>
        </div>
        <form class="chat-input-wrap" id="chatForm"><button class="icon-button" type="button" data-attach-doc aria-label="Đính kèm tài liệu">${icon("i-plus")}</button><textarea name="message" rows="1" placeholder="Nhập câu hỏi hoặc yêu cầu UniStudy AI hỗ trợ..."></textarea><button class="button primary" type="submit" aria-label="Gửi câu hỏi">${icon("i-send")}</button></form>
      </div>
      <aside class="ai-toolbox"><div class="ai-toolbox-head"><span>${icon("i-spark")}</span><div><h2>Công cụ AI</h2><p>Chọn một tác vụ để trải nghiệm.</p></div></div>
        <div class="ai-tool-list">${aiFeatureCard("summary", "i-tasks", "Tóm tắt tài liệu", "Rút gọn slide, PDF thành ý chính")}${aiFeatureCard("explain", "i-folder", "Giải thích nội dung", "Diễn giải thuật ngữ bằng ví dụ")}${aiFeatureCard("solve", "i-spark", "Hỗ trợ giải bài", "Gợi ý từng bước, không bỏ qua tư duy")}${aiFeatureCard("weakness", "i-chart", "Phân tích điểm yếu", "Dựa trên Quiz và tiến độ môn học")}${aiFeatureCard("suggestions", "i-plan", "Gợi ý học tập", "Đề xuất nội dung nên học tiếp")}</div>
        <article class="ai-daily-suggestion"><span>Gợi ý hôm nay</span><strong>Ôn Stack & Queue trong 35 phút</strong><p>Đây là chủ đề bạn trả lời sai nhiều nhất trong 3 Quiz gần đây.</p><button type="button" data-ai-feature="suggestions">Xem kế hoạch gợi ý</button></article>
      </aside>
    </section>`;
}

function aiStep(number, title, copy) {
  return `<div class="ai-step"><span>${number}</span><p><b>Bước ${number}: ${title}</b><small>${copy}</small></p></div>`;
}

function aiFeatureCard(id, iconId, title, description) {
  return `<button class="ai-tool-card ${state.aiFeature === id ? "active" : ""}" type="button" data-ai-feature="${id}"><span>${icon(iconId)}</span><span><b>${title}</b><small>${description}</small></span></button>`;
}

function runAIFeature(feature) {
  const content = {
    summary: ["Tóm tắt tài liệu này giúp tôi", "Bạn hãy đính kèm slide, PDF hoặc dán nội dung vào khung chat. Mình sẽ tạo bản tóm tắt gồm: ý chính, thuật ngữ quan trọng và checklist ôn tập."],
    explain: ["Giải thích nội dung này theo cách dễ hiểu", "Mình sẽ giải thích theo 3 lớp: định nghĩa ngắn gọn, ví dụ gần gũi và một câu hỏi kiểm tra để bạn tự đánh giá mức hiểu."],
    solve: ["Hỗ trợ tôi giải bài tập từng bước", "Hãy gửi đề bài. Mình sẽ xác định dữ kiện, chia bài thành từng bước, gợi ý hướng giải và kiểm tra kết quả cùng bạn."],
    weakness: ["Phân tích điểm yếu học tập của tôi", "Phân tích 3 Quiz gần nhất cho thấy bạn cần ưu tiên: Stack & Queue (58%), JOIN nhiều bảng (64%) và bất đồng bộ JavaScript (67%). Nên ôn Stack & Queue trước vì kỳ kiểm tra còn 12 ngày."],
    suggestions: ["Gợi ý nội dung tôi nên học tiếp", "Dựa trên lịch trống và tiến độ hiện tại: hôm nay ôn Stack & Queue 35 phút; tối mai làm 10 câu JOIN; cuối tuần thực hành Promise và async/await trong 45 phút."]
  }[feature];
  if (!content) return;
  state.aiFeature = feature;
  state.messages.push({ role: "user", text: content[0] }, { role: "assistant", text: content[1] });
  render();
  requestAnimationFrame(() => {
    const messages = document.querySelector("#chatMessages");
    if (messages) messages.scrollTop = messages.scrollHeight;
  });
}

function renderStudyPlan() {
  const days = ["Thứ 2|15/09", "Thứ 3|16/09", "Thứ 4|17/09", "Thứ 5|18/09", "Thứ 6|19/09", "Thứ 7|20/09", "Chủ nhật|21/09"];
  const sessions = [["08:00–09:30","Lập trình Web","sky"],["08:00–09:30","Tiếng Anh","red"],["08:00–09:30","Cấu trúc dữ liệu","violet"],["08:00–09:30","Cơ sở dữ liệu","green"],["10:00–11:30","Lập trình Web","sky"],["09:00–10:30","Tự học","orange"],["09:00–10:30","Ôn tập","yellow"]];
  return `${pageHead("Kế hoạch học tập", "Lập kế hoạch khoa học, quản lý thời gian hiệu quả và đạt được mục tiêu học tập của bạn.", `<button class="button ghost" type="button">${icon("i-plus")} Tạo kế hoạch</button><button class="button primary" type="button" data-regenerate-plan>${icon("i-spark")} Điều chỉnh bằng AI</button>`)}
    <section class="card study-week-board"><div class="study-week-toolbar"><button class="icon-button">‹</button><b>15 – 21 Tháng 9, 2026</b><button class="icon-button">›</button><span class="spacer"></span><div class="tabs"><button class="tab-button active">Tuần</button><button class="tab-button">Tháng</button><button class="tab-button">Hôm nay</button></div></div><div class="study-week-grid">${days.map((day, i) => { const [name,date]=day.split("|"); const s=sessions[i]; return `<div class="study-day-column"><header><b>${name}</b><span>${date}</span></header><div class="study-slot ${s[2]}"><time>${s[0]}</time><strong>${s[1]}</strong></div><div class="study-slot ${i%3===0?"violet":i%3===1?"green":"sky"}"><time>${i<2?"13:00–14:30":"14:00–15:30"}</time><strong>${i%2?"Cơ sở dữ liệu":"Lập trình Web"}</strong></div><div class="study-slot ${i%2?"blue":"orange"}"><time>19:00–20:30</time><strong>${i%2?"Đọc tài liệu":"Ôn tập Quiz"}</strong></div></div>`; }).join("")}</div></section>
    <section class="study-plan-bottom"><article class="card plan-check-card"><div class="card-head"><h2>${icon("i-exam")} Mục tiêu tuần này</h2><button class="card-link">Thêm mục tiêu</button></div>${planCheck("Hoàn thành bài tập chương 4 Cơ sở dữ liệu",true,"100%")}${planCheck("Ôn tập quiz chương 2 Lập trình Web",false,"0%")}${planCheck("Đọc 3 tài liệu tham khảo cho dự án nhóm",true,"100%")}${planCheck("Luyện đề Toán rời rạc",false,"0%")}</article><article class="card plan-check-card"><div class="card-head"><h2>${icon("i-tasks")} Nhiệm vụ hôm nay</h2><button class="card-link">Xem tất cả</button></div>${planCheck("Học lý thuyết Cấu trúc dữ liệu (Chương 3)",true,"08:00–09:30")}${planCheck("Làm bài tập Toán rời rạc",false,"10:00–11:30")}${planCheck("Đọc tài liệu tham khảo",false,"14:00–15:30")}${planCheck("Tóm tắt kiến thức & ghi chú",false,"19:00–20:30")}</article></section>`;
}

function planCheck(label, checked, meta) { return `<label class="plan-check"><input type="checkbox" ${checked ? "checked" : ""}/><span>${label}</span><b>${meta}</b></label>`; }

function planDay(day, date, sessions) {
  return `<article class="card plan-day"><div class="plan-day-label"><b>${day}</b>${date}</div><div class="plan-sessions">${sessions.map(([time, title, detail]) => `<div class="plan-session"><span class="plan-session-time">${time}</span><span><strong>${title}</strong><span>${detail}</span></span><span class="spacer"></span><span class="status-pill violet">Đã xếp</span></div>`).join("")}</div></article>`;
}
function suggestion(number, title, detail) {
  return `<div class="suggestion-item"><span class="suggestion-number">${number}</span><span><strong>${title}</strong><span>${detail}</span></span></div>`;
}

function renderExamPlan() {
  const exams = [...state.exams].sort((a, b) => `${a.date}T${a.start}`.localeCompare(`${b.date}T${b.start}`));
  const readinessColors = ["red", "blue", "green", "violet"];
  return `${pageHead("Kế hoạch ôn thi", "Tự thêm kỳ thi hoặc đồng bộ lịch thi CMC để xây dựng lộ trình ôn tập phù hợp.", `<button class="button primary" type="button" data-open-exam-plan>${icon("i-plus")} Tạo kế hoạch ôn thi</button><button class="button ghost" type="button" data-sync-exams>${icon("i-refresh")} Đồng bộ lịch thi CMC</button>`)}
    <section class="card exam-section"><div class="card-head"><div><h2>${icon("i-clock")} Các kỳ thi sắp tới</h2><p>Lịch tự thêm và lịch đồng bộ từ hệ thống nhà trường</p></div><span class="status-pill violet">${exams.length} kỳ thi</span></div><div class="exam-overview">${exams.map(examCountdown).join("") || `<div class="exam-empty-state">${icon("i-exam")}<strong>Chưa có kỳ thi nào</strong><span>Thêm kỳ thi hoặc đồng bộ lịch thi từ CMC.</span></div>`}</div></section>
    <section class="exam-middle-grid"><article class="card readiness-card"><div class="card-head"><h2>${icon("i-chart")} Mức độ sẵn sàng</h2></div>${exams.slice(0, 4).map((exam, index) => readiness(exam.subject, Math.max(25, 70 - index * 12), readinessColors[index % readinessColors.length])).join("") || `<p class="muted-copy">Chưa có dữ liệu để phân tích.</p>`}</article><article class="card exam-schedule-cta"><img src="assets/fox-study.png" alt="Cáo sinh viên CMC lên kế hoạch học"/><div><span class="eyebrow">Kết nối thời khóa biểu</span><h2>Lên kế hoạch học</h2><p>Chọn ngày và giờ tự học trên trang Lịch học. UniStudy sẽ phát hiện trùng lịch và giúp bạn giữ lại lịch phù hợp.</p><button class="button primary" type="button" data-view="schedule">${icon("i-calendar")} Đi đến Lịch học</button></div></article></section>
    <section class="card roadmap"><div class="card-head"><h2>${icon("i-plan")} Lộ trình các kỳ thi</h2><button class="card-link" type="button" data-open-exam-plan>+ Thêm kỳ thi</button></div><div class="roadmap-line">${exams.map(exam => roadmapItem(exam.subject, `Phạm vi: ${exam.scope || "Đang cập nhật"}. ${exam.code || ""} · ${exam.room || "Chưa có phòng"}`, `${formatExamDate(exam.date)} · ${exam.start}`)).join("") || `<p class="muted-copy">Lộ trình sẽ xuất hiện sau khi bạn thêm kỳ thi.</p>`}</div></section>`;
}

function formatExamDate(value) {
  return parseScheduleDate(value).toLocaleDateString("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" });
}

function daysUntilExam(value) {
  const today = new Date();
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.max(0, Math.ceil((parseScheduleDate(value) - startToday) / 86400000));
}

function examCountdown(exam) {
  const days = daysUntilExam(exam.date);
  return `<article class="exam-countdown"><span class="exam-count-icon">${icon("i-tasks")}</span><div><strong>${escapeHTML(exam.subject)}</strong><small>${escapeHTML(exam.code || "Chưa có mã")} · ${formatExamDate(exam.date)} · ${escapeHTML(exam.start)}</small><small>${escapeHTML(exam.room || "Chưa có phòng")} · ${exam.duration} phút · ${escapeHTML(exam.source || "Tự thêm")}</small></div><b>${days === 0 ? "Hôm nay" : days}<small>${days === 0 ? "" : "ngày nữa"}</small></b>${exam.source !== "CMC" ? `<button class="icon-button exam-delete-button" type="button" data-delete-exam="${exam.id}" aria-label="Xóa kỳ thi">${icon("i-trash")}</button>` : ""}</article>`;
}

function renderExamPlanModal() {
  return `<div class="study-scheduler-backdrop" data-close-exam-plan><section class="study-scheduler-modal exam-plan-modal" role="dialog" aria-modal="true" aria-labelledby="examPlanTitle"><header><div><span class="eyebrow">Kỳ thi sắp tới</span><h2 id="examPlanTitle">Thêm thông tin kỳ thi</h2><p>UniStudy sẽ dùng thông tin này để tạo lộ trình và gợi ý thời gian tự học.</p></div><button class="icon-button" type="button" data-close-exam-plan aria-label="Đóng">${icon("i-close")}</button></header><form id="examPlanForm"><div class="form-row"><label>Tên môn thi<input name="subject" required placeholder="Ví dụ: Trí tuệ nhân tạo" /></label><label>Mã môn<input name="code" required placeholder="Ví dụ: AAI301" /></label></div><div class="study-calendar-fields exam-date-fields"><label>Ngày thi<input name="date" type="date" min="2026-10-04" required /></label><label>Giờ bắt đầu<input name="start" type="time" value="08:00" required /></label><label>Thời lượng (phút)<input name="duration" type="number" min="15" max="300" step="15" value="90" required /></label></div><div class="form-row"><label>Phòng thi<input name="room" placeholder="Ví dụ: B204" /></label><label>Nguồn lịch<select name="source"><option>Tự thêm</option><option>CMC</option></select></label></div><label>Phạm vi / ghi chú ôn tập<textarea name="scope" rows="3" placeholder="Ví dụ: Chương 1–5, được mang máy tính"></textarea></label><div class="exam-sync-note">${icon("i-refresh")}<span>Bạn cũng có thể đóng biểu mẫu và dùng nút <b>Đồng bộ lịch thi CMC</b> để lấy lịch từ hệ thống trường.</span></div><footer><button class="button ghost" type="button" data-close-exam-plan>Hủy</button><button class="button primary" type="submit">${icon("i-plan")} Lưu và tạo lộ trình</button></footer></form></section></div>`;
}

function readiness(label, value, color) { return `<div class="readiness-row"><span class="rail-subject-icon ${color}">${icon("i-folder")}</span><div><strong>${label}</strong><span><i style="width:${value}%"></i></span></div><b>${value}%</b></div>`; }
function roadmapItem(title, detail, date) { return `<div class="roadmap-item"><span class="roadmap-dot"></span><span class="roadmap-copy"><strong>${title}</strong><span>${detail}</span></span><span class="roadmap-date">${date}</span></div>`; }

function renderQuiz() {
  if (state.quizStage === "create") return renderQuizCreate();
  if (state.quizStage === "attempt") return renderQuizAttempt();
  if (state.quizStage === "result") return renderQuizResult();
  const totalQuestions = state.quizHistory.reduce((sum, item) => sum + item.count, 0);
  const average = state.quizHistory.length ? Math.round(state.quizHistory.reduce((sum, item) => sum + (item.score / item.count) * 100, 0) / state.quizHistory.length) : 0;
  return `${pageHead("Quiz bằng AI", "Tải tài liệu, chọn số câu và độ khó; mọi lần làm bài đều được lưu trong lịch sử.", `<button class="button primary" type="button" data-quiz-stage="create">${icon("i-plus")} Tạo bộ Quiz mới</button>`)}
    <section class="quiz-overview-stats">
      <article><span>${icon("i-quiz")}</span><div><b>${state.quizHistory.length}</b><small>Bộ Quiz đã làm</small></div></article>
      <article><span>${icon("i-tasks")}</span><div><b>${totalQuestions}</b><small>Câu hỏi trong lịch sử</small></div></article>
      <article><span>${icon("i-chart")}</span><div><b>${average}%</b><small>Điểm trung bình</small></div></article>
    </section>
    <section class="quiz-home-layout">
      <article class="card quiz-create-hero">
        <div class="quiz-create-copy"><span class="eyebrow">Tạo từ tài liệu</span><h2>Biến slide hoặc giáo trình thành một bộ Quiz</h2><p>Hỗ trợ PDF, PPTX và DOCX. Sau khi tải lên, bạn có thể đặt tên bộ Quiz, chọn số câu và mức độ khó.</p></div>
        <label class="quiz-upload-hero" for="quizOverviewFileInput">${icon("i-upload")}<span><strong>Tải tài liệu lên</strong><small>Chọn file để chuyển sang bước cấu hình</small></span></label>
        <input class="visually-hidden" id="quizOverviewFileInput" type="file" accept=".pdf,.ppt,.pptx,.doc,.docx" />
        <button class="button primary full" type="button" data-quiz-stage="create">${icon("i-spark")} Tạo Quiz bằng AI</button>
      </article>
      <article class="card quiz-history-panel"><div class="card-head"><div><h2>Lịch sử Quiz</h2><p>Tất cả bộ câu hỏi và kết quả đã làm</p></div><span class="status-pill green">Đã lưu tự động</span></div><div class="quiz-history-list">
        ${state.quizHistory.map(quizHistoryItem).join("") || `<div class="quiz-history-empty">${icon("i-quiz")}<strong>Chưa có bộ Quiz nào</strong><span>Tải tài liệu lên để tạo bộ Quiz đầu tiên.</span><button class="button primary" type="button" data-quiz-stage="create">Tạo Quiz ngay</button></div>`}
      </div></article>
    </section>`;
}

function quizHistoryItem(item) {
  const percent = Math.round((item.score / item.count) * 100);
  return `<article class="quiz-history-item"><span class="quiz-icon">${icon("i-quiz")}</span><div class="quiz-history-main"><strong>${escapeHTML(item.title)}</strong><span>${escapeHTML(item.subject)} · ${escapeHTML(item.fileName)}</span><small>${item.count} câu · ${escapeHTML(item.difficulty)} · ${escapeHTML(item.date)}</small></div><div class="quiz-history-score"><b>${item.score}/${item.count}</b><span>${percent}%</span></div><div class="quiz-history-actions"><button class="button ghost" type="button" data-open-quiz-history="${item.id}">Xem kết quả</button><button class="button secondary" type="button" data-retry-quiz-history="${item.id}">Làm lại</button><button class="icon-button quiz-delete-button" type="button" data-delete-quiz-history="${item.id}" aria-label="Xóa bộ Quiz ${escapeHTML(item.title)}" title="Xóa bộ Quiz">${icon("i-trash")}</button></div></article>`;
}

function renderQuizCreate() {
  const fileName = state.quizConfig.fileName;
  return `${pageHead("Tạo bộ Quiz", "Tải tài liệu và cấu hình bộ câu hỏi trước khi AI tạo Quiz.", `<button class="button ghost" type="button" data-quiz-stage="overview">← Lịch sử Quiz</button>`)}
    <div class="quiz-steps"><span class="active"><b>1</b>Tải tài liệu</span><i></i><span class="active"><b>2</b>Cấu hình</span><i></i><span><b>3</b>Làm Quiz</span></div>
    <form class="quiz-config-layout" id="quizConfigForm">
      <section class="card quiz-config-main">
        <div class="quiz-section-title"><span>1</span><div><h2>Tài liệu tạo câu hỏi</h2><p>AI sẽ đọc nội dung trong tài liệu để tạo bộ câu hỏi phù hợp.</p></div></div>
        <label class="quiz-upload-zone ${fileName ? "has-file" : ""}" for="quizFileInput">${icon(fileName ? "i-check" : "i-upload")}<span><strong>${fileName ? escapeHTML(fileName) : "Kéo thả hoặc chọn tài liệu"}</strong><small>${fileName ? "Tài liệu đã sẵn sàng · Bấm để chọn file khác" : "PDF, PPTX hoặc DOCX · tối đa 20 MB"}</small></span></label>
        <input class="visually-hidden" id="quizFileInput" type="file" accept=".pdf,.ppt,.pptx,.doc,.docx" />
        <div class="quiz-section-title"><span>2</span><div><h2>Cấu hình bộ Quiz</h2><p>Chọn môn học, số câu và mức độ khó.</p></div></div>
        <div class="quiz-form-grid"><label>Tên bộ Quiz<input name="title" required value="${escapeHTML(state.quizConfig.title)}" placeholder="Ví dụ: Ôn tập chương 4" /></label><label>Môn học<select name="subject"><option ${state.quizConfig.subject === "Cấu trúc dữ liệu" ? "selected" : ""}>Cấu trúc dữ liệu</option><option ${state.quizConfig.subject === "Cơ sở dữ liệu" ? "selected" : ""}>Cơ sở dữ liệu</option><option ${state.quizConfig.subject === "Lập trình Web" ? "selected" : ""}>Lập trình Web</option><option ${state.quizConfig.subject === "Khác" ? "selected" : ""}>Khác</option></select></label></div>
        <div class="quiz-choice-block"><span class="quiz-choice-label">Số lượng câu hỏi</span><div class="quiz-count-options">${[5,10,15,20].map(count => `<label class="${state.quizConfig.count === count ? "selected" : ""}"><input type="radio" name="count" value="${count}" ${state.quizConfig.count === count ? "checked" : ""}/><b>${count}</b><span>câu</span></label>`).join("")}</div></div>
        <div class="quiz-choice-block"><span class="quiz-choice-label">Mức độ khó</span><div class="quiz-difficulty-options">${[["Dễ","Ôn lại khái niệm cơ bản"],["Trung bình","Kết hợp lý thuyết và vận dụng"],["Khó","Câu hỏi phân tích và tình huống"]].map(([level,detail]) => `<label class="${state.quizConfig.difficulty === level ? "selected" : ""}"><input type="radio" name="difficulty" value="${level}" ${state.quizConfig.difficulty === level ? "checked" : ""}/><span class="difficulty-dot ${level === "Dễ" ? "green" : level === "Khó" ? "red" : "violet"}"></span><span><b>${level}</b><small>${detail}</small></span></label>`).join("")}</div></div>
      </section>
      <aside class="card quiz-config-summary"><img src="assets/fox-wave.png" alt="Cáo UniStudy hỗ trợ tạo Quiz"/><span class="eyebrow">Tóm tắt cấu hình</span><h2>Bộ Quiz của bạn</h2><dl><div><dt>Tài liệu</dt><dd>${fileName ? escapeHTML(fileName) : "Chưa chọn"}</dd></div><div><dt>Số câu</dt><dd>${state.quizConfig.count} câu</dd></div><div><dt>Độ khó</dt><dd>${escapeHTML(state.quizConfig.difficulty)}</dd></div><div><dt>Dạng câu hỏi</dt><dd>Trắc nghiệm</dd></div></dl><p>${icon("i-spark")} Bộ Quiz và kết quả sẽ tự động được lưu vào lịch sử sau khi nộp bài.</p><button class="button primary full" type="submit">${icon("i-spark")} Tạo và bắt đầu Quiz</button></aside>
    </form>`;
}

function renderQuizAttempt() {
  const questions = state.quizQuestions;
  const current = questions[state.quizCurrent] || questions[0];
  if (!current) { state.quizStage = "create"; return renderQuizCreate(); }
  const answered = Object.keys(state.quizAnswers).length;
  return `${pageHead(`Làm Quiz: ${escapeHTML(state.quizConfig.title || "Bộ Quiz mới")}`, `${escapeHTML(state.quizConfig.subject)} · ${state.quizConfig.count} câu · Mức ${escapeHTML(state.quizConfig.difficulty)}`, `<button class="button ghost" type="button" data-abandon-quiz>Thoát bài làm</button>`)}
    <section class="quiz-workspace quiz-attempt-wide">
      <div class="card quiz-progress"><span>${icon("i-tasks")} Câu <b>${state.quizCurrent + 1}/${questions.length}</b></span><span>${icon("i-clock")} Tài liệu <b>${escapeHTML(state.quizConfig.fileName)}</b></span><span>${icon("i-check")} Đã trả lời <b>${answered}/${questions.length}</b></span></div>
      <article class="card question-card">
        <div class="question-meta"><span class="status-pill violet">Câu ${state.quizCurrent + 1}</span><span class="status-pill ${state.quizConfig.difficulty === "Khó" ? "red" : state.quizConfig.difficulty === "Dễ" ? "green" : "violet"}">${escapeHTML(state.quizConfig.difficulty)}</span></div>
        <h2>${escapeHTML(current.question)}</h2>
        <div class="answer-list">
          ${current.options.map((answer, i) => `<button class="answer-option ${state.quizAnswers[current.id] === i ? "selected" : ""}" type="button" data-answer="${i}"><span class="answer-letter">${String.fromCharCode(65 + i)}</span><span>${escapeHTML(answer)}</span></button>`).join("")}
        </div>
        <div class="quiz-number-row">${questions.map((question,i)=>`<button class="${state.quizAnswers[question.id] !== undefined ? "done" : ""} ${i===state.quizCurrent ? "active" : ""}" type="button" data-quiz-jump="${i}">${i+1}</button>`).join("")}</div><div class="quiz-actions"><button class="button secondary" type="button" data-quiz-prev ${state.quizCurrent === 0 ? "disabled" : ""}>← Câu trước</button><button class="button ghost" type="button" data-mark-question>${icon("i-bookmark")} Đánh dấu</button><button class="button primary" type="button" data-quiz-next ${state.quizCurrent === questions.length - 1 ? "disabled" : ""}>Câu tiếp theo →</button><button class="button danger" type="button" data-submit-quiz>${icon("i-send")} Nộp bài</button></div>
      </article>
    </section>`;
}

function renderQuizResult() {
  const result = state.quizResult || { title: "Bộ Quiz", subject: "Cấu trúc dữ liệu", fileName: "Tài liệu", count: 10, difficulty: "Trung bình", score: 8, date: "Vừa xong", questions: [], answers: {} };
  const percent = Math.round((result.score / result.count) * 100);
  const wrong = result.questions?.find(question => result.answers?.[question.id] !== question.correct);
  return `${pageHead("Kết quả Quiz", `${escapeHTML(result.subject)} · ${escapeHTML(result.title)}`, `<button class="button ghost" type="button" data-quiz-stage="overview">Xem lịch sử</button><button class="button primary" type="button" data-quiz-stage="create">Tạo Quiz khác</button>`)}
    <section class="card result-board">
      <img class="result-fox" src="assets/fox-quiz-success.png" alt="Cáo UniStudy chúc mừng kết quả Quiz" />
      <div class="result-score-block"><div class="result-score" style="background:conic-gradient(var(--green-600) ${percent}%,var(--green-100) 0)"><b>${result.score}/${result.count}<small>${percent}%</small></b></div><div class="result-kpis"><span><i class="green">${icon("i-check")}</i><b>Đúng</b><strong>${result.score}</strong></span><span><i class="red">${icon("i-close")}</i><b>Sai</b><strong>${result.count - result.score}</strong></span><span><i class="violet">${icon("i-clock")}</i><b>Độ khó</b><strong>${escapeHTML(result.difficulty)}</strong></span></div></div>
      <div class="topic-effect"><h2>Hiệu suất theo chủ đề</h2>${topicBar("Truy vấn nâng cao (JOIN, Subquery)", 100)}${topicBar("Tạo và quản lý bảng", 80)}${topicBar("Hàm tổng hợp (Aggregate)", 75)}${topicBar("Ràng buộc dữ liệu", 100)}${topicBar("Chỉ mục và tối ưu", 50)}</div>
    </section>
    <article class="card quiz-saved-banner">${icon("i-check")}<div><strong>Đã lưu vào lịch sử Quiz</strong><span>${escapeHTML(result.fileName)} · ${result.count} câu · ${escapeHTML(result.date)}</span></div></article>
    ${wrong ? `<section class="answer-review"><article class="card review-item incorrect"><strong>⚠ Câu cần xem lại</strong><p><b>${escapeHTML(wrong.question)}</b></p><p><b>Đáp án đúng:</b> ${escapeHTML(wrong.options[wrong.correct])}</p><p><b>Giải thích của AI:</b> ${escapeHTML(wrong.explanation)}</p></article></section>` : ""}
    <div class="quiz-result-actions"><button class="button ghost" type="button" data-quiz-stage="overview">Về lịch sử Quiz</button><button class="button primary" type="button" data-retry-current-quiz>Làm lại bộ Quiz</button><button class="button ghost" type="button" data-view="flashcards">Tạo Flashcard từ câu sai</button></div>`;
}

function buildQuizQuestions(subject, count) {
  const banks = {
    "Cơ sở dữ liệu": [
      ["Khóa chính trong bảng có đặc điểm nào?", ["Có thể trùng lặp", "Xác định duy nhất mỗi bản ghi", "Luôn là kiểu chuỗi", "Chỉ dùng để sắp xếp"], 1, "Khóa chính dùng để định danh duy nhất mỗi bản ghi và không được NULL."],
      ["Câu lệnh SQL nào dùng để lấy dữ liệu?", ["SELECT", "UPDATE", "DELETE", "DROP"], 0, "SELECT là câu lệnh truy vấn dữ liệu từ bảng."],
      ["Quan hệ N–N thường được triển khai bằng gì?", ["Một cột text", "Bảng nối", "Xóa một bảng", "Không cần khóa ngoại"], 1, "Bảng nối chứa khóa ngoại của hai bảng giúp biểu diễn quan hệ nhiều–nhiều."],
      ["Mục tiêu chính của chuẩn hóa dữ liệu là gì?", ["Tăng trùng lặp", "Giảm dư thừa và bất nhất", "Xóa mọi khóa", "Chỉ để đổi tên bảng"], 1, "Chuẩn hóa giúp giảm dư thừa và tránh bất nhất khi cập nhật dữ liệu."],
      ["JOIN dùng để làm gì?", ["Ghép dữ liệu từ các bảng liên quan", "Xóa database", "Tạo mật khẩu", "Nén dữ liệu"], 0, "JOIN kết hợp các hàng từ hai hay nhiều bảng dựa trên điều kiện liên quan."]
    ],
    "Lập trình Web": [
      ["DOM trong JavaScript là gì?", ["Một cơ sở dữ liệu", "Mô hình cây của tài liệu HTML", "Một trình duyệt", "Một ngôn ngữ CSS"], 1, "DOM biểu diễn tài liệu HTML thành cây đối tượng để JavaScript thao tác."],
      ["Sự kiện click thường được đăng ký bằng phương thức nào?", ["addEventListener", "queryDatabase", "compile", "printFile"], 0, "addEventListener đăng ký hàm xử lý cho một sự kiện trên phần tử."],
      ["Thuộc tính CSS nào tạo khoảng cách bên trong phần tử?", ["margin", "padding", "gap-only", "z-index"], 1, "padding là khoảng cách từ nội dung đến đường viền của phần tử."],
      ["HTTP GET thường dùng để làm gì?", ["Lấy dữ liệu", "Xóa dữ liệu bắt buộc", "Biên dịch CSS", "Tạo biến JavaScript"], 0, "GET thường được dùng để yêu cầu và nhận dữ liệu từ máy chủ."],
      ["JSON lưu dữ liệu phổ biến theo cấu trúc nào?", ["Key–value", "Chỉ hình ảnh", "Mã máy", "Bảng nhị phân"], 0, "JSON biểu diễn đối tượng bằng các cặp khóa và giá trị."]
    ],
    "Cấu trúc dữ liệu": [
      ["Stack hoạt động theo nguyên tắc nào?", ["FIFO", "LIFO", "Ngẫu nhiên", "Theo khóa chính"], 1, "Stack dùng nguyên tắc LIFO: vào sau, ra trước."],
      ["Queue hoạt động theo nguyên tắc nào?", ["FIFO", "LIFO", "Chia để trị", "Đệ quy"], 0, "Queue dùng nguyên tắc FIFO: vào trước, ra trước."],
      ["Tìm kiếm trung bình trong Hash Table có độ phức tạp nào?", ["O(1)", "O(n²)", "O(log n!)", "O(2ⁿ)"], 0, "Khi hàm băm phân bố tốt, thao tác tìm kiếm trung bình đạt O(1)."],
      ["Trong BST, nút con bên trái thường có giá trị như thế nào?", ["Lớn hơn nút gốc", "Nhỏ hơn nút gốc", "Luôn bằng nút gốc", "Không có quy tắc"], 1, "Trong cây tìm kiếm nhị phân, nhánh trái chứa giá trị nhỏ hơn nút hiện tại."],
      ["Bubble Sort đổi chỗ hai phần tử khi nào?", ["Khi cặp kề nhau sai thứ tự", "Khi mảng rỗng", "Chỉ ở phần tử đầu", "Không bao giờ"], 0, "Bubble Sort so sánh các cặp kề nhau và đổi chỗ nếu chúng sai thứ tự."]
    ]
  };
  const bank = banks[subject] || banks["Cấu trúc dữ liệu"];
  return Array.from({ length: count }, (_, index) => {
    const base = bank[index % bank.length];
    const round = Math.floor(index / bank.length) + 1;
    return { id: index + 1, question: `${base[0]}${round > 1 ? ` (biến thể ${round})` : ""}`, options: base[1], correct: base[2], explanation: base[3] };
  });
}

function topicBar(label, value) {
  return `<div class="topic-bar"><span>${label}</span><div class="progress-track"><i style="width:${value}%"></i></div><b>${value}%</b></div>`;
}

function renderFlashcards() {
  if (state.flashStage === "create-deck") return renderFlashDeckCreate();
  const activeDeck = getActiveFlashDeck();
  if (state.flashStage === "manage" && activeDeck) return renderFlashDeckManage(activeDeck);
  if (state.flashStage === "review" && activeDeck) return renderFlashReview(activeDeck);

  const totalCards = state.flashDecks.reduce((sum, deck) => sum + deck.cards.length, 0);
  const averageProgress = state.flashDecks.length ? Math.round(state.flashDecks.reduce((sum, deck) => sum + deck.progress, 0) / state.flashDecks.length) : 0;
  return `${pageHead("Flashcard thông minh", "Tạo bộ thẻ trước, thêm từng thẻ vào bộ và chọn bộ muốn ôn tập.", `<button class="button ghost" type="button" data-ai-flash>${icon("i-spark")} Tạo bộ bằng AI</button><button class="button primary" type="button" data-create-flash-deck>${icon("i-plus")} Thêm bộ thẻ</button>`)}
    <section class="flash-summary-strip"><article><span>${icon("i-folder")}</span><div><b>${state.flashDecks.length}</b><small>Bộ thẻ của bạn</small></div></article><article><span>${icon("i-cards")}</span><div><b>${totalCards}</b><small>Tổng số thẻ</small></div></article><article><span>${icon("i-clock")}</span><div><b>${Math.max(3, Math.ceil(totalCards * .35))}</b><small>Thẻ cần ôn hôm nay</small></div></article><article><span>${icon("i-check")}</span><div><b>${averageProgress}%</b><small>Tiến độ trung bình</small></div></article></section>
    <section class="card flash-library-panel"><div class="flash-library-toolbar"><div><h2>Các bộ thẻ</h2><p>Chọn một bộ để ôn tập hoặc mở phần quản lý để thêm thẻ mới.</p></div><label class="flash-deck-search">${icon("i-search")}<input id="flashDeckSearch" placeholder="Tìm theo tên bộ thẻ hoặc môn học..." /></label></div>
      <div class="flash-deck-grid" id="flashDeckGrid">${state.flashDecks.map(renderFlashDeckCard).join("")}</div>
    </section>`;
}

function getActiveFlashDeck() {
  return state.flashDecks.find(deck => deck.id === state.activeFlashDeckId) || null;
}

function renderFlashDeckCard(deck) {
  return `<article class="flash-deck-card" data-flash-deck-card data-search="${escapeHTML(`${deck.name} ${deck.subject}`.toLowerCase())}"><div class="flash-deck-cover ${deck.color}"><span>${icon("i-cards")}</span><b>${deck.cards.length}</b><small>thẻ</small></div><div class="flash-deck-copy"><span class="status-pill violet">${escapeHTML(deck.subject)}</span><h3>${escapeHTML(deck.name)}</h3><p>${escapeHTML(deck.description || "Chưa có mô tả")}</p><div class="flash-deck-progress"><span><i style="width:${deck.progress}%"></i></span><b>${deck.progress}% đã thuộc</b></div><small>Cập nhật ${escapeHTML(deck.updated)}</small></div><div class="flash-deck-actions"><button class="button primary" type="button" data-start-deck="${deck.id}" ${deck.cards.length ? "" : "disabled"}>${icon("i-play")} Ôn tập</button><button class="button ghost" type="button" data-manage-deck="${deck.id}">${icon("i-edit")} Quản lý thẻ</button></div></article>`;
}

function renderFlashDeckCreate() {
  return `${pageHead("Thêm bộ thẻ", "Tạo bộ thẻ trước, sau đó bạn sẽ nhập từng thẻ vào bộ này.", `<button class="button ghost" type="button" data-flash-stage="library">← Danh sách bộ thẻ</button>`)}
    <section class="flash-deck-create-layout"><form class="card flash-deck-create-form" id="flashDeckForm"><div class="quiz-section-title"><span>1</span><div><h2>Thông tin bộ thẻ</h2><p>Đặt tên rõ ràng để dễ tìm lại khi ôn tập.</p></div></div><label>Tên bộ thẻ<input name="name" required placeholder="Ví dụ: Ôn tập JavaScript chương 3" /></label><label>Môn học<select name="subject"><option>Lập trình Web</option><option>Cơ sở dữ liệu</option><option>Cấu trúc dữ liệu</option><option>Tiếng Anh</option><option>Khác</option></select></label><label>Mô tả<textarea name="description" placeholder="Bộ thẻ này gồm những nội dung nào?"></textarea></label><fieldset><legend>Màu đại diện</legend><div class="flash-color-options">${["violet","green","blue","orange","pink"].map((color,index)=>`<label class="${color}"><input type="radio" name="color" value="${color}" ${index===0?"checked":""}/><span></span></label>`).join("")}</div></fieldset><button class="button primary full" type="submit">Tạo bộ thẻ và thêm thẻ đầu tiên</button></form><aside class="card flash-create-guide"><img src="assets/fox-flashcard.png" alt="Cáo UniStudy học Flashcard"/><span class="eyebrow">Quy trình Flashcard</span><ol><li><b>Tạo bộ thẻ</b><span>Đặt tên và chọn môn học.</span></li><li><b>Nhập từng thẻ</b><span>Thêm mặt trước, mặt sau và tag.</span></li><li><b>Chọn bộ để ôn</b><span>Lật thẻ và tự đánh giá ghi nhớ.</span></li></ol></aside></section>`;
}

function renderFlashDeckManage(deck) {
  return `${pageHead(escapeHTML(deck.name), `${escapeHTML(deck.subject)} · ${deck.cards.length} thẻ`, `<button class="button ghost" type="button" data-flash-stage="library">← Các bộ thẻ</button><button class="button primary" type="button" data-start-deck="${deck.id}" ${deck.cards.length ? "" : "disabled"}>${icon("i-play")} Bắt đầu ôn</button>`)}
    <section class="flash-manage-overview card"><div class="flash-deck-cover ${deck.color}"><span>${icon("i-cards")}</span><b>${deck.cards.length}</b><small>thẻ</small></div><div><span class="eyebrow">Bộ thẻ đang chỉnh sửa</span><h2>${escapeHTML(deck.name)}</h2><p>${escapeHTML(deck.description || "Chưa có mô tả")}</p></div><div class="flash-manage-progress"><span><i style="width:${deck.progress}%"></i></span><b>${deck.progress}% đã thuộc</b></div></section>
    <section class="flash-manage-layout">
      <article class="card flash-card-list-panel"><div class="card-head"><div><h2>Danh sách thẻ</h2><p>Những thẻ đã có trong bộ này</p></div><span class="status-pill violet">${deck.cards.length} thẻ</span></div><div class="flash-manage-list">${deck.cards.length ? deck.cards.map((card,index)=>`<article><span>${index+1}</span><div><strong>${escapeHTML(card.front)}</strong><p>${escapeHTML(card.back)}</p><small>#${escapeHTML(card.tag || "Không tag")}</small></div><button class="icon-button" type="button" data-delete-flash-card="${card.id}" aria-label="Xóa thẻ">${icon("i-trash")}</button></article>`).join("") : `<div class="flash-empty-state">${icon("i-cards")}<strong>Bộ thẻ chưa có nội dung</strong><p>Hãy nhập thẻ đầu tiên ở biểu mẫu bên cạnh.</p></div>`}</div></article>
      <article class="card flash-create-panel" id="flashCreatePanel"><div class="card-head"><div><h2>Thêm từng thẻ</h2><p>Thẻ sẽ được lưu vào bộ “${escapeHTML(deck.name)}”.</p></div><span class="status-pill green">Thẻ mới</span></div><form class="stack-form" id="flashcardForm"><label>Mặt trước<textarea name="front" required placeholder="Nhập câu hỏi hoặc thuật ngữ..."></textarea></label><label>Mặt sau<textarea name="back" required placeholder="Nhập đáp án hoặc nội dung giải thích..."></textarea></label><label>Tag<input name="tag" placeholder="Ví dụ: DOM, SQL, Stack..." /></label><button class="button primary full" type="submit">${icon("i-plus")} Thêm thẻ vào bộ</button></form></article>
    </section>`;
}

function renderFlashReview(deck) {
  if (!deck.cards.length) { state.flashStage = "manage"; return renderFlashDeckManage(deck); }
  const card = deck.cards[state.flashIndex % deck.cards.length];
  const progress = ((state.flashIndex + 1) / deck.cards.length) * 100;
  return `${pageHead(`Ôn tập: ${escapeHTML(deck.name)}`, `${escapeHTML(deck.subject)} · ${deck.cards.length} thẻ`, `<button class="button ghost" type="button" data-manage-deck="${deck.id}">Quản lý bộ thẻ</button><button class="button secondary" type="button" data-flash-stage="library">Kết thúc phiên</button>`)}
    <section class="card flash-review-section" id="flashReview"><div class="flash-review-head"><div><span class="eyebrow">Phiên ôn tập</span><h2>Thẻ ${state.flashIndex + 1} / ${deck.cards.length}</h2><p>Nhấn vào thẻ để lật mặt sau.</p></div><div class="flash-review-progress"><span><i style="width:${progress}%"></i></span><b>${Math.round(progress)}%</b></div></div>
      <div class="flash-review-grid"><div class="flashcard-stage"><button class="flashcard ${state.flashFlipped ? "flipped" : ""}" type="button" data-flip-card aria-label="Lật thẻ"><div class="flashcard-inner"><div class="flashcard-face front"><span>${escapeHTML(card.tag || "Kiến thức")}</span><h2>${escapeHTML(card.front)}</h2><p>Nhấn vào thẻ để xem đáp án</p></div><div class="flashcard-face back"><span>Mặt sau</span><h2>${escapeHTML(card.back)}</h2><p>Hãy tự đánh giá mức độ ghi nhớ của bạn.</p></div></div></button><p class="flashcard-hint">Lật thẻ · Đọc đáp án · Chọn mức độ ghi nhớ</p><div class="flashcard-controls"><button class="button ghost" type="button" data-flash-nav="prev">← Thẻ trước</button><button class="button danger" type="button" data-card-rating="hard">Khó nhớ</button><button class="button secondary" type="button" data-card-rating="review">Cần ôn lại</button><button class="button primary" type="button" data-card-rating="known">Đã nhớ</button><button class="button ghost" type="button" data-flash-nav="next">Thẻ sau →</button></div></div>
        <aside class="flash-queue"><div class="card-head"><h3>Thẻ trong bộ</h3><span>${deck.cards.length} thẻ</span></div>${deck.cards.map((item,index)=>`<button class="flash-queue-item ${index===state.flashIndex?"active":""}" type="button" data-flash-index="${index}"><span>${index+1}</span><span><b>${escapeHTML(item.front)}</b><small>#${escapeHTML(item.tag || "Không tag")}${item.lastRating ? ` · ${escapeHTML(item.lastRating)}` : ""}</small></span></button>`).join("")}</aside>
      </div>
    </section>`;
}

function renderProgress() {
  const periodData = {
    day: { labels: ["08h", "10h", "13h", "15h", "19h", "21h"], values: [42, 66, 30, 78, 92, 54], metric: ["3.2h", "5", "4", "82%"] },
    week: { labels: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"], values: [54, 72, 48, 88, 68, 36, 62], metric: ["12.5h", "18", "14", "76%"] },
    month: { labels: ["Tuần 1", "Tuần 2", "Tuần 3", "Tuần 4"], values: [58, 74, 82, 69], metric: ["48.6h", "72", "56", "79%"] },
    year: { labels: ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10"], values: [46, 55, 64, 58, 73, 78, 52, 68, 84, 72], metric: ["386h", "524", "318", "81%"] }
  };
  const data = periodData[state.progressPeriod] || periodData.week;
  const actions = `<div class="tabs"><button class="tab-button ${state.progressPeriod === "day" ? "active" : ""}" data-progress-period="day">Ngày</button><button class="tab-button ${state.progressPeriod === "month" ? "active" : ""}" data-progress-period="month">Tháng</button><button class="tab-button ${state.progressPeriod === "year" ? "active" : ""}" data-progress-period="year">Năm</button></div>`;
  return `${pageHead("Tiến độ học tập", "Toàn cảnh thời gian học, kết quả và thói quen của bạn.", actions)}
    <section class="progress-hero-grid">
      ${metricCard("Tổng thời gian học", data.metric[0], "+12% so với kỳ trước")}
      ${metricCard("Phiên Pomodoro", data.metric[1], "+8 phiên")}
      ${metricCard("Bài tập hoàn thành", data.metric[2], "Đúng hạn 93%")}
      ${metricCard("Hoàn thành kế hoạch", data.metric[3], "+5% cải thiện")}
    </section>
    <section class="progress-main-grid">
      <article class="card chart-card"><div class="card-head"><h2>Thời lượng học theo ${progressPeriodLabel()}</h2><span class="status-pill violet">Giờ tập trung</span></div><div class="bar-chart">${data.labels.map((label, i) => `<div class="bar-column" style="--bar:${data.values[i]}%" data-value="${Math.max(1, Math.round(data.values[i] / 20))}.${i % 4} giờ"><span>${label}</span></div>`).join("")}</div></article>
      <article class="card card-pad"><div class="card-head"><h2>Thói quen học tập</h2><span class="status-pill green">Ổn định</span></div><div class="habit-list">
        ${habit("Khung giờ hiệu quả nhất", "19:00–21:00", 88)}
        ${habit("Duy trì kế hoạch", "7 ngày liên tiếp", 76)}
        ${habit("Mức tập trung trung bình", "23 phút / phiên", 91)}
      </div><div class="heatmap">${Array.from({ length: 48 }, (_, i) => `<i class="heat ${i % 7 === 0 ? "l4" : i % 4 === 0 ? "l3" : i % 3 === 0 ? "l2" : ""}"></i>`).join("")}</div></article>
    </section>
    <article class="card subject-analysis"><div class="card-head"><h2>Tiến độ từng môn</h2><span class="card-link">AI phân tích điểm yếu</span></div><div class="subject-analysis-grid">
      ${subjectAnalysis("Lập trình Web", 82, "Tốt")}${subjectAnalysis("Cấu trúc dữ liệu", 68, "Cần ôn Stack")}${subjectAnalysis("Cơ sở dữ liệu", 74, "Ổn định")}${subjectAnalysis("Tiếng Anh", 61, "Cần luyện nghe")}
    </div></article>`;
}
function progressPeriodLabel() { return ({ day: "ngày", month: "tháng", year: "năm" })[state.progressPeriod] || "tuần"; }
function metricCard(label, value, detail) { return `<article class="card metric-card"><span>${label}</span><b>${value}</b><small>${detail}</small></article>`; }
function habit(label, value, progress) { return `<div class="habit-item"><div class="habit-top"><strong>${label}</strong><span>${value}</span></div><div class="progress-track"><i style="width:${progress}%"></i></div></div>`; }
function subjectAnalysis(name, value, note) { return `<div class="subject-analysis-item"><strong>${name}</strong><b>${value}%</b><div class="progress-track"><i style="width:${value}%"></i></div><span class="tiny muted">${note}</span></div>`; }

function renderPomodoro() {
  const timer = state.timer;
  const isFocus = timer.mode === "focus";
  const currentMinutes = isFocus ? timer.focusMinutes : timer.breakMinutes;
  const controls = timer.running
    ? `<button class="button secondary" type="button" data-pause-timer>${icon("i-pause")} Tạm dừng</button><button class="button danger" type="button" data-end-timer>${icon("i-stop")} Kết thúc</button>`
    : timer.paused
      ? `<button class="button primary" type="button" data-start-timer>${icon("i-play")} Tiếp tục</button><button class="button danger" type="button" data-end-timer>${icon("i-stop")} Kết thúc</button>`
      : `<button class="button primary" type="button" data-start-timer>${icon("i-play")} Bắt đầu</button>`;
  return `<section class="card pomo-board">
      <h1>Pomodoro</h1>
      <div class="tabs timer-mode"><button class="tab-button ${isFocus ? "active" : ""}" type="button" data-timer-mode="focus">Học ${timer.focusMinutes} phút</button><button class="tab-button ${!isFocus ? "active" : ""}" type="button" data-timer-mode="break">Nghỉ ${timer.breakMinutes} phút</button></div>
      <form class="pomo-settings" id="timerSettingsForm"><div><span>${icon("i-clock")}</span><label>Thời gian học<input name="focusMinutes" type="number" min="1" max="180" value="${timer.focusMinutes}" ${timer.running ? "disabled" : ""} /><small>phút</small></label><label>Thời gian nghỉ<input name="breakMinutes" type="number" min="1" max="60" value="${timer.breakMinutes}" ${timer.running ? "disabled" : ""} /><small>phút</small></label></div><button class="button secondary" type="submit" ${timer.running ? "disabled" : ""}>Áp dụng thời gian</button></form>
      <div class="pomo-current-mode"><span class="status-pill ${isFocus ? "violet" : "green"}">${isFocus ? "Phiên tập trung" : "Phiên nghỉ"}</span><b>${currentMinutes} phút</b></div>
      <div class="pomo-clock-wrap"><div class="timer-ring" id="timerRing"><div class="timer-display"><b id="timerText">${String(currentMinutes).padStart(2, "0")}:00</b><span>${icon("i-spark")}</span></div></div><img src="assets/fox-pomodoro.png" alt="Cáo UniStudy học theo Pomodoro" /></div>
      <p class="pomo-quote">Tập trung hôm nay để gần hơn với phiên bản tốt hơn của bạn!</p>
      <div class="timer-controls">${controls}</div>
      <div class="session-history"><div class="card-head"><h2>Lịch sử phiên học</h2></div><div class="session-table"><div class="session-row header"><span>Ngày</span><span>Môn học</span><span>Thời lượng</span><span>Trạng thái</span></div>${timer.history.map((item, index) => `<div class="session-row"><span>${index ? "16/09/2026" : "Hôm nay"}</span><strong>${item.subject}</strong><span>${item.duration}</span><span class="status-pill ${item.subject.includes("sớm") ? "red" : "green"}">${item.subject.includes("sớm") ? "Đã hủy" : "Hoàn thành"}</span></div>`).join("")}</div></div>
    </section>`;
}

function updateTimerDisplay() {
  const text = document.querySelector("#timerText");
  const ring = document.querySelector("#timerRing");
  if (!text || !ring) return;
  const minutes = String(Math.floor(state.timer.seconds / 60)).padStart(2, "0");
  const seconds = String(state.timer.seconds % 60).padStart(2, "0");
  text.textContent = `${minutes}:${seconds}`;
  const progress = ((state.timer.total - state.timer.seconds) / state.timer.total) * 100;
  ring.style.setProperty("--progress", `${progress}%`);
}

function startTimer() {
  if (state.timer.running) return;
  state.timer.running = true;
  state.timer.paused = false;
  render();
  state.timer.intervalId = setInterval(() => {
    state.timer.seconds -= 1;
    if (state.timer.seconds <= 0) {
      clearInterval(state.timer.intervalId);
      state.timer.running = false;
      state.timer.seconds = state.timer.total;
      const duration = Math.round(state.timer.total / 60);
      state.timer.history.unshift({ subject: state.timer.mode === "focus" ? "Phiên tập trung mới" : "Nghỉ giải lao", duration: `${duration} phút`, time: "Vừa xong" });
      showToast(`Bạn đã hoàn thành phiên ${state.timer.mode === "focus" ? "tập trung" : "nghỉ"} ${duration} phút!`);
      render();
      return;
    }
    updateTimerDisplay();
  }, 1000);
}

function pauseTimer() {
  clearInterval(state.timer.intervalId);
  state.timer.running = false;
  state.timer.paused = true;
  render();
}

function endTimer() {
  clearInterval(state.timer.intervalId);
  const studied = state.timer.total - state.timer.seconds;
  if (studied > 10) state.timer.history.unshift({ subject: "Phiên học kết thúc sớm", duration: `${Math.max(1, Math.round(studied / 60))} phút`, time: "Vừa xong" });
  state.timer.running = false;
  state.timer.paused = false;
  state.timer.seconds = state.timer.total;
  render();
  showToast("Đã kết thúc và lưu phiên học.");
}

function renderNotifications() {
  const filters = ["all", "unread", "read"];
  const labels = { all: "Tất cả", unread: "Chưa đọc", read: "Đã đọc" };
  const visible = state.notifications.filter(item => state.notificationFilter === "all" || (state.notificationFilter === "read" ? item.read : !item.read));
  const actions = `<div class="tabs">${filters.map(filter => `<button class="tab-button ${state.notificationFilter === filter ? "active" : ""}" data-notification-filter="${filter}">${labels[filter]}</button>`).join("")}</div>`;
  return `${pageHead("Thông báo", "Nội dung và thời gian của các cập nhật liên quan đến việc học.", actions)}
    <section class="card notification-page-list">
      ${visible.length ? visible.map(item => notificationRow(item)).join("") : `<div class="empty-state"><span class="empty-icon">${icon("i-bell")}</span><h3>Không có thông báo</h3><p>Danh sách này hiện đang trống.</p></div>`}
    </section>`;
}

function notificationRow(item) {
  const map = { deadline: "i-tasks", schedule: "i-calendar", school: "i-bell", study: "i-clock", quiz: "i-quiz" };
  return `<article class="notification-row ${item.read ? "" : "unread"}" data-read-notification="${item.id}"><span class="notification-type">${icon(map[item.type] || "i-bell")}</span><span class="notification-copy"><strong class="notification-title">${item.title}</strong><p>${item.body}</p></span><time class="notification-time">${item.time}</time></article>`;
}

function renderProfile() {
  return `${pageHead("Hồ sơ cá nhân", "Quản lý thông tin cá nhân và cài đặt đồng bộ thông báo.")}
    <section class="card profile-identity"><div class="profile-avatar-wrap"><img src="assets/fox-student-avatar.png" alt="Avatar cáo sinh viên CMC" /></div><div class="profile-info-table">${infoField("Họ tên", "Nguyễn Minh Anh")}${infoField("Mã sinh viên", "K65IT1234")}${infoField("Email CMC", "nguyenminhanh@cmcu.edu.vn")}${infoField("Ngành học", "Công nghệ thông tin")}${infoField("Khóa", "K65 (2025–2029)")}${infoField("Học kỳ hiện tại", "Học kỳ 1 · 2026–2027")}<div class="profile-actions"><button class="button primary" type="button" data-edit-profile>✎ Chỉnh sửa thông tin</button><button class="button danger" type="button" data-logout>${icon("i-logout")} Đăng xuất</button></div></div></section>
    <article class="card sync-card profile-sync"><div class="sync-title"><span class="sync-school-icon">${icon("i-cap")}</span><div><h2>Đồng bộ thông báo nhà trường</h2><p>Kết nối với các hệ thống của trường để nhận thông báo lịch học, lịch thi, thông tin môn học và các thông tin quan trọng khác.</p></div></div><div class="sync-workspace"><div><label>Chọn hệ thống cần đồng bộ</label><div class="sync-select-label">Đã chọn 4 hệ thống ${icon("i-chevron")}</div><div class="sync-options"><label class="sync-option"><input type="checkbox" id="syncAll" checked /> Chọn tất cả</label><label class="sync-option"><input class="sync-source" type="checkbox" checked /> iu.cmcu.edu.vn</label><label class="sync-option"><input class="sync-source" type="checkbox" checked /> edux.cmcu.edu.vn</label><label class="sync-option"><input class="sync-source" type="checkbox" checked /> lms.cmcu.edu.vn</label><label class="sync-option"><input class="sync-source" type="checkbox" checked /> elearning.cmcu.edu.vn</label></div></div><div class="sync-side"><span>${icon("i-clock")} Lần đồng bộ gần nhất:<b>Hôm nay, 09:18</b></span><div><button class="button secondary" type="button">Lưu lựa chọn</button><button class="button primary" type="button" data-sync-now>${icon("i-refresh")} Đồng bộ ngay</button></div></div></div></article>`;
}
function infoField(label, value) { return `<div class="info-field"><span>${label}</span><strong>${value}</strong></div>`; }

function filterDocuments() {
  const query = (document.querySelector("#documentSearch")?.value || "").trim().toLowerCase();
  const subject = document.querySelector("#documentSubject")?.value || "";
  const type = document.querySelector("#documentType")?.value || "";
  document.querySelectorAll("[data-doc-card]").forEach(card => {
    const matchQuery = !query || card.dataset.title.includes(query);
    const matchSubject = !subject || card.dataset.subject === subject;
    const matchType = !type || card.dataset.type === type;
    card.hidden = !(matchQuery && matchSubject && matchType);
  });
}

function navigate(view) {
  openWorkspaceTab(view);
}

document.addEventListener("click", event => {
  const target = event.target.closest("button, [data-view], [data-sidebar-view], [data-action], [data-workspace-tab], [data-close-tab], [data-open-tab], [data-open-tab-picker], [data-close-tab-picker], [data-read-notification], [data-flip-card], [data-close-progress], [data-close-study-scheduler], [data-close-exam-plan]");
  if (!target) return;
  if (target.matches(".study-scheduler-backdrop") && event.target !== target) return;

  if (target.matches("[data-start-preview]")) {
    resetDataSyncPreview();
    state.screen = "app";
    state.view = "dashboard";
    state.openTabs = ["dashboard"];
    persistWorkspaceTabs();
    render();
    return;
  }
  if (target.dataset.previewView) {
    if (state.screen === "landing") resetDataSyncPreview();
    state.screen = "app";
    navigate(target.dataset.previewView);
    return;
  }
  if (target.matches("[data-sync-demo], [data-open-sync], [data-open-sync-page]")) { openSyncSetup(); return; }
  if (target.matches("[data-confirm-sync]")) {
    const selectedSources = document.querySelectorAll(".sync-source:checked").length;
    if (!selectedSources) { showToast("Hãy chọn ít nhất một nguồn dữ liệu để đồng bộ."); return; }
    completeDataSync();
    return;
  }
  if (target.matches("[data-open-login]")) { showSyncPrompt(); return; }
  if (target.matches("[data-go-login]")) { showSyncPrompt(); return; }
  if (target.matches("[data-back-landing]")) { state.screen = "landing"; render(); return; }
  if (target.matches("[data-guest-feature]")) { state.screen = "app"; render(); return; }
  if (target.matches("[data-close-modal]")) { closeModal(authModal); return; }
  if (target.matches("[data-modal-login]")) { completeDataSync(); return; }
  if (target.matches("[data-close-task]")) { state.editingTaskId = null; closeModal(taskModal); return; }
  if (!state.isLoggedIn && target.matches("[data-open-task], [data-toggle-progress], [data-open-study-scheduler], [data-open-exam-plan], [data-start-timer], [data-pause-timer], [data-end-timer], [data-edit-profile]")) { showSyncPrompt(); return; }
  if (target.matches("[data-open-task]")) { openTaskEditor(); return; }
  if (target.matches("[data-forgot-password]")) { showToast("Đường dẫn đặt lại mật khẩu đã được mô phỏng gửi tới email của bạn."); return; }
  if (target.matches("[data-student-sso]")) {
    completeDataSync();
    return;
  }
  if (target.matches("[data-toggle-menu]")) { state.mobileOpen = !state.mobileOpen; document.querySelector("#sidebar")?.classList.toggle("open", state.mobileOpen); return; }
  if (target.matches("[data-toggle-progress]")) { state.progressPanelOpen = !state.progressPanelOpen; render(); return; }
  if (target.matches("[data-close-progress]")) { state.progressPanelOpen = false; render(); return; }
  if (target.matches("[data-toggle-mini-chat]")) {
    state.miniChatOpen = !state.miniChatOpen;
    render();
    if (state.miniChatOpen) requestAnimationFrame(() => document.querySelector("#miniChatForm input")?.focus());
    return;
  }
  if (target.dataset.miniChatPrompt) { submitMiniChatMessage(target.dataset.miniChatPrompt); return; }
  if (target.dataset.sidebarView) { switchCurrentWorkspaceView(target.dataset.sidebarView); return; }
  if (target.dataset.workspaceTab) { navigate(target.dataset.workspaceTab); return; }
  if (target.dataset.closeTab) { closeWorkspaceTab(target.dataset.closeTab); return; }
  if (target.matches("[data-open-tab-picker]")) { state.tabMenuOpen = true; render(); return; }
  if (target.matches("[data-close-tab-picker]")) { state.tabMenuOpen = false; render(); return; }
  if (target.matches("[data-open-tab-menu]")) { state.tabMenuOpen = !state.tabMenuOpen; render(); return; }
  if (target.dataset.openTab) { navigate(target.dataset.openTab); return; }
  if (target.matches("[data-new-tab]")) { openNextWorkspaceTab(); return; }
  if (target.dataset.view) { navigate(target.dataset.view); return; }
  if (target.dataset.scheduleMode) { state.scheduleMode = target.dataset.scheduleMode; render(); return; }
  if (target.dataset.scheduleNav) {
    const direction = Number(target.dataset.scheduleNav);
    const selected = parseScheduleDate(state.scheduleSelectedDate);
    if (state.scheduleMode === "month") selected.setMonth(selected.getMonth() + direction, 1);
    else selected.setDate(selected.getDate() + direction * (state.scheduleMode === "week" ? 7 : 1));
    state.scheduleSelectedDate = scheduleDateISO(selected);
    render();
    return;
  }
  if (target.matches("[data-schedule-today]")) { state.scheduleSelectedDate = scheduleDateISO(new Date()); render(); return; }
  if (target.dataset.scheduleDate) { state.scheduleSelectedDate = target.dataset.scheduleDate; state.scheduleMode = "day"; render(); return; }
  if (target.matches("[data-open-study-scheduler]")) { state.studySchedulerOpen = true; render(); requestAnimationFrame(() => document.querySelector("#studyScheduleForm input[name='date']")?.focus()); return; }
  if (target.matches("[data-close-study-scheduler]")) { state.studySchedulerOpen = false; render(); return; }
  if (target.dataset.resolveConflict) {
    const studyEvent = state.studyEvents.find(item => item.id === Number(target.dataset.studyEvent));
    if (!studyEvent) return;
    if (target.dataset.resolveConflict === "study") {
      const schoolEvents = getSchoolConflicts(studyEvent);
      studyEvent.replacedSchoolEventIds = schoolEvents.map(item => item.id);
      state.hiddenSchoolEventIds = [...new Set([...state.hiddenSchoolEventIds, ...schoolEvents.map(item => item.id)])];
      studyEvent.conflict = false;
      persistStudyWorkspace();
      render();
      showToast(`Đã giữ lịch tự học và loại ${schoolEvents.length} lịch trên lớp bị trùng.`);
    } else {
      state.studyEvents = state.studyEvents.filter(item => item.id !== studyEvent.id);
      persistStudyWorkspace();
      render();
      showToast("Đã giữ lịch trên lớp và xóa lịch tự học bị trùng.");
    }
    return;
  }
  if (target.dataset.deleteStudyEvent) {
    const id = Number(target.dataset.deleteStudyEvent);
    const studyEvent = state.studyEvents.find(item => item.id === id);
    if (studyEvent && window.confirm(`Xóa lịch tự học “${studyEvent.title}” lúc ${studyEvent.start}–${studyEvent.end}?`)) {
      if (Array.isArray(studyEvent.replacedSchoolEventIds)) state.hiddenSchoolEventIds = state.hiddenSchoolEventIds.filter(schoolId => !studyEvent.replacedSchoolEventIds.includes(schoolId));
      state.studyEvents = state.studyEvents.filter(item => item.id !== id);
      persistStudyWorkspace();
      render();
      showToast("Đã xóa lịch tự học khỏi thời khóa biểu.");
    }
    return;
  }
  if (target.dataset.taskFilter) { state.taskFilter = target.dataset.taskFilter; state.expandedTaskId = null; render(); return; }
  if (target.dataset.toggleTask) {
    const task = state.tasks.find(item => item.id === Number(target.dataset.toggleTask));
    if (task) {
      task.done = !task.done;
      task.status = task.done ? "Hoàn thành" : "Đang làm";
      task.progress = task.done ? 100 : Math.max(50, task.progress || 0);
      task.remaining = task.done ? "Đã nộp" : `${task.daysLeft || 1} ngày`;
      state.expandedTaskId = task.done ? null : task.id;
    }
    render(); return;
  }
  if (target.dataset.deleteTask) {
    const id = Number(target.dataset.deleteTask);
    const task = state.tasks.find(item => item.id === id);
    if (task && window.confirm(`Xóa công việc “${task.title}”?`)) {
      state.tasks = state.tasks.filter(item => item.id !== id);
      if (state.expandedTaskId === id) state.expandedTaskId = null;
      render(); showToast("Đã xóa công việc khỏi danh sách.");
    }
    return;
  }
  if (target.dataset.editTask) { const task = state.tasks.find(item => item.id === Number(target.dataset.editTask)); if (task) openTaskEditor(task); return; }
  if (target.matches("[data-upload-doc]")) { showToast("Bạn có thể kéo thả PDF, PPTX hoặc DOCX vào kho tài liệu."); return; }
  if (target.matches("[data-open-doc]")) { showToast("Đang mở bản xem trước tài liệu offline..."); return; }
  if (target.dataset.prompt) {
    const field = document.querySelector("#chatForm textarea");
    if (field) { field.value = target.dataset.prompt; field.focus(); }
    return;
  }
  if (target.dataset.aiFeature) { runAIFeature(target.dataset.aiFeature); return; }
  if (target.matches("[data-new-chat]")) { state.messages = [state.messages[0]]; state.aiFeature = "chat"; render(); showToast("Đã tạo cuộc trò chuyện mới."); return; }
  if (target.matches("[data-attach-doc]")) { showToast("Chọn slide, PDF hoặc tài liệu để AI tóm tắt và giải thích."); return; }
  if (target.dataset.conversation) { showToast(`Đã mở hội thoại: ${target.dataset.conversation}`); return; }
  if (target.matches("[data-regenerate-plan]")) { showToast("AI đang cân đối lại kế hoạch theo dữ liệu mới nhất."); return; }
  if (target.matches("[data-apply-plan]")) { showToast("Đã áp dụng 3 thay đổi vào kế hoạch tuần."); return; }
  if (target.matches("[data-open-exam-plan], [data-exam-optimize]")) { state.examPlanOpen = true; render(); requestAnimationFrame(() => document.querySelector("#examPlanForm input[name='subject']")?.focus()); return; }
  if (target.matches("[data-close-exam-plan]")) { state.examPlanOpen = false; render(); return; }
  if (target.matches("[data-sync-exams]")) {
    const syncedExams = [
      { id: 4901, subject: "Mạng máy tính", code: "NET201", date: "2026-11-02", start: "08:00", duration: 90, room: "C402", scope: "Chương 1–7 và bài tập mô hình OSI", source: "CMC" },
      { id: 4902, subject: "Kỹ thuật phần mềm", code: "SWE201", date: "2026-11-06", start: "13:30", duration: 120, room: "B305", scope: "UML, quy trình phát triển và kiểm thử", source: "CMC" }
    ];
    const newExams = syncedExams.filter(exam => !state.exams.some(item => item.id === exam.id));
    state.exams.push(...newExams);
    persistStudyWorkspace();
    render();
    showToast(newExams.length ? `Đã đồng bộ ${newExams.length} lịch thi mới từ hệ thống CMC.` : "Lịch thi CMC đã được cập nhật mới nhất.");
    return;
  }
  if (target.dataset.deleteExam) {
    const exam = state.exams.find(item => item.id === Number(target.dataset.deleteExam));
    if (exam && window.confirm(`Xóa kỳ thi “${exam.subject}” khỏi kế hoạch?`)) {
      state.exams = state.exams.filter(item => item.id !== exam.id);
      persistStudyWorkspace();
      render();
      showToast("Đã xóa kỳ thi khỏi kế hoạch.");
    }
    return;
  }
  if (target.dataset.quizStage) { state.quizStage = target.dataset.quizStage; render(); return; }
  if (target.dataset.deleteQuizHistory) {
    const item = state.quizHistory.find(entry => entry.id === Number(target.dataset.deleteQuizHistory));
    if (item && window.confirm(`Xóa bộ Quiz “${item.title}” và kết quả đã lưu?`)) {
      state.quizHistory = state.quizHistory.filter(entry => entry.id !== item.id);
      if (state.quizResult?.id === item.id) state.quizResult = null;
      persistStudyWorkspace();
      render();
      showToast("Đã xóa bộ Quiz khỏi lịch sử.");
    }
    return;
  }
  if (target.dataset.openQuizHistory) {
    const item = state.quizHistory.find(entry => entry.id === Number(target.dataset.openQuizHistory));
    if (item) { state.quizResult = { ...item, questions: [], answers: {} }; state.quizStage = "result"; render(); }
    return;
  }
  if (target.dataset.retryQuizHistory) {
    const item = state.quizHistory.find(entry => entry.id === Number(target.dataset.retryQuizHistory));
    if (item) {
      state.quizConfig = { title: item.title, subject: item.subject, fileName: item.fileName, count: item.count, difficulty: item.difficulty };
      state.quizQuestions = buildQuizQuestions(item.subject, item.count);
      state.quizAnswers = {}; state.quizCurrent = 0; state.quizStage = "attempt"; render();
    }
    return;
  }
  if (target.matches("[data-retry-current-quiz]")) { state.quizQuestions = buildQuizQuestions(state.quizConfig.subject, state.quizConfig.count); state.quizAnswers = {}; state.quizCurrent = 0; state.quizStage = "attempt"; render(); return; }
  if (target.matches("[data-abandon-quiz]")) { state.quizStage = "overview"; render(); return; }
  if (target.dataset.answer !== undefined) {
    const question = state.quizQuestions[state.quizCurrent];
    if (question) state.quizAnswers[question.id] = Number(target.dataset.answer);
    render(); return;
  }
  if (target.matches("[data-quiz-prev]")) { state.quizCurrent = Math.max(0, state.quizCurrent - 1); render(); return; }
  if (target.matches("[data-quiz-next]")) { state.quizCurrent = Math.min(state.quizQuestions.length - 1, state.quizCurrent + 1); render(); return; }
  if (target.dataset.quizJump !== undefined) { state.quizCurrent = Number(target.dataset.quizJump); render(); return; }
  if (target.matches("[data-mark-question]")) { showToast(`Đã đánh dấu câu ${state.quizCurrent + 1} để xem lại.`); return; }
  if (target.matches("[data-submit-quiz]")) {
    const answered = Object.keys(state.quizAnswers).length;
    if (!answered) { showToast("Hãy trả lời ít nhất một câu trước khi nộp bài."); return; }
    const score = state.quizQuestions.reduce((sum, question) => sum + (state.quizAnswers[question.id] === question.correct ? 1 : 0), 0);
    const now = new Date();
    const date = `${now.toLocaleDateString("vi-VN")} · ${now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`;
    const result = { id: Date.now(), ...state.quizConfig, score, date, questions: state.quizQuestions, answers: { ...state.quizAnswers } };
    state.quizResult = result;
    state.quizHistory.unshift({ id: result.id, title: result.title, subject: result.subject, fileName: result.fileName, count: result.count, difficulty: result.difficulty, score: result.score, date: result.date });
    persistStudyWorkspace();
    state.quizStage = "result"; render(); return;
  }
  if (target.matches("[data-create-flash-deck]")) { state.flashStage = "create-deck"; state.activeFlashDeckId = null; render(); return; }
  if (target.dataset.flashStage) { state.flashStage = target.dataset.flashStage; if (state.flashStage === "library") state.activeFlashDeckId = null; state.flashFlipped = false; render(); return; }
  if (target.dataset.manageDeck) { state.activeFlashDeckId = Number(target.dataset.manageDeck); state.flashStage = "manage"; state.flashFlipped = false; render(); return; }
  if (target.matches("[data-ai-flash]")) {
    const deck = { id: Date.now(), name: "Bộ thẻ AI từ tài liệu", subject: "Cấu trúc dữ liệu", description: "6 thẻ được AI tạo để bạn kiểm tra và bổ sung", color: "violet", progress: 0, updated: "Vừa tạo", cards: [
      { id: Date.now()+1, front: "Stack hoạt động theo nguyên tắc nào?", back: "LIFO – vào sau, ra trước.", tag: "Stack" },
      { id: Date.now()+2, front: "Queue hoạt động theo nguyên tắc nào?", back: "FIFO – vào trước, ra trước.", tag: "Queue" },
      { id: Date.now()+3, front: "Hash Table dùng thành phần nào để xác định vị trí?", back: "Hàm băm (hash function).", tag: "Hash Table" }
    ] };
    state.flashDecks.unshift(deck); state.activeFlashDeckId = deck.id; state.flashStage = "manage"; persistStudyWorkspace(); render(); showToast("AI đã tạo bộ thẻ mẫu. Bạn có thể thêm hoặc xóa từng thẻ."); return;
  }
  if (target.matches("[data-flip-card]")) { state.flashFlipped = !state.flashFlipped; target.classList.toggle("flipped", state.flashFlipped); return; }
  if (target.dataset.cardRating) {
    const deck = getActiveFlashDeck();
    const card = deck?.cards[state.flashIndex];
    const labels = { hard: "Khó nhớ", review: "Cần ôn lại", known: "Đã nhớ" };
    if (card) card.lastRating = labels[target.dataset.cardRating];
    if (deck && target.dataset.cardRating === "known") deck.progress = Math.min(100, deck.progress + Math.ceil(100 / Math.max(1, deck.cards.length)));
    if (deck) state.flashIndex = (state.flashIndex + 1) % deck.cards.length;
    state.flashFlipped = false; persistStudyWorkspace(); render(); showToast("Đã lưu mức độ ghi nhớ cho thẻ này."); return;
  }
  if (target.dataset.flashNav) { const deck = getActiveFlashDeck(); if (!deck?.cards.length) return; const delta = target.dataset.flashNav === "next" ? 1 : -1; state.flashIndex = (state.flashIndex + delta + deck.cards.length) % deck.cards.length; state.flashFlipped = false; render(); return; }
  if (target.dataset.flashIndex !== undefined) { state.flashIndex = Number(target.dataset.flashIndex); state.flashFlipped = false; render(); return; }
  if (target.dataset.startDeck) { const deck = state.flashDecks.find(item => item.id === Number(target.dataset.startDeck)); if (!deck?.cards.length) { showToast("Bộ thẻ chưa có nội dung. Hãy thêm ít nhất một thẻ."); return; } state.activeFlashDeckId = deck.id; state.flashStage = "review"; state.flashIndex = 0; state.flashFlipped = false; render(); showToast(`Bắt đầu ôn bộ thẻ ${deck.name}.`); return; }
  if (target.dataset.deleteFlashCard) { const deck = getActiveFlashDeck(); const card = deck?.cards.find(item => item.id === Number(target.dataset.deleteFlashCard)); if (deck && card && window.confirm(`Xóa thẻ “${card.front}”?`)) { deck.cards = deck.cards.filter(item => item.id !== card.id); persistStudyWorkspace(); render(); showToast("Đã xóa thẻ khỏi bộ."); } return; }
  if (target.dataset.progressPeriod) { state.progressPeriod = target.dataset.progressPeriod; render(); return; }
  if (target.matches("[data-start-timer]")) { startTimer(); return; }
  if (target.matches("[data-pause-timer]")) { pauseTimer(); return; }
  if (target.matches("[data-end-timer]")) { endTimer(); return; }
  if (target.dataset.timerMode) {
    if (state.timer.running) { showToast("Hãy tạm dừng hoặc kết thúc phiên trước khi đổi chế độ."); return; }
    state.timer.mode = target.dataset.timerMode;
    state.timer.total = (state.timer.mode === "focus" ? state.timer.focusMinutes : state.timer.breakMinutes) * 60;
    state.timer.seconds = state.timer.total;
    state.timer.paused = false;
    render(); return;
  }
  if (target.dataset.notificationFilter) { state.notificationFilter = target.dataset.notificationFilter; render(); return; }
  if (target.dataset.readNotification) {
    const notification = state.notifications.find(item => item.id === Number(target.dataset.readNotification));
    if (notification) notification.read = true;
    render(); return;
  }
  if (target.matches("[data-sync-now]")) { showToast("Đồng bộ thành công 4 nguồn thông báo của CMC."); return; }
  if (target.matches("[data-edit-profile]")) { showToast("Chế độ chỉnh sửa hồ sơ đã được bật."); return; }
  if (target.matches("[data-logout]")) {
    resetDataSyncPreview();
    state.screen = "landing";
    state.view = "dashboard";
    state.openTabs = ["dashboard"];
    persistWorkspaceTabs();
    render();
    showToast("Đã đăng xuất. Bạn đã quay về trang giới thiệu.");
  }
});

document.addEventListener("submit", event => {
  event.preventDefault();

  if (event.target.id === "loginForm") {
    const data = new FormData(event.target);
    const account = String(data.get("account") || "").trim();
    const password = String(data.get("password") || "");
    const error = document.querySelector("#loginError");
    if (!account || !password) { error.textContent = "Vui lòng nhập đầy đủ tài khoản và mật khẩu."; return; }
    if (password.length < 4) { error.textContent = "Mật khẩu không chính xác. Vui lòng kiểm tra lại."; return; }
    completeDataSync();
    return;
  }

  if (event.target.id === "taskForm") {
    const data = new FormData(event.target);
    const status = String(data.get("status") || "Chưa làm");
    const dueInput = String(data.get("due") || "");
    const payload = {
      title: String(data.get("title") || "Công việc mới").trim(),
      subject: String(data.get("subject") || "Khác"),
      due: formatTaskDue(dueInput),
      dueInput,
      priority: String(data.get("priority") || "Trung bình"),
      status,
      done: status === "Hoàn thành"
    };
    const existing = state.tasks.find(task => task.id === state.editingTaskId);
    if (existing) {
      Object.assign(existing, payload, { progress: payload.done ? 100 : existing.progress || 0, remaining: payload.done ? "Đã nộp" : existing.remaining || "7 ngày" });
      state.expandedTaskId = payload.done ? null : existing.id;
    } else {
      const task = { id: Date.now(), ...payload, daysLeft: 7, remaining: payload.done ? "Đã nộp" : "7 ngày", progress: payload.done ? 100 : status === "Đang làm" ? 30 : 0 };
      state.tasks.unshift(task);
      state.expandedTaskId = task.done ? null : task.id;
    }
    closeModal(taskModal);
    event.target.reset();
    const wasEditing = Boolean(state.editingTaskId);
    state.editingTaskId = null;
    if (state.screen === "app" && state.view === "tasks") render();
    showToast(wasEditing ? "Đã lưu thay đổi công việc." : "Đã thêm công việc mới.");
    return;
  }

  if (event.target.id === "studyScheduleForm") {
    const data = new FormData(event.target);
    const date = String(data.get("date") || "");
    const start = String(data.get("start") || "");
    const end = String(data.get("end") || "");
    if (!date || !start || !end || end <= start) { showToast("Giờ kết thúc phải muộn hơn giờ bắt đầu."); return; }
    const conflict = hasSchoolConflict(date, start, end);
    state.studyEvents.push({ id: Date.now(), date, start, end, title: String(data.get("title") || "Buổi tự học").trim(), subject: String(data.get("subject") || "Khác"), note: String(data.get("note") || "Tự xếp").trim(), conflict });
    persistStudyWorkspace();
    state.studySchedulerOpen = false;
    state.scheduleSelectedDate = date;
    state.scheduleMode = "week";
    render();
    showToast(conflict ? "Đã thêm lịch bị trùng. Hãy chọn lịch tự học hoặc lịch trên lớp để giữ lại." : "Đã thêm lịch tự học màu xanh lá vào thời khóa biểu.");
    return;
  }

  if (event.target.id === "examPlanForm") {
    const data = new FormData(event.target);
    const date = String(data.get("date") || "");
    const start = String(data.get("start") || "");
    if (!date || !start) { showToast("Hãy nhập đầy đủ ngày và giờ thi."); return; }
    const exam = {
      id: Date.now(),
      subject: String(data.get("subject") || "Môn học mới").trim(),
      code: String(data.get("code") || "").trim(),
      date,
      start,
      duration: Number(data.get("duration")) || 90,
      room: String(data.get("room") || "Chưa có phòng").trim(),
      scope: String(data.get("scope") || "Đang cập nhật").trim(),
      source: String(data.get("source") || "Tự thêm")
    };
    state.exams.push(exam);
    state.examPlanOpen = false;
    persistStudyWorkspace();
    render();
    showToast(`Đã thêm kỳ thi ${exam.subject} và cập nhật lộ trình ôn thi.`);
    return;
  }

  if (event.target.id === "quizConfigForm") {
    const data = new FormData(event.target);
    if (!state.quizConfig.fileName) { showToast("Hãy tải lên một tài liệu trước khi tạo Quiz."); return; }
    const title = String(data.get("title") || "").trim() || state.quizConfig.fileName.replace(/\.[^.]+$/, "");
    const subject = String(data.get("subject") || "Khác");
    const count = Number(data.get("count")) || 10;
    const difficulty = String(data.get("difficulty") || "Trung bình");
    state.quizConfig = { ...state.quizConfig, title, subject, count, difficulty };
    state.quizQuestions = buildQuizQuestions(subject, count);
    state.quizAnswers = {};
    state.quizCurrent = 0;
    state.quizStage = "attempt";
    render();
    showToast(`AI đã tạo ${count} câu hỏi mức ${difficulty} từ tài liệu.`);
    return;
  }

  if (event.target.id === "flashDeckForm") {
    const data = new FormData(event.target);
    const deck = { id: Date.now(), name: String(data.get("name") || "Bộ thẻ mới").trim(), subject: String(data.get("subject") || "Khác"), description: String(data.get("description") || "").trim(), color: String(data.get("color") || "violet"), progress: 0, updated: "Vừa tạo", cards: [] };
    state.flashDecks.unshift(deck);
    persistStudyWorkspace();
    state.activeFlashDeckId = deck.id;
    state.flashStage = "manage";
    state.flashIndex = 0;
    state.flashFlipped = false;
    render();
    requestAnimationFrame(() => document.querySelector("#flashcardForm textarea")?.focus());
    showToast("Đã tạo bộ thẻ. Bây giờ hãy thêm từng thẻ vào bộ.");
    return;
  }

  if (event.target.id === "timerSettingsForm") {
    const data = new FormData(event.target);
    const focusMinutes = Math.min(180, Math.max(1, Number(data.get("focusMinutes")) || 25));
    const breakMinutes = Math.min(60, Math.max(1, Number(data.get("breakMinutes")) || 5));
    state.timer.focusMinutes = focusMinutes;
    state.timer.breakMinutes = breakMinutes;
    state.timer.total = (state.timer.mode === "focus" ? focusMinutes : breakMinutes) * 60;
    state.timer.seconds = state.timer.total;
    state.timer.running = false;
    state.timer.paused = false;
    render();
    showToast(`Đã đặt Pomodoro: học ${focusMinutes} phút, nghỉ ${breakMinutes} phút.`);
    return;
  }

  if (event.target.id === "chatForm") {
    const data = new FormData(event.target);
    const message = String(data.get("message") || "").trim();
    if (!message) return;
    state.messages.push({ role: "user", text: message });
    state.messages.push({ role: "assistant", text: "Mình đã xem lịch và deadline của bạn. Chiều mai bạn trống 14:00–17:30; mình đề xuất 14:00–14:50 ôn Cấu trúc dữ liệu, nghỉ 10 phút, sau đó 15:00–16:00 hoàn thiện bài Lập trình Web." });
    render();
    requestAnimationFrame(() => {
      const messages = document.querySelector("#chatMessages");
      if (messages) messages.scrollTop = messages.scrollHeight;
    });
    return;
  }

  if (event.target.id === "miniChatForm") {
    const data = new FormData(event.target);
    submitMiniChatMessage(data.get("message"));
    return;
  }

  if (event.target.id === "flashcardForm") {
    const data = new FormData(event.target);
    const deck = getActiveFlashDeck();
    if (!deck) { state.flashStage = "library"; render(); return; }
    const card = { id: Date.now(), front: String(data.get("front") || "").trim(), back: String(data.get("back") || "").trim(), tag: String(data.get("tag") || "Thẻ mới").trim() || "Thẻ mới" };
    deck.cards.push(card);
    deck.updated = "Vừa xong";
    persistStudyWorkspace();
    event.target.reset();
    render();
    requestAnimationFrame(() => document.querySelector("#flashCreatePanel textarea")?.focus());
    showToast(`Đã thêm thẻ vào bộ “${deck.name}”.`);
    return;
  }
});

document.addEventListener("input", event => {
  if (["documentSearch", "documentSubject", "documentType"].includes(event.target.id)) filterDocuments();
  if (event.target.id === "flashDeckSearch") {
    const query = event.target.value.trim().toLowerCase();
    document.querySelectorAll("[data-flash-deck-card]").forEach(card => { card.hidden = Boolean(query) && !card.dataset.search.includes(query); });
  }
});
document.addEventListener("change", event => {
  if (["documentSubject", "documentType"].includes(event.target.id)) filterDocuments();
  if (event.target.id === "taskSubjectFilter") { state.taskSubjectFilter = event.target.value; render(); }
  if (event.target.id === "taskStatusFilter") { state.taskStatusFilter = event.target.value; render(); }
  if (event.target.id === "taskPriorityFilter") { state.taskPriorityFilter = event.target.value; render(); }
  if (event.target.id === "syncAll") document.querySelectorAll(".sync-source").forEach(input => { input.checked = event.target.checked; });
  if (event.target.classList?.contains("sync-source")) {
    const syncAll = document.querySelector("#syncAll");
    const sources = [...document.querySelectorAll(".sync-source")];
    if (syncAll && sources.length) syncAll.checked = sources.every(input => input.checked);
  }
  if (["quizFileInput", "quizOverviewFileInput"].includes(event.target.id)) {
    const file = event.target.files?.[0];
    if (!file) return;
    state.quizConfig.fileName = file.name;
    if (!state.quizConfig.title) state.quizConfig.title = file.name.replace(/\.[^.]+$/, "");
    state.quizStage = "create";
    render();
    showToast(`Đã chọn tài liệu ${file.name}.`);
  }
});

document.addEventListener("keydown", event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    document.querySelector("#globalSearch")?.focus();
  }
  if (event.key === "Escape") {
    closeModal(authModal);
    closeModal(taskModal);
    if (state.progressPanelOpen || state.studySchedulerOpen || state.examPlanOpen || state.tabMenuOpen) { state.progressPanelOpen = false; state.studySchedulerOpen = false; state.examPlanOpen = false; state.tabMenuOpen = false; render(); }
  }
});

authModal.addEventListener("click", event => { if (event.target === authModal) closeModal(authModal); });
taskModal.addEventListener("click", event => { if (event.target === taskModal) { state.editingTaskId = null; closeModal(taskModal); } });

function registerWebMCP() {
  const context = document.modelContext;
  if (!context?.registerTool) return;
  const lifecycle = new AbortController();
  const register = tool => Promise.resolve(context.registerTool(tool, { signal: lifecycle.signal })).catch(() => {});

  register({
    name: "navigate_unistudy_section",
    title: "Mở khu vực UniStudy",
    description: "Điều hướng bản mô phỏng đến một khu vực học tập cụ thể.",
    inputSchema: { type: "object", properties: { section: { type: "string", enum: Object.keys(viewMeta) } }, required: ["section"], additionalProperties: false },
    annotations: { readOnlyHint: true, untrustedContentHint: false },
    execute(input) {
      if (!viewMeta[input?.section]) throw new Error("Khu vực không hợp lệ");
      if (state.screen !== "app") state.screen = "app";
      navigate(input.section);
      return { section: input.section, title: viewMeta[input.section][0] };
    }
  });

  register({
    name: "add_study_task",
    title: "Thêm công việc học tập",
    description: "Thêm một công việc mới vào danh sách Công việc & Deadline đang hiển thị.",
    inputSchema: {
      type: "object",
      properties: { title: { type: "string", minLength: 1 }, subject: { type: "string" }, priority: { type: "string", enum: ["Cao", "Trung bình", "Thấp"] } },
      required: ["title"], additionalProperties: false
    },
    annotations: { readOnlyHint: false, untrustedContentHint: true },
    execute(input) {
      if (!input || typeof input.title !== "string" || !input.title.trim()) throw new Error("Tên công việc là bắt buộc");
      const task = { id: Date.now(), title: input.title.trim(), subject: input.subject || "Khác", due: "Mới thêm", dueInput: "", daysLeft: 7, remaining: "7 ngày", priority: input.priority || "Trung bình", status: "Chưa làm", progress: 0, done: false };
      state.tasks.unshift(task);
      state.screen = "app";
      if (!state.openTabs.includes("tasks")) state.openTabs.push("tasks");
      state.view = "tasks";
      persistWorkspaceTabs();
      render();
      return { id: task.id, title: task.title, status: "created" };
    }
  });
}

render();
registerWebMCP();
