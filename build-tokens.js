import StyleDictionary from 'style-dictionary';
import { existsSync } from 'node:fs';

const T = 'tokens/';
const CORE = T + 'core.default.tokens.json';
const STYLES = [T + 'typography.styles.tokens.json', T + 'effects.styles.tokens.json',
                T + 'color.styles.tokens.json'];

// Style Dictionary treats `source` entries as globs and silently skips any that
// match nothing — which only resurfaces later as "reference not found", pointing
// at the wrong file. Fail loudly, naming the file that is actually missing.
const src = (...files) => {
  const missing = files.flat().filter((f) => !existsSync(f));
  if (missing.length) throw new Error(`Token file(s) not found: ${missing.join(', ')}`);
  return files.flat();
};

// Figma writes font weight as a style NAME. CSS needs a number, and so does
// Swift — a bare `semibold` is an undefined identifier there. Names arrive in
// more than one casing ("SemiBold" inside a text style, "semibold" as a
// standalone token), so match loosely.
const WEIGHTS = { thin:100, hairline:100, extralight:200, ultralight:200,
                  light:300, regular:400, normal:400, book:400, medium:500,
                  semibold:600, demibold:600, bold:700, extrabold:800,
                  ultrabold:800, black:900, heavy:900 };
const weightOf = (v) =>
  typeof v === 'string'
    ? (WEIGHTS[v.replace(/[\s_-]/g, '').toLowerCase()] ?? v)
    : v;

StyleDictionary.registerTransform({
  name: 'fontWeight/number',
  type: 'value',
  transitive: true,
  filter: (t) => (t.$type ?? t.type) === 'fontWeight',
  transform: (t) => weightOf(t.$value ?? t.value),
});

const isTypography = (t) => (t.$type ?? t.type) === 'typography';

// Runs BEFORE any transform, so the output sees the fixed values.
StyleDictionary.registerPreprocessor({
  name: 'typography/fix',
  preprocessor: (dict) => {
    const walk = (node) => {
      for (const key of Object.keys(node)) {
        const t = node[key];
        if (!t || typeof t !== 'object') continue;
        if (t.$type === 'typography' && t.$value) {
          const v = t.$value;
          t.$value = {
            ...v,
            fontWeight: weightOf(v.fontWeight),
            lineHeight: typeof v.lineHeight === 'number'
              ? { value: v.lineHeight, unit: 'px' }
              : v.lineHeight,
          };
        } else {
          walk(t);
        }
      }
      return node;
    };
    return walk(dict);
  },
});

// Style Dictionary has no CSS output for the DTCG `gradient` type, so a gradient
// token would land in tokens.css as "[object Object]". Stitch the stops into a
// linear-gradient(). Because the transform is transitive, the stop colours are
// already CSS strings by the time it runs — the same mechanism the shadow
// shorthand relies on — with a fallback for an inline sRGB object.
const cssColor = (c) => {
  if (typeof c === 'string') return c;
  const [r, g, b] = (c.components ?? []).map((n) => Math.round(n * 255));
  return `rgba(${r}, ${g}, ${b}, ${c.alpha ?? 1})`;
};

// DTCG gradients carry no direction. Figma exports its 2×3 gradientTransform
// (shape space → gradient space); the first row is the direction along which
// the stop position increases. Identity is left→right, which in CSS is 90deg.
const gradientAngle = (t) => {
  const m = t.$extensions?.figma?.gradientTransform;
  if (!m) return 90;
  const [dx, dy] = m[0];
  return (Math.round((Math.atan2(dx, -dy) * 180) / Math.PI) + 360) % 360;
};

StyleDictionary.registerTransform({
  name: 'gradient/css',
  type: 'value',
  transitive: true,
  filter: (t) => (t.$type ?? t.type) === 'gradient',
  transform: (t) => {
    const v = t.$value ?? t.value;
    if (!Array.isArray(v)) return v; // already a string
    const stops = v.map((s) => `${cssColor(s.color)} ${Math.round(s.position * 100)}%`);
    return `linear-gradient(${gradientAngle(t)}deg, ${stops.join(', ')})`;
  },
});

