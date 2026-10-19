import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useState } from 'react';
import { ExerciseDetail } from './components/ExerciseDetail';
import { Library } from './components/Library';
import { RoutineEditor } from './components/RoutineEditor';
import { Routines } from './components/Routines';
import { Studies } from './components/Studies';
import { db, saveRoutine } from './lib/db';
import { addExercise } from './lib/routines';
import type { Filters } from './lib/exercises';

// a hash router is enough here and works the same installed or in a tab
const isList = (hash: string) => hash.replace(/^#\/?/, '') === '';

function useRoute() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    // going back to the list lands where you were, anything else starts at the top
    let listScroll = 0;
    let onList = isList(window.location.hash);
    const onChange = () => {
      if (onList) listScroll = window.scrollY;
      onList = isList(window.location.hash);
      setHash(window.location.hash);
      const y = onList ? listScroll : 0;
      // after the next paint, when the list is back on the page
      requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo(0, y)));
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return hash.replace(/^#\/?/, '');
}

function savedFilters(): Filters {
  try {
    const saved = JSON.parse(sessionStorage.getItem('filters') ?? 'null');
    if (saved && typeof saved.text === 'string') return saved;
  } catch {
    // nothing saved, or storage not available
  }
  return { text: '', equipment: null, muscle: null };
}

export default function App() {
  const route = useRoute();
  // kept here so going back from an exercise keeps the search
  const [filters, setFilters] = useState<Filters>(savedFilters);
  // a reload (or iOS bringing the app back) keeps the search where it was
  useEffect(() => {
    try {
      sessionStorage.setItem('filters', JSON.stringify(filters));
    } catch {
      // private mode can refuse storage; the search just starts empty next time
    }
  }, [filters]);
  const exercise = route.match(/^exercicio\/(.+)$/);
  const studies = route === 'estudos';
  const editing = route.match(/^treinos\/(\d+)$/);
  const adding = route.match(/^treinos\/(\d+)\/adicionar$/);
  const routines = route === 'treinos' || editing || adding;

  // the "add to workout" search is its own, so it doesn't change the exercises tab
  const [pickFilters, setPickFilters] = useState<Filters>({ text: '', equipment: null, muscle: null });
  const addingTo = useLiveQuery(() => (adding ? db.routines.get(Number(adding[1])) : undefined), [adding?.[1]]);

  async function addToRoutine(routineId: number, exerciseId: string) {
    const routine = await db.routines.get(routineId);
    if (routine) await saveRoutine(routineId, { exercises: addExercise(routine.exercises, exerciseId) });
    setPickFilters({ text: '', equipment: null, muscle: null });
    window.location.hash = `#/treinos/${routineId}`;
  }

  let page;
  if (studies) page = <Studies />;
  else if (adding) {
    page = (
      <>
        <a className="back" href={`#/treinos/${adding[1]}`}>‹ Voltar ao treino</a>
        <h2 className="pick-title">Adicionar exercício</h2>
        <Library
          filters={pickFilters}
          onFilters={setPickFilters}
          onPick={(e) => addToRoutine(Number(adding[1]), e.id)}
          alreadyIn={new Set(addingTo?.exercises.map((x) => x.exerciseId))}
        />
      </>
    );
  } else if (editing) page = <RoutineEditor id={Number(editing[1])} />;
  else if (route === 'treinos') page = <Routines />;
  else if (exercise) page = <ExerciseDetail id={decodeURIComponent(exercise[1])} />;
  else page = <Library filters={filters} onFilters={setFilters} />;

  return (
    <>
      <header className="top">
        <a href="#/" className="logo">
          {/* the dumbbell going up: the weight on the bar going up over time */}
          <svg viewBox="0 0 512 512" width="26" height="26" aria-hidden="true">
            <g fill="currentColor" transform="rotate(-30 256 256)">
              <rect x="86" y="196" width="34" height="120" rx="8" />
              <rect x="124" y="160" width="46" height="192" rx="10" />
              <rect x="170" y="238" width="172" height="36" rx="6" />
              <rect x="342" y="160" width="46" height="192" rx="10" />
              <rect x="392" y="196" width="34" height="120" rx="8" />
            </g>
          </svg>
          Overlog
        </a>
        <nav>
          <a href="#/" aria-current={exercise || studies || routines ? undefined : 'page'}>Exercícios</a>
          <a href="#/treinos" aria-current={routines ? 'page' : undefined}>Treinos</a>
          <a href="#/estudos" aria-current={studies ? 'page' : undefined}>Estudos</a>
        </nav>
      </header>
      <main>
        {page}
      </main>
      <footer className="credits">
        Desenhos dos exercícios: <a href="https://github.com/everkinetic/data">Everkinetic</a> (CC BY-SA 4.0).{' '}
        Código aberto no <a href="https://github.com/ViniciuscLemos/overlog">GitHub</a>.
      </footer>
    </>
  );
}
