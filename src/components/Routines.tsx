import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect } from 'react';
import { activeWorkout, createRoutine, db, lastFinishedWorkout, lastPartners, moveRoutine, startWorkout } from '../lib/db';
import { nextInRotation, suggestName, totalSets } from '../lib/routines';
import { t } from '../lib/i18n';
import { dateLabel } from '../lib/workouts';
import { Backup } from './Backup';

export function Routines() {
  const routines = useLiveQuery(() => db.routines.orderBy('position').toArray());
  const last = useLiveQuery(() => lastFinishedWorkout());
  const active = useLiveQuery(() => activeWorkout());
  const next = routines && nextInRotation(routines, last?.routineId ?? null);

  useEffect(() => {
    document.title = `${t.routines.title} · Overlog`;
    return () => {
      document.title = 'Overlog';
    };
  }, []);

  async function newRoutine() {
    const id = await createRoutine(suggestName((routines ?? []).map((r) => r.name)));
    window.location.hash = `#/treinos/${id}`;
  }

  async function start(routineId: number, partners: string[] = []) {
    window.location.hash = `#/treino/${await startWorkout(routineId, partners)}`;
  }

  // same phone, one person after the other; each one's sets stay apart
  async function startTogether(routineId: number) {
    const name = window.prompt(t.routines.partnerName, (await lastPartners())[0] ?? '');
    if (name?.trim()) await start(routineId, [name.trim()]);
  }

  if (!routines) return null;

  return (
    <section className="routines">
      <h2>{t.routines.title}</h2>
      <p className="intro">{t.routines.intro}</p>

      {active ? (
        <a className="primary as-button" href={`#/treino/${active.id}`}>{t.routines.continue(active.name)}</a>
      ) : (
        next && next.exercises.length > 0 && (
          <>
            <button type="button" className="primary" onClick={() => start(next.id!)}>{t.routines.start(next.name)}</button>
            <button type="button" className="secondary together" onClick={() => startTogether(next.id!)}>
              {t.routines.together}
            </button>
          </>
        )
      )}
      {last && (
        <p className="count">
          {t.routines.last} {last.name}, {dateLabel(last.startedAt)} · <a href="#/historico">{t.routines.history}</a>
        </p>
      )}

      <ol className="rotation">
        {routines.map((r, i) => (
          <li key={r.id}>
            <a href={`#/treinos/${r.id}`} className="routine">
              <strong>{r.name}</strong>
              <em>
                {t.routines.exercises(r.exercises.length)} · {t.routines.sets(totalSets(r))}
                {r.id === next?.id && ` · ${t.routines.next}`}
              </em>
            </a>
            <span className="order">
              <button type="button" aria-label={t.routines.up(r.name)} disabled={i === 0} onClick={() => moveRoutine(r.id!, -1)}>
                ↑
              </button>
              <button
                type="button"
                aria-label={t.routines.down(r.name)}
                disabled={i === routines.length - 1}
                onClick={() => moveRoutine(r.id!, 1)}
              >
                ↓
              </button>
            </span>
          </li>
        ))}
      </ol>

      {routines.length === 0 && (
        <p className="muted">{t.routines.empty}</p>
      )}
      <button type="button" className="more" onClick={newRoutine}>
        {t.routines.new}
      </button>

      <Backup routineCount={routines.length} />
    </section>
  );
}
