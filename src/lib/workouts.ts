// Logging a workout and what to do next time. No database in here, so it's all tested on its own.

export interface PlannedExercise {
  exerciseId: string;
  sets: number;
  repMin: number;
  repMax: number;
  restSeconds: number;
  note: string;
}

export interface SetLike {
  weightKg: number | null;
  reps: number | null;
  rir: number | null;
  done: boolean;
}

// "82,5" from the iPhone's decimal keyboard, "82.5", " 80 "
export function parseNumber(text: string): number | null {
  const n = Number(text.trim().replace(',', '.'));
  return text.trim() === '' || !Number.isFinite(n) || n < 0 ? null : n;
}

export const formatKg = (kg: number) => String(Math.round(kg * 100) / 100).replace('.', ',');

export const formatSet = (s: Pick<SetLike, 'weightKg' | 'reps' | 'rir'>) => {
  const weight = s.weightKg ? `${formatKg(s.weightKg)} kg × ` : '';
  const rir = s.rir === null ? '' : ` (RIR ${s.rir})`;
  return `${weight}${s.reps ?? '?'}${s.weightKg ? '' : ' reps'}${rir}`;
};

// smallest jump people usually have: 1 kg plates on each side, 2 kg dumbbells, one plate on the stack
const INCREMENT: Record<string, number> = {
  barbell: 2, smith: 2, 'e-z curl bar': 2, dumbbell: 2, machine: 5, cable: 2.5, plate: 2, kettlebells: 4,
};
export const incrementFor = (equipment: string) => INCREMENT[equipment] ?? 2;

export type Step =
  | { kind: 'first' }
  | { kind: 'up'; weightKg: number; from: number }
  | { kind: 'reps'; weightKg: number }
  | { kind: 'down'; weightKg: number }
  | { kind: 'closer'; weightKg: number };

/**
 * Double progression: stay on a weight until every set hits the top of the rep range, then go up.
 * RIR decides the edge cases: far from failure means the set didn't count much, and missing the
 * bottom of the range at RIR 0 means the weight is too heavy.
 */
export function nextStep(last: SetLike[], target: { repMin: number; repMax: number }, increment: number): Step {
  const done = last.filter((s) => s.done && s.reps !== null);
  if (!done.length) return { kind: 'first' };
  const weightKg = Math.max(...done.map((s) => s.weightKg ?? 0));
  const work = done.filter((s) => (s.weightKg ?? 0) === weightKg);
  const reps = work.map((s) => s.reps!);
  const rirs = work.map((s) => s.rir).filter((r): r is number => r !== null);

  if (reps.every((r) => r >= target.repMax)) return { kind: 'up', weightKg: weightKg + increment, from: weightKg };
  if (reps[0] < target.repMin && rirs.length && rirs[0] === 0) {
    return { kind: 'down', weightKg: Math.max(0, weightKg - increment) };
  }
  if (rirs.length && rirs.every((r) => r >= 3)) return { kind: 'closer', weightKg };
  return { kind: 'reps', weightKg };
}

export function stepText(step: Step, bodyweight: boolean) {
  const kg = (n: number) => (bodyweight && n === 0 ? 'peso do corpo' : `${formatKg(n)} kg`);
  switch (step.kind) {
    case 'first':
      return 'Primeira vez: escolhe uma carga que deixe 1 ou 2 reps sobrando.';
    case 'up':
      return bodyweight && step.from === 0
        ? 'Bateu o topo da faixa em todas: pode pôr carga extra ou subir a faixa de reps.'
        : `Bateu o topo da faixa em todas: sobe pra ${kg(step.weightKg)}.`;
    case 'reps':
      return `Mantém ${kg(step.weightKg)} e tenta mais 1 rep.`;
    case 'down':
      return `Ficou abaixo da faixa indo até a falha: baixa pra ${kg(step.weightKg)}.`;
    case 'closer':
      return `Sobraram 3 ou mais reps: mantém ${kg(step.weightKg)} e chega mais perto da falha.`;
  }
}

export interface Summary {
  sets: number;
  volumeKg: number;
  exercises: number;
}

export function summarize(sets: (SetLike & { exerciseId: string })[]): Summary {
  const done = sets.filter((s) => s.done);
  return {
    sets: done.length,
    volumeKg: done.reduce((sum, s) => sum + (s.weightKg ?? 0) * (s.reps ?? 0), 0),
    exercises: new Set(done.map((s) => s.exerciseId)).size,
  };
}

export function durationLabel(ms: number) {
  const minutes = Math.max(0, Math.round(ms / 60000));
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)}h${String(minutes % 60).padStart(2, '0')}`;
}

export const dateLabel = (ms: number) =>
  new Date(ms).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });

export const clockLabel = (ms: number) => {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

// Epley; only to compare sessions of the same exercise on the chart, not a real max
export const estimatedMax = (weightKg: number, reps: number, rir = 0) => weightKg * (1 + (reps + rir) / 30);
