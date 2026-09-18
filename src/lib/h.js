// Tiny DOM builder shared by the components. Attribute values that are `null`,
// `undefined` or `false` are skipped; `true` sets a boolean attribute; `class`
// sets className; a `style` object sets each property (custom properties too).
export const h = (tag, attrs = {}, ...kids) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'style' && typeof v === 'object') {
      for (const [prop, val] of Object.entries(v)) {
        if (val != null) n.style.setProperty(prop, String(val));
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
