import { describe, expect, it, vi } from 'vitest';
import {
  attachWebglDiagnostics,
  buildReport,
  createReporter,
  endpointFor,
  installErrorReporting,
  MAX_REPORT_LENGTH,
  pingVisit,
  sanitizeSource,
} from './telemetry.js';

describe('endpointFor', () => {
  it('derives sibling routes from the contact endpoint', () => {
    expect(endpointFor('https://bot.example/api/contact', '', '/report')).toBe(
      'https://bot.example/api/report'
    );
    expect(endpointFor('/api/contact/', '', '/ping')).toBe('/api/ping');
  });

  it('prefers an explicit endpoint and refuses unrelated bases', () => {
    expect(endpointFor('https://bot.example/api/contact', 'https://x.dev/r', '/report')).toBe(
      'https://x.dev/r'
    );
    expect(endpointFor('https://bot.example/other', '', '/report')).toBe('');
    expect(endpointFor('', '', '/report')).toBe('');
  });
});

describe('sanitizeSource', () => {
  it('keeps the path and drops query or hash', () => {
    expect(sanitizeSource('https://revilend.uz/loyiha/teachermuzaffar/?token=abc#top')).toBe(
      '/loyiha/teachermuzaffar/'
    );
    expect(sanitizeSource('relative/path?x=1')).toBe('/relative/path');
    expect(sanitizeSource('')).toBe('');
  });
});

describe('buildReport', () => {
  it('rejects unknown kinds and empty messages', () => {
    expect(buildReport({ kind: 'nope', message: 'x' })).toBeNull();
    expect(buildReport({ kind: 'error', message: '   ' })).toBeNull();
  });

  it('normalizes whitespace and truncates every field', () => {
    const report = buildReport({
      kind: 'webgl',
      message: `WebGL\n konteksti   yoʻqoldi ${'x'.repeat(600)}`,
      stack: 'y'.repeat(2000),
      source: 'https://revilend.uz/?secret=1',
      userAgent: 'u'.repeat(500),
    });

    expect(report.message.startsWith('WebGL konteksti yoʻqoldi')).toBe(true);
    expect(report.message.length).toBe(MAX_REPORT_LENGTH.message);
    expect(report.stack.length).toBe(MAX_REPORT_LENGTH.stack);
    expect(report.source).toBe('/');
    expect(report.ua.length).toBe(MAX_REPORT_LENGTH.userAgent);
  });
});

describe('createReporter', () => {
  it('sends at most one report per distinct failure and respects the session limit', () => {
    const send = vi.fn(() => Promise.resolve());
    const reporter = createReporter({ endpoint: 'https://bot.example/api/report', send });

    expect(reporter.report({ kind: 'error', message: 'boom' })).toBe(true);
    expect(reporter.report({ kind: 'error', message: 'boom' })).toBe(false);
    expect(reporter.report({ kind: 'error', message: 'second' })).toBe(true);
    expect(reporter.report({ kind: 'error', message: 'third' })).toBe(true);
    expect(reporter.report({ kind: 'error', message: 'fourth' })).toBe(false);
    expect(reporter.sentCount).toBe(3);
  });

  it('stays silent without an endpoint', () => {
    const send = vi.fn();
    const reporter = createReporter({ endpoint: '', send });

    expect(reporter.report({ kind: 'error', message: 'boom' })).toBe(false);
    expect(send).not.toHaveBeenCalled();
  });
});

describe('installErrorReporting', () => {
  it('forwards window errors and unhandled rejections, and cleans up', () => {
    const target = new EventTarget();
    const report = vi.fn(() => true);
    const stop = installErrorReporting({ target, reporter: { report }, userAgent: 'UA' });

    const error = new Event('error');
    error.message = 'Cannot read properties of undefined';
    error.filename = 'https://revilend.uz/assets/index.js';
    target.dispatchEvent(error);

    const rejection = new Event('unhandledrejection');
    rejection.reason = new Error('Network down');
    target.dispatchEvent(rejection);

    expect(report).toHaveBeenCalledTimes(2);
    expect(report.mock.calls[0][0]).toMatchObject({
      kind: 'error',
      message: 'Cannot read properties of undefined',
      userAgent: 'UA',
    });
    expect(report.mock.calls[1][0]).toMatchObject({
      kind: 'unhandledrejection',
      message: 'Network down',
    });

    stop();
    target.dispatchEvent(error);
    expect(report).toHaveBeenCalledTimes(2);
  });

  it('ignores resource failures that carry no message', () => {
    const target = new EventTarget();
    const report = vi.fn(() => true);
    installErrorReporting({ target, reporter: { report } });

    target.dispatchEvent(new Event('error'));
    expect(report).not.toHaveBeenCalled();
  });
});

describe('attachWebglDiagnostics', () => {
  it('reports context loss, asks for a restore, and reports recovery', () => {
    const canvas = new EventTarget();
    const report = vi.fn(() => true);
    attachWebglDiagnostics(canvas, { reporter: { report }, label: '3d-xona', userAgent: 'UA' });

    const lost = new Event('webglcontextlost', { cancelable: true });
    canvas.dispatchEvent(lost);

    expect(lost.defaultPrevented).toBe(true);
    expect(report.mock.calls[0][0]).toMatchObject({
      kind: 'webgl',
      message: 'WebGL konteksti yoʻqoldi (3d-xona)',
    });

    canvas.dispatchEvent(new Event('webglcontextrestored'));
    expect(report.mock.calls[1][0]).toMatchObject({ kind: 'webgl-restored' });
  });
});

describe('pingVisit', () => {
  const createStorage = () => {
    const store = new Map();
    return {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => store.set(key, value),
    };
  };

  it('counts once per session', async () => {
    const storage = createStorage();
    const send = vi.fn(() => Promise.resolve());

    expect(pingVisit({ storage, endpoint: 'https://bot.example/api/ping', send })).toBe(true);
    expect(pingVisit({ storage, endpoint: 'https://bot.example/api/ping', send })).toBe(false);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(send).toHaveBeenCalledTimes(1);
  });

  it('still pings when storage is blocked, and stays off without an endpoint', () => {
    const blocked = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    };
    const send = vi.fn(() => Promise.resolve());

    expect(pingVisit({ storage: blocked, endpoint: 'https://bot.example/api/ping', send })).toBe(
      true
    );
    expect(pingVisit({ storage: blocked, endpoint: '', send })).toBe(false);
  });
});
