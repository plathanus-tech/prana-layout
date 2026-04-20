// TELA: Detalhe do Cliente (Admin only)
// ROLES COM ACESSO: admin
// PERMISSÕES:
//   admin → visualizar dados do CRM (somente leitura) +
//            editar contatos de pesquisa e tipo de cliente (inline)

import { useState } from 'react';
import { ArrowLeft, Pencil, Check, X, ChevronDown, CheckCircle2, Clock } from 'lucide-react';
import { Sidebar } from '../../../components/Sidebar/Sidebar';
import { Feedback } from '../../../components/Feedback/Feedback';
import type { UserRole } from './UsersScreen';
import type { Cliente } from './ClientesScreen';
import styles from './ClienteDetailScreen.module.css';

// ─── Types ────────────────────────────────────────────────────────────────────
type TipoCliente = 'recorrente' | 'esporadico';

interface Contato {
  nome:       string;
  email:      string;
  respondeu:  boolean; // se já respondeu a pesquisa pós-evento
}

interface ClienteDetailData {
  // CRM (somente leitura)
  nome:       string;
  cnpj:       string;
  id:         string;
  localizacao: string;
  // Configurável
  contatoPrincipal:   Contato;
  contatoSecundario:  Contato;
  tipoCliente:        TipoCliente;
  anotacoes:          string; // somente leitura (nunca editável)
}

// ─── Opções ──────────────────────────────────────────────────────────────────
const TIPO_OPTIONS = [
  { value: 'recorrente', label: 'Recorrente' },
  { value: 'esporadico', label: 'Esporádico' },
] as const;

