/**
 * UniStudy CMC - Landing Page Events
 */
import { state, notifyStateChange } from "../../app/state.js";
import { changeCurrentTabRoute } from "../../app/workspace.js";

export function attachLandingEvents(containerEl) {
  // Nút Trải nghiệm bản xem trước -> Chuyển vào workspace rỗng
  const enterBtn = containerEl.querySelector("#landingExperienceBtn");
  if (enterBtn) {
    enterBtn.addEventListener("click", () => {
      state.screen = "workspace";
      notifyStateChange();
    });
  }

  // Click vào 4 card feature strip -> Chuyển vào workspace và mở đúng route
  const featureBtns = containerEl.querySelectorAll("[data-landing-feature]");
  featureBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetRoute = btn.getAttribute("data-landing-feature");
      state.screen = "workspace";
      changeCurrentTabRoute(targetRoute || "dashboard");
      notifyStateChange();
    });
  });
}
