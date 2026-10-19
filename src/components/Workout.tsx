import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useRef, useState } from 'react';
import {
  addSet, db, discardWorkout, exerciseHistory, finishWorkout, removeSet, saveNote, updateSet, workoutSets, type LoggedSet,
} from '../lib/db';
import { displayName, imageUrl, loadExercises, type Exercise } from '../lib/exercises';
import { t } from '../lib/i18n';
import { restLabel } from '../lib/routines';
import {
  clockLabel, durationLabel, formatKg, formatSet, incrementFor, isRecord, nextStep, parseNumber, records, stepText, type PlannedExercise,
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
  const [last, setLast] = useState<Map<string, Last>>(new Map());
  const [who, setWho] = useState<string | undefined>(undefined);
  const now = useNow(1000);
  useWakeLock();

  useEffect(() => {
    loadExercises().then((all) => setById(new Map(all.map((e) => [e.id, e]))));
  }, []);

  const planKey = workout?.plan.map((p) => p.exerciseId).join(',');
  const partnersKey = workout?.partners?.join(',') ?? '';
  useEffect(() => {
    if (!planKey) return;
    const ids = [...new Set(planKey.split(','))];
    const people = [undefined, ...(partnersKey ? partnersKey.split(',') : [])];
    const pairs = people.flatMap((person) => ids.map(async (e) => {
      const sessions = await exerciseHistory(e, id, person);
      const best = records(sessions.flatMap((x) => x.sets)).best;
      return [lastKey(e, person), { sets: sessions[0]?.sets ?? [], note: sessions[0]?.note ?? '', best }] as const;
    }));
    Promise.all(pairs).then((all) => setLast(new Map(all)));
  }, [planKey, partnersKey, id]);

  useEffect(() => {
    if (workout) document.title = `${workout.name} · Overlog`;
    return () => {
      document.title = 'Overlog';
    };
  }, [workout]);

  if (workout === undefined || sets === undefined) return null;
  if (!workout) return <p className="muted">{t.editor.missing} <a href="#/treinos">{t.back}</a></p>;
  if (workout.finishedAt) return <p className="muted">{t.workout.finished} <a href={`#/historico/${id}`}>{t.workout.seeSummary}</a></p>;

  const people = [undefined, ...(workout.partners ?? [])];
  const nextPerson = () => setWho(people[(people.indexOf(who) + 1) % people.length]);
  const lastDone = sets.filter((s) => s.done).sort((a, b) => b.doneAt! - a.doneAt!)[0];
  const rest = lastDone ? workout.plan[lastDone.slot]?.restSeconds ?? 0 : 0;
  const restLeft = lastDone ? lastDone.doneAt! + rest * 1000 - now : 0;

  async function finish() {
    const done = sets!.filter((s) => s.done).length;
    const open = sets!.length - done;
    if (!done) {
      if (window.confirm(t.workout.noneChecked)) {
        await discardWorkout(id);
        window.location.hash = '#/treinos';
      }
      return;
    }
    if (open && !window.confirm(t.workout.leftOut(open))) return;
    await finishWorkout(id);
    window.location.hash = `#/historico/${id}`;
  }

  async function discard() {
    if (!window.confirm(t.workout.discardAsk)) return;
    await discardWorkout(id);
    window.location.hash = '#/treinos';
  }

  return (
    <section className="workout">
      <h2>{workout.name}</h2>
      <p className="count">{t.workout.started(durationLabel(now - workout.startedAt))}</p>

      {workout.plan.map((plan, slot) => (
        <ExerciseBlock
          key={slot}
          workoutId={id}
          slot={slot}
          plan={plan}
          exercise={byId.get(plan.exerciseId)}
          who={who}
          note={workout.notes?.[slot] ?? ''}
          sets={sets.filter((s) => s.slot === slot && s.who === who)}
          last={last.get(lastKey(plan.exerciseId, who)) ?? { sets: [], note: '', best: null }}
          onDone={people.length > 1 ? nextPerson : undefined}
        />
      ))}

      <button type="button" className="danger discard" onClick={discard}>{t.workout.discard}</button>

      <div className="workout-bar">
        {people.length > 1 && (
          <div className="people" role="group" aria-label={t.workout.who}>
            {people.map((person) => (
              <button
                key={person ?? ''}
                type="button"
                className={person === who ? 'chip on' : 'chip'}
                aria-pressed={person === who}
                onClick={() => setWho(person)}
              >
                {person ?? t.workout.me}
              </button>
            ))}
          </div>
        )}
        <span>
          {lastDone && restLeft > 0 ? (
            <>{t.workout.rest} <strong>{clockLabel(restLeft)}</strong></>
          ) : lastDone ? (
            t.workout.restOver
          ) : (
            t.workout.sets(sets.length)
          )}
        </span>
        <button type="button" className="primary" onClick={finish}>{t.workout.finish}</button>
      </div>
    </section>
  );
}

