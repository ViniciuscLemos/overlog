import { useEffect } from 'react';
import { lang, setLang, t } from '../lib/i18n';
import { useSettings } from '../lib/settings';

export function Settings() {
  const [settings, update] = useSettings();

  useEffect(() => {
    document.title = `${t.settings.title} · Overlog`;
    return () => {
      document.title = 'Overlog';
    };
  }, []);

  return (
    <section className="routines settings">
      <h2>{t.settings.title}</h2>

      <h3>{t.settings.language}</h3>
      <div className="chips" role="group" aria-label={t.settings.language}>
        <button type="button" className={lang === 'pt' ? 'chip on' : 'chip'} aria-pressed={lang === 'pt'} onClick={() => setLang('pt')}>
          Português
        </button>
        <button type="button" className={lang === 'en' ? 'chip on' : 'chip'} aria-pressed={lang === 'en'} onClick={() => setLang('en')}>
          English
        </button>
      </div>

      <h3>{t.settings.rpg}</h3>
      <label className="toggle">
        <input type="checkbox" checked={settings.rpg} onChange={(e) => update({ rpg: e.target.checked })} />
        <span>{settings.rpg ? t.settings.on : t.settings.off}</span>
      </label>
      <p className="muted">{t.settings.rpgText}</p>
    </section>
  );
}
