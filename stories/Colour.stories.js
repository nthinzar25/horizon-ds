import {
  caption,
  chrome,
  contrast,
  grid,
  h,
  onColor,
  page,
  rampOf,
  section,
  startsWith,
  tokensFor,
} from './_lib.js';

export default {
  title: 'Colour',
};

const use = (globals) => {
  chrome();
  return { set: tokensFor(globals), theme: globals.theme ?? 'light' };
};

const valueOf = (set, name) => set.find((t) => t.name === name)?.value;

/** `rgba(10, 16, 35, 0.1299…)` is unreadable under a swatch — show the alpha. */
const shortValue = (v) => {
  const a = String(v).match(/rgba\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\s*\)/i)?.[1];
  return a ? `alpha ${Math.round(parseFloat(a) * 100)}%` : String(v);
};

const ratioBadge = (fg, bg, theme, min) => {
  const r = contrast(fg, bg, theme);
  if (r == null) return null;
  const pass = r >= min;
  return h(
    'span',
    {
      class: 'hz-chip',
      style: {
        background: pass
          ? 'var(--horizon-semantic-color-bg-positive-light)'
          : 'var(--horizon-semantic-color-bg-negative-light)',
        color: pass
          ? 'var(--horizon-semantic-color-text-positive)'
          : 'var(--horizon-semantic-color-text-negative)',
      },
      title: `${r}:1 against the surface it is designed for (needs ${min}:1)`,
    },
    `${r.toFixed(2)}:1 ${pass ? 'pass' : 'fail'}`,
  );
};

// Inverse and on-dark roles are drawn on the inverse surface, so measuring them
// against the page background would report a failure that is not real.
const backdropFor = (name, set) =>
  /inverse|on-dark/.test(name)
    ? valueOf(set, 'horizon-semantic-color-bg-inverse')
    : valueOf(set, 'horizon-semantic-color-bg-base');

// ── Core palette ────────────────────────────────────────────────────────────

const rampsIn = (set) => {
  const ramps = new Map();
  for (const t of startsWith(set, 'horizon-core-color-')) {
    const family = rampOf(t.name);
    if (!family) continue;
    if (!ramps.has(family)) ramps.set(family, []);
    ramps.get(family).push(t);
  }
  // 50, 100 … 1000, with each alpha variant sitting just after its own step.
  for (const steps of ramps.values()) {
    steps.sort((a, b) => {
      const key = (t) => t.name.split('-').at(-1);
      const [ka, kb] = [key(a), key(b)];
      return parseInt(ka, 10) - parseInt(kb, 10) || ka.localeCompare(kb);
    });
  }
  return ramps;
};

export const CorePalette = {
  name: 'Core palette',
  render: (_args, { globals }) => {
    const { set, theme } = use(globals);
    const ramps = rampsIn(set);

    return page(
      'Core palette',
      'The raw ramps. Nothing in a product should reference these directly — ' +
        'they exist so the semantic roles have something to point at. Core ' +
        'colour is the same in both themes; it is the semantic layer that ' +
        'swaps.',
      ...[...ramps].map(([family, steps]) =>
        h(
          'div',
          { class: 'hz-ramp-row' },
          h('div', { class: 'hz-ramp-label' }, family),
          h(
            'div',
            { class: 'hz-ramp' },
            steps.map((t) =>
              h(
                'div',
                {
                  class: 'hz-ramp-chip',
                  style: { background: t.value, color: onColor(t.value, theme) },
                  title: `${t.name}\n${t.value}`,
                },
                t.name.split('-').at(-1),
              ),
            ),
          ),
          h(
            'div',
            { class: 'hz-ramp-hexes' },
            steps.map((t) => h('span', {}, shortValue(t.value))),
          ),
        ),
      ),
    );
  },
};

// ── Semantic roles ──────────────────────────────────────────────────────────

const bgFamily = (name) => {
  const parts = name.replace('horizon-semantic-color-bg-', '').split('-');
  return parts.length > 1 ? parts[0] : 'surfaces';
};

export const Background = {
  name: 'Semantic — background',
  render: (_args, { globals }) => {
    const { set, theme } = use(globals);
    const families = new Map();
    for (const t of startsWith(set, 'horizon-semantic-color-bg-')) {
      const f = bgFamily(t.name);
      if (!families.has(f)) families.set(f, []);
      families.get(f).push(t);
    }

    return page(
      'Semantic background',
      `Surface and fill roles as they resolve in the ${theme} theme. Switch ` +
        'the Theme control in the toolbar to see the dark values.',
      ...[...families].map(([family, tokens]) =>
        section(
          family,
          null,
          grid(
            220,
            ...tokens.map((t) =>
              h(
                'div',
                { class: 'hz-card' },
                h('div', { class: 'hz-swatch', style: { background: t.value } }),
                caption(t, shortValue(t.value)),
              ),
            ),
          ),
        ),
      ),
    );
  },
};

