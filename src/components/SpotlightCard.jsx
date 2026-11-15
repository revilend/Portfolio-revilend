import { useCallback, useRef } from 'react';

/**
 * Cards that glow where the cursor is. The pointer position is written to two CSS
 * variables on the node itself and the gradient is painted by CSS (`.spotlight`),
 * so a mousemove never triggers a React render — no lag, even on a grid of cards.
 */
export default function SpotlightCard({
  as: Tag = 'div',
  className = '',
  children,
  onMouseMove,
  ...rest
}) {
  const ref = useRef(null);

  const handleMouseMove = useCallback(
    (event) => {
      const node = ref.current;
      if (node) {
        const rect = node.getBoundingClientRect();
        node.style.setProperty('--spot-x', `${Math.round(event.clientX - rect.left)}px`);
        node.style.setProperty('--spot-y', `${Math.round(event.clientY - rect.top)}px`);
      }
      onMouseMove?.(event);
    },
    [onMouseMove]
  );

  return (
    <Tag ref={ref} onMouseMove={handleMouseMove} className={`spotlight ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
