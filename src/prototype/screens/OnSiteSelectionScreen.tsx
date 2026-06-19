import { useState } from "react";
import {
  Clock,
  CheckCircle2,
  Sparkles,
  Wind,
  Footprints,
  MapPin,
  Calendar,
  ChevronRight,
  ChevronLeft,
  type LucideIcon,
} from "lucide-react";
import { Button } from "../../components/Button/Button";
import { Dropdown } from "../../components/Dropdown/Dropdown";
import { Feedback } from "../../components/Feedback/Feedback";
import { Toggle } from "../../components/Toggle/Toggle";
import { AppHeader } from "../components/AppHeader";
import type { SuccessVariant } from "./SuccessScreen";
import styles from "./OnSiteSelectionScreen.module.css";

// ─── Demo data ──────────────────────────────────────────

interface ProfessionalConfig {
  id: string;
  name: string;
  specialty: string;
  initials: string;
  globallyExhausted?: boolean;
}

interface ServiceConfig {
  id: string;
  name: string;
  duration: number;
  description: string;
  Icon: LucideIcon;
  globallyExhausted?: boolean;
  professionals?: ProfessionalConfig[];
}

interface EventConfig {
  id: string;
  name: string;
  location: string;
  estado: string;
  cidade: string;
  date: string;
  dateLabel: string;
  maxServices: number;
  services: ServiceConfig[];
}

const EVENTS: EventConfig[] = [
  {
    id: "bem-estar",
    name: "Programa de Bem-Estar",
    location: "Sala de Treinamentos - Bloco A",
    estado: "SP",
    cidade: "São Paulo",
    date: "2026-04-13",
    dateLabel: "Seg, 13 abr",
    maxServices: 2,
    services: [
      {
        id: "massage",
        name: "Quick Massage",
        duration: 15,
        description: "Massagem nas costas e pescoço",
        Icon: Sparkles,
        professionals: [
          { id: "juliana", name: "Juliana Braga", specialty: "Terapeuta", initials: "JB" },
          { id: "ana",     name: "Ana Costa",     specialty: "Terapeuta", initials: "AC" },
        ],
      },
      {
        id: "reflexology",
        name: "Reflexologia",
        duration: 20,
        description: "Massagem nos pontos de pressão dos pés",
        Icon: Footprints,
        professionals: [
          { id: "carlos",  name: "Carlos Lima",    specialty: "Terapeuta", initials: "CL" },
          { id: "beatriz", name: "Beatriz Santos", specialty: "Terapeuta", initials: "BS" },
        ],
      },
      {
        id: "meditation",
        name: "Meditação",
        duration: 20,
        description: "Sessão de relaxamento e atenção plena",
        Icon: Wind,
        professionals: [
          { id: "rafael", name: "Rafael Alves", specialty: "Instrutor", initials: "RA" },
        ],
      },
    ],
  },
  {
    id: "day-spa",
    name: "Day Spa Corporativo",
    location: "Espaço Prana - Unidade Paulista",
    estado: "SP",
    cidade: "São Paulo",
    date: "2026-04-14",
    dateLabel: "Ter, 14 abr",
    maxServices: 1,
    services: [
      {
        id: "massage-spa",
        name: "Quick Massage",
        duration: 15,
        description: "Massagem nas costas e pescoço",
        Icon: Sparkles,
        professionals: [
          { id: "juliana", name: "Juliana Braga", specialty: "Terapeuta", initials: "JB" },
          { id: "ana",     name: "Ana Costa",     specialty: "Terapeuta", initials: "AC" },
        ],
      },
      {
        id: "med-profunda",
        name: "Meditação Profunda",
        duration: 30,
        description: "Sessão guiada de atenção plena",
        Icon: Wind,
        globallyExhausted: true,
        professionals: [
          { id: "rafael", name: "Rafael Alves", specialty: "Instrutor", initials: "RA", globallyExhausted: true },
        ],
      },
    ],
  },
  {
    id: "bem-estar-rj",
    name: "Semana do Bem-Estar",
    location: "Espaço Prana - Unidade Centro",
    estado: "RJ",
    cidade: "Rio de Janeiro",
    date: "2026-04-15",
    dateLabel: "Qua, 15 abr",
    maxServices: 2,
    services: [
      {
        id: "massage-rj",
        name: "Quick Massage",
        duration: 15,
        description: "Massagem nas costas e pescoço",
        Icon: Sparkles,
        professionals: [
          { id: "juliana", name: "Juliana Braga", specialty: "Terapeuta", initials: "JB" },
          { id: "marina",  name: "Marina Souza",  specialty: "Terapeuta", initials: "MS" },
        ],
      },
      {
        id: "meditation-rj",
        name: "Meditação",
        duration: 20,
        description: "Sessão de relaxamento e atenção plena",
        Icon: Wind,
        professionals: [
          { id: "rafael", name: "Rafael Alves", specialty: "Instrutor", initials: "RA" },
        ],
      },
    ],
  },
];

