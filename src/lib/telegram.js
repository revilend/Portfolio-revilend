// Thin, defensive wrapper around the Telegram Mini App SDK. Inside a Telegram
// WebView the client injects `window.Telegram.WebApp`; everywhere else every
// helper is a no-op, so the site never depends on Telegram being present.
function getWebApp() {
  if (typeof window === 'undefined') return null;
  const webApp = window.Telegram?.WebApp;
  return webApp && typeof webApp === 'object' ? webApp : null;
}

export function isTelegramWebApp() {
  return getWebApp() !== null;
}

export function initTelegramWebApp() {
  const webApp = getWebApp();
  if (!webApp) return false;

  try {
    webApp.ready?.();
    webApp.expand?.();
    // Blend the client chrome into the dark page instead of the default white.
    if (webApp.isVersionAtLeast?.('6.1')) {
      webApp.setHeaderColor?.('#080c14');
      webApp.setBackgroundColor?.('#080c14');
    }
  } catch {
    /* Older clients expose a smaller API; the page still works. */
  }

  return true;
}

// Shows the native back button while a drawer is open and routes it to `onBack`.
// Returns a cleanup function that hides it again.
export function setTelegramBackButton(visible, onBack) {
  const webApp = getWebApp();
  const back = webApp?.BackButton;
  if (!back) return () => {};

  try {
    if (visible) {
      if (onBack) back.onClick(onBack);
      back.show();
    } else {
      back.hide();
      if (onBack) back.offClick(onBack);
    }
  } catch {
    /* Ignore: a missing BackButton must not break navigation. */
  }

  return () => {
    try {
      if (onBack) back.offClick(onBack);
    } catch {
      /* Ignore. */
    }
  };
}

// Telegram requires t.me links opened through its own API inside a Mini App.
export function openTelegramLink(url) {
  const webApp = getWebApp();
  if (!webApp?.openTelegramLink) return false;

  try {
    webApp.openTelegramLink(url);
    return true;
  } catch {
    return false;
  }
}
