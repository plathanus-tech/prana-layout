// TELA: Detalhe do Evento
// ROLES COM ACESSO: admin, empresa
// PERMISSÕES:
//   admin   → CRM read-only + Config editável (Editar/Salvar abaixo das tabs) + aba Relatório
//   empresa → CRM read-only + Config somente leitura + aba Relatório desabilitada

import { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, Pencil, Check, X, ChevronDown, ChevronRight,
  MapPin, Mail, Users, Calendar, Search, SlidersHorizontal,
  BarChart2, ClipboardList, Star, AlertCircle,
  Send, UserPlus, Clock, List, Trash2, TrendingUp, Activity, Heart, Target, Download,
} from 'lucide-react';
import { Sidebar } from '../../../components/Sidebar/Sidebar';
import { Feedback } from '../../../components/Feedback/Feedback';
import { Table } from '../../../components/Table/Table';
import type { TableColumn } from '../../../components/Table/Table';
import type { EventItem, UserRole } from './EventsScreen';
import styles from './EventDetailScreen.module.css';
import tooltipStyles from '../../../components/Tooltip/Tooltip.module.css';

// ─── Types ────────────────────────────────────────────────────────────────────
type DetailTab   = 'visao-geral' | 'profissionais' | 'agendamentos' | 'avaliacao' | 'relatorio';
type ConfigStatus = 'pendente' | 'enviado';

interface DaySchedule {
  day:   string; // ex: '13/04'
  start: string; // ex: '08:00'
  end:   string; // ex: '17:00'
}

interface SurveyConfig {
  model: string; // chave de SURVEY_MODELS
  delay: string; // chave de DELAY_OPTIONS
}

interface ServiceConfig {
  name:     string;
  repasse:  number;  // valor em R$ (não %)
  duration: number;  // minutos
}

interface EventDetail {
  // — CRM (somente leitura) ——————————————————————————————————————————————————
  services:    string[];
  days:        string;
  hours:       string;
  location:    string;
  responsible: string;
  notes:       string;  // visível apenas para admin
  // — Configuração (editável pelo admin) ————————————————————————————————————
  emailPrimary:    string;
  emailSecondary:  string;
  configEmail:     string;
  configSchedule:     DaySchedule[];
  intervalFrequency:  string;  // ex: '1h30' — frequência de recorrência do intervalo de ajuste
  intervalDuration:   number;  // minutos    — duração de cada pausa
  lunchStart:         string;
  lunchEnd:        string;
  serviceConfig:   ServiceConfig[];
  survey: {
    beneficiario: SurveyConfig;
    profissional: SurveyConfig;
    empresa:      SurveyConfig;
  };
  helpCostText: string;

  // — Dados de Avaliação ────────────────────────────────────────────────────────
  npsData?: {
    npsScore: number;
    trend: string;
    trendDir: 'up' | 'down';
  };
  participationData?: {
    total: number;
    attended: number;
    percentage: number;
    trend: string;
    trendDir: 'up' | 'down';
  };
  collaboratorsImpacted?: {
    count: number;
    trend: string;
    trendDir: 'up' | 'down';
  };
  ibeScore?: {
    score: number;
    trend: string;
    trendDir: 'up' | 'down';
  };
  evaluationHistory?: Array<{
    period: string;
    nps: number;
    ibe: number;
  }>;
  serviceRatings?: Array<{
    name: string;
    rating: number;
  }>;
  radarDimensions?: Array<{
    axis: string;
    value: number;
  }>;
  evaluationComments?: Array<{
    text: string;
    author: string;
  }>;
  participationByDay?: Array<{ label: string; convidados: number; presentes: number }>;
  benchmarkData?: {
    eventScore: number;
    benchmarkScore: number;
    delta: number;
    positive: boolean;
  };
}

// ─── Opções de pesquisa ──────────────────────────────────────────────────────
const SURVEY_MODELS = [
  { value: 'nao-enviar',  label: 'Não enviar pesquisa'  },
  { value: 'nps-padrao',  label: 'NPS Padrão'           },
  { value: 'satisfacao',  label: 'Satisfação Detalhada' },
  { value: 'quick-check', label: 'Quick Check'           },
  { value: 'pos-evento',  label: 'Pós-Evento Completo'  },
] as const;

const DELAY_OPTIONS = [
  { value: '2h',         label: '2 h após o evento'       },
  { value: '24h',        label: '24 h após o evento'      },
  { value: '48h',        label: '48 h após o evento'      },
  { value: '1sem',       label: '1 semana após o evento'  },
  { value: 'recorrente', label: 'Recorrente (1× por mês)' },
] as const;

function surveyModelLabel(v: string) { return SURVEY_MODELS.find(m => m.value === v)?.label ?? v; }
function delayLabel(v: string)       { return DELAY_OPTIONS.find(d => d.value === v)?.label  ?? v; }

// ─── Mock de detalhes ─────────────────────────────────────────────────────────
const DEFAULT_DETAIL: EventDetail = {
  services: ['Quick Massage'],
  days: '—',
  hours: '08h às 17h',
  location: 'Presencial — a confirmar',
  responsible: 'Equipe Prana',
  notes: '',
  emailPrimary: 'contato@prana.com.br',
  emailSecondary: '',
  configEmail: 'evento@app.prana.com.br',
  configSchedule: [{ day: 'Dia 01', start: '08:00', end: '17:00' }],
  intervalFrequency: '1h',
  intervalDuration: 5,
  lunchStart: '12:00',
  lunchEnd: '13:00',
  serviceConfig: [{ name: 'Quick Massage', repasse: 120, duration: 15 }],
  survey: {
    beneficiario: { model: 'nps-padrao',  delay: '24h' },
    profissional:  { model: 'pos-evento', delay: '48h' },
    empresa:       { model: 'nao-enviar', delay: '24h' },
  },
  helpCostText: '',
};

const MOCK_DETAIL: Record<string, EventDetail> = {
  'EVT-001': {
    services: ['Quick Massage', 'Acupuntura', 'Podologia'],
    days: '13, 14 e 15 de abril de 2026',
    hours: '08h às 17h',
    location: 'Presencial — Av. Faria Lima, 3400, 9º andar · São Paulo - SP',
    responsible: 'Carolina Mendes',
    notes: 'Cliente VIP · Prioridade alta. Confirmar acesso com segurança 30 min antes do início. Estacionamento disponível no subsolo — solicitar credencial na recepção.',
    emailPrimary: 'carolina.mendes@prana.com.br',
    emailSecondary: 'sipat.itau@prana.com.br',
    configEmail: 'sipat-itau@app.prana.com.br',
    configSchedule: [
      { day: '13/04', start: '08:00', end: '17:00' },
      { day: '14/04', start: '08:00', end: '17:00' },
      { day: '15/04', start: '08:00', end: '15:00' },
    ],
    intervalFrequency: '1h30',
    intervalDuration: 10,
    lunchStart: '12:00',
    lunchEnd: '13:00',
    serviceConfig: [
      { name: 'Quick Massage', repasse: 120, duration: 15 },
      { name: 'Acupuntura',    repasse: 180, duration: 30 },
      { name: 'Podologia',     repasse: 150, duration: 25 },
    ],
    survey: {
      beneficiario: { model: 'nps-padrao',  delay: '24h'       },
      profissional:  { model: 'pos-evento', delay: '48h'       },
      empresa:       { model: 'satisfacao', delay: '24h'       },
    },
    helpCostText: 'R$ 50,00 por profissional · válido para deslocamento acima de 50 km',

    // — Dados de Avaliação ────────────────────────────────────────────────────
    npsData: {
      npsScore: 82,
      trend: '+5 pts',
      trendDir: 'up' as const,
    },
    participationData: {
      total: 250,
      attended: 208,
      percentage: 83,
      trend: '+6%',
      trendDir: 'up' as const,
    },
    collaboratorsImpacted: {
      count: 1240,
      trend: '+180',
      trendDir: 'up' as const,
    },
    ibeScore: {
      score: 7.8,
      trend: '+0.4',
      trendDir: 'up' as const,
    },
    evaluationHistory: [
      { period: 'Semana 1', nps: 70, ibe: 71 },
      { period: 'Semana 2', nps: 75, ibe: 74 },
      { period: 'Semana 3', nps: 82, ibe: 78 },
    ],
    serviceRatings: [
      { name: 'Quick Massage', rating: 9.2 },
      { name: 'Acupuntura',    rating: 8.7 },
      { name: 'Podologia',     rating: 8.1 },
    ],
    participationByDay: [
      { label: '13/04', convidados: 90, presentes: 75 },
      { label: '14/04', convidados: 90, presentes: 80 },
      { label: '15/04', convidados: 70, presentes: 53 },
    ],
    radarDimensions: [
      { axis: 'Bem-estar',   value: 8.2 },
      { axis: 'Relaxamento', value: 7.8 },
      { axis: 'Foco',        value: 7.1 },
      { axis: 'Engajamento', value: 8.5 },
      { axis: 'Clima',       value: 9.0 },
    ],
    evaluationComments: [
      { text: 'A meditação transformou meu dia! Muito relaxante e inspirador.', author: 'Colaborador · TI' },
      { text: 'Adorei a massagem, aliviou minhas dores nas costas. Voltarei com certeza!', author: 'Colaborador · RH' },
      { text: 'Excelente evento. Timing perfeito e profissionais muito atenciosos.', author: 'Colaborador · Financeiro' },
      { text: 'A ginástica laboral foi incrível! Recomendo para todos da empresa.', author: 'Colaborador · Operações' },
    ],
    benchmarkData: {
      eventScore: 8.2,
      benchmarkScore: 7.1,
      delta: 1.1,
      positive: true,
    },
  },
  'EVT-002': {
    services: ['Meditação Guiada', 'Yoga Corporativo'],
    days: '14 e 15 de abril de 2026',
    hours: '09h às 18h',
    location: 'Presencial — Rod. Anhanguera, km 30, Cajamar - SP',
    responsible: 'Bruno Almeida',
    notes: 'Confirmar número de participantes com RH da Natura até 48h antes.',
    emailPrimary: 'bruno.almeida@prana.com.br',
    emailSecondary: '',
    configEmail: 'saude-natura@app.prana.com.br',
    configSchedule: [
      { day: '14/04', start: '09:00', end: '18:00' },
      { day: '15/04', start: '09:00', end: '18:00' },
    ],
    intervalFrequency: '2h',
    intervalDuration: 10,
    lunchStart: '12:30',
    lunchEnd: '13:30',
    serviceConfig: [
      { name: 'Meditação Guiada', repasse: 150, duration: 45 },
      { name: 'Yoga Corporativo', repasse: 160, duration: 60 },
    ],
    survey: {
      beneficiario: { model: 'nps-padrao',  delay: '24h' },
      profissional:  { model: 'pos-evento', delay: '48h' },
      empresa:       { model: 'nao-enviar', delay: '24h' },
    },
    helpCostText: '',
  },
  'EVT-003': {
    services: ['Quick Massage', 'Ginástica Laboral', 'Nutrição'],
    days: '20 e 21 de maio de 2026',
    hours: '07h às 16h',
    location: 'Presencial — Rua Eugênio Guidotti, 220 · Jaguariúna - SP',
    responsible: 'Fernanda Costa',
    notes: 'Confirmar local com facilities da Ambev. Solicitar mesas para atendimento de Quick Massage.',
    emailPrimary: 'fernanda.costa@prana.com.br',
    emailSecondary: 'dia-saude@ambev.com.br',
    configEmail: 'dia-saude-ambev@app.prana.com.br',
    configSchedule: [
      { day: '20/05', start: '07:00', end: '16:00' },
      { day: '21/05', start: '07:00', end: '16:00' },
    ],
    intervalFrequency: '1h30',
    intervalDuration: 5,
    lunchStart: '11:30',
    lunchEnd: '12:30',
    serviceConfig: [
      { name: 'Quick Massage',     repasse: 120, duration: 15 },
      { name: 'Ginástica Laboral', repasse: 100, duration: 30 },
      { name: 'Nutrição',          repasse: 130, duration: 20 },
    ],
    survey: {
      beneficiario: { model: 'nps-padrao',  delay: '24h' },
      profissional:  { model: 'pos-evento', delay: '48h' },
      empresa:       { model: 'satisfacao', delay: '1sem' },
    },
    helpCostText: 'R$ 45,00 por profissional · inclui refeição no local',
  },
  'EVT-005': {
    services: ['Ginástica Laboral', 'Quick Massage'],
    days: '10 e 11 de março de 2026',
    hours: '08h às 17h',
    location: 'Presencial — Av. Paulista, 1374 · São Paulo - SP',
    responsible: 'Mariana Fonseca',
    notes: 'Evento concluído.',
    emailPrimary: 'mariana.fonseca@prana.com.br',
    emailSecondary: '',
    configEmail: 'ginastica-bradesco@app.prana.com.br',
    configSchedule: [
      { day: '10/03', start: '08:00', end: '17:00' },
      { day: '11/03', start: '08:00', end: '17:00' },
    ],
    intervalFrequency: '1h',
    intervalDuration: 10,
    lunchStart: '12:00',
    lunchEnd: '13:00',
    serviceConfig: [
      { name: 'Ginástica Laboral', repasse: 130, duration: 30 },
      { name: 'Quick Massage',     repasse: 120, duration: 15 },
    ],
    survey: {
      beneficiario: { model: 'nps-padrao',  delay: '24h' },
      profissional:  { model: 'pos-evento', delay: '48h' },
      empresa:       { model: 'satisfacao', delay: '24h' },
    },
    helpCostText: '',

    // — Dados de Avaliação ────────────────────────────────────────────────────
    npsData: {
      npsScore: 78,
      trend: '+3 pts',
      trendDir: 'up' as const,
    },
    participationData: {
      total: 180,
      attended: 162,
      percentage: 90,
      trend: '+8%',
      trendDir: 'up' as const,
    },
    collaboratorsImpacted: {
      count: 320,
      trend: '+42',
      trendDir: 'up' as const,
    },
    ibeScore: {
      score: 8.1,
      trend: '+0.6',
      trendDir: 'up' as const,
    },
    evaluationHistory: [
      { period: 'Dia 10', nps: 72, ibe: 76 },
      { period: 'Dia 11', nps: 78, ibe: 81 },
    ],
    participationByDay: [
      { label: '10/03', convidados: 90, presentes: 81 },
      { label: '11/03', convidados: 90, presentes: 81 },
    ],
    serviceRatings: [
      { name: 'Ginástica Laboral', rating: 9.4 },
      { name: 'Quick Massage',     rating: 8.9 },
    ],
    radarDimensions: [
      { axis: 'Bem-estar',   value: 8.8 },
      { axis: 'Relaxamento', value: 8.1 },
      { axis: 'Foco',        value: 7.9 },
      { axis: 'Engajamento', value: 9.0 },
      { axis: 'Clima',       value: 8.5 },
    ],
    evaluationComments: [
      { text: 'A ginástica laboral foi ótima para aliviar as tensões do dia a dia!', author: 'Colaborador · Operações' },
      { text: 'Quick Massage incrível! Me sinto muito mais disposta para trabalhar.', author: 'Colaboradora · TI' },
      { text: 'Excelente iniciativa da empresa. Profissionais muito capacitados.', author: 'Colaborador · RH' },
    ],
    benchmarkData: {
      eventScore: 8.1,
      benchmarkScore: 7.1,
      delta: 1.0,
      positive: true,
    },
  },
};

// ─── Profissionais — tipos e mocks ───────────────────────────────────────────
type ProfissionalStatus = 'confirmado' | 'pendente' | 'recusado';

interface Profissional {
  id:            string;
  name:          string;
  func:          string;         // função profissional
  tag:           string;         // especialidade / categoria
  status:        ProfissionalStatus;
  partialDays?:  string[];       // ex: ['seg', 'qua', 'sex']
  repasse:       number;         // R$ — valor atual do repasse
  rating?:       number;         // média de avaliação (ex: 4.2) — eventos concluídos
  ratingCount?:  number;         // quantidade de avaliações recebidas
}

// Configuração visual de cada status (tokens do design system via inline style)
const PROF_STATUS_CFG: Record<ProfissionalStatus, {
  label: string; bg: string; border: string; color: string;
}> = {
  confirmado: { label: 'Confirmado', bg: 'var(--color-status-success-bg)', border: 'var(--color-green-300)', color: 'var(--color-status-success-fg)' },
  pendente:   { label: 'Pendente',   bg: 'var(--color-status-warning-bg)', border: '#FDE047',                color: 'var(--color-status-warning-fg)' },
  recusado:   { label: 'Recusado',   bg: 'var(--color-status-error-bg)',   border: 'var(--color-red-300)',   color: 'var(--color-status-error-fg)'   },
};

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

// Escala padrão do produto: 5→Excelente · 4→Muito bom · 3→Regular · 2→Ruim · 1→Muito ruim
function ratingLabel(score: number): string {
  if (score >= 4.5) return 'Excelente';
  if (score >= 3.5) return 'Muito bom';
  if (score >= 2.5) return 'Regular';
  if (score >= 1.5) return 'Ruim';
  return 'Muito ruim';
}

