// Figma: https://www.figma.com/design/rNvqAd4seXS0YvZp1QhJ96/Horizon-Stays-Components-Library?node-id=170-1728
// Matrix: orientation (vertical, horizontal) × hasSlot (false, true) = 4.

import { cardLayout } from '../src/components/cardLayout/cardLayout.js';
import { item, LISTING, PHOTO, slotPlaceholder, stage, WIDTH } from './_stage.js';

export default {
  title: 'Components/cardLayout',
};

const build = (orientation, hasSlot) =>
  cardLayout({
    orientation,
    hasSlot,
    slot: hasSlot ? slotPlaceholder() : undefined,
    image: { src: PHOTO },
    text: LISTING,
  });

const label = (orientation, hasSlot) => `orientation=${orientation} hasSlot=${hasSlot}`;

const one = (orientation, hasSlot) => ({
  name: `${orientation} · hasSlot=${hasSlot}`,
  render: () =>
    stage(item(label(orientation, hasSlot), WIDTH[orientation], build(orientation, hasSlot))),
});

export const Vertical = one('vertical', false);
export const VerticalWithSlot = one('vertical', true);
export const Horizontal = one('horizontal', false);
export const HorizontalWithSlot = one('horizontal', true);

export const Matrix = {
  render: () =>
    stage(
      ...['vertical', 'horizontal'].flatMap((orientation) =>
        [false, true].map((hasSlot) =>
          item(label(orientation, hasSlot), WIDTH[orientation], build(orientation, hasSlot)),
        ),
      ),
    ),
};
