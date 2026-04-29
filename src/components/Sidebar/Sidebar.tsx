import { ReactNode } from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  User,
  ContactRound,
  Building2,
  FileText,
  Briefcase,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import styles from './Sidebar.module.css';

/* ── Types ─────────────────────────────────────────────────────────────── */

export type NavItemDef = {
  id: string;
  label: string;
  icon: ReactNode;
  /** Mostra ponto de notificação (círculo brand) */
  dot?: boolean;
  /** Mostra chevron de sub-menu */
  hasDropdown?: boolean;
};

export type SidebarUser = {
  name: string;
  email: string;
  /** Iniciais exibidas no avatar (máx 2 chars) */
  initials: string;
};

export type SidebarProps = {
  open?: boolean;
  onToggle?: () => void;
  activeItem?: string;
  onNavClick?: (id: string) => void;
  user?: SidebarUser;
  onLogout?: () => void;
  /** Filtra itens exclusivos do adm quando 'empresa' */
  role?: 'adm' | 'empresa';
};

/** Itens visíveis apenas para administradores */
const ADM_ONLY_IDS = new Set(['usuarios', 'profissionais', 'clientes', 'servicos', 'pesquisa']);

/* ── Default nav items — mapeados do Figma ──────────────────────────────── */

export const defaultNavItems: NavItemDef[] = [
  { id: 'dashboard',     label: 'Dashboard',     icon: <LayoutDashboard size={20} /> },
  { id: 'eventos',       label: 'Eventos',        icon: <CalendarCheck   size={20} />, dot: true },
  { id: 'usuarios',      label: 'Usuários',       icon: <User            size={20} /> },
  { id: 'profissionais', label: 'Profissionais',  icon: <ContactRound    size={20} /> },
  { id: 'servicos',      label: 'Serviços',        icon: <Briefcase       size={20} /> },
  { id: 'clientes',      label: 'Empresas',       icon: <Building2       size={20} /> },
  { id: 'pesquisa',      label: 'Pesquisa',       icon: <FileText        size={20} /> },
];

const defaultUser: SidebarUser = {
  name: 'Admin Prana',
  email: 'admin@prana.com',
  initials: 'AP',
};

/* ── Logos via arquivo SVG ───────────────────────────────────────────────── */
function PranaLogoFull() {
  return (
    <img
      src="/logos/PRANA_ENXOVAL__LOGO_Eventos_2_Magenta.svg"
      alt="Prana"
      style={{ height: 46, width: 'auto', display: 'block' }}
    />
  );
}

function PranaLogoIcon() {
  return (
    <img
      src="/logos/PRANA_ENXOVAL__LOGO_Icone_Magenta.svg"
      alt="Prana"
      style={{ height: 40, width: 40, display: 'block', objectFit: 'contain' }}
    />
  );
}

/* ── Sidebar ────────────────────────────────────────────────────────────── */

export function Sidebar({
  open = true,
  onToggle,
  activeItem = 'dashboard',
  onNavClick,
  user = defaultUser,
  onLogout,
  role = 'adm',
}: SidebarProps) {
  const navItems = role === 'empresa'
    ? defaultNavItems.filter(item => !ADM_ONLY_IDS.has(item.id))
    : defaultNavItems;

  return (
    <aside className={[styles.sidebar, open ? styles.open : styles.closed].join(' ')}>

      {/* ── Logo + Toggle (alinhados na mesma altura) ────────────────── */}
      <div className={styles.logoRow}>
        <div className={styles.logoWrap}>
          {open ? <PranaLogoFull /> : <PranaLogoIcon />}
        </div>
        <button
          className={styles.toggleBtn}
          onClick={onToggle}
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          type="button"
        >
          {open ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>

      {/* ── Nav + bottom (gap 404 em Figma = flex:1 spacer) ──────────── */}
      <div className={styles.body}>

        {/* Nav List principal */}
        <nav className={styles.navList}>
          {navItems.map(item => {
            const isActive = item.id === activeItem;
            return (
              <button
                key={item.id}
                className={[styles.navItem, isActive ? styles.navItemActive : ''].join(' ')}
                onClick={() => onNavClick?.(item.id)}
                title={!open ? item.label : undefined}
                aria-current={isActive ? 'page' : undefined}
                type="button"
              >
                <span className={styles.navIcon}>{item.icon}</span>
                {open && (
                  <>
                    <span className={styles.navLabel}>{item.label}</span>
                    {item.dot && (
                      <span className={styles.navTrail}>
                        <span className={styles.dot} />
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* Spacer — empurra a seção de baixo para o fundo */}
        <div className={styles.spacer} />

        {/* Bottom — separador + usuário + sair */}
        <div className={styles.bottomList}>
          <div className={styles.separator} />

          {/* Avatar + nome/email */}
          <div className={styles.userRow}>
            <div className={styles.avatar}>
              <span className={styles.avatarInitials}>{user.initials}</span>
            </div>
            {open && (
              <div className={styles.userInfo}>
                <span className={styles.userName}>{user.name}</span>
                <span className={styles.userEmail}>{user.email}</span>
              </div>
            )}
          </div>

          {/* Sair */}
          <button
            className={styles.navItem}
            onClick={onLogout}
            title={!open ? 'Sair' : undefined}
            type="button"
          >
            <span className={styles.navIcon}><LogOut size={20} /></span>
            {open && <span className={styles.navLabelLogout}>Sair</span>}
          </button>
        </div>
      </div>


    </aside>
  );
}
