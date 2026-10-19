import { describe, expect, it } from 'vitest';
import data from '../src/data/exercises.json';
import { normalize, search, similar, SYNONYMS, type Exercise } from '../src/lib/exercises';
import { EQUIPMENT, MUSCLES } from '../src/lib/labels';

const all = data as Exercise[];
const none = { text: '', equipment: null, muscle: null };

describe('normalize', () => {
  it('drops accents, case and punctuation', () => {
    expect(normalize('Elevação Pélvica (hip-thrust)')).toBe('elevacao pelvica hip thrust');
  });
});

describe('search', () => {
  it('finds by the Portuguese name, without accents', () => {
    const names = search(all, { ...none, text: 'elevacao lateral' }).map((e) => e.pt);
    expect(names).toContain('Elevação lateral');
  });

  it('finds by the English name too', () => {
    expect(search(all, { ...none, text: 'bench press' }).length).toBeGreaterThan(5);
  });

  it('every word has to match, in any order', () => {
    const found = search(all, { ...none, text: 'halteres supino' });
    expect(found.length).toBeGreaterThan(0);
    expect(found.every((e) => normalize(`${e.pt} ${e.en}`).includes('supino'))).toBe(true);
  });

  it('understands portuguese words in english names', () => {
    const found = search(all, { ...none, text: 'panturrilha smith reverse' });
    expect(found.map((e) => e.id)).toContain('smith-machine-reverse-calf-raises');
  });

  it('a synonym has to start a word: "remada" is row, not narrow', () => {
    const found = search(all, { ...none, text: 'remada' });
    expect(found.length).toBeGreaterThan(5);
    expect(found.filter((e) => normalize(e.en).includes('narrow') && !/\brows?\b/.test(normalize(e.en)))).toEqual([]);
  });

  it('filters by equipment and muscle', () => {
    const found = search(all, { ...none, equipment: 'cable', muscle: 'triceps' });
    expect(found.length).toBeGreaterThan(3);
    expect(found.every((e) => e.equipment === 'cable' && e.primary.includes('triceps'))).toBe(true);
  });

  it('puts the well-known exercises first', () => {
    const found = search(all, { ...none, muscle: 'chest' });
    expect(found[0].pt).not.toBeNull();
  });
});

describe('data', () => {
  it('has a label for every equipment and muscle in the list', () => {
    for (const e of all) {
      expect(EQUIPMENT[e.equipment], e.id).toBeDefined();
      for (const m of [...e.primary, ...e.secondary]) expect(MUSCLES[m], `${e.id} ${m}`).toBeDefined();
    }
  });

  it('every exercise has its two drawings', () => {
    expect(all.filter((e) => e.images.length !== 2)).toEqual([]);
  });
});

describe('similar', () => {
  it('suggests other exercises for the same muscle, same equipment first', () => {
    const bench = all.find((e) => e.id === 'bench-press')!;
    const found = similar(all, bench);
    expect(found.length).toBe(6);
    expect(found.every((e) => e.primary[0] === 'chest' && e.id !== 'bench-press')).toBe(true);
    expect(found[0].equipment).toBe('barbell');
  });
});

describe('synonyms', () => {
  it('are written the way the search compares words (no accents, lowercase)', () => {
    for (const [word, english] of Object.entries(SYNONYMS)) {
      expect(word).toBe(normalize(word));
      for (const e of english) expect(e).toBe(normalize(e));
    }
  });
});
