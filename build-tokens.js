import StyleDictionary from 'style-dictionary';
import { existsSync } from 'node:fs';

const T = 'tokens/';
const CORE = T + 'core.default.tokens.json';
const STYLES = [T + 'typography.styles.tokens.json', T + 'effects.styles.tokens.json'];

// Style Dictionary treats `source` entries as globs and silently skips any that
// match nothing — which only resurfaces later as "reference not found", pointing
// at the wrong file. Fail loudly, naming the file that is actually missing.
const src = (...files) => {
  const missing = files.flat().filter((f) => !existsSync(f));
  if (missing.length) throw new Error(`Token file(s) not found: ${missing.join(', ')}`);
  return files.flat();
};

// Figma writes font weight as a style NAME. CSS needs a number.
const WEIGHTS = { Thin:100, ExtraLight:200, Light:300, Regular:400, Medium:500,
                  SemiBold:600, Bold:700, ExtraBold:800, Black:900 };

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
            fontWeight: WEIGHTS[v.fontWeight] ?? v.fontWeight,
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

// The built-in `css` group collapses typography tokens into the CSS `font`
// shorthand, which has no slot for letterSpacing — so every M3 tracking value
// was being silently dropped. Drop that transform and expand the composite into
// one custom property per field instead.
const CSS_TRANSFORMS = StyleDictionary.hooks.transformGroups.css
  .filter((t) => t !== 'typography/css/shorthand');

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
