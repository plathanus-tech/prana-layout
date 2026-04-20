import { useState } from 'react';
import { Clock, MapPin, Calendar, CheckCircle2, Sparkles, Wind, Footprints } from 'lucide-react';
import { Button } from '../../components/Button/Button';
import { Feedback } from '../../components/Feedback/Feedback';
import { Toggle } from '../../components/Toggle/Toggle';
import { AppHeader } from '../components/AppHeader';
import styles from './SelectionScreenD.module.css';

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
  { id: 'massage',     name: 'Quick Massage',   duration: 15, description: 'Massagem nas costas e pescoço',          Icon: Sparkles,   waitlistOnly: false },
  { id: 'reflexology', name: 'Reflexologia',    duration: 20, description: 'Massagem nos pontos de pressão dos pés', Icon: Footprints, waitlistOnly: true  },
  { id: 'meditation',  name: 'Meditação',       duration: 20, description: 'Sessão de relaxamento e atenção plena',  Icon: Wind,       waitlistOnly: false },
];

const DAY_NAMES   = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const MONTH_NAMES = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];

function generateDays() {
  const days: { key: string; dayName: string; dayNum: number; month: string }[] = [];
  const d = new Date(2026, 3, 11);
  while (days.length < 8) {
    if (d.getDay() !== 0 && d.getDay() !== 6) {
      days.push({
        key: d.toISOString().slice(0, 10),
        dayName: DAY_NAMES[d.getDay()],
        dayNum: d.getDate(),
        month: MONTH_NAMES[d.getMonth()],
      });
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
type ScheduleChoice = { dayKey: string | null; time: string | null };

interface SelectionScreenDProps { viewport?: 'mobile' | 'desktop'; }

export function SelectionScreenD({ viewport = 'desktop' }: SelectionScreenDProps) {
  const [multiMode, setMultiMode]     = useState(false);
  const event                          = multiMode ? EVENTS.multi : EVENTS.single;
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [schedules, setSchedules]     = useState<Record<string, ScheduleChoice>>({});
  // Qual serviço está com o scheduler expandido (apenas um por vez)
  const [expandedId, setExpandedId]   = useState<string | null>(null);

  function toggleService(id: string) {
    const isSelected = selectedIds.has(id);

    if (isSelected) {
      // Desselecionar
      const next = new Set(selectedIds);
      next.delete(id);
      setSelectedIds(next);
      setSchedules(prev => { const { [id]: _, ...rest } = prev; return rest; });
      if (expandedId === id) setExpandedId(null);
    } else {
      // Selecionar
      if (selectedIds.size >= event.maxServices) return;
      if (!multiMode) {
        setSelectedIds(new Set([id]));
        setSchedules({});
      } else {
        setSelectedIds(prev => new Set([...prev, id]));
      }
      setExpandedId(id); // O recém-selecionado abre; os outros colapsam
    }
  }

  function reExpand(id: string) {
    // Clicar num card selecionado+colapsado re-expande
    setExpandedId(id);
  }

  function setDay(serviceId: string, dayKey: string) {
    setSchedules(prev => ({ ...prev, [serviceId]: { dayKey, time: null } }));
  }
  function setTime(serviceId: string, time: string) {
    setSchedules(prev => ({ ...prev, [serviceId]: { ...(prev[serviceId] ?? { dayKey: null }), time } }));
  }

  const selectedCount = selectedIds.size;
  const canBook = selectedCount > 0 && [...selectedIds].every(id => {
    const svc = SERVICES.find(s => s.id === id)!;
    if (svc.waitlistOnly) return true;
    const sch = schedules[id];
    return sch?.dayKey && sch?.time;
  });

  function handleMultiToggle(e: React.ChangeEvent<HTMLInputElement>) {
    setMultiMode(e.target.checked);
    setSelectedIds(new Set());
    setSchedules({});
    setExpandedId(null);
  }

  return (
    <div className={styles.page}>
      <AppHeader />

      {/* Hero do evento — estilo editorial/agenda */}
      <div className={styles.eventHero}>
        <div className={styles.eventHeroInner}>
          <span className={styles.eventTag}>• Agendamento</span>
          <h1 className={styles.eventName}>{event.name}</h1>
          <div className={styles.eventMeta}>
            <span className={styles.eventMetaItem}><Calendar size={14} className={styles.metaIcon} />{event.dateStr}</span>
            <span className={styles.eventMetaSep}>·</span>
            <span className={styles.eventMetaItem}><MapPin size={14} className={styles.metaIcon} />{event.location}</span>
          </div>
          {event.multiService && (
            <p className={styles.eventHint}>Selecione até {event.maxServices} serviços — cada um com seu próprio horário.</p>
          )}
        </div>
      </div>

      <div className={styles.content}>
        {/* Toggle de protótipo */}
        <div className={styles.protoToggle}>
          <span className={styles.protoLabel}>🧪 Protótipo</span>
          <Toggle label="Múltiplos serviços" checked={multiMode} onChange={handleMultiToggle} />
        </div>

        {/* Lista de serviços */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{multiMode ? 'Escolha seus serviços' : 'Escolha o serviço'}</h2>

          <div className={styles.serviceList}>
            {SERVICES.map(service => {
              const isSelected  = selectedIds.has(service.id);
              const isExpanded  = isSelected && (!multiMode || expandedId === service.id);
              const isCollapsed = isSelected && multiMode && expandedId !== service.id;
              const isDisabled  = !isSelected && selectedCount >= event.maxServices;
              const sch         = schedules[service.id];
              const isComplete  = isSelected && (service.waitlistOnly || (sch?.dayKey && sch?.time));
              const selectedDay = DAYS.find(d => d.key === sch?.dayKey);

              return (
                <div
                  key={service.id}
                  className={[
                    styles.card,
                    isSelected  ? styles.cardSelected  : '',
                    isCollapsed ? styles.cardCollapsed  : '',
                    isDisabled  ? styles.cardDisabled   : '',
                  ].filter(Boolean).join(' ')}
                >
                  {/* Header: clicável para (des)selecionar ou re-expandir */}
                  <button
                    className={styles.cardHeader}
                    onClick={() => isCollapsed ? reExpand(service.id) : toggleService(service.id)}
                    disabled={isDisabled}
                  >
                    <div className={[styles.cardIcon, isSelected ? styles.cardIconSelected : ''].filter(Boolean).join(' ')}>
                      <service.Icon size={18} />
                    </div>

                    <div className={styles.cardInfo}>
                      <span className={styles.cardName}>{service.name}</span>

                      {/* No modo colapsado: mostra o resumo do agendamento */}
                      {isCollapsed && isComplete && !service.waitlistOnly ? (
                        <span className={styles.cardSummary}>
                          <CheckCircle2 size={12} />
                          {selectedDay?.dayName} {selectedDay?.dayNum} de {selectedDay?.month} · {sch?.time}
                        </span>
                      ) : isCollapsed && service.waitlistOnly ? (
                        <span className={styles.cardSummary}>
                          <CheckCircle2 size={12} />Na lista de espera
                        </span>
                      ) : (
                        <span className={styles.cardMeta}><Clock size={12} />{service.duration} min · {service.description}</span>
                      )}

                      {isExpanded && isComplete && (
                        <span className={styles.cardComplete}>
                          <CheckCircle2 size={12} />
                          {service.waitlistOnly
                            ? 'Na lista de espera'
                            : `${selectedDay?.dayName} ${selectedDay?.dayNum} de ${selectedDay?.month} · ${sch?.time}`}
                        </span>
                      )}
                    </div>

                    {/* Checkbox ou radio */}
                    <div
                      className={[styles.selector, isSelected ? styles.selectorSelected : ''].filter(Boolean).join(' ')}
                      onClick={e => { e.stopPropagation(); toggleService(service.id); }}
                    >
                      {multiMode ? (
                        <span className={styles.checkbox}>{isSelected && <span className={styles.checkmark}>✓</span>}</span>
                      ) : (
                        <span className={styles.radio}>{isSelected && <span className={styles.radioDot} />}</span>
                      )}
                    </div>
                  </button>

                  {/* Body: só aparece quando expandido */}
                  {isExpanded && (
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
                                <button
                                  key={day.key}
                                  className={[styles.dayBtn, sch?.dayKey === day.key ? styles.dayBtnActive : ''].filter(Boolean).join(' ')}
                                  onClick={() => setDay(service.id, day.key)}
                                >
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
                              <div className={styles.timeGrid}>
                                {generateSlots(service.id, sch.dayKey).map(slot => (
                                  <button
                                    key={slot.time}
                                    className={[
                                      styles.timeBtn,
                                      !slot.available        ? styles.timeBtnUnavailable : '',
                                      sch.time === slot.time ? styles.timeBtnActive       : '',
                                    ].filter(Boolean).join(' ')}
                                    disabled={!slot.available}
                                    onClick={() => slot.available && setTime(service.id, slot.time)}
                                  >
                                    {slot.time}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <Feedback
          type="info"
          title="Instruções para Agendamento"
          message="Por gentileza chegar com pelo menos 3 minutos de antecedência ao local dos atendimentos."
        />
      </div>

      {/* CTA fixo */}
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
