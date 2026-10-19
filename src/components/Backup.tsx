import { useRef, useState } from 'react';
import { backupFileName, makeBackup, parseBackup, restoreBackup } from '../lib/backup';

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
      const backup = parseBackup(await file.text());
      const count = backup.routines.length;
      const replace = routineCount > 0 ? ` Os ${routineCount} treinos de agora vão ser trocados pelos do arquivo.` : '';
      if (!window.confirm(`Restaurar ${count} ${count === 1 ? 'treino' : 'treinos'}?${replace}`)) return;
      await restoreBackup(backup);
      setMessage(`${count} ${count === 1 ? 'treino restaurado' : 'treinos restaurados'}.`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Não deu pra ler esse arquivo.');
    }
  }

  return (
    <div className="backup">
      <p className="muted">
        Tudo fica só nesse celular. Salva um backup de vez em quando, pra não perder se trocar de celular ou limpar o
        navegador.
      </p>
      <div className="editor-actions">
        <button type="button" className="secondary" onClick={save}>Salvar backup</button>
        <button type="button" className="secondary" onClick={() => input.current?.click()}>Restaurar backup</button>
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
