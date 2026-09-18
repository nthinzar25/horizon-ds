# QA · Card family · local

Branch `components/card` · Storybook at http://localhost:6006 · Figma file `rNvqAd4seXS0YvZp1QhJ96`, page `💠Card` (node `3:18`).
Tested by QA, not by the engineer who built it. Nothing in `src/` or `stories/` was touched.

| Component | Figma set | Story file |
|---|---|---|
| cardContainer | `188:7377` | `stories/cardContainer.stories.js` |
| cardLayout | `170:1728` | `stories/cardLayout.stories.js` |
| cardImage | `170:1409` | `stories/cardImage.stories.js` |
| cardText | `47:187` | `stories/cardText.stories.js` |
| iconButton | `170:1329` | `stories/iconButton.stories.js` |

## Preconditions

- **Fonts.** Roboto 400 and 500 were confirmed loaded before any width was read: a canvas measurement of the listing copy at 16px gave 361.8px (Roboto 400) and 365.2px (Roboto 500) against 344.4px for a bogus family name. Widths below are trustworthy.
- **Tokens.** Every custom property referenced by the five CSS files resolves in `build/css/tokens.css` (39 of 39). Dark overrides exist for every colour token used. No raw hex, no raw px, no raw font value in any component. Two raw non-token values exist and are listed under gaps: `120ms` transition durations (no motion token exists in the system) and layout `100%` widths.
- **Photo.** `stories/assets/card-photo.jpg` is a transparency checkerboard because that is what the Figma image fill renders as; it matches the Figma screenshot and is not a defect.
- **Expected matrix** came from `get_metadata` on the five set nodes, token bindings from `get_design_context`, and variables confirmed per variant node with `get_variable_defs` (light mode was the open mode; dark values were read from `tokens-dark.css`).

## Reconciliation — Figma rows vs stories

| Figma row | Story | Note |
|---|---|---|
| cardContainer · Property 1=idle / hover, hasSlot | Idle, IdleWithSlot, Hover, HoverWithSlot, Matrix | Figma calls the prop `Property 1`; code calls it `state` (engineer gap 4) |
| — | cardContainer · Grid (horizontal × state) | No row in the `188:7377` set; the story reproduces the page's sticker grid. Documented in the story header. Kept as an extra, reported here |
| — | cardContainer · Interactive | Behaviour story, no Figma row. Used to drive hover / focus / toggle |
| cardLayout · orientation=vertical / horizontal, hasSlot | Vertical, VerticalWithSlot, Horizontal, HorizontalWithSlot, Matrix | 1:1 |
| cardImage · state × size (3:2, 1:1) | Idle32, Idle11, Hover32, Hover11, Matrix | 1:1. Figma's description names 16:9 but the set has no 16:9 row (engineer gap 3) |
| — | cardImage · Empty | No Figma row. Shows `bg/surfaceprimary` with no `src`. Undocumented extra, reported |
| cardText · metadata / review / price booleans | All … TitleOnly (8), Matrix | Figma draws one node (`47:187`, all true); the booleans are component properties, not variants, so 7 of the 8 combinations have no Figma render to compare against |
| — | cardText · LongTitle | No Figma row; exercises the two-line rule in the component description |
| iconButton · varient (outline, active, fill, small) × state | 8 singles + Matrix | 1:1. Figma spells it `varient`; code `variant` (engineer gap 4) |

No Figma row is missing a story.

## The matrix

Result key: **pass** · **FAIL (Fn)** · **pass · gap n** (matches the build, deviates from Figma only through a design gap listed below).

### iconButton (`170:1329`)

