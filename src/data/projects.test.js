import { describe, expect, it } from 'vitest';
import { projects } from './projects.js';

const TONES = ['green', 'amber', 'cyan'];

describe('projects data', () => {
  it('has unique ids and indexes', () => {
    const ids = projects.map((project) => project.id);
    const indexes = projects.map((project) => project.index);

    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(indexes).size).toBe(indexes.length);
  });

  it('numbers projects in display order', () => {
    expect(projects.map((project) => project.index)).toEqual(
      projects.map((_, index) => String(index + 1).padStart(2, '0'))
    );
  });

  it('uses a status tone the badge knows', () => {
    for (const project of projects) {
      expect(TONES).toContain(project.status.tone);
      expect(project.status.label.length).toBeGreaterThan(0);
    }
  });

  it('keeps every url absolute and https, or null for closed projects', () => {
    for (const project of projects) {
      if (project.url === null) continue;
      expect(() => new URL(project.url)).not.toThrow();
      expect(project.url.startsWith('https://')).toBe(true);
    }
  });

  it('provides the copy the cards and drawer render', () => {
    for (const project of projects) {
      expect(project.stack.length).toBeGreaterThan(0);
      expect(project.features.length).toBeGreaterThan(0);
      expect(project.description.length).toBeGreaterThan(0);
      expect(project.title.length).toBeGreaterThan(0);
      expect(project.tagline.length).toBeGreaterThan(0);
    }
  });
});
