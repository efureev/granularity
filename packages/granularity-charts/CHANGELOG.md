# Changelog

All notable changes to `@feugene/granularity-charts` are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres
to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [v0.10.0] 2026-08-27

### Changed

- **Peer floors on `@feugene/*` raised to the current minor.** Every peer this package
  declares on the ecosystem now starts at the version the monorepo actually ships:

  - `@feugene/fint-i18n` → `>=0.7.0 <1.0.0`
  - `@feugene/granularity` → `>=0.36.0 <1.0.0`
  - `@feugene/unocss-preset-granular` → `>=0.13.0 <1.0.0`
  - `@feugene/unplugin-granularity` → `>=0.7.0 <1.0.0`

  The floors had drifted far behind — some still admitted releases from a year of
  development ago — and a range that claims support it was never tested against is
  worse than a narrow one: the install succeeds and the breakage surfaces later, in
  the consumer's app.

  **This is breaking for anyone below a floor.** Installing against an older
  `@feugene/granularity` now produces a peer conflict instead of silence. The fix is
  to move the core up; nothing in this package's own API changed.

## [v0.9.0] 2026-08-20

### Changed

- **`canvasThreshold` now counts drawn vertices, not total points, and defaults to `24_000`
  instead of `2000`.** If you set this prop, re-read it: the old number now means "canvas almost
  always".

  The old axis was simply the wrong one. Decimation caps **each series** at the resolution of the
  screen — about two vertices per pixel — so one series of 100 000 points draws as 2400 vertices and
  costs a millisecond, while twenty series of 2400 (the same 48 000 points) cost sixteen. Total
  points say nothing about the price; `series × drawn vertices` does.

  Until now the prop gated markers rather than any canvas — there was no canvas in the package. That
  cap still exists, at the same number, as an internal constant: marker behaviour is unchanged.

### Added

- **A canvas renderer above the threshold**, for `GrChartLine` and `GrChartArea`. Measured at 1200px
  wide with 2400 vertices per series: SVG grows linearly at ~0.8 ms per series and stops fitting a
  frame at twenty (16.3 ms); canvas stays near flat (1.7 ms). Below a few series the difference is
  noise, which is why the threshold is high rather than aggressive.

  **Accessibility is untouched by the switch.** The cursor, keyboard, tooltip and hidden table work
  off one transparent overlay and the full series — never off the marks — so they carry over
  unchanged. The canvas is `aria-hidden` and does not take pointer events. The accessibility suite
  runs against both renderers.

  `canvasThreshold: 0` disables canvas entirely, for when the drawing has to stay vector: printing,
  SVG export, custom CSS over the marks.

  Two consequences worth knowing: the grid moves into the canvas (it has to stay under the series,
  and the canvas sits under the `<svg>` so that axes and the active point stay on top), and a
  gradient area fill becomes a solid one — `url(#…)` means nothing to a canvas, and twenty
  gradient-filled areas read as mush anyway.

- `curveCommands` and `commandsToPath` in the geometry module. Curve maths is now computed once into
  numeric draw commands, and the `d` string and the canvas each read from it. The two renderers have
  nowhere to diverge — the equivalence is pinned by a test.

## [v0.8.1] 2026-08-20

### Fixed

- **Two dev warnings no longer reach production.** Repeated categories in a series and a series carrying
  both `data` and `x`/`y` are reported through `console.warn`, and neither call was behind a condition —
  the message shipped in consumers' builds. The package now expands `__GR_DEV__` on build like the core
  does, and the paired `gr-check-dist-dev-guard` runs on `yarn build` so a substitution that stops
  working fails the build instead of reaching a consumer as `__GR_DEV__ is not defined`.

## [v0.8.0] 2026-08-20

### Added

