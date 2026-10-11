import "@fontsource-variable/inter";
import "./styles.css";
import { hydrateIcons, svgIcon } from "./icons.js";
import { initConstellation } from "./constellation.js";
import { initParticles } from "./particles.js";
import { WRITERSADMIN_URL, GITHUB_PROFILE_URL, WHATSAPP_NUMBER, WHATSAPP_MESSAGE } from "./config.js";

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
hydrateIcons();

/* ---------- External links driven by config ---------- */
const isHttp = (u) => /^https?:\/\//i.test(u);
const waDigits = String(WHATSAPP_NUMBER).replace(/\D/g, "");
const LINKS = {
  writersadmin: { url: isHttp(WRITERSADMIN_URL) ? WRITERSADMIN_URL : "", missing: "WritersAdmin URL isn’t set yet (WRITERSADMIN_URL in src/config.js)." },
  github: { url: isHttp(GITHUB_PROFILE_URL) ? GITHUB_PROFILE_URL : "", missing: "GitHub URL isn’t set yet (GITHUB_PROFILE_URL in src/config.js)." },
  whatsapp: {
    url: waDigits.length >= 9 ? `https://wa.me/${waDigits}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}` : "",
    missing: "WhatsApp number isn’t set yet (WHATSAPP_NUMBER in src/config.js).",
  },
};

const toast = document.getElementById("toast");
let toastTimer;
function showToast(msg) {
  toast.textContent = msg; toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toast.hidden = true), 4200);
}

document.querySelectorAll("[data-link]").forEach((a) => {
  const cfg = LINKS[a.dataset.link];
  if (!cfg) return;
  if (cfg.url) { a.href = cfg.url; return; }
  a.removeAttribute("href");
  a.setAttribute("role", "link");
  a.setAttribute("aria-disabled", "true");
  a.setAttribute("tabindex", "0");
  a.classList.add("unconfigured");
  const fire = (e) => { e.preventDefault(); showToast(cfg.missing); };
  a.addEventListener("click", fire);
  a.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") fire(e); });
});
if (Object.values(LINKS).some((l) => !l.url)) {
  console.info("[portfolio] Some links in src/config.js are empty; their buttons show a notice until you add them.");
}

/* ---------- Constellation + info panel ---------- */
const title = document.getElementById("info-title");
const desc = document.getElementById("info-desc");
const chips = document.getElementById("info-chips");
const info = document.getElementById("info");

function showInfo(item) {
  title.textContent = item.label;
  desc.textContent = item.desc;
  chips.replaceChildren(...item.chips.map((c) => Object.assign(document.createElement("li"), { textContent: c })));
  info.classList.remove("flash"); void info.offsetWidth; info.classList.add("flash");
}

const net = initConstellation({ stage: document.getElementById("stage"), onSelect: showInfo, reduced });
showInfo({ label: "AI & Technical Analysis", desc: "Evaluating, analysing, and explaining technical work across AI, code, and data. Select a node to explore each area.", chips: [] });

document.querySelectorAll("#strip li").forEach((li) => {
  li.tabIndex = 0;
  li.setAttribute("role", "button");
  const go = () => net.select(li.dataset.node);
  li.addEventListener("click", go);
  li.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
});

/* ---------- Background ---------- */
initParticles(document.getElementById("bg"), reduced);
