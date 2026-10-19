// Portuguese is what I use; English is for everyone else (and for the screenshots on GitHub).
// ?lang=en or ?lang=pt in the link picks one and remembers it, otherwise the phone's language decides.

export type Lang = 'pt' | 'en';

function detect(): Lang {
  if (typeof window === 'undefined') return 'pt';
  try {
    const asked = new URLSearchParams(window.location.search).get('lang');
    if (asked === 'pt' || asked === 'en') {
      localStorage.setItem('lang', asked);
      return asked;
    }
    const saved = localStorage.getItem('lang');
    if (saved === 'pt' || saved === 'en') return saved;
  } catch {
    // private mode
  }
  return navigator.language?.toLowerCase().startsWith('pt') ? 'pt' : 'en';
}

export const lang: Lang = detect();
export const locale = lang === 'pt' ? 'pt-BR' : 'en-US';

export function setLang(next: Lang) {
  const url = new URL(window.location.href);
  url.searchParams.set('lang', next);
  window.location.replace(url);
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

const pt = {
  nav: { exercises: 'Exercícios', workouts: 'Treinos', studies: 'Estudos' },
  credits: { drawings: 'Desenhos dos exercícios:', code: 'Código aberto no', other: 'English' },
  inProgress: (name: string) => `${name} em andamento`,
  backToWorkout: 'voltar pro treino',
  back: 'Voltar',
  loading: 'Carregando…',

  library: {
    search: 'Buscar exercício',
    allMuscles: 'Todos os músculos',
    equipment: 'Equipamento',
    muscle: 'Músculo',
    loading: 'Carregando exercícios…',
    count: (n: number) => plural(n, 'exercício', 'exercícios'),
    clear: 'limpar filtros',
    more: (n: number) => `Mostrar mais (${n})`,
    none: 'Nada com esses filtros.',
    searchAll: (text: string) => `Buscar "${text}" em tudo`,
    alreadyIn: 'já está no treino',
    backToWorkout: '‹ Voltar ao treino',
    addTitle: 'Adicionar exercício',
  },

  exercise: {
    back: '‹ Exercícios',
    missing: 'Esse exercício não existe.',
    share: 'Compartilhar',
    start: 'Início',
    end: 'Fim',
    addTo: '+ Adicionar a um treino',
    added: (name: string) => `Adicionado ao ${name}.`,
    equipment: 'Equipamento',
    muscles: 'Músculos',
    helpers: 'Ajudam',
    type: 'Tipo',
    inWorkouts: 'Nos treinos',
    howTo: 'Como fazer',
    englishSteps: 'O passo a passo ainda tá em inglês, vou traduzindo aos poucos.',
    similar: 'Parecidos',
    history: 'Histórico',
    chartLabel: 'Evolução da carga estimada por treino',
    chartCaption: (from: string, to: string) => `${from} → ${to} kg estimados (melhor série de cada treino)`,
  },

  routines: {
    title: 'Treinos',
    intro: 'Monta quantos quiser, na ordem que você faz. Depois do último volta pro primeiro, não fica preso a dia da semana.',
    continue: (name: string) => `Continuar ${name}`,
    start: (name: string) => `Começar ${name}`,
    together: 'Treinar em dupla',
    partnerName: 'Nome de quem vai treinar com você',
    last: 'Último:',
    history: 'histórico',
    exercises: (n: number) => plural(n, 'exercício', 'exercícios'),
    sets: (n: number) => `${n} séries`,
    next: 'próximo',
    up: (name: string) => `Subir ${name}`,
    down: (name: string) => `Descer ${name}`,
    empty: 'Nenhum treino ainda. Cria um pra cada dia da sua divisão (Upper 1, Lower 1...).',
    new: '+ Novo treino',
    defaultName: 'Treino',
    suggested: (letter: string) => `Treino ${letter}`,
    copy: (name: string) => `${name} (cópia)`,
  },

  editor: {
    missing: 'Esse treino não existe mais.',
    back: '‹ Treinos',
    name: 'Nome do treino',
    remove: (name: string) => `Apagar o ${name}? O histórico dos treinos feitos continua.`,
    up: 'Subir',
    down: 'Descer',
    takeOut: 'Tirar do treino',
    takeOutAsk: (name: string) => `Tirar ${name} do treino?`,
    thisExercise: 'esse exercício',
    sets: 'Séries',
    reps: 'Reps',
    minReps: 'Repetições mínimas',
    maxReps: 'Repetições máximas',
    rest: 'Descanso',
    note: 'Nota (banco no 4, pegada fechada...)',
    add: '+ Adicionar exercício',
    perMuscle: 'Séries por músculo:',
    start: 'Começar esse treino',
    duplicate: 'Duplicar treino',
    delete: 'Apagar treino',
  },

  workout: {
    started: (ago: string) => `Começou há ${ago}`,
    finished: 'Esse treino já terminou.',
    seeSummary: 'Ver resumo',
    noneChecked: 'Nenhuma série marcada. Descartar esse treino?',
    leftOut: (n: number) => `${n} ${n === 1 ? 'série sem ✓ fica' : 'séries sem ✓ ficam'} de fora. Terminar?`,
    discardAsk: 'Descartar esse treino? O que foi anotado nele some.',
    discard: 'Descartar treino',
    who: 'Quem está anotando',
    me: 'Eu',
    rest: 'Descanso',
    restOver: 'Descanso acabou',
    sets: (n: number) => `${n} séries`,
    finish: 'Terminar',
    target: (sets: number, min: number, max: number, rest: string) => `${sets} × ${min}–${max} · descanso ${rest}`,
    last: 'Última vez:',
    lastNote: 'Anotação da última vez:',
    addSet: '+ Série',
    removeSet: '− Série',
    note: 'Anotação de hoje (ombro incomodou, máquina diferente...)',
    weight: (n: number) => `Carga da série ${n}`,
    reps: (n: number) => `Repetições da série ${n}`,
    rir: (n: number) => `Reps na reserva da série ${n}`,
    tick: (n: number) => `Marcar série ${n}`,
  },

  step: {
    first: 'Primeira vez: escolhe uma carga que deixe 1 ou 2 reps sobrando.',
    upBodyweight: 'Bateu o topo da faixa em todas: pode pôr carga extra ou subir a faixa de reps.',
    up: (kg: string) => `Bateu o topo da faixa em todas: sobe pra ${kg}.`,
    reps: (kg: string) => `Mantém ${kg} e tenta mais 1 rep.`,
    down: (kg: string) => `Ficou abaixo da faixa indo até a falha: baixa pra ${kg}.`,
    closer: (kg: string) => `Sobraram 3 ou mais reps: mantém ${kg} e chega mais perto da falha.`,
    bodyweight: 'peso do corpo',
  },

  history: {
    title: 'Histórico',
    back: '‹ Histórico',
    empty: 'Nenhum treino terminado ainda.',
    sets: (n: number) => `${n} séries`,
    missing: 'Esse treino não existe mais.',
    remove: (name: string, date: string) => `Apagar o ${name} de ${date} do histórico?`,
    removeButton: 'Apagar do histórico',
    duration: 'Duração',
    inProgress: 'em andamento',
    setsLabel: 'Séries',
    exercises: 'Exercícios',
    volume: 'Volume',
    send: (who: string) => `Mandar a parte de ${who}`,
    shareTitle: (who: string) => `Treino de ${who}`,
  },

  backup: {
    text: 'Tudo fica só nesse celular. Salva um backup de vez em quando, pra não perder se trocar de celular ou limpar o navegador. Treinou em dupla? O arquivo que seu parceiro mandou entra em Importar treino.',
    save: 'Salvar backup',
    restore: 'Restaurar backup',
    import: 'Importar treino',
    importAsk: (name: string, date: string) => `Adicionar o ${name} de ${date} ao seu histórico?`,
    replace: (n: number) => ` Os ${n} treinos de agora vão ser trocados pelos do arquivo.`,
    restoreAsk: (n: number) => `Restaurar ${plural(n, 'treino', 'treinos')}?`,
    restored: (n: number) => `${n} ${n === 1 ? 'treino restaurado' : 'treinos restaurados'}.`,
    unreadable: 'Não deu pra ler esse arquivo.',
    notBackup: 'Esse arquivo não é um backup do Overlog.',
    newer: 'Esse backup é de uma versão mais nova do app. Atualiza a página e tenta de novo.',
    already: 'Esse treino já está no seu histórico.',
    gone: 'Esse treino não existe mais.',
    partner: 'parceiro de treino',
  },

  studies: {
    title: 'Estudos',
    intro: 'Os estudos que eu uso de base pro app, resumidos. Cada um tem o link pro artigo, se quiser ler inteiro.',
    meta: 'Meta-análise é quando juntam vários estudos sobre o mesmo assunto e analisam tudo junto.',
    open: 'Abrir o artigo',
  },
};

const en: typeof pt = {
  nav: { exercises: 'Exercises', workouts: 'Workouts', studies: 'Studies' },
  credits: { drawings: 'Exercise drawings:', code: 'Source code on', other: 'Português' },
  inProgress: (name: string) => `${name} in progress`,
  backToWorkout: 'back to the workout',
  back: 'Back',
  loading: 'Loading…',

  library: {
    search: 'Search exercises',
    allMuscles: 'All muscles',
    equipment: 'Equipment',
    muscle: 'Muscle',
    loading: 'Loading exercises…',
    count: (n: number) => plural(n, 'exercise', 'exercises'),
    clear: 'clear filters',
    more: (n: number) => `Show more (${n})`,
    none: 'Nothing with these filters.',
    searchAll: (text: string) => `Search "${text}" in everything`,
    alreadyIn: 'already in this workout',
    backToWorkout: '‹ Back to the workout',
    addTitle: 'Add exercise',
  },

  exercise: {
    back: '‹ Exercises',
    missing: "This exercise doesn't exist.",
    share: 'Share',
    start: 'Start',
    end: 'End',
    addTo: '+ Add to a workout',
    added: (name: string) => `Added to ${name}.`,
    equipment: 'Equipment',
    muscles: 'Muscles',
    helpers: 'Also works',
    type: 'Type',
    inWorkouts: 'In workouts',
    howTo: 'How to do it',
    englishSteps: '',
    similar: 'Similar',
    history: 'History',
    chartLabel: 'Estimated max per workout over time',
    chartCaption: (from: string, to: string) => `${from} → ${to} kg estimated (best set of each workout)`,
  },

  routines: {
    title: 'Workouts',
    intro: "As many as you want, in the order you do them. After the last one it goes back to the first, so it isn't tied to weekdays.",
    continue: (name: string) => `Continue ${name}`,
    start: (name: string) => `Start ${name}`,
    together: 'Train with a partner',
    partnerName: "Who's training with you?",
    last: 'Last:',
    history: 'history',
    exercises: (n: number) => plural(n, 'exercise', 'exercises'),
    sets: (n: number) => `${n} sets`,
    next: 'next',
    up: (name: string) => `Move ${name} up`,
    down: (name: string) => `Move ${name} down`,
    empty: 'No workouts yet. Make one for each day of your split (Upper 1, Lower 1...).',
    new: '+ New workout',
    defaultName: 'Workout',
    suggested: (letter: string) => `Workout ${letter}`,
    copy: (name: string) => `${name} (copy)`,
  },

  editor: {
    missing: "This workout doesn't exist anymore.",
    back: '‹ Workouts',
    name: 'Workout name',
    remove: (name: string) => `Delete ${name}? The history of the workouts you did stays.`,
    up: 'Move up',
    down: 'Move down',
    takeOut: 'Remove from workout',
    takeOutAsk: (name: string) => `Remove ${name} from this workout?`,
    thisExercise: 'this exercise',
    sets: 'Sets',
    reps: 'Reps',
    minReps: 'Minimum reps',
    maxReps: 'Maximum reps',
    rest: 'Rest',
    note: 'Note (seat on 4, close grip...)',
    add: '+ Add exercise',
    perMuscle: 'Sets per muscle:',
    start: 'Start this workout',
    duplicate: 'Duplicate',
    delete: 'Delete workout',
  },

  workout: {
    started: (ago: string) => `Started ${ago} ago`,
    finished: 'This workout is already over.',
    seeSummary: 'See summary',
    noneChecked: 'No sets checked. Throw this workout away?',
    leftOut: (n: number) => `${n} ${n === 1 ? 'set without ✓ is' : 'sets without ✓ are'} left out. Finish?`,
    discardAsk: 'Throw this workout away? What you logged in it is lost.',
    discard: 'Discard workout',
    who: "Who's logging",
    me: 'Me',
    rest: 'Rest',
    restOver: 'Rest is over',
    sets: (n: number) => `${n} sets`,
    finish: 'Finish',
    target: (sets: number, min: number, max: number, rest: string) => `${sets} × ${min}–${max} · rest ${rest}`,
    last: 'Last time:',
    lastNote: 'Note from last time:',
    addSet: '+ Set',
    removeSet: '− Set',
    note: "Today's note (shoulder felt off, different machine...)",
    weight: (n: number) => `Weight for set ${n}`,
    reps: (n: number) => `Reps for set ${n}`,
    rir: (n: number) => `Reps in reserve for set ${n}`,
    tick: (n: number) => `Check set ${n}`,
  },

  step: {
    first: 'First time: pick a weight that leaves 1 or 2 reps in the tank.',
    upBodyweight: 'Top of the range on every set: add some weight or move the rep range up.',
    up: (kg: string) => `Top of the range on every set: go up to ${kg}.`,
    reps: (kg: string) => `Stay at ${kg} and go for 1 more rep.`,
    down: (kg: string) => `Below the range going to failure: drop to ${kg}.`,
    closer: (kg: string) => `3 or more reps left: stay at ${kg} and get closer to failure.`,
    bodyweight: 'bodyweight',
  },

  history: {
    title: 'History',
    back: '‹ History',
    empty: 'No finished workouts yet.',
    sets: (n: number) => `${n} sets`,
    missing: "This workout doesn't exist anymore.",
    remove: (name: string, date: string) => `Delete ${name} from ${date} from the history?`,
    removeButton: 'Delete from history',
    duration: 'Duration',
    inProgress: 'in progress',
    setsLabel: 'Sets',
    exercises: 'Exercises',
    volume: 'Volume',
    send: (who: string) => `Send ${who} their part`,
    shareTitle: (who: string) => `${who}'s workout`,
  },

  backup: {
    text: "Everything stays on this phone only. Save a backup once in a while so you don't lose it when you switch phones or clear the browser. Trained with a partner? The file they sent you goes in Import workout.",
    save: 'Save backup',
    restore: 'Restore backup',
    import: 'Import workout',
    importAsk: (name: string, date: string) => `Add ${name} from ${date} to your history?`,
    replace: (n: number) => ` Your ${n} current workouts will be replaced by the ones in the file.`,
    restoreAsk: (n: number) => `Restore ${plural(n, 'workout', 'workouts')}?`,
    restored: (n: number) => `${plural(n, 'workout', 'workouts')} restored.`,
    unreadable: "Couldn't read this file.",
    notBackup: "This file isn't an Overlog backup.",
    newer: 'This backup is from a newer version of the app. Reload the page and try again.',
    already: 'This workout is already in your history.',
    gone: "This workout doesn't exist anymore.",
    partner: 'training partner',
  },

  studies: {
    title: 'Studies',
    intro: 'The research I based the app on, summed up. Each one links to the paper if you want to read the whole thing.',
    meta: 'A meta-analysis pools many studies on the same question and analyzes them together.',
    open: 'Open the paper',
  },
};

export const t = lang === 'en' ? en : pt;
