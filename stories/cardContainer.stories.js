// Figma: https://www.figma.com/design/rNvqAd4seXS0YvZp1QhJ96/Horizon-Stays-Components-Library?node-id=188-7377
// Matrix: state (idle, hover) × hasSlot (false, true) = 4. The Figma sticker
// grid also crosses state with the layout's orientation; that is `Grid`.

import { cardContainer } from '../src/components/cardContainer/cardContainer.js';
import { item, LISTING, PHOTO, slotPlaceholder, stage, WIDTH } from './_stage.js';

export default {
  title: 'Components/cardContainer',
};

// The container adds 16px of horizontal padding either side of the layout.
const width = (orientation) => WIDTH[orientation] + 32;

const build = (state, hasSlot, orientation = 'vertical') =>
  cardContainer({
    state,
    hasSlot,
    slot: hasSlot ? slotPlaceholder() : undefined,
    layout: { orientation, image: { src: PHOTO }, text: LISTING },
  });

const label = (state, hasSlot) => `state=${state} hasSlot=${hasSlot}`;

const one = (state, hasSlot) => ({
  name: `${state} · hasSlot=${hasSlot}`,
  render: () => stage(item(label(state, hasSlot), width('vertical'), build(state, hasSlot))),
});

export const Idle = one('idle', false);
export const IdleWithSlot = one('idle', true);
export const Hover = one('hover', false);
export const HoverWithSlot = one('hover', true);

export const Matrix = {
  render: () =>
    stage(
      ...['idle', 'hover'].flatMap((state) =>
        [false, true].map((hasSlot) =>
          item(label(state, hasSlot), width('vertical'), build(state, hasSlot)),
        ),
      ),
    ),
};

/** The Figma sticker grid: orientation across, state down. */
export const Grid = {
  render: () =>
    stage(
      ...['idle', 'hover'].flatMap((state) =>
        ['vertical', 'horizontal'].map((orientation) =>
          item(`${orientation} · ${state}`, width(orientation), build(state, false, orientation)),
        ),
      ),
    ),
};

/** Hover, focus and the favourite toggle all behave — tab into the card. */
export const Interactive = {
  render: () => {
    const toggle = (e) => {
      const b = e.currentTarget;
      const next = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed', String(next));
      b.dataset.variant = next ? 'active' : 'outline';
    };
    const card = cardContainer({
      layout: {
        image: { src: PHOTO, favourite: { variant: 'outline', pressed: false, onClick: toggle } },
        text: LISTING,
      },
    });
    return stage(item('hover me · tab to the favourite · click it', width('vertical'), card));
  },
};
