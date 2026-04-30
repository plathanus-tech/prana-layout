// TELA: Lista de Eventos
// ROLES COM ACESSO: admin, empresa
// PERMISSÕES:
//   admin   → visão global (coluna Cliente visível, filtro por empresa)
//   empresa → visão restrita à própria empresa (sem coluna Cliente)

import { useState } from 'react';
import {
  Search, SlidersHorizontal, ChevronDown, QrCode,
  Link2, Eye, ChevronLeft, ChevronRight, X, Download, Check,
} from 'lucide-react';
import { Sidebar } from '../../../components/Sidebar/Sidebar';
import styles from './EventsScreen.module.css';
import tooltipStyles from '../../../components/Tooltip/Tooltip.module.css';

export type UserRole = 'adm' | 'empresa';

// ─── Types ────────────────────────────────────────────────────────────────────
type EventStatus = 'ativo' | 'aguardando' | 'concluido' | 'cancelado' | 'pendente';
type QRType      = 'inscricao' | 'encaixe';

export interface EventItem {
  id: string;
  name: string;
  startDate: string;
  endDate?: string;
  company: string;
  professionals: { hired: number; needed: number };
  status: EventStatus;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_EVENTS: EventItem[] = [
  { id: 'EVT-001', name: 'SIPAT - Itaú Unibanco',        startDate: '13/04/2026', endDate: '15/04/2026', company: 'Itaú Unibanco',  professionals: { hired: 5, needed: 6 }, status: 'ativo'      },
  { id: 'EVT-002', name: 'Semana da Saúde - Natura',      startDate: '14/04/2026', endDate: '15/04/2026', company: 'Natura',         professionals: { hired: 4, needed: 4 }, status: 'ativo'      },
  { id: 'EVT-003', name: 'Dia da Saúde - Ambev',          startDate: '20/05/2026', endDate: '21/05/2026', company: 'Ambev',          professionals: { hired: 2, needed: 5 }, status: 'aguardando' },
  { id: 'EVT-004', name: 'Quick Massage - Vale',           startDate: '05/06/2026',                        company: 'Vale',           professionals: { hired: 0, needed: 3 }, status: 'pendente'   },
  { id: 'EVT-005', name: 'Ginástica Laboral - Bradesco',  startDate: '10/03/2026', endDate: '11/03/2026', company: 'Bradesco',       professionals: { hired: 6, needed: 6 }, status: 'concluido'  },
  { id: 'EVT-006', name: 'Yoga Corporativo - Magalu',     startDate: '22/02/2026',                        company: 'Magazine Luiza', professionals: { hired: 0, needed: 4 }, status: 'cancelado'  },
  { id: 'EVT-007', name: 'Meditação - iFood',             startDate: '01/07/2026', endDate: '02/07/2026', company: 'iFood',          professionals: { hired: 1, needed: 3 }, status: 'aguardando' },
  { id: 'EVT-008', name: 'SIPAT - Renner',                startDate: '15/07/2026', endDate: '17/07/2026', company: 'Renner',         professionals: { hired: 0, needed: 6 }, status: 'pendente'   },
  { id: 'EVT-009', name: 'Wellbeing Day - Santander',     startDate: '28/08/2026', endDate: '29/08/2026', company: 'Santander',      professionals: { hired: 3, needed: 5 }, status: 'aguardando' },
  { id: 'EVT-010', name: 'CIPA - Petrobras',              startDate: '03/09/2026', endDate: '05/09/2026', company: 'Petrobras',      professionals: { hired: 0, needed: 8 }, status: 'pendente'   },
  { id: 'EVT-011', name: 'Quick Massage - Nubank',        startDate: '18/09/2026',                        company: 'Nubank',         professionals: { hired: 2, needed: 2 }, status: 'ativo'      },
  { id: 'EVT-012', name: 'Meditação Guiada - B3',         startDate: '07/10/2026',                        company: 'B3',             professionals: { hired: 0, needed: 2 }, status: 'aguardando' },
];

// ─── Status config — tokens do design system ──────────────────────────────────
interface StatusCfg { label: string; bg: string; border: string; color: string; }
const STATUS_CONFIG: Record<EventStatus, StatusCfg> = {
  ativo:      { label: 'Ativo',              bg: 'var(--color-status-success-bg)', border: 'var(--color-green-300)',  color: 'var(--color-status-success-fg)' },
  aguardando: { label: 'Aguardando',         bg: 'var(--color-status-warning-bg)', border: '#FDE047',                color: 'var(--color-status-warning-fg)' },
  concluido:  { label: 'Concluído',          bg: 'var(--color-gray-100)',          border: 'var(--color-gray-300)',  color: 'var(--color-text-secondary)'    },
  cancelado:  { label: 'Cancelado',          bg: 'var(--color-status-error-bg)',   border: 'var(--color-red-300)',   color: 'var(--color-status-error-fg)'   },
  pendente:   { label: 'Pend. configuração', bg: 'var(--color-status-orange-bg)',  border: '#FED7AA',                color: 'var(--color-status-orange-fg)'  },
};

// ─── Ordenação de eventos ─────────────────────────────────────────────────────
// Prioridade: exigem ação (pendente/aguardando) → ativos asc → concluídos desc → cancelados
function parseEventDate(s: string): number {
  const [d, m, y] = s.split('/').map(Number);
  return new Date(y, m - 1, d).getTime();
}

const STATUS_SORT_GROUP: Record<EventStatus, number> = {
  pendente:   0,  // exige ação
  aguardando: 1,  // exige ação
  ativo:      2,  // futuro confirmado
  concluido:  3,  // concluído
  cancelado:  4,  // ao final
};

function sortEvents(a: EventItem, b: EventItem): number {
  const ga = STATUS_SORT_GROUP[a.status];
  const gb = STATUS_SORT_GROUP[b.status];
  if (ga !== gb) return ga - gb;
  const da = parseEventDate(a.startDate);
  const db = parseEventDate(b.startDate);
  // Concluídos: data decrescente (mais recente primeiro)
  // Demais grupos: data crescente (mais próximo primeiro)
  return ga === 3 ? db - da : da - db;
}

// ─── QR pattern — determinístico por seed ────────────────────────────────────
function makeQRGrid(seed: number, n = 13): boolean[][] {
  return Array.from({ length: n }, (_, r) =>
    Array.from({ length: n }, (_, c) => {
      if (r < 3 && c < 3)       return true;  // finder top-left
      if (r < 3 && c >= n - 3)  return true;  // finder top-right
      if (r >= n - 3 && c < 3)  return true;  // finder bottom-left
      if (r === 6 || c === 6)   return (r + c) % 2 === 0;  // timing
      return ((r * 29 + c * 19 + seed * 7) % 4) !== 0;
    })
  );
}
const QR_GRIDS: Record<QRType, boolean[][]> = {
  inscricao: makeQRGrid(42),
  encaixe:   makeQRGrid(73),
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: EventStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={styles.statusBadge}
      style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}

// ─── QR Code Modal ────────────────────────────────────────────────────────────
function QRCodeModal({ type, onClose }: { type: QRType; onClose: () => void }) {
  const isInscricao = type === 'inscricao';
  const title    = isInscricao ? 'QR Code de Inscrição' : 'QR Code de Encaixe';
  const subtitle = isInscricao
    ? 'Compartilhe para que participantes se inscrevam no evento.'
    : 'Utilize para encaixes de profissionais disponíveis no evento.';
  const grid = QR_GRIDS[type];
  const cell = 14, n = grid.length, size = n * cell;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={e => e.stopPropagation()}>

        <div className={styles.modalHeader}>
          <div className={styles.modalTitleRow}>
            <QrCode size={18} className={styles.modalTitleIcon} />
            <span className={styles.modalTitle}>{title}</span>
          </div>
          <button className={styles.modalClose} onClick={onClose} aria-label="Fechar">
            <X size={16} />
          </button>
        </div>

        <p className={styles.modalSubtitle}>{subtitle}</p>

        <div className={styles.qrWrap}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
            {grid.map((row, r) =>
              row.map((filled, c) =>
                filled ? (
                  <rect
                    key={`${r}-${c}`}
                    x={c * cell + 1} y={r * cell + 1}
                    width={cell - 2} height={cell - 2}
                    rx="2" fill="var(--color-text-primary)"
                  />
                ) : null
              )
            )}
          </svg>
        </div>

        <div className={styles.modalActions}>
          <button className={styles.modalBtnSecondary}>
            <Link2 size={14} /> Copiar link
          </button>
          <button className={styles.modalBtnPrimary}>
            <Download size={14} /> Baixar QR Code
          </button>
        </div>

      </div>
    </div>
  );
}

