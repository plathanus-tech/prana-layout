// TELA: Serviços — Gestão de categorias e tipos de serviço (Admin only)
// ROLES COM ACESSO: adm
// ABAS: Categoria de serviço | Tipo de serviço

import { useState } from 'react';
import type React from 'react';
import { Plus, Ban, RotateCcw, Search, X } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Sidebar } from '../../../components/Sidebar/Sidebar';
import { Dialog } from '../../../components/Dialog/Dialog';
import { Input } from '../../../components/Input/Input';
import { Dropdown } from '../../../components/Dropdown/Dropdown';
import { Button } from '../../../components/Button/Button';
import { Feedback } from '../../../components/Feedback/Feedback';
import type { UserRole } from './UsersScreen';
import styles from './ServicosScreen.module.css';

// ─── Types ────────────────────────────────────────────────────────────────────
export type ServicosTab = 'categorias' | 'tipos';
type ItemStatus  = 'ativo' | 'inativo';

interface Categoria {
  id:        string;
  nome:      string;
  descricao: string;
  status:    ItemStatus;
}

interface TipoServico {
  id:            string;
  nome:          string;
  categoriaId:   string;
  duracaoPadrao: number;        // minutos
  valorRepasse:  number | null; // R$, opcional
  iconNome?:     string;        // nome kebab-case do ícone Lucide (opcional)
  status:        ItemStatus;
}

interface CatForm  { nome: string; descricao: string; }
interface TipoForm { categoriaId: string; nome: string; duracao: string; valorRepasse: string; iconNome: string; }

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_CATEGORIAS: Categoria[] = [
  { id: 'CAT-001', nome: 'Terapêutico', descricao: 'Serviços focados em terapias corporais e relaxamento.',       status: 'ativo'   },
  { id: 'CAT-002', nome: 'Estético',    descricao: 'Tratamentos voltados ao bem-estar e beleza.',                 status: 'ativo'   },
  { id: 'CAT-003', nome: 'Funcional',   descricao: 'Serviços de reabilitação e melhora de desempenho físico.',    status: 'ativo'   },
  { id: 'CAT-004', nome: 'Preventivo',  descricao: 'Ações voltadas à prevenção de doenças e promoção da saúde.', status: 'inativo' },
];

const MOCK_TIPOS: TipoServico[] = [
  { id: 'SVC-001', nome: 'Quick Massage',          categoriaId: 'CAT-001', duracaoPadrao: 15, valorRepasse: 80.00,  iconNome: 'sparkles',   status: 'ativo'   },
  { id: 'SVC-002', nome: 'Auriculoterapia',        categoriaId: 'CAT-001', duracaoPadrao: 30, valorRepasse: 120.00, iconNome: 'ear',        status: 'ativo'   },
  { id: 'SVC-003', nome: 'Yoga',                   categoriaId: 'CAT-002', duracaoPadrao: 45, valorRepasse: 90.00,  iconNome: 'leaf',       status: 'ativo'   },
  { id: 'SVC-005', nome: 'Massagem terapêutica',   categoriaId: 'CAT-001', duracaoPadrao: 50, valorRepasse: 110.00, iconNome: 'hand-heart', status: 'ativo'   },
  { id: 'SVC-006', nome: 'Manicure',               categoriaId: 'CAT-003', duracaoPadrao: 30, valorRepasse: 130.00, iconNome: 'palette',    status: 'inativo' },
  { id: 'SVC-007', nome: 'Ginástica Laboral',      categoriaId: 'CAT-003', duracaoPadrao: 60, valorRepasse: 95.00,  iconNome: 'dumbbell',   status: 'ativo'   },
  { id: 'SVC-008', nome: 'Reflexologia',           categoriaId: 'CAT-001', duracaoPadrao: 40, valorRepasse: 85.00,  iconNome: 'footprints', status: 'ativo'   },
];

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<ItemStatus, { label: string; bg: string; border: string; color: string }> = {
  ativo:   { label: 'Ativo',   bg: 'var(--color-status-success-bg)', border: 'var(--color-green-300)',  color: 'var(--color-status-success-fg)' },
  inativo: { label: 'Inativo', bg: 'var(--color-gray-100)',          border: 'var(--color-gray-300)',   color: 'var(--color-text-secondary)'    },
};

