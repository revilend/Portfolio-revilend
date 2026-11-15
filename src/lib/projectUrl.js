// Project URLs are addressable: /loyiha/<id>/ serves a real HTML file with the
// project's own metadata (see build/projectPages.js), and ?project=<id> is the
// fallback for hosts that cannot serve nested index files.
export const PROJECT_ROUTE_PREFIX = '/loyiha/';

const PROJECT_ID_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

export function projectPath(id) {
  return `${PROJECT_ROUTE_PREFIX}${id}/`;
}

export function projectUrl(id, site = 'https://revilend.uz') {
  return `${site.replace(/\/+$/, '')}${projectPath(id)}`;
}

export function readProjectId(location) {
  if (!location) return null;

  const pathname = location.pathname ?? '';
  if (pathname.startsWith(PROJECT_ROUTE_PREFIX)) {
    const [id] = pathname.slice(PROJECT_ROUTE_PREFIX.length).split('/');
    return id && PROJECT_ID_PATTERN.test(id) ? id : null;
  }

  const search = location.search ?? '';
  if (search) {
    const id = new URLSearchParams(search).get('project');
    return id && PROJECT_ID_PATTERN.test(id) ? id : null;
  }

  return null;
}
