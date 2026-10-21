import { afterEach, describe, expect, it, vi } from 'vitest';
import { readSettings } from '../src/lib/settings';

function fakeStorage(saved: string | null) {
  vi.stubGlobal('localStorage', { getItem: () => saved, setItem: () => {} });
}

describe('settings', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('starts with the defaults on a new phone', () => {
    fakeStorage(null);
    expect(readSettings()).toEqual({ rpg: true });
  });

  it('keeps what was saved', () => {
    fakeStorage('{"rpg":false}');
    expect(readSettings().rpg).toBe(false);
  });

  it('a broken value falls back to the defaults instead of breaking the page', () => {
    fakeStorage('{rpg');
    expect(readSettings()).toEqual({ rpg: true });
  });
});
