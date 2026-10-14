/**
 * UniStudy CMC - Sync Events
 */
import { syncState } from "../../app/sync-state.js";
import { openSchoolPortals } from "./sync.auth-window.js";
import { attachSourceSelectorEvents } from "../../shared/components/source-selector.js";
import { changeCurrentTabRoute } from "../../app/workspace.js";
import { notifyStateChange } from "../../app/state.js";

export function attachSyncEvents(containerEl) {
  attachSourceSelectorEvents(containerEl);

  const confirmBtn = containerEl.querySelector("#confirmSyncBtn");
  if (confirmBtn) {
    confirmBtn.addEventListener("click", () => {
      if (syncState.selectedSources.length === 0) return;
      openSchoolPortals(syncState.selectedSources);
      notifyStateChange();
    });
  }

  const skipBtn = containerEl.querySelector("#skipSyncBtn");
  if (skipBtn) {
    skipBtn.addEventListener("click", () => {
      changeCurrentTabRoute("dashboard");
    });
  }

  const emptyBtn = containerEl.querySelector("#viewEmptyAppBtn");
  if (emptyBtn) {
    emptyBtn.addEventListener("click", () => {
      changeCurrentTabRoute("dashboard");
    });
  }
}
