export interface Exercise {
  id: string;
  en: string;
  pt: string | null;
  equipment: string;
  primary: string[];
  secondary: string[];
  mechanic: string | null;
  steps: string[];
  images: string[];
}

export interface Filters {
  text: string;
  equipment: string | null;
  muscle: string | null;
}

// drawings stay on Everkinetic's repo, the service worker caches them
export const IMAGE_BASE = 'https://raw.githubusercontent.com/everkinetic/data/main/dist/png/';

export const imageUrl = (path: string) => IMAGE_BASE + path;

export const displayName = (e: Exercise) => e.pt ?? e.en;

export function normalize(text: string) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

let cache: Promise<Exercise[]> | null = null;

// ~800 KB, so it's a separate chunk
export function loadExercises(): Promise<Exercise[]> {
  cache ??= import('../data/exercises.json').then((m) => m.default as Exercise[]);
  return cache;
}

// so "rosca halter" finds the ones still in english, like "Dumbbell Spider Curl"
export const SYNONYMS: Record<string, string[]> = {
  halter: ['dumbbell'], halteres: ['dumbbell'], barra: ['barbell', 'bar'], polia: ['cable'], cabo: ['cable'],
  maquina: ['machine'], agachamento: ['squat'], supino: ['bench press', 'chest press'], rosca: ['curl'],
  remada: ['row'], puxada: ['pull down', 'pulldown'], panturrilha: ['calf', 'calves'], elevacao: ['raise'],
  desenvolvimento: ['shoulder press', 'military press'], afundo: ['lunge'], passada: ['lunge'],
  terra: ['dead lift', 'deadlift'], flexora: ['leg curl'], extensora: ['leg extension'], abdominal: ['crunch'],
  encolhimento: ['shrug'], crucifixo: ['fly', 'flys'], triceps: ['tricep'], biceps: ['bicep'],
};

// synonyms only count at the start of a word, or "remada" (row) finds "narrow stance squat"
const matches = (haystack: string, word: string) =>
  haystack.includes(word) || (SYNONYMS[word] ?? []).some((s) => ` ${haystack}`.includes(` ${s}`));

export function search(all: Exercise[], filters: Filters): Exercise[] {
  const words = normalize(filters.text).split(' ').filter(Boolean);
  const found = all.filter((e) => {
    if (filters.equipment && e.equipment !== filters.equipment) return false;
    if (filters.muscle && !e.primary.includes(filters.muscle)) return false;
    if (!words.length) return true;
    const haystack = normalize(`${e.pt ?? ''} ${e.en}`);
    return words.every((w) => matches(haystack, w));
  });
  // translated ones first, they're the common ones
  return found.sort((a, b) => Number(!a.pt) - Number(!b.pt) || displayName(a).localeCompare(displayName(b), 'pt'));
}

// for when the machine is taken
export function similar(all: Exercise[], exercise: Exercise, limit = 6): Exercise[] {
  const main = exercise.primary[0];
  return all
    .filter((e) => e.id !== exercise.id && e.primary[0] === main)
    .sort((a, b) =>
      Number(b.equipment === exercise.equipment) - Number(a.equipment === exercise.equipment)
      || Number(!a.pt) - Number(!b.pt)
      || displayName(a).localeCompare(displayName(b), 'pt'))
    .slice(0, limit);
}
