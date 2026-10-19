import Dexie, { type EntityTable } from 'dexie';
import type { Routine } from './routines';

export type { Routine };

export interface Workout {
  id?: number;
  routineId: number | null;
  startedAt: number;
  finishedAt: number | null;
}

export interface LoggedSet {
  id?: number;
  workoutId: number;
  exerciseId: string;
  order: number;
  weightKg: number;
  reps: number;
  doneAt: number;
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
  const copyId = (await createRoutine(`${source.name} (cópia)`)) as number;
  await saveRoutine(copyId, { exercises: source.exercises.map((e) => ({ ...e })) });
  return copyId;
}
