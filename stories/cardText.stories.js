// Figma: https://www.figma.com/design/rNvqAd4seXS0YvZp1QhJ96/Horizon-Stays-Components-Library?node-id=47-187
// Matrix: metadata × review × price, each boolean = 8.

import { cardText } from '../src/components/cardText/cardText.js';
import { item, LISTING, stage } from './_stage.js';

export default {
  title: 'Components/cardText',
};

const W = 278; // the Figma node's width

const label = (metadata, review, price) =>
  `metadata=${metadata} review=${review} price=${price}`;

const one = (metadata, review, price) => ({
  name: label(metadata, review, price),
  render: () =>
    stage(item(label(metadata, review, price), W, cardText({ ...LISTING, metadata, review, price }))),
});

export const All = one(true, true, true);
export const NoPrice = one(true, true, false);
export const NoReview = one(true, false, true);
export const NoReviewNoPrice = one(true, false, false);
export const NoMetadata = one(false, true, true);
export const NoMetadataNoPrice = one(false, true, false);
export const NoMetadataNoReview = one(false, false, true);
export const TitleOnly = one(false, false, false);

export const Matrix = {
  render: () =>
    stage(
      ...[true, false].flatMap((metadata) =>
        [true, false].flatMap((review) =>
          [true, false].map((price) =>
            item(label(metadata, review, price), W, cardText({ ...LISTING, metadata, review, price })),
          ),
        ),
      ),
    ),
};

/** Long property names wrap; the title clamps at two lines. */
export const LongTitle = {
  render: () =>
    stage(
      item(
        'two-line clamp',
        W,
        cardText({
          ...LISTING,
          title: 'Quinta da Boa Vista Guesthouse and Vineyard Retreat, Douro Valley',
        }),
      ),
    ),
};
