import { useState, useRef, useEffect } from 'react';
import { Calendar, Sparkles, Footprints, Clock } from 'lucide-react';
import { Button } from '../../components/Button/Button';
import { Feedback } from '../../components/Feedback/Feedback';
import { AppHeader } from '../components/AppHeader';
import type { ReservationSuccessVariant } from './ReservationSuccessScreen';
import styles from './ReservationRescheduleScreen.module.css';

// ─── Demo data ──────────────────────────────────────────

interface ReservationInfo {
  name: string;
  Icon: React.ComponentType<{ size?: number }>;
  dayTime: string;
  /** Dias com todos os horários esgotados → lista de espera */
  exhaustedDayKeys?: string[];
}

const DAY_NAMES   = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const MONTH_NAMES = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];

function generateDays(count = 8) {
  const days: { key: string; dayName: string; dayNum: number; month: string }[] = [];
  const d = new Date(2026, 3, 11);
  while (days.length < count) {
    if (d.getDay() !== 0 && d.getDay() !== 6) {
      days.push({
        key:     d.toISOString().slice(0, 10),
        dayName: DAY_NAMES[d.getDay()],
        dayNum:  d.getDate(),
        month:   MONTH_NAMES[d.getMonth()],
      });
    }
    d.setDate(d.getDate() + 1);
  }
  return days;
}

const DAYS = generateDays(8);

function generateSlots(serviceId: string, dayKey: string) {
  const base = ['09:00','09:30','10:00','10:30','11:00','11:30','13:00','13:30','14:00','14:30','15:00','15:30'];
  const dayNum = parseInt(dayKey.split('-')[2]);
  const seed   = serviceId.charCodeAt(0);
  return base.map((time, i) => ({ time, available: (dayNum + i + seed) % 3 !== 0 }));
}

function formatDayLabel(dayKey: string) {
  const d = DAYS.find(x => x.key === dayKey);
  return d ? `${d.dayName} ${d.dayNum} de ${d.month}` : dayKey;
}

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const DEMO: Record<string, ReservationInfo> = {
  massage: {
    name:             'Quick Massage',
    Icon:             Sparkles,
    dayTime:          'seg, 13 de abr · 09:00',
    exhaustedDayKeys: [DAYS[1].key, DAYS[3].key],
  },
  reflexology: {
    name:    'Reflexologia',
    Icon:    Footprints,
    dayTime: 'ter, 14 de abr, lista de espera',
  },
};

// ─── Componente ─────────────────────────────────────────

interface ReservationRescheduleScreenProps {
  viewport?:      'mobile' | 'desktop';
  reservationId?: string;
  onNavigate?:    (variant: ReservationSuccessVariant, newDayTime?: string) => void;
}

