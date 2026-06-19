import { useState } from 'react';
import { Menu, X, ChevronDown, Smartphone, Monitor } from 'lucide-react';
import styles from './PrototypeApp.module.css';
import { AuthScreen } from './screens/AuthScreen';
import { SelectionScreenE, type ScenarioId } from './screens/SelectionScreenE';
import { SuccessScreen, type SuccessVariant } from './screens/SuccessScreen';
import { OnSiteSelectionScreen } from './screens/OnSiteSelectionScreen';
import { OnSiteAuthScreen } from './screens/OnSiteAuthScreen';
import { OnSiteOTPScreen } from './screens/OnSiteOTPScreen';
import { LinkOTPScreen } from './screens/LinkOTPScreen';
import { OnSiteSuccessScreen } from './screens/OnSiteSuccessScreen';
import { ReservationListScreen } from './screens/ReservationListScreen';
import { ReservationCancelScreen } from './screens/ReservationCancelScreen';
import { ReservationRescheduleScreen } from './screens/ReservationRescheduleScreen';
import { ReservationSuccessScreen, type ReservationSuccessVariant } from './screens/ReservationSuccessScreen';
import { WalkInAuthScreen } from './screens/WalkInAuthScreen';
import { WalkInSuccessScreen } from './screens/WalkInSuccessScreen';
import { SurveyFormScreen } from './screens/SurveyFormScreen';
import { SurveySuccessScreen, type SurveySuccessVariant } from './screens/SurveySuccessScreen';
import { ProfessionalConfirmationScreen } from './screens/ProfessionalConfirmationScreen';
import { ProfessionalSuccessScreen, type ProfessionalSuccessVariant } from './screens/ProfessionalSuccessScreen';
import { ProfessionalReportScreen } from './screens/ProfessionalReportScreen';
import { ProfessionalReportSuccessScreen } from './screens/ProfessionalReportSuccessScreen';
import { ProfessionalSurveyScreen, type EventSurvey } from './screens/ProfessionalSurveyScreen';
import { LinkExpiredScreen } from './screens/LinkExpiredScreen';
import { EmailSurveyScreen } from './screens/EmailSurveyScreen';
import { EmailSurveyEmpresaScreen } from './screens/EmailSurveyEmpresaScreen';
import { ProfessionalAttendanceScreen } from './screens/ProfessionalAttendanceScreen';
import { ProfessionalCheckinScreen } from './screens/ProfessionalCheckinScreen';
import { ProfessionalCheckinSuccessScreen } from './screens/ProfessionalCheckinSuccessScreen';
import { OnSiteEventDetailScreen } from './screens/OnSiteEventDetailScreen';

type ProfessionalConfirmationVariant = 'normal' | 'full' | 'answered-confirmed' | 'answered-declined' | 'answered-partial';

type ScreenId =
  | 'auth'
  | 'select-e'
  | 'link-otp'
  | 'success'
  | 'onsite-select'
  | 'onsite-auth'
  | 'onsite-otp'
  | 'onsite-success'
  | 'reservation-list'
  | 'reservation-cancel'
  | 'reservation-cancel-success'
  | 'reservation-reschedule'
  | 'reservation-reschedule-success'
  | 'walkin-auth'
  | 'walkin-success'
  | 'survey-form'
  | 'survey-success'
  | 'professional-confirmation'
  | 'professional-success'
  | 'professional-report'
  | 'professional-report-success'
  | 'professional-survey-form'
  | 'professional-survey-success'
  | 'professional-survey-blocked'
  | 'link-expired'
  | 'link-expired-pro'
  | 'email-survey'
  | 'empresa-email-recorrente'
  | 'empresa-email-pos-evento'
  | 'professional-attendance'
  | 'professional-checkin'
  | 'professional-checkin-success'
  | 'onsite-event-detail';

type Viewport = 'mobile' | 'desktop';

interface ScreenVariant {
  scenario: ScenarioId;
  label: string;
  successVariant?: SuccessVariant;
  reservationSuccessVariant?: ReservationSuccessVariant;
  surveySuccessVariant?: SurveySuccessVariant;
  professionalSuccessVariant?: ProfessionalSuccessVariant;
  professionalConfirmationVariant?: ProfessionalConfirmationVariant;
}

interface Screen {
  id: ScreenId;
  label: string;
  implemented: boolean;
  variants?: ScreenVariant[];
}

interface Journey {
  id: string;
  label: string;
  screens: Screen[];
}

interface Actor {
  id: string;
  label: string;
  journeys: Journey[];
}

