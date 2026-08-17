# Changelog

All notable changes to `@feugene/granularity-charts` are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [v0.5.0] 2026-08-18

### Fixed

- **An empty chart still drew its legend, explaining colours that were not on
  screen.** A report with two declared series and no rows for the period showed
  "No payments in this period" with "Net revenue" and "Fee" listed underneath —
  a key to a picture that does not exist. The cause is that emptiness is decided
  by positions (`data.positions.length === 0`) while the legend is drawn from
  series, and a backend that knows its series but has no rows produces exactly
  that combination. The legend was the only visible layer of the frame without
  an `!isEmpty` guard; axes, grid, marks, references, crosshair, surface and
  tooltip all had one. It is now guarded in the frame rather than in each chart,
  which is what makes it hold for `GrChartPie` and `GrChartHeatmap` too: their
  own legends are passed into the very same slot, and a pie of zeros used to
  show the full list of labels with "0 · —" because its legend defaults to on.
  A legend beside a partially empty chart is untouched — while anything is still
  plotted, an empty series must keep its place so its neighbours do not change
  colour on the next filtering.
- **An empty chart reserved the full plotting area.** Seven of the nine charts
  default to 256px, so two empty cards side by side spent 500px of screen on one
  sentence. The frame no longer reserves that space when there is nothing to
  plot; the height comes from `--gr-chart-frame-empty-height` (8rem) and is
  capped by the declared `height`, so a chart explicitly given 80px does not
  grow from being empty. The loading state keeps the full height on purpose —
  its skeleton is a promise of the picture about to arrive, and shrinking it
  would make the page jump at the moment data lands.

## [v0.4.0] 2026-08-17

### Added

- A second value axis on `GrChartLine`, `GrChartArea` and `GrChartBar` — `dualAxis` plus `axis: 'right'` on a
  series. Money and counts do not share one axis: the smaller-magnitude series collapses into a line at zero, and
  the usual workaround is two charts side by side for one question. Without `dualAxis` the `axis` field is
  ignored, deliberately: two axes let any pair of series be fitted into an apparent correlation, so the second
  axis must be the chart author's decision rather than a side effect of a field in the data. Domains are computed
  separately, hiding a series moves only its own axis, and the stack never crosses axes — each side has its own
  totals. Both axes get the same number of ticks (`alignedTicks` takes the count from the left one): two
  independent "nice" ladders produce different line counts and the gridlines start doubling. The grid is drawn
  from the left axis only; the right one contributes labels. Table columns name their axis when both are present,
  and `yTickFormatRight` / `valueFormatRight` give the right axis its own units. No third axis, and no automatic
  "pleasing" ratio between the two — that ratio is exactly what manufactures false correlation.
- `chart/chartTicks.ts` gained `alignedTicks()`; `chart/chartScale.ts` gained `scaleForAxis()`.
- `GrChartFunnel` — conversion steps and the losses between them. Three numbers answer "how many got through"; a
  funnel answers "where we lose them". Both shares are computed against **different denominators** — of the first
  step and of the previous one — and both are available at once in the tooltip, the hidden table and the
  announcement: mixing them into one label is the standard way to flatter a funnel. Step width is proportional to
  the value, not to the ordinal, so a step larger than its predecessor is drawn honestly and named in
  `ariaDescription` rather than silently straightened — it is either a data error or two different cohorts, and
  that is the reader's call. A zero step keeps a minimum width: "nobody got here" is a result, not a missing step.
  `shape: 'bar'` and `'trapezoid'` differ in drawing only — values, shares and the table agree to the digit.
- `chart/chartFunnel.ts` — `funnelStages()` and `funnelPath()`, exported from the `./chart` subpath.
- `GrChartHeatmap` — a matrix where colour encodes the value: cohort retention, activity by hour and weekday,
  error share by service and version. The colour scale is one theme role mixed with `color-mix`, not a palette of
  five hand-picked colours — five would have to be picked again for the dark theme and again for the next heatmap.
  `steps` quantises the share (`0` for a continuous ramp); a diverging scale normalises against the larger
  distance from the midpoint, so it is symmetric by construction rather than by coincidence. `null` is neither
  zero nor the bottom of the scale: the cell is left unpainted, shows a dash in the table, and stays out of the
  domain — for cohorts, "the month has not arrived" and "retention is zero" are different statements. Short rows
  are padded with `null`, not zeros. The keyboard is two-dimensional (`←→` column, `↑↓` row, `Home`/`End` row
  edge, `PageUp`/`PageDown` column edge) and wraps on neither axis: jumping from the end of one row to the start
  of the next leaves the reader unable to tell which row they are in. The hidden table carries real row and
  column headers — a heatmap without it is unreadable outright, not merely less convenient.
