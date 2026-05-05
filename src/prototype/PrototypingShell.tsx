// Ambiente de prototipagem — wrapper de validação de UI
// Não faz parte do sistema final; serve para navegar entre telas e testar perfis.

import { useState, useRef } from 'react';
import { LayoutDashboard, TrendingUp, Layers, Eye, EyeOff, List, FileText, Users, ContactRound, Building2, LogIn, KeyRound, Tag } from 'lucide-react';
import { DashboardScreen, type UserRole, type ActiveTab } from './screens/admin/DashboardScreen';
import { EventsScreen, type EventItem } from './screens/admin/EventsScreen';
import { EventDetailScreen } from './screens/admin/EventDetailScreen';
import { UsersScreen } from './screens/admin/UsersScreen';
import { ProfissionaisScreen } from './screens/admin/ProfissionaisScreen';
import type { Profissional } from './screens/admin/ProfissionaisScreen';
import { ProfissionalDetailScreen } from './screens/admin/ProfissionalDetailScreen';
import { ClientesScreen, type Cliente } from './screens/admin/ClientesScreen';
import { ClienteDetailScreen } from './screens/admin/ClienteDetailScreen';
import { PesquisaScreen, type Pesquisa, type PesquisaTabType } from './screens/admin/PesquisaScreen';
import { PesquisaDetailScreen } from './screens/admin/PesquisaDetailScreen';
import { ProfessionalSurveyScreen, type EventSurvey } from './screens/ProfessionalSurveyScreen';
import { AdminLoginScreen, type LoginView } from './screens/admin/AdminLoginScreen';
import { ServicosScreen, type ServicosTab } from './screens/admin/ServicosScreen';
import styles from './PrototypingShell.module.css';

// ─── Tipos ────────────────────────────────────────────────────────────────────
type ActiveJourney  = 'login' | 'dashboard' | 'eventos' | 'usuarios' | 'profissionais' | 'servicos' | 'clientes' | 'pesquisa' | 'pesquisa-profissional';
type EventsView    = 'lista' | 'detalhe';
type ProfView      = 'lista' | 'detalhe';
type ClientesView  = 'lista' | 'detalhe';
type PesquisaView  = 'lista' | 'detalhe';

interface ScreenDef {
  id: string;
  journey: ActiveJourney;
  tab?: ActiveTab;           // apenas para jornada dashboard
  index: number;
  label: string;
  sub: string;
  allowedRoles: UserRole[];
  icon: React.ReactNode;
}

