// TELA: Gerenciamento de Usuários (Admin only)
// ROLES COM ACESSO: admin
// PERMISSÕES:
//   admin → visualizar, buscar, filtrar, adicionar, ativar/desativar usuários

import { useState, useImperativeHandle, forwardRef, useRef } from 'react';
import { Search, ChevronDown, Plus, Ban, RotateCcw } from 'lucide-react';
import { Sidebar } from '../../../components/Sidebar/Sidebar';
import { Dialog } from '../../../components/Dialog/Dialog';
import { Input } from '../../../components/Input/Input';
import { Dropdown } from '../../../components/Dropdown/Dropdown';
import { Button } from '../../../components/Button/Button';
import { Feedback } from '../../../components/Feedback/Feedback';
import styles from './UsersScreen.module.css';

export type UserRole = 'adm' | 'empresa';

// ─── Types e Interfaces ───────────────────────────────────────────────────────
type UserProfile = 'administrador' | 'empresa';
type UserStatus = 'ativo' | 'inativo';

export interface User {
  id: string;
  name: string;
  email: string;
  profile: UserProfile;
  status: UserStatus;
  company?: string;
  createdAt?: string;
}

interface AddUserData {
  name: string;
  email: string;
  profile: UserProfile | '';
  company: string | '';
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const MOCK_USERS: User[] = [
  {
    id: 'USR-001',
    name: 'Ana Silva',
    email: 'ana.silva@itau.com.br',
    profile: 'empresa',
    status: 'ativo',
    company: 'Itaú Unibanco',
    createdAt: '2026-01-15',
  },
  {
    id: 'USR-002',
    name: 'Carlos Admin',
    email: 'carlos@prana.com.br',
    profile: 'administrador',
    status: 'ativo',
    createdAt: '2025-12-01',
  },
  {
    id: 'USR-003',
    name: 'Marina Natura',
    email: 'marina@natura.com.br',
    profile: 'empresa',
    status: 'inativo',
    company: 'Natura',
    createdAt: '2026-02-20',
  },
  {
    id: 'USR-004',
    name: 'Roberto Ambev',
    email: 'roberto.santos@ambev.com.br',
    profile: 'empresa',
    status: 'ativo',
    company: 'Ambev',
    createdAt: '2026-01-10',
  },
  {
    id: 'USR-005',
    name: 'Patricia Vale',
    email: 'patricia@vale.com.br',
    profile: 'empresa',
    status: 'ativo',
    company: 'Vale',
    createdAt: '2026-03-05',
  },
  {
    id: 'USR-006',
    name: 'Fernando Admin 2',
    email: 'fernando.admin@prana.com.br',
    profile: 'administrador',
    status: 'ativo',
    createdAt: '2025-11-12',
  },
  {
    id: 'USR-007',
    name: 'Beatriz Bradesco',
    email: 'beatriz@bradesco.com.br',
    profile: 'empresa',
    status: 'inativo',
    company: 'Bradesco',
    createdAt: '2026-02-14',
  },
  {
    id: 'USR-008',
    name: 'Lucas Magalu',
    email: 'lucas.costa@magazineluiza.com.br',
    profile: 'empresa',
    status: 'ativo',
    company: 'Magazine Luiza',
    createdAt: '2026-03-18',
  },
  {
    id: 'USR-009',
    name: 'Sophia iFood',
    email: 'sophia.oliveira@ifood.com.br',
    profile: 'empresa',
    status: 'ativo',
    company: 'iFood',
    createdAt: '2026-01-25',
  },
  {
    id: 'USR-010',
    name: 'Gabriel Renner',
    email: 'gabriel.silva@renner.com.br',
    profile: 'empresa',
    status: 'inativo',
    company: 'Renner',
    createdAt: '2026-02-08',
  },
];

const COMPANIES = [
  { label: 'Itaú Unibanco', value: 'itau' },
  { label: 'Natura', value: 'natura' },
  { label: 'Ambev', value: 'ambev' },
  { label: 'Vale', value: 'vale' },
  { label: 'Bradesco', value: 'bradesco' },
  { label: 'Magazine Luiza', value: 'magalu' },
  { label: 'iFood', value: 'ifood' },
  { label: 'Renner', value: 'renner' },
];

const PROFILE_OPTIONS = [
  { label: 'Administrador', value: 'administrador' },
  { label: 'Empresa', value: 'empresa' },
];

// ─── Profile Badge Colors ─────────────────────────────────────────────────────
interface ProfileCfg { label: string; bg: string; border: string; color: string; }
const PROFILE_CONFIG: Record<UserProfile, ProfileCfg> = {
  administrador: {
    label: 'Administrador',
    bg: 'var(--color-brand-50)',
    border: 'var(--color-brand-300)',
    color: 'var(--color-brand-600)',
  },
  empresa: {
    label: 'Empresa',
    bg: 'var(--color-gray-100)',
    border: 'var(--color-gray-300)',
    color: 'var(--color-text-secondary)',
  },
};

// ─── Status Badge Colors ───────────────────────────────────────────────────────
interface StatusCfg { label: string; bg: string; border: string; color: string; }
const STATUS_CONFIG: Record<UserStatus, StatusCfg> = {
  ativo: {
    label: 'Ativo',
    bg: 'var(--color-status-success-bg)',
    border: 'var(--color-green-300)',
    color: 'var(--color-status-success-fg)',
  },
  inativo: {
    label: 'Inativo',
    bg: 'var(--color-gray-100)',
    border: 'var(--color-gray-300)',
    color: 'var(--color-text-secondary)',
  },
};

// ─── Validação ────────────────────────────────────────────────────────────────
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateAddUser(data: AddUserData, existingUsers: User[]): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!data.name.trim()) {
    errors.name = 'Nome é obrigatório';
  } else if (data.name.trim().length < 3) {
    errors.name = 'Nome deve ter pelo menos 3 caracteres';
  }

  if (!data.email.trim()) {
    errors.email = 'E-mail é obrigatório';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'E-mail inválido';
  } else if (existingUsers.some(u => u.email === data.email)) {
    errors.email = 'Este e-mail já está cadastrado';
  }

  if (!data.profile) {
    errors.profile = 'Perfil é obrigatório';
  }

  if (data.profile === 'empresa' && !data.company) {
    errors.company = 'Cliente é obrigatório para perfil Empresa';
  }

  return errors;
}

