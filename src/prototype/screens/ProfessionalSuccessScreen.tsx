import { CheckCircle2, Calendar, Clock } from 'lucide-react';
import { Button } from '../../components/Button/Button';
import { AppHeader } from '../components/AppHeader';
import styles from './ProfessionalSuccessScreen.module.css';

// ─── Tipos ──────────────────────────────────────────────────────────────────
export type ProfessionalSuccessVariant = 'confirmed' | 'partial' | 'unavailable';

// ─── Demo data ───────────────────────────────────────────────────────────────

const EVENT_NAME = 'Programa de Bem-Estar';

const ALL_DAYS = [
  { label: 'Qua, 22 de abr · 09:00 – 17:00' },
  { label: 'Qui, 23 de abr · 09:00 – 17:00' },
  { label: 'Sex, 24 de abr · 09:00 – 13:00' },
];

// Dias demo selecionados para o cenário parcial
const PARTIAL_DAYS = [
  { label: 'Qua, 22 de abr' },
  { label: 'Sex, 24 de abr' },
];

// ─── Conteúdo por variante ───────────────────────────────────────────────────

interface VariantContent {
  iconVariant:  'confirmed' | 'partial' | 'unavailable';
  title:        string;
  subtitle:     React.ReactNode;
  summaryLabel: string;
  summaryDays:  { label: string }[];
  showDays:     boolean;
}

function getContent(variant: ProfessionalSuccessVariant): VariantContent {
  switch (variant) {
    case 'confirmed':
      return {
        iconVariant:  'confirmed',
        title:        'Participação confirmada',
        subtitle: (
          <>
            Ótimo! Estamos felizes em contar com você.
            <br />
            Em breve você receberá mais detalhes sobre o evento.
          </>
        ),
        summaryLabel: 'Você confirmou presença nos dias',
        summaryDays:  ALL_DAYS,
        showDays:     true,
      };

    case 'partial':
      return {
        iconVariant:  'partial',
        title:        'Disponibilidade enviada',
        subtitle: (
          <>
            Sua disponibilidade foi registrada.
            <br />
            Se precisarmos complementar a escala, falaremos com você.
          </>
        ),
        summaryLabel: 'Dias informados',
        summaryDays:  PARTIAL_DAYS,
        showDays:     true,
      };

    case 'unavailable':
      return {
        iconVariant:  'unavailable',
        title:        'Resposta registrada',
        subtitle: (
          <>
            Entendemos e agradecemos o seu retorno.
            <br />
            Esperamos contar com você em uma próxima oportunidade.
          </>
        ),
        summaryLabel: 'Evento',
        summaryDays:  [],
        showDays:     false,
      };
  }
}

// ─── Componente ─────────────────────────────────────────────────────────────

interface ProfessionalSuccessScreenProps {
  viewport?: 'mobile' | 'desktop';
  variant?:  ProfessionalSuccessVariant;
}

export function ProfessionalSuccessScreen({
  viewport = 'desktop',
  variant  = 'confirmed',
}: ProfessionalSuccessScreenProps) {
  const isDesktop = viewport === 'desktop';
  const { iconVariant, title, subtitle, summaryLabel, summaryDays, showDays } = getContent(variant);

  return (
    <div className={styles.page}>
      <AppHeader />

      <div className={[styles.content, isDesktop ? styles.contentDesktop : ''].filter(Boolean).join(' ')}>
        <div className={[styles.card, isDesktop ? styles.cardDesktop : ''].filter(Boolean).join(' ')}>

          {/* Ícone */}
          <div className={[
            styles.iconWrap,
            iconVariant === 'confirmed'   ? styles.iconWrapConfirmed   : '',
            iconVariant === 'partial'     ? styles.iconWrapPartial     : '',
            iconVariant === 'unavailable' ? styles.iconWrapUnavailable : '',
          ].filter(Boolean).join(' ')}>
            {iconVariant === 'partial'
              ? <Calendar size={36} strokeWidth={1.5} />
              : <CheckCircle2 size={36} strokeWidth={1.5} />
            }
          </div>

          {/* Texto */}
          <div className={styles.body}>
            <h1 className={styles.title}>{title}</h1>
            <p className={[styles.subtitle, isDesktop ? styles.subtitleDesktop : ''].filter(Boolean).join(' ')}>
              {subtitle}
            </p>
          </div>

          {/* Resumo */}
          <div className={styles.summary}>
            <p className={styles.summaryEventName}>{EVENT_NAME}</p>

            {showDays ? (
              <>
                <p className={styles.summaryLabel}>{summaryLabel}</p>
                <ul className={styles.summaryList}>
                  {summaryDays.map((day, i) => (
                    <li key={i} className={styles.summaryItem}>
                      <Clock size={12} className={styles.summaryIcon} />
                      <span>{day.label}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className={styles.summaryLabel}>Resposta enviada com sucesso</p>
            )}
          </div>

          {/* Botão Adicionar à Agenda — variantes confirmed e partial */}
          {(variant === 'confirmed' || variant === 'partial') && (
            <Button
              variant="secondary"
              size="md"
              iconLeft={<Calendar size={16} />}
            >
              Adicionar à sua agenda
            </Button>
          )}

          {/* Ornamento */}
          <div className={styles.ornament} aria-hidden="true">
            <span className={styles.ornamentLine} />
            <span className={styles.ornamentDot} />
            <span className={styles.ornamentLine} />
          </div>

        </div>
      </div>
    </div>
  );
}
