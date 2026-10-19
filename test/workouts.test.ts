import { describe, expect, it } from 'vitest';
import {
  clockLabel, durationLabel, estimatedMax, formatKg, formatSet, incrementFor, nextStep, parseNumber, stepText, summarize,
} from '../src/lib/workouts';

const set = (weightKg: number | null, reps: number | null, rir: number | null = 1, done = true) => ({ weightKg, reps, rir, done });
const range = { repMin: 5, repMax: 9 };

describe('typing numbers', () => {
  it('takes a comma or a dot', () => {
    expect(parseNumber('82,5')).toBe(82.5);
    expect(parseNumber(' 80 ')).toBe(80);
    expect(parseNumber('')).toBeNull();
    expect(parseNumber('abc')).toBeNull();
    expect(parseNumber('-5')).toBeNull();
  });

  it('shows kilos the brazilian way', () => {
    expect(formatKg(82.5)).toBe('82,5');
    expect(formatKg(80)).toBe('80');
    expect(formatSet({ weightKg: 80, reps: 8, rir: 1 })).toBe('80 kg × 8 (RIR 1)');
    expect(formatSet({ weightKg: null, reps: 12, rir: null })).toBe('12 reps');
  });
});

describe('next step', () => {
  it('nothing logged yet', () => {
    expect(nextStep([], range, 2)).toEqual({ kind: 'first' });
    expect(nextStep([set(80, 8, 1, false)], range, 2)).toEqual({ kind: 'first' });
  });

  it('every set at the top of the range: go up', () => {
    expect(nextStep([set(80, 9), set(80, 9)], range, 2)).toEqual({ kind: 'up', weightKg: 82, from: 80 });
  });

  it('in the range: same weight, one more rep', () => {
    expect(nextStep([set(80, 9), set(80, 7)], range, 2)).toEqual({ kind: 'reps', weightKg: 80 });
  });

  it('below the range at failure: go down', () => {
    expect(nextStep([set(80, 4, 0), set(80, 3, 0)], range, 2)).toEqual({ kind: 'down', weightKg: 78 });
  });

  it('far from failure: get closer before anything else', () => {
    expect(nextStep([set(80, 7, 4), set(80, 6, 3)], range, 2)).toEqual({ kind: 'closer', weightKg: 80 });
  });

  it('a lighter back-off set does not hold the progression back', () => {
    expect(nextStep([set(80, 9), set(80, 9), set(60, 6)], range, 2)).toMatchObject({ kind: 'up', weightKg: 82 });
  });

  it('says it in plain words', () => {
    expect(stepText({ kind: 'up', weightKg: 82.5, from: 80 }, false)).toContain('sobe pra 82,5 kg');
    expect(stepText({ kind: 'up', weightKg: 2, from: 0 }, true)).toContain('carga extra');
    expect(stepText({ kind: 'reps', weightKg: 0 }, true)).toContain('peso do corpo');
  });

  it('jumps by what the gym has', () => {
    expect(incrementFor('machine')).toBe(5);
    expect(incrementFor('dumbbell')).toBe(2);
    expect(incrementFor('something new')).toBe(2);
  });
});

describe('summary', () => {
  it('counts only done sets', () => {
    const sets = [
      { exerciseId: 'a', ...set(80, 8) },
      { exerciseId: 'a', ...set(80, 7) },
      { exerciseId: 'b', ...set(20, 10, null, false) },
    ];
    expect(summarize(sets)).toEqual({ sets: 2, volumeKg: 1200, exercises: 1 });
  });

  it('labels time', () => {
    expect(durationLabel(47 * 60000)).toBe('47 min');
    expect(durationLabel(75 * 60000)).toBe('1h15');
    expect(clockLabel(95000)).toBe('1:35');
    expect(clockLabel(-10)).toBe('0:00');
  });

  it('estimated max goes up with weight and with reps', () => {
    expect(estimatedMax(100, 8)).toBeGreaterThan(estimatedMax(100, 6));
    expect(estimatedMax(102, 6)).toBeGreaterThan(estimatedMax(100, 6));
  });
});
