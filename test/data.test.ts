import { describe, expect, it } from 'vitest';
import exercises from '../src/data/exercises.json';

describe('exercise list', () => {
  it('ids are unique and safe to put in a link', () => {
    const ids = exercises.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.filter((id) => !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id))).toEqual([]);
  });

  it('every exercise works at least one muscle and says how to do it', () => {
    expect(exercises.filter((e) => e.primary.length === 0 || e.steps.length === 0).map((e) => e.id)).toEqual([]);
  });
});
