import type { Meta, StoryObj } from '@storybook/react';

// ─── Global Palettes ─────────────────────────────────────────────────────────

const palettes = [
  { name: 'Brand',  prefix: '--color-brand',  steps: ['50','100','200','300','400','500','600','700','800','900','950'] },
  { name: 'Gray',   prefix: '--color-gray',   steps: ['white','50','100','200','300','400','500','600','700','800','900','950'] },
  { name: 'Red',    prefix: '--color-red',    steps: ['50','100','200','300','400','500','600','700','800','900','950'] },
  { name: 'Green',  prefix: '--color-green',  steps: ['50','100','200','300','400','500','600','700','800','900','950'] },
  { name: 'Blue',   prefix: '--color-blue',   steps: ['50','100','200','300','400','500','600','700','800','900','950'] },
  { name: 'Yellow', prefix: '--color-yellow', steps: ['50','100','200','300','400','500','600','700','800','900','950'] },
  { name: 'Orange', prefix: '--color-orange', steps: ['50','100','200','300','400','500','600','700','800','900','950'] },
  { name: 'Indigo', prefix: '--color-indigo', steps: ['50','100','200','300','400','500','600','700','800','900','950'] },
  { name: 'Violet', prefix: '--color-violet', steps: ['50','100','200','300','400','500','600','700','800','900','950'] },
  { name: 'Pink',   prefix: '--color-pink',   steps: ['50','100','200','300','400','500','600','700','800','900','950'] },
];

function Swatch({ varName }: { varName: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ width: 48, height: 48, borderRadius: 8, background: `var(${varName})`, border: '1px solid rgba(0,0,0,.08)', boxShadow: '0 1px 3px rgba(0,0,0,.1)' }} />
      <span style={{ fontSize: 10, color: '#666', fontFamily: 'monospace' }}>{varName.replace('--color-', '')}</span>
    </div>
  );
}

function PaletteRow({ name, prefix, steps }: { name: string; prefix: string; steps: string[] }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h3 style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, fontWeight: 600, marginBottom: 10, color: 'var(--color-text-primary)' }}>{name}</h3>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {steps.map(step => <Swatch key={step} varName={`${prefix}-${step}`} />)}
      </div>
    </div>
  );
}

// ─── Alias Token Groups ───────────────────────────────────────────────────────

type AliasToken = { name: string; token: string; light: string; dark: string; description: string };
type TokenGroup = { label: string; tokens: AliasToken[] };

