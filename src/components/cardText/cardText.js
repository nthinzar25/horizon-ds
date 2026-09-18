// cardText — the text block of a card: title, metadata line and price.
//
// Figma: https://www.figma.com/design/rNvqAd4seXS0YvZp1QhJ96/Horizon-Stays-Components-Library?node-id=47-187
//
// Boolean props mirror the Figma properties; the string props carry the copy.
//
//   metadata  boolean, shows the details block (rating + price)  (default true)
//   review    boolean, shows the rating row                       (default true)
//   price     boolean, shows the price row                        (default true)
//   title, subtitle, rating, reviews, priceText, priceUnit  — the copy
import './cardText.css';
import { h } from '../../lib/h.js';

export const cardText = ({
  metadata = true,
  review = true,
  price = true,
  title = '',
  subtitle = '',
  rating = '',
  reviews = '',
  priceText = '',
  priceUnit = '',
} = {}) =>
  h(
    'div',
    { class: 'hz-card-text' },
    h(
      'div',
      { class: 'hz-card-text__info' },
      h('p', { class: 'hz-card-text__title' }, title),
      subtitle && h('p', { class: 'hz-card-text__subtitle' }, subtitle),
    ),
    metadata &&
      h(
        'div',
        { class: 'hz-card-text__details' },
        review &&
          h(
            'div',
            { class: 'hz-card-text__row' },
            h('p', { class: 'hz-card-text__rating' }, rating),
            h('p', { class: 'hz-card-text__reviews' }, reviews),
          ),
        price &&
          h(
            'div',
            { class: 'hz-card-text__row' },
            h('p', { class: 'hz-card-text__price' }, priceText),
            h('p', { class: 'hz-card-text__unit' }, priceUnit),
          ),
      ),
  );