- **The x-axis window is operable from the keyboard**, closing the gap `0.7.0` shipped with. `+`/`-`
  zoom, `Shift`+arrows pan by a quarter of the window, `0` restores the full series. Zooming anchors
  on the **active point** rather than the window centre — anchored on the centre, the ends of a
  series would stay out of reach however long you held the key. The keys are not a mode: the `zoom`
  union (`'brush' | 'wheel' | 'both'`) names **pointer gestures**, and the keyboard is on whenever
  zoom is on. Making it switchable would offer a way to build a zoom that cannot be reached from a
  keyboard — WCAG 2.1 SC 2.1.1 — by simply not writing a line. `Shift`+arrow belongs to the window
  even at full range, where it does nothing: one chord must mean one thing rather than pan or move
  the cursor depending on state. `Ctrl`, `Alt` and `Cmd` combinations are left to the browser. The
  hint naming these keys goes into the surface's **description**, not its name: consumers override
  the name with `ariaLabel` almost every time, and a hint living there would vanish with it.

### Changed

- **The hidden data table has a row cap: `dataTableMaxRows`, `'auto'` by default.** One row per point
  is readable while there are few rows; nobody reads ten thousand of them in sequence, and rebuilding
  that many costs on the order of a hundred milliseconds per zoom step. Above the cap the table
  prints **the points the chart draws** — same LTTB, same budget — and says so in a `tfoot` note.
  `'auto'` means "as many rows as anyone can read", not "whatever is drawn": it takes the drawing's
  budget when there is one — then the table matches the drawing exactly, down to the LTTB-selected
  points — and falls back to a flat 500-row ceiling with even sampling when there is none, which is
  the case for category scales and for `decimate: 'never'`. Anything else would let the whole point
  be lost behind one toggle. The prop exists on all nine types that have a table; where the type
  builds its own table model (pie, radar, funnel, bullet, waterfall, heatmap) the same ceiling
  applies as a row sample, so no chart type is left without a way to bound it.

  This reverses the earlier rule that the table always prints every row. That rule assumed trimming
  would hand a blind reader different data than a sighted one sees; on a long series the assumption
  is false — a sighted reader does not read ten thousand values either, they read the shape and hover
  for specifics. A table trimmed to what is drawn gives exactly that shape, and the per-point truth
  stays with the keyboard, which still walks the **full** series and announces every point. The
  contract did not weaken, it got sharper: **the table matches the drawing, the keyboard matches the
  data.** What to enable is the application's call — a number sets its own cap, `Infinity` removes it,
  `dataTable: 'off'` drops the table entirely. Measured on 10 000 points, a window change went from
  119 ms with the full table to 14 ms under `'auto'`, against 8 ms with no table at all.
- **A decimated series now carries its own `byX` index.** `decimateSeries` spread the original series,
  so the index described the full row set while `points` held the trimmed one — harmless today,
  because nothing read `byX` off a decimated series, and a trap the moment something did. The table
  above the cap is that something.
- **The hidden data table now follows the settled window rather than every step of it.** It holds one
  row per point, so rebuilding ten thousand of them costs on the order of a hundred milliseconds,
  while the wheel and key auto-repeat change the window dozens of times a second — a synchronous
  table turned the gesture into a queue of repaints the chart never caught up with. Measured on a
  10 000-point series, a window change went from 132 ms to 44 ms, and a continuous gesture now pays
  for one rebuild instead of one per step. The delay is 80 ms and applies to **window changes only**:
  new series, a hidden series or a different domain reach the table immediately. The contract is
  unchanged — at rest the table matches the drawing exactly; they differ only mid-gesture, when
  nobody is reading it, and the window change itself is announced through the live region
  synchronously.

## [v0.7.0] 2026-08-19

### Added