const aliasGroups: TokenGroup[] = [
  {
    label: 'Text',
    tokens: [
      { name: 'text-primary',    token: '--color-text-primary',    light: 'Gray/900',   dark: 'Gray/50',    description: 'Texto principal' },
      { name: 'text-secondary',  token: '--color-text-secondary',  light: 'Gray/700',   dark: 'Gray/100',   description: 'Texto secundário' },
      { name: 'text-tertiary',   token: '--color-text-tertiary',   light: 'Gray/500',   dark: 'Gray/300',   description: 'Placeholder / label auxiliar' },
      { name: 'text-disabled',   token: '--color-text-disabled',   light: 'Gray/400',   dark: 'Gray/600',   description: 'Texto desativado' },
      { name: 'text-inverse',    token: '--color-text-inverse',    light: 'Gray/50',    dark: 'Gray/900',   description: 'Texto sobre fundo escuro' },
      { name: 'text-brand',      token: '--color-text-brand',      light: 'Brand/500',  dark: 'Brand/300',  description: 'Texto da marca' },
      { name: 'text-link',       token: '--color-text-link',       light: 'Blue/600',   dark: 'Blue/400',   description: 'Links' },
      { name: 'text-link-hover', token: '--color-text-link-hover', light: 'Blue/700',   dark: 'Blue/300',   description: 'Links — hover' },
      { name: 'text-error',      token: '--color-text-error',      light: 'Red/600',    dark: 'Red/400',    description: 'Erros' },
      { name: 'text-success',    token: '--color-text-success',    light: 'Green/700',  dark: 'Green/400',  description: 'Sucesso' },
      { name: 'text-warning',    token: '--color-text-warning',    light: 'Yellow/700', dark: 'Yellow/400', description: 'Aviso' },
    ],
  },
  {
    label: 'Background',
    tokens: [
      { name: 'bg-default',      token: '--color-bg-default',      light: 'Gray/50',    dark: 'Gray/950',   description: 'Fundo padrão da página' },
      { name: 'bg-subtle',       token: '--color-bg-subtle',       light: 'Gray/100',   dark: 'Gray/700',   description: 'Fundo levemente diferenciado' },
      { name: 'bg-surface',      token: '--color-bg-surface',      light: 'Gray/White', dark: 'Gray/800',   description: 'Cards e superfícies' },
      { name: 'bg-disabled',     token: '--color-bg-disabled',     light: 'Gray/200',   dark: 'Gray/800',   description: 'Elementos desativados' },
      { name: 'bg-brand',        token: '--color-bg-brand',        light: 'Brand/50',   dark: 'Brand/950',  description: 'Fundo brand suave' },
      { name: 'bg-brand-strong', token: '--color-bg-brand-strong', light: 'Brand/500',  dark: 'Brand/400',  description: 'Fundo brand forte (CTA)' },
    ],
  },
  {
    label: 'Border',
    tokens: [
      { name: 'border-default',  token: '--color-border-default',  light: 'Gray/600',  dark: 'Gray/200',  description: 'Borda padrão' },
      { name: 'border-subtle',   token: '--color-border-subtle',   light: 'Gray/100',  dark: 'Gray/700',  description: 'Borda discreta' },
      { name: 'border-muted',    token: '--color-border-muted',    light: 'Gray/400',  dark: 'Gray/400',  description: 'Borda intermediária' },
      { name: 'border-disabled', token: '--color-border-disabled', light: 'Gray/300',  dark: 'Gray/700',  description: 'Borda desativada' },
      { name: 'border-focus',    token: '--color-border-focus',    light: 'Blue/600',  dark: 'Blue/400',  description: 'Foco / outline' },
    ],
  },
  {
    label: 'Action — Primary',
    tokens: [
      { name: 'action-primary',         token: '--color-action-primary',         light: 'Brand/500', dark: 'Brand/500', description: 'Padrão' },
      { name: 'action-primary-hover',   token: '--color-action-primary-hover',   light: 'Brand/600', dark: 'Brand/600', description: 'Hover' },
      { name: 'action-primary-pressed', token: '--color-action-primary-pressed', light: 'Brand/700', dark: 'Brand/700', description: 'Pressed' },
    ],
  },
  {
    label: 'Action — Secondary',
    tokens: [
      { name: 'action-secondary',         token: '--color-action-secondary',         light: 'Indigo/600', dark: 'Indigo/500', description: 'Padrão' },
      { name: 'action-secondary-hover',   token: '--color-action-secondary-hover',   light: 'Indigo/700', dark: 'Indigo/400', description: 'Hover' },
      { name: 'action-secondary-pressed', token: '--color-action-secondary-pressed', light: 'Indigo/800', dark: 'Indigo/300', description: 'Pressed' },
    ],
  },
  {
    label: 'Action — Destructive',
    tokens: [
      { name: 'action-error',         token: '--color-action-error',         light: 'Red/700', dark: 'Red/300', description: 'Padrão' },
      { name: 'action-error-hover',   token: '--color-action-error-hover',   light: 'Red/800', dark: 'Red/200', description: 'Hover' },
      { name: 'action-error-pressed', token: '--color-action-error-pressed', light: 'Red/900', dark: 'Red/100', description: 'Pressed' },
    ],
  },
  {
    label: 'Action — Warning',
    tokens: [
      { name: 'action-warning',         token: '--color-action-warning',         light: 'Yellow/600', dark: 'Yellow/500', description: 'Padrão' },
      { name: 'action-warning-hover',   token: '--color-action-warning-hover',   light: 'Yellow/700', dark: 'Yellow/400', description: 'Hover' },
      { name: 'action-warning-pressed', token: '--color-action-warning-pressed', light: 'Yellow/800', dark: 'Yellow/300', description: 'Pressed' },
    ],
  },
  {
    label: 'Action — Success',
    tokens: [
      { name: 'action-success',         token: '--color-action-success',         light: 'Green/600', dark: 'Green/500', description: 'Padrão' },
      { name: 'action-success-hover',   token: '--color-action-success-hover',   light: 'Green/700', dark: 'Green/400', description: 'Hover' },
      { name: 'action-success-pressed', token: '--color-action-success-pressed', light: 'Green/800', dark: 'Green/300', description: 'Pressed' },
    ],
  },
  {
    label: 'Status',
    tokens: [
      { name: 'status-success-bg',  token: '--color-status-success-bg',  light: 'Green/50',   dark: 'Green/950',   description: 'Fundo sucesso' },
      { name: 'status-success-fg',  token: '--color-status-success-fg',  light: 'Green/700',  dark: 'Green/400',   description: 'Texto/ícone sucesso' },
      { name: 'status-error-bg',    token: '--color-status-error-bg',    light: 'Red/50',     dark: 'Red/950',     description: 'Fundo erro' },
      { name: 'status-error-fg',    token: '--color-status-error-fg',    light: 'Red/700',    dark: 'Red/400',     description: 'Texto/ícone erro' },
      { name: 'status-warning-bg',  token: '--color-status-warning-bg',  light: 'Yellow/50',  dark: 'Yellow/950',  description: 'Fundo aviso' },
      { name: 'status-warning-fg',  token: '--color-status-warning-fg',  light: 'Yellow/700', dark: 'Yellow/400',  description: 'Texto/ícone aviso' },
      { name: 'status-info-bg',     token: '--color-status-info-bg',     light: 'Blue/50',    dark: 'Blue/950',    description: 'Fundo informação' },
      { name: 'status-info-fg',     token: '--color-status-info-fg',     light: 'Blue/700',   dark: 'Blue/400',    description: 'Texto/ícone informação' },
      { name: 'status-disabled-bg', token: '--color-status-disabled-bg', light: 'Gray/300',   dark: 'Gray/300',    description: 'Fundo desativado' },
      { name: 'status-disabled-fg', token: '--color-status-disabled-fg', light: 'Gray/400',   dark: 'Gray/400',    description: 'Texto/ícone desativado' },
      { name: 'status-orange-bg',   token: '--color-status-orange-bg',   light: 'Orange/50',  dark: 'Orange/950',  description: 'Fundo laranja' },
      { name: 'status-orange-fg',   token: '--color-status-orange-fg',   light: 'Orange/700', dark: 'Orange/400',  description: 'Texto/ícone laranja' },
      { name: 'status-indigo-bg',   token: '--color-status-indigo-bg',   light: 'Indigo/50',  dark: 'Indigo/950',  description: 'Fundo índigo' },
      { name: 'status-indigo-fg',   token: '--color-status-indigo-fg',   light: 'Indigo/700', dark: 'Indigo/400',  description: 'Texto/ícone índigo' },
      { name: 'status-violet-bg',   token: '--color-status-violet-bg',   light: 'Violet/50',  dark: 'Violet/950',  description: 'Fundo violeta' },
      { name: 'status-violet-fg',   token: '--color-status-violet-fg',   light: 'Violet/700', dark: 'Violet/400',  description: 'Texto/ícone violeta' },
      { name: 'status-pink-bg',     token: '--color-status-pink-bg',     light: 'Pink/50',    dark: 'Pink/950',    description: 'Fundo rosa' },
      { name: 'status-pink-fg',     token: '--color-status-pink-fg',     light: 'Pink/700',   dark: 'Pink/400',    description: 'Texto/ícone rosa' },
    ],
  },
];

