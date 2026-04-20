import type { Preview } from '@storybook/react';
import '../src/tokens/tokens.css';

function applyTheme(theme: string) {
  document.body.setAttribute('data-theme', theme);
  document.body.style.background = theme === 'dark'
    ? 'var(--color-bg-default)'
    : 'var(--color-bg-default)';
  const root = document.getElementById('storybook-root');
  if (root) root.setAttribute('data-theme', theme);
}

const preview: Preview = {
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Light / Dark mode',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'sun',  title: 'Light' },
          { value: 'dark',  icon: 'moon', title: 'Dark'  },
        ],
        showName: true,
        dynamicTitle: true,
      },
    },
  },

  decorators: [
    (StoryFn, context) => {
      const theme = (context.globals['theme'] as string) ?? 'light';
      applyTheme(theme);
      return StoryFn();
    },
  ],

  parameters: {
    layout: 'centered',
    backgrounds: { disable: true },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: { test: 'todo' },
  },
};

export default preview;
