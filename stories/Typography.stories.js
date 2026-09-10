import {
  MODES,
  caption,
  chrome,
  grid,
  h,
  ofType,
  page,
  px,
  section,
  startsWith,
  tokensFor,
} from './_lib.js';

export default {
  title: 'Typography',
};

const use = (globals) => {
  chrome();
  return { set: tokensFor(globals), mode: globals.mode ?? 'web' };
};

const SAMPLE = 'Horizon design system';

// Display and Headline are the M3 "brand" roles; everything else is "plain".
const familyFor = (role) =>
  role === 'display' || role === 'headline'
    ? 'var(--horizon-type-fontfamily-brand)'
    : 'var(--horizon-type-fontfamily-plain)';

/**
 * The scale ships as three separate atomic tokens per step
 * (`…-body-md-size`, `…-lineheight`, `…-tracking`). Reassemble them so a step
 * can be rendered as the one thing a designer thinks of it as.
 */
const scaleSteps = (set) => {
  const steps = new Map();
  for (const t of startsWith(set, 'horizon-type-')) {
    const m = t.name.match(/^horizon-type-([a-z]+)-(lg|md|sm)-(size|lineheight|tracking)$/);
    if (!m) continue;
    const [, role, size, field] = m;
    const key = `${role}-${size}`;
    if (!steps.has(key)) steps.set(key, { key, role, size, fields: {} });
    steps.get(key).fields[field] = t;
  }
  return [...steps.values()];
};

export const FontFamilies = {
  name: 'Font families',
  render: (_args, { globals }) => {
    const { set } = use(globals);
    const families = startsWith(set, 'horizon-type-fontfamily-');

    return page(
      'Font families',
      'Three families: the M3 brand and plain roles, plus the logo face. ' +
        'The gallery loads them from Google Fonts, so a specimen that falls ' +
        'back to a system face means the webfont did not load.',
      grid(
        320,
        ...families.map((t) =>
          h(
            'div',
            { class: 'hz-card' },
            h(
              'div',
              {
                class: 'hz-specimen',
                style: {
                  fontFamily: `${JSON.stringify(t.value)}, system-ui, sans-serif`,
                  fontSize: '30px',
                  lineHeight: '40px',
                },
              },
              SAMPLE,
            ),
            h(
              'div',
              {
                style: {
                  fontFamily: `${JSON.stringify(t.value)}, system-ui, sans-serif`,
                  color: 'var(--horizon-semantic-color-text-secondary)',
                },
              },
              'ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789',
            ),
            caption(t),
          ),
        ),
      ),
    );
  },
};

export const TypeScale = {
  name: 'Type scale',
  render: (_args, { globals }) => {
    const { set, mode } = use(globals);
    const steps = scaleSteps(set);

    return page(
      'Type scale',
      `The atomic size, line-height and tracking tokens for the ${mode} mode, ` +
        'rendered at their real values. Change the Mode control in the ' +
        'toolbar to compare against mobile and back office.',
      ...steps.map((step) => {
        const size = step.fields.size?.value;
        const lineHeight = step.fields.lineheight?.value;
        const tracking = step.fields.tracking?.value;
        return h(
          'div',
          { class: 'hz-card' },
          h(
            'div',
            {
              class: 'hz-specimen',
              style: {
                fontFamily: `${familyFor(step.role)}, system-ui, sans-serif`,
                fontSize: size,
                lineHeight,
                letterSpacing: tracking,
              },
            },
            `${step.role} ${step.size} — ${SAMPLE}`,
          ),
          h(
            'div',
            { class: 'hz-caption' },
            h(
              'span',
              { class: 'hz-value' },
              `${px(size)}/${px(lineHeight)} · tracking ${px(tracking)}`,
            ),
            h(
              'code',
              { class: 'hz-name' },
              Object.values(step.fields)
                .map((t) => t.name)
                .join('  ·  '),
            ),
          ),
        );
      }),
    );
  },
};

export const TextStyles = {
  name: 'Text styles',
  render: (_args, { globals }) => {
    const { set } = use(globals);
    const styles = ofType(set, 'typography');

    return page(
      'Text styles',
      'The composite styles from the Figma text-style library — family, ' +
        'weight, size, line-height and tracking in one token. These are what a ' +
        'product surface should reach for; the atomic scale above exists to ' +
        'build them.',
      ...styles.map((t) =>
        h(
          'div',
          { class: 'hz-card' },
          h(
            'div',
            {
              class: 'hz-specimen',
              style: {
                fontFamily: `${JSON.stringify(t.value.fontFamily)}, system-ui, sans-serif`,
                fontWeight: t.value.fontWeight,
                fontSize: t.value.fontSize,
                lineHeight: t.value.lineHeight,
                letterSpacing: t.value.letterSpacing,
              },
            },
            `${t.name} — ${SAMPLE}`,
          ),
          h(
            'div',
            { class: 'hz-caption' },
            h('code', { class: 'hz-name' }, t.name),
            h(
              'span',
              { class: 'hz-value' },
              `${t.value.fontFamily} ${t.value.fontWeight} · ` +
                `${px(t.value.fontSize)}/${px(t.value.lineHeight)} · ` +
                `tracking ${px(t.value.letterSpacing)}`,
            ),
            t.description &&
              h(
                'span',
                { class: 'hz-desc', title: t.description },
                t.description.split('\n').slice(-1)[0],
              ),
          ),
        ),
      ),
    );
  },
};

export const ScaleAcrossModes = {
  name: 'Scale across modes',
  render: () => {
    chrome();
    const sets = Object.fromEntries(MODES.map((m) => [m, scaleSteps(tokensFor({ mode: m }))]));
    const keys = sets[MODES[0]].map((s) => s.key);
    const lookup = Object.fromEntries(
      MODES.map((m) => [m, new Map(sets[m].map((s) => [s.key, s]))]),
    );

    const cellText = (step) =>
      step
        ? `${px(step.fields.size?.value)}/${px(step.fields.lineheight?.value)}` +
          ` · ${px(step.fields.tracking?.value)}`
        : '—';

    return page(
      'Scale across modes',
      'Size / line-height · tracking for every step in all three modes. ' +
        'Mobile and back office have no CSS build of their own — this table ' +
        'and the JSON behind it are the only place those values are visible.',
      h(
        'table',
        { class: 'hz-table' },
        h(
          'thead',
          {},
          h('tr', {}, h('th', {}, 'Step'), ...MODES.map((m) => h('th', {}, m))),
        ),
        h(
          'tbody',
          {},
          keys.map((key) =>
            h(
              'tr',
              {},
              h('td', {}, h('code', {}, key)),
              ...MODES.map((m) =>
                h('td', { class: 'hz-num' }, cellText(lookup[m].get(key))),
              ),
            ),
          ),
        ),
      ),
      section(
        null,
        null,
        h(
          'p',
          { class: 'hz-note' },
          'The three modes are separate Figma collections, not a responsive ' +
            'scale — a step can move independently in each. A step that reads ' +
            'identically across all three columns is worth a second look.',
        ),
      ),
    );
  },
};
