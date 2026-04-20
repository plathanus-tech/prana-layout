import type { Meta, StoryObj } from '@storybook/react';
import { Home, ShoppingBag, Shirt } from 'lucide-react';
import { Breadcrumb } from './Breadcrumb';

const meta: Meta<typeof Breadcrumb> = {
  title: 'Components/Breadcrumb',
  component: Breadcrumb,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Breadcrumb>;

export const Default: Story = {
  args: {
    items: [
      { label: 'Home', href: '#' },
      { label: 'Produtos', href: '#' },
      { label: 'Camiseta' },
    ],
  },
};

export const WithIcon: Story = {
  args: {
    items: [
      { label: 'Home', href: '#' },
      { label: 'Loja', href: '#' },
      { label: 'Camiseta Branca', icon: <Shirt size={16} /> },
    ],
  },
};

export const LongPath: Story = {
  args: {
    items: [
      { label: 'Home', href: '#' },
      { label: 'Loja', href: '#' },
      { label: 'Roupas', href: '#' },
      { label: 'Feminino', href: '#' },
      { label: 'Camiseta Branca', icon: <Shirt size={16} /> },
    ],
  },
};

export const TwoItems: Story = {
  args: {
    items: [
      { label: 'Home', href: '#' },
      { label: 'Sobre' },
    ],
  },
};

export const OneItem: Story = {
  args: {
    items: [
      { label: 'Home', icon: <Home size={16} /> },
    ],
  },
};
