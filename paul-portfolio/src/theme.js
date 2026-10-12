// Light / dark theme. The inline script in index.html sets data-theme before first paint;
// this module wires up the header toggle, remembers the choice, and follows the system
// setting until the visitor makes an explicit choice.
const KEY = "theme";
const root = document.documentElement;
const mq = window.matchMedia("(prefers-color-scheme: light)");
const COLORS = { dark: "#07090d", light: "#f5f7fa" };

const SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>';
const MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';

function saved() {
  try {
    const v = localStorage.getItem(KEY);
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null;
  }
}

function apply(theme, button) {
  root.dataset.theme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", COLORS[theme]);
  if (button) {
    const toLight = theme === "dark";
    button.innerHTML = toLight ? SUN : MOON;
    button.setAttribute("aria-label", toLight ? "Switch to light mode" : "Switch to dark mode");
    button.title = toLight ? "Light mode" : "Dark mode";
  }
  // Let the canvas background re-read its colours
  window.dispatchEvent(new Event("themechange"));
}

export function initTheme() {
  const button = document.getElementById("theme-toggle");
  const current = () => (root.dataset.theme === "light" ? "light" : "dark");
  apply(saved() ?? (mq.matches ? "light" : "dark"), button);

  button?.addEventListener("click", () => {
    const next = current() === "dark" ? "light" : "dark";
    try { localStorage.setItem(KEY, next); } catch { /* storage unavailable: still switch */ }
    apply(next, button);
  });

  // Follow the system until the visitor picks a theme themselves
  mq.addEventListener?.("change", (e) => {
    if (!saved()) apply(e.matches ? "light" : "dark", button);
  });
}
