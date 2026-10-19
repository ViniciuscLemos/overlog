import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { importShared, isSharedWorkout, partnerShare, shareFileName } from '../src/lib/backup';
import {
  createRoutine, db, exerciseHistory, finishWorkout, lastPartners, saveNote, saveRoutine, startWorkout, updateSet, workoutSets,
} from '../src/lib/db';
import { addExercise } from '../src/lib/routines';

let upper: number;
let clock = 1_000;

beforeEach(async () => {
  await Promise.all([db.routines.clear(), db.workouts.clear(), db.sets.clear()]);
  upper = (await createRoutine('Upper 1')) as number;
  await saveRoutine(upper, { exercises: addExercise([], 'bench-press') });
});

const check = (id: number, weightKg: number, reps: number) =>
  updateSet(id, { weightKg, reps, rir: 1, done: true, doneAt: clock++ });

async function workoutTogether() {
  const id = await startWorkout(upper, ['Maria']);
  const sets = await workoutSets(id);
  const mine = sets.filter((s) => !s.who);
  const hers = sets.filter((s) => s.who === 'Maria');
  await check(mine[0].id!, 80, 8);
  await check(hers[0].id!, 40, 10);
  await check(hers[1].id!, 40, 9);
  await finishWorkout(id);
  return id;
}

describe('training together', () => {
  it('each person gets their own sets', async () => {
    const id = await startWorkout(upper, ['Maria']);
    const sets = await workoutSets(id);
    expect(sets.filter((s) => !s.who)).toHaveLength(2);
    expect(sets.filter((s) => s.who === 'Maria')).toHaveLength(2);
    expect(await lastPartners()).toEqual(['Maria']);
  });

  it('my history only has my sets, hers only hers', async () => {
    await workoutTogether();
    expect((await exerciseHistory('bench-press'))[0].sets.map((s) => s.weightKg)).toEqual([80]);
    expect((await exerciseHistory('bench-press', undefined, 'Maria'))[0].sets.map((s) => s.weightKg)).toEqual([40, 40]);
  });

  it('her part goes to her phone as a workout of her own, once', async () => {
    const id = await workoutTogether();
    const shared = JSON.parse(JSON.stringify(await partnerShare(id, 'Maria', 'Vinicius')));
    expect(isSharedWorkout(shared)).toBe(true);
    expect(shared.sets).toHaveLength(2);

    await Promise.all([db.workouts.clear(), db.sets.clear()]); // her phone
    const imported = await importShared(shared);
    expect((await db.workouts.get(imported))?.name).toBe('Upper 1');
    expect((await exerciseHistory('bench-press'))[0].sets.map((s) => s.reps)).toEqual([10, 9]);
    await expect(importShared(shared)).rejects.toThrow('já está no seu histórico');
  });

  it('names the file after her and the day', () => {
    expect(shareFileName('Maria Clara', new Date(2026, 9, 20).getTime())).toBe('overlog-treino-maria-clara-2026-10-20.json');
  });
});

describe('notes', () => {
  it('a note on an exercise shows up in its history', async () => {
    const id = await startWorkout(upper);
    await saveNote(id, 0, 'ombro incomodou');
    const [first] = await workoutSets(id);
    await check(first.id!, 80, 8);
    await finishWorkout(id);
    expect((await exerciseHistory('bench-press'))[0].note).toBe('ombro incomodou');
  });
});
