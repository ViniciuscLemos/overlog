import Dexie, { type EntityTable } from 'dexie';
import { t } from './i18n';
import type { Routine } from './routines';
import type { PlannedExercise } from './workouts';

export type { Routine };

export interface Workout {
  id?: number;
  routineId: number | null;
  name: string;
  // copied from the workout when it starts, so editing it later doesn't change old logs
  plan: PlannedExercise[];
  startedAt: number;
  finishedAt: number | null;
  partners?: string[]; // training together on this phone
  notes?: Record<number, string>; // per slot, "ombro incomodou", "máquina 2 ocupada"
}

export interface LoggedSet {
  id?: number;
  workoutId: number;
  exerciseId: string;
  slot: number; // position in the plan, the same exercise can show up twice
  weightKg: number | null;
  reps: number | null;
  rir: number | null;
  done: boolean;
  doneAt: number | null;
  who?: string; // a partner's set; mine have none
}

export const db = new Dexie('overlog') as Dexie & {
  routines: EntityTable<Routine, 'id'>;
  workouts: EntityTable<Workout, 'id'>;
  sets: EntityTable<LoggedSet, 'id'>;
};

db.version(1).stores({
  routines: '++id, name',
  workouts: '++id, routineId, startedAt',
  // [exerciseId+doneAt] is for "last time" on an exercise
  sets: '++id, workoutId, exerciseId, [exerciseId+doneAt]',
});

db.version(2).stores({ routines: '++id, position' });

export async function createRoutine(name: string) {
  const last = await db.routines.orderBy('position').last();
  const now = Date.now();
  return db.routines.add({ name, position: (last?.position ?? -1) + 1, exercises: [], createdAt: now, updatedAt: now });
}

export const saveRoutine = (id: number, changes: Partial<Routine>) =>
  db.routines.update(id, { ...changes, updatedAt: Date.now() });

export async function moveRoutine(id: number, by: -1 | 1) {
  await db.transaction('rw', db.routines, async () => {
    const all = await db.routines.orderBy('position').toArray();
    const i = all.findIndex((r) => r.id === id);
    const j = i + by;
    if (i < 0 || j < 0 || j >= all.length) return;
    await db.routines.update(all[i].id!, { position: all[j].position });
    await db.routines.update(all[j].id!, { position: all[i].position });
  });
}

export const deleteRoutine = (id: number) => db.routines.delete(id);

export async function duplicateRoutine(id: number) {
  const source = await db.routines.get(id);
  if (!source) return undefined;
  const copyId = (await createRoutine(t.routines.copy(source.name))) as number;
  await saveRoutine(copyId, { exercises: source.exercises.map((e) => ({ ...e })) });
  return copyId;
}

export const activeWorkout = () => db.workouts.filter((w) => w.finishedAt === null).first();

export const lastFinishedWorkout = () =>
  db.workouts.orderBy('startedAt').reverse().filter((w) => w.finishedAt !== null).first();

// only one workout at a time: starting again goes back to the one already open
const emptySet = (workoutId: number, slot: number, exerciseId: string, who?: string): LoggedSet => ({
  workoutId, exerciseId, slot, weightKg: null, reps: null, rir: null, done: false, doneAt: null, ...(who ? { who } : {}),
});

export async function startWorkout(routineId: number, partners: string[] = []) {
  return db.transaction('rw', db.routines, db.workouts, db.sets, async () => {
    const open = await activeWorkout();
    if (open) return open.id!;
    const routine = await db.routines.get(routineId);
    if (!routine) throw new Error(t.backup.gone);
    const plan = routine.exercises.map((e) => ({ ...e }));
    const workoutId = (await db.workouts.add({
      routineId, name: routine.name, plan, startedAt: Date.now(), finishedAt: null, ...(partners.length ? { partners } : {}),
    })) as number;
    await db.sets.bulkAdd([undefined, ...partners].flatMap((who) =>
      plan.flatMap((e, slot) => Array.from({ length: e.sets }, () => emptySet(workoutId, slot, e.exerciseId, who)))));
    return workoutId;
  });
}

export const saveNote = (workoutId: number, slot: number, note: string) =>
  db.workouts.where('id').equals(workoutId).modify((w) => {
    w.notes = { ...w.notes, [slot]: note };
  });

// the partners from the last workout together, to suggest the same name next time
export async function lastPartners() {
  const last = await db.workouts.orderBy('startedAt').reverse().filter((w) => !!w.partners?.length).first();
  return last?.partners ?? [];
}

export const workoutSets = (workoutId: number) => db.sets.where('workoutId').equals(workoutId).sortBy('id');

export const updateSet = (id: number, changes: Partial<LoggedSet>) => db.sets.update(id, changes);

export const addSet = (workoutId: number, slot: number, exerciseId: string, who?: string) =>
  db.sets.add(emptySet(workoutId, slot, exerciseId, who));

export const removeSet = (id: number) => db.sets.delete(id);

// sets left unchecked are dropped; a workout with nothing checked is thrown away (returns false)
export async function finishWorkout(id: number) {
  return db.transaction('rw', db.workouts, db.sets, async () => {
    await db.sets.where('workoutId').equals(id).filter((s) => !s.done).delete();
    if (!(await db.sets.where('workoutId').equals(id).count())) {
      await db.workouts.delete(id);
      return false;
    }
    await db.workouts.update(id, { finishedAt: Date.now() });
    return true;
  });
}

export async function discardWorkout(id: number) {
  await db.transaction('rw', db.workouts, db.sets, async () => {
    await db.sets.where('workoutId').equals(id).delete();
    await db.workouts.delete(id);
  });
}

// every logged session of an exercise, newest first; `who` is a partner's name, mine by default
export async function exerciseHistory(exerciseId: string, excludeWorkoutId?: number, who?: string) {
  const sets = await db.sets
    .where('[exerciseId+doneAt]')
    .between([exerciseId, Dexie.minKey], [exerciseId, Dexie.maxKey])
    .filter((s) => s.done && s.workoutId !== excludeWorkoutId && s.who === who)
    .toArray();
  const byWorkout = new Map<number, LoggedSet[]>();
  for (const s of sets) byWorkout.set(s.workoutId, [...(byWorkout.get(s.workoutId) ?? []), s]);
  const workouts = new Map((await db.workouts.bulkGet([...byWorkout.keys()])).map((w) => [w?.id, w]));
  return [...byWorkout.entries()]
    .map(([workoutId, list]) => ({
      workoutId,
      date: Math.min(...list.map((s) => s.doneAt!)),
      sets: list.sort((a, b) => a.id! - b.id!),
      note: workouts.get(workoutId)?.notes?.[list[0].slot] ?? '',
    }))
    .sort((a, b) => b.date - a.date);
}
