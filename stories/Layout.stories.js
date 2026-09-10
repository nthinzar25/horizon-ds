import {
  MODES,
  caption,
  chrome,
  grid,
  h,
  page,
  px,
  section,
  startsWith,
  suffix,
  tokensFor,
} from './_lib.js';

export default {
  title: 'Spacing & Layout',
};

const use = (globals) => {
  chrome();
  return { set: tokensFor(globals), mode: globals.mode ?? 'web' };
};

/** A labelled bar whose width is the token's own value. */
const scaleRows = (tokens, prefix) => {
  const widest = Math.max(1, ...tokens.map((t) => px(t.value)));
  return tokens.map((t) =>
    h(
      'div',
      { class: 'hz-scale-row', title: t.name },
      h('code', { class: 'hz-name' }, suffix(t.name, prefix)),
      h('div', {
        class: 'hz-bar',
        // Scale to the widest step so the ratios stay honest at any container
        // width, rather than clipping the large end.
        style: { width: `${(px(t.value) / widest) * 100}%` },
      }),
      h('span', { class: 'hz-value' }, t.value),
    ),
  );
};

export const Spacing = {
  name: 'Spacing scale',
  render: (_args, { globals }) => {
    const { set, mode } = use(globals);
    const core = startsWith(set, 'horizon-core-spacing-');
    const semantic = startsWith(set, 'horizon-semantic-spacing-');

    const gaps = semantic.filter((t) => t.name.includes('-gap-'));
    const paddings = semantic.filter((t) => t.name.includes('-padding-'));
    const margins = semantic.filter((t) => t.name.includes('-margin-'));
    const rest = semantic.filter(
      (t) => !gaps.includes(t) && !paddings.includes(t) && !margins.includes(t),
    );

    return page(
      'Spacing',
      `The ${mode} spacing scale. The core steps are the raw ramp; the ` +
        'semantic roles below name the job each step does.',
      section('Core scale', null, ...scaleRows(core, 'horizon-core-spacing')),
      section(
        'Padding',
        'Space inside a container.',
        ...scaleRows(paddings, 'horizon-semantic-spacing-padding'),
      ),
      section(
        'Gap',
        'Space between siblings — inline, stacked, between groups, between sections.',
        ...scaleRows(gaps, 'horizon-semantic-spacing-gap'),
      ),
      section(
        'Window margins',
        'M3 window margins, one per breakpoint.',
        ...scaleRows(margins, 'horizon-semantic-spacing-margin'),
      ),
      rest.length && section('Other', null, ...scaleRows(rest, 'horizon-semantic-spacing')),
    );
  },
};

