import { useState } from 'react';
import { Clock, CheckCircle2, Sparkles, Wind, Footprints, MapPin } from 'lucide-react';
import { Button } from '../../components/Button/Button';
import { Toggle } from '../../components/Toggle/Toggle';
import { AppHeader } from '../components/AppHeader';
import styles from './WalkInSelectionScreen.module.css';

// ─── Demo data ──────────────────────────────────────────

/** Horário fixo definido pelo atendente — não editável pelo beneficiário */
const WALKIN_TIME  = '09:30';
const TODAY_LABEL  = 'Hoje';

interface ServiceConfig {
  id: string;
  name: string;
  duration: number;
  description: string;
  Icon: React.ComponentType<{ size?: number }>;
}

interface EventConfig {
  id: string;
  name: string;
  location: string;
  maxServices: number;
  services: ServiceConfig[];
}

const EVENTS: EventConfig[] = [
  {
    id: 'bem-estar',
    name: 'Programa de Bem-Estar',
    location: 'Sala de Treinamentos - Bloco A',
    maxServices: 2,
    services: [
      { id: 'massage',     name: 'Quick Massage', duration: 15, description: 'Massagem nas costas e pescoço',          Icon: Sparkles   },
      { id: 'reflexology', name: 'Reflexologia',  duration: 20, description: 'Massagem nos pontos de pressão dos pés', Icon: Footprints },
      { id: 'meditation',  name: 'Meditação',     duration: 20, description: 'Sessão de relaxamento e atenção plena',  Icon: Wind       },
    ],
  },
  {
    id: 'day-spa',
    name: 'Day Spa Corporativo',
    location: 'Espaço Prana - Unidade Paulista',
    maxServices: 1,
    services: [
      { id: 'massage-spa', name: 'Quick Massage',       duration: 15, description: 'Massagem nas costas e pescoço', Icon: Sparkles },
      { id: 'med-profunda', name: 'Meditação Profunda', duration: 30, description: 'Sessão guiada de atenção plena', Icon: Wind    },
    ],
  },
];

// ─── Componente ─────────────────────────────────────────

interface WalkInSelectionScreenProps {
  viewport?:  'mobile' | 'desktop';
  onNavigate?: (screen: 'walkin-auth') => void;
}

export function WalkInSelectionScreen({ viewport = 'desktop', onNavigate }: WalkInSelectionScreenProps) {
  const isDesktop = viewport === 'desktop';

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [multiMode, setMultiMode]             = useState(false);
  const [selectedIds, setSelectedIds]         = useState<Set<string>>(new Set());

  const event        = EVENTS.find(e => e.id === selectedEventId) ?? null;
  const effectiveMax = event ? (multiMode ? event.maxServices : 1) : 1;

  // ── Event selection ─────────────────────────────────

  function selectEvent(id: string) {
    if (id === selectedEventId) return;
    setSelectedEventId(id);
    setSelectedIds(new Set());
    setMultiMode(false);
  }

  // ── Service selection ────────────────────────────────

  function toggleService(id: string) {
    const isSelected = selectedIds.has(id);
    if (isSelected) {
      const next = new Set(selectedIds);
      next.delete(id);
      setSelectedIds(next);
    } else {
      if (selectedIds.size >= effectiveMax) return;
      setSelectedIds(multiMode ? new Set([...selectedIds, id]) : new Set([id]));
    }
  }

  function handleMultiToggle(e: React.ChangeEvent<HTMLInputElement>) {
    setMultiMode(e.target.checked);
    setSelectedIds(new Set());
  }

  const canProceed = event !== null && selectedIds.size > 0;

  // ── Render ───────────────────────────────────────────

  return (
    <div className={styles.page}>
      <AppHeader />

      {/* Hero — horário fixo destacado */}
      <div className={styles.hero}>
        <div className={[styles.heroInner, isDesktop ? styles.heroInnerDesktop : ''].filter(Boolean).join(' ')}>
          <span className={styles.heroTag}>{TODAY_LABEL}, {WALKIN_TIME}</span>
          <h1 className={styles.heroTitle}>Encaixe</h1>
        </div>
      </div>

      <div className={[styles.content, isDesktop ? styles.contentDesktop : ''].filter(Boolean).join(' ')}>

        {/* Seleção de evento */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Selecione o evento</h2>
          <div className={styles.eventList}>
            {EVENTS.map(ev => {
              const isActive = selectedEventId === ev.id;
              return (
                <button
                  key={ev.id}
                  className={[styles.eventCard, isActive ? styles.eventCardActive : ''].filter(Boolean).join(' ')}
                  onClick={() => selectEvent(ev.id)}
                >
                  <div className={[styles.eventRadio, isActive ? styles.eventRadioActive : ''].filter(Boolean).join(' ')}>
                    {isActive && <span className={styles.eventRadioDot} />}
                  </div>
                  <div className={styles.eventInfo}>
                    <span className={styles.eventName}>{ev.name}</span>
                    <span className={styles.eventLocation}>
                      <MapPin size={12} />
                      {ev.location}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Seleção de serviço — aparece após selecionar evento */}
        {event && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                {effectiveMax > 1 ? 'Escolha seus serviços' : 'Escolha o serviço'}
              </h2>
              {event.services.length > 1 && event.maxServices > 1 && (
                <div className={styles.protoToggle}>
                  <span className={styles.protoLabel}>🧪</span>
                  <Toggle label="Múltiplos" checked={multiMode} onChange={handleMultiToggle} />
                </div>
              )}
            </div>

            <div className={styles.serviceList}>
              {event.services.map(svc => {
                const isSelected = selectedIds.has(svc.id);
                const isDisabled = !isSelected && selectedIds.size >= effectiveMax;

                return (
                  <div
                    key={svc.id}
                    className={[
                      styles.card,
                      isSelected ? styles.cardSelected : '',
                      isDisabled ? styles.cardDisabled  : '',
                    ].filter(Boolean).join(' ')}
                  >
                    <button
                      className={styles.cardHeader}
                      onClick={() => toggleService(svc.id)}
                      disabled={isDisabled}
                    >
                      <div className={[
                        styles.cardIcon,
                        isSelected ? styles.cardIconSelected : '',
                      ].filter(Boolean).join(' ')}>
                        <svc.Icon size={18} />
                      </div>

                      <div className={styles.cardInfo}>
                        <span className={styles.cardName}>{svc.name}</span>
                        {isSelected ? (
                          <span className={styles.cardComplete}>
                            <CheckCircle2 size={12} />
                            Hoje · {WALKIN_TIME}
                          </span>
                        ) : (
                          <span className={styles.cardMeta}>
                            <Clock size={12} />{svc.duration} min · {svc.description}
                          </span>
                        )}
                      </div>

                      <div
                        className={[styles.selector, isSelected ? styles.selectorSelected : ''].filter(Boolean).join(' ')}
                        onClick={e => { e.stopPropagation(); toggleService(svc.id); }}
                      >
                        {multiMode
                          ? <span className={styles.checkbox}>{isSelected && <span className={styles.checkmark}>✓</span>}</span>
                          : <span className={styles.radio}>{isSelected && <span className={styles.radioDot} />}</span>
                        }
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* CTA fixo */}
      <div className={styles.ctaBar}>
        <div className={[styles.ctaInner, isDesktop ? styles.ctaInnerDesktop : ''].filter(Boolean).join(' ')}>
          <Button
            variant="primary"
            size="lg"
            
            disabled={!canProceed}
            onClick={() => canProceed && onNavigate?.('walkin-auth')}
          >
            Continuar
          </Button>
        </div>
      </div>
    </div>
  );
}
