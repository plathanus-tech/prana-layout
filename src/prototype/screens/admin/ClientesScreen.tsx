// TELA: Gerenciamento de Clientes (Admin only)
// ROLES COM ACESSO: admin
// PERMISSÕES:
//   admin → visualizar, buscar clientes e acessar detalhe

import { useState } from 'react';
import { Search, Eye } from 'lucide-react';
import { Sidebar } from '../../../components/Sidebar/Sidebar';
import type { UserRole } from './UsersScreen';
import styles from './ClientesScreen.module.css';

// ─── Types e Interfaces ───────────────────────────────────────────────────────
export interface Cliente {
  id:          string;
  name:        string;
  cnpj:        string;
  localizacao: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_CLIENTES: Cliente[] = [
  { id: 'CLI-001', name: 'Itaú Unibanco',   cnpj: '60.872.504/0001-23', localizacao: 'São Paulo, SP'     },
  { id: 'CLI-002', name: 'Ambev',            cnpj: '07.526.557/0001-00', localizacao: 'São Paulo, SP'     },
  { id: 'CLI-003', name: 'Bradesco',          cnpj: '60.746.948/0001-12', localizacao: 'Osasco, SP'        },
  { id: 'CLI-004', name: 'Natura',            cnpj: '71.673.990/0001-77', localizacao: 'São Paulo, SP'     },
  { id: 'CLI-005', name: 'Vale',              cnpj: '33.592.510/0001-54', localizacao: 'Rio de Janeiro, RJ'},
  { id: 'CLI-006', name: 'Magazine Luiza',    cnpj: '47.960.950/0001-21', localizacao: 'Franca, SP'        },
  { id: 'CLI-007', name: 'iFood',             cnpj: '14.380.200/0001-21', localizacao: 'Osasco, SP'        },
  { id: 'CLI-008', name: 'Renner',            cnpj: '92.754.738/0001-62', localizacao: 'Porto Alegre, RS'  },
  { id: 'CLI-009', name: 'Petrobras',         cnpj: '33.000.167/0001-01', localizacao: 'Rio de Janeiro, RJ'},
  { id: 'CLI-010', name: 'Vivo',              cnpj: '02.558.157/0001-62', localizacao: 'São Paulo, SP'     },
];

// ─── Paginação ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 8;

// ─── Props ────────────────────────────────────────────────────────────────────
interface ClientesScreenProps {
  role:           UserRole;
  sidebarOffset?: number;
  onNavChange?:   (item: string) => void;
  onViewDetail?:  (cliente: Cliente) => void;
}

// ─── ClientesScreen ───────────────────────────────────────────────────────────
export function ClientesScreen({ role, sidebarOffset = 0, onNavChange, onViewDetail }: ClientesScreenProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav,   setActiveNav]   = useState('clientes');
  const [search,      setSearch]      = useState('');
  const [page,        setPage]        = useState(1);

  // ─── Filtragem ────────────────────────────────────────────────────────────
  const filtered = MOCK_CLIENTES.filter(c => {
    if (search.trim()) {
      const s = search.toLowerCase();
      if (!c.name.toLowerCase().includes(s) && !c.cnpj.includes(s)) return false;
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
          onNavClick={item => { setActiveNav(item); onNavChange?.(item); }}
          user={{ name: 'Admin Prana', email: 'admin@prana.com', initials: 'AP' }}
          role={role}
        />
      </div>

      <div className={[styles.contentWrap, !sidebarOpen ? styles.contentWrapClosed : ''].filter(Boolean).join(' ')}>
        <div className={styles.contentCard}>

          {/* ── Page Header ──────────────────────────────────────────────────── */}
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Clientes</h1>
          </div>

          {/* ── Table Section ─────────────────────────────────────────────────── */}
          <div className={styles.tableSection}>

            {/* Toolbar */}
            <div className={styles.toolbar}>
              <div className={styles.toolbarLeft}>
                <div className={styles.searchWrap}>
                  <Search size={14} className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Buscar por nome ou CNPJ…"
                    className={styles.searchInput}
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                  />
                </div>
              </div>
            </div>

            {/* Tabela */}
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr className={styles.headerRow}>
                    <th className={styles.th}>Nome</th>
                    <th className={styles.th}>CNPJ</th>
                    <th className={styles.th}>Localização</th>
                    <th className={styles.th}>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.length === 0 ? (
                    <tr>
                      <td colSpan={4} className={styles.emptyCell}>
                        Nenhum cliente encontrado para os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    pageItems.map(c => (
                      <tr key={c.id} className={styles.tr}>

                        {/* Nome */}
                        <td className={styles.td}>
                          <div className={styles.userInfo}>
                            <span className={styles.userName}>{c.name}</span>
                            <span className={styles.userId}>{c.id}</span>
                          </div>
                        </td>

                        {/* CNPJ */}
                        <td className={styles.td}>
                          <span className={styles.cellText}>{c.cnpj}</span>
                        </td>

                        {/* Localização */}
                        <td className={styles.td}>
                          <span className={styles.cellText}>{c.localizacao}</span>
                        </td>

                        {/* Ação */}
                        <td className={styles.td}>
                          <button
                            className={styles.actionBtn}
                            title="Ver detalhe da empresa"
                            onClick={() => onViewDetail?.(c)}
                          >
                            <Eye size={14} />
                            Ver detalhe
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
                {filtered.length === 0
                  ? 'Nenhum resultado'
                  : `Mostrando ${from}–${to} de ${filtered.length} clientes`}
              </span>
              <div className={styles.paginationControls}>
                <button className={styles.pageBtn} onClick={() => go(page - 1)} disabled={page === 1}>←</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    className={[styles.pageBtn, page === p ? styles.pageBtnActive : ''].filter(Boolean).join(' ')}
                    onClick={() => go(p)}
                  >
                    {p}
                  </button>
                ))}
                <button className={styles.pageBtn} onClick={() => go(page + 1)} disabled={page === totalPages}>→</button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