export const Sizing = {
  name: 'Sizing',
  render: (_args, { globals }) => {
    const { set, mode } = use(globals);
    const icons = startsWith(set, 'horizon-core-size-icon-');
    const controls = startsWith(set, 'horizon-semantic-size-');

    return page(
      'Sizing',
      `Icon sizes and control heights in the ${mode} mode, drawn at their ` +
        'real dimensions.',
      section(
        'Icon sizes',
        null,
        h(
          'div',
          {
            style: {
              display: 'flex',
              alignItems: 'flex-end',
              gap: 'var(--horizon-semantic-spacing-gap-group)',
              flexWrap: 'wrap',
            },
          },
          ...icons.map((t) =>
            h(
              'div',
              { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
              h('div', {
                style: {
                  width: t.value,
                  height: t.value,
                  borderRadius: 'var(--horizon-semantic-border-radius-xs)',
                  background: 'var(--horizon-semantic-color-bg-primary-idle)',
                },
              }),
              caption(t),
            ),
          ),
        ),
      ),
      section(
        'Control heights',
        null,
        grid(
          280,
          ...controls.map((t) =>
            h(
              'div',
              { class: 'hz-card' },
              h(
                'div',
                {
                  style: {
                    height: t.value,
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 var(--horizon-semantic-spacing-padding-control)',
                    borderRadius: 'var(--horizon-semantic-border-radius-sm)',
                    background: 'var(--horizon-semantic-color-bg-primary-idle)',
                    color: 'var(--horizon-semantic-color-text-inverse-default)',
                    fontSize: 'var(--horizon-type-button-md-size)',
                    fontWeight: 500,
                  },
                },
                `${px(t.value)}px tall`,
              ),
              caption(t),
            ),
          ),
        ),
      ),
    );
  },
};

export const Radius = {
  name: 'Corner radius',
  render: (_args, { globals }) => {
    const { set } = use(globals);
    const core = startsWith(set, 'horizon-core-border-radius-');
    const semantic = startsWith(set, 'horizon-semantic-border-radius-');

    const swatches = (tokens) =>
      grid(
        180,
        ...tokens.map((t) =>
          h(
            'div',
            { class: 'hz-card' },
            h('div', {
              style: {
                height: '84px',
                borderRadius: t.value,
                background: 'var(--horizon-semantic-color-bg-primary-light)',
                border:
                  'var(--horizon-core-border-width-2) solid ' +
                  'var(--horizon-semantic-color-border-brand-default)',
              },
            }),
            caption(t),
          ),
        ),
      );

    return page(
      'Corner radius',
      'The M3 shape scale. The semantic roles alias the core steps one to one ' +
        'today — the indirection is there so a product surface can be ' +
        'retuned without touching the ramp.',
      section('Semantic', null, swatches(semantic)),
      section('Core', null, swatches(core)),
    );
  },
};

export const BorderWidth = {
  name: 'Border width',
  render: (_args, { globals }) => {
    const { set } = use(globals);
    const widths = startsWith(set, 'horizon-core-border-width-');

    return page(
      'Border width',
      'Three widths. 0.5px renders as a hairline on a 2× display and rounds ' +
        'up to 1px on a 1× one.',
      grid(
        220,
        ...widths.map((t) =>
          h(
            'div',
            { class: 'hz-card' },
            h('div', {
              style: {
                height: '64px',
                borderRadius: 'var(--horizon-semantic-border-radius-sm)',
                border: `${t.value} solid var(--horizon-semantic-color-border-inverse)`,
              },
            }),
            caption(t),
          ),
        ),
      ),
    );
  },
};

export const Breakpoints = {
  name: 'Breakpoints & grid',
  render: (_args, { globals }) => {
    const { set } = use(globals);
    const all = startsWith(set, 'horizon-core-size-breakpoint-');
    const columns = all.filter((t) => t.name.includes('-columns-'));
    const widths = all.filter((t) => !t.name.includes('-columns-'));
    const gaps = startsWith(set, 'horizon-semantic-spacing-gap-');
    const margins = startsWith(set, 'horizon-semantic-spacing-margin-');

    const at = (tokens, band) => tokens.find((t) => t.name.endsWith(`-${band}`));
    const bands = widths.map((t) => t.name.replace('horizon-core-size-breakpoint-', ''));

    return page(
      'Breakpoints & grid',
      'The five M3 window classes with the column count, window margin and ' +
        'gutter that go with each.',
      h(
        'table',
        { class: 'hz-table' },
        h(
          'thead',
          {},
          h(
            'tr',
            {},
            h('th', {}, 'Window class'),
            h('th', {}, 'From'),
            h('th', {}, 'Columns'),
            h('th', {}, 'Margin'),
            h('th', {}, 'Gutter'),
          ),
        ),
        h(
          'tbody',
          {},
          bands.map((band) =>
            h(
              'tr',
              {},
              h('td', {}, band),
              h('td', { class: 'hz-num' }, at(widths, band)?.value ?? '—'),
              h('td', { class: 'hz-num' }, px(at(columns, band)?.value) || '—'),
              h('td', { class: 'hz-num' }, at(margins, band)?.value ?? '—'),
              h('td', { class: 'hz-num' }, at(gaps, band)?.value ?? '—'),
            ),
          ),
        ),
      ),
      h(
        'p',
        { class: 'hz-note' },
        'The column-count tokens are typed as dimensions in Figma, so they ' +
          'come through the pipeline as "4px" and "12px" when what they mean ' +
          'is 4 and 12 columns. Harmless in the table above, but they will ' +
          'land in the CSS build as lengths — worth retyping at the source.',
      ),
    );
  },
};

export const AcrossModes = {
  name: 'Spacing across modes',
  render: () => {
    chrome();
    const sets = Object.fromEntries(MODES.map((m) => [m, tokensFor({ mode: m })]));
    const names = startsWith(
      sets[MODES[0]],
      'horizon-core-spacing-',
      'horizon-core-size-',
      'horizon-semantic-spacing-',
      'horizon-semantic-size-',
    ).map((t) => t.name);
    const lookup = Object.fromEntries(
      MODES.map((m) => [m, new Map(sets[m].map((t) => [t.name, t]))]),
    );

    return page(
      'Spacing across modes',
      'Every spacing and sizing token in all three modes. Only the CSS build ' +
        'carries the web column; mobile reaches iOS and Android, and back ' +
        'office has no generated output at all yet.',
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
            ...MODES.map((m) => h('th', {}, m)),
            h('th', {}, 'Varies'),
          ),
        ),
        h(
          'tbody',
          {},
          names.map((n) => {
            const values = MODES.map((m) => lookup[m].get(n)?.value ?? '—');
            const varies = new Set(values).size > 1;
            return h(
              'tr',
              {},
              h('td', {}, h('code', {}, n)),
              ...values.map((v) => h('td', { class: 'hz-num' }, v)),
              h(
                'td',
                {
                  style: {
                    color: varies
                      ? 'var(--horizon-semantic-color-text-brand)'
                      : 'var(--horizon-semantic-color-text-secondary)',
                  },
                },
                varies ? 'yes' : '—',
              ),
            );
          }),
        ),
      ),
    );
  },
};
