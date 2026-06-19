import { useState } from 'react';
import { Star } from 'lucide-react';
import { RadioButton } from '../../components/RadioButton/RadioButton';
import { Button } from '../../components/Button/Button';
import { AppHeader } from '../components/AppHeader';
import type { SurveySuccessVariant } from './SurveySuccessScreen';
import styles from './SurveyFormScreen.module.css';

// ─── Tipos ──────────────────────────────────────────────

interface SurveyOption   { label: string; value: string; }
interface SurveyQuestion { id: string; text: string; subtitle?: string; options: SurveyOption[]; }

interface ProfessionalEntry {
  id: string;
  name: string;
  initials: string;
  ratingId: string; // ID único para a resposta deste profissional no mapa de answers
}

interface ProfessionalRatingGroup {
  text: string;
  subtitle?: string;
  professionals: ProfessionalEntry[];
}

interface ServiceBlock {
  id: string;
  name: string;
  questions?: SurveyQuestion[];
  professionalRatingGroup?: ProfessionalRatingGroup;
}

interface SurveyData { eventName: string; services: ServiceBlock[]; eventQuestions: SurveyQuestion[]; }

// ─── Demo data ───────────────────────────────────────────

const RATING_OPTIONS: SurveyOption[] = [
  { label: 'Ótimo',      value: '5' },
  { label: 'Bom',        value: '4' },
  { label: 'Regular',    value: '3' },
  { label: 'Ruim',       value: '2' },
  { label: 'Muito ruim', value: '1' },
];

const SURVEYS: Record<'A' | 'B', SurveyData> = {
  // Cenário A — serviço único
  A: {
    eventName: 'Programa de Bem-Estar',
    services: [
      {
        id: 'massage',
        name: 'Quick Massage',
        questions: [
          { id: 'ma-q1', text: 'Como você avalia o atendimento do profissional?', subtitle: 'Considere a cordialidade, atenção e profissionalismo durante o atendimento.', options: RATING_OPTIONS },
          { id: 'ma-q2', text: 'O ambiente estava confortável e acolhedor?',      subtitle: 'Pense no conforto, temperatura e estrutura do espaço.',                     options: RATING_OPTIONS },
          { id: 'ma-q3', text: 'O serviço atendeu às suas expectativas?',          subtitle: 'Compare com o que você esperava antes do atendimento.',                     options: RATING_OPTIONS },
        ],
      },
    ],
    eventQuestions: [
      { id: 'ev-q1', text: 'Como você avalia a organização geral do evento?', subtitle: 'Considere pontualidade, comunicação e logística.', options: RATING_OPTIONS },
      { id: 'ev-q2', text: 'Você recomendaria este programa para um colega?',  subtitle: 'Pense na experiência como um todo.',             options: RATING_OPTIONS },
    ],
  },

  // Cenário B — múltiplos serviços
  B: {
    eventName: 'Programa de Bem-Estar',
    services: [
      {
        id: 'massage',
        name: 'Quick Massage',
        questions: [
          { id: 'ma-q1', text: 'Como você avalia o atendimento do profissional?', subtitle: 'Considere a cordialidade, atenção e profissionalismo durante o atendimento.', options: RATING_OPTIONS },
          { id: 'ma-q2', text: 'O ambiente estava confortável e acolhedor?',      subtitle: 'Pense no conforto, temperatura e estrutura do espaço.',                     options: RATING_OPTIONS },
          { id: 'ma-q3', text: 'O serviço atendeu às suas expectativas?',          subtitle: 'Compare com o que você esperava antes do atendimento.',                     options: RATING_OPTIONS },
        ],
      },
      {
        id: 'reflexology',
        name: 'Reflexologia',
        questions: [
          { id: 're-q1', text: 'O serviço trouxe relaxamento e bem-estar?',  subtitle: 'Considere como você se sentiu durante e após a sessão.',       options: RATING_OPTIONS },
          { id: 're-q2', text: 'O serviço atendeu às suas expectativas?',    subtitle: 'Compare com o que você esperava antes do atendimento.',         options: RATING_OPTIONS },
        ],
        professionalRatingGroup: {
          text: 'Como você avalia o atendimento dos profissionais?',
          subtitle: 'Considere a cordialidade, atenção e profissionalismo durante o atendimento.',
          professionals: [
            { id: 're-carlos',  name: 'Carlos Mendes',  initials: 'CM', ratingId: 're-carlos-rating'  },
            { id: 're-beatriz', name: 'Beatriz Santos', initials: 'BS', ratingId: 're-beatriz-rating' },
          ],
        },
      },
    ],
    eventQuestions: [
      { id: 'ev-q1', text: 'Como você avalia a organização geral do evento?', subtitle: 'Considere pontualidade, comunicação e logística.', options: RATING_OPTIONS },
      { id: 'ev-q2', text: 'Você recomendaria este programa para um colega?',  subtitle: 'Pense na experiência como um todo.',             options: RATING_OPTIONS },
    ],
  },
};

// ─── Componente ──────────────────────────────────────────

interface SurveyFormScreenProps {
  viewport?:   'mobile' | 'desktop';
  scenario?:   'A' | 'B';
  onNavigate?: (variant: SurveySuccessVariant) => void;
}