// ─── Telas registradas ────────────────────────────────────────────────────────
const SCREENS: ScreenDef[] = [
  // — Jornada: Login ————————————————————————————————————————————————————————
  {
    id: 'login',
    journey: 'login',
    index: 1,
    label: 'ADM-00 Login/Autenticação',
    sub: 'E-mail · Senha · Lembrar-me',
    allowedRoles: ['adm', 'empresa'],
    icon: <LogIn size={15} />,
  },
  {
    id: 'login-recuperar',
    journey: 'login',
    index: 2,
    label: 'Recuperar senha',
    sub: 'Redefinição por e-mail',
    allowedRoles: ['adm', 'empresa'],
    icon: <KeyRound size={15} />,
  },
  {
    id: 'login-nova-senha',
    journey: 'login',
    index: 3,
    label: 'Nova senha',
    sub: 'Criar e confirmar nova senha',
    allowedRoles: ['adm', 'empresa'],
    icon: <KeyRound size={15} />,
  },

  // — Jornada: Dashboard ——————————————————————————————————————————————————————
  {
    id: 'visao-geral',
    journey: 'dashboard',
    tab: 'visao-geral',
    index: 1,
    label: 'Visão Geral',
    sub: 'Métricas globais · Eventos',
    allowedRoles: ['adm'],
    icon: <LayoutDashboard size={15} />,
  },
  {
    id: 'impacto',
    journey: 'dashboard',
    tab: 'impacto',
    index: 2,
    label: 'Impacto',
    sub: 'NPS · IBE · Pesquisa',
    allowedRoles: ['adm', 'empresa'],
    icon: <TrendingUp size={15} />,
  },

  // — Jornada: Eventos ————————————————————————————————————————————————————————
  {
    id: 'eventos-lista',
    journey: 'eventos',
    index: 1,
    label: 'ADM-07 Gestão de Eventos — Listagem',
    sub: 'Tabela · Filtros · QR Codes',
    allowedRoles: ['adm', 'empresa'],
    icon: <List size={15} />,
  },
  {
    id: 'eventos-detalhe',
    journey: 'eventos',
    index: 2,
    label: 'ADM-08 Detalhe do Evento',
    sub: 'CRM · Config · Tabs',
    allowedRoles: ['adm', 'empresa'],
    icon: <FileText size={15} />,
  },
  {
    id: 'eventos-select-prof-modal',
    journey: 'eventos',
    index: 3,
    label: 'ADM-09-A Selecionar profissional',
    sub: 'Modal · Aba Profissionais',
    allowedRoles: ['adm', 'empresa'],
    icon: <FileText size={15} />,
  },
  {
    id: 'eventos-criteria-modal',
    journey: 'eventos',
    index: 4,
    label: 'ADM-09-B Convite por critérios',
    sub: 'Modal · Aba Profissionais',
    allowedRoles: ['adm', 'empresa'],
    icon: <FileText size={15} />,
  },

  // — Jornada: Usuários (Admin only) ──────────────────────────────────────────
  {
    id: 'usuarios',
    journey: 'usuarios',
    index: 1,
    label: 'ADM-02 Gestão de usuário — Listagem',
    sub: 'Tabela · Filtros · Formulário',
    allowedRoles: ['adm'],
    icon: <Users size={15} />,
  },
  {
    id: 'usuarios-add-modal',
    journey: 'usuarios',
    index: 2,
    label: 'ADM-03 Editar / Criar Usuário',
    sub: 'Modal · Formulário · Validação',
    allowedRoles: ['adm'],
    icon: <Users size={15} />,
  },

  // — Jornada: Profissionais (Admin only) ─────────────────────────────────────
  {
    id: 'profissionais',
    journey: 'profissionais',
    index: 1,
    label: 'ADM-04 Gestão de Profissionais — Listagem',
    sub: 'Tabela · Filtros · Sincronização',
    allowedRoles: ['adm'],
    icon: <ContactRound size={15} />,
  },
  {
    id: 'profissionais-detalhe',
    journey: 'profissionais',
    index: 2,
    label: 'ADM-06 Perfil dos Profissionais',
    sub: 'Dados · Avaliações · Histórico',
    allowedRoles: ['adm'],
    icon: <ContactRound size={15} />,
  },

  // — Jornada: Serviços (Admin only) ─────────────────────────────────────────
  {
    id: 'servicos-categorias',
    journey: 'servicos',
    index: 1,
    label: 'ADM-11 Cadastro de Categoria de Serviço',
    sub: 'Aba: Categoria de serviço',
    allowedRoles: ['adm'],
    icon: <Tag size={15} />,
  },
  {
    id: 'servicos-tipos',
    journey: 'servicos',
    index: 2,
    label: 'ADM-12 Cadastro de Tipo de Serviço',
    sub: 'Aba: Tipo de serviço',
    allowedRoles: ['adm'],
    icon: <Tag size={15} />,
  },

  // — Jornada: Pesquisa (Admin + Empresa) ────────────────────────────────────
  {
    id: 'pesquisa-subcategorias',
    journey: 'pesquisa',
    index: 1,
    label: 'ADM-13',
    sub: 'Aba: Subcategoria de pesquisa',
    allowedRoles: ['adm', 'empresa'],
    icon: <FileText size={15} />,
  },
  {
    id: 'pesquisa-perguntas',
    journey: 'pesquisa',
    index: 2,
    label: 'ADM-14 Gerenciar Banco de Perguntas',
    sub: 'Aba: Perguntas',
    allowedRoles: ['adm', 'empresa'],
    icon: <FileText size={15} />,
  },
  {
    id: 'pesquisa-modelo',
    journey: 'pesquisa',
    index: 3,
    label: 'ADM-15',
    sub: 'Aba: Modelo',
    allowedRoles: ['adm', 'empresa'],
    icon: <FileText size={15} />,
  },
  // — Jornada: Clientes (Admin only) ──────────────────────────────────────────
  {
    id: 'clientes',
    journey: 'clientes',
    index: 1,
    label: 'Empresas',
    sub: 'Tabela · Busca · CRM',
    allowedRoles: ['adm'],
    icon: <Building2 size={15} />,
  },
  {
    id: 'clientes-detalhe',
    journey: 'clientes',
    index: 2,
    label: 'Detalhe da Empresa',
    sub: 'CRM · Contatos · Configurações',
    allowedRoles: ['adm'],
    icon: <Building2 size={15} />,
  },

  // — Jornada: Pesquisa Pós-Evento do Profissional (Empresa) ───────────────────
  {
    id: 'pesquisa-profissional',
    journey: 'pesquisa-profissional',
    index: 1,
    label: 'Pesquisa Pós-Evento',
    sub: 'Feedback do profissional · 7 questões',
    allowedRoles: ['empresa'],
    icon: <FileText size={15} />,
  },
];

