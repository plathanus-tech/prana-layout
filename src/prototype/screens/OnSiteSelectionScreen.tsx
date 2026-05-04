import { useState } from "react";
import {
  Clock,
  CheckCircle2,
  Sparkles,
  Wind,
  Footprints,
  MapPin,
  type LucideIcon,
} from "lucide-react";
import { Button } from "../../components/Button/Button";
import { Feedback } from "../../components/Feedback/Feedback";
import { Toggle } from "../../components/Toggle/Toggle";
import { AppHeader } from "../components/AppHeader";
import type { SuccessVariant } from "./SuccessScreen";
import styles from "./OnSiteSelectionScreen.module.css";

// ─── Demo data ──────────────────────────────────────────

const TODAY_LABEL = "Segunda-feira, 13 de abril de 2026";

interface ServiceConfig {
  id: string;
  name: string;
  duration: number;
  description: string;
  Icon: LucideIcon;
  globallyExhausted?: boolean;
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
    id: "bem-estar",
    name: "Programa de Bem-Estar",
    location: "Sala de Treinamentos - Bloco A",
    maxServices: 2,
    services: [
      {
        id: "massage",
        name: "Quick Massage",
        duration: 15,
        description: "Massagem nas costas e pescoço",
        Icon: Sparkles,
      },
      {
        id: "reflexology",
        name: "Reflexologia",
        duration: 20,
        description: "Massagem nos pontos de pressão dos pés",
        Icon: Footprints,
      },
      {
        id: "meditation",
        name: "Meditação",
        duration: 20,
        description: "Sessão de relaxamento e atenção plena",
        Icon: Wind,
      },
    ],
  },
  {
    id: "day-spa",
    name: "Day Spa Corporativo",
    location: "Espaço Prana - Unidade Paulista",
    maxServices: 1,
    services: [
      {
        id: "massage-spa",
        name: "Quick Massage",
        duration: 15,
        description: "Massagem nas costas e pescoço",
        Icon: Sparkles,
      },
      {
        id: "med-profunda",
        name: "Meditação Profunda",
        duration: 30,
        description: "Sessão guiada de atenção plena",
        Icon: Wind,
        globallyExhausted: true,
      },
    ],
  },
];

function generateSlots(serviceId: string) {
  const base = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
  ];
  const seed = serviceId.charCodeAt(0);
  return base.map((time, i) => ({
    time,
    available: (13 + i + seed) % 3 !== 0,
  }));
}

// ─── Types ──────────────────────────────────────────────

type ScheduleChoice = { time: string | null; waitlisted: boolean };

interface OnSiteSelectionScreenProps {
  viewport?: "mobile" | "desktop";
  onNavigate?: (screen: "onsite-auth", successVariant: SuccessVariant) => void;
}

// ─── Component ─────────────────────────────────────────

