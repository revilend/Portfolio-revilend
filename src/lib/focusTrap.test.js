import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { trapTabKey } from './focusTrap.js';

const DIALOG = `
  <div id="dialog">
    <button id="first">first</button>
    <button id="middle">middle</button>
    <button id="last">last</button>
  </div>
  <button id="outside">outside</button>
`;

const tabEvent = (shiftKey = false) =>
  new KeyboardEvent('keydown', { key: 'Tab', shiftKey, bubbles: true, cancelable: true });

// jsdom performs no layout, so getClientRects() is always empty. The visibility
// filter is verified in the browser; here it is stubbed so the wrap logic runs.
let rects;

beforeEach(() => {
  document.body.innerHTML = DIALOG;
  rects = vi.spyOn(Element.prototype, 'getClientRects').mockReturnValue([{ width: 10 }]);
});

afterEach(() => {
  rects.mockRestore();
  vi.restoreAllMocks();
});

describe('trapTabKey', () => {
  it('wraps forward from the last element to the first', () => {
    const dialog = document.getElementById('dialog');
    document.getElementById('last').focus();
    const event = tabEvent();

    expect(trapTabKey(event, dialog)).toBe(true);
    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement.id).toBe('first');
  });

  it('wraps backward from the first element to the last', () => {
    const dialog = document.getElementById('dialog');
    document.getElementById('first').focus();
    const event = tabEvent(true);

    expect(trapTabKey(event, dialog)).toBe(true);
    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement.id).toBe('last');
  });

  it('leaves a Tab in the middle to the browser', () => {
    const dialog = document.getElementById('dialog');
    document.getElementById('middle').focus();
    const event = tabEvent();

    expect(trapTabKey(event, dialog)).toBe(false);
    expect(event.defaultPrevented).toBe(false);
    expect(document.activeElement.id).toBe('middle');
  });

  it('pulls focus back when it sits outside the dialog', () => {
    const dialog = document.getElementById('dialog');
    document.getElementById('outside').focus();
    const event = tabEvent();

    expect(trapTabKey(event, dialog)).toBe(true);
    expect(document.activeElement.id).toBe('first');
  });

  it('does nothing for other keys or a missing container', () => {
    const event = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true });

    expect(trapTabKey(event, document.getElementById('dialog'))).toBe(false);
    expect(trapTabKey(tabEvent(), null)).toBe(false);
  });

  it('does not intercept when no element is focusable', () => {
    rects.mockReturnValue([]);
    document.getElementById('middle').focus();
    const event = tabEvent();

    expect(trapTabKey(event, document.getElementById('dialog'))).toBe(false);
  });
});
