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
//   favourite  false to omit the favourite button, or an options object:
//                label     accessible name    (default 'Save to favourites')
//                pressed   whether it is on   (default true — Figma draws it on)
//                onChange  called with the new pressed value on every toggle
//              Pressed drives everything the favourite shows: on is the
//              `active` iconButton with the filled heart and aria-pressed=true,
//              off is `outline` with the outline heart and aria-pressed=false.
//              The look and the announced state cannot disagree.
import './cardImage.css';
import { h } from '../../lib/h.js';
import { heart } from '../../icons/heart.js';
import { heartFilled } from '../../icons/heartFilled.js';
import { iconButton } from '../iconButton/iconButton.js';

// Repaints a favourite button to match `pressed`.
const paintFavourite = (btn, pressed) => {
  btn.dataset.variant = pressed ? 'active' : 'outline';
  btn.setAttribute('aria-pressed', String(pressed));
  btn.replaceChildren(pressed ? heartFilled() : heart());
};

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
    const { label = 'Save to favourites', pressed = true, onChange } = favourite;
    const btn = iconButton({ label, pressed });
    paintFavourite(btn, pressed);
    btn.addEventListener('click', () => {
      const next = btn.getAttribute('aria-pressed') !== 'true';
      paintFavourite(btn, next);
      onChange?.(next);
    });
    btn.classList.add('hz-card-image__favourite');
    node.append(btn);
  }
  return node;
};
