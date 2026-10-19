import { useEffect } from 'react';
import { STUDIES } from '../data/studies';

export function Studies() {
  const topics = [...new Set(STUDIES.map((s) => s.topic))];

  useEffect(() => {
    document.title = 'Estudos · Overlog';
    return () => {
      document.title = 'Overlog';
    };
  }, []);

  return (
    <section className="studies">
      <h2>Estudos</h2>
      <p className="intro">
        Os estudos que eu uso de base pro app, resumidos. Cada um tem o link pro artigo, se quiser ler inteiro.
      </p>
      <p className="muted">
        Meta-análise é quando juntam vários estudos sobre o mesmo assunto e analisam tudo junto.
      </p>

      {topics.map((topic) => (
        <div key={topic}>
          <h3>{topic}</h3>
          {STUDIES.filter((s) => s.topic === topic).map((s) => (
            <article key={s.doi} className="study">
              <p className="takeaway">{s.takeaway}</p>
              <p>{s.summary}</p>
              <p className="cite">
                {s.authors} ({s.year}). <em>{s.title}</em>. {s.journal}.
              </p>
              <a className="read" href={`https://doi.org/${s.doi}`} target="_blank" rel="noopener noreferrer">
                Abrir o artigo
              </a>
            </article>
          ))}
        </div>
      ))}
    </section>
  );
}
