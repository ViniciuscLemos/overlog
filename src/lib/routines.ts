import { t } from './i18n';

export interface RoutineExercise {
  exerciseId: string;
  sets: number;
  repMin: number;
  repMax: number;
  restSeconds: number;
  note: string;
}

export interface Routine {
  id?: number;
  name: string;
  position: number; // order in the rotation
  exercises: RoutineExercise[];
  createdAt: number;
  updatedAt: number;
}

// what I use: 2 sets of 5-9 close to failure, 3 min rest
export const DEFAULTS = { sets: 2, repMin: 5, repMax: 9, restSeconds: 180, note: '' };

export const LIMITS = { sets: [1, 10], reps: [1, 100], rest: [0, 600] } as const;

const clamp = (n: number, [min, max]: readonly [number, number]) =>
  Math.min(max, Math.max(min, Math.round(Number.isFinite(n) ? n : min)));

export function tidy(item: RoutineExercise): RoutineExercise {
  const repMin = clamp(item.repMin, LIMITS.reps);
  const repMax = Math.max(repMin, clamp(item.repMax, LIMITS.reps));
  return {
    ...item,
    sets: clamp(item.sets, LIMITS.sets),
    repMin,
    repMax,
    restSeconds: clamp(item.restSeconds, LIMITS.rest),
  };
}

export const addExercise = (list: RoutineExercise[], exerciseId: string): RoutineExercise[] => [
  ...list,
  { exerciseId, ...DEFAULTS },
];

export const updateAt = (list: RoutineExercise[], index: number, patch: Partial<RoutineExercise>) =>
  list.map((item, i) => (i === index ? tidy({ ...item, ...patch }) : item));

export const removeAt = <T,>(list: T[], index: number) => list.filter((_, i) => i !== index);

export function move<T>(list: T[], index: number, by: -1 | 1): T[] {
  const to = index + by;
  if (to < 0 || to >= list.length) return list;
  const copy = [...list];
  [copy[index], copy[to]] = [copy[to], copy[index]];
  return copy;
}

export const totalSets = (routine: Pick<Routine, 'exercises'>) =>
  routine.exercises.reduce((sum, e) => sum + e.sets, 0);

// after the last one it goes back to the first
export function nextInRotation<T extends { id?: number; position: number }>(routines: T[], lastDoneId: number | null) {
  if (!routines.length) return undefined;
  const ordered = [...routines].sort((a, b) => a.position - b.position);
  const last = ordered.findIndex((r) => r.id === lastDoneId);
  return ordered[(last + 1) % ordered.length];
}

export function suggestName(taken: string[]) {
  for (let i = 0; i < 26; i++) {
    const name = t.routines.suggested(String.fromCharCode(65 + i));
    if (!taken.includes(name)) return name;
  }
  return t.routines.suggested(String(taken.length + 1));
}

export const restLabel = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

export function setsPerMuscle(exercises: RoutineExercise[], primaryOf: (exerciseId: string) => string[] | undefined) {
  const count = new Map<string, number>();
  for (const item of exercises) {
    for (const muscle of primaryOf(item.exerciseId) ?? []) count.set(muscle, (count.get(muscle) ?? 0) + item.sets);
  }
  return [...count].sort((a, b) => b[1] - a[1]);
}