- **Zoom into a stretch of the x axis.** `GrChartLine` and `GrChartArea` gained `zoom`
  (`false | 'brush' | 'wheel' | 'both'`, default `false`) and `v-model:xWindow`. The window
  **selects data** rather than cropping the drawing: it is applied inside normalisation, right
  after sorting and before stacking, so positions, cursor, keyboard, hidden data table and the
  value-axis extent all follow it. That is deliberately the opposite of decimation, and the rule
  behind both is the same — the accessible representation must match what is on screen, and what is
  on screen is the user's choice. Decimation is invisible to the user, so hiding rows from a screen
  reader would be a lie; the window is visible, so the table follows it. One consequence is worth
  knowing: zooming resolves fine structure that reads as solid hatching at full range, because the
  decimation budget is measured against plot width and a narrow window holds fewer points, so each
  gets more vertices. The axis domain becomes
  the window itself rather than the extent of the surviving points, so a brushed stretch does not
  snap to the nearest data; `includeXValues` no longer widens it, since a reference past the edge
  would undo the zoom; `activeIndex` addresses the current window. A drag shorter than 4px is a
  click, not a brush, so picking a point still works; `Escape` cancels a drag in progress; the
  tooltip goes quiet while brushing; touch is left alone, because a drag across the canvas is how a
  page is scrolled. Category scales have no window, for the same reason they are never decimated.
- **`chart/chartZoom`** — the window arithmetic as a pure module: `windowFromPixels`, `zoomWindow`,
  `clampWindow` and `smallestGap`. A consumer restoring a zoom level from the URL needs no chart to
  compute it. `ChartData` also reports `fullXDomain`, the unwindowed extent — measure a gesture
  against the current window and there would be no way out of a zoom.
- **`alignedTicks` and `scaleForAxis` are re-exported** from `@feugene/granularity-charts/chart`.
  Both were announced in v0.4.0 but never left the barrel.

### Changed

- **The pointer hot path is indexed, not scanned.** Every normalised series now carries
  `byX: ReadonlyMap<number, NormalizedPoint>`, built in the same pass that reads the points. The
  tooltip's active point, `activeSymbolMarks`, the hidden table and the bar chart's tooltip anchor
  used to walk the whole series — up to `S + 2` full passes per change of active point, measured
  against complete series rather than decimated ones. `barHitIndex`, the only one that ran on
  **every** `pointermove` for bars and waterfalls, is now a binary search; a per-pixel sweep test
  pins it to the old traversal, ragged position sets included. `GrChartHeatmap` builds one cell
  instead of the whole matrix for its anchor and active outline.

### Fixed

- **The `canvasThreshold` doc block was attached to the wrong prop** on both `GrChartLine` and
  `GrChartArea`, and described the wrong mode: with default settings the threshold only gates
  `showPoints: 'always'`, because `'auto'` stops drawing markers earlier, at sixty points. The
  same inaccuracy is corrected in the showcase, whose API tables were also missing `decimate` and
  `maxPoints` entirely. The binary-search note in `chartScale` sat on `scaleForAxis` while
  describing `nearestIndex`.

## [v0.6.0] 2026-08-19

### Added

- **`GrChartBar` lays bars sideways.** `orientation="horizontal"` turns categories into rows, so a
  long department or product name reads as a line of text instead of a slanted, clipped tail — the
  scenario the docs used to redirect away from. Stacking, grouping, `'100%'`, references, legend,
  tooltip and the hidden data table behave exactly as they do vertically. Axes keep their data
  names in both layouts: `yDomain`, `yTickFormat` and `yTickCount` always address the value axis,
  so `showGrid: 'y'` draws vertical lines when the chart is horizontal. `dualAxis` is not supported
  sideways — the second value axis would have to sit on top, where the layout reserves no room; the
  prop is ignored and dev builds warn. Keyboard follows the eye: `ArrowDown`/`ArrowUp` walk the
  categories, `ArrowLeft`/`ArrowRight` switch the series being read.
- **Long series are decimated for drawing (LTTB).** `GrChartLine` and `GrChartArea` gained
  `decimate` (`'auto' | 'always' | 'never'`, default `'auto'`) and `maxPoints`; `GrSparkline` sizes
  its budget from its fixed canvas and needs no prop at all. Decimation shortens the `d` string and
  nothing else: the cursor, the keyboard, the tooltip and the hidden data table keep the full
  series, so `End` still lands on the ten-thousandth point and the table still prints every row.
  The budget is two vertices per pixel of plot width (at least 64), quantised to 32px so the path
  does not shimmer while a pane is resized; category scales are never decimated, gaps keep exactly
  one separator each, and a stack shares one set of abscissas across its group.

