import { describe, expect, it } from 'vitest';
import { projectPath, projectUrl, readProjectId } from './projectUrl.js';

describe('projectPath / projectUrl', () => {
  it('builds the addressable path for a project', () => {
    expect(projectPath('teachermuzaffar')).toBe('/loyiha/teachermuzaffar/');
  });

  it('builds an absolute url without doubling slashes', () => {
    expect(projectUrl('echoes-of-room-404', 'https://revilend.uz/')).toBe(
      'https://revilend.uz/loyiha/echoes-of-room-404/'
    );
  });
});

describe('readProjectId', () => {
  it('reads a project from the path', () => {
    expect(readProjectId({ pathname: '/loyiha/teachermuzaffar/' })).toBe('teachermuzaffar');
  });

  it('ignores anything after the id', () => {
    expect(readProjectId({ pathname: '/loyiha/teachermuzaffar/extra/' })).toBe('teachermuzaffar');
  });

  it('reads the query fallback', () => {
    expect(readProjectId({ pathname: '/', search: '?project=telegram-automation' })).toBe(
      'telegram-automation'
    );
  });

  it('rejects malformed ids', () => {
    expect(readProjectId({ pathname: '/loyiha/Teacher Muzaffar/' })).toBeNull();
    expect(readProjectId({ pathname: '/loyiha/' })).toBeNull();
    expect(readProjectId({ pathname: '/', search: '?project=' })).toBeNull();
  });

  it('returns null for the home page and for a missing location', () => {
    expect(readProjectId({ pathname: '/', search: '' })).toBeNull();
    expect(readProjectId(null)).toBeNull();
  });
});
