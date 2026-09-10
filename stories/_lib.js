// Shared data access and DOM helpers for the token gallery.
// Not a story file — `.storybook/main.js` only globs `*.stories.js`.

import light from '../build/json/tokens.light.json';
import dark from '../build/json/tokens.dark.json';
import mobile from '../build/json/tokens.mobile.json';
import backOffice from '../build/json/tokens.back-office.json';

const BY_MODE = { web: light, mobile, 'back-office': backOffice };

/**
 * Colour is a function of theme; size and type are a function of mode. They are
 * independent axes, so compose them: take the mode's set and, in dark, swap in
 * the dark semantic colours.
 */
export const tokensFor = ({ theme = 'light', mode = 'web' } = {}) => {
  const base = BY_MODE[mode] ?? light;
  if (theme !== 'dark') return base;
  const overrides = new Map(
    dark.filter((t) => t.source.startsWith('semantic.')).map((t) => [t.name, t]),
  );
  return base.map((t) => overrides.get(t.name) ?? t);
};

export const MODES = Object.keys(BY_MODE);

export const startsWith = (set, ...prefixes) =>
  set.filter((t) => prefixes.some((p) => t.name.startsWith(p)));

export const ofType = (set, ...types) => set.filter((t) => types.includes(t.type));

export const bySource = (set, ...files) => set.filter((t) => files.includes(t.source));

/** `horizon-core-color-blue-500` -> `blue`. */
export const rampOf = (name) => name.match(/^horizon-core-color-([a-z]+)-/)?.[1];

/** Trailing segment(s) after a prefix — for short labels in a scale. */
export const suffix = (name, prefix) =>
  name.startsWith(prefix) ? name.slice(prefix.length).replace(/^-/, '') : name;

/** px string -> number, for sorting and bar widths. `0.5px` -> 0.5. */
export const px = (v) => parseFloat(String(v)) || 0;

// ── Colour maths ────────────────────────────────────────────────────────────
// Enough to label a swatch legibly and flag a contrast failure. The palette
// mixes opaque hex with `rgba()` alpha tokens, and an alpha token's apparent
// lightness depends on what is behind it — so everything composites over the
// theme's base background before it is measured.

const BASE_BG = { light: [255, 255, 255], dark: [10, 16, 35] };

const parse = (v) => {
  const s = String(v).trim();
  const hex = s.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)?.[1];
  if (hex) {
    const full = hex.length === 3 ? hex.replace(/./g, (c) => c + c) : hex;
    return [[0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)), 1];
  }
  const parts = s.match(/rgba?\(([^)]+)\)/i)?.[1];
  if (parts) {
    const n = parts.split(',').map((x) => parseFloat(x));
    return [[n[0], n[1], n[2]], Number.isFinite(n[3]) ? n[3] : 1];
  }
  return null;
};

const flatten = (v, theme = 'light') => {
  const parsed = parse(v);
  if (!parsed) return null;
  const [rgb, a] = parsed;
  const bg = BASE_BG[theme] ?? BASE_BG.light;
  return rgb.map((c, i) => a * c + (1 - a) * bg[i]);
};

