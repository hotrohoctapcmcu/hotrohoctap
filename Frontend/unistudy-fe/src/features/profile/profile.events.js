/**
 * UniStudy CMC - Profile Events
 */
import { state, resetSessionState, notifyStateChange } from "../../app/state.js";
import { resetWorkspaceTabs } from "../../app/workspace.js";
import { syncState, resetSyncState } from "../../app/sync-state.js";
import { attachSourceSelectorEvents } from "../../shared/components/source-selector.js";
import { openSchoolPortals } from "../sync/sync.auth-window.js";
import { renderProfileEditModal } from "./profile.view.js";
import { attachModalEvents } from "../../shared/components/modal.js";

export function attachProfileEvents(containerEl) {
  attachSourceSelectorEvents(containerEl);

  // Nút Đồng bộ ngay
  const syncNowBtn = containerEl.querySelector("#profileSyncNowBtn");
  if (syncNowBtn) {
    syncNowBtn.addEventListener("click", () => {
      openSchoolPortals(syncState.selectedSources);
    });
  }

  // Mở modal chỉnh sửa hồ sơ
  const editBtn = containerEl.querySelector("#openEditProfileBtn");
  if (editBtn) {
    editBtn.addEventListener("click", () => {
      const modalHost = containerEl.querySelector("#profileEditModalHost");
      if (!modalHost) return;

      modalHost.innerHTML = renderProfileEditModal(state.studentProfile);
      const modalEl = modalHost.querySelector("#profileEditModal");

      const close = () => {
        modalHost.innerHTML = "";
      };

      attachModalEvents(modalEl, close);

      const form = modalEl.querySelector("#profileEditForm");
      if (form) {
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          const fd = new FormData(form);
          state.studentProfile = {
            ...(state.studentProfile || {}),
            name: fd.get("name")?.trim() || "Chưa có dữ liệu",
            studentId: fd.get("studentId")?.trim() || "Chưa có dữ liệu",
            email: fd.get("email")?.trim() || "Chưa có dữ liệu"
          };
          close();
          notifyStateChange();
        });
      }
    });
  }

  // Đăng xuất / Thoát phiên làm việc (Logout)
  const logoutBtn = containerEl.querySelector("#profileLogoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      const ok = window.confirm("Bạn có chắc chắn muốn thoát phiên làm việc? Toàn bộ bản nháp và dữ liệu cục bộ trong phiên này sẽ được dọn sạch.");
      if (ok) {
        resetSessionState();
        resetWorkspaceTabs();
        resetSyncState();
      }
    });
  }
}
