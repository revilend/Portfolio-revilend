/**
 * Converts screenshot masters into the responsive AVIF/WebP set the site ships.
 *
 *   assets-src/shots/<project-id>.png  →  public/shots/<project-id>/<width>.<format>
 *
 * Masters are real captures of the live products (see README), kept in the repo so the
 * derived files can be rebuilt at any width without re-shooting.
 *
 *   npm run shots
 */
import { mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_DIR = path.join(ROOT, 'assets-src/shots');
const OUTPUT_DIR = path.join(ROOT, 'public/shots');

/** Widths the UI actually needs: full card/drawer, half, and phone. */
const WIDTHS = [1440, 720, 390];

const FORMATS = {
  avif: { quality: 55, effort: 4 },
  webp: { quality: 82 },
};

const MASTER_PATTERN = /^(?<id>[a-z0-9-]+)\.png$/;

async function convertMaster(file) {
  const match = MASTER_PATTERN.exec(file);
  if (!match) {
    console.warn(`  skip  ${file} (expected <project-id>.png)`);
    return [];
  }

  const { id } = match.groups;
  const sourcePath = path.join(SOURCE_DIR, file);
  const targetDir = path.join(OUTPUT_DIR, id);
  await mkdir(targetDir, { recursive: true });

  const { width: sourceWidth } = await sharp(sourcePath).metadata();
  const written = [];

  for (const width of WIDTHS) {
    if (sourceWidth < width) continue;
    for (const [format, options] of Object.entries(FORMATS)) {
      const target = path.join(targetDir, `${width}.${format}`);
      const pipeline = sharp(sourcePath).resize({ width, withoutEnlargement: true });
      const info = await pipeline[format](options).toFile(target);
      written.push(
        `${path.relative(ROOT, target)}  ${info.width}x${info.height}  ${Math.round(info.size / 1024)} KB`
      );
    }
  }

  return written;
}

const masters = (await readdir(SOURCE_DIR)).filter((file) => file.endsWith('.png')).sort();
const rows = [];
for (const file of masters) rows.push(...(await convertMaster(file)));

console.log(`Generated ${rows.length} files from ${masters.length} masters:\n`);
for (const row of rows) console.log(`  ${row}`);