### Fixed

- **Axis labels no longer run off the canvas.** SVG has no `text-overflow`, so a category label
  wider than its gutter used to be cut by the canvas edge with no ellipsis — the reader saw the
  tail of a word with no sign that the start was missing. Labels are now trimmed to the reserved
  width with an ellipsis and carry the full text in `<title>`. The horizontal bar chart also
  reserves room for the outermost value tick, which is centred on its gridline and used to hang
  half its width past the edge.
- **`GrChartWaterfall` keyboard follows its horizontal layout.** Sideways, the steps run top to
  bottom, but the arrows still walked them left to right.

### Removed

- **`renderer` prop on `GrChartLine`.** It was never read by anything, and the documentation
  promised a canvas path behind it that does not exist in this package. Long series are handled by
  `decimate` instead.

## [v0.5.2] 2026-08-19

### Changed

- **Control-scale font sizes now ship a paired line height.** Every place that sets a control
  font size now sets the matching `leading-*` next to it, from the core's new
  `--gr-control-leading-*` steps. Before this the line height was inherited from the host
  application's `body`, and inherited as an absolute value — so how airy a caption looked was
  decided by someone else's CSS reset. Requires core `>=0.27.0`.

## [v0.5.1] 2026-08-18

### Changed

- Release-only bump: the workspace playground apps still pinned the core at
  `^0.20.0`, so yarn resolved a published copy for them instead of linking the
  workspace, and their uno config scanned that copy's `dist`. The pins are
  updated to the current range; nothing in this package's runtime changed.

## [v0.5.0] 2026-08-18

### Fixed

- **An empty chart still drew its legend, explaining colours that were not on screen.** A report with two declared
  series and no rows for the period showed
  "No payments in this period" with "Net revenue" and "Fee" listed underneath — a key to a picture that does not exist.
  The cause is that emptiness is decided by positions (`data.positions.length === 0`) while the legend is drawn from
  series, and a backend that knows its series but has no rows produces exactly that combination. The legend was the only
  visible layer of the frame without an `!isEmpty` guard; axes, grid, marks, references, crosshair, surface and tooltip
  all had one. It is now guarded in the frame rather than in each chart, which is what makes it hold for `GrChartPie`
  and `GrChartHeatmap` too: their own legends are passed into the very same slot, and a pie of zeros used to show the
  full list of labels with "0 · —" because its legend defaults to on. A legend beside a partially empty chart is
  untouched — while anything is still plotted, an empty series must keep its place so its neighbours do not change
  colour on the next filtering.
- **An empty chart reserved the full plotting area.** Seven of the nine charts default to 256px, so two empty cards side
  by side spent 500px of screen on one sentence. The frame no longer reserves that space when there is nothing to plot;
  the height comes from `--gr-chart-frame-empty-height` (8rem) and is capped by the declared `height`, so a chart
  explicitly given 80px does not grow from being empty. The loading state keeps the full height on purpose — its
  skeleton is a promise of the picture about to arrive, and shrinking it would make the page jump at the moment data
  lands.

## [v0.4.0] 2026-08-17

### Added

- A second value axis on `GrChartLine`, `GrChartArea` and `GrChartBar` — `dualAxis` plus `axis: 'right'` on a series.
  Money and counts do not share one axis: the smaller-magnitude series collapses into a line at zero, and the usual
  workaround is two charts side by side for one question. Without `dualAxis` the `axis` field is ignored, deliberately:
  two axes let any pair of series be fitted into an apparent correlation, so the second axis must be the chart author's
  decision rather than a side effect of a field in the data. Domains are computed separately, hiding a series moves only
  its own axis, and the stack never crosses axes — each side has its own totals. Both axes get the same number of ticks
  (`alignedTicks` takes the count from the left one): two independent "nice" ladders produce different line counts and
  the gridlines start doubling. The grid is drawn from the left axis only; the right one contributes labels. Table
  columns name their axis when both are present, and `yTickFormatRight` / `valueFormatRight` give the right axis its own
  units. No third axis, and no automatic
  "pleasing" ratio between the two — that ratio is exactly what manufactures false correlation.
