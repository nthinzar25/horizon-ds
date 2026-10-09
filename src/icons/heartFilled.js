// `Hicon / Bold / Heart 3` from the Horizon Stays Icon Library, as exported
// from Figma — the filled partner of `heart.js`, for a favourite that is on.
// The 20×18 glyph sits at inset 12.5% / 8.33% of the library's 24×24 frame,
// and it fills with `currentColor` so the colour comes from a semantic token on
// whatever contains it. No colour is baked in here.
const SVG_NS = 'http://www.w3.org/2000/svg';

const PATH =
  'M8.39933 1.14593C6.72567 0.084255 4.02273 -0.91968 1.68853 1.46071C-3.85248 7.11136 5.64984 18 9.99999 18C14.3501 18 23.8525 7.11136 18.3115 1.46072C15.9773 -0.919653 13.2744 0.0842676 11.6007 1.14593C10.655 1.74582 9.34501 1.74582 8.39933 1.14593ZM14.744 2.29891C14.3568 2.15178 13.9236 2.34638 13.7765 2.73358C13.6293 3.12078 13.8239 3.55395 14.2111 3.70109C14.5718 3.83816 14.9484 4.07039 15.3266 4.44544C15.8084 4.92308 16.1133 5.44658 16.2832 5.99774C16.4053 6.39356 16.8251 6.61548 17.221 6.49343C17.6168 6.37137 17.8387 5.95154 17.7166 5.55572C17.473 4.76568 17.0371 4.02899 16.3827 3.38024C15.8665 2.86843 15.3147 2.51581 14.744 2.29891Z';

/** The filled heart icon. Decorative by default; the control it sits in names it. */
export const heartFilled = () => {
  const svg = document.createElementNS(SVG_NS, 'svg');
  // Offsets the 20×18 glyph into the library's 24×24 frame.
  svg.setAttribute('viewBox', '-2 -3 24 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.classList.add('hz-icon');
  svg.dataset.icon = 'heart-filled';
  const p = document.createElementNS(SVG_NS, 'path');
  p.setAttribute('d', PATH);
  p.setAttribute('fill', 'currentColor');
  p.setAttribute('fill-rule', 'evenodd');
  p.setAttribute('clip-rule', 'evenodd');
  svg.append(p);
  return svg;
};
