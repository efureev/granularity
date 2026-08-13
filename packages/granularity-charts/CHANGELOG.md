# Changelog

All notable changes to `@feugene/granularity-charts` are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
