import { describe, expect, it } from 'vitest';
import names from '../scripts/names-pt.json';
import exercises from '../src/data/exercises.json';

describe('portuguese names', () => {
  it('no two exercises share a name, so the list never shows two identical rows', () => {
    const values = Object.values(names as Record<string, string>);
    expect(values.filter((name, i) => values.indexOf(name) !== i)).toEqual([]);
  });

  it('every name starts with a capital letter and has no stray spaces', () => {
    for (const name of Object.values(names as Record<string, string>)) {
      expect(name).toBe(name.trim());
      expect(name[0]).toBe(name[0].toUpperCase());
    }
  });

  it('every name belongs to an exercise that is in the list', () => {
    const ids = new Set(exercises.map((e) => e.id));
    expect(Object.keys(names).filter((id) => !ids.has(id))).toEqual([]);
  });
});