function AliasRow({ name, token, light, dark, description }: AliasToken) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '36px 1fr 1fr 100px 100px 1fr',
      alignItems: 'center',
      gap: 12,
      padding: '8px 16px',
      borderRadius: 8,
      border: '1px solid var(--color-border-subtle)',
      background: 'var(--color-bg-surface)',
    }}>
      <div style={{ width: 28, height: 28, borderRadius: 6, background: `var(${token})`, border: '1px solid rgba(0,0,0,.1)', flexShrink: 0 }} />
      <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--color-text-primary)', fontWeight: 500 }}>{name}</span>
      <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--color-text-tertiary)' }}>{token}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 14, height: 14, borderRadius: 3, background: `var(--color-${light.toLowerCase().replace('/', '-').replace('gray-white','gray-white')})`, border: '1px solid rgba(0,0,0,.1)', flexShrink: 0 }} />
        <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--color-text-brand)' }}>{light}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 14, height: 14, borderRadius: 3, background: `var(--color-${dark.toLowerCase().replace('/', '-').replace('gray-white','gray-white')})`, border: '1px solid rgba(0,0,0,.1)', flexShrink: 0 }} />
        <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--color-text-tertiary)' }}>{dark}</span>
      </div>
      <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{description}</span>
    </div>
  );
}

// ─── Stories ──────────────────────────────────────────────────────────────────

const GlobalColorsStory = () => (
  <div style={{ padding: 32, maxWidth: 900 }}>
    <h2 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 24, fontWeight: 600, marginBottom: 8, color: 'var(--color-text-primary)' }}>Global Tokens — Paletas</h2>
    <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 40 }}>
      Valores brutos de cor. Use sempre os alias tokens nos componentes; reserve estes apenas para criar novos alias tokens.
    </p>
    {palettes.map(p => <PaletteRow key={p.name} {...p} />)}
  </div>
);

const AliasTokensStory = () => (
  <div style={{ padding: 32, maxWidth: 1100, fontFamily: 'Roboto, sans-serif' }}>
    <h2 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 24, fontWeight: 600, marginBottom: 8, color: 'var(--color-text-primary)' }}>Alias Tokens — Cores</h2>
    <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 16 }}>
      Tokens semânticos que referenciam os global tokens. As colunas <strong>Light</strong> e <strong>Dark</strong> mostram qual global token é usado em cada modo.
    </p>
    <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr 1fr 100px 100px 1fr', gap: 12, padding: '8px 16px', marginBottom: 8 }}>
      <div />
      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Token</span>
      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>CSS Var</span>
      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-brand)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>☀ Light</span>
      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>☾ Dark</span>
      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Descrição</span>
    </div>
    {aliasGroups.map(({ label, tokens }) => (
      <div key={label} style={{ marginBottom: 36 }}>
        <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-tertiary)', marginBottom: 10, marginTop: 0 }}>{label}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {tokens.map(t => <AliasRow key={t.token} {...t} />)}
        </div>
      </div>
    ))}
  </div>
);

const meta: Meta = { title: 'Foundations/Colors', component: GlobalColorsStory, parameters: { layout: 'fullscreen' } };
export default meta;
type Story = StoryObj;

export const GlobalTokens: Story = { render: () => <GlobalColorsStory /> };
export const AliasTokens: Story = { render: () => <AliasTokensStory /> };
