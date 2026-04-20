import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { LayoutDashboard } from 'lucide-react';
import { Sidebar } from './Sidebar';

/* ── Dashboard content placeholder ─────────────────────────────────────── */
function DashboardContent({ label }: { label: string }) {
  return (
    <div style={{
      flex: 1, padding: 32,
      display: 'flex', flexDirection: 'column', gap: 24,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <LayoutDashboard size={20} color="var(--color-text-tertiary)" />
        <h1 style={{
          margin: 0,
          fontFamily: 'Raleway, sans-serif',
          fontSize: 24, fontWeight: 600,
          color: 'var(--color-text-secondary)',
        }}>{label}</h1>
      </div>

      {/* Cards row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {['Usuários', 'Eventos', 'Clientes', 'Pesquisas'].map((c, i) => (
          <div key={c} style={{
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 12, padding: '20px 24px',
          }}>
            <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginBottom: 8 }}>{c}</div>
            <div style={{
              fontFamily: 'Raleway, sans-serif',
              fontSize: 28, fontWeight: 600,
              color: 'var(--color-text-secondary)',
            }}>{(i + 1) * 124}</div>
          </div>
        ))}
      </div>

      {/* Placeholder table area */}
      <div style={{
        flex: 1,
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 12, padding: 24,
        minHeight: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--color-text-tertiary)', fontSize: 14,
      }}>
        Conteúdo do dashboard
      </div>
    </div>
  );
}

/* ── Layout wrapper ─────────────────────────────────────────────────────── */
function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', height: '100vh', width: '100%',
      background: 'var(--color-bg-default)',
      overflow: 'hidden',
    }}>
      {children}
    </div>
  );
}

/* ── Meta ───────────────────────────────────────────────────────────────── */
const meta: Meta<typeof Sidebar> = {
  title: 'Components/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<typeof Sidebar>;

/* ── Open (default) ─────────────────────────────────────────────────────── */
export const Open: Story = {
  render: () => (
    <AppLayout>
      <Sidebar open activeItem="dashboard" />
      <DashboardContent label="Dashboard" />
    </AppLayout>
  ),
};

/* ── Closed ─────────────────────────────────────────────────────────────── */
export const Closed: Story = {
  render: () => (
    <AppLayout>
      <Sidebar open={false} activeItem="dashboard" />
      <DashboardContent label="Dashboard" />
    </AppLayout>
  ),
};

/* ── Interactive (toggle) ───────────────────────────────────────────────── */
export const Interactive: Story = {
  render: () => {
    const [open, setOpen]         = useState(true);
    const [active, setActive]     = useState('dashboard');

    return (
      <AppLayout>
        <Sidebar
          open={open}
          onToggle={() => setOpen(o => !o)}
          activeItem={active}
          onNavClick={setActive}
        />
        <DashboardContent label={active.charAt(0).toUpperCase() + active.slice(1)} />
      </AppLayout>
    );
  },
};
