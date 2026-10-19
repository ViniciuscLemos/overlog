// every DOI here was checked on Crossref before going in
import { lang } from '../lib/i18n';

export interface Study {
  topic: string;
  takeaway: string; // "na prática", one line
  summary: string;
  authors: string;
  year: number;
  title: string; // original title, so it can be searched
  journal: string;
  doi: string;
  en: { topic: string; takeaway: string; summary: string };
}

export const STUDIES: Study[] = [
  {
    topic: 'Proximidade da falha',
    takeaway: 'Quanto mais perto da falha a série termina, mais o músculo cresce.',
    summary:
      'Uma série de meta-regressões juntou dezenas de estudos e tratou as repetições na reserva (RIR) como uma dose. A hipertrofia aumentou conforme as séries terminavam mais perto da falha. Na força, essa relação não apareceu de forma clara.',
    authors: 'Robinson et al.',
    year: 2024,
    title: 'Exploring the Dose-Response Relationship Between Estimated Resistance Training Proximity to Failure, Strength Gain, and Muscle Hypertrophy: A Series of Meta-Regressions',
    journal: 'Sports Medicine',
    doi: '10.1007/s40279-024-02069-2',
    en: {
      topic: 'Proximity to failure',
      takeaway: 'The closer to failure a set ends, the more the muscle grows.',
      summary:
        'A series of meta-regressions pooled dozens of studies and treated reps in reserve (RIR) as a dose. Hypertrophy went up as sets ended closer to failure. For strength, that relationship did not show up clearly.',
    },
  },
  {
    topic: 'Proximidade da falha',
    takeaway: 'Não precisa ir até a falha em toda série, mas tem que chegar perto.',
    summary:
      'Revisão com meta-análise comparando treinar até a falha com parar um pouco antes. Com o volume igual, os ganhos de massa foram parecidos, então deixar 1 ou 2 repetições na reserva já resolve.',
    authors: 'Refalo et al.',
    year: 2022,
    title: 'Influence of Resistance Training Proximity-to-Failure on Skeletal Muscle Hypertrophy: A Systematic Review with Meta-analysis',
    journal: 'Sports Medicine',
    doi: '10.1007/s40279-022-01784-y',
    en: {
      topic: 'Proximity to failure',
      takeaway: 'You don\'t need to hit failure on every set, but you have to get close.',
      summary:
        'Review with meta-analysis comparing training to failure with stopping a little short. With the same volume, muscle gains were similar, so leaving 1 or 2 reps in reserve already does the job.',
    },
  },
  {
    topic: 'Proximidade da falha',
    takeaway: 'Dá pra medir o esforço contando as repetições que sobraram (RIR).',
    summary:
      'Os autores propuseram a escala de esforço baseada em repetições na reserva, a mesma que o app usa, e mostraram que ela acompanha bem a velocidade da barra no agachamento. Quem treinava há mais tempo acertou melhor quantas repetições ainda tinha.',
    authors: 'Zourdos et al.',
    year: 2016,
    title: 'Novel Resistance Training-Specific Rating of Perceived Exertion Scale Measuring Repetitions in Reserve',
    journal: 'Journal of Strength and Conditioning Research',
    doi: '10.1519/JSC.0000000000001049',
    en: {
      topic: 'Proximity to failure',
      takeaway: 'Effort can be measured by counting the reps you had left (RIR).',
      summary:
        'The authors proposed the reps-in-reserve effort scale, the same one the app uses, and showed it tracks bar speed in the squat well. People who had trained longer were better at guessing how many reps they had left.',
    },
  },
  {
    topic: 'Progressão',
    takeaway: 'Subir a carga ou subir as repetições deu o mesmo resultado.',
    summary:
      'Um grupo progrediu aumentando a carga e o outro aumentando as repetições com a mesma carga, por 8 semanas. A hipertrofia foi parecida nos dois. Dá pra progredir tanto com mais peso quanto com mais repetições.',
    authors: 'Plotkin et al.',
    year: 2022,
    title: 'Progressive overload without progressing load? The effects of load or repetition progression on muscular adaptations',
    journal: 'PeerJ',
    doi: '10.7717/peerj.14142',
    en: {
      topic: 'Progression',
      takeaway: 'Adding weight or adding reps gave the same result.',
      summary:
        'One group progressed by adding weight and the other by adding reps at the same weight, for 8 weeks. Hypertrophy was similar in both. You can progress with more weight or with more reps.',
    },
  },
  {
    topic: 'Carga e repetições',
    takeaway: 'Carga leve ou pesada dá hipertrofia parecida, se a série for perto da falha.',
    summary:
      'Meta-análise comparando treinos com cargas baixas (mais repetições) e altas (menos repetições). O crescimento muscular foi parecido entre eles; a força máxima foi maior com cargas altas.',
    authors: 'Schoenfeld et al.',
    year: 2017,
    title: 'Strength and Hypertrophy Adaptations Between Low- vs. High-Load Resistance Training: A Systematic Review and Meta-analysis',
    journal: 'Journal of Strength and Conditioning Research',
    doi: '10.1519/JSC.0000000000002200',
    en: {
      topic: 'Load and reps',
      takeaway: 'Light or heavy loads give similar hypertrophy if the set is close to failure.',
      summary:
        'Meta-analysis comparing low loads (more reps) with high loads (fewer reps). Muscle growth was similar between them; max strength was higher with heavy loads.',
    },
  },
  {
    topic: 'Carga e repetições',
    takeaway: 'Em gente treinada, 25 a 35 repetições ou 8 a 12 até a falha deram hipertrofia parecida.',
    summary:
      'Homens que já treinavam fizeram 8 semanas com carga leve (25 a 35 repetições) ou pesada (8 a 12), sempre até a falha. Os músculos cresceram de forma parecida nos dois grupos; a carga pesada ganhou mais força máxima e a leve, mais resistência.',
    authors: 'Schoenfeld et al.',
    year: 2015,
    title: 'Effects of Low- vs. High-Load Resistance Training on Muscle Strength and Hypertrophy in Well-Trained Men',
    journal: 'Journal of Strength and Conditioning Research',
    doi: '10.1519/JSC.0000000000000958',
    en: {
      topic: 'Load and reps',
      takeaway: 'In trained people, 25 to 35 reps or 8 to 12 to failure gave similar hypertrophy.',
      summary:
        'Men who already trained did 8 weeks with a light load (25 to 35 reps) or a heavy one (8 to 12), always to failure. Muscles grew about the same in both groups; the heavy group gained more max strength and the light one more endurance.',
    },
  },
  {
    topic: 'Volume',
    takeaway: 'Mais séries por semana costumam dar mais resultado.',
    summary:
      'Meta-análise sobre o número de séries por músculo por semana. Houve uma relação de dose e resposta: cada série a mais esteve ligada a um ganho um pouco maior, e 10 ou mais séries semanais superaram menos de 5.',
    authors: 'Schoenfeld et al.',
    year: 2016,
    title: 'Dose-response relationship between weekly resistance training volume and increases in muscle mass: A systematic review and meta-analysis',
    journal: 'Journal of Sports Sciences',
    doi: '10.1080/02640414.2016.1210197',
    en: {
      topic: 'Volume',
      takeaway: 'More sets per week usually means more results.',
      summary:
        'Meta-analysis on the number of sets per muscle per week. There was a dose-response relationship: each extra set was linked to a slightly bigger gain, and 10 or more weekly sets beat fewer than 5.',
    },
  },
  {
    topic: 'Frequência',
    takeaway: 'Com o mesmo volume, treinar o músculo 1 ou 3 vezes por semana dá resultado parecido.',
    summary:
      'Revisão sobre quantas vezes por semana treinar cada músculo. Quando o volume total era igual, a frequência não fez diferença relevante. Ela serve mais pra dividir as séries da semana de um jeito que dê pra fazer bem.',
    authors: 'Schoenfeld et al.',
    year: 2018,
    title: 'How many times per week should a muscle be trained to maximize muscle hypertrophy? A systematic review and meta-analysis of studies examining the effects of resistance training frequency',
    journal: 'Journal of Sports Sciences',
    doi: '10.1080/02640414.2018.1555906',
    en: {
      topic: 'Frequency',
      takeaway: 'With the same volume, training a muscle 1 or 3 times a week gives similar results.',
      summary:
        'Review on how many times a week to train each muscle. When total volume was the same, frequency didn\'t make a meaningful difference. It\'s more useful for spreading the week\'s sets so you can do them well.',
    },
  },
  {
    topic: 'Frequência',
    takeaway: 'Treinar cada músculo pelo menos 2 vezes por semana foi melhor que 1.',
    summary:
      'Meta-análise anterior à de cima, sem igualar o volume. Treinar um músculo duas vezes por semana gerou mais hipertrofia que uma vez, em boa parte porque somava mais séries na semana.',
    authors: 'Schoenfeld et al.',
    year: 2016,
    title: 'Effects of Resistance Training Frequency on Measures of Muscle Hypertrophy: A Systematic Review and Meta-Analysis',
    journal: 'Sports Medicine',
    doi: '10.1007/s40279-016-0543-8',
    en: {
      topic: 'Frequency',
      takeaway: 'Training each muscle at least twice a week was better than once.',
      summary:
        'Meta-analysis from before the one above, without matching volume. Training a muscle twice a week led to more hypertrophy than once, largely because it added up to more sets in the week.',
    },
  },
  {
    topic: 'Descanso',
    takeaway: 'Descansar uns 3 minutos entre séries rendeu mais que 1 minuto.',
    summary:
      'Homens treinados fizeram o mesmo treino com 1 ou 3 minutos de descanso por 8 semanas. O grupo de 3 minutos ganhou mais força e mais massa, provavelmente por conseguir manter mais repetições nas séries seguintes.',
    authors: 'Schoenfeld et al.',
    year: 2016,
    title: 'Longer Interset Rest Periods Enhance Muscle Strength and Hypertrophy in Resistance-Trained Men',
    journal: 'Journal of Strength and Conditioning Research',
    doi: '10.1519/JSC.0000000000001272',
    en: {
      topic: 'Rest',
      takeaway: 'Resting about 3 minutes between sets worked better than 1 minute.',
      summary:
        'Trained men did the same program with 1 or 3 minutes of rest for 8 weeks. The 3-minute group gained more strength and more muscle, probably because they kept more reps in the following sets.',
    },
  },
  {
    topic: 'Músculo alongado',
    takeaway: 'Treinar o músculo na posição esticada deu mais hipertrofia.',
    summary:
      'Comparou a flexora sentada (posterior de coxa mais alongado) com a flexora deitada. A sentada fez o posterior de coxa crescer mais.',
    authors: 'Maeo et al.',
    year: 2020,
    title: 'Greater Hamstrings Muscle Hypertrophy but Similar Damage Protection after Training at Long versus Short Muscle Lengths',
    journal: 'Medicine & Science in Sports & Exercise',
    doi: '10.1249/MSS.0000000000002523',
    en: {
      topic: 'Stretched muscle',
      takeaway: 'Training the muscle in the stretched position gave more hypertrophy.',
      summary:
        'Compared the seated leg curl (hamstrings more stretched) with the lying leg curl. The seated one made the hamstrings grow more.',
    },
  },
  {
    topic: 'Músculo alongado',
    takeaway: 'Meia repetição na parte esticada funcionou tão bem quanto a repetição completa.',
    summary:
      'Na cadeira extensora, fazer só a metade do movimento em que o quadríceps está alongado gerou ganhos iguais ou melhores que a amplitude completa, e melhores que parciais na parte encurtada.',
    authors: 'Pedrosa et al.',
    year: 2021,
    title: 'Partial range of motion training elicits favorable improvements in muscular adaptations when carried out at long muscle lengths',
    journal: 'European Journal of Sport Science',
    doi: '10.1080/17461391.2021.1927199',
    en: {
      topic: 'Stretched muscle',
      takeaway: 'Half reps in the stretched part worked as well as full reps.',
      summary:
        'On the leg extension, doing only the half of the movement where the quads are stretched gave equal or better gains than full range, and better than partials in the shortened part.',
    },
  },
  {
    topic: 'Músculo alongado',
    takeaway: 'Tríceps com o braço acima da cabeça cresceu bem mais que com o braço ao lado do corpo.',
    summary:
      'Cada pessoa treinou um braço com extensão de cotovelo acima da cabeça (tríceps mais alongado) e o outro com o braço ao lado do corpo, por 12 semanas. O tríceps cresceu mais no braço que treinou acima da cabeça.',
    authors: 'Maeo et al.',
    year: 2022,
    title: 'Triceps brachii hypertrophy is substantially greater after elbow extension training performed in the overhead versus neutral arm position',
    journal: 'European Journal of Sport Science',
    doi: '10.1080/17461391.2022.2100279',
    en: {
      topic: 'Stretched muscle',
      takeaway: 'Triceps trained with the arm overhead grew a lot more than with the arm by the side.',
      summary:
        'Each person trained one arm with overhead elbow extensions (triceps more stretched) and the other with the arm by the side, for 12 weeks. The triceps grew more in the arm trained overhead.',
    },
  },
  {
    topic: 'Proteína',
    takeaway: 'Até cerca de 1,6 g de proteína por kg por dia, mais proteína ajudou a ganhar massa.',
    summary:
      'Meta-análise com 49 estudos sobre suplementar proteína junto com o treino. A proteína aumentou os ganhos de massa e força, e o benefício parou de crescer por volta de 1,6 g por kg de peso por dia.',
    authors: 'Morton et al.',
    year: 2017,
    title: 'A systematic review, meta-analysis and meta-regression of the effect of protein supplementation on resistance training-induced gains in muscle mass and strength in healthy adults',
    journal: 'British Journal of Sports Medicine',
    doi: '10.1136/bjsports-2017-097608',
    en: {
      topic: 'Protein',
      takeaway: 'Up to about 1.6 g of protein per kg per day, more protein helped build muscle.',
      summary:
        'Meta-analysis of 49 studies on protein supplements along with training. Protein increased gains in muscle and strength, and the benefit stopped growing at around 1.6 g per kg of body weight per day.',
    },
  },
];

export const studyText = (s: Study) => (lang === 'en' ? { ...s, ...s.en } : s);