// The built-in `css` group collapses typography tokens into the CSS `font`
// shorthand, which has no slot for letterSpacing — so every M3 tracking value
// was being silently dropped. Drop that transform and expand the composite into
// one custom property per field instead.
const CSS_TRANSFORMS = [
  ...StyleDictionary.hooks.transformGroups.css
    .filter((t) => t !== 'typography/css/shorthand'),
  'gradient/css',
  'fontWeight/number',
];

StyleDictionary.registerFormat({
  name: 'css/variables-expanded',
  format: ({ dictionary, options }) => {
    const decl = (name, value, desc) =>
      `  --${name}: ${value};` +
      (desc ? ` /* ${desc.replace(/\s+/g, ' ').trim()} */` : '');

    const lines = dictionary.allTokens.flatMap((t) => {
      const v = t.$value ?? t.value;
      const d = t.$description ?? t.comment;
      if (!isTypography(t)) return decl(t.name, v, d);
      return [
        decl(`${t.name}-font-family`, v.fontFamily, d),
        decl(`${t.name}-font-weight`, v.fontWeight),
        decl(`${t.name}-font-size`, v.fontSize),
        decl(`${t.name}-line-height`, v.lineHeight),
        decl(`${t.name}-letter-spacing`, v.letterSpacing),
      ];
    });

    return `${options.selector} {\n${lines.join('\n')}\n}\n`;
  },
});

const css = (name, sources, selector, filter) =>
  new StyleDictionary({
    source: sources,
    preprocessors: ['typography/fix'],
    platforms: {
      css: {
        transforms: CSS_TRANSFORMS,
        buildPath: 'build/css/',
        files: [{ destination: name, format: 'css/variables-expanded',
                  options: { selector }, filter }],
      },
    },
  });

// `ios-swift` has no transform for the DTCG composite types (`typography`,
// `shadow`), so they stringify as "[object Object]". Emit only tokens whose
// transformed value is a scalar — the atomic size/lineheight/tracking values
// already exist in the `type` collection, and shadows belong in a UIKit layer
// hand-written against them rather than a generated constant.
const isScalar = (t) => {
  const v = t.$value ?? t.value;
  return v === null || typeof v !== 'object';
};

// The stock `ios-swift` group uses `size/swift/remToCGFloat`, which reads the
// number as rem and multiplies by 16 — turning 4px into CGFloat(64.00). These
// tokens are authored in px, which maps 1:1 to iOS points, so pass them through.
StyleDictionary.registerTransform({
  name: 'size/swift/pxToCGFloat',
  type: 'value',
  transitive: true,
  filter: (t) => (t.$type ?? t.type) === 'dimension',
  transform: (t) => {
    const v = t.$value ?? t.value;
    const n = typeof v === 'object' && v !== null ? v.value : parseFloat(v);
    return `CGFloat(${Number(n).toFixed(2)})`;
  },
});

// Nothing in the swift group quotes a fontFamily, so "Frank Ruhl Libre" lands
// as a bare identifier and will not parse.
StyleDictionary.registerTransform({
  name: 'fontFamily/swift/literal',
  type: 'value',
  transitive: true,
  filter: (t) => (t.$type ?? t.type) === 'fontFamily',
  transform: (t) => {
    const v = t.$value ?? t.value;
    return JSON.stringify(Array.isArray(v) ? v[0] : v);
  },
});

const IOS_TRANSFORMS = [
  ...StyleDictionary.hooks.transformGroups['ios-swift']
    .map((t) => (t === 'size/swift/remToCGFloat' ? 'size/swift/pxToCGFloat' : t)),
  'fontFamily/swift/literal',
  'fontWeight/number',
];

