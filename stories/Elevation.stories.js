import {
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
  title: 'Elevation',
};

const use = (globals) => {
  chrome();
  return { set: tokensFor(globals), theme: globals.theme ?? 'light' };
};

export const Shadows = {
  name: 'Shadows',
  render: (_args, { globals }) => {
    const { set, theme } = use(globals);
    const shadows = ofType(set, 'shadow');

    return page(
      'Elevation',
      'The five M3 elevation levels as they ship — each is a two-part shadow, ' +
        'a tight key light over a wider ambient one.',
      grid(
        260,
        ...shadows.map((t) =>
          h(
            'div',
            { style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
            h(
              'div',
              {
                style: {
                  height: '120px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 'var(--horizon-semantic-border-radius-md)',
                  background: 'var(--horizon-semantic-color-bg-base)',
                  boxShadow: t.value,
                  fontWeight: 500,
                },
              },
              t.name.replace('elevation-level-', 'Level '),
            ),
            caption(t, t.description?.split('\n')[1] ?? ''),
          ),
        ),
      ),
      theme === 'dark' &&
        h(
          'p',
          { class: 'hz-note' },
          'The shadow tokens have a single value shared by both themes — they ' +
            'are built from a fixed near-black at 25% and 13%. On the dark ' +
            'surface above they are close to invisible, which is why M3 pairs ' +
            'elevation with a surface tint. There is no tint token in the set ' +
            'yet, so dark elevation currently reads only through the shadow.',
        ),
    );
  },
};

export const Scale = {
  name: 'Elevation scale',
  render: (_args, { globals }) => {
    const { set } = use(globals);
    const levels = startsWith(set, 'horizon-core-elevation-');

    return page(
      'Elevation scale',
      'The raw dp values behind the shadows. Level 0 is flat — filled ' +
        'buttons and outlined cards — and level 5 is the highest surface in ' +
        'the system.',
      section(
        null,
        null,
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
              h('th', {}, 'dp'),
              h('th', {}, 'Used for'),
            ),
          ),
          h(
            'tbody',
            {},
            levels.map((t) =>
              h(
                'tr',
                {},
                h('td', {}, h('code', {}, t.name)),
                h('td', { class: 'hz-num' }, px(t.value)),
                h('td', {}, t.description?.split('\n').slice(-1)[0] ?? ''),
              ),
            ),
          ),
        ),
      ),
    );
  },
};