- `chart/chartTicks.ts` gained `alignedTicks()`; `chart/chartScale.ts` gained `scaleForAxis()`.
- `GrChartFunnel` — conversion steps and the losses between them. Three numbers answer "how many got through"; a funnel
  answers "where we lose them". Both shares are computed against **different denominators** — of the first step and of
  the previous one — and both are available at once in the tooltip, the hidden table and the announcement: mixing them
  into one label is the standard way to flatter a funnel. Step width is proportional to the value, not to the ordinal,
  so a step larger than its predecessor is drawn honestly and named in
  `ariaDescription` rather than silently straightened — it is either a data error or two different cohorts, and that is
  the reader's call. A zero step keeps a minimum width: "nobody got here" is a result, not a missing step.
  `shape: 'bar'` and `'trapezoid'` differ in drawing only — values, shares and the table agree to the digit.
- `chart/chartFunnel.ts` — `funnelStages()` and `funnelPath()`, exported from the `./chart` subpath.
- `GrChartHeatmap` — a matrix where colour encodes the value: cohort retention, activity by hour and weekday, error
  share by service and version. The colour scale is one theme role mixed with `color-mix`, not a palette of five
  hand-picked colours — five would have to be picked again for the dark theme and again for the next heatmap.
  `steps` quantises the share (`0` for a continuous ramp); a diverging scale normalises against the larger distance from
  the midpoint, so it is symmetric by construction rather than by coincidence. `null` is neither zero nor the bottom of
  the scale: the cell is left unpainted, shows a dash in the table, and stays out of the domain — for cohorts, "the
  month has not arrived" and "retention is zero" are different statements. Short rows are padded with `null`, not zeros.
  The keyboard is two-dimensional (`←→` column, `↑↓` row, `Home`/`End` row edge, `PageUp`/`PageDown` column edge) and
  wraps on neither axis: jumping from the end of one row to the start of the next leaves the reader unable to tell which
  row they are in. The hidden table carries real row and column headers — a heatmap without it is unreadable outright,
  not merely less convenient.
- `chart/chartHeatmap.ts` — `heatmapMatrix`, `heatmapScale`, `heatmapColor`, `heatmapOnDark` and `heatmapCells`,
  exported from the `./chart` subpath.
- `ChartFrame` gained `keyboard`, `activeSeriesIndex` (with `update:activeSeriesIndex`) and `hitSeries`, so a chart with
  a second axis of navigation can drive it. Defaults reproduce the cartesian behaviour exactly.
- `GrChartBullet` — Stephen Few's bullet chart: a value, a target and qualitative ranges on one line. It answers
  "how good is this and how far to the next boundary", which a number next to a `warning` badge cannot. Three distinct
  visual weights so they do not compete: ranges are the background, the value is a narrow bar on top, the target is a
  tick across. No gauge is offered — it spends a lot of space on little data and reads poorly quantitatively.
  `value: null` is not zero: the value bar disappears, the target tick stays, the table shows a dash, and the `meter`
  role goes with it (the role requires `aria-valuenow`, and keeping it would be a serious axe violation). A value past
  the top of the scale is not truncated silently: the bar stops at the edge, gains an overflow marker, and the real
  figure still reaches the tooltip, the table and the announcement. A range boundary outside the scale is clamped rather
  than dropped, so `rangeColors` never shift onto neighbouring bands.
