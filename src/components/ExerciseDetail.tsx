import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useState } from 'react';
import { db, saveRoutine } from '../lib/db';
import { addExercise } from '../lib/routines';
import { displayName, imageUrl, loadExercises, similar, type Exercise } from '../lib/exercises';
import { EQUIPMENT, MECHANICS, MUSCLES } from '../lib/labels';

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

  if (exercise === undefined) return <p className="muted">Carregando…</p>;
  if (exercise === null) return <p className="muted">Esse exercício não existe. <a href="#/">Voltar</a></p>;

  const muscles = (list: string[]) => list.map((m) => MUSCLES[m] ?? m).join(', ');

  return (
    <article className="detail">
      <div className="detail-top">
        <a className="back" href="#/">‹ Exercícios</a>
        {'share' in navigator && (
          <button
            type="button"
            className="clear"
            onClick={() => navigator.share({ title: displayName(exercise), url: window.location.href }).catch(() => {})}
          >
            Compartilhar
          </button>
        )}
      </div>
      <h2>{displayName(exercise)}</h2>
      {exercise.pt && <p className="en">{exercise.en}</p>}

      <div className="photos">
        {exercise.images.map((img, i) => (
          <figure key={img}>
            <img src={imageUrl(img)} alt={`${displayName(exercise)}, ${i === 0 ? 'início' : 'fim'}`} />
            <figcaption>{i === 0 ? 'Início' : 'Fim'}</figcaption>
          </figure>
        ))}
      </div>

      {routines && routines.length > 0 && (
        <p className="add-to">
          <select
            value=""
            aria-label="Adicionar a um treino"
            onChange={async (e) => {
              const routine = routines.find((r) => r.id === Number(e.target.value));
              if (!routine) return;
              await saveRoutine(routine.id!, { exercises: addExercise(routine.exercises, exercise.id) });
              setAdded(routine.name);
            }}
          >
            <option value="">+ Adicionar a um treino</option>
            {routines.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          {added && <span className="muted"> Adicionado ao {added}.</span>}
        </p>
      )}

      <dl className="facts">
        <dt>Equipamento</dt>
        <dd>{EQUIPMENT[exercise.equipment] ?? exercise.equipment}</dd>
        <dt>Músculos</dt>
        <dd>{muscles(exercise.primary)}</dd>
        {exercise.secondary.length > 0 && (
          <>
            <dt>Ajudam</dt>
            <dd>{muscles(exercise.secondary)}</dd>
          </>
        )}
        {exercise.mechanic && MECHANICS[exercise.mechanic] && (
          <>
            <dt>Tipo</dt>
            <dd>{MECHANICS[exercise.mechanic]}</dd>
          </>
        )}
      </dl>

      <h3>Como fazer</h3>
      <p className="muted">O passo a passo ainda está em inglês; a tradução vem aos poucos.</p>
      <ol className="steps" lang="en">
        {exercise.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>

      {others.length > 0 && (
        <>
          <h3 className="similar-title">Parecidos</h3>
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
