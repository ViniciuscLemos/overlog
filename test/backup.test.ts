import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { backupFileName, makeBackup, parseBackup, restoreBackup } from '../src/lib/backup';
import { createRoutine, db, saveRoutine } from '../src/lib/db';
import { addExercise } from '../src/lib/routines';

beforeEach(async () => {
  await Promise.all([db.routines.clear(), db.workouts.clear(), db.sets.clear()]);
});

describe('backup', () => {
  it('saves and restores the workouts as they were', async () => {
    const a = (await createRoutine('Upper 1')) as number;
    await saveRoutine(a, { exercises: addExercise([], 'bench-press') });
    await createRoutine('Lower 1');
    const text = JSON.stringify(await makeBackup());

    await db.routines.clear();
    await createRoutine('something else');
    await restoreBackup(parseBackup(text));

    const routines = await db.routines.orderBy('position').toArray();
    expect(routines.map((r) => r.name)).toEqual(['Upper 1', 'Lower 1']);
    expect(routines[0].exercises[0].exerciseId).toBe('bench-press');
  });

  it('refuses files that are not a backup', () => {
    expect(() => parseBackup('not json')).toThrow('não é um backup');
    expect(() => parseBackup('{"routines": []}')).toThrow('não é um backup');
    expect(() => parseBackup('{"app": "overlog", "version": 2, "routines": []}')).toThrow('versão mais nova');
  });

  it('fixes broken numbers instead of saving them', () => {
    const backup = parseBackup(JSON.stringify({
      app: 'overlog',
      version: 1,
      routines: [{ name: '', exercises: [{ exerciseId: 'squat', sets: 0, repMin: 12, repMax: 8 }, { sets: 3 }] }],
    }));
    expect(backup.routines[0].name).toBe('Treino');
    expect(backup.routines[0].exercises).toEqual([
      { exerciseId: 'squat', sets: 1, repMin: 12, repMax: 12, restSeconds: 180, note: '' },
    ]);
  });

  it('names the file with the date', () => {
    expect(backupFileName(new Date(2026, 9, 5))).toBe('overlog-2026-10-05.json');
  });
});
