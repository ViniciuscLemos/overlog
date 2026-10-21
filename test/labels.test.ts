import { describe, expect, it } from 'vitest';
import exercises from '../src/data/exercises.json';
import { mechanicLabel } from '../src/lib/labels';

describe('labels', () => {
  it('has a label for every kind of movement in the list', () => {
    const mechanics = new Set(exercises.map((e) => e.mechanic).filter((m) => m !== null));
    expect([...mechanics].filter((m) => !mechanicLabel(m))).toEqual([]);
  });

  it('shows both when an exercise is two kinds at once, and nothing for an unknown one', () => {
    expect(mechanicLabel('compound, isolation')).toBe('Composto (várias articulações) / Isolado (uma articulação)');
    expect(mechanicLabel(null)).toBeNull();
    expect(mechanicLabel('mystery')).toBeNull();
  });
});
