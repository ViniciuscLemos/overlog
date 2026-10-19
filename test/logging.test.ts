import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  activeWorkout, addSet, createRoutine, db, discardWorkout, exerciseHistory, finishWorkout, lastFinishedWorkout,
  saveRoutine, startWorkout, updateSet, workoutSets,
} from '../src/lib/db';
import { addExercise } from '../src/lib/routines';

let upper: number;

beforeEach(async () => {
  await Promise.all([db.routines.clear(), db.workouts.clear(), db.sets.clear()]);
  upper = (await createRoutine('Upper 1')) as number;
  await saveRoutine(upper, { exercises: addExercise(addExercise([], 'bench-press'), 'seated-cable-rows') });
});

// a clock that always moves, so two sets never land on the same millisecond
let clock = 1_000;
const check = async (id: number, weightKg: number, reps: number, rir = 1) =>
  updateSet(id, { weightKg, reps, rir, done: true, doneAt: clock++ });

describe('logging a workout', () => {
  it('starts with the planned sets, empty', async () => {
    const id = await startWorkout(upper);
    const sets = await workoutSets(id);
    expect(sets.map((s) => s.exerciseId)).toEqual(['bench-press', 'bench-press', 'seated-cable-rows', 'seated-cable-rows']);
    expect(sets.every((s) => !s.done && s.weightKg === null)).toBe(true);
    expect((await activeWorkout())?.name).toBe('Upper 1');
  });

  it('starting again goes back to the open one', async () => {
    const id = await startWorkout(upper);
    expect(await startWorkout(upper)).toBe(id);
  });

  it('editing the workout later does not change the log', async () => {
    const id = await startWorkout(upper);
    await saveRoutine(upper, { exercises: [] });
    expect((await db.workouts.get(id))?.plan).toHaveLength(2);
  });

  it('finishing drops unchecked sets and frees the slot for the next one', async () => {
    const id = await startWorkout(upper);
    const [first] = await workoutSets(id);
    await check(first.id!, 80, 8);
    await addSet(id, 0, 'bench-press');
    expect(await finishWorkout(id)).toBe(true);
    expect(await workoutSets(id)).toHaveLength(1);
    expect(await activeWorkout()).toBeUndefined();
    expect((await lastFinishedWorkout())?.id).toBe(id);
  });

  it('finishing with nothing checked throws the workout away', async () => {
    const id = await startWorkout(upper);
    expect(await finishWorkout(id)).toBe(false);
    expect(await db.workouts.count()).toBe(0);
  });

  it('discarding removes the sets too', async () => {
    const id = await startWorkout(upper);
    await discardWorkout(id);
    expect(await db.sets.count()).toBe(0);
  });
});

describe('history of an exercise', () => {
  it('groups by workout, newest first, without the one in progress', async () => {
    const a = await startWorkout(upper);
    const [a1, a2] = await workoutSets(a);
    await check(a1.id!, 80, 9);
    await check(a2.id!, 80, 8);
    await finishWorkout(a);

    const b = await startWorkout(upper);
    const [b1] = await workoutSets(b);
    await check(b1.id!, 82, 6);

    const all = await exerciseHistory('bench-press');
    expect(all.map((h) => h.workoutId)).toEqual([b, a]);
    expect(all[1].sets.map((s) => s.reps)).toEqual([9, 8]);

    const before = await exerciseHistory('bench-press', b);
    expect(before.map((h) => h.workoutId)).toEqual([a]);
  });

  it('an unchecked set is not history', async () => {
    const id = await startWorkout(upper);
    const [first] = await workoutSets(id);
    await check(first.id!, 80, 8);
    await updateSet(first.id!, { done: false, doneAt: null });
    expect(await exerciseHistory('bench-press')).toEqual([]);
  });
});
