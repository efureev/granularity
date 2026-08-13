# Changelog

All notable changes to `@feugene/granularity-charts` are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial package: charts drawn with design-system tokens, own SVG, zero runtime dependencies.
- `GrChartLine` — line chart with axes, grid, legend, tooltip, empty and loading states, keyboard
  navigation over points and a screen-reader data table.
- `GrSparkline` — frameless inline chart for table cells and stat tiles.
- Chart arithmetic as pure modules (`@feugene/granularity-charts/chart`): data normalisation, linear/time/band
  scales, nice-number ticks, path geometry, plot-area layout, series discriminators.
- Composables `useChartScale`, `useChartTicks`, `useChartTooltip`.
- Three locales (`en`, `ru`, `es`) under the `grCharts` i18n block.
