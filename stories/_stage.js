// Scaffolding for component stories — a labelled stage that pins a component
// at the width its Figma node is drawn at. The widths here are story-only:
// components themselves are fluid and never carry a fixed width.
// Not a story file — `.storybook/main.js` only globs `*.stories.js`.

import { h } from '../src/lib/h.js';
import { chrome } from './_lib.js';

const STAGE_CSS = `
.hz-stage { display: flex; flex-wrap: wrap; align-items: flex-start;
  gap: var(--horizon-semantic-spacing-gap-group); }
.hz-stage-item { display: flex; flex-direction: column;
  gap: var(--horizon-semantic-spacing-gap-inline); }
.hz-stage-label { margin: 0;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: var(--horizon-type-label-sm-size);
  line-height: var(--horizon-type-label-sm-lineheight);
  color: var(--horizon-semantic-color-text-secondary); }
.hz-stage-box { width: var(--w, auto); }
.hz-stage-slot { display: flex; align-items: center; justify-content: center;
  box-sizing: border-box; width: 100%; height: 59px;
  border: var(--horizon-core-border-width-1) dashed
          var(--horizon-semantic-color-border-brand-default);
  border-radius: var(--horizon-semantic-border-radius-sm);
  color: var(--horizon-semantic-color-text-brand);
  font-size: var(--horizon-type-label-md-size);
  line-height: var(--horizon-type-label-md-lineheight); }
`;

let injected = false;
export const stageChrome = () => {
  if (injected) return;
  injected = true;
  document.head.append(h('style', { 'data-hz': 'stage' }, STAGE_CSS));
};

/** One labelled item: `label` above a box `width` px wide holding `node`. */
export const item = (label, width, node) =>
  h(
    'div',
    { class: 'hz-stage-item' },
    h('p', { class: 'hz-stage-label' }, label),
    h('div', { class: 'hz-stage-box', style: { '--w': width ? `${width}px` : null } }, node),
  );

/** A row of items. */
export const stage = (...items) => {
  chrome();
  stageChrome();
  return h('div', { class: 'hz-stage' }, ...items);
};

/** The 59px slot placeholder Figma draws where consumers put their content. */
export const slotPlaceholder = () => h('div', { class: 'hz-stage-slot' }, 'Slot');

/** The listing copy used in every Figma instance. */
export const LISTING = {
  title: 'Casa do Bairro',
  subtitle: 'Alfama, Lisbon · 1.2 km from centre',
  rating: '4.7',
  reviews: '(318 reviews)',
  priceText: '121 EUR',
  priceUnit: 'per night',
};

/** The listing photo from the Figma file (stories only). */
export const PHOTO = new URL('./assets/card-photo.jpg', import.meta.url).href;

/** Figma draws the vertical card at 280.5px and the horizontal at 556.5px. */
export const WIDTH = { vertical: 281, horizontal: 557 };
