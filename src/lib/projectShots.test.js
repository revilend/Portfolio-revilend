import { describe, expect, it } from 'vitest';
import { hasShots, SHOT_WIDTHS, shotFallback, shotSrcSet, shotUrl } from './projectShots.js';

const project = {
  id: 'teachermuzaffar',
  shots: { alt: 'teachermuzaffar.uz bosh sahifasi', width: 1440, height: 900 },
};

describe('shotUrl', () => {
  it('builds a per-project, per-width file path', () => {
    expect(shotUrl('teachermuzaffar', 1440, 'avif')).toBe('/shots/teachermuzaffar/1440.avif');
    expect(shotUrl('echoes-of-room-404', 390, 'webp')).toBe('/shots/echoes-of-room-404/390.webp');
  });
});

describe('shotSrcSet', () => {
  it('lists every generated width with its density descriptor', () => {
    expect(shotSrcSet('teachermuzaffar', 'avif')).toBe(
      '/shots/teachermuzaffar/1440.avif 1440w, ' +
        '/shots/teachermuzaffar/720.avif 720w, ' +
        '/shots/teachermuzaffar/390.avif 390w'
    );
  });

  it('emits one entry per generated width', () => {
    expect(shotSrcSet('teachermuzaffar', 'webp').split(', ')).toHaveLength(SHOT_WIDTHS.length);
  });
});

describe('shotFallback', () => {
  it('points at the smallest generated webp', () => {
    expect(shotFallback('teachermuzaffar')).toBe('/shots/teachermuzaffar/390.webp');
  });
});

describe('hasShots', () => {
  it('requires a real capture with alt text', () => {
    expect(hasShots(project)).toBe(true);
    expect(hasShots({ id: 'telegram-automation' })).toBe(false);
    expect(hasShots({ id: 'x', shots: { alt: '' } })).toBe(false);
    expect(hasShots(null)).toBe(false);
  });
});
