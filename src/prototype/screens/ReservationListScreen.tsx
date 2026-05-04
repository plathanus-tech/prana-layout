import { useState } from 'react';
import { Clock, CheckCircle2, Calendar, Sparkles, Footprints, CalendarX, RefreshCcw, X, type LucideIcon } from 'lucide-react';
import { Button } from '../../components/Button/Button';
import { Dropdown } from '../../components/Dropdown/Dropdown';
import { Feedback } from '../../components/Feedback/Feedback';
import { AppHeader } from '../components/AppHeader';
import type { ScenarioId } from './SelectionScreenE';
import styles from './ReservationListScreen.module.css';

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

interface Reservation {
  id: string;
  name: string;
  Icon: LucideIcon;
  dayTime: string;
  status: 'confirmed' | 'waitlist';
}

const RESERVATIONS: Record<ScenarioId, Reservation[]> = {
  A: [
    { id: 'massage',     name: 'Quick Massage', Icon: Sparkles,   dayTime: 'seg, 13 de abr · 09:00', status: 'confirmed' },
  ],
  B: [
    { id: 'massage',     name: 'Quick Massage', Icon: Sparkles,   dayTime: 'seg, 13 de abr',          status: 'waitlist'  },
  ],
  C: [
    { id: 'massage',     name: 'Quick Massage', Icon: Sparkles,   dayTime: 'seg, 13 de abr · 09:00', status: 'confirmed' },
    { id: 'reflexology', name: 'Reflexologia',  Icon: Footprints, dayTime: 'ter, 14 de abr',          status: 'waitlist'  },
  ],
  D: [
    { id: 'massage',     name: 'Quick Massage', Icon: Sparkles,   dayTime: 'seg, 13 de abr · 09:00', status: 'confirmed' },
    { id: 'reflexology', name: 'Reflexologia',  Icon: Footprints, dayTime: 'ter, 14 de abr',          status: 'waitlist'  },
  ],
};

// ─── Componente ─────────────────────────────────────────

interface ReservationListScreenProps {
  viewport?:     'mobile' | 'desktop';
  scenario?:     ScenarioId;
  onReschedule?: (reservationId: string) => void;
}

