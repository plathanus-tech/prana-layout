import { useState, useRef, useEffect } from "react";
import {
  Clock,
  MapPin,
  Calendar,
  CheckCircle2,
  Sparkles,
  Wind,
  Footprints,
  type LucideIcon,
} from "lucide-react";
import { Button } from "../../components/Button/Button";
import { Feedback } from "../../components/Feedback/Feedback";
import { Toggle } from "../../components/Toggle/Toggle";
import { AppHeader } from "../components/AppHeader";
import styles from "./SelectionScreenE.module.css";
import type { SuccessVariant } from "./SuccessScreen";

const COMPANY_NAME = "Plathanus";

// ─── Data model ────────────────────────────────────────────

export type ScenarioId = "A" | "B" | "C" | "D";

interface ProfessionalConfig {
  id: string;
  name: string;
  specialty: string;
  initials: string;
  exhaustedDayKeys?: string[];
  globallyExhausted?: boolean;
}

interface ServiceConfig {
  id: string;
  name: string;
  duration: number;
  description: string;
  Icon: LucideIcon;
  /** Todos os horários do serviço estão esgotados globalmente (fallback sem profissionais) */
  globallyExhausted?: boolean;
  /** Chaves de dias específicos que estão esgotados para este serviço (fallback sem profissionais) */
  exhaustedDayKeys?: string[];
  /** Profissionais disponíveis para este serviço */
  professionals?: ProfessionalConfig[];
}

interface ScenarioConfig {
  eventName: string;
  dateStr: string;
  location: string;
  maxServices: number;
  /** Se true, o evento tem apenas 1 dia — oculta o seletor de dias */
  singleDay: boolean;
  services: ServiceConfig[];
}

// ─── Dias ──────────────────────────────────────────────────

const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTH_NAMES = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];

