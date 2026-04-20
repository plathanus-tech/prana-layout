import type { Meta, StoryObj } from '@storybook/react';
import {
  Home, Search, Bell, Settings, User, Mail, Phone, Camera, Heart, Star,
  Trash, Edit, Plus, Minus, X, Check, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Upload, Download, Share, Copy,
  Eye, EyeOff, Lock, Unlock, Key, Shield, AlertCircle, AlertTriangle, Info,
  CheckCircle, XCircle, HelpCircle, Loader, RefreshCw, RotateCw,
  FileText, Folder, FolderOpen, Image, Music, Video, File,
  Calendar, Clock, MapPin, Globe, Wifi, Battery, Bluetooth,
  Sun, Moon, Cloud, Wind, Zap, Flame,
  ShoppingCart, CreditCard, DollarSign, Package, Tag, Bookmark,
  MessageCircle, MessageSquare, Send, Inbox, Archive,
  Menu, Grid, List, Layout, Sidebar, Layers,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  type LucideIcon,
} from 'lucide-react';

const iconList: { name: string; Icon: LucideIcon }[] = [
  { name: 'Home', Icon: Home }, { name: 'Search', Icon: Search }, { name: 'Bell', Icon: Bell },
  { name: 'Settings', Icon: Settings }, { name: 'User', Icon: User }, { name: 'Mail', Icon: Mail },
  { name: 'Phone', Icon: Phone }, { name: 'Camera', Icon: Camera }, { name: 'Heart', Icon: Heart },
  { name: 'Star', Icon: Star }, { name: 'Trash', Icon: Trash }, { name: 'Edit', Icon: Edit },
  { name: 'Plus', Icon: Plus }, { name: 'Minus', Icon: Minus }, { name: 'X', Icon: X },
  { name: 'Check', Icon: Check }, { name: 'ChevronDown', Icon: ChevronDown }, { name: 'ChevronUp', Icon: ChevronUp },
  { name: 'ChevronLeft', Icon: ChevronLeft }, { name: 'ChevronRight', Icon: ChevronRight },
  { name: 'ArrowLeft', Icon: ArrowLeft }, { name: 'ArrowRight', Icon: ArrowRight },
  { name: 'ArrowUp', Icon: ArrowUp }, { name: 'ArrowDown', Icon: ArrowDown },
  { name: 'Upload', Icon: Upload }, { name: 'Download', Icon: Download }, { name: 'Share', Icon: Share },
  { name: 'Copy', Icon: Copy }, { name: 'Eye', Icon: Eye }, { name: 'EyeOff', Icon: EyeOff },
  { name: 'Lock', Icon: Lock }, { name: 'Unlock', Icon: Unlock }, { name: 'Key', Icon: Key },
  { name: 'Shield', Icon: Shield }, { name: 'AlertCircle', Icon: AlertCircle }, { name: 'AlertTriangle', Icon: AlertTriangle },
  { name: 'Info', Icon: Info }, { name: 'CheckCircle', Icon: CheckCircle }, { name: 'XCircle', Icon: XCircle },
  { name: 'HelpCircle', Icon: HelpCircle }, { name: 'Loader', Icon: Loader }, { name: 'RefreshCw', Icon: RefreshCw },
  { name: 'RotateCw', Icon: RotateCw }, { name: 'FileText', Icon: FileText }, { name: 'Folder', Icon: Folder },
  { name: 'FolderOpen', Icon: FolderOpen }, { name: 'Image', Icon: Image }, { name: 'Music', Icon: Music },
  { name: 'Video', Icon: Video }, { name: 'File', Icon: File }, { name: 'Calendar', Icon: Calendar },
  { name: 'Clock', Icon: Clock }, { name: 'MapPin', Icon: MapPin }, { name: 'Globe', Icon: Globe },
  { name: 'Wifi', Icon: Wifi }, { name: 'Battery', Icon: Battery }, { name: 'Bluetooth', Icon: Bluetooth },
  { name: 'Sun', Icon: Sun }, { name: 'Moon', Icon: Moon }, { name: 'Cloud', Icon: Cloud },
  { name: 'Wind', Icon: Wind }, { name: 'Zap', Icon: Zap }, { name: 'Flame', Icon: Flame },
  { name: 'ShoppingCart', Icon: ShoppingCart }, { name: 'CreditCard', Icon: CreditCard },
  { name: 'DollarSign', Icon: DollarSign }, { name: 'Package', Icon: Package }, { name: 'Tag', Icon: Tag },
  { name: 'Bookmark', Icon: Bookmark }, { name: 'MessageCircle', Icon: MessageCircle },
  { name: 'MessageSquare', Icon: MessageSquare }, { name: 'Send', Icon: Send }, { name: 'Inbox', Icon: Inbox },
  { name: 'Archive', Icon: Archive }, { name: 'Menu', Icon: Menu }, { name: 'Grid', Icon: Grid },
  { name: 'List', Icon: List }, { name: 'Layout', Icon: Layout }, { name: 'Sidebar', Icon: Sidebar },
  { name: 'Layers', Icon: Layers }, { name: 'Bold', Icon: Bold }, { name: 'Italic', Icon: Italic },
  { name: 'Underline', Icon: Underline }, { name: 'AlignLeft', Icon: AlignLeft },
  { name: 'AlignCenter', Icon: AlignCenter }, { name: 'AlignRight', Icon: AlignRight },
];

