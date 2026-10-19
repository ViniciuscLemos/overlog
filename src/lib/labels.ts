// keys are the values in exercises.json
import { lang } from './i18n';

const EQUIPMENT_PT: Record<string, string> = {
  barbell: 'Barra',
  dumbbell: 'Halter',
  cable: 'Polia',
  machine: 'Máquina',
  smith: 'Smith',
  plate: 'Anilha',
  'body only': 'Peso do corpo',
  kettlebells: 'Kettlebell',
  bands: 'Elástico',
  'e-z curl bar': 'Barra W',
  'medicine ball': 'Medicine ball',
  'exercise ball': 'Bola suíça',
  'foam roll': 'Rolo',
  other: 'Outros',
};

const EQUIPMENT_EN: Record<string, string> = {
  barbell: 'Barbell',
  dumbbell: 'Dumbbell',
  cable: 'Cable',
  machine: 'Machine',
  smith: 'Smith',
  plate: 'Plate',
  'body only': 'Bodyweight',
  kettlebells: 'Kettlebell',
  bands: 'Bands',
  'e-z curl bar': 'EZ bar',
  'medicine ball': 'Medicine ball',
  'exercise ball': 'Exercise ball',
  'foam roll': 'Foam roller',
  other: 'Other',
};

const MUSCLES_PT: Record<string, string> = {
  chest: 'Peito',
  lats: 'Dorsal',
  'middle back': 'Meio das costas',
  'lower back': 'Lombar',
  traps: 'Trapézio',
  shoulders: 'Ombros',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  forearms: 'Antebraço',
  abdominals: 'Abdômen',
  quadriceps: 'Quadríceps',
  hamstrings: 'Posterior de coxa',
  glutes: 'Glúteos',
  calves: 'Panturrilha',
  adductors: 'Adutores',
  abductors: 'Abdutores',
  neck: 'Pescoço',
};

const MUSCLES_EN: Record<string, string> = {
  chest: 'Chest',
  lats: 'Lats',
  'middle back': 'Middle back',
  'lower back': 'Lower back',
  traps: 'Traps',
  shoulders: 'Shoulders',
  biceps: 'Biceps',
  triceps: 'Triceps',
  forearms: 'Forearms',
  abdominals: 'Abs',
  quadriceps: 'Quads',
  hamstrings: 'Hamstrings',
  glutes: 'Glutes',
  calves: 'Calves',
  adductors: 'Adductors',
  abductors: 'Abductors',
  neck: 'Neck',
};

const MECHANICS_PT: Record<string, string> = {
  compound: 'Composto (várias articulações)',
  isolation: 'Isolado (uma articulação)',
};

const MECHANICS_EN: Record<string, string> = {
  compound: 'Compound (several joints)',
  isolation: 'Isolation (one joint)',
};

export const EQUIPMENT = lang === 'en' ? EQUIPMENT_EN : EQUIPMENT_PT;
export const MUSCLES = lang === 'en' ? MUSCLES_EN : MUSCLES_PT;
export const MECHANICS = lang === 'en' ? MECHANICS_EN : MECHANICS_PT;

// common gym stuff first
export const EQUIPMENT_ORDER = ['barbell', 'dumbbell', 'cable', 'machine', 'smith', 'body only', 'e-z curl bar',
  'plate', 'bands', 'medicine ball', 'exercise ball'];

export const MUSCLE_ORDER = ['chest', 'lats', 'middle back', 'lower back', 'traps', 'shoulders', 'biceps',
  'triceps', 'forearms', 'abdominals', 'quadriceps', 'hamstrings', 'glutes', 'calves', 'adductors',
  'abductors', 'neck'];
