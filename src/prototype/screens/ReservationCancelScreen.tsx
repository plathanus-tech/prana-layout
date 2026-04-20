import { CalendarX, Calendar, Sparkles, Footprints } from 'lucide-react';
import { Button } from '../../components/Button/Button';
import { AppHeader } from '../components/AppHeader';
import styles from './ReservationCancelScreen.module.css';

// ─── Demo data ──────────────────────────────────────────

interface ReservationInfo {
  name: string;
  Icon: React.ComponentType<{ size?: number }>;
  dayTime: string;
  status: 'confirmed' | 'waitlist';
}

const DEMO: Record<string, ReservationInfo> = {
  massage: {
    name: 'Quick Massage',
    Icon: Sparkles,
    dayTime: 'seg, 13 de abr · 09:00',
    status: 'confirmed',
  },
  reflexology: {
    name: 'Reflexologia',
    Icon: Footprints,
    dayTime: 'ter, 14 de abr, lista de espera',
    status: 'waitlist',
  },
};

// ─── Componente ─────────────────────────────────────────

interface ReservationCancelScreenProps {
  viewport?:       'mobile' | 'desktop';
  reservationId?:  string;
  onConfirm?:      () => void;
  onBack?:         () => void;
}

export function ReservationCancelScreen({
  viewport      = 'desktop',
  reservationId = 'massage',
  onConfirm,
  onBack,
}: ReservationCancelScreenProps) {
  const isDesktop = viewport === 'desktop';
  const res       = DEMO[reservationId] ?? DEMO.massage;

  return (
    <div className={styles.page}>
      <AppHeader />

      <div className={[styles.content, isDesktop ? styles.contentDesktop : ''].filter(Boolean).join(' ')}>
        <div className={styles.card}>

          {/* Ícone */}
          <div className={styles.iconWrap}>
            <CalendarX size={28} strokeWidth={1.5} />
          </div>

          {/* Texto */}
          <div className={styles.textBlock}>
            <h1 className={styles.title}>Cancelar agendamento?</h1>
            <p className={styles.subtitle}>
              Seu horário será liberado e não poderá ser recuperado.
              <br />
              Se quiser, você pode reagendar a qualquer momento.
            </p>
          </div>

          {/* Resumo do serviço */}
          <div className={styles.summary}>
            <p className={styles.summaryLabel}>Serviço a cancelar</p>
            <div className={styles.summaryRow}>
              <div className={styles.summaryIcon}>
                <res.Icon size={16} />
              </div>
              <div className={styles.summaryInfo}>
                <p className={styles.summaryName}>{res.name}</p>
                <span className={styles.summaryMeta}>
                  <Calendar size={11} />
                  {res.dayTime}
                </span>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className={styles.actions}>
            <Button
              variant="destructive"
              size="md"
              
              onClick={onConfirm}
            >
              Confirmar cancelamento
            </Button>
            <Button
              variant="secondary"
              size="md"
              
              onClick={onBack}
            >
              Manter reserva
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
