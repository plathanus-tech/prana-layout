// TELA: Pesquisa
// ROLES COM ACESSO: adm (abas Pesquisas + Modelos), empresa (apenas Pesquisas)
// PERMISSÕES:
//   adm     → todas as pesquisas, coluna empresa, aba Modelos, botão Novo modelo
//   empresa → apenas listagem de pesquisas, sem coluna empresa, sem aba Modelos

import { useState } from 'react';
import { Search, Link2, Eye, Check, Plus, X, ClipboardList, LayoutTemplate, ChevronDown, Pencil, Trash2 } from 'lucide-react';
import { Sidebar } from '../../../components/Sidebar/Sidebar';
import { Button } from '../../../components/Button/Button';
import { Feedback } from '../../../components/Feedback/Feedback';
import type { UserRole } from './UsersScreen';
import styles from './PesquisaScreen.module.css';

// ─── Types ────────────────────────────────────────────────────────────────────
type PesquisaStatus  = 'concluida' | 'enviada' | 'aguardando';
type ModeloPublico   = 'beneficiario' | 'gestor' | 'profissional';
type PesquisaTabType = 'pesquisas' | 'modelos';

export interface Pesquisa {
  id:         string;
  eventoNome: string;
  empresa:    string;
  dataEvento: string; // 'DD/MM/AAAA'
  ibe:        number | null; // null enquanto não concluída
  status:     PesquisaStatus;
  modeloId?:  string;        // modelo de pesquisa associado
}

interface ModeloPesquisa {
  id:                  string;
  nome:                string;
  publico:             ModeloPublico;
  quantidadePerguntas: number;
  perguntas?:          QuestionDraft[];
}

// ─── Modelo builder types ─────────────────────────────────────────────────────
const PILARES = ['Bem-estar', 'Foco', 'Relaxamento', 'Clima', 'Engajamento'] as const;
type Pilar = typeof PILARES[number];

const SERVICOS_LISTA = [
  'Auriculoterapia', 'Do-in', 'Ginástica laboral', 'Manicure e esmaltação',
  'Massagem Indian Head', 'Massagem terapêutica', 'Meditação imersiva',
  'Meditação laboral', 'Mindfulness', 'Palestra bem-estar',
  'Partner de experiência', 'Quick massagem', 'Reflexologia',
  'SPA de mãos ou pés', 'Yoga', 'Yoga laboral',
] as const;

type Escopo        = 'geral' | 'por_servico' | '';
type TipoResposta  = 'escala' | 'personalizada' | '';
type EscalaOpcao   = '1_5' | '1_10' | '';

interface QuestionDraft {
  id:                   string;
  texto:                string;
  pilar:                Pilar | '';
  peso:                 string;
  escopo:               Escopo;
  servico:              string;
  tipoResposta:         TipoResposta;
  escalaOpcao:          EscalaOpcao;
  opcoesPersonalizadas: string[];
}

function newQId() { return `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`; }
function newQuestion(): QuestionDraft {
  return {
    id: newQId(), texto: '', pilar: '', peso: '1.0',
    escopo: '', servico: '', tipoResposta: '',
    // Inicia com 3 opções para ilustrar o gradiente mínimo/meio/máximo
    escalaOpcao: '', opcoesPersonalizadas: ['', '', ''],
  };
}

// Cor semântica da track: índice 0 = vermelho → meio = âmbar → último = verde
function optTrackColor(idx: number, total: number): string {
  if (total <= 1) return 'var(--color-gray-300)';
  const ratio = idx / (total - 1);
  if (ratio <= 0)    return '#EF4444'; // vermelho
  if (ratio <= 0.25) return '#F97316'; // laranja
  if (ratio <= 0.55) return '#EAB308'; // âmbar
  if (ratio <= 0.80) return '#84CC16'; // lima
  return '#22C55E';                    // verde
}

// ─── Status config ────────────────────────────────────────────────────────────
interface StatusCfg { label: string; bg: string; border: string; color: string; }

const PESQUISA_STATUS: Record<PesquisaStatus, StatusCfg> = {
  concluida: {
    label:  'Concluída',
    bg:     'var(--color-gray-100)',
    border: 'var(--color-gray-300)',
    color:  'var(--color-text-secondary)',
  },
  enviada: {
    label:  'Enviada',
    bg:     'var(--color-status-info-bg)',
    border: 'var(--color-blue-300)',
    color:  'var(--color-status-info-fg)',
  },
  aguardando: {
    label:  'Aguardando',
    bg:     'var(--color-status-warning-bg)',
    border: '#FDE047',
    color:  'var(--color-status-warning-fg)',
  },
};

const MODELO_PUBLICO_LABEL: Record<ModeloPublico, string> = {
  beneficiario: 'Beneficiário',
  gestor:       'Gestor',
  profissional: 'Profissional',
};

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const MOCK_PESQUISAS: Pesquisa[] = [
  { id: 'PSQ-001', eventoNome: 'SIPAT - Itaú Unibanco',        empresa: 'Itaú Unibanco',  dataEvento: '15/04/2026', ibe: null, status: 'enviada',    modeloId: 'MOD-001' },
  { id: 'PSQ-002', eventoNome: 'Ginástica Laboral - Bradesco',  empresa: 'Bradesco',       dataEvento: '11/03/2026', ibe: 8.7,  status: 'concluida',  modeloId: 'MOD-001' },
  { id: 'PSQ-003', eventoNome: 'Semana da Saúde - Natura',      empresa: 'Natura',         dataEvento: '15/04/2026', ibe: null, status: 'enviada',    modeloId: 'MOD-001' },
  { id: 'PSQ-004', eventoNome: 'Dia da Saúde - Ambev',          empresa: 'Ambev',          dataEvento: '21/05/2026', ibe: null, status: 'aguardando', modeloId: 'MOD-002' },
  { id: 'PSQ-005', eventoNome: 'Quick Massage - Vale',          empresa: 'Vale',           dataEvento: '05/06/2026', ibe: null, status: 'aguardando', modeloId: 'MOD-004' },
  { id: 'PSQ-006', eventoNome: 'Yoga Corporativo - Magalu',     empresa: 'Magazine Luiza', dataEvento: '22/02/2026', ibe: 7.4,  status: 'concluida',  modeloId: 'MOD-002' },
  { id: 'PSQ-007', eventoNome: 'Meditação - iFood',             empresa: 'iFood',          dataEvento: '02/07/2026', ibe: null, status: 'aguardando', modeloId: 'MOD-001' },
  { id: 'PSQ-008', eventoNome: 'SIPAT - Renner',                empresa: 'Renner',         dataEvento: '17/07/2026', ibe: null, status: 'aguardando', modeloId: 'MOD-005' },
  { id: 'PSQ-009', eventoNome: 'Wellbeing Day - Santander',     empresa: 'Santander',      dataEvento: '29/08/2026', ibe: null, status: 'aguardando', modeloId: 'MOD-003' },
  { id: 'PSQ-010', eventoNome: 'CIPA - Petrobras',              empresa: 'Petrobras',      dataEvento: '05/09/2026', ibe: 9.1,  status: 'concluida',  modeloId: 'MOD-005' },
];

// Retorna as pesquisas ativas (enviada ou aguardando) que usam o modelo
function getActivePesquisas(modeloId: string): Pesquisa[] {
  return MOCK_PESQUISAS.filter(
    p => p.modeloId === modeloId && (p.status === 'enviada' || p.status === 'aguardando')
  );
}

