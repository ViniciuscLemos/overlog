import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useRef, useState } from 'react';
import {
  addSet, db, discardWorkout, exerciseHistory, finishWorkout, removeSet, updateSet, workoutSets, type LoggedSet,
} from '../lib/db';
import { displayName, imageUrl, loadExercises, type Exercise } from '../lib/exercises';
import { restLabel } from '../lib/routines';
import {
  clockLabel, durationLabel, formatKg, formatSet, incrementFor, nextStep, parseNumber, stepText, type PlannedExercise,
} from '../lib/workouts';

function useNow(ms: number) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(timer);
  }, [ms]);
  return now;
}

// the screen going dark between sets is the most annoying thing in the gym
function useWakeLock() {
  useEffect(() => {
    let lock: WakeLockSentinel | undefined;
    const request = () => navigator.wakeLock?.request('screen').then((l) => (lock = l)).catch(() => {});
    const onVisible = () => document.visibilityState === 'visible' && request();
    request();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      lock?.release().catch(() => {});
    };
  }, []);
}

export function Workout({ id }: { id: number }) {
  const workout = useLiveQuery(() => db.workouts.get(id), [id]);
  const sets = useLiveQuery(() => workoutSets(id), [id]);
  const [byId, setById] = useState<Map<string, Exercise>>(new Map());
  const [last, setLast] = useState<Map<string, LoggedSet[]>>(new Map());
  const now = useNow(1000);
  useWakeLock();

  useEffect(() => {
    loadExercises().then((all) => setById(new Map(all.map((e) => [e.id, e]))));
  }, []);

  const planKey = workout?.plan.map((p) => p.exerciseId).join(',');
  useEffect(() => {
    if (!planKey) return;
    const ids = [...new Set(planKey.split(','))];
    Promise.all(ids.map(async (e) => [e, (await exerciseHistory(e, id))[0]?.sets ?? []] as const)).then((pairs) =>
      setLast(new Map(pairs)));
  }, [planKey, id]);

  useEffect(() => {
    if (workout) document.title = `${workout.name} · Overlog`;
    return () => {
      document.title = 'Overlog';
    };
  }, [workout]);

  if (workout === undefined || sets === undefined) return null;
  if (!workout) return <p className="muted">Esse treino não existe mais. <a href="#/treinos">Voltar</a></p>;
  if (workout.finishedAt) return <p className="muted">Esse treino já terminou. <a href={`#/historico/${id}`}>Ver resumo</a></p>;

  const lastDone = sets.filter((s) => s.done).sort((a, b) => b.doneAt! - a.doneAt!)[0];
  const rest = lastDone ? workout.plan[lastDone.slot]?.restSeconds ?? 0 : 0;
  const restLeft = lastDone ? lastDone.doneAt! + rest * 1000 - now : 0;

  async function finish() {
    const done = sets!.filter((s) => s.done).length;
    const open = sets!.length - done;
    if (!done) {
      if (window.confirm('Nenhuma série marcada. Descartar esse treino?')) {
        await discardWorkout(id);
        window.location.hash = '#/treinos';
      }
      return;
    }
    if (open && !window.confirm(`${open} ${open === 1 ? 'série sem ✓ fica' : 'séries sem ✓ ficam'} de fora. Terminar?`)) return;
    await finishWorkout(id);
    window.location.hash = `#/historico/${id}`;
  }

  async function discard() {
    if (!window.confirm('Descartar esse treino? O que foi anotado nele some.')) return;
    await discardWorkout(id);
    window.location.hash = '#/treinos';
  }

  return (
    <section className="workout">
      <h2>{workout.name}</h2>
      <p className="count">Começou há {durationLabel(now - workout.startedAt)}</p>

      {workout.plan.map((plan, slot) => (
        <ExerciseBlock
          key={slot}
          workoutId={id}
          slot={slot}
          plan={plan}
          exercise={byId.get(plan.exerciseId)}
          sets={sets.filter((s) => s.slot === slot)}
          last={last.get(plan.exerciseId) ?? []}
        />
      ))}

      <button type="button" className="danger discard" onClick={discard}>Descartar treino</button>

      <div className="workout-bar">
        <span>
          {lastDone && restLeft > 0 ? (
            <>Descanso <strong>{clockLabel(restLeft)}</strong></>
          ) : lastDone ? (
            'Descanso acabou'
          ) : (
            `${sets.length} séries`
          )}
        </span>
        <button type="button" className="primary" onClick={finish}>Terminar</button>
      </div>
    </section>
  );
}

interface BlockProps {
  workoutId: number;
  slot: number;
  plan: PlannedExercise;
  exercise: Exercise | undefined;
  sets: LoggedSet[];
  last: LoggedSet[];
}