const sizes = [16, 20, 24, 32];

const IconsStory = () => (
  <div style={{ padding: 32, fontFamily: 'Roboto, sans-serif' }}>
    <h2 style={{ fontFamily: 'Raleway, sans-serif', fontSize: 24, fontWeight: 600, marginBottom: 8, color: 'var(--color-text-primary)' }}>Icons</h2>
    <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
      Biblioteca de ícones via <strong>lucide-react</strong>. Todos os ícones do projeto devem ser importados de <code style={{ background: 'var(--color-bg-subtle)', padding: '2px 6px', borderRadius: 4 }}>lucide-react</code>.
    </p>
    <a href="https://lucide.dev/icons/" target="_blank" rel="noreferrer" style={{ fontSize: 13, color: 'var(--color-text-link)', display: 'inline-block', marginBottom: 40 }}>
      Ver todos os ícones em lucide.dev →
    </a>

    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'var(--color-text-primary)' }}>Tamanhos</h3>
    <div style={{ display: 'flex', alignItems: 'center', gap: 32, marginBottom: 48, padding: 24, background: 'var(--color-bg-subtle)', borderRadius: 12 }}>
      {sizes.map(size => (
        <div key={size} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <Home size={size} color="var(--color-text-primary)" />
          <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--color-text-tertiary)' }}>{size}px</span>
        </div>
      ))}
    </div>

    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'var(--color-text-primary)' }}>Biblioteca ({iconList.length} ícones)</h3>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8 }}>
      {iconList.map(({ name, Icon }) => (
        <div key={name} style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          padding: '16px 8px', borderRadius: 8, border: '1px solid var(--color-border-subtle)',
          background: 'var(--color-bg-surface)', cursor: 'default',
          transition: 'var(--transition-fast)',
        }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-bg-subtle)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-bg-surface)')}
        >
          <Icon size={24} color="var(--color-text-primary)" />
          <span style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--color-text-tertiary)', textAlign: 'center', wordBreak: 'break-word' }}>
            {name}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const meta: Meta = { title: 'Foundations/Icons', component: IconsStory, parameters: { layout: 'fullscreen' } };
export default meta;
type Story = StoryObj;
export const AllIcons: Story = { render: () => <IconsStory /> };
export const Sizes: Story = {
  render: () => (
    <div style={{ padding: 32, fontFamily: 'Roboto, sans-serif' }}>
      <h3 style={{ marginBottom: 24, color: 'var(--color-text-primary)' }}>Tamanhos de ícone</h3>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 32 }}>
        {sizes.map(size => (
          <div key={size} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <Bell size={size} color="var(--color-brand-500)" />
            <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--color-text-tertiary)' }}>{size}px</span>
          </div>
        ))}
      </div>
    </div>
  ),
};