// ─── Indicadores de componentes ativos por jornada / perfil ──────────────────
function getIndicators(role: UserRole, journey: ActiveJourney, activeTab: ActiveTab, eventsView: EventsView = 'lista', profView: ProfView = 'lista', clientesView: ClientesView = 'lista', pesquisaView: PesquisaView = 'lista') {
  if (journey === 'login') {
    return [
      { label: 'Campo e-mail',           on: true },
      { label: 'Campo senha',            on: true },
      { label: 'Mostrar/ocultar senha',  on: true },
      { label: 'Lembrar-me',             on: true },
      { label: 'Recuperar senha',        on: true },
      { label: 'Criar nova senha',       on: true },
    ];
  }
  if (journey === 'pesquisa-profissional') {
    return [
      { label: 'Formulário com 7 perguntas', on: true },
      { label: 'Escala 1-5',                 on: true },
      { label: 'Opção única (Sim/Não)',      on: true },
      { label: 'Múltipla escolha',           on: true },
      { label: 'Campo aberto "Outro"',       on: true },
      { label: 'Tela de sucesso/bloqueio',   on: true },
    ];
  }
  if (journey === 'pesquisa' && pesquisaView === 'detalhe') {
    return [
      { label: 'KPIs de resposta / IBE',  on: true             },
      { label: 'Radar por área (1–5)',     on: true             },
      { label: 'Médias por pergunta',      on: true             },
      { label: 'Respostas individuais',    on: true             },
      { label: 'Aba Gestor (adm)',         on: role === 'adm'   },
    ];
  }
  if (journey === 'pesquisa') {
    return [
      { label: 'Listagem de pesquisas',  on: true               },
      { label: 'Coluna empresa (adm)',   on: role === 'adm'     },
      { label: 'Copiar link pesquisa',   on: true               },
      { label: 'Aba Modelos (adm)',      on: role === 'adm'     },
    ];
  }
  if (journey === 'clientes' && clientesView === 'detalhe') {
    return [
      { label: 'CRM (somente leitura)',    on: true },
      { label: 'Contatos para pesquisa',   on: true },
      { label: 'Status da pesquisa',       on: true },
      { label: 'Modo de edição inline',    on: true },
    ];
  }
  if (journey === 'clientes') {
    return [
      { label: 'Tabela de clientes',       on: true },
      { label: 'Busca por nome/CNPJ',      on: true },
      { label: 'Ver detalhe da empresa',   on: true },
    ];
  }
  if (journey === 'servicos') {
    return [
      { label: 'Aba Categoria de serviço', on: true },
      { label: 'Aba Tipo de serviço',      on: true },
      { label: 'Modal Nova categoria',     on: true },
      { label: 'Modal Novo tipo',          on: true },
      { label: 'Desativar / Reativar',     on: true },
    ];
  }
  if (journey === 'profissionais' && profView === 'detalhe') {
    return [
      { label: 'Dados do profissional',   on: true },
      { label: 'Histórico de eventos',    on: true },
      { label: 'Aba Avaliações',          on: true },
      { label: 'Radar de Desempenho',     on: true },
    ];
  }
  if (journey === 'profissionais') {
    return [
      { label: 'Tabela de profissionais', on: true },
      { label: 'Busca por nome',          on: true },
      { label: 'Filtro por função',       on: true },
      { label: 'Sincronizar com CRM',     on: true },
    ];
  }
  if (journey === 'dashboard') {
    return [
      { label: 'Abas de navegação',  on: role === 'adm'     },
      { label: 'Aba Visão Geral',    on: role === 'adm'     },
      { label: 'Aba Impacto',        on: true               },
      { label: 'Próximos Eventos',   on: role === 'empresa' },
    ];
  }
  if (journey === 'usuarios') {
    return [
      { label: 'Tabela de usuários',  on: true               },
      { label: 'Busca por nome/email', on: true               },
      { label: 'Filtro por perfil',   on: true               },
      { label: 'Modal adicionar',     on: true               },
      { label: 'Ativar/Desativar',    on: true               },
    ];
  }
  if (eventsView === 'detalhe') {
    return [
      { label: 'CRM (somente leitura)', on: true               },
      { label: 'Config. do evento',     on: true               },
      { label: 'Modo de edição',        on: role === 'adm'     },
      { label: 'Realizar avaliação',    on: role === 'empresa' },
    ];
  }
  // jornada: eventos — lista
  return [
    { label: 'Tabela de eventos',   on: true               },
    { label: 'Filtro por empresa',  on: role === 'adm'     },
    { label: 'QR Code Inscrição',   on: true               },
    { label: 'QR Code Encaixe',     on: true               },
  ];
}

// ─── Thumbnail por jornada ────────────────────────────────────────────────────
function LoginThumb({ active }: { active: boolean }) {
  void active;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '6px' }}>
      <div style={{ background: 'rgba(255,255,255,0.85)', borderRadius: 4, padding: '6px 8px', width: '75%', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div className={styles.thumbRow} style={{ width: '40%', margin: '0 auto 2px' }} />
        <div className={styles.thumbRow} style={{ width: '70%', margin: '0 auto' }} />
        <div className={styles.thumbRow} style={{ width: '55%', margin: '0 auto 4px' }} />
        <div className={styles.thumbRow} style={{ width: '100%', height: 5 }} />
        <div className={styles.thumbRow} style={{ width: '100%', height: 5 }} />
        <div className={styles.thumbRow} style={{ width: '100%', height: 8, marginTop: 2 }} />
      </div>
    </div>
  );
}

function DashboardThumb({ active }: { active: boolean }) {
  return (
    <>
      <div className={styles.thumbTopbar} />
      <div className={styles.thumbContent}>
        <div className={styles.thumbSidebar} />
        <div className={styles.thumbBody}>
          <div className={styles.thumbRow} style={{ width: '60%' }} />
          <div className={styles.thumbRow} style={{ width: '100%', height: 3 }} />
          <div className={styles.thumbCards}>
            <div className={styles.thumbCard} />
            <div className={styles.thumbCard} />
            <div className={styles.thumbCard} />
          </div>
          <div className={styles.thumbRow} style={{ width: '100%', height: 24 }} />
        </div>
      </div>
    </>
  );
}