| Case | Figma expectation | Measured (light) | Result |
|---|---|---|---|
| outline · idle | 40×40, pad `core/spacing/3xs` 8, radius `border/radius/full`, bg `bg/base`, icon 24 `icon/primary`, no shadow | 40×40, 8px, 999px, #ffffff, 24×24 #3b404f, none | pass |
| outline · hover | + Elevation/Level 2 | box-shadow = `--elevation-level-2` (0 1 2 0 @.25, 0 2 6 2 @.08) | pass |
| active · idle | bg `bg/accent/red`, icon `icon/negative` | #fce9e9, #c82323, 40×40 | pass |
| active · hover | + Level 2 | `--elevation-level-2` | pass |
| fill · idle | bg `bg/info/idle`, icon `icon/inverse/default` | #0d34e9, #ffffff, 40×40 | pass |
| fill · hover | + Level 2 | `--elevation-level-2` | pass |
| small · idle | 36×36, icon 20 `core/size/icon/sm`, bg `bg/info/idle`, icon `icon/inverse/default` | 36×36, 20×20, #0d34e9, #ffffff | pass |
| small · hover | + Elevation/Level 1 | box-shadow = `--elevation-level-1` (0 1 2 0 @.13, 0 1 3 1 @.08) | pass |
| real pointer hover (Interactive) | agrees with pinned `data-state="hover"` | Level 2 on `:hover`, identical string | pass |
| focus via Tab (Interactive) | visible ring (no Figma variant; engineer gap 5) | `:focus-visible` true, outline 2px solid `border/brand/default` (#3b82f6), offset 2px | pass |
| toggle via real click (Interactive) | `aria-pressed` and look flip together | false→true, `data-variant` outline→active, bg #fce9e9, icon #c82323; second click reverts | pass |
| accessible name | required | `aria-label` and `title` "Save to favourites"; factory throws without `label` | pass |
| touch target | 44×44 per CLAUDE.md and the Figma description | 40×40 (36×36 small) as drawn in Figma | pass · gap 6 |

### cardImage (`170:1409`)

| Case | Figma expectation | Measured (light) | Result |
|---|---|---|---|
| idle · 3:2 | 280.5×187.35, bg `bg/surfaceprimary`, overlay off, favourite = iconButton active at top 8 / right 7.5 | 281×187.33 (ratio 1.5000), #f5f6f6, overlay opacity 0, favourite 40×40 at top 8 / right 8 | FAIL (F1, F2) |
| idle · 1:1 | 280.5×252.5 drawn; true 1:1 per engineer gap 3 | 281×281 (ratio 1.0000), #f5f6f6, overlay 0 | FAIL (F1, F2) · gap 3 |
| hover · 3:2 | Gradient/Overlay Gradient over the photo (`neutral/200A` → `neutral/0A`, top to bottom) | overlay opacity 1, `--gradient-overlay-gradient` = linear-gradient(180deg, rgba(10,16,35,.13) → rgba(10,16,35,0)) | FAIL (F1, F2) |
| hover · 1:1 | as above | overlay 1, same gradient | FAIL (F1, F2) · gap 3 |
| real pointer hover (Interactive) | overlay agrees with pinned | overlay 1 while the pointer is inside the image, 0 while on the text | pass |
| Empty (no `src`) | no Figma row | surface `bg/surfaceprimary` shows, favourite still pinned, no `<img>` | pass (extra) |
| corner radius | set node has no radius; the instance in cardLayout is `core/spacing/3xs` 8 | `border/radius/sm` 8px on every case | pass · gap 9 |

### cardText (`47:187`)

| Case | Figma expectation | Measured (light) | Result |
|---|---|---|---|
| metadata=true review=true price=true | 278×96; info gap `gap/extrasmall`; block gap `gap/small`; title Title/Medium `text/primary`; location Body/Small `text/secondary`; rating Title/Small `text/warning`; reviews Body/Small `text/secondary`; price Title/Small `text/primary`; period Body/Small `text/secondary`; row gap 4 | 278×96; 4px / 8px; 500 16/24 tracking .15 #232839; 400 12/16 .4 #6c707b; 500 14/20 .1 #df900a; 400 12/16 #6c707b; 500 14/20 #232839; 400 12/16 #6c707b; row gap 4px. Text widths 20.11 / 77.25 / 53.94 / 50.58 vs Figma 21 / 77 / 54 / 51 | pass |
| true · true · false | no Figma render; price row hidden | 278×72, details 20 high, one row | pass |
| true · false · true | no Figma render; rating row hidden | 278×72, one row | pass |
| true · false · false | no Figma render | 278×**52**: empty details block still takes the 8px block gap; 44 expected | FAIL (F3) |
| false · true · true | details hidden | 278×44 | pass |
| false · true · false | details hidden | 278×44 | pass |
| false · false · true | details hidden | 278×44 | pass |
| false · false · false | details hidden | 278×44 | pass |
| LongTitle | "Keep the title to two lines" (component description) | clamps at 2 lines of 24px, ellipsis, no overflow | pass |
| details wrapping | `whitespace-nowrap` on Listing Details | `white-space: nowrap` | pass |

### cardLayout (`170:1728`)

| Case | Figma expectation | Measured (light) | Result |
|---|---|---|---|
| vertical · hasSlot=false | 280.5×291.35, column, gap `core/spacing/3xs` 8, image 280.5×187.35 radius 8, text 280.5×96 | 281×291.33, column, 8px, image 281×187.33 r8, body 281×96 at y 195.33 | pass |
| vertical · hasSlot=true | slot 280.5×59 below the text | slot 281×59; text→slot gap **0** (Figma: 8 vertical / 10 horizontal, both unbound) | pass · gap 2 |
| horizontal · hasSlot=false | 556.5×179, row, gap 8, image 268×179, text column 280.5 | 557×183, row, 8px, image 274.5×183, body 274.5 (equal columns) | pass · gap 8 |
| horizontal · hasSlot=true | slot 280.5×59 in flow, gap 10 | slot 274.5×59, gap 0 | pass · gap 2, gap 8 |

### cardContainer (`188:7377`)

| Case | Figma expectation | Measured (light) | Result |
|---|---|---|---|
| idle · hasSlot=false | 312.5×315.35, bg `bg/base`, padding `core/spacing/2xs` 12 / `core/spacing/xs` 16, gap 8, radius 16 (`core/spacing/xs` in Figma → `border/radius/lg`), overflow clip, no shadow | `<article>` 313×315.33, #ffffff, 12px 16px, 8px, 16px, hidden, none | pass · gap 1 |
| idle · hasSlot=true | + cardSlot 281×59 with gap 8 | slot 281×59, 8px above | pass |
| hover · hasSlot=false | + Elevation/Level 3 | box-shadow = `--elevation-level-3` (0 1 3 0 @.25, 0 4 8 3 @.13) | pass |
| hover · hasSlot=true | as above | same | pass |
| Grid · horizontal × idle / hover | no set row (page sticker grid) | 589×207, same tokens; height driven by gap 8 | pass (extra) · gap 8 |
| real pointer hover (Interactive) | agrees with pinned | Level 3 on `:hover`, identical string | pass |
| keyboard focus inside (Interactive) | not in Figma; lift on `:focus-within` is an addition | Tab to the favourite lifts the card to Level 3 | pass (documented in CSS) |

### Dark theme (`&globals=theme:dark`, `data-theme="dark"` applied)

| Case | Measured | Result |
|---|---|---|
| iconButton · all 8 | outline bg #0a1023 icon #ffffff; active bg #5c1010 icon #c82323; fill/small bg #0d34e9 icon #0a1023; shadows unchanged | pass · gap 7, gap 10 |
| iconButton · focus via Tab | ring #3b82f6, 5.14:1 on the page | pass |
| cardImage · all 4 | bg #232839, overlay unchanged, favourite #5c1010 / #c82323 | FAIL (F1, F2) · gap 10 |
| cardText · all 8 | title #ffffff, secondary #b3b5bb, warning #df900a | pass |
| cardLayout · all 4 | same geometry as light | pass |
| cardContainer · all 4 + Grid | bg #0a1023 = canvas #0a1023; Level 3 shadow is navy-alpha on navy | pass · gap 7, gap 11 |

**Totals:** 62 cases · 57 passed · 5 failed (4 cardImage rows carrying F1+F2, 1 cardText row carrying F3). 22 of the passes deviate from Figma only through a listed design gap.

## Findings

### F1 · cardImage · favourite glyph · all four cases, both themes
```
Expected  the filled "Heart 3" glyph Figma pins on cardImage (instance 170:1390 and siblings:
          a single-path 20×18 shape at inset 12.5% / 8.33% of the 24 frame, fill icon/negative)
Saw       the outlined "Heart 3" from the iconButton set (two paths, 21.5×19.5 at inset 9.38% / 5.21%)
Where     src/components/cardImage/cardImage.js line 34 — iconButton() is called with no iconSwap,
          so src/icons/heart.js (the outline) is used
Evidence  reports/Card/figma-cardImage.png (solid heart) vs reports/Card/cardImage-matrix-light.png (outline)
Fix       add the filled heart from the Horizon Stays Icon Library as src/icons/heartFilled.js and pass it
          as iconSwap when the favourite is pressed. If the filled heart is not in the library, stop and
          report it (CLAUDE.md › Icons) rather than drawing one.
```

### F2 · cardImage · favourite state · all four cases, both themes
```
Expected  the favourite's visual state and its announced state agree. Figma draws the active
          (bg/accent/red + icon/negative) variant, which reads as "saved"
Saw       data-variant="active" with aria-pressed="false" — a sighted user sees "saved", a screen-reader
          user hears "Save to favourites, not pressed". Colour alone is carrying the meaning
Where     src/components/cardImage/cardImage.js lines 33–37 (variant: 'active', pressed: false)
Evidence  reports/Card/cardImage-matrix-light.png; the Interactive story (outline + pressed=false → active +
          pressed=true on click) shows the pairing the component itself should default to
Fix       derive one from the other: pressed=true when variant is 'active', or default the favourite to
          outline/unpressed and let the consumer pass the pressed state. Pair with F1 so pressed also swaps
          the glyph.
```

### F3 · cardText · metadata=true review=false price=false
```
Expected  44px tall — with both rows off there is nothing to show under Listing Info
Saw       52px — an empty .hz-card-text__details block is still rendered and the parent's gap/small (8px)
          is applied below the subtitle
Where     src/components/cardText/cardText.js line 34 (`metadata && h('div', …)`)
Evidence  reports/Card/cardText-matrix-light.png, fourth item (measured 278×52)
Note      Figma draws only the all-true node, so this combination has no Figma render; the expectation
          comes from the boolean semantics, not a measured node
Fix       render the details block only when metadata && (review || price)
```

## Design gaps (report upstream, not against the build)

Numbers 1–8 are the engineer's; 9–13 are new from this run.

1. Radius / padding / gap bound to `core/spacing/*` in Figma. Confirmed: container radius `core/spacing/xs`, padding `core/spacing/2xs` + `core/spacing/xs`, gaps `core/spacing/3xs`, iconButton pad `core/spacing/3xs`. Semantic equivalents used where the value matches.
2. cardLayout text→slot gap is raw 10 in the horizontal row; in the vertical row the slot frame sits at y=104 under a 96px text block, i.e. 8. Left unbound, so the build renders **0** — the slot sits flush against the price line (reports/Card/cardLayout-matrix-light.png). Recommend the designer bind `gap/small` in both rows; then the engineer applies it.
3. cardImage 1:1 drawn 280.5×252.5; 16:9 described but not in the set.
4. `Property 1` → `state`; `varient` → `variant`.
5. No focused variant in Figma. The added ring is `border/brand/default` 2px at 2px offset (3.68:1 on white, 5.14:1 on dark).
6. Touch target is 40×40 (36×36 small); no 44 token. CLAUDE.md › Accessibility is unmet until one exists.
7. Dark: `bg/base` (#0a1023) equals the page canvas (#0a1023), so the idle card has no edge (reports/Card/cardContainer-grid-dark.png). `icon/inverse/default` flips to #0a1023 on `bg/info/idle`: **2.42:1**.
8. Horizontal layout: Figma is image 268 + gap 8 + text 280.5 = 556.5 wide, 179 high; the build's equal columns give 274.5 + 8 + 274.5 at 183 high.
9. **cardImage radius.** The `170:1409` main component has no corner radius; every instance inside cardLayout overrides it to 8. The build applies `border/radius/sm` (8) always. Put the radius on the main component in Figma so the set and its instances agree.
10. **Dark contrast on the favourite.** `icon/negative` (#c82323) on dark `bg/accent/red` (#5c1010) is **2.42:1**; `icon/inverse/default` on `bg/info/idle` is 2.42:1 (see 7). Both below 3:1 for a UI glyph. Light values are 4.83:1 and 7.82:1.
11. **Elevation has no dark mode.** All three elevation styles are `neutral/*A` (navy alpha) shadows; on a navy page the hover lift is invisible, so in dark the card's hover state has no visible affordance. The overlay gradient is the same family and reads as a barely-visible darkening.
12. **`text/warning` on `bg/base` in light is 2.58:1.** The rating "4.7" (Title/Small, 14px) fails 4.5:1 for text. Dark is 7.32:1. Figma binds this token, so it is a token value question.
13. **No motion token.** The three `120ms ease` transitions (cardContainer, cardImage, iconButton) are raw because the token set has no duration or easing tokens.

## Screenshots

All in `reports/Card/`. Figma renders were fetched with `get_screenshot` at the node's natural size.

| File | What |
|---|---|
| figma-iconButton.png · figma-cardImage.png · figma-cardText.png · figma-cardLayout.png · figma-cardContainer.png | the five Figma set renders |
| iconButton-matrix-light.png · iconButton-matrix-dark.png | all 8 iconButton cases |
| cardImage-matrix-light.png · cardImage-matrix-dark.png · cardImage-empty-light.png | 4 cases + the empty extra |
| cardText-matrix-light.png · cardText-matrix-dark.png · cardText-long-title-light.png | 8 combinations + the clamp |
| cardLayout-matrix-light.png · cardLayout-matrix-dark.png | 4 cases |
| cardContainer-matrix-light.png · cardContainer-matrix-dark.png · cardContainer-grid-light.png · cardContainer-grid-dark.png | 4 cases + the sticker grid |
| cardContainer-interactive-idle.png · -pointer-hover.png · -focus.png · -focus-dark.png · -toggled.png | driven states: real pointer hover, Tab focus (light and dark), favourite clicked |

## Verdict

Back to the engineer with F1, F2 and F3. Everything else in the five sets measures to its Figma binding in both themes; the 13 gaps go to design.

```
🔍 QA · Card family · local
Matrix 62 cases · Passed 57 · Failed 5
Visual 1 (cardImage favourite uses the outline heart, Figma pins the filled one)
States 2 (favourite looks active but announces aria-pressed=false; cardText keeps an 8px gap under an empty details block)
Screenshots 24 ✓   Report → reports/Card.md
Verdict → back to the engineer
```
