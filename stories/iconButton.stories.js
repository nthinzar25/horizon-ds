// Figma: https://www.figma.com/design/rNvqAd4seXS0YvZp1QhJ96/Horizon-Stays-Components-Library?node-id=170-1329
// Matrix: variant (outline, active, fill, small) × state (idle, hover) = 8.

import { iconButton } from '../src/components/iconButton/iconButton.js';
import { item, stage } from './_stage.js';

export default {
  title: 'Components/iconButton',
};

const LABEL = 'Save to favourites';

const build = (variant, state) =>
  iconButton({ variant, state, label: LABEL, pressed: variant === 'active' });

const one = (variant, state) => ({
  name: `${variant} · ${state}`,
  render: () => stage(item(`variant=${variant} state=${state}`, null, build(variant, state))),
});

export const OutlineIdle = one('outline', 'idle');
export const OutlineHover = one('outline', 'hover');
export const ActiveIdle = one('active', 'idle');
export const ActiveHover = one('active', 'hover');
export const FillIdle = one('fill', 'idle');
export const FillHover = one('fill', 'hover');
export const SmallIdle = one('small', 'idle');
export const SmallHover = one('small', 'hover');

/** Every row of the matrix on one canvas, matching the Figma component set. */
export const Matrix = {
  render: () =>
    stage(
      ...['outline', 'active', 'fill', 'small'].flatMap((variant) =>
        ['idle', 'hover'].map((state) =>
          item(`${variant} · ${state}`, null, build(variant, state)),
        ),
      ),
    ),
};
