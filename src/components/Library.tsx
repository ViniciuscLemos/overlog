import { useEffect, useMemo, useState } from 'react';
import { displayName, imageUrl, loadExercises, search, type Exercise, type Filters } from '../lib/exercises';
import { t } from '../lib/i18n';
import { EQUIPMENT, EQUIPMENT_ORDER, MUSCLES, MUSCLE_ORDER } from '../lib/labels';

const PAGE = 40;

interface Props {
  filters: Filters;
  onFilters: (f: Filters) => void;
  // picking for a workout instead of opening the page
  onPick?: (exercise: Exercise) => void;
  alreadyIn?: Set<string>;
}

export function Library({ filters, onFilters, onPick, alreadyIn }: Props) {
  const [all, setAll] = useState<Exercise[] | null>(null);
  const [shown, setShown] = useState(PAGE);

  useEffect(() => {
    loadExercises().then(setAll);
  }, []);

  const results = useMemo(() => (all ? search(all, filters) : []), [all, filters]);
  // to hide muscles with nothing for the chosen equipment
  const perMuscle = useMemo(() => {
    const count: Record<string, number> = {};
    for (const e of all ?? []) {
      if (filters.equipment && e.equipment !== filters.equipment) continue;
      for (const m of e.primary) count[m] = (count[m] ?? 0) + 1;
    }
    return count;
  }, [all, filters.equipment]);
  useEffect(() => setShown(PAGE), [filters]);

  const set = (patch: Partial<Filters>) => onFilters({ ...filters, ...patch });

  return (
    <section>
      <div className="search">
        <input
          type="search"
          placeholder={t.library.search}
          value={filters.text}
          onChange={(e) => set({ text: e.target.value })}
          // close the keyboard on the phone
          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
          enterKeyHint="search"
          aria-label={t.library.search}
        />
        <select
          value={filters.muscle ?? ''}
          onChange={(e) => set({ muscle: e.target.value || null })}
          aria-label={t.library.muscle}
        >
          <option value="">{t.library.allMuscles}</option>
          {MUSCLE_ORDER.filter((m) => !all || perMuscle[m] || m === filters.muscle).map((m) => (
            <option key={m} value={m}>
              {MUSCLES[m]} ({perMuscle[m] ?? 0})
            </option>
          ))}
        </select>
      </div>

      <div className="chips" role="group" aria-label={t.library.equipment}>
        {EQUIPMENT_ORDER.map((eq) => (
          <button
            key={eq}
            type="button"
            className={filters.equipment === eq ? 'chip on' : 'chip'}
            aria-pressed={filters.equipment === eq}
            onClick={() => set({ equipment: filters.equipment === eq ? null : eq })}
          >
            {EQUIPMENT[eq]}
          </button>
        ))}
      </div>

      {!all ? (
        <p className="muted">{t.library.loading}</p>
      ) : (
        <>
          <p className="count">
            {t.library.count(results.length)}
            {(filters.text || filters.equipment || filters.muscle) && (
              <>
                {' · '}
                <button type="button" className="clear" onClick={() => onFilters({ text: '', equipment: null, muscle: null })}>
                  {t.library.clear}
                </button>
              </>
            )}
          </p>
          <ul className="list">
            {results.slice(0, shown).map((e) => (
              <li key={e.id}>
                <a
                  className="item"
                  href={onPick ? undefined : `#/exercicio/${e.id}`}
                  role={onPick ? 'button' : undefined}
                  tabIndex={onPick ? 0 : undefined}
                  onClick={onPick ? () => onPick(e) : undefined}
                  onKeyDown={onPick ? (ev) => ev.key === 'Enter' && onPick(e) : undefined}
                >
                  <img src={imageUrl(e.images[0])} alt="" loading="lazy" width={72} height={72} />
                  <span>
                    <strong>{displayName(e)}</strong>
                    {e.pt && e.pt === displayName(e) && <small>{e.en}</small>}
                    <em>
                      {EQUIPMENT[e.equipment]} · {e.primary.map((m) => MUSCLES[m] ?? m).join(', ')}
                      {alreadyIn?.has(e.id) && ` · ${t.library.alreadyIn}`}
                    </em>
                  </span>
                </a>
              </li>
            ))}
          </ul>
          {shown < results.length && (
            <button type="button" className="more" onClick={() => setShown(shown + PAGE)}>
              {t.library.more(results.length - shown)}
            </button>
          )}
          {results.length === 0 && (
            <p className="muted">
              {t.library.none}{' '}
              {filters.text && (filters.equipment || filters.muscle) && (
                <button type="button" className="clear" onClick={() => set({ equipment: null, muscle: null })}>
                  {t.library.searchAll(filters.text)}
                </button>
              )}
            </p>
          )}
        </>
      )}
    </section>
  );
}
