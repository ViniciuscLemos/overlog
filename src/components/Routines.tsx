import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect } from 'react';
import { createRoutine, db, moveRoutine } from '../lib/db';
import { nextInRotation, suggestName, totalSets } from '../lib/routines';

export function Routines() {
  const routines = useLiveQuery(() => db.routines.orderBy('position').toArray());
  // TODO: pass the last logged workout once logging exists
  const next = routines && nextInRotation(routines, null);

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

  if (!routines) return null;

  return (
    <section className="routines">
      <h2>Treinos</h2>
      <p className="intro">
        Quantos você quiser, na ordem em que você faz. Eles giram: depois do último, volta pro primeiro, sem prender
        cada treino a um dia da semana.
      </p>

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
          Nenhum treino ainda. Cria um pra cada dia da sua divisão (Upper 1, Lower 1, Upper 2...) e coloca na ordem em
          que você faz.
        </p>
      )}
      <button type="button" className="more" onClick={newRoutine}>
        + Novo treino
      </button>
    </section>
  );
}
