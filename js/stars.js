// ================= 星空背景 =================
// Canvas 粒子：缓慢闪烁 + 滚动视差；尊重 prefers-reduced-motion

(function () {
  const canvas = document.getElementById('starCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let stars = [];
  let w = 0, h = 0;

  // 按屏幕面积计算粒子数，移动端自动减半
  function calcCount() {
    const base = Math.floor((window.innerWidth * window.innerHeight) / 6000);
    const isMobile = window.innerWidth < 640;
    return Math.max(40, isMobile ? Math.floor(base / 2) : base);
  }

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    initStars();
  }

  function initStars() {
    const count = calcCount();
    stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.5 + 0.3,      // 半径
        baseAlpha: Math.random() * 0.5 + 0.3,
        phase: Math.random() * Math.PI * 2, // 闪烁相位
        speed: Math.random() * 0.02 + 0.005 // 闪烁速度
      });
    }
  }

  function draw(time) {
    ctx.clearRect(0, 0, w, h);
    // 滚动视差：星星随滚动轻微下移
    const offset = (window.scrollY || 0) * 0.15;

    for (const s of stars) {
      // 闪烁：alpha 随时间正弦变化
      const alpha = reducedMotion
        ? s.baseAlpha
        : s.baseAlpha * (0.6 + 0.4 * Math.sin(s.phase + time * s.speed));
      const y = (s.y + offset) % h;
      ctx.beginPath();
      ctx.arc(s.x, y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(230, 234, 242, ${alpha})`;
      ctx.fill();
    }

    if (!reducedMotion) requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();

  if (reducedMotion) {
    draw(0); // 静态绘制一帧
  } else {
    requestAnimationFrame(draw);
  }
})();
