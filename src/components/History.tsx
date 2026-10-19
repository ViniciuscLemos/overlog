import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useState } from 'react';
import { partnerShare, shareFileName } from '../lib/backup';
import { db, workoutSets, type LoggedSet } from '../lib/db';
import { displayName, loadExercises, type Exercise } from '../lib/exercises';
import { locale, t } from '../lib/i18n';
import { dateLabel, durationLabel, formatSet, summarize } from '../lib/workouts';

const volumeLabel = (kg: number) => `${Math.round(kg).toLocaleString(locale)} kg`;

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
  useTitle(t.history.title);

  if (!workouts) return null;

  return (
    <section className="routines">
      <a className="back" href="#/treinos">{t.editor.back}</a>
      <h2>{t.history.title}</h2>
      {workouts.length === 0 && <p className="muted">{t.history.empty}</p>}
      <ul className="rotation">
        {workouts.map((w) => (
          <li key={w.id}>
            <a href={`#/historico/${w.id}`} className="routine">
              <strong>{w.name}</strong>
              <em>
                {dateLabel(w.startedAt)} · {durationLabel(w.finishedAt! - w.startedAt)} · {t.history.sets(w.summary.sets)} ·{' '}
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
  useTitle(workout?.name ?? t.routines.defaultName);

  useEffect(() => {
    loadExercises().then((all) => setById(new Map(all.map((e) => [e.id, e]))));
  }, []);

  if (workout === undefined || sets === undefined) return null;
  if (!workout) return <p className="muted">{t.history.missing} <a href="#/historico">{t.back}</a></p>;

  const mine = sets.filter((s) => !s.who);
  const summary = summarize(mine);

  async function remove() {
    if (!window.confirm(t.history.remove(workout!.name, dateLabel(workout!.startedAt)))) return;
    await db.transaction('rw', db.workouts, db.sets, async () => {
      await db.sets.where('workoutId').equals(id).delete();
      await db.workouts.delete(id);
    });
    window.location.hash = '#/historico';
  }

  return (
    <section className="routines">
      <a className="back" href="#/historico">{t.history.back}</a>
      <h2>{workout.name}</h2>
      <p className="count">{dateLabel(workout.startedAt)}</p>

      <dl className="facts summary">
        <dt>{t.history.duration}</dt>
        <dd>{workout.finishedAt ? durationLabel(workout.finishedAt - workout.startedAt) : t.history.inProgress}</dd>
        <dt>{t.history.setsLabel}</dt>
        <dd>{summary.sets}</dd>
        <dt>{t.history.exercises}</dt>
        <dd>{summary.exercises}</dd>
        <dt>{t.history.volume}</dt>
        <dd>{volumeLabel(summary.volumeKg)}</dd>
      </dl>

      <SetList sets={mine} byId={byId} notes={workout.notes} />

      {workout.partners?.map((who) => (
        <div key={who} className="partner">
          <h3>{who}</h3>
          <SetList sets={sets.filter((s) => s.who === who)} byId={byId} />
          {workout.finishedAt && (
            <button type="button" className="secondary" onClick={() => sendPart(id, who)}>{t.history.send(who)}</button>
          )}
        </div>
      ))}

      <div className="editor-actions">
        <button type="button" className="danger" onClick={remove}>{t.history.removeButton}</button>
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
    await navigator.share({ files: [file], title: t.history.shareTitle(who) }).catch(() => {});
    return;
  }
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
