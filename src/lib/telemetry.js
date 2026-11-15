/**
 * Frontend error reporting and page-view ping.
 *
 * The site is a static build, so the only component that can tell the admin that
 * a visitor's phone broke is the bot's aiohttp process (see main.py). Everything
 * here is fire-and-forget: a failed report must never break the page it reports
 * about, and nothing is sent when no endpoint is configured.
 */
const RAW_CONTACT_ENDPOINT = (import.meta.env.VITE_CONTACT_ENDPOINT ?? '').trim();
const RAW_REPORT_ENDPOINT = (import.meta.env.VITE_REPORT_ENDPOINT ?? '').trim();
const RAW_PING_ENDPOINT = (import.meta.env.VITE_PING_ENDPOINT ?? '').trim();

export const REPORT_KINDS = ['error', 'unhandledrejection', 'webgl', 'webgl-restored'];

export const MAX_REPORT_LENGTH = { message: 400, stack: 1200, source: 200, userAgent: 160 };

/** One report per distinct failure per page view, three at most — no floods. */
export const SESSION_REPORT_LIMIT = 3;

const PING_STORAGE_KEY = 'revilend:pinged';

/**
 * Derives a sibling route from the contact endpoint, so the site needs one env
 * var for all three routes. An explicit value always wins.
 */
export function endpointFor(contactEndpoint, explicitEndpoint, route) {
  const explicit = (explicitEndpoint ?? '').trim();
  if (explicit) return explicit;

  const base = (contactEndpoint ?? '').trim().replace(/\/+$/, '');
  if (!base.endsWith('/api/contact')) return '';

  return base.replace(/\/api\/contact$/, `/api${route}`);
}

export const REPORT_ENDPOINT = endpointFor(RAW_CONTACT_ENDPOINT, RAW_REPORT_ENDPOINT, '/report');
export const PING_ENDPOINT = endpointFor(RAW_CONTACT_ENDPOINT, RAW_PING_ENDPOINT, '/ping');

/** Keeps only the path: a shared URL may carry tracking params or tokens. */
export function sanitizeSource(raw) {
  const value = String(raw ?? '').trim();
  if (!value) return '';

  try {
    const url = new URL(value, 'https://revilend.uz');
    return url.pathname.slice(0, MAX_REPORT_LENGTH.source);
  } catch {
    return value.split('?')[0].slice(0, MAX_REPORT_LENGTH.source);
  }
}

/** Returns the payload main.py accepts, or null when there is nothing to send. */
export function buildReport({ kind, message, stack = '', source = '', userAgent = '' }) {
  if (!REPORT_KINDS.includes(kind)) return null;

  const text = String(message ?? '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return null;

  return {
    kind,
    message: text.slice(0, MAX_REPORT_LENGTH.message),
    stack: String(stack ?? '').slice(0, MAX_REPORT_LENGTH.stack),
    source: sanitizeSource(source),
    ua: String(userAgent ?? '').slice(0, MAX_REPORT_LENGTH.userAgent),
  };
}

function postJson(endpoint, body) {
  return fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    keepalive: true,
    credentials: 'omit',
  });
}

export function createReporter({
  endpoint = REPORT_ENDPOINT,
  send = postJson,
  limit = SESSION_REPORT_LIMIT,
} = {}) {
  const seen = new Set();
  let sent = 0;

  return {
    report(input) {
      if (!endpoint) return false;

      const report = buildReport(input);
      if (!report) return false;

      const signature = `${report.kind}: ${report.message}`;
      if (seen.has(signature) || sent >= limit) return false;

      seen.add(signature);
      sent += 1;
      Promise.resolve()
        .then(() => send(endpoint, report))
        .catch(() => {});
      return true;
    },
    get sentCount() {
      return sent;
    },
  };
}

const defaultReporter = createReporter();

export function reportClientIssue(input) {
  return defaultReporter.report(input);
}

function currentUserAgent(userAgent) {
  if (userAgent) return userAgent;
  return typeof navigator === 'undefined' ? '' : navigator.userAgent;
}

function currentLocation() {
  return typeof location === 'undefined' ? '' : location.href;
}

/** Wires window `error` and `unhandledrejection` into the reporter. */
export function installErrorReporting({
  target = typeof window === 'undefined' ? null : window,
  reporter = defaultReporter,
  userAgent,
} = {}) {
  if (!target?.addEventListener) return () => {};

  const ua = currentUserAgent(userAgent);

  const onError = (event) => {
    // Resource failures (a missing image, a blocked font) carry no message and
    // are not code errors worth waking the admin for.
    if (!event?.message && !event?.error) return;

    reporter.report({
      kind: 'error',
      message: event.message || event.error?.message || 'Unknown error',
      stack: event.error?.stack ?? '',
      source: event.filename || currentLocation(),
      userAgent: ua,
    });
  };

  const onRejection = (event) => {
    const reason = event?.reason;
    reporter.report({
      kind: 'unhandledrejection',
      message: reason?.message ?? String(reason ?? 'Unhandled rejection'),
      stack: reason?.stack ?? '',
      source: currentLocation(),
      userAgent: ua,
    });
  };

  target.addEventListener('error', onError);
  target.addEventListener('unhandledrejection', onRejection);

  return () => {
    target.removeEventListener('error', onError);
    target.removeEventListener('unhandledrejection', onRejection);
  };
}

/** Reports WebGL context loss and recovery for one canvas. */
export function attachWebglDiagnostics(
  target,
  { reporter = defaultReporter, label = '3d-xona', userAgent } = {}
) {
  if (!target?.addEventListener) return () => {};

  const ua = currentUserAgent(userAgent);

  const onLost = (event) => {
    // preventDefault asks the browser to attempt a restore instead of leaving a
    // black canvas for the rest of the visit.
    event?.preventDefault?.();
    reporter.report({
      kind: 'webgl',
      message: `WebGL konteksti yoʻqoldi (${label})`,
      source: currentLocation(),
      userAgent: ua,
    });
  };

  const onRestored = () => {
    reporter.report({
      kind: 'webgl-restored',
      message: `WebGL konteksti tiklandi (${label})`,
      source: currentLocation(),
      userAgent: ua,
    });
  };

  target.addEventListener('webglcontextlost', onLost);
  target.addEventListener('webglcontextrestored', onRestored);

  return () => {
    target.removeEventListener('webglcontextlost', onLost);
    target.removeEventListener('webglcontextrestored', onRestored);
  };
}

function safeSessionStorage() {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

/** Counts one visit per browser session; the server keeps one per IP per minute. */
export function pingVisit({ storage, endpoint = PING_ENDPOINT, send = postJson } = {}) {
  if (!endpoint) return false;

  const store = storage === undefined ? safeSessionStorage() : storage;

  try {
    if (store?.getItem(PING_STORAGE_KEY)) return false;
    store?.setItem(PING_STORAGE_KEY, '1');
  } catch {
    // A blocked sessionStorage (some WebViews) must not stop the ping.
  }

  Promise.resolve()
    .then(() => send(endpoint, {}))
    .catch(() => {});
  return true;
}
