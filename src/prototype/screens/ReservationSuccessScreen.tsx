import { CheckCircle2, Clock, CalendarX, Sparkles, Footprints } from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
import styles from './ReservationSuccessScreen.module.css';

// ─── Tipos ──────────────────────────────────────────────

export type ReservationSuccessVariant =
  | 'cancelled'
  | 'rescheduled'
  | 'rescheduled-waitlist';

// ─── Demo data ──────────────────────────────────────────

interface ReservationInfo {
  name: string;
  Icon: React.ComponentType<{ size?: number }>;
  dayTime: string;
}

const DEMO: Record<string, ReservationInfo> = {
  massage: {
    name: 'Quick Massage',
    Icon: Sparkles,
    dayTime: 'seg, 13 de abr · 09:00',
  },
  reflexology: {
    name: 'Reflexologia',
    Icon: Footprints,
    dayTime: 'ter, 14 de abr',
  },
};

// ─── Conteúdo por variante ──────────────────────────────

interface VariantContent {
  WrapIcon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  iconStyle: 'brand' | 'neutral' | 'waitlist';
  title: string;
  subtitle: React.ReactNode;
  summaryLabel: string;
}

function getContent(variant: ReservationSuccessVariant): VariantContent {
  switch (variant) {
    case 'cancelled':
      return {
        WrapIcon: CalendarX,
        iconStyle: 'neutral',
        title: 'Reserva cancelada',
        subtitle: (
          <>
            Seu horário foi cancelado com sucesso.
            <br />
            Esperamos ter a oportunidade de cuidar de você em uma próxima vez.
          </>
        ),
        summaryLabel: 'Serviço cancelado',
      };

    case 'rescheduled':
      return {
        WrapIcon: CheckCircle2,
        iconStyle: 'brand',
        title: 'Reagendamento confirmado',
        subtitle: (
          <>
            Seu novo horário está reservado.
            <br />
            Que este tempo seja um convite para pausar e cuidar de você.
          </>
        ),
        summaryLabel: 'Novo horário',
      };

    case 'rescheduled-waitlist':
      return {
        WrapIcon: Clock,
        iconStyle: 'waitlist',
        title: 'Você está na lista de espera',
        subtitle: (
          <>
            O horário escolhido está esgotado no momento.
            <br />
            Assim que surgir disponibilidade, você será avisado.
          </>
        ),
        summaryLabel: 'Novo horário solicitado',
      };
  }
}

// ─── Componente ─────────────────────────────────────────

interface ReservationSuccessScreenProps {
  viewport?:       'mobile' | 'desktop';
  variant?:        ReservationSuccessVariant;
  reservationId?:  string;
  /** Novo horário confirmado ou solicitado (reagendamento) */
  newDayTime?:     string;
}

export function ReservationSuccessScreen({
  viewport      = 'desktop',
  variant       = 'rescheduled',
  reservationId = 'massage',
  newDayTime,
}: ReservationSuccessScreenProps) {
  const isDesktop = viewport === 'desktop';
  const res       = DEMO[reservationId] ?? DEMO.massage;
  const { WrapIcon, iconStyle, title, subtitle, summaryLabel } = getContent(variant);

  // Para reagendamento, mostra novo horário; para cancelamento, mostra horário original
  const displayTime = variant === 'cancelled'
    ? res.dayTime
    : variant === 'rescheduled-waitlist'
      ? newDayTime ?? 'qua, 15 de abr'
      : newDayTime ?? 'qua, 15 de abr · 10:00';

  const iconWrapClass = [
    styles.iconWrap,
    iconStyle === 'neutral'  ? styles.iconWrapNeutral  : '',
    iconStyle === 'waitlist' ? styles.iconWrapWaitlist : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={styles.page}>
      <AppHeader />

      <div className={[styles.content, isDesktop ? styles.contentDesktop : ''].filter(Boolean).join(' ')}>
        <div className={[styles.card, isDesktop ? styles.cardDesktop : ''].filter(Boolean).join(' ')}>

          {/* Ícone */}
          <div className={iconWrapClass}>
            <WrapIcon size={36} strokeWidth={1.5} />
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
            <p className={styles.summaryLabel}>{summaryLabel}</p>
            <ul className={styles.summaryList}>
              <li className={styles.summaryItem}>
                {variant === 'rescheduled-waitlist' ? (
                  <>
                    <Clock size={14} className={styles.summaryIconWaitlist} />
                    <span>{res.name}, <em>lista de espera · {displayTime}</em></span>
                  </>
                ) : variant === 'cancelled' ? (
                  <>
                    <CalendarX size={14} className={styles.summaryIconNeutral} />
                    <span>{res.name}, <strong>{displayTime}</strong></span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} className={styles.summaryIconConfirmed} />
                    <span>{res.name}, <strong>{displayTime}</strong></span>
                  </>
                )}
              </li>
            </ul>
          </div>

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