// ─── Formatadores ─────────────────────────────────────────────────────────────
function fmtCurrency(val: number | null): string {
  if (val === null) return '—';
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ─── Validadores ──────────────────────────────────────────────────────────────
function validateCategoria(data: CatForm, existing: Categoria[]): Record<string, string> {
  const errors: Record<string, string> = {};
  const nome = data.nome.trim();

  if (!nome) {
    errors.nome = 'Nome é obrigatório';
  } else if (nome.length < 3) {
    errors.nome = 'Mínimo de 3 caracteres';
  } else if (nome.length > 60) {
    errors.nome = 'Máximo de 60 caracteres';
  } else if (existing.some(c => c.nome.toLowerCase() === nome.toLowerCase())) {
    errors.nome = 'Já existe uma categoria com este nome';
  }

  if (data.descricao.length > 200) {
    errors.descricao = 'Máximo de 200 caracteres';
  }

  return errors;
}

function validateTipo(data: TipoForm, existing: TipoServico[]): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!data.categoriaId) {
    errors.categoriaId = 'Categoria é obrigatória';
  }

  const nome = data.nome.trim();
  if (!nome) {
    errors.nome = 'Nome é obrigatório';
  } else if (nome.length < 3) {
    errors.nome = 'Mínimo de 3 caracteres';
  } else if (nome.length > 80) {
    errors.nome = 'Máximo de 80 caracteres';
  } else if (data.categoriaId && existing.some(t =>
    t.categoriaId === data.categoriaId &&
    t.nome.toLowerCase() === nome.toLowerCase()
  )) {
    errors.nome = 'Já existe um tipo com este nome nesta categoria';
  }

  if (!data.duracao.trim()) {
    errors.duracao = 'Duração é obrigatória';
  } else {
    const dur = Number(data.duracao);
    if (!Number.isInteger(dur) || dur < 5) {
      errors.duracao = 'Mínimo de 5 minutos';
    } else if (dur > 480) {
      errors.duracao = 'Máximo de 480 minutos (8h)';
    }
  }

  if (data.valorRepasse.trim()) {
    const val = parseFloat(data.valorRepasse.replace(',', '.'));
    if (isNaN(val) || val < 0) {
      errors.valorRepasse = 'Valor inválido';
    } else if (val > 99999.99) {
      errors.valorRepasse = 'Máximo R$ 99.999,99';
    }
  }

  return errors;
}

// ─── Icon utilities ───────────────────────────────────────────────────────────

/** Converte kebab-case em PascalCase para lookup no objeto LucideIcons */
function toComponentName(kebab: string): string {
  return kebab.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
}

/** Converte PascalCase em kebab-case para armazenamento */
function toKebabName(pascal: string): string {
  return pascal
    .replace(/^([A-Z])/, m => m.toLowerCase())
    .replace(/([A-Z])/g, m => '-' + m.toLowerCase());
}

/** Renderiza ícone Lucide pelo nome em kebab-case */
function IconByName({ name, size = 18 }: { name: string; size?: number }) {
  const Icon = (LucideIcons as Record<string, React.ElementType>)[toComponentName(name)];
  if (!Icon) return <span style={{ fontSize: 10, color: 'var(--color-text-tertiary)' }}>?</span>;
  return <Icon size={size} />;
}

/** Ícones sugeridos para tipos de serviço */
const SUGGESTED_ICONS = ['dumbbell', 'heart', 'sparkles', 'brain', 'leaf', 'hand', 'activity'];

/** Lista completa de ícones Lucide em kebab-case, gerada uma vez no módulo */
const ALL_ICON_NAMES: string[] = (() => {
  const excluded = new Set(['createLucideIcon', 'icons']);
  return Object.keys(LucideIcons)
    .filter(k => /^[A-Z]/.test(k) && !excluded.has(k) && typeof (LucideIcons as Record<string, unknown>)[k] === 'function')
    .map(toKebabName)
    .sort();
})();

// ─── IconPicker component ──────────────────────────────────────────────────────
interface IconPickerProps {
  value:    string;
  onChange: (name: string) => void;
}

