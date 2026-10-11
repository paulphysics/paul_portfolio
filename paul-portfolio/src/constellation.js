import { svgIcon } from "./icons.js";
import { CENTER, SKILLS } from "./skills.js";

const NS = "http://www.w3.org/2000/svg";
const W = 640, H = 420, CX = W / 2, CY = H / 2;
const RX = 238, RY = 150, R_NODE = 27, R_CENTER = 46;

const el = (name, attrs = {}, parent) => {
  const n = document.createElementNS(NS, name);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
};

export function initConstellation({ stage, onSelect, reduced }) {
  const svg = el("svg", {
    viewBox: `0 0 ${W} ${H}`, class: "net", role: "group",
    "aria-label": "Skills network. Select a node to read about it.",
  });
  const defs = el("defs", {}, svg);
  const g1 = el("radialGradient", { id: "halo" }, defs);
  el("stop", { offset: "0", "stop-color": "#22d3ee", "stop-opacity": ".35" }, g1);
  el("stop", { offset: "1", "stop-color": "#22d3ee", "stop-opacity": "0" }, g1);

  const orbit = el("ellipse", { cx: CX, cy: CY, rx: RX, ry: RY, class: "orbit" }, svg);
  const ringLayer = el("g", {}, svg);
  const spokeLayer = el("g", {}, svg);
  const nodeLayer = el("g", {}, svg);

  const nodes = SKILLS.map((s, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / SKILLS.length + 0.18;
    const bx = CX + Math.cos(a) * RX, by = CY + Math.sin(a) * RY;
    const g = el("g", {
      class: "node", tabindex: "0", role: "button",
      "aria-label": `${s.label}. ${s.desc}`, "aria-pressed": "false", "data-id": s.id,
    }, nodeLayer);
    el("circle", { r: R_NODE + 12, fill: "url(#halo)", class: "node-halo" }, g);
    el("circle", { r: R_NODE, class: "node-disc" }, g);
    const ico = el("g", { class: "node-ico", transform: "translate(-11 -11) scale(.92)" }, g);
    ico.innerHTML = svgIcon(s.icon).replace(/^<svg[^>]*>|<\/svg>$/g, "");
    const t = el("text", { y: R_NODE + 17, "text-anchor": "middle", class: "node-label" }, g);
    t.textContent = s.label;
    const spoke = el("line", { class: "spoke" }, spokeLayer);
    return { s, g, spoke, bx, by, x: bx, y: by, ph: i * 1.7, fx: 0.00045 + i * 0.00004, depth: 0.6 + (i % 3) * 0.3 };
  });

  // faint links between neighbours
  const rings = nodes.map((_, i) => el("line", { class: "ring" }, ringLayer));

  // Centre node
  const c = el("g", { class: "node center selected", tabindex: "0", role: "button",
    "aria-label": "AI and technical analysis. Summary of all skill areas.", "aria-pressed": "true", "data-id": "center" }, nodeLayer);
  el("circle", { r: R_CENTER + 26, fill: "url(#halo)", class: "node-halo" }, c);
  el("circle", { r: R_CENTER, class: "node-disc" }, c);
  el("circle", { r: R_CENTER - 7, class: "center-ring" }, c);
  const mono = el("text", { y: 7, "text-anchor": "middle", class: "center-mono" }, c);
  mono.textContent = "PO";
  const cl = el("text", { y: R_CENTER + 19, "text-anchor": "middle", class: "node-label strong" }, c);
  cl.textContent = "AI & TECHNICAL ANALYSIS";

  // Pulse that travels the selected spoke
  const pulse = el("circle", { r: 2.6, class: "pulse" }, svg);
  stage.appendChild(svg);

  let selected = "center", mx = 0, my = 0, tx = 0, ty = 0, running = false, raf = 0, last = 0;

  const byId = (id) => (id === "center" ? CENTER : SKILLS.find((s) => s.id === id));

  function select(id, { silent = false } = {}) {
    selected = id;
    c.classList.toggle("selected", id === "center");
    c.setAttribute("aria-pressed", String(id === "center"));
    nodes.forEach((n) => {
      const on = n.s.id === id;
      n.g.classList.toggle("selected", on);
      n.g.setAttribute("aria-pressed", String(on));
      n.spoke.classList.toggle("on", on);
    });
    pulse.style.display = id === "center" || reduced ? "none" : "";
    if (!silent) onSelect(byId(id));
    draw(performance.now());
  }

  function draw(now) {
    const ox = mx * 14, oy = my * 9;
    c.setAttribute("transform", `translate(${CX + ox * 0.4} ${CY + oy * 0.4})`);
    const cx = CX + ox * 0.4, cy = CY + oy * 0.4;
    nodes.forEach((n, i) => {
      const t = reduced ? 0 : now;
      n.x = n.bx + Math.sin(t * n.fx + n.ph) * 6 + ox * n.depth;
      n.y = n.by + Math.cos(t * n.fx * 1.2 + n.ph) * 5 + oy * n.depth;
      n.g.setAttribute("transform", `translate(${n.x.toFixed(1)} ${n.y.toFixed(1)})`);
      n.spoke.setAttribute("x1", cx); n.spoke.setAttribute("y1", cy);
      n.spoke.setAttribute("x2", n.x.toFixed(1)); n.spoke.setAttribute("y2", n.y.toFixed(1));
      const m = nodes[(i + 1) % nodes.length];
      rings[i].setAttribute("x1", n.x.toFixed(1)); rings[i].setAttribute("y1", n.y.toFixed(1));
      rings[i].setAttribute("x2", m.x.toFixed(1)); rings[i].setAttribute("y2", m.y.toFixed(1));
    });
    const sel = nodes.find((n) => n.s.id === selected);
    if (sel && !reduced) {
      const p = ((now % 1800) / 1800);
      pulse.setAttribute("cx", (cx + (sel.x - cx) * p).toFixed(1));
      pulse.setAttribute("cy", (cy + (sel.y - cy) * p).toFixed(1));
    }
  }

  function frame(now) {
    if (!running) return;
    mx += (tx - mx) * 0.06; my += (ty - my) * 0.06;
    draw(now);
    raf = requestAnimationFrame(frame);
  }
  const start = () => { if (!running && !reduced) { running = true; raf = requestAnimationFrame(frame); } };
  const stop = () => { running = false; cancelAnimationFrame(raf); };

  if (!reduced) {
    stage.addEventListener("pointermove", (e) => {
      const r = stage.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    });
    stage.addEventListener("pointerleave", () => { tx = 0; ty = 0; });
    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
    // Only animate while on screen
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([e]) => (e.isIntersecting && !document.hidden ? start() : stop())).observe(stage);
    }
  }

  const activate = (g) => select(g.dataset.id);
  svg.addEventListener("click", (e) => { const g = e.target.closest(".node"); if (g) activate(g); });
  svg.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const g = e.target.closest(".node");
    if (g) { e.preventDefault(); activate(g); }
  });

  select("center", { silent: true });
  draw(performance.now());
  start();
  return { select };
}
