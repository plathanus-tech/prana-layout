// TELA: Detalhe da Pesquisa
// ROLES COM ACESSO: adm, empresa
// PERMISSÕES:
//   adm     → abas Beneficiário + Gestor, coluna Empresa no sub-título
//   empresa → apenas aba Beneficiário

import { useState } from 'react';
import { ArrowLeft, Users, Star } from 'lucide-react';
import { Sidebar } from '../../../components/Sidebar/Sidebar';
import type { UserRole } from './UsersScreen';
import type { Pesquisa } from './PesquisaScreen';
import styles from './PesquisaDetailScreen.module.css';
import tooltipStyles from '../../../components/Tooltip/Tooltip.module.css';

// ─── Types ────────────────────────────────────────────────────────────────────
type DetailTab  = 'beneficiario';
type AreaKey    = 'Bem-estar' | 'Relaxamento' | 'Foco' | 'Clima' | 'Engajamento';
type PesquisaStatus = 'concluida' | 'enviada' | 'aguardando';

interface BenefQuestion {
  id:    string;
  texto: string;
  area:  AreaKey;
  grupo: 'servico' | 'evento';
  peso:  number;
}

interface BenefResponse {
  id:          string;
  respondente: string;
  data:        string; // 'DD/MM/AAAA'
  scores:      Record<string, number>; // questionId → 1–5
}

interface GestorInfo {
  participantes: number;
  servicos:      string[];
  localizacao:   string;
  periodo:       string;
}

interface GestorObjetiva {
  pergunta: string;
  resposta: 'sim' | 'parcialmente' | 'nao';
}

interface GestorDetail {
  info:        GestorInfo;
  escala:      number; // 1–5
  objetivas:   GestorObjetiva[];
  diferenciais:string[];
  melhorias:   string[];
}

