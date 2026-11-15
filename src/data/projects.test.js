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
      expect(project.description.length).toBeGreaterThan(0);
      expect(project.title.length).toBeGreaterThan(0);
      expect(project.tagline.length).toBeGreaterThan(0);
    }
  });

  it('carries a complete case study: problem, decisions, results', () => {
    for (const project of projects) {
      expect(project.problem.length).toBeGreaterThan(80);
      expect(project.constraints.length).toBeGreaterThan(1);
      expect(project.decisions.length).toBeGreaterThan(2);
      expect(project.results.length).toBeGreaterThan(2);
    }
  });

  it('explains why each architectural decision was made', () => {
    for (const project of projects) {
      for (const decision of project.decisions) {
        expect(decision.choice.length).toBeGreaterThan(3);
        expect(decision.why.length).toBeGreaterThan(40);
      }
    }
  });

  it('reports results as a value with a unit or label', () => {
    for (const project of projects) {
      for (const result of project.results) {
        expect(result.value).toMatch(/^[\d.,]+\s?\p{L}*$/u);
        expect(result.label.length).toBeGreaterThan(3);
      }
    }
  });

  it('keeps the old feature list out of the data', () => {
    for (const project of projects) {
      expect(project).not.toHaveProperty('features');
    }
  });
});
