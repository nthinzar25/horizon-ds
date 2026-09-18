// cardLayout — controls how a card arranges its media and text: vertical for
// grids, horizontal for list rows. Swap the layout rather than building a
// second card component.
//
// Figma: https://www.figma.com/design/rNvqAd4seXS0YvZp1QhJ96/Horizon-Stays-Components-Library?node-id=170-1728
//
// Composes: cardImage, cardText.
//
//   orientation  'vertical' | 'horizontal'   (default 'vertical')
//   hasSlot      boolean, renders the slot under the text  (default false —
//                the slot is hidden in every Figma instance)
//   slot         a Node placed in the slot when hasSlot is true
//   image        options passed to cardImage
//   text         options passed to cardText
import './cardLayout.css';
import { h } from '../../lib/h.js';
import { cardImage } from '../cardImage/cardImage.js';
import { cardText } from '../cardText/cardText.js';

export const CARD_LAYOUT_ORIENTATIONS = ['vertical', 'horizontal'];

export const cardLayout = ({
  orientation = 'vertical',
  hasSlot = false,
  slot,
  image = {},
  text = {},
} = {}) =>
  h(
    'div',
    { class: 'hz-card-layout', 'data-orientation': orientation },
    cardImage(image),
    h(
      'div',
      { class: 'hz-card-layout__body' },
      cardText(text),
      hasSlot && h('div', { class: 'hz-card-layout__slot' }, slot),
    ),
  );
