import { useState } from 'react';
import { RadioButton } from '../../components/RadioButton/RadioButton';
import { Checkbox } from '../../components/Checkbox/Checkbox';
import { Button } from '../../components/Button/Button';
import { Input } from '../../components/Input/Input';
import styles from './SurveyFormScreen.module.css';

// ─── Tipos ──────────────────────────────────────────────────────────────────
interface ProfessionalSurveyQuestion {
  id: string;
  text: string;
  type: 'escala' | 'unica' | 'multipla';
  options: Array<{ label: string; value: string }>;
}

interface ProfessionalSurveyData {
  eventName: string;
  questions: ProfessionalSurveyQuestion[];
}

type SurveySuccessVariant = 'positive' | 'neutral';

// ─── Dados da pesquisa ──────────────────────────────────────────────────────

const RATING_OPTIONS = [
  { label: 'Excelente', value: '5' },
  { label: 'Muito bom', value: '4' },
  { label: 'Bom', value: '3' },
  { label: 'Regular', value: '2' },
  { label: 'Insuficiente', value: '1' },
];

const YES_NO_OPTIONS = [
  { label: 'Sim', value: 'sim' },
  { label: 'Não', value: 'nao' },
];

const PARTIAL_OPTIONS = [
  { label: 'Sim', value: 'sim' },
  { label: 'Parcialmente', value: 'parcialmente' },
  { label: 'Não', value: 'nao' },
];

const DIFFERENTIALS_OPTIONS = [
  { label: 'Qualidade técnica', value: 'qualidade_tecnica' },
  { label: 'Organização', value: 'organizacao' },
  { label: 'Apresentação', value: 'apresentacao' },
  { label: 'Padronização', value: 'padronizacao' },
  { label: 'Custo/benefício', value: 'custo_beneficio' },
  { label: 'Pontualidade', value: 'pontualidade' },
  { label: 'Outro', value: 'outro' },
];

const SURVEY_DATA: ProfessionalSurveyData = {
  eventName: 'Pesquisa Pós-Evento',
  questions: [
    {
      id: 'q1',
      text: 'Como você avalia a experiência da ação?',
      type: 'escala',
      options: RATING_OPTIONS,
    },
    {
      id: 'q2',
      text: 'Nossos serviços atenderam sua necessidade de levar Bem Estar Corporativo?',
      type: 'unica',
      options: PARTIAL_OPTIONS,
    },
    {
      id: 'q3',
      text: 'Nossos profissionais foram solícitos e cumpriram o objetivo esperado?',
      type: 'unica',
      options: PARTIAL_OPTIONS,
    },
    {
      id: 'q4',
      text: 'Os equipamentos e materiais utilizados atenderam as expectativas?',
      type: 'unica',
      options: PARTIAL_OPTIONS,
    },
    {
      id: 'q5',
      text: 'Qual(is) diferencial(is) destacam-se na prestação do serviço?',
      type: 'multipla',
      options: DIFFERENTIALS_OPTIONS,
    },
    {
      id: 'q6',
      text: 'Existe algum ponto que podemos melhorar?',
      type: 'multipla',
      options: DIFFERENTIALS_OPTIONS,
    },
    {
      id: 'q7',
      text: 'Você repetiria a ação novamente?',
      type: 'unica',
      options: YES_NO_OPTIONS,
    },
  ],
};

// ─── Componente ─────────────────────────────────────────────────────────────

interface ProfessionalSurveyFormScreenProps {
  viewport?: 'mobile' | 'desktop';
  eventName?: string;
  onNavigate?: (variant: SurveySuccessVariant) => void;
}