// The swift template emits `static let ${comment}${name} = ...`, so a token
// description lands *between* `let` and the name and breaks the declaration.
// Suppress comments rather than generate a file that will not compile.
const native = (sources) =>
  new StyleDictionary({
    source: sources,
    preprocessors: ['typography/fix'],
    platforms: {
      ios: { transforms: IOS_TRANSFORMS, buildPath: 'build/ios/',
             files: [{ destination: 'Tokens.swift', format: 'ios-swift/class.swift',
                       options: { className: 'Tokens',
                                  formatting: { commentStyle: 'none' } },
                       filter: isScalar }] },
      android: { transformGroup: 'android', buildPath: 'build/android/',
                 files: [{ destination: 'colors.xml', format: 'android/resources',
                           resourceType: 'color', filter: { $type: 'color' } }] },
    },
  });

// :root — core, light colours, web size + type, styles
await css('tokens.css',
  src(CORE, T+'semantic.light.tokens.json', T+'size.web.tokens.json',
      T+'type.web.tokens.json', STYLES),
  ':root').buildAllPlatforms();

// dark — only the colours that change
await css('tokens-dark.css',
  src(CORE, T+'semantic.dark.tokens.json'),
  '[data-theme="dark"]',
  (t) => t.filePath.includes('semantic.dark')).buildAllPlatforms();

// iOS + Android — mobile mode
await native(src(CORE, T+'semantic.light.tokens.json',
  T+'size.mobile.tokens.json', T+'type.mobile.tokens.json',
  STYLES)).buildAllPlatforms();

// ── Storybook data ──────────────────────────────────────────────────────────
// The CSS build emits only the `web` size/type mode, and the native builds drop
// the composite types — so neither output can document the full token set.
// Emit one flat record per token (resolved value, type, description, and the
// alias it came from) for every mode we ship, and let Storybook render those.
StyleDictionary.registerFormat({
  name: 'json/storybook',
  format: ({ dictionary }) =>
    JSON.stringify(
      dictionary.allTokens.map((t) => ({
        name: t.name,
        path: t.path,
        type: t.$type ?? t.type,
        value: t.$value ?? t.value,
        // What the designer actually wrote — "{core.color.blue.500}" — so the
        // gallery can show the alias next to the colour it resolves to.
        alias: typeof (t.original?.$value ?? t.original?.value) === 'string'
          ? (t.original.$value ?? t.original.value).match(/^\{(.+)\}$/)?.[1]
          : undefined,
        description: t.$description ?? t.comment,
        source: t.filePath.replace(T, ''),
      })),
      null,
      2,
    ) + '\n',
});

const json = (name, sources) =>
  new StyleDictionary({
    source: sources,
    preprocessors: ['typography/fix'],
    platforms: {
      json: {
        transforms: CSS_TRANSFORMS,
        buildPath: 'build/json/',
        files: [{ destination: name, format: 'json/storybook' }],
      },
    },
  });

// Colour varies by theme; size and type vary by mode. They are independent, so
// four builds cover the grid without emitting all six combinations.
await json('tokens.light.json',
  src(CORE, T+'semantic.light.tokens.json', T+'size.web.tokens.json',
      T+'type.web.tokens.json', STYLES)).buildAllPlatforms();

await json('tokens.dark.json',
  src(CORE, T+'semantic.dark.tokens.json', T+'size.web.tokens.json',
      T+'type.web.tokens.json', STYLES)).buildAllPlatforms();

await json('tokens.mobile.json',
  src(CORE, T+'semantic.light.tokens.json', T+'size.mobile.tokens.json',
      T+'type.mobile.tokens.json', STYLES)).buildAllPlatforms();

await json('tokens.back-office.json',
  src(CORE, T+'semantic.light.tokens.json', T+'size.back-office.tokens.json',
      T+'type.back-office.tokens.json', STYLES)).buildAllPlatforms();