interface PesquisaDetail {
  totalConvidados: number;
  respostas:       BenefResponse[];
  gestor?:         GestorDetail;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const BENEF_QUESTIONS: BenefQuestion[] = [
  { id: 'Q1', texto: 'O serviço contribuiu para seu bem-estar físico?',       area: 'Bem-estar',   grupo: 'servico', peso: 1.5 },
  { id: 'Q2', texto: 'Você se sentiu relaxado após o atendimento?',            area: 'Relaxamento', grupo: 'servico', peso: 1.5 },
  { id: 'Q3', texto: 'O atendimento ajudou a melhorar seu foco no trabalho?', area: 'Foco',        grupo: 'servico', peso: 1.0 },
  { id: 'Q4', texto: 'Como você avalia o clima e a organização do evento?',    area: 'Clima',       grupo: 'evento',  peso: 1.0 },
  { id: 'Q5', texto: 'Você se sentiu engajado e motivado durante o evento?',  area: 'Engajamento', grupo: 'evento',  peso: 1.0 },
];

const AREA_COLORS: Record<AreaKey, { bg: string; border: string; color: string }> = {
  'Bem-estar':   { bg: 'var(--color-status-success-bg)', border: 'var(--color-green-300)',  color: 'var(--color-status-success-fg)' },
  'Relaxamento': { bg: '#EFF6FF',                        border: '#93C5FD',                 color: '#1D4ED8'                        },
  'Foco':        { bg: '#F5F3FF',                        border: '#C4B5FD',                 color: '#6D28D9'                        },
  'Clima':       { bg: 'var(--color-bg-brand)',          border: 'var(--color-brand-300)',  color: 'var(--color-brand-600)'         },
  'Engajamento': { bg: '#FFF7ED',                        border: '#FCD34D',                 color: '#B45309'                        },
};

// Ordem das áreas no radar (pentágono)
const RADAR_AREAS: AreaKey[] = ['Bem-estar', 'Relaxamento', 'Foco', 'Engajamento', 'Clima'];

interface StatusCfg { label: string; bg: string; border: string; color: string; }
const PESQUISA_STATUS: Record<PesquisaStatus, StatusCfg> = {
  concluida:  { label: 'Concluída',  bg: 'var(--color-gray-100)',          border: 'var(--color-gray-300)',  color: 'var(--color-text-secondary)'   },
  enviada:    { label: 'Enviada',    bg: 'var(--color-status-info-bg)',     border: 'var(--color-blue-300)',  color: 'var(--color-status-info-fg)'   },
  aguardando: { label: 'Aguardando', bg: 'var(--color-status-warning-bg)', border: '#FDE047',                color: 'var(--color-status-warning-fg)' },
};

const MONTH_NAMES_PT = [
  'janeiro','fevereiro','março','abril','maio','junho',
  'julho','agosto','setembro','outubro','novembro','dezembro',
];

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const MOCK_DETAILS: Record<string, PesquisaDetail> = {
  'PSQ-001': {
    totalConvidados: 40,
    respostas: [
      { id: 'R1', respondente: 'Ana Lima',       data: '16/04/2026', scores: { Q1: 5, Q2: 5, Q3: 4, Q4: 4, Q5: 5 } },
      { id: 'R2', respondente: 'Bruno Costa',    data: '16/04/2026', scores: { Q1: 4, Q2: 4, Q3: 3, Q4: 5, Q5: 4 } },
      { id: 'R3', respondente: 'Carla Mendes',   data: '16/04/2026', scores: { Q1: 5, Q2: 4, Q3: 4, Q4: 4, Q5: 4 } },
      { id: 'R4', respondente: 'Diego Santos',   data: '17/04/2026', scores: { Q1: 4, Q2: 5, Q3: 5, Q4: 3, Q5: 4 } },
      { id: 'R5', respondente: 'Elena Ferreira', data: '17/04/2026', scores: { Q1: 3, Q2: 4, Q3: 3, Q4: 4, Q5: 3 } },
    ],
  },
  'PSQ-002': {
    totalConvidados: 22,
    respostas: [
      { id: 'R1',  respondente: 'Fernando Alves',   data: '11/03/2026', scores: { Q1: 5, Q2: 5, Q3: 4, Q4: 4, Q5: 5 } },
      { id: 'R2',  respondente: 'Gabriela Lima',    data: '11/03/2026', scores: { Q1: 4, Q2: 5, Q3: 4, Q4: 5, Q5: 5 } },
      { id: 'R3',  respondente: 'Henrique Melo',    data: '11/03/2026', scores: { Q1: 5, Q2: 4, Q3: 3, Q4: 4, Q5: 4 } },
      { id: 'R4',  respondente: 'Isabela Torres',   data: '11/03/2026', scores: { Q1: 4, Q2: 4, Q3: 4, Q4: 4, Q5: 4 } },
      { id: 'R5',  respondente: 'João Carvalho',    data: '12/03/2026', scores: { Q1: 5, Q2: 5, Q3: 5, Q4: 5, Q5: 5 } },
      { id: 'R6',  respondente: 'Karen Oliveira',   data: '12/03/2026', scores: { Q1: 4, Q2: 4, Q3: 4, Q4: 4, Q5: 5 } },
      { id: 'R7',  respondente: 'Lucas Pereira',    data: '12/03/2026', scores: { Q1: 5, Q2: 5, Q3: 4, Q4: 5, Q5: 4 } },
      { id: 'R8',  respondente: 'Mariana Souza',    data: '12/03/2026', scores: { Q1: 4, Q2: 3, Q3: 4, Q4: 4, Q5: 4 } },
      { id: 'R9',  respondente: 'Nicolau Ramos',    data: '12/03/2026', scores: { Q1: 5, Q2: 5, Q3: 5, Q4: 4, Q5: 5 } },
      { id: 'R10', respondente: 'Olivia Martins',   data: '12/03/2026', scores: { Q1: 4, Q2: 4, Q3: 3, Q4: 5, Q5: 4 } },
      { id: 'R11', respondente: 'Paulo Vieira',     data: '12/03/2026', scores: { Q1: 5, Q2: 4, Q3: 4, Q4: 4, Q5: 5 } },
      { id: 'R12', respondente: 'Quirino Faria',    data: '12/03/2026', scores: { Q1: 4, Q2: 5, Q3: 4, Q4: 4, Q5: 4 } },
      { id: 'R13', respondente: 'Renata Castro',    data: '12/03/2026', scores: { Q1: 5, Q2: 4, Q3: 5, Q4: 5, Q5: 5 } },
      { id: 'R14', respondente: 'Sílvio Nunes',     data: '12/03/2026', scores: { Q1: 4, Q2: 4, Q3: 4, Q4: 3, Q5: 4 } },
      { id: 'R15', respondente: 'Tânia Campos',     data: '12/03/2026', scores: { Q1: 5, Q2: 5, Q3: 4, Q4: 5, Q5: 5 } },
      { id: 'R16', respondente: 'Ulisses Gomes',    data: '12/03/2026', scores: { Q1: 3, Q2: 4, Q3: 3, Q4: 4, Q5: 3 } },
      { id: 'R17', respondente: 'Vera Lúcia Dias',  data: '12/03/2026', scores: { Q1: 5, Q2: 5, Q3: 5, Q4: 5, Q5: 5 } },
      { id: 'R18', respondente: 'Wagner Pinto',     data: '12/03/2026', scores: { Q1: 4, Q2: 4, Q3: 4, Q4: 4, Q5: 4 } },
    ],
    gestor: {
      info: { participantes: 22, servicos: ['Ginástica Laboral', 'Quick Massage'], localizacao: 'São Paulo, SP', periodo: 'Março 2026' },
      escala: 4,
      objetivas: [
        { pergunta: 'Os serviços atenderam às expectativas da equipe?',          resposta: 'sim' },
        { pergunta: 'A logística e organização do evento foram satisfatórias?',  resposta: 'sim' },
        { pergunta: 'Os profissionais demonstraram competência e pontualidade?', resposta: 'sim' },
        { pergunta: 'Você contrataria a Prana para próximos eventos?',           resposta: 'sim' },
      ],
      diferenciais: ['Pontualidade', 'Qualidade dos profissionais', 'Variedade de serviços', 'Organização'],
      melhorias: ['Ampliar a duração dos atendimentos', 'Oferecer mais serviços de relaxamento'],
    },
  },
  'PSQ-006': {
    totalConvidados: 20,
    respostas: [
      { id: 'R1',  respondente: 'Adriana Costa',    data: '22/02/2026', scores: { Q1: 4, Q2: 5, Q3: 3, Q4: 4, Q5: 4 } },
      { id: 'R2',  respondente: 'Bernardo Lima',    data: '22/02/2026', scores: { Q1: 3, Q2: 4, Q3: 3, Q4: 3, Q5: 3 } },
      { id: 'R3',  respondente: 'Cláudia Ribeiro',  data: '22/02/2026', scores: { Q1: 5, Q2: 5, Q3: 4, Q4: 4, Q5: 4 } },
      { id: 'R4',  respondente: 'Danilo Sousa',     data: '22/02/2026', scores: { Q1: 4, Q2: 4, Q3: 4, Q4: 4, Q5: 5 } },
      { id: 'R5',  respondente: 'Elaine Prado',     data: '22/02/2026', scores: { Q1: 3, Q2: 3, Q3: 2, Q4: 4, Q5: 3 } },
      { id: 'R6',  respondente: 'Fábio Cunha',      data: '23/02/2026', scores: { Q1: 4, Q2: 4, Q3: 4, Q4: 4, Q5: 4 } },
      { id: 'R7',  respondente: 'Giovana Mello',    data: '23/02/2026', scores: { Q1: 4, Q2: 4, Q3: 3, Q4: 3, Q5: 4 } },
      { id: 'R8',  respondente: 'Hélio Borges',     data: '23/02/2026', scores: { Q1: 5, Q2: 5, Q3: 5, Q4: 5, Q5: 5 } },
      { id: 'R9',  respondente: 'Irene Machado',    data: '23/02/2026', scores: { Q1: 3, Q2: 4, Q3: 3, Q4: 4, Q5: 4 } },
      { id: 'R10', respondente: 'Júlio Tavares',    data: '23/02/2026', scores: { Q1: 4, Q2: 4, Q3: 4, Q4: 4, Q5: 4 } },
      { id: 'R11', respondente: 'Kátia Freitas',    data: '23/02/2026', scores: { Q1: 4, Q2: 3, Q3: 3, Q4: 3, Q5: 3 } },
      { id: 'R12', respondente: 'Leonardo Xavier',  data: '23/02/2026', scores: { Q1: 5, Q2: 5, Q3: 4, Q4: 5, Q5: 4 } },
    ],
    gestor: {
      info: { participantes: 12, servicos: ['Yoga Corporativo', 'Meditação'], localizacao: 'Campinas, SP', periodo: 'Fevereiro 2026' },
      escala: 3,
      objetivas: [
        { pergunta: 'Os serviços atenderam às expectativas da equipe?',          resposta: 'parcialmente' },
        { pergunta: 'A logística e organização do evento foram satisfatórias?',  resposta: 'sim'          },
        { pergunta: 'Os profissionais demonstraram competência e pontualidade?', resposta: 'sim'          },
        { pergunta: 'Você contrataria a Prana para próximos eventos?',           resposta: 'parcialmente' },
      ],
      diferenciais: ['Ambiente relaxante', 'Professora engajada'],
      melhorias: ['Aumentar duração das sessões', 'Ofertar mais horários', 'Incluir meditação guiada'],
    },
  },
  'PSQ-010': {
    totalConvidados: 30,
    respostas: [
      { id: 'R1',  respondente: 'André Fonseca',   data: '05/09/2026', scores: { Q1: 5, Q2: 5, Q3: 5, Q4: 5, Q5: 5 } },
      { id: 'R2',  respondente: 'Beatriz Neves',   data: '05/09/2026', scores: { Q1: 5, Q2: 5, Q3: 4, Q4: 5, Q5: 5 } },
      { id: 'R3',  respondente: 'Carlos Leal',     data: '05/09/2026', scores: { Q1: 4, Q2: 5, Q3: 5, Q4: 4, Q5: 5 } },
      { id: 'R4',  respondente: 'Daniela Franco',  data: '05/09/2026', scores: { Q1: 5, Q2: 4, Q3: 4, Q4: 5, Q5: 4 } },
      { id: 'R5',  respondente: 'Eduardo Bastos',  data: '05/09/2026', scores: { Q1: 5, Q2: 5, Q3: 5, Q4: 5, Q5: 5 } },
      { id: 'R6',  respondente: 'Fernanda Luz',    data: '05/09/2026', scores: { Q1: 4, Q2: 4, Q3: 4, Q4: 4, Q5: 4 } },
      { id: 'R7',  respondente: 'Gustavo Teles',   data: '06/09/2026', scores: { Q1: 5, Q2: 5, Q3: 5, Q4: 5, Q5: 5 } },
      { id: 'R8',  respondente: 'Helena Morais',   data: '06/09/2026', scores: { Q1: 5, Q2: 4, Q3: 4, Q4: 4, Q5: 4 } },
      { id: 'R9',  respondente: 'Igor Coelho',     data: '06/09/2026', scores: { Q1: 4, Q2: 5, Q3: 5, Q4: 5, Q5: 5 } },
      { id: 'R10', respondente: 'Juliana Duarte',  data: '06/09/2026', scores: { Q1: 5, Q2: 5, Q3: 4, Q4: 5, Q5: 5 } },
      { id: 'R11', respondente: 'Kleber Pires',    data: '06/09/2026', scores: { Q1: 4, Q2: 4, Q3: 4, Q4: 4, Q5: 4 } },
      { id: 'R12', respondente: 'Larissa Moura',   data: '06/09/2026', scores: { Q1: 5, Q2: 5, Q3: 5, Q4: 5, Q5: 5 } },
      { id: 'R13', respondente: 'Marcelo Hora',    data: '06/09/2026', scores: { Q1: 4, Q2: 5, Q3: 4, Q4: 5, Q5: 5 } },
      { id: 'R14', respondente: 'Natália Castro',  data: '06/09/2026', scores: { Q1: 5, Q2: 4, Q3: 5, Q4: 4, Q5: 5 } },
      { id: 'R15', respondente: 'Orlando Braga',   data: '07/09/2026', scores: { Q1: 5, Q2: 5, Q3: 5, Q4: 5, Q5: 5 } },
      { id: 'R16', respondente: 'Patrícia Vaz',    data: '07/09/2026', scores: { Q1: 4, Q2: 4, Q3: 4, Q4: 4, Q5: 4 } },
      { id: 'R17', respondente: 'Reinaldo Guedes', data: '07/09/2026', scores: { Q1: 5, Q2: 5, Q3: 5, Q4: 5, Q5: 5 } },
      { id: 'R18', respondente: 'Sandra Brito',    data: '07/09/2026', scores: { Q1: 4, Q2: 5, Q3: 4, Q4: 5, Q5: 4 } },
      { id: 'R19', respondente: 'Tiago Mendes',    data: '07/09/2026', scores: { Q1: 5, Q2: 4, Q3: 5, Q4: 4, Q5: 5 } },
      { id: 'R20', respondente: 'Úrsula Dias',     data: '07/09/2026', scores: { Q1: 5, Q2: 5, Q3: 5, Q4: 5, Q5: 5 } },
      { id: 'R21', respondente: 'Vicente Araújo',  data: '07/09/2026', scores: { Q1: 4, Q2: 4, Q3: 4, Q4: 4, Q5: 4 } },
      { id: 'R22', respondente: 'Wânia Corrêa',    data: '07/09/2026', scores: { Q1: 5, Q2: 5, Q3: 4, Q4: 5, Q5: 5 } },
    ],
    gestor: {
      info: { participantes: 22, servicos: ['Quick Massage', 'Acupuntura', 'Podologia'], localizacao: 'Rio de Janeiro, RJ', periodo: 'Setembro 2026' },
      escala: 5,
      objetivas: [
        { pergunta: 'Os serviços atenderam às expectativas da equipe?',          resposta: 'sim' },
        { pergunta: 'A logística e organização do evento foram satisfatórias?',  resposta: 'sim' },
        { pergunta: 'Os profissionais demonstraram competência e pontualidade?', resposta: 'sim' },
        { pergunta: 'Você contrataria a Prana para próximos eventos?',           resposta: 'sim' },
      ],
      diferenciais: ['Profissionais excepcionais', 'Organização impecável', 'Variedade de serviços', 'Impacto positivo na equipe', 'Agilidade no atendimento'],
      melhorias: ['Nenhuma sugestão neste ciclo'],
    },
  },
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
function formatDataLong(data: string): string {
  const [dd, mm, yyyy] = data.split('/');
  return `${parseInt(dd, 10)} de ${MONTH_NAMES_PT[parseInt(mm, 10) - 1]} de ${yyyy}`;
}

function avgQ(respostas: BenefResponse[], qId: string): number {
  if (respostas.length === 0) return 0;
  const vals = respostas.map(r => r.scores[qId] ?? 0).filter(v => v > 0);
  if (vals.length === 0) return 0;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function avgRow(r: BenefResponse): number {
  const vals = BENEF_QUESTIONS.map(q => r.scores[q.id] ?? 0).filter(v => v > 0);
  if (vals.length === 0) return 0;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

// Cores suavizadas — sem vermelho de erro para não parecer alerta
function scoreColor(v: number): string {
  if (v >= 4.5) return 'var(--color-status-success-fg)';  // verde
  if (v >= 3.5) return 'var(--color-brand-600)';           // brand warm
  if (v >= 2.5) return 'var(--color-status-warning-fg)';   // âmbar
  return '#C05621';                                         // laranja escuro (não vermelho)
}

function computeRadarData(respostas: BenefResponse[]) {
  // areaKey → pergunta mapping (1:1 in this model)
  const qByArea: Record<string, string> = {};
  BENEF_QUESTIONS.forEach(q => { qByArea[q.area] = q.id; });
  return RADAR_AREAS.map(area => ({
    axis:  area,
    value: respostas.length > 0 ? avgQ(respostas, qByArea[area]) : 0,
  }));
}

// ─── Sub-components ────────────────────────────────────────────────────────────

// Radar chart (escala 0–5)
function PesquisaRadarChart({ data }: { data: Array<{ axis: string; value: number }> }) {
  const [hovered, setHovered] = useState<{ label: string; value: number; x: number; y: number } | null>(null);
  const VW = 430, VH = 290;
  const cx = 215, cy = 160, maxR = 110, maxVal = 5;
  const n = data.length;
  const angleOf = (i: number) => -Math.PI / 2 + (2 * Math.PI * i) / n;
  const ptOf = (v: number, i: number) => ({
    x: cx + (v / maxVal) * maxR * Math.cos(angleOf(i)),
    y: cy + (v / maxVal) * maxR * Math.sin(angleOf(i)),
  });
  const levels = [1, 2, 3, 4, 5];
  const dataPolygon = data.map((d, i) => { const p = ptOf(d.value, i); return `${p.x},${p.y}`; }).join(' ');

  return (
    <div className={styles.radarWrap}>
      <svg viewBox={`0 0 ${VW} ${VH}`} style={{ display: 'block', height: '220px', width: 'auto' }}>
        {/* Grid polygons */}
        {levels.map(lv => {
          const pts = data.map((_, i) => { const p = ptOf(lv, i); return `${p.x},${p.y}`; }).join(' ');
          return <polygon key={lv} points={pts} fill="none" stroke="#F0EDEC" strokeWidth="1" />;
        })}
        {/* Level labels */}
        {[2, 4].map(lv => {
          const p = ptOf(lv, 2); // label near axis 2
          return <text key={lv} x={p.x + 3} y={p.y + 3} fontSize="8" fill="#C8C0C0">{lv}</text>;
        })}
        {/* Axis lines */}
        {data.map((_, i) => {
          const end = ptOf(maxVal, i);
          return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="#E8DFE0" strokeWidth="1" />;
        })}
        {/* Data polygon */}
        <polygon points={dataPolygon} fill="#B25557" fillOpacity="0.18" stroke="#B25557" strokeWidth="2" />
        {/* Data dots */}
        {data.map((d, i) => {
          const p = ptOf(d.value, i);
          return (
            <circle
              key={i}
              cx={p.x} cy={p.y}
              r={hovered?.label === d.axis ? 7 : 5}
              fill="#B25557" stroke="#fff" strokeWidth="2"
              style={{ cursor: 'pointer', transition: 'r 120ms' }}
              onMouseMove={e => setHovered({ label: d.axis, value: d.value, x: e.clientX, y: e.clientY })}
              onMouseLeave={() => setHovered(null)}
            />
          );
        })}
        {/* Axis labels */}
        {data.map((d, i) => {
          const angle = angleOf(i);
          const lx = cx + (maxR + 22) * Math.cos(angle);
          const ly = cy + (maxR + 22) * Math.sin(angle);
          const anchor = Math.cos(angle) > 0.15 ? 'start' : Math.cos(angle) < -0.15 ? 'end' : 'middle';
          return (
            <text key={i} x={lx} y={ly + 4} textAnchor={anchor} fontSize="11" fill="#9E8E8F" fontWeight="500">
              {d.axis}
            </text>
          );
        })}
      </svg>
      {hovered && (
        <div className={tooltipStyles.tip} style={{
          position: 'fixed', left: hovered.x, top: hovered.y - 44,
          transform: 'translateX(-50%)', pointerEvents: 'none',
          whiteSpace: 'nowrap', zIndex: 9999, opacity: 1,
        }}>
          {hovered.label}: {hovered.value.toFixed(1)} / 5
        </div>
      )}
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface PesquisaDetailScreenProps {
  pesquisa:       Pesquisa;
  role:           UserRole;
  sidebarOffset?: number;
  onNavChange?:   (item: string) => void;
  onBack:         () => void;
}

// ─── PesquisaDetailScreen ─────────────────────────────────────────────────────
export function PesquisaDetailScreen({
  pesquisa, role, sidebarOffset = 0, onNavChange, onBack,
}: PesquisaDetailScreenProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav,   setActiveNav]   = useState('pesquisa');
  const [activeTab,   setActiveTab]   = useState<DetailTab>('beneficiario');
  const [respPage,    setRespPage]    = useState(1);

  const detail    = MOCK_DETAILS[pesquisa.id] ?? { totalConvidados: 0, respostas: [] };
  const respostas = detail.respostas;

  // Pagination for responses table
  const RESP_PAGE_SIZE = 8;
  const totalRespPages = Math.max(1, Math.ceil(respostas.length / RESP_PAGE_SIZE));
  const pageRespostas  = respostas.slice((respPage - 1) * RESP_PAGE_SIZE, respPage * RESP_PAGE_SIZE);
  const respFrom       = respostas.length === 0 ? 0 : (respPage - 1) * RESP_PAGE_SIZE + 1;
  const respTo         = Math.min(respPage * RESP_PAGE_SIZE, respostas.length);

  // KPI values
  const taxaResp  = detail.totalConvidados > 0
    ? Math.round((respostas.length / detail.totalConvidados) * 100)
    : 0;
  const ibeDisplay = pesquisa.ibe !== null ? pesquisa.ibe.toFixed(1) : '—';

  // Radar
  const radarData = computeRadarData(respostas);

  // Status badge cfg
  const statusCfg = PESQUISA_STATUS[pesquisa.status as PesquisaStatus];

  const showTabs = role === 'adm';

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
          onNavClick={item => { setActiveNav(item); onNavChange?.(item); }}
          user={{ name: role === 'adm' ? 'Admin Prana' : 'RH Empresa', email: role === 'adm' ? 'admin@prana.com' : 'rh@empresa.com', initials: role === 'adm' ? 'AP' : 'RE' }}
          role={role}
        />
      </div>

      <div className={[styles.contentWrap, !sidebarOpen ? styles.contentWrapClosed : ''].filter(Boolean).join(' ')}>
        <div className={styles.contentCard}>

          {/* ── Back nav ──────────────────────────────────────────────────── */}
          <button className={styles.backNav} onClick={onBack}>
            <ArrowLeft size={14} />
            Pesquisa
          </button>

          {/* ── Page Header ───────────────────────────────────────────────── */}
          <div className={styles.pageHeader}>
            <div className={styles.headerMeta}>
              <h1 className={styles.pageTitle}>{pesquisa.eventoNome}</h1>
              <div className={styles.pageSub}>
                <span>{pesquisa.id}</span>
                <span className={styles.pageSubSep}>·</span>
                <span>{formatDataLong(pesquisa.dataEvento)}</span>
                {role === 'adm' && (
                  <>
                    <span className={styles.pageSubSep}>·</span>
                    <span>{pesquisa.empresa}</span>
                  </>
                )}
                <span className={styles.pageSubSep}>·</span>
                <span
                  className={styles.statusBadge}
                  style={{ background: statusCfg.bg, borderColor: statusCfg.border, color: statusCfg.color }}
                >
                  {statusCfg.label}
                </span>
              </div>
            </div>
          </div>

          {/* ── Tabs (admin only — apenas Beneficiário; Gestor centralizado no Detalhe do Evento) ── */}
          {showTabs && (
            <div className={styles.tabs}>
              <button
                className={[styles.tab, styles.tabActive].join(' ')}
              >
                <Users size={14} />
                Beneficiário
              </button>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              ABA: Beneficiário
          ═══════════════════════════════════════════════════════════════════ */}
          {(role === 'empresa' || activeTab === 'beneficiario') && (
            <>

              {/* ── KPI Cards ─────────────────────────────────────────────── */}
              <div className={styles.kpiRow}>

                {/* Respostas recebidas */}
                <div className={styles.kpiCard}>
                  <span className={styles.kpiValue}>
                    {respostas.length}
                    <span className={styles.kpiValueSub}>&nbsp;/ {detail.totalConvidados}</span>
                  </span>
                  <span className={styles.kpiLabel}>Respostas recebidas</span>
                  <span className={styles.kpiSub}>{taxaResp}% de taxa de resposta</span>
                </div>

                {/* IBE */}
                <div className={styles.kpiCard}>
                  <span className={[styles.kpiValue, pesquisa.ibe !== null ? styles.kpiValueBrand : styles.kpiValueDash].join(' ')}>
                    {ibeDisplay}
                  </span>
                  <span className={styles.kpiLabel}>IBE — Índice de Bem-estar</span>
                  <span className={styles.kpiSub}>
                    {pesquisa.ibe !== null ? 'Escala de 0 a 10' : 'Disponível após conclusão'}
                  </span>
                </div>

                {/* Perguntas */}
                <div className={styles.kpiCard}>
                  <span className={styles.kpiValue}>{BENEF_QUESTIONS.length}</span>
                  <span className={styles.kpiLabel}>Perguntas no modelo</span>
                  <span className={styles.kpiSub}>
                    {BENEF_QUESTIONS.filter(q => q.grupo === 'servico').length} por serviço
                    &nbsp;·&nbsp;
                    {BENEF_QUESTIONS.filter(q => q.grupo === 'evento').length} sobre o evento
                  </span>
                </div>

              </div>

              {/* ── Radar por área ────────────────────────────────────────── */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionTitle}>Radar por área</span>
                  <span className={styles.sectionBadge}>Escala 1–5</span>
                </div>
                {respostas.length > 0 ? (
                  <PesquisaRadarChart data={radarData} />
                ) : (
                  <p className={styles.radarEmpty}>
                    Sem respostas suficientes para gerar o radar.
                  </p>
                )}
              </div>

              {/* ── Médias por pergunta ───────────────────────────────────── */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionTitle}>Médias por pergunta</span>
                  <span className={styles.sectionBadge}>{BENEF_QUESTIONS.length} perguntas</span>
                </div>

                {/* Grupo: Por serviço */}
                <div className={styles.questionGroupTitle}>Por serviço</div>
                {BENEF_QUESTIONS.filter(q => q.grupo === 'servico').map(q => {
                  const media  = avgQ(respostas, q.id);
                  const hasData = respostas.length > 0;
                  return (
                    <div key={q.id} className={styles.questionRow}>
                      {/* Texto principal + meta secundária */}
                      <div className={styles.questionBody}>
                        <span className={styles.questionText}>{q.texto}</span>
                        <span className={styles.questionMeta}>
                          {q.area}&nbsp;·&nbsp;Peso {q.peso.toFixed(1)}
                        </span>
                      </div>
                      {/* Barra + nota */}
                      <div className={styles.questionRight}>
                        {hasData && (
                          <div className={styles.questionBarWrap}>
                            <div
                              className={styles.questionBar}
                              style={{ width: `${(media / 5) * 100}%`, background: scoreColor(media) }}
                            />
                          </div>
                        )}
                        <span
                          className={styles.questionMean}
                          style={{ color: hasData ? scoreColor(media) : 'var(--color-text-tertiary)' }}
                        >
                          {hasData ? media.toFixed(1) : '—'}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Grupo: Sobre o evento — separação visual reforçada */}
                <div className={[styles.questionGroupTitle, styles.questionGroupTitleSep].join(' ')}>Sobre o evento</div>
                {BENEF_QUESTIONS.filter(q => q.grupo === 'evento').map(q => {
                  const media  = avgQ(respostas, q.id);
                  const hasData = respostas.length > 0;
                  return (
                    <div key={q.id} className={styles.questionRow}>
                      <div className={styles.questionBody}>
                        <span className={styles.questionText}>{q.texto}</span>
                        <span className={styles.questionMeta}>
                          {q.area}&nbsp;·&nbsp;Peso {q.peso.toFixed(1)}
                        </span>
                      </div>
                      <div className={styles.questionRight}>
                        {hasData && (
                          <div className={styles.questionBarWrap}>
                            <div
                              className={styles.questionBar}
                              style={{ width: `${(media / 5) * 100}%`, background: scoreColor(media) }}
                            />
                          </div>
                        )}
                        <span
                          className={styles.questionMean}
                          style={{ color: hasData ? scoreColor(media) : 'var(--color-text-tertiary)' }}
                        >
                          {hasData ? media.toFixed(1) : '—'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── Respostas individuais ─────────────────────────────────── */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionTitle}>Respostas individuais</span>
                  <span className={styles.sectionBadge}>{respostas.length} resposta{respostas.length !== 1 ? 's' : ''}</span>
                </div>

                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr className={styles.headerRow}>
                        <th className={styles.th}>Respondente</th>
                        <th className={styles.th}>Data</th>
                        {BENEF_QUESTIONS.map(q => (
                          <th key={q.id} className={[styles.th, styles.thCenter].join(' ')}>
                            {q.area}
                          </th>
                        ))}
                        <th className={[styles.th, styles.thCenter].join(' ')}>Média</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageRespostas.length === 0 ? (
                        <tr>
                          <td colSpan={BENEF_QUESTIONS.length + 3} className={styles.emptyCell}>
                            Nenhuma resposta registrada.
                          </td>
                        </tr>
                      ) : (
                        pageRespostas.map(r => {
                          const media = avgRow(r);
                          return (
                            <tr key={r.id} className={styles.tr}>
                              <td className={styles.td}>
                                <span className={styles.cellName}>{r.respondente}</span>
                              </td>
                              <td className={styles.td}>
                                <span className={styles.cellText}>{r.data}</span>
                              </td>
                              {BENEF_QUESTIONS.map(q => {
                                const v = r.scores[q.id] ?? 0;
                                return (
                                  <td key={q.id} className={[styles.td, styles.tdCenter].join(' ')}>
                                    <span className={styles.scoreNum} style={{ color: scoreColor(v) }}>{v}</span>
                                  </td>
                                );
                              })}
                              <td className={[styles.td, styles.tdCenter].join(' ')}>
                                <span className={[styles.scoreNum, styles.scoreNumMean].join(' ')} style={{ color: scoreColor(media) }}>
                                  {media.toFixed(1)}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {respostas.length > RESP_PAGE_SIZE && (
                  <div className={styles.pagination}>
                    <span className={styles.paginationInfo}>
                      Mostrando {respFrom}–{respTo} de {respostas.length} respostas
                    </span>
                    <div className={styles.paginationControls}>
                      <button className={styles.pageBtn} onClick={() => setRespPage(p => Math.max(1, p - 1))} disabled={respPage === 1}>←</button>
                      {Array.from({ length: totalRespPages }, (_, i) => i + 1).map(n => (
                        <button
                          key={n}
                          className={[styles.pageBtn, respPage === n ? styles.pageBtnActive : ''].filter(Boolean).join(' ')}
                          onClick={() => setRespPage(n)}
                        >
                          {n}
                        </button>
                      ))}
                      <button className={styles.pageBtn} onClick={() => setRespPage(p => Math.min(totalRespPages, p + 1))} disabled={respPage === totalRespPages}>→</button>
                    </div>
                  </div>
                )}
              </div>

            </>
          )}


        </div>
      </div>
    </div>
  );
}
