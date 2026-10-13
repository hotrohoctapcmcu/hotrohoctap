/**
 * UniStudy CMC - Landing Page View
 * Khôi phục chuẩn xác theo demo gốc và references/01_trang_mo_dau.png
 */
import { ASSETS } from "../../shared/config/assets.js";
import { EXTERNAL_LINKS } from "../../shared/config/links.js";

export function renderLandingView() {
  return `
    <main class="landing">
      <!-- Header -->
      <header class="landing-top">
        <div class="brand">
          <div class="brand-mark">
            <svg><use href="#i-cap"></use></svg>
          </div>
          <div class="brand-copy">
            <span>UniStudy</span>
            <small>CMC UNIVERSITY</small>
          </div>
        </div>
      </header>

      <!-- Main Section 2 cột -->
      <div class="landing-main">
        <!-- Cột trái: Giới thiệu & Hành động -->
        <section class="landing-copy">
          <span class="landing-kicker">
            <svg><use href="#i-cap"></use></svg>
            <span>Nền tảng đồng hành cùng sinh viên <b>CMC University</b></span>
          </span>
          <h1>Học thông minh hơn<br><span>cùng UniStudy</span></h1>
          <p>
            Một không gian duy nhất để quản lý lịch học, deadline, tài liệu và được hỗ trợ bởi Trợ lý AI — 
            giúp bạn học tập hiệu quả và chủ động hơn mỗi ngày.
          </p>

          <div class="landing-actions">
            <button class="button primary" type="button" id="landingExperienceBtn">
              <span>Trải nghiệm bản xem trước</span>
              <svg><use href="#i-arrow"></use></svg>
            </button>
            <a class="button ghost" href="${EXTERNAL_LINKS.videoIntro}" target="_blank" rel="noopener noreferrer" id="landingVideoBtn">
              <svg><use href="#i-play"></use></svg>
              <span>Xem cách hoạt động</span>
            </a>
          </div>
        </section>

        <!-- Cột phải: Product Preview Window (Mockup có thể click mở video YouTube) -->
        <a class="product-preview video-preview-link" href="${EXTERNAL_LINKS.videoIntro}" target="_blank" rel="noopener noreferrer" aria-label="Mở video giới thiệu UniStudy trên YouTube">
          <div class="preview-window">
            <div class="preview-browser">
              <div class="preview-body">
                <!-- Mini Sidebar -->
                <aside class="preview-mini-sidebar">
                  <div class="preview-mini-logo">
                    <svg><use href="#i-cap"></use></svg>
                  </div>
                  <div class="preview-mini-nav">
                    <span class="active"></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </aside>

                <!-- Content Area -->
                <div class="preview-content">
                  <div class="preview-heading">
                    <span class="preview-search"></span>
                    <b>Nguyễn Minh Anh</b>
                  </div>
                  <div class="preview-dashboard-title">
                    <b>Trung tâm thông báo</b>
                    <span>Cập nhật nhanh những gì quan trọng trong tuần</span>
                  </div>

                  <div class="preview-notice-list">
                    <div>
                      <i class="violet"></i>
                      <span>
                        <b>Thay đổi phòng học</b>
                        <small>Lập trình Web · 10:24</small>
                      </span>
                      <em>Xem chi tiết</em>
                    </div>
                    <div>
                      <i class="red"></i>
                      <span>
                        <b>Deadline trong 3 giờ</b>
                        <small>Cơ sở dữ liệu · 09:15</small>
                      </span>
                      <em>Sắp hết hạn</em>
                    </div>
                    <div>
                      <i class="blue"></i>
                      <span>
                        <b>Giảng viên đăng tài liệu mới</b>
                        <small>Slide chương 4 · 08:42</small>
                      </span>
                      <em>Xem tài liệu</em>
                    </div>
                    <div>
                      <i class="green"></i>
                      <span>
                        <b>Lịch thi giữa kỳ được cập nhật</b>
                        <small>Cấu trúc dữ liệu · Hôm qua</small>
                      </span>
                      <em>Xem lịch</em>
                    </div>
                  </div>

                  <!-- Cài đặt nhắc nhở -->
                  <div class="preview-settings">
                    <b>Cài đặt nhắc nhở</b>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>

                  <!-- Mascot Cáo CMC vẫy tay -->
                  <img class="landing-mascot" src="${ASSETS.fox.wave}" alt="Cáo UniStudy vẫy tay" />

                  <!-- Badge xem video -->
                  <span class="video-preview-badge">
                    <svg><use href="#i-play"></use></svg>
                    <span>Xem video giới thiệu</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </a>
      </div>

      <!-- Feature Strip: 4 Thẻ chức năng bên dưới theo UI01 -->
      <section class="landing-feature-strip">
        <button type="button" data-landing-feature="schedule">
          <span class="feature-strip-icon green">
            <svg><use href="#i-calendar"></use></svg>
          </span>
          <span>
            <b>Thời khóa biểu thông minh</b>
            <small>Tự động cập nhật và nhắc nhở lịch học từ CMC University.</small>
          </span>
          <svg><use href="#i-arrow"></use></svg>
        </button>

        <button type="button" data-landing-feature="tasks">
          <span class="feature-strip-icon red">
            <svg><use href="#i-tasks"></use></svg>
          </span>
          <span>
            <b>Quản lý Deadline</b>
            <small>Không bỏ lỡ hạn nộp nhờ hệ thống nhắc nhở thông minh.</small>
          </span>
          <svg><use href="#i-arrow"></use></svg>
        </button>

        <button type="button" data-landing-feature="study-planner">
          <span class="feature-strip-icon violet">
            <svg><use href="#i-spark"></use></svg>
          </span>
          <span>
            <b>Trợ lý AI</b>
            <small>Hỗ trợ tóm tắt, giải đáp và gợi ý học tập cá nhân hóa.</small>
          </span>
          <svg><use href="#i-arrow"></use></svg>
        </button>

        <button type="button" data-landing-feature="exams">
          <span class="feature-strip-icon blue">
            <svg><use href="#i-quiz"></use></svg>
          </span>
          <span>
            <b>Quiz & Flashcard</b>
            <small>Ôn tập hiệu quả với câu hỏi và thẻ ghi nhớ do AI tạo.</small>
          </span>
          <svg><use href="#i-arrow"></use></svg>
        </button>
      </section>

      <!-- Ghi chú chân trang -->
      <div class="landing-preview-note">
        <span></span>
        Bản xem trước — Đồng bộ dữ liệu để hiển thị nội dung
        <span></span>
      </div>
    </main>
  `;
}
