import { describe, expect, it } from 'vitest';
import { STUDIES } from '../src/data/studies';

describe('studies', () => {
  it('every study has a doi, once', () => {
    const dois = STUDIES.map((s) => s.doi);
    expect(dois.every((d) => /^10\.\d{4,}\/\S+$/.test(d))).toBe(true);
    expect(new Set(dois).size).toBe(dois.length);
  });

  it('every study says what it means in practice', () => {
    expect(STUDIES.every((s) => s.takeaway.length > 10 && s.summary.length > 40)).toBe(true);
  });

  it('every study has its english version and a believable year', () => {
    const now = new Date().getFullYear();
    expect(STUDIES.every((s) => s.en.takeaway.length > 10 && s.en.summary.length > 40)).toBe(true);
    expect(STUDIES.every((s) => s.year >= 1950 && s.year <= now)).toBe(true);
  });
});
