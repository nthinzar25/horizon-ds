// cardImage — the media slot of a card. Holds the aspect ratio, the overlay
// gradient for text laid over photography, and the favourite pinned to its
// corner.
//
// Figma: https://www.figma.com/design/rNvqAd4seXS0YvZp1QhJ96/Horizon-Stays-Components-Library?node-id=170-1409
//
// Composes: iconButton (the favourite).
//
//   size       '3:2' | '1:1'         (default '3:2')
//   state      'idle' | 'hover'      (default 'idle'; real hover also works)
//   src, alt   the photo. `alt` is '' for decorative listing photos.
//   favourite  false to omit the favourite button, or an options object
//              passed to iconButton (label, pressed, onClick, …)
import './cardImage.css';
import { h } from '../../lib/h.js';
import { iconButton } from '../iconButton/iconButton.js';

export const CARD_IMAGE_SIZES = ['3:2', '1:1'];
export const CARD_IMAGE_STATES = ['idle', 'hover'];

export const cardImage = ({
  size = '3:2',
  state = 'idle',
  src,
  alt = '',
  favourite = {},
} = {}) => {
  const node = h(
    'div',
    { class: 'hz-card-image', 'data-size': size, 'data-state': state },
    src && h('img', { class: 'hz-card-image__media', src, alt, loading: 'lazy' }),
    h('div', { class: 'hz-card-image__overlay' }),
  );
  if (favourite !== false) {
    const btn = iconButton({
      variant: 'active',
      label: 'Save to favourites',
      pressed: false,
      ...favourite,
    });
    btn.classList.add('hz-card-image__favourite');
    node.append(btn);
  }
  return node;
};
