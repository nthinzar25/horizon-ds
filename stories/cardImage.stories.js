// Figma: https://www.figma.com/design/rNvqAd4seXS0YvZp1QhJ96/Horizon-Stays-Components-Library?node-id=170-1409
// Matrix: state (idle, hover) × size (3:2, 1:1) = 4.

import { cardImage } from '../src/components/cardImage/cardImage.js';
import { item, PHOTO, stage, WIDTH } from './_stage.js';

export default {
  title: 'Components/cardImage',
};

const build = (state, size) => cardImage({ state, size, src: PHOTO });

const one = (state, size) => ({
  name: `${state} · ${size}`,
  render: () => stage(item(`state=${state} size=${size}`, WIDTH.vertical, build(state, size))),
});

export const Idle32 = one('idle', '3:2');
export const Idle11 = one('idle', '1:1');
export const Hover32 = one('hover', '3:2');
export const Hover11 = one('hover', '1:1');

export const Matrix = {
  render: () =>
    stage(
      ...['idle', 'hover'].flatMap((state) =>
        ['3:2', '1:1'].map((size) =>
          item(`state=${state} size=${size}`, WIDTH.vertical, build(state, size)),
        ),
      ),
    ),
};

/** No photo yet: the surface shows through. */
export const Empty = {
  render: () => stage(item('no src', WIDTH.vertical, cardImage())),
};