const MOCK_PROFISSIONAIS: Record<string, Profissional[]> = {
  'EVT-001': [
    { id:'p1', name:'Ana Silva',      func:'Massoterapeuta',    tag:'Quick Massage', status:'confirmado', repasse:120 },
    { id:'p2', name:'Bruno Costa',    func:'Acupunturista',     tag:'Acupuntura',    status:'pendente',   repasse:180, partialDays:['seg','qua','sex'] },
    { id:'p3', name:'Carlos Lima',    func:'Podólogo',          tag:'Podologia',     status:'confirmado', repasse:150 },
    { id:'p4', name:'Diana Melo',     func:'Massoterapeuta',    tag:'Quick Massage', status:'confirmado', repasse:120 },
    { id:'p5', name:'Eduardo Santos', func:'Acupunturista',     tag:'Acupuntura',    status:'pendente',   repasse:180, partialDays:['ter','qui'] },
    { id:'p6', name:'Fernanda Alves', func:'Massoterapeuta',    tag:'Quick Massage', status:'pendente',   repasse:120 },
    { id:'p7', name:'Gabriel Rocha',  func:'Podólogo',          tag:'Podologia',     status:'pendente',   repasse:150 },
    { id:'p8', name:'Helena Torres',  func:'Massoterapeuta',    tag:'Quick Massage', status:'recusado',   repasse:120 },
  ],
  'EVT-002': [
    { id:'p1', name:'Isabela Nunes',  func:'Instrutora de Yoga',   tag:'Yoga Corporativo',  status:'confirmado', repasse:160 },
    { id:'p2', name:'João Ferreira',  func:'Facilitador',          tag:'Meditação Guiada',  status:'confirmado', repasse:150 },
    { id:'p3', name:'Kelly Ramos',    func:'Instrutora de Yoga',   tag:'Yoga Corporativo',  status:'pendente',   repasse:160, partialDays:['seg','ter'] },
    { id:'p4', name:'Lucas Barbosa',  func:'Facilitador',          tag:'Meditação Guiada',  status:'confirmado', repasse:150 },
    { id:'p5', name:'Mariana Souza',  func:'Instrutora de Yoga',   tag:'Yoga Corporativo',  status:'pendente',   repasse:160 },
    { id:'p6', name:'Nicolas Assis',  func:'Facilitador',          tag:'Meditação Guiada',  status:'recusado',   repasse:150 },
  ],
  'EVT-003': [
    { id:'p1', name:'Olívia Castro',  func:'Instrutora',           tag:'Ginástica Laboral', status:'confirmado', repasse:100 },
    { id:'p2', name:'Pedro Monteiro', func:'Massoterapeuta',       tag:'Quick Massage',     status:'confirmado', repasse:120 },
    { id:'p3', name:'Quirino Dias',   func:'Nutricionista',        tag:'Nutrição',          status:'pendente',   repasse:130 },
    { id:'p4', name:'Renata Lopes',   func:'Instrutora',           tag:'Ginástica Laboral', status:'pendente',   repasse:100 },
    { id:'p5', name:'Sandro Vieira',  func:'Massoterapeuta',       tag:'Quick Massage',     status:'pendente',   repasse:120 },
  ],
  'EVT-005': [
    { id:'p1', name:'Ana Beatriz',    func:'Instrutora',           tag:'Ginástica Laboral', status:'confirmado', repasse:130, rating:4.8, ratingCount:22 },
    { id:'p2', name:'Carlos Souza',   func:'Massoterapeuta',       tag:'Quick Massage',     status:'confirmado', repasse:120, rating:4.5, ratingCount:18 },
    { id:'p3', name:'Diana Freitas',  func:'Massoterapeuta',       tag:'Quick Massage',     status:'confirmado', repasse:120, rating:3.7, ratingCount:15 },
    { id:'p4', name:'Érica Lima',     func:'Instrutora',           tag:'Ginástica Laboral', status:'confirmado', repasse:130, rating:4.9, ratingCount:25 },
    { id:'p5', name:'Felipe Neto',    func:'Massoterapeuta',       tag:'Quick Massage',     status:'confirmado', repasse:120, rating:4.1, ratingCount:12 },
    { id:'p6', name:'Gabriela Assis', func:'Instrutora',           tag:'Ginástica Laboral', status:'confirmado', repasse:130, rating:5.0, ratingCount:20 },
  ],
};

// ─── Base de profissionais disponíveis (mock) ────────────────────────────────
interface DBProfessional {
  id:         string;
  name:       string;
  func:       string;
  rating:     number;
  eventsDone: number;
  gender:     'M' | 'F';
  distance:   number;  // km do local do evento
}

const MOCK_DB_PROFS: DBProfessional[] = [
  { id:'db01', name:'Amanda Ferreira',  func:'Massoterapeuta', rating:4.8, eventsDone:32, gender:'F', distance:5  },
  { id:'db02', name:'Ricardo Pinto',    func:'Acupunturista',  rating:4.5, eventsDone:18, gender:'M', distance:8  },
  { id:'db03', name:'Tatiane Melo',     func:'Nutricionista',  rating:4.3, eventsDone:25, gender:'F', distance:12 },
  { id:'db04', name:'Marco Antônio',    func:'Podólogo',       rating:4.1, eventsDone:40, gender:'M', distance:22 },
  { id:'db05', name:'Camila Rocha',     func:'Instrutora',     rating:4.9, eventsDone:55, gender:'F', distance:3  },
  { id:'db06', name:'João Victor',      func:'Massoterapeuta', rating:3.9, eventsDone:12, gender:'M', distance:7  },
  { id:'db07', name:'Priscila Santos',  func:'Nutricionista',  rating:4.6, eventsDone:28, gender:'F', distance:15 },
  { id:'db08', name:'Fábio Lima',       func:'Facilitador',    rating:4.4, eventsDone:20, gender:'M', distance:9  },
  { id:'db09', name:'Natália Costa',    func:'Instrutora',     rating:4.7, eventsDone:35, gender:'F', distance:6  },
  { id:'db10', name:'Augusto Ramos',    func:'Acupunturista',  rating:4.2, eventsDone:15, gender:'M', distance:28 },
];

// ─── Agendamentos — types ─────────────────────────────────────────────────────
type BookingStatus = 'confirmed' | 'waitlist';

interface Booking {
  id:          string;
  beneficiary: string;
  service:     string;
  day:         string;      // 'DD/MM'
  time:        string;      // 'HH:MM'
  status:      BookingStatus;
  noShow?:     boolean;     // didn't attend; slot used for encaixe
  encaixeFor?: string;      // id of the noShow booking this replaced
}

interface ComputedSlot {
  key:        string;       // `${day}|${time}|${service}`
  day:        string;
  time:       string;
  service:    string;
  capacity:   number;
  confirmed:  Booking[];   // active confirmed (not noShow, not encaixe)
  noShows:    Booking[];   // noShow = true
  encaixes:   Booking[];   // encaixeFor set
  waitlist:   Booking[];
  isFull:     boolean;
  hasEncaixe: boolean;
}

// ─── Service pill colour palette ──────────────────────────────────────────────
const SVC_PILL: Record<string, { bg: string; border: string; color: string }> = {
  'Quick Massage':    { bg:'var(--color-brand-50)',             border:'var(--color-brand-200)',  color:'var(--color-brand-700)'          },
  'Acupuntura':       { bg:'var(--color-status-info-bg)',       border:'var(--color-blue-200,#BFDBFE)', color:'var(--color-status-info-fg)' },
  'Podologia':        { bg:'var(--color-status-success-bg)',    border:'var(--color-green-300)',   color:'var(--color-status-success-fg)' },
  'Meditação Guiada': { bg:'var(--color-brand-50)',             border:'var(--color-brand-200)',  color:'var(--color-brand-700)'          },
  'Yoga Corporativo': { bg:'#EDE9FE',                           border:'#C4B5FD',                 color:'#6D28D9'                        },
  'Ginástica Laboral':{ bg:'#FFF7ED',                           border:'#FED7AA',                 color:'#C2410C'                        },
  'Nutrição':         { bg:'var(--color-status-success-bg)',    border:'var(--color-green-300)',   color:'var(--color-status-success-fg)' },
};
function svcPill(s: string) {
  return SVC_PILL[s] ?? { bg:'var(--color-gray-100)', border:'var(--color-gray-300)', color:'var(--color-text-secondary)' };
}

// ─── Mock bookings ─────────────────────────────────────────────────────────────
const MOCK_BOOKINGS: Record<string, Booking[]> = {
  'EVT-001': [
    // ── 13/04 Quick Massage (cap 2) ──────────────────────────────────────────
    { id:'bk001', beneficiary:'Alice Souza',      service:'Quick Massage', day:'13/04', time:'08:00', status:'confirmed' },
    { id:'bk002', beneficiary:'Bruno Carvalho',   service:'Quick Massage', day:'13/04', time:'08:00', status:'confirmed' },
    { id:'bk003', beneficiary:'Carla Mendes',     service:'Quick Massage', day:'13/04', time:'08:15', status:'confirmed' },
    { id:'bk004', beneficiary:'Daniel Faria',     service:'Quick Massage', day:'13/04', time:'08:15', status:'confirmed' },
    // 08:30 lotado + 1 na espera
    { id:'bk005', beneficiary:'Eloisa Torres',    service:'Quick Massage', day:'13/04', time:'08:30', status:'confirmed' },
    { id:'bk006', beneficiary:'Fábio Ramos',      service:'Quick Massage', day:'13/04', time:'08:30', status:'confirmed' },
    { id:'bk007', beneficiary:'Giovana Lima',     service:'Quick Massage', day:'13/04', time:'08:30', status:'waitlist'  },
    // 09:00 — encaixe: Jorge não compareceu, Karen assumiu
    { id:'bk008', beneficiary:'Helena Vieira',    service:'Quick Massage', day:'13/04', time:'09:00', status:'confirmed' },
    { id:'bk009', beneficiary:'Jorge Lima',       service:'Quick Massage', day:'13/04', time:'09:00', status:'confirmed', noShow:true },
    { id:'bk010', beneficiary:'Karen Neves',      service:'Quick Massage', day:'13/04', time:'09:00', status:'confirmed', encaixeFor:'bk009' },
    // 09:15 — 1 vaga livre
    { id:'bk011', beneficiary:'Luísa Prado',      service:'Quick Massage', day:'13/04', time:'09:15', status:'confirmed' },
    // ── 13/04 Acupuntura (cap 1) ─────────────────────────────────────────────
    { id:'bk012', beneficiary:'Marcos Santana',   service:'Acupuntura',   day:'13/04', time:'08:00', status:'confirmed' },
    { id:'bk013', beneficiary:'Natália Costa',    service:'Acupuntura',   day:'13/04', time:'08:30', status:'confirmed' },
    { id:'bk014', beneficiary:'Otávio Melo',      service:'Acupuntura',   day:'13/04', time:'09:00', status:'confirmed' },
    { id:'bk015', beneficiary:'Paula Andrade',    service:'Acupuntura',   day:'13/04', time:'09:00', status:'waitlist'  },
    // ── 13/04 Podologia (cap 1) ──────────────────────────────────────────────
    { id:'bk016', beneficiary:'Rafael Cunha',     service:'Podologia',    day:'13/04', time:'08:00', status:'confirmed' },
    { id:'bk017', beneficiary:'Sara Oliveira',    service:'Podologia',    day:'13/04', time:'08:25', status:'confirmed' },
    // ── 14/04 ────────────────────────────────────────────────────────────────
    { id:'bk018', beneficiary:'Thiago Barbosa',   service:'Quick Massage', day:'14/04', time:'08:00', status:'confirmed' },
    { id:'bk019', beneficiary:'Úrsula Freitas',   service:'Quick Massage', day:'14/04', time:'08:00', status:'confirmed' },
    { id:'bk020', beneficiary:'Victor Sousa',     service:'Quick Massage', day:'14/04', time:'08:15', status:'confirmed' },
    { id:'bk021', beneficiary:'Wendy Castro',     service:'Acupuntura',   day:'14/04', time:'08:00', status:'confirmed' },
    { id:'bk022', beneficiary:'Xavier Lopes',     service:'Podologia',    day:'14/04', time:'08:00', status:'confirmed' },
    // ── 15/04 ────────────────────────────────────────────────────────────────
    { id:'bk023', beneficiary:'Yara Monteiro',    service:'Quick Massage', day:'15/04', time:'08:00', status:'confirmed' },
    { id:'bk024', beneficiary:'Zé Alberto',       service:'Acupuntura',   day:'15/04', time:'08:00', status:'confirmed' },
    { id:'bk025', beneficiary:'Ana Paula Silva',  service:'Podologia',    day:'15/04', time:'08:00', status:'confirmed' },
  ],
  'EVT-002': [
    { id:'bk101', beneficiary:'Carolina Mendes',  service:'Meditação Guiada',  day:'14/04', time:'09:00', status:'confirmed' },
    { id:'bk102', beneficiary:'Diego Torres',     service:'Meditação Guiada',  day:'14/04', time:'09:45', status:'confirmed' },
    { id:'bk103', beneficiary:'Elisa Rocha',      service:'Yoga Corporativo',  day:'14/04', time:'09:00', status:'confirmed' },
    { id:'bk104', beneficiary:'Fernando Dias',    service:'Yoga Corporativo',  day:'14/04', time:'10:00', status:'confirmed' },
    { id:'bk105', beneficiary:'Gabriela Santos',  service:'Meditação Guiada',  day:'15/04', time:'09:00', status:'confirmed' },
    { id:'bk106', beneficiary:'Henrique Lima',    service:'Yoga Corporativo',  day:'15/04', time:'09:00', status:'confirmed' },
    { id:'bk107', beneficiary:'Isabela Nunes',    service:'Yoga Corporativo',  day:'15/04', time:'10:00', status:'waitlist'  },
  ],
  'EVT-003': [
    { id:'bk201', beneficiary:'João Victor',      service:'Quick Massage',     day:'20/05', time:'07:00', status:'confirmed' },
    { id:'bk202', beneficiary:'Karen Assis',      service:'Quick Massage',     day:'20/05', time:'07:15', status:'confirmed' },
    { id:'bk203', beneficiary:'Larissa Monteiro', service:'Ginástica Laboral', day:'20/05', time:'07:00', status:'confirmed' },
    { id:'bk204', beneficiary:'Marcelo Freitas',  service:'Nutrição',          day:'20/05', time:'07:00', status:'confirmed' },
    { id:'bk205', beneficiary:'Natasha Ramos',    service:'Quick Massage',     day:'21/05', time:'07:00', status:'confirmed' },
    { id:'bk206', beneficiary:'Orlando Silva',    service:'Ginástica Laboral', day:'21/05', time:'07:00', status:'confirmed' },
    { id:'bk207', beneficiary:'Patricia Costa',   service:'Nutrição',          day:'21/05', time:'07:00', status:'confirmed' },
    { id:'bk208', beneficiary:'Quintino Alves',   service:'Nutrição',          day:'21/05', time:'07:20', status:'waitlist'  },
  ],
  'EVT-005': [
    { id:'bk301', beneficiary:'Roberta Lima',     service:'Quick Massage',     day:'15/03', time:'08:00', status:'confirmed' },
    { id:'bk302', beneficiary:'Sérgio Matos',     service:'Quick Massage',     day:'15/03', time:'08:15', status:'confirmed' },
    { id:'bk303', beneficiary:'Tatiane Rocha',    service:'Ginástica Laboral', day:'15/03', time:'08:00', status:'confirmed' },
    { id:'bk304', beneficiary:'Ubiratan Costa',   service:'Quick Massage',     day:'15/03', time:'08:30', status:'confirmed' },
    { id:'bk305', beneficiary:'Vera Lúcia',       service:'Ginástica Laboral', day:'15/03', time:'08:30', status:'confirmed' },
    // encaixe: Wanderley não compareceu, Xenia fez encaixe
    { id:'bk306', beneficiary:'Wanderley Nunes',  service:'Quick Massage',     day:'15/03', time:'09:00', status:'confirmed', noShow:true },
    { id:'bk307', beneficiary:'Xenia Ferreira',   service:'Quick Massage',     day:'15/03', time:'09:00', status:'confirmed', encaixeFor:'bk306' },
    { id:'bk308', beneficiary:'Yasmin Oliveira',  service:'Ginástica Laboral', day:'15/03', time:'09:00', status:'confirmed' },
    { id:'bk309', beneficiary:'Zilda Martins',    service:'Quick Massage',     day:'15/03', time:'09:15', status:'confirmed' },
  ],
};

// ─── Agendamentos — helpers ───────────────────────────────────────────────────

function timeToMin(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}
function minToTime(m: number): string {
  return `${String(Math.floor(m / 60)).padStart(2,'0')}:${String(m % 60).padStart(2,'0')}`;
}

function generateTimeSlots(
  start: string, end: string,
  durationMin: number,
  lunchStart: string, lunchEnd: string,
): string[] {
  const slots: string[] = [];
  const endM = timeToMin(end);
  const lS   = timeToMin(lunchStart);
  const lE   = timeToMin(lunchEnd);
  let cur    = timeToMin(start);
  while (cur + durationMin <= endM) {
    if (cur >= lS && cur < lE) { cur = lE; continue; }
    slots.push(minToTime(cur));
    cur += durationMin;
  }
  return slots;
}

function getServiceCapacity(service: string, eventId: string): number {
  const profs = MOCK_PROFISSIONAIS[eventId] ?? [];
  const n = profs.filter(p => p.tag === service && p.status === 'confirmado').length;
  return Math.max(n, 1);
}

// ─── Capacity status helper ────────────────────────────────────────────────────
type CapacityStatus = 'available' | 'waitlist' | 'full';

function getCapacityStatus(activeCount: number, capacity: number, waitlistCount: number): CapacityStatus {
  if (activeCount >= capacity) {
    return waitlistCount > 0 ? 'waitlist' : 'full';
  }
  return 'available';
}

function computeTotalVagas(detail: EventDetail, eventId: string): number {
  let total = 0;
  for (const svc of detail.serviceConfig) {
    const cap = getServiceCapacity(svc.name, eventId);
    for (const day of detail.configSchedule) {
      const slots = generateTimeSlots(day.start, day.end, svc.duration, detail.lunchStart, detail.lunchEnd);
      total += slots.length * cap;
    }
  }
  return total;
}