const MOCK_MODELOS: ModeloPesquisa[] = [
  {
    id: 'MOD-001', nome: 'Pós-evento Beneficiário', publico: 'beneficiario', quantidadePerguntas: 4,
    perguntas: [
      { id: 'mq1a', texto: 'O serviço contribuiu para o seu bem-estar neste dia?', pilar: 'Bem-estar',    peso: '1.5', escopo: 'geral', servico: '', tipoResposta: 'escala',       escalaOpcao: '1_5', opcoesPersonalizadas: ['', '', ''] },
      { id: 'mq1b', texto: 'Como você avalia a qualidade do profissional?',          pilar: 'Engajamento', peso: '2.0', escopo: 'geral', servico: '', tipoResposta: 'personalizada', escalaOpcao: '',    opcoesPersonalizadas: ['Péssimo', 'Ruim', 'Regular', 'Bom', 'Excelente'] },
      { id: 'mq1c', texto: 'O ambiente estava propício para a atividade?',           pilar: 'Relaxamento', peso: '1.0', escopo: 'geral', servico: '', tipoResposta: 'escala',       escalaOpcao: '1_5', opcoesPersonalizadas: ['', '', ''] },
      { id: 'mq1d', texto: 'Você recomendaria este serviço para colegas?',           pilar: 'Clima',       peso: '1.5', escopo: 'geral', servico: '', tipoResposta: 'escala',       escalaOpcao: '1_10', opcoesPersonalizadas: ['', '', ''] },
    ],
  },
  {
    id: 'MOD-002', nome: 'Avaliação do Gestor', publico: 'gestor', quantidadePerguntas: 3,
    perguntas: [
      { id: 'mq2a', texto: 'Os objetivos da ação foram comunicados claramente à equipe?', pilar: 'Engajamento', peso: '1.0', escopo: 'geral', servico: '', tipoResposta: 'escala',       escalaOpcao: '1_5', opcoesPersonalizadas: ['', '', ''] },
      { id: 'mq2b', texto: 'Os resultados observados justificam o investimento?',          pilar: 'Clima',       peso: '2.0', escopo: 'geral', servico: '', tipoResposta: 'personalizada', escalaOpcao: '',    opcoesPersonalizadas: ['Não justifica', 'Justifica parcialmente', 'Justifica plenamente'] },
      { id: 'mq2c', texto: 'A equipe demonstrou melhora no clima após a ação?',           pilar: 'Clima',       peso: '1.5', escopo: 'geral', servico: '', tipoResposta: 'escala',       escalaOpcao: '1_5', opcoesPersonalizadas: ['', '', ''] },
    ],
  },
  {
    id: 'MOD-003', nome: 'Feedback Profissional', publico: 'profissional', quantidadePerguntas: 3,
    perguntas: [
      { id: 'mq3a', texto: 'A logística do evento (espaço, materiais) atendeu às necessidades?', pilar: 'Bem-estar',   peso: '1.0', escopo: 'geral',        servico: '',                  tipoResposta: 'escala',       escalaOpcao: '1_5', opcoesPersonalizadas: ['', '', ''] },
      { id: 'mq3b', texto: 'O volume de atendimentos foi adequado para a duração do evento?',     pilar: 'Foco',        peso: '1.0', escopo: 'geral',        servico: '',                  tipoResposta: 'personalizada', escalaOpcao: '',   opcoesPersonalizadas: ['Insuficiente', 'Adequado', 'Excessivo'] },
      { id: 'mq3c', texto: 'A qualidade da Quick Massage realizada foi satisfatória?',            pilar: 'Relaxamento', peso: '1.5', escopo: 'por_servico', servico: 'Quick massagem',    tipoResposta: 'escala',       escalaOpcao: '1_5', opcoesPersonalizadas: ['', '', ''] },
    ],
  },
  {
    id: 'MOD-004', nome: 'NPS Beneficiário', publico: 'beneficiario', quantidadePerguntas: 2,
    perguntas: [
      { id: 'mq4a', texto: 'De 1 a 10, qual a probabilidade de você recomendar o programa para um colega?', pilar: 'Engajamento', peso: '2.0', escopo: 'geral', servico: '', tipoResposta: 'escala', escalaOpcao: '1_10', opcoesPersonalizadas: ['', '', ''] },
      { id: 'mq4b', texto: 'O que poderia ser melhorado para aumentar sua satisfação?',                      pilar: 'Bem-estar',   peso: '1.0', escopo: 'geral', servico: '', tipoResposta: 'personalizada', escalaOpcao: '', opcoesPersonalizadas: ['Nada', 'Variedade de serviços', 'Frequência dos eventos', 'Duração das sessões'] },
    ],
  },
  {
    id: 'MOD-005', nome: 'Clima Organizacional', publico: 'gestor', quantidadePerguntas: 4,
    perguntas: [
      { id: 'mq5a', texto: 'O nível de engajamento da equipe melhorou após as ações de bem-estar?', pilar: 'Engajamento', peso: '2.0', escopo: 'geral', servico: '', tipoResposta: 'escala', escalaOpcao: '1_5', opcoesPersonalizadas: ['', '', ''] },
      { id: 'mq5b', texto: 'Houve redução nos índices de absenteísmo observados?',                  pilar: 'Clima',       peso: '1.5', escopo: 'geral', servico: '', tipoResposta: 'personalizada', escalaOpcao: '', opcoesPersonalizadas: ['Nenhuma redução', 'Redução pequena', 'Redução moderada', 'Redução expressiva'] },
      { id: 'mq5c', texto: 'O programa atende às necessidades de saúde da equipe?',                  pilar: 'Bem-estar',   peso: '1.5', escopo: 'geral', servico: '', tipoResposta: 'escala', escalaOpcao: '1_5', opcoesPersonalizadas: ['', '', ''] },
      { id: 'mq5d', texto: 'Os colaboradores demonstraram maior foco e produtividade?',              pilar: 'Foco',        peso: '2.0', escopo: 'geral', servico: '', tipoResposta: 'escala', escalaOpcao: '1_5', opcoesPersonalizadas: ['', '', ''] },
    ],
  },
];

// ─── Opções de filtro derivadas dos dados ─────────────────────────────────────
const MONTH_LABELS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

const DATA_OPTIONS = Array.from(
  new Set(MOCK_PESQUISAS.map(p => p.dataEvento.slice(3))) // 'MM/AAAA'
).sort().map(mv => {
  const [mm, aaaa] = mv.split('/');
  return { value: mv, label: `${MONTH_LABELS[parseInt(mm, 10) - 1]} ${aaaa}` };
});

const EMPRESA_OPTIONS = Array.from(
  new Set(MOCK_PESQUISAS.map(p => p.empresa))
).sort();

// ─── Paginação ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 8;

