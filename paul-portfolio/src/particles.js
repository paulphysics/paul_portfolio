// Low-count particle network. Capped DPR, pauses when hidden, static if reduced motion.
export function initParticles(canvas, reduced) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  let w = 0, h = 0, dpr = 1, pts = [], raf = 0, running = false;
  const LINK = 130;

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
          ctx.strokeStyle = `rgba(34,211,238,${(1 - Math.sqrt(d2) / LINK) * 0.14})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }
    }
    ctx.fillStyle = "rgba(139,233,253,.28)";
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

  let t;
  window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(resize, 150); });
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
  resize();
  start();
}
