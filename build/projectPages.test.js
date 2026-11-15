import { describe, expect, it, vi } from 'vitest';
import { projects } from '../src/data/projects.js';
import { projectPages, renderProjectHtml } from './projectPages.js';

const SHELL = `<!doctype html>
<html lang="uz">
  <head>
    <title>Revilend.uz — 2D portfolio va interaktiv 3D xona</title>
    <meta name="description" content="Umumiy tavsif" />
    <meta property="og:title" content="Revilend.uz — Kreativ dasturchi" />
    <meta property="og:description" content="Umumiy tavsif" />
    <meta property="og:url" content="https://revilend.uz" />
    <meta property="og:image" content="https://revilend.uz/og.png" />
    <meta property="og:image:alt" content="Revilend.uz" />
    <meta name="twitter:title" content="Revilend.uz — Kreativ dasturchi" />
    <meta name="twitter:description" content="Umumiy tavsif" />
    <meta name="twitter:image" content="https://revilend.uz/og.png" />
    <link rel="canonical" href="https://revilend.uz/" />
  </head>
  <body><div id="root"></div><script type="module" src="/assets/index-x.js"></script></body>
</html>`;

describe('renderProjectHtml', () => {
  const project = projects.find((item) => item.shots);
  const withoutShot = projects.find((item) => !item.shots);

  it('replaces the generic metadata with the project metadata', () => {
    const html = renderProjectHtml(SHELL, project);

    expect(html).toContain(`<title>${project.title} — Revilend.uz</title>`);
    expect(html).toContain(`content="https://revilend.uz/loyiha/${project.id}/"`);
    expect(html).toContain(`content="https://revilend.uz/og/${project.id}.jpg"`);
    expect(html).toContain(`href="https://revilend.uz/loyiha/${project.id}/"`);
    expect(html).not.toContain('https://revilend.uz/og.png');
    expect(html).not.toContain('Umumiy tavsif');
  });

  it('falls back to the site-wide card when a project has no capture', () => {
    const html = renderProjectHtml(SHELL, withoutShot);

    expect(html).toContain('<title>' + withoutShot.title + ' — Revilend.uz</title>');
    expect(html).toContain(`content="https://revilend.uz/loyiha/${withoutShot.id}/"`);
    expect(html).toContain('content="https://revilend.uz/og.png"');
  });

  it('keeps the app shell so the deep link still boots the SPA', () => {
    const html = renderProjectHtml(SHELL, project);

    expect(html).toContain('<div id="root"></div>');
    expect(html).toContain('/assets/index-x.js');
  });

  it('escapes values that would break the attribute', () => {
    const html = renderProjectHtml(SHELL, {
      ...project,
      title: 'A & B "quoted"',
      description: '<b>bold</b> & more',
    });

    expect(html).toContain('A &amp; B &quot;quoted&quot; — Revilend.uz');
    expect(html).toContain('&lt;b&gt;bold&lt;/b&gt; &amp; more');
  });

  it('honours a custom site origin and card directory', () => {
    const html = renderProjectHtml(SHELL, project, {
      site: 'https://example.dev/',
      cardsDirectory: 'cards',
    });

    expect(html).toContain('https://example.dev/loyiha/' + project.id + '/');
    expect(html).toContain(`https://example.dev/cards/${project.id}.jpg`);
  });
});

describe('projectPages plugin', () => {
  it('emits one HTML file per project', () => {
    const emitFile = vi.fn();
    const plugin = projectPages();

    plugin.generateBundle.call(
      { emitFile, warn: vi.fn() },
      {},
      { 'index.html': { source: SHELL } }
    );

    expect(emitFile).toHaveBeenCalledTimes(projects.length);
    const fileNames = emitFile.mock.calls.map(([file]) => file.fileName);
    for (const project of projects) {
      expect(fileNames).toContain(`loyiha/${project.id}/index.html`);
    }
  });

  it('warns instead of crashing when the shell is missing', () => {
    const warn = vi.fn();
    const plugin = projectPages();

    plugin.generateBundle.call({ emitFile: vi.fn(), warn }, {}, {});

    expect(warn).toHaveBeenCalled();
  });
});
