// Shared focus containment for elements that declare aria-modal="true".
// Without this, Tab moves focus into the page behind the dialog.
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function trapTabKey(event, container) {
  if (event.key !== 'Tab' || !container) return false;

  const nodes = Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
    (node) => node.getClientRects().length > 0
  );
  if (!nodes.length) return false;

  const first = nodes[0];
  const last = nodes[nodes.length - 1];
  const active = document.activeElement;
  const inside = container.contains(active);

  if (event.shiftKey && (active === first || !inside)) {
    event.preventDefault();
    last.focus();
    return true;
  }

  if (!event.shiftKey && (active === last || !inside)) {
    event.preventDefault();
    first.focus();
    return true;
  }

  return false;
}