function EventDetailThumb({ active }: { active: boolean }) {
  return (
    <>
      <div className={styles.thumbTopbar} />
      <div className={styles.thumbContent}>
        <div className={styles.thumbSidebar} />
        <div className={styles.thumbBody}>
          {/* Simula header com back button */}
          <div className={styles.thumbFilterRow}>
            <div className={styles.thumbFilter} style={{ maxWidth: 8 }} />
            <div className={styles.thumbFilter} style={{ width: '50%' }} />
          </div>
          {/* Simula tabs */}
          <div className={styles.thumbFilterRow}>
            <div className={styles.thumbFilter} />
            <div className={styles.thumbFilter} />
            <div className={styles.thumbFilter} />
          </div>
          {/* Simula seção de campos */}
          <div className={styles.thumbRow} style={{ width: '100%', height: 14 }} />
          <div className={styles.thumbRow} style={{ width: '80%' }} />
        </div>
      </div>
    </>
  );
}

function EventsThumb({ active }: { active: boolean }) {
  return (
    <>
      <div className={styles.thumbTopbar} />
      <div className={styles.thumbContent}>
        <div className={styles.thumbSidebar} />
        <div className={styles.thumbBody}>
          <div className={styles.thumbRow} style={{ width: '55%' }} />
          {/* Simula toolbar de filtros */}
          <div className={styles.thumbFilterRow}>
            <div className={styles.thumbFilter} />
            <div className={styles.thumbFilter} />
            <div className={styles.thumbFilter} />
          </div>
          {/* Simula linhas de tabela */}
          <div className={styles.thumbTableRow} />
          <div className={styles.thumbTableRow} style={{ opacity: 0.6 }} />
          <div className={styles.thumbTableRow} style={{ opacity: 0.4 }} />
        </div>
      </div>
    </>
  );
}

function UsersThumb({ active }: { active: boolean }) {
  return (
    <>
      <div className={styles.thumbTopbar} />
      <div className={styles.thumbContent}>
        <div className={styles.thumbSidebar} />
        <div className={styles.thumbBody}>
          <div className={styles.thumbRow} style={{ width: '50%' }} />
          {/* Simula toolbar de busca e filtros */}
          <div className={styles.thumbFilterRow}>
            <div className={styles.thumbFilter} style={{ flex: 1 }} />
            <div className={styles.thumbFilter} />
            <div className={styles.thumbFilter} style={{ width: 12 }} />
          </div>
          {/* Simula linhas de tabela com badges */}
          <div className={styles.thumbTableRow} />
          <div className={styles.thumbTableRow} style={{ opacity: 0.6 }} />
          <div className={styles.thumbTableRow} style={{ opacity: 0.4 }} />
        </div>
      </div>
    </>
  );
}

function UsersModalThumb({ active }: { active: boolean }) {
  return (
    <>
      <div className={styles.thumbTopbar} />
      <div className={styles.thumbContent}>
        <div className={styles.thumbSidebar} />
        <div className={styles.thumbBody} style={{ position: 'relative', filter: 'blur(0.3px)' }}>
          {/* Fundo da listagem */}
          <div className={styles.thumbRow} style={{ width: '50%' }} />
          <div className={styles.thumbFilterRow}>
            <div className={styles.thumbFilter} style={{ flex: 1 }} />
            <div className={styles.thumbFilter} />
          </div>
          <div className={styles.thumbTableRow} style={{ opacity: 0.3 }} />
          <div className={styles.thumbTableRow} style={{ opacity: 0.2 }} />
          {/* Overlay escuro (simula backdrop) */}
          <div style={{ position: 'absolute', inset: -4, background: 'rgba(0,0,0,0.18)', borderRadius: 2 }} />
          {/* Modal card flutuando */}
          <div style={{
            position: 'absolute', top: '18%', left: '10%', right: '10%',
            background: 'rgba(255,255,255,0.97)', borderRadius: 3,
            padding: '4px 5px', display: 'flex', flexDirection: 'column', gap: 3,
            boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
          }}>
            <div className={styles.thumbRow} style={{ width: '60%', marginBottom: 1 }} />
            <div className={styles.thumbRow} style={{ width: '100%', height: 4 }} />
            <div className={styles.thumbRow} style={{ width: '100%', height: 4 }} />
            <div className={styles.thumbRow} style={{ width: '100%', height: 4 }} />
            <div className={styles.thumbRow} style={{ width: '50%', height: 6, marginTop: 2 }} />
          </div>
        </div>
      </div>
    </>
  );
}

