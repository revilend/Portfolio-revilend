// Emits a real HTML file per project at /loyiha/<id>/ so link previews (above
// all Telegram's) unfurl with the project's own title, description and card.
// A JS-only meta update cannot do that: crawlers never run the app.
import { projects } from '../src/data/projects.js';
import { projectUrl } from '../src/lib/projectUrl.js';

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };

export function escapeAttribute(value) {
  return String(value).replace(/[&<>"]/g, (character) => HTML_ESCAPES[character]);
}

function replaceTag(html, pattern, attribute, value) {
  // If the tag lacks the attribute the replace is a no-op, which is the
  // behaviour we want: never invent metadata the shell does not have.
  return html.replace(pattern, (tag) =>
    tag.replace(new RegExp(`${attribute}="[^"]*"`, 'i'), `${attribute}="${value}"`)
  );
}

function setMeta(html, key, value) {
  const attribute = key.startsWith('og:') ? 'property' : 'name';
  const pattern = new RegExp(`<meta[^>]*${attribute}="${key}"[^>]*>`, 'i');
  return replaceTag(html, pattern, 'content', escapeAttribute(value));
}

export function renderProjectHtml(
  shell,
  project,
  { site = 'https://revilend.uz', cardsDirectory = 'og', cardExtension = 'jpg' } = {}
) {
  const url = projectUrl(project.id, site);
  const origin = site.replace(/\/+$/, '');
  // Every project ships its own 1200×630 card, so a link shared in Telegram
  // unfurls as that project instead of a generic homepage preview.
  const image = `${origin}/${cardsDirectory}/${project.id}.${cardExtension}`;
  const title = `${project.title} — Revilend.uz`;
  const description = project.description;

  let html = shell;
  html = html.replace(/<title>[^<]*<\/title>/i, `<title>${escapeAttribute(title)}</title>`);
  html = replaceTag(html, /<link[^>]*rel="canonical"[^>]*>/i, 'href', escapeAttribute(url));

  const meta = [
    ['description', description],
    ['og:title', title],
    ['og:description', description],
    ['og:url', url],
    ['og:image', image],
    ['og:image:alt', `${project.title} — ${project.tagline}`],
    ['twitter:title', title],
    ['twitter:description', description],
    ['twitter:image', image],
  ];

  for (const [key, value] of meta) {
    html = setMeta(html, key, value);
  }

  return html;
}

export function projectPages({
  site = 'https://revilend.uz',
  cardsDirectory = 'og',
  cardExtension = 'jpg',
} = {}) {
  return {
    name: 'revilend-project-pages',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const shell = bundle['index.html'];
      if (!shell || typeof shell.source !== 'string') {
        this.warn('index.html missing from the bundle: project pages were not generated');
        return;
      }

      for (const project of projects) {
        this.emitFile({
          type: 'asset',
          fileName: `loyiha/${project.id}/index.html`,
          source: renderProjectHtml(shell.source, project, {
            site,
            cardsDirectory,
            cardExtension,
          }),
        });
      }
    },
  };
}
