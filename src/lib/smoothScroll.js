// Inertial scrolling for the long 2D page. Lenis interpolates the wheel while
// the browser keeps owning the real scroll position, so anchors, hash links,
// keyboard scrolling and the scrollbar all keep working.
import Lenis from 'lenis';

let lenis = null;

export function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function initSmoothScroll() {
  if (lenis || typeof window === 'undefined') return lenis;
  // Reduced motion means "no glide": the native scroll stays exactly as it is.
  if (prefersReducedMotion()) return null;

  lenis = new Lenis({
    lerp: 0.11,
    wheelMultiplier: 1,
    smoothWheel: true,
    // Touch devices keep native momentum scrolling: hijacking it is what makes
    // scroll-jacked sites feel broken on a phone.
    syncTouch: false,
    autoRaf: true,
    anchors: { offset: -84 },
  });

  return lenis;
}

export function getLenis() {
  return lenis;
}

export function scrollToId(id) {
  if (typeof document === 'undefined') return;
  const target = document.getElementById(id);
  if (!target) return;

  if (lenis) {
    lenis.scrollTo(target, { offset: -84, duration: 1.1 });
    return;
  }

  target.scrollIntoView({
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    block: 'start',
  });
}

export function setScrollLocked(locked) {
  if (!lenis) return;
  if (locked) lenis.stop();
  else lenis.start();
}