- `chart/chartBullet.ts` — `bulletLayout()`, exported from the `./chart` subpath.
- `ChartFrame` gained `surfaceRole` and `surfaceAttrs`, so a chart whose overlay is not an application can say so.
- `GrChartWaterfall` — a bridge from the opening balance to the closing one: every bar starts where the previous one
  ended. Diverging bars answer "how much came in and how much left"; the bridge answers "how one turned into the other",
  and shows whether the movements add up to the stated total. A `kind: 'total'` step declares the running total instead
  of adding to it, so real opening and closing figures can sit in the same chart and a mismatch becomes visible; no
  connector is drawn into such a step. Colour follows the sign, not a series index. A zero step is drawn as a rule at
  the running-total level rather than vanishing — "no movement" is a fact. The hidden table carries three numbers per
  step (change, running total before, running total after): a bridge cannot be reconstructed from the deltas alone.
  Steps are addressed by index rather than by label, so two steps sharing a name do not collapse into one position.
  `orientation: 'horizontal'` draws its own axes, since the frame's value axis is vertical by construction.
- `chart/chartWaterfall.ts` — `waterfallSegments()`, exported from the `./chart` subpath.
- `barPath()` gained a `toward: 'up' | 'down' | 'left' | 'right'` direction in place of the `up` boolean, so a
  horizontal bar can round its far end too. `<rect rx>` is still not an option: it rounds all four corners and the bar
  comes loose from its baseline.
- Reference lines and bands on `GrChartLine`, `GrChartArea` and `GrChartBar` — the `references` prop takes thresholds,
  plans and tolerance corridors. A single value draws a line, a pair draws a band; the pair order does not matter. A
  reference is never a series: it takes no palette index, stays out of the legend, out of the stack and out of the point
  tooltip, and reaches the hidden table as a `<tfoot>` note rather than a data row — a data row would assert an x
  position the threshold does not have. The axis domain is not stretched by default (`includeReferencesInDomain` opts
  in): a `1.0` threshold against data around `0.03` would collapse the data into a line at zero. A reference outside the
  domain is not drawn but stays in the chart description — "the threshold is not visible" and "there is no threshold"
  are different statements.
- `GrChartArea` gained `stacked: '100%'`, matching `GrChartBar`. Each position is normalised to one, the value axis
  switches to shares, and the fill goes solid as it already does for a plain stack — ribbons sit flush, and a gradient
  inside each would blur the boundary between them. Only the drawing is normalised: the tooltip, the hidden table and
  the live region keep reporting absolute values. A position summing to zero yields zero, not
  `NaN`. Share of a whole over time is what an area chart is for, and until now it could only be drawn with bars.
- `chart/chartReference.ts` — `normalizeReferences`, `referenceDomainValues`, `referenceMarks` and
  `referenceValueToNumber`, exported from the `./chart` subpath. Reference values accept `Date`, an ISO string and a
  category name; the ISO string lands on the same pixel as the equivalent `Date`.
- `NormalizeOptions.includeXValues` / `includeYValues` — values the domain must cover besides the data. Folded in before
  `padDomain`, so `includeZero` and padding apply to the union.
- `ChartTableModel.notes` — explanations rendered in `<tfoot>`, spanning the full width.
- `chart/chartLayout.ts` gained `labelGutters()` — room for a component's own labels, for charts that run with
  `axes: false` and label their marks themselves.
- Per-component documentation under `docs/components/` — one page per chart, plus a
  `docs/components.md` index. Until now the only per-component description lived in the showcase app
  (`companionPackages.ts`), so it never reached the published tarball.
- `defineComponentDocsGate` from `@feugene/granularity-test-kit` wired in: a component without a page can no longer
  ship.

## [v0.3.0] 2026-08-14

### Added

- `GrChartRadar` — radar chart: a profile across several axes and the comparison of profiles. Two axis scales —
  `shared` (one scale for every spoke, so the shape and the area are both comparable) and `per-axis` (each spoke
  normalised by its own maximum, the only way to put unrelated metrics on one web). Under `per-axis` the ring labels
  give way to the axis maxima, which move into the axis names, the announcement gains "of {max}", and the hidden table
  gains an axis-maximum column — without it the shape cannot be reconstructed from the table.