// ─── Status Badge ─────────────────────────────────────────────────────────────
function PesquisaStatusBadge({ status }: { status: PesquisaStatus }) {
  const cfg = PESQUISA_STATUS[status];
  return (
    <span
      className={styles.statusBadge}
      style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────
interface TooltipState { text: string; x: number; y: number; }

// ─── NovoModeloModal ──────────────────────────────────────────────────────────
interface NovoModeloModalProps {
  onClose: () => void;
  onSave:  (nome: string, publico: ModeloPublico, perguntas: QuestionDraft[]) => void;
}

function NovoModeloModal({ onClose, onSave }: NovoModeloModalProps) {
  const [nome,      setNome]      = useState('');
  const [publico,   setPublico]   = useState<ModeloPublico | ''>('');
  const [perguntas, setPerguntas] = useState<QuestionDraft[]>([newQuestion()]);

  function updateQ(id: string, patch: Partial<QuestionDraft>) {
    setPerguntas(ps => ps.map(p => p.id === id ? { ...p, ...patch } : p));
  }
  function removeQ(id: string) {
    setPerguntas(ps => ps.filter(p => p.id !== id));
  }
  function addQ() {
    setPerguntas(ps => [...ps, newQuestion()]);
  }
  function updateOpcao(qId: string, idx: number, val: string) {
    setPerguntas(ps => ps.map(p => {
      if (p.id !== qId) return p;
      const opts = [...p.opcoesPersonalizadas]; opts[idx] = val;
      return { ...p, opcoesPersonalizadas: opts };
    }));
  }
  function addOpcao(qId: string) {
    setPerguntas(ps => ps.map(p => {
      if (p.id !== qId || p.opcoesPersonalizadas.length >= 10) return p;
      return { ...p, opcoesPersonalizadas: [...p.opcoesPersonalizadas, ''] };
    }));
  }
  function removeOpcao(qId: string, idx: number) {
    setPerguntas(ps => ps.map(p => {
      // Mantém mínimo de 2 opções (valor mínimo + valor máximo)
      if (p.id !== qId || p.opcoesPersonalizadas.length <= 2) return p;
      return { ...p, opcoesPersonalizadas: p.opcoesPersonalizadas.filter((_, i) => i !== idx) };
    }));
  }

  const canSave = nome.trim() !== '' && publico !== '';

  return (
    <div
      className={styles.modalOverlay}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={[styles.modalCard, styles.modalCardLg].join(' ')}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className={styles.modalHeader}>
          <div className={styles.modalTitleRow}>
            <LayoutTemplate size={16} className={styles.modalTitleIcon} />
            <span className={styles.modalTitle}>Novo modelo de pesquisa</span>
          </div>
          <button className={styles.modalClose} onClick={onClose}><X size={14} /></button>
        </div>

        {/* ── Body (scrollável) ────────────────────────────────────────────── */}
        <div className={styles.modalBody}>

          {/* Seção: Informações básicas */}
          <div className={styles.modalSection}>
            <span className={styles.modalSectionTitle}>Informações básicas</span>
            <div className={styles.modalFields}>

              {/* Nome */}
              <div className={styles.modalField}>
                <label className={styles.modalFieldLabel}>
                  Nome do modelo&nbsp;<span className={styles.modalFieldRequired}>*</span>
                </label>
                <input
                  type="text"
                  className={styles.modalInput}
                  placeholder="Ex.: Pós-evento Beneficiário"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                />
              </div>

              {/* Público-alvo */}
              <div className={styles.modalField}>
                <label className={styles.modalFieldLabel}>
                  Público-alvo&nbsp;<span className={styles.modalFieldRequired}>*</span>
                </label>
                <div className={styles.modalSelectWrap}>
                  <select
                    className={styles.modalSelect}
                    value={publico}
                    onChange={e => setPublico(e.target.value as ModeloPublico | '')}
                  >
                    <option value="">Selecione o público…</option>
                    <option value="beneficiario">Beneficiário</option>
                    <option value="gestor">Gestor</option>
                    <option value="profissional">Profissional</option>
                  </select>
                  <ChevronDown size={13} className={styles.modalSelectChevron} />
                </div>
              </div>

            </div>
          </div>

          <div className={styles.modalDivider} />

          {/* Seção: Perguntas */}
          <div className={styles.modalSection}>
            <div className={styles.modalSectionRow}>
              <span className={styles.modalSectionTitle}>Perguntas</span>
              <span className={styles.modalSectionBadge}>{perguntas.length}</span>
            </div>

            <div className={styles.qList}>
              {perguntas.map((q, idx) => (
                <div key={q.id} className={styles.qCard}>

                  {/* Card header */}
                  <div className={styles.qCardHeader}>
                    <span className={styles.qCardNum}>Pergunta {idx + 1}</span>
                    {perguntas.length > 1 && (
                      <button className={styles.qCardRemove} onClick={() => removeQ(q.id)}>
                        <X size={12} />
                      </button>
                    )}
                  </div>

                  {/* Campos */}
                  <div className={styles.qFields}>

                    {/* Texto */}
                    <div className={styles.modalField}>
                      <label className={styles.modalFieldLabel}>
                        Texto da pergunta&nbsp;<span className={styles.modalFieldRequired}>*</span>
                      </label>
                      <input
                        type="text"
                        className={styles.modalInput}
                        placeholder="Ex.: O serviço contribuiu para seu bem-estar?"
                        value={q.texto}
                        onChange={e => updateQ(q.id, { texto: e.target.value })}
                      />
                    </div>

                    {/* Pilar + Peso */}
                    <div className={styles.qFieldRow}>
                      <div className={[styles.modalField, styles.qFieldFlex2].join(' ')}>
                        <label className={styles.modalFieldLabel}>
                          Pilar&nbsp;<span className={styles.modalFieldRequired}>*</span>
                        </label>
                        <div className={styles.modalSelectWrap}>
                          <select
                            className={styles.modalSelect}
                            value={q.pilar}
                            onChange={e => updateQ(q.id, { pilar: e.target.value as Pilar | '' })}
                          >
                            <option value="">Selecione…</option>
                            {PILARES.map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                          <ChevronDown size={13} className={styles.modalSelectChevron} />
                        </div>
                      </div>
                      <div className={[styles.modalField, styles.qFieldFlex1].join(' ')}>
                        <label className={styles.modalFieldLabel}>Peso</label>
                        <input
                          type="number"
                          className={styles.modalInput}
                          placeholder="1.0"
                          step="0.5" min="0.5" max="3.0"
                          value={q.peso}
                          onChange={e => updateQ(q.id, { peso: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Escopo + Serviço condicional */}
                    <div className={styles.qFieldRow}>
                      <div className={[styles.modalField, styles.qFieldFlex1].join(' ')}>
                        <label className={styles.modalFieldLabel}>
                          Escopo&nbsp;<span className={styles.modalFieldRequired}>*</span>
                        </label>
                        <div className={styles.modalSelectWrap}>
                          <select
                            className={styles.modalSelect}
                            value={q.escopo}
                            onChange={e => updateQ(q.id, { escopo: e.target.value as Escopo, servico: '' })}
                          >
                            <option value="">Selecione…</option>
                            <option value="geral">Geral</option>
                            <option value="por_servico">Por serviço</option>
                          </select>
                          <ChevronDown size={13} className={styles.modalSelectChevron} />
                        </div>
                      </div>
                      {q.escopo === 'por_servico' && (
                        <div className={[styles.modalField, styles.qFieldFlex1].join(' ')}>
                          <label className={styles.modalFieldLabel}>
                            Serviço&nbsp;<span className={styles.modalFieldRequired}>*</span>
                          </label>
                          <div className={styles.modalSelectWrap}>
                            <select
                              className={styles.modalSelect}
                              value={q.servico}
                              onChange={e => updateQ(q.id, { servico: e.target.value })}
                            >
                              <option value="">Selecione…</option>
                              {SERVICOS_LISTA.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <ChevronDown size={13} className={styles.modalSelectChevron} />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Tipo de resposta */}
                    <div className={styles.modalField}>
                      <label className={styles.modalFieldLabel}>
                        Tipo de resposta&nbsp;<span className={styles.modalFieldRequired}>*</span>
                      </label>
                      <div className={styles.modalSelectWrap}>
                        <select
                          className={styles.modalSelect}
                          value={q.tipoResposta}
                          onChange={e => updateQ(q.id, {
                            tipoResposta: e.target.value as TipoResposta,
                            escalaOpcao: '',
                            opcoesPersonalizadas: [''],
                          })}
                        >
                          <option value="">Selecione…</option>
                          <option value="escala">Escala numérica</option>
                          <option value="personalizada">Resposta personalizada</option>
                        </select>
                        <ChevronDown size={13} className={styles.modalSelectChevron} />
                      </div>
                    </div>

                    {/* Condicional: escala */}
                    {q.tipoResposta === 'escala' && (
                      <div className={[styles.modalField, styles.qFieldIndented].join(' ')}>
                        <label className={styles.modalFieldLabel}>
                          Escala&nbsp;<span className={styles.modalFieldRequired}>*</span>
                        </label>
                        <div className={styles.modalSelectWrap}>
                          <select
                            className={styles.modalSelect}
                            value={q.escalaOpcao}
                            onChange={e => updateQ(q.id, { escalaOpcao: e.target.value as EscalaOpcao })}
                          >
                            <option value="">Selecione…</option>
                            <option value="1_5">1 a 5</option>
                            <option value="1_10">1 a 10</option>
                          </select>
                          <ChevronDown size={13} className={styles.modalSelectChevron} />
                        </div>
                      </div>
                    )}

                    {/* Condicional: personalizada — escala semântica crescente */}
                    {q.tipoResposta === 'personalizada' && (
                      <div className={[styles.modalField, styles.qFieldIndented].join(' ')}>
                        <label className={styles.modalFieldLabel}>
                          Escala de respostas&nbsp;
                          <span className={styles.modalFieldOptional}>
                            crescente · máx. 10
                            {q.opcoesPersonalizadas.length > 5 ? ' · recomendamos até 5' : ''}
                          </span>
                        </label>
                        <p className={styles.customOptHint}>
                          Configure do pior para o melhor — o primeiro item é o mínimo da escala.
                        </p>
                        <div className={styles.customOptList}>
                          {q.opcoesPersonalizadas.map((opt, oi) => {
                            const total   = q.opcoesPersonalizadas.length;
                            const isFirst = oi === 0;
                            const isLast  = oi === total - 1;
                            const track   = optTrackColor(oi, total);
                            const placeholder = isFirst
                              ? 'Ex: Não atendeu às expectativas...'
                              : isLast
                              ? 'Ex: Superou todas as expectativas...'
                              : 'Ex: Atendeu parcialmente...';
                            return (
                              <div
                                key={oi}
                                className={styles.customOptRow}
                                style={{ borderLeftColor: track }}
                              >
                                <div className={styles.customOptInner}>
                                  {/* Âncora de extremidade */}
                                  {(isFirst || isLast) && (
                                    <div className={styles.customOptAnchor}>
                                      <span
                                        className={styles.customOptAnchorBadge}
                                        style={{ color: track }}
                                      >
                                        {isFirst ? 'Valor mínimo' : 'Valor máximo'}
                                      </span>
                                      <span className={styles.customOptAnchorSep}>·</span>
                                      <span className={styles.customOptAnchorText}>
                                        {isFirst ? 'Pior cenário' : 'Melhor cenário'}
                                      </span>
                                    </div>
                                  )}
                                  {/* Input row */}
                                  <div className={styles.customOptInputRow}>
                                    <span className={styles.customOptNum}>{oi + 1}.</span>
                                    <input
                                      type="text"
                                      className={[styles.modalInput, styles.customOptInput].join(' ')}
                                      placeholder={placeholder}
                                      value={opt}
                                      onChange={e => updateOpcao(q.id, oi, e.target.value)}
                                    />
                                    {total > 2 && (
                                      <button
                                        className={styles.customOptRemove}
                                        onClick={() => removeOpcao(q.id, oi)}
                                      >
                                        <X size={11} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          {q.opcoesPersonalizadas.length < 10 && (
                            <button className={styles.addOptBtn} onClick={() => addOpcao(q.id)}>
                              <Plus size={12} /> Adicionar opção
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              ))}

              {/* Adicionar pergunta */}
              <button className={styles.addQBtn} onClick={addQ}>
                <Plus size={14} /> Adicionar pergunta
              </button>
            </div>
          </div>
        </div>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div className={styles.modalActions}>
          <button className={styles.modalBtnSecondary} onClick={onClose}>Cancelar</button>
          <button
            className={styles.modalBtnPrimary}
            onClick={() => { if (canSave) onSave(nome.trim(), publico as ModeloPublico, perguntas); }}
            disabled={!canSave}
          >
            Salvar modelo
          </button>
        </div>

      </div>
    </div>
  );
}

// ─── DeleteModeloModal ────────────────────────────────────────────────────────
interface DeleteModeloModalProps {
  modelo:    ModeloPesquisa;
  onClose:   () => void;
  onConfirm: (id: string) => void;
}

function DeleteModeloModal({ modelo, onClose, onConfirm }: DeleteModeloModalProps) {
  const activePesquisas = getActivePesquisas(modelo.id);
  const inUse           = activePesquisas.length > 0;

  return (
    <div
      className={styles.modalOverlay}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={styles.modalCard}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className={styles.modalHeader}>
          <div className={styles.modalTitleRow}>
            <Trash2 size={16} className={styles.modalTitleIconDanger} />
            <span className={styles.modalTitle}>Excluir modelo</span>
          </div>
          <button className={styles.modalClose} onClick={onClose}><X size={14} /></button>
        </div>

        {/* ── Body ────────────────────────────────────────────────────────── */}
        <div className={styles.deleteModalBody}>
          <p className={styles.deleteModalText}>
            Tem certeza que deseja excluir o modelo{' '}
            <strong>{modelo.nome}</strong>?
          </p>

          {inUse ? (
            <Feedback
              type="warning"
              title={`Em uso em ${activePesquisas.length} pesquisa${activePesquisas.length > 1 ? 's' : ''} ativa${activePesquisas.length > 1 ? 's' : ''}`}
              message="Este modelo continuará disponível até a conclusão das pesquisas em andamento e será removido automaticamente após o término."
            />
          ) : (
            <Feedback
              type="error"
              message="Esta ação não pode ser desfeita. O modelo será permanentemente removido."
            />
          )}
        </div>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div className={styles.modalActions}>
          <button className={styles.modalBtnSecondary} onClick={onClose}>Cancelar</button>
          <button
            className={styles.modalBtnDanger}
            onClick={() => onConfirm(modelo.id)}
          >
            {inUse ? 'Confirmar exclusão' : 'Excluir modelo'}
          </button>
        </div>

      </div>
    </div>
  );
}

// ─── ModeloDetalheModal ───────────────────────────────────────────────────────
interface ModeloDetalheModalProps {
  modelo:   ModeloPesquisa;
  onClose:  () => void;
  onUpdate: (id: string, nome: string, publico: ModeloPublico, perguntas: QuestionDraft[]) => void;
}

function ModeloDetalheModal({ modelo, onClose, onUpdate }: ModeloDetalheModalProps) {
  const [editing,   setEditing]   = useState(false);
  const [nome,      setNome]      = useState(modelo.nome);
  const [publico,   setPublico]   = useState<ModeloPublico | ''>(modelo.publico);
  const [perguntas, setPerguntas] = useState<QuestionDraft[]>(modelo.perguntas ?? []);

  // ── Handlers (compartilhados com NovoModeloModal) ──────────────────────────
  function updateQ(id: string, patch: Partial<QuestionDraft>) {
    setPerguntas(ps => ps.map(p => p.id === id ? { ...p, ...patch } : p));
  }
  function removeQ(id: string) {
    setPerguntas(ps => ps.filter(p => p.id !== id));
  }
  function addQ() {
    setPerguntas(ps => [...ps, newQuestion()]);
  }
  function updateOpcao(qId: string, idx: number, val: string) {
    setPerguntas(ps => ps.map(p => {
      if (p.id !== qId) return p;
      const opts = [...p.opcoesPersonalizadas]; opts[idx] = val;
      return { ...p, opcoesPersonalizadas: opts };
    }));
  }
  function addOpcao(qId: string) {
    setPerguntas(ps => ps.map(p => {
      if (p.id !== qId || p.opcoesPersonalizadas.length >= 10) return p;
      return { ...p, opcoesPersonalizadas: [...p.opcoesPersonalizadas, ''] };
    }));
  }
  function removeOpcao(qId: string, idx: number) {
    setPerguntas(ps => ps.map(p => {
      if (p.id !== qId || p.opcoesPersonalizadas.length <= 2) return p;
      return { ...p, opcoesPersonalizadas: p.opcoesPersonalizadas.filter((_, i) => i !== idx) };
    }));
  }

  function handleCancelEdit() {
    setNome(modelo.nome);
    setPublico(modelo.publico);
    setPerguntas(modelo.perguntas ?? []);
    setEditing(false);
  }

  const canSave = nome.trim() !== '' && publico !== '';

  // ── Helpers de exibição ────────────────────────────────────────────────────
  const PUBLICO_LABEL: Record<ModeloPublico, string> = {
    beneficiario: 'Beneficiário',
    gestor:       'Gestor',
    profissional: 'Profissional',
  };
  const ESCOPO_LABEL: Record<string, string> = {
    geral:       'Geral',
    por_servico: 'Por serviço',
  };
  const ESCALA_LABEL: Record<string, string> = {
    '1_5':  '1 a 5',
    '1_10': '1 a 10',
  };

  return (
    <div
      className={styles.modalOverlay}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={[styles.modalCard, styles.modalCardLg].join(' ')}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className={styles.modalHeader}>
          <div className={styles.modalTitleRow}>
            <LayoutTemplate size={16} className={styles.modalTitleIcon} />
            <span className={styles.modalTitle}>
              {editing ? 'Editar modelo' : modelo.nome}
            </span>
          </div>
          <div className={styles.modalHeaderRight}>
            {!editing && (
              <button className={styles.modalBtnEdit} onClick={() => setEditing(true)}>
                <Pencil size={12} /> Editar
              </button>
            )}
            <button className={styles.modalClose} onClick={onClose}><X size={14} /></button>
          </div>
        </div>

        {/* ── Body ────────────────────────────────────────────────────────── */}
        <div className={styles.modalBody}>

          {/* ── MODO LEITURA ────────────────────────────────────────────── */}
          {!editing && (
            <>
              {/* Informações básicas */}
              <div className={styles.modalSection}>
                <span className={styles.modalSectionTitle}>Informações básicas</span>
                <div className={styles.detailFieldGrid}>
                  <div className={styles.detailField}>
                    <span className={styles.detailFieldLabel}>Nome do modelo</span>
                    <span className={styles.detailFieldValue}>{modelo.nome}</span>
                  </div>
                  <div className={styles.detailField}>
                    <span className={styles.detailFieldLabel}>Público-alvo</span>
                    <span className={styles.detailFieldValue}>{PUBLICO_LABEL[modelo.publico]}</span>
                  </div>
                </div>
              </div>

              <div className={styles.modalDivider} />

              {/* Perguntas */}
              <div className={styles.modalSection}>
                <div className={styles.modalSectionRow}>
                  <span className={styles.modalSectionTitle}>Perguntas</span>
                  <span className={styles.modalSectionBadge}>{perguntas.length}</span>
                </div>

                {perguntas.length === 0 ? (
                  <p className={styles.qReadEmpty}>Este modelo não possui perguntas definidas.</p>
                ) : (
                  <div className={styles.qList}>
                    {perguntas.map((q, idx) => (
                      <div key={q.id} className={styles.qCard}>
                        <div className={styles.qCardHeader}>
                          <span className={styles.qCardNum}>Pergunta {idx + 1}</span>
                          {q.pilar && (
                            <span className={styles.qReadPilarBadge}>{q.pilar}</span>
                          )}
                        </div>
                        <div className={styles.qReadFields}>
                          {q.texto
                            ? <p className={styles.qReadTexto}>{q.texto}</p>
                            : <p className={styles.qReadTextoEmpty}>Sem texto definido</p>
                          }
                          <div className={styles.qReadMeta}>
                            {q.peso && (
                              <span className={styles.qReadTag}>Peso: {q.peso}</span>
                            )}
                            {q.escopo && (
                              <span className={styles.qReadTag}>
                                {ESCOPO_LABEL[q.escopo] ?? q.escopo}
                                {q.escopo === 'por_servico' && q.servico ? ` · ${q.servico}` : ''}
                              </span>
                            )}
                            {q.tipoResposta === 'escala' && (
                              <span className={styles.qReadTag}>
                                Escala {ESCALA_LABEL[q.escalaOpcao] ?? q.escalaOpcao}
                              </span>
                            )}
                            {q.tipoResposta === 'personalizada' && (
                              <span className={styles.qReadTag}>Resposta personalizada</span>
                            )}
                          </div>
                          {q.tipoResposta === 'personalizada' &&
                            q.opcoesPersonalizadas.some(o => o.trim()) && (
                            <div className={styles.qReadOpts}>
                              {q.opcoesPersonalizadas.map((opt, oi) => {
                                const total = q.opcoesPersonalizadas.length;
                                const track = optTrackColor(oi, total);
                                return (
                                  <div
                                    key={oi}
                                    className={styles.qReadOpt}
                                    style={{ borderLeftColor: track }}
                                  >
                                    <span className={styles.customOptNum}>{oi + 1}.</span>
                                    <span className={styles.qReadOptText}>{opt || '—'}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── MODO EDIÇÃO (idêntico ao NovoModeloModal) ───────────────── */}
          {editing && (
            <>
              <div className={styles.modalSection}>
                <span className={styles.modalSectionTitle}>Informações básicas</span>
                <div className={styles.modalFields}>
                  <div className={styles.modalField}>
                    <label className={styles.modalFieldLabel}>
                      Nome do modelo&nbsp;<span className={styles.modalFieldRequired}>*</span>
                    </label>
                    <input
                      type="text"
                      className={styles.modalInput}
                      placeholder="Ex.: Pós-evento Beneficiário"
                      value={nome}
                      onChange={e => setNome(e.target.value)}
                    />
                  </div>
                  <div className={styles.modalField}>
                    <label className={styles.modalFieldLabel}>
                      Público-alvo&nbsp;<span className={styles.modalFieldRequired}>*</span>
                    </label>
                    <div className={styles.modalSelectWrap}>
                      <select
                        className={styles.modalSelect}
                        value={publico}
                        onChange={e => setPublico(e.target.value as ModeloPublico | '')}
                      >
                        <option value="">Selecione o público…</option>
                        <option value="beneficiario">Beneficiário</option>
                        <option value="gestor">Gestor</option>
                        <option value="profissional">Profissional</option>
                      </select>
                      <ChevronDown size={13} className={styles.modalSelectChevron} />
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.modalDivider} />

              <div className={styles.modalSection}>
                <div className={styles.modalSectionRow}>
                  <span className={styles.modalSectionTitle}>Perguntas</span>
                  <span className={styles.modalSectionBadge}>{perguntas.length}</span>
                </div>
                <div className={styles.qList}>
                  {perguntas.map((q, idx) => (
                    <div key={q.id} className={styles.qCard}>
                      <div className={styles.qCardHeader}>
                        <span className={styles.qCardNum}>Pergunta {idx + 1}</span>
                        {perguntas.length > 1 && (
                          <button className={styles.qCardRemove} onClick={() => removeQ(q.id)}>
                            <X size={12} />
                          </button>
                        )}
                      </div>
                      <div className={styles.qFields}>
                        <div className={styles.modalField}>
                          <label className={styles.modalFieldLabel}>
                            Texto da pergunta&nbsp;<span className={styles.modalFieldRequired}>*</span>
                          </label>
                          <input
                            type="text"
                            className={styles.modalInput}
                            placeholder="Ex.: O serviço contribuiu para seu bem-estar?"
                            value={q.texto}
                            onChange={e => updateQ(q.id, { texto: e.target.value })}
                          />
                        </div>
                        <div className={styles.qFieldRow}>
                          <div className={[styles.modalField, styles.qFieldFlex2].join(' ')}>
                            <label className={styles.modalFieldLabel}>
                              Pilar&nbsp;<span className={styles.modalFieldRequired}>*</span>
                            </label>
                            <div className={styles.modalSelectWrap}>
                              <select
                                className={styles.modalSelect}
                                value={q.pilar}
                                onChange={e => updateQ(q.id, { pilar: e.target.value as typeof PILARES[number] | '' })}
                              >
                                <option value="">Selecione…</option>
                                {PILARES.map(p => <option key={p} value={p}>{p}</option>)}
                              </select>
                              <ChevronDown size={13} className={styles.modalSelectChevron} />
                            </div>
                          </div>
                          <div className={[styles.modalField, styles.qFieldFlex1].join(' ')}>
                            <label className={styles.modalFieldLabel}>Peso</label>
                            <input
                              type="number"
                              className={styles.modalInput}
                              placeholder="1.0"
                              step="0.5" min="0.5" max="3.0"
                              value={q.peso}
                              onChange={e => updateQ(q.id, { peso: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className={styles.qFieldRow}>
                          <div className={[styles.modalField, styles.qFieldFlex1].join(' ')}>
                            <label className={styles.modalFieldLabel}>
                              Escopo&nbsp;<span className={styles.modalFieldRequired}>*</span>
                            </label>
                            <div className={styles.modalSelectWrap}>
                              <select
                                className={styles.modalSelect}
                                value={q.escopo}
                                onChange={e => updateQ(q.id, { escopo: e.target.value as Escopo, servico: '' })}
                              >
                                <option value="">Selecione…</option>
                                <option value="geral">Geral</option>
                                <option value="por_servico">Por serviço</option>
                              </select>
                              <ChevronDown size={13} className={styles.modalSelectChevron} />
                            </div>
                          </div>
                          {q.escopo === 'por_servico' && (
                            <div className={[styles.modalField, styles.qFieldFlex1].join(' ')}>
                              <label className={styles.modalFieldLabel}>
                                Serviço&nbsp;<span className={styles.modalFieldRequired}>*</span>
                              </label>
                              <div className={styles.modalSelectWrap}>
                                <select
                                  className={styles.modalSelect}
                                  value={q.servico}
                                  onChange={e => updateQ(q.id, { servico: e.target.value })}
                                >
                                  <option value="">Selecione…</option>
                                  {SERVICOS_LISTA.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <ChevronDown size={13} className={styles.modalSelectChevron} />
                              </div>
                            </div>
                          )}
                        </div>
                        <div className={styles.modalField}>
                          <label className={styles.modalFieldLabel}>
                            Tipo de resposta&nbsp;<span className={styles.modalFieldRequired}>*</span>
                          </label>
                          <div className={styles.modalSelectWrap}>
                            <select
                              className={styles.modalSelect}
                              value={q.tipoResposta}
                              onChange={e => updateQ(q.id, {
                                tipoResposta: e.target.value as TipoResposta,
                                escalaOpcao: '',
                                opcoesPersonalizadas: [''],
                              })}
                            >
                              <option value="">Selecione…</option>
                              <option value="escala">Escala numérica</option>
                              <option value="personalizada">Resposta personalizada</option>
                            </select>
                            <ChevronDown size={13} className={styles.modalSelectChevron} />
                          </div>
                        </div>
                        {q.tipoResposta === 'escala' && (
                          <div className={[styles.modalField, styles.qFieldIndented].join(' ')}>
                            <label className={styles.modalFieldLabel}>
                              Escala&nbsp;<span className={styles.modalFieldRequired}>*</span>
                            </label>
                            <div className={styles.modalSelectWrap}>
                              <select
                                className={styles.modalSelect}
                                value={q.escalaOpcao}
                                onChange={e => updateQ(q.id, { escalaOpcao: e.target.value as EscalaOpcao })}
                              >
                                <option value="">Selecione…</option>
                                <option value="1_5">1 a 5</option>
                                <option value="1_10">1 a 10</option>
                              </select>
                              <ChevronDown size={13} className={styles.modalSelectChevron} />
                            </div>
                          </div>
                        )}
                        {q.tipoResposta === 'personalizada' && (
                          <div className={[styles.modalField, styles.qFieldIndented].join(' ')}>
                            <label className={styles.modalFieldLabel}>
                              Escala de respostas&nbsp;
                              <span className={styles.modalFieldOptional}>
                                crescente · máx. 10
                                {q.opcoesPersonalizadas.length > 5 ? ' · recomendamos até 5' : ''}
                              </span>
                            </label>
                            <p className={styles.customOptHint}>
                              Configure do pior para o melhor — o primeiro item é o mínimo da escala.
                            </p>
                            <div className={styles.customOptList}>
                              {q.opcoesPersonalizadas.map((opt, oi) => {
                                const total   = q.opcoesPersonalizadas.length;
                                const isFirst = oi === 0;
                                const isLast  = oi === total - 1;
                                const track   = optTrackColor(oi, total);
                                const placeholder = isFirst
                                  ? 'Ex: Não atendeu às expectativas...'
                                  : isLast
                                  ? 'Ex: Superou todas as expectativas...'
                                  : 'Ex: Atendeu parcialmente...';
                                return (
                                  <div
                                    key={oi}
                                    className={styles.customOptRow}
                                    style={{ borderLeftColor: track }}
                                  >
                                    <div className={styles.customOptInner}>
                                      {(isFirst || isLast) && (
                                        <div className={styles.customOptAnchor}>
                                          <span className={styles.customOptAnchorBadge} style={{ color: track }}>
                                            {isFirst ? 'Valor mínimo' : 'Valor máximo'}
                                          </span>
                                          <span className={styles.customOptAnchorSep}>·</span>
                                          <span className={styles.customOptAnchorText}>
                                            {isFirst ? 'Pior cenário' : 'Melhor cenário'}
                                          </span>
                                        </div>
                                      )}
                                      <div className={styles.customOptInputRow}>
                                        <span className={styles.customOptNum}>{oi + 1}.</span>
                                        <input
                                          type="text"
                                          className={[styles.modalInput, styles.customOptInput].join(' ')}
                                          placeholder={placeholder}
                                          value={opt}
                                          onChange={e => updateOpcao(q.id, oi, e.target.value)}
                                        />
                                        {total > 2 && (
                                          <button
                                            className={styles.customOptRemove}
                                            onClick={() => removeOpcao(q.id, oi)}
                                          >
                                            <X size={11} />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                              {q.opcoesPersonalizadas.length < 10 && (
                                <button className={styles.addOptBtn} onClick={() => addOpcao(q.id)}>
                                  <Plus size={12} /> Adicionar opção
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <button className={styles.addQBtn} onClick={addQ}>
                    <Plus size={14} /> Adicionar pergunta
                  </button>
                </div>
              </div>
            </>
          )}

        </div>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div className={styles.modalActions}>
          {editing ? (
            <>
              <button className={styles.modalBtnSecondary} onClick={handleCancelEdit}>Cancelar</button>
              <button
                className={styles.modalBtnPrimary}
                onClick={() => { if (canSave) onUpdate(modelo.id, nome.trim(), publico as ModeloPublico, perguntas); }}
                disabled={!canSave}
              >
                Salvar alterações
              </button>
            </>
          ) : (
            <button className={styles.modalBtnSecondary} onClick={onClose}>Fechar</button>
          )}
        </div>

      </div>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface PesquisaScreenProps {
  role:            UserRole;
  sidebarOffset?:  number;
  onNavChange?:    (item: string) => void;
  onViewDetail?:   (p: Pesquisa) => void;
}

// ─── PesquisaScreen ───────────────────────────────────────────────────────────
export function PesquisaScreen({ role, sidebarOffset = 0, onNavChange, onViewDetail }: PesquisaScreenProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav,   setActiveNav]   = useState('pesquisa');

  // Tabs (admin only)
  const [activeTab, setActiveTab] = useState<PesquisaTabType>('pesquisas');

  // Pesquisas table
  const [search,        setSearch]        = useState('');
  const [filterEmpresa, setFilterEmpresa] = useState('');
  const [filterData,    setFilterData]    = useState('');
  const [page,          setPage]          = useState(1);
  const [copiedId,      setCopiedId]      = useState<string | null>(null);
  const [tooltip,       setTooltip]       = useState<TooltipState | null>(null);

  // Modelos table
  const [modelos,        setModelos]        = useState<ModeloPesquisa[]>(MOCK_MODELOS);
  const [modPage,        setModPage]        = useState(1);
  const [modSearch,      setModSearch]      = useState('');
  const [filterPublico,  setFilterPublico]  = useState<ModeloPublico | ''>('');
  const [showNovoModelo, setShowNovoModelo] = useState(false);
  const [selectedModelo, setSelectedModelo] = useState<ModeloPesquisa | null>(null);
  const [modeloToDelete, setModeloToDelete] = useState<ModeloPesquisa | null>(null);

  // Toast
  type ToastPayload = { type: 'success' | 'info' | 'warning'; message: string; title?: string };
  const [toast, setToast] = useState<ToastPayload | null>(null);

  // ── Filtragem ────────────────────────────────────────────────────────────
  const filtered = MOCK_PESQUISAS.filter(p => {
    if (search.trim()) {
      const s = search.toLowerCase();
      if (!p.eventoNome.toLowerCase().includes(s) &&
          !(role === 'adm' && p.empresa.toLowerCase().includes(s))) return false;
    }
    if (filterEmpresa && p.empresa !== filterEmpresa) return false;
    if (filterData    && p.dataEvento.slice(3) !== filterData) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const from       = filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to         = Math.min(page * PAGE_SIZE, filtered.length);

  // ── Modelos filtragem + paginação ────────────────────────────────────────
  const filteredModelos = modelos.filter(m => {
    if (modSearch.trim() && !m.nome.toLowerCase().includes(modSearch.toLowerCase())) return false;
    if (filterPublico && m.publico !== filterPublico) return false;
    return true;
  });
  const modTotal = Math.max(1, Math.ceil(filteredModelos.length / PAGE_SIZE));
  const modItems = filteredModelos.slice((modPage - 1) * PAGE_SIZE, modPage * PAGE_SIZE);
  const modFrom  = filteredModelos.length === 0 ? 0 : (modPage - 1) * PAGE_SIZE + 1;
  const modTo    = Math.min(modPage * PAGE_SIZE, filteredModelos.length);

  function goPage(p: number) { if (p >= 1 && p <= totalPages) setPage(p); }
  function goMod(p: number)  { if (p >= 1 && p <= modTotal)   setModPage(p); }

  function showToast(type: ToastPayload['type'], message: string, title?: string) {
    setToast({ type, message, title });
    setTimeout(() => setToast(null), 3500);
  }

  function handleSaveModelo(nome: string, publico: ModeloPublico, perguntas: QuestionDraft[]) {
    const newId = `MOD-${String(modelos.length + 1).padStart(3, '0')}`;
    setModelos(prev => [...prev, { id: newId, nome, publico, quantidadePerguntas: perguntas.length, perguntas }]);
    setShowNovoModelo(false);
    showToast('success', 'Modelo salvo com sucesso!');
  }

  function handleUpdateModelo(id: string, nome: string, publico: ModeloPublico, perguntas: QuestionDraft[]) {
    setModelos(prev => prev.map(m =>
      m.id === id ? { ...m, nome, publico, quantidadePerguntas: perguntas.length, perguntas } : m
    ));
    setSelectedModelo(null);
    showToast('success', 'Modelo salvo com sucesso!');
  }

  function handleDeleteModelo(id: string) {
    const wasInUse = getActivePesquisas(id).length > 0;
    setModelos(prev => prev.filter(m => m.id !== id));
    setModeloToDelete(null);
    if (wasInUse) {
      showToast(
        'info',
        'O modelo será excluído automaticamente ao término das pesquisas em andamento.',
        'Exclusão agendada',
      );
    } else {
      showToast('success', 'Modelo excluído com sucesso!');
    }
  }

  function handleCopyLink(pesquisa: Pesquisa) {
    navigator.clipboard.writeText(`https://app.prana.com.br/pesquisa/${pesquisa.id}`).catch(() => {});
    setCopiedId(pesquisa.id);
    setTimeout(() => setCopiedId(null), 1750);
  }

  const showTabs    = role === 'adm';
  const showModelos = role === 'adm' && activeTab === 'modelos';
  const showPesquisas = !showTabs || activeTab === 'pesquisas';

  const colCount = role === 'adm' ? 6 : 5;

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
          user={{ name: 'Admin Prana', email: 'admin@prana.com', initials: 'AP' }}
          role={role}
        />
      </div>

      <div className={[styles.contentWrap, !sidebarOpen ? styles.contentWrapClosed : ''].filter(Boolean).join(' ')}>
        <div className={styles.contentCard}>

          {/* ── Page Header ──────────────────────────────────────────────────── */}
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Pesquisa</h1>
            {showModelos && (
              <div className={styles.headerActions}>
                <Button
                  variant="primary"
                  size="md"
                  iconLeft={<Plus size={14} />}
                  onClick={() => setShowNovoModelo(true)}
                >
                  Novo modelo
                </Button>
              </div>
            )}
          </div>

          {/* ── Tabs (admin only) ────────────────────────────────────────────── */}
          {showTabs && (
            <div className={styles.tabs}>
              <button
                className={[styles.tab, activeTab === 'pesquisas' ? styles.tabActive : ''].filter(Boolean).join(' ')}
                onClick={() => setActiveTab('pesquisas')}
              >
                <ClipboardList size={14} />
                Pesquisas
              </button>
              <button
                className={[styles.tab, activeTab === 'modelos' ? styles.tabActive : ''].filter(Boolean).join(' ')}
                onClick={() => setActiveTab('modelos')}
              >
                <LayoutTemplate size={14} />
                Modelos
              </button>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* ABA: Pesquisas                                                      */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          {showPesquisas && (
            <div className={styles.tableSection}>

              {/* Toolbar */}
              <div className={styles.toolbar}>
                <div className={styles.toolbarLeft}>
                  {/* Busca */}
                  <div className={styles.searchWrap}>
                    <Search size={14} className={styles.searchIcon} />
                    <input
                      type="text"
                      placeholder={role === 'adm' ? 'Buscar por evento ou empresa…' : 'Buscar por evento…'}
                      className={styles.searchInput}
                      value={search}
                      onChange={e => { setSearch(e.target.value); setPage(1); }}
                    />
                  </div>

                  {/* Filtro empresa (adm only) */}
                  {role === 'adm' && (
                    <div className={styles.filterBtnWrap}>
                      <div className={styles.filterWrap}>
                        <select
                          className={styles.filterSelect}
                          value={filterEmpresa}
                          onChange={e => { setFilterEmpresa(e.target.value); setPage(1); }}
                        >
                          <option value="">Todas as empresas</option>
                          {EMPRESA_OPTIONS.map(emp => (
                            <option key={emp} value={emp}>{emp}</option>
                          ))}
                        </select>
                        <ChevronDown size={13} className={styles.filterChevron} />
                      </div>
                    </div>
                  )}

                  {/* Filtro data do evento */}
                  <div className={styles.filterBtnWrap}>
                    <div className={styles.filterWrap}>
                      <select
                        className={styles.filterSelect}
                        value={filterData}
                        onChange={e => { setFilterData(e.target.value); setPage(1); }}
                      >
                        <option value="">Todas as datas</option>
                        {DATA_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <ChevronDown size={13} className={styles.filterChevron} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabela */}
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr className={styles.headerRow}>
                      <th className={styles.th}>Nome do evento</th>
                      {role === 'adm' && <th className={styles.th}>Empresa</th>}
                      <th className={styles.th}>Data do evento</th>
                      <th className={styles.th}>IBE</th>
                      <th className={styles.th}>Status</th>
                      <th className={styles.th}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.length === 0 ? (
                      <tr>
                        <td colSpan={colCount} className={styles.emptyCell}>
                          Nenhuma pesquisa encontrada para os filtros selecionados.
                        </td>
                      </tr>
                    ) : (
                      pageItems.map(p => (
                        <tr key={p.id} className={styles.tr}>

                          {/* Nome do evento */}
                          <td className={styles.td}>
                            <div className={styles.eventInfo}>
                              <span className={styles.eventName}>{p.eventoNome}</span>
                              <span className={styles.eventId}>{p.id}</span>
                            </div>
                          </td>

                          {/* Empresa (adm only) */}
                          {role === 'adm' && (
                            <td className={styles.td}>
                              <span className={styles.cellText}>{p.empresa}</span>
                            </td>
                          )}

                          {/* Data */}
                          <td className={styles.td}>
                            <span className={styles.cellText}>{p.dataEvento}</span>
                          </td>

                          {/* IBE */}
                          <td className={styles.td}>
                            {p.ibe !== null
                              ? <span className={styles.ibeValue}>{p.ibe.toFixed(1)}</span>
                              : <span className={styles.ibeDash}>—</span>
                            }
                          </td>

                          {/* Status */}
                          <td className={styles.td}>
                            <PesquisaStatusBadge status={p.status} />
                          </td>

                          {/* Ações */}
                          <td className={styles.td}>
                            <div className={styles.actionsCell}>
                              {/* Link — apenas para aguardando / enviada */}
                              {(p.status === 'aguardando' || p.status === 'enviada') && (
                                <button
                                  className={[
                                    styles.actionBtn,
                                    copiedId === p.id ? styles.actionBtnCopied : '',
                                  ].filter(Boolean).join(' ')}
                                  onClick={() => handleCopyLink(p)}
                                  onMouseMove={e => setTooltip({ text: copiedId === p.id ? 'Copiado!' : 'Copiar link', x: e.clientX, y: e.clientY })}
                                  onMouseLeave={() => setTooltip(null)}
                                  aria-label="Copiar link da pesquisa"
                                >
                                  {copiedId === p.id
                                    ? <Check size={16} className={styles.iconFadeIn} />
                                    : <Link2 size={16} />
                                  }
                                </button>
                              )}
                              {/* Ver detalhes */}
                              <button
                                className={styles.actionBtn}
                                onClick={() => onViewDetail?.(p)}
                                onMouseMove={e => setTooltip({ text: 'Ver detalhes', x: e.clientX, y: e.clientY })}
                                onMouseLeave={() => setTooltip(null)}
                                aria-label="Ver detalhes da pesquisa"
                              >
                                <Eye size={16} />
                              </button>
                            </div>
                          </td>

                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Paginação */}
              <div className={styles.pagination}>
                <span className={styles.paginationInfo}>
                  {filtered.length === 0
                    ? 'Nenhum resultado'
                    : `Mostrando ${from}–${to} de ${filtered.length} pesquisas`}
                </span>
                <div className={styles.paginationControls}>
                  <button className={styles.pageBtn} onClick={() => goPage(page - 1)} disabled={page === 1}>←</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                    <button
                      key={n}
                      className={[styles.pageBtn, page === n ? styles.pageBtnActive : ''].filter(Boolean).join(' ')}
                      onClick={() => goPage(n)}
                    >
                      {n}
                    </button>
                  ))}
                  <button className={styles.pageBtn} onClick={() => goPage(page + 1)} disabled={page === totalPages}>→</button>
                </div>
              </div>

            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* ABA: Modelos (adm only)                                             */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          {showModelos && (
            <div className={styles.tableSection}>

              {/* Toolbar */}
              <div className={styles.toolbar}>
                <div className={styles.toolbarLeft}>
                  {/* Busca */}
                  <div className={styles.searchWrap}>
                    <Search size={14} className={styles.searchIcon} />
                    <input
                      type="text"
                      placeholder="Buscar por nome…"
                      className={styles.searchInput}
                      value={modSearch}
                      onChange={e => { setModSearch(e.target.value); setModPage(1); }}
                    />
                  </div>

                  {/* Filtro por público */}
                  <div className={styles.filterBtnWrap}>
                    <div className={styles.filterWrap}>
                      <select
                        className={styles.filterSelect}
                        value={filterPublico}
                        onChange={e => { setFilterPublico(e.target.value as ModeloPublico | ''); setModPage(1); }}
                      >
                        <option value="">Todos os públicos</option>
                        <option value="beneficiario">Beneficiário</option>
                        <option value="gestor">Gestor</option>
                        <option value="profissional">Profissional</option>
                      </select>
                      <ChevronDown size={13} className={styles.filterChevron} />
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr className={styles.headerRow}>
                      <th className={styles.th}>Nome do modelo</th>
                      <th className={styles.th}>Público</th>
                      <th className={styles.th}>Perguntas</th>
                      <th className={styles.th} style={{ width: '1%' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modItems.length === 0 ? (
                      <tr>
                        <td colSpan={4} className={styles.emptyCell}>
                          Nenhum modelo cadastrado.
                        </td>
                      </tr>
                    ) : (
                      modItems.map(m => (
                        <tr key={m.id} className={styles.tr}>

                          {/* Nome */}
                          <td className={styles.td}>
                            <div className={styles.eventInfo}>
                              <span className={styles.eventName}>{m.nome}</span>
                              <span className={styles.eventId}>{m.id}</span>
                            </div>
                          </td>

                          {/* Público */}
                          <td className={styles.td}>
                            <span className={styles.cellText}>{MODELO_PUBLICO_LABEL[m.publico]}</span>
                          </td>

                          {/* Perguntas */}
                          <td className={styles.td}>
                            <span className={styles.cellText}>{m.quantidadePerguntas}</span>
                          </td>

                          {/* Ações */}
                          <td className={styles.td}>
                            <div className={styles.actionsCell}>
                              <button
                                className={styles.actionBtn}
                                onClick={() => setSelectedModelo(m)}
                                onMouseMove={e => setTooltip({ text: 'Ver detalhes', x: e.clientX, y: e.clientY })}
                                onMouseLeave={() => setTooltip(null)}
                                aria-label="Ver detalhes do modelo"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                className={[styles.actionBtn, styles.actionBtnDanger].join(' ')}
                                onClick={() => setModeloToDelete(m)}
                                onMouseMove={e => setTooltip({ text: 'Excluir modelo', x: e.clientX, y: e.clientY })}
                                onMouseLeave={() => setTooltip(null)}
                                aria-label="Excluir modelo"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>

                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Paginação modelos */}
              <div className={styles.pagination}>
                <span className={styles.paginationInfo}>
                  {filteredModelos.length === 0
                    ? 'Nenhum resultado'
                    : `Mostrando ${modFrom}–${modTo} de ${filteredModelos.length} modelos`}
                </span>
                <div className={styles.paginationControls}>
                  <button className={styles.pageBtn} onClick={() => goMod(modPage - 1)} disabled={modPage === 1}>←</button>
                  {Array.from({ length: modTotal }, (_, i) => i + 1).map(n => (
                    <button
                      key={n}
                      className={[styles.pageBtn, modPage === n ? styles.pageBtnActive : ''].filter(Boolean).join(' ')}
                      onClick={() => goMod(n)}
                    >
                      {n}
                    </button>
                  ))}
                  <button className={styles.pageBtn} onClick={() => goMod(modPage + 1)} disabled={modPage === modTotal}>→</button>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* ── Modal: Novo Modelo ──────────────────────────────────────────────── */}
      {showNovoModelo && (
        <NovoModeloModal
          onClose={() => setShowNovoModelo(false)}
          onSave={handleSaveModelo}
        />
      )}

      {/* ── Modal: Detalhe do Modelo ─────────────────────────────────────────── */}
      {selectedModelo && (
        <ModeloDetalheModal
          modelo={selectedModelo}
          onClose={() => setSelectedModelo(null)}
          onUpdate={handleUpdateModelo}
        />
      )}

      {/* ── Modal: Excluir Modelo ────────────────────────────────────────────── */}
      {modeloToDelete && (
        <DeleteModeloModal
          modelo={modeloToDelete}
          onClose={() => setModeloToDelete(null)}
          onConfirm={handleDeleteModelo}
        />
      )}

      {/* ── Toast ────────────────────────────────────────────────────────────── */}
      {toast && (
        <div className={styles.toastWrap}>
          <Feedback
            type={toast.type}
            title={toast.title}
            message={toast.message}
            dismissible
            onDismiss={() => setToast(null)}
          />
        </div>
      )}

      {/* ── Tooltip global ──────────────────────────────────────────────────── */}
      {tooltip && (
        <div
          className={styles.tooltip}
          style={{ left: tooltip.x + 12, top: tooltip.y - 32 }}
        >
          {tooltip.text}
        </div>
      )}

    </div>
  );
}
