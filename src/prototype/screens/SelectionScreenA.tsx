import { useState, useRef, useEffect } from 'react';
import { Clock, MapPin, Calendar, CheckCircle2, Sparkles, Scissors, Activity, Wind } from 'lucide-react';
import { Button } from '../../components/Button/Button';
import { Feedback } from '../../components/Feedback/Feedback';
import { Toggle } from '../../components/Toggle/Toggle';
import { AppHeader } from '../components/AppHeader';
import styles from './SelectionScreenA.module.css';

const EVENTS = {
  single: {
    name: 'Semana do Bem-Estar',
    dateStr: '10 a 14 de abril de 2026',
    location: 'Sala de Treinamentos - Bloco A',
    multiService: false,
    maxServices: 1,
  },
  multi: {
    name: 'Day Off Corporativo',
    dateStr: '28 de abril de 2026',
    location: 'Espaço Prana - Unidade Paulista',
    multiService: true,
    maxServices: 2,
  },
};

const SERVICES = [
  { id: 'massage',     name: 'Quick Massage',      duration: 15, description: 'Massagem nas costas e pescoço',             Icon: Sparkles, waitlistOnly: false },
  { id: 'manicure',   name: 'Manicure',            duration: 30, description: 'Cuidado completo para as unhas',            Icon: Scissors, waitlistOnly: false },
  { id: 'reflexology',name: 'Reflexologia Podal',  duration: 20, description: 'Massagem nos pontos de pressão dos pés',    Icon: Activity, waitlistOnly: true  },
  { id: 'meditation', name: 'Meditação Guiada',    duration: 20, description: 'Sessão de relaxamento e atenção plena',     Icon: Wind,     waitlistOnly: false },
];

const DAY_NAMES   = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const MONTH_NAMES = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];

function generateDays() {
  const days: { key: string; dayName: string; dayNum: number; month: string }[] = [];
  const d = new Date(2026, 3, 11);
  while (days.length < 8) {
    if (d.getDay() !== 0 && d.getDay() !== 6) {
      days.push({ key: d.toISOString().slice(0,10), dayName: DAY_NAMES[d.getDay()], dayNum: d.getDate(), month: MONTH_NAMES[d.getMonth()] });
    }
    d.setDate(d.getDate() + 1);
  }
  return days;
}

function generateSlots(serviceId: string, dayKey: string) {
  const base = ['09:00','09:30','10:00','10:30','11:00','11:30','13:00','13:30','14:00','14:30','15:00','15:30'];
  const dayNum = parseInt(dayKey.split('-')[2]);
  const seed = serviceId.charCodeAt(0);
  return base.map((time, i) => ({ time, available: (dayNum + i + seed) % 3 !== 0 }));
}

const DAYS = generateDays();

// ─── Slot utilities ─────────────────────────────────────

type Slot = { time: string; available: boolean };
type ShiftGroup = { label: string; slots: Slot[] };

function groupSlotsByShift(slots: Slot[]): ShiftGroup[] {
  const groups: ShiftGroup[] = [
    { label: 'Manhã', slots: [] },
    { label: 'Tarde', slots: [] },
    { label: 'Noite', slots: [] },
  ];
  for (const slot of slots) {
    const hour = parseInt(slot.time.split(':')[0]);
    if (hour < 12) groups[0].slots.push(slot);
    else if (hour < 18) groups[1].slots.push(slot);
    else groups[2].slots.push(slot);
  }
  return groups.filter(g => g.slots.length > 0);
}

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

type ScheduleChoice = { dayKey: string | null; time: string | null };

interface SelectionScreenAProps { viewport?: 'mobile' | 'desktop'; }