- `chart/chartHeatmap.ts` — `heatmapMatrix`, `heatmapScale`, `heatmapColor`, `heatmapOnDark` and `heatmapCells`,
  exported from the `./chart` subpath.
- `ChartFrame` gained `keyboard`, `activeSeriesIndex` (with `update:activeSeriesIndex`) and `hitSeries`, so a chart
  with a second axis of navigation can drive it. Defaults reproduce the cartesian behaviour exactly.
- `GrChartBullet` — Stephen Few's bullet chart: a value, a target and qualitative ranges on one line. It answers
  "how good is this and how far to the next boundary", which a number next to a `warning` badge cannot. Three
  distinct visual weights so they do not compete: ranges are the background, the value is a narrow bar on top, the
  target is a tick across. No gauge is offered — it spends a lot of space on little data and reads poorly
  quantitatively. `value: null` is not zero: the value bar disappears, the target tick stays, the table shows a
  dash, and the `meter` role goes with it (the role requires `aria-valuenow`, and keeping it would be a serious
  axe violation). A value past the top of the scale is not truncated silently: the bar stops at the edge, gains an
  overflow marker, and the real figure still reaches the tooltip, the table and the announcement. A range boundary
  outside the scale is clamped rather than dropped, so `rangeColors` never shift onto neighbouring bands.
- `chart/chartBullet.ts` — `bulletLayout()`, exported from the `./chart` subpath.
- `ChartFrame` gained `surfaceRole` and `surfaceAttrs`, so a chart whose overlay is not an application can say so.
- `GrChartWaterfall` — a bridge from the opening balance to the closing one: every bar starts where the previous
  one ended. Diverging bars answer "how much came in and how much left"; the bridge answers "how one turned into
  the other", and shows whether the movements add up to the stated total. A `kind: 'total'` step declares the
  running total instead of adding to it, so real opening and closing figures can sit in the same chart and a
  mismatch becomes visible; no connector is drawn into such a step. Colour follows the sign, not a series index.
  A zero step is drawn as a rule at the running-total level rather than vanishing — "no movement" is a fact. The
  hidden table carries three numbers per step (change, running total before, running total after): a bridge cannot
  be reconstructed from the deltas alone. Steps are addressed by index rather than by label, so two steps sharing
  a name do not collapse into one position. `orientation: 'horizontal'` draws its own axes, since the frame's
  value axis is vertical by construction.
- `chart/chartWaterfall.ts` — `waterfallSegments()`, exported from the `./chart` subpath.
- `barPath()` gained a `toward: 'up' | 'down' | 'left' | 'right'` direction in place of the `up` boolean, so a
  horizontal bar can round its far end too. `<rect rx>` is still not an option: it rounds all four corners and the
  bar comes loose from its baseline.
- Reference lines and bands on `GrChartLine`, `GrChartArea` and `GrChartBar` — the `references` prop takes
  thresholds, plans and tolerance corridors. A single value draws a line, a pair draws a band; the pair order does
  not matter. A reference is never a series: it takes no palette index, stays out of the legend, out of the stack
  and out of the point tooltip, and reaches the hidden table as a `<tfoot>` note rather than a data row — a data
  row would assert an x position the threshold does not have. The axis domain is not stretched by default
  (`includeReferencesInDomain` opts in): a `1.0` threshold against data around `0.03` would collapse the data into
  a line at zero. A reference outside the domain is not drawn but stays in the chart description — "the threshold
  is not visible" and "there is no threshold" are different statements.
- `GrChartArea` gained `stacked: '100%'`, matching `GrChartBar`. Each position is normalised to one, the value
  axis switches to shares, and the fill goes solid as it already does for a plain stack — ribbons sit flush, and a
  gradient inside each would blur the boundary between them. Only the drawing is normalised: the tooltip, the
  hidden table and the live region keep reporting absolute values. A position summing to zero yields zero, not
  `NaN`. Share of a whole over time is what an area chart is for, and until now it could only be drawn with bars.
- `chart/chartReference.ts` — `normalizeReferences`, `referenceDomainValues`, `referenceMarks` and
  `referenceValueToNumber`, exported from the `./chart` subpath. Reference values accept `Date`, an ISO string and
  a category name; the ISO string lands on the same pixel as the equivalent `Date`.
- `NormalizeOptions.includeXValues` / `includeYValues` — values the domain must cover besides the data. Folded in
  before `padDomain`, so `includeZero` and padding apply to the union.
- `ChartTableModel.notes` — explanations rendered in `<tfoot>`, spanning the full width.
- `chart/chartLayout.ts` gained `labelGutters()` — room for a component's own labels, for charts that run with
  `axes: false` and label their marks themselves.
