import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect } from 'react';
import { activeWorkout, createRoutine, db, lastFinishedWorkout, moveRoutine, startWorkout } from '../lib/db';
import { nextInRotation, suggestName, totalSets } from '../lib/routines';
import { dateLabel } from '../lib/workouts';
import { Backup } from './Backup';

export function Routines() {
  const routines = useLiveQuery(() => db.routines.orderBy('position').toArray());
  const last = useLiveQuery(() => lastFinishedWorkout());
  const active = useLiveQuery(() => activeWorkout());
  const next = routines && nextInRotation(routines, last?.routineId ?? null);

  useEffect(() => {
    document.title = 'Treinos · Overlog';
    return () => {
      document.title = 'Overlog';
    };
  }, []);

  async function newRoutine() {
    const id = await createRoutine(suggestName((routines ?? []).map((r) => r.name)));
    window.location.hash = `#/treinos/${id}`;
  }

  async function start(routineId: number) {
    window.location.hash = `#/treino/${await startWorkout(routineId)}`;
  }

  if (!routines) return null;

  return (
    <section className="routines">
      <h2>Treinos</h2>
      <p className="intro">
        Monta quantos quiser, na ordem que você faz. Depois do último volta pro primeiro, não fica preso a dia da
        semana.
      </p>

      {active ? (
        <a className="primary as-button" href={`#/treino/${active.id}`}>Continuar {active.name}</a>
      ) : (
        next && next.exercises.length > 0 && (
          <button type="button" className="primary" onClick={() => start(next.id!)}>Começar {next.name}</button>
        )
      )}
      {last && (
        <p className="count">
          Último: {last.name}, {dateLabel(last.startedAt)} · <a href="#/historico">histórico</a>
        </p>
      )}

      <ol className="rotation">
        {routines.map((r, i) => (
          <li key={r.id}>
            <a href={`#/treinos/${r.id}`} className="routine">
              <strong>{r.name}</strong>
              <em>
                {r.exercises.length} {r.exercises.length === 1 ? 'exercício' : 'exercícios'} · {totalSets(r)} séries
                {r.id === next?.id && ' · próximo'}
              </em>
            </a>
            <span className="order">
              <button type="button" aria-label={`Subir ${r.name}`} disabled={i === 0} onClick={() => moveRoutine(r.id!, -1)}>
                ↑
              </button>
              <button
                type="button"
                aria-label={`Descer ${r.name}`}
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
        <p className="muted">
          Nenhum treino ainda. Cria um pra cada dia da sua divisão (Upper 1, Lower 1...).
        </p>
      )}
      <button type="button" className="more" onClick={newRoutine}>
        + Novo treino
      </button>

      <Backup routineCount={routines.length} />
    </section>
  );
}
