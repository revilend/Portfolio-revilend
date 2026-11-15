// One requestAnimationFrame loop drives every scroll-linked effect on the page.
// It measures elements with offsetTop (transforms cannot skew it) and writes
// styles straight to nodes, so scrubbing never triggers a React render.
const layers = new Set();
let frameId = 0;
let frameCount = 0;

const REMEASURE_EVERY = 40;

function absoluteTop(node) {
  let top = 0;
  let current = node;

  while (current) {
    top += current.offsetTop || 0;
    current = current.offsetParent;
  }

  return top;
}

function measure(layer) {
  layer.top = absoluteTop(layer.node);
  layer.height = layer.node.offsetHeight || 1;
}

function stop() {
  if (!frameId) return;
  cancelAnimationFrame(frameId);
  frameId = 0;
}

function tick() {
  frameId = requestAnimationFrame(tick);
  frameCount += 1;

  const scrollY = window.scrollY;
  const viewport = window.innerHeight;
  const scrollable = document.documentElement.scrollHeight - viewport;
  const progress = scrollable > 0 ? Math.min(1, Math.max(0, scrollY / scrollable)) : 0;

  document.documentElement.style.setProperty('--scroll-progress', progress.toFixed(4));

  const remeasure = frameCount % REMEASURE_EVERY === 0;

  for (const layer of layers) {
    if (remeasure) measure(layer);
    layer.apply({ scrollY, viewport, progress, top: layer.top, height: layer.height });
  }
}

function start() {
  if (frameId) return;
  frameId = requestAnimationFrame(tick);
}

export function motionAllowed() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Run `apply` on every animation frame while the page is mounted.
 * Returns a cleanup function; the loop stops when the last layer unregisters.
 */
export function onScrollFrame(node, apply) {
  if (!node || typeof window === 'undefined' || !motionAllowed()) return () => {};

  const layer = { node, apply };
  measure(layer);
  layers.add(layer);
  start();

  return () => {
    layers.delete(layer);
    if (layers.size === 0) stop();
  };
}