- Per-component documentation under `docs/components/` — one page per chart, plus a
  `docs/components.md` index. Until now the only per-component description lived in the
  showcase app (`companionPackages.ts`), so it never reached the published tarball.
- `defineComponentDocsGate` from `@feugene/granularity-test-kit` wired in: a component
  without a page can no longer ship.

## [v0.3.0] 2026-08-14

### Added

- `GrChartRadar` — radar chart: a profile across several axes and the comparison of profiles. Two axis scales —
  `shared` (one scale for every spoke, so the shape and the area are both comparable) and `per-axis` (each spoke
  normalised by its own maximum, the only way to put unrelated metrics on one web). Under `per-axis` the ring labels
  give way to the axis maxima, which move into the axis names, the announcement gains "of {max}", and the hidden
  table gains an axis-maximum column — without it the shape cannot be reconstructed from the table.
- `GrChartLine` gained `gaps: 'hidden' | 'shadow' | 'dashed'` — what to draw across a break in the series. The bridge
  is always straight, even when the line is smoothed, and never reaches the tooltip or the data table: those keep
  reporting "no value".

### Changed

- `dataTable: 'visible'` no longer repeats the full date on every row of a time series. The date now appears on the
  first row and returns whenever the day (or year, for daily and monthly ladders) changes — dropping it everywhere
  would make midnight indistinguishable from the previous day. The hidden, screen-reader table keeps the full date
  per row: it is read out of context.

### Fixed

- Switching locale no longer shifts the plot area. `Intl` uses a non-breaking space (`U+00A0` in `ru`/`fi`) or a
  narrow one (`U+202F` in `fr`) as the thousands separator, and the label-width estimator scored those as
  medium-width characters — so `1 000` reserved more axis gutter than `1,000`, and the drawing moved with it. Any
  whitespace now counts as narrow.
- **The hidden data table no longer inflates the scroll height of whatever wraps the chart.**
  `sr-only` sat on the `<table>` itself, and table boxes treat `width`/`height` as a minimum rather
  than a size — so `height: 1px` was ignored, `clip` hid the table visually while its full geometry
  stayed, and any container with a bounded height grew a scrollbar with nothing to scroll. The class
  moved to a wrapping `<div>`, which collapses as intended; the table stays in the accessibility
  tree exactly as before.

## [v0.2.0] 2026-08-13

First published release. `0.1.0` was cut in the working tree but never tagged or published, so everything the
package contains ships here.

### Added

- Initial package: charts drawn with design-system tokens, own SVG, zero runtime dependencies.
- `GrChartLine` — line chart with axes, grid, legend, tooltip, empty and loading states, keyboard
  navigation over points and a screen-reader data table.
- `GrChartBar` — bar chart: series side by side, stacked, or normalised to 100%. The value axis always starts at
  zero, only the far end of a bar is rounded (and in a stack only its topmost segment), and hovering a category
  keeps it saturated while the other bars fade — switched off with `dimInactive`.
- `GrChartArea` — area chart: fill down to the zero baseline (not the canvas bottom), per-series gradients
  anchored to the shape they fill, and `stacked` mode where each band sits on the sum of the ones below while
  the tooltip and data table keep reporting the series' own value.
- `GrChartPie` — pie and donut chart: angular hit testing, callout labels outside the ring, texture
  discriminators past the five-colour palette, legend as a key with values and shares, and a
  screen-reader table of shares.
- `GrSparkline` — frameless inline chart for table cells and stat tiles.
- Chart arithmetic as pure modules (`@feugene/granularity-charts/chart`): data normalisation, linear/time/band
  scales, nice-number ticks, path geometry, arc geometry, band geometry for stacks, bar layout and rounded bar
  paths, mark placement, plot-area layout, series discriminators.
- Composables `useChartScale`, `useChartTicks`, `useChartTooltip`.
- Three locales (`en`, `ru`, `es`) under the `grCharts` i18n block.

### Fixed

- Bar chart hover no longer paints a slab behind the column: the active category now stays at full saturation while
  the other bars fade, so the grid and the drawing underneath stay visible.
- Bar chart no longer opens a tooltip over empty canvas. Hit testing is bounded by the category column and by the
  plot area, instead of snapping to the nearest category from anywhere.
- Stacked charts anchor the tooltip at the top of the column instead of at the largest single value, which used to
  put the panel inside the stack and cover what it was describing.
- Tooltip no longer flickers when the pointer reaches the panel: `pointer-events: none` now sits on the panel's
  wrapper, not only on the panel itself. The wrapper is `fixed`-positioned over the plot area, so hitting it made the
  surface fire `pointerleave`, which closed the tooltip and immediately reopened it.
