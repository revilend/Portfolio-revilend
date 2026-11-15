import { hasShots, shotFallback, shotSrcSet } from '../lib/projectShots.js';

/**
 * Real capture of the shipped product, served as AVIF then WebP with a width-based srcset.
 * Projects without a capture render nothing so the card keeps its gradient placeholder.
 */
export default function ProjectShot({
  project,
  sizes = '100vw',
  priority = false,
  className = '',
}) {
  if (!hasShots(project)) return null;

  const { alt, width, height } = project.shots;

  return (
    <picture className="block h-full w-full">
      <source type="image/avif" srcSet={shotSrcSet(project.id, 'avif')} sizes={sizes} />
      <source type="image/webp" srcSet={shotSrcSet(project.id, 'webp')} sizes={sizes} />
      <img
        src={shotFallback(project.id)}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={className}
      />
    </picture>
  );
}