function ExerciseBlock({ workoutId, slot, plan, exercise, sets, last }: BlockProps) {
  const bodyweight = exercise?.equipment === 'body only';
  const step = nextStep(last, plan, incrementFor(exercise?.equipment ?? ''));
  const stepWeight = step.kind === 'first' ? undefined : step.weightKg;
  const removable = [...sets].reverse().find((s) => !s.done);

  return (
    <div className="block">
      <div className="slot-head">
        {exercise && <img src={imageUrl(exercise.images[0])} alt="" width={48} height={48} />}
        <a href={`#/exercicio/${plan.exerciseId}`}>{exercise ? displayName(exercise) : plan.exerciseId}</a>
      </div>
      <p className="target">
        {plan.sets} × {plan.repMin}–{plan.repMax} · descanso {restLabel(plan.restSeconds)}
        {plan.note && ` · ${plan.note}`}
      </p>
      {last.length > 0 && <p className="last">Última vez: {last.map(formatSet).join(' · ')}</p>}
      <p className="step">{stepText(step, bodyweight)}</p>

      <div className="set-row set-head" aria-hidden="true">
        <span>#</span>
        <span>kg</span>
        <span>reps</span>
        <span>RIR</span>
        <span />
      </div>
      {sets.map((set, i) => {
        const before = sets.slice(0, i).reverse().find((s) => s.weightKg !== null)?.weightKg;
        return (
          <SetRow
            key={set.id}
            index={i}
            set={set}
            bodyweight={bodyweight}
            weightHint={before ?? stepWeight ?? last[i]?.weightKg ?? undefined}
            repsHint={last[i]?.reps ?? undefined}
          />
        );
      })}
      <div className="set-actions">
        <button type="button" className="secondary" onClick={() => addSet(workoutId, slot, plan.exerciseId)}>+ Série</button>
        {removable && sets.length > 1 && (
          <button type="button" className="secondary" onClick={() => removeSet(removable.id!)}>− Série</button>
        )}
      </div>
    </div>
  );
}

interface RowProps {
  index: number;
  set: LoggedSet;
  bodyweight: boolean;
  weightHint: number | undefined;
  repsHint: number | undefined;
}

const show = (n: number | null) => (n === null ? '' : formatKg(n));

function SetRow({ index, set, bodyweight, weightHint, repsHint }: RowProps) {
  const [weight, setWeight] = useState(show(set.weightKg));
  const [reps, setReps] = useState(show(set.reps));
  const [rir, setRir] = useState(show(set.rir));
  const weightInput = useRef<HTMLInputElement>(null);
  const repsInput = useRef<HTMLInputElement>(null);

  const save = (changes: Partial<LoggedSet>) => updateSet(set.id!, changes);

  async function toggle() {
    if (set.done) {
      await save({ done: false, doneAt: null });
      return;
    }
    // an empty field takes the grey hint, so repeating last time is one tap
    const w = parseNumber(weight) ?? weightHint ?? (bodyweight ? 0 : null);
    const r = parseNumber(reps) ?? repsHint ?? null;
    if (w === null) return weightInput.current?.focus();
    if (r === null) return repsInput.current?.focus();
    setWeight(show(w));
    setReps(show(r));
    await save({ weightKg: w, reps: Math.round(r), rir: parseNumber(rir), done: true, doneAt: Date.now() });
  }

  return (
    <div className={set.done ? 'set-row done' : 'set-row'}>
      <span>{index + 1}</span>
      <input
        ref={weightInput}
        inputMode="decimal"
        aria-label={`Carga da série ${index + 1}`}
        placeholder={weightHint !== undefined ? formatKg(weightHint) : bodyweight ? '0' : 'kg'}
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        onBlur={() => save({ weightKg: parseNumber(weight) })}
      />
      <input
        ref={repsInput}
        inputMode="numeric"
        aria-label={`Repetições da série ${index + 1}`}
        placeholder={repsHint !== undefined ? String(repsHint) : '–'}
        value={reps}
        onChange={(e) => setReps(e.target.value)}
        onBlur={() => save({ reps: parseNumber(reps) })}
      />
      <input
        inputMode="numeric"
        aria-label={`Reps na reserva da série ${index + 1}`}
        placeholder="–"
        value={rir}
        onChange={(e) => setRir(e.target.value)}
        onBlur={() => save({ rir: parseNumber(rir) })}
      />
      <button type="button" className="tick" aria-pressed={set.done} aria-label={`Marcar série ${index + 1}`} onClick={toggle}>
        ✓
      </button>
    </div>
  );
}
