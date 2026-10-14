/**
 * UniStudy CMC - Schedule Feature Entry
 */
import { renderScheduleView } from "./schedule.view.js";
import { attachScheduleEvents } from "./schedule.events.js";

export function mountSchedule(containerEl) {
  containerEl.innerHTML = renderScheduleView();
  attachScheduleEvents(containerEl);
}
