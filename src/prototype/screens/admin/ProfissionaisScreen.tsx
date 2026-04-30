// TELA: Gerenciamento de Profissionais (Admin only)
// ROLES COM ACESSO: admin
// PERMISSÕES:
//   admin → visualizar, buscar, filtrar, sincronizar profissionais

import { useState } from 'react';
import { Search, ChevronDown, RefreshCw, Eye, Star } from 'lucide-react';
import { Sidebar } from '../../../components/Sidebar/Sidebar';
import { Feedback } from '../../../components/Feedback/Feedback';
import type { UserRole } from './UsersScreen';
import styles from './ProfissionaisScreen.module.css';

// ─── Types e Interfaces ───────────────────────────────────────────────────────
export type Funcao = 'massoterapeuta' | 'acupunturista' | 'podólogo' | 'fisioterapeuta' | 'terapeuta' | 'quiropraxista';

export interface Profissional {
  id: string;
  name: string;
  funcao: Funcao;
  localizacao: string;
  eventosRealizados: number;
  nota: number; // 1–5
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const MOCK_PROFISSIONAIS: Profissional[] = [
  { id: 'PRO-001', name: 'Ana Carolina Lima',   funcao: 'massoterapeuta', localizacao: 'São Paulo, SP',      eventosRealizados: 42, nota: 4.9 },
  { id: 'PRO-002', name: 'Ricardo Mendes',       funcao: 'acupunturista',  localizacao: 'Rio de Janeiro, RJ', eventosRealizados: 28, nota: 4.6 },
  { id: 'PRO-003', name: 'Fernanda Costa',       funcao: 'podólogo',       localizacao: 'São Paulo, SP',      eventosRealizados: 35, nota: 4.4 },
  { id: 'PRO-004', name: 'Lucas Oliveira',       funcao: 'fisioterapeuta', localizacao: 'Curitiba, PR',       eventosRealizados: 19, nota: 4.7 },
  { id: 'PRO-005', name: 'Mariana Santos',       funcao: 'massoterapeuta', localizacao: 'Belo Horizonte, MG', eventosRealizados: 31, nota: 4.3 },
  { id: 'PRO-006', name: 'Thiago Rodrigues',     funcao: 'terapeuta',      localizacao: 'São Paulo, SP',      eventosRealizados: 14, nota: 4.1 },
  { id: 'PRO-007', name: 'Camila Ferreira',      funcao: 'acupunturista',  localizacao: 'Florianópolis, SC',  eventosRealizados: 22, nota: 4.8 },
  { id: 'PRO-008', name: 'Eduardo Alves',        funcao: 'quiropraxista',  localizacao: 'Campinas, SP',       eventosRealizados: 9,  nota: 4.0 },
  { id: 'PRO-009', name: 'Priscila Nunes',       funcao: 'fisioterapeuta', localizacao: 'Salvador, BA',       eventosRealizados: 17, nota: 4.5 },
  { id: 'PRO-010', name: 'Gustavo Teixeira',     funcao: 'massoterapeuta', localizacao: 'Porto Alegre, RS',   eventosRealizados: 38, nota: 4.6 },
  { id: 'PRO-011', name: 'Isabela Souza',        funcao: 'podólogo',       localizacao: 'São Paulo, SP',      eventosRealizados: 26, nota: 4.2 },
  { id: 'PRO-012', name: 'Felipe Cardoso',       funcao: 'terapeuta',      localizacao: 'Recife, PE',         eventosRealizados: 11, nota: 3.9 },
];

// ─── Label de função (texto puro) ─────────────────────────────────────────────
const FUNCAO_LABEL: Record<Funcao, string> = {
  massoterapeuta: 'Massoterapeuta',
  acupunturista:  'Acupunturista',
  'podólogo':     'Podólogo',
  fisioterapeuta: 'Fisioterapeuta',
  terapeuta:      'Terapeuta',
  quiropraxista:  'Quiropraxista',
};

// ─── Paginação ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 8;

// ─── ProfissionaisScreen Component ───────────────────────────────────────────
interface ProfissionaisScreenProps {
  role: UserRole;
  sidebarOffset?: number;
  onNavChange?: (item: string) => void;
  onViewDetail?: (prof: Profissional) => void;
}

export function ProfissionaisScreen({ role, sidebarOffset = 0, onNavChange, onViewDetail }: ProfissionaisScreenProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav,   setActiveNav]   = useState('profissionais');
  const [search,      setSearch]      = useState('');
  const [filterFuncao, setFilterFuncao] = useState<Funcao | ''>('');
  const [page,        setPage]        = useState(1);
  const [syncing,     setSyncing]     = useState(false);
  const [feedback,    setFeedback]    = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // ─── Sincronizar com CRM ──────────────────────────────────────────────────
  function handleSync() {
    if (syncing) return;
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setFeedback({ type: 'success', message: 'Profissionais sincronizados com sucesso' });
      setTimeout(() => setFeedback(null), 3000);
    }, 1200);
  }

  // ─── Filtragem ────────────────────────────────────────────────────────────
  const filtered = MOCK_PROFISSIONAIS.filter(prof => {
    if (filterFuncao && prof.funcao !== filterFuncao) return false;
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      if (!prof.name.toLowerCase().includes(searchLower)) return false;
    }
    return true;
  });

  filtered.sort((a, b) => a.name.localeCompare(b.name));

  // ─── Paginação ────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const from       = filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to         = Math.min(page * PAGE_SIZE, filtered.length);

  function go(p: number) {
    if (p >= 1 && p <= totalPages) setPage(p);
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
          onNavClick={(item) => {
            setActiveNav(item);
            onNavChange?.(item);
          }}
          user={{ name: 'Admin Prana', email: 'admin@prana.com', initials: 'AP' }}
          role={role}
        />
      </div>

      <div className={[styles.contentWrap, !sidebarOpen ? styles.contentWrapClosed : ''].filter(Boolean).join(' ')}>
        <div className={styles.contentCard}>

          {/* ── Page Header ──────────────────────────────────────────────────── */}
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Profissionais</h1>
            <div className={styles.headerActions}>
              <button
                className={styles.syncBtn}
                onClick={handleSync}
                disabled={syncing}
              >
                <RefreshCw size={14} className={syncing ? styles.spinning : undefined} />
                {syncing ? 'Sincronizando…' : 'Sincronizar com CRM'}
              </button>
            </div>
          </div>

          {/* ── Feedback ─────────────────────────────────────────────────────── */}
          {feedback && (
            <Feedback
              type={feedback.type}
              message={feedback.message}
              dismissible
              onDismiss={() => setFeedback(null)}
            />
          )}

          {/* ── Table Section ─────────────────────────────────────────────────── */}
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
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                  />
                </div>

                {/* Filtro de função */}
                <div className={styles.filterBtnWrap}>
                  <div className={styles.filterWrap}>
                    <select
                      className={styles.filterSelect}
                      value={filterFuncao}
                      onChange={e => { setFilterFuncao(e.target.value as Funcao | ''); setPage(1); }}
                    >
                      <option value="">Todas as funções</option>
                      <option value="massoterapeuta">Massoterapeuta</option>
                      <option value="acupunturista">Acupunturista</option>
                      <option value="podólogo">Podólogo</option>
                      <option value="fisioterapeuta">Fisioterapeuta</option>
                      <option value="terapeuta">Terapeuta</option>
                      <option value="quiropraxista">Quiropraxista</option>
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
                    <th className={styles.th}>Nome</th>
                    <th className={styles.th}>Função</th>
                    <th className={styles.th}>Localização</th>
                    <th className={styles.th}>Eventos realizados</th>
                    <th className={styles.th}>Nota</th>
                    <th className={styles.th}>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className={styles.emptyCell}>
                        Nenhum profissional encontrado para os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    pageItems.map(prof => (
                      <tr key={prof.id} className={styles.tr}>

                        {/* Nome */}
                        <td className={styles.td}>
                          <div className={styles.userInfo}>
                            <span className={styles.userName}>{prof.name}</span>
                          </div>
                        </td>

                        {/* Função */}
                        <td className={styles.td}>
                          <span className={styles.cellText}>{FUNCAO_LABEL[prof.funcao]}</span>
                        </td>

                        {/* Localização */}
                        <td className={styles.td}>
                          <span className={styles.cellText}>{prof.localizacao}</span>
                        </td>

                        {/* Eventos realizados */}
                        <td className={styles.td}>
                          <span className={styles.userName}>{prof.eventosRealizados}</span>
                        </td>

                        {/* Nota */}
                        <td className={styles.td}>
                          <div className={styles.notaCell}>
                            <Star size={12} fill="#F59E0B" color="#F59E0B" />
                            <span className={styles.notaValue}>{prof.nota.toFixed(1)}</span>
                          </div>
                        </td>

                        {/* Ação */}
                        <td className={styles.td}>
                          <button
                            className={styles.actionBtn}
                            title="Ver perfil"
                            onClick={() => onViewDetail?.(prof)}
                          >
                            <Eye size={14} />
                            Ver perfil
                          </button>
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
                {filtered.length === 0 ? 'Nenhum resultado' : `Mostrando ${from}–${to} de ${filtered.length} profissionais`}
              </span>
              <div className={styles.paginationControls}>
                <button className={styles.pageBtn} onClick={() => go(page - 1)} disabled={page === 1}>
                  ←
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    className={[styles.pageBtn, page === p ? styles.pageBtnActive : ''].filter(Boolean).join(' ')}
                    onClick={() => go(p)}
                  >
                    {p}
                  </button>
                ))}
                <button className={styles.pageBtn} onClick={() => go(page + 1)} disabled={page === totalPages}>
                  →
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
