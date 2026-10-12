// Low-count particle network. Capped DPR, pauses when hidden, static if reduced motion.
export function initParticles(canvas, reduced) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  let w = 0, h = 0, dpr = 1, pts = [], raf = 0, running = false;
  const LINK = 130;
  // Colours come from CSS variables so they follow the light/dark theme
  let C = { line: "34,211,238", lineA: 0.14, dot: "139,233,253", dotA: 0.28 };
  function readColors() {
    const cs = getComputedStyle(document.documentElement);
    const v = (n, d) => cs.getPropertyValue(n).trim() || d;
    C = {
      line: v("--pt-line", C.line), lineA: parseFloat(v("--pt-line-a", C.lineA)),
      dot: v("--pt-dot", C.dot), dotA: parseFloat(v("--pt-dot-a", C.dotA)),
    };
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + "px"; canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.max(18, Math.min(46, Math.round((w * h) / 32000)));
    pts = Array.from({ length: n }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.22, vy: (Math.random() - 0.5) * 0.22,
    }));
    if (reduced) render();
  }

  function render() {
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      for (let j = i + 1; j < pts.length; j++) {
        const q = pts[j], dx = p.x - q.x, dy = p.y - q.y, d2 = dx * dx + dy * dy;
        if (d2 < LINK * LINK) {
          ctx.strokeStyle = `rgba(${C.line},${(1 - Math.sqrt(d2) / LINK) * C.lineA})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }
    }
    ctx.fillStyle = `rgba(${C.dot},${C.dotA})`;
    for (const p of pts) { ctx.beginPath(); ctx.arc(p.x, p.y, 1.1, 0, 6.2832); ctx.fill(); }
  }

  function step() {
    if (!running) return;
    for (const p of pts) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
    }
    render();
    raf = requestAnimationFrame(step);
  }
  const start = () => { if (!running && !reduced) { running = true; raf = requestAnimationFrame(step); } };
  const stop = () => { running = false; cancelAnimationFrame(raf); };

  window.addEventListener("themechange", () => { readColors(); if (reduced) render(); });
  readColors();

  let t;
  window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(resize, 150); });
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
  resize();
  start();
}
