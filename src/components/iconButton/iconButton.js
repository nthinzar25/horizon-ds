// iconButton — an action with no visible label, for toolbars, card corners and
// dense rows.
//
// Figma: https://www.figma.com/design/rNvqAd4seXS0YvZp1QhJ96/Horizon-Stays-Components-Library?node-id=170-1329
//
// Props mirror the Figma properties. Figma spells the first one `varient`; it
// is `variant` here and Figma should be renamed to match (CLAUDE.md › Naming).
//
//   variant   'outline' | 'active' | 'fill' | 'small'   (default 'outline')
//   state     'idle' | 'hover'                          (default 'idle')
//   iconSwap  an SVG element from the icon library      (default: heart)
//   label     required accessible name — the icon is not the name
//   pressed   optional boolean, for toggle actions such as favourite
//   onClick   optional handler
import './iconButton.css';
import { h } from '../../lib/h.js';
import { heart } from '../../icons/heart.js';

export const ICON_BUTTON_VARIANTS = ['outline', 'active', 'fill', 'small'];
export const ICON_BUTTON_STATES = ['idle', 'hover'];

export const iconButton = ({
  variant = 'outline',
  state = 'idle',
  iconSwap,
  label,
  pressed,
  onClick,
} = {}) => {
  if (!label) {
    throw new Error('iconButton needs a `label` — an icon-only control must carry an accessible name.');
  }
  const btn = h(
    'button',
    {
      type: 'button',
      class: 'hz-icon-button',
      'data-variant': variant,
      'data-state': state,
      'aria-label': label,
      title: label,
      'aria-pressed': typeof pressed === 'boolean' ? String(pressed) : null,
    },
    iconSwap ?? heart(),
  );
  if (onClick) btn.addEventListener('click', onClick);
  return btn;
};
