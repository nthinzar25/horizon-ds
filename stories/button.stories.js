// Figma: https://www.figma.com/design/rNvqAd4seXS0YvZp1QhJ96/Horizon-Stays-Components-Library?node-id=159-193
// Matrix: variant (primary, secondary, tertiary, outline)
//         × state (idle, hover, press, loading, disable) = 20.
// Extras: WithIcons (iconLeft / iconRight per variant, which Figma exposes as
// booleans rather than rows) and Interactive (real pointer, keyboard, loading).

import { button, BUTTON_STATES, BUTTON_VARIANTS } from '../src/components/button/button.js';
import { h } from '../src/lib/h.js';
import { item, stage } from './_stage.js';

export default {
  title: 'Components/button',
};

const LABEL = 'Book Now';

const one = (variant, state) => ({
  name: `${variant} · ${state}`,
  render: () =>
    stage(item(`variant=${variant} state=${state}`, null, button({ variant, state, buttonText: LABEL }))),
});

export const PrimaryIdle = one('primary', 'idle');
export const PrimaryHover = one('primary', 'hover');
export const PrimaryPress = one('primary', 'press');
export const PrimaryLoading = one('primary', 'loading');
export const PrimaryDisable = one('primary', 'disable');
export const SecondaryIdle = one('secondary', 'idle');
export const SecondaryHover = one('secondary', 'hover');
export const SecondaryPress = one('secondary', 'press');
export const SecondaryLoading = one('secondary', 'loading');
export const SecondaryDisable = one('secondary', 'disable');
export const TertiaryIdle = one('tertiary', 'idle');
export const TertiaryHover = one('tertiary', 'hover');
export const TertiaryPress = one('tertiary', 'press');
export const TertiaryLoading = one('tertiary', 'loading');
export const TertiaryDisable = one('tertiary', 'disable');
export const OutlineIdle = one('outline', 'idle');
export const OutlineHover = one('outline', 'hover');
export const OutlinePress = one('outline', 'press');
export const OutlineLoading = one('outline', 'loading');
export const OutlineDisable = one('outline', 'disable');

/** Every row of the matrix on one canvas, matching the Figma component set. */
export const Matrix = {
  render: () =>
    stage(
      ...BUTTON_VARIANTS.flatMap((variant) =>
        BUTTON_STATES.map((state) =>
          item(`${variant} · ${state}`, null, button({ variant, state, buttonText: LABEL })),
        ),
      ),
    ),
};

/** iconLeft and iconRight on every variant, with the library's Add icon. */
export const WithIcons = {
  render: () =>
    stage(
      ...BUTTON_VARIANTS.flatMap((variant) => [
        item(`${variant} · iconLeft`, null, button({ variant, buttonText: LABEL, iconLeft: true })),
        item(`${variant} · iconRight`, null, button({ variant, buttonText: LABEL, iconRight: true })),
      ]),
    ),
};

/** Hover, press, Tab focus and click all behave; loading and disable swallow clicks. */
export const Interactive = {
  render: () => {
    const count = h('p', { class: 'hz-stage-label', 'aria-live': 'polite' }, 'clicks: 0');
    let n = 0;
    const onClick = () => {
      n += 1;
      count.textContent = `clicks: ${n}`;
    };
    return stage(
      ...BUTTON_VARIANTS.map((variant) =>
        item(`${variant} · live`, null, button({ variant, buttonText: LABEL, onClick })),
      ),
      item('primary · loading', null, button({ state: 'loading', buttonText: LABEL, onClick })),
      item('primary · disable', null, button({ state: 'disable', buttonText: LABEL, onClick })),
      count,
    );
  },
};