const ACTORS: Actor[] = [
  {
    id: 'beneficiario',
    label: 'Beneficiário',
    journeys: [
      {
        id: 'agendamento-link',
        label: 'Jornada - Agendamento',
        screens: [
          { id: 'link-expired', label: 'Link Expirado', implemented: true },
          { id: 'auth', label: 'BEN-02 Formulário de Inscrição no Serviço', implemented: true },
          {
            id: 'select-e',
            label: 'BEN-01 Agenda Pública — Seleção de Serviço e Horário',
            implemented: true,
            variants: [
              { scenario: 'A', label: 'A - Padrão' },
              { scenario: 'B', label: 'B - Dias esgotados' },
              { scenario: 'C', label: 'C - Serviço único' },
              { scenario: 'D', label: 'D - Evento de 1 dia' },
            ],
          },
          { id: 'link-otp', label: 'Código OTP', implemented: true },
          {
            id: 'success',
            label: 'BEN-03 Confirmação de Inscrição',
            implemented: true,
            variants: [
              { scenario: 'A' as ScenarioId, label: 'A, Agendamento confirmado', successVariant: 'confirmed' as SuccessVariant },
              { scenario: 'B' as ScenarioId, label: 'B, Lista de espera',        successVariant: 'waitlist'  as SuccessVariant },
              { scenario: 'C' as ScenarioId, label: 'C, Agendamento + Espera',   successVariant: 'mixed'     as SuccessVariant },
            ],
          },
        ],
      },
      {
        id: 'agendamento-local',
        label: 'Agendamento no Local',
        screens: [
          { id: 'onsite-select',       label: 'Lista de eventos',   implemented: true },
          { id: 'onsite-event-detail', label: 'Detalhe do evento',  implemented: true },
          { id: 'onsite-auth',         label: 'Autenticação',        implemented: true },
          { id: 'onsite-otp',    label: 'Código OTP',    implemented: true },
          {
            id: 'onsite-success',
            label: 'Sucesso',
            implemented: true,
            variants: [
              { scenario: 'A' as ScenarioId, label: 'A, Confirmado',           successVariant: 'confirmed' as SuccessVariant },
              { scenario: 'B' as ScenarioId, label: 'B, Lista de espera',       successVariant: 'waitlist'  as SuccessVariant },
              { scenario: 'C' as ScenarioId, label: 'C, Agendamento + Espera',  successVariant: 'mixed'     as SuccessVariant },
            ],
          },
        ],
      },
      {
        id: 'gerenciamento-reserva',
        label: 'Gerenciamento de Reserva',
        screens: [
          {
            id: 'reservation-list',
            label: 'Minhas Reservas',
            implemented: true,
            variants: [
              { scenario: 'A', label: 'A, 1 serviço confirmado' },
              { scenario: 'B', label: 'B, Lista de espera' },
              { scenario: 'C', label: 'C, Múltiplos serviços' },
            ],
          },
          { id: 'reservation-cancel',         label: 'Cancelamento',              implemented: true },
          { id: 'reservation-cancel-success',  label: 'Sucesso do cancelamento',   implemented: true },
          { id: 'reservation-reschedule',      label: 'Reagendamento',             implemented: true },
          {
            id: 'reservation-reschedule-success',
            label: 'Sucesso do reagendamento',
            implemented: true,
            variants: [
              { scenario: 'A', label: 'A, Confirmado',       reservationSuccessVariant: 'rescheduled'          },
              { scenario: 'B', label: 'B, Lista de espera',  reservationSuccessVariant: 'rescheduled-waitlist' },
            ],
          },
        ],
      },
      {
        id: 'encaixe',
        label: 'Encaixe',
        screens: [
          { id: 'walkin-auth',    label: 'Dados do Cliente',   implemented: true },
          { id: 'walkin-success', label: 'Sucesso',            implemented: true },
        ],
      },
      {
        id: 'pesquisa-pos-atendimento',
        label: 'Pesquisa Pós-Atendimento',
        screens: [
          { id: 'email-survey',     label: 'E-mail convite', implemented: true },
          { id: 'link-expired-pro', label: 'Link Expirado',  implemented: true },
          {
            id: 'survey-form',
            label: 'BEN-07 Responder Pesquisa de Satisfação',
            implemented: true,
            variants: [
              { scenario: 'A', label: 'A, Serviço único' },
              { scenario: 'B', label: 'B, Múltiplos serviços' },
            ],
          },
          {
            id: 'survey-success',
            label: 'Agradecimento',
            implemented: true,
            variants: [
              { scenario: 'A', label: 'A, Avaliação positiva', surveySuccessVariant: 'positive' },
              { scenario: 'B', label: 'B, Avaliação neutra',   surveySuccessVariant: 'neutral'  },
            ],
          },
        ],
      },
    ],
  },
  { id: 'operador-rh',     label: 'Admin',          journeys: [] },
  {
    id: 'profissional',
    label: 'Profissional',
    journeys: [
      {
        id: 'confirmacao-participacao',
        label: 'Confirmação de Participação',
        screens: [
          { id: 'link-expired', label: 'Link Expirado', implemented: true },
          {
            id: 'professional-confirmation',
            label: 'PRO-01 Aceite/Recusa de Vaga',
            implemented: true,
            variants: [
              { scenario: 'A', label: 'A, Formulário de disponibilidade',  professionalConfirmationVariant: 'normal'            },
              { scenario: 'B', label: 'B, Evento lotado',                   professionalConfirmationVariant: 'full'              },
              { scenario: 'C', label: 'C, Já respondido — Confirmado',      professionalConfirmationVariant: 'answered-confirmed' },
              { scenario: 'D', label: 'D, Já respondido — Recusado',        professionalConfirmationVariant: 'answered-declined'  },
              { scenario: 'E', label: 'E, Já respondido — Parcial',         professionalConfirmationVariant: 'answered-partial'   },
            ],
          },
          {
            id: 'professional-success',
            label: 'Resposta',
            implemented: true,
            variants: [
              { scenario: 'A', label: 'A, Participação confirmada',  professionalSuccessVariant: 'confirmed'   },
              { scenario: 'B', label: 'B, Disponibilidade parcial',  professionalSuccessVariant: 'partial'     },
              { scenario: 'C', label: 'C, Não pode participar',      professionalSuccessVariant: 'unavailable' },
            ],
          },
        ],
      },
      {
        id: 'checkin-evento',
        label: 'Check-in Evento',
        screens: [
          { id: 'professional-checkin',         label: 'Check-in',  implemented: true },
          { id: 'professional-checkin-success', label: 'Sucesso',   implemented: true },
        ],
      },
      {
        id: 'pos-evento',
        label: 'Pós-evento',
        screens: [
          { id: 'link-expired-pro',            label: 'Link Expirado', implemented: true },
          { id: 'professional-report',         label: 'PRO-02 Relatório Final', implemented: true },
          { id: 'professional-report-success', label: 'Sucesso',       implemented: true },
        ],
      },
      {
        id: 'gerenciar-atendimentos',
        label: 'Gerenciar Atendimentos',
        screens: [
          { id: 'professional-attendance', label: 'Meus Atendimentos', implemented: true },
        ],
      },
    ],
  },
  {
    id: 'gestor',
    label: 'Empresa',
    journeys: [
      {
        id: 'pesquisa-pos-evento',
        label: 'Pesquisa Pós-Evento',
        screens: [
          { id: 'empresa-email-recorrente', label: 'E-mail – Recorrente', implemented: true },
          { id: 'empresa-email-pos-evento', label: 'E-mail – Pós-evento',  implemented: true },
          { id: 'link-expired', label: 'Link Expirado', implemented: true },
          {
            id: 'professional-survey-form',
            label: 'Formulário',
            implemented: true,
          },
          {
            id: 'professional-survey-success',
            label: 'Sucesso',
            implemented: true,
            variants: [
              { scenario: 'A', label: 'A, Avaliação positiva', surveySuccessVariant: 'positive' },
              { scenario: 'B', label: 'B, Avaliação neutra',   surveySuccessVariant: 'neutral'  },
            ],
          },
          {
            id: 'professional-survey-blocked',
            label: 'Bloqueado',
            implemented: true,
          },
        ],
      },
    ],
  },
];

