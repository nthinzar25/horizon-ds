// cardContainer — the surface primitive every Horizon card sits on. It owns
// background, radius, elevation and interaction state; a new card type is a
// composition placed inside it, not a new surface.
//
// Figma: https://www.figma.com/design/rNvqAd4seXS0YvZp1QhJ96/Horizon-Stays-Components-Library?node-id=188-7377
//
// Composes: cardLayout.
//
//   state    'idle' | 'hover'   (default 'idle'; real hover / focus-within
//            also lift the card). Figma names this property `Property 1`;
//            it should be renamed `state` to match cardImage and this code.
//   hasSlot  boolean, renders the card slot under the layout (default false)
//   slot     a Node placed in the slot when hasSlot is true
//   layout   options passed to cardLayout
import './cardContainer.css';
import { h } from '../../lib/h.js';
import { cardLayout } from '../cardLayout/cardLayout.js';

export const CARD_CONTAINER_STATES = ['idle', 'hover'];

export const cardContainer = ({ state = 'idle', hasSlot = false, slot, layout = {} } = {}) =>
  h(
    'article',
    { class: 'hz-card-container', 'data-state': state },
    cardLayout(layout),
    hasSlot && h('div', { class: 'hz-card-container__slot' }, slot),
  );
