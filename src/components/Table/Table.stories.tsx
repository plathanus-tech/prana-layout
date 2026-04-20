import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Pencil, Trash2, Eye, MoreHorizontal } from 'lucide-react';
import { Table, StatusBadge } from './Table';

/* ── Sample data ────────────────────────────────────────────────────────── */
type Product = {
  avatar:   string;
  name:     string;
  category: string;
  price:    string;
  stock:    string;
  status:   string;
  featured: boolean;
  active:   boolean;
  link:     string;
};

const rows: Product[] = [
  { avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=1', name: 'Produto Alpha',   category: 'Eletrônicos', price: 'R$ 299,00', stock: '42',  status: 'active',   featured: true,  active: true,  link: 'Ver detalhes' },
  { avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=2', name: 'Produto Beta',    category: 'Vestuário',   price: 'R$ 89,90',  stock: '7',   status: 'warning',  featured: false, active: false, link: 'Ver detalhes' },
  { avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=3', name: 'Produto Gamma',   category: 'Alimentos',   price: 'R$ 12,50',  stock: '150', status: 'active',   featured: true,  active: true,  link: 'Ver detalhes' },
  { avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=4', name: 'Produto Delta',   category: 'Livros',      price: 'R$ 49,00',  stock: '0',   status: 'inactive', featured: false, active: false, link: 'Ver detalhes' },
  { avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=5', name: 'Produto Epsilon', category: 'Eletrônicos', price: 'R$ 1.299,00', stock: '5', status: 'active',   featured: true,  active: true,  link: 'Ver detalhes' },
  { avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=6', name: 'Produto Zeta',    category: 'Saúde',       price: 'R$ 35,00',  stock: '88', status: 'warning',  featured: false, active: true,  link: 'Ver detalhes' },
];

const statusMap = {
  active:   { label: 'Ativo',    status: 'success' as const },
  inactive: { label: 'Inativo',  status: 'error'   as const },
  warning:  { label: 'Pendente', status: 'warning' as const },
};

const meta: Meta<typeof Table<Product>> = {
  title: 'Components/Table',
  component: Table,
  tags: ['autodocs'],
  decorators: [(S) => <div style={{ padding: 32 }}><S /></div>],
};
export default meta;
type Story = StoryObj<typeof Table<Product>>;

/* ── Default — all column types ─────────────────────────────────────────── */
export const Default: Story = {
  render: () => {
    const [data, setData] = useState(rows);

    const columns = [
      // Avatar
      { key: 'avatar' as const, label: 'Foto',     type: 'avatar' as const, width: 60 },
      // Text
      { key: 'name'   as const, label: 'Produto',  type: 'text'   as const },
      { key: 'category'as const, label: 'Categoria',type: 'text'  as const },
      { key: 'price'  as const, label: 'Preço',    type: 'text'   as const },
      // Badge
      { key: 'status' as const, label: 'Status',   type: 'badge'  as const, statusMap },
      // Toggle — "Ativo"
      {
        key: 'active' as const,
        label: 'Ativo',
        type: 'toggle' as const,
        width: 80,
        onToggle: (row: Product, value: boolean) =>
          setData(d => d.map(r => r.name === row.name ? { ...r, active: value } : r)),
      },
      // Actions
      {
        key: 'name' as const,
        label: 'Ação',
        type: 'actions' as const,
        width: 120,
        actionItems: [
          { icon: <Eye     size={16} />, label: 'Visualizar', onClick: (r: Product) => alert(`Ver: ${r.name}`) },
          { icon: <Pencil  size={16} />, label: 'Editar',     onClick: (r: Product) => alert(`Editar: ${r.name}`) },
          { icon: <Trash2  size={16} />, label: 'Excluir',    onClick: (r: Product) => alert(`Excluir: ${r.name}`), danger: true },
        ],
      },
    ];

    return (
      <Table
        title="Produtos"
        subtitle={`Mostrando ${data.length} de ${data.length} produtos`}
        columns={columns}
        rows={data}
      />
    );
  },
};

/* ── Sortable ────────────────────────────────────────────────────────────── */
export const Sortable: Story = {
  render: () => {
    const [data, setData]       = useState(rows);
    const [sortKey, setSortKey] = useState<keyof Product | undefined>();
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

    const handleSort = (key: keyof Product) => {
      const dir = sortKey === key && sortDir === 'asc' ? 'desc' : 'asc';
      setSortKey(key); setSortDir(dir);
      setData(d => [...d].sort((a, b) =>
        dir === 'asc'
          ? String(a[key]).localeCompare(String(b[key]))
          : String(b[key]).localeCompare(String(a[key]))
      ));
    };

    const columns = [
      { key: 'name'    as const, label: 'Produto',   sortable: true },
      { key: 'category'as const, label: 'Categoria', sortable: true },
      { key: 'price'   as const, label: 'Preço',     sortable: true },
      { key: 'stock'   as const, label: 'Estoque',   sortable: true, align: 'right' as const },
      { key: 'status'  as const, label: 'Status',    type: 'badge' as const, statusMap },
    ];

    return (
      <Table
        title="Produtos"
        subtitle="Clique no cabeçalho para ordenar"
        columns={columns}
        rows={data}
        onSort={handleSort}
        sortKey={sortKey}
        sortDir={sortDir}
      />
    );
  },
};

/* ── Link cells ──────────────────────────────────────────────────────────── */
export const WithLinks: Story = {
  render: () => {
    const columns = [
      { key: 'name'    as const, label: 'Produto',   type: 'text' as const },
      { key: 'category'as const, label: 'Categoria', type: 'text' as const },
      {
        key: 'link' as const,
        label: 'Link',
        type: 'link' as const,
        onLinkClick: (r: Product) => alert(`Navegando para: ${r.name}`),
      },
      { key: 'status' as const, label: 'Status', type: 'badge' as const, statusMap },
      {
        key: 'name' as const,
        label: 'Ação',
        type: 'actions' as const,
        width: 80,
        actionItems: [
          { icon: <MoreHorizontal size={16} />, label: 'Mais opções', onClick: (r: Product) => alert(r.name) },
        ],
      },
    ];
    return <Table title="Produtos" columns={columns} rows={rows} />;
  },
};

/* ── Loading ─────────────────────────────────────────────────────────────── */
export const Loading: Story = {
  render: () => {
    const columns = [
      { key: 'name'    as const, label: 'Produto'   },
      { key: 'category'as const, label: 'Categoria' },
      { key: 'price'   as const, label: 'Preço'     },
      { key: 'status'  as const, label: 'Status'    },
    ];
    return <Table title="Produtos" columns={columns} rows={[]} loading />;
  },
};

/* ── Empty ───────────────────────────────────────────────────────────────── */
export const Empty: Story = {
  render: () => {
    const columns = [
      { key: 'name'    as const, label: 'Produto'   },
      { key: 'category'as const, label: 'Categoria' },
      { key: 'price'   as const, label: 'Preço'     },
      { key: 'status'  as const, label: 'Status'    },
    ];
    return (
      <Table
        title="Produtos"
        subtitle="Nenhum produto cadastrado ainda"
        columns={columns}
        rows={[]}
        emptyMessage="Nenhum produto encontrado. Adicione o primeiro!"
      />
    );
  },
};

/* ── StatusBadge showcase ────────────────────────────────────────────────── */
export const Badges: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: 16 }}>
      <StatusBadge status="success" label="Ativo"     />
      <StatusBadge status="error"   label="Inativo"   />
      <StatusBadge status="warning" label="Pendente"  />
      <StatusBadge status="info"    label="Info"      />
      <StatusBadge status="orange"  label="Em análise"/>
      <StatusBadge status="indigo"  label="Agendado"  />
      <StatusBadge status="violet"  label="Rascunho"  />
      <StatusBadge status="pink"    label="Especial"  />
    </div>
  ),
};
