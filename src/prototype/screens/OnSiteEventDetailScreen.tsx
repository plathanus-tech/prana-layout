/**
 * OnSiteEventDetailScreen — Detalhe do Evento (Agendamento no Local)
 *
 * Segue o padrão visual e de interação da BEN-01 (SelectionScreenE).
 * Fluxo: Serviço → Profissional → Horário (evento de dia único).
 */
import { useState } from "react";
import {
  Clock,
  CheckCircle2,
  Sparkles,
  Wind,
  Footprints,
  MapPin,
  Calendar,
  type LucideIcon,
} from "lucide-react";
import { Button } from "../../components/Button/Button";
import { Feedback } from "../../components/Feedback/Feedback";
import { Toggle } from "../../components/Toggle/Toggle";
import { AppHeader } from "../components/AppHeader";
import type { SuccessVariant } from "./SuccessScreen";
// Reutiliza exatamente o CSS do BEN-01
import styles from "./SelectionScreenE.module.css";

// ─── Demo data ──────────────────────────────────────────

const EVENT = {
  name: "Programa de Bem-Estar",
  company: "Plathanus",
  dateLabel: "Seg, 13 abr",
  location: "Sala de Treinamentos - Bloco A",
};

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
  professionals: ProfessionalConfig[];
}

const SERVICES: ServiceConfig[] = [
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
    name: "Meditação Profunda",
    duration: 30,
    description: "Sessão guiada de atenção plena",
    Icon: Wind,
    globallyExhausted: true,
    professionals: [
      { id: "rafael", name: "Rafael Alves", specialty: "Instrutor", initials: "RA", globallyExhausted: true },
    ],
  },
];

function generateSlots(serviceId: string, professionalId: string) {
  const base = [
    "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30",
  ];
  const seed = serviceId.charCodeAt(0) + professionalId.charCodeAt(0);
  return base.map((time, i) => ({
    time,
    available: (13 + i + seed) % 3 !== 0,
  }));
}

// ─── State ──────────────────────────────────────────────

type ScheduleChoice = { time: string | null; waitlisted?: boolean };

interface OnSiteEventDetailScreenProps {
  viewport?: "mobile" | "desktop";
  onNavigate?: (screen: "onsite-auth", successVariant: SuccessVariant) => void;
}

// ─── Componente ─────────────────────────────────────────

