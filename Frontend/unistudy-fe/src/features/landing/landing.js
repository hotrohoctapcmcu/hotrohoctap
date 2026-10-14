/**
 * UniStudy CMC - Landing Feature Entry
 */
import { renderLandingView } from "./landing.view.js";
import { attachLandingEvents } from "./landing.events.js";

export function mountLanding(containerEl) {
  containerEl.innerHTML = renderLandingView();
  attachLandingEvents(containerEl);
}