const TIPO_CONFIG: Record<TipoCliente, { label: string; bg: string; border: string; color: string }> = {
  recorrente: {
    label: 'Recorrente',
    bg:     'var(--color-brand-50)',
    border: 'var(--color-brand-300)',
    color:  'var(--color-brand-600)',
  },
  esporadico: {
    label: 'Esporádico',
    bg:     'var(--color-gray-100)',
    border: 'var(--color-gray-300)',
    color:  'var(--color-text-secondary)',
  },
};

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_DETAIL: Record<string, ClienteDetailData> = {
  'CLI-001': {
    nome: 'Itaú Unibanco', cnpj: '60.872.504/0001-23', id: 'CLI-001', localizacao: 'São Paulo, SP',
    contatoPrincipal:  { nome: 'Ana Silva',       email: 'ana.silva@itau.com.br',         respondeu: true  },
    contatoSecundario: { nome: 'Carlos Medeiros',  email: 'carlos.medeiros@itau.com.br',   respondeu: false },
    tipoCliente: 'recorrente',
    anotacoes: 'Cliente estratégico. Preferência por eventos no campus Faria Lima. Contrato anual renovado em jan/2026.',
  },
  'CLI-002': {
    nome: 'Ambev', cnpj: '07.526.557/0001-00', id: 'CLI-002', localizacao: 'São Paulo, SP',
    contatoPrincipal:  { nome: 'Roberto Santos',  email: 'roberto.santos@ambev.com.br',    respondeu: false },
    contatoSecundario: { nome: 'Fernanda Lima',   email: 'fernanda.lima@ambev.com.br',     respondeu: false },
    tipoCliente: 'recorrente',
    anotacoes: 'Foco em saúde ocupacional para turno noturno. Solicitar laudo ergonômico antes de cada evento.',
  },
  'CLI-003': {
    nome: 'Bradesco', cnpj: '60.746.948/0001-12', id: 'CLI-003', localizacao: 'Osasco, SP',
    contatoPrincipal:  { nome: 'Beatriz Costa',   email: 'beatriz@bradesco.com.br',        respondeu: false },
    contatoSecundario: { nome: 'Paulo Henrique',  email: 'paulo.h@bradesco.com.br',        respondeu: false },
    tipoCliente: 'recorrente',
    anotacoes: 'Eventos realizados na sede de Osasco. Ponto focal é o RH.',
  },
  'CLI-004': {
    nome: 'Natura', cnpj: '71.673.990/0001-77', id: 'CLI-004', localizacao: 'São Paulo, SP',
    contatoPrincipal:  { nome: 'Marina Costa',    email: 'marina@natura.com.br',           respondeu: false },
    contatoSecundario: { nome: 'Juliana Faria',   email: 'juliana.faria@natura.com.br',    respondeu: false },
    tipoCliente: 'esporadico',
    anotacoes: '',
  },
  'CLI-005': {
    nome: 'Vale', cnpj: '33.592.510/0001-54', id: 'CLI-005', localizacao: 'Rio de Janeiro, RJ',
    contatoPrincipal:  { nome: 'Patricia Nunes',  email: 'patricia@vale.com.br',           respondeu: false },
    contatoSecundario: { nome: 'André Martins',   email: 'andre.martins@vale.com.br',      respondeu: false },
    tipoCliente: 'recorrente',
    anotacoes: 'Equipe de segurança do trabalho deve ser acionada previamente.',
  },
  'CLI-006': {
    nome: 'Magazine Luiza', cnpj: '47.960.950/0001-21', id: 'CLI-006', localizacao: 'Franca, SP',
    contatoPrincipal:  { nome: 'Lucas Costa',     email: 'lucas.costa@magazineluiza.com.br', respondeu: false },
    contatoSecundario: { nome: 'Camila Rocha',    email: 'camila.rocha@magazineluiza.com.br', respondeu: false },
    tipoCliente: 'esporadico',
    anotacoes: '',
  },
  'CLI-007': {
    nome: 'iFood', cnpj: '14.380.200/0001-21', id: 'CLI-007', localizacao: 'Osasco, SP',
    contatoPrincipal:  { nome: 'Sophia Oliveira', email: 'sophia.oliveira@ifood.com.br',   respondeu: false },
    contatoSecundario: { nome: 'Thiago Ramos',    email: 'thiago.ramos@ifood.com.br',      respondeu: false },
    tipoCliente: 'recorrente',
    anotacoes: 'Equipe 100% remota. Eventos realizados em formato híbrido.',
  },
  'CLI-008': {
    nome: 'Renner', cnpj: '92.754.738/0001-62', id: 'CLI-008', localizacao: 'Porto Alegre, RS',
    contatoPrincipal:  { nome: 'Gabriel Silva',   email: 'gabriel.silva@renner.com.br',    respondeu: false },
    contatoSecundario: { nome: 'Isabela Teixeira', email: 'isabela.t@renner.com.br',        respondeu: false },
    tipoCliente: 'esporadico',
    anotacoes: '',
  },
  'CLI-009': {
    nome: 'Petrobras', cnpj: '33.000.167/0001-01', id: 'CLI-009', localizacao: 'Rio de Janeiro, RJ',
    contatoPrincipal:  { nome: 'Ricardo Alves',   email: 'ricardo.alves@petrobras.com.br', respondeu: false },
    contatoSecundario: { nome: 'Natália Sousa',   email: 'natalia.sousa@petrobras.com.br', respondeu: false },
    tipoCliente: 'recorrente',
    anotacoes: 'Área offshore tem restrições de deslocamento. Coordenar com segurança patrimonial.',
  },
  'CLI-010': {
    nome: 'Vivo', cnpj: '02.558.157/0001-62', id: 'CLI-010', localizacao: 'São Paulo, SP',
    contatoPrincipal:  { nome: 'Diego Ferreira',  email: 'diego.ferreira@vivo.com.br',    respondeu: false },
    contatoSecundario: { nome: 'Larissa Campos',  email: 'larissa.campos@vivo.com.br',    respondeu: false },
    tipoCliente: 'recorrente',
    anotacoes: '',
  },
};

const DEFAULT_DETAIL: ClienteDetailData = {
  nome: '—', cnpj: '—', id: '—', localizacao: '—',
  contatoPrincipal:  { nome: '', email: '', respondeu: false },
  contatoSecundario: { nome: '', email: '', respondeu: false },
  tipoCliente: 'esporadico',
  anotacoes: '',
};

