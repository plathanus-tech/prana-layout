import type { Meta, StoryObj } from '@storybook/react';
import { Accordion } from './Accordion';

const items = [
  { title: 'O que é o Prana Design System?', content: 'O Prana Design System é uma biblioteca de componentes e tokens de design criada para padronizar a experiência visual dos produtos Prana.' },
  { title: 'Como instalar os componentes?', content: 'Importe diretamente do pacote: `import { Button } from "@prana/design-system"`. Certifique-se de importar também o arquivo de tokens CSS.' },
  { title: 'Suporte a dark mode?', content: 'Sim. Todos os tokens semânticos possuem versões Light e Dark configuradas no Figma, prontas para serem usadas com `prefers-color-scheme` ou um seletor de tema.' },
];

const meta: Meta<typeof Accordion> = {
  title: 'Components/Accordion',
  component: Accordion,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ width: 480 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof Accordion>;

export const Default: Story = { args: { items } };
export const DefaultOpen: Story = { args: { items, defaultOpenIndex: [0] } };
export const AllowMultiple: Story = { args: { items, allowMultiple: true, defaultOpenIndex: [0, 1] } };
