import { useRef, useState } from 'react';
import { backupFileName, importShared, isSharedWorkout, makeBackup, parseBackup, restoreBackup } from '../lib/backup';
import { t } from '../lib/i18n';
import { dateLabel } from '../lib/workouts';

export function Backup({ routineCount }: { routineCount: number }) {
  const input = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState('');

  async function save() {
    const backup = await makeBackup();
    const file = new File([JSON.stringify(backup)], backupFileName(), { type: 'application/json' });
    // on the iPhone a download from an installed app goes nowhere useful, the share sheet has "Save to Files"
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file] }).catch(() => {});
      return;
    }
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function restore(file: File) {
    try {
      const text = await file.text();
      const data = (() => {
        try {
          return JSON.parse(text);
        } catch {
          return null;
        }
      })();
      if (isSharedWorkout(data)) {
        const when = dateLabel(data.workout.startedAt);
        if (!window.confirm(t.backup.importAsk(data.workout.name, when))) return;
        const id = await importShared(data);
        window.location.hash = `#/historico/${id}`;
        return;
      }
      const backup = parseBackup(text);
      const count = backup.routines.length;
      const replace = routineCount > 0 ? t.backup.replace(routineCount) : '';
      if (!window.confirm(`${t.backup.restoreAsk(count)}${replace}`)) return;
      await restoreBackup(backup);
      setMessage(t.backup.restored(count));
    } catch (e) {
      setMessage(e instanceof Error ? e.message : t.backup.unreadable);
    }
  }

  return (
    <div className="backup">
      <p className="muted">{t.backup.text}</p>
      <div className="editor-actions">
        <button type="button" className="secondary" onClick={save}>{t.backup.save}</button>
        <button type="button" className="secondary" onClick={() => input.current?.click()}>{t.backup.restore}</button>
        <button type="button" className="secondary" onClick={() => input.current?.click()}>{t.backup.import}</button>
      </div>
      <input
        ref={input}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) restore(file);
        }}
      />
      {message && <p className="muted">{message}</p>}
    </div>
  );
}