// ─── Helper: EditInput ────────────────────────────────────────────────────────
function EditInput({ value, onChange, placeholder, type = 'text' }: {
  value:        string;
  onChange:     (v: string) => void;
  placeholder?: string;
  type?:        string;
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

// ─── Helper: EditSelect ───────────────────────────────────────────────────────
function EditSelect({ value, onChange, options }: {
  value:    string;
  onChange: (v: string) => void;
  options:  readonly { value: string; label: string }[];
}) {
  return (
    <div className={styles.editSelectWrap}>
      <select
        className={styles.editSelect}
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

// ─── Props ────────────────────────────────────────────────────────────────────
interface ClienteDetailScreenProps {
  cliente:        Cliente;
  role:           UserRole;
  sidebarOffset?: number;
  onNavChange?:   (item: string) => void;
  onBack:         () => void;
}

// ─── ClienteDetailScreen ──────────────────────────────────────────────────────
export function ClienteDetailScreen({
  cliente, role, sidebarOffset = 0, onNavChange, onBack,
}: ClienteDetailScreenProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav,   setActiveNav]   = useState('clientes');

  // Detail data (CRM + config combinados)
  const baseDetail = MOCK_DETAIL[cliente.id] ?? DEFAULT_DETAIL;
  const [saved,    setSaved]    = useState<ClienteDetailData>(baseDetail);
  const [draft,    setDraft]    = useState<ClienteDetailData>(baseDetail);
  const [editMode, setEditMode] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Survey status: any contact responded?
  const alguemRespondeu = saved.contatoPrincipal.respondeu || saved.contatoSecundario.respondeu;

  // ── Handlers ──────────────────────────────────────────────────────────────
  function handleEdit() {
    setDraft(saved);
    setEditMode(true);
  }

  function handleCancel() {
    setDraft(saved);
    setEditMode(false);
  }

  function handleSave() {
    setSaved(draft);
    setEditMode(false);
    setFeedback({ type: 'success', message: 'Alterações salvas com sucesso' });
    setTimeout(() => setFeedback(null), 3000);
  }

  // ── Field helper: read-only or input ──────────────────────────────────────
  function readOrInput(
    value: string,
    onChange: (v: string) => void,
    placeholder?: string,
    type = 'text',
  ) {
    if (!editMode) {
      return (
        <span className={styles.fieldValue}>
          {value || <span className={styles.fieldEmpty}>—</span>}
        </span>
      );
    }
    return <EditInput value={value} onChange={onChange} placeholder={placeholder} type={type} />;
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

          {/* ── ← Voltar ──────────────────────────────────────────────────── */}
          <button className={styles.backNav} onClick={onBack}>
            <ArrowLeft size={14} />
            Voltar
          </button>

          {/* ── Header: nome da empresa + subtítulo ───────────────────────── */}
          <div className={styles.pageHeader}>
            <div className={styles.headerMeta}>
              <h1 className={styles.pageTitle}>{saved.nome}</h1>
              <div className={styles.pageSub}>
                <span>{saved.cnpj}</span>
                <span className={styles.pageSubSep}>·</span>
                <span>{saved.id}</span>
                <span className={styles.pageSubSep}>·</span>
                <span>{saved.localizacao}</span>
              </div>
            </div>
          </div>

          {/* ── Config Action Bar ─────────────────────────────────────────── */}
          <div className={styles.configActionBar}>
            <div className={styles.configActionLeft}>
              {editMode && (
                <span className={styles.editingBadge}>
                  <Pencil size={11} />
                  Modo edição
                </span>
              )}
            </div>
            <div className={styles.configActionBtns}>
              {editMode ? (
                <>
                  <button className={styles.cancelBtn} onClick={handleCancel}>
                    <X size={13} />
                    Cancelar
                  </button>
                  <button className={styles.saveBtn} onClick={handleSave}>
                    <Check size={13} />
                    Salvar
                  </button>
                </>
              ) : (
                <button className={styles.editBtn} onClick={handleEdit}>
                  <Pencil size={13} />
                  Editar
                </button>
              )}
            </div>
          </div>

          {/* ── Feedback ─────────────────────────────────────────────────── */}
          {feedback && (
            <Feedback
              type={feedback.type}
              message={feedback.message}
              dismissible
              onDismiss={() => setFeedback(null)}
            />
          )}

          {/* ─────────────────────────────────────────────────────────────── */}
          {/* SECTION 1 — Informações da empresa (CRM, somente leitura)       */}
          {/* ─────────────────────────────────────────────────────────────── */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>Informações da empresa</span>
              <span className={styles.sectionBadge}>CRM · Somente leitura</span>
            </div>
            <div className={styles.fieldsGrid}>
              {/* Nome */}
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Nome</span>
                <span className={styles.fieldValue}>{saved.nome}</span>
              </div>
              {/* CNPJ */}
              <div className={styles.field}>
                <span className={styles.fieldLabel}>CNPJ</span>
                <span className={styles.fieldValue}>{saved.cnpj}</span>
              </div>
              {/* ID */}
              <div className={styles.field}>
                <span className={styles.fieldLabel}>ID</span>
                <span className={styles.fieldValue}>{saved.id}</span>
              </div>
              {/* Localização */}
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Localização</span>
                <span className={styles.fieldValue}>{saved.localizacao}</span>
              </div>
              {/* Anotações */}
              <div className={[styles.field, styles.fieldFull].join(' ')}>
                <span className={styles.fieldLabel}>Anotações</span>
                <span className={styles.notesValue}>
                  {saved.anotacoes || <span className={styles.fieldEmpty}>Sem anotações registradas.</span>}
                </span>
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────── */}
          {/* SECTION 2 — Contatos para pesquisa                              */}
          {/* ─────────────────────────────────────────────────────────────── */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>Contatos para pesquisa</span>
              {editMode && (
                <span className={[styles.sectionBadge, styles.sectionBadgeEdit].join(' ')}>
                  Modo edição
                </span>
              )}
            </div>

            {/* ── Contato principal ──────────────────────────────────────── */}
            <div className={styles.configGroup}>
              <span className={styles.configGroupTitle}>Contato principal</span>
              <div className={styles.fieldsGrid}>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Nome</span>
                  {readOrInput(
                    draft.contatoPrincipal.nome,
                    v => setDraft(d => ({ ...d, contatoPrincipal: { ...d.contatoPrincipal, nome: v } })),
                    'Nome do contato',
                  )}
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>E-mail</span>
                  {readOrInput(
                    draft.contatoPrincipal.email,
                    v => setDraft(d => ({ ...d, contatoPrincipal: { ...d.contatoPrincipal, email: v } })),
                    'contato@empresa.com.br',
                    'email',
                  )}
                </div>
                {/* Status de pesquisa — oculto em modo edição */}
                {!editMode && (
                  <div className={[styles.field, styles.fieldFull].join(' ')}>
                    <span className={styles.fieldLabel}>Status da pesquisa</span>
                    {saved.contatoPrincipal.respondeu ? (
                      <div className={styles.surveyBadgeAnswered}>
                        <CheckCircle2 size={13} />
                        Respondeu
                      </div>
                    ) : alguemRespondeu ? (
                      <div className={styles.surveyBadgeBlocked}>
                        <Clock size={13} />
                        Esta pesquisa já foi respondida
                      </div>
                    ) : (
                      <span className={styles.fieldValue}>Aguardando resposta</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ── Contato secundário ─────────────────────────────────────── */}
            <div className={[styles.configGroup, styles.configGroupLast].join(' ')}>
              <span className={styles.configGroupTitle}>Contato secundário</span>
              <div className={styles.fieldsGrid}>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Nome</span>
                  {readOrInput(
                    draft.contatoSecundario.nome,
                    v => setDraft(d => ({ ...d, contatoSecundario: { ...d.contatoSecundario, nome: v } })),
                    'Nome do contato',
                  )}
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>E-mail</span>
                  {readOrInput(
                    draft.contatoSecundario.email,
                    v => setDraft(d => ({ ...d, contatoSecundario: { ...d.contatoSecundario, email: v } })),
                    'contato@empresa.com.br',
                    'email',
                  )}
                </div>
                {!editMode && (
                  <div className={[styles.field, styles.fieldFull].join(' ')}>
                    <span className={styles.fieldLabel}>Status da pesquisa</span>
                    {saved.contatoSecundario.respondeu ? (
                      <div className={styles.surveyBadgeAnswered}>
                        <CheckCircle2 size={13} />
                        Respondeu
                      </div>
                    ) : alguemRespondeu ? (
                      <div className={styles.surveyBadgeBlocked}>
                        <Clock size={13} />
                        Esta pesquisa já foi respondida
                      </div>
                    ) : (
                      <span className={styles.fieldValue}>Aguardando resposta</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────── */}
          {/* SECTION 3 — Configurações adicionais                            */}
          {/* ─────────────────────────────────────────────────────────────── */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>Configurações adicionais</span>
              {editMode && (
                <span className={[styles.sectionBadge, styles.sectionBadgeEdit].join(' ')}>
                  Modo edição
                </span>
              )}
            </div>

            {/* ── Tipo de cliente ────────────────────────────────────────── */}
            <div className={[styles.configGroup, styles.configGroupLast].join(' ')}>
              <span className={styles.configGroupTitle}>Tipo de cliente</span>
              <div className={styles.fieldsGrid}>
                <div className={[styles.field, styles.fieldFull].join(' ')}>
                  <span className={styles.fieldLabel}>Tipo</span>
                  {editMode ? (
                    <EditSelect
                      value={draft.tipoCliente}
                      onChange={v => setDraft(d => ({ ...d, tipoCliente: v as TipoCliente }))}
                      options={TIPO_OPTIONS}
                    />
                  ) : (
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '4px 12px',
                        borderRadius: '6px',
                        border: `1px solid ${TIPO_CONFIG[saved.tipoCliente].border}`,
                        background: TIPO_CONFIG[saved.tipoCliente].bg,
                        color: TIPO_CONFIG[saved.tipoCliente].color,
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: 'var(--font-weight-medium)',
                        fontFamily: 'var(--font-body)',
                        width: 'fit-content',
                      }}
                    >
                      {TIPO_CONFIG[saved.tipoCliente].label}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