// ─── Filter options ─────────────────────────────────────

const ESTADO_OPTIONS = [
  { label: "Todos os estados", value: "" },
  { label: "São Paulo (SP)", value: "SP" },
  { label: "Rio de Janeiro (RJ)", value: "RJ" },
];

const CIDADE_OPTIONS: Record<string, { label: string; value: string }[]> = {
  "": [{ label: "Todas as cidades", value: "" }],
  SP: [
    { label: "Todas as cidades", value: "" },
    { label: "São Paulo", value: "São Paulo" },
  ],
  RJ: [
    { label: "Todas as cidades", value: "" },
    { label: "Rio de Janeiro", value: "Rio de Janeiro" },
  ],
};

const DATE_OPTIONS = [
  { label: "Todas as datas", value: "" },
  { label: "Seg, 13 abr", value: "2026-04-13" },
  { label: "Ter, 14 abr", value: "2026-04-14" },
  { label: "Qua, 15 abr", value: "2026-04-15" },
];

function generateSlots(serviceId: string, professionalId: string) {
  const base = [
    "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30",
  ];
  const seed = serviceId.charCodeAt(0) + (professionalId ? professionalId.charCodeAt(0) : 0);
  return base.map((time, i) => ({
    time,
    available: (13 + i + seed) % 3 !== 0,
  }));
}

// ─── Types ──────────────────────────────────────────────

