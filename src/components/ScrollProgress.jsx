import { useEffect, useRef } from 'react';
import { onScrollFrame } from '../lib/scrollMotion.js';

// A neon timeline of the read: it grows from 0% to 100% as the page is
// scrolled, and is painted from one shared rAF loop instead of React state.
export default function ScrollProgress() {
  const barRef = useRef(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return undefined;

    return onScrollFrame(document.documentElement, ({ progress }) => {
      bar.style.transform = `scaleX(${progress.toFixed(4)})`;
    });
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-[2px]">
      <div
        ref={barRef}
        data-scroll-progress
        className="h-full w-full origin-left scale-x-0 bg-gradient-to-r from-electric via-cyan-300 to-plasma shadow-[0_0_14px_rgba(0,242,254,0.75)]"
      />
    </div>
  );
}
