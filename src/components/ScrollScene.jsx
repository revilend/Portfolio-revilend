import { useEffect, useRef } from 'react';
import { motionAllowed } from '../lib/scrollMotion.js';

// A fixed, perspective-projected tunnel that breathes with the page: scroll
// position decides how far the camera has travelled, so scrolling reads as
// forward motion through the grid instead of a moving wallpaper. It is drawn on
// a 2D canvas (a few hundred arcs) rather than a second WebGL context, which
// keeps the main bundle small and leaves the GPU to the 3D room.
const DEPTH = 70;
const PARTICLES = 84;
const RINGS = 6;
// The scene is ambient depth, not a game: half-rate frames are invisible and
// leave the main thread to the scroll itself.
const FRAME_SKIP = 3;

const TONES = ['0, 242, 254', '56, 189, 248', '139, 92, 246'];

function wrap(value) {
  return ((value % DEPTH) + DEPTH) % DEPTH;
}

function seedParticles() {
  return Array.from({ length: PARTICLES }, (_, index) => ({
    angle: Math.random() * Math.PI * 2,
    radius: 0.22 + Math.random() * 1.15,
    depth: Math.random() * DEPTH,
    size: 0.6 + Math.random() * 0.9,
    tone: TONES[index % TONES.length],
  }));
}

export default function ScrollScene() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return undefined;

    const particles = seedParticles();
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    let width = 0;
    let height = 0;
    let camZ = 0;
    let core = null;
    let frameId = 0;
    let last = performance.now();

    // The tunnel is pure glow, so it is rasterised below CSS resolution and
    // stretched: that keeps a full-viewport blur cheap on integrated GPUs and
    // on phones without the eye being able to tell.
    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.1) * 0.5;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      core = null;
    };

    const scrollProgress = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return 0;
      return Math.min(1, Math.max(0, window.scrollY / scrollable));
    };

    const draw = (elapsed) => {
      context.clearRect(0, 0, width, height);

      const focal = Math.min(width, height) * 0.78;
      const cx = width / 2 + pointer.x * 26;
      const cy = height / 2 + pointer.y * 18;

      // A soft core so the tunnel reads as light at the end of the grid. The
      // gradient is painted once into an offscreen layer and blitted after
      // that: re-rasterising a full-viewport gradient every frame is what
      // turns an ambient background into a 5 fps slideshow.
      if (!core) {
        core = document.createElement('canvas');
        core.width = Math.max(1, Math.round(width / 2));
        core.height = Math.max(1, Math.round(height / 2));
        const coreContext = core.getContext('2d');
        if (coreContext) {
          const gradient = coreContext.createRadialGradient(
            core.width / 2,
            core.height / 2,
            0,
            core.width / 2,
            core.height / 2,
            Math.min(core.width, core.height) * 1.1
          );
          gradient.addColorStop(0, 'rgba(0, 242, 254, 0.12)');
          gradient.addColorStop(0.45, 'rgba(139, 92, 246, 0.06)');
          gradient.addColorStop(1, 'rgba(5, 7, 13, 0)');
          coreContext.fillStyle = gradient;
          coreContext.fillRect(0, 0, core.width, core.height);
        }
      }
      context.drawImage(core, 0, 0, width, height);

      context.globalCompositeOperation = 'lighter';

      for (let index = 0; index < RINGS; index += 1) {
        const z = wrap(index * (DEPTH / RINGS) - camZ) + 2;
        const scale = focal / z;
        const radius = scale * 0.95;
        if (radius > Math.max(width, height) * 0.8) continue;

        const fade = 1 - z / DEPTH;
        context.beginPath();
        context.arc(cx, cy, radius, 0, Math.PI * 2);
        context.lineWidth = 0.5 + 1.2 * fade;
        context.strokeStyle = `rgba(0, 242, 254, ${(0.08 + 0.3 * fade).toFixed(3)})`;
        context.stroke();
      }

      for (const particle of particles) {
        const z = wrap(particle.depth - camZ) + 2;
        const scale = focal / z;
        const x = cx + Math.cos(particle.angle) * particle.radius * scale;
        const y = cy + Math.sin(particle.angle) * particle.radius * scale;
        const radius = Math.max(0.6, (scale / 80) * particle.size);
        const alpha = Math.max(0, Math.min(1, 2.1 - z / (DEPTH * 0.8)));

        if (alpha <= 0.01) continue;

        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(${particle.tone}, ${alpha.toFixed(3)})`;
        context.fill();
      }

      context.globalCompositeOperation = 'source-over';

      // Pointer sway eases in, so it never snaps.
      pointer.x += (pointer.tx - pointer.x) * 0.06;
      pointer.y += (pointer.ty - pointer.y) * 0.06;

      void elapsed;
    };

    let frameCount = 0;

    const loop = (time) => {
      frameId = requestAnimationFrame(loop);
      const elapsed = Math.min(64, time - last);
      last = time;

      // Scroll drives the camera; a slow drift keeps the tunnel alive at rest.
      const target = scrollProgress() * DEPTH * 2.6 + (time / 1000) * 1.4;
      camZ += (target - camZ) * (elapsed / 1000) * 6.5;

      frameCount += 1;
      if (document.hidden || frameCount % FRAME_SKIP !== 0) return;
      draw(elapsed);
    };

    const handlePointer = (event) => {
      pointer.tx = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.ty = (event.clientY / window.innerHeight) * 2 - 1;
    };

    resize();
    window.addEventListener('resize', resize);

    if (!motionAllowed()) {
      // Static composition for reduced motion: one frame, no loop, no pointer.
      camZ = scrollProgress() * DEPTH * 2.6;
      draw(0);
      return () => window.removeEventListener('resize', resize);
    }

    window.addEventListener('pointermove', handlePointer, { passive: true });
    frameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      data-scroll-scene
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full [mask-image:radial-gradient(120%_100%_at_50%_40%,#000_35%,transparent_92%)]"
    />
  );
}
