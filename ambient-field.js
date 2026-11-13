(() => {
  const canvas = document.querySelector("[data-ambient-field]");
  if (!canvas) return;

  const context = canvas.getContext("2d", { alpha: true });
  if (!context) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const profile = document.querySelector(".profile");
  const pointer = { x: 0, y: 0, active: false };
  const pulses = [];
  let points = [];
  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let animationFrame = null;
  let lastFrame = 0;
  let scrollPosition = window.scrollY;
  let colors = null;

  const rgba = (value, alpha) => {
    const hex = value.trim().replace("#", "");
    if (!/^[0-9a-f]{6}$/i.test(hex)) return `rgba(80, 133, 195, ${alpha})`;
    const number = Number.parseInt(hex, 16);
    return `rgba(${number >> 16}, ${(number >> 8) & 255}, ${number & 255}, ${alpha})`;
  };

  const readColors = () => {
    const styles = getComputedStyle(document.documentElement);
    colors = {
      primary: styles.getPropertyValue("--marina"),
      accent: styles.getPropertyValue("--maui"),
      quiet: styles.getPropertyValue("--sky"),
    };
  };

  const random = (seed) => {
    const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
    return value - Math.floor(value);
  };

  const rebuild = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    const columns = Math.max(6, Math.min(11, Math.round(width / 150)));
    const rows = Math.max(5, Math.min(8, Math.round(height / 130)));
    const nextPoints = [];
    let index = 0;

    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const jitterX = (random(index + 1) - 0.5) * 0.62;
        const jitterY = (random(index + 21) - 0.5) * 0.62;
        nextPoints.push({
          x: ((column + 0.5 + jitterX) / columns) * width,
          y: ((row + 0.5 + jitterY) / rows) * height,
          phase: random(index + 41) * Math.PI * 2,
          speed: 0.38 + random(index + 61) * 0.5,
          depth: 0.35 + random(index + 81) * 0.9,
          size: 1.1 + random(index + 101) * 1.35,
        });
        index += 1;
      }
    }

    points = nextPoints;
    readColors();
    draw(performance.now());
  };

  const modeSettings = () => {
    const mode = profile?.dataset.cycleActive || "observe";
    if (mode === "revise") return { speed: 0.82, reach: 192, pull: 10, line: 0.2 };
    if (mode === "evolve") return { speed: 1.18, reach: 216, pull: 15, line: 0.17 };
    return { speed: 0.62, reach: 176, pull: 7, line: 0.15 };
  };

  const positionsAt = (time, settings) => points.map((point) => {
    const phase = time * 0.00018 * point.speed * settings.speed + point.phase;
    let x = point.x + Math.cos(phase) * 9 * point.depth;
    let y = point.y + Math.sin(phase * 1.13) * 7 * point.depth;
    y += (scrollPosition * 0.018 * point.depth) % (height + 80);
    y = ((y + 40) % (height + 80) + (height + 80)) % (height + 80) - 40;

    if (pointer.active) {
      const deltaX = pointer.x - x;
      const deltaY = pointer.y - y;
      const distance = Math.hypot(deltaX, deltaY);
      if (distance < 230 && distance > 0) {
        const influence = (1 - distance / 230) ** 2;
        x += (deltaX / distance) * settings.pull * influence;
        y += (deltaY / distance) * settings.pull * influence;
      }
    }

    return { ...point, x, y };
  });

  const drawPulse = (pulse, time) => {
    const progress = Math.min(1, (time - pulse.startedAt) / 900);
    const size = 12 + progress * 128;
    context.save();
    context.translate(pulse.x, pulse.y);
    context.rotate(Math.PI / 4);
    context.strokeStyle = rgba(colors.accent, (1 - progress) * 0.22);
    context.lineWidth = 1;
    context.strokeRect(-size / 2, -size / 2, size, size);
    context.restore();
    return progress < 1;
  };

  const draw = (time) => {
    context.clearRect(0, 0, width, height);
    const settings = modeSettings();
    const positioned = positionsAt(reducedMotion ? 0 : time, settings);

    for (let first = 0; first < positioned.length; first += 1) {
      for (let second = first + 1; second < positioned.length; second += 1) {
        const a = positioned[first];
        const b = positioned[second];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (distance > settings.reach) continue;

        let proximity = 0;
        if (pointer.active) {
          const midpointX = (a.x + b.x) / 2;
          const midpointY = (a.y + b.y) / 2;
          proximity = Math.max(0, 1 - Math.hypot(pointer.x - midpointX, pointer.y - midpointY) / 240);
        }

        const alpha = (1 - distance / settings.reach) * (settings.line + proximity * 0.18);
        context.beginPath();
        context.moveTo(a.x, a.y);
        context.lineTo(b.x, b.y);
        context.strokeStyle = rgba(proximity > 0.25 ? colors.accent : colors.primary, alpha);
        context.lineWidth = proximity > 0.4 ? 0.9 : 0.55;
        context.stroke();
      }
    }

    positioned.forEach((point, index) => {
      const pointerDistance = pointer.active ? Math.hypot(pointer.x - point.x, pointer.y - point.y) : Infinity;
      const active = pointerDistance < 180;
      const size = point.size + (active ? (1 - pointerDistance / 180) * 1.8 : 0);
      context.save();
      context.translate(point.x, point.y);
      context.rotate(index % 3 === 0 ? Math.PI / 4 : 0);
      context.fillStyle = rgba(active ? colors.accent : colors.quiet, active ? 0.72 : 0.46);
      context.fillRect(-size / 2, -size / 2, size, size);
      context.restore();
    });

    for (let index = pulses.length - 1; index >= 0; index -= 1) {
      if (!drawPulse(pulses[index], time)) pulses.splice(index, 1);
    }

    lastFrame = time;
    if (!reducedMotion && !document.hidden) animationFrame = requestAnimationFrame(draw);
  };

  const start = () => {
    if (reducedMotion || animationFrame !== null || document.hidden) return;
    animationFrame = requestAnimationFrame(draw);
  };

  const stop = () => {
    if (animationFrame === null) return;
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  };

  window.addEventListener("pointermove", (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = event.pointerType !== "touch";
  }, { passive: true });

  window.addEventListener("pointerout", (event) => {
    if (!event.relatedTarget) pointer.active = false;
  });

  window.addEventListener("pointerdown", (event) => {
    if (reducedMotion || event.pointerType === "touch") return;
    pulses.push({ x: event.clientX, y: event.clientY, startedAt: performance.now() });
  }, { passive: true });

  window.addEventListener("scroll", () => {
    scrollPosition = window.scrollY;
  }, { passive: true });

  window.addEventListener("resize", rebuild, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });

  new MutationObserver(() => {
    readColors();
    if (reducedMotion) draw(lastFrame);
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  if (profile) {
    new MutationObserver(() => {
      if (reducedMotion) draw(lastFrame);
    }).observe(profile, { attributes: true, attributeFilter: ["data-cycle-active"] });
  }

  rebuild();
  start();
})();
