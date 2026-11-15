/**
 * Helpers for the per-project screenshots in `public/shots/<id>/`.
 *
 * Files are produced by `npm run shots` and follow `<width>.<format>`, so both the `srcset`
 * and the `<picture>` fallbacks can be derived instead of hand-written per project.
 */
const BASE_PATH = (import.meta.env.BASE_URL ?? '/').replace(/\/+$/, '');

/** Widths generated for every screenshot — keep in sync with scripts/shots.mjs. */
export const SHOT_WIDTHS = [1440, 720, 390];

export const SHOT_FORMATS = ['avif', 'webp'];

export function shotUrl(projectId, width, format) {
  return `${BASE_PATH}/shots/${projectId}/${width}.${format}`;
}

export function shotSrcSet(projectId, format) {
  return SHOT_WIDTHS.map((width) => `${shotUrl(projectId, width, format)} ${width}w`).join(', ');
}

/** A project only shows media when it carries a real capture with alt text. */
export function hasShots(project) {
  return Boolean(project?.id && project?.shots?.alt);
}

/** Smallest generated file, used as the `<img>` fallback when no `<source>` matches. */
export function shotFallback(projectId) {
  return shotUrl(projectId, SHOT_WIDTHS[SHOT_WIDTHS.length - 1], 'webp');
}
