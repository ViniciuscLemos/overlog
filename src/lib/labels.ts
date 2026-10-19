// keys are the values in exercises.json

export const EQUIPMENT: Record<string, string> = {
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

export const MUSCLES: Record<string, string> = {
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

export const MECHANICS: Record<string, string> = {
  compound: 'Composto (várias articulações)',
  isolation: 'Isolado (uma articulação)',
};

// common gym stuff first
export const EQUIPMENT_ORDER = ['barbell', 'dumbbell', 'cable', 'machine', 'smith', 'body only', 'e-z curl bar',
  'plate', 'bands', 'medicine ball', 'exercise ball'];

export const MUSCLE_ORDER = ['chest', 'lats', 'middle back', 'lower back', 'traps', 'shoulders', 'biceps',
  'triceps', 'forearms', 'abdominals', 'quadriceps', 'hamstrings', 'glutes', 'calves', 'adductors',
  'abductors', 'neck'];