// ─── PrototypingShell ─────────────────────────────────────────────────────────
export function PrototypingShell() {
  const [role,                setRole]                = useState<UserRole>('adm');
  const [activeTab,           setActiveTab]           = useState<ActiveTab>('visao-geral');
  const [activeJourney,       setActiveJourney]       = useState<ActiveJourney>('dashboard');
  const [loginView,           setLoginView]           = useState<LoginView>('login');
  const [eventsView,          setEventsView]          = useState<EventsView>('lista');
  const [selectedEvent,       setSelectedEvent]       = useState<EventItem | null>(null);
  const [profView,            setProfView]            = useState<ProfView>('lista');
  const [selectedProfissional, setSelectedProfissional] = useState<Profissional | null>(null);
  const [clientesView,        setClientesView]        = useState<ClientesView>('lista');
  const [selectedCliente,     setSelectedCliente]     = useState<Cliente | null>(null);
  const [pesquisaView,        setPesquisaView]        = useState<PesquisaView>('lista');
  const [selectedPesquisa,    setSelectedPesquisa]    = useState<Pesquisa | null>(null);
  const [professionalSurveyVariation, setProfessionalSurveyVariation] = useState<'form' | 'success-positive' | 'success-neutral' | 'blocked'>('form');
  const [professionalSurveySuccessVariant, setProfessionalSurveySuccessVariant] = useState<'positive' | 'neutral'>('positive');
  const usersScreenRef = useRef<{ openAddModal: () => void }>(null);
  const [servicosInitialTab, setServicosInitialTab] = useState<ServicosTab>('categorias');
  const [pesquisaInitialTab, setPesquisaInitialTab] = useState<PesquisaTabType>('subcategorias');

  // Mapeamento: item do sidebar do app → jornada
  const NAV_JOURNEY: Partial<Record<string, ActiveJourney>> = {
    dashboard:     'dashboard',
    eventos:       'eventos',
    usuarios:      'usuarios',
    profissionais: 'profissionais',
    servicos:      'servicos',
    clientes:      'clientes',
    pesquisa:      'pesquisa',
  };

  function handleNavChange(item: string) {
    const journey = NAV_JOURNEY[item];
    if (journey) {
      setActiveJourney(journey);
      // Ao navegar para 'eventos' pelo sidebar do app → sempre volta para lista
      if (journey === 'eventos')        setEventsView('lista');
      // Ao navegar para 'profissionais' → sempre volta para lista
      if (journey === 'profissionais')  setProfView('lista');
      // Ao navegar para 'clientes' → sempre volta para lista
      if (journey === 'clientes')       setClientesView('lista');
      // Ao navegar para 'pesquisa' → sempre volta para lista e primeira aba
      if (journey === 'pesquisa')       { setPesquisaView('lista'); setPesquisaInitialTab('subcategorias'); }
    }
  }

  function handleViewPesquisaDetail(p: Pesquisa) {
    setSelectedPesquisa(p);
    setPesquisaView('detalhe');
    setActiveJourney('pesquisa');
  }

  function handleBackToPesquisaList() {
    setPesquisaView('lista');
    setSelectedPesquisa(null);
  }

  function handleViewClienteDetail(cliente: Cliente) {
    setSelectedCliente(cliente);
    setClientesView('detalhe');
    setActiveJourney('clientes');
  }

  function handleBackToClientesList() {
    setClientesView('lista');
    setSelectedCliente(null);
  }

  function handleViewProfDetail(prof: Profissional) {
    setSelectedProfissional(prof);
    setProfView('detalhe');
    setActiveJourney('profissionais');
  }

  function handleBackToProfList() {
    setProfView('lista');
    setSelectedProfissional(null);
  }

  function handleRoleChange(newRole: UserRole) {
    setRole(newRole);
    // Empresa não acessa Visão Geral
    if (newRole === 'empresa' && activeTab === 'visao-geral') {
      setActiveTab('impacto');
    }
  }

  function handleViewDetail(event: EventItem) {
    setSelectedEvent(event);
    setEventsView('detalhe');
    setActiveJourney('eventos');
  }

  function handleBackToList() {
    setEventsView('lista');
    setSelectedEvent(null);
  }

  function handleScreenClick(screen: ScreenDef) {
    if (!screen.allowedRoles.includes(role)) return;
    setActiveJourney(screen.journey);
    if (screen.tab) setActiveTab(screen.tab);
    // — Login ——————————————————————————————————————————————————————————————
    if (screen.id === 'login')            { setActiveJourney('login'); setLoginView('login'); }
    if (screen.id === 'login-recuperar')  { setActiveJourney('login'); setLoginView('recuperar'); }
    if (screen.id === 'login-nova-senha') { setActiveJourney('login'); setLoginView('nova-senha'); }
    // Navegação direta pelo painel de telas do protótipo
    if (screen.id === 'eventos-lista')   setEventsView('lista');
    if (screen.id === 'eventos-detalhe' || screen.id === 'eventos-select-prof-modal' || screen.id === 'eventos-criteria-modal') {
      // Usa EVT-001 como evento de demonstração se nenhum selecionado
      if (!selectedEvent) {
        // import lazy: usamos o primeiro evento da lista como demo
        setSelectedEvent({
          id: 'EVT-001', name: 'SIPAT - Itaú Unibanco',
          startDate: '13/04/2026', endDate: '15/04/2026',
          company: 'Itaú Unibanco',
          professionals: { hired: 5, needed: 6 },
          status: 'ativo',
        });
      }
      setEventsView('detalhe');
    }
    if (screen.id === 'usuarios') {
      setActiveJourney('usuarios');
    }
    if (screen.id === 'usuarios-add-modal') {
      setActiveJourney('usuarios');
      // Aguarda o próximo frame para garantir que UsersScreen já está montado
      requestAnimationFrame(() => {
        usersScreenRef.current?.openAddModal();
      });
    }
    if (screen.id === 'profissionais') {
      setActiveJourney('profissionais');
      setProfView('lista');
    }
    if (screen.id === 'servicos-categorias') {
      setActiveJourney('servicos');
      setServicosInitialTab('categorias');
    }
    if (screen.id === 'servicos-tipos') {
      setActiveJourney('servicos');
      setServicosInitialTab('tipos');
    }
    if (screen.id === 'profissionais-detalhe') {
      setActiveJourney('profissionais');
      // Use first mock professional as demo if none selected
      if (!selectedProfissional) {
        setSelectedProfissional({
          id: 'PRO-001', name: 'Ana Carolina Lima',
          funcao: 'massoterapeuta', localizacao: 'São Paulo, SP',
          eventosRealizados: 42, nota: 4.9,
        });
      }
      setProfView('detalhe');
    }
    if (screen.id === 'pesquisa-subcategorias') {
      setActiveJourney('pesquisa');
      setPesquisaView('lista');
      setPesquisaInitialTab('subcategorias');
    }
    if (screen.id === 'pesquisa-perguntas') {
      setActiveJourney('pesquisa');
      setPesquisaView('lista');
      setPesquisaInitialTab('perguntas');
    }
    if (screen.id === 'pesquisa-modelo') {
      setActiveJourney('pesquisa');
      setPesquisaView('lista');
      setPesquisaInitialTab('modelo');
    }
    if (screen.id === 'clientes') {
      setActiveJourney('clientes');
      setClientesView('lista');
    }
    if (screen.id === 'clientes-detalhe') {
      setActiveJourney('clientes');
      // Use Itaú Unibanco as demo if none selected
      if (!selectedCliente) {
        setSelectedCliente({ id: 'CLI-001', name: 'Itaú Unibanco', cnpj: '60.872.504/0001-23', localizacao: 'São Paulo, SP', tipoContrato: 'recorrente' });
      }
      setClientesView('detalhe');
    }
    if (screen.id === 'pesquisa-profissional') {
      setActiveJourney('pesquisa-profissional');
    }
  }

  const indicators = getIndicators(role, activeJourney, activeTab, eventsView, profView, clientesView, pesquisaView);

  // Agrupa telas por jornada para exibição na sidebar
  const journeyGroups: { journey: ActiveJourney; label: string; screens: ScreenDef[] }[] = [
    { journey: 'login',     label: 'Jornada · Login',           screens: SCREENS.filter(s => s.journey === 'login')     },
    { journey: 'dashboard', label: 'ADM-01 Dashboard — Indicadores de negócio (Admin)', screens: SCREENS.filter(s => s.journey === 'dashboard') },
    { journey: 'eventos',   label: 'Jornada · Eventos',         screens: SCREENS.filter(s => s.journey === 'eventos')   },
    ...(role === 'adm' ? [{ journey: 'usuarios' as const, label: 'Jornada · Usuário', screens: SCREENS.filter(s => s.journey === 'usuarios') }] : []),
    ...(role === 'adm' ? [{ journey: 'profissionais' as const, label: 'Jornada · Profissionais', screens: SCREENS.filter(s => s.journey === 'profissionais') }] : []),
    ...(role === 'adm' ? [{ journey: 'servicos' as const, label: 'Jornada · Serviços', screens: SCREENS.filter(s => s.journey === 'servicos') }] : []),
    { journey: 'pesquisa' as const, label: 'Jornada · Pesquisa', screens: SCREENS.filter(s => s.journey === 'pesquisa') },
    ...(role === 'empresa' ? [{ journey: 'pesquisa-profissional' as const, label: 'Jornada · Pesquisa Pós-Evento', screens: SCREENS.filter(s => s.journey === 'pesquisa-profissional') }] : []),
    ...(role === 'adm' ? [{ journey: 'clientes' as const, label: 'Jornada · Empresas', screens: SCREENS.filter(s => s.journey === 'clientes') }] : []),
  ];

  return (
    <div className={styles.shell}>

      {/* ── Sidebar de navegação do protótipo ─────────────────────────────── */}
      <aside className={styles.nav}>

        {/* Cabeçalho */}
        <div className={styles.navHeader}>
          <div className={styles.navBrand}>
            <img
              src="/logos/PRANA_ENXOVAL__LOGO_Icone_Magenta.svg"
              alt="Prana"
              className={styles.navLogo}
            />
            <div className={styles.navBrandText}>
              <span className={styles.navBrandName}>Prana</span>
              <span className={styles.navBadge}>
                <Layers size={8} />
                Protótipo
              </span>
            </div>
          </div>
        </div>

        {/* Toggle de perfil */}
        <div className={styles.roleSection}>
          <span className={styles.sectionLabel}>Perfil de acesso</span>
          <div className={styles.roleToggle}>
            <button
              className={[styles.roleBtn, role === 'adm'     ? styles.roleBtnActive : ''].filter(Boolean).join(' ')}
              onClick={() => handleRoleChange('adm')}
            >
              Admin
            </button>
            <button
              className={[styles.roleBtn, role === 'empresa' ? styles.roleBtnActive : ''].filter(Boolean).join(' ')}
              onClick={() => handleRoleChange('empresa')}
            >
              Empresa
            </button>
          </div>
        </div>

        {/* Lista de telas — agrupadas por jornada */}
        {journeyGroups.map(group => (
          <div key={group.journey} className={styles.screenSection}>
            <span className={styles.sectionLabel}>{group.label}</span>
            <div className={styles.screenList}>
              {group.screens.map(screen => {
                const isActive = (() => {
                  if (screen.id === 'login')            return activeJourney === 'login' && loginView === 'login';
                  if (screen.id === 'login-recuperar')  return activeJourney === 'login' && loginView === 'recuperar';
                  if (screen.id === 'login-nova-senha') return activeJourney === 'login' && loginView === 'nova-senha';
                  if (screen.journey === 'dashboard') return activeJourney === 'dashboard' && activeTab === screen.tab;
                  if (screen.id === 'eventos-lista')   return activeJourney === 'eventos' && eventsView === 'lista';
                  if (screen.id === 'eventos-detalhe') return activeJourney === 'eventos' && eventsView === 'detalhe';
                  if (screen.id === 'usuarios')               return activeJourney === 'usuarios';
                  if (screen.id === 'usuarios-add-modal')     return false; // modal não tem estado ativo próprio
                  if (screen.id === 'profissionais')          return activeJourney === 'profissionais' && profView === 'lista';
                  if (screen.id === 'servicos-categorias')    return activeJourney === 'servicos';
                  if (screen.id === 'servicos-tipos')         return activeJourney === 'servicos';
                  if (screen.id === 'profissionais-detalhe')  return activeJourney === 'profissionais' && profView === 'detalhe';
                  if (screen.id === 'pesquisa-subcategorias') return activeJourney === 'pesquisa' && pesquisaView === 'lista';
                  if (screen.id === 'pesquisa-perguntas')     return activeJourney === 'pesquisa' && pesquisaView === 'lista';
                  if (screen.id === 'pesquisa-modelo')        return activeJourney === 'pesquisa' && pesquisaView === 'lista';
                  if (screen.id === 'clientes')               return activeJourney === 'clientes' && clientesView === 'lista';
                  if (screen.id === 'clientes-detalhe')       return activeJourney === 'clientes' && clientesView === 'detalhe';
                  if (screen.id === 'pesquisa-profissional')  return activeJourney === 'pesquisa-profissional';
                  return false;
                })();
                const isDisabled = !screen.allowedRoles.includes(role);
                return (
                  <button
                    key={screen.id}
                    className={[
                      styles.screenItem,
                      isActive   ? styles.screenItemActive   : '',
                      isDisabled ? styles.screenItemDisabled : '',
                    ].filter(Boolean).join(' ')}
                    onClick={() => handleScreenClick(screen)}
                    disabled={isDisabled}
                    title={isDisabled ? `Restrito ao perfil: ${screen.allowedRoles.join(', ')}` : screen.label}
                  >
                    {/* Thumbnail sketch */}
                    <div className={[styles.thumbnail, isActive ? styles.thumbnailActive : ''].join(' ')}>
                      {screen.journey === 'login'
                        ? <LoginThumb active={isActive} />
                        : screen.id === 'usuarios-add-modal' || screen.id === 'eventos-select-prof-modal' || screen.id === 'eventos-criteria-modal'
                          ? <UsersModalThumb active={isActive} />
                          : screen.id === 'usuarios' || screen.id === 'profissionais' || screen.id === 'clientes' || screen.id === 'pesquisa-subcategorias' || screen.id === 'pesquisa-perguntas' || screen.id === 'pesquisa-modelo' || screen.id === 'pesquisa-profissional' || screen.id === 'servicos-categorias' || screen.id === 'servicos-tipos'
                            ? <UsersThumb active={isActive} />
                            : screen.id === 'profissionais-detalhe' || screen.id === 'eventos-detalhe' || screen.id === 'clientes-detalhe' || screen.id === 'pesquisa-detalhe'
                              ? <EventDetailThumb active={isActive} />
                              : screen.journey === 'eventos'
                                ? <EventsThumb active={isActive} />
                                : <DashboardThumb active={isActive} />
                      }
                      {/* Number badge */}
                      <div className={[styles.thumbNum, isActive ? styles.thumbNumActive : ''].join(' ')}>
                        {String(screen.index).padStart(2, '0')}
                      </div>
                    </div>

                    {/* Screen info */}
                    <div className={styles.screenInfo}>
                      <div className={styles.screenInfoHeader}>
                        <span className={[styles.screenIcon, isActive ? styles.screenIconActive : ''].join(' ')}>
                          {screen.icon}
                        </span>
                        <span className={[styles.screenLabel, isActive ? styles.screenLabelActive : ''].join(' ')}>
                          {screen.label}
                        </span>
                        {isDisabled && <EyeOff size={11} className={styles.screenLock} />}
                      </div>
                      <span className={styles.screenSub}>{screen.sub}</span>
                      <div className={styles.screenRoles}>
                        {screen.allowedRoles.map(r => (
                          <span key={r} className={[styles.screenRolePill, r === role ? styles.screenRolePillActive : ''].join(' ')}>
                            {r === 'adm' ? 'Admin' : 'Empresa'}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Spacer */}
        <div className={styles.spacer} />

        {/* Painel de Variações — Pesquisa Profissional */}
        {activeJourney === 'pesquisa-profissional' && (
          <div className={styles.indicatorPanel} style={{ borderTop: '1px solid #eee', paddingTop: 16 }}>
            <span className={styles.sectionLabel}>Variações da Tela</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { value: 'form' as const, label: 'Formulário' },
                { value: 'success-positive' as const, label: 'Sucesso (Positivo)' },
                { value: 'success-neutral' as const, label: 'Sucesso (Neutro)' },
                { value: 'blocked' as const, label: 'Bloqueado' },
              ].map(option => (
                <label key={option.value} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="survey-variation"
                    value={option.value}
                    checked={professionalSurveyVariation === option.value}
                    onChange={(e) => setProfessionalSurveyVariation(e.target.value as typeof option.value)}
                    style={{ cursor: 'pointer' }}
                  />
                  {option.label}
                </label>
              ))}

              {(professionalSurveyVariation === 'success-positive' || professionalSurveyVariation === 'success-neutral') && (
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #eee' }}>
                  <span style={{ fontSize: 11, color: '#666', display: 'block', marginBottom: 6 }}>Variante de sucesso:</span>
                  {[
                    { value: 'positive' as const, label: '⭐ Positivo' },
                    { value: 'neutral' as const, label: '✓ Neutro' },
                  ].map(option => (
                    <label key={option.value} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="success-variant"
                        value={option.value}
                        checked={professionalSurveySuccessVariant === option.value}
                        onChange={(e) => setProfessionalSurveySuccessVariant(e.target.value as typeof option.value)}
                        style={{ cursor: 'pointer' }}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Painel de componentes visíveis */}
        <div className={styles.indicatorPanel}>
          <span className={styles.sectionLabel}>Componentes ativos</span>
          {indicators.map(ind => (
            <div key={ind.label} className={styles.indicatorRow}>
              <span className={[styles.indicatorDot, ind.on ? styles.indicatorDotOn : ''].join(' ')} />
              <span className={[styles.indicatorLabel, ind.on ? styles.indicatorLabelOn : ''].join(' ')}>
                {ind.label}
              </span>
              {ind.on
                ? <Eye    size={10} className={styles.indicatorEyeOn} />
                : <EyeOff size={10} className={styles.indicatorEye}   />
              }
            </div>
          ))}
        </div>

      </aside>

      {/* ── Área principal ─────────────────────────────────────────────────── */}
      <main className={styles.content}>
        {activeJourney === 'login' ? (
          <AdminLoginScreen
            view={loginView}
            onViewChange={v => setLoginView(v)}
            onLoginSuccess={() => setActiveJourney('dashboard')}
          />
        ) : activeJourney === 'pesquisa-profissional' ? (
          <ProfessionalSurveyScreen
            viewport="desktop"
            survey={{
              id: 'PSQ-PRO-001',
              eventName: 'Pesquisa Pós-Evento',
              eventDate: '13/04/2026',
              location: 'São Paulo, SP',
            }}
            alreadyResponded={professionalSurveyVariation === 'blocked'}
            respondentName="Ana Silva"
            forceView={professionalSurveyVariation === 'form' ? 'form' : professionalSurveyVariation === 'blocked' ? 'blocked' : 'success'}
            forceSuccessVariant={professionalSurveySuccessVariant}
          />
        ) : activeJourney === 'pesquisa' && pesquisaView === 'detalhe' && selectedPesquisa ? (
          <PesquisaDetailScreen
            pesquisa={selectedPesquisa}
            role={role}
            sidebarOffset={200}
            onNavChange={handleNavChange}
            onBack={handleBackToPesquisaList}
          />
        ) : activeJourney === 'pesquisa' ? (
          <PesquisaScreen
            key={pesquisaInitialTab}
            role={role}
            sidebarOffset={200}
            onNavChange={handleNavChange}
            onViewDetail={handleViewPesquisaDetail}
            initialTab={pesquisaInitialTab}
          />
        ) : activeJourney === 'clientes' && clientesView === 'detalhe' && selectedCliente ? (
          <ClienteDetailScreen
            cliente={selectedCliente}
            role={role}
            sidebarOffset={200}
            onNavChange={handleNavChange}
            onBack={handleBackToClientesList}
          />
        ) : activeJourney === 'clientes' ? (
          <ClientesScreen
            role={role}
            sidebarOffset={200}
            onNavChange={handleNavChange}
            onViewDetail={handleViewClienteDetail}
          />
        ) : activeJourney === 'profissionais' && profView === 'detalhe' && selectedProfissional ? (
          <ProfissionalDetailScreen
            prof={selectedProfissional}
            role={role}
            sidebarOffset={200}
            onNavChange={handleNavChange}
            onBack={handleBackToProfList}
          />
        ) : activeJourney === 'profissionais' ? (
          <ProfissionaisScreen
            role={role}
            sidebarOffset={200}
            onNavChange={handleNavChange}
            onViewDetail={handleViewProfDetail}
          />
        ) : activeJourney === 'servicos' ? (
          <ServicosScreen
            key={servicosInitialTab}
            role={role}
            sidebarOffset={200}
            onNavChange={handleNavChange}
            initialTab={servicosInitialTab}
          />
        ) : activeJourney === 'usuarios' ? (
          <UsersScreen
            ref={usersScreenRef}
            role={role}
            sidebarOffset={200}
            onNavChange={handleNavChange}
          />
        ) : activeJourney === 'eventos' && eventsView === 'detalhe' && selectedEvent ? (
          <EventDetailScreen
            role={role}
            event={selectedEvent}
            sidebarOffset={200}
            onNavChange={handleNavChange}
            onBack={handleBackToList}
          />
        ) : activeJourney === 'eventos' ? (
          <EventsScreen
            role={role}
            sidebarOffset={200}
            onNavChange={handleNavChange}
            onViewDetail={handleViewDetail}
          />
        ) : (
          <DashboardScreen
            role={role}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            sidebarOffset={200}
            onNavChange={handleNavChange}
          />
        )}
      </main>

    </div>
  );
}