function computeSlots(
  bookings: Booking[],
  detail: EventDetail,
  eventId: string,
  filterService: string,
  filterDay: string,
): ComputedSlot[] {
  type SlotAcc = { confirmed: Booking[]; noShows: Booking[]; encaixes: Booking[]; waitlist: Booking[] };
  const map = new Map<string, SlotAcc>();

  for (const b of bookings) {
    if (filterService && b.service !== filterService) continue;
    if (filterDay    && b.day     !== filterDay)     continue;
    const key = `${b.day}|${b.time}|${b.service}`;
    if (!map.has(key)) map.set(key, { confirmed:[], noShows:[], encaixes:[], waitlist:[] });
    const slot = map.get(key)!;
    if      (b.status === 'waitlist') slot.waitlist.push(b);
    else if (b.noShow)                slot.noShows.push(b);
    else if (b.encaixeFor)            slot.encaixes.push(b);
    else                              slot.confirmed.push(b);
  }

  const dayOrder = detail.configSchedule.map(d => d.day);
  return [...map.entries()]
    .map(([key, data]) => {
      const [day, time, service] = key.split('|');
      const cap    = getServiceCapacity(service, eventId);
      const active = data.confirmed.length + data.encaixes.length;
      return {
        key, day, time, service, capacity: cap,
        ...data,
        isFull:     active >= cap,
        hasEncaixe: data.encaixes.length > 0,
      };
    })
    .sort((a, b) => {
      const di = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
      return di !== 0 ? di : a.time.localeCompare(b.time);
    });
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS: { id: DetailTab; label: string; icon: React.ReactNode }[] = [
  { id: 'visao-geral',   label: 'Visão Geral',   icon: <ClipboardList size={14} /> },
  { id: 'profissionais', label: 'Profissionais', icon: <Users size={14} />         },
  { id: 'agendamentos',  label: 'Agendamentos',  icon: <Calendar size={14} />      },
  { id: 'avaliacao',     label: 'Avaliação',     icon: <Star size={14} />          },
  { id: 'relatorio',     label: 'Relatório',     icon: <BarChart2 size={14} />     },
];

// ─── Helper: campo de leitura ─────────────────────────────────────────────────
function Field({ label, children, fullWidth }: {
  label: string;
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div className={[styles.field, fullWidth ? styles.fieldFull : ''].filter(Boolean).join(' ')}>
      <span className={styles.fieldLabel}>{label}</span>
      <span className={styles.fieldValue}>{children}</span>
    </div>
  );
}

// ─── EditInput / EditSelect helpers ──────────────────────────────────────────
function EditInput({ value, onChange, placeholder, type = 'text' }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      className={styles.editInput}
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
    />
  );
}

function EditSelect({ value, onChange, options, fullWidth }: {
  value: string;
  onChange: (v: string) => void;
  options: readonly { value: string; label: string }[];
  fullWidth?: boolean;
}) {
  return (
    <div className={[styles.editSelectWrap, fullWidth ? styles.editSelectWrapFull : ''].filter(Boolean).join(' ')}>
      <select
        className={[styles.editSelect, fullWidth ? styles.editSelectExpand : ''].filter(Boolean).join(' ')}
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown size={13} className={styles.editSelectChevron} />
    </div>
  );
}

// ─── CRM Section ─────────────────────────────────────────────────────────────
function CRMSection({ event, detail, role }: {
  event: EventItem;
  detail: EventDetail;
  role: UserRole;
}) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionTitle}>Informações do Evento</span>
        <span className={styles.sectionBadge}>CRM · Somente leitura</span>
      </div>
      <div className={styles.fieldsGrid}>
        <Field label="Nome do evento">  {event.name}    </Field>
        <Field label="Empresa cliente">{event.company}  </Field>
        <Field label="Data(s)">        {detail.days}    </Field>
        <Field label="Horário">        {detail.hours}   </Field>
        <Field label="Local / Modalidade" fullWidth>
          <span className={styles.locationValue}>
            <MapPin size={12} className={styles.locationIcon} />
            {detail.location}
          </span>
        </Field>
        <Field label="Serviços oferecidos" fullWidth>
          <div className={styles.serviceTags}>
            {detail.services.map(s => (
              <span key={s} className={styles.serviceTag}>{s}</span>
            ))}
          </div>
        </Field>
        <Field label="Responsável Prana">{detail.responsible}</Field>
        {role === 'adm' && detail.notes && (
          <Field label="Anotações (interno)" fullWidth>
            <span className={styles.notesValue}>{detail.notes}</span>
          </Field>
        )}
      </div>
    </div>
  );
}

