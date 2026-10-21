import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useState } from 'react';
import { db, saveRoutine } from '../lib/db';
import { addExercise } from '../lib/routines';
import { displayName, imageUrl, loadExercises, similar, type Exercise } from '../lib/exercises';
import { EQUIPMENT, MUSCLES, mechanicLabel } from '../lib/labels';
import { t } from '../lib/i18n';
import { ExerciseHistory } from './ExerciseHistory';

export function ExerciseDetail({ id }: { id: string }) {
  const [exercise, setExercise] = useState<Exercise | null | undefined>(undefined);
  const [others, setOthers] = useState<Exercise[]>([]);
  const routines = useLiveQuery(() => db.routines.orderBy('position').toArray());
  const [added, setAdded] = useState('');
  useEffect(() => setAdded(''), [id]);

  useEffect(() => {
    loadExercises().then((all) => {
      const found = all.find((e) => e.id === id) ?? null;
      setExercise(found);
      setOthers(found ? similar(all, found) : []);
    });
  }, [id]);

  useEffect(() => {
    if (!exercise) return;
    document.title = `${displayName(exercise)} · Overlog`;
    return () => {
      document.title = 'Overlog';
    };
  }, [exercise]);

  if (exercise === undefined) return <p className="muted">{t.loading}</p>;
  if (exercise === null) return <p className="muted">{t.exercise.missing} <a href="#/">{t.back}</a></p>;

  const muscles = (list: string[]) => list.map((m) => MUSCLES[m] ?? m).join(', ');
  const inRoutines = (routines ?? []).filter((r) => r.exercises.some((e) => e.exerciseId === exercise.id));

  return (
    <article className="detail">
      <div className="detail-top">
        <a className="back" href="#/">{t.exercise.back}</a>
        {'share' in navigator && (
          <button
            type="button"
            className="clear"
            onClick={() => navigator.share({ title: displayName(exercise), url: window.location.href }).catch(() => {})}
          >
            {t.exercise.share}
          </button>
        )}
      </div>
      <h2>{displayName(exercise)}</h2>
      {exercise.pt && exercise.pt === displayName(exercise) && <p className="en">{exercise.en}</p>}

      <div className="photos">
        {exercise.images.map((img, i) => (
          <figure key={img}>
            <img src={imageUrl(img)} alt={`${displayName(exercise)}, ${(i === 0 ? t.exercise.start : t.exercise.end).toLowerCase()}`} />
            <figcaption>{i === 0 ? t.exercise.start : t.exercise.end}</figcaption>
          </figure>
        ))}
      </div>

      {routines && routines.length > 0 && (
        <p className="add-to">
          <select
            value=""
            aria-label={t.exercise.addTo.slice(2)}
            onChange={async (e) => {
              const routine = routines.find((r) => r.id === Number(e.target.value));
              if (!routine) return;
              await saveRoutine(routine.id!, { exercises: addExercise(routine.exercises, exercise.id) });
              setAdded(routine.name);
            }}
          >
            <option value="">{t.exercise.addTo}</option>
            {routines.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          {added && <span className="muted"> {t.exercise.added(added)}</span>}
        </p>
      )}

      <dl className="facts">
        <dt>{t.exercise.equipment}</dt>
        <dd>{EQUIPMENT[exercise.equipment] ?? exercise.equipment}</dd>
        <dt>{t.exercise.muscles}</dt>
        <dd>{muscles(exercise.primary)}</dd>
        {exercise.secondary.length > 0 && (
          <>
            <dt>{t.exercise.helpers}</dt>
            <dd>{muscles(exercise.secondary)}</dd>
          </>
        )}
        {mechanicLabel(exercise.mechanic) && (
          <>
            <dt>{t.exercise.type}</dt>
            <dd>{mechanicLabel(exercise.mechanic)}</dd>
          </>
        )}
        {inRoutines.length > 0 && (
          <>
            <dt>{t.exercise.inWorkouts}</dt>
            <dd>
              {inRoutines.map((r, i) => (
                <span key={r.id}>
                  {i > 0 && ', '}
                  <a href={`#/treinos/${r.id}`}>{r.name}</a>
                </span>
              ))}
            </dd>
          </>
        )}
      </dl>

      <ExerciseHistory exerciseId={exercise.id} />

      <h3 className="similar-title">{t.exercise.howTo}</h3>
      {t.exercise.englishSteps && <p className="muted">{t.exercise.englishSteps}</p>}
      <ol className="steps" lang="en">
        {exercise.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>

      {others.length > 0 && (
        <>
          <h3 className="similar-title">{t.exercise.similar}</h3>
          <ul className="list">
            {others.map((e) => (
              <li key={e.id}>
                <a className="item" href={`#/exercicio/${e.id}`}>
                  <img src={imageUrl(e.images[0])} alt="" loading="lazy" width={64} height={64} />
                  <span>
                    <strong>{displayName(e)}</strong>
                    <em>{EQUIPMENT[e.equipment]}</em>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </article>
  );
}