export const Text = {
  name: 'Semantic — text',
  render: (_args, { globals }) => {
    const { set, theme } = use(globals);
    const tokens = startsWith(set, 'horizon-semantic-color-text-');

    return page(
      'Semantic text',
      'Every text role drawn on the surface it is designed for, with its ' +
        'measured contrast. 4.5:1 is the WCAG AA threshold for body text.',
      grid(
        300,
        ...tokens.map((t) => {
          const bg = backdropFor(t.name, set);
          return h(
            'div',
            { class: 'hz-card', style: { background: bg } },
            h(
              'div',
              { class: 'hz-specimen', style: { color: t.value } },
              h('div', { style: { fontSize: '28px', lineHeight: '36px', fontWeight: 500 } }, 'Ag'),
              h('div', { style: { fontSize: '14px' } }, 'The quick brown fox'),
            ),
            h('div', {}, ratioBadge(t.value, bg, theme, 4.5)),
            caption(t),
          );
        }),
      ),
    );
  },
};

export const Icon = {
  name: 'Semantic — icon',
  render: (_args, { globals }) => {
    const { set, theme } = use(globals);
    const tokens = startsWith(set, 'horizon-semantic-color-icon-');

    return page(
      'Semantic icon',
      'Icon roles at 24px — the core icon medium size. Non-text graphics need ' +
        '3:1 against their background under WCAG AA.',
      grid(
        280,
        ...tokens.map((t) => {
          const bg = backdropFor(t.name, set);
          return h(
            'div',
            { class: 'hz-card', style: { background: bg } },
            h(
              'div',
              { style: { display: 'flex', alignItems: 'center', gap: '12px' } },
              // A filled disc and a rule: solid area and thin stroke fail
              // differently, and icons contain both.
              h('span', {
                style: {
                  width: 'var(--horizon-core-size-icon-md)',
                  height: 'var(--horizon-core-size-icon-md)',
                  borderRadius: '50%',
                  background: t.value,
                  flex: '0 0 auto',
                },
              }),
              h('span', {
                style: { flex: '1 1 auto', height: '2px', background: t.value },
              }),
            ),
            h('div', {}, ratioBadge(t.value, bg, theme, 3)),
            caption(t),
          );
        }),
      ),
    );
  },
};

export const Border = {
  name: 'Semantic — border',
  render: (_args, { globals }) => {
    const { set, theme } = use(globals);
    const tokens = startsWith(set, 'horizon-semantic-color-border-');

    return page(
      'Semantic border',
      'Border roles at the 1px core width, on the page surface.',
      grid(
        260,
        ...tokens.map((t) => {
          const bg = valueOf(set, 'horizon-semantic-color-bg-base');
          return h(
            'div',
            { class: 'hz-card' },
            h('div', {
              style: {
                height: '56px',
                borderRadius: 'var(--horizon-semantic-border-radius-sm)',
                border: `var(--horizon-core-border-width-1) solid ${t.value}`,
                background: 'var(--horizon-semantic-color-bg-base)',
              },
            }),
            h('div', {}, ratioBadge(t.value, bg, theme, 3)),
            caption(t),
          );
        }),
      ),
    );
  },
};

// ── Light / dark parity ─────────────────────────────────────────────────────

export const ThemeComparison = {
  name: 'Light / dark parity',
  render: () => {
    chrome();
    const lightSet = tokensFor({ theme: 'light' });
    const darkSet = tokensFor({ theme: 'dark' });
    const names = startsWith(lightSet, 'horizon-semantic-color-').map((t) => t.name);
    const byName = (set) => new Map(set.map((t) => [t.name, t]));
    const [l, d] = [byName(lightSet), byName(darkSet)];

    const cell = (t) =>
      t &&
      h(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
        h('span', {
          style: {
            width: '28px',
            height: '20px',
            flex: '0 0 auto',
            borderRadius: '4px',
            background: t.value,
            border: '1px solid var(--horizon-semantic-color-border-secondary)',
          },
        }),
        h('code', {}, shortValue(t.value)),
      );

    return page(
      'Light / dark parity',
      'Every semantic colour side by side across both themes, so a role that ' +
        'was never given a dark value is easy to spot — it shows the same ' +
        'swatch twice.',
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
            h('th', {}, 'Light'),
            h('th', {}, 'Dark'),
            h('th', {}, 'Differs'),
          ),
        ),
        h(
          'tbody',
          {},
          names.map((n) => {
            const lt = l.get(n);
            const dt = d.get(n);
            const differs = lt && dt && lt.value !== dt.value;
            return h(
              'tr',
              {},
              h('td', {}, h('code', {}, n)),
              h('td', {}, cell(lt)),
              h('td', {}, cell(dt)),
              h(
                'td',
                {
                  style: {
                    color: differs
                      ? 'var(--horizon-semantic-color-text-secondary)'
                      : 'var(--horizon-semantic-color-text-warning)',
                  },
                },
                differs ? 'yes' : 'same',
              ),
            );
          }),
        ),
      ),
    );
  },
};
