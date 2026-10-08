// button — triggers an action, labelled with the verb the person is about to
// perform.
//
// Figma: https://www.figma.com/design/rNvqAd4seXS0YvZp1QhJ96/Horizon-Stays-Components-Library?node-id=159-193
//
// Props mirror the Figma properties. Figma spells `varient`; it is `variant`
// here and Figma should be renamed to match (CLAUDE.md › Naming).
//
//   variant     'primary' | 'secondary' | 'tertiary' | 'outline'   (default 'primary')
//   state       'idle' | 'hover' | 'press' | 'loading' | 'disable' (default 'idle')
//               idle, hover and press pin a look for previews; real hover and
//               press come from the pointer. `loading` keeps the label in place
//               so the width does not jump, marks the button aria-busy and
//               swallows clicks. `disable` sets the native disabled attribute.
//   buttonText  the label — a verb, e.g. 'Book now'                   (required)
//   iconLeft    boolean, shows an icon before the label                (default false)
//   iconRight   boolean, shows an icon after the label                 (default false)
//   iconSwap    a function returning an SVG from the icon library      (default: add)
//   onClick     optional handler; never called while loading or disabled
import './button.css';
import { h } from '../../lib/h.js';
import { add } from '../../icons/add.js';

export const BUTTON_VARIANTS = ['primary', 'secondary', 'tertiary', 'outline'];
export const BUTTON_STATES = ['idle', 'hover', 'press', 'loading', 'disable'];

export const button = ({
  variant = 'primary',
  state = 'idle',
  buttonText,
  iconLeft = false,
  iconRight = false,
  iconSwap = add,
  onClick,
} = {}) => {
  if (!buttonText) {
    throw new Error('button needs `buttonText` — the label is its accessible name.');
  }
  const loading = state === 'loading';
  const btn = h(
    'button',
    {
      type: 'button',
      class: 'hz-button',
      'data-variant': variant,
      'data-state': state,
      disabled: state === 'disable',
      'aria-disabled': loading ? 'true' : null,
      'aria-busy': loading ? 'true' : null,
    },
    iconLeft && iconSwap(),
    h('span', { class: 'hz-button__label' }, buttonText),
    iconRight && iconSwap(),
  );
  btn.addEventListener('click', (e) => {
    if (btn.getAttribute('aria-disabled') === 'true') {
      e.preventDefault();
      e.stopImmediatePropagation();
      return;
    }
    onClick?.(e);
  });
  return btn;
};
