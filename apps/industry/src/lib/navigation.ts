/** Keep in-page navigation separate from HashRouter and move keyboard focus with it. */
export function scrollToSection(id: string) {
  const section = document.getElementById(id);
  if (!section) return;
  section.tabIndex = -1;
  section.focus({ preventScroll: true });
  section.scrollIntoView({ behavior: "instant", block: "start" });
}
