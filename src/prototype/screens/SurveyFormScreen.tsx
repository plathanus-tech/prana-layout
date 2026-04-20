import { useState } from 'react';
import { RadioButton } from '../../components/RadioButton/RadioButton';
import { Button } from '../../components/Button/Button';
import { Input } from '../../components/Input/Input';
import { AppHeader } from '../components/AppHeader';
import type { SurveySuccessVariant } from './SurveySuccessScreen';
import styles from './SurveyFormScreen.module.css';

// ─── Tipos ──────────────────────────────────────────────

interface SurveyOption   { label: string; value: string; }
interface SurveyQuestion { id: string; text: string; options: SurveyOption[]; }
interface ServiceBlock   { id: string; name: string; questions: SurveyQuestion[]; }
interface SurveyData     { eventName: string; services: ServiceBlock[]; eventQuestions: SurveyQuestion[]; }

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
          { id: 'ma-q1', text: 'Como você avalia o atendimento do profissional?', options: RATING_OPTIONS },
          { id: 'ma-q2', text: 'O ambiente estava confortável e acolhedor?',      options: RATING_OPTIONS },
          { id: 'ma-q3', text: 'O serviço atendeu às suas expectativas?',          options: RATING_OPTIONS },
        ],
      },
    ],
    eventQuestions: [
      { id: 'ev-q1', text: 'Como você avalia a organização geral do evento?', options: RATING_OPTIONS },
      { id: 'ev-q2', text: 'Você recomendaria este programa para um colega?',  options: RATING_OPTIONS },
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
          { id: 'ma-q1', text: 'Como você avalia o atendimento do profissional?', options: RATING_OPTIONS },
          { id: 'ma-q2', text: 'O ambiente estava confortável e acolhedor?',      options: RATING_OPTIONS },
          { id: 'ma-q3', text: 'O serviço atendeu às suas expectativas?',          options: RATING_OPTIONS },
        ],
      },
      {
        id: 'reflexology',
        name: 'Reflexologia',
        questions: [
          { id: 're-q1', text: 'Como você avalia o atendimento do profissional?', options: RATING_OPTIONS },
          { id: 're-q2', text: 'O serviço trouxe relaxamento e bem-estar?',        options: RATING_OPTIONS },
          { id: 're-q3', text: 'O serviço atendeu às suas expectativas?',          options: RATING_OPTIONS },
        ],
      },
    ],
    eventQuestions: [
      { id: 'ev-q1', text: 'Como você avalia a organização geral do evento?', options: RATING_OPTIONS },
      { id: 'ev-q2', text: 'Você recomendaria este programa para um colega?',  options: RATING_OPTIONS },
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
  const [personalRole, setPersonalRole] = useState('');

  function setAnswer(id: string, value: string) {
    setAnswers(prev => ({ ...prev, [id]: value }));
  }

  // ── Progresso e score ─────────────────────────────────
  const allQuestions = [
    ...survey.services.flatMap(s => s.questions),
    ...survey.eventQuestions,
  ];
  const total     = allQuestions.length + 1; // +1 para o campo de cargo
  const answered  = allQuestions.filter(q => answers[q.id]).length + (personalRole ? 1 : 0);
  const canSubmit = answered === total && personalRole !== '';

  function handleSubmit() {
    if (!canSubmit) return;
    const avg = allQuestions
      .map(q => Number(answers[q.id]))
      .reduce((a, b) => a + b, 0) / total;
    onNavigate?.(avg >= 4 ? 'positive' : 'neutral');
  }

  // ── Render ────────────────────────────────────────────
  return (
    <div className={styles.page}>
      <AppHeader />

      {/* Hero */}
      <div className={styles.hero}>
        <div className={[styles.heroInner, isDesktop ? styles.heroInnerDesktop : ''].filter(Boolean).join(' ')}>
          <span className={styles.heroTag}>Pesquisa de satisfação</span>
          <h1 className={styles.heroTitle}>{survey.eventName}</h1>
          <p className={styles.heroSub}>Compartilhe sua experiência, leva menos de 2 minutos.</p>
        </div>
      </div>

      {/* Formulário */}
      <div className={[styles.content, isDesktop ? styles.contentDesktop : ''].filter(Boolean).join(' ')}>

        {/* Informações Pessoais */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Informações Pessoais</h2>
          <div className={styles.questionList}>
            <div className={styles.questionCard}>
              <Input
                label="Qual seu cargo/função?"
                type="text"
                value={personalRole}
                onChange={(e) => setPersonalRole(e.target.value)}
                placeholder="ex. Gerente, Desenvolvedor, Analista..."
                maxLength={100}
              />
            </div>
          </div>
        </section>

        {/* Blocos por serviço */}
        {survey.services.map(svc => (
          <section key={svc.id} className={styles.section}>
            <h2 className={styles.sectionTitle}>{svc.name}</h2>
            <div className={styles.questionList}>
              {svc.questions.map(q => (
                <div key={q.id} className={styles.questionCard}>
                  <RadioButton
                    name={q.id}
                    label={q.text}
                    options={q.options}
                    value={answers[q.id] ?? ''}
                    onChange={val => setAnswer(q.id, val)}
                  />
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Perguntas gerais do evento */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Sobre o evento</h2>
          <div className={styles.questionList}>
            {survey.eventQuestions.map(q => (
              <div key={q.id} className={styles.questionCard}>
                <RadioButton
                  name={q.id}
                  label={q.text}
                  options={q.options}
                  value={answers[q.id] ?? ''}
                  onChange={val => setAnswer(q.id, val)}
                />
              </div>
            ))}
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
