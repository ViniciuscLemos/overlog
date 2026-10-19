import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useState } from 'react';
import { db, deleteRoutine, duplicateRoutine, saveRoutine, startWorkout } from '../lib/db';
import { displayName, imageUrl, loadExercises, type Exercise } from '../lib/exercises';
import { t } from '../lib/i18n';
import { MUSCLES } from '../lib/labels';
import { LIMITS, move, removeAt, restLabel, setsPerMuscle, tidy, totalSets, type Routine, type RoutineExercise } from '../lib/routines';

// 0:30 to 5:00, every 30 seconds
const REST_OPTIONS = Array.from({ length: 10 }, (_, i) => (i + 1) * 30);

export function RoutineEditor({ id }: { id: number }) {
  const routine = useLiveQuery(() => db.routines.get(id), [id]);
  const [byId, setById] = useState<Map<string, Exercise>>(new Map());
  // numbers only get saved on blur, otherwise clearing "9" to type "12" gets clamped halfway
  const [draft, setDraft] = useState<Routine | null>(null);
  useEffect(() => {
    if (routine && (!draft || draft.id !== routine.id)) setDraft(routine);
  }, [routine, draft]);

  useEffect(() => {
    loadExercises().then((all) => setById(new Map(all.map((e) => [e.id, e]))));
  }, []);

  useEffect(() => {
    if (routine) document.title = `${routine.name} · Overlog`;
    return () => {
      document.title = 'Overlog';
    };
  }, [routine]);

  if (routine === undefined || (routine && !draft)) return null;
  if (!routine || !draft) return <p className="muted">{t.editor.missing} <a href="#/treinos">{t.back}</a></p>;

  const setExercises = (exercises: RoutineExercise[]) => {
    setDraft({ ...draft, exercises });
    saveRoutine(id, { exercises });
  };
  const type = (i: number, patch: Partial<RoutineExercise>) =>
    setDraft({ ...draft, exercises: draft.exercises.map((e, j) => (j === i ? { ...e, ...patch } : e)) });
  const settle = () => setExercises(draft.exercises.map(tidy));

  async function remove() {
    if (!window.confirm(t.editor.remove(draft!.name))) return;
    await deleteRoutine(id);
    window.location.hash = '#/treinos';
  }

  return (
    <section className="editor">
      <a className="back" href="#/treinos">{t.editor.back}</a>
      <input
        className="routine-name"
        value={draft.name}
        aria-label={t.editor.name}
        enterKeyHint="done"
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        onChange={(e) => {
          setDraft({ ...draft, name: e.target.value });
          saveRoutine(id, { name: e.target.value });
        }}
        onBlur={(e) => {
          if (e.target.value.trim()) return;
          setDraft({ ...draft, name: t.routines.defaultName });
          saveRoutine(id, { name: t.routines.defaultName });
        }}
      />
      <p className="count">
        {t.routines.exercises(draft.exercises.length)} · {t.routines.sets(totalSets(draft))}
      </p>

      <ul className="list">
        {draft.exercises.map((item, i) => {
          const exercise = byId.get(item.exerciseId);
          return (
            <li key={`${item.exerciseId}-${i}`} className="slot">
              <div className="slot-head">
                {exercise && <img src={imageUrl(exercise.images[0])} alt="" width={48} height={48} />}
                <a href={`#/exercicio/${item.exerciseId}`}>{exercise ? displayName(exercise) : item.exerciseId}</a>
                <span className="order">
                  <button type="button" aria-label={t.editor.up} disabled={i === 0} onClick={() => setExercises(move(draft.exercises, i, -1))}>↑</button>
                  <button
                    type="button"
                    aria-label={t.editor.down}
                    disabled={i === draft.exercises.length - 1}
                    onClick={() => setExercises(move(draft.exercises, i, 1))}
                  >
                    ↓
                  </button>
                  <button type="button" aria-label={t.editor.takeOut} onClick={() => {
                      // easy to hit by accident next to the arrows
                      const name = exercise ? displayName(exercise) : t.editor.thisExercise;
                      if (window.confirm(t.editor.takeOutAsk(name))) setExercises(removeAt(draft.exercises, i));
                    }}
                  >
                    ✕
                  </button>
                </span>
              </div>

              <div className="slot-fields">
                <label>
                  {t.editor.sets}
                  <input
                    type="number" inputMode="numeric" min={LIMITS.sets[0]} max={LIMITS.sets[1]}
                    value={Number.isNaN(item.sets) ? '' : item.sets}
                    onChange={(e) => type(i, { sets: e.target.valueAsNumber })}
                    onBlur={settle}
                  />
                </label>
                <label>
                  {t.editor.reps}
                  <span className="range">
                    <input
                      type="number" inputMode="numeric" min={LIMITS.reps[0]} max={LIMITS.reps[1]} aria-label={t.editor.minReps}
                      value={Number.isNaN(item.repMin) ? '' : item.repMin}
                      onChange={(e) => type(i, { repMin: e.target.valueAsNumber })}
                      onBlur={settle}
                    />
                    –
                    <input
                      type="number" inputMode="numeric" min={LIMITS.reps[0]} max={LIMITS.reps[1]} aria-label={t.editor.maxReps}
                      value={Number.isNaN(item.repMax) ? '' : item.repMax}
                      onChange={(e) => type(i, { repMax: e.target.valueAsNumber })}
                      onBlur={settle}
                    />
                  </span>
                </label>
                <label>
                  {t.editor.rest}
                  <select value={item.restSeconds} onChange={(e) => setExercises(draft.exercises.map((x, j) => (j === i ? { ...x, restSeconds: Number(e.target.value) } : x)))}>
                    {(REST_OPTIONS.includes(item.restSeconds) ? REST_OPTIONS : [...REST_OPTIONS, item.restSeconds].sort((a, b) => a - b)).map((s) => (
                      <option key={s} value={s}>{restLabel(s)}</option>
                    ))}
                  </select>
                </label>
              </div>
              <input
                className="note"
                placeholder={t.editor.note}
                value={item.note}
                onChange={(e) => type(i, { note: e.target.value })}
                onBlur={settle}
              />
            </li>
          );
        })}
      </ul>

      <a className="more as-button" href={`#/treinos/${id}/adicionar`}>{t.editor.add}</a>

      {draft.exercises.length > 0 && byId.size > 0 && (
        <p className="per-muscle">
          {t.editor.perMuscle}{' '}
          {setsPerMuscle(draft.exercises, (exerciseId) => byId.get(exerciseId)?.primary)
            .map(([muscle, sets]) => `${MUSCLES[muscle] ?? muscle} ${sets}`)
            .join(' · ')}
        </p>
      )}
      {draft.exercises.length > 0 && (
        <button
          type="button"
          className="primary start"
          onClick={async () => {
            window.location.hash = `#/treino/${await startWorkout(id)}`;
          }}
        >
          {t.editor.start}
        </button>
      )}
      <div className="editor-actions">
        <button
          type="button"
          className="secondary"
          onClick={async () => {
            const copy = await duplicateRoutine(id);
            if (copy) window.location.hash = `#/treinos/${copy}`;
          }}
        >
          {t.editor.duplicate}
        </button>
        <button type="button" className="danger" onClick={remove}>{t.editor.delete}</button>
      </div>
    </section>
  );
}
