import '../build/css/tokens.css';
import '../build/css/tokens-dark.css';

/** @type {import('@storybook/html-vite').Preview} */
const preview = {
  parameters: {
    // The stories paint their own themed surface, so Storybook must not put a
    // fixed white canvas behind them.
    layout: 'fullscreen',
    controls: { disable: true },
    options: {
      storySort: {
        order: [
          'Overview',
          'Colour',
          'Typography',
          'Spacing & Layout',
          'Elevation',
        ],
      },
    },
  },

  globalTypes: {
    theme: {
      description: 'Colour theme',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
    mode: {
      description: 'Size and type mode',
      toolbar: {
        title: 'Mode',
        icon: 'component',
        items: [
          { value: 'web', title: 'Web' },
          { value: 'mobile', title: 'Mobile' },
          { value: 'back-office', title: 'Back office' },
        ],
        dynamicTitle: true,
      },
    },
  },

  initialGlobals: { theme: 'light', mode: 'web' },

  decorators: [
    (story, context) => {
      const content = story();
      // `data-theme` is what tokens-dark.css keys off; custom properties
      // inherit, so setting it on the wrapper re-themes everything inside.
      const wrap = document.createElement('div');
      wrap.setAttribute('data-theme', context.globals.theme);
      wrap.className = 'hz-canvas';
      wrap.append(content instanceof Node ? content : String(content));
      return wrap;
    },
  ],
};

export default preview;