interface Last {
  sets: LoggedSet[];
  note: string;
  best: LoggedSet | null;
}

const lastKey = (exerciseId: string, who?: string) => `${who ?? ''}|${exerciseId}`;

interface BlockProps {
  workoutId: number;
  slot: number;
  plan: PlannedExercise;
  exercise: Exercise | undefined;
  who: string | undefined;
  note: string;
  sets: LoggedSet[];
  last: Last;
  onDone?: () => void;
}

function ExerciseBlock({ workoutId, slot, plan, exercise, who, note, sets, last: { sets: last, note: lastNote, best }, onDone }: BlockProps) {
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
        {t.workout.target(plan.sets, plan.repMin, plan.repMax, restLabel(plan.restSeconds))}
        {plan.note && ` · ${plan.note}`}
      </p>
      {last.length > 0 && <p className="last">{t.workout.last} {last.map(formatSet).join(' · ')}</p>}
      {lastNote && <p className="last">{t.workout.lastNote} {lastNote}</p>}
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
            record={isRecord(set, best)}
            onDone={onDone}
          />
        );
      })}
      <div className="set-actions">
        <button type="button" className="secondary" onClick={() => addSet(workoutId, slot, plan.exerciseId, who)}>{t.workout.addSet}</button>
        {removable && sets.length > 1 && (
          <button type="button" className="secondary" onClick={() => removeSet(removable.id!)}>{t.workout.removeSet}</button>
        )}
      </div>
      <NoteInput workoutId={workoutId} slot={slot} note={note} />
    </div>
  );
}

function NoteInput({ workoutId, slot, note }: { workoutId: number; slot: number; note: string }) {
  const [text, setText] = useState(note);
  return (
    <input
      className="note"
      placeholder={t.workout.note}
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        saveNote(workoutId, slot, e.target.value);
      }}
      onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
      enterKeyHint="done"
    />
  );
}

interface RowProps {
  index: number;
  set: LoggedSet;
  bodyweight: boolean;
  weightHint: number | undefined;
  repsHint: number | undefined;
  record: boolean;
  onDone?: () => void;
}

const show = (n: number | null) => (n === null ? '' : formatKg(n));

function SetRow({ index, set, bodyweight, weightHint, repsHint, record, onDone }: RowProps) {
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
    onDone?.();
  }

  return (
    <div className={set.done ? 'set-row done' : 'set-row'}>
      <span>{record ? <abbr className="pr" title={t.records.pr}>PR</abbr> : index + 1}</span>
      <input
        ref={weightInput}
        inputMode="decimal"
        aria-label={t.workout.weight(index + 1)}
        placeholder={weightHint !== undefined ? formatKg(weightHint) : bodyweight ? '0' : 'kg'}
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        onBlur={() => save({ weightKg: parseNumber(weight) })}
      />
      <input
        ref={repsInput}
        inputMode="numeric"
        aria-label={t.workout.reps(index + 1)}
        placeholder={repsHint !== undefined ? String(repsHint) : '–'}
        value={reps}
        onChange={(e) => setReps(e.target.value)}
        onBlur={() => save({ reps: parseNumber(reps) })}
      />
      <input
        inputMode="numeric"
        aria-label={t.workout.rir(index + 1)}
        placeholder="–"
        value={rir}
        onChange={(e) => setRir(e.target.value)}
        onBlur={() => save({ rir: parseNumber(rir) })}
      />
      <button type="button" className="tick" aria-pressed={set.done} aria-label={t.workout.tick(index + 1)} onClick={toggle}>
        ✓
      </button>
    </div>
  );
}
