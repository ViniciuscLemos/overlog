import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useState } from 'react';
import { partnerShare, shareFileName } from '../lib/backup';
import { db, workoutSets, type LoggedSet } from '../lib/db';
import { displayName, loadExercises, type Exercise } from '../lib/exercises';
import { dateLabel, durationLabel, formatSet, summarize } from '../lib/workouts';

const volumeLabel = (kg: number) => `${Math.round(kg).toLocaleString('pt-BR')} kg`;

function useTitle(title: string) {
  useEffect(() => {
    document.title = `${title} · Overlog`;
    return () => {
      document.title = 'Overlog';
    };
  }, [title]);
}

export function History() {
  const workouts = useLiveQuery(async () => {
    const done = await db.workouts.orderBy('startedAt').reverse().filter((w) => w.finishedAt !== null).toArray();
    return Promise.all(done.map(async (w) => ({ ...w, summary: summarize((await workoutSets(w.id!)).filter((s) => !s.who)) })));
  });
  useTitle('Histórico');

  if (!workouts) return null;

  return (
    <section className="routines">
      <a className="back" href="#/treinos">‹ Treinos</a>
      <h2>Histórico</h2>
      {workouts.length === 0 && <p className="muted">Nenhum treino terminado ainda.</p>}
      <ul className="rotation">
        {workouts.map((w) => (
          <li key={w.id}>
            <a href={`#/historico/${w.id}`} className="routine">
              <strong>{w.name}</strong>
              <em>
                {dateLabel(w.startedAt)} · {durationLabel(w.finishedAt! - w.startedAt)} · {w.summary.sets} séries ·{' '}
                {volumeLabel(w.summary.volumeKg)}
              </em>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function WorkoutSummary({ id }: { id: number }) {
  const workout = useLiveQuery(() => db.workouts.get(id), [id]);
  const sets = useLiveQuery(() => workoutSets(id), [id]);
  const [byId, setById] = useState<Map<string, Exercise>>(new Map());
  useTitle(workout?.name ?? 'Treino');

  useEffect(() => {
    loadExercises().then((all) => setById(new Map(all.map((e) => [e.id, e]))));
  }, []);

  if (workout === undefined || sets === undefined) return null;
  if (!workout) return <p className="muted">Esse treino não existe mais. <a href="#/historico">Voltar</a></p>;

  const mine = sets.filter((s) => !s.who);
  const summary = summarize(mine);

  async function remove() {
    if (!window.confirm(`Apagar o ${workout!.name} de ${dateLabel(workout!.startedAt)} do histórico?`)) return;
    await db.transaction('rw', db.workouts, db.sets, async () => {
      await db.sets.where('workoutId').equals(id).delete();
      await db.workouts.delete(id);
    });
    window.location.hash = '#/historico';
  }

  return (
    <section className="routines">
      <a className="back" href="#/historico">‹ Histórico</a>
      <h2>{workout.name}</h2>
      <p className="count">{dateLabel(workout.startedAt)}</p>

      <dl className="facts summary">
        <dt>Duração</dt>
        <dd>{workout.finishedAt ? durationLabel(workout.finishedAt - workout.startedAt) : 'em andamento'}</dd>
        <dt>Séries</dt>
        <dd>{summary.sets}</dd>
        <dt>Exercícios</dt>
        <dd>{summary.exercises}</dd>
        <dt>Volume</dt>
        <dd>{volumeLabel(summary.volumeKg)}</dd>
      </dl>

      <SetList sets={mine} byId={byId} notes={workout.notes} />

      {workout.partners?.map((who) => (
        <div key={who} className="partner">
          <h3>{who}</h3>
          <SetList sets={sets.filter((s) => s.who === who)} byId={byId} />
          {workout.finishedAt && (
            <button type="button" className="secondary" onClick={() => sendPart(id, who)}>Mandar a parte de {who}</button>
          )}
        </div>
      ))}

      <div className="editor-actions">
        <button type="button" className="danger" onClick={remove}>Apagar do histórico</button>
      </div>
    </section>
  );
}

function SetList({ sets, byId, notes }: { sets: LoggedSet[]; byId: Map<string, Exercise>; notes?: Record<number, string> }) {
  const slots = [...new Set(sets.map((s) => s.slot))].sort((a, b) => a - b);
  return (
    <ul className="list">
      {slots.map((slot) => {
        const list = sets.filter((s) => s.slot === slot && s.done);
        const exercise = byId.get(list[0]?.exerciseId ?? '');
        if (!list.length) return null;
        return (
          <li key={slot} className="slot">
            <a href={`#/exercicio/${list[0].exerciseId}`}>
              <strong>{exercise ? displayName(exercise) : list[0].exerciseId}</strong>
            </a>
            <p className="last">{list.map(formatSet).join(' · ')}</p>
            {notes?.[slot] && <p className="last">{notes[slot]}</p>}
          </li>
        );
      })}
    </ul>
  );
}

// a file the partner opens in their own Overlog (Treinos > Importar treino)
async function sendPart(workoutId: number, who: string) {
  const shared = await partnerShare(workoutId, who);
  const file = new File([JSON.stringify(shared)], shareFileName(who, shared.workout.startedAt), { type: 'application/json' });
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: `Treino de ${who}` }).catch(() => {});
    return;
  }
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
