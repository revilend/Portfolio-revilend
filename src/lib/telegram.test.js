import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  initTelegramWebApp,
  isTelegramWebApp,
  openTelegramLink,
  setTelegramBackButton,
} from './telegram.js';

function fakeWebApp(overrides = {}) {
  return {
    ready: vi.fn(),
    expand: vi.fn(),
    isVersionAtLeast: () => true,
    setHeaderColor: vi.fn(),
    setBackgroundColor: vi.fn(),
    openTelegramLink: vi.fn(),
    BackButton: { show: vi.fn(), hide: vi.fn(), onClick: vi.fn(), offClick: vi.fn() },
    ...overrides,
  };
}

afterEach(() => {
  delete window.Telegram;
});

describe('outside Telegram', () => {
  it('reports no Mini App and every helper stays inert', () => {
    expect(isTelegramWebApp()).toBe(false);
    expect(initTelegramWebApp()).toBe(false);
    expect(openTelegramLink('https://t.me/revilend')).toBe(false);
    expect(() => setTelegramBackButton(true, () => {})()).not.toThrow();
  });
});

describe('inside Telegram', () => {
  it('signals readiness, expands and tints the chrome', () => {
    const webApp = fakeWebApp();
    window.Telegram = { WebApp: webApp };

    expect(isTelegramWebApp()).toBe(true);
    expect(initTelegramWebApp()).toBe(true);
    expect(webApp.ready).toHaveBeenCalled();
    expect(webApp.expand).toHaveBeenCalled();
    expect(webApp.setHeaderColor).toHaveBeenCalledWith('#080c14');
    expect(webApp.setBackgroundColor).toHaveBeenCalledWith('#080c14');
  });

  it('survives an older client that lacks the new methods', () => {
    window.Telegram = {
      WebApp: fakeWebApp({ setHeaderColor: undefined, isVersionAtLeast: () => false }),
    };

    expect(() => initTelegramWebApp()).not.toThrow();
  });

  it('shows and hides the native back button around the drawer', () => {
    const webApp = fakeWebApp();
    window.Telegram = { WebApp: webApp };
    const onBack = vi.fn();

    const cleanup = setTelegramBackButton(true, onBack);
    expect(webApp.BackButton.show).toHaveBeenCalled();
    expect(webApp.BackButton.onClick).toHaveBeenCalledWith(onBack);

    cleanup();
    expect(webApp.BackButton.offClick).toHaveBeenCalledWith(onBack);

    setTelegramBackButton(false);
    expect(webApp.BackButton.hide).toHaveBeenCalled();
  });

  it('routes Telegram links through the client API', () => {
    const webApp = fakeWebApp();
    window.Telegram = { WebApp: webApp };

    expect(openTelegramLink('https://t.me/revilend')).toBe(true);
    expect(webApp.openTelegramLink).toHaveBeenCalledWith('https://t.me/revilend');
  });
});