type ScheduleChoice = { time: string | null; waitlisted: boolean };
type View = "list" | "detail";

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

  // ── View state ──────────────────────────────────────
  const [view, setView] = useState<View>("list");

  // ── Filter state ────────────────────────────────────
  const [filterEstado, setFilterEstado] = useState("");
  const [filterCidade, setFilterCidade] = useState("");
  const [filterDate, setFilterDate] = useState("");

  // ── Event + service state ────────────────────────────
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [multiMode, setMultiMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedProfessionals, setSelectedProfessionals] = useState<
    Record<string, string | null>
  >({});
  const [schedules, setSchedules] = useState<Record<string, ScheduleChoice>>(
    {},
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // ── Filtered events ──────────────────────────────────
  const filteredEvents = EVENTS.filter((ev) => {
    if (filterEstado && ev.estado !== filterEstado) return false;
    if (filterCidade && ev.cidade !== filterCidade) return false;
    if (filterDate && ev.date !== filterDate) return false;
    return true;
  });

  const event = EVENTS.find((e) => e.id === selectedEventId) ?? null;
  const effectiveMax = event ? (multiMode ? Infinity : 1) : 1;
  const selectedCount = selectedIds.size;

  // ── Event selection (direct navigate) ────────────────

  function openEvent(id: string) {
    if (id !== selectedEventId) {
      setSelectedEventId(id);
      setSelectedIds(new Set());
      setSchedules({});
      setSelectedProfessionals({});
      setExpandedId(null);
      setMultiMode(false);
    }
    setView("detail");
  }

  function goBack() {
    setView("list");
  }

  // ── Filter handlers ───────────────────────────────────

  function handleEstadoChange(val: string) {
    setFilterEstado(val);
    setFilterCidade("");
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
      setSelectedProfessionals((prev) => {
        const { [id]: _, ...rest } = prev;
        return rest;
      });
      if (expandedId === id) setExpandedId(null);
    } else {
      if (selectedIds.size >= effectiveMax) return;
      setSelectedIds(multiMode ? new Set([...selectedIds, id]) : new Set([id]));
      if (!multiMode) {
        setSchedules({});
        setSelectedProfessionals({});
      }
      setExpandedId(id);
    }
  }

  // ── Seleção de profissional ─────────────────────────

  function selectProfessional(serviceId: string, professionalId: string) {
    if (selectedProfessionals[serviceId] === professionalId) return;
    setSelectedProfessionals((prev) => ({
      ...prev,
      [serviceId]: professionalId,
    }));
    setSchedules((prev) => {
      const { [serviceId]: _, ...rest } = prev;
      return rest;
    });
  }

  function setTime(serviceId: string, time: string) {
    const hasConflict = [...selectedIds]
      .filter((id) => id !== serviceId)
      .some((id) => schedules[id]?.time === time);
    if (hasConflict) return;
    setSchedules((prev) => ({
      ...prev,
      [serviceId]: { ...(prev[serviceId] ?? { waitlisted: false }), time },
    }));
  }

  // ── Completion ───────────────────────────────────────

  function isServiceComplete(id: string): boolean {
    const svc = event!.services.find((s) => s.id === id)!;
    if (svc.professionals?.length && !selectedProfessionals[id]) return false;
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
    let hasWaitlist = false, hasAvailable = false;
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
    let hasWaitlist = false, hasAvailable = false;
    for (const id of selectedIds) {
      const svc = event.services.find((s) => s.id === id)!;
      if (svc.globallyExhausted) hasWaitlist = true;
      else hasAvailable = true;
    }
    const variant: SuccessVariant =
      hasWaitlist && hasAvailable ? "mixed" : hasWaitlist ? "waitlist" : "confirmed";
    onNavigate?.("onsite-auth", variant);
  }

  function handleMultiToggle(e: React.ChangeEvent<HTMLInputElement>) {
    setMultiMode(e.target.checked);
    setSelectedIds(new Set());
    setSchedules({});
    setSelectedProfessionals({});
    setExpandedId(null);
  }

  // ── Render ───────────────────────────────────────────

  return (
    <div className={styles.page}>
      <AppHeader />

      {/* ── Hero ─────────────────────────────────────── */}
      <div className={styles.hero}>
        <div
          className={[
            styles.heroInner,
            isDesktop ? styles.heroInnerDesktop : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {view === "list" ? (
            <>
              <span className={styles.eventTag}>Espaço Prana</span>
              <h1 className={styles.eventName}>Eventos Espaço Prana</h1>
            </>
          ) : (
            <>
              <button className={styles.backBtn} onClick={goBack}>
                <ChevronLeft size={14} />
                Voltar aos eventos
              </button>
              <span className={styles.eventTag}>{event?.cidade}</span>
              <h1 className={styles.eventName}>{event?.name}</h1>
              <div className={styles.eventDetailMeta}>
                <span className={styles.eventDetailMetaItem}>
                  <Calendar size={13} />
                  {event?.dateLabel}
                </span>
                <span className={styles.eventDetailMetaSep}>·</span>
                <span className={styles.eventDetailMetaItem}>
                  <MapPin size={13} />
                  {event?.location}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── List view ────────────────────────────────── */}
      {view === "list" && (
        <div
          className={[styles.content, isDesktop ? styles.contentDesktop : ""]
            .filter(Boolean)
            .join(" ")}
        >
          {/* Filtros */}
          <div className={styles.filterBar}>
            <Dropdown
              label="Estado"
              options={ESTADO_OPTIONS}
              value={filterEstado}
              onChange={handleEstadoChange}
              placeholder="Todos os estados"
            />
            <Dropdown
              label="Cidade"
              options={CIDADE_OPTIONS[filterEstado] ?? CIDADE_OPTIONS[""]}
              value={filterCidade}
              onChange={setFilterCidade}
              placeholder="Todas as cidades"
              disabled={!filterEstado}
            />
            <Dropdown
              label="Data"
              options={DATE_OPTIONS}
              value={filterDate}
              onChange={setFilterDate}
              placeholder="Todas as datas"
            />
          </div>

          {/* Lista de eventos */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Lista de eventos</h2>
            <div className={styles.eventList}>
              {filteredEvents.length === 0 ? (
                <p className={styles.emptyState}>
                  Nenhum evento encontrado para os filtros selecionados.
                </p>
              ) : (
                filteredEvents.map((ev) => (
                  <button
                    key={ev.id}
                    className={styles.eventCard}
                    onClick={() => openEvent(ev.id)}
                  >
                    <div className={styles.eventInfo}>
                      <span className={styles.eventCardName}>{ev.name}</span>
                      <span className={styles.eventCardMetaRow}>
                        <span className={styles.eventCardMetaItem}>
                          <Calendar size={11} />
                          {ev.dateLabel}
                        </span>
                        <span className={styles.eventCardMetaSep}>·</span>
                        <span className={styles.eventCardMetaItem}>
                          <MapPin size={11} />
                          {ev.cidade}
                        </span>
                      </span>
                      <span className={styles.eventLocation}>
                        <MapPin size={12} />
                        {ev.location}
                      </span>
                    </div>
                    <ChevronRight size={16} className={styles.eventCardArrow} />
                  </button>
                ))
              )}
            </div>
          </section>
        </div>
      )}

      {/* ── Detail view ──────────────────────────────── */}
      {view === "detail" && event && (
        <>
          <div
            className={[styles.content, isDesktop ? styles.contentDesktop : ""]
              .filter(Boolean)
              .join(" ")}
          >
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
                    isSelected && (!multiMode || expandedId === svc.id);
                  const isCollapsed =
                    isSelected && multiMode && expandedId !== svc.id;
                  const isDisabled =
                    !isSelected && selectedCount >= effectiveMax;
                  const sch = schedules[svc.id];
                  const isComplete = isSelected && isServiceComplete(svc.id);
                  const selectedProId = selectedProfessionals[svc.id];
                  const proSelected = !svc.professionals?.length || !!selectedProId;

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
                              {isSelected && (
                                <span className={styles.radioDot} />
                              )}
                            </span>
                          )}
                        </div>
                      </button>

                      {/* Scheduler: profissional → horário */}
                      {isExpanded && (
                        <div className={styles.cardBody}>
                          {/* ── Seleção de profissional ── */}
                          {svc.professionals && svc.professionals.length > 0 && (
                            <div className={styles.profPickerSection}>
                              <h3 className={styles.pickerLabel}>
                                Escolha o profissional
                              </h3>
                              <div className={styles.profStrip}>
                                {svc.professionals.map((pro) => {
                                  const isProSelected =
                                    selectedProId === pro.id;
                                  return (
                                    <button
                                      key={pro.id}
                                      className={[
                                        styles.profBtn,
                                        isProSelected
                                          ? styles.profBtnActive
                                          : "",
                                      ]
                                        .filter(Boolean)
                                        .join(" ")}
                                      onClick={() =>
                                        selectProfessional(svc.id, pro.id)
                                      }
                                    >
                                      <span className={styles.profAvatar}>
                                        {pro.initials}
                                      </span>
                                      <span className={styles.profName}>
                                        {pro.name}
                                      </span>
                                      <span className={styles.profSpecialty}>
                                        {pro.specialty}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* ── Horários — só após selecionar profissional ── */}
                          {proSelected && (
                            svc.globallyExhausted ? (
                              <Feedback
                                type="warning"
                                title="Horários esgotados"
                                message="Você foi adicionado à lista de espera. Entraremos em contato se uma vaga abrir."
                              />
                            ) : (
                              <div className={styles.scheduler}>
                                <h3 className={styles.pickerLabel}>
                                  Horário disponível
                                </h3>
                                <div className={styles.timeGrid}>
                                  {(() => {
                                    const conflictingTimes = [...selectedIds]
                                      .filter((id) => id !== svc.id)
                                      .map((id) => schedules[id]?.time)
                                      .filter(Boolean) as string[];
                                    return generateSlots(
                                      svc.id,
                                      selectedProId ?? "",
                                    ).map((slot) => {
                                      const isConflict =
                                        conflictingTimes.includes(slot.time);
                                      return (
                                        <button
                                          key={slot.time}
                                          className={[
                                            styles.timeBtn,
                                            !slot.available || isConflict
                                              ? styles.timeBtnUnavailable
                                              : "",
                                            sch?.time === slot.time
                                              ? styles.timeBtnActive
                                              : "",
                                          ]
                                            .filter(Boolean)
                                            .join(" ")}
                                          disabled={
                                            !slot.available || isConflict
                                          }
                                          onClick={() =>
                                            slot.available &&
                                            !isConflict &&
                                            setTime(svc.id, slot.time)
                                          }
                                        >
                                          {slot.time}
                                        </button>
                                      );
                                    });
                                  })()}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* CTA */}
          <div className={styles.ctaBar}>
            <div
              className={[
                styles.ctaInner,
                isDesktop ? styles.ctaInnerDesktop : "",
              ]
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
        </>
      )}
    </div>
  );
}