export function ReservationListScreen({
  viewport     = 'desktop',
  scenario     = 'C',
  onReschedule,
}: ReservationListScreenProps) {
  const isDesktop   = viewport === 'desktop';
  const reservations = RESERVATIONS[scenario];

  // ── Cancel state ──────────────────────────────────────
  const [cancelTarget, setCancelTarget]     = useState<string | null>(null);
  const [cancelledIds, setCancelledIds]     = useState<Set<string>>(new Set());
  const [cancelFeedback, setCancelFeedback] = useState<string | null>(null);
  const [cancelMotivo, setCancelMotivo]     = useState('');
  const [motivoError, setMotivoError]       = useState<string | null>(null);

  const targetRes = reservations.find(r => r.id === cancelTarget);

  function openCancelModal(id: string) {
    setCancelTarget(id);
    setCancelFeedback(null);
    setCancelMotivo('');
    setMotivoError(null);
  }

  function closeCancelModal() {
    setCancelTarget(null);
    setCancelMotivo('');
    setMotivoError(null);
  }

  function confirmCancel() {
    if (!cancelTarget) return;
    if (!cancelMotivo) {
      setMotivoError('Selecione o motivo do cancelamento');
      return;
    }
    const id = cancelTarget;
    setCancelledIds(prev => new Set([...prev, id]));
    closeCancelModal();
    setCancelFeedback(id);
  }

  // ── Derived lists ─────────────────────────────────────
  const activeList    = reservations.filter(r => !cancelledIds.has(r.id));
  const cancelledList = reservations.filter(r => cancelledIds.has(r.id));

  return (
    <div className={styles.page}>
      <AppHeader />

      {/* Hero — off-white, padrão agendamento */}
      <div className={styles.hero}>
        <div className={[styles.heroInner, isDesktop ? styles.heroInnerDesktop : ''].filter(Boolean).join(' ')}>
          <p className={styles.heroTag}>Semana do Bem-Estar · Plathanus</p>
          <h1 className={styles.heroTitle}>Minhas reservas</h1>
        </div>
      </div>

      {/* Content */}
      <div className={[styles.content, isDesktop ? styles.contentDesktop : ''].filter(Boolean).join(' ')}>

        {/* Feedback de cancelamento */}
        {cancelFeedback && (
          <Feedback
            type="success"
            title="Reserva cancelada"
            message="Seu horário foi liberado com sucesso."
          />
        )}

        {/* Agendamentos ativos */}
        {activeList.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              {activeList.length === 1 ? 'Seu agendamento' : 'Seus agendamentos'}
            </h2>
            <ul className={styles.list}>
              {activeList.map(res => (
                <li key={res.id} className={styles.card}>
                  <div className={styles.cardTop}>
                    <div className={[
                      styles.cardIcon,
                      res.status === 'confirmed' ? styles.cardIconConfirmed : styles.cardIconWaitlist,
                    ].join(' ')}>
                      <res.Icon size={18} />
                    </div>
                    <div className={styles.cardInfo}>
                      <span className={styles.cardName}>{res.name}</span>
                      <span className={styles.cardMeta}>
                        <Calendar size={12} />
                        {res.dayTime}
                      </span>
                    </div>
                    <span className={[
                      styles.badge,
                      res.status === 'confirmed' ? styles.badgeConfirmed : styles.badgeWaitlist,
                    ].join(' ')}>
                      {res.status === 'confirmed'
                        ? <><CheckCircle2 size={11} /> Confirmado</>
                        : <><Clock size={11} /> Lista de espera</>
                      }
                    </span>
                  </div>
                  <div className={styles.cardActions}>
                    <Button
                      variant="secondary"
                      size="sm"
                      iconLeft={<RefreshCcw size={14} />}
                      onClick={() => onReschedule?.(res.id)}
                      style={{ flex: 1 }}
                    >
                      Reagendar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      iconLeft={<CalendarX size={14} />}
                      onClick={() => openCancelModal(res.id)}
                      style={{ flex: 1 }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Serviços cancelados */}
        {cancelledList.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Serviços cancelados</h2>
            <ul className={styles.list}>
              {cancelledList.map(res => (
                <li key={res.id} className={[styles.card, styles.cardCancelled].join(' ')}>
                  <div className={styles.cardTop}>
                    <div className={[styles.cardIcon, styles.cardIconCancelled].join(' ')}>
                      <res.Icon size={18} />
                    </div>
                    <div className={styles.cardInfo}>
                      <span className={styles.cardName}>{res.name}</span>
                      <span className={styles.cardMeta}>
                        <Calendar size={12} />
                        {res.dayTime}
                      </span>
                    </div>
                    <span className={[styles.badge, styles.badgeCancelled].join(' ')}>
                      <CalendarX size={11} /> Cancelado
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* Modal de confirmação de cancelamento */}
      {cancelTarget && targetRes && (
        <div className={styles.modalOverlay} onClick={closeCancelModal}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>

            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Cancelar agendamento?</h2>
              <button className={styles.modalClose} onClick={closeCancelModal} aria-label="Fechar">
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <p className={styles.modalSubtitle}>
                Seu horário será liberado e não poderá ser recuperado.
              </p>

              {/* Resumo do serviço */}
              <div className={styles.modalSummary}>
                <div className={styles.modalSummaryIcon}>
                  <targetRes.Icon size={16} />
                </div>
                <div className={styles.modalSummaryInfo}>
                  <span className={styles.modalSummaryName}>{targetRes.name}</span>
                  <span className={styles.modalSummaryMeta}>
                    <Calendar size={11} />
                    {targetRes.dayTime}
                  </span>
                </div>
              </div>

              {/* Motivo do cancelamento */}
              <Dropdown
                label="Motivo do cancelamento"
                options={CANCEL_REASONS}
                value={cancelMotivo}
                onChange={(val) => { setCancelMotivo(val); setMotivoError(null); }}
                placeholder="Selecione o motivo..."
                error={motivoError ?? undefined}
              />
            </div>

            <div className={styles.modalFooter}>
              <Button
                variant="destructive"
                size="md"
                style={{ flex: 1 }}
                onClick={confirmCancel}
              >
                Confirmar cancelamento
              </Button>
              <Button
                variant="secondary"
                size="md"
                style={{ flex: 1 }}
                onClick={closeCancelModal}
              >
                Manter reserva
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
