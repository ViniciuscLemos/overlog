import { useEffect } from 'react';
import { STUDIES, studyText } from '../data/studies';
import { t } from '../lib/i18n';

export function Studies() {
  const studies = STUDIES.map(studyText);
  const topics = [...new Set(studies.map((s) => s.topic))];

  useEffect(() => {
    document.title = `${t.studies.title} · Overlog`;
    return () => {
      document.title = 'Overlog';
    };
  }, []);

  return (
    <section className="studies">
      <h2>{t.studies.title}</h2>
      <p className="intro">{t.studies.intro}</p>
      <p className="muted">{t.studies.meta}</p>

      {topics.map((topic) => (
        <div key={topic}>
          <h3>{topic}</h3>
          {studies.filter((s) => s.topic === topic).map((s) => (
            <article key={s.doi} className="study">
              <p className="takeaway">{s.takeaway}</p>
              <p>{s.summary}</p>
              <p className="cite">
                {s.authors} ({s.year}). <em>{s.title}</em>. {s.journal}.
              </p>
              <a className="read" href={`https://doi.org/${s.doi}`} target="_blank" rel="noopener noreferrer">
                {t.studies.open}
              </a>
            </article>
          ))}
        </div>
      ))}
    </section>
  );
}