export function OnSiteEventDetailScreen({
  viewport = "desktop",
  onNavigate,
}: OnSiteEventDetailScreenProps) {
  const isDesktop = viewport === "desktop";

  const [multiMode, setMultiMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedProfessionals, setSelectedProfessionals] = useState<
    Record<string, string | null>
  >({});
  const [schedules, setSchedules] = useState<Record<string, ScheduleChoice>>(
    {},
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const effectiveMax = multiMode ? Infinity : 1;
  const selectedCount = selectedIds.size;

  // ── Seleção de serviço ──────────────────────────────

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

  function reExpand(id: string) {
    setExpandedId(id);
  }

  // ── Seleção de profissional ─────────────────────────

  function selectProfessional(serviceId: string, professionalId: string) {
    if (selectedProfessionals[serviceId] === professionalId) return;
    setSelectedProfessionals((prev) => ({
      ...prev,
      [serviceId]: professionalId,
    }));
    // Resetar horário ao trocar de profissional
    setSchedules((prev) => {
      const { [serviceId]: _, ...rest } = prev;
      return rest;
    });
  }

  // ── Seleção de horário ──────────────────────────────

  function setTime(serviceId: string, time: string) {
    const hasConflict = [...selectedIds]
      .filter((id) => id !== serviceId)
      .some((id) => schedules[id]?.time === time);
    if (hasConflict) return;
    setSchedules((prev) => ({
      ...prev,
      [serviceId]: { time, waitlisted: false },
    }));
  }

  // ── Conclusão ────────────────────────────────────────

  function isServiceComplete(id: string): boolean {
    const svc = SERVICES.find((s) => s.id === id)!;
    if (!selectedProfessionals[id]) return false;
    if (svc.globallyExhausted) return true;
    return !!schedules[id]?.time;
  }

  const canProceed =
    selectedCount > 0 && [...selectedIds].every(isServiceComplete);

  // ── CTA ─────────────────────────────────────────────

  function ctaLabel(): string {
    if (selectedCount === 0) return "Selecione um serviço";
    let hasWaitlist = false, hasAvailable = false;
    for (const id of selectedIds) {
      const svc = SERVICES.find((s) => s.id === id)!;
      if (svc.globallyExhausted) hasWaitlist = true;
      else hasAvailable = true;
    }
    if (hasWaitlist && hasAvailable) return "Confirmar seleção";
    if (hasWaitlist) return "Entrar na lista de espera";
    return selectedCount > 1 ? "Agendar serviços" : "Agendar serviço";
  }

  function handleCTA() {
    if (!canProceed) return;
    let hasWaitlist = false, hasAvailable = false;
    for (const id of selectedIds) {
      const svc = SERVICES.find((s) => s.id === id)!;
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

      {/* Hero — padrão BEN-01 */}
      <div className={styles.eventHero}>
        <div
          className={[
            styles.eventHeroInner,
            isDesktop ? styles.eventHeroInnerDesktop : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <span className={styles.eventTag}>{EVENT.company}</span>
          <h1 className={styles.eventName}>{EVENT.name}</h1>
          <div className={styles.eventMeta}>
            <span className={styles.eventMetaItem}>
              <Calendar size={18} className={styles.metaIcon} />
              {EVENT.dateLabel}
            </span>
            <span className={styles.eventMetaSep}>·</span>
            <span className={styles.eventMetaItem}>
              <MapPin size={18} className={styles.metaIcon} />
              {EVENT.location}
            </span>
          </div>
          {multiMode && (
            <p className={styles.eventHint}>
              Selecione os serviços desejados, cada um terá seu próprio horário
            </p>
          )}
        </div>
      </div>

      <div
        className={[styles.content, isDesktop ? styles.contentDesktop : ""]
          .filter(Boolean)
          .join(" ")}
      >
        {/* Toggle de protótipo */}
        {SERVICES.length > 1 && (
          <div className={styles.protoToggle}>
            <span className={styles.protoLabel}>🧪 Protótipo</span>
            <Toggle
              label="Múltiplos serviços"
              checked={multiMode}
              onChange={handleMultiToggle}
            />
          </div>
        )}

        {/* Lista de serviços */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            {effectiveMax > 1 ? "Escolha seus serviços" : "Escolha o serviço"}
          </h2>

          <div className={styles.serviceList}>
            {SERVICES.map((svc) => {
              const isSelected = selectedIds.has(svc.id);
              const isExpanded =
                isSelected && (!multiMode || expandedId === svc.id);
              const isCollapsed =
                isSelected && multiMode && expandedId !== svc.id;
              const isDisabled = !isSelected && selectedCount >= effectiveMax;
              const sch = schedules[svc.id];
              const isComplete = isSelected && isServiceComplete(svc.id);
              const isWaitlist = svc.globallyExhausted || sch?.waitlisted;
              const selectedProId = selectedProfessionals[svc.id];
              const proSelected = !!selectedProId;

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
                  {/* Cabeçalho */}
                  <button
                    className={styles.cardHeader}
                    onClick={() =>
                      isCollapsed ? reExpand(svc.id) : toggleService(svc.id)
                    }
                    disabled={isDisabled}
                  >
                    <div
                      className={[
                        styles.cardIcon,
                        isSelected ? styles.cardIconSelected : "",
                        isSelected && isWaitlist ? styles.cardIconWaitlist : "",
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
                          {isWaitlist
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
                        <span
                          className={[
                            styles.cardComplete,
                            isWaitlist ? styles.cardCompleteWaitlist : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          <CheckCircle2 size={12} />
                          {isWaitlist
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

                  {/* Scheduler: profissional → horário */}
                  {isExpanded && (
                    <div className={styles.cardBody}>
                      <div className={styles.scheduler}>

                        {/* ── Seleção de profissional ── */}
                        <div className={styles.pickerSection}>
                          <h3 className={styles.pickerLabel}>
                            Escolha o profissional
                          </h3>
                          <div className={styles.profStrip}>
                            {svc.professionals.map((pro) => {
                              const isProSelected = selectedProId === pro.id;
                              return (
                                <button
                                  key={pro.id}
                                  className={[
                                    styles.profBtn,
                                    isProSelected ? styles.profBtnActive : "",
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

                        {/* ── Horários — só após selecionar profissional ── */}
                        {proSelected && (
                          svc.globallyExhausted ? (
                            <Feedback
                              type="warning"
                              title="Horários esgotados"
                              message="Você foi adicionado à lista de espera. Entraremos em contato se uma vaga abrir."
                            />
                          ) : (
                            <div className={styles.pickerSection}>
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
                                    selectedProId!,
                                  ).map((slot) => {
                                    const isConflict = conflictingTimes.includes(
                                      slot.time,
                                    );
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
                                        disabled={!slot.available || isConflict}
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
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* CTA fixo */}
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