export function ProfessionalSurveyFormScreen({
  viewport = 'desktop',
  eventName,
  onNavigate,
}: ProfessionalSurveyFormScreenProps) {
  const isDesktop = viewport === 'desktop';
  const survey = SURVEY_DATA;

  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [otherText, setOtherText] = useState<Record<string, string>>({});

  function setAnswer(id: string, value: string | string[]) {
    setAnswers(prev => ({ ...prev, [id]: value }));
  }

  function addToMultiple(id: string, value: string) {
    const current = (answers[id] as string[]) || [];
    if (current.includes(value)) {
      setAnswers(prev => ({
        ...prev,
        [id]: current.filter(v => v !== value),
      }));
    } else {
      setAnswers(prev => ({
        ...prev,
        [id]: [...current, value],
      }));
    }
  }

  // Validação: todas as perguntas respondidas
  const allAnswered = SURVEY_DATA.questions.every(q => {
    const answer = answers[q.id];
    if (q.type === 'multipla') {
      return Array.isArray(answer) && answer.length > 0;
    }
    return answer && (typeof answer === 'string' || answer.length > 0);
  });

  function handleSubmit() {
    if (!allAnswered) return;

    // Calcular score para determinar variante
    const q1Score = Number(answers['q1'] || 0);
    const isPositive = q1Score >= 4; // Se avaliação >= 4

    onNavigate?.(isPositive ? 'positive' : 'neutral');
  }

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <div
          className={[styles.heroInner, isDesktop ? styles.heroInnerDesktop : ''].filter(Boolean).join(' ')}
        >
          <span className={styles.heroTag}>Pesquisa de satisfação</span>
          <h1 className={styles.heroTitle}>{eventName || survey.eventName}</h1>
          <p className={styles.heroSub}>Compartilhe sua experiência, leva menos de 5 minutos.</p>
        </div>
      </div>

      {/* Formulário */}
      <div className={[styles.content, isDesktop ? styles.contentDesktop : ''].filter(Boolean).join(' ')}>
        {/* Pergunta 1 — Escala */}
        <section className={styles.section}>
          <div className={styles.questionList}>
            <div className={styles.questionCard}>
              <RadioButton
                name="q1"
                label={SURVEY_DATA.questions[0].text}
                options={RATING_OPTIONS}
                value={answers['q1'] as string || ''}
                onChange={val => setAnswer('q1', val)}
              />
            </div>
          </div>
        </section>

        {/* Pergunta 2 — Opção única */}
        <section className={styles.section}>
          <div className={styles.questionList}>
            <div className={styles.questionCard}>
              <RadioButton
                name="q2"
                label={SURVEY_DATA.questions[1].text}
                options={PARTIAL_OPTIONS}
                value={answers['q2'] as string || ''}
                onChange={val => setAnswer('q2', val)}
              />
            </div>
          </div>
        </section>

        {/* Pergunta 3 — Opção única */}
        <section className={styles.section}>
          <div className={styles.questionList}>
            <div className={styles.questionCard}>
              <RadioButton
                name="q3"
                label={SURVEY_DATA.questions[2].text}
                options={PARTIAL_OPTIONS}
                value={answers['q3'] as string || ''}
                onChange={val => setAnswer('q3', val)}
              />
            </div>
          </div>
        </section>

        {/* Pergunta 4 — Opção única */}
        <section className={styles.section}>
          <div className={styles.questionList}>
            <div className={styles.questionCard}>
              <RadioButton
                name="q4"
                label={SURVEY_DATA.questions[3].text}
                options={PARTIAL_OPTIONS}
                value={answers['q4'] as string || ''}
                onChange={val => setAnswer('q4', val)}
              />
            </div>
          </div>
        </section>

        {/* Pergunta 5 — Múltipla escolha */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{SURVEY_DATA.questions[4].text}</h2>
          <div className={styles.questionList}>
            {DIFFERENTIALS_OPTIONS.map(option => (
              <div key={option.value} className={styles.questionCard}>
                <Checkbox
                  label={option.label}
                  checked={(answers['q5'] as string[])?.includes(option.value) || false}
                  onChange={() => addToMultiple('q5', option.value)}
                />
              </div>
            ))}

            {/* Campo aberto para "Outro" */}
            {(answers['q5'] as string[])?.includes('outro') && (
              <div className={styles.questionCard}>
                <Input
                  label="Especifique o diferencial"
                  type="text"
                  value={otherText['q5'] || ''}
                  onChange={e => setOtherText(prev => ({ ...prev, q5: e.target.value }))}
                  placeholder="Digite aqui..."
                />
              </div>
            )}
          </div>
        </section>

        {/* Pergunta 6 — Múltipla escolha */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{SURVEY_DATA.questions[5].text}</h2>
          <div className={styles.questionList}>
            {DIFFERENTIALS_OPTIONS.map(option => (
              <div key={option.value} className={styles.questionCard}>
                <Checkbox
                  label={option.label}
                  checked={(answers['q6'] as string[])?.includes(option.value) || false}
                  onChange={() => addToMultiple('q6', option.value)}
                />
              </div>
            ))}

            {/* Campo aberto para "Outro" */}
            {(answers['q6'] as string[])?.includes('outro') && (
              <div className={styles.questionCard}>
                <Input
                  label="Especifique o ponto de melhoria"
                  type="text"
                  value={otherText['q6'] || ''}
                  onChange={e => setOtherText(prev => ({ ...prev, q6: e.target.value }))}
                  placeholder="Digite aqui..."
                />
              </div>
            )}
          </div>
        </section>

        {/* Pergunta 7 — Opção única */}
        <section className={styles.section}>
          <div className={styles.questionList}>
            <div className={styles.questionCard}>
              <RadioButton
                name="q7"
                label={SURVEY_DATA.questions[6].text}
                options={YES_NO_OPTIONS}
                value={answers['q7'] as string || ''}
                onChange={val => setAnswer('q7', val)}
              />
            </div>
          </div>
        </section>
      </div>

      {/* CTA */}
      <div className={[styles.ctaWrap, isDesktop ? styles.ctaWrapDesktop : ''].filter(Boolean).join(' ')}>
        <Button
          variant="primary"
          size="lg"
          onClick={handleSubmit}
          disabled={!allAnswered}
        >
          Enviar pesquisa
        </Button>
      </div>
    </div>
  );
}