export function OnSiteSelectionScreen({
  viewport = "desktop",
  onNavigate,
}: OnSiteSelectionScreenProps) {
  const isDesktop = viewport === "desktop";

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [multiMode, setMultiMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [schedules, setSchedules] = useState<Record<string, ScheduleChoice>>(
    {},
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const event = EVENTS.find((e) => e.id === selectedEventId) ?? null;
  const effectiveMax = event ? (multiMode ? event.maxServices : 1) : 1;
  const selectedCount = selectedIds.size;

  // ── Event selection ─────────────────────────────────

  function selectEvent(id: string) {
    if (id === selectedEventId) return;
    setSelectedEventId(id);
    setSelectedIds(new Set());
    setSchedules({});
    setExpandedId(null);
    setMultiMode(false);
  }

  // ── Service selection ────────────────────────────────

  function toggleService(id: string) {
    const isSelected = selectedIds.has(id);
    if (isSelected) {
      const next = new Set(selectedIds);
      next.delete(id);
      setSelectedIds(next);
      setSchedules((prev) => {
        const { [id]: _, ...rest } = prev;
        return rest;
      });
      if (expandedId === id) setExpandedId(null);
    } else {
      if (selectedIds.size >= effectiveMax) return;
      const svc = event!.services.find((s) => s.id === id)!;
      setSelectedIds(multiMode ? new Set([...selectedIds, id]) : new Set([id]));
      setSchedules(multiMode ? schedules : {});
      setExpandedId(svc.globallyExhausted ? null : id);
    }
  }

  function setTime(serviceId: string, time: string) {
    setSchedules((prev) => ({
      ...prev,
      [serviceId]: { ...(prev[serviceId] ?? { waitlisted: false }), time },
    }));
  }

  // ── Completion ───────────────────────────────────────

  function isServiceComplete(id: string): boolean {
    const svc = event!.services.find((s) => s.id === id)!;
    if (svc.globallyExhausted) return true;
    return !!schedules[id]?.time;
  }

  const canProceed =
    selectedCount > 0 &&
    event !== null &&
    [...selectedIds].every(isServiceComplete);

  // ── CTA ─────────────────────────────────────────────

  function ctaLabel(): string {
    if (!event || selectedCount === 0) return "Selecione um serviço";
    let hasWaitlist = false,
      hasAvailable = false;
    for (const id of selectedIds) {
      const svc = event.services.find((s) => s.id === id)!;
      if (svc.globallyExhausted) hasWaitlist = true;
      else hasAvailable = true;
    }
    if (hasWaitlist && hasAvailable) return "Confirmar seleção";
    if (hasWaitlist) return "Entrar na lista de espera";
    return selectedCount > 1 ? "Agendar serviços" : "Agendar serviço";
  }

  function handleCTA() {
    if (!canProceed || !event) return;
    let hasWaitlist = false,
      hasAvailable = false;
    for (const id of selectedIds) {
      const svc = event.services.find((s) => s.id === id)!;
      if (svc.globallyExhausted) hasWaitlist = true;
      else hasAvailable = true;
    }
    const variant: SuccessVariant =
      hasWaitlist && hasAvailable
        ? "mixed"
        : hasWaitlist
          ? "waitlist"
          : "confirmed";
    onNavigate?.("onsite-auth", variant);
  }

  function handleMultiToggle(e: React.ChangeEvent<HTMLInputElement>) {
    setMultiMode(e.target.checked);
    setSelectedIds(new Set());
    setSchedules({});
    setExpandedId(null);
  }

  // ── Render ───────────────────────────────────────────

  return (
    <div className={styles.page}>
      <AppHeader />

      {/* Hero — data de hoje */}
      <div className={styles.hero}>
        <div
          className={[
            styles.heroInner,
            isDesktop ? styles.heroInnerDesktop : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <span className={styles.eventTag}>Hoje</span>
          <h1 className={styles.eventName}>{TODAY_LABEL}</h1>
        </div>
      </div>

      <div
        className={[styles.content, isDesktop ? styles.contentDesktop : ""]
          .filter(Boolean)
          .join(" ")}
      >
        {/* Seleção de evento */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Selecione o evento</h2>
          <div className={styles.eventList}>
            {EVENTS.map((ev) => {
              const isActive = selectedEventId === ev.id;
              return (
                <button
                  key={ev.id}
                  className={[
                    styles.eventCard,
                    isActive ? styles.eventCardActive : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => selectEvent(ev.id)}
                >
                  <div
                    className={[
                      styles.eventRadio,
                      isActive ? styles.eventRadioActive : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {isActive && <span className={styles.eventRadioDot} />}
                  </div>
                  <div className={styles.eventInfo}>
                    <span className={styles.eventCardName}>{ev.name}</span>
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

        {/* Serviços — aparecem após selecionar o evento */}
        {event && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                {effectiveMax > 1
                  ? "Escolha seus serviços"
                  : "Escolha o serviço"}
              </h2>
              {event.services.length > 1 && event.maxServices > 1 && (
                <div className={styles.protoToggle}>
                  <span className={styles.protoLabel}>🧪</span>
                  <Toggle
                    label="Múltiplos"
                    checked={multiMode}
                    onChange={handleMultiToggle}
                  />
                </div>
              )}
            </div>

            <div className={styles.serviceList}>
              {event.services.map((svc) => {
                const isSelected = selectedIds.has(svc.id);
                const isExpanded =
                  isSelected &&
                  !svc.globallyExhausted &&
                  (!multiMode || expandedId === svc.id);
                const isCollapsed =
                  isSelected &&
                  multiMode &&
                  (svc.globallyExhausted || expandedId !== svc.id);
                const isDisabled = !isSelected && selectedCount >= effectiveMax;
                const sch = schedules[svc.id];
                const isComplete = isSelected && isServiceComplete(svc.id);

                return (
                  <div
                    key={svc.id}
                    className={[
                      styles.card,
                      isSelected ? styles.cardSelected : "",
                      isCollapsed ? styles.cardCollapsed : "",
                      isDisabled ? styles.cardDisabled : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <button
                      className={styles.cardHeader}
                      onClick={() =>
                        isCollapsed
                          ? setExpandedId(svc.id)
                          : toggleService(svc.id)
                      }
                      disabled={isDisabled}
                    >
                      <div
                        className={[
                          styles.cardIcon,
                          isSelected ? styles.cardIconSelected : "",
                          isSelected && svc.globallyExhausted
                            ? styles.cardIconWaitlist
                            : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        <svc.Icon size={18} />
                      </div>

                      <div className={styles.cardInfo}>
                        <span className={styles.cardName}>{svc.name}</span>
                        {isCollapsed && isComplete ? (
                          <span className={styles.cardSummary}>
                            <CheckCircle2 size={12} />
                            {svc.globallyExhausted
                              ? "Lista de espera"
                              : `Hoje · ${sch?.time}`}
                          </span>
                        ) : (
                          <span className={styles.cardMeta}>
                            <Clock size={12} />
                            {svc.duration} min · {svc.description}
                          </span>
                        )}
                        {isExpanded && isComplete && (
                          <span className={styles.cardComplete}>
                            <CheckCircle2 size={12} />
                            {svc.globallyExhausted
                              ? "Na lista de espera"
                              : `Hoje · ${sch?.time}`}
                          </span>
                        )}
                      </div>

                      <div
                        className={[
                          styles.selector,
                          isSelected ? styles.selectorSelected : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleService(svc.id);
                        }}
                      >
                        {multiMode ? (
                          <span className={styles.checkbox}>
                            {isSelected && (
                              <span className={styles.checkmark}>✓</span>
                            )}
                          </span>
                        ) : (
                          <span className={styles.radio}>
                            {isSelected && <span className={styles.radioDot} />}
                          </span>
                        )}
                      </div>
                    </button>

                    {isSelected && svc.globallyExhausted && (
                      <div className={styles.cardBody}>
                        <Feedback
                          type="warning"
                          title="Horários esgotados"
                          message="Você foi adicionado à lista de espera. Entraremos em contato se uma vaga abrir."
                        />
                      </div>
                    )}

                    {isExpanded && !svc.globallyExhausted && (
                      <div className={styles.cardBody}>
                        <div className={styles.scheduler}>
                          <h3 className={styles.pickerLabel}>
                            Horário disponível
                          </h3>
                          <div className={styles.timeGrid}>
                            {generateSlots(svc.id).map((slot) => (
                              <button
                                key={slot.time}
                                className={[
                                  styles.timeBtn,
                                  !slot.available
                                    ? styles.timeBtnUnavailable
                                    : "",
                                  sch?.time === slot.time
                                    ? styles.timeBtnActive
                                    : "",
                                ]
                                  .filter(Boolean)
                                  .join(" ")}
                                disabled={!slot.available}
                                onClick={() =>
                                  slot.available && setTime(svc.id, slot.time)
                                }
                              >
                                {slot.time}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* CTA */}
      <div className={styles.ctaBar}>
        <div
          className={[styles.ctaInner, isDesktop ? styles.ctaInnerDesktop : ""]
            .filter(Boolean)
            .join(" ")}
        >
          <Button
            variant="primary"
            size="lg"
            disabled={!canProceed}
            onClick={handleCTA}
          >
            {ctaLabel()}
          </Button>
        </div>
      </div>
    </div>
  );
}
