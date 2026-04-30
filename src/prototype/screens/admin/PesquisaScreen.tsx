// TELA: Pesquisa — Banco de Subcategorias, Perguntas e Modelos
// ROLES COM ACESSO: adm apenas (empresa removido via Sidebar ADM_ONLY_IDS)
// 3 abas: Subcategorias · Perguntas · Modelo

import { useState } from 'react';
import {
  Search, Plus, X, ChevronDown, Trash2, Eye, LayoutTemplate,
  SlidersHorizontal, Ban, RotateCcw, Check, Tag, ClipboardList,
} from 'lucide-react';
import { Sidebar } from '../../../components/Sidebar/Sidebar';
import { Dialog } from '../../../components/Dialog/Dialog';
import { Button } from '../../../components/Button/Button';
import { Feedback } from '../../../components/Feedback/Feedback';
import type { UserRole } from './UsersScreen';
import styles from './PesquisaScreen.module.css';

// ─── Types ────────────────────────────────────────────────────────────────────
type PesquisaTabType = 'subcategorias' | 'perguntas' | 'modelo';
type ItemStatus      = 'ativo' | 'inativo';
type ModeloPublico   = 'beneficiario' | 'gestor' | 'profissional';
type Ator            = 'beneficiario' | 'profissional' | 'gestor';
type Escopo          = 'geral' | 'por_servico' | '';
type TipoResposta    = 'escala' | 'personalizada' | '';
type EscalaOpcao     = '1_5' | '1_10' | '';

// Mantido para compatibilidade de exportação com outras telas
type PesquisaStatus = 'concluida' | 'enviada' | 'aguardando';
export interface Pesquisa {
  id:         string;
  eventoNome: string;
  empresa:    string;
  dataEvento: string;
  ibe:        number | null;
  status:     PesquisaStatus;
  modeloId?:  string;
}

const SUBCATEGORIA_PILARES = ['Operacional', 'Experiência', 'Engajamento', 'Impacto', 'Relacionamento'] as const;
type SubcategoriaPilar = typeof SUBCATEGORIA_PILARES[number];

interface Subcategoria {
  id:     string;
  nome:   string;
  pilar:  SubcategoriaPilar;
  status: ItemStatus;
}

interface Pergunta {
  id:                   string;
  titulo:               string;
  subtitulo:            string;
  ator:                 Ator;
  escopo:               Escopo;
  servico:              string;
  subcategoriaId:       string;
  pilar:                SubcategoriaPilar;
  peso:                 string;
  tipoResposta:         TipoResposta;
  escalaOpcao:          EscalaOpcao;
  opcoesPersonalizadas: string[];
  status:               ItemStatus;
}

interface ModeloPesquisa {
  id:          string;
  nome:        string;
  publico:     ModeloPublico;
  perguntaIds: string[];
  status:      ItemStatus;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const SERVICOS_LISTA = [
  'Auriculoterapia', 'Do-in', 'Ginástica laboral', 'Manicure e esmaltação',
  'Massagem Indian Head', 'Massagem terapêutica', 'Meditação imersiva',
  'Meditação laboral', 'Mindfulness', 'Palestra bem-estar',
  'Partner de experiência', 'Quick massagem', 'Reflexologia',
  'SPA de mãos ou pés', 'Yoga', 'Yoga laboral',
] as const;

const ATOR_LABEL: Record<Ator, string> = {
  beneficiario: 'Beneficiário',
  profissional: 'Profissional',
  gestor:       'Gestor',
};

const MODELO_PUBLICO_LABEL: Record<ModeloPublico, string> = {
  beneficiario: 'Beneficiário',
  gestor:       'Gestor',
  profissional: 'Profissional',
};

const PILAR_COLOR: Record<SubcategoriaPilar, { bg: string; border: string; color: string }> = {
  'Operacional':    { bg: 'var(--color-status-info-bg)',    border: 'var(--color-blue-300)',  color: 'var(--color-status-info-fg)'    },
  'Experiência':    { bg: '#F5F3FF',                        border: '#C4B5FD',                color: '#7C3AED'                        },
  'Engajamento':    { bg: 'var(--color-bg-brand)',          border: 'var(--color-brand-300)', color: 'var(--color-brand-600)'         },
  'Impacto':        { bg: 'var(--color-status-success-bg)', border: 'var(--color-green-300)', color: 'var(--color-status-success-fg)' },
  'Relacionamento': { bg: '#FFF7ED',                        border: '#FED7AA',                color: '#EA580C'                        },
};

function optTrackColor(idx: number, total: number): string {
  if (total <= 1) return 'var(--color-gray-300)';
  const ratio = idx / (total - 1);
  if (ratio <= 0)    return '#EF4444';
  if (ratio <= 0.25) return '#F97316';
  if (ratio <= 0.55) return '#EAB308';
  if (ratio <= 0.80) return '#84CC16';
  return '#22C55E';
}

const PAGE_SIZE = 8;

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_SUBCATEGORIAS: Subcategoria[] = [
  { id: 'SUB-001', nome: 'Eficiência operacional',     pilar: 'Operacional',    status: 'ativo'   },
  { id: 'SUB-002', nome: 'Qualidade da experiência',   pilar: 'Experiência',    status: 'ativo'   },
  { id: 'SUB-003', nome: 'Nível de engajamento',       pilar: 'Engajamento',    status: 'ativo'   },
  { id: 'SUB-004', nome: 'Impacto no bem-estar',       pilar: 'Impacto',        status: 'ativo'   },
  { id: 'SUB-005', nome: 'Vínculo com o profissional', pilar: 'Relacionamento', status: 'ativo'   },
  { id: 'SUB-006', nome: 'Comunicação e organização',  pilar: 'Operacional',    status: 'inativo' },
];

const MOCK_PERGUNTAS_BANCO: Pergunta[] = [
  {
    id: 'PQ-001', titulo: 'O serviço contribuiu para o seu bem-estar neste dia?',
    subtitulo: 'Avaliação geral de impacto', ator: 'beneficiario', escopo: 'geral', servico: '',
    subcategoriaId: 'SUB-004', pilar: 'Impacto', peso: '1.5',
    tipoResposta: 'escala', escalaOpcao: '1_5', opcoesPersonalizadas: ['','',''], status: 'ativo',
  },
  {
    id: 'PQ-002', titulo: 'Como você avalia a qualidade do profissional?',
    subtitulo: 'Considere técnica e postura', ator: 'beneficiario', escopo: 'geral', servico: '',
    subcategoriaId: 'SUB-005', pilar: 'Relacionamento', peso: '2.0',
    tipoResposta: 'personalizada', escalaOpcao: '',
    opcoesPersonalizadas: ['Péssimo','Ruim','Regular','Bom','Excelente'], status: 'ativo',
  },
  {
    id: 'PQ-003', titulo: 'O ambiente estava propício para a realização da atividade?',
    subtitulo: '', ator: 'beneficiario', escopo: 'geral', servico: '',
    subcategoriaId: 'SUB-002', pilar: 'Experiência', peso: '1.0',
    tipoResposta: 'escala', escalaOpcao: '1_5', opcoesPersonalizadas: ['','',''], status: 'ativo',
  },
  {
    id: 'PQ-004', titulo: 'Você recomendaria este serviço para colegas?',
    subtitulo: 'Índice de recomendação', ator: 'beneficiario', escopo: 'geral', servico: '',
    subcategoriaId: 'SUB-003', pilar: 'Engajamento', peso: '1.5',
    tipoResposta: 'escala', escalaOpcao: '1_10', opcoesPersonalizadas: ['','',''], status: 'ativo',
  },
  {
    id: 'PQ-005', titulo: 'Os objetivos da ação foram comunicados claramente à equipe?',
    subtitulo: '', ator: 'gestor', escopo: 'geral', servico: '',
    subcategoriaId: 'SUB-001', pilar: 'Operacional', peso: '1.0',
    tipoResposta: 'escala', escalaOpcao: '1_5', opcoesPersonalizadas: ['','',''], status: 'ativo',
  },
  {
    id: 'PQ-006', titulo: 'Os resultados observados justificam o investimento?',
    subtitulo: '', ator: 'gestor', escopo: 'geral', servico: '',
    subcategoriaId: 'SUB-004', pilar: 'Impacto', peso: '2.0',
    tipoResposta: 'personalizada', escalaOpcao: '',
    opcoesPersonalizadas: ['Não justifica','Justifica parcialmente','Justifica plenamente'], status: 'ativo',
  },
  {
    id: 'PQ-007', titulo: 'A qualidade da Quick Massage realizada foi satisfatória?',
    subtitulo: 'Específico para o serviço', ator: 'beneficiario', escopo: 'por_servico', servico: 'Quick massagem',
    subcategoriaId: 'SUB-002', pilar: 'Experiência', peso: '1.5',
    tipoResposta: 'escala', escalaOpcao: '1_5', opcoesPersonalizadas: ['','',''], status: 'ativo',
  },
  {
    id: 'PQ-008', titulo: 'De 0 a 10, qual a probabilidade de você recomendar o programa?',
    subtitulo: 'NPS principal', ator: 'beneficiario', escopo: 'geral', servico: '',
    subcategoriaId: 'SUB-003', pilar: 'Engajamento', peso: '2.0',
    tipoResposta: 'escala', escalaOpcao: '1_10', opcoesPersonalizadas: ['','',''], status: 'ativo',
  },
  {
    id: 'PQ-009', titulo: 'O nível de engajamento da equipe melhorou após as ações?',
    subtitulo: '', ator: 'gestor', escopo: 'geral', servico: '',
    subcategoriaId: 'SUB-003', pilar: 'Engajamento', peso: '2.0',
    tipoResposta: 'escala', escalaOpcao: '1_5', opcoesPersonalizadas: ['','',''], status: 'inativo',
  },
  {
    id: 'PQ-010', titulo: 'A logística do evento (espaço, materiais) atendeu às necessidades?',
    subtitulo: '', ator: 'profissional', escopo: 'geral', servico: '',
    subcategoriaId: 'SUB-001', pilar: 'Operacional', peso: '1.0',
    tipoResposta: 'personalizada', escalaOpcao: '',
    opcoesPersonalizadas: ['Não atendeu','Atendeu parcialmente','Atendeu totalmente'], status: 'ativo',
  },
];

const MOCK_MODELOS: ModeloPesquisa[] = [
  { id: 'MOD-001', nome: 'Pós-evento Beneficiário', publico: 'beneficiario', perguntaIds: ['PQ-001','PQ-002','PQ-003','PQ-004'], status: 'ativo'   },
  { id: 'MOD-002', nome: 'Avaliação do Gestor',     publico: 'gestor',       perguntaIds: ['PQ-005','PQ-006'],                   status: 'ativo'   },
  { id: 'MOD-003', nome: 'Feedback Profissional',   publico: 'profissional', perguntaIds: ['PQ-010'],                           status: 'ativo'   },
  { id: 'MOD-004', nome: 'NPS Beneficiário',        publico: 'beneficiario', perguntaIds: ['PQ-008','PQ-004'],                   status: 'ativo'   },
  { id: 'MOD-005', nome: 'Clima Organizacional',    publico: 'gestor',       perguntaIds: ['PQ-005','PQ-006','PQ-009'],          status: 'inativo' },
];

// Kept for compat
const MOCK_PESQUISAS: Pesquisa[] = [
  { id: 'PSQ-001', eventoNome: 'SIPAT - Itaú Unibanco',        empresa: 'Itaú Unibanco',  dataEvento: '15/04/2026', ibe: null, status: 'enviada',    modeloId: 'MOD-001' },
  { id: 'PSQ-002', eventoNome: 'Ginástica Laboral - Bradesco',  empresa: 'Bradesco',       dataEvento: '11/03/2026', ibe: 8.7,  status: 'concluida',  modeloId: 'MOD-001' },
  { id: 'PSQ-003', eventoNome: 'Semana da Saúde - Natura',      empresa: 'Natura',         dataEvento: '15/04/2026', ibe: null, status: 'enviada',    modeloId: 'MOD-001' },
  { id: 'PSQ-004', eventoNome: 'Dia da Saúde - Ambev',          empresa: 'Ambev',          dataEvento: '21/05/2026', ibe: null, status: 'aguardando', modeloId: 'MOD-002' },
  { id: 'PSQ-005', eventoNome: 'Quick Massage - Vale',          empresa: 'Vale',           dataEvento: '05/06/2026', ibe: null, status: 'aguardando', modeloId: 'MOD-004' },
];

function getActivePesquisas(modeloId: string): Pesquisa[] {
  return MOCK_PESQUISAS.filter(
    p => p.modeloId === modeloId && (p.status === 'enviada' || p.status === 'aguardando')
  );
}

// ─── Shared Badge Components ──────────────────────────────────────────────────
function ItemStatusBadge({ status }: { status: ItemStatus }) {
  const cfg = status === 'ativo'
    ? { label: 'Ativo',   bg: 'var(--color-status-success-bg)', border: 'var(--color-green-300)', color: 'var(--color-status-success-fg)' }
    : { label: 'Inativo', bg: 'var(--color-gray-100)',           border: 'var(--color-gray-300)',  color: 'var(--color-text-tertiary)' };
  return (
    <span className={styles.statusBadge} style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.color }}>
      {cfg.label}
    </span>
  );
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────
interface TooltipState { text: string; x: number; y: number; }