// ─── Events Table ─────────────────────────────────────────────────────────────
const PAGE_SIZE = 8;

interface EventsTableProps {
  role: UserRole;
  onViewDetail?: (event: EventItem) => void;
}

function EventsTable({ role, onViewDetail }: EventsTableProps) {
  const [search,         setSearch]         = useState('');
  const [filterStatus,   setFilterStatus]   = useState<EventStatus | ''>('');
  const [filterPeriod,   setFilterPeriod]   = useState('');
  const [filterCompany,  setFilterCompany]  = useState('');
  const [filterOpen,     setFilterOpen]     = useState(false);
  const [page,           setPage]           = useState(1);
  const [copiedId,       setCopiedId]       = useState<string | null>(null);
  const [tooltip,        setTooltip]        = useState<{ text: string; x: number; y: number } | null>(null);

  // Contagem de filtros ativos — alimenta o badge
  const activeCount = [filterStatus, filterPeriod, filterCompany].filter(Boolean).length;

  function clearFilters() {
    setFilterStatus('');
    setFilterPeriod('');
    setFilterCompany('');
    setPage(1);
  }

  // Filtragem + ordenação por prioridade de ação
  const filtered = MOCK_EVENTS.filter(ev => {
    const q = search.toLowerCase();
    const matchSearch  = !search        || ev.name.toLowerCase().includes(q) || ev.id.toLowerCase().includes(q);
    const matchStatus  = !filterStatus  || ev.status === filterStatus;
    const matchCompany = !filterCompany || ev.company === filterCompany;
    return matchSearch && matchStatus && matchCompany;
  });
  const sorted = [...filtered].sort(sortEvents);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems  = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const from       = filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to         = Math.min(page * PAGE_SIZE, filtered.length);

  function go(p: number) { if (p >= 1 && p <= totalPages) setPage(p); }
  function onSearch(v: string) { setSearch(v); setPage(1); }

  function formatDate(ev: EventItem) {
    return ev.endDate ? `${ev.startDate} – ${ev.endDate}` : ev.startDate;
  }

  const colCount = role === 'adm' ? 6 : 5;

  return (
    <div className={styles.tableSection}>

      {/* ── Toolbar: busca + botão Filtros ─────────────────────────────── */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>

          {/* Busca */}
          <div className={styles.searchWrap}>
            <Search size={14} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar por nome ou ID…"
              className={styles.searchInput}
              value={search}
              onChange={e => onSearch(e.target.value)}
            />
          </div>

          {/* Botão Filtros — consolida status, período e empresa */}
          <div className={styles.filterBtnWrap}>
            <button
              className={[
                styles.filtersBtn,
                filterOpen     ? styles.filtersBtnOpen   : '',
                activeCount > 0 ? styles.filtersBtnActive : '',
              ].filter(Boolean).join(' ')}
              onClick={() => setFilterOpen(o => !o)}
            >
              <SlidersHorizontal size={14} />
              {activeCount > 0 ? `Filtros · ${activeCount}` : 'Filtros'}
              <ChevronDown
                size={12}
                className={[styles.filtersChevron, filterOpen ? styles.filtersChevronOpen : ''].filter(Boolean).join(' ')}
              />
            </button>

            {/* Painel de filtros — aparece ao clicar */}
            {filterOpen && (
              <>
                <div className={styles.filterBackdrop} onClick={() => setFilterOpen(false)} />
                <div className={styles.filtersPanel}>

                  {/* Status */}
                  <div className={styles.filterField}>
                    <label className={styles.filterLabel}>Status</label>
                    <div className={styles.filterWrap}>
                      <select
                        className={styles.filterSelect}
                        value={filterStatus}
                        onChange={e => { setFilterStatus(e.target.value as EventStatus | ''); setPage(1); }}
                      >
                        <option value="">Todos os status</option>
                        <option value="ativo">Ativo</option>
                        <option value="aguardando">Aguardando</option>
                        <option value="concluido">Concluído</option>
                        <option value="cancelado">Cancelado</option>
                        <option value="pendente">Pend. configuração</option>
                      </select>
                      <ChevronDown size={13} className={styles.filterChevron} />
                    </div>
                  </div>

                  {/* Período */}
                  <div className={styles.filterField}>
                    <label className={styles.filterLabel}>Período</label>
                    <div className={styles.filterWrap}>
                      <select
                        className={styles.filterSelect}
                        value={filterPeriod}
                        onChange={e => { setFilterPeriod(e.target.value); setPage(1); }}
                      >
                        <option value="">Todo o período</option>
                        <option value="30d">Últimos 30 dias</option>
                        <option value="3m">Últimos 3 meses</option>
                        <option value="6m">Último semestre</option>
                        <option value="1a">Último ano</option>
                      </select>
                      <ChevronDown size={13} className={styles.filterChevron} />
                    </div>
                  </div>

                  {/* Empresa — admin only */}
                  {role === 'adm' && (
                    <div className={styles.filterField}>
                      <label className={styles.filterLabel}>Empresa</label>
                      <div className={styles.filterWrap}>
                        <select
                          className={styles.filterSelect}
                          value={filterCompany}
                          onChange={e => { setFilterCompany(e.target.value); setPage(1); }}
                        >
                          <option value="">Todas as empresas</option>
                          <option value="Itaú Unibanco">Itaú Unibanco</option>
                          <option value="Natura">Natura</option>
                          <option value="Ambev">Ambev</option>
                          <option value="Vale">Vale</option>
                          <option value="Bradesco">Bradesco</option>
                        </select>
                        <ChevronDown size={13} className={styles.filterChevron} />
                      </div>
                    </div>
                  )}

                  {/* Limpar filtros */}
                  {activeCount > 0 && (
                    <button className={styles.filtersClear} onClick={clearFilters}>
                      Limpar filtros
                    </button>
                  )}

                </div>
              </>
            )}
          </div>

        </div>
      </div>

      {/* ── Tabela ─────────────────────────────────────────────────────── */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.headerRow}>
              <th className={styles.th}>Evento</th>
              <th className={styles.th}>Data</th>
              {role === 'adm' && <th className={styles.th}>Empresa</th>}
              <th className={styles.th}>Profissionais</th>
              <th className={styles.th}>Status</th>
              <th className={styles.th}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 ? (
              <tr>
                <td colSpan={colCount} className={styles.emptyCell}>
                  Nenhum evento encontrado para os filtros selecionados.
                </td>
              </tr>
            ) : (
              pageItems.map(ev => (
                <tr key={ev.id} className={styles.tr}>

                  {/* Evento: nome + ID (sem imagem/thumbnail) */}
                  <td className={styles.td}>
                    <div className={styles.eventInfo}>
                      <span className={styles.eventName}>{ev.name}</span>
                    </div>
                  </td>

                  {/* Data — suporta múltiplos dias */}
                  <td className={styles.td}>
                    <span className={styles.cellText}>{formatDate(ev)}</span>
                  </td>

                  {/* Cliente — admin only */}
                  {role === 'adm' && (
                    <td className={styles.td}>
                      <span className={styles.cellText}>{ev.company}</span>
                    </td>
                  )}

                  {/* Profissionais: contratados / necessários */}
                  <td className={styles.td}>
                    <span className={[
                      styles.cellText,
                      ev.professionals.hired < ev.professionals.needed ? styles.profsIncomplete : '',
                    ].filter(Boolean).join(' ')}>
                      {ev.professionals.hired}/{ev.professionals.needed} profissionais
                    </span>
                  </td>

                  {/* Status */}
                  <td className={styles.td}>
                    <StatusBadge status={ev.status} />
                  </td>

                  {/* Ações — hit area 40×40, alinhado à esquerda */}
                  <td className={styles.td}>
                    <div className={styles.actionsCell}>
                      {/* Copiar link — feedback visual de 1.75 s */}
                      <button
                        className={[
                          styles.actionBtn,
                          copiedId === ev.id ? styles.actionBtnCopied : '',
                        ].filter(Boolean).join(' ')}
                        onClick={() => {
                          navigator.clipboard.writeText(`https://app.prana.com.br/eventos/${ev.id}`).catch(() => {});
                          setCopiedId(ev.id);
                          setTooltip(t => t ? { ...t, text: 'Copiado!' } : null);
                          setTimeout(() => setCopiedId(null), 1750);
                        }}
                        onMouseMove={e => setTooltip({ text: copiedId === ev.id ? 'Copiado!' : 'Copiar link', x: e.clientX, y: e.clientY })}
                        onMouseLeave={() => setTooltip(null)}
                        aria-label="Copiar link"
                      >
                        {copiedId === ev.id
                          ? <Check size={16} className={styles.iconFadeIn} />
                          : <Link2 size={16} />
                        }
                      </button>
                      <button
                        className={styles.actionBtn}
                        onClick={() => onViewDetail?.(ev)}
                        onMouseMove={e => setTooltip({ text: 'Ver detalhes', x: e.clientX, y: e.clientY })}
                        onMouseLeave={() => setTooltip(null)}
                        aria-label="Ver detalhes"
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

      {/* ── Paginação ──────────────────────────────────────────────────── */}
      <div className={styles.pagination}>
        <span className={styles.paginationInfo}>
          {filtered.length === 0
            ? 'Nenhum resultado'
            : `Mostrando ${from}–${to} de ${filtered.length} eventos`}
        </span>
        <div className={styles.paginationControls}>
          <button
            className={styles.pageBtn}
            onClick={() => go(page - 1)}
            disabled={page === 1}
            aria-label="Página anterior"
          >
            <ChevronLeft size={14} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              className={[styles.pageBtn, p === page ? styles.pageBtnActive : ''].filter(Boolean).join(' ')}
              onClick={() => go(p)}
            >
              {p}
            </button>
          ))}
          <button
            className={styles.pageBtn}
            onClick={() => go(page + 1)}
            disabled={page === totalPages}
            aria-label="Próxima página"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* ── Tooltip ────────────────────────────────────────────────────── */}
      {tooltip && (
        <div
          className={tooltipStyles.tip}
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y - 44,
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            zIndex: 9999,
            opacity: 1,
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}

// ─── Events Screen ────────────────────────────────────────────────────────────
interface EventsScreenProps {
  role: UserRole;
  sidebarOffset?: number;
  /** Callback opcional: notifica o shell quando um item do sidebar é clicado. */
  onNavChange?: (item: string) => void;
  /** Callback quando o usuário clica em "Ver detalhes" de um evento. */
  onViewDetail?: (event: EventItem) => void;
}

export function EventsScreen({ role, sidebarOffset = 0, onNavChange, onViewDetail }: EventsScreenProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav,   setActiveNav]   = useState('eventos');
  // Estado dos modais de QR — no header, oposto ao título
  const [qrModal,     setQrModal]     = useState<QRType | null>(null);

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

          {/* Header: título à esquerda · QR Codes à direita */}
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Eventos</h1>
            <div className={styles.headerActions}>
              <button className={styles.qrBtn} onClick={() => setQrModal('inscricao')}>
                <QrCode size={14} />
                QR Inscrição
              </button>
              <button className={styles.qrBtn} onClick={() => setQrModal('encaixe')}>
                <QrCode size={14} />
                QR Encaixe
              </button>
            </div>
          </div>

          <EventsTable role={role} onViewDetail={onViewDetail} />

        </div>
      </div>

      {/* QR Modal — renderizado no nível da tela, não dentro da tabela */}
      {qrModal && <QRCodeModal type={qrModal} onClose={() => setQrModal(null)} />}
    </div>
  );
}
