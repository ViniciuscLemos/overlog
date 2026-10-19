import { useLiveQuery } from 'dexie-react-hooks';
import { exerciseHistory } from '../lib/db';
import { dateLabel, estimatedMax, formatKg, formatSet } from '../lib/workouts';

const W = 320;
const H = 120;
const PAD = 8;

// best set of each session as an estimated max, so 80x9 and 82x7 land on the same scale
function Chart({ points }: { points: { date: number; value: number }[] }) {
  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const x = (i: number) => PAD + (i * (W - PAD * 2)) / Math.max(1, points.length - 1);
  const y = (v: number) => H - PAD - ((v - min) / span) * (H - PAD * 2);
  const line = points.map((p, i) => `${x(i)},${y(p.value)}`).join(' ');

  return (
    <figure className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Evolução da carga estimada por treino">
        <line x1={PAD} x2={W - PAD} y1={H - PAD} y2={H - PAD} stroke="currentColor" opacity="0.2" />
        <polyline points={line} fill="none" stroke="currentColor" strokeWidth="2" />
        {points.map((p, i) => (
          <circle key={p.date} cx={x(i)} cy={y(p.value)} r="3" fill="currentColor" />
        ))}
      </svg>
      <figcaption>
        {formatKg(Math.round(values[0]))} → {formatKg(Math.round(values[values.length - 1]))} kg estimados
        (melhor série de cada treino)
      </figcaption>
    </figure>
  );
}

export function ExerciseHistory({ exerciseId }: { exerciseId: string }) {
  const sessions = useLiveQuery(() => exerciseHistory(exerciseId), [exerciseId]);
  if (!sessions?.length) return null;

  const points = [...sessions]
    .reverse()
    .slice(-12)
    .map((s) => ({
      date: s.date,
      value: Math.max(...s.sets.map((set) => estimatedMax(set.weightKg ?? 0, set.reps ?? 0, set.rir ?? 0))),
    }));
  const weighted = points.some((p) => p.value > 0);

  return (
    <>
      <h3 className="similar-title">Histórico</h3>
      {weighted && points.length > 1 && <Chart points={points} />}
      <ul className="list">
        {sessions.slice(0, 6).map((s) => (
          <li key={s.workoutId} className="slot">
            <a href={`#/historico/${s.workoutId}`}>{dateLabel(s.date)}</a>
            <p className="last">{s.sets.map(formatSet).join(' · ')}</p>
          </li>
        ))}
      </ul>
    </>
  );
}