function generateDays(count = 8) {
  const days: {
    key: string;
    dayName: string;
    dayNum: number;
    month: string;
  }[] = [];
  const d = new Date(2026, 3, 11);
  while (days.length < count) {
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

const DAYS = generateDays(8);

function formatDayLabel(dayKey: string) {
  const d = DAYS.find((x) => x.key === dayKey);
  return d ? `${d.dayName} ${d.dayNum} de ${d.month}` : dayKey;
}

function generateSlots(serviceId: string, dayKey: string) {
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
  const dayNum = parseInt(dayKey.split("-")[2]);
  const seed = serviceId.charCodeAt(0);
  return base.map((time, i) => ({
    time,
    available: (dayNum + i + seed) % 3 !== 0,
  }));
}

// ─── Slot utilities ─────────────────────────────────────────

type Slot = { time: string; available: boolean };
type ShiftGroup = { label: string; slots: Slot[] };

function groupSlotsByShift(slots: Slot[]): ShiftGroup[] {
  const groups: ShiftGroup[] = [
    { label: "Manhã", slots: [] },
    { label: "Tarde", slots: [] },
    { label: "Noite", slots: [] },
  ];
  for (const slot of slots) {
    const hour = parseInt(slot.time.split(":")[0]);
    if (hour < 12) groups[0].slots.push(slot);
    else if (hour < 18) groups[1].slots.push(slot);
    else groups[2].slots.push(slot);
  }
  return groups.filter((g) => g.slots.length > 0);
}

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─── Profissionais base ─────────────────────────────────────

const PROS = {
  juliana: { id: "juliana", name: "Juliana Braga", specialty: "Terapeuta",  initials: "JB" },
  ana:     { id: "ana",     name: "Ana Costa",     specialty: "Terapeuta",  initials: "AC" },
  carlos:  { id: "carlos",  name: "Carlos Lima",   specialty: "Terapeuta",  initials: "CL" },
  beatriz: { id: "beatriz", name: "Beatriz Santos", specialty: "Terapeuta", initials: "BS" },
  rafael:  { id: "rafael",  name: "Rafael Alves",  specialty: "Instrutor",  initials: "RA" },
  marina:  { id: "marina",  name: "Marina Souza",  specialty: "Instrutora", initials: "MS" },
};

// ─── Cenários ──────────────────────────────────────────────

const BASE_SERVICES = {
  massage: {
    id: "massage",
    name: "Quick Massage",
    duration: 15,
    description: "Massagem nas costas e pescoço",
    Icon: Sparkles,
  },
  reflexology: {
    id: "reflexology",
    name: "Reflexologia",
    duration: 20,
    description: "Massagem nos pontos de pressão dos pés",
    Icon: Footprints,
  },
  meditation: {
    id: "meditation",
    name: "Meditação",
    duration: 20,
    description: "Sessão de relaxamento e atenção plena",
    Icon: Wind,
  },
};

const SCENARIOS: Record<ScenarioId, ScenarioConfig> = {
  /** A — Padrão: múltiplos serviços, dias com disponibilidade */
  A: {
    eventName: "Semana do Bem-Estar",
    dateStr: "10 a 14 de abril de 2026",
    location: "Sala de Treinamentos - Bloco A",
    maxServices: 2,
    singleDay: false,
    services: [
      {
        ...BASE_SERVICES.massage,
        professionals: [
          { ...PROS.juliana },
          { ...PROS.ana, exhaustedDayKeys: [DAYS[2].key, DAYS[5].key] },
        ],
      },
      {
        ...BASE_SERVICES.reflexology,
        professionals: [
          { ...PROS.carlos },
          { ...PROS.beatriz, exhaustedDayKeys: [DAYS[0].key, DAYS[4].key] },
        ],
      },
      {
        ...BASE_SERVICES.meditation,
        professionals: [
          { ...PROS.rafael },
          { ...PROS.marina, exhaustedDayKeys: [DAYS[0].key] },
        ],
      },
    ],
  },

  /** B — Dias esgotados: alguns dias/profissionais indisponíveis */
  B: {
    eventName: "Semana do Bem-Estar",
    dateStr: "10 a 14 de abril de 2026",
    location: "Sala de Treinamentos - Bloco A",
    maxServices: 2,
    singleDay: false,
    services: [
      {
        ...BASE_SERVICES.massage,
        professionals: [
          { ...PROS.juliana, exhaustedDayKeys: [DAYS[1].key, DAYS[3].key] },
          { ...PROS.ana },
        ],
      },
      {
        ...BASE_SERVICES.reflexology,
        professionals: [
          { ...PROS.carlos,  globallyExhausted: true },
          { ...PROS.beatriz, globallyExhausted: true },
        ],
      },
      {
        ...BASE_SERVICES.meditation,
        professionals: [
          { ...PROS.rafael },
          { ...PROS.marina },
        ],
      },
    ],
  },

  /** C — Serviço único: sem complexidade de múltiplos serviços */
  C: {
    eventName: "Semana do Bem-Estar",
    dateStr: "10 a 14 de abril de 2026",
    location: "Sala de Treinamentos - Bloco A",
    maxServices: 1,
    singleDay: false,
    services: [
      {
        ...BASE_SERVICES.massage,
        professionals: [
          { ...PROS.juliana },
          { ...PROS.ana, exhaustedDayKeys: [DAYS[4].key] },
        ],
      },
    ],
  },

  /** D — Evento de 1 dia: sem seletor de dias, direto ao horário */
  D: {
    eventName: "Day Off Corporativo",
    dateStr: "28 de abril de 2026",
    location: "Espaço Prana - Unidade Paulista",
    maxServices: 1,
    singleDay: true,
    services: [
      {
        ...BASE_SERVICES.massage,
        professionals: [
          { ...PROS.juliana },
          { ...PROS.ana },
        ],
      },
      {
        ...BASE_SERVICES.meditation,
        professionals: [
          { ...PROS.rafael },
          { ...PROS.marina },
        ],
      },
    ],
  },
};

// ─── Tipos de estado ───────────────────────────────────────

type ScheduleChoice = {
  dayKey: string | null;
  time: string | null;
  /** true quando o dia selecionado está esgotado → usuário entra na lista de espera */
  waitlisted?: boolean;
};

// ─── Componente ────────────────────────────────────────────

interface SelectionScreenEProps {
  viewport?: "mobile" | "desktop";
  scenario?: ScenarioId;
  onNavigate?: (screen: "success", successVariant: SuccessVariant) => void;
}

export function SelectionScreenE({
  viewport = "desktop",
  scenario = "A",
  onNavigate,
}: SelectionScreenEProps) {
  const isDesktop = viewport === "desktop";
  const config = SCENARIOS[scenario];

  const [multiMode, setMultiMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [schedules, setSchedules] = useState<Record<string, ScheduleChoice>>(
    {},
  );
  const [selectedProfessionals, setSelectedProfessionals] = useState<
    Record<string, string | null>
  >({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [timers, setTimers] = useState<Record<string, number | null>>({});
  const timerRefs = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  useEffect(() => {
    const refs = timerRefs.current;
    return () => {
      Object.values(refs).forEach((id) => clearInterval(id));
    };
  }, []);

  function startTimer(serviceId: string, isWaitlist = false) {
    if (timerRefs.current[serviceId])
      clearInterval(timerRefs.current[serviceId]);
    setTimers((prev) => ({ ...prev, [serviceId]: 300 }));
    let remaining = 300;
    timerRefs.current[serviceId] = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearInterval(timerRefs.current[serviceId]);
        delete timerRefs.current[serviceId];
        setTimers((prev) => ({ ...prev, [serviceId]: null }));
        setSchedules((prev) => {
          const existing = prev[serviceId];
          if (!existing) return prev;
          if (isWaitlist)
            return {
              ...prev,
              [serviceId]: { dayKey: null, time: null, waitlisted: false },
            };
          return { ...prev, [serviceId]: { ...existing, time: null } };
        });
      } else {
        setTimers((prev) => ({ ...prev, [serviceId]: remaining }));
      }
    }, 1000);
  }

  function clearTimer(serviceId: string) {
    if (timerRefs.current[serviceId]) {
      clearInterval(timerRefs.current[serviceId]);
      delete timerRefs.current[serviceId];
    }
    setTimers((prev) => ({ ...prev, [serviceId]: null }));
  }

  const effectiveMax = multiMode ? Infinity : 1;
  const selectedCount = selectedIds.size;

  // ── Seleção de serviço ──────────────────────────────────

  function toggleService(id: string) {
    const isSelected = selectedIds.has(id);

    if (isSelected) {
      // Desselecionar
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
      clearTimer(id);
    } else {
      // Selecionar
      if (selectedIds.size >= effectiveMax) return;

      const nextSchedules = multiMode ? { ...schedules } : {};

      setSchedules(nextSchedules);
      setSelectedIds(multiMode ? new Set([...selectedIds, id]) : new Set([id]));
      if (!multiMode) {
        setSelectedProfessionals({});
      }
      setExpandedId(id);
    }
  }

  function reExpand(id: string) {
    setExpandedId(id);
  }

  // ── Seleção de profissional ─────────────────────────────

  function selectProfessional(serviceId: string, professionalId: string) {
    const alreadySelected = selectedProfessionals[serviceId] === professionalId;
    if (alreadySelected) return;

    setSelectedProfessionals((prev) => ({
      ...prev,
      [serviceId]: professionalId,
    }));

    // Limpar horário anterior ao trocar de profissional
    const svc = config.services.find((s) => s.id === serviceId)!;
    const pro = svc.professionals?.find((p) => p.id === professionalId);

    if (config.singleDay) {
      // Evento de 1 dia: pré-seleciona o único dia com base na disponibilidade do profissional
      const exhausted = !!pro?.globallyExhausted;
      setSchedules((prev) => ({
        ...prev,
        [serviceId]: { dayKey: DAYS[0].key, time: null, waitlisted: exhausted },
      }));
      if (exhausted) startTimer(serviceId, true);
      else clearTimer(serviceId);
    } else {
      // Limpar dia/hora ao trocar de profissional
      setSchedules((prev) => {
        const { [serviceId]: _, ...rest } = prev;
        return rest;
      });
      clearTimer(serviceId);
    }
  }

  // ── Seleção de dia ─────────────────────────────────────

  function setDay(serviceId: string, dayKey: string) {
    const svc = config.services.find((s) => s.id === serviceId)!;
    const proId = selectedProfessionals[serviceId];
    const pro = svc.professionals?.find((p) => p.id === proId);

    const exhausted = pro
      ? (!!pro.globallyExhausted || (pro.exhaustedDayKeys ?? []).includes(dayKey))
      : (!!svc.globallyExhausted || (svc.exhaustedDayKeys ?? []).includes(dayKey));

    setSchedules((prev) => ({
      ...prev,
      [serviceId]: { dayKey, time: null, waitlisted: exhausted },
    }));
    if (exhausted) {
      startTimer(serviceId, true);
    } else {
      clearTimer(serviceId);
    }
  }

  function setTime(serviceId: string, time: string) {
    const dayKey = schedules[serviceId]?.dayKey;
    // Bloquear se outro serviço já ocupa o mesmo dia + horário
    const hasConflict = [...selectedIds]
      .filter((id) => id !== serviceId)
      .some(
        (id) =>
          schedules[id]?.dayKey === dayKey && schedules[id]?.time === time,
      );
    if (hasConflict) return;
    setSchedules((prev) => ({
      ...prev,
      [serviceId]: { ...(prev[serviceId] ?? { dayKey: null }), time },
    }));
    startTimer(serviceId);
  }

  // ── Estado de conclusão ─────────────────────────────────

  function isServiceComplete(id: string): boolean {
    const svc = config.services.find((s) => s.id === id)!;
    // Profissional obrigatório quando a lista de profissionais existe
    if (svc.professionals?.length && !selectedProfessionals[id]) return false;
    const sch = schedules[id];
    if (!sch?.dayKey) return false;
    if (sch.waitlisted) return true;
    return !!sch.time;
  }

  const canProceed =
    selectedCount > 0 && [...selectedIds].every(isServiceComplete);

  // ── Label do CTA ────────────────────────────────────────

  function ctaLabel(): string {
    if (selectedCount === 0) return "Agendar serviço";

    let hasWaitlist = false;
    let hasAvailable = false;

    for (const id of selectedIds) {
      const svc = config.services.find((s) => s.id === id)!;
      const sch = schedules[id];
      if (svc.globallyExhausted || sch?.waitlisted) hasWaitlist = true;
      else hasAvailable = true;
    }

    if (hasWaitlist && hasAvailable) return "Confirmar seleção";
    if (hasWaitlist) return "Entrar na lista de espera";
    return selectedCount > 1 ? "Agendar serviços" : "Agendar serviço";
  }

  // ── Handlers do toggle ─────────────────────────────────

  function handleMultiToggle(e: React.ChangeEvent<HTMLInputElement>) {
    Object.keys(timerRefs.current).forEach((id) => clearTimer(id));
    setMultiMode(e.target.checked);
    setSelectedIds(new Set());
    setSchedules({});
    setSelectedProfessionals({});
    setExpandedId(null);
  }

  // ── Render ──────────────────────────────────────────────

  return (
    <div className={styles.page}>
      <AppHeader />

      {/* Hero */}
      <div className={styles.eventHero}>
        <div
          className={[
            styles.eventHeroInner,
            isDesktop ? styles.eventHeroInnerDesktop : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <span className={styles.eventTag}>{COMPANY_NAME}</span>
          <h1 className={styles.eventName}>{config.eventName}</h1>
          <div className={styles.eventMeta}>
            <span className={styles.eventMetaItem}>
              <Calendar size={18} className={styles.metaIcon} />
              {config.dateStr}
            </span>
            <span className={styles.eventMetaSep}>·</span>
            <span className={styles.eventMetaItem}>
              <MapPin size={18} className={styles.metaIcon} />
              {config.location}
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
        {/* Toggle de protótipo — apenas quando há múltiplos serviços disponíveis */}
        {config.services.length > 1 && (
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
            {config.services.length === 1
              ? "Serviço disponível"
              : effectiveMax > 1
                ? "Escolha seus serviços"
                : "Escolha o serviço"}
          </h2>

          <div className={styles.serviceList}>
            {config.services.map((svc) => {
              const isSelected = selectedIds.has(svc.id);
              const isExpanded =
                isSelected && (!multiMode || expandedId === svc.id);
              const isCollapsed =
                isSelected && multiMode && expandedId !== svc.id;
              const isDisabled = !isSelected && selectedCount >= effectiveMax;
              const sch = schedules[svc.id];
              const isComplete = isSelected && isServiceComplete(svc.id);
              const selectedDay = DAYS.find((d) => d.key === sch?.dayKey);
              const isWaitlist = svc.globallyExhausted || sch?.waitlisted;
              const selectedProId = selectedProfessionals[svc.id];
              const hasProfessionals = !!svc.professionals?.length;
              const proSelected = !hasProfessionals || !!selectedProId;

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
                  {/* Cabeçalho do card */}
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

                      {/* Resumo quando colapsado */}
                      {isCollapsed && isComplete ? (
                        <span className={styles.cardSummary}>
                          <CheckCircle2 size={12} />
                          {isWaitlist
                            ? `Lista de espera${sch?.dayKey ? ` · ${formatDayLabel(sch.dayKey)}` : ""}`
                            : `${selectedDay?.dayName} ${selectedDay?.dayNum} de ${selectedDay?.month} · ${sch?.time}`}
                        </span>
                      ) : (
                        <span className={styles.cardMeta}>
                          <Clock size={12} />
                          {svc.duration} min · {svc.description}
                        </span>
                      )}

                      {/* Confirmação quando expandido */}
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
                            ? `Na lista de espera${sch?.dayKey ? ` · ${formatDayLabel(sch.dayKey)}` : ""}`
                            : `${selectedDay?.dayName} ${selectedDay?.dayNum} de ${selectedDay?.month} · ${sch?.time}`}
                        </span>
                      )}
                    </div>

                    {/* Selector (radio / checkbox) */}
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

                  {/* Timer persistente — visível mesmo quando o card está colapsado */}
                  {timers[svc.id] != null && (
                    <div
                      className={[
                        styles.timerBanner,
                        styles.timerBannerPersistent,
                      ].join(" ")}
                    >
                      <Clock size={14} />
                      <span>
                        {sch?.waitlisted
                          ? `Reserva expira em ${formatTimer(timers[svc.id]!)}`
                          : `Horário reservado por ${formatTimer(timers[svc.id]!)}`}
                      </span>
                    </div>
                  )}

                  {/* Scheduler (profissional → dias → horários) */}
                  {isExpanded && (
                    <div className={styles.cardBody}>
                      <div className={styles.scheduler}>

                        {/* ── Seleção de profissional ── */}
                        {hasProfessionals && (
                          <div className={styles.pickerSection}>
                            <h3 className={styles.pickerLabel}>
                              Escolha o profissional
                            </h3>
                            <div className={styles.profStrip}>
                              {svc.professionals!.map((pro) => {
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
                        )}

                        {/* ── Seletor de dias + horários — só após selecionar profissional ── */}
                        {proSelected && (
                          <>
                            {/* Seletor de dias — oculto no cenário D (evento de 1 dia) */}
                            {!config.singleDay && (
                              <div className={styles.pickerSection}>
                                <h3 className={styles.pickerLabel}>
                                  Escolha o dia
                                </h3>
                                <div className={styles.dayStrip}>
                                  {DAYS.map((day) => {
                                    const pro = svc.professionals?.find(
                                      (p) => p.id === selectedProId,
                                    );
                                    const isExhausted = pro
                                      ? (!!pro.globallyExhausted ||
                                          (pro.exhaustedDayKeys ?? []).includes(
                                            day.key,
                                          ))
                                      : (!!svc.globallyExhausted ||
                                          (svc.exhaustedDayKeys ?? []).includes(
                                            day.key,
                                          ));
                                    const isActive = sch?.dayKey === day.key;
                                    const isWaitlisted =
                                      isActive && sch?.waitlisted;

                                    return (
                                      <button
                                        key={day.key}
                                        className={[
                                          styles.dayBtn,
                                          isExhausted && !isActive
                                            ? styles.dayBtnExhausted
                                            : "",
                                          isActive && !isWaitlisted
                                            ? styles.dayBtnActive
                                            : "",
                                          isWaitlisted
                                            ? styles.dayBtnWaitlisted
                                            : "",
                                        ]
                                          .filter(Boolean)
                                          .join(" ")}
                                        onClick={() =>
                                          setDay(svc.id, day.key)
                                        }
                                      >
                                        <span className={styles.dayName}>
                                          {day.dayName}
                                        </span>
                                        <span className={styles.dayNum}>
                                          {day.dayNum}
                                        </span>
                                        <span className={styles.dayMonth}>
                                          {day.month}
                                        </span>
                                        {isExhausted && (
                                          <span
                                            className={styles.dayExhaustedTag}
                                          >
                                            Esgotado
                                          </span>
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Após seleção do dia: horários ou feedback de lista de espera */}
                            {sch?.dayKey &&
                              (sch.waitlisted ? (
                                <Feedback
                                  type="info"
                                  title="Na lista de espera"
                                  message={`Após confirmar seleção, você entrará na lista de espera e será notificado caso abra uma vaga para ${formatDayLabel(sch.dayKey)}.`}
                                />
                              ) : (() => {
                                const conflictingTimes = [...selectedIds]
                                  .filter(
                                    (id) =>
                                      id !== svc.id &&
                                      schedules[id]?.dayKey === sch.dayKey,
                                  )
                                  .map((id) => schedules[id]?.time)
                                  .filter(Boolean) as string[];
                                return (
                                  <div className={styles.pickerSection}>
                                    <h3 className={styles.pickerLabel}>
                                      Horário disponível
                                    </h3>
                                    <div className={styles.shiftGroups}>
                                      {groupSlotsByShift(
                                        generateSlots(svc.id, sch.dayKey),
                                      ).map((shift) => (
                                        <div
                                          key={shift.label}
                                          className={styles.shiftGroup}
                                        >
                                          <span className={styles.shiftLabel}>
                                            {shift.label}
                                          </span>
                                          <div className={styles.timeGrid}>
                                            {shift.slots.map((slot) => {
                                              const isConflict =
                                                conflictingTimes.includes(
                                                  slot.time,
                                                );
                                              return (
                                                <button
                                                  key={slot.time}
                                                  className={[
                                                    styles.timeBtn,
                                                    !slot.available ||
                                                    isConflict
                                                      ? styles.timeBtnUnavailable
                                                      : "",
                                                    sch.time === slot.time
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
                                            })}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })())}
                          </>
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
            onClick={() => {
              let hasWaitlist = false,
                hasAvailable = false;
              for (const id of selectedIds) {
                const svc = config.services.find((s) => s.id === id)!;
                const sch = schedules[id];
                if (svc.globallyExhausted || sch?.waitlisted)
                  hasWaitlist = true;
                else hasAvailable = true;
              }
              const variant: SuccessVariant =
                hasWaitlist && hasAvailable
                  ? "mixed"
                  : hasWaitlist
                    ? "waitlist"
                    : "confirmed";
              onNavigate?.("success", variant);
            }}
          >
            {ctaLabel()}
          </Button>
        </div>
      </div>
    </div>
  );
}