export function SurveyFormScreen({
  viewport   = 'desktop',
  scenario   = 'A',
  onNavigate,
}: SurveyFormScreenProps) {
  const isDesktop = viewport === 'desktop';
  const survey    = SURVEYS[scenario];

  const [answers, setAnswers] = useState<Record<string, string>>({});

  function setAnswer(id: string, value: string) {
    setAnswers(prev => ({ ...prev, [id]: value }));
  }

  // ── Progresso e score ─────────────────────────────────
  // IDs rastreados: perguntas normais + ratingId de cada profissional
  const allTrackedIds: string[] = [
    ...survey.services.flatMap(s => [
      ...(s.questions?.map(q => q.id) ?? []),
      ...(s.professionalRatingGroup?.professionals.map(p => p.ratingId) ?? []),
    ]),
    ...survey.eventQuestions.map(q => q.id),
  ];

  const total     = allTrackedIds.length;
  const answered  = allTrackedIds.filter(id => answers[id]).length;
  const canSubmit = answered === total;

  function handleSubmit() {
    if (!canSubmit) return;
    const allValues = allTrackedIds.map(id => Number(answers[id]));
    const avg = allValues.reduce((a, b) => a + b, 0) / total;
    onNavigate?.(avg >= 4 ? 'positive' : 'neutral');
  }

  // ── Helper: avaliação em estrelas ────────────────────
  function StarRating({ id, value }: { id: string; value: string }) {
    const rating = Number(value) || 0;
    return (
      <div className={styles.starRating} role="group" aria-label="Avaliação em estrelas">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            className={styles.starBtn}
            onClick={() => setAnswer(id, String(n))}
            aria-label={`${n} estrela${n > 1 ? 's' : ''}`}
            aria-pressed={n <= rating}
          >
            <Star
              size={28}
              strokeWidth={1.5}
              fill={n <= rating ? 'currentColor' : 'none'}
              className={n <= rating ? styles.starFilled : styles.starEmpty}
            />
          </button>
        ))}
      </div>
    );
  }

  // ── Helper: renderiza uma questionCard padrão ─────────
  function renderQuestion(q: SurveyQuestion) {
    return (
      <div key={q.id} className={styles.questionCard}>
        <div className={styles.questionTextBlock}>
          <p className={styles.questionText}>{q.text}</p>
          {q.subtitle && <p className={styles.questionSubtitle}>{q.subtitle}</p>}
        </div>
        <RadioButton
          name={q.id}
          options={q.options}
          value={answers[q.id] ?? ''}
          onChange={val => setAnswer(q.id, val)}
        />
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────
  return (
    <div className={styles.page}>
      <div className={styles.stickyHeader}>
        <AppHeader />
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${Math.min(100, Math.round((answered / total) * 100))}%` }}
          />
        </div>
      </div>

      {/* Hero */}
      <div className={styles.hero}>
        <div className={[styles.heroInner, isDesktop ? styles.heroInnerDesktop : ''].filter(Boolean).join(' ')}>
          <span className={styles.heroTag}>Pesquisa de satisfação</span>
          <h1 className={styles.heroTitle}>{survey.eventName}</h1>
          <p className={styles.heroSub}>Sua opinião é importante para nós.</p>
        </div>
      </div>

      {/* Formulário */}
      <div className={[styles.content, isDesktop ? styles.contentDesktop : ''].filter(Boolean).join(' ')}>

        {/* Blocos por serviço */}
        {survey.services.map(svc => (
          <section key={svc.id} className={styles.section}>
            <h2 className={styles.sectionTitle}>{svc.name}</h2>

            {/* Perguntas sobre o serviço */}
            {svc.questions && svc.questions.length > 0 && (
              <div className={styles.questionList}>
                {svc.questions.map(renderQuestion)}
              </div>
            )}

            {/* Card único de avaliação dos profissionais */}
            {svc.professionalRatingGroup && (
              <div className={styles.questionList}>
                <div className={styles.questionCard}>
                  <div className={styles.questionTextBlock}>
                    <p className={styles.questionText}>{svc.professionalRatingGroup.text}</p>
                    {svc.professionalRatingGroup.subtitle && (
                      <p className={styles.questionSubtitle}>{svc.professionalRatingGroup.subtitle}</p>
                    )}
                  </div>

                  <div className={styles.profRatingList}>
                    {svc.professionalRatingGroup.professionals.map((pro, idx) => (
                      <div
                        key={pro.id}
                        className={[
                          styles.profRatingItem,
                          idx > 0 ? styles.profRatingItemDivider : '',
                        ].filter(Boolean).join(' ')}
                      >
                        <div className={styles.profRatingIdentity}>
                          <span className={styles.profAvatar}>{pro.initials}</span>
                          <span className={styles.profName}>{pro.name}</span>
                        </div>
                        <StarRating id={pro.ratingId} value={answers[pro.ratingId] ?? ''} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>
        ))}

        {/* Perguntas gerais do evento */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Sobre o evento</h2>
          <div className={styles.questionList}>
            {survey.eventQuestions.map(renderQuestion)}
          </div>
        </section>

      </div>

      {/* CTA */}
      <div className={styles.ctaBar}>
        <div className={[styles.ctaInner, isDesktop ? styles.ctaInnerDesktop : ''].filter(Boolean).join(' ')}>
          <span className={styles.ctaProgress}>{answered} de {total} perguntas respondidas</span>
          <div className={styles.buttonWrapper}>
            <Button
              variant="primary"
              size="lg"
              disabled={!canSubmit}
              onClick={handleSubmit}
            >
              Enviar pesquisa
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