// ─── NovaSubcategoriaModal ────────────────────────────────────────────────────
interface NovaSubcategoriaModalProps {
  initial?: Subcategoria | null;
  onClose: () => void;
  onSave:  (nome: string, pilar: SubcategoriaPilar, id?: string) => void;
}

function NovaSubcategoriaModal({ initial, onClose, onSave }: NovaSubcategoriaModalProps) {
  const [nome,  setNome]  = useState(initial?.nome  ?? '');
  const [pilar, setPilar] = useState<SubcategoriaPilar | ''>(initial?.pilar ?? '');
  const isEdit   = !!initial;
  const canSave  = nome.trim() !== '' && pilar !== '';

  return (
    <div className={styles.modalOverlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modalCard}>

        <div className={styles.modalHeader}>
          <div className={styles.modalTitleRow}>
            <Tag size={16} className={styles.modalTitleIcon} />
            <span className={styles.modalTitle}>{isEdit ? 'Editar subcategoria' : 'Nova subcategoria'}</span>
          </div>
          <button className={styles.modalClose} onClick={onClose}><X size={14} /></button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.modalSection}>
            <div className={styles.modalFields}>

              <div className={styles.modalField}>
                <label className={styles.modalFieldLabel}>
                  Nome&nbsp;<span className={styles.modalFieldRequired}>*</span>
                </label>
                <input
                  type="text"
                  className={styles.modalInput}
                  placeholder="Ex.: Qualidade da experiência"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                />
              </div>

              <div className={styles.modalField}>
                <label className={styles.modalFieldLabel}>
                  Pilar&nbsp;<span className={styles.modalFieldRequired}>*</span>
                </label>
                <div className={styles.modalSelectWrap}>
                  <select
                    className={styles.modalSelect}
                    value={pilar}
                    onChange={e => setPilar(e.target.value as SubcategoriaPilar | '')}
                  >
                    <option value="">Selecione o pilar…</option>
                    {SUBCATEGORIA_PILARES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <ChevronDown size={13} className={styles.modalSelectChevron} />
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className={styles.modalActions}>
          <button className={styles.modalBtnSecondary} onClick={onClose}>Cancelar</button>
          <button
            className={styles.modalBtnPrimary}
            disabled={!canSave}
            onClick={() => { if (canSave) onSave(nome.trim(), pilar as SubcategoriaPilar, initial?.id); }}
          >
            {isEdit ? 'Salvar alterações' : 'Salvar subcategoria'}
          </button>
        </div>

      </div>
    </div>
  );
}

// ─── NovaPerguntaModal ────────────────────────────────────────────────────────
interface NovaPerguntaModalProps {
  subcategorias: Subcategoria[];
  initial?:      Pergunta | null;
  onClose:       () => void;
  onSave:        (p: Omit<Pergunta, 'id'> & { id?: string }) => void;
}

