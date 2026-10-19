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

// replaces everything, ids included, so the logged sets still point at their workouts
export async function restoreBackup(backup: Backup) {
  await db.transaction('rw', db.routines, db.workouts, db.sets, async () => {
    await Promise.all([db.routines.clear(), db.workouts.clear(), db.sets.clear()]);
    await db.routines.bulkAdd(backup.routines);
    await db.workouts.bulkAdd(backup.workouts);
    await db.sets.bulkAdd(backup.sets);
  });
}