// ─── UsersTable Component ─────────────────────────────────────────────────────
const PAGE_SIZE = 8;

interface UsersTableProps {
  role: UserRole;
}

const UsersTable = forwardRef<{ openAddModal: () => void }, UsersTableProps>(function UsersTable({ role }, ref) {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [search, setSearch] = useState('');
  const [filterProfile, setFilterProfile] = useState<UserProfile | ''>('');
  const [page, setPage] = useState(1);

  // Modal: Adicionar usuário
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [addUserData, setAddUserData] = useState<AddUserData>({
    name: '',
    email: '',
    profile: '',
    company: '',
  });
  const [addUserErrors, setAddUserErrors] = useState<Record<string, string>>({});

  // Modal: Confirmação de desativar/reativar
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    user: User | null;
    action: 'desativar' | 'reativar' | null;
  }>({
    isOpen: false,
    user: null,
    action: null,
  });

  // Feedback
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // ─── Filtragem ─────────────────────────────────────────────────────────────
  const filtered = users.filter(user => {
    if (filterProfile && user.profile !== filterProfile) return false;
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      const matchesName = user.name.toLowerCase().includes(searchLower);
      const matchesEmail = user.email.toLowerCase().includes(searchLower);
      if (!matchesName && !matchesEmail) return false;
    }
    return true;
  });

  filtered.sort((a, b) => a.name.localeCompare(b.name));

  // ─── Paginação ────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const from = filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, filtered.length);

  function go(p: number) {
    if (p >= 1 && p <= totalPages) setPage(p);
  }

  function onSearch(v: string) {
    setSearch(v);
    setPage(1);
  }

  function handleOpenAddUserModal() {
    setShowAddUserModal(true);
    setAddUserData({ name: '', email: '', profile: '', company: '' });
    setAddUserErrors({});
  }

  function handleCloseAddUserModal() {
    setShowAddUserModal(false);
    setAddUserData({ name: '', email: '', profile: '', company: '' });
    setAddUserErrors({});
  }

  // Expor método para abrir o modal via ref
  useImperativeHandle(ref, () => ({
    openAddModal: handleOpenAddUserModal,
  }));

  function handleAddUserDataChange(field: keyof AddUserData, value: string) {
    setAddUserData(prev => ({ ...prev, [field]: value }));
    if (addUserErrors[field]) {
      setAddUserErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function handleAddUserProfileChange(value: string | number) {
    const profile = (value as string) === '' ? '' : (value as UserProfile);
    setAddUserData(prev => ({
      ...prev,
      profile,
      company: profile === 'empresa' ? prev.company : '',
    }));
    if (addUserErrors.profile) {
      setAddUserErrors(prev => {
        const next = { ...prev };
        delete next.profile;
        return next;
      });
    }
  }

  function handleAddUserCompanyChange(value: string | number) {
    setAddUserData(prev => ({ ...prev, company: value as string }));
    if (addUserErrors.company) {
      setAddUserErrors(prev => {
        const next = { ...prev };
        delete next.company;
        return next;
      });
    }
  }

  function handleAddUserSubmit() {
    const errors = validateAddUser(addUserData, users);
    if (Object.keys(errors).length > 0) {
      setAddUserErrors(errors);
      return;
    }

    const newUser: User = {
      id: `USR-${users.length + 1}`,
      name: addUserData.name.trim(),
      email: addUserData.email.trim(),
      profile: addUserData.profile as UserProfile,
      status: 'ativo',
      company: addUserData.profile === 'empresa' ? addUserData.company : undefined,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setUsers(prev => [...prev, newUser]);
    setFeedback({
      type: 'success',
      message: 'Novo usuário adicionado com sucesso',
    });

    setTimeout(() => {
      handleCloseAddUserModal();
      setPage(1);
      setSearch('');
      setFilterProfile('');
    }, 1500);
  }

  function handleToggleStatus(user: User) {
    const action = user.status === 'ativo' ? 'desativar' : 'reativar';
    setConfirmationModal({
      isOpen: true,
      user,
      action: action as 'desativar' | 'reativar',
    });
  }

  function handleConfirmToggleStatus() {
    if (!confirmationModal.user) return;

    const user = confirmationModal.user;
    setUsers(prev =>
      prev.map(u =>
        u.id === user.id
          ? { ...u, status: u.status === 'ativo' ? 'inativo' : 'ativo' }
          : u
      )
    );

    setFeedback({
      type: 'success',
      message: `Usuário ${user.status === 'ativo' ? 'desativado' : 'reativado'} com sucesso`,
    });

    setConfirmationModal({
      isOpen: false,
      user: null,
      action: null,
    });
  }

  function handleCancelToggleStatus() {
    setConfirmationModal({
      isOpen: false,
      user: null,
      action: null,
    });
  }

  return (
    <>
      {/* Feedback */}
      {feedback && (
        <Feedback
          type={feedback.type}
          message={feedback.message}
          dismissible
          onDismiss={() => setFeedback(null)}
        />
      )}

      <div className={styles.tableSection}>
        {/* ── Toolbar: busca + filtro ─────────────────────────────────────── */}
        <div className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            {/* Busca */}
            <div className={styles.searchWrap}>
              <Search size={14} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Buscar por nome ou e-mail…"
                className={styles.searchInput}
                value={search}
                onChange={e => onSearch(e.target.value)}
              />
            </div>

            {/* Filtro de perfil */}
            <div className={styles.filterBtnWrap}>
              <div className={styles.filterWrap}>
                <select
                  className={styles.filterSelect}
                  value={filterProfile}
                  onChange={e => {
                    setFilterProfile((e.target.value as string) === '' ? '' : (e.target.value as UserProfile));
                    setPage(1);
                  }}
                >
                  <option value="">Todos os perfis</option>
                  <option value="administrador">Administrador</option>
                  <option value="empresa">Empresa</option>
                </select>
                <ChevronDown size={13} className={styles.filterChevron} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabela ────────────────────────────────────────────────────────── */}
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.headerRow}>
                <th className={styles.th}>Nome</th>
                <th className={styles.th}>E-mail</th>
                <th className={styles.th}>Perfil</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className={styles.emptyCell}>
                    Nenhum usuário encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                pageItems.map(user => (
                  <tr key={user.id} className={styles.tr}>
                    {/* Nome */}
                    <td className={styles.td}>
                      <div className={styles.userInfo}>
                        <span className={styles.userName}>{user.name}</span>
                        <span className={styles.userId}>{user.id}</span>
                      </div>
                    </td>

                    {/* E-mail */}
                    <td className={styles.td}>
                      <span className={styles.cellText}>{user.email}</span>
                    </td>

                    {/* Perfil */}
                    <td className={styles.td}>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '6px 12px',
                          backgroundColor: PROFILE_CONFIG[user.profile].bg,
                          border: `1px solid ${PROFILE_CONFIG[user.profile].border}`,
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 500,
                          color: PROFILE_CONFIG[user.profile].color,
                        }}
                      >
                        {PROFILE_CONFIG[user.profile].label}
                      </div>
                    </td>

                    {/* Status */}
                    <td className={styles.td}>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '6px 12px',
                          backgroundColor: STATUS_CONFIG[user.status].bg,
                          border: `1px solid ${STATUS_CONFIG[user.status].border}`,
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 500,
                          color: STATUS_CONFIG[user.status].color,
                        }}
                      >
                        {STATUS_CONFIG[user.status].label}
                      </div>
                    </td>

                    {/* Ações */}
                    <td className={styles.td}>
                      <div className={styles.actionsCell}>
                        {user.status === 'ativo' ? (
                          <button
                            className={[styles.actionBtn, styles.actionBtnDeactivate].join(' ')}
                            onClick={() => handleToggleStatus(user)}
                          >
                            <Ban size={13} />
                            Desativar
                          </button>
                        ) : (
                          <button
                            className={[styles.actionBtn, styles.actionBtnReactivate].join(' ')}
                            onClick={() => handleToggleStatus(user)}
                          >
                            <RotateCcw size={13} />
                            Reativar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Paginação ──────────────────────────────────────────────────────── */}
        <div className={styles.pagination}>
          <span className={styles.paginationInfo}>
            {filtered.length === 0 ? 'Nenhum resultado' : `Mostrando ${from}–${to} de ${filtered.length} usuários`}
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

      {/* Modal: Adicionar usuário */}
      {showAddUserModal && (
        <Dialog
          open={showAddUserModal}
          title="Adicionar usuário"
          onClose={handleCloseAddUserModal}
          actions={
            <>
              <Button variant="secondary" size="sm" onClick={handleCloseAddUserModal}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleAddUserSubmit}
                disabled={!!(Object.keys(addUserErrors).length > 0 && (addUserData.name || addUserData.email || addUserData.profile))}
              >
                Cadastrar
              </Button>
            </>
          }
        >
          <div className={styles.modalForm}>
            <Input
              label="Nome"
              placeholder="Ex: João Silva"
              type="text"
              value={addUserData.name}
              onChange={e => handleAddUserDataChange('name', e.target.value)}
              error={addUserErrors.name}
            />

            <Input
              label="E-mail"
              placeholder="seu@email.com"
              type="email"
              value={addUserData.email}
              onChange={e => handleAddUserDataChange('email', e.target.value)}
              error={addUserErrors.email}
            />

            <Dropdown
              label="Perfil"
              options={PROFILE_OPTIONS}
              value={addUserData.profile}
              onChange={handleAddUserProfileChange}
              placeholder="Selecione um perfil"
              error={addUserErrors.profile}
            />

            {addUserData.profile === 'empresa' && (
              <Dropdown
                label="Cliente"
                options={COMPANIES}
                value={addUserData.company}
                onChange={handleAddUserCompanyChange}
                placeholder="Selecione uma empresa"
                error={addUserErrors.company}
              />
            )}
          </div>
        </Dialog>
      )}

      {/* Modal: Confirmação de desativar/reativar */}
      {confirmationModal.isOpen && confirmationModal.user && (
        <Dialog
          open={confirmationModal.isOpen}
          title={confirmationModal.action === 'desativar' ? 'Desativar usuário?' : 'Reativar usuário?'}
          onClose={handleCancelToggleStatus}
          actions={
            <>
              <Button variant="secondary" size="sm" onClick={handleCancelToggleStatus}>
                Cancelar
              </Button>
              <Button variant="primary" size="sm" onClick={handleConfirmToggleStatus}>
                {confirmationModal.action === 'desativar' ? 'Desativar' : 'Reativar'}
              </Button>
            </>
          }
        >
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
            {confirmationModal.action === 'desativar'
              ? 'Esse usuário perderá acesso ao sistema. Deseja continuar?'
              : 'O acesso ao sistema será restaurado para este usuário. Deseja continuar?'}
          </p>
        </Dialog>
      )}
    </>
  );
});

// ─── UsersScreen Component ─────────────────────────────────────────────────────
interface UsersScreenProps {
  role: UserRole;
  sidebarOffset?: number;
  onNavChange?: (item: string) => void;
}

export function UsersScreen({ role, sidebarOffset = 0, onNavChange }: UsersScreenProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav, setActiveNav] = useState('usuarios');
  const usersTableRef = useRef<{ openAddModal: () => void }>(null);

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
          {/* Header: título à esquerda · botão à direita */}
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Usuários</h1>
            <div className={styles.headerActions}>
              <Button
                variant="primary"
                size="md"
                iconLeft={<Plus size={14} />}
                onClick={() => usersTableRef.current?.openAddModal()}
              >
                Adicionar usuário
              </Button>
            </div>
          </div>

          <UsersTable ref={usersTableRef} role={role} />
        </div>
      </div>
    </div>
  );
}