export function SelectionScreenA({ viewport = 'desktop' }: SelectionScreenAProps) {
  const [multiMode, setMultiMode] = useState(false);
  const event = multiMode ? EVENTS.multi : EVENTS.single;
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [schedules, setSchedules]     = useState<Record<string, ScheduleChoice>>({});
  const [timers, setTimers]           = useState<Record<string, number | null>>({});
  const timerRefs = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  useEffect(() => {
    const refs = timerRefs.current;
    return () => { Object.values(refs).forEach(id => clearInterval(id)); };
  }, []);

  function startTimer(serviceId: string) {
    if (timerRefs.current[serviceId]) clearInterval(timerRefs.current[serviceId]);
    setTimers(prev => ({ ...prev, [serviceId]: 300 }));
    let remaining = 300;
    timerRefs.current[serviceId] = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearInterval(timerRefs.current[serviceId]);
        delete timerRefs.current[serviceId];
        setTimers(prev => ({ ...prev, [serviceId]: null }));
        setSchedules(prev => {
          const existing = prev[serviceId];
          if (!existing) return prev;
          return { ...prev, [serviceId]: { ...existing, time: null } };
        });
      } else {
        setTimers(prev => ({ ...prev, [serviceId]: remaining }));
      }
    }, 1000);
  }

  function clearTimer(serviceId: string) {
    if (timerRefs.current[serviceId]) {
      clearInterval(timerRefs.current[serviceId]);
      delete timerRefs.current[serviceId];
    }
    setTimers(prev => ({ ...prev, [serviceId]: null }));
  }

  function toggleService(id: string) {
    const wasSelected = selectedIds.has(id);
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { if (!multiMode) next.clear(); if (next.size < event.maxServices) next.add(id); }
      return next;
    });
    setSchedules(prev => { if (wasSelected) { const { [id]: _, ...rest } = prev; return rest; } return prev; });
    if (wasSelected) clearTimer(id);
  }

  function setDay(serviceId: string, dayKey: string) {
    setSchedules(prev => ({ ...prev, [serviceId]: { dayKey, time: null } }));
    clearTimer(serviceId);
  }
  function setTime(serviceId: string, time: string) {
    setSchedules(prev => ({ ...prev, [serviceId]: { ...(prev[serviceId] ?? { dayKey: null }), time } }));
    startTimer(serviceId);
  }

  const selectedCount = selectedIds.size;
  const canBook = selectedCount > 0 && [...selectedIds].every(id => {
    const svc = SERVICES.find(s => s.id === id)!;
    if (svc.waitlistOnly) return true;
    const sch = schedules[id];
    return sch?.dayKey && sch?.time;
  });

  function handleMultiToggle(e: React.ChangeEvent<HTMLInputElement>) {
    Object.keys(timerRefs.current).forEach(id => clearTimer(id));
    setMultiMode(e.target.checked); setSelectedIds(new Set()); setSchedules({});
  }

  return (
    <div className={styles.page}>
      <AppHeader />
      <div className={styles.content}>
        <div className={styles.protoToggle}>
          <span className={styles.protoLabel}>🧪 Protótipo</span>
          <Toggle label="Múltiplos serviços" checked={multiMode} onChange={handleMultiToggle} />
        </div>

        <div className={styles.eventBanner}>
          <span className={styles.eventTag}>Evento</span>
          <h1 className={styles.eventName}>{event.name}</h1>
          <div className={styles.eventMeta}>
            <span className={styles.eventMetaItem}><Calendar size={14} />{event.dateStr}</span>
            <span className={styles.eventMetaItem}><MapPin size={14} />{event.location}</span>
          </div>
          {event.multiService && <p className={styles.eventHint}>Selecione até {event.maxServices} serviços. Cada um terá seu próprio horário.</p>}
        </div>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{multiMode ? 'Escolha seus serviços' : 'Escolha o serviço'}</h2>
          <div className={styles.serviceList}>
            {SERVICES.map(service => {
              const isSelected = selectedIds.has(service.id);
              const isDisabled = !isSelected && selectedCount >= event.maxServices;
              const sch = schedules[service.id];
              const isComplete = isSelected && (service.waitlistOnly || (sch?.dayKey && sch?.time));
              const selectedDay = DAYS.find(d => d.key === sch?.dayKey);

              return (
                <div key={service.id} className={[styles.card, isSelected ? styles.cardSelected : '', isDisabled ? styles.cardDisabled : ''].filter(Boolean).join(' ')}>
                  <button className={styles.cardHeader} onClick={() => !isDisabled && toggleService(service.id)} disabled={isDisabled}>
                    <div className={[styles.cardIcon, isSelected ? styles.cardIconSelected : ''].filter(Boolean).join(' ')}><service.Icon size={18} /></div>
                    <div className={styles.cardInfo}>
                      <span className={styles.cardName}>{service.name}</span>
                      <span className={styles.cardMeta}><Clock size={12} />{service.duration} min · {service.description}</span>
                      {isComplete && (
                        <span className={styles.cardComplete}>
                          <CheckCircle2 size={12} />
                          {service.waitlistOnly ? 'Na lista de espera' : `${selectedDay?.dayName} ${selectedDay?.dayNum} de ${selectedDay?.month} · ${sch?.time}`}
                        </span>
                      )}
                    </div>
                    <div className={[styles.selector, isSelected ? styles.selectorSelected : ''].filter(Boolean).join(' ')}>
                      {multiMode ? (
                        <span className={styles.checkbox}>{isSelected && <span className={styles.checkmark}>✓</span>}</span>
                      ) : (
                        <span className={styles.radio}>{isSelected && <span className={styles.radioDot} />}</span>
                      )}
                    </div>
                  </button>

                  {isSelected && (
                    <div className={styles.cardBody}>
                      {service.waitlistOnly ? (
                        <div className={styles.waitlist}>
                          <Feedback type="warning" title="Horários esgotados" message="Todos os horários disponíveis para este serviço estão ocupados." />
                          <Button variant="secondary" size="sm">Entrar na lista de espera</Button>
                        </div>
                      ) : (
                        <div className={styles.scheduler}>
                          <div className={styles.pickerSection}>
                            <h4 className={styles.pickerLabel}>Escolha o dia</h4>
                            <div className={styles.dayStrip}>
                              {DAYS.map(day => (
                                <button key={day.key} className={[styles.dayBtn, sch?.dayKey === day.key ? styles.dayBtnActive : ''].filter(Boolean).join(' ')} onClick={() => setDay(service.id, day.key)}>
                                  <span className={styles.dayName}>{day.dayName}</span>
                                  <span className={styles.dayNum}>{day.dayNum}</span>
                                  <span className={styles.dayMonth}>{day.month}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                          {sch?.dayKey && (
                            <div className={styles.pickerSection}>
                              <h4 className={styles.pickerLabel}>Horário disponível</h4>
                              <div className={styles.shiftGroups}>
                                {groupSlotsByShift(generateSlots(service.id, sch.dayKey)).map(shift => (
                                  <div key={shift.label} className={styles.shiftGroup}>
                                    <span className={styles.shiftLabel}>{shift.label}</span>
                                    <div className={styles.timeGrid}>
                                      {shift.slots.map(slot => (
                                        <button key={slot.time} className={[styles.timeBtn, !slot.available ? styles.timeBtnUnavailable : '', sch.time === slot.time ? styles.timeBtnActive : ''].filter(Boolean).join(' ')} disabled={!slot.available} onClick={() => slot.available && setTime(service.id, slot.time)}>
                                          {slot.time}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      {timers[service.id] != null && (
                        <div className={styles.timerBanner}>
                          <Clock size={14} />
                          <span>Você tem {formatTimer(timers[service.id]!)} para agendar</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <div className={styles.ctaBar}>
        <div className={styles.ctaInner}>
          <Button variant="primary" size="lg"  disabled={!canBook}>
            Agendar {selectedCount > 1 ? 'serviços' : 'serviço'}
          </Button>
        </div>
      </div>
    </div>
  );
}