// ─── Config Section ───────────────────────────────────────────────────────────
function ConfigSection({ role, detail, editMode, ev, setEv }: {
  role:      UserRole;
  detail:    EventDetail;
  editMode:  boolean;
  ev:        EventDetail;      // valores exibidos (editValues quando em modo edição, detail caso contrário)
  setEv:     React.Dispatch<React.SetStateAction<EventDetail>>;
}) {
  const canEdit = role === 'adm' && editMode;

  // Helpers inline
  function readOrInput(
    value: string,
    onChange: (v: string) => void,
    placeholder?: string,
    type = 'text',
  ) {
    if (!canEdit) return <span className={styles.fieldValue}>{value || <span className={styles.fieldEmpty}>—</span>}</span>;
    return <EditInput value={value} onChange={onChange} placeholder={placeholder} type={type} />;
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionTitle}>Configuração do Evento</span>
        {editMode && (
          <span className={[styles.sectionBadge, styles.sectionBadgeEdit].join(' ')}>
            Modo edição
          </span>
        )}
      </div>

      {/* ── Comunicação ───────────────────────────────────────────────────── */}
      <div className={styles.configGroup}>
        <span className={styles.configGroupTitle}>Comunicação</span>
        <div className={styles.fieldsGrid}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>E-mail principal</span>
            {canEdit
              ? <EditInput
                  value={ev.emailPrimary}
                  onChange={v => setEv(d => ({ ...d, emailPrimary: v }))}
                  placeholder="responsavel@prana.com.br"
                />
              : ev.emailPrimary
                ? <a className={styles.mailLink} href={`mailto:${ev.emailPrimary}`}>
                    <Mail size={11} style={{ flexShrink: 0 }} />
                    {ev.emailPrimary}
                  </a>
                : <span className={styles.fieldEmpty}>—</span>
            }
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>E-mail secundário</span>
            {canEdit
              ? <EditInput
                  value={ev.emailSecondary}
                  onChange={v => setEv(d => ({ ...d, emailSecondary: v }))}
                  placeholder="backup@empresa.com.br"
                />
              : ev.emailSecondary
                ? <a className={styles.mailLink} href={`mailto:${ev.emailSecondary}`}>
                    <Mail size={11} style={{ flexShrink: 0 }} />
                    {ev.emailSecondary}
                  </a>
                : <span className={styles.fieldEmpty}>—</span>
            }
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>E-mail do evento</span>
            {readOrInput(
              ev.configEmail,
              v => setEv(d => ({ ...d, configEmail: v })),
              'evento@app.prana.com.br',
            )}
          </div>
        </div>
      </div>

      {/* ── Agenda ────────────────────────────────────────────────────────── */}
      <div className={styles.configGroup}>
        <span className={styles.configGroupTitle}>Agenda</span>

        {/* Horários por dia */}
        <table className={styles.scheduleTable}>
          <thead>
            <tr>
              <th className={styles.scheduleTh}>Dia</th>
              <th className={styles.scheduleTh}>Início</th>
              <th className={styles.scheduleTh}>Término</th>
            </tr>
          </thead>
          <tbody>
            {ev.configSchedule.map((row, i) => (
              <tr key={row.day} className={styles.scheduleTr}>
                <td className={styles.scheduleTd}>
                  <span className={styles.scheduleDay}>{row.day}</span>
                </td>
                <td className={styles.scheduleTd}>
                  {canEdit
                    ? <input
                        className={[styles.editInput, styles.editInputTime].join(' ')}
                        type="time"
                        value={row.start}
                        onChange={e => setEv(d => {
                          const s = [...d.configSchedule];
                          s[i] = { ...s[i], start: e.target.value };
                          return { ...d, configSchedule: s };
                        })}
                      />
                    : <span className={styles.fieldValue}>{row.start}</span>
                  }
                </td>
                <td className={styles.scheduleTd}>
                  {canEdit
                    ? <input
                        className={[styles.editInput, styles.editInputTime].join(' ')}
                        type="time"
                        value={row.end}
                        onChange={e => setEv(d => {
                          const s = [...d.configSchedule];
                          s[i] = { ...s[i], end: e.target.value };
                          return { ...d, configSchedule: s };
                        })}
                      />
                    : <span className={styles.fieldValue}>{row.end}</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Intervalo + Almoço */}
        <div className={styles.fieldsGrid}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Intervalo de ajuste</span>
            <span className={styles.fieldHelp}>
              Pausa automática na agenda para reorganização entre atendimentos
            </span>
            {canEdit
              ? <div className={styles.adjustInputsStack}>
                  {/* Frequência: a cada quanto tempo o intervalo ocorre */}
                  <div className={styles.editNumWrap}>
                    <span className={styles.editSuffix}>A cada</span>
                    <input
                      className={[styles.editInput, styles.editInputFreq].join(' ')}
                      type="text"
                      placeholder="1h30"
                      value={ev.intervalFrequency}
                      onChange={e => setEv(d => ({ ...d, intervalFrequency: e.target.value }))}
                    />
                  </div>
                  {/* Duração: quanto tempo dura cada pausa */}
                  <div className={styles.editNumWrap}>
                    <span className={styles.editSuffix}>Duração</span>
                    <input
                      className={[styles.editInput, styles.editInputNum].join(' ')}
                      type="number" min={1}
                      value={ev.intervalDuration}
                      onChange={e => setEv(d => ({ ...d, intervalDuration: Number(e.target.value) }))}
                    />
                    <span className={styles.editSuffix}>min</span>
                  </div>
                </div>
              : <span className={styles.fieldValue}>
                  A cada {ev.intervalFrequency} · Duração: {ev.intervalDuration} min
                </span>
            }
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Horário de almoço</span>
            {canEdit
              ? <div className={styles.editTimeRange}>
                  <input
                    className={[styles.editInput, styles.editInputTime].join(' ')}
                    type="time" value={ev.lunchStart}
                    onChange={e => setEv(d => ({ ...d, lunchStart: e.target.value }))}
                  />
                  <span className={styles.editRangeSep}>às</span>
                  <input
                    className={[styles.editInput, styles.editInputTime].join(' ')}
                    type="time" value={ev.lunchEnd}
                    onChange={e => setEv(d => ({ ...d, lunchEnd: e.target.value }))}
                  />
                </div>
              : <span className={styles.fieldValue}>{ev.lunchStart} às {ev.lunchEnd}</span>
            }
          </div>
        </div>
      </div>

      {/* ── Serviços ──────────────────────────────────────────────────────── */}
      <div className={styles.configGroup}>
        <span className={styles.configGroupTitle}>Serviços</span>
        <table className={styles.serviceTable}>
          <thead>
            <tr>
              <th className={styles.serviceTh}>Serviço</th>
              <th className={styles.serviceTh}>Valor de repasse</th>
              <th className={styles.serviceTh}>Duração</th>
            </tr>
          </thead>
          <tbody>
            {ev.serviceConfig.map((svc, i) => (
              <tr key={svc.name} className={styles.serviceTr}>
                <td className={styles.serviceTd}>{svc.name}</td>
                <td className={styles.serviceTd}>
                  {canEdit
                    ? <div className={styles.editNumWrap}>
                        <span className={styles.editSuffix}>R$</span>
                        <input
                          className={[styles.editInput, styles.editInputNum].join(' ')}
                          type="number" min={0}
                          value={svc.repasse}
                          onChange={e => setEv(d => {
                            const sc = [...d.serviceConfig];
                            sc[i] = { ...sc[i], repasse: Number(e.target.value) };
                            return { ...d, serviceConfig: sc };
                          })}
                        />
                      </div>
                    : <span className={styles.fieldValue}>R$ {svc.repasse.toFixed(2).replace('.', ',')}</span>
                  }
                </td>
                <td className={styles.serviceTd}>
                  {canEdit
                    ? <div className={styles.editNumWrap}>
                        <input
                          className={[styles.editInput, styles.editInputNum].join(' ')}
                          type="number" min={5}
                          value={svc.duration}
                          onChange={e => setEv(d => {
                            const sc = [...d.serviceConfig];
                            sc[i] = { ...sc[i], duration: Number(e.target.value) };
                            return { ...d, serviceConfig: sc };
                          })}
                        />
                        <span className={styles.editSuffix}>min</span>
                      </div>
                    : <span className={styles.fieldValue}>{svc.duration} min</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Pesquisa pós-evento ────────────────────────────────────────────── */}
      <div className={styles.configGroup}>
        <span className={styles.configGroupTitle}>Pesquisa pós-evento</span>
        <table className={styles.surveyTable}>
          <thead>
            <tr>
              <th className={styles.surveyTh}>Perfil</th>
              <th className={styles.surveyTh}>Modelo de pesquisa</th>
              <th className={styles.surveyTh}>Tempo de disparo</th>
            </tr>
          </thead>
          <tbody>
            {(
              [
                { key: 'beneficiario' as const, label: 'Beneficiário' },
                { key: 'profissional' as const, label: 'Profissional' },
                { key: 'empresa'      as const, label: 'Empresa'      },
              ] as const
            ).map(({ key, label }) => {
              const cfg = ev.survey[key];
              const isOff = cfg.model === 'nao-enviar';
              return (
                <tr key={key} className={styles.surveyTr}>
                  <td className={styles.surveyTd}>
                    <span className={styles.surveyProfile}>{label}</span>
                  </td>
                  <td className={styles.surveyTd}>
                    {canEdit
                      ? <EditSelect
                          value={cfg.model}
                          onChange={v => setEv(d => ({ ...d, survey: { ...d.survey, [key]: { ...d.survey[key], model: v } } }))}
                          options={SURVEY_MODELS}
                        />
                      : <span className={[styles.fieldValue, isOff ? styles.surveyOff : ''].filter(Boolean).join(' ')}>
                          {surveyModelLabel(cfg.model)}
                        </span>
                    }
                  </td>
                  <td className={styles.surveyTd}>
                    {canEdit
                      ? <EditSelect
                          value={cfg.delay}
                          onChange={v => setEv(d => ({ ...d, survey: { ...d.survey, [key]: { ...d.survey[key], delay: v } } }))}
                          options={DELAY_OPTIONS}
                        />
                      : isOff
                        ? <span className={styles.surveyOff}>—</span>
                        : <span className={styles.fieldValue}>{delayLabel(cfg.delay)}</span>
                    }
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Ajuda de custo ────────────────────────────────────────────────── */}
      <div className={[styles.configGroup, styles.configGroupLast].join(' ')}>
        <span className={styles.configGroupTitle}>Ajuda de custo</span>
        <div className={styles.fieldsCol}>
          <div className={[styles.field, styles.fieldFull].join(' ')}>
            <span className={styles.fieldLabel}>Descrição</span>
            {canEdit
              ? <textarea
                  className={styles.editTextarea}
                  placeholder="Ex.: R$ 50,00 por profissional para deslocamento acima de 50 km"
                  value={ev.helpCostText}
                  onChange={e => setEv(d => ({ ...d, helpCostText: e.target.value }))}
                />
              : <span className={styles.fieldValue}>
                  {ev.helpCostText || <span className={styles.fieldEmpty}>—</span>}
                </span>
            }
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── AddProfPopover ───────────────────────────────────────────────────────────
function AddProfPopover({ onSelect, onCriteria, onClose }: {
  onSelect:   () => void;
  onCriteria: () => void;
  onClose:    () => void;
}) {
  return (
    <>
      <div className={styles.popoverBackdrop} onClick={onClose} />
      <div className={styles.popover}>
        <button className={styles.popoverItem} onClick={onSelect}>
          <UserPlus size={15} className={styles.popoverItemIcon} />
          <div className={styles.popoverItemText}>
            <span className={styles.popoverItemTitle}>Selecionar profissional</span>
            <span className={styles.popoverItemSub}>Escolher uma pessoa específica</span>
          </div>
        </button>
        <button className={styles.popoverItem} onClick={onCriteria}>
          <SlidersHorizontal size={15} className={styles.popoverItemIcon} />
          <div className={styles.popoverItemText}>
            <span className={styles.popoverItemTitle}>Convite por critérios</span>
            <span className={styles.popoverItemSub}>Encontrar profissionais com base em filtros</span>
          </div>
        </button>
      </div>
    </>
  );
}

// ─── SelectProfModal ──────────────────────────────────────────────────────────
function SelectProfModal({ onClose, onSend }: { onClose: () => void; onSend: () => void }) {
  const [search,   setSearch]   = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const results = MOCK_DB_PROFS.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.func.toLowerCase().includes(q);
  });

  const selectedProfs = MOCK_DB_PROFS.filter(p => selected.has(p.id));

  function toggle(id: string) {
    setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={[styles.modalCard, styles.modalCardMd].join(' ')} onClick={e => e.stopPropagation()}>

        <div className={styles.modalHeader}>
          <div className={styles.modalTitleRow}>
            <UserPlus size={16} className={styles.modalTitleIcon} />
            <span className={styles.modalTitle}>Selecionar profissional</span>
          </div>
          <button className={styles.modalClose} onClick={onClose} aria-label="Fechar">
            <X size={16} />
          </button>
        </div>

        {/* Campo de busca */}
        <div className={styles.modalSearchWrap}>
          <Search size={14} className={styles.modalSearchIcon} />
          <input
            className={styles.modalSearchInput}
            placeholder="Buscar por nome ou especialidade…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        {/* Lista de resultados */}
        <div className={styles.modalProfList}>
          {results.length === 0
            ? <span className={styles.modalEmpty}>Nenhum profissional encontrado.</span>
            : results.map(p => {
                const on = selected.has(p.id);
                return (
                  <button
                    key={p.id}
                    className={[styles.modalProfRow, on ? styles.modalProfRowSelected : ''].filter(Boolean).join(' ')}
                    onClick={() => toggle(p.id)}
                  >
                    <div className={styles.modalProfAvatar}>{initials(p.name)}</div>
                    <div className={styles.modalProfInfo}>
                      <span className={styles.modalProfName}>{p.name}</span>
                      <span className={styles.modalProfFunc}>{p.func}</span>
                    </div>
                    <div className={styles.modalProfMeta}>
                      <Star size={11} fill="currentColor" className={styles.starOn} />
                      <span className={styles.modalProfRatingVal}>{p.rating.toFixed(1)}</span>
                    </div>
                    <span className={[styles.modalProfCheck, on ? styles.modalProfCheckOn : ''].filter(Boolean).join(' ')}>
                      {on && <Check size={11} />}
                    </span>
                  </button>
                );
              })
          }
        </div>

        {/* ── Seção persistente de selecionados ────────────────────────────── */}
        <div className={styles.modalSelectedSection}>
          <div className={styles.modalSelectedHeader}>
            <span className={styles.modalSelectedTitle}>Selecionados</span>
            <span className={styles.modalSelectedCount}>{selected.size}</span>
          </div>
          {selectedProfs.length === 0 ? (
            <span className={styles.modalSelectedEmpty}>
              Nenhum profissional selecionado ainda.
            </span>
          ) : (
            <div className={styles.modalSelectedList}>
              {selectedProfs.map(p => (
                <div key={p.id} className={styles.modalSelectedRow}>
                  <div className={styles.modalProfAvatar}>{initials(p.name)}</div>
                  <div className={styles.modalProfInfo}>
                    <span className={styles.modalProfName}>{p.name}</span>
                    <span className={styles.modalProfFunc}>{p.func}</span>
                  </div>
                  <div className={styles.modalProfMeta}>
                    <Star size={11} fill="currentColor" className={styles.starOn} />
                    <span className={styles.modalProfRatingVal}>{p.rating.toFixed(1)}</span>
                  </div>
                  <button
                    className={styles.modalRemoveBtn}
                    onClick={() => toggle(p.id)}
                    aria-label={`Remover ${p.name}`}
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.modalActions}>
          <button className={styles.modalBtnSecondary} onClick={onClose}>Cancelar</button>
          <button className={styles.modalBtnPrimary} disabled={selected.size === 0} onClick={onSend}>
            <Send size={13} />
            Enviar convite{selected.size !== 1 ? 's' : ''}
          </button>
        </div>

      </div>
    </div>
  );
}

// ─── CriteriaModal ────────────────────────────────────────────────────────────
function CriteriaModal({ serviceConfig, onClose, onSend }: {
  serviceConfig: ServiceConfig[];
  onClose: () => void;
  onSend:  () => void;
}) {
  const [step,         setStep]        = useState<1 | 2>(1);
  const [specialty,    setSpecialty]   = useState('');
  const [minRating,    setMinRating]   = useState('0');
  const [gender,       setGender]      = useState('');
  const [minEvents,    setMinEvents]   = useState('');         // string para suportar placeholder
  const [maxDistStr,   setMaxDistStr]  = useState('');         // opcional, string para placeholder
  const [serviceSlots, setServiceSlots] = useState(
    serviceConfig.map(s => ({ name: s.name, slots: 1 }))
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const SPECIALTY_OPTS = [
    { value: '', label: 'Selecione uma especialidade' },
    ...Array.from(new Set(MOCK_DB_PROFS.map(p => p.func))).map(f => ({ value: f, label: f })),
  ] as const;
  const RATING_OPTS = [
    { value: '0',   label: 'Qualquer avaliação'        },
    { value: '3',   label: '★★★   Regular ou acima'   },
    { value: '4',   label: '★★★★  Muito bom ou acima' },
    { value: '4.5', label: '★★★★★ Excelente'          },
  ] as const;
  const GENDER_OPTS = [
    { value: '',  label: 'Qualquer'   },
    { value: 'F', label: 'Feminino'   },
    { value: 'M', label: 'Masculino'  },
  ] as const;

  function computeResults(): DBProfessional[] {
    const maxDist = maxDistStr !== '' ? Number(maxDistStr) : Infinity;
    return MOCK_DB_PROFS.filter(p => {
      if (specialty && p.func !== specialty)                          return false;
      if (Number(minRating) > 0 && p.rating < Number(minRating))    return false;
      if (gender && p.gender !== gender)                             return false;
      if (minEvents !== '' && p.eventsDone < Number(minEvents))      return false;
      if (maxDistStr !== '' && p.distance > maxDist)                 return false;
      return true;
    });
  }

  function handleAdvance() {
    const r = computeResults();
    setSelectedIds(new Set(r.map(p => p.id)));
    setStep(2);
  }

  const results = step === 2 ? computeResults() : [];

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={[styles.modalCard, styles.modalCardLg].join(' ')} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.modalTitleRow}>
            <SlidersHorizontal size={16} className={styles.modalTitleIcon} />
            <span className={styles.modalTitle}>Convite por critérios</span>
          </div>
          <button className={styles.modalClose} onClick={onClose} aria-label="Fechar">
            <X size={16} />
          </button>
        </div>

        {/* Stepper com bolhas numeradas */}
        <div className={styles.modalStepBar}>
          <div className={[styles.modalStep, step === 1 ? styles.modalStepCurrent : styles.modalStepComplete].join(' ')}>
            <span className={styles.modalStepBubble}>
              {step > 1 ? <Check size={10} /> : '1'}
            </span>
            {step === 2
              ? <button className={styles.modalStepLabel} onClick={() => setStep(1)}>Filtros</button>
              : <span className={styles.modalStepLabel}>Filtros</span>
            }
          </div>
          <span className={styles.modalStepLine} />
          <div className={[styles.modalStep, step === 2 ? styles.modalStepCurrent : styles.modalStepInactive].join(' ')}>
            <span className={styles.modalStepBubble}>2</span>
            <span className={styles.modalStepLabel}>Seleção</span>
          </div>
        </div>

        {step === 1 ? (
          <>
            <div className={styles.modalCriteriaBody}>

              {/* ── Grupo 1: Perfil do profissional ─────────────────────── */}
              <div className={styles.modalCriteriaGroup}>
                <span className={styles.modalCriteriaGroupTitle}>Perfil do profissional</span>
                <div className={styles.modalCriteriaFields}>

                  {/* Especialidade — obrigatório */}
                  <div className={styles.modalField}>
                    <span className={styles.modalFieldLabel}>
                      Especialidade
                      <span className={styles.modalFieldRequired}> *</span>
                    </span>
                    <EditSelect value={specialty} onChange={setSpecialty} options={SPECIALTY_OPTS} fullWidth />
                  </div>

                  {/* Vagas por serviço — obrigatório; define quantos profissionais
                      serão necessários para cada serviço do evento */}
                  {serviceSlots.map((ss, i) => (
                    <div key={ss.name} className={styles.modalField}>
                      <span className={styles.modalFieldLabel}>
                        {ss.name}
                        <span className={styles.modalFieldRequired}> *</span>
                      </span>
                      <div className={styles.editNumWrap}>
                        <input
                          className={[styles.editInput, styles.editInputNum].join(' ')}
                          type="number"
                          min={1}
                          value={ss.slots}
                          onChange={e => setServiceSlots(sl => {
                            const n = [...sl];
                            n[i] = { ...n[i], slots: Math.max(1, Number(e.target.value)) };
                            return n;
                          })}
                        />
                        <span className={styles.editSuffix}>
                          vaga{ss.slots !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Qualificação mínima */}
                  <div className={styles.modalField}>
                    <span className={styles.modalFieldLabel}>Qualificação mínima</span>
                    <EditSelect value={minRating} onChange={setMinRating} options={RATING_OPTS} fullWidth />
                  </div>

                  {/* Sexo */}
                  <div className={styles.modalField}>
                    <span className={styles.modalFieldLabel}>Sexo</span>
                    <EditSelect value={gender} onChange={setGender} options={GENDER_OPTS} fullWidth />
                  </div>

                </div>
              </div>

              {/* ── Grupo 2: Logística e histórico ──────────────────────── */}
              <div className={styles.modalCriteriaGroup}>
                <span className={styles.modalCriteriaGroupTitle}>Logística e histórico</span>
                <div className={styles.modalCriteriaFields}>

                  {/* Mínimo de eventos realizados */}
                  <div className={styles.modalField}>
                    <span className={styles.modalFieldLabel}>Mínimo de eventos realizados</span>
                    <div className={styles.editNumWrap}>
                      <span className={styles.editSuffix}>≥</span>
                      <input
                        className={[styles.editInput, styles.editInputNum].join(' ')}
                        type="number"
                        min={0}
                        placeholder="Ex: 5"
                        value={minEvents}
                        onChange={e => setMinEvents(e.target.value)}
                      />
                      <span className={styles.editSuffix}>eventos</span>
                    </div>
                  </div>

                  {/* Distância máxima — opcional */}
                  <div className={styles.modalField}>
                    <span className={styles.modalFieldLabel}>
                      Distância máxima do evento
                      <span className={styles.modalFieldOptional}> (opcional)</span>
                    </span>
                    <input
                      className={[styles.editInput, styles.editSelectExpand].join(' ')}
                      type="number"
                      min={1}
                      placeholder="Ex: 10 km"
                      value={maxDistStr}
                      onChange={e => setMaxDistStr(e.target.value)}
                    />
                  </div>

                </div>
              </div>

            </div>

            <div className={styles.modalActions}>
              <button className={styles.modalBtnSecondary} onClick={onClose}>Cancelar</button>
              {/* Avançar desabilitado até que a especialidade seja selecionada */}
              <button className={styles.modalBtnPrimary} disabled={!specialty} onClick={handleAdvance}>
                Avançar
                <ChevronRight size={13} />
              </button>
            </div>
          </>
        ) : (
          <>
            <p className={styles.modalInfo}>
              <strong>{results.length}</strong> profissional{results.length !== 1 ? 'is' : ''} encontrado{results.length !== 1 ? 's' : ''} com base nos critérios.
            </p>

            <div className={styles.modalProfList}>
              {results.length === 0
                ? <span className={styles.modalEmpty}>Nenhum profissional encontrado para os filtros aplicados.</span>
                : results.map(p => {
                    const on = selectedIds.has(p.id);
                    return (
                      <div
                        key={p.id}
                        className={[styles.modalProfRow, !on ? styles.modalProfRowDeselected : ''].filter(Boolean).join(' ')}
                      >
                        <div className={styles.modalProfAvatar}>{initials(p.name)}</div>
                        <div className={styles.modalProfInfo}>
                          <span className={styles.modalProfName}>{p.name}</span>
                          <span className={styles.modalProfFunc}>{p.func}</span>
                        </div>
                        <div className={styles.modalProfMeta}>
                          <Star size={11} fill="currentColor" className={styles.starOn} />
                          <span className={styles.modalProfRatingVal}>{p.rating.toFixed(1)}</span>
                        </div>
                        {on
                          ? <button
                              className={styles.modalRemoveBtn}
                              onClick={() => setSelectedIds(s => { const n = new Set(s); n.delete(p.id); return n; })}
                              aria-label={`Remover ${p.name}`}
                            ><X size={13} /></button>
                          : <span className={styles.modalRemovedLabel}>Removido</span>
                        }
                      </div>
                    );
                  })
              }
            </div>

            <div className={styles.modalActions}>
              <span className={styles.modalSelCount}>
                {selectedIds.size} profissional{selectedIds.size !== 1 ? 'is' : ''} selecionado{selectedIds.size !== 1 ? 's' : ''}
              </span>
              <button className={styles.modalBtnSecondary} onClick={onClose}>Cancelar</button>
              <button className={styles.modalBtnPrimary} disabled={selectedIds.size === 0} onClick={onSend}>
                <Send size={13} />
                Enviar convites
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

// ─── ToastFeedback ────────────────────────────────────────────────────────────
function ToastFeedback({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className={styles.toastWrap}>
      <Feedback
        type="success"
        message="Convites enviados com sucesso"
        dismissible={false}
      />
    </div>
  );
}

// ─── ResendModal ─────────────────────────────────────────────────────────────
function ResendModal({ target, serviceConfig, pendingCount, onClose }: {
  target:        'global' | Profissional;
  serviceConfig: ServiceConfig[];
  pendingCount:  number;
  onClose:       () => void;
}) {
  const isGlobal = target === 'global';
  const prof     = isGlobal ? null : (target as Profissional);

  const [func,  setFunc]  = useState(isGlobal ? (serviceConfig[0]?.name ?? '') : prof!.func);
  const [value, setValue] = useState(isGlobal ? (serviceConfig[0]?.repasse ?? 0) : prof!.repasse);
  const [sent,  setSent]  = useState(false);

  function handleSend() {
    setSent(true);
    setTimeout(onClose, 2200);
  }

  return (
    <div className={styles.modalOverlay} onClick={sent ? undefined : onClose}>
      <div className={styles.modalCard} onClick={e => e.stopPropagation()}>

        {sent ? (

          /* ── Feedback de sucesso ──────────────────────────────────────── */
          <div className={styles.modalSuccess}>
            <span className={styles.modalSuccessIcon}><Check size={22} /></span>
            <span className={styles.modalSuccessTitle}>Convite reenviado com sucesso</span>
            <span className={styles.modalSuccessSub}>
              {isGlobal
                ? `${pendingCount} profissional${pendingCount !== 1 ? 'is foram' : ' foi'} notificado${pendingCount !== 1 ? 's' : ''}.`
                : `${prof!.name} foi notificado(a).`
              }
            </span>
          </div>

        ) : (
          <>
            {/* Header */}
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleRow}>
                <Send size={16} className={styles.modalTitleIcon} />
                <span className={styles.modalTitle}>Reenviar convite</span>
              </div>
              <button className={styles.modalClose} onClick={onClose} aria-label="Fechar">
                <X size={16} />
              </button>
            </div>

            {/* Mensagem dinâmica */}
            <p className={styles.modalInfo}>
              {isGlobal
                ? <><strong>{pendingCount}</strong> profissionais pendentes receberão este convite.</>
                : <>Convite será reenviado para <strong>{prof!.name}</strong>.</>
              }
            </p>

            {/* Campos */}
            <div className={styles.modalFields}>
              <div className={styles.modalField}>
                <span className={styles.modalFieldLabel}>Função</span>
                <div className={styles.editSelectWrap} style={{ width: '100%' }}>
                  <select
                    className={styles.editSelect}
                    style={{ minWidth: '100%' }}
                    value={func}
                    onChange={e => setFunc(e.target.value)}
                  >
                    {serviceConfig.map(s => (
                      <option key={s.name} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} className={styles.editSelectChevron} />
                </div>
              </div>
              <div className={styles.modalField}>
                <span className={styles.modalFieldLabel}>Valor de repasse</span>
                <div className={styles.editNumWrap}>
                  <span className={styles.editSuffix}>R$</span>
                  <input
                    className={[styles.editInput, styles.editInputNum].join(' ')}
                    style={{ maxWidth: 100 }}
                    type="number"
                    min={0}
                    value={value}
                    onChange={e => setValue(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className={styles.modalActions}>
              <button className={styles.modalBtnSecondary} onClick={onClose}>
                Cancelar
              </button>
              <button className={styles.modalBtnPrimary} onClick={handleSend}>
                <Send size={13} />
                Reenviar convite
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

// ─── ProfissionaisTab ─────────────────────────────────────────────────────────
function ProfissionaisTab({ role, event, serviceConfig, configStatus }: {
  role:          UserRole;
  event:         EventItem;
  serviceConfig: ServiceConfig[];
  configStatus:  ConfigStatus;
}) {
  const [modalTarget,  setModalTarget]  = useState<'global' | Profissional | null>(null);
  const [addPopover,   setAddPopover]   = useState(false);
  const [addModal,     setAddModal]     = useState<'select' | 'criteria' | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  const isPast       = event.status === 'concluido';
  const isConfigured = configStatus === 'enviado';

  function handleSendInvites() {
    setAddModal(null);
    setAddPopover(false);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  }
  const allProfs = MOCK_PROFISSIONAIS[event.id] ?? [];

  const confirmed = allProfs.filter(p => p.status === 'confirmado');
  const pending   = allProfs.filter(p => p.status === 'pendente');
  const refused   = allProfs.filter(p => p.status === 'recusado');

  // ── Linha de profissional ──────────────────────────────────────────────────
  function ProfRow({ prof }: { prof: Profissional }) {
    const hasPartial = !!prof.partialDays?.length;
    const hasRating  = isPast && prof.rating !== undefined;
    const statusCfg  = PROF_STATUS_CFG[prof.status];

    return (
      <div className={styles.profRow}>
        <div className={styles.profRowMain}>

          {/* Avatar com iniciais */}
          <div className={styles.profAvatar} aria-hidden="true">
            {initials(prof.name)}
          </div>

          {/* Informações */}
          <div className={styles.profInfo}>
            <div className={styles.profNameRow}>
              <span className={styles.profName}>{prof.name}</span>
              {/* Status badge — inline-style com tokens do sistema */}
              <span
                className={styles.profStatusBadge}
                style={{ background: statusCfg.bg, borderColor: statusCfg.border, color: statusCfg.color }}
              >
                {statusCfg.label}
              </span>
              {hasPartial && (
                <span className={styles.profPartialBadge}>
                  Disponibilidade parcial
                </span>
              )}
            </div>
            <div className={styles.profMeta}>
              <span className={styles.profRole}>{prof.func}</span>
              <span className={styles.profTagDot} aria-hidden>·</span>
              <span className={styles.profTag}>{prof.tag}</span>
            </div>
            {hasPartial && (
              <span className={styles.profPartialDays}>
                Disponível: {prof.partialDays!.join(', ')}
              </span>
            )}
          </div>

          {/* Ações à direita — reenvio apenas em eventos não concluídos */}
          {role === 'adm' && prof.status === 'pendente' && !isPast && (
            <div className={styles.profActions}>
              <button
                className={styles.editBtn}
                onClick={e => { e.stopPropagation(); setModalTarget(prof); }}
                aria-label={`Reenviar convite para ${prof.name}`}
              >
                <Send size={13} />
                Reenviar
              </button>
            </div>
          )}
        </div>

        {/* Painel de avaliação — eventos concluídos · sempre visível · não interativo */}
        {hasRating && (
          <div className={styles.profRatingPanel}>
            <span className={styles.profRatingTitle}>Avaliação do profissional</span>
            <div className={styles.profRatingContent}>
              {/* Estrelas com suporte a meia estrela via clipPath */}
              <span className={styles.profRatingStars} aria-hidden="true">
                {Array.from({ length: 5 }, (_, i) => {
                  const full = prof.rating! >= i + 0.75;
                  const half = !full && prof.rating! >= i + 0.25;
                  if (full) {
                    return <Star key={i} size={13} fill="currentColor" className={styles.starOn} />;
                  }
                  if (half) {
                    return (
                      <span key={i} className={styles.starHalfWrap}>
                        <Star size={13} fill="currentColor" className={[styles.starOn, styles.starHalfFilled].join(' ')} />
                        <Star size={13} className={[styles.starOff, styles.starHalfEmpty].join(' ')} />
                      </span>
                    );
                  }
                  return <Star key={i} size={13} className={styles.starOff} />;
                })}
              </span>
              <span className={styles.profRatingScore}>
                {prof.rating!.toFixed(1).replace('.', ',')}
              </span>
              <span className={styles.profRatingDash} aria-hidden>—</span>
              <span className={styles.profRatingLabel}>
                {ratingLabel(prof.rating!)}
              </span>
              <span className={styles.profRatingCount}>
                ({prof.ratingCount} avaliações)
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Seção (Confirmados / Pendentes / Recusados) ────────────────────────────
  function ProfSection({ title, profs, action, progress }: {
    title:     string;
    profs:     Profissional[];
    action?:   React.ReactNode;
    progress?: React.ReactNode;
  }) {
    if (profs.length === 0) return null;
    return (
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.profSectionLeft}>
            <span className={styles.sectionTitle}>{title}</span>
            {/* Contagem simples apenas quando não há indicador de progresso */}
            {!progress && <span className={styles.profCount}>{profs.length}</span>}
            {progress}
          </div>
          {action}
        </div>
        <div className={styles.profList}>
          {profs.map(p => <ProfRow key={p.id} prof={p} />)}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Barra superior da aba — "Adicionar profissional" (admin) */}
      {role === 'adm' && (
        <div className={styles.profTabBar}>
          <div className={styles.addProfWrap}>
            {/* Desabilitado antes da configuração ser enviada ou em eventos concluídos */}
            <button
              className={styles.editBtn}
              disabled={isPast || !isConfigured}
              onClick={() => setAddPopover(o => !o)}
            >
              <UserPlus size={14} />
              Adicionar profissional
            </button>
            {addPopover && (
              <AddProfPopover
                onSelect={()   => { setAddPopover(false); setAddModal('select');   }}
                onCriteria={()  => { setAddPopover(false); setAddModal('criteria'); }}
                onClose={() => setAddPopover(false)}
              />
            )}
          </div>
        </div>
      )}

      {allProfs.length === 0 ? (
        <div className={styles.placeholder}>
          <span className={styles.placeholderIcon}><Users size={32} /></span>
          <span className={styles.placeholderTitle}>Nenhum profissional</span>
          <span className={styles.placeholderSub}>Nenhum profissional foi cadastrado para este evento ainda.</span>
        </div>
      ) : (
        <>
          <ProfSection
            title="Confirmados"
            profs={confirmed}
            progress={
              <span
                className={styles.profProgress}
                style={confirmed.length >= event.professionals.needed ? {
                  background:  'var(--color-status-success-bg)',
                  borderColor: 'var(--color-green-300)',
                  color:       'var(--color-status-success-fg)',
                } : undefined}
              >
                {confirmed.length}/{event.professionals.needed} profissionais
              </span>
            }
          />

          {/* Pendentes e Recusados — apenas para admin */}
          {role === 'adm' && (
            <>
              <ProfSection
                title="Pendentes"
                profs={pending}
                action={pending.length > 0 ? (
                  <button className={styles.editBtn} onClick={() => setModalTarget('global')}>
                    <Send size={13} />
                    Reenviar convite
                  </button>
                ) : undefined}
              />
              <ProfSection title="Recusados" profs={refused} />
            </>
          )}
        </>
      )}

      {/* Modal de reenvio de convite */}
      {modalTarget && (
        <ResendModal
          target={modalTarget}
          serviceConfig={serviceConfig}
          pendingCount={pending.length}
          onClose={() => setModalTarget(null)}
        />
      )}

      {/* Modal: selecionar profissional diretamente */}
      {addModal === 'select' && (
        <SelectProfModal onClose={() => setAddModal(null)} onSend={handleSendInvites} />
      )}

      {/* Modal: convite por critérios (2 etapas) */}
      {addModal === 'criteria' && (
        <CriteriaModal
          serviceConfig={serviceConfig}
          onClose={() => setAddModal(null)}
          onSend={handleSendInvites}
        />
      )}

      {/* Toast de feedback de envio */}
      <ToastFeedback visible={toastVisible} />
    </>
  );
}

// ─── AgendaListView ───────────────────────────────────────────────────────────
function AgendaListView({ bookings, role, onRemove }: {
  bookings: Booking[];
  role:     UserRole;
  onRemove: (b: Booking) => void;
}) {
  type Row = Record<string, unknown> & {
    id:           string;
    dia:          string;
    horario:      string;
    beneficiario: string;
    servico:      string;
    tipo:         string;
    _booking:     Booking;
  };

  const rows: Row[] = bookings.map(b => {
    let tipo = 'Confirmado';
    if (b.status === 'waitlist') tipo = 'Lista de espera';
    else if (b.encaixeFor)       tipo = 'Encaixe';
    else if (b.noShow)           tipo = 'Não compareceu';
    return { id:b.id, dia:b.day, horario:b.time, beneficiario:b.beneficiary, servico:b.service, tipo, _booking:b };
  });

  const columns: TableColumn<Row>[] = [
    { key:'dia',          label:'Dia',          type:'text' },
    { key:'horario',      label:'Horário',       type:'text' },
    {
      key:'beneficiario', label:'Beneficiário',
      render: (v, row) => (row._booking as Booking).noShow
        ? <span className={styles.agTableNoShow}>{v as string}</span>
        : <span>{v as string}</span>,
    },
    { key:'servico', label:'Serviço', type:'text' },
    {
      key:'tipo', label:'Status', type:'badge',
      statusMap: {
        'Confirmado':      { label:'Confirmado',      status:'success' },
        'Lista de espera': { label:'Lista de espera', status:'info'    },
        'Encaixe':         { label:'Encaixe',         status:'orange'  },
        'Não compareceu':  { label:'Não compareceu',  status:'error'   },
      },
    },
    ...(role === 'adm' ? [{
      key: 'id' as keyof Row,
      label: '',
      type: 'actions' as const,
      actionItems: [{
        icon: <Trash2 size={14} />,
        label: 'Remover',
        danger: true,
        onClick: (row: Row) => onRemove(row._booking as Booking),
      }],
    }] : []),
  ];

  return (
    <Table
      columns={columns}
      rows={rows}
      emptyMessage="Nenhum agendamento encontrado para os filtros selecionados."
    />
  );
}

// ─── RemoveBookingModal ───────────────────────────────────────────────────────
function RemoveBookingModal({ booking, onClose, onConfirm }: {
  booking:   Booking;
  onClose:   () => void;
  onConfirm: () => void;
}) {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitleRow}>
            <AlertCircle size={16} className={styles.modalTitleIcon} />
            <span className={styles.modalTitle}>Remover agendamento</span>
          </div>
          <button className={styles.modalClose} onClick={onClose} aria-label="Fechar"><X size={16} /></button>
        </div>
        <p className={styles.modalInfo}>
          Tem certeza que deseja remover o agendamento de{' '}
          <strong>{booking.beneficiary}</strong>?{' '}
          <span style={{ display:'block', marginTop:4, color:'var(--color-text-tertiary)', fontSize:'var(--font-size-sm)' }}>
            {booking.service} · {booking.day} às {booking.time}
          </span>
        </p>
        <div className={styles.modalActions}>
          <button className={styles.modalBtnSecondary} onClick={onClose}>Cancelar</button>
          <button
            className={styles.modalBtnPrimary}
            style={{ background:'var(--color-status-error-fg)' }}
            onClick={onConfirm}
          >
            <Trash2 size={13} />
            Confirmar remoção
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── AddBeneficiaryModal ──────────────────────────────────────────────────────
function AddBeneficiaryModal({ target, onClose, onAdd }: {
  target:  { day: string; time: string; service: string };
  onClose: () => void;
  onAdd:   (name: string) => void;
}) {
  const [name, setName] = useState('');
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={[styles.modalCard, styles.modalCardMd].join(' ')} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitleRow}>
            <UserPlus size={16} className={styles.modalTitleIcon} />
            <span className={styles.modalTitle}>Adicionar beneficiário</span>
          </div>
          <button className={styles.modalClose} onClick={onClose} aria-label="Fechar"><X size={16} /></button>
        </div>
        <div className={styles.modalFields}>
          <div className={styles.modalField}>
            <span className={styles.modalFieldLabel}>Horário</span>
            <span className={styles.fieldValue}>
              {target.day} às {target.time} · {target.service}
            </span>
          </div>
          <div className={styles.modalField}>
            <span className={styles.modalFieldLabel}>
              Nome do beneficiário
              <span className={styles.modalFieldRequired}> *</span>
            </span>
            <EditInput
              value={name}
              onChange={setName}
              placeholder="Nome completo"
            />
          </div>
        </div>
        <div className={styles.modalActions}>
          <button className={styles.modalBtnSecondary} onClick={onClose}>Cancelar</button>
          <button
            className={styles.modalBtnPrimary}
            disabled={!name.trim()}
            onClick={() => onAdd(name.trim())}
          >
            <Check size={13} />
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SlotDetailModal ───────────────────────────────────────────────────────────
function SlotDetailModal({ slot, role, onClose, onAdd, onRemove }: {
  slot:     ComputedSlot;
  role:     UserRole;
  onClose:  () => void;
  onAdd:    () => void;
  onRemove: (b: Booking) => void;
}) {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={[styles.modalCard, styles.modalCardLg].join(' ')} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitleRow}>
            <Clock size={16} className={styles.modalTitleIcon} />
            <span className={styles.modalTitle}>
              {slot.day} · {slot.time} — {slot.service}
            </span>
          </div>
          <button className={styles.modalClose} onClick={onClose} aria-label="Fechar"><X size={16} /></button>
        </div>

        <div className={styles.modalContent}>
          {/* Agendados */}
          <div className={styles.agSlotSection}>
            <span className={styles.agSlotSectionTitle}>Agendados ({slot.confirmed.length + slot.encaixes.length})</span>
            {slot.encaixes.length + slot.confirmed.length + slot.noShows.length === 0 ? (
              <span className={styles.agSlotEmpty}>Nenhum agendado.</span>
            ) : (
              <>
                {/* Encaixes */}
                {slot.encaixes.map(b => (
                  <div key={b.id} className={styles.agSlotPerson}>
                    <span className={styles.agSlotEncaixeName}>{b.beneficiary}</span>
                    <span className={styles.agBadgeEncaixe}>Encaixe</span>
                    {role === 'adm' && (
                      <button
                        className={styles.modalRemoveBtn}
                        style={{ marginLeft:'auto' }}
                        onClick={() => onRemove(b)}
                        aria-label={`Remover ${b.beneficiary}`}
                      ><X size={12} /></button>
                    )}
                  </div>
                ))}
                {/* Confirmados */}
                {slot.confirmed.map(b => (
                  <div key={b.id} className={styles.agSlotPerson}>
                    <span>{b.beneficiary}</span>
                    {role === 'adm' && (
                      <button
                        className={styles.modalRemoveBtn}
                        style={{ marginLeft:'auto' }}
                        onClick={() => onRemove(b)}
                        aria-label={`Remover ${b.beneficiary}`}
                      ><X size={12} /></button>
                    )}
                  </div>
                ))}
                {/* No-shows */}
                {slot.noShows.map(b => (
                  <div key={b.id} className={styles.agSlotPerson}>
                    <span className={styles.agSlotNoShow}>{b.beneficiary}</span>
                    <span className={styles.agBadgeNoShow}>Não compareceu</span>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Lista de espera */}
          {slot.waitlist.length > 0 && (
            <div className={styles.agSlotSection}>
              <span className={styles.agSlotSectionTitle}>Lista de espera ({slot.waitlist.length})</span>
              {slot.waitlist.map(b => (
                <div key={b.id} className={styles.agSlotPerson}>
                  <span>{b.beneficiary}</span>
                  {role === 'adm' && (
                    <button
                      className={styles.modalRemoveBtn}
                      style={{ marginLeft:'auto' }}
                      onClick={() => onRemove(b)}
                      aria-label={`Remover ${b.beneficiary}`}
                    ><X size={12} /></button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.modalActions}>
          <button className={styles.modalBtnSecondary} onClick={onClose}>Fechar</button>
          {role === 'adm' && !slot.isFull && (
            <button className={styles.modalBtnPrimary} onClick={onAdd}>
              <UserPlus size={13} />
              Adicionar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── NewAgendamentoModal ───────────────────────────────────────────────────────
function NewAgendamentoModal({
  step, data, detail, svcOptions, dayOptions,
  onDataChange, onStepChange, onClose, onAdd
}: {
  step: 1 | 2 | 3 | 4;
  data: { service: string; day: string; time: string; name: string; email: string; phone: string };
  detail: EventDetail;
  svcOptions: Array<{ value: string; label: string }>;
  dayOptions: Array<{ value: string; label: string }>;
  onDataChange: (data: any) => void;
  onStepChange: (step: 1 | 2 | 3 | 4) => void;
  onClose: () => void;
  onAdd: () => void;
}) {
  const getAvailableTimes = () => {
    if (!data.day) return [];
    const daySchedule = detail.configSchedule.find(d => d.day === data.day);
    if (!daySchedule) return [];
    const service = detail.serviceConfig.find(s => s.name === data.service);
    if (!service) return [];
    return generateTimeSlots(daySchedule.start, daySchedule.end, service.duration, detail.lunchStart, detail.lunchEnd);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={[styles.modalCard, styles.modalCardLg].join(' ')} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitleRow}>
            <UserPlus size={16} className={styles.modalTitleIcon} />
            <span className={styles.modalTitle}>Novo agendamento ({step}/4)</span>
          </div>
          <button className={styles.modalClose} onClick={onClose} aria-label="Fechar"><X size={16} /></button>
        </div>

        <div className={styles.modalContent}>
          {/* Step 1: Service */}
          {step === 1 && (
            <div className={styles.modalField}>
              <span className={styles.modalFieldLabel}>Serviço <span className={styles.modalFieldRequired}>*</span></span>
              <select
                className={styles.editInput}
                value={data.service}
                onChange={e => onDataChange({ ...data, service: e.target.value })}
              >
                <option value="">Selecione um serviço</option>
                {detail.serviceConfig.map(s => (
                  <option key={s.name} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Step 2: Day */}
          {step === 2 && (
            <div className={styles.modalField}>
              <span className={styles.modalFieldLabel}>Dia <span className={styles.modalFieldRequired}>*</span></span>
              <div className={styles.agDayStrip}>
                {detail.configSchedule.map(d => (
                  <button
                    key={d.day}
                    className={[
                      styles.agDayBtn,
                      data.day === d.day ? styles.agDayBtnActive : ''
                    ].filter(Boolean).join(' ')}
                    onClick={() => onDataChange({ ...data, day: d.day })}
                  >
                    {formatDayLabel(d.day)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Time */}
          {step === 3 && (
            <div className={styles.modalField}>
              <span className={styles.modalFieldLabel}>Horário <span className={styles.modalFieldRequired}>*</span></span>
              <div className={styles.agTimeGrid}>
                {getAvailableTimes().map(time => (
                  <button
                    key={time}
                    className={[
                      styles.agTimeBtn,
                      data.time === time ? styles.agTimeBtnActive : styles.agTimeBtnAvailable
                    ].filter(Boolean).join(' ')}
                    onClick={() => onDataChange({ ...data, time })}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Form */}
          {step === 4 && (
            <div className={styles.modalFields}>
              <div className={styles.modalField}>
                <span className={styles.modalFieldLabel}>Nome <span className={styles.modalFieldRequired}>*</span></span>
                <EditInput
                  value={data.name}
                  onChange={v => onDataChange({ ...data, name: v })}
                  placeholder="Nome completo"
                />
              </div>
              <div className={styles.modalField}>
                <span className={styles.modalFieldLabel}>Email</span>
                <EditInput
                  value={data.email}
                  onChange={v => onDataChange({ ...data, email: v })}
                  placeholder="email@exemplo.com"
                  type="email"
                />
              </div>
              <div className={styles.modalField}>
                <span className={styles.modalFieldLabel}>Telefone</span>
                <EditInput
                  value={data.phone}
                  onChange={v => onDataChange({ ...data, phone: v })}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
          )}
        </div>

        <div className={styles.modalActions}>
          <button className={styles.modalBtnSecondary} onClick={onClose}>Cancelar</button>
          {step > 1 && (
            <button className={styles.modalBtnSecondary} onClick={() => onStepChange((step - 1) as 1 | 2 | 3 | 4)}>
              Anterior
            </button>
          )}
          {step < 4 ? (
            <button
              className={styles.modalBtnPrimary}
              disabled={
                (step === 1 && !data.service) ||
                (step === 2 && !data.day) ||
                (step === 3 && !data.time)
              }
              onClick={() => onStepChange((step + 1) as 1 | 2 | 3 | 4)}
            >
              Próximo
            </button>
          ) : (
            <button
              className={styles.modalBtnPrimary}
              disabled={!data.name.trim()}
              onClick={onAdd}
            >
              <Check size={13} />
              Adicionar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Helper: Format day label ─────────────────────────────────────────────────
const DAY_NAMES   = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const MONTH_NAMES = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];

function formatDayLabel(dayKey: string): string {
  // dayKey format: "13/04"
  const parts = dayKey.split('/');
  const dayNum = parseInt(parts[0]);
  const monthNum = parseInt(parts[1]) - 1;
  const date = new Date(2026, monthNum, dayNum);
  const dayName = DAY_NAMES[date.getDay()];
  const monthName = MONTH_NAMES[monthNum];
  return `${dayName}, ${dayNum} de ${monthName}`;
}

// ─── AgendamentosTab ──────────────────────────────────────────────────────────
function AgendamentosTab({ role, event, detail }: {
  role:   UserRole;
  event:  EventItem;
  detail: EventDetail;
}) {
  const [viewMode,        setViewMode]        = useState<'horario' | 'lista'>('horario');
  const [filterService,   setFilterService]   = useState('');
  const [filterDay,       setFilterDay]       = useState('');
  const [detailSlot,      setDetailSlot]      = useState<ComputedSlot | null>(null);
  const [removeTarget,    setRemoveTarget]    = useState<Booking | null>(null);
  const [showNewAgendamento, setShowNewAgendamento] = useState(false);
  const [newAgendamentoStep, setNewAgendamentoStep] = useState<1 | 2 | 3 | 4>(1);
  const [newAgendamentoData, setNewAgendamentoData] = useState({
    service: '',
    day: '',
    time: '',
    name: '',
    email: '',
    phone: '',
  });
  const [bookingsList,    setBookingsList]    = useState<Booking[]>(MOCK_BOOKINGS[event.id] ?? []);
  const [successMessage,  setSuccessMessage]  = useState<string | null>(null);

  // Auto-dismiss success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const slots       = computeSlots(bookingsList, detail, event.id, filterService, filterDay);
  const totalVagas  = computeTotalVagas(detail, event.id);
  const agendadas   = bookingsList.filter(b => b.status === 'confirmed' && !b.noShow).length;
  const listaEspera = bookingsList.filter(b => b.status === 'waitlist').length;

  const svcOptions = [
    { value:'', label:'Todos os serviços' },
    ...detail.serviceConfig.map(s => ({ value:s.name, label:s.name })),
  ] as const;

  const dayOptions = [
    { value:'', label:'Todos os dias' },
    ...detail.configSchedule.map(d => ({ value:d.day, label:d.day })),
  ] as const;

  function handleRemoveConfirm() {
    if (!removeTarget) return;
    setBookingsList(list => list.filter(b => b.id !== removeTarget.id));
    setRemoveTarget(null);
  }

  function handleNewAgendamentoAdd() {
    const data = newAgendamentoData;
    const nb: Booking = {
      id:          `bk-${Date.now()}`,
      beneficiary: data.name,
      service:     data.service,
      day:         data.day,
      time:        data.time,
      status:      'confirmed',
    };
    setBookingsList(list => [...list, nb]);
    setShowNewAgendamento(false);
    setNewAgendamentoStep(1);
    setNewAgendamentoData({ service: '', day: '', time: '', name: '', email: '', phone: '' });
    setSuccessMessage('Novo agendamento adicionado com sucesso');
  }

  function resetNewAgendamento() {
    setShowNewAgendamento(false);
    setNewAgendamentoStep(1);
    setNewAgendamentoData({ service: '', day: '', time: '', name: '', email: '', phone: '' });
  }

  return (
    <>
      {/* ── Success Feedback ──────────────────────────────────────────────── */}
      {successMessage && (
        <div className={styles.agFeedbackWrapper}>
          <Feedback
            type="success"
            message={successMessage}
            dismissible={true}
            onDismiss={() => setSuccessMessage(null)}
          />
        </div>
      )}

      {/* ── Summary ──────────────────────────────────────────────────────── */}
      <div className={styles.agSummary}>
        <div className={styles.agSummaryCard}>
          <span className={styles.agSummaryValue}>{totalVagas}</span>
          <span className={styles.agSummaryLabel}>Total de vagas</span>
        </div>
        <div className={styles.agSummaryCard}>
          <span className={[styles.agSummaryValue, styles.agSummaryValueBrand].join(' ')}>{agendadas}</span>
          <span className={styles.agSummaryLabel}>Vagas agendadas</span>
        </div>
        <div className={styles.agSummaryCard}>
          <span className={[styles.agSummaryValue, styles.agSummaryValueWarn].join(' ')}>{listaEspera}</span>
          <span className={styles.agSummaryLabel}>Lista de espera</span>
        </div>
      </div>

      {/* ── Controls ─────────────────────────────────────────────────────── */}
      <div className={styles.agControls}>
        <div className={styles.agViewToggle}>
          <button
            className={[styles.agViewBtn, viewMode === 'horario' ? styles.agViewBtnActive : ''].filter(Boolean).join(' ')}
            onClick={() => setViewMode('horario')}
          >
            <Clock size={13} />
            Por horário
          </button>
          <button
            className={[styles.agViewBtn, viewMode === 'lista' ? styles.agViewBtnActive : ''].filter(Boolean).join(' ')}
            onClick={() => setViewMode('lista')}
          >
            <List size={13} />
            Por lista
          </button>
        </div>

        <div className={styles.agFilters}>
          <EditSelect value={filterService} onChange={v => { setFilterService(v); setDetailSlot(null); }} options={svcOptions} />
          <EditSelect value={filterDay}     onChange={v => { setFilterDay(v);     setDetailSlot(null); }} options={dayOptions} />
          {role === 'adm' && (
            <button
              className={styles.editBtn}
              onClick={() => setShowNewAgendamento(true)}
            >
              <UserPlus size={14} />
              Novo agendamento
            </button>
          )}
        </div>
      </div>

      {/* ── Time view — Grid cards layout ────────────────────────────────── */}
      {viewMode === 'horario' && (
        <>
          {/* ── Grid cards view ──────────────────────────────────────────── */}
          {slots.length === 0 ? (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}><Calendar size={28} /></span>
              <span className={styles.placeholderTitle}>Nenhum agendamento</span>
              <span className={styles.placeholderSub}>Não há agendamentos para os filtros selecionados.</span>
            </div>
          ) : (
            <>
              {filterDay === '' ? (
                // ── With day grouping (when viewing all days) ──
                <>
                  {(() => {
                    const slotsByDay = new Map<string, ComputedSlot[]>();
                    slots.forEach(slot => {
                      if (!slotsByDay.has(slot.day)) {
                        slotsByDay.set(slot.day, []);
                      }
                      slotsByDay.get(slot.day)!.push(slot);
                    });
                    const sortedDays = Array.from(slotsByDay.keys()).sort((a, b) => {
                      const [aD, aM] = a.split('/').map(Number);
                      const [bD, bM] = b.split('/').map(Number);
                      return aM === bM ? aD - bD : aM - bM;
                    });

                    return sortedDays.map(day => (
                      <div key={day}>
                        <div className={styles.agDayGroupHeader}>{formatDayLabel(day)}</div>
                        <div className={styles.agTimeCardGrid}>
                          {slotsByDay.get(day)!.map(slot => {
                            const active = slot.confirmed.length + slot.encaixes.length;
                            const status = getCapacityStatus(active, slot.capacity, slot.waitlist.length);
                            const statusColor = status === 'available' ? 'available' : status === 'waitlist' ? 'waitlist' : 'full';
                            const pill = svcPill(slot.service);

                            return (
                              <button
                                key={slot.key}
                                className={[styles.agTimeCard, styles[`agTimeCard${statusColor}`]].filter(Boolean).join(' ')}
                                onClick={() => setDetailSlot(slot)}
                                title={`${slot.day} às ${slot.time} · ${slot.service}`}
                              >
                                <div className={styles.agTimeCardContent}>
                                  <div className={styles.agTimeCardTime}>{slot.time}</div>
                                  <div className={styles.agTimeCardCapacity}>{active}/{slot.capacity}</div>
                                  <div className={styles.agTimeCardService} style={{ background: pill.bg, borderColor: pill.border, color: pill.color }}>
                                    {slot.service}
                                  </div>
                                </div>
                                {status !== 'available' && (
                                  <div className={styles.agTimeCardBadge}>
                                    {status === 'waitlist' ? `${slot.waitlist.length} espera` : 'Cheio'}
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ));
                  })()}
                </>
              ) : (
                // ── Without day grouping (when specific day is filtered) ──
                <div className={styles.agTimeCardGrid}>
                  {slots.map(slot => {
                    const active = slot.confirmed.length + slot.encaixes.length;
                    const status = getCapacityStatus(active, slot.capacity, slot.waitlist.length);
                    const statusColor = status === 'available' ? 'available' : status === 'waitlist' ? 'waitlist' : 'full';
                    const pill = svcPill(slot.service);

                    return (
                      <button
                        key={slot.key}
                        className={[styles.agTimeCard, styles[`agTimeCard${statusColor}`]].filter(Boolean).join(' ')}
                        onClick={() => setDetailSlot(slot)}
                        title={`${slot.day} às ${slot.time} · ${slot.service}`}
                      >
                        <div className={styles.agTimeCardContent}>
                          <div className={styles.agTimeCardTime}>{slot.time}</div>
                          <div className={styles.agTimeCardCapacity}>{active}/{slot.capacity}</div>
                          <div className={styles.agTimeCardService} style={{ background: pill.bg, borderColor: pill.border, color: pill.color }}>
                            {slot.service}
                          </div>
                        </div>
                        {status !== 'available' && (
                          <div className={styles.agTimeCardBadge}>
                            {status === 'waitlist' ? `${slot.waitlist.length} espera` : 'Cheio'}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ── List view ────────────────────────────────────────────────────── */}
      {viewMode === 'lista' && (
        <AgendaListView
          bookings={bookingsList.filter(b =>
            (!filterService || b.service === filterService) &&
            (!filterDay    || b.day     === filterDay)
          )}
          role={role}
          onRemove={setRemoveTarget}
        />
      )}

      {/* ── Modals ───────────────────────────────────────────────────────── */}
      {detailSlot && (
        <SlotDetailModal
          slot={detailSlot}
          role={role}
          onClose={() => setDetailSlot(null)}
          onAdd={() => {
            setNewAgendamentoData(prev => ({
              ...prev,
              service: detailSlot.service,
              day: detailSlot.day,
              time: detailSlot.time,
            }));
            setNewAgendamentoStep(4);
            setShowNewAgendamento(true);
            setDetailSlot(null);
          }}
          onRemove={setRemoveTarget}
        />
      )}

      {removeTarget && (
        <RemoveBookingModal
          booking={removeTarget}
          onClose={() => setRemoveTarget(null)}
          onConfirm={handleRemoveConfirm}
        />
      )}

      {showNewAgendamento && (
        <NewAgendamentoModal
          step={newAgendamentoStep}
          data={newAgendamentoData}
          detail={detail}
          svcOptions={svcOptions}
          dayOptions={dayOptions}
          onDataChange={setNewAgendamentoData}
          onStepChange={setNewAgendamentoStep}
          onClose={resetNewAgendamento}
          onAdd={handleNewAgendamentoAdd}
        />
      )}
    </>
  );
}

// ─── Relatório — tipos e mock ─────────────────────────────────────────────────
interface ReportData {
  title:       string;
  resumo:      string;
  insights:    string;
  observacoes: string;
}

const MOCK_REPORTS: Record<string, ReportData> = {
  'EVT-001': {
    title: 'Relatório de Impacto — SIPAT Itaú Unibanco · Abril 2026',
    resumo:
      'O evento SIPAT Itaú Unibanco, realizado entre os dias 13 e 15 de abril de 2026, registrou ' +
      'índice de bem-estar (IBE) de 7,8/10 e taxa de participação de 83%, superando em 12% a média ' +
      'histórica da empresa. Um total de 208 colaboradores recebeu atendimentos especializados em ' +
      'Quick Massage, Acupuntura e Podologia ao longo dos três dias. Os resultados evidenciam impacto ' +
      'positivo no clima organizacional e na qualidade de vida no trabalho.',
    insights:
      '• Quick Massage registrou a maior taxa de ocupação (97%), com lista de espera em todos os horários do primeiro dia.\n' +
      '• O IBE de 7,8 representa crescimento de +0,4 pontos em relação ao último evento, indicando evolução consistente.\n' +
      '• Colaboradores do setor de TI lideraram a adesão (38%), seguidos por RH (22%) e Financeiro (18%).\n' +
      '• Pico de demanda entre 09h00 e 11h30 — redistribuir agendamentos para o período vespertino pode reduzir a concentração.\n' +
      '• Nota média dos profissionais: 9,1/10, acima do benchmark setorial (8,4).',
    observacoes:
      'Recomenda-se incluir pelo menos um profissional adicional de Quick Massage no próximo evento ' +
      'para atender a demanda reprimida. Avaliar a extensão do horário de atendimento em 30 minutos ao final do dia.',
  },
  'EVT-005': {
    title: 'Relatório de Impacto — Ginástica Laboral Bradesco · Março 2026',
    resumo:
      'O evento de Ginástica Laboral realizado no Bradesco nos dias 10 e 11 de março de 2026 alcançou ' +
      'índice IBE de 8,1/10 e taxa de participação de 90%, a mais alta registrada entre os eventos da empresa. ' +
      'Os 162 colaboradores atendidos demonstraram alto engajamento e satisfação com os serviços oferecidos.',
    insights:
      '• Taxa de participação de 90% é recorde entre os eventos do Bradesco.\n' +
      '• Ginástica Laboral obteve nota 9,4/10, indicando altíssima satisfação.\n' +
      '• Quick Massage esgotou os horários disponíveis antes das 11h no primeiro dia.\n' +
      '• Colaboradores relataram melhora imediata na postura e redução de dores.\n' +
      '• Engajamento do setor Operações foi 45% superior ao esperado.',
    observacoes:
      'Manter o formato de dois dias, bem-recebido pelos colaboradores. ' +
      'Incluir Quick Massage como serviço principal dado o alto interesse demonstrado.',
  },
};

// ─── Trend Arrow ──────────────────────────────────────────────────────────────
type TrendDir = 'up' | 'down';
function TrendArrow({ dir }: { dir: TrendDir }) {
  if (dir === 'up') {
    return (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M3 9L9 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M3 3h6v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M3 3L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 3v6H3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Stat Card (Dashboard version) ────────────────────────────────────────────
interface StatCardProps {
  label: string; value: string; trend: string;
  trendDir: TrendDir; icon: React.ReactNode;
}
function StatCard({ label, value, trend, trendDir, icon }: StatCardProps) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statBody}>
        <div className={styles.statLabelGroup}>
          <span className={styles.statLabel}>{label}</span>
          <span className={styles.statValue}>{value}</span>
        </div>
        <div className={styles.statFooter}>
          <span className={[styles.trendBadge, trendDir === 'up' ? styles.trendUp : styles.trendDown].join(' ')}>
            <TrendArrow dir={trendDir} />
            {trend}
          </span>
          <span className={styles.trendLabel}>vs mês anterior</span>
        </div>
      </div>
      <div className={styles.statIconBox}>{icon}</div>
    </div>
  );
}

// ─── Evolution Line Chart ─────────────────────────────────────────────────────
interface LinePoint { period: string; nps: number; ibe: number; }
function EvolutionLineChart({ data }: { data?: LinePoint[] }) {
  const chartData = data || [
    { period: 'Semana 1', nps: 70, ibe: 71 },
    { period: 'Semana 2', nps: 75, ibe: 74 },
    { period: 'Semana 3', nps: 82, ibe: 78 },
  ];

  const [hovered, setHovered] = useState<(LinePoint & { px: number; py: number }) | null>(null);
  const W = 560, H = 200;
  const padL = 48, padT = 20, padR = 20, padB = 40;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const yMin = 55, yMax = 95;
  const n = chartData.length;
  const xOf = (i: number) => padL + (i / (n - 1)) * chartW;
  const yOf = (v: number) => padT + chartH - ((v - yMin) / (yMax - yMin)) * chartH;

  const npsPath = chartData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xOf(i).toFixed(1)} ${yOf(d.nps).toFixed(1)}`).join(' ');
  const ibePath = chartData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xOf(i).toFixed(1)} ${yOf(d.ibe).toFixed(1)}`).join(' ');
  const gridVals = [60, 70, 80, 90];

  return (
    <div className={styles.chartCardWide}>
      <div className={styles.chartHeaderRow}>
        <span className={styles.chartTitle}>Evolução</span>
        <div className={styles.lineLegend}>
          <div className={styles.lineLegendItem}><span className={styles.lineDot} style={{ background: '#B25557' }} />NPS</div>
          <div className={styles.lineLegendItem}><span className={styles.lineDot} style={{ background: '#CFADAE' }} />IBE</div>
        </div>
      </div>
      <div style={{ position: 'relative' }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
          {gridVals.map(v => (
            <g key={v}>
              <line x1={padL} y1={yOf(v)} x2={W - padR} y2={yOf(v)} stroke="#F0EDEC" strokeWidth="1" />
              <text x={padL - 8} y={yOf(v) + 4} textAnchor="end" fontSize="10" fill="#9E8E8F">{v}</text>
            </g>
          ))}
          {chartData.map((d, i) => (
            <text key={d.period} x={xOf(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="#9E8E8F">{d.period}</text>
          ))}
          <path d={`${npsPath} L ${xOf(n - 1)} ${padT + chartH} L ${xOf(0)} ${padT + chartH} Z`} fill="#B25557" fillOpacity="0.07" />
          <path d={`${ibePath} L ${xOf(n - 1)} ${padT + chartH} L ${xOf(0)} ${padT + chartH} Z`} fill="#CFADAE" fillOpacity="0.12" />
          <path d={npsPath} fill="none" stroke="#B25557" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d={ibePath} fill="none" stroke="#CFADAE" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {hovered && (
            <line x1={hovered.px} y1={padT} x2={hovered.px} y2={padT + chartH}
              stroke="#B25557" strokeWidth="1" strokeDasharray="4 2" opacity="0.4" />
          )}
          {chartData.map((d, i) => (
            <circle key={`n${i}`} cx={xOf(i)} cy={yOf(d.nps)} r={hovered?.period === d.period ? 6 : 4}
              fill="#B25557" stroke="#fff" strokeWidth="2" style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHovered({ ...d, px: xOf(i), py: yOf(d.nps) })}
              onMouseLeave={() => setHovered(null)} />
          ))}
          {chartData.map((d, i) => (
            <circle key={`e${i}`} cx={xOf(i)} cy={yOf(d.ibe)} r={hovered?.period === d.period ? 6 : 4}
              fill="#CFADAE" stroke="#fff" strokeWidth="2" style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHovered({ ...d, px: xOf(i), py: yOf(d.ibe) })}
              onMouseLeave={() => setHovered(null)} />
          ))}
        </svg>
        {hovered && (
          <div className={tooltipStyles.tip} style={{
            position: 'absolute',
            left: `${(hovered.px / W) * 100}%`,
            top: `${(hovered.py / H) * 100}%`,
            transform: 'translate(-50%, -120%)',
            pointerEvents: 'none', whiteSpace: 'nowrap', opacity: 1,
          }}>
            {hovered.period} · NPS {hovered.nps} · IBE {hovered.ibe}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Participation Bar Chart ──────────────────────────────────────────────────
interface PartItem { label: string; convidados: number; presentes: number; }
function ParticipationBarChart({ eventDetail }: { eventDetail?: EventDetail }) {
  // Usa dados por dia se disponíveis; fallback para total do evento
  const PART_DATA: PartItem[] = eventDetail?.participationByDay
    ?? [{ label: 'Evento', convidados: eventDetail?.participationData?.total ?? 250, presentes: eventDetail?.participationData?.attended ?? 208 }];

  const [hovered, setHovered] = useState<(PartItem & { x: number; y: number }) | null>(null);
  const W = 400, H = 188;
  const padL = 8, padT = 20, padR = 8, padB = 44;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const n = PART_DATA.length;
  const maxVal = Math.max(...PART_DATA.map(d => d.convidados));
  const groupW = chartW / n;
  const barW = 26, barGap = 6;
  const xCenter = (i: number) => padL + i * groupW + groupW / 2;
  const bH = (v: number) => (v / maxVal) * chartH;
  const bY = (v: number) => padT + chartH - bH(v);

  return (
    <div className={styles.chartCard} style={{ minHeight: 'unset' }}>
      <div className={styles.chartHeaderRow}>
        <span className={styles.chartTitle}>Participação</span>
        <div className={styles.lineLegend}>
          <div className={styles.lineLegendItem}><span className={styles.lineDot} style={{ background: '#CFADAE', borderRadius: 2 }} />Convidados</div>
          <div className={styles.lineLegendItem}><span className={styles.lineDot} style={{ background: '#B25557', borderRadius: 2 }} />Presentes</div>
        </div>
      </div>
      <div style={{ position: 'relative' }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
          <line x1={padL} y1={padT + chartH} x2={W - padR} y2={padT + chartH} stroke="#F0EDEC" strokeWidth="1" />
          {PART_DATA.map((d, i) => {
            const cx = xCenter(i);
            return (
              <g key={d.label}>
                <rect x={cx - barGap / 2 - barW} y={bY(d.convidados)} width={barW} height={bH(d.convidados)}
                  fill="#CFADAE" rx="3" style={{ cursor: 'pointer' }}
                  onMouseMove={(e) => setHovered({ ...d, x: e.clientX, y: e.clientY })}
                  onMouseLeave={() => setHovered(null)} />
                <rect x={cx + barGap / 2} y={bY(d.presentes)} width={barW} height={bH(d.presentes)}
                  fill="#B25557" rx="3" style={{ cursor: 'pointer' }}
                  onMouseMove={(e) => setHovered({ ...d, x: e.clientX, y: e.clientY })}
                  onMouseLeave={() => setHovered(null)} />
                <text x={cx} y={H - 6} textAnchor="middle" fontSize="9" fill="#9E8E8F">{d.label}</text>
              </g>
            );
          })}
        </svg>
        {hovered && (
          <div className={tooltipStyles.tip} style={{
            position: 'fixed', left: hovered.x, top: hovered.y - 44,
            transform: 'translateX(-50%)', pointerEvents: 'none',
            whiteSpace: 'nowrap', zIndex: 9999, opacity: 1,
          }}>
            {hovered.label} · {hovered.presentes} presentes / {hovered.convidados} convidados
          </div>
        )}
      </div>
    </div>
  );
}

// ─── NPS Distribution ─────────────────────────────────────────────────────────
const NPS_SEGMENTS = [
  { label: 'Promotores',  pct: 62, color: '#22C55E', bg: '#F0FDF4', border: '#86EFAC' },
  { label: 'Neutros',     pct: 24, color: '#EAB308', bg: '#FEFCE8', border: '#FDE047' },
  { label: 'Detratores',  pct: 14, color: '#EF4444', bg: '#FEF2F2', border: '#FCA5A5' },
];

function NPSDistribution({ npsScore }: { npsScore?: number }) {
  const score = npsScore || 48;
  const [hovered, setHovered] = useState<{ label: string; pct: number; x: number; y: number } | null>(null);

  return (
    <div className={styles.chartCard}>
      <span className={styles.chartTitle}>Distribuição NPS</span>
      <div className={styles.npsSegmentWrap}>
        {/* Segmented bar com tooltip */}
        <div className={styles.npsBar}>
          {NPS_SEGMENTS.map((s, i) => (
            <div key={s.label} className={styles.npsBarSegment}
              style={{
                width: `${s.pct}%`,
                background: s.color,
                borderRadius: i === 0 ? '6px 0 0 6px' : i === NPS_SEGMENTS.length - 1 ? '0 6px 6px 0' : '0',
                cursor: 'pointer',
              }}
              onMouseMove={(e) => setHovered({ label: s.label, pct: s.pct, x: e.clientX, y: e.clientY })}
              onMouseLeave={() => setHovered(null)}
            />
          ))}
        </div>
        {/* NPS score */}
        <div className={styles.npsScore}>
          <span className={styles.npsScoreValue}>{score}</span>
          <span className={styles.npsScoreLabel}>NPS Score</span>
        </div>
        {/* Legend */}
        <div className={styles.npsLegend}>
          {NPS_SEGMENTS.map(s => (
            <div key={s.label} className={styles.npsLegendItem}
              style={{ background: s.bg, border: `1px solid ${s.border}` }}>
              <span className={styles.pieDot} style={{ background: s.color }} />
              <span className={styles.npsLegendLabel}>{s.label}</span>
              <span className={styles.npsLegendPct} style={{ color: s.color }}>{s.pct}%</span>
            </div>
          ))}
        </div>
      </div>
      {/* Tooltip */}
      {hovered && (
        <div className={tooltipStyles.tip} style={{
          position: 'fixed', left: hovered.x, top: hovered.y - 44,
          transform: 'translateX(-50%)', pointerEvents: 'none',
          whiteSpace: 'nowrap', zIndex: 9999,
        }}>
          {hovered.label}: {hovered.pct}%
        </div>
      )}
    </div>
  );
}

// ─── Radar Chart ─────────────────────────────────────────────────────────────
function RadarChart({ data }: { data?: Array<{ axis: string; value: number }> }) {
  const chartData = data || [
    { axis: 'Bem-estar',   value: 8.2 },
    { axis: 'Relaxamento', value: 7.8 },
    { axis: 'Foco',        value: 7.1 },
    { axis: 'Engajamento', value: 8.5 },
    { axis: 'Clima',       value: 9.0 },
  ];

  const [hovered, setHovered] = useState<{ label: string; value: number; x: number; y: number } | null>(null);

  const VW = 400, VH = 340;
  const cx = 200, cy = 170, maxR = 95, maxVal = 10;
  const n = chartData.length;
  const angleOf = (i: number) => -Math.PI / 2 + (2 * Math.PI * i) / n;
  const ptOf = (v: number, i: number) => ({
    x: cx + (v / maxVal) * maxR * Math.cos(angleOf(i)),
    y: cy + (v / maxVal) * maxR * Math.sin(angleOf(i)),
  });

  const levels = [2, 4, 6, 8, 10];
  const dataPolygon = chartData.map((d, i) => {
    const p = ptOf(d.value, i);
    return `${p.x},${p.y}`;
  }).join(' ');

  return (
    <div className={styles.chartCard} style={{ minHeight: 'unset' }}>
      <span className={styles.chartTitle}>Radar de Pesquisa</span>
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" style={{ display: 'block' }}>
          {/* Grid rings */}
          {levels.map(lv => {
            const pts = chartData.map((_, i) => { const p = ptOf(lv, i); return `${p.x},${p.y}`; }).join(' ');
            return <polygon key={lv} points={pts} fill="none" stroke="#F0EDEC" strokeWidth="1" />;
          })}
          {/* Level labels (inner) */}
          {[4, 8].map(lv => {
            const p = ptOf(lv, 2);
            return <text key={lv} x={p.x + 3} y={p.y + 3} fontSize="8" fill="#C8C0C0">{lv}</text>;
          })}
          {/* Axes */}
          {chartData.map((_, i) => {
            const end = ptOf(maxVal, i);
            return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="#E8DFE0" strokeWidth="1" />;
          })}
          {/* Data fill */}
          <polygon points={dataPolygon} fill="#B25557" fillOpacity="0.18" stroke="#B25557" strokeWidth="2" />
          {/* Data points */}
          {chartData.map((d, i) => {
            const p = ptOf(d.value, i);
            const isHov = hovered?.label === d.axis;
            return (
              <circle key={i} cx={p.x} cy={p.y} r={isHov ? 7 : 5}
                fill="#B25557" stroke="#fff" strokeWidth="2"
                style={{ cursor: 'pointer', transition: 'r 120ms' }}
                onMouseMove={(e) => setHovered({ label: d.axis, value: d.value, x: e.clientX, y: e.clientY })}
                onMouseLeave={() => setHovered(null)} />
            );
          })}
          {/* Axis labels */}
          {chartData.map((d, i) => {
            const angle = angleOf(i);
            const lx = cx + (maxR + 28) * Math.cos(angle);
            const ly = cy + (maxR + 28) * Math.sin(angle);
            const anchor = Math.cos(angle) > 0.15 ? 'start' : Math.cos(angle) < -0.15 ? 'end' : 'middle';
            return (
              <text key={i} x={lx} y={ly + 4} textAnchor={anchor} fontSize="11" fill="#9E8E8F" fontWeight="500">
                {d.axis}
              </text>
            );
          })}
        </svg>
        {/* HTML tooltip */}
        {hovered && (
          <div className={tooltipStyles.tip} style={{
            position: 'fixed', left: hovered.x, top: hovered.y - 44,
            transform: 'translateX(-50%)', pointerEvents: 'none',
            whiteSpace: 'nowrap', zIndex: 9999, opacity: 1,
          }}>
            {hovered.label}: {hovered.value} / 10
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Service Ratings ──────────────────────────────────────────────────────────
function ServiceRatings({ data }: { data?: Array<{ name: string; rating: number }> }) {
  const ratings = (data || []).sort((a, b) => b.rating - a.rating);
  const [hovered, setHovered] = useState<{ label: string; rating: number; x: number; y: number } | null>(null);

  return (
    <div className={styles.chartCard} style={{ minHeight: 'unset' }}>
      <span className={styles.chartTitle}>Notas por serviço</span>
      <div className={styles.barChartBody} style={{ gap: 20, justifyContent: 'flex-start' }}>
        {ratings.map(s => (
          <div key={s.name} className={styles.barRow} style={{ cursor: 'pointer' }}
            onMouseMove={(e) => setHovered({ label: s.name, rating: s.rating, x: e.clientX, y: e.clientY })}
            onMouseLeave={() => setHovered(null)}
          >
            <span className={styles.barLabel}>{s.name}</span>
            <div className={styles.barTrackGroup}>
              <div className={styles.barTrack} style={{ height: 20 }}>
                <div className={styles.barFill} style={{ width: `${(s.rating / 10) * 100}%`, height: 20 }} />
              </div>
              <span className={styles.barPct}>{s.rating}</span>
            </div>
          </div>
        ))}
      </div>
      {hovered && (
        <div className={tooltipStyles.tip} style={{
          position: 'fixed', left: hovered.x, top: hovered.y - 44,
          transform: 'translateX(-50%)', pointerEvents: 'none',
          whiteSpace: 'nowrap', zIndex: 9999,
        }}>
          {hovered.label} · Nota {hovered.rating} / 10
        </div>
      )}
    </div>
  );
}

// ─── Qualitative Comments ─────────────────────────────────────────────────────
function QualitativeComments({ data }: { data?: Array<{ text: string; author: string }> }) {
  const comments = data || [];

  return (
    <div className={styles.chartCard}>
      <span className={styles.chartTitle}>Comentários qualitativos</span>
      <div className={styles.commentsList}>
        {comments.map((c, i) => (
          <div key={i} className={styles.commentCard}>
            <span className={styles.commentIcon}>❝</span>
            <div className={styles.commentBody}>
              <p className={styles.commentText}>{c.text}</p>
              <span className={styles.commentAuthor}>{c.author}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Benchmark Section (empresa only) ────────────────────────────────────────
const BENCHMARK_ITEMS = [
  {
    title: 'Evento vs. Média',
    left:  { label: 'Este evento', value: '82', active: true,  dynamic: true },
    right: { label: 'Média geral', value: '71', active: false, dynamic: false },
    metric: 'NPS', delta: '+11 pts', positive: true,
  },
  {
    title: 'Empresa vs. Benchmark',
    left:  { label: 'Sua empresa', value: '78', active: true,  dynamic: false },
    right: { label: 'Benchmark*',  value: '65', active: false, dynamic: false },
    metric: 'IBE', delta: '+13 pts', positive: true,
    note: '* Anonimizado — média do setor',
  },
  {
    title: 'Antes vs. Depois',
    left:  { label: 'Antes',  value: '70', active: false, dynamic: false },
    right: { label: 'Depois', value: '82', active: true,  dynamic: false },
    metric: 'NPS', delta: '+12 pts', positive: true,
  },
];

const benchColor = (active: boolean) =>
  active ? '#B25557' : 'var(--color-gray-600)';

function BenchmarkSection() {
  return (
    <div className={styles.benchmarkRow}>
      {BENCHMARK_ITEMS.map(item => (
        <div key={item.title} className={styles.benchmarkCard}>
          <span className={styles.chartTitle}>{item.title}</span>
          <div className={styles.benchmarkValues}>
            <div className={styles.benchmarkSide}>
              <span className={styles.benchmarkValue} style={{ color: benchColor(item.left.active) }}>
                {item.left.value}
              </span>
              <span className={styles.benchmarkMetric}>{item.metric}</span>
              <span className={styles.benchmarkSideLabel}>
                {item.left.label}
              </span>
            </div>
            <div className={styles.benchmarkVs}>
              <span className={[styles.trendBadge, item.positive ? styles.trendUp : styles.trendDown].join(' ')}>
                {item.delta}
              </span>
            </div>
            <div className={styles.benchmarkSide}>
              <span className={styles.benchmarkValue} style={{ color: benchColor(item.right.active) }}>
                {item.right.value}
              </span>
              <span className={styles.benchmarkMetric}>{item.metric}</span>
              <span className={styles.benchmarkSideLabel}>
                {item.right.label}
              </span>
            </div>
          </div>
          {'note' in item && item.note && (
            <span className={styles.benchmarkNote}>{item.note}</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Evento vs Média card ─────────────────────────────────────────────────────
function EventoVsMediaCard({ detail }: { detail: EventDetail }) {
  const eventScore = detail.benchmarkData?.eventScore ?? detail.ibeScore?.score ?? 7.8;
  const avgScore   = detail.benchmarkData?.benchmarkScore ?? 7.1;
  const delta      = detail.benchmarkData?.delta ?? Number((eventScore - avgScore).toFixed(1));
  const positive   = detail.benchmarkData?.positive ?? delta >= 0;
  const deltaStr   = `${positive ? '+' : ''}${delta} pts`;

  return (
    <div className={styles.benchmarkRow}>
      <div className={styles.benchmarkCard}>
        <span className={styles.chartTitle}>Evento vs. Média</span>
        <div className={styles.benchmarkValues}>
          <div className={styles.benchmarkSide}>
            <span className={styles.benchmarkValue} style={{ color: '#B25557' }}>
              {eventScore}
            </span>
            <span className={styles.benchmarkMetric}>IBE</span>
            <span className={styles.benchmarkSideLabel}>Este evento</span>
          </div>
          <div className={styles.benchmarkVs}>
            <span className={[styles.trendBadge, positive ? styles.trendUp : styles.trendDown].join(' ')}>
              {deltaStr}
            </span>
          </div>
          <div className={styles.benchmarkSide}>
            <span className={styles.benchmarkValue} style={{ color: 'var(--color-gray-600)' }}>
              {avgScore}
            </span>
            <span className={styles.benchmarkMetric}>IBE</span>
            <span className={styles.benchmarkSideLabel}>Média geral</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Avaliação Tab ────────────────────────────────────────────────────────────
function AvaliacaoTab({ detail }: {
  role: UserRole;
  event: EventItem;
  detail: EventDetail;
}) {
  return (
    <div className={styles.impactoSection}>
      {/* KPIs — NPS · IBE · Participação · Impactados */}
      <div className={styles.statCardsRow}>
        <StatCard label="NPS"                       value={detail.npsData?.npsScore.toString() ?? '—'}                                    trend={detail.npsData?.trend ?? '—'}                 trendDir={detail.npsData?.trendDir ?? 'up'}                 icon={<TrendingUp size={24} />} />
        <StatCard label="IBE"                       value={detail.ibeScore?.score.toString() ?? '—'}                                    trend={detail.ibeScore?.trend ?? '—'}                trendDir={detail.ibeScore?.trendDir ?? 'up'}                icon={<Activity   size={24} />} />
        <StatCard label="Taxa de Participação"      value={detail.participationData ? `${detail.participationData.percentage}%` : '—'} trend={detail.participationData?.trend ?? '—'}     trendDir={detail.participationData?.trendDir ?? 'up'}     icon={<Users     size={24} />} />
        <StatCard label="Colaboradores Impactados"  value={detail.collaboratorsImpacted?.count.toString() ?? '—'}                       trend={detail.collaboratorsImpacted?.trend ?? '—'} trendDir={detail.collaboratorsImpacted?.trendDir ?? 'up'} icon={<Heart     size={24} />} />
      </div>

      {/* Evolução + Participação */}
      <div className={styles.impactoRow}>
        <EvolutionLineChart data={detail.evaluationHistory} />
        <ParticipationBarChart eventDetail={detail} />
      </div>

      {/* Distribuição NPS + Radar */}
      <div className={styles.chartsRow}>
        <NPSDistribution npsScore={detail.npsData?.npsScore} />
        <RadarChart data={detail.radarDimensions} />
      </div>

      {/* Notas por serviço */}
      <ServiceRatings data={detail.serviceRatings} />

      {/* Comentários qualitativos */}
      <QualitativeComments data={detail.evaluationComments} />

      {/* Evento vs. Média */}
      <EventoVsMediaCard detail={detail} />
    </div>
  );
}

// ─── Relatório tab ────────────────────────────────────────────────────────────
function RelatorioTab({
  role,
  event,
  detail,
  published,
  onPublish,
}: {
  role: UserRole;
  event: EventItem;
  detail: EventDetail;
  published: boolean;
  onPublish: () => void;
}) {
  const base = MOCK_REPORTS[event.id] ?? MOCK_REPORTS['EVT-001'];

  const [localTitle,       setLocalTitle]       = useState(base.title);
  const [localResumo,      setLocalResumo]      = useState(base.resumo);
  const [localInsights,    setLocalInsights]    = useState(base.insights);
  const [localObservacoes, setLocalObservacoes] = useState(base.observacoes);
  const [editing,          setEditing]          = useState(false);
  const [isGenerating,     setIsGenerating]     = useState(false);

  // Snapshot for cancel
  const [snap, setSnap] = useState({ title: base.title, resumo: base.resumo, insights: base.insights, observacoes: base.observacoes });

  // Ref wrapping the printable area (title → insights, not observações)
  const printRef = useRef<HTMLDivElement>(null);

  function handleEdit() {
    setSnap({ title: localTitle, resumo: localResumo, insights: localInsights, observacoes: localObservacoes });
    setEditing(true);
  }
  function handleCancel() {
    setLocalTitle(snap.title);
    setLocalResumo(snap.resumo);
    setLocalInsights(snap.insights);
    setLocalObservacoes(snap.observacoes);
    setEditing(false);
  }
  function handleSave() { setEditing(false); }

  /* ── PDF generation ───────────────────────────────────────────── */

  /** Load an SVG URL → transparent PNG data URL at the given pixel size */
  async function loadSvgAsDataUrl(url: string, sizePx: number): Promise<string> {
    const resp = await fetch(url);
    const svgText = await resp.text();
    const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
    const objectUrl = URL.createObjectURL(blob);
    return new Promise((resolve, reject) => {
      const img = new Image(sizePx, sizePx);
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width  = sizePx;
        c.height = sizePx;
        c.getContext('2d')!.drawImage(img, 0, 0, sizePx, sizePx);
        URL.revokeObjectURL(objectUrl);
        resolve(c.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = objectUrl;
    });
  }

  async function handleDownloadPdf() {
    if (!printRef.current || isGenerating) return;
    setIsGenerating(true);
    try {
      const [{ default: html2canvas }, { jsPDF }, logoDataUrl] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
        loadSvgAsDataUrl('/logos/PRANA_ENXOVAL__LOGO_Eventos_2_Branco.svg', 400),
      ]);

      // Capture the printable region at 2× resolution
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const pdf      = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW    = pdf.internal.pageSize.getWidth();   // 210 mm
      const pageH    = pdf.internal.pageSize.getHeight();  // 297 mm
      const margin   = 10;
      const headerH  = 26;  // taller to accommodate logo
      const contentW = pageW - margin * 2;

      const logoPdfH = headerH - 4;   // 14 mm — 2 mm padding top + bottom
      const logoPdfW = logoPdfH;       // square logo (viewBox 1000×1000)
      const textX    = margin + logoPdfW + 5;  // text starts right of logo

      /* ── Branded header (reused on every page) ── */
      function drawHeader() {
        // Background
        pdf.setFillColor(178, 85, 87);
        pdf.rect(0, 0, pageW, headerH, 'F');

        // Logo (white SVG paths — transparent PNG overlaid on red background)
        pdf.addImage(logoDataUrl, 'PNG', margin, 2, logoPdfW, logoPdfH);

        // Event info — right-aligned
        const dateStr = event.endDate
          ? `${event.startDate} – ${event.endDate}`
          : event.startDate;
        const midY = headerH / 2 + 1.5;

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        pdf.setTextColor(255, 255, 255);
        pdf.text(event.name, textX, midY - 2.5);

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7.5);
        pdf.setTextColor(255, 220, 220);
        pdf.text(`${event.company}  ·  ${dateStr}`, textX, midY + 2);
      }

      /* ── Footer helper ── */
      function drawFooter() {
        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(7);
        pdf.setTextColor(180, 180, 180);
        pdf.text(
          'Gerado automaticamente por Espaço Prana',
          pageW / 2, pageH - 4, { align: 'center' },
        );
      }

      /* ── Paginate canvas across A4 pages ── */
      const pxPerMm  = canvas.width / contentW;
      const availH   = pageH - headerH - margin - margin;  // usable height per page

      drawHeader();

      let srcYpx    = 0;
      let pageIndex = 0;

      while (srcYpx < canvas.height) {
        const sliceHpx = Math.min(Math.ceil(availH * pxPerMm), canvas.height - srcYpx);
        const sliceHmm = sliceHpx / pxPerMm;

        // Vertical slice of the captured canvas
        const sliceCanvas    = document.createElement('canvas');
        sliceCanvas.width    = canvas.width;
        sliceCanvas.height   = sliceHpx;
        sliceCanvas.getContext('2d')!.drawImage(canvas, 0, -srcYpx);

        pdf.addImage(sliceCanvas.toDataURL('image/png'), 'PNG', margin, headerH + margin, contentW, sliceHmm);

        srcYpx += sliceHpx;

        if (srcYpx < canvas.height) {
          drawFooter();
          pdf.addPage();
          pageIndex++;
          drawHeader();
        }
      }

      drawFooter();

      const slug = event.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      pdf.save(`relatorio-${slug}.pdf`);
    } finally {
      setIsGenerating(false);
    }
  }

  const ibe      = detail.ibeScore?.score ?? 7.8;
  const partPct  = detail.participationData?.percentage ?? 83;
  const attended = detail.participationData?.attended ?? 208;

  /* ── Locked view (empresa, not published) ─────────────────────── */
  if (role === 'empresa' && !published) {
    return (
      <div className={styles.relatorioWrap}>
        <Feedback
          type="info"
          title="Relatório ainda não publicado"
          description="O relatório deste evento ainda está sendo elaborado pela equipe Plathanus. Você será notificado quando estiver disponível."
        />
      </div>
    );
  }

  /* ── Main view ───────────────────────────────────────────────── */
  return (
    <div className={styles.relatorioWrap}>

      {/* Status bar */}
      <div className={styles.relatorioStatusBar}>
        {role === 'adm' && (
          <span className={[styles.relatorioStatusBadge, published ? styles.relatorioStatusPublished : styles.relatorioStatusDraft].join(' ')}>
            {published ? 'Publicado' : 'Rascunho'}
          </span>
        )}

        <div className={styles.relatorioStatusActions}>
          {/* Download — visible to both roles once published */}
          {published && (
            <button
              className={[styles.relatorioDownloadBtn, isGenerating ? styles.relatorioDownloadBtnLoading : ''].filter(Boolean).join(' ')}
              onClick={handleDownloadPdf}
              disabled={isGenerating}
            >
              <Download size={14} />
              {isGenerating ? 'Gerando PDF…' : 'Baixar PDF'}
            </button>
          )}

          {/* Admin-only edit / publish actions */}
          {role === 'adm' && !editing && (
            <button className={styles.editBtn} onClick={handleEdit}>
              <Pencil size={14} />
              Editar
            </button>
          )}
          {role === 'adm' && editing && (
            <>
              <button className={styles.cancelBtn} onClick={handleCancel}>
                <X size={14} />
                Cancelar
              </button>
              <button className={styles.saveBtn} onClick={handleSave}>
                <Check size={14} />
                Salvar
              </button>
            </>
          )}
          {role === 'adm' && !published && !editing && (
            <button className={styles.relatorioPublishBtn} onClick={onPublish}>
              <Send size={14} />
              Publicar relatório
            </button>
          )}
        </div>
      </div>

      {/* Document card */}
      <div className={styles.relatorioDoc}>

        {/* ── Printable region (title → insights) ── */}
        <div ref={printRef} className={styles.relatorioPrintArea}>

          <div className={styles.relatorioDocHeader}>
            {editing ? (
              <input
                className={styles.relatorioTitleInput}
                value={localTitle}
                onChange={e => setLocalTitle(e.target.value)}
              />
            ) : (
              <h2 className={styles.relatorioTitle}>{localTitle}</h2>
            )}
            <div className={styles.relatorioMeta}>
              <span className={styles.relatorioMetaItem}>Plathanus</span>
              <span className={styles.relatorioMetaDot}>·</span>
              <span className={styles.relatorioMetaItem}>2 dias atrás</span>
              <span className={styles.relatorioMetaDot}>·</span>
              <span className={styles.relatorioAiBadge}>✦ IA</span>
            </div>
          </div>

          {/* Resumo executivo */}
          <section className={styles.relatorioSection}>
            <h3 className={styles.relatorioSectionTitle}>Resumo executivo</h3>
            {editing ? (
              <textarea
                className={styles.relatorioTextarea}
                value={localResumo}
                onChange={e => setLocalResumo(e.target.value)}
                rows={5}
              />
            ) : (
              <p className={styles.relatorioBody}>{localResumo}</p>
            )}
          </section>

          {/* Métricas */}
          <section className={styles.relatorioSection}>
            <h3 className={styles.relatorioSectionTitle}>Métricas do evento</h3>
            <div className={styles.relatorioMetricsRow}>
              <div className={styles.relatorioMetricCard}>
                <span className={styles.relatorioMetricValue} style={{ color: '#B25557' }}>{ibe}</span>
                <span className={styles.relatorioMetricLabel}>IBE</span>
              </div>
              <div className={styles.relatorioMetricCard}>
                <span className={styles.relatorioMetricValue} style={{ color: 'var(--color-brand-600)' }}>{partPct}%</span>
                <span className={styles.relatorioMetricLabel}>Participação</span>
              </div>
              <div className={styles.relatorioMetricCard}>
                <span className={styles.relatorioMetricValue}>{attended}</span>
                <span className={styles.relatorioMetricLabel}>Colaboradores atendidos</span>
              </div>
            </div>
          </section>

          {/* Gráficos — stacked (column) to avoid whitespace in ServiceRatings */}
          <section className={styles.relatorioSection}>
            <h3 className={styles.relatorioSectionTitle}>Visualizações</h3>
            <div className={styles.relatorioChartsStack}>
              <ParticipationBarChart eventDetail={detail} />
              <ServiceRatings data={detail.serviceRatings} />
            </div>
          </section>

          {/* Insights */}
          <section className={styles.relatorioSection}>
            <h3 className={styles.relatorioSectionTitle}>Insights</h3>
            {editing ? (
              <textarea
                className={styles.relatorioTextarea}
                value={localInsights}
                onChange={e => setLocalInsights(e.target.value)}
                rows={7}
              />
            ) : (
              <pre className={styles.relatorioInsights}>{localInsights}</pre>
            )}
          </section>

          {/* Observações — inside print area (included in PDF) */}
          <section className={[styles.relatorioSection, styles.relatorioObsSection].join(' ')}>
            <h3 className={styles.relatorioSectionTitle}>Observações e recomendações</h3>
            {editing ? (
              <textarea
                className={styles.relatorioTextarea}
                value={localObservacoes}
                onChange={e => setLocalObservacoes(e.target.value)}
                rows={4}
              />
            ) : (
              <p className={styles.relatorioBody}>{localObservacoes}</p>
            )}
          </section>

        </div>
        {/* ── End printable region ── */}

      </div>
    </div>
  );
}

// ─── Placeholder tab ──────────────────────────────────────────────────────────
function PlaceholderTab({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className={styles.placeholder}>
      <span className={styles.placeholderIcon}>{icon}</span>
      <span className={styles.placeholderTitle}>{title}</span>
      <span className={styles.placeholderSub}>{sub}</span>
    </div>
  );
}

// ─── EventDetailScreen ────────────────────────────────────────────────────────
interface EventDetailScreenProps {
  role:          UserRole;
  event:         EventItem;
  sidebarOffset?: number;
  onNavChange?:  (item: string) => void;
  onBack?:       () => void;
}

export function EventDetailScreen({
  role, event, sidebarOffset = 0, onNavChange, onBack,
}: EventDetailScreenProps) {
  const [sidebarOpen,  setSidebarOpen]  = useState(true);
  const [activeNav,    setActiveNav]    = useState('eventos');
  const [activeTab,    setActiveTab]    = useState<DetailTab>('visao-geral');
  const [editMode,     setEditMode]     = useState(false);
  const [configStatus, setConfigStatus] = useState<ConfigStatus>('pendente');
  const [tabTooltip,      setTabTooltip]      = useState<{ x: number; y: number } | null>(null);
  const [reportPublished, setReportPublished] = useState(false);

  const detail = MOCK_DETAIL[event.id] ?? DEFAULT_DETAIL;
  const [editValues, setEditValues] = useState<EventDetail>(detail);

  // Valores exibidos: editValues em modo edição, detail fora
  const displayValues = editMode ? editValues : detail;

  function handleSave() {
    setConfigStatus('enviado');
    setEditMode(false);
  }

  function handleCancel() {
    setEditValues(MOCK_DETAIL[event.id] ?? DEFAULT_DETAIL);
    setEditMode(false);
  }

  // Estilos do badge de status (tokens inline para evitar classes extras)
  const statusStyle: Record<ConfigStatus, React.CSSProperties> = {
    pendente: {
      background:   'var(--color-status-warning-bg)',
      borderColor:  '#FDE047',
      color:        'var(--color-status-warning-fg)',
    },
    enviado: {
      background:   'var(--color-status-success-bg)',
      borderColor:  'var(--color-green-300)',
      color:        'var(--color-status-success-fg)',
    },
  };

  const statusLabel: Record<ConfigStatus, string> = {
    pendente: 'Pendente de configuração',
    enviado:  'Enviado para empresa',
  };

  return (
    <div
      className={styles.shell}
      style={{ '--proto-offset': `${sidebarOffset}px` } as React.CSSProperties}
    >
      <div className={styles.sidebarFixed}>
        <Sidebar
          open={sidebarOpen}
          onToggle={() => setSidebarOpen(o => !o)}
          activeItem={activeNav}
          onNavClick={(item) => { setActiveNav(item); onNavChange?.(item); }}
          user={{ name: 'Admin Prana', email: 'admin@prana.com', initials: 'AP' }}
          role={role}
        />
      </div>

      <div className={[styles.contentWrap, !sidebarOpen ? styles.contentWrapClosed : ''].filter(Boolean).join(' ')}>
        <div className={styles.contentCard}>

          {/* ── Navegação: ← Voltar (acima do título) ───────────────────── */}
          {onBack && (
            <button className={styles.backNav} onClick={onBack}>
              <ArrowLeft size={14} />
              Voltar
            </button>
          )}

          {/* ── Header: título · data ─────────────────────────────────────── */}
          <div className={styles.pageHeader}>
            <div className={styles.headerLeft}>
              <div className={styles.headerMeta}>
                <h1 className={styles.pageTitle}>{event.name}</h1>
                <span className={styles.pageDate}>
                  <Calendar size={12} className={styles.pageDateIcon} />
                  {event.endDate
                    ? `${event.startDate} – ${event.endDate}`
                    : event.startDate}
                  <span className={styles.pageDateId}> · {event.id}</span>
                </span>
              </div>
            </div>

            {/* "Realizar avaliação" só para empresa — ação global do evento */}
            {role === 'empresa' && (
              <div className={styles.headerRight}>
                <button className={styles.avaliacaoBtn}>
                  <Star size={14} />
                  Realizar avaliação
                </button>
              </div>
            )}
          </div>

          {/* ── Tabs ───────────────────────────────────────────────────── */}
          <div className={styles.tabs}>
            {TABS.map(tab => {
              const isDisabled = tab.id === 'relatorio' && role === 'empresa' && !reportPublished;
              const isActive   = activeTab === tab.id;
              return (
                <div key={tab.id} className={styles.tabWrap}>
                  <button
                    className={[
                      styles.tab,
                      isActive   ? styles.tabActive   : '',
                      isDisabled ? styles.tabDisabled : '',
                    ].filter(Boolean).join(' ')}
                    onClick={() => !isDisabled && setActiveTab(tab.id)}
                    disabled={isDisabled}
                    onMouseEnter={isDisabled ? e => setTabTooltip({ x: e.clientX, y: e.clientY }) : undefined}
                    onMouseMove ={isDisabled ? e => setTabTooltip({ x: e.clientX, y: e.clientY }) : undefined}
                    onMouseLeave={isDisabled ? ()  => setTabTooltip(null)                          : undefined}
                  >
                    <span className={styles.tabIcon}>{tab.icon}</span>
                    {tab.label}
                    {isDisabled && <AlertCircle size={11} className={styles.tabLockIcon} />}
                  </button>
                </div>
              );
            })}
          </div>

          {/* ── Tab content ────────────────────────────────────────────── */}
          <div className={styles.tabContent}>

            {activeTab === 'visao-geral' && (
              <>
                {/* Barra de ações — abaixo das tabs, escopo da aba Visão Geral */}
                {role === 'adm' && (
                  <div className={styles.configActionBar}>
                    <span
                      className={styles.configStatusBadge}
                      style={statusStyle[configStatus]}
                    >
                      {statusLabel[configStatus]}
                    </span>
                    <div className={styles.configActionBtns}>
                      {!editMode && (
                        <button className={styles.editBtn} onClick={() => setEditMode(true)}>
                          <Pencil size={14} />
                          Editar
                        </button>
                      )}
                      {editMode && (
                        <>
                          <button className={styles.cancelBtn} onClick={handleCancel}>
                            <X size={14} />
                            Cancelar
                          </button>
                          <button className={styles.saveBtn} onClick={handleSave}>
                            <Check size={14} />
                            Salvar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <CRMSection event={event} detail={detail} role={role} />

                <ConfigSection
                  role={role}
                  detail={detail}
                  editMode={editMode}
                  ev={displayValues}
                  setEv={setEditValues}
                />
              </>
            )}

            {activeTab === 'profissionais' && (
              <ProfissionaisTab
                role={role}
                event={event}
                serviceConfig={detail.serviceConfig}
                configStatus={configStatus}
              />
            )}

            {activeTab === 'agendamentos' && (
              <AgendamentosTab
                role={role}
                event={event}
                detail={detail}
              />
            )}

            {activeTab === 'avaliacao' && (
              <AvaliacaoTab
                role={role}
                event={event}
                detail={detail}
              />
            )}

            {activeTab === 'relatorio' && (
              <RelatorioTab
                role={role}
                event={event}
                detail={detail}
                published={reportPublished}
                onPublish={() => setReportPublished(true)}
              />
            )}

          </div>

        </div>
      </div>

      {/* Tooltip da aba Relatório (empresa) */}
      {tabTooltip && role === 'empresa' && !reportPublished && (
        <div
          className={tooltipStyles.tip}
          style={{
            position: 'fixed',
            left: tabTooltip.x,
            top: tabTooltip.y - 44,
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            zIndex: 9999,
            opacity: 1,
          }}
        >
          O relatório ainda não foi publicado.
        </div>
      )}
    </div>
  );
}