function IconPicker({ value, onChange }: IconPickerProps) {
  const [iconSearch, setIconSearch] = useState('');

  const q = iconSearch.toLowerCase().trim();
  const filteredAll = q
    ? ALL_ICON_NAMES.filter(n => n.includes(q))
    : ALL_ICON_NAMES;
  // Limita exibição a 150 quando sem busca — evita lentidão no render inicial
  const displayedAll = q ? filteredAll : filteredAll.slice(0, 150);

  return (
    <div className={styles.iconPickerWrap}>
      <span className={styles.iconPickerLabel}>
        Ícone do serviço
        <span className={styles.optional}>(opcional)</span>
      </span>
      <span className={styles.iconPickerHelper}>
        Escolha um ícone da biblioteca Lucide{' '}
        <a
          href="https://lucide.dev/icons/"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.iconPickerLink}
        >
          Ver ícones
        </a>
      </span>

      {/* Preview do ícone selecionado */}
      {value && (
        <div className={styles.iconPreviewRow}>
          <span className={styles.iconPreviewIcon}>
            <IconByName name={value} size={20} />
          </span>
          <span className={styles.iconPreviewName}>{value}</span>
          <button
            type="button"
            className={styles.iconClearBtn}
            onClick={() => onChange('')}
            title="Remover ícone"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Sugestões ─────────────────────────────────────────────────────── */}
      <span className={styles.iconSectionTitle}>Sugestões</span>
      <div className={styles.iconGridSuggested}>
        {SUGGESTED_ICONS.map(name => (
          <button
            key={name}
            type="button"
            title={name}
            className={[styles.iconBtn, value === name ? styles.iconBtnActive : ''].filter(Boolean).join(' ')}
            onClick={() => onChange(value === name ? '' : name)}
          >
            <IconByName name={name} size={18} />
          </button>
        ))}
      </div>

      {/* ── Todos os ícones ───────────────────────────────────────────────── */}
      <div className={styles.iconAllSection}>
        <span className={styles.iconSectionTitle}>Todos os ícones</span>
        <div className={styles.iconSearchWrap}>
          <Search size={13} className={styles.iconSearchIcon} />
          <input
            className={styles.iconSearchInput}
            placeholder="Buscar ícone..."
            value={iconSearch}
            onChange={e => setIconSearch(e.target.value)}
          />
        </div>
        <div className={styles.iconScrollGrid}>
          {displayedAll.length === 0 ? (
            <span className={styles.iconNoResult}>Nenhum ícone encontrado.</span>
          ) : (
            displayedAll.map(name => (
              <button
                key={name}
                type="button"
                title={name}
                className={[styles.iconBtn, value === name ? styles.iconBtnActive : ''].filter(Boolean).join(' ')}
                onClick={() => onChange(value === name ? '' : name)}
              >
                <IconByName name={name} size={16} />
              </button>
            ))
          )}
        </div>
        {!q && filteredAll.length > 150 && (
          <span className={styles.iconNoResult}>
            Mostrando 150 de {filteredAll.length} ícones · use a busca para filtrar
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface ServicosScreenProps {
  role:           UserRole;
  sidebarOffset?: number;
  initialTab?:    ServicosTab;
  onNavChange?:   (item: string) => void;
}

// ─── ServicosScreen ───────────────────────────────────────────────────────────
export function ServicosScreen({ role, sidebarOffset = 0, onNavChange, initialTab = 'categorias' }: ServicosScreenProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav,   setActiveNav]   = useState('servicos');
  const [activeTab,   setActiveTab]   = useState<ServicosTab>(initialTab);

  // ── Dados ──────────────────────────────────────────────────────────────────
  const [categorias, setCategorias] = useState<Categoria[]>(MOCK_CATEGORIAS);
  const [tipos,      setTipos]      = useState<TipoServico[]>(MOCK_TIPOS);

  // ── Busca ──────────────────────────────────────────────────────────────────
  const [catSearch,  setCatSearch]  = useState('');
  const [tipoSearch, setTipoSearch] = useState('');

  // ── Feedback (toast) ───────────────────────────────────────────────────────
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  function showFeedback(type: 'success' | 'error', message: string) {
    setFeedback({ type, message });
  }

  // ─── Modal: Nova Categoria ─────────────────────────────────────────────────
  const EMPTY_CAT: CatForm = { nome: '', descricao: '' };
  const [showCatModal, setShowCatModal] = useState(false);
  const [catForm,      setCatForm]      = useState<CatForm>(EMPTY_CAT);
  const [catErrors,    setCatErrors]    = useState<Record<string, string>>({});

  function openCatModal()  { setCatForm(EMPTY_CAT); setCatErrors({}); setShowCatModal(true); }
  function closeCatModal() { setShowCatModal(false); setCatForm(EMPTY_CAT); setCatErrors({}); }

  function handleCatChange(field: keyof CatForm, val: string) {
    setCatForm(prev => ({ ...prev, [field]: val }));
    if (catErrors[field]) setCatErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  }

  function handleCatSubmit() {
    const errors = validateCategoria(catForm, categorias);
    if (Object.keys(errors).length > 0) { setCatErrors(errors); return; }

    const newCat: Categoria = {
      id:        `CAT-${String(categorias.length + 1).padStart(3, '0')}`,
      nome:      catForm.nome.trim(),
      descricao: catForm.descricao.trim(),
      status:    'ativo',
    };
    setCategorias(prev => [...prev, newCat]);
    showFeedback('success', `Categoria "${newCat.nome}" criada com sucesso`);
    setTimeout(closeCatModal, 1200);
  }

  // ─── Modal: Novo Tipo de Serviço ───────────────────────────────────────────
  const EMPTY_TIPO: TipoForm = { categoriaId: '', nome: '', duracao: '', valorRepasse: '', iconNome: '' };
  const [showTipoModal, setShowTipoModal] = useState(false);
  const [tipoForm,      setTipoForm]      = useState<TipoForm>(EMPTY_TIPO);
  const [tipoErrors,    setTipoErrors]    = useState<Record<string, string>>({});

  function openTipoModal()  { setTipoForm(EMPTY_TIPO); setTipoErrors({}); setShowTipoModal(true); }
  function closeTipoModal() { setShowTipoModal(false); setTipoForm(EMPTY_TIPO); setTipoErrors({}); }

  function handleTipoChange(field: keyof TipoForm, val: string) {
    setTipoForm(prev => ({ ...prev, [field]: val }));
    if (tipoErrors[field]) setTipoErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  }

  function handleTipoSubmit() {
    const errors = validateTipo(tipoForm, tipos);
    if (Object.keys(errors).length > 0) { setTipoErrors(errors); return; }

    const dur  = parseInt(tipoForm.duracao, 10);
    const val  = tipoForm.valorRepasse.trim()
      ? parseFloat(tipoForm.valorRepasse.replace(',', '.'))
      : null;

    const newTipo: TipoServico = {
      id:            `SVC-${String(tipos.length + 1).padStart(3, '0')}`,
      nome:          tipoForm.nome.trim(),
      categoriaId:   tipoForm.categoriaId,
      duracaoPadrao: dur,
      valorRepasse:  val,
      iconNome:      tipoForm.iconNome || undefined,
      status:        'ativo',
    };
    setTipos(prev => [...prev, newTipo]);
    const catNome = categorias.find(c => c.id === tipoForm.categoriaId)?.nome ?? '';
    showFeedback('success', `Tipo "${newTipo.nome}" criado com sucesso${catNome ? ` em ${catNome}` : ''}`);
    setTimeout(closeTipoModal, 1200);
  }

  // ─── Confirmação: Desativar / Reativar ─────────────────────────────────────
  type ConfirmTarget =
    | { kind: 'categoria'; item: Categoria;    action: 'desativar' | 'reativar' }
    | { kind: 'tipo';      item: TipoServico;  action: 'desativar' | 'reativar' }
    | null;

  const [confirm, setConfirm] = useState<ConfirmTarget>(null);

  function requestToggleCategoria(cat: Categoria) {
    setConfirm({ kind: 'categoria', item: cat, action: cat.status === 'ativo' ? 'desativar' : 'reativar' });
  }

  function requestToggleTipo(tipo: TipoServico) {
    setConfirm({ kind: 'tipo', item: tipo, action: tipo.status === 'ativo' ? 'desativar' : 'reativar' });
  }

  function handleConfirmToggle() {
    if (!confirm) return;
    if (confirm.kind === 'categoria') {
      setCategorias(prev => prev.map(c =>
        c.id === confirm.item.id ? { ...c, status: c.status === 'ativo' ? 'inativo' : 'ativo' } : c
      ));
      showFeedback('success',
        `Categoria "${confirm.item.nome}" ${confirm.action === 'desativar' ? 'desativada' : 'reativada'} com sucesso`
      );
    } else {
      setTipos(prev => prev.map(t =>
        t.id === confirm.item.id ? { ...t, status: t.status === 'ativo' ? 'inativo' : 'ativo' } : t
      ));
      showFeedback('success',
        `Tipo "${confirm.item.nome}" ${confirm.action === 'desativar' ? 'desativado' : 'reativado'} com sucesso`
      );
    }
    setConfirm(null);
  }

  // ── Opções de categorias ativas para o select do tipo ─────────────────────
  const activeCatOptions = categorias
    .filter(c => c.status === 'ativo')
    .map(c => ({ label: c.nome, value: c.id }));

  // ── Badge de status ────────────────────────────────────────────────────────
  function StatusBadge({ status }: { status: ItemStatus }) {
    const cfg = STATUS_CONFIG[status];
    return (
      <div style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        padding: '6px 12px',
        background: cfg.bg, border: `1px solid ${cfg.border}`,
        borderRadius: '6px', fontSize: '12px', fontWeight: 500, color: cfg.color,
      }}>
        {cfg.label}
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────
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

          {/* Feedback toast */}
          {feedback && (
            <div className={styles.feedbackWrap}>
              <Feedback
                type={feedback.type}
                message={feedback.message}
                dismissible
                onDismiss={() => setFeedback(null)}
              />
            </div>
          )}

          {/* Título da página */}
          <h1 className={styles.pageTitle}>Serviços</h1>

          {/* Tabs de navegação */}
          <div className={styles.tabsRow}>
            <button
              className={[styles.tab, activeTab === 'categorias' ? styles.tabActive : ''].filter(Boolean).join(' ')}
              onClick={() => setActiveTab('categorias')}
            >
              Categoria de serviço
            </button>
            <button
              className={[styles.tab, activeTab === 'tipos' ? styles.tabActive : ''].filter(Boolean).join(' ')}
              onClick={() => setActiveTab('tipos')}
            >
              Tipo de serviço
            </button>
          </div>

          {/* ── Aba: Categorias de serviço ──────────────────────────────── */}
          {activeTab === 'categorias' && (
            <div className={styles.tabContent}>
              <div className={styles.tableSection}>

                {/* Toolbar: busca + botão */}
                <div className={styles.toolbar}>
                  <div className={styles.searchWrap}>
                    <Search size={14} className={styles.searchIcon} />
                    <input
                      className={styles.searchInput}
                      placeholder="Buscar categoria"
                      value={catSearch}
                      onChange={e => setCatSearch(e.target.value)}
                    />
                  </div>
                  <button
                    className={styles.toolbarBtn}
                    onClick={openCatModal}
                    type="button"
                  >
                    <Plus size={14} />
                    Nova categoria
                  </button>
                </div>

                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr className={styles.headerRow}>
                        <th className={styles.th}>Nome da categoria</th>
                        <th className={styles.th}>Descrição</th>
                        <th className={styles.th}>Status</th>
                        <th className={styles.th}>Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const q = catSearch.toLowerCase().trim();
                        const filtered = categorias.filter(c =>
                          !q || c.nome.toLowerCase().includes(q) || c.descricao.toLowerCase().includes(q)
                        );
                        if (filtered.length === 0) return (
                          <tr><td colSpan={4} className={styles.emptyCell}>
                            {q ? 'Nenhuma categoria encontrada.' : 'Nenhuma categoria cadastrada.'}
                          </td></tr>
                        );
                        return filtered.map(cat => (
                          <tr key={cat.id} className={styles.tr}>
                            <td className={styles.td}>
                              <span className={styles.cellName}>{cat.nome}</span>
                            </td>
                            <td className={styles.td}>
                              <span className={styles.cellDesc}>{cat.descricao || '—'}</span>
                            </td>
                            <td className={styles.td}>
                              <StatusBadge status={cat.status} />
                            </td>
                            <td className={styles.td}>
                              <div className={styles.actionsCell}>
                                {cat.status === 'ativo' ? (
                                  <button
                                    className={[styles.actionBtn, styles.actionBtnDeactivate].join(' ')}
                                    onClick={() => requestToggleCategoria(cat)}
                                  >
                                    <Ban size={13} />
                                    Desativar
                                  </button>
                                ) : (
                                  <button
                                    className={[styles.actionBtn, styles.actionBtnReactivate].join(' ')}
                                    onClick={() => requestToggleCategoria(cat)}
                                  >
                                    <RotateCcw size={13} />
                                    Reativar
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── Aba: Tipos de serviço ───────────────────────────────────── */}
          {activeTab === 'tipos' && (
            <div className={styles.tabContent}>
              <div className={styles.tableSection}>

                {/* Toolbar: busca + botão */}
                <div className={styles.toolbar}>
                  <div className={styles.searchWrap}>
                    <Search size={14} className={styles.searchIcon} />
                    <input
                      className={styles.searchInput}
                      placeholder="Buscar tipo de serviço"
                      value={tipoSearch}
                      onChange={e => setTipoSearch(e.target.value)}
                    />
                  </div>
                  <button
                    className={styles.toolbarBtn}
                    onClick={openTipoModal}
                    type="button"
                  >
                    <Plus size={14} />
                    Novo tipo de serviço
                  </button>
                </div>

                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr className={styles.headerRow}>
                        <th className={styles.th}>Nome do tipo</th>
                        <th className={styles.th}>Categoria</th>
                        <th className={styles.th}>Duração padrão (min)</th>
                        <th className={styles.th}>Valor padrão de repasse</th>
                        <th className={styles.th}>Status</th>
                        <th className={styles.th}>Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const q = tipoSearch.toLowerCase().trim();
                        const filtered = tipos.filter(t => {
                          if (!q) return true;
                          const catNome = categorias.find(c => c.id === t.categoriaId)?.nome ?? '';
                          return t.nome.toLowerCase().includes(q) || catNome.toLowerCase().includes(q);
                        });
                        if (filtered.length === 0) return (
                          <tr><td colSpan={6} className={styles.emptyCell}>
                            {q ? 'Nenhum tipo de serviço encontrado.' : 'Nenhum tipo de serviço cadastrado.'}
                          </td></tr>
                        );
                        return filtered.map(tipo => {
                          const catNome = categorias.find(c => c.id === tipo.categoriaId)?.nome ?? '—';
                          return (
                            <tr key={tipo.id} className={styles.tr}>
                              <td className={styles.td}>
                                <span className={styles.cellIconWrap}>
                                  {tipo.iconNome && (
                                    <span className={styles.cellIcon}>
                                      <IconByName name={tipo.iconNome} size={15} />
                                    </span>
                                  )}
                                  <span className={styles.cellName}>{tipo.nome}</span>
                                </span>
                              </td>
                              <td className={styles.td}>
                                <span className={styles.cellText}>{catNome}</span>
                              </td>
                              <td className={styles.td}>
                                <span className={styles.cellText}>{tipo.duracaoPadrao} min</span>
                              </td>
                              <td className={styles.td}>
                                <span className={styles.cellText}>{fmtCurrency(tipo.valorRepasse)}</span>
                              </td>
                              <td className={styles.td}>
                                <StatusBadge status={tipo.status} />
                              </td>
                              <td className={styles.td}>
                                <div className={styles.actionsCell}>
                                  {tipo.status === 'ativo' ? (
                                    <button
                                      className={[styles.actionBtn, styles.actionBtnDeactivate].join(' ')}
                                      onClick={() => requestToggleTipo(tipo)}
                                    >
                                      <Ban size={13} />
                                      Desativar
                                    </button>
                                  ) : (
                                    <button
                                      className={[styles.actionBtn, styles.actionBtnReactivate].join(' ')}
                                      onClick={() => requestToggleTipo(tipo)}
                                    >
                                      <RotateCcw size={13} />
                                      Reativar
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ─── Modal: Nova Categoria ─────────────────────────────────────────── */}
      {showCatModal && (
        <Dialog
          open={showCatModal}
          title="Nova categoria"
          onClose={closeCatModal}
          actions={
            <>
              <Button variant="secondary" size="sm" onClick={closeCatModal}>
                Cancelar
              </Button>
              <Button variant="primary" size="sm" onClick={handleCatSubmit}>
                Criar categoria
              </Button>
            </>
          }
        >
          <div className={styles.modalForm}>
            {/* Nome */}
            <div>
              <Input
                label="Nome da categoria"
                placeholder="Ex: Terapêutico"
                value={catForm.nome}
                onChange={e => handleCatChange('nome', e.target.value)}
                error={catErrors.nome}
                maxLength={60}
              />
              <div className={styles.charCount}>{catForm.nome.length}/60</div>
            </div>

            {/* Descrição */}
            <div>
              <label className={styles.textareaLabel}>
                Descrição
                <span className={styles.optional}>(opcional)</span>
              </label>
              <textarea
                className={[styles.textarea, catErrors.descricao ? styles.textareaError : ''].filter(Boolean).join(' ')}
                placeholder="Ex: Serviços focados em terapias corporais."
                value={catForm.descricao}
                onChange={e => handleCatChange('descricao', e.target.value)}
                maxLength={200}
                rows={3}
              />
              <div className={styles.textareaFooter}>
                {catErrors.descricao
                  ? <span className={styles.errorMsg}>{catErrors.descricao}</span>
                  : <span />
                }
                <div className={styles.charCount}>{catForm.descricao.length}/200</div>
              </div>
            </div>
          </div>
        </Dialog>
      )}

      {/* ─── Modal: Novo Tipo de Serviço ───────────────────────────────────── */}
      {showTipoModal && (
        <Dialog
          open={showTipoModal}
          title="Novo tipo de serviço"
          onClose={closeTipoModal}
          actions={
            <>
              <Button variant="secondary" size="sm" onClick={closeTipoModal}>
                Cancelar
              </Button>
              <Button variant="primary" size="sm" onClick={handleTipoSubmit}>
                Criar tipo
              </Button>
            </>
          }
        >
          <div className={styles.modalForm}>
            {/* Categoria */}
            <Dropdown
              label="Categoria"
              options={activeCatOptions}
              value={tipoForm.categoriaId}
              onChange={val => handleTipoChange('categoriaId', val as string)}
              placeholder="Selecione uma categoria"
              error={tipoErrors.categoriaId}
            />

            {/* Nome do tipo */}
            <div>
              <Input
                label="Nome do tipo de serviço"
                placeholder="Ex: Quick Massage"
                value={tipoForm.nome}
                onChange={e => handleTipoChange('nome', e.target.value)}
                error={tipoErrors.nome}
                maxLength={80}
              />
              <div className={styles.charCount}>{tipoForm.nome.length}/80</div>
            </div>

            {/* Ícone do serviço */}
            <IconPicker
              value={tipoForm.iconNome}
              onChange={name => handleTipoChange('iconNome', name)}
            />

            {/* Duração padrão */}
            <Input
              label="Duração padrão (min)"
              type="number"
              placeholder="Ex: 30"
              value={tipoForm.duracao}
              onChange={e => handleTipoChange('duracao', e.target.value)}
              error={tipoErrors.duracao}
              step={5}
              helperText={!tipoErrors.duracao
                ? 'Múltiplos de 5 são recomendados · Mínimo: 5 min · Máximo: 480 min (8h)'
                : undefined}
            />

            {/* Valor padrão de repasse */}
            <Input
              label="Valor padrão de repasse (R$)"
              type="number"
              placeholder="Ex: 80.00"
              value={tipoForm.valorRepasse}
              onChange={e => handleTipoChange('valorRepasse', e.target.value)}
              error={tipoErrors.valorRepasse}
              helperText={!tipoErrors.valorRepasse
                ? 'Opcional · Valor sugerido ao criar evento; pode ser sobrescrito'
                : undefined}
            />
          </div>
        </Dialog>
      )}

      {/* ─── Modal: Confirmação de Desativar / Reativar ───────────────────── */}
      {confirm && (
        <Dialog
          open={!!confirm}
          title={
            confirm.action === 'desativar'
              ? `Desativar ${confirm.kind === 'categoria' ? 'categoria' : 'tipo de serviço'}?`
              : `Reativar ${confirm.kind === 'categoria' ? 'categoria' : 'tipo de serviço'}?`
          }
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
            {confirm.action === 'desativar'
              ? confirm.kind === 'categoria'
                ? `A categoria "${confirm.item.nome}" será desativada e não estará disponível para novos tipos de serviço. Deseja continuar?`
                : `O tipo de serviço "${confirm.item.nome}" não estará disponível para novos eventos. Deseja continuar?`
              : confirm.kind === 'categoria'
                ? `A categoria "${confirm.item.nome}" voltará a estar disponível no sistema. Deseja continuar?`
                : `O tipo de serviço "${confirm.item.nome}" voltará a estar disponível para eventos. Deseja continuar?`
            }
          </p>
        </Dialog>
      )}
    </div>
  );
}
