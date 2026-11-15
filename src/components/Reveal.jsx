import { useEffect, useRef, useState } from 'react';
import { motionAllowed, onScrollFrame } from '../lib/scrollMotion.js';

export default function Reveal({ children, className = '', delay = 0, parallax = 0 }) {
  const ref = useRef(null);
  const innerRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    if (!('IntersectionObserver' in window) || !motionAllowed()) {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -48px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Parallax runs on the inner node: the outer one keeps owning the grid slot
  // and the reveal transition, so the two never fight over one transform.
  useEffect(() => {
    if (!parallax) return undefined;
    const inner = innerRef.current;
    if (!inner) return undefined;

    return onScrollFrame(ref.current, ({ scrollY, viewport, top, height }) => {
      const distance = scrollY + viewport / 2 - (top + height / 2);
      const offset = Math.max(-26, Math.min(26, distance * parallax));
      inner.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
    });
  }, [parallax]);

  return (
    <div
      ref={ref}
      className={`transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:translate-y-0 motion-reduce:opacity-100 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 will-change-transform'
      } ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
    >
      <div ref={innerRef} className="h-full">
        {children}
      </div>
    </div>
  );
}