// ─── Thumbnails ───────────────────────────────────────────

const THUMB_W         = 88;
const VARIANT_THUMB_W = 64;
const VIEWPORT_W      = 375;
const THUMB_SCALE     = THUMB_W / VIEWPORT_W;
const VARIANT_SCALE   = VARIANT_THUMB_W / VIEWPORT_W;

function ScreenThumbnail({
  id, implemented, scenario, successVariant, reservationSuccessVariant, reservationScenario,
  surveySuccessVariant, professionalSuccessVariant, professionalConfirmationVariant,
  small = false,
}: {
  id: ScreenId;
  implemented: boolean;
  scenario?: ScenarioId;
  successVariant?: SuccessVariant;
  reservationSuccessVariant?: ReservationSuccessVariant;
  reservationScenario?: ScenarioId;
  surveySuccessVariant?: SurveySuccessVariant;
  professionalSuccessVariant?: ProfessionalSuccessVariant;
  professionalConfirmationVariant?: ProfessionalConfirmationVariant;
  small?: boolean;
}) {
  if (!implemented) {
    return (
      <div
        className={styles.thumbPlaceholder}
        style={small ? { width: VARIANT_THUMB_W, height: Math.round(VARIANT_THUMB_W * 0.66) } : undefined}
      />
    );
  }
  const w     = small ? VARIANT_THUMB_W : THUMB_W;
  const h     = Math.round(w * 0.66);
  const scale = small ? VARIANT_SCALE : THUMB_SCALE;

  return (
    <div className={styles.thumbContainer} style={{ width: w, height: h }}>
      <div
        className={styles.thumbScaler}
        style={{ transform: `scale(${scale})`, width: VIEWPORT_W }}
      >
        {id === 'auth'           && <AuthScreen />}
        {id === 'select-e'       && <SelectionScreenE scenario={scenario ?? 'A'} />}
        {id === 'link-otp'       && <LinkOTPScreen />}
        {id === 'success'        && <SuccessScreen variant={successVariant ?? 'confirmed'} />}
        {id === 'onsite-select'       && <OnSiteSelectionScreen />}
        {id === 'onsite-event-detail' && <OnSiteEventDetailScreen />}
        {id === 'onsite-auth'    && <OnSiteAuthScreen />}
        {id === 'onsite-otp'     && <OnSiteOTPScreen />}
        {id === 'onsite-success' && <OnSiteSuccessScreen variant={successVariant ?? 'confirmed'} />}
        {id === 'reservation-list'             && <ReservationListScreen scenario={reservationScenario ?? scenario ?? 'C'} />}
        {id === 'reservation-cancel'           && <ReservationCancelScreen reservationId="massage" />}
        {id === 'reservation-cancel-success'   && <ReservationSuccessScreen variant="cancelled" reservationId="massage" />}
        {id === 'reservation-reschedule'       && <ReservationRescheduleScreen reservationId="massage" />}
        {id === 'reservation-reschedule-success' && <ReservationSuccessScreen variant={reservationSuccessVariant ?? 'rescheduled'} reservationId="massage" />}
        {id === 'walkin-auth'    && <WalkInAuthScreen />}
        {id === 'walkin-success' && <WalkInSuccessScreen />}
        {id === 'survey-form'    && <SurveyFormScreen scenario={scenario as 'A' | 'B' | undefined ?? 'A'} />}
        {id === 'survey-success' && <SurveySuccessScreen variant={surveySuccessVariant ?? 'positive'} />}
        {id === 'professional-confirmation' && <ProfessionalConfirmationScreen variant={professionalConfirmationVariant ?? 'normal'} />}
        {id === 'professional-success' && <ProfessionalSuccessScreen variant={professionalSuccessVariant ?? 'confirmed'} />}
        {id === 'professional-report' && <ProfessionalReportScreen />}
        {id === 'professional-report-success' && <ProfessionalReportSuccessScreen />}
        {id === 'professional-survey-form' && <ProfessionalSurveyScreen viewport="desktop" survey={{ id: 'PSQ-PRO-001', eventName: 'Pesquisa Pós-Evento', eventDate: '13/04/2026', location: 'São Paulo, SP' }} forceView="form" respondentName="Ana Silva" />}
        {id === 'professional-survey-success' && <ProfessionalSurveyScreen viewport="desktop" survey={{ id: 'PSQ-PRO-001', eventName: 'Pesquisa Pós-Evento', eventDate: '13/04/2026', location: 'São Paulo, SP' }} forceView="success" forceSuccessVariant={surveySuccessVariant ?? 'positive'} respondentName="Ana Silva" />}
        {id === 'professional-survey-blocked' && <ProfessionalSurveyScreen viewport="desktop" survey={{ id: 'PSQ-PRO-001', eventName: 'Pesquisa Pós-Evento', eventDate: '13/04/2026', location: 'São Paulo, SP' }} forceView="blocked" respondentName="João Silva" />}
        {id === 'link-expired'     && <LinkExpiredScreen />}
        {id === 'link-expired-pro' && <LinkExpiredScreen hideAction />}
        {id === 'email-survey'               && <EmailSurveyScreen />}
        {id === 'empresa-email-recorrente'   && <EmailSurveyEmpresaScreen variant="recorrente" />}
        {id === 'empresa-email-pos-evento'   && <EmailSurveyEmpresaScreen variant="pos-evento" />}
        {id === 'professional-attendance' && <ProfessionalAttendanceScreen />}
        {id === 'professional-checkin'         && <ProfessionalCheckinScreen />}
        {id === 'professional-checkin-success' && <ProfessionalCheckinSuccessScreen />}
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────

type ActorFilter = 'all' | 'beneficiario' | 'profissional' | 'admin' | 'empresa';

export function PrototypeApp() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeScreen, setActiveScreen]         = useState<ScreenId>('auth');
  const [activeScenario, setActiveScenario]     = useState<ScenarioId>('A');
  const [activeSuccess, setActiveSuccess]       = useState<SuccessVariant>('confirmed');
  const [onsiteVariant, setOnsiteVariant]       = useState<SuccessVariant>('confirmed');
  const [viewport, setViewport]                 = useState<Viewport>('mobile');
  const [actorFilter, setActorFilter]           = useState<ActorFilter>('all');

  // ── Reservation state ────────────────────────────────────
  const [reservationListScenario, setReservationListScenario] = useState<ScenarioId>('C');
  const [selectedReservationId, setSelectedReservationId]     = useState<string>('massage');
  const [rescheduleVariant, setRescheduleVariant]             = useState<ReservationSuccessVariant>('rescheduled');
  const [rescheduledDayTime, setRescheduledDayTime]           = useState<string | undefined>(undefined);

  // ── Survey state ──────────────────────────────────────────
  const [surveyScenario, setSurveyScenario]             = useState<'A' | 'B'>('A');
  const [surveySuccessVariant, setSurveySuccessVariant] = useState<SurveySuccessVariant>('positive');

  // ── Professional state ────────────────────────────────────
  const [professionalConfirmationVariant, setProfessionalConfirmationVariant] = useState<ProfessionalConfirmationVariant>('normal');
  const [professionalSuccessVariant, setProfessionalSuccessVariant] = useState<ProfessionalSuccessVariant>('confirmed');

  // ── Professional Survey state ──────────────────────────────
  const [professionalSurveySuccessVariant, setProfessionalSurveySuccessVariant] = useState<SurveySuccessVariant>('positive');

  const [openActors,   setOpenActors]   = useState<Set<string>>(new Set(['beneficiario']));
  const [openJourneys, setOpenJourneys] = useState<Set<string>>(new Set(['agendamento-link']));
  const [openVariants, setOpenVariants] = useState<Set<ScreenId>>(new Set(['select-e', 'success', 'onsite-success', 'reservation-list', 'reservation-reschedule-success', 'survey-form', 'survey-success', 'professional-success', 'professional-survey-success']));

  function toggleActor(id: string) {
    setOpenActors(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function toggleJourney(id: string) {
    setOpenJourneys(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function toggleVariants(id: ScreenId) {
    setOpenVariants(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function navigateTo(screen: Screen, scenario?: ScenarioId, success?: SuccessVariant, reservationSuccess?: ReservationSuccessVariant, surveySuccess?: SurveySuccessVariant, professionalSuccess?: ProfessionalSuccessVariant, professionalConfirmation?: ProfessionalConfirmationVariant) {
    if (!screen.implemented) return;
    setActiveScreen(screen.id);

    if (scenario) {
      if (screen.id === 'survey-form')      setSurveyScenario(scenario as 'A' | 'B');
      else if (screen.id === 'reservation-list') setReservationListScenario(scenario);
      else setActiveScenario(scenario);
    } else if (screen.id === 'select-e')         setActiveScenario('A');
    else if (screen.id === 'reservation-list')   setReservationListScenario('C');
    else if (screen.id === 'survey-form')        setSurveyScenario('A');

    if (success) {
      setActiveSuccess(success);
      setOnsiteVariant(success);
    } else if (screen.id === 'success')        setActiveSuccess('confirmed');
    else if (screen.id === 'onsite-success')   setOnsiteVariant('confirmed');

    if (reservationSuccess) {
      setRescheduleVariant(reservationSuccess);
    } else if (screen.id === 'reservation-reschedule-success') setRescheduleVariant('rescheduled');

    if (surveySuccess) {
      setSurveySuccessVariant(surveySuccess);
    } else if (screen.id === 'survey-success') setSurveySuccessVariant('positive');

    if (professionalSuccess) {
      setProfessionalSuccessVariant(professionalSuccess);
    } else if (screen.id === 'professional-success') setProfessionalSuccessVariant('confirmed');

    if (professionalConfirmation) {
      setProfessionalConfirmationVariant(professionalConfirmation);
    } else if (screen.id === 'professional-confirmation') setProfessionalConfirmationVariant('normal');

    if (surveySuccess && screen.id === 'professional-survey-success') {
      setProfessionalSurveySuccessVariant(surveySuccess);
    } else if (screen.id === 'professional-survey-success') setProfessionalSurveySuccessVariant('positive');

    if (window.innerWidth <= 640) setSidebarCollapsed(true);
  }

  function isVariantActive(screen: Screen, variant: ScreenVariant): boolean {
    if (screen.id === 'success')          return activeScreen === 'success' && activeSuccess === variant.successVariant;
    if (screen.id === 'onsite-success')   return activeScreen === 'onsite-success' && onsiteVariant === variant.successVariant;
    if (screen.id === 'reservation-list') return activeScreen === 'reservation-list' && reservationListScenario === variant.scenario;
    if (screen.id === 'reservation-reschedule-success') return activeScreen === 'reservation-reschedule-success' && rescheduleVariant === variant.reservationSuccessVariant;
    if (screen.id === 'survey-form')           return activeScreen === 'survey-form' && surveyScenario === variant.scenario;
    if (screen.id === 'survey-success')        return activeScreen === 'survey-success' && surveySuccessVariant === variant.surveySuccessVariant;
    if (screen.id === 'professional-confirmation') return activeScreen === 'professional-confirmation' && professionalConfirmationVariant === variant.professionalConfirmationVariant;
    if (screen.id === 'professional-success')  return activeScreen === 'professional-success' && professionalSuccessVariant === variant.professionalSuccessVariant;
    if (screen.id === 'professional-survey-success')  return activeScreen === 'professional-survey-success' && professionalSurveySuccessVariant === variant.surveySuccessVariant;
    return activeScreen === screen.id && activeScenario === variant.scenario;
  }

  return (
    <div className={styles.shell}>
      {/* Sidebar */}
      <nav className={[styles.sidebar, sidebarCollapsed ? styles.sidebarCollapsed : ''].join(' ')}>
        <div className={styles.sidebarInner}>
          <div className={styles.sidebarHeader}>
            <span className={styles.sidebarLabel}>Protótipo Prana</span>
          </div>

          {/* Ator Filter */}
          <div style={{ padding: '16px', backgroundColor: '#FFF3E0', borderBottom: '3px solid #FF9800' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#E65100', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>🎯 Selecione um Ator:</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[
                { id: 'all' as ActorFilter, label: 'Todos' },
                { id: 'beneficiario' as ActorFilter, label: 'Beneficiário' },
                { id: 'profissional' as ActorFilter, label: 'Profissional' },
                { id: 'admin' as ActorFilter, label: 'Admin' },
                { id: 'empresa' as ActorFilter, label: 'Empresa' },
              ].map(option => (
                <button
                  key={option.id}
                  onClick={() => setActorFilter(option.id)}
                  style={{
                    padding: '10px 12px',
                    fontSize: '13px',
                    fontWeight: actorFilter === option.id ? 'bold' : '500',
                    backgroundColor: actorFilter === option.id ? '#2196F3' : '#FFFFFF',
                    color: actorFilter === option.id ? '#FFFFFF' : '#1976D2',
                    border: '2px solid #2196F3',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: actorFilter === option.id ? '0 2px 8px rgba(33, 150, 243, 0.3)' : 'none',
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.sidebarBody}>
            {ACTORS.filter(actor => {
              if (actorFilter === 'all') return true;
              if (actorFilter === 'beneficiario') return actor.id === 'beneficiario';
              if (actorFilter === 'profissional') return actor.id === 'profissional';
              if (actorFilter === 'admin') return actor.id === 'operador-rh';
              if (actorFilter === 'empresa') return actor.id === 'gestor';
              return false;
            }).map(actor => {
              const isActorOpen = openActors.has(actor.id);
              return (
                <div key={actor.id} className={styles.actor}>
                  <button
                    className={styles.actorHeader}
                    onClick={() => toggleActor(actor.id)}
                    aria-expanded={isActorOpen}
                  >
                    <span className={styles.actorLabel}>{actor.label}</span>
                    <ChevronDown
                      size={14}
                      className={[styles.chevron, isActorOpen ? styles.chevronOpen : ''].filter(Boolean).join(' ')}
                    />
                  </button>

                  {isActorOpen && (
                    <div className={styles.actorBody}>
                      {actor.journeys.length === 0 ? (
                        <p className={styles.emptyJourneys}>Nenhuma jornada mapeada</p>
                      ) : (
                        actor.journeys.map(journey => {
                          const isJourneyOpen = openJourneys.has(journey.id);
                          return (
                            <div key={journey.id} className={styles.journey}>
                              <button
                                className={styles.journeyHeader}
                                onClick={() => toggleJourney(journey.id)}
                                aria-expanded={isJourneyOpen}
                              >
                                <span className={styles.journeyLabel}>{journey.label}</span>
                                <ChevronDown
                                  size={12}
                                  className={[styles.chevron, isJourneyOpen ? styles.chevronOpen : ''].filter(Boolean).join(' ')}
                                />
                              </button>

                              {isJourneyOpen && (
                                <ul className={styles.screenList}>
                                  {journey.screens.map((screen, index) => {
                                    const isActive     = screen.id === activeScreen && screen.implemented;
                                    const hasVariants  = !!screen.variants?.length;
                                    const variantsOpen = hasVariants && openVariants.has(screen.id);

                                    return (
                                      <li key={screen.id}>
                                        <div
                                          className={[
                                            styles.screenItem,
                                            isActive && !hasVariants ? styles.active : '',
                                            !screen.implemented ? styles.disabled : '',
                                          ].filter(Boolean).join(' ')}
                                          onClick={() => {
                                            if (hasVariants) toggleVariants(screen.id);
                                            navigateTo(screen);
                                          }}
                                        >
                                          <div className={[styles.thumbWrap, isActive && !hasVariants ? styles.thumbWrapActive : ''].filter(Boolean).join(' ')}>
                                            <ScreenThumbnail
                                              id={screen.id}
                                              implemented={screen.implemented}
                                              scenario={screen.id === 'survey-form' ? surveyScenario : activeScenario}
                                              successVariant={screen.id === 'onsite-success' ? onsiteVariant : activeSuccess}
                                              reservationScenario={reservationListScenario}
                                              reservationSuccessVariant={rescheduleVariant}
                                              surveySuccessVariant={surveySuccessVariant}
                                              professionalSuccessVariant={professionalSuccessVariant}
                                              professionalConfirmationVariant={professionalConfirmationVariant}
                                            />
                                          </div>
                                          <div className={styles.screenMeta}>
                                            <span className={styles.screenNumber}>{index + 1}</span>
                                            <span className={styles.screenLabel}>{screen.label}</span>
                                          </div>
                                          {hasVariants && (
                                            <ChevronDown
                                              size={12}
                                              className={[styles.chevron, variantsOpen ? styles.chevronOpen : ''].filter(Boolean).join(' ')}
                                              style={{ marginLeft: 'auto', flexShrink: 0 }}
                                            />
                                          )}
                                        </div>

                                        {variantsOpen && screen.variants && (
                                          <ul className={styles.variantList}>
                                            {screen.variants.map(variant => {
                                              const active = isVariantActive(screen, variant);
                                              return (
                                                <li
                                                  key={variant.label}
                                                  className={[
                                                    styles.variantItem,
                                                    active ? styles.variantItemActive : '',
                                                  ].filter(Boolean).join(' ')}
                                                  onClick={() => navigateTo(screen, variant.scenario, variant.successVariant, variant.reservationSuccessVariant, variant.surveySuccessVariant, variant.professionalSuccessVariant, variant.professionalConfirmationVariant)}
                                                >
                                                  <div className={[styles.thumbWrap, active ? styles.thumbWrapActive : ''].filter(Boolean).join(' ')}>
                                                    <ScreenThumbnail
                                                      id={screen.id}
                                                      implemented={true}
                                                      scenario={variant.scenario}
                                                      successVariant={variant.successVariant}
                                                      reservationSuccessVariant={variant.reservationSuccessVariant}
                                                      surveySuccessVariant={variant.surveySuccessVariant}
                                                      professionalSuccessVariant={variant.professionalSuccessVariant}
                                                      professionalConfirmationVariant={variant.professionalConfirmationVariant}
                                                      reservationScenario={variant.scenario}
                                                      small
                                                    />
                                                  </div>
                                                  <span className={styles.variantLabel}>{variant.label}</span>
                                                </li>
                                              );
                                            })}
                                          </ul>
                                        )}
                                      </li>
                                    );
                                  })}
                                </ul>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Botão sidebar */}
      <button
        className={styles.toggleBtn}
        onClick={() => setSidebarCollapsed(c => !c)}
        aria-label={sidebarCollapsed ? 'Abrir menu' : 'Fechar menu'}
      >
        {sidebarCollapsed ? <Menu size={18} /> : <X size={18} />}
      </button>

      {/* Main */}
      <div className={styles.mainWrapper}>
        <div className={styles.toolbar}>
          <span className={styles.toolbarLabel}>Viewport</span>
          <div className={styles.viewportToggle}>
            <button
              className={[styles.vpBtn, viewport === 'mobile' ? styles.vpBtnActive : ''].filter(Boolean).join(' ')}
              onClick={() => setViewport('mobile')}
              title="Mobile (375px)"
            >
              <Smartphone size={15} /><span>Mobile</span>
            </button>
            <button
              className={[styles.vpBtn, viewport === 'desktop' ? styles.vpBtnActive : ''].filter(Boolean).join(' ')}
              onClick={() => setViewport('desktop')}
              title="Desktop"
            >
              <Monitor size={15} /><span>Desktop</span>
            </button>
          </div>
        </div>

        <main className={styles.main}>
          <div className={[styles.frame, viewport === 'mobile' ? styles.frameMobile : styles.frameDesktop].join(' ')}>
            {activeScreen === 'auth'     && <AuthScreen viewport={viewport} onNavigate={(screen) => setActiveScreen(screen as ScreenId)} />}
            {activeScreen === 'select-e' && <SelectionScreenE viewport={viewport} scenario={activeScenario} onNavigate={(_, successVariant) => { setActiveScreen('link-otp'); setActiveSuccess(successVariant); }} />}
            {activeScreen === 'link-otp' && <LinkOTPScreen viewport={viewport} onNavigate={() => setActiveScreen('success')} />}
            {activeScreen === 'success'  && <SuccessScreen viewport={viewport} variant={activeSuccess} />}

            {activeScreen === 'onsite-select'  && <OnSiteSelectionScreen viewport={viewport} onNavigate={(_, variant) => { setOnsiteVariant(variant); setActiveScreen('onsite-auth'); }} />}
            {activeScreen === 'onsite-event-detail' && <OnSiteEventDetailScreen viewport={viewport} onNavigate={(_, variant) => { setOnsiteVariant(variant); setActiveScreen('onsite-auth'); }} />}
            {activeScreen === 'onsite-auth'    && <OnSiteAuthScreen viewport={viewport} onNavigate={() => setActiveScreen('onsite-otp')} />}
            {activeScreen === 'onsite-otp'     && <OnSiteOTPScreen viewport={viewport} onNavigate={() => setActiveScreen('onsite-success')} />}
            {activeScreen === 'onsite-success' && <OnSiteSuccessScreen viewport={viewport} variant={onsiteVariant} />}

            {activeScreen === 'reservation-list' && (
              <ReservationListScreen
                viewport={viewport}
                scenario={reservationListScenario}
                onReschedule={(id) => { setSelectedReservationId(id); setActiveScreen('reservation-reschedule'); }}
              />
            )}
            {activeScreen === 'reservation-cancel' && (
              <ReservationCancelScreen
                viewport={viewport}
                reservationId={selectedReservationId}
                onConfirm={() => setActiveScreen('reservation-cancel-success')}
                onBack={() => setActiveScreen('reservation-list')}
              />
            )}
            {activeScreen === 'reservation-cancel-success' && (
              <ReservationSuccessScreen
                viewport={viewport}
                variant="cancelled"
                reservationId={selectedReservationId}
              />
            )}
            {activeScreen === 'reservation-reschedule' && (
              <ReservationRescheduleScreen
                viewport={viewport}
                reservationId={selectedReservationId}
                onNavigate={(variant, newDayTime) => {
                  setRescheduleVariant(variant);
                  setRescheduledDayTime(newDayTime);
                  setActiveScreen('reservation-reschedule-success');
                }}
              />
            )}
            {activeScreen === 'reservation-reschedule-success' && (
              <ReservationSuccessScreen
                viewport={viewport}
                variant={rescheduleVariant}
                reservationId={selectedReservationId}
                newDayTime={rescheduledDayTime}
              />
            )}
            {activeScreen === 'walkin-auth' && (
              <WalkInAuthScreen
                viewport={viewport}
                onNavigate={() => setActiveScreen('walkin-success')}
              />
            )}
            {activeScreen === 'walkin-success' && (
              <WalkInSuccessScreen viewport={viewport} />
            )}
            {activeScreen === 'survey-form' && (
              <SurveyFormScreen
                viewport={viewport}
                scenario={surveyScenario}
                onNavigate={(variant) => { setSurveySuccessVariant(variant); setActiveScreen('survey-success'); }}
              />
            )}
            {activeScreen === 'survey-success' && (
              <SurveySuccessScreen viewport={viewport} variant={surveySuccessVariant} />
            )}
            {activeScreen === 'professional-confirmation' && (
              <ProfessionalConfirmationScreen
                viewport={viewport}
                variant={professionalConfirmationVariant}
                onNavigate={(v) => { setProfessionalSuccessVariant(v); setActiveScreen('professional-success'); }}
              />
            )}
            {activeScreen === 'professional-success' && (
              <ProfessionalSuccessScreen viewport={viewport} variant={professionalSuccessVariant} />
            )}
            {activeScreen === 'professional-report' && (
              <ProfessionalReportScreen
                viewport={viewport}
                onNavigate={() => setActiveScreen('professional-report-success')}
              />
            )}
            {activeScreen === 'professional-report-success' && (
              <ProfessionalReportSuccessScreen viewport={viewport} />
            )}
            {activeScreen === 'professional-survey-form' && (
              <ProfessionalSurveyScreen
                viewport={viewport as 'mobile' | 'desktop'}
                survey={{ id: 'PSQ-PRO-001', eventName: 'Pesquisa Pós-Evento', eventDate: '13/04/2026', location: 'São Paulo, SP' }}
                forceView="form"
                respondentName="Ana Silva"
              />
            )}
            {activeScreen === 'professional-survey-success' && (
              <ProfessionalSurveyScreen
                viewport={viewport as 'mobile' | 'desktop'}
                survey={{ id: 'PSQ-PRO-001', eventName: 'Pesquisa Pós-Evento', eventDate: '13/04/2026', location: 'São Paulo, SP' }}
                forceView="success"
                forceSuccessVariant={professionalSurveySuccessVariant}
                respondentName="Ana Silva"
              />
            )}
            {activeScreen === 'professional-survey-blocked' && (
              <ProfessionalSurveyScreen
                viewport={viewport as 'mobile' | 'desktop'}
                survey={{ id: 'PSQ-PRO-001', eventName: 'Pesquisa Pós-Evento', eventDate: '13/04/2026', location: 'São Paulo, SP' }}
                forceView="blocked"
                respondentName="João Silva"
              />
            )}
            {activeScreen === 'link-expired' && (
              <LinkExpiredScreen viewport={viewport} />
            )}
            {activeScreen === 'link-expired-pro' && (
              <LinkExpiredScreen viewport={viewport} hideAction />
            )}
            {activeScreen === 'email-survey' && (
              <EmailSurveyScreen viewport={viewport} />
            )}
            {activeScreen === 'empresa-email-recorrente' && (
              <EmailSurveyEmpresaScreen variant="recorrente" viewport={viewport} />
            )}
            {activeScreen === 'empresa-email-pos-evento' && (
              <EmailSurveyEmpresaScreen variant="pos-evento" viewport={viewport} />
            )}
            {activeScreen === 'professional-attendance' && (
              <ProfessionalAttendanceScreen viewport={viewport} />
            )}
            {activeScreen === 'professional-checkin' && (
              <ProfessionalCheckinScreen
                viewport={viewport}
                onNavigate={() => setActiveScreen('professional-checkin-success')}
              />
            )}
            {activeScreen === 'professional-checkin-success' && (
              <ProfessionalCheckinSuccessScreen viewport={viewport} />
            )}
            {!(['auth', 'select-e', 'link-otp', 'success', 'onsite-select', 'onsite-event-detail', 'onsite-auth', 'onsite-otp', 'onsite-success', 'reservation-list', 'reservation-cancel', 'reservation-cancel-success', 'reservation-reschedule', 'reservation-reschedule-success', 'walkin-auth', 'walkin-success', 'survey-form', 'survey-success', 'professional-confirmation', 'professional-success', 'professional-report', 'professional-report-success', 'professional-survey-form', 'professional-survey-success', 'professional-survey-blocked', 'link-expired', 'link-expired-pro', 'email-survey', 'empresa-email-recorrente', 'empresa-email-pos-evento', 'professional-attendance', 'professional-checkin', 'professional-checkin-success'] as const).includes(activeScreen) && (
              <AuthScreen viewport={viewport} onNavigate={(screen) => setActiveScreen(screen as ScreenId)} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
