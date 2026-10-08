// `Hicon / Outline / Add` from the Horizon Stays Icon Library, as exported from
// Figma. The 17.5×17.5 glyph sits at inset 13.54% of the library's 24×24
// frame, and it fills with `currentColor` so the colour comes from a semantic
// token on whatever contains it. No colour is baked in here.
const SVG_NS = 'http://www.w3.org/2000/svg';

const PATH =
  'M9.5 0.75C9.5 0.335786 9.16421 0 8.75 0C8.33579 0 8 0.335786 8 0.75L8 8H0.75C0.335786 8 0 8.33579 0 8.75C0 9.16421 0.335786 9.5 0.75 9.5H8V16.75C8 17.1642 8.33579 17.5 8.75 17.5C9.16421 17.5 9.5 17.1642 9.5 16.75V9.5H16.75C17.1642 9.5 17.5 9.16421 17.5 8.75C17.5 8.33579 17.1642 8 16.75 8H9.5L9.5 0.75Z';

/** The add icon. Decorative by default; the control it sits in names it. */
export const add = () => {
  const svg = document.createElementNS(SVG_NS, 'svg');
  // Offsets the 17.5×17.5 glyph into the library's 24×24 frame.
  svg.setAttribute('viewBox', '-3.25 -3.25 24 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.classList.add('hz-icon');
  svg.dataset.icon = 'add';
  const p = document.createElementNS(SVG_NS, 'path');
  p.setAttribute('d', PATH);
  p.setAttribute('fill', 'currentColor');
  svg.append(p);
  return svg;
};
