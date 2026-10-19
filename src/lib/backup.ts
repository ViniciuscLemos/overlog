import { db, type LoggedSet, type Routine, type Workout } from './db';
import { DEFAULTS, tidy } from './routines';

export interface Backup {
  app: 'overlog';
  version: 1;
  exportedAt: number;
  routines: Routine[];
  workouts: Workout[];
  sets: LoggedSet[];
}

export async function makeBackup(): Promise<Backup> {
  const [routines, workouts, sets] = await Promise.all([
    db.routines.orderBy('position').toArray(),
    db.workouts.toArray(),
    db.sets.toArray(),
  ]);
  return { app: 'overlog', version: 1, exportedAt: Date.now(), routines, workouts, sets };
}

export const backupFileName = (date = new Date()) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `overlog-${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}.json`;
};

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

// throws with a message that can go straight to the screen
export function parseBackup(text: string): Backup {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Esse arquivo não é um backup do Overlog.');
  }
  if (!isObject(data) || data.app !== 'overlog' || !Array.isArray(data.routines)) {
    throw new Error('Esse arquivo não é um backup do Overlog.');
  }
  if (typeof data.version !== 'number' || data.version > 1) {
    throw new Error('Esse backup é de uma versão mais nova do app. Atualiza a página e tenta de novo.');
  }

  const routines = data.routines.filter(isObject).map((r, i): Routine => {
    const exercises = Array.isArray(r.exercises) ? r.exercises.filter(isObject) : [];
    return {
      id: typeof r.id === 'number' ? r.id : undefined,
      name: typeof r.name === 'string' && r.name.trim() ? r.name : 'Treino',
      position: typeof r.position === 'number' ? r.position : i,
      exercises: exercises
        .filter((e) => typeof e.exerciseId === 'string')
        .map((e) => tidy({ ...DEFAULTS, ...e, note: typeof e.note === 'string' ? e.note : '' } as Routine['exercises'][number])),
      createdAt: typeof r.createdAt === 'number' ? r.createdAt : Date.now(),
      updatedAt: typeof r.updatedAt === 'number' ? r.updatedAt : Date.now(),
    };
  });

  return {
    app: 'overlog',
    version: 1,
    exportedAt: typeof data.exportedAt === 'number' ? data.exportedAt : 0,
    routines,
    workouts: Array.isArray(data.workouts) ? (data.workouts.filter(isObject) as unknown as Workout[]) : [],
    sets: Array.isArray(data.sets) ? (data.sets.filter(isObject) as unknown as LoggedSet[]) : [],
  };
}

// one workout, with only one person's sets: what a partner gets at the end of a workout together
export interface SharedWorkout {
  app: 'overlog';
  kind: 'workout';
  version: 1;
  from: string;
  workout: Omit<Workout, 'id' | 'routineId' | 'partners'>;
  sets: Omit<LoggedSet, 'id' | 'workoutId' | 'who'>[];
}

export async function partnerShare(workoutId: number, who: string, from = 'parceiro de treino'): Promise<SharedWorkout> {
  const workout = await db.workouts.get(workoutId);
  if (!workout) throw new Error('Esse treino não existe mais.');
  const sets = await db.sets.where('workoutId').equals(workoutId).filter((s) => s.who === who && s.done).sortBy('id');
  const { name, plan, startedAt, finishedAt, notes } = workout;
  return {
    app: 'overlog',
    kind: 'workout',
    version: 1,
    from,
    workout: { name, plan, startedAt, finishedAt, ...(notes ? { notes } : {}) },
    sets: sets.map(({ exerciseId, slot, weightKg, reps, rir, done, doneAt }) => ({ exerciseId, slot, weightKg, reps, rir, done, doneAt })),
  };
}

export const shareFileName = (who: string, startedAt: number) =>
  backupFileName(new Date(startedAt)).replace('overlog-', `overlog-treino-${who.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-`);

export function isSharedWorkout(data: unknown): data is SharedWorkout {
  return isObject(data) && data.app === 'overlog' && data.kind === 'workout' && isObject(data.workout) && Array.isArray(data.sets);
}

export async function importShared(shared: SharedWorkout) {
  return db.transaction('rw', db.workouts, db.sets, async () => {
    const { name, plan, startedAt, finishedAt, notes } = shared.workout;
    const same = await db.workouts.where('startedAt').equals(startedAt).filter((w) => w.name === name).first();
    if (same) throw new Error('Esse treino já está no seu histórico.');
    const workoutId = (await db.workouts.add({
      routineId: null, name, plan: Array.isArray(plan) ? plan : [], startedAt, finishedAt: finishedAt ?? startedAt,
      ...(notes ? { notes } : {}),
    })) as number;
    const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
    await db.sets.bulkAdd(shared.sets.filter((s) => isObject(s) && typeof s.exerciseId === 'string').map((s) => ({
      workoutId, exerciseId: s.exerciseId, slot: num(s.slot) ?? 0, weightKg: num(s.weightKg), reps: num(s.reps), rir: num(s.rir),
      done: true, doneAt: num(s.doneAt) ?? startedAt,
    })));
    return workoutId;
  });
}

// replaces everything, ids included, so the logged sets still point at their workouts
export async function restoreBackup(backup: Backup) {
  await db.transaction('rw', db.routines, db.workouts, db.sets, async () => {
    await Promise.all([db.routines.clear(), db.workouts.clear(), db.sets.clear()]);
    await db.routines.bulkAdd(backup.routines);
    await db.workouts.bulkAdd(backup.workouts);
    await db.sets.bulkAdd(backup.sets);
  });
}