- `GrChartLine` gained `gaps: 'hidden' | 'shadow' | 'dashed'` — what to draw across a break in the series. The bridge is
  always straight, even when the line is smoothed, and never reaches the tooltip or the data table: those keep reporting
  "no value".

### Changed

- `dataTable: 'visible'` no longer repeats the full date on every row of a time series. The date now appears on the
  first row and returns whenever the day (or year, for daily and monthly ladders) changes — dropping it everywhere would
  make midnight indistinguishable from the previous day. The hidden, screen-reader table keeps the full date per row: it
  is read out of context.

### Fixed

- Switching locale no longer shifts the plot area. `Intl` uses a non-breaking space (`U+00A0` in `ru`/`fi`) or a narrow
  one (`U+202F` in `fr`) as the thousands separator, and the label-width estimator scored those as medium-width
  characters — so `1 000` reserved more axis gutter than `1,000`, and the drawing moved with it. Any whitespace now
  counts as narrow.
- **The hidden data table no longer inflates the scroll height of whatever wraps the chart.**
  `sr-only` sat on the `<table>` itself, and table boxes treat `width`/`height` as a minimum rather than a size — so
  `height: 1px` was ignored, `clip` hid the table visually while its full geometry stayed, and any container with a
  bounded height grew a scrollbar with nothing to scroll. The class moved to a wrapping `<div>`, which collapses as
  intended; the table stays in the accessibility tree exactly as before.

## [v0.2.0] 2026-08-13

First published release. `0.1.0` was cut in the working tree but never tagged or published, so everything the package
contains ships here.

### Added

- Initial package: charts drawn with design-system tokens, own SVG, zero runtime dependencies.
- `GrChartLine` — line chart with axes, grid, legend, tooltip, empty and loading states, keyboard navigation over points
  and a screen-reader data table.
- `GrChartBar` — bar chart: series side by side, stacked, or normalised to 100%. The value axis always starts at zero,
  only the far end of a bar is rounded (and in a stack only its topmost segment), and hovering a category keeps it
  saturated while the other bars fade — switched off with `dimInactive`.
- `GrChartArea` — area chart: fill down to the zero baseline (not the canvas bottom), per-series gradients anchored to
  the shape they fill, and `stacked` mode where each band sits on the sum of the ones below while the tooltip and data
  table keep reporting the series' own value.
- `GrChartPie` — pie and donut chart: angular hit testing, callout labels outside the ring, texture discriminators past
  the five-colour palette, legend as a key with values and shares, and a screen-reader table of shares.
- `GrSparkline` — frameless inline chart for table cells and stat tiles.
- Chart arithmetic as pure modules (`@feugene/granularity-charts/chart`): data normalisation, linear/time/band scales,
  nice-number ticks, path geometry, arc geometry, band geometry for stacks, bar layout and rounded bar paths, mark
  placement, plot-area layout, series discriminators.
- Composables `useChartScale`, `useChartTicks`, `useChartTooltip`.
- Three locales (`en`, `ru`, `es`) under the `grCharts` i18n block.

### Fixed

- Bar chart hover no longer paints a slab behind the column: the active category now stays at full saturation while the
  other bars fade, so the grid and the drawing underneath stay visible.
- Bar chart no longer opens a tooltip over empty canvas. Hit testing is bounded by the category column and by the plot
  area, instead of snapping to the nearest category from anywhere.
- Stacked charts anchor the tooltip at the top of the column instead of at the largest single value, which used to put
  the panel inside the stack and cover what it was describing.
- Tooltip no longer flickers when the pointer reaches the panel: `pointer-events: none` now sits on the panel's wrapper,
  not only on the panel itself. The wrapper is `fixed`-positioned over the plot area, so hitting it made the surface
  fire `pointerleave`, which closed the tooltip and immediately reopened it.
