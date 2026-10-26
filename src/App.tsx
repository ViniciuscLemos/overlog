import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useState } from 'react';
import { ExerciseDetail } from './components/ExerciseDetail';
import { History, WorkoutSummary } from './components/History';
import { Library } from './components/Library';
import { RoutineEditor } from './components/RoutineEditor';
import { Routines } from './components/Routines';
import { Settings } from './components/Settings';
import { Studies } from './components/Studies';
import { Workout } from './components/Workout';
import { activeWorkout, db, saveRoutine } from './lib/db';
import { addExercise } from './lib/routines';
import type { Filters } from './lib/exercises';
import { lang, setLang, t } from './lib/i18n';

const isList = (hash: string) => hash.replace(/^#\/?/, '') === '';

function useRoute() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    // back to the list keeps the scroll, other pages start at the top
    let listScroll = 0;
    let onList = isList(window.location.hash);
    const onChange = () => {
      if (onList) listScroll = window.scrollY;
      onList = isList(window.location.hash);
      setHash(window.location.hash);
      const y = onList ? listScroll : 0;
      // two frames so the list is on the page again
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
    // nothing saved
  }
  return { text: '', equipment: null, muscle: null };
}

export default function App() {
  const route = useRoute();
  const [filters, setFilters] = useState<Filters>(savedFilters);
  useEffect(() => {
    try {
      sessionStorage.setItem('filters', JSON.stringify(filters));
    } catch {
      // private mode
    }
  }, [filters]);
  const exercise = route.match(/^exercicio\/(.+)$/);
  const studies = route === 'estudos';
  const settings = route === 'ajustes';
  const editing = route.match(/^treinos\/(\d+)$/);
  const adding = route.match(/^treinos\/(\d+)\/adicionar$/);
  const logging = route.match(/^treino\/(\d+)$/);
  const history = route === 'historico';
  const summary = route.match(/^historico\/(\d+)$/);
  const routines = route === 'treinos' || editing || adding || logging || history || summary;
  const active = useLiveQuery(() => activeWorkout());

  // separate search so picking doesn't mess with the exercises tab
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
  else if (settings) page = <Settings />;
  else if (adding) {
    page = (
      <>
        <a className="back" href={`#/treinos/${adding[1]}`}>{t.library.backToWorkout}</a>
        <h2 className="pick-title">{t.library.addTitle}</h2>
        <Library
          filters={pickFilters}
          onFilters={setPickFilters}
          onPick={(e) => addToRoutine(Number(adding[1]), e.id)}
          alreadyIn={new Set(addingTo?.exercises.map((x) => x.exerciseId))}
        />
      </>
    );
  } else if (editing) page = <RoutineEditor id={Number(editing[1])} />;
  else if (logging) page = <Workout id={Number(logging[1])} />;
  else if (history) page = <History />;
  else if (summary) page = <WorkoutSummary id={Number(summary[1])} />;
  else if (route === 'treinos') page = <Routines />;
  else if (exercise) page = <ExerciseDetail id={decodeURIComponent(exercise[1])} />;
  else page = <Library filters={filters} onFilters={setFilters} />;

  return (
    <>
      <header className="top">
        <a href="#/" className="logo">
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
          <a href="#/" aria-current={exercise || studies || routines || settings ? undefined : 'page'}>{t.nav.exercises}</a>
          <a href="#/treinos" aria-current={routines ? 'page' : undefined}>{t.nav.workouts}</a>
          <a href="#/estudos" aria-current={studies ? 'page' : undefined}>{t.nav.studies}</a>
          <button type="button" className="lang" aria-label={t.nav.switchLang} title={t.nav.switchLang} onClick={() => setLang(lang === 'pt' ? 'en' : 'pt')}>
            {t.nav.otherLang}
          </button>
        </nav>
      </header>
      {active && !logging && route !== 'treinos' && (
        <a className="in-progress" href={`#/treino/${active.id}`}>
          {t.inProgress(active.name)} · <u>{t.backToWorkout}</u>
        </a>
      )}
      <main>
        {page}
      </main>
      <footer className="credits">
        {t.credits.drawings} <a href="https://github.com/everkinetic/data">Everkinetic</a> (CC BY-SA 4.0).{' '}
        {t.credits.code} <a href="https://github.com/ViniciuscLemos/overlog">GitHub</a>.{' '}
        <a href="#/ajustes">{t.settings.link}</a> ·{' '}
        <button type="button" className="clear" onClick={() => setLang(lang === 'pt' ? 'en' : 'pt')}>
          {t.credits.other}
        </button>
      </footer>
    </>
  );
}