export function ReservationRescheduleScreen({
  viewport      = 'desktop',
  reservationId = 'massage',
  onNavigate,
}: ReservationRescheduleScreenProps) {
  const isDesktop = viewport === 'desktop';
  const res       = DEMO[reservationId] ?? DEMO.massage;

  // ── Estado de seleção ────────────────────────────────
  const [selectedDay,  setSelectedDay]  = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isWaitlisted, setIsWaitlisted] = useState(false);

  // ── Timer (5 min) ────────────────────────────────────
  const [timerValue, setTimerValue] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  function startTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerValue(300);
    let remaining = 300;
    timerRef.current = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearInterval(timerRef.current!);
        timerRef.current = null;
        setTimerValue(null);
        setSelectedDay(null);
        setSelectedTime(null);
        setIsWaitlisted(false);
      } else {
        setTimerValue(remaining);
      }
    }, 1000);
  }

  function clearTimerState() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setTimerValue(null);
  }

  // ── Handlers ─────────────────────────────────────────
  function handleDaySelect(dayKey: string) {
    const exhausted = (res.exhaustedDayKeys ?? []).includes(dayKey);
    setSelectedDay(dayKey);
    setSelectedTime(null);
    setIsWaitlisted(exhausted);
    clearTimerState();
  }

  function handleTimeSelect(time: string) {
    setSelectedTime(time);
    startTimer();
  }

  // ── Validação ─────────────────────────────────────────
  const canProceed = selectedDay !== null && (isWaitlisted || selectedTime !== null);

  function ctaLabel() {
    if (!selectedDay)    return 'Escolha um dia';
    if (isWaitlisted)    return 'Entrar na lista de espera';
    if (!selectedTime)   return 'Escolha um horário';
    return 'Confirmar reagendamento';
  }

  function handleConfirm() {
    if (!canProceed) return;
    clearTimerState();
    if (isWaitlisted) {
      onNavigate?.('rescheduled-waitlist', selectedDay ? formatDayLabel(selectedDay) : undefined);
    } else {
      const dayLabel = selectedDay ? formatDayLabel(selectedDay) : '';
      onNavigate?.('rescheduled', `${dayLabel} · ${selectedTime}`);
    }
  }

  // ── Render ────────────────────────────────────────────
  return (
    <div className={styles.page}>
      <AppHeader />

      {/* Hero */}
      <div className={styles.hero}>
        <div className={[styles.heroInner, isDesktop ? styles.heroInnerDesktop : ''].filter(Boolean).join(' ')}>
          <span className={styles.heroTag}>Reagendamento</span>
          <h1 className={styles.heroTitle}>{res.name}</h1>
        </div>
      </div>

      <div className={[styles.content, isDesktop ? styles.contentDesktop : ''].filter(Boolean).join(' ')}>

        {/* ─── Card unificado: horário atual + novo horário ─── */}
        <div className={styles.scheduleCard}>

          {/* Horário atual */}
          <div className={styles.currentBooking}>
            <div className={styles.currentBookingIcon}>
              <res.Icon size={16} />
            </div>
            <div className={styles.currentBookingInfo}>
              <span className={styles.currentBookingLabel}>Horário atual</span>
              <span className={styles.currentBookingName}>{res.name}</span>
              <span className={styles.currentBookingMeta}>
                <Calendar size={11} />
                {res.dayTime}
              </span>
            </div>
          </div>

          <div className={styles.cardDivider} />

          {/* Seleção de novo horário */}
          <div className={styles.cardBody}>

            {/* Escolha de dia */}
            <div className={styles.pickerSection}>
              <h4 className={styles.pickerLabel}>Escolha o novo dia</h4>
              <div className={styles.dayStrip}>
                {DAYS.map(day => {
                  const isExhausted   = (res.exhaustedDayKeys ?? []).includes(day.key);
                  const isActive      = selectedDay === day.key;
                  const isWaitlisting = isActive && isWaitlisted;

                  return (
                    <button
                      key={day.key}
                      className={[
                        styles.dayBtn,
                        isExhausted && !isActive  ? styles.dayBtnExhausted   : '',
                        isActive && !isWaitlisting ? styles.dayBtnActive      : '',
                        isWaitlisting              ? styles.dayBtnWaitlisted  : '',
                      ].filter(Boolean).join(' ')}
                      onClick={() => handleDaySelect(day.key)}
                    >
                      <span className={styles.dayName}>{day.dayName}</span>
                      <span className={styles.dayNum}>{day.dayNum}</span>
                      <span className={styles.dayMonth}>{day.month}</span>
                      {isExhausted && (
                        <span className={styles.dayExhaustedTag}>Esgotado</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Horários ou feedback de lista de espera */}
            {selectedDay && (
              isWaitlisted ? (
                <Feedback
                  type="warning"
                  title="Lista de espera"
                  message={`Você será notificado caso abra uma vaga para ${formatDayLabel(selectedDay)}.`}
                />
              ) : (
                <div className={styles.pickerSection}>
                  <h4 className={styles.pickerLabel}>Escolha o novo horário</h4>
                  <div className={styles.timeGrid}>
                    {generateSlots(reservationId, selectedDay).map(slot => (
                      <button
                        key={slot.time}
                        className={[
                          styles.timeBtn,
                          !slot.available            ? styles.timeBtnUnavailable : '',
                          selectedTime === slot.time ? styles.timeBtnActive      : '',
                        ].filter(Boolean).join(' ')}
                        disabled={!slot.available}
                        onClick={() => slot.available && handleTimeSelect(slot.time)}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>
              )
            )}

            {/* Cronômetro — aparece ao selecionar um horário */}
            {timerValue !== null && (
              <div className={styles.timerBanner}>
                <Clock size={14} />
                <span>Você tem {formatTimer(timerValue)} para confirmar seu novo horário</span>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* CTA fixo */}
      <div className={styles.ctaBar}>
        <div className={[styles.ctaInner, isDesktop ? styles.ctaInnerDesktop : ''].filter(Boolean).join(' ')}>
          <Button
            variant="primary"
            size="lg"
            disabled={!canProceed}
            onClick={handleConfirm}
          >
            {ctaLabel()}
          </Button>
        </div>
      </div>
    </div>
  );
}
