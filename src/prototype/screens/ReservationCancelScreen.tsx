import { useState } from 'react';
import { CalendarX, Calendar, Sparkles, Footprints, type LucideIcon } from 'lucide-react';
import { Button } from '../../components/Button/Button';
import { Dropdown } from '../../components/Dropdown/Dropdown';
import { AppHeader } from '../components/AppHeader';
import styles from './ReservationCancelScreen.module.css';

// ─── Motivos de cancelamento ────────────────────────────

const CANCEL_REASONS = [
  { value: 'horario',    label: 'Não posso mais neste horário' },
  { value: 'trabalho',   label: 'Compromisso de trabalho'      },
  { value: 'imprevisto', label: 'Imprevisto pessoal'           },
  { value: 'saude',      label: 'Motivo de saúde'              },
  { value: 'interesse',  label: 'Não tenho mais interesse'     },
  { value: 'outro-svc',  label: 'Prefiro outro serviço'        },
  { value: 'outros',     label: 'Outros'                       },
];

// ─── Demo data ──────────────────────────────────────────

interface ReservationInfo {
  name: string;
  Icon: LucideIcon;
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

  const [motivo, setMotivo]           = useState('');
  const [motivoError, setMotivoError] = useState<string | null>(null);

  function handleConfirm() {
    if (!motivo) {
      setMotivoError('Selecione o motivo do cancelamento');
      return;
    }
    onConfirm?.();
  }

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

          {/* Motivo do cancelamento */}
          <div className={styles.reasonField}>
            <Dropdown
              label="Motivo do cancelamento"
              options={CANCEL_REASONS}
              value={motivo}
              onChange={(val) => { setMotivo(val); setMotivoError(null); }}
              placeholder="Selecione o motivo..."
              error={motivoError ?? undefined}
            />
          </div>

          {/* Ações */}
          <div className={styles.actions}>
            <Button
              variant="destructive"
              size="md"

              onClick={handleConfirm}
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
