import { chrome, h, page, section, tokensFor } from './_lib.js';

export default {
  title: 'Overview',
};

const preview = (token) => {
  if (token.type === 'color') {
    return h('span', {
      style: {
        display: 'inline-block',
        width: '28px',
        height: '18px',
        borderRadius: '4px',
        background: token.value,
        border: '1px solid var(--horizon-semantic-color-border-secondary)',
      },
    });
  }
  if (token.type === 'gradient') {
    return h('span', {
      style: {
        display: 'inline-block',
        width: '28px',
        height: '18px',
        borderRadius: '4px',
        background: token.value,
        border: '1px solid var(--horizon-semantic-color-border-secondary)',
      },
    });
  }
  if (token.type === 'shadow') {
    return h('span', {
      style: {
        display: 'inline-block',
        width: '28px',
        height: '18px',
        borderRadius: '4px',
        background: 'var(--horizon-semantic-color-bg-base)',
        boxShadow: token.value,
      },
    });
  }
  return null;
};

const valueText = (token) =>
  token.type === 'typography'
    ? `${token.value.fontFamily} ${token.value.fontWeight} · ` +
      `${token.value.fontSize}/${token.value.lineHeight} · ${token.value.letterSpacing}`
    : String(token.value);

export const AllTokens = {
  name: 'All tokens',
  render: (_args, { globals }) => {
    chrome();
    const theme = globals.theme ?? 'light';
    const mode = globals.mode ?? 'web';
    const set = tokensFor(globals);

    const counts = set.reduce((acc, t) => {
      acc[t.source] = (acc[t.source] ?? 0) + 1;
      return acc;
    }, {});

    const rows = set.map((t) => ({
      token: t,
      // One lowercase haystack per row so filtering is a single substring test.
      haystack: [t.name, t.type, valueText(t), t.alias, t.source, t.description]
        .filter(Boolean)
        .join(' ')
        .toLowerCase(),
      el: h(
        'tr',
        {},
        h('td', {}, h('code', {}, t.name)),
        h('td', {}, t.type),
        h(
          'td',
          { class: 'hz-num' },
          h(
            'span',
            { style: { display: 'inline-flex', alignItems: 'center', gap: '8px' } },
            preview(t),
            h('span', {}, valueText(t)),
          ),
        ),
        h('td', {}, t.alias ? h('code', {}, t.alias) : '—'),
        h('td', {}, t.source.replace('.tokens.json', '')),
      ),
    }));

    const tbody = h('tbody', {}, rows.map((r) => r.el));

    const count = h(
      'p',
      { class: 'hz-blurb' },
      `${set.length} tokens · theme ${theme} · mode ${mode}`,
    );

    const search = h('input', {
      class: 'hz-input',
      type: 'search',
      placeholder: 'Filter by name, value, alias, type or source…',
      'aria-label': 'Filter tokens',
    });

    search.addEventListener('input', () => {
      const q = search.value.trim().toLowerCase();
      let shown = 0;
      for (const r of rows) {
        const match = !q || r.haystack.includes(q);
        r.el.hidden = !match;
        if (match) shown += 1;
      }
      count.textContent =
        `${shown} of ${set.length} tokens · theme ${theme} · mode ${mode}`;
    });

    return page(
      'All tokens',
      'Every token in the set for the current theme and mode, with the alias ' +
        'it resolves through. This is the whole surface the Figma export ' +
        'produces — if something is missing here, it is missing from the ' +
        'pipeline.',
      section(
        null,
        null,
        search,
        count,
        h(
          'table',
          { class: 'hz-table' },
          h(
            'thead',
            {},
            h(
              'tr',
              {},
              h('th', {}, 'Token'),
              h('th', {}, 'Type'),
              h('th', {}, 'Value'),
              h('th', {}, 'Alias'),
              h('th', {}, 'Source'),
            ),
          ),
          tbody,
        ),
      ),
      section(
        'By source file',
        'Which Figma collection each token came out of.',
        h(
          'table',
          { class: 'hz-table' },
          h('thead', {}, h('tr', {}, h('th', {}, 'File'), h('th', {}, 'Tokens'))),
          h(
            'tbody',
            {},
            Object.entries(counts).map(([file, n]) =>
              h('tr', {}, h('td', {}, h('code', {}, file)), h('td', { class: 'hz-num' }, n)),
            ),
          ),
        ),
      ),
    );
  },
};