const relLuminance = (rgb) => {
  const [r, g, b] = rgb.map((x) => {
    const c = x / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** A legible ink colour to print on top of `value`. */
export const onColor = (value, theme = 'light') => {
  const rgb = flatten(value, theme);
  if (!rgb) return 'inherit';
  return relLuminance(rgb) > 0.45 ? '#0a1023' : '#ffffff';
};

/** WCAG contrast ratio between two token values, to 2dp. */
export const contrast = (fg, bg, theme = 'light') => {
  const a = flatten(fg, theme);
  const b = flatten(bg, theme);
  if (!a || !b) return null;
  const [hi, lo] = [relLuminance(a), relLuminance(b)].sort((x, y) => y - x);
  return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
};

// ── DOM ─────────────────────────────────────────────────────────────────────

export const h = (tag, attrs = {}, ...kids) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'style' && typeof v === 'object') {
      for (const [prop, val] of Object.entries(v)) {
        if (val == null) continue;
        n.style.setProperty(
          prop.startsWith('--')
            ? prop
            : prop.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`),
          String(val),
        );
      }
    } else if (k === 'class') {
      n.className = v;
    } else {
      n.setAttribute(k, v === true ? '' : String(v));
    }
  }
  for (const kid of kids.flat(Infinity)) {
    if (kid == null || kid === false) continue;
    n.append(kid instanceof Node ? kid : String(kid));
  }
  return n;
};

/** Page scaffold: title, standfirst, then sections. */
export const page = (title, blurb, ...sections) =>
  h(
    'div',
    { class: 'hz-page' },
    h(
      'header',
      { class: 'hz-page-head' },
      h('h1', { class: 'hz-h1' }, title),
      blurb && h('p', { class: 'hz-blurb' }, blurb),
    ),
    sections,
  );

export const section = (title, blurb, ...body) =>
  h(
    'section',
    { class: 'hz-section' },
    title && h('h2', { class: 'hz-h2' }, title),
    blurb && h('p', { class: 'hz-blurb' }, blurb),
    body,
  );

export const grid = (min, ...kids) =>
  h('div', { class: 'hz-grid', style: { '--min': `${min}px` } }, kids);

/** Name + value caption used under every specimen. */
export const caption = (token, extra) =>
  h(
    'div',
    { class: 'hz-caption' },
    h('code', { class: 'hz-name' }, token.name),
    h('span', { class: 'hz-value' }, extra ?? String(token.value)),
    token.alias && h('span', { class: 'hz-alias' }, `-> ${token.alias}`),
    token.description &&
      h(
        'span',
        { class: 'hz-desc', title: token.description },
        token.description.split('\n')[0],
      ),
  );

export const empty = (what) => h('p', { class: 'hz-blurb' }, `No ${what} in this mode.`);

// ── Gallery chrome ──────────────────────────────────────────────────────────
// Deliberately built from the design system's own semantic tokens, so the
// gallery re-themes with the toolbar exactly like a consuming app would.

const CHROME = `
.hz-canvas {
  min-height: 100vh;
  box-sizing: border-box;
  padding: var(--horizon-semantic-spacing-padding-page);
  background: var(--horizon-semantic-color-bg-base);
  color: var(--horizon-semantic-color-text-primary);
  font-family: var(--horizon-type-fontfamily-plain), system-ui, sans-serif;
  font-size: var(--horizon-type-body-md-size);
  line-height: var(--horizon-type-body-md-lineheight);
}
.hz-page { max-width: 1180px; margin: 0 auto;
  display: flex; flex-direction: column;
  gap: var(--horizon-semantic-spacing-gap-section); }
.hz-page-head { display: flex; flex-direction: column;
  gap: var(--horizon-semantic-spacing-gap-inline); }
.hz-h1 { margin: 0;
  font-family: var(--horizon-type-fontfamily-brand), system-ui, sans-serif;
  font-size: var(--horizon-type-headline-lg-size);
  line-height: var(--horizon-type-headline-lg-lineheight);
  font-weight: 600; letter-spacing: -0.01em; }
.hz-h2 { margin: 0;
  font-size: var(--horizon-type-title-lg-size);
  line-height: var(--horizon-type-title-lg-lineheight);
  font-weight: 600; }
.hz-blurb { margin: 0; max-width: 68ch;
  color: var(--horizon-semantic-color-text-secondary);
  font-size: var(--horizon-type-body-md-size);
  line-height: var(--horizon-type-body-md-lineheight); }
.hz-section { display: flex; flex-direction: column;
  gap: var(--horizon-semantic-spacing-gap-stack); }
.hz-grid { display: grid; gap: var(--horizon-semantic-spacing-gap-group);
  grid-template-columns: repeat(auto-fill, minmax(var(--min, 200px), 1fr)); }

.hz-caption { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.hz-name { font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: var(--horizon-type-label-md-size);
  line-height: var(--horizon-type-label-md-lineheight);
  color: var(--horizon-semantic-color-text-primary);
  overflow-wrap: anywhere; }
.hz-value { font-size: var(--horizon-type-label-md-size);
  line-height: var(--horizon-type-label-md-lineheight);
  color: var(--horizon-semantic-color-text-secondary);
  font-variant-numeric: tabular-nums; }
.hz-alias { font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: var(--horizon-type-label-sm-size);
  line-height: var(--horizon-type-label-sm-lineheight);
  color: var(--horizon-semantic-color-text-brand);
  overflow-wrap: anywhere; }
.hz-desc { font-size: var(--horizon-type-label-sm-size);
  line-height: var(--horizon-type-label-sm-lineheight);
  color: var(--horizon-semantic-color-text-secondary);
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  overflow: hidden; }

.hz-card { display: flex; flex-direction: column;
  gap: var(--horizon-semantic-spacing-gap-inline);
  padding: var(--horizon-semantic-spacing-gap-stack);
  border-radius: var(--horizon-semantic-border-radius-md);
  border: var(--horizon-core-border-width-1) solid
          var(--horizon-semantic-color-border-primary);
  background: var(--horizon-semantic-color-bg-surfaceprimary); }

.hz-swatch { height: 72px;
  border-radius: var(--horizon-semantic-border-radius-sm);
  border: var(--horizon-core-border-width-1) solid
          var(--horizon-semantic-color-border-secondary); }

/* Ramps read as a continuous strip, so no gap and no per-chip border. */
.hz-ramp { display: grid; grid-auto-flow: column; grid-auto-columns: 1fr;
  border-radius: var(--horizon-semantic-border-radius-sm); overflow: hidden;
  border: var(--horizon-core-border-width-1) solid
          var(--horizon-semantic-color-border-secondary); }
.hz-ramp-chip { height: 76px; display: flex; align-items: flex-end;
  justify-content: center; padding-bottom: 6px;
  font-size: var(--horizon-type-label-sm-size);
  font-variant-numeric: tabular-nums; }
.hz-ramp-row { display: flex; flex-direction: column; gap: 6px; }
.hz-ramp-label { font-weight: 600; text-transform: capitalize;
  font-size: var(--horizon-type-label-lg-size); }
.hz-ramp-hexes { display: grid; grid-auto-flow: column; grid-auto-columns: 1fr;
  gap: 0; font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 10px; text-align: center;
  color: var(--horizon-semantic-color-text-secondary); }

.hz-table { width: 100%; border-collapse: collapse;
  font-size: var(--horizon-type-body-sm-size); }
.hz-table th, .hz-table td { text-align: left; vertical-align: top;
  padding: 8px 12px;
  border-bottom: var(--horizon-core-border-width-1) solid
                 var(--horizon-semantic-color-border-secondary); }
.hz-table th { position: sticky; top: 0;
  background: var(--horizon-semantic-color-bg-base);
  font-size: var(--horizon-type-label-md-size);
  text-transform: uppercase; letter-spacing: 0.06em;
  color: var(--horizon-semantic-color-text-secondary); }
.hz-table code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: var(--horizon-type-label-md-size); overflow-wrap: anywhere; }
.hz-num { font-variant-numeric: tabular-nums; }

.hz-input { width: 100%; box-sizing: border-box;
  height: var(--horizon-semantic-size-control);
  padding: 0 var(--horizon-semantic-spacing-padding-control);
  border-radius: var(--horizon-semantic-border-radius-sm);
  border: var(--horizon-core-border-width-1) solid
          var(--horizon-semantic-color-border-primary);
  background: var(--horizon-semantic-color-bg-base);
  color: var(--horizon-semantic-color-text-primary);
  font-size: var(--horizon-type-body-md-size);
  font-family: inherit; }
.hz-input::placeholder { color: var(--horizon-semantic-color-text-secondary); }

.hz-bar { background: var(--horizon-semantic-color-bg-primary-idle);
  height: 16px; border-radius: 2px; }
.hz-scale-row { display: grid; grid-template-columns: 190px 1fr 64px;
  align-items: center; gap: var(--horizon-semantic-spacing-gap-inline); }

.hz-chip { display: inline-flex; align-items: center;
  padding: 2px 8px; border-radius: var(--horizon-semantic-border-radius-full);
  background: var(--horizon-semantic-color-bg-accent-blue);
  color: var(--horizon-semantic-color-text-brand);
  font-size: var(--horizon-type-label-sm-size); white-space: nowrap; }

.hz-specimen { overflow-wrap: anywhere; }
.hz-note { padding: var(--horizon-semantic-spacing-gap-stack);
  border-radius: var(--horizon-semantic-border-radius-sm);
  border-left: 3px solid var(--horizon-semantic-color-border-warning-default);
  background: var(--horizon-semantic-color-bg-warning-light);
  color: var(--horizon-semantic-color-text-primary);
  font-size: var(--horizon-type-body-sm-size); }
`;

let injected = false;
export const chrome = () => {
  if (injected) return;
  injected = true;
  document.head.append(h('style', { 'data-hz-chrome': true }, CHROME));
};
