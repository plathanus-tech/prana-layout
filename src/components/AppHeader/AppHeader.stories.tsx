import type { Meta, StoryObj } from '@storybook/react';
import { AppHeader } from './AppHeader';

const meta: Meta<typeof AppHeader> = {
  title: 'Components/AppHeader',
  component: AppHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Header da área pública (beneficiário e profissional). Exibe a logo centralizada, sticky no topo com sombra sutil. Use em todas as telas acessadas via link direto pelo usuário final.',
      },
    },
  },
  argTypes: {
    logoSrc: { control: 'text' },
    logoAlt: { control: 'text' },
  },
};
export default meta;
type Story = StoryObj<typeof AppHeader>;

export const Default: Story = {};

export const MobileFrame: Story = {
  render: (args) => (
    <div style={{ maxWidth: 375, margin: '0 auto', border: '1px solid #eee' }}>
      <AppHeader {...args} />
    </div>
  ),
  parameters: {
    docs: {
      description: { story: 'Header em viewport mobile (375px), como aparece no protótipo do beneficiário.' },
    },
  },
};

export const DesktopFrame: Story = {
  render: (args) => (
    <div style={{ width: '100%' }}>
      <AppHeader {...args} />
    </div>
  ),
  parameters: {
    docs: {
      description: { story: 'Header em viewport desktop, expandido à largura total.' },
    },
  },
};