function NovaPerguntaModal({ subcategorias, initial, onClose, onSave }: NovaPerguntaModalProps) {
  const isEdit = !!initial;

  const [titulo,               setTitulo]               = useState(initial?.titulo ?? '');
  const [subtitulo,            setSubtitulo]            = useState(initial?.subtitulo ?? '');
  const [ator,                 setAtor]                 = useState<Ator | ''>(initial?.ator ?? '');
  const [escopo,               setEscopo]               = useState<Escopo>(initial?.escopo ?? '');
  const [servico,              setServico]              = useState(initial?.servico ?? '');
  const [subcategoriaId,       setSubcategoriaId]       = useState(initial?.subcategoriaId ?? '');
  const [peso,                 setPeso]                 = useState(initial?.peso ?? '1.0');
  const [tipoResposta,         setTipoResposta]         = useState<TipoResposta>(initial?.tipoResposta ?? '');
  const [escalaOpcao,          setEscalaOpcao]          = useState<EscalaOpcao>(initial?.escalaOpcao ?? '');
  const [opcoesPersonalizadas, setOpcoesPersonalizadas] = useState<string[]>(
    initial?.opcoesPersonalizadas?.length ? initial.opcoesPersonalizadas : ['', '', '']
  );

  const subcAtiva    = subcategorias.filter(s => s.status === 'ativo');
  const selectedSub  = subcAtiva.find(s => s.id === subcategoriaId);
  const pilarDerived: SubcategoriaPilar = selectedSub?.pilar ?? 'Operacional';

  function updateOpcao(idx: number, val: string) {
    setOpcoesPersonalizadas(prev => { const n = [...prev]; n[idx] = val; return n; });
  }
  function addOpcao() {
    if (opcoesPersonalizadas.length < 10) setOpcoesPersonalizadas(prev => [...prev, '']);
  }
  function removeOpcao(idx: number) {
    if (opcoesPersonalizadas.length > 2)
      setOpcoesPersonalizadas(prev => prev.filter((_, i) => i !== idx));
  }

  // Validação: botão habilitado só se min 2 opções preenchidas (para personalizada)
  const canSave = (() => {
    if (!titulo.trim() || !ator || !escopo || !tipoResposta) return false;
    if (escopo === 'geral' && !subcategoriaId) return false;
    if (tipoResposta === 'personalizada') {
      const filled = opcoesPersonalizadas.filter(o => o.trim());
      if (filled.length < 2) return false;
    }
    return true;
  })();

  return (
    <div className={styles.modalOverlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={[styles.modalCard, styles.modalCardLg].join(' ')}>

        <div className={styles.modalHeader}>
          <div className={styles.modalTitleRow}>
            <ClipboardList size={16} className={styles.modalTitleIcon} />
            <span className={styles.modalTitle}>{isEdit ? 'Editar pergunta' : 'Nova pergunta'}</span>
          </div>
          <button className={styles.modalClose} onClick={onClose}><X size={14} /></button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.modalSection}>
            <span className={styles.modalSectionTitle}>Identificação</span>
            <div className={styles.modalFields}>

              {/* Título */}
              <div className={styles.modalField}>
                <label className={styles.modalFieldLabel}>
                  Título&nbsp;<span className={styles.modalFieldRequired}>*</span>
                </label>
                <input
                  type="text"
                  className={styles.modalInput}
                  placeholder="Ex.: O serviço contribuiu para o seu bem-estar?"
                  value={titulo}
                  onChange={e => setTitulo(e.target.value)}
                />
              </div>

              {/* Subtítulo */}
              <div className={styles.modalField}>
                <label className={styles.modalFieldLabel}>
                  Subtítulo&nbsp;<span className={styles.modalFieldOptional}>(opcional)</span>
                </label>
                <input
                  type="text"
                  className={styles.modalInput}
                  placeholder="Ex.: Avaliação geral de impacto"
                  value={subtitulo}
                  onChange={e => setSubtitulo(e.target.value)}
                />
              </div>

              {/* Ator */}
              <div className={styles.modalField}>
                <label className={styles.modalFieldLabel}>
                  Ator&nbsp;<span className={styles.modalFieldRequired}>*</span>
                </label>
                <div className={styles.modalSelectWrap}>
                  <select className={styles.modalSelect} value={ator} onChange={e => setAtor(e.target.value as Ator | '')}>
                    <option value="">Selecione…</option>
                    <option value="beneficiario">Beneficiário</option>
                    <option value="profissional">Profissional</option>
                    <option value="gestor">Gestor</option>
                  </select>
                  <ChevronDown size={13} className={styles.modalSelectChevron} />
                </div>
              </div>

            </div>
          </div>

          <div className={styles.modalDivider} />

          <div className={styles.modalSection}>
            <span className={styles.modalSectionTitle}>Configuração</span>
            <div className={styles.modalFields}>

              {/* Escopo — vem ANTES de Subcategoria */}
              <div className={styles.qFieldRow}>
                <div className={[styles.modalField, styles.qFieldFlex1].join(' ')}>
                  <label className={styles.modalFieldLabel}>
                    Escopo&nbsp;<span className={styles.modalFieldRequired}>*</span>
                  </label>
                  <div className={styles.modalSelectWrap}>
                    <select
                      className={styles.modalSelect}
                      value={escopo}
                      onChange={e => {
                        setEscopo(e.target.value as Escopo);
                        setServico('');
                        setSubcategoriaId('');
                      }}
                    >
                      <option value="">Selecione…</option>
                      <option value="geral">Geral</option>
                      <option value="por_servico">Por serviço</option>
                    </select>
                    <ChevronDown size={13} className={styles.modalSelectChevron} />
                  </div>
                </div>
                {/* Serviço (condicional: por_servico) */}
                {escopo === 'por_servico' && (
                  <div className={[styles.modalField, styles.qFieldFlex1].join(' ')}>
                    <label className={styles.modalFieldLabel}>
                      Serviço&nbsp;<span className={styles.modalFieldRequired}>*</span>
                    </label>
                    <div className={styles.modalSelectWrap}>
                      <select className={styles.modalSelect} value={servico} onChange={e => setServico(e.target.value)}>
                        <option value="">Selecione…</option>
                        {SERVICOS_LISTA.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <ChevronDown size={13} className={styles.modalSelectChevron} />
                    </div>
                  </div>
                )}
              </div>

              {/* Subcategoria — apenas quando Escopo = Geral */}
              {escopo === 'geral' && (
                <div className={styles.modalField}>
                  <label className={styles.modalFieldLabel}>
                    Subcategoria&nbsp;<span className={styles.modalFieldRequired}>*</span>
                  </label>
                  <div className={styles.modalSelectWrap}>
                    <select className={styles.modalSelect} value={subcategoriaId} onChange={e => setSubcategoriaId(e.target.value)}>
                      <option value="">Selecione…</option>
                      {subcAtiva.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                    </select>
                    <ChevronDown size={13} className={styles.modalSelectChevron} />
                  </div>
                </div>
              )}

              {/* Pilar — read-only, preenchido automaticamente ao selecionar subcategoria */}
              {escopo === 'geral' && subcategoriaId && selectedSub && (
                <div className={styles.modalField}>
                  <label className={styles.modalFieldLabel}>Pilar</label>
                  <div className={styles.pilarReadOnlyField}>
                    <span>{selectedSub.pilar}</span>
                  </div>
                </div>
              )}

              {/* Peso */}
              <div className={styles.modalField}>
                <label className={styles.modalFieldLabel}>Peso</label>
                <input
                  type="number"
                  className={styles.modalInput}
                  placeholder="1.0"
                  step="0.5" min="0.5" max="3.0"
                  value={peso}
                  onChange={e => setPeso(e.target.value)}
                  style={{ maxWidth: 120 }}
                />
              </div>

              {/* Tipo de Resposta */}
              <div className={styles.modalField}>
                <label className={styles.modalFieldLabel}>
                  Tipo de resposta&nbsp;<span className={styles.modalFieldRequired}>*</span>
                </label>
                <div className={styles.modalSelectWrap}>
                  <select
                    className={styles.modalSelect}
                    value={tipoResposta}
                    onChange={e => {
                      setTipoResposta(e.target.value as TipoResposta);
                      setEscalaOpcao('');
                      setOpcoesPersonalizadas(['', '', '']);
                    }}
                  >
                    <option value="">Selecione…</option>
                    <option value="escala">Escala numérica</option>
                    <option value="personalizada">Resposta personalizada</option>
                  </select>
                  <ChevronDown size={13} className={styles.modalSelectChevron} />
                </div>
              </div>

              {/* Escala numérica */}
              {tipoResposta === 'escala' && (
                <div className={[styles.modalField, styles.qFieldIndented].join(' ')}>
                  <label className={styles.modalFieldLabel}>
                    Escala&nbsp;<span className={styles.modalFieldRequired}>*</span>
                  </label>
                  <div className={styles.modalSelectWrap}>
                    <select className={styles.modalSelect} value={escalaOpcao} onChange={e => setEscalaOpcao(e.target.value as EscalaOpcao)}>
                      <option value="">Selecione…</option>
                      <option value="1_5">1 a 5</option>
                      <option value="1_10">1 a 10</option>
                    </select>
                    <ChevronDown size={13} className={styles.modalSelectChevron} />
                  </div>
                </div>
              )}

              {/* Resposta personalizada */}
              {tipoResposta === 'personalizada' && (
                <div className={[styles.modalField, styles.qFieldIndented].join(' ')}>
                  <label className={styles.modalFieldLabel}>
                    Escala de respostas&nbsp;
                    <span className={styles.modalFieldOptional}>
                      crescente · máx. 10{opcoesPersonalizadas.length > 5 ? ' · recomendamos até 5' : ''}
                    </span>
                  </label>
                  <p className={styles.customOptHint}>
                    Configure do pior para o melhor — o primeiro item é o mínimo da escala.
                  </p>
                  <div className={styles.customOptList}>
                    {opcoesPersonalizadas.map((opt, oi) => {
                      const total   = opcoesPersonalizadas.length;
                      const isFirst = oi === 0;
                      const isLast  = oi === total - 1;
                      const track   = optTrackColor(oi, total);
                      const placeholder = isFirst
                        ? 'Ex: Não atendeu às expectativas...'
                        : isLast ? 'Ex: Superou todas as expectativas...' : 'Ex: Atendeu parcialmente...';
                      return (
                        <div key={oi} className={styles.customOptRow} style={{ borderLeftColor: track }}>
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
                                onChange={e => updateOpcao(oi, e.target.value)}
                              />
                              {/* Trash2 (substituindo X) para remover opção */}
                              {total > 2 && (
                                <button className={styles.customOptRemove} onClick={() => removeOpcao(oi)}>
                                  <Trash2 size={11} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {opcoesPersonalizadas.length < 10 && (
                      <button className={styles.addOptBtn} onClick={addOpcao}>
                        <Plus size={12} /> Adicionar opção
                      </button>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        <div className={styles.modalActions}>
          <button className={styles.modalBtnSecondary} onClick={onClose}>Cancelar</button>
          <button
            className={styles.modalBtnPrimary}
            disabled={!canSave}
            onClick={() => {
              if (!canSave) return;
              onSave({
                id:                   initial?.id,
                titulo:               titulo.trim(),
                subtitulo:            subtitulo.trim(),
                ator:                 ator as Ator,
                escopo,
                servico,
                subcategoriaId,
                pilar:                pilarDerived,
                peso,
                tipoResposta,
                escalaOpcao,
                opcoesPersonalizadas,
                status:               initial?.status ?? 'ativo',
              });
            }}
          >
            {isEdit ? 'Salvar alterações' : 'Salvar pergunta'}
          </button>
        </div>

      </div>
    </div>
  );
}

// ─── NovoModeloModal ──────────────────────────────────────────────────────────
interface NovoModeloModalProps {
  perguntasBanco: Pergunta[];
  onClose: () => void;
  onSave:  (nome: string, publico: ModeloPublico, perguntaIds: string[]) => void;
}

function NovoModeloModal({ perguntasBanco, onClose, onSave }: NovoModeloModalProps) {
  const [nome,         setNome]        = useState('');
  const [publico,      setPublico]     = useState<ModeloPublico | ''>('');
  const [selected,     setSelected]    = useState<Set<string>>(new Set());
  const [qSearch,      setQSearch]     = useState('');
  const [qSearchOpen,  setQSearchOpen] = useState(false);

  // Apenas perguntas com escopo geral e ativas
  const geralAtivas = perguntasBanco.filter(p => p.escopo === 'geral' && p.status === 'ativo');
  const results     = qSearch.trim()
    ? geralAtivas.filter(p => p.titulo.toLowerCase().includes(qSearch.toLowerCase()))
    : geralAtivas;

  const selectedPerguntas = geralAtivas.filter(p => selected.has(p.id));

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const canSave = nome.trim() !== '' && publico !== '' && selected.size > 0;

  return (
    <div className={styles.modalOverlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={[styles.modalCard, styles.modalCardLg].join(' ')}>

        <div className={styles.modalHeader}>
          <div className={styles.modalTitleRow}>
            <LayoutTemplate size={16} className={styles.modalTitleIcon} />
            <span className={styles.modalTitle}>Novo modelo de pesquisa</span>
          </div>
          <button className={styles.modalClose} onClick={onClose}><X size={14} /></button>
        </div>

        {/* overflow: visible para que o popover absoluto não seja cortado */}
        <div className={styles.modalBody} style={{ overflow: 'visible' }}>

          {/* Informações básicas */}
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

          {/* Seleção de perguntas */}
          <div className={styles.modalSection}>
            <span className={styles.modalSectionTitle}>Perguntas do banco</span>
            <p className={styles.modalHint}>
              Apenas perguntas com escopo <strong>Geral</strong> e status ativo estão disponíveis para modelos.
            </p>

            {/* Campo de busca — popover filho direto do wrapper (position: relative) */}
            <div className={styles.qSearchPopoverWrap}>
              {qSearchOpen && (
                <div className={styles.qSearchBackdrop} onClick={() => setQSearchOpen(false)} />
              )}

              <div className={styles.modalSearchWrap}>
                <Search size={13} className={styles.modalSearchIcon} />
                <input
                  type="text"
                  className={[styles.modalSearchInput, qSearchOpen ? styles.modalSearchInputOpen : ''].filter(Boolean).join(' ')}
                  placeholder="Buscar pergunta…"
                  value={qSearch}
                  onChange={e => setQSearch(e.target.value)}
                  onFocus={() => setQSearchOpen(true)}
                  onClick={() => setQSearchOpen(true)}
                />
              </div>

              {qSearchOpen && (
                <div className={styles.qSearchPopover}>
                  {results.length === 0 ? (
                    <p className={styles.qSelectEmpty}>Nenhuma pergunta encontrada.</p>
                  ) : (
                    results.map(p => {
                      const checked  = selected.has(p.id);
                      const pilarClr = PILAR_COLOR[p.pilar];
                      return (
                        <div
                          key={p.id}
                          className={[styles.qSelectItem, checked ? styles.qSelectItemChecked : ''].filter(Boolean).join(' ')}
                          onClick={e => { e.stopPropagation(); toggle(p.id); }}
                        >
                          <div className={[styles.qSelectCheckbox, checked ? styles.qSelectCheckboxChecked : ''].filter(Boolean).join(' ')}>
                            {checked && <Check size={10} />}
                          </div>
                          <div className={styles.qSelectInfo}>
                            <span className={styles.qSelectTitle}>{p.titulo}</span>
                            <div className={styles.qSelectMeta}>
                              <span className={styles.qReadTag}>{ATOR_LABEL[p.ator]}</span>
                              <span
                                className={styles.pilarBadge}
                                style={{ background: pilarClr.bg, borderColor: pilarClr.border, color: pilarClr.color }}
                              >
                                {p.pilar}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Selecionadas — fixas abaixo do campo de busca, fora do popover */}
            <div className={styles.qSelectedSection}>
              <div className={styles.qSelectedHeader}>
                <span className={styles.qSelectedTitle}>Selecionadas</span>
                <span className={styles.qSelectedCount}>{selected.size}</span>
              </div>
              {selectedPerguntas.length === 0 ? (
                <span className={styles.qSelectedEmpty}>Nenhuma pergunta selecionada ainda.</span>
              ) : (
                <div className={styles.qSelectedList}>
                  {selectedPerguntas.map(p => (
                    <div key={p.id} className={styles.qSelectedItem}>
                      <span className={styles.qSelectedItemTitle}>{p.titulo}</span>
                      <button
                        className={styles.qRemoveBtn}
                        onClick={() => toggle(p.id)}
                        aria-label={`Remover ${p.titulo}`}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.modalActions}>
          <button className={styles.modalBtnSecondary} onClick={onClose}>Cancelar</button>
          <button
            className={styles.modalBtnPrimary}
            disabled={!canSave}
            onClick={() => { if (canSave) onSave(nome.trim(), publico as ModeloPublico, Array.from(selected)); }}
          >
            Salvar modelo
          </button>
        </div>

      </div>
    </div>
  );
}

// ─── ModeloDetalheModal — somente leitura ─────────────────────────────────────
interface ModeloDetalheModalProps {
  modelo:         ModeloPesquisa;
  perguntasBanco: Pergunta[];
  onClose:        () => void;
}

function ModeloDetalheModal({ modelo, perguntasBanco, onClose }: ModeloDetalheModalProps) {
  const selectedPerguntas = modelo.perguntaIds
    .map(id => perguntasBanco.find(p => p.id === id))
    .filter(Boolean) as Pergunta[];

  const ESCOPO_LABEL: Record<string, string> = { geral: 'Geral', por_servico: 'Por serviço' };
  const ESCALA_LABEL: Record<string, string> = { '1_5': '1 a 5', '1_10': '1 a 10' };

  return (
    <div className={styles.modalOverlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={[styles.modalCard, styles.modalCardLg].join(' ')}>

        <div className={styles.modalHeader}>
          <div className={styles.modalTitleRow}>
            <LayoutTemplate size={16} className={styles.modalTitleIcon} />
            <span className={styles.modalTitle}>{modelo.nome}</span>
          </div>
          <button className={styles.modalClose} onClick={onClose}><X size={14} /></button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.modalSection}>
            <span className={styles.modalSectionTitle}>Informações básicas</span>
            <div className={styles.detailFieldGrid}>
              <div className={styles.detailField}>
                <span className={styles.detailFieldLabel}>Nome do modelo</span>
                <span className={styles.detailFieldValue}>{modelo.nome}</span>
              </div>
              <div className={styles.detailField}>
                <span className={styles.detailFieldLabel}>Público-alvo</span>
                <span className={styles.detailFieldValue}>{MODELO_PUBLICO_LABEL[modelo.publico]}</span>
              </div>
            </div>
          </div>

          <div className={styles.modalDivider} />

          <div className={styles.modalSection}>
            <div className={styles.modalSectionRow}>
              <span className={styles.modalSectionTitle}>Perguntas</span>
              <span className={styles.modalSectionBadge}>{selectedPerguntas.length}</span>
            </div>

            {selectedPerguntas.length === 0 ? (
              <p className={styles.qReadEmpty}>Este modelo não possui perguntas definidas.</p>
            ) : (
              <div className={styles.qList}>
                {selectedPerguntas.map((q, idx) => {
                  const pilarClr = PILAR_COLOR[q.pilar];
                  return (
                    <div key={q.id} className={styles.qCard}>
                      <div className={styles.qCardHeader}>
                        <span className={styles.qCardNum}>Pergunta {idx + 1}</span>
                        <span
                          className={styles.qReadPilarBadge}
                          style={{ background: pilarClr.bg, borderColor: pilarClr.border, color: pilarClr.color }}
                        >
                          {q.pilar}
                        </span>
                      </div>
                      <div className={styles.qReadFields}>
                        <p className={styles.qReadTexto}>{q.titulo}</p>
                        <div className={styles.qReadMeta}>
                          <span className={styles.qReadTag}>{ATOR_LABEL[q.ator]}</span>
                          {q.peso && <span className={styles.qReadTag}>Peso: {q.peso}</span>}
                          {q.escopo && (
                            <span className={styles.qReadTag}>
                              {ESCOPO_LABEL[q.escopo] ?? q.escopo}
                              {q.escopo === 'por_servico' && q.servico ? ` · ${q.servico}` : ''}
                            </span>
                          )}
                          {q.tipoResposta === 'escala' && (
                            <span className={styles.qReadTag}>Escala {ESCALA_LABEL[q.escalaOpcao] ?? q.escalaOpcao}</span>
                          )}
                          {q.tipoResposta === 'personalizada' && (
                            <span className={styles.qReadTag}>Resposta personalizada</span>
                          )}
                        </div>
                        {q.tipoResposta === 'personalizada' &&
                          q.opcoesPersonalizadas.some(o => o.trim()) && (
                          <div className={styles.qReadOpts}>
                            {q.opcoesPersonalizadas.map((opt, oi) => (
                              <div
                                key={oi}
                                className={styles.qReadOpt}
                                style={{ borderLeftColor: optTrackColor(oi, q.opcoesPersonalizadas.length) }}
                              >
                                <span className={styles.customOptNum}>{oi + 1}.</span>
                                <span className={styles.qReadOptText}>{opt || '—'}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className={styles.modalActions}>
          <button className={styles.modalBtnSecondary} onClick={onClose}>Fechar</button>
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
    <div className={styles.modalOverlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modalCard}>

        <div className={styles.modalHeader}>
          <div className={styles.modalTitleRow}>
            <Trash2 size={16} className={styles.modalTitleIconDanger} />
            <span className={styles.modalTitle}>Excluir modelo</span>
          </div>
          <button className={styles.modalClose} onClick={onClose}><X size={14} /></button>
        </div>

        <div className={styles.deleteModalBody}>
          <p className={styles.deleteModalText}>
            Tem certeza que deseja excluir o modelo <strong>{modelo.nome}</strong>?
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

        <div className={styles.modalActions}>
          <button className={styles.modalBtnSecondary} onClick={onClose}>Cancelar</button>
          <button className={styles.modalBtnDanger} onClick={() => onConfirm(modelo.id)}>
            {inUse ? 'Confirmar exclusão' : 'Excluir modelo'}
          </button>
        </div>

      </div>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface PesquisaScreenProps {
  role:           UserRole;
  sidebarOffset?: number;
  onNavChange?:   (item: string) => void;
  onViewDetail?:  (p: Pesquisa) => void;
}

// ─── PesquisaScreen ───────────────────────────────────────────────────────────
export function PesquisaScreen({ role, sidebarOffset = 0, onNavChange }: PesquisaScreenProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav,   setActiveNav]   = useState('pesquisa');
  const [activeTab,   setActiveTab]   = useState<PesquisaTabType>('subcategorias');

  // ── Subcategorias ─────────────────────────────────────────────────────────
  const [subcategorias,    setSubcategorias]    = useState<Subcategoria[]>(MOCK_SUBCATEGORIAS);
  const [subSearch,        setSubSearch]        = useState('');
  const [subPage,          setSubPage]          = useState(1);
  const [showNovaSubcateg, setShowNovaSubcateg] = useState(false);
  const [editSubcateg,     setEditSubcateg]     = useState<Subcategoria | null>(null);

  // ── Perguntas ─────────────────────────────────────────────────────────────
  const [perguntas,        setPerguntas]        = useState<Pergunta[]>(MOCK_PERGUNTAS_BANCO);
  const [pergSearch,       setPergSearch]       = useState('');
  const [pergPage,         setPergPage]         = useState(1);
  const [filterAtor,       setFilterAtor]       = useState<Ator | ''>('');
  const [filterEscopo,     setFilterEscopo]     = useState<'geral' | 'por_servico' | ''>('');
  const [filterServico,    setFilterServico]    = useState('');
  const [filterOpen,       setFilterOpen]       = useState(false);
  const [showNovaPerg,     setShowNovaPerg]     = useState(false);
  const [editPerg,         setEditPerg]         = useState<Pergunta | null>(null);

  // ── Modelos ───────────────────────────────────────────────────────────────
  const [modelos,          setModelos]          = useState<ModeloPesquisa[]>(MOCK_MODELOS);
  const [modSearch,        setModSearch]        = useState('');
  const [modPage,          setModPage]          = useState(1);
  const [showNovoModelo,   setShowNovoModelo]   = useState(false);
  const [selectedModelo,   setSelectedModelo]   = useState<ModeloPesquisa | null>(null);
  const [modeloToDelete,   setModeloToDelete]   = useState<ModeloPesquisa | null>(null);

  // ── Confirm toggle (padrão ServicosScreen) ────────────────────────────────
  type ConfirmKind = 'subcategoria' | 'pergunta' | 'modelo';
  type ConfirmTarget =
    | { kind: ConfirmKind; item: { id: string; nome: string }; action: 'desativar' | 'reativar' }
    | null;
  const [confirm, setConfirm] = useState<ConfirmTarget>(null);

  function requestToggle(kind: ConfirmKind, item: { id: string; nome: string; status: ItemStatus }) {
    setConfirm({ kind, item, action: item.status === 'ativo' ? 'desativar' : 'reativar' });
  }

  function handleConfirmToggle() {
    if (!confirm) return;
    if (confirm.kind === 'subcategoria') {
      setSubcategorias(prev => prev.map(s =>
        s.id === confirm.item.id ? { ...s, status: s.status === 'ativo' ? 'inativo' : 'ativo' } : s
      ));
    } else if (confirm.kind === 'pergunta') {
      setPerguntas(prev => prev.map(p =>
        p.id === confirm.item.id ? { ...p, status: p.status === 'ativo' ? 'inativo' : 'ativo' } : p
      ));
    } else {
      setModelos(prev => prev.map(m =>
        m.id === confirm.item.id ? { ...m, status: m.status === 'ativo' ? 'inativo' : 'ativo' } : m
      ));
    }
    setConfirm(null);
  }

  // ── Toast ─────────────────────────────────────────────────────────────────
  type ToastPayload = { type: 'success' | 'info' | 'warning'; message: string; title?: string };
  const [toast, setToast] = useState<ToastPayload | null>(null);

  // ── Tooltip ───────────────────────────────────────────────────────────────
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  function showToast(type: ToastPayload['type'], message: string, title?: string) {
    setToast({ type, message, title });
    setTimeout(() => setToast(null), 3500);
  }

  // ── Subcategorias: handlers ───────────────────────────────────────────────
  function handleSaveSubcateg(nome: string, pilar: SubcategoriaPilar, id?: string) {
    if (id) {
      setSubcategorias(prev => prev.map(s => s.id === id ? { ...s, nome, pilar } : s));
      showToast('success', 'Subcategoria atualizada com sucesso!');
    } else {
      const newId = `SUB-${Date.now()}`;
      setSubcategorias(prev => [...prev, { id: newId, nome, pilar, status: 'ativo' }]);
      showToast('success', 'Subcategoria criada com sucesso!');
    }
    setShowNovaSubcateg(false);
    setEditSubcateg(null);
  }

  // ── Perguntas: handlers ───────────────────────────────────────────────────
  function handleSavePerg(data: Omit<Pergunta, 'id'> & { id?: string }) {
    if (data.id) {
      setPerguntas(prev => prev.map(p => p.id === data.id ? { ...p, ...data } as Pergunta : p));
      showToast('success', 'Pergunta atualizada com sucesso!');
    } else {
      const newId = `PQ-${Date.now()}`;
      setPerguntas(prev => [...prev, { ...data, id: newId, status: 'ativo' } as Pergunta]);
      showToast('success', 'Pergunta criada com sucesso!');
    }
    setShowNovaPerg(false);
    setEditPerg(null);
  }

  // ── Modelos: handlers ─────────────────────────────────────────────────────
  function handleSaveModelo(nome: string, publico: ModeloPublico, perguntaIds: string[]) {
    const newId = `MOD-${String(modelos.length + 1).padStart(3, '0')}`;
    setModelos(prev => [...prev, { id: newId, nome, publico, perguntaIds, status: 'ativo' }]);
    setShowNovoModelo(false);
    showToast('success', 'Modelo salvo com sucesso!');
  }

  function handleDeleteModelo(id: string) {
    const wasInUse = getActivePesquisas(id).length > 0;
    setModelos(prev => prev.filter(m => m.id !== id));
    setModeloToDelete(null);
    showToast(
      wasInUse ? 'info' : 'success',
      wasInUse
        ? 'O modelo será excluído automaticamente ao término das pesquisas em andamento.'
        : 'Modelo excluído com sucesso!',
      wasInUse ? 'Exclusão agendada' : undefined,
    );
  }

  // ── Filtragem + paginação: Subcategorias ─────────────────────────────────
  const filteredSub = subcategorias.filter(s =>
    !subSearch.trim() || s.nome.toLowerCase().includes(subSearch.toLowerCase())
  );
  const subTotal = Math.max(1, Math.ceil(filteredSub.length / PAGE_SIZE));
  const subItems = filteredSub.slice((subPage - 1) * PAGE_SIZE, subPage * PAGE_SIZE);
  const subFrom  = filteredSub.length === 0 ? 0 : (subPage - 1) * PAGE_SIZE + 1;
  const subTo    = Math.min(subPage * PAGE_SIZE, filteredSub.length);

  // ── Filtragem + paginação: Perguntas ──────────────────────────────────────
  const activeFilterCount = [filterAtor, filterEscopo, filterServico].filter(Boolean).length;
  const filteredPerg = perguntas.filter(p => {
    if (pergSearch.trim()) {
      const s = pergSearch.toLowerCase();
      if (!p.titulo.toLowerCase().includes(s) && !p.subtitulo.toLowerCase().includes(s)) return false;
    }
    if (filterAtor   && p.ator   !== filterAtor)   return false;
    if (filterEscopo && p.escopo !== filterEscopo)  return false;
    if (filterServico && !p.servico.toLowerCase().includes(filterServico.toLowerCase())) return false;
    return true;
  });
  const pergTotal = Math.max(1, Math.ceil(filteredPerg.length / PAGE_SIZE));
  const pergItems = filteredPerg.slice((pergPage - 1) * PAGE_SIZE, pergPage * PAGE_SIZE);
  const pergFrom  = filteredPerg.length === 0 ? 0 : (pergPage - 1) * PAGE_SIZE + 1;
  const pergTo    = Math.min(pergPage * PAGE_SIZE, filteredPerg.length);

  // ── Filtragem + paginação: Modelos ────────────────────────────────────────
  const filteredMod = modelos.filter(m =>
    !modSearch.trim() || m.nome.toLowerCase().includes(modSearch.toLowerCase())
  );
  const modTotal = Math.max(1, Math.ceil(filteredMod.length / PAGE_SIZE));
  const modItems = filteredMod.slice((modPage - 1) * PAGE_SIZE, modPage * PAGE_SIZE);
  const modFrom  = filteredMod.length === 0 ? 0 : (modPage - 1) * PAGE_SIZE + 1;
  const modTo    = Math.min(modPage * PAGE_SIZE, filteredMod.length);

  function goSub(p: number)  { if (p >= 1 && p <= subTotal)  setSubPage(p);  }
  function goPerg(p: number) { if (p >= 1 && p <= pergTotal) setPergPage(p); }
  function goMod(p: number)  { if (p >= 1 && p <= modTotal)  setModPage(p);  }

  function clearPergFilters() {
    setFilterAtor(''); setFilterEscopo(''); setFilterServico(''); setPergPage(1);
  }

  const servicosNoPerguntas = Array.from(new Set(perguntas.filter(p => p.servico).map(p => p.servico))).sort();

  // ── Confirm dialog title helper ───────────────────────────────────────────
  function confirmTitle() {
    if (!confirm) return '';
    const kindLabel = confirm.kind === 'subcategoria' ? 'subcategoria' : confirm.kind === 'pergunta' ? 'pergunta' : 'modelo';
    return confirm.action === 'desativar' ? `Desativar ${kindLabel}?` : `Reativar ${kindLabel}?`;
  }
  function confirmBody() {
    if (!confirm) return '';
    const { action, kind, item } = confirm;
    if (action === 'desativar') {
      if (kind === 'subcategoria') return `A subcategoria "${item.nome}" será desativada e não estará disponível para novas perguntas. Deseja continuar?`;
      if (kind === 'pergunta')    return `A pergunta "${item.nome}" não estará disponível em novos modelos. Deseja continuar?`;
      return `O modelo "${item.nome}" não estará disponível para uso. Deseja continuar?`;
    }
    if (kind === 'subcategoria') return `A subcategoria "${item.nome}" voltará a estar disponível no sistema. Deseja continuar?`;
    if (kind === 'pergunta')     return `A pergunta "${item.nome}" voltará a estar disponível para modelos. Deseja continuar?`;
    return `O modelo "${item.nome}" voltará a estar disponível para uso. Deseja continuar?`;
  }

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

          {/* ── Page Header ───────────────────────────────────────────────── */}
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Pesquisa</h1>
          </div>

          {/* ── Tabs ──────────────────────────────────────────────────────── */}
          <div className={styles.tabs}>
            <button
              className={[styles.tab, activeTab === 'subcategorias' ? styles.tabActive : ''].filter(Boolean).join(' ')}
              onClick={() => setActiveTab('subcategorias')}
            >
              Subcategoria de pesquisas
            </button>
            <button
              className={[styles.tab, activeTab === 'perguntas' ? styles.tabActive : ''].filter(Boolean).join(' ')}
              onClick={() => setActiveTab('perguntas')}
            >
              Perguntas
            </button>
            <button
              className={[styles.tab, activeTab === 'modelo' ? styles.tabActive : ''].filter(Boolean).join(' ')}
              onClick={() => setActiveTab('modelo')}
            >
              Modelo
            </button>
          </div>

          {/* ───────────────────────────────────────────────────────────────── */}
          {/* ABA: Subcategorias                                                */}
          {/* ───────────────────────────────────────────────────────────────── */}
          {activeTab === 'subcategorias' && (
            <div className={styles.tableSection}>

              <div className={styles.toolbar}>
                <div className={styles.toolbarLeft}>
                  <div className={styles.searchWrap}>
                    <Search size={14} className={styles.searchIcon} />
                    <input
                      type="text"
                      placeholder="Buscar subcategoria…"
                      className={styles.searchInput}
                      value={subSearch}
                      onChange={e => { setSubSearch(e.target.value); setSubPage(1); }}
                    />
                  </div>
                </div>
                <div className={styles.toolbarRight}>
                  <button className={styles.toolbarBtn} onClick={() => setShowNovaSubcateg(true)}>
                    <Plus size={14} /> Nova subcategoria
                  </button>
                </div>
              </div>

              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr className={styles.headerRow}>
                      <th className={styles.th}>Subcategoria</th>
                      <th className={styles.th}>Pilar</th>
                      <th className={styles.th}>Status</th>
                      <th className={styles.th} style={{ width: '1%' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subItems.length === 0 ? (
                      <tr><td colSpan={4} className={styles.emptyCell}>Nenhuma subcategoria encontrada.</td></tr>
                    ) : subItems.map(s => (
                      <tr key={s.id} className={styles.tr}>
                        <td className={styles.td}>
                          <span className={styles.cellText} style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>
                            {s.nome}
                          </span>
                        </td>
                        {/* Pilar como texto simples */}
                        <td className={styles.td}>
                          <span className={styles.cellText}>{s.pilar}</span>
                        </td>
                        <td className={styles.td}><ItemStatusBadge status={s.status} /></td>
                        <td className={styles.td}>
                          <div className={styles.actionsCell}>
                            <button
                              className={styles.actionBtn}
                              onClick={() => setEditSubcateg(s)}
                              onMouseMove={e => setTooltip({ text: 'Editar', x: e.clientX, y: e.clientY })}
                              onMouseLeave={() => setTooltip(null)}
                              aria-label="Editar subcategoria"
                            >
                              {/* Pencil não existe na lista de imports — usar inline SVG via lucide */}
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>
                            {/* Toggle — icon only, sem texto (especificação Subcategorias) */}
                            <button
                              className={styles.actionBtn}
                              onClick={() => requestToggle('subcategoria', s)}
                              onMouseMove={e => setTooltip({ text: s.status === 'ativo' ? 'Desativar' : 'Reativar', x: e.clientX, y: e.clientY })}
                              onMouseLeave={() => setTooltip(null)}
                              aria-label={s.status === 'ativo' ? 'Desativar' : 'Reativar'}
                            >
                              {s.status === 'ativo' ? <Ban size={15} /> : <RotateCcw size={15} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className={styles.pagination}>
                <span className={styles.paginationInfo}>
                  {filteredSub.length === 0
                    ? 'Nenhum resultado'
                    : `Mostrando ${subFrom}–${subTo} de ${filteredSub.length} subcategorias`}
                </span>
                <div className={styles.paginationControls}>
                  <button className={styles.pageBtn} onClick={() => goSub(subPage - 1)} disabled={subPage === 1}>←</button>
                  {Array.from({ length: subTotal }, (_, i) => i + 1).map(n => (
                    <button
                      key={n}
                      className={[styles.pageBtn, subPage === n ? styles.pageBtnActive : ''].filter(Boolean).join(' ')}
                      onClick={() => goSub(n)}
                    >{n}</button>
                  ))}
                  <button className={styles.pageBtn} onClick={() => goSub(subPage + 1)} disabled={subPage === subTotal}>→</button>
                </div>
              </div>

            </div>
          )}

          {/* ───────────────────────────────────────────────────────────────── */}
          {/* ABA: Perguntas                                                    */}
          {/* ───────────────────────────────────────────────────────────────── */}
          {activeTab === 'perguntas' && (
            <div className={styles.tableSection}>

              <div className={styles.toolbar}>
                <div className={styles.toolbarLeft}>
                  <div className={styles.searchWrap}>
                    <Search size={14} className={styles.searchIcon} />
                    <input
                      type="text"
                      placeholder="Buscar pergunta…"
                      className={styles.searchInput}
                      value={pergSearch}
                      onChange={e => { setPergSearch(e.target.value); setPergPage(1); }}
                    />
                  </div>

                  {/* Filtros panel — padrão UsersScreen */}
                  <div className={styles.filterBtnWrap}>
                    <button
                      className={[
                        styles.filtersBtn,
                        filterOpen ? styles.filtersBtnOpen : '',
                        activeFilterCount > 0 ? styles.filtersBtnActive : '',
                      ].filter(Boolean).join(' ')}
                      onClick={() => setFilterOpen(o => !o)}
                    >
                      <SlidersHorizontal size={14} />
                      {activeFilterCount > 0 ? `Filtros · ${activeFilterCount}` : 'Filtros'}
                      <ChevronDown
                        size={12}
                        className={[styles.filtersChevron, filterOpen ? styles.filtersChevronOpen : ''].filter(Boolean).join(' ')}
                      />
                    </button>

                    {filterOpen && (
                      <>
                        <div className={styles.filterBackdrop} onClick={() => setFilterOpen(false)} />
                        <div className={styles.filtersPanel}>
                          <div className={styles.filterField}>
                            <label className={styles.filterLabel}>Ator</label>
                            <div className={styles.filterWrap}>
                              <select
                                className={styles.filterSelect}
                                value={filterAtor}
                                onChange={e => { setFilterAtor(e.target.value as Ator | ''); setPergPage(1); }}
                              >
                                <option value="">Todos os atores</option>
                                <option value="beneficiario">Beneficiário</option>
                                <option value="profissional">Profissional</option>
                                <option value="gestor">Gestor</option>
                              </select>
                              <ChevronDown size={13} className={styles.filterChevron} />
                            </div>
                          </div>
                          <div className={styles.filterField}>
                            <label className={styles.filterLabel}>Escopo</label>
                            <div className={styles.filterWrap}>
                              <select
                                className={styles.filterSelect}
                                value={filterEscopo}
                                onChange={e => { setFilterEscopo(e.target.value as 'geral' | 'por_servico' | ''); setPergPage(1); }}
                              >
                                <option value="">Todos os escopos</option>
                                <option value="geral">Geral</option>
                                <option value="por_servico">Por serviço</option>
                              </select>
                              <ChevronDown size={13} className={styles.filterChevron} />
                            </div>
                          </div>
                          <div className={styles.filterField}>
                            <label className={styles.filterLabel}>Serviço</label>
                            <div className={styles.filterWrap}>
                              <select
                                className={styles.filterSelect}
                                value={filterServico}
                                onChange={e => { setFilterServico(e.target.value); setPergPage(1); }}
                              >
                                <option value="">Todos os serviços</option>
                                {servicosNoPerguntas.map(sv => <option key={sv} value={sv}>{sv}</option>)}
                              </select>
                              <ChevronDown size={13} className={styles.filterChevron} />
                            </div>
                          </div>
                          {activeFilterCount > 0 && (
                            <button className={styles.filtersClear} onClick={clearPergFilters}>
                              Limpar filtros
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className={styles.toolbarRight}>
                  <button className={styles.toolbarBtn} onClick={() => setShowNovaPerg(true)}>
                    <Plus size={14} /> Nova pergunta
                  </button>
                </div>
              </div>

              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr className={styles.headerRow}>
                      <th className={styles.th}>Pergunta</th>
                      <th className={styles.th}>Ator</th>
                      <th className={styles.th}>Escopo</th>
                      <th className={styles.th}>Status</th>
                      <th className={styles.th} style={{ width: '1%' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pergItems.length === 0 ? (
                      <tr><td colSpan={5} className={styles.emptyCell}>Nenhuma pergunta encontrada para os filtros selecionados.</td></tr>
                    ) : pergItems.map(p => (
                      <tr key={p.id} className={styles.tr}>

                        <td className={styles.td}>
                          <div className={styles.cellName}>
                            <span className={styles.cellNameMain}>{p.titulo}</span>
                            {p.subtitulo && <span className={styles.cellNameSub}>{p.subtitulo}</span>}
                          </div>
                        </td>

                        <td className={styles.td}>
                          <span className={styles.cellText}>{ATOR_LABEL[p.ator]}</span>
                        </td>

                        <td className={styles.td}>
                          <span className={styles.cellText}>
                            {p.escopo === 'geral' ? 'Geral' : `Por serviço${p.servico ? ` · ${p.servico}` : ''}`}
                          </span>
                        </td>

                        <td className={styles.td}><ItemStatusBadge status={p.status} /></td>

                        {/* Ação: apenas toggle (edição removida) — icon + texto */}
                        <td className={styles.td}>
                          <div className={styles.actionsCell}>
                            {p.status === 'ativo' ? (
                              <button
                                className={styles.actionBtnDeactivate}
                                onClick={() => requestToggle('pergunta', p)}
                              >
                                <Ban size={13} /> Desativar
                              </button>
                            ) : (
                              <button
                                className={styles.actionBtnReactivate}
                                onClick={() => requestToggle('pergunta', p)}
                              >
                                <RotateCcw size={13} /> Reativar
                              </button>
                            )}
                          </div>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className={styles.pagination}>
                <span className={styles.paginationInfo}>
                  {filteredPerg.length === 0
                    ? 'Nenhum resultado'
                    : `Mostrando ${pergFrom}–${pergTo} de ${filteredPerg.length} perguntas`}
                </span>
                <div className={styles.paginationControls}>
                  <button className={styles.pageBtn} onClick={() => goPerg(pergPage - 1)} disabled={pergPage === 1}>←</button>
                  {Array.from({ length: pergTotal }, (_, i) => i + 1).map(n => (
                    <button
                      key={n}
                      className={[styles.pageBtn, pergPage === n ? styles.pageBtnActive : ''].filter(Boolean).join(' ')}
                      onClick={() => goPerg(n)}
                    >{n}</button>
                  ))}
                  <button className={styles.pageBtn} onClick={() => goPerg(pergPage + 1)} disabled={pergPage === pergTotal}>→</button>
                </div>
              </div>

            </div>
          )}

          {/* ───────────────────────────────────────────────────────────────── */}
          {/* ABA: Modelo                                                       */}
          {/* ───────────────────────────────────────────────────────────────── */}
          {activeTab === 'modelo' && (
            <div className={styles.tableSection}>

              <div className={styles.toolbar}>
                <div className={styles.toolbarLeft}>
                  <div className={styles.searchWrap}>
                    <Search size={14} className={styles.searchIcon} />
                    <input
                      type="text"
                      placeholder="Buscar modelo…"
                      className={styles.searchInput}
                      value={modSearch}
                      onChange={e => { setModSearch(e.target.value); setModPage(1); }}
                    />
                  </div>
                </div>
                <div className={styles.toolbarRight}>
                  <button className={styles.toolbarBtn} onClick={() => setShowNovoModelo(true)}>
                    <Plus size={14} /> Novo modelo
                  </button>
                </div>
              </div>

              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr className={styles.headerRow}>
                      <th className={styles.th}>Nome do modelo</th>
                      <th className={styles.th}>Público</th>
                      <th className={styles.th}>Perguntas</th>
                      <th className={styles.th}>Status</th>
                      <th className={styles.th} style={{ width: '1%' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modItems.length === 0 ? (
                      <tr><td colSpan={5} className={styles.emptyCell}>Nenhum modelo encontrado.</td></tr>
                    ) : modItems.map(m => (
                      <tr key={m.id} className={styles.tr}>

                        <td className={styles.td}>
                          <span className={styles.eventName}>{m.nome}</span>
                        </td>

                        <td className={styles.td}>
                          <span className={styles.cellText}>{MODELO_PUBLICO_LABEL[m.publico]}</span>
                        </td>

                        <td className={styles.td}>
                          <span className={styles.cellText}>{m.perguntaIds.length}</span>
                        </td>

                        <td className={styles.td}><ItemStatusBadge status={m.status} /></td>

                        <td className={styles.td}>
                          <div className={styles.actionsCell}>
                            {/* Ver detalhes — icon only */}
                            <button
                              className={styles.actionBtn}
                              onClick={() => setSelectedModelo(m)}
                              onMouseMove={e => setTooltip({ text: 'Ver detalhes', x: e.clientX, y: e.clientY })}
                              onMouseLeave={() => setTooltip(null)}
                              aria-label="Ver detalhes do modelo"
                            >
                              <Eye size={15} />
                            </button>
                            {/* Toggle — icon only (padrão Subcategorias) */}
                            <button
                              className={styles.actionBtn}
                              onClick={() => requestToggle('modelo', m)}
                              onMouseMove={e => setTooltip({ text: m.status === 'ativo' ? 'Desativar' : 'Reativar', x: e.clientX, y: e.clientY })}
                              onMouseLeave={() => setTooltip(null)}
                              aria-label={m.status === 'ativo' ? 'Desativar' : 'Reativar'}
                            >
                              {m.status === 'ativo' ? <Ban size={15} /> : <RotateCcw size={15} />}
                            </button>
                            {/* Excluir — icon only */}
                            <button
                              className={[styles.actionBtn, styles.actionBtnDanger].join(' ')}
                              onClick={() => setModeloToDelete(m)}
                              onMouseMove={e => setTooltip({ text: 'Excluir modelo', x: e.clientX, y: e.clientY })}
                              onMouseLeave={() => setTooltip(null)}
                              aria-label="Excluir modelo"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className={styles.pagination}>
                <span className={styles.paginationInfo}>
                  {filteredMod.length === 0
                    ? 'Nenhum resultado'
                    : `Mostrando ${modFrom}–${modTo} de ${filteredMod.length} modelos`}
                </span>
                <div className={styles.paginationControls}>
                  <button className={styles.pageBtn} onClick={() => goMod(modPage - 1)} disabled={modPage === 1}>←</button>
                  {Array.from({ length: modTotal }, (_, i) => i + 1).map(n => (
                    <button
                      key={n}
                      className={[styles.pageBtn, modPage === n ? styles.pageBtnActive : ''].filter(Boolean).join(' ')}
                      onClick={() => goMod(n)}
                    >{n}</button>
                  ))}
                  <button className={styles.pageBtn} onClick={() => goMod(modPage + 1)} disabled={modPage === modTotal}>→</button>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* ── Modal: Nova/Editar Subcategoria ──────────────────────────────────── */}
      {(showNovaSubcateg || editSubcateg) && (
        <NovaSubcategoriaModal
          initial={editSubcateg}
          onClose={() => { setShowNovaSubcateg(false); setEditSubcateg(null); }}
          onSave={handleSaveSubcateg}
        />
      )}

      {/* ── Modal: Nova Pergunta ──────────────────────────────────────────────── */}
      {(showNovaPerg || editPerg) && (
        <NovaPerguntaModal
          subcategorias={subcategorias}
          initial={editPerg}
          onClose={() => { setShowNovaPerg(false); setEditPerg(null); }}
          onSave={handleSavePerg}
        />
      )}

      {/* ── Modal: Novo Modelo ────────────────────────────────────────────────── */}
      {showNovoModelo && (
        <NovoModeloModal
          perguntasBanco={perguntas}
          onClose={() => setShowNovoModelo(false)}
          onSave={handleSaveModelo}
        />
      )}

      {/* ── Modal: Detalhe do Modelo (somente leitura) ────────────────────────── */}
      {selectedModelo && (
        <ModeloDetalheModal
          modelo={selectedModelo}
          perguntasBanco={perguntas}
          onClose={() => setSelectedModelo(null)}
        />
      )}

      {/* ── Modal: Excluir Modelo ─────────────────────────────────────────────── */}
      {modeloToDelete && (
        <DeleteModeloModal
          modelo={modeloToDelete}
          onClose={() => setModeloToDelete(null)}
          onConfirm={handleDeleteModelo}
        />
      )}

      {/* ── Dialog: Confirmar Desativar / Reativar (padrão ServicosScreen) ─────── */}
      {confirm && (
        <Dialog
          open={!!confirm}
          title={confirmTitle()}
          onClose={() => setConfirm(null)}
          actions={
            <>
              <Button variant="secondary" size="sm" onClick={() => setConfirm(null)}>
                Cancelar
              </Button>
              <Button variant="primary" size="sm" onClick={handleConfirmToggle}>
                {confirm.action === 'desativar' ? 'Desativar' : 'Reativar'}
              </Button>
            </>
          }
        >
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.5', margin: 0 }}>
            {confirmBody()}
          </p>
        </Dialog>
      )}

      {/* ── Toast ─────────────────────────────────────────────────────────────── */}
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

      {/* ── Tooltip global ────────────────────────────────────────────────────── */}
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
