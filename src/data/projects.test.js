import { describe, expect, it } from 'vitest';
import { PROJECT_CATEGORIES, projects } from './projects.js';

const TONES = ['green', 'amber', 'cyan'];
const CATEGORY_IDS = PROJECT_CATEGORIES.filter((item) => item.id !== 'all').map((item) => item.id);

describe('projects data', () => {
  it('lists the twelve completed projects with unique ids and indexes', () => {
    expect(projects).toHaveLength(12);

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

  it('only uses categories the filter pills know', () => {
    for (const project of projects) {
      expect(CATEGORY_IDS).toContain(project.category);
    }
  });

  it('features exactly the two bento projects', () => {
    const featured = projects.filter((project) => project.featured).map((project) => project.id);
    expect(featured).toEqual(['revilend-games', 'teachermuzaffar']);
  });

  it('uses a status tone the badge knows', () => {
    for (const project of projects) {
      expect(TONES).toContain(project.status.tone);
      expect(project.status.label.length).toBeGreaterThan(0);
    }
  });

  it('keeps every live url absolute and https, or null for source-only projects', () => {
    for (const project of projects) {
      if (project.url === null) continue;
      expect(() => new URL(project.url)).not.toThrow();
      expect(project.url.startsWith('https://')).toBe(true);
    }
  });

  it('links every project to a GitHub repository', () => {
    for (const project of projects) {
      expect(project.repo).toMatch(/^https:\/\/github\.com\/revilend\/[\w.-]+\/?$/);
    }
  });

  it('provides the copy the cards and modal render', () => {
    for (const project of projects) {
      expect(project.stack.length).toBeGreaterThan(0);
      expect(project.description.length).toBeGreaterThan(20);
      expect(project.title.length).toBeGreaterThan(0);
      expect(project.tagline.length).toBeGreaterThan(0);
    }
  });

  it('only carries a case study where the facts are verified', () => {
    for (const project of projects) {
      if (!project.problem) continue;

      expect(project.problem.length).toBeGreaterThan(80);
      expect(project.constraints.length).toBeGreaterThan(1);
      expect(project.decisions.length).toBeGreaterThan(1);
      expect(project.results.length).toBeGreaterThan(1);

      for (const decision of project.decisions) {
        expect(decision.choice.length).toBeGreaterThan(3);
        expect(decision.why.length).toBeGreaterThan(40);
      }

      for (const result of project.results) {
        expect(result.value).toMatch(/^[\d.,]+\s?\p{L}*$/u);
        expect(result.label.length).toBeGreaterThan(3);
      }
    }
  });

  it('only shows a screenshot when it has alt text', () => {
    for (const project of projects) {
      if (!project.shots) continue;
      expect(project.shots.alt.length).toBeGreaterThan(30);
      expect(project.shots.width).toBeGreaterThan(0);
      expect(project.shots.height).toBeGreaterThan(0);
    }
  });

  it('keeps the old feature list out of the data', () => {
    for (const project of projects) {
      expect(project).not.toHaveProperty('features');
    }
  });
});
